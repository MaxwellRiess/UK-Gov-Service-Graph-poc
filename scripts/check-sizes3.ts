import { LIFE_EVENTS } from '../src/graph-data.js';
import { buildJourney } from '../src/graph-engine.js';

const cases: [string, string[]][] = [
  ['job-loss',             ['job-loss']],
  ['job-loss+disability',  ['job-loss', 'disability']],
  ['baby',                 ['baby']],
  ['business',             ['business']],
];

for (const [label, ids] of cases) {
  const j   = buildJourney(ids);
  const out = JSON.stringify(j, null, 2);
  const estTokens = Math.round(out.length / 4);
  console.log(
    `${label.padEnd(25)} ${String(j.summary.totalServices).padStart(3)} svcs  ` +
    `${out.length.toLocaleString().padStart(8)} chars  ~${estTokens.toLocaleString().padStart(6)} tokens`
  );
}

// Show what a single service looks like now
const sample = buildJourney(['job-loss']);
const svc = sample.phases[0].services[0];
console.log('\nSample service fields:', Object.keys(svc).join(', '));
console.log('Sample service size:', JSON.stringify(svc).length, 'chars');
