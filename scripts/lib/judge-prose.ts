/**
 * judge-prose.ts — Shared judging for claim-by-claim verification
 *
 * Used by verify-prose.ts (every prose field against a service's own pages)
 * and widen-sources.ts (partly supported fields again, with linked pages).
 * Both need the same prompt, the same quote check and the same provenance
 * record, so a field judged by either reads the same way.
 */

import type Anthropic from '@anthropic-ai/sdk';
import type { ServiceNode } from '../../src/graph-data.js';
import {
  provenanceKey, hashValue, normaliseForMatch, getFieldValue, type ProvenanceStore,
} from '../../src/provenance.js';

export type Verdict = 'supported' | 'partly_supported' | 'contradicted' | 'not_stated';
export type FieldStatus = 'confirmed' | Verdict | 'fabricated';

export interface FieldToJudge { key: string; path: string; text: string; split: boolean }
export interface Source { url: string; text: string; linked?: boolean }

export interface Claim { claim: string; verdict: Verdict; quote: string | null; source: number | null; note: string }
export interface FieldResult { key: string; claims: Claim[] }
export interface ProseResponse { fields: FieldResult[]; methods_on_page: string[]; sign_in_on_page: string | null }

export interface ReviewItem {
  id: string; name: string; field: string; graph: string; verdict: Verdict;
  problems: { claim: string; verdict: Verdict; note: string; quote: string | null }[];
}

export const PER_SOURCE_CHARS = 30_000;

export const METHOD_WORDS: Record<string, string> = {
  online: 'You can apply or do this online',
  phone: 'You can apply or do this by phone',
  post: 'You can apply or do this by post',
  'in-person': 'You can apply or do this in person',
};
export const AUTH_WORDS: Record<string, string> = {
  'government-gateway': 'Applying online needs a Government Gateway user ID (sign-in)',
  'gov-uk-one-login': 'Applying online needs a GOV.UK One Login',
  'gov-uk-verify': 'Applying online needs GOV.UK Verify',
  'nhs-login': 'Applying online needs an NHS login',
  'companies-house': 'Applying online needs a Companies House account or sign-in',
  none: 'No account or sign-in is needed to apply',
};

export const TOOL: Anthropic.Tool = {
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

/** The user message for one service. Linked sources get their own warning. */
export function buildPrompt(serviceName: string, fields: FieldToJudge[], sources: Source[]): string {
  const listing = fields
    .map(f => `[${f.key}]${f.split ? ' (split into claims)' : ''} ${f.text}`)
    .join('\n');
  const texts = sources
    .map((s, i) => `--- SOURCE ${i}${s.linked ? ' (LINKED)' : ''}: ${s.url} ---\n${s.text.slice(0, PER_SOURCE_CHARS)}`)
    .join('\n\n');
  const hasLinked = sources.some(s => s.linked);

  return (
    `A service graph describes the UK government service "${serviceName}" with the fields below. ` +
    `Judge them against the source text that follows, and nothing else.\n\n` +
    `Do not use anything you know about UK government services. The question is whether this text says it, ` +
    `not whether it is true.\n\n` +
    (hasLinked
      ? `Sources marked LINKED are pages the service's own pages link to. A linked page may describe a ` +
        `different service. Use one for a claim only if it is about this service, or states a general rule ` +
        `that plainly applies to it; otherwise treat the claim as not stated there.\n\n`
      : '') +
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
    `FIELDS\n${listing}\n\n${texts}`
  );
}

export function requestParams(model: string, prompt: string): Anthropic.MessageCreateParamsNonStreaming {
  return {
    model,
    max_tokens: 8192,
    // Not forced: some current models reject a forced tool_choice.
    tool_choice: { type: 'auto' },
    tools: [TOOL],
    messages: [{ role: 'user', content: prompt }],
  };
}

export function readResponse(message: Anthropic.Message): ProseResponse {
  const block = message.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
  if (!block) throw new Error('model did not call report_prose');
  return block.input as ProseResponse;
}

/**
 * Check one field's claims and write its provenance record. Every quote must
 * be found in the source it names, or any source, or the judgement is
 * discarded. The field is confirmed only when every claim is supported.
 */
export function recordField(
  store: ProvenanceStore, n: ServiceNode, f: FieldToJudge, r: FieldResult | undefined,
  sources: Source[], now: string,
): { status: FieldStatus | 'missing'; review?: ReviewItem; linkedQuotes: number } {
  if (!r || !r.claims?.length) return { status: 'missing', linkedQuotes: 0 };

  const checked = r.claims.map(c => {
    if (!c.quote) return { ...c, url: null as string | null, ok: c.verdict === 'not_stated', linked: false };
    const needle = normaliseForMatch(c.quote);
    const claimed = c.source != null ? sources[c.source] : undefined;
    const hit = [claimed, ...sources].find(s => s && normaliseForMatch(s.text).includes(needle));
    return { ...c, url: hit?.url ?? null, ok: Boolean(hit), linked: Boolean(hit?.linked) };
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

  // Quotes for every claim the source supports, kept even when the field as
  // a whole is not confirmed, so the evidence for those claims stays visible.
  const good = checked.filter(c => c.verdict === 'supported' && c.ok && c.quote && c.url);
  const linkedQuotes = good.filter(c => c.linked).length;
  const claims = { supported: good.length, total: checked.length };
  const quotes = good.length ? {
    sourceUrl: good[0].url!, sourceQuote: good[0].quote!,
    ...(good.length > 1 ? { additionalQuotes: good.slice(1).map(c => ({ quote: c.quote!, url: c.url! })) } : {}),
  } : null;

  if (status === 'confirmed') {
    store.fields[key] = { ...base, ...quotes!, confidence: 'confirmed', claims };
    return { status, linkedQuotes };
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
  const review = status === 'contradicted' || status === 'partly_supported'
    ? {
        id: n.id, name: n.name, field: f.path, graph: f.text, verdict: status,
        problems: problems.map(c => ({ claim: c.claim, verdict: c.verdict, note: c.note, quote: c.quote })),
      }
    : undefined;
  return { status, review, linkedQuotes };
}
