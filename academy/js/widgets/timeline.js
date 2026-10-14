// timeline: keyboard-navigable timeline with kind filter chips.
export const meta = { name: 'timeline', title: 'Timeline', blurb: 'A scrollable, filterable timeline for AI history or how a request flows over time.', level: 0, skills: [] };

function h(tag, a = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [n, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (n === 'class') e.className = v; else if (n === 'style') e.style.cssText = v; else if (n === 'text') e.textContent = v;
    else if (n.startsWith('on')) e.addEventListener(n.slice(2), v); else e.setAttribute(n, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

const DEFAULT = [
  { year: '1950', title: 'The imitation game', text: 'Alan Turing publishes "Computing Machinery and Intelligence" and proposes judging a machine by whether it can hold a convincing conversation.', kind: 'idea' },
  { year: '1956', title: 'AI gets its name', text: 'A summer workshop at Dartmouth College coins the term "artificial intelligence" and sets an ambitious research agenda.', kind: 'milestone' },
  { year: '1966', title: 'ELIZA', text: 'A simple pattern-matching program imitates a therapist. People confide in it even though it understands nothing.', kind: 'milestone' },
  { year: '1974', title: 'First AI winter', text: 'Promises outrun results, and funding for AI research shrinks sharply for several years.', kind: 'setback' },
  { year: '1986', title: 'Backpropagation spreads', text: 'A paper by Rumelhart, Hinton and Williams popularises backpropagation, the method that trains multi-layer neural networks.', kind: 'idea' },
  { year: '1997', title: 'Deep Blue beats Kasparov', text: 'IBM\'s chess computer defeats the world champion using massive search rather than learning.', kind: 'milestone' },
  { year: '2012', title: 'AlexNet', text: 'A deep neural network wins an image-recognition contest by a wide margin, trained on GPUs. Deep learning takes off.', kind: 'model' },
  { year: '2017', title: 'The Transformer', text: '"Attention Is All You Need" introduces the Transformer architecture, the basis of today\'s large language models.', kind: 'idea' },
  { year: '2022', title: 'Chatbots go mainstream', text: 'Chat-style assistants built on large language models reach millions of everyday users within weeks.', kind: 'model' },
];
const KIND_ICON = { idea: '\u{1F4A1}', milestone: '★', setback: '▼', model: '⚙' };
const icon = (k) => KIND_ICON[k] || '●';

export function mount(el, props = {}, ctx = {}) {
  const events = (props.events && props.events.length ? props.events : DEFAULT).map((e, i) => ({ kind: 'event', ...e, i }));
  const kinds = [...new Set(events.map((e) => e.kind))];
  const active = new Set(kinds);
  let sel = Math.min(events.length - 1, Math.max(0, events.findIndex((e) => /transformer/i.test(e.title)))); if (props.events) sel = 0;
  const root = h('div', { class: 'w-b-card w-tl' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const chips = h('div', { class: 'w-b-row', role: 'group', 'aria-label': 'Filter by kind' });
  const track = h('ol', { class: 'w-tl-track' });
  const scroller = h('div', { class: 'w-tl-scroll' }, track);
  const detail = h('div', { class: 'w-tl-detail' });
  kinds.forEach((k) => chips.append(h('button', { type: 'button', class: 'w-b-btn w-tl-chip', 'aria-pressed': 'true', 'data-k': k, onclick: (e) => {
    if (active.has(k)) { if (active.size === 1) return; active.delete(k); } else active.add(k);
    e.currentTarget.setAttribute('aria-pressed', active.has(k) ? 'true' : 'false'); if (!active.has(events[sel].kind)) sel = events.findIndex((x) => active.has(x.kind)); render(); announce(); } }, h('span', { 'aria-hidden': 'true', text: icon(k) + ' ' }), k)));
  root.append(
    h('h3', { class: 'w-b-title', text: props.title || 'A short history of AI' }),
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), 'tap a card to read its story, use the arrow keys to move along the timeline, and filter by kind to see only one thread.'),
    ...(kinds.length > 1 ? [chips] : []), scroller, detail, live);
  el.append(root);

  function visible() { return events.filter((e) => active.has(e.kind)); }
  function announce() { const e = events[sel]; const m = `${e.year}: ${e.title}. ${e.text}`; live.textContent = m; if (ctx.announce) ctx.announce(m); }
  function render(focus) {
    track.textContent = '';
    visible().forEach((e) => {
      const li = h('li', { class: 'w-tl-item' }, h('button', { type: 'button', class: 'w-tl-card k-' + e.kind + (e.i === sel ? ' is-sel' : ''), 'data-i': e.i, 'aria-pressed': e.i === sel ? 'true' : 'false', tabindex: e.i === sel ? 0 : -1,
        onclick: () => { sel = e.i; render(true); announce(); }, onkeydown: (ev) => key(ev) },
        h('span', { class: 'w-tl-dot', 'aria-hidden': 'true', text: icon(e.kind) }), h('span', { class: 'w-tl-year', text: String(e.year) }), h('span', { class: 'w-tl-title', text: e.title }), h('span', { class: 'w-tl-kind', text: e.kind })));
      track.append(li);
    });
    const e = events[sel];
    detail.textContent = '';
    detail.append(h('div', { class: 'w-tl-dh' }, h('b', { class: 'w-tl-dy', text: String(e.year) }), h('b', { text: e.title }), h('span', { class: 'w-b-pill', text: icon(e.kind) + ' ' + e.kind })), h('p', { text: e.text }));
    const b = track.querySelector('.is-sel'); if (b) { if (focus) b.focus(); const L = b.parentElement.offsetLeft - scroller.clientWidth / 2 + b.offsetWidth / 2; if (scroller.scrollWidth > scroller.clientWidth + 4 && getComputedStyle(track).flexDirection === 'row') scroller.scrollTo({ left: Math.max(0, L), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  }
  function key(ev) {
    const list = visible(), pos = list.findIndex((x) => x.i === sel); let n = pos;
    if (['ArrowRight', 'ArrowDown'].includes(ev.key)) n = Math.min(list.length - 1, pos + 1);
    else if (['ArrowLeft', 'ArrowUp'].includes(ev.key)) n = Math.max(0, pos - 1);
    else if (ev.key === 'Home') n = 0; else if (ev.key === 'End') n = list.length - 1; else return;
    ev.preventDefault(); sel = list[n].i; render(true); announce();
  }
  render(); requestAnimationFrame(() => render());
  return () => {};
}
