# Isolated Node Edge Suggestions

This document analyses the 41 service nodes that currently have no edges (neither REQUIRES nor ENABLES) in the graph. For each node, suggested edges are proposed to integrate it into the service journey graph.

**Methodology:** Suggested edges are based on real UK government service journeys — what logically must happen before a service can be used (REQUIRES), and what a service naturally leads to or makes relevant (ENABLES).

**Note:** All node IDs have been verified against `src/graph-data.ts`. Review suggested edges before implementing to confirm they reflect actual policy/procedural requirements.

---

## Summary by Category

| Category | Count | Isolated nodes |
|---|---|---|
| Local Authority services | 12 | la-* |
| HMCTS / legal | 4 | hmcts-* |
| DVLA / DVSA | 4 | dvla-*, dvsa-* |
| DWP / HMRC benefits | 3 | dwp-benefit-debt-repayment, hmrc-spp, hmrc-ssp |
| FCDO travel | 2 | fco-* |
| NHS | 2 | nhs-* |
| Home Office | 2 | ho-drug-precursor-licence, ho-euss-enquiry |
| Other | 12 | mixed |

---

## Nodes with Strong Edge Suggestions

### `la-business-rates` — Business rates registration (Local Authority · obligation)
Registration required when occupying commercial premises.

| From | To | Type | Rationale |
|---|---|---|---|
| `ch-register-ltd` | `la-business-rates` | REQUIRES | Ltd companies occupying premises must register for business rates |
| `hmrc-register-sole-trader` | `la-business-rates` | REQUIRES | Sole traders with premises need business rates registration |
| `la-business-rates` | `voa-business-rates` | ENABLES | After registration, businesses can check/challenge their rateable value |

---

### `voa-business-rates` — Check and challenge business rates (VOA · application)
Challenge the rateable value assigned to commercial premises.

| From | To | Type | Rationale |
|---|---|---|---|
| `la-business-rates` | `voa-business-rates` | ENABLES | Registration precedes any challenge to the valuation |

---

### `la-disabled-facilities-grant` — Disabled Facilities Grant (Local Authority · grant)
Grant for home adaptations to support disabled people.

| From | To | Type | Rationale |
|---|---|---|---|
| `nhs-care-assessment` | `la-disabled-facilities-grant` | REQUIRES | Formal care needs assessment typically required before DFG application |
| `dwp-pip` | `la-disabled-facilities-grant` | ENABLES | PIP receipt indicates disability likely needing home adaptations |
| `dwp-attendance-allowance` | `la-disabled-facilities-grant` | ENABLES | Attendance Allowance eligibility correlates with adaptation needs |

---

### `nhs-care-assessment` — Care needs assessment (NHS · application)
Assessment of an individual's care needs by social services.

| From | To | Type | Rationale |
|---|---|---|---|
| `dwp-pip` | `nhs-care-assessment` | ENABLES | PIP recipients with ongoing care needs should request a formal assessment |
| `dwp-attendance-allowance` | `nhs-care-assessment` | ENABLES | Attendance Allowance holders may need care assessment to arrange support |
| `nhs-care-assessment` | `la-disabled-facilities-grant` | REQUIRES | Care assessment must precede DFG application |
| `nhs-care-assessment` | `other-carers-leave` | ENABLES | Identifying care needs can trigger the carer's need for leave entitlement |

---

### `la-carers-assessment` — Carer's Assessment (Local Authority · application)
Assessment of the needs of an unpaid carer.

| From | To | Type | Rationale |
|---|---|---|---|
| `dwp-carers-allowance` | `la-carers-assessment` | ENABLES | Carer's Allowance recipients should request their own assessment |
| `dwp-pip` | `la-carers-assessment` | ENABLES | PIP recipient's carer is entitled to a Carer's Assessment |
| `la-carers-assessment` | `la-disabled-facilities-grant` | ENABLES | Assessment may identify need for home adaptations |
| `la-carers-assessment` | `other-carers-leave` | ENABLES | Formal assessment may inform employer-level carer's leave decisions |

---

### `other-carers-leave` — Carer's leave from employer (Employer · entitlement)
Statutory entitlement to unpaid leave to provide or arrange care.

