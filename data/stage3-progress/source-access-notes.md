# Source access notes

Checked 21 October 2026. "Opened" means the page body, not just a search result, was retrieved. These are candidates for another source review, not new field judgments.

## Final tax credits Annual Review

- [Tax credits ended on 5 April 2025](https://www.gov.uk/tax-credits-have-ended) — HTML, opened: **yes**. "If you think there’s a mistake or your personal details are wrong, contact HM Revenue and Customs". This establishes the correction step after closure, but gives no channel.
- [Tax credits: general enquiries](https://www.gov.uk/find-hmrc-contacts/tax-credits-general-enquiries) — HTML, opened: **yes**. "Call HMRC" for a general tax credits enquiry; "Send complaints or changes in your circumstances to this address." This gives phone and postal contact routes, but does not expressly say either completes the final Annual Review.
- [Tax credits: finalisation pack notes](https://www.gov.uk/government/publications/tax-credits-renewal-pack-notes) — HTML, opened: **yes**. "Use the TC603RD Notes or TC603R Notes to help you finalise your tax credits." The page links to the instructions as PDFs rather than putting their phone and post directions in HTML.
- [TC603RD Notes, April 2025](https://assets.publishing.service.gov.uk/media/67cabb0e8c1076c796a45bea/TC603RD_Notes.pdf) — PDF, opened: **yes**. "You can now finalise your tax credits" followed by "By phone" and "By post". Direct evidence, but it is not an HTML source. The phone number in this 2025 document differs from the current contact page, so cite the route rather than copying the historical number.

**Gap:** No current HMRC HTML page found that explicitly says the final Annual Review itself can be completed by phone and post. The first two HTML pages together imply those routes for corrections, while the 2025 PDF states them directly.

## Debt Relief Order intermediary

- [How to get a Debt Relief Order](https://www.gov.uk/guidance/how-to-get-a-debt-relief-order-dro) — HTML, opened: **yes**. "the debt adviser will complete an online application for you and submit it to the Insolvency Service." This is the clearest applicant-facing source.
- [How to complete and submit a DRO application](https://www.gov.uk/guidance/how-to-complete-and-submit-the-debt-relief-order-dro-application-form) — HTML, opened: **yes**. "You must be an approved intermediary to create, complete and submit a DRO application." It also says members of the public cannot use the DRO website to make their own applications.

**Gap:** None for the intermediary-submission claim. The first page says "approved debt adviser"; the second identifies the required role as "approved intermediary".

## HC11 evidence guidance in HTML

- [When you need to pay towards NHS care](https://www.nhs.uk/nhs-services/help-with-health-costs/when-you-need-to-pay-towards-nhs-care/) — HTML, opened: **yes**. "This could be a prescription prepayment certificate (PPC), benefit award notice, or an exemption certificate." The page covers proof across NHS charges, including dental care and prescriptions, but does not reproduce HC11's full evidence tables.
- [Who can get free NHS dental treatment](https://www.nhs.uk/nhs-services/dentists/who-can-get-free-nhs-dental-treatment/) — HTML, opened: **yes**. "Depending on the reason, you'll need to give your dentist proof"; its examples include "a valid HC2 certificate". It does not name a benefit award notice among those examples.
- [NHSBSA free NHS dental treatment](https://www.nhsbsa.nhs.uk/help-nhs-dental-costs/free-nhs-dental-treatment) — HTML candidate, opened: **no**. The search index says "Use your award notice as proof that you’re entitled" under Pension Credit, but direct opening returned HTTP 503. Do not treat the indexed excerpt as fetched page text.
- [Common questions about rapid-acting insulin](https://www.nhs.uk/medicines/insulin/rapid-acting-insulin/common-questions-about-rapid-acting-insulin/) — HTML, opened: **yes**. "The application form for the medical exemption certificate is called FP92A." It also says the doctor signs it. This is specific to diabetes; it does not stand in for HC11's complete list of qualifying conditions.

**Gap:** No opened HTML page reproduces all of HC11's evidence guidance. The opened NHS pages cover benefit notices, HC2 certificates and FP92A separately.

## Healthy Start application routes

- [Healthy Start: how to apply](https://www.healthystart.nhs.uk/how-to-apply/) — official HTML candidate, opened: **no**. Direct opening returned HTTP 403. The search index describes online applications for eligible Universal Credit recipients, plus email or phone for some other groups; verify the page body before using it as fetched evidence.
- [Cornwall Council: Healthy Start](https://www.cornwall.gov.uk/health-and-social-care/public-health/healthy-start/) — HTML, opened: **yes**. "Some people can apply online and some will need to apply by email or phone." The council's June 2026 page describes national NHSBSA routes and points to the official application page.
- [GOV.UK Find a grant: Healthy Start](https://www.find-government-grants.service.gov.uk/grants/healthy-start) — HTML, opened: **yes**. "You can apply by email or phone" and "If you get Universal credit, you can apply online". **Do not use as current eligibility evidence:** this listing says it closed in March 2025 and still names Child Tax Credit.

**Gap:** The official Healthy Start how-to page could not be opened by the web fetcher. Cornwall Council supplies an accessible current HTML description of the application routes, but the owning NHS page remains unverified by direct retrieval.
