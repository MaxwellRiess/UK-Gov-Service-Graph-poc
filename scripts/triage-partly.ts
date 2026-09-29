/**
 * triage-partly.ts — Turn the partly supported queue into a ranked worklist
 *
 * After widen-sources.ts, about 625 fields remain partly supported. They are
 * not one problem. Some would change what a person does: an invented
 * condition, a scope that is too wide, a missing exception that decides
 * whether someone qualifies. Others are context no page states: helpful,
 * sometimes true, never decisive. A reviewer should see the first kind first.
 *
 * For each field a model decides, from the field text and the reviewer notes
 * the verification passes left (no page text is needed), a severity:
 *
 *   high      a typical person acting on it would probably reach a wrong
 *             outcome: a wrong eligibility decision, amount, fee or deadline,
 *             or the wrong way to apply
 *   medium    wrong for some groups or in some situations (a missing exception,
 *             a nation or route left out), or imprecise in a way that matters
 *   low       elaboration: context or advice that decides none of that
 *
 * High and medium are "material". A first version asked only material or
 * not, and 91% came back material: accurate, but no use for ordering work.
 *
 * and whether it is probably true but stated on a page not yet cited, and a
 * one-line action. A field is material if any of its claims is.
 *
 * Items are then ranked by kind, by field type (criteria, exclusions,
 * evidence and ways to apply before summaries and descriptions), and grouped
 * under the highest-risk life event each service appears in, in the phase 4
 * order of the data quality plan. Services that appear only in the events
 * already reviewed get their own group, as a sweep.
 *
 * Nothing is changed in graph-data.ts or provenance. Outputs:
 *   data/worklist-partly.json   every item, ranked
 *   docs/review-worklist.md     per life event, material items in full
 *
 * Usage:
 *   npx tsx scripts/triage-partly.ts --only dwp-pip --verbose
 *   npx tsx scripts/triage-partly.ts --write
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { NODES, LIFE_EVENTS } from '../src/graph-data.js';
import { buildJourney } from '../src/graph-engine.js';
import { getFieldValue } from '../src/provenance.js';

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const WRITE = process.argv.includes('--write');
const VERBOSE = process.argv.includes('--verbose');
const ONLY = arg('--only')?.split(',');
const MODEL = arg('--model') ?? 'claude-opus-5-5';
// Re-rank and re-write the outputs from the last run's judgements, without calling the model.
const FROM_JSON = process.argv.includes('--from-json');

if (!FROM_JSON && !process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. This pass needs it.');
  process.exit(2);
}
const client = new Anthropic({ maxRetries: 4 });

// ─── RANKING ────────────────────────────────────────────────────────────────

/** Phase 4 order from the data quality plan: highest risk to users first. */
const PHASE4 = ['disability', 'carer', 'terminal-illness', 'retirement', 'bereavement', 'immigration',
  'business', 'buying-home', 'new-job', 'marriage', 'university', 'school', 'driving'];
const REVIEWED = ['baby', 'job-loss', 'divorce', 'moving'];

/** Fields that decide what someone does outrank the prose that describes them. */
function fieldWeight(path: string): number {
  if (path.startsWith('eligibility.criteria.')) return 6;
  if (/^eligibility\.(exclusions|evidenceRequired|autoQualifiers)\./.test(path)) return 5;
  if (path.startsWith('agentInteraction.')) return 4;
  if (path === 'eligibility.summary') return 3;
  return 2;   // desc
}

const eventsOf = new Map<string, string[]>();
for (const e of LIFE_EVENTS) {
  for (const s of buildJourney([e.id]).phases.flatMap(p => p.services)) {
    eventsOf.set(s.id, [...(eventsOf.get(s.id) ?? []), e.id]);
  }
}
/**
 * Higher is reviewed sooner: the already-reviewed events first (a quick sweep of
 * services the planning team relies on), then phase 4 in risk order, and services
 * in no life event last.
 */
function eventRank(event: string): number {
  if (event === 'reviewed') return PHASE4.length + 1;
  const i = PHASE4.indexOf(event);
  return i === -1 ? 0 : PHASE4.length - i;
}

/** The life event whose review should pick this service up. */
function ownerEvent(id: string): string {
  const evs = eventsOf.get(id) ?? [];
  return PHASE4.find(e => evs.includes(e)) ?? (evs.some(e => REVIEWED.includes(e)) ? 'reviewed' : 'none');
}

// ─── INPUT ──────────────────────────────────────────────────────────────────

interface Problem { claim: string; verdict: string; note: string }
interface Field { key: string; path: string; text: string; problems: Problem[] }

const prose = JSON.parse(readFileSync('data/review-queue-prose.json', 'utf-8')).review;
const criteria = JSON.parse(readFileSync('data/review-queue-criteria.json', 'utf-8')).review;
const byService = new Map<string, Field[]>();
const push = (id: string, f: Field) => byService.set(id, [...(byService.get(id) ?? []), f]);

