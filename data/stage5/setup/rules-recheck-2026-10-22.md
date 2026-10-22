# Deferred rule verification

On 22 October 2026, the NHSBSA [free prescriptions page](https://www.nhsbsa.nhs.uk/help-nhs-prescription-costs/free-nhs-prescriptions) loaded through `pageText`. The deferred `npx tsx scripts/verify-rules.ts --write` then checked 96 rule values: 93 confirmed, two not found, one unreachable. It added four confirmations:

- `sss-best-start-foods#eligibility.rules.2.rules.2.value`
- `sss-best-start-grant#eligibility.rules.2.rules.3.value`
- `sss-child-winter-heating#eligibility.rules.1.rules.0.value`
- `sss-child-winter-heating#eligibility.rules.1.rules.1.value`

The NHS prescription age confirmations remained in place. The unreachable Healthy Start page did not change its existing confirmation. The two unmatched ages for provisional licences and theory tests were already unverified.

The verifier flagged `wg-discretionary-assistance#eligibility.rules.1.value`: the rule says age **at least 16**, while the page says **over 16**. This requires a separately approved rule change; no rule value was changed here.
