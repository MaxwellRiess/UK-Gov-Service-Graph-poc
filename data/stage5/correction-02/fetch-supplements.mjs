import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync } from 'node:fs';
import { pageText } from '../../../scripts/lib/page-text.ts';
import { normaliseForMatch } from '../../../src/provenance.ts';

const drafts = JSON.parse(readFileSync('data/stage5/correction-02/drafts.json', 'utf8'));
const keys = new Set([
  'co-contracts-finder#eligibility.summary',
  'opg-lpa-activation#eligibility.criteria.0',
  'gro-register-death#eligibility.criteria.0',
]);
const checks = drafts.primary
  .filter(row => keys.has(row.key))
  .flatMap(row => row.evidence.filter(e => e.verdict === 'supplement').map(e => ({ key: row.key, quote: e.quote, url: e.url })));
checks.push({
  key: 'gro-register-death#deadline',
  quote: 'Register the death within 5 days (8 days in Scotland) of getting the confirmation.',
  url: 'https://www.gov.uk/after-a-death/register-the-death',
});
checks.push({
  key: 'gro-register-death#deadline',
  quote: 'You must wait for the medical examiner’s office to confirm you can register the death.',
  url: 'https://www.gov.uk/after-a-death/register-the-death',
});
checks.push({
  key: 'gro-register-death#eligibility.criteria.0',
  quote: 'Every death in England and Wales must be registered in the district where it happened',
  url: 'https://www.bradford.gov.uk/births-deaths-marriages-and-civil-partnerships/deaths/register-a-death/',
});

const urls = [...new Set(checks.map(check => check.url))];
const pages = {};
for (const url of urls) {
  const text = await pageText(url);
  pages[url] = {
    fetched: text !== null,
    text: text ?? '',
    sha256: text === null ? null : createHash('sha256').update(text).digest('hex'),
  };
}
const results = checks.map(check => ({
  ...check,
  found: pages[check.url].fetched && normaliseForMatch(pages[check.url].text).includes(normaliseForMatch(check.quote)),
}));
const output = { fetchedAt: new Date().toISOString(), pages, checks: results };
writeFileSync('data/stage5/correction-02/fetched-pages.json', JSON.stringify(output, null, 2) + '\n');
for (const check of results) console.log(`${check.found ? 'FOUND' : 'MISSING'} ${check.key}: ${check.url} — ${check.quote}`);
if (results.some(check => !pages[check.url].fetched)) process.exitCode = 1;
