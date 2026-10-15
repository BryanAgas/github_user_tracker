// Mastery is earned from EVIDENCE (answers, exercises, projects) — never from opening a page.
//   not yet learned : no evidence
//   needs practice  : some evidence, but weak, thin, or stale
//   strong          : recency-weighted score ≥ 0.8, weighted evidence ≥ 3, evidence on ≥ 2 different days (spacing), and not stale
import { state, save, touchDay } from './store.js';
import { today, daysBetween } from './util.js';
import { skillById, lessons, lessonById, skillsOfLevel, projectsOfLevel, projectById, questionsForSkill, levels } from './content.js';

const MAX_EVIDENCE = 14, STALE_DAYS = 30, DECAY = 0.85;

export function addEvidence(skill, score, weight = 1, src = 'x') {
  if (!skillById.has(skill)) return;
  const list = (state.evidence[skill] ??= []);
  list.push({ t: today(), s: Math.round(score * 100) / 100, w: weight, src });
  if (list.length > MAX_EVIDENCE) list.shift();
  touchDay(1, 0); save();
}

export function skillStatus(skill) {
  const ev = state.evidence[skill] || [];
  if (!ev.length) return { status: 'new', score: 0, n: 0, label: 'Not yet learned', glyph: '○' };
  let num = 0, den = 0, wsum = 0;
  ev.forEach((e, i) => { const k = Math.pow(DECAY, ev.length - 1 - i) * e.w; num += e.s * k; den += k; wsum += e.w; });
  const score = den ? num / den : 0;
  const days = new Set(ev.map((e) => e.t)).size;
  const lastAge = daysBetween(ev[ev.length - 1].t, today());
  const stale = lastAge > STALE_DAYS;
  const strong = score >= 0.8 && wsum >= 3 && days >= 2 && !stale;
  return strong
    ? { status: 'strong', score, n: ev.length, label: 'Strong', glyph: '●' }
    : { status: 'practice', score, n: ev.length, stale, label: stale && score >= 0.8 ? 'Review due' : 'Needs practice', glyph: '◐' };
}

export const levelMastery = (n) => {
  const skills = skillsOfLevel(n);
  const c = { strong: 0, practice: 0, new: 0, total: skills.length };
  skills.forEach((s) => { c[skillStatus(s.id).status]++; });
  return c;
};

// ── Lessons ────────────────────────────────────────────────────────────────
export const lessonRec = (id) => state.lessons[id];
export function lessonDone(id) {
  const rec = state.lessons[id];
  if (rec?.completed) return true;
  const L = lessonById.get(id);
  // Evidence-based completion: all skills strong (e.g. after a level challenge)
  return !!L && L.skills.length > 0 && L.skills.every((s) => skillStatus(s).status === 'strong');
}
export function openLesson(id) {
  const rec = (state.lessons[id] ??= { opened: today() });
  rec.opened ??= today(); rec.last = today(); save();
}
export function recordQuiz(id, results) {
  const L = lessonById.get(id); if (!L) return;
  const rec = (state.lessons[id] ??= { opened: today() });
  const firstTry = results.reduce((a, r) => a + r.score, 0) / Math.max(1, results.length);
  rec.attempts = (rec.attempts || 0) + 1; rec.firstTry = firstTry; rec.best = Math.max(rec.best || 0, firstTry); rec.at = today();
  if (results.length >= (L.quiz || []).length && firstTry >= 0.6) { rec.completed = rec.completed || today(); touchDay(0, L.minutes || 10); }
  save();
  return rec;
}

// ── Projects ───────────────────────────────────────────────────────────────
export const projectRec = (id) => (state.projects[id] ??= { ticks: [], text: '', code: '', hints: 0 });
export const projectPassed = (id) => !!state.projects[id]?.passedAt;

// ── Level certificate ──────────────────────────────────────────────────────
export function levelProgress(n) {
  const ls = lessons.filter((l) => l.level === n);
  const done = ls.filter((l) => lessonDone(l.id)).length;
  const m = levelMastery(n);
  const projs = projectsOfLevel(n);
  const projDone = projs.filter((p) => projectPassed(p.id)).length;
  const need = n === 7 ? Math.min(3, projs.length) : Math.min(1, projs.length);
  const certified = m.total > 0 && m.strong / m.total >= 0.75 && projDone >= need;
  return { lessons: ls.length, done, mastery: m, projects: projs.length, projDone, projNeeded: need, certified };
}

// ── What to practise next ──────────────────────────────────────────────────
export function weakSkills(limit = 6) {
  const out = [];
  for (const s of skillById.values()) {
    const st = skillStatus(s.id);
    if (st.status === 'practice') out.push({ skill: s, st, priority: (1 - st.score) + (st.stale ? 0.4 : 0) });
  }
  return out.sort((a, b) => b.priority - a.priority).slice(0, limit);
}
export function reviewDueCount() { return weakSkills(50).filter((w) => w.st.score < 0.7 || w.st.stale).length; }

// Skills the learner has actually met: evidence on them, or a lesson that teaches them has been opened.
export function studiedSkills() {
  const out = new Set(Object.keys(state.evidence).filter((k) => skillById.has(k)));
  for (const id of Object.keys(state.lessons)) lessonById.get(id)?.skills.forEach((s) => out.add(s));
  return [...out];
}
// Adaptive difficulty: stronger skills get harder questions.
export function pickQuestions({ skills, count = 6, level, exclude = [] }) {
  let pool = [];
  const sk = skills?.length ? skills : [...skillById.values()].filter((s) => level == null || s.level === level).map((s) => s.id);
  for (const id of sk) pool.push(...questionsForSkill(id));
  pool = pool.filter((q) => !exclude.includes(q.id));
  const scored = pool.map((q) => {
    const st = skillStatus(q.skill);
    const want = st.status === 'new' ? 1.5 : st.score >= 0.85 ? 3 : st.score >= 0.6 ? 2 : 1.3;
    const seen = state.seenQuestions[q.id] || 0;
    return { q, w: 3 - Math.abs(q.difficulty - want) - seen * 0.7 + (st.status === 'practice' ? 0.8 : 0) + Math.random() * 0.9 };
  }).sort((a, b) => b.w - a.w);
  const picked = [], bySkill = {};
  for (const { q } of scored) {
    if ((bySkill[q.skill] || 0) >= 2 && skills?.length !== 1) continue;
    picked.push(q); bySkill[q.skill] = (bySkill[q.skill] || 0) + 1;
    if (picked.length >= count) break;
  }
  return picked;
}
export const levelLabel = (n) => `${levels[n].glyph} Level ${n}`;
export { projectById };
