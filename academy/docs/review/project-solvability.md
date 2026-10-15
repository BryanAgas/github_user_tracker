# Project solvability review (all 16 projects)

Question: can every project be passed by an honest student, and not by filler?

Method:
- **Text projects.** I wrote one genuine submission per project from the project's own guidance, requirements, hints and success text only (not written to the regexes). They were 445 to 1,514 words, with tables and real numbers. I ran each through the exact check logic, extracted verbatim from `js/views/build.js` (`runTextChecks` plus `qualityChecks`). For p0, p2, p4, p7a, p7d and p7h I confirmed the result in the real UI with Playwright (fresh context, fill the textarea, click "Run automated checks").
- **Attacks.** Each genuine text was attacked five ways:
  - (a) lorem ipsum plus trigger keywords. "Naive" means latin words plus the keywords. "Format-aware" means every non-trigger word replaced by invented pseudo-words, with trigger words, stop words, numbers, tables, quotes and list markers kept.
  - (b) every sentence repeated, and every line repeated.
  - (c) a keyword list as headings.
  - (d) each section deleted in turn.
- **Format probes.** About 50 legitimate rewordings of the genuine texts (other table shapes, heading names, units, quote styles) to find format-brittle checks.
- **Code projects.** I wrote a solution from the written spec alone, ran the shipped tests, then applied about 90 plausible wrong variants ("mutants") and recorded which ones the tests catch. All 7 code projects were re-run in the real UI sandbox.

## Results table

| Project | Genuine passes (before) | Genuine passes (after fixes) | Attacks that wrongly pass (after fixes) | Changes made |
|---|---|---|---|---|
| p0 Explain AI | NO: `q-sections` failed. Guidance asked for "one line" under `# Audience`, but the engine needs 25+ words per section. | yes | (b1) every sentence repeated in place passes, because this text is short and has high vocabulary diversity. Format-aware pseudo-word filler passes. | Audience step now asks for 2 to 3 sentences of 25+ words. New `myth` check (a misconception section must exist). Checker-rules note added to the guidance. |
| p1 Prompt toolkit | NO: `q-sections` failed. The hinted verification log is a table, and table rows do not count as prose. | yes | Format-aware filler passes. Deleting Task or What-changed passes, which is minor. | The hints now say to add a sentence under any table. `before` and `after` must be headings. The `verify` check now requires 5 result-bearing log lines. `check` must be a real "CHECK: ..." line. |
| p2 Workflow design | yes | yes | Format-aware filler passes. Deleting Job or Context passes, which is minor. | `ten-cases` now needs ten numbered lines up to case 10. Before, one line "10. x" was enough. New `parts` check for the architecture, prompts/tools and human-checkpoint headings. Deleting those sections used to pass. |
| p4 Capstone | NO: `sections` wanted 8 headings, but the guidance has 6 parts. A code comment line starting `#` also broke `q-sections`. | yes | Format-aware filler passes. | `sections` n is now 6, with a hint that names the 6 guidance parts. Guidance warns not to start a code line with `#`. The engine fix is recommended below. |
| p5 Model memo | yes | yes | Format-aware filler passes when the attacker keeps the check-hint vocabulary. | `memory` now needs arithmetic with an operator and a GB or MB result on one line. Before, any "24 GB" in the constraints satisfied it. New `parts` check for Constraints, Candidates, Resources and Recommendation. Deleting Constraints, Candidates or Resources used to pass. |
| p6 Architecture review | yes | yes | Format-aware filler passes. Deleting the Architecture section still passes, because a "Design decisions" heading satisfies it. | New `parts` check for Context, Architecture, Evaluation and Open questions headings. Deleting Context, Evaluation or Open questions used to pass. |
| p7a Scoped assistant | yes | yes | Format-aware filler passes when the attacker keeps the check-hint vocabulary. | `evalset` no longer needs the exact words "evaluation set" or an adjacent count. `scope` accepts "percent", "must not", "never". `cost` accepts "per call", "per message". `failures` needs only 8 characters after "cause". Results tables may have 2 or more columns. Explicit format rules are in the guidance, and the check hints say "double quotation marks". |
| p7d Voice app | yes | yes | Format-aware filler passes when the attacker keeps the check-hint vocabulary. | `caseLines` accepts "Case 3:", "T07 -", "V01" ids and `\| 3 \|` rows, and the cases may be split into groups. Before, only `1.` or `\| 1 \|` worked, and the guidance's "case id" column used ids like V01. Heading names are loosened (Failures, Privacy, Recordings). `risks` also accepts "threat" and "safeguard". The guidance lists the headings and the line formats. |
| p7h Dossier | NO: `words-min` (1,800) failed on a thorough 12-section, 1,514-word dossier. The 1,800 figure appeared nowhere in the guidance. | yes | Format-aware filler was blocked only by the checklist format in my transform; a determined attacker would pass it. | `words-min` lowered to 1,400, and 1,400 to 4,000 words is now in the guidance. `iterations` accepts "40 to 85%", "up to" and arrows. `checklist` marker is optional and the 8 items need not end with a newline. `cost` accepts the number before or after "per request", and "200,000 tokens a day cap". `security` accepts "env var", ".env", "vault". `pilot` accepts number words and "not yet run". Quotes and checklist format stated in the guidance. |

