# Stage 5 Cite review: disability wave 1

Approval requested for **one provenance confirmation**. No graph text, rules, or provenance has been changed for this wave.

| Result | Fields |
|---|---:|
| Confirm as written after approval | 1 |
| Still partly supported; send to a later reword wave | 3 |

The current baseline is **1,861 of 2,987 confirmed (62.3%)**. If the one supported field is imported, the expected result is **1,862 of 2,987 (62.3%)**. The percentage rounds to the same tenth. There are no proposed cuts or rewrites in this Cite wave.

## Decision

Approve importing the four judgments. This will confirm `sss-young-carer-grant#agentInteraction.methods` as written: its existing value is `["online", "phone"]`, and both application routes appear explicitly on the official [how-to-apply page](https://www.mygov.scot/young-carer-grant/how-to-apply). The other three fields will stay partly supported, with their new quotes and problem notes recorded in provenance and the review queues. None of the four graph values will change. The import pipeline checked every quoted span against the fetched page text in dry run: 1 confirmed, 3 partly supported, 0 fabricated, 0 missing.

Finder: separate Codex session `/root/cite_disability_finder`. Judge: separate context-free Codex session `/root/judge_cite_disability_1`. The judge received the fetched sources and claim prompts, without the finder notes or prior judge responses.

## Evidence by field

### Adult Disability Payment: `eligibility.criteria.1`

**Current claim:** Must have a long-term physical or mental health condition or disability that affects daily living or mobility for at least 13 weeks and is expected to last at least 9 more months.

**Result:** partly supported; no import confirmation.

- **partly supported:** An applicant must have a long-term physical or mental health condition or disability.
  - [Source](https://www.mygov.scot/adult-disability-payment/applicants): “Apply if you have a: disability long-term physical or mental health condition terminal illness”
  - Judge note: The page also lists terminal illness as a route, so the stated condition list is incomplete.
- **partly supported:** The condition or disability must affect daily living or mobility.
  - [Source](https://www.mygov.scot/adult-disability-payment): “The amount you get depends on how your condition affects your ability to do everyday activities and get around.”
  - Judge note: The usual components depend on functional impact, but terminal illness brings an automatic enhanced daily living award.
- **partly supported:** The effect on daily living or mobility must have lasted at least 13 weeks.
  - [Source](https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/determinations-and-awards-for-adult-disability-payment/entitlement-to-adp): “The backwards test for ADP is 13 weeks.”
  - Judge note: The 13-week test concerns conditions of entitlement, and the page exempts applications under the special rules for terminal illness.
- **partly supported:** The effect on daily living or mobility must be expected to last at least 9 more months.
  - [Source](https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/determinations-and-awards-for-adult-disability-payment/entitlement-to-adp): “The forwards test for ADP is 39 weeks.”
  - Judge note: The page specifies 39 weeks of likely entitlement rather than nine calendar months, and terminal illness is exempt from the test.

**Finder queries:**

- `site:mygov.scot adult disability payment eligibility 13 weeks 9 months daily living mobility Scotland`
- `site:socialsecurity.gov.scot adult disability payment required period 13 weeks 9 months eligibility`
- `site:socialsecurity.gov.scot "Adult Disability Payment" "13 weeks" "39 weeks"`

**Pages nominated by finder:**

- [https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/determinations-and-awards-for-adult-disability-payment/entitlement-to-adp](https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/determinations-and-awards-for-adult-disability-payment/entitlement-to-adp) — The service owner's decision guide states a 13-week backwards test and a 39-week forwards test, and says both are needed. It also names the terminal-illness exception.
- [https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/backwards-and-forwards-tests-for-adult-disability-payment/the-backwards-and-forwards-tests](https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/backwards-and-forwards-tests-for-adult-disability-payment/the-backwards-and-forwards-tests) — Detailed guide ties the 13 prior weeks and 39 following weeks to entitlement for a particular rate of the daily living or mobility component.

**All pages in the exported judge prompt:**

- [https://www.mygov.scot/adult-disability-payment](https://www.mygov.scot/adult-disability-payment) (cited or linked)
- [https://www.mygov.scot/adult-disability-payment/applicants](https://www.mygov.scot/adult-disability-payment/applicants) (cited or linked)
- [https://www.mygov.scot/adult-disability-payment-suitability-checker](https://www.mygov.scot/adult-disability-payment-suitability-checker) (cited or linked)
- [https://www.mygov.scot/moving-from-child-disability-payment-to-adult-disability-payment](https://www.mygov.scot/moving-from-child-disability-payment-to-adult-disability-payment) (cited or linked)
- [https://www.mygov.scot/applying-for-adult-disability-payment-from-scottish-adult-dla](https://www.mygov.scot/applying-for-adult-disability-payment-from-scottish-adult-dla) (cited or linked)
- [https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/determinations-and-awards-for-adult-disability-payment/entitlement-to-adp](https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/determinations-and-awards-for-adult-disability-payment/entitlement-to-adp) (found by search)
- [https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/backwards-and-forwards-tests-for-adult-disability-payment/the-backwards-and-forwards-tests](https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/backwards-and-forwards-tests-for-adult-disability-payment/the-backwards-and-forwards-tests) (found by search)
- [https://www.gov.scot/publications/adult-disability-payment-qa/pages/1/](https://www.gov.scot/publications/adult-disability-payment-qa/pages/1/) (found by search)
- [https://www.gov.scot/publications/social-security-assistance-scotland-up-rating-inflation-2026-27/pages/9/](https://www.gov.scot/publications/social-security-assistance-scotland-up-rating-inflation-2026-27/pages/9/) (found by search)

### Young Carer Grant: `agentInteraction.methods`

**Current claim:** You can apply or do this online. You can apply or do this by phone.

**Result:** confirmed as written.

- **supported:** You can apply for Young Carer Grant online.
  - [Source](https://www.mygov.scot/young-carer-grant/how-to-apply): “Apply online Apply for Young Carer Grant. Start”
  - Judge note: The application page explicitly offers an online application.
- **supported:** You can apply for Young Carer Grant by phone.
  - [Source](https://www.mygov.scot/young-carer-grant/how-to-apply): “Call Social Security Scotland free on 0800 182 2222 to apply over the phone.”
  - Judge note: The application page explicitly offers a phone application.

**Finder queries:**

- `site:mygov.scot young carer grant apply online phone application`
- `site:socialsecurity.gov.scot young carer grant online application form phone`

**Pages nominated by finder:**

- [https://www.mygov.scot/young-carer-grant/how-to-apply](https://www.mygov.scot/young-carer-grant/how-to-apply) — The public application page has separate Apply online and Apply over the phone sections, including the online start link and phone number. It says representatives with decision-making power can apply only by phone or post.
- [https://www.socialsecurity.gov.scot/young-carer-grant](https://www.socialsecurity.gov.scot/young-carer-grant) — Social Security Scotland lists online, paper and phone application routes and says online applications go through mygov.scot. It also lists circumstances where applicants cannot apply online.

**All pages in the exported judge prompt:**

- [https://www.mygov.scot/young-carer-grant](https://www.mygov.scot/young-carer-grant) (cited or linked)
- [https://www.mygov.scot/young-carer-grant/how-to-apply](https://www.mygov.scot/young-carer-grant/how-to-apply) (found by search)
- [https://www.socialsecurity.gov.scot/young-carer-grant](https://www.socialsecurity.gov.scot/young-carer-grant) (found by search)

### NHS 111 online: `eligibility.summary`

**Current claim:** Free for anyone in England, 24 hours a day, 7 days a week. Use NHS 111 when you need medical help fast but the situation is not life-threatening. The service assesses your symptoms and advises whether to go to A&E, see a GP urgently, visit a pharmacy, or treat yourself at home.

**Result:** partly supported; no import confirmation.

- **supported:** NHS 111 online is free to use.
  - [Source](https://digital.nhs.uk/blog/transformation-blog/2017/how-were-supporting-urgent--emergency-care-services-this-winter): “NHS 111 Online is free to use for the public”
  - Judge note: The NHS Digital article explicitly describes the service as free to the public.
- **partly supported:** Anyone in England can use NHS 111 online for symptoms.
  - [Source](https://digital.nhs.uk/services/nhs-111-online): “NHS 111 online is for people in England aged 5 and over who need&#xa0;urgent health care advice&#xa0;but it’s not a life-threatening situation.”
  - Judge note: Symptom triage is for people aged five or over, although an emergency prescription can be requested for someone of any age.
- **supported:** NHS 111 online is available 24 hours a day, 7 days a week.
  - [Source](https://digital.nhs.uk/services/nhs-111-online): “operational and supported 24 hours a day, 365 days a year.”
  - Judge note: The stated round-the-year operation includes every day of the week.
- **supported:** Use NHS 111 online when you need medical help fast but the situation is not life-threatening.
  - [Source](https://digital.nhs.uk/services/nhs-111-online): “NHS 111 online is for people in England aged 5 and over who need&#xa0;urgent health care advice&#xa0;but it’s not a life-threatening situation.”
  - Judge note: The page gives this urgent, non-life-threatening use case for people aged five or over.
- **supported:** The service assesses your symptoms.
  - [Source](https://digital.nhs.uk/services/nhs-111-online): “It helps people with an urgent medical need to get assessed and directed to the right care”
  - Judge note: The service assesses urgent medical needs and directs users to care.
- **supported:** The service may advise you to go to A&E.
  - [Source](https://digital.nhs.uk/services/nhs-111-online): “call 999 or go to A&E in an emergency”
  - Judge note: A&E is listed as a possible outcome.
- **supported:** The service may advise you to see a GP urgently.
  - [Source](https://digital.nhs.uk/services/nhs-111-online): “see an evening and weekend GP (out-of-hours GP)”
  - Judge note: The urgent care outcomes include an evening or weekend GP.
- **supported:** The service may advise you to visit a pharmacy.
  - [Source](https://digital.nhs.uk/services/nhs-111-online): “see a pharmacist for help with a minor illness”
  - Judge note: A pharmacist is listed as a possible outcome.
- **supported:** The service may advise you to treat yourself at home.
  - [Source](https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/how-nhs-111-online-works/): “If you're told it’s safe to look after yourself, we'll tell you how to do that at home.”
  - Judge note: The service may give self-care advice for home.

**Finder queries:**

- `site:nhs.uk nhs 111 online free 24 hours 7 days week England not life threatening A&E GP pharmacy`
- `site:111.nhs.uk about 111 online free available 24 hours England outcomes`
- `site:nhs.uk "111 online" "free to use"`

**Pages nominated by finder:**

- [https://digital.nhs.uk/services/nhs-111-online](https://digital.nhs.uk/services/nhs-111-online) — Current NHS England Digital service page says the online service is for people in England aged 5 and over with urgent, non-life-threatening needs, lists A&E, GP, pharmacy and home care among possible outcomes, and says it is operational and supported 24 hours a day, 365 days a year.
- [https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/how-nhs-111-online-works/](https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/how-nhs-111-online-works/) — NHS public guidance says 111 online is available in England only, explains symptom triage, and separately describes A&E, GP, pharmacist and self-care outcomes.
- [https://digital.nhs.uk/blog/transformation-blog/2017/how-were-supporting-urgent--emergency-care-services-this-winter](https://digital.nhs.uk/blog/transformation-blog/2017/how-were-supporting-urgent--emergency-care-services-this-winter) — An older NHS Digital page explicitly says NHS 111 Online is free to use for the public. Check whether a newer direct cost statement is preferred before using it as current evidence.

**All pages in the exported judge prompt:**

- [https://111.nhs.uk](https://111.nhs.uk) (cited or linked)
- [https://digital.nhs.uk/services/nhs-111-online](https://digital.nhs.uk/services/nhs-111-online) (found by search)
- [https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/how-nhs-111-online-works/](https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/how-nhs-111-online-works/) (found by search)
- [https://digital.nhs.uk/blog/transformation-blog/2017/how-were-supporting-urgent--emergency-care-services-this-winter](https://digital.nhs.uk/blog/transformation-blog/2017/how-were-supporting-urgent--emergency-care-services-this-winter) (found by search)

### Adult Disability Payment: `eligibility.summary`

**Current claim:** Scotland's replacement for Personal Independence Payment (PIP). For adults aged 16+ (under State Pension age) with a long-term physical or mental health condition or disability. Same rates as PIP. Assessed on impact of condition, not the condition itself.

**Result:** partly supported; no import confirmation.

- **supported:** Adult Disability Payment is Scotland's replacement for Personal Independence Payment (PIP).
  - [Source](https://www.gov.scot/publications/adult-disability-payment-qa/pages/1/): “Adult Disability Payment is Scotland’s replacement for Personal Independence Payment ( PIP ).”
  - Judge note: The Scottish Government states this directly.
- **partly supported:** Adult Disability Payment is for adults aged 16 or over and under State Pension age.
  - [Source](https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/determinations-and-awards-for-adult-disability-payment/entitlement-to-adp): “Generally, individuals must: be 16 years old or over,to be entitled to either component of ADP (ADP regs, reg 22(1)(a)) be under pensionable age or, if higher, 65 years old to be entitled to either component”
  - Judge note: The age rule is generally 16 to the relevant age, but the page gives exceptions for older applicants and recipients.
- **partly supported:** Adult Disability Payment is for people with a long-term physical or mental health condition or disability.
  - [Source](https://www.mygov.scot/adult-disability-payment/applicants): “Apply if you have a: disability long-term physical or mental health condition terminal illness”
  - Judge note: The page also names terminal illness, which this description leaves out.
- **supported:** Adult Disability Payment has the same rates as PIP.
  - [Source](https://www.gov.scot/publications/social-security-assistance-scotland-up-rating-inflation-2026-27/pages/9/): “Personal Independence Payment - Daily Living Component Enhanced Rate £110.40 £114.60 - Daily Living Component Standard Rate £73.90 £76.70 - Mobility Component Enhanced Rate £77.05 £80.00 - Mobility Component Standard Rate £29.20 £30.30”
  - Judge note: The 2026 to 2027 rate table gives PIP the same four rates listed there for Adult Disability Payment.
- **partly supported:** Adult Disability Payment is assessed on the impact of the condition, not the condition itself.
  - [Source](https://www.mygov.scot/adult-disability-payment): “The amount you get depends on how your condition affects your ability to do everyday activities and get around.”
  - Judge note: The impact determines the amount, but the page also requires a qualifying disability, health condition or terminal illness.

**Finder queries:**

- `site:mygov.scot adult disability payment replacement PIP same rates 16 state pension age`
- `site:socialsecurity.gov.scot Adult Disability Payment replaces PIP equivalent rates state pension age`
- `site:gov.scot "Adult Disability Payment" "same rates" "PIP"`

**Pages nominated by finder:**

- [https://www.mygov.scot/adult-disability-payment/applicants](https://www.mygov.scot/adult-disability-payment/applicants) — Current public eligibility page says applicants generally must be between 16 and State Pension age and have a disability, long-term physical or mental health condition, or terminal illness. It also describes some application routes outside the usual age band.
- [https://www.gov.scot/publications/adult-disability-payment-qa/pages/1/](https://www.gov.scot/publications/adult-disability-payment-qa/pages/1/) — Scottish Government Q&A explicitly calls Adult Disability Payment Scotland's replacement for PIP and says existing PIP recipients over State Pension age move over with the same components and rates. Its 2022 cash amounts are historical.
- [https://www.gov.scot/publications/social-security-assistance-scotland-up-rating-inflation-2026-27/pages/9/](https://www.gov.scot/publications/social-security-assistance-scotland-up-rating-inflation-2026-27/pages/9/) — Scottish Government 2026-27 uprating tables show the same four weekly rates for Adult Disability Payment and PIP, with a separate transitional Adult Disability Payment rate.

**All pages in the exported judge prompt:**

- [https://www.mygov.scot/adult-disability-payment](https://www.mygov.scot/adult-disability-payment) (cited or linked)
- [https://www.mygov.scot/adult-disability-payment/applicants](https://www.mygov.scot/adult-disability-payment/applicants) (cited or linked)
- [https://www.mygov.scot/adult-disability-payment-suitability-checker](https://www.mygov.scot/adult-disability-payment-suitability-checker) (cited or linked)
- [https://www.mygov.scot/moving-from-child-disability-payment-to-adult-disability-payment](https://www.mygov.scot/moving-from-child-disability-payment-to-adult-disability-payment) (cited or linked)
- [https://www.mygov.scot/applying-for-adult-disability-payment-from-scottish-adult-dla](https://www.mygov.scot/applying-for-adult-disability-payment-from-scottish-adult-dla) (cited or linked)
- [https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/determinations-and-awards-for-adult-disability-payment/entitlement-to-adp](https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/determinations-and-awards-for-adult-disability-payment/entitlement-to-adp) (found by search)
- [https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/backwards-and-forwards-tests-for-adult-disability-payment/the-backwards-and-forwards-tests](https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/backwards-and-forwards-tests-for-adult-disability-payment/the-backwards-and-forwards-tests) (found by search)
- [https://www.gov.scot/publications/adult-disability-payment-qa/pages/1/](https://www.gov.scot/publications/adult-disability-payment-qa/pages/1/) (found by search)
- [https://www.gov.scot/publications/social-security-assistance-scotland-up-rating-inflation-2026-27/pages/9/](https://www.gov.scot/publications/social-security-assistance-scotland-up-rating-inflation-2026-27/pages/9/) (found by search)

## Follow-up notes

- The Adult Disability Payment duration criterion needs the 13-week and 39-week entitlement tests and the terminal-illness exception stated accurately. “Nine months” is an approximation to 39 weeks.
- The Adult Disability Payment summary needs age exceptions, the terminal-illness route, and care with “same rates”: the 2026–27 table also has a separate transitional rate.
- The NHS 111 online summary says “anyone in England”; symptom triage is for people aged five or over. Its free-use quote is on a 2017 NHS Digital page, so a later rewrite review should check whether current public guidance states cost directly.
- `verify-rules --write` remains deferred until the NHSBSA prescription page loads. I will report when it is run.
