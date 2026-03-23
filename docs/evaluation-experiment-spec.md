# Evaluation Experiment: Does the Service Graph Improve Agent Journey Planning?

**Version:** 0.1
**Status:** Draft
**Date:** 2026-03-20

---

## 1. Objective

This document specifies an empirical experiment to test whether an AI agent equipped with the UK Government Service Graph MCP tools produces materially better journey plans for citizens than an agent relying solely on live GOV.UK web content.

---

## 2. Hypotheses

**Primary hypothesis (H1):** The graph agent will surface more of the correct services for a given life event scenario (higher recall against a reference checklist) with fewer false positives (higher precision) than the baseline agent.

**Secondary hypotheses:**

| ID | Hypothesis |
|----|------------|
| H2 | The graph agent will more frequently recommend services in the correct sequence (ordering accuracy) |
| H3 | The graph agent will surface more cross-departmental services that do not appear on the primary GOV.UK guidance page for a life event |
| H4 | The graph agent will more reliably withhold gated/conditional services until eligibility is confirmed |
| H5 | The graph agent will more reliably volunteer proactively-flagged services the citizen did not explicitly ask about |
| H6 | The graph agent will produce equivalent or better results with fewer tool calls and fewer input tokens |

---

## 3. Conditions

### 3.1 Control — Baseline Agent

- **Model:** Claude claude-sonnet-4-6 (same model as treatment)
- **Tools available:**
  - `WebFetch` (GOV.UK only, matching the existing permission grant)
  - `WebSearch` (GOV.UK scoped)
- **System prompt:** Standard assistant persona instructed to help citizens navigate UK government services. No mention of the graph or MCP server. See Appendix A.
- **Tool descriptions:** Reflect web access only.

### 3.2 Treatment — Graph Agent

- **Model:** Claude claude-sonnet-4-6
- **Tools available:**
  - `list_life_events` — returns all available life events
  - `plan_journey` — BFS + topological sort from life event entry nodes
  - `get_service` — full node detail including eligibility, phase, flags
  - `WebFetch` (GOV.UK only, as a supplement for detail the graph lacks)
- **System prompt:** Same standard assistant persona, with an additional section explaining that a structured service graph is available and should be used to plan journeys. See Appendix A.

### 3.3 Control variables

The following must be held constant across both conditions:

- Base model and model version
- Temperature (set to 0.3 for reproducibility while allowing natural variation; see §6)
- Max tokens per response (4096)
- The user-facing prompt text (identical for both)
- No conversation history (each scenario is a fresh session)

---

## 4. Test Scenarios

### 4.1 Scenario selection criteria

Scenarios were selected to:
1. Span multiple life events already modelled in the graph
2. Vary in complexity (number of services involved, number of departments spanned)
3. Include cases where graph-specific features (gated nodes, proactive flags, ordering) should make a measurable difference
4. Represent real citizen circumstances, not abstract queries

### 4.2 Scenario set

Each scenario has a **primary prompt** (how the citizen naturally phrases it) and one or two **follow-up probes** to test depth of guidance.

---

#### S1 — Having a baby (common, well-documented)

**Life event:** `baby`
**Complexity:** Medium. Multiple mandatory registrations and entitlements across GRO, HMRC, DWP, NHS.
**Graph-specific test:** Ordering (register birth before Child Benefit); proactive surfacing of UC top-up and Healthy Start if income context is given.

**Primary prompt:**
> "I'm due to have my first baby in six weeks. What do I need to do and when?"

**Follow-up A:**
> "We're on a low income and my partner is self-employed. Are there any additional benefits we should look into?"

**Follow-up B:**
> "What's the very first thing I need to do once the baby is born?"

**Reference notes:** Ordering matters here — `gro-register-birth` must precede `hmrc-child-benefit` and `dwp-universal-credit` claims. Follow-up A should surface `nhs-healthy-start` and `hmrc-smp`.

---

#### S2 — Bereavement (emotionally sensitive, cross-departmental)

**Life event:** `bereavement`
**Complexity:** High. Spans GRO, HMRC, DWP, HMCTS (probate), DWP (bereavement support), DVLA.
**Graph-specific test:** Cross-departmental discovery; `gro-death-certificate` → `fco-document-legalisation` chain if assets are abroad; proactive bereavement support payment.

