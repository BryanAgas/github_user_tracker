// Chat UI for Mrs Anne: a slide-over drawer available everywhere, plus the full-page view.
import { h, mdBlock, clear, icon } from './util.js';
import { shared } from './tutor.js';
import { state } from './store.js';

let ctx = {};
export const setTutorContext = (c) => { ctx = c || {}; refreshHeader?.(); };
const refreshers = new Set();
let refreshHeader = () => refreshers.forEach((f) => f());
let drawer, drawerPanel;

export function chatPanel(compact = false) {
  const log = h('div', { class: 'chat-log', role: 'log', 'aria-live': 'off', 'aria-label': 'Conversation with Mrs Anne', tabindex: '0' });
  const live = h('div', { class: 'sr-only', 'aria-live': 'polite' });
  const chips = h('div', { class: 'chips' });
  const input = h('textarea', { class: 'chat-in', rows: 1, 'aria-label': 'Message Mrs Anne', placeholder: 'Ask anything about the lesson…' });
  const send = h('button', { class: 'btn primary', type: 'submit' }, icon('send'), h('span', { class: 'sr-only' }, 'Send'));
  const status = h('div', { class: 'chat-status small muted' });
  const form = h('form', { class: 'chat-form' }, input, send);
  const root = h('div', { class: `chat ${compact ? 'compact' : ''}` }, status, log, live, chips, form);

  const refresh = () => {
    status.textContent = (shared.modelReady ? 'Connected to a model for open questions. ' : 'Offline tutor: explains, quizzes, hints and searches the course. Connect a model in Settings for open questions. ') + (ctx.lessonId ? 'I can see which lesson you’re on.' : '');
    if (!busy) setChips(ctx.lessonId ? ['I’m confused', 'Give me an example', 'Quiz me', 'Go deeper', 'Give me a hint'] : ['What should I do next?', 'How am I doing?', 'Quiz me', 'Explain tokens']);
  };
  refreshers.add(refresh);
  let busy = false;
  const setChips = (list) => { clear(chips); list.forEach((c) => chips.append(h('button', { type: 'button', class: 'chip btn-chip', onclick: () => say(c) }, c))); };
  const add = (who, content) => { const m = h('div', { class: `msg ${who}` }, h('div', { class: 'msg-who' }, who === 'me' ? (state.profile.name || 'You') : 'Mrs Anne'), h('div', { class: 'msg-body' }, mdBlock(content))); log.append(m); log.scrollTop = log.scrollHeight; return m; };
  const say = async (text) => {
    if (!text.trim() || busy) return;
    busy = true;
    add('me', text); input.value = ''; autosize();
    const m = add('anne', '…'); const bodyEl = m.querySelector('.msg-body');
    send.disabled = true;
    try {
      const r = await shared.respond(text, ctx, (partial) => { bodyEl.replaceChildren(mdBlock(partial)); log.scrollTop = log.scrollHeight; });
      bodyEl.replaceChildren(mdBlock(r.md)); live.textContent = r.md.slice(0, 400); // announce the finished reply once, not every streamed delta
      if (r.code) bodyEl.append(h('pre', { class: 'codeblock' }, h('code', {}, r.code)));
      if (r.actions?.length) bodyEl.append(h('div', { class: 'row' }, r.actions.map((a) => h('a', { class: 'btn small', href: a.href, onclick: () => closeTutor() }, a.label))));
      if (r.chips) setChips(r.chips);
      if (r.source === 'model') bodyEl.append(h('p', { class: 'small muted' }, 'Answered by the connected model — check anything important.'));
    } finally { busy = false; send.disabled = false; log.scrollTop = log.scrollHeight; input.focus(); }
  };
  const autosize = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 140) + 'px'; };
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener('submit', (e) => { e.preventDefault(); say(input.value); });
  if (!shared.history.length) add('anne', `Hello${state.profile.name ? ' ' + state.profile.name : ''}. I’m Mrs Anne. I won’t just hand you answers — I’ll explain things another way when you’re stuck, give hints before solutions, and quiz you when you’re ready. What are you working on?`);
  else shared.history.forEach((m) => add(m.role === 'user' ? 'me' : 'anne', m.content));
  refresh();
  root.say = say; root.focusInput = () => input.focus();
  return root;
}

const backdrop = () => [document.getElementById('shell'), document.getElementById('skip')?.parentElement === document.body ? null : null].filter(Boolean);
export function mountDrawer(host) {
  drawerPanel = chatPanel(true);
  drawer = h('aside', { class: 'drawer', id: 'tutor-drawer', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Mrs Anne, your tutor' },
    h('div', { class: 'drawer-h' }, h('strong', {}, 'Mrs Anne'), h('button', { class: 'btn icon', type: 'button', 'aria-label': 'Close tutor', onclick: closeTutor }, icon('close'))), drawerPanel);
  host.append(drawer);
  addEventListener('keydown', (e) => {
    if (drawer.hidden) return;
    if (e.key === 'Escape') return closeTutor();
    if (e.key !== 'Tab') return; // focus trap
    const f = [...drawer.querySelectorAll('button:not([disabled]),a[href],textarea,input,select,[tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!drawer.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  });
}
let opener = null;
export function openTutor(prefill) {
  if (location.hash.startsWith('#/tutor')) { document.querySelector('.chat-in')?.focus(); return; }
  opener = document.activeElement;
  drawer.hidden = false; document.body.classList.add('drawer-open');
  backdrop().forEach((x) => x.setAttribute('inert', ''));
  if (prefill) drawerPanel.say(prefill); else drawerPanel.focusInput();
}
export function closeTutor() { if (!drawer || drawer.hidden) return; drawer.hidden = true; document.body.classList.remove('drawer-open'); backdrop().forEach((x) => x.removeAttribute('inert')); opener?.focus?.(); }
