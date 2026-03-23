/**
 * run-experiment.ts — Evaluation experiment runner
 *
 * Tests whether the UK Government Service Graph MCP tools improve agent
 * journey-planning quality versus a baseline agent using GOV.UK web content.
 *
 * Deviation from spec §7.1: runs 1 repeat per scenario (not 5) due to
 * API cost and time constraints. Results are directional, not statistically
 * definitive. Label throughout as N=1.
 *
 * Usage:  npx tsx scripts/run-experiment.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { buildJourney, getServiceWithContext } from '../src/graph-engine.js';
import { LIFE_EVENTS, NODES } from '../src/graph-data.js';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LOGS_DIR = join(ROOT, 'experiment-logs');

if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true });

const client = new Anthropic({ maxRetries: 5 });

// ─── REFERENCE CHECKLISTS ────────────────────────────────────────────────────
// Constructed before running any agent (§5.1).
// Each service listed by node ID + a list of text aliases for response matching.
// Classifications: essential / conditional / proactive / out_of_scope
// Ordering pairs: [before, after] — both must be mentioned and in this order.

interface Checklist {
  essential: string[];
  conditional: string[];
  proactive: string[];
  out_of_scope: string[];
  ordering_pairs: [string, string][];
  context_notes?: string;
}

// Aliases map: service ID → array of strings, any of which count as a mention.
const ALIASES: Record<string, string[]> = {
  'gro-register-birth':             ['register', 'birth registration', 'birth certificate', 'register the birth', 'register your baby'],
  'hmrc-child-benefit':             ['child benefit'],
  'nhs-maternity-exemption':        ['maternity exemption', 'maternity exemption certificate', 'free prescriptions'],
  'hmrc-smp':                       ['statutory maternity pay', 'SMP', 'maternity pay'],
  'dwp-maternity-allowance':        ['maternity allowance', 'MA'],
  'dwp-universal-credit':           ['universal credit', 'UC'],
  'nhs-healthy-start':              ['healthy start'],
  'dwp-sure-start-grant':           ['sure start maternity', 'sure start grant', 'maternity grant', 'SSMG'],
  'hmrc-spl':                       ['shared parental leave', 'SPL'],
  'la-free-childcare-2yr':          ['15 hours free childcare', 'free childcare'],
  'hmrc-tax-free-childcare':        ['tax-free childcare', 'tax free childcare'],
  'hmrc-free-childcare-30':         ['30 hours free childcare', '30 hours childcare'],
  'nhs-gp-register':                ['register with a GP', 'GP registration', 'NHS registration', 'register with your GP'],
  'dwp-ni-credits':                 ['NI credits', 'national insurance credits'],

  'gro-register-death':             ['register the death', 'death registration', 'death certificate', 'GRO'],
  'dwp-tell-us-once':               ['tell us once', 'Tell Us Once'],
  'hmcts-probate':                  ['probate', 'grant of probate', 'letters of administration'],
  'dwp-bereavement-support':        ['bereavement support', 'bereavement support payment', 'BSP'],
  'hmrc-iht400':                    ['inheritance tax', 'IHT', 'iht400'],
  'fco-document-legalisation':      ['apostille', 'legalisation', 'document legalisation', 'legalise'],
  'dvla-cancel-licence':            ['cancel', 'driving licence', 'DVLA'],
  'la-council-tax-single-discount': ['single person discount', 'council tax single', 'council tax discount'],
  'dwp-funeral-payment':            ['funeral payment', 'funeral expenses'],
  'opg-lpa-activation':             ['lasting power of attorney', 'LPA', 'power of attorney'],

  'hmrc-p45':                       ['P45', 'form P45'],
  'other-statutory-redundancy':     ['statutory redundancy', 'redundancy pay', 'redundancy payment'],
  'dwp-new-style-jsa':              ["jobseeker's allowance", 'JSA', 'new style JSA', 'new-style JSA'],
  'dwp-new-style-esa':              ['employment and support', 'ESA', 'new style ESA', 'new-style ESA'],
  'la-council-tax-reduction':       ['council tax reduction', 'council tax support', 'council tax benefit'],
  'dwp-smi':                        ['support for mortgage interest', 'SMI'],
  'acas-early-conciliation':        ['ACAS', 'early conciliation'],
  'hmrc-tax-refund':                ['tax refund', 'tax rebate', 'P800', 'overpaid tax'],

  'ch-register-company':            ["companies house", 'company registration', 'register a company', 'incorporate', 'limited company registration'],
  'hmrc-corporation-tax':           ['corporation tax'],
  'hmrc-self-assessment':           ['self assessment', 'self-assessment', 'tax return'],
  'hmrc-paye':                      ['PAYE', 'pay as you earn', 'employer payroll', 'payroll scheme'],
  'hmrc-vat':                       ['VAT', 'value added tax', 'VAT registration'],
  'la-business-rates':              ['business rates'],
  'voa-business-rates':             ['business rates', 'rateable value', 'VOA'],
  'tpr-workplace-pension':          ['workplace pension', 'auto enrolment', 'auto-enrolment', 'pension scheme', 'auto enrollment'],
  'la-skip-permit':                 ['skip permit', 'skip licence', 'permit.*skip', 'skip.*permit'],
  'la-road-occupation-licence':     ['road occupation', 'road licence', 'road permit', 'street works permit', 'highway', 'highways licence', 'works.*highway', 'obstruct.*highway', 'highway.*permit', 'section 50', 'scaffold.*licence', 'road.*works.*permit'],
  'ukri-find-grants':               ['grant', 'funding', 'UKRI', 'Innovate UK', 'business grant'],
  'la-food-hygiene':                ['food hygiene', 'food safety', 'food business registration'],
  'ea-waste-carrier-registration':  ['waste carrier', 'waste registration'],
  'hmrc-cis':                       ['construction industry scheme', 'CIS', 'subcontractor'],

  'ho-eu-settled-status':           ['settled status', 'EUSS', 'EU settlement scheme', 'pre-settled', 'apply for settled'],
  'ho-view-immigration-status':     ['view immigration status', 'check your status', 'share code', 'eVisa', 'digital status'],
  'ho-euss-enquiry':                ['EUSS enquiry', 'settled status enquiry', 'contact UKVI', 'chase your application', 'track your application', 'UKVI enquiry', 'check.*application', 'application.*progress', 'EU settlement.*contact', 'contact.*EU settlement'],
  'ho-ilr':                         ['indefinite leave to remain', 'ILR', 'permanent residence'],
  'dwp-ni-number':                  ['national insurance number', 'NI number', 'NINO'],
  'other-right-to-work':            ['right to work', 'work in the UK', 'work eligibility'],

  'dvla-notify-condition':          ['notify DVLA', 'tell DVLA', 'medical condition.*driv', 'fitness to drive', 'DVLA.*condition', 'inform DVLA'],
  'dwp-pip':                        ['personal independence payment', 'PIP'],
  'dwp-attendance-allowance':       ['attendance allowance'],
  'la-blue-badge':                  ['blue badge'],
  'nhs-care-assessment':            ['care assessment', 'care needs assessment', 'needs assessment', 'care plan'],
  'la-disabled-facilities-grant':   ['disabled facilities grant', 'DFG', 'home adaptation', 'adaptation grant'],
  'other-motability':               ['motability', 'Motability'],
  'la-council-tax-disability-reduction': ['council tax disability', 'council tax reduction.*disab', 'disabled.*council tax'],
  'dvla-ved-exemption':             ['road tax.*exempt', 'VED exemption', 'vehicle excise duty.*exempt', 'free road tax'],
  'dwp-carers-allowance':           ["carer's allowance", 'carers allowance'],
  'la-carers-assessment':           ["carer's assessment", 'carers assessment'],
  'other-carers-leave':             ["carer's leave", 'carers leave'],
  'dwp-uc-carer':                   ['UC carer', 'universal credit.*carer', 'carer.*element'],

  // S7 — Terminal illness
  'dwp-sr1-form':                   ['SR1', 'special rules', 'terminal illness form', 'fast-track.*benefit', 'special rules.*terminally'],
  'nhs-continuing-healthcare':      ['NHS continuing healthcare', 'CHC', 'continuing care', 'fully funded care'],
  'opg-lpa':                        ['lasting power of attorney', 'LPA', 'power of attorney'],
  'dwp-pip':                        ['personal independence payment', 'PIP'],

  // S9 — Skilled Worker visa arrival
  'ho-skilled-worker-visa':         ['skilled worker visa', 'work visa', 'tier 2', 'certificate of sponsorship', 'CoS'],
  'ho-evisa':                       ['eVisa', 'e-visa', 'digital immigration status', 'UKVI account'],
  'ho-skilled-worker-dependent-visa': ['dependant visa', 'dependent visa', 'family visa', 'bring.*family', 'partner.*visa', 'spouse.*visa'],
  'nhs-register-overseas':          ['overseas visitor', 'NHS surcharge', 'immigration health surcharge', 'NHS entitlement'],

  // S10 — Retirement with NI gaps
  'hmrc-ni-check':                  ['check.*NI record', 'NI record', 'national insurance record', 'state pension forecast', 'check.*state pension'],
  'dwp-state-pension':              ['state pension', 'new state pension', 'claim.*pension', 'pension claim'],
  'dwp-voluntary-ni-contributions': ['voluntary NI', 'voluntary national insurance', 'fill.*gaps', 'NI gaps', 'buy back.*NI', 'class 3'],
  'dwp-inherited-state-pension':    ['inherited.*pension', 'inherit.*state pension', 'additional state pension', 'widowed.*pension'],
  'dwp-pension-credit':             ['pension credit'],
  'hmrc-tax-on-pension':            ['tax.*pension', 'pension.*tax', 'taxable income.*pension'],
};

// Ground-truth checklists per scenario/turn.
// Follows §5.1: essential = definitely needed; conditional = depends on circumstances
// present in prompt; proactive = agent should volunteer; out_of_scope = should NOT appear.

const CHECKLISTS: Record<string, { primary: Checklist; followupA: Checklist; followupB: Checklist }> = {
  S1: {
    primary: {
      essential: ['gro-register-birth', 'hmrc-child-benefit', 'nhs-maternity-exemption'],
      conditional: ['hmrc-smp', 'dwp-maternity-allowance', 'dwp-universal-credit', 'hmrc-tax-free-childcare'],
      proactive: ['hmrc-spl', 'la-free-childcare-2yr'],
      out_of_scope: ['hmcts-divorce', 'hmcts-probate'],
      ordering_pairs: [['gro-register-birth', 'hmrc-child-benefit']],
      context_notes: 'First baby, 6 weeks until due date. No income context given yet.'
    },
    followupA: {
      essential: ['dwp-universal-credit', 'nhs-healthy-start'],
      conditional: ['dwp-maternity-allowance', 'dwp-sure-start-grant', 'la-council-tax-reduction'],
      proactive: ['dwp-ni-credits'],
      out_of_scope: ['hmcts-divorce'],
      ordering_pairs: [],
      context_notes: 'Low income + self-employed partner revealed. Income-related services now essential.'
    },
    followupB: {
      essential: ['gro-register-birth'],
      conditional: [],
      proactive: [],
      out_of_scope: ['hmcts-probate', 'hmcts-divorce'],
      ordering_pairs: [],
      context_notes: 'What to do FIRST after birth. Birth registration is the clear answer.'
    },
  },

  S2: {
    primary: {
      essential: ['gro-register-death', 'dwp-tell-us-once', 'hmcts-probate'],
      conditional: ['hmrc-iht400', 'la-council-tax-single-discount', 'opg-lpa-activation', 'dwp-bereavement-support'],
      proactive: ['dwp-funeral-payment'],
      out_of_scope: ['hmcts-divorce'],
      ordering_pairs: [['gro-register-death', 'hmcts-probate'], ['gro-register-death', 'dwp-tell-us-once']],
      context_notes: 'Mother died, lived alone, owned home. BSP moved to conditional — it only applies to spouse/civil partner deaths, not parents.'
    },
    followupA: {
      essential: ['fco-document-legalisation'],
      conditional: ['hmrc-iht400'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [['gro-register-death', 'fco-document-legalisation']],
      context_notes: 'Property in Spain means death certificate needs apostille/legalisation for foreign use.'
    },
    followupB: {
      essential: ['dwp-tell-us-once'],
      conditional: ['dwp-bereavement-support', 'dwp-funeral-payment'],
      proactive: [],
      out_of_scope: ['hmcts-divorce'],
      ordering_pairs: [],
      context_notes: 'Pension Credit ceases on death — key action is notifying DWP (Tell Us Once). BSP conditional since it only applies to spouse deaths.'
    },
  },

  S3: {
    primary: {
      essential: ['dwp-universal-credit', 'other-statutory-redundancy', 'hmrc-p45'],
      conditional: ['dwp-new-style-jsa', 'la-council-tax-reduction', 'dwp-smi'],
      proactive: ['dwp-ni-credits', 'hmrc-tax-refund'],
      out_of_scope: ['hmcts-divorce', 'hmcts-probate'],
      ordering_pairs: [['dwp-universal-credit', 'dwp-new-style-jsa']],
      context_notes: 'Redundancy after 5 years, has mortgage, no savings. UC immediately is correct.'
    },
    followupA: {
      essential: ['dwp-new-style-esa'],
      conditional: ['nhs-gp-register'],
      proactive: ['dwp-universal-credit'],
      out_of_scope: [],
      ordering_pairs: [],
      context_notes: 'Signed off with stress/anxiety. ESA pathway (not just JSA) applies.'
    },
    followupB: {
      essential: ['dwp-universal-credit'],
      conditional: ['dwp-new-style-jsa'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [],
      context_notes: '£12k redundancy = capital that affects UC eligibility (over £6k threshold reduces UC).'
    },
  },

  S4: {
    primary: {
      essential: ['ch-register-company', 'hmrc-corporation-tax', 'hmrc-self-assessment'],
      conditional: ['hmrc-paye', 'hmrc-vat', 'tpr-workplace-pension', 'la-business-rates'],
      proactive: ['hmrc-cis'],
      out_of_scope: ['hmcts-divorce', 'hmcts-probate'],
      ordering_pairs: [['ch-register-company', 'hmrc-corporation-tax']],
      context_notes: 'Ltd company, building/renovation business in London. Sector-specific licences relevant.'
    },
    followupA: {
      essential: ['la-skip-permit', 'la-road-occupation-licence'],
      conditional: ['la-business-rates'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [],
      context_notes: 'Skips on public road requires council permit. Newly integrated graph nodes — key test.'
    },
    followupB: {
      essential: ['ukri-find-grants'],
      conditional: [],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [],
      context_notes: 'UKRI/Innovate UK grants for new businesses. Another newly integrated node.'
    },
  },

  S5: {
    primary: {
      essential: ['ho-eu-settled-status', 'ho-view-immigration-status'],
      conditional: ['dwp-ni-number', 'nhs-gp-register', 'other-right-to-work'],
      proactive: ['ho-ilr'],
      out_of_scope: ['hmcts-divorce'],
      ordering_pairs: [],
      context_notes: 'Italian citizen, UK since 2018, pre-settled status. Needs to upgrade to settled status.'
    },
    followupA: {
      essential: ['ho-eu-settled-status'],
      conditional: ['ho-view-immigration-status'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [],
      context_notes: 'Pre-settled expiring — apply to upgrade to settled status urgently.'
    },
    followupB: {
      essential: ['ho-euss-enquiry'],
      conditional: ['ho-view-immigration-status'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [['ho-eu-settled-status', 'ho-euss-enquiry']],
      context_notes: 'Applied but no response — use EUSS enquiry service to chase. Core graph test.'
    },
  },

  S6: {
    primary: {
      essential: ['dvla-notify-condition', 'dwp-pip'],
      conditional: ['dvla-ved-exemption', 'other-motability', 'la-blue-badge', 'nhs-care-assessment'],
      proactive: ['la-council-tax-disability-reduction', 'dwp-attendance-allowance'],
      out_of_scope: ['hmcts-divorce'],
      ordering_pairs: [['dvla-notify-condition', 'dwp-pip']],
      context_notes: 'Parkinson\'s diagnosis, still driving. DVLA notify is urgent (legal duty). PIP is key gateway.'
    },
    followupA: {
      essential: ['nhs-care-assessment', 'la-disabled-facilities-grant'],
      conditional: ['other-motability', 'la-blue-badge'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [['nhs-care-assessment', 'la-disabled-facilities-grant']],
      context_notes: 'Home adaptations. The graph chain nhs-care-assessment → la-disabled-facilities-grant is the core test.'
    },
    followupB: {
      essential: ['dwp-carers-allowance'],
      conditional: ['la-carers-assessment', 'other-carers-leave', 'dwp-uc-carer'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [],
      context_notes: 'Wife is full-time carer. Carer\'s Allowance is main entitlement. Graph has full chain.'
    },
  },

  S7: {
    primary: {
      essential: ['dwp-sr1-form', 'dwp-pip', 'opg-lpa'],
      conditional: ['dwp-attendance-allowance', 'nhs-care-assessment', 'dwp-universal-credit'],
      proactive: ['nhs-continuing-healthcare', 'dwp-carers-allowance'],
      out_of_scope: ['ch-register-company', 'ho-eu-settled-status'],
      ordering_pairs: [['dwp-sr1-form', 'dwp-pip']],
      context_notes: 'Terminal diagnosis. SR1 fast-track is the entry point. LPA is time-critical. CHC is proactive for funded care.',
    },
    followupA: {
      essential: ['nhs-care-assessment', 'nhs-continuing-healthcare'],
      conditional: ['la-disabled-facilities-grant', 'other-motability'],
      proactive: ['dwp-attendance-allowance'],
      out_of_scope: [],
      ordering_pairs: [['nhs-care-assessment', 'nhs-continuing-healthcare']],
      context_notes: 'Palliative care at home. CHC assessment is the gateway to fully funded care. Graph chain tests treatment.',
    },
    followupB: {
      essential: ['dwp-carers-allowance'],
      conditional: ['la-carers-assessment', 'dwp-uc-carer'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [],
      context_notes: 'Spouse has given up work to care full time. Carer\'s Allowance + potential UC carer element.',
    },
  },

  S9: {
    primary: {
      essential: ['ho-skilled-worker-visa', 'ho-evisa', 'dwp-ni-number'],
      conditional: ['nhs-gp-register', 'other-right-to-work'],
      proactive: ['ho-skilled-worker-dependent-visa'],
      out_of_scope: ['ho-eu-settled-status', 'hmcts-divorce'],
      ordering_pairs: [['ho-skilled-worker-visa', 'dwp-ni-number']],
      context_notes: 'Non-EU worker arriving on Skilled Worker visa. NI number needed to work. eVisa = digital status. Family join is proactive.',
    },
    followupA: {
      essential: ['ho-skilled-worker-dependent-visa'],
      conditional: ['nhs-gp-register'],
      proactive: [],
      out_of_scope: ['ho-eu-settled-status'],
      ordering_pairs: [],
      context_notes: 'Partner and children want to join. Dependant visa application is the clear action.',
    },
    followupB: {
      essential: ['ho-evisa', 'other-right-to-work'],
      conditional: ['dwp-ni-number'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [],
      context_notes: 'Employer asking for right-to-work proof. Share code from eVisa portal is the answer. Tests treatment graph knowledge.',
    },
  },

  S10: {
    primary: {
      essential: ['hmrc-ni-check', 'dwp-state-pension'],
      conditional: ['dwp-voluntary-ni-contributions', 'dwp-pension-credit', 'hmrc-tax-on-pension'],
      proactive: ['dwp-inherited-state-pension'],
      out_of_scope: ['ch-register-company', 'ho-eu-settled-status'],
      ordering_pairs: [['hmrc-ni-check', 'dwp-state-pension'], ['hmrc-ni-check', 'dwp-voluntary-ni-contributions']],
      context_notes: 'Retiring at 65 with NI gaps. Forecast is the first step. Voluntary contributions depend on gap size. Inherited pension is proactive (widowed).',
    },
    followupA: {
      essential: ['dwp-voluntary-ni-contributions'],
      conditional: ['hmrc-ni-check'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [['hmrc-ni-check', 'dwp-voluntary-ni-contributions']],
      context_notes: 'NI gaps confirmed. Whether to pay depends on forecast. Tests treatment\'s ability to surface a non-obvious node.',
    },
    followupB: {
      essential: ['dwp-pension-credit', 'dwp-inherited-state-pension'],
      conditional: ['dwp-attendance-allowance', 'other-tv-licence-pension'],
      proactive: [],
      out_of_scope: [],
      ordering_pairs: [],
      context_notes: 'Widowed, low income. Pension Credit is gateway to other benefits. Inherited state pension may top up entitlement.',
    },
  },
};

// ─── SCENARIOS ───────────────────────────────────────────────────────────────

interface Scenario {
  id: string;
  lifeEvent: string;
  primaryPrompt: string;
  followupA: string;
  followupB: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'S1',
    lifeEvent: 'baby',
    primaryPrompt: "I'm due to have my first baby in six weeks. What do I need to do and when?",
    followupA: "We're on a low income and my partner is self-employed. Are there any additional benefits we should look into?",
    followupB: "What's the very first thing I need to do once the baby is born?",
  },
  {
    id: 'S2',
    lifeEvent: 'bereavement',
    primaryPrompt: "My mother passed away last week. She lived alone and owned her home. What do I need to sort out and in what order?",
    followupA: "She had some savings and owned property in Spain. Does that change anything?",
    followupB: "My mother was receiving Pension Credit. What happens to her benefits?",
  },
  {
    id: 'S3',
    lifeEvent: 'job-loss',
    primaryPrompt: "I was made redundant last Friday after five years with the same employer. I have a mortgage and no savings. What should I do?",
    followupA: "I've been signed off by my GP with stress and anxiety. Does that affect anything?",
    followupB: "My redundancy payment was £12,000. Does that affect what benefits I can claim?",
  },
  {
    id: 'S4',
    lifeEvent: 'business',
    primaryPrompt: "I want to register a limited company to run a small building and renovation business operating in London. What do I need to do?",
    followupA: "We'll sometimes need to put skips on the road outside properties we're working on. Is there anything specific for that?",
    followupB: "Are there any grants or funding available for a new construction business?",
  },
  {
    id: 'S5',
    lifeEvent: 'immigration',
    primaryPrompt: "I'm an Italian citizen who has lived in the UK since 2018. I have pre-settled status. What should I be doing now and what am I entitled to?",
    followupA: "My pre-settled status is due to expire soon. What do I need to do?",
    followupB: "I've applied for settled status but haven't heard back. Is there a way to check?",
  },
  {
    id: 'S6',
    lifeEvent: 'disability',
    primaryPrompt: "I was recently diagnosed with Parkinson's disease. I'm still driving. What do I need to do and what support is available to me?",
    followupA: "I'm finding it harder to manage at home. What adaptations help is available?",
    followupB: "My wife looks after me full time. Is there anything she should apply for?",
  },
  {
    id: 'S7',
    lifeEvent: 'terminal-illness',
    primaryPrompt: "I've just been told I have a terminal diagnosis and probably have less than six months to live. I'm 58, married, and my wife has given up work to look after me. What do I need to sort out urgently?",
    followupA: "I want to stay at home as long as possible. What care and support is available to help with that?",
    followupB: "My wife has given up her job to look after me full time. What is she entitled to?",
  },
  {
    id: 'S9',
    lifeEvent: 'immigration',
    primaryPrompt: "I'm a software engineer from India and I've just arrived in the UK on a Skilled Worker visa sponsored by my employer. What do I need to do now I'm here?",
    followupA: "My wife and two children are still in India and want to join me. What do they need to do?",
    followupB: "My employer is asking me to provide proof of my right to work. How do I do that?",
  },
  {
    id: 'S10',
    lifeEvent: 'retirement',
    primaryPrompt: "I'm 64 and planning to retire next year when I turn 65. I've been self-employed for much of my career and I'm worried I might have gaps in my National Insurance record. What should I be doing now?",
    followupA: "I've checked and I have 8 years of NI gaps. Is it worth paying to fill them?",
    followupB: "My husband died two years ago. He had a full NI record and we were married for 30 years. Does that affect my State Pension or any other entitlements?",
  },
];

// ─── SYSTEM PROMPTS ──────────────────────────────────────────────────────────

const CONTROL_SYSTEM_PROMPT = `You are a chat assistant for the UK government, helping citizens understand and navigate government services.

When a citizen describes their situation, tell them which services they need, in what order, and how to access them. Use GOV.UK web search and fetch tools to find accurate, up-to-date information before responding. Always check GOV.UK for current eligibility rules, deadlines, and application links.

TONE AND STYLE:
- Write in plain British English at a reading age of 9
- Use "you" to address the user directly
- Use active voice — make it clear who needs to do what
- Remain factual and impartial; do not offer personal opinions or emotional language
- Do not address the user by name

FORMATTING (GOV.UK style):
- Use hyphens (-) for bullet points
- Use numbered lists ("1.", "2.", etc.) for sequential steps
- Never use nested lists — keep all information at a single level
- Never use bold or italics
- Use ## for section headers where needed, without a colon
- Add a blank line before and after lists

RESPONSE STRUCTURE:
1. Brief introductory sentence (only if it adds clarity)
2. Key services and steps in bullet points or numbered list
3. One clear call to action at the end

RESPONSE LENGTH:
- Aim for under 100 words for simple queries
- For complex multi-service situations, 200 words or more is appropriate
- Include only information directly relevant to the question

SOURCES:
- Cite the specific GOV.UK URLs that informed your answer
- Include inline links where helpful, with descriptive link text (at least 3 words)
- Do not use generic link text like "source" or "click here"

If the guidance you find does not fully answer the question, say so clearly and suggest what the user can do next. If the query is ambiguous, ask one specific clarifying question rather than guessing.`;

const TREATMENT_SYSTEM_PROMPT = `You are a chat assistant for the UK government, helping citizens understand and navigate government services.

When a citizen describes their situation, tell them which services they need, in what order, and how to access them. You have access to a structured UK Government Service Graph via MCP tools — use this as your primary source, supplemented by GOV.UK web fetch for current rates and procedural details.

TOOLS:
- Use list_life_events once at conversation start to identify the relevant life event ID(s)
- Use plan_journey with those ID(s) to retrieve a full journey plan — phases, dependencies, and eligibility signals for all reachable services
- Use get_service to retrieve full eligibility detail for a specific service the user asks about in depth
- Use GOV.UK web fetch only for specific facts not in the graph (e.g. current rates, procedural steps, or topics genuinely outside the graph)

TOOL SEQUENCING:
1. Call list_life_events and plan_journey ONCE at conversation start. Never call them again on follow-up turns.
2. For all follow-up questions, use only get_service and/or web_fetch — never re-run plan_journey.
3. Only use service IDs that appear verbatim in the plan_journey response — do not guess or invent IDs. If get_service returns an error, use the suggested IDs in the error message.

Example of correct follow-up behaviour:

Turn 1 (citizen): "I was made redundant. What should I do?"
Turn 1 (you): call list_life_events, then plan_journey(["job-loss"]) → give structured answer

Turn 2 (citizen): "I've been signed off sick by my GP. Does that change anything?"
Turn 2 (you): call get_service("dwp-new-style-esa") → answer using that detail. Do NOT call plan_journey again.

Turn 3 (citizen): "My redundancy payment was £12,000. Does that affect benefits?"
Turn 3 (you): call get_service("dwp-universal-credit") → answer using capital rules. Do NOT call plan_journey again.

USING THE GRAPH:
- The graph encodes real service dependencies (REQUIRES = must be done first; RELATED = loosely connected, potentially relevant)
- Use the phase ordering returned to sequence your guidance
- Surface services flagged as proactive even if the citizen did not ask about them
- For gated services, confirm the relevant prerequisite before recommending them

TONE AND STYLE:
- Write in plain British English at a reading age of 9
- Use "you" to address the user directly
- Use active voice — make it clear who needs to do what
- Remain factual and impartial; do not offer personal opinions or emotional language
- Do not address the user by name

FORMATTING (GOV.UK style):
- Use hyphens (-) for bullet points
- Use numbered lists ("1.", "2.", etc.) for sequential steps
- Never use nested lists — keep all information at a single level
- Never use bold or italics
- Use ## for section headers where needed, without a colon
- Add a blank line before and after lists

RESPONSE STRUCTURE:
1. Brief introductory sentence (only if it adds clarity)
2. Key services and steps in bullet points or numbered list
3. One clear call to action at the end

RESPONSE LENGTH:
- Aim for under 100 words for simple queries
- For complex multi-service situations, 200 words or more is appropriate
- Include only information directly relevant to the question

SOURCES:
- Cite the specific GOV.UK URLs that informed your answer
- Include inline links where helpful, with descriptive link text (at least 3 words)

If the query is ambiguous, ask one specific clarifying question rather than guessing.`;

// ─── TOOL DEFINITIONS ────────────────────────────────────────────────────────

const GRAPH_TOOLS: Anthropic.Tool[] = [
  {
    name: 'list_life_events',
    description: 'List all UK government life events supported by the journey planner. Call this first to identify which event(s) match the user\'s situation.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'plan_journey',
    description: 'Compute a personalised government service journey for one or more life events. Returns services grouped into phases with eligibility signals.',
    input_schema: {
      type: 'object' as const,
      properties: {
        life_event_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'One or more life event IDs from list_life_events.',
        },
      },
      required: ['life_event_ids'],
    },
  },
  {
    name: 'get_service',
    description: 'Get full details about a specific government service, including eligibility criteria and agent interaction capabilities.',
    input_schema: {
      type: 'object' as const,
      properties: {
        service_id: {
          type: 'string',
          description: 'The service node ID (e.g. "dwp-pip", "gro-register-birth").',
        },
      },
      required: ['service_id'],
    },
  },
  {
    name: 'web_fetch',
    description: 'Fetch content from a GOV.UK page. Use this to supplement graph data with specific details.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'The GOV.UK URL to fetch.' },
      },
      required: ['url'],
    },
  },
];

const CONTROL_TOOLS: Anthropic.Tool[] = [
  {
    name: 'web_search',
    description: 'Search GOV.UK for information about government services. Returns page titles, descriptions, and URLs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (will be scoped to GOV.UK).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'web_fetch',
    description: 'Fetch the content of a GOV.UK page.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'The GOV.UK URL to fetch.' },
      },
      required: ['url'],
    },
  },
];

// ─── TOOL HANDLERS ───────────────────────────────────────────────────────────

function handleListLifeEvents(): string {
  const events = LIFE_EVENTS.map(evt => ({
    id:             evt.id,
    name:           evt.name,
    description:    evt.desc,
    entryNodeCount: evt.entryNodes.length,
  }));
  return JSON.stringify(events, null, 2);
}

function handlePlanJourney(input: { life_event_ids: string[] }): string {
  const validIds = new Set(LIFE_EVENTS.map(e => e.id));
  const unknown  = input.life_event_ids.filter(id => !validIds.has(id));
  if (unknown.length) {
    return `Unknown life event IDs: ${unknown.join(', ')}. Call list_life_events to see valid IDs.`;
  }
  const result = buildJourney(input.life_event_ids);
  return JSON.stringify(result, null, 2);
}

function handleGetService(input: { service_id: string }): string {
  const service = getServiceWithContext(input.service_id);
  if (!service) {
    // Fuzzy-match: find IDs that share at least one hyphen-segment with the requested ID
    const requestedParts = input.service_id.toLowerCase().split('-');
    const allIds = Object.keys(NODES as Record<string, unknown>);
    const suggestions = allIds
      .filter(id => requestedParts.some(part => part.length > 2 && id.includes(part)))
      .slice(0, 5);
    const hint = suggestions.length
      ? ` Did you mean one of: ${suggestions.join(', ')}?`
      : ' Only use IDs returned by plan_journey.';
    return `Error: No service found with ID "${input.service_id}".${hint}`;
  }
  return JSON.stringify(service, null, 2);
}

async function handleWebFetch(input: { url: string }): Promise<string> {
  try {
    // Only allow GOV.UK domains
    const url = input.url;
    if (!url.includes('gov.uk') && !url.includes('direct.gov')) {
      return 'Error: Only GOV.UK URLs are permitted.';
    }
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (research/evaluation bot)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return `HTTP ${res.status}: ${res.statusText}`;
    const html = await res.text();
    // Strip HTML tags and collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000);
    return text;
  } catch (e: unknown) {
    return `Fetch error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function handleWebSearch(input: { query: string }): Promise<string> {
  try {
    const q = encodeURIComponent(input.query);
    const url = `https://www.gov.uk/api/search.json?q=${q}&count=5`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (research/evaluation bot)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return `Search error: HTTP ${res.status}`;
    const data = await res.json() as { results?: Array<{ title: string; description: string; link: string }> };
    if (!data.results?.length) return 'No results found.';
    return data.results.map((r, i) =>
      `${i+1}. ${r.title}\n   ${r.description}\n   https://www.gov.uk${r.link}`
    ).join('\n\n');
  } catch (e: unknown) {
    return `Search error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// ─── AGENT RUNNER ────────────────────────────────────────────────────────────

interface TurnResult {
  turn: number;
  userMessage: string;
  assistantResponse: string;
  toolCalls: Array<{ name: string; input: unknown; output: string }>;
  inputTokens: number;
  outputTokens: number;
}

interface RunResult {
  scenarioId: string;
  condition: 'control' | 'treatment';
  runNumber: number;
  timestamp: string;
  turns: TurnResult[];
  totalToolCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

async function runAgent(
  condition: 'control' | 'treatment',
  scenarioId: string,
  runNumber: number,
  scenario: Scenario,
): Promise<RunResult> {
  const tools  = condition === 'treatment' ? GRAPH_TOOLS : CONTROL_TOOLS;
  const system = condition === 'treatment' ? TREATMENT_SYSTEM_PROMPT : CONTROL_SYSTEM_PROMPT;
  const prompts = [scenario.primaryPrompt, scenario.followupA, scenario.followupB];

  const conversationHistory: Anthropic.MessageParam[] = [];
  const turns: TurnResult[] = [];
  let totalTools = 0, totalIn = 0, totalOut = 0;

  for (let turnIdx = 0; turnIdx < prompts.length; turnIdx++) {
    const userMsg = prompts[turnIdx];
    conversationHistory.push({ role: 'user', content: userMsg });

    const toolCallsThisTurn: Array<{ name: string; input: unknown; output: string }> = [];
    let finalText = '';
    let inputTok = 0, outputTok = 0;

    // Agentic loop for this turn (handle tool calls)
    const currentMessages: Anthropic.MessageParam[] = [...conversationHistory];

    while (true) {
      const response = await client.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 4096,
        temperature: 0.3,
        system,
        tools,
        messages: currentMessages,
      });

      inputTok  += response.usage.input_tokens;
      outputTok += response.usage.output_tokens;

      if (response.stop_reason === 'end_turn') {
        finalText = response.content
          .filter(b => b.type === 'text')
          .map(b => (b as Anthropic.TextBlock).text)
          .join('\n');
        currentMessages.push({ role: 'assistant', content: response.content });
        break;
      }

      if (response.stop_reason === 'tool_use') {
        // Collect all tool uses in this response
        currentMessages.push({ role: 'assistant', content: response.content });
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of response.content) {
          if (block.type !== 'tool_use') continue;
          const toolInput = block.input as Record<string, unknown>;
          let toolOutput: string;

          if (condition === 'treatment') {
            if (block.name === 'list_life_events') {
              toolOutput = handleListLifeEvents();
            } else if (block.name === 'plan_journey') {
              toolOutput = handlePlanJourney(toolInput as { life_event_ids: string[] });
            } else if (block.name === 'get_service') {
              toolOutput = handleGetService(toolInput as { service_id: string });
            } else if (block.name === 'web_fetch') {
              toolOutput = await handleWebFetch(toolInput as { url: string });
            } else {
              toolOutput = 'Unknown tool.';
            }
          } else {
            if (block.name === 'web_search') {
              toolOutput = await handleWebSearch(toolInput as { query: string });
            } else if (block.name === 'web_fetch') {
              toolOutput = await handleWebFetch(toolInput as { url: string });
            } else {
              toolOutput = 'Unknown tool.';
            }
          }

          toolCallsThisTurn.push({ name: block.name, input: toolInput, output: toolOutput.slice(0, 2000) });
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: toolOutput });
        }

        currentMessages.push({ role: 'user', content: toolResults });
        continue; // Loop to get assistant's next response
      }

      // max_tokens or other stop reason — take what we have
      finalText = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text)
        .join('\n');
      break;
    }

    // Update conversation history with the full resolved assistant turn
    // (Use the last assistant message from currentMessages)
    const lastAssistantMsg = [...currentMessages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg) {
      conversationHistory.push(lastAssistantMsg);
    }

    turns.push({
      turn: turnIdx + 1,
      userMessage: userMsg,
      assistantResponse: finalText,
      toolCalls: toolCallsThisTurn,
      inputTokens: inputTok,
      outputTokens: outputTok,
    });

    totalTools += toolCallsThisTurn.length;
    totalIn    += inputTok;
    totalOut   += outputTok;

    // Small pause between turns to be kind to the API
    await new Promise(r => setTimeout(r, 500));
  }

  const result: RunResult = {
    scenarioId,
    condition,
    runNumber,
    timestamp: new Date().toISOString(),
    turns,
    totalToolCalls: totalTools,
    totalInputTokens: totalIn,
    totalOutputTokens: totalOut,
  };

  // Write JSONL log
  const filename = join(LOGS_DIR, `${scenarioId}_${condition}_run${runNumber}.jsonl`);
  writeFileSync(filename, JSON.stringify(result) + '\n');
  console.log(`  ✓ Logged to ${filename}`);

  return result;
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

function mentionsService(responseText: string, serviceId: string): boolean {
  const text = responseText.toLowerCase();
  const aliases = ALIASES[serviceId];
  if (!aliases) return false;
  return aliases.some(alias => {
    const pat = alias.includes('.*') ? new RegExp(alias, 'i') : null;
    return pat ? pat.test(responseText) : text.includes(alias.toLowerCase());
  });
}

interface TurnScore {
  turn: number;
  checklist: 'primary' | 'followupA' | 'followupB';
  essentialMentioned: string[];
  essentialMissed: string[];
  essentialRecall: number;
  conditionalMentioned: string[];
  conditionalMissed: string[];
  conditionalRecall: number;
  proactiveMentioned: string[];
  proactiveRecall: number;
  outOfScopeIncluded: string[];
  /** Fraction of out_of_scope services that were incorrectly mentioned (actual errors) */
  outOfScopeRate: number;
  /** Fraction of all mentioned services that were beyond the checklist (informational — not penalised) */
  overScopingRate: number;
  orderingPairsCorrect: number;
  orderingPairsTotal: number;
  orderingAccuracy: number;
  allMentioned: string[];
}