**Primary prompt:**
> "My mother passed away last week. She lived alone and owned her home. What do I need to sort out and in what order?"

**Follow-up A:**
> "She had some savings and owned property in Spain. Does that change anything?"

**Follow-up B:**
> "My mother was receiving Pension Credit. What happens to her benefits?"

**Reference notes:** Follow-up A should trigger `fco-document-legalisation` for the death certificate. Follow-up B should prompt guidance on notifying DWP to stop payments and possible eligibility for `dwp-bereavement-support-payment`.

---

#### S3 — Job loss (benefit chain, complex eligibility)

**Life event:** `job-loss`
**Complexity:** High. UC, JSA, ESA, council tax reduction all interact; ordering matters.
**Graph-specific test:** Phase sequencing (what to claim first); gated services (ESA only if health condition); proactive surfacing of council tax reduction.

**Primary prompt:**
> "I was made redundant last Friday after five years with the same employer. I have a mortgage and no savings. What should I do?"

**Follow-up A:**
> "I've been signed off by my GP with stress and anxiety. Does that affect anything?"

**Follow-up B:**
> "My redundancy payment was £12,000. Does that affect what benefits I can claim?"

**Reference notes:** Follow-up A should trigger `dwp-new-style-esa` pathway over JSA. Follow-up B tests knowledge of the capital rules for UC and JSA. Graph advantage: correct phase ordering (claim UC immediately, not after ESA is exhausted).

---

#### S4 — Starting a limited company (business licensing chains)

**Life event:** `starting-a-business` (if present) or composite
**Complexity:** High. Companies House, HMRC, LA licensing, VOA, potential sector-specific licences.
**Graph-specific test:** Cross-departmental business licensing discovery (`la-business-rates`, `voa-business-rates`, `ukri-find-grants`); these are recently integrated isolated nodes — a good stress test of the new edges.

**Primary prompt:**
> "I want to register a limited company to run a small building and renovation business operating in London. What do I need to do?"

**Follow-up A:**
> "We'll sometimes need to put skips on the road outside properties we're working on. Is there anything specific for that?"

**Follow-up B:**
> "Are there any grants or funding available for a new construction business?"

**Reference notes:** Follow-up A should surface `la-skip-permit` and `la-road-occupation-licence` — these are newly integrated nodes. Follow-up B should surface `ukri-find-grants`. The control agent is unlikely to find these without targeted GOV.UK searches.

---

#### S5 — EU citizen, settled status (immigration chain)

**Life event:** `moving-to-uk` or `immigration` (relevant life event)
**Complexity:** Medium. EUSS, right to work, DWP access, NHS registration.
**Graph-specific test:** `ho-eu-settled-status` → `ho-euss-enquiry` chain; gated DWP access; proactive NHS registration.

**Primary prompt:**
> "I'm an Italian citizen who has lived in the UK since 2018. I have pre-settled status. What should I be doing now and what am I entitled to?"

**Follow-up A:**
> "My pre-settled status is due to expire soon. What do I need to do?"

**Follow-up B:**
> "I've applied for settled status but haven't heard back. Is there a way to check?"

**Reference notes:** Follow-up B directly tests the `ho-euss-enquiry` node. Control agent should find this but via separate GOV.UK lookup; graph agent should surface it as a direct next step.

---

#### S6 — Long-chain disability / care (multi-hop, newly integrated)

**Life event:** `disability` or composite
**Complexity:** High. DVLA → DWP (PIP/AA) → NHS care assessment → LA disabled facilities grant. This is the longest newly integrated chain — a direct test of the edge additions.
**Graph-specific test:** The full chain `dvla-notify-condition → dwp-pip → nhs-care-assessment → la-disabled-facilities-grant` which only exists after the edge integration work. The control agent is unlikely to connect all four steps in sequence.

**Primary prompt:**
> "I was recently diagnosed with Parkinson's disease. I'm still driving. What do I need to do and what support is available to me?"

**Follow-up A:**
> "I'm finding it harder to manage at home. What adaptations help is available?"

**Follow-up B:**
> "My wife looks after me full time. Is there anything she should apply for?"

