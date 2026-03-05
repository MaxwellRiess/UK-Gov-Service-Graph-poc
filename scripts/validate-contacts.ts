/**
 * validate-contacts.ts — Verify contact data coverage and format
 */

import { NODES, DEPT_CONTACTS, type ContactInfo } from '../src/graph-data.js';
import { resolveContactInfo, buildJourney, getServiceWithContext } from '../src/graph-engine.js';

const nodes = Object.values(NODES);
let withContact = 0;
let withoutContact = 0;
const missingIds: string[] = [];
const phoneFormatErrors: string[] = [];
const hoursErrors: string[] = [];

for (const node of nodes) {
  const contact = resolveContactInfo(node);
  if (contact) {
    withContact++;

    // Validate phone format: should start with +44 or be '111'
    if (contact.phone?.number) {
      if (!contact.phone.number.startsWith('+44') && contact.phone.number !== '111') {
        phoneFormatErrors.push(`${node.id}: phone "${contact.phone.number}" doesn't start with +44`);
      }
    }

    // Validate hours format
    if (contact.hours) {
      for (const h of contact.hours) {
        const validDays = ['mon','tue','wed','thu','fri','sat','sun'];
        for (const d of h.days) {
          if (!validDays.includes(d)) {
            hoursErrors.push(`${node.id}: invalid day "${d}"`);
          }
        }
        if (!/^\d{2}:\d{2}$/.test(h.open) || !/^\d{2}:\d{2}$/.test(h.close)) {
          hoursErrors.push(`${node.id}: invalid time format open="${h.open}" close="${h.close}"`);
        }
      }
    }

    // Validate additional phones
    if (contact.additionalPhones) {
      for (const p of contact.additionalPhones) {
        if (!p.number.startsWith('+44') && p.number !== '111') {
          phoneFormatErrors.push(`${node.id}: additionalPhone "${p.number}" doesn't start with +44`);
        }
      }
    }
  } else {
    withoutContact++;
    missingIds.push(node.id);
  }
}

console.log('─── CONTACT COVERAGE ────────────────────────────────────');
console.log(`Total nodes:           ${nodes.length}`);
console.log(`With contact info:     ${withContact}`);
console.log(`Without contact info:  ${withoutContact}`);
if (missingIds.length) {
  console.log(`  Missing: ${missingIds.join(', ')}`);
}

console.log('\n─── FORMAT VALIDATION ───────────────────────────────────');
console.log(`Phone format errors:   ${phoneFormatErrors.length}`);
phoneFormatErrors.forEach(e => console.log(`  ${e}`));
console.log(`Hours format errors:   ${hoursErrors.length}`);
hoursErrors.forEach(e => console.log(`  ${e}`));

// Test that DEPT_CONTACTS covers all unique deptKeys
const allDeptKeys = new Set(nodes.map(n => n.deptKey));
const coveredDeptKeys = new Set(Object.keys(DEPT_CONTACTS));
const uncoveredDepts = [...allDeptKeys].filter(k => !coveredDeptKeys.has(k));
console.log(`\n─── DEPARTMENT COVERAGE ────────────────────────────────`);
console.log(`Unique deptKeys:       ${allDeptKeys.size}`);
console.log(`Covered by DEPT_CONTACTS: ${coveredDeptKeys.size}`);
if (uncoveredDepts.length) {
  console.log(`  Uncovered: ${uncoveredDepts.join(', ')}`);
}

// Test journey + contact resolution
console.log('\n─── JOURNEY + CONTACT TEST ─────────────────────────────');
const journey = buildJourney(['baby']);
let journeyWithContact = 0;
let journeyWithout = 0;
for (const phase of journey.phases) {
  for (const svc of phase.services) {
    if ((svc as any).contactInfo) journeyWithContact++;
    else journeyWithout++;
  }
}
console.log(`Baby journey: ${journey.summary.totalServices} services, ${journeyWithContact} with contact, ${journeyWithout} without`);

// Test getServiceWithContext includes contact
const ucService = getServiceWithContext('dwp-universal-credit');
console.log(`\nget_service('dwp-universal-credit'):`);
console.log(`  Has contactInfo: ${!!ucService?.contactInfo}`);
console.log(`  Phone: ${ucService?.contactInfo?.phone?.number}`);
console.log(`  Label: ${ucService?.contactInfo?.phone?.label}`);

const laService = getServiceWithContext('la-council-tax');
console.log(`\nget_service('la-council-tax'):`);
console.log(`  Has contactInfo: ${!!laService?.contactInfo}`);
console.log(`  localAuthority: ${laService?.contactInfo?.localAuthority}`);
console.log(`  officeLocatorUrl: ${laService?.contactInfo?.officeLocatorUrl}`);

// Summary
const allGood = missingIds.length === 0 && phoneFormatErrors.length === 0 && hoursErrors.length === 0 && uncoveredDepts.length === 0;
console.log(`\n═══ RESULT: ${allGood ? 'ALL CHECKS PASSED' : 'ISSUES FOUND'} ═══`);

if (!allGood) process.exit(1);
