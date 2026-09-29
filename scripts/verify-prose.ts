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
import {
  loadProvenance, saveProvenance, provenanceKey, hashValue, normaliseForMatch, getFieldValue,
} from '../src/provenance.js';
import { pageText } from './lib/page-text.js';

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
const PER_SOURCE_CHARS = 30_000;
const QUEUE_PATH = 'data/review-queue-prose.json';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. This pass needs it.');
  process.exit(2);
}

const client = new Anthropic({ maxRetries: 4 });

type Verdict = 'supported' | 'partly_supported' | 'contradicted' | 'not_stated';

const METHOD_WORDS: Record<string, string> = {
  online: 'You can apply or do this online',
  phone: 'You can apply or do this by phone',
  post: 'You can apply or do this by post',
  'in-person': 'You can apply or do this in person',
};
const AUTH_WORDS: Record<string, string> = {
  'government-gateway': 'Applying online needs a Government Gateway user ID (sign-in)',
  'gov-uk-one-login': 'Applying online needs a GOV.UK One Login',
  'gov-uk-verify': 'Applying online needs GOV.UK Verify',
  'nhs-login': 'Applying online needs an NHS login',
  'companies-house': 'Applying online needs a Companies House account or sign-in',
  none: 'No account or sign-in is needed to apply',
};

interface FieldToJudge { key: string; path: string; text: string; split: boolean }

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

interface Claim { claim: string; verdict: Verdict; quote: string | null; source: number | null; note: string }
interface FieldResult { key: string; claims: Claim[] }
interface Response { fields: FieldResult[]; methods_on_page: string[]; sign_in_on_page: string | null }

const TOOL: Anthropic.Tool = {
  name: 'report_prose',
  description: 'Report, for each field, its claims and whether the source text states each one, with the span relied on.',
  input_schema: {
    type: 'object',
    properties: {
      fields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'The field key exactly as given.' },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  claim:   { type: 'string', description: 'One factual statement from the field, in its own words.' },
                  verdict: { type: 'string', enum: ['supported', 'partly_supported', 'contradicted', 'not_stated'] },
                  quote: {
                    type: ['string', 'null'],
                    description: 'The single shortest span, under 300 characters, that best supports or contradicts the claim. Copied character for character from the source text. Null only for not_stated.',
                  },
                  source: { type: ['integer', 'null'], description: 'Which SOURCE the quote comes from.' },
                  note: { type: 'string', description: 'One sentence. For anything other than supported, say exactly what differs or is missing.' },
                },
                required: ['claim', 'verdict', 'quote', 'source', 'note'],
              },
            },
          },
          required: ['key', 'claims'],
        },
      },
      methods_on_page: {
        type: 'array',
        items: { type: 'string', enum: ['online', 'phone', 'post', 'in-person'] },
        description: 'Every way the source text says you can apply for or do this service.',
      },
      sign_in_on_page: {
        type: ['string', 'null'],
        description: 'The account or sign-in the source text says is needed to apply online (for example "Government Gateway", "GOV.UK One Login"), or null if it names none.',
      },
    },
    required: ['fields', 'methods_on_page', 'sign_in_on_page'],
  },
};

async function judge(node: ServiceNode, fields: FieldToJudge[], sources: { url: string; text: string }[]): Promise<Response> {
  const listing = fields
    .map(f => `[${f.key}]${f.split ? ' (split into claims)' : ''} ${f.text}`)
    .join('\n');
  const texts = sources
    .map((s, i) => `--- SOURCE ${i}: ${s.url} ---\n${s.text.slice(0, PER_SOURCE_CHARS)}`)
    .join('\n\n');

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    // Not forced: some current models reject a forced tool_choice.
    tool_choice: { type: 'auto' },
    tools: [TOOL],
    messages: [{
      role: 'user',
      content:
        `A service graph describes the UK government service "${node.name}" with the fields below. ` +
        `Judge them against the source text that follows, and nothing else.\n\n` +
        `Do not use anything you know about UK government services. The question is whether this text says it, ` +
        `not whether it is true.\n\n` +
        `For a field marked "(split into claims)", split it into single factual statements and judge each. ` +
        `Together the claims must cover every factual statement in the field: do not skip one because it is ` +
        `hard to judge. For any other field, return it as one claim.\n\n` +
        `- supported: the text states it, including every figure, age, date and condition it names. Paraphrase ` +
        `is fine, and so is anything the text plainly implies.\n` +
        `- partly_supported: the text states some of it, but a figure, condition or detail is not in the text.\n` +
        `- contradicted: the claim and the text cannot both be true: a different figure, a route or method the ` +
        `text says does not exist, a sign-in the text names differently. A detail the text leaves out is ` +
        `partly_supported, not contradicted.\n` +
        `- not_stated: the text does not address it.\n\n` +
        `Also list every way the text says you can apply (methods_on_page), and the sign-in it names for ` +
        `applying online, if any (sign_in_on_page).\n\n` +
        `The verdict and the note must agree. Quotes must be copied exactly from the source text, not ` +
        `paraphrased or stitched together.\n\n` +
        `Report by calling report_prose once, covering every field.\n\n` +
        `FIELDS\n${listing}\n\n${texts}`,
    }],
  });

  const block = res.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
  if (!block) throw new Error('model did not call report_prose');
  return block.input as Response;
}