**Reference notes:** Follow-up A should surface `nhs-care-assessment` → `la-disabled-facilities-grant`. Follow-up B should surface `dwp-carers-allowance` → `la-carers-assessment` → `other-carers-leave`. The graph has all of this explicitly; the control agent must reconstruct it from GOV.UK pages.

---

### 4.3 Scenario summary

| ID | Life event | Departments spanned | Key graph features tested | Difficulty |
|----|------------|---------------------|---------------------------|------------|
| S1 | Having a baby | GRO, HMRC, DWP, NHS | Ordering, proactive flags | Medium |
| S2 | Bereavement | GRO, HMRC, DWP, HMCTS, FCDO | Cross-dept discovery, document chain | High |
| S3 | Job loss | DWP, HMRC, LA | Phase sequencing, gated nodes | High |
| S4 | Starting a business | CH, HMRC, LA, VOA, UKRI | Newly integrated isolated nodes | High |
| S5 | EU settled status | Home Office, DWP, NHS | Chain + newly integrated EUSS node | Medium |
| S6 | Disability diagnosis | DVLA, DWP, NHS, LA | Long multi-hop chain, new edges | High |

---

## 5. Ground Truth Construction

### 5.1 Reference service checklists

For each scenario (including follow-ups), manually construct a **reference checklist** of services the agent *should* mention, drawn from:

1. The relevant GOV.UK life event guide pages
2. The graph's own node set for those life events
3. Expert review (at least one person with service design or policy familiarity)

Each service in the checklist is classified as:

- **Essential** — the citizen will definitely need this, regardless of circumstance
- **Conditional** — the citizen may need this depending on personal circumstances revealed in the scenario
- **Proactive** — the citizen didn't ask, but should be told (maps to `proactive: true` nodes)
- **Out of scope** — services that should NOT appear (e.g. `hmcts-divorce` in baby journey)

The checklists must be constructed **before** running any agent, to prevent bias.

### 5.2 Reference ordering

For scenarios where sequencing matters, define the canonical ordering of essential services (e.g., for S1: birth registration → child benefit → UC if applicable).

---

## 6. Evaluation Metrics

### 6.1 Per-response metrics

| Metric | Definition | How measured |
|--------|------------|--------------|
| **Essential recall** | Fraction of essential services mentioned | Checklist match |
| **Conditional recall** | Fraction of conditional services mentioned when condition is present in prompt | Checklist match, filtered |
| **Proactive recall** | Fraction of proactive-flagged services surfaced without being asked | Checklist match |
| **False positive rate** | Fraction of mentioned services that are not in the reference set | Checklist match |
| **Ordering accuracy** | For scenarios with a defined canonical order: fraction of adjacent pairs mentioned in correct order | Manual / automated pair comparison |
| **Out-of-scope inclusion rate** | Were any explicitly out-of-scope services mentioned? | Binary per scenario |
| **Tool call count** | Number of tool invocations to reach the final response | Logged from agent trace |
| **Input token count** | Tokens consumed across all tool calls and turns | Logged from API response |

### 6.2 LLM-as-judge scores

In addition to checklist-based scoring, an LLM judge will score each response on four dimensions using a 1–5 rubric (see Appendix B):

| Dimension | What it captures |
|-----------|-----------------|
| **Completeness** | Does the response cover the citizen's likely needs? |
| **Accuracy** | Are service names, eligibility rules, and URLs correct? |
| **Sequencing** | Is the recommended order sensible and actionable? |
| **Clarity** | Is the response understandable and appropriately scoped? |

**Judge model:** Use a different model family from the test agents (e.g. GPT-4o or Gemini) to avoid self-preference bias. If only Claude is available, use claude-opus-4-6 with an explicit instruction to evaluate without preference for Claude-generated text.

**Judge inputs:** The judge receives the scenario prompt, the reference checklist (as a grounding document), and the agent's response. It does NOT see which condition produced the response.

### 6.3 Aggregation

Report metrics at three levels:
1. Per-scenario, per-condition
2. Per-scenario, averaged across runs
3. Overall summary (mean and 95% CI across all scenarios)

---

## 7. Execution Protocol

### 7.1 Runs per scenario

