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

Still open:

1. **Should `agentSteps` be `inferred` by default?** The alternative is judging every step as prose. That costs more and would remove most of them.
2. **When does the procedure accept a non-GOV.UK source?** NHS, mygov.scot, nidirect, Acas and Motability pages are already cited. Charity and advice sites (Citizens Advice, Shelter) are not, and the procedure as written doesn't allow them.
3. **How should State Pension age be modelled?** Eleven rules store "State Pension age (66)". None of the service pages state 66; they say "State Pension age" and link to the calculator, which states no number either. The age is now rising from 66 to 67 for people born after 5 April 1960, so a fixed `66` is going wrong for them as well as being unsourced. A rule that tests State Pension age itself, from date of birth, would fix both.

## Stage 1 findings (21 October 2026)

- **Re-judging the 57 applied fixes is blocked.** The Anthropic API account behind `ANTHROPIC_API_KEY` is out of credit, so all 27 calls failed and nothing was written. Re-run it once credit is added:
  `npx tsx scripts/widen-sources.ts --fields <the 56 keys> --split-all --write`
  The 57th, `hmcts-employment-tribunal#deadline`, goes through `verify:deadlines`.
- **Re-running the 3 discarded prose judgements** is blocked for the same reason.
- **Blocked links (8), checked in a browser:**
  - Load correctly: baby loss certificate, passport, prescription prepayment certificate, Land Registry data (redirects to the service home page), eVisa.
  - Find a Will was down for maintenance.
  - MOT history rendered a blank page.
  - Search property information sits behind a Cloudflare bot check.

  None is recorded yet. `verify-links --write` overwrites every link record, so a manual confirmation would be lost on its next run. It needs to keep a `manual` record while the value hash still matches.
- **Rule values that failed literal matching (27):**
  - 11 are State Pension age (decision 3 above).
  - Some are approximations the page contradicts:
    - provisional licence: rule says 16, page says 15 years and 9 months
    - Winter Fuel Payment: rule says age 66, page says born on or before 27 June 1960
    - railcard: rule says 33%, page says 1/3
  - The rest state their number on a guide subpage that isn't in `eligibility.sources` yet: death registration days, the IHT400 deadline, NHS prescription ages, mygov.scot and gov.wales ages. Add those subpages, then re-run `verify:rules`.
- **Deadlines (7):** these are real disagreements between the graph and the page.
  - `ho-brp` "10 days" has been out of date since BRPs were replaced by eVisas.
  - `la-proxy-vote` says 6 working days; the page says 11.
  - The others need someone to read them.

## Progress

| Date | Change | Confirmed | Share |
|---|---|---|---|
| 21 Oct 2026 | Baseline | 1,665 of 3,216 | 51.8% |
| 21 Oct 2026 | Deleted 173 unstated `authRequired` values | 1,665 of 3,043 | 54.7% |
