import { skills, glossary, current, projects } from './l6/meta.js';
import l1 from './l6/lessons1.js';
import l2 from './l6/lessons2.js';
import l3 from './l6/lessons3.js';

export default {
  skills,
  lessons: [...l1, ...l2, ...l3],
  projects,
  glossary,
  current
};
