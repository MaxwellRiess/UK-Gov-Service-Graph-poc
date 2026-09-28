/**
 * verify-links.ts — Check the links a service gives beyond its govuk_url
 *
 * verify-tier1.ts checks `govuk_url` against the GOV.UK Content API. Every
 * other link was unchecked, and they are the ones an agent hands a person to
 * act on: "start your application here", "use webchat", "find your office".
 * The divorce review found `hmrc-child-benefit-transfer`'s form link dead,
 * with nothing to flag it.
 *
 * Fields checked, where a node sets them:
 *   agentInteraction.onlineFormUrl, agentInteraction.apiUrl
 *   contactInfo.webchatUrl, contactInfo.contactFormUrl, contactInfo.officeLocatorUrl
 *
 * Department-level contact defaults (DEPT_CONTACTS) are shared across nodes
 * and have no per-node record, so they are not covered here.
 *
 * What a pass means: the link resolves. For www.gov.uk that is a Content API
 * lookup, which also catches withdrawn pages; elsewhere it is an HTTP status.
 * It does not mean the page is the right one; that is the judge-and-quote
 * pass's job.
 *
 * Statuses that say more about the requester than the page (401, 403, 429,
 * 5xx) are recorded `unverified` with the reason, not reported as dead: two
 * sites in this graph refuse automated requests but work in a browser.
 *
 * Usage:
 *   npx tsx scripts/verify-links.ts            # report only
 *   npx tsx scripts/verify-links.ts --write    # also write data/provenance.json
 *   npx tsx scripts/verify-links.ts --json links.json   # machine-readable report for CI
 */

import { writeFileSync } from 'node:fs';
import { NODES } from '../src/graph-data.js';
import { loadProvenance, saveProvenance, provenanceKey, hashValue } from '../src/provenance.js';

const WRITE = process.argv.includes('--write');
const jsonArg = process.argv.indexOf('--json');
const JSON_OUT = jsonArg !== -1 ? process.argv[jsonArg + 1] : null;
const UA = 'UK-Gov-Service-Graph-Provenance/1.0';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const LINK_FIELDS = [
  'agentInteraction.onlineFormUrl',
  'agentInteraction.apiUrl',
  'contactInfo.webchatUrl',
  'contactInfo.contactFormUrl',
  'contactInfo.officeLocatorUrl',
] as const;

type Outcome =
  | { kind: 'ok'; method: 'govuk-content-api' | 'http-status'; detail: string; contentId?: string; updatedAt?: string }
  | { kind: 'dead'; detail: string }
  | { kind: 'blocked'; detail: string };

async function fetchRetry(url: string, tries = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    } catch (err) {
      lastErr = err;
      await sleep(1000 * (i + 1));
    }
  }
  throw lastErr;
}

async function check(url: string): Promise<Outcome> {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { kind: 'dead', detail: 'Not a valid URL.' }; }

  if (parsed.host === 'www.gov.uk') {
    try {
      const res = await fetchRetry(`https://www.gov.uk/api/content${parsed.pathname.replace(/\/$/, '')}`);
      if (res.ok) {
        const d: any = await res.json();
        if (d.withdrawn_notice && Object.keys(d.withdrawn_notice).length) {
          return { kind: 'dead', detail: 'GOV.UK page is withdrawn.' };
        }
        return {
          kind: 'ok', method: 'govuk-content-api', detail: 'GOV.UK Content API resolves the page.',
          contentId: d.content_id, updatedAt: d.public_updated_at,
        };
      }
      if (res.status === 404 || res.status === 410) {
        return { kind: 'dead', detail: `GOV.UK Content API returned ${res.status}.` };
      }
      // Some www.gov.uk paths are routes, not content items; fall through to HTTP.
    } catch { /* fall through */ }
  }

  try {
    const res = await fetchRetry(url);
    if (res.ok) {
      return { kind: 'ok', method: 'http-status', detail: `HTTP ${res.status}. Existence only; this host has no structured API.` };
    }
    if (res.status === 404 || res.status === 410) return { kind: 'dead', detail: `HTTP ${res.status}.` };
    return { kind: 'blocked', detail: `HTTP ${res.status}: the host refused or failed the automated request. Check in a browser.` };
  } catch (err: any) {
    const code = err?.cause?.code ?? err?.message ?? 'unknown';
    // No DNS record means the service's domain is gone, not that we were refused.
    if (code === 'ENOTFOUND') return { kind: 'dead', detail: 'Domain no longer resolves (ENOTFOUND).' };
    return { kind: 'blocked', detail: `Request failed (${code}). Check in a browser.` };
  }
}

