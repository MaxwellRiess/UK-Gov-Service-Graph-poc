# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Regenerate index.html from graph-data.ts (run after any data changes)
npm run mcp          # Start the MCP server via STDIO (for Claude Desktop integration)
```

There are no tests or linting configured. TypeScript is run directly via `tsx` — no compilation step.

## Architecture

This is a proof-of-concept service graph and MCP server for UK government life events and services. It models cross-departmental service dependencies to help citizens (and AI agents) navigate services in the right order.

### Source Files

- **`src/graph-data.ts`** — The entire dataset: ~108 service nodes, ~180+ typed edges, and 16 life events. This is the primary file to edit when adding/modifying services or relationships.
- **`src/graph-engine.ts`** — Pure journey-planning logic. BFS discovers reachable services from life event entry nodes; Kahn's topological sort (REQUIRES edges only) assigns services to phases.
- **`src/graph-server.ts`** — MCP server (STDIO transport). Exposes 3 tools (`list_life_events`, `plan_journey`, `get_service`), 2 resources, and 2 prompts.
- **`scripts/build-index.ts`** — Reads `graph-data.ts` and writes a self-contained `index.html` with all data embedded as JSON for GitHub Pages.
- **`index.html`** — Generated output. Do not edit directly; run `npm run build` instead.

### Graph Model

**Nodes** (`ServiceNode`) represent individual government services. Key fields:
- `proactive` — agent should volunteer this unprompted from context clues
- `gated` — only surface after confirming a prerequisite
- `eligibility` — dual-format: verbose (criteria, keyQuestions, autoQualifiers, exclusions) for agent reasoning; concise (ruleIn, ruleOut) for display

**Edges** have two types:
- `REQUIRES` — strict ordering constraint (prerequisite must be completed first)
- `ENABLES` — source makes target accessible/relevant, but imposes no ordering

**Life Events** (`LifeEvent`) are entry points (e.g., "baby", "bereavement", "job-loss") with `entryNodes` pointing into the graph.

### Journey Planning

`planJourney(lifeEventIds[])` in `graph-engine.ts`:
1. BFS from entry nodes across both REQUIRES and ENABLES edges → discovers all reachable services
2. Topological sort using only REQUIRES edges → groups services into phases (Phase 1 = no prerequisites)

### Adding New Service Nodes

1. Add a `ServiceNode` entry to `NODES` in `src/graph-data.ts`
2. Add relevant edges to `EDGES`
3. Add the node to any relevant life event's `entryNodes` if it's a direct trigger
4. Run `npm run build` to regenerate `index.html`

The `.claude/settings.local.json` grants permission to `WebFetch` from `www.gov.uk` — use this to verify service details against official GOV.UK pages when adding or enriching nodes.
