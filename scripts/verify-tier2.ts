/**
 * verify-tier2.ts — Verify literal values against the text of their source page
 *
 * Money amounts and phone numbers are literals: if the graph says Child Benefit
 * is £26.05 a week, that string has to appear on the page the graph cites. So
 * these need no model at all. Fetch the page, look for the value, and if it is
 * there, store the surrounding sentence as the quote.
 *
 * This is verification rather than extraction, which matters: there is nothing
 * for a model to get wrong, the check is reproducible, and a reviewer can see
 * exactly what the claim rests on. It is also how the graph's rates were found
 * to be a full tax year out of date — every 2025-26 figure stopped appearing on
 * the page it cites once the April 2026 rates went live.
 *
 * Fields covered:
 *   financialData.rates.<name>        against financialData.source
 *   contactInfo.phone.number          against the node's govuk_url
 *   contactInfo.additionalPhones[n]   against the node's govuk_url
 *
 * A value that is not found is recorded `unverified` and reported for review,
 * not declared wrong — a helpline may simply live on a linked contact page.
 * Deadlines and eligibility prose are not literals and need the extraction pass
 * in verify-tier2-llm.ts.
 *
 * Usage:
 *   npx tsx scripts/verify-tier2.ts            # report only
 *   npx tsx scripts/verify-tier2.ts --write    # also write data/provenance.json
 */

import { NODES } from '../src/graph-data.js';
import {
  loadProvenance, saveProvenance, provenanceKey, hashValue, normaliseForMatch,
} from '../src/provenance.js';
import { pageText, quoteAround, moneyRenderings } from './lib/page-text.js';

const WRITE = process.argv.includes('--write');
const UA = 'UK-Gov-Service-Graph-Provenance/1.0';

/** How a rate might be written on the page. `percent` keys render as "90%", money as "£3,500". */
function renderings(key: string, value: number): string[] {
  if (/percent|_pct|rate_percent/.test(key)) {
    return [`${value}%`, `${value} per cent`];
  }
  return moneyRenderings(value);
}

/**
 * Match a UK number however the page spaces it. The graph stores E.164
 * (`+44 800 169 0310`); GOV.UK prints national form (`0800 169 0310`), and the
 * grouping varies page to page, so digits are matched with optional separators.
 */
function phoneRegex(e164: string): RegExp | null {
  const national = toNational(e164);
  if (!national) return null;
  return new RegExp(national.split('').join('[\\s\\-()]{0,2}'), 'i');
}

function toNational(e164: string): string | null {
  const digits = e164.replace(/\D/g, '');
  if (!digits.startsWith('44')) return null;
  const national = '0' + digits.slice(2);
  return national.length >= 10 ? national : null;   // shorter is unsafe to match
}

/**
 * Index every phone number GOV.UK publishes on a structured contact page.
 *
 * Most departments never print their helpline on the service page — HMRC keeps
 * all 126 of its numbers on separate `hmrc_contact` documents. Checking only the
 * service page therefore leaves correct numbers looking unverified. Building the
 * corpus once and looking numbers up in it gives each one a real source URL
 * instead of a shrug.
 */
async function buildContactCorpus(): Promise<Map<string, { url: string; quote: string }>> {
  const corpus = new Map<string, { url: string; quote: string }>();
  const res = await fetch(
    'https://www.gov.uk/api/search.json?filter_format=hmrc_contact&count=200&fields=link',
    { headers: { 'User-Agent': UA } },
  );
  if (!res.ok) return corpus;
  const links: string[] = ((await res.json()) as any).results.map((r: any) => r.link);
  console.error(`Indexing ${links.length} GOV.UK contact pages...`);

  for (const link of links) {
    const text = await pageText(`https://www.gov.uk${link}`);
    if (!text) continue;
    for (const m of text.matchAll(/0[0-9][0-9\s\-()]{8,14}[0-9]/g)) {
      const digits = m[0].replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) continue;
      if (corpus.has(digits)) continue;
      corpus.set(digits, {
        url: `https://www.gov.uk${link}`,
        quote: quoteAround(text, m.index!, m[0].length),
      });
    }
  }
  return corpus;
}

// ─── RUN ────────────────────────────────────────────────────────────────────

const nodes = Object.values(NODES);
const store = loadProvenance();
const now = new Date().toISOString();

interface Row { id: string; field: string; value: string; url: string }
const found: Row[] = [];
const missing: Row[] = [];
const unreachable: Row[] = [];

const rateNodes = nodes.filter(n => n.financialData?.rates);
const phoneNodes = nodes.filter(n => n.contactInfo?.phone?.number || n.contactInfo?.additionalPhones?.length);
console.error(`Checking rates on ${rateNodes.length} nodes and phones on ${phoneNodes.length} nodes...`);

const contactCorpus = await buildContactCorpus();
console.error(`Contact corpus: ${contactCorpus.size} numbers indexed`);

// ─── RATES ──────────────────────────────────────────────────────────────────

for (const n of rateNodes) {
  const fd = n.financialData!;
  const url = fd.source || n.govuk_url;
  const text = await pageText(url);

  for (const [key, value] of Object.entries(fd.rates)) {
    const field = `financialData.rates.${key}`;
    const row = { id: n.id, field, value: String(value), url };

    if (text === null) {
      unreachable.push(row);
      continue;
    }

    const haystack = normaliseForMatch(text);
    let hit: { rendering: string; index: number } | null = null;
    for (const rendering of renderings(key, value as number)) {
      const idx = haystack.indexOf(normaliseForMatch(rendering));
      if (idx !== -1) { hit = { rendering, index: idx }; break; }
    }

    if (hit) {
      found.push(row);
      store.fields[provenanceKey(n.id, field)] = {
        valueHash: hashValue(value),
        valueSeen: hit.rendering,
        sourceUrl: url,
        sourceQuote: quoteAround(text, Math.max(0, hit.index - 20), hit.rendering.length + 40),
        method: 'literal-presence',
        verifiedAt: now,
        confidence: 'confirmed',
      };
    } else {
      missing.push(row);
      store.fields[provenanceKey(n.id, field)] = {
        valueHash: hashValue(value),
        valueSeen: String(value),
        sourceUrl: url,
        sourceQuote: '',
        method: 'literal-presence',
        verifiedAt: now,
        confidence: 'unverified',
        rationale: `No rendering of ${JSON.stringify(value)} found on the cited page. Rate may have changed, or the page may no longer publish it.`,
      };
    }
  }
}

