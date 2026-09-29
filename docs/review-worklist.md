# Review worklist: partly supported fields

Generated 2026-09-29 by `scripts/triage-partly.ts` from the verification review queues. Each item is a field the official pages only partly support. **High**: a typical person acting on it would probably reach a wrong outcome (eligibility, amount, fee, deadline, or how to apply). **Medium**: wrong for some groups or situations, or imprecise in a way that matters. **Low**: elaboration no page states. "Cite" marks a claim that is probably true and needs a source rather than new wording.

Groups follow the phase 4 order of the data quality plan. Each service appears once, under the highest-risk life event it belongs to.

| Life event | High | Medium | Low (elaboration) |
|---|---|---|---|
| Already reviewed events (baby, job loss, divorce, moving house): sweep | 15 | 33 | 15 |
| Disability or Health Condition | 29 | 57 | 20 |
| Becoming a Carer | 2 | 4 | 5 |
| Terminal Illness Diagnosis | 2 | 2 | 0 |
| Retiring | 15 | 31 | 8 |
| Death of Someone Close | 13 | 15 | 8 |
| Arriving in the UK | 18 | 36 | 23 |
| Starting a Business | 13 | 39 | 18 |
| Buying a Home | 6 | 19 | 7 |
| Starting a New Job | 19 | 27 | 10 |
| Getting Married | 5 | 11 | 3 |
| Going to University | 0 | 0 | 1 |
| Child Starting School | 3 | 9 | 7 |
| Learning to Drive | 5 | 20 | 2 |
| In no life event | 16 | 24 | 10 |
| **Total** | **161** | **327** | **137** |

## Already reviewed events (baby, job loss, divorce, moving house): sweep

### High and medium (48)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `hmcts-legal-aid` | `eligibility.criteria.0` | Describe £2,657 as a joint gross monthly income limit rather than disposable income, and cite a source for thresholds varying by case type or remove it. |  |
| High | `other-statutory-redundancy` | `eligibility.criteria.0` | Drop the compulsory redundancy requirement and add the lay-off and short-time working route. |  |
| High | `dwp-maternity-allowance` | `eligibility.evidenceRequired.2` | Remove 'accounts' and state that original payslips are required. |  |
| High | `hmcts-employment-tribunal` | `eligibility.exclusions.1` | Say the limit is usually 3 months, that it runs from the end of employment for unfair dismissal, and that the clock is paused during Acas early conciliation. |  |
| High | `hmcts-legal-aid` | `eligibility.autoQualifiers.0` | Add the condition that the victim cannot afford legal costs, and drop the limit to family proceedings. |  |
| High | `hmcts-legal-aid` | `eligibility.evidenceRequired.0` | Correct this to CW2 (IMM) for immigration exceptional case funding only, or cite the correct general means form. |  |
| High | `dvla-update-address` | `agentInteraction.authRequired` | Remove the Government Gateway reference and describe only the sign-in the official page names. |  |
| High | `dwp-maternity-allowance` | `agentInteraction.methods` | State that the MA1 form can be filled in online but must be printed and posted to the address on the form. |  |
| High | `hmcts-financial-order` | `agentInteraction.methods` | Remove the online application route unless an official source for it is found. |  |
| High | `hmcts-legal-aid` | `agentInteraction.methods` | Change this to say you can check eligibility online or by phone, but a legal adviser makes the application. |  |
| High | `hmrc-tax-refund` | `agentInteraction.methods` | Remove the phone application route unless an official source confirms it. |  |
| High | `hmrc-p45` | `eligibility.summary` | Say the P45 helps with, but is not required for, a new job or tax refund, limit benefit claims to taxable benefits, and cite PAYE rules for the legal duty. |  |
| High | `hmcts-legal-aid` | `desc` | Say a legal adviser applies for you, and remove the Legal Aid Agency as the place to apply. |  |
| High | `hmrc-free-childcare-15` | `desc` | Cite the official page that says the universal 15 hours needs no application and is arranged directly with the childcare provider. | Cite |
| High | `hmrc-p45` | `desc` | Remove the last-day deadline and say a new employer can use the starter checklist instead of a P45. |  |
| Med | `dwp-new-style-jsa` | `eligibility.criteria.0` | Say Class 1 contributions for the last 2 tax years are usually needed, and that credits can count for one of those years. |  |
| Med | `gro-register-birth` | `eligibility.criteria.1` | Cite the official Scottish source for the 21-day deadline. | Cite |
| Med | `hmcts-child-arrangements` | `eligibility.criteria.1` | Add that other relatives, such as grandparents, can apply, and cite or correct the age limits. |  |
| Med | `hmcts-divorce` | `eligibility.criteria.0` | Change the criterion to say married for over a year, and cover civil partnerships under the separate process for ending a civil partnership. |  |
| Med | `hmcts-employment-tribunal` | `eligibility.criteria.0` | Cite the official page stating that discrimination claims have no qualifying service period. | Cite |
| Med | `hmcts-employment-tribunal` | `eligibility.criteria.1` | Say you must notify Acas and usually need a certificate, list the exceptions, and say that taking part in conciliation is optional. |  |
| Med | `hmrc-cancel-marriage-allowance` | `eligibility.criteria.0` | Remove partner's death as a reason to cancel and cover bereavement as a separate case where the allowances change. |  |
| Med | `hmrc-child-benefit-transfer` | `eligibility.criteria.0` | Cite the rule that Child Benefit goes to the person the child lives with, and widen it beyond separated parents. | Cite |
| Med | `hmrc-child-benefit-transfer` | `eligibility.criteria.1` | Remove the condition that the current claimant must no longer be the main carer. |  |
| Med | `hmrc-spl` | `eligibility.criteria.2` | Reword the criterion so maternity leave entitlement also counts, and state the separate work and earnings test for the mother when the partner takes SPL. |  |
| Med | `hmrc-spp` | `eligibility.criteria.0` | State that the 26 weeks must be reached by the qualifying week, give the £129 average weekly earnings figure, and cite the page that links it to the Lower Earnings Limit. | Cite |
| Med | `hmrc-tax-refund` | `eligibility.criteria.1` | Reword the pension condition to match the page's 'taxable income such as a works pension' wording, or cite a source for it. | Cite |
| Med | `dwp-maternity-allowance` | `eligibility.evidenceRequired.1` | Cite the MA1 guidance for self-employment evidence, or limit this to the employment details the form asks for. | Cite |
| Med | `dwp-new-style-jsa` | `eligibility.evidenceRequired.3` | Change to proof of job-seeking activity, and say a CV is only needed if the Claimant Commitment asks for one. |  |
| Med | `hmcts-divorce` | `eligibility.evidenceRequired.0` | Limit this evidence item to the marriage certificate and send civil partners to the separate process for ending a civil partnership. |  |
| Med | `hmcts-financial-order` | `eligibility.evidenceRequired.0` | Remove the D81 label from the draft consent order and list the D81 statement of information as a separate item. |  |
| Med | `hmcts-financial-order` | `eligibility.evidenceRequired.1` | Replace this with 'Statement of information form completed by both parties'. |  |
| Med | `hmrc-cancel-marriage-allowance` | `eligibility.evidenceRequired.0` | Replace the Government Gateway reference with proving identity using information HMRC holds, online or by phone through Marriage Allowance enquiries. |  |
| Med | `hmrc-smp` | `eligibility.evidenceRequired.1` | Reword to say notice of the start date is required, and it only has to be in writing if the employer asks. |  |
| Med | `nhs-maternity-exemption` | `eligibility.evidenceRequired.0` | Cite the official page describing the maternity exemption application form (FW8) that the health professional completes and signs, or reword it to say the professional completes the application. | Cite |
| Med | `dwp-new-style-jsa` | `agentInteraction.methods` | Cite the official page that gives the Jobcentre Plus phone route for applying, or change the wording to 'contact Jobcentre Plus'. | Cite |
| Med | `nhs-maternity-exemption` | `agentInteraction.methods` | Reword it to say you apply by asking your midwife, doctor or health visitor, and remove the unsupported 'in person' requirement. |  |
| Med | `dhsc-baby-loss-certificate` | `eligibility.summary` | Cite the official baby loss certificate guidance confirming that miscarriage and ectopic pregnancy are included. | Cite |
| Med | `dwp-child-maintenance` | `eligibility.summary` | Cite official sources for the income-based calculation and the Collect & Pay fees, and make clear that parents don't have to fail to agree before they can use the CMS. | Cite |
| Med | `gro-register-birth` | `eligibility.summary` | Cite the Scottish registration guidance for the 21-day deadline and the requirement to register every birth, or limit the statement to England, Wales and Northern Ireland. | Cite |
| Med | `hmcts-divorce` | `eligibility.summary` | Cite the official page that says divorce has been no-fault since 6 April 2022 and needs no reason. | Cite |
| Med | `hmcts-employment-tribunal` | `eligibility.summary` | Replace 'anyone' with the actual condition, mention the separate Northern Ireland route, say Acas must be notified rather than conciliation completed, and cite a source for 'minus 1 day'. |  |
| Med | `hmcts-legal-aid` | `eligibility.summary` | Replace 'automatic eligibility' with 'may still qualify above the limits', and cite a source for the merits test. |  |
| Med | `hmrc-child-benefit-transfer` | `eligibility.summary` | Replace 'must be transferred to the main carer' with the official rule that the person the child now lives with makes a new claim, and that priority rules decide between two claimants. |  |
| Med | `hmrc-tax-free-childcare` | `eligibility.summary` | Change 'must' to 'usually' and add the exception for a non-working partner who gets certain benefits. |  |
| Med | `other-statutory-redundancy` | `eligibility.summary` | Remove the word "compulsorily" and add that laid-off or short-time workers can also qualify. |  |
| Med | `acas-early-conciliation` | `desc` | Reword to say notifying Acas is mandatory for most claims but taking part in conciliation is voluntary, and cite the Acas page confirming the service is free. |  |
| Med | `dwp-child-maintenance` | `desc` | Cite the GOV.UK page that says the CMS works out payments from the paying parent's income, and reword the 'cannot agree' condition so it doesn't sound like a strict eligibility rule. | Cite |

### Low: elaboration (15)

`acas-early-conciliation` 2, `hmrc-p45` 1, `hmrc-tax-free-childcare` 1, `hmcts-legal-aid` 1, `hmrc-smp` 2, `hmrc-spl` 1, `hmrc-tax-refund` 1, `dvla-change-address-v5c` 1, `dwp-maternity-allowance` 2, `hmcts-financial-order` 1, `hmrc-cancel-marriage-allowance` 1, `hmrc-child-benefit-transfer` 1

## Disability or Health Condition

