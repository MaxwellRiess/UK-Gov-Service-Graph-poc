---
name: freshness-review
description: Review open [Freshness] and [Provenance] issues. Works out what changed on each source page, fixes src/graph-data.ts, re-verifies, and opens a PR.
---

# Freshness review

The weekly Freshness Check opens one `[Freshness] Content changed: <node>` issue per changed page. Each issue says only *that* the page changed, never what changed. The weekly Provenance Check keeps a single `[Provenance] Stale source quotes` issue open, and that one does name the affected fields. Your job is to turn both into a **triage**: one verdict per issue, backed by the sentence on the live page that supports it.

## 1. Gather

```bash
gh issue list --state open --label freshness --json number,title,body,createdAt
gh issue list --state open --label provenance --json number,title,body
```

Done when you have a list mapping each open freshness issue to its node ID and URL, plus the provenance rows for the same nodes. Include older open freshness issues as well as this week's.

## 2. Branch from origin/main

Local `main` often lags `origin/main`, and untracked files can block a pull. Work in a worktree:

```bash
git fetch
git worktree add .claude/worktrees/<yyyy-mm-dd>-freshness-fixes -b <yyyy-mm-dd>-freshness-fixes origin/main
ln -s "$PWD/node_modules" .claude/worktrees/<yyyy-mm-dd>-freshness-fixes/node_modules
```

## 3. Triage each page against its node

Read the page the way the verifiers do, with `pageText()` from `scripts/lib/page-text.ts`. It uses the Content API and returns every part of a guide. The landing page alone misses rates and phone numbers. Read the node from `NODES` on the branch. Compare every field against the page: `eligibility.rules`, `financialData`, criteria, `evidenceRequired`, `keyQuestions`, `ruleIn`/`ruleOut`, `desc`, summary, `agentSteps`, `contactInfo`.

Give each issue one verdict:

- **change**: the graph is now wrong or unsourced. Name each field and quote the page sentence that sets its new value.
- **refresh**: the value still stands and only the wording around it changed. Re-verifying refreshes the quote.
- **noise**: the page changed but nothing in the node depends on the change. Say what changed, or why the check fires.

Rank the changes:

1. **Rules first.** A number or condition in `eligibility.rules` decides who `check_eligibility` says qualifies, so a stale rule gives users wrong answers.
2. **Dated changes are urgent.** Fix "From 9 November 2026…" before that date.
3. **A value the page no longer states comes out.** Remove it and leave the field absent. Don't keep it because it still looks plausible.

Common noise, with the fix for each:

| Pattern | How to tell | Fix |
|---|---|---|
| Redirect | Content API returns `schema_name: "redirect"` | Point `govuk_url` at the real guide. Values stay as they are. |
| Finder page | `document_type: "finder"`, e.g. `business-finance-support` | None. The listings change constantly. |
| Off-GOV.UK site | Read as raw HTML, so any layout change trips it | Check the specific subpage the field cites, e.g. the contact page for a phone number. |
| Bot challenge | mygov.scot returns 202 for automated fetches | Check in a browser. Record it under "Not covered". |

Done when every issue has a verdict and every **change** names its fields and the source sentence. Present the triage to the user and wait for the go-ahead before editing.

## 4. Edit `src/graph-data.ts`

A figure in prose is a copy that goes stale. For each changed value, search the whole node for the old figure: `desc`, summary, criteria, `keyQuestions`, `exclusions`, `ruleIn`/`ruleOut`, `agentSteps`. If a rule's condition has no matching profile field, use a boolean on `custom_facts.<name>`. Grep `custom_facts.` first and reuse an existing name if one fits (e.g. `receiving_income_related_esa`).

## 5. Verify

Run these in order, one at a time. Each verifier rewrites `data/provenance.json`.

```bash
npm run check:types
npm run build
npm run verify:tier1
npm run verify:tier2
npm run verify:rules
npx tsx scripts/verify-criteria.ts --write --only <comma-separated edited node ids>
npx tsx scripts/verify-prose.ts --write --only <comma-separated edited node ids>
npm run check:consistency
npm run check:provenance
```

- If `verify-criteria` or `verify-prose` returns `partly_supported` or `contradicted` for a field you edited, fix the field and re-run that verifier for that node.
- If their API calls fail (401, or no credit), the run still rewrites the data files. Run `git checkout -- data/provenance.json data/review-queue-criteria.json`, re-run `verify:tier1`, `verify:tier2` and `verify:rules`, and record the LLM step as blocked.
- Report failures on nodes you didn't edit in the PR, but leave them for their own fix.

Done when `check:provenance` passes, or when every remaining failure is named in the PR as blocked.

## 6. Open the PR

Commit `src/graph-data.ts`, `index.html` and `data/`, push, and open the PR with `gh pr create`. Open it as a draft if `check:provenance` fails. Structure the body like past freshness PRs (#88, #100):

- **Data**: a table with columns Service | Was | Now | Source.
- **No change needed**: each **refresh** and **noise** issue, with its one-line reason.
- **Checks run**: each command and its result.
- **Not covered**: pages you couldn't read, LLM steps that were blocked, and the exact commands to finish.
- `Closes #n` for each freshness issue. The provenance issue closes itself on the next weekly run.
