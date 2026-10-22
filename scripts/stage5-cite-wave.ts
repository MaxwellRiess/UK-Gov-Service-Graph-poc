/** Build candidate URLs or a review page for a recorded Stage 5 Cite wave. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Item = { key: string; id: string; name: string; path: string; text: string };
type Note = { queries: string[]; urls: { url: string; why: string }[]; verdict_hint?: string };
type Source = { url: string; text: string; found?: boolean; linked?: boolean };
type Prepared = { id: string; fields: { key: string; path: string; text: string }[]; sources: Source[] };
type Claim = { claim: string; verdict: string; quote: string | null; source: number | null; note?: string };
type Response = { fields: { key: string; claims: Claim[] }[] };

const wave = process.argv[2];
const mode = process.argv[3];
if (!wave || !['candidates', 'review'].includes(mode)) {
  throw new Error('Usage: node --import tsx scripts/stage5-cite-wave.ts data/stage5/cite-02 candidates|review');
}
const read = <T>(name: string): T => JSON.parse(readFileSync(join(wave, name), 'utf8')) as T;
const selection = read<{ wave: string; items: Item[] }>('selection.json');
const notes = read<Record<string, Note>>('finder-notes.json');
const keys = new Set(selection.items.map(x => x.key));
if (keys.size !== selection.items.length) throw new Error('Selection has duplicate keys');
if (Object.keys(notes).length !== keys.size) throw new Error('Finder notes do not match selection size');
for (const item of selection.items) {
  const note = notes[item.key];
  if (!note) throw new Error(`Missing finder notes for ${item.key}`);
  if (note.queries.length < 2) throw new Error(`Fewer than two searches for ${item.key}`);
  for (const { url } of note.urls) {
    if (!/^https:\/\//.test(url)) throw new Error(`Invalid URL for ${item.key}: ${url}`);
  }
}

if (mode === 'candidates') {
  const candidates = Object.fromEntries(selection.items.map(item => [item.key,
    [...new Set(notes[item.key].urls.map(x => x.url))]
      .filter(url => !/\.(pdf|docx?)(\?|$)/i.test(url)),
  ]));
  writeFileSync(join(wave, 'candidates.json'), JSON.stringify(candidates, null, 2) + '\n');
  console.log(`Wrote ${selection.items.length} candidate lists for ${selection.wave}`);
  process.exit(0);
}

const prepared = read<Prepared[]>('judge/prepared.json');
const services = new Map(prepared.map(x => [x.id, x]));
const responses = new Map(prepared.map(p => [p.id, read<Response>(`judge/${p.id}.response.json`)]));
const fieldKey = (path: string): string => {
  const criterion = path.match(/^eligibility\.criteria\.(\d+)$/);
  if (criterion) return `criterion_${criterion[1]}`;
  const list = path.match(/^eligibility\.(autoQualifiers|exclusions|evidenceRequired)\.(\d+)$/);
  if (list) return `${{ autoQualifiers: 'qualifier', exclusions: 'exclusion', evidenceRequired: 'evidence' }[list[1]]}_${list[2]}`;
  return ({ 'agentInteraction.methods': 'methods', 'agentInteraction.authRequired': 'auth',
    'eligibility.summary': 'summary', desc: 'desc' } as Record<string, string>)[path] ?? path;
};

const lines: string[] = [
  `# ${selection.wave}: Cite judgment record`, '',
  `${selection.items.length} partly supported Cite candidates. Their graph values were not changed by this wave. ` +
  'The source finder ran at least two searches per field; the independent judge received the exported page text. ' +
  'The import checks every quoted span against that text.', '',
  '## Result before import', '',
  'See `dry-import.txt` for the pipeline tally. A field below is confirmable only when every atomic claim is supported and the import validates its quotes.', '',
];
let confirmable = 0;
let partly = 0;
let contradicted = 0;
let noVerdict = 0;
for (const item of selection.items) {
  const p = services.get(item.id);
  const response = responses.get(item.id);
  const note = notes[item.key];
  if (!p || !response) {
    noVerdict++;
    lines.push(`### ${item.name}: \`${item.path}\``, '', `**Current text:** ${item.text}`, '',
      '**Judgment:** not exported; source fetch unavailable. The field stays unchanged.', '',
      '**Finder queries:**', '', ...note.queries.map(x => `- \`${x}\``), '',
      '**Nominated pages:**', '',
      ...(note.urls.length ? note.urls.map(x => `- [${x.url}](${x.url}) — ${x.why}`) : ['- None found']), '');
    continue;
  }
  const f = p.fields.find(x => x.path === item.path);
  const judged = response.fields.find(x => x.key === fieldKey(item.path));
  if (!f || !judged?.claims.length) throw new Error(`Missing field judgment for ${item.key}`);
  if (f.text !== item.text) throw new Error(`Exported text differs from selection for ${item.key}`);
  const status = judged.claims.some(c => c.verdict === 'contradicted') ? 'contradicted'
    : judged.claims.every(c => c.verdict === 'supported') ? 'confirmable'
    : judged.claims.some(c => c.verdict === 'supported' || c.verdict === 'partly_supported') ? 'partly supported'
    : 'not confirmed';
  if (status === 'confirmable') confirmable++;
  else if (status === 'partly supported') partly++;
  else if (status === 'contradicted') contradicted++;
  else noVerdict++;
  lines.push(`### ${item.name}: \`${item.path}\``, '', `**Current text:** ${item.text}`, '', `**Judgment:** ${status}`, '');
  for (const claim of judged.claims) {
    lines.push(`- **${claim.verdict.replaceAll('_', ' ')}:** ${claim.claim}`);
    if (claim.quote && claim.source !== null) {
      const source = p.sources[claim.source];
      if (!source) throw new Error(`Invalid source index for ${item.key}`);
      lines.push(`  - [Source](${source.url}): “${claim.quote}”`);
    }
    if (claim.note) lines.push(`  - Judge note: ${claim.note}`);
  }
  lines.push('', '**Finder queries:**', '', ...note.queries.map(x => `- \`${x}\``), '', '**Nominated pages:**', '',
    ...(note.urls.length ? note.urls.map(x => `- [${x.url}](${x.url}) — ${x.why}`) : ['- None found']), '');
  if (note.verdict_hint) lines.push(`Finder caution: ${note.verdict_hint}`, '');
  lines.push('<details><summary>All fetched pages in judge prompt</summary>', '',
    ...p.sources.map(x => `- [${x.url}](${x.url})${x.found ? ' (found by search)' : ' (cited or linked)'}`),
    '', '</details>', '');
}
lines.splice(4, 0, `Judge outcome from response files: ${confirmable} confirmable, ${partly} partly supported, ${contradicted} contradicted, ${noVerdict} not confirmed.`, '');
writeFileSync(join(wave, 'review.md'), lines.join('\n') + '\n');
console.log(`Wrote ${selection.wave} review: ${confirmable} confirmable, ${partly} partly, ${contradicted} contradicted, ${noVerdict} not confirmed`);
