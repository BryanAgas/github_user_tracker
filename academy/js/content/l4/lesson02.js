export default {
  id: 'l4-02', title: 'Orchestration and planning: graphs, retries and idempotency', minutes: 22,
  hook: 'A retry is a feature until it refunds the customer twice.',
  skills: ['l4.orchestration'], core: true, code: true, deep: false,
  blocks: [
    { t: 'p', md: "A single loop is fine for short tasks. Longer tasks, like 'investigate this complaint, check the policy, issue a refund if eligible, email the customer', benefit from structure. **Orchestration** is how you arrange model calls and tool calls into a controlled workflow." },
    { t: 'h', text: 'Three common shapes' },
    { t: 'compare', cols: ['Shape', 'How it works', 'Use when', 'Main risk'], rows: [
      ['Fixed workflow (chain)', 'You hard-code the steps; models fill in each step', 'The process is known and stable', 'Brittle when a case does not fit'],
      ['Planner / executor', 'One call writes a plan; separate calls or code execute each step', 'Tasks vary but steps are checkable', 'A bad plan is followed faithfully; re-plan needed'],
      ['Graph / state machine', 'Nodes (steps) and edges (allowed transitions, conditions)', 'You need branches, retries, human approval, resumption', 'More design effort up front'] ] },
    { t: 'p', md: "A rule of thumb: use the **least autonomy that solves the problem**. A fixed workflow with one model step is cheaper, faster and easier to test than a free-roaming agent." },
    { t: 'widget', w: 'flow', props: { title: 'Support workflow as a graph', height: 340,
      nodes: [
        { id: 'in', label: 'Classify request', x: 8, y: 50, kind: 'model', note: 'Cheap model call: refund, delivery, other.' },
        { id: 'look', label: 'Look up order', x: 30, y: 25, kind: 'tool', note: 'Read-only. Safe to retry any number of times.' },
        { id: 'pol', label: 'Check refund policy', x: 52, y: 25, kind: 'process', note: 'Deterministic code with the policy rules, not a model opinion.' },
        { id: 'appr', label: 'Human approval (over limit)', x: 52, y: 75, kind: 'human', note: 'Large amounts wait for a person.' },
        { id: 'ref', label: 'Issue refund', x: 76, y: 50, kind: 'tool', note: 'Writes money. Must be idempotent: carries an idempotency key.' },
        { id: 'rep', label: 'Draft reply', x: 94, y: 50, kind: 'model', note: 'Model writes the customer message from structured facts.' } ],
      edges: [['in', 'look'], ['look', 'pol'], ['pol', 'ref', 'eligible and small'], ['pol', 'appr', 'eligible and large'], ['appr', 'ref', 'approved'], ['ref', 'rep']],
      steps: [{ show: ['in', 'look', 'pol'], text: 'Read-only steps first: classify, look up, check policy.' }, { show: ['pol', 'appr', 'ref'], text: 'Branch on size: a human gates big refunds.' }, { show: ['ref', 'rep'], text: 'The write step is isolated and idempotent; the reply is generated last from facts.' }] } },
    { t: 'h', text: 'Retries and idempotency' },
    { t: 'p', md: "Networks fail halfway. A call that times out may or may not have happened. If you retry blindly, a non-repeatable action runs twice. An operation is **idempotent** if doing it twice has the same effect as doing it once. You get this by sending an **idempotency key** (a unique id for the intended action, such as `refund:order-4417:v1`) so the receiving system can recognise a duplicate and return the first result." },
    { t: 'code', lang: 'js', caption: 'Idempotent refund (display only).', src: `function issueRefund(orderId, amount, store) {
  const key = 'refund:' + orderId;          // same intent => same key
  if (store.has(key)) return store.get(key); // duplicate: return the first outcome
  const result = payments.refund(orderId, amount, { idempotencyKey: key });
  store.set(key, result);
  return result;
}` },
    { t: 'predict', q: "The refund call times out. The agent cannot tell whether the refund happened. Which is the safest behaviour?", options: ["Retry with the same idempotency key", "Retry with a fresh key so it definitely goes through", "Tell the customer it failed and stop", "Ask the model to decide"], answer: 0, explain: "The same key lets the payment system deduplicate: if the first call worked you get its result, if not it runs once. A fresh key risks a double refund.", skill: 'l4.orchestration' },
    { t: 'callout', kind: 'warn', title: 'Retry only what is safe', md: "Reads are safe to retry. Writes need idempotency keys or a check-then-act step. Never auto-retry an action with side effects (send email, charge card) without one." },
    { t: 'p', md: "Graphs also need a scheduler. Given which steps are done and each step's dependencies, which can run now? Write that." },
    { t: 'widget', w: 'codeplay', props: { title: 'nextRunnable', fnName: 'nextRunnable', starter: "function nextRunnable(graph, done) {\n  // graph: { stepId: [dependencyIds] }, done: [ids]\n  // return sorted ids that are not done and whose dependencies are all done\n}", tests: [{ args: [{ a: [], b: ['a'] }, []], expect: ['a'] }, { args: [{ a: [], b: ['a'] }, ['a']], expect: ['b'] }], hints: ['Filter keys by !done.includes and every dep in done.', 'Sort the result.'] } },
    { t: 'try', prompt: "For your own workflow, list each step and mark it read-only, idempotent-write, or non-idempotent write. What would you do for the third kind?", sample: "Read-only: lookups, searches. Idempotent write: refund with key, set status to 'resolved'. Non-idempotent: sending an email, posting a message. For those, record 'intent to send' with a unique id before sending, check the record before any retry, and accept at-least-once or at-most-once explicitly rather than by accident." }
  ],
  reteach: [
    { style: 'analogy', md: "Pressing a lift button five times does not bring five lifts: the button is idempotent. Pressing 'order pizza' five times does bring five pizzas. Idempotency keys turn a pizza button into a lift button." },
    { style: 'simple', md: "Break big jobs into small steps with a clear order. Let a model do the fuzzy steps, let code do the exact ones, and make any step that changes something safe to repeat." },
    { style: 'technical', md: "Model the workflow as a DAG or state machine with persisted state per node. Retries use exponential backoff for transient failures; side-effecting nodes take an idempotency key derived from the business intent so at-least-once delivery yields effectively-once outcomes." }
  ],
  quiz: [
    { id: 'l4-02-q1', skill: 'l4.orchestration', type: 'mcq', difficulty: 2, placement: true, q: "Postmortem: during a network blip a payment call timed out; the agent's retry logic called it again. Eleven customers were refunded twice. What is the root cause and safest fix?", options: ["The refund call was retried without an idempotency key; add a stable key per refund intent", "The model hallucinated the refund; use a larger model", "Timeouts were too long; shorten them so retries start sooner", "The retry limit was too high; remove retries entirely"], answer: 0, wrong: { 3: "Removing retries trades duplicate actions for lost ones; read calls still need them." }, hints: ["Was the first call actually successful?", "What lets the receiver recognise a repeat?"], explain: "A timeout leaves the outcome unknown. A stable key lets the payment system deduplicate, making retry safe. Bigger models or shorter timeouts do not address the duplicate write." },
    { id: 'l4-02-q2', skill: 'l4.orchestration', type: 'mcq', difficulty: 2, q: "A team's free-roaming agent handles password resets. It occasionally skips the identity check. Which redesign fits best?", options: ["A graph where the identity-check node is a mandatory edge before the reset node", "A longer system prompt emphasising identity checks", "A planner that writes the steps each time", "Give the agent more tools so it can verify itself"], answer: 0, hints: ["Which approach makes skipping impossible rather than unlikely?", "Consider what a planner can omit."], explain: "A required transition in a graph removes the possibility of skipping. A prompt or a planner can still omit the step." },
    { id: 'l4-02-q3', skill: 'l4.orchestration', type: 'multi', difficulty: 3, q: "Which operations are safe to retry automatically without extra protection? Select all that apply.", options: ["Fetching an order", "Charging a card", "Searching a knowledge base", "Sending a confirmation email", "Setting a ticket status to 'closed'"], answer: [0, 2, 4], hints: ["Safe = same result when repeated.", "Setting a value to X twice leaves it at X."], explain: "Reads and 'set to a value' writes are naturally idempotent. Charges and emails multiply their effect unless protected by a key or a sent-already check." },
    { id: 'l4-02-q4', skill: 'l4.orchestration', type: 'code', difficulty: 2, q: "Write nextRunnable(graph, done): graph maps step id to an array of dependency ids; done is an array of finished ids. Return the sorted ids that are not done and whose dependencies are all done.", fnName: 'nextRunnable',
      starter: "function nextRunnable(graph, done) {\n  return [];\n}",
      tests: [
        { args: [{ a: [], b: ['a'], c: ['a'], d: ['b', 'c'] }, []], expect: ['a'] },
        { args: [{ a: [], b: ['a'], c: ['a'], d: ['b', 'c'] }, ['a']], expect: ['b', 'c'] },
        { args: [{ a: [], b: ['a'], c: ['a'], d: ['b', 'c'] }, ['a', 'b']], expect: ['c'] },
        { args: [{ a: [], b: ['a'] }, ['a', 'b']], expect: [] },
        { args: [{}, []], expect: [] } ],
      solution: "function nextRunnable(graph, done) {\n  return Object.keys(graph)\n    .filter(id => !done.includes(id) && graph[id].every(d => done.includes(d)))\n    .sort();\n}",
      hints: ["Object.keys(graph) then filter.", "every() on an empty array is true, which handles steps with no dependencies."], explain: "A step is runnable when it is unfinished and all its dependencies are finished. Steps with no dependencies are runnable immediately; returning several ids means they could run in parallel." }
  ],
  takeaways: ['Use the least autonomy that solves the task: chain, planner/executor, then graph.', 'Make mandatory steps mandatory by structure, not by instruction.', 'A timeout means "unknown outcome"; retry writes only with an idempotency key.', 'Gate high-impact steps with approval nodes.'],
  apply: "List the side-effecting actions in a workflow you know. For each, answer: what happens if it runs twice?"
};
