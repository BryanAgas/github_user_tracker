# Learner review: Dr Ines (ML engineer, 4 h/week), advanced track

Status: final. Method: real Chromium via Playwright against `node tests/serve.mjs`; all L5/L6/L7 quizzes answered through the UI (0 console errors); every L5/L6 code exercise and the five L7 code projects solved from the written spec only and run in the in-app worker; mutant (wrong) solutions run to see what the tests accept. Content read in full (L5 a-d, L6 lessons1-3 + meta, L7 lessons/projects).

## 1. ACCURACY ERRORS (ranked)

Arithmetic and paper attributions were checked by hand/recompute; they are overwhelmingly correct (GPT-3 ~175B from 12Ld^2, KV-cache sums, 0.95^20, 0.98^40, RRF ties, LoRA 10,000x/3x, Kwon 2-4x, MAST 41-87%, OSAID, Snell/Lightman/Turpin/Shojaee refs). Findings:

1. **l6-06 predict (latency budget) - definitely wrong/misleading.** Stages sum to 1,400 ms against a 1,000 ms target. Keyed answer: "Cut endpointing wait to about 200 ms ... or reduce LLM time to first token". Cutting endpointing by 200 ms gives 1,200 ms, still over budget. The explanation itself says "removes 200-400 ms". No single listed change is shown to get under budget.
2. **l6-01-q3 explanation vs tests - definitely wrong.** Explanation says "The common wrong answer is using the 0-based index directly". The tests accept the 0-based version (ordering is identical for all 5 tests; verified in-app). The lesson claims a check it does not perform.
3. **l6-03-q3 explanation vs tests.** Says skipping a large message and continuing is "a common bug"; tests accept it (verified).
4. **l6-06 Stivers et al. 2009 sentence - unverifiable/likely imprecise.** "average gap differed across languages by only about a quarter of a second around a shared mean". My recollection is that language means ranged roughly 7 ms (Japanese) to ~470 ms (Danish), i.e. about half a second spread. I could not fetch the paper in this session; treat as unverified, fix or cite.
5. **l5-05 - misleading attribution.** "The transformer (Vaswani et al., 2017) arranges them into a block" followed by a diagram of a pre-norm, decoder-only block with RMSNorm option. The 2017 paper is encoder-decoder and post-LN. Say "modern decoder-only descendants of".
6. **l6-02 supply-chain graph - incoherent example.** Text: "Plant 7 supplies Part X". Graph: Plant 7 --owns--> Supplier A/B. The question "which suppliers are affected if Plant 7 shuts down" has the dependency direction reversed (suppliers supply plants).
7. **l6-10 claimcheck - mislabel.** "Therefore Novel-Q understands documents better than any existing approach" is tagged status `false`; it is unsupported, not shown false.
8. **l5-01 "RLHF and DPO are all the same loop"** (takeaway/why box). PPO-RLHF is on-policy sampling with a learned reward, not a fixed-loss gradient loop. Fine for a novice, wrong for this persona.
9. **Unit mixing:** l5-10 uses GB (1e9), l6-08 uses GiB for the same 8k KV cache (1.07 GB vs 1 GiB). Correct, but unflagged.
10. **"current" entries (outdated by omission).** All `current` boxes say asOf 2026-10 yet name no model, method or tool newer than 2025 papers. Absent for an ML engineer: GRPO / RLVR (only "rewards that can be checked automatically" in one sentence), MoE, FlashAttention, FP8/bf16 training, ZeRO/FSDP/tensor-pipeline parallelism, contextual retrieval / late interaction, chunked prefill / disaggregated serving. "Current practice" is a how-to-check page, not current practice.

Everything else checked is correct, including: cross-entropy/perplexity numbers, dL/dw1=12, param counts (33/105/101,770), 6ND days (4.34, 7.09), 16 B/param Adam memory, LoRA 65,536 and 372,736, Q-update 1.08, attend test values, SE 2.8 pts, margin of error 0.098/0.0588/0.049, KV 131,072 B/token, 80 GiB planning.

