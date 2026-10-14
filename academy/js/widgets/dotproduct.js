// Dot product, cosine similarity, and a mini attention calculation. All maths is real.
export const meta = { name: 'dotproduct', title: 'Dot product and similarity', blurb: 'Drag two arrows: see the dot product, cosine, and how attention uses them.', level: 1, skills: ['l1.dotproduct'] };

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
const R = 1.5; // world half-extent
const KEYS = [{ n: 'K1', v: [1.0, 0.25], val: 10 }, { n: 'K2', v: [0.35, 1.0], val: 40 }, { n: 'K3', v: [-0.9, -0.3], val: 80 }];

export function mount(el, props = {}, ctx = {}) {
  const A = [1.0, 0.45], B = [0.3, 1.0];
  let active = 'a', drag = null, W = 320;
  const cv = h('canvas', { class: 'w-dotproduct-cv', tabindex: '0', role: 'img', 'aria-label': 'Two arrows A and B on a grid. Use arrow keys to move the selected arrow tip.' });
  const read = h('div', { class: 'w-dotproduct-read' });
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const table = h('div', { class: 'w-dotproduct-attn' });
  const sel = h('div', { class: 'wa-chips', role: 'radiogroup', 'aria-label': 'Which arrow to move with the keyboard' },
    ['a', 'b'].map((k) => h('button', { type: 'button', role: 'radio', class: 'wa-btn wa-btn-small', 'data-k': k, onclick: () => { active = k; draw(); cv.focus(); } }, 'Move arrow ' + k.toUpperCase())));
  const vec = (k) => (k === 'a' ? A : B);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const len = (a) => Math.hypot(a[0], a[1]);
  const toPx = (p) => [W / 2 + (p[0] / R) * (W / 2 - 14), W / 2 - (p[1] / R) * (W / 2 - 14)];
  const toW = (x, y) => [((x - W / 2) / (W / 2 - 14)) * R, (-(y - W / 2) / (W / 2 - 14)) * R];
  const col = () => { const s = getComputedStyle(document.documentElement); return (k) => s.getPropertyValue('--' + k).trim(); };

  function arrow(g, from, to, color, width, dash) {
    const [x0, y0] = from, [x1, y1] = to, a = Math.atan2(y1 - y0, x1 - x0);
    g.strokeStyle = color; g.fillStyle = color; g.lineWidth = width; g.setLineDash(dash || []);
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - 10 * Math.cos(a - 0.4), y1 - 10 * Math.sin(a - 0.4)); g.lineTo(x1 - 10 * Math.cos(a + 0.4), y1 - 10 * Math.sin(a + 0.4)); g.closePath(); g.fill();
  }

  function draw() {
    const c = col(), dpr = window.devicePixelRatio || 1;
    W = Math.max(240, Math.min(440, cv.parentNode.clientWidth || 320));
    cv.style.width = W + 'px'; cv.style.height = W + 'px';
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(W * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, W);
    g.fillStyle = c('surface-2'); g.fillRect(0, 0, W, W);
    g.strokeStyle = c('line'); g.lineWidth = 1;
    for (let i = -1; i <= 1; i += 0.5) { const [x] = toPx([i, 0]), [, y] = toPx([0, i]); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, W); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const O = toPx([0, 0]);
    g.strokeStyle = c('ink-soft'); g.beginPath(); g.moveTo(0, O[1]); g.lineTo(W, O[1]); g.moveTo(O[0], 0); g.lineTo(O[0], W); g.stroke();
    g.font = '600 12px ' + c('font'); g.textAlign = 'center';
    KEYS.forEach((k) => { const p = toPx(k.v); arrow(g, O, p, c('ink-soft'), 1.5, [4, 4]); g.fillStyle = c('ink-soft'); g.fillText(k.n, p[0] + (k.v[0] < 0 ? -12 : 12), p[1] + (k.v[1] < 0 ? 14 : -6)); });
    // angle arc
    const aA = Math.atan2(-A[1], A[0]), aB = Math.atan2(-B[1], B[0]);
    if (len(A) > 0.05 && len(B) > 0.05) { let d = aB - aA; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; g.strokeStyle = c('warn'); g.lineWidth = 2; g.beginPath(); g.arc(O[0], O[1], 34, aA, aA + d, d < 0); g.stroke(); }
    const pa = toPx(A), pb = toPx(B);
    arrow(g, O, pa, c('brand'), 3.5); arrow(g, O, pb, c('accent'), 3.5);
    [['a', pa, c('brand'), 'A'], ['b', pb, c('accent'), 'B']].forEach(([k, p, color, l]) => {
      g.fillStyle = c('surface'); g.strokeStyle = color; g.lineWidth = active === k ? 4 : 2.5;
      g.beginPath(); g.arc(p[0], p[1], 11, 0, 7); g.fill(); g.stroke();
      g.fillStyle = c('ink'); g.font = '700 12px ' + c('font'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(l, p[0], p[1] + 1); g.textBaseline = 'alphabetic';
      if (active === k) { g.setLineDash([3, 3]); g.lineWidth = 1.5; g.beginPath(); g.arc(p[0], p[1], 17, 0, 7); g.stroke(); g.setLineDash([]); }
    });
    sel.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.k === active)));
    numbers();
  }

  function numbers() {
    const d = dot(A, B), la = len(A), lb = len(B), cos = la * lb ? d / (la * lb) : 0, ang = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
    const mean = cos > 0.9 ? 'pointing almost the same way: very similar' : cos > 0.5 ? 'broadly the same direction: fairly similar' : cos > 0.15 ? 'only loosely related' : cos > -0.15 ? 'about right-angled: unrelated' : cos > -0.6 ? 'leaning opposite ways' : 'pointing opposite ways: opposite meaning';
    const f = (x) => x.toFixed(2);
    read.replaceChildren(
      h('div', { class: 'wa-stat' }, h('b', {}, f(d)), h('span', {}, 'A · B (dot product)')),
      h('div', { class: 'wa-stat' }, h('b', {}, f(cos)), h('span', {}, 'cosine similarity')),
      h('div', { class: 'wa-stat' }, h('b', {}, Math.round(ang) + '°'), h('span', {}, 'angle between')),
      h('p', { class: 'w-dotproduct-formula' }, `A = (${f(A[0])}, ${f(A[1])}), B = (${f(B[0])}, ${f(B[1])}).  A·B = ${f(A[0])}×${f(B[0])} + ${f(A[1])}×${f(B[1])} = ${f(d)}.  cosine = A·B ÷ (|A| |B|) = ${f(d)} ÷ (${f(la)} × ${f(lb)}) = ${f(cos)}`));
    // attention: query = A, keys fixed; scores = q.k / sqrt(d)
    const sc = KEYS.map((k) => dot(A, k.v) / Math.sqrt(2)), mx = Math.max(...sc), ex = sc.map((s) => Math.exp(s - mx)), sm = ex.reduce((a, b) => a + b, 0), w = ex.map((e) => e / sm);
    const outv = w.reduce((s, x, i) => s + x * KEYS[i].val, 0);
    table.replaceChildren(
      h('div', { class: 'w-dotproduct-trow w-dotproduct-th' }, h('span', {}, 'Key'), h('span', {}, 'score = A·K ÷ √2'), h('span', {}, 'weight (softmax)'), h('span', {}, 'value')),
      ...KEYS.map((k, i) => h('div', { class: 'w-dotproduct-trow' }, h('span', {}, h('b', {}, k.n)), h('span', {}, f(sc[i])),
        h('span', { class: 'w-dotproduct-wcell' }, h('span', { class: 'w-dotproduct-wbar', style: `width:${w[i] * 100}%` }), h('i', {}, Math.round(w[i] * 100) + '%')), h('span', {}, String(k.val)))),
      h('p', { class: 'w-dotproduct-out' }, h('b', {}, 'Weighted sum of values = '), `${w.map((x, i) => f(x) + '×' + KEYS[i].val).join(' + ')} = `, h('b', {}, outv.toFixed(1))));
    live.textContent = `Dot product ${f(d)}, cosine ${f(cos)}, angle ${Math.round(ang)} degrees: ${mean}. Attention from A: ${KEYS.map((k, i) => k.n + ' ' + Math.round(w[i] * 100) + ' percent').join(', ')}; output ${outv.toFixed(1)}.`;
    cv.setAttribute('aria-label', `Arrows A and B, angle ${Math.round(ang)} degrees, cosine ${f(cos)}. Arrow keys move the selected arrow.`);
  }

  const clampv = (v) => { const l = len(v); if (l > 1.4) { v[0] *= 1.4 / l; v[1] *= 1.4 / l; } };
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', (e) => {
    const [x, y] = pos(e), da = Math.hypot(x - toPx(A)[0], y - toPx(A)[1]), db = Math.hypot(x - toPx(B)[0], y - toPx(B)[1]);
    if (Math.min(da, db) > 30) return;
    drag = da <= db ? 'a' : 'b'; active = drag; cv.setPointerCapture(e.pointerId); cv.focus(); e.preventDefault(); move(e);
  });
  function move(e) { const [x, y] = pos(e), v = vec(drag), p = toW(x, y); v[0] = p[0]; v[1] = p[1]; clampv(v); draw(); }
  cv.addEventListener('pointermove', (e) => { if (drag) move(e); });
  const end = () => { drag = null; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.2 : 0.05, v = vec(active), m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (e.key === ' ' || e.key === 'Enter') { active = active === 'a' ? 'b' : 'a'; e.preventDefault(); draw(); return; }
    if (!m) return;
    v[0] += m[0]; v[1] += m[1]; clampv(v); e.preventDefault(); draw();
  });
  const preset = (a, b) => h('button', { type: 'button', class: 'wa-btn wa-btn-small', onclick: () => { A.splice(0, 2, ...a); B.splice(0, 2, ...b); draw(); } }, '');
  const pre = [['Same direction', [1, 0.4], [1.2, 0.5]], ['Perpendicular', [1, 0], [0, 1]], ['Opposite', [1, 0.3], [-1, -0.3]], ['Reset', [1.0, 0.45], [0.3, 1.0]]]
    .map(([l, a, b]) => { const bt = preset(a, b); bt.textContent = l; return bt; });

  el.append(h('section', { class: 'wa w-dotproduct' },
    h('header', { class: 'wa-head' }, h('h3', {}, 'Dot product and similarity'), h('p', {}, 'Meaning in a model is stored as arrows (vectors). How well two arrows line up tells you how related they are.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'drag the tip of B until it is at right angles to A (dot product 0), then swing it round to point the opposite way.'),
    h('div', { class: 'w-dotproduct-main' },
      h('div', { class: 'w-dotproduct-cvwrap' }, cv),
      h('div', { class: 'w-dotproduct-side' }, read, h('div', { class: 'wa-chips' }, pre), sel, h('p', { class: 'wa-muted' }, 'Keyboard: focus the grid, arrow keys move the selected tip (Shift = bigger steps), Space switches arrow.'))),
    h('h4', { class: 'wa-h4' }, 'The same maths inside attention'),
    h('p', { class: 'wa-muted' }, 'Treat A as a query asking a question. Each dashed arrow is a key. Score each key with a dot product, turn scores into weights with softmax, then blend the values.'),
    table, live,
    h('p', { class: 'wa-note' }, 'Toy model: just 2 dimensions with made-up keys and values. The maths (dot product, cosine, softmax, weighted sum) is exactly what real models do, but over hundreds or thousands of dimensions.')));
  draw();
  const ro = new ResizeObserver(() => { const w = cv.parentNode.clientWidth; if (Math.abs(w - W) > 1 && w < 441) draw(); });
  ro.observe(cv.parentNode);
  const mq = matchMedia('(prefers-color-scheme: dark)'), mo = new MutationObserver(draw);
  mq.addEventListener('change', draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => { ro.disconnect(); mq.removeEventListener('change', draw); mo.disconnect(); };
}
