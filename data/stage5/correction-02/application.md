# Correction wave 2 application

The user approved all 14 primary corrections and their same-node copies. The 14 primary proposals and 35 copy proposals in `data/fix-proposals.json` were applied on 23 October 2026. `apply-fixes.ts --record` wrote 49 unverified provenance records and removed one orphaned State Pension age record after the Pension Credit rule moved into an `any` rule. Judge sessions `judge_correction_a`, `judge_correction_b` and `judge_correction_c` read only saved prompts and sources, not the drafter's work. Their responses are in `judge/`; follow-up judgments for four later label edits are in `judge-extra/`.

## Supplement checks

`fetch-supplements.mjs` used the project `pageText` fetcher and `normaliseForMatch` on current official pages. The fetched text, page hashes and each quote result are in `fetched-pages.json`. All nine checked spans were found; no claim had to be dropped for an absent quote. The ONS and MCCD pages were fetched to complete the original supplement check, but are not cited for the death-registration deadline. That deadline cites GOV.UK's [register-the-death page](https://www.gov.uk/after-a-death/register-the-death). The England and Wales scope uses an [official register-office page](https://www.bradford.gov.uk/births-deaths-marriages-and-civil-partnerships/deaths/register-a-death/).

## Structured changes

- Pension Credit: the age gate is `any(State Pension age reached, receiving dwp-housing-benefit)` with a label identifying Housing Benefit for people over State Pension age.
- Bus pass: `nations: ['england']` matches the England older-person State Pension age rule. Wales, Scotland and Northern Ireland age-60 routes remain a follow-up.
- Death registration: `nations: ['england', 'wales']`; the five-day deadline uses `death_registration_confirmation_date`, with GOV.UK's confirmation wording in the label and display deadline. The MCP tool example names the new trigger.
- Making Tax Digital: the income comparison is `> 50000`. Landlords and exemptions are represented in prose but were left out of the rule as requested. Rule labels describe the implemented self-employed route.

`verify-rules.ts --write` was run after confirming the NHSBSA page was reachable, and again after the final rule labels changed. The final report is `verify-rules-final.txt`. It matched 94 of 96 rule values; the two unmatched ages belong to DVLA provisional licences and the DVSA theory test. No page was unreachable. The changed Pension Credit State Pension age value, MTD £50,000 value and death-registration five-day value all matched their cited pages. The verifier checks numeric presence, so the MTD `>` operator was also checked directly against the page's "over £50,000" wording.

The current Pension Credit dependency records receipt of `dwp-housing-benefit` but cannot distinguish the pension-age form of that benefit. Its joint-income threshold is also still represented by a single £238 rule. Those limits predate this wave and were not changed by the approved rule decision.

## Independent judgment

The first import accepted 53 of 54 prepared fields. The death-registration trigger label changed after export, so the importer rejected the old prompt for that field. The second import checked the current trigger label and three Making Tax Digital rule labels. Those imports found 49 confirmed, 7 partly supported, and 1 contradicted current text fields. The raw responses, source text, and prepared field values remain in `judge/` and `judge-extra/`.

The bus-pass criterion was rechecked against the separate disabled-pass page in `judge-recheck-bus/`. That page supports the second claim, and the recheck confirmed the criterion. The final outcome is 50 confirmed, 6 partly supported, and 1 contradicted. The partly supported fields are Pension Credit's `autoQualifiers.0`, `ruleIn.0` and outer rule label, the street-collection description, and two Making Tax Digital rule labels. The tax tribunal's `agentSteps.1` is contradicted because its wording suggests an HMRC review may be needed before appeal, while the page presents review as optional. No unapproved text change was made in response to these judgments.

All 14 primary correction fields are confirmed. The six partial verdicts and the contradiction concern same-node copies or rule labels. The coverage report excludes `agentSteps`, so its contradicted count of zero does not include the tribunal step.

The bus-pass node now covers England. Wales, Scotland and Northern Ireland passes need separate follow-up work. The new death-registration trigger requires callers to supply `death_registration_confirmation_date`; a `death_date` value alone no longer satisfies the five-day deadline rule.

Both new `nations` arrays were judged separately in `judge-nations/`. The first bus-pass judgment treated `england` as a claim that no other nation offers a bus pass and marked it contradicted. A second judge used the same saved page text with the node's State Pension age rule stated in the prompt. That scope recheck, saved in `judge-nations-scope/`, confirmed `england` for this node. The death-registration `england, wales` value was confirmed on its first judgment. Both verdicts for the bus pass remain in the record. Including these two fields, the final independent outcome is 52 confirmed, 6 partly supported, and 1 contradicted.
