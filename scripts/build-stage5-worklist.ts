/** Rebuild the Stage 5 worklist from live graph provenance. No graph edits. */
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { NODES, LIFE_EVENTS } from '../src/graph-data.js';
import { buildJourney } from '../src/graph-engine.js';
import { getFieldValue } from '../src/provenance.js';
import { provenanceFor, type FieldEvidence } from '../src/provenance-view.js';
import { AUTH_WORDS, methodsText } from './lib/judge-prose.js';

const OUT = 'data/stage5';
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'));
const old = new Map<string, any>(read('data/worklist-partly.json').items.map((x: any) => [`${x.id}#${x.path}`, x]));
const proseQueue = read('data/review-queue-prose.json').review as any[];
const criteriaQueue = read('data/review-queue-criteria.json').review as any[];
const queued = new Map<string, any>([
  ...proseQueue.map(x => [`${x.id}#${x.field}`, x] as const),
  ...criteriaQueue.map(x => [`${x.id}#eligibility.criteria.${x.criterion}`, x] as const),
]);
const PHASE4 = ['disability', 'carer', 'terminal-illness', 'retirement', 'bereavement', 'immigration',
  'business', 'buying-home', 'new-job', 'marriage', 'university', 'school', 'driving'];
const REVIEWED = ['baby', 'job-loss', 'divorce', 'moving'];
const eventsOf = new Map<string, string[]>();
for (const event of LIFE_EVENTS) {
  for (const service of buildJourney([event.id]).phases.flatMap(p => p.services)) {
    eventsOf.set(service.id, [...(eventsOf.get(service.id) ?? []), event.id]);
  }
}
const ownerEvent = (id: string): string => {
  const events = eventsOf.get(id) ?? [];
  return PHASE4.find(e => events.includes(e)) ?? (events.some(e => REVIEWED.includes(e)) ? 'reviewed' : 'none');
};
const typeRank = (path: string): number => {
  if (path.startsWith('eligibility.criteria.')) return 0;
  if (path.startsWith('eligibility.exclusions.')) return 1;
  if (path.startsWith('eligibility.autoQualifiers.')) return 2;
  if (path.startsWith('agentInteraction.')) return 3;
  if (path.startsWith('eligibility.evidenceRequired.')) return 4;
  if (path === 'eligibility.summary') return 5;
  if (path === 'desc') return 6;
  return 7;
};
const isPartly = (ev: FieldEvidence): boolean => {
  const note = ev.note ?? '';
  return ev.status === 'unverified'
    && note !== 'Value has changed since it was checked.'
    && !/awaiting independent re-verification/i.test(note)
    && !/contradicted:/.test(note)
    && (/partly supported:/.test(note) || (ev.claims?.supported ?? 0) > 0);
};
const currentText = (id: string, path: string): { value: unknown; text: string } => {
  const value = getFieldValue(NODES[id], path);
  const text = path === 'agentInteraction.methods' ? methodsText(value as string[])
    : path === 'agentInteraction.authRequired' ? AUTH_WORDS[String(value)] ?? String(value)
    : value && typeof value === 'object' && 'description' in value
      ? String((value as { description: string }).description) : String(value);
  return { value, text };
};
const walk = (root: string): string[] => readdirSync(root, { withFileTypes: true }).flatMap(d => {
  const path = join(root, d.name);
  return d.isDirectory() ? walk(path) : d.name === 'prepared.json' ? [path] : [];
});

