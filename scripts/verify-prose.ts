/**
 * verify-prose.ts — Check the factual prose around the data against its source
 *
 * The rates, rules and criteria now have sources; the sentences that describe
 * them did not. A description can hold an age limit, a deadline and a fee in
 * one line, and every stale figure found in September 2026 had been left
 * behind in exactly this kind of prose. check-consistency.ts catches figures;
 * this pass checks the words around them.
 *
 * Fields, per service:
 *   desc, eligibility.summary              split into single claims, each judged
 *   eligibility.autoQualifiers.N           one item, judged as a whole
 *   eligibility.exclusions.N
 *   eligibility.evidenceRequired.N
 *   agentInteraction.methods               one claim per method ("apply by post")
 *   agentInteraction.authRequired          the sign-in the page names, if any
 *
 * The method is verify-criteria.ts's: the model sees the cited pages and is
 * asked whether they say this, never whether it is true; every quote must be
 * found in the source or the judgement is discarded; nothing is written back
 * to graph-data.ts. A field is confirmed only when every claim in it is
 * supported by a verified quote. The first quote is stored as sourceQuote and
 * the rest as additionalQuotes, so the weekly quote check covers all of them.
 *
 * For methods, the model also lists the ways to apply the page offers, so a
 * method the graph leaves out shows up in the review queue as well as one it
 * wrongly includes.
 *
 * Contradicted and partly supported fields go to data/review-queue-prose.json.
 * Partial runs (--only, --limit) merge into it rather than replace it.
 *
 * Requires ANTHROPIC_API_KEY.
 *
 * Usage:
 *   npx tsx scripts/verify-prose.ts --only hmpo-passport,dwp-pip --verbose
 *   npx tsx scripts/verify-prose.ts --write
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'node:fs';
import { NODES, type ServiceNode } from '../src/graph-data.js';
import { loadProvenance, saveProvenance } from '../src/provenance.js';
import { pageText } from './lib/page-text.js';
import {
  METHOD_WORDS, AUTH_WORDS, buildPrompt, requestParams, readResponse, recordField,
  type FieldToJudge, type ProseResponse, type ReviewItem,
} from './lib/judge-prose.js';

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const WRITE = process.argv.includes('--write');
const VERBOSE = process.argv.includes('--verbose');
const LIMIT = Number(arg('--limit') ?? Infinity);
const ONLY = arg('--only')?.split(',');
// Same model as verify-criteria.ts, for the same reason: in a side-by-side
// trial Sonnet flagged restatements as partial and missed real changes.
const MODEL = arg('--model') ?? 'claude-opus-5-5';
const CONCURRENCY = 4;
const QUEUE_PATH = 'data/review-queue-prose.json';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. This pass needs it.');
  process.exit(2);
}

const client = new Anthropic({ maxRetries: 4 });

/** The prose fields to judge for one service, each with a short key the model echoes back. */
function fieldsFor(n: ServiceNode): FieldToJudge[] {
  const e = n.eligibility;
  const out: FieldToJudge[] = [
    { key: 'desc', path: 'desc', text: n.desc, split: true },
    { key: 'summary', path: 'eligibility.summary', text: e.summary, split: true },
  ];
  (e.autoQualifiers ?? []).forEach((t, i) => out.push({ key: `qualifier_${i}`, path: `eligibility.autoQualifiers.${i}`, text: t, split: false }));
  (e.exclusions ?? []).forEach((t, i) => out.push({ key: `exclusion_${i}`, path: `eligibility.exclusions.${i}`, text: t, split: false }));
  (e.evidenceRequired ?? []).forEach((t, i) => out.push({ key: `evidence_${i}`, path: `eligibility.evidenceRequired.${i}`, text: t, split: false }));
  const ai = n.agentInteraction;
  if (ai) {
    out.push({
      key: 'methods', path: 'agentInteraction.methods', split: true,
      text: ai.methods.map(m => METHOD_WORDS[m] ?? m).join('. ') + '.',
    });
    out.push({ key: 'auth', path: 'agentInteraction.authRequired', split: false, text: AUTH_WORDS[ai.authRequired] ?? ai.authRequired });
  }
  return out.filter(f => f.text && f.text.trim());
}

async function judge(node: ServiceNode, fields: FieldToJudge[], sources: { url: string; text: string }[]): Promise<ProseResponse> {
  return readResponse(await client.messages.create(requestParams(MODEL, buildPrompt(node.name, fields, sources))));
}

// ─── RUN ────────────────────────────────────────────────────────────────────

const nodes = Object.values(NODES)
  .filter(n => !ONLY || ONLY.includes(n.id))
  .slice(0, LIMIT);
const store = loadProvenance();
const now = new Date().toISOString();

const counts: Record<string, number> = {};
const bump = (k: string) => { counts[k] = (counts[k] ?? 0) + 1; };

const review: ReviewItem[] = [];
const methodGaps: { id: string; graph: string[]; page: string[] }[] = [];
const authGaps: { id: string; graph: string; page: string | null }[] = [];
let done = 0;
let unreachable = 0;

console.error(`Judging prose for ${nodes.length} services with ${MODEL}...`);

