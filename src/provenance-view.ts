/**
 * provenance-view.ts — Provenance as the graph's consumers see it
 *
 * data/provenance.json was written for maintainers: CI uses it to catch drift.
 * This module turns it into something an agent can act on, attached to the
 * service it describes, so the agent can cite where a value came from and tell
 * a checked fact from an authored one.
 *
 * Two rules keep it honest:
 *
 *   1. Absence is shown, not hidden. Every field that makes a factual claim is
 *      listed. A claim with no record is reported as `unsourced`, not omitted,
 *      so the default reading is "nobody has checked this".
 *
 *   2. A record only vouches for the value it was written for. If the value
 *      has changed since (the hash no longer matches), it is reported as
 *      unverified, whatever the record says. CI should stop that happening;
 *      this makes sure a consumer never sees stale confirmation if it does.
 *
 * The store is imported rather than read from disk so the Lambda bundle
 * carries it (esbuild inlines JSON imports).
 */

import storeJson from '../data/provenance.json' with { type: 'json' };
import { hashValue, getFieldValue, type ProvenanceStore } from './provenance.js';
import type { ServiceNode } from './graph-data.js';
import type { Rule } from './rules.js';

const store = storeJson as unknown as ProvenanceStore;

export type FieldStatus = 'confirmed' | 'inferred' | 'unverified' | 'unsourced';

export interface FieldEvidence {
  status:     FieldStatus;
  /** What the field says, in words, where the path alone is opaque (rule values). */
  about?:     string;
  source?:    string;
  quote?:     string;
  /** Further spans, for fields made of several claims. */
  moreQuotes?: { quote: string; url: string }[];
  method?:    string;
  checkedAt?: string;
  note?:      string;
}

export interface ServiceProvenance {
  guide:    string;
  summary:  Record<FieldStatus, number>;
  fields:   Record<string, FieldEvidence>;
}

const GUIDE =
  'Where each factual field came from. confirmed: found on the cited page, with the quote. ' +
  'inferred: an authored judgement with no published source. unverified: checked and not found, ' +
  'or the value changed after it was checked. unsourced: never checked. Treat anything other than ' +
  'confirmed as unconfirmed, and say so to the user when it matters to their decision. ' +
  'Quotes are re-checked against the live page weekly.';

/** Every path on a node that makes a factual claim, with a label where the path is opaque. */
function claimFields(node: ServiceNode): { path: string; about?: string }[] {
  const out: { path: string; about?: string }[] = [
    { path: 'govuk_url' },
    { path: 'deptKey', about: 'Which body delivers the service' },
    { path: 'desc' },
    { path: 'eligibility.summary' },
  ];
  node.eligibility.criteria.forEach((c, i) =>
    out.push({ path: `eligibility.criteria.${i}`, about: `Eligibility criterion ${i + 1} (${c.factor})` }));
  // Checked by verify-prose.ts, item by item.
  const items: [string, string[] | undefined, string][] = [
    ['eligibility.autoQualifiers', node.eligibility.autoQualifiers, 'Auto-qualifier'],
    ['eligibility.exclusions', node.eligibility.exclusions, 'Exclusion'],
    ['eligibility.evidenceRequired', node.eligibility.evidenceRequired, 'Evidence required'],
  ];
  for (const [base, list, label] of items) {
    (list ?? []).forEach((t, i) => out.push({ path: `${base}.${i}`, about: `${label}: ${t.length > 60 ? t.slice(0, 57) + '...' : t}` }));
  }
  if (node.deadline) out.push({ path: 'deadline' });
  if (node.nations) out.push({ path: 'nations' });
  for (const key of Object.keys(node.financialData?.rates ?? {})) {
    out.push({ path: `financialData.rates.${key}` });
  }
  if (node.contactInfo?.phone?.number) out.push({ path: 'contactInfo.phone.number' });
  (node.contactInfo?.additionalPhones ?? []).forEach((p, i) =>
    out.push({ path: `contactInfo.additionalPhones.${i}.number`, about: p.label }));

  const walk = (rule: Rule, path: string) => {
    if (rule.type === 'all' || rule.type === 'any' || rule.type === 'not') {
      rule.rules.forEach((r, i) => walk(r, `${path}.rules.${i}`));
    } else if (rule.type === 'comparison') {
      out.push({ path: `${path}.value`, about: `Eligibility rule: ${rule.label}` });
    } else if (rule.type === 'deadline') {
      out.push({ path: `${path}.maxDays`, about: `Deadline rule: ${rule.label}` });
    }
  };
  (node.eligibility.rules ?? []).forEach((r, i) => walk(r, `eligibility.rules.${i}`));

  // Links an agent hands a person to act on, beyond govuk_url (verify-links.ts).
  const links: [string, string | undefined, string][] = [
    ['agentInteraction.onlineFormUrl', node.agentInteraction?.onlineFormUrl, 'Online application link'],
    ['agentInteraction.apiUrl', node.agentInteraction?.apiUrl, 'API documentation link'],
    ['contactInfo.webchatUrl', node.contactInfo?.webchatUrl, 'Webchat link'],
    ['contactInfo.contactFormUrl', node.contactInfo?.contactFormUrl, 'Contact form link'],
    ['contactInfo.officeLocatorUrl', node.contactInfo?.officeLocatorUrl, 'Office finder link'],
  ];
  for (const [path, url, about] of links) if (url) out.push({ path, about });

  if (node.agentInteraction) {
    out.push({ path: 'agentInteraction.methods', about: `Ways to apply: ${node.agentInteraction.methods.join(', ')}` });
    out.push({ path: 'agentInteraction.authRequired', about: `Sign-in needed: ${node.agentInteraction.authRequired}` });
    out.push({ path: 'agentInteraction.agentSteps' });
  }
  return out;
}

