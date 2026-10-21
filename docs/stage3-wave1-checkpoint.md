# Stage 3, first full-run wave

The first wave searched for sources beyond each service's cited pages and judged 84 fields. The source search, fetched text, exact judge prompts, responses, and agent instructions are preserved in [the stage 3 audit](../data/stage3-audit/README.md).

The imported verdicts were 21 confirmed, 36 partly supported, 3 contradicted, and 24 not stated. No quote failed the importer's literal text check. The 21 confirmations increased the confirmed count from 1,766 to 1,787. The partly supported and not-stated fields remain for stages 4 and 5 of the [verification procedure](verification-procedure.md).

## Corrections made after the import

| Field | Change | Source |
|---|---|---|
| `ch-confirmation-statement#eligibility.summary` | Replaced the £34 fee and unsupported dormant-company waiver with £50 online and £110 by post. Kept LLPs, which have their own confirmation statement duty, and removed the unsupported reference to other eligible partnerships. Updated the related criterion and agent step. | [Companies House filing guidance](https://www.gov.uk/guidance/filing-your-companys-confirmation-statement), [LLP confirmation statement](https://www.gov.uk/government/publications/confirmation-statement-for-a-limited-liability-partnership-form-ll-cs01-new-version), [LLP filing duty](https://www.legislation.gov.uk/uksi/2009/1804/regulation/30) |
| `dwp-uc-health#eligibility.evidenceRequired.1` | Replaced the old UC50 name with WCA50 and said to complete it only when asked. Updated the related agent step. | [DWP WCA50 guidance](https://www.gov.uk/government/publications/wca50-form-capability-for-work-questionnaire) |
| `dwp-smi#eligibility.exclusions.1` | Removed the Universal Credit earnings exclusion from `exclusions` and `ruleOut`. Shifted the following exclusion's provenance record to its new index. | [DWP SMI lender handbook](https://www.gov.uk/government/publications/managed-payments-to-mortgage-lenders-information-for-lenders/managed-payments-to-mortgage-lenders-information-for-lenders) |

The removed claims are in `data/removed-claims.json`. The changed fields have value-bound provenance records marked `unverified` until a separate judge checks the new wording. The old review-queue entries were removed because they described values that no longer exist. The audit snapshot keeps their original verdicts.

After these changes, `report-coverage.ts` shows 1,787 confirmed of 3,019 checkable fields, or 59.2%. The count stayed the same; removing the SMI exclusion reduced the denominator by one. The audit record and this checkpoint do not claim that the remaining fields have been resolved.
