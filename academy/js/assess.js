// Question engine. One component per question type, all sharing: hint ladder → explanation → (code) solution,
// and honest evidence: full marks only for unaided first-try success.
import { h, shuffle, inline, announce, clear } from './util.js';
import { addEvidence } from './mastery.js';
import { state, save } from './store.js';
import { runCode } from './runner.js';
import { renderResult } from './widgets/codeplay.js';

export const evidenceFor = ({ correct, partial = 0, hints = 0, revealed = false, attempts = 1 }) => {
  if (revealed && !correct) return 0;
  // Full marks only for unaided first-try success; each hint and each earlier miss costs credit.
  if (correct) return Math.max(0.3, 1 - 0.25 * hints - 0.2 * Math.max(0, attempts - 1));
  return Math.min(0.5, partial) * 0.6; // partial credit is deliberately modest
};

/** Renders a question. opts: { onResolved(result), src, quiet, number } — result: { qid, skill, score, correct, hints, revealed, attempts } */
export function renderQuestion(q, opts = {}) {
  const root = h('section', { class: 'qcard', 'aria-labelledby': `${q.id}-t`, dataset: { qid: q.id, type: q.type } });
  const state_ = { hints: 0, attempts: 0, resolved: false, revealed: false, lastCorrect: false };
  const feedback = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const hintBox = h('div', { class: 'hint-box' });
  const actions = h('div', { class: 'row qactions' });
  const body = h('div', { class: 'qbody' });
  const checkBtn = h('button', { class: 'btn primary', type: 'button' }, 'Check');
  const hintBtn = h('button', { class: 'btn', type: 'button' }, 'Give me a hint');
  const explainBtn = h('button', { class: 'btn', type: 'button' }, 'Explain it to me');
  explainBtn.hidden = true;
  let getAnswer, grade, lockInputs = () => {}, revealSolution = null;

  root.append(
    h('div', { class: 'qhead' }, opts.number ? h('span', { class: 'qnum' }, opts.number) : null, h('span', { class: 'qtype' }, labelFor(q.type)), h('span', { class: 'qdiff', title: 'Difficulty' }, '◆'.repeat(q.difficulty) + '◇'.repeat(3 - q.difficulty))),
    h('p', { class: 'qtext', id: `${q.id}-t` }, inline(q.q)),
    q.code ? h('pre', { class: 'codeblock' }, h('code', {}, q.code)) : null,
    body, h('div', { class: 'row qactions' }, checkBtn, hintBtn, explainBtn), hintBox, feedback,
  );

  const T = { mcq: buildMcq, multi: buildMulti, order: buildOrder, short: buildShort, code: buildCode }[q.type];
  ({ getAnswer, grade, lockInputs, revealSolution } = T(q, body, checkBtn));

  const hints = q.hints || [];
  const updateHintBtn = () => {
    hintBtn.textContent = state_.hints < hints.length ? (state_.hints === 0 ? 'Give me a hint' : 'A stronger hint') : 'No more hints';
    hintBtn.disabled = state_.hints >= hints.length || state_.resolved;
    explainBtn.hidden = !(state_.attempts > 0 || state_.hints >= hints.length) || state_.resolved;
  };
  updateHintBtn();
  hintBtn.addEventListener('click', () => {
    if (state_.hints >= hints.length) return;
    hintBox.append(h('p', { class: 'hint' }, h('strong', {}, `Hint ${state_.hints + 1}${hints.length > 1 ? ` of ${hints.length}` : ''}: `), inline(hints[state_.hints])));
    state_.hints++; updateHintBtn(); announce('Hint shown');
  });

  const resolve = (correct, partial = 0, revealed = false) => {
    if (state_.resolved) return;
    state_.resolved = true;
    const score = evidenceFor({ correct, partial, hints: state_.hints, revealed, attempts: state_.attempts }) * (state_.selfMarked ? 0.75 : 1);
    const res = { qid: q.id, skill: q.skill, score, correct, hints: state_.hints, revealed, attempts: state_.attempts };
    state.seenQuestions[q.id] = (state.seenQuestions[q.id] || 0) + 1; save();
    addEvidence(q.skill, score, opts.weight ?? 1, `${opts.src || 'quiz'}:${q.id}`);
    lockInputs(); checkBtn.hidden = true; hintBtn.hidden = true; explainBtn.hidden = true;
    root.classList.add(correct ? 'is-correct' : 'is-missed');
    opts.onResolved?.(res);
  };

  const showExplain = (headline, kind) => {
    clear(feedback);
    feedback.append(h('div', { class: `callout ${kind}` }, h('strong', {}, headline + ' '), inline(q.explain)));
  };

  checkBtn.addEventListener('click', async () => {
    if (state_.resolved) return;
    const a = getAnswer();
    if (a == null) { clear(feedback); feedback.append(h('p', { class: 'muted' }, 'Choose or write an answer first.')); return; }
    state_.attempts++;
    const g = await grade(a, state_);
    if (g.pending) return;
    if (g.correct) { showExplain('Yes.', 'good'); announce('Correct'); resolve(true, 1); return; }
    // wrong
    clear(feedback);
    feedback.append(h('div', { class: 'callout warn' }, h('strong', {}, state_.attempts === 1 ? 'Not quite. ' : 'Still not there. '), g.note ? inline(g.note) : 'Have another think — a hint can help without giving it away.'));
    announce('Not quite');
    state_.partial = Math.max(state_.partial || 0, g.partial || 0);
    if (state_.attempts >= 3 || (state_.hints >= hints.length && state_.attempts >= 2)) giveUp();
    updateHintBtn();
  });
  const giveUp = () => {
    state_.revealed = true;
    revealSolution?.();
    showExplain(q.type === 'code' ? 'Here is a worked solution and why it works.' : 'Let’s unpack it.', 'info');
    resolve(false, state_.partial || 0, true);
  };
  explainBtn.addEventListener('click', giveUp);
  root._state = state_;
  return root;
}

