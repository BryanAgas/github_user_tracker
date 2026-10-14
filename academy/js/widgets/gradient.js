// Gradient descent on a 1-D curve and a 2-D contour map. Real update rule: x <- x - lr * grad.
export const meta = { name: 'gradient', title: 'Gradient descent', blurb: 'Roll downhill on a loss curve and see what the learning rate does.', level: 2, skills: ['l2.gradient'] };

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
// 1-D loss: f(x) = 2 (x-1)^2 + 0.15 cos(4x)  (curvature between about 1.6 and 6.4)
const f1 = (x) => 2 * (x - 1) ** 2 + 0.15 * Math.cos(4 * x);
const g1 = (x) => 4 * (x - 1) - 0.6 * Math.sin(4 * x);
// 2-D loss: a long thin valley, f = 0.5 (x^2 + 8 y^2)
const f2 = (x, y) => 0.5 * (x * x + 8 * y * y);
const START1 = -1.4, START2 = [-1.6, 0.5];

export function mount(el, props = {}, ctx = {}) {
  let lr = 0.1, x1 = START1, p2 = START2.slice(), t = 0, W = 300, timer = null, tr1 = [START1], tr2 = [START2.slice()], diverged = false;
  const c1 = h('canvas', { class: 'w-gradient-cv', role: 'img', 'aria-label': '1-D loss curve with a ball' });
  const c2 = h('canvas', { class: 'w-gradient-cv', role: 'img', 'aria-label': '2-D contour map with a path' });
  const lrOut = h('output', {}, lr.toFixed(2));
  const lrIn = h('input', { type: 'range', min: '0.01', max: '0.6', step: '0.01', value: String(lr) });
  const badge = h('p', { class: 'w-gradient-badge', 'aria-hidden': 'true' });
  const stats = h('div', { class: 'wa-stats' });
  const mk = (l) => { const v = h('b', {}, '–'); stats.append(h('div', { class: 'wa-stat' }, v, h('span', {}, l))); return v; };
  const sT = mk('steps'), s1 = mk('loss (curve)'), s2 = mk('loss (contour)');
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const play = h('button', { type: 'button', class: 'wa-btn wa-btn-primary', 'aria-pressed': 'false', onclick: () => toggle() }, 'Play');
  const col = () => { const s = getComputedStyle(document.documentElement); return (k) => s.getPropertyValue('--' + k).trim(); };

  function regime() {
    const k = lr * 8; // lr x steepest curvature (the thin valley)
    if (diverged) return ['bad', 'Diverging: steps overshoot further each time'];
    if (lr < 0.05) return ['warn', 'Too small: safe but painfully slow'];
    if (k <= 1) return ['good', 'About right: smooth descent'];
    if (k < 2) return ['warn', 'Too big: it zig-zags across the narrow valley'];
    return ['bad', 'Way too big: it will diverge'];
  }

  function step() {
    if (diverged) return;
    x1 -= lr * g1(x1); p2 = [p2[0] - lr * p2[0], p2[1] - lr * 8 * p2[1]]; t++;
    tr1.push(x1); tr2.push(p2.slice());
    if (tr1.length > 400) { tr1.shift(); tr2.shift(); }
    if (Math.abs(x1) > 60 || Math.abs(p2[0]) > 60 || Math.abs(p2[1]) > 60 || !isFinite(f1(x1))) { diverged = true; toggle(false); }
    draw();
  }
  function toggle(force) {
    const on = force != null ? force : !timer;
    clearInterval(timer); timer = null;
    if (on && !diverged) timer = setInterval(() => { step(); if (t > 300) toggle(false); }, 130);
    play.textContent = timer ? 'Pause' : 'Play'; play.setAttribute('aria-pressed', String(!!timer));
    if (!timer) say();
  }
  function reset() { toggle(false); x1 = START1; p2 = START2.slice(); t = 0; tr1 = [x1]; tr2 = [p2.slice()]; diverged = false; draw(); say(); }
  function say() {
    const [, msg] = regime();
    const l1 = f1(x1), l2 = f2(...p2);
    live.textContent = `Learning rate ${lr.toFixed(2)}. ${msg}. After ${t} steps: curve loss ${Math.abs(l1) > 1e5 ? 'exploded' : l1.toFixed(2)}, contour loss ${l2 > 1e5 ? 'exploded' : l2.toFixed(2)}.`;
  }

  function fit(cv, aspect) {
    const dpr = window.devicePixelRatio || 1; W = Math.max(240, Math.min(560, cv.parentNode.clientWidth || 300));
    const H = Math.round(W * aspect); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return [g, H];
  }
  function draw() {
    const c = col();
    // 1-D
    let [g, H] = fit(c1, 0.55);
    g.fillStyle = c('surface-2'); g.fillRect(0, 0, W, H);
    const xa = -2, xb = 3.2, ya = -0.4, yb = 14, X = (x) => ((x - xa) / (xb - xa)) * (W - 20) + 10, Y = (y) => H - 22 - ((y - ya) / (yb - ya)) * (H - 36);
    g.strokeStyle = c('line'); g.lineWidth = 1; g.beginPath(); g.moveTo(10, Y(0)); g.lineTo(W - 10, Y(0)); g.stroke();
    g.strokeStyle = c('brand'); g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 200; i++) { const x = xa + (i / 200) * (xb - xa); i ? g.lineTo(X(x), Y(f1(x))) : g.moveTo(X(x), Y(f1(x))); } g.stroke();
    g.fillStyle = c('ink-soft'); g.font = '11px ' + c('font'); g.textAlign = 'left'; g.fillText('loss', 12, 14); g.textAlign = 'right'; g.fillText('weight →', W - 12, H - 6);
    g.strokeStyle = c('ink-soft'); g.setLineDash([3, 4]); g.beginPath(); tr1.forEach((x, i) => { const xx = X(Math.max(xa, Math.min(xb, x))), yy = Y(Math.min(yb, f1(x))); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }); g.stroke(); g.setLineDash([]);
    tr1.forEach((x) => { if (x > xa && x < xb) { g.fillStyle = c('ink-soft'); g.beginPath(); g.arc(X(x), Y(Math.min(yb, f1(x))), 2.5, 0, 7); g.fill(); } });
    const off = x1 < xa || x1 > xb || f1(x1) > yb, bx = X(Math.max(xa, Math.min(xb, x1))), by = Y(Math.min(yb, f1(x1)));
    g.fillStyle = c(diverged ? 'bad' : 'accent'); g.strokeStyle = c('ink'); g.lineWidth = 2; g.beginPath(); g.arc(bx, by, 9, 0, 7); g.fill(); g.stroke();
    if (off) { g.fillStyle = c('bad'); g.font = '700 12px ' + c('font'); g.textAlign = 'center'; g.fillText('flew off the chart!', W / 2, 30); }
    else if (!diverged) { const gr = g1(x1), dx = -Math.sign(gr) * Math.min(60, Math.abs(gr) * lr * 60); g.strokeStyle = c('accent'); g.lineWidth = 3; g.beginPath(); g.moveTo(bx, by - 18); g.lineTo(bx + dx, by - 18); g.stroke(); g.fillStyle = c('accent'); g.font = '11px ' + c('font'); g.textAlign = 'center'; g.fillText('next step', bx + dx / 2, by - 24); }
    // 2-D
    [g, H] = fit(c2, 0.62);
    g.fillStyle = c('surface-2'); g.fillRect(0, 0, W, H);
    const ra = 2.2, X2 = (x) => W / 2 + (x / ra) * (W / 2 - 8), Y2 = (y) => H / 2 - (y / (ra * H / W)) * (H / 2 - 8);
    g.strokeStyle = c('line'); g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke();
    g.lineWidth = 1.5;
    [0.2, 0.6, 1.2, 2, 3, 4.2].forEach((lv, i) => { g.strokeStyle = c('brand'); g.globalAlpha = 0.25 + i * 0.1; g.beginPath(); g.ellipse(X2(0), Y2(0), (Math.sqrt(2 * lv) / ra) * (W / 2 - 8), (Math.sqrt(2 * lv / 8) / (ra * H / W)) * (H / 2 - 8), 0, 0, 7); g.stroke(); }); g.globalAlpha = 1;
    const cl = (v) => Math.max(-ra * 1.4, Math.min(ra * 1.4, v));
    g.strokeStyle = c('ink-soft'); g.lineWidth = 1.5; g.beginPath(); tr2.forEach(([x, y], i) => { const xx = X2(cl(x)), yy = Y2(Math.max(-ra * H / W * 1.4, Math.min(ra * H / W * 1.4, y))); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }); g.stroke();
    tr2.forEach(([x, y]) => { g.fillStyle = c('ink-soft'); g.beginPath(); g.arc(X2(cl(x)), Y2(Math.max(-3, Math.min(3, y))), 2.5, 0, 7); g.fill(); });
    g.fillStyle = c('good'); g.font = '700 11px ' + c('font'); g.textAlign = 'center'; g.fillText('★ minimum', X2(0), Y2(0) + 18);
    g.fillStyle = c(diverged ? 'bad' : 'accent'); g.strokeStyle = c('ink'); g.lineWidth = 2; g.beginPath(); g.arc(X2(cl(p2[0])), Y2(Math.max(-ra * H / W * 1.4, Math.min(ra * H / W * 1.4, p2[1]))), 9, 0, 7); g.fill(); g.stroke();
    // stats
    sT.textContent = t; s1.textContent = Math.abs(f1(x1)) > 1e4 ? 'huge' : f1(x1).toFixed(2); s2.textContent = f2(...p2) > 1e4 ? 'huge' : f2(...p2).toFixed(2);
    const [cls, msg] = regime(); badge.className = 'w-gradient-badge ' + cls; badge.textContent = (cls === 'good' ? '✓ ' : cls === 'warn' ? '⚠ ' : '✗ ') + msg;
    c1.setAttribute('aria-label', `Loss curve: ball at weight ${x1.toFixed(2)}, loss ${f1(x1).toFixed(2)}, ${t} steps taken.`);
    c2.setAttribute('aria-label', `Contour map: point at (${p2[0].toFixed(2)}, ${p2[1].toFixed(2)}), loss ${f2(...p2).toFixed(2)}.`);
  }
  lrIn.addEventListener('input', () => { lr = +lrIn.value; lrOut.textContent = lr.toFixed(2); if (!diverged) { draw(); } else draw(); say(); });
  const presets = h('div', { class: 'wa-chips', role: 'group', 'aria-label': 'Learning rate presets' }, [['Too small', 0.02], ['Just right', 0.1], ['Zig-zag', 0.2], ['Diverging', 0.5]].map(([l, v]) => h('button', { type: 'button', class: 'wa-btn wa-btn-small', onclick: () => { lr = v; lrIn.value = v; lrOut.textContent = v.toFixed(2); reset(); } }, l + ' (' + v + ')')));

  el.append(h('section', { class: 'wa w-gradient' },
    h('header', { class: 'wa-head' }, h('h3', {}, 'Gradient descent'), h('p', {}, 'Training is rolling downhill: look at the slope, take a step the other way, repeat. The learning rate sets the step size.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'press Play at 0.10, then Reset and try 0.02 and 0.50. On the long valley (second plot) a moderate rate zig-zags.'),
    h('div', { class: 'wa-controls' }, h('label', { class: 'wa-field' }, h('span', {}, 'Learning rate: ', lrOut), lrIn), presets),
    badge,
    h('div', { class: 'w-gradient-plots' },
      h('figure', { class: 'w-gradient-fig' }, h('figcaption', {}, '1-D: a loss curve'), c1),
      h('figure', { class: 'w-gradient-fig' }, h('figcaption', {}, '2-D: contours of a long thin valley (darker rings = lower loss)'), c2)),
    stats,
    h('div', { class: 'wa-row' }, h('button', { type: 'button', class: 'wa-btn', onclick: () => { toggle(false); step(); say(); } }, 'Step'), play, h('button', { type: 'button', class: 'wa-btn', onclick: reset }, 'Reset')),
    live,
    h('p', { class: 'wa-note' }, 'Toy model: both loss surfaces are simple hand-made functions, not a real network’s loss. The update rule (new position = old position − learning rate × slope) is the real one. Real training uses millions of dimensions and the slope comes from backpropagation.')));
  draw(); say();
  const ro = new ResizeObserver(() => { const w = c1.parentNode.clientWidth; if (Math.abs(w - W) > 1 && w < 561) draw(); });
  ro.observe(c1.parentNode);
  const mq = matchMedia('(prefers-color-scheme: dark)'), mo = new MutationObserver(draw);
  mq.addEventListener('change', draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => { clearInterval(timer); ro.disconnect(); mq.removeEventListener('change', draw); mo.disconnect(); };
}
