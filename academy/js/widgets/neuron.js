// One artificial neuron: weighted sum + bias -> activation. Includes a truth-table challenge.
export const meta = { name: 'neuron', title: 'One artificial neuron', blurb: 'Weights, bias and activation: the building block of every neural network.', level: 1, skills: ['l1.neuron'] };

const h = (t, a = {}, ...k) => {
  const e = document.createElement(t);
  for (const [n, v] of Object.entries(a)) {
    if (v == null || v === false) continue;
    if (n === 'class') e.className = v;
    else if (n === 'style') e.style.cssText = v;
    else if (n.startsWith('on')) e.addEventListener(n.slice(2), v);
    else e.setAttribute(n, v === true ? '' : v);
  }
  for (const c of k.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
};
const NS = 'http://www.w3.org/2000/svg';
const sv = (t, a = {}, ...k) => { const e = document.createElementNS(NS, t); for (const [n, v] of Object.entries(a)) e.setAttribute(n, v); k.forEach((c) => e.append(c)); return e; };

const ACT = {
  step: { label: 'Step (yes/no)', f: (z) => (z > 0 ? 1 : 0) },
  sigmoid: { label: 'Sigmoid (smooth 0 to 1)', f: (z) => 1 / (1 + Math.exp(-z)) },
  relu: { label: 'ReLU (0 or positive, clipped at 2)', f: (z) => Math.min(2, Math.max(0, z)) / 2 },
};
const INPUTS = ['Sunny', 'Free time', 'Homework done'];
const GOALS = [
  { id: 'and', label: 'Say yes only when it is sunny AND you have free time (homework does not matter)', t: (x) => x[0] && x[1] },
  { id: 'or', label: 'Say yes when it is sunny OR you have free time', t: (x) => x[0] || x[1] },
  { id: 'maj', label: 'Say yes when at least 2 of the 3 are true', t: (x) => (x[0] + x[1] + x[2] >= 2 ? 1 : 0) },
  { id: 'not', label: 'Say yes only when sunny AND homework is NOT done', t: (x) => x[0] && !x[2] },
];

export function mount(el, props = {}, ctx = {}) {
  const s = { x: [1, 0, 1], w: [1, 1, 1], b: -0.5, act: 'sigmoid', goal: 'and' };
  const xs = [], ws = [];
  const svg = sv('svg', { viewBox: '0 0 320 150', class: 'w-neuron-svg', role: 'img', 'aria-label': 'Neuron diagram' });
  const formula = h('p', { class: 'w-neuron-formula' });
  const meter = h('div', { class: 'w-neuron-meter', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '1', 'aria-label': 'Neuron output' }, h('span', { class: 'w-neuron-mfill' }));
  const verdict = h('p', { class: 'w-neuron-verdict' });
  const table = h('table', { class: 'w-neuron-table' });
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const goalSel = h('select', {}, GOALS.map((g) => h('option', { value: g.id }, g.label)));
  const actSel = h('select', {}, Object.entries(ACT).map(([k, a]) => h('option', { value: k }, a.label)));
  actSel.value = s.act;
  const rows = INPUTS.map((n, i) => {
    const xo = h('output', {}, ''), wo = h('output', {}, '');
    const xi = h('input', { type: 'range', min: '0', max: '1', step: '0.1', value: String(s.x[i]) });
    const wi = h('input', { type: 'range', min: '-3', max: '3', step: '0.1', value: String(s.w[i]) });
    xi.addEventListener('input', () => { s.x[i] = +xi.value; update(); });
    wi.addEventListener('input', () => { s.w[i] = +wi.value; update(); });
    xs.push([xi, xo]); ws.push([wi, wo]);
    return h('div', { class: 'w-neuron-row' }, h('label', { class: 'wa-field' }, h('span', {}, 'Input: ' + n + ' = ', xo), xi), h('label', { class: 'wa-field' }, h('span', {}, 'Weight on ' + n + ' = ', wo), wi));
  });
  const bo = h('output', {}, '');
  const bi = h('input', { type: 'range', min: '-4', max: '4', step: '0.1', value: String(s.b) });
  bi.addEventListener('input', () => { s.b = +bi.value; update(); });
  goalSel.addEventListener('change', () => { s.goal = goalSel.value; if (typeof hintEl !== 'undefined') hintEl.textContent = ''; update(); });
  actSel.addEventListener('change', () => { s.act = actSel.value; update(); });
  const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

  function drawSvg(z, out) {
    svg.replaceChildren();
    const ys = [28, 75, 122], cx = 250, cy = 75;
    s.w.forEach((w, i) => {
      svg.append(sv('line', { x1: 78, y1: ys[i], x2: cx - 26, y2: cy, stroke: w >= 0 ? 'var(--good)' : 'var(--bad)', 'stroke-width': 1 + Math.abs(w) * 2.2, 'stroke-dasharray': w < 0 ? '6 4' : '0', opacity: 0.85 }));
      const t = sv('text', { x: 140, y: ys[i] + (ys[i] - cy) * 0.15 + (i === 1 ? -6 : 4) + (i === 0 ? -6 : 0), fill: 'var(--ink)', 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle' }); t.textContent = (w >= 0 ? '+' : '−') + Math.abs(w).toFixed(1); svg.append(t);
      svg.append(sv('rect', { x: 8, y: ys[i] - 14, width: 70, height: 28, rx: 14, fill: 'var(--surface-2)', stroke: 'var(--line)' }));
      const n = sv('text', { x: 43, y: ys[i] + 4, fill: 'var(--ink)', 'font-size': 11, 'text-anchor': 'middle' }); n.textContent = INPUTS[i].split(' ')[0] + ' ' + f1(s.x[i]); svg.append(n);
    });
    svg.append(sv('circle', { cx, cy, r: 28, fill: 'var(--brand-soft)', stroke: 'var(--brand)', 'stroke-width': 2.5 }));
    const t1 = sv('text', { x: cx, y: cy - 2, fill: 'var(--ink)', 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle' }); t1.textContent = 'Σ + b'; svg.append(t1);
    const t2 = sv('text', { x: cx, y: cy + 14, fill: 'var(--ink-soft)', 'font-size': 11, 'text-anchor': 'middle' }); t2.textContent = 'z=' + f1(z); svg.append(t2);
    svg.append(sv('line', { x1: cx + 28, y1: cy, x2: 312, y2: cy, stroke: 'var(--brand)', 'stroke-width': 2.5 }));
    const t3 = sv('text', { x: 296, y: cy - 8, fill: 'var(--ink)', 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle' }); t3.textContent = out.toFixed(2); svg.append(t3);
    svg.setAttribute('aria-label', `Three inputs feed one neuron with weights ${s.w.map(f1).join(', ')} and bias ${f1(s.b)}; output ${out.toFixed(2)}.`);
  }

  const run = (x) => { const z = x.reduce((a, v, i) => a + v * s.w[i], 0) + s.b; return [z, ACT[s.act].f(z)]; };

  function update() {
    xs.forEach(([i, o], k) => { o.textContent = f1(s.x[k]); });
    ws.forEach(([i, o], k) => { o.textContent = f1(s.w[k]); });
    bo.textContent = f1(s.b);
    const [z, out] = run(s.x);
    formula.textContent = `z = ${s.x.map((x, i) => `${f1(x)}×${f1(s.w[i])}`).join(' + ')} + (${f1(s.b)}) = ${f1(z)}   →   output = ${ACT[s.act].label.split(' ')[0].toLowerCase()}(z) = ${out.toFixed(2)}`;
    meter.firstChild.style.width = Math.round(out * 100) + '%';
    meter.setAttribute('aria-valuenow', out.toFixed(2));
    verdict.textContent = out > 0.5 ? `Output ${out.toFixed(2)}: leaning YES` : `Output ${out.toFixed(2)}: leaning NO`;
    verdict.className = 'w-neuron-verdict ' + (out > 0.5 ? 'yes' : 'no');
    drawSvg(z, out);
    // challenge
    const goal = GOALS.find((g) => g.id === s.goal);
    let good = 0;
    const body = h('tbody');
    for (let m = 0; m < 8; m++) {
      const x = [(m >> 2) & 1, (m >> 1) & 1, m & 1], want = goal.t(x) ? 1 : 0, o = run(x)[1], say = o > 0.5 ? 1 : 0, ok = want === say; if (ok) good++;
      body.append(h('tr', { class: ok ? 'ok' : 'bad' }, ...x.map((v) => h('td', {}, v ? 'yes' : 'no')), h('td', {}, want ? 'yes' : 'no'), h('td', {}, say ? 'yes' : 'no'), h('td', { class: 'w-neuron-mark' }, ok ? '✓ right' : '✗ wrong')));
    }
    table.replaceChildren(h('caption', {}, `Your neuron gets ${good} of 8 rows right`), h('thead', {}, h('tr', {}, ...INPUTS.map((n) => h('th', {}, n.split(' ')[0])), h('th', {}, 'Should'), h('th', {}, 'Says'), h('th', {}, 'OK?'))), body);
    const solved = good === 8;
    live.textContent = `Output ${out.toFixed(2)}. Challenge: ${good} of 8 rows correct.` + (solved ? ' Solved! Your neuron implements this rule.' : '');
    table.classList.toggle('is-solved', solved);
  }
  const SOL = { and: [[2.5, 2.5, 0], -3.5], or: [[2.5, 2.5, 0], -1], maj: [[2, 2, 2], -3], not: [[2.5, 0, -2.5], -1.5] };
  const HINT = { and: 'Make the bias negative so one \u201cyes\u201d alone is not enough, then give Sunny and Free time big positive weights. Set the Homework weight to 0 so it is ignored.', or: 'Give Sunny and Free time big positive weights, and a bias only slightly negative so one \u201cyes\u201d is enough. Homework weight 0.', maj: 'Give all three the same positive weight and a negative bias that needs two \u201cyes\u201d inputs to overcome.', not: 'Sunny gets a positive weight, Homework gets a negative weight, Free time 0, and a small negative bias.' };
  const hintEl = h('p', { class: 'wa-muted', 'aria-live': 'polite' });
  const solve = () => { const [w, b] = SOL[s.goal]; s.w = w.slice(); s.b = b; s.act = 'sigmoid'; ws.forEach(([i], k) => { i.value = s.w[k]; }); bi.value = s.b; actSel.value = s.act; update(); };
  const reset = () => { Object.assign(s, { x: [1, 0, 1], w: [1, 1, 1], b: -0.5, act: 'sigmoid' }); xs.forEach(([i], k) => { i.value = s.x[k]; }); ws.forEach(([i], k) => { i.value = s.w[k]; }); bi.value = s.b; actSel.value = s.act; update(); };

  el.append(h('section', { class: 'wa w-neuron' },
    h('header', { class: 'wa-head' }, h('h3', {}, 'One artificial neuron'), h('p', {}, 'Multiply each input by a weight, add them up with a bias, then squash the result with an activation function.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'pick a goal below and play with the sliders and watch the output bar. Then scroll to the Challenge and tune until all 8 rows show a tick (there is a hint button if you get stuck).'),
    h('div', { class: 'w-neuron-wrap' }, h('div', { class: 'w-neuron-left' }, svg, meter, verdict, formula),
      h('div', { class: 'w-neuron-ctl' }, rows, h('label', { class: 'wa-field' }, h('span', {}, 'Bias (how eager it is) = ', bo), bi), h('label', { class: 'wa-field' }, h('span', {}, 'Activation function'), actSel), h('button', { type: 'button', class: 'wa-btn', onclick: reset }, 'Reset'))),
    h('h4', { class: 'wa-h4' }, 'Challenge'),
    h('label', { class: 'wa-field' }, h('span', {}, 'Goal'), goalSel),
    h('div', { class: 'wa-row' }, h('button', { type: 'button', class: 'wa-btn wa-btn-small', onclick: () => { hintEl.textContent = HINT[s.goal]; } }, 'Give me a hint'), h('button', { type: 'button', class: 'wa-btn wa-btn-small', onclick: solve }, 'Show a solution')), hintEl,
    h('div', { class: 'wa-scroll' }, table), live,
    h('p', { class: 'wa-note' }, 'Toy model: this is a single neuron with 3 inputs, and the output counts as “yes” above 0.5. Real networks stack millions of these and learn the weights by themselves. Solid lines are positive weights, dashed lines are negative.')));
  update();
}
