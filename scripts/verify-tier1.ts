/**
 * verify-tier1.ts — Verify identity fields against the GOV.UK Content API
 *
 * Tier 1 fields are the ones with a machine-readable authoritative source:
 * does the service exist, at what canonical URL, owned by which department,
 * and has it been withdrawn. GOV.UK publishes all of this itself, so this
 * needs no human judgement and no model.
 *
 *   https://www.gov.uk/api/content/<path>
 *
 * Writes per-field provenance for `govuk_url` and `dept`, and reports drift
 * the graph should act on: dead URLs, pages that have moved, services whose
 * owning department no longer matches, and withdrawn services.
 *
 * Recording `contentId` is the durable part. GOV.UK URLs move — several in
 * this graph already have — but content_id survives the move, so the next run
 * can tell "this page was renamed" apart from "this service is gone".
 *
 * Usage:
 *   npx tsx scripts/verify-tier1.ts            # report only
 *   npx tsx scripts/verify-tier1.ts --write    # also write data/provenance.json
 */

import { NODES } from '../src/graph-data.js';
import {
  loadProvenance, saveProvenance, provenanceKey, hashValue,
  type FieldProvenance,
} from '../src/provenance.js';

const WRITE = process.argv.includes('--write');
const UA = 'UK-Gov-Service-Graph-Provenance/1.0';

/**
 * The Content API's `links.organisations` says who *publishes* a page, which is
 * not who *delivers* the service. `/register-birth` is published by HM Passport
 * Office but delivered by GRO; every council service is published by MHCLG but
 * delivered by a local authority. The graph's `deptKey` is a delivery-routing
 * decision — it drives which helpline a citizen is given — so the publisher
 * field cannot confirm it, and treating a difference as an error produces 62
 * false positives on this graph.
 *
 * So `deptKey` is recorded as `inferred` with the publisher captured as context.
 * This table exists only to decide which differences are worth a human look:
 * where the publisher maps cleanly onto a *different* deptKey the graph already
 * uses, and the graph's own key is a specific department rather than an
 * aggregate like `la` or `other`.
 */
const ORG_TO_DEPTKEY: Record<string, string> = {
  'HM Revenue & Customs': 'hmrc',
  'Department for Work and Pensions': 'dwp',
  'Driver and Vehicle Licensing Agency': 'dvla',
  'Driver and Vehicle Standards Agency': 'dvsa',
  'Companies House': 'ch',
  'HM Courts & Tribunals Service': 'hmcts',
  'Office of the Public Guardian': 'opg',
  'HM Land Registry': 'lr',
  'UK Visas and Immigration': 'ho',
  'Home Office': 'ho',
  'Environment Agency': 'ea',
  'Student Loans Company': 'slc',
  'The Pensions Regulator': 'tpr',
  'Welsh Government': 'wg',
  'Social Security Scotland': 'sss',
};

/** deptKeys that aggregate many publishers, so a publisher difference means nothing. */
const AGGREGATE_DEPTKEYS = new Set(['la', 'other', 'gro', 'nhs']);

