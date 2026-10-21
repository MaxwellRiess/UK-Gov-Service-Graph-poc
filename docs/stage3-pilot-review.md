# Stage 3 pilot: fields to check by hand

25 fields. 9 confirmed elsewhere, 12 partly supported, 4 not found.

For each confirmed field, open the link and check that the quote is there and says what the claim says. For each field that was not found, check whether a quick search of your own turns up an official page that states it. Either kind of disagreement means the method needs adjusting before the full run.

## What the pilot showed

These 25 fields had no source on the pages their service cites. Two finder subagents searched the web for each claim, the pipeline fetched every page they put forward, and three separate judge subagents decided each claim against that text. Every quote below was found word for word on its page. Some confirmations still look wrong to a careful reader, and checking those is the point of this sample.

| Outcome | Fields | What happens next |
|---|---|---|
| Confirmed elsewhere | 9 | Kept, with the new page as its source |
| Partly supported | 12 | Stage 5: reword to what the found page says. Several are real corrections, for example Blue Badge's PIP test is 8 points for "moving around", not the enhanced rate |
| Not found | 4 | Removal candidates (stage 4) |

**Where I think the judges were too lenient. Check these first:**

1. **Care needs assessment, "in person".** It was confirmed from "The needs assessment can happen: face-to-face". That describes how the assessment is done, not how you ask for one, so I think this confirmation is wrong. The judge called it lenient itself.
2. **Help to Buy, "proof of first-time buyer status".** It was confirmed from one council saying buyers "sign legal declarations". A declaration isn't documentary proof, and one council's page may not speak for the national scheme.
3. **Register the death, who can register.** It was confirmed from two council pages restating the national rule. I think that's acceptable: the pages state the law, not a local practice. But the node covers the whole UK and these pages cover England and Wales; nidirect lists different people for Northern Ireland.

**What I'd change before the full run:**

- **Council pages.** Tell the judge that a page from one council supports a claim only about that council, unless it states a national rule (a law or a national scheme). The pilot used a single council's page to confirm the Disabled Facilities Grant phone route and the school-place birth certificate.
- **Ways to apply.** The page must say you can apply or ask that way. How the service itself is delivered doesn't count.

**What "not found" looked like.** Each of the 4 had at least three searches. Two are claims the found pages show to be wrong, not just unsourced:
- D27 is the form for renewing a licence after disqualification, not for reporting a death.
- Best Start Foods says most people can apply without sending evidence.

## Confirmed elsewhere (9)

### Register the death: `eligibility.criteria.1`

**Claim:** Registrant must be a qualified informant: a relative, someone present at the death, or an administrator of the premises.

**Outcome:** confirmed elsewhere

**Evidence** (open the link and find the quote):