| From | To | Type | Rationale |
|---|---|---|---|
| `dwp-carers-allowance` | `other-carers-leave` | ENABLES | Receiving Carer's Allowance confirms carer role; leave complements it |
| `la-carers-assessment` | `other-carers-leave` | ENABLES | Assessment outcome often triggers need for leave |

---

### `hmrc-ssp` — Statutory Sick Pay (HMRC · entitlement)
Sick pay paid by the employer when an employee cannot work.

| From | To | Type | Rationale |
|---|---|---|---|
| `hmrc-ssp` | `dwp-universal-credit` | ENABLES | If SSP is exhausted or not paid, UC may top up income |
| `hmrc-ssp` | `dwp-new-style-esa` | ENABLES | When SSP ends and person remains unfit to work, ESA is the next step |

---

### `hmrc-spp` — Statutory Paternity Pay (HMRC · entitlement)
Statutory pay for eligible employees during paternity leave.

| From | To | Type | Rationale |
|---|---|---|---|
| `gro-register-birth` | `hmrc-spp` | ENABLES | Birth registration confirms the triggering event for SPP eligibility |
| `hmrc-spp` | `dwp-universal-credit` | ENABLES | If employer does not pay SPP or income is low, UC may supplement it |

---

### `dwp-benefit-debt-repayment` — Repay a benefit overpayment (DWP · obligation)
Repayment of benefits received in error or in excess.

| From | To | Type | Rationale |
|---|---|---|---|
| `dwp-universal-credit` | `dwp-benefit-debt-repayment` | ENABLES | UC is the most common source of overpayments when circumstances change |
| `dwp-pip` | `dwp-benefit-debt-repayment` | ENABLES | PIP overpayments occur when medical circumstances change unreported |
| `dwp-new-style-jsa` | `dwp-benefit-debt-repayment` | ENABLES | JSA overpayments arise during periods of undeclared earnings |

---

### `fco-document-legalisation` — Legalise a document (FCDO · document)
Apostille certification for use of UK documents abroad.

| From | To | Type | Rationale |
|---|---|---|---|
| `gro-register-birth` | `fco-document-legalisation` | ENABLES | Birth certificates are commonly apostilled for overseas use |
| `gro-death-certificate` | `fco-document-legalisation` | ENABLES | Death certificates need apostilles for foreign estates/probate |
| `gro-marriage-cert` | `fco-document-legalisation` | ENABLES | Marriage certificates often require apostilles for overseas recognition |
| `dbs-basic-check` | `fco-document-legalisation` | ENABLES | DBS certificates need apostilles for overseas employment |

---

### `fco-emergency-travel-doc` — Emergency travel document (FCDO · document)
Emergency passport-equivalent document for travel when abroad.

| From | To | Type | Rationale |
|---|---|---|---|
| `hmpo-lost-stolen-passport` | `fco-emergency-travel-doc` | ENABLES | Reporting a lost/stolen passport while abroad leads to emergency travel doc |

---

### `dbs-basic-check` — Basic DBS check (DBS · application)
Basic criminal record check used for employment/licensing purposes.

| From | To | Type | Rationale |
|---|---|---|---|
| `dbs-basic-check` | `la-child-performance-licence` | ENABLES | DBS check is typically required when applying for a child performance licence |
| `dbs-basic-check` | `la-hmo-licence` | ENABLES | HMO licensing authorities may require a DBS check for landlords |
| `dbs-basic-check` | `fco-document-legalisation` | ENABLES | DBS certificate may need apostille for overseas employment applications |

---

### `other-dbs` — DBS check (DBS · application)
Enhanced or standard DBS check (distinct from basic check; used for regulated activity).

| From | To | Type | Rationale |
|---|---|---|---|
| `dfe-apply-teacher-training` | `other-dbs` | REQUIRES | Teacher training applicants must complete an enhanced DBS check |
| `dfe-find-apprenticeship` | `other-dbs` | ENABLES | Some apprenticeships in regulated sectors require DBS checks |

---

### `la-hmo-licence` — HMO licence (Local Authority · registration)
Licence required to operate a house in multiple occupation with 5+ tenants.

