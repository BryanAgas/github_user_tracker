// Renders lesson blocks (see docs/CONTENT_SPEC.md). No innerHTML; widgets are lazy-mounted when scrolled into view.
import { h, inline, mdBlock, announce, daysBetween, today } from './util.js';
import { current } from './content.js';
import { mountWidget } from './widgets/index.js';
import { addEvidence } from './mastery.js';
import { state, save } from './store.js';
import { renderQuestion } from './assess.js';

export function renderBlocks(lesson, blocks, env) {
  const root = h('div', { class: 'lesson-body' });
  blocks.forEach((b, i) => { const el = renderBlock(lesson, b, i, env); if (el) root.append(el); });
  return root;
}

function renderBlock(lesson, b, i, env) {
  switch (b.t) {
    case 'p': return h('p', {}, inline(b.md));
    case 'h': return h('h3', { class: 'lh' }, b.text);
    case 'list': return h(b.ordered ? 'ol' : 'ul', { class: 'lesson-list' }, b.items.map((x) => h('li', {}, inline(x))));
    case 'steps': return h('ol', { class: 'steps' }, b.items.map((s) => h('li', {}, h('strong', {}, s.title), h('div', {}, inline(s.md)))));
    case 'callout': return callout(b);
    case 'code': return codeBlock(b);
    case 'compare': return compare(b);
    case 'reveal': return reveal(b);
    case 'predict': return predict(lesson, b, i);
    case 'try': return tryIt(lesson, b, i);
    case 'current': return currentBox(b.key);
    case 'widget': return widget(lesson, b, i, env);
    default: return null;
  }
}

