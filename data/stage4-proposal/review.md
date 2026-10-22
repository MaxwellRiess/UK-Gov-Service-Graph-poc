# Stage 4 removal proposal — approval required

No graph claim, provenance record or removal log has been changed by this proposal. Approve the specific proposal IDs before any deletion is applied.

Current confirmed coverage remains **1,857 of 3,014 checkable fields (61.6%)**. The current not-stated bucket has 107 fields: 54 reached a Stage 3 judge prompt, 49 never reached one, and 4 were outside the Stage 3 selection.

The 54 judged fields split into 22 proposed list-item deletions, 8 method decisions, 9 PDF/Word-only exclusions and 15 fields with fewer than two distinct finder searches.

Each field lists the cited pages, pages supplied to its judge, and finder nominations. A nomination marked unreadable was not available as readable judge-prompt text. Page reads and guided navigation are shown separately from the finder searches counted toward the two-search minimum.

For an approved list deletion, retain the verdicts of later list items when their indices shift. Search the node for copied facts in key questions, display rules, agent steps and executable rules; run the consistency check. No prose cuts are proposed in this selection. An empty methods array means automatic service delivery and must never stand for an unknown method.

## Proposed deletions at a glance

| ID | Field | Claim |
|---|---|---|
| P001 | `dvla-provisional-licence#eligibility.evidenceRequired.1` | Address details |
| P002 | `dvla-sorn#eligibility.evidenceRequired.0` | Vehicle registration number |
| P003 | `dwp-attendance-allowance#eligibility.evidenceRequired.2` | Carer details if applicable |
| P004 | `dwp-carers-allowance#eligibility.evidenceRequired.0` | Evidence of caring role |
| P005 | `dwp-funeral-payment#eligibility.evidenceRequired.2` | Death certificate |
| P006 | `dwp-pension-credit#eligibility.evidenceRequired.0` | Bank statements |
| P007 | `dwp-state-pension#eligibility.evidenceRequired.0` | NI number |
| P008 | `gro-register-death#eligibility.evidenceRequired.0` | Medical Certificate of Cause of Death (MCCD) |
| P009 | `gro-register-death#eligibility.evidenceRequired.1` | Deceased's NHS number and personal details if available |
| P010 | `hmrc-aml-registration#eligibility.evidenceRequired.2` | Evidence of business type and activities |
| P011 | `hmrc-free-childcare-15#eligibility.evidenceRequired.0` | Child's date of birth, given to the childcare provider |
| P012 | `hmrc-lisa#eligibility.evidenceRequired.0` | LISA account details |
| P013 | `hmrc-sdlt#eligibility.evidenceRequired.0` | Completion statement |
| P014 | `ho-skilled-worker-dependent-visa#eligibility.evidenceRequired.0` | Main applicant's visa or BRP |
| P015 | `la-business-rates#eligibility.evidenceRequired.0` | Business address |
| P016 | `la-business-rates#eligibility.evidenceRequired.1` | Date of occupation |
| P017 | `la-council-tax-reduction#eligibility.evidenceRequired.1` | Council Tax bill |
| P018 | `sss-adult-disability-payment#eligibility.evidenceRequired.2` | GP or consultant details |
| P019 | `sss-best-start-grant#eligibility.evidenceRequired.1` | Proof of pregnancy or child's age |
| P020 | `sss-best-start-grant#eligibility.evidenceRequired.2` | Proof of Scottish residency |
| P021 | `sss-pension-winter-heating#eligibility.evidenceRequired.0` | Proof of age |
| P022 | `sss-pension-winter-heating#eligibility.evidenceRequired.1` | Proof of Scottish residency |

## Eligibility criteria and exclusions proposed for deletion (0)

None.

## Ways to apply requiring a decision (8)

### M001 — Care to Learn: `agentInteraction.methods`

**Claim:** You can apply or do this online.

**Action:** No current method was supported. Do not use an empty methods array to mean unknown.

**Judge note:** The text says to apply through your education provider but does not say you can apply online.

**Finder searches counted (3):**

- `Care to Learn apply online Learner Support Service guide 2025 to 2026`
- `GOV.UK search: Care to Learn`
- `GOV.UK search: Care to Learn guide learner support service`

**Pages recorded:**

