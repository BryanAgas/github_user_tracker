// Context window: a fixed token budget; oldest turns fall out of view.
export const meta = { name: 'contextwindow', title: 'The context window', blurb: 'A chat fills a fixed token budget, and the oldest turns fall out.', level: 0, skills: ['l0.context'] };

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
const tokensOf = (s) => Math.max(1, Math.round(s.split(/\s+/).filter(Boolean).length * 1.35 + (s.match(/[.,!?]/g) || []).length * 0.5));

const BASE = [
  ['user', 'Hi! I am planning a birthday party. My dog is called Biscuit and he is coming too.', true],
  ['ai', 'Lovely! A party with a dog guest sounds fun. What date are you thinking of?'],
  ['user', 'Probably the second Saturday of next month, in the afternoon.'],
  ['ai', 'Afternoon works well. Do you want help with food, games or invitations first?'],
  ['user', 'Games please. Something that is fun for kids and adults.'],
  ['ai', 'Try a treasure hunt in the garden, charades, and a relay with balloons.'],
];
const MORE = [
  ['user', 'Ooh, treasure hunt. What clues could I use for the garden?'],
  ['ai', 'Hide clues near the shed, the bird bath, the big tree and the back gate, each rhyming.'],
  ['user', 'And what snacks are easy to make for lots of people?'],
  ['ai', 'Mini sandwiches, fruit skewers, popcorn and a big tray of flapjacks are all simple.'],
  ['user', 'Great. How early should I start preparing everything?'],
  ['ai', 'Invitations two weeks ahead, shopping two days before, baking the day before.'],
];
const QUESTION = ['user', 'Quick check: what is my dog called?'];

export function mount(el, props = {}, ctx = {}) {
  const max = 260, min = 30;
  let size = Math.min(max, Math.max(min, props.size || 200));
  let extra = 2;

  const log = h('ol', { class: 'w-contextwindow-log' });
  const bar = h('div', { class: 'w-contextwindow-bar', role: 'img' });
  const slider = h('input', { type: 'range', min: String(min), max: String(max), step: '5', value: String(size) });
  const out = h('output', {}, String(size));
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const more = h('button', { type: 'button', class: 'wa-btn', onclick: () => { if (extra < MORE.length) { extra += 2; draw(); } } }, 'Keep chatting (add 2 turns)');
  const less = h('button', { type: 'button', class: 'wa-btn', onclick: () => { size = props.size || 200; extra = 2; slider.value = String(size); draw(); } }, 'Reset');

  function draw() {
    out.textContent = size + ' tokens';
    slider.setAttribute('aria-valuetext', size + ' tokens');
    const msgs = [...BASE, ...MORE.slice(0, extra), QUESTION].map(([who, text], i) => ({ who, text, n: tokensOf(text), fact: i === 0 }));
    let used = 0;
    for (let i = msgs.length - 1; i >= 0; i--) { if (used + msgs[i].n <= size) { msgs[i].in = true; used += msgs[i].n; } else break; }
    const total = msgs.reduce((s, m) => s + m.n, 0);
    const factIn = msgs[0].in;
    const dropped = msgs.filter((m) => !m.in).length;
    log.replaceChildren();
    msgs.forEach((m) => log.append(h('li', { class: 'w-contextwindow-msg ' + m.who + (m.in ? ' is-in' : ' is-out') },
      h('span', { class: 'w-contextwindow-meta' }, (m.who === 'user' ? 'You' : 'AI') + ' · ' + m.n + ' tokens · ', h('b', {}, m.in ? 'in the window' : 'forgotten')),
      h('span', { class: 'w-contextwindow-txt' }, m.text))));
    const reply = factIn ? 'Your dog is called Biscuit!' : 'Sorry, I am not sure. I can’t see you mentioning a dog’s name. Could you remind me?';
    log.append(h('li', { class: 'w-contextwindow-msg ai is-in reply ' + (factIn ? 'ok' : 'fail') },
      h('span', { class: 'w-contextwindow-meta' }, 'AI (simulated reply) · ', h('b', {}, factIn ? 'can see the fact' : 'cannot see the fact')), h('span', { class: 'w-contextwindow-txt' }, reply)));
    bar.replaceChildren();
    msgs.forEach((m) => bar.append(h('span', { class: 'w-contextwindow-seg ' + (m.in ? 'is-in' : 'is-out') + (m.fact ? ' is-fact' : ''), style: `flex:${m.n}` })));
    bar.setAttribute('aria-label', `${msgs.length} messages, ${total} tokens in the whole chat; the window holds ${used} of ${size} tokens.`);
    more.disabled = extra >= MORE.length;
    live.textContent = `Window ${size} tokens. The model can see ${msgs.length - dropped} of ${msgs.length} messages (${used} tokens). ` + (factIn ? 'The early message about the dog is still visible, so the answer is correct.' : 'The early message about the dog has fallen out, so the model cannot answer.');
  }
  slider.addEventListener('input', () => { size = +slider.value; draw(); });

  el.append(h('section', { class: 'wa w-contextwindow' },
    h('header', { class: 'wa-head' }, h('h3', {}, 'The context window'), h('p', {}, 'A model only “sees” the most recent tokens that fit in its window. Everything older is simply gone.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'shrink the window until the dog’s name falls out, then watch the answer change. Or keep chatting to push it out.'),
    h('div', { class: 'wa-controls' }, h('label', { class: 'wa-field' }, h('span', {}, 'Window size ', out), slider), h('div', { class: 'wa-row' }, more, less)),
    h('p', { class: 'wa-legend' }, 'Strip below: one block per message, width = tokens. Solid = visible to the model, hatched = forgotten. The outlined block is the early dog message.'),
    bar, log, live,
    h('p', { class: 'wa-note' }, 'Toy model: token counts are estimated from word counts, the window is tiny on purpose (real ones hold thousands to millions of tokens), and the reply is a scripted illustration, not a real model.')));
  draw();
}
