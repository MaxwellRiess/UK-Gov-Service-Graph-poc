/**
 * rules.ts — Executable eligibility rule engine
 *
 * Provides structured, machine-evaluable rules for every service in the graph.
 * An agent calls check_eligibility with known user facts; the engine returns
 * per-service verdicts (eligible / not_eligible / needs_more_info) and the
 * specific questions to ask next.
 *
 * Designed for progressive disclosure: call → get questions → ask → call again.
 */

import { NODES, type ServiceNode } from './graph-data.js';
import type { JourneyResult } from './graph-engine.js';

// ─── USER CONTEXT ─────────────────────────────────────────────────────────────
// All fields optional — the whole point is to identify what's MISSING.

export interface UserContext {
  // Demographics
  age?:                number;
  nation?:             'england' | 'scotland' | 'wales' | 'northern-ireland';
  is_uk_resident?:     boolean;
  citizenship?:        string;
  immigration_status?: string;

  // Employment & income
  employment_status?:           'employed' | 'self-employed' | 'unemployed' | 'director' | 'retired' | 'student';
  annual_income?:               number;
  weekly_income?:               number;
  weekly_earnings?:             number;
  savings?:                     number;
  ni_qualifying_years?:         number;
  has_recent_ni_contributions?: boolean;

  // Family
  is_pregnant?:        boolean;
  has_children?:       boolean;
  youngest_child_age?: number;
  number_of_children?: number;
  is_single_parent?:   boolean;
  relationship_status?: 'single' | 'married' | 'civil_partnership' | 'cohabiting' | 'separated' | 'divorced' | 'widowed';

  // Health & disability
  has_disability?:               boolean;
  has_terminal_illness?:         boolean;
  has_long_term_health_condition?: boolean;
  receives_pip?:                 boolean;
  pip_daily_living_rate?:        'standard' | 'enhanced' | null;
  pip_mobility_rate?:            'standard' | 'enhanced' | null;

  // Caring
  is_carer?:                               boolean;
  caring_hours_per_week?:                  number;
  cared_for_receives_qualifying_benefit?:  boolean;
  is_in_full_time_education?:              boolean;

  // Property & assets
  is_homeowner?:       boolean;
  is_first_time_buyer?: boolean;
  property_value?:     number;
  estate_value?:       number;
  has_mortgage?:       boolean;

  // Bereavement
  has_experienced_bereavement?: boolean;
  death_registered?:            boolean;
  estate_has_sole_assets?:      boolean;
  assets_held_jointly?:         boolean;

  // Graph state — what services the user is already interacting with
  services_receiving?: string[];
  services_completed?: string[];

  // Trigger dates — for deadline computation
  trigger_dates?: Record<string, string>;

  // Escape hatch for factors not covered above
  custom_facts?: Record<string, string | number | boolean>;
}

// ─── RULE TYPES (discriminated union) ─────────────────────────────────────────

export type Rule =
  | ComparisonRule
  | BooleanRule
  | EnumRule
  | DependencyRule
  | DeadlineRule
  | CompositeRule;

/** Numeric comparison: age >= 18, savings < 16000 */
export interface ComparisonRule {
  type:     'comparison';
  field:    string;
  operator: '>=' | '>' | '<=' | '<' | '==' | '!=';
  value:    number;
  label:    string;
}

/** Boolean fact check: is_uk_resident === true */
export interface BooleanRule {
  type:     'boolean';
  field:    string;
  expected: boolean;
  label:    string;
}

/** Set membership: nation in ['scotland'] */
export interface EnumRule {
  type:  'enum';
  field: string;
  oneOf: (string | number)[];
  label: string;
}

/** Graph-aware dependency: receiving a benefit, completed a service */
export interface DependencyRule {
  type:      'dependency';
  serviceId: string;
  condition: 'receiving' | 'completed';
  label:     string;
}

/** Deadline from trigger event: days_since(birth_date) <= 42 */
export interface DeadlineRule {
  type:         'deadline';
  triggerEvent: string;
  triggerLabel: string;
  maxDays:      number;
  label:        string;
}

/** Composite: ALL / ANY / NOT */
export interface CompositeRule {
  type:  'all' | 'any' | 'not';
  rules: Rule[];
  label: string;
}

// ─── EVALUATION RESULTS ───────────────────────────────────────────────────────

export type RuleVerdict = 'pass' | 'fail' | 'unknown';

export interface RuleResult {
  rule:             Rule;
  verdict:          RuleVerdict;
  missingField?:    string;
  missingQuestion?: string;
}

