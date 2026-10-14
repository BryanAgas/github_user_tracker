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
}];
