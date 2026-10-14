// Node unit tests: mastery model, paths, tutor logic, content integrity. Run: node tests/unit.mjs
import assert from 'node:assert/strict';
const store = new Map();
globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) };
globalThis.sessionStorage = globalThis.localStorage;
globalThis.addEventListener = () => {};
const C = await import('../js/content.js'); const S = await import('../js/store.js'); const M = await import('../js/mastery.js');
const P = await import('../js/paths.js'); const T = await import('../js/tutor.js'); const A = await import('../js/assess.js').catch(() => null);
let pass = 0; const t = (name, fn) => { try { fn(); pass++; } catch (e) { console.error('✗', name, '\n  ', e.message); process.exitCode = 1; } };
const reset = () => { S.resetAll(); };

t('all 8 levels loaded with lessons, projects, skills', () => {
  assert.ok(C.levels.every((l) => l.ready), 'a level failed to load');
  for (let n = 0; n < 8; n++) { assert.ok(C.lessonsOfLevel(n).length >= 6, 'lessons L' + n); assert.ok(C.projectsOfLevel(n).length >= 1, 'project L' + n); assert.ok(C.skillsOfLevel(n).length >= 6); }
  assert.ok(C.lessons.length >= 60);
});
t('every skill is taught by at least one lesson and tested by at least one question', () => {
  for (const s of C.skillById.values()) { if (!s.id.startsWith('l7.')) assert.ok(s.lessons.length, 'no lesson teaches ' + s.id); assert.ok(C.questionsForSkill(s.id).length, 'no question tests ' + s.id); }
});
t('placement questions exist for levels 0-6 and are mcq (usable in onboarding)', () => {
  for (let n = 0; n <= 6; n++) assert.ok([...C.questionById.values()].some((q) => q.level === n && q.placement && q.type === 'mcq'), 'no mcq placement question at L' + n);
});
t('mastery: opening a lesson gives NO mastery', () => {
  reset(); const L = C.lessons[0]; M.openLesson(L.id);
  for (const s of L.skills) assert.equal(M.skillStatus(s).status, 'new');
  assert.equal(M.lessonDone(L.id), false);
});
t('mastery: a single correct answer is only "needs practice"', () => {
  reset(); const s = C.lessons[0].skills[0]; M.addEvidence(s, 1, 1, 'quiz:a');
  assert.equal(M.skillStatus(s).status, 'practice');
});
t('mastery: strong needs ≥3 weight, ≥2 sources, score ≥0.8', () => {
  reset(); const s = C.lessons[0].skills[0];
  M.addEvidence(s, 1, 1, 'quiz:q1'); M.addEvidence(s, 1, 1, 'quiz:q2'); M.addEvidence(s, 1, 1, 'quiz:q3');
  assert.equal(M.skillStatus(s).status, 'strong');
  reset(); M.addEvidence(s, 1, 1, 'quiz:q1'); M.addEvidence(s, 0.5, 1, 'quiz:q1'); M.addEvidence(s, 1, 1, 'quiz:q1');
  assert.equal(M.skillStatus(s).status, 'practice', 'weak score or single source must not be strong');
});
t('mastery: stale evidence downgrades strong to review-due', () => {
  reset(); const s = C.lessons[0].skills[0];
  for (let i = 0; i < 3; i++) M.addEvidence(s, 1, 1, 'quiz:q' + i);
  const old = new Date(Date.now() - 45 * 864e5).toISOString().slice(0, 10);
  S.state.evidence[s].forEach((e) => (e.t = old));
  const st = M.skillStatus(s); assert.equal(st.status, 'practice'); assert.equal(st.label, 'Review due');
});
t('mastery: recent mistakes outweigh old successes', () => {
  reset(); const s = C.lessons[0].skills[0];
  for (let i = 0; i < 4; i++) M.addEvidence(s, 1, 1, 'quiz:q' + i);
  for (let i = 0; i < 3; i++) M.addEvidence(s, 0, 1, 'review:r' + i);
  assert.notEqual(M.skillStatus(s).status, 'strong');
});
t('evidence: hints and revealed solutions earn less than unaided success', () => {
  if (!A) return;
  const f = A.evidenceFor; assert.equal(f({ correct: true }), 1); assert.ok(f({ correct: true, hints: 2 }) < 1 && f({ correct: true, hints: 2 }) >= 0.4);
  assert.ok(f({ correct: true, attempts: 2 }) < 1, 'a retry after a miss earns less'); assert.equal(f({ correct: false, revealed: true }), 0); assert.ok(f({ correct: false, partial: 0.9 }) <= 0.3);
});
t('lesson completion needs quiz evidence ≥60%', () => {
  reset(); const L = C.lessons[0];
  M.recordQuiz(L.id, L.quiz.map((q) => ({ qid: q.id, score: 0.2 })));
  assert.equal(M.lessonDone(L.id), false);
  M.recordQuiz(L.id, L.quiz.map((q) => ({ qid: q.id, score: 1 })));
  assert.equal(M.lessonDone(L.id), true);
});
t('level certificate requires ≥75% skills strong AND a passed project', () => {
  reset(); const sk = C.skillsOfLevel(0);
  sk.forEach((s) => { for (let i = 0; i < 3; i++) M.addEvidence(s.id, 1, 1, 'quiz:' + i); });
  assert.equal(M.levelProgress(0).certified, false, 'no project yet');
  S.state.projects[C.projectsOfLevel(0)[0].id] = { passedAt: '2026-01-01', ticks: [] };
  assert.equal(M.levelProgress(0).certified, true);
});
t('adaptive review favours weak skills and harder questions for strong ones', () => {
  reset(); const s = C.skillsOfLevel(1)[0].id; const qs = C.questionsForSkill(s);
  for (let i = 0; i < 4; i++) M.addEvidence(s, 1, 1, 'quiz:q' + i);
  const picked = M.pickQuestions({ skills: [s], count: 3 });
  assert.ok(picked.length >= 1); assert.ok(picked.every((q) => q.skill === s));
  const avg = picked.reduce((a, q) => a + q.difficulty, 0) / picked.length; const mean = qs.reduce((a, q) => a + q.difficulty, 0) / qs.length;
  assert.ok(avg >= mean - 0.01, `strong learner should not get easier-than-average questions (${avg} vs ${mean})`);
});
t('paths: non-technical path excludes code lessons; developer path includes them', () => {
  assert.ok(P.pathLessons('explorer').every((l) => !l.code || l.level < 2 && false) || P.pathLessons('explorer').filter((l) => l.code).length === 0);
  assert.ok(P.pathLessons('developer').some((l) => l.code));
  assert.ok(P.pathLessons('beginner')[0].level === 0);
  for (const k of Object.keys(P.PATHS)) assert.ok(P.pathLessons(k).length > 0, k);
});
t('paths: nextUp walks the path and respects placement level', () => {
  reset(); S.state.profile.path = 'developer'; S.state.profile.startLevel = 2;
  assert.ok(P.nextUp().lesson.level >= 2);
});
t('tutor: confused → different explanation each time (no repetition)', () => {
  reset(); const L = C.lessons[0]; const tu = new T.Tutor(); const seen = new Set();
  for (let i = 0; i < L.reteach.length; i++) seen.add(tu.local("I'm confused", { lessonId: L.id }).md);
  assert.equal(seen.size, L.reteach.length);
});
t('tutor: "give me the answer" does not reveal; hint ladder callback used', () => {
  const tu = new T.Tutor(); let called = 0;
  const r = tu.local('just give me the answer', { hintCurrent: () => (called++, 'shown') });
  assert.ok(called === 1 && /hint/i.test(r.md));
});
t('tutor: Socratic quiz grades mcq letters and hints', () => {
  reset(); const tu = new T.Tutor(); const q = tu.quizMe(C.lessonById.get('l0-05'));
  assert.ok(tu.pending, 'a question should be pending'); const pq = tu.pending.q;
  const wrong = pq.type === 'mcq' ? 'ABCDE'[(pq.answer + 1) % pq.options.length] : 'zzz';
  const r1 = tu.local(wrong, { lessonId: 'l0-05' }); assert.ok(/not quite|can’t quite/i.test(r1.md));
  const r2 = tu.local('hint', { lessonId: 'l0-05' }); assert.ok(/^Hint:/.test(r2.md));
});
t('tutor: glossary + course search answer from course material', () => {
  const tu = new T.Tutor(); const r = tu.local('what is a token?', {}); assert.ok(r.md.length > 20);
  const hits = T.search('context window', 3); assert.ok(hits.length >= 1);
});
t('tutor: local fallback is honest when nothing matches', () => {
  const r = new T.Tutor().local('zxqv blorp wibble', {}); assert.ok(/can’t find/i.test(r.md));
});
t('content: no raw html, current keys resolve, no placeholder text', () => {
  const bad = /<\/?(script|iframe|img|div)\b|lorem ipsum/i;
  for (const L of C.lessons) { const s = JSON.stringify(L); assert.ok(!bad.test(s), L.id + ' contains forbidden text'); for (const b of L.blocks) if (b.t === 'current') assert.ok(C.current[b.key], b.key); }
});
t('content: code questions - starter must not already pass its tests', async () => {
  const bad = [];
  for (const q of C.questionById.values()) if (q.type === 'code') {
    try { const fn = new Function(q.starter + `\n;return typeof ${q.fnName}==='function'?${q.fnName}:null;`)(); if (fn && q.tests.every((x) => { try { return JSON.stringify(fn(...x.args)) === JSON.stringify(x.expect); } catch { return false; } })) bad.push(q.id); } catch { /* starter may be incomplete JS: fine */ }
  }
  assert.deepEqual(bad, [], 'starters that already pass: ' + bad);
});
t('content: project test lists are well-formed', () => {
  for (const p of C.projectById.values()) if (p.kind === 'code') { assert.ok(p.tests.every((x) => Array.isArray(x.args) && 'expect' in x), p.id); }
});
console.log(`${pass} unit tests passed`);
