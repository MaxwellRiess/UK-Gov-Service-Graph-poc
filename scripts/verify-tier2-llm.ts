/**
 * verify-tier2-llm.ts — Locate non-literal values in source text
 *
 * Deadlines and eligibility criteria are prose, not literals: "you must claim
 * within 3 months of the death" cannot be found with a string search the way
 * "£26.05" can. This pass asks a model to *locate* the value on the page and
 * hand back the span it read it from.
 *
 * Three rules keep this from becoming a way to launder guesses into the graph:
 *
 *   1. Locate, don't recall. The model is given the page text and asked where
 *      the answer is. It is never asked what it knows. Extraction from supplied
 *      text is a far lower-error task than recall, and the output is checkable.
 *
 *   2. Every span is verified mechanically. If the returned quote does not
 *      appear in the page text that was supplied, the result is discarded as a
 *      fabrication. A model cannot get a claim into provenance by asserting it.
 *
 *   3. Disagreement is reported, never applied. Where the extracted value
 *      differs from the graph, that is a review item written to a queue file.
 *      This script does not edit graph-data.ts, and should not be given the
 *      ability to.
 *
 * Requires ANTHROPIC_API_KEY. Writes data/review-queue.json for a human, and
 * provenance only for fields where extraction agreed with the graph.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... npx tsx scripts/verify-tier2-llm.ts --limit 20
 *   ANTHROPIC_API_KEY=... npx tsx scripts/verify-tier2-llm.ts --write
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync } from 'node:fs';
import { NODES } from '../src/graph-data.js';
import {
  loadProvenance, saveProvenance, provenanceKey, hashValue,
  htmlToText, normaliseForMatch,
} from '../src/provenance.js';

const WRITE = process.argv.includes('--write');
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg !== -1 ? Number(process.argv[limitArg + 1]) : Infinity;
const UA = 'UK-Gov-Service-Graph-Provenance/1.0';
const MODEL = 'claude-sonnet-4-6';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. This pass needs it; the deterministic');
  console.error('checks in verify-tier1.ts and verify-tier2.ts do not.');
  process.exit(2);
}

const client = new Anthropic({ maxRetries: 3 });
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface Extraction {
  found: boolean;
  value: string | null;
  quote: string | null;
}

const TOOL: Anthropic.Tool = {
  name: 'report_deadline',
  description: 'Report the deadline stated in the supplied page text, and the exact span it was read from.',
  input_schema: {
    type: 'object',
    properties: {
      found: {
        type: 'boolean',
        description: 'True only if the page text states a deadline for this service.',
      },
      value: {
        type: ['string', 'null'],
        description: 'The deadline as the page states it, e.g. "3 months", "within 6 months of the funeral".',
      },
      quote: {
        type: ['string', 'null'],
        description: 'Verbatim span copied exactly from the supplied page text. Must be copied character for character, not paraphrased.',
      },
    },
    required: ['found', 'value', 'quote'],
  },
};

async function pageText(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    const isGovUk = parsed.host === 'www.gov.uk' || parsed.host === 'gov.uk';
    if (isGovUk) {
      const res = await fetch(`https://www.gov.uk/api/content${parsed.pathname.replace(/\/$/, '')}`,
        { headers: { 'User-Agent': UA }, redirect: 'follow' });
      if (res.ok) {
        const det = ((await res.json()) as any).details ?? {};
        const bodies: string[] = [];
        if (typeof det.body === 'string') bodies.push(det.body);
        for (const p of det.parts ?? []) if (typeof p.body === 'string') bodies.push(p.body);
        if (bodies.length) return htmlToText(bodies.join(' \n '));
      }
    }
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    return res.ok ? htmlToText(await res.text()) : null;
  } catch {
    return null;
  }
}

async function extractDeadline(serviceName: string, text: string): Promise<Extraction | null> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: 'report_deadline' },
    messages: [{
      role: 'user',
      content:
        `Below is the text of a GOV.UK page about "${serviceName}".\n\n` +
        `Find the deadline a citizen must meet to apply for or comply with this service.\n\n` +
        `Report only what this text states. If the text does not state a deadline, set found to false. ` +
        `Do not use anything you know about UK government services — only this text. ` +
        `The quote must be copied verbatim from the text below.\n\n` +
        `--- PAGE TEXT ---\n${text.slice(0, 40_000)}`,
    }],
  });

  const block = res.content.find(b => b.type === 'tool_use');
  return block ? ((block as Anthropic.ToolUseBlock).input as Extraction) : null;
}

// ─── RUN ────────────────────────────────────────────────────────────────────

const nodes = Object.values(NODES).filter(n => n.deadline).slice(0, LIMIT);
const store = loadProvenance();
const now = new Date().toISOString();

const agreed: { id: string; value: string }[] = [];
const review: { id: string; graph: string; extracted: string; quote: string; url: string }[] = [];
const notStated: { id: string; url: string }[] = [];
const fabricated: { id: string; quote: string }[] = [];

console.error(`Extracting deadlines for ${nodes.length} nodes...`);

for (const n of nodes) {
  const text = await pageText(n.govuk_url);
  if (!text) continue;

  let out: Extraction | null = null;
  try {
    out = await extractDeadline(n.name, text);
  } catch (err: any) {
    console.error(`  ${n.id}: API error — ${err.message}`);
    continue;
  }
  if (!out) continue;

  if (!out.found || !out.value || !out.quote) {
    notStated.push({ id: n.id, url: n.govuk_url });
    continue;
  }

  // Hallucination guard: the span must really be in the text we supplied.
  const haystack = normaliseForMatch(text);
  const needle = normaliseForMatch(out.quote);
  const quoteIndex = haystack.indexOf(needle);
  if (quoteIndex === -1) {
    fabricated.push({ id: n.id, quote: out.quote });
    continue;
  }

  // Agreement is judged loosely — "3 months" vs "within 3 months" is the same
  // fact stated differently, and a reviewer does not need to see that.
  const graphNorm = normaliseForMatch(n.deadline!);
  const sameFact =
    normaliseForMatch(out.value).includes(graphNorm) ||
    graphNorm.includes(normaliseForMatch(out.value));

  if (sameFact) {
    agreed.push({ id: n.id, value: n.deadline! });
    store.fields[provenanceKey(n.id, 'deadline')] = {
      valueHash: hashValue(n.deadline),
      valueSeen: out.value,
      sourceUrl: n.govuk_url,
      sourceQuote: out.quote,
      method: 'llm-extraction',
      verifiedAt: now,
      confidence: 'confirmed',
    };
  } else {
    review.push({
      id: n.id, graph: n.deadline!, extracted: out.value, quote: out.quote, url: n.govuk_url,
    });
    store.fields[provenanceKey(n.id, 'deadline')] = {
      valueHash: hashValue(n.deadline),
      valueSeen: n.deadline!,
      sourceUrl: n.govuk_url,
      sourceQuote: '',
      method: 'llm-extraction',
      verifiedAt: now,
      confidence: 'unverified',
      rationale: `Page states "${out.value}"; graph says "${n.deadline}". Needs a human decision.`,
    };
  }

  await sleep(200);
}

if (WRITE) {
  saveProvenance(store);
  writeFileSync('data/review-queue.json', JSON.stringify({ generatedAt: now, review }, null, 2) + '\n');
  console.error(`Wrote provenance and ${review.length} review items to data/review-queue.json`);
}

console.log('─── TIER 2 EXTRACTION (deadlines) ──────────────────────────────');
console.log(`Agreed with graph:   ${agreed.length}`);
console.log(`Needs review:        ${review.length}`);
console.log(`No deadline stated:  ${notStated.length}`);
console.log(`Discarded (quote not in source): ${fabricated.length}`);

if (review.length) {
  console.log('\n── DISAGREEMENTS ──');
  for (const r of review) {
    console.log(`  ${r.id}`);
    console.log(`      graph:     ${r.graph}`);
    console.log(`      page says: ${r.extracted}`);
    console.log(`      quote:     "${r.quote.slice(0, 140)}"`);
    console.log(`      ${r.url}`);
  }
}