Run each scenario **5 times per condition** at `temperature=0.3`. This gives a distribution over the model's natural variability. Report mean and standard deviation.

Total runs: 6 scenarios × 3 prompts (primary + 2 follow-ups) × 2 conditions × 5 runs = **180 agent invocations**.

For each scenario, the primary prompt and follow-up prompts are run as a single multi-turn conversation (not independently), to reflect realistic citizen usage.

### 7.2 Logging requirements

Each run must log:
- Full conversation transcript (user turns + assistant turns + tool calls/results)
- Tool call names, inputs, and outputs
- Token counts (input, output, cached) per turn
- Condition label (control / treatment)
- Scenario ID and run number
- Timestamp

Store logs as JSONL, one file per run.

### 7.3 Scoring pipeline

1. **Automated checklist scoring:** Parse agent responses for service names and node IDs. Match against reference checklist using both exact string match and fuzzy match (to handle paraphrasing — e.g. "Universal Credit" vs "UC").
2. **LLM judge scoring:** Submit each transcript to the judge with the rubric. Parse structured scores from judge response.
3. **Manual review sample:** Randomly sample 10% of responses for manual scoring to validate automated scores.

### 7.4 Blinding

The person constructing reference checklists must not see agent responses before the checklists are finalised. The LLM judge is presented responses without condition labels.

---

## 8. Analysis Plan

### 8.1 Primary analysis

