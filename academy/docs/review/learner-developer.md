# Learner review: Dev (29, full-stack dev, 5 yrs TS/Python, 3 h/week)

Method: real Chromium (Playwright) against http://localhost:8133 with the production CSP server. Onboarded as Developer / Casual+Regular user / Professional developer. Every code exercise in L3 and L4 (13 + 10 inline widgets, 17 + 10 quiz questions, 30 distinct functions) was solved in the in-app editor with my own implementation, then re-run with 2-4 plausible wrong implementations. p3 `ragCore` was written from the spec and run in-app, then mutation-tested offline against the 8 shipped tests. Experiments and p4 opened; phone (390 px) screenshots taken. No app/content files edited; no commits. Working solutions are in the scratchpad (`learner-dev/solutions.mjs`, `ragcore.js`).

## Verdict
The exercises are well made in one respect: **no correct solution was ever rejected** (every one of 57 runs passed first time), failure output ("expected X, got Y" plus pass count) is good, and quiz explanations are specific. The weak spots are (a) test suites that accept wrong or insecure solutions, especially the thin inline widgets, (b) a placement test that sends a developer far too high, (c) content that is correct but shallow and sketchy for a professional, with no real SDK code anywhere.

---
## 1. CODE EXERCISES

### 1a. Wrong/insecure solutions that PASS (tests too weak)
Quiz questions (these gate lesson completion):
- **l3-07-q5 `searchWithFilter`**: the exact anti-pattern the lesson warns about (rank, `slice(0,k)`, then filter by tenant) passes all 5 tests and earns "Filtering first guarantees...". Needs a test where another tenant's doc is the best match and k is small (post-filter returns [] instead of the tenant's doc). The same flaw makes it the weakest test in the level because it is the security lesson.
- **l3-02-q5 `redactHeaders`**: mutating the input and returning it passes; the explanation says "must return a copy". No non-mutation test.
- **l3-08-q5 `extractCitations`**: default `.sort()` (lexicographic) passes; add valid `[10]` and `[2]` with n >= 10.
- **l3-09-q5 `assembleStream`**: lexicographic key sort passes; the explanation claims "10 would sort before 2" but no test uses index >= 10.
- **l3-10-q5 `shouldAllow`**: inclusive window boundary (`<=`) passes; no `now - t == windowMs` test.
- **l4-02-q4 `nextRunnable`**: dropping `.sort()` passes (test graph keys are already alphabetical).
- **l4-04-q4 `rrf`**: rank starting at 0 (`1/(k+i)`) passes; the tests only check order. Add one that depends on the constant.
- **l4-06-q4 `checkToolCall`**: checking the refund limit BEFORE the allow-list/approval (spec says "apply in that order") passes all 5 tests.
- **l4-07-q4 `summariseTrace`**: no wrong variant of mine passed here (good).
- **l4-10-q4 `rateLimit`**: a fixed-window (bucketed) counter passes all 5 tests although the exercise is called a sliding window; add a boundary-straddling case.
- l3-03-q5 `buildMessages`: see 1c (test contradicts prose).

Inline widgets (not scored, but they are what a learner iterates in first) are far thinner than the quiz versions and accept almost any wrong solution:
- 1 test only: l4-03 `selectMemories`, l4-04 `rrf`, l4-05 `gradeSuite`, l4-06 `checkToolCall` (an always-`{allow:true}` function passes), l4-07 `summariseTrace` (a function returning the constant empty summary passes), l4-08 `monthlyCost` (test has cacheHitRate 0, so ignoring cache entirely passes), l4-09 `nextAction` (test is attempt 1), l4-10 `rateLimit` (a fixed window passes).
- 2-4 tests: every wrong variant I tried passed in l3-03 (`slice(-0)` bug, no cap), l3-04 (first-error-only, wrong type of null), l3-05 (inherited `toString` tool, no string-args parsing), l3-08, l3-09, l3-07 `searchWithFilter` (post-filtering), l4-01 `agentStop` (budgets-first precedence, `>` instead of `>=`, even `final`-or-`continue` only), l4-02.
- Consequence: the "green tick" in the widget means almost nothing, and the learner only meets the real edge cases in the quiz, where they cost evidence points. Suggest: inline widgets reuse the full quiz test arrays.