interface ApiResult {
  ok:            boolean;
  status:        number;
  contentId?:    string;
  basePath?:     string;
  documentType?: string;
  updatedAt?:    string;
  orgs?:         string[];
  withdrawn?:    boolean;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Fetch with retries. Without this, a transient connection drop reads as a dead
 * URL and the run reports live services as gone — which it did on the first
 * pass, flagging five perfectly healthy GRO pages.
 */
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

/** Look a GOV.UK path up in the Content API. Follows the 303 that guide sub-pages issue. */
async function contentApi(path: string): Promise<ApiResult> {
  const res = await fetchRetry(`https://www.gov.uk/api/content${path}`);
  if (!res.ok) return { ok: false, status: res.status };
  const d: any = await res.json();
  return {
    ok: true,
    status: res.status,
    contentId:    d.content_id,
    basePath:     d.base_path,
    documentType: d.document_type,
    updatedAt:    d.public_updated_at,
    orgs:         (d.links?.organisations ?? []).map((o: any) => o.title),
    withdrawn:    Boolean(d.withdrawn_notice && Object.keys(d.withdrawn_notice).length),
  };
}

async function httpStatus(url: string): Promise<number> {
  try {
    return (await fetchRetry(url)).status;
  } catch {
    return 0;
  }
}

// ─── RUN ────────────────────────────────────────────────────────────────────

const nodes = Object.values(NODES);
const store = loadProvenance();
const now = new Date().toISOString();

const dead:      { id: string; url: string; status: number }[] = [];
const moved:     { id: string; from: string; to: string }[] = [];
const withdrawn: { id: string; url: string }[] = [];
const deptDrift: { id: string; graph: string; api: string[] }[] = [];
const offSite:   { id: string; url: string; status: number }[] = [];

let confirmed = 0;

// One API call per unique URL, not per node — 5 URLs are shared between nodes.
const byUrl = new Map<string, typeof nodes>();
for (const n of nodes) {
  const list = byUrl.get(n.govuk_url) ?? [];
  list.push(n);
  byUrl.set(n.govuk_url, list);
}

const urls = [...byUrl.keys()];
console.error(`Verifying ${urls.length} unique URLs across ${nodes.length} nodes...`);

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const group = byUrl.get(url)!;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    for (const n of group) dead.push({ id: n.id, url, status: -1 });
    continue;
  }

  const isGovUk = parsed.host === 'www.gov.uk' || parsed.host === 'gov.uk';

  if (!isGovUk) {
    // No Content API off GOV.UK. Existence is all that can be established.
    const status = await httpStatus(url);
    for (const n of group) {
      if (status >= 200 && status < 400) {
        store.fields[provenanceKey(n.id, 'govuk_url')] = {
          valueHash: hashValue(n.govuk_url),
          valueSeen: n.govuk_url,
          sourceUrl: n.govuk_url,
          sourceQuote: '',
          method: 'http-status',
          verifiedAt: now,
          confidence: 'confirmed',
          rationale: `HTTP ${status}. Host ${parsed.host} has no Content API, so only existence is established.`,
        };
        confirmed++;
      } else {
        offSite.push({ id: n.id, url, status });
      }
    }
    await sleep(120);
    continue;
  }

  const path = parsed.pathname.replace(/\/$/, '');
  let result: ApiResult;
  try {
    result = await contentApi(path);
  } catch (err: any) {
    for (const n of group) dead.push({ id: n.id, url, status: 0 });
    await sleep(120);
    continue;
  }

  if (!result.ok) {
    for (const n of group) dead.push({ id: n.id, url, status: result.status });
    await sleep(120);
    continue;
  }

  const canonical = `https://www.gov.uk${result.basePath}`;
  if (result.basePath && result.basePath !== path) {
    for (const n of group) moved.push({ id: n.id, from: url, to: canonical });
  }
  if (result.withdrawn) {
    for (const n of group) withdrawn.push({ id: n.id, url });
  }

  for (const n of group) {
    const base: Omit<FieldProvenance, 'valueHash' | 'valueSeen'> = {
      sourceUrl: canonical,
      sourceQuote: '',
      contentId: result.contentId,
      pageUpdatedAt: result.updatedAt,
      method: 'govuk-content-api',
      verifiedAt: now,
      // A node pointing at a stale sub-path or redirect is not confirmed —
      // the page resolves, but not to the URL the graph claims is canonical.
      confidence: result.basePath === path ? 'confirmed' : 'unverified',
    };

    store.fields[provenanceKey(n.id, 'govuk_url')] = {
      ...base,
      valueHash: hashValue(n.govuk_url),
      valueSeen: n.govuk_url,
      rationale: result.basePath === path
        ? undefined
        : `Graph URL resolves to ${canonical}; update govuk_url to the canonical path.`,
    };
    if (base.confidence === 'confirmed') confirmed++;

    // Delivery ownership. Not confirmable from the publisher field (see the note
    // on ORG_TO_DEPTKEY), so it is recorded as an authored judgement with the
    // publisher attached as context for whoever reviews it.
    const orgs = result.orgs ?? [];
    const publisherKeys = orgs.map(o => ORG_TO_DEPTKEY[o]).filter(Boolean);
    const agrees = publisherKeys.includes(n.deptKey);

    // Worth a look only when the publisher points at a different *specific*
    // department and the graph is not using an aggregate key.
    if (!agrees && publisherKeys.length && !AGGREGATE_DEPTKEYS.has(n.deptKey)) {
      deptDrift.push({ id: n.id, graph: n.deptKey, api: orgs });
    }

    store.fields[provenanceKey(n.id, 'deptKey')] = {
      ...base,
      valueHash: hashValue(n.deptKey),
      valueSeen: n.deptKey,
      confidence: agrees ? 'confirmed' : 'inferred',
      rationale: agrees
        ? undefined
        : `Delivery-routing judgement. GOV.UK publisher for this page is ${JSON.stringify(orgs)}, which is a publishing role and need not match delivery.`,
    };
    if (agrees) confirmed++;
  }

  if ((i + 1) % 25 === 0) console.error(`  ${i + 1}/${urls.length}...`);
  await sleep(120);
}

if (WRITE) {
  saveProvenance(store);
  console.error(`\nWrote ${Object.keys(store.fields).length} field records to data/provenance.json`);
}

// ─── REPORT ─────────────────────────────────────────────────────────────────

const line = (s: string) => console.log(s);
line('─── TIER 1 VERIFICATION ────────────────────────────────────────');
line(`Nodes:              ${nodes.length}`);
line(`Unique URLs:        ${urls.length}`);
line(`Fields confirmed:   ${confirmed}`);
line('');
line(`Dead URLs:          ${dead.length}`);
for (const d of dead) line(`   ${String(d.status).padStart(4)}  ${d.id.padEnd(38)} ${d.url}`);
line('');
line(`Moved / non-canonical: ${moved.length}`);
for (const m of moved) line(`   ${m.id.padEnd(38)} ${m.from}\n        -> ${m.to}`);
line('');
line(`Withdrawn:          ${withdrawn.length}`);
for (const w of withdrawn) line(`   ${w.id.padEnd(38)} ${w.url}`);
line('');
line(`Dept worth review:  ${deptDrift.length}   (publisher maps to a different specific dept)`);
for (const d of deptDrift) line(`   ${d.id.padEnd(38)} graph="${d.graph}"  publisher=${JSON.stringify(d.api)}`);
line('');
line(`Off-site unreachable: ${offSite.length}`);
for (const o of offSite) line(`   ${String(o.status).padStart(4)}  ${o.id.padEnd(38)} ${o.url}`);
