# Stage 5 brief: refine partly supported fields

Instructions for the agent running stage 5 of [verification-procedure.md](verification-procedure.md). Read that document, CLAUDE.md, `data/stage3-progress/README.md` and `data/stage4-applied/README.md` before starting.

## Goal

A partly supported field is one where a page states some of the claim but not all of it. Each one gets reworded to say only what its sources say. There are 708 such fields: 568 in `data/review-queue-prose.json` and 142 criteria in `data/review-queue-criteria.json`.

Unlike stage 4, the confirmed **count** should rise. Report the count and the share after every wave with `npm run report:coverage -- --write`. The baseline is 1,859 of 2,987 (62.2%).

## Setup

- Branch from the latest `main`, for example `stage5-refine`. Commit in waves on that branch.
- Open a pull request at a checkpoint. **Never merge.** The user merges.
- Follow the authorship rule in CLAUDE.md.
- There is no Anthropic API credit:
  - `triage-partly.ts`, `propose-fixes.ts` and the API paths of `widen-sources.ts` will fail.
  - For judging, use `widen-sources.ts --export <dir>`, answer the prompts in a separate session, then run `--import <dir> --write`.
  - Drafting can be done directly, but under the same guards as `propose-fixes.ts` (step 3).

## Step 0: clear what earlier stages left

1. **Rule values with no source.** Restructuring in stage 3 left these unsourced:
   - Child Winter Heating "under 19" (`sss-child-winter-heating` rules)
   - Best Start "under 18" (`sss-best-start-grant` and `sss-best-start-foods` rules)

   Find the page that states each value and add it to `eligibility.sources`. Then run `npx tsx scripts/verify-rules.ts --write`, but only once `https://www.nhsbsa.nhs.uk/help-nhs-prescription-costs/free-nhs-prescriptions` loads. If that site is down, the NHS prescription ages lose their confirmation.
2. **Four fields whose provenance says "awaiting independent re-verification":**
   - `dwp-uc-health#eligibility.evidenceRequired.1`
   - `other-warm-home-discount#eligibility.autoQualifiers.0`
   - `hmcts-employment-tribunal#deadline`
   - `other-warm-home-discount#deadline`

   Re-judge the first two with `widen-sources --fields … --export` and `--import`. `widen-sources` doesn't handle `deadline`. For the two deadlines, confirm them as a literal match if the exact wording is on the page, as stage 1 did for `hmrc-spp`. Otherwise leave them unverified and tell the user.

## Step 1: rebuild the worklist

`docs/review-worklist.md` and `data/worklist-partly.json` date from 29 September. They miss everything stages 1 to 4 found, and many of their indices have shifted. Build a new `data/stage5/worklist.json` from the current state.

**Which fields:** every field whose provenance is unverified with a "partly supported" note, or with some claims supported. `report-coverage.ts`'s `partly-supported` bucket is the definition.

**For each field, record:**
- the current text
- every problem note from the review queues
- the quotes already found, including those from stage 3's found pages, saved in `data/stage3-audit/` and `data/stage3-progress/`
- the service's life events

**Classify each field** the way `scripts/triage-partly.ts` does. That script's header defines the categories:
- **high:** a person acting on it would likely reach a wrong outcome (eligibility, amount, fee, deadline, or how to apply)
- **medium:** wrong for some groups, or imprecise in a way that matters
- **low:** elaboration no page states
- **"Cite":** probably true, and stated on a page not yet cited

Keep the classification prompts and answers in `data/stage5/`.

**Order the work:**
- High before medium before low.
- By field type: criteria, exclusions, autoQualifiers, ways to apply, evidence, then summary and desc.
- Group by the highest-risk life event each service appears in, as `triage-partly.ts` did.

Write a short `docs/stage5-worklist.md` with the counts, so the user can see the shape of the work before it starts.

## Step 2: "Cite" items first

These are probably true and stated somewhere. Run the stage 3 pipeline on them:
- finder sessions nominate pages
- `widen-sources --candidates` fetches the pages
- separate judge sessions decide
- `--import` keeps only verbatim quotes