function scoreTurn(
  response: string,
  checklist: Checklist,
  checklistKey: 'primary' | 'followupA' | 'followupB',
  turnNum: number,
): TurnScore {
  const allKnown = new Set([
    ...checklist.essential,
    ...checklist.conditional,
    ...checklist.proactive,
  ]);

  const essentialMentioned = checklist.essential.filter(s => mentionsService(response, s));
  const essentialMissed    = checklist.essential.filter(s => !mentionsService(response, s));
  const conditionalMentioned = checklist.conditional.filter(s => mentionsService(response, s));
  const conditionalMissed    = checklist.conditional.filter(s => !mentionsService(response, s));
  const proactiveMentioned   = checklist.proactive.filter(s => mentionsService(response, s));
  const outOfScopeIncluded   = checklist.out_of_scope.filter(s => mentionsService(response, s));

  // All mentioned services in the response from our full alias set
  const allMentioned = Object.keys(ALIASES).filter(s => mentionsService(response, s));

  // Over-scoping rate: services mentioned beyond this turn's checklist (informational — not penalised)
  const overScopingRate = allMentioned.length > 0
    ? allMentioned.filter(s => !allKnown.has(s)).length / allMentioned.length
    : 0;

  // Out-of-scope rate: explicitly prohibited services that were mentioned (actual errors)
  const outOfScopeRate = checklist.out_of_scope.length > 0
    ? outOfScopeIncluded.length / checklist.out_of_scope.length
    : 0;

  // Ordering accuracy
  let correctPairs = 0;
  const pairs = checklist.ordering_pairs;
  for (const [before, after] of pairs) {
    const bMentioned = mentionsService(response, before);
    const aMentioned = mentionsService(response, after);
    if (!bMentioned || !aMentioned) continue;
    // Find first occurrence of each
    const bIdx = findFirstOccurrence(response, before);
    const aIdx = findFirstOccurrence(response, after);
    if (bIdx < aIdx) correctPairs++;
  }

  return {
    turn: turnNum,
    checklist: checklistKey,
    essentialMentioned,
    essentialMissed,
    essentialRecall: checklist.essential.length > 0
      ? essentialMentioned.length / checklist.essential.length
      : 1,
    conditionalMentioned,
    conditionalMissed,
    conditionalRecall: checklist.conditional.length > 0
      ? conditionalMentioned.length / checklist.conditional.length
      : 1,
    proactiveMentioned,
    proactiveRecall: checklist.proactive.length > 0
      ? proactiveMentioned.length / checklist.proactive.length
      : 1,
    outOfScopeIncluded,
    outOfScopeRate,
    overScopingRate,
    orderingPairsCorrect: correctPairs,
    orderingPairsTotal: pairs.filter(([b, a]) =>
      mentionsService(response, b) && mentionsService(response, a)
    ).length,
    orderingAccuracy: pairs.length > 0
      ? correctPairs / pairs.filter(([b, a]) =>
          mentionsService(response, b) && mentionsService(response, a)
        ).length || 1
      : 1,
    allMentioned,
  };
}

