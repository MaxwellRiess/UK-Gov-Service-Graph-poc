# UK Government Service Graph — PoC

NB: This is a hand-crafted proof of concept for illustration and education purposes only. Not an approved plan from GDS.

An interactive graph explorer and MCP server for UK government life events.

**[View the live graph →](https://maxwellriess.github.io/UK-Gov-Service-Graph-poc/)**

This is a proof-of-concept for a machine-readable service graph that maps the cross-departmental dependencies between UK government services. The core idea: government services don't exist in isolation. Registering a death is a prerequisite for bereavement benefits, registering a birth unlocks child benefit. Making those relationships explicit and machine-readable enables AI agents to guide citizens through the right services in the right order.

---

## The graph explorer

The interactive explorer visualises 232 service nodes across 15+ departments and all four UK nations, connected by two edge types:

- **REQUIRES** (solid blue arrow) — strict ordering; must complete the source before the target
- **RELATED** (dashed grey arrow) — a loose connection; the source is potentially relevant to the target but imposes no ordering

The detail panel for each node surfaces eligibility rules, contact information (phone, hours, accessibility options), benefit rates, and agent interaction capabilities.

**Controls:**
- Click a life event in the sidebar to trace all services reachable from that entry point
- Click a department to highlight its services and connections
- Click any node to open a detail panel with eligibility info, contact details, financial rates, and GOV.UK links
- Toggle edge types on/off; switch between Force / Hierarchy / BFS layouts
- Search filters nodes by name or department

---

## Experiment: does the graph improve AI journey planning?

We ran a controlled experiment across 9 life event scenarios — new baby, bereavement, job loss, starting a business, immigration, disability, terminal illness, skilled worker arrival, and retirement — comparing two agents:

- **Control** — web search + GOV.UK page fetching only
- **Treatment** — service graph MCP tools only (`plan_journey`, `get_service`, `list_life_events`)

| Metric | Control | Treatment | Δ |
|---|---|---|---|
| Essential recall | 81% | 88% | +7pp |
| Conditional recall | 42% | 69% | **+27pp** |
| Ordering accuracy | 88% | 100% | +12pp |
| Judge completeness (1–5) | 3.33 | 4.04 | +0.71 |
| Input tokens per scenario | 65,390 | 43,483 | -33% |

The graph's main advantage is in **conditional service discovery** — surfacing services that apply depending on the citizen's specific circumstances (e.g. Support for Mortgage Interest, Bereavement Support Payment, voluntary NI contributions). The LLM already knows most essential services from training; the graph ensures the conditional and gated ones aren't missed.

- **[Browse trial 3 transcripts →](https://maxwellriess.github.io/UK-Gov-Service-Graph-poc/experiment-transcripts-trial3.html)**
- **[Full results and findings →](docs/experiment-results-trial3.md)**
- **[Next steps →](docs/findings-and-next-steps.md)**

---

## The MCP server

The `src/graph-server.ts` file is an MCP server exposing the graph to AI agents via four tools:

| Tool | What it does |
|---|---|
| `list_life_events` | Returns the 17 supported life events as entry points |
| `plan_journey` | Computes a sequenced, phased service journey for one or more life events |
| `get_service` | Returns full eligibility detail, contact info, and agent steps for a specific service node |
| `check_eligibility` | Runs structured eligibility rules against known user facts; returns per-service verdicts and the specific questions to ask next |

### `check_eligibility` and progressive disclosure

`check_eligibility` accepts a `user_context` object (50+ optional fields covering age, income, disability, family situation, immigration status, and more) alongside one or more life event IDs. It returns a three-state verdict for every service in the journey:

- **`eligible`** — all rules pass
- **`not_eligible`** — at least one rule definitively fails
- **`needs_more_info`** — some facts are missing; returns the specific questions to ask next

The intended loop is: call with what you know → ask the user the returned `pendingQuestions` → call again with the updated context → repeat until all services have a definitive verdict. Passing `services_receiving` or `services_completed` in the context automatically resolves dependency rules (e.g. if the user already receives Universal Credit, all services that depend on it pass their dependency check).

Deadline-sensitive services (birth registration, SDLT, etc.) also return a `deadlineStatus` of `ok`, `overdue`, or `unknown_trigger_date` when a `trigger_dates` map is provided.

### Connect to an MCP-compatible AI assistant

The server uses STDIO transport and can be connected to any MCP-compatible AI assistant. Add it to your client's server configuration:

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

Then ask the assistant: *"My father just died. What do I need to do?"*

---

## Run locally

```bash
npm install

# Regenerate index.html from graph data
npm run build

# Run the MCP server (STDIO transport)
npm run mcp
```

---

## Repository structure

```
index.html                        Static graph explorer (self-contained, GitHub Pages)
experiment-transcripts-trial3.html  Browsable transcript viewer — trial 3 (GitHub Pages)
src/
  graph-data.ts                   232 service nodes, 280 typed edges, 17 life events
  graph-engine.ts                 BFS + topological sort → phased journey planner
  graph-server.ts                 MCP server (4 tools, 2 resources, 2 prompts)
  rules.ts                        Machine-evaluable eligibility rule engine
scripts/
  build-index.ts                  Generates index.html from graph data
  run-experiment.ts               Runs control vs treatment agent experiment across scenarios
  build-transcript-viewer.ts      Generates self-contained HTML transcript viewers
  check-freshness.ts              Fetches GOV.UK pages and detects content changes
  contact-overrides.ts            Department contact data (phone, hours, accessibility)
  merge-contacts.ts               Injects contact overrides into graph-data.ts
  validate-contacts.ts            QA checks for contact data completeness and format
docs/
  evaluation-experiment-spec.md   Experiment design, scenarios, and scoring criteria
  experiment-results-trial3.md    Full per-scenario results from trial 3
  findings-and-next-steps.md      Summary of findings and proposed next steps
experiment-logs/                  Raw JSONL conversation logs and judge scores
.github/workflows/
  freshness-check.yml             Weekly scheduled action — opens issues when GOV.UK pages change
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
| `nations` | `array` (optional) | Devolved coverage — which of `england`, `scotland`, `wales`, `northern-ireland` the service applies to. Omitted for UK-wide services. |

The `eligibility` object carries the structured data an agent needs to assess and explain entitlement:

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
| `rules` | `array` (optional) | **Machine-evaluable rules** — a typed rule tree (`comparison`, `boolean`, `enum`, `dependency`, `deadline`, `all`/`any`/`not`) consumed by `src/rules.ts` and the `check_eligibility` MCP tool |

> `autoQualifiers`/`exclusions` and `ruleIn`/`ruleOut` are intentionally parallel. The verbose fields carry the nuance an AI agent needs to reason correctly; the short fields are display hints for the visualiser and fast triage. `rules` is the machine-evaluable layer on top — where present it enables programmatic screening; where absent the tool falls back to `keyQuestions`.

The `agentInteraction` object describes what an AI agent can actually do with this service:

| Field | Type | What it means |
|---|---|---|
| `methods` | `array` | Available application channels, e.g. `['online', 'phone', 'post']` |
| `apiAvailable` | `boolean` | Whether a machine-accessible API exists |
| `onlineFormUrl` | `string` (optional) | Direct URL to the online application |
| `authRequired` | `string` | Authentication required, e.g. `'government-gateway'`, `'none'` |
| `agentCanComplete` | `'full' \| 'partial' \| 'inform'` | How far an agent can take the user — full completion, part of the journey, or information only |
| `agentSteps` | `array` | Step-by-step actions the agent should walk the user through |

The `financialData` object carries structured benefit amounts:

| Field | Type | What it means |
|---|---|---|
| `taxYear` | `string` | The tax year the rates apply to, e.g. `'2025-26'` |
| `frequency` | `string` | Payment cadence — `'weekly'`, `'monthly'`, `'annual'`, or `'one-off'` |
| `rates` | `object` | Named rate values, e.g. `{ standard: 72.65, enhanced: 108.55 }` |
| `source` | `string` | GOV.UK URL where the rates were verified |

The `contactInfo` object (also available as department-level defaults in `DEPT_CONTACTS`) carries helpline details:

| Field | Type | What it means |
|---|---|---|
| `phone.number` | `string` | Primary phone number |
| `phone.textphone` | `string` (optional) | Textphone number for deaf/hard of hearing users |
| `phone.relay` | `string` (optional) | Relay UK instructions |
| `phone.welsh` | `string` (optional) | Welsh language line |
| `hours` | `array` | Opening hours by day range, with `open` and `close` times |
| `webchatUrl` | `string` (optional) | Live webchat URL |
| `contactFormUrl` | `string` (optional) | Online contact form URL |
| `localAuthority` | `boolean` (optional) | `true` if contact is handled by the user's local authority |

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
    "ruleOut": ["Reached State Pension age (66+)"],
    "rules": [
      { "type": "comparison", "field": "age", "operator": ">=", "value": 16, "label": "Must be at least 16" },
      { "type": "comparison", "field": "age", "operator": "<",  "value": 66, "label": "Must be under State Pension age" },
      { "type": "boolean", "field": "has_disability", "expected": true, "label": "Has a disability or long-term health condition" }
    ]
  },
  "agentInteraction": {
    "methods": ["online", "phone"],
    "apiAvailable": false,
    "onlineFormUrl": "https://www.gov.uk/pip/how-to-claim",
    "authRequired": "government-gateway",
    "agentCanComplete": "partial",
    "agentSteps": [
      "Check age eligibility (16–65)",
      "Confirm disability or long-term health condition",
      "Guide user through the PIP claim form or phone claim process",
      "Explain the assessment process and typical timescales"
    ]
  },
  "financialData": {
    "taxYear": "2025-26",
    "frequency": "weekly",
    "rates": { "daily_living_standard": 72.65, "daily_living_enhanced": 108.55,
               "mobility_standard": 28.70, "mobility_enhanced": 75.35 },
    "source": "https://www.gov.uk/pip/what-youll-get"
  }
}
```

---

## What this demonstrates

The graph models the **semantic layer** needed for AI agents to navigate government services:

- Service nodes carry structured eligibility data, machine-evaluable rules, contact details, benefit rates, and agent capability metadata
- Typed edges encode cross-departmental ordering constraints and benefit gateway relationships
- Life events are named entry points that map citizen situations to service subgraphs
- Eligibility signals (`proactive`, `gated`, `universal`, `means_tested`) tell agents how to present each service
- The `check_eligibility` tool enables progressive disclosure screening — an agent can identify exactly which questions to ask, in what order, to triage a citizen's entitlements across an entire journey
- Devolved services are tagged by nation, enabling automatic pre-filtering for Scottish, Welsh, and Northern Irish users