### 1b. Runner defect
`runner-worker.js` canonicalises `undefined` to `null`. An **empty function passes every `expect: null` test** (l3-01 widget: untouched starter is 2/4 green; l3-01-q5 2/5), and the failure message says "got null" when the function actually returned `undefined`. Debugging-wise that is misleading ("why null? I return nothing"). Show `undefined` explicitly and do not coerce it in the top-level compare. A function returning a Promise is correctly rejected with a clear message; infinite loop gets a clear 2 s timeout.

### 1c. Ambiguous or contradictory specs
- **l3-03-q5 `buildMessages` (test 5)**: history `[user a, assistant b, user c]`, maxTurns 1, new turn "d" expects `[user c, user d]` (two consecutive user turns). The lesson prose and the starter comment both stress "alternating roles matters to many APIs" and "if the first kept item is an assistant turn, drop it". A learner who additionally enforces alternation (drops `c`) fails with `expected [c,d]` and no explanation of why that is "right". Either change the test or add the rule to the spec.
- **Inline starters omit the rules that the quiz states**: l4-01 `agentStop` (state field names `lastAction`, `repeatCount`, `elapsedMs`, `>=` semantics and the precedence appear only in the quiz; the starter says just "return 'final'|...", the prose above says precedence matters), l4-08 `monthlyCost` (no formula), l4-09 `nextAction` (no rule for `attempt >= maxAttempts`, fallback vs fail), l4-06 `checkToolCall`, l4-07 `summariseTrace`. A learner has to reverse-engineer them from the single visible test.
- **l3-06 `cosine` "Any zero-length vector (all zeros)"**: "zero-length" reads like an empty array. Say "zero magnitude".
- l4-05 `gradeSuite`: "compare the rounded rate to the threshold" is only in a hint; spec says nothing about rounded-vs-raw (no test discriminates).
- l3-10 `shouldAllow` vs l4-10 `rateLimit`: same concept twice with different semantics (rejected requests counted in L3's, not counted in L4's) and the L4 one is not flagged as a deliberate variation until the explanation.

### 1d. p3 capstone `ragCore`
- Wrote the implementation from the written spec + starter comments + the helper functions in the starter; **it passed 8/8 on the first run in the app**. So the spec is complete enough for the shipped tests, and the tests do not contradict any written requirement. I found no hidden behaviour I had to guess, with ONE trap:
  - **Stop words vs `norm`**: the starter's `tok()` stems first (`does` -> `doe`), so the stop-word `does` in `STOP` never matches if you filter after `tok` (which is what the comment "unique tokens that are not stop words" describes). A learner who filters raw words before stemming gets a different term count and fails test 2 (0.75 vs 0.6) with no hint why. Fix: put an explicit sentence in guidance ("filter AFTER tok, as the starter does; note `does` is therefore not actually removed") or remove the dead entries from STOP.
- Mutation testing against the 8 tests (offline): CAUGHT: post-filter tenant (test 4), no tenant filter (1,3,4), ignoring minScore (1,2,3), stop-words-before-stemming (2), later-tie-wins (8), 1-based chunk index (1,2,4,8), trailing newline in prompt (1,2,4,8), always-answerable (3,5), no overlap guard (infinite loop, caught by the 2 s timeout). NOT CAUGHT (all pass 8/8): `score > minScore` instead of `>=` (spec says `>=`), un-rounded scores (spec says round to 2 dp; no 1/3-style case), emitting the redundant tail chunk (spec requirement 1 "the last chunk stops at the end" is untested), duplicate question terms not de-duplicated, empty-string tenant treated as "no tenant", missing `tenant` in opts (search-all) untested. Requirement-to-test coverage: 3 of the 6 listed requirements (rounding, last-chunk stop, minScore boundary) have no discriminating test, yet the "Passes every test" box is what completes the project.
- Tenant-leak guard IS well tested (post-filter caught). Good.
- The project says "hidden-style tests" but the test list is visible (label + args truncated in the UI); learners can't see the full args to debug a failing case (text is cut at ~150 chars with an ellipsis).

