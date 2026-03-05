/**
 * graph-engine.ts — Journey planning logic
 *
 * This module takes the static graph data (NODES, EDGES, LIFE_EVENTS) and
 * provides the traversal function that computes a personalised service journey.
 *
 * The algorithm has two steps:
 *
 *   1. BFS from the entry nodes of each selected life event — discovers every
 *      service that is reachable via either REQUIRES or ENABLES edges.
 *
 *   2. Kahn's topological sort over REQUIRES edges only — groups the discovered
 *      services into phases, where each phase can only begin after all services
 *      in the previous phase that REQUIRE it are done.
 *
 * ENABLES edges are used for discovery (a benefit you can unlock) but not for
 * ordering (you don't have to do everything in a strict sequence).
 */

import { NODES, EDGES, LIFE_EVENTS, DEPT_CONTACTS, type ServiceNode, type AgentInteraction, type FinancialData, type Nation, type ContactInfo } from './graph-data.js';

// ─── TYPES ────────────────────────────────────────────────────────────────────

/**
 * Lean view of a service returned inside plan_journey.
 *
 * Carries enough for an agent to present and prioritise the journey without
 * flooding the context window. Full eligibility criteria (keyQuestions,
 * autoQualifiers, evidenceRequired …) are available via get_service.
 */
export interface JourneyService {
  id:                 string;
  name:               string;
  dept:               string;
  deptKey:            string;
  deadline:           string | null;
  desc:               string;
  govuk_url:          string;
  serviceType:        string;
  /** Agent should volunteer this service based on life-event signals */
  proactive:          boolean;
  /** Only surface after confirming a prerequisite is in place */
  gated:              boolean;
  /** One-sentence eligibility summary for conversational use */
  eligibilitySummary: string;
  /** true = virtually anyone qualifies; no gating questions needed */
  universal:          boolean;
  /** true = income / capital assessment required */
  means_tested:       boolean;
  /** Life event IDs that caused this service to appear */
  triggeredBy:        string[];
  /** Prerequisite service IDs (REQUIRES edges into this node) */
  requires:           string[];
  /** Service IDs this node unlocks within the journey */
  enables:            string[];
  /** How an agent can interact with this service (methods, APIs, form URLs) */
  agentInteraction:   AgentInteraction;
  /** Structured financial rates — present for benefits/grants with known amounts */
  financialData?:     FinancialData;
  /** UK nations this service applies to (absent = UK-wide) */
  nations?:           Nation[];
  /** Contact info: helpline, hours, webchat, textphone (resolved from node or dept default) */
  contactInfo?:       ContactInfo;
}

export interface JourneyPhase {
  phase:    number;
  label:    string;
  services: JourneyService[];
}

export interface JourneyResult {
  summary: {
    totalServices: number;
    totalDepartments: number;
    servicesWithDeadlines: number;
    totalPhases: number;
    selectedLifeEvents: string[];
  };
  phases: JourneyPhase[];
}

// ─── ADJACENCY INDEX (built once at module load) ───────────────────────────────

const ADJ_OUT: Record<string, { to: string; type: string }[]> = {};
const ADJ_IN:  Record<string, { from: string; type: string }[]> = {};

Object.keys(NODES).forEach(id => { ADJ_OUT[id] = []; ADJ_IN[id] = []; });
EDGES.forEach(e => {
  if (ADJ_OUT[e.from]) ADJ_OUT[e.from].push({ to: e.to,   type: e.type });
  if (ADJ_IN[e.to])   ADJ_IN[e.to].push(  { from: e.from, type: e.type });
});

// ─── CONTACT RESOLUTION ─────────────────────────────────────────────────────