(b1) means "every sentence repeated inside its own line". (b2) "every line repeated" is blocked everywhere (`q-dupes`).

Attack outcomes, final state:
- **Naive lorem plus keywords:** blocked on all 9 text projects (`q-prose`, plus missing structure).
- **Keyword list in headings:** blocked on all 9 (`q-sections`, `q-prose`).
- **Every line repeated:** blocked on all 9 (`q-dupes`).
- **Every sentence repeated inside its line:** blocked on 8 of 9 (the doubled text drops vocabulary diversity below 0.28), but **passes on p0**. It would pass any short text whose diversity is 0.56 or more. In practice this lets a student pad word counts by doubling. This is an engine gap; see below.
- **Format-aware gibberish:** passes p0, p1, p2, p4 and p6 with trigger words alone. It passes p5, p7a and p7d too once the attacker keeps the vocabulary from the check hints and labels. p7h was blocked only by my transform breaking the checklist format, so treat it as passable by a determined attacker. This cannot be fixed with regexes (see below).
- **Section deleted:**
  - Before: whole required sections could be deleted and still pass on p1, p2, p5 and p6 (for example p5 Resources, p6 Evaluation).
  - After: the remaining passes are p1 Task and What-changed, p2 Job and Context, and p6 Architecture. These are minor.

## Defects found and fixed (content only)

1. **Spec says one thing, engine needs another.**
   - p0: "one line" under Audience versus the 25-word minimum per section.
   - p4: 6 guidance parts versus 8 required headings.
   - p1, p2, p6 and others: tables in the guidance versus `q-sections` ignoring table rows.
   - p7h: an unstated 1,800-word minimum.
   - Fixes: the guidance now says it. Every text project starts with "How the checker reads your work". Thresholds were aligned to the guidance.
2. **Presence checks satisfied elsewhere in the text.** Examples: `verif`, `\bcheck\b`, `\bbefore\b`, "24 GB", `10.`. Converted to structure-aware checks (headings, N log lines, arithmetic on one line, ten numbered lines).
3. **Format-brittle checks with the format unstated.**
   - Case ids (V01) and "Case 3:" in p7d.
   - Cases split by sub-headings in p7d.
   - 2-column and 4-column result tables.
   - "from 40% to 85%" and "40 -> 85%".
   - A number before "per request".
   - "percent" versus "%".
   - Whether quotes must be double.
   - Headings with extra words ("One-page spec", "Evaluation results", "Recordings and data").
   - Fixes: loosened where the loosening is harmless, and stated explicitly in the guidance and the check `hint` where a format is genuinely required (double quotation marks, one cause per line, `- [x]` checklist lines, one numbered case per line).
4. **p7c spec ambiguity.** "Only the first appearance of an id counts" did not say that a duplicate still occupies a rank. Dedupe-then-rank fails test 6. The wording is now explicit.
5. **p7b spec gaps.** `totalMs`, `finished` and `toolFailures` were not defined precisely. Defined now.

Still-strict formats (intentional, now stated up front): double quotation marks only (not single quotes or backticks), pipe tables with a leading `|`, `- [x]` / `- [ ]` checklist lines (not a tick glyph), latency figures written as `ms`, and a short intro line before a sub-heading is read as a thin section.

## Residual risks (engine, not changed; the fix policy covered content only)

