// Attention: hand-authored toy weights, several "heads" with different roles.
export const meta = { name: 'attention', title: 'Attention: who looks at whom', blurb: 'Pick a word and see which other words it pays attention to.', level: 1, skills: ['l1.attention'] };

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

// Scores are authored by hand. [query, key, score]; unlisted pairs get a baseline of 0.
const S = {
  it: {
    words: 'The animal didn’t cross the street because it was too tired'.split(' '), start: 7,
    heads: [
      { name: 'Reference head', role: 'Works out what a pronoun or noun phrase points back to.', links: [[7, 1, 4.2], [7, 5, 1.8], [10, 1, 3], [10, 7, 2.2], [8, 7, 2], [2, 1, 2.4], [3, 1, 2.2], [5, 4, 2]] },
      { name: 'Grammar head', role: 'Links verbs to their subjects and nouns to their determiners.', links: [[7, 8, 2.6], [8, 7, 3], [9, 10, 2.5], [10, 8, 2.6], [10, 9, 1.8], [2, 1, 3], [3, 1, 2], [3, 2, 2], [1, 0, 3], [5, 4, 3.2], [4, 3, 1.2], [6, 3, 2.2], [6, 7, 1.4]] },
      { name: 'Neighbour head', role: 'Mostly looks at the word just before.', neighbour: true },
    ],
  },
  bank: {
    words: 'She sat by the river bank and watched the water flow'.split(' '), start: 5,
    heads: [
      { name: 'Meaning head', role: 'Uses nearby words to pick the right sense of an ambiguous word.', links: [[5, 4, 4.2], [5, 10, 2.4], [5, 9, 1.2], [5, 1, 1.6], [10, 4, 1.8], [10, 9, 2.4], [4, 5, 2.4]] },
      { name: 'Grammar head', role: 'Links verbs to subjects and nouns to determiners.', links: [[1, 0, 3.2], [7, 0, 2.8], [7, 9, 2.2], [4, 3, 3], [5, 4, 2.4], [9, 8, 3], [10, 9, 2.4], [2, 5, 2.2], [3, 4, 1.2]] },
      { name: 'Neighbour head', role: 'Mostly looks at the word just before.', neighbour: true },
    ],
  },
  cat: {
    words: 'The cat that chased the mouse was very fast'.split(' '), start: 6,
    heads: [
      { name: 'Subject head', role: 'Connects a verb or description to the thing it is about.', links: [[6, 1, 4.2], [6, 5, 1.2], [8, 1, 3.4], [8, 6, 2.2], [3, 1, 3.4], [3, 5, 2.2], [7, 8, 2.8]] },
      { name: 'Grammar head', role: 'Links verbs to objects and nouns to determiners.', links: [[3, 5, 3.2], [5, 4, 3], [1, 0, 3], [5, 3, 1.4], [7, 8, 3.2], [8, 7, 1.8], [6, 8, 2.2]] },
      { name: 'Neighbour head', role: 'Mostly looks at the word just before.', neighbour: true },
    ],
  },
};

function headWeights(sent, head, q) {
  const n = sent.words.length;
  const sc = Array.from({ length: n }, () => 0);
  if (head.neighbour) { for (let k = 0; k < n; k++) sc[k] = k === q - 1 ? 3.6 : k === q + 1 ? 1.4 : k === q ? 1.2 : 0; }
  else { sc[q] = 1; for (const [a, b, s] of head.links) if (a === q) sc[b] = s; }
  const mx = Math.max(...sc), ex = sc.map((s) => Math.exp(s - mx)), sum = ex.reduce((a, b) => a + b, 0);
  return ex.map((x) => x / sum);
}