| From | To | Type | Rationale |
|---|---|---|---|
| `ch-register-ltd` | `la-hmo-licence` | ENABLES | Property companies managing HMOs will need this licence |
| `dbs-basic-check` | `la-hmo-licence` | ENABLES | Landlord/manager DBS check may be required by the licensing authority |

---

### `la-child-performance-licence` — Child performance licence (Local Authority · application)
Licence required for children to perform publicly (TV, stage, film).

| From | To | Type | Rationale |
|---|---|---|---|
| `dbs-basic-check` | `la-child-performance-licence` | ENABLES | DBS check on supervising adults required as part of licensing |

---

### `dvla-notify-condition` — Notify DVLA of medical condition (DVLA · obligation)
Legal obligation to report medical conditions affecting ability to drive.

| From | To | Type | Rationale |
|---|---|---|---|
| `dvla-notify-condition` | `dwp-pip` | ENABLES | Medical conditions serious enough to affect driving often qualify for PIP |
| `dvla-notify-condition` | `dwp-attendance-allowance` | ENABLES | Conditions reported to DVLA may indicate eligibility for Attendance Allowance |

---

### `ho-euss-enquiry` — EU Settlement Scheme status enquiry (Home Office · application)
Check or query EUSS application status.

| From | To | Type | Rationale |
|---|---|---|---|
| `ho-eu-settled-status` | `ho-euss-enquiry` | ENABLES | After applying for EU Settled Status, citizens may need to enquire about their status |

---

### `other-help-to-buy` — First Homes / Help to Buy (Homes England · grant)
Government scheme to help first-time buyers purchase a home.

| From | To | Type | Rationale |
|---|---|---|---|
| `other-help-to-buy` | `hmrc-sdlt` | REQUIRES | Property purchase via Help to Buy still requires SDLT return (even if zero-rated) |
| `other-help-to-buy` | `hmrc-lisa` | ENABLES | Buyers eligible for Help to Buy may also benefit from a Lifetime ISA bonus |

---

### `dfe-national-careers` — National Careers Service (DfE · entitlement)
Free advice and guidance on skills, education, and careers.

| From | To | Type | Rationale |
|---|---|---|---|
| `dfe-national-careers` | `dfe-find-apprenticeship` | ENABLES | Careers service regularly directs people to apprenticeship opportunities |
| `dfe-national-careers` | `slc-student-finance` | ENABLES | Careers advisors direct people to higher education and funding options |

---

### `nhs-healthy-start` — Healthy Start vouchers (NHS · benefit)
Vouchers for pregnant women and young children on low incomes.

| From | To | Type | Rationale |
|---|---|---|---|
| `gro-register-birth` | `nhs-healthy-start` | ENABLES | Birth registration confirms the child triggering continued voucher eligibility |
| `dwp-universal-credit` | `nhs-healthy-start` | ENABLES | UC receipt is a qualifying condition for Healthy Start vouchers |

---

### `jaqu-clean-air-zone` — Clean Air Zone charges (JAQU · obligation)
Check eligibility and pay daily charges in a Clean Air Zone.

| From | To | Type | Rationale |
|---|---|---|---|
| `dvla-vehicle-tax` | `jaqu-clean-air-zone` | ENABLES | Vehicle owners paying VED need to check CAZ applicability |
| `dvla-sorn` | `jaqu-clean-air-zone` | ENABLES | Registering SORN may affect CAZ charge liability |

---

### `la-road-occupation-licence` — Road occupation licence (Local Authority · application)
Licence to occupy the public highway during construction work.

| From | To | Type | Rationale |
|---|---|---|---|
| `ch-register-ltd` | `la-road-occupation-licence` | ENABLES | Construction companies registered as Ltd need this for public road works |
| `hmrc-register-sole-trader` | `la-road-occupation-licence` | ENABLES | Self-employed tradespeople need this licence when occupying the road |

---

### `la-skip-permit` — Skip permit (Local Authority · application)
Permit to place a skip on a public road.