async function processNode(n: ServiceNode) {
  const urls = [...new Set(
    [n.govuk_url, n.financialData?.source, ...(n.eligibility.sources ?? [])].filter(Boolean) as string[],
  )];
  const sources: { url: string; text: string }[] = [];
  for (const url of urls) {
    const text = await pageText(url);
    if (text && text.length > 200) sources.push({ url, text });
  }
  if (!sources.length) { unreachable++; return; }

  const fields = fieldsFor(n);
  let out: ProseResponse;
  try {
    out = await judge(n, fields, sources);
  } catch (err: any) {
    console.error(`  ${n.id}: API error — ${err.message}`);
    unreachable++;
    return;
  }

  for (const f of fields) {
    const res = recordField(store, n, f, out.fields.find(x => x.key === f.key), sources, now);
    bump(res.status);
    if (res.review) review.push(res.review);
  }

  // Methods the page offers that the graph leaves out, and sign-in mismatches.
  if (n.agentInteraction) {
    const graph = n.agentInteraction.methods;
    const page = out.methods_on_page ?? [];
    if (page.length && (page.some(m => !graph.includes(m as any)) || graph.some(m => !page.includes(m)))) {
      methodGaps.push({ id: n.id, graph, page });
    }
    const auth = n.agentInteraction.authRequired;
    const named = (out.sign_in_on_page ?? '').toLowerCase();
    const matches =
      (auth === 'none' && !named) ||
      (auth === 'government-gateway' && named.includes('gateway')) ||
      (auth === 'gov-uk-one-login' && named.includes('one login')) ||
      (auth === 'nhs-login' && named.includes('nhs')) ||
      (auth === 'companies-house' && named.includes('companies house')) ||
      (auth === 'gov-uk-verify' && named.includes('verify'));
    if (!matches) authGaps.push({ id: n.id, graph: auth, page: out.sign_in_on_page });
  }

  done++;
  if (done % 20 === 0) console.error(`  ${done}/${nodes.length}`);
}

const queue = [...nodes];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) await processNode(queue.shift()!);
}));

if (WRITE) {
  saveProvenance(store);
  const judged = new Set(nodes.map(n => n.id));
  let kept: { review: ReviewItem[]; methodGaps: typeof methodGaps; authGaps: typeof authGaps } =
    { review: [], methodGaps: [], authGaps: [] };
  try {
    const prev = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
    kept = {
      review: prev.review.filter((r: ReviewItem) => !judged.has(r.id)),
      methodGaps: prev.methodGaps.filter((r: { id: string }) => !judged.has(r.id)),
      authGaps: prev.authGaps.filter((r: { id: string }) => !judged.has(r.id)),
    };
  } catch { /* no queue yet */ }
  const byVerdict = (a: ReviewItem, b: ReviewItem) =>
    a.verdict === b.verdict ? a.id.localeCompare(b.id) : a.verdict === 'contradicted' ? -1 : 1;
  writeFileSync(QUEUE_PATH, JSON.stringify({
    generatedAt: now, model: MODEL,
    review: [...kept.review, ...review].sort(byVerdict),
    methodGaps: [...kept.methodGaps, ...methodGaps].sort((a, b) => a.id.localeCompare(b.id)),
    authGaps: [...kept.authGaps, ...authGaps].sort((a, b) => a.id.localeCompare(b.id)),
  }, null, 2) + '\n');
  console.error(`Wrote provenance and ${QUEUE_PATH}`);
}

// ─── REPORT ─────────────────────────────────────────────────────────────────

console.log('─── PROSE VERIFICATION (claims, locate and quote) ──────────────');
console.log(`Services judged:    ${done}   (unreachable or failed: ${unreachable})`);
for (const k of ['confirmed', 'partly_supported', 'contradicted', 'not_stated', 'fabricated', 'missing']) {
  console.log(`${k.padEnd(20)}${counts[k] ?? 0}`);
}
console.log(`Method mismatches:  ${methodGaps.length}`);
console.log(`Sign-in mismatches: ${authGaps.length}`);

const shown = VERBOSE ? review : review.filter(r => r.verdict === 'contradicted');
if (shown.length) {
  console.log(`\n── ${VERBOSE ? 'CONTRADICTED AND PARTLY SUPPORTED' : 'CONTRADICTED'} (${shown.length}) ──`);
  for (const r of shown) {
    console.log(`  ${r.id}  ${r.field}  ${r.verdict}`);
    for (const p of r.problems) console.log(`      ${p.verdict}: ${p.note}${p.quote ? `\n        "${p.quote.slice(0, 150)}"` : ''}`);
  }
}
if (VERBOSE || methodGaps.length <= 30) {
  console.log(`\n── METHODS: graph vs page (${methodGaps.length}) ──`);
  for (const g of methodGaps) console.log(`  ${g.id.padEnd(36)} graph [${g.graph.join(', ')}]  page [${g.page.join(', ')}]`);
}
console.log(`\n── SIGN-IN: graph vs page (${authGaps.length}) ──`);
for (const g of authGaps) console.log(`  ${g.id.padEnd(36)} graph ${g.graph.padEnd(20)} page ${g.page ?? '(none named)'}`);
