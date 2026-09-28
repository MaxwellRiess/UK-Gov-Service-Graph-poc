/**
 * check-consistency.ts — Catch figures in prose that no structured value backs
 *
 * The errors this week's reviews found most often were not in structured
 * fields but in the prose that repeats them. Carer's Allowance's earnings
 * limit was right nowhere: £151 in the rule, the criterion, a key question
 * and two more places. Pension Credit's threshold was corrected in its rule
 * and rates but survived, two years stale, in its summary and criterion.
 * Updating a rate never touches the sentences that quote it.
 *
 * This check needs no network and no model. For each service it collects the
 * money values the graph holds in structured form (rates and rule thresholds,
 * with exact weekly, monthly and annual conversions), then reads every prose
 * field and flags:
 *
 *   unbacked amount   a £ figure that matches no structured value in this
 *                     service or any other. Usually a stale copy of a value
 *                     that has since been updated.
 *   stale year label  a tax or academic year older than the current one,
 *                     such as "(2024/25)" beside a figure.
 *
 * A figure matching another service's value is accepted: prose often quotes a
 * neighbouring service ("a Prescription Prepayment Certificate costs ..."), and
 * that service's own checks cover the value.
 *
 * With --online, each unbacked amount is also looked for on the service's own
 * cited pages (govuk_url, financialData.source, eligibility.sources), the same
 * literal check tier 2 uses. That splits the findings in two:
 *
 *   on its page       a real, sourced figure the graph just does not model as
 *                     a rate (a penalty, a fee band). Not an error.
 *   on no cited page  stale or invented. These are the ones to fix.
 *
 * Findings are reported, not failed on, while the existing backlog is worked
 * through. Pass --strict to exit non-zero when anything is found (with
 * --online, only figures on no cited page count).
 *
 * Usage:
 *   npx tsx scripts/check-consistency.ts
 *   npx tsx scripts/check-consistency.ts --online     # also look for each figure on its pages
 *   npx tsx scripts/check-consistency.ts --strict
 *   npx tsx scripts/check-consistency.ts --json report.json
 */

import { writeFileSync } from 'node:fs';
import { NODES, type ServiceNode } from '../src/graph-data.js';
import type { Rule } from '../src/rules.js';
import { pageText, moneyRenderings } from './lib/page-text.js';

const STRICT = process.argv.includes('--strict');
const ONLINE = process.argv.includes('--online');
const jsonArg = process.argv.indexOf('--json');
const JSON_OUT = jsonArg !== -1 ? process.argv[jsonArg + 1] : null;

// ─── STRUCTURED VALUES ──────────────────────────────────────────────────────

const MONEY_RULE_FIELDS = new Set([
  'annual_income', 'weekly_income', 'weekly_earnings', 'savings', 'property_value', 'estate_value',
]);

const pennies = (v: number) => Math.round(v * 100);

function structuredValues(n: ServiceNode): Set<number> {
  const out = new Set<number>();
  const add = (v: number) => {
    out.add(pennies(v));
    // Exact period conversions only: a page may state £2,657 a month where the
    // rule holds £31,884 a year. Inexact ones would accept near misses.
    for (const f of [12, 52, 4]) {
      if (Number.isInteger(pennies(v) / f)) out.add(pennies(v) / f);
      out.add(pennies(v) * f);
    }
  };
  for (const v of Object.values(n.financialData?.rates ?? {})) add(v as number);
  const walk = (r: Rule) => {
    if (r.type === 'all' || r.type === 'any' || r.type === 'not') r.rules.forEach(walk);
    else if (r.type === 'comparison' && MONEY_RULE_FIELDS.has(r.field)) add(r.value);
  };
  (n.eligibility.rules ?? []).forEach(r => walk(r as Rule));
  return out;
}

const nodes = Object.values(NODES);
const own = new Map(nodes.map(n => [n.id, structuredValues(n)]));
const anywhere = new Map<number, string[]>();
for (const [id, set] of own) for (const v of set) anywhere.set(v, [...(anywhere.get(v) ?? []), id]);

// ─── PROSE ──────────────────────────────────────────────────────────────────

function proseFields(n: ServiceNode): { field: string; text: string }[] {
  const e = n.eligibility;
  const list = (name: string, arr?: string[]) => (arr ?? []).map((t, i) => ({ field: `${name}.${i}`, text: t }));
  return [
    { field: 'desc', text: n.desc },
    { field: 'eligibility.summary', text: e.summary },
    ...e.criteria.map((c, i) => ({ field: `eligibility.criteria.${i}`, text: c.description })),
    ...list('eligibility.keyQuestions', e.keyQuestions),
    ...list('eligibility.autoQualifiers', e.autoQualifiers),
    ...list('eligibility.exclusions', e.exclusions),
    ...list('eligibility.ruleIn', e.ruleIn),
    ...list('eligibility.ruleOut', e.ruleOut),
    ...list('eligibility.evidenceRequired', e.evidenceRequired),
    ...list('agentInteraction.agentSteps', n.agentInteraction?.agentSteps),
    ...(n.contactInfo?.notes ? [{ field: 'contactInfo.notes', text: n.contactInfo.notes }] : []),
  ].filter(p => p.text);
}

