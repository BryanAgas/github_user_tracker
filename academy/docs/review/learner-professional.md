# Learner review: Marcus, 38, operations manager (Business professional path)

STATUS: FINAL. Tested in headless Chromium, desktop 1280 and phone 390, fresh context. Screenshots in the scratchpad learner-pro folder (not the repo).

## What I did
Onboarded as Business professional / Regular user / no coding / 2h a week. Took L1-01..06 (operated promptlab, sorter, jsonschema, claimcheck; predict-first, Your turn, quizzes with deliberate mistakes, hints, Explain), L2-01 and L2-03 widgets (flow, sorter), looked at L2-07 and L2-10 widgets, and asked the tutor 7 questions.

## 1. CONFUSING
- Placement (onboarding). Marcus answered Q1 (L0) and Q2 (L1 "improve the landlord boiler email", trivially easy) correctly, missed the L2 prompt-injection refund question and the L3 HTTP 429 question, and was placed "at Level 2", first lesson l2-01. One easy question therefore skips ten L1 lessons, including verification habits (l1-07..10), which are exactly what he wants for judging vendor claims. The L3 question (HTTP 429, retries with jitter) is meaningless to a non-coder, and the L2 question tests content l2-01 itself teaches.
- Placement misses are stored as evidence of 0 skill. The tutor then tells Marcus "Needs practice: Prompt injection awareness (0%), Errors, limits and retries (0%)" and "Worth revising first" for things he has never been taught. Unfair and confusing.
- nextUp uses startLevel, so after finishing L1-06 the tutor and Home point to l2-01, not l1-07. The remainder of L1 is never nudged.
- Content is school-flavoured throughout (headteacher, parents, school trip, Year 9, pupil reports, behaviour policy, revision timetable, safeguarding). Marcus runs logistics. Examples never mention shipments, carriers, ETAs, SLAs, customer delay emails (the promptlab late-parcel case is the only one). Role path "Business professional" does not change examples.
- l1-01 "Predict first" asks about "switching off the audience part", but the experiment right above has no audience part (Role / Context / Task / Constraints / Output format / Example). The lesson teaches Task/Audience/Purpose while the widget scores a different six-part model. Mismatch.
- l1-02 ordering question: correct order has "Check your organisation's rules on AI use" first; Marcus put it fourth and got "1 of 5 in the right place" with no hint of what the logic is. Also remove-identifiers vs add-task ordering is arguable.
- l1-02 sorter: "Unpublished company financials marked confidential" is "Do not paste"; Marcus put "Remove or anonymise" (arguable for his job, where financials are routine inputs).
- Wrong-answer feedback on several MCQs is generic ("Not quite. Have another think", l1-04-q4, l1-05-q4) rather than addressing the chosen distractor.
- Result summary says "Lesson complete" and "91%" yet also "Shaky on: ... retake" after a single miss. Mixed message.
- l1-04 jsonschema experiment shows raw JSON Schema (additionalProperties, minLength, enum) to a non-coder. Heavy jargon for a "no coding" learner.
- l2-01 second "experiment" ("Build a prompt, part by part") is the same late-parcel widget used in l1-01, l1-03, l1-04, but its caption talks about system layer vs input. The widget has no layers, so the caption does not match.
- Short-answer self-check is brittle: reasonable answers ("only use the report I gave it", "the link might go to something that doesnt actually say that", "if you dont know, say you dont know") fail the regex (missing apostrophe, word "report" not accepted) and fall to "I couldn't match that automatically. Does yours say the same thing?" It is then self-graded: Marcus can click "Yes, mine says that" to a vague answer ("Make my CV better please").

## 2. BORING / relearning
- Marcus uses AI weekly. l1-01 to l1-04 re-teach task/audience/purpose, constraints, few-shot, with the same promptlab widget three times (l1-01, l1-03, l1-04) plus again in l2-01. Skip-ahead did not apply to L1 because he was placed into L2, but then L1 content he opened is all basic.
- l2-07 and l2-10 both embed the identical agentloop widget with identical default scenario (refund, failed tool). Repetition.
- MCQ correct answers are almost always the longest, most specific option. Marcus could pass by test-wiseness. Multi-selects have 3-4 of 5 correct, easy to guess.