### High and medium (86)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `dwp-benefit-debt-repayment` | `eligibility.criteria.0` | Remove notification as a requirement and add that people who think they are being overpaid should report it. |  |
| High | `dwp-pip` | `eligibility.criteria.0` | Use State Pension age as the limit, and state the exception as getting PIP or ADP in the last 12 months. |  |
| High | `la-carers-assessment` | `eligibility.criteria.0` | Drop 'substantial' and match the page's wording: an adult over 18 who regularly cares for someone ill, older or disabled. |  |
| High | `la-council-tax-disability-reduction` | `eligibility.criteria.1` | Remove the bedroom exclusion and cite a source for the 'mainly used' condition. |  |
| High | `other-disabled-railcard` | `eligibility.criteria.0` | Remove the companion-disability category, limit DLA to the qualifying rates, and change hearing impairment to evidence of deafness or hearing aid use. |  |
| High | `sss-adult-disability-payment` | `eligibility.criteria.1` | Cite the official eligibility guidance for the 13-week and 9-month condition duration rules. | Cite |
| High | `dvla-notify-condition` | `eligibility.evidenceRequired.0` | Replace with 'Your GP or consultant's name and address; DVLA may contact your doctor', and remove the requirement for medical reports. |  |
| High | `dwp-access-to-work` | `eligibility.evidenceRequired.0` | Replace with workplace address and a workplace contact who can confirm employment, or a UTR if self-employed. |  |
| High | `dwp-carers-allowance` | `eligibility.autoQualifiers.0` | Replace 'enhanced rate' with 'any rate' and replace the 16-hour work limit with the £204 a week earnings limit. |  |
| High | `dwp-dla-child` | `eligibility.evidenceRequired.0` | Remove the general medical evidence requirement and mention form SR1 only for the end-of-life route. |  |
| High | `dwp-pip` | `eligibility.evidenceRequired.1` | Reword to say doctor's information is optional, include it if you have it, and drop the mention of specialists. |  |
| High | `la-blue-badge` | `eligibility.evidenceRequired.2` | Replace it with applying online through the GOV.UK Blue Badge service, noting that the council makes the decision. |  |
| High | `la-carers-assessment` | `eligibility.evidenceRequired.0` | Remove the 'no formal documentation required' claim and list the information the page says you'll need. |  |
| High | `la-disabled-facilities-grant` | `eligibility.evidenceRequired.0` | Remove the OT assessment from required evidence and say the council may arrange an assessment by an OT or trained assessor. |  |
| High | `dwp-benefit-debt-repayment` | `agentInteraction.methods` | Change the online method to reporting a Universal Credit overpayment, not repaying. |  |
| High | `dwp-carers-allowance` | `agentInteraction.methods` | Remove applying by phone and say the phone line is only for asking for a claim form. |  |
| High | `dwp-mandatory-reconsideration` | `agentInteraction.methods` | Limit the online route to Universal Credit decisions requested through the journal, and give phone or post for other benefits. |  |
| High | `nhs-111-online` | `agentInteraction.methods` | Cite the official page that gives the 111 phone number as a way to contact the service. | Cite |
| High | `sss-young-carer-grant` | `agentInteraction.methods` | Cite the official page that confirms the Young Carer Grant can be applied for online. | Cite |
| High | `dwp-uc-carer` | `eligibility.summary` | Restate the condition as caring 35+ hours a week for someone on a listed benefit, and cite a source for the 'no need to claim Carer's Allowance' point or remove it. |  |
| High | `la-blue-badge` | `eligibility.summary` | Change the route to the GOV.UK online service, give the fee for each nation (up to £10 England, up to £20 Scotland, free in Wales), and cite the eligibility page for automatic and discretionary criteria. |  |
| High | `nhs-111-online` | `eligibility.summary` | Cite official sources that say the service is free, runs 24/7, covers England and is for non-life-threatening situations, and that list the possible outcomes. | Cite |
| High | `nhs-free-prescriptions` | `eligibility.summary` | Replace the benefit list with the actual exemptions (e.g. income-related ESA, UC under the earnings threshold, medical exemption) and cite the source for the named conditions. |  |
| High | `other-carers-leave` | `eligibility.summary` | Restate the entitlement as one working week every 12 months based on usual working pattern, and cite the April 2024 start date. |  |
| High | `other-disabled-railcard` | `eligibility.summary` | Remove the 'severe mental or physical disability' category and list only the qualifying conditions the source gives. |  |
| High | `sss-adult-disability-payment` | `eligibility.summary` | Cite the official page for the age limits (16 to State Pension age), noting the exception for existing claimants over State Pension age. | Cite |
| High | `dwp-benefit-debt-repayment` | `desc` | Remove the claims that DWP overpayments can be repaid online or by Direct Debit unless a DWP source confirms them. |  |
| High | `la-blue-badge` | `desc` | Say that applications are made online through the GOV.UK Blue Badge service, and state the automatic eligibility rule exactly from the eligibility page. |  |
| High | `other-disabled-railcard` | `desc` | Remove 'qualify automatically' and state that proof such as an award letter is required. |  |
| Med | `dvla-renew-at-70` | `eligibility.criteria.1` | Cite the DVLA guidance saying applicants must declare eyesight and fitness to drive, and that DVLA may ask for medical evidence about declared conditions. | Cite |
| Med | `dwp-attendance-allowance` | `eligibility.criteria.0` | Cite the State Pension age guidance for 66 and note that the age is rising to 67. | Cite |
| Med | `dwp-dla-child` | `eligibility.criteria.2` | Say this service covers England and Wales, and send Northern Ireland families to the separate DLA for children in Northern Ireland application. |  |
| Med | `dwp-mandatory-reconsideration` | `eligibility.criteria.0` | Add that some decisions can go straight to an appeal, and cite a source that names DWP. |  |
| Med | `dwp-pip` | `eligibility.criteria.1` | Cite the official source for the 3-month and 9-month periods, or reword to the 12-month expectation in the text. | Cite |
| Med | `dwp-uc-carer` | `eligibility.criteria.0` | Remove the 'Eligible for Carer's Allowance' framing and keep the 35+ hours caring for someone on a listed benefit test. |  |
| Med | `hmcts-benefit-tribunal` | `eligibility.criteria.0` | Add the exception that some decision letters allow an appeal straight away without Mandatory Reconsideration. |  |
| Med | `hmrc-carers-credit` | `eligibility.criteria.1` | Cite the official page confirming that Universal Credit claimants already get NI credits, or remove the Universal Credit reference. | Cite |
| Med | `la-disabled-facilities-grant` | `eligibility.criteria.1` | Include Wales and Northern Ireland, and list owners, tenants and landlords where the disabled person intends to live. |  |
| Med | `nhs-continuing-healthcare` | `eligibility.criteria.0` | Cite the National Framework for the need characteristics and soften or source the 'usually progressive or terminal illness' examples. | Cite |
| Med | `other-carers-leave` | `eligibility.criteria.0` | Cite official carer's leave guidance that limits the right to employees, rather than relying on the parental leave page. | Cite |
| Med | `other-motability` | `eligibility.criteria.0` | Cite the Motability eligibility page, change 'DLA highest rate' to 'higher rate', and add the Scottish Adult and Child Disability Payment equivalents. | Cite |
| Med | `sss-carer-support-payment` | `eligibility.criteria.3` | Change to 'usually must live in Scotland' and add the EU/EEA and Armed Forces/Civil Service exceptions. |  |
| Med | `sss-child-disability-payment` | `eligibility.criteria.1` | Cite the official test comparing the child with a child of the same age, or drop 'substantially' if no source supports it. | Cite |
| Med | `dvla-notify-condition` | `eligibility.evidenceRequired.1` | Say that condition-specific forms are required for bus, coach and lorry licence holders, and that car and motorcycle drivers can report online. |  |
| Med | `dvla-renew-at-70` | `eligibility.evidenceRequired.0` | Reword so the current licence appears only as one example of photo ID, not a required item. |  |
| Med | `dwp-access-to-work` | `eligibility.evidenceRequired.1` | Reword to say you may be asked for more information about your condition and no diagnosis is needed. |  |
| Med | `dwp-attendance-allowance` | `eligibility.autoQualifiers.0` | Remove the DS1500 reference and 'immediately', and name only the SR1 form under the special rules for end of life. |  |
| Med | `dwp-attendance-allowance` | `eligibility.exclusions.0` | Cite the PIP guidance for the under-State-Pension-age route and add that people in Scotland claim Adult Disability Payment instead. | Cite |
| Med | `dwp-mandatory-reconsideration` | `eligibility.evidenceRequired.0` | Change this to the date of the original decision rather than the letter as required evidence. |  |
| Med | `dwp-pip` | `eligibility.autoQualifiers.0` | Change 'no assessment required' to 'no face-to-face assessment'. |  |
| Med | `dwp-uc-carer` | `eligibility.autoQualifiers.0` | Change the qualifier to being on Universal Credit and caring 35+ hours a week for someone who gets a listed benefit. |  |
| Med | `hmcts-benefit-tribunal` | `eligibility.evidenceRequired.0` | Say that SSCS1 is only for postal appeals outside Child Maintenance and Vaccine Damage Payment, and that a reason for not needing reconsideration can be given instead of the notice. |  |
| Med | `hmrc-carers-credit` | `eligibility.evidenceRequired.0` | Cite the official Carer's Credit claim form page that gives the form number CA9176. | Cite |
| Med | `hmrc-carers-credit` | `eligibility.evidenceRequired.1` | Cite the claim form guidance showing that applicants must give details of the cared-for person's benefit. | Cite |
| Med | `la-blue-badge` | `eligibility.evidenceRequired.0` | Make it conditional ('proof of benefits, if you get any') and cite the page that names award letters as accepted proof. | Cite |
| Med | `nhs-care-assessment` | `eligibility.evidenceRequired.0` | Cite a source for the no-evidence claim and note that any financial assessment will need income and savings details. | Cite |
| Med | `other-disabled-railcard` | `eligibility.evidenceRequired.1` | Replace 'Photo ID' with the passport-style photo requirement and say that proof of ID may be needed. |  |
| Med | `sss-carer-support-payment` | `eligibility.exclusions.1` | Limit the 21-hour exclusion to certain school or college courses, and state that full-time university and HNC/HND students can qualify and that exceptional circumstances apply. |  |
| Med | `sss-carers-allowance-supplement` | `eligibility.autoQualifiers.0` | Add the exclusion for people getting Scottish Carer Supplement and cover the route for eligible people living abroad. |  |
| Med | `sss-child-disability-payment` | `eligibility.exclusions.0` | Limit the exclusion to new applications, cite the Adult Disability Payment route, and note that existing awards can continue past 16. | Cite |
| Med | `dwp-pip` | `agentInteraction.methods` | Say the full application can be made online only in some areas, and describe the phone and post routes correctly. |  |
| Med | `nhs-free-prescriptions` | `agentInteraction.methods` | Separate the routes: say a PPC can be bought online, and a medical exemption certificate is applied for through your GP using form FP92A. |  |
| Med | `dvla-renew-at-70` | `eligibility.summary` | Cite the official pages for expiry at 70, the self-declaration, and it being unlawful to drive on an expired licence. | Cite |
| Med | `dwp-benefit-debt-repayment` | `eligibility.summary` | Add that tax credits, Child Benefit, Social Security Scotland and Department for Communities overpayments follow separate processes. |  |
| Med | `dwp-dla-child` | `eligibility.summary` | Cite an official DLA source saying income and savings do not affect DLA, not the PIP page. | Cite |
| Med | `dwp-mandatory-reconsideration` | `eligibility.summary` | Add the exception for decisions that can go straight to an appeal, and cite a source that names DWP. |  |
| Med | `dwp-pip` | `eligibility.summary` | Replace '16 to 64' with '16 or over and under State Pension age'. |  |
| Med | `la-council-tax-disability-reduction` | `eligibility.summary` | Cite the council tax reduction regulations or council guidance for the 'used mainly by the disabled person' condition. | Cite |
| Med | `la-disabled-facilities-grant` | `eligibility.summary` | Say landlords are also exempt from the means test and the council may send an occupational therapist or trained assessor, rather than saying an OT assessment is required. |  |
| Med | `nhs-continuing-healthcare` | `eligibility.summary` | Cite the National Framework and the Decision Support Tool guidance for the need characteristics, the multidisciplinary team assessment and the any-setting statement. | Cite |
| Med | `other-motability` | `eligibility.summary` | Cite the Motability scheme pages for the vehicle types, direct payment and no credit check, and name all qualifying allowances. | Cite |
| Med | `sss-child-winter-heating` | `eligibility.summary` | Cite the official eligibility criteria and add the Adult Disability Payment and PIP route for young people and the minority who must apply. | Cite |
| Med | `dvla-renew-at-70` | `desc` | Cite the official pages saying licences expire at 70, that renewal includes a medical self-declaration, and that driving without a valid licence is unlawful. | Cite |
| Med | `dwp-access-to-work` | `desc` | Add that travel costs are covered only if you cannot use public transport. |  |
| Med | `dwp-attendance-allowance` | `desc` | Replace 'over-65s' with 'people who have reached State Pension age'. |  |
| Med | `dwp-carers-allowance` | `desc` | Change 'PIP' to 'the daily living component of PIP'. |  |
| Med | `dwp-mandatory-reconsideration` | `desc` | Say that most decisions need a mandatory reconsideration before an appeal, but some can go straight to a tribunal, and cite a source that names DWP. |  |
| Med | `dwp-pip` | `desc` | Replace 'under-65s' with '16 or over and under State Pension age'. |  |
| Med | `dwp-uc-carer` | `desc` | Replace 'if eligible for Carer's Allowance' with caring at least 35 hours a week for someone who gets a listed benefit. |  |
| Med | `dwp-uc-health` | `desc` | Cite the official UC health guidance showing that a fit note is needed and that a Work Capability Assessment decides the element. | Cite |
| Med | `la-disabled-facilities-grant` | `desc` | Say the £30,000 limit applies in England and that Wales and Northern Ireland have different limits. |  |
| Med | `nhs-111-online` | `desc` | Cite the official NHS 111 pages that give the 111 phone number and say to call 999 in an emergency. | Cite |
| Med | `nhs-continuing-healthcare` | `desc` | Cite the National Framework for NHS Continuing Healthcare for the no-means-test statement and what the package covers. | Cite |
| Med | `other-carers-leave` | `desc` | Replace the fixed 5 days with one working week every 12 months, and cite the April 2024 start date. |  |
| Med | `other-motability` | `desc` | Cite the Motability eligibility page and list all qualifying allowances, not only Enhanced Rate PIP mobility. | Cite |
| Med | `sss-child-winter-heating` | `desc` | Change "no application needed" to say most people do not need to apply, and cite the residency page for the Scotland requirement. | Cite |

