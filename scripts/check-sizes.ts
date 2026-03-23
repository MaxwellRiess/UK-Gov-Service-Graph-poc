import { buildJourney } from '../src/graph-engine.js';

const cases: [string, string[]][] = [
  ['job-loss alone',       ['job-loss']],
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
  console.log(`${label.padEnd(25)} ${j.summary.totalServices.toString().padStart(3)} services  ${out.length.toLocaleString().padStart(8)} chars  ~${Math.round(out.length/4).toLocaleString().padStart(6)} tokens`);
}