## 3. BROKEN
- Literal text "null" renders under the question text of every quiz question without code (assess.js: `root.append(..., q.code ? ... : null, ...)` uses native append, which stringifies null). Seen on every question in every lesson, desktop screenshot confirms. Also inside the short-answer self-check view.
- Sorter drag-and-drop could not be driven by Playwright (dragAndDrop and mouse drag both left "0 of 7 sorted"); click-select plus "Put in:" buttons works and keyboard flow works. Flow widget mouse drag and arrow keys work. Probably a headless HTML5 DnD limitation, unverified.
- Quiz progress is not restored on reload; a half-finished quiz resets (evidence is kept).
- Duplicate live-region text in the sorter result ("6 of 7 correct" appears twice in innerText; probably visible plus aria-live).
- Console: no errors or warnings in any run so far.

## 4. TUTOR (offline keyword tutor)
- "How do I make this prompt better? 'Write a reply to a customer about a late delivery'" -> unrelated paragraph about prompt architecture. Never critiques the prompt.
- "can you check my prompt: Summarise the weekly report for the directors in 5 bullets, cost first..." -> returned the glossary entry "Prompt library". Useless.
- "I am a logistics ops manager, how would I use this at work?" -> glossary entry "secret". Wrong.
- "is it ok to paste our client shipment data into ChatGPT" -> pasted a lesson summary (with a ".." typo) instead of answering "no/anonymise and check policy".
- "what should I do next" -> l2-01 plus "revise Prompt injection awareness" (see placement issue).
- "how am I doing" -> counts only; lists 0% items he never studied.
- Good: "what is a few-shot" gave a correct glossary answer plus lesson link; offline status is clearly disclosed in the drawer; hints and "I'm confused" work.

## 5. FACTUAL
- None confident. Claimcheck Curie example is accurate (Chemistry prize 1911). Honest "simulated/pre-written" labels are good.

## 3b. More BROKEN (found later)
- Phone 390: l1-04 scrolls horizontally (page 595px in a 390 viewport). The quiz card holding the code block (l1-04-q3) is 579px wide; the code `pre` is not constrained inside `.qcard`. Any quiz question with `code` is at risk. Other pages tested (home, learn, l1-01, l2-03, l2-07, build/p2, progress, review, tutor) had no overflow.
- Phone: flow widget works but node labels are tiny, dimmed nodes are low contrast and edge labels overlap boxes; the sticky top bar covers widget titles when scrolled to.
- l1-04-q3 asks "what is wrong" with a JSON reply but never states the requested format; the correct option refers to "the requested ISO format" the learner was never told.
- Next-lesson button ignores the path: after l2-10 it offers l3-01 "From user to builder: the programming you need" to a no-code professional.
- Review (spaced practice) pulled L0 "order the steps of next-token", temperature, and an HTTP 429 / retry-with-backoff question from L3, none of which Marcus had studied (they come from placement items), plus the "null" bug again.

