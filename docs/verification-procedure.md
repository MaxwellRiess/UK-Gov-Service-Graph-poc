# Raising the confirmed share of the graph

A procedure for working through every field `get_service` reports as anything other than `confirmed`, so the graph ends up saying only what GOV.UK (or the service's own official site) states.

## The measure

```bash
npm run report:coverage            # print
npm run report:coverage -- --write # also append a snapshot to data/coverage-history.jsonl
```

It counts claim fields the way `get_service` does, so the number is what an agent sees. Baseline on 21 October 2026:

| | Fields |
|---|---|
| Claim fields | 3,307 |
| Inferred (authored judgements, excluded from the measure) | 91 |
| **Confirmed** | **1,665 of 3,216 (51.8%)** |

Two numbers are tracked, not one: the confirmed **share** and the confirmed **count**. Deleting a claim raises the share without adding anything true. A pass where the share rises and the count falls has only removed things. That can be the right result for a pass, but the report should show it.

## Why each field is not confirmed

The verification passes leave a reason on every record. Each reason needs a different fix, so the work is organised by reason rather than by service.

| Reason | Fields | What it means | Fix |
|---|---|---|---|
| Contradicted | 31 | A cited page says otherwise | Correct it |
| Awaiting re-verification | 57 | A fix was applied from quoted sources but nobody independent has judged it | Re-judge |
| No verdict | 48 | The check itself failed: a quote the model gave was not on the page, a site returned 403, a literal didn't match | Re-run, or check by hand |
| Partly supported | 565 | Some claims in the field are on the page, some aren't | Refine |
| Not stated | 521 | None of the field's claims are on the cited pages | Search wider, then remove |
| Unsourced | 329 | Never checked: `agentSteps` (220), `nations` (66), `deptKey` (32), `deadline` (11) | Verify, or decide what they are |

"Partly supported" is mostly covered by the existing 625-item worklist ([review-worklist.md](review-worklist.md)). "Not stated" is not: only 13 of those 521 fields are on it. That is the main gap.

Where the not-stated fields are:

| Field | Not stated |
|---|---|
| `eligibility.evidenceRequired` | 194 |
| `agentInteraction.authRequired` | 173 |
| `agentInteraction.methods` | 58 |
| `eligibility.criteria` | 46 |
| `eligibility.exclusions`, `autoQualifiers` | 28 |
| `desc`, `eligibility.summary` | 22 |

## The rule for one claim

Every field breaks down into claims. Each claim goes through the same steps:

1. **Is it stated on a page the service already cites?** It's confirmed. Nothing to do.
2. **Is it stated on another official page?** Re-cite it: add the page to `eligibility.sources` or the field's source and re-judge. The text doesn't change. Look before cutting, because many not-stated claims are true and important but sit on a page nobody cited (divorce residence rules, who may register a death, who can get a passport).
3. **Does a page state something narrower or different?** Refine it: rewrite to the smallest wording the quotes support. Keep the official page's terms ("usually", "may") and don't put back what was cut.
4. **Is it stated nowhere?** Remove it:
   - a list item (criterion, exclusion, evidence, qualifier, method) is deleted
   - prose (`desc`, `summary`) loses the unsupported clause, not the whole field
   - a required field that can't be deleted goes to a schema decision (below)

Never keep a claim because it is probably true. CLAUDE.md already says an absent field is honest and a plausible invented one is not. Obvious-sounding items such as "vehicle registration number" for a SORN still go. They add little and are exactly the kind of thing that looks right without being checked.

Every removal is logged to `data/removed-claims.json` with the old text, the field, the pages searched and the date. Nothing is lost: if a source turns up later, the claim can come back with it.

## Stages

Work through them in this order. The early ones are mechanical and cheap. The later ones need a person to review them.

### 1. Clear the mechanical backlog (about 105 fields)

- **Awaiting re-verification (57).** `npx tsx scripts/widen-sources.ts --from-proposals --split-all --write`. This is already built. It just hasn't been run on everything.
- **No verdict (48).**
  - Discarded judgements: re-run `verify:prose` with `--only`.
  - 403s on `service.gov.uk` hosts: check in a browser and record as `manual`.
  - The 27 `eligibility.rules` values that failed literal matching are mostly a rounding problem, like `16` stored for "15 years and 9 months". Store the value the page gives, or give the rule a `unit` the matcher understands.
  - The 7 deadline mismatches are real disagreements. Review each one.

### 2. Correct contradictions (31)

27 of the 31 are `authRequired: 'none'` on services whose page says to sign in. Fix by hand from the quote the judge already recorded, then re-judge.

### 3. Search wider for not-stated claims (521)

`widen-sources.ts` only follows links one hop from cited pages, and it only ran on partly supported fields. For not-stated fields it needs two changes:

- run it on not-stated fields as well
- add a GOV.UK site search step (`https://www.gov.uk/api/search.json?q=…`) on the claim's distinctive terms, so pages the service never linked to are found too

The same guards apply: a quote must be found verbatim on the page it names, and a page about a different service can't support this one.

The output is each claim marked **found** (re-cite it) or **not found anywhere** (removal candidate).

### 4. Remove what was not found

Extend `propose-fixes.ts` with a removal mode that takes the not-found list and proposes:

- deleting list items
- cutting clauses from prose (with the cut shown as a diff)

Someone reviews the proposals before they are applied, ordered by severity:

- criteria and exclusions first, because a wrong one decides who qualifies
- then ways to apply
- then evidence
- then prose

Accepted items go through `apply-fixes.ts` as now, and each removal is logged.

### 5. Refine partly supported fields (565)

Work the existing worklist in its order: life event by risk, high before medium. Each life event goes through the same loop: `propose-fixes` → review → `apply-fixes` → re-judge.

Do the "Cite" items (284) first. A wider search will often confirm them with no change to the text, so run stage 3's search over them before drafting any rewrites.

The low-severity "elaboration" items (137) are context no page states. Under the rule above they are cut, not reworded.

### 6. Unsourced fields (329)

These have no verifier yet:

- **`agentSteps` (220).** These are instructions to an agent ("check eligibility", "find the nearest office"). They aren't claims about the world, so most can't be sourced. Mark the step that only restates the service's own actions as `inferred`, with the rationale "derived from methods and onlineFormUrl". Any step that adds a fact (a form name, a document, a time) is either judged like prose or cut.
- **`nations` (66).** Judge it against the page in the same way `verify-criteria` judges geography. A wrong `nations` value was what offered 16 England-only services UK-wide.
- **`deptKey` (32).** Confirm from the Content API's organisation field, as tier 1 does for the other 123.
- **`deadline` (11).** Run `verify:deadlines` over them.

### Re-measure

Run `npm run report:coverage -- --write` after each stage and each life event, and record the snapshot in the commit.

## Guards

These carry over from the work so far and apply to every stage:

- **The model that drafts a change doesn't confirm it.** An applied fix stays `unverified` until it is judged again in an independent run (stage 1).
- **A quote must be found on the page or the claim isn't supported.** No exceptions, and no "close enough".
- **Every write to `data/provenance.json` runs on its own.** The verify scripts rewrite the whole file, so never run two at once.
- **Removal is logged.** A cut claim can come back if a source for it is found.
- **Watch the count as well as the share.** If a life event's confirmed count drops, check that true claims weren't removed just because they were hard to find.

## Decisions

**Settled (21 October 2026): `authRequired` is optional, and absent means not stated.** `scripts/remove-claims.ts --field agentInteraction.authRequired --write` deleted the 173 values no page stated: 136 `'none'` and 37 named sign-ins, mostly Government Gateway, where the page says "sign in" but doesn't name the account. All 173 are in `data/removed-claims.json`. A page that names a sign-in the graph lacks still shows up as a gap in `verify-prose`'s `authGaps`.

**Settled (21 October 2026): sources outside GOV.UK count.** Local council sites, the NHS, Citizens Advice, Shelter and similar pages can confirm a claim. The guards don't change: the quote must be on the page, and the page must be about this service or state a rule that plainly applies to it.

**Settled (21 October 2026): State Pension age is worked out from date of birth.** A new `state_pension_age` rule replaces the 11 rules that stored 66.
- It computes the date someone reaches State Pension age from the GOV.UK timetable (`statePensionDate` in `src/rules.ts`). It is checked against the three worked examples the timetable prints.
- `UserContext` gains `date_of_birth`. With only an age, the rule settles under 66 (not reached) and 68 or over (reached), and asks for the date of birth in between.
- `verify-rules` now confirms that each service's page names State Pension age as the condition.
- A `born` rule handles fixed cut-offs, for example Winter Fuel Payment's "born on or before 27 June 1960".

Still open:

1. **Should `agentSteps` be `inferred` by default?** The alternative is judging every step as prose. That costs more and would remove most of them.

## Judging without API credit

The judge passes don't need the API. `widen-sources.ts --export <dir>` writes each service's prompt, with the response schema in place of the tool call. Any model that can read and write files can answer them; for stage 1 that was four Claude Code subagents working in parallel, each judging only from the text in its prompt files. `--import <dir> --write` then sends the answers through the same `recordField` the API path uses, so a quote that isn't on its page is thrown out exactly as before.

The subagents never drafted the fixes they judged, so this counts as the independent re-judgement the guards require.

## Stage 1 results (21 October 2026)

**Done:**

- **The 56 applied fixes and 3 discarded prose judgements were re-judged.** 52 are now confirmed, 5 partly supported, 1 not stated and 1 contradicted. No quote was rejected as fabricated.
  - The contradiction is `nhs-gp-register#eligibility.summary`. It says practices must accept local patients, but the page says a practice may refuse if it isn't taking new patients. It goes to stage 2.
- **Five links were checked in a browser** and recorded with `verify-links.ts --confirm <key> --note "<what the page showed>"`: baby loss certificate, passport, prescription prepayment certificate, Land Registry data and eVisa. `verify-links` now keeps a manual record while the URL is unchanged, unless the link has gone dead.
- **Three rule values were confirmed** by adding the guide subpage that states them to `eligibility.sources`: death registration within 5 days, Adult Disability Payment from 16, and the Discretionary Assistance Fund over 16.

**Left over (37 fields): every one needs a decision on the data, not another check.**

- **Links (3):** Find a Will was down for maintenance, MOT history rendered blank, and Search property information sits behind a Cloudflare bot check. Try them again later.
- **Rule values (24):**
  - 11 are State Pension age (see decision 3).
  - These are wrong against their page:
    - `hmrc-iht400`: the rule says file within 6 months. GOV.UK says full details are due within 12 months; 6 months is when the tax must be *paid*.
    - `dwp-sure-start-grant`: the rule says "baby under 1". The page says claim within 6 months of the birth.
    - `sss-child-winter-heating`: the rule says under 16. The page says under 19.
    - `ho-brp`: the rule says collect within 10 days. BRPs have been replaced by eVisas.
  - These are approximations the page doesn't state:
    - `dvla-provisional-licence`: the rule says 16; the page says 15 years and 9 months.
    - `dwp-winter-fuel`: the rule is an age; the page gives a birth date.
    - `slc-student-finance`: the rule says at least 18; the page gives no lower age limit.
    - `la-council-tax-reduction` and `ni-rate-rebate`: a £250 "low income" line that no page gives.
    - `hmrc-mtd`: £50,000, cited to a collection page.
  - The NHS prescription ages are on a checker start page that has no text to match.
  - `dvsa-theory-test`: 17 is on the page ("start learning to drive when they're 17"), but the matcher needs an age word next to the number.
- **Deadlines (7):** real disagreements, unchanged. See the previous list in git history (`ho-brp`, `la-proxy-vote` 6 vs 11 working days, `hmcts-money-claims`, `hmrc-register-sole-trader`, `hmrc-spp`, `hmrc-starter-checklist`, `ho-skilled-worker-dependent-visa`).
- **Rates and contacts (3):**
  - `dwp-state-pension` basic rate £184.90 is on `/state-pension/what-youll-get`, not on the new State Pension page the rates cite.
  - The railcard saving is stored as 33; the page says 1/3.
  - The NI Discretionary Support phone number isn't on its page.

## Stage 2 results (21 October 2026)

All 32 contradicted fields were corrected from the quotes the judge recorded. Four subagents then re-judged them: 23 are confirmed, 7 partly supported and 0 contradicted.

**Sign-ins (27).** In most cases the page names an account the `AuthMethod` type had no value for, so the type gains three:

| Value | Services | Example from the page |
|---|---|---|
| `universal-credit-account` | 6 | "Sign in to your Universal Credit account" |
| `ukvi-account` | 6 | "You need a UK Visas and Immigration (UKVI) account" |
| `service-account` | 13 | An account that belongs to one service: GRO, the childcare account, LPA, rate rebate, bankruptcy and others |

Two values were deleted and logged instead: `dvla-check-driving-licence` and `ho-life-in-uk`. Their pages mention an account but don't say you need one to apply.

The 7 partly supported are sign-ins that apply only on some routes:
- the three visas and `dwp-pip` name an account only for the ID Check app or for applicants who have already registered
- `dwp-mandatory-reconsideration`, `dwp-smi` and `dwp-benefit-debt-repayment` name the UC account only for UC claimants

The field says "applying online needs X". These go to stage 5, which needs to decide how to express a conditional sign-in.

**Ways to apply (2).** Cold Weather Payment and Carer's Allowance Supplement are paid automatically, so `methods` is now empty. The judge text for an empty list reads "You do not need to apply; it happens automatically."

**Prose (3).**
- `ho-brp` desc and summary now say BRPs have expired and been replaced by eVisas.
- `nhs-gp-register` summary now says a surgery may refuse, rather than that it must accept.

**A bug fixed along the way.** `apply-fixes.ts --record` rewrote the record of every fix ever applied, which reset 45 fields stage 1 had just confirmed. They were restored from the previous commit, and `--record` now writes each fix's record only once.

**`ho-brp` retired.** Apart from its desc and summary, the node still described collecting a BRP within 10 days, and the page says "All BRPs have now expired and have been replaced by eVisas."
- Its six other edges now point to or from `ho-evisa`. The `ho-brp` → `ho-evisa` edge was dropped.
- Its 12 provenance records went with it.
- The node's full source and edges are in `data/removed-claims.json`.
- The Arriving in the UK journey goes from 30 services to 29.
- This also clears two stage 1 leftovers, the `ho-brp` deadline and the 10-day rule. 35 remain.

## Rule and deadline fixes (21 October 2026)

These were wrong against their page, so they decided eligibility wrongly:

| Service | Was | Now | Source |
|---|---|---|---|
| `sss-child-winter-heating` | under 16 | under 19 | mygov.scot: "under 19 years old" |
| `hmrc-iht400` | file within 6 months | send full details within 12 months | "within 12 months of the person dying" |
| 11 services | age 66 | State Pension age from date of birth | GOV.UK State Pension age timetable |
| `dwp-winter-fuel` | age 66 or over | born on or before 27 June 1960 | the service page |

These rules were removed and logged because no page states them:
- `dwp-sure-start-grant` "baby under 1". The 6-month deadline rule already covers it.
- `slc-student-finance` "at least 18". The page says only that there is no upper age limit.
- The £250-a-week "low income" lines in `la-council-tax-reduction` and `ni-rate-rebate`. These told anyone earning more than £250 a week that they didn't qualify.

New sources, added to `eligibility.sources`, confirm `hmrc-mtd`'s £50,000 and the NHS prescription ages (60 and under 16).

**Deadlines:**
- `hmrc-register-sole-trader`: changed to "5 October", from the Self Assessment registration page.
- `hmrc-spp`: 52 weeks was right. "It must end within 52 weeks of the baby's birth" is on the page; the judge had picked a different sentence.
- Removed and logged:
  - `hmcts-money-claims`: 6 years
  - `hmrc-starter-checklist`: before first payday
  - `ho-skilled-worker-dependent-visa`: before travelling
  - `la-proxy-vote`: 6 working days. The page's "11 working days" covers stopping or switching a proxy, not applying, so it is not a replacement. A first correction to 11 was caught and undone on rereading the page around the quote. A quote can match exactly and still be about something else.

**Left from stage 1 (8):**
- Rule values:
  - `dvla-provisional-licence`: the page says 15 years 9 months, but ages are whole numbers in `UserContext`.
  - `dvsa-theory-test`: 17 is on the page, but the matcher needs an age word next to it.
- Rates and phone numbers: the State Pension basic rate's page, railcard "1/3", the NI Discretionary Support phone number.
- Three links that refuse automated checks.

## Progress

| Date | Change | Confirmed | Share |
|---|---|---|---|
| 21 Oct 2026 | Baseline | 1,665 of 3,216 | 51.8% |
| 21 Oct 2026 | Deleted 173 unstated `authRequired` values | 1,665 of 3,043 | 54.7% |
| 21 Oct 2026 | Stage 1: re-judged applied fixes, browser-checked links, rule subpages | 1,725 of 3,043 | 56.7% |
| 21 Oct 2026 | Stage 2: corrected all 32 contradicted fields | 1,748 of 3,041 | 57.5% |
| 21 Oct 2026 | Retired `ho-brp` (5 confirmed and 8 unconfirmed fields went with it) | 1,743 of 3,028 | 57.6% |
| 21 Oct 2026 | Rule and deadline fixes, State Pension age from date of birth | 1,762 of 3,020 | 58.3% |