// ─── RUN ────────────────────────────────────────────────────────────────────

const store = loadProvenance();
const now = new Date().toISOString();

const targets: { id: string; field: string; url: string }[] = [];
for (const n of Object.values(NODES) as any[]) {
  for (const field of LINK_FIELDS) {
    const [group, key] = field.split('.');
    const url = n[group]?.[key];
    if (typeof url === 'string' && url) targets.push({ id: n.id, field, url });
  }
}

const unique = [...new Set(targets.map(t => t.url))];
console.error(`Checking ${targets.length} links (${unique.length} unique URLs)...`);

const results = new Map<string, Outcome>();
for (const [i, url] of unique.entries()) {
  results.set(url, await check(url));
  await sleep(150);
  if ((i + 1) % 50 === 0) console.error(`  ${i + 1}/${unique.length}`);
}

const dead: typeof targets = [];
const blocked: typeof targets = [];
for (const t of targets) {
  const r = results.get(t.url)!;
  const base = { valueHash: hashValue(t.url), valueSeen: t.url, sourceUrl: t.url, sourceQuote: '', verifiedAt: now };
  if (r.kind === 'ok') {
    store.fields[provenanceKey(t.id, t.field)] = {
      ...base, method: r.method, confidence: 'confirmed', rationale: r.detail,
      ...(r.contentId ? { contentId: r.contentId } : {}),
      ...(r.updatedAt ? { pageUpdatedAt: r.updatedAt } : {}),
    };
  } else {
    (r.kind === 'dead' ? dead : blocked).push(t);
    store.fields[provenanceKey(t.id, t.field)] = {
      ...base, method: 'http-status', confidence: 'unverified',
      rationale: r.kind === 'dead' ? `Link is dead: ${r.detail}` : r.detail,
    };
  }
}

if (WRITE) {
  saveProvenance(store);
  console.error(`Wrote provenance for ${targets.length} links`);
}

if (JSON_OUT) {
  const row = (t: typeof targets[number]) => ({ ...t, detail: (results.get(t.url) as { detail: string }).detail });
  writeFileSync(JSON_OUT, JSON.stringify({ checkedAt: now, checked: targets.length, dead: dead.map(row), blocked: blocked.map(row) }, null, 2) + '\n');
}

// ─── REPORT ─────────────────────────────────────────────────────────────────

const byField: Record<string, number> = {};
for (const t of targets) byField[t.field] = (byField[t.field] ?? 0) + 1;

console.log('─── LINK VERIFICATION ──────────────────────────────────────────');
console.log(`Links checked: ${targets.length}  (${Object.entries(byField).map(([f, c]) => `${f.split('.')[1]} ${c}`).join(', ')})`);
console.log(`Resolve:       ${targets.length - dead.length - blocked.length}`);
console.log(`Dead:          ${dead.length}`);
console.log(`Refused automated check: ${blocked.length}`);

console.log(`\n─── DEAD (${dead.length}) — fix or remove ───`);
for (const t of dead) console.log(`  ${t.id.padEnd(36)} ${t.field.padEnd(32)} ${t.url}\n      ${(results.get(t.url) as any).detail}`);
console.log(`\n─── REFUSED AUTOMATED CHECK (${blocked.length}) — check in a browser ───`);
for (const t of blocked) console.log(`  ${t.id.padEnd(36)} ${t.field.padEnd(32)} ${t.url}\n      ${(results.get(t.url) as any).detail}`);
