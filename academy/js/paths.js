// Learning paths: the same curriculum, selected and ordered for different people. Students can switch whenever they like.
import { lessons, projectById, projectsOfLevel } from './content.js';
import { lessonDone, projectPassed } from './mastery.js';
import { state } from './store.js';

// per-level rules: all | core | nocode | corenocode | skip
export const PATHS = {
  beginner:   { label: 'Curious beginner', who: 'New to AI and want the whole picture, gently.', rules: { 0: 'all', 1: 'core', 2: 'corenocode', 7: 'nocode' }, projects: 'text' },
  explorer:   { label: 'Non-technical explorer', who: 'You use computers well but don’t code. You want to use AI confidently.', rules: { 0: 'all', 1: 'all', 2: 'corenocode', 7: 'nocode' }, projects: 'text' },
  professional: { label: 'Business professional', who: 'You want AI to make your team better and to judge it sensibly.', rules: { 0: 'core', 1: 'all', 2: 'all', 3: 'corenocode', 4: 'corenocode', 7: 'nocode' }, projects: 'text' },
  founder:    { label: 'Founder', who: 'You decide what to build, buy and trust.', rules: { 0: 'core', 1: 'core', 2: 'all', 3: 'corenocode', 4: 'corenocode', 7: 'nocode' }, projects: 'text' },
  developer:  { label: 'Developer', who: 'You can code and want to build AI features properly.', rules: { 0: 'core', 1: 'core', 2: 'all', 3: 'all', 4: 'all', 5: 'core', 6: 'core', 7: 'all' }, projects: 'all' },
  data:       { label: 'Data professional', who: 'You know data and statistics; now models, retrieval and evaluation.', rules: { 0: 'core', 1: 'core', 2: 'core', 3: 'all', 4: 'core', 5: 'all', 6: 'core', 7: 'all' }, projects: 'all' },
  engineer:   { label: 'AI engineer', who: 'You ship software and want production-grade depth.', rules: { 2: 'core', 3: 'core', 4: 'all', 5: 'all', 6: 'all', 7: 'all' }, projects: 'all' },
  researcher: { label: 'Researcher', who: 'You want mechanisms, evidence and the frontier.', rules: { 0: 'core', 1: 'core', 3: 'core', 4: 'core', 5: 'all', 6: 'all', 7: 'nocode' }, projects: 'all' },
  everything: { label: 'The whole curriculum', who: 'Every lesson, every level, in order.', rules: { 0: 'all', 1: 'all', 2: 'all', 3: 'all', 4: 'all', 5: 'all', 6: 'all', 7: 'all' }, projects: 'all' },
};
export const ROLE_TO_PATH = { beginner: 'beginner', nontech: 'explorer', business: 'professional', founder: 'founder', developer: 'developer', data: 'data', engineer: 'engineer', researcher: 'researcher' };

const ok = (L, rule) => rule === 'all' ? true : rule === 'core' ? !!L.core : rule === 'nocode' ? !L.code : rule === 'corenocode' ? (!!L.core && !L.code) : false;

export function pathLessons(pathId = state.profile.path) {
  const P = PATHS[pathId] || PATHS.beginner;
  return lessons.filter((L) => ok(L, P.rules[L.level] ?? 'skip'));
}
export function pathProjects(pathId = state.profile.path) {
  const P = PATHS[pathId] || PATHS.beginner;
  const out = [];
  for (const L of new Set(pathLessons(pathId).map((l) => l.level))) for (const p of projectsOfLevel(L)) if (P.projects === 'all' || p.kind === 'text') out.push(p);
  return out;
}
export const inPath = (id) => pathLessons().some((l) => l.id === id);

// Where to go next: first unfinished lesson on the path at/after the placement level; then the level project.
export function nextUp() {
  const start = state.profile.startLevel || 0;
  const pl = pathLessons();
  const todo = pl.filter((l) => !lessonDone(l.id));
  const next = todo.find((l) => l.level >= start) || todo[0];
  if (next) return { kind: 'lesson', lesson: next };
  const proj = pathProjects().find((p) => !projectPassed(p.id));
  if (proj) return { kind: 'project', project: proj };
  return { kind: 'done' };
}
// If every lesson of a level on the path is done and its project isn't, nudge the project first.
export function projectDue() {
  for (const lvl of new Set(pathLessons().map((l) => l.level))) {
    const ls = pathLessons().filter((l) => l.level === lvl);
    if (ls.length && ls.every((l) => lessonDone(l.id))) {
      const p = pathProjects().find((p) => p.level === lvl && !projectPassed(p.id));
      if (p) return p;
    }
  }
  return null;
}
export { projectById };
