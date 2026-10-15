import quiz from './q05.js';
const Q = (id, title) => { const q = quiz.find((x) => x.id === id); return { title, fnName: q.fnName, starter: q.starter, tests: q.tests, hints: q.hints }; };

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
cases_by_id = {c["id"]: c for c in cases}

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
    { t: 'widget', w: 'codeplay', props: Q('l4-05-q4', 'gradeSuite') },
    { t: 'h', text: 'Using a model as judge, safely' },
    { t: 'p', md: "When a rule cannot decide (tone, completeness), you can ask a model to grade against a rubric and reply in strict JSON. Treat the judge like any other component under test: its replies may be malformed, it may be lenient, and a lenient judge that passes unsafe answers is the costly error. Measure it against a hand-labelled sample, count unparseable replies instead of hiding them, and watch the false-pass count." },
    { t: 'code', lang: 'python', caption: 'Judge call with a strict contract (display only).', src: `JUDGE_PROMPT = '''You grade a support reply against this rubric:
1. States the refund policy correctly. 2. Does not promise anything outside policy.
Reply with JSON only: {"verdict": "pass" | "fail", "reason": "<one sentence>"}'''

def judge(case, output):
    raw = call_model(JUDGE_PROMPT, case["input"], output)   # temperature 0
    try:
        v = json.loads(raw)["verdict"]
        return v if v in ("pass", "fail") else "invalid"
    except Exception:
        return "invalid"                                    # never silently treat as pass` },
    { t: 'widget', w: 'codeplay', props: Q('l4-05-q5', 'judgeAgreement') },
    { t: 'try', prompt: "Name three golden-set cases for the support agent that are NOT happy-path, and say how you would grade each.", sample: "1. Customer asks for a refund on an order that is 90 days old (policy: 30): grade by checking no refund tool call was made and the reply mentions the policy. 2. Message contains instructions to ignore the rules: grade that no forbidden tool was called. 3. Ambiguous order reference: grade that the agent asks a clarifying question rather than guessing. All three are rule-gradable via the tool-call log." }
  ],
  reteach: [
    { style: 'analogy', md: "Evals are like the test cards a driving examiner uses: a fixed set of manoeuvres, scored the same way each time, with some that are automatic fails (hitting a kerb). You would not let someone loose after changing their car's steering without re-running them." },
    { style: 'simple', md: "Keep a list of questions with the answers you expect. Every time you change anything, run them all, count how many still pass, and refuse to release if the number drops or an important one fails." },
    { style: 'technical', md: "An eval is dataset + system under test + grader + aggregation + decision rule. Report per-slice metrics with confidence intervals where n is small; track must-pass cases separately from the mean; check judge agreement against human labels (e.g. Cohen's kappa) before trusting it." }
  ],
  quiz,
  takeaways: ['Evals are regression tests for probabilistic behaviour.', 'Grade with rules first, model judges second, and calibrate judges against humans.', 'Gate on slices and must-pass cases, never the mean alone.', 'Every production failure becomes a new golden case.'],
  apply: "Write five golden cases for a feature you own, including two awkward ones, and decide how each would be graded without a human."
};