interface Quote { quote: string; url: string | null; verdict?: string; origin: string; previousWording?: boolean }
const found = new Map<string, Quote[]>();
const quoteProblems: string[] = [];
for (const file of [...walk('data/stage3-audit'), ...walk('data/stage3-progress')]) {
  const dir = dirname(file);
  for (const p of read(file) as any[]) {
    const responseFile = existsSync(`${dir}/${p.id}.response.json`)
      ? `${dir}/${p.id}.response.json` : `data/stage3-progress/wave2-completion/${p.id}.response.json`;
    if (!existsSync(responseFile)) continue;
    const response = read(responseFile);
    for (const field of p.fields ?? []) {
      const key = `${p.id}#${field.path}`;
      const result = response.fields?.find((x: any) => x.key === field.key);
      if (!result) continue;
      for (const claim of result.claims ?? []) {
        if (!claim.quote || !Number.isInteger(claim.source) || !p.sources?.[claim.source]) continue;
        const source = p.sources[claim.source];
        if (!source.text.includes(claim.quote)) {
          quoteProblems.push(`${responseFile}: ${key}: quote absent from saved source ${claim.source}`);
          continue;
        }
        found.set(key, [...(found.get(key) ?? []), {
          quote: claim.quote, url: source.url, verdict: claim.verdict, origin: responseFile,
          previousWording: field.text !== currentText(p.id, field.path).text,
        }]);
      }
    }
  }
}

interface Classification { severity: 'high' | 'medium' | 'low'; likelyTrueElsewhere: boolean; action: string; reason: string; origin: string }
function classify(path: string, text: string, notes: string[], prior: any): Classification {
  if (prior && prior.text === text && JSON.stringify(prior.problems.map((p: any) => p.note)) === JSON.stringify(notes)) {
    return {
      severity: prior.severity, likelyTrueElsewhere: prior.likelyTrueElsewhere,
      action: prior.action, reason: prior.reason, origin: 'reused-unchanged-2026-09-triage',
    };
  }
  const note = notes[0] ?? 'Some claims are supported and others are not.';
  const highPath = /^(eligibility\.(criteria|exclusions|autoQualifiers|evidenceRequired)\.|agentInteraction\.)/.test(path);
  const outcomeWords = /eligib|qualif|must|require|amount|rate|fee|£|deadline|time limit|apply|payment|benefit|pension|visa/i;
  const severity: Classification['severity'] = highPath ? 'high' : outcomeWords.test(note) ? 'medium' : 'low';
  const action = path.startsWith('eligibility.evidenceRequired.') ? 'Remove or narrow the unsupported document requirement.'
    : path.startsWith('agentInteraction.') ? 'State only the application route or sign-in that the source supports.'
    : path.startsWith('eligibility.') && !['eligibility.summary'].includes(path) ? 'Narrow the eligibility wording to the quoted conditions.'
    : 'Cut or reword the unsupported clause using the source quote.';
  return { severity, likelyTrueElsewhere: false, action, reason: note, origin: 'stage5-codex-conservative-triage' };
}

const items: any[] = [];
const prompts: any[] = [];
const answers: any[] = [];
for (const node of Object.values(NODES)) {
  for (const [path, evidence] of Object.entries(provenanceFor(node).fields)) {
    if (!isPartly(evidence)) continue;
    const key = `${node.id}#${path}`;
    const { value, text } = currentText(node.id, path);
    const row = queued.get(key);
    const queueIsCurrent = !!row && (row.graph === text || (path === 'agentInteraction.authRequired' && row.graph === text));
    const problems = queueIsCurrent
      ? row.problems ?? [{ claim: row.graph, verdict: row.verdict, note: row.note, quote: row.quote, url: row.url }]
      : [{ claim: text, verdict: 'partly_supported', note: evidence.note ?? '', quote: evidence.quote ?? null }];
    const problemNotes = problems.map((p: any) => String(p.note ?? '')).filter(Boolean);
    const classification = classify(path, text, problemNotes, old.get(key));
    const quotes: Quote[] = [];
    if (evidence.quote && evidence.source) quotes.push({ quote: evidence.quote, url: evidence.source, origin: 'current-provenance' });
    for (const q of evidence.moreQuotes ?? []) quotes.push({ quote: q.quote, url: q.url, origin: 'current-provenance' });
    for (const p of problems) if (p.quote) quotes.push({ quote: p.quote, url: p.url ?? null, verdict: p.verdict, origin: 'review-queue' });
    quotes.push(...(found.get(key) ?? []));
    const uniqueQuotes = [...new Map(quotes.map(q => [`${q.url ?? ''}\0${q.quote}`, q])).values()];
    const event = ownerEvent(node.id);
    prompts.push({ key, service: node.name, path, text, problemNotes, rubric: 'high: likely wrong outcome; medium: wrong for some groups or materially imprecise; low: unsupported elaboration; Cite: probably true on a page not cited' });
    answers.push({ key, ...classification });
    items.push({ key, id: node.id, name: node.name, event, lifeEvents: eventsOf.get(node.id) ?? [],
      path, value, text, problems, quotes: uniqueQuotes, ...classification });
  }
}
const severityRank = { high: 0, medium: 1, low: 2 };
const eventRank = (event: string): number => event === 'reviewed' ? PHASE4.length
  : event === 'none' ? PHASE4.length + 1 : PHASE4.indexOf(event);
