/**
 * check-provenance.ts — Keep provenance honest about the data it vouches for
 *
 * Two independent checks:
 *
 *   Value drift (offline, deterministic).  Every record stores a hash of the
 *   value it was written for. If graph-data.ts changed and provenance did not,
 *   the hash stops matching and the record is now vouching for a value nobody
 *   verified. This is a repo-internal inconsistency, so it fails the build.
 *
 *   Quote staleness (online, --online only).  Re-fetch each source and confirm
 *   the stored span is still present. When GOV.UK rewrites the sentence a rate
 *   lives in, the field drops to `unverified` on its own. This needs the
 *   network, so by default it is skipped and CI stays deterministic.
 *
 * Quote staleness is deliberately not a build failure: GOV.UK changing its
 * wording is normal and not the contributor's fault. It opens review work.
 * Value drift is a failure, because it means the repo contradicts itself.
 *
 * Usage:
 *   npx tsx scripts/check-provenance.ts             # offline, CI-safe
 *   npx tsx scripts/check-provenance.ts --online    # also re-check quotes
 *   npx tsx scripts/check-provenance.ts --online --write   # demote stale to unverified
 *   npx tsx scripts/check-provenance.ts --online --report stale.json   # for CI issue
 */

import { NODES } from '../src/graph-data.js';
import {
  loadProvenance, saveProvenance, hashValue, getFieldValue,
  htmlToText, normaliseForMatch,
} from '../src/provenance.js';
import { writeFileSync } from 'node:fs';

const ONLINE = process.argv.includes('--online');
const WRITE  = process.argv.includes('--write');
const reportArg = process.argv.indexOf('--report');
const REPORT = reportArg !== -1 ? process.argv[reportArg + 1] : null;
const UA = 'UK-Gov-Service-Graph-Provenance/1.0';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const store = loadProvenance();
const nodes = NODES as Record<string, unknown>;

const drifted: { key: string; recorded: string; current: string }[] = [];
const orphaned: string[] = [];
interface StaleItem {
  key:        string;
  nodeId:     string;
  nodeName:   string;
  field:      string;
  value:      string;
  url:        string;
  quote:      string;
  verifiedAt: string;
  /** False when the value itself is gone from the page, not just the words around it. */
  valueStillOnPage: boolean;
}
const stale: StaleItem[] = [];
let quotesChecked = 0;
const unreachable = new Set<string>();

/**
 * Is the recorded value still somewhere on the page? A stale quote often just
 * means GOV.UK reworded the sentence; if the value is gone too, the graph is
 * very likely out of date. Money is matched with or without thousands commas,
 * phone numbers on their digits alone.
 */
function valueAppears(value: string, pageText: string): boolean {
  if (!value) return false;
  const page = normaliseForMatch(pageText);
  if (/^\+44/.test(value)) {
    const national = '0' + value.replace(/\D/g, '').slice(2);
    return pageText.replace(/[^\d]/g, '').includes(national);
  }
  const n = Number(value);
  if (!Number.isNaN(n) && value.trim() !== '') {
    const forms = new Set([
      n.toLocaleString('en-GB', { maximumFractionDigits: 2 }),
      n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      String(n),
    ]);
    return [...forms].some(f => page.includes(normaliseForMatch(f)));
  }
  return page.includes(normaliseForMatch(value));
}

// ─── VALUE DRIFT ────────────────────────────────────────────────────────────

for (const [key, record] of Object.entries(store.fields)) {
  const [nodeId, fieldPath] = key.split('#');
  const node = nodes[nodeId];

  if (!node) {
    orphaned.push(key);
    continue;
  }

  const current = getFieldValue(node, fieldPath);
  if (current === undefined) {
    orphaned.push(key);
    continue;
  }

  if (hashValue(current) !== record.valueHash) {
    drifted.push({
      key,
      recorded: record.valueSeen,
      current: typeof current === 'object' ? JSON.stringify(current) : String(current),
    });
  }
}

// ─── QUOTE STALENESS ────────────────────────────────────────────────────────

