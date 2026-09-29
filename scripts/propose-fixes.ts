/**
 * propose-fixes.ts — Draft source-backed corrections for worklist items
 *
 * Step 3 of the partly supported work: fix the high and medium items in
 * docs/review-worklist.md. Hundreds of hand-written rewrites would invite the
 * very error this work exists to remove (a plausible sentence with no source),
 * so the model drafts each correction and every claim in the draft must carry
 * a quote that is mechanically found on one of the service's pages. A draft
 * with a quote that is not there is rejected outright.
 *
 * For each field the model proposes one of:
 *   rewrite     the smallest change that makes the field say only what the
 *               sources support, fixing what the review notes found
 *   remove      for a list item (qualifier, exclusion, evidence) that no page
 *               supports at all
 *   no_change   the notes were wrong; says why
 *
 * Nothing is applied. Proposals go to data/fix-proposals.json for a person to
 * read; apply-fixes.ts applies the accepted ones. Sign-in fields are skipped:
 * most need a value the schema does not have, which is a pending decision.
 *
 * Requires ANTHROPIC_API_KEY.
 *
 * Usage:
 *   npx tsx scripts/propose-fixes.ts --event reviewed      # one worklist group
 *   npx tsx scripts/propose-fixes.ts --only dwp-pip
 *   npx tsx scripts/propose-fixes.ts --event disability --append
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { NODES } from '../src/graph-data.js';
import { normaliseForMatch } from '../src/provenance.js';
import { gatherSources } from './lib/sources.js';
import { PER_SOURCE_CHARS, type Source } from './lib/judge-prose.js';

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const EVENT = arg('--event');
const ONLY = arg('--only')?.split(',');
const APPEND = process.argv.includes('--append');
const MODEL = arg('--model') ?? 'claude-opus-5-5';
const OUT = 'data/fix-proposals.json';
const METHODS = ['online', 'phone', 'post', 'in-person'];

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. This pass needs it.');
  process.exit(2);
}
const client = new Anthropic({ maxRetries: 4 });

interface WorkItem {
  id: string; event: string; path: string; text: string; severity: string;
  action: string; problems: { claim: string; verdict: string; note: string }[];
}
const work: WorkItem[] = JSON.parse(readFileSync('data/worklist-partly.json', 'utf-8')).items
  .filter((i: WorkItem) => i.severity !== 'low')
  .filter((i: WorkItem) => i.path !== 'agentInteraction.authRequired')
  .filter((i: WorkItem) => !EVENT || i.event === EVENT)
  .filter((i: WorkItem) => !ONLY || ONLY.includes(i.id));

const byService = new Map<string, WorkItem[]>();
for (const w of work) byService.set(w.id, [...(byService.get(w.id) ?? []), w]);

// ─── PROPOSE ────────────────────────────────────────────────────────────────

interface Draft {
  key: string; action: 'rewrite' | 'remove' | 'no_change'; new_text: string | null;
  claims: { claim: string; quote: string; source: number }[]; explanation: string;
}

const TOOL: Anthropic.Tool = {
  name: 'propose_fixes',
  description: 'Propose a source-backed correction for each field.',
  input_schema: {
    type: 'object',
    properties: {
      fields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'The field key exactly as given.' },
            action: { type: 'string', enum: ['rewrite', 'remove', 'no_change'] },
            new_text: {
              type: ['string', 'null'],
              description: 'For rewrite: the corrected field text. For the methods field, a comma-separated list from: online, phone, post, in-person. Null otherwise.',
            },
            claims: {
              type: 'array',
              description: 'For rewrite: every factual statement in new_text, each with the verbatim span that supports it.',
              items: {
                type: 'object',
                properties: {
                  claim: { type: 'string' },
                  quote: { type: 'string', description: 'Copied character for character from the source text, under 300 characters.' },
                  source: { type: 'integer', description: 'Which SOURCE the quote is from.' },
                },
                required: ['claim', 'quote', 'source'],
              },
            },
            explanation: { type: 'string', description: 'One sentence: what changed and why, or why no change is needed.' },
          },
          required: ['key', 'action', 'new_text', 'claims', 'explanation'],
        },
      },
    },
    required: ['fields'],
  },
};

function prompt(name: string, items: WorkItem[], sources: Source[]): string {
  const listing = items.map(w =>
    `[${w.path}]${w.path.startsWith('eligibility.autoQualifiers') || w.path.startsWith('eligibility.exclusions') || w.path.startsWith('eligibility.evidenceRequired') ? ' (list item)' : ''}\n` +
    `  CURRENT: ${w.text}\n` +
    w.problems.map(p => `  PROBLEM (${p.verdict.replace('_', ' ')}): ${p.note}`).join('\n'),
  ).join('\n\n');
  const texts = sources
    .map((s, i) => `--- SOURCE ${i}${s.linked ? ' (LINKED)' : ''}: ${s.url} ---\n${s.text.slice(0, PER_SOURCE_CHARS)}`)
    .join('\n\n');
  return (
    `A service graph describes the UK government service "${name}". An AI agent uses it to tell people whether ` +
    `they qualify and what to do. The fields below were checked against the official pages and the problems ` +
    `listed were found. Propose a correction for each, using only the source text that follows.\n\n` +
    `Rules:\n` +
    `- rewrite: make the smallest change that makes the field say only what the sources support and fixes the ` +
    `problems. Keep the field's purpose, length and plain style: a criterion stays a criterion, a summary stays ` +
    `a summary. Do not add facts the sources do not state, and drop any unsupported detail rather than guess. ` +
    `Every factual statement in new_text must appear in claims with a verbatim supporting quote.\n` +
    `- remove: only for a list item that no source supports at all, or that the sources show is wrong.\n` +
    `- no_change: only if the problems are mistaken and the current text is supported; explain why.\n` +
    `Sources marked LINKED are pages the service's own pages link to. Use one only for a claim that is about ` +
    `this service or states a general rule that plainly applies to it.\n` +
    `Do not use anything you know about UK government services beyond this text.\n\n` +
    `Report by calling propose_fixes once, covering every field.\n\n` +
    `FIELDS\n${listing}\n\n${texts}`
  );
}

interface Proposal {
  id: string; path: string; severity: string; event: string; old: string;
  action: Draft['action']; new: string | null; explanation: string;
  claims: { claim: string; quote: string; url: string | null; found: boolean }[];
  verified: boolean; accepted: boolean | null;
}
const proposals: Proposal[] = [];
const failures: string[] = [];

const ids = [...byService.keys()];
console.error(`Proposing fixes for ${work.length} fields across ${ids.length} services...`);
const queue = [...ids];
let done = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const id = queue.shift()!;
    const items = byService.get(id)!;
    const n = NODES[id];
    try {
      const terms = items.map(w => `${w.text} ${w.problems.map(p => p.note).join(' ')}`).join(' ');
      const sources = await gatherSources(n, terms, { maxLinked: 3, linkedChars: 20_000, minScore: 3, requireLinked: false });
      if (!sources) { failures.push(`${id}: no readable source`); continue; }
      const res = await client.messages.create({
        model: MODEL, max_tokens: 8192, tool_choice: { type: 'auto' }, tools: [TOOL],
        messages: [{ role: 'user', content: prompt(n.name, items, sources) }],
      });
      const block = res.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
      if (!block) throw new Error('model did not call propose_fixes');
      const drafts = (block.input as { fields: Draft[] }).fields;
      for (const w of items) {
        const d = drafts.find(x => x.key === w.path);
        if (!d) { failures.push(`${id} ${w.path}: missing from response`); continue; }
        const claims = (d.claims ?? []).map(c => {
          const needle = normaliseForMatch(c.quote ?? '');
          const hit = needle ? [sources[c.source], ...sources].find(s => s && normaliseForMatch(s.text).includes(needle)) : undefined;
          return { claim: c.claim, quote: c.quote, url: hit?.url ?? null, found: Boolean(hit) };
        });
        let verified = true;
        if (d.action === 'rewrite') {
          verified = Boolean(d.new_text?.trim()) && claims.length > 0 && claims.every(c => c.found);
          if (w.path === 'agentInteraction.methods') {
            const list = (d.new_text ?? '').split(',').map(x => x.trim()).filter(Boolean);
            verified = verified && list.length > 0 && list.every(m => METHODS.includes(m));
          }
        }
        proposals.push({
          id, path: w.path, severity: w.severity, event: w.event, old: w.text,
          action: d.action, new: d.new_text, explanation: d.explanation, claims, verified, accepted: null,
        });
      }
    } catch (e: any) {
      failures.push(`${id}: ${e.message}`);
    }
    if (++done % 20 === 0) console.error(`  ${done}/${ids.length}`);
  }
}));

// ─── OUTPUT ─────────────────────────────────────────────────────────────────

let all = proposals;
if (APPEND && existsSync(OUT)) {
  const prev: Proposal[] = JSON.parse(readFileSync(OUT, 'utf-8')).proposals;
  const keys = new Set(proposals.map(p => `${p.id}#${p.path}`));
  all = [...prev.filter(p => !keys.has(`${p.id}#${p.path}`)), ...proposals];
}
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), model: MODEL, proposals: all }, null, 2) + '\n');

const c = (f: (p: Proposal) => boolean) => proposals.filter(f).length;
console.log('─── FIX PROPOSALS ──────────────────────────────────────────────');
console.log(`Fields: ${proposals.length}   failed: ${failures.length}`);
console.log(`rewrite ${c(p => p.action === 'rewrite')} (quotes verified: ${c(p => p.action === 'rewrite' && p.verified)})   remove ${c(p => p.action === 'remove')}   no_change ${c(p => p.action === 'no_change')}`);
if (failures.length) console.log(`\nFailures:\n  ${failures.join('\n  ')}`);
for (const p of proposals) {
  console.log(`\n[${p.severity}] ${p.id}  ${p.path}  ${p.action.toUpperCase()}${p.action === 'rewrite' && !p.verified ? '  ** UNVERIFIED QUOTE **' : ''}`);
  console.log(`  - ${p.old}`);
  if (p.action === 'rewrite') console.log(`  + ${p.new}`);
  console.log(`  why: ${p.explanation}`);
}