### 1e. What worked
Starters give the function name, signature and a precise comment spec for L3; quiz solutions include the trap commentary ("slice(-0)", `toString` inherited tool, `typeof null`), and the failing-test message shows expected vs got with sorted keys. The Hint ladder is sensible.

---
## 2. CONFUSING
- **Onboarding calibration shows the literal word "null"** under each question without a code block (`box.append(..., q.code ? ... : null, group)` in `onboarding.js` calibrate(): native `append(null)` stringifies). Visible on all 7 questions in the screenshot.
- Placement says "Level 6" or "Level 5" for a self-described Casual AI user (see section 4).
- `codeplay` widgets carry an "EXPERIMENT" badge (flask) even though they are exercises; the lab/experiment label is shared with real experiments.
- l3-05 and l4-01 teach the same loop (step cap, repeat detection) and l3-10, l4-06 and l4-10 repeat tenant isolation, rate limiting, logging. Reads like the same lesson three times.
- Tutor (offline): "my chunkText returns an extra tail chunk, why?" returned a generic paragraph from the lesson plus an irrelevant "Also: Reasoning systems..." link; asking for the solution returned another generic paragraph. It never inspects the learner's code. "hint" does work (it reveals the next hint under the question).

## 3. TOO SHALLOW / BORING / PADDING (for a professional developer)
- **l3-01 (25 min)**: JSON, filter/map/reduce, a promise explainer, `fetch` not throwing on 500. A 5-year TS/Python dev will find this patronising; it is `core:true`, so the Developer path forces it. A "test out" or skippable-by-challenge route for the first lesson would help (the "challenge questions only" banner only appears once skills are "strong").
- **l3-02 (20 min)**: mostly "do not commit keys", no code exercise worth the name (redactHeaders is fine but tiny).
- **No real API call anywhere.** All display code is "illustrative / copy the real ones from your docs". The Python example uses raw `requests` with `API_URL`/`MODEL_NAME` env vars; there is no `client.messages.create(...)`, no SDK streaming helper, no real tool-use round trip with `tool_use` / `tool_result` ids. The Anthropic shapes live only in prose "current" boxes. A dev wanting to "build AI features at work" leaves L3 without ever having seen a working call. Biggest content gap.
- Tool-use sketch (l3-05) is provider-neutral to the point of being un-runnable (`reply.toolCalls`, `dispatch` undefined); the SSE sample splits on `"\n\n"` only (misses `\r\n\r\n`) and ignores `event:`/`data:` lines; no mention of `AbortController` for the "let users stop" bullet; no retries via SDK `max_retries`. Fine as a sketch, thin for a pro.
- **L4 lessons are ~55 lines each** but claim 20-26 min; most paragraphs are lists of principles. There is almost no runnable depth: the 10 L4 exercises are "pure function of JSON" bookkeeping (stop-condition ordering, a topological `nextRunnable`, an exponential decay score, an RRF) with the model/API part never shown. Missing for a dev: how to actually implement tool-call timeouts (AbortSignal), an idempotency key header, a real eval run with an LLM judge, OpenTelemetry spans, cache-control breakpoints, circuit-breaker state machine code. The circuit breaker is named, shown in a diagram, but never coded.
- l4-04 mentions BM25 and RRF but there is no BM25 exercise; "reranker" is a paragraph.
- Time estimates: l3-01 25 min and l3-02 20 min feel too long for the content for a dev; the 30-min L3 lessons with 5 coding tasks are plausible.
- 3 h/week: Developer path = 69 lessons, ~22 h: L0 core + L1 core + L2 all before L3 is a long runway for a dev with chat-assistant experience.