For each metric, compute:
- Mean score per condition across all scenarios and runs
- 95% confidence interval (bootstrap resampling, n=1000)
- Effect size (Cohen's d for continuous metrics; relative risk for binary)

Report as a comparison table:

| Metric | Control (mean ± CI) | Treatment (mean ± CI) | Δ | p-value |
|--------|--------------------|-----------------------|---|---------|
| Essential recall | | | | |
| Proactive recall | | | | |
| Ordering accuracy | | | | |
| … | | | | |

### 8.2 Secondary analysis

**By scenario:** Are gains concentrated in high-complexity scenarios (S4, S6) as expected? Report per-scenario breakdowns.

**By feature type:** Segment results by:
- Scenarios involving newly integrated nodes (S4, S6) — tests whether the edge integration work created real agent value
- Scenarios involving REQUIRES ordering — tests H2 specifically

**Efficiency vs quality trade-off:** Plot quality score (F1 = harmonic mean of precision and recall) against token cost per condition. Does the graph deliver better quality at lower cost?

### 8.3 Failure analysis

For any scenario where the control agent outperforms the treatment agent, manually examine transcripts to understand why. Likely explanations:
- GOV.UK had richer detail for that specific service
- The agent failed to use the graph tools effectively (tool use failure vs graph coverage failure — distinguish these)
- Graph data was incorrect or incomplete

---

## 9. Known Limitations and Confounds

| Limitation | Mitigation |
|------------|------------|
| **GOV.UK is always live; graph may lag** | Verify all graph nodes against GOV.UK before running; flag any stale nodes |
| **Prompt sensitivity** | Use fixed prompts; test 2–3 phrasings per scenario to estimate sensitivity |
| **Agent may have the graph but not use it** | Log tool calls; separately analyse runs where graph tools were/weren't called |
| **LLM judge bias** | Use cross-model judging; validate with human review sample |
| **Reference checklist is not exhaustive** | Checklists are a floor, not a ceiling; false negatives in the checklist will undercount both agents equally |
| **Life events not fully modelled in graph** | For S4 (starting a business), check whether a life event entry point exists; if not, note this as a graph coverage gap rather than an agent failure |
| **Single model tested** | Findings are specific to claude-sonnet-4-6; generalisation to other models or versions requires re-running |
| **Small sample** | 5 runs per scenario gives limited statistical power; treat effect sizes as directional rather than definitive |

---

## 10. Success Criteria

The graph is considered to provide **material value** if, across the full scenario set:

- Essential recall: treatment ≥ control + 10 percentage points
- Proactive recall: treatment ≥ control + 15 percentage points (this is where structured metadata should most clearly win)
- False positive rate: treatment ≤ control (no worse)
- Ordering accuracy: treatment ≥ control + 10 percentage points
- At least 3 of 6 scenarios show clear treatment advantage on the primary F1 metric

The graph is considered to provide **no material value** if the treatment condition fails to meet any of these thresholds. In that case, the experiment should be used to diagnose *why* — whether the gap is in graph coverage, agent tool use, or something else.

---

## 11. Outputs

The experiment should produce:

1. **Raw logs** — JSONL files for all 180 runs
2. **Scored results spreadsheet** — per-run metric scores
3. **Summary report** — analysis per §8, including narrative interpretation
4. **Failure analysis** — qualitative review of cases where control outperforms treatment
5. **Recommendations** — specific graph improvements (missing nodes/edges, stale data, missing life events) identified through the failure analysis

---

## Appendix A — System Prompts

### Control system prompt

```
You are a helpful assistant that guides UK citizens through government services.
When a citizen describes their situation, help them understand which government
services they need, in what order, and how to access them.

You have access to GOV.UK web search and fetch tools. Use these to find
accurate, up-to-date information about services before responding.

Be specific: name the actual services, explain any eligibility conditions,
and indicate what needs to happen before other steps can be taken.
```

### Treatment system prompt

```
You are a helpful assistant that guides UK citizens through government services.
When a citizen describes their situation, help them understand which government
services they need, in what order, and how to access them.

You have access to a structured UK Government Service Graph via MCP tools:
- Use `list_life_events` to find the relevant life event(s) for the citizen's situation
- Use `plan_journey` with the relevant life event ID(s) to retrieve a full journey plan,
  including service phases and dependencies
- Use `get_service` to retrieve detailed eligibility information about specific services
- You may also use GOV.UK web fetch to supplement graph data with specific details

The graph encodes real service dependencies (REQUIRES = must be done first;
RELATED = loosely connected, potentially relevant). Use the phase ordering it returns to
sequence your guidance. Surface proactively-flagged services even if the citizen
didn't ask. For gated services, confirm the relevant prerequisite before mentioning them.
```

---

## Appendix B — LLM Judge Rubric

**Instructions to judge:** You are evaluating the quality of AI-generated guidance for UK citizens navigating government services. Score the response on each dimension from 1 to 5. Be critical and calibrated — a 5 requires no meaningful gaps.

### Completeness (1–5)
Does the response cover all the services the citizen is likely to need?
- **5:** All essential and most conditional services surfaced; proactive services volunteered where appropriate
- **4:** All essential services present; minor conditional services missing
- **3:** Most essential services present; some notable gaps
- **2:** Only the most obvious services mentioned; significant gaps
- **1:** Incomplete to the point of being unhelpful

### Accuracy (1–5)
Are the service names, eligibility rules, and process descriptions correct?
- **5:** No factual errors; URLs and service names correct; eligibility conditions accurately stated
- **4:** Mostly accurate; minor imprecision but nothing that would mislead
- **3:** Broadly correct but with one or two meaningful errors
- **2:** Significant factual errors that could cause the citizen to take wrong actions
- **1:** Substantially wrong

### Sequencing (1–5)
Is the recommended order of actions sensible and correct?
- **5:** Correct ordering of all dependent steps; phases clearly communicated
- **4:** Generally correct; minor sequencing imprecision
- **3:** Correct for obvious dependencies but misses non-obvious ordering constraints
- **2:** Incorrect sequencing that could cause delays or rejected applications
- **1:** No meaningful sequencing guidance

### Clarity (1–5)
Is the response well-structured, appropriately scoped, and easy to follow?
- **5:** Clearly structured; appropriate depth; no irrelevant information
- **4:** Clear and useful; minor scope issues
- **3:** Understandable but either too long/short, or missing structure
- **2:** Hard to follow; poorly scoped
- **1:** Confusing or unusable

**Output format required from judge:**
```json
{
  "completeness": <1-5>,
  "accuracy": <1-5>,
  "sequencing": <1-5>,
  "clarity": <1-5>,
  "completeness_rationale": "<one sentence>",
  "accuracy_rationale": "<one sentence>",
  "sequencing_rationale": "<one sentence>",
  "clarity_rationale": "<one sentence>",
  "notable_omissions": ["<service name>", ...],
  "notable_errors": ["<description>", ...]
}
```
