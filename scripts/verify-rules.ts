/**
 * verify-rules.ts — Give eligibility rule thresholds a source
 *
 * The machine rules decide who check_eligibility says qualifies, yet until now
 * no rule value had a provenance record. The free school meals £7,400 cap sat
 * in a rule a full academic year after it was lifted, and nothing automated
 * could have noticed, because nothing tied the rule to a page.
 *
 * Most rule values are numbers — an age, an income limit, a number of days —
 * so the tier 2 approach works: fetch the cited page, look for the number in
 * a form that means the same thing, and store the surrounding text as the
 * quote. No model is involved.
 *
 * What gets checked:
 *   comparison rules   `value`, matched by the kind of field it tests
 *                      (money as £ amounts, ages near an age word, hours as
 *                      "N hours", NI years as "N ... years")
 *   deadline rules     `maxDays`, as days, weeks, months or years
 *
 * Boolean, enum and dependency rules carry no value to look for; they belong
 * to the criteria-text pass (verify:deadlines' locate-and-quote method), not
 * this one.
 *
 * Presence of the number is what gets confirmed, not the direction of the
 * comparison. "Under 16" and "16 or under" both contain 16. Where the page's
 * wording points the other way from the rule's operator, the record is still
 * written, and the pair is listed in the report for a person to read.
 *
 * Sources tried in order: the node's govuk_url, financialData.source, then
 * eligibility.sources (subpages that state criteria the landing page does not).
 *
 * Records are keyed by path, e.g. `la-free-school-meals#eligibility.rules.1.rules.0.value`.
 * Paths contain array indices, so reordering rules orphans their records;
 * check:provenance reports that, and a re-run fixes it.
 *
 * Usage:
 *   npx tsx scripts/verify-rules.ts            # report only
 *   npx tsx scripts/verify-rules.ts --write    # also write data/provenance.json
 */

import { NODES } from '../src/graph-data.js';
import type { Rule } from '../src/rules.js';
import {
  loadProvenance, saveProvenance, provenanceKey, hashValue,
} from '../src/provenance.js';
import { pageText, quoteAround, moneyRenderings } from './lib/page-text.js';

const WRITE = process.argv.includes('--write');

const MONEY_FIELDS = new Set([
  'annual_income', 'weekly_income', 'weekly_earnings', 'savings', 'property_value', 'estate_value',
]);
const AGE_FIELDS = new Set(['age', 'youngest_child_age']);

interface Target {
  nodeId:   string;
  field:    string;          // provenance field path
  ruleField?: string;        // the user fact the rule tests, e.g. annual_income
  value:    number;
  kind:     'money' | 'age' | 'hours' | 'years' | 'days' | 'other';
  operator?: string;
  label:    string;
}

// ─── COLLECT ────────────────────────────────────────────────────────────────

const targets: Target[] = [];

function walk(rule: Rule, path: string, nodeId: string) {
  if (rule.type === 'all' || rule.type === 'any' || rule.type === 'not') {
    rule.rules.forEach((child, i) => walk(child, `${path}.rules.${i}`, nodeId));
    return;
  }
  if (rule.type === 'comparison') {
    const kind = MONEY_FIELDS.has(rule.field) ? 'money'
      : AGE_FIELDS.has(rule.field) ? 'age'
      : rule.field === 'caring_hours_per_week' ? 'hours'
      : rule.field === 'ni_qualifying_years' ? 'years'
      : 'other';
    targets.push({ nodeId, field: `${path}.value`, ruleField: rule.field, value: rule.value, kind, operator: rule.operator, label: rule.label });
  }
  if (rule.type === 'deadline') {
    targets.push({ nodeId, field: `${path}.maxDays`, value: rule.maxDays, kind: 'days', label: rule.label });
  }
}

for (const n of Object.values(NODES)) {
  (n.eligibility?.rules ?? []).forEach((r, i) => walk(r as Rule, `eligibility.rules.${i}`, n.id));
}

// ─── MATCHERS ───────────────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A bare number not glued to other digits, a decimal point or a £ sign. */
const num = (n: number | string) => `(?<![\\d.,£])${esc(String(n))}(?![\\d]|\\.\\d)`;

const AGE_WORDS = String.raw`(?:aged?|years?[\s-]old|year[\s-]olds?|under|over|older|younger|birthday|or above|or below)`;
const UNIT_NOT_AGE = String.raw`(?:\s*(?:%|per cent|weeks?|days?|months?|hours?|pence|p\b|miles?|km))`;

