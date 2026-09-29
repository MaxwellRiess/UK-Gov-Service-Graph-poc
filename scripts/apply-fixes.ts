/**
 * apply-fixes.ts — Apply accepted fix proposals to graph-data.ts
 *
 * Reads data/fix-proposals.json (written by propose-fixes.ts) and applies
 * every proposal a person has not rejected (accepted !== false) whose quotes
 * were verified. Rewrites replace the field's string literal in the node's
 * block; removals delete a list item; the methods field is replaced whole.
 *
 * Run twice:
 *   npx tsx scripts/apply-fixes.ts            # edit graph-data.ts, mark proposals applied
 *   npx tsx scripts/apply-fixes.ts --record   # then write provenance for the new values
 *
 * --record is a separate run because graph-data.ts is imported at start-up,
 * so the new values are only visible to a fresh process. The records it
 * writes are deliberately `unverified`: the correction was drafted and quoted
 * by the same model that would otherwise check it, so an independent
 * re-judgement (widen-sources.ts --fields ... --split-all) is still owed. The
 * quotes are kept so the evidence is visible meanwhile.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const RECORD = process.argv.includes('--record');
const PROPOSALS = 'data/fix-proposals.json';
const DATA = 'src/graph-data.ts';

interface Proposal {
  id: string; path: string; old: string; action: 'rewrite' | 'remove' | 'no_change'; new: string | null;
  claims: { claim: string; quote: string; url: string | null; found: boolean }[];
  verified: boolean; accepted: boolean | null; applied?: string; explanation: string;
}
const file = JSON.parse(readFileSync(PROPOSALS, 'utf-8'));
const proposals: Proposal[] = file.proposals;

/** A TypeScript single-quoted string literal for this text. */
const lit = (t: string) => `'${t.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

if (!RECORD) {
  let src = readFileSync(DATA, 'utf-8');
  const block = (id: string) => {
    const i = src.indexOf(`  '${id}': {`);
    if (i === -1) throw new Error(`no node ${id}`);
    const j = src.indexOf("\n  '", i + 5);
    return [i, j === -1 ? src.length : j] as const;
  };
  let applied = 0;
  const skipped: string[] = [];

  for (const p of proposals) {
    if (p.applied || p.accepted === false || !p.verified || p.action === 'no_change') continue;
    const [i, j] = block(p.id);
    let b = src.slice(i, j);
    const before = b;

    if (p.path === 'agentInteraction.methods') {
      const list = (p.new ?? '').split(',').map(x => x.trim()).filter(Boolean);
      b = b.replace(/methods: \[[^\]]*\],/, `methods: [${list.map(m => `'${m}'`).join(', ')}],`);
    } else {
      // The old text appears once as a literal in this node (single or double quoted).
      const forms = [lit(p.old), JSON.stringify(p.old)];
      const form = forms.find(f => b.split(f).length === 2);
      if (!form) { skipped.push(`${p.id} ${p.path}: old text not found exactly once`); continue; }
      if (p.action === 'rewrite') {
        b = b.replace(form, form.startsWith('"') ? JSON.stringify(p.new) : lit(p.new!));
      } else {
        const k = b.indexOf(form);
        const after = b.slice(k + form.length);
        const beforeK = b.slice(0, k);
        if (/^\s*,\s*/.test(after)) b = beforeK + after.replace(/^\s*,\s*/, '');
        else if (/,\s*$/.test(beforeK)) b = beforeK.replace(/,\s*$/, '') + after;
        else b = beforeK + after;
      }
    }
    if (b === before) { skipped.push(`${p.id} ${p.path}: no change made`); continue; }
    src = src.slice(0, i) + b + src.slice(j);
    p.applied = new Date().toISOString();
    applied++;
  }
  writeFileSync(DATA, src);
  writeFileSync(PROPOSALS, JSON.stringify(file, null, 2) + '\n');
  console.log(`Applied ${applied} proposals to ${DATA}.${skipped.length ? `\nSkipped:\n  ${skipped.join('\n  ')}` : ''}`);
  console.log('Now run: npx tsx scripts/apply-fixes.ts --record');
} else {
  const { NODES } = await import('../src/graph-data.js');
  const { loadProvenance, saveProvenance, hashValue, getFieldValue } = await import('../src/provenance.js');
  const store = loadProvenance();
  const now = new Date().toISOString();
  let written = 0;
  const touched = new Set<string>();

  for (const p of proposals.filter(x => x.applied && x.action === 'rewrite')) {
    const value = getFieldValue(NODES[p.id], p.path);
    if (value === undefined) continue;
    const quotes = p.claims.filter(c => c.found && c.url);
    store.fields[`${p.id}#${p.path}`] = {
      valueHash: hashValue(value),
      valueSeen: (typeof value === 'string' ? value : JSON.stringify(value)).slice(0, 200),
      sourceUrl: quotes[0]?.url ?? NODES[p.id].govuk_url,
      sourceQuote: quotes[0]?.quote ?? '',
      ...(quotes.length > 1 ? { additionalQuotes: quotes.slice(1).map(c => ({ quote: c.quote, url: c.url! })) } : {}),
      claims: { supported: quotes.length, total: p.claims.length },
      method: 'llm-extraction',
      verifiedAt: now,
      confidence: 'unverified',
      rationale: `Corrected on ${now.slice(0, 10)} from quoted sources (${p.explanation}) Awaiting independent re-verification.`,
    };
    touched.add(p.id);
    written++;
  }

  // Removing a list item shifts the ones after it: drop records that now point
  // at nothing, and mark any whose value moved as needing re-verification.
  let pruned = 0, drifted = 0;
  for (const [key, rec] of Object.entries(store.fields)) {
    const [id, path] = key.split('#');
    if (!touched.has(id) && !proposals.some(p => p.applied && p.id === id)) continue;
    const value = getFieldValue(NODES[id], path);
    if (value === undefined) { delete store.fields[key]; pruned++; continue; }
    if (hashValue(value) !== rec.valueHash) {
      store.fields[key] = {
        ...rec, valueHash: hashValue(value),
        valueSeen: (typeof value === 'string' ? value : JSON.stringify(value)).slice(0, 200),
        sourceQuote: '', additionalQuotes: undefined, claims: undefined, confidence: 'unverified',
        rationale: 'Position changed when an earlier list item was removed; needs re-verification.',
      };
      drifted++;
    }
  }
  saveProvenance(store);
  console.log(`Wrote ${written} provenance records (unverified, awaiting re-verification); pruned ${pruned}; re-marked ${drifted} shifted records.`);
}
