# Stage 5 correction wave 2 — review before application

This is one approval page for the 14 fields marked contradicted in [Cite wave 2](../cite-02/review.md). No graph text, eligibility rules, schema or provenance has changed. The draft entries in `data/fix-proposals.json` are `accepted: false` and `verified: false`, so the application script cannot apply them. A separate session will judge each accepted new value after the changes are made.

## Decisions and scope

- **Pension Credit:** the official eligibility page includes a protected mixed-age couple route when one partner receives Housing Benefit for people over State Pension age. The current rule is an unconditional State Pension age gate. Approve the criterion only with a matching rule design; otherwise hold this item. This could widen who the graph says qualifies. The `autoQualifiers` text also assumes State Pension age has been reached.
- **Bus pass:** the current node has no nation restriction, but its summary and age rule describe England. The draft scopes the node to England and adds `nations: ['england']`; this narrows current UK-wide matching. The age-60 routes in Wales, Scotland and Northern Ireland need their own follow-up treatment.
- **Death registration:** the node describes the England and Wales local register-office process, while the judge used a broad UK/abroad landing page. The draft adds `nations: ['england', 'wales']` and corrects the five-day deadline trigger. Both need approval because they change journey eligibility and timing.
- **Making Tax Digital:** the current rule compares `annual_income >= 50000`, although HMRC says **over** £50,000 of qualifying income; it also omits landlords and exemptions. The prose correction should not be applied as a complete fix until the rule decision is made.
- **Contracts Finder:** the 2023 guidance quoted by the wave-2 judge has since been superseded for new procurement. Current guidance says notices for procurement begun from 24 February 2025 go to Find a Tender; Contracts Finder remains relevant to legacy procurement. The draft removes the unqualified publication threshold claim.

## Proposed field changes

For each entry, the evidence lines are literal spans from the saved Cite wave 2 judge prompt unless marked **current-page supplement**. A supplement has been checked in current official web guidance but still needs the project fetcher to capture it before application. The saved finder queries and full judge notes remain in [the Cite wave 2 review](../cite-02/review.md).

### 1. `sss-funeral-support-payment#eligibility.criteria.0`

**Old:** Must be responsible for arranging or paying for a funeral.

**Proposed:** You or your partner must be responsible for the funeral costs.

**Reason:** Replace “arranging or paying” with responsibility for costs.

**Evidence and judgment:**

- supported: [source](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when) — “you or your partner are responsible for the funeral costs”
- contradicted: [source](https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment) — “the client or their partner is responsible for the cost of the funeral”
  - Judge: The source requires responsibility for the costs, not merely arranging the funeral.

**Same-node copies and related changes:**

- eligibility.rules.1.label: “Must be responsible for arranging or paying for a funeral” → “Responsible for funeral costs” (rule logic unchanged)

### 2. `tpr-workplace-pension#eligibility.evidenceRequired.2`

**Old:** Letter of compliance to The Pensions Regulator (declaration of compliance within 5 months of duties start date)

**Proposed:** Declaration of compliance to The Pensions Regulator within five calendar months after the duties start date.

**Reason:** The employer submits a declaration, not a letter.

**Evidence and judgment:**

- contradicted: [source](https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/declaration-of-compliance-checklist) — “You must complete your declaration of compliance to tell us how you have met your legal duties.”
  - Judge: The required submission is a declaration of compliance; the regulator sends the employer a letter with a code.
- supported: [source](https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/declaration-of-compliance-checklist) — “You must complete your declaration with The Pensions Regulator within five calendar months after your duties start date.”

### 3. `hmcts-tax-tribunal#eligibility.summary`

**Old:** Available to anyone who has received a decision from HMRC (on income tax, VAT, PAYE, penalties, etc.) and disagrees with it. Must appeal within 30 days of the HMRC review conclusion. No filing fee for most tax appeals.

**Proposed:** You can appeal some HMRC tax decisions and penalties to the First-tier Tribunal. For direct tax, you must usually appeal to HMRC first. The tribunal appeal deadline is usually 30 days from the relevant decision or review conclusion. There is no fee to appeal.

