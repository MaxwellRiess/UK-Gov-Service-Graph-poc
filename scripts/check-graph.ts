import { LIFE_EVENTS } from '../src/graph-data.js';
import { buildJourney } from '../src/graph-engine.js';

console.log('Life events:', LIFE_EVENTS.map(e => e.id).join(', '));
for (const id of ['baby', 'bereavement', 'job-loss', 'disability']) {
  const j = buildJourney([id]);
  console.log(`\n=== ${id} === (total: ${j.summary.totalServices})`);
  j.phases.forEach(p => {
    const svcs = p.services.map(s => `${s.id}[P=${s.proactive}|G=${s.gated}]`).join(', ');
    console.log(`  Ph${p.phase}: ${svcs}`);
  });
}