- [wandsworth.gov.uk/registration-services/deaths/register-a-death](https://wandsworth.gov.uk/registration-services/deaths/register-a-death) *(found by search)*
  > Qualified informants can register a death.
- [wandsworth.gov.uk/registration-services/deaths/register-a-death](https://wandsworth.gov.uk/registration-services/deaths/register-a-death) *(found by search)*
  > A qualified informant can be: A relative A person who was present at the death
- [www.wokingham.gov.uk/births-deaths-and-ceremonies/deaths/register-death](https://www.wokingham.gov.uk/births-deaths-and-ceremonies/deaths/register-death) *(found by search)*
  > Occupier of the house / home where the death happened - if in an establishment the occupier could be the establishment's manager or senior administrator

**Search:** 3 queries, 3 page(s) put forward.
<details><summary>Queries and pages</summary>

- `who can register a death relative present at the death occupier of the premises gov.uk`
- `direct fetch: nidirect registering a death`
- `direct fetch: legislation Births and Deaths Registration Act 1953 s16`
- https://www.legislation.gov.uk/ukpga/Eliz2/1-2/20/section/16: England and Wales statute listing qualified informants: relatives present at the death or in attendance during the last illness, 'any person present at the death', and the occupier of the house.
- https://www.northtyneside.gov.uk/births-deaths-and-marriages/death-and-bereavement/step-by-step/register-death/who-can-register: Council page (England) listing 'a relative present at the death', 'a person present at the death', 'the occupier of the premises where the person died'.
- https://www.nidirect.gov.uk/articles/registering-death: Northern Ireland page listing 'any relative of the deceased', 'a person present at the death', and the governor or chief officer of a public building where the death occurred.

</details>

### Adult Disability Payment: `eligibility.criteria.2`

**Claim:** Must live in Scotland.

**Outcome:** confirmed elsewhere

**Evidence** (open the link and find the quote):

- [www.citizensadvice.org.uk/scotland/benefits/sick-or-disabled-people-and-carers/adult-disability-payment/adult-disability-s/](https://www.citizensadvice.org.uk/scotland/benefits/sick-or-disabled-people-and-carers/adult-disability-payment/adult-disability-s/) *(found by search)*
  > In most cases, you must also: be between 16 years old and State Pension age, and live in Scotland.

**Search:** 3 queries, 2 page(s) put forward.
<details><summary>Queries and pages</summary>

- `mygov.scot adult disability payment eligibility "live in Scotland"`
- `Adult Disability Payment who can apply live in Scotland (mygov.scot, socialsecurity.gov.scot, gov.scot)`
- `direct fetch: mygov.scot/adult-disability-payment/eligibility (404)`
- https://www.socialsecurity.gov.scot/publications/2017/02/adult-disability-payment-decision-making-guide/pages/residence-and-presence-for-adult-disability-payment/eligibility: Social Security Scotland decision guide: main residence requirement is that 'they are ordinarily resident in Scotland'.
- https://www.citizensadvice.org.uk/scotland/benefits/sick-or-disabled-people-and-carers/adult-disability-payment/adult-disability-s/: Citizens Advice Scotland: 'You must meet the rules about living in Scotland to get Adult Disability Payment', in most cases you must 'live in Scotland'.

</details>

### NHS Continuing Healthcare (CHC): `eligibility.autoQualifiers.0`

**Claim:** Terminal illness (fast-track CHC)

**Outcome:** confirmed elsewhere

**Evidence** (open the link and find the quote):

- [www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/) *(found by search)*
  > However, if you need care urgently – for example, if you're terminally ill – your assessment may be fast-tracked.

**Search:** 3 queries, 2 page(s) put forward.
<details><summary>Queries and pages</summary>

- `direct fetch: nhs.uk NHS continuing healthcare guide`
- `NHS continuing healthcare fast track pathway rapidly deteriorating end of life (gov.uk, nhs.uk)`
- `direct fetch: gov.uk fast-track pathway tool guidance`
- https://www.gov.uk/government/publications/nhs-continuing-healthcare-fast-track-pathway-tool/fast-track-pathway-tool-for-nhs-continuing-healthcare-guidance: Tool identifies people 'who need to be fast tracked for immediate provision of NHS continuing healthcare due to a rapidly deteriorating condition that may mean individuals are entering a terminal phase'.
- https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/: States terminally ill people's assessment 'may be fast-tracked' and those nearing end of life 'should be considered for the NHS continuing healthcare fast-track pathway'.

</details>

### ACAS early conciliation: `agentInteraction.methods`

**Claim:** You can apply or do this online. You can apply or do this by phone.

**Outcome:** confirmed elsewhere

**Evidence** (open the link and find the quote):

- [www.acas.org.uk/notify-acas](https://www.acas.org.uk/notify-acas) *(found by search)*
  > You can notify Acas using our online form.
- [www.acas.org.uk/notify-acas](https://www.acas.org.uk/notify-acas) *(found by search)*
  > If you cannot use the online form, you can notify Acas by contacting the early conciliation team. Telephone: 0300 123 1122

**Search:** 1 queries, 2 page(s) put forward.
<details><summary>Queries and pages</summary>

- `Acas early conciliation notify online form or phone 0300 123 1122`
- https://www.acas.org.uk/notify-acas: States both online and phone: 'You can notify Acas using our online form.' and 'If you cannot use the online form, you can notify Acas by contacting the early conciliation team' (Telephone: 0300 123 1122).
- https://www.citizensadvice.org.uk/work/negotiating-with-your-employer/early-conciliation/: States online and phone: 'fill in the early conciliation notification form on the Acas website' and 'You can call Acas if you don't want to fill in an online form.'

</details>

### Care needs assessment: `agentInteraction.methods`

**Claim:** You can apply or do this by phone. You can apply or do this in person.

**Outcome:** confirmed elsewhere

**Evidence** (open the link and find the quote):

- [www.nhs.uk/social-care-and-support/help-from-social-services-and-charities/getting-a-needs-assessment/](https://www.nhs.uk/social-care-and-support/help-from-social-services-and-charities/getting-a-needs-assessment/) *(found by search)*
  > Contact social services at your local council and ask for a needs assessment. You can call them or do it online.
- [www.nhs.uk/social-care-and-support/help-from-social-services-and-charities/getting-a-needs-assessment/](https://www.nhs.uk/social-care-and-support/help-from-social-services-and-charities/getting-a-needs-assessment/) *(found by search)*
  > The needs assessment can happen: face-to-face

**Search:** 3 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `NHS care needs assessment how to get one phone council social services`
- `nhs.uk getting a needs assessment`
- `council care and support assessment request phone in person`
- https://www.nhs.uk/social-care-and-support/help-from-social-services-and-charities/getting-a-needs-assessment/: Phone part only: 'Contact social services at your local council and ask for a needs assessment. You can call them or do it online.' No in-person method.

</details>

### DBS check: `agentInteraction.methods`

**Claim:** You can apply or do this online.

**Outcome:** confirmed elsewhere

**Evidence** (open the link and find the quote):

- [www.gov.uk/government/organisations/disclosure-and-barring-service/about](https://www.gov.uk/government/organisations/disclosure-and-barring-service/about) *(found by search)*
  > An individual can apply for a Basic check directly to DBS through our online application route

**Search:** 3 queries, 2 page(s) put forward.
<details><summary>Queries and pages</summary>

- `gov.uk basic DBS check apply online`
- `gov.uk request-copy-criminal-record`
- `DBS about page online application route`
- https://www.gov.uk/government/organisations/disclosure-and-barring-service/about: States online applying for basic checks: 'An individual can apply for a Basic check directly to DBS through our online application route.' (not for standard/enhanced).
- https://www.gov.uk/request-copy-criminal-record: Basic DBS check service start page with 'Start now' to apply-basic-criminal-record-check.service.gov.uk; 'you'll need to prove your identity using GOV.UK One Login' (online implied, not stated in words).

</details>

### Visa / leave to enter: `eligibility.evidenceRequired.3`

**Claim:** Immigration Health Surcharge payment

**Outcome:** confirmed elsewhere

**Evidence** (open the link and find the quote):

- [www.gov.uk/healthcare-immigration-application](https://www.gov.uk/healthcare-immigration-application) *(found by search)*
  > Most people need to pay the immigration health surcharge ( IHS ) as part of their online immigration application.

**Search:** 1 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `gov.uk immigration health surcharge pay as part of visa application`
- https://www.gov.uk/healthcare-immigration-application: States IHS is paid as part of the application: 'Most people need to pay the immigration health surcharge (IHS) as part of their online immigration application.'

</details>

### First Homes / Help to Buy scheme: `eligibility.evidenceRequired.0`

**Claim:** Proof of first-time buyer status

**Outcome:** confirmed elsewhere

**Evidence** (open the link and find the quote):

- [www.whitehorsedc.gov.uk/first-homes-from-applying-to-moving-in/](https://www.whitehorsedc.gov.uk/first-homes-from-applying-to-moving-in/) *(found by search)*
  > Sign legal declarations confirming (for example) that all buyers are first-time buyers

**Search:** 3 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `First Homes scheme evidence first-time buyer declaration local authority eligibility check`
- `First Homes "first-time buyer" evidence council application documents required declaration`
- `Bristol / South Holland First Homes how to purchase (unreachable)`
- https://www.whitehorsedc.gov.uk/first-homes-from-applying-to-moving-in/: Requires a signed declaration rather than documentary proof: 'Sign legal declarations confirming (for example) that all buyers are first-time buyers.' Single council.

</details>

### Register the death: `eligibility.summary`

**Claim:** Required for every death in England and Wales. Must be done by a qualified informant (relative, person present at death, etc.) within 5 days.

**Outcome:** confirmed elsewhere

**Evidence** (open the link and find the quote):

- [www.wokingham.gov.uk/births-deaths-and-ceremonies/deaths/register-death](https://www.wokingham.gov.uk/births-deaths-and-ceremonies/deaths/register-death) *(found by search)*
  > All deaths must be registered at the Register Office for the area where death occurred within 5 days of the Registrar receiving the completed paperwork.
- [wandsworth.gov.uk/registration-services/deaths/register-a-death](https://wandsworth.gov.uk/registration-services/deaths/register-a-death) *(found by search)*
  > A qualified informant can be: A relative A person who was present at the death
- [www.gov.uk/after-a-death/register-the-death](https://www.gov.uk/after-a-death/register-the-death)
  > Register the death within 5 days (8 days in Scotland) of getting the confirmation.

**Search:** 3 queries, 3 page(s) put forward.
<details><summary>Queries and pages</summary>

- `register a death within 5 days who can register informant gov.uk England Wales`
- `council register a death "within 5 days" "present at the death" qualified informant`
- `gov.uk when-someone-dies (no detail)`
- https://www.wokingham.gov.uk/births-deaths-and-ceremonies/deaths/register-death: 'All deaths must be registered at the Register Office for the area where death occurred within 5 days'; informants in order of preference include 'Relative of the deceased' and 'Any person present at the death'.
- https://wandsworth.gov.uk/registration-services/deaths/register-a-death: 'You are legally required to register a death within five days'; 'Qualified informants can register a death' including 'A person who was present at the death'.
- https://www.citizensadvice.org.uk/family/death-and-wills/what-to-do-after-a-death/: England page: 5 days after the medical examiner's office gives the cause of death; 'A relative should usually register the death'; 'It's a criminal offence not to register a death.'

</details>

## Partly supported (12)

### Apply for or renew a passport: `eligibility.criteria.0`

**Claim:** Must be a British national (citizen, overseas territory citizen, etc.).

**Outcome:** partly supported

**Evidence** (open the link and find the quote):

- [www.gov.uk/apply-first-adult-passport](https://www.gov.uk/apply-first-adult-passport) *(found by search)*
  > you’re a British national

**What is missing:**

- partly supported: The text implies citizens of a British overseas territory can apply, but it never lists which categories count as British national, so British citizens and the other unspecified categories are not set out.

**Search:** 1 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `direct fetch: gov.uk/apply-first-adult-passport (who can apply)`
- https://www.gov.uk/apply-first-adult-passport: States the first eligibility condition for a first adult UK passport: 'you're a British national', linking to types of British nationality.

</details>

### Divorce application (D8): `eligibility.criteria.1`

**Claim:** Either party must be domiciled in England/Wales, or habitually resident for at least 6 of the last 12 months.

**Outcome:** partly supported

**Evidence** (open the link and find the quote):

- [www.legislation.gov.uk/ukpga/1973/45/section/5](https://www.legislation.gov.uk/ukpga/1973/45/section/5) *(found by search)*
  > (g) either of the parties to the marriage is domiciled in England and Wales. ]

**What is missing:**

- partly supported: The six-month residence ground applies only to the applicant, who must also be domiciled there, and requires six months immediately before the application, not 6 of the last 12 months; otherwise habitual residence needs one year or applies to the respondent, both parties, or either party in a joint application.

**Search:** 3 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `divorce jurisdiction domiciled habitually resident England and Wales six months gov.uk form D8 guidance`
- `direct fetch: gov.uk/divorce/check-you-can-get-divorced (no residence rule)`
- `direct fetch: legislation Domicile and Matrimonial Proceedings Act 1973 s5`
- https://www.legislation.gov.uk/ukpga/1973/45/section/5: s5(2) jurisdiction grounds include 'either of the parties to the marriage is domiciled in England and Wales' and applicant 'domiciled and habitually resident' who 'has resided there for at least six months immediately before the application'; the 6-month rule needs domicile plus habitual residence, and other habitual-residence grounds (eg 12 months) differ from the claim's wording.

</details>

### Legal Aid application: `eligibility.criteria.1`

**Claim:** Case must pass the merits test — chances of success and proportionality to cost.

**Outcome:** partly supported

**Evidence** (open the link and find the quote):

- [www.legislation.gov.uk/uksi/2013/104/part/4](https://www.legislation.gov.uk/uksi/2013/104/part/4) *(found by search)*
  > PART 4 E+W GENERAL MERITS CRITERIA
- [www.legislation.gov.uk/uksi/2013/104/part/4](https://www.legislation.gov.uk/uksi/2013/104/part/4) *(found by search)*
  > there is likely to be sufficient benefit to the individual, having regard to all the circumstances of the case, including the circumstances of the individual, to justify the cost of provision of legal help.

**What is missing:**

- partly supported: A prospects of success criterion (reg. 43) applies to full representation, but the regulations do not apply it to other forms of legal aid such as legal help.

**Search:** 3 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `direct fetch: gov.uk/legal-aid/eligibility (no merits test)`
- `civil legal aid merits test prospects of success cost benefit proportionality gov.uk Legal Aid Agency`
- `direct fetch: legislation Civil Legal Aid (Merits Criteria) Regulations 2013 Part 4`
- https://www.legislation.gov.uk/uksi/2013/104/part/4: Merits criteria for full representation: prospects of success must be 'very good, good or moderate' (reg 43) and cost-benefit tests, eg likely damages exceed likely costs 'by a ratio of four to one' for moderate prospects, plus the proportionality test (reg 42).

</details>

### Blue Badge: `eligibility.criteria.0`

**Claim:** Cannot walk, or have severe difficulty walking, or are registered severely sight impaired, or have a hidden disability causing very considerable difficulty.

**Outcome:** partly supported

**Evidence** (open the link and find the quote):

- [www.gov.uk/government/publications/blue-badge-can-i-get-one/can-i-get-a-blue-badge](https://www.gov.uk/government/publications/blue-badge-can-i-get-one/can-i-get-a-blue-badge) *(found by search)*
  > you cannot walk at all
- [www.gov.uk/government/publications/blue-badge-can-i-get-one/can-i-get-a-blue-badge](https://www.gov.uk/government/publications/blue-badge-can-i-get-one/can-i-get-a-blue-badge) *(found by search)*
  > you find walking very difficult due to pain, breathlessness or the time it takes
- [www.gov.uk/government/publications/blue-badge-can-i-get-one/can-i-get-a-blue-badge](https://www.gov.uk/government/publications/blue-badge-can-i-get-one/can-i-get-a-blue-badge) *(found by search)*
  > you are registered blind (severely sight impaired)

**What is missing:**

- partly supported: The text treats non-visible (hidden) conditions as a route to eligibility, with criteria such as struggling severely to plan or follow a journey, but it does not use a 'very considerable difficulty' threshold for hidden conditions.

**Search:** 3 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `direct fetch: gov.uk/government/publications/blue-badge-can-i-get-one`
- `Who can get a Blue Badge guidance gov.uk automatically qualify PIP moving around 8 points`
- `direct fetch: blue-badge-can-i-get-one/can-i-get-a-blue-badge`
- https://www.gov.uk/government/publications/blue-badge-can-i-get-one/can-i-get-a-blue-badge: England guidance: automatic if 'you are registered blind (severely sight impaired)'; discretionary if 'you find walking very difficult due to pain, breathlessness or the time it takes'; covers non-visible conditions, though 'very considerable difficulty' wording is tied to walking, not hidden disability.

</details>

### Voluntary National Insurance contributions (Class 3): `eligibility.exclusions.0`

**Claim:** Already entitled to full new State Pension (35 qualifying years)

**Outcome:** partly supported

**Evidence** (open the link and find the quote):

- [www.gov.uk/new-state-pension](https://www.gov.uk/new-state-pension) *(found by search)*
  > If your National Insurance record started after April 2016 you will need 35 qualifying years to get the full rate of new State Pension.

**What is missing:**

- partly supported: The text excludes people with no gaps in their record, not people already entitled to the full State Pension; it only says voluntary contributions do not always increase the State Pension.

**Search:** 3 queries, 2 page(s) put forward.
<details><summary>Queries and pages</summary>

- `voluntary National Insurance contributions not worth paying if already 35 qualifying years full new State Pension gov.uk`
- `voluntary contributions "35 qualifying years" check if paying would increase State Pension (gov.uk, citizensadvice)`
- `direct fetch: gov.uk/voluntary-national-insurance-contributions/why-pay-voluntary-contributions (no 35 years)`
- https://www.gov.uk/new-state-pension/what-youll-get: States 'you will need 35 qualifying years to get the full rate of new State Pension' but does not frame full entitlement as a bar to voluntary contributions.
- https://www.gov.uk/government/publications/your-new-state-pension-explained/your-state-pension-explained: States you 'will need 35 qualifying years to get the full amount of new State Pension' and that voluntary contributions can fill gaps; no explicit exclusion.

</details>

### Apply for bankruptcy: `eligibility.exclusions.0`

**Claim:** Already bankrupt

**Outcome:** partly supported

**What is missing:**

- partly supported: The Act bars an order where a bankruptcy order already covers the debts in the application, but does not say that being already bankrupt excludes the person outright.

**Search:** 3 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `gov.uk apply for bankruptcy cannot apply if already bankrupt`
- `direct fetch: legislation Insolvency Act 1986 s263K`
- `(reviewed Gazette and archived gov.uk becoming-bankrupt results)`
- https://www.legislation.gov.uk/ukpga/1986/45/section/263K: Adjudicator must refuse unless 'no bankruptcy order has been made in respect of any of the debts which are the subject of the application' and no petition is pending; narrower than a general 'already bankrupt' bar.

</details>

### Blue Badge: `eligibility.autoQualifiers.0`

**Claim:** Enhanced Rate PIP mobility component confirmed

**Outcome:** partly supported

**What is missing:**

- partly supported: The text grants automatic eligibility for PIP mobility based on a score of 8 or more points for moving around, or 10 points under descriptor E, and asks for proof of the PIP award, but it never mentions the enhanced rate.

**Search:** 3 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `Who can get a Blue Badge guidance gov.uk automatically qualify PIP moving around 8 points`
- `direct fetch: blue-badge-can-i-get-one/can-i-get-a-blue-badge`
- `direct fetch: blue-badge-can-i-get-one publication page`
- https://www.gov.uk/government/publications/blue-badge-can-i-get-one/can-i-get-a-blue-badge: Automatic eligibility for PIP recipients with 'a score of 8 points or more under the moving around activity of the mobility component' (England), which is the specific test rather than any enhanced mobility award.

</details>

### Disabled Facilities Grant: `agentInteraction.methods`

**Claim:** You can apply or do this by phone. You can apply or do this in person.

**Outcome:** partly supported

**Evidence** (open the link and find the quote):

- [www.bcpcouncil.gov.uk/adult-social-care-and-health/support-for-adults-with-a-disability/disabled-facilities-grants/apply-for-a-disabled-facilities-grant](https://www.bcpcouncil.gov.uk/adult-social-care-and-health/support-for-adults-with-a-disability/disabled-facilities-grants/apply-for-a-disabled-facilities-grant) *(found by search)*
  > Alternatively, you can call us on 01202 123 654 or send a letter to:

**What is missing:**

- not stated: None of the sources mention applying in person; they describe applying through the council online, by phone or by letter, and an occupational therapist visit as part of assessment.

**Search:** 3 queries, 2 page(s) put forward.
<details><summary>Queries and pages</summary>

- `council disabled facilities grant apply by phone or in person`
- `disabled facilities grant "call" OR "visit" customer service centre apply council`
- `gov.uk disabled-facilities-grants how-to-claim (checked, no phone/in person)`
- https://www.solihull.gov.uk/adult-social-care/disabled-facilities-grant/apply-disability-facilities-grant: Phone only: Apply for a DFG page lists 'phone: 0121 704 8007'; no in-person method stated. Single council, not national.
- https://www.bcpcouncil.gov.uk/adult-social-care-and-health/support-for-adults-with-a-disability/disabled-facilities-grants/apply-for-a-disabled-facilities-grant: Phone part: apply by contacting online, calling the Adult Social Care Hub on 01202 123 654, or by letter; no in-person method. Single council.

</details>

### Inherited State Pension (Additional or extra): `eligibility.evidenceRequired.1`

**Claim:** Marriage or civil partnership certificate

**Outcome:** partly supported

**What is missing:**

- partly supported: The text asks for the date of the most recent marriage or civil partnership when claiming, but never mentions providing a marriage or civil partnership certificate.

**Search:** 3 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `inherit additional state pension marriage certificate claim form widow gov.uk`
- `gov.uk inheriting additional state pension "marriage certificate" OR "civil partnership certificate" bereavement`
- `gov.uk/additional-state-pension/inheriting (checked, no certificate)`
- https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1132342/br1-notes.pdf: DWP BR1 State Pension claim notes (for people reaching SPA before 6 April 2016, the route for inheriting via a spouse): 'If you have told us that you are married or in a civil partnership you should send us your: marriage certificate, or civil partnership certificate.' Not specific to inheritance.

</details>

### School place application: `eligibility.evidenceRequired.0`

**Claim:** Child's birth certificate

**Outcome:** partly supported

**What is missing:**

- partly supported: Only Bromley council's admissions page requires the child's birth certificate (long form only); the GOV.UK page does not say it is needed by councils generally.

**Search:** 3 queries, 1 page(s) put forward.
<details><summary>Queries and pages</summary>

- `school admissions council proof of child's date of birth "birth certificate" primary application England`
- `Lambeth primary admission form proof of date of birth`
- `Ealing school admissions date of birth documents`
- https://bromley.gov.uk/schools-colleges/school-admissions-terms-conditions/2: Bromley council, covering Reception admissions: 'Parent(s)/carer(s) must provide a copy of the applicant child's birth certificate - long form.' Single council, England only.

</details>

### Electoral roll update: `desc`

**Claim:** Update at both old and new address. Affects jury duty and credit checks.

**Outcome:** partly supported

**Evidence** (open the link and find the quote):

- [www.gov.uk/electoral-register](https://www.gov.uk/electoral-register) *(found by search)*
  > jury summoning in England, Wales and Northern Ireland
- [www.gov.uk/electoral-register](https://www.gov.uk/electoral-register) *(found by search)*
  > checking applications for loans or credit

**What is missing:**

- partly supported: The text says you give both addresses on one register to vote form and are then removed from the old address automatically, not that you update at both addresses separately.

**Search:** 3 queries, 3 page(s) put forward.
<details><summary>Queries and pages</summary>

- `electoral register credit reference agencies jury service council register to vote moved house`
- `gov.uk register-to-vote moving-house (overseas, no credit/jury)`
- `Charnwood / Sheffield electoral register pages`
- https://www.bracknell-forest.gov.uk/elections-and-voting/electoral-register: Full register used for 'calling people for jury service' and 'checking applications for loans or credit'; on moving, give previous address and 'you will be removed from the register at your old address' (contradicts registering at both).
- https://sheffield.gov.uk/your-city-council/electoral-register: 'Jury Service: used to select jurors' and 'credit checks: used by Credit Reference Agencies to verify applications for loans or credit'; 'If you have moved house ... you can update the details online'.
- https://www.charnwood.gov.uk/pages/moved_house: 'If you have moved house, you need to register to vote again'; credit reference agencies 'use the electoral register to validate applications'. No jury or old-address mention.

</details>

### NHS Continuing Healthcare (CHC): `desc`

**Claim:** Fully-funded care package arranged and funded by the NHS for adults with a complex primary health need. Covers nursing home fees, home care, and specialist support — with no means test.

**Outcome:** partly supported

**Evidence** (open the link and find the quote):

- [www.gov.uk/government/publications/national-framework-for-nhs-continuing-healthcare-and-nhs-funded-nursing-care](https://www.gov.uk/government/publications/national-framework-for-nhs-continuing-healthcare-and-nhs-funded-nursing-care)
  > NHS continuing healthcare is an ongoing package of health and social care that is arranged and funded solely by the NHS where an individual is found to have a primary health need.
- [www.gov.uk/government/publications/national-framework-for-nhs-continuing-healthcare-and-nhs-funded-nursing-care](https://www.gov.uk/government/publications/national-framework-for-nhs-continuing-healthcare-and-nhs-funded-nursing-care)
  > Such care is provided to an individual aged 18 or over
- [www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/) *(found by search)*
  > Some people with long-term complex health needs qualify for free health and social care arranged and funded solely by the NHS.
- [www.dorsetcouncil.gov.uk/w/what-is-nhs-continuing-healthcare-](https://www.dorsetcouncil.gov.uk/w/what-is-nhs-continuing-healthcare-) *(found by search)*
  > If you live in a care home, NHS continuing healthcare can pay for your care home fees, including board and accommodation.
- [www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/) *(found by search)*
  > NHS continuing healthcare can be provided in a variety of settings outside hospital, such as in your own home or in a care home.
- [www.dorsetcouncil.gov.uk/w/what-is-nhs-continuing-healthcare-](https://www.dorsetcouncil.gov.uk/w/what-is-nhs-continuing-healthcare-) *(found by search)*
  > NHS continuing healthcare is not means tested

**What is missing:**

- not stated: The sources describe health and social care but do not mention specialist support.

**Search:** 3 queries, 2 page(s) put forward.
<details><summary>Queries and pages</summary>

- `NHS continuing healthcare not means tested complex primary health need care home fees nhs.uk`
- `nhs.uk NHS continuing healthcare page`
- `Age UK NHS continuing healthcare (404)`
- https://www.dorsetcouncil.gov.uk/w/what-is-nhs-continuing-healthcare-: 'care and support which is arranged and paid for by the NHS', for over-18s with 'a primary health need'; 'can pay for your care home fees, including board and accommodation'; 'NHS continuing healthcare is not means tested'. Does not say 'complex'.
- https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/: 'free health and social care arranged and funded solely by the NHS' for people with 'long-term complex health needs'; can be given 'in your own home or in a care home'. No means-test wording.

</details>

## Not found (4)

### Apply for a Gender Recognition Certificate: `eligibility.criteria.1`

**Claim:** Must be a UK national or permanently resident in the UK.

**Outcome:** not found

**Search:** 3 queries, nothing acceptable found.
<details><summary>Queries and pages</summary>

- `gender recognition certificate eligibility UK national resident overseas application gov.uk guidance`
- `Gender Recognition Certificate must be UK national or ordinarily resident requirement Gender Recognition Panel`
- `(reviewed nidirect gender recognition and GRA 2004 s3A results)`

</details>

### Close a limited company: `eligibility.exclusions.1`

**Claim:** Subject to legal proceedings

**Outcome:** not found

**Search:** 3 queries, nothing acceptable found.
<details><summary>Queries and pages</summary>

- `strike off company cannot apply if subject of legal proceedings Companies House guidance`
- `gov.uk get your company struck off cannot apply "legal action" or "legal proceedings" DS01 conditions`
- `direct fetch: gov.uk strike-off-your-company-from-companies-register, closing-a-limited-company/getting-your-company-struck-off, Companies House striking-off guidance`

</details>

### Cancel driving licence: `eligibility.evidenceRequired.1`

**Claim:** D27 form

**Outcome:** not found

**Search:** 3 queries, nothing acceptable found.
<details><summary>Queries and pages</summary>

- `D27 form return driving licence person who has died DVLA`
- `"D27" DVLA deceased driver licence`
- `gov.uk reapply-licence-revoked (D27 is the renewal form after disqualification)`

</details>

### Best Start Foods: `eligibility.evidenceRequired.1`

**Claim:** Proof of pregnancy or child's age

**Outcome:** not found

**Search:** 3 queries, nothing acceptable found.
<details><summary>Queries and pages</summary>

- `"Best Start Foods" evidence proof of pregnancy MAT B1 child's age Social Security Scotland`
- `mygov.scot Best Start Foods apply what you need proof pregnancy`
- `Best Start Foods "due date" OR "MATB1" OR "midwife" evidence Social Security Scotland apply`

</details>

