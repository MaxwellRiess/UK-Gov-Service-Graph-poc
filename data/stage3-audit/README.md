# Stage 3 search and judging record

This directory preserves the local files used for the stage 3 source search on 21 October 2026. It is a snapshot of the run when Claude Code stopped at its session limit. Files under `pilot/` and `full/` were copied from the ignored `.cache/stage3/` and `.cache/stage3-full/` directories. `agent-instructions.json` contains the exact finder and judge task prompts from Claude's local session log.

The files have different roles:

| File | What it records |
|---|---|
| `full/briefs-*.json` | The claims assigned to each finder batch, including pages already searched. |
| `full/finder-notes-*.json` | Queries, proposed pages, snippets, and the finder's preliminary view. |
| `full/candidates-*.json` | URLs passed to the source fetcher. |
| `full/judge-w*/prepared.json` | Fields and fetched source text sent to each judge wave. |
| `full/judge-w*/*.prompt.txt` | The exact instructions and source text each judge read. |
| `full/judge-w*/*.response.json` | The judge's claim verdicts and quotes. |
| `pilot/` | The pilot's source search and both judge runs. |

The finder did not decide provenance. The judge assessed only the text in its prompt. `scripts/widen-sources.ts --import` then checked each quoted span against that text and wrote the verdict to `data/provenance.json` and the review queues. A matching quote shows that the words occurred on a fetched page. It does not prove that the quote supports the claim or that the page applies to the service and nation. The [verification procedure](../../docs/verification-procedure.md) sets the review rules.

## State when this record was saved

- The pilot's second run covered 25 fields. Its results and manual review examples are in [stage3-pilot-review.md](../../docs/stage3-pilot-review.md).
- The full run selected 321 fields and divided them into 15 finder batches, numbered 00 to 14.
- Finder files exist for batches 00 to 07, 09, and 11. Batches 09 and 11 stopped near the session limit. Check their queries and proposed pages before using them. Batches 08, 10, and 12 to 14 have briefs but no finder results.
- Judge wave 1 has 41 service responses covering 84 fields. Claude imported them: 21 confirmed, 36 partly supported, 3 contradicted, and 24 not stated. No quote failed the importer's text match.
- Judge wave 2 has 41 service prompts and 27 response files. It has not been imported. Check each response for complete field coverage before importing it.
- The first wave exposed three contradicted graph claims: the confirmation statement fee, the old UC50 questionnaire name, and the former Support for Mortgage Interest earnings rule. The graph data had not yet been corrected when this snapshot was saved.

`sha256sums.txt` records the bytes of the saved inputs and outputs. Run `shasum -a 256 -c sha256sums.txt` from this directory to check the snapshot. New work belongs in a new run directory or a separate commit, so this interrupted run remains inspectable.