items.sort((a, b) => severityRank[a.severity as keyof typeof severityRank] - severityRank[b.severity as keyof typeof severityRank]
  || typeRank(a.path) - typeRank(b.path) || eventRank(a.event) - eventRank(b.event)
  || a.id.localeCompare(b.id) || a.path.localeCompare(b.path));
if (items.length !== 707) throw new Error(`Expected 707 current partly-supported fields, found ${items.length}`);
const currentKeys = new Set(items.map(x => x.key));
const staleQueue = [...queued.keys()].filter(key => !currentKeys.has(key));
const summary = {
  total: items.length,
  bySeverity: Object.fromEntries(['high', 'medium', 'low'].map(s => [s, items.filter(x => x.severity === s).length])),
  cite: items.filter(x => x.likelyTrueElsewhere).length,
  byType: Object.fromEntries(['criteria', 'exclusions', 'autoQualifiers', 'ways to apply', 'evidence', 'summary', 'desc'].map((label, rank) => [label, items.filter(x => typeRank(x.path) === rank).length])),
  reusedClassification: items.filter(x => x.origin.startsWith('reused')).length,
  newClassification: items.filter(x => !x.origin.startsWith('reused')).length,
  queueNotCurrent: staleQueue,
  quoteProblems,
};
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/worklist.json`, JSON.stringify({ generatedAt: new Date().toISOString(), definition: 'report-coverage partly-supported bucket', summary, items }, null, 2) + '\n');
writeFileSync(`${OUT}/classification-prompts.json`, JSON.stringify(prompts, null, 2) + '\n');
writeFileSync(`${OUT}/classification-answers.json`, JSON.stringify(answers, null, 2) + '\n');
const names = new Map(LIFE_EVENTS.map(e => [e.id, e.name]));
const lines = [
  '# Stage 5 worklist', '',
  `Current provenance has ${items.length} partly supported fields. Build with \`node --import tsx scripts/build-stage5-worklist.ts\`.`, '',
  '## Priority', '',
  '| Priority | Fields |', '|---|---:|',
  ...Object.entries(summary.bySeverity).map(([s, n]) => `| ${s} | ${n} |`),
  `| Cite candidates | ${summary.cite} |`, '',
  '## Field types', '',
  '| Type | Fields |', '|---|---:|',
  ...Object.entries(summary.byType).map(([s, n]) => `| ${s} | ${n} |`), '',
  '## Life events', '',
  '| Highest-risk life event | Fields |', '|---|---:|',
  ...[...PHASE4, 'reviewed', 'none'].map(e => `| ${names.get(e) ?? (e === 'reviewed' ? 'Already reviewed events' : 'No life event')} | ${items.filter(x => x.event === e).length} |`), '',
  `${summary.reusedClassification} classifications reuse the earlier triage because both the field text and problem notes are unchanged. ${summary.newClassification} received a conservative Stage 5 classification from their current note and field type. Review these classifications as each wave is prepared.`, '',
  `The saved prompts and answers are in \`data/stage5/classification-prompts.json\` and \`data/stage5/classification-answers.json\`. The full worklist includes each field's text, problem notes, current provenance quote, and exact quotes found in saved Stage 3 judge responses. ${staleQueue.length} queue rows no longer match a current partly supported field; the live provenance selection controls the worklist.`, '',
];
writeFileSync('docs/stage5-worklist.md', lines.join('\n'));
console.log(JSON.stringify(summary, null, 2));
