# Learner review: Priya (52, school administrator, "Just curious", brand-new, 390px phone)

Driven in real Chromium (390x844, touch), fresh context, onboarding as Priya, then L0-01..L0-06 in order (widgets, predict-first, quizzes with deliberate wrong answers, hints, "Explain it to me"), tutor drawer, and capstone p0. Console: zero errors/warnings throughout. Note: the welcome screen/theme toggle were changed by the team mid-review; I did not re-verify those two. Scripts: scratchpad/learner-beginner/.

## Verdict
Priya would finish L0-01 and L0-04 feeling capable, feel shaky in L0-02/L0-03 (code block, "weights/bias/activation/hidden units"), and be most likely to quit at L0-03 (jargon wall plus a 58% "Not quite secure yet" score after she persevered). Also likely to stop if the tutor ever answers her real worries with an advanced, irrelevant paragraph. By the end of L0-06 she has the right big picture only if she survives L0-03. She will not have reached the capstone: it needs lessons 7-10 (context window, training vs inference, hallucination, responsible use), which she has not met.

## 1. CONFUSING
1. **L0-01 sorter instructions are wrong for touch.** Header and caption say "tap an item, then tap a bucket". Tapping the bucket does nothing. What works is a small "Put in: Uses AI" button that appears under the selected item; the line saying so ("press a bucket button") is below the buckets, off-screen on a phone. Priya will think it is broken on her very first interaction. (Same widget in L0-04.)
2. **L0-02 opens with a Python code block** (`def is_spam(email): if ... return True`, labelled PYTHON, with a Copy button) after L0-01 promised no coding. She cannot read it; the Predict question is about it.
3. **L0-02 playground does not match its instructions.** Text: "press Train and watch the regions settle", "XOR starts with 1 unit". Widget loads already trained (Linear data, 150 epochs, 98%), so nothing visibly changes before she acts. "Network" is used before L0-03 explains it.
4. **L0-03 is a jargon wall**: weight, bias, activation, "squashing rule", sigmoid, ReLU, hidden unit, loss curve, "XOR playground" (used in quiz Q4, never explained), `friends_going=0` in quiz Q2, widget note mentions backpropagation, Adam optimiser, cross-entropy. The neuron widget has 7 sliders plus a dropdown and a goal challenge on one screen; the challenge ("AND") is very hard to get 8/8 (I reached 7/8 and could not tell what to change).
5. **L0-05 uses "token" before defining it** (para 1, widget, "Keep this"); L0-06 then says "last lesson I kept saying token and promised to explain". Widget also shows top-k, top-p, greedy, softmax, logits. "Greedy pick: blue" is unexplained.
6. **Onboarding time question**: Priya has 45 min/week; choices are 30 min or 1 hour. Store default is 90 min/week, which is not in the list, so the dropdown shows "30 min / week" while the summary computed "6 weeks" from 90. Summary disagrees with what she picked.
7. Onboarding step 5 title "No quiz for you" sounds like a rejection (the body text is kind).
8. **Predict-first feedback always opens "Interesting - that's the usual guess."** even when she picked a wrong option, and never says whether she was right. Confusing, mildly patronising.
9. **Ordering questions (L0-02 Q3, L0-05 Q3)**: feedback is only "0 of 4 are in the right place", which tells a beginner nothing. Hints are "examples come first, use comes last" (fine) but the check feedback does not use them.
10. **Quiz quality**: most wrong answers get the generic "Not quite. Have another think". Correct options are usually the longest/most hedged (L0-01 Q2, L0-02 Q1/Q2, L0-03 Q1). L0-01 Q2 has a distractor that begins "Correct. Doing many tasks..." (reads like feedback). L0-01 Q4 "narrow or general?" names its own answer. L0-01 Q5 and L0-05 Q4 are reasoning puzzles of ◆◆◆ difficulty in a first level.
11. **Scoring language**: "Not quite secure yet / Your first-try understanding score: 58%" appeared after I answered all L0-03 and L0-06 questions correctly eventually (54% for L0-06). For a nervous adult this feels like failure; the only options are "Retake the quiz" (resets all questions) and "Talk it through". No "Next" until she passes.
12. **Capstone p0 asks for things not taught in L0-01..06**: context window/"remember", training vs inference, hallucination. It also needs her to use an AI assistant she may not have (hint 1 covers this, but only after Next hint). Step 2 says "about 150 words" but the check needs 300+ total (accurate overall, but a trap).

