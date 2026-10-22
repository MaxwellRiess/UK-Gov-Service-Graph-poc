# Stage 4 applied record

You approved the proposal in [`../stage4-proposal/`](../stage4-proposal/review.md) on 22 October 2026 with these decisions:

- **Delete P001 to P022.** These are the 22 evidence items no page states. `scripts/apply-removals.ts` deleted them. Later list items kept their verdicts at their new positions.
- **Delete `methods` for M001, M003, M004, M005, M006 and M007.** `methods` is now optional, like `authRequired`: absent means no official page says how to start. The six services are Care to Learn, death registration, the 15 free hours, Lifetime ISA and both Council Tax discounts.
- **Correct the ways to apply for M002 and M008**, from wording on the page:
  - National Insurance credits: post, from "you can write to HMRC to apply for Class 1 credits".
  - Motability: in person, from "Once you’ve found a dealer, ask for an appointment with their Motability specialist" (Citizens Advice).
  
  A fresh judge confirmed both. The prompts and responses are in `judge-methods/`.
- **Remove copies of the deleted claims:**
  - death registration: the key question about the medical certificate of cause of death, two agent steps, and the contact note "Must be done in person"
  - provisional licence: "address details" in an agent step

Every removal, copies included, is in `data/removed-claims.json`.

**Result:** 1,859 of 2,986 checkable fields confirmed (62.3%). There are 77 fields still not stated; `../stage4-proposal/selection.json` gives the reason each one was held back.
