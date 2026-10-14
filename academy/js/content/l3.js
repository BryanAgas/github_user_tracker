import { skills, glossary, current, projects } from './l3/meta.js';
import { lessonsA } from './l3/a.js';
import { lessonsB } from './l3/b.js';
import { lessonsC } from './l3/c.js';

export default {
  skills,
  lessons: [...lessonsA, ...lessonsB, ...lessonsC],
  projects,
  glossary,
  current
};
