// flow: generic SVG architecture / workflow diagram (draggable nodes, step walk-through).
export const meta = { name: 'flow', title: 'Flow diagram', blurb: 'Boxes and arrows you can drag, explore and walk through step by step.', level: 0, skills: [] };

const SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, a = {}, ...kids) {
  const svg = tag.startsWith('svg:');
  const e = svg ? document.createElementNS(SVGNS, tag.slice(4)) : document.createElement(tag);
  for (const [n, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (n === 'class') e.setAttribute('class', v);
    else if (n === 'text') e.textContent = v;
    else if (n.startsWith('on')) e.addEventListener(n.slice(2), v);
    else e.setAttribute(n, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

const KINDS = {
  input: 'Input', process: 'Process', store: 'Store', model: 'Model', tool: 'Tool', output: 'Output', human: 'Human',
};
// 16x16 icon paths (stroke only)
const ICONS = {
  input: 'M2 8h8M7 4l4 4-4 4M13 3v10',
  process: 'M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2M4.2 4.2l1.4 1.4M10.4 10.4l1.4 1.4M4.2 11.8l1.4-1.4M10.4 5.6l1.4-1.4M8 6a2 2 0 100 4 2 2 0 000-4z',
  store: 'M3 4c0-1.1 2.2-2 5-2s5 .9 5 2-2.2 2-5 2-5-.9-5-2zM3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2',
  model: 'M8 1.5l1.4 4.1 4.1 1.4-4.1 1.4L8 12.5 6.6 8.4 2.5 7l4.1-1.4zM13 11l.6 1.4L15 13l-1.4.6L13 15l-.6-1.4L11 13l1.4-.6z',
  tool: 'M10.5 2.5a3 3 0 00-2.7 4.2L2.5 12l1.5 1.5 5.3-5.3a3 3 0 004.2-2.7l-2 2-1.5-.5-.5-1.5z',
  output: 'M3 8h8M8 4l4 4-4 4M2 3v10',
  human: 'M8 2.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 14c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5',
};

function wrap(text, max) {
  const out = []; let line = '';
  for (let w of String(text).split(/\s+/)) {
    while (w.length > max) { if (line) { out.push(line); line = ''; } out.push(w.slice(0, max - 1) + '-'); w = w.slice(max - 1); }
    if (!line) line = w; else if ((line + ' ' + w).length <= max) line += ' ' + w; else { out.push(line); line = w; }
  }
  if (line) out.push(line);
  return out.length ? out : [''];
}

function shapePath(kind, w, h2) {
  const a = w / 2, b = h2 / 2;
  switch (kind) {
    case 'input': { const s = 14; return `M${-a + s},${-b}L${a},${-b}L${a - s},${b}L${-a},${b}Z`; }
    case 'model': { const s = 16; return `M${-a + s},${-b}L${a - s},${-b}L${a},0L${a - s},${b}L${-a + s},${b}L${-a},0Z`; }
    case 'tool': { const c = 11; return `M${-a + c},${-b}L${a},${-b}L${a},${b - c}L${a - c},${b}L${-a},${b}L${-a},${-b + c}Z`; }
    case 'output': return `M${-a + b},${-b}L${a - b},${-b}A${b},${b} 0 0 1 ${a - b},${b}L${-a + b},${b}A${b},${b} 0 0 1 ${-a + b},${-b}Z`;
    case 'human': return `M${-a},0A${a},${b} 0 1 1 ${a},0A${a},${b} 0 1 1 ${-a},0Z`;
    case 'store': { const r = 9; return `M${-a},${-b + r}A${a},${r} 0 0 1 ${a},${-b + r}L${a},${b - r}A${a},${r} 0 0 1 ${-a},${b - r}ZM${-a},${-b + r}A${a},${r} 0 0 0 ${a},${-b + r}`; }
    default: return `M${-a + 12},${-b}L${a - 12},${-b}Q${a},${-b} ${a},${-b + 12}L${a},${b - 12}Q${a},${b} ${a - 12},${b}L${-a + 12},${b}Q${-a},${b} ${-a},${b - 12}L${-a},${-b + 12}Q${-a},${-b} ${-a + 12},${-b}Z`;
  }
}

export function mount(el, props = {}, ctx = {}) {
  const nodes = (props.nodes || []).map((n) => ({ kind: 'process', ...n }));
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = (props.edges || []).filter((e) => byId[e[0]] && byId[e[1]]);
  const steps = Array.isArray(props.steps) && props.steps.length ? props.steps : null;
  const baseH = props.height || 420;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pos = Object.fromEntries(nodes.map((n) => [n.id, { x: n.x ?? 50, y: n.y ?? 50 }]));
  const moved = new Set();
  let W = 0, H = 0, NW = 150, FS = 14, LH = 17, PADX = 90, PADY = 40;
  let P = {}, geo = {}, nodeEls = {}, edgeEls = [];
  let stepIdx = steps ? 0 : -1, selected = null, timer = null, svg = null;

  const root = h('div', { class: 'w-b-card w-flow' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const stage = h('div', { class: 'w-flow-stage' });
  const info = h('div', { class: 'w-flow-info' });
  const legend = h('div', { class: 'w-flow-legend', 'aria-label': 'Shape key' });
  const controls = h('div', { class: 'w-b-row w-flow-controls' });
  const prev = h('button', { class: 'w-b-btn', type: 'button', onclick: () => go(stepIdx - 1) }, '← Prev');
  const next = h('button', { class: 'w-b-btn w-b-primary', type: 'button', onclick: () => go(stepIdx + 1) }, 'Next →');
  const play = h('button', { class: 'w-b-btn', type: 'button', onclick: togglePlay }, '▶ Play');
  const all = h('button', { class: 'w-b-btn', type: 'button', onclick: () => { stop(); stepIdx = -1; refreshSteps(); } }, 'Show all');
  const reset = h('button', { class: 'w-b-btn', type: 'button', onclick: resetLayout }, 'Reset layout');
  if (steps) controls.append(prev, next, play, all);
  controls.append(reset);
  root.append(...[
    props.title ? h('h3', { class: 'w-b-title', text: props.title }) : null,
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), props.hint || (steps ? 'press Next to walk through the steps, then drag a box to rearrange (or focus one and use the arrow keys).' : 'drag a box to rearrange, or focus one and press Enter to read its note.')),
    stage, controls, info, legend, live,
    h('ul', { class: 'w-b-sr' }, edges.map((e) => h('li', { text: `${byId[e[0]].label} to ${byId[e[1]].label}${e[2] ? ': ' + e[2] : ''}` }))),
  ].filter(Boolean));
  el.append(root);

  const used = [...new Set(nodes.map((n) => n.kind))].filter((k) => KINDS[k]);
  legend.append(...used.map((k) => h('span', { class: `w-flow-key w-flow-k-${k}` },
    (() => { const s = h('svg:svg', { viewBox: '0 0 30 20', width: 30, height: 20, 'aria-hidden': 'true' }, h('svg:path', { class: 'w-flow-shape', d: shapePath(k, 26, 16), transform: 'translate(15 10)' })); return s; })(), KINDS[k])));

  function announce(t) { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); if (ctx.announce) ctx.announce(t); }

  function build() {
    const cw = Math.max(280, stage.clientWidth || el.clientWidth || 600);
    W = Math.min(1000, Math.max(380, cw));
    const narrow = W < 600;
    const rows = {}; nodes.forEach((n) => { const k = Math.round(pos[n.id].y / 14); rows[k] = (rows[k] || 0) + 1; });
    const rowMax = Math.max(1, ...Object.values(rows));
    NW = Math.min(narrow ? 126 : 156, Math.floor((W - 28) / rowMax) - 14);
    if (NW < 100) { NW = 100; W = rowMax * 114 + 28; }
    FS = Math.max(13, Math.ceil(12 / Math.min(1, cw / W))); LH = Math.round(FS * 1.22);
    const maxChars = Math.floor((NW - 22) / (FS * 0.56));
    H = baseH * (narrow ? 1.35 : 1);
    PADX = NW / 2 + 8; PADY = 34;
    geo = {};
    for (const n of nodes) {
      const lines = wrap(n.label, n.kind === 'human' ? maxChars - 3 : maxChars);
      const w = NW, hh = Math.max(46, lines.length * LH + (n.kind === 'store' ? 30 : n.kind === 'human' ? 28 : 22));
      geo[n.id] = { lines, w, h: hh };
      P[n.id] = { x: PADX + (pos[n.id].x / 100) * (W - 2 * PADX), y: PADY + (pos[n.id].y / 100) * (H - 2 * PADY) };
    }
    relax();
    let maxY = 0; for (const n of nodes) maxY = Math.max(maxY, P[n.id].y + geo[n.id].h / 2 + 14);
    H = Math.max(H, maxY);
    stage.textContent = '';
    svg = h('svg:svg', { class: 'w-flow-svg', viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': (props.title || 'Diagram') + ' with ' + nodes.length + ' boxes. Boxes can be dragged or moved with arrow keys.' });
    const defs = h('svg:defs', {},
      ...['', '-on'].map((s) => h('svg:marker', { id: `wf-arrow${s}-${uid}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerUnits: 'userSpaceOnUse', markerWidth: 11, markerHeight: 11, orient: 'auto-start-reverse' }, h('svg:path', { class: 'w-flow-arrowhead' + s, d: 'M0 0L10 5L0 10z' }))));
    const eg = h('svg:g', { 'aria-hidden': 'true' });
    const ng = h('svg:g');
    edgeEls = edges.map((e) => {
      const path = h('svg:path', { class: 'w-flow-edge', fill: 'none', 'marker-end': `url(#wf-arrow-${uid})` });
      const lab = e[2] ? h('svg:text', { class: 'w-flow-elabel', 'text-anchor': 'middle', 'font-size': FS, text: e[2] }) : null;
      eg.append(path); if (lab) eg.append(lab);
      return { e, path, lab };
    });
    nodeEls = {};
    for (const n of nodes) {
      const g = geo[n.id];
      const ring = h('svg:rect', { class: 'w-flow-ring', x: -g.w / 2 - 5, y: -g.h / 2 - 5, width: g.w + 10, height: g.h + 10, rx: 14 });
      const shape = h('svg:path', { class: 'w-flow-shape', d: shapePath(n.kind, g.w, g.h) });
      const ty = -((g.lines.length - 1) * LH) / 2 + (n.kind === 'store' ? 6 : 0);
      const txt = h('svg:text', { class: 'w-flow-text', 'text-anchor': 'middle', 'font-size': FS },
        g.lines.map((l, i) => h('svg:tspan', { x: 0, y: ty + i * LH + 5, text: l })));
      const badge = h('svg:g', { transform: `translate(${-g.w / 2 + 4} ${-g.h / 2 + 2})` },
        h('svg:circle', { class: 'w-flow-badge', r: 12 }),
        h('svg:path', { class: 'w-flow-icon', d: ICONS[n.kind] || ICONS.process, transform: 'translate(-8 -8)' }));
      const note = n.note ? h('svg:g', { transform: `translate(${g.w / 2 - 6} ${-g.h / 2 + 2})` }, h('svg:circle', { class: 'w-flow-badge', r: 9 }), h('svg:text', { class: 'w-flow-i', 'text-anchor': 'middle', y: 4, 'font-size': 12, text: 'i' })) : null;
      const gEl = h('svg:g', { class: `w-flow-node w-flow-k-${n.kind}`, tabindex: 0, role: 'button', 'data-id': n.id,
        'aria-label': `${n.label}, ${KINDS[n.kind] || 'step'}.${n.note ? ' Enter shows details.' : ''} Arrow keys move it.` }, ring, shape, txt, badge, note);
      gEl.addEventListener('pointerdown', (ev) => dragStart(ev, n, gEl));
      gEl.addEventListener('keydown', (ev) => keyMove(ev, n));
      gEl.addEventListener('focus', () => { selected = n.id; });
      ng.append(gEl);
      nodeEls[n.id] = gEl;
    }
    svg.append(defs, eg, ng);
    stage.append(svg);
    place(); refreshSteps(true);
  }

  function relax() {
    const ids = nodes.map((n) => n.id), m = 12;
    for (let it = 0; it < 60; it++) {
      let any = false;
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i], b = ids[j], A = P[a], B = P[b], ga = geo[a], gb = geo[b];
        const ox = (ga.w + gb.w) / 2 + m - Math.abs(A.x - B.x), oy = (ga.h + gb.h) / 2 + m - Math.abs(A.y - B.y);
        if (ox <= 0 || oy <= 0) continue;
        any = true;
        const fa = moved.has(a), fb = moved.has(b);
        const wa = fa ? 0 : fb ? 1 : 0.5, wb = fb ? 0 : fa ? 1 : 0.5;
        if (ox < oy) { const d = (A.x < B.x ? -1 : 1); A.x += d * ox * wa; B.x -= d * ox * wb; }
        else { const d = (A.y < B.y ? -1 : 1); A.y += d * oy * wa; B.y -= d * oy * wb; }
      }
      for (const id of ids) { const g = geo[id]; P[id].x = Math.min(W - g.w / 2 - 14, Math.max(g.w / 2 + 14, P[id].x)); P[id].y = Math.max(g.h / 2 + 6, P[id].y); }
      if (!any) break;
    }
  }

  function clipPt(c, o, g) { // point on node box border toward o
    const dx = o.x - c.x, dy = o.y - c.y;
    const t = Math.min(dx ? (g.w / 2 + 3) / Math.abs(dx) : 1e9, dy ? (g.h / 2 + 3) / Math.abs(dy) : 1e9);
    return { x: c.x + dx * t, y: c.y + dy * t };
  }

  function place() {
    for (const n of nodes) nodeEls[n.id].setAttribute('transform', `translate(${P[n.id].x.toFixed(1)} ${P[n.id].y.toFixed(1)})`);
    for (const { e, path, lab } of edgeEls) {
      const A = P[e[0]], B = P[e[1]]; if (e[0] === e[1]) continue;
      const rev = edges.some((q) => q[0] === e[1] && q[1] === e[0]);
      let dx = B.x - A.x, dy = B.y - A.y; const len = Math.hypot(dx, dy) || 1;
      const off = rev ? 9 : 0, nx = (-dy / len) * off, ny = (dx / len) * off;
      const a = clipPt({ x: A.x + nx, y: A.y + ny }, { x: B.x + nx, y: B.y + ny }, geo[e[0]]);
      const b = clipPt({ x: B.x + nx, y: B.y + ny }, { x: A.x + nx, y: A.y + ny }, geo[e[1]]);
      path.setAttribute('d', `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      if (lab) { lab.setAttribute('x', ((a.x + b.x) / 2).toFixed(1)); lab.setAttribute('y', ((a.y + b.y) / 2 - 5).toFixed(1)); }
    }
  }

  function toPct(id) {
    pos[id] = { x: ((P[id].x - PADX) / (W - 2 * PADX)) * 100, y: ((P[id].y - PADY) / (H - 2 * PADY)) * 100 };
    moved.add(id);
  }

  function dragStart(ev, n, gEl) {
    if (ev.button > 0) return;
    const pt = svg.createSVGPoint();
    const to = (e) => { pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
    const s = to(ev), o = { x: P[n.id].x, y: P[n.id].y }; let did = false;
    try { gEl.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
    const mv = (e) => {
      const c = to(e), dx = c.x - s.x, dy = c.y - s.y;
      if (!did && Math.hypot(dx, dy) < 4) return;
      did = true; gEl.classList.add('is-drag');
      const g = geo[n.id];
      P[n.id].x = Math.min(W - g.w / 2 - 14, Math.max(g.w / 2 + 14, o.x + dx));
      P[n.id].y = Math.min(H - g.h / 2 - 4, Math.max(g.h / 2 + 4, o.y + dy));
      place();
    };
    const up = () => {
      gEl.removeEventListener('pointermove', mv); gEl.removeEventListener('pointerup', up); gEl.removeEventListener('pointercancel', up);
      gEl.classList.remove('is-drag');
      if (did) { toPct(n.id); announce(`${n.label} moved.`); } else showNote(n);
    };
    gEl.addEventListener('pointermove', mv); gEl.addEventListener('pointerup', up); gEl.addEventListener('pointercancel', up);
  }

  function keyMove(ev, n) {
    const k = ev.key;
    if (k === 'Enter' || k === ' ') { ev.preventDefault(); showNote(n); return; }
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
    if (!d) return;
    ev.preventDefault();
    const step = ev.shiftKey ? 40 : 12, g = geo[n.id];
    P[n.id].x = Math.min(W - g.w / 2 - 14, Math.max(g.w / 2 + 14, P[n.id].x + d[0] * step));
    P[n.id].y = Math.min(H - g.h / 2 - 4, Math.max(g.h / 2 + 4, P[n.id].y + d[1] * step));
    toPct(n.id); place();
    announce(`${n.label} moved ${k.replace('Arrow', '').toLowerCase()}.`);
  }

  function showNote(n) {
    selected = n.id;
    for (const id in nodeEls) nodeEls[id].classList.toggle('is-selected', id === n.id);
    info.textContent = '';
    info.append(h('b', { text: n.label }), ' ', h('span', { class: 'w-flow-kind', text: `(${KINDS[n.kind] || 'step'})` }), h('p', { text: n.note || 'No extra note for this box. Try the others.' }));
    announce(`${n.label}. ${n.note || ''}`);
  }

  function refreshSteps(quiet) {
    const st = steps && stepIdx >= 0 ? steps[stepIdx] : null;
    const show = st ? new Set(st.show || []) : null;
    for (const n of nodes) { const on = !show || show.has(n.id); nodeEls[n.id].classList.toggle('is-dim', !on); nodeEls[n.id].classList.toggle('is-active', !!show && on); }
    edgeEls.forEach(({ e, path, lab }) => {
      const on = !show || (show.has(e[0]) && show.has(e[1]));
      path.classList.toggle('is-dim', !on); path.classList.toggle('is-active', !!show && on);
      path.setAttribute('marker-end', `url(#wf-arrow${show && on ? '-on' : ''}-${uid})`);
      if (lab) lab.classList.toggle('is-dim', !on);
    });
    if (steps) {
      prev.disabled = stepIdx <= 0; next.disabled = stepIdx >= steps.length - 1;
      if (st) { info.textContent = ''; info.append(h('b', { text: `Step ${stepIdx + 1} of ${steps.length}. ` }), st.text); if (!quiet) announce(`Step ${stepIdx + 1} of ${steps.length}. ${st.text}`); }
      else if (!quiet) { info.textContent = 'Showing the whole diagram.'; announce('Showing the whole diagram.'); }
      else info.textContent = '';
    }
    if (!st && !quiet && !steps) info.textContent = '';
  }

  function go(i) { stop(); stepIdx = Math.max(0, Math.min(steps.length - 1, i)); refreshSteps(); }
  function stop() { if (timer) { clearInterval(timer); timer = null; play.textContent = '▶ Play'; } }
  function togglePlay() {
    if (timer) return stop();
    if (stepIdx >= steps.length - 1) stepIdx = -1;
    play.textContent = '⏸ Pause';
    const tick = () => { if (stepIdx >= steps.length - 1) return stop(); stepIdx++; refreshSteps(); if (stepIdx >= steps.length - 1) stop(); };
    tick(); if (timer === null && play.textContent.includes('Pause')) timer = setInterval(tick, reduce.matches ? 4000 : 2600);
  }
  function resetLayout() { moved.clear(); for (const n of nodes) pos[n.id] = { x: n.x ?? 50, y: n.y ?? 50 }; build(); announce('Layout reset.'); }

  const uid = Math.random().toString(36).slice(2, 7);
  let lastW = 0;
  const ro = new ResizeObserver(() => { const w = stage.clientWidth; if (Math.abs(w - lastW) > 4) { lastW = w; build(); } });
  build(); lastW = stage.clientWidth; ro.observe(stage);
  if (steps) refreshSteps();
  return () => { stop(); ro.disconnect(); };
}
