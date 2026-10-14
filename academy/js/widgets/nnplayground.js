// A tiny MLP (tanh hidden layers, sigmoid output, binary cross-entropy, Adam) trained live in JS. Real maths.
export const meta = { name: 'nnplayground', title: 'Neural network playground', blurb: 'Train a tiny network on 2-D points and watch it carve out the decision boundary.', level: 2, skills: ['l2.training'] };

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
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const gauss = (r) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());

function makeData(kind, seed) {
  const r = mulberry32(seed), pts = [], N = 120;
  for (let i = 0; i < N; i++) {
    let x, y, c;
    if (kind === 'xor') { const a = r() < 0.5 ? 1 : -1, b = r() < 0.5 ? 1 : -1; x = a * 0.5 + gauss(r) * 0.14; y = b * 0.5 + gauss(r) * 0.14; c = a * b > 0 ? 0 : 1; }
    else if (kind === 'circle') { c = i % 2; const rad = c ? 0.62 + r() * 0.3 : r() * 0.4, th = r() * 6.283; x = rad * Math.cos(th); y = rad * Math.sin(th); }
    else if (kind === 'spiral') { c = i % 2; const t = 0.15 + (i / N) * 2 * 0.85 + r() * 0.05, th = t * 3.4 * Math.PI + c * Math.PI; x = t * 0.9 * Math.cos(th) + gauss(r) * 0.03; y = t * 0.9 * Math.sin(th) + gauss(r) * 0.03; }
    else { x = r() * 2 - 1; y = r() * 2 - 1; c = x + 0.6 * y + gauss(r) * 0.12 > 0 ? 1 : 0; }
    pts.push({ x, y, c });
  }
  return pts;
}

class Net {
  constructor(sizes, seed) {
    const r = mulberry32(seed); this.sizes = sizes; this.W = []; this.B = []; this.m = []; this.v = []; this.t = 0;
    for (let l = 1; l < sizes.length; l++) {
      const fi = sizes[l - 1], fo = sizes[l], s = Math.sqrt(2 / (fi + fo)) * 1.4;
      this.W.push(Float64Array.from({ length: fi * fo }, () => gauss(r) * s)); this.B.push(new Float64Array(fo));
      this.m.push([new Float64Array(fi * fo), new Float64Array(fo)]); this.v.push([new Float64Array(fi * fo), new Float64Array(fo)]);
    }
  }
  forward(x, y, keep) {
    let a = [x, y]; const acts = [a];
    for (let l = 0; l < this.W.length; l++) {
      const fi = this.sizes[l], fo = this.sizes[l + 1], out = new Array(fo), last = l === this.W.length - 1;
      for (let j = 0; j < fo; j++) { let z = this.B[l][j]; for (let i = 0; i < fi; i++) z += this.W[l][j * fi + i] * a[i]; out[j] = last ? 1 / (1 + Math.exp(-z)) : Math.tanh(z); }
      a = out; if (keep) acts.push(a);
    }
    return keep ? acts : a[0];
  }
  epoch(data, lr) {
    const L = this.W.length, gW = this.W.map((w) => new Float64Array(w.length)), gB = this.B.map((b) => new Float64Array(b.length));
    let loss = 0, correct = 0;
    for (const p of data) {
      const acts = this.forward(p.x, p.y, true), o = Math.min(1 - 1e-9, Math.max(1e-9, acts[L][0]));
      loss += -(p.c ? Math.log(o) : Math.log(1 - o)); if ((o > 0.5) === !!p.c) correct++;
      let d = [o - p.c];
      for (let l = L - 1; l >= 0; l--) {
        const fi = this.sizes[l], fo = this.sizes[l + 1], prev = acts[l], nd = new Array(fi).fill(0);
        for (let j = 0; j < fo; j++) { gB[l][j] += d[j]; for (let i = 0; i < fi; i++) { gW[l][j * fi + i] += d[j] * prev[i]; nd[i] += d[j] * this.W[l][j * fi + i]; } }
        if (l > 0) for (let i = 0; i < fi; i++) nd[i] *= 1 - prev[i] * prev[i];
        d = nd;
      }
    }
    this.t++; const n = data.length, b1 = 0.9, b2 = 0.999, c1 = 1 - b1 ** this.t, c2 = 1 - b2 ** this.t;
    const upd = (P, G, M, V) => { for (let k = 0; k < P.length; k++) { const g = G[k] / n; M[k] = b1 * M[k] + (1 - b1) * g; V[k] = b2 * V[k] + (1 - b2) * g * g; P[k] -= (lr * (M[k] / c1)) / (Math.sqrt(V[k] / c2) + 1e-8); } };
    for (let l = 0; l < L; l++) { upd(this.W[l], gW[l], this.m[l][0], this.v[l][0]); upd(this.B[l], gB[l], this.m[l][1], this.v[l][1]); }
    return { loss: loss / n, acc: correct / n };
  }
}