## 2. BORING / too long
- Every lesson starts with title, lede, time chip, "You'll build" skill chips, and two full-width buttons: about one full phone screen before any content. The skill chips ("Not yet learned") are noise at that point.
- L0-05 (~1,450 words) and L0-06/L0-03 (~1,100) have a lot of reading plus 4-5 quiz questions plus "Your turn" plus "Apply it". Realistically 25-30 min each at Priya's pace vs the stated 11-15 min; with 45 min/week that is two weeks per lesson.
- L0-05 embeds the same "Predict the next word" widget twice (second one is a repeat with no new instruction) - it looks like a bug and adds scrolling.
- "Your turn" free-text boxes only reveal a model answer; no feedback on hers (fine, but dull). Quiz Q5 in each lesson is a one-word recall.
- Level has 10 lessons; "34 lessons / about 8 hours" for the path is intimidating on the result screen.

## 3. BROKEN / phone layout
- **Literal text "null" renders on every quiz question** between the question and its options (all lessons, all question types). Cause: assess.js builds the `qcard` with `q.code ? ... : null` as a child and the DOM append helper stringifies null. Highest-visibility bug.
- Sorter shows its result sentence twice ("4 of 6 correct..." both in bold and again in a box).
- Neuron widget results table at 390px wraps mid-word: "Sun ny", "Fre e", "ye s".
- Sorter: pool box + two buckets stack to ~4 phone screens tall; Check button and status are far from the items.
- Page reload during a lesson re-renders the quiz as unanswered although evidence was saved (no sign she already did it).
- Header half-moon icon has no visible label (theme toggle, since changed - recheck).
- Fixed bottom tab bar and the top sticky bar are fine on 390px; no horizontal scroll seen; tap targets (buttons, chips, radio rows) are comfortably large; sliders are usable by touch.
- No console errors or CSP violations in any lesson.

## 4. TUTOR (Mrs Anne, offline keyword tutor)
Good:
- "I'm confused" (lesson button and drawer chip) gave a genuinely different explanation each time (L0-01: "AI is like the word vehicle"; L0-05: phone predictive text analogy), correctly tied to the lesson. This is the best thing in the product for Priya.
- "what is a token?" -> glossary definition + links; "what does temperature mean?" -> relevant paragraph; "Quiz me" -> a proper multiple-choice question from the lesson with "reply with a letter or hint".
Bad:
- "I don't understand this" (L0-05) returned a Level-5 passage: "Pretraining, fine-tuning, LoRA, RLHF and DPO are all the same loop with different losses...". Free-text confusion does not route to the "confused" logic or use the current lesson.
- "can it think?" -> a passage about verification habits; "is it going to take my job?" -> a passage about the Level-2 network playground; "is this safe for kids? I work in a school" -> "Running example: the school office wants a Monday-morning digest of absence emails" under "Read: AI automation" and "Also: Context engineering". Priya's real fears get unrelated advanced content, with "Also:" links to lessons far above her level. There is no honest "I can't answer that here".
- Drawer clearly says "Offline tutor ... Connect a model in Settings for open questions", but a first-time Priya will not know what a model or Settings connection is.
- After a few turns the "Still confused" chip disappeared and the same irrelevant result repeats.

