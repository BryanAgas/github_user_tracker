import { h, clear } from '../util.js';
import { runCode } from '../runner.js';
export const meta = { name: 'codeplay', title: 'Code playground', blurb: 'Write JavaScript, run it safely in a sandbox, and check it against tests.', level: 3, skills: [] };

export function mount(el, props = {}, ctx = {}) {
  const { starter = '// Write JavaScript here. Use console.log(...) to see output.\nconsole.log("Hello, learner!");\n', fnName, tests, hints = [] } = props;
  const id = 'cp' + Math.random().toString(36).slice(2, 8);
  const ta = h('textarea', { id, class: 'code-ed', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', rows: Math.min(18, Math.max(6, starter.split('\n').length + 1)), 'aria-label': props.title || 'Code editor' });
  ta.value = starter;
  const out = h('div', { class: 'code-out', 'aria-live': 'polite' });
  let hintN = 0;
  const hintBox = h('div', { class: 'hint-box' });
  const run = h('button', { class: 'btn primary', type: 'button' }, tests?.length ? 'Run tests' : 'Run');
  const reset = h('button', { class: 'btn', type: 'button', onclick: () => { ta.value = starter; clear(out); } }, 'Reset');
  const hintBtn = hints.length ? h('button', { class: 'btn', type: 'button', onclick: () => { if (hintN < hints.length) { hintBox.append(h('p', {}, h('strong', {}, `Hint ${hintN + 1}: `), hints[hintN++])); } if (hintN >= hints.length) hintBtn.disabled = true; } }, 'Hint') : null;
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey && ta.dataset.tab === '1') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); }
    if (e.key === 'Escape') ta.dataset.tab = '0'; // Esc releases the Tab key so keyboard users can leave the editor
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') run.click();
  });
  ta.addEventListener('focus', () => { ta.dataset.tab = '1'; });
  run.addEventListener('click', async () => {
    run.disabled = true; run.textContent = 'Running…';
    const r = await runCode({ code: ta.value, fnName, tests });
    run.disabled = false; run.textContent = tests?.length ? 'Run tests' : 'Run';
    renderResult(out, r, tests);
    ctx.onRun?.(r, ta.value);
  });
  el.append(
    props.title ? h('h4', {}, props.title) : null,
    ta,
    h('p', { class: 'muted small' }, 'Runs in a locked-down sandbox in your browser: no network, no access to this page. Ctrl/⌘+Enter runs it. Tab indents; press Esc then Tab to leave the editor.'),
    h('div', { class: 'row' }, run, hintBtn, reset), hintBox, out,
  );
  return () => {};
}

export function renderResult(out, r, tests) {
  clear(out);
  if (r.error) out.append(h('div', { class: 'callout warn' }, h('strong', {}, 'Problem: '), r.error));
  if (r.logs?.length) out.append(h('pre', { class: 'console', 'aria-label': 'Console output' }, r.logs.join('\n')));
  if (tests?.length && r.results?.length) {
    const passed = r.results.filter((x) => x.pass).length;
    out.append(h('p', { class: passed === r.results.length ? 'ok-line' : 'bad-line' }, passed === r.results.length ? `✓ All ${passed} tests pass.` : `✗ ${passed} of ${r.results.length} tests pass.`));
    out.append(h('ul', { class: 'tests' }, r.results.map((t, i) => h('li', { class: t.pass ? 'pass' : 'fail' },
      h('span', { class: 'sr-only' }, t.pass ? 'Passed: ' : 'Failed: '), h('span', { 'aria-hidden': 'true' }, t.pass ? '✓ ' : '✗ '),
      t.label || `Test ${i + 1}`, h('code', {}, ` (${t.args})`),
      t.pass ? null : h('div', { class: 'muted small' }, t.error ? t.error : `expected ${t.expect}, got ${t.got}`)))));
  } else if (!r.error && !r.logs?.length) out.append(h('p', { class: 'muted' }, 'Ran with no output. Try console.log(...).'));
}
