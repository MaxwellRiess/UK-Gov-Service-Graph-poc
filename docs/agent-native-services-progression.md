# Agent-Native Government Services: A Progressive Capability Model

This document describes a roadmap for UK government services to progressively expose their capabilities to AI agents — moving from static metadata in a central graph to fully agent-native, transactional interfaces. It is intended as a follow-on to the service graph proof-of-concept.

---

## Guiding Principles

**Incremental adoption.** Different services move through the tiers at their own pace. The graph is a heterogeneous registry: each node declares its own capability tier, and agents query that tier to know what they can do with a given service. A service at Tier 0 is still useful; a service at Tier 4 is transformative.

**Authoritative data stays with its source.** The graph describes services centrally. As services move up the tiers, they take ownership of their own node data and, eventually, their own eligibility decisions. A central agent should not be the authoritative judge of whether a citizen qualifies for a benefit — the service that holds the records is. The User Data Platform (UDP) is a complementary mechanism that gives agents access to copies of citizen data across departments, but does not replace service-level authority for high-stakes decisions.

**The agent's role is to gather and present, not to decide.** Agents navigate citizens through complexity, ask the right questions, and relay verdicts. Domain authority and decision-making stay with services.

**Progressive trust.** Each tier requires a higher level of authentication and authorisation than the last. The standard must define what proof is required at each tier.

---

## The Tiers

### Tier 0 — Central Registry Node

The graph team maintains static metadata about a service: name, department, eligibility rules, prerequisites, GOV.UK URL. Services are described *about*, not *by* themselves.

**What agents can do:** Navigate the service landscape. Assess eligibility from static rules. Plan multi-service journeys in the right order.

**Limitation:** Data goes stale. Rules, fees, and processing times change. The graph team becomes a bottleneck.

---

### Tier 1 — Service-Owned Static Manifest

The service publishes a machine-readable manifest at a well-known URL (e.g. `https://service.gov.uk/.well-known/agent-manifest.json`) conforming to the `ServiceNode` schema. The graph registry indexes these manifests rather than maintaining the data centrally.

The service node in the graph gains one new field: `manifest_url`.

**New data services can expose at this tier:**
- Live eligibility thresholds and benefit rates (updated at source when rules change)
- Current processing times
- Fee schedules
- Required evidence lists (which documents are currently accepted)
- Service availability or temporary closures

**What agents can do:** Everything in Tier 0, but with live, authoritative data from the source. Eligibility rules stop being stale.

**What the standard must define:** The `agent-manifest.json` schema. How the graph validates and indexes manifests. How agents discover and cache them.

---

### Tier 2 — Read-Only MCP Server (Unauthenticated)

The manifest declares an `mcp_endpoint`. The service hosts an MCP server that agents can connect to. All tools are read-only and require no citizen authentication — they return general, non-personalised information.

**Standard tools at this tier:**

| Tool | Description |
|---|---|
| `get_eligibility_rules()` | Structured eligibility criteria, thresholds, and key questions |
| `get_wait_time()` | Current processing time |
| `list_required_documents(context)` | Context-aware document list (e.g. renewal vs. first application) |
| `get_appointments_available(location, date_range)` | For services requiring in-person attendance |
| `get_fees()` | Current fee schedule |

**Note on eligibility at this tier:** Because there is no authenticated citizen context, the service can only return rules — not a verdict. The agent receives the rules and reasons against what the citizen has told it. The agent is the judge. This is appropriate at Tier 2 precisely because the service has no access to the citizen's records.

**Interaction with the User Data Platform (UDP):** If the agent has access to UDP, the quality of Tier 2 eligibility pre-screening improves significantly. Rather than relying solely on what the citizen has said in conversation, the agent can evaluate published rules against actual departmental data (NI record, existing entitlements, tax status). For simpler services with straightforward eligibility criteria, Tier 2 plus UDP may be sufficient for a reliable pre-assessment without the service needing to build a Tier 3 endpoint at all. For complex or high-stakes services — where real-time records or caseworker judgment are involved — Tier 3 remains necessary regardless of UDP access.

