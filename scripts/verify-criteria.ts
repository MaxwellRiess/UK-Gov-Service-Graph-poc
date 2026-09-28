/**
 * verify-criteria.ts — Check eligibility criteria text against its source
 *
 * Criteria are prose ("Receiving Universal Credit, or income-based JSA..."), so
 * there is no literal to search for. This pass uses the same method as
 * verify-tier2-llm.ts for deadlines: give a model the page text, ask it to
 * judge each criterion against that text only, and return the span it relied
 * on. The three rules from that script hold here too:
 *
 *   1. Locate, don't recall. The model sees the cited pages and is told to
 *      ignore anything it knows. It is asked whether the text says this, not
 *      whether it is true.
 *
 *   2. Every quote is checked mechanically. A quote not found in the supplied
 *      text is discarded and the criterion stays unconfirmed, however
 *      confident the verdict.
 *
 *   3. Nothing is applied. Criteria the text contradicts or only partly
 *      supports go to data/review-queue-criteria.json for a person. This
 *      script never edits graph-data.ts.
 *
 * Verdicts:
 *   supported         the text states the criterion's substance, figures included
 *   partly_supported  some of it is stated; a detail, figure or route is not
 *   contradicted      the text says something incompatible with it
 *   not_stated        the text does not address it
 *
 * Only `supported` with a verified quote becomes `confirmed`. Everything else
 * is recorded `unverified` with the model's one-line reason, so an agent sees
 * why.
 *
 * Sources: govuk_url, financialData.source and eligibility.sources, supplied
 * together so a criterion stated on a subpage can still be found.
 *
 * Requires ANTHROPIC_API_KEY.
 *
 * Usage:
 *   npx tsx scripts/verify-criteria.ts --limit 5              # report only
 *   npx tsx scripts/verify-criteria.ts --only dwp-pip,hmrc-smp --verbose   # show partly supported too
 *   npx tsx scripts/verify-criteria.ts --write                # all services
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'node:fs';
import { NODES, type ServiceNode } from '../src/graph-data.js';
import {
  loadProvenance, saveProvenance, provenanceKey, hashValue, normaliseForMatch,
} from '../src/provenance.js';
import { pageText } from './lib/page-text.js';

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const WRITE = process.argv.includes('--write');
const LIMIT = Number(arg('--limit') ?? Infinity);
const ONLY = arg('--only')?.split(',');
// Opus rather than Sonnet: in a side-by-side trial Sonnet flagged restatements as
// partial and missed that PIP no longer takes new claims in Scotland.
const MODEL = arg('--model') ?? 'claude-opus-5-5';
const VERBOSE = process.argv.includes('--verbose');
const CONCURRENCY = 4;
const PER_SOURCE_CHARS = 30_000;
const QUEUE_PATH = 'data/review-queue-criteria.json';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. This pass needs it.');
  process.exit(2);
}

const client = new Anthropic({ maxRetries: 4 });

type Verdict = 'supported' | 'partly_supported' | 'contradicted' | 'not_stated';

interface Judgement {
  index:   number;
  verdict: Verdict;
  quote:   string | null;
  source:  number | null;
  note:    string;
}

const TOOL: Anthropic.Tool = {
  name: 'report_criteria',
  description: 'Report, for each numbered criterion, whether the supplied source text states it, and the span relied on.',
  input_schema: {
    type: 'object',
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            index:   { type: 'integer', description: 'The criterion number as given.' },
            verdict: { type: 'string', enum: ['supported', 'partly_supported', 'contradicted', 'not_stated'] },
            quote: {
              type: ['string', 'null'],
              description: 'The single shortest span, under 300 characters, that best supports or contradicts the criterion. Copied character for character from the source text. Null only for not_stated.',
            },
            source: { type: ['integer', 'null'], description: 'Which SOURCE the quote comes from.' },
            note: {
              type: 'string',
              description: 'One sentence. For anything other than supported, say exactly what differs or is missing.',
            },
          },
          required: ['index', 'verdict', 'quote', 'source', 'note'],
        },
      },
    },
    required: ['results'],
  },
};

async function judge(node: ServiceNode, sources: { url: string; text: string }[]): Promise<Judgement[]> {
  const criteria = node.eligibility.criteria
    .map((c, i) => `${i}. [${c.factor}] ${c.description}`)
    .join('\n');
  const texts = sources
    .map((s, i) => `--- SOURCE ${i}: ${s.url} ---\n${s.text.slice(0, PER_SOURCE_CHARS)}`)
    .join('\n\n');

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    tools: [TOOL],
    // Not forced: some current models reject a forced tool_choice. The prompt
    // asks for the tool, and a response without it counts as a failure.
    tool_choice: { type: 'auto' },
    messages: [{
      role: 'user',
      content:
        `A service graph describes the UK government service "${node.name}" with the eligibility criteria below. ` +
        `Judge each criterion against the source text that follows, and nothing else.\n\n` +
        `Do not use anything you know about UK government services. The question is whether this text says it, ` +
        `not whether it is true.\n\n` +
        `- supported: the text states the criterion's substance, including every figure, age, threshold and ` +
        `qualifying route it names. Paraphrase is fine, and so is anything the text plainly implies: "daily ` +
        `living component" with no rate given supports "either rate". Ignore labels that only date the ` +
        `criterion, such as "(2026-27)".\n` +
        `- partly_supported: the text states some of it, but a figure, condition or route in the criterion is ` +
        `not in the text.\n` +
        `- contradicted: the criterion and the text cannot both be true, such as a different figure or age, or ` +
        `a route the text says no longer applies. A detail the text leaves out is partly_supported, not ` +
        `contradicted.\n` +
        `- not_stated: the text does not address it.\n\n` +
        `The verdict and the note must agree. ` +
        `Quotes must be copied exactly from the source text, not paraphrased or stitched together.\n\n` +
        `Report your judgements by calling report_criteria once, covering every criterion.\n\n` +
        `CRITERIA\n${criteria}\n\n${texts}`,
    }],
  });

  const block = res.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
  if (!block) throw new Error('model did not call report_criteria');
  return (block.input as { results?: Judgement[] }).results ?? [];
}

// ─── RUN ────────────────────────────────────────────────────────────────────

const nodes = Object.values(NODES)
  .filter(n => n.eligibility.criteria.length)
  .filter(n => !ONLY || ONLY.includes(n.id))
  .slice(0, LIMIT);
const store = loadProvenance();
const now = new Date().toISOString();

const counts: Record<Verdict | 'fabricated' | 'unreachable' | 'missing', number> = {
  supported: 0, partly_supported: 0, contradicted: 0, not_stated: 0, fabricated: 0, unreachable: 0, missing: 0,
};
interface ReviewItem {
  id: string; name: string; criterion: number; factor: string;
  graph: string; verdict: Verdict; note: string; quote: string | null; url: string | null;
}
const review: ReviewItem[] = [];
let done = 0;

console.error(`Judging criteria for ${nodes.length} services with ${MODEL}...`);

async function processNode(n: ServiceNode) {
  const urls = [...new Set(
    [n.govuk_url, n.financialData?.source, ...(n.eligibility.sources ?? [])].filter(Boolean) as string[],
  )];
  const sources: { url: string; text: string }[] = [];
  for (const url of urls) {
    const text = await pageText(url);
    if (text && text.length > 200) sources.push({ url, text });
  }
  if (!sources.length) {
    counts.unreachable += n.eligibility.criteria.length;
    return;
  }

  let results: Judgement[];
  try {
    results = await judge(n, sources);
  } catch (err: any) {
    console.error(`  ${n.id}: API error — ${err.message}`);
    counts.unreachable += n.eligibility.criteria.length;
    return;
  }

  n.eligibility.criteria.forEach((criterion, i) => {
    const field = `eligibility.criteria.${i}`;
    const key = provenanceKey(n.id, field);
    const base = {
      valueHash: hashValue(criterion),
      valueSeen: criterion.description.slice(0, 200),
      method: 'llm-extraction' as const,
      verifiedAt: now,
    };
    const r = results.find(x => x.index === i);
    if (!r) {
      counts.missing++;
      return;
    }

    // Hallucination guard: the quote must be in the source it claims, or failing
    // that in any supplied source.
    let quoteUrl: string | null = null;
    if (r.quote) {
      const needle = normaliseForMatch(r.quote);
      const claimed = r.source != null ? sources[r.source] : undefined;
      const hit = [claimed, ...sources].find(s => s && normaliseForMatch(s.text).includes(needle));
      quoteUrl = hit?.url ?? null;
      if (!hit) {
        counts.fabricated++;
        store.fields[key] = {
          ...base, sourceUrl: sources[0].url, sourceQuote: '', confidence: 'unverified',
          rationale: `Model judged "${r.verdict}" but its quote is not in the source text, so the judgement was discarded.`,
        };
        return;
      }
    }

    counts[r.verdict]++;
    if (r.verdict === 'supported' && r.quote && quoteUrl) {
      store.fields[key] = { ...base, sourceUrl: quoteUrl, sourceQuote: r.quote, confidence: 'confirmed' };
      return;
    }

    store.fields[key] = {
      ...base,
      sourceUrl: quoteUrl ?? sources[0].url,
      sourceQuote: '',
      confidence: 'unverified',
      rationale: `${r.verdict.replace('_', ' ')}: ${r.note}`,
    };
    if (r.verdict === 'contradicted' || r.verdict === 'partly_supported') {
      review.push({
        id: n.id, name: n.name, criterion: i, factor: criterion.factor, graph: criterion.description,
        verdict: r.verdict, note: r.note, quote: r.quote, url: quoteUrl,
      });
    }
  });

  done++;
  if (done % 20 === 0) console.error(`  ${done}/${nodes.length}`);
}

const queue = [...nodes];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) await processNode(queue.shift()!);
}));

if (WRITE) {
  saveProvenance(store);
  // A partial run (--only, --limit) replaces only the services it judged, so
  // re-checking one fix does not wipe the rest of the queue.
  const judged = new Set(nodes.map(n => n.id));
  let kept: ReviewItem[] = [];
  try {
    kept = (JSON.parse(readFileSync(QUEUE_PATH, 'utf-8')).review as ReviewItem[]).filter(r => !judged.has(r.id));
  } catch { /* no queue yet */ }
  const merged = [...kept, ...review]
    .sort((a, b) => (a.verdict === b.verdict ? a.id.localeCompare(b.id) : a.verdict === 'contradicted' ? -1 : 1));
  writeFileSync(QUEUE_PATH, JSON.stringify({ generatedAt: now, model: MODEL, review: merged }, null, 2) + '\n');
  console.error(`Wrote provenance; review queue now holds ${merged.length} items (${review.length} from this run)`);
}