| From | To | Type | Rationale |
|---|---|---|---|
| `ch-register-ltd` | `la-skip-permit` | ENABLES | Builders/waste companies using skips on public roads need permits |
| `hmrc-register-sole-trader` | `la-skip-permit` | ENABLES | Self-employed tradespeople placing skips need permits |

---

### `la-scrap-metal-dealer-licence` — Scrap metal dealer licence (Local Authority · registration)
Licence required to operate as a scrap metal dealer.

| From | To | Type | Rationale |
|---|---|---|---|
| `ch-register-ltd` | `la-scrap-metal-dealer-licence` | ENABLES | Scrap metal companies need local authority licensing |
| `hmrc-register-sole-trader` | `la-scrap-metal-dealer-licence` | ENABLES | Self-employed scrap dealers need licensing |

---

### `ho-drug-precursor-licence` — Drug precursor chemicals licence (Home Office · application)
Licence to possess, supply, or use controlled drug precursor chemicals.

| From | To | Type | Rationale |
|---|---|---|---|
| `ch-register-ltd` | `ho-drug-precursor-licence` | ENABLES | Pharmaceutical/chemical companies need this licence to operate legally |
| `hmrc-register-sole-trader` | `ho-drug-precursor-licence` | ENABLES | Self-employed chemical suppliers may require this licence |

---

### `ukri-find-grants` — Find government grants for business (BEIS/UKRI · application)
Grant discovery platform for businesses seeking R&D or growth funding.

| From | To | Type | Rationale |
|---|---|---|---|
| `ch-register-ltd` | `ukri-find-grants` | ENABLES | New Ltd companies seeking startup/R&D grants |
| `hmrc-register-sole-trader` | `ukri-find-grants` | ENABLES | New sole traders seeking business growth or innovation grants |

---

## Nodes with No Suggested Edges

These nodes are standalone services that do not logically prerequisite or enable other nodes in the current life event journey model. They may be worth reviewing for removal or scoping to a future life event.

| Node ID | Name | Reason |
|---|---|---|
| `cabinetoffice-uk-honours` | Nominate for a King's Honour | Ceremonial; no dependency on or from other services |
| `co-contracts-finder` | Contracts Finder | Discovery platform; not part of life event journeys |
| `dvla-check-driving-licence` | View driving licence | Utility lookup; no downstream service triggers |
| `dvla-vehicle-enquiry` | Vehicle Enquiry Service | Information lookup; no journey dependency |
| `dvsa-mot-history` | Check MOT history | Inspection history lookup; no journey dependency |
| `hmcts-court-fines` | Pay a court fine | Standalone obligation; no standard prerequisite |
| `hmcts-jury-summons` | Respond to jury summons | Civic obligation; no enabling relationship |
| `hmcts-money-claims` | Money Claims Online | Civil dispute service; no standard journey connection |
| `hmcts-unclaimed-court-money` | Find unclaimed court money | Lookup service; no journey connection |
| `hmpps-prison-visits` | Visit someone in prison | Visitor service; no enabling relationships |
| `la-house-to-house-collection-licence` | House-to-house collection licence | Charity fundraising; not in standard journeys |
| `la-public-film-screening` | Public film screening permissions | Event-specific; not in standard journeys |
| `la-street-collection-licence` | Street collection licence | Charity fundraising; not in standard journeys |
| `la-temporary-events-notice` | Temporary Events Notice | Event licensing; not in standard journeys |
| `pins-planning-appeal` | Appeal a planning decision | Specialist appeal; no direct journey prerequisite defined |

---

## Implementation Notes

1. **Confirm edge directions carefully.** REQUIRES edges are strong ordering constraints and should only be used when the source service must genuinely be completed first.
2. **Some Local Authority services** (la-road-occupation-licence, la-skip-permit, etc.) cluster around a "starting a business" journey that may not yet be a defined life event. Consider adding a `business-start` life event with these as reachable nodes.
3. **`nhs-care-assessment` ↔ `la-disabled-facilities-grant`** is a key pairing — both are currently isolated and should be wired together to form a coherent disability/care journey segment.
4. **The `other-dbs` / `dbs-basic-check` duplication** should be reviewed. The graph currently has both; clarifying which one applies to which journeys would help before adding edges.