**Reason:** Qualify the decisions and the deadline trigger.

**Evidence and judgment:**

- contradicted: [source](https://www.gov.uk/tax-tribunal) — “You can appeal to the First-tier Tribunal (Tax) if you want to challenge some decisions by: HM Revenue and Customs ( HMRC )”
  - Judge: The tribunal accepts some HMRC decisions, not every HMRC decision; direct tax cases must first be appealed to HMRC.
- supported: [source](https://www.gov.uk/tax-tribunal) — “Direct tax includes: Income Tax PAYE Tax Corporation Tax Capital Gains Tax National Insurance contributions Inheritance Tax Indirect tax includes: VAT”
- supported: [source](https://www.gov.uk/tax-tribunal) — “You may be able to appeal if HMRC : sends you an assessment for duty charges you a penalty”
- supported: [source](https://www.gov.uk/government/publications/appeal-to-the-tax-chamber-of-the-first-tier-tribunal-t242/how-to-appeal-to-the-first-tier-tax-tribunal) — “The time limit is 30 days from: the view of the matter letter – direct tax the assessment or decision – indirect tax a review conclusion letter – either indirect or direct tax”
- supported: [source](https://www.gov.uk/government/publications/appeal-to-the-tax-chamber-of-the-first-tier-tribunal-t242/how-to-appeal-to-the-first-tier-tax-tribunal) — “There is no fee for appealing to the First-tier Tribunal.”

**Same-node copies and related changes:**

- deadline: “30 days from HMRC decision” → “Usually 30 days from the relevant decision or review conclusion”
- eligibility.ruleOut.0: “Out of time — more than 30 days since decision” → “Appeal made after the applicable deadline”; confirm late appeals can still be accepted

### 4. `hmrc-mtd#eligibility.summary`

**Old:** Mandatory for all VAT-registered businesses — must keep digital records and file VAT returns via MTD-compatible software. Income Tax MTD rolls out from April 2026 for self-employed/landlords with income over £50k.

**Proposed:** VAT-registered businesses must use Making Tax Digital for VAT unless exempt or applying for an exemption; they keep digital VAT records and submit returns using compatible software. Making Tax Digital for Income Tax began on 6 April 2026 for qualifying sole traders and landlords whose 2024 to 2025 qualifying income was over £50,000.

**Reason:** Add the VAT exemption and use the current Income Tax start date and qualifying-income basis.

**Evidence and judgment:**

- contradicted: [source](https://www.gov.uk/guidance/apply-for-an-exemption-from-making-tax-digital-for-vat) — “All VAT registered businesses should now be signed up for Making Tax Digital for VAT unless you’re exempt or have applied for exemption.”
  - Judge: Exempt businesses and those applying for an exemption are exceptions to the universal claim.
- supported: [source](https://www.gov.uk/government/collections/making-tax-digital-for-vat) — “You should now keep VAT records and submit VAT Returns using compatible software.”
- supported: [source](https://www.gov.uk/government/collections/making-tax-digital-for-vat) — “You should now keep VAT records and submit VAT Returns using compatible software.”
- supported: [source](https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-sole-traders-and-landlords-step-by-step) — “From 6 April 2026, sole traders and landlords must use it if their total annual income from self-employment and property is over £50,000.”
- supported: [source](https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-sole-traders-and-landlords-step-by-step) — “have qualifying income of more than £50,000 — read more about what qualifying income is and what is included”

**Same-node copies and related changes:**

- desc: qualify VAT exemption and replace future tense for Income Tax
- eligibility.criteria.0: qualify VAT exemption and date
- agentSteps: replace “upcoming rollout” wording
- eligibility.rules: current income comparison uses >= £50,000 though official threshold is over £50,000; landlord route and exemption are not represented. Needs explicit rule decision.

### 5. `co-contracts-finder#eligibility.summary`

**Old:** Free to use for any business or organisation looking to supply goods or services to the public sector. Contracts above £12,000 (central government) or £25,000 (other public bodies) must be published here.

**Proposed:** Contracts Finder is free to use to search public contract opportunities. It remains in use for in-scope procurements begun under the previous regulations before 24 February 2025; new procurements under the Procurement Act 2023 are published on Find a Tender.

**Reason:** The old publication thresholds omitted the procurement regime transition.

**Evidence and judgment:**

- supported: [source](https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html) — “Contracts Finder is free to use.”
- partly supported: [source](https://www.gov.uk/contracts-finder) — “You can use Contracts Finder to: search for contract opportunities in different sectors”
  - Judge: The text describes searching opportunities but does not explicitly establish access for every business or organisation.
- partly supported: [source](https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html) — “central government authorities [footnote 3] , where the contract value is at least £12,000 [footnote 4] inclusive of VAT;”
  - Judge: The £12,000 threshold is stated, but publication duties are limited to in-scope procurements and may have exemptions.
- contradicted: [source](https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html) — “sub-central contracting authorities, NHS Trusts and NHS Foundation Trusts where the contract value is at least £30,000 [footnote 5] inclusive of VAT.”
  - Judge: The stated threshold for these other authorities is £30,000 including VAT, not £25,000.
- current-page supplement; project fetch pending: [source](https://www.gov.uk/government/publications/ppn-019-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder) — “This guidance only applies to procurements commenced before 24 February 2025 under the PCRs.”
- current-page supplement; project fetch pending: [source](https://www.gov.uk/government/publications/ppn-019-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder) — “Any procurements whether above or below threshold commenced from 24 February 2025 only require notices to be published on FTS.”

### 6. `la-street-collection-licence#eligibility.summary`

**Old:** Required for any charitable collection in a public street or place in England and Wales. Free to obtain. Greater London collections (outside City of London) go through the Metropolitan Police. Penalty: £200 fine for collecting without a licence.

**Proposed:** You might need a licence to collect money or sell items for charity on the street, depending on the local council. In Greater London outside the City of London, contact the Metropolitan Police. You could be fined £200 for collecting money for charity without a required licence.

**Reason:** Remove the unsupported free claim and qualify when a licence is needed.

**Evidence and judgment:**

- contradicted: [source](https://www.gov.uk/find-licences/street-collection-licence) — “If you want to collect money or sell items on the street for charity, you might need a street collection licence, depending on your local council.”
  - Judge: The page says a licence might be needed depending on the council, rather than for every collection.
- supported: [source](https://www.gov.uk/find-licences/street-collection-licence) — “In Greater London (except the City of London) you’ll need to contact the Metropolitan Police for a licence.”
- supported: [source](https://www.gov.uk/find-licences/street-collection-licence) — “You could be fined £200 if you collect money for charity without a licence.”

**Same-node copies and related changes:**

- desc: change “requires” to “may require, depending on local council”

### 7. `dwp-attendance-allowance#eligibility.criteria.0`

**Old:** Must have reached State Pension age (66 or over).

**Proposed:** Must have reached State Pension age.

**Reason:** Use the date-of-birth State Pension age test rather than 66.

**Evidence and judgment:**

- supported: [source](https://www.gov.uk/attendance-allowance) — “You can get Attendance Allowance if you’ve reached State Pension age and the following apply:”
- contradicted: [source](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) — “The State Pension age for men and women will now increase to 67 between 2026 and 2028.”
  - Judge: State Pension age is rising above 66, so being 66 is not always enough.

**Same-node copies and related changes:**

- desc: “For over-65s” → “For people who have reached State Pension age”
- eligibility.keyQuestions.0: “Are you 66 or older?” → “Have you reached State Pension age?”
- eligibility.ruleIn.0: “Aged 66 or over” → “Reached State Pension age”

### 8. `opg-lpa-activation#eligibility.criteria.0`

**Old:** A registered LPA exists and the donor has died.

**Proposed:** A registered LPA existed and its donor has died; the donor’s death must be reported to the Office of the Public Guardian.

**Reason:** Clarify this node is about reporting a donor’s death, not starting to use an LPA.

**Evidence and judgment:**

- supported: [source](https://www.gov.uk/manage-lasting-power-attorney/start-lasting-power-of-attorney) — “You must have registered the LPA before you can start acting as an attorney.”
- contradicted: [source](https://www.gov.uk/manage-lasting-power-attorney/start-lasting-power-of-attorney) — “OPG will cancel the LPA if the donor dies”
  - Judge: The source says the LPA is cancelled on the donor’s death rather than activated or used then.
- current-page supplement; project fetch pending: [source](https://www.gov.uk/manage-lasting-power-attorney/changes-you-need-to-report) — “You must tell the Office of the Public Guardian (OPG) if:”
- current-page supplement; project fetch pending: [source](https://www.gov.uk/manage-lasting-power-attorney/changes-you-need-to-report) — “the donor, or another attorney, dies”

### 9. `dwp-pension-credit#eligibility.criteria.0`

**Old:** Must have reached State Pension age (currently 66).

**Proposed:** If you are single, you must have reached State Pension age. If you have a partner, you may qualify if both of you have reached State Pension age or one of you gets Housing Benefit for people over State Pension age.

**Reason:** Remove fixed age and include the mixed-age couple exception; requires a matching rule decision.

**Evidence and judgment:**

- partly supported: [source](https://www.gov.uk/pension-credit) — “You’ll be eligible if either: you and your partner have both reached State Pension age one of you is getting Housing Benefit for people over State Pension age”
  - Judge: The general age rule has a mixed-age couple exception when one partner gets Housing Benefit for people over State Pension age.
- contradicted: [source](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) — “The State Pension age for men and women will now increase to 67 between 2026 and 2028.”
  - Judge: The age is rising in stages during 2026–2028, so it is not uniformly 66 now.

**Same-node copies and related changes:**

- eligibility.ruleIn.0: remove “(66+)”
- eligibility.rules.0: unconditional State Pension age gate does not represent the protected mixed-age couple exception; needs rule decision

### 10. `la-bus-pass#eligibility.criteria.0`

**Old:** Must have reached State Pension age (currently 66). Some disabled people may also qualify before this age.

**Proposed:** In England, you can get an older person’s bus pass when you reach State Pension age. An eligible disabled person may qualify for a separate disabled person’s pass.

**Reason:** Scope the current node to England; the age-60 routes in Wales, Scotland and Northern Ireland require separate treatment.

**Evidence and judgment:**

- contradicted: [source](https://www.gov.uk/apply-for-elderly-person-bus-pass) — “In Wales you can get a bus pass when you reach 60.”
  - Judge: The State Pension age rule applies in England, while Wales allows the pass at 60 and Scotland and Northern Ireland also use 60.
- contradicted: [source](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) — “The State Pension age for men and women will now increase to 67 between 2026 and 2028.”
  - Judge: The age is rising in stages during 2026–2028, so it is not uniformly 66 now.
- partly supported: [source](https://www.gov.uk/apply-for-disabled-bus-pass) — “You’re eligible for a disabled person’s pass if you live in England and are ‘eligible disabled’.”
  - Judge: The source confirms a disabled-person route but does not expressly state that it is available before the older-person qualifying age.

**Same-node copies and related changes:**

- desc, summary and ruleIn.0: make England scope explicit and remove “66”
- nations: add England to match existing summary and older-person State Pension age rule; this narrows current UK-wide matching
- eligibility.rules: disabled-person route is separate; determine whether to split into another node

### 11. `sss-funeral-support-payment#eligibility.criteria.2`

**Old:** The funeral must take place in the UK, and applicant must live in Scotland.

**Proposed:** You must live in Scotland. The funeral may be held in the UK or, in some circumstances, another country.

**Reason:** The funeral need not always be in the UK.

**Evidence and judgment:**

- contradicted: [source](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when) — “the funeral is being held in the UK or in some circumstances , another country”
  - Judge: The source allows a funeral in another country in some circumstances.
- supported: [source](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when) — “you live in Scotland”

**Same-node copies and related changes:**

- eligibility.rules.1.label: “Must be responsible for arranging or paying for a funeral” → “Responsible for funeral costs” (rule logic unchanged)

### 12. `dwp-bereavement-support#eligibility.criteria.1`

**Old:** Must have been under State Pension age (66) at the time of the partner's death.

**Proposed:** You must have been under State Pension age when your partner died.

**Reason:** Use State Pension age, not fixed 66.

**Evidence and judgment:**

- supported: [source](https://www.gov.uk/bereavement-support-payment) — “When your partner died, you must have been: under State Pension age”
- contradicted: [source](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) — “The State Pension age for men and women will now increase to 67 between 2026 and 2028.”
  - Judge: The age varies by date of birth during the 2026–2028 transition and is not fixed at 66.

**Same-node copies and related changes:**

- eligibility.keyQuestions.0 asks whether the deceased was under State Pension age; change subject to claimant

### 13. `gro-register-death#eligibility.criteria.0`

**Old:** A person has died in England or Wales.

**Proposed:** For this local register-office process, the death occurred in England or Wales.

**Reason:** Clarify this node covers the England and Wales process; the broad GOV.UK landing page links to other processes.

**Evidence and judgment:**

- contradicted: [source](https://www.gov.uk/register-a-death) — “Find out how to register a death in the UK or abroad.”
  - Judge: The source includes deaths elsewhere in the UK and abroad, so England or Wales is not a universal condition.
- current-page supplement; project fetch pending: [source](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/articles/deathcertificationreformenglandandwales/2025) — “death certification reform, England and Wales”
- current-page supplement; project fetch pending: [source](https://www.gov.uk/government/publications/medical-certificate-of-cause-of-death-mccd-guidance-for-medical-practitioners/guidance-for-medical-practitioners-completing-medical-certificates-of-cause-of-death-in-england-and-wales) — “By law, deaths must be registered within 5 days of receipt of the MCCD”

**Same-node copies and related changes:**

- summary: clarify England and Wales scope
- nations: add England and Wales to match local register-office process; this narrows current UK-wide matching
- deadline and eligibility.rules deadline: current 5-day clock starts at death; official guidance starts it after medical examiner confirmation or registrar receipt of MCCD. Rule trigger needs decision.

### 14. `ho-citizenship-ceremony#eligibility.criteria.1`

**Old:** Adults aged 18 and over must attend in person. Children under 18 can be included on a parent's ceremony.

**Proposed:** Adults aged 18 or over who successfully applied for British citizenship usually need to attend a ceremony; people who become citizens under the Windrush scheme may choose whether to attend. Children under 18 who applied with their parents may attend a parent’s ceremony.

**Reason:** Add the Windrush exception and qualify the child route.

**Evidence and judgment:**

- contradicted: [source](https://www.gov.uk/citizenship-ceremonies) — “If you become a British citizen under the Windrush scheme you can choose if you want to attend a citizenship ceremony.”
  - Judge: The source makes attendance optional for the Windrush scheme and also lists citizenship categories that do not require a ceremony.
- supported: [source](https://www.gov.uk/citizenship-ceremonies) — “You must take your invitation when you go to your ceremony.”
- supported: [source](https://www.gov.uk/government/publications/british-citizenship-successful-applicants/citizenship-ceremonies-guidance-notes-english-and-welsh) — “Children under 18 who have applied with their parents may attend a ceremony with other members of the family, to collect their certificate.”

**Same-node copies and related changes:**

- desc and summary: qualify “required”/“all adults” with Windrush exception
- eligibility.ruleIn.1: age alone does not establish ceremony requirement

## Approval and independent check

The primary drafts and same-node copy changes should be approved together for each affected node. The four rule and scope decisions above need explicit approval. I will apply only approved items, check the source spans mechanically, update provenance as unverified, run consistency and build checks, and give the changed text to a separate judge session. Only an imported independent judgment may confirm it.
