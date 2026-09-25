/**
 * provenance.ts — Per-field evidence for graph data
 *
 * Every claim in the graph that came from somewhere gets a record saying where,
 * quoting the text it came from, and hashing the value it vouches for.
 *
 * Two properties make this worth the storage:
 *
 *   1. Self-invalidating. `sourceQuote` is a verbatim span from the source page.
 *      CI re-fetches the page and asserts the span is still there. When GOV.UK
 *      rewrites the sentence a rate lives in, that field drops to `unverified`
 *      on its own. This is narrower and quieter than hashing a whole page: it
 *      fires on the text the data actually depends on and ignores the rest.
 *
 *   2. Value-bound. `valueHash` covers the value the record vouches for. Edit a
 *      rate without re-verifying and the hash stops matching, so CI fails rather
 *      than letting provenance drift away from the data it claims to support.
 *
 * Records are keyed by `<nodeId>#<fieldPath>` — per field, not per node. A node
 * carries 40-odd fields with different sources and different volatility; one
 * timestamp on the node tells you nothing useful about any of them.
 *
 * ─── CONFIDENCE ────────────────────────────────────────────────────────────
 *
 *   confirmed   — traced to a source and mechanically re-checkable
 *   inferred    — an authored judgement with no published source (edges,
 *                 `proactive`, `gated`). Recorded so it is never mistaken for
 *                 a sourced fact.
 *   unverified  — nobody has checked this. The honest default.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROVENANCE_PATH = join(__dirname, '..', 'data', 'provenance.json');

export type VerificationMethod =
  | 'govuk-content-api'   // read from the GOV.UK Content API — publisher-authored
  | 'http-status'         // page resolves, but the host has no structured API
  | 'literal-presence'    // value appears verbatim in the source page text
  | 'llm-extraction'      // a model located the value and returned its span
  | 'manual';             // a human asserted it

export type Confidence = 'confirmed' | 'inferred' | 'unverified';

export interface FieldProvenance {
  /** Hash of the value this record vouches for. Mismatch = data edited without re-verification. */
  valueHash:       string;
  /** Human-readable rendering of the value at verification time, for review diffs. */
  valueSeen:       string;
  sourceUrl:       string;
  /** Verbatim span from the source. Empty for methods where no span applies. */
  sourceQuote:     string;
  /** GOV.UK content_id — stable across URL changes, unlike the URL itself. */
  contentId?:      string;
  /** The source page's public_updated_at when this was verified. */
  pageUpdatedAt?:  string;
  method:          VerificationMethod;
  verifiedAt:      string;
  confidence:      Confidence;
  /** Why this is `inferred`, for fields with no published source. */
  rationale?:      string;
}

export interface ProvenanceStore {
  schemaVersion: number;
  lastRun:       string;
  /** Keyed by `<nodeId>#<fieldPath>`, e.g. `dwp-state-pension#financialData.rates.new_full_weekly` */
  fields:        Record<string, FieldProvenance>;
}

export const EMPTY_STORE: ProvenanceStore = {
  schemaVersion: 1,
  lastRun: '',
  fields: {},
};

export function provenanceKey(nodeId: string, fieldPath: string): string {
  return `${nodeId}#${fieldPath}`;
}

/** Stable hash of a value — key order must not affect the result. */
export function hashValue(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex').slice(0, 16);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`;
}

/**
 * Normalise page text for quote matching.
 *
 * GOV.UK renders curly quotes, non-breaking spaces and pound signs that vary
 * between the HTML source and how a quote gets stored. Without this, quotes
 * that are still perfectly present fail to match and every field flaps to
 * unverified on cosmetic grounds.
 */
export function normaliseForMatch(text: string): string {
  return text
    .replace(/ /g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Strip HTML to visible text, for locating quotes in a fetched page. */
export function htmlToText(html: string): string {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return (main ? main[1] : html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\s+/g, ' ')
    .trim();
}

export function loadProvenance(path = PROVENANCE_PATH): ProvenanceStore {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as ProvenanceStore;
  } catch {
    return { ...EMPTY_STORE, fields: {} };
  }
}

export function saveProvenance(store: ProvenanceStore, path = PROVENANCE_PATH): void {
  store.lastRun = new Date().toISOString();
  mkdirSync(dirname(path), { recursive: true });
  // Sorted keys keep diffs readable when a single field changes.
  const sorted: Record<string, FieldProvenance> = {};
  for (const k of Object.keys(store.fields).sort()) sorted[k] = store.fields[k];
  store.fields = sorted;
  writeFileSync(path, JSON.stringify(store, null, 2) + '\n', 'utf-8');
}

/** Read a dotted path such as `financialData.rates.new_full_weekly`. */
export function getFieldValue(node: unknown, fieldPath: string): unknown {
  let current: any = node;
  for (const segment of fieldPath.split('.')) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}
