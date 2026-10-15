// LEVEL 0 — AI Foundations. Content is split across l0/*.js.
import { skills, glossary, current, project } from './l0/meta.js';
import { lessonsA } from './l0/lessons-a.js';
import { lessonsB } from './l0/lessons-b.js';
import { quizzes } from './l0/quiz.js';

export default {
  skills,
  lessons: [...lessonsA, ...lessonsB].map((L) => ({ ...L, quiz: quizzes[L.id] })),
  projects: [project],
  glossary,
  current
};
