import { h, inline, clear, append } from '../util.js';
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
  const go = (n) => {
    const keep = n === step ? document.activeElement?.id : null; // same step re-render (e.g. changing the path): keep the user's place
    step = n; clear(root); append(root, [h('p', { class: 'muted small' }, `Step ${step + 1} of ${steps.length}`), steps[step]()]);
    if (keep && root.querySelector('#' + keep)) root.querySelector('#' + keep).focus(); else { root.querySelector('h1')?.focus(); window.scrollTo(0, 0); }
  };
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
    const times = [[30, '30 min / week'], [45, '45 min / week'], [60, '1 hour / week'], [90, '1½ hours / week'], [120, '2 hours / week'], [240, '4 hours / week'], [480, '8+ hours / week']];
    return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1' }, 'What do you want from this?'), chips(GOALS, draft.goals, 'Goals (pick any)'), chips(INTERESTS, draft.interests, 'Interests (pick any)'),
      h('div', { class: 'field' }, h('label', { for: 'ob-style' }, 'How do you like to learn?'), h('select', { id: 'ob-style', onchange: (e) => (draft.style = e.target.value) }, styles.map(([v, t]) => h('option', { value: v, selected: draft.style === v ? true : null }, t)))),
      h('div', { class: 'field' }, h('label', { for: 'ob-time' }, 'Time you can spare'), h('select', { id: 'ob-time', onchange: (e) => (draft.minutesPerWeek = +e.target.value) }, times.map(([v, t]) => h('option', { value: v, selected: draft.minutesPerWeek === v ? true : null }, t)))),
      nav(true, () => go(4)));
  }

  // Calibration: up to two self-contained questions per level, ascending; a level counts as known only if BOTH are right.
  // Stops after a level with a miss. Nothing is stored until the learner commits (no 0% "evidence" for things never studied).
  const byLevel = {};
  for (const q of questionById.values()) if (q.placement && q.type === 'mcq') (byLevel[q.level] ??= []).push(q);
  const placed = { passedLevel: -1, right: [] };
  function calibrate() {
    const canCode = draft.coding !== 'none', expert = draft.aiRating >= 4;
    // Don't ask a non-coder about HTTP retries, or a newcomer about model internals.
    const lvls = Object.keys(byLevel).map(Number).sort((a, b) => a - b).filter((n) => n <= 6 && (n < 3 || canCode) && (n < 5 || (canCode && expert)) && (n < 2 || draft.aiRating >= 2));
    const startFrom = draft.aiRating <= 1 && ['beginner', 'nontech'].includes(draft.role);
    if (startFrom) return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1' }, 'We’ll start at the beginning'), h('p', { class: 'lede' }, 'Since AI is new to you, there’s no quiz. The beginning is exactly the right place, and it’s a friendly one.'), h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => go(3) }, 'Back'), h('button', { class: 'btn primary', type: 'button', onclick: () => { draft.startLevel = 0; go(5); } }, 'Continue')));
    const queue = lvls.flatMap((n) => byLevel[n].slice(0, 2).map((q) => ({ n, q })));
    const box = h('div', { 'aria-live': 'polite' });
    let i = 0, asked = 0, levelMiss = false;
    const finish = () => { draft.startLevel = Math.min(5, placed.passedLevel + 1); draft.placedQs = placed.right.slice(); go(5); };
    const ask = () => {
      clear(box);
      if (i >= queue.length) return finish();
      const { n, q } = queue[i];
      const group = h('div', { class: 'opts', role: 'radiogroup', 'aria-labelledby': 'cal-q' }, q.options.map((o, k) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: 'cal', value: k }), h('span', {}, inline(o)))));
      const answer = (k) => {
        const ok = k === q.answer; asked++;
        const sameLevel = queue.filter((x) => x.n === n); const idxInLevel = sameLevel.findIndex((x) => x.q === q);
        if (ok) { placed.right.push(q.id); if (idxInLevel === sameLevel.length - 1 && !levelMiss) placed.passedLevel = n; }
        else levelMiss = true;
        // advance: next question in this level, or next level (stop if this level had a miss)
        const nextIdx = queue.findIndex((x, j) => j > i && (x.n === n ? !levelMiss : !levelMiss));
        if (levelMiss) { i = queue.length; } else { i = nextIdx < 0 ? queue.length : nextIdx; }
        ask();
        if (i < queue.length) box.querySelector('#cal-q')?.focus();
      };
      append(box, [h('p', { class: 'muted small' }, `Question ${asked + 1} (no marks, no pressure: it only helps me choose where to start)`), h('p', { class: 'qtext', id: 'cal-q', tabindex: '-1', dataset: { qid: q.id } }, inline(q.q)), q.code ? h('pre', { class: 'codeblock' }, h('code', {}, q.code)) : null, group,
        h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { const c = group.querySelector('input:checked'); if (c) answer(+c.value); else box.querySelector('input')?.focus(); } }, 'Answer'), h('button', { class: 'btn', type: 'button', onclick: () => answer(-1) }, 'I don’t know'))]);
    };
    if (!queue.length) { queueMicrotask(finish); }
    else queueMicrotask(ask);
    return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1' }, 'A few quick questions'), h('p', { class: 'lede' }, 'These help me decide where to start. “I don’t know” is a perfectly good answer.'), box,
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => go(3) }, 'Back'), h('button', { class: 'btn', type: 'button', onclick: () => { draft.startLevel = 0; go(5); } }, 'Skip and start at the beginning')));
  }

  function result() {
    let pathId = ROLE_TO_PATH[draft.role] || 'beginner';
    if (draft.role === 'nontech' && draft.aiRating <= 1) pathId = 'beginner';
    if (['developer', 'data', 'engineer'].includes(draft.role) && draft.coding === 'none') pathId = 'explorer';
    if (draft.aiRating >= 4 && ['nontech', 'business', 'founder'].includes(draft.role)) { /* keep role path; placement starts them later */ }
    draft.path = draft.path && draft.touchedPath ? draft.path : pathId;
    const mkOption = (k) => h('option', { value: k, selected: draft.path === k ? true : null }, PATHS[k].label);
    const sel = h('select', { id: 'ob-path', onchange: (e) => { draft.path = e.target.value; draft.touchedPath = true; go(5); } }, Object.keys(PATHS).map(mkOption));
    const startLevel = draft.startLevel || 0;
    const pl = pathLessons(draft.path).filter((l) => l.level >= startLevel); const mins = pl.reduce((a, l) => a + l.minutes, 0);
    const first = pl.find((l) => l.level >= startLevel) || pl[0];
    const weeks = Math.max(1, Math.round(mins / draft.minutesPerWeek));
    return h('div', {}, h('h1', { id: 'page-title', tabindex: '-1', class: 'display' }, `Here’s your path${draft.name ? ', ' + draft.name : ''}.`),
      h('div', { class: 'card feature' }, h('div', { class: 'kicker' }, 'Recommended'), h('h2', {}, PATHS[draft.path].label), h('p', {}, PATHS[draft.path].who),
        h('p', {}, `${pl.length} lessons, about ${Math.round(mins / 60)} hours of lessons, roughly ${weeks} week${weeks === 1 ? '' : 's'} at your pace, plus projects.`),
        startLevel > 0 ? h('p', {}, `Your answers suggest you can start at ${startLevel > 1 ? 'Level ' + startLevel : 'Level 1'}. Earlier lessons stay open if you want them.`) : h('p', {}, 'We’ll start at the beginning, which is the right place.'),
        first ? h('p', {}, 'First up: ', h('strong', {}, first.title)) : h('p', { class: 'muted' }, 'Some levels are still being written.')),
      h('div', { class: 'field' }, h('label', { for: 'ob-path' }, 'Prefer a different path?'), sel),
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => go(4) }, 'Back'), h('button', { class: 'btn primary', type: 'button', onclick: () => commit(first) }, 'Start learning')));
  }
  // Commit the profile once; placement evidence counts only RIGHT answers, only once (misses are never stored as 0%).
  function commit(first) {
    const { placedQs = [], touchedPath, ...profile } = draft;
    Object.assign(state.profile, { ...profile, startLevel: draft.startLevel || 0 });
    for (const id of placedQs) { const q = questionById.get(id); if (q) addEvidence(q.skill, 0.8, 0.5, 'placement:' + q.id); }
    state.onboarded = true; save();
    location.hash = first ? `#/lesson/${first.id}` : '#/home';
  }
  go(0);
  return root;
}