**What agents can do:** Give citizens real-time eligibility guidance based on current rules. Surface accurate processing times and requirements. Pre-screen whether pursuing a service is worthwhile before asking for personal information. With UDP access, pre-screen using actual citizen data rather than self-reported context.

**What the standard must define:** Required vs. optional tools at this tier. Common data schemas (`EligibilityRules`, `Document`, `Appointment`). How agents locate and connect to the MCP endpoint.

---

### Tier 3 — Authenticated Read MCP Server

The citizen authenticates (via GOV.UK One Login or equivalent), unlocking personalised responses based on their actual record. This tier flips the eligibility model: instead of returning rules for the agent to evaluate, the service now accepts the citizen's stated context, combines it with what it holds on record, and returns a verdict. **The service becomes the judge.**

This is the correct design because for anything means-tested or contribution-based, the eligibility determination requires data the service holds that the agent cannot access — NI contribution records, prior claims, tax data, existing entitlements. A central agent cannot calculate whether a citizen qualifies for State Pension. Only the relevant service can.

**Interaction with the User Data Platform (UDP):** UDP simplifies the Tier 3 interaction by pre-populating `citizen_context` with data the government already holds, rather than requiring the agent to gather it through conversation. The service still makes the judgment — UDP improves the quality and completeness of the input it receives. This also reduces the risk of `more_information_needed` verdicts caused by the agent lacking data that is in fact available.

**Standard tools at this tier:**

| Tool | Description |
|---|---|
| `check_eligibility(citizen_context)` | Returns a structured verdict (see below) |
| `get_my_entitlement()` | Current entitlement value or status |
| `get_my_application_history()` | Prior claims, outcomes, renewal dates |
| `check_change_of_circumstance(scenario)` | "If I start work earning £X, what happens?" |
| `get_upcoming_actions()` | What this service currently needs from the citizen |

**The `check_eligibility` response structure:**

```json
{
  "verdict": "eligible" | "not_eligible" | "more_information_needed",
  "confidence": "confirmed" | "provisional",
  "reason": "Plain-language explanation the agent can relay to the citizen",
  "missing_information": [
    {
      "field": "national_insurance_number",
      "reason": "Required to look up contribution record"
    }
  ],
  "next_action": "apply" | "gather_evidence" | "wait" | "contact_service"
}
```

The `more_information_needed` verdict is important: rather than the agent having to infer what to ask next, the service specifies it. Domain knowledge stays with the service.

**What agents can do:** Deliver authoritative, personalised eligibility verdicts. Monitor a citizen's situation across services. Surface upcoming renewals or required actions proactively.

**What the standard must define:** The citizen authentication and token-passing mechanism. How agents present proof of citizen consent. Scope and expiry of authenticated sessions.

---

### Tier 4 — Transactional MCP Server

The service exposes write tools. This is the step from agents that advise to agents that act. The citizen explicitly authorises the agent to take a specific action on their behalf, and the service verifies that authorisation.

**Standard tools at this tier:**

| Tool | Description |
|---|---|
| `submit_application(data)` | Structured data submission replacing a web form |
| `upload_document(type, content)` | Evidence submission |
| `book_appointment(slot_id)` | Schedule an in-person appointment |
| `report_change_of_circumstances(changes)` | Update the service's records |
| `withdraw_application(reason)` | Cancel a pending application |

**Interaction with the User Data Platform (UDP):** UDP has the most transformative effect at this tier. Without it, an agent helping a citizen apply for something must gather their data through conversation before submitting. With UDP, the same authenticated session that established eligibility can pre-populate the application — the citizen confirms rather than re-enters information the government already holds. This closes the loop between eligibility and action without additional friction.

