// Next-token probabilities: real softmax with temperature, top-k, top-p, and sampling over hand-authored logits.
export const meta = { name: 'nextword', title: 'Predict the next word', blurb: 'See how temperature, top-k and top-p reshape what a model picks next.', level: 0, skills: ['l0.nexttoken'] };

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

// Logits are invented for teaching; they are NOT output from a real model.
const SCEN = {
  sky: { label: 'Sky', prompt: 'The sky is', cands: [['blue', 5.2], ['clear', 3.9], ['grey', 3.4], ['beautiful', 3.0], ['falling', 1.4], ['the limit', 1.0], ['made of cheese', -0.6], ['purple', 0.4]] },
  doctor: { label: 'Doctor', prompt: 'The doctor looked at the scan and said the patient should', cands: [['rest', 4.4], ['see a specialist', 3.9], ['take', 3.3], ['avoid', 2.6], ['return next week', 2.5], ['stop', 1.8], ['dance', -0.8], ['buy a boat', -1.6]] },
  code: { label: 'Code', prompt: 'def add(a, b):\n    return a', cands: [[' +', 7.0], [' -', 2.9], [' *', 2.4], [' and', 1.6], [' if', 0.9], ['.add', 0.5], [' ,', -0.2], [' banana', -2.5]] },
};

