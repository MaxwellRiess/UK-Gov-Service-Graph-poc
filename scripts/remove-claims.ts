/**
 * remove-claims.ts — Delete claims no official page states, and log each one
 *
 * Stage 4 of docs/verification-procedure.md, and the authRequired clean-up
 * before it. A field is only removed when its provenance record says the
 * judge found none of its claims on the pages searched (`not stated`, with no
 * claim supported). Partly supported and contradicted fields are left alone:
 * they need rewording, not deletion.
 *
 * Every removal is appended to data/removed-claims.json with the old value,
 * the page that was searched and the judge's note, so a claim can come back
 * if a source for it turns up. The field's provenance record is dropped with
 * it, since there is no longer a value for it to vouch for.
 *
 * Only whole-line fields are handled for now (`authRequired: '...',`). List
 * items and prose clauses go through propose-fixes / apply-fixes.
 *
 * Usage:
 *   npx tsx scripts/remove-claims.ts --field agentInteraction.authRequired            # dry run
 *   npx tsx scripts/remove-claims.ts --field agentInteraction.authRequired --write
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProvenance, saveProvenance } from '../src/provenance.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GRAPH = join(ROOT, 'src', 'graph-data.ts');
const LOG = join(ROOT, 'data', 'removed-claims.json');

const WRITE = process.argv.includes('--write');
const fieldArg = process.argv.indexOf('--field');
const FIELD = fieldArg !== -1 ? process.argv[fieldArg + 1] : null;

// Whole-line fields this script knows how to delete, by the key's last segment.
const LINE_FIELDS = new Set(['agentInteraction.authRequired']);
if (!FIELD || !LINE_FIELDS.has(FIELD)) {
  console.error(`--field must be one of: ${[...LINE_FIELDS].join(', ')}`);
  process.exit(1);
}
const prop = FIELD.split('.').pop()!;

export interface RemovedClaim {
  key:        string;
  value:      string;
  removedAt:  string;
  /** Pages the judge searched and did not find the claim on. */
  searched:   string[];
  note:       string;
}

const store = loadProvenance();
const isNotStated = (r: { rationale?: string; claims?: { supported: number } }) =>
  /not stated:/.test(r.rationale ?? '') &&
  !/partly supported:|contradicted:|awaiting independent re-verification/i.test(r.rationale ?? '') &&
  !(r.claims && r.claims.supported > 0);

const targets = Object.entries(store.fields)
  .filter(([k, r]) => k.endsWith(`#${FIELD}`) && r.confidence === 'unverified' && isNotStated(r));

let src = readFileSync(GRAPH, 'utf-8');
const lines = src.split('\n');
const removed: RemovedClaim[] = [];
const missed: string[] = [];
const today = new Date().toISOString();

for (const [key, record] of targets) {
  const id = key.split('#')[0];
  const start = lines.findIndex(l => l.startsWith(`    id: '${id}',`));
  if (start === -1) { missed.push(`${key}: node not found`); continue; }
  // The node block ends at the next node's id line.
  let end = lines.findIndex((l, i) => i > start && /^    id: '/.test(l));
  if (end === -1) end = lines.length;
  const re = new RegExp(`^\\s+${prop}:\\s*'[^']*',\\s*$`);
  const hits = lines.slice(start, end).map((l, i) => (re.test(l) ? start + i : -1)).filter(i => i !== -1);
  if (hits.length !== 1) { missed.push(`${key}: ${hits.length} matching lines`); continue; }
  lines[hits[0]] = '\0';
  removed.push({ key, value: record.valueSeen, removedAt: today, searched: [record.sourceUrl], note: record.rationale ?? '' });
  if (WRITE) delete store.fields[key];
}

console.log(`${FIELD}: ${targets.length} not stated, ${removed.length} removable${missed.length ? `, ${missed.length} skipped` : ''}`);
for (const m of missed) console.log(`  skipped ${m}`);

if (WRITE) {
  writeFileSync(GRAPH, lines.filter(l => l !== '\0').join('\n'), 'utf-8');
  saveProvenance(store);
  const log: RemovedClaim[] = existsSync(LOG) ? JSON.parse(readFileSync(LOG, 'utf-8')) : [];
  writeFileSync(LOG, JSON.stringify([...log, ...removed], null, 2) + '\n', 'utf-8');
  console.log(`Removed ${removed.length}; logged to ${LOG}`);
} else {
  console.log('Dry run. Pass --write to apply.');
}
