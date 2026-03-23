/**
 * build-transcript-viewer.ts
 * Reads all experiment JSONL logs and writes a self-contained HTML viewer
 * for browsing transcripts, tool calls, and scores side-by-side.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const LOGS_DIR  = join(ROOT, 'experiment-logs');
const OUT_PATH  = join(ROOT, 'experiment-transcripts-trial3.html');

interface ToolCall { name: string; input: unknown; output: string }
interface TurnData {
  turn: number;
  userMessage: string;
  assistantResponse: string;
  toolCalls: ToolCall[];
  inputTokens: number;
  outputTokens: number;
}
interface RunLog {
  scenarioId: string;
  condition: 'control' | 'treatment';
  runNumber: number;
  timestamp: string;
  turns: TurnData[];
  totalToolCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}
interface JudgeScores {
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
interface JudgeLine {
  scenarioId: string;
  lifeEvent: string;
  turn: number;
  turnKey: string;
  userMessage: string;
  condition: 'control' | 'treatment';
  scores: JudgeScores;
}

// Load all agent run logs
const logs: RunLog[] = [];
for (const f of readdirSync(LOGS_DIR).filter(f => f.endsWith('.jsonl') && f !== 'summary.json' && f !== 'judge-scores.jsonl')) {
  const raw = readFileSync(join(LOGS_DIR, f), 'utf8').trim();
  for (const line of raw.split('\n').filter(Boolean)) {
    try { logs.push(JSON.parse(line)); } catch { /* skip */ }
  }
}

// Load judge scores
const judgeLines: JudgeLine[] = [];
const judgeScoresPath = join(LOGS_DIR, 'judge-scores.jsonl');
if (existsSync(judgeScoresPath)) {
  const raw = readFileSync(judgeScoresPath, 'utf8').trim();
  for (const line of raw.split('\n').filter(Boolean)) {
    try { judgeLines.push(JSON.parse(line)); } catch { /* skip */ }
  }
}

function getJudge(scenarioId: string, turn: number, condition: 'control' | 'treatment'): JudgeScores | undefined {
  return judgeLines.find(j => j.scenarioId === scenarioId && j.turn === turn && j.condition === condition)?.scores;
}

// Group by scenario
const scenarios = [...new Set(logs.map(l => l.scenarioId))].sort();

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatJson(v: unknown): string {
  try { return esc(JSON.stringify(v, null, 2)); }
  catch { return esc(String(v)); }
}

function scoreBar(n: number): string {
  const filled = Math.round(n);
  return Array.from({length: 5}, (_, i) => `<span class="dot ${i < filled ? 'filled' : ''}">${i < filled ? '●' : '○'}</span>`).join('');
}

function renderJudgePanel(judge: JudgeScores | undefined): string {
  if (!judge) return '';
  const dims: Array<[string, keyof JudgeScores, keyof JudgeScores]> = [
    ['Completeness', 'completeness', 'completeness_rationale'],
    ['Accuracy',     'accuracy',     'accuracy_rationale'],
    ['Sequencing',   'sequencing',   'sequencing_rationale'],
    ['Clarity',      'clarity',      'clarity_rationale'],
  ];
  let html = `<details class="judge-panel">
    <summary class="judge-summary">⚖️ Judge scores — ${dims.map(([label, scoreKey]) => `${label}: ${judge[scoreKey]}/5`).join(' · ')}
    </summary>
    <div class="judge-detail">`;

  for (const [label, scoreKey, rationaleKey] of dims) {
    html += `<div class="judge-row">
      <div class="judge-dim">${label} <span class="judge-score">${judge[scoreKey]}/5</span> ${scoreBar(judge[scoreKey] as number)}</div>
      <div class="judge-rationale">${esc(judge[rationaleKey] as string)}</div>
    </div>`;
  }

  if (judge.notable_omissions?.length) {
    html += `<div class="judge-omissions"><strong>Notable omissions:</strong> ${judge.notable_omissions.map(esc).join(', ')}</div>`;
  }
  if (judge.notable_errors?.length) {
    html += `<div class="judge-errors"><strong>Notable errors:</strong> ${judge.notable_errors.map(esc).join(', ')}</div>`;
  }

  html += `</div></details>`;
  return html;
}

// Build HTML
let body = '';