- **E1. Sentence-level repetition is not detected.** `q-dupes` normalises whole lines. Doubling every sentence inside a line passes p0, and any short text with diversity of 0.56 or more. Suggested patch in `qualityChecks`: split on `[.!?]` and compute the share of duplicate sentences longer than 5 words; fail when it exceeds 0.1.
- **E2. A `#` line inside a fenced code block counts as a section heading.** It is both a phantom section and a thin one. A standalone Python comment in p4's scorer makes `q-sections` fail. `sectionsOf` and the `sections` check should skip lines inside triple-backtick fences. Content workaround applied: the guidance for p4, p7a and p7h tells students not to start code lines with `#`.
- **E3. Format-aware gibberish passes.** The checks are public, so someone who preserves the trigger words, numbers, tables and quotes and fills the rest with invented words passes (shown for all 9 projects). The stop-word and diversity heuristics do not detect invented words. The robust fix is a lexical-plausibility test, for example the share of non-stop words found in a bundled corpus of the academy's own lessons and glossary, failing below roughly 50%. Regexes cannot do this. Written projects therefore remain self-assessed (rubric plus reflection gate), which the UI already says.
- **E4. Table-only sections (p1, p2, p7a, p7d, p7h) need a sentence beside each table.** This is documented in the guidance. If preferred, count table-cell words in `sectionsOf`.

## Code projects (p3, p4b, p7b, p7c, p7e, p7f, p7g)

A correct solution written from the spec alone passed the shipped tests first time on all 7. There was no mismatch between spec and tests, except the p7c and p7b wording gaps fixed above. Real-UI sandbox runs: all green.

Wrong variants tried (around 90 in total): tests catch most. These are the ones that survived, with what I did about them.

| Project | Surviving wrong variant (before) | Action |
|---|---|---|
| p3 | The `score > 0` rule is not enforced when `minScore` is 0. | Added test. |
| p3 | A negative `overlap` is not rejected. | Added test. |
| p3 | Matching by substring ("cat" inside "category") instead of by token. | Added test. |
| p3 | Splitting on single spaces instead of any whitespace. | Added test. |
| p4b | Forbidden text compared case-sensitively. | Added test. |
| p4b | `mustFail` listing passing must-pass cases, or in the wrong order. | Added test. |
| p7b | `finished` true only when the last event is final. | Added test. |
| p7b | `repeatedTools` returned unsorted. | Added test (same one). |
| p7e | A tumbling minute bucket instead of the sliding window. | Added test. |
| p7e | Requests denied for rate still entering the window. | Added test. |
| p7g | "Contains" matching instead of equality. | Added test. |
| p7g | An empty or null actual passing when expected is "" or "null". | Added test (same one). |
| p7c | A duplicate id is de-duplicated before ranking. | Already caught by test 6; the spec wording is what was fixed. |

Left as-is, because they are equivalent or contrived:
- p3: the `size <= 0` guard is redundant given the overlap guard.
- p4b: not trimming the output.
- p4b: the `typeof raw === 'string'` coercions.
- p7b: the `!ok` variant and `ms` missing on an event. The event shapes always supply them.
- p7c: `localeCompare` tie-break versus code-point tie-break. These differ only for mixed-case ids.
- p7e: events are chronological, so counting future events cannot differ.
- p7f: sorting the input array in place.

New tests: p3 +4 (19 total), p4b +2 (8), p7b +1 (5), p7e +2 (6), p7g +2 (9). The p4b reference `solution` passes its new tests (checked by `validate-content`).

## Verification

- `node tools/validate-content.mjs`: 0 errors, 0 warnings.
- `node tests/unit.mjs`: 27 passed.
- `node tests/smoke.mjs`: **not completed**. It timed out in this sandbox at 280 s and was not retried. Please run it before committing.
- Not committed. Other uncommitted changes in the tree (`css/app.css`, `views/onboarding.js`, `tests/flows.mjs`, `tests/placement.mjs`) are not mine.

The review harness is outside the repo, in `/tmp/claude-0/-home-user-github-user-tracker/ed516291-c405-5bb1-86fa-c16d7b945f2e/scratchpad/qa-projects/`:
- `harness.mjs`: runs the checks.
- `attack.mjs`: the attacks and section deletions.
- `probe.mjs`: the format probes.
- `mut_*.mjs`: the mutation runs.
- `ui.mjs`: the Playwright check.
- `texts/` and `sol/`: the genuine submissions and solutions.