export interface ServiceEligibilityResult {
  serviceId:        string;
  serviceName:      string;
  serviceType:      string;
  verdict:          'eligible' | 'not_eligible' | 'needs_more_info';
  details:          RuleResult[];
  pendingQuestions:  string[];
  deadlineStatus?:  'ok' | 'overdue' | 'unknown_trigger_date';
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getField(ctx: UserContext, path: string): unknown {
  return path.split('.').reduce((obj: any, key) => obj?.[key], ctx);
}

function compare(val: number, op: string, target: number): boolean {
  switch (op) {
    case '>=': return val >= target;
    case '>':  return val > target;
    case '<=': return val <= target;
    case '<':  return val < target;
    case '==': return val === target;
    case '!=': return val !== target;
    default:   return false;
  }
}

function diffDays(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── SINGLE-RULE EVALUATION ──────────────────────────────────────────────────

export function evaluateRule(rule: Rule, ctx: UserContext): RuleResult {
  switch (rule.type) {

    case 'comparison': {
      const val = getField(ctx, rule.field);
      if (val === undefined || val === null)
        return { rule, verdict: 'unknown', missingField: rule.field, missingQuestion: rule.label };
      return { rule, verdict: compare(val as number, rule.operator, rule.value) ? 'pass' : 'fail' };
    }

    case 'boolean': {
      const val = getField(ctx, rule.field);
      if (val === undefined || val === null)
        return { rule, verdict: 'unknown', missingField: rule.field, missingQuestion: rule.label };
      return { rule, verdict: val === rule.expected ? 'pass' : 'fail' };
    }

    case 'enum': {
      const val = getField(ctx, rule.field);
      if (val === undefined || val === null)
        return { rule, verdict: 'unknown', missingField: rule.field, missingQuestion: rule.label };
      return { rule, verdict: rule.oneOf.includes(val as string) ? 'pass' : 'fail' };
    }

    case 'dependency': {
      const list = rule.condition === 'receiving'
        ? (ctx.services_receiving ?? [])
        : (ctx.services_completed ?? []);
      if (list.includes(rule.serviceId)) return { rule, verdict: 'pass' };
      // Can't confirm it's definitively false — user might not have listed everything
      return { rule, verdict: 'unknown', missingQuestion: rule.label };
    }

    case 'deadline': {
      const dateStr = ctx.trigger_dates?.[rule.triggerEvent];
      if (!dateStr)
        return { rule, verdict: 'unknown', missingField: `trigger_dates.${rule.triggerEvent}`, missingQuestion: `What is the ${rule.triggerLabel}?` };
      const days = diffDays(new Date(dateStr), new Date());
      return { rule, verdict: days <= rule.maxDays ? 'pass' : 'fail' };
    }

    case 'all': {
      const results = rule.rules.map(r => evaluateRule(r, ctx));
      if (results.some(r => r.verdict === 'fail'))    return { rule, verdict: 'fail' };
      if (results.some(r => r.verdict === 'unknown'))  return { rule, verdict: 'unknown', missingQuestion: rule.label };
      return { rule, verdict: 'pass' };
    }

    case 'any': {
      const results = rule.rules.map(r => evaluateRule(r, ctx));
      if (results.some(r => r.verdict === 'pass'))     return { rule, verdict: 'pass' };
      if (results.every(r => r.verdict === 'fail'))    return { rule, verdict: 'fail' };
      return { rule, verdict: 'unknown', missingQuestion: rule.label };
    }

    case 'not': {
      const inner = evaluateRule(rule.rules[0], ctx);
      if (inner.verdict === 'unknown') return { rule, verdict: 'unknown', missingQuestion: rule.label };
      return { rule, verdict: inner.verdict === 'pass' ? 'fail' : 'pass' };
    }
  }
}

// ─── SERVICE-LEVEL EVALUATION ────────────────────────────────────────────────

export function evaluateServiceEligibility(
  node: ServiceNode,
  ctx: UserContext,
): ServiceEligibilityResult {

  const base = { serviceId: node.id, serviceName: node.name, serviceType: node.serviceType };

  // Nation pre-filter: reject if service is devolved and user is in a different nation
  if (node.nations && ctx.nation && !node.nations.includes(ctx.nation)) {
    return { ...base, verdict: 'not_eligible', details: [], pendingQuestions: [] };
  }

  const rules = node.eligibility.rules;

  // No structured rules → fall back to text-based guidance
  if (!rules || rules.length === 0) {
    return {
      ...base,
      verdict: node.eligibility.universal ? 'eligible' : 'needs_more_info',
      details: [],
      pendingQuestions: node.eligibility.universal ? [] : node.eligibility.keyQuestions,
    };
  }

  // Evaluate all rules
  const details = rules.map(r => evaluateRule(r, ctx));

  const anyFail    = details.some(r => r.verdict === 'fail');
  const anyUnknown = details.some(r => r.verdict === 'unknown');

  const pendingQuestions = details
    .filter(r => r.verdict === 'unknown' && r.missingQuestion)
    .map(r => r.missingQuestion!);

  let verdict: 'eligible' | 'not_eligible' | 'needs_more_info';
  if (anyFail)         verdict = 'not_eligible';
  else if (anyUnknown) verdict = 'needs_more_info';
  else                 verdict = 'eligible';

  // Deadline status
  let deadlineStatus: 'ok' | 'overdue' | 'unknown_trigger_date' | undefined;
  const deadlineRule = rules.find((r): r is DeadlineRule => r.type === 'deadline');
  if (deadlineRule) {
    const dateStr = ctx.trigger_dates?.[deadlineRule.triggerEvent];
    if (!dateStr) deadlineStatus = 'unknown_trigger_date';
    else          deadlineStatus = diffDays(new Date(dateStr), new Date()) <= deadlineRule.maxDays ? 'ok' : 'overdue';
  }

  return { ...base, verdict, details, pendingQuestions, deadlineStatus };
}

// ─── JOURNEY-LEVEL EVALUATION ────────────────────────────────────────────────

export function evaluateJourney(
  journey: JourneyResult,
  ctx: UserContext,
): ServiceEligibilityResult[] {
  return journey.phases.flatMap(phase =>
    phase.services.map(svc => evaluateServiceEligibility(NODES[svc.id], ctx)),
  );
}