const KIND = { tip: ['Tip', '💡'], warn: ['Careful', '⚠️'], why: ['Why it matters', '🔎'], analogy: ['Think of it like this', '🪄'], misconception: ['Common misconception', '🚫'] };
function callout(b) {
  const [label, glyph] = KIND[b.kind] || ['Note', 'ℹ️'];
  return h('aside', { class: `callout k-${b.kind}` }, h('div', { class: 'callout-h' }, h('span', { 'aria-hidden': 'true' }, glyph + ' '), b.title || label), h('div', {}, inline(b.md)));
}
function codeBlock(b) {
  const pre = h('pre', { class: 'codeblock', tabindex: '0', 'aria-label': `${b.lang} code` }, h('code', {}, b.src));
  const copy = h('button', { type: 'button', class: 'btn small', onclick: async () => { try { await navigator.clipboard.writeText(b.src); copy.textContent = 'Copied'; setTimeout(() => (copy.textContent = 'Copy'), 1500); } catch { copy.textContent = 'Select & copy'; } } }, 'Copy');
  return h('figure', { class: 'code-fig' }, h('div', { class: 'code-bar' }, h('span', {}, b.lang), copy), pre, b.caption ? h('figcaption', {}, inline(b.caption)) : null);
}
function compare(b) {
  return h('div', { class: 'table-wrap', role: 'region', tabindex: '0', 'aria-label': b.title || 'Comparison table' }, h('table', {}, b.title ? h('caption', {}, b.title) : null,
    h('thead', {}, h('tr', {}, b.cols.map((c) => h('th', { scope: 'col' }, inline(c))))),
    h('tbody', {}, b.rows.map((r) => h('tr', {}, r.map((c, j) => h(j === 0 ? 'th' : 'td', j === 0 ? { scope: 'row' } : {}, inline(c))))))));
}
function reveal(b) {
  const d = h('details', { class: 'reveal' }, h('summary', {}, b.label), h('div', {}, inline(b.md)));
  return d;
}
function predict(lesson, b, i) {
  const name = `${lesson.id}-pr${i}`;
  const box = h('div', { class: 'predict' });
  const fb = h('div', { 'aria-live': 'polite' });
  const lock = h('button', { type: 'button', class: 'btn primary' }, 'Lock in my guess');
  const opts = h('div', { class: 'opts', role: 'radiogroup', 'aria-label': 'Your prediction' }, b.options.map((o, k) => h('label', { class: 'opt' }, h('input', { type: 'radio', name, value: k }), h('span', {}, inline(o)))));
  lock.addEventListener('click', () => {
    const c = opts.querySelector('input:checked'); if (!c) { fb.replaceChildren(h('p', { class: 'muted' }, 'Pick one — a guess is the point.')); return; }
    const ok = +c.value === b.answer;
    opts.querySelectorAll('input').forEach((x) => { x.disabled = true; if (+x.value === b.answer) x.parentElement.classList.add('right'); });
    lock.hidden = true;
    fb.replaceChildren(h('div', { class: `callout ${ok ? 'good' : 'info'}` }, h('strong', {}, ok ? 'Good instinct. ' : 'Interesting — that’s the usual guess. '), inline(b.explain)));
    if (b.skill) addEvidence(b.skill, ok ? 1 : 0, 0.5, `predict:${name}`);
    announce(ok ? 'Correct prediction' : 'Not what happens');
  });
  box.append(h('div', { class: 'predict-h' }, '🎯 Predict first'), h('p', { class: 'qtext' }, inline(b.q)), opts, lock, fb);
  return box;
}
function tryIt(lesson, b, i) {
  const key = `${lesson.id}:try${i}`;
  const ta = h('textarea', { rows: 4, class: 'short', 'aria-label': 'Your attempt', placeholder: 'Have a go — a rough answer is fine…' });
  ta.value = state.notes[key] || '';
  ta.addEventListener('input', () => { state.notes[key] = ta.value; save(); });
  const sample = h('div', { class: 'sample', hidden: true }, h('strong', {}, 'A model answer: '), inline(b.sample));
  const btn = h('button', { type: 'button', class: 'btn', onclick: () => {
    if (ta.value.trim().length < 12) { msg.textContent = 'Write a little first — comparing your thinking with the model answer is where the learning happens.'; return; }
    msg.textContent = ''; sample.hidden = false; btn.hidden = true; announce('Model answer shown');
  } }, 'Show a model answer');
  const msg = h('p', { class: 'muted small', 'aria-live': 'polite' });
  return h('div', { class: 'try' }, h('div', { class: 'predict-h' }, '✍️ Your turn'), h('p', { class: 'qtext' }, inline(b.prompt)), ta, btn, msg, sample);
}
export function currentBox(key) {
  const c = current[key];
  if (!c) return h('aside', { class: 'callout warn' }, `Missing current-practice entry “${key}”.`);
  const age = (() => { const [y, m] = c.asOf.split('-').map(Number); return (new Date().getFullYear() - y) * 12 + (new Date().getMonth() + 1 - m); })();
  return h('aside', { class: 'current', 'aria-label': `Current practice: ${c.title}` },
    h('div', { class: 'current-h' }, h('span', { class: 'badge live' }, 'Current practice'), h('strong', {}, c.title), h('span', { class: 'muted small' }, `as of ${c.asOf}`), age >= 6 ? h('span', { class: 'badge stale' }, 'may be out of date') : null),
    mdBlock(c.md),
    c.sources?.length ? h('p', { class: 'small sources' }, 'Sources: ', c.sources.map((s, i) => [i ? ' · ' : '', h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.label)])) : null,
    h('p', { class: 'small muted' }, 'This box covers fast-moving material. The ideas around it are lasting; this part gets refreshed.'));
}
function widget(lesson, b, i, env) {
  if (b.w === 'quizcard') {
    const q = (lesson.quiz || []).find((x) => x.id === b.props?.questionId);
    return q ? renderQuestion(q, { src: 'inline', onResolved: () => {} }) : null;
  }
  const host = h('div', { class: 'widget-host', dataset: { widget: b.w } });
  const fig = h('figure', { class: 'widget' }, h('div', { class: 'widget-tag' }, h('span', { 'aria-hidden': 'true' }, '🧪 '), 'Experiment'), host, b.caption ? h('figcaption', {}, inline(b.caption)) : null);
  const ctx = {
    evidence: (skill, score, w = 1) => addEvidence(skill || b.skill, score, w, `widget:${lesson.id}:${b.w}`),
    announce,
  };
  const go = () => { host.replaceChildren(); return mountWidget(host, b.w, { ...(b.props || {}), skill: b.skill || b.props?.skill }, ctx).then((c) => { if (c) env.cleanups.push(c); }); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => { if (en.some((e) => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '300px' });
    host.append(h('p', { class: 'muted' }, 'Loading experiment…'));
    queueMicrotask(() => { io.observe(host); });
    env.cleanups.push(() => io.disconnect());
  } else go();
  return fig;
}