/** Resolve contact info: node-level override > department default > undefined */
export function resolveContactInfo(node: ServiceNode): ContactInfo | undefined {
  return node.contactInfo ?? DEPT_CONTACTS[node.deptKey];
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

/**
 * Compute a personalised service journey for one or more life events.
 *
 * @param selectedEventIds  Array of life-event IDs (e.g. ['baby', 'moving'])
 * @returns Ordered phases of services with metadata
 */
export function buildJourney(selectedEventIds: string[]): JourneyResult {

  // ── Step 1: seed from entry nodes ─────────────────────────────────────────
  const inScope:   Set<string>                    = new Set();
  const sourceMap: Record<string, Set<string>>    = {};   // nodeId → event IDs

  selectedEventIds.forEach(eid => {
    const evt = LIFE_EVENTS.find(e => e.id === eid);
    if (!evt) return;
    evt.entryNodes.forEach(nid => {
      if (!NODES[nid]) return;
      inScope.add(nid);
      if (!sourceMap[nid]) sourceMap[nid] = new Set();
      sourceMap[nid].add(eid);
    });
  });

  // ── Step 2: BFS outward over all edge types ────────────────────────────────
  const queue = [...inScope];
  while (queue.length) {
    const cur = queue.shift()!;
    (ADJ_OUT[cur] || []).forEach(({ to }) => {
      if (!NODES[to]) return;
      // Propagate source tags regardless of whether node is new
      if (!sourceMap[to]) sourceMap[to] = new Set();
      (sourceMap[cur] || []).forEach(s => sourceMap[to].add(s));
      if (!inScope.has(to)) {
        inScope.add(to);
        queue.push(to);
      }
    });
  }

  // ── Step 3: Kahn's topological sort (REQUIRES edges only for ordering) ─────
  const inDegree: Record<string, number>   = {};
  const reqAdj:   Record<string, string[]> = {};  // from → children that REQUIRE it

  inScope.forEach(id => { inDegree[id] = 0; reqAdj[id] = []; });

  EDGES.forEach(e => {
    if (e.type !== 'REQUIRES') return;
    if (!inScope.has(e.from) || !inScope.has(e.to)) return;
    reqAdj[e.from].push(e.to);
    inDegree[e.to]++;
  });

  // ── Step 4: Build phases (layers of the DAG) ──────────────────────────────
  const layers: string[][] = [];
  let frontier = [...inScope].filter(id => inDegree[id] === 0);

  while (frontier.length) {
    layers.push([...frontier]);
    const next: string[] = [];
    frontier.forEach(nodeId => {
      (reqAdj[nodeId] || []).forEach(child => {
        inDegree[child]--;
        if (inDegree[child] === 0) next.push(child);
      });
    });
    frontier = next;
  }

  // ── Step 5: Shape the output ───────────────────────────────────────────────
  const allNodeIds = layers.flat();
  const depts      = new Set(allNodeIds.map(id => NODES[id]?.deptKey).filter(Boolean));

  const phases: JourneyPhase[] = layers.map((layer, i) => ({
    phase: i + 1,
    label: i === 0 ? 'Gateway services — start here' : `Phase ${i + 1}`,
    services: layer.map(id => {
      const node = NODES[id];
      // Prerequisite IDs (REQUIRES edges pointing INTO this node, within scope)
      const requires = (ADJ_IN[id] || [])
        .filter(e => e.type === 'REQUIRES' && inScope.has(e.from))
        .map(e => e.from);
      // What this node unlocks within this journey
      const enables = (ADJ_OUT[id] || [])
        .filter(e => inScope.has(e.to))
        .map(e => e.to);

      // Project lean shape — full eligibility detail is available via getServiceWithContext
      const svc: JourneyService = {
        id:                 node.id,
        name:               node.name,
        dept:               node.dept,
        deptKey:            node.deptKey,
        deadline:           node.deadline,
        desc:               node.desc,
        govuk_url:          node.govuk_url,
        serviceType:        node.serviceType,
        proactive:          node.proactive,
        gated:              node.gated,
        eligibilitySummary: node.eligibility.summary,
        universal:          node.eligibility.universal,
        means_tested:       node.eligibility.means_tested,
        triggeredBy:        [...(sourceMap[id] || [])],
        requires,
        enables,
        agentInteraction:   node.agentInteraction,
        ...(node.financialData ? { financialData: node.financialData } : {}),
        ...(node.nations       ? { nations: node.nations }             : {}),
        ...(() => { const ci = resolveContactInfo(node); return ci ? { contactInfo: ci } : {}; })(),
      };
      return svc;
    }),
  }));

  return {
    summary: {
      totalServices:          allNodeIds.length,
      totalDepartments:       depts.size,
      servicesWithDeadlines:  allNodeIds.filter(id => NODES[id]?.deadline).length,
      totalPhases:            layers.length,
      selectedLifeEvents:     selectedEventIds,
    },
    phases,
  };
}

/**
 * Return details for a single service node, enriched with its graph context.
 */
export function getServiceWithContext(serviceId: string) {
  const node = NODES[serviceId];
  if (!node) return null;

  const prerequisites = (ADJ_IN[serviceId] || []).map(e => ({
    serviceId: e.from,
    name:      NODES[e.from]?.name ?? e.from,
    type:      e.type,
  }));

  const unlocks = (ADJ_OUT[serviceId] || []).map(e => ({
    serviceId: e.to,
    name:      NODES[e.to]?.name ?? e.to,
    type:      e.type,
  }));

  const triggeredByEvents = LIFE_EVENTS
    .filter(evt => evt.entryNodes.includes(serviceId))
    .map(evt => ({ id: evt.id, name: evt.name }));

  const contactInfo = resolveContactInfo(node);
  return { ...node, ...(contactInfo ? { contactInfo } : {}), prerequisites, unlocks, triggeredByEvents };
}
