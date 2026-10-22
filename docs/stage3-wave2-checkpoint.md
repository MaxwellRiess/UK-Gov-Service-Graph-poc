# Stage 3, second full-run wave

The second wave has 41 service prompts covering 85 fields. When Claude stopped, 27 services had complete response files. The remaining 14 had prompts but no responses. The saved handoff inputs and responses are in [the stage 3 audit](../data/stage3-audit/README.md).

Importing the 27 complete responses judged 54 fields: 13 confirmed, 26 partly supported, 2 contradicted, and 13 not stated. No quote failed the importer's text match. The remaining 31 fields had not been imported at the handoff checkpoint.

Both contradictions concerned `hmrc-tax-credits`. The graph already said tax credits ended on 5 April 2025, but its eligibility criteria, qualifier, and online method still described an active benefit. [HMRC says](https://www.gov.uk/tax-credits-have-ended) no new claims are possible and former claimants must check their final Annual Review letter. The node now describes that check. [HMRC's contact page](https://www.gov.uk/find-hmrc-contacts/tax-credits-general-enquiries) gives phone and postal routes to report a mistake. The former application fields and their provenance records were removed, and the removed claims were logged in `data/removed-claims.json`.

The corrected summary and criterion were independently confirmed. The phone and post methods remain partly supported by the fetched HTML pages. The official [April 2025 finalisation notes](https://assets.publishing.service.gov.uk/media/67cabb0e8c1076c796a45bea/TC603RD_Notes.pdf) name both routes, but the prompt builder does not read PDFs. The old review-queue entries were removed because they refer to values that no longer exist. The audit keeps the original verdicts.

Ten source documents in the saved judge prompts were PDFs or a Word file that the old fetcher passed through as bytes: eight in wave 1 and two in wave 2. The importer accepted no quote from those bytes. A `not stated` or `partly supported` verdict for a field that depended on one of those documents needs another check. `scripts/lib/page-text.ts` now treats these formats as unreadable when preparing new prompts.

After the import and correction, coverage is 1,796 confirmed of 3,014 checkable fields, or 59.6%. This is nine more confirmed fields than the first-wave checkpoint. The graph has five fewer checkable fields, mainly because the obsolete tax credits application fields were removed.

## Completion after the handoff

Codex judges completed the missing 14 prompts from the saved source text. Their 31 fields yielded 9 confirmed, 15 partly supported, 1 contradicted and 6 not stated. The contradiction was the Debt Relief Order method: an applicant contacts an approved adviser, who submits the application. The graph was corrected, and a fresh independent check confirmed the revised method. The exact prompts, responses and later rechecks are in [the continuation record](../data/stage3-progress/README.md). The old tax credits prompt was excluded from the import because its graph fields had changed.
