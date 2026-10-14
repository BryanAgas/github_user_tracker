// Sorter: click/tap (or drag) items into buckets, then check with per-item feedback.
export const meta = { name: 'sorter', title: 'Sort it out', blurb: 'Sort items into the right buckets and get feedback on each one.', level: 0, skills: [] };

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

const DEMO = {
  title: 'Could AI fabricate this?',
  buckets: ['Safe to rely on', 'Needs a human check'],
  items: [
    { text: 'Spell-checking a short email', bucket: 'Safe to rely on', why: 'Errors are easy to spot and low-stakes: you read the result anyway.' },
    { text: 'Quoting a court case with its citation number', bucket: 'Needs a human check', why: 'Models can invent plausible-looking cases and citations. Always verify in the source.' },
    { text: 'Rewording your own paragraph more politely', bucket: 'Safe to rely on', why: 'You supplied the facts, so there is little room to invent new ones.' },
    { text: 'Stating the dose of a medicine', bucket: 'Needs a human check', why: 'A confident wrong number can cause harm. Check with a pharmacist or the label.' },
    { text: 'Brainstorming ten party game ideas', bucket: 'Safe to rely on', why: 'Nothing here has to be true; you just pick the ideas you like.' },
    { text: 'Summarising a legal contract you will sign', bucket: 'Needs a human check', why: 'Summaries can drop or distort clauses. Read the key terms yourself.' },
  ],
};

export function mount(el, props = {}, ctx = {}) {
  const cfg = props.items && props.buckets ? props : DEMO;
  const r = mulberry32(5);
  const items = cfg.items.map((it, i) => ({ ...it, id: i, at: null })).sort(() => r() - 0.5);
  let sel = null, checked = false, reported = false, dragId = null;
  const poolEl = h('ul', { class: 'w-sorter-list w-sorter-pool', 'aria-label': 'Items still to sort' });
  const poolBox = h('div', { class: 'w-sorter-box w-sorter-poolbox', 'data-b': '' }, h('h4', {}, 'To sort'), poolEl);
  const boxes = cfg.buckets.map((b) => ({ name: b, ul: h('ul', { class: 'w-sorter-list', 'aria-label': b + ' items' }) }));
  const status = h('p', { class: 'w-sorter-status' });
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const check = h('button', { type: 'button', class: 'wa-btn wa-btn-primary', onclick: doCheck }, 'Check my answers');
  const area = h('div', { class: 'w-sorter-area' });
  const hint = h('p', { class: 'wa-muted' });

  function place(id, bucket) { const it = items[items.findIndex((x) => x.id === id)]; it.at = bucket; sel = null; checked = false; render(); }
  function dropTarget(box, bucket) {
    box.addEventListener('dragover', (e) => { e.preventDefault(); box.classList.add('is-over'); });
    box.addEventListener('dragleave', () => box.classList.remove('is-over'));
    box.addEventListener('drop', (e) => { e.preventDefault(); box.classList.remove('is-over'); if (dragId != null) place(dragId, bucket); dragId = null; });
  }
  function itemEl(it) {
    const fb = checked && it.at != null;
    const ok = it.at === it.bucket;
    return h('li', { class: 'w-sorter-li' },
      h('button', { type: 'button', class: 'w-sorter-item' + (sel === it.id ? ' is-sel' : '') + (fb ? (ok ? ' is-ok' : ' is-bad') : ''), 'aria-pressed': String(sel === it.id), draggable: 'true',
        ondragstart: (e) => { dragId = it.id; e.dataTransfer.setData('text/plain', String(it.id)); e.dataTransfer.effectAllowed = 'move'; },
        onclick: () => { sel = sel === it.id ? null : it.id; render(); } },
        fb ? h('span', { class: 'w-sorter-mark' }, ok ? '✓ Correct' : '✗ Not quite') : null, h('span', {}, it.text)),
      sel === it.id ? h('div', { class: 'w-sorter-quick', role: 'group', 'aria-label': 'Move \u201c' + it.text + '\u201d to' },
        cfg.buckets.filter((b) => b !== it.at).map((b) => h('button', { type: 'button', class: 'wa-btn wa-btn-small', onclick: () => place(it.id, b) }, 'Put in: ' + b)),
        it.at != null ? h('button', { type: 'button', class: 'wa-btn wa-btn-small', onclick: () => place(it.id, null) }, 'Back to pile') : null) : null,
      fb ? h('p', { class: 'w-sorter-why' }, (ok ? '' : `Belongs in “${it.bucket}”. `) + (it.why || '')) : null);
  }
  function render() {
    poolEl.replaceChildren(...items.filter((i) => i.at == null).map(itemEl));
    boxes.forEach((b) => { b.ul.replaceChildren(...items.filter((i) => i.at === b.name).map(itemEl)); b.ul.parentNode.classList.toggle('is-empty', !b.ul.children.length); });
    const left = items.filter((i) => i.at == null).length;
    poolBox.classList.toggle('is-empty', left === 0);
    poolBox.hidden = left === 0 && !checked && false;
    check.disabled = left > 0;
    const s = sel != null ? items.find((i) => i.id === sel) : null;
    hint.textContent = s ? `Selected: “${s.text}”. Now press a bucket button to place it.` : left ? 'Select an item (or drag it), then choose where it goes.' : 'All sorted. Press Check, or select an item to move it.';
    if (!checked) status.textContent = '';
    live.textContent = s ? `Selected ${s.text}.` : `${items.length - left} of ${items.length} sorted.`;
  }
  function doCheck() {
    checked = true; sel = null;
    const good = items.filter((i) => i.at === i.bucket).length, frac = good / items.length;
    status.textContent = `${good} of ${items.length} correct` + (good === items.length ? ' – perfect!' : '. Read the notes, then move any wrong ones and check again.');
    status.className = 'w-sorter-status ' + (good === items.length ? 'good' : 'warn');
    if (!reported && props.skill && ctx.evidence) { ctx.evidence(props.skill, frac); }
    reported = true; render();
    live.textContent = status.textContent;
    if (ctx.announce) ctx.announce(status.textContent);
  }
  dropTarget(poolBox, null);
  boxes.forEach((b) => {
    const box = h('div', { class: 'w-sorter-box' }, h('h4', {}, b.name), b.ul);
    dropTarget(box, b.name); area.append(box);
  });
  const reset = () => { items.forEach((i) => { i.at = null; }); sel = null; checked = false; status.textContent = ''; render(); };

  el.append(h('section', { class: 'wa w-sorter' },
    h('header', { class: 'wa-head' }, h('h3', {}, cfg.title || 'Sort it out'), h('p', {}, 'Tap an item to select it, then tap a bucket. On a computer you can also drag.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'sort everything first, then press Check and read why each answer is right.'),
    poolBox, area, hint,
    h('div', { class: 'wa-row' }, check, h('button', { type: 'button', class: 'wa-btn', onclick: reset }, 'Reset')),
    status, live));
  render();
}
