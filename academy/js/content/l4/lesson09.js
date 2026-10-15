import quiz from './q09.js';
const Q = (id, title) => { const q = quiz.find((x) => x.id === id); return { title, fnName: q.fnName, starter: q.starter, tests: q.tests, hints: q.hints }; };

export default {
  id: 'l4-09', title: 'Latency and reliability: streaming, timeouts, fallbacks, breakers', minutes: 24,
  hook: 'Users forgive slow if it feels alive, and forgive failure if it fails gracefully; they forgive neither a frozen screen nor a retry storm.',
  skills: ['l4.latency', 'l4.reliability'], core: true, code: true, deep: false,
  blocks: [
    { t: 'p', md: "LLM calls are slow compared with ordinary API calls and they depend on a third party. Two quantities matter: **time to first token** (how long before anything appears) and **tokens per second** (how fast the rest arrives). **Streaming** shows tokens as they are produced, which changes how long it feels, though not how long the full answer takes." },
    { t: 'widget', w: 'streaming', props: {}, caption: 'Try this: raise time-to-first-token and see which setting hurts perceived latency more, then slow the token rate.' },
    { t: 'h', text: 'Cutting real latency' },
    { t: 'list', items: [
      "**Fewer sequential calls**: parallelise independent tool calls and retrievals.",
      "**Shorter outputs**: output tokens are generated one at a time, so length is time.",
      "**Smaller models** for easy steps; prompt caching shortens processing of a long stable prefix.",
      "**Do work earlier**: prefetch likely context, pre-compute embeddings, warm connections.",
      "**Budget the whole request**: allocate a deadline (say 8 s) and pass the remaining time down to each step." ] },
    { t: 'h', text: 'Reliability patterns' },
    { t: 'compare', cols: ['Pattern', 'What it does', 'Watch out for'], rows: [
      ['Timeout', 'Stops waiting after a fixed time', 'Set per step and for the whole request; a missing timeout is an outage waiting'],
      ['Retry with backoff and jitter', 'Re-attempts transient errors, waiting longer each time with random spread', 'Only for safe or idempotent calls; cap attempts; honour a provider\'s retry-after hint'],
      ['Fallback', 'Switch to a second model, provider, cached answer or a plain message', 'The fallback may behave differently; evaluate it too'],
      ['Circuit breaker', 'After repeated failures, stop calling for a cool-down, then probe', 'Without it, retries pile onto a struggling service'],
      ['Load shedding / queue', 'Reject or defer work when overloaded', 'Protect critical traffic first'] ] },
    { t: 'callout', kind: 'why', title: 'Why jitter', md: "If a thousand clients all retry exactly 1 s, 2 s, 4 s after a failure, they hit the recovering service in synchronised waves. Random spread (jitter) de-synchronises them." },
    { t: 'widget', w: 'flow', props: { title: 'A resilient model call', height: 320,
      nodes: [
        { id: 'req', label: 'Request with deadline', x: 8, y: 50, kind: 'input' },
        { id: 'cb', label: 'Circuit breaker', x: 30, y: 50, kind: 'process', note: 'Open = skip the primary and go straight to the fallback.' },
        { id: 'pri', label: 'Primary model (timeout)', x: 54, y: 22, kind: 'model' },
        { id: 'retry', label: 'Retry with backoff + jitter', x: 78, y: 22, kind: 'process', note: 'Only transient errors (rate limit, overload, timeout).' },
        { id: 'fb', label: 'Fallback model / cached answer', x: 54, y: 78, kind: 'model' },
        { id: 'deg', label: 'Graceful message + handover', x: 80, y: 78, kind: 'output', note: 'When everything fails, say so plainly and create a ticket.' } ],
      edges: [['req', 'cb'], ['cb', 'pri', 'closed'], ['pri', 'retry', 'transient error'], ['cb', 'fb', 'open'], ['retry', 'fb', 'attempts exhausted'], ['fb', 'deg', 'also fails']] } },
    { t: 'predict', q: "A provider has a 10-minute partial outage returning 503. Your service retries each failed call 5 times with no breaker. What happens?", options: ["Request volume to the provider multiplies about 5x and your threads/queues fill, so your own service degrades too", "Nothing; retries always help", "The provider recovers faster because of the extra traffic", "Costs fall"], answer: 0, explain: "Retry storms amplify load and exhaust your own resources. A breaker fails fast and gives the dependency room to recover.", skill: 'l4.reliability' },
    { t: 'h', text: 'Cancelling for real' },
    { t: 'p', md: "A timeout that only stops *waiting* leaves the call running and holding resources. Pass an abort signal into the call so it is cancelled, and give each call a slice of the request's remaining time." },
    { t: 'code', lang: 'js', caption: 'Per-call timeout inside a request deadline (display only).', src: `async function callWithDeadline(fn, deadlineAt, perCallMs) {
  const remaining = deadlineAt - Date.now();
  if (remaining <= 0) throw new Error('deadline_exceeded');
  const signal = AbortSignal.timeout(Math.min(remaining, perCallMs));
  try {
    return await fn({ signal });              // fn must pass the signal to fetch/SDK
  } catch (err) {
    if (signal.aborted) throw new Error('timeout');   // map to a structured error
    throw err;
  }
}` },
    { t: 'p', md: "Splitting the deadline between steps is plain arithmetic you can test." },
    { t: 'widget', w: 'codeplay', props: Q('l4-09-q6', 'allocateDeadline') },
    { t: 'p', md: "Write the decision function a retry wrapper would call after each failure." },
    { t: 'widget', w: 'codeplay', props: Q('l4-09-q4', 'nextAction') },
    { t: 'p', md: "A circuit breaker is a small state machine: closed (calls flow), open (calls are skipped for a cool-down), and half-open (one probe decides). Build it as a pure function over a list of attempts so you can test every transition." },
    { t: 'widget', w: 'codeplay', props: Q('l4-09-q5', 'breakerRun') },
    { t: 'try', prompt: "Design the failure behaviour for your support agent if the model provider is down for 20 minutes. What does the customer see?", sample: "Breaker opens after repeated 5xx/timeouts. For order-status questions the system answers from the order database with a templated reply (no model). For everything else it says: 'I can't reach my assistant right now; your message is saved and a person will reply by email within X hours', and creates a ticket with the transcript. Status is visible on a health page, and an alert pages the on-call engineer." }
  ],
  reteach: [
    { style: 'analogy', md: "Streaming is a restaurant bringing bread while the main course cooks: the meal takes just as long but the wait feels shorter. A circuit breaker is the fuse in your house: after a fault it cuts the circuit rather than letting the wiring burn." },
    { style: 'simple', md: "Show words as they arrive. Put a time limit on everything. If something fails for a good reason, try again after a short wait that grows; if it keeps failing, switch to a backup, and if that fails, tell the user honestly." },
    { style: 'technical', md: "Perceived latency is dominated by TTFT; total latency = TTFT + output_tokens / tps. Resilience: per-hop timeouts under a request deadline, bounded exponential backoff with full jitter on idempotent or keyed operations, health-based breakers (closed, open, half-open), bulkheads, and graded degradation paths." }
  ],
  quiz,
  takeaways: ['Streaming improves perceived latency; fewer sequential calls and shorter outputs improve real latency.', 'Every external call needs a timeout inside a request-wide deadline.', 'Retry transient errors with backoff and jitter; never blindly retry unsafe writes.', 'Breakers and fallbacks prevent retry storms and keep users served.'],
  apply: "Find every outbound call in a feature you own. Which have no timeout? Which would double-charge if retried?"
};