## 4. Onboarding / placement
- One MCQ per level (0..6), all answerable by general engineering common sense, and the correct option is always the longest, most hedged one. Answering them as a sensible developer who has "never built RAG or tools": **"Your answers suggest you can start at Level 6. First up: Advanced RAG."** Answering L0-L4 right and "I don't know" for L5-L6: **start at Level 5** ("Learning is optimisation"), i.e. L3 and L4 skipped on the strength of two MCQs. `startLevel = highest passed + 1`.
- This contradicts the persona's own declaration (Casual user, no RAG experience) and sends the learner into content that presupposes L3 and L4. Use a threshold of several correct answers per level, or cap placement at the level above self-declared experience, or place using the code-exercise ladder.
- Path choice itself (Developer) and the summary ("69 lessons, ~22 hours, ~11 weeks at 2 h/week") are honest and sensible.

## 5. BROKEN UI
- Calibration "null" text (above).
- No console errors/warnings in any run (onboarding, 20 lessons, labs, p3, p4, tutor).
- Phone (390 px): no horizontal page overflow on l3-05, l4-05, p3, costcalc; code editors scroll sideways inside the box (lines are cut at the edge, no wrap), which is acceptable for code but makes the comment-heavy starters hard to read; Run/Hint/Reset buttons are fine. The sticky bottom tab bar covers the last lines of content only until scroll.
- p3 test list truncates args with an ellipsis, so you cannot see the failing input in full.

## 6. FACTUAL / API CORRECTNESS (only where confident)
- Display code and `current` boxes are largely right and well hedged: Messages API required fields, `system` as top-level, `stop_reason` values, status code list, SDK default 2 retries, SSE event names.
- l4-02 `issueRefund`: the in-process `store.has(key)` check then `payments.refund(...)` is check-then-act (race between two workers) and redundant once the provider gets the idempotency key; and keying by `orderId` alone means a legitimate second partial refund on the same order would be treated as a duplicate (providers such as Stripe also reject a reused key with different parameters). The text says key like `refund:order-4417:v1`, but the code builds `'refund:' + orderId`.
- l4-01 `runAgent`: `callModel` is synchronous (real calls are async), `state.seen[key]` is incremented but never read, tool messages lack the tool-call id the lesson 3 insisted every result must carry.
- l4-05 Python harness uses `cases_by_id` which is never defined.
- l4-08 `monthlyCost`/costcalc model caching as `cachedMult` on reads only; real prompt caching typically charges a premium to write the cache entry, so the calculator overstates savings at low hit rates. Worth one sentence.
- l3-03 says some providers "take system as a first message"; true. Fine.
- l4-06 "OWASP lists prompt injection as the first risk in its LLM Top 10": correct (LLM01), and the `current` box correctly names the 2025 edition.

## 7. TUTOR hints for code
Hints in the exercises themselves are good (L3 hints name the trap: `slice(-0)`, `hasOwnProperty`, `typeof null`; L4 hints give the order and `>=`). The in-app tutor (offline) is generic: it quotes the nearest lesson paragraph, does not read the learner's code or test failures, and offers an unrelated "Also:" link. The "hint" command works and integrates with the question's hint ladder. After a wrong answer the card says only "Not quite. 4 of 5 tests pass. Read the first failing test carefully." with the failing test visible, which is adequate but never states which requirement the failing test targets.

## 8. Experiments (all seven operated)
- **flow**: pure diagram player (drag, steps, node notes). Teaches the key-placement and dispatch loop pictures adequately; the standalone lab page is generic and the "Used in these lessons" list is long and loosely related. Fine, lightweight.
- **jsonschema**: good. Real validator with human-readable errors and typical LLM mistake loaders; the schema uses `minLength`/`maximum` which the l3-04 `current` box says Anthropic's strict mode does not support: a nice teachable moment not connected in the text.
- **ragdemo**: the best one. Real TF-IDF/BM25/keyword/toy-semantic, chunk size/overlap sliders, "break it on purpose" toggles, shows scores and the assembled prompt. Teaches chunking and retrieval failure modes well. "Toy semantic" is concept groups, not embeddings: label it honestly (it is).
- **streaming**: teaches TTFT vs tokens/s clearly, but it is a one-idea toy; a developer already knows it.
- **costcalc**: useful and honest ("example numbers only"). Lacks cache-write premium and batch discount; otherwise it supports the l3-10 and l4-08 prompts.
- **evalmatrix**: solid precision/recall/threshold explanation with scenario costs and a "cheapest threshold" button; matches the l4-05 fraud/guardrail teaching.
- **agentloop**: good stepper (think/act/observe, context growth, injected failure, human approval). Matches l3-05 and l4-01.

