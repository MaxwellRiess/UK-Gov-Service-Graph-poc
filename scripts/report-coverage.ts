/**
 * report-coverage.ts — How much of the graph is confirmed, and why the rest is not
 *
 * Counts every claim field exactly as get_service reports it (provenanceFor),
 * so the number here is the number an agent sees. Fields that are not
 * confirmed are split by the reason the verification passes left, because
 * each reason has a different fix (docs/verification-procedure.md):
 *
 *   contradicted        a source says otherwise                    → correct
 *   awaiting-reverify   a fix was applied, not yet re-judged       → re-judge
 *   partly-supported    some claims supported, some not            → refine
 *   not-stated          no claim found on the cited pages          → search wider, else remove
 *   no-verdict          the check failed (bad quote, 403, literal) → re-run or check by hand
 *   value-changed       edited since it was checked                → re-verify
 *   unsourced           never checked                              → verify
 *   inferred            an authored judgement, no source expected  → leave
 *
 * Removing a claim raises the confirmed share without adding any truth, so
 * the confirmed count is reported alongside the share. A pass that raises
 * the share while the count falls has only deleted things.
 *
 * Usage:
 *   npx tsx scripts/report-coverage.ts            # print
 *   npx tsx scripts/report-coverage.ts --write    # also append a snapshot to data/coverage-history.jsonl
 */

import { NODES } from '../src/graph-data.js';
import { provenanceFor } from '../src/provenance-view.js';
import { appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WRITE = process.argv.includes('--write');
const HISTORY = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'coverage-history.jsonl');

type Bucket =
  | 'confirmed' | 'inferred' | 'unsourced' | 'value-changed' | 'contradicted'
  | 'awaiting-reverify' | 'partly-supported' | 'not-stated' | 'no-verdict';

const BUCKETS: Bucket[] = [
  'confirmed', 'contradicted', 'awaiting-reverify', 'partly-supported',
  'not-stated', 'no-verdict', 'value-changed', 'unsourced', 'inferred',
];

function bucketOf(status: string, note = '', claims?: { supported: number }): Bucket {
  if (status === 'confirmed' || status === 'inferred' || status === 'unsourced') return status;
  if (note === 'Value has changed since it was checked.') return 'value-changed';
  if (/awaiting independent re-verification/i.test(note)) return 'awaiting-reverify';
  if (/contradicted:/.test(note)) return 'contradicted';
  if (/partly supported:/.test(note) || (claims && claims.supported > 0)) return 'partly-supported';
  if (/not stated:/.test(note)) return 'not-stated';
  return 'no-verdict';
}

/** `eligibility.criteria.3` → `eligibility.criteria`; `financialData.rates.x` → `financialData.rates`. */
function groupOf(path: string): string {
  const parts = path.split('.');
  return parts[0] === 'desc' || parts[0] === 'deadline' || parts[0] === 'nations' || parts[0] === 'deptKey' || parts[0] === 'govuk_url'
    ? parts[0]
    : parts.slice(0, 2).join('.');
}

const totals = Object.fromEntries(BUCKETS.map(b => [b, 0])) as Record<Bucket, number>;
const byGroup: Record<string, Record<Bucket, number>> = {};

for (const node of Object.values(NODES)) {
  const { fields } = provenanceFor(node);
  for (const [path, ev] of Object.entries(fields)) {
    const b = bucketOf(ev.status, ev.note, ev.claims);
    totals[b]++;
    const g = groupOf(path);
    byGroup[g] ??= Object.fromEntries(BUCKETS.map(x => [x, 0])) as Record<Bucket, number>;
    byGroup[g][b]++;
  }
}

const all = Object.values(totals).reduce((a, b) => a + b, 0);
// Inferred fields are authored judgements (edges, deptKey); no source is expected, so they sit outside the denominator.
const checkable = all - totals.inferred;
const share = (100 * totals.confirmed / checkable).toFixed(1);

const rows = Object.entries(byGroup)
  .map(([g, c]) => ({ group: g, ...c, notConfirmed: BUCKETS.filter(b => b !== 'confirmed' && b !== 'inferred').reduce((s, b) => s + c[b], 0) }))
  .sort((a, b) => b.notConfirmed - a.notConfirmed);

console.log(`Claim fields: ${all}  (inferred, excluded: ${totals.inferred})`);
console.log(`Confirmed:    ${totals.confirmed} of ${checkable}  (${share}%)\n`);
console.table(Object.fromEntries(rows.map(({ group, ...r }) => [group, r])));

if (WRITE) {
  appendFileSync(HISTORY, JSON.stringify({ at: new Date().toISOString(), all, checkable, share: Number(share), ...totals }) + '\n');
  console.log(`\nSnapshot appended to ${HISTORY}`);
}