/** "£1,327.75", "£151", "£16k" -> pennies. Skips ranges' "k"/"m" shorthand it cannot read exactly. */
function amounts(text: string): { raw: string; value: number }[] {
  const out: { raw: string; value: number }[] = [];
  for (const m of text.matchAll(/£\s?(\d{1,3}(?:,\d{3})+|\d+)(\.\d{1,2})?(\s?(?:k|m|million|bn)\b)?/gi)) {
    if (m[3]) continue;                               // "£16k", "£5 million": shorthand, not a quotable figure
    out.push({ raw: m[0], value: pennies(Number(m[1].replace(/,/g, '') + (m[2] ?? ''))) });
  }
  return out;
}

/** Current UK tax year's first calendar year: the year starting 6 April. */
function currentTaxYearStart(d = new Date()): number {
  const y = d.getUTCFullYear();
  const afterApril6 = d.getUTCMonth() > 3 || (d.getUTCMonth() === 3 && d.getUTCDate() >= 6);
  return afterApril6 ? y : y - 1;
}
const CURRENT = currentTaxYearStart();

// ─── RUN ────────────────────────────────────────────────────────────────────

interface Finding {
  id: string; field: string; kind: 'unbacked amount' | 'stale year label'; detail: string; text: string;
  /** --online only: whether the figure appears on one of the service's cited pages. */
  onPage?: boolean; value?: number;
}
const findings: Finding[] = [];
let checked = 0;

for (const n of nodes) {
  for (const { field, text } of proseFields(n)) {
    checked++;
    for (const a of amounts(text)) {
      if (a.value === 0 || own.get(n.id)!.has(a.value) || anywhere.has(a.value)) continue;
      findings.push({ id: n.id, field, kind: 'unbacked amount', detail: `${a.raw} matches no rate or rule threshold in the graph`, text, value: a.value });
    }
    // "2024/25", "2024-25", "2024 to 2025": flag any year pair that ended before the current tax year.
    for (const m of text.matchAll(/\b(20\d{2})\s?(?:\/|-|–| to )\s?(20)?(\d{2})\b/g)) {
      const start = Number(m[1]);
      const end = Number(`20${m[3]}`);
      if (end !== start + 1) continue;               // not a year pair
      if (start < CURRENT) {
        findings.push({ id: n.id, field, kind: 'stale year label', detail: `"${m[0]}" is before ${CURRENT}-${String(CURRENT + 1).slice(2)}`, text });
      }
    }
  }
}

if (ONLINE) {
  const unbacked = findings.filter(f => f.kind === 'unbacked amount');
  console.error(`Looking for ${unbacked.length} figures on their services' pages...`);
  for (const f of unbacked) {
    const n = NODES[f.id];
    const urls = [...new Set([n.govuk_url, n.financialData?.source, ...(n.eligibility.sources ?? [])].filter(Boolean) as string[])];
    const forms = moneyRenderings(f.value! / 100);
    f.onPage = false;
    for (const url of urls) {
      const text = await pageText(url);
      if (text && forms.some(r => new RegExp(`${r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d])`).test(text))) { f.onPage = true; break; }
    }
  }
}

if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ checkedAt: new Date().toISOString(), findings }, null, 2) + '\n');

const services = new Set(findings.map(f => f.id));
console.log('─── CONSISTENCY CHECK (prose against structured values) ────────');
console.log(`Prose fields checked: ${checked}`);
console.log(`Unbacked amounts:     ${findings.filter(f => f.kind === 'unbacked amount').length}`);
if (ONLINE) {
  console.log(`  on a cited page:    ${findings.filter(f => f.onPage === true).length}  (sourced prose, not modelled as a rate)`);
  console.log(`  on no cited page:   ${findings.filter(f => f.onPage === false).length}  (stale or invented: fix these)`);
}
console.log(`Stale year labels:    ${findings.filter(f => f.kind === 'stale year label').length}`);
console.log(`Services affected:    ${services.size}`);
for (const id of [...services].sort()) {
  console.log(`\n  ${id}`);
  for (const f of findings.filter(x => x.id === id)) {
    const where = f.onPage === undefined ? '' : f.onPage ? '  [on its page]' : '  [ON NO CITED PAGE]';
    console.log(`    ${f.kind.padEnd(17)} ${f.field.padEnd(30)} ${f.detail}${where}`);
    console.log(`      "${f.text.slice(0, 150)}${f.text.length > 150 ? '…' : ''}"`);
  }
}

const failing = ONLINE ? findings.filter(f => f.onPage !== true) : findings;
if (STRICT && failing.length) process.exit(1);
