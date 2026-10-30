/**
 * check-freshness.ts — Monitor GOV.UK pages for content changes
 *
 * Fetches each govuk_url, computes a normalised content hash, and compares
 * against stored hashes. Reports which pages have changed so the maintainer
 * can update the graph.
 *
 * What gets hashed is the text the verification scripts read, not the page's
 * HTML. For GOV.UK that is the Content API text of every part of a guide, so
 * a rate change on a "what you'll get" section is caught even when the node
 * links to the overview; the rendered HTML only ever holds the part linked
 * to. It also drops navigation and layout, which used to raise issues for
 * pages whose content had not changed. Other sites fall back to the text of
 * the page's <main> element.
 *
 * Changing what is hashed would make every page look changed once. Entries
 * carry the method that produced them, and an entry from an older method is
 * re-baselined quietly rather than reported.
 *
 * Usage:
 *   npx tsx scripts/check-freshness.ts              # dry run (print report)
 *   npx tsx scripts/check-freshness.ts --update      # write new hashes + report
 *
 * The script writes the change report to stdout as JSON. In CI, pipe to a file:
 *   npx tsx scripts/check-freshness.ts --update > report.json
 */

import { NODES } from '../src/graph-data.js';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pageText } from './lib/page-text.js';
import { normaliseForMatch } from '../src/provenance.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HASHES_PATH = join(__dirname, '..', '.freshness', 'hashes.json');
const UPDATE = process.argv.includes('--update');
/** Bump when what gets hashed changes, so old entries re-baseline instead of alerting. */
const HASH_METHOD = 'page-text-v3';  // v3: page title and summary included

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface HashEntry {
  sha256:      string;
  lastChecked: string;
  lastChanged: string;
  serviceIds:  string[];
  method?:     string;
}

interface HashStore {
  schemaVersion: number;
  lastRun:       string;
  hashes:        Record<string, HashEntry>;
}

interface ChangeItem {
  url:          string;
  serviceIds:   string[];
  serviceNames: string[];
}

interface FreshnessReport {
  timestamp:    string;
  totalChecked: number;
  changed:      ChangeItem[];
  errors:       { url: string; serviceIds: string[]; error: string }[];
  new_urls:     ChangeItem[];
  unchanged:    number;
  /** Entries hashed by an older method, re-baselined without alerting. */
  rebaselined:  number;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** Sleep for ms milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** The text verification reads, normalised so cosmetic whitespace does not count as change. */
async function fetchText(url: string): Promise<string> {
  let text = await pageText(url);
  if (text === null) {
    await sleep(2000);           // one retry: most failures are transient
    text = await pageText(url, true);  // bypass the cached failure, or this "retry" never fetches
  }
  if (text === null) throw new Error('Could not fetch page text');
  return normaliseForMatch(text);
}

// ─── BUILD URL MAP ──────────────────────────────────────────────────────────

const urlMap = new Map<string, { ids: string[]; names: string[] }>();

for (const node of Object.values(NODES)) {
  if (!node.govuk_url) continue;
  const existing = urlMap.get(node.govuk_url);
  if (existing) {
    existing.ids.push(node.id);
    existing.names.push(node.name);
  } else {
    urlMap.set(node.govuk_url, { ids: [node.id], names: [node.name] });
  }
}

// ─── LOAD EXISTING HASHES ───────────────────────────────────────────────────

let store: HashStore;
try {
  store = JSON.parse(readFileSync(HASHES_PATH, 'utf-8'));
} catch {
  store = { schemaVersion: 1, lastRun: '', hashes: {} };
}

// ─── MAIN LOOP ──────────────────────────────────────────────────────────────

const now = new Date().toISOString();
const report: FreshnessReport = {
  timestamp: now,
  totalChecked: 0,
  changed: [],
  errors: [],
  new_urls: [],
  unchanged: 0,
  rebaselined: 0,
};

const urls = [...urlMap.keys()];
console.error(`Checking ${urls.length} unique URLs...`);

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const { ids, names } = urlMap.get(url)!;

  try {
    const hash = sha256(await fetchText(url));

    report.totalChecked++;

    const existing = store.hashes[url];
    if (!existing) {
      // New URL — no previous hash
      report.new_urls.push({ url, serviceIds: ids, serviceNames: names });
      store.hashes[url] = {
        sha256: hash,
        lastChecked: now,
        lastChanged: now,
        serviceIds: ids,
        method: HASH_METHOD,
      };
    } else if (existing.method !== HASH_METHOD) {
      // Hashed a different way last time; a mismatch says nothing about content.
      report.rebaselined++;
      store.hashes[url] = { ...existing, sha256: hash, lastChecked: now, serviceIds: ids, method: HASH_METHOD };
    } else if (existing.sha256 !== hash) {
      // Content changed
      report.changed.push({ url, serviceIds: ids, serviceNames: names });
      store.hashes[url] = {
        sha256: hash,
        lastChecked: now,
        lastChanged: now,
        serviceIds: ids,
        method: HASH_METHOD,
      };
    } else {
      // Unchanged
      report.unchanged++;
      store.hashes[url].lastChecked = now;
      store.hashes[url].serviceIds = ids;  // update in case nodes changed
    }
  } catch (err: any) {
    report.errors.push({ url, serviceIds: ids, error: err.message });
  }

  // Rate limiting: 500ms between fetches
  if (i < urls.length - 1) {
    await sleep(500);
  }

  // Progress indicator every 20 URLs
  if ((i + 1) % 20 === 0) {
    console.error(`  ${i + 1}/${urls.length} checked...`);
  }
}

// ─── WRITE RESULTS ──────────────────────────────────────────────────────────

store.lastRun = now;

if (UPDATE) {
  const dir = join(__dirname, '..', '.freshness');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(HASHES_PATH, JSON.stringify(store, null, 2) + '\n', 'utf-8');
  console.error(`Hashes written to ${HASHES_PATH}`);
}

// Report to stdout
console.log(JSON.stringify(report, null, 2));

console.error(`\nDone: ${report.totalChecked} checked, ${report.changed.length} changed, ${report.new_urls.length} new, ${report.errors.length} errors, ${report.unchanged} unchanged, ${report.rebaselined} re-baselined`);
