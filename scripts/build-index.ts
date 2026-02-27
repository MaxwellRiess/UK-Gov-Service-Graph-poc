/**
 * build-index.ts
 *
 * Generates a self-contained index.html for GitHub Pages.
 * All graph data is embedded as JSON — no server required.
 *
 * Run: npm run build
 */

import { writeFileSync } from 'fs';
import { LIFE_EVENTS, NODES, EDGES } from '../src/graph-data.js';

const nodeElements = Object.values(NODES).map(n => ({
  data: {
    id:                 n.id,
    label:              n.name.length > 22 ? n.name.substring(0, 20) + '\u2026' : n.name,
    fullName:           n.name,
    dept:               n.dept,
    deptKey:            n.deptKey,
    serviceType:        n.serviceType,
    deadline:           n.deadline,
    desc:               n.desc,
    govuk_url:          n.govuk_url,
    proactive:          n.proactive,
    gated:              n.gated,
    universal:          n.eligibility.universal,
    means_tested:       n.eligibility.means_tested,
    eligibilitySummary: n.eligibility.summary,
    ruleIn:             n.eligibility.ruleIn,
    ruleOut:            n.eligibility.ruleOut,
    autoQualifiers:     n.eligibility.autoQualifiers  || [],
    exclusions:         n.eligibility.exclusions       || [],
  },
}));

const edgeElements = EDGES.map((e, i) => ({
  data: { id: `e${i}`, source: e.from, target: e.to, type: e.type },
}));

const lifeEventData = LIFE_EVENTS.map(evt => ({
  id: evt.id, icon: evt.icon, name: evt.name, desc: evt.desc, entryNodes: evt.entryNodes,
}));