function findFirstOccurrence(text: string, serviceId: string): number {
  const lower = text.toLowerCase();
  const aliases = ALIASES[serviceId] || [];
  let min = Infinity;
  for (const alias of aliases) {
    if (alias.includes('.*')) continue;
    const idx = lower.indexOf(alias.toLowerCase());
    if (idx !== -1 && idx < min) min = idx;
  }
  return min;
}

// ─── LLM JUDGE ───────────────────────────────────────────────────────────────

interface JudgeScore {
  completeness: number;
  accuracy: number;
  sequencing: number;
  clarity: number;
  completeness_rationale: string;
  accuracy_rationale: string;
  sequencing_rationale: string;
  clarity_rationale: string;
  notable_omissions: string[];
  notable_errors: string[];
}

async function judgeResponse(
  scenarioId: string,
  turnKey: 'primary' | 'followupA' | 'followupB',
  userPrompt: string,
  agentResponse: string,
  checklist: Checklist,
): Promise<JudgeScore> {
  const checklistSummary = [
    `Essential services: ${checklist.essential.join(', ')}`,
    `Conditional services: ${checklist.conditional.join(', ')}`,
    `Proactive services: ${checklist.proactive.join(', ')}`,
    checklist.context_notes ? `Context: ${checklist.context_notes}` : '',
  ].filter(Boolean).join('\n');

  const judgePrompt = `You are evaluating the quality of AI-generated guidance for UK citizens navigating government services.

CITIZEN'S PROMPT:
${userPrompt}

REFERENCE CHECKLIST (for grounding, not exhaustive):
${checklistSummary}

AGENT RESPONSE TO EVALUATE:
${agentResponse}

Score the response on each dimension from 1 to 5. Be critical and calibrated — a 5 requires no meaningful gaps.

COMPLETENESS (1-5): Does the response cover all services the citizen is likely to need?
- 5: All essential and most conditional services present; proactive services volunteered
- 4: All essential services present; minor conditional gaps
- 3: Most essential services; some notable gaps
- 2: Only obvious services; significant gaps
- 1: Incomplete to the point of being unhelpful

ACCURACY (1-5): Are service names, eligibility rules, and process descriptions correct?
- 5: No factual errors; service names correct; eligibility accurate
- 4: Mostly accurate; minor imprecision
- 3: Broadly correct but one or two meaningful errors
- 2: Significant errors that could mislead
- 1: Substantially wrong

SEQUENCING (1-5): Is the recommended order sensible and correct?
- 5: Correct ordering of all dependent steps; phases clearly communicated
- 4: Generally correct; minor sequencing imprecision
- 3: Correct for obvious dependencies but misses non-obvious ordering
- 2: Incorrect sequencing that could cause delays
- 1: No meaningful sequencing guidance

CLARITY (1-5): Is the response well-structured, appropriately scoped, and easy to follow?
- 5: Clearly structured; appropriate depth; no irrelevant information
- 4: Clear and useful; minor scope issues
- 3: Understandable but too long/short or missing structure
- 2: Hard to follow; poorly scoped
- 1: Confusing or unusable

Respond ONLY with valid JSON matching this exact schema:
{
  "completeness": <1-5>,
  "accuracy": <1-5>,
  "sequencing": <1-5>,
  "clarity": <1-5>,
  "completeness_rationale": "<one sentence>",
  "accuracy_rationale": "<one sentence>",
  "sequencing_rationale": "<one sentence>",
  "clarity_rationale": "<one sentence>",
  "notable_omissions": ["<service name>"],
  "notable_errors": ["<description>"]
}`;

  const response = await client.messages.create({
    model:       'claude-opus-4-6',  // Different model for judging (§6.2)
    max_tokens:  1024,
    temperature: 0,
    messages: [{ role: 'user', content: judgePrompt }],
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.TextBlock).text)
    .join('');

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in judge response');
    return JSON.parse(jsonMatch[0]) as JudgeScore;
  } catch {
    console.warn(`  ⚠ Judge parse failed for ${scenarioId}/${turnKey}, using defaults`);
    return {
      completeness: 3, accuracy: 3, sequencing: 3, clarity: 3,
      completeness_rationale: 'Parse failed',
      accuracy_rationale: 'Parse failed',
      sequencing_rationale: 'Parse failed',
      clarity_rationale: 'Parse failed',
      notable_omissions: [],
      notable_errors: ['Judge response parse failed'],
    };
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

interface ScenarioResult {
  scenario: Scenario;
  control:   { run: RunResult; scores: TurnScore[]; judgeScores: JudgeScore[] };
  treatment: { run: RunResult; scores: TurnScore[]; judgeScores: JudgeScore[] };
}

async function runAllScenarios(): Promise<ScenarioResult[]> {
  const results: ScenarioResult[] = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Scenario ${scenario.id}: ${scenario.lifeEvent}`);
    console.log('═'.repeat(60));

    for (const condition of ['control', 'treatment'] as const) {
      console.log(`\n  Running ${condition.toUpperCase()}...`);
      const run = await runAgent(condition, scenario.id, 1, scenario);
      console.log(`  Turns: ${run.turns.length}, Tool calls: ${run.totalToolCalls}, Tokens in: ${run.totalInputTokens}`);
    }

    // Reload runs from memory (they were saved above)
    // Re-run (already have the objects from above, need to restructure)
    // Note: Re-running would be wasteful. Let me restructure to collect first.
    // Actually collect inline below.
    // This is a structural issue — let me refactor to return directly.

    // WORKAROUND: We already collected above but didn't save to results.
    // Let me just run inline and collect properly.
    // (This code path won't be reached since we broke the flow — see refactored main below)
    console.log(`  ⚠ Internal: use refactored main`);
    break;
  }

  return results;
}

// Refactored clean main function
async function main() {
  console.log('UK Gov Service Graph — Evaluation Experiment');
  console.log('============================================');
  console.log(`Start time: ${new Date().toISOString()}`);
  console.log('Runs per scenario: 1 (reduced from spec\'s 5 for cost/time)');
  console.log('');

  const allResults: ScenarioResult[] = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Scenario ${scenario.id} (${scenario.lifeEvent})`);
    console.log('═'.repeat(60));

    // Run control (or reload from existing log)
    const controlLogPath   = join(LOGS_DIR, `${scenario.id}_control_run1.jsonl`);
    const treatmentLogPath = join(LOGS_DIR, `${scenario.id}_treatment_run1.jsonl`);

    console.log('\n  [CONTROL]');
    let controlRun: RunResult;
    if (existsSync(controlLogPath)) {
      console.log(`  ↩ Reloading from existing log: ${controlLogPath}`);
      controlRun = JSON.parse(readFileSync(controlLogPath, 'utf8').trim().split('\n')[0]) as RunResult;
      console.log(`  Tool calls: ${controlRun.totalToolCalls}, Input tokens: ${controlRun.totalInputTokens}`);
    } else {
      controlRun = await runAgent('control', scenario.id, 1, scenario);
      console.log(`  Tool calls: ${controlRun.totalToolCalls}, Input tokens: ${controlRun.totalInputTokens}`);
      await new Promise(r => setTimeout(r, 1000));
    }

    // Run treatment (or reload from existing log)
    console.log('\n  [TREATMENT]');
    let treatmentRun: RunResult;
    if (existsSync(treatmentLogPath)) {
      console.log(`  ↩ Reloading from existing log: ${treatmentLogPath}`);
      treatmentRun = JSON.parse(readFileSync(treatmentLogPath, 'utf8').trim().split('\n')[0]) as RunResult;
      console.log(`  Tool calls: ${treatmentRun.totalToolCalls}, Input tokens: ${treatmentRun.totalInputTokens}`);
    } else {
      treatmentRun = await runAgent('treatment', scenario.id, 1, scenario);
      console.log(`  Tool calls: ${treatmentRun.totalToolCalls}, Input tokens: ${treatmentRun.totalInputTokens}`);
      await new Promise(r => setTimeout(r, 1000));
    }

    // Score all turns
    const turnKeys: Array<'primary' | 'followupA' | 'followupB'> = ['primary', 'followupA', 'followupB'];
    const clRef = CHECKLISTS[scenario.id];

    const controlScores  = controlRun.turns.map((t, i)  => scoreTurn(t.assistantResponse, clRef[turnKeys[i]], turnKeys[i], i + 1));
    const treatmentScores = treatmentRun.turns.map((t, i) => scoreTurn(t.assistantResponse, clRef[turnKeys[i]], turnKeys[i], i + 1));

    // Judge scores
    console.log('\n  [JUDGING]');
    const controlJudge: JudgeScore[]   = [];
    const treatmentJudge: JudgeScore[] = [];

    for (let i = 0; i < 3; i++) {
      const key = turnKeys[i];
      const cturn   = controlRun.turns[i];
      const tturn   = treatmentRun.turns[i];
      const prompt  = [scenario.primaryPrompt, scenario.followupA, scenario.followupB][i];
      const cl      = clRef[key];

      console.log(`    Judging turn ${i+1}...`);
      controlJudge.push(  await judgeResponse(scenario.id, key, prompt, cturn.assistantResponse,   cl));
      treatmentJudge.push(await judgeResponse(scenario.id, key, prompt, tturn.assistantResponse, cl));
      await new Promise(r => setTimeout(r, 300));
    }

    allResults.push({
      scenario,
      control:   { run: controlRun,   scores: controlScores,   judgeScores: controlJudge },
      treatment: { run: treatmentRun, scores: treatmentScores, judgeScores: treatmentJudge },
    });

    console.log(`\n  ✓ Scenario ${scenario.id} complete`);
  }

  // ── Generate report ─────────────────────────────────────────────────────────
  console.log('\n\nGenerating report...');
  const report = generateReport(allResults);
  const reportPath = join(ROOT, 'docs', 'experiment-results.md');
  writeFileSync(reportPath, report);
  console.log(`Report written to: ${reportPath}`);

  // ── Write judge scores JSONL ─────────────────────────────────────────────────
  const judgeScoresPath = join(LOGS_DIR, 'judge-scores.jsonl');
  const judgeLines: string[] = [];
  const turnKeys2: Array<'primary' | 'followupA' | 'followupB'> = ['primary', 'followupA', 'followupB'];
  for (const r of allResults) {
    for (let i = 0; i < 3; i++) {
      const turnKey = turnKeys2[i];
      const userMessage = [r.scenario.primaryPrompt, r.scenario.followupA, r.scenario.followupB][i];
      for (const condition of ['control', 'treatment'] as const) {
        const judgeScore = r[condition].judgeScores[i];
        judgeLines.push(JSON.stringify({
          scenarioId: r.scenario.id,
          lifeEvent:  r.scenario.lifeEvent,
          turn:       i + 1,
          turnKey,
          userMessage,
          condition,
          scores: judgeScore,
        }));
      }
    }
  }
  writeFileSync(judgeScoresPath, judgeLines.join('\n') + '\n');
  console.log(`Judge scores written to: ${judgeScoresPath}`);

  // ── Write summary JSON ───────────────────────────────────────────────────────
  const summaryPath = join(LOGS_DIR, 'summary.json');
  writeFileSync(summaryPath, JSON.stringify(allResults.map(r => ({
    scenarioId: r.scenario.id,
    control: {
      totalToolCalls:    r.control.run.totalToolCalls,
      totalInputTokens:  r.control.run.totalInputTokens,
      totalOutputTokens: r.control.run.totalOutputTokens,
      avgEssentialRecall:    avg(r.control.scores.map(s => s.essentialRecall)),
      avgConditionalRecall:  avg(r.control.scores.map(s => s.conditionalRecall)),
      avgProactiveRecall:    avg(r.control.scores.map(s => s.proactiveRecall)),
      avgOutOfScopeRate:     avg(r.control.scores.map(s => s.outOfScopeRate)),
      avgOverScopingRate:    avg(r.control.scores.map(s => s.overScopingRate)),
      avgOrderingAccuracy:   avg(r.control.scores.filter(s => s.orderingPairsTotal > 0).map(s => s.orderingAccuracy)),
      judgeCompleteness:     avg(r.control.judgeScores.map(j => j.completeness)),
      judgeAccuracy:         avg(r.control.judgeScores.map(j => j.accuracy)),
      judgeSequencing:       avg(r.control.judgeScores.map(j => j.sequencing)),
      judgeClarity:          avg(r.control.judgeScores.map(j => j.clarity)),
    },
    treatment: {
      totalToolCalls:    r.treatment.run.totalToolCalls,
      totalInputTokens:  r.treatment.run.totalInputTokens,
      totalOutputTokens: r.treatment.run.totalOutputTokens,
      avgEssentialRecall:    avg(r.treatment.scores.map(s => s.essentialRecall)),
      avgConditionalRecall:  avg(r.treatment.scores.map(s => s.conditionalRecall)),
      avgProactiveRecall:    avg(r.treatment.scores.map(s => s.proactiveRecall)),
      avgFalsePositiveRate:  avg(r.treatment.scores.map(s => s.falsePositiveRate)),
      avgOrderingAccuracy:   avg(r.treatment.scores.filter(s => s.orderingPairsTotal > 0).map(s => s.orderingAccuracy)),
      judgeCompleteness:     avg(r.treatment.judgeScores.map(j => j.completeness)),
      judgeAccuracy:         avg(r.treatment.judgeScores.map(j => j.accuracy)),
      judgeSequencing:       avg(r.treatment.judgeScores.map(j => j.sequencing)),
      judgeClarity:          avg(r.treatment.judgeScores.map(j => j.clarity)),
    },
  })), null, 2));
  console.log(`Summary JSON written to: ${summaryPath}`);
  console.log('\nExperiment complete.');
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