// ─── RUN ────────────────────────────────────────────────────────────────────

const nodes = Object.values(NODES)
  .filter(n => !ONLY || ONLY.includes(n.id))
  .slice(0, LIMIT);
const store = loadProvenance();
const now = new Date().toISOString();

type FieldStatus = 'confirmed' | Verdict | 'fabricated';
const counts: Record<string, number> = {};
const bump = (k: string) => { counts[k] = (counts[k] ?? 0) + 1; };

interface ReviewItem {
  id: string; name: string; field: string; graph: string; verdict: Verdict;
  problems: { claim: string; verdict: Verdict; note: string; quote: string | null }[];
}
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
  let out: Response;
  try {
    out = await judge(n, fields, sources);
  } catch (err: any) {
    console.error(`  ${n.id}: API error — ${err.message}`);
    unreachable++;
    return;
  }

  for (const f of fields) {
    const r = out.fields.find(x => x.key === f.key);
    if (!r || !r.claims?.length) { bump('missing'); continue; }

    // Verify every quote against the source it names, or any source.
    const checked = r.claims.map(c => {
      if (!c.quote) return { ...c, url: null as string | null, ok: c.verdict === 'not_stated' };
      const needle = normaliseForMatch(c.quote);
      const claimed = c.source != null ? sources[c.source] : undefined;
      const hit = [claimed, ...sources].find(s => s && normaliseForMatch(s.text).includes(needle));
      return { ...c, url: hit?.url ?? null, ok: Boolean(hit) };
    });

    const base = {
      valueHash: hashValue(getFieldValue(n, f.path)),
      valueSeen: f.text.slice(0, 200),
      method: 'llm-extraction' as const,
      verifiedAt: now,
    };
    const key = provenanceKey(n.id, f.path);

    let status: FieldStatus;
    if (checked.some(c => c.quote && !c.ok)) status = 'fabricated';
    else if (checked.every(c => c.verdict === 'supported')) status = 'confirmed';
    else if (checked.some(c => c.verdict === 'contradicted')) status = 'contradicted';
    else if (checked.some(c => c.verdict === 'supported' || c.verdict === 'partly_supported')) status = 'partly_supported';
    else status = 'not_stated';
    bump(status);

    // Quotes for every claim the source supports, kept even when the field as
    // a whole is not confirmed, so the evidence for those claims stays visible.
    const good = checked.filter(c => c.verdict === 'supported' && c.ok && c.quote && c.url);
    const claims = { supported: good.length, total: checked.length };
    const quotes = good.length ? {
      sourceUrl: good[0].url!, sourceQuote: good[0].quote!,
      ...(good.length > 1 ? { additionalQuotes: good.slice(1).map(c => ({ quote: c.quote!, url: c.url! })) } : {}),
    } : null;

    if (status === 'confirmed') {
      store.fields[key] = { ...base, ...quotes!, confidence: 'confirmed', claims };
      continue;
    }

    const problems = checked.filter(c => c.verdict !== 'supported' || !c.ok);
    store.fields[key] = {
      ...base,
      sourceUrl: quotes?.sourceUrl ?? checked.find(c => c.url)?.url ?? sources[0].url,
      sourceQuote: status === 'fabricated' ? '' : quotes?.sourceQuote ?? '',
      ...(status !== 'fabricated' && quotes?.additionalQuotes ? { additionalQuotes: quotes.additionalQuotes } : {}),
      claims,
      confidence: 'unverified',
      rationale: status === 'fabricated'
        ? 'A quote the model gave is not in the source text, so the judgement was discarded.'
        : problems.map(c => `${c.verdict.replace('_', ' ')}: ${c.note}`).join(' '),
    };
    if (status === 'contradicted' || status === 'partly_supported') {
      review.push({
        id: n.id, name: n.name, field: f.path, graph: f.text, verdict: status,
        problems: problems.map(c => ({ claim: c.claim, verdict: c.verdict, note: c.note, quote: c.quote })),
      });
    }
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
