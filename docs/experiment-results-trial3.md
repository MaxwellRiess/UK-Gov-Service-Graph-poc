# Evaluation Experiment Results
## Does the Service Graph Improve Agent Journey Planning?

**Date:** 2026-03-20T15:04:35.561Z
**Model:** claude-sonnet-4-6 (both conditions)
**Judge:** claude-opus-4-6
**Runs per scenario:** 1 (reduced from spec's 5 — results are directional, not statistically definitive)
**Scenarios:** 9/6

---

## Overall Verdict: PARTIAL VALUE — MIXED RESULTS

Success criteria met: **3/5**

| Criterion | Required | Actual Δ | Met? |
|-----------|----------|----------|------|
| Essential recall: treatment ≥ control + 10pp | — | 7% | ❌ |
| Proactive recall: treatment ≥ control + 15pp | — | 14% | ❌ |
| LLM judge completeness: treatment ≥ control + 0.25 | — | 0.71 | ✅ |
| Ordering accuracy: treatment ≥ control + 10pp | — | 12% | ✅ |
| At least 3/6 scenarios with treatment advantage (judge) | — | 8/6 | ✅ |

---

## Primary Metrics Summary

| Metric | Control | Treatment | Δ |
|--------|---------|-----------|---|
| Essential recall | 81% | 88% | 7% |
| Conditional recall | 42% | 69% | 27% |
| Proactive recall | 67% | 81% | 14% |
| Out-of-scope rate (actual errors) | 0% | 0% | 0% |
| Over-scoping rate (informational) | 65% | 63% | -2% |
| Ordering accuracy | 88% | 100% | 12% |

## LLM Judge Scores (1–5 scale, claude-opus-4-6)

| Dimension | Control | Treatment | Δ |
|-----------|---------|-----------|---|
| Completeness | 3.33 | 4.04 | 0.71 |
| Accuracy     | 3.67     | 3.67     | 0.00 |
| Sequencing   | 4.37   | 4.41   | 0.04 |
| Clarity      | 4.89      | 4.96      | 0.07 |

## Efficiency

| Metric | Control | Treatment | Δ |
|--------|---------|-----------|---|
| Total input tokens (all scenarios) | 588,510 | 391,351 | -197,159 |
| Total tool calls (all scenarios)   | 220 | 62 | -158 |
| Avg tokens per scenario | 65,390 | 43,483 | — |

---

## Per-Scenario Results

### S1 — baby

**Treatment advantage** (Judge completeness: control=3.33, treatment=4.00)

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | 89% | 100% |
| Conditional recall | 81% | 89% |
| Proactive recall | 33% | 67% |
| Out-of-scope rate | 0% | 0% |
| Over-scoping rate | 53% | 43% |
| Tool calls | 16 | 8 |
| Input tokens | 31,401 | 42,082 |
| Judge: completeness | 3.33 | 4 |
| Judge: accuracy | 4 | 3.33 |
| Judge: sequencing | 4.33 | 4.67 |
| Judge: clarity | 4.67 | 5 |

#### Turn-by-turn scores

**Turn 1: Primary prompt**

> *I'm due to have my first baby in six weeks. What do I need to do and when?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 67% (2/3) | 100% (3/3) |
| Conditional recall | 75% | 100% |
| Proactive recall | 0% | 100% |
| Tool calls | 8 | 2 |
| Judge completeness | 3 | 5 |
| Judge accuracy | 4 | 3 |
| Judge sequencing | 4 | 5 |

Missed essential services:
- Control missed: nhs-maternity-exemption

- Notable omissions flagged by judge:  
- Control: nhs-maternity-exemption, hmrc-spl, hmrc-tax-free-childcare, la-free-childcare-2yr, dwp-universal-credit

**Turn 2: Follow-up A**

> *We're on a low income and my partner is self-employed. Are there any additional benefits we should look into?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (2/2) | 100% (2/2) |
| Conditional recall | 67% | 67% |
| Proactive recall | 0% | 0% |
| Tool calls | 8 | 6 |
| Judge completeness | 3 | 3 |
| Judge accuracy | 3 | 3 |
| Judge sequencing | 4 | 4 |

Notable omissions flagged by judge:
- Control: la-council-tax-reduction, dwp-maternity-allowance, dwp-ni-credits
- Treatment: dwp-maternity-allowance, dwp-sure-start-grant, dwp-ni-credits

**Turn 3: Follow-up B**

> *What's the very first thing I need to do once the baby is born?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 100% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 0 | 0 |
| Judge completeness | 4 | 4 |
1. | Judge accuracy | 5 | 4 |
| Judge sequencing | 5 | 5 |

#### Tool calls used

**Control:**
- Turn 1: web_search({"query":"registering a birth UK"}), web_search({"query":"Sure Start Maternity Grant eligibility"}), web_search({"query":"Child Benefit how to claim new baby"}), web_search({"query":"Statutory Maternity Pay and Maternity Allowance UK), web_fetch({"url":"https://www.gov.uk/register-birth"}), web_fetch({"url":"https://www.gov.uk/sure-start-maternity-grant"}), web_fetch({"url":"https://www.gov.uk/child-benefit"}), web_fetch({"url":"https://www.gov.uk/maternity-pay-leave"})
- Turn 2: web_search({"query":"Universal Credit low income new baby"}), web_search({"query":"Healthy Start vouchers eligibility pregnant low in), web_search({"query":"paternity pay self-employed partner"}), web_fetch({"url":"https://www.gov.uk/universal-credit"}), web_fetch({"url":"https://www.gov.uk/healthy-start"}), web_fetch({"url":"https://www.gov.uk/paternity-pay-leave"}), web_fetch({"url":"https://www.gov.uk/universal-credit/eligibility"}), web_fetch({"url":"https://www.gov.uk/paternity-pay-leave/eligibility"})

**Treatment:**
- Turn 1: list_life_events({}), plan_journey({"life_event_ids":["baby"]})
- Turn 2: list_life_events({}), get_service({"service_id":"dwp-universal-credit"}), get_service({"service_id":"nhs-healthy-start"}), get_service({"service_id":"la-council-tax-reduction"}), get_service({"service_id":"hmrc-help-to-save"}), get_service({"service_id":"la-free-childcare-2yr"})

---

### S2 — bereavement

**Treatment advantage** (Judge completeness: control=3.33, treatment=4.00)

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | 58% | 58% |
| Conditional recall | 44% | 56% |
| Proactive recall | 67% | 100% |
| Out-of-scope rate | 0% | 0% |
| Over-scoping rate | 77% | 78% |
| Tool calls | 27 | 7 |
| Input tokens | 84,136 | 41,570 |
| Judge: completeness | 3.33 | 4 |
| Judge: accuracy | 4 | 3.67 |
| Judge: sequencing | 4.33 | 4.33 |
| Judge: clarity | 5 | 5 |

#### Turn-by-turn scores

**Turn 1: Primary prompt**

> *My mother passed away last week. She lived alone and owned her home. What do I need to sort out and in what order?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 75% (3/4) | 75% (3/4) |
| Conditional recall | 33% | 67% |
| Proactive recall | 0% | 100% |
| Tool calls | 8 | 2 |
| Judge completeness | 3 | 5 |
| Judge accuracy | 4 | 4 |
| Judge sequencing | 5 | 5 |

Missed essential services:
- Control missed: dwp-bereavement-support
- Treatment missed: dwp-bereavement-support

Notable omissions flagged by judge:
- Control: dwp-bereavement-support, la-council-tax-single-discount
- Treatment: dwp-bereavement-support

**Turn 2: Follow-up A**

> *She had some savings and owned property in Spain. Does that change anything?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 100% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 9 | 0 |
| Judge completeness | 4 | 4 |
| Judge accuracy | 4 | 3 |
| Judge sequencing | 4 | 4 |

Notable omissions flagged by judge:
- Control: fco-document-legalisation
- Treatment: fco-document-legalisation (not named explicitly as a gov.uk service)

**Turn 3: Follow-up B**

> *My mother was receiving Pension Credit. What happens to her benefits?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 0% (0/1) | 0% (0/1) |
| Conditional recall | 0% | 0% |
| Proactive recall | 100% | 100% |
| Tool calls | 10 | 5 |
| Judge completeness | 3 | 3 |
| Judge accuracy | 4 | 4 |
| Judge sequencing | 4 | 4 |

Missed essential services:
- Control missed: dwp-bereavement-support
- Treatment missed: dwp-bereavement-support

Notable omissions flagged by judge:
- Control: dwp-bereavement-support, dwp-funeral-payment
- Treatment: Bereavement Support Payment, Funeral Expenses Payment

#### Tool calls used

**Control:**
- Turn 1: web_search({"query":"what to do when someone dies GOV.UK"}), web_search({"query":"register a death GOV.UK"}), web_search({"query":"probate applying for GOV.UK"}), web_fetch({"url":"https://www.gov.uk/when-someone-dies"}), web_fetch({"url":"https://www.gov.uk/register-a-death"}), web_fetch({"url":"https://www.gov.uk/applying-for-probate"}), web_search({"query":"Tell Us Once service GOV.UK notify government deat), web_search({"query":"value estate inheritance tax GOV.UK someone dies"})
- Turn 2: web_search({"query":"inheritance tax foreign property overseas assets d), web_search({"query":"probate overseas property Spain UK estate"}), web_fetch({"url":"https://www.gov.uk/valuing-estate-of-someone-who-die), web_search({"query":"UK inheritance tax overseas foreign property asset), web_search({"query":"inheritance tax foreign assets overseas property U), web_search({"query":"dealing with property abroad when someone dies Spa), web_fetch({"url":"https://www.gov.uk/valuing-estate-of-someone-who-die), web_search({"query":"IHT417 foreign assets inheritance tax form"}), web_fetch({"url":"https://www.gov.uk/government/publications/inheritan)
- Turn 3: web_search({"query":"what happens to Pension Credit when someone dies"}), web_search({"query":"bereavement benefits DWP notify death pension cred), web_fetch({"url":"https://www.gov.uk/pension-credit"}), web_fetch({"url":"https://www.gov.uk/after-a-death"}), web_search({"query":"Pension Credit stops when claimant dies notify DWP), web_search({"query":"site:gov.uk report death DWP pension credit benefi), web_fetch({"url":"https://www.gov.uk/pension-credit/report-a-change-of), web_search({"query":"site:gov.uk tell us once pension credit death bene), web_fetch({"url":"https://www.gov.uk/guidance/tell-us-once-service-for), web_search({"query":"site:gov.uk \"pension credit\" \"death\" \"overpay)

**Treatment:**
- Turn 1: list_life_events({}), plan_journey({"life_event_ids":["bereavement"]})
- Turn 3: list_life_events({}), web_fetch({"url":"https://www.gov.uk/pension-credit/further-informatio), plan_journey({"life_event_ids":["bereavement"]}), web_fetch({"url":"https://www.gov.uk/pension-credit/report-a-change-of), web_fetch({"url":"https://www.gov.uk/pension-credit/report-change-of-c)

---

### S3 — job-loss

**Treatment advantage** (Judge completeness: control=3.33, treatment=5.00)

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | 89% | 100% |
| Conditional recall | 11% | 67% |
| Proactive recall | 67% | 100% |
| Out-of-scope rate | 0% | 0% |
| Over-scoping rate | 52% | 61% |
| Tool calls | 21 | 4 |
| Input tokens | 51,812 | 28,832 |
| Judge: completeness | 3.33 | 5 |
| Judge: accuracy | 3.67 | 4 |
| Judge: sequencing | 3.67 | 4.33 |
| Judge: clarity | 5 | 5 |

#### Turn-by-turn scores

**Turn 1: Primary prompt**

> *I was made redundant last Friday after five years with the same employer. I have a mortgage and no savings. What should I do?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 67% (2/3) | 100% (3/3) |
| Conditional recall | 33% | 100% |
| Proactive recall | 0% | 100% |
| Tool calls | 9 | 2 |
| Judge completeness | 3 | 5 |
| Judge accuracy | 5 | 4 |
| Judge sequencing | 4 | 4 |

Missed essential services:
- Control missed: hmrc-p45

Notable omissions flagged by judge:
- Control: hmrc-p45, dwp-new-style-jsa, la-council-tax-reduction, dwp-ni-credits, hmrc-tax-refund

**Turn 2: Follow-up A**

> *I've been signed off by my GP with stress and anxiety. Does that affect anything?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 0% | 0% |
| Proactive recall | 100% | 100% |
| Tool calls | 6 | 2 |
| Judge completeness | 4 | 5 |
| Judge accuracy | 3 | 4 |
| Judge sequencing | 4 | 5 |

Notable omissions flagged by judge:
- Control: nhs-gp-register

**Turn 3: Follow-up B**

> *My redundancy payment was £12,000. Does that affect what benefits I can claim?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 0% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 6 | 0 |
| Judge completeness | 3 | 5 |
| Judge accuracy | 3 | 4 |
| Judge sequencing | 3 | 4 |

Notable omissions flagged by judge:
- Control: dwp-new-style-jsa

#### Tool calls used

**Control:**
- Turn 1: web_search({"query":"Universal Credit redundancy eligibility how to cla), web_search({"query":"redundancy pay entitlement statutory redundancy pa), web_search({"query":"Support for Mortgage Interest scheme GOV.UK"}), web_fetch({"url":"https://www.gov.uk/redundancy-your-rights"}), web_fetch({"url":"https://www.gov.uk/universal-credit"}), web_search({"query":"Support for Mortgage Interest loan GOV.UK eligibil), web_fetch({"url":"https://www.gov.uk/support-for-mortgage-interest"}), web_fetch({"url":"https://www.gov.uk/redundancy-your-rights/statutory-), web_fetch({"url":"https://www.gov.uk/being-made-redundant-finding-work)
- Turn 2: web_search({"query":"Universal Credit limited capability for work sick ), web_search({"query":"Statutory Sick Pay redundancy SSP eligibility"}), web_fetch({"url":"https://www.gov.uk/statutory-sick-pay"}), web_search({"query":"Universal Credit limited capability for work fit n), web_fetch({"url":"https://www.gov.uk/health-conditions-disability-univ), web_fetch({"url":"https://www.gov.uk/statutory-sick-pay/eligibility"})
- Turn 3: web_search({"query":"redundancy payment affect Universal Credit capital), web_search({"query":"redundancy payment affect New Style ESA eligibilit), web_fetch({"url":"https://www.gov.uk/guidance/universal-credit-money-s), web_fetch({"url":"https://www.gov.uk/guidance/redundancy-help-finding-), web_search({"query":"Universal Credit capital limits £6000 £16000 savin), web_fetch({"url":"https://www.gov.uk/universal-credit/what-youll-get"})

**Treatment:**
- Turn 1: list_life_events({}), plan_journey({"life_event_ids":["job-loss"]})
- Turn 2: get_service({"service_id":"dwp-new-style-esa"}), get_service({"service_id":"dwp-pip"})

---

### S4 — business

**Treatment advantage** (Judge completeness: control=2.67, treatment=3.33)

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | 72% | 83% |
| Conditional recall | 50% | 67% |
| Proactive recall | 100% | 100% |
| Out-of-scope rate | 0% | 0% |
| Over-scoping rate | 65% | 71% |
| Tool calls | 33 | 6 |
| Input tokens | 92,524 | 35,430 |
| Judge: completeness | 2.67 | 3.33 |
| Judge: accuracy | 3.33 | 3.33 |
| Judge: sequencing | 4.33 | 4 |
| Judge: clarity | 4.67 | 4.67 |

#### Turn-by-turn scores

**Turn 1: Primary prompt**

> *I want to register a limited company to run a small building and renovation business operating in London. What do I need to do?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 67% (2/3) | 100% (3/3) |
| Conditional recall | 50% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 13 | 2 |
| Judge completeness | 4 | 5 |
| Judge accuracy | 3 | 4 |
| Judge sequencing | 5 | 5 |

Missed essential services:
- Control missed: hmrc-self-assessment

Notable omissions flagged by judge:
- Control: hmrc-self-assessment, tpr-workplace-pension, la-business-rates

**Turn 2: Follow-up A**

> *We'll sometimes need to put skips on the road outside properties we're working on. Is there anything specific for that?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 50% (1/2) | 50% (1/2) |
| Conditional recall | 0% | 0% |
| Proactive recall | 100% | 100% |
| Tool calls | 12 | 2 |
| Judge completeness | 2 | 2 |
| Judge accuracy | 3 | 3 |
| Judge sequencing | 4 | 3 |

Missed essential services:
- Control missed: la-road-occupation-licence
- Treatment missed: la-road-occupation-licence

Notable omissions flagged by judge:
- Control: la-road-occupation-licence, la-business-rates
- Treatment: la-road-occupation-licence, la-business-rates

**Turn 3: Follow-up B**

> *Are there any grants or funding available for a new construction business?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 100% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 8 | 2 |
| Judge completeness | 2 | 3 |
| Judge accuracy | 4 | 3 |
| Judge sequencing | 4 | 4 |

Notable omissions flagged by judge:
- Control: UKRI/Innovate UK grants (ukri-find-grants)
- Treatment: UKRI/Innovate UK grants (ukri-find-grants)

#### Tool calls used

**Control:**
- Turn 1: web_search({"query":"register a limited company Companies House"}), web_search({"query":"construction industry scheme CIS register as contr), web_search({"query":"register for VAT small business GOV.UK"}), web_fetch({"url":"https://www.gov.uk/limited-company-formation"}), web_fetch({"url":"https://www.gov.uk/what-is-the-construction-industry), web_search({"query":"employer PAYE registration new company HMRC GOV.UK), web_fetch({"url":"https://www.gov.uk/register-employer"}), web_search({"query":"register for Corporation Tax new limited company H), web_search({"query":"business insurance requirements building construct), web_search({"query":"register for Corporation Tax limited company withi), web_search({"query":"VAT registration threshold 2024 GOV.UK"}), web_fetch({"url":"https://www.gov.uk/corporation-tax-registration"}), web_fetch({"url":"https://www.gov.uk/vat-registration/when-to-register)
- Turn 2: web_search({"query":"skip permit licence on public road UK"}), web_search({"query":"skip on public highway licence permit council GOV.), web_search({"query":"London skip hire road permit local council applica), web_fetch({"url":"https://www.gov.uk/guidance/highways-licences-and-pe), web_search({"query":"site:gov.uk skip licence highway skips road"}), web_fetch({"url":"https://www.gov.uk/skip-licence"}), web_search({"query":"site:gov.uk licence finder skip highway"}), web_fetch({"url":"https://www.gov.uk/find-licences"}), web_fetch({"url":"https://www.gov.uk/find-licences?q=skip&location=Eng), web_search({"query":"placing skip on public road highway licence local ), web_fetch({"url":"https://www.gov.uk/skip-licence"}), web_fetch({"url":"https://www.gov.uk/skip-operator-licence"})
- Turn 3: web_search({"query":"grants funding new construction business UK 2024"}), web_search({"query":"small business grants funding startup GOV.UK"}), web_search({"query":"business finance support finder GOV.UK grants loan), web_search({"query":"London small business grants funding new business"), web_fetch({"url":"https://www.gov.uk/business-finance-support"}), web_search({"query":"site:gov.uk find business finance support grants n), web_search({"query":"site:gov.uk start up loan new business"}), web_fetch({"url":"https://www.gov.uk/apply-start-up-loan"})

**Treatment:**
- Turn 1: list_life_events({}), plan_journey({"life_event_ids":["business"]})
- Turn 2: list_life_events({}), web_fetch({"url":"https://www.gov.uk/find-licences/apply-skip-permit"})
- Turn 3: web_fetch({"url":"https://www.gov.uk/business-finance-support"}), web_fetch({"url":"https://www.gov.uk/business-finance-support?business)

---

### S5 — immigration

**Treatment advantage** (Judge completeness: control=2.67, treatment=3.67)

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | 67% | 67% |
| Conditional recall | 44% | 89% |
| Proactive recall | 67% | 67% |
| Out-of-scope rate | 0% | 0% |
| Over-scoping rate | 69% | 61% |
| Tool calls | 15 | 7 |
| Input tokens | 39,754 | 41,105 |
| Judge: completeness | 2.67 | 3.67 |
| Judge: accuracy | 3.33 | 3.33 |
| Judge: sequencing | 3.67 | 4 |
| Judge: clarity | 4.67 | 5 |

#### Turn-by-turn scores

**Turn 1: Primary prompt**

> *I'm an Italian citizen who has lived in the UK since 2018. I have pre-settled status. What should I be doing now and what am I entitled to?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (2/2) | 100% (2/2) |
| Conditional recall | 33% | 67% |
| Proactive recall | 0% | 0% |
| Tool calls | 6 | 2 |
| Judge completeness | 3 | 4 |
| Judge accuracy | 4 | 3 |
| Judge sequencing | 4 | 4 |

Notable omissions flagged by judge:
- Control: dwp-ni-number, nhs-gp-register, other-right-to-work (share code detail)
- Treatment: dwp-ni-number

**Turn 2: Follow-up A**

> *My pre-settled status is due to expire soon. What do I need to do?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 0% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 5 | 3 |
| Judge completeness | 3 | 4 |
| Judge accuracy | 3 | 4 |
| Judge sequencing | 4 | 4 |

Notable omissions flagged by judge:
- Control: ho-view-immigration-status

**Turn 3: Follow-up B**

> *I've applied for settled status but haven't heard back. Is there a way to check?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 0% (0/1) | 0% (0/1) |
| Conditional recall | 100% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 4 | 2 |
| Judge completeness | 2 | 3 |
| Judge accuracy | 3 | 3 |
| Judge sequencing | 3 | 4 |

Missed essential services:
- Control missed: ho-euss-enquiry
- Treatment missed: ho-euss-enquiry

Notable omissions flagged by judge:
- Control: ho-euss-enquiry
- Treatment: ho-euss-enquiry

#### Tool calls used

**Control:**
- Turn 1: web_search({"query":"pre-settled status what to do next settled status ), web_search({"query":"EU Settlement Scheme pre-settled status rights ent), web_fetch({"url":"https://www.gov.uk/settled-status-eu-citizens-famili), web_search({"query":"EU Settlement Scheme upgrade pre-settled to settle), web_fetch({"url":"https://www.gov.uk/settled-status-eu-citizens-famili), web_fetch({"url":"https://www.gov.uk/evisa"})
- Turn 2: web_search({"query":"pre-settled status expiry automatic extension EUSS), web_search({"query":"convert pre-settled status to settled status GOV.U), web_fetch({"url":"https://www.gov.uk/settled-status-eu-citizens-famili), web_search({"query":"pre-settled status automatic extension before expi), web_fetch({"url":"https://www.gov.uk/settled-status-eu-citizens-famili)
- Turn 3: web_search({"query":"check EU Settlement Scheme application status"}), web_search({"query":"check EU Settlement Scheme application progress GO), web_search({"query":"EU Settlement Scheme how long does application tak), web_fetch({"url":"https://www.gov.uk/settled-status-eu-citizens-famili)

**Treatment:**
- Turn 1: list_life_events({}), plan_journey({"life_event_ids":["immigration"]})
- Turn 2: list_life_events({}), web_fetch({"url":"https://www.gov.uk/settled-status-eu-citizens-famili), plan_journey({"life_event_ids":["immigration"]})
- Turn 3: web_fetch({"url":"https://www.gov.uk/view-prove-immigration-status"}), web_fetch({"url":"https://www.gov.uk/contact-ukvi-inside-outside-uk/y/)

---

### S6 — disability

**Tie** (Judge completeness: control=4.33, treatment=4.33)

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | 83% | 100% |
| Conditional recall | 28% | 67% |
| Proactive recall | 83% | 100% |
| Out-of-scope rate | 0% | 0% |
| Over-scoping rate | 68% | 63% |
| Tool calls | 30 | 9 |
| Input tokens | 74,364 | 57,492 |
| Judge: completeness | 4.33 | 4.33 |
| Judge: accuracy | 4.33 | 4 |
| Judge: sequencing | 5 | 5 |
| Judge: clarity | 5 | 5 |

#### Turn-by-turn scores

**Turn 1: Primary prompt**

> *I was recently diagnosed with Parkinson's disease. I'm still driving. What do I need to do and what support is available to me?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 50% (1/2) | 100% (2/2) |
| Conditional recall | 50% | 100% |
| Proactive recall | 50% | 100% |
| Tool calls | 11 | 3 |
| Judge completeness | 5 | 5 |
| Judge accuracy | 5 | 4 |
| Judge sequencing | 5 | 5 |

Missed essential services:
- Control missed: dvla-notify-condition

Notable omissions flagged by judge:
- Control: la-council-tax-disability-reduction, dvla-ved-exemption, nhs-care-assessment

**Turn 2: Follow-up A**

> *I'm finding it harder to manage at home. What adaptations help is available?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (2/2) | 100% (2/2) |
| Conditional recall | 0% | 0% |
| Proactive recall | 100% | 100% |
| Tool calls | 10 | 4 |
| Judge completeness | 3 | 3 |
| Judge accuracy | 4 | 4 |
| Judge sequencing | 5 | 5 |

Notable omissions flagged by judge:
- Control: la-blue-badge, other-motability
- Treatment: Motability, Blue Badge

**Turn 3: Follow-up B**

> *My wife looks after me full time. Is there anything she should apply for?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 33% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 9 | 2 |
| Judge completeness | 5 | 5 |
| Judge accuracy | 4 | 4 |
| Judge sequencing | 5 | 5 |

Notable omissions flagged by judge:
- Control: other-carers-leave

#### Tool calls used

**Control:**
- Turn 1: web_search({"query":"Parkinson's disease driving DVLA notify medical co), web_search({"query":"Parkinson's disease benefits financial support UK"), web_search({"query":"Parkinson's disease support services UK government), web_search({"query":"notify DVLA Parkinson's disease medical condition ), web_search({"query":"Personal Independence Payment Parkinson's disease ), web_search({"query":"Blue Badge eligibility Parkinson's disease"}), web_fetch({"url":"https://www.gov.uk/parkinsons-disease-and-driving"}), web_fetch({"url":"https://www.gov.uk/pip"}), web_fetch({"url":"https://www.gov.uk/apply-blue-badge"}), web_search({"query":"financial help if you're disabled GOV.UK"}), web_fetch({"url":"https://www.gov.uk/financial-help-disabled"})
- Turn 2: web_search({"query":"Disabled Facilities Grant home adaptations how to ), web_search({"query":"help at home social care needs assessment council"), web_fetch({"url":"https://www.gov.uk/disabled-facilities-grants"}), web_fetch({"url":"https://www.gov.uk/apply-disabled-facilities-grant"}), web_search({"query":"care needs assessment local council social service), web_search({"query":"apply for needs assessment social services GOV.UK"), web_search({"query":"equipment for home if disabled GOV.UK occupational), web_fetch({"url":"https://www.gov.uk/apply-needs-assessment-social-ser), web_fetch({"url":"https://www.gov.uk/apply-home-equipment-disabled"}), web_search({"query":"site:gov.uk equipment for home disabled"})
- Turn 3: web_search({"query":"Carer's Allowance eligibility how to apply"}), web_search({"query":"carer's assessment local council support for carer), web_search({"query":"carer's credit national insurance UK"}), web_fetch({"url":"https://www.gov.uk/carers-allowance"}), web_fetch({"url":"https://www.gov.uk/carers-credit"}), web_fetch({"url":"https://www.gov.uk/carer-assessment"}), web_search({"query":"carer's assessment right to request local council ), web_fetch({"url":"https://www.gov.uk/carers-allowance/eligibility"}), web_search({"query":"carer's assessment social care support for carers )

**Treatment:**
- Turn 1: list_life_events({}), plan_journey({"life_event_ids":["disability","driving"]}), web_fetch({"url":"https://www.gov.uk/parkinsons-disease-and-driving"})
- Turn 2: get_service({"service_id":"disabled-facilities-grant"}), web_fetch({"url":"https://www.gov.uk/disabled-facilities-grants"}), web_fetch({"url":"https://www.gov.uk/disabled-facilities-grants/what-y), web_fetch({"url":"https://www.gov.uk/disabled-facilities-grants/eligib)
- Turn 3: list_life_events({}), plan_journey({"life_event_ids":["carer"]})

---

### S7 — terminal-illness

**Treatment advantage** (Judge completeness: control=3.67, treatment=4.67)

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | 100% | 100% |
| Conditional recall | 44% | 83% |
| Proactive recall | 50% | 67% |
| Out-of-scope rate | 0% | 0% |
| Over-scoping rate | 63% | 62% |
| Tool calls | 32 | 9 |
| Input tokens | 78,198 | 48,718 |
| Judge: completeness | 3.67 | 4.67 |
| Judge: accuracy | 3.67 | 4 |
| Judge: sequencing | 4.67 | 4.33 |
| Judge: clarity | 5 | 5 |

#### Turn-by-turn scores

**Turn 1: Primary prompt**

> *I've just been told I have a terminal diagnosis and probably have less than six months to live. I'm 58, married, and my wife has given up work to look after me. What do I need to sort out urgently?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (3/3) | 100% (3/3) |
| Conditional recall | 33% | 100% |
| Proactive recall | 50% | 100% |
| Tool calls | 15 | 2 |
| Judge completeness | 3 | 5 |
| Judge accuracy | 3 | 4 |
| Judge sequencing | 4 | 5 |

Notable omissions flagged by judge:
- Control: dwp-sr1-form, nhs-continuing-healthcare, nhs-care-assessment
- Treatment: dwp-universal-credit

**Turn 2: Follow-up A**

> *I want to stay at home as long as possible. What care and support is available to help with that?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (2/2) | 100% (2/2) |
| Conditional recall | 0% | 50% |
| Proactive recall | 0% | 0% |
| Tool calls | 9 | 4 |
| Judge completeness | 3 | 4 |
| Judge accuracy | 4 | 4 |
| Judge sequencing | 5 | 4 |

Notable omissions flagged by judge:
- Control: dwp-attendance-allowance, la-disabled-facilities-grant, other-motability
- Treatment: dwp-attendance-allowance, other-motability

**Turn 3: Follow-up B**

> *My wife has given up her job to look after me full time. What is she entitled to?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 100% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 8 | 3 |
| Judge completeness | 5 | 5 |
| Judge accuracy | 4 | 4 |
| Judge sequencing | 5 | 4 |

#### Tool calls used

**Control:**
- Turn 1: web_search({"query":"terminal illness benefits fast track six months to), web_search({"query":"Carer's Allowance wife caring for terminally ill s), web_search({"query":"making a will power of attorney terminal illness G), web_fetch({"url":"https://www.gov.uk/pip/terminal-illness"}), web_fetch({"url":"https://www.gov.uk/carers-allowance"}), web_fetch({"url":"https://www.gov.uk/power-of-attorney"}), web_fetch({"url":"https://www.gov.uk/pip/terminal-illness"}), web_search({"query":"Universal Credit terminal illness special rules en), web_search({"query":"make a will GOV.UK"}), web_fetch({"url":"https://www.gov.uk/pip/nearing-end-of-life"}), web_search({"query":"make a will GOV.UK site:gov.uk"}), web_search({"query":"Employment Support Allowance terminal illness spec), web_fetch({"url":"https://www.gov.uk/make-will"}), web_fetch({"url":"https://www.gov.uk/employment-support-allowance/elig), web_search({"query":"benefits nearing end of life terminal illness spec)
- Turn 2: web_search({"query":"care and support at home terminal illness end of l), web_search({"query":"NHS continuing healthcare fast track terminal illn), web_search({"query":"council social care assessment home care support G), web_fetch({"url":"https://www.gov.uk/help-care-home/overview"}), web_fetch({"url":"https://www.gov.uk/nhs-continuing-healthcare"}), web_fetch({"url":"https://www.gov.uk/care-needs-assessment"}), web_fetch({"url":"https://www.gov.uk/apply-needs-assessment-social-ser), web_fetch({"url":"https://www.gov.uk/government/publications/nhs-conti), web_fetch({"url":"https://www.gov.uk/carers-allowance"})
- Turn 3: web_search({"query":"Carer's Allowance eligibility amount 2024"}), web_search({"query":"Carer's Credit National Insurance terminal illness), web_search({"query":"Universal Credit carer element 2024"}), web_fetch({"url":"https://www.gov.uk/carers-allowance"}), web_fetch({"url":"https://www.gov.uk/carers-credit"}), web_fetch({"url":"https://www.gov.uk/universal-credit/what-youll-get"}), web_fetch({"url":"https://www.gov.uk/carers-allowance/eligibility"}), web_search({"query":"Universal Credit carer element amount 2024 2025"})

**Treatment:**
- Turn 1: list_life_events({}), plan_journey({"life_event_ids":["terminal-illness","carer","disability"]})
- Turn 2: get_service({"service_id":"nhse-continuing-healthcare"}), get_service({"service_id":"la-care-needs-assessment"}), list_life_events({}), plan_journey({"life_event_ids":["terminal-illness","disability","carer"]})
- Turn 3: get_service({"service_id":"dwp-carers-allowance"}), get_service({"service_id":"dwp-carers-credit"}), get_service({"service_id":"la-carers-assessment"})

---

### S9 — immigration

**Treatment advantage** (Judge completeness: control=3.67, treatment=4.00)

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | 89% | 100% |
| Conditional recall | 33% | 67% |
| Proactive recall | 67% | 67% |
| Out-of-scope rate | 0% | 0% |
| Over-scoping rate | 66% | 61% |
| Tool calls | 24 | 4 |
| Input tokens | 75,181 | 45,832 |
| Judge: completeness | 3.67 | 4 |
| Judge: accuracy | 3.33 | 4 |
| Judge: sequencing | 5 | 4.67 |
| Judge: clarity | 5 | 5 |

#### Turn-by-turn scores

**Turn 1: Primary prompt**

> *I'm a software engineer from India and I've just arrived in the UK on a Skilled Worker visa sponsored by my employer. What do I need to do now I'm here?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 67% (2/3) | 100% (3/3) |
| Conditional recall | 100% | 100% |
| Proactive recall | 0% | 0% |
| Tool calls | 15 | 2 |
| Judge completeness | 4 | 4 |
| Judge accuracy | 4 | 4 |
| Judge sequencing | 5 | 4 |

Missed essential services:
- Control missed: ho-skilled-worker-visa

Notable omissions flagged by judge:
- Control: ho-skilled-worker-dependent-visa
- Treatment: ho-skilled-worker-dependent-visa

**Turn 2: Follow-up A**

> *My wife and two children are still in India and want to join me. What do they need to do?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 0% | 100% |
| Proactive recall | 100% | 100% |
| Tool calls | 6 | 2 |
| Judge completeness | 4 | 5 |
| Judge accuracy | 3 | 4 |
| Judge sequencing | 5 | 5 |

Notable omissions flagged by judge:
- Control: nhs-gp-register

**Turn 3: Follow-up B**

> *My employer is asking me to provide proof of my right to work. How do I do that?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (2/2) | 100% (2/2) |
| Conditional recall | 0% | 0% |
| Proactive recall | 100% | 100% |
| Tool calls | 3 | 0 |
| Judge completeness | 3 | 3 |
| Judge accuracy | 3 | 4 |
| Judge sequencing | 5 | 5 |

Notable omissions flagged by judge:
- Control: dwp-ni-number, alternative right-to-work proof for physical document holders
- Treatment: other-right-to-work (physical document-based proof methods), dwp-ni-number

#### Tool calls used

**Control:**
- Turn 1: web_search({"query":"what to do after arriving UK Skilled Worker visa"}), web_search({"query":"collect BRP biometric residence permit after arriv), web_search({"query":"register with GP doctor after arriving UK"}), web_fetch({"url":"https://www.gov.uk/skilled-worker-visa"}), web_fetch({"url":"https://www.gov.uk/evisa"}), web_search({"query":"register GP NHS how to site:gov.uk OR site:nhs.uk"), web_search({"query":"apply for National Insurance number after arriving), web_search({"query":"apply National Insurance number new arrival UK gov), web_search({"query":"register with GP NHS new to UK nhs.uk how to find"), web_search({"query":"driving licence exchange India to UK gov.uk"}), web_fetch({"url":"https://www.gov.uk/apply-national-insurance-number"}), web_fetch({"url":"https://www.gov.uk/exchange-foreign-driving-licence"), web_fetch({"url":"https://www.nhs.uk/nhs-services/gps/how-to-register-), web_search({"query":"open bank account new to UK arrived recently gov.u), web_search({"query":"tell HMRC you have started work new employee tax c)
- Turn 2: web_search({"query":"Skilled Worker visa dependants family join UK spou), web_search({"query":"apply for UK visa dependant partner child Skilled ), web_fetch({"url":"https://www.gov.uk/skilled-worker-visa/bring-family"), web_fetch({"url":"https://www.gov.uk/skilled-worker-visa/your-partner-), web_search({"query":"dependant visa application fee healthcare surcharg), web_fetch({"url":"https://www.gov.uk/skilled-worker-visa/how-much-it-c)
- Turn 3: web_search({"query":"prove right to work UK eVisa share code employer"}), web_fetch({"url":"https://www.gov.uk/prove-right-to-work"}), web_fetch({"url":"https://www.gov.uk/prove-right-to-work/get-a-share-c)

**Treatment:**
- Turn 1: list_life_events({}), plan_journey({"life_event_ids":["immigration","new-job"]})
- Turn 2: list_life_events({}), plan_journey({"life_event_ids":["immigration","school"]})

---

### S10 — retirement

**Treatment advantage** (Judge completeness: control=3.00, treatment=3.33)

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | 83% | 83% |
| Conditional recall | 44% | 33% |
| Proactive recall | 67% | 67% |
| Out-of-scope rate | 0% | 0% |
| Over-scoping rate | 68% | 69% |
| Tool calls | 22 | 8 |
| Input tokens | 61,140 | 50,290 |
| Judge: completeness | 3 | 3.33 |
| Judge: accuracy | 3.33 | 3.33 |
| Judge: sequencing | 4.33 | 4.33 |
| Judge: clarity | 5 | 5 |

#### Turn-by-turn scores

**Turn 1: Primary prompt**

> *I'm 64 and planning to retire next year when I turn 65. I've been self-employed for much of my career and I'm worried I might have gaps in my National Insurance record. What should I be doing now?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (2/2) | 100% (2/2) |
| Conditional recall | 33% | 100% |
| Proactive recall | 0% | 0% |
| Tool calls | 11 | 2 |
| Judge completeness | 3 | 4 |
| Judge accuracy | 3 | 4 |
| Judge sequencing | 5 | 5 |

Notable omissions flagged by judge:
- Control: dwp-pension-credit, hmrc-tax-on-pension, dwp-inherited-state-pension
- Treatment: dwp-inherited-state-pension

**Turn 2: Follow-up A**

> *I've checked and I have 8 years of NI gaps. Is it worth paying to fill them?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 100% (1/1) | 100% (1/1) |
| Conditional recall | 100% | 0% |
| Proactive recall | 100% | 100% |
| Tool calls | 4 | 2 |
| Judge completeness | 4 | 4 |
| Judge accuracy | 3 | 3 |
| Judge sequencing | 5 | 5 |

Notable omissions flagged by judge:
- Treatment: hmrc-ni-check explicitly as a step

**Turn 3: Follow-up B**

> *My husband died two years ago. He had a full NI record and we were married for 30 years. Does that affect my State Pension or any other entitlements?*

| Metric | Control | Treatment |
|--------|---------|----------|
| Essential recall | 50% (1/2) | 50% (1/2) |
| Conditional recall | 0% | 0% |
| Proactive recall | 100% | 100% |
| Tool calls | 7 | 4 |
| Judge completeness | 2 | 2 |
| Judge accuracy | 4 | 3 |
| Judge sequencing | 3 | 3 |

Missed essential services:
- Control missed: dwp-pension-credit
- Treatment missed: dwp-pension-credit

Notable omissions flagged by judge:
- Control: dwp-pension-credit, dwp-attendance-allowance, other-tv-licence-pension
- Treatment: dwp-pension-credit, dwp-attendance-allowance, other-tv-licence-pension

#### Tool calls used

**Control:**
- Turn 1: web_search({"query":"check National Insurance record gaps self-employed), web_search({"query":"State Pension age UK 2024 when can I claim"}), web_search({"query":"voluntary National Insurance contributions fill ga), web_fetch({"url":"https://www.gov.uk/check-state-pension"}), web_fetch({"url":"https://www.gov.uk/voluntary-national-insurance-cont), web_search({"query":"State Pension age increase 67 when does it apply U), web_search({"query":"State Pension age 66 UK born 1960 1961"}), web_fetch({"url":"https://www.gov.uk/voluntary-national-insurance-cont), web_search({"query":"check National Insurance record online GOV.UK"}), web_fetch({"url":"https://www.gov.uk/state-pension-age"}), web_fetch({"url":"https://www.gov.uk/check-national-insurance-record"})
- Turn 2: web_search({"query":"voluntary National Insurance contributions cost fi), web_search({"query":"how many qualifying years needed full state pensio), web_fetch({"url":"https://www.gov.uk/voluntary-national-insurance-cont), web_fetch({"url":"https://www.gov.uk/voluntary-national-insurance-cont)
- Turn 3: web_search({"query":"inheriting state pension from spouse GOV.UK"}), web_search({"query":"bereavement benefits widow entitlements GOV.UK"}), web_fetch({"url":"https://www.gov.uk/bereavement-support-payment"}), web_search({"query":"inherit state pension spouse new state pension GOV), web_fetch({"url":"https://www.gov.uk/bereavement-support-payment/eligi), web_search({"query":"new state pension inheriting extra state pension f), web_fetch({"url":"https://www.gov.uk/new-state-pension/inheriting-or-i)

**Treatment:**
- Turn 1: list_life_events({}), plan_journey({"life_event_ids":["retirement"]})
- Turn 2: web_fetch({"url":"https://www.gov.uk/voluntary-national-insurance-cont), web_fetch({"url":"https://www.gov.uk/new-state-pension/what-youll-get")
- Turn 3: list_life_events({}), web_fetch({"url":"https://www.gov.uk/state-pension/eligibility"}), plan_journey({"life_event_ids":["bereavement","retirement"]}), web_fetch({"url":"https://www.gov.uk/new-state-pension/inheriting-or-i)

---

## Failure Analysis

Cases where control outperformed treatment (or treatment failed to meet success criteria):

**S6 (disability):** Control completeness=4.33, Treatment completeness=4.33 — Essential recall Δ=17%

Likely cause: GOV.UK web content provided comparable or richer detail; graph coverage may be insufficient for this scenario.

## Recommendations

Based on the experiment, the following graph improvements are identified:

**S2:** Treatment missed essential services: dwp-bereavement-support. Check that these nodes are present and reachable from the `bereavement` life event entry points.

**S4:** Treatment missed essential services: la-road-occupation-licence. Check that these nodes are present and reachable from the `business` life event entry points.

**S5:** Treatment missed essential services: ho-euss-enquiry. Check that these nodes are present and reachable from the `immigration` life event entry points.

**S10:** Treatment missed essential services: dwp-pension-credit. Check that these nodes are present and reachable from the `retirement` life event entry points.

### Graph coverage gaps identified

| Service | Times missed (treatment) | Action |
|---------|--------------------------|--------|
| dwp-bereavement-support | 2 | Verify node exists and is reachable from relevant life events |
| la-road-occupation-licence | 1 | Verify node exists and is reachable from relevant life events |
| ho-euss-enquiry | 1 | Verify node exists and is reachable from relevant life events |
| dwp-pension-credit | 1 | Verify node exists and is reachable from relevant life events |

---

## Methodology Notes

- **Runs per scenario:** 1 (spec calls for 5). Results are directional indicators only.
- **Statistical analysis:** Not applicable at N=1. No confidence intervals or p-values computed.
- **Checklist construction:** Reference checklists built from graph node set + UK policy knowledge, before running agents.
- **Matching method:** Alias-based substring matching (case-insensitive). May under-count paraphrased mentions.
- **LLM judge:** claude-opus-4-6 used (different model family, per §6.2 guidance). No self-preference bias.
- **Control agent tools:** web_search (GOV.UK API) + web_fetch. No conversation history between scenarios.
- **Treatment agent tools:** list_life_events, plan_journey, get_service, web_fetch.
- **Temperature:** 0.3 for both conditions (spec §3.3).
- **Max tokens:** 4096 per response.
- **FPR note:** Prior version used over-scoping rate (mentions beyond checklist) as FPR, which penalised helpful comprehensiveness. Now uses: out-of-scope rate (explicitly prohibited services mentioned = actual errors) and over-scoping rate (informational only). Scenario advantage now determined by LLM judge completeness score rather than automated F1.

---

*Generated by scripts/run-experiment.ts on 2026-03-20T15:04:35.561Z*
