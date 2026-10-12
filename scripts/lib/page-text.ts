/**
 * page-text.ts — Fetch source page text for the literal verification passes
 *
 * Shared by verify-tier2.ts (rates, phones) and verify-rules.ts (eligibility
 * thresholds), which both need the same thing: the full text of a cited page,
 * cached, so a value can be looked for in it.
 */

import { htmlToText } from '../../src/provenance.js';

const UA = 'UK-Gov-Service-Graph-Provenance/1.0';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const pageCache = new Map<string, string | null>();

/**
 * Full text of a GOV.UK page, via the Content API where possible.
 *
 * Scraping the rendered HTML is not good enough here. A GOV.UK guide splits
 * across parts and `<main>` only ever holds the part you asked for, so the
 * Universal Credit helpline — which lives in the "contact" part — is invisible
 * from the landing page. The Content API hands back every part's body at once,
 * without nav or footer noise. Rates live in "what you'll get" and phone
 * numbers in "contact", so both need the whole guide.
 *
 * The cache key is the origin path, since every part of a guide resolves to
 * the same API document. A failed fetch is cached too, so the verifiers do not
 * hammer an unreachable page once per field; pass `refetch` to retry it.
 */
export async function pageText(url: string, refetch = false): Promise<string | null> {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return null; }

  const isGovUk = parsed.host === 'www.gov.uk' || parsed.host === 'gov.uk';
  const cacheKey = isGovUk ? `api:${parsed.pathname.replace(/\/$/, '')}` : url;
  if (pageCache.has(cacheKey) && !(refetch && pageCache.get(cacheKey) === null)) return pageCache.get(cacheKey)!;

  let text: string | null = null;

  if (isGovUk) {
    try {
      const res = await fetch(`https://www.gov.uk/api/content${parsed.pathname.replace(/\/$/, '')}`, {
        headers: { 'User-Agent': UA }, redirect: 'follow',
      });
      if (res.ok) {
        const d: any = await res.json();
        const det = d.details ?? {};
        const bodies: string[] = [];
        if (typeof det.body === 'string') bodies.push(det.body);
        for (const p of det.parts ?? []) if (typeof p.body === 'string') bodies.push(p.body);
        // Some formats carry the payload elsewhere; fall through to HTML if empty.
        if (bodies.length) {
          // The title and summary are part of what the page says. GOV.UK often
          // states a service's scope only there: "Become a childminder or nanny
          // (England)" never says England in its body.
          const head = [d.title, d.description].filter((x: unknown) => typeof x === 'string' && x).join('. ');
          if (head) bodies.unshift(head);
          text = htmlToText(bodies.join(' \n '));
        }
      }
    } catch { /* fall through to HTML */ }
  }

  if (text === null) {
    for (let i = 0; i < 3 && text === null; i++) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
        if (res.ok) text = htmlToText(await res.text());
        else break;
      } catch {
        await sleep(1000 * (i + 1));
      }
    }
  }

  pageCache.set(cacheKey, text);
  await sleep(150);
  return text;
}

/** Pull a readable sentence-ish window around a match, to store as the quote. */
export function quoteAround(text: string, index: number, matchLen: number): string {
  const start = Math.max(0, index - 90);
  const end = Math.min(text.length, index + matchLen + 90);
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

/** How a money value might be written on the page: "£3,500", "£3500", "£3,500.00". */
export function moneyRenderings(value: number): string[] {
  const out = new Set<string>();
  const withCommas = value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  out.add(`£${withCommas}`);
  out.add(`£${value}`);
  if (Number.isInteger(value)) {
    out.add(`£${value.toLocaleString('en-GB')}.00`);
    out.add(`£${value}.00`);
  } else {
    out.add(`£${value.toFixed(2)}`);
    // "£29,741.40": thousands separator and a trailing zero together.
    out.add(`£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  }
  return [...out];
}
