/**
 * Build a read-only Stage 4 review package from the saved Stage 3 run.
 * This script never edits graph data, provenance, review queues or the removal log.
 * Run from the repository root with: node --import tsx scripts/prepare-stage4-proposal.ts
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NODES, type ServiceNode } from '../src/graph-data.js';
import { getFieldValue } from '../src/provenance.js';
import { provenanceFor, type FieldEvidence } from '../src/provenance-view.js';
import { methodsText } from './lib/judge-prose.js';
import { ownUrls } from './lib/sources.js';

const OUT = 'data/stage4-proposal';
const AUDIT = 'data/stage3-audit/full';
const PROGRESS = 'data/stage3-progress';
const WAVES = [
  { name: 'wave1', dir: `${AUDIT}/judge-w1` },
  { name: 'wave2', dir: `${AUDIT}/judge-w2` },
  { name: 'wave3', dir: `${PROGRESS}/judge-w3` },
  { name: 'wave4', dir: `${PROGRESS}/judge-w4` },
  { name: 'wave5', dir: `${PROGRESS}/judge-w5` },
];
const BINARY = /\.(?:pdf|docx?|odt)(?:$|[?#])/i;
const readJson = (file: string): any => JSON.parse(readFileSync(file, 'utf8'));
const unique = <T>(items: T[]): T[] => [...new Set(items)];

interface FinderNote {
  queries: string[];
  urls: { url: string; why: string }[];
  verdict_hint: string;
}
interface Source { url: string; text: string; linked?: boolean; found?: boolean }
interface PreparedField { key: string; path: string; text: string }
interface PreparedRow {
  wave: string;
  dir: string;
  id: string;
  field: PreparedField;
  sources: Source[];
  responseFile: string;
  response: any;
}
interface Page {
  url: string;
  roles: string[];
  readableInJudgePrompt: boolean;
  note?: string;
}
interface Entry {
  key: string;
  service: string;
  path: string;
  claim: string;
  currentValue: string | string[];
  finderQueries: string[];
  substantiveFinderSearches: string[];
  finderNotesNotCounted: string[];
  pages: Page[];
  judgeNote: string;
  judgeVerdicts: string[];
  methodsOnPage: string[];
  prompt: string;
  response: string;
  exactCopies: { path: string; text: string }[];
  status: string;
  reason?: string;
  id?: string;
  proposedAction?: string;
}

const briefs = new Map<string, any>();
const notes = new Map<string, FinderNote>();
for (let i = 0; i < 15; i++) {
  const batch = String(i).padStart(2, '0');
  for (const brief of readJson(`${AUDIT}/briefs-${batch}.json`)) briefs.set(brief.key, brief);
  const dir = [8, 10, 12, 13, 14].includes(i) ? `${PROGRESS}/finder` : AUDIT;
  for (const [key, note] of Object.entries(readJson(`${dir}/finder-notes-${batch}.json`))) {
    notes.set(key, note as FinderNote);
  }
}

const prepared = new Map<string, PreparedRow>();
for (const wave of WAVES) {
  for (const p of readJson(`${wave.dir}/prepared.json`)) {
    const responseFile = existsSync(`${wave.dir}/${p.id}.response.json`)
      ? `${wave.dir}/${p.id}.response.json`
      : `${PROGRESS}/wave2-completion/${p.id}.response.json`;
    const response = existsSync(responseFile) ? readJson(responseFile) : null;
    for (const field of p.fields as PreparedField[]) {
      prepared.set(`${p.id}#${field.path}`, {
        wave: wave.name, dir: wave.dir, id: p.id, field,
        sources: p.sources, responseFile, response,
      });
    }
  }
}

function bucket(ev: FieldEvidence): string {
  if (ev.status !== 'unverified') return ev.status;
  const note = ev.note ?? '';
  if (note === 'Value has changed since it was checked.') return 'value-changed';
  if (/awaiting independent re-verification/i.test(note)) return 'awaiting-reverify';
  if (/contradicted:/.test(note)) return 'contradicted';
  if (/partly supported:/.test(note) || (ev.claims?.supported ?? 0) > 0) return 'partly-supported';
  if (/not stated:/.test(note)) return 'not-stated';
  return 'no-verdict';
}

function claimValue(node: ServiceNode, path: string): string | string[] {
  const value = getFieldValue(node, path);
  if (path === 'agentInteraction.methods') return (value as string[]) ?? [];
  if (value && typeof value === 'object' && 'description' in value) {
    return String((value as { description: string }).description);
  }
  return String(value);
}

function exactCopies(node: ServiceNode, claim: string): { path: string; text: string }[] {
  if (claim.length < 14) return [];
  const out: { path: string; text: string }[] = [];
  const groups: [string, string[] | undefined][] = [
    ['eligibility.keyQuestions', node.eligibility.keyQuestions],
    ['eligibility.ruleIn', node.eligibility.ruleIn],
    ['eligibility.ruleOut', node.eligibility.ruleOut],
    ['agentInteraction.agentSteps', node.agentInteraction?.agentSteps],
  ];
  for (const [base, values] of groups) {
    (values ?? []).forEach((text, index) => {
      if (text.toLowerCase().includes(claim.toLowerCase())) out.push({ path: `${base}.${index}`, text });
    });
  }
  const walk = (rules: any[], base: string) => {
    rules.forEach((rule, i) => {
      const path = `${base}.${i}`;
      if (typeof rule.label === 'string' && rule.label.toLowerCase().includes(claim.toLowerCase())) {
        out.push({ path: `${path}.label`, text: rule.label });
      }
      if (Array.isArray(rule.rules)) walk(rule.rules, `${path}.rules`);
    });
  };
  walk(node.eligibility.rules ?? [], 'eligibility.rules');
  return out;
}

function pagesFor(node: ServiceNode, p: PreparedRow, note: FinderNote): Page[] {
  const cited = ownUrls(node);
  const nominated = note.urls.map(x => x.url);
  const actual = p.sources.map(x => x.url);
  return unique([...cited, ...actual, ...nominated]).map(url => {
    const source = p.sources.find(x => x.url === url);
    const roles = [
      cited.includes(url) ? 'cited' : '',
      actual.includes(url) ? (source?.linked ? 'linked in judge prompt' : source?.found ? 'found in judge prompt' : 'in judge prompt') : '',
      nominated.includes(url) ? 'finder nomination' : '',
    ].filter(Boolean);
    const readableInJudgePrompt = !!source && !/^%PDF|^PK\x03\x04/.test(source.text);
    return {
      url, roles, readableInJudgePrompt,
      ...(!readableInJudgePrompt ? { note: BINARY.test(url) ? 'PDF/Word source not available as readable text' : 'not present as readable judge-prompt text' } : {}),
    };
  });
}

function rank(path: string): number {
  if (/^eligibility\.(criteria|exclusions|autoQualifiers)\./.test(path)) return 0;
  if (path === 'agentInteraction.methods') return 1;
  if (path.startsWith('eligibility.evidenceRequired.')) return 2;
  if (path === 'desc' || path === 'eligibility.summary') return 3;
  return 4;
}
const sortEntries = (a: Entry, b: Entry) => rank(a.path) - rank(b.path) || a.key.localeCompare(b.key);
/** A fetched URL or a guided-page visit is evidence review, not a second search. */
function isSubstantiveSearch(note: string): boolean {
  const text = note.trim();
  if (!text || /^https?:\/\/|^\//i.test(text)) return false;
  if (/^(?:fetched|walked|read|gov\.uk content:|gov\.uk content api:|ukvi contact smart answer branch:)/i.test(text)) return false;
  if (/\((?:read|search result only)\)/i.test(text)) return false;
  return true;
}
const fullFields = Object.values(NODES).flatMap(node =>
  Object.entries(provenanceFor(node).fields).map(([path, ev]) => ({ key: `${node.id}#${path}`, node, path, ev, bucket: bucket(ev) })));
const notStated = fullFields.filter(x => x.bucket === 'not-stated');
const unprepared = readJson(`${PROGRESS}/unprepared-fields.json`).items
  .filter((x: any) => x.status !== 'superseded_by_correction');
const unpreparedKeys = new Set(unprepared.map((x: any) => x.key));
const entries: Entry[] = [];
const missingJudge: string[] = [];

for (const item of notStated) {
  if (!prepared.has(item.key)) continue;
  const p = prepared.get(item.key)!;
  const note = notes.get(item.key);
  const fieldResult = p.response?.fields?.find((x: any) => x.key === p.field.key);
  if (!note || !fieldResult) { missingJudge.push(item.key); continue; }
  const value = claimValue(item.node, item.path);
  const claim = item.path === 'agentInteraction.methods' ? methodsText(value as string[]) : value as string;
  if (claim !== p.field.text) {
    missingJudge.push(`${item.key}: saved prompt differs from current graph`);
    continue;
  }
  const nominated = note.urls.map(x => x.url);
  const binaryOnly = nominated.length > 0 && nominated.every(url => BINARY.test(url)) &&
    nominated.every(url => {
      const source = p.sources.find(x => x.url === url);
      return !source || /^%PDF|^PK\x03\x04/.test(source.text);
    });
  const substantiveSearches = unique(note.queries.map(x => x.trim()).filter(isSubstantiveSearch));
  const nonSearchNotes = note.queries.filter(x => !isSubstantiveSearch(x));
  const queryCount = substantiveSearches.length;
  const verdicts = unique<string>(fieldResult.claims.map((x: any) => String(x.verdict)));
  const status = binaryOnly ? 'unreadable-binary-only'
    : queryCount < 2 ? 'insufficient-search'
    : verdicts.some((x: string) => x !== 'not_stated') ? 'judge-mismatch'
    : item.path === 'agentInteraction.methods' ? 'method-decision'
    : /^eligibility\.(criteria|exclusions|autoQualifiers|evidenceRequired)\.\d+$/.test(item.path) ? 'proposed-deletion'
    : item.path === 'desc' || item.path === 'eligibility.summary' ? 'prose-review'
    : 'unsupported-field-type';
  const id = item.key.split('#')[0];
  entries.push({
    key: item.key, service: item.node.name, path: item.path, claim,
    currentValue: value, finderQueries: note.queries,
    substantiveFinderSearches: substantiveSearches, finderNotesNotCounted: nonSearchNotes,
    pages: pagesFor(item.node, p, note),
    judgeNote: fieldResult.claims.map((x: any) => x.note).filter(Boolean).join(' '),
    judgeVerdicts: verdicts,
    methodsOnPage: p.response?.methods_on_page ?? [],
    prompt: `${OUT}/judgements/${p.wave}/${id}.prompt.txt`,
    response: `${OUT}/judgements/${p.wave}/${id}.response.json`,
    exactCopies: exactCopies(item.node, claim), status,
    ...(status === 'proposed-deletion' ? { proposedAction: 'Delete this list item; shift later provenance keys without changing their verdicts.' } : {}),
    ...(status === 'method-decision' ? { reason: 'No current method was supported. Do not use an empty methods array to mean unknown.' } : {}),
    ...(status === 'insufficient-search' ? { reason: `${queryCount} distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.` } : {}),
    ...(status === 'unreadable-binary-only' ? { reason: 'Every nominated finder source was an unreadable PDF or Word file.' } : {}),
  });
}
entries.sort(sortEntries);
let proposalNumber = 0, methodNumber = 0;
for (const entry of entries) {
  if (entry.status === 'proposed-deletion') entry.id = `P${String(++proposalNumber).padStart(3, '0')}`;
  if (entry.status === 'method-decision') entry.id = `M${String(++methodNumber).padStart(3, '0')}`;
}

const proposals = entries.filter(x => x.status === 'proposed-deletion');
const methodDecisions = entries.filter(x => x.status === 'method-decision');
const unreadable = entries.filter(x => x.status === 'unreadable-binary-only');
const insufficient = entries.filter(x => x.status === 'insufficient-search');
const otherHolds = entries.filter(x => !['proposed-deletion', 'method-decision', 'unreadable-binary-only', 'insufficient-search'].includes(x.status));
const outsideSelection = notStated.filter(x => !briefs.has(x.key)).map(x => ({ key: x.key, claim: claimValue(x.node, x.path) }));
const noVerdict = fullFields.filter(x => x.bucket === 'no-verdict').map(x => x.key);
const awaiting = fullFields.filter(x => x.bucket === 'awaiting-reverify').map(x => x.key);
const selectionRows = notStated.map(x => {
  const judged = entries.find(e => e.key === x.key);
  const status = judged?.status ?? (unpreparedKeys.has(x.key) ? 'unprepared' : 'outside-stage3-selection');
  return { key: x.key, claim: claimValue(x.node, x.path), status, ...(judged?.id ? { proposalId: judged.id } : {}) };
});
if (notStated.length !== 107 || unprepared.length !== 49 || entries.length !== 54 || missingJudge.length) {
  throw new Error(`Selection changed: ${JSON.stringify({ notStated: notStated.length, unprepared: unprepared.length, judged: entries.length, missingJudge })}`);
}
if (notStated.filter(x => unpreparedKeys.has(x.key)).length !== 49) throw new Error('Unprepared key set differs from current not-stated fields');
if (selectionRows.filter(x => x.status === 'outside-stage3-selection').length !== 4) throw new Error('Unexpected unmatched not-stated fields');

mkdirSync(OUT, { recursive: true });
for (const entry of entries) {
  const source = prepared.get(entry.key)!;
  const targetDir = join(OUT, 'judgements', source.wave);
  mkdirSync(targetDir, { recursive: true });
  const id = source.id;
  const promptSource = `${source.dir}/${id}.prompt.txt`;
  if (!existsSync(promptSource) || !existsSync(source.responseFile)) throw new Error(`Missing archived judge files for ${entry.key}`);
  copyFileSync(promptSource, join(targetDir, `${id}.prompt.txt`));
  copyFileSync(source.responseFile, join(targetDir, `${id}.response.json`));
}
writeFileSync(`${OUT}/selection.json`, JSON.stringify({
  generatedAt: new Date().toISOString(),
  counts: {
    currentNotStated: notStated.length, stage3Judged: entries.length, unprepared: unprepared.length,
    outsideStage3Selection: outsideSelection.length, proposedDeletions: proposals.length,
    methodDecisions: methodDecisions.length, unreadableBinaryOnly: unreadable.length,
    insufficientSearch: insufficient.length, otherHolds: otherHolds.length,
    noVerdict: noVerdict.length, awaitingReverification: awaiting.length,
  },
  fields: selectionRows, unprepared, unreadable, insufficient, outsideSelection, noVerdict, awaiting, otherHolds,
}, null, 2) + '\n');
writeFileSync(`${OUT}/proposals.json`, JSON.stringify({ proposals, methodDecisions }, null, 2) + '\n');

const escape = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
const link = (url: string) => `[${url.replace(/^https?:\/\//, '')}](${url})`;
const detail = (e: Entry) => [
  `### ${e.id ?? e.key} — ${e.service}: \`${e.path}\``, '',
  `**Claim:** ${e.claim}`, '',
  `**Action:** ${e.proposedAction ?? e.reason ?? 'Hold for further source review.'}`, '',
  `**Judge note:** ${e.judgeNote || 'No note supplied.'}`, '',
  ...(e.path === 'agentInteraction.methods' && e.methodsOnPage.length ? [`**Other methods named on the page:** ${e.methodsOnPage.join(', ')}`, ''] : []),
  `**Finder searches counted (${e.substantiveFinderSearches.length}):**`, '',
  ...(e.substantiveFinderSearches.length ? e.substantiveFinderSearches.map(q => `- \`${q.replace(/`/g, '\\`')}\``) : ['- None recorded.']), '',
  ...(e.finderNotesNotCounted.length ? ['**Finder notes not counted as searches:**', '', ...e.finderNotesNotCounted.map(q => `- \`${q.replace(/`/g, '\\`')}\``), ''] : []),
  '**Pages recorded:**', '',
  ...e.pages.map(p => `- ${link(p.url)} — ${p.roles.join(', ')}${p.readableInJudgePrompt ? '' : `; ${p.note}`}`), '',
  `**Saved judge input and output:** [prompt](${e.prompt.replace(`${OUT}/`, '')}), [response](${e.response.replace(`${OUT}/`, '')})`, '',
  ...(e.exactCopies.length ? ['**Exact copies to inspect during application:**', '', ...e.exactCopies.map(c => `- \`${c.path}\`: ${c.text}`), ''] : []),
].join('\n');
const group = (title: string, list: Entry[]) => [
  `## ${title} (${list.length})`, '',
  ...(list.length ? list.map(detail) : ['None.', '']),
];
const review = [
  '# Stage 4 removal proposal — approval required', '',
  'No graph claim, provenance record or removal log has been changed by this proposal. Approve the specific proposal IDs before any deletion is applied.', '',
  `Current confirmed coverage remains **1,857 of 3,014 checkable fields (61.6%)**. The current not-stated bucket has ${notStated.length} fields: ${entries.length} reached a Stage 3 judge prompt, ${unprepared.length} never reached one, and ${outsideSelection.length} were outside the Stage 3 selection.`, '',
  `The ${entries.length} judged fields split into ${proposals.length} proposed list-item deletions, ${methodDecisions.length} method decisions, ${unreadable.length} PDF/Word-only exclusions and ${insufficient.length} fields with fewer than two distinct finder searches.`, '',
  'Each field lists the cited pages, pages supplied to its judge, and finder nominations. A nomination marked unreadable was not available as readable judge-prompt text. Page reads and guided navigation are shown separately from the finder searches counted toward the two-search minimum.', '',
  'For an approved list deletion, retain the verdicts of later list items when their indices shift. Search the node for copied facts in key questions, display rules, agent steps and executable rules; run the consistency check. No prose cuts are proposed in this selection. An empty methods array means automatic service delivery and must never stand for an unknown method.', '',
  '## Proposed deletions at a glance', '',
  '| ID | Field | Claim |', '|---|---|---|',
  ...proposals.map(e => `| ${e.id} | \`${e.key}\` | ${escape(e.claim)} |`), '',
  ...group('Eligibility criteria and exclusions proposed for deletion', proposals.filter(x => rank(x.path) === 0)),
  ...group('Ways to apply requiring a decision', methodDecisions),
  ...group('Evidence items proposed for deletion', proposals.filter(x => rank(x.path) === 2)),
  ...group('Prose clauses proposed for deletion', proposals.filter(x => rank(x.path) === 3)),
  ...group('Excluded: only unreadable PDF or Word nominations', unreadable),
  ...group('Excluded: fewer than two finder searches', insufficient),
  ...(otherHolds.length ? group('Other held judge fields', otherHolds) : []),
  '## Excluded: never prepared or judged in Stage 3 (49)', '',
  '| Field | Claim at selection | Reason |', '|---|---|---|',
  ...unprepared.map((x: any) => `| \`${x.key}\` | ${escape(x.claimAtSelection)} | ${x.status} |`), '',
  '## Excluded: outside the Stage 3 selection (4)', '',
  ...outsideSelection.map(x => `- \`${x.key}\`: ${Array.isArray(x.claim) ? x.claim.join(', ') : x.claim}`), '',
  '## Excluded: no verdict (8)', '', ...noVerdict.map(x => `- \`${x}\``), '',
  '## Excluded: awaiting independent re-verification (2)', '', ...awaiting.map(x => `- \`${x}\``), '',
  '## Approval scope', '',
  `Reply with the proposal IDs you approve, or approve all ${proposals.length} proposed deletions. The method decisions and excluded fields require separate source work or a schema decision; they are not included in approval of those deletions.`, '',
].join('\n');
writeFileSync(`${OUT}/review.md`, review);
writeFileSync(`${OUT}/README.md`, [
  '# Stage 4 proposal record', '',
  'This is a read-only proposal. It does not apply removals. `selection.json` records the status of every current not-stated field and the exclusions; `proposals.json` holds the ordered deletion proposals and method decisions; `review.md` is the human review page. `judgements/` copies the exact Stage 3 prompts and responses for the 54 judged not-stated fields. The original finder notes and all other Stage 3 material remain in `data/stage3-audit/` and `data/stage3-progress/`.', '',
  'The proposed deletions require user approval before graph changes. Once approved, log the complete old value, every cited and finder page, queries and judge note in `data/removed-claims.json`. Preserve shifted list-item provenance at its new key. Run the checks named in `docs/verification-procedure.md` before each field-type commit. Refresh `sha256sums.txt` whenever this proposal package changes.', '',
].join('\n'));
console.log(`Wrote ${OUT}: ${proposals.length} deletion proposals, ${methodDecisions.length} method decisions, ${unreadable.length} unreadable, ${insufficient.length} insufficient-search exclusions`);
