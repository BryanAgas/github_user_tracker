// evalmatrix: confusion matrix + threshold slider over a fixed scored dataset, with scenario-specific costs.
export const meta = { name: 'evalmatrix', title: 'Precision, recall and thresholds', blurb: 'Slide a decision threshold over 100 scored items and see why the best setting depends on the cost of each mistake.', level: 2, skills: ['l2.eval'] };

function h(tag, a = {}, ...kids) {
  const svg = tag.startsWith('svg:');
  const e = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag.slice(4)) : document.createElement(tag);
  for (const [n, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (n === 'class') e.setAttribute('class', v); else if (n === 'style') e.style.cssText = v; else if (n === 'text') e.textContent = v;
    else if (n.startsWith('on')) e.addEventListener(n.slice(2), v); else e.setAttribute(n, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function makeData() {
  const r = mulberry32(2024), g = () => { let s = 0; for (let i = 0; i < 6; i++) s += r(); return (s - 3) / 0.7071 * 0.5; };
  const items = [];
  for (let i = 0; i < 100; i++) { const pos = i < 30; const s = (pos ? 0.64 : 0.36) + g() * 0.42; items.push({ pos, s: Math.min(0.99, Math.max(0.01, s)), j: r() }); }
  return items;
}
const SCEN = {
  spam: { label: 'Spam filter', pos: 'spam', neg: 'real email', fp: 5, fn: 1, text: 'A false positive hides a real email (bad). A missed spam is a small annoyance. So we want a HIGH threshold: only flag when very sure.' },
  cancer: { label: 'Cancer screening', pos: 'possible cancer', neg: 'healthy', fp: 1, fn: 25, text: 'A missed case can be deadly; a false alarm just means another test. So we want a LOW threshold: catch nearly everyone, accept false alarms.' },
  guard: { label: 'Content guardrail', pos: 'harmful reply', neg: 'safe reply', fp: 2, fn: 8, text: 'Letting harmful content through is costly, but blocking too many good answers makes the product useless. The best threshold sits in between.' },
};

export function mount(el, props = {}, ctx = {}) {
  const D = makeData();
  let scen = 'spam', th = 0.5;
  const metricsAt = (t) => { let tp = 0, fp = 0, fn = 0, tn = 0; for (const d of D) { const p = d.s >= t; if (d.pos) p ? tp++ : fn++; else p ? fp++ : tn++; } return { tp, fp, fn, tn }; };
  const root = h('div', { class: 'w-b-card w-ev' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const sel = h('select', { 'aria-label': 'Scenario', onchange: (e) => { scen = e.target.value; th = bestT(); thIn.value = th; upd(); } }, Object.entries(SCEN).map(([k, v]) => h('option', { value: k, selected: k === scen, text: v.label })));
  const thVal = h('b');
  const thIn = h('input', { type: 'range', min: 0, max: 1, step: 0.01, value: th, oninput: (e) => { th = +e.target.value; upd(); } });
  const bestB = h('button', { class: 'w-b-btn', type: 'button', onclick: () => { th = bestT(); thIn.value = th; upd(); } }, 'Jump to the cheapest threshold');
  const matrix = h('div', { class: 'w-ev-matrix' }), mets = h('div', { class: 'w-ev-mets' }), plots = h('div', { class: 'w-b-grid w-b-cols2' }), story = h('p', { class: 'w-ev-story' });
  root.append(
    h('h3', { class: 'w-b-title', text: 'Where do you draw the line?' }),
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), 'pick "Cancer screening", then press the "cheapest threshold" button. Now switch to "Spam filter" and press it again.'),
    h('div', { class: 'w-b-grid w-b-cols2' }, h('label', { class: 'w-b-field' }, h('span', { text: 'Scenario' }), sel), h('label', { class: 'w-b-field' }, h('span', {}, 'Threshold: ', thVal, ' (flag as positive when score is at least this)'), thIn)),
    h('div', { class: 'w-b-row' }, bestB), story, matrix, mets, plots, live,
    h('p', { class: 'w-b-note', text: 'Toy data: 100 made-up items (30 truly positive, 70 negative) with scores from an imaginary classifier. Costs per mistake are illustrative. Real work needs far more data and real costs.' }));
  el.append(root);

  const cost = (m) => m.fp * SCEN[scen].fp + m.fn * SCEN[scen].fn;
  function bestT() { let b = 0.5, bc = 1e9; for (let i = 0; i <= 100; i++) { const t = i / 100, c = cost(metricsAt(t)); if (c < bc - 1e-9) { bc = c; b = t; } } return b; }

  function upd() {
    const S = SCEN[scen], m = metricsAt(th), bt = bestT(), bm = metricsAt(bt);
    thVal.textContent = th.toFixed(2);
    const prec = m.tp + m.fp ? m.tp / (m.tp + m.fp) : 0, rec = m.tp / (m.tp + m.fn), f1 = prec + rec ? 2 * prec * rec / (prec + rec) : 0, acc = (m.tp + m.tn) / 100;
    story.textContent = S.text;
    matrix.textContent = '';
    const cell = (cls, name, n, desc) => h('div', { class: 'w-ev-cell ' + cls }, h('span', { class: 'w-ev-cn', text: name }), h('b', { class: 'w-ev-num', text: n }), h('span', { class: 'w-ev-cd', text: desc }));
    matrix.append(h('div', { class: 'w-ev-grid' },
      h('div', { class: 'w-ev-corner' }), h('div', { class: 'w-ev-hd', text: `Flagged: ${S.pos}` }), h('div', { class: 'w-ev-hd', text: 'Not flagged' }),
      h('div', { class: 'w-ev-rh', text: `Truly ${S.pos}` }), cell('good', 'True positive', m.tp, 'caught'), cell('bad', 'False negative', m.fn, 'missed'),
      h('div', { class: 'w-ev-rh', text: `Truly ${S.neg}` }), cell('warn', 'False positive', m.fp, 'false alarm'), cell('good', 'True negative', m.tn, 'correctly left alone')));
    mets.textContent = '';
    [['Precision', prec, 'of flagged items, how many were right'], ['Recall', rec, 'of real positives, how many we caught'], ['F1', f1, 'balance of the two'], ['Accuracy', acc, 'overall right (can mislead)']].forEach(([n, x, d]) => mets.append(h('div', { class: 'w-ev-met' }, h('span', { text: n }), h('b', { text: Math.round(x * 100) + '%' }), h('small', { text: d }))));
    const c = cost(m), cb = cost(bm);
    mets.append(h('div', { class: 'w-ev-met w-ev-cost' }, h('span', { text: 'Cost of mistakes' }), h('b', { text: String(c) }), h('small', { text: `${m.fp} false alarms x ${S.fp} + ${m.fn} misses x ${S.fn}. Cheapest here: threshold ${bt.toFixed(2)} (cost ${cb}).` })));
    // plots
    plots.textContent = '';
    const W = 320, Hh = 200, sx = (x) => 30 + x * (W - 40);
    const strip = h('svg:svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'w-ev-svg', role: 'img', 'aria-label': `Scores of 100 items. Circles are truly positive, diamonds truly negative. Threshold line at ${th.toFixed(2)}.` });
    strip.append(h('svg:rect', { x: sx(th), y: 8, width: sx(1) - sx(th), height: Hh - 38, class: 'w-ev-flag' }), h('svg:line', { x1: sx(th), x2: sx(th), y1: 8, y2: Hh - 30, class: 'w-ev-line' }));
    D.forEach((d) => { const x = sx(d.s), y = 14 + d.j * (Hh - 56); strip.append(d.pos ? h('svg:circle', { cx: x, cy: y, r: 4.5, class: 'w-ev-p' }) : h('svg:path', { d: `M${x} ${y - 5}L${x + 5} ${y}L${x} ${y + 5}L${x - 5} ${y}Z`, class: 'w-ev-n' })); });
    strip.append(h('svg:text', { x: 30, y: Hh - 8, class: 'w-ev-t', text: 'score 0' }), h('svg:text', { x: W - 10, y: Hh - 8, class: 'w-ev-t', 'text-anchor': 'end', text: '1' }), h('svg:text', { x: sx(th) + 3, y: 20, class: 'w-ev-t', text: 'flagged →' }));
    const roc = h('svg:svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'w-ev-svg', role: 'img', 'aria-label': `ROC-style curve. At this threshold, ${Math.round(rec * 100)} percent of positives are caught with ${Math.round(m.fp / 70 * 100)} percent false alarms.` });
    const rx = (x) => 36 + x * (W - 56), ry = (y) => Hh - 28 - y * (Hh - 44); let path = '';
    for (let i = 100; i >= 0; i--) { const mm = metricsAt(i / 100); path += (i === 100 ? 'M' : 'L') + rx(mm.fp / 70).toFixed(1) + ' ' + ry(mm.tp / 30).toFixed(1); }
    roc.append(h('svg:line', { x1: rx(0), y1: ry(0), x2: rx(1), y2: ry(1), class: 'w-ev-diag' }), h('svg:path', { d: path, class: 'w-ev-curve' }),
      h('svg:rect', { x: rx(m.fp / 70) - 6, y: ry(m.tp / 30) - 6, width: 12, height: 12, class: 'w-ev-cur', transform: `rotate(45 ${rx(m.fp / 70)} ${ry(m.tp / 30)})` }),
      h('svg:text', { x: rx(0.5), y: Hh - 6, class: 'w-ev-t', 'text-anchor': 'middle', text: 'false alarm rate →' }), h('svg:text', { x: 10, y: 14, class: 'w-ev-t', text: 'caught ↑' }));
    plots.append(h('div', {}, h('h4', { class: 'w-ev-h', text: 'The 100 items by score' }), strip, h('small', { class: 'w-ev-leg', text: 'Circle = truly positive, diamond = truly negative. Shaded = flagged.' })),
      h('div', {}, h('h4', { class: 'w-ev-h', text: 'Trade-off curve (ROC-style)' }), roc, h('small', { class: 'w-ev-leg', text: 'Moving the threshold slides the square along the curve. Up and left is better.' })));
    const msg = `Threshold ${th.toFixed(2)}: caught ${m.tp} of 30, ${m.fp} false alarms, ${m.fn} missed. Precision ${Math.round(prec * 100)} percent, recall ${Math.round(rec * 100)} percent. Cost ${c}; cheapest threshold is ${bt.toFixed(2)}.`;
    live.textContent = msg; if (ctx.announce) ctx.announce(msg);
  }
  upd();
  return () => {};
}
