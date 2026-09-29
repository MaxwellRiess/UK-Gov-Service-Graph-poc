/**
 * sources.ts — The pages a service's claims are judged against
 *
 * A service's own cited pages (govuk_url, financialData.source and
 * eligibility.sources), plus, optionally, the pages they link to one hop out,
 * filtered by the distinctive terms of what is being checked. Shared by
 * widen-sources.ts and propose-fixes.ts so both judge against the same pages.
 */

import type { ServiceNode } from '../../src/graph-data.js';
import { normaliseForMatch } from '../../src/provenance.js';
import { pageText } from './page-text.js';
import type { Source } from './judge-prose.js';

const UA = 'UK-Gov-Service-Graph-Provenance/1.0';

const SKIP_PATH = /^\/(government\/(organisations|publications\/[^/]+\/?$|people)|search|browse|help|contact$|world\/|topic\/|find-local-council$|call-charges$)/;

/** Pages linked from one cited page: body links, and GOV.UK's related items. */
export async function linksFrom(url: string): Promise<string[]> {
  const u = new URL(url);
  const out = new Set<string>();
  try {
    if (u.host === 'www.gov.uk') {
      const r = await fetch(`https://www.gov.uk/api/content${u.pathname.replace(/\/$/, '')}`, { headers: { 'User-Agent': UA } });
      if (!r.ok) return [];
      const d: any = await r.json();
      const det = d.details ?? {};
      const html = [det.body, ...(det.parts ?? []).map((p: any) => p.body)].filter(x => typeof x === 'string').join(' ');
      for (const m of html.matchAll(/href="(\/[a-z0-9][^"#?]*)"/gi)) out.add(m[1]);
      for (const m of html.matchAll(/href="https:\/\/www\.gov\.uk(\/[^"#?]*)"/gi)) out.add(m[1]);
      for (const rel of d.links?.ordered_related_items ?? []) if (rel.base_path) out.add(rel.base_path);
      return [...out].filter(p => !SKIP_PATH.test(p)).map(p => `https://www.gov.uk${p.replace(/\/$/, '')}`);
    }
    // Other hosts: same-site links in the page's main content.
    const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    if (!r.ok) return [];
    const html = await r.text();
    const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
    for (const m of main.matchAll(/href="([^"#?]+)"/gi)) {
      try {
        const abs = new URL(m[1], url);
        if (abs.host === u.host && abs.pathname !== u.pathname) out.add(`${abs.origin}${abs.pathname.replace(/\/$/, '')}`);
      } catch { /* ignore bad hrefs */ }
    }
    return [...out];
  } catch {
    return [];
  }
}

const STOP = new Set(('the and for with that this from have been your must will can not are but any also only more than when what which there their they them into such some other text page says does never mention mentions stated state claim criterion ' +
  'under over each within after before about would could should applies apply applying service services people person you').split(' '));

/** Figures count most; then the content words of the claims and notes. */
export function termsOf(text: string): { figures: string[]; words: string[] } {
  const figures = [...new Set((text.match(/£?\d[\d,]*(\.\d+)?%?/g) ?? []).filter(f => f.replace(/\D/g, '').length >= 2 || f.startsWith('£')))];
  const words = [...new Set((text.toLowerCase().match(/[a-z][a-z'-]{4,}/g) ?? []).filter(w => !STOP.has(w)))];
  return { figures, words };
}

export function score(pageTextNorm: string, t: { figures: string[]; words: string[] }): number {
  let s = 0;
  for (const f of t.figures) if (pageTextNorm.includes(f.toLowerCase())) s += 3;
  for (const w of t.words) if (pageTextNorm.includes(w)) s += 1;
  return s;
}

export function ownUrls(n: ServiceNode): string[] {
  return [...new Set([n.govuk_url, n.financialData?.source, ...(n.eligibility.sources ?? [])].filter(Boolean) as string[])];
}

export interface GatherOptions {
  maxLinked: number;       // linked pages to keep, best first
  linkedChars: number;     // characters of each linked page to send
  minScore: number;        // a linked page must score at least this on the terms
  requireLinked: boolean;  // return null when no linked page scores
}

/**
 * The service's own pages, then the linked pages that best match `terms`.
 * Returns null if no own page is readable, or if a linked page is required
 * and none scores.
 */
export async function gatherSources(n: ServiceNode, terms: string, o: GatherOptions): Promise<Source[] | null> {
  const own = ownUrls(n);
  const sources: Source[] = [];
  for (const url of own) {
    const text = await pageText(url);
    if (text && text.length > 200) sources.push({ url, text });
  }
  if (!sources.length) return null;

  const ownBases = own.map(u => u.replace(/\/$/, ''));
  const candidates = [...new Set((await Promise.all(own.map(linksFrom))).flat())]
    .filter(l => !ownBases.some(b => l === b || l.startsWith(b + '/') || b.startsWith(l + '/')));
  const t = termsOf(terms);

  const scored: { url: string; text: string; s: number }[] = [];
  for (const url of candidates) {
    const text = await pageText(url);
    if (!text || text.length < 200) continue;
    const s = score(normaliseForMatch(text), t);
    if (s >= o.minScore) scored.push({ url, text, s });
  }
  scored.sort((a, b) => b.s - a.s);
  const picked = scored.slice(0, o.maxLinked);
  if (!picked.length && o.requireLinked) return null;
  for (const p of picked) sources.push({ url: p.url, text: p.text.slice(0, o.linkedChars), linked: true });
  return sources;
}
