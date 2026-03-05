/**
 * merge-contacts.ts — Inject contactInfo overrides into graph-data.ts
 *
 * For each node ID in CONTACT_OVERRIDES, finds the node in graph-data.ts
 * and inserts a `contactInfo:` field after `nations:` or `financialData:`
 * or `agentInteraction:` (whichever comes last before the closing brace).
 *
 * Usage: npx tsx scripts/merge-contacts.ts
 */

import { CONTACT_OVERRIDES } from './contact-overrides.js';
import { NODES } from '../src/graph-data.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'src', 'graph-data.ts');

let source = readFileSync(dataPath, 'utf-8');
let injected = 0;
let skipped = 0;
const errors: string[] = [];

for (const [nodeId, contactInfo] of Object.entries(CONTACT_OVERRIDES)) {
  // Verify node exists
  if (!NODES[nodeId]) {
    errors.push(`Node '${nodeId}' not found in NODES — skipping`);
    continue;
  }

  // Check if node already has contactInfo
  // Find the node's opening line: 'node-id': {
  const nodePattern = `'${nodeId}': {`;
  const nodeStart = source.indexOf(nodePattern);
  if (nodeStart === -1) {
    errors.push(`Could not find '${nodeId}' in source — skipping`);
    continue;
  }

  // Find the node's closing brace by tracking brace depth
  let depth = 0;
  let nodeEnd = -1;
  for (let i = nodeStart + nodePattern.length - 1; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) {
        nodeEnd = i;
        break;
      }
    }
  }

  if (nodeEnd === -1) {
    errors.push(`Could not find closing brace for '${nodeId}' — skipping`);
    continue;
  }

  const nodeBlock = source.substring(nodeStart, nodeEnd + 1);

  // Skip if already has contactInfo
  if (nodeBlock.includes('contactInfo:')) {
    skipped++;
    continue;
  }

  // Serialize the contactInfo to inline TypeScript
  const serialized = serializeContactInfo(contactInfo, 4);

  // Find the last field before the closing brace — insert contactInfo there
  // Look for the pattern: last field assignment before the closing '},\n'
  // We'll insert right before the closing '  }' of the node
  const closingBracePos = nodeEnd;
  const insertPos = closingBracePos;

  // Check what's right before the closing brace — we need to add a comma if needed
  const beforeClose = source.substring(nodeStart, closingBracePos);
  const lastNewline = beforeClose.lastIndexOf('\n');
  const lastLine = beforeClose.substring(lastNewline + 1).trim();

  // Insert the contactInfo field
  const indent = '    '; // 4 spaces
  const insertion = `${indent}contactInfo: ${serialized},\n  `;

  source = source.substring(0, closingBracePos) + insertion + source.substring(closingBracePos);
  injected++;
}

writeFileSync(dataPath, source, 'utf-8');

console.log(`\nMerge complete:`);
console.log(`  Injected: ${injected}`);
console.log(`  Skipped (already has contactInfo): ${skipped}`);
console.log(`  Errors: ${errors.length}`);
if (errors.length) {
  errors.forEach(e => console.log(`    - ${e}`));
}

// ─── SERIALIZATION ──────────────────────────────────────────────────────────

function serializeContactInfo(obj: any, indent: number): string {
  return serializeObject(obj, indent);
}

function serializeObject(obj: any, indent: number): string {
  const pad = ' '.repeat(indent);
  const innerPad = ' '.repeat(indent + 2);
  const entries = Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null);

  if (entries.length === 0) return '{}';

  // Check if it's simple enough for single line
  const simple = entries.every(([_, v]) => typeof v !== 'object' || v === null);
  if (simple && entries.length <= 3) {
    const parts = entries.map(([k, v]) => `${k}: ${serializeValue(v, indent + 2)}`);
    return `{ ${parts.join(', ')} }`;
  }

  const lines = entries.map(([k, v]) => {
    return `${innerPad}${k}: ${serializeValue(v, indent + 2)},`;
  });

  return `{\n${lines.join('\n')}\n${pad}}`;
}

function serializeValue(val: any, indent: number): string {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'string') return serializeString(val);
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return serializeArray(val, indent);
  if (typeof val === 'object') return serializeObject(val, indent);
  return String(val);
}

function serializeString(s: string): string {
  // Use single quotes, escape internal single quotes
  const escaped = s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${escaped}'`;
}

function serializeArray(arr: any[], indent: number): string {
  if (arr.length === 0) return '[]';

  // For simple string arrays, put on one line
  if (arr.every(v => typeof v === 'string') && arr.length <= 7) {
    return `[${arr.map(v => serializeString(v)).join(',')}]`;
  }

  // For object arrays (like hours, additionalPhones), use multi-line
  const pad = ' '.repeat(indent);
  const innerPad = ' '.repeat(indent + 2);
  const items = arr.map(item => `${innerPad}${serializeValue(item, indent + 2)},`);
  return `[\n${items.join('\n')}\n${pad}]`;
}
