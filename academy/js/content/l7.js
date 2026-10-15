import lessonsA from './l7/lessons-a.js';
import lessonsB from './l7/lessons-b.js';
import projectsA from './l7/projects-a.js';
import projectsB from './l7/projects-b.js';
import extra from './l7/extra-questions.js';

export default {
  skills: [
    { id: 'l7.scoping', name: 'Scoping a product', desc: 'Choose a worthwhile problem and shrink it to a testable first version with explicit exclusions.' },
    { id: 'l7.spec-writing', name: 'Writing a spec', desc: 'Define users, outputs, rules, numeric quality bars and failure behaviour before building.' },
    { id: 'l7.eval-driven-dev', name: 'Evaluation-driven development', desc: 'Build test sets and scorers first and report results by category.' },
    { id: 'l7.iteration', name: 'Build-measure-iterate', desc: 'Change one thing at a time, re-measure, and watch for regressions.' },
    { id: 'l7.user-trust', name: 'Earning user trust', desc: 'Show sources, admit uncertainty, respect privacy and make correction easy.' },
    { id: 'l7.failure-ux', name: 'Failure UX', desc: 'Design what users see when the AI is wrong, unsure, slow or unavailable.' },
    { id: 'l7.cost-guardrails', name: 'Cost and guardrails', desc: 'Model per-request cost, set rate and spend limits, validate inputs and outputs, protect keys.' },
    { id: 'l7.agent-design', name: 'Agent and tool boundaries', desc: 'Bound agents with step caps, narrow tools, approvals and enforced permissions.' },
    { id: 'l7.retrieval-systems', name: 'Retrieval as a product component', desc: 'Measure retrieval separately, combine retrievers and handle no-answer cases.' },
    { id: 'l7.launch-readiness', name: 'Launch readiness', desc: 'Run a launch checklist with rollback, ownership and a small pilot.' },
    { id: 'l7.portfolio', name: 'Portfolio write-ups', desc: 'Present work with problem, tests, honest failures, limits and next steps.' },
    { id: 'l7.evidence-reporting', name: 'Evidence reporting', desc: 'Make claims that a reviewer can check with numbers, test sets and failure analysis.' },
  ],
  lessons: [...lessonsA, ...lessonsB].map((L) => ({ ...L, quiz: [...L.quiz, ...(extra[L.id] || [])] })),
  projects: [...projectsA, ...projectsB],
  glossary: [
    { term: 'Scope', def: 'The agreed boundary of what a product will and will not do for a specific user. Explicit exclusions make it testable.', level: 7, see: ['Spec'] },
    { term: 'Spec', def: 'A short document stating what a product must do in testable terms: users, inputs, outputs, rules, quality bar and failure behaviour.', level: 7, see: ['Scope', 'Quality bar'] },
    { term: 'Quality bar', def: 'The numeric standard a product must meet before launch, such as a minimum pass rate overall and per category.', level: 7, see: ['Eval set'] },
    { term: 'Eval set', def: 'A collection of test cases with expected results, used to measure a product repeatedly as it changes.', level: 7, see: ['Regression'] },
    { term: 'Evaluation-driven development', def: 'Building the tests that measure quality before or alongside the feature, then improving against the measurements.', level: 7, see: ['Eval set'] },
    { term: 'Regression', def: 'A case that used to work and now fails after a change. A rising average can hide regressions.', level: 7, see: ['Eval set'] },
    { term: 'Failure UX', def: 'The design of what users see and can do when the AI is wrong, unsure, slow or unavailable.', level: 7, see: ['Fallback'] },
    { term: 'Fallback', def: 'A simpler backup path, such as plain search or a human contact, used when the AI part fails.', level: 7, see: ['Failure UX'] },
    { term: 'Guardrail', def: 'A check or limit around the model, such as input screening, output validation, permissions or spend caps, that bounds the worst case.', level: 7, see: ['Rate limit'] },
    { term: 'Rate limit', def: 'A cap on how many requests a user or system may make in a period, protecting cost and stability.', level: 7, see: ['Guardrail'] },
    { term: 'Idempotent', def: 'Safe to run more than once with the same input: the second run does not repeat the action.', level: 7, see: ['Automation'] },
    { term: 'Least privilege', def: 'Giving a system only the permissions it needs, so a mistake or attack can do limited harm.', level: 7, see: ['Guardrail', 'Prompt injection'] },
    { term: 'Prompt injection', def: 'Instructions hidden in content a model reads, such as a web page or email, that try to make it misbehave. Treat such content as data.', level: 7, see: ['Least privilege'] },
    { term: 'Reciprocal rank fusion', def: 'A way to merge several ranked lists by giving each item 1 divided by (k plus its rank) from each list and summing.', level: 7, see: ['Hybrid search'] },
    { term: 'Hybrid search', def: 'Retrieval combining keyword matching and semantic similarity, then merging the results.', level: 7, see: ['Reciprocal rank fusion'] },
    { term: 'Recall at k', def: 'The share of questions whose correct passage appears in the top k retrieved results.', level: 7, see: ['Hybrid search'] },
    { term: 'Trace', def: 'A recorded sequence of an agent run: thoughts, tool calls, results and final answer, used for debugging and audit.', level: 7, see: ['Observability'] },
    { term: 'Observability', def: 'Logging and measuring a running system so you can see why it behaved as it did.', level: 7, see: ['Trace'] },
    { term: 'Pilot', def: 'A limited launch to a small audience with a feedback route, to learn from real use at low risk.', level: 7, see: ['Rollback'] },
    { term: 'Rollback', def: 'Quickly reverting or switching off a change or feature when it causes problems.', level: 7, see: ['Pilot'] },
    { term: 'Human-in-the-loop', def: 'A design where a person reviews or approves the AI output before an important action happens.', level: 7, see: ['Guardrail'] },
    { term: 'Word error rate', def: 'A measure of speech-to-text accuracy: the share of words substituted, missed or added compared with a reference transcript.', level: 7, see: ['Latency budget'] },
    { term: 'Latency budget', def: 'The time allowed for each stage of a pipeline so that the total response feels fast enough.', level: 7, see: ['Word error rate'] },
  ],
  current: {
    'l7-deploy-options': {
      title: 'Where people deploy AI apps (check before you choose)',
      asOf: '2026-10',
      md: "Most small AI products run as a **small server-side service** (so the model key stays private) behind a simple front end. Common hosting routes people use:\n\n- Static-site and serverless platforms that run small backend functions next to a front end (examples include Netlify and Vercel).\n- Container or app platforms where you deploy a small web service from a repository.\n- Your cloud provider's serverless functions or container services.\n\nWhatever you choose, the key requirements are the same: secrets held as environment variables on the server, a way to set a spending alert, logs you can read, and a quick way to roll back. Free tiers, time limits on functions and regions change often, so read the platform's current limits page and test a long model call before committing. This entry is likely to go stale: names, limits and features change.",
      sources: [
        { label: 'Netlify documentation', url: 'https://docs.netlify.com/' },
        { label: 'Vercel documentation', url: 'https://vercel.com/docs' },
      ],
    },
    'l7-stacks': {
      title: 'What stacks builders commonly use',
      asOf: '2026-10',
      md: "There is no single standard stack. A common starting pattern is: a front end (plain web pages or a JavaScript framework), a small back end in **Python or JavaScript/TypeScript**, a hosted model API through the provider's official SDK or plain HTTPS, and a simple store (a file, SQLite or a hosted Postgres database; add a vector index only when you need one).\n\nFor evaluation, many teams begin with their own small scripts (as in this level) and only adopt an evaluation or tracing framework once the case set and runs become large. Choose the simplest thing you can explain. Frameworks and libraries change quickly; check each one's maintenance activity and licence before relying on it. This entry is likely to go stale.",
      sources: [
        { label: 'OWASP GenAI Security Project', url: 'https://genai.owasp.org/' },
        { label: 'Netlify documentation', url: 'https://docs.netlify.com/' },
      ],
    },
    'l7-api-access-safely': {
      title: 'Getting API access safely',
      asOf: '2026-10',
      md: "Create an account with a model provider and generate an **API key** in its console. Provider help pages give the same core advice: never put the key in client-side code such as a browser or mobile app, route requests through your own backend, do not commit keys to source control, load keys from environment variables, use separate keys per person or project, and rotate them by creating a new key, updating the app and revoking the old one.\n\nBefore building, set a usage limit or budget alert in the provider's dashboard if one is offered, and check whether your age or organisation needs a parent, teacher or administrator to hold the account. Never paste a key into a chat, a screenshot or a public repository; if you do, revoke it immediately. Console layouts, limits and key features change, so follow the provider's current documentation. This entry is likely to go stale.",
      sources: [
        { label: 'OpenAI Help: Best Practices for API Key Safety', url: 'https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety' },
        { label: 'OWASP GenAI Security Project', url: 'https://genai.owasp.org/' },
      ],
    },
  },
};
