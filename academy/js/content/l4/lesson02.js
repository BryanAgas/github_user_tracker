import quiz from './q02.js';
const Q = (id, title) => { const q = quiz.find((x) => x.id === id); return { title, fnName: q.fnName, starter: q.starter, tests: q.tests, hints: q.hints }; };

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
    { t: 'p', md: "Networks fail halfway. A call that times out may or may not have happened. If you retry blindly, a non-repeatable action runs twice. An operation is **idempotent** if doing it twice has the same effect as doing it once. You get this by sending an **idempotency key** (a unique id for the intended action, built from everything that defines it, such as `refund:4417:500:1` for order 4417, 500 cents, first refund) so the receiving system can recognise a duplicate and return the first result." },
    { t: 'code', lang: 'js', caption: 'Idempotent refund (display only). The key covers the whole intent, and the provider, not your process, does the de-duplication.', src: `async function issueRefund(orderId, amountCents, refundSeq) {
  // same intent => same key; a different amount or a second partial refund => a different key
  const key = ['refund', orderId, amountCents, refundSeq].join(':');
  // no local "have I seen this?" check: two workers could both pass it (check-then-act race).
  // The payment provider stores the key atomically and returns the first result for repeats.
  return payments.refund({ orderId, amountCents }, { headers: { 'Idempotency-Key': key } });
}` },
    { t: 'p', md: "Two details catch people out. First, do the de-duplication in one atomic place (the provider, or a database unique constraint), not in a read-then-write check in your own code, because two workers can both pass the check. Second, build the key from the whole intent: a key made from the order id alone would block a legitimate second partial refund, and many providers reject a reused key that arrives with different parameters." },
    { t: 'widget', w: 'codeplay', props: Q('l4-02-q5', 'idempotencyKey') },
    { t: 'predict', q: "The refund call times out. The agent cannot tell whether the refund happened. Which is the safest behaviour?", options: ["Retry with the same idempotency key", "Retry with a fresh key so it definitely goes through", "Tell the customer it failed and stop", "Ask the model to decide"], answer: 0, explain: "The same key lets the payment system deduplicate: if the first call worked you get its result, if not it runs once. A fresh key risks a double refund.", skill: 'l4.orchestration' },
    { t: 'callout', kind: 'warn', title: 'Retry only what is safe', md: "Reads are safe to retry. Writes need idempotency keys or a check-then-act step. Never auto-retry an action with side effects (send email, charge card) without one." },
    { t: 'p', md: "Graphs also need a scheduler. Given which steps are done and each step's dependencies, which can run now? Write that." },
    { t: 'widget', w: 'codeplay', props: Q('l4-02-q4', 'nextRunnable') },
    { t: 'try', prompt: "For your own workflow, list each step and mark it read-only, idempotent-write, or non-idempotent write. What would you do for the third kind?", sample: "Read-only: lookups, searches. Idempotent write: refund with key, set status to 'resolved'. Non-idempotent: sending an email, posting a message. For those, record 'intent to send' with a unique id before sending, check the record before any retry, and accept at-least-once or at-most-once explicitly rather than by accident." }
  ],
  reteach: [
    { style: 'analogy', md: "Pressing a lift button five times does not bring five lifts: the button is idempotent. Pressing 'order pizza' five times does bring five pizzas. Idempotency keys turn a pizza button into a lift button." },
    { style: 'simple', md: "Break big jobs into small steps with a clear order. Let a model do the fuzzy steps, let code do the exact ones, and make any step that changes something safe to repeat." },
    { style: 'technical', md: "Model the workflow as a DAG or state machine with persisted state per node. Retries use exponential backoff for transient failures; side-effecting nodes take an idempotency key derived from the business intent so at-least-once delivery yields effectively-once outcomes." }
  ],
  quiz,
  takeaways: ['Use the least autonomy that solves the task: chain, planner/executor, then graph.', 'Make mandatory steps mandatory by structure, not by instruction.', 'A timeout means "unknown outcome"; retry writes only with an idempotency key.', 'Gate high-impact steps with approval nodes.'],
  apply: "List the side-effecting actions in a workflow you know. For each, answer: what happens if it runs twice?"
};
