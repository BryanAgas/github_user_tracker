export default {
  id: 'l4-01', title: 'Agent architecture: loops, state, tools and budgets', minutes: 22,
  hook: 'An agent is a loop with a model inside it, and every production incident starts with a loop that had no way to stop.',
  skills: ['l4.agent-loop'], core: true, code: true, deep: false,
  blocks: [
    { t: 'p', md: "Welcome to Level 4. At Level 3 you shipped a feature: one prompt in, one answer out, perhaps a retrieval step or a single tool call. That works until real users arrive. Now the questions change: what happens when it fails at 3am, when a user attacks it, when the bill doubles, when it is slow? This level is about **reliability, safety, observability, cost and speed**." },
    { t: 'p', md: "Our running example for the whole level is a **customer-support agent** for an online shop. It reads a customer message, looks up the order, may issue a refund, and replies. Simple to describe; plenty of ways to hurt the business." },
    { t: 'h', text: 'The agent loop' },
    { t: 'p', md: "An **agent** is a program that repeatedly asks a model what to do next, runs the action it chose (a **tool call**), feeds the result back, and repeats until the model gives a final answer. The model decides; your code executes. That split is the whole safety story: the model proposes, your code disposes." },
    { t: 'widget', w: 'flow', props: { title: 'The agent loop (click a node for notes)', height: 320,
      nodes: [
        { id: 'user', label: 'User request', x: 8, y: 50, kind: 'input', note: 'Untrusted input. Treat it as data, never as instructions to your code.' },
        { id: 'state', label: 'State: messages, plan, counters', x: 34, y: 18, kind: 'store', note: 'Everything the loop knows. You own it, the model does not. Counters (steps, tokens, cost, time) live here.' },
        { id: 'model', label: 'Model decides next action', x: 40, y: 50, kind: 'model', note: 'Returns either a tool call or a final answer. Its output is a proposal, not a command.' },
        { id: 'guard', label: 'Policy check and budget check', x: 66, y: 18, kind: 'process', note: 'Deterministic code: is this tool allowed, are arguments valid, is there budget left?' },
        { id: 'tool', label: 'Run tool', x: 68, y: 78, kind: 'tool', note: 'Has a timeout and returns a structured result or a structured error.' },
        { id: 'final', label: 'Final answer', x: 92, y: 50, kind: 'output', note: 'The loop ends here, or when a budget stops it.' } ],
      edges: [['user', 'state'], ['state', 'model', 'context'], ['model', 'guard', 'proposed action'], ['guard', 'tool', 'if allowed'], ['tool', 'state', 'observation'], ['model', 'final', 'done']],
      steps: [
        { show: ['user', 'state'], text: 'The request goes into state, which you own.' },
        { show: ['user', 'state', 'model'], text: 'The model reads the state and proposes an action.' },
        { show: ['state', 'model', 'guard', 'tool'], text: 'Your code validates the proposal, then runs the tool.' },
        { show: ['state', 'model', 'guard', 'tool'], text: 'The observation returns to state and the loop goes round again.' },
        { show: ['model', 'final'], text: 'Eventually the model answers, or a budget halts the loop.' } ] } },
    { t: 'h', text: 'Watch a scripted run' },
    { t: 'widget', w: 'agentloop', props: { scenario: 'refund' }, caption: 'Try this: switch on "inject tool failure", then "require human approval", and notice what the agent does differently.' },
    { t: 'h', text: 'Four things the loop must own' },
    { t: 'list', items: [
      "**State**: messages, a plan if you use one, and counters. Keep it in your code, serialisable, so you can pause, resume and replay a run.",
      "**Tools**: each with a narrow purpose, a validated argument schema, a timeout, and a structured error. A tool that can do anything is a vulnerability.",
      "**Stop conditions**: a final answer, a step limit, a cost limit, a time limit, and loop detection (the same call with the same arguments repeated).",
      "**Budgets**: hard numeric ceilings enforced by your code, never by asking the model nicely." ] },
    { t: 'predict', q: "A support agent calls `lookup_order` with order 4417, gets a 'timeout' error, then calls `lookup_order` with order 4417 again, and again, forever. There is a system prompt line: 'Do not repeat failed calls.' What is the most reliable fix?", options: ["Make the instruction louder: 'NEVER repeat failed calls'", "Add a deterministic repeat counter and max-steps limit in the loop code, returning a graceful handover when hit", "Switch to a bigger model", "Lower the temperature to zero"], answer: 1, explain: "Instructions are requests, not guarantees. A counter in your own code is guaranteed to fire. Prompts and model choice can reduce the frequency of loops but cannot bound them.", skill: 'l4.agent-loop' },
    { t: 'callout', kind: 'misconception', title: 'Misconception', md: "\"The system prompt controls the agent.\" It influences it. Anything that must *never* happen (spending over a limit, calling a forbidden tool, running forever) has to be enforced by code outside the model." },
    { t: 'code', lang: 'js', caption: 'The skeleton of a safe loop (display only; production code would be async).', src: `function runAgent(request, tools, budget, callModel) {
  const state = { messages: [request], steps: 0, costUsd: 0, startedAt: Date.now(), seen: {} };
  while (true) {
    const stop = checkBudget(state, budget);      // deterministic, runs first
    if (stop) return handover(state, stop);       // graceful exit with a reason
    const action = callModel(state.messages);     // model proposes
    state.steps += 1;
    if (action.type === 'final') return action.text;
    const key = action.tool + JSON.stringify(action.args);
    state.seen[key] = (state.seen[key] || 0) + 1; // loop detection
    const verdict = policyCheck(action, tools);   // is the tool allowed? args valid?
    const result = verdict.ok ? runTool(tools[action.tool], action.args) : { error: verdict.reason };
    state.messages.push({ role: 'tool', content: result });
  }
}` },
    { t: 'try', prompt: "Your support agent can call `lookup_order`, `issue_refund` and `send_email`. Write the budget you would set (steps, cost, time, repeats) and what the agent should do when each limit is hit.", sample: "Example: max 8 steps, max 0.20 in model cost per conversation, 30 seconds wall-clock, and no more than 2 identical tool calls. When any limit hits, stop calling tools, tell the customer plainly that a human will follow up, and create a ticket containing the transcript so far. The numbers matter less than three properties: they are enforced in code, they are logged, and hitting one produces a handover rather than a silent failure." },
    { t: 'p', md: "Your turn to write the stop logic. Precedence matters: a finished answer always wins, then a detected loop, then the budgets." },
    { t: 'widget', w: 'codeplay', props: { title: 'Write agentStop', fnName: 'agentStop', starter: "function agentStop(state, budget) {\n  // return 'final' | 'loop_detected' | 'max_steps' | 'max_cost' | 'timeout' | 'continue'\n}", tests: [{ args: [{ steps: 2, costUsd: 0.01, elapsedMs: 100, lastAction: 'final', repeatCount: 0 }, { maxSteps: 5, maxCostUsd: 1, maxMs: 1000, maxRepeats: 3 }], expect: 'final' }, { args: [{ steps: 2, costUsd: 0.01, elapsedMs: 100, lastAction: 'tool', repeatCount: 0 }, { maxSteps: 5, maxCostUsd: 1, maxMs: 1000, maxRepeats: 3 }], expect: 'continue' }], hints: ['Check lastAction === "final" first.', 'Use >= for limits.'] } },
    { t: 'callout', kind: 'why', title: 'Why budgets are per request, not per day', md: "A daily spend alarm tells you about an incident after the money has gone. A per-conversation ceiling stops one runaway loop before it costs more than a few pence. Do both." }
  ],
  reteach: [
    { style: 'analogy', md: "Think of a taxi with a meter and a driver who takes instructions from a passenger. The passenger (the model) says where to turn; the taxi company (your code) decides whether the route is legal, and has a hard rule: the trip ends at a fixed fare or time, whatever the passenger says." },
    { style: 'step-by-step', md: "1. Put the request in state. 2. Check budgets. 3. Ask the model for the next action. 4. Validate the action. 5. Run the tool with a timeout. 6. Add the result to state. 7. Go to 2. The loop ends on a final answer or any failed check at step 2." },
    { style: 'technical', md: "An agent is a bounded state machine whose transition function is a stochastic policy (the model). Safety properties (termination, authorisation, spend bounds) must be invariants enforced by the deterministic harness, because the policy offers no guarantee about any of them." }
  ],
  quiz: [
    { id: 'l4-01-q1', skill: 'l4.agent-loop', type: 'mcq', difficulty: 2, q: "An overnight batch of 200 support tickets produced a 40x normal bill. Logs show one ticket where the agent called `search_kb` with slightly reworded queries 900 times. Which control would have contained the damage most reliably?", options: ["A per-run step and cost ceiling enforced in the loop code", "A system-prompt instruction to stop after five searches", "A larger context window", "Retrying the model call on failure"], answer: 0, wrong: { 1: "The model had the instruction available and ignored it; prompts do not bound behaviour.", 3: "Retries add calls rather than limit them." }, hints: ["Which control cannot be talked out of firing?", "Note that the queries were reworded, so exact-repeat detection alone might miss it."], explain: "A step/cost ceiling in code is a guarantee. Prompt instructions are probabilistic. Because the queries were reworded, exact-duplicate detection would also have missed this, which is why a plain step limit is the backstop." },
    { id: 'l4-01-q2', skill: 'l4.agent-loop', type: 'multi', difficulty: 2, q: "Which belong in the deterministic harness rather than being left to the model? Select all that apply.", options: ["Maximum number of steps", "Deciding which order number the customer means from an ambiguous message", "Checking a tool name is on the allow-list", "Timeout on each tool call", "Wording of the apology"], answer: [0, 2, 3], hints: ["Ask: if this fails, is the harm bounded by code or by hope?", "Judgement about language is the model's job; limits and permissions are code's."], explain: "Limits, permissions and timeouts are safety invariants. Interpreting a message and wording a reply are what the model is good at, and a mistake there is recoverable." },
    { id: 'l4-01-q3', skill: 'l4.agent-loop', type: 'order', difficulty: 1, q: "Put one iteration of a safe agent loop in order.", items: ['Check budgets', 'Model proposes an action', 'Validate action against policy', 'Run the tool with a timeout', 'Append the observation to state'], hints: ["The cheapest, most deterministic check comes first.", "Validation happens between proposing and running."], explain: "Budgets are checked first so a spent budget never costs another model call. Validation must precede execution, since the proposal is untrusted." },
    { id: 'l4-01-q4', skill: 'l4.agent-loop', type: 'code', difficulty: 2, q: "Write agentStop(state, budget). Return 'final' if state.lastAction is 'final'; else 'loop_detected' if repeatCount >= maxRepeats; else 'max_steps' if steps >= maxSteps; else 'max_cost' if costUsd >= maxCostUsd; else 'timeout' if elapsedMs >= maxMs; else 'continue'.", fnName: 'agentStop',
      starter: "function agentStop(state, budget) {\n  return 'continue';\n}",
      tests: [
        { args: [{ steps: 1, costUsd: 0, elapsedMs: 0, lastAction: 'final', repeatCount: 9 }, { maxSteps: 5, maxCostUsd: 1, maxMs: 1000, maxRepeats: 3 }], expect: 'final' },
        { args: [{ steps: 1, costUsd: 0, elapsedMs: 0, lastAction: 'tool', repeatCount: 3 }, { maxSteps: 5, maxCostUsd: 1, maxMs: 1000, maxRepeats: 3 }], expect: 'loop_detected' },
        { args: [{ steps: 5, costUsd: 0, elapsedMs: 0, lastAction: 'tool', repeatCount: 0 }, { maxSteps: 5, maxCostUsd: 1, maxMs: 1000, maxRepeats: 3 }], expect: 'max_steps' },
        { args: [{ steps: 1, costUsd: 1, elapsedMs: 0, lastAction: 'tool', repeatCount: 0 }, { maxSteps: 5, maxCostUsd: 1, maxMs: 1000, maxRepeats: 3 }], expect: 'max_cost' },
        { args: [{ steps: 1, costUsd: 0.5, elapsedMs: 1000, lastAction: 'tool', repeatCount: 0 }, { maxSteps: 5, maxCostUsd: 1, maxMs: 1000, maxRepeats: 3 }], expect: 'timeout' },
        { args: [{ steps: 1, costUsd: 0.5, elapsedMs: 10, lastAction: 'tool', repeatCount: 1 }, { maxSteps: 5, maxCostUsd: 1, maxMs: 1000, maxRepeats: 3 }], expect: 'continue' } ],
      solution: "function agentStop(state, budget) {\n  if (state.lastAction === 'final') return 'final';\n  if (state.repeatCount >= budget.maxRepeats) return 'loop_detected';\n  if (state.steps >= budget.maxSteps) return 'max_steps';\n  if (state.costUsd >= budget.maxCostUsd) return 'max_cost';\n  if (state.elapsedMs >= budget.maxMs) return 'timeout';\n  return 'continue';\n}",
      hints: ["Early returns in the exact order given.", "Use >= so reaching the limit stops the loop."], explain: "Precedence matters: a finished answer must not be discarded because a budget was also hit on the same step. The >= comparisons mean the limit is the last allowed value, not one past it." }
  ],
  takeaways: ['An agent is a bounded loop: the model proposes, your code validates and executes.', 'State, tools, stop conditions and budgets are owned by deterministic code.', 'Never rely on a prompt for anything that must not happen.', 'Hitting a limit should produce a graceful, logged handover.'],
  apply: "Take any LLM feature you own. Write down its worst-case number of model calls and cost per request. If you cannot, that is your first production risk."
};
