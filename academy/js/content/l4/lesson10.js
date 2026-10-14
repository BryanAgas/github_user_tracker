export default {
  id: 'l4-10', title: 'Production deployment and security: threat-modelling LLM apps', minutes: 26,
  hook: 'Before launch, ask who could abuse this, what they would gain, and what you would see.',
  skills: ['l4.security'], core: true, code: true, deep: false,
  blocks: [
    { t: 'p', md: "Everything so far becomes a launch checklist here. **Threat modelling** is a structured way to ask: what are we protecting, who might attack or misuse it, how, and what stops them? You do it before launch and again when you add a tool or data source. This lesson is defensive and practical." },
    { t: 'h', text: 'Step 1: draw the system and mark trust boundaries' },
    { t: 'widget', w: 'flow', props: { title: 'Support agent: assets and trust boundaries', height: 350,
      nodes: [
        { id: 'user', label: 'Customer (untrusted)', x: 8, y: 50, kind: 'input', note: 'Anyone on the internet. Assume some are hostile.' },
        { id: 'gw', label: 'API gateway: auth, rate limit, quotas', x: 30, y: 50, kind: 'process', note: 'First control point for abuse and cost.' },
        { id: 'agent', label: 'Agent service', x: 52, y: 50, kind: 'model', note: 'Runs with a service identity of limited scope; carries the end user\'s identity into every tool call.' },
        { id: 'kb', label: 'Knowledge base (semi-trusted)', x: 74, y: 15, kind: 'store', note: 'Who can edit it? A poisoned document is an injection route.' },
        { id: 'db', label: 'Customer data (sensitive)', x: 80, y: 50, kind: 'store', note: 'Tenant isolation enforced here, not in the prompt.' },
        { id: 'pay', label: 'Payments (high impact)', x: 74, y: 85, kind: 'tool' },
        { id: 'vault', label: 'Secrets manager', x: 52, y: 85, kind: 'store', note: 'Keys never appear in prompts, logs or client code.' } ],
      edges: [['user', 'gw'], ['gw', 'agent'], ['agent', 'kb'], ['agent', 'db'], ['agent', 'pay'], ['vault', 'agent', 'short-lived credentials']] } },
    { t: 'h', text: 'Step 2: walk the risks' },
    { t: 'p', md: "The OWASP Top 10 for LLM Applications is a good checklist for step 2. Use it to prompt questions, not as a substitute for thinking about your own system." },
    { t: 'current', key: 'owasp-llm-top10' },
    { t: 'current', key: 'agent-tool-protocols' },
    { t: 'compare', cols: ['Risk', 'Support-agent example', 'Primary defences'], rows: [
      ['Prompt injection / excessive agency', 'Hidden text in a ticket tells the agent to refund', 'Least privilege, argument validation, approvals (lesson 6)'],
      ['Sensitive data disclosure', 'Agent reveals another customer\'s order', 'Tenant isolation in the data layer; per-user tokens; output scan for PII'],
      ['Secrets handling', 'API key pasted into a prompt template or logged', 'Secrets manager, short-lived scoped keys, secret scanning in CI and logs'],
      ['Supply chain', 'Compromised model file, plug-in or dependency', 'Pin versions, verify sources, review third-party tools and servers before connecting'],
      ['Poisoned data', 'Malicious text added to the knowledge base or memory', 'Write controls, provenance, review of ingested sources'],
      ['Unbounded consumption / abuse', 'Scripted flood of expensive long requests; wallet exhaustion', 'Per-user rate limits and quotas, max tokens, budgets, anomaly alerts'],
      ['System prompt leakage', 'Users extract your prompt', 'Assume it will leak: no secrets or authorisation logic inside it'] ] },
    { t: 'h', text: 'Operational controls' },
    { t: 'list', items: [
      "**Secrets**: server-side only; rotate; one key per environment and service; revoke fast.",
      "**Tenancy**: every query is scoped by tenant and user in code. Never rely on the model to filter other people's data.",
      "**PII**: minimise what you send to the model and store; redact in logs; know your retention and your provider's data terms.",
      "**Rate limiting and quotas**: per user, per tenant, per IP; limit tokens as well as request counts.",
      "**Release safety**: staged rollout (small percentage first), feature flags, an instant rollback path, and your eval gate in CI.",
      "**Incident readiness**: a kill switch for tools, an on-call route, a runbook, and a blameless postmortem habit." ] },
    { t: 'callout', kind: 'misconception', title: 'Misconception', md: "\"The provider handles security.\" Providers secure their platform. Your authorisation, tenant isolation, secrets, data retention and abuse controls are yours." },
    { t: 'predict', q: "A user scripts 50,000 requests with maximum-length prompts overnight from many accounts created by bot. Which control addresses the cost risk most directly?", options: ["Per-account and per-IP token quotas plus spend alerts and a global budget cap", "A longer system prompt", "Lower temperature", "Reranking"], answer: 0, explain: "The harm is consumption. Quotas and caps bound spend; alerts shorten detection. Account-creation friction (verification) addresses the bot angle.", skill: 'l4.security' },
    { t: 'p', md: "Implement a sliding-window rate limiter, the simplest honest form of this control." },
    { t: 'widget', w: 'codeplay', props: { title: 'rateLimit', fnName: 'rateLimit', starter: "function rateLimit(times, limit, windowMs) {\n  // times: ascending request timestamps (ms) for one user\n  // allow a request if fewer than `limit` ALLOWED requests in (t-windowMs, t]\n  // rejected requests do not count. return array of booleans\n}", tests: [{ args: [[0, 1, 2], 2, 1000], expect: [true, true, false] }], hints: ['Keep a list of allowed timestamps.', 'Drop those with t - ts >= windowMs.'] } },
    { t: 'try', prompt: "Take one row of the risk table and write: asset, attacker, attack, control, and how you would detect an attempt.", sample: "Asset: other customers' order data. Attacker: a customer probing order ids. Attack: 'show order 4418' (not theirs). Control: the lookup tool filters by the authenticated customer id in the SQL query; the model never sees unscoped data. Detection: alert on repeated denied lookups per account and log the denied ids." }
  ],
  reteach: [
    { style: 'analogy', md: "Think of securing a shop. You decide what is valuable (the till, the stock), who might want it, which doors they could use, and then fit locks, cameras and a policy. The shop assistant (the model) is friendly and helpful, so the till key is not left in their pocket." },
    { style: 'step-by-step', md: "1. Draw the parts and the lines where trust changes. 2. List what is valuable. 3. For each line, ask how it could be misused. 4. Add a control and a way to notice. 5. Test it. 6. Repeat whenever you add a tool, data source or tenant." },
    { style: 'technical', md: "Apply STRIDE or an equivalent over a data-flow diagram with trust boundaries; map LLM-specific threats (injection, excessive agency, data poisoning, leakage, unbounded consumption) to controls at the tool, data and gateway layers; verify with red-team cases in the eval suite; stage releases behind flags with rollback." }
  ],
  quiz: [
    { id: 'l4-10-q1', skill: 'l4.security', type: 'mcq', difficulty: 3, q: "Incident: Customer A asked 'what was in my last order?' and the agent described Customer B's order. The lookup tool took an order id chosen by the model and queried by id only. What is the root cause and fix?", options: ["Missing authorisation at the data layer; scope every lookup by the authenticated customer in code", "The model hallucinated; add 'only use the user's data' to the prompt", "The context window was too long", "Embedding mismatch"], answer: 0, wrong: { 1: "A prompt reminder is not an access control." }, hints: ["Who decided which order was fetched?", "Where must authorisation live?"], explain: "The tool trusted a model-chosen id. Authorisation belongs in the tool/data layer using the real user identity; then even a fooled model cannot cross tenants." },
    { id: 'l4-10-q2', skill: 'l4.security', type: 'multi', difficulty: 2, q: "Which belong in a launch readiness checklist for an LLM feature? Select all that apply.", options: ["Eval gate passing with must-pass safety cases", "Kill switch to disable tools quickly", "Secrets stored in the prompt template for convenience", "Per-user rate limits and a global spend cap", "Staged rollout with rollback"], answer: [0, 1, 3, 4], hints: ["One option is a classic mistake.", "Think prevention, containment and recovery."], explain: "Secrets in prompts can leak through extraction, logs and tracing. The others provide prevention, containment and recovery." },
    { id: 'l4-10-q3', skill: 'l4.security', type: 'order', difficulty: 2, q: "Order the threat-modelling steps.", items: ['Draw components and trust boundaries', 'Identify assets worth protecting', 'List how each boundary could be abused', 'Choose controls and detection', 'Test the controls and revisit on change'], hints: ["You cannot find abuse paths without a diagram.", "Testing and revisiting come last."], explain: "The diagram makes boundaries visible, assets set priorities, abuse cases drive controls, and testing proves them." },
    { id: 'l4-10-q4', skill: 'l4.security', type: 'code', difficulty: 3, q: "Write rateLimit(times, limit, windowMs). times are ascending request timestamps for one user. Request at time t is allowed if fewer than `limit` previously ALLOWED requests have timestamp > t - windowMs. Rejected requests do not count. Return an array of booleans.", fnName: 'rateLimit',
      starter: "function rateLimit(times, limit, windowMs) {\n  return times.map(() => true);\n}",
      tests: [
        { args: [[0, 1, 2], 2, 1000], expect: [true, true, false] },
        { args: [[0, 500, 999, 1000, 1500], 2, 1000], expect: [true, true, false, true, true] },
        { args: [[], 2, 1000], expect: [] },
        { args: [[5, 6], 0, 1000], expect: [false, false] },
        { args: [[0, 1000, 2000], 1, 1000], expect: [true, true, true] } ],
      solution: "function rateLimit(times, limit, windowMs) {\n  const allowed = [];\n  return times.map((t) => {\n    const recent = allowed.filter((a) => a > t - windowMs).length;\n    if (recent < limit) { allowed.push(t); return true; }\n    return false;\n  });\n}",
      hints: ["Only allowed requests are remembered.", "Window is exclusive at the old end: a > t - windowMs."], explain: "At t=1000 with window 1000, the request at t=0 is exactly one window old and no longer counts, so it is allowed; in test 2 the request at 999 is rejected because 0 and 500 are both still inside the window. Tracking only allowed requests stops a flood from extending its own ban in this variant; some systems choose the opposite deliberately." }
  ],
  takeaways: ['Threat-model with a diagram, assets, trust boundaries and abuse cases.', 'Authorisation, tenant isolation and secrets belong in code and infrastructure, not prompts.', 'Limit consumption per user and globally; alert on anomalies.', 'Ship in stages with a kill switch, rollback and a rehearsed incident path.'],
  apply: "Draw your system on one page, mark where untrusted text enters and where powerful actions leave. Those two lists are your top risks."
};
