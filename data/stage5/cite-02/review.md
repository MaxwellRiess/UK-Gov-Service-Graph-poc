# cite-02: Cite judgment record

35 partly supported Cite candidates. Their graph values were not changed by this wave. The source finder ran at least two searches per field; the independent judge received the exported page text. The import checks every quoted span against that text.

Judge outcome from response files: 7 confirmable, 14 partly supported, 14 contradicted, 0 not confirmed.

## Result before import

See `dry-import.txt` for the pipeline tally. A field below is confirmable only when every atomic claim is supported and the import validates its quotes.

### Funeral Support Payment: `eligibility.criteria.0`

**Current text:** Must be responsible for arranging or paying for a funeral.

**Judgment:** contradicted

- **supported:** The applicant or their partner must be responsible for the funeral costs.
  - [Source](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when): “you or your partner are responsible for the funeral costs”
  - Judge note: Supported by the cited source.
- **contradicted:** Responsibility for arranging the funeral by itself is sufficient.
  - [Source](https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment): “the client or their partner is responsible for the cost of the funeral”
  - Judge note: The source requires responsibility for the costs, not merely arranging the funeral.

**Finder queries:**

- `site:mygov.scot funeral support payment who can apply responsibility funeral costs`
- `site:socialsecurity.gov.scot funeral support payment eligibility responsible cost funeral`

**Nominated pages:**

- [https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment](https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment) — States the applicant or partner must be responsible for funeral costs and it must be reasonable to accept them.
- [https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when) — Public eligibility page with the same responsibility condition.

