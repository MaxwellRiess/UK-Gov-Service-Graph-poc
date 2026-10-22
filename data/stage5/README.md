# Stage 5 record

`worklist.json` is rebuilt from the current `report-coverage.ts` partly-supported bucket by `scripts/build-stage5-worklist.ts`. Each item has its current graph value, review-queue problem notes, saved source quotes, and life events. `classification-prompts.json` holds the current inputs; `classification-answers.json` records the priority, Cite flag, action, and reason.

The builder reused 553 earlier triage answers only when the field wording and problem notes were unchanged. It assigned 154 new fields a conservative priority from their field type and note. Those priorities are planning aids, and each wave reviews the actual source text before changing the graph. Two queue rows no longer describe a current partly supported field, so the worklist follows live provenance.

The `setup/` directory records the approved first wave. Each later wave gets its own directory with the selection, finder notes, judge inputs and answers, review page, and checksums. Run `node --import tsx scripts/build-stage5-worklist.ts` to regenerate the root worklist files after a wave changes provenance. Recompute `sha256sums.txt` when these files change.
