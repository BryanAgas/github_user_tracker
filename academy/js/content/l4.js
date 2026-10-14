import l01 from './l4/lesson01.js';
import l02 from './l4/lesson02.js';
import l03 from './l4/lesson03.js';
import l04 from './l4/lesson04.js';
import l05 from './l4/lesson05.js';
import l06 from './l4/lesson06.js';
import l07 from './l4/lesson07.js';
import l08 from './l4/lesson08.js';
import l09 from './l4/lesson09.js';
import l10 from './l4/lesson10.js';
import { projects } from './l4/project.js';
import { glossary } from './l4/glossary.js';
import { current } from './l4/current.js';

export default {
  skills: [
    { id: 'l4.agent-loop', name: 'Agent architecture', desc: 'Design a bounded agent loop with state, tools, stop conditions and budgets.' },
    { id: 'l4.orchestration', name: 'Orchestration and idempotency', desc: 'Structure workflows as graphs and make retried actions safe.' },
    { id: 'l4.memory', name: 'Memory systems', desc: 'Separate working, episodic and semantic memory and govern what is written.' },
    { id: 'l4.retrieval', name: 'Retrieval strategies', desc: 'Combine hybrid search, reranking and query rewriting, and measure retrieval alone.' },
    { id: 'l4.evals', name: 'Evaluation frameworks', desc: 'Build golden sets, graders and regression gates.' },
    { id: 'l4.guardrails', name: 'Guardrails', desc: 'Layer input, output and policy validation around a model.' },
    { id: 'l4.injection', name: 'Prompt injection and tool permissions', desc: 'Limit the blast radius of injected instructions with least-privilege tools.' },
    { id: 'l4.observability', name: 'Observability', desc: 'Use traces, logs, metrics and replay to understand and fix LLM behaviour.' },
    { id: 'l4.cost', name: 'Cost and caching', desc: 'Model, route, cache and trim to control the bill safely.' },
    { id: 'l4.latency', name: 'Latency', desc: 'Reduce real and perceived latency with streaming, parallelism and shorter outputs.' },
    { id: 'l4.reliability', name: 'Reliability patterns', desc: 'Apply timeouts, backoff with jitter, fallbacks and circuit breakers.' },
    { id: 'l4.security', name: 'Deployment and security', desc: 'Threat-model an LLM app and apply tenancy, secrets, PII and abuse controls.' }
  ],
  lessons: [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10],
  projects,
  glossary,
  current
};