const labelFor = (t) => ({ mcq: 'Choose one', multi: 'Choose all that apply', order: 'Put in order', short: 'In your own words', code: 'Write code' }[t]);

function buildMcq(q, body, checkBtn) {
  const name = q.id + '-opt';
  const idx = shuffle(q.options.map((_, i) => i));
  const group = h('div', { class: 'opts', role: 'radiogroup', 'aria-labelledby': `${q.id}-t` });
  idx.forEach((i, k) => group.append(h('label', { class: 'opt' }, h('input', { type: 'radio', name, value: i }), h('span', {}, inline(q.options[i])))));
  body.append(group);
  return {
    getAnswer: () => { const c = group.querySelector('input:checked'); return c ? +c.value : null; },
    grade: (a) => {
      if (a === q.answer) return { correct: true };
      group.querySelectorAll('input').forEach((i) => { if (+i.value === a) { i.disabled = true; i.parentElement.classList.add('struck'); } });
      return { correct: false, note: q.wrong?.[a] };
    },
    lockInputs: () => group.querySelectorAll('input').forEach((i) => { i.disabled = true; if (+i.value === q.answer) i.parentElement.classList.add('right'); }),
  };
}
function buildMulti(q, body) {
  const idx = shuffle(q.options.map((_, i) => i));
  const group = h('div', { class: 'opts', role: 'group', 'aria-labelledby': `${q.id}-t` });
  idx.forEach((i) => group.append(h('label', { class: 'opt' }, h('input', { type: 'checkbox', value: i }), h('span', {}, inline(q.options[i])))));
  body.append(group);
  const want = new Set(q.answer);
  return {
    getAnswer: () => { const c = [...group.querySelectorAll('input:checked')].map((i) => +i.value); return c.length ? c : null; },
    grade: (a) => {
      const got = new Set(a); const hit = a.filter((i) => want.has(i)).length; const wrong = a.filter((i) => !want.has(i)).length;
      const ok = got.size === want.size && wrong === 0;
      const missing = want.size - hit;
      return { correct: ok, partial: Math.max(0, (hit - wrong) / want.size), note: ok ? '' : `${hit} of your picks ${hit === 1 ? 'is' : 'are'} right${wrong ? `, ${wrong} ${wrong === 1 ? 'doesn’t belong' : 'don’t belong'}` : ''}${missing ? `, and ${missing} correct ${missing === 1 ? 'option is' : 'options are'} missing` : ''}.` };
    },
    lockInputs: () => group.querySelectorAll('input').forEach((i) => { i.disabled = true; if (want.has(+i.value)) i.parentElement.classList.add('right'); }),
  };
}
function buildOrder(q, body) {
  let order = shuffle(q.items.map((_, i) => i));
  if (order.every((v, i) => v === i)) order.reverse();
  const list = h('ol', { class: 'order', 'aria-labelledby': `${q.id}-t` });
  const render = (focusPos) => {
    clear(list);
    order.forEach((itemIdx, pos) => list.append(h('li', {},
      h('span', { class: 'order-text' }, inline(q.items[itemIdx])),
      h('span', { class: 'order-btns' },
        h('button', { type: 'button', class: 'btn icon', 'aria-label': `Move “${q.items[itemIdx].slice(0, 40)}” up`, disabled: pos === 0, dataset: { pos, dir: -1 }, onclick: () => move(pos, -1) }, '↑'),
        h('button', { type: 'button', class: 'btn icon', 'aria-label': `Move “${q.items[itemIdx].slice(0, 40)}” down`, disabled: pos === order.length - 1, dataset: { pos, dir: 1 }, onclick: () => move(pos, 1) }, '↓')))));
    if (focusPos != null) list.querySelector(`[data-pos="${focusPos}"][data-dir="${focusDir}"]`)?.focus();
  };
  let focusDir = 1;
  const move = (pos, d) => { const j = pos + d; [order[pos], order[j]] = [order[j], order[pos]]; focusDir = d; render(j); };
  render();
  body.append(h('p', { class: 'muted small' }, 'Use the arrow buttons to reorder, then check.'), list);
  return {
    getAnswer: () => order,
    grade: (a) => { const right = a.filter((v, i) => v === i).length; return { correct: right === a.length, partial: right / a.length, note: `${right} of ${a.length} are in the right place.` }; },
    lockInputs: () => { order = q.items.map((_, i) => i); render(); list.querySelectorAll('button').forEach((b) => (b.disabled = true)); },
  };
}
function buildShort(q, body, checkBtn) {
  const ta = h('textarea', { class: 'short', rows: 3, 'aria-labelledby': `${q.id}-t`, placeholder: 'Write your answer…' });
  const model = h('div', { class: 'model', hidden: true });
  body.append(ta, model);
  const res = [...q.accept].map((r) => new RegExp(r, 'i'));
  let selfCheck = null;
  return {
    getAnswer: () => (ta.value.trim().length >= 2 ? ta.value.trim() : null),
    grade: (a, st) => {
      if (st.selfMarked) return { correct: true };
      if (res.some((r) => r.test(a))) return { correct: true };
      // We are a pattern-matcher, not a mind-reader: let the student compare against the model answer honestly.
      if (!selfCheck) {
        model.hidden = false;
        selfCheck = h('div', { class: 'selfcheck' }, h('p', {}, h('strong', {}, 'I couldn’t match that automatically. '), 'Here is a model answer. Does yours say the same thing?'), h('blockquote', {}, inline(q.model)),
          h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn primary', onclick: () => { st.resolveSelf?.(true); } }, 'Yes, mine says that'),
            h('button', { type: 'button', class: 'btn', onclick: () => { st.resolveSelf?.(false); } }, 'Not quite — let me try again')));
        model.append(selfCheck);
        st.resolveSelf = (yes) => { if (yes) { model.hidden = true; const btn = body.closest('.qcard').querySelector('.qactions .primary'); st.selfMarked = true; btn.click(); } else { model.hidden = true; selfCheck = null; clear(model); ta.focus(); } };
      }
      return { pending: true };
    },
    lockInputs: () => { ta.disabled = true; model.hidden = false; clear(model); model.append(h('p', {}, h('strong', {}, 'Model answer: '), inline(q.model))); },
  };
}
function buildCode(q, body) {
  const ta = h('textarea', { class: 'code-ed', spellcheck: 'false', rows: Math.min(16, q.starter.split('\n').length + 2), 'aria-labelledby': `${q.id}-t` });
  ta.value = q.starter;
  const out = h('div', { class: 'code-out', 'aria-live': 'polite' });
  body.append(ta, h('p', { class: 'muted small' }, 'JavaScript. Keep the function name. Runs in a sandbox with tests. Tab indents; Esc then Tab leaves the editor.'), out);
  ta.addEventListener('focus', () => { ta.dataset.tab = '1'; });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Tab' && !e.shiftKey && ta.dataset.tab === '1') { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); } if (e.key === 'Escape') ta.dataset.tab = '0'; });
  return {
    getAnswer: () => ta.value,
    grade: async (code) => {
      const r = await runCode({ code, fnName: q.fnName, tests: q.tests });
      renderResult(out, r, q.tests);
      const passed = (r.results || []).filter((x) => x.pass).length;
      return { correct: !!r.ok, partial: passed / q.tests.length, note: r.error ? '' : `${passed} of ${q.tests.length} tests pass. Read the first failing test carefully.` };
    },
    lockInputs: () => { ta.readOnly = true; },
    revealSolution: () => { ta.value = q.solution; ta.readOnly = true; },
  };
}
