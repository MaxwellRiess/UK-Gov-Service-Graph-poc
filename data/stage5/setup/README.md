# Stage 5 setup review record

This folder holds the approved setup changes and their review record. `selection.json` names the rule values and the four fields that awaited re-verification. `finder-notes.json` records the official pages checked. `judge/` contains the fetched source text, exact prompts, and answers for the two fields that `widen-sources.ts` rechecked. `review.md` is the page reviewed before application.

The answers passed a dry-run import with no missing or fabricated quotes. After approval, the import confirmed both fields and the Best Start source was added to two services. Coverage rose from 1,859 of 2,987 (62.2%) to 1,861 of 2,987 (62.3%). To check the saved files, run `shasum -a 256 -c sha256sums.txt` from this directory.

The `dwp-uc-health` WCA50 correction was drafted in the Codex Stage 3 continuation of this chat and committed in `c69684f`; both setup rechecks were judged by the separate Codex session `/root/setup_independent_judge`, started without the drafting chat history or access to earlier responses.

The Child Winter Heating age page was already cited. The two Best Start age rules now cite the correct page, but their provenance and the two Child Winter Heating age rules remain unsourced. Run `verify-rules.ts --write` in a later wave only after the NHSBSA free-prescriptions page loads, then report that run to the user. The Employment Tribunal and Warm Home Discount deadlines remain unverified because their complete text is not a literal match on one page.
