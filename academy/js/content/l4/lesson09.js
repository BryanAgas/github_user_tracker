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
    { t: 'p', md: "Write the decision function a retry wrapper would call after each failure." },
    { t: 'widget', w: 'codeplay', props: { title: 'nextAction', fnName: 'nextAction', starter: "function nextAction(err, attempt, policy) {\n  // err: {status, retryAfterMs?}; attempt: attempts made so far (1-based)\n  // policy: {maxAttempts, baseMs, capMs, fallback}\n  // return {action:'retry', delayMs} | {action:'fallback'} | {action:'fail'}\n}", tests: [{ args: [{ status: 429 }, 1, { maxAttempts: 3, baseMs: 200, capMs: 1000, fallback: true }], expect: { action: 'retry', delayMs: 200 } }], hints: ['Retryable: 0, 429, 500, 502, 503, 504.', 'delay = min(cap, base * 2^(attempt-1)); retryAfterMs can raise it.'] } },
    { t: 'try', prompt: "Design the failure behaviour for your support agent if the model provider is down for 20 minutes. What does the customer see?", sample: "Breaker opens after repeated 5xx/timeouts. For order-status questions the system answers from the order database with a templated reply (no model). For everything else it says: 'I can't reach my assistant right now; your message is saved and a person will reply by email within X hours', and creates a ticket with the transcript. Status is visible on a health page, and an alert pages the on-call engineer." }
  ],
  reteach: [
    { style: 'analogy', md: "Streaming is a restaurant bringing bread while the main course cooks: the meal takes just as long but the wait feels shorter. A circuit breaker is the fuse in your house: after a fault it cuts the circuit rather than letting the wiring burn." },
    { style: 'simple', md: "Show words as they arrive. Put a time limit on everything. If something fails for a good reason, try again after a short wait that grows; if it keeps failing, switch to a backup, and if that fails, tell the user honestly." },
    { style: 'technical', md: "Perceived latency is dominated by TTFT; total latency = TTFT + output_tokens / tps. Resilience: per-hop timeouts under a request deadline, bounded exponential backoff with full jitter on idempotent or keyed operations, health-based breakers (closed, open, half-open), bulkheads, and graded degradation paths." }
  ],
  quiz: [
    { id: 'l4-09-q1', skill: 'l4.reliability', type: 'mcq', difficulty: 3, q: "Incident: during a provider rate-limit episode, your retries (3 attempts, fixed 1 s delay) from 2,000 concurrent users kept the limit saturated for 40 minutes. Safest redesign?", options: ["Exponential backoff with jitter, honour retry-after, add a circuit breaker and a fallback path", "Retry 10 times instead of 3", "Remove timeouts so calls wait longer", "Move to a fixed 100 ms delay"], answer: 0, wrong: { 1: "More retries intensify the storm." }, hints: ["Synchronised retries at a fixed delay arrive together.", "What gives the provider breathing room?"], explain: "Backoff and jitter spread load; the provider's retry-after is the best hint; a breaker stops hammering; a fallback keeps users served." },
    { id: 'l4-09-q2', skill: 'l4.latency', type: 'mcq', difficulty: 2, q: "Users say the chat 'feels frozen' for 6 seconds before a 300-word answer appears all at once. Total generation time is acceptable. Best first change?", options: ["Stream the response so text appears as it is generated", "Use a bigger model", "Add more retries", "Lengthen the answer"], answer: 0, hints: ["The problem is the time to first visible output.", "Which option changes what the user sees first?"], explain: "Streaming improves perceived latency by showing progress immediately. Total completion time is unchanged, so also trim output length if the full time matters." },
    { id: 'l4-09-q3', skill: 'l4.reliability', type: 'multi', difficulty: 2, q: "Which errors are generally worth retrying? Select all that apply.", options: ["429 rate limited", "503 service unavailable", "400 invalid request (malformed arguments)", "Network timeout (for idempotent calls)"], answer: [0, 1, 3], hints: ["Retry only when trying again could produce a different result.", "A malformed request will be malformed again."], explain: "Transient conditions can clear. A 400 is deterministic; fix the request instead." },
    { id: 'l4-09-q4', skill: 'l4.reliability', type: 'code', difficulty: 3, q: "Write nextAction(err, attempt, policy). Retryable statuses: 0, 429, 500, 502, 503, 504. If not retryable return {action:'fail'}. If attempt >= policy.maxAttempts: return {action:'fallback'} when policy.fallback is true, else {action:'fail'}. Otherwise return {action:'retry', delayMs} where delayMs = max(min(capMs, baseMs * 2**(attempt-1)), err.retryAfterMs || 0).", fnName: 'nextAction',
      starter: "function nextAction(err, attempt, policy) {\n  return { action: 'fail' };\n}",
      tests: [
        { args: [{ status: 429 }, 1, { maxAttempts: 3, baseMs: 200, capMs: 1000, fallback: true }], expect: { action: 'retry', delayMs: 200 } },
        { args: [{ status: 503 }, 3, { maxAttempts: 4, baseMs: 200, capMs: 1000, fallback: true }], expect: { action: 'retry', delayMs: 800 } },
        { args: [{ status: 503 }, 4, { maxAttempts: 4, baseMs: 200, capMs: 1000, fallback: true }], expect: { action: 'fallback' } },
        { args: [{ status: 503 }, 4, { maxAttempts: 4, baseMs: 200, capMs: 1000, fallback: false }], expect: { action: 'fail' } },
        { args: [{ status: 400 }, 1, { maxAttempts: 4, baseMs: 200, capMs: 1000, fallback: true }], expect: { action: 'fail' } },
        { args: [{ status: 429, retryAfterMs: 5000 }, 1, { maxAttempts: 4, baseMs: 200, capMs: 1000, fallback: true }], expect: { action: 'retry', delayMs: 5000 } },
        { args: [{ status: 500 }, 6, { maxAttempts: 9, baseMs: 200, capMs: 1000, fallback: true }], expect: { action: 'retry', delayMs: 1000 } } ],
      solution: "function nextAction(err, attempt, policy) {\n  const retryable = [0, 429, 500, 502, 503, 504];\n  if (!retryable.includes(err.status)) return { action: 'fail' };\n  if (attempt >= policy.maxAttempts) return policy.fallback ? { action: 'fallback' } : { action: 'fail' };\n  const delay = Math.min(policy.capMs, policy.baseMs * Math.pow(2, attempt - 1));\n  return { action: 'retry', delayMs: Math.max(delay, err.retryAfterMs || 0) };\n}",
      hints: ["Non-retryable errors fail immediately, even if a fallback exists.", "Cap the exponential delay, but let the provider's retry-after exceed the cap."], explain: "Note a 400 does not trigger the fallback: the request itself is wrong, and sending it elsewhere wastes time. The cap bounds our own backoff, while a server's explicit retry-after is respected. Production code would also add random jitter to the delay." }
  ],
  takeaways: ['Streaming improves perceived latency; fewer sequential calls and shorter outputs improve real latency.', 'Every external call needs a timeout inside a request-wide deadline.', 'Retry transient errors with backoff and jitter; never blindly retry unsafe writes.', 'Breakers and fallbacks prevent retry storms and keep users served.'],
  apply: "Find every outbound call in a feature you own. Which have no timeout? Which would double-charge if retried?"
};