### Low: elaboration (20)

`dwp-uc-health` 2, `dwp-pip` 1, `dwp-uc-carer` 1, `hmcts-benefit-tribunal` 3, `la-disabled-facilities-grant` 1, `nhs-gp-register` 2, `other-disabled-railcard` 1, `sss-child-disability-payment` 3, `la-carers-assessment` 1, `sss-carer-support-payment` 2, `nhs-care-assessment` 1, `nhs-free-prescriptions` 1, `sss-adult-disability-payment` 1

## Becoming a Carer

### High and medium (6)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `opg-lpa-activation` | `eligibility.evidenceRequired.0` | Say a death certificate is needed only if the person died outside the UK. |  |
| High | `opg-lpa-activation` | `agentInteraction.methods` | Remove the online and phone options and say the original LPA must be sent to OPG. |  |
| Med | `opg-lpa-activation` | `eligibility.criteria.0` | Cite an official page saying the LPA must be registered, or drop the registration condition. | Cite |
| Med | `opg-lpa-activation` | `eligibility.criteria.1` | Cite an official page saying reporting a death applies only to registered LPAs. | Cite |
| Med | `opg-lpa` | `eligibility.summary` | Replace 'can be used immediately' with 'can be used once registered, with the donor's permission'. |  |
| Med | `opg-lpa` | `desc` | Change the text to say the donor must have capacity to make the LPA, and that an attorney can register it later. |  |

### Low: elaboration (5)

`opg-lpa` 2, `opg-deputy-report` 1, `opg-lpa-refund` 2

## Terminal Illness Diagnosis

### High and medium (4)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `dwp-sr1-form` | `eligibility.autoQualifiers.0` | Replace with 'progressive disease where the clinician would not be surprised if the patient lived less than 12 months', and say no specific prognosis is needed. |  |
| High | `dwp-sr1-form` | `agentInteraction.methods` | Remove phone and list online, email and post as the ways to send the SR1. |  |
| Med | `dwp-sr1-form` | `eligibility.summary` | Reword to the official test: the clinician would not be surprised if the patient died within 12 months. |  |
| Med | `dwp-sr1-form` | `desc` | Cite the benefit pages for the four benefits and the waived waiting periods, and change 'automatically awarding enhanced rates' to 'higher payments in most cases'. | Cite |

## Retiring

### High and medium (46)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `dwp-voluntary-ni-contributions` | `eligibility.criteria.1` | Remove the under-State-Pension-age requirement and keep only the 6-year deadline window. |  |
| High | `sss-funeral-support-payment` | `eligibility.criteria.0` | Cite the official eligibility page stating that the applicant must be responsible for the funeral costs. | Cite |
| High | `dwp-housing-benefit` | `eligibility.evidenceRequired.0` | Limit this to private landlord tenants and list a rent book or a letter from the landlord as alternatives. |  |
| High | `dwp-winter-fuel` | `eligibility.autoQualifiers.0` | Say that people without a listed benefit only need to claim if they have not had the payment before or have deferred their State Pension since their last payment. |  |
| High | `other-warm-home-discount` | `eligibility.evidenceRequired.0` | Limit the account number to people writing to the scheme after their supplier could not apply the discount. |  |
| High | `dwp-housing-benefit` | `agentInteraction.methods` | Say that online and phone applications are only available through a Pension Credit claim with the Pension Service, and that the council route has no stated online or phone method. |  |
| High | `ni-rate-rebate` | `agentInteraction.methods` | Remove the unsupported postal application route. |  |
| High | `dwp-inherited-state-pension` | `eligibility.summary` | Replace the 'depends entirely on NI record, no standard rate' claim with the stated proportions, such as half of a protected payment. |  |
| High | `dwp-pension-tracing` | `eligibility.summary` | Replace 'anyone' with the actual conditions: it covers your own pension, or someone else's with their permission, and you need an employer or provider name. Also say the service gives contact details only and does not confirm whether you have a pension. |  |
| High | `dwp-state-pension` | `eligibility.summary` | Replace the fixed age of 66 with a pointer to the State Pension age checker, and limit the 35-year rule to records that started after April 2016. |  |
| High | `sss-funeral-support-payment` | `eligibility.summary` | Cite the official pages for the qualifying benefits rule and for the application window from the date of death to 6 months after the funeral. | Cite |
| High | `wg-winter-fuel-support` | `eligibility.summary` | Cite an official source for the 31 March 2026 launch date and the 30 September 2026 closing date. | Cite |
| High | `dwp-inherited-state-pension` | `desc` | Say only part of the Additional State Pension can be inherited, and tie eligibility to when the deceased partner reached State Pension age, when they died and when the marriage began. |  |
| High | `sss-funeral-support-payment` | `desc` | Cite the official page that gives the general 6-month application deadline. | Cite |
| High | `wg-winter-fuel-support` | `desc` | Cite an official page that states the 30 September 2026 closing date and 31 March 2026 launch, and remove the unsourced Winter Fuel Support Scheme replacement claim. | Cite |
| Med | `dwp-pension-credit` | `eligibility.criteria.0` | Cite the State Pension age guidance and note that the age is rising from 66 to 67. | Cite |
| Med | `dwp-smi` | `eligibility.criteria.0` | Replace 'other charge' with 'loan for certain home repairs or improvements'. |  |
| Med | `dwp-state-pension` | `eligibility.criteria.0` | Remove 'currently 66' and point people to the State Pension age checker. |  |
| Med | `dwp-state-pension` | `eligibility.criteria.1` | Limit the 35-year full-amount rule to records that started after April 2016 and add the contracted-out exception. |  |
| Med | `dwp-voluntary-ni-contributions` | `eligibility.criteria.0` | Reword so having gaps is the condition, and tell people to check whether paying will increase their pension. |  |
| Med | `dwp-winter-fuel` | `eligibility.criteria.1` | Remove the requirement to be physically present in England, Wales or Northern Ireland during the qualifying week. |  |
| Med | `la-bus-pass` | `eligibility.criteria.0` | Cite the State Pension age page for the figure 66, or link to the State Pension age checker, noting that it is rising to 67. | Cite |
| Med | `ni-rate-rebate` | `eligibility.criteria.1` | Add that tenants can qualify when either they or their landlord is liable for rates. |  |
| Med | `sss-funeral-support-payment` | `eligibility.criteria.2` | Cite the official funeral location rule and add any exceptions, such as funerals in the EEA or Switzerland. | Cite |
| Med | `dwp-housing-benefit` | `eligibility.exclusions.1` | Change the exclusion to people paying a mortgage on their own home, note it applies 'usually', or cite a source that covers all owner-occupiers. | Cite |
| Med | `dwp-inherited-state-pension` | `eligibility.exclusions.0` | Cite the official source that says divorced former partners cannot inherit and are covered by pension sharing orders instead. | Cite |
| Med | `dwp-pension-credit` | `eligibility.evidenceRequired.2` | Change to 'Details of savings and investments' unless a source says documents are needed. |  |
| Med | `dwp-state-pension` | `eligibility.autoQualifiers.0` | Limit the 35-years-for-full-rate figure to records that started after April 2016 and note that contracted-out people usually need more. |  |
| Med | `dwp-winter-fuel` | `eligibility.exclusions.1` | Add that the hospital exclusion only applies to free treatment for the whole year before the qualifying week. |  |
| Med | `hmrc-ni-check` | `eligibility.evidenceRequired.0` | Cite the sign-in page and name every accepted sign-in method, not only Government Gateway. | Cite |
| Med | `hmrc-ni-check` | `eligibility.evidenceRequired.1` | Say the NI number is needed only to request a printed statement online from the UK, not for the main online check. |  |
| Med | `other-warm-home-discount` | `eligibility.autoQualifiers.0` | Change 'Pension Credit Guarantee Credit' to 'Pension Credit', as the source says. |  |
| Med | `dwp-inherited-state-pension` | `agentInteraction.methods` | Cite the Pension Service contact route for claiming inherited State Pension instead of the general State Pension phone-claim rule. | Cite |
| Med | `hmrc-ni-check` | `agentInteraction.authRequired` | Cite the source that names the sign-in account, or list every accepted sign-in method. | Cite |
| Med | `hmrc-tax-on-pension` | `agentInteraction.methods` | Cite HMRC's Income Tax helpline page for the phone route, or remove the phone claim. | Cite |
| Med | `dwp-housing-benefit` | `eligibility.summary` | Add the supported, sheltered and temporary housing exception for working-age claimants, add the Pension Service route through a Pension Credit claim, and remove 'not DWP directly'. |  |
| Med | `hmrc-ni-check` | `eligibility.summary` | Cite the page that says the online check is free and done through the Personal Tax Account, and drop 'anyone' and 'critical before retirement'. | Cite |
| Med | `la-bus-pass` | `eligibility.summary` | Cite the English concessionary travel page for off-peak and England-wide travel, and remove the unsourced processing time. | Cite |
| Med | `la-council-tax-reduction` | `eligibility.summary` | Replace the 'to zero on very low income' wording with 'by up to 100%, depending on your council's scheme'. |  |
| Med | `other-social-tariff-broadband` | `eligibility.summary` | Replace 'means-tested benefits' with 'some other benefits' and say that some providers also accept non-means-tested benefits such as Personal Independence Payment and Attendance Allowance. |  |
| Med | `dwp-housing-benefit` | `desc` | Add the new-claim route for people in supported, sheltered or temporary housing, and cite a source for the 3-month backdating limit or remove it. |  |
| Med | `dwp-pension-credit` | `desc` | Add the 75 or over condition to the free TV licence and cite a source for the Winter Fuel Payment link. |  |
| Med | `dwp-state-pension` | `desc` | Cite the page giving the general 4-month claim window, or say that online claims need an invitation code requested within 3 months. | Cite |
| Med | `la-bus-pass` | `desc` | State that the qualifying age is 60 in Wales, Scotland, Northern Ireland and for London travel, and State Pension age elsewhere in England. |  |
| Med | `la-council-tax-reduction` | `desc` | Reword to say the bill can be reduced by up to 100% depending on the local council's scheme, without tying zero to very low income. |  |
| Med | `other-warm-home-discount` | `desc` | Say the discount is 'usually' automatic, and cite the England and Wales eligibility page for the nation split. | Cite |