Many will be confirmed with no rewording at all. Whatever is still partly supported after the search goes on to step 3.

## Step 3: reword, in waves by life event

For each field, draft the **smallest change** that makes it say only what the sources support:

- **Every claim in the new text must have a quote found word for word on a page.** Check this mechanically, as `propose-fixes.ts` does, and reject any draft with a quote not found.
- Use the page's own words and qualifiers ("usually", "may", "in most cases"). Don't add facts the old text didn't have, unless a quote supports them and they fix a problem the note names.
- **Low "elaboration" items are cut, not reworded.** No page states them.
  - Cut a list item with `scripts/apply-removals.ts`, which keeps the verdicts of later list items when indices shift.
  - Cut a clause from prose and log the cut text to `data/removed-claims.json`.
- **If a quote contradicts the field,** correct it as stage 2 did.
- **Look for copies.** Search the same node for the old wording: key questions, ruleIn and ruleOut, agentSteps, `eligibility.rules`, contact notes and other prose. Then run `npm run check:consistency`. A figure in prose is a copy that goes stale.
- **If a rewrite changes who qualifies,** update `eligibility.rules` to match and run `verify-rules.ts --write` (with the NHSBSA condition from step 0).

**Write each wave's drafts** to `data/fix-proposals.json` with the existing shape:
- `event: "stage5-<wave>"`
- one claim and quote per sentence, each with `found` checked

**Before applying anything, give the user a review page** for the wave, made like `docs/stage3-pilot-review.md`. For each field, show the old text, the new text, and the quotes with links. Apply only what the user approves.

Then:
1. Run `npx tsx scripts/apply-fixes.ts`, then `npx tsx scripts/apply-fixes.ts --record`. `--record` now writes each fix only once.
2. The new text must be **re-judged independently**: `widen-sources.ts --fields <keys> --split-all --export <dir>`, answered in a session that did not draft it, then `--import <dir> --write`. Only that import can confirm a field.

## Decisions to bring to the user, not make alone

- **Conditional sign-ins.** Seven sign-ins apply on some routes only:
  - UKVI account for the ID Check app route (`ho-skilled-worker-visa`, `ho-skilled-worker-dependent-visa`, `ho-student-visa`)
  - an account only for applicants who have already registered (`dwp-pip`)
  - UC account only for UC claimants (`dwp-mandatory-reconsideration`, `dwp-smi`, `dwp-benefit-debt-repayment`)

  The `authRequired` field can't say "only if". Propose options; don't change the schema.
- **Any schema change at all,** including new enum values or new fields. Stage 3's `via-adviser` was reasonable but should have been asked.
- **Any rewrite that narrows who qualifies for a benefit or grant** in a way the user might not expect. List these on the review page.

## Known gaps to fill along the way

- `gro-register-death` now has no evidence items. GOV.UK says what information you need to give about the person who died. Add the items it states, with quotes.
- **PDF and Word sources can't be read** by `pageText`. Where a field's only good source is a PDF, record that in the wave's notes and leave the field as it is. Don't paraphrase from a PDF you could not quote.

## Bookkeeping, every wave

- **Save the record.** Keep the selection, finder notes, prompts, answers and review page in `data/stage5/<wave>/`, with a `sha256sums.txt`. Don't edit saved prompts or answers after committing.
- **Run the checks** before each commit: `npm run check:types`, `npm run check:provenance`, `npm run build`, `npm run report:coverage -- --write`.
- **Update the docs.** Add a row to the progress table in `docs/verification-procedure.md` and note what the wave changed.
- **Check provenance.** Never write a `confirmed` provenance record by hand. Confirmations come only from an import or a mechanical literal check (`verify-rules`, `verify-tier2`). A hand-made record must be `unverified` with a rationale saying it awaits re-check.
- **Report to the user.** At the end of each wave, give the confirmed count and share, how many fields were reworded, cut and confirmed, and anything that needs a decision.
