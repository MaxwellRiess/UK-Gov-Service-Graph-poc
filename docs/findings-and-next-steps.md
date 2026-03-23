# Service Graph: Experiment Findings and Next Steps

## What we tested

We ran a controlled experiment across 9 life event scenarios (new baby, bereavement, job loss, starting a business, immigration, disability, terminal illness, skilled worker arrival, retirement) comparing two agent approaches:

- **Control** — agent uses web search and fetches GOV.UK pages directly
- **Treatment** — agent uses the service graph via MCP tools (`list_life_events`, `plan_journey`, `get_service`)

Both agents used the same underlying model (Claude Sonnet 4.6) and the same GOV.UK-aligned system prompt. The judge was Claude Opus 4.6.

---

## Key findings

### The baseline was stronger than expected

The control agent achieved 81% essential recall without the graph — it already knows most services from training data and can retrieve the rest from GOV.UK. The graph pushed this to 88%, a 7pp gap that fell short of our 10pp target.

This means the primary value of the graph is not helping agents discover that services exist. The LLM mostly already knows that.

### Where the graph genuinely helped

| Metric | Control | Treatment | Gap |
|--------|---------|-----------|-----|
| Essential recall | 81% | 88% | +7pp |
| **Conditional recall** | **42%** | **69%** | **+27pp** |
| Proactive recall | 67% | 81% | +14pp |
| Ordering accuracy | 88% | 100% | +12pp |
| Judge completeness (1–5) | 3.33 | 4.04 | +0.71 |
| Input tokens per scenario | 65,390 | 43,483 | -33% |
| Tool calls per scenario | 24 | 7 | -71% |

The two strongest results are **conditional recall** and **ordering accuracy**. These reflect the graph's structural advantages: it encodes which services depend on which circumstances, and it makes sequencing constraints explicit via typed edges.

### What conditional recall measures

Conditional services are those that *may* apply depending on circumstances the citizen hasn't confirmed — for example, Support for Mortgage Interest (only if they have a mortgage), Inheritance Tax forms (only if the estate exceeds £325k), or Bereavement Support Payment (only if the deceased was their spouse, not a parent).

Conditional recall measures whether the agent surfaces these services with appropriate caveats. The +27pp gap reflects a real pattern: the web search agent covers the obvious services and stops, while the graph-augmented agent systematically surfaces conditionally-relevant services because the journey plan includes gated nodes that prompt further investigation.

This is where citizens most often fall through the gap — not because the agent gave wrong information, but because it didn't raise a relevant question.

### The verbosity problem

Treatment responses score better on completeness, but the tradeoff is that responses are longer and harder to follow. When the agent doesn't know which conditional services apply, it includes them all with hedging language:

> "If you have a mortgage, you may be eligible for Support for Mortgage Interest. If the estate exceeds £325,000, you will need to complete an IHT400. Depending on your employment history, New Style JSA may also be available…"

A plan with 12 services, 7 of which are qualified with conditions, is harder to act on than a plan with 8 confirmed-relevant services and no hedging. The completeness gain comes at a readability cost.

---

## Two options for addressing this

### Option A: Clarifying question flow

Before generating a plan, the agent asks a short intake — only the questions needed to resolve which conditional services apply. The citizen answers, and the agent produces a tailored plan with no hedging.

**How this would work with the graph**

The graph already encodes the information needed. Every gated service has:
- An `eligibility` field with `ruleIn` / `ruleOut` criteria
- A `keyQuestions` array specifying what to ask

A revised `plan_journey` response could return not just services and phases, but a structured list of unresolved eligibility questions. The agent collects answers, then calls a second `filter_journey` step to produce a clean, confirmed-relevant plan.

**Example intake for a bereavement scenario**

> "Before I put together a plan, a few quick questions:
> - Are you the spouse or civil partner of the person who died, or a different relation?
> - Did they own property?
> - Do you think the estate might be worth more than £325,000?
>
> Your answers will help me focus on what's relevant to you."

Three questions resolve four conditional services (Bereavement Support Payment, Probate, IHT400, council tax discount) and remove the need for any hedging in the response.

**Tradeoff**

This adds upfront friction, which matters most for distressed users (bereavement, terminal illness, job loss). The question list needs to be short — ideally 3–5 questions — and the agent should infer what it can from what the citizen has already said before asking. The design challenge is identifying the minimum set of questions that unlock maximum plan precision.

---

### Option B: Persistent user facts (profile-first personalisation)

Rather than asking questions at the start of each conversation, the citizen's relevant facts are stored and reused. The agent consults the profile before generating a plan and resolves conditional services automatically.

**What a minimal fact profile looks like**

```json
{
  "maritalStatus": "widowed",
  "hasProperty": true,
  "hasMortgage": false,
  "employmentStatus": "employed",
  "niGapsExist": true,
  "dependants": ["child_under_16"],
  "receivingBenefits": ["dwp-universal-credit"]
}
```

A fact profile like this resolves the majority of conditional services across all 9 scenarios without the citizen needing to answer any questions. The journey plan returns only confirmed-relevant services, and the response can drop all conditional language.

**Connection to GOV.UK One Login**

GOV.UK One Login is the natural source for this profile. An authenticated user may already have known facts available: NI record and gaps (HMRC), benefits in payment (DWP), council tax registration (LA), property ownership (HMRC), immigration status (Home Office). If those facts are accessible at planning time, the graph's `ruleIn` / `ruleOut` eligibility conditions can be evaluated automatically — the agent never needs to hedge.

This is a fundamentally different product from what the experiment tested. The graph becomes an eligibility engine that maps a citizen's known profile onto a set of confirmed entitlements, not a discovery tool that surfaces possibilities.

**How it would work with the graph**

The `plan_journey` tool would accept an optional `user_facts` argument. The server evaluates each gated service's eligibility conditions against the supplied facts and filters the journey to only services where `ruleIn` conditions are met and `ruleOut` conditions are not. Services where facts are unknown are returned with questions attached (falling back to Option A for the gaps).

This lets the two approaches compose: use the persistent profile for known facts, ask clarifying questions only for the remainder.

---

## Summary

The experiment confirms the graph adds measurable value for complex, multi-step life events — particularly in surfacing conditional services and enforcing correct ordering. The verbosity problem in treatment responses is not a graph limitation; it is a consequence of generating plans without first resolving which conditions apply to this specific citizen.

Both next steps address the same root cause. A clarifying question flow is achievable now with the existing graph data and MCP   architecture. Profile-first personalisation via One Login is the higher-leverage, longer-term direction — it eliminates the intake friction entirely and makes the conditional recall advantage fully deterministic rather than probabilistic.
