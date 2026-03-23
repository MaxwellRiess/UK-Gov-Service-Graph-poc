/**
 * rejudge.ts
 * Re-runs the LLM judge against existing JSONL run logs and writes
 * experiment-logs/judge-scores.jsonl without re-running the agents.
 *
 * Usage: ANTHROPIC_API_KEY="sk-ant-..." npx tsx scripts/rejudge.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = join(__dirname, '..');
const LOGS_DIR = join(ROOT, 'experiment-logs');

const client = new Anthropic();

// ─── SCENARIO / CHECKLIST DATA (duplicated from run-experiment.ts) ────────────

interface Checklist {
  essential: string[];
  conditional: string[];
  proactive: string[];
  out_of_scope: string[];
  ordering_pairs: [string, string][];
  context_notes?: string;
}

const SCENARIOS = [
  { id: 'S1', primaryPrompt: "I'm due to have my first baby in six weeks. What do I need to do and when?", followupA: "We're on a low income and my partner is self-employed. Are there any additional benefits we should look into?", followupB: "What's the very first thing I need to do once the baby is born?" },
  { id: 'S2', primaryPrompt: "My mother passed away last week. She lived alone and owned her home. What do I need to sort out and in what order?", followupA: "She had some savings and owned property in Spain. Does that change anything?", followupB: "My mother was receiving Pension Credit. What happens to her benefits?" },
  { id: 'S3', primaryPrompt: "I was made redundant last Friday after five years with the same employer. I have a mortgage and no savings. What should I do?", followupA: "I've been signed off by my GP with stress and anxiety. Does that affect anything?", followupB: "My redundancy payment was £12,000. Does that affect what benefits I can claim?" },
  { id: 'S4', primaryPrompt: "I want to register a limited company to run a small building and renovation business operating in London. What do I need to do?", followupA: "We'll sometimes need to put skips on the road outside properties we're working on. Is there anything specific for that?", followupB: "Are there any grants or funding available for a new construction business?" },
  { id: 'S5', primaryPrompt: "I'm an Italian citizen who has lived in the UK since 2018. I have pre-settled status. What should I be doing now and what am I entitled to?", followupA: "My pre-settled status is due to expire soon. What do I need to do?", followupB: "I've applied for settled status but haven't heard back. Is there a way to check?" },
  { id: 'S6', primaryPrompt: "I was recently diagnosed with Parkinson's disease. I'm still driving. What do I need to do and what support is available to me?", followupA: "I'm finding it harder to manage at home. What adaptations help is available?", followupB: "My wife looks after me full time. Is there anything she should apply for?" },
];

const CHECKLISTS: Record<string, { primary: Checklist; followupA: Checklist; followupB: Checklist }> = {
  S1: {
    primary:  { essential: ['gro-register-birth','hmrc-child-benefit','nhs-maternity-exemption'], conditional: ['hmrc-smp','dwp-maternity-allowance','dwp-universal-credit','hmrc-tax-free-childcare'], proactive: ['hmrc-spl','la-free-childcare-2yr'], out_of_scope: ['hmcts-divorce','hmcts-probate'], ordering_pairs: [['gro-register-birth','hmrc-child-benefit']], context_notes: 'First baby, 6 weeks until due date. No income context given yet.' },
    followupA: { essential: ['dwp-universal-credit','nhs-healthy-start'], conditional: ['dwp-maternity-allowance','dwp-sure-start-grant','la-council-tax-reduction'], proactive: ['dwp-ni-credits'], out_of_scope: ['hmcts-divorce'], ordering_pairs: [], context_notes: 'Low income + self-employed partner revealed.' },
    followupB: { essential: ['gro-register-birth'], conditional: [], proactive: [], out_of_scope: ['hmcts-probate','hmcts-divorce'], ordering_pairs: [], context_notes: 'What to do FIRST after birth.' },
  },
  S2: {
    primary:  { essential: ['gro-register-death','dwp-tell-us-once','hmcts-probate','dwp-bereavement-support'], conditional: ['hmrc-iht400','la-council-tax-single-discount','opg-lpa-activation'], proactive: ['dwp-funeral-payment'], out_of_scope: ['hmcts-divorce'], ordering_pairs: [['gro-register-death','hmcts-probate'],['gro-register-death','dwp-tell-us-once']], context_notes: 'Mother died, lived alone, owned home.' },
    followupA: { essential: ['fco-document-legalisation'], conditional: ['hmrc-iht400'], proactive: [], out_of_scope: [], ordering_pairs: [['gro-register-death','fco-document-legalisation']], context_notes: 'Property in Spain.' },
    followupB: { essential: ['dwp-bereavement-support'], conditional: ['dwp-funeral-payment'], proactive: [], out_of_scope: ['hmcts-divorce'], ordering_pairs: [], context_notes: 'Pension Credit ceases on death.' },
  },
  S3: {
    primary:  { essential: ['dwp-universal-credit','other-statutory-redundancy','hmrc-p45'], conditional: ['dwp-new-style-jsa','la-council-tax-reduction','dwp-smi'], proactive: ['dwp-ni-credits','hmrc-tax-refund'], out_of_scope: ['hmcts-divorce','hmcts-probate'], ordering_pairs: [['dwp-universal-credit','dwp-new-style-jsa']], context_notes: 'Redundancy after 5 years, has mortgage, no savings.' },
    followupA: { essential: ['dwp-new-style-esa'], conditional: ['nhs-gp-register'], proactive: ['dwp-universal-credit'], out_of_scope: [], ordering_pairs: [], context_notes: 'Signed off with stress/anxiety.' },
    followupB: { essential: ['dwp-universal-credit'], conditional: ['dwp-new-style-jsa'], proactive: [], out_of_scope: [], ordering_pairs: [], context_notes: '£12k redundancy capital affects UC eligibility.' },
  },
  S4: {
    primary:  { essential: ['ch-register-company','hmrc-corporation-tax','hmrc-self-assessment'], conditional: ['hmrc-paye','hmrc-vat','tpr-workplace-pension','la-business-rates'], proactive: ['hmrc-cis'], out_of_scope: ['hmcts-divorce','hmcts-probate'], ordering_pairs: [['ch-register-company','hmrc-corporation-tax']], context_notes: 'Ltd company, building/renovation, London.' },
    followupA: { essential: ['la-skip-permit','la-road-occupation-licence'], conditional: ['la-business-rates'], proactive: [], out_of_scope: [], ordering_pairs: [], context_notes: 'Skips on public road.' },
    followupB: { essential: ['ukri-find-grants'], conditional: [], proactive: [], out_of_scope: [], ordering_pairs: [], context_notes: 'Grants for new construction business.' },
  },
  S5: {
    primary:  { essential: ['ho-eu-settled-status','ho-view-immigration-status'], conditional: ['dwp-ni-number','nhs-gp-register','other-right-to-work'], proactive: ['ho-ilr'], out_of_scope: ['hmcts-divorce'], ordering_pairs: [], context_notes: 'Italian citizen, UK since 2018, pre-settled status.' },
    followupA: { essential: ['ho-eu-settled-status'], conditional: ['ho-view-immigration-status'], proactive: [], out_of_scope: [], ordering_pairs: [], context_notes: 'Pre-settled expiring.' },
    followupB: { essential: ['ho-euss-enquiry'], conditional: ['ho-view-immigration-status'], proactive: [], out_of_scope: [], ordering_pairs: [['ho-eu-settled-status','ho-euss-enquiry']], context_notes: 'Applied but no response.' },
  },
  S6: {
    primary:  { essential: ['dvla-notify-condition','dwp-pip'], conditional: ['dvla-ved-exemption','other-motability','la-blue-badge','nhs-care-assessment'], proactive: ['la-council-tax-disability-reduction','dwp-attendance-allowance'], out_of_scope: ['hmcts-divorce'], ordering_pairs: [['dvla-notify-condition','dwp-pip']], context_notes: "Parkinson's diagnosis, still driving." },
    followupA: { essential: ['nhs-care-assessment','la-disabled-facilities-grant'], conditional: ['other-motability','la-blue-badge'], proactive: [], out_of_scope: [], ordering_pairs: [['nhs-care-assessment','la-disabled-facilities-grant']], context_notes: 'Home adaptations.' },
    followupB: { essential: ['dwp-carers-allowance'], conditional: ['la-carers-assessment','other-carers-leave','dwp-uc-carer'], proactive: [], out_of_scope: [], ordering_pairs: [], context_notes: 'Wife is full-time carer.' },
  },
};

// ─── JUDGE ────────────────────────────────────────────────────────────────────

interface JudgeScore {
  completeness: number; accuracy: number; sequencing: number; clarity: number;
  completeness_rationale: string; accuracy_rationale: string;
  sequencing_rationale: string; clarity_rationale: string;
  notable_omissions: string[]; notable_errors: string[];
}

async function judgeResponse(userPrompt: string, agentResponse: string, checklist: Checklist): Promise<JudgeScore> {
  const checklistSummary = [
    `Essential services: ${checklist.essential.join(', ')}`,
    `Conditional services: ${checklist.conditional.join(', ')}`,
    `Proactive services: ${checklist.proactive.join(', ')}`,
    checklist.context_notes ? `Context: ${checklist.context_notes}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `You are evaluating the quality of AI-generated guidance for UK citizens navigating government services.

CITIZEN'S PROMPT:
${userPrompt}

REFERENCE CHECKLIST (for grounding, not exhaustive):
${checklistSummary}

AGENT RESPONSE TO EVALUATE:
${agentResponse}

Score the response on each dimension from 1 to 5. Be critical and calibrated — a 5 requires no meaningful gaps.

COMPLETENESS (1-5): Does the response cover all services the citizen is likely to need?
ACCURACY (1-5): Are service names, eligibility rules, and process descriptions correct?
SEQUENCING (1-5): Is the recommended order sensible and correct?
CLARITY (1-5): Is the response well-structured, appropriately scoped, and easy to follow?

Respond ONLY with valid JSON:
{
  "completeness": <1-5>, "accuracy": <1-5>, "sequencing": <1-5>, "clarity": <1-5>,
  "completeness_rationale": "<one sentence>",
  "accuracy_rationale": "<one sentence>",
  "sequencing_rationale": "<one sentence>",
  "clarity_rationale": "<one sentence>",
  "notable_omissions": ["<service name>"],
  "notable_errors": ["<description>"]
}`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content.filter(b => b.type === 'text').map(b => (b as Anthropic.TextBlock).text).join('');
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in judge response');
  return JSON.parse(jsonMatch[0]) as JudgeScore;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

interface RunLog {
  scenarioId: string;
  condition: 'control' | 'treatment';
  turns: Array<{ turn: number; userMessage: string; assistantResponse: string }>;
}

async function main() {
  console.log('Re-judging trial 2 logs...\n');

  const judgeLines: string[] = [];
  const turnKeys = ['primary', 'followupA', 'followupB'] as const;

  for (const scenario of SCENARIOS) {
    const clRef = CHECKLISTS[scenario.id];
    const prompts = [scenario.primaryPrompt, scenario.followupA, scenario.followupB];

    for (const condition of ['control', 'treatment'] as const) {
      const logPath = join(LOGS_DIR, `${scenario.id}_${condition}_run1.jsonl`);
      if (!existsSync(logPath)) { console.warn(`  Missing: ${logPath}`); continue; }

      const raw = readFileSync(logPath, 'utf8').trim();
      const runLog: RunLog = JSON.parse(raw.split('\n')[0]);

      console.log(`  Judging ${scenario.id} ${condition}...`);

      for (let i = 0; i < 3; i++) {
        const turn = runLog.turns[i];
        if (!turn) continue;
        const checklist = clRef[turnKeys[i]];
        const scores = await judgeResponse(prompts[i], turn.assistantResponse, checklist);
        judgeLines.push(JSON.stringify({
          scenarioId:  scenario.id,
          lifeEvent:   scenario.id.toLowerCase(),
          turn:        i + 1,
          turnKey:     turnKeys[i],
          userMessage: prompts[i],
          condition,
          scores,
        }));
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  const outPath = join(LOGS_DIR, 'judge-scores.jsonl');
  writeFileSync(outPath, judgeLines.join('\n') + '\n');
  console.log(`\nWritten: ${outPath} (${judgeLines.length} entries)`);
}

main().catch(e => { console.error(e); process.exit(1); });
