# Stage 5 worklist

Current provenance has 707 partly supported fields. Build with `node --import tsx scripts/build-stage5-worklist.ts`.

## Priority

| Priority | Fields |
|---|---:|
| high | 270 |
| medium | 292 |
| low | 145 |
| Cite candidates | 251 |

## Field types

| Type | Fields |
|---|---:|
| criteria | 142 |
| exclusions | 27 |
| autoQualifiers | 20 |
| ways to apply | 59 |
| evidence | 176 |
| summary | 162 |
| desc | 121 |

## Life events

| Highest-risk life event | Fields |
|---|---:|
| Disability or Health Condition | 134 |
| Becoming a Carer | 12 |
| Terminal Illness Diagnosis | 4 |
| Retiring | 65 |
| Death of Someone Close | 42 |
| Arriving in the UK | 99 |
| Starting a Business | 82 |
| Buying a Home | 36 |
| Starting a New Job | 72 |
| Getting Married | 27 |
| Going to University | 1 |
| Child Starting School | 22 |
| Learning to Drive | 28 |
| Already reviewed events | 34 |
| No life event | 49 |

553 classifications reuse the earlier triage because both the field text and problem notes are unchanged. 154 received a conservative Stage 5 classification from their current note and field type. Review these classifications as each wave is prepared.

The saved prompts and answers are in `data/stage5/classification-prompts.json` and `data/stage5/classification-answers.json`. The full worklist includes each field's text, problem notes, current provenance quote, and exact quotes found in saved Stage 3 judge responses. 2 queue rows no longer match a current partly supported field; the live provenance selection controls the worklist.