/** Regexes, most specific first, that would show this value on a page. */
function matchers(t: Target): RegExp[] {
  const v = Math.abs(t.value);
  switch (t.kind) {
    case 'money': {
      // Rules test one period (annual_income, weekly_earnings) while pages often
      // state another: legal aid gives £2,657 a month, the rule £31,884 a year.
      // Try the stated period, then the exact conversions, and nothing inexact.
      const forms = [v];
      if (t.ruleField === 'annual_income') {
        if (Number.isInteger(v / 12 * 100)) forms.push(v / 12);
        if (Number.isInteger(v / 52 * 100)) forms.push(v / 52);
      }
      return forms.flatMap(f => moneyRenderings(f).map(r => new RegExp(`${esc(r)}(?![\\d])`)));
    }
    case 'age': {
      // The number within a few words of an age word, and not followed by a
      // unit that makes it something else ("18 weeks").
      const out = [
        new RegExp(`${AGE_WORDS}[^.;:]{0,25}?${num(v)}(?!${UNIT_NOT_AGE})`, 'i'),
        new RegExp(`${num(v)}(?!${UNIT_NOT_AGE})[^.;:]{0,25}?${AGE_WORDS}`, 'i'),
      ];
      // The same boundary written from the other side: `< 12` is "11 or
      // younger", `<= 64` is "65 or over" (as an exemption), `> 17` is "18 or over".
      const other = (n: number, words: string) => new RegExp(`${num(n)}\\s+(?:or|and)\\s+${words}`, 'i');
      if (t.operator === '<')  out.push(other(v - 1, '(?:younger|under|below)'));
      if (t.operator === '<=') out.push(new RegExp(`under\\s+${num(v + 1)}`, 'i'), other(v + 1, '(?:over|older|above)'));
      if (t.operator === '>')  out.push(other(v + 1, '(?:over|older|above)'));
      return out;
    }
    case 'hours':
      return [new RegExp(`${num(v)}\\s*hours?`, 'i')];
    case 'years':
      return [new RegExp(`${num(v)}[^.;:]{0,30}?years?`, 'i')];
    case 'days': {
      const out = [new RegExp(`${num(v)}\\s*(?:clear\\s+|working\\s+|calendar\\s+)?days?`, 'i')];
      if (v % 7 === 0) out.push(new RegExp(`${num(v / 7)}\\s*weeks?`, 'i'));
      const months = Math.round(v / 30.44);
      if (months >= 1 && Math.abs(v - months * 30.44) <= 3) {
        out.push(new RegExp(`${num(months)}\\s*(?:calendar\\s+)?months?`, 'i'));
        if (months === 12) out.push(/\b(?:1|one) year\b/i);
      }
      const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
      if (months >= 1 && months <= 12 && Math.abs(v - months * 30.44) <= 3) {
        out.push(new RegExp(`\\b${words[months]}\\s+months?`, 'i'));
      }
      return out;
    }
    default:
      return [new RegExp(num(v))];
  }
}

/**
 * Does the page's wording near the match run against the rule's operator?
 * "under 16" fits `< 16` but not `<= 16`. Only flags clear contradictions.
 */
function operatorConcern(t: Target, quote: string): string | null {
  if (t.kind !== 'age' || !t.operator) return null;
  const v = Math.abs(t.value);
  const q = quote.toLowerCase();
  const under   = new RegExp(`(?:under|younger than|below)\\s+(?:the age of\\s+)?${v}\\b`).test(q);
  const orUnder = new RegExp(`${v}\\s+(?:or|and)\\s+(?:under|younger|below)`).test(q);
  const orOver  = new RegExp(`${v}\\s+(?:or|and)\\s+(?:over|older|above)`).test(q);
  const over    = new RegExp(`(?:over|older than|above)\\s+(?:the age of\\s+)?${v}\\b`).test(q);
  if (t.operator === '<=' && under && !orUnder) return `rule is <= ${v}, page says "under ${v}"`;
  if (t.operator === '<'  && orUnder && !under) return `rule is < ${v}, page says "${v} or under"`;
  if (t.operator === '>'  && orOver && !over)   return `rule is > ${v}, page says "${v} or over"`;
  if (t.operator === '>=' && over && !orOver)   return `rule is >= ${v}, page says "over ${v}"`;
  return null;
}

const STOP = new Set(['must', 'with', 'have', 'been', 'your', 'from', 'that', 'this', 'than', 'less', 'more', 'over', 'under', 'least', 'aged', 'years', 'year', 'week', 'within']);

const OPERATOR_WORDS: Record<string, RegExp> = {
  '<':  /under|younger than|below|less than/i,
  '<=': /or (?:under|younger|less)|up to|no more than/i,
  '>=': /or (?:over|older|more)|at least/i,
  '>':  /over|older than|more than|exceeds/i,
};