for (const r of prose) {
  if (r.verdict !== 'partly_supported' || (ONLY && !ONLY.includes(r.id)) || !NODES[r.id]) continue;
  push(r.id, {
    key: r.field, path: r.field, text: r.graph,
    problems: r.problems.filter((p: Problem) => p.verdict !== 'supported'),
  });
}
for (const r of criteria) {
  if (r.verdict !== 'partly_supported' || (ONLY && !ONLY.includes(r.id)) || !NODES[r.id]) continue;
  const path = `eligibility.criteria.${r.criterion}`;
  const cur = getFieldValue(NODES[r.id], path) as { description?: string } | undefined;
  if (cur?.description !== r.graph) continue;     // changed since queued
  // The field path is the key: unique within a service, and what the model tends to echo anyway.
  push(r.id, { key: path, path, text: r.graph, problems: [{ claim: r.graph, verdict: r.verdict, note: r.note }] });
}

// ─── JUDGE ──────────────────────────────────────────────────────────────────

type Severity = 'high' | 'medium' | 'low';
interface Triage { key: string; severity: Severity; likely_true_elsewhere: boolean; action: string; reason: string }

const TOOL: Anthropic.Tool = {
  name: 'report_triage',
  description: 'Classify each field by the effect of its unsupported claims.',
  input_schema: {
    type: 'object',
    properties: {
      fields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'The field key exactly as given.' },
            severity: { type: 'string', enum: ['high', 'medium', 'low'] },
            likely_true_elsewhere: {
              type: 'boolean',
              description: 'True if the unsupported part reads like an accurate fact that another official page probably states, so the fix is to find and cite it rather than change the wording.',
            },
            action: {
              type: 'string',
              description: 'One short imperative sentence for the reviewer, e.g. "Add the childminder agency route" or "Cite the early years framework for paediatric first aid" or "Remove the unsourced parking advice".',
            },
            reason: { type: 'string', description: 'One sentence: who would be affected and how.' },
          },
          required: ['key', 'severity', 'likely_true_elsewhere', 'action', 'reason'],
        },
      },
    },
    required: ['fields'],
  },
};

async function triage(id: string, fields: Field[]): Promise<Triage[]> {
  const n = NODES[id];
  const listing = fields.map(f =>
    `[${f.key}]\n  TEXT: ${f.text}\n` +
    f.problems.map(p => `  UNSUPPORTED (${p.verdict.replace('_', ' ')}): ${p.note}`).join('\n'),
  ).join('\n\n');
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    tool_choice: { type: 'auto' },
    tools: [TOOL],
    messages: [{
      role: 'user',
      content:
        `A service graph describes the UK government service "${n.name}". An AI agent uses it to tell people ` +
        `whether they qualify and what to do. Each field below was checked against the official pages, and the ` +
        `notes say which parts the pages do not support.\n\n` +
        `Rate each field by the effect of its unsupported parts on a person the agent is helping:\n` +
        `- high: a typical person acting on it would probably reach a wrong outcome: told they qualify or not ` +
        `wrongly, given a wrong amount, fee or deadline, told to provide something they need not (or not told ` +
        `something they must), or sent the wrong way to apply.\n` +
        `- medium: wrong only for some groups or situations (a missing exception, a nation, age band or route ` +
        `left out, "all" where there are exceptions), or imprecise in a way that could matter to someone.\n` +
        `- low: context, background, advice or phrasing that would not change whether anyone qualifies, what ` +
        `they must do, provide or pay, or when, even if it were wrong.\n\n` +
        `Judge the typical person using this service, not a rare edge case. If torn between two levels, choose ` +
        `the higher.\n\n` +
        `Report by calling report_triage once, covering every field.\n\n${listing}`,
    }],
  });
  const block = res.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
  if (!block) throw new Error('model did not call report_triage');
  return (block.input as { fields: Triage[] }).fields;
}

// ─── RUN ────────────────────────────────────────────────────────────────────

interface Item {
  id: string; name: string; event: string; path: string; text: string;
  kind: 'material' | 'elaboration'; severity: Severity; likelyTrueElsewhere: boolean; action: string; reason: string;
  problems: Problem[]; rank: number;
}
const items: Item[] = FROM_JSON ? JSON.parse(readFileSync('data/worklist-partly.json', 'utf-8')).items : [];
const failures: string[] = [];
const ids = FROM_JSON ? [] : [...byService.keys()];
if (!FROM_JSON) console.error(`Triaging ${ids.reduce((a, id) => a + byService.get(id)!.length, 0)} fields across ${ids.length} services...`);

const queue = [...ids];
let done = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const id = queue.shift()!;
    const fields = byService.get(id)!;
    try {
      const out = await triage(id, fields);
      for (const f of fields) {
        const t = out.find(x => x.key === f.key);
        if (!t) { failures.push(`${id} ${f.path}: missing from response`); continue; }
        const event = ownerEvent(id);
        items.push({
          id, name: NODES[id].name, event, path: f.path, text: f.text,
          kind: t.severity === 'low' ? 'elaboration' : 'material', severity: t.severity,
          likelyTrueElsewhere: t.likely_true_elsewhere, action: t.action, reason: t.reason,
          problems: f.problems,
          rank: 0,
        });
      }
    } catch (e: any) {
      failures.push(`${id}: ${e.message}`);
    }
    if (++done % 25 === 0) console.error(`  ${done}/${ids.length}`);
  }
}));

