/**
 * contact-overrides.ts — Service-specific contact data
 *
 * Only nodes whose contact info differs from their DEPT_CONTACTS default
 * are listed here. All others fall through to the department-level default.
 *
 * Sources: GOV.UK contact pages, verified Feb 2026.
 */

import type { ContactInfo } from '../src/graph-data.js';

export const CONTACT_OVERRIDES: Record<string, ContactInfo> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // DWP  (department default: +44 800 169 0310)
  // ═══════════════════════════════════════════════════════════════════════════

  'dwp-tell-us-once': {
    phone: { number: '+44 800 085 7308', label: 'Tell Us Once helpline (England & Wales)' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'In Scotland, contact the registrar directly. Usually initiated at the registrar appointment.',
  },

  'dwp-bereavement-support': {
    phone: { number: '+44 800 151 2012', textphone: '+44 800 731 0464', relay: '18001 then 0800 151 2012', label: 'Bereavement Service Centre' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'Also handles Funeral Expenses Payment and widowed parent claims.',
  },

  'dwp-funeral-payment': {
    phone: { number: '+44 800 151 2012', textphone: '+44 800 731 0464', relay: '18001 then 0800 151 2012', label: 'Bereavement Service Centre (Funeral Expenses)' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'dwp-state-pension': {
    phone: { number: '+44 800 731 0469', textphone: '+44 800 731 7898', relay: '18001 then 0800 731 0469', label: 'Pension Service helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    contactFormUrl: 'https://www.gov.uk/contact-pension-service',
  },

  'dwp-pension-credit': {
    phone: { number: '+44 800 99 1234', textphone: '+44 800 169 0133', relay: '18001 then 0800 99 1234', label: 'Pension Credit claim line' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'For new claims. Existing claimants use Pension Service line (0800 731 0469).',
  },

  'dwp-winter-fuel': {
    phone: { number: '+44 800 731 0160', textphone: '+44 800 731 0464', relay: '18001 then 0800 731 0160', label: 'Winter Fuel Payment helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'Usually automatic for State Pension recipients.',
  },

  'dwp-attendance-allowance': {
    phone: { number: '+44 800 731 0122', textphone: '+44 800 731 0317', relay: '18001 then 0800 731 0122', label: 'Attendance Allowance helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'dwp-pip': {
    phone: { number: '+44 800 917 2222', textphone: '+44 800 121 4433', relay: '18001 then 0800 917 2222', label: 'PIP helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '17:00' }],
  },

  'dwp-universal-credit': {
    phone: { number: '+44 800 328 5644', textphone: '+44 800 328 1344', relay: '18001 then 0800 328 5644', welsh: '+44 800 328 1744', label: 'Universal Credit helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    webchatUrl: 'https://www.universal-credit.service.gov.uk/sign-in',
    notes: 'Webchat available via UC journal after signing in.',
  },

  'dwp-new-style-jsa': {
    phone: { number: '+44 800 169 0140', textphone: '+44 800 169 0207', relay: '18001 then 0800 169 0140', welsh: '+44 800 169 0190', label: 'Jobcentre Plus' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'dwp-new-style-esa': {
    phone: { number: '+44 800 055 6688', textphone: '+44 800 023 4888', relay: '18001 then 0800 055 6688', label: 'ESA helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'For new claims. Existing claimants use Jobcentre Plus or UC helpline.',
  },

  'dwp-maternity-allowance': {
    phone: { number: '+44 800 169 0140', textphone: '+44 800 169 0207', relay: '18001 then 0800 169 0140', welsh: '+44 800 169 0190', label: 'Jobcentre Plus (Maternity Allowance)' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'dwp-sure-start-grant': {
    phone: { number: '+44 800 169 0140', textphone: '+44 800 169 0207', relay: '18001 then 0800 169 0140', welsh: '+44 800 169 0190', label: 'Jobcentre Plus (Sure Start Maternity Grant)' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'UC claimants apply through their UC journal instead.',
  },

  'dwp-carers-allowance': {
    phone: { number: '+44 800 731 0297', textphone: '+44 800 731 0317', relay: '18001 then 0800 731 0297', label: "Carer's Allowance Unit" },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    contactFormUrl: 'https://www.gov.uk/carers-allowance-unit',
  },

  'dwp-access-to-work': {
    phone: { number: '+44 800 121 7479', textphone: '+44 800 121 7579', relay: '18001 then 0800 121 7479', label: 'Access to Work helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '17:00' }],
    notes: 'BSL video relay available.',
  },

  'dwp-child-maintenance': {
    phone: { number: '+44 800 171 2345', textphone: '+44 800 232 1271', relay: '18001 then 0800 171 2345', welsh: '+44 800 232 1979', label: 'Child Maintenance Service' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '17:00' }],
    complaintsUrl: 'https://www.gov.uk/child-maintenance-service/complaints',
  },

  'dwp-ni-number': {
    phone: { number: '+44 800 141 2079', textphone: '+44 800 141 2438', relay: '18001 then 0800 141 2079', label: 'National Insurance number helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '17:00' }],
  },

  'dwp-mandatory-reconsideration': {
    phone: { number: '+44 800 169 0310', textphone: '+44 800 169 0314', relay: '18001 then 0800 169 0310', label: 'DWP general (or use benefit-specific helpline)' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'Contact the helpline for the specific benefit being reconsidered.',
  },

  'dwp-dla-child': {
    phone: { number: '+44 800 121 4600', textphone: '+44 800 121 4523', relay: '18001 then 0800 121 4600', label: 'Disability Living Allowance helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'dwp-smi': {
    phone: { number: '+44 800 169 0140', textphone: '+44 800 169 0207', relay: '18001 then 0800 169 0140', label: 'Jobcentre Plus (Support for Mortgage Interest)' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'Accessed through qualifying benefit (UC, Pension Credit, JSA/ESA, or IS).',
  },

  'dwp-housing-benefit': {
    localAuthority: true,
    officeLocatorUrl: 'https://www.gov.uk/find-local-council',
    notes: 'Administered by local councils. Contact your local authority Housing Benefit department.',
  },

  // dwp-ni-credits: uses dept default (automatic with UC/JSA/ESA)
  // dwp-uc-carer: uses UC helpline (same as dwp-universal-credit)
  // dwp-uc-health: uses UC helpline (same as dwp-universal-credit)
  // dwp-cold-weather-payment: uses dept default (automatic payment)

  'dwp-uc-carer': {
    phone: { number: '+44 800 328 5644', textphone: '+44 800 328 1344', relay: '18001 then 0800 328 5644', welsh: '+44 800 328 1744', label: 'Universal Credit helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    webchatUrl: 'https://www.universal-credit.service.gov.uk/sign-in',
    notes: 'Managed within Universal Credit. Use UC journal or helpline.',
  },

  'dwp-uc-health': {
    phone: { number: '+44 800 328 5644', textphone: '+44 800 328 1344', relay: '18001 then 0800 328 5644', welsh: '+44 800 328 1744', label: 'Universal Credit helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    webchatUrl: 'https://www.universal-credit.service.gov.uk/sign-in',
    notes: 'Managed within Universal Credit. Use UC journal or helpline.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HMRC  (department default: +44 300 200 3300)
  // ═══════════════════════════════════════════════════════════════════════════

  'hmrc-child-benefit': {
    phone: { number: '+44 300 200 3100', textphone: '+44 300 200 3103', relay: '18001 then 0300 200 3100', label: 'Child Benefit helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/child-benefit',
  },

  'hmrc-guardians-allowance': {
    phone: { number: '+44 300 200 3100', textphone: '+44 300 200 3103', relay: '18001 then 0300 200 3100', label: 'Child Benefit helpline (Guardian\'s Allowance)' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmrc-child-benefit-transfer': {
    phone: { number: '+44 300 200 3100', textphone: '+44 300 200 3103', relay: '18001 then 0300 200 3100', label: 'Child Benefit helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmrc-tax-free-childcare': {
    phone: { number: '+44 300 123 4097', label: 'Childcare Service helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmrc-free-childcare-15': {
    phone: { number: '+44 300 123 4097', label: 'Childcare Service helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmrc-free-childcare-30': {
    phone: { number: '+44 300 123 4097', label: 'Childcare Service helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmrc-self-assessment': {
    phone: { number: '+44 300 200 3310', textphone: '+44 300 200 3319', relay: '18001 then 0300 200 3310', label: 'Self Assessment helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/self-assessment',
    notes: 'Extended hours in January (deadline month).',
  },

  'hmrc-register-sole-trader': {
    phone: { number: '+44 300 200 3310', textphone: '+44 300 200 3319', relay: '18001 then 0300 200 3310', label: 'Self Assessment helpline (registrations)' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/self-assessment',
  },

  'hmrc-ni-check': {
    phone: { number: '+44 300 200 3500', textphone: '+44 300 200 3519', relay: '18001 then 0300 200 3500', label: 'National Insurance helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmrc-carers-credit': {
    phone: { number: '+44 300 200 3500', textphone: '+44 300 200 3519', relay: '18001 then 0300 200 3500', label: 'National Insurance helpline (Carer\'s Credit)' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmrc-vat': {
    phone: { number: '+44 300 200 3700', textphone: '+44 300 200 3719', relay: '18001 then 0300 200 3700', label: 'VAT helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/vat-online',
  },

  'hmrc-mtd': {
    phone: { number: '+44 300 200 3700', textphone: '+44 300 200 3719', relay: '18001 then 0300 200 3700', label: 'VAT & Making Tax Digital helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    webchatUrl: 'https://www.tax.service.gov.uk/ask-hmrc/chat/vat-online',
  },

  'hmrc-corporation-tax': {
    phone: { number: '+44 300 200 3410', textphone: '+44 300 200 3419', relay: '18001 then 0300 200 3410', label: 'Corporation Tax helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmrc-paye': {
    phone: { number: '+44 300 200 3200', textphone: '+44 300 200 3212', relay: '18001 then 0300 200 3200', label: 'Employer helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'Also covers statutory payments (SMP, SPP, ShPP, SSP) for employers.',
  },

  'hmrc-sdlt': {
    phone: { number: '+44 300 200 3510', label: 'Stamp Duty Land Tax helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:30', close: '17:00' }],
  },

  'hmrc-iht400': {
    phone: { number: '+44 300 123 1072', label: 'Inheritance Tax helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:00' }],
  },

  'hmrc-tax-credits': {
    phone: { number: '+44 345 300 3900', textphone: '+44 345 300 3909', relay: '18001 then 0345 300 3900', label: 'Tax Credits helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'Tax Credits are being replaced by Universal Credit. New claims no longer accepted.',
  },

  // hmrc-smp, hmrc-spp, hmrc-spl, hmrc-statutory-parental-bereavement: employer-administered, use dept default
  // hmrc-marriage-allowance, hmrc-cancel-marriage-allowance: uses Income Tax general (same as default)
  // hmrc-update-records, hmrc-p45, hmrc-tax-refund, hmrc-lisa, hmrc-tax-on-pension: uses dept default

  // ═══════════════════════════════════════════════════════════════════════════
  // NHS  (department default: 111)
  // ═══════════════════════════════════════════════════════════════════════════

  'nhs-gp-register': {
    officeLocatorUrl: 'https://www.nhs.uk/service-search/find-a-gp',
    notes: 'Contact GP surgeries directly. Use NHS Find a GP to locate surgeries accepting patients.',
  },

  'nhs-healthy-start': {
    phone: { number: '+44 300 330 7010', label: 'Healthy Start helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:00' }],
  },

  'nhs-care-assessment': {
    localAuthority: true,
    officeLocatorUrl: 'https://www.gov.uk/find-local-council',
    notes: 'Adult social care is delivered by local authorities despite NHS deptKey. Contact your local council.',
  },

  'nhs-low-income-scheme': {
    phone: { number: '+44 300 330 1343', label: 'NHS Business Services Authority' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
      { days: ['sat'], open: '09:00', close: '15:00' },
    ],
  },

  'nhs-free-prescriptions': {
    phone: { number: '+44 300 330 1341', label: 'Help with NHS costs' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
      { days: ['sat'], open: '09:00', close: '15:00' },
    ],
  },

  'nhs-free-prescriptions-pregnancy': {
    phone: { number: '+44 300 330 1341', label: 'NHS BSA (MatEx certificate queries)' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
      { days: ['sat'], open: '09:00', close: '15:00' },
    ],
  },

  'nhs-maternity-exemption': {
    phone: { number: '+44 300 330 1341', label: 'NHS BSA (maternity exemption)' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
      { days: ['sat'], open: '09:00', close: '15:00' },
    ],
  },

  'nhs-free-dental': {
    phone: { number: '+44 300 330 1348', label: 'NHS BSA dental services' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
      { days: ['sat'], open: '09:00', close: '15:00' },
    ],
    officeLocatorUrl: 'https://www.nhs.uk/service-search/find-a-dentist',
  },

  'nhs-free-sight-tests': {
    phone: { number: '+44 300 330 1349', label: 'NHS BSA optical services' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' },
      { days: ['sat'], open: '09:00', close: '15:00' },
    ],
    officeLocatorUrl: 'https://www.nhs.uk/service-search/find-an-optician',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRO  (department default: +44 300 123 1837)
  // ═══════════════════════════════════════════════════════════════════════════

  'gro-register-birth': {
    phone: { number: '+44 300 123 1837', textphone: '+44 329 822 0391', relay: '18001 then 0300 123 1837', label: 'GRO certificate enquiries' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '20:00' },
      { days: ['sat'], open: '09:00', close: '16:00' },
    ],
    officeLocatorUrl: 'https://www.gov.uk/register-offices',
    notes: 'Must be done in person at a register office.',
  },

  'gro-register-death': {
    phone: { number: '+44 300 123 1837', textphone: '+44 329 822 0391', relay: '18001 then 0300 123 1837', label: 'GRO certificate enquiries' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '20:00' },
      { days: ['sat'], open: '09:00', close: '16:00' },
    ],
    officeLocatorUrl: 'https://www.gov.uk/register-offices',
    notes: 'Must be done in person at a register office.',
  },

  'gro-give-notice': {
    phone: { number: '+44 300 123 1837', textphone: '+44 329 822 0391', relay: '18001 then 0300 123 1837', label: 'GRO certificate enquiries' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '20:00' },
      { days: ['sat'], open: '09:00', close: '16:00' },
    ],
    officeLocatorUrl: 'https://www.gov.uk/register-offices',
    notes: 'Must give notice in person at a register office at least 28 days before ceremony.',
  },

  // gro-death-certificate, gro-marriage-cert: uses dept default (central ordering)

  // ═══════════════════════════════════════════════════════════════════════════
  // LA  (department default: localAuthority + officeLocatorUrl)
  // ═══════════════════════════════════════════════════════════════════════════

  'la-blue-badge': {
    localAuthority: true,
    officeLocatorUrl: 'https://www.gov.uk/find-local-council',
    contactFormUrl: 'https://www.gov.uk/apply-blue-badge',
    notes: 'Apply online via GOV.UK. Council handles assessment.',
  },

  'la-send-ehc': {
    localAuthority: true,
    officeLocatorUrl: 'https://www.gov.uk/find-local-council',
    additionalPhones: [{ number: '+44 1799 582030', label: 'IPSEA SEND advice line (independent)' }],
    notes: 'Contact your local council SEND department. IPSEA offers free independent advice.',
  },

  'la-disabled-facilities-grant': {
    localAuthority: true,
    officeLocatorUrl: 'https://www.gov.uk/find-local-council',
    additionalPhones: [{ number: '+44 300 124 0315', label: 'Foundations (Home Improvement Agencies)' }],
    notes: 'Apply through your local council. Foundations can help with the application process.',
  },

  'la-carers-assessment': {
    localAuthority: true,
    officeLocatorUrl: 'https://www.gov.uk/find-local-council',
    additionalPhones: [{ number: '+44 808 808 7777', label: 'Carers UK helpline' }],
    notes: 'Request from your local council adult social care. Carers UK offers free independent advice.',
  },

  // All other la-* nodes: uses dept default (localAuthority: true)

  // ═══════════════════════════════════════════════════════════════════════════
  // HMCTS  (department default: +44 300 123 1372)
  // ═══════════════════════════════════════════════════════════════════════════

  'hmcts-probate': {
    phone: { number: '+44 300 303 0648', textphone: '+44 300 303 0648', relay: '18001 then 0300 303 0648', label: 'Probate helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    webchatUrl: 'https://www.gov.uk/contact-probate-service',
  },

  'hmcts-divorce': {
    phone: { number: '+44 300 303 0642', relay: '18001 then 0300 303 0642', label: 'Divorce helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmcts-financial-order': {
    phone: { number: '+44 300 303 0642', relay: '18001 then 0300 303 0642', label: 'Family court helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmcts-child-arrangements': {
    phone: { number: '+44 300 303 0642', relay: '18001 then 0300 303 0642', label: 'Family court helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'hmcts-benefit-tribunal': {
    phone: { number: '+44 300 123 1142', relay: '18001 then 0300 123 1142', label: 'SSCS Tribunal helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:30', close: '17:00' }],
  },

  'hmcts-legal-aid': {
    phone: { number: '+44 345 345 4345', label: 'Civil Legal Advice' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '20:00' },
      { days: ['sat'], open: '09:00', close: '12:30' },
    ],
    notes: 'Translation available in over 170 languages.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HOME OFFICE  (department default: +44 300 123 2241)
  // ═══════════════════════════════════════════════════════════════════════════

  'ho-eu-settled-status': {
    phone: { number: '+44 300 123 7379', relay: '18001 then 0300 123 7379', label: 'EU Settlement Scheme Resolution Centre' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '20:00' },
      { days: ['sat','sun'], open: '09:30', close: '16:30' },
    ],
  },

  'ho-citizenship': {
    phone: { number: '+44 300 790 6268', relay: '18001 then 0300 790 6268', label: 'Nationality enquiries' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '14:30' }],
  },

  // ho-visa, ho-brp, ho-life-in-uk, ho-ilr: uses dept default (UKVI)

  // ═══════════════════════════════════════════════════════════════════════════
  // NORTHERN IRELAND
  // ═══════════════════════════════════════════════════════════════════════════

  'ni-discretionary-support': {
    phone: { number: '+44 28 9069 9966', label: 'Discretionary Support Team' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:00' }],
  },

  'ni-rate-rebate': {
    phone: { number: '+44 300 200 7801', label: 'LPS Rating helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:00' }],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER  (department default: notes only)
  // ═══════════════════════════════════════════════════════════════════════════

  'other-passport-name': {
    phone: { number: '+44 300 222 0000', relay: '18001 then 0300 222 0000', label: 'HM Passport Office' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '20:00' },
      { days: ['sat','sun'], open: '09:00', close: '17:30' },
    ],
  },

  'other-tv-licence-pension': {
    phone: { number: '+44 300 790 6165', relay: '18001 then 0300 790 6165', label: 'TV Licensing' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:30', close: '18:30' }],
  },

  'other-motability': {
    phone: { number: '+44 300 456 4566', textphone: '+44 300 037 0100', relay: '18001 then 0300 456 4566', label: 'Motability Operations' },
    hours: [
      { days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '19:00' },
      { days: ['sat'], open: '09:00', close: '13:00' },
    ],
  },

  'other-disabled-railcard': {
    phone: { number: '+44 345 605 0525', label: 'Disabled Persons Railcard' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:00' }],
  },

  'other-dbs': {
    phone: { number: '+44 300 006 2849', label: 'DBS helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
  },

  'other-warm-home-discount': {
    phone: { number: '+44 800 030 9322', label: 'Warm Home Discount helpline' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '08:00', close: '18:00' }],
    notes: 'Scheme opens each autumn. Some suppliers have their own application process.',
  },

  'other-help-to-buy': {
    phone: { number: '+44 300 100 0030', label: 'Help to Buy agent' },
    hours: [{ days: ['mon','tue','wed','thu','fri'], open: '09:00', close: '17:30' }],
  },
};
