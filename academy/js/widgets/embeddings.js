// Embeddings: a hand-placed 2-D toy map with real cosine similarity and vector arithmetic.
export const meta = { name: 'embeddings', title: 'Embedding map', blurb: 'Words as points: nearest neighbours, analogies and similarity search.', level: 1, skills: ['l1.embeddings'] };

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
// Hand-placed vectors centred on the origin (range about -0.5..0.5). Clusters: people/royalty, places, animals, food, tech, feelings.
const P = {
  man: [-0.30, 0.12, 0], woman: [-0.30, 0.30, 0], boy: [-0.22, 0.02, 0], girl: [-0.22, 0.20, 0], king: [-0.42, 0.12, 0], queen: [-0.41, 0.31, 0], prince: [-0.36, -0.04, 0], princess: [-0.36, 0.14, 0],
  france: [0.12, 0.44, 1], paris: [0.12, 0.30, 1], italy: [0.26, 0.44, 1], rome: [0.26, 0.30, 1], england: [0.40, 0.44, 1], london: [0.40, 0.30, 1], japan: [0.50, 0.20, 1], tokyo: [0.50, 0.06, 1],
  cat: [0.40, -0.16, 2], dog: [0.47, -0.27, 2], horse: [0.33, -0.32, 2], lion: [0.50, -0.12, 2], fish: [0.42, -0.42, 2], bird: [0.25, -0.20, 2], mouse: [0.30, -0.06, 2],
  apple: [0.06, -0.42, 3], banana: [0.14, -0.34, 3], bread: [-0.04, -0.32, 3], pizza: [-0.06, -0.46, 3], rice: [0.04, -0.24, 3], cheese: [0.20, -0.46, 3], cake: [-0.14, -0.40, 3],
  computer: [-0.30, -0.28, 4], phone: [-0.42, -0.16, 4], robot: [-0.22, -0.38, 4], internet: [-0.46, -0.30, 4], code: [-0.36, -0.42, 4], laptop: [-0.24, -0.18, 4],
  happy: [-0.14, 0.36, 5], sad: [-0.20, 0.46, 5], angry: [-0.06, 0.46, 5], calm: [-0.06, 0.28, 5],
};
const CL = ['People & royalty', 'Countries & capitals', 'Animals', 'Food', 'Technology', 'Feelings'];
const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star'];
const WORDS = Object.keys(P);
const v2 = (w) => [P[w][0], P[w][1]];
const cosv = (a, b) => { const d = a[0] * b[0] + a[1] * b[1], l = Math.hypot(...a) * Math.hypot(...b); return l ? d / l : 0; };
const nearest = (vec, excl, n) => WORDS.filter((w) => !excl.includes(w)).map((w) => [w, cosv(vec, v2(w))]).sort((a, b) => b[1] - a[1]).slice(0, n);