export function mount(el, props = {}, ctx = {}) {
  let key = SCEN[props.scenario] ? props.scenario : 'sky';
  const st = { temp: 1, topk: 0, topp: 1, sampled: null, seed: 7 };
  let rng = mulberry32(st.seed);

  const promptEl = h('p', { class: 'w-nextword-prompt', 'aria-live': 'off' });
  const bars = h('ol', { class: 'w-nextword-bars', 'aria-label': 'Candidate next tokens and their probabilities' });
  const tempOut = h('output', {}, '1.0');
  const tempIn = h('input', { type: 'range', min: '0.1', max: '2.5', step: '0.1', value: '1', 'aria-label': 'Temperature' });
  const kSel = h('select', {}, [['0', 'off'], ['1', '1 (greedy)'], ['3', '3'], ['5', '5']].map(([v, l]) => h('option', { value: v }, l)));
  const pSel = h('select', {}, [['1', 'off'], ['0.5', '0.5'], ['0.8', '0.8'], ['0.95', '0.95']].map(([v, l]) => h('option', { value: v }, l)));
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const samples = h('div', { class: 'w-nextword-samples' });
  const greedy = h('p', { class: 'w-nextword-greedy' });
  const tabs = h('div', { class: 'wa-chips', role: 'group', 'aria-label': 'Prompt' }, Object.entries(SCEN).map(([k, s]) => h('button', { type: 'button', class: 'wa-btn wa-btn-small', 'data-k': k, onclick: () => { key = k; st.sampled = null; rng = mulberry32(st.seed); draw(); } }, s.label)));

  function dist() {
    const c = SCEN[key].cands.map(([w, l]) => ({ w, l }));
    const T = Math.max(st.temp, 0.01);
    const mx = Math.max(...c.map((x) => x.l / T));
    let sum = 0;
    c.forEach((x) => { x.e = Math.exp(x.l / T - mx); sum += x.e; });
    c.forEach((x) => { x.p = x.e / sum; x.keep = true; });
    const sorted = [...c].sort((a, b) => b.p - a.p);
    if (st.topk > 0) sorted.forEach((x, i) => { if (i >= st.topk) x.keep = false; });
    if (st.topp < 1) { let cum = 0; sorted.forEach((x) => { if (cum >= st.topp) x.keep = false; if (x.keep) cum += x.p; }); }
    const ks = c.filter((x) => x.keep).reduce((s, x) => s + x.p, 0);
    c.forEach((x) => { x.q = x.keep ? x.p / ks : 0; });
    return { c, sorted };
  }

  function draw() {
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === key)));
    promptEl.replaceChildren(h('span', { class: 'w-nextword-ptxt' }, SCEN[key].prompt), h('span', { class: 'w-nextword-cursor' }, ' … ?'));
    const { c, sorted } = dist();
    bars.replaceChildren();
    sorted.forEach((x) => {
      bars.append(h('li', { class: 'w-nextword-row' + (x.keep ? '' : ' is-cut') },
        h('span', { class: 'w-nextword-w' }, x.w.replace(/^ /, '␣')),
        h('span', { class: 'w-nextword-track' }, h('span', { class: 'w-nextword-fill', style: `width:${(x.keep ? x.q : x.p) * 100}%` })),
        h('span', { class: 'w-nextword-pct' }, ((x.keep ? x.q : x.p) * 100).toFixed(1) + '%' + (x.keep ? '' : ' cut'))));
    });
    const top = sorted[0];
    greedy.replaceChildren(h('b', {}, 'Greedy pick: '), h('span', { class: 'w-nextword-pick' }, top.w.replace(/^ /, '␣')), ' (always the single most likely token)');
    const kept = c.filter((x) => x.keep).length;
    const ent = -c.filter((x) => x.q > 0).reduce((s, x) => s + x.q * Math.log2(x.q), 0);
    live.textContent = `Temperature ${st.temp.toFixed(1)}. Most likely: "${top.w.trim()}" at ${(top.q * 100 || top.p * 100).toFixed(0)} percent. ${kept} of ${c.length} candidates are still allowed. ` + (ent < 0.8 ? 'The model is very sure.' : ent > 2 ? 'The model is spreading its bets widely.' : 'A moderate spread.');
    if (st.sampled) renderSamples();
    else samples.replaceChildren(h('p', { class: 'wa-muted' }, 'Press “Sample 10 continuations” to roll the dice ten times.'));
  }

  function renderSamples() {
    const { c } = dist();
    const counts = new Map();
    st.sampled.forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
    samples.replaceChildren(h('div', { class: 'w-nextword-chips', role: 'list' }, st.sampled.map((w, i) => h('span', { class: 'w-nextword-s', role: 'listitem' }, h('i', {}, (i + 1) + '.'), ' ' + w.replace(/^ /, '␣')))),
      h('p', { class: 'wa-muted' }, [...counts].sort((a, b) => b[1] - a[1]).map(([w, n]) => `${w.trim()} ×${n}`).join(' · ')));
    if (ctx.announce) ctx.announce(`Sampled ten continuations: ${[...counts].map(([w, n]) => w.trim() + ' ' + n).join(', ')}`);
  }

  function sample() {
    const { c } = dist();
    const out = [];
    for (let i = 0; i < 10; i++) {
      let r = rng(), acc = 0, pick = c.find((x) => x.keep);
      for (const x of c) { if (!x.keep) continue; acc += x.q; if (r <= acc) { pick = x; break; } }
      out.push(pick.w);
    }
    st.sampled = out; draw();
  }

  tempIn.addEventListener('input', () => { st.temp = +tempIn.value; tempOut.textContent = st.temp.toFixed(1); st.sampled = null; draw(); });
  kSel.addEventListener('change', () => { st.topk = +kSel.value; st.sampled = null; draw(); });
  pSel.addEventListener('change', () => { st.topp = +pSel.value; st.sampled = null; draw(); });
  const reset = () => { st.temp = 1; st.topk = 0; st.topp = 1; st.sampled = null; rng = mulberry32(st.seed); tempIn.value = '1'; tempOut.textContent = '1.0'; kSel.value = '0'; pSel.value = '1'; draw(); };

  el.append(h('section', { class: 'wa w-nextword' },
    h('header', { class: 'wa-head' }, h('h3', {}, 'Predict the next word'), h('p', {}, 'A language model scores every possible next token, then picks one. You control how adventurous the pick is.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'drag temperature to 0.1, then to 2.5, and press Sample each time. Which answers show up?'),
    tabs, promptEl,
    h('div', { class: 'wa-controls' },
      h('label', { class: 'wa-field' }, h('span', {}, 'Temperature ', tempOut), tempIn),
      h('label', { class: 'wa-field' }, h('span', {}, 'Top-k'), kSel),
      h('label', { class: 'wa-field' }, h('span', {}, 'Top-p'), pSel)),
    bars, greedy,
    h('div', { class: 'wa-row' }, h('button', { type: 'button', class: 'wa-btn wa-btn-primary', onclick: sample }, 'Sample 10 continuations'), h('button', { type: 'button', class: 'wa-btn', onclick: reset }, 'Reset')),
    samples, live,
    h('p', { class: 'wa-note' }, 'Toy model: the softmax, top-k and top-p maths is real, but the scores (logits) are invented by hand for teaching. They are not output from a real model. Low temperature sharpens the distribution; high temperature flattens it. Top-k keeps the k best tokens; top-p keeps the smallest set whose probabilities add up to p. “␣” marks a leading space.')));
  draw();
}