Finder caution: Support paying/cost responsibility; arranging a funeral alone is not the stated test.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.mygov.scot/funeral-support-payment](https://www.mygov.scot/funeral-support-payment) (cited or linked)
- [https://www.mygov.scot/funeral-support-payment/person-who-died-18-or-over](https://www.mygov.scot/funeral-support-payment/person-who-died-18-or-over) (cited or linked)
- [https://www.mygov.scot/bereavement-support](https://www.mygov.scot/bereavement-support) (cited or linked)
- [https://www.mygov.scot/arrange-funeral](https://www.mygov.scot/arrange-funeral) (cited or linked)
- [https://www.mygov.scot/after-youve-applied-for-the-funeral-support-payment](https://www.mygov.scot/after-youve-applied-for-the-funeral-support-payment) (cited or linked)
- [https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment](https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment) (found by search)
- [https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when) (found by search)

</details>

### Discretionary Assistance Fund (Wales): `eligibility.criteria.1`

**Current text:** EAP: extreme financial hardship or an unexpected crisis with no other money. IAP: must get Income Support, income-based JSA, income-related ESA, Pension Credit Guarantee Credit or Universal Credit, and be leaving an institution, avoiding going into one, setting up home after an unsettled way of life, moving because of relationship breakdown or domestic abuse, or caring for a released prisoner.

**Judgment:** partly supported

- **supported:** EAP requires extreme financial hardship.
  - [Source](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility): “be in extreme financial hardship”
  - Judge note: Supported by the cited source.
- **supported:** EAP can be for an unexpected crisis leaving the applicant without money for essentials.
  - [Source](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility): “be experiencing an unexpected crisis has resulted in you not having money to buy food, gas and/or electricity or other essential items”
  - Judge note: Supported by the cited source.
- **supported:** EAP requires the applicant to have no other money.
  - [Source](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility): “have no other money for example savings”
  - Judge note: Supported by the cited source.
- **supported:** IAP requires one of Income Support, income-based JSA, income-related ESA, Pension Credit Guarantee Credit or Universal Credit.
  - [Source](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility): “You must be getting one of the following: Income Support income based Jobseekers Allowance income related Employment and Support Allowance Guaranteed Credit element of Pension Credit Universal Credit”
  - Judge note: Supported by the cited source.
- **partly supported:** IAP can be for someone leaving an institution.
  - [Source](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility): “you are leaving a care home or institution (hospital, prison or foster carer) after 3 months (minimum) to live independently”
  - Judge note: The claim omits the minimum three-month stay and independent-living condition.
- **supported:** IAP can be for someone avoiding admission to an institution.
  - [Source](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility): “you want to stay living in the community rather than having to go into an institution (hospital or care home)”
  - Judge note: Supported by the cited source.
- **supported:** IAP can be for setting up home after an unsettled way of life.
  - [Source](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility): “you are setting up home after an unsettled way of life”
  - Judge note: Supported by the cited source.
- **partly supported:** IAP can be for moving because of a relationship breakdown or domestic abuse.
  - [Source](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility): “you need to move home quickly due to a relationship breakdown or domestic violence”
  - Judge note: The source requires a quick move and says domestic violence, while the claim says domestic abuse.
- **partly supported:** IAP can be for caring for a released prisoner.
  - [Source](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility): “you are going to care for a prisoner or young offender released on a temporary license”
  - Judge note: The source limits this route to a prisoner or young offender released on a temporary licence.

**Finder queries:**

- `site:gov.wales discretionary assistance fund IAP qualifying benefits leaving institution relationship breakdown`
- `site:gov.wales discretionary assistance fund EAP extreme hardship crisis no other money eligibility`

**Nominated pages:**

- [https://www.gov.wales/discretionary-assistance-fund-daf/eligibility](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility) — Explicit EAP no-other-money tests and IAP qualifying benefits and circumstances.
- [https://www.gov.wales/discretionary-assistance-fund-daf](https://www.gov.wales/discretionary-assistance-fund-daf) — Current scheme overview.

Finder caution: Mostly supported by current eligibility page, but 'caring for a released prisoner' should say a prisoner or young offender released on temporary licence; IAP applications use approved partners.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.wales/discretionary-assistance-fund-daf](https://www.gov.wales/discretionary-assistance-fund-daf) (cited or linked)
- [https://www.gov.wales/discretionary-assistance-fund-daf/eligibility](https://www.gov.wales/discretionary-assistance-fund-daf/eligibility) (cited or linked)
- [https://www.gov.wales/communities-regeneration](https://www.gov.wales/communities-regeneration) (cited or linked)
- [https://www.gov.wales/money-and-financial-inclusion](https://www.gov.wales/money-and-financial-inclusion) (cited or linked)
- [https://www.gov.wales/apply-be-discretionary-assistance-fund-daf-network-partner](https://www.gov.wales/apply-be-discretionary-assistance-fund-daf-network-partner) (cited or linked)

</details>

### Scottish Child Payment: `eligibility.autoQualifiers.0`

**Current text:** On qualifying benefit with child under 16 in Scotland

**Judgment:** confirmable

- **supported:** The claimant must receive a qualifying benefit.
  - [Source](https://www.mygov.scot/scottish-child-payment/who-should-apply): “you or your partner are getting certain benefits or payments”
  - Judge note: Supported by the cited source.
- **supported:** The child must be under 16.
  - [Source](https://www.mygov.scot/scottish-child-payment/who-should-apply): “you or your partner are the main person looking after a child who's under 16 years old”
  - Judge note: Supported by the cited source.
- **supported:** The claimant must live in Scotland.
  - [Source](https://www.mygov.scot/scottish-child-payment/who-should-apply): “you live in Scotland”
  - Judge note: Supported by the cited source.

**Finder queries:**

- `site:mygov.scot scottish child payment who should apply qualifying benefits live Scotland under 16`
- `site:socialsecurity.gov.scot Scottish Child Payment qualifying benefits residency child age`

**Nominated pages:**

- [https://www.mygov.scot/scottish-child-payment/who-should-apply](https://www.mygov.scot/scottish-child-payment/who-should-apply) — Lists residence, qualifying benefits, main carer and age conditions.
- [https://www.socialsecurity.gov.scot/scottish-child-payment/qualifying-benefits-for-scottish-child-payment](https://www.socialsecurity.gov.scot/scottish-child-payment/qualifying-benefits-for-scottish-child-payment) — Lists accepted qualifying benefits and pending-benefit handling.

Finder caution: Claim broadly supported; note that a pending qualifying-benefit application can be lodged, but award waits for that benefit.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.mygov.scot/scottish-child-payment](https://www.mygov.scot/scottish-child-payment) (cited or linked)
- [https://www.mygov.scot/best-start-grant-best-start-foods](https://www.mygov.scot/best-start-grant-best-start-foods) (cited or linked)
- [https://www.mygov.scot/browse/benefits/children-and-family](https://www.mygov.scot/browse/benefits/children-and-family) (cited or linked)
- [https://www.mygov.scot/scottish-child-payment/who-should-apply](https://www.mygov.scot/scottish-child-payment/who-should-apply) (found by search)
- [https://www.socialsecurity.gov.scot/scottish-child-payment/qualifying-benefits-for-scottish-child-payment](https://www.socialsecurity.gov.scot/scottish-child-payment/qualifying-benefits-for-scottish-child-payment) (found by search)

</details>

### EUSS status enquiry: `agentInteraction.methods`

**Current text:** You can apply or do this online. You can apply or do this by phone.

**Judgment:** partly supported

- **supported:** You can use the UKVI help service online.
  - [Source](https://www.gov.uk/contact-ukvi-inside-outside-uk): “Use this tool to get help from UK Visas and Immigration (UKVI). You will need to answer some questions.”
  - Judge note: Supported by the cited source.
- **partly supported:** You can get UKVI help by phone.
  - [Source](https://www.gov.uk/contact-ukvi-inside-outside-uk): “These will help you find: contact details for the right UKVI team to support you”
  - Judge note: The source says the tool finds contact details but does not explicitly say those details include a phone route.

**Finder queries:**

- `site:gov.uk EU Settlement Scheme resolution centre webchat phone get help`
- `site:gov.uk ask a question about applying for settled status online form`

**Nominated pages:**

- [https://www.gov.uk/settled-status-eu-citizens-families/applying-for-settled-status](https://www.gov.uk/settled-status-eu-citizens-families/applying-for-settled-status) — Get help section offers UKVI webchat and telephone.
- [https://www.gov.uk/help-eu-settlement-scheme](https://www.gov.uk/help-eu-settlement-scheme) — Help page points to UKVI contact routes.

Finder caution: Online webchat and phone enquiry are supported; distinguish enquiry from applying to the scheme.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/contact-ukvi-inside-outside-uk](https://www.gov.uk/contact-ukvi-inside-outside-uk) (cited or linked)
- [https://www.gov.uk/settled-status-eu-citizens-families/applying-for-settled-status](https://www.gov.uk/settled-status-eu-citizens-families/applying-for-settled-status) (found by search)
- [https://www.gov.uk/help-eu-settlement-scheme](https://www.gov.uk/help-eu-settlement-scheme) (found by search)

</details>

### Best Start Grant: `agentInteraction.methods`

**Current text:** You can apply or do this online. You can apply or do this by phone.

**Judgment:** confirmable

- **supported:** You can apply online.
  - [Source](https://www.mygov.scot/best-start-grant-best-start-foods/how-to-apply): “Apply online Most people take around 10 to 20 minutes to complete the form”
  - Judge note: Supported by the cited source.
- **supported:** You can apply by phone.
  - [Source](https://www.mygov.scot/best-start-grant-best-start-foods/how-to-apply): “Call Social Security Scotland free on 0800 182 2222 to make your application over the phone.”
  - Judge note: Supported by the cited source.

**Finder queries:**

- `site:mygov.scot Best Start Grant how to apply by phone online`
- `site:socialsecurity.gov.scot Best Start Grant phone application 0800 182 2222`

**Nominated pages:**

- [https://www.mygov.scot/best-start-grant-best-start-foods/how-to-apply](https://www.mygov.scot/best-start-grant-best-start-foods/how-to-apply) — Explicit online, phone and postal application routes; phone number is for applications.

Finder caution: Supported by the current service owner's application page.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.mygov.scot/best-start-grant-best-start-foods](https://www.mygov.scot/best-start-grant-best-start-foods) (cited or linked)
- [https://www.mygov.scot/best-start-grant-best-start-foods/best-start-apply](https://www.mygov.scot/best-start-grant-best-start-foods/best-start-apply) (cited or linked)
- [https://www.mygov.scot/best-start-grant-best-start-foods/how-to-apply](https://www.mygov.scot/best-start-grant-best-start-foods/how-to-apply) (found by search)

</details>

### Workplace Pension auto-enrollment: `eligibility.evidenceRequired.2`

**Current text:** Letter of compliance to The Pensions Regulator (declaration of compliance within 5 months of duties start date)

**Judgment:** contradicted

- **contradicted:** Employers must send a letter of compliance to The Pensions Regulator.
  - [Source](https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/declaration-of-compliance-checklist): “You must complete your declaration of compliance to tell us how you have met your legal duties.”
  - Judge note: The required submission is a declaration of compliance; the regulator sends the employer a letter with a code.
- **supported:** The declaration of compliance must be completed within five months of the duties start date.
  - [Source](https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/declaration-of-compliance-checklist): “You must complete your declaration with The Pensions Regulator within five calendar months after your duties start date.”
  - Judge note: Supported by the cited source.

**Finder queries:**

- `site:thepensionsregulator.gov.uk declare compliance five months duties start date`
- `site:thepensionsregulator.gov.uk declaration compliance checklist first declaration employer`

**Nominated pages:**

- [https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance](https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance) — Direct instruction to declare within five months of duties start date.
- [https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/declaration-of-compliance-checklist](https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/declaration-of-compliance-checklist) — Says declaration is made to the regulator within five calendar months.

Finder caution: Deadline and declaration supported; 'letter of compliance' is inaccurate wording, as the employer completes a declaration online.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/workplace-pensions-employers](https://www.gov.uk/workplace-pensions-employers) (cited or linked)
- [https://www.gov.uk/workplace-pensions](https://www.gov.uk/workplace-pensions) (cited or linked)
- [https://www.gov.uk/employers-workplace-pensions-rules](https://www.gov.uk/employers-workplace-pensions-rules) (cited or linked)
- [https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance](https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance) (found by search)
- [https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/declaration-of-compliance-checklist](https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/declaration-of-compliance-checklist) (found by search)

</details>

### Oil and LPG heating payment (Wales): `eligibility.summary`

**Current text:** One-off £200 payment (launched 31 March 2026) for low-income households in Wales who use heating oil or LPG and are on the Council Tax Reduction Scheme. Local authorities contact eligible households and invite them to apply; claims close 30 September 2026, 6 months after launch. People in severe hardship who do not qualify can apply to the Discretionary Assistance Fund.

**Judgment:** partly supported

- **supported:** The scheme pays a one-off £200.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “eligible for a one-off £200 payment”
  - Judge note: Supported by the cited source.
- **supported:** Eligible households must have low incomes.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “People on low incomes who use heating oil or liquid petroleum gas (LPG) will be eligible for a one-off £200 payment if they are on the Council Tax Reduction Scheme.”
  - Judge note: Supported by the cited source.
- **supported:** The scheme is for households in Wales.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “Thousands of Welsh households to get help with oil and LPG heating costs”
  - Judge note: Supported by the cited source.
- **supported:** Eligible households use heating oil or LPG.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “use heating oil or liquid petroleum gas (LPG)”
  - Judge note: Supported by the cited source.
- **supported:** Eligible households are on the Council Tax Reduction Scheme.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “if they are on the Council Tax Reduction Scheme.”
  - Judge note: Supported by the cited source.
- **not stated:** The scheme launched on 31 March 2026.
  - Judge note: The source gives 31 March 2026 as the press release publication date, not the scheme launch date.
- **supported:** Local authorities contact eligible households and invite them to apply.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “Local authorities will contact eligible households directly and invite them to apply.”
  - Judge note: Supported by the cited source.
- **not stated:** Claims close on 30 September 2026.
  - Judge note: The source gives no closing date because it does not state the launch date.
- **supported:** Households have six months after launch to claim.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “There are 6 months from the scheme's launch to claim.”
  - Judge note: Supported by the cited source.
- **supported:** People in severe hardship who do not qualify can apply to the Discretionary Assistance Fund.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “Those in severe financial hardship who do not qualify can apply to the Discretionary Assistance Fund .”
  - Judge note: Supported by the cited source.

**Finder queries:**

- `site:gov.wales winter fuel support heating oil LPG launched 31 March 2026 six months`
- `site:gov.wales winter fuel support closing 30 September 2026 launch date`

**Nominated pages:**

- [https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs) — Official scheme announcement says £200, qualifying fuel and reduction, council invitation and six months from launch.

Finder caution: 31 March is the publication date, not an explicit launch date; 30 September closing date is inferred, not stated. Avoid those exact dates unless another official page states them.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs) (cited or linked)
- [https://www.gov.wales/help-cost-living](https://www.gov.wales/help-cost-living) (cited or linked)
- [https://www.gov.wales/announcements/search](https://www.gov.wales/announcements/search) (cited or linked)
- [https://www.gov.wales/money-and-financial-inclusion](https://www.gov.wales/money-and-financial-inclusion) (cited or linked)

</details>

### Apply for a proxy vote: `eligibility.summary`

**Current text:** Available to registered voters who cannot attend a polling station on election day (due to work, illness, being abroad, disability, etc.). The proxy must be a registered UK voter. Deadline is 6 working days before the election for standard proxy; emergency proxy available up to 5pm on polling day.

**Judgment:** partly supported

- **supported:** A voter must be registered to vote to apply for a proxy vote.
  - [Source](https://www.gov.uk/apply-proxy-vote): “You and your proxy must both be registered to vote in the UK before you can apply.”
  - Judge note: Supported by the cited source.
- **supported:** Proxy voting is available when a voter cannot attend a polling station in person.
  - [Source](https://www.gov.uk/apply-proxy-vote): “You can get someone else to vote on your behalf (a proxy) if you cannot go to the polling station in person.”
  - Judge note: Supported by the cited source.
- **supported:** Being away for work can be a reason for a proxy vote.
  - [Source](https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/apply-vote-proxy): “You are away for work (PDF)”
  - Judge note: Supported by the cited source.
- **supported:** Illness can be a reason for a proxy vote.
  - [Source](https://www.gov.uk/how-to-vote/voting-from-abroad): “having a medical issue or disability”
  - Judge note: Supported by the cited source.
- **supported:** Being abroad can be a reason for a proxy vote.
  - [Source](https://www.gov.uk/apply-proxy-vote): “If you want to vote by proxy and you live abroad, apply for a proxy vote as soon as possible.”
  - Judge note: Supported by the cited source.
- **supported:** Disability can be a reason for a proxy vote.
  - [Source](https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/apply-vote-proxy): “You have a disability (PDF)”
  - Judge note: Supported by the cited source.
- **supported:** The proxy must be a registered UK voter.
  - [Source](https://www.gov.uk/apply-proxy-vote): “You and your proxy must both be registered to vote in the UK before you can apply.”
  - Judge note: Supported by the cited source.
- **partly supported:** The standard proxy deadline is six working days before the election.
  - [Source](https://www.gov.uk/how-to-vote/voting-from-abroad): “You must apply by: 5pm, 6 working days before election day in England, Scotland or Wales 5pm, 14 working days before election day in Northern Ireland”
  - Judge note: The six-working-day deadline is for England, Scotland and Wales; Northern Ireland has a 14-working-day deadline.
- **supported:** An emergency proxy can be requested after the standard deadline.
  - [Source](https://www.gov.uk/how-to-vote/voting-from-abroad): “If the proxy vote deadline has passed you may be able to apply for an emergency proxy vote”
  - Judge note: Supported by the cited source.
- **partly supported:** An emergency proxy can be requested until 5pm on polling day.
  - [Source](https://www.gov.uk/how-to-vote/voting-from-abroad): “In England, Scotland and Wales, you have until 5pm on the day of the election to apply.”
  - Judge note: The 5pm election-day deadline applies in England, Scotland and Wales, while Northern Ireland does not offer an emergency proxy.

**Finder queries:**

- `site:gov.uk apply vote by proxy work illness disability abroad six working days`
- `site:electoralcommission.org.uk vote by proxy reasons work illness disability abroad emergency 5pm`

**Nominated pages:**

- [https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/how-vote-proxy](https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/how-vote-proxy) — Service-owner voting guidance explains proxy voting and reasons.
- [https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/apply-vote-proxy](https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/apply-vote-proxy) — Application page states ordinary six-working-day deadline.
- [https://www.gov.uk/how-to-vote/voting-from-abroad](https://www.gov.uk/how-to-vote/voting-from-abroad) — Explicit temporary-abroad route.

Finder caution: Reasons are supported, but some standing proxy routes require a reason and emergency proxy eligibility is narrower than simply being unable to attend.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/apply-proxy-vote](https://www.gov.uk/apply-proxy-vote) (cited or linked)
- [https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/how-vote-proxy](https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/how-vote-proxy) (found by search)
- [https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/apply-vote-proxy](https://www.electoralcommission.org.uk/voting-and-elections/ways-vote/apply-vote-proxy) (found by search)
- [https://www.gov.uk/how-to-vote/voting-from-abroad](https://www.gov.uk/how-to-vote/voting-from-abroad) (found by search)

</details>

### Appeal to Tax Tribunal: `eligibility.summary`

**Current text:** Available to anyone who has received a decision from HMRC (on income tax, VAT, PAYE, penalties, etc.) and disagrees with it. Must appeal within 30 days of the HMRC review conclusion. No filing fee for most tax appeals.

**Judgment:** contradicted

- **contradicted:** Anyone who disagrees with any HMRC decision can appeal to the tax tribunal.
  - [Source](https://www.gov.uk/tax-tribunal): “You can appeal to the First-tier Tribunal (Tax) if you want to challenge some decisions by: HM Revenue and Customs ( HMRC )”
  - Judge note: The tribunal accepts some HMRC decisions, not every HMRC decision; direct tax cases must first be appealed to HMRC.
- **supported:** Income Tax, VAT and PAYE decisions can be appealed.
  - [Source](https://www.gov.uk/tax-tribunal): “Direct tax includes: Income Tax PAYE Tax Corporation Tax Capital Gains Tax National Insurance contributions Inheritance Tax Indirect tax includes: VAT”
  - Judge note: Supported by the cited source.
- **supported:** Some HMRC penalties can be appealed.
  - [Source](https://www.gov.uk/tax-tribunal): “You may be able to appeal if HMRC : sends you an assessment for duty charges you a penalty”
  - Judge note: Supported by the cited source.
- **supported:** An appeal following an HMRC review conclusion must be made within 30 days.
  - [Source](https://www.gov.uk/government/publications/appeal-to-the-tax-chamber-of-the-first-tier-tribunal-t242/how-to-appeal-to-the-first-tier-tax-tribunal): “The time limit is 30 days from: the view of the matter letter – direct tax the assessment or decision – indirect tax a review conclusion letter – either indirect or direct tax”
  - Judge note: Supported by the cited source.
- **supported:** There is no filing fee for most tax tribunal appeals.
  - [Source](https://www.gov.uk/government/publications/appeal-to-the-tax-chamber-of-the-first-tier-tribunal-t242/how-to-appeal-to-the-first-tier-tax-tribunal): “There is no fee for appealing to the First-tier Tribunal.”
  - Judge note: Supported by the cited source.

**Finder queries:**

- `site:gov.uk tax appeals overview certain decisions HMRC tribunal`
- `site:gov.uk appeal tax tribunal after HMRC review conclusion 30 days no fee`

**Nominated pages:**

- [https://www.gov.uk/tax-appeals/overview](https://www.gov.uk/tax-appeals/overview) — Says only certain HMRC decisions and penalties can be challenged.
- [https://www.gov.uk/tax-appeals/review-of-a-tax-or-penalty-decision](https://www.gov.uk/tax-appeals/review-of-a-tax-or-penalty-decision) — States usual 30 days after review result.
- [https://www.gov.uk/government/publications/appeal-to-the-tax-chamber-of-the-first-tier-tribunal-t242/how-to-appeal-to-the-first-tier-tax-tribunal](https://www.gov.uk/government/publications/appeal-to-the-tax-chamber-of-the-first-tier-tribunal-t242/how-to-appeal-to-the-first-tier-tax-tribunal) — Says no fee for an appeal to the First-tier Tax Tribunal.

Finder caution: 'Anyone who has received a decision' is too broad. Only certain appealable HMRC decisions qualify; no first-tier appeal fee, not merely 'most'.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/tax-tribunal](https://www.gov.uk/tax-tribunal) (cited or linked)
- [https://www.gov.uk/guidance/tax-disputes-alternative-dispute-resolution-adr](https://www.gov.uk/guidance/tax-disputes-alternative-dispute-resolution-adr) (cited or linked)
- [https://www.gov.uk/tax-appeals/review-of-a-tax-or-penalty-decision](https://www.gov.uk/tax-appeals/review-of-a-tax-or-penalty-decision) (cited or linked)
- [https://www.gov.uk/tax-appeals/decision](https://www.gov.uk/tax-appeals/decision) (cited or linked)
- [https://www.gov.uk/tax-appeals/overview](https://www.gov.uk/tax-appeals/overview) (found by search)
- [https://www.gov.uk/government/publications/appeal-to-the-tax-chamber-of-the-first-tier-tribunal-t242/how-to-appeal-to-the-first-tier-tax-tribunal](https://www.gov.uk/government/publications/appeal-to-the-tax-chamber-of-the-first-tier-tribunal-t242/how-to-appeal-to-the-first-tier-tax-tribunal) (found by search)

</details>

### Making Tax Digital enrolment: `eligibility.summary`

**Current text:** Mandatory for all VAT-registered businesses — must keep digital records and file VAT returns via MTD-compatible software. Income Tax MTD rolls out from April 2026 for self-employed/landlords with income over £50k.

**Judgment:** contradicted

- **contradicted:** Making Tax Digital for VAT is mandatory for all VAT-registered businesses.
  - [Source](https://www.gov.uk/guidance/apply-for-an-exemption-from-making-tax-digital-for-vat): “All VAT registered businesses should now be signed up for Making Tax Digital for VAT unless you’re exempt or have applied for exemption.”
  - Judge note: Exempt businesses and those applying for an exemption are exceptions to the universal claim.
- **supported:** VAT businesses covered by Making Tax Digital must keep digital VAT records.
  - [Source](https://www.gov.uk/government/collections/making-tax-digital-for-vat): “You should now keep VAT records and submit VAT Returns using compatible software.”
  - Judge note: Supported by the cited source.
- **supported:** VAT businesses covered by Making Tax Digital must submit VAT returns through compatible software.
  - [Source](https://www.gov.uk/government/collections/making-tax-digital-for-vat): “You should now keep VAT records and submit VAT Returns using compatible software.”
  - Judge note: Supported by the cited source.
- **supported:** Making Tax Digital for Income Tax begins in April 2026 for qualifying sole traders and landlords.
  - [Source](https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-sole-traders-and-landlords-step-by-step): “From 6 April 2026, sole traders and landlords must use it if their total annual income from self-employment and property is over £50,000.”
  - Judge note: Supported by the cited source.
- **supported:** The Income Tax threshold is more than £50,000 of self-employment or property income.
  - [Source](https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-sole-traders-and-landlords-step-by-step): “have qualifying income of more than £50,000 — read more about what qualifying income is and what is included”
  - Judge note: Supported by the cited source.

**Finder queries:**

- `site:gov.uk Making Tax Digital VAT exemption all VAT registered businesses`
- `site:gov.uk Making Tax Digital Income Tax April 2026 £50000 sole traders landlords`

**Nominated pages:**

- [https://www.gov.uk/guidance/apply-for-an-exemption-from-making-tax-digital-for-vat](https://www.gov.uk/guidance/apply-for-an-exemption-from-making-tax-digital-for-vat) — Explicit exemptions to the general VAT MTD rule.
- [https://www.gov.uk/government/collections/making-tax-digital-for-income-tax](https://www.gov.uk/government/collections/making-tax-digital-for-income-tax) — Current 6 April 2026 Income Tax threshold and affected people.

Finder caution: 'All VAT-registered' is false because exemptions exist; Income Tax threshold should use qualifying income, not generic income.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/government/collections/making-tax-digital-for-vat](https://www.gov.uk/government/collections/making-tax-digital-for-vat) (cited or linked)
- [https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-sole-traders-and-landlords-step-by-step](https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-sole-traders-and-landlords-step-by-step) (cited or linked)
- [https://www.gov.uk/guidance/work-out-your-qualifying-income-for-making-tax-digital-for-income-tax](https://www.gov.uk/guidance/work-out-your-qualifying-income-for-making-tax-digital-for-income-tax) (cited or linked)
- [https://www.gov.uk/guidance/check-what-to-do-if-hmrc-has-signed-you-up-for-making-tax-digital-for-income-tax](https://www.gov.uk/guidance/check-what-to-do-if-hmrc-has-signed-you-up-for-making-tax-digital-for-income-tax) (cited or linked)
- [https://www.gov.uk/self-assessment-tax-returns/sending-return](https://www.gov.uk/self-assessment-tax-returns/sending-return) (cited or linked)
- [https://www.gov.uk/guidance/apply-for-an-exemption-from-making-tax-digital-for-vat](https://www.gov.uk/guidance/apply-for-an-exemption-from-making-tax-digital-for-vat) (found by search)
- [https://www.gov.uk/government/collections/making-tax-digital-for-income-tax](https://www.gov.uk/government/collections/making-tax-digital-for-income-tax) (found by search)

</details>

### Find an Energy Performance Certificate: `eligibility.summary`

**Current text:** EPCs are required by law when a property is sold or let. Buyers, tenants and homeowners can search the register for free. Landlords renting property in England and Wales must have an EPC rating of E or above.

**Judgment:** partly supported

- **partly supported:** An EPC is legally required when a property is sold or let.
  - [Source](https://www.gov.uk/selling-a-home): “You must have an EPC when you’re: selling a property renting out a property building a new property”
  - Judge note: The source states the general requirement but also lists buildings and circumstances that do not need an EPC.
- **supported:** Buyers can search for an EPC for free.
  - [Source](https://www.gov.uk/selling-a-home): “Use the find an energy certificate service to check if your property has a valid EPC and download it for free.”
  - Judge note: The service allows a free EPC check and download.
- **supported:** Tenants can search for an EPC for free.
  - [Source](https://www.gov.uk/selling-a-home): “Use the find an energy certificate service to check if your property has a valid EPC and download it for free.”
  - Judge note: The service allows a free EPC check and download.
- **supported:** Homeowners can search for an EPC for free.
  - [Source](https://www.gov.uk/selling-a-home): “Use the find an energy certificate service to check if your property has a valid EPC and download it for free.”
  - Judge note: The service allows a free EPC check and download.
- **partly supported:** Landlords renting property in England and Wales must have an EPC rating of E or above.
  - [Source](https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance): “Since 1 April 2020, landlords can no longer let or continue to let properties covered by the MEES Regulations if they have an EPC rating below E, unless they have a valid exemption in place.”
  - Judge note: The E minimum applies to covered domestic private rented properties and allows valid exemptions, not every rental property.

**Finder queries:**

- `site:gov.uk find energy certificate search postcode buyers tenants free`
- `site:gov.uk EPC seller landlord show buyer tenant minimum E private rented exemptions`

**Nominated pages:**

- [https://www.gov.uk/find-energy-certificate](https://www.gov.uk/find-energy-certificate) — Public register search by postcode, street/town or certificate number.
- [https://www.gov.uk/selling-a-home/energy-performance-certificates](https://www.gov.uk/selling-a-home/energy-performance-certificates) — Says EPC is shown to buyer or tenant and can be downloaded for free.
- [https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance](https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance) — Minimum E standard with exemptions.

Finder caution: Public search is supported. Minimum E is not absolute: registered exemptions can permit letting below E.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/find-energy-certificate](https://www.gov.uk/find-energy-certificate) (cited or linked)
- [https://www.gov.uk/selling-a-home](https://www.gov.uk/selling-a-home) (cited or linked)
- [https://www.gov.uk/get-new-energy-certificate](https://www.gov.uk/get-new-energy-certificate) (cited or linked)
- [https://www.gov.uk/selling-a-home/energy-performance-certificates](https://www.gov.uk/selling-a-home/energy-performance-certificates) (found by search)
- [https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance](https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance) (found by search)

</details>

### Scottish Child Payment: `eligibility.summary`

**Current text:** £28.20/week per child under 16 for the main person looking after the child in Scotland, if they or their partner get a qualifying benefit (Universal Credit, income-based JSA, Pension Credit, Income Support or income-related ESA). Child Benefit alone does not qualify.

**Judgment:** partly supported

- **supported:** Scottish Child Payment is £28.20 per week for each eligible child.
  - [Source](https://www.mygov.scot/scottish-child-payment): “It's a weekly payment of £28.20 that you can get for every child you look after who's under 16 years of age.”
  - Judge note: Supported by the cited source.
- **supported:** The child must be under 16.
  - [Source](https://www.mygov.scot/scottish-child-payment): “every child you look after who's under 16 years of age”
  - Judge note: Supported by the cited source.
- **supported:** The claimant or their partner must be the main person looking after the child.
  - [Source](https://www.mygov.scot/scottish-child-payment/who-should-apply): “you or your partner are the main person looking after a child who's under 16 years old”
  - Judge note: Supported by the cited source.
- **supported:** The claimant must live in Scotland.
  - [Source](https://www.mygov.scot/scottish-child-payment/who-should-apply): “you live in Scotland”
  - Judge note: Supported by the cited source.
- **supported:** Universal Credit, income-based JSA, Pension Credit, Income Support and income-related ESA are qualifying benefits.
  - [Source](https://www.mygov.scot/scottish-child-payment/who-should-apply): “Universal Credit income-based Jobseeker's Allowance (JSA) Social Security Scotland also accept claims if you alone are named on one of these benefits: Pension Credit Income Support income-related Employment and Support Allowance (ESA)”
  - Judge note: Supported by the cited source.
- **partly supported:** The applicant or their partner can be named on any of those qualifying benefits.
  - [Source](https://www.mygov.scot/scottish-child-payment/who-should-apply): “If your partner is named on any of the above 3 benefits and you are not, your partner should apply.”
  - Judge note: For Pension Credit, Income Support and income-related ESA, the named partner should apply instead.
- **supported:** Child Benefit alone does not qualify.
  - [Source](https://www.mygov.scot/scottish-child-payment/who-should-apply): “Child benefit on its own is not an accepted benefit for Scottish Child Payment.”
  - Judge note: Supported by the cited source.

**Finder queries:**

- `site:mygov.scot Scottish Child Payment main person looking after child who should apply`
- `site:socialsecurity.gov.scot Scottish Child Payment double claims main carer payment`

**Nominated pages:**

- [https://www.mygov.scot/scottish-child-payment/who-should-apply](https://www.mygov.scot/scottish-child-payment/who-should-apply) — Explicitly says applicant or partner must be main person looking after child.
- [https://www.mygov.scot/scottish-child-payment](https://www.mygov.scot/scottish-child-payment) — Amount, frequency and one-recipient/double-claim process.

Finder caution: Main-carer condition is supported, but double claims are decided by a separate process; do not imply main carer automatically gets the payment.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.mygov.scot/scottish-child-payment](https://www.mygov.scot/scottish-child-payment) (cited or linked)
- [https://www.mygov.scot/best-start-grant-best-start-foods](https://www.mygov.scot/best-start-grant-best-start-foods) (cited or linked)
- [https://www.mygov.scot/browse/benefits/children-and-family](https://www.mygov.scot/browse/benefits/children-and-family) (cited or linked)
- [https://www.mygov.scot/scottish-child-payment/who-should-apply](https://www.mygov.scot/scottish-child-payment/who-should-apply) (found by search)
- [https://www.socialsecurity.gov.scot/scottish-child-payment/qualifying-benefits-for-scottish-child-payment](https://www.socialsecurity.gov.scot/scottish-child-payment/qualifying-benefits-for-scottish-child-payment) (found by search)

</details>

### Contracts Finder: `eligibility.summary`

**Current text:** Free to use for any business or organisation looking to supply goods or services to the public sector. Contracts above £12,000 (central government) or £25,000 (other public bodies) must be published here.

**Judgment:** contradicted

- **supported:** Contracts Finder is free to use.
  - [Source](https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html): “Contracts Finder is free to use.”
  - Judge note: The guidance explicitly says it is free.
- **partly supported:** Any business or organisation can use Contracts Finder to seek public sector supply opportunities.
  - [Source](https://www.gov.uk/contracts-finder): “You can use Contracts Finder to: search for contract opportunities in different sectors”
  - Judge note: The text describes searching opportunities but does not explicitly establish access for every business or organisation.
- **partly supported:** Central government contracts above £12,000 must be published on Contracts Finder.
  - [Source](https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html): “central government authorities [footnote 3] , where the contract value is at least £12,000 [footnote 4] inclusive of VAT;”
  - Judge note: The £12,000 threshold is stated, but publication duties are limited to in-scope procurements and may have exemptions.
- **contradicted:** Contracts above £25,000 from other public bodies must be published on Contracts Finder.
  - [Source](https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html): “sub-central contracting authorities, NHS Trusts and NHS Foundation Trusts where the contract value is at least £30,000 [footnote 5] inclusive of VAT.”
  - Judge note: The stated threshold for these other authorities is £30,000 including VAT, not £25,000.

**Finder queries:**

- `site:gov.uk Contracts Finder free to use suppliers search`
- `site:gov.uk Contracts Finder publication thresholds central government 12000 other public bodies 25000 2026`

**Nominated pages:**

- [https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html](https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html) — Explicitly free to use and gives publication thresholds.
- [https://www.data.gov.uk/collections/government-and-parliament/contracts-finder](https://www.data.gov.uk/collections/government-and-parliament/contracts-finder) — Government collection says free to search without an account.

Finder caution: Free is supported. Current cited PPN says sub-central threshold £30,000 including VAT, so £25,000 appears outdated; publication rules also have scope/exceptions.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/contracts-finder](https://www.gov.uk/contracts-finder) (cited or linked)
- [https://www.gov.uk/tendering-for-public-sector-contracts](https://www.gov.uk/tendering-for-public-sector-contracts) (cited or linked)
- [https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html](https://www.gov.uk/government/publications/ppn-0123-requirements-to-publish-on-contracts-finder/guidance-on-the-transparency-requirements-for-publishing-on-contracts-finder-html) (found by search)
- [https://www.data.gov.uk/collections/government-and-parliament/contracts-finder](https://www.data.gov.uk/collections/government-and-parliament/contracts-finder) (found by search)

</details>

### Street collection licence: `eligibility.summary`

**Current text:** Required for any charitable collection in a public street or place in England and Wales. Free to obtain. Greater London collections (outside City of London) go through the Metropolitan Police. Penalty: £200 fine for collecting without a licence.

**Judgment:** contradicted

- **contradicted:** Every charitable collection in a public street or place in England and Wales needs a street collection licence.
  - [Source](https://www.gov.uk/find-licences/street-collection-licence): “If you want to collect money or sell items on the street for charity, you might need a street collection licence, depending on your local council.”
  - Judge note: The page says a licence might be needed depending on the council, rather than for every collection.
- **not stated:** A street collection licence is free to obtain.
  - Judge note: Neither source states a fee or says the licence is free.
- **supported:** Greater London collections outside the City of London go through the Metropolitan Police.
  - [Source](https://www.gov.uk/find-licences/street-collection-licence): “In Greater London (except the City of London) you’ll need to contact the Metropolitan Police for a licence.”
  - Judge note: The source identifies the Metropolitan Police route and the City of London exception.
- **supported:** Collecting for charity without a licence can lead to a £200 fine.
  - [Source](https://www.gov.uk/find-licences/street-collection-licence): “You could be fined £200 if you collect money for charity without a licence.”
  - Judge note: The source states the possible £200 fine.

**Finder queries:**

- `site:gov.uk/find-licences/street-collection-licence may need licence council £200`
- `site:met.police.uk street collection permit Greater London charity public street`

**Nominated pages:**

- [https://www.gov.uk/find-licences/street-collection-licence](https://www.gov.uk/find-licences/street-collection-licence) — States licence may be needed depending on council, metropolitan route and £200 fine.
- [https://www.met.police.uk/advice/advice-and-information/cc/charity-collection-licensing/street-collection-permit/](https://www.met.police.uk/advice/advice-and-information/cc/charity-collection-licensing/street-collection-permit/) — Metropolitan Police permit guidance and exceptions.

Finder caution: 'Required for any' is overbroad; GOV.UK says local council determines need. No free-fee claim on this page, so keep that separate unless sourced.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/find-licences/street-collection-licence](https://www.gov.uk/find-licences/street-collection-licence) (cited or linked)
- [https://www.met.police.uk/advice/advice-and-information/cc/charity-collection-licensing/street-collection-permit/](https://www.met.police.uk/advice/advice-and-information/cc/charity-collection-licensing/street-collection-permit/) (found by search)

</details>

### Oil and LPG heating payment (Wales): `desc`

**Current text:** One-off £200 for households in Wales that heat with oil or LPG and get Council Tax Reduction. Councils contact eligible households; claims close 30 September 2026, 6 months after the scheme launched on 31 March 2026. Replaces the closed Winter Fuel Support Scheme.

**Judgment:** partly supported

- **supported:** The scheme pays a one-off £200.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “eligible for a one-off £200 payment”
  - Judge note: Supported by the cited source.
- **supported:** Eligible households must have low incomes.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “People on low incomes who use heating oil or liquid petroleum gas (LPG) will be eligible for a one-off £200 payment if they are on the Council Tax Reduction Scheme.”
  - Judge note: Supported by the cited source.
- **supported:** The scheme is for households in Wales.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “Thousands of Welsh households to get help with oil and LPG heating costs”
  - Judge note: Supported by the cited source.
- **supported:** Eligible households use heating oil or LPG.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “use heating oil or liquid petroleum gas (LPG)”
  - Judge note: Supported by the cited source.
- **supported:** Eligible households are on the Council Tax Reduction Scheme.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “if they are on the Council Tax Reduction Scheme.”
  - Judge note: Supported by the cited source.
- **not stated:** The scheme launched on 31 March 2026.
  - Judge note: The source gives 31 March 2026 as the press release publication date, not the scheme launch date.
- **supported:** Local authorities contact eligible households and invite them to apply.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “Local authorities will contact eligible households directly and invite them to apply.”
  - Judge note: Supported by the cited source.
- **not stated:** Claims close on 30 September 2026.
  - Judge note: The source gives no closing date because it does not state the launch date.
- **supported:** Households have six months after launch to claim.
  - [Source](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs): “There are 6 months from the scheme's launch to claim.”
  - Judge note: Supported by the cited source.
- **not stated:** This scheme replaces the closed Winter Fuel Support Scheme.
  - Judge note: The supplied text does not mention the Winter Fuel Support Scheme or a replacement.

**Finder queries:**

- `site:gov.wales winter fuel oil LPG 2026 30 September claims close`
- `site:gov.wales winter fuel support launch six months 31 March 2026`

**Nominated pages:**

- [https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs) — Official release states six months from launch and the £200 offer, but no exact deadline.

Finder caution: 30 September 2026 and launch on 31 March are not explicit on this page; they are calculations from a publication date. Also verify 'replaces Winter Fuel Support Scheme' separately.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs](https://www.gov.wales/thousands-welsh-households-get-help-oil-and-lpg-heating-costs) (cited or linked)
- [https://www.gov.wales/help-cost-living](https://www.gov.wales/help-cost-living) (cited or linked)
- [https://www.gov.wales/announcements/search](https://www.gov.wales/announcements/search) (cited or linked)
- [https://www.gov.wales/money-and-financial-inclusion](https://www.gov.wales/money-and-financial-inclusion) (cited or linked)

</details>

### Council Tax registration: `desc`

**Current text:** Register at new address and close account at old. Various discounts may apply.

**Judgment:** partly supported

- **supported:** You must register for Council Tax at a new address.
  - [Source](https://www.gov.uk/guidance/start-paying-council-tax): “If you move to a new property or to a new area, tell your local council or tell the council for the new area you’ve moved to.”
  - Judge note: The national guidance directs movers to notify a council, which registers them and sends a bill.
- **partly supported:** You must close your Council Tax account at your old address.
  - [Source](https://www.leeds.gov.uk/council-tax/report-a-change/register-for-council-tax-or-change-your-address): “We will close your Leeds council tax account and issue a final bill or refund.”
  - Judge note: Leeds describes closing its own account, but this local process does not establish a universal requirement for every council.
- **supported:** Various Council Tax discounts may apply.
  - [Source](https://www.gov.uk/council-tax): “This means you might be able to apply for a discount on your Council Tax bill if you get one.”
  - Judge note: The page describes multiple discount categories and possible eligibility.

**Finder queries:**

- `site:gov.uk start paying Council Tax moving new address register`
- `site:gov.uk council tax moving home contact old new council account`

**Nominated pages:**

- [https://www.gov.uk/guidance/start-paying-council-tax](https://www.gov.uk/guidance/start-paying-council-tax) — Says tell council after moving, which registers and bills the resident.
- [https://www.leeds.gov.uk/council-tax/report-a-change/register-for-council-tax-or-change-your-address](https://www.leeds.gov.uk/council-tax/report-a-change/register-for-council-tax-or-change-your-address) — Council owner page explicitly describes closing old account and opening new account.

Finder caution: Registering at new address is supported. Closing old account is council dependent and generally done by reporting the move.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/council-tax](https://www.gov.uk/council-tax) (cited or linked)
- [https://www.gov.uk/applying-for-probate/after-youve-applied](https://www.gov.uk/applying-for-probate/after-youve-applied) (cited or linked)
- [https://www.gov.uk/guidance/start-paying-council-tax](https://www.gov.uk/guidance/start-paying-council-tax) (found by search)
- [https://www.leeds.gov.uk/council-tax/report-a-change/register-for-council-tax-or-change-your-address](https://www.leeds.gov.uk/council-tax/report-a-change/register-for-council-tax-or-change-your-address) (found by search)

</details>

### Scottish Child Payment: `desc`

**Current text:** £28.20/week per eligible child under 16 for parents on qualifying benefits in Scotland, paid every 4 weeks.

**Judgment:** confirmable

- **supported:** Scottish Child Payment is £28.20 per week per eligible child under 16.
  - [Source](https://www.mygov.scot/scottish-child-payment): “It's a weekly payment of £28.20 that you can get for every child you look after who's under 16 years of age.”
  - Judge note: Supported by the cited source.
- **supported:** Parents receiving qualifying benefits in Scotland can get the payment.
  - [Source](https://www.mygov.scot/scottish-child-payment/who-should-apply): “you live in Scotland you or your partner are getting certain benefits or payments”
  - Judge note: Supported by the cited source.
- **supported:** The payment is made every four weeks.
  - [Source](https://www.mygov.scot/scottish-child-payment): “You'll get the payment every 4 weeks if your application is successful.”
  - Judge note: Supported by the cited source.

**Finder queries:**

- `site:mygov.scot Scottish Child Payment £28.20 every four weeks eligibility Scotland benefits`
- `site:mygov.scot Scottish Child Payment who should apply qualifying benefit live Scotland`

**Nominated pages:**

- [https://www.mygov.scot/scottish-child-payment](https://www.mygov.scot/scottish-child-payment) — Current amount and four-weekly payment.
- [https://www.mygov.scot/scottish-child-payment/who-should-apply](https://www.mygov.scot/scottish-child-payment/who-should-apply) — Scotland residence, main carer and qualifying benefits.

Finder caution: Supported, but 'parents' is narrower than eligible carers; use main person looking after child.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.mygov.scot/scottish-child-payment](https://www.mygov.scot/scottish-child-payment) (cited or linked)
- [https://www.mygov.scot/best-start-grant-best-start-foods](https://www.mygov.scot/best-start-grant-best-start-foods) (cited or linked)
- [https://www.mygov.scot/browse/benefits/children-and-family](https://www.mygov.scot/browse/benefits/children-and-family) (cited or linked)
- [https://www.mygov.scot/scottish-child-payment/who-should-apply](https://www.mygov.scot/scottish-child-payment/who-should-apply) (found by search)
- [https://www.socialsecurity.gov.scot/scottish-child-payment/qualifying-benefits-for-scottish-child-payment](https://www.socialsecurity.gov.scot/scottish-child-payment/qualifying-benefits-for-scottish-child-payment) (found by search)

</details>

### Renew driving licence at 70: `eligibility.criteria.1`

**Current text:** Must confirm at renewal that eyesight meets minimum standard and no medical condition prevents driving. DVLA may require medical evidence if a condition has been declared.

**Judgment:** partly supported

- **supported:** At renewal, the driver must confirm that their eyesight meets the minimum standard.
  - [Source](https://www.gov.uk/government/consultations/introducing-mandatory-eyesight-testing-for-older-drivers/introducing-mandatory-eyesight-testing-for-older-drivers): “To renew their entitlement, they must make a legal declaration that they can meet the eyesight standards required to drive and confirm whether they have any listed medical conditions.”
  - Judge note: The consultation describes the current legal self-declaration at renewal.
- **partly supported:** At renewal, the driver must confirm that no medical condition prevents driving.
  - [Source](https://www.gov.uk/government/consultations/introducing-mandatory-eyesight-testing-for-older-drivers/introducing-mandatory-eyesight-testing-for-older-drivers): “To renew their entitlement, they must make a legal declaration that they can meet the eyesight standards required to drive and confirm whether they have any listed medical conditions.”
  - Judge note: The applicant confirms whether listed medical conditions exist, not that no condition exists.
- **supported:** DVLA may require medical evidence after a condition has been declared.
  - [Source](https://www.gov.uk/driving-medical-conditions): “Your application may need further information from a healthcare professional, depending on your condition.”
  - Judge note: The source says further healthcare information may be needed depending on the condition.

**Finder queries:**

- `site:gov.uk renew licence 70 confirm eyesight medical conditions legal declaration`
- `site:gov.uk driving medical conditions renew 70 evidence eyesight DVLA`

**Nominated pages:**

- [https://www.gov.uk/government/consultations/introducing-mandatory-eyesight-testing-for-older-drivers/introducing-mandatory-eyesight-testing-for-older-drivers](https://www.gov.uk/government/consultations/introducing-mandatory-eyesight-testing-for-older-drivers/introducing-mandatory-eyesight-testing-for-older-drivers) — Official current consultation explains legal eyesight declaration and listed-condition confirmation.
- [https://www.gov.uk/driving-medical-conditions](https://www.gov.uk/driving-medical-conditions) — Says notifiable conditions are declared in renewal application.
- [https://www.gov.uk/driving-eyesight-rules](https://www.gov.uk/driving-eyesight-rules) — Explains minimum standard and possible DVLA test after vision report.

Finder caution: Self-declaration is supported; medical evidence may be sought after a notified condition, but not necessarily for every declared condition.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/renew-driving-licence-at-70](https://www.gov.uk/renew-driving-licence-at-70) (cited or linked)
- [https://www.gov.uk/driving-eyesight-rules](https://www.gov.uk/driving-eyesight-rules) (cited or linked)
- [https://www.gov.uk/exchange-paper-driving-licence](https://www.gov.uk/exchange-paper-driving-licence) (cited or linked)
- [https://www.gov.uk/renew-driving-licence](https://www.gov.uk/renew-driving-licence) (cited or linked)
- [https://www.gov.uk/government/consultations/introducing-mandatory-eyesight-testing-for-older-drivers/introducing-mandatory-eyesight-testing-for-older-drivers](https://www.gov.uk/government/consultations/introducing-mandatory-eyesight-testing-for-older-drivers/introducing-mandatory-eyesight-testing-for-older-drivers) (found by search)
- [https://www.gov.uk/driving-medical-conditions](https://www.gov.uk/driving-medical-conditions) (found by search)

</details>

### Attendance Allowance: `eligibility.criteria.0`

**Current text:** Must have reached State Pension age (66 or over).

**Judgment:** contradicted

- **supported:** An applicant must have reached State Pension age.
  - [Source](https://www.gov.uk/attendance-allowance): “You can get Attendance Allowance if you’ve reached State Pension age and the following apply:”
  - Judge note: The source makes reaching State Pension age an eligibility condition.
- **contradicted:** Being 66 or over meets the Attendance Allowance age condition.
  - [Source](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable): “The State Pension age for men and women will now increase to 67 between 2026 and 2028.”
  - Judge note: State Pension age is rising above 66, so being 66 is not always enough.

**Finder queries:**

- `site:gov.uk attendance allowance state pension age eligibility`
- `site:gov.uk state pension age timetable 66 67 2026`

**Nominated pages:**

- [https://www.gov.uk/attendance-allowance/eligibility](https://www.gov.uk/attendance-allowance/eligibility) — Attendance Allowance age condition.
- [https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) — Shows rise from 66 to 67 by birth date, starting 2026.

Finder caution: Fixed '66 or over' is misleading in October 2026; use State Pension age or date-of-birth checker.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/attendance-allowance](https://www.gov.uk/attendance-allowance) (cited or linked)
- [https://www.gov.uk/attendance-allowance/what-youll-get](https://www.gov.uk/attendance-allowance/what-youll-get) (cited or linked)
- [https://www.gov.uk/constant-attendance-allowance](https://www.gov.uk/constant-attendance-allowance) (cited or linked)
- [https://www.gov.uk/pip](https://www.gov.uk/pip) (cited or linked)
- [https://www.gov.uk/attendance-allowance/eligibility](https://www.gov.uk/attendance-allowance/eligibility) (found by search)
- [https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) (found by search)

</details>

### Personal Independence Payment (PIP): `eligibility.criteria.1`

**Current text:** Long-term physical or mental health condition or disability affecting daily living or mobility. Must have had difficulties for at least 3 months and expect them to continue for at least 9 months.

**Judgment:** partly supported

- **supported:** The applicant must have a long-term physical or mental health condition or disability.
  - [Source](https://www.gov.uk/pip): “you have a long-term physical or mental health condition or disability”
  - Judge note: The source states this eligibility condition.
- **supported:** The condition or disability must affect daily living or mobility.
  - [Source](https://www.gov.uk/pip): “you have difficulty doing certain everyday tasks or getting around”
  - Judge note: The source states the daily task or mobility difficulty requirement.
- **not stated:** The applicant must already have had the difficulties for at least 3 months.
  - Judge note: The sources give an expected total duration but do not state a 3-month period before claiming.
- **partly supported:** The applicant must expect the difficulties to continue for at least 9 months.
  - [Source](https://www.gov.uk/pip): “you expect the difficulties to last for at least 12 months from when they started”
  - Judge note: The source states 12 months from onset, not a separate 9-month future period.

**Finder queries:**

- `site:gov.uk PIP assessment guide previous three months further nine months`
- `site:gov.uk PIP eligibility twelve months from when difficulties started`

**Nominated pages:**

- [https://www.gov.uk/government/publications/personal-independence-payment-assessment-guide-for-assessment-providers/pip-assessment-guide-part-1-the-assessment-process](https://www.gov.uk/government/publications/personal-independence-payment-assessment-guide-for-assessment-providers/pip-assessment-guide-part-1-the-assessment-process) — Current DWP guide states 3-month retrospective and 9-month prospective functional test.
- [https://www.gov.uk/pip/eligibility](https://www.gov.uk/pip/eligibility) — Public page states difficulties expected for 12 months from onset.

Finder caution: 3+9 is supported in assessment guidance; phrase as functional difficulties at required level, with special end-of-life rules.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/pip](https://www.gov.uk/pip) (cited or linked)
- [https://www.gov.uk/pip/what-youll-get](https://www.gov.uk/pip/what-youll-get) (cited or linked)
- [https://www.gov.uk/attendance-allowance](https://www.gov.uk/attendance-allowance) (cited or linked)
- [https://www.gov.uk/financial-help-disabled/vehicles-and-transport](https://www.gov.uk/financial-help-disabled/vehicles-and-transport) (cited or linked)
- [https://www.gov.uk/financial-help-disabled](https://www.gov.uk/financial-help-disabled) (cited or linked)
- [https://www.gov.uk/government/publications/personal-independence-payment-assessment-guide-for-assessment-providers/pip-assessment-guide-part-1-the-assessment-process](https://www.gov.uk/government/publications/personal-independence-payment-assessment-guide-for-assessment-providers/pip-assessment-guide-part-1-the-assessment-process) (found by search)
- [https://www.gov.uk/pip/eligibility](https://www.gov.uk/pip/eligibility) (found by search)

</details>

### Carer's Credit: `eligibility.criteria.1`

**Current text:** Not already receiving NI credits through Carer's Allowance, UC, or earnings above the Lower Earnings Limit.

**Judgment:** partly supported

- **partly supported:** The applicant must not already receive National Insurance credits through Carer’s Allowance.
  - [Source](https://www.gov.uk/carers-credit): “get Carer’s Allowance or Carer Support Payment - you’ll automatically get credits”
  - Judge note: Carer’s Allowance brings automatic credits so a separate Carer’s Credit application is unnecessary, but the text does not state an eligibility bar.
- **partly supported:** The applicant must not already receive National Insurance credits through Universal Credit.
  - [Source](https://www.gov.uk/national-insurance-credits/eligibility): “If you receive Universal Credit, you get Class 3 credits automatically.”
  - Judge note: Universal Credit provides automatic Class 3 credits, but the text does not say this disqualifies a Carer’s Credit applicant.
- **not stated:** The applicant must not already receive National Insurance credits through earnings above the Lower Earnings Limit.
  - Judge note: The supplied sources do not mention this earnings threshold or an exclusion based on it.

**Finder queries:**

- `site:gov.uk Carer's Credit eligibility Universal Credit earnings lower earnings limit`
- `site:gov.uk National Insurance credits carers Universal Credit Class 3 Carer's Allowance Class 1`

**Nominated pages:**

- [https://www.gov.uk/carers-credit/eligibility](https://www.gov.uk/carers-credit/eligibility) — Actual Carer's Credit qualifying conditions.
- [https://www.gov.uk/national-insurance-credits/eligibility](https://www.gov.uk/national-insurance-credits/eligibility) — Explains automatic UC and Carer's Allowance credits, but does not make UC a Carer's Credit disqualifier.
- [https://www.gov.uk/carers-allowance/effect-on-other-benefits](https://www.gov.uk/carers-allowance/effect-on-other-benefits) — Distinguishes UC Class 3 and Carer's Allowance Class 1 credits.

Finder caution: Claim is overbroad: UC receipt is not stated as a Carer's Credit exclusion; earnings over the Lower Earnings Limit alone is not shown as a disqualifier. Remove unsourced exclusions.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/carers-credit](https://www.gov.uk/carers-credit) (cited or linked)
- [https://www.gov.uk/attendance-allowance](https://www.gov.uk/attendance-allowance) (cited or linked)
- [https://www.gov.uk/carers-allowance](https://www.gov.uk/carers-allowance) (cited or linked)
- [https://www.gov.uk/pip](https://www.gov.uk/pip) (cited or linked)
- [https://www.gov.uk/carers-credit/eligibility](https://www.gov.uk/carers-credit/eligibility) (found by search)
- [https://www.gov.uk/national-insurance-credits/eligibility](https://www.gov.uk/national-insurance-credits/eligibility) (found by search)
- [https://www.gov.uk/carers-allowance/effect-on-other-benefits](https://www.gov.uk/carers-allowance/effect-on-other-benefits) (found by search)

</details>

### NHS Continuing Healthcare (CHC): `eligibility.criteria.0`

**Current text:** Primary health need assessed as complex, intense, or unpredictable — usually a progressive serious illness, terminal condition, or severe disability.

**Judgment:** partly supported

- **supported:** Eligibility requires an assessed primary health need.
  - [Source](https://www.gov.uk/government/publications/nhs-continuing-healthcare-and-nhs-funded-nursing-care-public-information-leaflet/public-information-leaflet-nhs-continuing-healthcare-and-nhs-funded-nursing-care--2): “People over 18 years of age who have been assessed as having a ’primary health need’ are entitled to NHS continuing healthcare.”
  - Judge note: The leaflet states the primary health need assessment criterion.
- **partly supported:** The primary health need must be assessed as complex, intense, or unpredictable.
  - [Source](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/): “The team will look at all your care needs and relate them to: what help you need how complex your needs are how intense your needs can be how unpredictable they are”
  - Judge note: These are assessment factors, but the text does not make any one of them a standalone mandatory condition.
- **not stated:** A progressive serious illness is usual for eligibility.
  - Judge note: The sources do not say progressive serious illness is usual among eligible people.
- **not stated:** A terminal condition is usual for eligibility.
  - Judge note: The sources discuss urgent fast-track assessment for some terminal conditions but do not say they are usual.
- **not stated:** A severe disability is usual for eligibility.
  - Judge note: The sources do not say severe disability is usual among eligible people.

**Finder queries:**

- `site:gov.uk NHS continuing healthcare public leaflet primary health need nature intensity complexity unpredictability`
- `site:nhs.uk continuing healthcare progressive illness terminal disability eligibility primary health need`

**Nominated pages:**

- [https://www.gov.uk/government/publications/nhs-continuing-healthcare-and-nhs-funded-nursing-care-public-information-leaflet/public-information-leaflet-nhs-continuing-healthcare-and-nhs-funded-nursing-care--2](https://www.gov.uk/government/publications/nhs-continuing-healthcare-and-nhs-funded-nursing-care-public-information-leaflet/public-information-leaflet-nhs-continuing-healthcare-and-nhs-funded-nursing-care--2) — HTML public leaflet lists four assessment characteristics.
- [https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/) — NHS eligibility examples and fast-track pathway for rapidly deteriorating/end-of-life needs.

Finder caution: Complexity, intensity and unpredictability are assessment factors, not mandatory combined thresholds; 'usually progressive serious illness, terminal condition, or severe disability' is unsupported as a general rule.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/government/publications/national-framework-for-nhs-continuing-healthcare-and-nhs-funded-nursing-care](https://www.gov.uk/government/publications/national-framework-for-nhs-continuing-healthcare-and-nhs-funded-nursing-care) (cited or linked)
- [https://www.gov.uk/government/publications/nhs-continuing-healthcare-and-nhs-funded-nursing-care-public-information-leaflet/public-information-leaflet-nhs-continuing-healthcare-and-nhs-funded-nursing-care--2](https://www.gov.uk/government/publications/nhs-continuing-healthcare-and-nhs-funded-nursing-care-public-information-leaflet/public-information-leaflet-nhs-continuing-healthcare-and-nhs-funded-nursing-care--2) (found by search)
- [https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/) (found by search)

</details>

### Carer's leave (employer): `eligibility.criteria.0`

**Current text:** Must be an employee (not a worker or self-employed). Applies from the first day of employment.

**Judgment:** partly supported

- **supported:** The person taking carer’s leave must be an employee.
  - [Source](https://www.acas.org.uk/carers-leave): “Anyone who is legally classed as an employee can take time off to help a dependant who needs long-term care.”
  - Judge note: The source identifies employee status as the entitlement class.
- **partly supported:** Workers who are not employees cannot take statutory carer’s leave.
  - [Source](https://www.acas.org.uk/carers-leave): “Anyone who is legally classed as an employee can take time off to help a dependant who needs long-term care.”
  - Judge note: The source limits entitlement to employees but does not expressly discuss this excluded category.
- **partly supported:** Self-employed people cannot take statutory carer’s leave.
  - [Source](https://www.acas.org.uk/carers-leave): “Anyone who is legally classed as an employee can take time off to help a dependant who needs long-term care.”
  - Judge note: The source limits entitlement to employees but does not expressly discuss this excluded category.
- **supported:** The entitlement applies from the first day of employment.
  - [Source](https://www.gov.uk/carers-leave): “Employees are entitled to carer’s leave from their first day of work for their employer.”
  - Judge note: The source explicitly gives first-day entitlement.

**Finder queries:**

- `site:gov.uk carer's leave first day employee eligibility`
- `site:acas.org.uk carer's leave employee worker self employed day one`

**Nominated pages:**

- [https://www.gov.uk/carers-leave](https://www.gov.uk/carers-leave) — Government employee eligibility and day-one entitlement.
- [https://www.acas.org.uk/carers-leave](https://www.acas.org.uk/carers-leave) — ACAS states right belongs to those legally classed as employees from first day of work.

Finder caution: Employee-only statutory right is supported by ACAS. Avoid inferring that workers have no other contractual leave rights.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/carers-leave](https://www.gov.uk/carers-leave) (cited or linked)
- [https://www.gov.uk/parental-leave](https://www.gov.uk/parental-leave) (cited or linked)
- [https://www.acas.org.uk/carers-leave](https://www.acas.org.uk/carers-leave) (found by search)

</details>

### Motability scheme: `eligibility.criteria.0`

**Current text:** Receiving the Enhanced Rate of the Mobility Component of PIP (or equivalent: DLA highest rate mobility, AFIP or WPMS).

**Judgment:** confirmable

- **supported:** Receiving the enhanced rate mobility part of PIP qualifies a person to apply to the Motability Scheme.
  - [Source](https://www.motability.co.uk/get-support/faqs/am-i-eligible/): “Enhanced rate mobility part of Personal Independence Payment (PIP)”
  - Judge note: The listed allowance qualifies.
- **supported:** Receiving the highest mobility rate of DLA qualifies a person to apply to the Motability Scheme.
  - [Source](https://www.motability.co.uk/get-support/faqs/am-i-eligible/): “Higher rate mobility part of Disability Living Allowance (DLA)”
  - Judge note: The source calls the top DLA mobility rate the higher rate.
- **supported:** Receiving AFIP qualifies a person to apply to the Motability Scheme.
  - [Source](https://www.motability.co.uk/get-support/faqs/am-i-eligible/): “Armed Forces Independence Payment (AFIP)”
  - Judge note: The listed allowance qualifies.
- **supported:** Receiving WPMS qualifies a person to apply to the Motability Scheme.
  - [Source](https://www.motability.co.uk/get-support/faqs/am-i-eligible/): “War Pensioners’ Mobility Supplement (WPMS)”
  - Judge note: The listed allowance qualifies.

**Finder queries:**

- `site:motability.co.uk eligible enhanced PIP higher DLA AFIP WPMS`
- `site:gov.uk Motability Scheme qualifying mobility allowances PIP DLA AFIP WPMS`

**Nominated pages:**

- [https://www.motability.co.uk/get-support/faqs/am-i-eligible/](https://www.motability.co.uk/get-support/faqs/am-i-eligible/) — Service owner's complete qualifying-allowance list plus 12 months remaining requirement.
- [https://www.gov.uk/financial-help-disabled/vehicles-and-transport](https://www.gov.uk/financial-help-disabled/vehicles-and-transport) — Government list of qualifying mobility benefits.

Finder caution: Claim omits Scottish Adult and Child Disability Payments and 12 months of award remaining; DLA is 'higher', not 'highest', mobility rate.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.motability.co.uk/](https://www.motability.co.uk/) (cited or linked)
- [https://www.motability.co.uk/get-support/faqs/am-i-eligible/](https://www.motability.co.uk/get-support/faqs/am-i-eligible/) (found by search)
- [https://www.gov.uk/financial-help-disabled/vehicles-and-transport](https://www.gov.uk/financial-help-disabled/vehicles-and-transport) (found by search)

</details>

### Child Disability Payment: `eligibility.criteria.1`

**Current text:** Child must have a physical or mental disability requiring substantially more care or supervision than a child of the same age, or have difficulty walking.

**Judgment:** confirmable

- **supported:** A child can qualify for Child Disability Payment because of a physical or mental disability.
  - [Source](https://www.mygov.scot/child-disability-payment): “You can apply for children under 16 with a physical or mental disability.”
  - Judge note: The source expressly names physical and mental disabilities.
- **supported:** For the care component, a child under 16 must need substantially more care or supervision than a child of the same age.
  - [Source](https://www.socialsecurity.gov.scot/publications/2017/01/child-disability-payment-decision-making-guide/pages/care-component-definitions/common-definitions): “The individual’s need for attention or supervision either: must be substantially more than would be expected for a person of the same age”
  - Judge note: The source states the same-age comparison for under-16 care needs.
- **supported:** A child may qualify for the mobility component because of difficulty walking.
  - [Source](https://www.mygov.scot/child-disability-payment): “Higher This is a weekly rate of £80. It's for a child who is 3 or older and either: unable to walk unable to walk outdoors whose health would get worse from walking”
  - Judge note: The source gives walking difficulty as a mobility route.

**Finder queries:**

- `site:socialsecurity.gov.scot child disability payment substantially more care same age criteria`
- `site:mygov.scot child disability payment care mobility disability child same age`

**Nominated pages:**

- [https://www.socialsecurity.gov.scot/publications/2017/01/child-disability-payment-decision-making-guide/pages/care-component-definitions/common-definitions](https://www.socialsecurity.gov.scot/publications/2017/01/child-disability-payment-decision-making-guide/pages/care-component-definitions/common-definitions) — States substantial comparison with a child of the same age for care criteria.
- [https://www.socialsecurity.gov.scot/publications/2017/01/child-disability-payment-decision-making-guide/pages/care-component---rates-and-criteria/criteria-of-the-care-component](https://www.socialsecurity.gov.scot/publications/2017/01/child-disability-payment-decision-making-guide/pages/care-component---rates-and-criteria/criteria-of-the-care-component) — Decision examples and care-rate criteria.
- [https://www.mygov.scot/child-disability-payment](https://www.mygov.scot/child-disability-payment) — Public care and mobility descriptions.

Finder caution: Age comparison is supported for care component, but mobility has distinct age and functional tests; current claim merges them loosely.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.mygov.scot/child-disability-payment](https://www.mygov.scot/child-disability-payment) (cited or linked)
- [https://www.socialsecurity.gov.scot/publications/2017/01/child-disability-payment-decision-making-guide/pages/care-component-definitions/common-definitions](https://www.socialsecurity.gov.scot/publications/2017/01/child-disability-payment-decision-making-guide/pages/care-component-definitions/common-definitions) (found by search)
- [https://www.socialsecurity.gov.scot/publications/2017/01/child-disability-payment-decision-making-guide/pages/care-component---rates-and-criteria/criteria-of-the-care-component](https://www.socialsecurity.gov.scot/publications/2017/01/child-disability-payment-decision-making-guide/pages/care-component---rates-and-criteria/criteria-of-the-care-component) (found by search)

</details>

### Notify OPG of death: `eligibility.criteria.0`

**Current text:** A registered LPA exists and the donor has died.

**Judgment:** contradicted

- **supported:** A registered LPA must exist to use the LPA service.
  - [Source](https://www.gov.uk/manage-lasting-power-attorney/start-lasting-power-of-attorney): “You must have registered the LPA before you can start acting as an attorney.”
  - Judge note: The source requires registration first.
- **contradicted:** The donor has died when the LPA is activated or used.
  - [Source](https://www.gov.uk/manage-lasting-power-attorney/start-lasting-power-of-attorney): “OPG will cancel the LPA if the donor dies”
  - Judge note: The source says the LPA is cancelled on the donor’s death rather than activated or used then.

**Finder queries:**

- `site:gov.uk OPG notification donor death registered lasting power attorney`
- `site:gov.uk Public Guardian practice note registered LPA donor dies report`

**Nominated pages:**

- [https://www.gov.uk/government/publications/public-guardian-practice-note-notification-of-death/public-guardian-practice-note-notification-of-death](https://www.gov.uk/government/publications/public-guardian-practice-note-notification-of-death/public-guardian-practice-note-notification-of-death) — Expressly covers donor death of a registered LPA or EPA.
- [https://www.gov.uk/manage-lasting-power-attorney/changes-you-need-to-report](https://www.gov.uk/manage-lasting-power-attorney/changes-you-need-to-report) — General donor-death notification instructions.

Finder caution: Registered condition is supported by OPG practice note for this notification route; general page does not itself say 'registered'.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/power-of-attorney/changes-you-need-to-report](https://www.gov.uk/power-of-attorney/changes-you-need-to-report) (cited or linked)
- [https://www.gov.uk/manage-lasting-power-attorney/start-lasting-power-of-attorney](https://www.gov.uk/manage-lasting-power-attorney/start-lasting-power-of-attorney) (cited or linked)
- [https://www.gov.uk/manage-lasting-power-attorney/use-lasting-power-of-attorney](https://www.gov.uk/manage-lasting-power-attorney/use-lasting-power-of-attorney) (cited or linked)
- [https://www.gov.uk/manage-lasting-power-attorney](https://www.gov.uk/manage-lasting-power-attorney) (cited or linked)
- [https://www.gov.uk/government/publications/public-guardian-practice-note-notification-of-death/public-guardian-practice-note-notification-of-death](https://www.gov.uk/government/publications/public-guardian-practice-note-notification-of-death/public-guardian-practice-note-notification-of-death) (found by search)
- [https://www.gov.uk/manage-lasting-power-attorney/changes-you-need-to-report](https://www.gov.uk/manage-lasting-power-attorney/changes-you-need-to-report) (found by search)

</details>

### Notify OPG of death: `eligibility.criteria.1`

**Current text:** Requires a registered LPA to be in place.

**Judgment:** confirmable

- **supported:** A registered LPA is required to use the LPA service.
  - [Source](https://www.gov.uk/manage-lasting-power-attorney/start-lasting-power-of-attorney): “You must have registered the LPA before you can start acting as an attorney.”
  - Judge note: The source requires registration first.

**Finder queries:**

- `site:gov.uk notification death registered LPA OPG practice note`
- `site:gov.uk manage lasting power attorney registered donor death notify OPG`

**Nominated pages:**

- [https://www.gov.uk/government/publications/public-guardian-practice-note-notification-of-death/public-guardian-practice-note-notification-of-death](https://www.gov.uk/government/publications/public-guardian-practice-note-notification-of-death/public-guardian-practice-note-notification-of-death) — Scope section says notify death of donor of a registered enduring or lasting power of attorney.
- [https://www.gov.uk/manage-lasting-power-attorney](https://www.gov.uk/manage-lasting-power-attorney) — Registered LPA must exist before attorney acts.

Finder caution: Practice note supports registered LPA, though it also covers registered EPA; do not claim reporting is impossible for all unregistered documents.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/power-of-attorney/changes-you-need-to-report](https://www.gov.uk/power-of-attorney/changes-you-need-to-report) (cited or linked)
- [https://www.gov.uk/manage-lasting-power-attorney/start-lasting-power-of-attorney](https://www.gov.uk/manage-lasting-power-attorney/start-lasting-power-of-attorney) (cited or linked)
- [https://www.gov.uk/manage-lasting-power-attorney/use-lasting-power-of-attorney](https://www.gov.uk/manage-lasting-power-attorney/use-lasting-power-of-attorney) (cited or linked)
- [https://www.gov.uk/manage-lasting-power-attorney](https://www.gov.uk/manage-lasting-power-attorney) (cited or linked)
- [https://www.gov.uk/government/publications/public-guardian-practice-note-notification-of-death/public-guardian-practice-note-notification-of-death](https://www.gov.uk/government/publications/public-guardian-practice-note-notification-of-death/public-guardian-practice-note-notification-of-death) (found by search)
- [https://www.gov.uk/manage-lasting-power-attorney/changes-you-need-to-report](https://www.gov.uk/manage-lasting-power-attorney/changes-you-need-to-report) (found by search)

</details>

### Pension Credit: `eligibility.criteria.0`

**Current text:** Must have reached State Pension age (currently 66).

**Judgment:** contradicted

- **partly supported:** A Pension Credit claimant must have reached State Pension age.
  - [Source](https://www.gov.uk/pension-credit): “You’ll be eligible if either: you and your partner have both reached State Pension age one of you is getting Housing Benefit for people over State Pension age”
  - Judge note: The general age rule has a mixed-age couple exception when one partner gets Housing Benefit for people over State Pension age.
- **contradicted:** State Pension age is currently 66.
  - [Source](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable): “The State Pension age for men and women will now increase to 67 between 2026 and 2028.”
  - Judge note: The age is rising in stages during 2026–2028, so it is not uniformly 66 now.

**Finder queries:**

- `site:gov.uk pension credit eligibility reached state pension age`
- `site:gov.uk state pension age timetable 66 to 67 2026`

**Nominated pages:**

- [https://www.gov.uk/pension-credit/eligibility](https://www.gov.uk/pension-credit/eligibility) — Pension Credit requires reaching State Pension age.
- [https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) — Age varies by date of birth during 2026-28 transition.
- [https://www.gov.uk/state-pension-age](https://www.gov.uk/state-pension-age) — Individual age checker.

Finder caution: 'Currently 66' is false as a universal threshold during the transition; use State Pension age rather than a fixed number.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/pension-credit](https://www.gov.uk/pension-credit) (cited or linked)
- [https://www.gov.uk/pension-credit/what-youll-get](https://www.gov.uk/pension-credit/what-youll-get) (cited or linked)
- [https://www.gov.uk/settled-status-eu-citizens-families/who-can-apply](https://www.gov.uk/settled-status-eu-citizens-families/who-can-apply) (cited or linked)
- [https://www.gov.uk/universal-credit](https://www.gov.uk/universal-credit) (cited or linked)
- [https://www.gov.uk/support-for-mortgage-interest](https://www.gov.uk/support-for-mortgage-interest) (cited or linked)
- [https://www.gov.uk/pension-credit/eligibility](https://www.gov.uk/pension-credit/eligibility) (found by search)
- [https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) (found by search)
- [https://www.gov.uk/state-pension-age](https://www.gov.uk/state-pension-age) (found by search)

</details>

### Free bus pass: `eligibility.criteria.0`

**Current text:** Must have reached State Pension age (currently 66). Some disabled people may also qualify before this age.

**Judgment:** contradicted

- **contradicted:** An older person must have reached State Pension age to get a bus pass.
  - [Source](https://www.gov.uk/apply-for-elderly-person-bus-pass): “In Wales you can get a bus pass when you reach 60.”
  - Judge note: The State Pension age rule applies in England, while Wales allows the pass at 60 and Scotland and Northern Ireland also use 60.
- **contradicted:** State Pension age is currently 66.
  - [Source](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable): “The State Pension age for men and women will now increase to 67 between 2026 and 2028.”
  - Judge note: The age is rising in stages during 2026–2028, so it is not uniformly 66 now.
- **partly supported:** Some disabled people can qualify for a bus pass before reaching the older-person qualifying age.
  - [Source](https://www.gov.uk/apply-for-disabled-bus-pass): “You’re eligible for a disabled person’s pass if you live in England and are ‘eligible disabled’.”
  - Judge note: The source confirms a disabled-person route but does not expressly state that it is available before the older-person qualifying age.

**Finder queries:**

- `site:gov.uk older person's bus pass England State Pension age disabled sooner`
- `site:gov.uk state pension age timetable 2026 66 67`

**Nominated pages:**

- [https://www.gov.uk/apply-for-elderly-person-bus-pass](https://www.gov.uk/apply-for-elderly-person-bus-pass) — England age rule, Wales/London variants and check-sooner route.
- [https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) — Shows 66-to-67 transition by date of birth.
- [https://www.gov.uk/apply-for-disabled-bus-pass](https://www.gov.uk/apply-for-disabled-bus-pass) — Separate disability bus-pass route.

Finder caution: Fixed 66 is misleading; England age depends on birth date. London and Wales have different older-pass ages, so retain geography qualifier.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/apply-for-elderly-person-bus-pass](https://www.gov.uk/apply-for-elderly-person-bus-pass) (cited or linked)
- [https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) (found by search)
- [https://www.gov.uk/apply-for-disabled-bus-pass](https://www.gov.uk/apply-for-disabled-bus-pass) (found by search)

</details>

### Funeral Support Payment: `eligibility.criteria.2`

**Current text:** The funeral must take place in the UK, and applicant must live in Scotland.

**Judgment:** contradicted

- **contradicted:** The funeral must take place in the UK.
  - [Source](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when): “the funeral is being held in the UK or in some circumstances , another country”
  - Judge note: The source allows a funeral in another country in some circumstances.
- **supported:** The applicant must live in Scotland.
  - [Source](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when): “you live in Scotland”
  - Judge note: Supported by the cited source.

**Finder queries:**

- `site:mygov.scot funeral support payment funeral UK or EEA Switzerland eligibility`
- `site:socialsecurity.gov.scot funeral support payment exceptional outside UK funeral`

**Nominated pages:**

- [https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment](https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment) — UK funeral rule and EU/EEA/Swiss exceptions.
- [https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when) — Public wording says UK or some circumstances another country.

Finder caution: 'Must take place in UK' is false without exception; official guidance also allows exceptional non-UK funerals. Scotland residence is supported.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.mygov.scot/funeral-support-payment](https://www.mygov.scot/funeral-support-payment) (cited or linked)
- [https://www.mygov.scot/funeral-support-payment/person-who-died-18-or-over](https://www.mygov.scot/funeral-support-payment/person-who-died-18-or-over) (cited or linked)
- [https://www.mygov.scot/bereavement-support](https://www.mygov.scot/bereavement-support) (cited or linked)
- [https://www.mygov.scot/arrange-funeral](https://www.mygov.scot/arrange-funeral) (cited or linked)
- [https://www.mygov.scot/after-youve-applied-for-the-funeral-support-payment](https://www.mygov.scot/after-youve-applied-for-the-funeral-support-payment) (cited or linked)
- [https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment](https://www.socialsecurity.gov.scot/funeral-support-payment/eligibility-for-funeral-support-payment) (found by search)
- [https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when](https://www.mygov.scot/funeral-support-payment/who-can-apply-and-when) (found by search)

</details>

### Bereavement Support Payment: `eligibility.criteria.1`

**Current text:** Must have been under State Pension age (66) at the time of the partner's death.

**Judgment:** contradicted

- **supported:** The claimant must have been under State Pension age when their partner died.
  - [Source](https://www.gov.uk/bereavement-support-payment): “When your partner died, you must have been: under State Pension age”
  - Judge note: The source states the timing and age requirement.
- **contradicted:** State Pension age is currently 66.
  - [Source](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable): “The State Pension age for men and women will now increase to 67 between 2026 and 2028.”
  - Judge note: The age varies by date of birth during the 2026–2028 transition and is not fixed at 66.

**Finder queries:**

- `site:gov.uk bereavement support payment eligibility under State Pension age partner died`
- `site:gov.uk state pension age timetable 66 to 67 2026`

**Nominated pages:**

- [https://www.gov.uk/bereavement-support-payment/eligibility](https://www.gov.uk/bereavement-support-payment/eligibility) — Claimant must have been under State Pension age when partner died.
- [https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) — Age varies with birth date during 2026-28.
- [https://www.gov.uk/state-pension-age](https://www.gov.uk/state-pension-age) — Individual checker.

Finder caution: Parenthetic 66 can misstate the historical age at the partner's death; use State Pension age at that date.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/bereavement-support-payment](https://www.gov.uk/bereavement-support-payment) (cited or linked)
- [https://www.gov.uk/bereavement-support-payment/what-youll-get](https://www.gov.uk/bereavement-support-payment/what-youll-get) (cited or linked)
- [https://www.gov.uk/claim-benefits-abroad/bereavement-benefits](https://www.gov.uk/claim-benefits-abroad/bereavement-benefits) (cited or linked)
- [https://www.gov.uk/widowed-parents-allowance](https://www.gov.uk/widowed-parents-allowance) (cited or linked)
- [https://www.gov.uk/child-benefit](https://www.gov.uk/child-benefit) (cited or linked)
- [https://www.gov.uk/bereavement-support-payment/eligibility](https://www.gov.uk/bereavement-support-payment/eligibility) (found by search)
- [https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) (found by search)
- [https://www.gov.uk/state-pension-age](https://www.gov.uk/state-pension-age) (found by search)
- [https://www.legislation.gov.uk/ukpga/2014/19/part/5/made](https://www.legislation.gov.uk/ukpga/2014/19/part/5/made) (found by search)
- [https://www.gov.uk/government/publications/dwp-statistical-summary-policies-and-statements/bereavement-support-payment-statistics-background-information-and-methodology](https://www.gov.uk/government/publications/dwp-statistical-summary-policies-and-statements/bereavement-support-payment-statistics-background-information-and-methodology) (found by search)

</details>

### Bereavement Support Payment: `eligibility.criteria.2`

**Current text:** Deceased must have paid at least 25 weeks of Class 1 or 2 NI contributions, or died from a work-related accident or disease.

**Judgment:** confirmable

- **supported:** The deceased partner must have paid National Insurance contributions for at least 25 weeks unless the work-related death alternative applies.
  - [Source](https://www.gov.uk/government/publications/dwp-statistical-summary-policies-and-statements/bereavement-support-payment-statistics-background-information-and-methodology): “A claimant is eligible if their partner either paid National Insurance contributions for at least 25 weeks or died due to an accident at work or disease caused by work.”
  - Judge note: The source states the 25-week route and the alternative.
- **supported:** The qualifying contributions are Class 1 or Class 2 National Insurance contributions.
  - [Source](https://www.gov.uk/bereavement-support-payment): “paid a certain amount of Class 1 or Class 2 National Insurance contributions in any one tax year since 6 April 1975”
  - Judge note: The source names both contribution classes.
- **supported:** A deceased partner’s death from an accident at work or disease caused by work is an alternative qualifying route.
  - [Source](https://www.gov.uk/bereavement-support-payment): “died because of an accident at work or a disease caused by work”
  - Judge note: The source states the work-related death alternative.

**Finder queries:**

- `site:gov.uk bereavement support payment 25 weeks Class 1 Class 2 one tax year`
- `site:legislation.gov.uk Pensions Act 2014 bereavement contribution 25 times lower earnings limit one tax year`

**Nominated pages:**

- [https://www.gov.uk/bereavement-support-payment/eligibility](https://www.gov.uk/bereavement-support-payment/eligibility) — Public page says a certain amount of Class 1/2 contributions in any one tax year or work-related death.
- [https://www.legislation.gov.uk/ukpga/2014/19/part/5/made](https://www.legislation.gov.uk/ukpga/2014/19/part/5/made) — Statute frames amount as earnings factor at least 25 times that year's lower earnings limit in one tax year.
- [https://www.gov.uk/government/publications/dwp-statistical-summary-policies-and-statements/bereavement-support-payment-statistics-background-information-and-methodology](https://www.gov.uk/government/publications/dwp-statistical-summary-policies-and-statements/bereavement-support-payment-statistics-background-information-and-methodology) — DWP statistics explainer uses 25 weeks shorthand.

Finder caution: '25 weeks' is shorthand and may imply 25 separate contribution weeks; precise statutory test is actual Class 1/2 contributions and an earnings factor of at least 25 times LEL in one tax year.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/bereavement-support-payment](https://www.gov.uk/bereavement-support-payment) (cited or linked)
- [https://www.gov.uk/bereavement-support-payment/what-youll-get](https://www.gov.uk/bereavement-support-payment/what-youll-get) (cited or linked)
- [https://www.gov.uk/claim-benefits-abroad/bereavement-benefits](https://www.gov.uk/claim-benefits-abroad/bereavement-benefits) (cited or linked)
- [https://www.gov.uk/widowed-parents-allowance](https://www.gov.uk/widowed-parents-allowance) (cited or linked)
- [https://www.gov.uk/child-benefit](https://www.gov.uk/child-benefit) (cited or linked)
- [https://www.gov.uk/bereavement-support-payment/eligibility](https://www.gov.uk/bereavement-support-payment/eligibility) (found by search)
- [https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable) (found by search)
- [https://www.gov.uk/state-pension-age](https://www.gov.uk/state-pension-age) (found by search)
- [https://www.legislation.gov.uk/ukpga/2014/19/part/5/made](https://www.legislation.gov.uk/ukpga/2014/19/part/5/made) (found by search)
- [https://www.gov.uk/government/publications/dwp-statistical-summary-policies-and-statements/bereavement-support-payment-statistics-background-information-and-methodology](https://www.gov.uk/government/publications/dwp-statistical-summary-policies-and-statements/bereavement-support-payment-statistics-background-information-and-methodology) (found by search)

</details>

### Register the death: `eligibility.criteria.0`

**Current text:** A person has died in England or Wales.

**Judgment:** contradicted

- **contradicted:** The death must have happened in England or Wales to use the death-registration guidance.
  - [Source](https://www.gov.uk/register-a-death): “Find out how to register a death in the UK or abroad.”
  - Judge note: The source includes deaths elsewhere in the UK and abroad, so England or Wales is not a universal condition.

**Finder queries:**

- `site:gov.uk register death England Wales Scotland Northern Ireland abroad routes`
- `site:gov.uk after a death register death England Wales foreign deaths`

**Nominated pages:**

- [https://www.gov.uk/after-a-death](https://www.gov.uk/after-a-death) — England/Wales registration flow and links to other routes.
- [https://www.gov.uk/after-a-death/death-abroad](https://www.gov.uk/after-a-death/death-abroad) — Different rules for deaths abroad and in Scotland/NI.
- [https://www.gov.uk/register-a-death](https://www.gov.uk/register-a-death) — Broad register-a-death landing page, including UK and abroad.

Finder caution: The selected England/Wales criterion is apt only for the England/Wales route; the broad register-a-death landing page covers deaths elsewhere. Avoid using it to prove a strict universal exclusion.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/register-a-death](https://www.gov.uk/register-a-death) (cited or linked)
- [https://www.gov.uk/after-a-death/register-the-death](https://www.gov.uk/after-a-death/register-the-death) (cited or linked)
- [https://www.gov.uk/after-a-death](https://www.gov.uk/after-a-death) (found by search)
- [https://www.gov.uk/after-a-death/death-abroad](https://www.gov.uk/after-a-death/death-abroad) (found by search)

</details>

### Apply for probate: `eligibility.criteria.0`

**Current text:** Person has died leaving assets held in their sole name.

**Judgment:** partly supported

- **supported:** The person whose estate may require probate has died.
  - [Source](https://www.gov.uk/applying-for-probate): “Find out if you need to apply for probate to deal with the estate of someone who’s died.”
  - Judge note: The source connects probate to a deceased person’s estate.
- **partly supported:** The deceased person left assets held in their sole name.
  - [Source](https://www.gov.uk/applying-for-probate): “Probate is the legal right to deal with someone’s property, money and possessions (their ‘estate’) when they die.”
  - Judge note: The source discusses estate assets but does not state that they must be held in the deceased person’s sole name.

**Finder queries:**

- `site:gov.uk applying for probate sole name assets when needed`
- `site:gov.uk probate joint tenants tenants in common estate assets solely owned`

**Nominated pages:**

- [https://www.gov.uk/applying-for-probate](https://www.gov.uk/applying-for-probate) — Explains when probate may be needed; joint tenants' assets usually pass automatically and banks have own rules.
- [https://www.gov.uk/joint-property-ownership](https://www.gov.uk/joint-property-ownership) — Distinguishes joint tenants from tenants in common and what happens on death.

Finder caution: 'Sole name' is too strict as an eligibility criterion. Tenants-in-common interests can require probate and some solely held savings may not.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/applying-for-probate](https://www.gov.uk/applying-for-probate) (cited or linked)
- [https://www.gov.uk/applying-for-probate/apply-for-probate](https://www.gov.uk/applying-for-probate/apply-for-probate) (cited or linked)
- [https://www.gov.uk/joint-property-ownership](https://www.gov.uk/joint-property-ownership) (found by search)

</details>

### Citizenship ceremony: `eligibility.criteria.1`

**Current text:** Adults aged 18 and over must attend in person. Children under 18 can be included on a parent's ceremony.

**Judgment:** contradicted

- **contradicted:** Every applicant aged 18 or over must attend a citizenship ceremony.
  - [Source](https://www.gov.uk/citizenship-ceremonies): “If you become a British citizen under the Windrush scheme you can choose if you want to attend a citizenship ceremony.”
  - Judge note: The source makes attendance optional for the Windrush scheme and also lists citizenship categories that do not require a ceremony.
- **supported:** People who attend a citizenship ceremony attend it in person.
  - [Source](https://www.gov.uk/citizenship-ceremonies): “You must take your invitation when you go to your ceremony.”
  - Judge note: The source describes going to the ceremony with the invitation.
- **supported:** A child under 18 who applied with their parents may attend a parent’s citizenship ceremony.
  - [Source](https://www.gov.uk/government/publications/british-citizenship-successful-applicants/citizenship-ceremonies-guidance-notes-english-and-welsh): “Children under 18 who have applied with their parents may attend a ceremony with other members of the family, to collect their certificate.”
  - Judge note: The source expressly allows children to attend with family.

**Finder queries:**

- `site:gov.uk citizenship ceremony children under 18 parent ceremony certificate`
- `site:gov.uk citizenship ceremonies attend in person 18 local authority abroad embassy`

**Nominated pages:**

- [https://www.gov.uk/government/publications/british-citizenship-successful-applicants/citizenship-ceremonies-guidance-notes-english-and-welsh](https://www.gov.uk/government/publications/british-citizenship-successful-applicants/citizenship-ceremonies-guidance-notes-english-and-welsh) — Says under-18 applicants with parents may attend family ceremony or family member may collect certificate.
- [https://www.gov.uk/citizenship-ceremonies](https://www.gov.uk/citizenship-ceremonies) — Adults' attendance rule and local-authority or embassy/consulate booking.
- [https://www.gov.uk/government/publications/children-nationality-policy-guidance/registration-as-british-citizen-children-accessible](https://www.gov.uk/government/publications/children-nationality-policy-guidance/registration-as-british-citizen-children-accessible) — Current Home Office policy says children have no legal attendance requirement.

Finder caution: Children can attend if part of successful family application, but are not required; 'included on a parent's ceremony' needs this qualifier. Main page requires adults to attend, but does not explicitly say 'in person'.

<details><summary>All fetched pages in judge prompt</summary>

- [https://www.gov.uk/citizenship-ceremonies](https://www.gov.uk/citizenship-ceremonies) (cited or linked)
- [https://www.gov.uk/apply-citizenship-indefinite-leave-to-remain](https://www.gov.uk/apply-citizenship-indefinite-leave-to-remain) (cited or linked)
- [https://www.gov.uk/apply-citizenship-spouse](https://www.gov.uk/apply-citizenship-spouse) (cited or linked)
- [https://www.gov.uk/apply-first-adult-passport](https://www.gov.uk/apply-first-adult-passport) (cited or linked)
- [https://www.gov.uk/life-in-the-uk-test](https://www.gov.uk/life-in-the-uk-test) (cited or linked)
- [https://www.gov.uk/government/publications/british-citizenship-successful-applicants/citizenship-ceremonies-guidance-notes-english-and-welsh](https://www.gov.uk/government/publications/british-citizenship-successful-applicants/citizenship-ceremonies-guidance-notes-english-and-welsh) (found by search)
- [https://www.gov.uk/government/publications/children-nationality-policy-guidance/registration-as-british-citizen-children-accessible](https://www.gov.uk/government/publications/children-nationality-policy-guidance/registration-as-british-citizen-children-accessible) (found by search)

</details>