**What agents can do:** Complete end-to-end journeys. Take a citizen from a life event (e.g. "I just had a baby") to birth registered, Child Benefit claimed, and childcare entitlement applied for — across multiple departments — in a single conversation. With UDP, do this without asking the citizen to re-provide data the government already holds.

**What the standard must define:** The delegation and authorisation protocol. How the citizen grants an agent permission to act. How services verify that permission. Scope limits (e.g. "authorised to submit this one application, not to withdraw existing claims"). Audit trail requirements.

---

### Tier 5 — Service-Initiated Interactions

Services can push events to agents, reversing the direction of the relationship. This requires a citizen-controlled agent endpoint — something the citizen registers with GOV.UK that authorised services can call.

**Standard push events:**

| Event | Description |
|---|---|
| `renewal_due` | Service or document approaching expiry |
| `eligibility_changed` | Citizen newly qualifies or has lost entitlement |
| `action_required` | Document or information needed for an ongoing claim |
| `new_entitlement_available` | Citizen may qualify for something they haven't claimed |
| `decision_made` | Application outcome available |

**What agents can do:** Function as a persistent life admin assistant. Surface the right services at the right moment without the citizen having to initiate. Proactively protect citizens from missing deadlines or losing entitlements.

**What the standard must define:** The citizen agent endpoint registration mechanism. Which services are authorised to push which event types. Rate limits and consent controls. How citizens revoke push access.

---

## The Three-Layer Eligibility Pattern

Eligibility checking is complex enough to warrant its own layered model that runs across the tiers above.

**Layer 1 — Static signals (Tier 0/1)**
The graph node carries `ruleIn`, `ruleOut`, `gated`, and `proactive` flags. These are coarse signals that tell the agent whether to surface a service at all, given context it has already picked up. A `gated` service is never surfaced until a prerequisite is confirmed. A `proactive` service is volunteered unprompted.

*Question the layer answers:* Should the agent mention this service?

**Layer 2 — Rules out (Tier 2)**
The agent calls `get_eligibility_rules()` and evaluates the structured criteria against what the citizen has told it. This is the pre-screening step — is it worth engaging the citizen further on this service? No personal data is sent to the service. Where the agent has UDP access, it evaluates rules against actual citizen data rather than self-reported context, significantly improving pre-screening accuracy. For simpler services, this may be sufficient to reach a reliable conclusion without proceeding to Layer 3.

*Question the layer answers:* Is it worth asking the citizen to pursue this?

**Layer 3 — Verdict in (Tier 3)**
The agent calls `check_eligibility(citizen_context)` with an authenticated citizen. The service combines the agent's stated context with its own records and returns an authoritative verdict.

*Question the layer answers:* Does this citizen actually qualify?

Agents should use Layer 1 to decide whether to mention a service, Layer 2 to decide whether to pursue it, and Layer 3 to obtain a real answer once the citizen is engaged. This maps to how a competent human caseworker approaches the same problem.

---

## What the Standard Must Define

For this model to work across departments, a **GOV.UK Agent Protocol** would need to specify:

**Discovery**
The `agent-manifest.json` schema and what the graph registry guarantees vs. what services declare themselves. How agents discover, validate, and cache manifests. Signed manifests or DNS-based verification to confirm a manifest is genuine.

**Capability Declaration**
A standard capability taxonomy aligned to the tiers above. Required vs. optional tools at each tier. How services declare their tier and what agents can assume.

**Common Data Schemas**
Shared types used across services: `ApplicationStatus`, `EligibilityVerdict`, `Document`, `Appointment`, `ChangeOfCircumstance`. How services extend these for their own domain. Versioning — how agents handle schema evolution as services update their APIs.

**Authentication and Delegation**
How a citizen authenticates to an agent and how the agent presents that to services. How a citizen authorises an agent to act on their behalf. Scope and time limits on delegation. How services verify authorisation without directly interacting with the citizen at the point of the tool call.

**Audit and Accountability**
What transaction records services must keep when acting on agent-initiated requests. How citizens can review what actions were taken on their behalf.

---

## Discovery: Alternatives to the Graph