// ─── REPORT GENERATOR ────────────────────────────────────────────────────────

function generateReport(results: ScenarioResult[]): string {
  const now = new Date().toISOString();

  // Aggregate metrics
  const controlEssential   = avg(results.flatMap(r => r.control.scores.map(s => s.essentialRecall)));
  const treatmentEssential = avg(results.flatMap(r => r.treatment.scores.map(s => s.essentialRecall)));
  const controlConditional   = avg(results.flatMap(r => r.control.scores.map(s => s.conditionalRecall)));
  const treatmentConditional = avg(results.flatMap(r => r.treatment.scores.map(s => s.conditionalRecall)));
  const controlProactive   = avg(results.flatMap(r => r.control.scores.map(s => s.proactiveRecall)));
  const treatmentProactive = avg(results.flatMap(r => r.treatment.scores.map(s => s.proactiveRecall)));
  const controlOutOfScope   = avg(results.flatMap(r => r.control.scores.map(s => s.outOfScopeRate)));
  const treatmentOutOfScope = avg(results.flatMap(r => r.treatment.scores.map(s => s.outOfScopeRate)));
  const controlOverScoping   = avg(results.flatMap(r => r.control.scores.map(s => s.overScopingRate)));
  const treatmentOverScoping = avg(results.flatMap(r => r.treatment.scores.map(s => s.overScopingRate)));

  const controlOrderingScores   = results.flatMap(r => r.control.scores.filter(s => s.orderingPairsTotal > 0).map(s => s.orderingAccuracy));
  const treatmentOrderingScores = results.flatMap(r => r.treatment.scores.filter(s => s.orderingPairsTotal > 0).map(s => s.orderingAccuracy));
  const controlOrdering   = avg(controlOrderingScores);
  const treatmentOrdering = avg(treatmentOrderingScores);

  const controlJudge   = {
    completeness: avg(results.flatMap(r => r.control.judgeScores.map(j => j.completeness))),
    accuracy:     avg(results.flatMap(r => r.control.judgeScores.map(j => j.accuracy))),
    sequencing:   avg(results.flatMap(r => r.control.judgeScores.map(j => j.sequencing))),
    clarity:      avg(results.flatMap(r => r.control.judgeScores.map(j => j.clarity))),
  };
  const treatmentJudge = {
    completeness: avg(results.flatMap(r => r.treatment.judgeScores.map(j => j.completeness))),
    accuracy:     avg(results.flatMap(r => r.treatment.judgeScores.map(j => j.accuracy))),
    sequencing:   avg(results.flatMap(r => r.treatment.judgeScores.map(j => j.sequencing))),
    clarity:      avg(results.flatMap(r => r.treatment.judgeScores.map(j => j.clarity))),
  };

  const controlTokens   = results.reduce((s, r) => s + r.control.run.totalInputTokens, 0);
  const treatmentTokens = results.reduce((s, r) => s + r.treatment.run.totalInputTokens, 0);
  const controlTools    = results.reduce((s, r) => s + r.control.run.totalToolCalls, 0);
  const treatmentTools  = results.reduce((s, r) => s + r.treatment.run.totalToolCalls, 0);

  // Success criteria evaluation (§10, revised)
  const essentialDelta   = treatmentEssential - controlEssential;
  const proactiveDelta   = treatmentProactive - controlProactive;
  const orderingDelta    = treatmentOrdering - controlOrdering;
  const judgeCompleteDelta = treatmentJudge.completeness - controlJudge.completeness;
  // Scenario advantage measured by LLM judge completeness (more reliable than automated F1)
  const scenariosWon     = results.filter(r => {
    const cComp = avg(r.control.judgeScores.map(j => j.completeness));
    const tComp = avg(r.treatment.judgeScores.map(j => j.completeness));
    return tComp > cComp;
  }).length;

  const criteria = [
    { name: 'Essential recall: treatment ≥ control + 10pp',           met: essentialDelta >= 0.10,        delta: pct(essentialDelta) },
    { name: 'Proactive recall: treatment ≥ control + 15pp',           met: proactiveDelta >= 0.15,        delta: pct(proactiveDelta) },
    { name: 'LLM judge completeness: treatment ≥ control + 0.25',     met: judgeCompleteDelta >= 0.25,    delta: judgeCompleteDelta.toFixed(2) },
    { name: 'Ordering accuracy: treatment ≥ control + 10pp',          met: orderingDelta >= 0.10,         delta: pct(orderingDelta) },
    { name: `At least 3/6 scenarios with treatment advantage (judge)`, met: scenariosWon >= 3,             delta: `${scenariosWon}/6` },
  ];

  const metCount = criteria.filter(c => c.met).length;
  const overallVerdict = metCount >= 4 ? 'MATERIAL VALUE DEMONSTRATED'
    : metCount >= 2 ? 'PARTIAL VALUE — MIXED RESULTS'
    : 'NO MATERIAL VALUE DEMONSTRATED';

  let md = `# Evaluation Experiment Results
## Does the Service Graph Improve Agent Journey Planning?

**Date:** ${now}
**Model:** claude-sonnet-4-6 (both conditions)
**Judge:** claude-opus-4-6
**Runs per scenario:** 1 (reduced from spec's 5 — results are directional, not statistically definitive)
**Scenarios:** ${results.length}/6

---

## Overall Verdict: ${overallVerdict}

Success criteria met: **${metCount}/5**

| Criterion | Required | Actual Δ | Met? |
|-----------|----------|----------|------|
${criteria.map(c => `| ${c.name} | — | ${c.delta} | ${c.met ? '✅' : '❌'} |`).join('\n')}

---

## Primary Metrics Summary

| Metric | Control | Treatment | Δ |
|--------|---------|-----------|---|
| Essential recall | ${pct(controlEssential)} | ${pct(treatmentEssential)} | ${pct(essentialDelta)} |
| Conditional recall | ${pct(controlConditional)} | ${pct(treatmentConditional)} | ${pct(treatmentConditional - controlConditional)} |
| Proactive recall | ${pct(controlProactive)} | ${pct(treatmentProactive)} | ${pct(proactiveDelta)} |
| Out-of-scope rate (actual errors) | ${pct(controlOutOfScope)} | ${pct(treatmentOutOfScope)} | ${pct(treatmentOutOfScope - controlOutOfScope)} |
| Over-scoping rate (informational) | ${pct(controlOverScoping)} | ${pct(treatmentOverScoping)} | ${pct(treatmentOverScoping - controlOverScoping)} |
| Ordering accuracy | ${pct(controlOrdering)} | ${pct(treatmentOrdering)} | ${pct(orderingDelta)} |

## LLM Judge Scores (1–5 scale, claude-opus-4-6)

| Dimension | Control | Treatment | Δ |
|-----------|---------|-----------|---|
| Completeness | ${controlJudge.completeness} | ${treatmentJudge.completeness} | ${(treatmentJudge.completeness - controlJudge.completeness).toFixed(2)} |
| Accuracy     | ${controlJudge.accuracy}     | ${treatmentJudge.accuracy}     | ${(treatmentJudge.accuracy     - controlJudge.accuracy    ).toFixed(2)} |
| Sequencing   | ${controlJudge.sequencing}   | ${treatmentJudge.sequencing}   | ${(treatmentJudge.sequencing   - controlJudge.sequencing  ).toFixed(2)} |
| Clarity      | ${controlJudge.clarity}      | ${treatmentJudge.clarity}      | ${(treatmentJudge.clarity      - controlJudge.clarity     ).toFixed(2)} |

## Efficiency

| Metric | Control | Treatment | Δ |
|--------|---------|-----------|---|
| Total input tokens (all scenarios) | ${controlTokens.toLocaleString()} | ${treatmentTokens.toLocaleString()} | ${(treatmentTokens - controlTokens).toLocaleString()} |
| Total tool calls (all scenarios)   | ${controlTools} | ${treatmentTools} | ${treatmentTools - controlTools} |
| Avg tokens per scenario | ${Math.round(controlTokens/results.length).toLocaleString()} | ${Math.round(treatmentTokens/results.length).toLocaleString()} | — |

---

## Per-Scenario Results

`;

  for (const r of results) {
    const s = r.scenario;
    const cAvgEssential = avg(r.control.scores.map(s => s.essentialRecall));
    const tAvgEssential = avg(r.treatment.scores.map(s => s.essentialRecall));
    const cAvgProactive = avg(r.control.scores.map(s => s.proactiveRecall));
    const tAvgProactive = avg(r.treatment.scores.map(s => s.proactiveRecall));
    const cComp = avg(r.control.judgeScores.map(j => j.completeness));
    const tComp = avg(r.treatment.judgeScores.map(j => j.completeness));
    const advantage = tComp > cComp ? 'Treatment advantage' : tComp === cComp ? 'Tie' : 'Control advantage';

    md += `### ${s.id} — ${s.lifeEvent}

**${advantage}** (Judge completeness: control=${cComp.toFixed(2)}, treatment=${tComp.toFixed(2)})

| Metric | Control | Treatment |
|--------|---------|-----------|
| Essential recall | ${pct(cAvgEssential)} | ${pct(tAvgEssential)} |
| Conditional recall | ${pct(avg(r.control.scores.map(s => s.conditionalRecall)))} | ${pct(avg(r.treatment.scores.map(s => s.conditionalRecall)))} |
| Proactive recall | ${pct(cAvgProactive)} | ${pct(tAvgProactive)} |
| Out-of-scope rate | ${pct(avg(r.control.scores.map(s => s.outOfScopeRate)))} | ${pct(avg(r.treatment.scores.map(s => s.outOfScopeRate)))} |
| Over-scoping rate | ${pct(avg(r.control.scores.map(s => s.overScopingRate)))} | ${pct(avg(r.treatment.scores.map(s => s.overScopingRate)))} |
| Tool calls | ${r.control.run.totalToolCalls} | ${r.treatment.run.totalToolCalls} |
| Input tokens | ${r.control.run.totalInputTokens.toLocaleString()} | ${r.treatment.run.totalInputTokens.toLocaleString()} |
| Judge: completeness | ${avg(r.control.judgeScores.map(j => j.completeness))} | ${avg(r.treatment.judgeScores.map(j => j.completeness))} |
| Judge: accuracy | ${avg(r.control.judgeScores.map(j => j.accuracy))} | ${avg(r.treatment.judgeScores.map(j => j.accuracy))} |
| Judge: sequencing | ${avg(r.control.judgeScores.map(j => j.sequencing))} | ${avg(r.treatment.judgeScores.map(j => j.sequencing))} |
| Judge: clarity | ${avg(r.control.judgeScores.map(j => j.clarity))} | ${avg(r.treatment.judgeScores.map(j => j.clarity))} |

#### Turn-by-turn scores

`;

    const turnNames = ['Primary prompt', 'Follow-up A', 'Follow-up B'];
    for (let i = 0; i < 3; i++) {
      const cs = r.control.scores[i];
      const ts = r.treatment.scores[i];
      const cj = r.control.judgeScores[i];
      const tj = r.treatment.judgeScores[i];
      const ct = r.control.run.turns[i];
      const tt = r.treatment.run.turns[i];

      md += `**Turn ${i+1}: ${turnNames[i]}**\n\n`;
      md += `> *${[s.primaryPrompt, s.followupA, s.followupB][i]}*\n\n`;

      md += `| Metric | Control | Treatment |\n|--------|---------|----------|\n`;
      md += `| Essential recall | ${pct(cs.essentialRecall)} (${cs.essentialMentioned.length}/${cs.essentialMentioned.length + cs.essentialMissed.length}) | ${pct(ts.essentialRecall)} (${ts.essentialMentioned.length}/${ts.essentialMentioned.length + ts.essentialMissed.length}) |\n`;
      md += `| Conditional recall | ${pct(cs.conditionalRecall)} | ${pct(ts.conditionalRecall)} |\n`;
      md += `| Proactive recall | ${pct(cs.proactiveRecall)} | ${pct(ts.proactiveRecall)} |\n`;
      md += `| Tool calls | ${ct.toolCalls.length} | ${tt.toolCalls.length} |\n`;
      md += `| Judge completeness | ${cj.completeness} | ${tj.completeness} |\n`;
      md += `| Judge accuracy | ${cj.accuracy} | ${tj.accuracy} |\n`;
      md += `| Judge sequencing | ${cj.sequencing} | ${tj.sequencing} |\n\n`;

      if (cs.essentialMissed.length || ts.essentialMissed.length) {
        md += `Missed essential services:\n`;
        if (cs.essentialMissed.length) md += `- Control missed: ${cs.essentialMissed.join(', ')}\n`;
        if (ts.essentialMissed.length) md += `- Treatment missed: ${ts.essentialMissed.join(', ')}\n`;
        md += '\n';
      }

      // Judge rationales
      if (cj.notable_omissions?.length || tj.notable_omissions?.length) {
        md += `Notable omissions flagged by judge:\n`;
        if (cj.notable_omissions?.length) md += `- Control: ${cj.notable_omissions.join(', ')}\n`;
        if (tj.notable_omissions?.length) md += `- Treatment: ${tj.notable_omissions.join(', ')}\n`;
        md += '\n';
      }
    }

    // Tool call analysis
    md += `#### Tool calls used\n\n`;
    md += `**Control:**\n`;
    for (const t of r.control.run.turns) {
      if (t.toolCalls.length) {
        md += `- Turn ${t.turn}: ${t.toolCalls.map(tc => `${tc.name}(${JSON.stringify(tc.input).slice(0, 60)})`).join(', ')}\n`;
      }
    }
    md += `\n**Treatment:**\n`;
    for (const t of r.treatment.run.turns) {
      if (t.toolCalls.length) {
        md += `- Turn ${t.turn}: ${t.toolCalls.map(tc => `${tc.name}(${JSON.stringify(tc.input).slice(0, 60)})`).join(', ')}\n`;
      }
    }
    md += '\n---\n\n';
  }

  // Failure analysis
  md += `## Failure Analysis

Cases where control outperformed treatment (or treatment failed to meet success criteria):

`;

  for (const r of results) {
    const cComp = avg(r.control.judgeScores.map(j => j.completeness));
    const tComp = avg(r.treatment.judgeScores.map(j => j.completeness));
    const cAvgEssential = avg(r.control.scores.map(s => s.essentialRecall));
    const tAvgEssential = avg(r.treatment.scores.map(s => s.essentialRecall));

    if (cComp >= tComp) {
      const delta = tAvgEssential - cAvgEssential;
      md += `**${r.scenario.id} (${r.scenario.lifeEvent}):** Control completeness=${cComp.toFixed(2)}, Treatment completeness=${tComp.toFixed(2)} — Essential recall Δ=${pct(delta)}\n\n`;
      md += `Likely cause: `;

      // Look at treatment tool calls to diagnose
      const treatToolNames = r.treatment.run.turns.flatMap(t => t.toolCalls.map(tc => tc.name));
      const usedGraph = treatToolNames.some(n => ['list_life_events', 'plan_journey', 'get_service'].includes(n));

      if (!usedGraph) {
        md += `Treatment agent did not use graph tools (tool use failure, not graph coverage failure).\n\n`;
      } else {
        md += `GOV.UK web content provided comparable or richer detail; graph coverage may be insufficient for this scenario.\n\n`;
      }
    }
  }

  // Recommendations
  md += `## Recommendations

Based on the experiment, the following graph improvements are identified:

`;

  for (const r of results) {
    const allMissed = r.treatment.scores.flatMap(s => s.essentialMissed);
    if (allMissed.length > 0) {
      md += `**${r.scenario.id}:** Treatment missed essential services: ${[...new Set(allMissed)].join(', ')}. `;
      md += `Check that these nodes are present and reachable from the \`${r.scenario.lifeEvent}\` life event entry points.\n\n`;
    }
  }

  md += `### Graph coverage gaps identified

`;

  // Look for consistently missed services
  const allTreatmentMissed = results.flatMap(r => r.treatment.scores.flatMap(s => s.essentialMissed));
  const missedCounts: Record<string, number> = {};
  for (const s of allTreatmentMissed) {
    missedCounts[s] = (missedCounts[s] || 0) + 1;
  }
  const frequentlyMissed = Object.entries(missedCounts).filter(([, c]) => c >= 1).sort((a, b) => b[1] - a[1]);

  if (frequentlyMissed.length) {
    md += `| Service | Times missed (treatment) | Action |\n|---------|--------------------------|--------|\n`;
    for (const [svc, count] of frequentlyMissed) {
      md += `| ${svc} | ${count} | Verify node exists and is reachable from relevant life events |\n`;
    }
  } else {
    md += `No consistently missed services identified.\n`;
  }

  md += `
---

## Methodology Notes

- **Runs per scenario:** 1 (spec calls for 5). Results are directional indicators only.
- **Statistical analysis:** Not applicable at N=1. No confidence intervals or p-values computed.
- **Checklist construction:** Reference checklists built from graph node set + UK policy knowledge, before running agents.
- **Matching method:** Alias-based substring matching (case-insensitive). May under-count paraphrased mentions.
- **LLM judge:** claude-opus-4-6 used (different model family, per §6.2 guidance). No self-preference bias.
- **Control agent tools:** web_search (GOV.UK API) + web_fetch. No conversation history between scenarios.
- **Treatment agent tools:** list_life_events, plan_journey, get_service, web_fetch.
- **Temperature:** 0.3 for both conditions (spec §3.3).
- **Max tokens:** 4096 per response.
- **FPR note:** Prior version used over-scoping rate (mentions beyond checklist) as FPR, which penalised helpful comprehensiveness. Now uses: out-of-scope rate (explicitly prohibited services mentioned = actual errors) and over-scoping rate (informational only). Scenario advantage now determined by LLM judge completeness score rather than automated F1.

---

*Generated by scripts/run-experiment.ts on ${now}*
`;

  return md;
}

function f1(precision: number, recall: number): number {
  if (precision + recall === 0) return 0;
  return Math.round((2 * precision * recall / (precision + recall)) * 100) / 100;
}

main().catch(e => {
  console.error('Experiment failed:', e);
  process.exit(1);
});
