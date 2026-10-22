/**
 * apply-removals.ts — Apply approved stage 4 removals, keeping the evidence trail
 *
 * Reads a proposal package (scripts/prepare-stage4-proposal.ts writes one) and
 * applies only the IDs a person approved:
 *
 *   P…  delete one list item (criteria, exclusions, autoQualifiers, evidenceRequired)
 *   M…  delete agentInteraction.methods (absent = no page says how to start)
 *
 * Deleting a list item moves every later item up one place. Their provenance
 * records, review-queue entries and worklist items move with them, verdicts
 * unchanged: the value has not changed, only its index. (apply-fixes.ts
 * --record instead marks shifted records unverified, which throws away
 * confirmations that are still good.)
 *
 * Every removal is appended to data/removed-claims.json with the old value,
 * every page searched, the finder's queries and the judge's note, so a claim
 * can come back if a source for it turns up.
 *
 * Usage:
 *   npx tsx scripts/apply-removals.ts --proposals data/stage4-proposal/proposals.json --ids P001,P002,M001          # dry run
 *   npx tsx scripts/apply-removals.ts --proposals data/stage4-proposal/proposals.json --ids P001,P002,M001 --write
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { NODES } from '../src/graph-data.js';
import { loadProvenance, saveProvenance, getFieldValue } from '../src/provenance.js';

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const WRITE = process.argv.includes('--write');
const PROPOSALS = arg('--proposals');
const IDS = arg('--ids')?.split(',').map(s => s.trim()).filter(Boolean);
if (!PROPOSALS || !IDS?.length) {
  console.error('Usage: --proposals <proposals.json> --ids P001,M001,... [--write]');
  process.exit(1);
}

const GRAPH = 'src/graph-data.ts';
const LOG = 'data/removed-claims.json';
const QUEUE = 'data/review-queue-prose.json';
const WORKLIST = 'data/worklist-partly.json';

interface Proposal {
  id: string; key: string; path: string; currentValue: unknown;
  finderQueries: string[]; pages: { url: string }[]; judgeNote: string;
}
const pkg = JSON.parse(readFileSync(PROPOSALS, 'utf-8'));
const all: Proposal[] = [...pkg.proposals, ...pkg.methodDecisions];
const chosen = IDS.map(id => {
  const p = all.find(x => x.id === id);
  if (!p) throw new Error(`No proposal ${id}`);
  const [nodeId, path] = p.key.split('#');
  const now = getFieldValue(NODES[nodeId], path);
  if (JSON.stringify(now) !== JSON.stringify(p.currentValue)) throw new Error(`${id}: ${p.key} has changed since the proposal`);
  return p;
});

let src = readFileSync(GRAPH, 'utf-8');
const store = loadProvenance();
const queue = JSON.parse(readFileSync(QUEUE, 'utf-8'));
const worklist = JSON.parse(readFileSync(WORKLIST, 'utf-8'));
const log = JSON.parse(readFileSync(LOG, 'utf-8'));
const today = new Date().toISOString();

/** [start, end) of a node's block in graph-data.ts. */
function block(id: string): [number, number] {
  const i = src.indexOf(`\n  '${id}': {\n`);
  if (i === -1) throw new Error(`Node ${id} not found`);
  const next = /\n  '[a-z0-9-]+': \{\n/g;
  next.lastIndex = i + 5;
  const m = next.exec(src);
  return [i, m ? m.index : src.length];
}

/** Rename keys `<id>#<list>.<k>` to `<id>#<list>.<k-1>` for every k > removed. */
function shift<T>(get: () => [string, T][], set: (k: string, v: T) => void, del: (k: string) => void, id: string, list: string, removed: number) {
  const prefix = `${id}#${list}.`;
  const rows = get()
    .map(([k, v]) => ({ k, v, i: k.startsWith(prefix) ? Number(k.slice(prefix.length)) : NaN }))
    .filter(r => Number.isInteger(r.i) && r.i > removed)
    .sort((a, b) => a.i - b.i);
  for (const r of rows) { del(r.k); set(`${prefix}${r.i - 1}`, r.v); }
}

const LITERAL = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g;
const decode = (lit: string) => lit.startsWith('"') ? JSON.parse(lit) : lit.slice(1, -1).replace(/\\(.)/g, '$1');

// Indices already deleted from each list in this run, so the parse check
// compares against what the file holds now, not the list as first loaded.
const removedSoFar = new Map<string, Set<number>>();

// Highest index first within a list, so earlier deletions do not move later targets.
const order = [...chosen].sort((a, b) => {
  const ia = Number(a.path.split('.').pop()), ib = Number(b.path.split('.').pop());
  return a.key.split('.').slice(0, -1).join('.') === b.key.split('.').slice(0, -1).join('.') ? ib - ia : 0;
});

for (const p of order) {
  const [id, path] = p.key.split('#');
  const [s, e] = block(id);
  let b = src.slice(s, e);

  if (path === 'agentInteraction.methods') {
    const re = /\n[ ]+methods: \[[^\]]*\],/;
    if (!re.test(b)) throw new Error(`${p.id}: methods line not found`);
    b = b.replace(re, '');
    delete store.fields[p.key];
    queue.review = queue.review.filter((r: any) => !(r.id === id && r.field === path));
    queue.methodGaps = (queue.methodGaps ?? []).filter((r: any) => r.id !== id);
  } else {
    const m = path.match(/^eligibility\.(criteria|exclusions|autoQualifiers|evidenceRequired)\.(\d+)$/);
    if (!m || m[1] === 'criteria') throw new Error(`${p.id}: only plain string lists are handled (${path})`);
    const [, list, idxStr] = m;
    const idx = Number(idxStr);
    const open = new RegExp(`${list}: \\[`).exec(b);
    if (!open) throw new Error(`${p.id}: ${list} not found`);
    const start = open.index + open[0].length;
    const end = b.indexOf(']', start);
    const body = b.slice(start, end);
    const items = body.match(LITERAL) ?? [];
    const gone = removedSoFar.get(`${id}#${list}`) ?? new Set<number>();
    const expected = ((NODES[id].eligibility as any)[list] as string[]).filter((_, i) => !gone.has(i));
    if (items.length !== expected.length || items.some((l, i) => decode(l) !== expected[i])) {
      throw new Error(`${p.id}: could not parse ${id}.${list} safely`);
    }
    const kept = items.filter((_, i) => i !== idx);
    const multiline = body.includes('\n');
    const indent = multiline ? (body.match(/\n([ ]+)\S/)?.[1] ?? '        ') : '';
    const closeIndent = multiline ? (body.match(/\n([ ]*)$/)?.[1] ?? '      ') : '';
    const rebuilt = !kept.length ? ''
      : multiline ? `\n${kept.map(k => `${indent}${k},`).join('\n')}\n${closeIndent}`
      : kept.join(', ');
    b = b.slice(0, start) + rebuilt + b.slice(end);

    removedSoFar.set(`${id}#${list}`, gone.add(idx));
    const field = `eligibility.${list}`;
    delete store.fields[p.key];
    shift(() => Object.entries(store.fields), (k, v) => { store.fields[k] = v; }, k => { delete store.fields[k]; }, id, field, idx);
    queue.review = queue.review.filter((r: any) => !(r.id === id && r.field === path));
    for (const r of queue.review) {
      const mm = r.id === id && String(r.field).match(new RegExp(`^${field.replace('.', '\\.')}\\.(\\d+)$`));
      if (mm && Number(mm[1]) > idx) r.field = `${field}.${Number(mm[1]) - 1}`;
    }
    worklist.items = worklist.items.filter((w: any) => !(w.id === id && w.path === path));
    for (const w of worklist.items) {
      const mm = w.id === id && String(w.path).match(new RegExp(`^${field.replace('.', '\\.')}\\.(\\d+)$`));
      if (mm && Number(mm[1]) > idx) w.path = `${field}.${Number(mm[1]) - 1}`;
    }
  }

  src = src.slice(0, s) + b + src.slice(e);
  log.push({
    key: p.key,
    value: typeof p.currentValue === 'string' ? p.currentValue : JSON.stringify(p.currentValue),
    removedAt: today,
    searched: [...new Set(p.pages.map(x => x.url))],
    note: `Stage 4 removal ${p.id}, approved by the user. Judge: ${p.judgeNote} Finder queries: ${p.finderQueries.join(' | ')}`,
  });
  console.log(`${p.id}  ${p.key}  ${JSON.stringify(p.currentValue)}`);
}

if (WRITE) {
  writeFileSync(GRAPH, src);
  saveProvenance(store);
  writeFileSync(QUEUE, JSON.stringify(queue, null, 2) + '\n');
  writeFileSync(WORKLIST, JSON.stringify(worklist, null, 2) + '\n');
  writeFileSync(LOG, JSON.stringify(log, null, 2) + '\n');
  console.log(`\nApplied ${chosen.length}; logged to ${LOG}. Run check:types, check:provenance and build.`);
} else {
  console.log(`\nDry run: ${chosen.length} removals. Pass --write to apply.`);
}