function evidenceFor(node: ServiceNode, path: string, about?: string): FieldEvidence {
  const record = store.fields[`${node.id}#${path}`];
  if (!record) return { status: 'unsourced', ...(about ? { about } : {}) };

  const base: FieldEvidence = {
    status:    record.confidence,
    ...(about ? { about } : {}),
    source:    record.sourceUrl || undefined,
    quote:     record.sourceQuote || undefined,
    ...(record.additionalQuotes?.length ? { moreQuotes: record.additionalQuotes } : {}),
    method:    record.method,
    checkedAt: record.verifiedAt.slice(0, 10),
  };
  if (hashValue(getFieldValue(node, path)) !== record.valueHash) {
    return { ...base, status: 'unverified', quote: undefined, moreQuotes: undefined, note: 'Value has changed since it was checked.' };
  }
  if (record.confidence !== 'confirmed' && record.rationale) base.note = record.rationale;
  return base;
}

export function provenanceFor(node: ServiceNode): ServiceProvenance {
  const fields: Record<string, FieldEvidence> = {};
  const summary: Record<FieldStatus, number> = { confirmed: 0, inferred: 0, unverified: 0, unsourced: 0 };
  for (const { path, about } of claimFields(node)) {
    const ev = evidenceFor(node, path, about);
    fields[path] = ev;
    summary[ev.status]++;
  }
  return { guide: GUIDE, summary, fields };
}

export interface ProvenanceSummary {
  summary:      Record<FieldStatus, number>;
  /** Fields not confirmed against a source, named in words where the path is opaque. */
  notConfirmed: string[];
  more:         string;
}

/**
 * The default for get_service: enough for an agent to know what it cannot
 * vouch for, at about a tenth of the full block's size. Quotes and URLs are
 * the expensive part and are only needed when something is being cited.
 */
export function provenanceSummary(node: ServiceNode): ProvenanceSummary {
  const { summary, fields } = provenanceFor(node);
  const notConfirmed = Object.entries(fields)
    .filter(([, ev]) => ev.status !== 'confirmed')
    .map(([path, ev]) => (ev.about ? `${ev.about} (${ev.status})` : `${path} (${ev.status})`));
  return { summary, notConfirmed, more: 'Call get_service with provenance: "full" for sources and quotes.' };
}

/** Lean per-service signal for plan_journey: counts only. */
export function sourcingSummary(node: ServiceNode): { confirmed: number; notConfirmed: number } {
  const { summary } = provenanceFor(node);
  return { confirmed: summary.confirmed, notConfirmed: summary.inferred + summary.unverified + summary.unsourced };
}

/** For check_eligibility: how many of the rule values behind a verdict are confirmed. */
export function ruleValueSourcing(node: ServiceNode): { confirmed: number; total: number } | null {
  const rulePaths = claimFields(node).filter(f => f.path.startsWith('eligibility.rules.'));
  if (!rulePaths.length) return null;
  const confirmed = rulePaths.filter(f => evidenceFor(node, f.path).status === 'confirmed').length;
  return { confirmed, total: rulePaths.length };
}
