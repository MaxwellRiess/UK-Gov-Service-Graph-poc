# Stage 5 setup: changes for approval

The branch starts at `origin/main` commit `134d04d`. Current coverage is **1,859 of 2,987 checkable fields (62.2%)**. This page proposes two source additions and two provenance rechecks. Nothing below has been applied.

## Add the Best Start age source

Add [Who should apply](https://www.mygov.scot/best-start-grant-best-start-foods/best-start-apply) to `eligibility.sources` for both Best Start Grant and Best Start Foods. The page states: "If you're under 18, you do not need to be on any payments or benefits to get Best Start Grant or Best Start Foods." That supports the `age < 18` exception in each service's rules.

The [Child Winter Heating eligibility page](https://www.mygov.scot/child-winter-heating-payment/who-can-get-child-winter-heating-payment) says children and young people can qualify if they are "under 19 years old". That page is already in `eligibility.sources`, so no source addition is needed for its two age rules.

**Hold the rule verifier.** The [NHSBSA free-prescriptions page](https://www.nhsbsa.nhs.uk/help-nhs-prescription-costs/free-nhs-prescriptions) returned HTTP 503 on 22 October. The brief says to run `verify-rules.ts --write` only once it loads, because a failed fetch can remove confirmation from the prescription-age rules. The four Scottish age-rule values will remain unsourced until then.

## Import two independent rechecks

`widen-sources.ts --export` fetched the pages and wrote the prompts in [`judge/`](judge/). A dry-run import accepted both answers: two confirmed, zero missing or fabricated quotes. Import them into provenance only after approval.

| Field | Current graph text | Exact source quote | Result |
|---|---|---|---|
| `dwp-uc-health#eligibility.evidenceRequired.1` | WCA50 capability for work questionnaire, if requested | [UC health guidance](https://www.gov.uk/health-conditions-disability-universal-credit/report-health-condition-disability): "Before your assessment, you’ll need to complete a ‘Capability for Work’ (WCA50) health questionnaire." [WCA50 form page](https://www.gov.uk/government/publications/wca50-form-capability-for-work-questionnaire): "Only fill in this capability for work questionnaire if you're asked to do so, this is not a claim form." | Supported |
| `other-warm-home-discount#eligibility.autoQualifiers.0` | Receiving Pension Credit: the discount is usually applied automatically | [Warm Home Discount guide](https://www.gov.uk/the-warm-home-discount-scheme): "You’ll get the discount automatically if you or your partner: get Pension Credit" | Supported |

The full source text, prompts, and answers are in [`judge/prepared.json`](judge/prepared.json), [the UC response](judge/dwp-uc-health.response.json), and [the Warm Home Discount response](judge/other-warm-home-discount.response.json).

## Leave two deadlines unverified

The current Employment Tribunal deadline combines the six-month rule, the earlier three-month rule, and the starting point for unfair dismissal. [GOV.UK states these in separate passages](https://www.gov.uk/employment-tribunals). The full graph value is not a literal page match.

The Warm Home Discount deadline combines the [no-letter contact date](https://www.gov.uk/the-warm-home-discount-scheme/get-help) and the [letter asking for more information](https://www.gov.uk/the-warm-home-discount-scheme/if-you-live-in-england-and-wales). Again, no single passage matches the full graph value literally. Step 0 says to leave both unverified when a literal check cannot confirm them.

## Approval scope

Approve the setup wave to add the Best Start source to two services and import the two saved rechecks. The rule verifier and the two deadlines will remain on hold. After the setup wave, I will rebuild the Stage 5 worklist from the new provenance state.
