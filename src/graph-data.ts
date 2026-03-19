/**
 * graph-data.ts — The service graph
 *
 * Three data structures make up the graph:
 *
 *   NODES       — every government service, deduplicated across life events
 *   EDGES       — typed relationships between services
 *   LIFE_EVENTS — the 16 entry points into the graph (one per life event)
 *
 * Edge types:
 *   REQUIRES → strict ordering; the source must be completed before the target
 *   ENABLES  → the source makes the target accessible or relevant
 *
 * Life events don't appear in the graph themselves — they just point to a
 * set of entry nodes (the services directly triggered by that event).
 * The traversal engine handles discovering everything downstream.
 *
 * ─── AGENT INTERACTION LAYER ──────────────────────────────────────────────
 *
 * Each service node carries an `agentInteraction` object that tells an AI
 * agent exactly how it can help the user interact with this service:
 *
 *   methods[]         — how to apply (online, phone, post, in-person)
 *   apiAvailable      — whether a GOV.UK API exists for this service
 *   apiUrl            — developer documentation for the API (if any)
 *   onlineFormUrl     — direct URL to start the application / form
 *   authRequired      — authentication mechanism needed
 *   agentCanComplete  — full | partial | inform-only
 *   agentSteps[]      — what an agent can actually do for the user
 *   missingBenefitId  — ID in the MissingBenefit.com API (if covered)
 *
 * ─── FINANCIAL DATA ──────────────────────────────────────────────────────
 *
 * Benefits and grants carry a `financialData` object with structured rates
 * from the 2025/26 tax year, so agents can estimate value:
 *
 *   taxYear           — "2025-26"
 *   frequency         — weekly | monthly | annual | one-off
 *   rates             — key-value pairs of rate names to amounts (£)
 *   source            — GOV.UK page where rates are published
 *
 * ─── DEVOLVED NATIONS ────────────────────────────────────────────────────
 *
 * Services that only apply in specific UK nations carry a `nations` field:
 *   'GB' = Great Britain (England + Scotland + Wales)
 *   'england' | 'scotland' | 'wales' | 'northern-ireland'
 *   Absence of the field = UK-wide.
 *
 * ─── SUPPORT & CONTACT LAYER ───────────────────────────────────────────
 *
 * Two-tier contact architecture:
 *   DEPT_CONTACTS     — department-level defaults (19 departments)
 *   node.contactInfo  — service-specific override (where the service has
 *                       its own helpline, e.g. each DWP benefit)
 *
 * Resolution: node.contactInfo > DEPT_CONTACTS[deptKey] > undefined
 *
 * Each ContactInfo can carry:
 *   phone             — primary helpline (number, textphone, relay, welsh, BSL)
 *   additionalPhones  — secondary lines
 *   hours             — structured opening hours per day group
 *   webchatUrl        — online chat service
 *   contactFormUrl    — online enquiry form
 *   officeLocatorUrl  — "find your local X" URL
 *   localAuthority    — true = varies by council
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Nation =
  | 'england'
  | 'scotland'
  | 'wales'
  | 'northern-ireland';

export type ServiceType =
  | 'benefit'       // financial payment to eligible individuals
  | 'entitlement'   // non-financial right or access (free service, discount)
  | 'obligation'    // legal requirement to act
  | 'registration'  // formally registering a fact or entity
  | 'application'   // applying for a decision or assessment
  | 'legal_process' // court or tribunal proceeding
  | 'document'      // obtaining a formal document
  | 'grant';        // one-off financial award

export type ApplicationMethod = 'online' | 'phone' | 'post' | 'in-person';
export type AuthMethod = 'government-gateway' | 'gov-uk-verify' | 'nhs-login' | 'companies-house' | 'none';
export type AgentCapability = 'full' | 'partial' | 'inform-only';

export interface AgentInteraction {
  methods:          ApplicationMethod[];  // how to apply
  apiAvailable:     boolean;              // does a GOV.UK developer API exist?
  apiUrl?:          string;               // developer documentation URL
  onlineFormUrl?:   string;               // direct link to start application
  authRequired:     AuthMethod;           // authentication mechanism
  agentCanComplete: AgentCapability;      // what level of help an agent can give
  agentSteps:       string[];             // concrete steps an agent can take
  missingBenefitId?: string;              // ID in MissingBenefit.com API (if covered)
}

export interface FinancialData {
  taxYear:    string;                     // e.g. "2025-26"
  frequency:  'weekly' | 'monthly' | 'annual' | 'one-off';
  rates:      Record<string, number>;     // named amounts in GBP
  source:     string;                     // GOV.UK page where rates are published
}

// ─── SUPPORT & CONTACT LAYER ────────────────────────────────────────────────

export interface PhoneContact {
  number:      string;   // E.164 readable: "+44 800 169 0310"
  textphone?:  string;   // Textphone/minicom number
  relay?:      string;   // Relay UK ("18001 then 0800 169 0310")
  welsh?:      string;   // Welsh language line
  bsl?:        string;   // BSL video relay URL
  label?:      string;   // e.g. "UC helpline"
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface OpeningHours {
  days:  DayOfWeek[];    // ['mon','tue','wed','thu','fri']
  open:  string;         // "08:00" (24h)
  close: string;         // "18:00"
}

export interface ContactInfo {
  phone?:            PhoneContact;
  additionalPhones?: PhoneContact[];    // secondary lines (e.g. bereavement-specific)
  hours?:            OpeningHours[];    // one entry per distinct schedule block
  webchatUrl?:       string;
  contactFormUrl?:   string;
  complaintsUrl?:    string;
  officeLocatorUrl?: string;
  localAuthority?:   boolean;           // true = "contact your local council"
  notes?:            string;            // "Closed on bank holidays"
}

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
  ruleIn:            string[];  // concise positive signals ("Child under 16")
  ruleOut:           string[];  // concise negative signals ("Income over £80k")
  rules?:            import('./rules.js').Rule[];  // structured machine-evaluable rules
}

export interface ServiceNode {
  id:               string;
  name:             string;
  dept:             string;      // display name, e.g. "HMRC"
  deptKey:          string;      // lowercase slug for filtering, e.g. "hmrc"
  deadline:         string | null;
  desc:             string;
  govuk_url:        string;      // canonical GOV.UK URL
  serviceType:      ServiceType;
  proactive:        boolean;     // agent should volunteer this based on life-event signals
  gated:            boolean;     // only surface after confirming a prerequisite service
  eligibility:      EligibilityInfo;
  agentInteraction: AgentInteraction;
  financialData?:   FinancialData;      // present for benefits/grants with known rates
  nations?:         Nation[];           // absent = UK-wide; present = only these nations
  contactInfo?:     ContactInfo;       // service-specific (overrides dept default)
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

// ─── DEPARTMENT CONTACT DEFAULTS ─────────────────────────────────────────────
// Fallback contact info keyed by deptKey.  Service-specific contactInfo on a
// node takes precedence; this table covers the ~80 nodes that share the
// department-level helpline.

export const DEPT_CONTACTS: Partial<Record<string, ContactInfo>> = {

  gro: {
    phone: { number: '+44 300 123 1837', textphone: '+44 329 822 0391', relay: '18001 then 0300 123 1837', label: 'GRO certificate enquiries' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '20:00' },
      { days: ['sat'], open: '09:00', close: '16:00' },
    ],
    contactFormUrl: 'https://www.gro.gov.uk/gro/content/certificates/ContactUs.asp',
    notes: 'Closed on bank holidays and public holidays',
  },

  hmrc: {
    phone: { number: '+44 300 200 3300', textphone: '+44 300 200 3319', relay: '18001 then 0300 200 3300', welsh: '+44 300 200 1900', label: 'HMRC general enquiries' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
    ],
    webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/self-assessment',
    notes: 'Closed on bank holidays. Specific services have dedicated helplines.',
  },

  dwp: {
    phone: { number: '+44 800 169 0310', textphone: '+44 800 169 0314', relay: '18001 then 0800 169 0310', label: 'DWP general enquiries' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
    ],
    notes: 'Most DWP benefits have a dedicated helpline — see service-level contact.',
  },

  nhs: {
    phone: { number: '111', label: 'NHS 111' },
    hours: [
      { days: ['mon','tue','wed','thu','fri','sat','sun'], open: '00:00', close: '23:59' },
    ],
    notes: 'NHS 111 is available 24/7. For GP registration, contact the surgery directly.',
  },

  dvla: {
    phone: { number: '+44 300 790 6801', textphone: '+44 300 123 1279', relay: '18001 then 0300 790 6801', welsh: '+44 300 790 6819', label: 'DVLA general enquiries' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '19:00' },
      { days: ['sat'], open: '08:00', close: '14:00' },
    ],
    webchatUrl: 'https://www.gov.uk/contact-the-dvla',
    notes: 'Closed on bank holidays',
  },

  dvsa: {
    phone: { number: '+44 300 200 1122', textphone: '+44 300 200 1166', relay: '18001 then 0300 200 1122', label: 'DVSA customer services' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '16:00' },
    ],
  },

  ch: {
    phone: { number: '+44 303 123 4500', textphone: '+44 29 2038 1245', relay: '18001 then 0303 123 4500', label: 'Companies House contact centre' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:30', close: '18:00' },
    ],
    contactFormUrl: 'https://www.gov.uk/contact-companies-house',
  },

  hmcts: {
    phone: { number: '+44 300 123 1372', textphone: '+44 300 123 1372', relay: '18001 then 0300 123 1372', label: 'HMCTS general enquiries' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:30', close: '17:00' },
    ],
    contactFormUrl: 'https://www.gov.uk/contact-hmcts',
    notes: 'Probate, divorce and tribunal services each have dedicated lines.',
  },

  la: {
    localAuthority: true,
    officeLocatorUrl: 'https://www.gov.uk/find-local-council',
    notes: 'Contact your local council. Phone numbers and opening hours vary by authority.',
  },

  opg: {
    phone: { number: '+44 300 456 0300', textphone: '+44 115 934 2778', relay: '18001 then 0300 456 0300', welsh: '+44 300 456 0300', label: 'Office of the Public Guardian' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:00' },
    ],
    contactFormUrl: 'https://www.gov.uk/government/organisations/office-of-the-public-guardian',
  },

  sss: {
    phone: { number: '+44 800 182 2222', relay: '18001 then 0800 182 2222', label: 'Social Security Scotland' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
    ],
    webchatUrl: 'https://www.socialsecurity.gov.scot/contact-us',
    notes: 'Handles all Social Security Scotland benefits',
  },

  wg: {
    phone: { number: '+44 300 025 6150', label: 'Welsh Government helpline' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:30', close: '17:30' },
    ],
    contactFormUrl: 'https://www.gov.wales/contact-us',
  },

  'ni-dfc': {
    phone: { number: '+44 28 9082 9902', textphone: '+44 28 9031 1092', relay: '18001 then 028 9082 9902', label: 'NI Department for Communities' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:00' },
    ],
    contactFormUrl: 'https://www.nidirect.gov.uk/contacts/departments-communities-contact-details',
  },

  'ni-lps': {
    phone: { number: '+44 28 9049 5572', label: 'NI Land & Property Services' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:00' },
    ],
  },

  ho: {
    phone: { number: '+44 300 123 2241', relay: '18001 then 0300 123 2241', label: 'UK Visas and Immigration contact centre' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '14:30' },
    ],
    contactFormUrl: 'https://www.gov.uk/contact-ukvi-inside-outside-uk',
    notes: 'Phone hours are limited. Online contact form available 24/7.',
  },

  lr: {
    phone: { number: '+44 300 006 0411', textphone: '+44 300 006 0411', relay: '18001 then 0300 006 0411', welsh: '+44 300 006 0422', label: 'HM Land Registry' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
    ],
    contactFormUrl: 'https://www.gov.uk/government/organisations/land-registry/about/access-and-opening',
  },

  slc: {
    phone: { number: '+44 300 100 0607', label: 'Student Loans Company' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
    ],
    contactFormUrl: 'https://www.gov.uk/contact-student-finance-england',
    notes: 'Separate numbers for repayment queries and new applications.',
  },

  tpr: {
    phone: { number: '+44 345 600 7060', label: 'The Pensions Regulator' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:00' },
    ],
    contactFormUrl: 'https://www.thepensionsregulator.gov.uk/en/contact-us',
  },

  other: {
    notes: 'Contact information varies by service. Check the GOV.UK page for details.',
  },
};

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
      ruleIn: [],
      ruleOut: [],      rules: [
        {
          "type": "deadline",
          "triggerEvent": "birth_date",
          "triggerLabel": "Date of birth",
          "maxDays": 42,
          "label": "Must register within 42 days of birth"
        }
      ],

    },
    agentInteraction: {
      methods: ['in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain that birth registration must be done in person at a local register office',
        'Help user find their nearest register office',
        'List required documents (hospital notification, parents\' ID)',
        'Advise on the 42-day deadline',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 123 1837',
        textphone: '+44 329 822 0391',
        relay: '18001 then 0300 123 1837',
        label: 'GRO certificate enquiries',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '20:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '16:00',
        },
      ],
      officeLocatorUrl: 'https://www.gov.uk/register-offices',
      notes: 'Must be done in person at a register office.',
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
      ruleIn: [],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "A death has occurred"
        },
        {
          "type": "deadline",
          "triggerEvent": "death_date",
          "triggerLabel": "Date of death",
          "maxDays": 5,
          "label": "Must register within 5 days of death"
        }
      ],

    },
    agentInteraction: {
      methods: ['in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain that death registration must be done in person at a local register office',
        'Help user find their nearest register office',
        'List required documents (MCCD, deceased\'s details)',
        'Advise on the 5-day deadline',
        'Explain Tell Us Once service offered at the appointment',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 123 1837',
        textphone: '+44 329 822 0391',
        relay: '18001 then 0300 123 1837',
        label: 'GRO certificate enquiries',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '20:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '16:00',
        },
      ],
      officeLocatorUrl: 'https://www.gov.uk/register-offices',
      notes: 'Must be done in person at a register office.',
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
      ruleIn: [],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "A death has occurred"
        },
        {
          "type": "dependency",
          "serviceId": "gro-register-death",
          "condition": "completed",
          "label": "Death must be registered before certificates can be ordered"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gro.gov.uk/gro/content/certificates/default.asp',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to GRO certificate ordering service',
        'Advise how many copies to order (recommend at least 5)',
        'Explain that banks, insurers, HMRC, probate and pension providers each need an original',
        'Confirm current fee per copy (£11)',
      ],
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
      ruleIn: ['Both parties aged 18 or over', 'Resident in district 7+ days'],
      ruleOut: ['Either party currently married or in civil partnership'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 18,
          "label": "Both parties must be 18 or over"
        },
        {
          "type": "not",
          "label": "Neither party currently married or in a civil partnership",
          "rules": [
            {
              "type": "enum",
              "field": "relationship_status",
              "oneOf": [
                "married",
                "civil_partnership"
              ],
              "label": "Currently married or in civil partnership"
            }
          ]
        },
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Resident in England or Wales"
        },
        {
          "type": "deadline",
          "triggerEvent": "wedding_date",
          "triggerLabel": "Date of wedding/ceremony",
          "maxDays": -28,
          "label": "Notice must be given at least 28 days before the ceremony"
        }
      ],

    },
    agentInteraction: {
      methods: ['in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain that notice of marriage must be given in person at a local register office',
        'Help user find their nearest register office',
        'List required documents (passport, proof of address, decree absolute if applicable)',
        'Advise on the 28-day minimum notice period',
        'Flag extra requirements for non-British/Irish citizens',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 123 1837',
        textphone: '+44 329 822 0391',
        relay: '18001 then 0300 123 1837',
        label: 'GRO certificate enquiries',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '20:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '16:00',
        },
      ],
      officeLocatorUrl: 'https://www.gov.uk/register-offices',
      notes: 'Must give notice in person at a register office at least 28 days before ceremony.',
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
      ruleIn: [],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online', 'post', 'in-person'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gro.gov.uk/gro/content/certificates/default.asp',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to GRO certificate ordering service',
        'Advise how many certified copies to order (name change, DVLA, HMRC, passport each need one)',
        'Explain in-person collection option at register office',
        'Confirm current fee per copy',
      ],
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
      ruleIn: ['Responsible for child under 16'],
      ruleOut: ['Both parents earn over £80k'],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Must be responsible for a child"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "<",
          "value": 16,
          "label": "Child must be under 16 (or under 20 in approved education)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/child-benefit/how-to-claim',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to online Child Benefit claim form',
        'Explain eligibility and High Income Child Benefit Charge thresholds',
        'Advise on backdating (up to 3 months)',
        'Explain NI credit protection even if opting out of payment',
        'List required documents (birth certificate, bank details)',
      ],
      missingBenefitId: 'childBenefit',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { first_child: 26.05, subsequent_child: 17.25 },
      source: 'https://www.gov.uk/child-benefit/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3100',
        textphone: '+44 300 200 3103',
        relay: '18001 then 0300 200 3100',
        label: 'Child Benefit helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/child-benefit',
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
      ruleIn: ['Both parents deceased or one missing', 'Claiming Child Benefit for the child'],
      ruleOut: ['Surviving parent traceable and able to care for child'],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Must be caring for a child"
        },
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "Both parents of the child must have died (or one dead and other untraceable)"
        },
        {
          "type": "dependency",
          "serviceId": "hmrc-child-benefit",
          "condition": "receiving",
          "label": "Must be claiming Child Benefit for the child"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/guardians-allowance/how-to-claim',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to Guardian\'s Allowance claim form',
        'Confirm Child Benefit is already being claimed for the child',
        'Explain qualifying circumstances (both parents deceased or one missing)',
        'List required evidence (death certificates, CB reference)',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { weekly_rate: 21.75 },
      source: 'https://www.gov.uk/guardians-allowance/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3100',
        textphone: '+44 300 200 3103',
        relay: '18001 then 0300 200 3100',
        label: 'Child Benefit helpline (Guardian\'s Allowance)',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Child under 18 died or stillbirth after 24 weeks', 'Employee at time of bereavement'],
      ruleOut: [],      rules: [
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "employed"
          ],
          "label": "Must be an employee"
        },
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "A child under 18 has died or a baby was stillborn after 24 weeks"
        },
        {
          "type": "deadline",
          "triggerEvent": "child_bereavement_date",
          "triggerLabel": "Date of child's death or stillbirth",
          "maxDays": 392,
          "label": "Must claim within 56 weeks of the death"
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'post'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain entitlement to 2 weeks bereavement leave and pay',
        'Advise that the claim is made through the employer',
        'Explain the 56-week claim window',
        'Clarify that leave is a day-one right but pay requires 26 weeks\' service',
      ],
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
      ruleIn: ['Employed 26+ weeks with same employer', 'Earnings above lower earnings limit'],
      ruleOut: ['Self-employed', 'Fewer than 26 weeks continuous employment'],      rules: [
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "employed"
          ],
          "label": "Must be an employee (not self-employed)"
        },
        {
          "type": "boolean",
          "field": "is_pregnant",
          "expected": true,
          "label": "Currently pregnant or recently given birth"
        },
        {
          "type": "comparison",
          "field": "weekly_earnings",
          "operator": ">=",
          "value": 123,
          "label": "Average weekly earnings at or above the Lower Earnings Limit (£123/week)"
        },
        {
          "type": "boolean",
          "field": "custom_facts.employed_26_weeks_same_employer",
          "expected": true,
          "label": "Employed continuously for 26+ weeks with the same employer by the 15th week before due date"
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'post'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain SMP eligibility criteria and rates',
        'Advise that SMP is claimed through the employer',
        'Explain the MATB1 certificate requirement',
        'Direct to Maternity Allowance if not eligible for SMP',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { first_6_weeks_percent: 90, remaining_33_weeks: 187.18 },
      source: 'https://www.gov.uk/maternity-pay-leave/pay',
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
      ruleIn: ['Father, partner, or co-adopter of newborn', 'Employed 26+ weeks continuously'],
      ruleOut: [],      rules: [
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "employed"
          ],
          "label": "Must be an employee"
        },
        {
          "type": "comparison",
          "field": "weekly_earnings",
          "operator": ">=",
          "value": 123,
          "label": "Average weekly earnings at or above the Lower Earnings Limit (£123/week)"
        },
        {
          "type": "boolean",
          "field": "custom_facts.employed_26_weeks_same_employer",
          "expected": true,
          "label": "Employed continuously for 26+ weeks with the same employer"
        },
        {
          "type": "deadline",
          "triggerEvent": "child_birth_date",
          "triggerLabel": "Date of birth or adoption",
          "maxDays": 56,
          "label": "Must be taken within 8 weeks of the birth or adoption"
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'post'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain SPP eligibility criteria and rates',
        'Advise that SPP is claimed through the employer',
        'Explain SC3 self-certification form requirement',
        'Clarify the 8-week window after birth',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { weekly_rate: 187.18 },
      source: 'https://www.gov.uk/paternity-pay-leave/pay',
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
      ruleIn: ['Mother curtailing maternity leave', 'Both parents meet employment and earnings tests'],
      ruleOut: ['Mother not eligible for SMP or Maternity Allowance'],      rules: [
        {
          "type": "dependency",
          "serviceId": "hmrc-smp",
          "condition": "receiving",
          "label": "Mother must be eligible for SMP or Maternity Allowance"
        },
        {
          "type": "boolean",
          "field": "custom_facts.mother_curtailing_maternity",
          "expected": true,
          "label": "Mother has agreed to curtail her maternity leave/pay"
        },
        {
          "type": "all",
          "label": "Both parents meet employment and earnings tests",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "employed",
                "self-employed"
              ],
              "label": "Partner in work"
            },
            {
              "type": "boolean",
              "field": "custom_facts.partner_meets_employment_test",
              "expected": true,
              "label": "Partner meets the employment and earnings test"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'post'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain SPL eligibility and how weeks are shared between parents',
        'Advise that both employers must be notified',
        'Explain curtailment notice process',
        'Clarify that mother must be eligible for SMP or Maternity Allowance',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { weekly_rate: 187.18 },
      source: 'https://www.gov.uk/shared-parental-leave-and-pay/what-youll-get',
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
      ruleIn: ['Child aged 9 months to 4 years'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Has children"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "<=",
          "value": 4,
          "label": "Child must be 4 years old or under"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-free-childcare',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to Childcare Choices application',
        'Explain that this is a universal entitlement for children aged 9 months to 4 years',
        'Guide through Government Gateway sign-in process',
        'Advise on choosing an eligible childcare provider',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 123 4097', label: 'Childcare Service helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Child aged 3 or 4 years', 'Both parents in paid work earning NMW for 16 hrs'],
      ruleOut: ['Either parent earns over £100k', 'Non-working single parent'],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Has children"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": ">=",
          "value": 3,
          "label": "Child must be at least 3 years old"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "<=",
          "value": 4,
          "label": "Child must be 4 years old or under"
        },
        {
          "type": "any",
          "label": "Both parents working (or single parent working)",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "employed",
                "self-employed",
                "director"
              ],
              "label": "In paid work"
            }
          ]
        },
        {
          "type": "comparison",
          "field": "annual_income",
          "operator": "<=",
          "value": 100000,
          "label": "Neither parent earns over £100,000 per year"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-30-hours-free-childcare',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to 30 hours free childcare application',
        'Check both parents meet employment and earnings criteria',
        'Explain 3-monthly reconfirmation requirement',
        'Guide through Government Gateway sign-in process',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 123 4097', label: 'Childcare Service helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Both parents in work above minimum threshold', 'Child under 12'],
      ruleOut: ['Currently receiving Universal Credit childcare element'],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Has children"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "<",
          "value": 12,
          "label": "Child must be under 12 (or under 17 if disabled)"
        },
        {
          "type": "any",
          "label": "Both parents in work (or single parent in work)",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "employed",
                "self-employed",
                "director"
              ],
              "label": "In paid work"
            }
          ]
        },
        {
          "type": "comparison",
          "field": "annual_income",
          "operator": "<=",
          "value": 100000,
          "label": "Neither parent earns over £100,000 per year"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/tax-free-childcare',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to Tax-Free Childcare application',
        'Explain the 25p per £1 government top-up',
        'Warn about incompatibility with UC childcare element',
        'Help compare TFC vs UC childcare element value',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { max_per_child: 2000, max_disabled_child: 4000 },
      source: 'https://www.gov.uk/tax-free-childcare',
    },
      contactInfo: {
      phone: { number: '+44 300 123 4097', label: 'Childcare Service helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['One partner earns below £12,570', 'Married or in civil partnership'],
      ruleOut: ['Either partner pays higher or additional rate tax'],      rules: [
        {
          "type": "enum",
          "field": "relationship_status",
          "oneOf": [
            "married",
            "civil_partnership"
          ],
          "label": "Must be married or in a civil partnership"
        },
        {
          "type": "boolean",
          "field": "custom_facts.partner_income_below_personal_allowance",
          "expected": true,
          "label": "One partner earns below the Personal Allowance (£12,570)"
        },
        {
          "type": "comparison",
          "field": "annual_income",
          "operator": "<=",
          "value": 50270,
          "label": "Higher-earning partner must be a basic-rate taxpayer (income ≤ £50,270)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.service.hmrc.gov.uk/api-documentation/docs/api/service/marriage-allowance/2.0',
      onlineFormUrl: 'https://www.gov.uk/apply-marriage-allowance',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to Marriage Allowance application',
        'Check both partners\' income levels to confirm eligibility',
        'Explain backdating up to 4 years',
        'Guide lower earner through Government Gateway sign-in',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { tax_saving: 252 },
      source: 'https://www.gov.uk/marriage-allowance',
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
      ruleIn: ['Marriage Allowance previously claimed', 'Now separated, divorced, or widowed'],
      ruleOut: [],      rules: [
        {
          "type": "enum",
          "field": "relationship_status",
          "oneOf": [
            "separated",
            "divorced",
            "widowed"
          ],
          "label": "Now separated, divorced, or widowed"
        },
        {
          "type": "boolean",
          "field": "custom_facts.marriage_allowance_claimed",
          "expected": true,
          "label": "Marriage Allowance was previously claimed"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/marriage-allowance/if-your-circumstances-change',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to cancel Marriage Allowance online',
        'Explain the importance of cancelling after separation or divorce',
        'Advise on alternative phone route if online not available',
        'Warn about potential tax underpayment if not cancelled',
      ],
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
      ruleIn: [],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/tell-hmrc-change-of-details',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to HMRC change of details service',
        'Guide through Personal Tax Account update process',
        'Explain which changes affect tax code',
        'Advise on phone alternative if online update not possible',
      ],
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
      ruleIn: ['Property purchase completed in England'],
      ruleOut: [],      rules: [
        {
          "type": "deadline",
          "triggerEvent": "property_completion_date",
          "triggerLabel": "Date of property completion",
          "maxDays": 14,
          "label": "SDLT return must be filed within 14 days of completion"
        },
        {
          "type": "any",
          "label": "Property purchase in England or Northern Ireland",
          "rules": [
            {
              "type": "enum",
              "field": "nation",
              "oneOf": [
                "england"
              ],
              "label": "Property in England"
            },
            {
              "type": "enum",
              "field": "custom_facts.property_nation",
              "oneOf": [
                "england",
                "northern-ireland"
              ],
              "label": "Property in England or Northern Ireland"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: true,
      apiUrl: 'https://developer.service.hmrc.gov.uk/api-documentation/docs/api/xml/Stamp%20Taxes%20Online',
      onlineFormUrl: 'https://www.gov.uk/sdlt-online',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to SDLT online filing service',
        'Explain the 14-day filing deadline after completion',
        'Advise that solicitor usually handles this',
        'Clarify that a return is required even if no tax is due',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 200 3510', label: 'Stamp Duty Land Tax helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:30',
          close: '17:00',
        },
      ],
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
      ruleIn: ['First-time buyer', 'LISA opened before age 40', 'Property costs £450k or less'],
      ruleOut: ['Existing homeowner', 'Property over £450,000'],      rules: [
        {
          "type": "boolean",
          "field": "is_first_time_buyer",
          "expected": true,
          "label": "Must be a first-time buyer"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": "<",
          "value": 40,
          "label": "Must have opened the LISA before age 40"
        },
        {
          "type": "comparison",
          "field": "property_value",
          "operator": "<=",
          "value": 450000,
          "label": "Property must cost £450,000 or less"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.service.hmrc.gov.uk/api-documentation/docs/api/service/lisa-api/2.0',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain LISA withdrawal process for property purchase',
        'Advise that conveyancer handles the withdrawal request',
        'Clarify eligibility (first-time buyer, property under £450k)',
        'Warn about 25% penalty for non-qualifying withdrawals',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { government_bonus_rate_percent: 25, max_bonus: 1000 },
      source: 'https://www.gov.uk/lifetime-isa',
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
      ruleIn: ['Estate value exceeds £325,000 nil-rate band'],
      ruleOut: ['Estate below nil-rate band with no gifts'],      rules: [
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "A death has occurred"
        },
        {
          "type": "comparison",
          "field": "estate_value",
          "operator": ">",
          "value": 325000,
          "label": "Estate value exceeds £325,000 nil-rate band"
        },
        {
          "type": "deadline",
          "triggerEvent": "death_date",
          "triggerLabel": "Date of death",
          "maxDays": 180,
          "label": "IHT400 must be filed within 6 months of death"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/government/publications/inheritance-tax-inheritance-tax-account-iht400',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to IHT400 form and guidance',
        'Explain nil-rate band thresholds and residence nil-rate band',
        'Advise on the 6-month deadline for tax payment',
        'Explain that tax must be paid before probate is granted',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 123 1072', label: 'Inheritance Tax helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '09:00',
          close: '17:00',
        },
      ],
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
      ruleIn: ['Leaving or having left PAYE employment'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain that the employer is legally required to issue a P45',
        'Advise contacting former employer if P45 not received',
        'Explain how to contact HMRC if employer is unresponsive',
        'Clarify what the P45 is needed for (new job, tax refund, benefits)',
      ],
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
      ruleIn: ['Overpaid PAYE tax mid-year', 'Not returning to work before April 5th'],
      ruleOut: ['Returning to work in same tax year'],      rules: [
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "unemployed"
          ],
          "label": "Not currently employed (left job mid-tax year)"
        },
        {
          "type": "boolean",
          "field": "custom_facts.overpaid_paye",
          "expected": true,
          "label": "Overpaid PAYE income tax during the current tax year"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/claim-tax-refund',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to tax refund claim process',
        'Explain when a refund is likely (left job mid-year, not returning to work)',
        'Advise on P50 form for mid-year claims',
        'Clarify that P45 from employer is needed first',
      ],
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
      ruleIn: ['Self-employed, company director, or income over £100k', 'Rental or untaxed income at source'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Self-employed, company director, or income over £100k",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "self-employed",
                "director"
              ],
              "label": "Self-employed or company director"
            },
            {
              "type": "comparison",
              "field": "annual_income",
              "operator": ">",
              "value": 100000,
              "label": "Annual income exceeds £100,000"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.service.hmrc.gov.uk/api-documentation/docs/api/service/self-assessment-api/3.0',
      onlineFormUrl: 'https://www.gov.uk/self-assessment-tax-returns',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to Self Assessment registration',
        'Explain who needs to register (self-employed, directors, landlords, income over £100k)',
        'Advise on the 5 October registration deadline',
        'Guide through Government Gateway sign-in process',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3310',
        textphone: '+44 300 200 3319',
        relay: '18001 then 0300 200 3310',
        label: 'Self Assessment helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/self-assessment',
      notes: 'Extended hours in January (deadline month).',
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
      ruleIn: ['Registered limited company'],
      ruleOut: ['Sole trader or partnership'],      rules: [
        {
          "type": "dependency",
          "serviceId": "ch-register-ltd",
          "condition": "completed",
          "label": "Limited company registered at Companies House"
        },
        {
          "type": "deadline",
          "triggerEvent": "company_trading_start_date",
          "triggerLabel": "Date company started trading",
          "maxDays": 90,
          "label": "Must register within 3 months of starting to trade"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.service.hmrc.gov.uk/api-documentation/docs/api/xml/Corporation%20Tax%20Online',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain Corporation Tax registration requirement for limited companies',
        'Advise on the 3-month deadline from starting to trade',
        'Confirm Companies House registration is in place',
        'Guide through Government Gateway registration process',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3410',
        textphone: '+44 300 200 3419',
        relay: '18001 then 0300 200 3410',
        label: 'Corporation Tax helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Taxable turnover exceeded or expected to exceed £90,000'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Self-employed, director, or running a business",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "self-employed",
                "director"
              ],
              "label": "Self-employed or company director"
            }
          ]
        },
        {
          "type": "comparison",
          "field": "annual_income",
          "operator": ">=",
          "value": 90000,
          "label": "Taxable turnover exceeds £90,000 threshold"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.service.hmrc.gov.uk/api-documentation/docs/api/service/vat-api/1.0',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain mandatory vs voluntary VAT registration',
        'Advise on the £90,000 turnover threshold',
        'Guide through Government Gateway registration process',
        'Explain benefits of voluntary registration for B2B businesses',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3700',
        textphone: '+44 300 200 3719',
        relay: '18001 then 0300 200 3700',
        label: 'VAT helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/vat-online',
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
      ruleIn: ['Employing workers above lower earnings limit'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Employing staff",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "self-employed",
                "director"
              ],
              "label": "Self-employed or company director (employing others)"
            }
          ]
        },
        {
          "type": "boolean",
          "field": "custom_facts.is_employer",
          "expected": true,
          "label": "Taking on employees who will earn above the lower earnings limit"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.service.hmrc.gov.uk/api-documentation/docs/api/xml/PAYE%20Online',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain PAYE employer registration requirements',
        'Advise that registration must be done before the first payday',
        'Guide through Government Gateway registration process',
        'Explain ongoing RTI submission obligations',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3200',
        textphone: '+44 300 200 3212',
        relay: '18001 then 0300 200 3200',
        label: 'Employer helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'Also covers statutory payments (SMP, SPP, ShPP, SSP) for employers.',
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
      ruleIn: ['VAT-registered business', 'Self-employed or landlord with income over £50k (from 2026)'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "VAT-registered or self-employed/landlord with income over £50k",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "hmrc-vat",
              "condition": "completed",
              "label": "VAT registered"
            },
            {
              "type": "all",
              "label": "Self-employed or landlord with income over £50k (MTD for Income Tax)",
              "rules": [
                {
                  "type": "enum",
                  "field": "employment_status",
                  "oneOf": [
                    "self-employed"
                  ],
                  "label": "Self-employed or landlord"
                },
                {
                  "type": "comparison",
                  "field": "annual_income",
                  "operator": ">=",
                  "value": 50000,
                  "label": "Income exceeds £50,000"
                }
              ]
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.service.hmrc.gov.uk/guides/income-tax-mtd-end-to-end-service-guide/',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain MTD obligations for VAT-registered businesses',
        'Advise on MTD-compatible software options',
        'Explain upcoming Income Tax MTD rollout from April 2026',
        'Guide through Government Gateway sign-up process',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3700',
        textphone: '+44 300 200 3719',
        relay: '18001 then 0300 200 3700',
        label: 'VAT & Making Tax Digital helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/vat-online',
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
      ruleIn: ['Started trading as sole trader'],
      ruleOut: [],      rules: [
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "self-employed"
          ],
          "label": "Started trading as a sole trader"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/set-up-sole-trader',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to sole trader registration',
        'Explain that registration is done via Self Assessment',
        'Advise on the 5 October deadline in second tax year',
        'Guide through Government Gateway sign-in process',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3310',
        textphone: '+44 300 200 3319',
        relay: '18001 then 0300 200 3310',
        label: 'Self Assessment helpline (registrations)',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/self-assessment',
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
      ruleIn: ['Caring 20+ hours per week for qualifying benefit recipient', 'Not receiving NI credits via another route'],
      ruleOut: ['Already receiving Carer\'s Allowance'],      rules: [
        {
          "type": "boolean",
          "field": "is_carer",
          "expected": true,
          "label": "Is a carer"
        },
        {
          "type": "comparison",
          "field": "caring_hours_per_week",
          "operator": ">=",
          "value": 20,
          "label": "Caring for at least 20 hours per week"
        },
        {
          "type": "boolean",
          "field": "cared_for_receives_qualifying_benefit",
          "expected": true,
          "label": "Person cared for receives PIP, Attendance Allowance, or other qualifying disability benefit"
        },
        {
          "type": "not",
          "label": "Not already receiving Carer's Allowance (which provides its own NI credits)",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-carers-allowance",
              "condition": "receiving",
              "label": "Receiving Carer's Allowance"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['post'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain Carer\'s Credit and how it protects NI record',
        'Advise that the claim is by post using form CA9176',
        'Clarify the 20-hour-per-week caring threshold',
        'Explain that this is not needed if already receiving Carer\'s Allowance',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3500',
        textphone: '+44 300 200 3519',
        relay: '18001 then 0300 200 3500',
        label: 'National Insurance helpline (Carer\'s Credit)',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Child now living primarily with different parent', 'Parents separated'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Has children"
        },
        {
          "type": "enum",
          "field": "relationship_status",
          "oneOf": [
            "separated",
            "divorced"
          ],
          "label": "Parents have separated or divorced"
        },
        {
          "type": "boolean",
          "field": "custom_facts.child_living_arrangements_changed",
          "expected": true,
          "label": "Child now living primarily with different parent"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/child-benefit-for-children-in-your-care',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to Child Benefit change of circumstances',
        'Explain that only one parent can claim per child',
        'Advise on the transfer process after separation',
        'Guide new claimant through Government Gateway application',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3100',
        textphone: '+44 300 200 3103',
        relay: '18001 then 0300 200 3100',
        label: 'Child Benefit helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: [],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.service.hmrc.gov.uk/api-documentation/docs/api/service/national-insurance/1.1',
      onlineFormUrl: 'https://www.gov.uk/check-national-insurance-record',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to check NI record online',
        'Explain how gaps affect State Pension entitlement',
        'Advise on voluntary Class 3 contributions to fill gaps',
        'Guide through Government Gateway sign-in to Personal Tax Account',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 200 3500',
        textphone: '+44 300 200 3519',
        relay: '18001 then 0300 200 3500',
        label: 'National Insurance helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Receiving State Pension or private pension', 'Total income exceeds Personal Allowance'],
      ruleOut: [],      rules: [
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "retired"
          ],
          "label": "Retired and receiving pension"
        },
        {
          "type": "comparison",
          "field": "annual_income",
          "operator": ">",
          "value": 12570,
          "label": "Total income exceeds Personal Allowance (£12,570)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/tax-on-pension',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Provide direct link to pension tax information',
        'Explain that State Pension is taxable but paid gross',
        'Help check if tax code is correct via Personal Tax Account',
        'Advise on contacting HMRC if tax code seems wrong',
      ],
    },
  },
  'hmrc-aml-registration': {
    id: 'hmrc-aml-registration', name: 'Anti-money laundering registration', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Businesses in regulated sectors must register with the appropriate supervisory body. HMRC supervises estate agents, high-value dealers, art market participants, and others without a professional body.',
    govuk_url: 'https://www.gov.uk/anti-money-laundering-registration',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Mandatory for businesses in nine regulated categories including financial services, legal, accountancy, estate agency, high-value dealers, art market, casinos, letting agencies, and trust/company service providers. Operating without registration is a criminal offence.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Operating a business in one of the nine Money Laundering Regulations regulated sectors.' },
      ],
      keyQuestions: [
        'What type of business are you operating?',
        'Do you handle cash transactions above €10,000?',
        'Do you already have a professional body membership (e.g. ICAEW, Law Society) that acts as your supervisor?',
      ],
      means_tested: false,
      evidenceRequired: ['Business details and registered address', 'Identity of beneficial owners and directors', 'Evidence of business type and activities'],
      ruleIn: ['Estate agency or letting agency', 'Accountancy or bookkeeping practice', 'Legal or trust/company service provider', 'High-value dealer (cash transactions over €10,000)', 'Art market participant', 'Casino or gambling business'],
      ruleOut: ['Business does not fall within any of the nine regulated sectors'],
    },
  },
  'hmrc-machine-games-duty': {
    id: 'hmrc-machine-games-duty', name: 'Machine Games Duty registration', dept: 'HMRC', deptKey: 'hmrc',
    deadline: '14 days',
    desc: 'Operators of gaming machines offering prizes must register for Machine Games Duty with HMRC, file quarterly returns, and pay duty on net takings at rates between 5% and 25%.',
    govuk_url: 'https://www.gov.uk/machine-game-duty',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Mandatory for anyone operating dutiable gaming machines (fruit machines, AWPs, Category B/C/D) on premises with a gambling licence, alcohol licence, gaming machine permit or club certificate. Register at least 14 days before machines go live. File quarterly returns and pay within 30 days.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Operating gaming machines that offer prizes on licensed premises (pub, amusement arcade, bingo hall, betting shop, social club).' },
      ],
      keyQuestions: [
        'Do you hold a gambling or alcohol premises licence?',
        'How many gaming machines do you operate?',
        'What are the play costs and prize values?',
        'Are you the tenant or owner of the premises?',
      ],
      means_tested: false,
      evidenceRequired: ['Licence or permit numbers', 'UTR or VAT number', 'National Insurance number', 'Machine count and takings records (kept 4 years)'],
      ruleIn: ['Pub owner or tenant with gaming machines', 'Amusement arcade operator', 'Betting shop', 'Bingo hall or social club with gaming machines'],
      ruleOut: ['Machines offer no prize above play cost', 'Charity or tournament use only', 'Domestic machines'],
    },
  },
  'hmrc-starter-checklist': {
    id: 'hmrc-starter-checklist', name: 'PAYE Starter Checklist', dept: 'HMRC', deptKey: 'hmrc',
    deadline: 'Before first payday',
    desc: 'Completed with a new employer when no P45 is available — first jobs, returns to work, and second jobs. Sets the correct tax code before the first payday to avoid emergency tax.',
    govuk_url: 'https://www.gov.uk/paye-forms-p45-p60-p11d/starter-checklist',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required when starting a new job without a P45 — whether first job, return after a gap, or an additional concurrent job. The employer provides the form; the employee self-declares their tax situation, student loan plan type, and whether they are receiving any benefits. Without it, the employer must apply an emergency tax code.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Starting a new job with a new employer and having no P45 available from a previous employer.' },
      ],
      keyQuestions: [
        'Is this your first job since 6 April this tax year?',
        'Have you had another job since 6 April and do you have a P45?',
        'Are you currently receiving any benefits (e.g. Jobseeker\'s Allowance, ESA)?',
        'Do you have a student loan — and if so, which repayment plan (1, 2, 4, or 5)?',
        'Do you have a postgraduate loan?',
      ],
      autoQualifiers: ['Starting a new job with no P45 — employer must use this checklist to set the correct tax code'],
      exclusions: ['Employee has a valid P45 from their most recent employer (hand P45 to employer instead)', 'Self-employed (not subject to PAYE)'],
      means_tested: false,
      evidenceRequired: ['No documents required — employee self-declares', 'National Insurance number', 'Student loan plan type if applicable'],
      ruleIn: ['First ever job', 'Returning to work with no P45', 'Starting a second or additional concurrent job', 'Gap in employment and P45 unavailable'],
      ruleOut: ['P45 already available from most recent employer', 'Self-employed — not on PAYE'],
    },
  },
  'hmrc-ssp': {
    id: 'hmrc-ssp', name: 'Statutory Sick Pay (SSP)', dept: 'HMRC', deptKey: 'hmrc',
    deadline: '7 days',
    desc: 'Employees are entitled to £118.75/week SSP from their employer for up to 28 weeks of illness. From April 2026, SSP is payable from day 1 — the 3-day waiting period is removed.',
    govuk_url: 'https://www.gov.uk/statutory-sick-pay',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to employees (including agency workers) who earn an average of at least £125/week and are too ill to work. Notify your employer within 7 days (or their own deadline if earlier). A fit note from a doctor or healthcare professional is required for absences longer than 7 days.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Must be classed as an employee (including agency workers) and have done some work for the employer; self-employed individuals are not eligible.' },
        { factor: 'income', description: 'Average weekly earnings must be at least £125 (the Lower Earnings Limit) before SSP is payable.' },
      ],
      keyQuestions: [
        'Are you classed as an employee (not self-employed)?',
        'Do you earn an average of at least £125 per week?',
        'Have you notified your employer within 7 days of falling ill?',
        'Have you already received 28 weeks of SSP for this illness from this employer?',
        'Are you currently receiving Statutory Maternity Pay?',
      ],
      autoQualifiers: ['Employee earning at least £125/week who has notified employer of illness within 7 days'],
      exclusions: ['Self-employed — no entitlement to SSP', 'Average weekly earnings below £125', '28-week maximum SSP already received for this illness', 'Currently receiving Statutory Maternity Pay', 'Failed to notify employer within the required timeframe'],
      means_tested: false,
      evidenceRequired: ['Self-certification for absences of 7 days or fewer', 'Fit note from a doctor, nurse, occupational therapist, pharmacist, or physiotherapist for absences longer than 7 days'],
      ruleIn: ['Employee earning at least £125/week average', 'Too ill to work', 'Employer notified within 7 days'],
      ruleOut: ['Self-employed', 'Earnings below Lower Earnings Limit', '28-week SSP maximum already reached', 'Currently on Statutory Maternity Pay'],
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
      ruleIn: ['Death registered in England, Scotland, or Wales'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "A death has occurred"
        },
        {
          "type": "boolean",
          "field": "death_registered",
          "expected": true,
          "label": "Death has been registered"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/after-a-death',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility for Tell Us Once',
        'Guide user to register office appointment',
        'List all departments that will be notified',
      ],
    },
      contactInfo: {
      phone: { number: '+44 800 085 7308', label: 'Tell Us Once helpline (England & Wales)' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'In Scotland, contact the registrar directly. Usually initiated at the registrar appointment.',
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
      ruleIn: ['Spouse or civil partner died', 'Under State Pension age at time of death', 'Deceased had 25+ weeks NI contributions'],
      ruleOut: ['Cohabiting but not married or in civil partnership', 'Partner died before 6 April 2017'],      rules: [
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "Spouse or civil partner must have died"
        },
        {
          "type": "any",
          "label": "Must have been married or in a civil partnership",
          "rules": [
            {
              "type": "enum",
              "field": "relationship_status",
              "oneOf": [
                "married",
                "civil_partnership",
                "widowed"
              ],
              "label": "Married, civil partner, or widowed"
            }
          ]
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": "<",
          "value": 66,
          "label": "Must be under State Pension age (66) at time of partner's death"
        },
        {
          "type": "deadline",
          "triggerEvent": "partner_death_date",
          "triggerLabel": "date of partner's death",
          "maxDays": 639,
          "label": "Must claim within 21 months of partner's death"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/bereavement-support-payment/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility using MissingBenefit API',
        'Estimate benefit amount based on circumstances',
        'Guide user through online application form',
        'Prepare required evidence checklist',
      ],
      missingBenefitId: 'bereavementSupportPayment',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { lump_sum_higher: 3500, lump_sum_lower: 2500, monthly_higher: 350, monthly_lower: 100 },
      source: 'https://www.gov.uk/bereavement-support-payment/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 151 2012',
        textphone: '+44 800 731 0464',
        relay: '18001 then 0800 151 2012',
        label: 'Bereavement Service Centre',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'Also handles Funeral Expenses Payment and widowed parent claims.',
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
      ruleIn: ['Receiving qualifying means-tested benefit', 'Responsible for funeral costs'],
      ruleOut: ['Close relative of deceased able to pay instead'],      rules: [
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "Must be responsible for arranging a funeral"
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-housing-benefit",
              "condition": "receiving",
              "label": "Receiving Housing Benefit"
            }
          ]
        },
        {
          "type": "deadline",
          "triggerEvent": "funeral_date",
          "triggerLabel": "date of the funeral",
          "maxDays": 183,
          "label": "Must claim within 6 months of the funeral"
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/funeral-payments/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check eligibility for Funeral Expenses Payment',
        'Provide guidance on claiming by phone or post (SF200 form)',
        'Help gather required evidence (funeral bill, proof of qualifying benefit)',
        'Explain that payment may be recovered from the estate',
      ],
      missingBenefitId: 'funeralExpensesPayment',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { max_amount: 1000 },
      source: 'https://www.gov.uk/funeral-payments/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 151 2012',
        textphone: '+44 800 731 0464',
        relay: '18001 then 0800 151 2012',
        label: 'Bereavement Service Centre (Funeral Expenses)',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Reached State Pension age (66+)', '10+ qualifying NI years'],
      ruleOut: ['Under 66'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 66,
          "label": "Must have reached State Pension age (66)"
        },
        {
          "type": "comparison",
          "field": "ni_qualifying_years",
          "operator": ">=",
          "value": 10,
          "label": "Need at least 10 qualifying NI years to receive any State Pension"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/new-state-pension/how-to-claim',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check State Pension age using GOV.UK calculator',
        'Estimate State Pension amount from NI record',
        'Guide user through online claim process',
        'Explain deferral options and their financial impact',
      ],
      missingBenefitId: 'statePension',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { new_full_weekly: 230.25, basic_full_weekly: 176.45 },
      source: 'https://www.gov.uk/new-state-pension/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 731 0469',
        textphone: '+44 800 731 7898',
        relay: '18001 then 0800 731 0469',
        label: 'Pension Service helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      contactFormUrl: 'https://www.gov.uk/contact-pension-service',
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
      ruleIn: ['Reached State Pension age (66+)', 'Weekly income below Pension Credit threshold'],
      ruleOut: ['Savings above £10,000 reducing entitlement to zero'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 66,
          "label": "Must have reached State Pension age (66)"
        },
        {
          "type": "comparison",
          "field": "weekly_income",
          "operator": "<",
          "value": 228,
          "label": "Weekly income must be below Pension Credit threshold (~£227.10 single)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/pension-credit/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility using MissingBenefit API',
        'Estimate Pension Credit entitlement from income details',
        'Guide user through online or phone application',
        'Explain gateway benefits unlocked by Pension Credit',
        'Prepare list of required financial evidence',
      ],
      missingBenefitId: 'pensionCredit',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { guarantee_single: 227.10, guarantee_couple: 346.60, savings_max_single: 17.30, savings_max_couple: 19.36 },
      source: 'https://www.gov.uk/pension-credit/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 99 1234',
        textphone: '+44 800 169 0133',
        relay: '18001 then 0800 99 1234',
        label: 'Pension Credit claim line',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'For new claims. Existing claimants use Pension Service line (0800 731 0469).',
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
      ruleIn: ['Receiving Pension Credit or qualifying means-tested benefit'],
      ruleOut: ['Over State Pension age but not on qualifying benefit'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 66,
          "label": "Must have reached State Pension age"
        },
        {
          "type": "any",
          "label": "Must receive Pension Credit or another qualifying means-tested benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_related_esa",
              "expected": true,
              "label": "Receiving income-related ESA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_based_jsa",
              "expected": true,
              "label": "Receiving income-based JSA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_support",
              "expected": true,
              "label": "Receiving Income Support"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check if user receives Pension Credit or qualifying benefit',
        'Explain eligibility changes from winter 2024/25',
        'Advise on claiming Pension Credit as gateway to Winter Fuel Payment',
        'Provide Winter Fuel Payment helpline contact details',
      ],
      missingBenefitId: 'winterFuelPayment',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { under_80_single: 200, over_80_single: 300 },
      source: 'https://www.gov.uk/winter-fuel-payment/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 731 0160',
        textphone: '+44 800 731 0464',
        relay: '18001 then 0800 731 0160',
        label: 'Winter Fuel Payment helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'Usually automatic for State Pension recipients.',
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
      ruleIn: ['Aged 66 or over', 'Personal care needs due to physical or mental condition'],
      ruleOut: ['Under State Pension age'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 66,
          "label": "Must be aged 66 or over (State Pension age)"
        },
        {
          "type": "any",
          "label": "Must have a disability or long-term health condition",
          "rules": [
            {
              "type": "boolean",
              "field": "has_disability",
              "expected": true,
              "label": "Has a disability"
            },
            {
              "type": "boolean",
              "field": "has_long_term_health_condition",
              "expected": true,
              "label": "Has a long-term health condition"
            },
            {
              "type": "boolean",
              "field": "has_terminal_illness",
              "expected": true,
              "label": "Has a terminal illness"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/attendance-allowance/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility using MissingBenefit API',
        'Guide user through AA1 claim form completion',
        'Help describe how condition affects daily living',
        'Advise on gathering supporting medical evidence',
        'Explain Special Rules for terminal illness (fast-track)',
      ],
      missingBenefitId: 'attendanceAllowance',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { lower: 73.90, higher: 110.40 },
      source: 'https://www.gov.uk/attendance-allowance/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 731 0122',
        textphone: '+44 800 731 0317',
        relay: '18001 then 0800 731 0122',
        label: 'Attendance Allowance helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Disability or long-term health condition', 'Aged 16–64'],
      ruleOut: ['Reached State Pension age (66+)'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 16,
          "label": "Must be aged 16 or over"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": "<",
          "value": 66,
          "label": "Must be under State Pension age (66)"
        },
        {
          "type": "any",
          "label": "Must have a disability or long-term health condition",
          "rules": [
            {
              "type": "boolean",
              "field": "has_disability",
              "expected": true,
              "label": "Has a disability"
            },
            {
              "type": "boolean",
              "field": "has_long_term_health_condition",
              "expected": true,
              "label": "Has a long-term health condition"
            },
            {
              "type": "boolean",
              "field": "has_terminal_illness",
              "expected": true,
              "label": "Has a terminal illness"
            }
          ]
        },
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Must usually live in England, Scotland or Wales"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/pip/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility using MissingBenefit API',
        'Guide user through PIP2 (How your disability affects you) form',
        'Help describe daily living and mobility difficulties',
        'Advise on gathering medical evidence from GP or specialist',
        'Explain assessment process and what to expect',
        'Explain Special Rules for terminal illness (fast-track)',
      ],
      missingBenefitId: 'pip',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { daily_living_standard: 73.90, daily_living_enhanced: 110.40, mobility_standard: 29.20, mobility_enhanced: 77.05 },
      source: 'https://www.gov.uk/pip/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 917 2222',
        textphone: '+44 800 121 4433',
        relay: '18001 then 0800 917 2222',
        label: 'PIP helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '17:00',
        },
      ],
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
      ruleIn: ['Out of work or low income', 'UK resident aged 18 or over'],
      ruleOut: ['Savings over £16,000', 'Over State Pension age'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 18,
          "label": "Must be aged 18 or over"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": "<",
          "value": 66,
          "label": "Must be under State Pension age (66)"
        },
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Must be habitually resident in the UK"
        },
        {
          "type": "comparison",
          "field": "savings",
          "operator": "<",
          "value": 16000,
          "label": "Savings must be under £16,000"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/universal-credit/how-to-claim',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility using MissingBenefit API',
        'Estimate UC entitlement from income and circumstances',
        'Guide user through online UC account creation',
        'Explain claimant commitment and work-search requirements',
        'Help prepare required documents and evidence',
      ],
      missingBenefitId: 'universalCredit',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'monthly',
      rates: { single_under_25: 316.98, single_25_plus: 400.14, couple_under_25: 497.55, couple_25_plus: 628.10 },
      source: 'https://www.gov.uk/universal-credit/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 328 5644',
        textphone: '+44 800 328 1344',
        relay: '18001 then 0800 328 5644',
        welsh: '+44 800 328 1744',
        label: 'Universal Credit helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      webchatUrl: 'https://www.universal-credit.service.gov.uk/sign-in',
      notes: 'Webchat available via UC journal after signing in.',
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
      ruleIn: ['Class 1 NI contributions in last two tax years', 'Actively seeking work'],
      ruleOut: ['Under State Pension age with no recent NI record'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 18,
          "label": "Must be aged 18 or over"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": "<",
          "value": 66,
          "label": "Must be under State Pension age (66)"
        },
        {
          "type": "boolean",
          "field": "has_recent_ni_contributions",
          "expected": true,
          "label": "Must have Class 1 NI contributions in last two tax years"
        },
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "unemployed"
          ],
          "label": "Must be unemployed or working fewer than 16 hours per week"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/jobseekers-allowance/apply-new-style-jsa',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check NI contribution record eligibility',
        'Explain relationship between New Style JSA and Universal Credit',
        'Guide user through online application',
        'Help prepare job-seeking evidence and CV',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { under_25: 72.90, over_25: 92.05 },
      source: 'https://www.gov.uk/jobseekers-allowance',
    },
      contactInfo: {
      phone: {
        number: '+44 800 169 0140',
        textphone: '+44 800 169 0207',
        relay: '18001 then 0800 169 0140',
        welsh: '+44 800 169 0190',
        label: 'Jobcentre Plus',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Health condition preventing or limiting work', 'NI contributions in last two tax years'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_recent_ni_contributions",
          "expected": true,
          "label": "Must have sufficient NI contributions in last two tax years"
        },
        {
          "type": "any",
          "label": "Health condition must limit or prevent work",
          "rules": [
            {
              "type": "boolean",
              "field": "has_disability",
              "expected": true,
              "label": "Has a disability"
            },
            {
              "type": "boolean",
              "field": "has_long_term_health_condition",
              "expected": true,
              "label": "Has a long-term health condition"
            },
            {
              "type": "boolean",
              "field": "has_terminal_illness",
              "expected": true,
              "label": "Has a terminal illness"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/employment-support-allowance/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check eligibility for New Style ESA',
        'Explain fit note requirement and how to get one from GP',
        'Describe Work Capability Assessment process',
        'Advise on gathering supporting medical evidence',
      ],
      missingBenefitId: 'esa',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { under_25: 72.90, over_25: 92.05, support_component: 48.50 },
      source: 'https://www.gov.uk/employment-support-allowance/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 055 6688',
        textphone: '+44 800 023 4888',
        relay: '18001 then 0800 055 6688',
        label: 'ESA helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'For new claims. Existing claimants use Jobcentre Plus or UC helpline.',
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
      ruleIn: ['Received adverse DWP benefit decision', 'Within 1 month of decision letter'],
      ruleOut: [],      rules: [
        {
          "type": "deadline",
          "triggerEvent": "decision_date",
          "triggerLabel": "Date of DWP decision letter",
          "maxDays": 30,
          "label": "Must request within 1 month of the decision letter"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/mandatory-reconsideration',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain the Mandatory Reconsideration process and timeline',
        'Help draft a Mandatory Reconsideration request letter',
        'Advise on gathering additional evidence to support the case',
        'Explain next steps if reconsideration is unsuccessful (tribunal appeal)',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 800 169 0310',
        textphone: '+44 800 169 0314',
        relay: '18001 then 0800 169 0310',
        label: 'DWP general (or use benefit-specific helpline)',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'Contact the helpline for the specific benefit being reconsidered.',
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
      ruleIn: ['Not eligible for SMP', 'Self-employed or recently employed', 'Worked 26 weeks in last 66 weeks'],
      ruleOut: ['Eligible for Statutory Maternity Pay from employer'],      rules: [
        {
          "type": "boolean",
          "field": "is_pregnant",
          "expected": true,
          "label": "Must be pregnant or have recently given birth"
        },
        {
          "type": "any",
          "label": "Must be self-employed or recently employed (not eligible for SMP)",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "self-employed"
              ],
              "label": "Self-employed"
            },
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "employed",
                "unemployed"
              ],
              "label": "Recently employed or unemployed (not eligible for SMP)"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/maternity-allowance/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility for Maternity Allowance vs SMP',
        'Guide user through MA1 claim form',
        'Help gather employment evidence and MATB1 certificate',
        'Explain payment schedule and duration',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { standard_weekly: 187.18 },
      source: 'https://www.gov.uk/maternity-allowance/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 169 0140',
        textphone: '+44 800 169 0207',
        relay: '18001 then 0800 169 0140',
        welsh: '+44 800 169 0190',
        label: 'Jobcentre Plus (Maternity Allowance)',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Receiving qualifying means-tested benefit', 'Expecting first baby or under 3 months old'],
      ruleOut: ['Second or subsequent child with older children under 16'],      rules: [
        {
          "type": "any",
          "label": "Must be expecting a baby or have a baby under 3 months old",
          "rules": [
            {
              "type": "boolean",
              "field": "is_pregnant",
              "expected": true,
              "label": "Pregnant (11+ weeks before due date)"
            },
            {
              "type": "all",
              "label": "Baby under 3 months old",
              "rules": [
                {
                  "type": "boolean",
                  "field": "has_children",
                  "expected": true,
                  "label": "Has children"
                },
                {
                  "type": "comparison",
                  "field": "youngest_child_age",
                  "operator": "==",
                  "value": 0,
                  "label": "Baby under 1 year old"
                }
              ]
            }
          ]
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            }
          ]
        },
        {
          "type": "deadline",
          "triggerEvent": "baby_birth_date",
          "triggerLabel": "date of baby's birth",
          "maxDays": 91,
          "label": "Must claim within 3 months of birth (or from 11 weeks before due date)"
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/sure-start-maternity-grant/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check eligibility for Sure Start Maternity Grant',
        'Explain SF100 claim form process',
        'Help gather required evidence (MATB1 or birth certificate)',
        'Advise on claiming deadline (11 weeks before to 3 months after birth)',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { grant_amount: 500 },
      source: 'https://www.gov.uk/sure-start-maternity-grant/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 169 0140',
        textphone: '+44 800 169 0207',
        relay: '18001 then 0800 169 0140',
        welsh: '+44 800 169 0190',
        label: 'Jobcentre Plus (Sure Start Maternity Grant)',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'UC claimants apply through their UC journal instead.',
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
      ruleIn: ['Receiving UC, JSA, ESA, or Child Benefit for child under 12'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Receiving a qualifying benefit or claiming Child Benefit for child under 12",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-jsa",
              "condition": "receiving",
              "label": "Receiving New Style JSA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-esa",
              "condition": "receiving",
              "label": "Receiving New Style ESA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-carers-allowance",
              "condition": "receiving",
              "label": "Receiving Carer's Allowance"
            },
            {
              "type": "boolean",
              "field": "custom_facts.claiming_child_benefit_under_12",
              "expected": true,
              "label": "Claiming Child Benefit for a child under 12"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/national-insurance-credits/how-to-apply',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain how NI credits protect State Pension entitlement',
        'Check if credits are being awarded automatically via qualifying benefits',
        'Advise on applying for Specified Adult Childcare credits if applicable',
        'Guide user to check NI record online',
      ],
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
      ruleIn: ['Caring 35+ hours per week', 'Person cared for receives qualifying disability benefit', 'Net earnings below £151/week'],
      ruleOut: ['In full-time education (21+ hours per week)'],      rules: [
        {
          "type": "boolean",
          "field": "is_carer",
          "expected": true,
          "label": "Must be caring for someone"
        },
        {
          "type": "comparison",
          "field": "caring_hours_per_week",
          "operator": ">=",
          "value": 35,
          "label": "Must provide at least 35 hours of care per week"
        },
        {
          "type": "boolean",
          "field": "cared_for_receives_qualifying_benefit",
          "expected": true,
          "label": "Person cared for must receive PIP daily living, Attendance Allowance, or DLA middle/higher care"
        },
        {
          "type": "comparison",
          "field": "weekly_earnings",
          "operator": "<=",
          "value": 151,
          "label": "Net earnings must be £151/week or less"
        },
        {
          "type": "not",
          "label": "Must not be in full-time education (21+ hours/week)",
          "rules": [
            {
              "type": "boolean",
              "field": "is_in_full_time_education",
              "expected": true,
              "label": "In full-time education"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/carers-allowance/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility using MissingBenefit API',
        'Verify the cared-for person receives a qualifying disability benefit',
        'Guide user through online Carer\'s Allowance application',
        'Explain overlapping benefits rule and impact on other payments',
        'Advise on UC Carer element if also on Universal Credit',
      ],
      missingBenefitId: 'carersAllowance',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { weekly_rate: 83.30 },
      source: 'https://www.gov.uk/carers-allowance/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 731 0297',
        textphone: '+44 800 731 0317',
        relay: '18001 then 0800 731 0297',
        label: 'Carer\'s Allowance Unit',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      contactFormUrl: 'https://www.gov.uk/carers-allowance-unit',
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
      ruleIn: ['On Universal Credit', 'Eligible for Carer\'s Allowance (caring 35+ hrs/week)'],
      ruleOut: [],      rules: [
        {
          "type": "dependency",
          "serviceId": "dwp-universal-credit",
          "condition": "receiving",
          "label": "Must be receiving Universal Credit"
        },
        {
          "type": "boolean",
          "field": "is_carer",
          "expected": true,
          "label": "Is a carer"
        },
        {
          "type": "comparison",
          "field": "caring_hours_per_week",
          "operator": ">=",
          "value": 35,
          "label": "Caring for at least 35 hours per week"
        },
        {
          "type": "boolean",
          "field": "cared_for_receives_qualifying_benefit",
          "expected": true,
          "label": "Person cared for receives a qualifying disability benefit (PIP daily living, AA, etc.)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/universal-credit/how-to-claim',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user is on Universal Credit and eligible for Carer\'s Allowance',
        'Guide user to report caring role via UC journal',
        'Explain that UC Carer element is added automatically once reported',
        'Advise on interaction with Carer\'s Allowance payments',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'monthly',
      rates: { carer_element: 201.68 },
      source: 'https://www.gov.uk/universal-credit/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 328 5644',
        textphone: '+44 800 328 1344',
        relay: '18001 then 0800 328 5644',
        welsh: '+44 800 328 1744',
        label: 'Universal Credit helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      webchatUrl: 'https://www.universal-credit.service.gov.uk/sign-in',
      notes: 'Managed within Universal Credit. Use UC journal or helpline.',
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
      ruleIn: ['Disability or health condition affecting work or commute', 'In paid work or about to start'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Must have a disability or health condition affecting work",
          "rules": [
            {
              "type": "boolean",
              "field": "has_disability",
              "expected": true,
              "label": "Has a disability"
            },
            {
              "type": "boolean",
              "field": "has_long_term_health_condition",
              "expected": true,
              "label": "Has a long-term health condition"
            }
          ]
        },
        {
          "type": "any",
          "label": "Must be in paid work, self-employed, or about to start work",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "employed",
                "self-employed"
              ],
              "label": "Currently employed or self-employed"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/access-to-work/apply',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility for Access to Work grant',
        'Guide user through online application process',
        'Help identify what workplace support or adaptations are needed',
        'Explain assessment process and what to expect',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 800 121 7479',
        textphone: '+44 800 121 7579',
        relay: '18001 then 0800 121 7479',
        label: 'Access to Work helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '17:00',
        },
      ],
      notes: 'BSL video relay available.',
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
      ruleIn: ['On Universal Credit', 'Health condition limits capacity for work'],
      ruleOut: [],      rules: [
        {
          "type": "dependency",
          "serviceId": "dwp-universal-credit",
          "condition": "receiving",
          "label": "Must be receiving Universal Credit"
        },
        {
          "type": "any",
          "label": "Health condition limits or prevents capacity for work",
          "rules": [
            {
              "type": "boolean",
              "field": "has_disability",
              "expected": true,
              "label": "Has a disability"
            },
            {
              "type": "boolean",
              "field": "has_long_term_health_condition",
              "expected": true,
              "label": "Has a long-term health condition"
            }
          ]
        },
        {
          "type": "boolean",
          "field": "custom_facts.wca_completed",
          "expected": true,
          "label": "Work Capability Assessment completed with limited capability finding"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/universal-credit/how-to-claim',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain fit note requirement and Work Capability Assessment process',
        'Guide user to submit fit note via UC journal',
        'Help prepare for UC50 questionnaire about health condition',
        'Advise on gathering supporting medical evidence',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'monthly',
      rates: { lcwra_element: 423.27 },
      source: 'https://www.gov.uk/universal-credit/what-youll-get',
    },
      contactInfo: {
      phone: {
        number: '+44 800 328 5644',
        textphone: '+44 800 328 1344',
        relay: '18001 then 0800 328 5644',
        welsh: '+44 800 328 1744',
        label: 'Universal Credit helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      webchatUrl: 'https://www.universal-credit.service.gov.uk/sign-in',
      notes: 'Managed within Universal Credit. Use UC journal or helpline.',
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
      ruleIn: ['Separated parents with children under 16', 'No private maintenance arrangement'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Has children"
        },
        {
          "type": "any",
          "label": "Parents are separated",
          "rules": [
            {
              "type": "enum",
              "field": "relationship_status",
              "oneOf": [
                "separated",
                "divorced"
              ],
              "label": "Separated or divorced"
            },
            {
              "type": "boolean",
              "field": "is_single_parent",
              "expected": true,
              "label": "Is a single parent"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/child-maintenance-service/apply',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain Child Maintenance Service options (Direct Pay vs Collect & Pay)',
        'Guide user through online application',
        'Help understand how maintenance is calculated from paying parent income',
        'Advise on trying a family-based arrangement first',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 800 171 2345',
        textphone: '+44 800 232 1271',
        relay: '18001 then 0800 171 2345',
        welsh: '+44 800 232 1979',
        label: 'Child Maintenance Service',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '17:00',
        },
      ],
      complaintsUrl: 'https://www.gov.uk/child-maintenance-service/complaints',
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
      ruleIn: ['Right to work in the UK confirmed', 'No existing NI number'],
      ruleOut: ['UK citizen (already assigned NI number at 16)'],      rules: [
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Living in the UK"
        },
        {
          "type": "not",
          "label": "Not a UK citizen (UK citizens receive NI number automatically at 16)",
          "rules": [
            {
              "type": "enum",
              "field": "citizenship",
              "oneOf": [
                "british"
              ],
              "label": "British citizen"
            }
          ]
        },
        {
          "type": "boolean",
          "field": "custom_facts.has_right_to_work",
          "expected": true,
          "label": "Has the right to work in the UK"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-national-insurance-number',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check if user already has an NI number',
        'Guide user through online NI number application',
        'Help gather right-to-work documents (BRP, share code)',
        'Explain what to expect after applying (interview may be required)',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 800 141 2079',
        textphone: '+44 800 141 2438',
        relay: '18001 then 0800 141 2079',
        label: 'National Insurance number helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '17:00',
        },
      ],
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
      ruleIn: [],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online', 'in-person'],
      apiAvailable: true,
      apiUrl: 'https://digital.nhs.uk/developer/api-catalogue/register-with-a-gp-surgery',
      onlineFormUrl: 'https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/',
      authRequired: 'nhs-login',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check which GP practices accept patients in the user\'s area',
        'Guide user through NHS online registration form',
        'Prepare list of documents helpful for registration',
        'Explain that medical records transfer automatically from previous GP',
      ],
    },
      contactInfo: { officeLocatorUrl: 'https://www.nhs.uk/service-search/find-a-gp', notes: 'Contact GP surgeries directly. Use NHS Find a GP to locate surgeries accepting patients.' },
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
      ruleIn: ['Pregnant (10+ weeks) or child under 4', 'Receiving UC, Child Tax Credit, or Income Support'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Must be pregnant (10+ weeks) or have a child under 4",
          "rules": [
            {
              "type": "boolean",
              "field": "is_pregnant",
              "expected": true,
              "label": "Pregnant"
            },
            {
              "type": "all",
              "label": "Has a child under 4",
              "rules": [
                {
                  "type": "boolean",
                  "field": "has_children",
                  "expected": true,
                  "label": "Has children"
                },
                {
                  "type": "comparison",
                  "field": "youngest_child_age",
                  "operator": "<",
                  "value": 4,
                  "label": "Youngest child under 4"
                }
              ]
            }
          ]
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.healthystart.nhs.uk/how-to-apply/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility based on benefits and pregnancy or child age',
        'Guide user through the Healthy Start online application',
        'Explain what the prepaid card can be used for (fruit, veg, milk, infant formula)',
        'Calculate estimated weekly value based on family circumstances',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { card_value: 4.25, pregnant_value: 8.50 },
      source: 'https://www.healthystart.nhs.uk/',
    },
      contactInfo: {
      phone: { number: '+44 300 330 7010', label: 'Healthy Start helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '09:00',
          close: '17:00',
        },
      ],
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
      ruleIn: ['Currently pregnant or given birth within 12 months'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Currently pregnant or gave birth within the last 12 months",
          "rules": [
            {
              "type": "boolean",
              "field": "is_pregnant",
              "expected": true,
              "label": "Currently pregnant"
            },
            {
              "type": "boolean",
              "field": "custom_facts.gave_birth_last_12_months",
              "expected": true,
              "label": "Gave birth in the last 12 months"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain that a Maternity Exemption Certificate is obtained via midwife or GP',
        'Advise that free prescriptions and dental care continue until baby is 12 months old',
        'Remind user to ask midwife for the FW8 form at their next appointment',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 330 1341', label: 'NHS BSA (MatEx certificate queries)' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '15:00',
        },
      ],
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
      ruleIn: ['Receiving PIP, DLA, or qualifying medical condition', 'Under 16, or 60 and over'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Meets at least one free prescription criterion",
          "rules": [
            {
              "type": "comparison",
              "field": "age",
              "operator": ">=",
              "value": 60,
              "label": "Aged 60 or over"
            },
            {
              "type": "comparison",
              "field": "age",
              "operator": "<",
              "value": 16,
              "label": "Under 16"
            },
            {
              "type": "boolean",
              "field": "receives_pip",
              "expected": true,
              "label": "Receiving PIP"
            },
            {
              "type": "boolean",
              "field": "custom_facts.has_medical_exemption_certificate",
              "expected": true,
              "label": "Has a medical exemption certificate (qualifying condition)"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit (with health element)"
            },
            {
              "type": "dependency",
              "serviceId": "nhs-low-income-scheme",
              "condition": "receiving",
              "label": "Has HC2 certificate (NHS Low Income Scheme)"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_support",
              "expected": true,
              "label": "Receiving Income Support"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/get-a-pds-exemption-certificate',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility based on benefits, age, or qualifying medical condition',
        'Guide user through the online exemption certificate application',
        'Explain Prescription Prepayment Certificate option if not exempt (£111/year)',
        'Prepare document checklist for the application',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 330 1341', label: 'Help with NHS costs' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '15:00',
        },
      ],
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
      ruleIn: [],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['phone', 'in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the care needs assessment process and what to expect',
        'Help user identify their local authority adult social care contact details',
        'Advise that the assessment itself is free regardless of income',
        'Suggest requesting a carer\'s assessment at the same time if applicable',
      ],
    },
      contactInfo: { localAuthority: true, officeLocatorUrl: 'https://www.gov.uk/find-local-council', notes: 'Adult social care is delivered by local authorities despite NHS deptKey. Contact your local council.' },
  },

  // DVLA ─────────────────────────────────────────────────────────────────────
  'dvla-provisional-licence': {
    id: 'dvla-provisional-licence', name: 'Provisional Driving Licence', dept: 'DVLA', deptKey: 'dvla',
    deadline: null,
    desc: 'Apply from age 15 years and 9 months — so it arrives before your 17th birthday. £34 online, £43 by post (D1 form). Required before lessons or booking any test.',
    govuk_url: 'https://www.gov.uk/apply-first-provisional-driving-licence',
    serviceType: 'document',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required before you can take driving lessons or book a theory or practical test. Apply from age 15 years and 9 months so it arrives by your 17th birthday. Costs £34 online or £43 by post. Must be resident in Great Britain for at least 185 days in the last 12 months and be able to read a number plate from 20 metres.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must be at least 15 years and 9 months old to apply. Must be 17 to drive on a public road (16 for a moped or light quad bike).' },
        { factor: 'residency', description: 'Must have been resident in Great Britain for at least 185 days in the last 12 months.' },
        { factor: 'disability', description: 'Must be able to read a number plate from 20 metres away (with glasses or contact lenses if worn). Certain medical conditions must be declared.' },
      ],
      keyQuestions: [
        'Are you at least 15 years and 9 months old?',
        'Have you been resident in Great Britain for at least 185 days in the last 12 months?',
        'Can you read a number plate from 20 metres?',
        'Do you have a UK passport or another acceptable identity document?',
        'Do you have any medical conditions that must be declared to DVLA?',
      ],
      means_tested: false,
      evidenceRequired: ['UK passport or other acceptable identity document', 'Address details', '£34 fee (online) or £43 fee (postal D1 form)'],
      ruleIn: ['Aged 15 years and 9 months or over', 'GB resident for 185+ days in last 12 months'],
      ruleOut: ['Cannot read number plate at 20 metres'],
      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 16,
          "label": "Must be at least 15 years and 9 months old (age 16 rounded)"
        },
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Normally resident in Great Britain"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-first-provisional-driving-licence',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check age eligibility (15 years 9 months to apply)',
        'Guide user through the online application on GOV.UK',
        'Prepare document checklist (passport or birth certificate, address details)',
        'Explain the £34 fee and expected processing time',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee: 34 },
      source: 'https://www.gov.uk/apply-first-provisional-driving-licence',
    },
  },

  // DVSA ─────────────────────────────────────────────────────────────────────
  'dvsa-theory-test': {
    id: 'dvsa-theory-test', name: 'Theory Test', dept: 'DVSA', deptKey: 'dvsa',
    deadline: null,
    desc: 'Must pass before booking the practical test. £23. Multiple-choice (50 questions, 43 to pass) plus hazard perception. Pass certificate valid for 2 years — practical test must be passed within that window.',
    govuk_url: 'https://www.gov.uk/book-theory-test',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'All learner drivers must pass a theory test before they can book a practical driving test. Costs £23. Consists of 50 multiple-choice questions and a hazard perception video clip test. Pass certificate is valid for 2 years — if you do not pass the practical test within 2 years you must retake the theory. Must be resident in Great Britain for at least 185 days in the last 12 months.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must hold a valid provisional driving licence before the theory test can be booked.' },
        { factor: 'residency', description: 'Must have been resident in Great Britain for at least 185 days in the last 12 months before the test date.' },
      ],
      keyQuestions: [
        'Do you have a provisional driving licence?',
        'Have you studied the Highway Code and practised hazard perception?',
        'If you have previously passed, is the certificate still valid (within 2 years)?',
      ],
      means_tested: false,
      evidenceRequired: ['Provisional driving licence photocard', '£23 test fee (booked online via DVSA)'],
      ruleIn: ['Valid provisional driving licence held', 'GB resident 185+ days in last 12 months'],
      ruleOut: ['Theory test pass certificate expired (over 2 years old)'],
      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 17,
          "label": "Must be at least 17 years old (16 for moped)"
        },
        {
          "type": "dependency",
          "serviceId": "dvla-provisional-licence",
          "condition": "completed",
          "label": "Must hold a valid provisional driving licence"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/book-theory-test',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm provisional driving licence is held',
        'Guide user through the DVSA theory test booking portal',
        'Explain test format (multiple choice and hazard perception)',
        'Calculate estimated costs',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee: 23 },
      source: 'https://www.gov.uk/book-theory-test',
    },
  },
  'dvsa-driving-test': {
    id: 'dvsa-driving-test', name: 'Driving Test (practical)', dept: 'DVSA', deptKey: 'dvsa',
    deadline: null,
    desc: 'Must pass theory test first. £62 (weekday) or £75 (evening/weekend). On passing, DVLA usually sends the full licence automatically. Must claim within 2 years of passing or the pass lapses and you must retake.',
    govuk_url: 'https://www.gov.uk/book-driving-test',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Must pass the theory test before the practical test can be booked. Costs £62 (weekday) or £75 (evening/weekend/bank holiday). On passing, DVLA usually sends the full licence automatically — but if you did not hand your provisional to the examiner, or your name/address has changed, you must apply with form D1 within 2 years. Must be resident in Great Britain for at least 185 days in the last 12 months.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'A valid theory test pass certificate (valid for 2 years from the date of the theory test) is required to book.' },
        { factor: 'residency', description: 'Must have been resident in Great Britain for at least 185 days in the last 12 months before the test date.' },
      ],
      keyQuestions: [
        'Have you passed your theory test and is the certificate still valid (within 2 years)?',
        'Has your instructor confirmed you are test-ready?',
        'Do you have your provisional licence photocard to bring to the test?',
      ],
      means_tested: false,
      evidenceRequired: ['Theory test pass certificate (valid within 2 years)', 'Provisional driving licence photocard', '£62–£75 test fee (booked online via DVSA)'],
      ruleIn: ['Theory test passed within last 2 years', 'GB resident 185+ days in last 12 months'],
      ruleOut: ['Theory test pass certificate expired (over 2 years old)'],
      rules: [
        {
          "type": "dependency",
          "serviceId": "dvla-provisional-licence",
          "condition": "completed",
          "label": "Must hold a valid provisional driving licence"
        },
        {
          "type": "dependency",
          "serviceId": "dvsa-theory-test",
          "condition": "completed",
          "label": "Must have passed the theory test (valid within 2 years)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/book-driving-test',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm theory test pass certificate is valid (within 2 years)',
        'Guide user through the DVSA practical test booking portal',
        'Explain weekday vs weekend pricing',
        'Prepare checklist of what to bring on test day',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee_weekday: 62, fee_weekend: 75 },
      source: 'https://www.gov.uk/book-driving-test',
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
      ruleIn: ['Holds GB driving licence', 'Has moved to new address'],
      ruleOut: [],      rules: [
        {
          "type": "deadline",
          "triggerEvent": "move_date",
          "triggerLabel": "Date of move to new address",
          "maxDays": 90,
          "label": "Must update address within 3 months of moving"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/change-address-driving-licence',
      authRequired: 'government-gateway',
      agentCanComplete: 'full',
      agentSteps: [
        'Guide user through the online address change form step by step',
        'Confirm new address details and driving licence number',
        'Explain the legal requirement to update within 3 months of moving',
        'Advise that the service is free and a new photocard will be posted',
      ],
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
      ruleIn: ['Legal name change after marriage, civil partnership, or deed poll', 'Holds GB driving licence'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "custom_facts.name_changed",
          "expected": true,
          "label": "Legal name has changed (marriage, civil partnership, or deed poll)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/change-name-driving-licence',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Guide user through the online name change application',
        'Prepare document checklist (marriage certificate or deed poll, current licence)',
        'Explain the D1 postal alternative if online is not suitable',
        'Advise on expected processing time for the new photocard',
      ],
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
      ruleIn: ['Deceased held GB driving licence'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "A death has occurred"
        },
        {
          "type": "boolean",
          "field": "custom_facts.deceased_held_driving_licence",
          "expected": true,
          "label": "Deceased held a GB driving licence"
        }
      ],

    },
    agentInteraction: {
      methods: ['post'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain that Tell Us Once usually notifies DVLA automatically',
        'Advise sending the physical licence to DVLA with a D27 form if Tell Us Once was not used',
        'Provide the DVLA postal address for returning the licence',
      ],
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
      ruleIn: ['Holds driving licence', 'Diagnosed with DVLA notifiable condition'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Has a DVLA-notifiable medical condition",
          "rules": [
            {
              "type": "boolean",
              "field": "has_disability",
              "expected": true,
              "label": "Has a disability"
            },
            {
              "type": "boolean",
              "field": "has_long_term_health_condition",
              "expected": true,
              "label": "Has a long-term health condition"
            }
          ]
        },
        {
          "type": "boolean",
          "field": "custom_facts.holds_driving_licence",
          "expected": true,
          "label": "Holds a GB driving licence"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/report-driving-medical-condition',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Help user check if their condition is on the DVLA notifiable list',
        'Guide user through the online notification form',
        'Explain potential outcomes (licence may be restricted, revoked, or unaffected)',
        'Advise that failure to notify can invalidate motor insurance',
      ],
    },
  },
  'dvla-renew-at-70': {
    id: 'dvla-renew-at-70', name: 'Renew driving licence at 70', dept: 'DVLA', deptKey: 'dvla',
    deadline: 'Every 3 years',
    desc: 'From age 70 all driving licences expire and must be renewed every 3 years. Free online. Medical self-declaration required. Failure to renew makes driving unlawful.',
    govuk_url: 'https://www.gov.uk/renew-driving-licence-at-70',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'All driving licences expire at age 70 and must be renewed every 3 years thereafter. Renewal is free online (or via D46P form, 3-week processing). Applicant must self-declare they meet minimum eyesight standards and have no condition preventing them from driving. Driving on an expired licence is unlawful.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Applies to all driving licence holders from their 70th birthday. Must renew every 3 years after that.' },
        { factor: 'disability', description: 'Must confirm at renewal that eyesight meets minimum standard and no medical condition prevents driving. DVLA may require medical evidence if a condition has been declared.' },
      ],
      keyQuestions: [
        'Is the licence holder approaching or over 70?',
        'Has the current licence expired or is renewal due?',
        'Are there any medical conditions or eyesight changes that should be declared?',
      ],
      means_tested: false,
      evidenceRequired: ['Current driving licence', 'Online renewal via DVLA (free) or D46P postal form'],
      ruleIn: ['Driving licence holder aged 70 or over'],
      ruleOut: [],
    },
  },

  'dvla-vehicle-tax': {
    id: 'dvla-vehicle-tax', name: 'Tax your vehicle', dept: 'DVLA', deptKey: 'dvla',
    deadline: 'Before driving on road',
    desc: 'Vehicle Excise Duty must be in place before any vehicle is driven or kept on a public road. Apply online, by phone, or at a Post Office. Amount varies by vehicle type and emissions; exempt vehicles must still be taxed at £0.',
    govuk_url: 'https://www.gov.uk/vehicle-tax',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Any vehicle driven or kept on a public road must be taxed. Requires a V5C in your name (or the green new keeper slip if recently purchased), a valid MOT for most vehicles, and valid insurance. Pay annually or by monthly Direct Debit. Amount depends on vehicle type, age, and CO2 emissions. Exempt vehicles must still be declared.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must have a V5C log book in your name (or the green new keeper slip if recently purchased), a valid MOT, and valid insurance before taxing.' },
      ],
      keyQuestions: [
        'Is the vehicle being driven or kept on a public road?',
        'Do you have the V5C or new keeper\'s green slip?',
        'Does the vehicle have a current MOT?',
        'Is the vehicle exempt from vehicle tax (e.g. historic pre-1977, disabled, agricultural)?',
      ],
      autoQualifiers: ['V5C held in keeper\'s name, valid MOT and insurance in place'],
      exclusions: ['Vehicles kept entirely off public roads do not need to be taxed — make a SORN instead.'],
      means_tested: false,
      evidenceRequired: ['V5C log book or new keeper green slip', 'Valid MOT certificate (most vehicles)', 'Insurance details', 'Debit/credit card or Direct Debit'],
      ruleIn: ['Vehicle driven or kept on a public road'],
      ruleOut: ['Vehicle is SORNed and kept entirely off public roads'],
    },
  },
  'dvla-sorn': {
    id: 'dvla-sorn', name: 'Make a SORN', dept: 'DVLA', deptKey: 'dvla',
    deadline: 'When tax expires',
    desc: 'Free Statutory Off Road Notification — required when a vehicle is taken off the road and not being taxed. Tax is cancelled and remaining full months refunded. SORN stays active until the vehicle is taxed again. Driving a SORNed vehicle on a public road is a criminal offence (fine up to £1,000).',
    govuk_url: 'https://www.gov.uk/make-a-sorn',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'A free SORN must be made when a registered keeper stops taxing a vehicle and keeps it off public roads. The vehicle cannot be driven or parked on a public road — doing so is a criminal offence (fine up to £1,000, vehicle may be clamped or impounded). SORN remains in place until the vehicle is taxed again.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Registered keeper of a vehicle whose tax has lapsed or is about to lapse, and which will be kept off public roads.' },
      ],
      keyQuestions: [
        'Are you the registered keeper of the vehicle?',
        'Is the vehicle being kept off public roads (e.g. in a garage or on private land)?',
        'Has the vehicle tax expired or is it due to expire?',
      ],
      exclusions: ['You do not need a SORN if you have already notified DVLA that you have sold the vehicle.'],
      means_tested: false,
      evidenceRequired: ['Vehicle registration number', '11-digit reference from V5C or tax reminder letter'],
      ruleIn: ['Registered keeper keeping vehicle off public roads'],
      ruleOut: ['Vehicle already sold (notify DVLA of sale instead)'],
    },
  },
  'dvla-vehicle-sale': {
    id: 'dvla-vehicle-sale', name: 'Notify DVLA of vehicle sale', dept: 'DVLA', deptKey: 'dvla',
    deadline: 'Same day as sale',
    desc: 'Sellers must notify DVLA the same day a vehicle is sold or transferred. Give the green new keeper slip from the V5C to the buyer. DVLA cancels the seller\'s tax and refunds any full months remaining. Buyer must tax the vehicle (or SORN it) before driving.',
    govuk_url: 'https://www.gov.uk/sold-bought-vehicle',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'When selling or transferring a vehicle, the seller must notify DVLA online immediately. The green new keeper slip from the V5C goes to the buyer. Vehicle tax is not transferred — the buyer must tax the vehicle before driving it (or make a SORN). If no V5C exists, the buyer must apply for one using form V62 (£25).',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Applies to any registered keeper who sells, gifts, or otherwise transfers ownership of a vehicle registered in the UK.' },
      ],
      keyQuestions: [
        'Are you the registered keeper selling or transferring the vehicle?',
        'Do you have the V5C to give the green slip to the buyer?',
        'Has the buyer been told they must tax the vehicle before driving it?',
      ],
      autoQualifiers: ['Sale or transfer of a vehicle you are the registered keeper of'],
      means_tested: false,
      evidenceRequired: ['V5C log book (give green new keeper slip to buyer)', 'Vehicle registration number for online DVLA notification'],
      ruleIn: ['Registered keeper selling or transferring vehicle'],
      ruleOut: [],
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
      ruleIn: ['Director aged 16 or over', 'UK registered office address'],
      ruleOut: [],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 16,
          "label": "Director must be at least 16 years old"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.company-information.service.gov.uk/',
      onlineFormUrl: 'https://www.gov.uk/limited-company-formation/register-your-company',
      authRequired: 'companies-house',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check company name availability using Companies House WebCHeck',
        'Guide user through the online incorporation process',
        'Explain director, shareholder, and PSC requirements',
        'Calculate registration fee and explain same-day processing option',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { registration_fee: 50 },
      source: 'https://www.gov.uk/limited-company-formation/register-your-company',
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
      ruleIn: ['Estate includes solely-held assets over £10,000', 'Death registered'],
      ruleOut: ['All assets held jointly (pass automatically)'],      rules: [
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "A death has occurred"
        },
        {
          "type": "boolean",
          "field": "death_registered",
          "expected": true,
          "label": "Death has been registered"
        },
        {
          "type": "boolean",
          "field": "estate_has_sole_assets",
          "expected": true,
          "label": "Estate includes assets held in the deceased's sole name"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/applying-for-probate/apply-for-probate',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check whether probate is needed based on estate value and asset ownership',
        'Guide user through the online probate application (PA1P or PA1A)',
        'Prepare document checklist (will, death certificate, estate valuation)',
        'Explain current processing times and court fee',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee_over_5000: 300 },
      source: 'https://www.gov.uk/applying-for-probate/apply-for-probate',
    },
      contactInfo: {
      phone: {
        number: '+44 300 303 0648',
        textphone: '+44 300 303 0648',
        relay: '18001 then 0300 303 0648',
        label: 'Probate helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      webchatUrl: 'https://www.gov.uk/contact-probate-service',
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
      ruleIn: ['Married or in civil partnership at least 1 year', 'Domiciled or habitually resident in England/Wales'],
      ruleOut: [],      rules: [
        {
          "type": "enum",
          "field": "relationship_status",
          "oneOf": [
            "married",
            "civil_partnership"
          ],
          "label": "Must be married or in a civil partnership"
        },
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "england",
            "wales"
          ],
          "label": "Domiciled or habitually resident in England or Wales"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-for-divorce',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility (married 1+ year, resident in England/Wales)',
        'Guide user through the online D8 divorce application',
        'Explain the 26-week minimum timeline and key milestones',
        'Advise on financial consent order before final order',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee: 593 },
      source: 'https://www.gov.uk/apply-for-divorce',
    },
      contactInfo: {
      phone: { number: '+44 300 303 0642', relay: '18001 then 0300 303 0642', label: 'Divorce helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['In divorce or dissolution proceedings', 'Shared assets, property, or pensions'],
      ruleOut: [],      rules: [
        {
          "type": "dependency",
          "serviceId": "hmcts-divorce",
          "condition": "receiving",
          "label": "Divorce or dissolution proceedings must be in progress"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/money-property-when-relationship-ends/apply-for-a-financial-order',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain the importance of a financial consent order before final divorce order',
        'Guide user through the D81 financial statement form',
        'Prepare checklist of financial disclosure required from both parties',
        'Calculate estimated court fee',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee: 275 },
      source: 'https://www.gov.uk/money-property-when-relationship-ends/apply-for-a-financial-order',
    },
      contactInfo: {
      phone: { number: '+44 300 303 0642', relay: '18001 then 0300 303 0642', label: 'Family court helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Separated parents unable to agree on child arrangements'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Has children under 16"
        },
        {
          "type": "any",
          "label": "Parents are separated or divorcing",
          "rules": [
            {
              "type": "enum",
              "field": "relationship_status",
              "oneOf": [
                "separated",
                "divorced"
              ],
              "label": "Separated or divorced"
            },
            {
              "type": "dependency",
              "serviceId": "hmcts-divorce",
              "condition": "receiving",
              "label": "Divorce proceedings in progress"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/looking-after-children-divorce/apply-for-court-order',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check whether mediation (MIAM) has been attempted or an exemption applies',
        'Guide user through the C100 application form',
        'Explain the court process and expected timeline',
        'Calculate estimated court fee and check for fee remission eligibility',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee: 255 },
      source: 'https://www.gov.uk/looking-after-children-divorce/apply-for-court-order',
    },
      contactInfo: {
      phone: { number: '+44 300 303 0642', relay: '18001 then 0300 303 0642', label: 'Family court helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: ['Disposable income below £2,657/month', 'Domestic abuse victim or case with strong merits'],
      ruleOut: ['Capital above £8,000'],      rules: [
        {
          "type": "comparison",
          "field": "savings",
          "operator": "<",
          "value": 8000,
          "label": "Disposable capital must be below £8,000"
        },
        {
          "type": "any",
          "label": "Low income or on qualifying benefit",
          "rules": [
            {
              "type": "comparison",
              "field": "annual_income",
              "operator": "<",
              "value": 31884,
              "label": "Disposable income below £2,657/month (£31,884/year)"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_support",
              "expected": true,
              "label": "Receiving Income Support"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/check-legal-aid',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility using the GOV.UK legal aid calculator',
        'Explain the means test and merits test requirements',
        'Help user find a legal aid solicitor in their area',
        'Advise on domestic abuse provisions that widen eligibility',
      ],
    },
      contactInfo: {
      phone: { number: '+44 345 345 4345', label: 'Civil Legal Advice' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '09:00',
          close: '20:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '12:30',
        },
      ],
      notes: 'Translation available in over 170 languages.',
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
      ruleIn: ['Mandatory Reconsideration Notice received', 'Still disagrees with DWP decision'],
      ruleOut: [],      rules: [
        {
          "type": "dependency",
          "serviceId": "dwp-mandatory-reconsideration",
          "condition": "completed",
          "label": "Mandatory Reconsideration must have been completed"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/appeal-benefit-decision',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm Mandatory Reconsideration Notice has been received',
        'Guide user through the SSCS1 appeal form',
        'Explain the tribunal process and what to expect at a hearing',
        'Advise on gathering supporting medical or other evidence',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 123 1142', relay: '18001 then 0300 123 1142', label: 'SSCS Tribunal helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:30',
          close: '17:00',
        },
      ],
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
      ruleIn: [],
      ruleOut: [],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 16,
          "label": "Must be 16 or over to register"
        },
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Living in the UK"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/register-to-vote',
      authRequired: 'none',
      agentCanComplete: 'full',
      agentSteps: [
        'Guide user through the Register to Vote online form',
        'Confirm new address and National Insurance number',
        'Explain impact on jury duty eligibility and credit checks',
        'Remind user to de-register from old address if needed',
      ],
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
      ruleIn: ['Registered to vote', 'No accepted photo ID (passport, driving licence)'],
      ruleOut: ['Already holds accepted photo ID for polling'],      rules: [
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Resident in the UK and registered to vote"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-for-photo-id-voter-authority-certificate',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check whether user already has an accepted form of photo ID for voting',
        'Guide user through the Voter Authority Certificate online application',
        'Explain that the certificate is free and issued by the local council',
        'Advise on photo requirements and processing time before elections',
      ],
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
      ruleIn: [],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the requirement to register for Council Tax at the new address',
        'Help user find their local council\'s Council Tax registration page',
        'Advise on available discounts (single person, student exemption, CTR)',
        'Remind user to close the Council Tax account at their old address',
      ],
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
      ruleIn: ['Only adult (18+) now living in the property'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "custom_facts.sole_adult_in_property",
          "expected": true,
          "label": "Must be the only adult (18+) living in the property"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check eligibility — only adult (18+) in the property',
        'Help user find their local council\'s single person discount application',
        'Calculate estimated saving (25% of Council Tax bill)',
        'Explain that the discount can be backdated in some cases',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { discount_percent: 25 },
      source: 'https://www.gov.uk/council-tax-discounts',
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
      ruleIn: ['Low income or receiving means-tested benefit', 'Liable for Council Tax at address'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Must be on low income or receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "comparison",
              "field": "weekly_income",
              "operator": "<",
              "value": 250,
              "label": "Low weekly income"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      missingBenefitId: 'councilTaxReduction',
      agentSteps: [
        'Check eligibility based on income and benefits received',
        'Help user find their local council\'s Council Tax Reduction application',
        'Explain that schemes vary by local authority',
        'Advise that CTR can reduce the bill significantly or to zero',
      ],
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
      ruleIn: ['Reached State Pension age (66)'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Reached State Pension age or has a qualifying disability",
          "rules": [
            {
              "type": "comparison",
              "field": "age",
              "operator": ">=",
              "value": 66,
              "label": "Reached State Pension age (66)"
            },
            {
              "type": "boolean",
              "field": "has_disability",
              "expected": true,
              "label": "Has a qualifying disability"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check eligibility based on State Pension age or qualifying disability',
        'Help user find their local council\'s bus pass application page',
        'Explain the application process varies by local authority',
        'Advise on documents needed (proof of age, address, photo)',
      ],
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
      ruleIn: [],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the application deadlines (Primary: 15 Jan, Secondary: 31 Oct)',
        'Help user find their local authority\'s admissions portal',
        'Advise on choosing schools based on catchment area and preferences',
        'Explain the appeals process if a preferred school place is not offered',
      ],
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
      ruleIn: ['Receiving qualifying benefit', 'Child at state school of compulsory school age'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Has school-age children"
        },
        {
          "type": "any",
          "label": "Receiving a qualifying benefit",
          "rules": [
            {
              "type": "all",
              "label": "On Universal Credit with low earned income",
              "rules": [
                {
                  "type": "dependency",
                  "serviceId": "dwp-universal-credit",
                  "condition": "receiving",
                  "label": "Receiving Universal Credit"
                },
                {
                  "type": "comparison",
                  "field": "annual_income",
                  "operator": "<",
                  "value": 7400,
                  "label": "Annual net earned income under £7,400"
                }
              ]
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_support",
              "expected": true,
              "label": "Receiving Income Support"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_based_jsa",
              "expected": true,
              "label": "Receiving income-based JSA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_related_esa",
              "expected": true,
              "label": "Receiving income-related ESA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit (Guarantee Credit)"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility based on benefits and income thresholds',
        'Help user find their local authority\'s Free School Meals application',
        'Explain that registration also unlocks Pupil Premium funding for the school',
        'Guide user through the application process',
      ],
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
      ruleIn: ['Child aged 0–25 with complex SEND needs', 'Needs not met by standard school support'],
      ruleOut: [],      rules: [
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "<=",
          "value": 25,
          "label": "Child or young person aged 0–25"
        },
        {
          "type": "deadline",
          "triggerEvent": "ehc_request_date",
          "triggerLabel": "Date EHC assessment was requested",
          "maxDays": 140,
          "label": "Local Authority must complete assessment within 20 weeks (140 days)"
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'post'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the EHC plan assessment process and 20-week timeline',
        'Help user find their local authority\'s SEND department contact details',
        'Advise on gathering supporting evidence (school reports, medical assessments)',
        'Explain the right to appeal if the assessment is refused',
      ],
    },
      contactInfo: {
      localAuthority: true,
      officeLocatorUrl: 'https://www.gov.uk/find-local-council',
      additionalPhones: [
        { number: '+44 1799 582030', label: 'IPSEA SEND advice line (independent)' },
      ],
      notes: 'Contact your local council SEND department. IPSEA offers free independent advice.',
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
      ruleIn: ['Enhanced Rate PIP mobility or severe difficulty walking'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Qualifies via disability benefit or severe mobility difficulty",
          "rules": [
            {
              "type": "enum",
              "field": "pip_mobility_rate",
              "oneOf": [
                "enhanced"
              ],
              "label": "Receiving Enhanced Rate PIP mobility component"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receives_dla_higher_mobility",
              "expected": true,
              "label": "Receiving DLA highest rate mobility component"
            },
            {
              "type": "boolean",
              "field": "custom_facts.severe_walking_difficulty",
              "expected": true,
              "label": "Cannot walk or has severe difficulty walking"
            },
            {
              "type": "boolean",
              "field": "custom_facts.registered_blind",
              "expected": true,
              "label": "Registered severely sight impaired (blind)"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-blue-badge',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check automatic eligibility (Enhanced Rate PIP mobility, DLA highest mobility)',
        'Guide user through the GOV.UK Blue Badge application',
        'Prepare document checklist (benefit award letter, proof of address)',
        'Explain the assessment process for non-automatic applicants',
      ],
    },
      contactInfo: {
      localAuthority: true,
      officeLocatorUrl: 'https://www.gov.uk/find-local-council',
      contactFormUrl: 'https://www.gov.uk/apply-blue-badge',
      notes: 'Apply online via GOV.UK. Council handles assessment.',
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
      ruleIn: ['Disabled person living in property needing adaptations'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Must have a disability requiring home adaptations",
          "rules": [
            {
              "type": "boolean",
              "field": "has_disability",
              "expected": true,
              "label": "Has a disability"
            },
            {
              "type": "boolean",
              "field": "has_long_term_health_condition",
              "expected": true,
              "label": "Has a long-term health condition"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the Disabled Facilities Grant process and means test',
        'Help user contact their local authority housing or occupational therapy team',
        'Advise on the types of adaptations covered (ramps, stairlifts, bathrooms)',
        'Calculate potential grant amount (up to £30,000 in England)',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { max_grant: 30000 },
      source: 'https://www.gov.uk/disabled-facilities-grants',
    },
      contactInfo: {
      localAuthority: true,
      officeLocatorUrl: 'https://www.gov.uk/find-local-council',
      additionalPhones: [
        { number: '+44 300 124 0315', label: 'Foundations (Home Improvement Agencies)' },
      ],
      notes: 'Apply through your local council. Foundations can help with the application process.',
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
      ruleIn: ['Adult unpaid carer providing regular substantial care'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['phone', 'in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the carer\'s assessment process and what support may be available',
        'Help user find their local authority adult social care contact details',
        'Advise that the assessment is free and separate from the cared-for person\'s assessment',
        'Suggest requesting the assessment alongside a care needs assessment if applicable',
      ],
    },
      contactInfo: {
      localAuthority: true,
      officeLocatorUrl: 'https://www.gov.uk/find-local-council',
      additionalPhones: [
        { number: '+44 808 808 7777', label: 'Carers UK helpline' },
      ],
      notes: 'Request from your local council adult social care. Carers UK offers free independent advice.',
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
      ruleIn: ['Occupying non-domestic premises for business purposes'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Running a business from non-domestic premises",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "self-employed",
                "director"
              ],
              "label": "Self-employed or company director"
            }
          ]
        },
        {
          "type": "boolean",
          "field": "custom_facts.uses_commercial_premises",
          "expected": true,
          "label": "Occupying non-domestic premises for business"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain business rates liability and how rateable value is determined',
        'Help user check if Small Business Rate Relief applies (rateable value under £12,000)',
        'Help user find their local council\'s business rates registration page',
        'Advise on other available reliefs (rural, charitable, empty property)',
      ],
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
      ruleIn: ['Operating a food business of any type'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "custom_facts.is_food_business",
          "expected": true,
          "label": "Operating a food business (selling, cooking, preparing, or distributing food)"
        },
        {
          "type": "deadline",
          "triggerEvent": "food_business_start_date",
          "triggerLabel": "Planned food business opening date",
          "maxDays": -28,
          "label": "Must register at least 28 days before opening"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/food-business-registration',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Guide user through the food business registration process',
        'Explain the 28-day advance registration requirement',
        'Help user find their local authority\'s food hygiene registration page',
        'Advise on food safety and hygiene rating expectations',
      ],
    },
  },
  'la-food-premises-approval': {
    id: 'la-food-premises-approval', name: 'Food establishment approval (animal products)', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Food businesses handling products of animal origin (meat, fish, dairy, eggs) that supply other establishments require formal approval from their local authority, beyond basic food business registration.',
    govuk_url: 'https://www.gov.uk/find-licences/food-premises-approval',
    serviceType: 'registration',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Required for establishments in England handling products of animal origin (meat, fish, dairy, eggs, processed animal products) that supply other food businesses. Separate from and in addition to basic food hygiene registration. Operating without required approval is a criminal offence.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Handling products of animal origin AND supplying other food establishments, not only direct-to-consumer retail.' },
      ],
      keyQuestions: [
        'What type of food products do you handle?',
        'Are you supplying other food businesses or only selling direct to consumers?',
        'Have you already registered as a food business with your local authority?',
        'Are you in England (devolved nations have separate rules)?',
      ],
      means_tested: false,
      evidenceRequired: ['Details of business activities', 'Existing food business registration', 'Discussion with local authority Environmental Health team'],
      ruleIn: ['Abattoir or cutting plant', 'Dairy or egg processing', 'Fish processing', 'Wholesale supply of animal products to other food businesses'],
      ruleOut: ['Purely retail or direct-to-consumer with no supply to other establishments', 'Not handling products of animal origin'],
    },
  },
  'la-hmo-licence': {
    id: 'la-hmo-licence', name: 'House in multiple occupation (HMO) licence', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Landlords renting a property to 5 or more people from more than one household who share facilities must obtain a mandatory HMO licence from their local council.',
    govuk_url: 'https://www.gov.uk/find-licences/house-in-multiple-occupation-licence',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Mandatory for properties rented to 5+ people in 2+ households sharing facilities (toilet, bathroom, or kitchen) in England and Wales. Some councils have additional licensing schemes covering smaller HMOs. Licences last up to 5 years. Unlimited fine for unlicensed operation.',
      universal: false,
      criteria: [
        { factor: 'property', description: '5 or more occupants from 2 or more separate households sharing facilities.' },
        { factor: 'employment', description: 'Operating as a landlord letting the property; at least one occupant pays rent.' },
      ],
      keyQuestions: [
        'How many people will be living in the property?',
        'Are they from more than one household?',
        'Do they share toilet, bathroom, or kitchen facilities?',
        'Which local authority area is the property in (some have additional licensing for smaller HMOs)?',
      ],
      means_tested: false,
      evidenceRequired: ['Gas safety certificate (annual)', 'Smoke alarm records', 'Electrical appliance safety certificates (on request)', 'Completed local council application form'],
      ruleIn: ['Renting to 5 or more people from 2 or more households', 'Shared house or bedsit conversion', 'Student let or professional house share'],
      ruleOut: ['Fewer than 5 occupants (unless local additional licensing scheme applies)', 'All occupants from the same household'],
    },
  },
  'la-child-performance-licence': {
    id: 'la-child-performance-licence', name: 'Child performance licence', dept: 'Local Authority', deptKey: 'la',
    deadline: '21 days',
    desc: 'Children below school-leaving age taking part in public performances, sporting events or modelling require a licence from the local council. Applied for by the event organiser, not the parent.',
    govuk_url: 'https://www.gov.uk/apply-for-child-performance-licence',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required for children below school-leaving age participating in public performances, sporting events, or professional modelling in England, Scotland and Wales. The event organiser (not the parent) applies at least 21 days before the event.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Child must be below school-leaving age.' },
        { factor: 'geography', description: 'Applies in England, Scotland and Wales; Northern Ireland has separate rules.' },
      ],
      keyQuestions: [
        'How old is the child?',
        'What type of event — performance, sporting event, or modelling?',
        'Who is the event organiser?',
        'Is the event in England, Scotland, or Wales?',
      ],
      means_tested: false,
      evidenceRequired: ['Event details and type', 'Chaperone supervision arrangements', 'Application submitted by the event organiser (not the parent)'],
      ruleIn: ['Child under school-leaving age in a public performance', 'Child acting in a professional production', 'Child modelling assignment', 'Child in competitive sporting event'],
      ruleOut: ['Child above school-leaving age', 'Event is in Northern Ireland', 'Event is school curriculum-based'],
    },
  },
  'la-house-to-house-collection-licence': {
    id: 'la-house-to-house-collection-licence', name: 'House-to-house collection licence', dept: 'Local Authority', deptKey: 'la',
    deadline: '20 days',
    desc: 'Charities and local groups wishing to collect money or goods door-to-door from residential properties must obtain a free licence from their local council in England and Wales.',
    govuk_url: 'https://www.gov.uk/find-licences/house-to-house-collection-licence',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required for charitable organisations collecting door-to-door from residential properties in England and Wales. Free to obtain. Apply at least 20 working days before the collection. Licences valid for up to 1 year. Penalty for no licence: up to 6 months imprisonment or £1,000 fine.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Collecting money or goods door-to-door from residential properties for charitable purposes in England and Wales.' },
      ],
      keyQuestions: [
        'Is the collection for a registered charity or local community group?',
        'Are you collecting money, goods, or both?',
        'How many collectors will be involved?',
        'Which local authority area will the collection cover?',
      ],
      means_tested: false,
      evidenceRequired: ['Names of all authorised collectors', 'Details of the charitable purpose', 'Application to local council (free)'],
      ruleIn: ['Charity fundraising door-to-door', 'Scout or guide group collecting at residential doors', 'Community fundraiser at residential properties'],
      ruleOut: ['Commercial (non-charitable) collections', 'Collections in streets or public places (requires street collection licence instead)'],
    },
  },
  'la-road-occupation-licence': {
    id: 'la-road-occupation-licence', name: 'Road occupation licence (building work)', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Anyone digging up or placing materials, equipment or a skip on a public road in connection with building work must obtain a licence from the local council. Cannot be applied for online.',
    govuk_url: 'https://www.gov.uk/find-licences/road-occupation-licence-for-building-work',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required for any building work involving breaking or occupying a public road in England and Wales. Must contact the local authority directly — online applications are not accepted. Penalty for non-compliance: £10/day plus the council\'s remediation costs.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Carrying out building work that involves digging up the road or placing materials, equipment, scaffolding, or a skip on a public road.' },
        { factor: 'geography', description: 'Public roads in England and Wales.' },
      ],
      keyQuestions: [
        'Does the building work require digging up or occupying a public road?',
        'Will you be placing materials, equipment, or a skip on the public road?',
        'Which local authority area is the road in?',
      ],
      means_tested: false,
      evidenceRequired: ['Site plan', 'Public liability insurance certificate', 'Additional plans as required by the council'],
      ruleIn: ['Road dig for utility connection', 'Scaffolding overhanging a public road', 'Construction materials stored on a public highway', 'Road crossing installation'],
      ruleOut: ['Work is entirely on private land', 'Materials or equipment placed only on a private driveway'],
    },
  },
  'la-scrap-metal-dealer-licence': {
    id: 'la-scrap-metal-dealer-licence', name: 'Scrap metal dealer licence', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Any person or business buying, selling, or storing scrap metal in England and Wales must hold a licence from their local council. Cash payments are prohibited; all transactions must be by bank transfer.',
    govuk_url: 'https://www.gov.uk/find-licences/scrap-metal-dealer-registration',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Mandatory for all scrap metal dealers in England and Wales. Two types: site licence (fixed premises) and collector\'s licence (mobile). Licences renew every 3 years. A tax check with HMRC is required at renewal. Fine up to £5,000 for unlicensed dealing.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Buying, selling, or storing scrap metal in England or Wales, whether from fixed premises or as a mobile collector.' },
      ],
      keyQuestions: [
        'Will you operate from a fixed site or as a mobile collector?',
        'Have you (or any director or partner) had relevant convictions or enforcement actions?',
        'Is this a renewal? (A tax check with HMRC is required.)',
      ],
      means_tested: false,
      evidenceRequired: ['Personal details and company registration', 'Trading name and business addresses', 'Environmental permit details', 'Disclosure of relevant convictions', 'Bank account details (all transactions must be non-cash)'],
      ruleIn: ['Metal recycling business', 'Car breaker or salvage yard', 'Buying and selling scrap metal', 'Mobile metal collection'],
      ruleOut: ['Not dealing in scrap metal', 'Located outside England and Wales'],
    },
  },
  'la-skip-permit': {
    id: 'la-skip-permit', name: 'Skip permit (public road)', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'A permit from the local council is required before placing a skip or container on a public road in England and Wales. No permit is needed if the skip is entirely on private land.',
    govuk_url: 'https://www.gov.uk/find-licences/apply-skip-permit',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required whenever a skip is placed on a public road in England and Wales. The skip hire company typically obtains the permit, but individuals should confirm with their local council. Safety requirements: reflective markings, traffic cones, lamps at night, and contact details displayed. Fine up to £1,000 for missing safety markings.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Placing a skip, hippobag, or similar container on a public road.' },
        { factor: 'geography', description: 'Public roads in England and Wales.' },
      ],
      keyQuestions: [
        'Will the skip be placed on a public road or entirely on private land?',
        'Is the skip hire company obtaining the permit, or are you responsible?',
        'Which local authority area is involved?',
      ],
      means_tested: false,
      evidenceRequired: ['Application to local council', 'Skip hire company details and contact information'],
      ruleIn: ['Skip placed on a public road', 'Building or renovation waste requiring a roadside skip'],
      ruleOut: ['Skip placed entirely on private land such as a driveway or garden'],
    },
  },
  'la-street-collection-licence': {
    id: 'la-street-collection-licence', name: 'Street collection licence', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Collecting money or selling items for charity in a public street or place requires a street collection licence. Apply to the local council, or the Metropolitan Police in Greater London.',
    govuk_url: 'https://www.gov.uk/find-licences/street-collection-licence',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required for any charitable collection in a public street or place in England and Wales. Free to obtain. Greater London collections (outside City of London) go through the Metropolitan Police. Penalty: £200 fine for collecting without a licence.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Collecting money or selling items for a charitable purpose in a public street, shop doorway, or car park in England and Wales.' },
      ],
      keyQuestions: [
        'Is the collection for a registered charity?',
        'Where exactly will the collection take place (street, car park, etc.)?',
        'Is the location in Greater London (Metropolitan Police applies)?',
      ],
      means_tested: false,
      evidenceRequired: ['Charity details and purpose of collection', 'Location and timing of collection'],
      ruleIn: ['Charity tin collection in a public street', 'Street fundraising for charity', 'Selling items for charity in a public place'],
      ruleOut: ['Purely commercial sale with no charitable claim', 'Door-to-door collection (requires house-to-house collection licence instead)'],
    },
  },
  'la-street-trading-licence': {
    id: 'la-street-trading-licence', name: 'Street trading licence', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Anyone selling goods or services from a street or public place in England and Wales generally requires a street trading licence from their local council. Councils may restrict hours, location or days.',
    govuk_url: 'https://www.gov.uk/find-licences/street-trading-licence',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required for most street trading in England and Wales. Holders of a valid pedlar\'s certificate may be exempt for itinerant trading. Councils can restrict or refuse applications and waiting lists may apply. Fine up to £1,000 for trading without a licence.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Selling goods or services from a street or public place in England and Wales.' },
      ],
      keyQuestions: [
        'What are you selling and from which location?',
        'Do you have a pedlar\'s certificate?',
        'Is the location on a council-designated street or public area?',
        'Which local council covers that area?',
      ],
      means_tested: false,
      evidenceRequired: ['Location and proposed trading hours', 'Two photographs may be required', 'Application to local council'],
      ruleIn: ['Food van or cart in a public street', 'Market stall on public land', 'Mobile trader at a fixed street pitch', 'Selling goods from a public place'],
      ruleOut: ['Trading from entirely private land', 'Holding a valid pedlar\'s certificate (may be exempt for itinerant trading)'],
    },
  },
  'la-temporary-events-notice': {
    id: 'la-temporary-events-notice', name: 'Temporary Events Notice (TEN)', dept: 'Local Authority', deptKey: 'la',
    deadline: '10 days',
    desc: 'Allows an individual to hold licensable activities (alcohol sales, entertainment, late-night refreshment) on unlicensed premises for up to 7 days with a maximum of 500 attendees. Fee: £21.',
    govuk_url: 'https://www.gov.uk/find-licences/temporary-events-notice',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Applicant must be an individual aged 18+ (organisations cannot apply). Maximum 500 people including staff; event up to 168 hours (7 days). Must be submitted at least 10 clear working days before the event. Annual limits apply per individual and per premises.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Applicant must be an individual aged 18 or over; organisations cannot apply.' },
        { factor: 'employment', description: 'Planning to hold a licensable activity (alcohol sales, regulated entertainment, late-night refreshment) on premises not already licensed for that activity.' },
      ],
      keyQuestions: [
        'Are you an individual aged 18 or over?',
        'Is the venue already licensed for this activity?',
        'How many people will attend, including staff?',
        'How long will the event last?',
        'How many TENs have you applied for this year?',
      ],
      autoQualifiers: ['Unlicensed venue, under 500 attendees, individual applicant aged 18+'],
      exclusions: ['Organisation (not individual) applying', 'More than 500 attendees', 'Event exceeds 168 hours', 'Annual TEN limit already reached'],
      means_tested: false,
      evidenceRequired: ['Completed notice to local council (£21 fee)', 'Police and environmental health notification if applying offline', 'Event details: dates, times, activities, number of attendees'],
      ruleIn: ['One-off event with alcohol or entertainment on unlicensed land', 'Pop-up bar or outdoor festival', 'Community fundraiser with regulated entertainment', 'Private party with licensable activity on unlicensed premises'],
      ruleOut: ['Organisation (not individual) applying', 'More than 500 attendees', 'Event duration over 168 hours', 'Annual TEN limit already reached', 'Application received fewer than 5 working days before event'],
    },
  },
  'la-public-film-screening': {
    id: 'la-public-film-screening', name: 'Public film or TV screening permissions', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Showing films or TV in a public setting requires a copyright licence (e.g. from MPLC or Filmbank), a premises licence from the local council, and a TV licence if using TV-receiving equipment.',
    govuk_url: 'https://www.gov.uk/showing-films-in-public',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Any public screening of films or TV — whether ticketed or free — requires a copyright licence, a premises licence from the local council, and a TV licence if using TV-receiving equipment. Multiple licences are typically needed simultaneously. Commercial streaming subscriptions (e.g. Netflix) do not permit public screening. State school curriculum use is exempt.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Showing films or TV programmes in a public or communal setting: cinema club, hotel, pub, outdoor event, community hall, retail display, or staff room.' },
      ],
      keyQuestions: [
        'What type of venue and audience — public event, community club, or commercial premises?',
        'Is it a one-off event or regular screenings?',
        'Which films or TV content will be shown?',
        'Will you be using a TV, projector, or streaming device?',
      ],
      means_tested: false,
      evidenceRequired: ['Copyright licence from MPLC, Filmbank, or individual distributor', 'Premises licence from local council', 'TV Licence if using TV-receiving equipment'],
      ruleIn: ['Community cinema or film club', 'Pub or hotel film night', 'Outdoor or pop-up cinema', 'Retail or hotel display screens showing TV content', 'Staff room TV or film showing'],
      ruleOut: ['Private home viewing', 'State school showing curriculum content'],
    },
  },

  // ENVIRONMENT AGENCY ───────────────────────────────────────────────────────
  'ea-waste-carrier-registration': {
    id: 'ea-waste-carrier-registration', name: 'Waste carrier, broker or dealer registration', dept: 'Environment Agency', deptKey: 'ea',
    deadline: null,
    desc: 'Any business that transports, buys, sells, or arranges disposal of waste in England must register with the Environment Agency. Lower-tier (free) covers own waste only; upper-tier covers commercial waste handling.',
    govuk_url: 'https://www.gov.uk/register-renew-waste-carrier-broker-dealer-england',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Mandatory for all waste carriers, brokers and dealers in England. Two tiers: lower-tier (own waste only, free) and upper-tier (commercial waste handling, £184 initial, renews every 3 years). Changes to business details must be notified within 28 days. Separate registration schemes apply in Scotland, Wales and Northern Ireland.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Transporting, buying, selling, or arranging disposal of waste in England, whether own waste or waste collected from others.' },
      ],
      keyQuestions: [
        'Are you transporting your own waste, or waste collected from other businesses?',
        'Are you buying, selling, or arranging disposal of waste as a service?',
        'Do any directors or partners have environmental offence convictions?',
      ],
      means_tested: false,
      evidenceRequired: ['Names and dates of birth of directors, owners, or partners', 'Details of any environmental offences', 'Payment details (upper tier: £184 initial registration, £105 renewal)'],
      ruleIn: ['Waste collection business', 'Skip hire company', 'Construction or demolition waste disposal', 'Recycling or scrap dealer', 'Waste broker or hazardous waste transporter'],
      ruleOut: ['Operating only in Scotland, Wales, or Northern Ireland (separate registration schemes apply)'],
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
      ruleIn: ['Non-UK/non-Irish national', 'Specific purpose for entering UK'],
      ruleOut: ['British or Irish citizen'],      rules: [
        {
          "type": "not",
          "label": "Not a British or Irish citizen (visa not required)",
          "rules": [
            {
              "type": "enum",
              "field": "citizenship",
              "oneOf": [
                "british",
                "irish"
              ],
              "label": "British or Irish citizen"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-to-come-to-the-uk',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Help user identify the correct visa category for their purpose',
        'Guide user through the GOV.UK visa application portal',
        'Prepare document checklist based on visa type',
        'Explain the Immigration Health Surcharge and biometric appointment requirements',
      ],
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
      ruleIn: ['EU, EEA, or Swiss national', 'Living in UK before 31 December 2020'],
      ruleOut: ['Not EU/EEA/Swiss national and not family member of one'],      rules: [
        {
          "type": "enum",
          "field": "citizenship",
          "oneOf": [
            "eu",
            "eea",
            "swiss"
          ],
          "label": "EU, EEA, or Swiss national"
        },
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Living in the UK"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/settled-status-eu-citizens-families/applying-for-settled-status',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility based on nationality and UK residence before 31 December 2020',
        'Guide user through the EU Settlement Scheme application',
        'Explain the difference between settled status (5+ years) and pre-settled status',
        'Prepare evidence checklist for UK residence',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 123 7379', relay: '18001 then 0300 123 7379', label: 'EU Settlement Scheme Resolution Centre' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '20:00',
        },
        {
          days: ['sat','sun'],
          open: '09:30',
          close: '16:30',
        },
      ],
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
      ruleIn: ['Granted UK visa or leave to remain for 6+ months'],
      ruleOut: [],      rules: [
        {
          "type": "dependency",
          "serviceId": "ho-visa",
          "condition": "completed",
          "label": "Must have been granted a UK visa for 6+ months"
        },
        {
          "type": "deadline",
          "triggerEvent": "uk_arrival_date",
          "triggerLabel": "Date of arrival in the UK",
          "maxDays": 10,
          "label": "Must collect BRP within 10 days of arriving in the UK"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the BRP collection process and 10-day deadline',
        'Help user identify their designated post office for collection',
        'Advise on what to do if the BRP has not arrived or contains errors',
        'Explain that BRP proves right to work and rent in the UK',
      ],
    },
  },
  'ho-life-in-uk': {
    id: 'ho-life-in-uk', name: 'Life in the UK test', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Required for ILR and all citizenship routes (naturalisation, spouse, Irish citizen). 45-minute test, £50 per attempt. Exempt if under 18 or over 65.',
    govuk_url: 'https://www.gov.uk/life-in-the-uk-test',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'A 45-minute, 24-question test on British history, culture and values. Required before applying for Indefinite Leave to Remain or any route to British citizenship. Costs £50 per attempt. Exempt if under 18, over 65, or with certain long-term physical or mental conditions.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Applying for Indefinite Leave to Remain or British citizenship (by naturalisation, as spouse/civil partner of a British citizen, or as an Irish citizen).' },
        { factor: 'age', description: 'Applicants aged 18–64 must pass the test. Under 18 and over 65 are exempt.' },
      ],
      keyQuestions: [
        'Are you applying for ILR or British citizenship?',
        'Are you between 18 and 64?',
        'Have you passed the test before?',
      ],
      means_tested: false,
      evidenceRequired: ['Test pass certificate (issued at test centre)', 'Booking required online — £50 fee per attempt'],
      ruleIn: ['Applying for ILR or any citizenship route', 'Aged 18 to 64'],
      ruleOut: ['Under 18 or aged 65 and over (exempt)'],
      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 18,
          "label": "Must be at least 18 years old"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": "<=",
          "value": 64,
          "label": "Must be 64 or under (65+ are exempt)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/life-in-the-uk-test',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility and exemptions (under 18, over 65, certain disabilities)',
        'Guide user through the test booking process',
        'Explain the test format and recommend study materials',
        'Calculate estimated costs',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee: 50 },
      source: 'https://www.gov.uk/life-in-the-uk-test',
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
      ruleIn: ['5 years lawful residence on eligible visa', 'Not exceeded 180 days abroad in any 12-month period'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Resident in the UK"
        },
        {
          "type": "not",
          "label": "Not already a British citizen",
          "rules": [
            {
              "type": "enum",
              "field": "citizenship",
              "oneOf": [
                "british"
              ],
              "label": "British citizen"
            }
          ]
        },
        {
          "type": "dependency",
          "serviceId": "ho-life-in-uk",
          "condition": "completed",
          "label": "Must have passed the Life in the UK test"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/indefinite-leave-to-remain',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check qualifying period based on visa category',
        'Guide user through the ILR application form',
        'Prepare document checklist (passports, residence evidence, test certificates)',
        'Calculate estimated costs including application fee',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee: 2885 },
      source: 'https://www.gov.uk/indefinite-leave-to-remain',
    },
  },
  'ho-citizenship': {
    id: 'ho-citizenship', name: 'British citizenship (naturalisation)', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Standard route after 12 months of ILR or EU settled status. Must have 5 years UK residence, pass the Life in the UK test, and meet the English language and good character requirements. Form AN, £1,735.',
    govuk_url: 'https://www.gov.uk/apply-citizenship-indefinite-leave-to-remain',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Apply to become a British citizen after holding ILR or EU settled status for at least 12 months. Must have 5 years of UK residence with no more than 450 days abroad in that period and 90 days in the final year. Good character and English language required.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Must hold Indefinite Leave to Remain (ILR), EU settled status, or indefinite leave to enter for at least 12 months before applying.' },
        { factor: 'residency', description: 'Must have been physically present in the UK for 5 years before application, with no more than 450 days abroad total and no more than 90 days in the final 12 months.' },
        { factor: 'citizenship', description: 'Must be of good character (no serious criminal record) and demonstrate knowledge of English, Welsh or Scottish Gaelic.' },
      ],
      keyQuestions: [
        'Do you hold ILR, EU settled status, or indefinite leave to enter?',
        'Have you held that status for at least 12 months?',
        'Have you been in the UK for at least 5 years?',
        'Have you spent more than 90 days outside the UK in the last 12 months, or more than 450 days in the last 5 years?',
        'Have you had any criminal convictions or civil penalties?',
      ],
      means_tested: false,
      evidenceRequired: ['ILR/settled status document or eVisa evidence', 'Passport(s) covering the qualifying period', 'Life in the UK test certificate', 'English language evidence (if applicable)', 'Form AN', 'Application fee £1,735 (includes £130 citizenship ceremony fee)'],
      ruleIn: ['ILR or EU settled status for 12+ months', '5 years UK residence with limited absences'],
      ruleOut: ['More than 450 days abroad in qualifying 5-year period'],
      rules: [
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Resident in the UK"
        },
        {
          "type": "dependency",
          "serviceId": "ho-ilr",
          "condition": "completed",
          "label": "Must hold Indefinite Leave to Remain for at least 12 months"
        },
        {
          "type": "dependency",
          "serviceId": "ho-life-in-uk",
          "condition": "completed",
          "label": "Must have passed the Life in the UK test"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-citizenship-indefinite-leave-to-remain',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility (12+ months ILR, 5 years UK residence, absences within limits)',
        'Guide user through the AN1 naturalisation application',
        'Prepare document checklist (ILR, passports, Life in UK test, language certificate)',
        'Calculate estimated costs including application and ceremony fees',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee: 1735 },
      source: 'https://www.gov.uk/apply-citizenship-indefinite-leave-to-remain',
    },
    contactInfo: {
      phone: { number: '+44 300 790 6268', relay: '18001 then 0300 790 6268', label: 'Nationality enquiries' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '09:00',
          close: '14:30',
        },
      ],
    },
  },
  'ho-citizenship-spouse': {
    id: 'ho-citizenship-spouse', name: 'British citizenship (spouse / civil partner)', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Shortened 3-year route for spouses and civil partners of British citizens. Requires ILR or settled status, Life in the UK test, and good character. Form AN, £1,735.',
    govuk_url: 'https://www.gov.uk/apply-citizenship-spouse',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Spouses and civil partners of British citizens can apply after 3 years of UK residence (vs 5 for standard naturalisation). Must hold ILR or settled status, with no more than 270 days abroad during those 3 years and 90 days in the final year.',
      universal: false,
      criteria: [
        { factor: 'relationship_status', description: 'Must be married to, or in a civil partnership with, a British citizen at the time of application.' },
        { factor: 'immigration', description: 'Must hold Indefinite Leave to Remain (ILR), EU settled status, or indefinite leave to enter.' },
        { factor: 'residency', description: 'Must have been in the UK for at least 3 years, with no more than 270 days abroad in that period and 90 days in the final year.' },
        { factor: 'citizenship', description: 'Must be of good character and demonstrate knowledge of English, Welsh or Scottish Gaelic. Must have passed the Life in the UK test.' },
      ],
      keyQuestions: [
        'Is your spouse or civil partner a British citizen?',
        'Do you hold ILR, EU settled status, or indefinite leave to enter?',
        'Have you lived in the UK for at least 3 years?',
        'Have you spent more than 270 days outside the UK across those 3 years?',
        'Have you passed the Life in the UK test?',
      ],
      means_tested: false,
      evidenceRequired: ['Passport(s)', 'Proof of spouse\'s British citizenship', 'ILR/settled status document or eVisa evidence', 'Marriage or civil partnership certificate', 'Life in the UK test certificate', 'English language evidence (if applicable)', 'Form AN', 'Application fee £1,735 (includes £130 ceremony fee)'],
      ruleIn: ['Married to or in civil partnership with British citizen', 'ILR or settled status held'],
      ruleOut: ['More than 270 days abroad in qualifying 3-year period'],
    },
  },
  'ho-citizenship-ceremony': {
    id: 'ho-citizenship-ceremony', name: 'Citizenship ceremony', dept: 'Home Office', deptKey: 'ho',
    deadline: '3 months',
    desc: 'Required final step after citizenship is approved. Make an oath of allegiance, receive your certificate. Must attend within 3 months of the Home Office invitation. Fee included in the citizenship application.',
    govuk_url: 'https://www.gov.uk/citizenship-ceremonies',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'All adults (18+) approved for British citizenship must attend a citizenship ceremony, organised by their local authority, within 3 months of receiving the Home Office invitation. Citizenship is not conferred until the ceremony is completed. The £130 ceremony fee is included in the £1,735 application fee.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must have received an approved citizenship decision and ceremony invitation from the Home Office.' },
        { factor: 'age', description: 'Adults aged 18 and over must attend in person. Children under 18 can be included on a parent\'s ceremony.' },
      ],
      keyQuestions: [
        'Have you received your citizenship ceremony invitation from the Home Office?',
        'Have you contacted your local authority to book a ceremony date?',
        'Is the 3-month deadline at risk of being missed?',
      ],
      autoQualifiers: ['Citizenship application approved and invitation letter received'],
      means_tested: false,
      evidenceRequired: ['Home Office invitation letter', 'Photographic identification'],
      ruleIn: ['Citizenship application approved', 'Aged 18 or over'],
      ruleOut: [],
    },
  },
  'ho-drug-precursor-licence': {
    id: 'ho-drug-precursor-licence', name: 'Licence to possess or sell drug precursor chemicals', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Businesses or individuals needing to possess or supply chemicals that can be used to manufacture controlled drugs must obtain a licence from the Home Office. Non-compliance carries criminal penalties.',
    govuk_url: 'https://www.gov.uk/find-licences/licence-to-possess-or-sell-drug-precursors',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Mandatory for businesses or individuals who need to possess or supply classified drug precursor chemicals. Applicants are assessed on competence and integrity. A responsible officer must be designated. Licences can be revoked if conditions are breached.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Possessing or supplying chemicals classified as drug precursors (e.g. for pharmaceutical manufacturing, chemical supply, laboratory use).' },
      ],
      keyQuestions: [
        'Which specific chemicals do you need to possess or supply?',
        'What is the intended use?',
        'Have you designated a responsible officer?',
      ],
      means_tested: false,
      evidenceRequired: ['Details of chemicals and their intended use', 'Identity and competence credentials of the responsible officer', 'Integrity assessment by Home Office'],
      ruleIn: ['Pharmaceutical manufacturer requiring precursor chemicals', 'Industrial chemical supplier', 'Research laboratory requiring classified precursors'],
      ruleOut: ['Chemical is not a classified precursor', 'Quantity or use falls below the threshold requiring a licence'],
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
      ruleIn: ['Donor aged 18+ with current mental capacity'],
      ruleOut: ['Donor has already lost mental capacity'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 18,
          "label": "Donor must be 18 or over"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.lastingpowerofattorney.service.gov.uk/start',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain the two types of LPA (Property & Financial Affairs, Health & Welfare)',
        'Guide user through the OPG online LPA creation tool',
        'Advise on choosing attorneys and certificate provider requirements',
        'Calculate estimated costs (£82 per LPA, fee remission available)',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { fee_per_lpa: 82 },
      source: 'https://www.gov.uk/power-of-attorney',
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
      ruleIn: ['Registered LPA in place', 'Donor has died'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "LPA donor has died"
        },
        {
          "type": "boolean",
          "field": "custom_facts.lpa_registered",
          "expected": true,
          "label": "A registered Lasting Power of Attorney was in place"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain that attorneys must notify OPG when the LPA donor dies',
        'Advise on returning the original LPA document to OPG with LP4 form',
        'Explain that the LPA automatically ceases to have effect on death',
      ],
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
      ruleIn: ['Property purchase completed in England or Wales'],
      ruleOut: [],      rules: [
        {
          "type": "dependency",
          "serviceId": "hmrc-sdlt",
          "condition": "completed",
          "label": "SDLT filed and SDLT5 certificate obtained"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://landregistry.github.io/bg-dev-pack-redesign/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain the Land Registry registration process and that it is typically handled by a solicitor',
        'Check whether SDLT has been filed and the SDLT5 certificate obtained',
        'Advise on registration fees based on property value',
        'Explain the priority period and importance of prompt submission',
      ],
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
      ruleIn: ['Legal name change via marriage or deed poll'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/change-name-passport',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Guide user through the online passport renewal with name change',
        'Prepare document checklist (marriage certificate or deed poll, current passport)',
        'Explain online vs postal fee difference',
        'Advise on expected processing time',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { online_fee: 82.50 },
      source: 'https://www.gov.uk/renew-adult-passport',
    },
      contactInfo: {
      phone: { number: '+44 300 222 0000', relay: '18001 then 0300 222 0000', label: 'HM Passport Office' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '20:00',
        },
        {
          days: ['sat','sun'],
          open: '09:00',
          close: '17:30',
        },
      ],
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
      ruleIn: ['Aged 75 or over', 'Receiving Pension Credit'],
      ruleOut: ['Under 75', 'Not receiving Pension Credit'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 75,
          "label": "Must be aged 75 or over"
        },
        {
          "type": "dependency",
          "serviceId": "dwp-pension-credit",
          "condition": "receiving",
          "label": "Must be receiving Pension Credit"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/free-discount-tv-licence',
      authRequired: 'none',
      agentCanComplete: 'partial',
      missingBenefitId: 'tvLicence',
      agentSteps: [
        'Check eligibility (aged 75+ AND receiving Pension Credit)',
        'Guide user through the free TV licence application',
        'Calculate estimated annual saving',
        'Explain the link between Pension Credit and TV licence eligibility',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { saving: 174.50 },
      source: 'https://www.gov.uk/free-discount-tv-licence',
    },
      contactInfo: {
      phone: { number: '+44 300 790 6165', relay: '18001 then 0300 790 6165', label: 'TV Licensing' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:30',
          close: '18:30',
        },
      ],
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
      ruleIn: ['Enhanced Rate PIP mobility component', '12+ months remaining on PIP award'],
      ruleOut: [],      rules: [
        {
          "type": "enum",
          "field": "pip_mobility_rate",
          "oneOf": [
            "enhanced"
          ],
          "label": "Receiving Enhanced Rate PIP mobility component"
        },
        {
          "type": "boolean",
          "field": "custom_facts.pip_award_12_months_remaining",
          "expected": true,
          "label": "At least 12 months remaining on PIP mobility award"
        }
      ],

    },
    agentInteraction: {
      methods: ['phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check eligibility (Enhanced Rate PIP mobility with 12+ months remaining)',
        'Explain the Motability scheme and how the mobility allowance is used',
        'Provide the Motability contact number for applications',
        'Advise on the choice between car, powered wheelchair, or scooter',
      ],
    },
      contactInfo: {
      phone: {
        number: '+44 300 456 4566',
        textphone: '+44 300 037 0100',
        relay: '18001 then 0300 456 4566',
        label: 'Motability Operations',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '19:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '13:00',
        },
      ],
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
      ruleIn: ['Receiving PIP, DLA, or Attendance Allowance'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Receiving a qualifying disability benefit or has qualifying condition",
          "rules": [
            {
              "type": "boolean",
              "field": "receives_pip",
              "expected": true,
              "label": "Receiving PIP (any component, any rate)"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receives_dla",
              "expected": true,
              "label": "Receiving DLA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receives_attendance_allowance",
              "expected": true,
              "label": "Receiving Attendance Allowance"
            },
            {
              "type": "boolean",
              "field": "custom_facts.registered_blind",
              "expected": true,
              "label": "Registered blind or partially sighted"
            },
            {
              "type": "boolean",
              "field": "custom_facts.has_epilepsy",
              "expected": true,
              "label": "Has epilepsy"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.disabledpersons-railcard.co.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility based on disability benefits or qualifying conditions',
        'Guide user through the online railcard application',
        'Calculate estimated savings (1/3 off most fares for holder and companion)',
        'Explain the £20 annual cost and renewal process',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { card_cost: 20, saving_percent: 33 },
      source: 'https://www.disabledpersons-railcard.co.uk/',
    },
      contactInfo: {
      phone: { number: '+44 345 605 0525', label: 'Disabled Persons Railcard' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '09:00',
          close: '17:00',
        },
      ],
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
      ruleIn: ['Employing one or more staff'],
      ruleOut: ['Sole director business employing no other staff'],      rules: [
        {
          "type": "boolean",
          "field": "custom_facts.is_employer",
          "expected": true,
          "label": "Employing one or more staff"
        },
        {
          "type": "dependency",
          "serviceId": "hmrc-paye",
          "condition": "completed",
          "label": "Registered as employer with HMRC PAYE"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the legal requirement for employers\' liability insurance',
        'Advise on the minimum £5 million cover requirement',
        'Explain that the certificate must be displayed at each workplace',
        'Check whether any exemptions apply (sole director, family businesses)',
      ],
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
      ruleIn: ['Role involves working with children or vulnerable adults'],
      ruleOut: [],      rules: [
        {
          "type": "any",
          "label": "Employed or about to start employment requiring DBS check",
          "rules": [
            {
              "type": "enum",
              "field": "employment_status",
              "oneOf": [
                "employed",
                "self-employed"
              ],
              "label": "Employed or self-employed"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/request-copy-criminal-record',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain the three levels of DBS check (Basic, Standard, Enhanced)',
        'Guide user through the application process',
        'Prepare identity document checklist',
        'Calculate estimated costs based on check level',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { basic_check: 18, standard_check: 18, enhanced_check: 38 },
      source: 'https://www.gov.uk/dbs-check-applicant-criminal-record',
    },
      contactInfo: {
      phone: { number: '+44 300 006 2849', label: 'DBS helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
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
      ruleIn: [],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/prove-right-to-work',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain the right to work check process for employers and employees',
        'Guide user through generating a share code if applicable',
        'Prepare document checklist based on nationality',
        'Explain the employer\'s legal obligation and penalties for non-compliance',
      ],
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
      ruleIn: ['Child eligible for Free School Meals in last 6 years', 'Looked-after child or care leaver'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Has school-age children"
        },
        {
          "type": "any",
          "label": "Child eligible for Free School Meals or is looked-after/care leaver",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "la-free-school-meals",
              "condition": "receiving",
              "label": "Child is registered for Free School Meals"
            },
            {
              "type": "boolean",
              "field": "custom_facts.child_looked_after_or_care_leaver",
              "expected": true,
              "label": "Child is a looked-after child or care leaver"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain that Pupil Premium is funding paid directly to the school',
        'Advise that parents should ensure Free School Meals eligibility is registered',
        'Calculate estimated funding per pupil (primary vs secondary rates)',
        'Explain the link between Free School Meals registration and Pupil Premium',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { per_primary_pupil: 1480, per_secondary_pupil: 1050 },
      source: 'https://www.gov.uk/government/publications/pupil-premium',
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
      ruleIn: ['Compulsory redundancy after 2+ years continuous employment'],
      ruleOut: ['Self-employed', 'Dismissed for gross misconduct'],      rules: [
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "employed"
          ],
          "label": "Must be (or have been) an employee"
        },
        {
          "type": "boolean",
          "field": "custom_facts.made_redundant",
          "expected": true,
          "label": "Made compulsorily redundant by employer"
        },
        {
          "type": "boolean",
          "field": "custom_facts.employed_2_years_continuous",
          "expected": true,
          "label": "Continuously employed for at least 2 years with the same employer"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/claim-redundancy',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility (2+ years continuous employment, compulsory redundancy)',
        'Calculate estimated redundancy pay using GOV.UK calculator',
        'Guide user through claiming from employer or Employment Tribunal if refused',
        'Explain the process and timeline for redundancy claims',
      ],
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
      ruleIn: ['Employee (not self-employed)', 'Dependant with long-term care need'],
      ruleOut: [],      rules: [
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "employed"
          ],
          "label": "Must be an employee (not self-employed or casual worker)"
        },
        {
          "type": "boolean",
          "field": "is_carer",
          "expected": true,
          "label": "Providing or arranging care for a dependant"
        },
        {
          "type": "boolean",
          "field": "custom_facts.dependant_has_long_term_care_need",
          "expected": true,
          "label": "Dependant has a long-term illness, disability, or care need"
        }
      ],

    },
    agentInteraction: {
      methods: ['phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the statutory right to 5 days unpaid carer\'s leave per year',
        'Advise that this applies from day 1 of employment',
        'Explain how to request carer\'s leave from the employer',
        'Advise on the difference between carer\'s leave and other leave types',
      ],
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
      ruleIn: ['First-time buyer', 'Household income within scheme cap'],
      ruleOut: ['Existing or previous homeowner'],      rules: [
        {
          "type": "boolean",
          "field": "is_first_time_buyer",
          "expected": true,
          "label": "Must be a first-time buyer"
        },
        {
          "type": "not",
          "label": "Must not currently be a homeowner",
          "rules": [
            {
              "type": "boolean",
              "field": "is_homeowner",
              "expected": true,
              "label": "Is a homeowner"
            }
          ]
        },
        {
          "type": "comparison",
          "field": "annual_income",
          "operator": "<=",
          "value": 80000,
          "label": "Household income must be within scheme cap (£80,000, or £90,000 in London)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/affordable-home-ownership-schemes/help-to-buy-equity-loan',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility (first-time buyer, income caps, property price limits)',
        'Explain the available schemes (First Homes, Shared Ownership, Mortgage Guarantee)',
        'Guide user through the application process for the relevant scheme',
        'Calculate estimated costs and savings based on scheme chosen',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 100 0030', label: 'Help to Buy agent' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '09:00',
          close: '17:30',
        },
      ],
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
      ruleIn: ['Employing workers aged 22 to State Pension age earning £10k+/year'],
      ruleOut: [],      rules: [
        {
          "type": "boolean",
          "field": "custom_facts.is_employer",
          "expected": true,
          "label": "Employing workers"
        },
        {
          "type": "dependency",
          "serviceId": "hmrc-paye",
          "condition": "completed",
          "label": "Registered as employer with HMRC PAYE"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain the auto-enrolment obligation for employers',
        'Advise on choosing a qualifying pension provider (e.g. NEST)',
        'Explain the duties start date and declaration of compliance requirements',
        'Calculate minimum employer and employee contribution rates',
      ],
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
      ruleIn: ['Starting UK undergraduate course', 'UK resident 3+ years'],
      ruleOut: ['Already holds equivalent undergraduate degree'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 18,
          "label": "Must be at least 18 years old"
        },
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Normally resident in England for 3+ years"
        },
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "england"
          ],
          "label": "Resident in England (other nations have separate schemes)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/student-finance/how-to-apply',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility based on residency and course requirements',
        'Guide user through the Student Finance England online application',
        'Explain the difference between Tuition Fee Loan and Maintenance Loan',
        'Advise on household income evidence needed for Maintenance Loan assessment',
      ],
    },
  },

  // DWP — Housing Benefit ───────────────────────────────────────────────────
  'dwp-housing-benefit': {
    id: 'dwp-housing-benefit', name: 'Housing Benefit', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'For pension-age renters not on Universal Credit. Claimed via local council. Means-tested, backdatable up to 3 months.',
    govuk_url: 'https://www.gov.uk/housing-benefit',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Housing Benefit helps pension-age tenants on low income pay rent. Working-age claimants should apply for Universal Credit instead. Claimed through local council, not DWP directly. Backdatable up to 3 months.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must have reached State Pension age (or partner has). Working-age claimants must claim Universal Credit instead.' },
        { factor: 'income', description: 'Means-tested — assessed on income, savings and capital. Savings over £16,000 generally disqualify (unless receiving Pension Credit Guarantee).' },
        { factor: 'property', description: 'Must be a tenant paying rent. Not available to homeowners (see Support for Mortgage Interest).' },
        { factor: 'asset', description: 'Capital over £16,000 normally disqualifies, unless on Pension Credit Guarantee Credit.' },
      ],
      keyQuestions: [
        'Have you reached State Pension age?',
        'Are you renting (not a homeowner)?',
        'Do you receive Pension Credit?',
        'Do you have savings or capital over £16,000?',
        'Are you already claiming Universal Credit?',
      ],
      exclusions: ['Already receiving Universal Credit housing element', 'Owner-occupier', 'Savings over £16,000 (unless on Pension Credit Guarantee)'],
      means_tested: true,
      evidenceRequired: ['Proof of rent (tenancy agreement)', 'Proof of income and savings', 'National Insurance number', 'Bank statements'],
      ruleIn: ['State Pension age', 'Renting', 'Low income/savings'],
      ruleOut: ['Working age (claim UC instead)', 'Homeowner', 'Savings over £16,000'],      rules: [
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 66,
          "label": "Must have reached State Pension age (66)"
        },
        {
          "type": "not",
          "label": "Must not be a homeowner (Housing Benefit is for renters)",
          "rules": [
            {
              "type": "boolean",
              "field": "is_homeowner",
              "expected": true,
              "label": "Is a homeowner"
            }
          ]
        },
        {
          "type": "comparison",
          "field": "savings",
          "operator": "<",
          "value": 16000,
          "label": "Savings must be under £16,000 (unless on Pension Credit Guarantee)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/housing-benefit/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check whether user is pension age or working age (working age = UC instead)',
        'Help user find their local council Housing Benefit office',
        'Explain the means test (income, savings, capital thresholds)',
        'Advise on backdating rules (up to 3 months)',
        'List required evidence (tenancy agreement, income proof, bank statements)',
      ],
      missingBenefitId: 'housingBenefit',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { varies_by_local_authority: 0 },
      source: 'https://www.gov.uk/housing-benefit/what-youll-get',
    },
      contactInfo: { localAuthority: true, officeLocatorUrl: 'https://www.gov.uk/find-local-council', notes: 'Administered by local councils. Contact your local authority Housing Benefit department.' },
  },

  // DESNZ — Warm Home Discount ─────────────────────────────────────────────
  'other-warm-home-discount': {
    id: 'other-warm-home-discount', name: 'Warm Home Discount', dept: 'DESNZ', deptKey: 'other',
    deadline: null,
    desc: '£150/year off electricity bill. Automatic for Pension Credit Guarantee recipients; broader group can apply.',
    govuk_url: 'https://www.gov.uk/the-warm-home-discount-scheme',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: '£150 one-off discount on electricity bill. Core Group (Pension Credit Guarantee recipients) get it automatically. Broader Group must be on qualifying low-income benefits and meet energy cost criteria. Not available in Northern Ireland.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Core Group: receiving Pension Credit Guarantee Credit — automatic. Broader Group: on qualifying benefit (UC, ESA, JSA, etc.) and high energy costs relative to income.' },
        { factor: 'geography', description: 'Available in England, Scotland and Wales only. Not available in Northern Ireland.' },
      ],
      keyQuestions: [
        'Do you receive Pension Credit Guarantee Credit?',
        'Are you on a qualifying benefit (UC, ESA, JSA)?',
        'Do you live in England, Scotland or Wales?',
      ],
      autoQualifiers: ['Receiving Pension Credit Guarantee Credit — discount applied automatically'],
      means_tested: false,
      evidenceRequired: ['Electricity account number', 'Benefit confirmation letter (for Broader Group)'],
      ruleIn: ['On Pension Credit Guarantee', 'On qualifying benefit with high energy costs'],
      ruleOut: ['Lives in Northern Ireland', 'Not on qualifying benefit'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "england",
            "scotland",
            "wales"
          ],
          "label": "Must live in England, Scotland or Wales (not Northern Ireland)"
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit (Core Group — automatic)"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit (Broader Group)"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-esa",
              "condition": "receiving",
              "label": "Receiving ESA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-jsa",
              "condition": "receiving",
              "label": "Receiving JSA"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/the-warm-home-discount-scheme/how-to-apply',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check if user is in Core Group (Pension Credit Guarantee — automatic)',
        'If Broader Group, explain qualifying criteria and application window',
        'Confirm user lives in England, Scotland or Wales',
        'Advise that discount is applied directly to electricity bill',
      ],
      missingBenefitId: 'warmHomeDiscount',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { discount: 150 },
      source: 'https://www.gov.uk/the-warm-home-discount-scheme',
    },
    nations: ['england', 'scotland', 'wales'],
      contactInfo: {
      phone: { number: '+44 800 030 9322', label: 'Warm Home Discount helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'Scheme opens each autumn. Some suppliers have their own application process.',
    },
  },

  // NHS BSA — NHS Low Income Scheme ────────────────────────────────────────
  'nhs-low-income-scheme': {
    id: 'nhs-low-income-scheme', name: 'NHS Low Income Scheme (HC2/HC3)', dept: 'NHS BSA', deptKey: 'nhs',
    deadline: null,
    desc: 'HC2 certificate gives full help; HC3 gives partial help with NHS prescriptions, dental, sight tests and travel costs.',
    govuk_url: 'https://www.gov.uk/nhs-low-income-scheme',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'For people on low income who don\'t automatically qualify for free NHS services. HC2 certificate = full help (free prescriptions, dental, sight tests, travel). HC3 = partial help. Means-tested on income and capital.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Must be on a low income. Capital over £16,000 (£24,000 if in care home) disqualifies.' },
        { factor: 'asset', description: 'Savings under £16,000 (£24,000 if permanently in a care home).' },
        { factor: 'residency', description: 'Must be ordinarily resident in the UK.' },
      ],
      keyQuestions: [
        'Are you on a low income?',
        'Do you have savings or capital over £16,000?',
        'Do you already get free prescriptions through another route (e.g. over-60, pregnancy, specific conditions)?',
        'Are you receiving any means-tested benefits?',
      ],
      exclusions: ['Capital over £16,000', 'Already entitled to free NHS services through another exemption'],
      means_tested: true,
      evidenceRequired: ['Proof of income', 'Bank statements showing savings', 'National Insurance number', 'Details of housing costs'],
      ruleIn: ['Low income', 'Not entitled via another exemption', 'Savings under £16,000'],
      ruleOut: ['Capital over £16,000', 'Already has automatic NHS exemption'],      rules: [
        {
          "type": "boolean",
          "field": "is_uk_resident",
          "expected": true,
          "label": "Must be ordinarily resident in the UK"
        },
        {
          "type": "comparison",
          "field": "savings",
          "operator": "<",
          "value": 16000,
          "label": "Savings must be below £16,000"
        },
        {
          "type": "not",
          "label": "Not already entitled to free NHS services through another exemption",
          "rules": [
            {
              "type": "any",
              "label": "Already has automatic NHS exemption",
              "rules": [
                {
                  "type": "comparison",
                  "field": "age",
                  "operator": ">=",
                  "value": 60,
                  "label": "Aged 60 or over (auto-exempt)"
                },
                {
                  "type": "boolean",
                  "field": "is_pregnant",
                  "expected": true,
                  "label": "Pregnant (auto-exempt via MatEx)"
                }
              ]
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/nhs-low-income-scheme/how-to-apply',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check whether user already qualifies for free NHS services via another route',
        'Explain the difference between HC2 (full help) and HC3 (partial help)',
        'Guide user through the HC1 application form',
        'Advise on evidence required (income, savings, housing costs)',
        'Explain that certificate is valid for 6 months and renewable',
      ],
      missingBenefitId: 'nhsLowIncomeScheme',
    },
      contactInfo: {
      phone: { number: '+44 300 330 1343', label: 'NHS Business Services Authority' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '15:00',
        },
      ],
    },
  },

  // SSS — Social Security Scotland ─────────────────────────────────────────
  'sss-scottish-child-payment': {
    id: 'sss-scottish-child-payment', name: 'Scottish Child Payment', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: '£27.15/week per eligible child under 16 for parents on qualifying benefits in Scotland.',
    govuk_url: 'https://www.mygov.scot/scottish-child-payment',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: '£27.15/week per child under 16 for parents or carers in Scotland who receive a qualifying benefit (UC, legacy benefits, Pension Credit). One of Scotland\'s flagship anti-poverty measures.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Must be responsible for a child under 16.' },
        { factor: 'income', description: 'Must be receiving a qualifying benefit: Universal Credit, income-related JSA, income-related ESA, Income Support, Pension Credit, or Child/Working Tax Credit.' },
        { factor: 'geography', description: 'Must live in Scotland.' },
      ],
      keyQuestions: [
        'Do you live in Scotland?',
        'Are you responsible for a child under 16?',
        'Do you receive Universal Credit, Tax Credits, or another qualifying benefit?',
      ],
      autoQualifiers: ['On qualifying benefit with child under 16 in Scotland'],
      means_tested: true,
      evidenceRequired: ['Proof of qualifying benefit', 'Child\'s details', 'Proof of Scottish residency'],
      ruleIn: ['Child under 16', 'On qualifying benefit', 'Lives in Scotland'],
      ruleOut: ['Does not live in Scotland', 'No qualifying benefit', 'No children under 16'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Must be responsible for a child"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "<",
          "value": 16,
          "label": "Child must be under 16"
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.mygov.scot/scottish-child-payment',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user lives in Scotland and has a child under 16',
        'Check whether user receives a qualifying benefit',
        'Guide user through the mygov.scot online application',
        'Explain the payment is £27.15 per week per eligible child',
        'Advise that payment can be backdated',
      ],
      missingBenefitId: 'scottishChildPayment',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { per_child: 27.15 },
      source: 'https://www.mygov.scot/scottish-child-payment',
    },
    nations: ['scotland'],
  },
  'sss-carer-support-payment': {
    id: 'sss-carer-support-payment', name: 'Carer Support Payment', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: '£83.30/week for carers aged 16+ providing 35+ hours/week care in Scotland. Replaces Carer\'s Allowance.',
    govuk_url: 'https://www.mygov.scot/carer-support-payment',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: '£83.30/week for carers aged 16 or over providing at least 35 hours/week care to someone receiving a qualifying disability benefit. Replaces Carer\'s Allowance in Scotland. Earnings limit applies.',
      universal: false,
      criteria: [
        { factor: 'caring', description: 'Must provide at least 35 hours of care per week to someone receiving a qualifying disability benefit (ADP, PIP daily living, DLA middle/higher care, AA).' },
        { factor: 'age', description: 'Must be aged 16 or over.' },
        { factor: 'income', description: 'Earnings must not exceed £151/week net (after deductions).' },
        { factor: 'geography', description: 'Must live in Scotland.' },
      ],
      keyQuestions: [
        'Do you live in Scotland?',
        'Do you provide at least 35 hours of care per week?',
        'Does the person you care for receive a qualifying disability benefit?',
        'Do you earn more than £151/week net?',
        'Are you in full-time education (21+ hours)?',
      ],
      exclusions: ['Net earnings over £151/week', 'Full-time education (21+ hours/week)'],
      means_tested: false,
      evidenceRequired: ['Details of person cared for', 'Proof of care hours', 'Earnings details'],
      ruleIn: ['Provides 35+ hours care/week', 'Cared-for person on qualifying disability benefit', 'Lives in Scotland'],
      ruleOut: ['Net earnings over £151/week', 'Full-time education', 'Does not live in Scotland'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 16,
          "label": "Must be aged 16 or over"
        },
        {
          "type": "boolean",
          "field": "is_carer",
          "expected": true,
          "label": "Must be caring for someone"
        },
        {
          "type": "comparison",
          "field": "caring_hours_per_week",
          "operator": ">=",
          "value": 35,
          "label": "Must provide at least 35 hours of care per week"
        },
        {
          "type": "boolean",
          "field": "cared_for_receives_qualifying_benefit",
          "expected": true,
          "label": "Person cared for must receive ADP, PIP daily living, DLA middle/higher care, or Attendance Allowance"
        },
        {
          "type": "comparison",
          "field": "weekly_earnings",
          "operator": "<=",
          "value": 151,
          "label": "Net earnings must be £151/week or less"
        },
        {
          "type": "not",
          "label": "Must not be in full-time education (21+ hours/week)",
          "rules": [
            {
              "type": "boolean",
              "field": "is_in_full_time_education",
              "expected": true,
              "label": "In full-time education"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.mygov.scot/carer-support-payment',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user lives in Scotland and provides 35+ hours care/week',
        'Verify the cared-for person receives a qualifying disability benefit',
        'Check earnings are within the limit',
        'Guide user through the mygov.scot application',
        'Explain the interaction with other benefits (may affect means-tested benefits)',
      ],
      missingBenefitId: 'carerSupportPayment',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { weekly_rate: 83.30 },
      source: 'https://www.mygov.scot/carer-support-payment',
    },
    nations: ['scotland'],
  },
  'sss-carers-allowance-supplement': {
    id: 'sss-carers-allowance-supplement', name: 'Carer\'s Allowance Supplement', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: 'Two lump sums per year (~£293.50 each) for Carer\'s Allowance or Carer Support Payment recipients in Scotland. Automatic — no application.',
    govuk_url: 'https://www.mygov.scot/carers-allowance-supplement',
    serviceType: 'benefit',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Automatic payment of ~£293.50 twice a year (June and December) for people in Scotland who receive Carer\'s Allowance or Carer Support Payment on qualifying dates. No application needed.',
      universal: false,
      criteria: [
        { factor: 'caring', description: 'Must be receiving Carer\'s Allowance or Carer Support Payment on the qualifying date.' },
        { factor: 'geography', description: 'Must live in Scotland.' },
        { factor: 'dependency', description: 'Requires receipt of Carer\'s Allowance or Carer Support Payment — automatic top-up.' },
      ],
      keyQuestions: [
        'Do you live in Scotland?',
        'Do you currently receive Carer\'s Allowance or Carer Support Payment?',
      ],
      autoQualifiers: ['Receiving CA or CSP in Scotland on qualifying date — paid automatically'],
      means_tested: false,
      ruleIn: ['Receiving CA or CSP', 'Lives in Scotland'],
      ruleOut: ['Does not live in Scotland', 'Not receiving CA or CSP'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "any",
          "label": "Must be receiving Carer's Allowance or Carer Support Payment",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-carers-allowance",
              "condition": "receiving",
              "label": "Receiving Carer's Allowance"
            },
            {
              "type": "dependency",
              "serviceId": "sss-carer-support-payment",
              "condition": "receiving",
              "label": "Receiving Carer Support Payment"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Confirm user lives in Scotland and receives CA or CSP',
        'Explain that payment is automatic — no application needed',
        'Advise on qualifying dates (paid in June and December)',
        'Explain the payment amount (~£293.50 per payment)',
      ],
      missingBenefitId: 'carersAllowanceSupplement',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { six_monthly_payment: 293.50 },
      source: 'https://www.mygov.scot/carers-allowance-supplement',
    },
    nations: ['scotland'],
  },
  'sss-child-winter-heating': {
    id: 'sss-child-winter-heating', name: 'Child Winter Heating Assistance', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: '£255.80/year for children in Scotland receiving highest-rate disability benefits. Automatic — no application needed.',
    govuk_url: 'https://www.mygov.scot/child-winter-heating-assistance',
    serviceType: 'benefit',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Annual payment of £255.80 for children in Scotland who receive the highest rate of the care component of Child Disability Payment (or DLA). Paid automatically — no application required.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Child must receive the highest rate of the care component of Child Disability Payment (or DLA child).' },
        { factor: 'age', description: 'Child must be under 16 (or under 19 if still in qualifying education).' },
        { factor: 'geography', description: 'Must live in Scotland.' },
      ],
      keyQuestions: [
        'Does the child live in Scotland?',
        'Does the child receive the highest rate care component of Child Disability Payment or DLA?',
      ],
      autoQualifiers: ['Child on highest-rate CDP/DLA care in Scotland — paid automatically'],
      means_tested: false,
      ruleIn: ['Child on highest-rate care component', 'Lives in Scotland'],
      ruleOut: ['Child not on highest-rate care', 'Does not live in Scotland'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Must have a child"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "<",
          "value": 16,
          "label": "Child must be under 16 (or under 19 in qualifying education)"
        },
        {
          "type": "any",
          "label": "Child must receive highest-rate care component of Child Disability Payment or DLA",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "sss-child-disability-payment",
              "condition": "receiving",
              "label": "Receiving Child Disability Payment (highest care)"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-dla-child",
              "condition": "receiving",
              "label": "Receiving DLA Child (highest care rate)"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Confirm child lives in Scotland and receives highest-rate care component',
        'Explain that payment is automatic — no application needed',
        'Advise on payment timing (annual, during winter)',
        'Explain the payment amount (£255.80)',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { annual_payment: 255.80 },
      source: 'https://www.mygov.scot/child-winter-heating-assistance',
    },
    nations: ['scotland'],
  },
  'sss-pension-winter-heating': {
    id: 'sss-pension-winter-heating', name: 'Pension Age Winter Heating Payment', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: 'Replaced Winter Fuel Payment in Scotland. £101 single / £50 with other qualifying person. Pension Credit top-up £152.',
    govuk_url: 'https://www.mygov.scot/pension-age-winter-heating-payment',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Replaces Winter Fuel Payment in Scotland. For people who have reached State Pension age and live in Scotland. £101 if living alone, £50 if living with another qualifying person, plus £152 top-up if on Pension Credit.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must have reached State Pension age.' },
        { factor: 'geography', description: 'Must live in Scotland.' },
        { factor: 'income', description: 'Pension Credit recipients get an additional £152 top-up.' },
      ],
      keyQuestions: [
        'Do you live in Scotland?',
        'Have you reached State Pension age?',
        'Do you receive Pension Credit?',
        'Do you live alone or with another qualifying person?',
      ],
      means_tested: false,
      evidenceRequired: ['Proof of age', 'Proof of Scottish residency'],
      ruleIn: ['State Pension age', 'Lives in Scotland'],
      ruleOut: ['Under State Pension age', 'Does not live in Scotland'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 66,
          "label": "Must have reached State Pension age (66)"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.mygov.scot/pension-age-winter-heating-payment',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user is pension age and lives in Scotland',
        'Calculate expected payment (£101 single, £50 with other qualifying, £152 PC top-up)',
        'Explain the application process via Social Security Scotland',
        'Advise on Pension Credit interaction for additional top-up',
      ],
      missingBenefitId: 'pensionAgeWinterHeatingPayment',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { single: 101, with_other_qualifying: 50, pension_credit_top_up: 152 },
      source: 'https://www.mygov.scot/pension-age-winter-heating-payment',
    },
    nations: ['scotland'],
  },
  'sss-funeral-support-payment': {
    id: 'sss-funeral-support-payment', name: 'Funeral Support Payment', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: 'Up to £1,500 for burial/cremation costs plus £120 for other expenses. For qualifying benefit recipients in Scotland.',
    govuk_url: 'https://www.mygov.scot/funeral-support-payment',
    serviceType: 'grant',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Help with funeral costs in Scotland for people on qualifying benefits. Covers up to £1,500 for burial or cremation costs, plus £120 for other expenses (flowers, transport). Must be responsible for the funeral and on a qualifying benefit.',
      universal: false,
      criteria: [
        { factor: 'bereavement', description: 'Must be responsible for arranging or paying for a funeral.' },
        { factor: 'income', description: 'Must be receiving a qualifying benefit (UC, Pension Credit, income-related ESA/JSA, Income Support, HB, Tax Credits).' },
        { factor: 'geography', description: 'The funeral must take place in the UK, and applicant must live in Scotland.' },
      ],
      keyQuestions: [
        'Do you live in Scotland?',
        'Are you responsible for paying for the funeral?',
        'Do you receive a qualifying benefit?',
        'When did the death occur? (Must apply within 6 months.)',
      ],
      exclusions: ['Not on a qualifying benefit', 'Another close relative could reasonably pay'],
      means_tested: true,
      evidenceRequired: ['Death certificate', 'Funeral director\'s invoice', 'Proof of qualifying benefit'],
      ruleIn: ['Responsible for funeral costs', 'On qualifying benefit', 'Lives in Scotland'],
      ruleOut: ['Not on qualifying benefit', 'Another close relative could pay', 'Does not live in Scotland'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "boolean",
          "field": "has_experienced_bereavement",
          "expected": true,
          "label": "Must be responsible for arranging or paying for a funeral"
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-housing-benefit",
              "condition": "receiving",
              "label": "Receiving Housing Benefit"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.mygov.scot/funeral-support-payment',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user lives in Scotland and is responsible for funeral costs',
        'Verify user receives a qualifying benefit',
        'Guide user through the mygov.scot application',
        'Explain the 6-month application deadline',
        'Advise on maximum amounts (£1,500 burial/cremation + £120 other)',
      ],
      missingBenefitId: 'funeralSupportPayment',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { max_burial_cremation: 1500, other_costs: 120 },
      source: 'https://www.mygov.scot/funeral-support-payment',
    },
    nations: ['scotland'],
  },

  // Welsh Government ───────────────────────────────────────────────────────
  'wg-winter-fuel-support': {
    id: 'wg-winter-fuel-support', name: 'Winter Fuel Support Scheme (Wales)', dept: 'Welsh Government', deptKey: 'wg',
    deadline: null,
    desc: '£200 one-off payment for qualifying benefit recipients in Wales to help with energy costs.',
    govuk_url: 'https://www.gov.wales/winter-fuel-support-scheme',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: '£200 one-off payment to help with energy costs in Wales. Must be receiving a qualifying benefit (Pension Credit, UC, income-related ESA/JSA, Income Support). Application window opens annually.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Must be receiving a qualifying benefit: Pension Credit, UC, income-related JSA, income-related ESA, or Income Support.' },
        { factor: 'geography', description: 'Must live in Wales.' },
      ],
      keyQuestions: [
        'Do you live in Wales?',
        'Do you receive a qualifying benefit (Pension Credit, UC, ESA, JSA, Income Support)?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of qualifying benefit', 'Proof of Welsh residency'],
      ruleIn: ['On qualifying benefit', 'Lives in Wales'],
      ruleOut: ['Does not live in Wales', 'Not on qualifying benefit'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "wales"
          ],
          "label": "Must live in Wales"
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-esa",
              "condition": "receiving",
              "label": "Receiving ESA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-jsa",
              "condition": "receiving",
              "label": "Receiving JSA"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.wales/winter-fuel-support-scheme',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user lives in Wales and receives a qualifying benefit',
        'Guide user through the Welsh Government application',
        'Advise on the annual application window',
        'Explain the payment amount (£200)',
      ],
      missingBenefitId: 'winterFuelSupportScheme',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { payment: 200 },
      source: 'https://www.gov.wales/winter-fuel-support-scheme',
    },
    nations: ['wales'],
  },

  // Northern Ireland ───────────────────────────────────────────────────────
  'ni-rate-rebate': {
    id: 'ni-rate-rebate', name: 'Rate Rebate', dept: 'Land & Property Services NI', deptKey: 'ni-lps',
    deadline: null,
    desc: 'Northern Ireland equivalent of Council Tax Reduction. Help with domestic rates for low-income households.',
    govuk_url: 'https://www.nidirect.gov.uk/articles/rate-relief',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Help with domestic rates in Northern Ireland for people on low income. Similar to Council Tax Reduction in England/Wales. Assessed on income and household circumstances.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Means-tested on household income. Amount depends on income, rates liability and household composition.' },
        { factor: 'property', description: 'Must be liable for domestic rates in Northern Ireland.' },
        { factor: 'geography', description: 'Must live in Northern Ireland.' },
      ],
      keyQuestions: [
        'Do you live in Northern Ireland?',
        'Are you liable for domestic rates?',
        'What is your household income?',
        'Do you receive any means-tested benefits?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of income', 'Rate bill', 'Benefit confirmation letters'],
      ruleIn: ['Liable for NI domestic rates', 'Low income', 'Lives in Northern Ireland'],
      ruleOut: ['Does not live in Northern Ireland', 'Not liable for rates'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "northern-ireland"
          ],
          "label": "Must live in Northern Ireland"
        },
        {
          "type": "any",
          "label": "Must be on low income or receiving a means-tested benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "comparison",
              "field": "weekly_income",
              "operator": "<",
              "value": 250,
              "label": "Low weekly income"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.nidirect.gov.uk/articles/rate-relief',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user lives in Northern Ireland and is liable for domestic rates',
        'Explain the means test and what income is assessed',
        'Guide user to the Land & Property Services application',
        'Advise on required evidence (income proof, rate bill)',
      ],
      missingBenefitId: 'rateRebate',
    },
    nations: ['northern-ireland'],
      contactInfo: {
      phone: { number: '+44 300 200 7801', label: 'LPS Rating helpline' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '09:00',
          close: '17:00',
        },
      ],
    },
  },
  'ni-discretionary-support': {
    id: 'ni-discretionary-support', name: 'Discretionary Support', dept: 'Department for Communities NI', deptKey: 'ni-dfc',
    deadline: null,
    desc: 'Emergency grants or loans for people in financial crisis in Northern Ireland. Non-repayable grants up to £150; living expenses loans up to £500.',
    govuk_url: 'https://www.nidirect.gov.uk/articles/discretionary-support',
    serviceType: 'grant',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Emergency financial help for people in crisis in Northern Ireland. Non-repayable grants (up to £150) for immediate needs; interest-free loans (up to £500) for living expenses. Must be on a qualifying benefit or awaiting a benefit decision.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Must be in financial crisis. Typically receiving or awaiting UC, ESA, JSA, Income Support or Pension Credit.' },
        { factor: 'geography', description: 'Must live in Northern Ireland.' },
      ],
      keyQuestions: [
        'Do you live in Northern Ireland?',
        'Are you in financial crisis or facing an emergency?',
        'Do you receive a qualifying benefit, or are you awaiting a benefit decision?',
        'What is the emergency need (food, heating, essential items)?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of benefit receipt or pending application', 'Details of the emergency need'],
      ruleIn: ['Financial crisis', 'On qualifying benefit or awaiting decision', 'Lives in Northern Ireland'],
      ruleOut: ['Does not live in Northern Ireland', 'Not in financial hardship'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "northern-ireland"
          ],
          "label": "Must live in Northern Ireland"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 16,
          "label": "Must be aged 16 or over"
        },
        {
          "type": "any",
          "label": "Must be in financial crisis or receiving/awaiting a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-esa",
              "condition": "receiving",
              "label": "Receiving ESA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-jsa",
              "condition": "receiving",
              "label": "Receiving JSA"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.nidirect.gov.uk/articles/discretionary-support',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user lives in Northern Ireland and is in financial crisis',
        'Determine whether grant or loan is more appropriate',
        'Guide user through the application process',
        'Explain grant limits (£150) and loan limits (£500)',
        'Advise on urgent processing for immediate needs',
      ],
      missingBenefitId: 'discretionarySupport',
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { emergency_max: 150, living_expenses_max: 500 },
      source: 'https://www.nidirect.gov.uk/articles/discretionary-support',
    },
    nations: ['northern-ireland'],
      contactInfo: {
      phone: { number: '+44 28 9069 9966', label: 'Discretionary Support Team' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '09:00',
          close: '17:00',
        },
      ],
    },
  },

  // DWP — DLA Child ────────────────────────────────────────────────────────
  'dwp-dla-child': {
    id: 'dwp-dla-child', name: 'Disability Living Allowance (Child)', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'For children under 16 with disabilities or health conditions. Care and mobility components at various rates. Replaced by CDP in Scotland.',
    govuk_url: 'https://www.gov.uk/disability-living-allowance-children',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'For children under 16 with a disability or health condition that means they need extra looking after or have difficulty walking. Not means-tested. Replaced by Child Disability Payment in Scotland.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Child must be under 16.' },
        { factor: 'disability', description: 'Child must have a physical or mental disability that requires substantially more care or supervision than a child of the same age without a disability, or has difficulty walking.' },
        { factor: 'residency', description: 'Must be in England, Wales or Northern Ireland (Scotland uses Child Disability Payment).' },
      ],
      keyQuestions: [
        'Is the child under 16?',
        'Does the child have a disability or long-term health condition?',
        'Does the child need more care or supervision than other children the same age?',
        'Does the child have difficulty walking?',
        'Do you live in England, Wales or Northern Ireland?',
      ],
      exclusions: ['Child is 16 or over (claim PIP instead)', 'Lives in Scotland (claim Child Disability Payment)'],
      means_tested: false,
      evidenceRequired: ['Medical evidence of disability or condition', 'Details of care needs and supervision required', 'GP or consultant reports'],
      ruleIn: ['Child under 16', 'Disability or health condition requiring extra care', 'Lives in England, Wales or NI'],
      ruleOut: ['Child 16 or over', 'Lives in Scotland', 'No extra care needs above same-age child'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "england",
            "wales",
            "northern-ireland"
          ],
          "label": "Must live in England, Wales or Northern Ireland (Scotland uses Child Disability Payment)"
        },
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Must have a child"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "<",
          "value": 16,
          "label": "Child must be under 16"
        },
        {
          "type": "boolean",
          "field": "has_disability",
          "expected": true,
          "label": "Child must have a disability or health condition requiring extra care or supervision"
        }
      ],

    },
    agentInteraction: {
      methods: ['phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/disability-living-allowance-children/how-to-claim',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Request a DLA child claim form by phone or download it',
        'Explain the care and mobility components and rates',
        'Help describe the child\'s care needs in the application',
        'Advise on gathering medical evidence from GP/consultant',
        'Explain the assessment process',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { care_lowest: 28.70, care_middle: 73.90, care_highest: 110.40, mobility_lower: 29.20, mobility_higher: 77.05 },
      source: 'https://www.gov.uk/disability-living-allowance-children/what-youll-get',
    },
    nations: ['england', 'wales', 'northern-ireland'],
      contactInfo: {
      phone: {
        number: '+44 800 121 4600',
        textphone: '+44 800 121 4523',
        relay: '18001 then 0800 121 4600',
        label: 'Disability Living Allowance helpline',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
    },
  },

  // Local Authority — Council Tax Disability Reduction ─────────────────────
  'la-council-tax-disability-reduction': {
    id: 'la-council-tax-disability-reduction', name: 'Council Tax Disability Reduction', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: 'Reduces Council Tax band by one level for properties with essential disability adaptations (extra room, wheelchair access, second bathroom).',
    govuk_url: 'https://www.gov.uk/council-tax/discounts-for-disabled-people',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Council Tax bill is reduced to the next band down if the property has certain features essential for a disabled resident: a room used mainly by the disabled person, an extra bathroom or kitchen, or extra space for wheelchair use.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'A disabled person must live in the property. The property must have been adapted or have features essential for the disabled person\'s needs.' },
        { factor: 'property', description: 'Property must have at least one of: a room mainly used by the disabled person (not a bedroom, bathroom or kitchen); an extra bathroom or kitchen for the disabled person; extra space inside for wheelchair use.' },
      ],
      keyQuestions: [
        'Does a disabled person live in the property?',
        'Does the property have an extra room, bathroom, kitchen or wheelchair space for the disabled person?',
        'Are you already receiving a Council Tax discount?',
      ],
      means_tested: false,
      evidenceRequired: ['Evidence of disability adaptations or property features', 'Proof the disabled person lives at the property'],
      ruleIn: ['Disabled person lives in property', 'Property has qualifying adaptations'],
      ruleOut: ['No disability adaptations in property', 'No disabled resident'],      rules: [
        {
          "type": "boolean",
          "field": "has_disability",
          "expected": true,
          "label": "A disabled person lives in the property"
        },
        {
          "type": "boolean",
          "field": "custom_facts.property_has_disability_adaptations",
          "expected": true,
          "label": "Property has qualifying features: extra room, bathroom, kitchen, or wheelchair space for the disabled person"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain qualifying property features (extra room, bathroom, wheelchair space)',
        'Help user contact their local council to apply',
        'Advise that reduction applies even if the property is already in the lowest band (Band A)',
        'Explain that the reduction can be combined with other Council Tax discounts',
      ],
    },
  },

  // Social Tariff Broadband ────────────────────────────────────────────────
  'other-social-tariff-broadband': {
    id: 'other-social-tariff-broadband', name: 'Social Tariff Broadband', dept: 'Broadband providers', deptKey: 'other',
    deadline: null,
    desc: 'Discounted broadband packages for UC, Pension Credit and other benefit recipients. Varies by provider.',
    govuk_url: 'https://www.gov.uk/affordable-broadband',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Discounted broadband for people on UC, Pension Credit and other means-tested benefits. Available from major providers (BT, Virgin Media, Sky, etc.). Prices typically £12–20/month.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Must be receiving a qualifying benefit such as Universal Credit, Pension Credit, or income-related ESA/JSA.' },
      ],
      keyQuestions: [
        'Do you receive Universal Credit, Pension Credit or another qualifying benefit?',
        'Who is your current broadband provider?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of qualifying benefit'],
      ruleIn: ['On UC, Pension Credit or qualifying benefit'],
      ruleOut: ['Not on qualifying benefit'],      rules: [
        {
          "type": "any",
          "label": "Receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_related_esa",
              "expected": true,
              "label": "Receiving income-related ESA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_based_jsa",
              "expected": true,
              "label": "Receiving income-based JSA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_support",
              "expected": true,
              "label": "Receiving Income Support"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/affordable-broadband',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Identify user\'s current broadband provider',
        'Check which social tariff is available from that provider',
        'Guide user to the provider\'s social tariff application page',
        'Explain that proof of qualifying benefit is usually needed',
      ],
    },
  },

  // NHS — Free Dental Treatment ────────────────────────────────────────────
  'nhs-free-dental': {
    id: 'nhs-free-dental', name: 'Free NHS Dental Treatment', dept: 'NHS', deptKey: 'nhs',
    deadline: null,
    desc: 'Free dental for under-18s, pregnant women, new mothers, low-income groups and qualifying benefit recipients.',
    govuk_url: 'https://www.nhs.uk/nhs-services/dentists/dental-costs/get-help-with-dental-costs/',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Free NHS dental treatment is available to: under-18s (or under-19 in full-time education), pregnant women and new mothers (12 months after birth), people on certain benefits, HC2 certificate holders, and War Pension dental scheme members.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Under 18 (or under 19 and in full-time education).' },
        { factor: 'family', description: 'Pregnant women and mothers with a child under 12 months.' },
        { factor: 'income', description: 'Receiving Income Support, income-related ESA, income-based JSA, Pension Credit Guarantee, or UC with nil income. Also HC2 certificate holders.' },
      ],
      keyQuestions: [
        'Are you under 18 (or under 19 in full-time education)?',
        'Are you pregnant or have a child under 12 months?',
        'Do you receive a qualifying benefit (IS, ESA, JSA, PC Guarantee, UC)?',
        'Do you have an HC2 or HC3 certificate?',
      ],
      autoQualifiers: ['Under 18', 'Pregnant or baby under 12 months', 'On qualifying benefit'],
      means_tested: false,
      evidenceRequired: ['Maternity exemption certificate (if pregnant/new mother)', 'HC2/HC3 certificate (if applicable)', 'Benefit award letter'],
      ruleIn: ['Under 18', 'Pregnant or baby under 12 months', 'On qualifying benefit', 'HC2 certificate holder'],
      ruleOut: ['Over 18 and not in qualifying group', 'No qualifying benefit or certificate'],      rules: [
        {
          "type": "any",
          "label": "Meets at least one free dental criterion",
          "rules": [
            {
              "type": "comparison",
              "field": "age",
              "operator": "<",
              "value": 18,
              "label": "Under 18"
            },
            {
              "type": "boolean",
              "field": "is_pregnant",
              "expected": true,
              "label": "Currently pregnant"
            },
            {
              "type": "boolean",
              "field": "custom_facts.gave_birth_last_12_months",
              "expected": true,
              "label": "Baby under 12 months old"
            },
            {
              "type": "dependency",
              "serviceId": "nhs-low-income-scheme",
              "condition": "receiving",
              "label": "Has HC2 certificate (NHS Low Income Scheme)"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_support",
              "expected": true,
              "label": "Receiving Income Support"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_related_esa",
              "expected": true,
              "label": "Receiving income-related ESA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_based_jsa",
              "expected": true,
              "label": "Receiving income-based JSA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit Guarantee Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit with nil income"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Determine which exemption category the user falls into',
        'Explain that exemption must be declared at the dentist',
        'Advise on getting a maternity exemption certificate or HC2 if needed',
        'Help find an NHS dentist accepting new patients',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 330 1348', label: 'NHS BSA dental services' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '15:00',
        },
      ],
      officeLocatorUrl: 'https://www.nhs.uk/service-search/find-a-dentist',
    },
  },

  // NHS — Free Sight Tests ─────────────────────────────────────────────────
  'nhs-free-sight-tests': {
    id: 'nhs-free-sight-tests', name: 'Free NHS Sight Tests', dept: 'NHS', deptKey: 'nhs',
    deadline: null,
    desc: 'Free sight tests for under-16s, over-60s, benefit recipients, those with certain conditions, and low-income groups.',
    govuk_url: 'https://www.nhs.uk/nhs-services/opticians/free-nhs-eye-tests-and-optical-vouchers/',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Free NHS sight tests available to: under-16s (or under-19 in full-time education), people aged 60+, people on certain benefits, diagnosed glaucoma patients, those at risk of glaucoma, registered blind/partially sighted, diabetes patients, and HC2 holders.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Under 16 (or under 19 in full-time education), or aged 60 or over.' },
        { factor: 'disability', description: 'Diagnosed glaucoma, diabetes, or registered blind/partially sighted. Also at risk of glaucoma (e.g. aged 40+ with close family member with glaucoma).' },
        { factor: 'income', description: 'Receiving Income Support, income-related ESA, income-based JSA, Pension Credit Guarantee, UC with nil income. Also HC2 certificate holders.' },
      ],
      keyQuestions: [
        'Are you under 16, or under 19 in full-time education?',
        'Are you aged 60 or over?',
        'Do you have glaucoma, diabetes or are you registered blind?',
        'Do you receive a qualifying benefit?',
        'Do you have an HC2 certificate?',
      ],
      autoQualifiers: ['Under 16', 'Aged 60 or over', 'Has glaucoma or diabetes', 'On qualifying benefit'],
      means_tested: false,
      evidenceRequired: ['HC2 certificate (if applicable)', 'Benefit award letter', 'Medical evidence if claiming on health grounds'],
      ruleIn: ['Under 16', 'Aged 60+', 'Has glaucoma/diabetes', 'On qualifying benefit', 'HC2 certificate holder'],
      ruleOut: ['Aged 16-59 with no qualifying condition, benefit or certificate'],      rules: [
        {
          "type": "any",
          "label": "Meets at least one free sight test criterion",
          "rules": [
            {
              "type": "comparison",
              "field": "age",
              "operator": "<",
              "value": 16,
              "label": "Under 16"
            },
            {
              "type": "comparison",
              "field": "age",
              "operator": ">=",
              "value": 60,
              "label": "Aged 60 or over"
            },
            {
              "type": "boolean",
              "field": "custom_facts.has_glaucoma",
              "expected": true,
              "label": "Diagnosed with glaucoma"
            },
            {
              "type": "boolean",
              "field": "custom_facts.has_diabetes",
              "expected": true,
              "label": "Has diabetes"
            },
            {
              "type": "boolean",
              "field": "custom_facts.registered_blind",
              "expected": true,
              "label": "Registered blind or partially sighted"
            },
            {
              "type": "boolean",
              "field": "custom_facts.glaucoma_risk",
              "expected": true,
              "label": "At risk of glaucoma (aged 40+ with close family member with glaucoma)"
            },
            {
              "type": "dependency",
              "serviceId": "nhs-low-income-scheme",
              "condition": "receiving",
              "label": "Has HC2 certificate (NHS Low Income Scheme)"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_support",
              "expected": true,
              "label": "Receiving Income Support"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_related_esa",
              "expected": true,
              "label": "Receiving income-related ESA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_based_jsa",
              "expected": true,
              "label": "Receiving income-based JSA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit Guarantee Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit with nil income"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Determine which exemption category the user falls into',
        'Explain that eligibility should be declared at the optician',
        'Advise on optical vouchers for glasses if also eligible',
        'Help find a local optician offering NHS sight tests',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 330 1349', label: 'NHS BSA optical services' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '15:00',
        },
      ],
      officeLocatorUrl: 'https://www.nhs.uk/service-search/find-an-optician',
    },
  },

  // DWP — Support for Mortgage Interest ────────────────────────────────────
  'dwp-smi': {
    id: 'dwp-smi', name: 'Support for Mortgage Interest', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Loan (secured against property) to help with mortgage interest payments for UC, PC, JSA, ESA and IS claimants.',
    govuk_url: 'https://www.gov.uk/support-for-mortgage-interest',
    serviceType: 'benefit',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'A loan to help homeowners pay mortgage interest. Available to UC, Pension Credit, income-based JSA, income-related ESA and Income Support claimants. The loan is secured against the property and repaid when the property is sold.',
      universal: false,
      criteria: [
        { factor: 'property', description: 'Must be a homeowner with a mortgage, loan or other charge on the property.' },
        { factor: 'income', description: 'Must be receiving UC (with no earnings or limited earnings), Pension Credit, income-based JSA, income-related ESA or Income Support.' },
        { factor: 'dependency', description: 'For UC claimants, must have received UC for 9 consecutive months before SMI starts (3 months for Pension Credit).' },
      ],
      keyQuestions: [
        'Are you a homeowner with a mortgage?',
        'Do you receive UC, Pension Credit, JSA, ESA or Income Support?',
        'How long have you been receiving the qualifying benefit?',
        'Do you understand this is a loan secured against your property?',
      ],
      exclusions: ['Renting (not a homeowner)', 'UC with earnings above threshold', 'Not on qualifying benefit for required duration'],
      means_tested: true,
      evidenceRequired: ['Mortgage statement', 'Proof of qualifying benefit', 'Consent to charge on property'],
      ruleIn: ['Homeowner with mortgage', 'On qualifying benefit 9+ months'],
      ruleOut: ['Renting', 'Not on qualifying benefit', 'UC with earnings above threshold'],      rules: [
        {
          "type": "boolean",
          "field": "is_homeowner",
          "expected": true,
          "label": "Must be a homeowner"
        },
        {
          "type": "boolean",
          "field": "has_mortgage",
          "expected": true,
          "label": "Must have a mortgage"
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit for 9+ months",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-jsa",
              "condition": "receiving",
              "label": "Receiving income-based JSA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-esa",
              "condition": "receiving",
              "label": "Receiving income-related ESA"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['phone'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check user is a homeowner on a qualifying benefit for the required duration',
        'Explain that SMI is a loan, not a grant — it must be repaid',
        'Advise on the interest rate used for calculations',
        'Explain the consent process (loan is secured against property)',
        'Guide user to contact DWP to start the claim',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { interest_rate_percent: 2.36, capital_limit: 200000 },
      source: 'https://www.gov.uk/support-for-mortgage-interest',
    },
      contactInfo: {
      phone: {
        number: '+44 800 169 0140',
        textphone: '+44 800 169 0207',
        relay: '18001 then 0800 169 0140',
        label: 'Jobcentre Plus (Support for Mortgage Interest)',
      },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
      ],
      notes: 'Accessed through qualifying benefit (UC, Pension Credit, JSA/ESA, or IS).',
    },
  },

  // DWP — Cold Weather Payment ─────────────────────────────────────────────
  'dwp-cold-weather-payment': {
    id: 'dwp-cold-weather-payment', name: 'Cold Weather Payment', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: '£25 for each 7-day cold spell (0°C or below) for qualifying benefit recipients. Automatic — no application needed.',
    govuk_url: 'https://www.gov.uk/cold-weather-payment',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: '£25 automatic payment for each 7-day period when the average temperature is recorded as or forecast to be 0°C or below. Must be receiving Pension Credit, income-related ESA, income-based JSA, Income Support or UC. Not available in Scotland (replaced by devolved schemes).',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Must be receiving a qualifying benefit: Pension Credit, income-related ESA (certain groups), income-based JSA, Income Support, or UC with limited capability for work or a disabled/severely disabled child element.' },
        { factor: 'geography', description: 'Available in England and Wales only. Scotland has its own devolved winter heating schemes.' },
      ],
      keyQuestions: [
        'Do you receive Pension Credit, ESA, JSA, IS or UC?',
        'Do you live in England or Wales?',
      ],
      autoQualifiers: ['On qualifying benefit in England/Wales during cold spell — paid automatically'],
      means_tested: false,
      ruleIn: ['On qualifying benefit', 'Lives in England or Wales'],
      ruleOut: ['Lives in Scotland', 'Not on qualifying benefit'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "england",
            "wales"
          ],
          "label": "Must live in England or Wales (Scotland has devolved schemes)"
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-esa",
              "condition": "receiving",
              "label": "Receiving income-related ESA (certain groups)"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-new-style-jsa",
              "condition": "receiving",
              "label": "Receiving income-based JSA"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving UC with limited capability for work or disabled child element"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Confirm user receives a qualifying benefit in England or Wales',
        'Explain that payment is automatic — no application needed',
        'Advise that £25 is paid for each 7-day cold spell',
        'Help user check their local weather station for cold spell records',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { per_cold_spell: 25 },
      source: 'https://www.gov.uk/cold-weather-payment',
    },
    nations: ['england', 'wales'],
  },

  // DVLA — Vehicle Excise Duty Exemption ───────────────────────────────────
  'dvla-ved-exemption': {
    id: 'dvla-ved-exemption', name: 'Vehicle Excise Duty Exemption', dept: 'DVLA', deptKey: 'dvla',
    deadline: null,
    desc: 'Free vehicle tax for people receiving PIP enhanced mobility or DLA higher-rate mobility component.',
    govuk_url: 'https://www.gov.uk/financial-help-disabled/vehicles-and-transport',
    serviceType: 'entitlement',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Exemption from vehicle tax (VED) for vehicles used by people receiving the enhanced mobility component of PIP, the higher-rate mobility component of DLA, War Pensioners\' Mobility Supplement, or Armed Forces Independence Payment.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Must receive enhanced mobility PIP, higher-rate mobility DLA, War Pensioners\' Mobility Supplement, or Armed Forces Independence Payment.' },
        { factor: 'dependency', description: 'Must already be receiving the qualifying disability benefit before applying.' },
      ],
      keyQuestions: [
        'Do you receive PIP with the enhanced mobility component?',
        'Or do you receive the higher-rate mobility component of DLA?',
        'Is the vehicle registered in your name or your nominee\'s name?',
      ],
      autoQualifiers: ['Receiving PIP enhanced mobility or DLA higher mobility'],
      means_tested: false,
      evidenceRequired: ['PIP or DLA award letter showing enhanced/higher mobility', 'Vehicle registration document (V5C)'],
      ruleIn: ['PIP enhanced mobility', 'DLA higher-rate mobility'],
      ruleOut: ['PIP standard mobility only', 'DLA lower-rate mobility only', 'No qualifying disability benefit'],      rules: [
        {
          "type": "any",
          "label": "Receiving enhanced mobility PIP or DLA higher-rate mobility",
          "rules": [
            {
              "type": "enum",
              "field": "pip_mobility_rate",
              "oneOf": [
                "enhanced"
              ],
              "label": "Receiving Enhanced Rate PIP mobility component"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receives_dla_higher_mobility",
              "expected": true,
              "label": "Receiving DLA higher-rate mobility component"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receives_war_pensioners_mobility",
              "expected": true,
              "label": "Receiving War Pensioners' Mobility Supplement"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receives_afip",
              "expected": true,
              "label": "Receiving Armed Forces Independence Payment"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/financial-help-disabled/vehicles-and-transport',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Verify user receives PIP enhanced mobility or DLA higher-rate mobility',
        'Explain the exemption covers the full vehicle tax',
        'Guide user to apply online or at a Post Office',
        'Advise that exemption must be renewed when the disability award is reviewed',
      ],
    },
  },

  // HMCTS — Court Fee Remission ────────────────────────────────────────────
  'hmcts-court-fee-remission': {
    id: 'hmcts-court-fee-remission', name: 'Court Fee Remission', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'Full or partial help with court and tribunal fees for people on benefits or low income.',
    govuk_url: 'https://www.gov.uk/get-help-with-court-fees',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Help with court and tribunal fees. Full remission if receiving qualifying benefits (UC with gross income under £6,000, JSA, ESA, IS, Pension Credit Guarantee). Partial remission based on income and savings. Savings must be below threshold.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Full remission: on qualifying benefit with savings below threshold. Partial remission: gross monthly income below £1,345 (single, no children). Higher thresholds for couples and those with children.' },
        { factor: 'asset', description: 'Savings must be below threshold: under 61 = £3,000; 61+ = £16,000. Thresholds rise depending on fee amount.' },
      ],
      keyQuestions: [
        'Are you receiving a qualifying benefit (UC, JSA, ESA, IS, Pension Credit)?',
        'What are your savings?',
        'What is the court or tribunal fee you need to pay?',
        'What is your gross monthly income?',
      ],
      means_tested: true,
      evidenceRequired: ['Benefit award letter', 'Bank statements showing savings', 'Proof of income if not on qualifying benefit'],
      ruleIn: ['On qualifying benefit', 'Low income', 'Savings below threshold'],
      ruleOut: ['Savings above threshold for age', 'High income without qualifying benefit'],      rules: [
        {
          "type": "any",
          "label": "On qualifying benefit or low income",
          "rules": [
            {
              "type": "all",
              "label": "Full remission: on qualifying benefit with savings below threshold",
              "rules": [
                {
                  "type": "any",
                  "label": "Receiving a qualifying benefit",
                  "rules": [
                    {
                      "type": "dependency",
                      "serviceId": "dwp-universal-credit",
                      "condition": "receiving",
                      "label": "Receiving Universal Credit"
                    },
                    {
                      "type": "boolean",
                      "field": "custom_facts.receiving_income_based_jsa",
                      "expected": true,
                      "label": "Receiving income-based JSA"
                    },
                    {
                      "type": "boolean",
                      "field": "custom_facts.receiving_income_related_esa",
                      "expected": true,
                      "label": "Receiving income-related ESA"
                    },
                    {
                      "type": "boolean",
                      "field": "custom_facts.receiving_income_support",
                      "expected": true,
                      "label": "Receiving Income Support"
                    },
                    {
                      "type": "dependency",
                      "serviceId": "dwp-pension-credit",
                      "condition": "receiving",
                      "label": "Receiving Pension Credit Guarantee Credit"
                    }
                  ]
                },
                {
                  "type": "comparison",
                  "field": "savings",
                  "operator": "<",
                  "value": 3000,
                  "label": "Savings below £3,000 (under 61) or £16,000 (61+)"
                }
              ]
            },
            {
              "type": "all",
              "label": "Partial remission: low gross monthly income",
              "rules": [
                {
                  "type": "comparison",
                  "field": "annual_income",
                  "operator": "<",
                  "value": 16140,
                  "label": "Gross annual income below £16,140 (£1,345/month single, no children)"
                },
                {
                  "type": "comparison",
                  "field": "savings",
                  "operator": "<",
                  "value": 3000,
                  "label": "Savings below threshold for fee amount"
                }
              ]
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/get-help-with-court-fees',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Determine whether user qualifies for full or partial remission',
        'Check savings thresholds based on age and fee amount',
        'Guide user through the Help with Fees (HWF) application',
        'Explain the HWF reference number process for court submissions',
      ],
    },
  },

  // NHS — Maternity Exemption Certificate ──────────────────────────────────
  'nhs-maternity-exemption': {
    id: 'nhs-maternity-exemption', name: 'Maternity Exemption Certificate', dept: 'NHS', deptKey: 'nhs',
    deadline: null,
    desc: 'Free NHS prescriptions and dental treatment during pregnancy and for 12 months after the baby is born.',
    govuk_url: 'https://www.nhs.uk/pregnancy/finding-out/free-nhs-prescriptions-and-dental-care/',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Free NHS prescriptions and dental treatment for pregnant women and new mothers for 12 months after the baby\'s birth. Maternity Exemption Certificate (MatEx) obtained through midwife or GP.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Must be pregnant or have had a baby in the last 12 months.' },
      ],
      keyQuestions: [
        'Are you currently pregnant?',
        'Have you had a baby in the last 12 months?',
        'Have you already obtained your MatEx certificate from your midwife or GP?',
      ],
      autoQualifiers: ['Currently pregnant', 'Baby born within last 12 months'],
      means_tested: false,
      evidenceRequired: ['Signed maternity exemption form from midwife or GP'],
      ruleIn: ['Pregnant', 'Baby under 12 months'],
      ruleOut: ['Not pregnant and baby over 12 months'],      rules: [
        {
          "type": "any",
          "label": "Currently pregnant or gave birth within the last 12 months",
          "rules": [
            {
              "type": "boolean",
              "field": "is_pregnant",
              "expected": true,
              "label": "Currently pregnant"
            },
            {
              "type": "boolean",
              "field": "custom_facts.gave_birth_last_12_months",
              "expected": true,
              "label": "Gave birth in the last 12 months"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['in-person'],
      apiAvailable: false,
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Advise user to ask midwife or GP for a maternity exemption form',
        'Explain the certificate covers free prescriptions and dental for full pregnancy plus 12 months post-birth',
        'Remind user to present the certificate at pharmacies and dentists',
        'Explain the certificate is sent automatically after the form is submitted',
      ],
    },
      contactInfo: {
      phone: { number: '+44 300 330 1341', label: 'NHS BSA (maternity exemption)' },
      hours: [
        {
          days: ['mon','tue','wed','thu','fri'],
          open: '08:00',
          close: '18:00',
        },
        {
          days: ['sat'],
          open: '09:00',
          close: '15:00',
        },
      ],
    },
  },

  // Local Authority — Free Childcare 2-year-olds ──────────────────────────
  'la-free-childcare-2yr': {
    id: 'la-free-childcare-2yr', name: 'Free Childcare (disadvantaged 2-year-olds)', dept: 'Local Authority', deptKey: 'la',
    deadline: null,
    desc: '15 hours/week free childcare for 2-year-olds from disadvantaged backgrounds. England only.',
    govuk_url: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-2-year-olds',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: '15 hours/week free childcare for eligible 2-year-olds in England. Qualifying criteria include receiving income-related benefits, being a looked-after child, having an EHC plan, receiving DLA, or leaving care.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Must have a 2-year-old child.' },
        { factor: 'income', description: 'Parent/carer must receive a qualifying benefit: Income Support, income-based JSA, income-related ESA, UC (with annual income under £15,400), tax credits (with annual income under £16,190), or the child has an EHC plan or receives DLA.' },
        { factor: 'geography', description: 'England only.' },
      ],
      keyQuestions: [
        'Do you have a child aged 2?',
        'Do you receive a qualifying benefit (UC, tax credits, IS, JSA, ESA)?',
        'Does the child have an EHC plan or receive DLA?',
        'Is the child a looked-after child?',
        'Do you live in England?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of qualifying benefit', 'Child\'s date of birth', 'National Insurance number'],
      ruleIn: ['Child aged 2', 'On qualifying benefit or child has EHC plan/DLA', 'Lives in England'],
      ruleOut: ['Child not aged 2', 'Not on qualifying benefit and child has no additional needs', 'Does not live in England'],      rules: [
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Has children"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "==",
          "value": 2,
          "label": "Child must be aged 2"
        },
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "england"
          ],
          "label": "Must live in England"
        },
        {
          "type": "any",
          "label": "On qualifying benefit or child has additional needs",
          "rules": [
            {
              "type": "all",
              "label": "On Universal Credit with low income",
              "rules": [
                {
                  "type": "dependency",
                  "serviceId": "dwp-universal-credit",
                  "condition": "receiving",
                  "label": "Receiving Universal Credit"
                },
                {
                  "type": "comparison",
                  "field": "annual_income",
                  "operator": "<",
                  "value": 15400,
                  "label": "Annual income under £15,400"
                }
              ]
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_support",
              "expected": true,
              "label": "Receiving Income Support"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_based_jsa",
              "expected": true,
              "label": "Receiving income-based JSA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.receiving_income_related_esa",
              "expected": true,
              "label": "Receiving income-related ESA"
            },
            {
              "type": "boolean",
              "field": "custom_facts.child_has_ehc_plan",
              "expected": true,
              "label": "Child has an Education, Health and Care (EHC) plan"
            },
            {
              "type": "boolean",
              "field": "custom_facts.child_receives_dla",
              "expected": true,
              "label": "Child receives Disability Living Allowance"
            },
            {
              "type": "boolean",
              "field": "custom_facts.child_looked_after_or_care_leaver",
              "expected": true,
              "label": "Child is looked-after or has left care"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/help-with-childcare-costs/free-childcare-2-year-olds',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check eligibility based on benefit receipt or child\'s needs',
        'Guide user to apply through their local council',
        'Explain the 15 hours/week entitlement (38 weeks/year)',
        'Advise on finding eligible childcare providers',
      ],
    },
    nations: ['england'],
  },

  // SLC — Childcare Grant ─────────────────────────────────────────────────
  'slc-childcare-grant': {
    id: 'slc-childcare-grant', name: 'Childcare Grant (Students)', dept: 'Student Loans Company', deptKey: 'slc',
    deadline: null,
    desc: 'Non-repayable grant for full-time students with children. Up to £10,124 for one child or £17,354 for two or more.',
    govuk_url: 'https://www.gov.uk/childcare-grant',
    serviceType: 'grant',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Non-repayable grant to help full-time higher education students with childcare costs. Up to 85% of actual costs, capped at approximately £10,124/year for one child or £17,354 for two or more. Income-assessed on household income.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Must be a full-time higher education student with dependent children in registered or approved childcare.' },
        { factor: 'income', description: 'Income-assessed on household income. Amount reduces as income rises.' },
        { factor: 'employment', description: 'Must be a full-time student (not part-time).' },
      ],
      keyQuestions: [
        'Are you a full-time higher education student?',
        'Do you have dependent children in registered childcare?',
        'What is your household income?',
        'What are your weekly childcare costs?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of full-time student status', 'Childcare provider registration details', 'Childcare cost receipts', 'Household income evidence'],
      ruleIn: ['Full-time student', 'Has dependent children in childcare'],
      ruleOut: ['Part-time student', 'No dependent children', 'Children not in registered childcare'],      rules: [
        {
          "type": "enum",
          "field": "employment_status",
          "oneOf": [
            "student"
          ],
          "label": "Must be a full-time higher education student"
        },
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Must have dependent children in registered childcare"
        }
      ],

    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/childcare-grant/how-to-claim',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check student is full-time and has children in registered childcare',
        'Guide user through the Student Finance application',
        'Explain the income assessment and maximum amounts',
        'Advise that the grant covers up to 85% of actual childcare costs',
        'Explain the grant is non-repayable (unlike student loans)',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { max_one_child: 10124, max_two_plus: 17354 },
      source: 'https://www.gov.uk/childcare-grant',
    },
  },

  // SSS — Best Start Grant ─────────────────────────────────────────────────
  'sss-best-start-grant': {
    id: 'sss-best-start-grant', name: 'Best Start Grant', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: 'Three one-off payments for families on qualifying benefits in Scotland: pregnancy (£707.25), early learning (£314.10), school age (£314.10).',
    govuk_url: 'https://www.mygov.scot/best-start-grant-best-start-foods',
    serviceType: 'grant',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Three one-off payments in Scotland for parents on qualifying benefits. Pregnancy & Baby Payment (£707.25 first child, £353.65 subsequent), Early Learning Payment (£314.10 when child turns ~2), School Age Payment (£314.10 when child starts school). Must be on qualifying benefit.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Must be responsible for a child (or pregnant for the first payment).' },
        { factor: 'income', description: 'Must be receiving a qualifying benefit: UC, tax credits, income-related ESA/JSA, Income Support, Pension Credit, or Housing Benefit.' },
        { factor: 'geography', description: 'Must live in Scotland.' },
      ],
      keyQuestions: [
        'Do you live in Scotland?',
        'Are you pregnant or do you have a young child?',
        'Do you receive a qualifying benefit?',
        'Which payment are you applying for (pregnancy, early learning, or school age)?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of qualifying benefit', 'Proof of pregnancy or child\'s age', 'Proof of Scottish residency'],
      ruleIn: ['Pregnant or has young child', 'On qualifying benefit', 'Lives in Scotland'],
      ruleOut: ['Does not live in Scotland', 'Not on qualifying benefit'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "any",
          "label": "Must be pregnant or have a young child",
          "rules": [
            {
              "type": "boolean",
              "field": "is_pregnant",
              "expected": true,
              "label": "Pregnant"
            },
            {
              "type": "boolean",
              "field": "has_children",
              "expected": true,
              "label": "Has children"
            }
          ]
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-housing-benefit",
              "condition": "receiving",
              "label": "Receiving Housing Benefit"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.mygov.scot/best-start-grant-best-start-foods',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Determine which of the three payments the user can apply for',
        'Confirm user lives in Scotland and is on a qualifying benefit',
        'Guide user through the mygov.scot application',
        'Explain application deadlines for each payment',
        'Advise on the higher rate for first child (pregnancy payment)',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { pregnancy_first: 707.25, pregnancy_subsequent: 353.65, early_learning: 314.10, school_age: 314.10 },
      source: 'https://www.mygov.scot/best-start-grant-best-start-foods',
    },
    nations: ['scotland'],
  },
  'sss-best-start-foods': {
    id: 'sss-best-start-foods', name: 'Best Start Foods', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: '£4.95/week on a prepaid card for healthy food during pregnancy and for children under 3 in Scotland.',
    govuk_url: 'https://www.mygov.scot/best-start-grant-best-start-foods',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: '£4.95/week loaded onto a prepaid card for buying healthy food. For pregnant women and parents/carers of children under 3 in Scotland who receive a qualifying benefit.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Must be pregnant or responsible for a child under 3.' },
        { factor: 'income', description: 'Must be receiving a qualifying benefit: UC, tax credits, income-related ESA/JSA, Income Support, Pension Credit, or Housing Benefit.' },
        { factor: 'geography', description: 'Must live in Scotland.' },
      ],
      keyQuestions: [
        'Do you live in Scotland?',
        'Are you pregnant or do you have a child under 3?',
        'Do you receive a qualifying benefit?',
      ],
      means_tested: true,
      evidenceRequired: ['Proof of qualifying benefit', 'Proof of pregnancy or child\'s age'],
      ruleIn: ['Pregnant or child under 3', 'On qualifying benefit', 'Lives in Scotland'],
      ruleOut: ['Does not live in Scotland', 'Not on qualifying benefit', 'Child over 3'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "any",
          "label": "Must be pregnant or have a child under 3",
          "rules": [
            {
              "type": "boolean",
              "field": "is_pregnant",
              "expected": true,
              "label": "Pregnant"
            },
            {
              "type": "all",
              "label": "Has a child under 3",
              "rules": [
                {
                  "type": "boolean",
                  "field": "has_children",
                  "expected": true,
                  "label": "Has children"
                },
                {
                  "type": "comparison",
                  "field": "youngest_child_age",
                  "operator": "<",
                  "value": 3,
                  "label": "Youngest child under 3"
                }
              ]
            }
          ]
        },
        {
          "type": "any",
          "label": "Must be receiving a qualifying benefit",
          "rules": [
            {
              "type": "dependency",
              "serviceId": "dwp-universal-credit",
              "condition": "receiving",
              "label": "Receiving Universal Credit"
            },
            {
              "type": "dependency",
              "serviceId": "dwp-pension-credit",
              "condition": "receiving",
              "label": "Receiving Pension Credit"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.mygov.scot/best-start-grant-best-start-foods',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user is pregnant or has a child under 3 in Scotland',
        'Verify user receives a qualifying benefit',
        'Guide user through the mygov.scot application',
        'Explain the prepaid card system and eligible food items',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { weekly_rate: 4.95 },
      source: 'https://www.mygov.scot/best-start-grant-best-start-foods',
    },
    nations: ['scotland'],
  },
  'sss-adult-disability-payment': {
    id: 'sss-adult-disability-payment', name: 'Adult Disability Payment', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: 'Replaces PIP in Scotland. Same rates — daily living and mobility components at standard and enhanced rates.',
    govuk_url: 'https://www.mygov.scot/adult-disability-payment',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Scotland\'s replacement for Personal Independence Payment (PIP). For adults aged 16+ (under State Pension age) with a long-term physical or mental health condition or disability. Same rates as PIP. Assessed on impact of condition, not the condition itself.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must be aged 16 to State Pension age.' },
        { factor: 'disability', description: 'Must have a long-term physical or mental health condition or disability that affects daily living or mobility for at least 13 weeks and is expected to last at least 9 more months.' },
        { factor: 'geography', description: 'Must live in Scotland.' },
      ],
      keyQuestions: [
        'Do you live in Scotland?',
        'Are you aged 16 to State Pension age?',
        'Do you have a physical or mental health condition affecting daily living or mobility?',
        'Has the condition lasted at least 13 weeks?',
        'Is it expected to last at least 9 more months?',
      ],
      means_tested: false,
      evidenceRequired: ['Medical evidence of condition', 'Details of how condition affects daily life', 'GP or consultant details'],
      ruleIn: ['Aged 16 to State Pension age', 'Long-term condition affecting daily living/mobility', 'Lives in Scotland'],
      ruleOut: ['Under 16 (claim CDP instead)', 'Over State Pension age (claim AA instead)', 'Does not live in Scotland'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 16,
          "label": "Must be aged 16 or over"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": "<",
          "value": 66,
          "label": "Must be under State Pension age (66)"
        },
        {
          "type": "any",
          "label": "Must have a disability or long-term health condition",
          "rules": [
            {
              "type": "boolean",
              "field": "has_disability",
              "expected": true,
              "label": "Has a disability"
            },
            {
              "type": "boolean",
              "field": "has_long_term_health_condition",
              "expected": true,
              "label": "Has a long-term health condition"
            },
            {
              "type": "boolean",
              "field": "has_terminal_illness",
              "expected": true,
              "label": "Has a terminal illness"
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.mygov.scot/adult-disability-payment',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user lives in Scotland and is aged 16 to State Pension age',
        'Explain the daily living and mobility components',
        'Help user understand how to describe the impact of their condition',
        'Guide user through the mygov.scot application',
        'Advise on gathering supporting medical evidence',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { daily_living_standard: 73.90, daily_living_enhanced: 110.40, mobility_standard: 29.20, mobility_enhanced: 77.05 },
      source: 'https://www.mygov.scot/adult-disability-payment',
    },
    nations: ['scotland'],
  },
  'sss-child-disability-payment': {
    id: 'sss-child-disability-payment', name: 'Child Disability Payment', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: 'Scotland\'s replacement for DLA Child. Same rates — care and mobility components at various levels.',
    govuk_url: 'https://www.mygov.scot/child-disability-payment',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Scotland\'s replacement for Disability Living Allowance for children. For children under 16 with a disability or health condition that means they need substantially more care or supervision, or have difficulty walking.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Child must be under 16.' },
        { factor: 'disability', description: 'Child must have a physical or mental disability requiring substantially more care or supervision than a child of the same age, or have difficulty walking.' },
        { factor: 'geography', description: 'Must live in Scotland.' },
      ],
      keyQuestions: [
        'Does the child live in Scotland?',
        'Is the child under 16?',
        'Does the child have a disability or long-term health condition?',
        'Does the child need more care or supervision than other children the same age?',
        'Does the child have difficulty walking?',
      ],
      exclusions: ['Child 16 or over (claim Adult Disability Payment)', 'Does not live in Scotland'],
      means_tested: false,
      evidenceRequired: ['Medical evidence of disability or condition', 'Details of care and supervision needs', 'GP or consultant reports'],
      ruleIn: ['Child under 16', 'Disability requiring extra care', 'Lives in Scotland'],
      ruleOut: ['Child 16 or over', 'Does not live in Scotland', 'No extra care needs above same-age child'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "boolean",
          "field": "has_children",
          "expected": true,
          "label": "Must have a child"
        },
        {
          "type": "comparison",
          "field": "youngest_child_age",
          "operator": "<",
          "value": 16,
          "label": "Child must be under 16"
        },
        {
          "type": "boolean",
          "field": "has_disability",
          "expected": true,
          "label": "Child must have a disability or health condition requiring extra care"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.mygov.scot/child-disability-payment',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm child lives in Scotland and is under 16',
        'Explain the care and mobility components and rates',
        'Help describe the child\'s care needs in the application',
        'Guide user through the mygov.scot application',
        'Advise on gathering supporting medical evidence',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { care_lowest: 28.70, care_middle: 73.90, care_highest: 110.40, mobility_lower: 29.20, mobility_higher: 77.05 },
      source: 'https://www.mygov.scot/child-disability-payment',
    },
    nations: ['scotland'],
  },
  'sss-young-carer-grant': {
    id: 'sss-young-carer-grant', name: 'Young Carer Grant', dept: 'Social Security Scotland', deptKey: 'sss',
    deadline: null,
    desc: '£388.65/year for young carers aged 16–18 in Scotland who provide at least 16 hours/week of care.',
    govuk_url: 'https://www.mygov.scot/young-carer-grant',
    serviceType: 'grant',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Annual grant of £388.65 for young carers aged 16–18 in Scotland who provide an average of 16+ hours of care per week for someone receiving a qualifying disability benefit. Not means-tested.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must be aged 16, 17 or 18 at the time of application.' },
        { factor: 'caring', description: 'Must provide an average of at least 16 hours of care per week over a 13-week period to someone receiving a qualifying disability benefit.' },
        { factor: 'geography', description: 'Must live in Scotland.' },
      ],
      keyQuestions: [
        'Do you live in Scotland?',
        'Are you aged 16, 17 or 18?',
        'Do you provide at least 16 hours of care per week?',
        'Does the person you care for receive a qualifying disability benefit?',
        'Are you receiving Carer\'s Allowance or Carer Support Payment? (If so, you cannot also get YCG.)',
      ],
      exclusions: ['Receiving Carer\'s Allowance or Carer Support Payment', 'Under 16 or over 18'],
      means_tested: false,
      evidenceRequired: ['Details of person cared for', 'Proof of caring role and hours', 'Age verification'],
      ruleIn: ['Aged 16–18', 'Provides 16+ hours care/week', 'Lives in Scotland'],
      ruleOut: ['Receiving CA or CSP', 'Under 16 or over 18', 'Does not live in Scotland'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "scotland"
          ],
          "label": "Must live in Scotland"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 16,
          "label": "Must be aged 16 or over"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": "<=",
          "value": 18,
          "label": "Must be aged 18 or under"
        },
        {
          "type": "boolean",
          "field": "is_carer",
          "expected": true,
          "label": "Must be a carer"
        },
        {
          "type": "comparison",
          "field": "caring_hours_per_week",
          "operator": ">=",
          "value": 16,
          "label": "Must provide at least 16 hours of care per week (average over 13 weeks)"
        },
        {
          "type": "boolean",
          "field": "cared_for_receives_qualifying_benefit",
          "expected": true,
          "label": "Person cared for must receive a qualifying disability benefit"
        },
        {
          "type": "not",
          "label": "Must not already be receiving Carer's Allowance or Carer Support Payment",
          "rules": [
            {
              "type": "any",
              "label": "Receiving CA or CSP",
              "rules": [
                {
                  "type": "dependency",
                  "serviceId": "dwp-carers-allowance",
                  "condition": "receiving",
                  "label": "Receiving Carer's Allowance"
                },
                {
                  "type": "dependency",
                  "serviceId": "sss-carer-support-payment",
                  "condition": "receiving",
                  "label": "Receiving Carer Support Payment"
                }
              ]
            }
          ]
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.mygov.scot/young-carer-grant',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm applicant is aged 16–18 and lives in Scotland',
        'Verify they provide 16+ hours/week care and do not receive CA/CSP',
        'Guide user through the mygov.scot application',
        'Explain the payment amount (£388.65) and annual claim process',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { annual_payment: 388.65 },
      source: 'https://www.mygov.scot/young-carer-grant',
    },
    nations: ['scotland'],
  },

  // Welsh Government — Discretionary Assistance Fund ───────────────────────
  'wg-discretionary-assistance': {
    id: 'wg-discretionary-assistance', name: 'Discretionary Assistance Fund (Wales)', dept: 'Welsh Government', deptKey: 'wg',
    deadline: null,
    desc: 'Emergency assistance payments in Wales. Emergency Assistance Payment (up to £120) or Individual Assistance Payment (up to £750).',
    govuk_url: 'https://www.gov.wales/discretionary-assistance-fund-daf',
    serviceType: 'grant',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Emergency financial help in Wales. Two types: Emergency Assistance Payment (up to £120 for immediate crisis — food, gas, electricity) and Individual Assistance Payment (up to £750 for essential household items). Must be 16+ and live in Wales.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must be aged 16 or over.' },
        { factor: 'income', description: 'Must be in financial hardship. For EAP: facing an immediate crisis. For IAP: need essential household items (e.g. after fleeing domestic violence, leaving care, or an emergency).' },
        { factor: 'geography', description: 'Must live in Wales.' },
      ],
      keyQuestions: [
        'Do you live in Wales?',
        'Are you facing an immediate financial crisis (food, gas, electricity)?',
        'Or do you need essential household items?',
        'Are you 16 or over?',
        'Have you applied to the DAF before? (Limited to 3 EAPs and 1 IAP per year.)',
      ],
      exclusions: ['Exceeded annual application limit (3 EAP / 1 IAP per year)'],
      means_tested: true,
      evidenceRequired: ['Proof of identity', 'Proof of Welsh residency', 'Details of the emergency or need'],
      ruleIn: ['Financial hardship', 'Lives in Wales', 'Aged 16+'],
      ruleOut: ['Does not live in Wales', 'Under 16', 'Exceeded annual application limit'],      rules: [
        {
          "type": "enum",
          "field": "nation",
          "oneOf": [
            "wales"
          ],
          "label": "Must live in Wales"
        },
        {
          "type": "comparison",
          "field": "age",
          "operator": ">=",
          "value": 16,
          "label": "Must be aged 16 or over"
        }
      ],

    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.wales/discretionary-assistance-fund-daf',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Determine whether user needs Emergency Assistance or Individual Assistance',
        'Confirm user lives in Wales and is 16+',
        'Guide user through the application process',
        'Explain payment limits and annual caps',
        'Advise on urgent processing for immediate crisis needs',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { emergency_max: 120, individual_max: 750 },
      source: 'https://www.gov.wales/discretionary-assistance-fund-daf',
    },
    nations: ['wales'],
  },
  'slc-loan-repayment': {
    id: 'slc-loan-repayment', name: 'Student loan repayment', dept: 'Student Loans Company', deptKey: 'slc',
    deadline: null,
    desc: 'Student loan repayments are collected automatically via PAYE or Self Assessment once earnings exceed the plan threshold. Employees must declare their loan plan type to their employer on starting work.',
    govuk_url: 'https://www.gov.uk/repaying-your-student-loan',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Applies to anyone with an outstanding UK student loan whose income exceeds the threshold for their plan (Plan 1: £26,065; Plan 2: £28,470; Plan 4: £32,745; Plan 5: £25,000; Postgraduate Loan: £21,000). Repayments are 9% of income above the threshold (6% for postgraduate loans), collected via PAYE or Self Assessment automatically.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Annual income must exceed the threshold for the applicable repayment plan before any deductions are made.' },
        { factor: 'employment', description: 'Employed borrowers repay via PAYE payroll deductions; self-employed borrowers repay via their annual Self Assessment return.' },
        { factor: 'dependency', description: 'Must hold an outstanding UK government student or postgraduate loan.' },
      ],
      keyQuestions: [
        'Did you take out a UK government student loan?',
        'What type of loan — undergraduate (tuition/maintenance) or postgraduate?',
        'When did your course start, and where did you study? (Determines plan type.)',
        'Is your income currently above your plan\'s repayment threshold?',
        'Are you employed (PAYE) or self-employed (Self Assessment)?',
      ],
      autoQualifiers: ['Outstanding UK student loan and income above plan threshold — PAYE deductions begin automatically once employer is notified of plan type'],
      exclusions: ['Loan already fully repaid or written off', 'Income below the relevant plan threshold — no deductions due', 'Received only grants or bursaries (not repayable)', 'Plan 1 loan written off after 25 years or at age 65'],
      means_tested: false,
      evidenceRequired: ['Student loan plan type (stated in SLC repayment schedule letter)', 'Income information via PAYE payroll or Self Assessment tax return'],
      ruleIn: ['Has outstanding UK student loan', 'Income above repayment threshold for plan type', 'Recently graduated or started earning above threshold'],
      ruleOut: ['Income below plan threshold', 'Loan fully written off or repaid', 'Only received non-repayable grants or bursaries'],
    },
  },

  // ─── PASSPORTS & TRAVEL DOCUMENTS ────────────────────────────────────────

  'hmpo-passport': {
    id: 'hmpo-passport', name: 'Apply for or renew a passport', dept: 'HMPO', deptKey: 'other',
    deadline: null,
    desc: 'Apply for a new UK passport or renew an existing one online; covers first applications, renewals, and replacements.',
    govuk_url: 'https://www.gov.uk/apply-renew-passport',
    serviceType: 'document',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Any British national is entitled to a UK passport. First-time applicants need a countersignatory. Renewals can be done entirely online.',
      universal: false,
      criteria: [
        { factor: 'citizenship', description: 'Must be a British national (citizen, overseas territory citizen, etc.).' },
      ],
      keyQuestions: [
        'Is this a first application, renewal or replacement?',
        'Has your name changed since your last passport?',
        'Do you need it urgently (within 3 weeks)?',
      ],
      means_tested: false,
      evidenceRequired: ['Current or most recent passport', 'Digital photo meeting requirements', 'Countersignatory details (first applications)'],
      ruleIn: ['British national', 'Existing passport expiring within 9 months'],
      ruleOut: ['Not a British national'],
    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.passport.service.gov.uk/filter',
      authRequired: 'gov-uk-verify',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check whether this is a first application, renewal or replacement',
        'Confirm whether name has changed (triggers additional evidence requirements)',
        'Advise on current processing times and whether urgent service is needed',
        'Walk user through photo requirements and countersignatory rules',
        'Direct user to the online application at passport.service.gov.uk',
      ],
    },
  },

  'hmpo-passport-urgent': {
    id: 'hmpo-passport-urgent', name: 'Urgent passport application', dept: 'HMPO', deptKey: 'other',
    deadline: null,
    desc: 'Fast-track or premium passport service for travel within days or weeks; requires an in-person appointment.',
    govuk_url: 'https://www.gov.uk/get-a-passport-urgently',
    serviceType: 'document',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'Available to British nationals who need a passport urgently. Requires booking a passport office appointment. Premium (same-day) and Fast Track (1-week) options are available for an additional fee.',
      universal: false,
      criteria: [
        { factor: 'citizenship', description: 'Must be a British national with imminent international travel.' },
      ],
      keyQuestions: [
        'When is the travel date?',
        'Is an existing passport available to bring to the appointment?',
        'Which passport office is closest to the user?',
      ],
      means_tested: false,
      ruleIn: ['Travel within 3 weeks', 'British national'],
      ruleOut: ['Travel not imminent — standard service is cheaper'],
    },
    agentInteraction: {
      methods: ['in-person'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/get-a-passport-urgently',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Confirm travel date to determine which urgent service is needed',
        'Help user book a passport office appointment online',
        'List what to bring to the appointment',
      ],
    },
  },

  'hmpo-lost-stolen-passport': {
    id: 'hmpo-lost-stolen-passport', name: 'Report a lost or stolen passport', dept: 'HMPO', deptKey: 'other',
    deadline: null,
    desc: 'Cancel a lost or stolen UK passport to prevent fraudulent use, then apply for a replacement.',
    govuk_url: 'https://www.gov.uk/report-a-lost-or-stolen-passport',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Anyone whose UK passport has been lost or stolen should cancel it immediately. A replacement must then be applied for separately.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'Was the passport lost or stolen?',
        'Does the user have upcoming travel that requires an urgent replacement?',
      ],
      means_tested: false,
      ruleIn: ['Lost or stolen UK passport'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/report-a-lost-or-stolen-passport',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Direct user to cancel their passport online immediately',
        'Advise that they need to apply for a replacement afterwards',
        'If stolen, advise also reporting to police for a crime reference number',
      ],
    },
  },

  'fco-emergency-travel-doc': {
    id: 'fco-emergency-travel-doc', name: 'Emergency travel document', dept: 'FCDO', deptKey: 'other',
    deadline: null,
    desc: 'One-way travel document issued by a British consulate to British nationals stranded abroad without a valid passport.',
    govuk_url: 'https://www.gov.uk/emergency-travel-document',
    serviceType: 'document',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Available to British nationals outside the UK who have lost their passport, had it stolen, or whose passport has expired and they need to return to the UK.',
      universal: false,
      criteria: [
        { factor: 'citizenship', description: 'Must be a British national currently outside the UK.' },
        { factor: 'geography', description: 'Must be outside the UK without a valid passport.' },
      ],
      keyQuestions: [
        'Is the user currently outside the UK?',
        'Has their passport been lost, stolen or expired?',
        'Where is the nearest British consulate?',
      ],
      means_tested: false,
      ruleIn: ['British national', 'Outside UK without valid passport'],
      ruleOut: ['Currently in the UK — apply for urgent passport instead'],
    },
    agentInteraction: {
      methods: ['in-person'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/emergency-travel-document',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Confirm user is outside the UK',
        'Help locate nearest British embassy or consulate',
        'List documents needed for the appointment',
        'Advise that an ETD is one-way only — a new passport must be applied for on return',
      ],
    },
  },

  'fco-document-legalisation': {
    id: 'fco-document-legalisation', name: 'Legalise a document (apostille)', dept: 'FCDO', deptKey: 'other',
    deadline: null,
    desc: 'Get an apostille stamp from the FCDO to make a UK public document legally recognised in another country.',
    govuk_url: 'https://www.gov.uk/get-document-legalised',
    serviceType: 'document',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Available to anyone who needs a UK public document (birth certificate, marriage certificate, DBS check, etc.) officially recognised abroad. The document must be an original UK public document or certified copy.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'Which country is the document going to?',
        'Is that country a member of the Hague Apostille Convention?',
        'What type of document needs legalising?',
      ],
      means_tested: false,
      ruleIn: ['UK public document needed abroad', 'Destination country accepts apostilles'],
      ruleOut: ['Document is not a UK public document'],
    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/get-document-legalised',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check whether the destination country is in the Hague Apostille Convention',
        'Identify the type of document and whether it needs notarisation first',
        'Guide user to the FCDO legalisation service',
      ],
    },
  },

  // ─── BENEFITS & FINANCIAL ENTITLEMENTS ───────────────────────────────────

  'hmrc-help-to-save': {
    id: 'hmrc-help-to-save', name: 'Help to Save', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Government-backed savings account paying a 50p bonus for every £1 saved, available to Universal Credit and Working Tax Credit claimants.',
    govuk_url: 'https://www.gov.uk/get-help-savings-low-income',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to UK residents receiving Universal Credit (with minimum earnings) or Working Tax Credit. Save between £1 and £50 per month for up to 4 years and receive a 50% government bonus at the end of years 2 and 4.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Must be receiving Universal Credit with minimum household earnings, or Working Tax Credit.' },
        { factor: 'residency', description: 'Must be a UK resident.' },
      ],
      keyQuestions: [
        'Is the user currently receiving Universal Credit or Working Tax Credit?',
        'Can they afford to save at least £1/month?',
      ],
      autoQualifiers: ['Receiving Universal Credit and earned at least £793.17 in last month'],
      means_tested: true,
      ruleIn: ['Receiving Universal Credit', 'Receiving Working Tax Credit'],
      ruleOut: ['Not receiving UC or WTC', 'Not a UK resident'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.tax.service.gov.uk/help-to-save/access-account',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm eligibility via UC or WTC receipt',
        'Explain the 50% bonus structure (year 2 and year 4 bonuses)',
        'Guide user to open an account via HMRC online services',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { max_bonus_year_2: 600, max_bonus_year_4: 600, max_total_bonus: 1200 },
      source: 'https://www.gov.uk/get-help-savings-low-income',
    },
  },

  'dwp-budgeting-loan': {
    id: 'dwp-budgeting-loan', name: 'Budgeting Loan', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Interest-free loan from the Social Fund for essential items such as furniture, clothes or travel costs, for people on qualifying benefits.',
    govuk_url: 'https://www.gov.uk/budgeting-help-benefits/budgeting-loans',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to people who have been receiving Income Support, income-based JSA, income-related ESA, or Pension Credit for at least 6 months. Universal Credit claimants use Budgeting Advance instead.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Must be receiving a qualifying legacy benefit (Income Support, income-based JSA, income-related ESA, or Pension Credit) for at least 26 consecutive weeks.' },
      ],
      keyQuestions: [
        'Which benefit is the user receiving?',
        'Have they been receiving it for at least 6 months?',
        'Do they have existing benefit debt that might reduce the loan amount?',
      ],
      means_tested: true,
      ruleIn: ['On legacy benefits for 6+ months', 'Need to cover essential expenditure'],
      ruleOut: ['On Universal Credit — use Budgeting Advance instead', 'Been on qualifying benefit less than 6 months'],
    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.apply-budgeting-loan.service.gov.uk',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user is on a qualifying legacy benefit (not UC)',
        'Check they have been receiving it for 26+ weeks',
        'Explain repayment is deducted automatically from benefit payments',
        'Direct to online application',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { min: 100, max_single: 348, max_couple: 464, max_with_children: 812 },
      source: 'https://www.gov.uk/budgeting-help-benefits/budgeting-loans',
    },
  },

  'hmrc-tax-credits': {
    id: 'hmrc-tax-credits', name: 'Tax Credits (Working & Child)', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Legacy means-tested benefits for working adults and families with children on low incomes; being migrated to Universal Credit but millions still claim.',
    govuk_url: 'https://www.gov.uk/topic/benefits-credits/tax-credits',
    serviceType: 'benefit',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Working Tax Credit is for working adults on low income. Child Tax Credit is for people responsible for children. New claims are only open to those already in the legacy system; most new claimants must use Universal Credit instead.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Income must be below the relevant threshold (varies by household type and hours worked).' },
        { factor: 'employment', description: 'Working Tax Credit requires working a minimum number of hours per week (16–30 hrs depending on age and circumstances).' },
        { factor: 'family', description: 'Child Tax Credit requires being responsible for at least one child under 16 (or under 20 in approved education).' },
      ],
      keyQuestions: [
        'Is the user already claiming Tax Credits?',
        'Have they been asked to migrate to Universal Credit?',
        'Do they have children or are they working on a low income?',
      ],
      autoQualifiers: ['Already receiving Tax Credits and not yet migrated to UC'],
      exclusions: ['New claimants must use Universal Credit — Tax Credits is closed to new applications'],
      means_tested: true,
      ruleIn: ['Existing Tax Credits claimant', 'Low income with children or working low-income adult'],
      ruleOut: ['New claimant — must apply for Universal Credit instead', 'Income too high for eligibility'],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.tax.service.gov.uk/tax-credits-service',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check whether user is already a Tax Credits claimant or a new claimant',
        'If new claimant, direct to Universal Credit instead',
        'Help existing claimants report changes of circumstance',
        'Advise on migration notice timeline if user has received a migration notice',
      ],
    },
  },

  'cica-compensation': {
    id: 'cica-compensation', name: 'Criminal Injuries Compensation', dept: 'CICA', deptKey: 'other',
    deadline: '2 years from incident',
    desc: 'Financial compensation for victims of violent crime in Great Britain, assessed by the Criminal Injuries Compensation Authority.',
    govuk_url: 'https://www.gov.uk/claim-compensation-criminal-injury',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Available to victims of violent crime in Great Britain who suffered a physical or psychological injury. Must claim within 2 years of the incident (exceptions for child abuse and some other circumstances). A tariff-based scheme from £1,000 to £500,000.',
      universal: false,
      criteria: [
        { factor: 'residency', description: 'Crime must have occurred in Great Britain.' },
        { factor: 'disability', description: 'Must have suffered a qualifying physical or psychological injury as a direct result of a violent crime.' },
      ],
      keyQuestions: [
        'Was the crime reported to the police?',
        'When did the incident occur?',
        'Did the user suffer physical or psychological injury?',
      ],
      exclusions: ['Crime not reported to police', 'Claim submitted more than 2 years after incident (unless exceptional circumstances)', 'Injury does not meet minimum threshold'],
      means_tested: false,
      ruleIn: ['Victim of violent crime in Great Britain', 'Injury sustained', 'Crime reported to police'],
      ruleOut: ['Crime occurred outside Great Britain', 'Claim out of time', 'No qualifying injury'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://claim-criminal-injuries-compensation.service.justice.gov.uk/apply',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check the 2-year time limit from the date of the crime',
        'Confirm the crime was reported to police (required for most claims)',
        'Explain the tariff-based award structure',
        'Guide user to the online application',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'one-off',
      rates: { tariff_min: 1000, tariff_max: 500000 },
      source: 'https://www.gov.uk/government/publications/criminal-injuries-compensation-scheme-2012',
    },
  },

  'dwp-pension-tracing': {
    id: 'dwp-pension-tracing', name: 'Pension Tracing Service', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Find the contact details for a lost workplace or personal pension using the government\'s free Pension Tracing Service.',
    govuk_url: 'https://www.gov.uk/find-pension-contact-details',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Free service available to anyone who has lost track of a workplace or personal pension. The service traces pension schemes and provides contact details so you can find out if you have a pension pot.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'Does the user know the name of their previous employer or pension provider?',
        'Approximately when did they work there?',
      ],
      means_tested: false,
      ruleIn: ['Previously employed or had a personal pension', 'Lost track of pension details'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.findpensioncontacts.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Ask user for former employer names and approximate dates of employment',
        'Search the Pension Tracing Service on their behalf',
        'Provide contact details for any matching pension schemes found',
      ],
    },
  },

  'dwp-benefit-debt-repayment': {
    id: 'dwp-benefit-debt-repayment', name: 'Repay a benefit overpayment', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Manage or repay a DWP benefit overpayment through an online account, direct debit or phone.',
    govuk_url: 'https://www.gov.uk/repaying-benefit-overpayment',
    serviceType: 'obligation',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Applies to anyone who has received more benefit than they were entitled to and has been notified of an overpayment by DWP. Repayments are typically deducted automatically from ongoing benefits.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must have been notified by DWP of a benefit overpayment.' },
      ],
      keyQuestions: [
        'Has the user received a letter from DWP about an overpayment?',
        'Are they still receiving benefits (automatic deduction may apply)?',
      ],
      means_tested: false,
      ruleIn: ['Received DWP overpayment notice'],
      ruleOut: ['No overpayment — no action needed'],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/repaying-benefit-overpayment',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain automatic deduction if user is still on benefits',
        'Provide details on arranging a repayment plan if no ongoing benefits',
        'Advise on appealing if the overpayment is disputed',
      ],
    },
  },

  // ─── HEALTHCARE ────────────────────────────────────────────────────────────

  'nhs-fit-note': {
    id: 'nhs-fit-note', name: 'Send a fit note for an ESA claim', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'Upload or submit a fit note (sick note) digitally to DWP to support an Employment and Support Allowance or Universal Credit health claim.',
    govuk_url: 'https://www.gov.uk/send-fit-note',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Required for claimants of ESA or the health/limited capability element of Universal Credit who need to provide medical evidence of their condition. A GP or healthcare provider issues the fit note; the claimant submits it to DWP.',
      universal: false,
      criteria: [
        { factor: 'disability', description: 'Must have a health condition or disability that prevents or limits work, evidenced by a fit note from a healthcare provider.' },
        { factor: 'dependency', description: 'Must already be claiming or applying for ESA or UC with a health condition.' },
      ],
      keyQuestions: [
        'Does the user have a current fit note from their GP or healthcare provider?',
        'Are they claiming ESA or the UC health element?',
      ],
      means_tested: false,
      ruleIn: ['Has a fit note from a GP', 'Claiming ESA or UC health element'],
      ruleOut: ['Not claiming ESA or UC health element'],
    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://send-fit-note.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user has a current fit note from a healthcare provider',
        'Check whether they are claiming ESA or Universal Credit',
        'Guide user to submit the fit note online or by post',
      ],
    },
  },

  'nhs-ppc': {
    id: 'nhs-ppc', name: 'Prescription Prepayment Certificate (PPC)', dept: 'NHS BSA', deptKey: 'nhs',
    deadline: null,
    desc: 'Buy a PPC to pay a single flat fee covering all NHS prescriptions in England for 3 months or a year, saving money for people on multiple regular medications.',
    govuk_url: 'https://www.gov.uk/get-a-ppc',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to anyone in England who pays for NHS prescriptions and needs more than one item per month (3-month) or 11+ items per year (annual). Not available to those already exempt from prescription charges (e.g. UC claimants, over-60s).',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Only worthwhile if you pay for NHS prescriptions — exempt groups should not apply.' },
        { factor: 'geography', description: 'England only — prescriptions are free in Wales, Scotland and Northern Ireland.' },
      ],
      keyQuestions: [
        'Does the user currently pay for NHS prescriptions?',
        'How many prescription items do they need per month?',
        'Are they in England?',
      ],
      exclusions: ['Already exempt: UC claimant, over 60, under 16, certain conditions (diabetes, epilepsy etc.)', 'Outside England'],
      means_tested: false,
      ruleIn: ['Pays NHS prescription charges', 'Needs 2+ items/month or 11+/year', 'Lives in England'],
      ruleOut: ['Already exempt from prescription charges', 'Lives outside England'],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://services.nhsbsa.nhs.uk/buy-prescription-prepayment-certificate/start',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check user is not already exempt from prescription charges',
        'Calculate whether a PPC is cost-effective based on prescription frequency',
        'Guide user to buy online or via pharmacy',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'annual',
      rates: { annual_cert: 111.60, three_month_cert: 31.25, single_item: 9.90 },
      source: 'https://www.gov.uk/get-a-ppc',
    },
  },

  // ─── EMPLOYMENT & TRIBUNALS ────────────────────────────────────────────────

  'acas-early-conciliation': {
    id: 'acas-early-conciliation', name: 'ACAS early conciliation', dept: 'Acas', deptKey: 'other',
    deadline: '3 months minus 1 day from incident',
    desc: 'Mandatory pre-tribunal step for most employment disputes; a free Acas conciliation service that tries to resolve disputes before a tribunal claim is lodged.',
    govuk_url: 'https://www.gov.uk/contact-acas',
    serviceType: 'legal_process',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required before submitting most employment tribunal claims. Free to use. A conciliator contacts both parties to try to reach a settlement. If no settlement is reached, Acas issues an EC certificate needed to proceed to tribunal.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Must have an employment dispute such as unfair dismissal, discrimination, unpaid wages or unlawful deduction.' },
      ],
      keyQuestions: [
        'What is the nature of the employment dispute?',
        'When did the incident or dismissal occur?',
        'Is the claimant within the 3-month time limit?',
      ],
      means_tested: false,
      ruleIn: ['Employment dispute within 3 months', 'Intending to make a tribunal claim'],
      ruleOut: ['Outside 3-month time limit (unless exceptional circumstances)'],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.acas.org.uk/early-conciliation',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the nature and date of the dispute',
        'Advise that notification must be submitted within 3 months minus 1 day',
        'Explain what happens during conciliation',
        'Help user complete the Acas early conciliation notification form',
      ],
    },
  },

  'hmcts-employment-tribunal': {
    id: 'hmcts-employment-tribunal', name: 'Employment Tribunal claim', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: '3 months minus 1 day from incident',
    desc: 'Make a formal claim to an Employment Tribunal for unfair dismissal, discrimination, unpaid wages or other employment rights violations.',
    govuk_url: 'https://www.gov.uk/employment-tribunals',
    serviceType: 'legal_process',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'Anyone can make a claim to an Employment Tribunal for a qualifying employment rights violation. Must have gone through Acas early conciliation first (in most cases). Time limit is 3 months minus 1 day from the act complained of.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Must have an employment dispute — unfair dismissal requires at least 2 years\' service; discrimination claims have no service requirement.' },
        { factor: 'dependency', description: 'Must have an Acas EC certificate (early conciliation must be attempted first).' },
      ],
      keyQuestions: [
        'Has the user completed Acas early conciliation?',
        'Do they have their Acas EC certificate reference number?',
        'What type of claim are they making?',
      ],
      exclusions: ['No Acas EC certificate (early conciliation not completed)', 'Out of time — more than 3 months since incident'],
      means_tested: false,
      ruleIn: ['Has Acas EC certificate', 'Within 3-month time limit', 'Employment dispute'],
      ruleOut: ['Out of time', 'No Acas EC certificate'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://employmenttribunals.service.gov.uk',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm Acas early conciliation has been completed and EC certificate obtained',
        'Identify the type(s) of claim being made',
        'Check the claim is within the 3-month time limit',
        'Guide user through the online ET1 claim form',
      ],
    },
  },

  'dwp-find-a-job': {
    id: 'dwp-find-a-job', name: 'Find a Job', dept: 'DWP', deptKey: 'dwp',
    deadline: null,
    desc: 'DWP\'s free national job search service listing vacancies from thousands of employers across the UK.',
    govuk_url: 'https://www.gov.uk/find-a-job',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Free to use for anyone in the UK looking for work. Employers post vacancies directly. Jobseekers can save searches and upload CVs.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'What type of work is the user looking for?',
        'Are they willing to commute or looking for remote work?',
      ],
      means_tested: false,
      ruleIn: ['Looking for work'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://findajob.dwp.gov.uk',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Ask about job type, location and skills to narrow search',
        'Direct user to findajob.dwp.gov.uk',
        'Advise on creating a jobseeker profile to receive alerts',
      ],
    },
  },

  // ─── LEGAL, COURTS & DEBT ─────────────────────────────────────────────────

  'insolvency-bankruptcy': {
    id: 'insolvency-bankruptcy', name: 'Apply for bankruptcy', dept: 'Insolvency Service', deptKey: 'other',
    deadline: null,
    desc: 'Apply online to declare yourself bankrupt in England and Wales if you cannot pay your debts.',
    govuk_url: 'https://www.gov.uk/apply-for-bankruptcy',
    serviceType: 'legal_process',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Available to individuals in England and Wales who cannot pay their debts and owe at least £5,000. Costs £680 to apply. Bankruptcy typically lasts one year, after which most remaining debts are written off.',
      universal: false,
      criteria: [
        { factor: 'asset', description: 'Debts must exceed assets and the person must be unable to pay debts as they fall due.' },
        { factor: 'geography', description: 'Must live or have a business in England or Wales.' },
      ],
      keyQuestions: [
        'Can the user pay their debts as they fall due?',
        'Do they own property or significant assets?',
        'Have they considered a Debt Relief Order (if debts under £30k)?',
      ],
      exclusions: ['Already bankrupt', 'Debt under £5,000 — other options may be better', 'Significant property ownership — bankruptcy trustee may sell assets'],
      means_tested: false,
      ruleIn: ['Cannot pay debts', 'Owes £5,000+', 'England or Wales resident'],
      ruleOut: ['Debts under £5,000', 'Can pay debts with a repayment plan'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://apply-for-bankruptcy.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain consequences of bankruptcy (credit record, property, employment)',
        'Check whether DRO or IVA might be more appropriate',
        'Advise on the £680 application fee and fee waiver options',
        'Guide user through the online application',
      ],
    },
  },

  'insolvency-breathing-space': {
    id: 'insolvency-breathing-space', name: 'Breathing Space (debt respite scheme)', dept: 'Insolvency Service', deptKey: 'other',
    deadline: null,
    desc: 'A 60-day breathing space gives people with problem debt legal protection from creditor action while they get debt advice.',
    govuk_url: 'https://www.gov.uk/options-for-dealing-with-your-debts/breathing-space',
    serviceType: 'legal_process',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Available to anyone in England or Wales with problem debt who seeks help from an FCA-authorised debt adviser. The adviser must apply on the client\'s behalf. During breathing space, creditors cannot chase debts, add interest or take enforcement action.',
      universal: false,
      criteria: [
        { factor: 'residency', description: 'Must be an individual in England or Wales (not companies).' },
        { factor: 'income', description: 'Must have problem debt and be seeking professional debt advice.' },
        { factor: 'dependency', description: 'Must engage with an FCA-authorised debt advice provider who applies on the person\'s behalf.' },
      ],
      keyQuestions: [
        'Is the user in England or Wales?',
        'Are they working with a debt adviser?',
        'Are creditors actively pursuing them?',
      ],
      exclusions: ['Already in an insolvency procedure', 'Had a breathing space in the last 12 months'],
      means_tested: false,
      ruleIn: ['Problem debt', 'England or Wales resident', 'Engaging with debt adviser'],
      ruleOut: ['Already in insolvency', 'Had breathing space in last 12 months'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/options-for-dealing-with-your-debts/breathing-space',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Explain that a debt adviser (not the individual) must apply for breathing space',
        'Direct to free debt advice services (StepChange, National Debtline, Citizens Advice)',
        'Explain what protections breathing space provides',
      ],
    },
  },

  'insolvency-dro': {
    id: 'insolvency-dro', name: 'Debt Relief Order (DRO)', dept: 'Insolvency Service', deptKey: 'other',
    deadline: null,
    desc: 'A low-cost insolvency option for people with debts under £30,000, little surplus income and few assets.',
    govuk_url: 'https://www.gov.uk/options-for-dealing-with-your-debts/debt-relief-orders',
    serviceType: 'legal_process',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Available in England and Wales for people with qualifying debt levels (under £30,000), low surplus income (under £75/month) and few assets (under £2,000, excluding a vehicle up to £4,000). Costs £90. Must apply through an authorised debt adviser.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Surplus income after essential expenses must be under £75/month.' },
        { factor: 'asset', description: 'Total assets must be worth under £2,000.' },
        { factor: 'dependency', description: 'Debts must be under £30,000 and must apply through an authorised intermediary.' },
        { factor: 'residency', description: 'Must live or have been living in England or Wales.' },
      ],
      keyQuestions: [
        'What is the user\'s total debt?',
        'What are their monthly surplus income and total assets?',
        'Have they previously had a DRO or been bankrupt?',
      ],
      exclusions: ['Debts over £30,000', 'Surplus income over £75/month', 'Assets over £2,000', 'Not eligible if homeowner'],
      means_tested: true,
      ruleIn: ['Debts under £30,000', 'Surplus income under £75/month', 'Assets under £2,000'],
      ruleOut: ['Debts over £30,000', 'Assets over £2,000 (excluding car up to £4,000)', 'Homeowner'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://apply-for-debt-relief-order.service.gov.uk',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check the three qualifying thresholds (debt, income, assets)',
        'Advise that an authorised intermediary must be used to apply',
        'Direct to approved DRO intermediaries (StepChange, Citizens Advice)',
      ],
    },
  },

  'hmcts-money-claims': {
    id: 'hmcts-money-claims', name: 'Money Claims Online', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: '6 years from debt arising',
    desc: 'Make a court claim online to recover money owed (up to £100,000) through the small claims or fast-track court process.',
    govuk_url: 'https://www.gov.uk/make-court-claim-for-money',
    serviceType: 'legal_process',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Anyone can use Money Claims Online to pursue a debt through the civil courts. Claims up to £10,000 are usually handled in the small claims track. Filing fees range from £35 to £455 depending on claim value.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'How much money is owed?',
        'Does the user have evidence of the debt (contract, invoices, correspondence)?',
        'Has the user sent a formal letter before action?',
      ],
      means_tested: false,
      ruleIn: ['Money owed by another party', 'Within 6-year limitation period'],
      ruleOut: ['Claim over £100,000 (use paper form instead)', 'Claim is statute-barred (over 6 years old)'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.moneyclaims.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Advise sending a formal letter before action first',
        'Calculate the filing fee based on claim value',
        'Explain small claims, fast track and multi-track thresholds',
        'Guide user through the online claim form',
      ],
    },
  },

  'hmcts-court-fines': {
    id: 'hmcts-court-fines', name: 'Pay a court fine', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'Pay a magistrates court fine online using your payment reference from the court.',
    govuk_url: 'https://www.gov.uk/pay-court-fine-online',
    serviceType: 'obligation',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Anyone who has received a fine from a magistrates court and has a payment reference number can pay online.',
      universal: true,
      criteria: [],
      keyQuestions: ['Does the user have their court fine reference number?'],
      means_tested: false,
      ruleIn: ['Has a court fine with a reference number'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/pay-court-fine-online',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Ask for the fine reference number from the court notice',
        'Direct user to the online payment service',
        'Advise on payment plan options if unable to pay in full',
      ],
    },
  },

  'hmcts-tax-tribunal': {
    id: 'hmcts-tax-tribunal', name: 'Appeal to Tax Tribunal', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: '30 days from HMRC decision',
    desc: 'Appeal an HMRC tax decision to the independent First-tier Tribunal (Tax Chamber) if HMRC\'s review has not resolved the dispute.',
    govuk_url: 'https://www.gov.uk/tax-tribunal',
    serviceType: 'legal_process',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'Available to anyone who has received a decision from HMRC (on income tax, VAT, PAYE, penalties, etc.) and disagrees with it. Must appeal within 30 days of the HMRC review conclusion. No filing fee for most tax appeals.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must have received a formal decision from HMRC and exercised the right to request HMRC review first (in most cases).' },
      ],
      keyQuestions: [
        'Has HMRC issued a formal decision letter?',
        'Has the user already asked for an HMRC review?',
        'Is the appeal within the 30-day deadline?',
      ],
      means_tested: false,
      ruleIn: ['Received HMRC decision', 'Within 30-day appeal window', 'Disagrees with HMRC assessment'],
      ruleOut: ['Out of time — more than 30 days since decision'],
    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/tax-tribunal',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the 30-day deadline has not passed',
        'Advise on whether HMRC review was completed first',
        'Guide user through the online appeal form (T240)',
      ],
    },
  },

  'hmcts-immigration-tribunal': {
    id: 'hmcts-immigration-tribunal', name: 'Appeal to Immigration Tribunal', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: '14 days (in-country) / 28 days (out of country)',
    desc: 'Challenge an immigration or asylum refusal before the independent First-tier Tribunal (Immigration and Asylum Chamber).',
    govuk_url: 'https://www.gov.uk/immigration-asylum-tribunal',
    serviceType: 'legal_process',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'Available to people who have received an immigration or asylum decision from the Home Office that carries a right of appeal. Must be filed within 14 days if in the UK, or 28 days if outside the UK.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Must have received a Home Office refusal that explicitly grants a right of appeal.' },
      ],
      keyQuestions: [
        'Does the refusal letter state there is a right of appeal?',
        'Is the user currently in the UK or outside?',
        'Is the appeal within the time limit?',
      ],
      means_tested: false,
      ruleIn: ['Home Office refusal with right of appeal', 'Within appeal time limit'],
      ruleOut: ['No right of appeal stated', 'Out of time'],
    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/immigration-asylum-tribunal',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the refusal letter grants a right of appeal',
        'Check whether the appeal deadline has passed',
        'Advise on in-country vs out-of-country deadline',
        'Guide user to the appeal form (IAFT-1)',
      ],
    },
  },

  'pins-planning-appeal': {
    id: 'pins-planning-appeal', name: 'Appeal a planning decision', dept: 'Planning Inspectorate', deptKey: 'other',
    deadline: '12 weeks from decision (householder)',
    desc: 'Challenge a local planning authority\'s decision to refuse planning permission, or failure to decide within time, through the Planning Inspectorate.',
    govuk_url: 'https://www.gov.uk/appeal-planning-decision',
    serviceType: 'legal_process',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Available to anyone who has had a planning application refused by their local council, or where the council failed to decide within the statutory timeframe. Time limits vary by appeal type (12 weeks for householder appeals, 6 months for most others).',
      universal: false,
      criteria: [
        { factor: 'property', description: 'Must have made a planning application that was refused or not decided in time.' },
        { factor: 'geography', description: 'England only — Scotland and Wales have separate processes.' },
      ],
      keyQuestions: [
        'What was the planning decision and when was it made?',
        'What type of development was applied for?',
        'Is the appeal within the relevant time limit?',
      ],
      means_tested: false,
      nations: ['england'],
      ruleIn: ['Planning application refused', 'Within appeal time limit', 'England'],
      ruleOut: ['Outside England', 'Out of time'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/appeal-planning-decision',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Identify the type of planning appeal and applicable time limit',
        'Explain the grounds for appeal',
        'Guide user through the Planning Inspectorate online appeals service',
      ],
    },
  },

  'hmcts-unclaimed-court-money': {
    id: 'hmcts-unclaimed-court-money', name: 'Find unclaimed court money', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'Search for money held in court trust accounts that may be owed to you from old court cases or unclaimed damages.',
    govuk_url: 'https://www.gov.uk/find-unclaimed-court-money',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Anyone can search for unclaimed money held by HMCTS from court cases — for example, where damages were awarded but never collected, or where a case was settled.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'Was the user a party to a court case?',
        'Approximately when did the case take place?',
      ],
      means_tested: false,
      ruleIn: ['Possible unclaimed money from a court case'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://find-unclaimed-court-money.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Search the register using the user\'s name and case details',
        'Advise on how to claim funds if found',
      ],
    },
  },

  'hmcts-jury-summons': {
    id: 'hmcts-jury-summons', name: 'Respond to a jury summons', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: 'As stated on summons',
    desc: 'Reply to a jury service summons — confirm attendance, defer or apply for excusal online.',
    govuk_url: 'https://www.gov.uk/jury-service',
    serviceType: 'obligation',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Anyone on the electoral register aged 18–75 can be called for jury service. Recipients of a jury summons must respond within the timeframe on the notice. You may be able to defer or be excused in certain circumstances.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'When is the jury service date?',
        'Does the user have grounds to defer or be excused (e.g. health, caring responsibilities)?',
      ],
      means_tested: false,
      ruleIn: ['Received a jury summons'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/respond-jury-summons',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm receipt of summons and response deadline',
        'Check whether grounds exist to defer or be excused',
        'Guide user to respond online using the jury summons number',
      ],
    },
  },

  'hmpps-prison-visits': {
    id: 'hmpps-prison-visits', name: 'Visit someone in prison', dept: 'HMPPS', deptKey: 'other',
    deadline: null,
    desc: 'Book a visit to a prisoner in England and Wales online through the prison visits service.',
    govuk_url: 'https://www.gov.uk/prison-visits',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Family members and friends of prisoners can book visits. The prisoner must first add the visitor to their approved visitor list. ID may be required.',
      universal: false,
      criteria: [
        { factor: 'family', description: 'Visitor must be approved by the prisoner and added to their visitor list.' },
      ],
      keyQuestions: [
        'Is the visitor on the prisoner\'s approved list?',
        'Which prison is the person being visited held in?',
      ],
      means_tested: false,
      ruleIn: ['On prisoner\'s approved visitor list', 'Person in prison in England or Wales'],
      ruleOut: ['Not on approved visitor list'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/prison-visits',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the visitor is on the prisoner\'s approved list',
        'Identify the prison and available visiting times',
        'Guide user to book online',
      ],
    },
  },

  'opg-lpa-refund': {
    id: 'opg-lpa-refund', name: 'Claim a Power of Attorney registration refund', dept: 'OPG', deptKey: 'opg',
    deadline: null,
    desc: 'Claim a refund if you paid too much to register a Lasting or Enduring Power of Attorney between 1 April 2013 and 31 March 2017.',
    govuk_url: 'https://www.gov.uk/claim-power-of-attorney-refund',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to those who paid to register an LPA or EPA with the OPG between April 2013 and March 2017, when registration fees were set above the cost of the service. Refunds were ordered following a court ruling.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must have paid to register a Lasting or Enduring Power of Attorney between 1 April 2013 and 31 March 2017.' },
      ],
      keyQuestions: [
        'Did the user or someone they represent register an LPA/EPA between 2013 and 2017?',
        'Do they have the LPA reference number?',
      ],
      means_tested: false,
      ruleIn: ['Registered LPA or EPA between April 2013 and March 2017'],
      ruleOut: ['LPA registered before April 2013 or after March 2017'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://claim-power-of-attorney-refund.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check whether the LPA/EPA was registered in the qualifying period',
        'Locate the LPA reference number',
        'Guide user through the online refund claim form',
      ],
    },
  },

  // ─── PROPERTY & HOUSING ────────────────────────────────────────────────────

  'lr-property-search': {
    id: 'lr-property-search', name: 'Search for property information', dept: 'Land Registry', deptKey: 'lr',
    deadline: null,
    desc: 'Search HM Land Registry for property title register, ownership details and boundary plans for any registered property in England and Wales.',
    govuk_url: 'https://www.gov.uk/search-property-information-land-registry',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Anyone can search the Land Registry for information on registered properties in England and Wales. A fee of £3 applies for each title register viewed. Useful when buying a property or checking ownership.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'What is the full address of the property?',
        'Is the user buying, selling or just checking ownership?',
      ],
      means_tested: false,
      ruleIn: ['Interested in a registered property in England or Wales'],
      ruleOut: ['Property in Scotland (Registers of Scotland) or Northern Ireland (LPSNI)'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://use-land-property-data.service.gov.uk/datasets',
      onlineFormUrl: 'https://search-property-information.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Search by address to find the title number',
        'Retrieve title register showing ownership, charges and restrictive covenants',
        'Summarise key details for the user',
      ],
    },
  },

  'mhclg-epc': {
    id: 'mhclg-epc', name: 'Find an Energy Performance Certificate', dept: 'MHCLG', deptKey: 'other',
    deadline: null,
    desc: 'Search for an existing Energy Performance Certificate (EPC) for a property, or commission a new one — required when selling or letting.',
    govuk_url: 'https://www.gov.uk/find-energy-certificate',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'EPCs are required by law when a property is sold or let. Buyers, tenants and homeowners can search the register for free. Landlords renting property in England and Wales must have an EPC rating of E or above.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'Is the user buying, selling, renting or checking their own property?',
        'Is there already a valid EPC (valid for 10 years)?',
      ],
      means_tested: false,
      ruleIn: ['Buying, selling or letting a property'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://epc.opendatacommunities.org/docs/api',
      onlineFormUrl: 'https://find-energy-certificate.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Search the EPC register by address',
        'Report the energy rating and key recommendations',
        'Advise if the EPC has expired or does not exist (new one needed)',
      ],
    },
  },

  'lr-sign-mortgage-deed': {
    id: 'lr-sign-mortgage-deed', name: 'Sign your mortgage deed', dept: 'Land Registry', deptKey: 'lr',
    deadline: null,
    desc: 'Sign your mortgage deed electronically via HM Land Registry\'s digital mortgage service, replacing the need for a wet signature on a paper deed.',
    govuk_url: 'https://www.gov.uk/guidance/sign-your-mortgage-deed',
    serviceType: 'obligation',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'Available to borrowers remortgaging or purchasing a property where the lender uses the Land Registry digital mortgage service. Requires a GOV.UK One Login account to verify identity before signing.',
      universal: false,
      criteria: [
        { factor: 'property', description: 'Lender must participate in the Land Registry digital mortgage service.' },
      ],
      keyQuestions: [
        'Has the lender sent a link to sign the mortgage deed digitally?',
        'Does the borrower have a GOV.UK One Login account?',
      ],
      means_tested: false,
      ruleIn: ['Lender uses digital mortgage service', 'Mortgage offer received'],
      ruleOut: ['Lender does not support digital signing — paper deed required'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/guidance/sign-your-mortgage-deed',
      authRequired: 'gov-uk-one-login',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Confirm whether the lender participates in the digital mortgage service',
        'Advise borrower to check their email for the signing link from Land Registry',
        'Guide user through GOV.UK One Login identity verification if needed',
      ],
    },
  },

  'llc-local-land-charges': {
    id: 'llc-local-land-charges', name: 'Local land charges search', dept: 'Land Registry', deptKey: 'lr',
    deadline: null,
    desc: 'Search for local land charges on a property — planning restrictions, tree preservation orders, smoke control zones and other charges registered by local authorities.',
    govuk_url: 'https://www.gov.uk/search-local-land-charges',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Anyone can search for local land charges on a property in England. The search is typically done as part of property conveyancing. Fees apply and vary by local authority.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'Is the user in the process of buying a property?',
        'What is the full address of the property?',
      ],
      means_tested: false,
      nations: ['england'],
      ruleIn: ['Buying a property in England'],
      ruleOut: ['Property in Wales, Scotland or Northern Ireland (different process)'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://search-local-land-charges.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the property address',
        'Explain that this is typically part of the conveyancing solicitor\'s work',
        'Guide user to search online or via their solicitor',
      ],
    },
  },

  'ea-flood-risk': {
    id: 'ea-flood-risk', name: 'Check long-term flood risk', dept: 'Environment Agency', deptKey: 'other',
    deadline: null,
    desc: 'Check whether a property in England is at risk of flooding from rivers, the sea or surface water using the Environment Agency\'s official flood risk tool.',
    govuk_url: 'https://www.gov.uk/check-long-term-flood-risk',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Free service available to anyone checking a property address in England. Results show flood risk from rivers and the sea, surface water, groundwater and reservoirs.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'What is the address of the property being checked?',
        'Is the user buying, insuring or just curious about the risk?',
      ],
      means_tested: false,
      nations: ['england'],
      ruleIn: ['Property in England'],
      ruleOut: ['Property outside England — different services in Wales, Scotland, NI'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://check-long-term-flood-risk.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Search by postcode or address',
        'Report the flood risk rating and types of flood risk',
        'Advise on flood insurance implications if risk is high',
      ],
    },
  },

  'voa-council-tax-band': {
    id: 'voa-council-tax-band', name: 'Check or challenge your council tax band', dept: 'Valuation Office Agency', deptKey: 'other',
    deadline: null,
    desc: 'Check the council tax band for any property in England and Wales, and challenge your band if you believe it is wrong.',
    govuk_url: 'https://www.gov.uk/council-tax-bands',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Anyone can check any property\'s council tax band for free. Property owners and tenants can challenge their band if they have evidence it is incorrectly assessed, for example if similar nearby properties are in a lower band.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'Does the user believe their council tax band is too high?',
        'What bands are similar properties on the same street in?',
      ],
      means_tested: false,
      ruleIn: ['Living in or buying a property', 'Council tax band may be wrong'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/council-tax-bands',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Look up the council tax band for the property',
        'Compare with bands for similar neighbouring properties',
        'Advise on whether to make a formal challenge to the VOA',
      ],
    },
  },

  'voa-business-rates': {
    id: 'voa-business-rates', name: 'Check and challenge business rates', dept: 'Valuation Office Agency', deptKey: 'other',
    deadline: null,
    desc: 'Check your business property\'s rateable value and challenge it if incorrect through the Check, Challenge and Appeal process.',
    govuk_url: 'https://www.gov.uk/correct-your-business-rates',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Available to business ratepayers in England who believe their property\'s rateable value on the rating list is incorrect. The Check, Challenge, Appeal process requires a business rates account.',
      universal: false,
      criteria: [
        { factor: 'property', description: 'Must occupy or own a non-domestic property assessed for business rates in England.' },
      ],
      keyQuestions: [
        'What is the rateable value on the current bill?',
        'When was the current rating list compiled?',
      ],
      means_tested: false,
      nations: ['england'],
      ruleIn: ['Business ratepayer in England', 'Believes rateable value is wrong'],
      ruleOut: ['Property in Wales (separate process)', 'No business rates liability'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/correct-your-business-rates',
      authRequired: 'government-gateway',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Look up the property\'s current rateable value on the VOA website',
        'Explain the Check, Challenge, Appeal process',
        'Advise on small business rate relief if the rateable value is low',
      ],
    },
  },

  // ─── IMMIGRATION (ADDITIONAL ROUTES) ─────────────────────────────────────

  'ho-evisa': {
    id: 'ho-evisa', name: 'Get access to your eVisa', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Create a UKVI account to access your eVisa — the digital immigration status that has replaced the physical Biometric Residence Permit for most visa holders.',
    govuk_url: 'https://www.gov.uk/get-access-evisa',
    serviceType: 'document',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Required for most non-British, non-Irish nationals who have permission to stay in the UK. The eVisa is linked to your passport and UKVI account and proves your right to work, rent and access services.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Must have leave to remain in the UK (visa or settlement).' },
      ],
      keyQuestions: [
        'Does the user currently hold a Biometric Residence Permit or vignette stamp?',
        'Have they already created a UKVI account?',
      ],
      means_tested: false,
      ruleIn: ['Has leave to remain in the UK', 'Non-British, non-Irish national'],
      ruleOut: ['British or Irish citizen — no eVisa needed'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/sort/start/sar_in_uk',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the user has leave to remain in the UK',
        'Check whether they have already created a UKVI account',
        'Guide through UKVI account creation and linking their passport',
        'Advise on keeping passport details up to date',
      ],
    },
  },

  'ho-view-immigration-status': {
    id: 'ho-view-immigration-status', name: 'View or prove your immigration status', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'View your immigration status online and generate a share code to prove your right to work, rent or access services to employers and landlords.',
    govuk_url: 'https://www.gov.uk/view-prove-immigration-status',
    serviceType: 'document',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Available to non-British, non-Irish nationals with a UKVI account and eVisa. A share code is valid for 90 days and lets employers and landlords verify your status without seeing your personal details.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Must have a UKVI account with an eVisa or EU Settlement Scheme status.' },
      ],
      keyQuestions: [
        'Does the user have a UKVI account?',
        'Is the share code for a right-to-work or right-to-rent check?',
      ],
      means_tested: false,
      ruleIn: ['Has UKVI account with eVisa or EUSS status'],
      ruleOut: ['British or Irish citizen', 'No UKVI account'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://view-immigration-status.service.gov.uk/status',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user has a UKVI account',
        'Generate a share code for the employer or landlord',
        'Explain the share code is valid for 90 days',
      ],
    },
  },

  'ho-skilled-worker-visa': {
    id: 'ho-skilled-worker-visa', name: 'Skilled Worker visa', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Apply for a Skilled Worker visa to work in the UK for an employer licensed by the Home Office as a visa sponsor.',
    govuk_url: 'https://www.gov.uk/skilled-worker-visa',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to people outside the UK (or switching from another visa in the UK) who have a job offer from a licensed UK employer. The role must be at RQF Level 3 or above, meet the salary threshold (generally £38,700/year or the relevant going rate), and the employer must issue a Certificate of Sponsorship.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Must have a confirmed job offer from a Home Office licensed sponsor at RQF Level 3+ and meeting the salary threshold.' },
        { factor: 'immigration', description: 'Must not have conditions that prevent applying for this visa.' },
      ],
      keyQuestions: [
        'Does the employer hold a Home Office sponsor licence?',
        'Does the role meet the skill and salary thresholds?',
        'Has the employer issued a Certificate of Sponsorship (CoS) reference number?',
      ],
      means_tested: false,
      ruleIn: ['Job offer from licensed UK sponsor', 'Role at RQF Level 3+', 'Meets salary threshold (£38,700 or going rate)'],
      ruleOut: ['Employer not a licensed sponsor', 'Role below skill or salary threshold', 'British or Irish citizen — no visa needed'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/skilled-worker-visa/apply',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the employer holds a sponsor licence',
        'Check the role meets salary and skill thresholds',
        'Locate the Certificate of Sponsorship reference number',
        'Guide through the visa application process and fee',
      ],
    },
  },

  'ho-student-visa': {
    id: 'ho-student-visa', name: 'Student visa', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Apply for a Student visa to study at a UK university or college with a Student sponsor licence (formerly Tier 4).',
    govuk_url: 'https://www.gov.uk/student-visa',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to international students aged 16 or over who have an unconditional offer from a UK educational institution with a Student sponsor licence. Must demonstrate English language proficiency and sufficient funds to support themselves.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Must be a non-British, non-Irish national without leave to remain that covers the course.' },
        { factor: 'dependency', description: 'Must have a Confirmation of Acceptance for Studies (CAS) from a licensed student sponsor.' },
      ],
      keyQuestions: [
        'Has the educational institution provided a Confirmation of Acceptance for Studies (CAS)?',
        'Does the student meet English language requirements?',
        'Do they have sufficient funds (living costs + tuition)?',
      ],
      means_tested: false,
      ruleIn: ['CAS from licensed UK educational institution', 'Aged 16+', 'Meets English language requirement'],
      ruleOut: ['British or Irish citizen', 'No CAS number', 'Insufficient funds'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/student-visa/apply',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the educational institution is a licensed sponsor',
        'Check CAS number and check all details match',
        'Verify English language test scores meet requirements',
        'Guide through visa application and biometric appointment',
      ],
    },
  },

  'ho-fee-waiver': {
    id: 'ho-fee-waiver', name: 'Immigration fee waiver', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Apply for a waiver of Home Office immigration or nationality fees if you cannot afford to pay.',
    govuk_url: 'https://www.gov.uk/immigration-asylum-tribunal/fee-waiver',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to people applying for leave to remain or British citizenship who cannot afford the application fee. Must demonstrate financial need. The fee waiver does not apply to all visa categories.',
      universal: false,
      criteria: [
        { factor: 'income', description: 'Must demonstrate that payment of the visa fee would leave you (or your family) destitute or at risk of destitution.' },
        { factor: 'immigration', description: 'Must be applying for a qualifying leave to remain or citizenship application.' },
      ],
      keyQuestions: [
        'What type of immigration application is being made?',
        'Can the user demonstrate financial hardship?',
      ],
      means_tested: true,
      ruleIn: ['Applying for leave to remain or citizenship', 'Cannot afford the fee'],
      ruleOut: ['Applying for entry clearance from abroad', 'Can afford the fee'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-for-fee-waiver-immigration-application',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check the visa type is eligible for a fee waiver',
        'Help gather evidence of financial hardship',
        'Guide through the fee waiver application before submitting the main visa application',
      ],
    },
  },

  'ho-immigration-appeal': {
    id: 'ho-immigration-appeal', name: 'Appeal a visa or immigration decision', dept: 'Home Office', deptKey: 'ho',
    deadline: '14 days (in-country) / 28 days (out of country)',
    desc: 'Challenge a Home Office refusal of a visa, leave to remain or human rights application at the First-tier Tribunal (Immigration and Asylum Chamber).',
    govuk_url: 'https://www.gov.uk/immigration-asylum-tribunal',
    serviceType: 'legal_process',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'Available to people who have received a Home Office refusal that carries an in-country right of appeal. Not all decisions carry appeal rights. Must appeal within 14 days if in the UK or 28 days if outside.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Must have received an immigration decision from the Home Office that specifically grants a right of appeal.' },
      ],
      keyQuestions: [
        'Does the refusal letter state there is a right of appeal?',
        'Is the user in the UK or outside?',
        'When was the refusal letter dated?',
      ],
      means_tested: false,
      ruleIn: ['Refused decision with right of appeal', 'Within time limit'],
      ruleOut: ['No right of appeal stated in refusal', 'Out of time'],
    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/immigration-asylum-tribunal',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check the refusal letter for the right of appeal and deadline',
        'Strongly recommend seeking immigration legal advice',
        'Explain the tribunal process and options',
      ],
    },
  },

  'ho-euss-enquiry': {
    id: 'ho-euss-enquiry', name: 'EUSS status enquiry', dept: 'Home Office', deptKey: 'ho',
    deadline: null,
    desc: 'Contact the Home Office about a problem with your EU Settlement Scheme application, status or digital profile.',
    govuk_url: 'https://www.gov.uk/contact-ukvi-inside-outside-uk',
    serviceType: 'application',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'Available to EU, EEA and Swiss nationals (and their family members) who have issues with their EUSS application or settled/pre-settled status, such as a certificate of application not arriving, needing to update personal details, or status not showing correctly.',
      universal: false,
      criteria: [
        { factor: 'immigration', description: 'Must have applied to or been granted status under the EU Settlement Scheme.' },
      ],
      keyQuestions: [
        'What specific problem does the user have with their EUSS status?',
        'Do they have their EUSS application reference number?',
      ],
      means_tested: false,
      ruleIn: ['EU/EEA/Swiss national or family member with EUSS application or status'],
      ruleOut: ['Never applied to EUSS'],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/contact-ukvi-inside-outside-uk',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Identify the specific EUSS issue',
        'Direct to the EUSS resolution centre or UKVI contact form',
        'Advise on free immigration advice from the EUSS Settlement Resolution Centre',
      ],
    },
  },

  // ─── VEHICLES & DRIVING ────────────────────────────────────────────────────

  'dvla-vehicle-enquiry': {
    id: 'dvla-vehicle-enquiry', name: 'Vehicle Enquiry Service', dept: 'DVLA', deptKey: 'dvla',
    deadline: null,
    desc: 'Check the MOT status, vehicle tax and basic registered details of any UK vehicle by its registration number.',
    govuk_url: 'https://www.gov.uk/get-vehicle-information-from-dvla',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Free service available to anyone with a UK vehicle registration number. Shows whether the vehicle has a current MOT, is taxed, the colour, fuel type and year of manufacture.',
      universal: true,
      criteria: [],
      keyQuestions: ['What is the vehicle registration number?'],
      means_tested: false,
      ruleIn: ['Has a vehicle registration number to check'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer-portal.driver-vehicle-licensing.api.gov.uk/apis/vehicle-enquiry-service/vehicle-enquiry-service-description.html',
      onlineFormUrl: 'https://vehicleenquiry.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Look up the vehicle registration number in the DVLA database',
        'Report MOT status, tax status and basic vehicle details',
      ],
    },
  },

  'dvsa-mot-history': {
    id: 'dvsa-mot-history', name: 'Check MOT history', dept: 'DVSA', deptKey: 'dvsa',
    deadline: null,
    desc: 'View the complete MOT test history of any vehicle — past pass/fail results, mileage at each test and advisory notices.',
    govuk_url: 'https://www.gov.uk/check-mot-history',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Free service for any vehicle that has had an MOT in Great Britain. Useful when buying a used car to check for recurrent failures or odometer discrepancies.',
      universal: true,
      criteria: [],
      keyQuestions: ['What is the vehicle registration number?'],
      means_tested: false,
      ruleIn: ['Has a UK vehicle registration number'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://dvsa.github.io/mot-history-api-documentation/',
      onlineFormUrl: 'https://www.check-mot.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Look up the vehicle registration number',
        'Report the MOT history, flagging any patterns of failure or mileage anomalies',
      ],
    },
  },

  'dvla-change-address-v5c': {
    id: 'dvla-change-address-v5c', name: 'Update V5C logbook address', dept: 'DVLA', deptKey: 'dvla',
    deadline: null,
    desc: 'Update the address on your vehicle\'s V5C registration certificate (logbook) after moving house.',
    govuk_url: 'https://www.gov.uk/change-address-v5c',
    serviceType: 'obligation',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Anyone who is the registered keeper of a vehicle and has moved house must update the V5C address. Can be done online if you have the 11-digit document reference number from the V5C.',
      universal: false,
      criteria: [
        { factor: 'property', description: 'Must be the registered keeper of the vehicle and have moved to a new address.' },
      ],
      keyQuestions: [
        'Does the user have the V5C document reference number?',
        'What is the new address?',
      ],
      means_tested: false,
      ruleIn: ['Moved house', 'Registered keeper of a vehicle'],
      ruleOut: ['Not the registered keeper'],
    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/change-address-v5c',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm user has V5C document reference number (11 digits from top of logbook)',
        'Guide through online address update',
        'Advise that a new V5C will be sent to the new address',
      ],
    },
  },

  'jaqu-clean-air-zone': {
    id: 'jaqu-clean-air-zone', name: 'Check and pay Clean Air Zone charges', dept: 'JAQU', deptKey: 'other',
    deadline: null,
    desc: 'Check if your vehicle must pay a Clean Air Zone daily charge when driving in participating cities, and pay it if required.',
    govuk_url: 'https://www.gov.uk/clean-air-zones',
    serviceType: 'obligation',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Applies to drivers of non-compliant vehicles (typically pre-Euro 6 diesel or pre-Euro 4 petrol) entering Clean Air Zones in cities such as Bath, Birmingham, Bradford and Portsmouth. Charges vary by zone and vehicle type.',
      universal: false,
      criteria: [
        { factor: 'geography', description: 'Must be driving in a city with an active Clean Air Zone.' },
      ],
      keyQuestions: [
        'Is the user planning to drive in a CAZ city?',
        'What is their vehicle registration and fuel type?',
      ],
      means_tested: false,
      ruleIn: ['Driving in a Clean Air Zone city', 'Vehicle does not meet emission standards'],
      ruleOut: ['Exempt vehicle (electric, hydrogen, certain hybrids)', 'Not driving in a CAZ'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/drive-in-a-clean-air-zone',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Check vehicle registration against the national CAZ vehicle checker',
        'Identify which zones apply and the daily charge',
        'Direct user to pay or check exemption',
      ],
    },
  },

  'dvla-check-driving-licence': {
    id: 'dvla-check-driving-licence', name: 'View and share driving licence', dept: 'DVLA', deptKey: 'dvla',
    deadline: null,
    desc: 'View your full driving record online and generate a check code to share it with employers or car hire companies.',
    govuk_url: 'https://www.gov.uk/view-driving-licence',
    serviceType: 'document',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Available to any UK driving licence holder. Lets you see your entitlements, any penalty points, and driving test passes. Generates a one-time check code valid for 21 days.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must hold a UK driving licence.' },
      ],
      keyQuestions: ['Does the user hold a UK driving licence?'],
      means_tested: false,
      ruleIn: ['UK driving licence holder'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/view-driving-licence',
      authRequired: 'government-gateway',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Direct user to the DVLA online service to generate a check code',
        'Explain that the code is valid for 21 days',
        'Advise on what information will be shared with the employer/hire company',
      ],
    },
  },

  // ─── BUSINESS (ADDITIONAL) ─────────────────────────────────────────────────

  'ch-file-accounts': {
    id: 'ch-file-accounts', name: 'File annual accounts at Companies House', dept: 'Companies House', deptKey: 'ch',
    deadline: '9 months after financial year end',
    desc: 'File your company\'s statutory annual accounts at Companies House; required for all limited companies each year.',
    govuk_url: 'https://www.gov.uk/file-your-company-annual-accounts',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'All limited companies incorporated in the UK must file annual accounts at Companies House within 9 months of their financial year end. Small companies may file abridged or micro-entity accounts.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must be an officer of a UK limited company (Ltd or PLC).' },
      ],
      keyQuestions: [
        'When does the company\'s financial year end?',
        'Does the company qualify as small, micro-entity or dormant?',
      ],
      means_tested: false,
      ruleIn: ['UK limited company registered at Companies House'],
      ruleOut: ['Sole trader or partnership — not required to file at Companies House'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://developer.company-information.service.gov.uk/overview',
      onlineFormUrl: 'https://www.gov.uk/file-your-company-annual-accounts',
      authRequired: 'companies-house',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check the filing deadline from the company\'s confirmation statement',
        'Determine which accounts format applies (micro, small, full)',
        'Guide user to the Companies House WebFiling service',
        'Warn of £150–£1,500 late filing penalties',
      ],
    },
  },

  'ch-confirmation-statement': {
    id: 'ch-confirmation-statement', name: 'File a confirmation statement', dept: 'Companies House', deptKey: 'ch',
    deadline: '14 days after review period end',
    desc: 'File the annual confirmation statement (formerly annual return) confirming that company details at Companies House are up to date.',
    govuk_url: 'https://www.gov.uk/confirmation-statement',
    serviceType: 'obligation',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'All companies, LLPs and eligible partnerships registered at Companies House must file a confirmation statement at least once every 12 months. The £34 filing fee can be waived for dormant companies in some circumstances.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must be a registered company, LLP or eligible UK business entity.' },
      ],
      keyQuestions: [
        'When is the confirmation statement due?',
        'Have there been any changes to directors, shareholders or registered address?',
      ],
      means_tested: false,
      ruleIn: ['UK company or LLP registered at Companies House'],
      ruleOut: ['Sole trader or general partnership'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/confirmation-statement',
      authRequired: 'companies-house',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Check the due date from the last confirmation statement',
        'Review company details for any changes needed',
        'File via Companies House WebFiling (£34 fee)',
      ],
    },
  },

  'ch-close-company': {
    id: 'ch-close-company', name: 'Close a limited company', dept: 'Companies House', deptKey: 'ch',
    deadline: null,
    desc: 'Apply to have your company voluntarily struck off the register at Companies House (DS01), closing it down.',
    govuk_url: 'https://www.gov.uk/closing-a-limited-company',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Available to directors of a limited company that has not traded in the last 3 months, has no outstanding liabilities and has not changed its name in the last 3 months. The application is made by all directors. HMRC must be notified separately.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must be a director of a UK limited company that has not traded or otherwise been used for a purpose in the past 3 months.' },
      ],
      keyQuestions: [
        'Has the company traded in the last 3 months?',
        'Are there any outstanding debts or liabilities?',
        'Have all directors agreed to the strike-off?',
      ],
      exclusions: ['Company has outstanding debts', 'Has traded in last 3 months', 'Subject to legal proceedings'],
      means_tested: false,
      ruleIn: ['Dormant company', 'No outstanding liabilities', 'All directors agree'],
      ruleOut: ['Company has debts or liabilities', 'Traded recently'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/strike-off-your-company-from-companies-register',
      authRequired: 'companies-house',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Confirm the company is dormant and has no outstanding liabilities',
        'Remind to notify HMRC, close business bank accounts and deregister from VAT/PAYE',
        'Guide through DS01 voluntary strike-off application',
      ],
    },
  },

  'hmrc-eori': {
    id: 'hmrc-eori', name: 'Get an EORI number', dept: 'HMRC', deptKey: 'hmrc',
    deadline: null,
    desc: 'Apply for an Economic Operators Registration and Identification (EORI) number, required to import or export goods between Great Britain and the rest of the world.',
    govuk_url: 'https://www.gov.uk/eori',
    serviceType: 'registration',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Required for all UK businesses that import or export goods. Businesses with a UK VAT number can get an EORI number almost instantly online. Non-VAT-registered businesses can also apply.',
      universal: false,
      criteria: [
        { factor: 'employment', description: 'Must be a UK business intending to import or export goods.' },
      ],
      keyQuestions: [
        'Does the business have a UK VAT number?',
        'Is the business planning to import or export goods?',
      ],
      means_tested: false,
      ruleIn: ['UK business importing or exporting goods'],
      ruleOut: ['Business only provides services (no goods)', 'Not a UK-established business'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/eori',
      authRequired: 'government-gateway',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the business has a UK VAT number (speeds up the process)',
        'Guide through the online EORI application (instant for VAT-registered businesses)',
        'Advise to include the EORI on customs declarations',
      ],
    },
  },

  'ukri-find-grants': {
    id: 'ukri-find-grants', name: 'Find government grants for business', dept: 'BEIS/UKRI', deptKey: 'other',
    deadline: null,
    desc: 'Search the government\'s business finance and grant database to find funding schemes available to your business.',
    govuk_url: 'https://www.gov.uk/business-finance-support',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Free-to-search database covering grants, loans and equity finance from central and local government. Eligibility varies by scheme — most target small businesses, start-ups or specific sectors.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'What sector is the business in?',
        'How many employees and what is the annual turnover?',
        'Is the business in a particular region or local authority?',
      ],
      means_tested: false,
      ruleIn: ['Running or starting a business in the UK'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/business-finance-support',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Ask about business sector, size and location',
        'Search the grants database and summarise relevant schemes',
        'Link to individual scheme pages for application details',
      ],
    },
  },

  'co-contracts-finder': {
    id: 'co-contracts-finder', name: 'Contracts Finder', dept: 'Cabinet Office', deptKey: 'other',
    deadline: null,
    desc: 'Search and apply for government contracts and procurement opportunities published by central and local government in the UK.',
    govuk_url: 'https://www.gov.uk/contracts-finder',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Free to use for any business or organisation looking to supply goods or services to the public sector. Contracts above £12,000 (central government) or £25,000 (other public bodies) must be published here.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'What type of goods or services does the business supply?',
        'What contract value range are they interested in?',
      ],
      means_tested: false,
      ruleIn: ['Business looking to supply public sector'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: true,
      apiUrl: 'https://www.contractsfinder.service.gov.uk/apidocs/index.html',
      onlineFormUrl: 'https://www.contractsfinder.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Search by keyword, sector and contract value',
        'Summarise relevant open opportunities',
        'Explain the Find a Tender Service for contracts above £138,760',
      ],
    },
  },

  // ─── VOTING ────────────────────────────────────────────────────────────────

  'la-postal-vote': {
    id: 'la-postal-vote', name: 'Apply for a postal vote', dept: 'Local Authority', deptKey: 'la',
    deadline: '11 working days before election',
    desc: 'Apply to vote by post so your ballot is sent to your home address and returned by post or in person.',
    govuk_url: 'https://www.gov.uk/apply-postal-vote',
    serviceType: 'application',
    proactive: true,
    gated: true,
    eligibility: {
      summary: 'Available to registered voters in the UK who want to vote by post. Must apply at least 11 working days before the election. Photo ID is no longer required for postal vote applications but a National Insurance number or signature is needed.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must be registered to vote (on the electoral roll).' },
      ],
      keyQuestions: [
        'Is the user registered to vote?',
        'Is there an election coming up?',
        'Is the application within the 11-working-day deadline?',
      ],
      means_tested: false,
      ruleIn: ['Registered to vote', 'Before 11-working-day deadline'],
      ruleOut: ['Not registered to vote', 'Missed the postal vote deadline'],
    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-postal-vote',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm the user is registered to vote',
        'Check the election date and postal vote deadline',
        'Guide through the online postal vote application',
      ],
    },
  },

  'la-proxy-vote': {
    id: 'la-proxy-vote', name: 'Apply for a proxy vote', dept: 'Local Authority', deptKey: 'la',
    deadline: '6 working days before election',
    desc: 'Appoint someone you trust to vote on your behalf if you cannot get to the polling station.',
    govuk_url: 'https://www.gov.uk/apply-proxy-vote',
    serviceType: 'application',
    proactive: false,
    gated: true,
    eligibility: {
      summary: 'Available to registered voters who cannot attend a polling station on election day (due to work, illness, being abroad, disability, etc.). The proxy must be a registered UK voter. Deadline is 6 working days before the election for standard proxy; emergency proxy available up to 5pm on polling day.',
      universal: false,
      criteria: [
        { factor: 'dependency', description: 'Must be registered to vote.' },
        { factor: 'employment', description: 'Typical reasons include being at work, abroad, or unable to attend due to disability or illness.' },
      ],
      keyQuestions: [
        'Why can the user not attend the polling station?',
        'Who will be their proxy, and are they also a registered voter?',
      ],
      means_tested: false,
      ruleIn: ['Registered to vote', 'Cannot attend polling station', 'Has a trusted proxy who is a registered voter'],
      ruleOut: ['Not registered to vote', 'Proxy is not a registered voter'],
    },
    agentInteraction: {
      methods: ['online', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/apply-proxy-vote',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm reason for needing a proxy',
        'Identify a suitable proxy who is a registered UK voter',
        'Guide through the proxy vote application',
      ],
    },
  },

  // ─── DOCUMENTS & IDENTITY ─────────────────────────────────────────────────

  'hmcts-gender-recognition': {
    id: 'hmcts-gender-recognition', name: 'Apply for a Gender Recognition Certificate', dept: 'HMCTS', deptKey: 'hmcts',
    deadline: null,
    desc: 'Apply for a Gender Recognition Certificate to have your affirmed gender legally recognised in the UK.',
    govuk_url: 'https://www.gov.uk/apply-gender-recognition-certificate',
    serviceType: 'document',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Available to adults (18+) who have, or have had, gender dysphoria; have lived in their acquired gender for at least 2 years; and intend to continue living in that gender until death. Medical evidence from two healthcare professionals is required.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must be 18 or over.' },
        { factor: 'residency', description: 'Must be a UK national or permanently resident in the UK.' },
      ],
      keyQuestions: [
        'Has the applicant lived in their acquired gender for at least 2 years?',
        'Do they have a diagnosis of gender dysphoria from a UK or overseas doctor or psychologist?',
      ],
      means_tested: false,
      evidenceRequired: ['Medical reports from two registered medical practitioners', 'Statutory declaration confirming intent', 'Evidence of living in acquired gender for 2+ years'],
      ruleIn: ['Gender dysphoria diagnosis', '2+ years living in acquired gender', 'Aged 18+'],
      ruleOut: ['Under 18', 'Not a UK national or resident'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://apply-gender-recognition-certificate.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Explain the evidence requirements (two medical reports and statutory declaration)',
        'Check the 2-year living-in-acquired-gender requirement',
        'Guide through the online application',
      ],
    },
  },

  'dhsc-baby-loss-certificate': {
    id: 'dhsc-baby-loss-certificate', name: 'Request a baby loss certificate', dept: 'DHSC', deptKey: 'other',
    deadline: null,
    desc: 'Request a certificate in memory of your baby if your pregnancy ended before 24 weeks gestation.',
    govuk_url: 'https://www.gov.uk/request-baby-loss-certificate',
    serviceType: 'document',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to parents who experienced the loss of a baby before 24 weeks gestation (including miscarriage and ectopic pregnancy). The certificate is not a legal document but provides official acknowledgement. Losses before 1 October 1992 can also be registered (28 weeks threshold applied then).',
      universal: false,
      criteria: [
        { factor: 'bereavement', description: 'Must have experienced pregnancy loss before 24 weeks gestation (or 28 weeks if before 1 October 1992).' },
        { factor: 'family', description: 'Must be a parent of the baby.' },
      ],
      keyQuestions: [
        'At what stage of pregnancy did the loss occur?',
        'Does the parent have details such as the date and hospital?',
      ],
      means_tested: false,
      ruleIn: ['Pregnancy loss before 24 weeks', 'Parent of the baby'],
      ruleOut: ['Loss at 24 weeks or later — registered as stillbirth under GRO'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.request-a-baby-loss-certificate.service.gov.uk/request-a-baby-loss-certificate',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Express condolences and explain the certificate sensitively',
        'Confirm the pregnancy was under 24 weeks (losses at 24+ weeks are registered as stillbirths)',
        'Guide parent through the online request',
      ],
    },
  },

  'dbs-basic-check': {
    id: 'dbs-basic-check', name: 'Basic DBS criminal record check', dept: 'DBS', deptKey: 'other',
    deadline: null,
    desc: 'Apply for a basic Disclosure and Barring Service check that shows only unspent criminal convictions — available to anyone.',
    govuk_url: 'https://www.gov.uk/request-copy-criminal-record',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Anyone can apply for a basic DBS check on themselves. Costs £18. Shows only unspent convictions. Distinct from standard and enhanced checks, which are only available for specific roles and applied for by employers.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'Does the user need a basic, standard or enhanced check?',
        'Is an employer requesting it, or is the user applying for personal purposes?',
      ],
      means_tested: false,
      ruleIn: ['Anyone aged 16+ can apply'],
      ruleOut: [],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/request-copy-criminal-record',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Clarify whether a basic, standard or enhanced check is needed',
        'Explain basic checks are self-applied; standard/enhanced are employer-led',
        'Guide user through the online application (£18 fee)',
      ],
    },
  },

  'cabinetoffice-uk-honours': {
    id: 'cabinetoffice-uk-honours', name: 'Nominate someone for a King\'s Honour', dept: 'Cabinet Office', deptKey: 'other',
    deadline: null,
    desc: 'Nominate someone for a King\'s Honour (OBE, MBE, BEM etc.) to recognise outstanding achievement or service to the community.',
    govuk_url: 'https://www.gov.uk/honours',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Anyone can nominate someone for a King\'s Honour. Honours are for exceptional achievement or service to the country. The Honours Committee decides who to recommend to the King. Nominations are considered twice a year (New Year and Birthday Honours).',
      universal: true,
      criteria: [],
      keyQuestions: [
        'What has the person done that deserves recognition?',
        'Is their service local, national or international?',
      ],
      means_tested: false,
      ruleIn: ['Exceptional achievement or public service by the nominee'],
      ruleOut: ['Nominated for paid professional work done for personal gain'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gov.uk/honours',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Help articulate the nominee\'s achievements clearly',
        'Guide through the online nomination form',
        'Advise on supporting letters and timescales',
      ],
    },
  },

  'gro-certificates': {
    id: 'gro-certificates', name: 'Order a birth, death or marriage certificate', dept: 'GRO', deptKey: 'gro',
    deadline: null,
    desc: 'Order certified copies of birth, death, marriage or civil partnership certificates from the General Register Office.',
    govuk_url: 'https://www.gov.uk/order-copy-birth-death-marriage-certificate',
    serviceType: 'document',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Anyone can order certified copies of civil registration certificates from GRO for events registered in England and Wales. Certificates cost £11 each for standard delivery.',
      universal: true,
      criteria: [],
      keyQuestions: [
        'What type of certificate is needed (birth, death, marriage, civil partnership)?',
        'What year and district was the event registered in?',
      ],
      means_tested: false,
      ruleIn: ['Needs a certified copy of a life event registered in England or Wales'],
      ruleOut: ['Event registered in Scotland, Northern Ireland or overseas (different registrars)'],
    },
    agentInteraction: {
      methods: ['online', 'phone', 'post'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.gro.gov.uk/gro/content/certificates/default.asp',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Identify the type of certificate and approximate registration details',
        'Check whether the event is in the GRO index',
        'Guide user through the online order form',
      ],
    },
  },

  // ─── EDUCATION & CHILDCARE ────────────────────────────────────────────────

  'dfe-care-to-learn': {
    id: 'dfe-care-to-learn', name: 'Care to Learn', dept: 'DfE', deptKey: 'other',
    deadline: null,
    desc: 'Childcare funding of up to £195/week (London) or £180/week (outside London) for young parents under 20 in publicly funded education.',
    govuk_url: 'https://www.gov.uk/care-to-learn',
    serviceType: 'grant',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Available to parents under 20 (at the start of the academic year) who are in publicly funded education (school or college) and are the primary carer of a child. Covers childcare and travel costs to childcare.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Parent must be under 20 at the start of the academic year.' },
        { factor: 'family', description: 'Must be the primary carer of a child or baby.' },
        { factor: 'employment', description: 'Must be in publicly funded education at a school or college in England.' },
      ],
      keyQuestions: [
        'How old is the parent and are they in publicly funded education?',
        'Are they the primary carer of their child?',
      ],
      exclusions: ['Parent aged 20 or over when academic year starts', 'Parent not in publicly funded education', 'Not the primary carer'],
      means_tested: false,
      nations: ['england'],
      ruleIn: ['Under 20', 'In publicly funded education', 'Primary carer of child'],
      ruleOut: ['Aged 20 or over at start of academic year', 'Not in publicly funded education', 'Not primary carer'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://studentbursary.education.gov.uk/w/webpage/student-bursary',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Confirm parent is under 20 and in publicly funded education',
        'Ask about childcare costs and provider details',
        'Guide through the application',
      ],
    },
    financialData: {
      taxYear: '2025-26',
      frequency: 'weekly',
      rates: { london_max: 195, outside_london_max: 180 },
      source: 'https://www.gov.uk/care-to-learn',
    },
  },

  'dfe-find-apprenticeship': {
    id: 'dfe-find-apprenticeship', name: 'Find an apprenticeship', dept: 'DfE', deptKey: 'other',
    deadline: null,
    desc: 'Search and apply for apprenticeship vacancies in England, from level 2 (GCSE-equivalent) up to degree-level apprenticeships.',
    govuk_url: 'https://www.gov.uk/apply-apprenticeship',
    serviceType: 'application',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Open to anyone aged 16 or over in England who is not in full-time education. Apprenticeships are available in hundreds of occupations across all sectors. Must be in England and not in full-time education.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must be at least 16 years old.' },
        { factor: 'geography', description: 'Must be in England (Scotland, Wales and NI have separate schemes).' },
      ],
      keyQuestions: [
        'What sector or occupation is the user interested in?',
        'What is their current qualification level?',
      ],
      means_tested: false,
      nations: ['england'],
      ruleIn: ['Aged 16+', 'In England', 'Not in full-time education'],
      ruleOut: ['Under 16', 'Currently in full-time education'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.findapprenticeship.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Ask about preferred sector and location',
        'Search apprenticeship vacancies and summarise relevant ones',
        'Direct user to create a profile on findapprenticeship.service.gov.uk',
      ],
    },
  },

  'dfe-apply-teacher-training': {
    id: 'dfe-apply-teacher-training', name: 'Apply for teacher training', dept: 'DfE', deptKey: 'other',
    deadline: null,
    desc: 'Apply for initial teacher training (ITT) through the GOV.UK Apply for teacher training service.',
    govuk_url: 'https://www.gov.uk/apply-for-teacher-training',
    serviceType: 'application',
    proactive: false,
    gated: false,
    eligibility: {
      summary: 'Open to graduates (or those in their final year) with a 2:2 degree or above who want to qualify as a teacher in England. Routes include PGCE, School Direct, Teach First and SCITT. Entry requirements vary by provider.',
      universal: false,
      criteria: [
        { factor: 'age', description: 'Must have, or be working towards, a UK undergraduate degree (2:2 or above).' },
        { factor: 'geography', description: 'Training takes place in England.' },
      ],
      keyQuestions: [
        'What degree subject does the applicant hold?',
        'Do they want to teach primary or secondary?',
        'Have they done any school experience?',
      ],
      means_tested: false,
      nations: ['england'],
      ruleIn: ['UK degree or equivalent', 'Wants to teach in England'],
      ruleOut: ['No degree or equivalent qualification'],
    },
    agentInteraction: {
      methods: ['online'],
      apiAvailable: false,
      onlineFormUrl: 'https://www.apply-for-teacher-training.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'partial',
      agentSteps: [
        'Help user identify the right training route and subject',
        'Advise on Get into Teaching support and bursaries available',
        'Guide through the application on the Apply service',
      ],
    },
  },

  'dfe-national-careers': {
    id: 'dfe-national-careers', name: 'National Careers Service', dept: 'DfE', deptKey: 'other',
    deadline: null,
    desc: 'Free careers advice, skills assessment and job profile browsing through the government\'s National Careers Service.',
    govuk_url: 'https://nationalcareers.service.gov.uk/',
    serviceType: 'entitlement',
    proactive: true,
    gated: false,
    eligibility: {
      summary: 'Free for anyone in England aged 13 or over. Provides one-to-one careers advice (phone, webchat, online), a skills assessment tool, job profiles and a course finder.',
      universal: true,
      criteria: [
        { factor: 'geography', description: 'Free adviser-led guidance is available to adults in England. Scotland, Wales and NI have their own careers services.' },
      ],
      keyQuestions: [
        'Is the user considering a career change, returning to work, or looking for training?',
        'Are they in England?',
      ],
      means_tested: false,
      nations: ['england'],
      ruleIn: ['In England', 'Seeking careers advice or skills support'],
      ruleOut: ['Outside England (different careers services in devolved nations)'],
    },
    agentInteraction: {
      methods: ['online', 'phone'],
      apiAvailable: false,
      onlineFormUrl: 'https://nationalcareers.service.gov.uk/',
      authRequired: 'none',
      agentCanComplete: 'inform-only',
      agentSteps: [
        'Identify whether user needs skills assessment, course finder or one-to-one advice',
        'Point to the relevant section of the National Careers Service',
        'Signpost to the free telephone helpline for personalised guidance',
      ],
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
  { from: 'ch-register-ltd',          to: 'hmrc-aml-registration',          type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader', to: 'hmrc-aml-registration',         type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader', to: 'hmrc-machine-games-duty',       type: 'ENABLES' },
  { from: 'ch-register-ltd',          to: 'hmrc-machine-games-duty',        type: 'ENABLES' },
  { from: 'la-street-trading-licence', to: 'la-food-hygiene',               type: 'ENABLES' },
  { from: 'la-food-hygiene',           to: 'la-food-premises-approval',     type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader', to: 'ea-waste-carrier-registration', type: 'ENABLES' },
  { from: 'ch-register-ltd',          to: 'ea-waste-carrier-registration',  type: 'ENABLES' },

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
  { from: 'ho-life-in-uk',            to: 'ho-citizenship-spouse',          type: 'REQUIRES' },
  { from: 'dwp-ni-number',            to: 'ho-ilr',                         type: 'REQUIRES' },
  { from: 'ho-ilr',                   to: 'ho-citizenship',                 type: 'ENABLES' },
  { from: 'ho-ilr',                   to: 'ho-citizenship-spouse',          type: 'ENABLES' },
  { from: 'ho-citizenship',           to: 'ho-citizenship-ceremony',        type: 'REQUIRES' },
  { from: 'ho-citizenship-spouse',    to: 'ho-citizenship-ceremony',        type: 'REQUIRES' },
  { from: 'ho-eu-settled-status',     to: 'dwp-ni-number',                  type: 'ENABLES' },
  { from: 'ho-eu-settled-status',     to: 'nhs-gp-register',                type: 'ENABLES' },
  { from: 'ho-eu-settled-status',     to: 'ho-ilr',                         type: 'ENABLES' },
  { from: 'ho-eu-settled-status',     to: 'ho-citizenship',                 type: 'ENABLES' },
  { from: 'ho-eu-settled-status',     to: 'ho-citizenship-spouse',          type: 'ENABLES' },

  // Driving
  { from: 'dvla-provisional-licence', to: 'dvsa-theory-test',               type: 'REQUIRES' },
  { from: 'dvsa-theory-test',         to: 'dvsa-driving-test',              type: 'REQUIRES' },
  { from: 'dvsa-driving-test',        to: 'dvla-vehicle-tax',               type: 'ENABLES' },
  { from: 'dwp-state-pension',        to: 'dvla-renew-at-70',               type: 'ENABLES' },

  // Vehicle
  { from: 'dvla-vehicle-sale',        to: 'dvla-vehicle-tax',               type: 'ENABLES' },
  { from: 'dvla-vehicle-sale',        to: 'dvla-sorn',                      type: 'ENABLES' },
  { from: 'dvla-sorn',                to: 'dvla-vehicle-tax',               type: 'ENABLES' },

  // University
  { from: 'slc-student-finance',      to: 'la-electoral-roll',              type: 'ENABLES' },
  { from: 'slc-student-finance',      to: 'nhs-gp-register',                type: 'ENABLES' },

  // Voting
  { from: 'la-electoral-roll',        to: 'la-voter-authority-cert',        type: 'ENABLES' },

  // New job
  { from: 'hmrc-starter-checklist',   to: 'slc-loan-repayment',            type: 'ENABLES' },
  { from: 'slc-student-finance',      to: 'slc-loan-repayment',            type: 'ENABLES' },

  // ── New edges for added benefit nodes ──────────────────────────────────────

  // Housing Benefit (pension age)
  { from: 'dwp-pension-credit',       to: 'dwp-housing-benefit',            type: 'ENABLES' },

  // Warm Home Discount
  { from: 'dwp-pension-credit',       to: 'other-warm-home-discount',       type: 'ENABLES' },

  // NHS Low Income Scheme
  { from: 'dwp-universal-credit',     to: 'nhs-low-income-scheme',          type: 'ENABLES' },
  { from: 'nhs-low-income-scheme',    to: 'nhs-free-dental',                type: 'ENABLES' },
  { from: 'nhs-low-income-scheme',    to: 'nhs-free-sight-tests',           type: 'ENABLES' },

  // DLA Child
  { from: 'dwp-dla-child',            to: 'la-blue-badge',                  type: 'ENABLES' },
  { from: 'dwp-dla-child',            to: 'dvla-ved-exemption',             type: 'ENABLES' },
  { from: 'dwp-dla-child',            to: 'other-disabled-railcard',        type: 'ENABLES' },

  // Council Tax Disability Reduction
  { from: 'dwp-pip',                  to: 'la-council-tax-disability-reduction', type: 'ENABLES' },
  { from: 'dwp-attendance-allowance', to: 'la-council-tax-disability-reduction', type: 'ENABLES' },

  // Social Tariff Broadband
  { from: 'dwp-universal-credit',     to: 'other-social-tariff-broadband',  type: 'ENABLES' },
  { from: 'dwp-pension-credit',       to: 'other-social-tariff-broadband',  type: 'ENABLES' },

  // Support for Mortgage Interest
  { from: 'dwp-universal-credit',     to: 'dwp-smi',                        type: 'ENABLES' },
  { from: 'dwp-pension-credit',       to: 'dwp-smi',                        type: 'ENABLES' },

  // Cold Weather Payment
  { from: 'dwp-pension-credit',       to: 'dwp-cold-weather-payment',       type: 'ENABLES' },

  // VED Exemption
  { from: 'dwp-pip',                  to: 'dvla-ved-exemption',             type: 'ENABLES' },

  // Court Fee Remission
  { from: 'dwp-universal-credit',     to: 'hmcts-court-fee-remission',      type: 'ENABLES' },
  { from: 'hmcts-court-fee-remission', to: 'hmcts-benefit-tribunal',        type: 'ENABLES' },

  // Maternity Exemption
  { from: 'nhs-free-prescriptions-pregnancy', to: 'nhs-maternity-exemption', type: 'ENABLES' },

  // Free childcare 2yr olds
  { from: 'dwp-universal-credit',     to: 'la-free-childcare-2yr',          type: 'ENABLES' },

  // Student Childcare Grant
  { from: 'slc-student-finance',      to: 'slc-childcare-grant',            type: 'ENABLES' },

  // ── Scotland edges ────────────────────────────────────────────────────────

  // Scottish Child Payment (qualifying benefit gateway)
  { from: 'dwp-universal-credit',     to: 'sss-scottish-child-payment',     type: 'ENABLES' },

  // Carer Support Payment (Scotland's Carer's Allowance equivalent)
  { from: 'sss-adult-disability-payment', to: 'sss-carer-support-payment',  type: 'ENABLES' },
  { from: 'sss-child-disability-payment', to: 'sss-carer-support-payment',  type: 'ENABLES' },
  { from: 'sss-carer-support-payment', to: 'sss-carers-allowance-supplement', type: 'ENABLES' },
  { from: 'sss-carer-support-payment', to: 'sss-young-carer-grant',         type: 'ENABLES' },

  // Child Winter Heating (requires highest-rate disability)
  { from: 'sss-child-disability-payment', to: 'sss-child-winter-heating',   type: 'ENABLES' },

  // Adult Disability Payment unlocks same things as PIP
  { from: 'sss-adult-disability-payment', to: 'la-blue-badge',              type: 'ENABLES' },
  { from: 'sss-adult-disability-payment', to: 'dvla-ved-exemption',         type: 'ENABLES' },
  { from: 'sss-adult-disability-payment', to: 'other-motability',           type: 'ENABLES' },
  { from: 'sss-adult-disability-payment', to: 'other-disabled-railcard',    type: 'ENABLES' },

  // Best Start Grant/Foods (qualifying benefit)
  { from: 'dwp-universal-credit',     to: 'sss-best-start-grant',           type: 'ENABLES' },
  { from: 'dwp-universal-credit',     to: 'sss-best-start-foods',           type: 'ENABLES' },

  // Funeral Support Payment
  { from: 'dwp-universal-credit',     to: 'sss-funeral-support-payment',    type: 'ENABLES' },
  { from: 'dwp-pension-credit',       to: 'sss-funeral-support-payment',    type: 'ENABLES' },

  // Pension Winter Heating (Scotland)
  { from: 'dwp-pension-credit',       to: 'sss-pension-winter-heating',     type: 'ENABLES' },

  // ── Wales edges ───────────────────────────────────────────────────────────

  // Winter Fuel Support (Wales)
  { from: 'dwp-pension-credit',       to: 'wg-winter-fuel-support',         type: 'ENABLES' },
  { from: 'dwp-universal-credit',     to: 'wg-winter-fuel-support',         type: 'ENABLES' },

  // Discretionary Assistance Fund (Wales)
  { from: 'dwp-universal-credit',     to: 'wg-discretionary-assistance',    type: 'ENABLES' },

  // ── Northern Ireland edges ────────────────────────────────────────────────

  // Rate Rebate (NI equivalent of Council Tax Reduction)
  { from: 'dwp-universal-credit',     to: 'ni-rate-rebate',                 type: 'ENABLES' },
  { from: 'dwp-pension-credit',       to: 'ni-rate-rebate',                 type: 'ENABLES' },

  // Discretionary Support (NI)
  { from: 'dwp-universal-credit',     to: 'ni-discretionary-support',       type: 'ENABLES' },

  // ── New service edges ─────────────────────────────────────────────────────

  // Passport
  { from: 'gro-marriage-cert',           to: 'hmpo-passport',                  type: 'ENABLES' },
  { from: 'ho-citizenship-ceremony',     to: 'hmpo-passport',                  type: 'ENABLES' },
  { from: 'hmpo-lost-stolen-passport',   to: 'hmpo-passport',                  type: 'ENABLES' },
  { from: 'hmpo-passport',              to: 'hmpo-passport-urgent',            type: 'ENABLES' },

  // Help to Save
  { from: 'dwp-universal-credit',       to: 'hmrc-help-to-save',              type: 'ENABLES' },
  { from: 'hmrc-tax-credits',           to: 'hmrc-help-to-save',              type: 'ENABLES' },

  // Budgeting Loan
  { from: 'dwp-universal-credit',       to: 'dwp-budgeting-loan',             type: 'ENABLES' },

  // Pension Tracing
  { from: 'hmrc-ni-check',              to: 'dwp-pension-tracing',            type: 'ENABLES' },

  // Fit note → ESA
  { from: 'dwp-new-style-esa',          to: 'nhs-fit-note',                   type: 'ENABLES' },
  { from: 'dwp-universal-credit',       to: 'nhs-fit-note',                   type: 'ENABLES' },

  // Prescription PPC
  { from: 'nhs-low-income-scheme',      to: 'nhs-ppc',                        type: 'ENABLES' },

  // Employment Tribunal pathway (ACAS must come first)
  { from: 'hmrc-p45',                   to: 'acas-early-conciliation',        type: 'ENABLES' },
  { from: 'other-statutory-redundancy', to: 'acas-early-conciliation',        type: 'ENABLES' },
  { from: 'acas-early-conciliation',    to: 'hmcts-employment-tribunal',      type: 'REQUIRES' },
  { from: 'hmcts-legal-aid',            to: 'hmcts-employment-tribunal',      type: 'ENABLES' },

  // Find a Job
  { from: 'dwp-universal-credit',       to: 'dwp-find-a-job',                 type: 'ENABLES' },
  { from: 'dwp-new-style-jsa',          to: 'dwp-find-a-job',                 type: 'ENABLES' },

  // Debt / insolvency
  { from: 'dwp-universal-credit',       to: 'insolvency-breathing-space',     type: 'ENABLES' },
  { from: 'insolvency-breathing-space', to: 'insolvency-dro',                 type: 'ENABLES' },
  { from: 'insolvency-dro',             to: 'insolvency-bankruptcy',          type: 'ENABLES' },

  // Tax tribunal
  { from: 'hmrc-self-assessment',       to: 'hmcts-tax-tribunal',             type: 'ENABLES' },
  { from: 'hmrc-vat',                   to: 'hmcts-tax-tribunal',             type: 'ENABLES' },

  // Immigration tribunal
  { from: 'ho-immigration-appeal',      to: 'hmcts-immigration-tribunal',     type: 'ENABLES' },
  { from: 'ho-fee-waiver',              to: 'ho-visa',                        type: 'ENABLES' },
  { from: 'ho-fee-waiver',              to: 'ho-skilled-worker-visa',         type: 'ENABLES' },
  { from: 'ho-fee-waiver',              to: 'ho-student-visa',                type: 'ENABLES' },

  // eVisa replaces BRP
  { from: 'ho-brp',                     to: 'ho-evisa',                       type: 'ENABLES' },
  { from: 'ho-eu-settled-status',       to: 'ho-evisa',                       type: 'ENABLES' },
  { from: 'ho-evisa',                   to: 'ho-view-immigration-status',     type: 'ENABLES' },
  { from: 'ho-view-immigration-status', to: 'other-right-to-work',            type: 'ENABLES' },

  // Student visa → university
  { from: 'ho-student-visa',            to: 'slc-student-finance',            type: 'ENABLES' },
  { from: 'ho-student-visa',            to: 'nhs-gp-register',                type: 'ENABLES' },
  { from: 'ho-skilled-worker-visa',     to: 'ho-evisa',                       type: 'ENABLES' },
  { from: 'ho-skilled-worker-visa',     to: 'dwp-ni-number',                  type: 'ENABLES' },

  // Property buying flow
  { from: 'ea-flood-risk',              to: 'lr-property-search',             type: 'ENABLES' },
  { from: 'mhclg-epc',                  to: 'lr-property-search',             type: 'ENABLES' },
  { from: 'lr-property-search',         to: 'llc-local-land-charges',         type: 'ENABLES' },
  { from: 'llc-local-land-charges',     to: 'lr-sign-mortgage-deed',          type: 'ENABLES' },
  { from: 'lr-sign-mortgage-deed',      to: 'hmrc-sdlt',                      type: 'ENABLES' },

  // Moving house
  { from: 'dvla-update-address',        to: 'dvla-change-address-v5c',        type: 'ENABLES' },
  { from: 'la-council-tax',             to: 'voa-council-tax-band',           type: 'ENABLES' },

  // Business obligations (after registration)
  { from: 'ch-register-ltd',            to: 'ch-file-accounts',               type: 'ENABLES' },
  { from: 'ch-register-ltd',            to: 'ch-confirmation-statement',      type: 'ENABLES' },
  { from: 'ch-file-accounts',           to: 'ch-close-company',               type: 'ENABLES' },
  { from: 'ch-register-ltd',            to: 'hmrc-eori',                      type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader',  to: 'hmrc-eori',                      type: 'ENABLES' },

  // Voting
  { from: 'la-electoral-roll',          to: 'la-postal-vote',                 type: 'ENABLES' },
  { from: 'la-electoral-roll',          to: 'la-proxy-vote',                  type: 'ENABLES' },

  // University
  { from: 'slc-student-finance',        to: 'dfe-care-to-learn',              type: 'ENABLES' },
  { from: 'dfe-find-apprenticeship',    to: 'tpr-workplace-pension',          type: 'ENABLES' },
  { from: 'dfe-apply-teacher-training', to: 'tpr-workplace-pension',          type: 'ENABLES' },

  // GRO certificates
  { from: 'gro-register-birth',         to: 'gro-certificates',               type: 'ENABLES' },
  { from: 'gro-register-death',         to: 'gro-certificates',               type: 'ENABLES' },
  { from: 'gro-marriage-cert',          to: 'gro-certificates',               type: 'ENABLES' },

  // OPG LPA refund
  { from: 'opg-lpa',                    to: 'opg-lpa-refund',                 type: 'ENABLES' },

  // Baby loss certificate
  { from: 'dhsc-baby-loss-certificate', to: 'gro-certificates',               type: 'ENABLES' },

  // Gender recognition
  { from: 'hmpo-passport',              to: 'hmcts-gender-recognition',       type: 'ENABLES' },

  // Criminal injuries
  { from: 'cica-compensation',          to: 'hmcts-legal-aid',                type: 'ENABLES' },

  // ── Isolated node integration ─────────────────────────────────────────────

  // Care needs / disability home adaptations cluster
  { from: 'dwp-pip',                    to: 'nhs-care-assessment',            type: 'ENABLES' },
  { from: 'dwp-attendance-allowance',   to: 'nhs-care-assessment',            type: 'ENABLES' },
  { from: 'nhs-care-assessment',        to: 'la-disabled-facilities-grant',   type: 'REQUIRES' },
  { from: 'nhs-care-assessment',        to: 'other-carers-leave',             type: 'ENABLES' },
  { from: 'dwp-pip',                    to: 'la-disabled-facilities-grant',   type: 'ENABLES' },
  { from: 'dwp-attendance-allowance',   to: 'la-disabled-facilities-grant',   type: 'ENABLES' },

  // Carer's Assessment
  { from: 'dwp-carers-allowance',       to: 'la-carers-assessment',           type: 'ENABLES' },
  { from: 'dwp-pip',                    to: 'la-carers-assessment',           type: 'ENABLES' },
  { from: 'la-carers-assessment',       to: 'la-disabled-facilities-grant',   type: 'ENABLES' },
  { from: 'la-carers-assessment',       to: 'other-carers-leave',             type: 'ENABLES' },
  { from: 'dwp-carers-allowance',       to: 'other-carers-leave',             type: 'ENABLES' },

  // Statutory pay gaps → benefits
  { from: 'hmrc-ssp',                   to: 'dwp-universal-credit',           type: 'ENABLES' },
  { from: 'hmrc-ssp',                   to: 'dwp-new-style-esa',              type: 'ENABLES' },
  { from: 'gro-register-birth',         to: 'hmrc-spp',                       type: 'ENABLES' },
  { from: 'hmrc-spp',                   to: 'dwp-universal-credit',           type: 'ENABLES' },

  // Benefit overpayment obligation
  { from: 'dwp-universal-credit',       to: 'dwp-benefit-debt-repayment',     type: 'ENABLES' },
  { from: 'dwp-pip',                    to: 'dwp-benefit-debt-repayment',     type: 'ENABLES' },
  { from: 'dwp-new-style-jsa',          to: 'dwp-benefit-debt-repayment',     type: 'ENABLES' },

  // Document legalisation (apostille)
  { from: 'gro-register-birth',         to: 'fco-document-legalisation',      type: 'ENABLES' },
  { from: 'gro-death-certificate',      to: 'fco-document-legalisation',      type: 'ENABLES' },
  { from: 'gro-marriage-cert',          to: 'fco-document-legalisation',      type: 'ENABLES' },
  { from: 'dbs-basic-check',            to: 'fco-document-legalisation',      type: 'ENABLES' },

  // Emergency travel document
  { from: 'hmpo-lost-stolen-passport',  to: 'fco-emergency-travel-doc',       type: 'ENABLES' },

  // DBS checks → licensing
  { from: 'dbs-basic-check',            to: 'la-child-performance-licence',   type: 'ENABLES' },
  { from: 'dbs-basic-check',            to: 'la-hmo-licence',                 type: 'ENABLES' },
  { from: 'dfe-apply-teacher-training', to: 'other-dbs',                      type: 'REQUIRES' },
  { from: 'dfe-find-apprenticeship',    to: 'other-dbs',                      type: 'ENABLES' },

  // Business rates
  { from: 'ch-register-ltd',            to: 'la-business-rates',              type: 'REQUIRES' },
  { from: 'hmrc-register-sole-trader',  to: 'la-business-rates',              type: 'REQUIRES' },
  { from: 'la-business-rates',          to: 'voa-business-rates',             type: 'ENABLES' },

  // Business licensing (Local Authority)
  { from: 'ch-register-ltd',            to: 'la-hmo-licence',                 type: 'ENABLES' },
  { from: 'ch-register-ltd',            to: 'la-road-occupation-licence',     type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader',  to: 'la-road-occupation-licence',     type: 'ENABLES' },
  { from: 'ch-register-ltd',            to: 'la-skip-permit',                 type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader',  to: 'la-skip-permit',                 type: 'ENABLES' },
  { from: 'ch-register-ltd',            to: 'la-scrap-metal-dealer-licence',  type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader',  to: 'la-scrap-metal-dealer-licence',  type: 'ENABLES' },
  { from: 'ch-register-ltd',            to: 'ho-drug-precursor-licence',      type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader',  to: 'ho-drug-precursor-licence',      type: 'ENABLES' },
  { from: 'ch-register-ltd',            to: 'ukri-find-grants',               type: 'ENABLES' },
  { from: 'hmrc-register-sole-trader',  to: 'ukri-find-grants',               type: 'ENABLES' },

  // DVLA medical condition → disability benefits
  { from: 'dvla-notify-condition',      to: 'dwp-pip',                        type: 'ENABLES' },
  { from: 'dvla-notify-condition',      to: 'dwp-attendance-allowance',       type: 'ENABLES' },

  // EUSS status enquiry
  { from: 'ho-eu-settled-status',       to: 'ho-euss-enquiry',                type: 'ENABLES' },

  // Help to Buy → property completion
  { from: 'other-help-to-buy',          to: 'hmrc-sdlt',                      type: 'REQUIRES' },
  { from: 'other-help-to-buy',          to: 'hmrc-lisa',                      type: 'ENABLES' },

  // National Careers Service → pathways
  { from: 'dfe-national-careers',       to: 'dfe-find-apprenticeship',        type: 'ENABLES' },
  { from: 'dfe-national-careers',       to: 'slc-student-finance',            type: 'ENABLES' },

  // Healthy Start (UC gateway)
  { from: 'dwp-universal-credit',       to: 'nhs-healthy-start',              type: 'ENABLES' },

  // Clean Air Zone charges
  { from: 'dvla-vehicle-tax',           to: 'jaqu-clean-air-zone',            type: 'ENABLES' },
  { from: 'dvla-sorn',                  to: 'jaqu-clean-air-zone',            type: 'ENABLES' },
];

// ─── LIFE EVENTS ──────────────────────────────────────────────────────────────

export const LIFE_EVENTS: LifeEvent[] = [
  {
    id: 'baby', icon: '◦', name: 'Having a Baby',
    desc: 'Birth registration, parental leave, childcare and maternity support',
    entryNodes: ['gro-register-birth','nhs-healthy-start','nhs-free-prescriptions-pregnancy',
                 'hmrc-smp','dwp-maternity-allowance','hmrc-spp','dwp-sure-start-grant',
                 'nhs-maternity-exemption','la-free-childcare-2yr',
                 'sss-best-start-grant','sss-best-start-foods',
                 'dhsc-baby-loss-certificate','gro-certificates'],
  },
  {
    id: 'bereavement', icon: '—', name: 'Death of Someone Close',
    desc: 'Registration, probate, bereavement payments and funeral support',
    entryNodes: ['gro-register-death','dwp-bereavement-support','opg-lpa-activation',
                 'dwp-funeral-payment','hmrc-statutory-parental-bereavement',
                 'sss-funeral-support-payment','gro-certificates'],
  },
  {
    id: 'marriage', icon: '∞', name: 'Getting Married',
    desc: 'Legal notice, certificates and name changes',
    entryNodes: ['gro-give-notice','gro-marriage-cert'],
  },
  {
    id: 'retirement', icon: '◐', name: 'Retiring',
    desc: 'State Pension, Pension Credit, housing, heating and age entitlements',
    entryNodes: ['hmrc-ni-check','dwp-state-pension','dwp-attendance-allowance',
                 'la-bus-pass','la-council-tax-reduction',
                 'dwp-housing-benefit','other-warm-home-discount',
                 'sss-pension-winter-heating','dwp-pension-tracing'],
  },
  {
    id: 'business', icon: '◈', name: 'Starting a Business',
    desc: 'Registration, tax obligations and compliance',
    entryNodes: ['ch-register-ltd','hmrc-register-sole-trader','hmrc-vat',
                 'la-business-rates','la-food-hygiene','other-dbs',
                 'hmrc-aml-registration','la-hmo-licence','la-street-trading-licence',
                 'ea-waste-carrier-registration',
                 'ch-file-accounts','ch-confirmation-statement','hmrc-eori','ukri-find-grants'],
  },
  {
    id: 'buying-home', icon: '⌂', name: 'Buying a Home',
    desc: 'Stamp duty, land registration and first-time buyer schemes',
    entryNodes: ['other-help-to-buy','hmrc-lisa','hmrc-sdlt',
                 'lr-property-search','mhclg-epc','ea-flood-risk'],
  },
  {
    id: 'moving', icon: '→', name: 'Moving House',
    desc: 'Address updates across all government systems',
    entryNodes: ['la-electoral-roll','la-council-tax','dvla-update-address',
                 'hmrc-update-records','nhs-gp-register','dvla-change-address-v5c'],
  },
  {
    id: 'job-loss', icon: '⊘', name: 'Losing Your Job',
    desc: 'Benefits, tax refunds, NI record protection and emergency support',
    entryNodes: ['hmrc-p45','other-statutory-redundancy','dwp-new-style-esa',
                 'nhs-low-income-scheme','hmcts-court-fee-remission',
                 'ni-discretionary-support','wg-discretionary-assistance',
                 'acas-early-conciliation','insolvency-breathing-space','dwp-find-a-job'],
  },
  {
    id: 'disability', icon: '◎', name: 'Disability or Health Condition',
    desc: 'Benefits, adaptations, workplace support and devolved disability payments',
    entryNodes: ['dwp-pip','dwp-attendance-allowance','dvla-notify-condition',
                 'dvla-renew-at-70','la-disabled-facilities-grant','nhs-care-assessment',
                 'dwp-dla-child','sss-adult-disability-payment',
                 'sss-child-disability-payment'],
  },
  {
    id: 'carer', icon: '⊕', name: 'Becoming a Carer',
    desc: 'Allowances, NI credits, legal powers and devolved carer support',
    entryNodes: ['dwp-carers-allowance','la-carers-assessment','opg-lpa','other-carers-leave',
                 'sss-carer-support-payment','sss-young-carer-grant'],
  },
  {
    id: 'divorce', icon: '÷', name: 'Separating or Divorcing',
    desc: 'Legal proceedings, children, financial impacts and fee support',
    entryNodes: ['hmcts-legal-aid','hmcts-divorce','dwp-child-maintenance',
                 'la-council-tax-single-discount','hmcts-court-fee-remission'],
  },
  {
    id: 'school', icon: '◌', name: 'Child Starting School',
    desc: 'School places, meals, SEND and funding',
    entryNodes: ['la-school-place','la-send-ehc','hmrc-free-childcare-30'],
  },
  {
    id: 'immigration', icon: '✦', name: 'Arriving in the UK',
    desc: 'Visas, BRP, NI number and NHS access',
    entryNodes: ['ho-visa', 'ho-eu-settled-status',
                 'ho-skilled-worker-visa','ho-student-visa','ho-evisa'],
  },
  {
    id: 'driving', icon: '◉', name: 'Learning to Drive',
    desc: 'Provisional licence, theory test, driving test and taxing your first vehicle',
    entryNodes: ['dvla-provisional-licence', 'dvla-vehicle-sale'],
  },
  {
    id: 'university', icon: '◳', name: 'Going to University',
    desc: 'Student finance, childcare grants, accommodation and healthcare',
    entryNodes: ['slc-student-finance','slc-childcare-grant',
                 'dfe-care-to-learn','dfe-find-apprenticeship'],
  },
  {
    id: 'new-job', icon: '◆', name: 'Starting a New Job',
    desc: 'Tax setup, sick pay entitlement, student loan repayment, workplace pension and employer checks',
    entryNodes: ['hmrc-starter-checklist', 'hmrc-ssp', 'tpr-workplace-pension', 'dwp-access-to-work'],
  },
];