export function mount(el, props = {}, ctx = {}) {
  let mode = ['neighbors', 'analogy', 'search'].includes(props.mode) ? props.mode : 'neighbors';
  let pick = 'cat', an = ['king', 'man', 'woman'], W = 320, shown = [], result = null;
  const cv = h('canvas', { class: 'w-embeddings-cv', role: 'img', 'aria-label': 'Map of 40 words in six clusters' });
  const wordSel = h('select', { 'aria-label': 'Pick a word' }, WORDS.slice().sort().map((w) => h('option', { value: w }, w)));
  const searchIn = h('input', { type: 'text', list: 'w-emb-list', autocomplete: 'off', placeholder: 'type a word, e.g. dog', 'aria-label': 'Search word' });
  const dl = h('datalist', { id: 'w-emb-list' }, WORDS.map((w) => h('option', { value: w })));
  const sels = [0, 1, 2].map((i) => h('select', { 'aria-label': ['First word', 'Word to subtract', 'Word to add'][i] }, WORDS.slice().sort().map((w) => h('option', { value: w }, w))));
  const list = h('ol', { class: 'w-embeddings-list' });
  const ctl = h('div', { class: 'wa-controls' });
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const modes = h('div', { class: 'wa-chips', role: 'group', 'aria-label': 'Mode' }, [['neighbors', 'Neighbours'], ['analogy', 'Analogy'], ['search', 'Search']].map(([k, l]) => h('button', { type: 'button', class: 'wa-btn wa-btn-small', 'data-k': k, onclick: () => { mode = k; setup(); } }, l)));
  const col = () => { const s = getComputedStyle(document.documentElement); return (k) => s.getPropertyValue('--' + k).trim(); };
  const CC = ['brand', 'accent', 'good', 'warn', 'bad', 'ink-soft'];
  const toPx = (p) => [W / 2 + (p[0] - 0.04) * (W - 56), W / 2 - p[1] * (W - 56)];

  function shape(g, kind, x, y, r) {
    g.beginPath();
    if (kind === 'circle') g.arc(x, y, r, 0, 7);
    else if (kind === 'square') g.rect(x - r, y - r, 2 * r, 2 * r);
    else if (kind === 'triangle') { g.moveTo(x, y - r - 1); g.lineTo(x + r + 1, y + r); g.lineTo(x - r - 1, y + r); g.closePath(); }
    else if (kind === 'diamond') { g.moveTo(x, y - r - 2); g.lineTo(x + r + 2, y); g.lineTo(x, y + r + 2); g.lineTo(x - r - 2, y); g.closePath(); }
    else if (kind === 'cross') { g.moveTo(x - r, y - r / 2.5); g.lineTo(x - r / 2.5, y - r / 2.5); g.lineTo(x - r / 2.5, y - r); g.lineTo(x + r / 2.5, y - r); g.lineTo(x + r / 2.5, y - r / 2.5); g.lineTo(x + r, y - r / 2.5); g.lineTo(x + r, y + r / 2.5); g.lineTo(x + r / 2.5, y + r / 2.5); g.lineTo(x + r / 2.5, y + r); g.lineTo(x - r / 2.5, y + r); g.lineTo(x - r / 2.5, y + r / 2.5); g.lineTo(x - r, y + r / 2.5); g.closePath(); }
    else { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.55 : r + 2; g[i ? 'lineTo' : 'moveTo'](x + rr * Math.cos(a), y + rr * Math.sin(a)); } g.closePath(); }
  }

  function draw() {
    const c = col(), dpr = window.devicePixelRatio || 1;
    W = Math.max(280, Math.min(560, cv.parentNode.clientWidth || 320));
    const H = Math.round(W * 1.0);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    g.fillStyle = c('surface-2'); g.fillRect(0, 0, W, H);
    g.strokeStyle = c('line'); g.lineWidth = 1; const o0 = toPx([0, 0]); g.beginPath(); g.moveTo(0, o0[1]); g.lineTo(W, o0[1]); g.moveTo(o0[0], 0); g.lineTo(o0[0], H); g.stroke();
    const hl = new Set(shown.map((s) => s[0]));
    
    // lines/arrows
    g.lineWidth = 2;
    if (mode !== 'analogy') {
      shown.forEach(([w]) => { const p = toPx(v2(w)), q = toPx(v2(pick)); g.strokeStyle = c('ink-soft'); g.setLineDash([5, 4]); g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(p[0], p[1]); g.stroke(); g.setLineDash([]); });
    } else if (result) {
      const [a, b, d] = an.map((w) => toPx(v2(w))), r = toPx(result.vec);
      g.strokeStyle = c('ink-soft'); g.setLineDash([5, 4]);
      [[b, d]].forEach(([s, e]) => { g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(e[0], e[1]); g.stroke(); });
      g.setLineDash([]); g.strokeStyle = c('accent'); g.lineWidth = 3; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(r[0], r[1]); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.arc(r[0], r[1], 9, 0, 7); g.stroke(); g.font = '700 14px ' + c('font'); g.fillStyle = c('accent'); g.textAlign = 'center'; g.fillText('?', r[0], r[1] - 14);
    }
    g.font = '600 11px ' + c('font'); g.textAlign = 'center';
    WORDS.forEach((w) => {
      const [x, y] = toPx(v2(w)), cl = P[w][2], on = w === pick && mode !== 'analogy' || an.includes(w) && mode === 'analogy' || hl.has(w);
      g.fillStyle = c(CC[cl]); g.strokeStyle = c('surface'); g.lineWidth = 1.5;
      shape(g, SHAPES[cl], x, y, on ? 6.5 : 4.5); g.fill(); g.stroke();
      if (on) { g.strokeStyle = c('ink'); g.lineWidth = 2; shape(g, SHAPES[cl], x, y, 9); g.stroke(); }
      g.fillStyle = on ? c('ink') : c('ink-soft'); g.font = (on ? '700 ' : '500 ') + '11px ' + c('font');
      g.fillText(w, x, y - (on ? 12 : 8));
    });
  }

  function update() {
    list.replaceChildren(); result = null;
    if (mode === 'analogy') {
      const [a, b, d] = an, vec = [v2(a)[0] - v2(b)[0] + v2(d)[0], v2(a)[1] - v2(b)[1] + v2(d)[1]];
      const nn = nearest(vec, an, 3); result = { vec }; shown = nn.slice(0, 1);
      list.append(...nn.map(([w, s], i) => h('li', {}, h('b', {}, w), h('span', { class: 'w-embeddings-bar' }, h('span', { style: `width:${Math.max(0, s) * 100}%` })), h('i', {}, s.toFixed(2)), i === 0 ? ' ← best match' : '')));
      live.textContent = `${a} minus ${b} plus ${d} lands nearest to ${nn[0][0]} (cosine ${nn[0][1].toFixed(2)}).`;
    } else {
      const w = mode === 'search' ? (searchIn.value.trim().toLowerCase()) : pick;
      if (mode === 'search' && !P[w]) { shown = []; list.append(h('li', { class: 'wa-muted' }, 'Not in this toy vocabulary of 40 words. Try: ' + WORDS.slice(0, 6).join(', ') + '…')); live.textContent = `“${w}” is not in the toy vocabulary.`; draw(); return; }
      pick = w; const nn = nearest(v2(w), [w], mode === 'search' ? 8 : 5); shown = nn.slice(0, mode === 'search' ? 8 : 5);
      list.append(...nn.map(([x, s]) => h('li', {}, h('b', {}, x), h('span', { class: 'w-embeddings-bar' }, h('span', { style: `width:${Math.max(0, s) * 100}%` })), h('i', {}, s.toFixed(2)))));
      live.textContent = `Closest to ${w}: ${nn.slice(0, 3).map(([x, s]) => x + ' ' + s.toFixed(2)).join(', ')}.`;
    }
    draw();
  }

  function setup() {
    modes.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === mode)));
    ctl.replaceChildren(); h3x.textContent = mode === 'analogy' ? 'Nearest words to the result (dashed line shows the offset being copied)' : 'Most similar words (cosine)';
    if (mode === 'neighbors') ctl.append(h('label', { class: 'wa-field' }, h('span', {}, 'Selected word (or click a point)'), wordSel));
    if (mode === 'search') ctl.append(h('label', { class: 'wa-field' }, h('span', {}, 'Search for words like…'), searchIn, dl));
    if (mode === 'analogy') { ctl.append(h('div', { class: 'w-embeddings-eq' }, h('label', { class: 'wa-field' }, h('span', {}, 'Start'), sels[0]), h('span', { class: 'w-embeddings-op', 'aria-hidden': 'true' }, '−'), h('label', { class: 'wa-field' }, h('span', {}, 'Subtract'), sels[1]), h('span', { class: 'w-embeddings-op', 'aria-hidden': 'true' }, '+'), h('label', { class: 'wa-field' }, h('span', {}, 'Add'), sels[2])),
      h('div', { class: 'wa-chips' }, [['king − man + woman', ['king', 'man', 'woman']], ['paris − france + italy', ['paris', 'france', 'italy']], ['prince − boy + girl', ['prince', 'boy', 'girl']]].map(([l, v]) => h('button', { type: 'button', class: 'wa-btn wa-btn-small', onclick: () => { an = v.slice(); sels.forEach((s, i) => { s.value = an[i]; }); update(); } }, l)))); }
    wordSel.value = pick; sels.forEach((s, i) => { s.value = an[i]; });
    update();
  }
  wordSel.addEventListener('change', () => { pick = wordSel.value; update(); });
  searchIn.addEventListener('input', update);
  sels.forEach((s, i) => s.addEventListener('change', () => { an[i] = s.value; update(); }));
  cv.addEventListener('click', (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = null, bd = 28;
    WORDS.forEach((w) => { const p = toPx(v2(w)), d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = w; } });
    if (!best) return;
    if (mode === 'analogy') mode = 'neighbors';
    if (mode === 'search') searchIn.value = best;
    pick = best; setup();
  });
  const h3x = h('h4', { class: 'wa-h4' }, '');
  const legend = h('ul', { class: 'w-embeddings-legend', 'aria-label': 'Cluster legend' }, CL.map((n, i) => h('li', {}, h('i', { class: 'w-embeddings-sw', 'data-s': SHAPES[i], style: `color:var(--${CC[i]})` }, ['●', '■', '▲', '◆', '✚', '★'][i]), ' ' + n)));

  el.append(h('section', { class: 'wa w-embeddings' },
    h('header', { class: 'wa-head' }, h('h3', {}, 'Embedding map'), h('p', {}, 'An embedding turns a word into a list of numbers. Words with similar meanings end up close together.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'click “king” on the map, then switch to Analogy and see what king − man + woman lands on.'),
    modes, ctl, h('div', { class: 'w-embeddings-cvwrap' }, cv), legend,
    h3x, list, live,
    h('p', { class: 'wa-note' }, 'Toy model: these are 2-D coordinates placed by hand. Real embeddings have hundreds to thousands of dimensions and are learned from huge amounts of text. The cosine and vector-arithmetic maths here is real, and similarity is measured by angle from the map centre, not by distance on screen.')));
  setup();
  const ro = new ResizeObserver(() => { const w = cv.parentNode.clientWidth; if (Math.abs(w - W) > 1 && w < 561) draw(); });
  ro.observe(cv.parentNode);
  const mq = matchMedia('(prefers-color-scheme: dark)'), mo = new MutationObserver(draw);
  mq.addEventListener('change', draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => { ro.disconnect(); mq.removeEventListener('change', draw); mo.disconnect(); };
}