### Low: elaboration (8)

`la-council-tax-reduction` 1, `other-tv-licence-pension` 1, `dwp-pension-credit` 1, `dwp-voluntary-ni-contributions` 1, `dwp-pension-tracing` 1, `dwp-smi` 1, `hmrc-ni-check` 1, `ni-rate-rebate` 1

## Death of Someone Close

### High and medium (28)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `la-council-tax-single-discount` | `eligibility.criteria.0` | Remove 'following bereavement or separation' so the criterion is just being the only adult (18+) living in the property. |  |
| High | `dwp-tell-us-once` | `eligibility.evidenceRequired.1` | Say the NI number is needed only for certain pension schemes and is otherwise optional. |  |
| High | `gro-death-certificate` | `eligibility.evidenceRequired.0` | Mark the GRO index reference number as optional and state the £3.50 extra search fee when it is not given. |  |
| High | `fco-document-legalisation` | `agentInteraction.methods` | Say that every application is made online, and that for paper apostilles the documents are posted only after applying online. |  |
| High | `hmrc-statutory-parental-bereavement` | `agentInteraction.methods` | Say that notice for leave can be given by phone but pay must be claimed from the employer in writing. |  |
| High | `dvla-cancel-licence` | `eligibility.summary` | Replace 'usually handled automatically' with a statement that you must tell DVLA yourself, by using Tell Us Once where available or by writing to DVLA. |  |
| High | `gro-certificates` | `eligibility.summary` | Cite the official GRO page that says anyone can order certificates for events registered in England and Wales. | Cite |
| High | `hmcts-probate` | `eligibility.summary` | Remove the £10,000 threshold and say that copies cost £2 only when ordered with the application and £16 each after that. |  |
| High | `hmrc-iht400` | `eligibility.summary` | Tie the requirement to tax being due, not just value, set the deadline as the end of the sixth month after death to avoid interest, and say payment normally starts before probate. |  |
| High | `hmrc-statutory-parental-bereavement` | `eligibility.summary` | State the pay conditions (26 weeks' continuous employment and £129 average weekly earnings) and the rate of £194.32 or 90% of average weekly earnings, whichever is lower. |  |
| High | `hmcts-probate` | `desc` | Remove the £10,000 threshold and say each organisation sets its own rules. |  |
| High | `hmrc-guardians-allowance` | `desc` | Add the conditions that the surviving parent must be in prison for at least 2 years from the other parent's death, or detained in hospital by court order. |  |
| High | `hmrc-iht400` | `desc` | Say IHT400 is needed when tax is owed or full details are required, not just when the estate is over £325,000, and say payment normally has to start before probate rather than be made in full. |  |
| Med | `dwp-bereavement-support` | `eligibility.criteria.1` | Cite the official State Pension age page for the age of 66 and say it is rising to 67. | Cite |
| Med | `dwp-bereavement-support` | `eligibility.criteria.2` | Cite the official guidance for the 25-week figure and add that the contributions must be in a single tax year. | Cite |
| Med | `dwp-funeral-payment` | `eligibility.criteria.0` | Replace the list with the qualifying benefits exactly as the official page gives them, and remove the garbled tax credit wording. |  |
| Med | `dwp-funeral-payment` | `eligibility.criteria.1` | Reword the rule to match the official conditions about the deceased's partner and close relatives who work or aren't on a qualifying benefit. |  |
| Med | `dwp-tell-us-once` | `eligibility.criteria.0` | Say the service covers people who lived in England, Scotland or Wales, and remove 'most of Wales' and the claim that some areas are excluded. |  |
| Med | `gro-register-death` | `eligibility.criteria.0` | Cite the page that limits this route to England and Wales, and add the routes for deaths abroad, in Scotland and in Northern Ireland. | Cite |
| Med | `hmcts-probate` | `eligibility.criteria.0` | Cite an official page that links probate to assets in the person's sole name, or reword the condition to match the source. | Cite |
| Med | `hmcts-probate` | `eligibility.exclusions.0` | Limit the exclusion to property held as joint tenants and to joint money with no other agreement, and say probate 'may not' be needed. |  |
| Med | `hmcts-probate` | `eligibility.evidenceRequired.1` | Say the death certificate is needed only in the situations the official page lists. |  |
| Med | `dwp-funeral-payment` | `eligibility.summary` | Cite the full qualifying benefits list for Income Support, and say the payment is deducted from any money the claimant gets from the estate. | Cite |
| Med | `dwp-tell-us-once` | `eligibility.summary` | Remove 'most' and the 23 figure, and drop the unsourced time-saving claim. |  |
| Med | `fco-document-legalisation` | `eligibility.summary` | Reword to include documents certified by a UK public official, such as notarised or solicitor-certified private documents. |  |
| Med | `gro-death-certificate` | `eligibility.summary` | Cite the official page on who can order certificates and that the death must be registered first, and say which nation the rule covers. | Cite |
| Med | `dwp-bereavement-support` | `desc` | Replace 'had a NI record' with the contribution condition (a certain amount of Class 1 or 2 contributions in one tax year) and add the work accident or work-related disease route. |  |
| Med | `la-council-tax-single-discount` | `desc` | Remove the bereavement or separation condition so the description covers anyone living alone as the only adult. |  |

### Low: elaboration (8)

`dvla-cancel-licence` 1, `gro-death-certificate` 2, `dwp-funeral-payment` 2, `la-council-tax-single-discount` 2, `fco-document-legalisation` 1

## Arriving in the UK

### High and medium (54)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `dfe-care-to-learn` | `eligibility.criteria.0` | Change the criterion to 'Parent must be under 20 at the start of their course'. |  |
| High | `ho-brp` | `eligibility.criteria.0` | Remove the 'more than 6 months' rule and state the 31 October 2024 cut-off, and say that BRPs have been replaced by eVisas. |  |
| High | `ho-evisa-error` | `eligibility.criteria.1` | Remove the general UKVI account requirement and keep only the case of an account set up by the Home Office that you have never signed in to. |  |
| High | `dfe-care-to-learn` | `eligibility.exclusions.0` | Reword the exclusion to 'Parent aged 20 or over when their course starts'. |  |
| High | `dwp-ni-number` | `eligibility.autoQualifiers.0` | Make the right to work the only qualifier and note that BRP holders may already have a number. |  |
| High | `hmcts-gender-recognition` | `eligibility.evidenceRequired.0` | Change it to two reports from UK-registered doctors, or one doctor and one clinical psychologist. |  |
| High | `ho-citizenship` | `eligibility.evidenceRequired.2` | Replace 'test certificate' with the Life in the UK test unique reference number from the pass letter, and cite the official page that says this. |  |
| High | `slc-loan-repayment` | `eligibility.exclusions.3` | Say that Plan 1 loans are written off at age 65 or after 25 years depending on whether the first loan was paid before or after 1 September 2006, with 25 years counted from the April you were first due to repay. |  |
| High | `slc-student-finance` | `eligibility.evidenceRequired.2` | Replace the named documents with the source wording that parents' or partner's household income is assessed. |  |
| High | `ho-brp` | `agentInteraction.methods` | Replace the online and postal BRP application claims with the route of creating a UKVI account to get an eVisa, and mention the postal route only for returning a BRP you have found. |  |
| High | `ho-euss-enquiry` | `agentInteraction.methods` | Cite the EU Settlement Scheme Resolution Centre page for the online enquiry form and phone number. | Cite |
| High | `dfe-care-to-learn` | `eligibility.summary` | Change the age test to 'under 20 at the start of the course' instead of the start of the academic year. |  |
| High | `hmpo-passport` | `eligibility.summary` | Reword to say British nationality is required but some British nationals are not entitled, that only paper applications need a countersignatory (online applications need someone to confirm identity), and that renewers may have to send their old passport or other documents. |  |
| High | `ho-visa` | `eligibility.summary` | Change the wording to say non-British, non-Irish nationals must check whether they need a visa or an ETA, not that they must apply for a visa. |  |
| High | `la-electoral-roll` | `eligibility.summary` | Remove the instruction to de-register from the old address and the claim that registration affects jury eligibility. |  |
| High | `la-postal-vote` | `eligibility.summary` | Say that applicants must give both their National Insurance number (or other ID documents) and a signature, remove the photo ID claim, and cite a source for the application deadline. |  |
| High | `la-proxy-vote` | `eligibility.summary` | Cite the official source for the 5pm, 6-working-days-before deadline and the 5pm polling-day emergency proxy deadline. | Cite |
| High | `slc-student-finance` | `eligibility.summary` | Limit the summary to students whose home is in England who meet the 3-year residence rule, remove or correct the £25,000 threshold for the current system, and drop the unsourced opening date. |  |
| Med | `dwp-ni-number` | `eligibility.criteria.1` | Limit automatic issue to UK residents with a Child Benefit claim and remove the 'mainly non-UK nationals' claim. |  |
| Med | `ho-citizenship` | `eligibility.criteria.2` | Remove the 'no serious criminal record' definition, or replace it with the official good character guidance, which also covers immigration breaches, tax affairs and deception. |  |
| Med | `ho-citizenship-ceremony` | `eligibility.criteria.1` | Cite the ceremony guidance for in-person attendance and for how children under 18 are treated, or remove the claim about children. | Cite |
| Med | `ho-view-immigration-status` | `eligibility.criteria.0` | Cite the official guidance saying EU Settlement Scheme status can be viewed and proved through a UKVI account. | Cite |
| Med | `ho-visa` | `eligibility.criteria.0` | Cite the check-if-you-need-a-visa guidance for visa-free short stays and mention the ETA requirement. | Cite |
| Med | `la-electoral-roll` | `eligibility.criteria.0` | State that the minimum age to register is 16 in England and Northern Ireland and 14 in Scotland and Wales, and limit the age-18 rule to elections such as general elections. |  |
| Med | `la-electoral-roll` | `eligibility.criteria.1` | Say Commonwealth citizens need permission to enter or stay, and that in England and Northern Ireland only certain EU citizens can vote in local elections. |  |
| Med | `la-voter-authority-cert` | `eligibility.criteria.0` | Replace the nationality list with the requirement to be registered to vote. |  |
| Med | `la-voter-authority-cert` | `eligibility.criteria.1` | Add that you can also apply if you no longer look like your photo ID or your name has changed, and say the certificate is only for voting in person. |  |
| Med | `other-right-to-work` | `eligibility.criteria.0` | Reword to say the civil penalty applies when an illegal worker is employed, and that doing the check gives the employer a defence. |  |
| Med | `other-right-to-work` | `eligibility.criteria.1` | Say the share code is one option, and list the other document or Employer Checking Service routes for non-UK/Irish nationals. |  |
| Med | `slc-student-finance` | `eligibility.criteria.1` | Change it to home in England plus 3 years' residence in the UK, Channel Islands or Isle of Man, and add Irish citizens. |  |
| Med | `dwp-ni-number` | `eligibility.evidenceRequired.0` | List passport or EU/EEA/Swiss national identity card as the identity documents instead of BRP. |  |
| Med | `ho-citizenship-spouse` | `eligibility.evidenceRequired.4` | Replace "certificate" with proof of a Life in the UK test pass (e.g. the pass reference) as the official pages describe. |  |
| Med | `ho-citizenship-spouse` | `eligibility.evidenceRequired.5` | Cite the English language requirement guidance and list the exemptions it gives. | Cite |
| Med | `ho-eu-settled-status` | `eligibility.evidenceRequired.1` | Cite the GOV.UK evidence-of-residence page for the example documents and add that documents may not be needed if the National Insurance number check confirms residence. | Cite |
| Med | `la-voter-authority-cert` | `eligibility.evidenceRequired.0` | Remove the electoral registration number option and say that people without a National Insurance number may need to give other documents. |  |
| Med | `la-voter-authority-cert` | `eligibility.evidenceRequired.2` | Describe applying online on GOV.UK and contacting your council for a paper form as two separate routes, and cite the source saying councils process applications. | Cite |
| Med | `slc-loan-repayment` | `eligibility.autoQualifiers.0` | Cite a source showing that deductions depend on the employer knowing the plan type, and add that repayments start from the April after you leave your course. | Cite |
| Med | `slc-loan-repayment` | `eligibility.evidenceRequired.0` | Change the evidence to the 'active plan type letter' you download from your online student loan account. |  |
| Med | `dwp-ni-number` | `eligibility.summary` | Replace the UK citizen and new arrivals claims with the Child Benefit condition for automatic issue. |  |
| Med | `hmcts-gender-recognition` | `eligibility.summary` | Add that the gender dysphoria diagnosis must be made in the UK, and say that the two medical reports are needed on the standard route only, not the overseas route. |  |
| Med | `hmpo-passport-urgent` | `eligibility.summary` | Cite an official passport eligibility page for the British nationality requirement and check whether it applies to this urgent service. | Cite |
| Med | `ho-citizenship-ceremony` | `eligibility.summary` | Replace 'all adults' with the Windrush scheme exception, which lets those applicants choose not to attend. |  |
| Med | `ho-evisa` | `eligibility.summary` | Replace 'required for most' with the page's own list of who can use the service and who doesn't need an eVisa, and cite the guidance on linking your passport and on proving right to work and rent. | Cite |
| Med | `ho-evisa-error` | `eligibility.summary` | Replace 'any eVisa holder' with the situations the page says are covered and not covered, and cite a source for the right-to-work and right-to-rent point or remove it. | Cite |
| Med | `ho-ilr` | `eligibility.summary` | Say the 180-day absence limit applies to specific routes such as Skilled Worker and Scale-up, and cite the continuous residence guidance for each route. | Cite |
| Med | `ho-life-in-uk` | `eligibility.summary` | Change 'over 65' to '65 or over', drop 'any route' and cite a source for the history and values topics. |  |
| Med | `ho-skilled-worker-dependent-visa` | `eligibility.summary` | Cite the official page for dependants' work and study rights, remove "without restriction", and keep the check-current-fees advice as guidance. | Cite |
| Med | `ho-view-immigration-status` | `eligibility.summary` | Cite an official page saying British and Irish citizens do not use this service, or remove the nationality restriction. | Cite |
| Med | `la-voter-authority-cert` | `eligibility.summary` | Limit the scope to England, Scotland and Wales, point Northern Ireland voters to the Electoral Identity Card, and cite a source for the 2023 date or remove it. |  |
| Med | `ho-citizenship-ceremony` | `desc` | Say that attendance is required only for applicants aged 18 or over, and that Windrush applicants can choose whether to attend. |  |
| Med | `ho-evisa-error` | `desc` | Replace the examples with the ones the page gives: name, date of birth, nationality and immigration status. |  |
| Med | `ho-life-in-uk` | `desc` | Change 'over 65' to '65 or over' and replace 'all citizenship routes' with the routes the sources name. |  |
| Med | `ho-skilled-worker-dependent-visa` | `desc` | Cite the dependants' page for work and study rights and remove "without restriction". | Cite |
| Med | `slc-loan-repayment` | `desc` | Cite the GOV.UK page that says to tell your employer your plan type when you start work, or soften the wording to 'check your employer has you on the right plan'. | Cite |

### Low: elaboration (23)

`dwp-ni-number` 2, `ho-life-in-uk` 1, `ho-visa` 2, `la-proxy-vote` 2, `slc-student-finance` 2, `hmcts-gender-recognition` 1, `ho-skilled-worker-dependent-visa` 3, `la-voter-authority-cert` 1, `other-right-to-work` 2, `ho-citizenship-spouse` 2, `hmpo-passport-urgent` 1, `ho-euss-enquiry` 1, `ho-evisa` 1, `ho-evw` 1, `la-postal-vote` 1

## Starting a Business

### High and medium (52)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `hmrc-corporation-tax` | `eligibility.criteria.0` | Restrict the criterion to limited companies that are active and within the charge to Corporation Tax. |  |
| High | `hmrc-register-sole-trader` | `eligibility.criteria.0` | Add the condition of earning more than £1,000 in a tax year and note that people can choose to register earlier. |  |
| High | `hmrc-vat` | `eligibility.criteria.0` | Change the expected-turnover test to exceeding £90,000 in the next 30 days alone, and keep the rolling 12-month test for past turnover only. |  |
| High | `tpr-workplace-pension` | `eligibility.evidenceRequired.2` | Cite The Pensions Regulator's guidance for the first declaration of compliance and its 5-month deadline, and call it a declaration rather than a letter. | Cite |
| High | `hmrc-mtd` | `agentInteraction.methods` | Replace the online application claim with the statement that VAT businesses are signed up automatically and submit returns through compatible software. |  |
| High | `ea-waste-carrier-registration` | `eligibility.summary` | Correct the tier definitions (own construction or demolition waste needs upper tier) and state the exact fees of £191.02 and £130.25. |  |
| High | `hmcts-tax-tribunal` | `eligibility.summary` | Cite an official source for the no-fee claim and say that only most HMRC decisions can be appealed, not all. | Cite |
| High | `hmrc-corporation-tax` | `eligibility.summary` | Limit the duty to companies that are active and within the charge to Corporation Tax, and count the deadline from the start of the accounting period. |  |
| High | `hmrc-mtd` | `eligibility.summary` | Cite the MTD for Income Tax guidance for the April 2026 date and £50,000 qualifying-income threshold, and mention the VAT exemptions. | Cite |
| High | `hmrc-register-sole-trader` | `eligibility.summary` | Add the £1,000 trading income threshold and cite an official source for the 5 October deadline. |  |
| High | `la-road-occupation-licence` | `eligibility.summary` | Remove the unsourced statement that online applications are not accepted and just say to contact the local council. |  |
| High | `la-road-occupation-licence` | `desc` | Remove the unsourced claim that the licence cannot be applied for online. |  |
| High | `other-dbs` | `desc` | Reword to say anyone can get a basic check for any role, and that standard or enhanced checks are for specific roles such as work with children or in healthcare. |  |
| Med | `ch-confirmation-statement` | `eligibility.criteria.0` | Cite the LLP confirmation statement guidance and replace 'eligible UK business entity' with the specific entity types that must file. | Cite |
| Med | `ch-file-accounts` | `eligibility.criteria.0` | Cite the Companies House guidance saying an officer or anyone with the authentication code, such as an accountant, can file. | Cite |
| Med | `hmcts-tax-tribunal` | `eligibility.criteria.0` | Add appeals against Border Force, NCA, WRA and Gambling Commission decisions, and say direct tax appeals must go to HMRC first. |  |
| Med | `hmrc-mtd` | `eligibility.criteria.0` | Add the VAT exemptions and cite the MTD for Income Tax guidance for the 2026 phase-in. | Cite |
| Med | `la-short-term-let` | `eligibility.criteria.0` | Reword to cover anyone providing accommodation to guests on a short-term basis, not just owners or managers of residential property. |  |
| Med | `la-street-trading-licence` | `eligibility.criteria.0` | Cite the street trading legislation or council guidance that defines 'street' to include public places and covers goods or services. | Cite |
| Med | `other-dbs` | `eligibility.criteria.0` | Cite the official DBS eligibility guidance for legal and financial services roles. | Cite |
| Med | `voa-business-rates` | `eligibility.criteria.0` | Add Wales and remove the unsourced requirement to occupy or own the property. |  |
| Med | `ch-register-ltd` | `eligibility.evidenceRequired.0` | Remove 'WebFiling' and 'authorised' and name the routes the source gives: online registration, paper form IN01 by post, or an agent. |  |
| Med | `ea-waste-carrier-registration` | `eligibility.evidenceRequired.2` | Use the exact fees of £191.02 to register and £130.25 to renew, and cite where they apply to the upper tier. |  |
| Med | `hmrc-corporation-tax` | `eligibility.evidenceRequired.1` | Replace 'registered office address' with the company's principal place of business. |  |
| Med | `hmrc-corporation-tax` | `eligibility.evidenceRequired.2` | Change to the date the accounting period started, or cite the page that asks for the date the company started to do business. | Cite |
| Med | `la-hmo-licence` | `eligibility.evidenceRequired.1` | Cite the council or licensing guidance that asks for smoke alarm records, or change the wording to installing and maintaining smoke alarms. | Cite |
| Med | `la-scrap-metal-dealer-licence` | `eligibility.evidenceRequired.4` | Change the note in brackets to say that buying scrap metal for cash is banned, not that all transactions must be non-cash. |  |
| Med | `ofsted-register-childminder` | `eligibility.evidenceRequired.1` | Cite the early years framework for paediatric first aid, and say the training must match the age group cared for. | Cite |
| Med | `other-employers-liability` | `eligibility.exclusions.0` | Cite the official guidance for the exemption for a limited company whose only employee owns 50% or more of the shares, and add the exemption for staff based outside Great Britain. | Cite |
| Med | `ch-file-accounts` | `eligibility.summary` | Limit the 9-month deadline to private companies, say abridged accounts need all members to agree, and tie micro-entity accounts to the micro-entity thresholds. |  |
| Med | `ch-register-ltd` | `eligibility.summary` | Replace 'anyone can register' with the director limits: minimum age 16, and court permission needed for disqualified people. |  |
| Med | `hmrc-cis` | `eligibility.summary` | Change 'any business' to say registration is required unless an exception applies, and list the exceptions from the official page, such as work paid for by a charity. |  |
| Med | `hmrc-eori` | `eligibility.summary` | Replace 'required for all' with 'may need' and list the exceptions, and remove the claim that a VAT number means an instant result. |  |
| Med | `hmrc-machine-games-duty` | `eligibility.summary` | Cite the HMRC Machine Games Duty notice for the AWP and Category B/C/D terms, or reword to say 'dutiable machines' and note the exclusions. | Cite |
| Med | `la-food-hygiene` | `eligibility.summary` | Limit the 28-day rule to the nations the source covers, add Scotland's own route, and cite an official page saying registration is free. | Cite |
| Med | `la-short-term-let` | `eligibility.summary` | Cite Scottish planning guidance for control areas and a source for England's scheme status, or remove the England claims. | Cite |
| Med | `la-skip-permit` | `eligibility.summary` | Say that safety markings, cones and lamps may be required depending on council conditions, and drop the claim that you must confirm with the council who gets the permit. |  |
| Med | `la-street-trading-licence` | `eligibility.summary` | Change 'most street trading' to 'you may need a licence' and cite a source for the pedlar exemption being limited to valid certificates and itinerant trading. |  |
| Med | `ofsted-register-childminder` | `eligibility.summary` | Remove the domestic-setting limit and call it a registration visit that usually does not happen if you only look after children over 5. |  |
| Med | `other-dbs` | `eligibility.summary` | Remove 'required' and the limit to children or vulnerable adults, and say employers can check for any role. |  |
| Med | `other-employers-liability` | `eligibility.summary` | Change the display rule to say the certificate must be somewhere employees can access it, which can include a website or intranet. |  |
| Med | `ukri-find-grants` | `eligibility.summary` | Say that many schemes are limited to particular regions, drop the claim that all providers are central or local government, and remove 'free' and 'most' unless a source supports them. |  |
| Med | `voa-business-rates` | `eligibility.summary` | Add Wales and remove the unsourced limit to ratepayers who believe their value is wrong. |  |
| Med | `ch-file-accounts` | `desc` | Say the yearly requirement shown applies to private limited companies, or add what public companies must do. |  |
| Med | `ea-waste-carrier-registration` | `desc` | Redefine the tiers: upper tier also covers carrying your own construction or demolition waste, and lower tier covers more than just your own waste. |  |
| Med | `hmcts-tax-tribunal` | `desc` | Reword so an HMRC review is optional, not a condition for appealing to the tribunal. |  |
| Med | `hmrc-corporation-tax` | `desc` | Say the 3 months run from the start of the first accounting period (usually when the company starts to do business), or cite the page that says 'starting to do business'. | Cite |
| Med | `hmrc-mtd` | `desc` | Cite the official Making Tax Digital for Income Tax page for the 2026 rollout. | Cite |
| Med | `la-scrap-metal-dealer-licence` | `desc` | Change the payment sentence so it says only that dealers must not pay cash for scrap metal, without claiming every transaction must be by bank transfer. |  |
| Med | `la-street-trading-licence` | `desc` | Change 'generally requires' to 'may need' a licence and cite a source for location restrictions or remove them. |  |
| Med | `ofsted-register-childminder` | `desc` | Say registration applies to care of under-8s for more than 2 hours a day, and add the childminder agency route. |  |
| Med | `other-employers-liability` | `desc` | Replace 'anyone' with a statement that there are exemptions, such as employing only a family member or staff based outside England, Scotland and Wales. |  |

### Low: elaboration (18)

`ch-close-company` 1, `ch-register-ltd` 3, `hmrc-corporation-tax` 2, `ofsted-register-childminder` 1, `other-employers-liability` 1, `hmrc-mtd` 1, `la-food-hygiene` 1, `la-food-premises-approval` 1, `la-hmo-licence` 1, `hmrc-eori` 1, `hmrc-vat` 2, `hmrc-register-sole-trader` 1, `la-short-term-let` 1, `voa-business-rates` 1

## Buying a Home

### High and medium (25)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `ea-fishing-licence` | `eligibility.summary` | Replace 'some stillwaters' with wording saying a licence is needed on all waters, private lakes included, and cite a source for the 'criminal offence' wording or change it to the £2,500 fine. |  |
| High | `la-council-tax` | `eligibility.summary` | Reword the liability sentence to match the official rules on who has to pay, and cite the moving guidance for the registration steps. |  |
| High | `llc-local-land-charges` | `eligibility.summary` | Say that the service covers England and Wales, that you must create an account first, and that not every area's data is on it yet (for those areas, search with the local council). |  |
| High | `lr-sign-mortgage-deed` | `eligibility.summary` | Limit eligibility to homeowners who are remortgaging, and remove the GOV.UK One Login requirement unless a source confirms it. |  |
| High | `mhclg-epc` | `eligibility.summary` | Cite the private rented sector minimum energy efficiency standard guidance for the E rating and its exemptions, and cite the register page saying anyone can search it. | Cite |
| High | `la-council-tax` | `desc` | Cite the official page on telling your council when you move for the register-and-close-account steps. | Cite |
| Med | `ea-fishing-licence` | `eligibility.criteria.1` | Add the River Tweed exception to the England and Wales licence rule. |  |
| Med | `hmrc-sdlt` | `eligibility.criteria.0` | Change 'any purchase' to name the exemptions and describe additional properties as a 5% higher rate, not a different threshold. |  |
| Med | `lr-registration` | `eligibility.criteria.0` | Add the exemption for leases of 7 years or less. |  |
| Med | `lr-sign-mortgage-deed` | `eligibility.criteria.0` | Cite a page saying the homeowner's lender must use the digital mortgage service. | Cite |
| Med | `other-help-to-buy` | `eligibility.criteria.0` | Change the wording so a First Homes property can be a new-build or a resale bought through an estate agent. |  |
| Med | `hmrc-lisa` | `eligibility.evidenceRequired.1` | Cite the official guidance confirming the conveyancer asks the ISA provider for the funds. | Cite |
| Med | `lr-registration` | `eligibility.autoQualifiers.0` | Remove completion and SDLT filing as conditions, and say the owner can apply instead of a solicitor. |  |
| Med | `lr-registration` | `eligibility.evidenceRequired.1` | Say the Land Transaction Return certificate is only needed if Stamp Duty was paid, and cite the HMRC page for the SDLT5 name. | Cite |
| Med | `ea-flood-warnings` | `agentInteraction.authRequired` | Say that no existing sign-in is needed, but signing up creates an account you sign in to for later changes. |  |
| Med | `ea-flood-risk` | `eligibility.summary` | Say the service checks an area rather than a property address, add that groundwater risk is shown only where data is available, and cite a source for 'free' or remove it. |  |
| Med | `ea-flood-warnings` | `eligibility.summary` | Cite a source for registering more than one property and contact method, and remove 'near' unless a page supports it. | Cite |
| Med | `hmrc-lisa` | `eligibility.summary` | Cite the official Lifetime ISA home-buying page for the conveyancer asking for the funds and the timing before completion. | Cite |
| Med | `hmrc-sdlt` | `eligibility.summary` | Say a return is needed for most purchases over £40,000 or when claiming relief, and list the exemptions. |  |
| Med | `lr-property-search` | `eligibility.summary` | Remove the unsourced 'useful when buying' line and state that downloaded copies are not proof of ownership. |  |
| Med | `lr-registration` | `eligibility.summary` | Add the short-lease exemption, say a solicitor 'may' apply, and remove the unsourced priority-period and timing claims. |  |
| Med | `voa-council-tax-band` | `eligibility.summary` | Cite the official pages that say band checks are free and cover any property, name who can challenge and what evidence counts, and add that Scotland uses a separate website. | Cite |
| Med | `hmrc-lisa` | `desc` | Cite the official Lifetime ISA home-buying guidance showing the conveyancer asks the provider for the funds before completion. | Cite |
| Med | `hmrc-sdlt` | `desc` | Replace the blanket 'required even if no tax is due' with the actual rule and list the exemptions where no return is needed. |  |
| Med | `lr-registration` | `desc` | Say that owners can apply themselves or use a solicitor, and remove the claim that registration is needed for a mortgage to complete. |  |

### Low: elaboration (7)

`hmrc-sdlt` 1, `lr-registration` 2, `other-help-to-buy` 1, `ea-flood-risk` 1, `llc-local-land-charges` 1, `lr-sign-mortgage-deed` 1

## Starting a New Job

### High and medium (46)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `dwp-new-style-esa` | `eligibility.criteria.1` | Change to 'enough NI contributions, usually in the last 2 to 3 years, and credits count' and remove the unsourced Class 1/Class 2 rule. |  |
| High | `wg-discretionary-assistance` | `eligibility.criteria.1` | Cite the official DAF eligibility guidance for the IAP qualifying benefits and situations and for the 'no other money' condition. | Cite |
| High | `dwp-universal-credit` | `eligibility.evidenceRequired.0` | Replace 'Photo ID' with identity documents, noting that non-photo documents are accepted. |  |
| High | `hmrc-ssp` | `eligibility.exclusions.3` | Reword to say late notice may cost SSP for the days it was late, not exclude the person entirely. |  |
| High | `sss-scottish-child-payment` | `eligibility.autoQualifiers.0` | Cite the official eligibility page for the qualifying-benefit and Scotland residency conditions. | Cite |
| High | `dwp-budgeting-loan` | `agentInteraction.methods` | Remove phone as an application method and say the phone line is only for asking for a paper form, changing an application or checking progress. |  |
| High | `dwp-new-style-esa` | `agentInteraction.methods` | Remove the unsourced post route and list only the ways to apply that the page states. |  |
| High | `insolvency-breathing-space` | `agentInteraction.methods` | State that you get debt advice (which can be online) and the debt adviser submits the application for you. |  |
| High | `nhs-fit-note` | `agentInteraction.methods` | Remove the phone option and list only online and post for sending a fit note. |  |
| High | `sss-best-start-grant` | `agentInteraction.methods` | Cite an official source confirming you can apply by phone, or remove phone as an application route. | Cite |
| High | `dwp-new-style-esa` | `eligibility.summary` | Change the contribution period to 'usually the last 2 to 3 years' and remove 'from a GP'. |  |
| High | `nhs-ppc` | `eligibility.summary` | Reword the item counts as break-even guides (4 or more items in 3 months, 12 or more in 12 months), not conditions for getting a PPC, and fix the UC exemption example. |  |
| High | `sss-best-start-foods` | `eligibility.summary` | Cite the official 'Who should apply' page for the qualifying benefit requirement and its list of benefits. | Cite |
| High | `sss-best-start-grant` | `eligibility.summary` | Cite a source for automatic payment to Scottish Child Payment families, and list the qualifying benefits. | Cite |
| High | `sss-scottish-child-payment` | `eligibility.summary` | Cite the official pages for the qualifying benefits list, the Scotland residency rule, the Child Benefit exclusion and how the carer is chosen. | Cite |
| High | `wg-discretionary-assistance` | `eligibility.summary` | Say that heating oil claims under the EAP go through an approved partner, drop the claim that IAP is partner-only, and cite a source for the 16+ and Wales residency rules. |  |
| High | `dwp-universal-credit` | `desc` | Remove the 1-month deadline and say to report changes straight away. |  |
| High | `hmrc-ssp` | `desc` | Limit payment to full days off sick that the person would normally have worked, and cite a source for the claim that there is no minimum earnings requirement. |  |
| High | `sss-scottish-child-payment` | `desc` | Cite the official eligibility page for the qualifying-benefit and Scotland residency conditions. | Cite |
| Med | `dwp-universal-credit` | `eligibility.criteria.2` | Cite the official guidance on the habitual residence test. | Cite |
| Med | `hmrc-ssp` | `eligibility.criteria.0` | Change 'including agency workers' to say agency workers may be entitled. |  |
| Med | `insolvency-bankruptcy` | `eligibility.criteria.1` | Cite the residency rule and add that having lived or had a business in England or Wales in the last 3 years also qualifies. | Cite |
| Med | `insolvency-breathing-space` | `eligibility.criteria.2` | Cite the official source for which debt advice providers can apply, including any that are not FCA-authorised, such as local authorities. | Cite |
| Med | `insolvency-dro` | `eligibility.criteria.3` | Reword to 'must have lived or worked in England or Wales within the last 3 years'. |  |
| Med | `nhs-fit-note` | `eligibility.criteria.0` | Say a fit note is needed only after more than 7 days off in a row, or when the person is told to send one. |  |
| Med | `nhs-healthy-start` | `eligibility.criteria.2` | Cite an official page confirming Healthy Start covers England, Wales and Northern Ireland. | Cite |
| Med | `dwp-new-style-esa` | `eligibility.evidenceRequired.0` | Change to 'Fit note if you have been off work for more than 7 days' and remove 'from GP'. |  |
| Med | `dwp-new-style-esa` | `eligibility.evidenceRequired.3` | Mark the assessment as 'if needed' and name the Health Assessment Advisory Service as the provider. |  |
| Med | `dwp-ni-credits` | `eligibility.autoQualifiers.1` | Add the conditions that you must not be in education and not work 16 hours or more a week, and say Jobseeker's Allowance in general rather than New Style JSA only. |  |
| Med | `dwp-universal-credit` | `eligibility.exclusions.1` | Cite the official guidance on immigration status and public funds for Universal Credit. | Cite |
| Med | `dwp-universal-credit` | `eligibility.exclusions.2` | Reword so legacy benefits are not listed as an exclusion, and explain moving over by Migration Notice or a voluntary claim. |  |
| Med | `hmrc-starter-checklist` | `eligibility.exclusions.0` | Reword this so it isn't a strict exclusion: the employer may still ask for a checklist, and one is needed if the person left their last job before 6 April 2025. |  |
| Med | `hmrc-starter-checklist` | `eligibility.evidenceRequired.0` | Replace "no documents required" with the information the employee needs, and note that seconded workers need their passport number. |  |
| Med | `insolvency-breathing-space` | `eligibility.exclusions.1` | Add the mental health crisis exception to the 12-month rule. |  |
| Med | `nhs-low-income-scheme` | `eligibility.evidenceRequired.1` | Cite the HC1 guidance on acceptable proof of savings | Cite |
| Med | `nhs-low-income-scheme` | `agentInteraction.methods` | Cite the NHSBSA page on applying with a paper HC1 form | Cite |
| Med | `sss-best-start-foods` | `agentInteraction.methods` | Cite the Social Security Scotland page that confirms you can apply by phone. | Cite |
| Med | `dwp-find-a-job` | `eligibility.summary` | Cite sources for free use and saved searches, and check the CV upload claim against the current service or remove it. |  |
| Med | `hmrc-starter-checklist` | `eligibility.summary` | Say the checklist is on GOV.UK (online or printable) and the employer asks for it, and drop or cite the emergency tax code claim. |  |
| Med | `insolvency-bankruptcy` | `eligibility.summary` | Cite the official pages for the 'cannot pay your debts' condition, the one-year length and the writing-off of debts. | Cite |
| Med | `insolvency-breathing-space` | `eligibility.summary` | Replace 'anyone' with a reference to the eligibility conditions and cite a source for the FCA-authorised adviser requirement. |  |
| Med | `la-free-childcare-2yr` | `eligibility.summary` | Say that leaving care only counts when the child left under an adoption order, special guardianship order or child arrangements order. |  |
| Med | `nhs-free-dental` | `eligibility.summary` | Replace 'War Pension dental scheme members' with people getting War Pension Scheme payments, and say this covers only treatment for their accepted disability. |  |
| Med | `ofsted-check-registered-childcare` | `eligibility.summary` | Cite the approved childcare and free childcare hours guidance, and add the childminder agency route. | Cite |
| Med | `dwp-new-style-esa` | `desc` | Say a fit note is needed only after more than 7 days off work, remove 'from GP', and say an assessment may be needed. |  |
| Med | `sss-best-start-grant` | `desc` | Cite the official page that lists the qualifying benefits, such as Universal Credit, and name them. | Cite |

### Low: elaboration (10)

`nhs-ppc` 2, `dwp-new-style-esa` 1, `nhs-low-income-scheme` 1, `dwp-budgeting-loan` 1, `dwp-find-a-job` 1, `hmcts-court-fee-remission` 1, `hmrc-starter-checklist` 1, `insolvency-bankruptcy` 1, `ofsted-check-registered-childcare` 1

## Getting Married

### High and medium (16)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `gro-give-notice` | `eligibility.criteria.0` | Remove the 16-17 parental consent exception. |  |
| High | `dvla-name-change` | `eligibility.evidenceRequired.3` | Say a passport photo is needed only for paper licences or if you want to change your photo. |  |
| High | `hmrc-update-records` | `agentInteraction.methods` | Say that individuals should update their name or address online, and limit phone to tax agents and income changes. |  |
| High | `hmrc-marriage-allowance` | `eligibility.summary` | Replace 'up to 4 years' with the source's fixed backdating date of 6 April 2022. |  |
| High | `dvla-renew-licence` | `desc` | Remove address change as a reason to renew, and say that renewing after a name change is by post only. |  |
| Med | `dvla-name-change` | `eligibility.criteria.0` | Cite a source that accepts court orders and legal name changes, or change the list to match the evidence the page names. | Cite |
| Med | `dvla-renew-licence` | `eligibility.criteria.0` | Replace the unstated 'valid UK licence' requirement with the stated ones: living in Great Britain and not being disqualified. |  |
| Med | `gro-marriage-cert` | `eligibility.criteria.0` | Add the exception that GRO also holds some marriage records from abroad, such as consular and armed forces registrations. |  |
| Med | `hmrc-marriage-allowance` | `eligibility.criteria.0` | Add that in Scotland the higher earner can pay starter, basic or intermediate rate. |  |
| Med | `dvla-name-change` | `eligibility.evidenceRequired.0` | Add that lorry and bus licence holders use form D2, and cite a source saying name changes can only be made by post. | Cite |
| Med | `gro-give-notice` | `eligibility.evidenceRequired.4` | Cite the official page that sets the nationality condition for immigration evidence, or change the wording to match 'from outside the UK'. | Cite |
| Med | `gro-marriage-cert` | `eligibility.evidenceRequired.0` | Remove the claim that a certificate is issued at the ceremony and say certificates are ordered from the register office or GRO. |  |
| Med | `other-passport-name` | `eligibility.evidenceRequired.1` | Cite the official page that tells adults to send their current passport with a name-change application. | Cite |
| Med | `other-passport-name` | `eligibility.evidenceRequired.2` | Cite the passport photo guidance for adult name-change applications, and say whether online and postal applications need different photos. | Cite |
| Med | `gro-marriage-cert` | `agentInteraction.methods` | Cite a source confirming in-person ordering at register offices, or change the wording to ordering from the local register office. | Cite |
| Med | `hmrc-update-records` | `eligibility.summary` | Remove the unsourced claims about benefit entitlements and correspondence, and say instead that not reporting could mean paying the wrong amount of tax. |  |

### Low: elaboration (3)

`dvla-renew-licence` 1, `dvla-name-change` 1, `hmrc-update-records` 1

## Going to University

### Low: elaboration (1)

`dfe-find-apprenticeship` 1

## Child Starting School

### High and medium (12)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `hmrc-free-childcare-30` | `eligibility.exclusions.1` | Say that non-working single parents can get the universal 15 hours only if their child is 3 to 4 years old. |  |
| High | `la-send-ehc` | `eligibility.summary` | Say the council must decide within 16 weeks of the request whether to make a plan, and issue the final EHC plan within 20 weeks of the request. |  |
| High | `ofsted-complain-school` | `eligibility.summary` | State that complaints about individual pupils are outside the service, and remove the unsupported further education and England claims. |  |
| Med | `la-school-place` | `eligibility.criteria.1` | Change the wording to say parents can apply for schools in other council areas through their own council, and cite a source for catchment areas or replace them with 'distance from the school'. |  |
| Med | `ofsted-complain-school` | `eligibility.criteria.0` | Cite an official source for completing the full complaints procedure, or change the wording to 'already complained to the school and the problem is unresolved'. | Cite |
| Med | `hmrc-free-childcare-30` | `eligibility.evidenceRequired.0` | Rename this to reconfirming eligibility every 3 months through the childcare account shared by both schemes. |  |
| Med | `la-free-school-meals` | `eligibility.evidenceRequired.1` | Remove the school office route, or cite a source that supports it, and keep the local authority website as the way to apply. |  |
| Med | `la-send-ehc` | `eligibility.evidenceRequired.0` | Cite an official source for educational assessments as evidence, or change the wording to match the page (school reports and doctors' assessments). | Cite |
| Med | `la-send-ehc` | `eligibility.evidenceRequired.2` | Cite the SEND regulations or code of practice on seeking parental views, or change 'required' to 'may be asked for'. | Cite |
| Med | `ofsted-find-inspection-report` | `eligibility.summary` | Replace "rating" with the report card wording the page uses, drop "follow-up action required", and cite a source for the free, open-access claim. |  |
| Med | `la-free-school-meals` | `desc` | Change 'Pension Credit' to 'the guarantee element of Pension Credit' and say to apply through the local authority. |  |
| Med | `ofsted-complain-school` | `desc` | Remove the colleges, 'serious' and inspection-brought-forward claims, and say Ofsted may look at the complaint at the next inspection. |  |

### Low: elaboration (7)

`la-free-school-meals` 2, `other-pupil-premium` 4, `la-school-place` 1

## Learning to Drive

### High and medium (25)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `dvla-vehicle-tax` | `eligibility.evidenceRequired.2` | Limit insurance evidence to taxing at a Post Office in Northern Ireland. |  |
| High | `dvsa-driving-test` | `eligibility.evidenceRequired.0` | Mark the theory test certificate as bring-if-you-have-it, not required, and cite the 2-year pass validity separately. |  |
| High | `dvla-provisional-licence` | `agentInteraction.authRequired` | Name the sign-in system the official page actually uses (likely GOV.UK One Login) instead of Government Gateway. |  |
| High | `dvla-sorn` | `eligibility.summary` | Add the exception for driving to or from a pre-booked MOT or test, list sale, export and scrapping as ways a SORN ends, and cite sources for 'free' and for clamping or impounding. |  |
| High | `dvla-vehicle-sale` | `desc` | Remove the 'same day' deadline and say sellers must tell DVLA, without a specific time limit. |  |
| Med | `dvla-provisional-licence` | `eligibility.criteria.0` | Cite the official driving-age rules and add the exceptions, such as age 16 for people getting the higher-rate mobility part of PIP. | Cite |
| Med | `dvla-provisional-licence` | `eligibility.criteria.1` | Remove 'in the last 12 months' and use the official wording about 185 days' permission to live in Great Britain. |  |
| Med | `dvla-provisional-licence` | `eligibility.criteria.2` | Cite the DVLA guidance on declaring notifiable medical conditions when applying. | Cite |
| Med | `dvla-sorn` | `eligibility.criteria.0` | Remove the 'tax lapsed or about to lapse' condition and add the postal route for vehicles not yet registered in your name. |  |
| Med | `dvla-vehicle-tax` | `eligibility.criteria.0` | Add the reminder letter reference route, say an MOT is only sometimes needed, and limit insurance evidence to Northern Ireland Post Office applications. |  |
| Med | `dvsa-driving-test` | `eligibility.criteria.0` | Change the rule to a theory test pass within the last 2 years, cite that, and note that a lost certificate does not need replacing. | Cite |
| Med | `dvla-provisional-licence` | `eligibility.evidenceRequired.0` | Say that proof of identity may be needed and is usually photo ID such as a passport, not that a UK passport is always required. |  |
| Med | `dvla-vehicle-tax` | `eligibility.autoQualifiers.0` | Cite the rules on when an MOT is needed and on insurance, or reword so MOT and insurance aren't presented as universal conditions for taxing. | Cite |
| Med | `dvla-vehicle-tax` | `eligibility.evidenceRequired.1` | Say MOT evidence is only sometimes needed, that a screenshot of the MOT history is accepted, and cite the rule on which vehicles need an MOT. | Cite |
| Med | `dvsa-driving-test` | `eligibility.evidenceRequired.1` | Add that a passport together with a paper licence is accepted in place of a photocard. | Cite |
| Med | `dvsa-driving-test` | `agentInteraction.methods` | Cite the DVSA page on booking by phone, or limit phone booking to upgrade tests. | Cite |
| Med | `jaqu-clean-air-zone` | `agentInteraction.authRequired` | Change the wording to say businesses checking several vehicles need an account, while single-vehicle users do not. |  |
| Med | `dvla-provisional-licence` | `eligibility.summary` | Replace 'resident for 185 days in the last 12 months' with the official wording about 185 days' permission to live in Great Britain. |  |
| Med | `dvla-vehicle-sale` | `eligibility.summary` | Add the postal route for sellers without a log book, and cite a source for 'immediately' or soften it. | Cite |
| Med | `dvla-vehicle-tax` | `eligibility.summary` | Add the tax reminder or warning letter reference as an alternative to the V5C, and say insurance evidence is only needed at a Post Office in Northern Ireland. |  |
| Med | `dvsa-driving-test` | `eligibility.summary` | Cite the DVLA guidance on form D1 and on name or address changes, and describe automatic sending as an option the examiner offers. | Cite |
| Med | `dvsa-theory-test` | `eligibility.summary` | Replace 'All learner drivers' with 'usually' and list the exceptions, such as automatic-to-manual upgrades and tractor and taxi tests. |  |
| Med | `jaqu-clean-air-zone` | `eligibility.summary` | Cite the official vehicle compliance guidance for the Euro 6 diesel and Euro 4 petrol thresholds and for how charges vary by zone and vehicle type. | Cite |
| Med | `dvla-sorn` | `desc` | State that a SORN also ends when the vehicle is sold, permanently exported or scrapped, and cite a source showing SORN is free. |  |
| Med | `dvsa-driving-test` | `desc` | Say the examiner offers to have the licence sent automatically, and apply the 2-year limit only to people who do not take that option. | Cite |

### Low: elaboration (2)

`dvla-provisional-licence` 1, `dvla-vehicle-tax` 1

## In no life event

### High and medium (40)

| | Service | Field | Action | |
|---|---|---|---|---|
| High | `dfe-apply-teacher-training` | `eligibility.criteria.0` | Replace with 'a degree or equivalent qualification' and drop the UK-only and 2:2 conditions unless an official source supports them. |  |
| High | `ho-fee-waiver` | `eligibility.criteria.0` | Reword to match the source: no money for housing or essential living costs, or very low income where paying would harm a child's wellbeing. |  |
| High | `ho-fee-waiver` | `eligibility.criteria.1` | Remove citizenship applications and name only the qualifying permission-to-stay routes. |  |
| High | `cica-compensation` | `eligibility.summary` | Correct the range to say injury payments are £1,000 to £250,000 and the maximum total award is £500,000. |  |
| High | `co-contracts-finder` | `eligibility.summary` | Cite an official source that says Contracts Finder is free and gives the publishing thresholds and duty, or remove those claims. | Cite |
| High | `dfe-apply-teacher-training` | `eligibility.summary` | Remove the 2:2 minimum, add teacher degree apprenticeships as a no-degree route, and only name routes the pages list. |  |
| High | `dfe-national-careers` | `eligibility.summary` | Cite the official page stating the service is free for people in England aged 13 or over. | Cite |
| High | `fco-emergency-travel-doc` | `eligibility.summary` | Say the passport must have recently expired, add the need to travel urgently within 6 weeks, and drop the requirement that the journey be back to the UK. |  |
| High | `ho-fee-waiver` | `eligibility.summary` | Remove British citizenship applications from the summary. |  |
| High | `ho-immigration-appeal` | `eligibility.summary` | Remove 'in-country' so the right of appeal covers appeals made from outside the UK. |  |
| High | `la-child-performance-licence` | `eligibility.summary` | Add the conditions (paying audience, licensed premises or paid child) and cite a source for the nations covered. |  |
| High | `la-public-film-screening` | `eligibility.summary` | Change it to say a premises licence may be needed and that you may need one or more permissions, not that several are typically needed. |  |
| High | `la-street-collection-licence` | `eligibility.summary` | Cite an official source for the licence being free, or remove the fee claim, and say a licence may be needed depending on the council. | Cite |
| High | `ho-immigration-appeal` | `desc` | Replace the general visa and leave to remain refusal wording with the specific appealable decisions the page lists. |  |
| High | `la-child-performance-licence` | `desc` | Say a licence may be needed and add the conditions: a paying audience, licensed premises or the child being paid. |  |
| High | `la-public-film-screening` | `desc` | Say a premises licence 'may' be needed, and add that Northern Ireland may need a cinema licence instead. |  |
| Med | `dfe-national-careers` | `eligibility.criteria.0` | Cite the source for England-only coverage and the separate services in the other nations, and change 'adults' to match the 13-or-over age range. | Cite |
| Med | `dvla-check-driving-licence` | `eligibility.criteria.0` | Limit the criterion to licences issued in England, Wales or Scotland. |  |
| Med | `fco-emergency-travel-doc` | `eligibility.criteria.1` | Replace 'without a valid passport' with the listed reasons for being unable to use your UK passport, including a full passport or one held by HM Passport Office or an embassy. |  |
| Med | `hmcts-immigration-tribunal` | `eligibility.criteria.0` | Reword to require a legal right of appeal, which is usually but not always stated in the decision letter, and cover revocation and deportation decisions as well as refusals. |  |
| Med | `hmrc-tax-credits` | `eligibility.exclusions.0` | Say new claimants may be able to get Universal Credit or Pension Credit, instead of saying they must use Universal Credit. |  |
| Med | `la-child-performance-licence` | `eligibility.evidenceRequired.1` | Cite a page that requires chaperone details with the application, or say they are needed only when a chaperone is required. | Cite |
| Med | `la-house-to-house-collection-licence` | `eligibility.evidenceRequired.2` | Add the London exception: apply to the Metropolitan Police there, not the local council. |  |
| Med | `cica-compensation` | `agentInteraction.authRequired` | Add that you need a GOV.UK One Login to save your application and come back to it later. |  |
| Med | `dbs-basic-check` | `eligibility.summary` | Say that people in Scotland or Northern Ireland can apply only if the job is in England or Wales, and note that self-employed people and personal employees can apply for enhanced checks themselves. |  |
| Med | `dvla-check-driving-licence` | `eligibility.summary` | Remove 'one-time' and the unsourced mention of driving test passes, and cite a source for the separate Northern Ireland service. |  |
| Med | `dvla-vehicle-enquiry` | `eligibility.summary` | Cite an official source for the service being free and showing colour, and for the UK registration number requirement, or remove those claims. | Cite |
| Med | `dvsa-mot-history` | `eligibility.summary` | Say the history covers Northern Ireland as well as Great Britain, and only from 2005 for cars, motorcycles and vans or 2018 for HGVs, trailers, buses and coaches. |  |
| Med | `hmcts-court-fines` | `eligibility.summary` | Limit the service to England and Wales, point Scotland and Northern Ireland to their own ways to pay, warn that payments may be rejected once enforcement has started, and replace 'payment reference' with the notice of fine and a card. |  |
| Med | `hmcts-jury-summons` | `eligibility.summary` | Add that the 5 years must be continuous, must come after age 13, and can include time in the Channel Islands or Isle of Man. |  |
| Med | `hmpo-lost-stolen-passport` | `eligibility.summary` | Cite the official page saying a replacement must be applied for separately, and word it as needed only if the person wants a replacement. | Cite |
| Med | `hmpps-prison-visits` | `eligibility.summary` | Cite the official page on what ID visitors must bring, and say ID is required instead of that it 'may be required'. | Cite |
| Med | `pins-planning-appeal` | `eligibility.summary` | Change the 12-week limit so it covers only householder refusals, and state 6 months for householder non-determination and conditions appeals. |  |
| Med | `co-contracts-finder` | `desc` | Say the service mainly covers England and point people in Scotland, Wales and Northern Ireland to their own procurement sites. |  |
| Med | `dvsa-mot-history` | `desc` | Replace 'advisory notices' with the official 'minor problems' wording and say these are shown only for tests done in England, Scotland or Wales. |  |
| Med | `fco-emergency-travel-doc` | `desc` | Change 'one-way' to 'a single or return journey' and cite a source for the issuer or remove it. |  |
| Med | `hmcts-money-claims` | `desc` | Cite the official page that sets the £100,000 online claim limit and mentions the fast track, or remove both. | Cite |
| Med | `ho-fee-waiver` | `desc` | Limit the nationality fee mention to child citizenship registration and cite that page, or remove it. | Cite |
| Med | `la-house-to-house-collection-licence` | `desc` | Add that in London you apply to the Metropolitan Police instead of the council. |  |
| Med | `la-street-collection-licence` | `desc` | Say a licence may be needed depending on the local council, and exclude the City of London from the Metropolitan Police route. |  |

### Low: elaboration (10)

`la-child-performance-licence` 1, `la-public-film-screening` 1, `cabinetoffice-uk-honours` 1, `hmcts-money-claims` 1, `hmcts-unclaimed-court-money` 2, `dfe-national-careers` 1, `dvla-check-driving-licence` 1, `dvla-vehicle-enquiry` 1, `hmcts-court-fines` 1

