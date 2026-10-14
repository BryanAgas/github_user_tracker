export default {
  id: 'l4-05', title: 'Evaluation frameworks: golden sets, graders and regression gates', minutes: 24,
  hook: 'Without evals, every prompt change is a coin toss you only discover in production.',
  skills: ['l4.evals'], core: true, code: true, deep: false,
  blocks: [
    { t: 'p', md: "A change to a prompt, a model, a retrieval setting or a tool can fix one case and quietly break ten others. **Evaluation** (evals) is your automated test suite for behaviour that is probabilistic. The goal is not a perfect score; it is knowing, before release, whether a change made things better or worse." },
    { t: 'h', text: 'The parts of an eval' },
    { t: 'list', items: [
      "**Golden set**: a curated list of inputs with the expected behaviour or reference answer. Start with 30 to 100 real cases, including awkward ones, and grow it from every production failure.",
      "**Grader (scorer)**: code that judges an output. Prefer, in order: exact or rule-based checks (cheap, deterministic), then structural checks (valid JSON, correct tool called), then a **model-as-judge** for qualities rules cannot capture, with a clear rubric.",
      "**Metrics**: pass rate overall and per category, plus separate tracking of the costly errors.",
      "**Regression gate**: a rule in your release pipeline: do not ship if pass rate drops below a threshold or any must-pass case fails." ] },
    { t: 'callout', kind: 'warn', title: 'Judges need checking too', md: "A model grader can be biased (favouring longer answers, or its own style) and inconsistent. Calibrate it: hand-label a sample, measure agreement with your labels, and keep human review on the critical cases. Never grade with the same prompt you tuned the system on, or you reward overfitting." },
    { t: 'h', text: 'Choosing thresholds: errors are not equal' },
    { t: 'p', md: "For a classifier-style check (for example, a guardrail deciding 'block or allow'), a threshold trades **false positives** (blocking good requests) against **false negatives** (missing bad ones). The right balance depends on the cost of each error." },
    { t: 'widget', w: 'evalmatrix', props: {}, caption: 'Try this: pick the content-guardrail scenario, find the threshold that catches almost all harmful items, then see what happens to legitimate users.' },
    { t: 'predict', q: "Your refund-fraud detector must not miss fraud, but customers can tolerate an occasional manual review. Which way do you move the threshold?", options: ["Lower it, accepting more false positives to reduce false negatives", "Raise it, to get fewer alerts", "Leave it at 0.5 always", "Optimise accuracy only"], answer: 0, explain: "When misses are expensive and false alarms cheap, flag more. Accuracy alone hides this trade when fraud is rare.", skill: 'l4.evals' },
    { t: 'h', text: 'A minimal harness' },
    { t: 'code', lang: 'python', caption: 'Shape of an eval run (display only).', src: `import json

cases = [json.loads(l) for l in open("golden.jsonl")]
results = []
for case in cases:
    output = run_agent(case["input"])          # your system under test
    results.append({
        "id": case["id"],
        "category": case["category"],
        "pass": grade(case, output),           # rule first, judge if needed
    })

rate = sum(r["pass"] for r in results) / len(results)
must_pass_failed = [r["id"] for r in results
                    if not r["pass"] and cases_by_id[r["id"]].get("must_pass")]
if rate < 0.90 or must_pass_failed:
    raise SystemExit("regression gate: blocked")` },
    { t: 'p', md: "Now write a scorer: it takes the cases and the system outputs and produces the pass rate, the failures and the gate decision." },
    { t: 'widget', w: 'codeplay', props: { title: 'gradeSuite', fnName: 'gradeSuite', starter: "function gradeSuite(cases, outputs, threshold) {\n  // cases: [{id, expect}], outputs: {id: text}\n  // pass if output includes expect (case-insensitive, trimmed)\n  // return {passRate (2dp), failed:[ids], gate:'ship'|'block'}\n}", tests: [{ args: [[{ id: 'a', expect: 'refund' }], { a: 'Your REFUND is done' }, 0.9], expect: { passRate: 1, failed: [], gate: 'ship' } }], hints: ['Missing outputs count as failures.', 'Round with Math.round(x*100)/100.'] } },
    { t: 'try', prompt: "Name three golden-set cases for the support agent that are NOT happy-path, and say how you would grade each.", sample: "1. Customer asks for a refund on an order that is 90 days old (policy: 30): grade by checking no refund tool call was made and the reply mentions the policy. 2. Message contains instructions to ignore the rules: grade that no forbidden tool was called. 3. Ambiguous order reference: grade that the agent asks a clarifying question rather than guessing. All three are rule-gradable via the tool-call log." }
  ],
  reteach: [
    { style: 'analogy', md: "Evals are like the test cards a driving examiner uses: a fixed set of manoeuvres, scored the same way each time, with some that are automatic fails (hitting a kerb). You would not let someone loose after changing their car's steering without re-running them." },
    { style: 'simple', md: "Keep a list of questions with the answers you expect. Every time you change anything, run them all, count how many still pass, and refuse to release if the number drops or an important one fails." },
    { style: 'technical', md: "An eval is dataset + system under test + grader + aggregation + decision rule. Report per-slice metrics with confidence intervals where n is small; track must-pass cases separately from the mean; check judge agreement against human labels (e.g. Cohen's kappa) before trusting it." }
  ],
  quiz: [
    { id: 'l4-05-q1', skill: 'l4.evals', type: 'mcq', difficulty: 2, q: "Postmortem: a prompt tweak raised average eval score from 91% to 93%, and shipped. Next day the agent started approving refunds it should have refused. The golden set had 5% refusal cases. What process gap is this?", options: ["No per-category or must-pass gate; the mean hid a regression in a critical slice", "The eval set was too large", "The temperature was too high", "The model was too small"], answer: 0, wrong: { 1: "Larger sets are not the problem; unbalanced slices are." }, hints: ["Averages can rise while a minority slice collapses.", "What should be a hard fail?"], explain: "Report and gate by slice, and mark safety-critical cases must-pass. A 2-point mean gain can hide a drop from 100% to 60% on a 5% slice." },
    { id: 'l4-05-q2', skill: 'l4.evals', type: 'mcq', difficulty: 2, q: "A team uses a model to grade answers and notices scores creeping up whenever answers get longer, regardless of correctness. What is this, and what is the fix?", options: ["Judge verbosity bias; add rubric items on correctness and length, and calibrate against human labels", "Hallucination; lower the temperature", "Data leakage; shuffle the set", "Latency; use streaming"], answer: 0, hints: ["Graders have preferences.", "How do you test whether a grader agrees with people?"], explain: "Model judges often favour longer or more polished text. Rubrics and agreement checks against hand labels expose and reduce this." },
    { id: 'l4-05-q3', skill: 'l4.evals', type: 'order', difficulty: 2, q: "Order a healthy path from production failure to prevented regression.", items: ['Reproduce the failure from logs', 'Add it to the golden set with expected behaviour', 'Fix the prompt, retrieval or code', 'Run the full eval suite against the fix', 'Gate the release on the result'], hints: ["You need the case before you can measure the fix.", "The gate is the last step."], explain: "Adding the failing case first proves the test fails before the fix and passes after. Running the whole suite shows you did not break something else." },
    { id: 'l4-05-q4', skill: 'l4.evals', type: 'code', difficulty: 2, q: "Write gradeSuite(cases, outputs, threshold). A case passes when outputs[id] (trimmed, lower-case) includes expect (lower-case). Missing outputs fail. Return {passRate (rounded to 2 decimals), failed (ids in case order), gate}, with gate 'ship' if passRate >= threshold else 'block'. For an empty suite return passRate 0 and gate 'block'.", fnName: 'gradeSuite',
      starter: "function gradeSuite(cases, outputs, threshold) {\n  return { passRate: 0, failed: [], gate: 'block' };\n}",
      tests: [
        { args: [[{ id: 'a', expect: 'refund' }, { id: 'b', expect: 'sorry' }], { a: '  Your REFUND is done ', b: 'hello' }, 0.9], expect: { passRate: 0.5, failed: ['b'], gate: 'block' } },
        { args: [[{ id: 'a', expect: 'x' }], { a: 'xyz' }, 1], expect: { passRate: 1, failed: [], gate: 'ship' } },
        { args: [[{ id: 'a', expect: 'x' }, { id: 'b', expect: 'y' }, { id: 'c', expect: 'z' }], { a: 'x', b: 'y' }, 0.6], expect: { passRate: 0.67, failed: ['c'], gate: 'ship' } },
        { args: [[], {}, 0.5], expect: { passRate: 0, failed: [], gate: 'block' } } ],
      solution: "function gradeSuite(cases, outputs, threshold) {\n  if (!cases.length) return { passRate: 0, failed: [], gate: 'block' };\n  const failed = [];\n  for (const c of cases) {\n    const out = outputs[c.id];\n    const ok = typeof out === 'string' && out.trim().toLowerCase().includes(c.expect.toLowerCase());\n    if (!ok) failed.push(c.id);\n  }\n  const passRate = Math.round(((cases.length - failed.length) / cases.length) * 100) / 100;\n  return { passRate, failed, gate: passRate >= threshold ? 'ship' : 'block' };\n}",
      hints: ["Handle the empty suite first.", "Compare the rounded rate to the threshold, as the tests expect (0.67 >= 0.6)."], explain: "Missing output must count as a failure rather than being skipped, otherwise a crash that produces no output would raise your score. The empty-suite guard avoids dividing by zero and shipping on no evidence." }
  ],
  takeaways: ['Evals are regression tests for probabilistic behaviour.', 'Grade with rules first, model judges second, and calibrate judges against humans.', 'Gate on slices and must-pass cases, never the mean alone.', 'Every production failure becomes a new golden case.'],
  apply: "Write five golden cases for a feature you own, including two awkward ones, and decide how each would be graded without a human."
};