## 6. Capstones: do the checks reward real work?
Checks are pure regex / word-count (build.js runTextChecks); the "review" is a local signal counter; completion needs self-ticked requirements and a self-ticked rubric.
- Genuine attempt (P2, a late-shipment customer-email workflow, 779 words, table, 10 eval cases, human checkpoint, kill rule): all 9 checks passed first time. Fair and not frustrating, but they would have passed a much weaker document too.
- Keyword stuffing, P2: seven bare headings, one line of the trigger words ("failure detect notice. escalate approve. inject untrusted. accountable owner. autonomy not automate."), a 3x2 dummy table, "10. done", then 130 repetitions of "lorem ipsum dolor sit amet" -> 9 of 9 PASS. P1 same trick (headings Task/Before/After/Privacy/Verification log/Template + trigger words + [DATE] + lorem ipsum) -> 9 of 9 PASS.
- Ticking all requirement boxes and rubric boxes, then "Review my work", enabled "Mark project complete" on the lorem ipsum text. It awarded evidence (0.95, weight 2) and Progress then showed 4 L2 skills "Strong" (Prompt architecture, Workflow patterns, Human-in-the-loop, Designing a workflow end to end) after one lesson each plus the gibberish project. Strong status is therefore unearned and trivially obtained.
- Local "Mrs Anne's review" is weak and sometimes wrong: on the real attempt it said "Explain your reasoning and name trade-offs" and "Include at least two concrete examples" because it counts words like "because" and "for example", although the document gave reasons and eleven concrete cases. On gibberish it gave the same kind of note and did not block anything. It never mentions content (e.g. no comment that the gate relies on scan age, or that eval case 8 is language handling). The disclaimer about being structural is honest, but the result feels generic.
- Missing checks that would catch gibberish: unique-word ratio / repetition, each failure-table row has non-empty cells, eval cases numbered 1..10 each with text after the number, headings that match required topics each followed by some text, minimum words per section.
- Textarea and ticks persist on reload (good).

## 7. What worked well
- Honest labelling ("simulated response, pre-written", "scripted simulation", "small real validator").
- Hint ladder with reduced credit; model answers gated behind a real attempt; "I'm confused" gives different re-explanations; Predict-first is a good habit.
- Claimcheck (precision/recall of flags) and jsonschema (typical mistakes, repair, retry prompt) are the best experiments, genuinely transferable to judging vendor claims.
- Flow widget (mouse drag, keyboard, Play) and agent loop (inject failure, approval gate) clearly show workflow vs agent and human checkpoints.
- "Current practice" boxes with date and sources; L2-01 prompt-injection and L2-03 chaining-reliability (0.9^3) content is strong and relevant to Marcus.
- P2 brief is genuinely useful for his job (failure table, eval set, checkpoints, kill rule). Phone layout is fine on almost every page.

## Would Marcus change how he works?
Partly. He would take away: separate rules from data, put a human before anything customer-facing, write an eval set, do not trust links. He would not take away prompt-craft improvements (he already knew them) and would be irritated by school examples. The best part (P2) he would only finish for credit-free value because the app cannot tell good from lorem ipsum, and the tutor cannot help him improve his own prompt.

## Top 10 fixes, ranked
1. Capstone checks: add anti-stuffing (repeat ratio, content under each heading, table rows filled, numbered cases with text) and make "Mark complete" not award Strong from self-ticks alone; cap evidence from projects.
2. Placement: ask 2+ questions per level, drop the jargon L3 retry question for non-coders, never record placement misses as 0% evidence, and do not start him at L2 while leaving L1-07..10 (verification) unseen; make nextUp and tutor finish skipped L1 lessons.
3. Remove the literal "null" in every quiz card (assess.js root.append with null; use the h() helper or filter nulls).
4. Fix the phone overflow of quiz cards with code blocks (l1-04) and check other code questions.
5. Business-path examples: logistics, vendor claims, team reports, customer emails instead of school/headteacher/pupil examples; stop the Business path reusing "late parcel" widget four times.
6. Tutor: critique a pasted prompt (even with simple rules: task/audience/constraints present?), answer "can I paste client data" directly, and never fall back to unrelated glossary entries; say "I can't answer that offline" instead.
7. Review (spaced practice) and Progress "Practise these next" should draw only from items the learner has actually studied or answered in lessons.
8. Make the local project review specific: quote what was found (e.g. which required topic is missing, which table row empty), stop counting "because"/"for example".
9. Quiz quality: balance option lengths (correct option is nearly always the longest), improve distractor-specific feedback ("Have another think" generic), explain the right order in ordering questions, loosen short-answer regexes (apostrophes, synonyms) and state what the request was in l1-04-q3.
10. Align widgets and captions: l1-01 Predict about "audience" vs widget parts; l2-01 caption about layers on a widget with no layers; duplicate agentloop in l2-07 and l2-10; Next-lesson button should respect the path (no L3 coding lesson for no-code learners); persist partially answered quizzes across reload.