## 2. NOT CHALLENGING / padding
- L5 is a competent undergraduate recap (gradient step, softmax, countParams, cosine, precision/recall). An engineer who ships LLM systems gets almost nothing new until l5-07/l5-10; no optimiser maths (Adam, schedules, weight decay), no tokenisation/BPE, no FlashAttention, GQA only as a KV-cache footnote, no MoE, no distributed training, no SFT loss masking / chat templates, no GRPO.
- L6 is better (RRF, MAST, injection trifecta, KV planning) but code is "implement the formula in the text" throughout; none requires a design decision.
- Placement question for L5 (accuracy paradox) is answerable by any numerate non-ML person; L6 placement is one MCQ. See section 5.
- L7 lessons 1-4 (scope, spec, eval-driven, failure UX) are Level-1 content in a builder frame: 10-13 min each, checklists, no technical depth.
- Short "reveal"/try sections give model answers immediately; no grading.

## 3. CODE & PROJECT TESTS
All 37 L5/L6 code exercises (widget + quiz) and p7b, p7c, p7e, p7f, p7g: my independent solutions pass; all reference solutions pass. Working solutions: `docs/review/solutions-advanced.md`.

Tests that accept wrong answers (verified with mutants in the in-app worker):
- `l6-01-q3` rrf (and the l6-01 widget): accepts 0-based rank; accepts no alphabetical tie-break (insertion order coincides with alphabetical in every test).
- `l6-03-q3` compact: accepts skip-and-continue instead of stop-at-first-misfit.
- `p7c` rrfFuse: accepts no id tie-break.
- `p7g` scoreEval: accepts strict `>` threshold (no test at equality); spec silent on comparing rounded vs raw passRate and non-string `actual`.
- Float-equality dependence: ties rely on exact float equality (commutative add, so OK) but nothing says so.
Spec/test contradictions: none found for p7b/p7e/p7f. Mild: l6-06 says "Return keys in the order total, remaining..." but the runner canonicalises key order. l6-03 prose "running total stays within budget" is ambiguous about whether system tokens count (only the hint and test 5 settle it).
Tests that reject correct answers: none found. Note failing output prints expected values, so tests can be special-cased.

## 4. BROKEN UI
No console errors, no "undefined/NaN" text across 27 lessons. Issues:
- Onboarding "AI engineer" path says 55 lessons / 21 h even though placement sends her to L6; no indication of what is skipped.
- Code-project test results (`lastChecks`) are not persisted: after reload the Finish gate resets.
- Widgets (gradient, nnplayground, dotproduct, attention, embeddings, rlgrid, evalmatrix, flow, ragdemo): every button/slider exercised on 9 lessons, 0 errors, no NaN, no horizontal scroll at 375 px. Nothing broken found.
- Failing code tests print `expected X, got Y`, so a learner can hard-code outputs.

## 5. Placement, mastery, certificate fairness
- **Placement**: one MCQ per level (first `placement:true` item only; the second L5 item, 7B memory, is never used). Answering 7/7 correctly starts her at **L6 lesson 1, skipping all of L5**, from seven MCQs, the L5 one being trivially easy. Stops after two consecutive misses. L7 never tested. No "test out of a level" offer beyond a banner.
- **Level challenge** (`#/review?level=N&count=10`): works. Perfect answers: 4 rounds of 10 questions gave L0 9/12 strong (75%), L1 9/14 (64%), L2 10/15 (67%), L3 9/14 (64%), L4 11/12. So testing out of a level costs 40+ questions and often still misses the 75% bar; the challenge is not a pass/fail exam and never awards anything itself. Max 2 questions per skill per round and Strong needs total weight >= 3, so a single challenge can never make any skill Strong.
- **Strong is too easy and too hard at once.** Too easy: all evidence may come from one sitting (no spacing requirement); a 5-question lesson quiz alone makes a skill Strong. "Sources" are distinct question ids, not distinct days/contexts. Too hard: 49 skills have fewer than 4 questions, e.g. `l4.latency` has 1 question (Strong only by answering it 3 times), `l7.portfolio` and `l7.evidence-reporting` 1, many with 2; those skills can only reach Strong via repeats or project weight-2 evidence.
- **Certificate** = 75% skills Strong + 1 project (3 for L7). Projects are passable by self-ticking requirements/rubric, a regex check and a click on "Review my work" that only needs 40 characters. See below.

