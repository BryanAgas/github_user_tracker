import { h, inline, clear } from '../util.js';
import { state, save } from '../store.js';
import { questionById, lessons } from '../content.js';
import { PATHS, ROLE_TO_PATH, pathLessons } from '../paths.js';
import { addEvidence } from '../mastery.js';
import { page, linkBtn } from './common.js';

const ROLES = [
  ['beginner', 'Just curious', 'New to all this, want the big picture.'], ['nontech', 'Non-technical professional', 'I use computers well, but I don’t code.'], ['business', 'Business professional', 'I lead or run work and want AI to help my team.'],
  ['founder', 'Founder', 'I decide what to build, buy and trust.'], ['developer', 'Developer', 'I write code and want to build AI features.'], ['data', 'Data professional', 'Analyst, scientist or ML practitioner.'],
  ['engineer', 'AI engineer', 'I already ship AI systems.'], ['researcher', 'Researcher', 'I care about mechanisms and the frontier.'],
];
const GOALS = ['Understand how AI works', 'Use AI better at work', 'Automate boring tasks', 'Build AI features', 'Build a product or startup', 'Evaluate AI claims & risks', 'Change career', 'Teach others'];
const INTERESTS = ['Writing', 'Research', 'Data & analysis', 'Coding', 'Images & media', 'Agents & automation', 'Voice', 'Safety & ethics', 'Business strategy'];