const KINDS = { xor: 'XOR (opposite corners)', circle: 'Circle (ring around a disc)', linear: 'Linear (a straight line splits it)', spiral: 'Spiral (hard!)' };

export function mount(el, props = {}, ctx = {}) {
  const st = { kind: KINDS[props.dataset] ? props.dataset : 'xor', layers: 1, units: 1, lr: 0.03, seed: 11, dseed: 3, playing: false };
  let off0, data, net, hist = [], last = { loss: NaN, acc: 0 }, raf = 0, W = 300;
  const cv = h('canvas', { class: 'w-nn-cv', role: 'img', 'aria-label': 'Decision regions for the network' });
  const lc = h('canvas', { class: 'w-nn-lc', role: 'img', 'aria-label': 'Loss over training' });
  const stats = h('div', { class: 'wa-stats' });
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const mk = (l) => { const v = h('b', {}, '–'); stats.append(h('div', { class: 'wa-stat' }, v, h('span', {}, l))); return v; };
  const sEp = mk('epochs'), sLoss = mk('loss (lower is better)'), sAcc = mk('accuracy');
  const dsSel = h('select', {}, Object.entries(KINDS).map(([k, l]) => h('option', { value: k }, l)));
  const lySel = h('select', {}, [['1', '1 hidden layer'], ['2', '2 hidden layers']].map(([v, l]) => h('option', { value: v }, l)));
  const uo = h('output', {}, '1'), lo = h('output', {}, '0.03');
  const uIn = h('input', { type: 'range', min: '1', max: '8', step: '1', value: '1' });
  const lIn = h('input', { type: 'range', min: '0', max: '100', step: '1', value: '60', 'aria-valuetext': '0.03' });
  const lrOf = () => +(0.001 * Math.pow(100, +lIn.value / 100)).toFixed(4); // 0.001 .. 0.1 (log scale)
  const play = h('button', { type: 'button', class: 'wa-btn wa-btn-primary', 'aria-pressed': 'false', onclick: () => toggle() }, 'Train');
  dsSel.value = st.kind;
  lIn.value = String(Math.round((Math.log(st.lr / 0.001) / Math.log(100)) * 100));

  function build(newNet = true) {
    if (newNet) { net = new Net([2, ...Array(st.layers).fill(st.units), 1], st.seed); hist = []; last = { loss: NaN, acc: 0 }; }
    refresh();
  }
  const newData = () => { data = makeData(st.kind, st.dseed); };
  function step(n) { for (let i = 0; i < n; i++) { last = net.epoch(data, st.lr); hist.push(last.loss); if (hist.length > 2000) hist.shift(); } }
  function loop() { if (!st.playing) return; step(3); refresh(true); raf = requestAnimationFrame(loop); }
  function toggle(force) {
    st.playing = force != null ? force : !st.playing;
    play.textContent = st.playing ? 'Pause' : 'Train'; play.setAttribute('aria-pressed', String(st.playing));
    cancelAnimationFrame(raf);
    if (st.playing) { live.textContent = 'Training…'; loop(); } else summary();
  }
  function summary() {
    const e = net.t;
    live.textContent = e === 0 ? 'Untrained: the boundary is random and accuracy is about chance.' : `After ${e} epochs, loss ${last.loss.toFixed(3)}, accuracy ${(last.acc * 100).toFixed(0)} percent. ` + (last.acc > 0.97 ? 'The network has learned this pattern.' : last.acc > 0.8 ? 'Getting there. Keep training or add units.' : 'Still struggling. Try more training, more units, or a second layer.');
  }

  const col = () => { const s = getComputedStyle(document.documentElement); return (k) => s.getPropertyValue('--' + k).trim(); };
  function size() {
    const dpr = window.devicePixelRatio || 1; W = Math.max(240, Math.min(480, cv.parentNode.clientWidth || 300));
    cv.style.width = W + 'px'; cv.style.height = W + 'px'; if (cv.width !== Math.round(W * dpr)) { cv.width = cv.height = Math.round(W * dpr); }
    const lh = Math.round(W * 0.42); lc.style.width = W + 'px'; lc.style.height = lh + 'px'; if (lc.width !== Math.round(W * dpr)) { lc.width = Math.round(W * dpr); lc.height = Math.round(lh * dpr); }
    return dpr;
  }
  const rgb = (str, oc) => { oc.clearRect(0, 0, 1, 1); oc.fillStyle = str; oc.fillRect(0, 0, 1, 1); return oc.getImageData(0, 0, 1, 1).data; };
  function draw() {
    const c = col(), dpr = size(), g = cv.getContext('2d'), n = 36, cs = W / n;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = c('surface'); g.fillRect(0, 0, W, W);
    const off = off0 || (off0 = document.createElement('canvas')); off.width = off.height = n; const oc = off.getContext('2d', { willReadFrequently: true }), im = oc.createImageData(n, n), A = rgb(c('brand'), oc), B = rgb(c('accent'), oc), S = rgb(c('surface'), oc);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const p = net.forward(((i + 0.5) / n) * 2 - 1, 1 - ((j + 0.5) / n) * 2), col = p > 0.5 ? B : A, a = 0.12 + 0.55 * Math.abs(p - 0.5) * 2, k = (j * n + i) * 4; for (let z = 0; z < 3; z++) im.data[k + z] = col[z] * a + S[z] * (1 - a); im.data[k + 3] = 255; }
    oc.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(off, 0, 0, W, W);
    data.forEach((p) => {
      const x = ((p.x + 1) / 2) * W, y = ((1 - p.y) / 2) * W; g.fillStyle = p.c ? c('accent') : c('brand'); g.strokeStyle = c('ink'); g.lineWidth = 1.5; g.beginPath();
      if (p.c) g.rect(x - 4.5, y - 4.5, 9, 9); else g.arc(x, y, 5, 0, 7); g.fill(); g.stroke();
    });
    // loss curve
    const lw = W, lh = parseFloat(lc.style.height), q = lc.getContext('2d'); q.setTransform(dpr, 0, 0, dpr, 0, 0); q.fillStyle = c('surface-2'); q.fillRect(0, 0, lw, lh);
    q.strokeStyle = c('line'); q.lineWidth = 1; q.fillStyle = c('ink-soft'); q.font = '11px ' + c('font'); q.textAlign = 'left';
    const top = Math.max(0.8, ...hist.slice(0, 40).map((v) => v)), ys = (v) => lh - 18 - (Math.min(v, top) / top) * (lh - 30);
    q.beginPath(); q.moveTo(30, 8); q.lineTo(30, lh - 18); q.lineTo(lw - 6, lh - 18); q.stroke();
    q.fillText(top.toFixed(1), 2, 16); q.fillText('0', 18, lh - 20); q.fillText('epochs →', lw - 62, lh - 4); q.fillText('loss', 4, lh - 4);
    if (hist.length > 1) { q.strokeStyle = c('brand'); q.lineWidth = 2.5; q.beginPath(); const nn = hist.length; hist.forEach((v, i) => { const x = 30 + (i / Math.max(nn - 1, 1)) * (lw - 38); i ? q.lineTo(x, ys(v)) : q.moveTo(x, ys(v)); }); q.stroke(); }
    else q.fillText('Loss curve appears here once you train.', 40, lh / 2);
  }
  function refresh(quiet) {
    sEp.textContent = net.t; sLoss.textContent = isNaN(last.loss) ? '–' : last.loss.toFixed(3); sAcc.textContent = net.t ? Math.round(last.acc * 100) + '%' : '–';
    cv.setAttribute('aria-label', `Decision regions after ${net.t} epochs; accuracy ${net.t ? Math.round(last.acc * 100) + ' percent' : 'not yet measured'}. Circles are class A, squares are class B.`);
    draw(); if (!quiet) summary();
  }

  const reinit = () => { toggle(false); st.seed += 1; build(true); };
  dsSel.addEventListener('change', () => { st.kind = dsSel.value; toggle(false); newData(); build(true); });
  lySel.addEventListener('change', () => { st.layers = +lySel.value; toggle(false); build(true); });
  uIn.addEventListener('input', () => { st.units = +uIn.value; uo.textContent = st.units; toggle(false); build(true); });
  lIn.addEventListener('input', () => { st.lr = lrOf(); lo.textContent = st.lr; lIn.setAttribute('aria-valuetext', String(st.lr)); });

  const btns = h('div', { class: 'wa-row' }, play,
    h('button', { type: 'button', class: 'wa-btn', onclick: () => { toggle(false); step(1); refresh(); } }, 'Step (1 epoch)'),
    h('button', { type: 'button', class: 'wa-btn', onclick: () => { toggle(false); step(25); refresh(); } }, 'Step ×25'),
    h('button', { type: 'button', class: 'wa-btn', onclick: reinit }, 'Reset network'),
    h('button', { type: 'button', class: 'wa-btn', onclick: () => { toggle(false); st.dseed += 1; newData(); build(true); } }, 'New data'));

  el.append(h('section', { class: 'wa w-nn' },
    h('header', { class: 'wa-head' }, h('h3', {}, 'Neural network playground'), h('p', {}, 'Two kinds of points, one tiny network. Training nudges thousands of knobs until the coloured regions separate the points.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'XOR starts with just 1 unit, which cannot solve it. Press Train, then raise the units to 4 and train again. Switch to Spiral and try 2 layers with 8 units.'),
    h('div', { class: 'w-nn-main' },
      h('div', { class: 'w-nn-vis' }, cv, h('p', { class: 'wa-legend' }, '● circles = class A (blue-purple region), ■ squares = class B (orange region). Stronger tint = more confident.')),
      h('div', { class: 'w-nn-side' },
        h('label', { class: 'wa-field' }, h('span', {}, 'Dataset'), dsSel),
        h('label', { class: 'wa-field' }, h('span', {}, 'Depth'), lySel),
        h('label', { class: 'wa-field' }, h('span', {}, 'Units per hidden layer: ', uo), uIn),
        h('label', { class: 'wa-field' }, h('span', {}, 'Learning rate: ', lo), lIn),
        stats, lc)),
    btns, live,
    h('p', { class: 'wa-note' }, 'This is real: the network is genuinely trained in your browser by backpropagation and the Adam optimiser (tanh hidden units, sigmoid output, cross-entropy loss, fixed random seed). It is tiny and only sees x and y; real models have billions of weights.')));
  newData(); build(true); step(150); refresh();
  const ro = new ResizeObserver(() => { const w = cv.parentNode.clientWidth; if (Math.abs(w - W) > 1 && w < 481) draw(); });
  ro.observe(cv.parentNode);
  const mq = matchMedia('(prefers-color-scheme: dark)'), mo = new MutationObserver(draw);
  mq.addEventListener('change', draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => { st.playing = false; cancelAnimationFrame(raf); ro.disconnect(); mq.removeEventListener('change', draw); mo.disconnect(); };
}
