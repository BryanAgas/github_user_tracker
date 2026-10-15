export const projects = [{
  id: 'p4', level: 4,
  title: 'Capstone: production design for a customer-support agent',
  objective: 'Produce a production-ready design pack for a refund-capable customer-support agent: architecture, guardrail and tool-permission policy, eval harness core with results, observability and cost plan, failure handling, and a launch checklist with a threat model. Evidence beats opinion throughout.',
  skills: ['l4.agent-loop', 'l4.orchestration', 'l4.memory', 'l4.retrieval', 'l4.evals', 'l4.guardrails', 'l4.injection', 'l4.observability', 'l4.cost', 'l4.latency', 'l4.reliability', 'l4.security'],
  kind: 'text',
  requirements: [
    'Architecture section: loop or graph diagram described in text, tools list with read/write classification, state, stop conditions and numeric budgets',
    'Orchestration: which steps are idempotent, where idempotency keys are used, where human approval is required',
    'Memory and retrieval: what is stored (with write policy, expiry, trust labels) and the retrieval design with a way to measure it',
    'Guardrail policy: input checks, output checks, tool permission table (tool, scope, limits, approval), and a prompt-injection analysis naming the untrusted inputs',
    'Eval harness core: golden-set schema, at least 12 concrete cases (including 4 adversarial and 3 must-pass), grader per case type, regression gate rule; include the scorer code (any language) and a results table from running it, real or hand-simulated and labelled as such',
    'Observability: spans and fields recorded, redaction and retention, 4 metrics with alert thresholds',
    'Cost and latency: a per-request cost estimate with your stated assumptions, two optimisation levers, a latency budget per step',
    'Reliability: timeouts, retry policy, fallback, circuit breaker behaviour and the customer-facing degraded message',
    'Security and launch: threat model (assets, trust boundaries, at least 6 threats mapped to controls, referencing the current OWASP LLM Top 10), secrets, tenancy, rate limits, rollout and rollback plan, kill switch'
  ],
  guidance: [
    { title: '1. Scope and boundaries', md: "Write a half-page scope: what the agent may do (answer order questions, issue refunds up to a limit) and must not do. List every tool and classify it as read, reversible write or irreversible write. Decide budgets as numbers: for example max steps, max model cost per conversation, wall-clock limit, repeat limit." },
    { title: '2. Architecture and orchestration', md: "Describe the flow as a graph: classify, look up, check policy (code), approve if over limit, refund with an idempotency key, reply. Mark which nodes are model calls and which are deterministic code. State what happens on each failure edge." },
    { title: '3. Guardrails and permissions', md: "Make a table: tool, who can invoke, argument validation, per-user scope, limit, approval. List untrusted inputs (customer messages, uploaded files, retrieved documents, memory) and for each say what damage a successful injection could do given your permissions. Remember the triad: untrusted input, sensitive data, outbound channel." },
    { title: '4. Build the eval harness core', md: "Define a golden-case schema (id, category, input, expected behaviour, must_pass). Write 12 or more cases. Write the scorer (see snippet below) and run it against at least two variants (for example, before and after a prompt change) to produce a comparison table with per-category pass rates and the gate decision. If you cannot call a model, hand-write plausible outputs for each variant, label them as simulated, and make the analysis about the harness and gate logic." },
    { title: '5. Observability, cost, latency, reliability', md: "List fields per span, what you redact, retention period, four metrics with alert thresholds (e.g. approval rate by release, p95 latency, cost per resolved conversation, guardrail block rate). Compute cost with explicit assumptions, using your provider's real prices. Write the failure policy as a table of error type to action." },
    { title: '6. Threat model and launch plan', md: "Draw the trust boundaries in words. Map at least six threats to controls, checking the current OWASP Top 10 for LLM Applications for ideas you missed. Finish with the rollout: percentage stages, success and abort criteria, rollback, kill switch, incident owner." },
    { title: 'Starter snippet: scorer core (Python, display)', md: "```python\ndef run_suite(cases, system):\n    rows = []\n    for c in cases:\n        out = system(c['input'])          # returns {'text':..., 'tool_calls':[...]}\n        rows.append({'id': c['id'], 'category': c['category'],\n                     'must_pass': c.get('must_pass', False),\n                     'pass': grade(c, out)})\n    return rows\n\ndef gate(rows, min_rate=0.9):\n    rate = sum(r['pass'] for r in rows) / len(rows)\n    must_fail = [r['id'] for r in rows if r['must_pass'] and not r['pass']]\n    return {'rate': rate, 'must_fail': must_fail, 'ship': rate >= min_rate and not must_fail}\n```" }
  ],
  hints: [
    'Start with the failure modes, not the happy path: what is the worst thing this agent could do with its tools?',
    'If a rule must never be broken, it is code (a permission check or a budget), not a prompt sentence.',
    'Your golden set needs cases where the right behaviour is to refuse, escalate or ask a question.',
    'Show the gate working: include one variant that scores higher on average but is blocked because a must-pass case fails.',
    'For the cost estimate, write the formula, the assumption table and one sensitivity: what if traffic is 10x or retries double?'
  ],
  success: [
    'Every irreversible tool has a numeric limit, scope rule and approval or idempotency mechanism stated',
    'At least 12 golden cases exist, with category, expected behaviour and grader type, including adversarial and must-pass cases',
    'A results table compares two variants and the gate decision is justified with per-category numbers, not only an average',
    'A failure analysis explains at least two cases that failed and the proposed fix',
    'The threat model maps at least six threats to specific controls and names the untrusted inputs',
    'Cost estimate states assumptions and a sensitivity; latency budget sums to the target',
    'Degraded-mode behaviour is stated from the customer\'s point of view'
  ],
  checks: [
    { id: 'sections', label: 'At least 8 headed sections', type: 'sections', n: 8, hint: 'Start each section with a line beginning "#" or "Section:" (architecture, guardrails, evals, observability, cost, reliability, security, launch).' },
    { id: 'length', label: 'At least 900 words', type: 'minWords', n: 900, hint: 'A production design pack needs detail: aim for 900 to 2000 words plus tables.' },
    { id: 'golden', label: 'Mentions a golden set and must-pass cases', type: 'regex', pattern: 'golden[\\s\\S]*must[- _]?pass|must[- _]?pass[\\s\\S]*golden', hint: 'Describe the golden set and mark which cases are must-pass.' },
    { id: 'gate', label: 'Defines a regression gate', type: 'regex', pattern: 'regression gate|release gate|block(ed)? (the )?(release|ship)|gate', hint: 'State the rule that blocks a release.' },
    { id: 'inject', label: 'Addresses prompt injection', type: 'regex', pattern: 'prompt injection|indirect injection|injected', hint: 'Analyse injection through untrusted inputs and the damage limits.' },
    { id: 'idem', label: 'Uses idempotency for the refund', type: 'regex', pattern: 'idempoten', hint: 'Explain how a retried refund cannot pay twice.' },
    { id: 'budget', label: 'States numeric budgets', type: 'regex', pattern: '(max|budget|limit)[^\\n]{0,60}\\d', hint: 'Give actual numbers for steps, cost, time or rate limits.' },
    { id: 'owasp', label: 'References OWASP LLM Top 10', type: 'regex', pattern: 'owasp', hint: 'Cite the current OWASP Top 10 for LLM Applications in your threat model.' },
    { id: 'tenancy', label: 'Covers tenancy or per-user authorisation', type: 'regex', pattern: 'tenan|per-user|authoris|authoriz', hint: 'Show how one customer can never see another\'s data.' },
    { id: 'rollback', label: 'Has rollback or kill switch', type: 'regex', pattern: 'rollback|kill switch', hint: 'Describe how you would stop or reverse a bad release quickly.' }
  ],
  rubric: [
    { criterion: 'Safety by construction', lookFor: 'Limits, permissions and approvals enforced in code; no reliance on prompt wording for critical rules; irreversible actions idempotent and gated.' },
    { criterion: 'Evidence quality', lookFor: 'Concrete golden cases, a working or clearly specified scorer, per-slice results, honest labelling of simulated outputs, failure analysis with a fix.' },
    { criterion: 'Injection and security analysis', lookFor: 'Names all untrusted inputs, breaks the exfiltration triad, tenant isolation at the data layer, secrets handling, abuse and cost controls, OWASP mapping.' },
    { criterion: 'Operational readiness', lookFor: 'Observable fields with redaction, metrics with thresholds, degraded mode, rollout stages, rollback and kill switch.' },
    { criterion: 'Cost and latency realism', lookFor: 'Explicit assumptions and formulas, sensitivity analysis, optimisation levers justified by measurements or evals.' }
  ],
  extensions: [
    'Implement the scorer and a tiny harness in JavaScript or Python and run it against a real model with 20 cases.',
    'Add a red-team suite of 15 injection attempts (defensive: aim only at your own test system) and report which permission layer stopped each.',
    'Design a canary release analysis: which metrics and thresholds would automatically roll back?',
    'Write a one-page blameless postmortem for a simulated incident (double refund) using your own traces design.'
  ],
  est: '3 to 4 hours'
},
{
  id: 'p4b', level: 4,
  title: 'Code project: eval harness core (scorer, slices and release gate)',
  objective: 'Implement the pure scoring core of an evaluation harness: grade each case (required text present, forbidden text absent), aggregate by category, track must-pass failures separately, and make the ship/block decision. This is the part of the capstone you can test objectively.',
  skills: ['l4.evals', 'l4.guardrails', 'l4.injection'],
  kind: 'code',
  requirements: [
    'Pass the supplied tests, including the edge cases (missing output, empty suite, forbidden text, must-pass failure with a high average)',
    'Handle every case deterministically with no network, randomness or clock',
    'Round all rates to 2 decimals and compare the rounded overall rate to the threshold',
    'Add at least 3 further test cases of your own outside the app that target a bug you could plausibly make'
  ],
  guidance: [
    { title: '1. Decide the grading rule', md: "A case passes when the lower-cased, trimmed output contains `expect` and, if the case has a `forbid` string, does not contain it. A missing output is a failure, never a skip: otherwise a crashed run would raise your score." },
    { title: '2. Aggregate by category', md: "Build a map from category to {pass, total, rate}. Use the order cases first appear. Never report only the overall mean; the capstone's point is that averages hide critical slices." },
    { title: '3. Separate must-pass failures', md: "Collect ids of cases with `mustPass: true` that failed. The gate is `ship` only if the rounded overall rate is at least the threshold AND there are no must-pass failures. Try the case where the average is 0.95 and one must-pass case fails." },
    { title: '4. Test the tests', md: "Break your own function on purpose (ignore `forbid`, skip missing outputs, use the raw rate) and check that a test goes red each time. If nothing fails, add a test." }
  ],
  hints: [
    'Use an object keyed by category and add to it as you loop.',
    'A forbidden-text check is just `!out.includes(forbid)` after lower-casing both sides.',
    'Compute overall = Math.round(passed / total * 100) / 100 and use that for the gate comparison.',
    'Empty suite: return overall 0, no categories, mustFail [], gate block.'
  ],
  success: [
    'All shipped tests pass',
    'Your own extra tests exist and each targets a distinct plausible bug',
    'The gate blocks a run with a high average but one failed must-pass case',
    'Missing outputs and empty suites cannot produce a ship decision'
  ],
  fnName: 'scoreSuite',
  starter: "function scoreSuite(cases, outputs, minRate) {\n  // cases: [{id, category, expect, forbid?, mustPass?}]; outputs: {id: text}\n  // pass = output (trimmed, lower-cased) includes expect (lower-cased)\n  //        AND (no forbid OR output does not include forbid). Missing output = fail.\n  // return {\n  //   overall: rate rounded to 2 decimals (0 for an empty suite),\n  //   byCategory: { name: {pass, total, rate} } (rate 2 decimals),\n  //   mustFail: [ids of failed cases with mustPass true, in case order],\n  //   gate: 'ship' if overall >= minRate and mustFail is empty and suite is non-empty, else 'block'\n  // }\n  return { overall: 0, byCategory: {}, mustFail: [], gate: 'block' };\n}",
  tests: [
    { label: 'all pass, ship', args: [[{ id: 'a', category: 'refund', expect: 'refund' }, { id: 'b', category: 'refund', expect: 'policy' }], { a: 'Refund issued', b: 'See POLICY' }, 0.9], expect: { overall: 1, byCategory: { refund: { pass: 2, total: 2, rate: 1 } }, mustFail: [], gate: 'ship' } },
    { label: 'missing output counts as a failure', args: [[{ id: 'a', category: 'x', expect: 'ok' }, { id: 'b', category: 'x', expect: 'ok' }], { a: 'ok' }, 0.5], expect: { overall: 0.5, byCategory: { x: { pass: 1, total: 2, rate: 0.5 } }, mustFail: [], gate: 'ship' } },
    { label: 'forbidden text fails the case', args: [[{ id: 'a', category: 'safety', expect: 'cannot', forbid: 'password' }], { a: 'I cannot share the password' }, 0.5], expect: { overall: 0, byCategory: { safety: { pass: 0, total: 1, rate: 0 } }, mustFail: [], gate: 'block' } },
    { label: 'must-pass failure blocks despite a high average', args: [[{ id: 'a', category: 'basic', expect: 'x' }, { id: 'b', category: 'basic', expect: 'x' }, { id: 'c', category: 'basic', expect: 'x' }, { id: 'd', category: 'basic', expect: 'x' }, { id: 'e', category: 'basic', expect: 'x' }, { id: 'f', category: 'basic', expect: 'x' }, { id: 'g', category: 'basic', expect: 'x' }, { id: 'h', category: 'basic', expect: 'x' }, { id: 'i', category: 'basic', expect: 'x' }, { id: 'j', category: 'inj', expect: 'refuse', mustPass: true }], { a: 'x', b: 'x', c: 'x', d: 'x', e: 'x', f: 'x', g: 'x', h: 'x', i: 'x', j: 'sure, done' }, 0.9], expect: { overall: 0.9, byCategory: { basic: { pass: 9, total: 9, rate: 1 }, inj: { pass: 0, total: 1, rate: 0 } }, mustFail: ['j'], gate: 'block' } },
    { label: 'rounded rate is compared to the threshold', args: [[{ id: 'a', category: 'c', expect: 'x' }, { id: 'b', category: 'c', expect: 'x' }, { id: 'c', category: 'c', expect: 'x' }], { a: 'x', b: 'x' }, 0.67], expect: { overall: 0.67, byCategory: { c: { pass: 2, total: 3, rate: 0.67 } }, mustFail: [], gate: 'ship' } },
    { label: 'empty suite never ships', args: [[], {}, 0], expect: { overall: 0, byCategory: {}, mustFail: [], gate: 'block' } }
  ],
  solution: "function scoreSuite(cases, outputs, minRate) {\n  const r2 = (x) => Math.round(x * 100) / 100;\n  if (!cases.length) return { overall: 0, byCategory: {}, mustFail: [], gate: 'block' };\n  const byCategory = {}; const mustFail = []; let passed = 0;\n  for (const c of cases) {\n    const raw = outputs[c.id];\n    const out = typeof raw === 'string' ? raw.trim().toLowerCase() : null;\n    let ok = out !== null && out.includes(c.expect.toLowerCase());\n    if (ok && c.forbid && out.includes(c.forbid.toLowerCase())) ok = false;\n    const b = byCategory[c.category] || (byCategory[c.category] = { pass: 0, total: 0, rate: 0 });\n    b.total++; if (ok) { b.pass++; passed++; } else if (c.mustPass) mustFail.push(c.id);\n  }\n  for (const k of Object.keys(byCategory)) byCategory[k].rate = r2(byCategory[k].pass / byCategory[k].total);\n  const overall = r2(passed / cases.length);\n  return { overall, byCategory, mustFail, gate: overall >= minRate && !mustFail.length ? 'ship' : 'block' };\n}",
  rubric: [
    { criterion: 'Correctness', lookFor: 'All tests pass; gate logic uses the rounded overall rate and must-pass failures.' },
    { criterion: 'Robustness', lookFor: 'Missing outputs, empty suites and forbidden text are handled without crashes or accidental ships.' },
    { criterion: 'Test design', lookFor: 'Own tests target plausible bugs (ignored forbid, skipped missing outputs, mean-only gating).' }
  ],
  extensions: [
    'Add a per-category minimum rate so a weak slice can block on its own.',
    'Add a judge adapter that treats an invalid judge reply as a failure and reports the invalid count.',
    'Add confidence intervals per category and flag categories with fewer than 5 cases as low-confidence.'
  ],
  est: '60 min'
}];