export default function onboarding() {
  const draft = { ...state.profile, goals: [...state.profile.goals], interests: [...state.profile.interests] };
  const root = h('div', { class: 'page wizard' });
  let step = 0;
  const steps = [welcome, aboutYou, experience, goals, calibrate, result];
  const go = (n) => { step = n; clear(root); root.append(h('p', { class: 'muted small', 'aria-hidden': 'true' }, `Step ${step + 1} of ${steps.length}`), steps[step]()); root.querySelector('h1')?.focus(); window.scrollTo(0, 0); };
  const nav = (back, next, nextLabel = 'Continue', ok = true) => h('div', { class: 'row' }, back ? h('button', { class: 'btn', type: 'button', onclick: () => go(step - 1) }, 'Back') : null, h('button', { class: 'btn primary', type: 'button', disabled: !ok || null, onclick: next }, nextLabel));

  function welcome() {
    const name = h('input', { id: 'ob-name', value: draft.name, maxlength: 40, autocomplete: 'nickname' });
    return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1', class: 'display' }, 'Hello, I’m Mrs Anne.'), h('p', { class: 'lede' }, 'In about three minutes I’ll learn where you are and build you a path. No account, nothing leaves your device.'),
      h('div', { class: 'field' }, h('label', { for: 'ob-name' }, 'What should I call you? (optional; a nickname is plenty)'), name),
      nav(false, () => { draft.name = name.value.trim(); go(1); }, 'Let’s begin'));
  }
  function aboutYou() {
    return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1' }, 'Which of these sounds most like you?'), h('p', { class: 'muted' }, 'You can change this at any time.'),
      h('div', { class: 'grid roles', role: 'radiogroup', 'aria-label': 'Your role' }, ROLES.map(([k, t, d]) => h('label', { class: `card role ${draft.role === k ? 'on' : ''}` }, h('input', { type: 'radio', name: 'role', value: k, checked: draft.role === k ? true : null, onclick: (e) => { draft.role = k; e.target.closest('.roles').querySelectorAll('.role').forEach((r) => r.classList.toggle('on', r.contains(e.target))); } }), h('strong', {}, t), h('span', { class: 'muted small' }, d)))),
      nav(true, () => go(2)));
  }
  function experience() {
    const rate = [['1', 'Brand new', 'I’ve barely used AI tools.'], ['2', 'Casual user', 'I use chat assistants sometimes.'], ['3', 'Regular user', 'I use AI most weeks and write decent prompts.'], ['4', 'Power user / builder', 'I build with AI, or understand how it works.'], ['5', 'Practitioner', 'I ship AI systems or work in ML.']];
    const code = [['none', 'I don’t code'], ['some', 'A little (scripts, spreadsheets, tutorials)'], ['comfortable', 'Comfortable in at least one language'], ['pro', 'Professional developer']];
    return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1' }, 'Where are you today?'),
      h('fieldset', {}, h('legend', {}, 'Experience with AI'), rate.map(([v, t, d]) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: 'ai', value: v, checked: String(draft.aiRating) === v ? true : null, onchange: () => (draft.aiRating = +v) }), h('span', {}, h('strong', {}, t), ' — ', d)))),
      h('fieldset', {}, h('legend', {}, 'Coding'), code.map(([v, t]) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: 'code', value: v, checked: draft.coding === v ? true : null, onchange: () => (draft.coding = v) }), h('span', {}, t)))),
      nav(true, () => go(3)));
  }
  function goals() {
    const chips = (list, arr, label) => h('fieldset', {}, h('legend', {}, label), h('div', { class: 'chips' }, list.map((g) => { const id = 'c' + Math.random().toString(36).slice(2, 7); return h('span', { class: 'chipbox' }, h('input', { id, type: 'checkbox', checked: arr.includes(g) ? true : null, onchange: (e) => { const i = arr.indexOf(g); if (e.target.checked && i < 0) arr.push(g); if (!e.target.checked && i >= 0) arr.splice(i, 1); } }), h('label', { for: id, class: 'chip btn-chip' }, g)); })));
    const styles = [['hands-on', 'Learn by doing'], ['visual', 'See it visually'], ['reading', 'Read and reflect'], ['talk', 'Talk it through']];
    const times = [[30, '30 min / week'], [60, '1 hour / week'], [120, '2 hours / week'], [240, '4 hours / week'], [480, '8+ hours / week']];
    return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1' }, 'What do you want from this?'), chips(GOALS, draft.goals, 'Goals (pick any)'), chips(INTERESTS, draft.interests, 'Interests (pick any)'),
      h('div', { class: 'field' }, h('label', { for: 'ob-style' }, 'How do you like to learn?'), h('select', { id: 'ob-style', onchange: (e) => (draft.style = e.target.value) }, styles.map(([v, t]) => h('option', { value: v, selected: draft.style === v ? true : null }, t)))),
      h('div', { class: 'field' }, h('label', { for: 'ob-time' }, 'Time you can spare'), h('select', { id: 'ob-time', onchange: (e) => (draft.minutesPerWeek = +e.target.value) }, times.map(([v, t]) => h('option', { value: v, selected: draft.minutesPerWeek === v ? true : null }, t)))),
      nav(true, () => go(4)));
  }

  // Calibration: one placement question per level, ascending, stop after two misses. Always optional.
  function calibrate() {
    const byLevel = {};
    for (const q of questionById.values()) if (q.placement) (byLevel[q.level] ??= []).push(q);
    const lvls = Object.keys(byLevel).map(Number).sort((a, b) => a - b).filter((n) => n <= 6);
    const startFrom = draft.aiRating <= 1 && ['beginner', 'nontech'].includes(draft.role) ? lvls.length : 0; // brand-new: skip the quiz kindly
    if (startFrom) return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1' }, 'No quiz for you'), h('p', { class: 'lede' }, 'Since you’re new, we’ll skip the quiz and start at the very beginning. That’s exactly the right place.'), h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => go(3) }, 'Back'), h('button', { class: 'btn primary', type: 'button', onclick: () => { draft.startLevel = 0; go(5); } }, 'Continue')));
    const box = h('div', { 'aria-live': 'polite' });
    const out = { passed: -1, answered: 0 };
    let i = startFrom, misses = 0;
    const ask = () => {
      clear(box);
      if (i >= lvls.length || misses >= 2) return done();
      const n = lvls[i]; const q = byLevel[n][0];
      const lab = (t) => h('span', {}, t);
      const group = h('div', { class: 'opts', role: 'radiogroup', 'aria-labelledby': 'cal-q' });
      if (q.type === 'mcq') q.options.forEach((o, k) => group.append(h('label', { class: 'opt' }, h('input', { type: 'radio', name: 'cal', value: k }), lab(inline(o)))));
      else group.append(h('p', { class: 'muted' }, 'This one needs a longer answer; skip it for now.'));
      const answer = (k) => { const ok = k === q.answer; out.answered++; addEvidence(q.skill, ok ? 0.8 : 0, 0.5, 'placement:' + q.id); if (ok) { out.passed = n; misses = 0; } else misses++; i++; ask(); };
      box.append(h('p', { class: 'muted small' }, `Question ${out.answered + 1} (no marks, no pressure — a wrong answer just means we start gently)`), h('p', { class: 'qtext', id: 'cal-q' }, inline(q.q)), q.code ? h('pre', { class: 'codeblock' }, h('code', {}, q.code)) : null, group,
        h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { const c = group.querySelector('input:checked'); if (!c) return; answer(+c.value); } }, 'Answer'), h('button', { class: 'btn', type: 'button', onclick: () => answer(-1) }, 'I don’t know')));
    };
    const done = () => { draft.startLevel = Math.min(6, out.passed + 1); go(5); };
    return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1' }, 'A few quick questions'), h('p', { class: 'lede' }, startFrom ? 'Since you’re new, we’ll skip the quiz and start at the very beginning.' : 'These help me decide where to start. “I don’t know” is a perfectly good answer.'), box,
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => go(3) }, 'Back'), h('button', { class: 'btn', type: 'button', onclick: () => { draft.startLevel = Math.max(0, out.passed + 1); go(5); } }, 'Skip the questions')), (queueMicrotask(ask), ''));
  }

  function result() {
    let pathId = ROLE_TO_PATH[draft.role] || 'beginner';
    if (draft.role === 'nontech' && draft.aiRating <= 1) pathId = 'beginner';
    if (['developer', 'data', 'engineer'].includes(draft.role) && draft.coding === 'none') pathId = 'explorer';
    if (draft.aiRating >= 4 && ['nontech', 'business', 'founder'].includes(draft.role)) { /* keep role path; placement starts them later */ }
    draft.path = draft.path && draft.touchedPath ? draft.path : pathId;
    const mkOption = (k) => h('option', { value: k, selected: draft.path === k ? true : null }, PATHS[k].label);
    const sel = h('select', { id: 'ob-path', onchange: (e) => { draft.path = e.target.value; draft.touchedPath = true; go(5); } }, Object.keys(PATHS).map(mkOption));
    const pl = pathLessons(draft.path); const mins = pl.reduce((a, l) => a + l.minutes, 0);
    const startLevel = draft.startLevel || 0;
    const first = pl.find((l) => l.level >= startLevel) || pl[0];
    const weeks = Math.max(1, Math.round(mins / draft.minutesPerWeek));
    return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1', class: 'display' }, `Here’s your path${draft.name ? ', ' + draft.name : ''}.`),
      h('div', { class: 'card feature' }, h('div', { class: 'kicker' }, 'Recommended'), h('h2', {}, PATHS[draft.path].label), h('p', {}, PATHS[draft.path].who),
        h('p', {}, `${pl.length} lessons, about ${Math.round(mins / 60)} hours of lessons, roughly ${weeks} week${weeks === 1 ? '' : 's'} at your pace, plus projects.`),
        startLevel > 0 ? h('p', {}, `Your answers suggest you can start at ${startLevel > 1 ? 'Level ' + startLevel : 'Level 1'}. Earlier lessons stay open if you want them.`) : h('p', {}, 'We’ll start at the beginning, which is the right place.'),
        first ? h('p', {}, 'First up: ', h('strong', {}, first.title)) : h('p', { class: 'muted' }, 'Some levels are still being written.')),
      h('div', { class: 'field' }, h('label', { for: 'ob-path' }, 'Prefer a different path?'), sel),
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => go(4) }, 'Back'), h('button', { class: 'btn primary', type: 'button', onclick: () => { Object.assign(state.profile, { ...draft, startLevel: draft.startLevel || 0 }); delete state.profile.touchedPath; state.onboarded = true; save(); location.hash = first ? `#/lesson/${first.id}` : '#/home'; } }, 'Start learning')));
  }
  go(0);
  return root;
}