// ─── REPORT ─────────────────────────────────────────────────────────────────

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log('─── CRITERIA VERIFICATION (locate and quote) ───────────────────');
console.log(`Criteria judged:    ${total}`);
console.log(`Supported:          ${counts.supported}`);
console.log(`Partly supported:   ${counts.partly_supported}`);
console.log(`Contradicted:       ${counts.contradicted}`);
console.log(`Not stated:         ${counts.not_stated}`);
console.log(`Discarded (quote not in source): ${counts.fabricated}`);
console.log(`Unreachable or failed: ${counts.unreachable}   Missing from response: ${counts.missing}`);

const contradicted = review.filter(r => r.verdict === 'contradicted');
const shown = VERBOSE ? review : contradicted;
if (shown.length) {
  console.log(`\n── ${VERBOSE ? 'CONTRADICTED AND PARTLY SUPPORTED' : 'CONTRADICTED'} (${shown.length}) ──`);
  for (const r of shown) {
    console.log(`  ${r.id} #${r.criterion} [${r.factor}] ${r.verdict}`);
    console.log(`      graph: ${r.graph.slice(0, 160)}`);
    console.log(`      why:   ${r.note}`);
    if (r.quote) console.log(`      quote: "${r.quote.slice(0, 160)}"`);
  }
}
