/**
 * widen-sources.ts — Re-judge partly supported fields against linked pages
 *
 * Many fields are only partly supported because the page a service cites does
 * not state everything, while a page it links to does: the £60,000 threshold
 * for the High Income Child Benefit Charge, the theory test's pass mark, the
 * civil partnership route for divorce. This pass re-judges only the fields in
 * the review queues marked partly supported, adding the pages linked from each
 * service's cited pages, one hop out.
 *
 * Linked pages are filtered before any model sees them. A cited page links to
 * about 9 others on average (135 at most), and sending them all would cost
 * several times the original run. Instead the distinctive terms of each
 * unsupported claim (figures, and the content words of the claim and of the
 * reviewer's note about what was missing) are searched for in every linked
 * page, and only the best two or three go to the model. A service with no
 * linked page that scores is not sent at all.
 *
 * The guards are unchanged: every quote must be found in the page it names or
 * the judgement is discarded, and nothing is written back to graph-data.ts.
 * The model is told a linked page may describe a different service and may
 * only be used for a claim that is about this one.
 *
 * With --batch, requests go through the Message Batches API (half price,
 * results within 24 hours, usually much sooner). The prepared sources are
 * cached in .cache/ so a batch can be collected later with --resume <id>.
 *
 * Usage:
 *   npx tsx scripts/widen-sources.ts --dry-run          # selection and token estimate, no calls
 *   npx tsx scripts/widen-sources.ts --only dwp-pip --verbose
 *   npx tsx scripts/widen-sources.ts --batch --write
 *   npx tsx scripts/widen-sources.ts --resume msgbatch_... --write
 *   npx tsx scripts/widen-sources.ts --resume msgbatch_... --direct --write   # cached inputs, direct calls
 *   npx tsx scripts/widen-sources.ts --fields dvla-sorn#desc,dwp-pip#eligibility.criteria.2 --write
 *   npx tsx scripts/widen-sources.ts --from-proposals --split-all --write   # re-verify applied fixes
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { NODES, type ServiceNode } from '../src/graph-data.js';
import { loadProvenance, saveProvenance } from '../src/provenance.js';
import { gatherSources } from './lib/sources.js';
import {
  buildPrompt, requestParams, readResponse, recordField, AUTH_WORDS, METHOD_WORDS,
  type FieldToJudge, type Source, type ReviewItem, type ProseResponse,
} from './lib/judge-prose.js';

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const WRITE = process.argv.includes('--write');
const DRY = process.argv.includes('--dry-run');
const BATCH = process.argv.includes('--batch');
const VERBOSE = process.argv.includes('--verbose');
const RESUME = arg('--resume');
// With --resume, call the API directly on the cached inputs instead of collecting the batch
// (for a batch that was cancelled or stalled).
const DIRECT = process.argv.includes('--direct');
const ONLY = arg('--only')?.split(',');
// Re-judge named fields (id#path) whatever the queues say: for re-verifying a
// field after correcting it, with the same linked pages the widening used.
// --from-proposals: every fix apply-fixes.ts applied that still awaits re-verification.
const FIELDS = process.argv.includes('--from-proposals')
  ? (JSON.parse(readFileSync('data/fix-proposals.json', 'utf-8')).proposals as { id: string; path: string; applied?: string; action: string }[])
      .filter(p => p.applied && p.action === 'rewrite')
      .map(p => `${p.id}#${p.path}`)
  : arg('--fields')?.split(',');
// Judge every field claim by claim, criteria and single items included, so no
// field can be confirmed on one quote that covers only part of it.
const SPLIT_ALL = process.argv.includes('--split-all');
const MODEL = arg('--model') ?? 'claude-opus-5-5';
const MAX_LINKED = 3;
const LINKED_CHARS = 20_000;
const MIN_SCORE = 3;
const PROSE_QUEUE = 'data/review-queue-prose.json';
const CRITERIA_QUEUE = 'data/review-queue-criteria.json';
const CACHE_DIR = '.cache';

// ─── WHAT TO RE-JUDGE ───────────────────────────────────────────────────────

interface CriteriaItem {
  id: string; name: string; criterion: number; factor: string; graph: string;
  verdict: string; note: string; quote: string | null; url: string | null;
}
const proseQueue = JSON.parse(readFileSync(PROSE_QUEUE, 'utf-8'));
const criteriaQueue = JSON.parse(readFileSync(CRITERIA_QUEUE, 'utf-8'));

interface Target { field: FieldToJudge; terms: string }
const targets = new Map<string, Target[]>();
const add = (id: string, t: Target) => targets.set(id, [...(targets.get(id) ?? []), t]);

function proseField(n: ServiceNode, path: string): FieldToJudge | null {
  const e = n.eligibility;
  if (path === 'desc') return { key: 'desc', path, text: n.desc, split: true };
  if (path === 'eligibility.summary') return { key: 'summary', path, text: e.summary, split: true };
  if (path === 'agentInteraction.methods' && n.agentInteraction) {
    return { key: 'methods', path, split: true, text: n.agentInteraction.methods.map(m => METHOD_WORDS[m] ?? m).join('. ') + '.' };
  }
  if (path === 'agentInteraction.authRequired' && n.agentInteraction) {
    return { key: 'auth', path, split: false, text: AUTH_WORDS[n.agentInteraction.authRequired] ?? n.agentInteraction.authRequired };
  }
  const m = path.match(/^eligibility\.(autoQualifiers|exclusions|evidenceRequired)\.(\d+)$/);
  if (m) {
    const text = (e[m[1] as 'autoQualifiers'] ?? [])[Number(m[2])];
    const short = { autoQualifiers: 'qualifier', exclusions: 'exclusion', evidenceRequired: 'evidence' }[m[1]]!;
    return text ? { key: `${short}_${m[2]}`, path, text, split: false } : null;
  }
  return null;
}

if (FIELDS) {
  for (const spec of FIELDS) {
    const [id, path] = spec.split('#');
    const n = NODES[id];
    if (!n) throw new Error(`Unknown service ${id}`);
    const m = path.match(/^eligibility\.criteria\.(\d+)$/);
    const f = m
      ? { key: `criterion_${m[1]}`, path, text: n.eligibility.criteria[Number(m[1])]?.description, split: false }
      : proseField(n, path);
    if (!f?.text) throw new Error(`No field ${spec}`);
    add(id, { field: { ...(f as FieldToJudge), split: SPLIT_ALL || (f as FieldToJudge).split }, terms: f.text });
  }
}
for (const r of FIELDS ? [] : proseQueue.review as ReviewItem[]) {
  if (r.verdict !== 'partly_supported' || (ONLY && !ONLY.includes(r.id))) continue;
  const n = NODES[r.id];
  const f = n && proseField(n, r.field);
  if (!f || f.text !== r.graph) continue;           // field changed since it was queued
  add(r.id, { field: f, terms: r.problems.map(p => `${p.claim} ${p.note}`).join(' ') });
}
for (const r of FIELDS ? [] : criteriaQueue.review as CriteriaItem[]) {
  if (r.verdict !== 'partly_supported' || (ONLY && !ONLY.includes(r.id))) continue;
  const n = NODES[r.id];
  const c = n?.eligibility.criteria[r.criterion];
  if (!c || c.description !== r.graph) continue;
  add(r.id, {
    field: { key: `criterion_${r.criterion}`, path: `eligibility.criteria.${r.criterion}`, text: c.description, split: false },
    terms: `${r.graph} ${r.note}`,
  });
}

interface Prepared { id: string; fields: FieldToJudge[]; sources: Source[] }

async function prepare(id: string, list: Target[]): Promise<Prepared | null> {
  const sources = await gatherSources(NODES[id], list.map(x => x.terms).join(' '), {
    maxLinked: MAX_LINKED, linkedChars: LINKED_CHARS, minScore: MIN_SCORE, requireLinked: !FIELDS,
  });
  return sources ? { id, fields: list.map(x => x.field), sources } : null;
}

// ─── RUN ────────────────────────────────────────────────────────────────────

if (!DRY && !process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. This pass needs it (use --dry-run to preview without it).');
  process.exit(2);
}
const client = new Anthropic({ maxRetries: 4 });
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

let prepared: Prepared[] = [];
let batchId = RESUME ?? null;

if (RESUME) {
  prepared = JSON.parse(readFileSync(`${CACHE_DIR}/widen-${RESUME}.json`, 'utf-8'));
  console.error(`Resuming batch ${RESUME} (${prepared.length} services)`);
} else {
  const ids = [...targets.keys()];
  console.error(`Preparing ${ids.length} services with partly supported fields...`);
  let i = 0;
  for (const id of ids) {
    const p = await prepare(id, targets.get(id)!);
    if (p) prepared.push(p);
    if (++i % 25 === 0) console.error(`  ${i}/${ids.length} prepared, ${prepared.length} with a scoring linked page`);
  }
}

const totalFields = [...targets.values()].reduce((a, l) => a + l.length, 0);
const sentFields = prepared.reduce((a, p) => a + p.fields.length, 0);
const inputChars = prepared.reduce((a, p) => a + buildPrompt(NODES[p.id].name, p.fields, p.sources).length, 0);
console.error(`\n${prepared.length} of ${targets.size} services have a linked page worth sending (${sentFields} of ${totalFields} fields).`);
console.error(`Estimated input: ~${Math.round(inputChars / 4 / 1000)}k tokens (${Math.round(inputChars / 4 / Math.max(1, prepared.length))} per call).`);
if (DRY) process.exit(0);

// Collect responses, directly or through a batch.
const responses = new Map<string, ProseResponse>();
const failures: string[] = [];

if ((BATCH || RESUME) && !DIRECT) {
  if (!batchId) {
    const batch = await client.messages.batches.create({
      requests: prepared.map(p => ({ custom_id: p.id, params: requestParams(MODEL, buildPrompt(NODES[p.id].name, p.fields, p.sources)) })),
    });
    batchId = batch.id;
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR);
    writeFileSync(`${CACHE_DIR}/widen-${batchId}.json`, JSON.stringify(prepared));
    console.error(`Submitted batch ${batchId}. If this process stops, collect it with --resume ${batchId}`);
  }
  // The batch runs on Anthropic's side whatever happens here, so a failed status
  // check is logged and retried rather than ending the run. After an hour of
  // consecutive failures, stop; --resume collects the batch later.
  let failedChecks = 0;
  for (;;) {
    try {
      const b = await client.messages.batches.retrieve(batchId);
      failedChecks = 0;
      if (b.processing_status === 'ended') break;
      console.error(`  batch ${b.processing_status}: ${b.request_counts.succeeded} done, ${b.request_counts.processing} processing`);
    } catch (e: any) {
      failedChecks++;
      console.error(`  status check failed (${e.status ?? ''} ${e.message ?? e}); retrying (${failedChecks}/60)`);
      if (failedChecks >= 60) {
        console.error(`Giving up for now. The batch is unaffected; collect it with --resume ${batchId}`);
        process.exit(1);
      }
    }
    await sleep(60_000);
  }
  for await (const r of await client.messages.batches.results(batchId)) {
    if (r.result.type !== 'succeeded') { failures.push(`${r.custom_id}: ${r.result.type}`); continue; }
    try { responses.set(r.custom_id, readResponse(r.result.message)); } catch (e: any) { failures.push(`${r.custom_id}: ${e.message}`); }
  }
} else {
  const queue = [...prepared];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const p = queue.shift()!;
      try {
        responses.set(p.id, readResponse(await client.messages.create(requestParams(MODEL, buildPrompt(NODES[p.id].name, p.fields, p.sources)))));
      } catch (e: any) { failures.push(`${p.id}: ${e.message}`); }
    }
  }));
}

// ─── RECORD ─────────────────────────────────────────────────────────────────

const store = loadProvenance();
const now = new Date().toISOString();
const counts: Record<string, number> = {};
let fromLinked = 0;
const newProse = new Map<string, ReviewItem | null>();          // key id#path -> item, or null when resolved
const newCriteria = new Map<string, ReviewItem | null>();
const upgraded: { id: string; path: string; via: string[] }[] = [];

for (const p of prepared) {
  const out = responses.get(p.id);
  if (!out) continue;
  const n = NODES[p.id];
  for (const f of p.fields) {
    const res = recordField(store, n, f, out.fields.find(x => x.key === f.key), p.sources, now);
    counts[res.status] = (counts[res.status] ?? 0) + 1;
    fromLinked += res.linkedQuotes;
    if (res.status === 'confirmed') {
      const rec = store.fields[`${p.id}#${f.path}`];
      const urls = [rec.sourceUrl, ...(rec.additionalQuotes ?? []).map(q => q.url)];
      upgraded.push({ id: p.id, path: f.path, via: [...new Set(urls.filter(u => p.sources.find(s => s.url === u)?.linked))] });
    }
    if (res.status === 'missing' || res.status === 'fabricated') continue;   // leave the old queue entry
    const target = f.path.startsWith('eligibility.criteria.') ? newCriteria : newProse;
    target.set(`${p.id}#${f.path}`, res.review ?? null);
  }
}

if (WRITE) {
  saveProvenance(store);
  // Replace queue entries field by field: other fields of the same service keep theirs.
  proseQueue.review = (proseQueue.review as ReviewItem[])
    .filter(r => !newProse.has(`${r.id}#${r.field}`))
    .concat([...newProse.values()].filter((r): r is ReviewItem => r !== null));
  proseQueue.generatedAt = now;
  writeFileSync(PROSE_QUEUE, JSON.stringify(proseQueue, null, 2) + '\n');

  criteriaQueue.review = (criteriaQueue.review as CriteriaItem[])
    .filter(r => !newCriteria.has(`${r.id}#eligibility.criteria.${r.criterion}`))
    .concat([...newCriteria.entries()].flatMap(([key, r]) => {
      if (!r) return [];
      const i = Number(key.split('.').pop());
      const c = NODES[r.id].eligibility.criteria[i];
      const p = r.problems[0];
      return [{ id: r.id, name: r.name, criterion: i, factor: c.factor, graph: c.description, verdict: r.verdict, note: p?.note ?? '', quote: p?.quote ?? null, url: null }];
    }));
  criteriaQueue.generatedAt = now;
  writeFileSync(CRITERIA_QUEUE, JSON.stringify(criteriaQueue, null, 2) + '\n');
  console.error('Wrote provenance and both review queues');
}

// ─── REPORT ─────────────────────────────────────────────────────────────────

console.log('─── WIDENED SOURCES (partly supported fields, linked pages) ────');
console.log(`Services sent:      ${prepared.length}   responses: ${responses.size}   failed: ${failures.length}`);
for (const k of ['confirmed', 'partly_supported', 'contradicted', 'not_stated', 'fabricated', 'missing']) {
  console.log(`${k.padEnd(20)}${counts[k] ?? 0}`);
}
console.log(`Quotes taken from linked pages: ${fromLinked}`);
if (failures.length) console.log(`\nFailures:\n  ${failures.join('\n  ')}`);
if (VERBOSE) {
  console.log(`\n── NOW CONFIRMED (${upgraded.length}) ──`);
  for (const u of upgraded) console.log(`  ${u.id}  ${u.path}${u.via.length ? `  via ${u.via.join(', ')}` : ''}`);
}
const contradicted = [...newProse.values(), ...newCriteria.values()].filter(r => r?.verdict === 'contradicted') as ReviewItem[];
if (contradicted.length) {
  console.log(`\n── NEWLY CONTRADICTED (${contradicted.length}) ──`);
  for (const r of contradicted) {
    console.log(`  ${r.id}  ${r.field}`);
    for (const p of r.problems.filter(x => x.verdict === 'contradicted')) console.log(`      ${p.note}`);
  }
}