const nodesJson      = JSON.stringify(nodeElements);
const edgesJson      = JSON.stringify(edgeElements);
const lifeEventsJson = JSON.stringify(lifeEventData);
const nodeCount      = Object.keys(NODES).length;
const edgeCount      = EDGES.length;
const eventCount     = LIFE_EVENTS.length;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UK Government Services Graph</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#0f1117;--surface:#161b22;--border:#21262d;--text:#c9d1d9;--muted:#8b949e;--accent:#58a6ff}
    body{background:var(--bg);color:var(--text);font-family:'Menlo','Monaco','Courier New',monospace;display:flex;height:100vh;overflow:hidden}

    /* ── Sidebar ─────────────────────────────────────────────────── */
    #sidebar{width:264px;min-width:264px;background:var(--surface);border-right:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column}
    .sb-head{padding:12px 14px 10px;border-bottom:1px solid var(--border)}
    .sb-head h1{font-size:.85rem;color:var(--accent);margin-bottom:3px}
    .sb-head p{font-size:.7rem;color:var(--muted);line-height:1.5;margin-top:4px}
    .sb-head a{color:var(--accent);text-decoration:none}
    .sb-head a:hover{text-decoration:underline}
    .sb-sec{padding:10px 14px;border-bottom:1px solid var(--border)}
    .sb-title{font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}
    #search{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:inherit;font-size:.78rem;padding:5px 8px;border-radius:4px;outline:none}
    #search:focus{border-color:var(--accent)}
    #search::placeholder{color:var(--muted)}

    .ev-btn{display:flex;align-items:flex-start;gap:7px;width:100%;background:none;border:1px solid transparent;border-radius:4px;color:var(--text);font-family:inherit;font-size:.75rem;padding:4px 6px;cursor:pointer;text-align:left;line-height:1.3;margin-bottom:2px}
    .ev-btn:hover{background:var(--bg);border-color:var(--border)}
    .ev-btn.active{background:#1a3050;border-color:var(--accent)}
    .ev-icon{font-size:.9rem;min-width:16px;padding-top:1px}
    .ev-name{font-weight:bold;font-size:.74rem}
    .ev-desc{color:var(--muted);font-size:.68rem;margin-top:1px}

    .dept-row{display:flex;align-items:center;gap:7px;padding:3px 6px;border-radius:4px;cursor:pointer;border:1px solid transparent;margin-bottom:2px;font-size:.76rem}
    .dept-row:hover{background:var(--bg);border-color:var(--border)}
    .dept-row.active{background:var(--bg);border-color:var(--border)}
    .dept-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
    .dept-count{color:var(--muted);font-size:.68rem;margin-left:auto}

    .tog{display:flex;align-items:center;gap:7px;margin-bottom:6px;font-size:.78rem;cursor:pointer}
    .tog input{cursor:pointer;accent-color:var(--accent)}
    .req-lbl{color:#60a5fa}
    .enb-lbl{color:#6b7280}

    .lay-btn{padding:4px 10px;font-size:.76rem;font-family:inherit;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:4px;cursor:pointer;margin-right:4px;margin-bottom:4px}
    .lay-btn:hover{border-color:var(--accent);color:var(--accent)}
    .lay-btn.active{border-color:var(--accent);color:var(--accent);background:#1a3050}

    .reset-btn{width:100%;padding:6px;font-size:.78rem;font-family:inherit;background:var(--bg);border:1px solid var(--border);color:var(--muted);border-radius:4px;cursor:pointer}
    .reset-btn:hover{border-color:#ef4444;color:#ef4444}

    /* ── Graph canvas ─────────────────────────────────────────────── */
    #graph-area{flex:1;position:relative;overflow:hidden}
    #cy{width:100%;height:100%;background:var(--bg)}

    #match-info{position:absolute;top:10px;left:10px;background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:4px 10px;font-size:.72rem;color:var(--muted);pointer-events:none;display:none}
    #match-info.vis{display:block}

    /* ── Detail panel ─────────────────────────────────────────────── */
    #detail{position:absolute;right:0;top:0;bottom:0;width:320px;background:var(--surface);border-left:1px solid var(--border);overflow-y:auto;padding:16px;transform:translateX(100%);transition:transform .2s ease}
    #detail.open{transform:translateX(0)}
    .det-close{float:right;background:none;border:none;color:var(--muted);font-size:1rem;cursor:pointer;padding:2px 5px}
    .det-close:hover{color:var(--text)}
    .det-name{font-size:.95rem;font-weight:bold;margin-bottom:8px;margin-right:24px;line-height:1.4}
    .bdg{display:inline-block;padding:2px 7px;border-radius:3px;font-size:.68rem;margin-right:4px;margin-bottom:5px}
    .bdg-dept{background:#1f3a5f;color:var(--accent)}
    .bdg-type{background:#1a3520;color:#22c55e}
    .bdg-dl{background:#4a1f1f;color:#ef4444}
    .bdg-pro{background:#3a2f12;color:#eab308}
    .bdg-gat{background:#2a2040;color:#a855f7}
    .bdg-uni{background:#1a3520;color:#22c55e}
    .bdg-mns{background:#4a1f1f;color:#ef4444}
    .det-desc{font-size:.78rem;color:var(--text);line-height:1.6;margin:10px 0;border-left:2px solid var(--border);padding-left:8px}
    .det-elig{font-size:.73rem;color:var(--muted);line-height:1.5;margin:8px 0;font-style:italic}
    .det-stitle{font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin:12px 0 4px}
    .det-list{list-style:none}
    .det-list li{font-size:.73rem;color:var(--text);padding:3px 0;border-bottom:1px solid var(--border)}
    .det-list li:last-child{border-bottom:none}
    .det-nid{color:var(--muted);font-size:.63rem}
    .det-link{display:block;color:var(--accent);font-size:.72rem;text-decoration:none;margin-top:10px;word-break:break-all}
    .det-link:hover{text-decoration:underline}
    .det-id{font-size:.63rem;color:var(--muted);margin-top:6px}
    .stats-line{font-size:.7rem;color:var(--muted);line-height:1.9}
    .stats-line span{color:var(--text)}
    .elig-tags{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}
    .etag{font-size:.67rem;padding:2px 7px;border-radius:10px;line-height:1.5}
    .etag-in{background:#0f2d1a;color:#3fb950;border:1px solid #238636}
    .etag-out{background:#2d0f0f;color:#f85149;border:1px solid #6e2222}
    .aq-list{list-style:none;margin:4px 0 8px}
    .aq-list li{font-size:.72rem;line-height:1.5;padding:2px 0 2px 14px;position:relative;color:#3fb950}
    .aq-list li::before{content:'\u2713';position:absolute;left:0;color:#238636}
    .ex-list{list-style:none;margin:4px 0 8px}
    .ex-list li{font-size:.72rem;line-height:1.5;padding:2px 0 2px 14px;position:relative;color:#f85149}
    .ex-list li::before{content:'\u2717';position:absolute;left:0;color:#6e2222}
  </style>
</head>
<body>
  <div id="sidebar">
    <div class="sb-head">
      <h1>UK Services Graph</h1>
      <p>A proof-of-concept service graph for UK government life events. Click a life event to trace its journey. Click any node for details.</p>
    </div>
    <div class="sb-sec">
      <div class="sb-title">Search</div>
      <input id="search" type="text" placeholder="Filter services\u2026" autocomplete="off">
    </div>
    <div class="sb-sec">
      <div class="sb-title">Life Events &mdash; click to trace journey</div>
      <div id="ev-list"></div>
    </div>
    <div class="sb-sec">
      <div class="sb-title">Departments</div>
      <div id="dept-list"></div>
    </div>
    <div class="sb-sec">
      <div class="sb-title">Edge Types</div>
      <label class="tog"><input type="checkbox" id="tog-req" checked><span class="req-lbl">&#8212; REQUIRES</span> <span style="font-size:.65rem;color:var(--muted)">(strict order)</span></label>
      <label class="tog"><input type="checkbox" id="tog-enb" checked><span class="enb-lbl">&#8943; ENABLES</span> <span style="font-size:.65rem;color:var(--muted)">(unlocks)</span></label>
    </div>
    <div class="sb-sec">
      <div class="sb-title">Layout</div>
      <button class="lay-btn active" data-layout="cose">Force</button>
      <button class="lay-btn" data-layout="dagre">Hierarchy</button>
      <button class="lay-btn" data-layout="breadthfirst">BFS</button>
    </div>
    <div class="sb-sec">
      <button class="reset-btn" id="reset-btn">Reset All</button>
    </div>
    <div class="sb-sec" style="flex:1;border-bottom:none">
      <div class="stats-line">
        <div><span>${nodeCount}</span> services</div>
        <div><span>${edgeCount}</span> relationships</div>
        <div><span>${eventCount}</span> life events</div>
      </div>
    </div>
  </div>

  <div id="graph-area">
    <div id="match-info"></div>
    <div id="cy"></div>
    <div id="detail">
      <button class="det-close" id="det-close">&#x2715;</button>
      <div id="det-body"></div>
    </div>
  </div>

  <script src="https://unpkg.com/cytoscape@3.30.2/dist/cytoscape.min.js"></script>
  <script src="https://unpkg.com/dagre@0.8.5/dist/dagre.min.js"></script>
  <script src="https://unpkg.com/cytoscape-dagre@2.5.0/cytoscape-dagre.js"></script>
  <script>
    var DEPT_COLORS = {
      gro:'#4f86c6', hmrc:'#22c55e', dwp:'#a855f7', dvla:'#ef4444',
      hmcts:'#f97316', opg:'#06b6d4', nhs:'#ec4899', ho:'#94a3b8',
      ch:'#eab308', la:'#84cc16', lr:'#64748b', other:'#9ca3af'
    };

    var NODES_DATA   = ${nodesJson};
    var EDGES_DATA   = ${edgesJson};
    var EVENTS_DATA  = ${lifeEventsJson};

    NODES_DATA.forEach(function(n) {
      n.data.color = DEPT_COLORS[n.data.deptKey] || '#9ca3af';
    });

    var ADJ = {};
    EDGES_DATA.forEach(function(e) {
      var s = e.data.source;
      if (!ADJ[s]) ADJ[s] = [];
      ADJ[s].push(e.data.target);
    });

    function getReachable(seeds) {
      var visited = {}, queue = seeds.slice();
      seeds.forEach(function(id) { visited[id] = true; });
      while (queue.length) {
        var cur = queue.shift();
        (ADJ[cur] || []).forEach(function(nxt) {
          if (!visited[nxt]) { visited[nxt] = true; queue.push(nxt); }
        });
      }
      return visited;
    }

    var deptCounts = {};
    NODES_DATA.forEach(function(n) {
      var dk = n.data.deptKey, dp = n.data.dept;
      if (!deptCounts[dk]) deptCounts[dk] = { name: dp, count: 0 };
      deptCounts[dk].count++;
    });
    var deptListEl = document.getElementById('dept-list');
    Object.keys(deptCounts).sort().forEach(function(dk) {
      var info = deptCounts[dk];
      var row = document.createElement('div');
      row.className = 'dept-row'; row.dataset.dept = dk;
      row.innerHTML = '<div class="dept-dot" style="background:' + (DEPT_COLORS[dk] || '#9ca3af') + '"></div>'
        + '<span>' + info.name + '</span>'
        + '<span class="dept-count">' + info.count + '</span>';
      row.addEventListener('click', function() { onDeptClick(dk, row); });
      deptListEl.appendChild(row);
    });

    var evListEl = document.getElementById('ev-list');
    EVENTS_DATA.forEach(function(evt) {
      var btn = document.createElement('button');
      btn.className = 'ev-btn'; btn.dataset.eid = evt.id;
      btn.innerHTML = '<span class="ev-icon">' + evt.icon + '</span>'
        + '<div><div class="ev-name">' + evt.name + '</div>'
        + '<div class="ev-desc">' + evt.desc + '</div></div>';
      btn.addEventListener('click', function() { onEvClick(evt.id, btn); });
      evListEl.appendChild(btn);
    });

    var cy = cytoscape({
      container: document.getElementById('cy'),
      elements: NODES_DATA.concat(EDGES_DATA),
      style: [
        { selector: 'node', style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'font-size': 9, 'font-family': 'Menlo,Monaco,monospace',
            'color': '#fff', 'text-valign': 'center', 'text-halign': 'center',
            'width': 110, 'height': 38, 'shape': 'round-rectangle',
            'border-width': 1, 'border-color': 'rgba(255,255,255,0.12)',
            'text-wrap': 'wrap', 'text-max-width': 102,
        }},
        { selector: 'edge[type="REQUIRES"]', style: {
            'line-color': '#3b82f6', 'target-arrow-color': '#3b82f6',
            'target-arrow-shape': 'triangle', 'curve-style': 'bezier',
            'width': 2, 'line-style': 'solid', 'opacity': 0.75,
        }},
        { selector: 'edge[type="ENABLES"]', style: {
            'line-color': '#4b5563', 'target-arrow-color': '#4b5563',
            'target-arrow-shape': 'triangle', 'curve-style': 'bezier',
            'width': 1.5, 'line-style': 'dashed', 'opacity': 0.55,
        }},
        { selector: '.hl',  style: { 'opacity': 1 }},
        { selector: 'node.hl', style: { 'border-width': 2.5, 'border-color': '#fbbf24' }},
        { selector: 'edge.hl[type="REQUIRES"]', style: { 'line-color': '#60a5fa', 'target-arrow-color': '#60a5fa', 'opacity': 1 }},
        { selector: 'edge.hl[type="ENABLES"]',  style: { 'line-color': '#6b7280', 'target-arrow-color': '#6b7280', 'opacity': 0.85 }},
        { selector: '.dim', style: { 'opacity': 0.07 }},
        { selector: 'node.sel', style: { 'border-width': 3, 'border-color': '#fff' }},
        { selector: '.hidden', style: { 'display': 'none' }},
      ],
      layout: {
        name: 'cose', animate: false, fit: true, padding: 30,
        idealEdgeLength: 120, nodeRepulsion: 480000, edgeElasticity: 100,
        gravity: 80, numIter: 1000, nodeOverlap: 30, componentSpacing: 100,
      }
    });

    var activeEv = null, activeDept = null;

    function clearFilters() {
      activeEv = null; activeDept = null;
      document.querySelectorAll('.ev-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.dept-row').forEach(function(r) { r.classList.remove('active'); });
      cy.elements().removeClass('hl dim');
    }

    function onEvClick(eid, btn) {
      if (activeEv === eid) { activeEv = null; btn.classList.remove('active'); cy.elements().removeClass('hl dim'); return; }
      activeEv = eid; activeDept = null;
      document.querySelectorAll('.ev-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.dept-row').forEach(function(r) { r.classList.remove('active'); });
      btn.classList.add('active');
      var evt = EVENTS_DATA.find(function(e) { return e.id === eid; });
      var reach = getReachable(evt.entryNodes);
      cy.batch(function() {
        cy.elements().removeClass('hl dim');
        cy.nodes().forEach(function(n) { n.addClass(reach[n.id()] ? 'hl' : 'dim'); });
        cy.edges().forEach(function(e) { e.addClass((reach[e.data('source')] && reach[e.data('target')]) ? 'hl' : 'dim'); });
      });
    }

    function onDeptClick(dk, row) {
      if (activeDept === dk) { activeDept = null; row.classList.remove('active'); cy.elements().removeClass('hl dim'); return; }
      activeDept = dk; activeEv = null;
      document.querySelectorAll('.ev-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.dept-row').forEach(function(r) { r.classList.remove('active'); });
      row.classList.add('active');
      cy.batch(function() {
        cy.elements().removeClass('hl dim');
        cy.nodes().forEach(function(n) { n.addClass(n.data('deptKey') === dk ? 'hl' : 'dim'); });
        cy.edges().forEach(function(e) {
          var sd = cy.getElementById(e.data('source')).data('deptKey');
          var td = cy.getElementById(e.data('target')).data('deptKey');
          e.addClass((sd === dk || td === dk) ? 'hl' : 'dim');
        });
      });
    }

    var matchInfo = document.getElementById('match-info');
    document.getElementById('search').addEventListener('input', function() {
      var q = this.value.trim().toLowerCase();
      if (!q) { clearFilters(); matchInfo.classList.remove('vis'); return; }
      activeEv = null; activeDept = null;
      document.querySelectorAll('.ev-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.dept-row').forEach(function(r) { r.classList.remove('active'); });
      var hits = 0;
      cy.batch(function() {
        cy.elements().removeClass('hl dim');
        cy.nodes().forEach(function(n) {
          var match = n.data('fullName').toLowerCase().includes(q)
                   || n.id().toLowerCase().includes(q)
                   || n.data('dept').toLowerCase().includes(q);
          n.addClass(match ? 'hl' : 'dim');
          if (match) hits++;
        });
        cy.edges().addClass('dim');
      });
      matchInfo.textContent = hits + ' match' + (hits === 1 ? '' : 'es');
      matchInfo.classList.add('vis');
    });

    document.getElementById('tog-req').addEventListener('change', function() {
      cy.edges('[type="REQUIRES"]').toggleClass('hidden', !this.checked);
    });
    document.getElementById('tog-enb').addEventListener('change', function() {
      cy.edges('[type="ENABLES"]').toggleClass('hidden', !this.checked);
    });

    document.querySelectorAll('.lay-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.lay-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var name = btn.dataset.layout;
        var opts = { name: name, animate: false, fit: true, padding: 30 };
        if (name === 'cose') {
          Object.assign(opts, { idealEdgeLength: 120, nodeRepulsion: 480000, edgeElasticity: 100, gravity: 80, numIter: 1000, nodeOverlap: 30 });
        } else if (name === 'dagre') {
          Object.assign(opts, { rankDir: 'TB', nodeSep: 55, rankSep: 75, edgeSep: 10 });
        } else if (name === 'breadthfirst') {
          Object.assign(opts, { directed: true, spacingFactor: 1.3 });
        }
        cy.layout(opts).run();
      });
    });

    document.getElementById('reset-btn').addEventListener('click', function() {
      document.getElementById('search').value = '';
      matchInfo.classList.remove('vis');
      clearFilters();
    });

    var detPanel = document.getElementById('detail');
    var detBody  = document.getElementById('det-body');
    document.getElementById('det-close').addEventListener('click', function() {
      detPanel.classList.remove('open');
      cy.nodes().removeClass('sel');
    });

    cy.on('tap', 'node', function(evt) {
      var node = evt.target;
      cy.nodes().removeClass('sel');
      node.addClass('sel');
      var d = node.data();

      var inEdges = [], outEdges = [];
      node.incomers('edge').forEach(function(e) {
        inEdges.push({ name: e.source().data('fullName'), id: e.source().id(), type: e.data('type') });
      });
      node.outgoers('edge').forEach(function(e) {
        outEdges.push({ name: e.target().data('fullName'), id: e.target().id(), type: e.data('type') });
      });

      var badges = '<span class="bdg bdg-dept">' + d.dept + '</span>'
        + '<span class="bdg bdg-type">' + d.serviceType + '</span>'
        + (d.deadline ? '<span class="bdg bdg-dl">&#x23F1; ' + d.deadline + '</span>' : '')
        + (d.proactive    ? '<span class="bdg bdg-pro">proactive</span>'    : '')
        + (d.gated        ? '<span class="bdg bdg-gat">gated</span>'        : '')
        + (d.universal    ? '<span class="bdg bdg-uni">universal</span>'    : '')
        + (d.means_tested ? '<span class="bdg bdg-mns">means-tested</span>' : '');

      var lifeEvts = EVENTS_DATA.filter(function(ev) {
        return ev.entryNodes.indexOf(d.id) !== -1;
      }).map(function(ev) { return ev.icon + ' ' + ev.name; }).join(', ');

      function nodeList(arr) {
        return arr.map(function(n) {
          return '<li>' + n.name + '<br><span class="det-nid">' + n.type + '  ' + n.id + '</span></li>';
        }).join('');
      }

      detBody.innerHTML =
        '<p class="det-name">' + d.fullName + '</p>'
        + '<div>' + badges + '</div>'
        + '<p class="det-desc">' + d.desc + '</p>'
        + '<p class="det-elig">' + d.eligibilitySummary + '</p>'
        + (d.ruleIn  && d.ruleIn.length
            ? '<div class="elig-tags">'
              + d.ruleIn.map(function(s){ return '<span class="etag etag-in">\u2713 '+s+'</span>'; }).join('')
              + '</div>' : '')
        + (d.ruleOut && d.ruleOut.length
            ? '<div class="elig-tags">'
              + d.ruleOut.map(function(s){ return '<span class="etag etag-out">\u2717 '+s+'</span>'; }).join('')
              + '</div>' : '')
        + (d.autoQualifiers && d.autoQualifiers.length
            ? '<p class="det-stitle">Auto-qualifiers</p>'
              + '<ul class="aq-list">'
              + d.autoQualifiers.map(function(s){ return '<li>'+s+'</li>'; }).join('')
              + '</ul>' : '')
        + (d.exclusions && d.exclusions.length
            ? '<p class="det-stitle">Exclusions</p>'
              + '<ul class="ex-list">'
              + d.exclusions.map(function(s){ return '<li>'+s+'</li>'; }).join('')
              + '</ul>' : '')
        + (lifeEvts ? '<p class="det-stitle">Entry point for</p><p style="font-size:.73rem">' + lifeEvts + '</p>' : '')
        + (inEdges.length  ? '<p class="det-stitle">Prerequisites (' + inEdges.length + ')</p><ul class="det-list">' + nodeList(inEdges) + '</ul>' : '')
        + (outEdges.length ? '<p class="det-stitle">Leads to (' + outEdges.length + ')</p><ul class="det-list">' + nodeList(outEdges) + '</ul>' : '')
        + '<a class="det-link" href="' + d.govuk_url + '" target="_blank" rel="noopener">&#x2197; ' + d.govuk_url + '</a>'
        + '<p class="det-id">' + d.id + '</p>';

      detPanel.classList.add('open');
    });

    cy.on('tap', function(evt) {
      if (evt.target === cy) { detPanel.classList.remove('open'); cy.nodes().removeClass('sel'); }
    });
  </script>
</body>
</html>`;

writeFileSync(new URL('../index.html', import.meta.url), html, 'utf8');
console.error(`index.html written — ${nodeCount} nodes, ${edgeCount} edges, ${eventCount} life events`);
