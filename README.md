# UK Government Service Graph — PoC

NB: This is a hand-crafted proof of concept for illustration and education purposes only. Not a approved plan from GDS. 

An interactive graph explorer and MCP server for UK government life events.

**[View the live graph →](https://maxwellriess.github.io/UK-Gov-Service-Graph-poc/)**

This is a proof-of-concept for a machine-readable service graph that maps the cross-departmental dependencies between UK government services. The core idea: government services don't exist in isolation. Registering a death is a prerequisite for bereavement benefits, registering a birth unlocks child benefit. Making those relationships explicit and machine-readable enables AI agents to guide citizens through the right services in the right order.

---

## The graph explorer

The interactive explorer visualises 108 service nodes across 14 departments, connected by two edge types:

- **REQUIRES** (solid blue arrow) — strict ordering; must complete the source before the target
- **ENABLES** (dashed grey arrow) — the source makes the target accessible or relevant

**Controls:**
- Click a life event in the sidebar to trace all services reachable from that entry point
- Click a department to highlight its services and connections
- Click any node to open a detail panel with eligibility info, prerequisites, and GOV.UK links
- Toggle edge types on/off; switch between Force / Hierarchy / BFS layouts
- Search filters nodes by name or department

---

## The MCP server

The `src/graph-server.ts` file is an MCP server exposing the graph to AI agents via three tools:

| Tool | What it does |
|---|---|
| `list_life_events` | Returns the 16 supported life events as entry points |
| `plan_journey` | Computes a sequenced, phased service journey for one or more life events |
| `get_service` | Returns full eligibility detail for a specific service node |

Connect it to Claude Desktop by adding to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "uk-services-graph": {
      "command": "npx",
      "args": ["tsx", "/path/to/this/repo/src/graph-server.ts"]
    }
  }
}
```

Then ask Claude: *"My father just died. What do I need to do?"*

---

## Run locally

```bash
npm install

# Regenerate index.html from graph data
npm run build

# Run the MCP server (for Claude Desktop)
npm run mcp
```

---

## Repository structure

```
index.html          Static graph explorer (self-contained, GitHub Pages)
src/
  graph-data.ts     108 service nodes, typed edges, 16 life events
  graph-engine.ts   BFS + topological sort → phased journey planner
  graph-server.ts   MCP server (list_life_events, plan_journey, get_service)
scripts/
  build-index.ts    Generates index.html from graph data
```

---

## Service node schema

Every node in the graph is a `ServiceNode` object. Here is what each field means:

| Field | Type | What it means |
|---|---|---|
| `id` | `string` | Unique slug in `dept-name` format, e.g. `dwp-pip` |
| `name` | `string` | Human-readable service name, e.g. `"Personal Independence Payment"` |
| `dept` | `string` | Owning department display name, e.g. `"DWP"` |
| `deptKey` | `string` | Lowercase slug used for filtering and colouring, e.g. `"dwp"` |
| `serviceType` | enum | Category of service — one of `benefit`, `entitlement`, `obligation`, `registration`, `application`, `legal_process`, `document`, `grant` |
| `deadline` | `string \| null` | Time-sensitive deadline if one exists, e.g. `"42 days"` for birth registration; `null` if open-ended |
| `desc` | `string` | One or two sentence plain-English description of what the service does and why it matters |
| `govuk_url` | `string` | Canonical GOV.UK URL |
| `proactive` | `boolean` | `true` if an AI agent should volunteer this service unprompted when a relevant life event is detected |
| `gated` | `boolean` | `true` if the service should only be surfaced after confirming a prerequisite is in place (e.g. don't mention probate until the death is registered) |

The `eligibility` object on each node carries the structured data an agent needs to assess and explain entitlement:

| Field | Type | What it means |
|---|---|---|
| `summary` | `string` | One or two sentence plain-English eligibility overview |
| `universal` | `boolean` | `true` if virtually anyone in the relevant situation qualifies — no further gating needed |
| `means_tested` | `boolean` | `true` if the payment or amount depends on income or savings |
| `criteria` | `array` | Each entry is a `{ factor, description }` pair — `factor` is a category (e.g. `age`, `income`, `disability`) and `description` explains the specific rule in plain English |
| `keyQuestions` | `array` | Questions an AI agent should ask the user to determine whether they qualify |
| `autoQualifiers` | `array` (optional) | **Agent logic signal.** Full-sentence conditions that confirm eligibility with certainty — if any are met, the agent can stop asking questions and proceed. Captures nuance that short tags cannot, e.g. *"Birth registered, no parent earns over £60k"*. |
| `exclusions` | `array` (optional) | **Agent logic signal.** Full-sentence reasons someone is not eligible, including caveats worth relaying to the user, e.g. *"Not worth claiming if income over £80k — but still worth claiming to protect NI credits."* |
| `evidenceRequired` | `array` (optional) | Documents or proof the user will typically need to apply |
| `ruleIn` | `array` | **Display signal.** Concise 3–7 word positive qualifiers for quick scanning, e.g. `"Disability or long-term health condition"`. Derived from `criteria` and `autoQualifiers`. Empty `[]` for truly universal services. |
| `ruleOut` | `array` | **Display signal.** Concise 3–7 word hard disqualifiers for quick scanning, e.g. `"Reached State Pension age (66+)"`. Derived from `exclusions` and `criteria`. Empty `[]` if none apply. |

> `autoQualifiers`/`exclusions` and `ruleIn`/`ruleOut` are intentionally parallel. The verbose fields carry the nuance and caveats an AI agent needs to reason correctly; the short fields are display hints for the visualiser and fast triage. Both are populated independently because compression loses information.

**Example — `dwp-pip` (Personal Independence Payment):**

```jsonc
{
  "id": "dwp-pip",
  "name": "Personal Independence Payment",
  "dept": "DWP",
  "deptKey": "dwp",
  "serviceType": "benefit",
  "deadline": null,
  "proactive": true,
  "gated": true,
  "eligibility": {
    "summary": "For people aged 16–64 with a long-term physical or mental health condition ...",
    "universal": false,
    "means_tested": false,
    "criteria": [
      { "factor": "disability", "description": "Long-term physical or mental health condition ..." },
      { "factor": "age",        "description": "Must be aged 16–64 ..." }
    ],
    "keyQuestions": [
      "Do you have a long-term health condition or disability?",
      "Are you aged 16–64?"
    ],
    "ruleIn":  ["Disability or long-term health condition", "Aged 16–64"],
    "ruleOut": ["Reached State Pension age (66+)"]
  }
}
```

---

## What this demonstrates

The graph models the **semantic layer** needed for AI agents to navigate government services:

- Service nodes carry structured eligibility data (criteria, key questions, evidence required)
- Typed edges encode cross-departmental ordering constraints
- Life events are named entry points that map citizen situations to service subgraphs
- Eligibility signals (`proactive`, `gated`, `universal`, `means_tested`) tell agents how to present each service