The graph acts as the discovery mechanism in this model — it is how agents find out which services exist and navigate relationships between them. This is worth examining critically, because it is also a potential bottleneck and a structural dependency that deserves alternatives to be considered.

### Option 1 — The Graph (current model)

A centrally maintained directed graph of services, prerequisites, and life events. Agents query it to understand which services are relevant to a citizen's situation and in what order they should be approached.

**Pros:** The only option that models *relationships between services*. Enables journey planning across departmental boundaries. Agents get a map, not just a list. Cross-departmental prerequisites (e.g. registering a birth before claiming Child Benefit) are explicit and computable.

**Cons:** Services outside the graph are invisible to agents. Whoever maintains the graph has significant influence over discoverability. Requires ongoing curation. Assumes services can be modelled as discrete nodes with explicit, computable prerequisites — not always true.

---

### Option 2 — DNS / Well-Known URLs

Services publish a manifest at a standard path on their own domain (`https://service.gov.uk/.well-known/agent-manifest.json`). An agent that knows a domain can discover capabilities without any central registry. Similar to how OIDC discovery works.

**Pros:** Fully decentralised. No bottleneck. Services own their discoverability completely. Works on the open web without GDS involvement.

**Cons:** The agent has to already know which domains to look at. Doesn't solve the "which services are relevant to this citizen's situation?" problem. You still need something to point agents at the right domains in the first place. Solves capability discovery, not service navigation.

---

### Option 3 — A Central Registry Without the Graph

A flat directory maintained by GDS — a list of services with their manifest URLs and capability tiers, but no graph structure, no edges, and no journey logic.

**Pros:** Much simpler to maintain than a graph. Lower barrier for services to get listed. No need to model prerequisites or relationships, which are often contested or ambiguous.

**Cons:** Loses journey planning capability entirely. An agent querying a flat registry gets a list, not a map. It cannot tell a citizen "you need to do X before Y" or understand which services are triggered by a given life event.

---

### Option 4 — Agent-Side Knowledge

The AI model knows about government services from training data — GOV.UK pages, policy documents, etc. No structured registry at all.

**Pros:** Zero infrastructure required. Works today, to a degree.

**Cons:** Training data goes stale and coverage is uneven. No machine-readable eligibility or prerequisites. No way for a service to declare new capabilities. Fundamentally unverifiable — an agent cannot know whether its training data reflects the current state of a service.

---

### Option 5 — Search and Retrieval

A semantic search index over GOV.UK content. Agents query it with natural language and get relevant service pages back.

**Pros:** Scales to the full breadth of GOV.UK without manual curation. Handles fuzzy or open-ended queries well. Good coverage of the long tail of services that will never be formally modelled.

**Cons:** Returns documents, not structured data. No eligibility model, no prerequisites, no MCP endpoints. Better as a complement to a registry than a replacement.

---

### Option 6 — Federated Departmental Registries

Each department maintains its own registry of services and MCP endpoints. GDS maintains a lightweight index of registries — telling agents which departmental registry to query for which domain.

**Pros:** Distributes the maintenance burden. Departments own their slice. May be more politically tractable — departments more willing to maintain something they control.

**Cons:** Cross-departmental journey planning becomes harder if relationship data (prerequisites, enables) is distributed across registries. An agent planning a bereavement journey spanning HMRC, DWP, and DVLA must query multiple registries and stitch the result together. The graph's value is precisely that cross-departmental relationships are modelled in one place.

---

### Assessment

No single alternative replicates what the graph uniquely provides: a model of *relationships between services* that enables journey planning across departmental boundaries. DNS well-known URLs and flat registries solve capability discovery but not navigation. Search solves breadth but not structure. Federated registries distribute ownership but fragment the relationship model.

The practical conclusion is likely a **hybrid**: the graph handles the relationship and journey planning layer; DNS well-known URLs or a flat registry handle MCP endpoint discovery. Services register their manifest URL centrally, but the graph does not need to be the mechanism through which agents locate an MCP server at runtime — it just needs to point to where that information lives.

