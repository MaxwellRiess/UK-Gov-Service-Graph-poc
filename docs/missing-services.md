# Missing Services from GOV.UK Services List

Source: [x-govuk/govuk-services-list](https://github.com/x-govuk/govuk-services-list/tree/main/data/services)

Compiled: 2026-03-17

Services in the above repo that are **not currently in the graph** and are live or in Beta (operationally running). Excludes: retired/closed schemes, Alpha-only services, COVID-specific services, developer/internal tools, and data portals.

---

## Passports & Travel Documents

| Repo file | Service name | Notes |
|---|---|---|
| `passport` | Apply for a passport | We only have `other-passport-name` (name change). Main application/renewal is missing. |
| `passport-urgent` | Urgent passport | For emergency travel needs |
| `lost-stolen-passport` | Report lost or stolen passport | Triggers a reapplication |
| `emergency-travel-document` | Emergency travel document | For British nationals stranded abroad |
| `document-legalisation` | Legalise a document (apostille) | Needed for use of UK docs abroad |
| `consular-appointments` | Book a consular appointment | Needed for overseas passport/document work |

---

## Benefits & Financial Entitlements

| Repo file | Service name | Notes |
|---|---|---|
| `help-to-save` | Help to Save | Savings account with 50% bonus for UC/WTC claimants. Phase: **Live** |
| `budgeting-loans` | Budgeting Loan | Interest-free DWP loan for essential items (for UC/legacy benefit claimants) |
| `tax-credits` | Manage your tax credits | Legacy benefit (Working/Child Tax Credit) — millions still claiming, being migrated to UC |
| `claim-criminal-injuries-compensation` | Criminal Injuries Compensation | CICA scheme for victims of violent crime |
| `find-lost-pension` | Find pension contact details | Pension Tracing Service. Phase: **Live** |
| `repay-manage-benefit-owed` | Repay or manage a benefit debt | Repaying overpayments to DWP |

---

## Healthcare

| Repo file | Service name | Notes |
|---|---|---|
| `fit-notes` | Send a fit note for ESA | Submit sick note digitally as part of ESA claim |
| `buy-prescription-prepayment-certificate` | Prescription prepayment certificate (PPC) | Saves money on regular NHS prescriptions |
| `nhs-111` | NHS 111 | Primary triage/urgent care service — high citizen relevance |

---

## Employment & Tribunals

| Repo file | Service name | Notes |
|---|---|---|
| `employment-tribunal` | Employment Tribunals | Make a claim for unfair dismissal, discrimination etc. Phase: **Live** |
| `find-a-solution-for-your-employment-dispute` | ACAS early conciliation | Pre-tribunal dispute resolution — must attempt before tribunal |
| `findajob` | Find a Job | DWP-run job search service (especially relevant to job-loss life event) |

---

## Legal, Courts & Debt

| Repo file | Service name | Notes |
|---|---|---|
| `apply-for-bankruptcy` | Apply for bankruptcy | Self-petition bankruptcy in England & Wales |
| `debt-respite-breathing-space` | Breathing Space (debt respite) | 60-day protection from creditor enforcement while getting debt advice |
| `online-debt-solutions` | Debt Relief Order | For people with low income, low assets, and under £30k debt |
| `money-claims` | Money Claims Online | Small claims court — recover money owed |
| `court-fines` | Pay a court fine | Pay magistrates court fines online |
| `appeal-tax-tribunal` | Appeal to Tax Tribunal | First-tier Tribunal (Tax) — appeals against HMRC decisions |
| `appeal-planning-decision` | Appeal a planning decision | Planning Inspectorate appeal |
| `find-unclaimed-court-money` | Find unclaimed court money | Check if you're owed money held by HMCTS |
| `reply-to-a-jury-summons` | Reply to a jury summons | Respond to jury duty |
| `prison-visits` | Visit someone in prison | Book a prison visit |
| `claim-power-of-attorney-refund` | Claim Power of Attorney refund | Refund for those overcharged for LPA registration (2013–2017) |

---

## Property & Housing

| Repo file | Service name | Notes |
|---|---|---|
| `find-property-information` | Find property information | Land Registry title register and plan |
| `find-energy-certificate` | Find an energy certificate (EPC) | Needed when buying/renting — links naturally to buying-home life event |
| `local-land-charges` | Local land charges search | Required as part of property conveyancing |
| `sign-mortgage-deed` | Sign your mortgage deed | Digital mortgage deed signing with Land Registry |
| `check-long-term-flood-risk` | Check long-term flood risk | Due diligence before buying a property |
| `check-council-tax-band` | Check or challenge your council tax band | VOA challenge process |
| `correct-business-rates` | Check and challenge your business rates | VOA rating list challenge |

---

## Immigration (additional routes)

| Repo file | Service name | Notes |
|---|---|---|
| `evisa` | Get access to your eVisa | Digital immigration status, replacing physical BRP. Currently in Beta |
| `view-prove-immigration-status` | View or prove your immigration status | Share code for employers/landlords — pairs with `evisa` |
| `skilled-worker-visa` | Skilled Worker visa | Main work visa route — not in graph despite immigration life event |
| `student-visa` | Student visa | Main student visa — not in graph despite university life event |
| `appeal-visa-immigration-decision` | Appeal a visa or immigration decision | First-tier Tribunal (Immigration) |
| `immigration-fee-waiver` | Apply for an immigration fee waiver | Waiver for those who cannot pay visa fees |
| `eu-settled-status-enquiries` | EUSS enquiries | For those with problems with their EUSS application |

---

## Vehicles & Driving

| Repo file | Service name | Notes |
|---|---|---|
| `vehicle-enquiry` | Vehicle Enquiry Service | Check MOT, tax, insurance status of any vehicle |
| `check-mot-history` | Check MOT history | Full MOT history for any vehicle |
| `change-address-v5c` | Change address on V5C logbook | Update vehicle registration document — natural follow-on to moving-house life event |
| `drive-clean-air-zone` | Check and pay Clean Air Zone charge | Increasingly relevant as zones expand |
| `check-driving-licence` | Check a driving licence | Share driving record (e.g. for hire car or employer) |

---

## Business (additional)

| Repo file | Service name | Notes |
|---|---|---|
| `file-company-accounts` | File company accounts | Annual accounts at Companies House — natural follow-on to `ch-register-ltd` |
| `file-confirmation-statement` | File a confirmation statement | Annual confirmation statement (replaced annual return) |
| `close-a-company` | Close a company (DS01) | Voluntary strike-off |
| `get-eori-number` | Get an EORI number | Required for UK import/export |
| `find-government-grants` | Find a grant | Searchable grants database — useful for business life event |
| `contracts-finder` | Contracts Finder | Find government contract opportunities |
| `money-laundering-supervision` | Money laundering supervision registration | Required for certain business types — we have AML registration but this is the HMRC-run supervision register |

---

## Voting

| Repo file | Service name | Notes |
|---|---|---|
| `postal-vote` | Apply for a postal vote | We have electoral roll registration but not the postal vote option |
| `proxy-vote` | Apply for a proxy vote | — |

---

## Documents & Identity

| Repo file | Service name | Notes |
|---|---|---|
| `apply-gender-recognition-certificate` | Apply for a Gender Recognition Certificate | Legal gender recognition |
| `request-a-baby-loss-certificate` | Request a baby loss certificate | In memory of a pregnancy lost before 24 weeks — new service (2024) |
| `basic-criminal-record-check` | Basic criminal record check | We have enhanced DBS; basic DBS is a separate, self-applied check |
| `nominate-uk-honour` | Nominate someone for a King's Honour | Civic service |
| `general-registrars-office` | GRO — certificates and records | General access to GRO records (birth, death, marriage certificates) |

---

## Education & Childcare

| Repo file | Service name | Notes |
|---|---|---|
| `care-to-learn` | Care to Learn | Childcare funding for young student parents — relevant to university life event |
| `find-apprenticeship` | Find an apprenticeship | DfE service — relevant to job/university life events |
| `apply-for-teacher-training` | Apply for teacher training | Relevant to new-job/university life events |
| `nationalcareers` | National Careers Service | Careers advice and skills assessments |
| `school-experience` | School experience | For prospective teachers |

---

## Excluded Services (and Why)

| Service | Reason excluded |
|---|---|
| All `coronavirus-*` services | COVID programmes have ended |
| `green-homes-grant` | **Retired** (closed 2021) |
| `statutory-debt-repayment-plan` | **Alpha only** — not yet live |
| `apply-for-energy-bill-alternative-funds` | COVID energy relief, ended |
| `apply-kickstart-grant-employer` | Kickstart scheme ended |
| `get-help-to-retrain` | Scheme ended |
| `help-refugees` / `homes-for-ukraine` | Niche/winding down |
| `design-system`, `prototype-kit`, `hmrc-developer-hub` etc. | Developer/internal tools |
| `people-finder`, `pq-tracker`, `campaigns-platform` etc. | Internal government tools |
| `explore-education-statistics`, `road-traffic-statistics` etc. | Data portals, not transactional |
| `civil-service-jobs` | Job board portal, not a specific citizen service |

---

## Priority Order for Adding

Highest-impact additions relative to existing life events:

1. **`passport`** — used by nearly everyone, missing entirely (we only model name-change)
2. **`evisa` + `view-prove-immigration-status`** — BRP is being replaced by eVisa; immigration life event is incomplete without these
3. **`skilled-worker-visa` + `student-visa`** — major visa routes absent from immigration/university life events
4. **`employment-tribunal` + `find-a-solution-for-your-employment-dispute`** — job-loss life event lacks the legal recourse pathway
5. **`help-to-save`** — proactive financial resilience benefit relevant to job-loss, disability, low-income scenarios
6. **`find-energy-certificate` + `find-property-information`** — buying-home life event is missing these due-diligence steps
7. **`apply-for-bankruptcy` + `debt-respite-breathing-space`** — financial distress pathway currently absent
8. **`change-address-v5c`** — obvious gap in moving-house life event (we update licence address but not the V5C)
9. **`file-company-accounts` + `file-confirmation-statement`** — business life event ends at registration; ongoing obligations are missing
10. **`find-lost-pension`** — retirement life event should surface this
