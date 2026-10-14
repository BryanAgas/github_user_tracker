// Loads every content module and builds lookup indexes. Missing level files are tolerated (shown as "coming soon").
import LEVELS from './content/levels.js';

const loaded = await Promise.all([0, 1, 2, 3, 4, 5, 6, 7].map((n) => import(`./content/l${n}.js`).then((m) => m.default).catch(() => null)));
const shared = await import('./content/shared.js').then((m) => m.default).catch(() => ({ current: {}, resources: [] }));

export const levels = LEVELS.map((L) => ({ ...L, ready: !!loaded[L.n] }));
export const lessons = [];
export const lessonById = new Map();
export const skillById = new Map();
export const questionById = new Map();
export const projectById = new Map();
export const glossary = [];
export const current = { ...(shared.current || {}) };
export const resources = shared.resources || [];

loaded.forEach((m, n) => {
  if (!m) return;
  for (const s of m.skills || []) skillById.set(s.id, { ...s, level: n, lessons: [] });
  (m.lessons || []).forEach((L, i) => {
    const lesson = { ...L, level: n, index: i };
    lessons.push(lesson); lessonById.set(L.id, lesson);
    for (const q of L.quiz || []) questionById.set(q.id, { ...q, lessonId: L.id, level: n });
  });
  for (const p of m.projects || []) projectById.set(p.id, { ...p, level: n });
  for (const g of m.glossary || []) glossary.push({ ...g, level: g.level ?? n });
  Object.assign(current, m.current || {});
});
for (const L of lessons) for (const s of L.skills || []) skillById.get(s)?.lessons.push(L.id);
glossary.sort((a, b) => a.term.localeCompare(b.term));

export const lessonsOfLevel = (n) => lessons.filter((l) => l.level === n);
export const skillsOfLevel = (n) => [...skillById.values()].filter((s) => s.level === n);
export const projectsOfLevel = (n) => [...projectById.values()].filter((p) => p.level === n);
export const questionsForSkill = (id) => [...questionById.values()].filter((q) => q.skill === id);
export const levelOf = (n) => levels[n];
export const nextLesson = (id) => { const i = lessons.findIndex((l) => l.id === id); return i >= 0 ? lessons[i + 1] : null; };
