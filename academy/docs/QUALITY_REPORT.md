# Quality report (as of this build)

Mrs Anne does not mark her own homework. After building, an independent round of reviewers (who did not write the code or content) tested the app as simulated learners and as auditors. This is what they found, what was fixed, and what is still open.

## What was built

8 levels · 79 lessons (~27 h) · 107 skills · 489 questions (260 MCQ, 90 multi-select, 63 code, 39 short-answer, 37 ordering) · 16 projects (7 with objective code tests) · 22 interactive experiments · 214 glossary terms · 60 curated resources · 42 "current practice" entries · tutor · personalised paths · spaced review · mastery model · certificates.

## Independent review round

| Reviewer | Method | Headline findings → outcome |
|---|---|---|
| **Priya** (52, school administrator, beginner, phone) | Real browser at 390 px: onboarding, L0 lessons 1–6, tutor, capstone | A literal "null" printed on every question; sorter unusable by tap; L0-03 a jargon wall; tutor answered "I don't understand" with a Level-5 passage; correct MCQ option usually the longest → **all fixed** (L0 rewritten in places; tutor level-capped; options rebalanced) |
| **Marcus** (38, ops manager) | L1–L2, projects p1/p2, tutor, review flow | Capstones passable with lorem ipsum + keywords; one easy question placed him past all of L1; misses stored as 0% evidence; school-only examples; Next-lesson ignored his path → **fixed** (anti-filler gate + reflection, placement redesign, varied business contexts, path-aware next) |
| **Dev** (29, developer) | All L3/L4 code exercises, project p3 | 20+ code tests accepted wrong solutions (e.g. filter-after-rank); runner coerced `undefined` to `null`; display-code bugs → **fixed** (tests strengthened and mutation-checked; runner distinguishes `undefined`; samples corrected; new L4 code project) |
| **Dr Ines** (34, ML engineer) | All L5–L7 content, all code exercises/projects, accuracy audit | 10 accuracy issues (a 1,400 ms vs 1,000 ms latency example, Vaswani attribution, GB/GiB, reversed graph, mislabelled claim…); L5 too elementary; mastery too easy in one sitting → **fixed** (corrections, two new deep L5 lessons, spacing rule: Strong needs evidence on ≥ 2 days) |
| **Accessibility/security reviewer** | WCAG hand-audit, XSS probes, sandbox escape attempts, code review | No XSS; sandbox held against network/CPU/memory abuse. Found: skip link broke routing, form borders 1.3:1, modal drawer not modal, multi-tab data loss, forged test results possible, unvalidated imports → **all fixed and regression-tested** |
| **Project solvability audit** | Wrote a genuine submission for every project from guidance only; attacked with filler | **4 of 9 text projects could not be passed honestly** (check/guidance mismatches) → fixed; code projects: 13 survivors-killing tests added |

Mechanical gates added because of the findings: the content validator now **fails** a level if the correct MCQ option is the strict longest in > 45% of questions (it was 83–100% in six levels) or if any skill has < 4 questions.

## Quality gates

| Gate | Status | Evidence |
|---|---|---|
| Beginner path works | ✅ | `tests/flows.mjs` onboarding → lesson → quiz → progress |
| Advanced paths work | ✅ | `tests/placement.mjs` (5 personas), smoke test of all 133 routes |
| Curriculum coherent | ✅ with caveats | validator; reviewers; see open items |
| Lessons accurate | ⚠️ reviewed, not exhaustively verified | Ines' audit + fixes; several external sources were checked via search snippets only (below) |
| Interactive exercises work | ✅ | 22 widgets under production CSP; 63 code questions solved by reviewers |
| Assessments work | ✅ | unit tests (evidence weighting, hints, spacing); mutation-checked code tests |
| AI tutor works | ✅ offline brain · ⚠️ model brain | Local brain unit/e2e tested. Model streaming is tested against a **mock** endpoint only; never against a live API |
| Progress tracking works | ✅ | unit + e2e (persistence, multi-tab, import hostile data) |
| Projects work | ✅ | solvability audit; anti-filler gate |
| Mobile + desktop | ✅ | 390 px and 320 px overflow tests; screenshots reviewed |
| Accessibility acceptable | ✅ AA-oriented, hand-verified | contrast tokens, keyboard operation, modal drawer; **axe-core was not available offline**, so no automated scanner run |
| Authentication | N/A by design | no accounts; learner data never leaves the browser |
| User data protected | ✅ | strict CSP, no third-party requests, no `innerHTML`, validated imports, API key never persisted |
| Performance acceptable | ✅ | no build, lazy-loaded widgets, 2.3 MB total |
| Production app tested end-to-end | ⚠️ | tested on a local server that applies the production CSP; **not deployed to Netlify** |

## Open items (honest list)

1. **Links and sources.** The researcher could not reach most hosts; 60 resources and many `current` sources were validated against search results, not live HTTP. Run a link checker from an unrestricted network before launch. Specific URLs flagged for spot-check: vendor prompting guides, OWASP LLM Top 10, NIST AI RMF, several arXiv ids in L5 (see `docs/RESEARCH_NOTES.md`).
2. **`current` entries are as current as the authors' sources** (mostly through early 2026). They are dated and badged, and Library → Current practice flags entries older than six months, but they need a quarterly refresh.
3. **Live model never exercised.** The optional model-backed tutor/review is written to the Messages streaming format and tested against a mock. Test with a real key before relying on it.
4. **CSP on Netlify.** `netlify.toml` sets one CSP for `/*` and a different one for the sandbox worker. If Netlify merges both, the worker's `eval` may be blocked in production (the local test server applies only the specific one). After deploying, run `curl -I` on `/js/runner-worker.js` and confirm the code runner works.
5. **Text projects are self-assessed.** Anti-filler checks stop lazy gaming, but a determined student can still write structured nonsense that passes. Written projects therefore count for less evidence than code projects (weight 1 vs 2), require a written reflection, and the local review says plainly that it measures structure, not truth. A model review (optional) helps.
6. **In-browser code is JavaScript only.** Python appears as display code to run elsewhere.
7. **No cross-device sync.** Progress is per browser; export/import is provided.
8. **Level challenge is practice, not an exam.** It adds evidence but never awards anything by itself (by design: Strong needs spacing).
9. **Content depth.** L1 lessons 05–10 still carry a little school-flavoured text outside the examples that were revised; some lessons run long for their stated minutes; L3/L4 still repeat a little tenancy/rate-limiting material.
10. **No real learner trials yet.** The simulated learners are model-driven; real users will find things they didn't.
