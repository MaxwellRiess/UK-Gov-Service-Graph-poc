# Organisation Coverage Gaps

Cross-reference of [gov.uk/government/organisations](https://www.gov.uk/government/organisations) (~489 organisations)
against the current service graph (236 nodes, March 2026).

Scope: citizen-facing organisations with services that fit the graph's life-event model.
Purely regulatory, advisory, or internal-government bodies are excluded.

---

## Currently Well-Represented

| Organisation | Graph dept key | Nodes |
|---|---|---|
| HM Revenue & Customs | `hmrc` | 35 |
| Department for Work & Pensions | `dwp` | 33 |
| Local Authorities | `la` | 29 |
| Home Office / UKVI | `ho` | 17 |
| HM Courts & Tribunals Service | `hmcts` | 15 |
| Driver and Vehicle Licensing Agency | `dvla` | 13 |
| Social Security Scotland | `sss` | 11 |
| NHS / DHSC | `nhs` | 9 |
| GRO (General Register Office) | `gro` | 6 |
| Ofsted | `other` | 4 |
| HM Land Registry | `lr` | 4 |
| HM Passport Office | `other` | 4 |
| Department for Education | `other` | 4 |
| Companies House | `ch` | 4 |
| Student Loans Company | `slc` | 3 |
| Office of the Public Guardian | `opg` | 3 |
| Insolvency Service | `other` | 3 |
| Driver and Vehicle Standards Agency | `dvsa` | 3 |
| Welsh Government | `wg` | 2 |
| Environment Agency | `ea` | 2 |
| Disclosure and Barring Service | `other` | 2 |
| Valuation Office Agency | `other` | 2 |
| The Pensions Regulator | `other` | 1 |
| Planning Inspectorate | `other` | 1 |
| Criminal Injuries Compensation Authority | `other` | 1 |
| Acas | `other` | 1 |
| UK Research and Innovation | `other` | 1 |
| Homes England | `other` | 1 |

---

## Significant Gaps

Ordered roughly by citizen-impact and fit to existing life events.

### Tier 1 — High impact, clear life-event fit

**Money and Pensions Service / MoneyHelper**
- Free impartial money and pensions guidance service (moneyhelper.org.uk)
- Covers debt advice (Breathing Space gateway), pension tracing, mid-life MOT
- Life events: *Retirement*, *Job Loss*, *Divorce*, *Disability*
- Currently Breathing Space has 1 node but no MoneyHelper signpost

**NS&I (National Savings & Investments)**
- Premium Bonds, ISAs, savings certificates, Junior ISAs, children's bonds
- nsandi.com — fully online, no intermediary
- Life events: *Having a Baby* (Junior ISA), *Retirement* (savings options), *Bereavement* (inheriting bonds / tracing unclaimed)
- 0 nodes

**Care Quality Commission (CQC)**
- Inspects and rates hospitals, GP practices, care homes, mental health services
- Citizens use it to check providers before choosing residential care
- Direct analogue to Ofsted for adult social care — find-a-rated-provider tool
- Life events: *Retirement* (choosing a care home), *Disability*, *Terminal Illness*
- 0 nodes

**Pension Protection Fund**
- Pays compensation if an employer goes insolvent and the defined-benefit pension scheme can't pay out
- Very relevant safety net — most people don't know it exists
- Life events: *Retirement*, *Job Loss* (employer insolvency scenario)
- 0 nodes

**The Pensions Ombudsman**
- Resolves complaints and disputes about workplace/personal pensions
- Free to use; independent of The Pensions Regulator
- Life events: *Retirement*
- 0 nodes (The Pensions Regulator has 1 node; the Ombudsman is a separate body)

**CAFCASS (Children and Family Court Advisory Service)**
- Advises courts on children's welfare in family proceedings
- Produces parenting plans; parents interact with it directly during divorce/separation
- Life events: *Separating or Divorcing*
- 0 nodes

**Housing Ombudsman**
- Independent complaints resolution for social housing tenants
- Landlord complaint escalation; maladministration findings
- Life events: *Moving House*, *Job Loss*
- 0 nodes

**Information Commissioner's Office (ICO)**
- Citizens exercise GDPR rights (Subject Access Requests, right to erasure) and report data breaches
- Complaint route when an organisation ignores a SAR
- Cuts across almost every life event involving a government data exchange
- 0 nodes

---

### Tier 2 — Moderate impact, would add clear value

**Intellectual Property Office (IPO)**
- Trade mark registration, patent applications, copyright guidance
- Life events: *Starting a Business*
- 0 nodes

**Leasehold Advisory Service (LEASE)**
- Free legal guidance for leaseholders and freeholders
- Covers service charges, lease extensions, enfranchisement
- Life events: *Buying a Home*
- 0 nodes

**Legal Ombudsman**
- Complaint scheme for solicitors, barristers, legal executives
- Relevant after using a solicitor for conveyancing, divorce or probate
- Life events: *Buying a Home*, *Separating or Divorcing*, *Death of Someone Close*
- 0 nodes

**Building Safety Regulator (HSE)**
- New regime under the Building Safety Act 2022
- Residents of higher-risk buildings must register; leaseholders have new rights
- Life events: *Buying a Home*, *Moving House*
- 0 nodes

**Health and Safety Executive (HSE)**
- Report a work-related injury or illness (RIDDOR)
- Relates to employer obligations and worker rights
- Life events: *Starting a New Job*, *Disability or Health Condition*
- 0 nodes

**Ofcom**
- Consumer switching rights (broadband, mobile), complaints escalation
- Alternative Dispute Resolution schemes (Ombudsman Services, CISAS)
- Life events: *Moving House* (switching providers)
- 0 nodes

**Ofgem**
- Energy market consumer rights, switching, complaint escalation (Energy Ombudsman)
- Citizens interact when switching supplier or complaining about a bill
- Life events: *Moving House*, *Job Loss* (fuel poverty), *Retirement*
- 0 nodes

**National Employment Savings Trust (NEST)**
- Default workplace pension provider for auto-enrolment
- Millions of workers are enrolled here without realising
- Life events: *Starting a New Job*, *Retirement*
- 0 nodes

**Charity Commission**
- Register a charity, CIO (Charitable Incorporated Organisation) — analogous to Companies House
- Life events: *Starting a Business* (for those setting up a charity or CIC)
- 0 nodes

**Fair Work Agency**
- New enforcement body (2024) for employment rights — national minimum wage, holiday pay
- Complaint route for workers whose rights have been breached
- Life events: *Starting a New Job*, *Job Loss*
- 0 nodes

**Office for Students**
- Complaints about higher education providers (via OIA/OfS route)
- Student consumer rights — fee refunds, course changes
- Life events: *Going to University*
- 0 nodes

---

### Tier 3 — Niche but worth noting

**Animal and Plant Health Agency (APHA)**
- Pet travel documents (AHC — Animal Health Certificate replacing EU Pet Passport)
- Relevant to *Moving House* (internationally) or *Arriving in the UK* with a pet
- 0 nodes

**Equality and Human Rights Commission (EHRC)**
- Enforcement of equality legislation; guidance for individuals on discrimination claims
- Life events: *Disability or Health Condition*, *Starting a New Job*
- 0 nodes

**Independent Office for Police Conduct (IOPC)**
- Complaints about police conduct — escalation route after local force process
- 0 nodes

**Security Industry Authority (SIA)**
- Licence required for security industry work (door supervisors, CCTV operators)
- Life events: *Starting a New Job* (if in security sector)
- 0 nodes

**Gangmasters and Labour Abuse Authority (GLAA)**
- Licensing for labour providers in agriculture, food processing, shellfish gathering
- Relevant to vulnerable workers, exploitation reporting
- Life events: *Starting a New Job* (seasonal/agency workers)
- 0 nodes

**Post Office**
- Delivery channel for passport applications (Check & Send), vehicle tax, travel money
- Not a standalone service provider but a key access point
- Already implicit in several nodes but not modelled explicitly
- 0 nodes

**Medicines and Healthcare products Regulatory Agency (MHRA)**
- Yellow Card scheme — reporting adverse reactions to medicines and medical devices
- Life events: *Disability or Health Condition*, *Terminal Illness*
- 0 nodes

**Historic England**
- Listed building consent, historic environment advice for property owners
- Life events: *Buying a Home* (if listed property)
- 0 nodes

**The Parliamentary and Health Service Ombudsman (PHSO)**
- Complaints about NHS services or government departments that haven't been resolved
- Relevant as an escalation route across many NHS-adjacent nodes
- 0 nodes

---

## Organisations Assessed as Out of Scope

The following appear in the register but are not suitable as service graph nodes:
advisory committees, research councils, parliamentary bodies, military/intelligence agencies,
cultural institutions (museums, galleries), national parks, export/trade bodies with no direct
citizen interaction, and purely internal government functions.

---

## Suggested Priority Order for New Nodes

1. Money and Pensions Service (MoneyHelper) — debt, pensions guidance
2. NS&I — savings accounts, Premium Bonds, Junior ISA
3. Care Quality Commission — care home/GP quality search
4. Pension Protection Fund — insolvency pension safety net
5. Pensions Ombudsman — workplace pension disputes
6. CAFCASS — children in divorce proceedings
7. Housing Ombudsman — social housing complaints
8. ICO — data rights and SAR complaints
9. IPO — trade mark and patent registration
10. LEASE — leasehold legal guidance