/** Distinct content words from the rule label that also appear near the match. */
function labelOverlap(label: string, quote: string): number {
  const q = quote.toLowerCase();
  const words = new Set(label.toLowerCase().match(/[a-z]{4,}/g) ?? []);
  let n = 0;
  for (const w of words) if (!STOP.has(w) && q.includes(w)) n++;
  return n;
}

// ─── RUN ────────────────────────────────────────────────────────────────────

const store = loadProvenance();
const now = new Date().toISOString();

const confirmed: (Target & { url: string; quote: string })[] = [];
const missing: (Target & { urls: string[] })[] = [];
const unreachable: Target[] = [];
const concerns: { t: Target; concern: string; quote: string }[] = [];

console.error(`Checking ${targets.length} rule values across ${new Set(targets.map(t => t.nodeId)).size} services...`);

for (const t of targets) {
  const node = NODES[t.nodeId];
  const urls = [...new Set(
    [node.govuk_url, node.financialData?.source, ...(node.eligibility.sources ?? [])].filter(Boolean) as string[],
  )];

  let hit: { url: string; quote: string } | null = null;
  let anyReachable = false;
  for (const url of urls) {
    const text = await pageText(url);
    if (text === null) continue;
    anyReachable = true;
    // A page can state the same number for several things ("£1,420" is both a
    // fee band and an income limit on the court fees page). Take the occurrence
    // whose surroundings share the most words with the rule's own label, and
    // whose own wording fits the operator ("under 3" for `< 3`).
    let best: { quote: string; score: number } | null = null;
    const fits = t.operator ? OPERATOR_WORDS[t.operator] : undefined;
    for (const re of matchers(t)) {
      for (const m of text.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))) {
        const quote = quoteAround(text, m.index!, m[0].length);
        const score = labelOverlap(t.label, quote) + (fits?.test(m[0]) ? 2 : 0);
        if (!best || score > best.score) best = { quote, score };
      }
    }
    if (best) { hit = { url, quote: best.quote }; break; }
  }

  const key = provenanceKey(t.nodeId, t.field);
  if (hit) {
    confirmed.push({ ...t, ...hit });
    const concern = operatorConcern(t, hit.quote);
    if (concern) concerns.push({ t, concern, quote: hit.quote });
    store.fields[key] = {
      valueHash:   hashValue(t.value),
      valueSeen:   String(t.value),
      sourceUrl:   hit.url,
      sourceQuote: hit.quote,
      method:      'literal-presence',
      verifiedAt:  now,
      confidence:  'confirmed',
    };
  } else if (!anyReachable) {
    unreachable.push(t);
  } else {
    missing.push({ ...t, urls });
    store.fields[key] = {
      valueHash:   hashValue(t.value),
      valueSeen:   String(t.value),
      sourceUrl:   urls[0],
      sourceQuote: '',
      method:      'literal-presence',
      verifiedAt:  now,
      confidence:  'unverified',
      rationale:   `"${t.label}": ${t.value} not found in a matching form on ${urls.join(' or ')}.`,
    };
  }
}

if (WRITE) {
  saveProvenance(store);
  console.error(`\nWrote provenance for ${confirmed.length + missing.length} rule values`);
}

// ─── REPORT ─────────────────────────────────────────────────────────────────

const byKind = (rows: Target[]) => {
  const c: Record<string, number> = {};
  for (const r of rows) c[r.kind] = (c[r.kind] ?? 0) + 1;
  return Object.entries(c).map(([k, v]) => `${k} ${v}`).join(', ');
};

console.log('─── RULE VALUE VERIFICATION (literal presence) ─────────────────');
console.log(`Confirmed   ${confirmed.length}  (${byKind(confirmed)})`);
console.log(`Not found   ${missing.length}  (${byKind(missing)})`);
console.log(`Unreachable ${unreachable.length}`);

console.log(`\n─── NOT FOUND ON CITED PAGE (${missing.length}) ───`);
for (const r of missing) {
  console.log(`  ${r.nodeId.padEnd(36)} ${String(r.value).padEnd(8)} ${r.label}`);
}

console.log(`\n─── WORDING RUNS AGAINST THE RULE'S OPERATOR (${concerns.length}) — read these ───`);
for (const { t, concern, quote } of concerns) {
  console.log(`  ${t.nodeId}  ${t.field}\n    ${concern}\n    ${quote}`);
}

if (unreachable.length) {
  console.log(`\n─── UNREACHABLE (${unreachable.length}) ───`);
  for (const r of unreachable) console.log(`  ${r.nodeId.padEnd(36)} ${r.label}`);
}