export function mount(el, props = {}, ctx = {}) {
  let key = S[props.sentence] ? props.sentence : 'it';
  let q = S[key].start;
  const on = new Set([0]);
  const wordsEl = h('div', { class: 'w-attention-words', role: 'group', 'aria-label': 'Sentence words. Choose one to see what it attends to.' });
  const heads = h('div', { class: 'w-attention-heads', role: 'group', 'aria-label': 'Attention heads' });
  const rank = h('ol', { class: 'w-attention-rank' });
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const roleEl = h('p', { class: 'wa-muted' });
  const tabs = h('div', { class: 'wa-chips', role: 'group', 'aria-label': 'Sentence' }, Object.entries(S).map(([k, s]) => h('button', { type: 'button', class: 'wa-btn wa-btn-small', 'data-k': k, onclick: () => { key = k; q = S[k].start; on.clear(); on.add(0); build(); } }, '“' + s.words.slice(0, 4).join(' ') + '…”')));

  function compute() {
    const s = S[key], n = s.words.length;
    if (!on.size) return Array(n).fill(0);
    const acc = Array(n).fill(0);
    on.forEach((i) => headWeights(s, s.heads[i], q).forEach((w, k) => { acc[k] += w / on.size; }));
    return acc;
  }

  function build() {
    const s = S[key];
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === key)));
    heads.replaceChildren(...s.heads.map((hd, i) => h('label', { class: 'w-attention-head' }, h('input', { type: 'checkbox', checked: on.has(i) ? true : null, onchange: (e) => { e.target.checked ? on.add(i) : on.delete(i); update(); } }), h('span', {}, h('b', {}, hd.name), ' – ', hd.role))));
    wordsEl.replaceChildren(...s.words.map((w, i) => h('button', { type: 'button', class: 'w-attention-w', 'aria-pressed': String(i === q), onclick: () => { q = i; update(); } },
      h('span', { class: 'w-attention-bar' }, h('span', { class: 'w-attention-barfill' })), h('span', { class: 'w-attention-wt' }, w), h('span', { class: 'w-attention-pct' }))));
    update();
  }

  function update() {
    const s = S[key], w = compute();
    const btns = wordsEl.children;
    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      b.setAttribute('aria-pressed', String(i === q));
      b.querySelector('.w-attention-barfill').style.height = Math.round(w[i] * 100) + '%';
      b.style.setProperty('--a', (w[i] * 100).toFixed(0) + '%');
      b.querySelector('.w-attention-pct').textContent = on.size ? Math.round(w[i] * 100) + '%' : '';
      b.setAttribute('aria-label', `${s.words[i]}${i === q ? ', selected word' : ''}${on.size ? ', ' + Math.round(w[i] * 100) + ' percent attention from ' + s.words[q] : ''}`);
    }
    const order = w.map((v, i) => [i, v]).filter(([i]) => i !== q).sort((a, b) => b[1] - a[1]).slice(0, 4);
    rank.replaceChildren(...order.map(([i, v]) => h('li', {}, h('b', {}, s.words[i]), ' ' + Math.round(v * 100) + '%')));
    roleEl.textContent = on.size ? 'Showing the average of: ' + [...on].sort().map((i) => s.heads[i].name).join(' + ') + '.' : 'Turn on at least one head to see attention.';
    live.textContent = on.size ? `“${s.words[q]}” pays most attention to ${order.slice(0, 3).map(([i, v]) => `“${s.words[i]}” (${Math.round(v * 100)} percent)`).join(', ')}.` : 'No heads are switched on.';
  }

  el.append(h('section', { class: 'wa w-attention' },
    h('header', { class: 'wa-head' }, h('h3', {}, 'Attention: who looks at whom'), h('p', {}, 'When a model reads a word, it decides how much to “look at” every other word. Taller, darker bars mean stronger attention.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'choose “it” (or “bank”) and switch heads on and off. Which head works out what “it” means?'),
    tabs,
    h('p', { class: 'wa-legend' }, 'Selected word (outlined): '), wordsEl,
    h('h4', { class: 'wa-h4' }, 'Strongest links from the selected word'), rank, roleEl,
    h('h4', { class: 'wa-h4' }, 'Heads (each looks for a different pattern)'), heads, live,
    h('p', { class: 'wa-note' }, 'Toy model: these weights are hand-written to illustrate the idea. Real models learn dozens of heads per layer across many layers, and what each head does is rarely this tidy.')));
  build();
}