This separation matters because it reduces the graph's role as a bottleneck. The graph becomes authoritative for *journey structure* (which services relate to which, in what order) but not for *service capabilities* (what a specific service's MCP server can do today). Services can update their MCP endpoints and capability tiers without going through a central graph update.

---

## The User Data Platform (UDP)

The User Data Platform is a planned central store holding copies of a citizen's data from across government departments — NI records, benefit history, tax status, existing entitlements, and more — accessible to agents with citizen consent. It is a foundational piece of infrastructure for the authenticated tiers and interacts with the model at every level above Tier 1.

### How UDP changes the model

**At Tier 2**, UDP strengthens the agent-as-judge layer. Without UDP, the agent can only evaluate published eligibility rules against what the citizen has said in conversation, which limits pre-screening accuracy. With UDP, the agent evaluates rules against actual government-held data. For services with straightforward eligibility criteria, this may be sufficient to reach a reliable conclusion without the service needing to build a Tier 3 authenticated endpoint. UDP therefore reduces the bar for which services need to progress to Tier 3, concentrating that investment on services where real-time records or caseworker judgment are genuinely required.

**At Tier 3**, UDP improves the quality of input the service receives. Rather than the agent constructing `citizen_context` from conversation, it pre-populates from UDP data. The service still makes the eligibility judgment — UDP makes that judgment better-informed and reduces the likelihood of `more_information_needed` responses caused by missing data the government already holds.

**At Tier 4**, UDP has the most significant effect. Without it, an agent acting on a citizen's behalf must gather their data through conversation before submitting an application. With UDP, the same authenticated session used to confirm eligibility can pre-populate the application. The citizen confirms rather than re-enters. This closes the gap between eligibility and action that would otherwise require significant friction.

### The complications

**Staleness and authority.** UDP holds copies, not live records. For eligibility decisions with financial or legal consequences, the freshness of the data matters. A copy of an NI record from three days ago may not be authoritative enough for a State Pension eligibility determination. The model should express freshness requirements per eligibility factor, and agents should understand which data in UDP is suitable for which decisions.

**Liability.** Where a service makes a Tier 3 eligibility verdict using its own records, it owns that judgment. Where an agent makes an assessment using UDP data and published rules, and the UDP copy is incorrect or stale, liability is less clear. This needs resolving at a policy level before UDP is used to support consequential eligibility decisions without service-level confirmation.

**Privacy and consent.** UDP aggregates records from multiple departments into a single store accessible to agents. The consent model needs to be precise about which data any given agent can access, for which purpose, and for how long. Citizens should be able to see what was accessed on their behalf and revoke access. This is probably the most significant governance question UDP introduces.

### UDP as foundational infrastructure

UDP is best understood as infrastructure that sits beneath the authenticated tiers (Tier 3 and above), not as a parallel capability running alongside them. An agent that has access to UDP but doesn't use it — asking citizens to re-provide data the government already holds — undermines the value of both the data platform and the agent capability. The assess-and-act stream should treat UDP access as a foundational dependency, not an optional enhancement.

---

## Relationship to the Existing Graph

The graph and the agent protocol are complementary, not competing.

The graph models **what exists** — a relatively stable map of services, their types, prerequisites, and life event entry points. It tells an agent how to navigate the service landscape.

A Tier 3+ MCP server models **where a specific citizen is** in that landscape — which services are open to them, what they've already done, what's outstanding. It tells an agent how to act within that landscape on behalf of a real person.

As services move up the tiers, some of what is currently held centrally in the graph becomes redundant — live manifests supersede static eligibility rules, and authenticated MCP servers can return a citizen's actual prerequisites rather than the agent inferring them from the graph structure. The graph's long-term role is likely as a **discovery and navigation layer** rather than a data store: a way for agents to find services and understand the shape of a journey before connecting directly to individual service endpoints.
