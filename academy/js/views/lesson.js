import { h, inline, announce } from '../util.js';
import { lessonById, levels, nextLesson, lessons, skillById, current } from '../content.js';
import { renderBlocks } from '../blocks.js';
import { renderQuestion } from '../assess.js';
import { openLesson, recordQuiz, lessonDone, skillStatus, lessonRec } from '../mastery.js';
import { inPath } from '../paths.js';
import { state, touchDay } from '../store.js';
import { levelChip, skillChip, page, linkBtn, bar } from './common.js';
import { setTutorContext, openTutor } from '../tutorui.js';

export default function lessonView({ id }, env) {
  const L = lessonById.get(id);
  if (!L) return page('Lesson not found', h('p', {}, 'That lesson doesn’t exist.'), linkBtn('Back to Learn', '#/learn'));
  openLesson(id); touchDay(1, 0);
  const lv = levels[L.level];
  const strongAlready = L.skills.length && L.skills.every((s) => skillStatus(s).status === 'strong');
  let challengeOnly = false;

  const siblings = lessons.filter((l) => l.level === L.level);
  const pos = siblings.indexOf(L) + 1;
  const header = h('header', { class: 'lesson-head', style: { '--lv': lv.hue } },
    h('div', { class: 'crumbs' }, h('a', { href: `#/learn/L${L.level}` }, `${lv.glyph} ${lv.title}`), ` · Lesson ${pos} of ${siblings.length}`),
    h('h1', { id: 'page-title', tabindex: '-1' }, L.title),
    h('p', { class: 'hook' }, L.hook),
    h('div', { class: 'meta' }, h('span', {}, `⏱ ${L.minutes} min`), L.code ? h('span', { class: 'chip' }, 'Involves coding') : null, L.deep ? h('span', { class: 'chip' }, 'Optional depth') : null, inPath(id) ? h('span', { class: 'chip good' }, 'On your path') : h('span', { class: 'chip' }, 'Not on your path — explore freely')),
    h('div', { class: 'skills-row' }, h('span', { class: 'muted small' }, 'You’ll build: '), L.skills.map((s) => skillById.get(s)).filter(Boolean).map(skillChip)),
  );

  // "I'm confused" — works without any model
  const reteachBox = h('div', { class: 'reteach', 'aria-live': 'polite' });
  let rt = -1;
  const confused = h('button', { class: 'btn', type: 'button', onclick: () => {
    rt = (rt + 1) % L.reteach.length; const r = L.reteach[rt];
    reteachBox.replaceChildren(h('aside', { class: 'callout k-analogy' }, h('div', { class: 'callout-h' }, `Another way in: ${r.style}`), h('div', {}, inline(r.md)), h('p', { class: 'small muted' }, L.reteach.length > 1 ? 'Press “I’m confused” again for a different explanation, or ask Mrs Anne.' : '')));
    announce('Alternative explanation shown');
  } }, '😕 I’m confused — explain differently');

  const body = renderBlocks(L, L.blocks, env);

  // quiz
  const results = []; const quizHost = h('div', { class: 'quiz' });
  const summary = h('div', { class: 'summary', 'aria-live': 'polite' });
  const prog = h('p', { class: 'muted small' });
  let qs = L.quiz;
  const buildQuiz = () => {
    results.length = 0; quizHost.replaceChildren(); summary.replaceChildren();
    qs = challengeOnly ? L.quiz.filter((q) => q.difficulty >= 2) : L.quiz;
    if (!qs.length) qs = L.quiz;
    qs.forEach((q, i) => quizHost.append(renderQuestion(q, { number: `${i + 1}/${qs.length}`, src: 'lesson:' + L.id, onResolved: (r) => { results.push(r); update(); } })));
    update();
  };
  const update = () => {
    prog.textContent = `${results.length} of ${qs.length} answered`;
    if (results.length < qs.length) return;
    const full = qs.length === L.quiz.length;
    const rec = full ? recordQuiz(L.id, results) : lessonRec(L.id);
    const avg = results.reduce((a, r) => a + r.score, 0) / results.length;
    const weak = [...new Set(results.filter((r) => r.score < 0.6).map((r) => r.skill))].map((s) => skillById.get(s)?.name).filter(Boolean);
    const nxt = nextLesson(L.id);
    const passed = full ? rec?.completed && avg >= 0.6 : avg >= 0.6;
    summary.replaceChildren(h('div', { class: `callout ${passed ? 'good' : 'warn'}` },
      h('h3', {}, passed ? (full ? 'Lesson complete' : 'Challenge passed') : 'Not quite secure yet'),
      h('p', {}, `Your first-try understanding score: ${Math.round(avg * 100)}%. Marks reflect unaided answers: hints and revealed solutions earn less, because the goal is to know it, not to finish it.`),
      weak.length ? h('p', {}, 'Shaky on: ', h('strong', {}, weak.join(', ')), '. Re-read the highlighted ideas, try “I’m confused”, then retake.') : h('p', {}, 'Nothing shaky here.'),
      !full ? h('p', { class: 'muted small' }, 'Challenge questions only count as extra evidence; take the full quiz to complete the lesson.') : null,
      h('div', { class: 'row' },
        !passed || avg < 0.9 ? h('button', { class: 'btn', type: 'button', onclick: () => { buildQuiz(); quizHost.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 'Retake the quiz') : null,
        h('button', { class: 'btn', type: 'button', onclick: () => openTutor(`I want to understand ${L.title} better`) }, 'Talk it through with Mrs Anne'),
        nxt && passed ? linkBtn(`Next: ${nxt.title}`, `#/lesson/${nxt.id}`) : null,
        passed ? linkBtn('Back to the path', '#/learn', 'btn') : null)));
    announce(passed ? 'Lesson complete' : 'Quiz finished — some ideas need another look');
  };
  buildQuiz();

  const apply = L.apply ? h('div', { class: 'callout k-tip' }, h('div', { class: 'callout-h' }, '🚀 Apply it today'), h('div', {}, inline(L.apply))) : null;
  const take = h('section', { class: 'takeaways' }, h('h2', {}, 'Keep this'), h('ul', {}, L.takeaways.map((t) => h('li', {}, inline(t)))));
  const challengeBanner = strongAlready ? h('div', { class: 'callout info' },
    h('strong', {}, 'You seem to know this already. '), 'Your evidence on these skills is strong. Try the challenge questions only, or read on anyway.',
    h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => { challengeOnly = true; buildQuiz(); quizHost.scrollIntoView({ behavior: 'smooth' }); } }, 'Challenge questions only'))) : null;

  setTutorContext({ lessonId: id, hintCurrent: () => {
    const card = [...quizHost.querySelectorAll('.qcard')].find((c) => !c.classList.contains('is-correct') && !c.classList.contains('is-missed'));
    if (!card) return 'none';
    const b = [...card.querySelectorAll('.qactions button')].find((x) => /hint/i.test(x.textContent));
    if (!b || b.disabled) return 'done';
    b.click(); card.scrollIntoView({ block: 'center', behavior: 'smooth' }); return 'shown';
  } });
  env.cleanups.push(() => setTutorContext({}));

  return h('article', { class: 'page lesson' }, header, challengeBanner, h('div', { class: 'row sticky-actions' }, confused, h('button', { class: 'btn', type: 'button', onclick: () => openTutor() }, '💬 Ask Mrs Anne')), reteachBox, body, apply,
    h('section', { class: 'quiz-section', 'aria-labelledby': 'quiz-h' }, h('h2', { id: 'quiz-h' }, 'Check your understanding'), h('p', { class: 'muted' }, 'Every answer is evidence. Opening a lesson never counts as learning; showing it does.'), prog, quizHost, summary),
    take);
}