## 5. FACTUAL / misleading (only what I am confident about)
- Nothing outright wrong in L0-01..06 as far as I could judge. Letter count in L0-06 Q3 ("timekeeper" has 4 e's) is right.
- Possibly misleading: the toy tokenizer shows 41 tokens for a 4-word "Other languages" sample (10 tokens/word); real tokenizers are far less extreme. The widget has a toy-model disclaimer, but the headline number could over-scare.
- L0-04 improviser analogy says the improviser "knows when they're making something up" - OK as a stated limit of the analogy.
- L0-05 "All chat assistants you may have met are built on one [LLM]" is fine for now.

## 6. WORKED WELL (do not break)
- Onboarding: warm, short, genuinely skips the quiz for brand-new learners; lands on lesson 1 directly.
- Sorter per-item "why" feedback; non-judgemental "Not quite".
- Temperature widget (L0-05): press-sample-compare is instantly understandable (0.1 -> "blue x10"; 2.5 -> varied). Best experiment.
- Predict-first, myth callouts, "Keep this", Apply-it-today are good structure.
- Hint ladder, "Explain it to me", multi-select feedback ("1 right, 1 doesn't belong, 2 missing"), self-check for short answers.
- Capstone: clear 5-step structure, specific rubric, automated checks with helpful hints; my weak first attempt (42 words) failed 8 checks with actionable hints; a 327-word second attempt passed all 9. Real-world task (fact-check an AI, personal rules) is excellent for her.
- 390px layout is clean; text size readable; no console errors.

## Capstone p0 notes
- Checks are pure keyword/length: attempt 1 ("AI reads the internet and finds the answer", i.e. the exact myth) would pass content checks if padded; the review is generic ("Add concrete evidence: numbers, counts, results from actually trying it" is odd advice for a prose explanation; "Include at least two concrete examples" appears even when she has three).
- Requirements checkboxes ("tick when genuinely done") plus checks plus review plus rubric self-assess plus Mark complete: 4 gates is heavy for a first project.
- Heading syntax `# Audience` (hash headings) is unexplained for non-coders; the placeholder says "lines starting with #" but not why.

## Top 10 fixes, by impact
1. Remove the visible "null" on every quiz question (assess.js child null).
2. Fix sorter instructions/UX: say "tap an item, then tap 'Put in: ...'" (or make tapping the bucket work), put the hint next to the selected item, remove the duplicated result line.
3. Tutor: route free-text confusion ("I don't understand", "I'm lost") to the same "I'm confused" analogy path using the current lesson; restrict retrieval to the learner's level and lesson +/-1; add a fallback "I can't answer that offline" for off-topic/worry questions (jobs, kids/safety, "can it think").
4. L0-03: cut jargon (drop sigmoid/ReLU/XOR/backprop/Adam from the beginner view; define weight/bias in plain words before use; replace `friends_going=0`); simplify the neuron widget (one or two sliders first) and make the "AND" challenge reachable with guidance.
5. L0-02: replace the Python code block with a plain-English list of rules (or a picture); make the playground start untrained or change the instructions to match.
6. Define "token" in lesson 5 before using it (or one plain sentence), and hide top-k/top-p/greedy behind an "advanced" toggle.
7. Soften quiz scoring for Level 0: reword "Not quite secure yet / 58%", let her continue with a "Next lesson anyway", and offer retake of only the missed questions.
8. Onboarding: include a 45-minute option (or free choice), fix the dropdown/default mismatch, rename "No quiz for you", and show a realistic time for the path (and a short Level-0 horizon rather than "34 lessons").
9. Shorten lesson openings: collapse title/lede/chips/buttons so the first interactive piece is within one screen; trim L0-05/06 length; remove the duplicate widget in L0-05.
10. Align the capstone with what she has learned (unlock after lessons 7-10 or move the context-window/training bits into L0-01..06), improve review feedback to be prose-appropriate, and rebalance quiz distractors (correct answer not always longest; wrong-answer notes specific; ordering questions say which items are misplaced).
