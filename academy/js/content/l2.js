import { skills, glossary, current } from './l2/meta.js';
import a from './l2/lessons-a.js';
import b from './l2/lessons-b.js';
import c from './l2/lessons-c.js';
import projects from './l2/projects.js';

export default {
  skills,
  lessons: [...a, ...b, ...c],
  projects,
  glossary,
  current
};
