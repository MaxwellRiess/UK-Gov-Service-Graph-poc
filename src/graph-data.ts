/**
 * graph-data.ts — The service graph
 *
 * Three data structures make up the graph:
 *
 *   NODES       — every government service, deduplicated across life events
 *   EDGES       — typed relationships between services
 *   LIFE_EVENTS — the 13 entry points into the graph (one per life event)
 *
 * Edge types:
 *   REQUIRES → strict ordering; the source must be completed before the target
 *   ENABLES  → the source makes the target accessible or relevant
 *
 * Life events don't appear in the graph themselves — they just point to a
 * set of entry nodes (the services directly triggered by that event).
 * The traversal engine handles discovering everything downstream.
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type ServiceType =
  | 'benefit'       // financial payment to eligible individuals
  | 'entitlement'   // non-financial right or access (free service, discount)
  | 'obligation'    // legal requirement to act
  | 'registration'  // formally registering a fact or entity
  | 'application'   // applying for a decision or assessment
  | 'legal_process' // court or tribunal proceeding
  | 'document'      // obtaining a formal document
  | 'grant';        // one-off financial award

export type EligibilityFactor =
  | 'age'               // age threshold or range
  | 'income'            // earnings or means test
  | 'employment'        // employment status or history
  | 'disability'        // health condition or disability
  | 'terminal_illness'  // terminal diagnosis (often fast-tracks)
  | 'ni_record'         // National Insurance contribution history
  | 'caring'            // providing care to another person
  | 'residency'         // UK residency or habitual residence
  | 'geography'         // specific region or local authority
  | 'family'            // family composition or dependants
  | 'relationship_status' // marital/partnership status
  | 'asset'             // property, savings or capital
  | 'property'          // homeownership or tenancy
  | 'bereavement'       // death of a person
  | 'immigration'       // visa or leave to remain status
  | 'citizenship'       // nationality
  | 'dependency';       // relies on another service first being in place

export interface EligibilityInfo {
  summary:           string;
  universal:         boolean;   // true = virtually anyone qualifies; false = gated criteria
  criteria:          { factor: EligibilityFactor; description: string }[];
  keyQuestions:      string[];  // questions an agent should ask to assess eligibility
  autoQualifiers?:   string[];  // conditions that make eligibility certain — skip further checks
  exclusions?:       string[];  // common reasons someone is NOT eligible
  means_tested:      boolean;
  evidenceRequired?: string[];  // documents / proof typically needed
}

export interface ServiceNode {
  id:          string;
  name:        string;
  dept:        string;      // display name, e.g. "HMRC"
  deptKey:     string;      // lowercase slug for filtering, e.g. "hmrc"
  deadline:    string | null;
  desc:        string;
  govuk_url:   string;      // canonical GOV.UK URL
  serviceType: ServiceType;
  proactive:   boolean;     // agent should volunteer this based on life-event signals
  gated:       boolean;     // only surface after confirming a prerequisite service
  eligibility: EligibilityInfo;
}

export interface Edge {
  from: string;
  to:   string;
  type: 'REQUIRES' | 'ENABLES';
}

export interface LifeEvent {
  id:          string;
  icon:        string;
  name:        string;
  desc:        string;
  entryNodes:  string[];
}

// ─── NODES ────────────────────────────────────────────────────────────────────

export const NODES: Record<string, ServiceNode> = {

  // GRO ──────────────────────────────────────────────────────────────────────
  'gro-register-birth': {
    id: 'gro-register-birth', name: 'Register the birth', dept: 'GRO', deptKey: 'gro',
    deadline: '42 days',
    desc: 'Register at local register office. Gateway to Child Benefit, free childcare and parental leave top-ups.',
    govuk_url: 'https://www.gov.uk/register-birth',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required for every birth in England and Wales. Must be done by a parent or other qualified informant within 42 days.',
      universal: true,
      criteria: [
        { factor: 'family', description: 'Must be a parent, or other qualified informant (e.g. someone present at the birth, or an occupier of the premises where the birth occurred).' },
      ],
      keyQuestions: [
        'Where was the baby born (hospital, home, other)?',
        'Are both parents named on the birth certificate, or just one?',
        'Is the baby\'s name decided?',
      ],
      means_tested: false,
      evidenceRequired: ['Hospital notification of birth or midwife\'s notification', 'Parents\' ID documents'],
    },
  },
  'gro-register-death': {
    id: 'gro-register-death', name: 'Register the death', dept: 'GRO', deptKey: 'gro',
    deadline: '5 days',
    desc: 'Register at local register office. Required before probate, Tell Us Once and bereavement payments.',
    govuk_url: 'https://www.gov.uk/register-a-death',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required for every death in England and Wales. Must be done by a qualified informant (relative, person present at death, etc.) within 5 days.',
      universal: true,
      criteria: [
        { factor: 'bereavement', description: 'A person has died in England or Wales.' },
        { factor: 'family', description: 'Registrant must be a qualified informant: a relative, someone present at the death, or an administrator of the premises.' },
      ],
      keyQuestions: [
        'Do you have the medical certificate of cause of death from the doctor or coroner?',
        'Are you a relative of the deceased?',
        'Did the death occur in England or Wales?',
      ],
      means_tested: false,
      evidenceRequired: ['Medical Certificate of Cause of Death (MCCD)', 'Deceased\'s NHS number and personal details if available'],
    },
  },
  'gro-death-certificate': {
    id: 'gro-death-certificate', name: 'Obtain death certificates', dept: 'GRO', deptKey: 'gro',
    deadline: null,
    desc: 'Order multiple certified copies — banks, insurers and probate all require originals.',
    govuk_url: 'https://www.gov.uk/order-copy-birth-death-marriage-certificate',
    serviceType: 'document',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Anyone can order certified copies of a registered death. Death must have been registered first. Banks, probate and insurers all need originals.',
      universal: true,
      criteria: [
        { factor: 'bereavement', description: 'Death must have been registered before certified copies can be ordered.' },
      ],
      keyQuestions: [
        'How many certified copies do you need? (Recommend at least 5 — banks, insurers, HMRC, probate, pension providers each need one.)',
      ],
      autoQualifiers: ['Death registration completed'],
      means_tested: false,
      evidenceRequired: ['Death registration reference number', 'Fee per copy (currently £11)'],
    },
  },
  'gro-give-notice': {
    id: 'gro-give-notice', name: 'Give notice of marriage', dept: 'GRO', deptKey: 'gro',
    deadline: '28 days before',
    desc: 'At local register office. Legally required at least 28 days before ceremony.',
    govuk_url: 'https://www.gov.uk/marriages-civil-partnerships/giving-notice',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Both parties to a marriage or civil partnership must give notice at their local register office at least 28 days before the ceremony. Legally required.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Both parties must be 18 or over (16-17 with parental consent in exceptional circumstances).' },
        { factor: 'relationship_status', description: 'Neither party must be currently married or in a civil partnership.' },
        { factor: 'residency', description: 'Each party must have lived in the registration district for at least 7 days before giving notice.' },
      ],
      keyQuestions: [
        'Are both parties 18 or over?',
        'Is either party currently married or in a civil partnership?',
        'Have you both lived at your current address for at least 7 days?',
        'Is either party from outside the UK? (Extra documentation may be needed.)',
      ],
      means_tested: false,
      evidenceRequired: ['Passport or birth certificate', 'Proof of current address', 'Decree absolute if previously married', 'Death certificate of former spouse if widowed', 'Immigration documents if not British/Irish citizen'],
    },
  },
  'gro-marriage-cert': {
    id: 'gro-marriage-cert', name: 'Marriage / CP certificate', dept: 'GRO', deptKey: 'gro',
    deadline: null,
    desc: 'Gateway document for name changes, Marriage Allowance and benefit updates.',
    govuk_url: 'https://www.gov.uk/order-copy-birth-death-marriage-certificate',
    serviceType: 'document',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Issued after a marriage or civil partnership ceremony. Acts as the gateway document for name changes, Marriage Allowance, and updating government records.',
      universal: true,
      criteria: [
        { factor: 'relationship_status', description: 'Must have legally married or formed a civil partnership in England or Wales.' },
      ],
      keyQuestions: [
        'Has the ceremony taken place?',
        'How many certified copies do you need? (Name change, DVLA, HMRC, passport each need one.)',
      ],
      autoQualifiers: ['Marriage or civil partnership ceremony completed'],
      means_tested: false,
      evidenceRequired: ['Marriage took place — certificate issued at ceremony or ordered from register office'],
    },
  },

  // HMRC ─────────────────────────────────────────────────────────────────────
  'hmrc-child-benefit': {
    id: 'hmrc-child-benefit', name: 'Child Benefit', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Backdatable 3 months. High Income Charge applies if either parent earns over £60k.',
    govuk_url: 'https://www.gov.uk/child-benefit',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to anyone responsible for a child under 16 (or under 20 in qualifying education). Backdatable 3 months. High Income Child Benefit Charge applies if either parent earns over £60k.',
      universal: true,
      criteria: [
        { factor: 'family', description: 'Responsible for a child under 16, or under 20 if in qualifying education or training.' },
        { factor: 'income', description: 'High Income Child Benefit Charge claws back the payment if either parent earns over £60,000; fully clawed back above £80,000.' },
      ],
      keyQuestions: [
        'Are you responsible for a child under 16?',
        'Does either parent or partner earn over £60,000 per year?',
        'Has the birth been registered?',
      ],
      autoQualifiers: ['Birth registered, no parent earns over £60k'],
      exclusions: ['Not worth claiming if household income over £80,000 — full charge claws back entire benefit. However, still worth claiming to protect NI credits.'],
      means_tested: false,
      evidenceRequired: ['Child\'s birth certificate', 'Bank account details'],
    },
  },
  'hmrc-guardians-allowance': {
    id: 'hmrc-guardians-allowance', name: "Guardian's Allowance", dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: '£21.75/week if raising a child both of whose parents have died (or one has died and the other is untraceable).',
    govuk_url: 'https://www.gov.uk/guardians-allowance',
    serviceType: 'benefit',
    proactive: true,
    gated: true,
    eligibility: {
      summary: "Guardian's Allowance is paid on top of Child Benefit to those raising a child whose parents have both died. In some cases only one parent needs to have died.",
      universal: false,
      criteria: [
        { factor: 'bereavement', description: 'Both parents of the child have died (or one has died and the other is missing, in prison, or in a psychiatric hospital).' },
        { factor: 'family', description: 'Must be claiming Child Benefit for the child.' },
      ],
      keyQuestions: [
        'Are you claiming Child Benefit for the child?',
        'Have both parents died, or is the surviving parent untraceable?',
        'Are you the legal guardian or someone else caring for the child?',
      ],
      means_tested: false,
      evidenceRequired: ['Death certificates for deceased parent(s)', 'Child Benefit claim reference', 'Child\'s birth certificate'],
    },
  },
  'hmrc-statutory-parental-bereavement': {
    id: 'hmrc-statutory-parental-bereavement', name: 'Statutory Parental Bereavement Pay & Leave', dept: 'HMRC', deptKey: 'hmrc',
    deadline: '56 weeks',
    desc: '2 weeks paid leave if a child under 18 dies or a baby is stillborn after 24 weeks of pregnancy.',
    govuk_url: 'https://www.gov.uk/parental-bereavement-pay-leave',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Employees are entitled to 2 weeks of paid parental bereavement leave following the death of a child under 18 or a stillbirth after 24 weeks. Must be taken within 56 weeks of the death. Paid at the statutory flat rate.',
      universal: false,
      criteria: [
        { factor: 'bereavement', description: 'A child under 18 has died, or a baby was stillborn after 24 weeks of pregnancy.' },
        { factor: 'employment', description: 'Must be an employee (any length of service). Statutory Parental Bereavement Pay also requires 26 weeks\' continuous service and earnings above the lower earnings limit.' },
      ],
      keyQuestions: [
        'Has a child under 18 died or was there a stillbirth after 24 weeks?',
        'Are you an employee?',
        'Have you been employed for 26 weeks or more (for pay entitlement)?',
        'When did the death or stillbirth occur? (Must claim within 56 weeks.)',
      ],
      means_tested: false,
      evidenceRequired: ['Notice to employer (no formal form required)', 'Death or stillbirth certificate may be requested'],
    },
  },
  'hmrc-smp': {
    id: 'hmrc-smp', name: 'Statutory Maternity Pay', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Via employer if 26+ weeks employed and earning above lower earnings limit.',
    govuk_url: 'https://www.gov.uk/maternity-pay-leave/pay',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Paid by employer for up to 39 weeks. Requires 26 weeks of continuous employment with the same employer by the 15th week before the due date.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Must have worked for the same employer continuously for at least 26 weeks up to and including the 15th week before the expected week of childbirth.' },
        { factor: 'employment', description: 'Must be earning at least the Lower Earnings Limit (£123/week in 2024/25).' },
      ],
      keyQuestions: [
        'How long have you worked for your current employer?',
        'What is your average weekly earnings?',
        'What is your expected due date?',
      ],
      exclusions: ['Self-employed — claim Maternity Allowance instead.', 'Employed for fewer than 26 weeks with current employer — claim Maternity Allowance.'],
      means_tested: false,
      evidenceRequired: ['MATB1 certificate from midwife or GP (issued from 20 weeks)', 'Written notice to employer of intended leave start date'],
    },
  },
  'hmrc-spp': {
    id: 'hmrc-spp', name: 'Statutory Paternity Pay', dept: 'HMRC', deptKey: 'hmrc',
    deadline: '8 weeks',
    desc: '2 weeks at statutory rate. Must be arranged before baby is 8 weeks old.',
    govuk_url: 'https://www.gov.uk/paternity-pay-leave',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: '1 or 2 weeks of paternity leave and pay. Must be the baby\'s father, partner of the mother, or the adopter\'s partner. Requires 26 weeks of continuous employment.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Continuously employed with the same employer for at least 26 weeks and earning at or above the Lower Earnings Limit.' },
        { factor: 'family', description: 'Must be the biological father, the mother\'s partner (including same-sex), or the co-adopter.' },
      ],
      keyQuestions: [
        'Are you the father, or the partner of the birth mother or adopter?',
        'Have you been employed continuously for at least 26 weeks?',
        'Do you earn above £123/week?',
      ],
      means_tested: false,
      evidenceRequired: ['SC3 form (self-certification) submitted to employer at least 15 weeks before due date'],
    },
  },
  'hmrc-spl': {
    id: 'hmrc-spl', name: 'Shared Parental Leave & Pay', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Split remaining leave/pay between parents. Complex eligibility — both employers involved.',
    govuk_url: 'https://www.gov.uk/shared-parental-leave-and-pay',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Allows eligible parents to split up to 50 weeks of leave and 37 weeks of pay between them. Both parents must individually meet employment/earnings tests.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Both the mother/primary adopter AND the partner must each meet their respective employment and earnings tests.' },
        { factor: 'family', description: 'The mother must curtail her maternity leave to create SPL weeks to share.' },
        { factor: 'dependency', description: 'Mother must be eligible for SMP or Maternity Allowance for SPL to be available.' },
      ],
      keyQuestions: [
        'Is the mother eligible for SMP or Maternity Allowance?',
        'Is the partner employed or self-employed and earning enough to pass the partner eligibility test?',
        'Has the mother decided to end maternity leave early to share it?',
        'Are both employers aware?',
      ],
      means_tested: false,
      evidenceRequired: ['SPLIT forms', 'Written curtailment notice from mother to her employer', 'Partner\'s employer contact details'],
    },
  },
  'hmrc-free-childcare-15': {
    id: 'hmrc-free-childcare-15', name: 'Free childcare — 15 hours', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'From 9 months old. Universal entitlement. Via Tax-Free Childcare account.',
    govuk_url: 'https://www.gov.uk/help-paying-childcare/free-childcare-and-education-for-2-to-4-year-olds',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Universal 15 hours per week free childcare for children aged 9 months to 4 years. No income test. Apply via Childcare Choices / Tax-Free Childcare account.',
      universal: true,
      criteria: [
        { factor: 'age', description: 'Child must be between 9 months and 4 years old.' },
      ],
      keyQuestions: ['How old is the child?'],
      autoQualifiers: ['Child aged 9 months to 4 years'],
      means_tested: false,
      evidenceRequired: ['Government Gateway account', 'Child\'s birth certificate'],
    },
  },
  'hmrc-free-childcare-30': {
    id: 'hmrc-free-childcare-30', name: 'Free childcare — 30 hours', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: '3–4 year olds where both parents work minimum hours.',
    govuk_url: 'https://www.gov.uk/help-paying-childcare/free-childcare-and-education-for-2-to-4-year-olds',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'An additional 15 hours (total 30 hours/week) for 3–4 year olds where both parents (or single parent) are in work earning at least NMW for 16 hours/week and neither earns over £100,000.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Child must be 3 or 4 years old.' },
        { factor: 'employment', description: 'Both parents (or the sole parent) must be in paid work earning at least the equivalent of 16 hours per week at National Minimum Wage.' },
        { factor: 'income', description: 'Neither parent can earn over £100,000 per year.' },
      ],
      keyQuestions: [
        'Is the child 3 or 4 years old?',
        'Are both parents currently in paid work?',
        'Does either parent earn over £100,000 per year?',
      ],
      exclusions: ['Households where either parent earns over £100k.', 'Non-working single parents (entitled to 15 hours only).'],
      means_tested: false,
      evidenceRequired: ['Tax-Free Childcare account eligibility check (reconfirm every 3 months)'],
    },
  },
  'hmrc-tax-free-childcare': {
    id: 'hmrc-tax-free-childcare', name: 'Tax-Free Childcare account', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Government tops up by 25p per £1 saved (max £500/quarter). Cannot use alongside UC childcare element.',
    govuk_url: 'https://www.gov.uk/tax-free-childcare',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'For every £8 a parent pays into their account, the government adds £2 (up to £500 per child per quarter, or £1,000 if disabled). Must be in work and earning at least NMW for 16 hours.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Both parents (or single parent) must be in work earning at least the National Minimum Wage equivalent of 16 hours/week, and neither earns over £100,000.' },
        { factor: 'age', description: 'Child must be under 12 (or under 17 if disabled).' },
      ],
      keyQuestions: [
        'Are both parents in work earning above the minimum threshold?',
        'Is the child under 12?',
        'Are you currently receiving the UC childcare element?',
      ],
      exclusions: ['Cannot be used at the same time as Universal Credit childcare element — must choose one.'],
      means_tested: false,
      evidenceRequired: ['Government Gateway account', 'Childcare provider details'],
    },
  },
  'hmrc-marriage-allowance': {
    id: 'hmrc-marriage-allowance', name: 'Marriage Allowance', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Transfer up to £1,260 of personal allowance if one partner earns below the threshold.',
    govuk_url: 'https://www.gov.uk/marriage-allowance',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Transfer up to £1,260 of unused Personal Allowance to your spouse/civil partner, saving up to £252/year in tax. Backdatable up to 4 years.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'One partner must have income below the Personal Allowance (£12,570/year). The other must be a basic-rate (20%) taxpayer.' },
        { factor: 'relationship_status', description: 'Must be married or in a civil partnership.' },
      ],
      keyQuestions: [
        'Is one partner\'s total income below £12,570 per year?',
        'Is the higher earner a basic-rate (20%) taxpayer (not higher or additional rate)?',
      ],
      autoQualifiers: ['One partner earns below £12,570 and the other is a basic-rate taxpayer'],
      exclusions: ['Cannot claim if either partner pays higher (40%) or additional (45%) rate tax.'],
      means_tested: false,
      evidenceRequired: ['Government Gateway account for the lower earner to apply'],
    },
  },
  'hmrc-cancel-marriage-allowance': {
    id: 'hmrc-cancel-marriage-allowance', name: 'Cancel Marriage Allowance', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Must be cancelled after divorce or separation. Done via Self Assessment or HMRC phone.',
    govuk_url: 'https://www.gov.uk/marriage-allowance/if-your-circumstances-change',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'If you were claiming Marriage Allowance and have now separated or divorced, it must be cancelled. Failure to cancel can result in an underpayment of tax.',
      universal: false,
      criteria: [
        { factor: 'relationship_status', description: 'Previously claimed Marriage Allowance and relationship has now ended (separated, divorced, or partner died).' },
      ],
      keyQuestions: [
        'Were you or your ex-partner claiming Marriage Allowance?',
        'On what date did you separate or receive the final divorce order?',
      ],
      autoQualifiers: ['Marriage Allowance was in place and divorce/separation has occurred'],
      means_tested: false,
      evidenceRequired: ['Government Gateway account or contact HMRC by phone'],
    },
  },
  'hmrc-update-records': {
    id: 'hmrc-update-records', name: 'Update HMRC records', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Name, address and marital status. Affects tax code, benefits and correspondence.',
    govuk_url: 'https://www.gov.uk/tell-hmrc-change-of-details',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Notify HMRC of any change to name, address or marital status. Affects tax code, correspondence and benefit entitlements. Required after moving, marriage, divorce or name change.',
      universal: true,
      criteria: [
        { factor: 'employment', description: 'Any taxpayer (employed, self-employed or receiving a pension) who has changed name, address or marital status.' },
      ],
      keyQuestions: [
        'Has your name changed (e.g. after marriage or deed poll)?',
        'Have you moved address?',
        'Has your marital status changed?',
      ],
      means_tested: false,
      evidenceRequired: ['Marriage certificate or deed poll if name change', 'Government Gateway account or Personal Tax Account'],
    },
  },
  'hmrc-sdlt': {
    id: 'hmrc-sdlt', name: 'Stamp Duty Land Tax return', dept: 'HMRC', deptKey: 'hmrc',
    deadline: '14 days',
    desc: 'File within 14 days of completion. Solicitor usually handles. Required even if no tax is due.',
    govuk_url: 'https://www.gov.uk/stamp-duty-land-tax',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'A return must be filed within 14 days of completing a property purchase in England or Northern Ireland. The solicitor usually handles this. Must be filed even if no tax is due.',
      universal: true,
      criteria: [
        { factor: 'property', description: 'Any purchase of land or property in England (or Northern Ireland) — thresholds vary for first-time buyers, additional properties, etc.' },
      ],
      keyQuestions: [
        'What is the purchase price of the property?',
        'Is this a first home, second home, or buy-to-let?',
        'Are you a first-time buyer? (Higher threshold of £425,000 applies.)',
      ],
      autoQualifiers: ['Property purchase completed in England'],
      means_tested: false,
      evidenceRequired: ['Completion statement', 'SDLT1 form (usually filed by solicitor)'],
    },
  },
  'hmrc-lisa': {
    id: 'hmrc-lisa', name: 'Lifetime ISA withdrawal', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Claim 25% government bonus. Conveyancer requests from ISA provider before completion.',
    govuk_url: 'https://www.gov.uk/lifetime-isa',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'First-time buyers can use their LISA savings (including the 25% government bonus) to purchase a property. Conveyancer requests the funds directly from the ISA provider before completion.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must have opened the LISA before age 40, and be at least 18.' },
        { factor: 'property', description: 'Property must cost £450,000 or less and be the buyer\'s first home.' },
      ],
      keyQuestions: [
        'Did you open a Lifetime ISA before age 40?',
        'Is this your first property purchase?',
        'Does the property cost £450,000 or less?',
      ],
      exclusions: ['Not available for second homes or existing property owners.', '25% withdrawal penalty if used for non-qualifying purposes.'],
      means_tested: false,
      evidenceRequired: ['LISA account details', 'Conveyancer handles request process from ISA provider'],
    },
  },
  'hmrc-iht400': {
    id: 'hmrc-iht400', name: 'Inheritance Tax return (IHT400)', dept: 'HMRC', deptKey: 'hmrc',
    deadline: '6 months',
    desc: 'If estate exceeds £325k threshold. Tax must be paid before probate is granted.',
    govuk_url: 'https://www.gov.uk/inheritance-tax',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Required if the estate\'s value exceeds the nil-rate band (£325,000, or up to £500,000 with the residence nil-rate band). Tax must be paid within 6 months of death — before probate is granted.',
      universal: false,
      criteria: [
        { factor: 'asset', description: 'Estate value exceeds the nil-rate band (£325,000, or up to £175,000 more with the residence nil-rate band if leaving a home to direct descendants).' },
        { factor: 'bereavement', description: 'Applies to the estate of a deceased person in England, Wales or Northern Ireland.' },
      ],
      keyQuestions: [
        'What is the estimated total value of the estate (property, savings, investments, possessions)?',
        'Did the deceased leave a property to their children or grandchildren?',
        'Did they make significant gifts in the last 7 years?',
        'Was any of their nil-rate band unused from a predeceased spouse?',
      ],
      means_tested: false,
      evidenceRequired: ['IHT400 form and supplementary schedules', 'Valuations of all assets', 'Details of gifts made in the last 7 years', 'Copy of will'],
    },
  },
  'hmrc-p45': {
    id: 'hmrc-p45', name: 'Obtain P45 from employer', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Employer must provide on last day. Required for new job or benefit claim.',
    govuk_url: 'https://www.gov.uk/paye-forms-p45-p60-p11d/p45',
    serviceType: 'document',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'All employees are entitled to a P45 when leaving a job. The employer is legally required to issue it. Needed for a new employer, tax refund, or benefit claim.',
      universal: true,
      criteria: [
        { factor: 'employment', description: 'Must have been employed under PAYE and left that employment.' },
      ],
      keyQuestions: [
        'Did you receive your P45 on your last day?',
        'If not, have you contacted your former employer to request it?',
      ],
      means_tested: false,
      evidenceRequired: ['Employer provides P45 — no application needed'],
    },
  },
  'hmrc-tax-refund': {
    id: 'hmrc-tax-refund', name: 'Income tax refund (P50)', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'If you have overpaid PAYE and are not returning to work in the same tax year.',
    govuk_url: 'https://www.gov.uk/claim-tax-refund/you-get-a-pension',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Claim a refund if you have overpaid PAYE income tax during the year, typically after losing a job mid-year and not returning to work before April 5th.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Overpaid income tax via PAYE, typically after job loss mid-tax year.' },
        { factor: 'income', description: 'Not returning to work or starting a taxable pension in the same tax year — if you are, wait for PAYE to adjust automatically.' },
      ],
      keyQuestions: [
        'Did you leave your job before the end of the tax year (April 5th)?',
        'Are you planning to return to work before April 5th?',
        'Are you claiming Universal Credit (HMRC automatically refunds overdue tax)?',
      ],
      means_tested: false,
      evidenceRequired: ['P45 from former employer', 'P50 form for mid-year claim'],
    },
  },
  'hmrc-self-assessment': {
    id: 'hmrc-self-assessment', name: 'Register for Self Assessment', dept: 'HMRC', deptKey: 'hmrc',
    deadline: '5 Oct (yr 2)',
    desc: 'Required for sole traders and company directors. Register by 5 October in second year of trading.',
    govuk_url: 'https://www.gov.uk/register-for-self-assessment',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required for the self-employed, company directors, landlords, and those with income not taxed at source. Register by 5 October in the second year of trading.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Self-employed, company director, or earning income not taxed via PAYE (rental, savings interest, dividends, foreign income).' },
        { factor: 'income', description: 'Total income over £100,000, or Child Benefit claimant where income exceeds £60,000.' },
      ],
      keyQuestions: [
        'Are you self-employed or a company director?',
        'Do you receive rental income or other income not taxed at source?',
        'Is your total income over £100,000?',
      ],
      autoQualifiers: ['Started trading as self-employed', 'Registered as a limited company director'],
      means_tested: false,
      evidenceRequired: ['National Insurance number', 'UTR (Unique Taxpayer Reference) issued by HMRC after registration'],
    },
  },
  'hmrc-corporation-tax': {
    id: 'hmrc-corporation-tax', name: 'Register for Corporation Tax', dept: 'HMRC', deptKey: 'hmrc',
    deadline: '3 months',
    desc: 'Required within 3 months of starting to trade. Limited companies only.',
    govuk_url: 'https://www.gov.uk/register-for-corporation-tax',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'All limited companies must register for Corporation Tax within 3 months of starting to trade, even if making a loss. Applies to any company registered at Companies House.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'All UK-registered limited companies, regardless of profitability or size.' },
        { factor: 'dependency', description: 'Requires Companies House registration to be in place first.' },
      ],
      keyQuestions: [
        'Has the company started trading or received income?',
        'When did the company start trading?',
      ],
      autoQualifiers: ['Limited company registered at Companies House'],
      means_tested: false,
      evidenceRequired: ['Companies House registration number (CRN)', 'Registered office address', 'Business start date'],
    },
  },
  'hmrc-vat': {
    id: 'hmrc-vat', name: 'VAT registration', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Mandatory if turnover exceeds £90k. Voluntary registration below threshold can be beneficial.',
    govuk_url: 'https://www.gov.uk/vat-registration',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Mandatory once taxable turnover exceeds £90,000 in any rolling 12-month period. Voluntary registration below the threshold can allow VAT reclaim on purchases.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Taxable turnover has exceeded or is expected to exceed £90,000 in a rolling 12-month period.' },
      ],
      keyQuestions: [
        'Has your taxable turnover exceeded £90,000 in the last 12 months?',
        'Do you expect to exceed £90,000 in the next 30 days?',
        'Would voluntary registration be beneficial (e.g. primarily B2B sales)?',
      ],
      means_tested: false,
      evidenceRequired: ['Business details', 'Turnover evidence', 'Bank account for repayments'],
    },
  },
  'hmrc-paye': {
    id: 'hmrc-paye', name: 'Register as employer (PAYE)', dept: 'HMRC', deptKey: 'hmrc',
    deadline: 'Before 1st payday',
    desc: 'Required before first payday if employing anyone.',
    govuk_url: 'https://www.gov.uk/register-employer',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Any business employing workers who earn above the Lower Earnings Limit or receive expenses/benefits must register as an employer with HMRC before the first payday.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Taking on one or more employees who will earn above £123/week, or who will receive expenses or benefits.' },
      ],
      keyQuestions: [
        'Are you taking on any employees?',
        'Will they earn above £123 per week?',
        'When is the first payday?',
      ],
      autoQualifiers: ['About to pay an employee for the first time'],
      means_tested: false,
      evidenceRequired: ['Business name and address', 'Nature of business', 'Date of first payday'],
    },
  },
  'hmrc-mtd': {
    id: 'hmrc-mtd', name: 'Making Tax Digital enrolment', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Mandatory for VAT-registered businesses. Phased rollout for income tax from 2026.',
    govuk_url: 'https://www.gov.uk/guidance/use-making-tax-digital-for-vat',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Mandatory for all VAT-registered businesses — must keep digital records and file VAT returns via MTD-compatible software. Income Tax MTD rolls out from April 2026 for self-employed/landlords with income over £50k.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Mandatory for all VAT-registered businesses. Phased in for income tax self-assessment from 2026.' },
        { factor: 'income', description: 'MTD for Income Tax applies from April 2026 to sole traders and landlords with income over £50,000.' },
      ],
      keyQuestions: [
        'Are you VAT registered?',
        'Do you use MTD-compatible accounting software?',
        'Is your self-employed or rental income over £50,000?',
      ],
      autoQualifiers: ['VAT registered'],
      means_tested: false,
      evidenceRequired: ['MTD-compatible software (e.g. Xero, QuickBooks, FreeAgent)', 'VAT registration number'],
    },
  },
  'hmrc-register-sole-trader': {
    id: 'hmrc-register-sole-trader', name: 'Register as sole trader', dept: 'HMRC', deptKey: 'hmrc',
    deadline: '5 Oct (yr 2)',
    desc: 'Tell HMRC you are self-employed. Done via Self Assessment registration.',
    govuk_url: 'https://www.gov.uk/set-up-sole-trader',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Anyone starting to work for themselves as a sole trader must register with HMRC. Done via the Self Assessment registration process. Deadline is 5 October in the second tax year of trading.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Has started to trade as a sole trader (self-employed), earning income from their own business.' },
      ],
      keyQuestions: [
        'When did you start trading?',
        'What is your main business activity?',
        'Do you already have a National Insurance number?',
      ],
      means_tested: false,
      evidenceRequired: ['National Insurance number', 'UTR issued after registration'],
    },
  },
  'hmrc-carers-credit': {
    id: 'hmrc-carers-credit', name: "Carer's Credit", dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'National Insurance credits to protect State Pension while caring. For those not claiming Carer\'s Allowance.',
    govuk_url: 'https://www.gov.uk/carers-credit',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Fills gaps in your NI record while you are caring (20+ hours/week) but not receiving Carer\'s Allowance. Protects your future State Pension entitlement.',
      universal: false,
      criteria: [
        { factor: 'caring', description: 'Caring for one or more people for at least 20 hours per week who receives a qualifying disability benefit.' },
        { factor: 'ni_record', description: 'Not already receiving NI credits through Carer\'s Allowance, UC, or earnings above the Lower Earnings Limit.' },
      ],
      keyQuestions: [
        'Are you caring for someone at least 20 hours per week?',
        'Does the person you care for receive PIP, Attendance Allowance, or another qualifying disability benefit?',
        'Are you already receiving Carer\'s Allowance?',
        'Are you earning enough to pay Class 1 or 2 NI contributions?',
      ],
      exclusions: ['Not available if already receiving Carer\'s Allowance — that benefit already provides NI credits.'],
      means_tested: false,
      evidenceRequired: ['Evidence of caring role (CA9176 form)', 'Disability benefit details for the person cared for'],
    },
  },
  'hmrc-child-benefit-transfer': {
    id: 'hmrc-child-benefit-transfer', name: 'Child Benefit transfer', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Notify if child now lives with different parent after separation. Only one claimant permitted.',
    govuk_url: 'https://www.gov.uk/child-benefit/change-of-circumstances',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'After separation, only one parent can claim Child Benefit per child. If the child\'s living arrangements change, Child Benefit must be transferred to the main carer.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Child has moved to live primarily with a different parent after separation.' },
        { factor: 'relationship_status', description: 'Parents have separated and current Child Benefit claimant is no longer the main carer.' },
      ],
      keyQuestions: [
        'Who does the child primarily live with now?',
        'Who is currently claiming Child Benefit?',
        'On what date did the child start living with the new main carer?',
      ],
      means_tested: false,
      evidenceRequired: ['Government Gateway account of new claimant', 'Child\'s details and date of change'],
    },
  },
  'hmrc-ni-check': {
    id: 'hmrc-ni-check', name: 'Check & top up NI record', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Check for gaps before retiring. Voluntary contributions can fill missing years.',
    govuk_url: 'https://www.gov.uk/check-national-insurance-record',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Anyone can check their NI record online for free via their Personal Tax Account. Gaps can be filled with voluntary Class 3 contributions. Critical to do before retirement.',
      universal: true,
      criteria: [
        { factor: 'ni_record', description: 'Particularly important for people approaching State Pension age, or those who have had periods out of work, self-employment, or living abroad.' },
      ],
      keyQuestions: [
        'How many qualifying NI years do you have?',
        'Are there any gaps in your record?',
        'How many years until you reach State Pension age?',
        'Would it be cost-effective to fill any gaps?',
      ],
      means_tested: false,
      evidenceRequired: ['Government Gateway login', 'National Insurance number'],
    },
  },
  'hmrc-tax-on-pension': {
    id: 'hmrc-tax-on-pension', name: 'Income tax on pension', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'State Pension is taxable income. PAYE applied to private/workplace pension automatically.',
    govuk_url: 'https://www.gov.uk/tax-on-pension',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'State Pension is taxable income, though paid without deduction. Private and workplace pensions are taxed via PAYE. Anyone whose total income exceeds the Personal Allowance (£12,570) will owe tax.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Receiving State Pension, private pension or workplace pension.' },
        { factor: 'income', description: 'Combined income from all sources exceeds the Personal Allowance (£12,570 in 2024/25).' },
      ],
      keyQuestions: [
        'What is the total of your State Pension, private pension, and any other income?',
        'Do you have a pension provider handling PAYE automatically?',
        'Have you checked your tax code is correct?',
      ],
      means_tested: false,
      evidenceRequired: ['P60 from pension provider', 'State Pension confirmation letter'],
    },
  },

  // DWP ──────────────────────────────────────────────────────────────────────
  'dwp-tell-us-once': {
    id: 'dwp-tell-us-once', name: 'Tell Us Once', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Notifies HMRC, DVLA, DWP, passport office and local authority in one step after a death.',
    govuk_url: 'https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once',
    serviceType: 'registration',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Available in most of England, Wales and Scotland after a death is registered. Notifies up to 23 government organisations in a single interaction. Saves significant time and effort.',
      universal: true,
      criteria: [
        { factor: 'bereavement', description: 'Death registered in England, Scotland or most of Wales (not available in all areas).' },
      ],
      keyQuestions: [
        'Has the death been registered?',
        'Do you have the Tell Us Once reference number from the register office?',
      ],
      autoQualifiers: ['Death registration completed — reference number provided at registration'],
      means_tested: false,
      evidenceRequired: ['Tell Us Once reference number (given by registrar)', 'Deceased\'s NI number and other details'],
    },
  },
  'dwp-bereavement-support': {
    id: 'dwp-bereavement-support', name: 'Bereavement Support Payment', dept: 'DWP', deptKey: 'dwp',
    deadline: '21 months',
    desc: 'If partner died, you are under State Pension age, and they had a NI record. Lump sum plus monthly payments.',
    govuk_url: 'https://www.gov.uk/bereavement-support-payment',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'A lump sum (up to £3,500) plus up to 18 monthly payments (up to £350/month) if your spouse or civil partner died and you are under State Pension age. Must claim within 3 months for full amount.',
      universal: false,
      criteria: [
        { factor: 'bereavement', description: 'Spouse or civil partner died on or after 6 April 2017.' },
        { factor: 'age', description: 'Must have been under State Pension age (66) at the time of the partner\'s death.' },
        { factor: 'ni_record', description: 'Deceased must have paid at least 25 weeks of Class 1 or 2 NI contributions, or died from a work-related accident or disease.' },
      ],
      keyQuestions: [
        'Was your spouse or civil partner under State Pension age when they died?',
        'Were they working and paying NI contributions?',
        'When did they die? (Claim within 3 months for maximum payment.)',
        'Do you have children? (Higher rate applies if you have children.)',
      ],
      exclusions: ['Not available if partner died before 6 April 2017 (different scheme applied).', 'Not available if you were cohabiting but not married or in a civil partnership.'],
      means_tested: false,
      evidenceRequired: ['Death certificate', 'Marriage or civil partnership certificate', 'NI numbers for both parties'],
    },
  },
  'dwp-funeral-payment': {
    id: 'dwp-funeral-payment', name: 'Funeral Expenses Payment', dept: 'DWP', deptKey: 'dwp',
    deadline: '6 months',
    desc: 'One-off payment toward funeral costs if you are on a qualifying benefit. Must claim within 6 months of the funeral.',
    govuk_url: 'https://www.gov.uk/funeral-payments',
    serviceType: 'grant',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Helps pay for funeral costs if you or your partner receive a qualifying benefit such as Universal Credit, Pension Credit, Income Support, or Housing Benefit. Paid back from the deceased\'s estate if there are sufficient funds. Must claim within 6 months of the funeral.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'You or your partner must be receiving Universal Credit, Pension Credit, Income Support, income-based JSA, income-related ESA, Housing Benefit, or the child tax credit and working tax credit element at the maximum rate.' },
        { factor: 'bereavement', description: 'You are responsible for the funeral costs of a partner, close relative, or close friend where there is no other close relative able to pay.' },
      ],
      keyQuestions: [
        'Are you or your partner receiving a qualifying benefit?',
        'Are you the person responsible for the funeral costs?',
        'Is there a close relative of the deceased who could be expected to pay instead?',
        'When did the funeral take place? (Must claim within 6 months.)',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of qualifying benefit', 'Funeral bill or invoice from funeral director', 'Death certificate'],
    },
  },
  'dwp-state-pension': {
    id: 'dwp-state-pension', name: 'State Pension claim', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Not automatic — must be actively claimed. Apply up to 4 months before State Pension age.',
    govuk_url: 'https://www.gov.uk/new-state-pension/eligibility',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Not paid automatically — must be claimed. Apply up to 4 months before reaching State Pension age (currently 66). Full new State Pension (£221.20/week in 2024/25) requires 35 qualifying NI years.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must have reached State Pension age (currently 66 for men and women).' },
        { factor: 'ni_record', description: 'Need at least 10 qualifying years of NI contributions or credits to receive any State Pension; 35 years for the full amount.' },
      ],
      keyQuestions: [
        'Have you reached State Pension age?',
        'How many qualifying NI years do you have?',
        'Were you ever in a contracted-out workplace pension? (This may reduce your State Pension.)',
        'Would you like to defer your State Pension to get a higher weekly amount later?',
      ],
      autoQualifiers: ['Reached State Pension age with 35+ qualifying NI years'],
      means_tested: false,
      evidenceRequired: ['NI number', 'Bank account details for payment'],
    },
  },
  'dwp-pension-credit': {
    id: 'dwp-pension-credit', name: 'Pension Credit', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Tops up income to £218/week (single). Gateway benefit — unlocks Winter Fuel Payment and free TV Licence.',
    govuk_url: 'https://www.gov.uk/pension-credit',
    serviceType: 'benefit',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Tops up weekly income to at least £218.15 (single) or £332.95 (couple) in 2024/25. Gateway benefit — unlocks Winter Fuel Payment, free TV Licence (75+) and other entitlements. About 1 in 3 eligible pensioners don\'t claim.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must have reached State Pension age (currently 66).' },
        { factor: 'income', description: 'Weekly income below £218.15 (single) or £332.95 (couple). Savings above £10,000 reduce entitlement.' },
      ],
      keyQuestions: [
        'Have you reached State Pension age?',
        'What is your weekly income from all sources (State Pension, private pensions, benefits)?',
        'Do you have savings over £10,000?',
        'Do you have any disability or caring responsibilities? (Extra amounts may apply.)',
      ],
      autoQualifiers: ['State Pension age reached and income clearly below threshold'],
      means_tested: true,
      evidenceRequired: ['Bank statements', 'Pension and income details', 'Proof of savings and capital'],
    },
  },
  'dwp-winter-fuel': {
    id: 'dwp-winter-fuel', name: 'Winter Fuel Payment', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Now only if you receive Pension Credit or another qualifying benefit (changed 2024).',
    govuk_url: 'https://www.gov.uk/winter-fuel-payment',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Annual payment of £200–£300 to help with heating costs. From winter 2024/25, only available to those receiving Pension Credit or another means-tested qualifying benefit. No longer automatic for all over-State-Pension-age.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Born before the qualifying date (changes annually — typically born before September of the relevant year).' },
        { factor: 'dependency', description: 'Must receive Pension Credit, Universal Credit, income-related ESA or JSA, or Income Support.' },
      ],
      keyQuestions: [
        'Are you receiving Pension Credit or another qualifying means-tested benefit?',
      ],
      autoQualifiers: ['Receiving Pension Credit'],
      exclusions: ['No longer available to those over State Pension age who are not on a qualifying benefit — major policy change from winter 2024.'],
      means_tested: false,
      evidenceRequired: ['Automatic if receiving Pension Credit — no separate application needed'],
    },
  },
  'dwp-attendance-allowance': {
    id: 'dwp-attendance-allowance', name: 'Attendance Allowance', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'For over-65s with care needs. Not means-tested. Two rates depending on day/night needs.',
    govuk_url: 'https://www.gov.uk/attendance-allowance',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'For people who have reached State Pension age and need help with personal care due to a physical or mental condition. Not means-tested. Two rates: lower (day or night care) and higher (day and night care).',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must have reached State Pension age (66 or over).' },
        { factor: 'disability', description: 'Need help with personal care, supervision, or watching over due to a physical or mental condition, for at least 6 months (unless terminally ill).' },
      ],
      keyQuestions: [
        'Are you 66 or older?',
        'Do you need help with washing, dressing, eating, or other personal care?',
        'Do you need supervision or watching over due to your condition?',
        'Have you had these needs for at least 6 months? (Or are you terminally ill?)',
      ],
      autoQualifiers: ['Terminally ill — claim using Special Rules immediately (DS1500/SR1 form)'],
      exclusions: ['Under State Pension age — claim PIP instead.'],
      means_tested: false,
      evidenceRequired: ['AA1 claim form', 'Medical evidence from GP or specialist helpful', 'Carer details if applicable'],
    },
  },
  'dwp-pip': {
    id: 'dwp-pip', name: 'Personal Independence Payment (PIP)', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'For under-65s with disability. Not means-tested. Daily living and/or mobility components.',
    govuk_url: 'https://www.gov.uk/pip',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'For people aged 16 to 64 with a long-term health condition or disability. Not means-tested. Has daily living and mobility components, each at standard or enhanced rate. Opens access to many other benefits.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must be aged 16 to 64 (under State Pension age). Those over 65 who did not have PIP before should claim Attendance Allowance instead.' },
        { factor: 'disability', description: 'Long-term physical or mental health condition or disability affecting daily living or mobility. Must have had difficulties for at least 3 months and expect them to continue for at least 9 months.' },
        { factor: 'residency', description: 'Usually live in England, Scotland or Wales.' },
      ],
      keyQuestions: [
        'Are you aged 16 to 64?',
        'Do you have a long-term health condition or disability?',
        'Does it affect your daily living (washing, dressing, cooking, managing medication)?',
        'Does it affect your mobility (planning a journey, moving around)?',
        'Have you had difficulties for at least 3 months and do you expect them to last?',
      ],
      autoQualifiers: ['Terminal illness — claim via Special Rules (faster decision, no assessment required)'],
      exclusions: ['Over State Pension age — claim Attendance Allowance instead.', 'Subject to immigration control in most cases.'],
      means_tested: false,
      evidenceRequired: ['PIP2 questionnaire (How your disability affects you)', 'Medical evidence from GP or specialist', 'Face-to-face or phone assessment with health professional'],
    },
  },
  'dwp-universal-credit': {
    id: 'dwp-universal-credit', name: 'Universal Credit', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Main out-of-work or low-income benefit. Report change of circumstances within 1 month.',
    govuk_url: 'https://www.gov.uk/universal-credit',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'The main means-tested benefit for those out of work or on a low income. Replaced 6 legacy benefits. Includes a standard allowance plus elements for children, housing, disability, and caring.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must be 18 or over (some 16–17 year olds qualify in specific circumstances).' },
        { factor: 'income', description: 'Income must be low enough to qualify (savings over £16,000 disqualify).' },
        { factor: 'residency', description: 'Must be habitually resident in the UK.' },
      ],
      keyQuestions: [
        'Are you 18 or over?',
        'Are you out of work or on a low income?',
        'Do you have savings over £16,000?',
        'Are you in a couple? (Joint claim is usually required.)',
        'Do you have children, a disability, or caring responsibilities? (These add extra elements.)',
      ],
      exclusions: ['Savings over £16,000.', 'Some immigration statuses.', 'Receiving legacy benefits — transition managed by DWP.'],
      means_tested: true,
      evidenceRequired: ['Photo ID', 'NI number', 'Bank statements (last 3 months)', 'Proof of address', 'Rent details if applicable'],
    },
  },
  'dwp-new-style-jsa': {
    id: 'dwp-new-style-jsa', name: "New Style Jobseeker's Allowance", dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Contributory — paid alongside UC if NI record qualifies. 6-month time limit.',
    govuk_url: 'https://www.gov.uk/jobseekers-allowance/new-style-jsa',
    serviceType: 'benefit',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Contributory benefit for jobseekers based on NI record. Paid for up to 6 months alongside Universal Credit. Requires 2 full tax years of Class 1 NI contributions.',
      universal: false,
      criteria: [
        { factor: 'ni_record', description: 'Must have paid Class 1 NI contributions in both of the last two complete tax years before the year of claim.' },
        { factor: 'employment', description: 'Must be unemployed or working fewer than 16 hours per week, and actively seeking work.' },
        { factor: 'age', description: 'Must be 18 or over and under State Pension age.' },
      ],
      keyQuestions: [
        'Have you been in paid employment and paying NI contributions in the last two tax years?',
        'Are you actively looking for work?',
        'Are you currently receiving Universal Credit?',
      ],
      exclusions: ['Time-limited to 6 months.', 'Not available if income or capital would disqualify in isolation (but can be paid alongside UC).'],
      means_tested: false,
      evidenceRequired: ['P45 from employer', 'NI number', 'Bank details', 'CV and job-seeking evidence'],
    },
  },
  'dwp-new-style-esa': {
    id: 'dwp-new-style-esa', name: 'New Style ESA', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'If health prevents work. Requires fit note from GP and Work Capability Assessment.',
    govuk_url: 'https://www.gov.uk/employment-support-allowance/eligibility',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Contributory benefit for people whose health condition prevents or limits their ability to work. Requires NI contributions in the last two tax years and a fit note from a GP.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Health condition or disability that prevents or significantly limits ability to work.' },
        { factor: 'ni_record', description: 'Must have paid sufficient Class 1 or Class 2 NI contributions in both of the last two complete tax years.' },
      ],
      keyQuestions: [
        'Does your health condition prevent you from working?',
        'Do you have a fit note from your GP?',
        'Have you paid NI contributions in the last two tax years?',
      ],
      means_tested: false,
      evidenceRequired: ['Fit note from GP', 'NI number', 'Medical evidence', 'Work Capability Assessment (scheduled by DWP)'],
    },
  },
  'dwp-mandatory-reconsideration': {
    id: 'dwp-mandatory-reconsideration', name: 'Mandatory Reconsideration', dept: 'DWP', deptKey: 'dwp',
    deadline: '1 month',
    desc: 'Formal review of a DWP benefit decision. Must be requested before you can appeal to a tribunal. Apply within 1 month of the decision letter.',
    govuk_url: 'https://www.gov.uk/mandatory-reconsideration',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'If you disagree with a DWP decision on Universal Credit, JSA, ESA, PIP, or other benefits, you must request a Mandatory Reconsideration before you can appeal to a tribunal. Must be requested within 1 month of the decision letter.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'A DWP benefit decision has been received (e.g. UC, JSA, ESA, PIP award or change). Mandatory Reconsideration must happen before a tribunal appeal.' },
      ],
      keyQuestions: [
        'What benefit decision do you want to challenge?',
        'When was the decision letter dated? (Must request within 1 month.)',
        'Do you have additional evidence or information to provide?',
      ],
      means_tested: false,
      evidenceRequired: ['Decision letter from DWP', 'Any supporting medical or financial evidence not previously considered'],
    },
  },
  'dwp-maternity-allowance': {
    id: 'dwp-maternity-allowance', name: 'Maternity Allowance', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'If not eligible for SMP. For self-employed or recently employed. Up to 39 weeks.',
    govuk_url: 'https://www.gov.uk/maternity-allowance',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'For those not eligible for Statutory Maternity Pay — typically self-employed, recently changed jobs, or agency workers. Up to 39 weeks of payments.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Must have been employed or self-employed for at least 26 weeks in the 66 weeks before the due date.' },
        { factor: 'employment', description: 'Must have earned at least £30/week for 13 of the 66 weeks before due date.' },
      ],
      keyQuestions: [
        'Are you self-employed or not eligible for SMP from your employer?',
        'Have you worked for at least 26 weeks in the last 66 weeks?',
        'Did you earn at least £30 per week during those weeks?',
      ],
      exclusions: ['Not available if eligible for Statutory Maternity Pay from an employer.'],
      means_tested: false,
      evidenceRequired: ['MATB1 certificate', 'Employment or self-employment evidence', 'Payslips or accounts', 'MA1 claim form'],
    },
  },
  'dwp-sure-start-grant': {
    id: 'dwp-sure-start-grant', name: 'Sure Start Maternity Grant', dept: 'DWP', deptKey: 'dwp',
    deadline: '3 months',
    desc: 'One-off £500 if on qualifying benefits. Usually first child only. Apply within 3 months of birth.',
    govuk_url: 'https://www.gov.uk/sure-start-maternity-grant',
    serviceType: 'grant',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'One-off £500 payment to help with costs of a new baby. Usually only for the first child. Must be on a qualifying benefit. Apply from 11 weeks before due date to 3 months after birth.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Expecting a baby, have recently had a baby (within 3 months), or are adopting. Generally for first child only unless specific circumstances apply.' },
        { factor: 'income', description: 'Receiving Universal Credit, Income Support, income-related ESA, Pension Credit, Child Tax Credit (with no Working Tax Credit) or certain other qualifying benefits.' },
      ],
      keyQuestions: [
        'Are you receiving Universal Credit, Income Support, or Pension Credit?',
        'Is this your first child? (Or are there special circumstances for a later child?)',
        'How many weeks pregnant are you, or how old is the baby?',
      ],
      exclusions: ['Usually not available for second and subsequent children if there are other children under 16 in the family.'],
      means_tested: true,
      evidenceRequired: ['Evidence of qualifying benefit', 'MATB1 form or birth certificate', 'SF100 form'],
    },
  },
  'dwp-ni-credits': {
    id: 'dwp-ni-credits', name: 'National Insurance credits', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Automatically awarded on UC or JSA. Protects State Pension record while not working.',
    govuk_url: 'https://www.gov.uk/national-insurance-credits',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'NI credits fill gaps in your NI record when you are not working and paying contributions. Automatically awarded with UC, JSA, ESA, and certain other benefits. Protects your State Pension entitlement.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Receiving qualifying benefits: Universal Credit, New Style JSA, New Style ESA, Carer\'s Allowance, or Child Benefit for a child under 12.' },
      ],
      keyQuestions: [
        'Are you receiving Universal Credit, JSA or ESA?',
        'Are you claiming Child Benefit for a child under 12?',
        'Are you a carer and not receiving Carer\'s Allowance?',
      ],
      autoQualifiers: ['Receiving Universal Credit', 'Receiving New Style JSA', 'Claiming Child Benefit for child under 12'],
      means_tested: false,
      evidenceRequired: ['No separate application if receiving qualifying benefits — awarded automatically'],
    },
  },
  'dwp-carers-allowance': {
    id: 'dwp-carers-allowance', name: "Carer's Allowance", dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'If caring 35+ hours/week and person cared for receives PIP or Attendance Allowance.',
    govuk_url: 'https://www.gov.uk/carers-allowance',
    serviceType: 'benefit',
    proactive: true,
    gated: true,
    eligibility: {
      summary: '£81.90/week (2024/25) for carers spending at least 35 hours/week caring for someone receiving a qualifying disability benefit. Also provides NI credits and a gateway to UC Carer element.',
      universal: false,
      criteria: [
        { factor: 'caring', description: 'Caring for someone for at least 35 hours per week.' },
        { factor: 'dependency', description: 'The person being cared for must receive: PIP (daily living component — standard or enhanced), Attendance Allowance, DLA (middle or highest care rate), or other qualifying benefits.' },
        { factor: 'income', description: 'Net earnings must be below £151/week (2024/25) after deductions for tax, NI, pension contributions and some care costs.' },
      ],
      keyQuestions: [
        'Are you caring for someone at least 35 hours per week?',
        'Does the person you care for receive PIP daily living or Attendance Allowance?',
        'Do you earn less than £151 per week net?',
        'Are you in full-time education?',
      ],
      autoQualifiers: ['Person cared for receives enhanced rate PIP daily living and carer works fewer than 16 hours'],
      exclusions: ['Cannot claim if in full-time education (21+ hours/week).', 'Overlapping benefits rule — may not be payable in full alongside State Pension or other benefits.'],
      means_tested: false,
      evidenceRequired: ['Evidence of caring role', 'Benefit award letter for person cared for', 'Income evidence if working'],
    },
  },
  'dwp-uc-carer': {
    id: 'dwp-uc-carer', name: 'UC Carer element', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Additional ~£185/month in Universal Credit if eligible for Carer\'s Allowance.',
    govuk_url: 'https://www.gov.uk/universal-credit/what-youll-get',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'An extra £198.31/month (2024/25) added to Universal Credit for people who are eligible for Carer\'s Allowance. No need to actually claim Carer\'s Allowance — just be eligible.',
      universal: false,
      criteria: [
        { factor: 'caring', description: 'Eligible for Carer\'s Allowance (caring 35+ hours/week for someone on qualifying disability benefit).' },
        { factor: 'dependency', description: 'Must be on Universal Credit.' },
      ],
      keyQuestions: [
        'Are you on Universal Credit?',
        'Do you care for someone at least 35 hours per week?',
        'Does the person you care for receive PIP or Attendance Allowance?',
      ],
      autoQualifiers: ['On Universal Credit and eligible for Carer\'s Allowance'],
      means_tested: true,
      evidenceRequired: ['Notify DWP of caring role through UC journal'],
    },
  },
  'dwp-access-to-work': {
    id: 'dwp-access-to-work', name: 'Access to Work', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Grants for workplace adaptations, travel costs and support workers. Apply before starting job.',
    govuk_url: 'https://www.gov.uk/access-to-work',
    serviceType: 'grant',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Grants to help disabled people and those with health conditions to start or stay in work. Covers workplace adaptations, travel costs, support workers, communication support, and mental health support.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Physical or mental health condition or disability that affects ability to do the job or commute.' },
        { factor: 'employment', description: 'In paid work, self-employed, or about to start paid work or a work trial/placement.' },
      ],
      keyQuestions: [
        'Does your condition affect your ability to do your job or travel to work?',
        'Are you currently employed or about to start a job?',
        'What specific support or adaptations do you need?',
      ],
      means_tested: false,
      evidenceRequired: ['Evidence of employment or job offer', 'Evidence of disability or health condition (may be required)', 'Quotes for support/equipment needed'],
    },
  },
  'dwp-uc-health': {
    id: 'dwp-uc-health', name: 'UC limited capability element', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Higher UC payment after Work Capability Assessment. Requires fit note and medical evidence.',
    govuk_url: 'https://www.gov.uk/universal-credit/what-youll-get',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Extra Universal Credit for those whose health condition limits or prevents work. Requires a Work Capability Assessment (WCA). Limited Capability for Work and Work-Related Activity (LCWRA) adds £416/month.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Health condition or disability that limits or prevents capacity for work, determined by a Work Capability Assessment.' },
        { factor: 'dependency', description: 'Must be on Universal Credit.' },
      ],
      keyQuestions: [
        'Are you on Universal Credit?',
        'Do you have a fit note from your GP?',
        'Has a Work Capability Assessment been completed?',
        'What is your current capability rating from DWP?',
      ],
      means_tested: true,
      evidenceRequired: ['Fit note from GP (SC1 or equivalent)', 'Medical evidence for WCA (UC50 questionnaire)', 'Assessment appointment with health professional'],
    },
  },
  'dwp-child-maintenance': {
    id: 'dwp-child-maintenance', name: 'Child Maintenance Service', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'If parents cannot agree privately. CMS calculates based on paying parent\'s income.',
    govuk_url: 'https://www.gov.uk/child-maintenance',
    serviceType: 'application',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'A statutory service for parents who cannot reach a private maintenance arrangement. CMS calculates payments based on the paying parent\'s income. A fee applies to use the Collect & Pay service.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Have children under 16 (or under 20 in qualifying education) whose parents are separated.' },
        { factor: 'relationship_status', description: 'Not living together with the other parent.' },
      ],
      keyQuestions: [
        'Are you and the other parent separated?',
        'Are there children under 16 in the family?',
        'Have you tried to reach a family-based arrangement first?',
        'Is the paying parent in the UK?',
      ],
      means_tested: false,
      evidenceRequired: ['Paying parent\'s income details (CMS contacts HMRC directly)', 'Children\'s details', 'Your contact details'],
    },
  },
  'dwp-ni-number': {
    id: 'dwp-ni-number', name: 'National Insurance number', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Apply online via DWP. Required before starting work or claiming benefits in the UK.',
    govuk_url: 'https://www.gov.uk/apply-national-insurance-number',
    serviceType: 'registration',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Required before starting work or claiming benefits in the UK. Apply online via DWP. Must have the right to work in the UK. UK citizens should already have one — applies mainly to new arrivals.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Must have the right to work in the UK, evidenced by a Biometric Residence Permit, eVisa, or other valid leave to remain.' },
        { factor: 'citizenship', description: 'UK citizens are automatically assigned one — applies mainly to non-UK nationals who have arrived to work or study.' },
      ],
      keyQuestions: [
        'Do you already have a National Insurance number?',
        'Do you have the right to work in the UK?',
        'Do you have a Biometric Residence Permit or share code?',
      ],
      autoQualifiers: ['Biometric Residence Permit received and right to work confirmed'],
      means_tested: false,
      evidenceRequired: ['Proof of identity (passport or BRP)', 'Proof of address', 'Right to work documents'],
    },
  },

  // NHS ──────────────────────────────────────────────────────────────────────
  'nhs-gp-register': {
    id: 'nhs-gp-register', name: 'Register with new GP', dept: 'NHS', deptKey: 'nhs',
    deadline: null,
    desc: 'Register at nearest surgery. Medical records transfer automatically from old practice.',
    govuk_url: 'https://www.gov.uk/register-with-a-gp',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Anyone living in England can register with a GP practice. Practices must accept patients living in their area. Medical records transfer automatically from old practice.',
      universal: true,
      criteria: [
        { factor: 'residency', description: 'Must live within the practice boundary (or a GP may agree to register out-of-area).' },
      ],
      keyQuestions: [
        'What is your new address?',
        'Do you have any existing medical conditions requiring ongoing prescriptions or referrals?',
        'Are you a new arrival to the UK?',
      ],
      means_tested: false,
      evidenceRequired: ['Proof of address (helpful but not required)', 'Previous GP name for record transfer'],
    },
  },
  'nhs-healthy-start': {
    id: 'nhs-healthy-start', name: 'Healthy Start vouchers', dept: 'NHS', deptKey: 'nhs',
    deadline: null,
    desc: 'Food and milk vouchers if on qualifying benefits and 10+ weeks pregnant.',
    govuk_url: 'https://www.healthystart.nhs.uk/',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Prepaid card to buy fruit, vegetables, milk and infant formula for eligible pregnant women and parents of children under 4. Worth £8.50/week for pregnant women; £4.25/week per child under 1.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Pregnant (at least 10 weeks) or have a child under 4.' },
        { factor: 'income', description: 'Receiving UC (with no earnings or earnings below £408/assessment period), Child Tax Credit (income under £16,190), Income Support, or under 18 and pregnant.' },
      ],
      keyQuestions: [
        'Are you at least 10 weeks pregnant or do you have a child under 4?',
        'Are you receiving Universal Credit, Child Tax Credit or Income Support?',
        'Are you under 18 and pregnant?',
      ],
      means_tested: true,
      evidenceRequired: ['MATB1 form or proof of pregnancy/child\'s age', 'Proof of qualifying benefit'],
    },
  },
  'nhs-free-prescriptions-pregnancy': {
    id: 'nhs-free-prescriptions-pregnancy', name: 'Free prescriptions & dental (pregnancy)', dept: 'NHS', deptKey: 'nhs',
    deadline: null,
    desc: 'Automatic from positive pregnancy test. Continues until baby is 1 year old.',
    govuk_url: 'https://www.gov.uk/help-nhs-costs/maternity-exemption-certificates',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Free NHS prescriptions and dental treatment for all pregnant women and for 12 months after the birth. Apply for a Maternity Exemption Certificate via midwife or GP.',
      universal: true,
      criteria: [
        { factor: 'family', description: 'Currently pregnant or have given birth within the last 12 months.' },
      ],
      keyQuestions: [
        'Are you currently pregnant?',
        'Have you had a baby in the last 12 months?',
        'Have you applied for your Maternity Exemption Certificate?',
      ],
      autoQualifiers: ['Pregnant — apply for Maternity Exemption Certificate via midwife or GP'],
      means_tested: false,
      evidenceRequired: ['FW8 form signed by midwife or GP — gives Maternity Exemption Certificate (valid until 12 months after due date)'],
    },
  },
  'nhs-free-prescriptions': {
    id: 'nhs-free-prescriptions', name: 'Free prescriptions (disability)', dept: 'NHS', deptKey: 'nhs',
    deadline: null,
    desc: 'Prepayment certificate at £111/year. Free if on qualifying benefit or certain conditions.',
    govuk_url: 'https://www.gov.uk/get-free-prescriptions-on-the-nhs',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Free NHS prescriptions if receiving PIP, DLA, ESA, or on UC with certain health conditions, or if diagnosed with a qualifying medical condition (e.g. diabetes, epilepsy, thyroid conditions).',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Receiving PIP, DLA, or have a qualifying medical condition that entitles to a medical exemption certificate.' },
        { factor: 'income', description: 'Receiving UC with a health element, or HC2 certificate for low income.' },
        { factor: 'age', description: 'Under 16, aged 16–18 in full-time education, or 60 and over.' },
      ],
      keyQuestions: [
        'Are you receiving PIP, DLA, or Attendance Allowance?',
        'Do you have a qualifying medical condition (diabetes, cancer, epilepsy, hypothyroidism, etc.)?',
        'Are you receiving Universal Credit with a health element?',
      ],
      autoQualifiers: ['PIP award confirmed', 'Qualifying medical condition (apply for Medical Exemption Certificate via GP)'],
      means_tested: false,
      evidenceRequired: ['Benefit award letter or FP92A medical exemption form signed by GP'],
    },
  },
  'nhs-care-assessment': {
    id: 'nhs-care-assessment', name: 'Care needs assessment', dept: 'NHS', deptKey: 'nhs',
    deadline: null,
    desc: 'Local authority assesses care needs. Can lead to a care plan and possible funded support.',
    govuk_url: 'https://www.gov.uk/care-needs-assessment-adults',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Any adult can request a care needs assessment from their local authority. Free and means-independent — the assessment itself is free, though resulting care may be means-tested. Can lead to a care plan and funded support.',
      universal: true,
      criteria: [
        { factor: 'disability', description: 'Any adult who appears to need care and support due to a physical or mental condition, disability, or frailty due to age.' },
      ],
      keyQuestions: [
        'What activities of daily living is the person struggling with?',
        'Is this for the person who needs care or a carer?',
        'Has a carer\'s assessment been requested alongside this?',
      ],
      means_tested: false,
      evidenceRequired: ['No formal evidence required — contact local authority adult social care directly'],
    },
  },

  // DVLA ─────────────────────────────────────────────────────────────────────
  'dvla-provisional-licence': {
    id: 'dvla-provisional-licence', name: 'Provisional Driving Licence', dept: 'DVLA', deptKey: 'dvla',
    deadline: null,
    desc: 'Apply from age 15 years and 9 months. Required before taking lessons or tests. Apply online via DVLA.',
    govuk_url: 'https://www.gov.uk/apply-first-provisional-driving-licence',
    serviceType: 'document',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required before you can take driving lessons or book a theory or practical test. Can be applied for from age 15 years and 9 months (to be ready for when you turn 17). Apply online via DVLA for £34.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must be at least 15 years and 9 months old to apply. Must be 17 to drive on a public road (16 for a moped).' },
        { factor: 'residency', description: 'Must be normally resident in Great Britain.' },
      ],
      keyQuestions: [
        'Are you 15 years and 9 months or older?',
        'Do you have a UK passport (or another acceptable identity document)?',
        'Do you have any medical conditions that must be declared to DVLA?',
      ],
      means_tested: false,
      evidenceRequired: ['UK passport or birth certificate for identity', 'Address details', '£34 fee (online application)'],
    },
  },

  // DVSA ─────────────────────────────────────────────────────────────────────
  'dvsa-theory-test': {
    id: 'dvsa-theory-test', name: 'Theory Test', dept: 'DVSA', deptKey: 'dvsa',
    deadline: null,
    desc: 'Must pass before booking the practical driving test. £23. Includes multiple choice and hazard perception.',
    govuk_url: 'https://www.gov.uk/book-theory-test',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'All learner drivers must pass a theory test before they can book a practical driving test. Costs £23. Consists of a multiple-choice section and a hazard perception video clip test. Must have a valid provisional driving licence to book.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must hold a valid provisional driving licence before the theory test can be booked.' },
      ],
      keyQuestions: [
        'Do you have a provisional driving licence?',
        'Have you studied the Highway Code and used hazard perception practice tests?',
      ],
      means_tested: false,
      evidenceRequired: ['Provisional driving licence (photocard)', '£23 test fee (booked online via DVSA)'],
    },
  },
  'dvsa-driving-test': {
    id: 'dvsa-driving-test', name: 'Driving Test (practical)', dept: 'DVSA', deptKey: 'dvsa',
    deadline: null,
    desc: 'Must pass theory test first. £62 weekday / £75 evening & weekend. Grants full licence on pass.',
    govuk_url: 'https://www.gov.uk/book-driving-test',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Must pass the theory test before the practical driving test can be booked. Costs £62 (weekday) or £75 (evening/weekend/bank holiday). On passing, the provisional licence is automatically upgraded to a full driving licence.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'A valid theory test pass certificate is required to book the practical test (certificates are valid for 2 years).' },
      ],
      keyQuestions: [
        'Have you passed your theory test? Is the pass certificate still valid (within 2 years)?',
        'Has your instructor confirmed you are test-ready?',
        'Do you have your provisional licence photocard to bring to the test?',
      ],
      means_tested: false,
      evidenceRequired: ['Theory test pass certificate (valid within 2 years)', 'Provisional driving licence photocard', '£62–£75 test fee (booked online via DVSA)'],
    },
  },

  'dvla-update-address': {
    id: 'dvla-update-address', name: 'Update driving licence address', dept: 'DVLA', deptKey: 'dvla',
    deadline: '3 months',
    desc: 'Legal requirement to update within 3 months of moving. Can be done online.',
    govuk_url: 'https://www.gov.uk/change-address-driving-licence',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'A legal requirement for all driving licence holders within 3 months of moving. Can be done quickly online for free. Failure to update is technically an offence.',
      universal: true,
      criteria: [
        { factor: 'residency', description: 'Holds a GB driving licence and has moved to a new address.' },
      ],
      keyQuestions: [
        'Do you hold a GB driving licence?',
        'Have you moved within the last 3 months?',
      ],
      means_tested: false,
      evidenceRequired: ['Current driving licence', 'New address details', 'Government Gateway or DVLA online service'],
    },
  },
  'dvla-name-change': {
    id: 'dvla-name-change', name: 'Update driving licence (name change)', dept: 'DVLA', deptKey: 'dvla',
    deadline: null,
    desc: 'D1 form or online. Legal requirement — licence must reflect current name.',
    govuk_url: 'https://www.gov.uk/change-name-driving-licence',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'A legal requirement for driving licence holders who have changed their name — after marriage, civil partnership, deed poll or statutory declaration. Must be updated to reflect current legal name.',
      universal: true,
      criteria: [
        { factor: 'relationship_status', description: 'Has legally changed name following marriage, civil partnership, deed poll or court order.' },
      ],
      keyQuestions: [
        'Have you changed your name?',
        'Do you hold a GB driving licence?',
        'Do you have your marriage certificate or deed poll document?',
      ],
      autoQualifiers: ['Marriage or civil partnership certificate received and current licence name is now incorrect'],
      means_tested: false,
      evidenceRequired: ['D1 form (or online application)', 'Current driving licence', 'Marriage certificate or deed poll', 'Passport photo'],
    },
  },
  'dvla-cancel-licence': {
    id: 'dvla-cancel-licence', name: 'Cancel driving licence', dept: 'DVLA', deptKey: 'dvla',
    deadline: null,
    desc: 'Covered by Tell Us Once if used after a death. Otherwise notify DVLA directly.',
    govuk_url: 'https://www.gov.uk/dvla/forms/d27',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Must notify DVLA when a driving licence holder dies. Usually handled automatically by Tell Us Once after death registration. Send the licence to DVLA if available.',
      universal: true,
      criteria: [
        { factor: 'bereavement', description: 'Person with a GB driving licence has died.' },
      ],
      keyQuestions: [
        'Did the deceased hold a GB driving licence?',
        'Was Tell Us Once completed — which would automatically notify DVLA?',
        'Is the physical licence available to send to DVLA?',
      ],
      autoQualifiers: ['Tell Us Once completed — DVLA notified automatically'],
      means_tested: false,
      evidenceRequired: ['Physical driving licence if available', 'D27 form', 'Death certificate'],
    },
  },
  'dvla-notify-condition': {
    id: 'dvla-notify-condition', name: 'Notify DVLA of medical condition', dept: 'DVLA', deptKey: 'dvla',
    deadline: null,
    desc: 'Legal requirement for many conditions. May affect licence. Check gov.uk list of notifiable conditions.',
    govuk_url: 'https://www.gov.uk/health-conditions-and-driving',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'A legal duty to notify DVLA of any medical condition or treatment that may affect safe driving. Covers a wide range of physical and mental health conditions. Failure to notify can invalidate insurance.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Has a medical condition listed on DVLA\'s notifiable conditions list — including epilepsy, insulin-treated diabetes, visual impairment, sleep disorders, heart conditions, dementia, and many others.' },
      ],
      keyQuestions: [
        'Has a doctor advised you to stop driving?',
        'Is the condition on DVLA\'s list of notifiable conditions?',
        'Has the condition changed recently in a way that might affect driving safety?',
      ],
      means_tested: false,
      evidenceRequired: ['Relevant medical reports or confirmation from GP', 'DVLA questionnaire (specific to condition)'],
    },
  },

  // COMPANIES HOUSE ──────────────────────────────────────────────────────────
  'ch-register-ltd': {
    id: 'ch-register-ltd', name: 'Register limited company (IN01)', dept: 'Companies House', deptKey: 'ch',
    deadline: null,
    desc: 'Company name must be available. Same-day registration possible online.',
    govuk_url: 'https://www.gov.uk/limited-company-formation/register-your-company',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Anyone can register a limited company in the UK. Same-day registration online for £50. Company name must be available and not too similar to existing names. At least one director required.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Directors must be at least 16 years old.' },
        { factor: 'residency', description: 'Registered office must be in England, Wales, Scotland, or Northern Ireland. No nationality restriction on directors or shareholders.' },
      ],
      keyQuestions: [
        'Have you chosen and checked availability of a company name?',
        'Do you have a registered office address in the UK?',
        'Who will be the directors and what shares will be issued?',
        'Who are the Persons of Significant Control (those with 25%+ ownership)?',
      ],
      means_tested: false,
      evidenceRequired: ['IN01 form (or online via Companies House WebFiling/authorised agent)', 'Director details and consent', 'Registered office address', 'Share structure details'],
    },
  },

  // HMCTS ────────────────────────────────────────────────────────────────────
  'hmcts-probate': {
    id: 'hmcts-probate', name: 'Apply for probate', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'Required if estate exceeds £10k with most financial institutions. Currently 16+ week wait.',
    govuk_url: 'https://www.gov.uk/applying-for-probate',
    serviceType: 'legal_process',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Grants legal authority to deal with the estate. Required by most banks, insurers and financial institutions for estates over £10,000. Currently experiencing 16+ week processing times. Costs £273 for estates over £5,000.',
      universal: false,
      criteria: [
        { factor: 'bereavement', description: 'Person has died leaving assets held in their sole name.' },
        { factor: 'asset', description: 'Estate includes assets (bank accounts, investments, property) that cannot be transferred without Grant of Probate or Letters of Administration.' },
      ],
      keyQuestions: [
        'Did the deceased leave a valid will?',
        'What is the total estimated value of assets held in the deceased\'s sole name?',
        'Are any assets held jointly — these pass automatically and don\'t need probate?',
        'Were there any lifetime gifts in the last 7 years?',
      ],
      exclusions: ['Jointly held assets (bank accounts, property) pass outside probate.', 'Some pension death benefits and life insurance written in trust pass outside probate.'],
      means_tested: false,
      evidenceRequired: ['Original will (if there is one)', 'Death certificate', 'Estimated estate value', 'PA1P (with will) or PA1A (no will) application form'],
    },
  },
  'hmcts-divorce': {
    id: 'hmcts-divorce', name: 'Divorce application (D8)', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'Online or paper. Conditional order after 20 weeks; final order 6 weeks later.',
    govuk_url: 'https://www.gov.uk/divorce',
    serviceType: 'legal_process',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'No-fault divorce since April 2022 — no reasons needed. Apply online or on paper. Minimum timescale: 26 weeks (20 weeks to Conditional Order + 6 weeks to Final Order). Can apply jointly or individually.',
      universal: false,
      criteria: [
        { factor: 'relationship_status', description: 'Must have been married or in a civil partnership for at least 1 year.' },
        { factor: 'residency', description: 'Either party must be domiciled in England/Wales, or habitually resident for at least 6 of the last 12 months.' },
      ],
      keyQuestions: [
        'Have you been married for at least 1 year?',
        'Are you based in England or Wales?',
        'Do you intend to apply jointly or as a sole applicant?',
        'Have you thought about financial arrangements? (Strongly advised to get a Financial Consent Order.)',
      ],
      means_tested: false,
      evidenceRequired: ['Marriage or civil partnership certificate', 'D8 application form', 'Court fee (£593, or reduced if low income)'],
    },
  },
  'hmcts-financial-order': {
    id: 'hmcts-financial-order', name: 'Financial Consent Order', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'Legally binding division of assets and pension. Strongly advised before final divorce order.',
    govuk_url: 'https://www.gov.uk/money-property-when-relationship-ends/reaching-an-agreement',
    serviceType: 'legal_process',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'A court-approved agreement making division of assets, property and pension legally binding. Strongly advised before the Final Divorce Order — without it, either party can make future financial claims. Usually drafted by solicitors.',
      universal: false,
      criteria: [
        { factor: 'relationship_status', description: 'In divorce or dissolution proceedings.' },
        { factor: 'asset', description: 'Have assets, property, savings or pensions to divide.' },
      ],
      keyQuestions: [
        'Have you reached a financial agreement with your ex-partner?',
        'Do you have shared property, pensions or savings to divide?',
        'Are you using solicitors or doing this yourself (DIY consent order)?',
      ],
      means_tested: false,
      evidenceRequired: ['Draft consent order (D81 form)', 'Financial disclosure from both parties', 'Court fee (£53)'],
    },
  },
  'hmcts-child-arrangements': {
    id: 'hmcts-child-arrangements', name: 'Child Arrangements Order', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'If no agreement on living arrangements. Mediation usually required first.',
    govuk_url: 'https://www.gov.uk/looking-after-children-divorce/apply-for-court-order',
    serviceType: 'legal_process',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'A court order specifying where children live and how much time they spend with each parent. Required only when parents cannot agree through negotiation or mediation. MIAM (mediation) must usually be attempted first.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Parents cannot agree on living or contact arrangements for children after separation.' },
        { factor: 'relationship_status', description: 'Separated parents with children under 16 (or up to 18 if the order already exists).' },
      ],
      keyQuestions: [
        'Have you attempted mediation (MIAM)?',
        'Are there domestic abuse concerns that may exempt you from mediation?',
        'How old are the children?',
        'What specific disagreement are you seeking the court to resolve?',
      ],
      means_tested: false,
      evidenceRequired: ['MIAM certificate (from mediator) or exemption evidence', 'C100 application form', 'Court fee (£232, or reduced if low income)'],
    },
  },
  'hmcts-legal-aid': {
    id: 'hmcts-legal-aid', name: 'Legal Aid application', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'Means and merits tested. Available in domestic abuse cases. Applied via Legal Aid Agency.',
    govuk_url: 'https://www.gov.uk/legal-aid',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Government funding for legal advice and representation in certain cases. Both means-tested (income/capital) and merits-tested (strength of case). Domestic abuse cases have wider automatic eligibility. Applied via a legal aid solicitor.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Disposable income must be below £2,657/month and disposable capital below £8,000 (thresholds vary by case type).' },
        { factor: 'income', description: 'Case must pass the merits test — chances of success and proportionality to cost.' },
      ],
      keyQuestions: [
        'What is your monthly income after tax?',
        'Do you have savings or capital above £8,000?',
        'Does your case involve domestic abuse? (Special rules may apply.)',
        'What type of legal matter is this?',
      ],
      autoQualifiers: ['Domestic abuse victim in family proceedings with supporting evidence'],
      means_tested: true,
      evidenceRequired: ['CW2 means test form', 'Income and savings evidence', 'Details of the case for merits assessment'],
    },
  },
  'hmcts-benefit-tribunal': {
    id: 'hmcts-benefit-tribunal', name: 'Social Security & Child Support Tribunal', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'Independent tribunal to appeal a DWP benefit decision after Mandatory Reconsideration has been completed.',
    govuk_url: 'https://www.gov.uk/appeal-benefit-decision',
    serviceType: 'legal_process',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'If a Mandatory Reconsideration has not resolved your dispute with a DWP benefit decision, you can appeal to an independent tribunal. The tribunal is free and independent of DWP.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Mandatory Reconsideration must have been completed and the outcome confirmed in a Mandatory Reconsideration Notice from DWP.' },
      ],
      keyQuestions: [
        'Have you received a Mandatory Reconsideration Notice from DWP?',
        'Do you still disagree with the decision after reconsideration?',
        'Do you have a representative or advice agency helping you?',
      ],
      means_tested: false,
      evidenceRequired: ['Mandatory Reconsideration Notice (SSCS1 form to appeal)', 'Any supporting evidence — medical reports, letters, assessments'],
    },
  },

  // LOCAL AUTHORITY ──────────────────────────────────────────────────────────
  'la-electoral-roll': {
    id: 'la-electoral-roll', name: 'Electoral roll update', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Update at both old and new address. Affects jury duty and credit checks.',
    govuk_url: 'https://www.gov.uk/register-to-vote',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Register to vote at your new address. Affects eligibility for jury duty and credit checks. Can update online in 5 minutes. Also de-register from old address.',
      universal: true,
      criteria: [
        { factor: 'age', description: 'Must be 16 or over to register (18 to vote in most elections).' },
        { factor: 'citizenship', description: 'British, Irish, or qualifying Commonwealth citizen (EU citizens can vote in local elections).' },
      ],
      keyQuestions: [
        'What is your new address?',
        'Are you registered at your old address — do you need to update that too?',
      ],
      means_tested: false,
      evidenceRequired: ['National Insurance number (for online registration)'],
    },
  },
  'la-voter-authority-cert': {
    id: 'la-voter-authority-cert', name: 'Voter Authority Certificate', dept: 'Local Authority', deptKey: 'la',
    deadline: 'Before election deadline',
    desc: 'Free photo ID for polling stations if you lack an accepted form of photo ID (passport, driving licence, etc.). Apply via local council.',
    govuk_url: 'https://www.gov.uk/apply-for-photo-id-voter-authority-certificate',
    serviceType: 'document',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Free photo ID for use at polling stations at UK elections, introduced from 2023. Required if you do not have an accepted form of photo ID (such as a passport, driving licence, or certain concessionary bus passes). Apply via your local council.',
      universal: false,
      criteria: [
        { factor: 'citizenship', description: 'Must be eligible to vote (registered on the electoral roll as a British, Irish, or qualifying Commonwealth citizen).' },
        { factor: 'dependency', description: 'Must be registered to vote. Only needed if you do not already have an accepted form of photo ID.' },
      ],
      keyQuestions: [
        'Are you registered to vote?',
        'Do you have an accepted form of photo ID (passport, driving licence, Senior/Disabled Person\'s Bus Pass, or certain other documents)?',
        'Is there an election coming up that you plan to vote in?',
      ],
      means_tested: false,
      evidenceRequired: ['Electoral registration number or NI number to verify registration', 'Recent photograph', 'Online application via local council'],
    },
  },
  'la-council-tax': {
    id: 'la-council-tax', name: 'Council Tax registration', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Register at new address and close account at old. Various discounts may apply.',
    govuk_url: 'https://www.gov.uk/council-tax',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Any adult who is the resident or owner of a domestic property is liable for Council Tax. Register at your new address and close the account at your old address. Various discounts and exemptions may apply.',
      universal: true,
      criteria: [
        { factor: 'property', description: 'The adult resident or owner of a domestic property in England, Scotland or Wales.' },
      ],
      keyQuestions: [
        'What is your new address and move-in date?',
        'Is there only one adult in the property? (25% single person discount may apply.)',
        'Are you on a low income? (Council Tax Reduction may apply.)',
      ],
      means_tested: false,
      evidenceRequired: ['Tenancy agreement or proof of ownership', 'Move-in date'],
    },
  },
  'la-council-tax-single-discount': {
    id: 'la-council-tax-single-discount', name: 'Council Tax single person discount', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: '25% discount if now living alone after bereavement or separation.',
    govuk_url: 'https://www.gov.uk/council-tax-discounts',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'A 25% reduction in Council Tax if you are the only adult resident in a property. Apply to your local council after bereavement, divorce/separation, or a household member moving out.',
      universal: false,
      criteria: [
        { factor: 'relationship_status', description: 'Now living alone as the only adult (18+) in the property, following bereavement or separation.' },
      ],
      keyQuestions: [
        'Are you the only adult (18+) living in the property?',
        'Was there a previous occupant who has died or moved out?',
        'Are you already receiving this discount?',
      ],
      means_tested: false,
      evidenceRequired: ['Application to local council (varies by authority)'],
    },
  },
  'la-council-tax-reduction': {
    id: 'la-council-tax-reduction', name: 'Council Tax Reduction', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Apply to local council. Can reduce bill to zero on very low income.',
    govuk_url: 'https://www.gov.uk/apply-council-tax-reduction',
    serviceType: 'benefit',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'A means-tested discount on your Council Tax bill. Administered by local councils — schemes vary by area. Can reduce the bill significantly or to zero on very low income.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Low income or receiving means-tested benefits such as Universal Credit, Income Support, Pension Credit.' },
        { factor: 'property', description: 'Must be liable for Council Tax at that address.' },
      ],
      keyQuestions: [
        'Are you receiving Universal Credit, Pension Credit or other means-tested benefits?',
        'What is your weekly income from all sources?',
        'Do you have savings above £6,000?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of income and savings', 'Council Tax bill', 'Application to local authority'],
    },
  },
  'la-bus-pass': {
    id: 'la-bus-pass', name: 'Free bus pass', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Available from State Pension age. Apply via local council.',
    govuk_url: 'https://www.gov.uk/apply-for-elderly-person-bus-pass',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Free off-peak bus travel anywhere in England from State Pension age. Also available to some disabled people. Apply via local council — usually processed in a few weeks.',
      universal: true,
      criteria: [
        { factor: 'age', description: 'Must have reached State Pension age (currently 66). Some disabled people may also qualify before this age.' },
      ],
      keyQuestions: [
        'Have you reached State Pension age?',
        'Do you have a disability or health condition that may qualify you for an earlier pass?',
      ],
      autoQualifiers: ['Reached State Pension age'],
      means_tested: false,
      evidenceRequired: ['Proof of age (passport or birth certificate)', 'Proof of address', 'Passport photo'],
    },
  },
  'la-school-place': {
    id: 'la-school-place', name: 'School place application', dept: 'Local Authority', deptKey: 'la',
    deadline: 'Jan 15 / Oct 31',
    desc: 'Primary: apply by 15 January. Secondary: 31 October. Via local authority admissions.',
    govuk_url: 'https://www.gov.uk/apply-for-primary-school-place',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Apply for school places through the local authority. Key deadlines: Primary Reception — 15 January; Secondary Year 7 — 31 October. Local catchment area affects admission chances.',
      universal: true,
      criteria: [
        { factor: 'age', description: 'Child reaching compulsory school age: Reception at 4-5, Secondary at 11.' },
        { factor: 'geography', description: 'Local authority area determines which schools are offered. Catchment area, siblings, faith criteria vary by school.' },
      ],
      keyQuestions: [
        'When does the child turn 4 (Reception) or 11 (Secondary)?',
        'Which schools are you interested in and are you in their catchment area?',
        'Does the child have an Education, Health and Care (EHC) plan?',
      ],
      means_tested: false,
      evidenceRequired: ['Child\'s birth certificate', 'Proof of address', 'Baptism certificate (for faith schools)'],
    },
  },
  'la-free-school-meals': {
    id: 'la-free-school-meals', name: 'Free School Meals', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Auto-eligible if on UC with income under £7,400. Apply via school or local authority.',
    govuk_url: 'https://www.gov.uk/apply-free-school-meals',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Free school meals for children at state schools if parents are on qualifying benefits. Automatic if on Universal Credit with annual net earned income under £7,400. Unlocks Pupil Premium funding for the school.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Receiving Universal Credit with net earned income (excluding benefits) under £7,400/year; or Income Support; income-based JSA/ESA; or Child Tax Credit under £16,190 (without Working Tax Credit).' },
        { factor: 'family', description: 'Child is of compulsory school age and attends a state-funded school in England.' },
      ],
      keyQuestions: [
        'Are you receiving Universal Credit?',
        'What is your annual net earned income (not including benefits)?',
        'Is the child at a state school?',
      ],
      autoQualifiers: ['Receiving Universal Credit with no or low earned income'],
      means_tested: true,
      evidenceRequired: ['Proof of qualifying benefit', 'Application via school office or local authority portal'],
    },
  },
  'la-send-ehc': {
    id: 'la-send-ehc', name: 'SEND EHC plan assessment', dept: 'Local Authority', deptKey: 'la',
    deadline: '20 weeks',
    desc: 'For children with complex needs. Local Authority has 20 weeks to issue the plan.',
    govuk_url: 'https://www.gov.uk/children-with-special-educational-needs/education-health-care-plans',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'An Education, Health and Care (EHC) plan for children and young people aged 0-25 with complex SEND needs that cannot be met through standard school support. Local Authority must complete the assessment within 20 weeks.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Child or young person has significant special educational needs or disabilities that cannot be adequately met within normal school resources.' },
        { factor: 'age', description: 'Aged 0 to 25.' },
      ],
      keyQuestions: [
        'What specific learning, developmental, or health needs does the child have?',
        'What support has the school already put in place?',
        'Has there been any previous assessment or diagnosis?',
        'Is the child aged 0-25?',
      ],
      means_tested: false,
      evidenceRequired: ['School reports and educational assessments', 'Medical evidence', 'Parental views (required to be included)', 'Child\'s views if appropriate'],
    },
  },
  'la-blue-badge': {
    id: 'la-blue-badge', name: 'Blue Badge', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Auto-qualify on Enhanced Rate PIP mobility. Apply via local council.',
    govuk_url: 'https://www.gov.uk/apply-blue-badge',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Allows parking in disabled bays and on yellow lines. Auto-qualify if receiving Enhanced Rate PIP mobility or DLA (highest mobility rate). Others apply discretionarily. Apply via local council. Costs up to £10.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Cannot walk, or have severe difficulty walking, or are registered severely sight impaired, or have a hidden disability causing very considerable difficulty.' },
        { factor: 'dependency', description: 'Auto-qualify with Enhanced Rate PIP mobility component, DLA (highest mobility rate), or certain armed forces compensation.' },
      ],
      keyQuestions: [
        'Do you receive the Enhanced Rate of PIP mobility?',
        'Do you have severe difficulty walking?',
        'Do you have a hidden disability (anxiety, autism, cognitive condition) that causes very considerable difficulty?',
      ],
      autoQualifiers: ['Enhanced Rate PIP mobility component confirmed'],
      means_tested: false,
      evidenceRequired: ['PIP or DLA award letter', 'Evidence of difficulty walking if applying on non-automatic criteria', 'Application to local council'],
    },
  },
  'la-disabled-facilities-grant': {
    id: 'la-disabled-facilities-grant', name: 'Disabled Facilities Grant', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Up to £30k for home adaptations. Means-tested. Apply via local authority.',
    govuk_url: 'https://www.gov.uk/disabled-facilities-grants',
    serviceType: 'grant',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Up to £30,000 (England) towards adaptations to help a disabled person live independently at home: ramps, stairlifts, wider doorways, accessible bathrooms. Means-tested for applicants over 18. Occupational Therapist assessment required.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'A disabled person living in the property who needs adaptations to live more safely and independently.' },
        { factor: 'property', description: 'Property in England where the disabled person lives, whether owned, rented privately, or from a housing association.' },
        { factor: 'income', description: 'Means-tested for adults — a test of resources determines how much grant is payable. Children\'s grants are not means-tested.' },
      ],
      keyQuestions: [
        'What specific adaptations are needed?',
        'Is this for an owner-occupier or a tenant? (Landlord consent may be required.)',
        'Has an Occupational Therapist been involved?',
        'What is the household income and savings? (For the means test.)',
      ],
      means_tested: true,
      evidenceRequired: ['Occupational Therapist assessment', 'Quotes for proposed works', 'Income and savings details', 'Proof of disability'],
    },
  },
  'la-carers-assessment': {
    id: 'la-carers-assessment', name: "Carer's Assessment", dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Request from local council. Identifies support needs and may unlock local funding.',
    govuk_url: 'https://www.gov.uk/carers-assessment',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Any adult carer can request a free Carer\'s Assessment from their local authority. Identifies the carer\'s own needs and may unlock local support, respite care, or one-off grants.',
      universal: true,
      criteria: [
        { factor: 'caring', description: 'Any adult (18+) who provides regular and substantial unpaid care for someone with a disability, health condition, or frailty.' },
      ],
      keyQuestions: [
        'How many hours per week do you care for the person?',
        'Has the person you care for had their own needs assessment?',
        'What support do you need for yourself as a carer?',
      ],
      means_tested: false,
      evidenceRequired: ['No formal documentation required — contact local authority adult social care to request'],
    },
  },
  'la-business-rates': {
    id: 'la-business-rates', name: 'Business rates registration', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'If using non-domestic premises. Small Business Relief may reduce or eliminate the charge.',
    govuk_url: 'https://www.gov.uk/introduction-to-business-rates',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Business rates are charged on non-domestic properties used for business. Valuation Office Agency assesses rateable value; local authority bills and collects. Small Business Rate Relief eliminates the charge for properties under £12,000 rateable value.',
      universal: false,
      criteria: [
        { factor: 'property', description: 'Occupying or using a non-domestic property for business purposes.' },
        { factor: 'employment', description: 'Running a business from commercial premises, a workshop, shop, office, or similar.' },
      ],
      keyQuestions: [
        'Are you using non-domestic premises?',
        'What is the rateable value of the property? (Check VOA website.)',
        'Is the property\'s rateable value under £12,000? (May qualify for 100% Small Business Relief.)',
      ],
      means_tested: false,
      evidenceRequired: ['Business address', 'Date of occupation', 'Nature of business'],
    },
  },
  'la-food-hygiene': {
    id: 'la-food-hygiene', name: 'Food hygiene registration', dept: 'Local Authority', deptKey: 'la',
    deadline: '28 days',
    desc: 'Any food business must register with local authority before trading.',
    govuk_url: 'https://www.gov.uk/food-business-registration',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Any business that sells, cooks, stores, handles, prepares or distributes food must register with their local authority at least 28 days before opening. Free to register. Required for home bakers, market stalls, restaurants, and caterers.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Operating a food business of any type — including from home — in England, Wales or Northern Ireland.' },
      ],
      keyQuestions: [
        'Are you selling, cooking, preparing, or distributing food as a business?',
        'When do you plan to start trading?',
        'Are you working from home or commercial premises?',
      ],
      means_tested: false,
      evidenceRequired: ['Business address and contact details', 'Nature of food business', 'Application via local authority website (free)'],
    },
  },

  // HOME OFFICE ──────────────────────────────────────────────────────────────
  'ho-visa': {
    id: 'ho-visa', name: 'Visa / leave to enter', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Type depends on purpose. Via UK Visas and Immigration. Must be in place before entry.',
    govuk_url: 'https://www.gov.uk/browse/visas-immigration/getting-a-visa',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Non-UK and non-Irish nationals wishing to enter the UK must apply for the appropriate visa. Type depends on purpose: work, study, family reunion, etc. Must usually be obtained before travel.',
      universal: false,
      criteria: [
        { factor: 'citizenship', description: 'Non-UK, non-Irish national wishing to enter the UK (some nationalities require visa; others may enter visa-free for short stays).' },
        { factor: 'immigration', description: 'Must apply for the specific visa type matching the purpose of entry (Skilled Worker, Student, Family Visa, etc.).' },
      ],
      keyQuestions: [
        'What is your nationality?',
        'What is the purpose of your visit or stay?',
        'How long do you intend to stay?',
        'Do you have a job offer, university place, or family member in the UK?',
      ],
      means_tested: false,
      evidenceRequired: ['Valid passport', 'Financial evidence (sufficient funds)', 'Purpose-specific documents: job offer/CoS, university CAS, relationship evidence, etc.', 'Immigration Health Surcharge payment'],
    },
  },
  'ho-eu-settled-status': {
    id: 'ho-eu-settled-status', name: 'EU Settlement Scheme (Settled / Pre-Settled Status)', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'For EU/EEA/Swiss nationals who lived in the UK before 31 December 2020. Grants the right to continue living and working in the UK.',
    govuk_url: 'https://www.gov.uk/settled-status-eu-citizens-families',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'EU, EEA and Swiss nationals who were living in the UK before 31 December 2020 can apply for settled status (if they have lived in the UK for 5+ continuous years) or pre-settled status (less than 5 years). Applications are free. A separate Brexit-specific route to the right to remain.',
      universal: false,
      criteria: [
        { factor: 'citizenship', description: 'Must be an EU, EEA or Swiss national (or a non-EU family member of one).' },
        { factor: 'residency', description: 'Must have been living in the UK before 31 December 2020.' },
      ],
      keyQuestions: [
        'Are you an EU, EEA or Swiss national?',
        'Were you living in the UK before 31 December 2020?',
        'How long have you lived in the UK continuously? (5+ years = settled status; under 5 = pre-settled.)',
        'Do you have family members who also need to apply?',
      ],
      means_tested: false,
      evidenceRequired: ['Valid EU/EEA/Swiss passport or national identity card', 'Evidence of UK residence (payslips, tenancy agreement, bank statements, etc.)'],
    },
  },
  'ho-brp': {
    id: 'ho-brp', name: 'Biometric Residence Permit', dept: 'Home Office', deptKey: 'ho',
    deadline: '10 days',
    desc: 'Collect from post office within 10 days of arriving. Proves right to work and rent.',
    govuk_url: 'https://www.gov.uk/biometric-residence-permits',
    serviceType: 'document',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Issued to non-UK nationals granted leave to remain for more than 6 months. Collect from the named post office within 10 days of arrival in the UK. Required to prove right to work and rent.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Granted a UK visa or leave to remain for more than 6 months.' },
      ],
      keyQuestions: [
        'Has your visa been approved?',
        'Which post office were you told to collect your BRP from?',
        'Do you have your passport vignette sticker available?',
      ],
      autoQualifiers: ['Visa granted for over 6 months — BRP collection instructions given with visa'],
      means_tested: false,
      evidenceRequired: ['Passport containing visa vignette sticker', 'BRP collection letter or email from Home Office'],
    },
  },
  'ho-life-in-uk': {
    id: 'ho-life-in-uk', name: 'Life in the UK test', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Required for ILR and naturalisation. Must pass before applying.',
    govuk_url: 'https://www.gov.uk/life-in-the-uk-test',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'A 45-minute test on British history, culture and values. Required before applying for Indefinite Leave to Remain or British citizenship. Exempt if under 18, over 65, or with certain disabilities.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Applying for Indefinite Leave to Remain or British citizenship by naturalisation.' },
        { factor: 'age', description: 'Applicants aged 18–64 must pass the test. Under 18 and over 65 are exempt.' },
      ],
      keyQuestions: [
        'Are you applying for ILR or British citizenship?',
        'Are you between 18 and 64?',
        'Have you passed the test before?',
      ],
      means_tested: false,
      evidenceRequired: ['Test pass certificate (issued at test centre)', 'Booking required online — £50 fee per attempt'],
    },
  },
  'ho-ilr': {
    id: 'ho-ilr', name: 'Indefinite Leave to Remain', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'After qualifying period. Continuous residence and income requirements apply.',
    govuk_url: 'https://www.gov.uk/indefinite-leave-to-remain',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Gives the right to live, work and study in the UK without immigration restrictions. Usually requires 5 years of lawful residence on an eligible visa. Must not have spent more than 180 days outside the UK in any 12-month period.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Met the qualifying period of lawful residence (usually 5 years on eligible visa such as Skilled Worker, Family, or Tier routes).' },
        { factor: 'residency', description: 'Must not have spent more than 180 days outside the UK in any 12-month period during the qualifying period.' },
        { factor: 'citizenship', description: 'Must pass the English language and Life in the UK test requirements.' },
      ],
      keyQuestions: [
        'How many years of lawful residence in the UK do you have?',
        'What visa category are you on?',
        'Have you spent more than 180 days outside the UK in any 12-month period?',
        'Have you passed the Life in the UK test?',
      ],
      means_tested: false,
      evidenceRequired: ['Passport(s) covering entire qualifying period', 'Proof of continuous residence (payslips, bank statements, tenancy agreements)', 'Life in the UK test certificate', 'English language evidence', 'SET(O) or relevant form'],
    },
  },
  'ho-citizenship': {
    id: 'ho-citizenship', name: 'British citizenship (naturalisation)', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'After 1 year of ILR. Language and residency requirements. AN1 form.',
    govuk_url: 'https://www.gov.uk/become-a-british-citizen/naturalisation',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Apply to become a British citizen after holding ILR for at least 12 months. Must have lived in the UK for 5 years, with no more than 450 days abroad in that period and 90 days in the final year.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Must hold Indefinite Leave to Remain (ILR) for at least 12 months.' },
        { factor: 'residency', description: 'Must have been physically present in the UK 5 years before application, with no more than 450 days abroad total and 90 days in the final year.' },
        { factor: 'citizenship', description: 'Must be of good character and meet the English language requirement.' },
      ],
      keyQuestions: [
        'Have you held ILR for at least 12 months?',
        'Have you been in the UK for at least 5 years?',
        'Have you spent more than 90 days outside the UK in the last 12 months?',
        'Have you had any criminal convictions?',
      ],
      means_tested: false,
      evidenceRequired: ['ILR document or eVisa evidence', 'Passport(s)', 'Life in the UK test certificate', 'English language certificate (if applicable)', 'AN1 form', 'Application fee (£1,500)'],
    },
  },

  // OPG ──────────────────────────────────────────────────────────────────────
  'opg-lpa': {
    id: 'opg-lpa', name: 'Lasting Power of Attorney', dept: 'OPG', deptKey: 'opg',
    deadline: null,
    desc: 'Health and welfare and/or property and finance. Register before mental capacity is lost.',
    govuk_url: 'https://www.gov.uk/power-of-attorney',
    serviceType: 'legal_process',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'A legal document appointing trusted people (attorneys) to make decisions on your behalf. Two types: Property & Financial Affairs (can be used immediately), and Health & Welfare (only if you lose capacity). Must be registered with OPG before use.',
      universal: true,
      criteria: [
        { factor: 'age', description: 'Donor must be 18 or over and have mental capacity at the time of making the LPA.' },
        { factor: 'disability', description: 'Particularly important for those with progressive conditions (dementia, MS, Parkinson\'s) — must be created while mental capacity remains.' },
      ],
      keyQuestions: [
        'Does the donor currently have mental capacity to make decisions?',
        'Do you want to create a Property & Financial Affairs LPA, a Health & Welfare LPA, or both?',
        'Who will be the attorney(s)?',
        'Do you need a certificate provider — someone to confirm the donor understands and is not being pressured?',
      ],
      means_tested: false,
      evidenceRequired: ['Online account via the OPG portal', 'Registration fee (£82 per LPA, or fee remission if on low income)', 'Certificate provider details', 'Attorney and donor signatures'],
    },
  },
  'opg-lpa-activation': {
    id: 'opg-lpa-activation', name: 'Notify OPG of death', dept: 'OPG', deptKey: 'opg',
    deadline: null,
    desc: 'Notify OPG when LPA holder dies. The registered LPA then ceases to have effect.',
    govuk_url: 'https://www.gov.uk/power-of-attorney/end-a-poa',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'When the donor of an LPA dies, their attorneys must notify the Office of the Public Guardian and return the LPA document. The LPA automatically ceases to have effect on death.',
      universal: false,
      criteria: [
        { factor: 'bereavement', description: 'A registered LPA exists and the donor has died.' },
        { factor: 'dependency', description: 'Requires a registered LPA to be in place.' },
      ],
      keyQuestions: [
        'Was there a registered Lasting Power of Attorney in place for the deceased?',
        'Do you have the original LPA document?',
        'Has the death been registered?',
      ],
      means_tested: false,
      evidenceRequired: ['Death certificate', 'Original LPA document to return to OPG', 'LP4 notification form'],
    },
  },

  // LAND REGISTRY ────────────────────────────────────────────────────────────
  'lr-registration': {
    id: 'lr-registration', name: 'Land Registry registration (AP1)', dept: 'Land Registry', deptKey: 'lr',
    deadline: null,
    desc: 'Register new ownership. Solicitor handles. Required for mortgage to complete.',
    govuk_url: 'https://www.gov.uk/registering-land-or-property-with-land-registry',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'All property purchases in England and Wales must be registered at HM Land Registry. Usually handled by the solicitor/conveyancer. Priority period starts when the application is received — must be submitted promptly after completion.',
      universal: true,
      criteria: [
        { factor: 'property', description: 'Any purchase of land or property in England or Wales. Also required for remortgages, transfers of equity, and first-time registrations of unregistered land.' },
      ],
      keyQuestions: [
        'Has the property purchase completed?',
        'Is the property already registered with Land Registry?',
        'Has SDLT been filed and the SDLT5 certificate received?',
      ],
      autoQualifiers: ['Property purchase completed and SDLT filed — solicitor handles Land Registry application'],
      means_tested: false,
      evidenceRequired: ['TR1 transfer deed', 'SDLT5 certificate from HMRC', 'AP1 application form', 'Title deeds (for first registration of unregistered land)', 'Registration fee (based on property value)'],
    },
  },

  // OTHER ────────────────────────────────────────────────────────────────────
  'other-passport-name': {
    id: 'other-passport-name', name: 'Passport name change', dept: 'HMPO', deptKey: 'other',
    deadline: null,
    desc: 'Not legally required after marriage but strongly recommended. Use marriage certificate.',
    govuk_url: 'https://www.gov.uk/renew-adult-passport',
    serviceType: 'document',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Not a legal requirement but strongly recommended after a name change. A passport in your new name is accepted as proof of identity for employment, travel, and financial services. Use the marriage certificate or deed poll as supporting evidence.',
      universal: true,
      criteria: [
        { factor: 'relationship_status', description: 'Name has legally changed following marriage, civil partnership, deed poll or statutory declaration.' },
      ],
      keyQuestions: [
        'Does your current passport reflect your old name?',
        'Do you have your marriage certificate or deed poll?',
        'Do you have an international trip planned? (Allows you to assess urgency.)',
      ],
      means_tested: false,
      evidenceRequired: ['Marriage certificate or deed poll', 'Current passport', 'New passport photos', 'Application form and fee (£88.50 for adult online, higher by post)'],
    },
  },
  'other-tv-licence-pension': {
    id: 'other-tv-licence-pension', name: 'TV Licence concession', dept: 'TV Licensing', deptKey: 'other',
    deadline: null,
    desc: 'Free if aged 75+ AND receiving Pension Credit.',
    govuk_url: 'https://www.gov.uk/tv-licence/get-a-free-or-discounted-tv-licence',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Free TV licence for households where at least one person is 75 or over AND receives Pension Credit. The 75+ person or their partner must be the Pension Credit claimant.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'At least one person in the household must be 75 or over.' },
        { factor: 'dependency', description: 'Must be receiving Pension Credit (Guarantee or Savings Credit), or be the partner of a Pension Credit claimant.' },
      ],
      keyQuestions: [
        'Is anyone in the household 75 or over?',
        'Is that person (or their partner) receiving Pension Credit?',
      ],
      autoQualifiers: ['Aged 75+ AND receiving Pension Credit'],
      means_tested: false,
      evidenceRequired: ['Pension Credit award letter', 'Date of birth confirmation', 'Apply online at tvlicensing.co.uk'],
    },
  },
  'other-motability': {
    id: 'other-motability', name: 'Motability scheme', dept: 'Motability', deptKey: 'other',
    deadline: null,
    desc: 'Car or scooter lease using mobility component. Requires Enhanced Rate PIP mobility.',
    govuk_url: 'https://www.motability.co.uk/',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Lease a car, powered wheelchair or scooter by using the Enhanced Rate of the Mobility Component of PIP. The allowance is paid directly to Motability. No credit check required.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Receiving the Enhanced Rate of the Mobility Component of PIP (or equivalent: DLA highest rate mobility, AFIP or WPMS).' },
        { factor: 'dependency', description: 'Must have at least 12 months remaining on the PIP mobility award at the time of ordering.' },
      ],
      keyQuestions: [
        'Do you receive the Enhanced Rate of PIP mobility?',
        'How long is remaining on your PIP award?',
        'Would a car, powerchair, or scooter be most useful?',
      ],
      autoQualifiers: ['Enhanced Rate PIP mobility with 12+ months remaining on award'],
      means_tested: false,
      evidenceRequired: ['PIP award letter confirming Enhanced Rate mobility component', 'At least 12 months remaining on award'],
    },
  },
  'other-disabled-railcard': {
    id: 'other-disabled-railcard', name: 'Disabled Persons Railcard', dept: 'Rail Delivery Group', deptKey: 'other',
    deadline: null,
    desc: 'One third off most rail fares. Various disability benefits qualify automatically.',
    govuk_url: 'https://www.disabledpersons-railcard.co.uk/',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: '1/3 off most rail fares for the holder and a companion. Qualifying conditions include receiving PIP, DLA, Attendance Allowance, being registered blind/partially sighted, or having epilepsy or severe mental or physical disability. Costs £20/year.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Receiving PIP (any component or rate), DLA, Attendance Allowance; or having epilepsy, registered severe visual/hearing impairment, or severe mental or physical disability requiring a companion.' },
      ],
      keyQuestions: [
        'Do you receive PIP (either component, any rate)?',
        'Do you receive Attendance Allowance?',
        'Do you have any of the other qualifying conditions listed?',
      ],
      autoQualifiers: ['Any PIP award (daily living or mobility, any rate)', 'Attendance Allowance (any rate)'],
      means_tested: false,
      evidenceRequired: ['Benefit award letter (PIP, DLA or AA)', 'Photo ID', 'Application at disabledpersons-railcard.co.uk'],
    },
  },
  'other-employers-liability': {
    id: 'other-employers-liability', name: "Employers' Liability Insurance", dept: 'Other', deptKey: 'other',
    deadline: 'Before employing',
    desc: 'Legal requirement if employing anyone. Minimum £5m cover.',
    govuk_url: 'https://www.gov.uk/employers-liability-insurance',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'A legal requirement for virtually all businesses that employ staff. Must have at least £5 million cover. Certificate must be displayed at each workplace. Penalties of up to £2,500/day for non-compliance.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Any business employing one or more people under a contract of service or apprenticeship.' },
      ],
      keyQuestions: [
        'Are you taking on any employees?',
        'Do any exemptions apply? (e.g. employing only close family members in some circumstances.)',
        'Have you obtained at least £5 million cover?',
      ],
      autoQualifiers: ['Registered as employer with HMRC PAYE'],
      exclusions: ['Some exemptions exist for businesses employing only their owner (sole director), and certain family businesses.'],
      means_tested: false,
      evidenceRequired: ['Insurance certificate (must be kept and available for inspection)', 'Minimum £5m cover required'],
    },
  },
  'other-dbs': {
    id: 'other-dbs', name: 'DBS check', dept: 'DBS', deptKey: 'other',
    deadline: null,
    desc: 'If working with children or vulnerable adults. Standard or enhanced check.',
    govuk_url: 'https://www.gov.uk/dbs-check-applicant-criminal-record',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'A criminal record check required for roles involving work with children or vulnerable adults. Employers apply on behalf of the employee. Three levels: Basic (anyone), Standard (specified roles), Enhanced (children/vulnerable adult work).',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Role involves working with children or vulnerable adults, or is otherwise in a specified list of eligible positions (healthcare, legal, financial services roles).' },
      ],
      keyQuestions: [
        'Does the role involve working with children or vulnerable adults?',
        'What level of DBS check does the employer require — standard or enhanced?',
        'Is the employer registered with the DBS to carry out checks?',
      ],
      means_tested: false,
      evidenceRequired: ['Multiple identity documents (passport, driving licence, utility bills, etc.)', 'Employer applies on applicant\'s behalf'],
    },
  },
  'other-right-to-work': {
    id: 'other-right-to-work', name: 'Right to work check', dept: 'Employer', deptKey: 'other',
    deadline: null,
    desc: 'Employer obligation to verify before hiring. Online share code or document check.',
    govuk_url: 'https://www.gov.uk/check-job-applicant-right-to-work',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Employers are legally required to verify that every employee has the right to work in the UK before they start. For non-UK/Irish nationals this is typically done via a Home Office share code online service.',
      universal: true,
      criteria: [
        { factor: 'employment', description: 'Required for all new employees before they begin work. Employer faces civil penalty if not done.' },
        { factor: 'immigration', description: 'Non-UK/Irish nationals provide a share code via the UK Visas & Immigration online portal. British/Irish citizens present their passport.' },
      ],
      keyQuestions: [
        'Is the employee a British or Irish citizen?',
        'Does the employee have a Biometric Residence Permit or eVisa?',
        'Has a share code been generated or original documents verified?',
      ],
      autoQualifiers: ['All new employees — employer obligation'],
      means_tested: false,
      evidenceRequired: ['British/Irish passport, or BRP/eVisa share code for non-UK/Irish nationals'],
    },
  },
  'other-pupil-premium': {
    id: 'other-pupil-premium', name: 'Pupil Premium', dept: 'DfE / School', deptKey: 'other',
    deadline: null,
    desc: 'DfE funding direct to school. Automatic if child has ever qualified for Free School Meals.',
    govuk_url: 'https://www.gov.uk/government/publications/pupil-premium',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Additional funding paid directly to the school (£1,480/year per eligible pupil at primary, £1,050 at secondary). Automatic once Free School Meals eligibility is confirmed. Parents should ensure the school knows the child is eligible.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Child has been eligible for Free School Meals at any point in the last 6 years, is a looked-after child, or has left care through adoption.' },
        { factor: 'dependency', description: 'Free School Meals eligibility must be registered — the school receives the funding automatically.' },
      ],
      keyQuestions: [
        'Is or was the child eligible for Free School Meals in the last 6 years?',
        'Is the child a looked-after child or care leaver?',
        'Is the school aware of the child\'s eligibility?',
      ],
      autoQualifiers: ['Free School Meals eligibility confirmed — school receives funding automatically'],
      means_tested: false,
      evidenceRequired: ['Free School Meals confirmation — school notifies DfE automatically'],
    },
  },
  'other-statutory-redundancy': {
    id: 'other-statutory-redundancy', name: 'Statutory Redundancy Pay', dept: 'Employer / Tribunal', deptKey: 'other',
    deadline: null,
    desc: 'Employer obligation based on age and length of service. Employment tribunal if refused.',
    govuk_url: 'https://www.gov.uk/redundancy-payments-helpline',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'A legal entitlement for employees made compulsorily redundant after 2 or more years of continuous employment. Amount depends on age, weekly pay (capped at £643/week), and length of service. Employer must pay — Employment Tribunal if they refuse.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Must have been continuously employed for at least 2 years and been made compulsorily redundant.' },
        { factor: 'age', description: 'Payment multiplier depends on age: 0.5 weeks\' pay per year under 22; 1 week per year aged 22–40; 1.5 weeks per year aged 41+.' },
      ],
      keyQuestions: [
        'Have you been continuously employed for at least 2 years?',
        'Were you made compulsorily redundant (not resigned or dismissed for conduct)?',
        'What was your weekly pay and how long have you worked there?',
      ],
      exclusions: ['Self-employed are not eligible.', 'Voluntary redundancy may have different terms (could be more generous, or affect entitlement to notice periods).', 'Not available if dismissed for gross misconduct.'],
      means_tested: false,
      evidenceRequired: ['Redundancy notice or letter from employer', 'Employment contract', 'Payslips to verify weekly pay'],
    },
  },
  'other-carers-leave': {
    id: 'other-carers-leave', name: "Carer's leave (employer)", dept: 'Employer', deptKey: 'other',
    deadline: null,
    desc: '5 days unpaid per year. Statutory right since April 2024.',
    govuk_url: 'https://www.gov.uk/carers-leave',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Up to 5 days of unpaid leave per year from day 1 of employment to provide or arrange care for a dependant with a long-term care need. A statutory right since April 2024. Can be taken as individual days or half days.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Must be an employee (not a worker or self-employed). Applies from the first day of employment.' },
        { factor: 'caring', description: 'Providing or arranging care for a dependant with a disability, long-term illness, mental health condition, or care needs associated with old age.' },
      ],
      keyQuestions: [
        'Are you an employee (not self-employed or a casual worker)?',
        'Are you providing care for a dependant with a long-term care need?',
        'Has your employer been informed of your caring responsibilities?',
      ],
      means_tested: false,
      evidenceRequired: ['Employer may request written evidence of the caring situation in some cases'],
    },
  },
  'other-help-to-buy': {
    id: 'other-help-to-buy', name: 'First Homes / Help to Buy scheme', dept: 'Homes England', deptKey: 'other',
    deadline: null,
    desc: 'Must be arranged before purchase completes. Various first-time buyer schemes available.',
    govuk_url: 'https://www.gov.uk/first-homes-scheme',
    serviceType: 'grant',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'First Homes offers new-build properties at a minimum 30% discount to first-time buyers. Other schemes include Shared Ownership and Mortgage Guarantee. Must be a first-time buyer. Income caps and property price limits apply.',
      universal: false,
      criteria: [
        { factor: 'property', description: 'First-time buyer purchasing a new-build property through an eligible scheme. For First Homes: property must not exceed £250,000 after discount (£420,000 in London).' },
        { factor: 'income', description: 'Household income cap varies by scheme — typically up to £80,000 (£90,000 in London) for First Homes.' },
      ],
      keyQuestions: [
        'Are you a first-time buyer?',
        'Are you looking at new-build properties?',
        'What is your household income?',
        'Are you eligible for a mortgage for the remaining amount?',
      ],
      exclusions: ['Not available to existing homeowners or those who have previously owned property.'],
      means_tested: true,
      evidenceRequired: ['Proof of first-time buyer status', 'Mortgage agreement in principle', 'Proof of income for scheme qualification'],
    },
  },

  // TPR ──────────────────────────────────────────────────────────────────────
  'tpr-workplace-pension': {
    id: 'tpr-workplace-pension', name: 'Workplace Pension auto-enrollment', dept: 'The Pensions Regulator', deptKey: 'tpr',
    deadline: 'Before 1st payday',
    desc: 'Mandatory for any employer paying staff £10,000+/year aged 22 to State Pension age. Must be set up before the first payday.',
    govuk_url: 'https://www.gov.uk/workplace-pensions-employers',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'All employers must automatically enrol eligible workers into a qualifying workplace pension scheme and make contributions. Eligible workers are aged 22 to State Pension age, earning at least £10,000/year. Employer must set up the scheme before the first payday.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Employing any worker who is aged 22 to State Pension age and earning more than £10,000 per year. Employer obligation — applies from day 1 of taking on qualifying staff.' },
      ],
      keyQuestions: [
        'Are you taking on any employees who earn over £10,000/year and are aged 22 to State Pension age?',
        'Have you chosen a qualifying pension provider?',
        'Do you know your staging or duties start date?',
      ],
      means_tested: false,
      evidenceRequired: ['PAYE employer reference number', 'Chosen pension provider details', 'Letter of compliance to The Pensions Regulator (declaration of compliance within 5 months of duties start date)'],
    },
  },

  // SLC ──────────────────────────────────────────────────────────────────────
  'slc-student-finance': {
    id: 'slc-student-finance', name: 'Student Finance (tuition fee + maintenance loans)', dept: 'Student Loans Company', deptKey: 'slc',
    deadline: null,
    desc: 'Tuition Fee Loan (up to £9,250/yr) and Maintenance Loan (income-assessed) for undergraduate study. Repaid via salary deductions once earning over threshold.',
    govuk_url: 'https://www.gov.uk/student-finance',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'UK students starting an undergraduate course at a UK university can apply for a Tuition Fee Loan (up to £9,250/year, paid directly to university) and a Maintenance Loan (income-assessed, to cover living costs). Repayments begin after graduating and earning over the threshold (currently £25,000/year). Applications open the year before study.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Typically 18 or over (no upper age limit for loans, though some conditions apply for those over 60).' },
        { factor: 'residency', description: 'Must be normally resident in England for 3+ years before the course starts, and a UK national or settled person.' },
        { factor: 'income', description: 'Maintenance Loan amount is income-assessed based on household income. Tuition Fee Loan is not means-tested.' },
      ],
      keyQuestions: [
        'Are you starting a qualifying undergraduate course?',
        'Have you lived in England for at least 3 years?',
        'What is your household income? (Affects Maintenance Loan amount.)',
        'Are you a UK national, or do you have settled or pre-settled status?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of identity (passport)', 'Proof of course enrollment or offer letter', 'Household income evidence (P60 or self-assessment from parents/partner)', 'National Insurance number'],
    },
  },
};

// ─── EDGES ────────────────────────────────────────────────────────────────────

export const EDGES: Edge[] = [
  // Birth
  { from: 'gro-register-birth',       to: 'hmrc-child-benefit',            type: 'ENABLES' },
  { from: 'gro-register-birth',       to: 'hmrc-free-childcare-15',         type: 'ENABLES' },
  { from: 'gro-register-birth',       to: 'dwp-sure-start-grant',           type: 'ENABLES' },
  { from: 'hmrc-free-childcare-15',   to: 'hmrc-free-childcare-30',         type: 'ENABLES' },
  { from: 'hmrc-smp',                 to: 'hmrc-spl',                       type: 'ENABLES' },
  { from: 'dwp-maternity-allowance',  to: 'hmrc-spl',                       type: 'ENABLES' },
  { from: 'hmrc-child-benefit',       to: 'hmrc-tax-free-childcare',        type: 'ENABLES' },

  // Death
  { from: 'gro-register-death',       to: 'gro-death-certificate',          type: 'ENABLES' },
  { from: 'gro-register-death',       to: 'dwp-tell-us-once',               type: 'ENABLES' },
  { from: 'gro-register-death',       to: 'dwp-bereavement-support',        type: 'ENABLES' },
  { from: 'gro-register-death',       to: 'hmcts-probate',                  type: 'ENABLES' },
  { from: 'gro-death-certificate',    to: 'hmcts-probate',                  type: 'REQUIRES' },
  { from: 'gro-death-certificate',    to: 'hmrc-iht400',                    type: 'ENABLES' },
  { from: 'hmrc-iht400',             to: 'hmcts-probate',                   type: 'ENABLES' },
  { from: 'dwp-tell-us-once',         to: 'dvla-cancel-licence',            type: 'ENABLES' },
  { from: 'dwp-tell-us-once',         to: 'la-council-tax-single-discount', type: 'ENABLES' },
  { from: 'dwp-tell-us-once',         to: 'opg-lpa-activation',             type: 'ENABLES' },
  { from: 'gro-register-death',       to: 'dwp-funeral-payment',            type: 'ENABLES' },
  { from: 'gro-register-death',       to: 'hmrc-guardians-allowance',       type: 'ENABLES' },
  { from: 'gro-register-death',       to: 'hmrc-statutory-parental-bereavement', type: 'ENABLES' },
  { from: 'hmrc-child-benefit',       to: 'hmrc-guardians-allowance',       type: 'ENABLES' },

  // Marriage
  { from: 'gro-give-notice',          to: 'gro-marriage-cert',              type: 'ENABLES' },
  { from: 'gro-marriage-cert',        to: 'other-passport-name',            type: 'ENABLES' },
  { from: 'gro-marriage-cert',        to: 'dvla-name-change',               type: 'ENABLES' },
  { from: 'gro-marriage-cert',        to: 'hmrc-marriage-allowance',        type: 'ENABLES' },
  { from: 'gro-marriage-cert',        to: 'hmrc-update-records',            type: 'ENABLES' },
  { from: 'gro-marriage-cert',        to: 'la-electoral-roll',              type: 'ENABLES' },

  // Retirement
  { from: 'hmrc-ni-check',            to: 'dwp-state-pension',              type: 'ENABLES' },
  { from: 'dwp-state-pension',        to: 'dwp-pension-credit',             type: 'ENABLES' },
  { from: 'dwp-pension-credit',       to: 'dwp-winter-fuel',                type: 'ENABLES' },
  { from: 'dwp-pension-credit',       to: 'other-tv-licence-pension',       type: 'ENABLES' },
  { from: 'dwp-state-pension',        to: 'la-bus-pass',                    type: 'ENABLES' },
  { from: 'dwp-state-pension',        to: 'hmrc-tax-on-pension',            type: 'ENABLES' },

  // Business
  { from: 'ch-register-ltd',          to: 'hmrc-corporation-tax',           type: 'ENABLES' },
  { from: 'ch-register-ltd',          to: 'hmrc-self-assessment',           type: 'ENABLES' },
  { from: 'ch-register-ltd',          to: 'hmrc-paye',                      type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader', to: 'hmrc-self-assessment',          type: 'ENABLES' },
  { from: 'hmrc-paye',                to: 'other-employers-liability',      type: 'REQUIRES' },
  { from: 'hmrc-paye',                to: 'tpr-workplace-pension',          type: 'ENABLES' },
  { from: 'hmrc-vat',                 to: 'hmrc-mtd',                       type: 'ENABLES' },
  { from: 'hmrc-corporation-tax',     to: 'hmrc-vat',                       type: 'ENABLES' },

  // Home buying
  { from: 'hmrc-lisa',                to: 'hmrc-sdlt',                      type: 'ENABLES' },
  { from: 'hmrc-sdlt',                to: 'lr-registration',                type: 'REQUIRES' },
  { from: 'lr-registration',          to: 'la-electoral-roll',              type: 'ENABLES' },
  { from: 'lr-registration',          to: 'la-council-tax',                 type: 'ENABLES' },

  // Moving
  { from: 'la-council-tax',           to: 'la-council-tax-reduction',       type: 'ENABLES' },

  // Job loss
  { from: 'hmrc-p45',                 to: 'dwp-universal-credit',           type: 'ENABLES' },
  { from: 'hmrc-p45',                 to: 'hmrc-tax-refund',                type: 'ENABLES' },
  { from: 'hmrc-p45',                 to: 'dwp-new-style-jsa',              type: 'ENABLES' },
  { from: 'dwp-universal-credit',     to: 'dwp-ni-credits',                 type: 'ENABLES' },
  { from: 'dwp-universal-credit',     to: 'la-council-tax-reduction',       type: 'ENABLES' },
  { from: 'dwp-new-style-jsa',        to: 'dwp-ni-credits',                 type: 'ENABLES' },

  // Benefits challenge
  { from: 'dwp-universal-credit',     to: 'dwp-mandatory-reconsideration',  type: 'ENABLES' },
  { from: 'dwp-new-style-jsa',        to: 'dwp-mandatory-reconsideration',  type: 'ENABLES' },
  { from: 'dwp-new-style-esa',        to: 'dwp-mandatory-reconsideration',  type: 'ENABLES' },
  { from: 'dwp-pip',                  to: 'dwp-mandatory-reconsideration',  type: 'ENABLES' },
  { from: 'dwp-mandatory-reconsideration', to: 'hmcts-benefit-tribunal',    type: 'ENABLES' },
  { from: 'hmcts-legal-aid',          to: 'hmcts-benefit-tribunal',         type: 'ENABLES' },

  // Disability
  { from: 'dwp-pip',                  to: 'other-motability',               type: 'ENABLES' },
  { from: 'dwp-pip',                  to: 'la-blue-badge',                  type: 'ENABLES' },
  { from: 'dwp-pip',                  to: 'dwp-carers-allowance',           type: 'ENABLES' },
  { from: 'dwp-pip',                  to: 'dwp-uc-health',                  type: 'ENABLES' },
  { from: 'dwp-pip',                  to: 'dwp-access-to-work',             type: 'ENABLES' },
  { from: 'dwp-pip',                  to: 'other-disabled-railcard',        type: 'ENABLES' },
  { from: 'dwp-pip',                  to: 'nhs-free-prescriptions',         type: 'ENABLES' },
  { from: 'dwp-attendance-allowance', to: 'la-blue-badge',                  type: 'ENABLES' },
  { from: 'dwp-attendance-allowance', to: 'dwp-carers-allowance',           type: 'ENABLES' },
  { from: 'dwp-attendance-allowance', to: 'other-disabled-railcard',        type: 'ENABLES' },

  // Carer
  { from: 'dwp-carers-allowance',     to: 'dwp-uc-carer',                   type: 'ENABLES' },
  { from: 'dwp-carers-allowance',     to: 'hmrc-carers-credit',             type: 'ENABLES' },
  { from: 'opg-lpa',                  to: 'opg-lpa-activation',             type: 'ENABLES' },

  // Divorce
  { from: 'hmcts-legal-aid',          to: 'hmcts-divorce',                  type: 'ENABLES' },
  { from: 'hmcts-divorce',            to: 'hmcts-financial-order',          type: 'ENABLES' },
  { from: 'hmcts-divorce',            to: 'hmcts-child-arrangements',       type: 'ENABLES' },
  { from: 'hmcts-divorce',            to: 'dwp-child-maintenance',          type: 'ENABLES' },
  { from: 'hmcts-divorce',            to: 'hmrc-cancel-marriage-allowance', type: 'ENABLES' },
  { from: 'hmcts-divorce',            to: 'dwp-universal-credit',           type: 'ENABLES' },
  { from: 'hmcts-divorce',            to: 'hmrc-child-benefit-transfer',    type: 'ENABLES' },
  { from: 'hmcts-divorce',            to: 'la-council-tax-single-discount', type: 'ENABLES' },

  // School
  { from: 'la-school-place',          to: 'la-free-school-meals',           type: 'ENABLES' },
  { from: 'la-free-school-meals',     to: 'other-pupil-premium',            type: 'ENABLES' },
  { from: 'la-school-place',          to: 'la-send-ehc',                    type: 'ENABLES' },

  // Immigration
  { from: 'ho-visa',                  to: 'ho-brp',                         type: 'ENABLES' },
  { from: 'ho-brp',                   to: 'dwp-ni-number',                  type: 'ENABLES' },
  { from: 'ho-brp',                   to: 'nhs-gp-register',                type: 'ENABLES' },
  { from: 'ho-brp',                   to: 'other-right-to-work',            type: 'ENABLES' },
  { from: 'ho-brp',                   to: 'ho-life-in-uk',                  type: 'ENABLES' },
  { from: 'ho-life-in-uk',            to: 'ho-ilr',                         type: 'REQUIRES' },
  { from: 'dwp-ni-number',            to: 'ho-ilr',                         type: 'REQUIRES' },
  { from: 'ho-ilr',                   to: 'ho-citizenship',                 type: 'ENABLES' },
  { from: 'ho-eu-settled-status',     to: 'dwp-ni-number',                  type: 'ENABLES' },
  { from: 'ho-eu-settled-status',     to: 'nhs-gp-register',                type: 'ENABLES' },
  { from: 'ho-eu-settled-status',     to: 'ho-ilr',                         type: 'ENABLES' },

  // Driving
  { from: 'dvla-provisional-licence', to: 'dvsa-theory-test',               type: 'REQUIRES' },
  { from: 'dvsa-theory-test',         to: 'dvsa-driving-test',              type: 'REQUIRES' },

  // University
  { from: 'slc-student-finance',      to: 'la-electoral-roll',              type: 'ENABLES' },
  { from: 'slc-student-finance',      to: 'nhs-gp-register',                type: 'ENABLES' },

  // Voting
  { from: 'la-electoral-roll',        to: 'la-voter-authority-cert',        type: 'ENABLES' },
];

// ─── LIFE EVENTS ──────────────────────────────────────────────────────────────

export const LIFE_EVENTS: LifeEvent[] = [
  {
    id: 'baby', icon: '◦', name: 'Having a Baby',
    desc: 'Birth registration, parental leave and childcare',
    entryNodes: ['gro-register-birth','nhs-healthy-start','nhs-free-prescriptions-pregnancy',
                 'hmrc-smp','dwp-maternity-allowance','hmrc-spp','dwp-sure-start-grant'],
  },
  {
    id: 'bereavement', icon: '—', name: 'Death of Someone Close',
    desc: 'Registration, probate and bereavement payments',
    entryNodes: ['gro-register-death','dwp-bereavement-support','opg-lpa-activation',
                 'dwp-funeral-payment','hmrc-statutory-parental-bereavement'],
  },
  {
    id: 'marriage', icon: '∞', name: 'Getting Married',
    desc: 'Legal notice, certificates and name changes',
    entryNodes: ['gro-give-notice','gro-marriage-cert'],
  },
  {
    id: 'retirement', icon: '◐', name: 'Retiring',
    desc: 'State Pension, Pension Credit and age entitlements',
    entryNodes: ['hmrc-ni-check','dwp-state-pension','dwp-attendance-allowance',
                 'la-bus-pass','la-council-tax-reduction'],
  },
  {
    id: 'business', icon: '◈', name: 'Starting a Business',
    desc: 'Registration, tax obligations and compliance',
    entryNodes: ['ch-register-ltd','hmrc-register-sole-trader','hmrc-vat',
                 'la-business-rates','la-food-hygiene','other-dbs'],
  },
  {
    id: 'buying-home', icon: '⌂', name: 'Buying a Home',
    desc: 'Stamp duty, land registration and first-time buyer schemes',
    entryNodes: ['other-help-to-buy','hmrc-lisa','hmrc-sdlt'],
  },
  {
    id: 'moving', icon: '→', name: 'Moving House',
    desc: 'Address updates across all government systems',
    entryNodes: ['la-electoral-roll','la-council-tax','dvla-update-address',
                 'hmrc-update-records','nhs-gp-register'],
  },
  {
    id: 'job-loss', icon: '⊘', name: 'Losing Your Job',
    desc: 'Benefits, tax refunds and NI record protection',
    entryNodes: ['hmrc-p45','other-statutory-redundancy','dwp-new-style-esa'],
  },
  {
    id: 'disability', icon: '◎', name: 'Disability or Health Condition',
    desc: 'Benefits, adaptations and workplace support',
    entryNodes: ['dwp-pip','dwp-attendance-allowance','dvla-notify-condition',
                 'la-disabled-facilities-grant','nhs-care-assessment'],
  },
  {
    id: 'carer', icon: '⊕', name: 'Becoming a Carer',
    desc: 'Allowances, NI credits and legal powers',
    entryNodes: ['dwp-carers-allowance','la-carers-assessment','opg-lpa','other-carers-leave'],
  },
  {
    id: 'divorce', icon: '÷', name: 'Separating or Divorcing',
    desc: 'Legal proceedings, children and financial impacts',
    entryNodes: ['hmcts-legal-aid','hmcts-divorce','dwp-child-maintenance',
                 'la-council-tax-single-discount'],
  },
  {
    id: 'school', icon: '◌', name: 'Child Starting School',
    desc: 'School places, meals, SEND and funding',
    entryNodes: ['la-school-place','la-send-ehc','hmrc-free-childcare-30'],
  },
  {
    id: 'immigration', icon: '✦', name: 'Arriving in the UK',
    desc: 'Visas, BRP, NI number and NHS access',
    entryNodes: ['ho-visa'],
  },
  {
    id: 'driving', icon: '◉', name: 'Learning to Drive',
    desc: 'Provisional licence, theory test and driving test',
    entryNodes: ['dvla-provisional-licence'],
  },
  {
    id: 'university', icon: '◳', name: 'Going to University',
    desc: 'Student finance, accommodation registration and healthcare',
    entryNodes: ['slc-student-finance'],
  },
  {
    id: 'new-job', icon: '◆', name: 'Starting a New Job',
    desc: 'Tax setup, workplace pension and employer checks',
    entryNodes: ['tpr-workplace-pension', 'dwp-access-to-work'],
  },
];
