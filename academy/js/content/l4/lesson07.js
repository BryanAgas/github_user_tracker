import quiz from './q07.js';
const Q = (id, title) => { const q = quiz.find((x) => x.id === id); return { title, fnName: q.fnName, starter: q.starter, tests: q.tests, hints: q.hints }; };

export default {
  id: 'l4-07', title: 'Observability: traces, logs, metrics and replay', minutes: 22,
  hook: 'If you cannot see what the agent did, you cannot fix it, defend it, or explain it to a customer.',
  skills: ['l4.observability'], core: true, code: true, deep: false,
  blocks: [
    { t: 'p', md: "A traditional service fails with a stack trace. An LLM system usually fails by doing something plausible and wrong. **Observability** means recording enough about each run to answer: what did it see, what did it decide, which tools ran, what did it cost, how long did each part take?" },
    { t: 'h', text: 'Traces, logs, metrics' },
    { t: 'compare', cols: ['Signal', 'What it is', 'Answers'], rows: [
      ['Trace', 'A tree of timed **spans** for one request: each model call, tool call, retrieval', 'Where did the time go? What happened in what order?'],
      ['Log / event', 'Discrete records with context (inputs, outputs, decisions, errors)', 'Why did it say that? What was in the prompt?'],
      ['Metric', 'Aggregated numbers over time: latency percentiles, error rate, cost per request, tokens', 'Is it getting worse? Which segment?'] ] },
    { t: 'widget', w: 'flow', props: { title: 'One request as spans', height: 320,
      nodes: [
        { id: 'req', label: 'Request span (2.4 s)', x: 12, y: 50, kind: 'process', note: 'Root span. Carries trace id, user id (pseudonymous), release version.' },
        { id: 'rw', label: 'Query rewrite (0.3 s)', x: 38, y: 18, kind: 'model' },
        { id: 'ret', label: 'Retrieval (0.4 s)', x: 38, y: 50, kind: 'tool' },
        { id: 'llm', label: 'LLM call (1.5 s)', x: 38, y: 82, kind: 'model', note: 'Record model, tokens in/out, finish reason, cost, prompt version.' },
        { id: 'tool', label: 'Tool: lookup_order (0.2 s)', x: 72, y: 82, kind: 'tool' },
        { id: 'eval', label: 'Online checks / feedback', x: 88, y: 30, kind: 'output', note: 'Attach guardrail verdicts and user thumbs to the trace for later analysis.' } ],
      edges: [['req', 'rw'], ['req', 'ret'], ['req', 'llm'], ['llm', 'tool'], ['req', 'eval']] } },
    { t: 'h', text: 'What to record' },
    { t: 'list', items: [
      "Trace id, release version, prompt version, model identifier, key settings.",
      "Per model call: tokens in/out, latency, finish reason, cost, retries.",
      "Per tool call: name, validated arguments, result status, duration.",
      "Guardrail verdicts and which budget (if any) stopped the run.",
      "The full prompt and response, **under a retention and redaction policy**: these contain personal data. Redact before storing; restrict who can read; expire on schedule." ] },
    { t: 'callout', kind: 'warn', title: 'Logs are a data store', md: "Traces that hold raw conversations are personal data and often contain secrets users pasted in. Treat the trace store like a database: access control, redaction, retention limits, and deletion on request." },
    { t: 'p', md: "**Replay** means re-running a recorded input (with recorded tool results, or in a sandbox) against a new version of your system. It turns every production failure into a reproducible test case and feeds your golden set (lesson 5)." },
    { t: 'current', key: 'otel-genai' },
    { t: 'predict', q: "Users complain the agent is 'slow sometimes'. Average latency looks fine. What should you look at first?", options: ["The 95th/99th percentile latency and the slowest spans in the slow traces", "Average token count only", "The temperature", "Whether the model is large"], answer: 0, explain: "Averages hide tails. Percentiles tell you how bad the bad cases are; traces tell you which span is responsible.", skill: 'l4.observability' },
    { t: 'p', md: "Practise reading a trace: summarise a list of spans." },
    { t: 'widget', w: 'codeplay', props: Q('l4-07-q4', 'summariseTrace') },
    { t: 'try', prompt: "A customer disputes what the agent promised. What five fields would you want in the trace to answer them?", sample: "Trace id and timestamp; the prompt version and model used; the exact messages shown to the model (redacted); the tool calls with arguments and results; the final reply. With these you can say what the agent saw and why it said it, and replay it." }
  ],
  reteach: [
    { style: 'analogy', md: "A trace is a flight recorder. When something goes wrong you do not ask the pilot to remember; you play back the instruments. Metrics are the airline's dashboards across all flights; logs are the cockpit voice recorder." },
    { style: 'simple', md: "Write down every step each request takes and how long it took. Save the cost, the tools used, and whether anything failed. Then you can answer 'what happened?' for one case, and 'is it getting worse?' for all cases." },
    { style: 'technical', md: "Instrument with distributed-tracing spans carrying semantic attributes (model, tokens, finish reason), propagate trace context through tool calls, export aggregate metrics (p50/p95/p99, error and refusal rates, cost per request, by release), and store payloads separately under redaction and retention controls to enable deterministic replay." }
  ],
  quiz,
  takeaways: ['Traces show where time and decisions went; logs show why; metrics show trends.', 'Record model, prompt version, tokens, cost, tool calls and guardrail verdicts.', 'Trace data is personal data: redact, restrict, expire.', 'Replay turns failures into regression tests.'],
  apply: "For one request in your system, sketch the span tree you would want. Which span would you expect to be slowest, and why?"
};