// ─── PHONE NUMBERS ──────────────────────────────────────────────────────────

for (const n of phoneNodes) {
  const govText = await pageText(n.govuk_url);
  const entries: { field: string; number: string; sourceUrl?: string }[] = [];
  if (n.contactInfo?.phone?.number) {
    entries.push({ field: 'contactInfo.phone.number', number: n.contactInfo.phone.number, sourceUrl: n.contactInfo.phone.sourceUrl });
  }
  (n.contactInfo?.additionalPhones ?? []).forEach((p, i) => {
    entries.push({ field: `contactInfo.additionalPhones.${i}.number`, number: p.number, sourceUrl: p.sourceUrl });
  });

  for (const { field, number, sourceUrl } of entries) {
    const row = { id: n.id, field, value: number, url: sourceUrl ?? n.govuk_url };
    const re = phoneRegex(number);

    if (re === null) {
      // Short codes like NHS 111 cannot be matched safely against page text.
      store.fields[provenanceKey(n.id, field)] = {
        valueHash: hashValue(number),
        valueSeen: number,
        sourceUrl: row.url,
        sourceQuote: '',
        method: 'manual',
        verifiedAt: now,
        confidence: 'inferred',
        rationale: 'Short code or non-UK format — too short to match against page text without false positives.',
      };
      continue;
    }

    // Try the node's own govuk_url first, then its declared sourceUrl (a
    // contact page other than govuk_url — see PhoneContact.sourceUrl), then
    // the GOV.UK contact-page corpus as a last resort.
    let hit: { text: string; url: string; m: RegExpExecArray } | null = null;
    if (govText !== null) {
      const m = re.exec(govText);
      if (m) hit = { text: govText, url: n.govuk_url, m };
    }
    if (!hit && sourceUrl) {
      const altText = await pageText(sourceUrl);
      if (altText !== null) {
        const m = re.exec(altText);
        if (m) hit = { text: altText, url: sourceUrl, m };
      }
    }
    const viaCorpus = hit ? null : contactCorpus.get(toNational(number) ?? '');

    if (hit) {
      found.push({ ...row, url: hit.url });
      store.fields[provenanceKey(n.id, field)] = {
        valueHash: hashValue(number),
        valueSeen: hit.m[0],
        sourceUrl: hit.url,
        sourceQuote: quoteAround(hit.text, hit.m.index, hit.m[0].length),
        method: 'literal-presence',
        verifiedAt: now,
        confidence: 'confirmed',
      };
    } else if (viaCorpus) {
      found.push({ ...row, url: viaCorpus.url });
      store.fields[provenanceKey(n.id, field)] = {
        valueHash: hashValue(number),
        valueSeen: number,
        sourceUrl: viaCorpus.url,
        sourceQuote: viaCorpus.quote,
        method: 'literal-presence',
        verifiedAt: now,
        confidence: 'confirmed',
      };
    } else if (govText === null && !sourceUrl) {
      unreachable.push(row);
    } else {
      missing.push(row);
      store.fields[provenanceKey(n.id, field)] = {
        valueHash: hashValue(number),
        valueSeen: number,
        sourceUrl: row.url,
        sourceQuote: '',
        method: 'literal-presence',
        verifiedAt: now,
        confidence: 'unverified',
        rationale: sourceUrl
          ? `No rendering of ${JSON.stringify(number)} found on the declared sourceUrl or the service page.`
          : 'Not on the service page and not in the GOV.UK contact-page index. Needs a source URL or a correction.',
      };
    }
  }
}

if (WRITE) {
  saveProvenance(store);
  console.error(`\nWrote provenance for ${found.length + missing.length} tier 2 fields`);
}

// ─── REPORT ─────────────────────────────────────────────────────────────────

const rateRows = (rows: Row[]) => rows.filter(r => r.field.startsWith('financialData'));
const phoneRows = (rows: Row[]) => rows.filter(r => r.field.startsWith('contactInfo'));

console.log('─── TIER 2 VERIFICATION (literal presence) ─────────────────────');
console.log(`Rates   confirmed ${rateRows(found).length}  /  not found ${rateRows(missing).length}`);
console.log(`Phones  confirmed ${phoneRows(found).length}  /  not found ${phoneRows(missing).length}`);
console.log(`Pages unreachable: ${new Set(unreachable.map(u => u.url)).size}`);

console.log(`\n─── RATES NOT FOUND ON CITED PAGE (${rateRows(missing).length}) ───`);
for (const r of rateRows(missing)) {
  console.log(`  ${r.id.padEnd(34)} ${r.field.replace('financialData.rates.', '').padEnd(26)} ${String(r.value).padEnd(10)} ${r.url}`);
}

console.log(`\n─── PHONES NOT FOUND ON SERVICE PAGE (${phoneRows(missing).length}) ───`);
for (const r of phoneRows(missing)) {
  console.log(`  ${r.id.padEnd(34)} ${r.value.padEnd(20)} ${r.url}`);
}
