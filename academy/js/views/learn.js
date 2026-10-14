import { h } from '../util.js';
import { levels, lessonsOfLevel, lessons, projectsOfLevel, skillsOfLevel } from '../content.js';
import { state, save } from '../store.js';
import { PATHS, pathLessons, inPath, nextUp } from '../paths.js';
import { lessonDone, levelProgress, lessonRec, projectPassed } from '../mastery.js';
import { page, bar, linkBtn, lvStyle } from './common.js';

export default function learn({ id, query }) {
  if (id && /^L\d$/.test(id)) return levelPage(+id[1]);
  const pl = new Set(pathLessons().map((l) => l.id));
  const start = state.profile.startLevel || 0;
  const nxt = nextUp();
  const changer = h('details', { class: 'card', open: query?.get('change') === '1' || undefined },
    h('summary', {}, 'Change my path'),
    h('p', { class: 'muted' }, 'You’re never locked in. Every lesson stays open to everyone; the path just chooses and orders them.'),
    h('div', { class: 'grid paths' }, Object.entries(PATHS).map(([k, P]) => h('button', { type: 'button', class: `card path-opt ${k === state.profile.path ? 'on' : ''}`, 'aria-pressed': k === state.profile.path ? 'true' : 'false', onclick: () => { state.profile.path = k; save(); location.hash = '#/learn'; location.reload(); } }, h('strong', {}, P.label), h('span', { class: 'muted small' }, P.who), h('span', { class: 'small' }, `${pathLessons(k).length} lessons`)))));
  return page('Learn',
    h('p', { class: 'lede' }, 'Your path: ', h('strong', {}, PATHS[state.profile.path]?.label || 'Custom'), `. ${[...pl].length} lessons across ${new Set(pathLessons().map((l) => l.level)).size} levels.`),
    changer,
    ...levels.map((L) => {
      const ls = lessonsOfLevel(L.n); const lp = levelProgress(L.n);
      const onPath = ls.filter((l) => pl.has(l.id)).length;
      return h('section', { class: `level ${onPath ? '' : 'dim'}`, style: lvStyle(L.n), 'aria-labelledby': `lv${L.n}` },
        h('div', { class: 'level-h' }, h('span', { class: 'glyph big', 'aria-hidden': 'true' }, L.glyph), h('div', {}, h('h2', { id: `lv${L.n}` }, `Level ${L.n}: ${L.title}`), h('p', { class: 'muted' }, L.blurb)),
          h('a', { class: 'btn small', href: `#/learn/L${L.n}` }, 'Details')),
        !L.ready || !ls.length ? h('p', { class: 'muted' }, 'This level is being written. Check back soon.') : [
          start > L.n && onPath ? h('p', { class: 'callout info' }, 'Your calibration suggests you can start beyond this level. Every lesson is still open — try a review to confirm.') : null,
          bar(lp.lessons ? lp.done / lp.lessons : 0, `Level ${L.n} progress`),
          h('ol', { class: 'lesson-list-cards' }, ls.map((l) => lessonRow(l, pl.has(l.id), nxt))),
        ]);
    }));
}
export function lessonRow(l, on, nxt) {
  const done = lessonDone(l.id); const rec = lessonRec(l.id);
  const isNext = nxt?.kind === 'lesson' && nxt.lesson.id === l.id;
  return h('li', {}, h('a', { class: `lrow ${done ? 'done' : ''} ${isNext ? 'next' : ''}`, href: `#/lesson/${l.id}` },
    h('span', { class: 'ico', 'aria-hidden': 'true' }, done ? '✓' : isNext ? '▶' : rec?.opened ? '◐' : '○'),
    h('span', { class: 'ltxt' }, h('strong', {}, l.title), h('span', { class: 'muted small' }, l.hook)),
    h('span', { class: 'lmeta small' }, `${l.minutes} min`, l.code ? ' · code' : '', l.deep ? ' · deep' : '', !on ? ' · off-path' : ''),
    h('span', { class: 'sr-only' }, done ? 'Completed' : isNext ? 'Up next' : rec?.opened ? 'In progress' : 'Not started')));
}

function levelPage(n) {
  const L = levels[n]; const lp = levelProgress(n);
  const nxt = nextUp();
  return page(`Level ${n}: ${L.title}`,
    h('div', { style: lvStyle(n) },
      h('p', { class: 'lede' }, L.blurb), h('p', {}, h('strong', {}, 'Outcome: '), L.outcome),
      h('div', { class: 'grid' },
        h('section', { class: 'card' }, h('h2', {}, 'Progress'), h('p', {}, `${lp.done} of ${lp.lessons} lessons`), bar(lp.lessons ? lp.done / lp.lessons : 0, 'Lessons'),
          h('p', {}, `Skills: ${lp.mastery.strong} strong · ${lp.mastery.practice} need practice · ${lp.mastery.new} not yet learned`), bar(lp.mastery.total ? lp.mastery.strong / lp.mastery.total : 0, 'Skills strong'),
          lp.certified ? linkBtn('View my certificate', `#/cert/L${n}`) : h('p', { class: 'muted small' }, `Certificate: 75% of skills strong and ${lp.projNeeded} project${lp.projNeeded === 1 ? '' : 's'} passed (${lp.projDone} so far).`),
          h('div', { class: 'row' }, linkBtn('Level challenge', `#/review?level=${n}&count=10`, 'btn'))),
        h('section', { class: 'card' }, h('h2', {}, 'Projects'), projectsOfLevel(n).length ? h('ul', { class: 'plain' }, projectsOfLevel(n).map((p) => h('li', {}, h('a', { href: `#/build/${p.id}` }, p.title), projectPassed(p.id) ? ' ✓' : ''))) : h('p', { class: 'muted' }, 'None yet.'))),
      h('h2', {}, 'Lessons'),
      h('ol', { class: 'lesson-list-cards' }, lessonsOfLevel(n).map((l) => lessonRow(l, inPath(l.id), nxt))),
      h('h2', {}, 'Skills in this level'),
      h('div', { class: 'skills-row' }, skillsOfLevel(n).map((s) => h('a', { class: 'skill', href: `#/topic/${s.id}` }, s.name)))));
}