if (ONLINE) {
  const withQuotes = Object.entries(store.fields).filter(
    ([, r]) => r.confidence === 'confirmed' && r.sourceQuote,
  );
  console.error(`Re-checking ${withQuotes.length} stored quotes...`);

  const cache = new Map<string, string | null>();
  for (const [key, record] of withQuotes) {
    let text = cache.get(record.sourceUrl);
    if (text === undefined) {
      text = null;
      try {
        const parsed = new URL(record.sourceUrl);
        const isGovUk = parsed.host === 'www.gov.uk' || parsed.host === 'gov.uk';
        if (isGovUk) {
          const res = await fetch(`https://www.gov.uk/api/content${parsed.pathname.replace(/\/$/, '')}`,
            { headers: { 'User-Agent': UA }, redirect: 'follow' });
          if (res.ok) {
            const det = ((await res.json()) as any).details ?? {};
            const bodies: string[] = [];
            if (typeof det.body === 'string') bodies.push(det.body);
            for (const p of det.parts ?? []) if (typeof p.body === 'string') bodies.push(p.body);
            if (bodies.length) text = htmlToText(bodies.join(' \n '));
          }
        }
        if (text === null) {
          const res = await fetch(record.sourceUrl, { headers: { 'User-Agent': UA }, redirect: 'follow' });
          if (res.ok) text = htmlToText(await res.text());
        }
      } catch { /* leave null */ }
      cache.set(record.sourceUrl, text);
      await sleep(150);
    }

    // Unreachable is not stale — don't demote a field over a network blip.
    if (text === null) { unreachable.add(record.sourceUrl); continue; }
    quotesChecked++;

    // The stored quote carries ellipses from windowing; match on its core.
    const core = normaliseForMatch(record.sourceQuote.replace(/^…|…$/g, ''));
    if (core && !normaliseForMatch(text).includes(core)) {
      const [nodeId, field] = key.split('#');
      const value = record.valueSeen ?? '';
      stale.push({
        key, nodeId, field, value,
        nodeName:   (nodes[nodeId] as { name?: string } | undefined)?.name ?? nodeId,
        url:        record.sourceUrl,
        quote:      record.sourceQuote,
        verifiedAt: record.verifiedAt,
        valueStillOnPage: valueAppears(value, text),
      });
      if (WRITE) {
        store.fields[key].confidence = 'unverified';
        store.fields[key].rationale =
          `Source text changed — the quote this rested on is no longer on the page (checked ${new Date().toISOString()}).`;
      }
    }
  }

  if (WRITE && stale.length) {
    saveProvenance(store);
    console.error(`Demoted ${stale.length} stale records to unverified`);
  }
}

if (ONLINE && REPORT) {
  writeFileSync(REPORT, JSON.stringify({
    checkedAt:   new Date().toISOString(),
    quotesChecked,
    unreachable: [...unreachable],
    stale,
  }, null, 2) + '\n');
  console.error(`Stale-quote report written to ${REPORT}`);
}

// ─── REPORT ─────────────────────────────────────────────────────────────────

const total = Object.keys(store.fields).length;
const confirmed = Object.values(store.fields).filter(r => r.confidence === 'confirmed').length;

console.log('─── PROVENANCE CHECK ───────────────────────────────────────────');
console.log(`Records:            ${total}`);
console.log(`Confirmed:          ${confirmed} (${Math.round((100 * confirmed) / total)}%)`);
console.log(`Value drift:        ${drifted.length}`);
console.log(`Orphaned records:   ${orphaned.length}`);
console.log(ONLINE ? `Stale quotes:       ${stale.length}` : 'Stale quotes:       skipped (pass --online)');

if (drifted.length) {
  console.log('\n── VALUE DRIFT — data changed without re-verification ──');
  for (const d of drifted.slice(0, 40)) {
    console.log(`  ${d.key}\n      verified: ${d.recorded}\n      now:      ${d.current}`);
  }
  if (drifted.length > 40) console.log(`  ... and ${drifted.length - 40} more`);
}

if (orphaned.length) {
  console.log('\n── ORPHANED — node or field no longer exists ──');
  for (const k of orphaned.slice(0, 40)) console.log(`  ${k}`);
  if (orphaned.length > 40) console.log(`  ... and ${orphaned.length - 40} more`);
}

if (stale.length) {
  console.log('\n── STALE QUOTES — source rewritten, needs re-verification ──');
  for (const s of stale.slice(0, 40)) console.log(`  ${s.key}\n      ${s.url}`);
  if (stale.length > 40) console.log(`  ... and ${stale.length - 40} more`);
}

// Only repo-internal inconsistency fails the build. A GOV.UK rewrite is review
// work, not a broken commit.
if (drifted.length || orphaned.length) {
  console.log('\nFAIL: provenance is out of step with graph-data.ts.');
  console.log('Re-run scripts/verify-tier1.ts and scripts/verify-tier2.ts with --write.');
  process.exit(1);
}
console.log('\nOK');
