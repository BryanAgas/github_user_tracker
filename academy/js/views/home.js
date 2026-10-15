import { h } from '../util.js';
import { levels, lessonById } from '../content.js';
import { state, streak, weekMinutes } from '../store.js';
import { nextUp, PATHS, pathLessons, projectDue } from '../paths.js';
import { reviewDueCount, lessonDone, levelProgress, weakSkills } from '../mastery.js';
import { page, bar, linkBtn, lvStyle } from './common.js';
import { openTutor } from '../tutorui.js';
import { WIDGET_NAMES } from '../widgets/index.js';

export default function home() {
  const p = state.profile;
  if (!state.onboarded) return h('div', { class: 'page' },
    h('div', { class: 'hero' }, h('div', { class: 'kicker' }, 'Mrs Anne’s AI Academy'), h('h1', { id: 'page-title', tabindex: '-1', class: 'display' }, 'From “I don’t really get AI” to “I can build it”.'),
      h('p', { class: 'lede' }, 'I’m Mrs Anne. Tell me about you, and I’ll build a path through eight levels that fits your job, your goals and your time. About three minutes, no account, nothing leaves your device.'),
      h('div', { class: 'row' }, linkBtn('Start my path', '#/onboarding'), linkBtn('Just look around', '#/explore', 'btn'))),
    h('div', { class: 'grid' },
      h('div', { class: 'card' }, h('h2', {}, '🧪 Learn by touching'), h('p', { class: 'muted' }, 'Train a tiny neural network, split text into tokens, break a retrieval system on purpose. Every idea comes with an experiment.')),
      h('div', { class: 'card' }, h('h2', {}, '💬 A teacher, not an answer machine'), h('p', { class: 'muted' }, 'Stuck? I’ll explain it another way, then give hints before solutions. Confident? I’ll make it harder.')),
      h('div', { class: 'card' }, h('h2', {}, '🏅 Mastery you can trust'), h('p', { class: 'muted' }, 'Opening a lesson proves nothing. Answers, exercises and real projects do, and your Progress page shows exactly what is strong.'))),
    h('section', { class: 'levels-strip', 'aria-label': 'Levels' }, h('h2', {}, 'The journey'), h('div', { class: 'strip' }, levels.map((L) => h('a', { class: 'lv-card', href: `#/learn/L${L.n}`, style: lvStyle(L.n) }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, L.glyph), h('strong', {}, `L${L.n} ${L.short}`), h('span', { class: 'muted small' }, L.outcome))))));
  const n = nextUp(); const due = reviewDueCount(); const pd = projectDue();
  const pl = pathLessons(); const done = pl.filter((l) => lessonDone(l.id)).length;
  const goal = Math.round(p.minutesPerWeek); const wk = weekMinutes();
  let main;
  if (pd) main = card('Time to build', pd.title, pd.objective, linkBtn('Start the project', `#/build/${pd.id}`), 'You’ve finished this level’s lessons. A project proves it.');
  else if (n.kind === 'lesson') main = card('Continue learning', n.lesson.title, n.lesson.hook, linkBtn(state.lessons[n.lesson.id]?.opened ? 'Resume lesson' : 'Start lesson', `#/lesson/${n.lesson.id}`), `${levels[n.lesson.level].glyph} Level ${n.lesson.level} · ${n.lesson.minutes} min`);
  else if (n.kind === 'project') main = card('Build next', n.project.title, n.project.objective, linkBtn('Open project', `#/build/${n.project.id}`), `Level ${n.project.level} project · ${n.project.est}`);
  else main = card('Path complete', 'You’ve done everything on your path', 'Explore other levels, retake reviews to keep skills sharp, or take on a harder project.', linkBtn('Explore topics', '#/explore'), '🎉');
  const featured = WIDGET_NAMES[(new Date().getDate()) % (WIDGET_NAMES.length - 1)];
  return page(`${greeting()}${p.name ? ', ' + p.name : ''}`,
    h('div', { class: 'grid home-grid' },
      main,
      h('section', { class: 'card' }, h('h2', {}, 'This week'),
        h('p', { class: 'big' }, `${wk}`, h('span', { class: 'muted' }, ` / ${goal} min`)), bar(wk / goal, 'Minutes this week against your goal'),
        h('p', { class: 'muted small' }, `Learning time is counted when you complete lessons. `),
        h('p', {}, h('span', { class: 'flame', 'aria-hidden': 'true' }, '🔥 '), h('strong', {}, `${streak()}-day streak`), h('span', { class: 'muted small' }, ' (any learning activity counts)'))),
      h('section', { class: 'card' }, h('h2', {}, 'Your path'), h('p', {}, h('strong', {}, PATHS[p.path]?.label || 'Custom'), ` — ${done} of ${pl.length} lessons done`), bar(pl.length ? done / pl.length : 0, 'Path progress'), h('div', { class: 'row' }, linkBtn('Open path', '#/learn', 'btn'), linkBtn('Change path', '#/learn?change=1', 'btn'))),
      h('section', { class: 'card' }, h('h2', {}, 'Keep skills sharp'), due ? h('p', {}, h('strong', {}, `${due} ${due === 1 ? 'skill is' : 'skills are'} due for review.`), ' Short, spaced practice is how things stick.') : h('p', {}, 'Nothing due. Practising anyway builds mastery faster.'), linkBtn(due ? 'Start review' : 'Quick practice', '#/review', 'btn primary')),
      h('section', { class: 'card ask' }, h('h2', {}, 'Ask Mrs Anne'), h('p', { class: 'muted' }, 'Confused? Curious? Want a quiz? I’m here.'), h('div', { class: 'chips' }, ['What should I do next?', 'Quiz me', 'How am I doing?'].map((t) => h('button', { class: 'chip btn-chip', type: 'button', onclick: () => openTutor(t) }, t)))),
      h('section', { class: 'card' }, h('h2', {}, 'Play with an idea'), h('p', { class: 'muted' }, 'Today’s experiment: ', h('strong', {}, featured)), linkBtn('Open in the Lab', `#/lab/${featured}`, 'btn')),
    ),
    h('section', { class: 'levels-strip', 'aria-label': 'Levels' }, h('h2', {}, 'The journey'), h('div', { class: 'strip' }, levels.map((L) => { const lp = levelProgress(L.n); return h('a', { class: 'lv-card', href: `#/learn/L${L.n}`, style: lvStyle(L.n) }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, L.glyph), h('strong', {}, `L${L.n} ${L.short}`), bar(lp.lessons ? lp.done / lp.lessons : 0, `Level ${L.n} lessons done`), lp.certified ? h('span', { class: 'badge live' }, 'Certified') : h('span', { class: 'muted small' }, `${lp.done}/${lp.lessons} lessons`)); }))));
}
const greeting = () => { const hr = new Date().getHours(); return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'; };
const card = (kicker, title, text, cta, foot) => h('section', { class: 'card feature' }, h('div', { class: 'kicker' }, kicker), h('h2', { class: 'display' }, title), h('p', {}, text), h('div', { class: 'row' }, cta), foot ? h('p', { class: 'muted small' }, foot) : null);
