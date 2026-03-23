import { LIFE_EVENTS } from '../src/graph-data.js';
import { buildJourney } from '../src/graph-engine.js';

const cases: [string, string[]][] = [
  ['job-loss',             ['job-loss']],
  ['job-loss+disability',  ['job-loss', 'disability']],
  ['baby',                 ['baby']],
  ['bereavement',          ['bereavement']],
  ['business',             ['business']],
  ['immigration',          ['immigration']],
  ['disability',           ['disability']],
];

for (const [label, ids] of cases) {
  const j   = buildJourney(ids);
  const out = JSON.stringify(j, null, 2);
  console.log(
    `${label.padEnd(25)} ${String(j.summary.totalServices).padStart(3)} services` +
    `  ${out.length.toLocaleString().padStart(8)} chars` +
    `  ~${Math.round(out.length/4).toLocaleString().padStart(6)} est tokens`
  );
}

// Also show token breakdown: what takes up space in one service entry
const sample = buildJourney(['job-loss']);
const firstSvc = sample.phases[0].services[0];
const fields = Object.entries(firstSvc).map(([k,v]) => {
  const s = JSON.stringify(v);
  return { k, bytes: s.length };
}).sort((a,b) => b.bytes - a.bytes);
console.log('\nLargest fields in first job-loss service (' + firstSvc.id + '):');
for (const {k, bytes} of fields.slice(0, 8)) {
  console.log(`  ${k.padEnd(22)} ${bytes.toLocaleString().padStart(7)} chars`);
}