**Text-project checks reward keyword stuffing (verified in the UI).** For p5, p6, p7a, p7d and p7h I submitted ~1,200 words of the single word "lorem" plus the heading lines and a line of trigger words (e.g. "threat model injection failure mode detect alert recall threshold alternative rollback human approval"). All automated checks passed; ticking the requirements, clicking "Review my work" (needs only 40 chars; the local reviewer cannot fail) and ticking the rubric enabled "Mark project complete", which then adds weight-2 Strong-level evidence to every project skill. Code projects pass on the in-app tests only; requirements like "run your agent on 5 questions outside this app" are an honour tick.

## 6. What worked well
- Arithmetic-heavy items are correct and well chosen (KV cache, 6ND, GPT-3 12Ld^2, error bars, compounding agent reliability).
- Honest hedging: Illusion of Thinking dispute, Chinchilla "rule of thumb", GraphRAG scope, "attention is not explanation", sleeper-agents caveats.
- L6-01 failure taxonomy, l6-05 trifecta + gate-in-code, l6-07 vote vs verifier, l6-08 capacity worksheet: genuinely expert-useful.
- L7 code projects (p7b/e/f/g) have precise specs; tests match the specs, include boundary and empty cases, and my from-spec solutions passed first time. Most mutants (window boundary, budget `>=`, `load<=max`, `some` vs `every`, tie order, dedupe/sort) were rejected.
- Level-challenge flow, reteach panels, UI stability (no console errors across 27 lessons, 100% quiz flows automated), sandboxed runner, short-answer self-check fallback.

## 7. Top 10 fixes
1. Make text-project checks need substance: reject repeated-token filler (unique-word ratio), require numbers inside the matched section, and stop auto-passing self-ticked rubric/"review"; or label them clearly as a checklist, not mastery evidence.
2. Do not award weight-2 Strong evidence from a self-ticked project.
3. Placement: ask 2-3 items per level (including the harder second L5 item), cap start at the level below the last passed, and offer a "test out of L5" short exam instead of jumping to L6 lesson 1.
4. Make the level challenge a real exam: pass threshold, award Strong only with evidence on >=2 days, show a certificate path; raise per-skill question counts (49 skills have <4 questions; `l4.latency` and two L7 skills have 1).
5. Add test cases so rrf (rank 1 vs 0, alphabetical tie) and compact (stop vs skip) actually fail the wrong answers the explanations warn about; add an equality-threshold test to scoreEval and state rounded-vs-raw.
6. Fix l6-06 latency predict (make the single change reach <=1,000 ms or change the budget/numbers).
7. Verify/repair the Stivers 2009 sentence; fix l5-05 "Vaswani arranges" attribution; fix the Plant 7 graph direction; relabel the claimcheck "false" segment.
8. Add real advanced L5 content: Adam/AdamW and schedules, BPE tokenisation, FlashAttention and GQA/MQA, MoE, mixed precision, FSDP/TP/PP, SFT masking, GRPO/RLVR.
9. Make `current` entries genuinely current (named methods, tool versions with dates, what changed since last quarter) or retitle them "how to check".
10. Persist code-project test results, hide expected outputs behind a toggle, and make L7 lessons 1-4 optional/skippable for AI-engineer and Researcher paths.