for (const i of items) {
  i.event = ownerEvent(i.id);
  i.rank = ({ high: 2000, medium: 1000, low: 0 } as const)[i.severity] + fieldWeight(i.path) * 20 + eventRank(i.event);
}
items.sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id));

// ─── OUTPUT ─────────────────────────────────────────────────────────────────

const EVENT_NAME: Record<string, string> = Object.fromEntries(LIFE_EVENTS.map(e => [e.id, e.name]));
EVENT_NAME.reviewed = 'Already reviewed events (baby, job loss, divorce, moving house): sweep';
EVENT_NAME.none = 'In no life event';
const groups = ['reviewed', ...PHASE4, 'none'];

function markdown(): string {
  const sev = (ev: string, s: Severity) => items.filter(i => i.event === ev && i.severity === s).length;
  const lines: string[] = [
    '# Review worklist: partly supported fields',
    '',
    `Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/triage-partly.ts\` from the verification review queues. ` +
    `Each item is a field the official pages only partly support. **High**: a typical person acting on it would ` +
    `probably reach a wrong outcome (eligibility, amount, fee, deadline, or how to apply). **Medium**: wrong for some ` +
    `groups or situations, or imprecise in a way that matters. **Low**: elaboration no page states. "Cite" marks a ` +
    `claim that is probably true and needs a source rather than new wording.`,
    '',
    'Groups follow the phase 4 order of the data quality plan. Each service appears once, under the highest-risk life event it belongs to.',
    '',
    '| Life event | High | Medium | Low (elaboration) |',
    '|---|---|---|---|',
    ...groups.filter(g => items.some(i => i.event === g)).map(g =>
      `| ${EVENT_NAME[g]} | ${sev(g, 'high')} | ${sev(g, 'medium')} | ${sev(g, 'low')} |`),
    `| **Total** | **${items.filter(i => i.severity === 'high').length}** | **${items.filter(i => i.severity === 'medium').length}** | **${items.filter(i => i.severity === 'low').length}** |`,
    '',
  ];
  for (const g of groups) {
    const mat = items.filter(i => i.event === g && i.kind === 'material');
    const ela = items.filter(i => i.event === g && i.kind === 'elaboration');
    if (!mat.length && !ela.length) continue;
    lines.push(`## ${EVENT_NAME[g]}`, '');
    if (mat.length) {
      lines.push(`### High and medium (${mat.length})`, '', '| | Service | Field | Action | |', '|---|---|---|---|---|');
      for (const i of mat) lines.push(`| ${i.severity === 'high' ? 'High' : 'Med'} | \`${i.id}\` | \`${i.path}\` | ${i.action.replace(/\|/g, '\\|')} | ${i.likelyTrueElsewhere ? 'Cite' : ''} |`);
      lines.push('');
    }
    if (ela.length) {
      const per = new Map<string, number>();
      for (const i of ela) per.set(i.id, (per.get(i.id) ?? 0) + 1);
      lines.push(`### Low: elaboration (${ela.length})`, '', [...per].map(([id, c]) => `\`${id}\` ${c}`).join(', '), '');
    }
  }
  return lines.join('\n') + '\n';
}

if (WRITE) {
  writeFileSync('data/worklist-partly.json', JSON.stringify({ generatedAt: new Date().toISOString(), model: MODEL, items }, null, 2) + '\n');
  if (!existsSync('docs')) mkdirSync('docs');
  writeFileSync('docs/review-worklist.md', markdown());
  console.error('Wrote data/worklist-partly.json and docs/review-worklist.md');
}

const mat = items.filter(i => i.kind === 'material');
console.log('─── PARTLY SUPPORTED TRIAGE ────────────────────────────────────');
console.log(`Fields triaged: ${items.length}   failed: ${failures.length}`);
for (const s of ['high', 'medium', 'low'] as Severity[]) {
  const x = items.filter(i => i.severity === s);
  console.log(`${s.padEnd(8)} ${String(x.length).padStart(4)}  (probably true, needs a source: ${x.filter(i => i.likelyTrueElsewhere).length})`);
}
console.log('\nBy life event (high / medium / low):');
for (const g of groups) {
  const c = (s: Severity) => items.filter(i => i.event === g && i.severity === s).length;
  if (c('high') + c('medium') + c('low')) console.log(`  ${EVENT_NAME[g].padEnd(40).slice(0, 40)} ${String(c('high')).padStart(4)} / ${String(c('medium')).padStart(4)} / ${c('low')}`);
}
if (failures.length) console.log(`\nFailures:\n  ${failures.join('\n  ')}`);
if (VERBOSE) for (const i of items) console.log(`\n${i.severity.toUpperCase()} ${i.id} ${i.path}${i.likelyTrueElsewhere ? ' [cite]' : ''}\n  ${i.action}\n  (${i.reason})`);
