import { LIFE_EVENTS } from '../src/graph-data.js';
import { buildJourney } from '../src/graph-engine.js';

for (const id of ['business', 'immigration']) {
  const j = buildJourney([id]);
  console.log(`\n=== ${id} === (total: ${j.summary.totalServices})`);
  j.phases.forEach(p => {
    const svcs = p.services.map(s => `${s.id}[P=${s.proactive}|G=${s.gated}]`).join('\n    ');
    console.log(`  Ph${p.phase}:\n    ${svcs}`);
  });
}
