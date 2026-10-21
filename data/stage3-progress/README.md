# Stage 3 continuation record

This directory records the work after the [Claude handoff snapshot](../stage3-audit/README.md). The snapshot remains unchanged. Together, the two directories preserve the selected claims, finder queries and nominated URLs, fetched source text, exact judge prompts and responses, and the later correction checks. `sha256sums.txt` protects the files in this continuation record.

## Method

The finder nominated up to three pages per claim and recorded its searches, including unsuccessful searches. It did not decide provenance. A separate judge received a prepared prompt containing the graph wording and fetched page text, then returned a verdict and a quote for every claim. `scripts/widen-sources.ts --import` checked that each quote occurs in the supplied source text before updating `data/provenance.json` and the review queues. The model that proposed or made a correction did not judge that correction.

The import now also compares every saved prompt field with the current graph value. A response to an old version of a claim is refused. This matters for the tax credits, school age and other claims corrected during the run. A matching quote establishes that the words appeared in the captured page text; a reader still needs to decide whether they actually support the claim and apply to the right service and nation.

## Files

| Path | Record |
|---|---|
| `finder/` | Finder notes and candidate URLs for batches 08, 10, 12, 13 and 14, which were unfinished at handoff. |
| `wave2-completion/` | The 14 missing second-wave judge prompts and Codex responses. |
| `judge-w3/`, `judge-w4/`, `judge-w5/` | Prepared source text, exact prompts and Codex responses for the later waves. |
| `wave*-keys.json`, `wave*-candidates.json` | Field selections and nominated URLs used to prepare waves 3–5. |
| `corrections-judge*/`, `school-age-recheck/` | Independent checks of corrected graph wording. The school-age response in `corrections-judge-3/` was superseded by the revised wording in `school-age-recheck/` and was not imported. |
| `corrections-3-keys.json`, `corrections-3-candidates.json` | Correction field selection and nominated URLs for the third recheck. |
| `unprepared-fields.json` | The 50 selected fields that did not reach a judge prompt, with finder-batch references. |
| `source-access-notes.md` | Checks of alternative pages where the source fetcher could not read an official page or PDF. These notes are not judge verdicts. |

## Outcome on the selected fields

The full Stage 3 selection contains 321 fields. Five judge waves prepared 271 distinct fields. The other 50 consist of 44 with no nominated candidate, five Healthy Start fields whose nominated sources could not be fetched, and one Child Winter Heating method field superseded by a correction and independently rechecked. An empty finder result means only that these recorded searches did not find a suitable page. It does not mean the claim is false.

| Imported wave | Services | Fields | Confirmed | Partly supported | Contradicted | Not stated |
|---|---:|---:|---:|---:|---:|---:|
| Claude wave 1, in handoff snapshot | 41 | 84 | 21 | 36 | 3 | 24 |
| Claude's 27 complete wave 2 responses | 27 | 54 | 13 | 26 | 2 | 13 |
| Codex completion of wave 2 | 14 | 31 | 9 | 15 | 1 | 6 |
| Codex wave 3 | 16 | 35 | 10 | 22 | 0 | 3 |
| Codex wave 4 | 11 | 33 | 8 | 13 | 8 | 4 |
| Codex wave 5 | 15 | 34 | 13 | 16 | 1 | 4 |

These are verdicts at the time of each import. Later graph corrections and independent rechecks changed the live provenance, so the rows must not be added to reconstruct current coverage. The current graph has **1,852 confirmed of 3,014 checkable fields (61.4%)**. The [verification procedure](../../docs/verification-procedure.md) tracks the baseline and earlier stages.

The five waves found 15 contradictions: three in Claude's first wave and 12 after the handoff. All were addressed in the graph. Corrections include tax credits after closure, Debt Relief Orders submitted by an approved adviser, Scottish benefit exceptions, and the difference between usual Reception entry and compulsory school age. Superseded values and removed fields are recorded in `data/removed-claims.json`. Corrections were rejudged from saved official page text. The remaining partly supported wording stays in the review queues; it has not been promoted to confirmed.

## Next review

1. Review the 49 still-unprepared current claims in `unprepared-fields.json`. Try a different official or service-owner page for the 44 with no nominated URL. Resolve source access for the five Healthy Start fields, or record a manual source review with the exact page body.
2. Refine partly supported claims in `data/review-queue-prose.json` and `data/review-queue-criteria.json`, starting with eligibility and application methods. The latest recheck still flags Best Start Foods' upper age wording, Best Start Grant payment exceptions, and Funeral Support Payment amounts for child funerals.
3. For every new correction, prepare a fresh prompt against the current graph value, have an independent judge assess it, and import it. Retain the exact inputs and responses here in a new run directory.

Check the record with `shasum -a 256 -c sha256sums.txt` from this directory. Do not edit these saved inputs and responses after committing the checkpoint.
