/**
 * check-freshness.ts — Monitor GOV.UK pages for content changes
 *
 * Fetches each govuk_url from the 138 service nodes, computes a normalised
 * content hash, and compares against stored hashes. Reports which pages
 * have changed so the maintainer can update the graph.
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const HASHES_PATH = join(__dirname, '..', '.freshness', 'hashes.json');
const UPDATE = process.argv.includes('--update');

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface HashEntry {
  sha256:      string;
  lastChecked: string;
  lastChanged: string;
  serviceIds:  string[];
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
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** Extract <main> tag content, strip HTML, normalise whitespace */
function normalise(html: string): string {
  // Try to extract <main> tag content (all target gov sites use semantic HTML)
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const content = mainMatch ? mainMatch[1] : html;

  // Strip HTML tags
  const text = content.replace(/<[^>]+>/g, ' ');

  // Collapse whitespace, trim, lowercase
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Sleep for ms milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Fetch with timeout and one retry */
async function fetchWithRetry(url: string): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'UK-Gov-Service-Graph-Freshness-Checker/1.0 (+https://github.com)',
        },
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (err: any) {
      if (attempt === 0) {
        await sleep(2000); // backoff before retry
        continue;
      }
      throw err;
    }
  }
  throw new Error('unreachable');
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
};

const urls = [...urlMap.keys()];
console.error(`Checking ${urls.length} unique URLs...`);

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const { ids, names } = urlMap.get(url)!;

  try {
    const html = await fetchWithRetry(url);
    const normalised = normalise(html);
    const hash = sha256(normalised);

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
      };
    } else if (existing.sha256 !== hash) {
      // Content changed
      report.changed.push({ url, serviceIds: ids, serviceNames: names });
      store.hashes[url] = {
        sha256: hash,
        lastChecked: now,
        lastChanged: now,
        serviceIds: ids,
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

console.error(`\nDone: ${report.totalChecked} checked, ${report.changed.length} changed, ${report.new_urls.length} new, ${report.errors.length} errors, ${report.unchanged} unchanged`);
