// LEVEL 0 — AI Foundations. Content is split across l0/*.js.
import { skills, glossary, current, project } from './l0/meta.js';
import { lessonsA } from './l0/lessons-a.js';
import { lessonsB } from './l0/lessons-b.js';

export default {
  skills,
  lessons: [...lessonsA, ...lessonsB],
  projects: [project],
  glossary,
  current
};
