# Architecture and teaching design

## The learning loop (and the research behind it)

Every lesson runs **Explain → Show → Let the student try → Test → Apply → Review**:

- **Plain language first, jargon second.** Terms are defined where they first appear; the glossary and tutor back this up.
- **Predict before you see** (`predict` blocks, `nextword`, `claimcheck`): committing to a guess before the reveal improves retention (the generation/pre-testing effect).
- **Retrieval practice over re-reading.** Quizzes are scenario, debugging, predict-the-output and architecture-decision questions, not definition recall.
- **Hint ladders, not answer keys.** Hint → stronger hint → explanation → (code) worked solution. Credit shrinks with each rung, so Mastery reflects what the student can do *unaided*.
- **Spaced, interleaved review.** `#/review` draws questions from the weakest and stalest skills and raises difficulty where a skill is strong.
- **Worked, scaffolded projects** that fade support: guidance → hints → success criteria → automated checks → review → extensions.
- **Reteach, don't repeat.** Every lesson ships ≥2 alternative explanations in different styles (analogy / simple / step-by-step / technical). "I'm confused" and the tutor cycle through them.

## Mastery model (js/mastery.js)

Mastery is computed from **evidence**, never from page views.

- Evidence = `{score 0–1, weight, source}` per answer, exercise, predict-block, project or placement question (last 14 kept).
- Credit: unaided first-try success = 1.0; each hint −0.25; each earlier miss −0.2 (floor 0.3); revealed solution = 0; partial credit is modest; self-marked short answers ×0.75.
- Skill status: **Not yet learned** (no evidence) · **Needs practice** · **Strong** = recency-weighted score ≥ 0.8, weighted evidence ≥ 3, ≥ 2 distinct sources, and practised within 30 days (otherwise *Review due*).
- A lesson is complete when every quiz question has been attempted and the first-try score is ≥ 60%, *or* all its skills are Strong (so testing out via a level challenge works).
- **Level certificate** = ≥ 75% of the level's skills Strong **and** the required project(s) passed (1; Level 7 needs 3). It is a personal record of evidence, not an accredited qualification, and says so.

## Personalisation (js/paths.js, views/onboarding.js)

Onboarding captures role, AI experience, coding, goals, interests, style and weekly time. A short, optional, no-pressure calibration (one self-contained multiple-choice question per level, stopping after two misses) sets a start level; brand-new learners skip it. Nine paths (beginner, explorer, professional, founder, developer, data, engineer, researcher, everything) are rule sets over lesson flags (`core`, `code`, `deep`). Every lesson remains open on every path; paths choose and order. Learners can switch whenever they like.

## Tutor (js/tutor.js, tutorui.js)

1. **Local brain (always on, offline):** intent detection → re-teach in a different style, hint ladder tied to the open question, Socratic quiz (graded in chat; questions are scoped to the lesson they were asked in), recommendations from the learner model, glossary, and TF-IDF search across all lesson text. When it can't answer it says so rather than bluffing.
2. **Model brain (optional, BYO key):** open-ended questions are streamed from a Messages-style endpoint with a teacher system prompt containing the current lesson and the learner's weak topics. Structured intents (hints, quizzes, re-teach) stay local so the tutor keeps *teaching* instead of answering. Project review adds a model critique to the rubric-based local review.

## Content vs. current practice

Permanent lessons teach durable ideas and name no products, prices or benchmark ranks. Fast-moving material lives in `current` entries (`{title, asOf, md, sources}`), rendered in a badged box and gathered in **Library → Current practice**. Entries older than 6 months get a "may be out of date" badge. See `RESEARCH_NOTES.md` for the refresh checklist.

## Code layout

```
index.html            shell; CSP-friendly (no inline script/style)
css/tokens.css        theme variables (light/dark)         css/app.css  design system     css/widgets-*.css
js/app.js             router + shell                       js/content.js  loads + indexes all content
js/store.js           learner model (localStorage)         js/mastery.js  evidence → status, adaptive questions
js/assess.js          question engine (5 types)            js/blocks.js   lesson block renderer
js/tutor.js, tutorui.js                                    js/paths.js    personalised paths
js/runner.js + runner-worker.js   sandboxed JS runner (Worker, own CSP, 2 s timeout, network removed)
js/views/*            screens                              js/widgets/*   22 experiments (lazy-loaded)
js/content/l0..l7.js  curriculum                           js/content/shared.js  cross-level current notes + resources
tools/validate-content.mjs  contract validator             tests/*   unit, smoke, flows
```

## Known limits (by design)

- In-browser exercises are **JavaScript only** (Python appears as display code to run elsewhere).
- Without a connected model, free-text answers are matched by patterns plus honest self-checking against a model answer; project review is structural (word count, evidence signals, rubric self-assessment), not a judgement of truth.
- Progress is per-browser: there is no sync. Use Settings → Export for backups.
- External resource links were verified against search indexes, not live HTTP (see `RESEARCH_NOTES.md`); run a link checker before release.