## 9. p4 (L4 capstone)
Opened. It is a text project (3-4 h): sensible, concrete (12 golden cases, 4 adversarial, 3 must-pass, scorer code, results table, 6 threats mapped to OWASP, numeric budgets). Regex checks (`(max|budget|limit)[^\n]{0,60}\d`, `gate`, `owasp`) are easy to satisfy by keyword. It is a design document with no running code required: for the persona the code part would be the first extension (implement the scorer and run it against a real model), which should not be optional for a Developer path. The 900-word floor is reasonable.

## 10. What worked well
- Honest framing ("model output is untrusted input", "prompts are not security boundaries") is consistent and correct across L3 and L4; the postmortem-style MCQs (double refund, semantic cache false hit, retry storm) are excellent for developers.
- Quiz code questions are well targeted at real bugs (`slice(-0)`, `toString` tool lookup, `typeof null`, `sort()` default, `||` vs `??`).
- Reteach, hints, per-test feedback, and the explicit separation of "current" volatile facts from durable text.
- p3 is a good capstone: complete spec, a real security property (tenant isolation), passes 8/8 from the spec alone.
- No console errors, layout fine at 390 px.

---
## TOP 10 FIXES (ranked)
1. **Strengthen `searchWithFilter` (l3-07-q5 and its widget)** so post-filtering fails; it is the security lesson and currently accepts the anti-pattern with praise.
2. **Make the inline codeplay widgets reuse the full quiz test arrays** (or at least 5+ cases incl. edge cases); today nearly any wrong solution turns green (all L4 widgets have 1-2 tests; l4-06 always-allow passes).
3. **Fix placement**: one common-sense MCQ per level sends a never-built-RAG dev to Level 6 (or Level 5 skipping L3/L4). Require several correct answers per level, cap by self-declared experience, and let the user confirm a lower start.
4. **Fix the literal "null" in calibration questions** (`onboarding.js` calibrate: do not pass null to `append`).
5. **Add at least one real, copy-pasteable SDK example set to L3** (single call, streamed call with the SDK helper, tool-use round trip with `tool_use_id`/`tool_result`) in Python and TS, then keep the hedged `current` boxes. Without it a developer cannot take anything to work.
6. **Runner: do not coerce `undefined` to `null`**; show "got undefined" and stop an empty function passing `expect: null` tests (l3-01 widget/q5).
7. **Resolve l3-03-q5 test 5 vs the "alternating roles" prose** (state the rule or change the expected value), and make inline starters state the full rules that only the quiz states (l4-01 `agentStop`, l4-08 `monthlyCost`, l4-09 `nextAction`).
8. **Close p3 test gaps**: add cases for `minScore` boundary (`>=`), a non-terminating fraction (rounding), the last-chunk rule, duplicate question words, and no-tenant search; document the `does`/`norm` stop-word trap in guidance.
9. **Deepen and de-duplicate L4**: remove repetition of L3-05/L3-10 (loop caps, rate limiter, tenancy), and add real runnable engineering (AbortSignal timeouts, idempotency header, circuit-breaker state machine, LLM-as-judge harness run, cache-control breakpoints, OpenTelemetry spans); make p4's scorer a required code deliverable on the Developer path.
10. **Give developers a fast lane**: allow testing out of l3-01/l3-02 (skippable after a quick challenge) and shorten claimed times; make the tutor aware of the learner's code/failing test instead of echoing a lesson paragraph.

Minor: correct l4-02 `issueRefund` (race, key per intent+amount, unused store), l4-01 `runAgent` sketch, undefined `cases_by_id` in l4-05; mention the cache-write premium in costcalc; stop labelling codeplay widgets "EXPERIMENT"; widen the truncated args in the test list.
