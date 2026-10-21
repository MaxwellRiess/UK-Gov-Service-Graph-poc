/**
 * review-sample.ts — A page a person can check a verification run against
 *
 * The judge pipeline is only as good as its spot checks. This writes, for a
 * set of fields, what the graph claims, what the run decided, and the exact
 * quote and link behind each claim, so someone can open the link, find the
 * quote and decide whether they agree. Fields that are still not stated list
 * the searches that were tried, since "not found" is only as good as the
 * search behind it.
 *
 * Usage:
 *   npx tsx scripts/review-sample.ts --fields-file .cache/stage3/fields.txt \
 *     --notes .cache/stage3 --out docs/stage3-pilot-review.md --title "Stage 3 pilot"
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { NODES } from '../src/graph-data.js';
import { loadProvenance, getFieldValue } from '../src/provenance.js';
import { methodsText, type ReviewItem } from './lib/judge-prose.js';

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};
const keys = readFileSync(arg('--fields-file')!, 'utf-8').trim().split(',');
const notesDir = arg('--notes');
const out = arg('--out')!;
const title = arg('--title') ?? 'Verification sample';

// Finder notes: queries tried and why each page was put forward.
const notes: Record<string, { queries: string[]; urls: { url: string; why: string }[]; verdict_hint: string }> = {};
if (notesDir && existsSync(notesDir)) {
  for (const f of readdirSync(notesDir).filter(f => f.startsWith('finder-notes'))) {
    Object.assign(notes, JSON.parse(readFileSync(join(notesDir, f), 'utf-8')));
  }
}
const store = loadProvenance();
const prose = JSON.parse(readFileSync('data/review-queue-prose.json', 'utf-8')).review as ReviewItem[];
const criteria = JSON.parse(readFileSync('data/review-queue-criteria.json', 'utf-8')).review as
  { id: string; criterion: number; verdict: string; note: string; quote: string | null }[];

function claimText(id: string, path: string): string {
  let v: any = getFieldValue(NODES[id], path);
  if (path === 'agentInteraction.methods') v = methodsText(v);
  if (v && typeof v === 'object' && 'description' in v) v = v.description;
  return String(v);
}

type Outcome = 'confirmed elsewhere' | 'confirmed' | 'partly supported' | 'contradicted' | 'not found';
const rows: { key: string; outcome: Outcome; md: string }[] = [];

for (const key of keys) {
  const [id, path] = key.split('#');
  const n = NODES[id];
  const rec = store.fields[key];
  const own = [n.govuk_url, n.financialData?.source, ...(n.eligibility.sources ?? [])];
  // The same span often backs two claims of one field; show it once.
  const quotes = (rec ? [{ quote: rec.sourceQuote, url: rec.sourceUrl }, ...(rec.additionalQuotes ?? [])] : [])
    .filter((q, i, all) => q.quote && all.findIndex(o => o.quote === q.quote && o.url === q.url) === i);
  const elsewhere = quotes.some(q => !own.includes(q.url));
  const note = rec?.rationale ?? '';
  const outcome: Outcome = rec?.confidence === 'confirmed' ? (elsewhere ? 'confirmed elsewhere' : 'confirmed')
    : /contradicted/.test(note) ? 'contradicted'
    : /partly supported:/.test(note) || (rec?.claims?.supported ?? 0) > 0 ? 'partly supported'
    : 'not found';

  const lines = [`### ${n.name}: \`${path}\``, '', `**Claim:** ${claimText(id, path)}`, '', `**Outcome:** ${outcome}`, ''];
  if (quotes.length) {
    lines.push('**Evidence** (open the link and find the quote):', '');
    for (const q of quotes) lines.push(`- [${q.url.replace(/^https?:\/\//, '')}](${q.url})${own.includes(q.url) ? '' : ' *(found by search)*'}`, `  > ${q.quote}`);
    lines.push('');
  }
  const problems = path.startsWith('eligibility.criteria.')
    ? criteria.filter(c => c.id === id && `eligibility.criteria.${c.criterion}` === path).map(c => ({ verdict: c.verdict, note: c.note }))
    : (prose.find(r => r.id === id && r.field === path)?.problems ?? []);
  if (outcome !== 'confirmed' && outcome !== 'confirmed elsewhere' && problems.length) {
    lines.push('**What is missing:**', '', ...problems.map(p => `- ${p.verdict.replace('_', ' ')}: ${p.note}`), '');
  }
  const fn = notes[key];
  if (fn && outcome !== 'confirmed') {
    lines.push(`**Search:** ${fn.queries.length} queries${fn.urls.length ? `, ${fn.urls.length} page(s) put forward` : ', nothing acceptable found'}.`);
    lines.push(`<details><summary>Queries and pages</summary>`, '', ...fn.queries.map(q => `- \`${q}\``), ...fn.urls.map(u => `- ${u.url}: ${u.why}`), '', '</details>', '');
  }
  rows.push({ key, outcome, md: lines.join('\n') });
}

const order: Outcome[] = ['confirmed elsewhere', 'confirmed', 'partly supported', 'contradicted', 'not found'];
const counts = order.map(o => [o, rows.filter(r => r.outcome === o).length] as const).filter(([, c]) => c);
const md = [
  `# ${title}: fields to check by hand`,
  '',
  `${rows.length} fields. ${counts.map(([o, c]) => `${c} ${o}`).join(', ')}.`,
  '',
  'For each confirmed field, open the link and check that the quote is there and says what the claim says. ' +
  'For each field that was not found, check whether a quick search of your own turns up an official page that states it. ' +
  'Either kind of disagreement means the method needs adjusting before the full run.',
  '',
  ...order.flatMap(o => {
    const rs = rows.filter(r => r.outcome === o);
    return rs.length ? [`## ${o[0].toUpperCase() + o.slice(1)} (${rs.length})`, '', ...rs.map(r => r.md)] : [];
  }),
].join('\n');
writeFileSync(out, md + '\n');
console.log(`Wrote ${out}: ${counts.map(([o, c]) => `${c} ${o}`).join(', ')}`);