for (const sid of scenarios) {
  const control   = logs.find(l => l.scenarioId === sid && l.condition === 'control');
  const treatment = logs.find(l => l.scenarioId === sid && l.condition === 'treatment');
  if (!control || !treatment) continue;

  body += `<section class="scenario" id="${sid}">
  <h2>${sid}</h2>
  <div class="scenario-meta">
    <span>Control: ${control.totalToolCalls} tool calls · ${control.totalInputTokens.toLocaleString()} input tokens</span>
    <span>Treatment: ${treatment.totalToolCalls} tool calls · ${treatment.totalInputTokens.toLocaleString()} input tokens</span>
  </div>`;

  for (let ti = 0; ti < Math.max(control.turns.length, treatment.turns.length); ti++) {
    const ct = control.turns[ti];
    const tt = treatment.turns[ti];
    const turnLabel = ['Primary prompt', 'Follow-up A', 'Follow-up B'][ti] ?? `Turn ${ti+1}`;
    const cJudge = getJudge(sid, ti + 1, 'control');
    const tJudge = getJudge(sid, ti + 1, 'treatment');

    body += `<div class="turn">
    <h3>Turn ${ti+1}: ${esc(turnLabel)}</h3>
    <div class="user-prompt"><strong>User:</strong> ${esc(ct?.userMessage ?? tt?.userMessage ?? '')}</div>
    <div class="side-by-side">`;

    for (const [label, t, judge] of [['CONTROL', ct, cJudge], ['TREATMENT', tt, tJudge]] as [string, TurnData | undefined, JudgeScores | undefined][]) {
      body += `<div class="column ${label.toLowerCase()}">
      <div class="column-header">${label}</div>`;

      if (!t) { body += `<div class="empty">No data</div></div>`; continue; }

      // Tool calls
      if (t.toolCalls.length > 0) {
        body += `<div class="tool-calls">
        <div class="tool-calls-header">🔧 Tool calls (${t.toolCalls.length})</div>`;
        for (const tc of t.toolCalls) {
          body += `<details class="tool-call">
          <summary><code>${esc(tc.name)}</code> — <span class="tool-input-preview">${esc(JSON.stringify(tc.input).slice(0, 80))}</span></summary>
          <div class="tool-detail">
            <div class="tool-section"><strong>Input:</strong><pre>${formatJson(tc.input)}</pre></div>
            <div class="tool-section"><strong>Output (truncated to 2000 chars):</strong><pre>${esc(tc.output)}</pre></div>
          </div>
          </details>`;
        }
        body += `</div>`;
      } else {
        body += `<div class="no-tools">No tool calls this turn</div>`;
      }

      // Response
      body += `<div class="response">
      <div class="response-header">💬 Response <span class="token-count">(${t.inputTokens.toLocaleString()} in / ${t.outputTokens.toLocaleString()} out)</span></div>
      <div class="response-text">${esc(t.assistantResponse).replace(/\n/g, '<br>')}</div>
      </div>`;

      // Judge panel
      body += renderJudgePanel(judge);

      body += `</div>`;  // column
    }

    body += `</div></div>`;  // side-by-side, turn
  }

  body += `</section>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Experiment Transcripts — UK Gov Service Graph Evaluation</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.5; color: #1a1a1a; background: #f5f5f5; margin: 0; padding: 0; }

  /* Nav */
  nav { position: sticky; top: 0; background: #1a1a2e; color: #fff; padding: 10px 20px; display: flex; gap: 12px; flex-wrap: wrap; z-index: 100; align-items: center; }
  nav a { color: #a0c4ff; text-decoration: none; font-size: 13px; padding: 4px 8px; border-radius: 4px; }
  nav a:hover { background: rgba(255,255,255,0.15); }
  nav .title { font-weight: 600; color: #fff; margin-right: 12px; }

  /* Layout */
  main { max-width: 1600px; margin: 0 auto; padding: 20px; }

  .scenario { background: #fff; border-radius: 8px; margin-bottom: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); overflow: hidden; }
  .scenario h2 { margin: 0; padding: 14px 20px; background: #1a1a2e; color: #fff; font-size: 16px; }
  .scenario-meta { display: flex; gap: 24px; padding: 8px 20px; background: #f0f0f5; font-size: 12px; color: #555; border-bottom: 1px solid #ddd; }

  .turn { border-bottom: 2px solid #e0e0e0; padding: 16px 20px; }
  .turn:last-child { border-bottom: none; }
  .turn h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
  .user-prompt { background: #e8f4fd; border-left: 3px solid #2196f3; padding: 8px 12px; margin-bottom: 12px; border-radius: 0 4px 4px 0; font-style: italic; }

  .side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 900px) { .side-by-side { grid-template-columns: 1fr; } }

  .column { border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
  .column-header { padding: 8px 12px; font-weight: 700; font-size: 12px; letter-spacing: 0.05em; }
  .control .column-header   { background: #fff3e0; color: #e65100; border-bottom: 1px solid #ddd; }
  .treatment .column-header { background: #e8f5e9; color: #1b5e20; border-bottom: 1px solid #ddd; }

  .tool-calls { border-bottom: 1px solid #eee; }
  .tool-calls-header { padding: 6px 12px; font-size: 12px; font-weight: 600; background: #fafafa; color: #555; }
  .no-tools { padding: 8px 12px; font-size: 12px; color: #999; font-style: italic; }

  details.tool-call { border-bottom: 1px solid #f0f0f0; }
  details.tool-call:last-child { border-bottom: none; }
  details.tool-call summary { padding: 6px 12px; cursor: pointer; font-size: 12px; list-style: none; display: flex; align-items: center; gap: 6px; }
  details.tool-call summary::-webkit-details-marker { display: none; }
  details.tool-call summary::before { content: '▶'; font-size: 10px; color: #888; transition: transform 0.15s; }
  details[open].tool-call summary::before { transform: rotate(90deg); }
  details.tool-call summary:hover { background: #f9f9f9; }
  details.tool-call summary code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 11px; color: #c0392b; }
  .tool-input-preview { color: #666; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
  .tool-detail { padding: 8px 12px; background: #fafafa; border-top: 1px solid #eee; }
  .tool-section { margin-bottom: 8px; }
  .tool-section strong { font-size: 11px; color: #555; display: block; margin-bottom: 4px; }
  pre { margin: 0; font-size: 11px; background: #f4f4f4; padding: 8px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; max-height: 300px; overflow-y: auto; color: #222; }

  .response { padding: 12px; }
  .response-header { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 8px; }
  .token-count { font-weight: 400; color: #999; font-size: 11px; }
  .response-text { font-size: 13px; color: #222; line-height: 1.6; white-space: pre-wrap; }

  .empty { padding: 12px; color: #999; font-style: italic; }

  /* Judge panel */
  details.judge-panel { border-top: 1px solid #e8e0f5; }
  details.judge-panel summary.judge-summary { padding: 8px 12px; cursor: pointer; font-size: 11px; font-weight: 600; color: #5b21b6; background: #f5f3ff; list-style: none; display: flex; align-items: center; gap: 6px; }
  details.judge-panel summary::-webkit-details-marker { display: none; }
  details.judge-panel summary::before { content: '▶'; font-size: 10px; color: #7c3aed; transition: transform 0.15s; }
  details[open].judge-panel summary::before { transform: rotate(90deg); }
  details.judge-panel summary:hover { background: #ede9fe; }
  .judge-detail { padding: 10px 12px; background: #faf9ff; border-top: 1px solid #e8e0f5; display: flex; flex-direction: column; gap: 8px; }
  .judge-row { display: flex; flex-direction: column; gap: 2px; }
  .judge-dim { font-size: 12px; font-weight: 600; color: #4c1d95; display: flex; align-items: center; gap: 6px; }
  .judge-score { font-weight: 400; color: #6d28d9; }
  .dot { font-size: 13px; }
  .dot.filled { color: #7c3aed; }
  .dot:not(.filled) { color: #c4b5fd; }
  .judge-rationale { font-size: 12px; color: #374151; line-height: 1.5; padding-left: 4px; }
  .judge-omissions { font-size: 11px; color: #92400e; background: #fffbeb; border-left: 3px solid #f59e0b; padding: 6px 8px; border-radius: 0 4px 4px 0; }
  .judge-errors { font-size: 11px; color: #991b1b; background: #fef2f2; border-left: 3px solid #ef4444; padding: 6px 8px; border-radius: 0 4px 4px 0; }

  /* Jump to top */
  .jump { position: fixed; bottom: 24px; right: 24px; background: #1a1a2e; color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .jump:hover { background: #2e2e5e; }
</style>
</head>
<body>
<nav>
  <span class="title">Experiment Transcripts</span>
  ${scenarios.map(s => `<a href="#${s}">${s}</a>`).join('')}
</nav>
<main>
${body}
</main>
<a class="jump" href="#" title="Back to top">↑ Top</a>
</body>
</html>`;

writeFileSync(OUT_PATH, html);
console.log(`Written: ${OUT_PATH}`);
console.log(`Size: ${(html.length / 1024).toFixed(0)} KB`);