- [www.gov.uk/care-to-learn](https://www.gov.uk/care-to-learn) — cited, in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/dfe-care-to-learn.prompt.txt), [response](judgements/wave1/dfe-care-to-learn.response.json)

### M002 — National Insurance credits: `agentInteraction.methods`

**Claim:** You can apply or do this online. You can apply or do this by phone.

**Action:** No current method was supported. Do not use an empty methods array to mean unknown.

**Judge note:** The text only says you can ask HMRC questions online; it does not say you can apply for credits online. The text mentions phoning the National Insurance helpline only for questions, not for applying for credits.

**Other methods named on the page:** post

**Finder searches counted (3):**

- `gov.uk apply National Insurance credits online specified adult childcare`
- `Carer's Credit apply by phone or post gov.uk National Insurance credits apply online`
- `HMRC online service apply for National Insurance credits sign in Government Gateway`

**Pages recorded:**

- [www.gov.uk/national-insurance-credits](https://www.gov.uk/national-insurance-credits) — cited, in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/dwp-ni-credits.prompt.txt), [response](judgements/wave1/dwp-ni-credits.response.json)

### M003 — Register the death: `agentInteraction.methods`

**Claim:** You can apply or do this in person.

**Action:** No current method was supported. Do not use an empty methods array to mean unknown.

**Judge note:** The GOV.UK pages refer to the register office but do not say you register in person; only the Scotland and Northern Ireland pages, which are other nations' versions, describe attending a registration office.

**Finder searches counted (2):**

- `register a death England documents you need medical certificate cause of death NHS number register office`
- `mygov.scot registering a death what you need medical certificate NHS number`

**Pages recorded:**

- [www.gov.uk/register-a-death](https://www.gov.uk/register-a-death) — cited, in judge prompt
- [www.gov.uk/after-a-death/register-the-death](https://www.gov.uk/after-a-death/register-the-death) — cited, in judge prompt
- [www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once](https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once) — linked in judge prompt
- [www.gov.uk/after-a-death/when-a-death-is-reported-to-a-coroner](https://www.gov.uk/after-a-death/when-a-death-is-reported-to-a-coroner) — linked in judge prompt
- [www.gov.uk/after-a-death/death-abroad](https://www.gov.uk/after-a-death/death-abroad) — linked in judge prompt
- [www.nidirect.gov.uk/articles/registering-death](https://www.nidirect.gov.uk/articles/registering-death) — found in judge prompt, finder nomination
- [www.mygov.scot/register-death](https://www.mygov.scot/register-death) — found in judge prompt, finder nomination
- [www.gov.uk/tell-us-once](https://www.gov.uk/tell-us-once) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/gro-register-death.prompt.txt), [response](judgements/wave1/gro-register-death.response.json)

### M004 — Free childcare — 15 hours (3 and 4-year-olds): `agentInteraction.methods`

**Claim:** You can apply or do this in person.

**Action:** No current method was supported. Do not use an empty methods array to mean unknown.

**Judge note:** The 15-hours page only says to contact your childcare provider or local council to find out more and does not say you can apply in person.

**Finder searches counted (3):**

- `gov.uk search: free childcare 3 4 year olds apply provider`
- `gov.uk search: early education and childcare statutory guidance`
- `gov.uk search: free early years provision model agreement`

**Pages recorded:**

- [www.gov.uk/help-with-childcare-costs/free-childcare-and-education-for-3-to-4-year-olds](https://www.gov.uk/help-with-childcare-costs/free-childcare-and-education-for-3-to-4-year-olds) — cited, in judge prompt
- [www.gov.uk/tax-free-childcare](https://www.gov.uk/tax-free-childcare) — linked in judge prompt
- [www.gov.uk/free-childcare-if-working/check-youre-eligible](https://www.gov.uk/free-childcare-if-working/check-youre-eligible) — linked in judge prompt
- [www.gov.uk/free-childcare-if-working](https://www.gov.uk/free-childcare-if-working) — linked in judge prompt
- [www.gov.uk/government/publications/free-early-years-provision-and-childcare-model-agreement/parental-declaration-form-guidance](https://www.gov.uk/government/publications/free-early-years-provision-and-childcare-model-agreement/parental-declaration-form-guidance) — found in judge prompt, finder nomination
- [assets.publishing.service.gov.uk/media/6979dc7b1c24881f40a4d6ec/Parental_declaration_form.docx](https://assets.publishing.service.gov.uk/media/6979dc7b1c24881f40a4d6ec/Parental_declaration_form.docx) — found in judge prompt, finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave1/hmrc-free-childcare-15.prompt.txt), [response](judgements/wave1/hmrc-free-childcare-15.response.json)

### M005 — Lifetime ISA withdrawal: `agentInteraction.methods`

**Claim:** You can apply or do this online.

**Action:** No current method was supported. Do not use an empty methods array to mean unknown.

**Judge note:** The text explains withdrawal rules and charges but never says a Lifetime ISA withdrawal can be requested online.

**Finder searches counted (2):**

- `gov.uk Lifetime ISA withdrawal ask your provider online account details first home`
- `site:gov.uk Lifetime ISA withdraw money account provider request withdrawal form conveyancer`

**Finder notes not counted as searches:**

- `fetched gov.uk/lifetime-isa/withdrawing-money-from-your-lifetime-isa`

**Pages recorded:**

- [www.gov.uk/lifetime-isa](https://www.gov.uk/lifetime-isa) — cited, in judge prompt
- [www.gov.uk/individual-savings-accounts/how-to-open-an-isa](https://www.gov.uk/individual-savings-accounts/how-to-open-an-isa) — linked in judge prompt
- [www.gov.uk/individual-savings-accounts/how-isas-work](https://www.gov.uk/individual-savings-accounts/how-isas-work) — linked in judge prompt
- [www.gov.uk/individual-savings-accounts/transferring-your-isa](https://www.gov.uk/individual-savings-accounts/transferring-your-isa) — linked in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/hmrc-lisa.prompt.txt), [response](judgements/wave2/hmrc-lisa.response.json)

### M006 — Council Tax Disability Reduction: `agentInteraction.methods`

**Claim:** You can apply or do this online. You can apply or do this by phone.

**Action:** No current method was supported. Do not use an empty methods array to mean unknown.

**Judge note:** The relevant Council Tax sources give no online application method for this reduction. The relevant Council Tax sources say to ask the council but give no phone application method.

**Finder searches counted (2):**

- `Council Tax disabled band reduction apply online phone citizensadvice gov.wales mygov.scot`
- `gov.wales council tax discounts disabled person how to apply`

**Pages recorded:**

- [www.gov.uk/council-tax/discounts-for-disabled-people](https://www.gov.uk/council-tax/discounts-for-disabled-people) — cited, in judge prompt
- [www.gov.uk/council-tax/who-has-to-pay](https://www.gov.uk/council-tax/who-has-to-pay) — linked in judge prompt
- [www.gov.uk/introduction-to-business-rates/working-at-home](https://www.gov.uk/introduction-to-business-rates/working-at-home) — linked in judge prompt
- [www.gov.uk/find-hmrc-contacts/valuation-office-enquiries](https://www.gov.uk/find-hmrc-contacts/valuation-office-enquiries) — linked in judge prompt
- [www.citizensadvice.org.uk/housing/council-tax/check-if-you-can-pay-less-council-tax/](https://www.citizensadvice.org.uk/housing/council-tax/check-if-you-can-pay-less-council-tax/) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/la-council-tax-disability-reduction.prompt.txt), [response](judgements/wave2/la-council-tax-disability-reduction.response.json)

### M007 — Council Tax single person discount: `agentInteraction.methods`

**Claim:** You can apply or do this online. You can apply or do this by phone.

**Action:** No current method was supported. Do not use an empty methods array to mean unknown.

**Judge note:** The text mentions paying Council Tax online but gives no online application method for this discount. The text gives no phone application method for this discount.

**Finder searches counted (3):**

- `citizensadvice check if you can pay less council tax single person discount`
- `gov.wales council tax discounts living alone how to apply`
- `mygov.scot council tax discounts exemptions single adult discount apply`

**Pages recorded:**

- [www.gov.uk/council-tax/who-has-to-pay](https://www.gov.uk/council-tax/who-has-to-pay) — cited, in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/la-council-tax-single-discount.prompt.txt), [response](judgements/wave2/la-council-tax-single-discount.response.json)

### M008 — Motability scheme: `agentInteraction.methods`

**Claim:** You can apply or do this by phone.

**Action:** No current method was supported. Do not use an empty methods array to mean unknown.

**Judge note:** The helpline is for finding a dealer; the text says the vehicle is ordered at a dealership, not by phone.

**Other methods named on the page:** in-person

**Finder searches counted (2):**

- `Motability scheme eligibility enhanced rate mobility PIP 12 months remaining award`
- `Motability Scheme how to join dealer call 0300 456 4566 apply by phone`

**Pages recorded:**

- [www.motability.co.uk/](https://www.motability.co.uk/) — cited, in judge prompt
- [www.citizensadvice.org.uk/benefits/sick-or-disabled-people-and-carers/help-for-disabled-travellers1/motability-scheme/getting-a-motability-car/](https://www.citizensadvice.org.uk/benefits/sick-or-disabled-people-and-carers/help-for-disabled-travellers1/motability-scheme/getting-a-motability-car/) — found in judge prompt, finder nomination
- [www.motability.co.uk/get-support/faqs/am-i-eligible](https://www.motability.co.uk/get-support/faqs/am-i-eligible) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave3/other-motability.prompt.txt), [response](judgements/wave3/other-motability.response.json)

## Evidence items proposed for deletion (22)

### P001 — Provisional Driving Licence: `eligibility.evidenceRequired.1`

**Claim:** Address details

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The GOV.UK page does not mention address details as something you need to apply, and the only source that discusses addresses is the Northern Ireland DVA form guidance, which covers a different nation's version of the service.

**Finder searches counted (3):**

- `apply first provisional driving licence online need addresses where you've lived last 3 years`
- `nidirect apply first provisional driving licence online what you need address`
- `INF1D guide to filling in driving licence application form address last 3 years gov.uk`

**Pages recorded:**

- [www.gov.uk/apply-first-provisional-driving-licence](https://www.gov.uk/apply-first-provisional-driving-licence) — cited, in judge prompt
- [www.nidirect.gov.uk/articles/driving-licence-application-dl1-guidance-notes](https://www.nidirect.gov.uk/articles/driving-licence-application-dl1-guidance-notes) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave1/dvla-provisional-licence.prompt.txt), [response](judgements/wave1/dvla-provisional-licence.response.json)

**Exact copies to inspect during application:**

- `agentInteraction.agentSteps.2`: Prepare document checklist (passport or birth certificate, address details)

### P002 — Make a SORN: `eligibility.evidenceRequired.0`

**Claim:** Vehicle registration number

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The SORN page lists the 11-digit V5C number or 16-digit tax reminder reference, not the registration number; only the linked check-vehicle-tax page (a different service) mentions the registration number.

**Finder searches counted (3):**

- `make a SORN online you'll need vehicle registration number 11-digit reference V5C DVLA`
- `GOV.UK search: SORN vehicle registration number reference`
- `GOV.UK search: V890 SORN form`

**Pages recorded:**

- [www.gov.uk/make-a-sorn](https://www.gov.uk/make-a-sorn) — cited, in judge prompt
- [www.gov.uk/check-vehicle-tax](https://www.gov.uk/check-vehicle-tax) — linked in judge prompt
- [www.gov.uk/government/news/vehicle-tax-changes](https://www.gov.uk/government/news/vehicle-tax-changes) — linked in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/dvla-sorn.prompt.txt), [response](judgements/wave1/dvla-sorn.response.json)

### P003 — Attendance Allowance: `eligibility.evidenceRequired.2`

**Claim:** Carer details if applicable

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The list of what you need to apply does not include carer details; the text only says you do not need a carer to claim.

**Finder searches counted (2):**

- `Citizens Advice Attendance Allowance claim form send medical evidence letters from GP specialist carer`
- `GOV.UK search: Attendance Allowance claim form`

**Pages recorded:**

- [www.gov.uk/attendance-allowance](https://www.gov.uk/attendance-allowance) — cited, in judge prompt
- [www.gov.uk/attendance-allowance/what-youll-get](https://www.gov.uk/attendance-allowance/what-youll-get) — cited, in judge prompt
- [www.gov.uk/mandatory-reconsideration](https://www.gov.uk/mandatory-reconsideration) — linked in judge prompt
- [www.gov.uk/carers-allowance](https://www.gov.uk/carers-allowance) — linked in judge prompt
- [www.gov.uk/constant-attendance-allowance](https://www.gov.uk/constant-attendance-allowance) — linked in judge prompt
- [www.citizensadvice.org.uk/benefits/sick-or-disabled-people-and-carers/attendance-allowance/claiming-attendance-allowance/how-to-claim-attendance-allowance/](https://www.citizensadvice.org.uk/benefits/sick-or-disabled-people-and-carers/attendance-allowance/claiming-attendance-allowance/how-to-claim-attendance-allowance/) — found in judge prompt
- [www.citizensadvice.org.uk/benefits/sick-or-disabled-people-and-carers/attendance-allowance/claiming-attendance-allowance/claiming-attendance-allowance-terminally-ill/](https://www.citizensadvice.org.uk/benefits/sick-or-disabled-people-and-carers/attendance-allowance/claiming-attendance-allowance/claiming-attendance-allowance-terminally-ill/) — found in judge prompt
- [www.citizensadvice.org.uk/benefits/sick-or-disabled-people-and-carers/attendance-allowance/claiming-attendance-allowance/help-with-attendance-allowance-form/](https://www.citizensadvice.org.uk/benefits/sick-or-disabled-people-and-carers/attendance-allowance/claiming-attendance-allowance/help-with-attendance-allowance-form/) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave1/dwp-attendance-allowance.prompt.txt), [response](judgements/wave1/dwp-attendance-allowance.response.json)

### P004 — Carer's Allowance: `eligibility.evidenceRequired.0`

**Claim:** Evidence of caring role

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The page says you must care for at least 35 hours a week, but its list of what to have before you apply does not ask for any evidence of the caring role.

**Finder searches counted (2):**

- `Carer's Allowance evidence of caring proof`
- `Carer's Allowance claim form notes documents to send (DS700 notes read)`

**Finder notes not counted as searches:**

- `gov.uk/carers-allowance/how-to-claim (read)`

**Pages recorded:**

- [www.gov.uk/carers-allowance](https://www.gov.uk/carers-allowance) — cited, in judge prompt
- [www.gov.uk/carers-allowance/what-youll-get](https://www.gov.uk/carers-allowance/what-youll-get) — cited, in judge prompt
- [www.gov.uk/universal-credit](https://www.gov.uk/universal-credit) — linked in judge prompt
- [www.gov.uk/universal-credit/what-youll-get](https://www.gov.uk/universal-credit/what-youll-get) — linked in judge prompt
- [www.gov.uk/universal-credit/contact-universal-credit](https://www.gov.uk/universal-credit/contact-universal-credit) — linked in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/dwp-carers-allowance.prompt.txt), [response](judgements/wave1/dwp-carers-allowance.response.json)

### P005 — Funeral Expenses Payment: `eligibility.evidenceRequired.2`

**Claim:** Death certificate

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** Death certificates are mentioned only as a cost the payment can help with, not as evidence needed to claim.

**Finder searches counted (2):**

- `Funeral Expenses Payment claim what you need death certificate proof of benefits SF200`
- `nidirect funeral expenses payment how to claim death certificate`

**Pages recorded:**

- [www.gov.uk/funeral-payments](https://www.gov.uk/funeral-payments) — cited, in judge prompt
- [www.gov.uk/funeral-payments/what-youll-get](https://www.gov.uk/funeral-payments/what-youll-get) — cited, in judge prompt
- [www.gov.uk/after-a-death](https://www.gov.uk/after-a-death) — linked in judge prompt
- [assets.publishing.service.gov.uk/media/69733a0895ec95e3414fd4e4/sf200-adult.pdf](https://assets.publishing.service.gov.uk/media/69733a0895ec95e3414fd4e4/sf200-adult.pdf) — found in judge prompt; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave1/dwp-funeral-payment.prompt.txt), [response](judgements/wave1/dwp-funeral-payment.response.json)

### P006 — Pension Credit: `eligibility.evidenceRequired.0`

**Claim:** Bank statements

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The page asks for your bank account details and information about your income, savings and investments, but does not mention bank statements.

**Finder searches counted (2):**

- `Pension Credit claim bank statements evidence asked to provide`
- `Pension Credit "bank statements" site:gov.uk OR site:citizensadvice.org.uk OR site:nidirect.gov.uk`

**Finder notes not counted as searches:**

- `gov.uk/pension-credit/how-to-claim (read)`

**Pages recorded:**

- [www.gov.uk/pension-credit](https://www.gov.uk/pension-credit) — cited, in judge prompt
- [www.gov.uk/pension-credit/what-youll-get](https://www.gov.uk/pension-credit/what-youll-get) — cited, in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/dwp-pension-credit.prompt.txt), [response](judgements/wave1/dwp-pension-credit.response.json)

### P007 — State Pension claim: `eligibility.evidenceRequired.0`

**Claim:** NI number

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The list of what you need to claim (marriage dates, time abroad, bank details, foreign social security numbers, an invitation code online) does not include a National Insurance number.

**Finder searches counted (2):**

- `nidirect State Pension claim what you need National Insurance number`
- `nidirect "State Pension" claim online "National Insurance number" get your State Pension`

**Pages recorded:**

- [www.gov.uk/new-state-pension/eligibility](https://www.gov.uk/new-state-pension/eligibility) — cited, in judge prompt
- [www.gov.uk/new-state-pension/what-youll-get](https://www.gov.uk/new-state-pension/what-youll-get) — cited, in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/dwp-state-pension.prompt.txt), [response](judgements/wave1/dwp-state-pension.response.json)

### P008 — Register the death: `eligibility.evidenceRequired.0`

**Claim:** Medical Certificate of Cause of Death (MCCD)

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The GOV.UK pages say to wait for the medical examiner's confirmation and do not mention an MCCD; only the Scotland and Northern Ireland pages, which are other nations' versions, mention it.

**Finder searches counted (2):**

- `register a death England documents you need medical certificate cause of death NHS number register office`
- `mygov.scot registering a death what you need medical certificate NHS number`

**Pages recorded:**

- [www.gov.uk/register-a-death](https://www.gov.uk/register-a-death) — cited, in judge prompt
- [www.gov.uk/after-a-death/register-the-death](https://www.gov.uk/after-a-death/register-the-death) — cited, in judge prompt
- [www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once](https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once) — linked in judge prompt
- [www.gov.uk/after-a-death/when-a-death-is-reported-to-a-coroner](https://www.gov.uk/after-a-death/when-a-death-is-reported-to-a-coroner) — linked in judge prompt
- [www.gov.uk/after-a-death/death-abroad](https://www.gov.uk/after-a-death/death-abroad) — linked in judge prompt
- [www.nidirect.gov.uk/articles/registering-death](https://www.nidirect.gov.uk/articles/registering-death) — found in judge prompt, finder nomination
- [www.mygov.scot/register-death](https://www.mygov.scot/register-death) — found in judge prompt, finder nomination
- [www.gov.uk/tell-us-once](https://www.gov.uk/tell-us-once) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/gro-register-death.prompt.txt), [response](judgements/wave1/gro-register-death.response.json)

### P009 — Register the death: `eligibility.evidenceRequired.1`

**Claim:** Deceased's NHS number and personal details if available

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** No GOV.UK source mentions the NHS number for registering a death; the Scotland page mentions an NHS medical card but that is another nation's version. The GOV.UK pages list the deceased's details only for Tell Us Once, a different service, not for registering the death.

**Finder searches counted (2):**

- `register a death England documents you need medical certificate cause of death NHS number register office`
- `mygov.scot registering a death what you need medical certificate NHS number`

**Pages recorded:**

- [www.gov.uk/register-a-death](https://www.gov.uk/register-a-death) — cited, in judge prompt
- [www.gov.uk/after-a-death/register-the-death](https://www.gov.uk/after-a-death/register-the-death) — cited, in judge prompt
- [www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once](https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once) — linked in judge prompt
- [www.gov.uk/after-a-death/when-a-death-is-reported-to-a-coroner](https://www.gov.uk/after-a-death/when-a-death-is-reported-to-a-coroner) — linked in judge prompt
- [www.gov.uk/after-a-death/death-abroad](https://www.gov.uk/after-a-death/death-abroad) — linked in judge prompt
- [www.nidirect.gov.uk/articles/registering-death](https://www.nidirect.gov.uk/articles/registering-death) — found in judge prompt, finder nomination
- [www.mygov.scot/register-death](https://www.mygov.scot/register-death) — found in judge prompt, finder nomination
- [www.gov.uk/tell-us-once](https://www.gov.uk/tell-us-once) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/gro-register-death.prompt.txt), [response](judgements/wave1/gro-register-death.response.json)

### P010 — Anti-money laundering registration: `eligibility.evidenceRequired.2`

**Claim:** Evidence of business type and activities

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The text asks for a risk assessment, BOOMs, premises and fees, but does not mention evidence of business type or activities.

**Finder searches counted (2):**

- `gov.uk search: money laundering supervision registration`
- `gov.uk search: anti-money laundering register hmrc`

**Pages recorded:**

- [www.gov.uk/anti-money-laundering-registration](https://www.gov.uk/anti-money-laundering-registration) — cited, in judge prompt
- [www.gov.uk/guidance/money-laundering-regulations-who-needs-to-register](https://www.gov.uk/guidance/money-laundering-regulations-who-needs-to-register) — linked in judge prompt
- [www.gov.uk/guidance/registration-guide-for-estate-agency-businesses](https://www.gov.uk/guidance/registration-guide-for-estate-agency-businesses) — linked in judge prompt
- [www.gov.uk/guidance/money-laundering-regulations-high-value-dealer-registration](https://www.gov.uk/guidance/money-laundering-regulations-high-value-dealer-registration) — linked in judge prompt
- [www.gov.uk/guidance/register-or-renew-your-money-laundering-supervision-with-hmrc](https://www.gov.uk/guidance/register-or-renew-your-money-laundering-supervision-with-hmrc) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/hmrc-aml-registration.prompt.txt), [response](judgements/wave1/hmrc-aml-registration.response.json)

### P011 — Free childcare — 15 hours (3 and 4-year-olds): `eligibility.evidenceRequired.0`

**Claim:** Child's date of birth, given to the childcare provider

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** Only the linked Free Childcare for Working Parents page, a different scheme, says to give your child's date of birth to the provider; the sources on the 15 hours for 3 to 4-year-olds do not.

**Finder searches counted (2):**

- `gov.uk search: free childcare 3 4 year olds apply provider`
- `gov.uk search: free early years provision model agreement`

**Pages recorded:**

- [www.gov.uk/help-with-childcare-costs/free-childcare-and-education-for-3-to-4-year-olds](https://www.gov.uk/help-with-childcare-costs/free-childcare-and-education-for-3-to-4-year-olds) — cited, in judge prompt
- [www.gov.uk/tax-free-childcare](https://www.gov.uk/tax-free-childcare) — linked in judge prompt
- [www.gov.uk/free-childcare-if-working/check-youre-eligible](https://www.gov.uk/free-childcare-if-working/check-youre-eligible) — linked in judge prompt
- [www.gov.uk/free-childcare-if-working](https://www.gov.uk/free-childcare-if-working) — linked in judge prompt
- [www.gov.uk/government/publications/free-early-years-provision-and-childcare-model-agreement/parental-declaration-form-guidance](https://www.gov.uk/government/publications/free-early-years-provision-and-childcare-model-agreement/parental-declaration-form-guidance) — found in judge prompt, finder nomination
- [assets.publishing.service.gov.uk/media/6979dc7b1c24881f40a4d6ec/Parental_declaration_form.docx](https://assets.publishing.service.gov.uk/media/6979dc7b1c24881f40a4d6ec/Parental_declaration_form.docx) — found in judge prompt, finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave1/hmrc-free-childcare-15.prompt.txt), [response](judgements/wave1/hmrc-free-childcare-15.response.json)

### P012 — Lifetime ISA withdrawal: `eligibility.evidenceRequired.0`

**Claim:** LISA account details

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The text does not say you need to provide your Lifetime ISA account details to make a withdrawal.

**Finder searches counted (2):**

- `gov.uk Lifetime ISA withdrawal ask your provider online account details first home`
- `site:gov.uk Lifetime ISA withdraw money account provider request withdrawal form conveyancer`

**Pages recorded:**

- [www.gov.uk/lifetime-isa](https://www.gov.uk/lifetime-isa) — cited, in judge prompt
- [www.gov.uk/individual-savings-accounts/how-to-open-an-isa](https://www.gov.uk/individual-savings-accounts/how-to-open-an-isa) — linked in judge prompt
- [www.gov.uk/individual-savings-accounts/how-isas-work](https://www.gov.uk/individual-savings-accounts/how-isas-work) — linked in judge prompt
- [www.gov.uk/individual-savings-accounts/transferring-your-isa](https://www.gov.uk/individual-savings-accounts/transferring-your-isa) — linked in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/hmrc-lisa.prompt.txt), [response](judgements/wave2/hmrc-lisa.response.json)

### P013 — Stamp Duty Land Tax return: `eligibility.evidenceRequired.0`

**Claim:** Completion statement

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The text does not mention a completion statement as evidence needed for the return.

**Finder searches counted (2):**

- `gov.uk SDLT return completion statement effective date information you need to fill in return`
- `grep of gov.uk SDLT1 completion guide for 'completion statement'`

**Pages recorded:**

- [www.gov.uk/stamp-duty-land-tax](https://www.gov.uk/stamp-duty-land-tax) — cited, in judge prompt
- [www.gov.uk/stamp-duty-land-tax/residential-property-rates](https://www.gov.uk/stamp-duty-land-tax/residential-property-rates) — cited, in judge prompt
- [www.gov.uk/guidance/stamp-duty-land-tax-online-and-paper-returns](https://www.gov.uk/guidance/stamp-duty-land-tax-online-and-paper-returns) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/hmrc-sdlt.prompt.txt), [response](judgements/wave2/hmrc-sdlt.response.json)

### P014 — Skilled Worker dependant visa: `eligibility.evidenceRequired.0`

**Claim:** Main applicant's visa or BRP

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The source discusses the main applicant’s visa and dependants’ relationship evidence but does not require a copy of the main applicant’s visa or BRP.

**Finder searches counted (3):**

- `grep of /skilled-worker-visa/your-partner-and-children and /documents-you-must-provide for BRP/eVisa`
- `GOV.UK search: dependants of skilled workers caseworker guidance`
- `GOV.UK search: partner child visa evidence of main applicant permission`

**Pages recorded:**

- [www.gov.uk/skilled-worker-visa/your-partner-and-children](https://www.gov.uk/skilled-worker-visa/your-partner-and-children) — cited, in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/ho-skilled-worker-dependent-visa.prompt.txt), [response](judgements/wave2/ho-skilled-worker-dependent-visa.response.json)

### P015 — Business rates registration: `eligibility.evidenceRequired.0`

**Claim:** Business address

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The text does not specify a business address as application evidence.

**Finder searches counted (2):**

- `register for business rates new business occupation date of occupation nature of business gov.uk OR gov.wales OR mygov.scot OR nidirect`
- `nidirect rates for business premises tell Land and Property Services new occupier`

**Pages recorded:**

- [www.gov.uk/introduction-to-business-rates](https://www.gov.uk/introduction-to-business-rates) — cited, in judge prompt
- [www.gov.uk/find-hmrc-contacts/valuation-office-enquiries](https://www.gov.uk/find-hmrc-contacts/valuation-office-enquiries) — linked in judge prompt
- [www.gov.uk/guidance/voa-agent-standards](https://www.gov.uk/guidance/voa-agent-standards) — linked in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/la-business-rates.prompt.txt), [response](judgements/wave2/la-business-rates.response.json)

### P016 — Business rates registration: `eligibility.evidenceRequired.1`

**Claim:** Date of occupation

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The text does not specify a date of occupation as application evidence.

**Finder searches counted (2):**

- `register for business rates new business occupation date of occupation nature of business gov.uk OR gov.wales OR mygov.scot OR nidirect`
- `nidirect rates for business premises tell Land and Property Services new occupier`

**Pages recorded:**

- [www.gov.uk/introduction-to-business-rates](https://www.gov.uk/introduction-to-business-rates) — cited, in judge prompt
- [www.gov.uk/find-hmrc-contacts/valuation-office-enquiries](https://www.gov.uk/find-hmrc-contacts/valuation-office-enquiries) — linked in judge prompt
- [www.gov.uk/guidance/voa-agent-standards](https://www.gov.uk/guidance/voa-agent-standards) — linked in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/la-business-rates.prompt.txt), [response](judgements/wave2/la-business-rates.response.json)

### P017 — Council Tax Reduction: `eligibility.evidenceRequired.1`

**Claim:** Council Tax bill

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The sources discuss a Council Tax bill but do not say an applicant must provide the bill as evidence.

**Finder searches counted (2):**

- `Council Tax Reduction apply liable proof of income savings citizensadvice.org.uk OR gov.wales OR mygov.scot`
- `citizensadvice.org.uk council tax reduction England how to apply online phone liable`

**Pages recorded:**

- [www.gov.uk/apply-council-tax-reduction](https://www.gov.uk/apply-council-tax-reduction) — cited, in judge prompt
- [www.gov.uk/council-tax](https://www.gov.uk/council-tax) — linked in judge prompt
- [www.citizensadvice.org.uk/housing/council-tax/applying-for-council-tax-reduction/](https://www.citizensadvice.org.uk/housing/council-tax/applying-for-council-tax-reduction/) — found in judge prompt
- [www.citizensadvice.org.uk/scotland/benefits/help-if-on-a-low-income/help-with-your-council-tax-council-tax-reduction-s/council-tax-reduction-how-to-apply-s](https://www.citizensadvice.org.uk/scotland/benefits/help-if-on-a-low-income/help-with-your-council-tax-council-tax-reduction-s/council-tax-reduction-how-to-apply-s) — found in judge prompt
- [www.citizensadvice.org.uk/scotland/benefits/help-if-on-a-low-income/help-with-your-council-tax-council-tax-reduction-s/applying-for-council-tax-reduction-s/check-if-you-can-get-council-tax-reduction-s/](https://www.citizensadvice.org.uk/scotland/benefits/help-if-on-a-low-income/help-with-your-council-tax-council-tax-reduction-s/applying-for-council-tax-reduction-s/check-if-you-can-get-council-tax-reduction-s/) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/la-council-tax-reduction.prompt.txt), [response](judgements/wave2/la-council-tax-reduction.response.json)

### P018 — Adult Disability Payment: `eligibility.evidenceRequired.2`

**Claim:** GP or consultant details

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The supplied text mentions a GP letter as an example of supporting information but does not require GP or consultant contact details.

**Finder searches counted (2):**

- `site:mygov.scot/adult-disability-payment "GP" "contact" "apply"`
- `site:mygov.scot/adult-disability-payment "consultant" "details"`

**Pages recorded:**

- [www.mygov.scot/adult-disability-payment](https://www.mygov.scot/adult-disability-payment) — cited, in judge prompt
- [www.mygov.scot/adult-disability-payment/applicants](https://www.mygov.scot/adult-disability-payment/applicants) — cited, in judge prompt
- [www.mygov.scot/adult-disability-payment-changes](https://www.mygov.scot/adult-disability-payment-changes) — linked in judge prompt
- [www.mygov.scot/adult-disability-payment-suitability-checker](https://www.mygov.scot/adult-disability-payment-suitability-checker) — linked in judge prompt
- [www.mygov.scot/moving-from-child-disability-payment-to-adult-disability-payment](https://www.mygov.scot/moving-from-child-disability-payment-to-adult-disability-payment) — linked in judge prompt
- [www.gov.scot/publications/social-security-assistance-scotland-up-rating-inflation-2026-27/pages/5/](https://www.gov.scot/publications/social-security-assistance-scotland-up-rating-inflation-2026-27/pages/5/) — found in judge prompt
- [www.mygov.scot/adult-disability-payment/what-you-need](https://www.mygov.scot/adult-disability-payment/what-you-need) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave4/sss-adult-disability-payment.prompt.txt), [response](judgements/wave4/sss-adult-disability-payment.response.json)

### P019 — Best Start Grant: `eligibility.evidenceRequired.1`

**Claim:** Proof of pregnancy or child's age

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The sources give pregnancy and child-age conditions but do not say proof of either is needed.

**Finder searches counted (2):**

- `site:mygov.scot/best-start-grant-best-start-foods "proof" "pregnancy"`
- `site:socialsecurity.gov.scot Best Start Grant evidence qualifying benefit pregnancy residency`

**Pages recorded:**

- [www.mygov.scot/best-start-grant-best-start-foods](https://www.mygov.scot/best-start-grant-best-start-foods) — cited, in judge prompt
- [www.mygov.scot/browse/benefits/children-and-family](https://www.mygov.scot/browse/benefits/children-and-family) — linked in judge prompt
- [www.mygov.scot/scottish-child-payment](https://www.mygov.scot/scottish-child-payment) — linked in judge prompt
- [www.mygov.scot/using-your-best-start-foods-card](https://www.mygov.scot/using-your-best-start-foods-card) — linked in judge prompt
- [www.mygov.scot/best-start-grant-best-start-foods/best-start-apply](https://www.mygov.scot/best-start-grant-best-start-foods/best-start-apply) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave4/sss-best-start-grant.prompt.txt), [response](judgements/wave4/sss-best-start-grant.response.json)

### P020 — Best Start Grant: `eligibility.evidenceRequired.2`

**Claim:** Proof of Scottish residency

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The sources say applicants normally live in Scotland but do not say residency proof is needed.

**Finder searches counted (2):**

- `site:mygov.scot/best-start-grant-best-start-foods "proof" "address"`
- `site:socialsecurity.gov.scot Best Start Grant evidence qualifying benefit pregnancy residency`

**Pages recorded:**

- [www.mygov.scot/best-start-grant-best-start-foods](https://www.mygov.scot/best-start-grant-best-start-foods) — cited, in judge prompt
- [www.mygov.scot/browse/benefits/children-and-family](https://www.mygov.scot/browse/benefits/children-and-family) — linked in judge prompt
- [www.mygov.scot/scottish-child-payment](https://www.mygov.scot/scottish-child-payment) — linked in judge prompt
- [www.mygov.scot/using-your-best-start-foods-card](https://www.mygov.scot/using-your-best-start-foods-card) — linked in judge prompt
- [www.mygov.scot/best-start-grant-best-start-foods/best-start-apply](https://www.mygov.scot/best-start-grant-best-start-foods/best-start-apply) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave4/sss-best-start-grant.prompt.txt), [response](judgements/wave4/sss-best-start-grant.response.json)

### P021 — Pension Age Winter Heating Payment: `eligibility.evidenceRequired.0`

**Claim:** Proof of age

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The page states an age-based eligibility condition but does not request documentary proof of age.

**Finder searches counted (2):**

- `Pension Age Winter Heating Payment proof of age application documents`
- `Pension Age Winter Heating Payment age verification birth certificate evidence`

**Pages recorded:**

- [www.mygov.scot/pension-age-winter-heating-payment](https://www.mygov.scot/pension-age-winter-heating-payment) — cited, in judge prompt
- [www.mygov.scot/pension-age-winter-heating-payment/how-much-you-might-be-paid](https://www.mygov.scot/pension-age-winter-heating-payment/how-much-you-might-be-paid) — cited, in judge prompt
- [www.mygov.scot/pension-age-winter-heating-payment/check-if-you-need-to-apply](https://www.mygov.scot/pension-age-winter-heating-payment/check-if-you-need-to-apply) — found in judge prompt
- [www.mygov.scot/pension-age-winter-heating-payment/contact](https://www.mygov.scot/pension-age-winter-heating-payment/contact) — found in judge prompt
- [www.mygov.scot/pension-age-winter-heating-payment/check-if-youre-eligible](https://www.mygov.scot/pension-age-winter-heating-payment/check-if-youre-eligible) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave5/sss-pension-winter-heating.prompt.txt), [response](judgements/wave5/sss-pension-winter-heating.response.json)

### P022 — Pension Age Winter Heating Payment: `eligibility.evidenceRequired.1`

**Claim:** Proof of Scottish residency

**Action:** Delete this list item; shift later provenance keys without changing their verdicts.

**Judge note:** The page states a Scottish-residence condition but does not request documentary proof of residence.

**Finder searches counted (2):**

- `Pension Age Winter Heating Payment proof of Scottish residency documents`
- `Pension Age Winter Heating Payment proof of address application Scotland`

**Pages recorded:**

- [www.mygov.scot/pension-age-winter-heating-payment](https://www.mygov.scot/pension-age-winter-heating-payment) — cited, in judge prompt
- [www.mygov.scot/pension-age-winter-heating-payment/how-much-you-might-be-paid](https://www.mygov.scot/pension-age-winter-heating-payment/how-much-you-might-be-paid) — cited, in judge prompt
- [www.mygov.scot/pension-age-winter-heating-payment/check-if-you-need-to-apply](https://www.mygov.scot/pension-age-winter-heating-payment/check-if-you-need-to-apply) — found in judge prompt
- [www.mygov.scot/pension-age-winter-heating-payment/contact](https://www.mygov.scot/pension-age-winter-heating-payment/contact) — found in judge prompt
- [www.mygov.scot/pension-age-winter-heating-payment/check-if-youre-eligible](https://www.mygov.scot/pension-age-winter-heating-payment/check-if-youre-eligible) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave5/sss-pension-winter-heating.prompt.txt), [response](judgements/wave5/sss-pension-winter-heating.response.json)

## Prose clauses proposed for deletion (0)

None.

## Excluded: only unreadable PDF or Word nominations (9)

### nhs-free-prescriptions#eligibility.criteria.1 — Free prescriptions (disability): `eligibility.criteria.1`

**Claim:** Receiving UC with a health element, or HC2 certificate for low income.

**Action:** Every nominated finder source was an unreadable PDF or Word file.

**Judge note:** The supplied text does not mention Universal Credit or its health element. The supplied text does not mention HC2 certificates.

**Finder searches counted (2):**

- `nhs.uk free prescriptions England aged 60 or over under 16 16 to 18 full-time education HC2 Universal Credit`
- `free prescriptions 60 or over medical exemption certificate (nhs/nhsbsa/gov.uk)`

**Pages recorded:**

- [www.nhs.uk/nhs-services/prescriptions-and-pharmacies/who-can-get-free-prescriptions/](https://www.nhs.uk/nhs-services/prescriptions-and-pharmacies/who-can-get-free-prescriptions/) — cited, in judge prompt
- [www.nhsbsa.nhs.uk/help-nhs-prescription-costs/free-nhs-prescriptions](https://www.nhsbsa.nhs.uk/help-nhs-prescription-costs/free-nhs-prescriptions) — cited; not present as readable judge-prompt text
- [www.nhs.uk/nhs-services/prescriptions/save-money-with-a-prescription-prepayment-certificate-ppc](https://www.nhs.uk/nhs-services/prescriptions/save-money-with-a-prescription-prepayment-certificate-ppc) — linked in judge prompt
- [www.nhsbsa.nhs.uk/sites/default/files/2026-04/Free%20NHS%20prescriptions%20booklet%20-%20large%20print%20-%20(V4)%2004.2026.pdf](https://www.nhsbsa.nhs.uk/sites/default/files/2026-04/Free%20NHS%20prescriptions%20booklet%20-%20large%20print%20-%20(V4)%2004.2026.pdf) — finder nomination; PDF/Word source not available as readable text
- [www.nhsbsa.nhs.uk/sites/default/files/2026-04/HC11%20(V28)%2004.2026.pdf](https://www.nhsbsa.nhs.uk/sites/default/files/2026-04/HC11%20(V28)%2004.2026.pdf) — finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave3/nhs-free-prescriptions.prompt.txt), [response](judgements/wave3/nhs-free-prescriptions.response.json)

### nhs-ppc#eligibility.exclusions.0 — Prescription Prepayment Certificate (PPC): `eligibility.exclusions.0`

**Claim:** Already exempt: UC claimant, over 60, under 16, certain conditions (diabetes, epilepsy etc.)

**Action:** Every nominated finder source was an unreadable PDF or Word file.

**Judge note:** The PPC page does not discuss Universal Credit or prescription exemptions. The PPC page does not mention an age-based exemption. The PPC page does not mention an age-based exemption. The PPC page does not mention medical-condition exemptions.

**Finder searches counted (1):**

- `site:nhsbsa.nhs.uk prescription exemption under 16 over 60 Universal Credit diabetes epilepsy certificate`

**Pages recorded:**

- [www.gov.uk/get-a-ppc](https://www.gov.uk/get-a-ppc) — cited, in judge prompt
- [www.nhsbsa.nhs.uk/sites/default/files/2026-04/HC11%20%28V28%29%2004.2026.pdf](https://www.nhsbsa.nhs.uk/sites/default/files/2026-04/HC11%20%28V28%29%2004.2026.pdf) — finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave5/nhs-ppc.prompt.txt), [response](judgements/wave5/nhs-ppc.response.json)

### dvla-ved-exemption#agentInteraction.methods — Vehicle Excise Duty Exemption: `agentInteraction.methods`

**Claim:** You can apply or do this online.

**Action:** Every nominated finder source was an unreadable PDF or Word file.

**Judge note:** The text never says the exemption can be claimed online; it says a first-time claim has to be made at a Post Office, and other changes of tax class are made at a Post Office or by post.

**Other methods named on the page:** in-person, post

**Finder searches counted (3):**

- `gov.uk disability exemption from vehicle tax how to claim PIP enhanced rate mobility V5C`
- `renew vehicle tax disability exemption online after first claim at Post Office gov.uk`
- `GOV.UK search: vehicle tax disability exemption claim`

**Pages recorded:**

- [www.gov.uk/financial-help-disabled/vehicles-and-transport](https://www.gov.uk/financial-help-disabled/vehicles-and-transport) — cited, in judge prompt
- [www.gov.uk/financial-help-disabled/disability-and-sickness-benefits](https://www.gov.uk/financial-help-disabled/disability-and-sickness-benefits) — linked in judge prompt
- [www.gov.uk/financial-help-disabled/vat-relief](https://www.gov.uk/financial-help-disabled/vat-relief) — linked in judge prompt
- [www.gov.uk/financial-help-disabled/armed-forces-compensation](https://www.gov.uk/financial-help-disabled/armed-forces-compensation) — linked in judge prompt
- [assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/873357/ins216-how-to-apply-for-free-disabled-tax.pdf](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/873357/ins216-how-to-apply-for-free-disabled-tax.pdf) — found in judge prompt, finder nomination; PDF/Word source not available as readable text
- [www.gov.uk/change-vehicle-tax-class/tax-due-to-run-out-or-changing-if-vehicle-is-exempt](https://www.gov.uk/change-vehicle-tax-class/tax-due-to-run-out-or-changing-if-vehicle-is-exempt) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/dvla-ved-exemption.prompt.txt), [response](judgements/wave1/dvla-ved-exemption.response.json)

### dwp-bereavement-support#eligibility.evidenceRequired.0 — Bereavement Support Payment: `eligibility.evidenceRequired.0`

**Claim:** Death certificate

**Action:** Every nominated finder source was an unreadable PDF or Word file.

**Judge note:** The list of what you need to apply covers National Insurance numbers, bank details and the date of death, but no death certificate.

**Finder searches counted (3):**

- `Bereavement Support Payment claim need death certificate marriage certificate civil partnership certificate`
- `GOV.UK search: bereavement support payment death certificate`
- `GOV.UK search: Bereavement Support Payment claim form`

**Pages recorded:**

- [www.gov.uk/bereavement-support-payment](https://www.gov.uk/bereavement-support-payment) — cited, in judge prompt
- [www.gov.uk/bereavement-support-payment/what-youll-get](https://www.gov.uk/bereavement-support-payment/what-youll-get) — cited, in judge prompt
- [www.gov.uk/widowed-parents-allowance](https://www.gov.uk/widowed-parents-allowance) — linked in judge prompt
- [assets.publishing.service.gov.uk/media/698c58b7d7b51513fcd8a3b1/bereavement-support-payment-form.pdf](https://assets.publishing.service.gov.uk/media/698c58b7d7b51513fcd8a3b1/bereavement-support-payment-form.pdf) — found in judge prompt, finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave1/dwp-bereavement-support.prompt.txt), [response](judgements/wave1/dwp-bereavement-support.response.json)

### dwp-bereavement-support#eligibility.evidenceRequired.1 — Bereavement Support Payment: `eligibility.evidenceRequired.1`

**Claim:** Marriage or civil partnership certificate

**Action:** Every nominated finder source was an unreadable PDF or Word file.

**Judge note:** The text requires that you were married, in a civil partnership or living together, but never asks for a marriage or civil partnership certificate.

**Finder searches counted (2):**

- `Bereavement Support Payment claim need death certificate marriage certificate civil partnership certificate`
- `GOV.UK search: Bereavement Support Payment claim form`

**Pages recorded:**

- [www.gov.uk/bereavement-support-payment](https://www.gov.uk/bereavement-support-payment) — cited, in judge prompt
- [www.gov.uk/bereavement-support-payment/what-youll-get](https://www.gov.uk/bereavement-support-payment/what-youll-get) — cited, in judge prompt
- [www.gov.uk/widowed-parents-allowance](https://www.gov.uk/widowed-parents-allowance) — linked in judge prompt
- [assets.publishing.service.gov.uk/media/698c58b7d7b51513fcd8a3b1/bereavement-support-payment-form.pdf](https://assets.publishing.service.gov.uk/media/698c58b7d7b51513fcd8a3b1/bereavement-support-payment-form.pdf) — found in judge prompt, finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave1/dwp-bereavement-support.prompt.txt), [response](judgements/wave1/dwp-bereavement-support.response.json)

### dwp-inherited-state-pension#eligibility.evidenceRequired.0 — Inherited State Pension (Additional or extra): `eligibility.evidenceRequired.0`

**Claim:** Death certificate

**Action:** Every nominated finder source was an unreadable PDF or Word file.

**Judge note:** None of the readable sources mention a death certificate.

**Finder searches counted (2):**

- `Inherited State Pension ... death certificate gov.uk`
- `claim State Pension as widow form late husband's National Insurance number marriage certificate death certificate`

**Pages recorded:**

- [www.gov.uk/new-state-pension/inheriting-or-increasing-state-pension-from-a-spouse-or-civil-partner](https://www.gov.uk/new-state-pension/inheriting-or-increasing-state-pension-from-a-spouse-or-civil-partner) — cited, in judge prompt
- [www.gov.uk/new-state-pension/living-and-working-overseas](https://www.gov.uk/new-state-pension/living-and-working-overseas) — linked in judge prompt
- [www.gov.uk/new-state-pension/increase-retirement-income](https://www.gov.uk/new-state-pension/increase-retirement-income) — linked in judge prompt
- [www.gov.uk/new-state-pension/how-to-claim](https://www.gov.uk/new-state-pension/how-to-claim) — linked in judge prompt
- [www.gov.uk/state-pension-through-partner/y/widowed/your_pension_age_before_specific_date](https://www.gov.uk/state-pension-through-partner/y/widowed/your_pension_age_before_specific_date) — found in judge prompt
- [assets.publishing.service.gov.uk/media/68ece01da8398380cb4acf8b/ipc-br1-nsp.pdf](https://assets.publishing.service.gov.uk/media/68ece01da8398380cb4acf8b/ipc-br1-nsp.pdf) — found in judge prompt, finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave1/dwp-inherited-state-pension.prompt.txt), [response](judgements/wave1/dwp-inherited-state-pension.response.json)

### dwp-inherited-state-pension#eligibility.evidenceRequired.2 — Inherited State Pension (Additional or extra): `eligibility.evidenceRequired.2`

**Claim:** NI numbers for both parties

**Action:** Every nominated finder source was an unreadable PDF or Word file.

**Judge note:** The sources do not list National Insurance numbers as something you must provide.

**Finder searches counted (2):**

- `Inherited State Pension ... partner's National Insurance number gov.uk`
- `claim State Pension as widow form late husband's National Insurance number`

**Pages recorded:**

- [www.gov.uk/new-state-pension/inheriting-or-increasing-state-pension-from-a-spouse-or-civil-partner](https://www.gov.uk/new-state-pension/inheriting-or-increasing-state-pension-from-a-spouse-or-civil-partner) — cited, in judge prompt
- [www.gov.uk/new-state-pension/living-and-working-overseas](https://www.gov.uk/new-state-pension/living-and-working-overseas) — linked in judge prompt
- [www.gov.uk/new-state-pension/increase-retirement-income](https://www.gov.uk/new-state-pension/increase-retirement-income) — linked in judge prompt
- [www.gov.uk/new-state-pension/how-to-claim](https://www.gov.uk/new-state-pension/how-to-claim) — linked in judge prompt
- [www.gov.uk/state-pension-through-partner/y/widowed/your_pension_age_before_specific_date](https://www.gov.uk/state-pension-through-partner/y/widowed/your_pension_age_before_specific_date) — found in judge prompt
- [assets.publishing.service.gov.uk/media/68ece01da8398380cb4acf8b/ipc-br1-nsp.pdf](https://assets.publishing.service.gov.uk/media/68ece01da8398380cb4acf8b/ipc-br1-nsp.pdf) — found in judge prompt, finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave1/dwp-inherited-state-pension.prompt.txt), [response](judgements/wave1/dwp-inherited-state-pension.response.json)

### ho-citizenship-spouse#eligibility.evidenceRequired.0 — British citizenship (spouse / civil partner): `eligibility.evidenceRequired.0`

**Claim:** Passport(s)

**Action:** Every nominated finder source was an unreadable PDF or Word file.

**Judge note:** The readable sources do not list passports among the documents to provide; the document list is in the guidance, whose text (Source 4) is not readable.

**Finder searches counted (1):**

- `gov.uk Guide AN naturalisation documents spouse British citizen passport marriage certificate`

**Finder notes not counted as searches:**

- `gov.uk apply-citizenship-spouse/how-to-apply (read)`

**Pages recorded:**

- [www.gov.uk/apply-citizenship-spouse](https://www.gov.uk/apply-citizenship-spouse) — cited, in judge prompt
- [www.gov.uk/check-british-citizenship](https://www.gov.uk/check-british-citizenship) — linked in judge prompt
- [www.gov.uk/apply-first-adult-passport](https://www.gov.uk/apply-first-adult-passport) — linked in judge prompt
- [www.gov.uk/right-of-abode/apply-for-a-certificate-of-entitlement](https://www.gov.uk/right-of-abode/apply-for-a-certificate-of-entitlement) — linked in judge prompt
- [assets.publishing.service.gov.uk/media/69b3ed7c9d8b52961a62b3c6/Guide_AN_-_March_2026.pdf](https://assets.publishing.service.gov.uk/media/69b3ed7c9d8b52961a62b3c6/Guide_AN_-_March_2026.pdf) — found in judge prompt, finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave2/ho-citizenship-spouse.prompt.txt), [response](judgements/wave2/ho-citizenship-spouse.response.json)

### nhs-free-prescriptions#eligibility.evidenceRequired.0 — Free prescriptions (disability): `eligibility.evidenceRequired.0`

**Claim:** Benefit award letter or FP92A medical exemption form signed by GP

**Action:** Every nominated finder source was an unreadable PDF or Word file.

**Judge note:** The supplied text does not mention benefit award letters. The supplied text does not mention an FP92A form or GP signature.

**Finder searches counted (2):**

- `nhsbsa medical exemption certificate FP92A apply GP qualifying medical conditions`
- `free prescriptions 60 or over medical exemption certificate (nhs/nhsbsa/gov.uk)`

**Pages recorded:**

- [www.nhs.uk/nhs-services/prescriptions-and-pharmacies/who-can-get-free-prescriptions/](https://www.nhs.uk/nhs-services/prescriptions-and-pharmacies/who-can-get-free-prescriptions/) — cited, in judge prompt
- [www.nhsbsa.nhs.uk/help-nhs-prescription-costs/free-nhs-prescriptions](https://www.nhsbsa.nhs.uk/help-nhs-prescription-costs/free-nhs-prescriptions) — cited; not present as readable judge-prompt text
- [www.nhs.uk/nhs-services/prescriptions/save-money-with-a-prescription-prepayment-certificate-ppc](https://www.nhs.uk/nhs-services/prescriptions/save-money-with-a-prescription-prepayment-certificate-ppc) — linked in judge prompt
- [www.nhsbsa.nhs.uk/sites/default/files/2026-04/Free%20NHS%20prescriptions%20booklet%20-%20large%20print%20-%20(V4)%2004.2026.pdf](https://www.nhsbsa.nhs.uk/sites/default/files/2026-04/Free%20NHS%20prescriptions%20booklet%20-%20large%20print%20-%20(V4)%2004.2026.pdf) — finder nomination; PDF/Word source not available as readable text
- [www.nhsbsa.nhs.uk/sites/default/files/2026-04/HC11%20(V28)%2004.2026.pdf](https://www.nhsbsa.nhs.uk/sites/default/files/2026-04/HC11%20(V28)%2004.2026.pdf) — finder nomination; PDF/Word source not available as readable text

**Saved judge input and output:** [prompt](judgements/wave3/nhs-free-prescriptions.prompt.txt), [response](judgements/wave3/nhs-free-prescriptions.response.json)

## Excluded: fewer than two finder searches (15)

### ho-euss-enquiry#eligibility.criteria.0 — EUSS status enquiry: `eligibility.criteria.0`

**Claim:** Must have applied to or been granted status under the EU Settlement Scheme.

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The UKVI contact pages are generic and set no condition that you have applied to or been granted EUSS status.

**Finder searches counted (1):**

- `GOV.UK search: EU Settlement Scheme contact`

**Finder notes not counted as searches:**

- `UKVI contact smart answer branch: settled or pre-settled status (EU Settlement Scheme)`

**Pages recorded:**

- [www.gov.uk/contact-ukvi-inside-outside-uk](https://www.gov.uk/contact-ukvi-inside-outside-uk) — cited, in judge prompt
- [www.gov.uk/check-uk-visa](https://www.gov.uk/check-uk-visa) — linked in judge prompt
- [www.gov.uk/contact-ukvi-inside-outside-uk/y/inside-the-uk/settled-or-pre-settled-status-eu-settlement-scheme](https://www.gov.uk/contact-ukvi-inside-outside-uk/y/inside-the-uk/settled-or-pre-settled-status-eu-settlement-scheme) — found in judge prompt, finder nomination
- [www.gov.uk/settled-status-eu-citizens-families/after-youve-applied](https://www.gov.uk/settled-status-eu-citizens-families/after-youve-applied) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/ho-euss-enquiry.prompt.txt), [response](judgements/wave2/ho-euss-enquiry.response.json)

### ho-skilled-worker-visa#eligibility.criteria.1 — Skilled Worker visa: `eligibility.criteria.1`

**Claim:** Must not have conditions that prevent applying for this visa.

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The text sets out job, sponsorship, salary and English requirements but does not describe any conditions that would prevent someone from applying.

**Finder searches counted (1):**

- `grep of Skilled Worker guide parts for exclusions`

**Finder notes not counted as searches:**

- `/skilled-worker-visa/switch-to-this-visa`

**Pages recorded:**

- [www.gov.uk/skilled-worker-visa](https://www.gov.uk/skilled-worker-visa) — cited, in judge prompt
- [www.gov.uk/skilled-worker-visa/your-job](https://www.gov.uk/skilled-worker-visa/your-job) — cited, in judge prompt
- [www.gov.uk/skilled-worker-visa/switch-to-this-visa](https://www.gov.uk/skilled-worker-visa/switch-to-this-visa) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave2/ho-skilled-worker-visa.prompt.txt), [response](judgements/wave2/ho-skilled-worker-visa.response.json)

### fco-emergency-travel-doc#agentInteraction.methods — Emergency travel document: `agentInteraction.methods`

**Claim:** You can apply or do this in person.

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The text describes applying online or through a contact form; in-person appointments and collection are part of how the document is delivered, not a way to apply.

**Other methods named on the page:** online

**Finder searches counted (1):**

- `emergency travel document apply in person appointment embassy consulate gov.uk`

**Pages recorded:**

- [www.gov.uk/emergency-travel-document](https://www.gov.uk/emergency-travel-document) — cited, in judge prompt
- [www.gov.uk/emergency-travel-document/how-to-apply](https://www.gov.uk/emergency-travel-document/how-to-apply) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave1/fco-emergency-travel-doc.prompt.txt), [response](judgements/wave1/fco-emergency-travel-doc.response.json)

### hmrc-p45#agentInteraction.methods — Obtain P45 from employer: `agentInteraction.methods`

**Claim:** You can apply or do this by phone.

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The text says to ask your previous employer for a P45 and mentions online services, but never says you can get or request it by phone.

**Other methods named on the page:** online

**Finder searches counted (1):**

- `gov.uk P45 not received from employer contact HMRC phone`

**Finder notes not counted as searches:**

- `fetched acas.org.uk/p45s-and-p60s (search result only)`

**Pages recorded:**

- [www.gov.uk/paye-forms-p45-p60-p11d/p45](https://www.gov.uk/paye-forms-p45-p60-p11d/p45) — cited, in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/hmrc-p45.prompt.txt), [response](judgements/wave2/hmrc-p45.response.json)

### hmrc-spl#agentInteraction.methods — Shared Parental Leave & Pay: `agentInteraction.methods`

**Claim:** You can apply or do this by phone. You can apply or do this by post.

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The source says you apply by giving your employer written notice and does not mention phone. The source requires written notice to your employer but does not say you can apply by post.

**Finder searches counted (1):**

- `Shared Parental Leave apply by phone or post`

**Finder notes not counted as searches:**

- `gov.uk shared-parental-leave-and-pay applying-for-leave-and-pay (read)`

**Pages recorded:**

- [www.gov.uk/shared-parental-leave-and-pay](https://www.gov.uk/shared-parental-leave-and-pay) — cited, in judge prompt
- [www.gov.uk/shared-parental-leave-and-pay/what-youll-get](https://www.gov.uk/shared-parental-leave-and-pay/what-youll-get) — cited, in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/hmrc-spl.prompt.txt), [response](judgements/wave2/hmrc-spl.response.json)

### hmrc-spp#agentInteraction.methods — Statutory Paternity Pay: `agentInteraction.methods`

**Claim:** You can apply or do this by phone. You can apply or do this by post.

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The text says you claim through your employer using the online form or the employer's own form, and never mentions claiming by phone. The text says to download or print the completed form and give it to your employer, but does not say you can claim by post.

**Other methods named on the page:** online

**Finder searches counted (1):**

- `Statutory Paternity Pay claim by phone or post HMRC employer form SC3 send by post`

**Finder notes not counted as searches:**

- `gov.uk paternity-pay-leave/how-to-claim (read)`

**Pages recorded:**

- [www.gov.uk/paternity-pay-leave](https://www.gov.uk/paternity-pay-leave) — cited, in judge prompt
- [www.gov.uk/paternity-pay-leave/pay](https://www.gov.uk/paternity-pay-leave/pay) — cited, in judge prompt

**Saved judge input and output:** [prompt](judgements/wave2/hmrc-spp.prompt.txt), [response](judgements/wave2/hmrc-spp.response.json)

### dwp-ni-number#eligibility.evidenceRequired.1 — National Insurance number: `eligibility.evidenceRequired.1`

**Claim:** Proof of address

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The documents listed are a passport or national identity card to prove identity; proof of address is never mentioned.

**Finder searches counted (1):**

- `apply for National Insurance number proof of address right to work documents identity appointment`

**Finder notes not counted as searches:**

- `gov.uk/apply-national-insurance-number/how-to-apply (read)`

**Pages recorded:**

- [www.gov.uk/apply-national-insurance-number](https://www.gov.uk/apply-national-insurance-number) — cited, in judge prompt
- [www.gov.uk/settled-status-eu-citizens-families](https://www.gov.uk/settled-status-eu-citizens-families) — linked in judge prompt
- [www.gov.uk/prove-right-to-work](https://www.gov.uk/prove-right-to-work) — linked in judge prompt
- [www.gov.uk/child-benefit](https://www.gov.uk/child-benefit) — linked in judge prompt
- [www.nidirect.gov.uk/articles/applying-national-insurance-number-if-you-live-northern-ireland](https://www.nidirect.gov.uk/articles/applying-national-insurance-number-if-you-live-northern-ireland) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/dwp-ni-number.prompt.txt), [response](judgements/wave1/dwp-ni-number.response.json)

### hmrc-cis#eligibility.evidenceRequired.2 — Construction Industry Scheme (CIS) registration: `eligibility.evidenceRequired.2`

**Claim:** Nature of construction work

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** None of the registration lists of what you need asks for a description of the construction work.

**Finder searches counted (1):**

- `gov.uk search: register construction industry scheme subcontractor`

**Finder notes not counted as searches:**

- `gov.uk content: CIS registration guidance pages`

**Pages recorded:**

- [www.gov.uk/what-is-the-construction-industry-scheme](https://www.gov.uk/what-is-the-construction-industry-scheme) — cited, in judge prompt
- [www.gov.uk/construction-industry-scheme-businesses-based-outside-uk](https://www.gov.uk/construction-industry-scheme-businesses-based-outside-uk) — linked in judge prompt
- [www.gov.uk/what-you-must-do-as-a-cis-contractor](https://www.gov.uk/what-you-must-do-as-a-cis-contractor) — linked in judge prompt
- [www.gov.uk/what-you-must-do-as-a-cis-contractor/how-to-register](https://www.gov.uk/what-you-must-do-as-a-cis-contractor/how-to-register) — linked in judge prompt
- [www.gov.uk/what-you-must-do-as-a-cis-subcontractor/how-to-register](https://www.gov.uk/what-you-must-do-as-a-cis-subcontractor/how-to-register) — found in judge prompt
- [www.gov.uk/guidance/register-a-limited-company-as-a-subcontractor-or-apply-for-gross-payment-status](https://www.gov.uk/guidance/register-a-limited-company-as-a-subcontractor-or-apply-for-gross-payment-status) — found in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/hmrc-cis.prompt.txt), [response](judgements/wave1/hmrc-cis.response.json)

### hmrc-guardians-allowance#eligibility.evidenceRequired.1 — Guardian's Allowance: `eligibility.evidenceRequired.1`

**Claim:** Child Benefit claim reference

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The text says you must qualify for and should claim Child Benefit, and lists the birth and death certificates to send, but never mentions a Child Benefit claim reference.

**Finder searches counted (1):**

- `gov.uk search: guardians allowance claim form BG1`

**Finder notes not counted as searches:**

- `gov.uk content: guardians-allowance/how-to-claim and BG1 notes PDF`

**Pages recorded:**

- [www.gov.uk/guardians-allowance](https://www.gov.uk/guardians-allowance) — cited, in judge prompt
- [www.gov.uk/guardians-allowance/what-youll-get](https://www.gov.uk/guardians-allowance/what-youll-get) — cited, in judge prompt
- [www.gov.uk/child-benefit-tax-charge/overview](https://www.gov.uk/child-benefit-tax-charge/overview) — linked in judge prompt
- [www.gov.uk/child-benefit-payment-dates](https://www.gov.uk/child-benefit-payment-dates) — linked in judge prompt

**Saved judge input and output:** [prompt](judgements/wave1/hmrc-guardians-allowance.prompt.txt), [response](judgements/wave1/hmrc-guardians-allowance.response.json)

### hmrc-mtd#eligibility.evidenceRequired.1 — Making Tax Digital enrolment: `eligibility.evidenceRequired.1`

**Claim:** VAT registration number

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The sources do not list a VAT registration number as needed to sign up; the withdrawn agent guidance mentions only a VAT certificate.

**Finder searches counted (1):**

- `gov.uk sign up for Making Tax Digital for VAT what you need VAT registration number`

**Finder notes not counted as searches:**

- `fetched gov.uk/guidance/sign-up-for-making-tax-digital-for-vat`

**Pages recorded:**

- [www.gov.uk/government/collections/making-tax-digital-for-vat](https://www.gov.uk/government/collections/making-tax-digital-for-vat) — cited, in judge prompt
- [www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-sole-traders-and-landlords-step-by-step](https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-sole-traders-and-landlords-step-by-step) — cited, in judge prompt
- [www.gov.uk/guidance/check-what-to-do-if-hmrc-has-signed-you-up-for-making-tax-digital-for-income-tax](https://www.gov.uk/guidance/check-what-to-do-if-hmrc-has-signed-you-up-for-making-tax-digital-for-income-tax) — linked in judge prompt
- [www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax](https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax) — linked in judge prompt
- [www.gov.uk/guidance/work-out-your-qualifying-income-for-making-tax-digital-for-income-tax](https://www.gov.uk/guidance/work-out-your-qualifying-income-for-making-tax-digital-for-income-tax) — linked in judge prompt
- [www.gov.uk/guidance/check-if-youre-eligible-for-making-tax-digital-for-income-tax](https://www.gov.uk/guidance/check-if-youre-eligible-for-making-tax-digital-for-income-tax) — found in judge prompt
- [www.gov.uk/guidance/sign-up-for-making-tax-digital-for-vat](https://www.gov.uk/guidance/sign-up-for-making-tax-digital-for-vat) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave2/hmrc-mtd.prompt.txt), [response](judgements/wave2/hmrc-mtd.response.json)

### hmrc-paye#eligibility.evidenceRequired.0 — Register as employer (PAYE): `eligibility.evidenceRequired.0`

**Claim:** Business name and address

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The employer registration pages do not list the business name as information needed to register. The employer registration pages do not list the business address as information needed; the registered office address rules in the linked page are about Companies House registration, a different service.

**Finder searches counted (1):**

- `gov.uk register as employer PAYE information you need first payday business name`

**Finder notes not counted as searches:**

- `walked gov.uk/register-employer smart answer outcomes`

**Pages recorded:**

- [www.gov.uk/register-employer](https://www.gov.uk/register-employer) — cited, in judge prompt
- [www.gov.uk/paye-for-employers](https://www.gov.uk/paye-for-employers) — cited, in judge prompt
- [www.gov.uk/what-you-must-do-as-a-cis-contractor](https://www.gov.uk/what-you-must-do-as-a-cis-contractor) — linked in judge prompt
- [www.gov.uk/limited-company-formation/appoint-directors-and-company-secretaries](https://www.gov.uk/limited-company-formation/appoint-directors-and-company-secretaries) — linked in judge prompt
- [www.gov.uk/running-payroll/fps-after-payday](https://www.gov.uk/running-payroll/fps-after-payday) — linked in judge prompt
- [www.gov.uk/register-employer/y/yes/no/limited-company/yes](https://www.gov.uk/register-employer/y/yes/no/limited-company/yes) — found in judge prompt, finder nomination
- [www.gov.uk/register-employer/y/yes/no/sole-trader/yes](https://www.gov.uk/register-employer/y/yes/no/sole-trader/yes) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave2/hmrc-paye.prompt.txt), [response](judgements/wave2/hmrc-paye.response.json)

### hmrc-paye#eligibility.evidenceRequired.1 — Register as employer (PAYE): `eligibility.evidenceRequired.1`

**Claim:** Nature of business

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The text does not say the nature of the business is needed to register as an employer.

**Finder searches counted (1):**

- `gov.uk register as employer PAYE information you need first payday business name`

**Finder notes not counted as searches:**

- `walked gov.uk/register-employer smart answer outcomes`

**Pages recorded:**

- [www.gov.uk/register-employer](https://www.gov.uk/register-employer) — cited, in judge prompt
- [www.gov.uk/paye-for-employers](https://www.gov.uk/paye-for-employers) — cited, in judge prompt
- [www.gov.uk/what-you-must-do-as-a-cis-contractor](https://www.gov.uk/what-you-must-do-as-a-cis-contractor) — linked in judge prompt
- [www.gov.uk/limited-company-formation/appoint-directors-and-company-secretaries](https://www.gov.uk/limited-company-formation/appoint-directors-and-company-secretaries) — linked in judge prompt
- [www.gov.uk/running-payroll/fps-after-payday](https://www.gov.uk/running-payroll/fps-after-payday) — linked in judge prompt
- [www.gov.uk/register-employer/y/yes/no/limited-company/yes](https://www.gov.uk/register-employer/y/yes/no/limited-company/yes) — found in judge prompt, finder nomination
- [www.gov.uk/register-employer/y/yes/no/sole-trader/yes](https://www.gov.uk/register-employer/y/yes/no/sole-trader/yes) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave2/hmrc-paye.prompt.txt), [response](judgements/wave2/hmrc-paye.response.json)

### ho-citizenship#eligibility.evidenceRequired.1 — British citizenship (naturalisation): `eligibility.evidenceRequired.1`

**Claim:** Passport(s) covering the qualifying period

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The text refers to documents showing you were in the UK for the required period but does not say these are passports covering the qualifying period.

**Finder searches counted (1):**

- `Guide AN naturalisation documents passport evidence of settled status gov.uk`

**Finder notes not counted as searches:**

- `GOV.UK content API: /government/publications/form-an-guidance`

**Pages recorded:**

- [www.gov.uk/apply-citizenship-indefinite-leave-to-remain](https://www.gov.uk/apply-citizenship-indefinite-leave-to-remain) — cited, in judge prompt
- [www.gov.uk/returning-resident-visa](https://www.gov.uk/returning-resident-visa) — linked in judge prompt
- [www.gov.uk/apply-citizenship-spouse](https://www.gov.uk/apply-citizenship-spouse) — linked in judge prompt
- [www.gov.uk/right-of-abode/apply-for-a-certificate-of-entitlement](https://www.gov.uk/right-of-abode/apply-for-a-certificate-of-entitlement) — linked in judge prompt
- [www.gov.uk/government/publications/form-an-guidance/form-an-guidance-accessible](https://www.gov.uk/government/publications/form-an-guidance/form-an-guidance-accessible) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave2/ho-citizenship.prompt.txt), [response](judgements/wave2/ho-citizenship.response.json)

### la-disabled-facilities-grant#eligibility.evidenceRequired.1 — Disabled Facilities Grant: `eligibility.evidenceRequired.1`

**Claim:** Quotes for proposed works

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The supplied pages discuss the work, costs, invoices and tendering but do not require applicants to submit quotes.

**Finder searches counted (1):**

- `disabled facilities grant estimates quotes proposed works site:gov.uk`

**Pages recorded:**

- [www.gov.uk/disabled-facilities-grants](https://www.gov.uk/disabled-facilities-grants) — cited, in judge prompt
- [www.gov.uk/government/publications/disabled-facilities-grant-dfg-delivery-guidance-for-local-authorities-in-england/disabled-facilities-grant-dfg-delivery-guidance-for-local-authorities-in-england](https://www.gov.uk/government/publications/disabled-facilities-grant-dfg-delivery-guidance-for-local-authorities-in-england/disabled-facilities-grant-dfg-delivery-guidance-for-local-authorities-in-england) — found in judge prompt, finder nomination

**Saved judge input and output:** [prompt](judgements/wave5/la-disabled-facilities-grant.prompt.txt), [response](judgements/wave5/la-disabled-facilities-grant.response.json)

### other-tv-licence-pension#eligibility.evidenceRequired.1 — TV Licence concession: `eligibility.evidenceRequired.1`

**Claim:** Date of birth confirmation

**Action:** 1 distinct substantive finder search(es); at least two required. Page reads and navigation notes do not count.

**Judge note:** The sources give an age threshold but do not state a date-of-birth confirmation requirement.

**Finder searches counted (1):**

- `site:tvlicensing.co.uk "free TV Licence" "date of birth" "Pension Credit"`

**Pages recorded:**

- [www.gov.uk/free-discount-tv-licence](https://www.gov.uk/free-discount-tv-licence) — cited, in judge prompt
- [www.gov.uk/tv-licence/get-a-free-or-discounted-tv-licence](https://www.gov.uk/tv-licence/get-a-free-or-discounted-tv-licence) — cited, in judge prompt
- [www.tvlicensing.co.uk/privacy-security-policies?rendermode=preview%2F1000](https://www.tvlicensing.co.uk/privacy-security-policies?rendermode=preview%2F1000) — finder nomination; not present as readable judge-prompt text

**Saved judge input and output:** [prompt](judgements/wave4/other-tv-licence-pension.prompt.txt), [response](judgements/wave4/other-tv-licence-pension.response.json)

## Excluded: never prepared or judged in Stage 3 (49)

| Field | Claim at selection | Reason |
|---|---|---|
| `la-council-tax#agentInteraction.methods` | You can apply or do this online. You can apply or do this by phone. | no_candidate_nominated |
| `la-council-tax#eligibility.evidenceRequired.0` | Tenancy agreement or proof of ownership | no_candidate_nominated |
| `la-council-tax#eligibility.evidenceRequired.1` | Move-in date | no_candidate_nominated |
| `la-disabled-facilities-grant#eligibility.evidenceRequired.3` | Proof of disability | no_candidate_nominated |
| `la-food-premises-approval#eligibility.evidenceRequired.1` | Existing food business registration | no_candidate_nominated |
| `la-free-childcare-2yr#agentInteraction.methods` | You can apply or do this in person. You can apply or do this by phone. | no_candidate_nominated |
| `la-free-childcare-2yr#eligibility.evidenceRequired.0` | Proof of qualifying benefit | no_candidate_nominated |
| `la-free-childcare-2yr#eligibility.evidenceRequired.1` | Child's date of birth | no_candidate_nominated |
| `la-free-childcare-2yr#eligibility.evidenceRequired.2` | National Insurance number | no_candidate_nominated |
| `la-house-to-house-collection-licence#eligibility.evidenceRequired.1` | Details of the charitable purpose | no_candidate_nominated |
| `la-school-place#eligibility.evidenceRequired.2` | Baptism certificate (for faith schools) | no_candidate_nominated |
| `la-send-ehc#agentInteraction.methods` | You can apply or do this by phone. You can apply or do this by post. | no_candidate_nominated |
| `la-send-ehc#eligibility.evidenceRequired.3` | Child's views if appropriate | no_candidate_nominated |
| `la-skip-permit#eligibility.evidenceRequired.1` | Skip hire company details and contact information | no_candidate_nominated |
| `la-street-collection-licence#eligibility.evidenceRequired.0` | Charity details and purpose of collection | no_candidate_nominated |
| `la-street-collection-licence#eligibility.evidenceRequired.1` | Location and timing of collection | no_candidate_nominated |
| `nhs-continuing-healthcare#agentInteraction.methods` | You can apply or do this by phone. You can apply or do this in person. | no_candidate_nominated |
| `nhs-free-prescriptions#eligibility.autoQualifiers.0` | PIP award confirmed | no_candidate_nominated |
| `nhs-healthy-start#agentInteraction.methods` | You can apply or do this online. You can apply or do this by phone. | candidate_unreadable |
| `nhs-healthy-start#eligibility.criteria.1` | Receiving Universal Credit with family take-home pay from employment of £408 a month or less; or Pension Credit including the child addition; or under 18 and pregnant (no benefit needed until the birth). Some families with no recourse to public funds and a British child under 4 can also qualify. | candidate_unreadable |
| `nhs-healthy-start#eligibility.evidenceRequired.0` | National Insurance number | candidate_unreadable |
| `nhs-healthy-start#eligibility.evidenceRequired.1` | Baby's due date (if pregnant) | candidate_unreadable |
| `nhs-healthy-start#eligibility.evidenceRequired.2` | Universal Credit statement (details must match the UC claim) | candidate_unreadable |
| `nhs-low-income-scheme#eligibility.criteria.2` | Must be ordinarily resident in the UK. | no_candidate_nominated |
| `nhs-low-income-scheme#eligibility.evidenceRequired.2` | National Insurance number | no_candidate_nominated |
| `ni-discretionary-support#eligibility.evidenceRequired.0` | Proof of benefit receipt or pending application | no_candidate_nominated |
| `ni-discretionary-support#eligibility.evidenceRequired.1` | Details of the emergency need | no_candidate_nominated |
| `ni-rate-rebate#eligibility.evidenceRequired.0` | Proof of income | no_candidate_nominated |
| `ni-rate-rebate#eligibility.evidenceRequired.1` | Rate bill | no_candidate_nominated |
| `ni-rate-rebate#eligibility.evidenceRequired.2` | Benefit confirmation letters | no_candidate_nominated |
| `opg-lpa-activation#eligibility.evidenceRequired.2` | LP4 notification form | no_candidate_nominated |
| `other-carers-leave#agentInteraction.methods` | You can apply or do this by phone. | no_candidate_nominated |
| `other-employers-liability#agentInteraction.methods` | You can apply or do this online. | no_candidate_nominated |
| `other-employers-liability#eligibility.autoQualifiers.0` | Registered as employer with HMRC PAYE | no_candidate_nominated |
| `other-help-to-buy#agentInteraction.methods` | You can apply or do this online. | no_candidate_nominated |
| `other-pupil-premium#agentInteraction.methods` | You can apply or do this by phone. | no_candidate_nominated |
| `other-statutory-redundancy#eligibility.evidenceRequired.1` | Employment contract | no_candidate_nominated |
| `other-tv-licence-pension#eligibility.evidenceRequired.0` | Pension Credit award letter | no_candidate_nominated |
| `other-warm-home-discount#agentInteraction.methods` | You can apply or do this online. | no_candidate_nominated |
| `other-warm-home-discount#eligibility.evidenceRequired.1` | Benefit confirmation letter (for Broader Group) | no_candidate_nominated |
| `slc-childcare-grant#eligibility.evidenceRequired.0` | Proof of full-time student status | no_candidate_nominated |
| `slc-student-finance#eligibility.evidenceRequired.1` | Proof of course enrollment or offer letter | no_candidate_nominated |
| `sss-best-start-foods#eligibility.evidenceRequired.0` | Proof of qualifying benefit | no_candidate_nominated |
| `sss-best-start-grant#eligibility.evidenceRequired.0` | Proof of qualifying benefit | no_candidate_nominated |
| `sss-funeral-support-payment#eligibility.evidenceRequired.0` | Death certificate | no_candidate_nominated |
| `sss-scottish-child-payment#eligibility.evidenceRequired.2` | Proof of Scottish residency | no_candidate_nominated |
| `sss-young-carer-grant#eligibility.evidenceRequired.2` | Age verification | no_candidate_nominated |
| `wg-discretionary-assistance#eligibility.criteria.2` | Must live in Wales. | no_candidate_nominated |
| `wg-winter-fuel-support#agentInteraction.methods` | You can apply or do this online. You can apply or do this by phone. | no_candidate_nominated |

## Excluded: outside the Stage 3 selection (4)

- `dwp-inherited-state-pension#eligibility.evidenceRequired.1`: Marriage or civil partnership certificate
- `dvla-cancel-licence#eligibility.evidenceRequired.1`: D27 form
- `sss-best-start-foods#eligibility.evidenceRequired.1`: Proof of pregnancy or child's age
- `ch-close-company#eligibility.exclusions.1`: Subject to legal proceedings

## Excluded: no verdict (8)

- `dwp-state-pension#financialData.rates.basic_full_weekly`
- `dvla-provisional-licence#eligibility.rules.0.value`
- `dvsa-theory-test#eligibility.rules.0.value`
- `other-disabled-railcard#financialData.rates.saving_percent`
- `ni-discretionary-support#contactInfo.phone.number`
- `lr-property-search#agentInteraction.onlineFormUrl`
- `dvsa-mot-history#agentInteraction.onlineFormUrl`
- `hmcts-find-a-will#agentInteraction.onlineFormUrl`

## Excluded: awaiting independent re-verification (2)

- `dwp-uc-health#eligibility.evidenceRequired.1`
- `hmcts-employment-tribunal#deadline`

## Approval scope

Reply with the proposal IDs you approve, or approve all 22 proposed deletions. The method decisions and excluded fields require separate source work or a schema decision; they are not included in approval of those deletions.
