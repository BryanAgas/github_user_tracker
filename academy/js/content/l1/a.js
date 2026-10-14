// L1 lessons 01-04
export default [
{
  id: 'l1-01',
  title: 'Say what you mean: clarity, task and audience',
  hook: 'The assistant cannot read your mind, so every detail you leave out is filled in with a guess.',
  minutes: 14,
  skills: ['l1.clarity'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "In Level 0 you learned that a language model continues text it has been given, one small piece at a time. That explains the first rule of using one well: **it responds to what is on the page, not to what is in your head.** You already know what AI is. What has been missing is how to steer it." },
    { t: 'p', md: "Think of a very capable temporary member of staff who has never met you. They are quick, well-read and keen to please, but they know nothing about your school, your reader or your purpose. If you say “write something about the trip”, they will produce something. It will be the most *typical* something, which is rarely the something you needed." },
    { t: 'h', text: 'Three things every good request contains' },
    { t: 'list', items: [
      "**Task**: the action, in a verb. “Draft”, “summarise”, “compare”, “check” are all different jobs.",
      "**Audience**: who will read or use the result. A note for parents and a note for governors are different documents.",
      "**Purpose**: what the result is for and what a good one looks like. “So that parents can decide whether to sign the consent form by Friday” is worth ten adjectives."
    ] },
    { t: 'callout', kind: 'why', title: 'Why vagueness costs you', md: "When a request leaves a gap, the model fills it with the most common pattern in its training text. Vague in, generic out. That is not laziness on its part; it is the only thing it can do with the information it has." },
    { t: 'widget', w: 'promptlab', props: { task: 'email' }, caption: "Switch the parts of the prompt on and off. Watch the completeness meter and the simulated reply change.", skill: 'l1.clarity' },
    { t: 'predict', q: "You switch off the *audience* part but keep the task and the facts. What is the most likely change in the reply?", options: ["It refuses to answer", "The tone and level become generic or mismatched to the reader", "The facts become wrong", "Nothing changes, because audience is only decoration"], answer: 1, explain: "The facts are still supplied, so they stay. But tone, vocabulary and level of detail all depend on the reader, and without one the model reaches for a middle-of-the-road default.", skill: 'l1.clarity' },
    { t: 'compare', title: 'Same job, two requests', cols: ['Weak', 'Stronger'], rows: [
      ["Write about our recycling project.", "Write a 120-word update for the school newsletter, for parents, about our recycling project. Tone: warm and factual. End with one way they can help."],
      ["Make this better.", "Edit this paragraph for a Year 9 reader: shorter sentences, no jargon, keep every fact. Show the result only."],
      ["Summarise the report.", "Summarise the attached report in five bullets for a busy headteacher who must decide whether to fund it. Put the cost and the main risk first."]
    ] },
    { t: 'callout', kind: 'misconception', title: 'There are no magic words', md: "People swap “secret prompt formulas” as if certain phrases unlock hidden power. What actually works is ordinary clarity: a clear task, a clear reader, a clear purpose. A longer prompt is not automatically better; a *more specific* one is." },
    { t: 'try', prompt: "Here is a weak request: “Write something about our school trip.” Rewrite it so that it states the task, the audience and the purpose. Invent plausible details.", sample: "A model rewrite: “Write a 150-word letter to parents of Year 6 about the trip to the science museum on 12 March. Purpose: remind them to return the consent form and pay £8 by Friday. Tone: friendly, brisk. Include the departure time (8.30am) and what to pack.” Notice it names the task (letter), the reader (parents), the purpose (action by Friday) and supplies the facts the model could not know." },
    { t: 'reveal', label: 'A check you can run on any prompt', md: "Ask yourself: *if I handed this note to a competent stranger, could they do the job without coming back with five questions?* If not, answer those questions in the prompt first." }
  ],
  reteach: [
    { style: 'analogy', md: "Ordering at a café: “a coffee” gets you the house default. “A large oat flat white, to take away” gets what you wanted. The barista is not being difficult; the first order simply left the choices open. Your prompt is your order." },
    { style: 'simple', md: "Three questions before you press send: What do I want done? Who is it for? What is it for? If your prompt answers all three, it is already better than most." },
    { style: 'step-by-step', md: "1. Write the verb (draft, summarise, check). 2. Add the object (a letter, a table, five bullets). 3. Name the reader. 4. State the purpose or decision it supports. 5. Add any facts the model cannot know. 6. Read it as a stranger would." }
  ],
  quiz: [
    { id: 'l1-01-q1', skill: 'l1.clarity', type: 'mcq', difficulty: 1, placement: true,
      q: "Which change would MOST improve the prompt “Write an email to my landlord about the boiler”?",
      options: ["Add “please” and “thank you”", "State what is wrong, what you want done and by when, and the tone you want", "Ask for it in a longer format", "Tell the assistant it is an expert"],
      answer: 1, wrong: { '0': "Politeness is harmless but gives the model no new information.", '2': "Length is not the same as specificity.", '3': "A role label does not supply the facts the email needs." },
      hints: ["What does the model not know that the email must contain?", "Think task, audience and purpose."],
      explain: "The model cannot know the fault, your request or your deadline. Supplying those, plus tone, removes the guesswork. Politeness, length and flattery do not add information." },
    { id: 'l1-01-q2', skill: 'l1.clarity', type: 'mcq', difficulty: 2,
      q: "A colleague complains that the assistant's summaries are “always bland”. Their prompt is: “Summarise this article.” What is the best diagnosis?",
      options: ["The assistant is a poor summariser", "The prompt does not say who the summary is for or what it is for, so the model defaults to a generic one", "They need a more powerful model", "Summaries from AI are always bland"],
      answer: 1, hints: ["Is anything in the prompt telling the model what to emphasise?", "Who would read this summary and what would they do with it?"],
      explain: "Bland output is the typical result of an underspecified request. Naming the reader and decision (for example “for a governor deciding on funding, cost and risk first”) gives the model something to optimise for." },
    { id: 'l1-01-q3', skill: 'l1.clarity', type: 'multi', difficulty: 2,
      q: "Select ALL the elements that belong in a clear request.",
      options: ["The task as a verb", "The intended reader", "What the result will be used for", "A threat that the model will be switched off if it errs", "Facts the model cannot know"],
      answer: [0, 1, 2, 4], hints: ["Which options add real information?", "One option is a gimmick, not information."],
      explain: "Task, audience, purpose and missing facts all supply information. Threats and similar tricks supply none and are not a reliable technique." },
    { id: 'l1-01-q4', skill: 'l1.clarity', type: 'short', difficulty: 3,
      q: "In one sentence, rewrite this weak prompt so it is clear: “Help me with my CV.” (Invent sensible details.)",
      accept: ["(cv|resume|résumé).*(for|apply|role|job|position)", "(audience|employer|recruiter|hiring)", "(rewrite|edit|tailor|improve|shorten|review).*(cv|resume)"],
      model: "Edit my CV (pasted below) for an application for a primary teaching assistant role: keep it to one page, put relevant experience first, and flag anything vague.",
      hints: ["Name the action, the target role and a constraint.", "Try: verb + document + purpose + one constraint."],
      explain: "A strong answer names an action (edit, tailor), the purpose (which role) and at least one constraint or success measure. Any wording that does so is fine." }
  ],
  takeaways: [
    "A model responds to what is on the page, so gaps are filled with the most typical guess.",
    "Every request needs a task, an audience and a purpose.",
    "Specific beats long. There are no magic words.",
    "Test your prompt by asking whether a competent stranger could do the job from it."
  ],
  apply: "Take a request you sent to an assistant recently and rewrite it to include task, audience and purpose. Send both versions and compare."
},

{
  id: 'l1-02',
  title: 'Context: give it what it cannot know, and keep private things private',
  hook: 'The best prompts hand over the right background, and leave out what should never leave your hands.',
  minutes: 15,
  skills: ['l1.context', 'l1.privacy'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "**Context** is the background you supply so the assistant can do your specific job rather than a generic one: the situation, the source material, what has already been tried, who is involved, and what good looks like." },
    { t: 'p', md: "From Level 0 you know a model can only use what is inside its context window, plus patterns from training. It has not read your inbox, your policies or last week's meeting. If a fact matters, it must be in the conversation." },
    { t: 'h', text: 'What good context looks like' },
    { t: 'list', items: [
      "**Situation**: “We are a three-form-entry primary school and our Year 4 trip was cancelled by the coach company.”",
      "**Source material**: paste or attach the actual text you want used, rather than asking it to “remember” a document.",
      "**Background decisions**: what is already agreed, so it does not re-open settled points.",
      "**Success criteria**: what the reader must be able to do afterwards."
    ] },
    { t: 'callout', kind: 'tip', title: 'Put the source in, then say “use only this”', md: "When accuracy matters, paste the source and add: “Use only the text below. If the answer is not in it, say so.” This sharply reduces invention, though it does not remove it. You still check." },
    { t: 'callout', kind: 'warn', title: 'More is not always better', md: "Irrelevant material dilutes the useful material and can distract the model. Give what is relevant, labelled clearly (“BACKGROUND:”, “DRAFT TO EDIT:”), and cut the rest." },
    { t: 'h', text: 'What not to paste' },
    { t: 'p', md: "Anything you send to an online assistant leaves your device and is processed by a company. What happens next depends on the service, your account type and your settings, and policies change. So decide *before* you paste, using a cautious default." },
    { t: 'widget', w: 'sorter', props: {
        title: 'Safe to paste, or think again?',
        buckets: ['Usually fine', 'Remove or anonymise first', 'Do not paste'],
        skill: 'l1.privacy',
        items: [
          { text: 'A published news article you want summarised', bucket: 'Usually fine', why: 'Already public. Your concern is accuracy, not privacy.' },
          { text: 'Your own draft essay with no personal data', bucket: 'Usually fine', why: 'Your own work, nothing sensitive. (Check your course rules on AI use separately.)' },
          { text: 'A pupil report with the child’s name and behaviour notes', bucket: 'Remove or anonymise first', why: 'Replace the name with “Pupil A” and strip identifying details; better still, check whether your organisation permits any such use.' },
          { text: 'A customer complaint email with names and an order number', bucket: 'Remove or anonymise first', why: 'Strip names, contact details and reference numbers; the wording is what you need help with.' },
          { text: 'Passwords, API keys or login codes', bucket: 'Do not paste', why: 'Secrets must never be pasted into chat. If one was, treat it as exposed and change it.' },
          { text: 'Medical records or a safeguarding case file', bucket: 'Do not paste', why: 'Highly sensitive and usually covered by strict rules. Do not use a general chat assistant for them.' },
          { text: 'Unpublished company financials marked confidential', bucket: 'Do not paste', why: 'Confidentiality agreements and policy usually forbid this unless an approved tool is provided.' }
        ] }, caption: 'Sort each item, then check the reasons.' },
    { t: 'current', key: 'privacy-check' },
    { t: 'callout', kind: 'misconception', title: '“I deleted it, so it is gone”', md: "Deleting a chat from your history is not the same as every copy ceasing to exist. Retention and review rules vary by service. Treat anything you paste as shared with a third party, and anonymise as a habit." },
    { t: 'try', prompt: "Rewrite this so it is useful but safe: “Priya Shah in 5B has been hitting other children since September and her mum, Mrs Shah (07700 900123), says it is our fault. Draft a reply.”", sample: "“Draft a calm, professional reply from a class teacher to a parent who feels the school is at fault for her child’s behaviour incidents this term. Acknowledge her concern, outline that we will arrange a meeting, do not admit liability, do not give details about other children. Tone: warm but firm. 150 words.” The name, phone number and class are gone; the model needs only the situation and the desired tone." }
  ],
  reteach: [
    { style: 'analogy', md: "Briefing a locum teacher: you leave a plan, the seating chart, what the class has covered and which pupils need support. You do not leave the staff-room safe code or other families’ confidential files. Give the helper what lets them do the job; hold back what could cause harm." },
    { style: 'simple', md: "Two jobs. One: add what the model cannot possibly know. Two: before you press send, remove names, numbers and secrets. If you would not post it on a public noticeboard, think carefully before pasting it." },
    { style: 'step-by-step', md: "1. List the facts the answer depends on. 2. Paste or summarise them, labelled. 3. Say whether to use only that material. 4. Scan for personal data, secrets and confidential items. 5. Replace names with labels such as “Pupil A”. 6. Send." }
  ],
  quiz: [
    { id: 'l1-02-q1', skill: 'l1.context', type: 'mcq', difficulty: 2,
      q: "You want an accurate summary of your school’s 12-page behaviour policy. Which approach is best?",
      options: ["Ask: “Summarise the school behaviour policy” and trust that it knows ours", "Paste the policy text and ask for a summary using only that text, saying so if something is missing", "Describe the policy from memory in one line and ask for a summary", "Ask it to guess what a typical policy says"],
      answer: 1, wrong: { '0': "It has no access to your specific policy; it would invent a typical one.", '2': "Your memory is lossy, and the summary inherits the errors." },
      hints: ["Where will the model get the policy’s actual words?", "Which option grounds the answer in the real document?"],
      explain: "Grounding the answer in the real text, with an instruction to stay within it, is the strongest approach. The others rely on the model's generic knowledge, which will produce a plausible but unreliable result." },
    { id: 'l1-02-q2', skill: 'l1.privacy', type: 'mcq', difficulty: 2, placement: true,
      q: "You want help wording a firm email to a parent. The draft contains the child’s full name, a phone number and details of an incident. What is the best practice?",
      options: ["Paste it all; the assistant is just software", "Remove or replace the identifying details and describe the situation generally", "Paste it but delete the chat afterwards", "Paste it in two halves so no single message contains everything"],
      answer: 1, wrong: { '2': "Deleting the chat does not guarantee the data is gone, and the data has already been sent.", '3': "Splitting does not stop the data being sent." },
      hints: ["What does the model need to write the email: the child’s identity or the situation?", "Think data minimisation: send only what the task needs."],
      explain: "The task is about wording and tone, not identity. Minimising what you send is the safest approach, and your organisation’s own rules on AI use come first." },
    { id: 'l1-02-q3', skill: 'l1.context', type: 'multi', difficulty: 2,
      q: "Which of these are useful forms of context for a request to plan a revision timetable? Select all that apply.",
      options: ["The exam dates", "Hours available each week", "Topics you find hardest", "Your date of birth", "Study methods that have not worked for you"],
      answer: [0, 1, 2, 4], hints: ["Which items change the timetable?", "One item is personal data with no bearing on the task."],
      explain: "Dates, available time, weaknesses and failed methods all change the plan. Date of birth does not, so leave it out: relevant context in, irrelevant personal data out." },
    { id: 'l1-02-q4', skill: 'l1.privacy', type: 'order', difficulty: 3,
      q: "Put these steps in the sensible order for using an assistant with a document that mentions real people.",
      items: ["Check your organisation’s rules on AI use", "Remove or replace names, contact details and secrets", "Add a clear task, audience and purpose", "Paste the cleaned text and send", "Check the result for errors and for anything that should not be shared onward"],
      hints: ["Rules and permission come before action.", "Cleaning comes before pasting; checking comes last."],
      explain: "Permission first, then minimise, then specify, then send, then verify. Skipping the first two is the common and costly mistake." },
    { id: 'l1-02-q5', skill: 'l1.context', type: 'short', difficulty: 2,
      q: "You paste a long report and ask a question. Name one instruction that reduces the chance of invented answers.",
      accept: ["only.*(text|source|document|below|provided)", "(say|tell).*(not|doesn.t|isn.t).*(in|there|found)", "(quote|cite).*(passage|text|line|source)"],
      model: "“Use only the text below, and say so if the answer is not in it.” Asking for a supporting quotation also helps.",
      hints: ["Restrict the model to the source.", "Give it permission to say “not in the document”."],
      explain: "Restricting the answer to the supplied text and allowing “I can't find that” stops the model filling gaps from its general knowledge. It reduces invention; it does not remove the need to check." }
  ],
  takeaways: [
    "Supply the situation, source material, decisions made and success criteria; the model cannot know them.",
    "When accuracy matters, paste the source and tell the model to stick to it.",
    "Treat anything you paste as shared with a third party: anonymise by default.",
    "Never paste secrets, medical or safeguarding files, or confidential material into a general chat tool."
  ],
  apply: "Pick a document you often ask for help with. Write a two-line checklist of the details to strip out before pasting, and keep it somewhere you will see it."
},

{
  id: 'l1-03',
  title: 'Instructions and constraints: say what to do, and the limits',
  hook: 'Precise rules turn a rambling answer into one you can actually use.',
  minutes: 14,
  skills: ['l1.constraints'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Once the task and context are clear, **instructions and constraints** control the shape of the answer: how long, what format, what to include, what to avoid, what order, and how sure it should sound." },
    { t: 'h', text: 'Positive, specific, testable' },
    { t: 'list', items: [
      "**Say what to do rather than only what not to do.** “Write in short sentences of plain English” works better than “don’t be complicated”.",
      "**Make constraints testable.** “Under 100 words” can be checked; “fairly short” cannot.",
      "**Separate the parts.** Give the task, the material and the rules in clearly labelled sections, so the rules are not lost inside a paragraph of background.",
      "**Rank them.** If two rules might clash (“be thorough”, “under 50 words”), say which wins."
    ] },
    { t: 'callout', kind: 'tip', title: 'Give it an exit', md: "Include what to do when the task cannot be done as asked: “If the information is missing, ask me one question instead of guessing.” Without this, the model tends to produce *something*." },
    { t: 'widget', w: 'promptlab', props: { task: 'summary' }, caption: 'Try toggling the constraints and output-format parts. What changes, and what stays the same?', skill: 'l1.constraints' },
    { t: 'h', text: 'A prompt with sections' },
    { t: 'code', lang: 'text', src: `TASK
Summarise the report below for a busy headteacher.

MATERIAL
[paste report here]

RULES
- Exactly 5 bullet points, each under 20 words.
- Put the cost and the single biggest risk first.
- Use only facts in the report. If something is unclear, say "unclear".
- No introduction or closing remarks.

IF THE REPORT HAS NO COST FIGURE
Say "No cost given" as the first bullet.`, caption: 'Labels help you and the model; the exact words do not matter.' },
    { t: 'predict', q: "Which constraint is most likely to be followed reliably?", options: ["Keep it fairly brief", "Make it engaging but not too chatty", "Exactly three bullets, each under 15 words", "Write like a professional"], answer: 2, explain: "Concrete, countable limits leave little room for interpretation, and you can check them in a second. Vague tone words are read differently each time.", skill: 'l1.constraints' },
    { t: 'callout', kind: 'misconception', title: '“It followed my rules, so it is right”', md: "Constraints control *form*. A perfectly formatted five-bullet summary can still contain a wrong figure. Obeying instructions and being accurate are separate things; you still check content." },
    { t: 'try', prompt: "This prompt is tangled: “Write a short, fun but professional update on our fundraiser, don’t make it too long or boring, mention the amount raised and thank everyone and use a good tone.” Rewrite it with labelled parts and testable constraints. Invent £2,340 raised.", sample: "TASK: Write a newsletter update on the summer fundraiser.\nFACTS: £2,340 raised; 14 volunteers; money goes to the library refurbishment.\nRULES: 90–110 words. Warm, light tone, no exclamation marks. Thank volunteers by role, not by name. End with the date of the next event (to be filled in by me).\nFORMAT: One paragraph, no heading.\nA marker can now test each rule: word count, tone, facts present, format." }
  ],
  reteach: [
    { style: 'analogy', md: "Instructions are the frame around a picture. The picture (content) can still be wrong, but a good frame stops it spilling over the wall. Be exact about the frame’s size and shape: 100 words, 5 bullets, plain English." },
    { style: 'simple', md: "Say what you want, in numbers where you can. “Under 100 words”, “three bullets”, “plain English”. Avoid fuzzy words such as “short”, “nice”, “professional” on their own." },
    { style: 'step-by-step', md: "1. Write the task in one sentence. 2. Put the material in its own labelled section. 3. List rules, each one checkable. 4. Order them if they could clash. 5. Say what to do if the task cannot be done. 6. Check the output against each rule." }
  ],
  quiz: [
    { id: 'l1-03-q1', skill: 'l1.constraints', type: 'mcq', difficulty: 2,
      q: "Which is the BEST constraint for a one-page handout?",
      options: ["Keep it reasonably concise", "No more than 200 words and 4 headings, plain English for Year 7", "Make it punchy", "Don’t waffle"],
      answer: 1, hints: ["Which one could you verify in ten seconds?", "Which names the reader as well as the limit?"],
      explain: "A measurable limit plus a defined reader leaves little to interpret. The others depend on the model's guess at your taste." },
    { id: 'l1-03-q2', skill: 'l1.constraints', type: 'mcq', difficulty: 3,
      q: "A user writes: “Be extremely thorough. Keep the answer under 40 words.” The answer is 38 words and misses key points. What went wrong with the prompt?",
      options: ["The model ignored the rules", "The two constraints conflict and no priority was given", "40 words is too short for any model", "The user should have said “please”"],
      answer: 1, wrong: { '0': "It obeyed one of them; the instructions themselves pulled in opposite directions." },
      hints: ["Can an answer be both exhaustive and 40 words?", "What would have told the model which rule wins?"],
      explain: "Conflicting constraints force the model to pick silently. State a priority (“if you cannot fit everything, keep the three most important points”) or relax one rule." },
    { id: 'l1-03-q3', skill: 'l1.constraints', type: 'multi', difficulty: 2,
      q: "Select ALL the prompt features that make a constraint easier to follow and check.",
      options: ["A number (words, bullets, items)", "A named format (table, numbered list)", "A named reader and reading level", "Capital letters and exclamation marks", "A fallback for when information is missing"],
      answer: [0, 1, 2, 4], hints: ["What can you count or see at a glance?", "One option is emphasis, not content."],
      explain: "Numbers, formats, reader level and fallbacks all reduce ambiguity. Shouting adds emphasis without adding information." },
    { id: 'l1-03-q4', skill: 'l1.constraints', type: 'mcq', difficulty: 3,
      q: "You asked for “a table of five dates, from the text only”. The reply gives a clean table with five dates, one of which is not in your text. What is the most accurate description?",
      options: ["The constraint failed completely", "The format constraint worked but the ‘from the text only’ rule was broken: check content as well as shape", "The table is fine since it looks right", "The model should be told to use bold"],
      answer: 1, hints: ["Which rules were obeyed, which were not?", "Looking right is not the same as being right."],
      explain: "Models are often better at following format rules than faithfulness rules. A neat shape can hide a wrong cell, so check every item against the source." },
    { id: 'l1-03-q5', skill: 'l1.constraints', type: 'short', difficulty: 2,
      q: "What instruction would you add to stop the assistant guessing when it lacks a needed fact?",
      accept: ["(ask|tell).*(question|me|missing|unclear|clarif)", "(say|state).*(don.t know|unknown|not (given|provided|known|sure))", "(if).*(missing|unclear|not (given|provided|known))"],
      model: "“If any information you need is missing, ask me one question before answering, rather than guessing.”",
      hints: ["Give it permission to stop.", "Tell it what to do instead of guessing."],
      explain: "Without an exit, the model usually fills the gap with something plausible. Permission to ask or to say “unknown” changes the default." }
  ],
  takeaways: [
    "Constraints control form: length, format, order, tone, what to include and avoid.",
    "Make them testable, positive and ranked if they might clash.",
    "Label the parts of a longer prompt: task, material, rules, fallback.",
    "A well-formatted answer can still be wrong, so keep checking content."
  ],
  apply: "Take a prompt you reuse and convert every fuzzy word (“short”, “friendly”) into a number or a named standard."
},

{
  id: 'l1-04',
  title: 'Examples and structured outputs',
  hook: 'Show the pattern you want, and ask for data in a shape other software and other people can use.',
  minutes: 16,
  skills: ['l1.examples', 'l1.structured'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Sometimes the quickest way to say what you want is to *show* it. A prompt that includes one or more worked examples of input and ideal output is called **few-shot prompting** (“shot” means example). With no examples it is **zero-shot**." },
    { t: 'h', text: 'Examples teach format, tone and judgement' },
    { t: 'code', lang: 'text', src: `Classify each comment as PRAISE, COMPLAINT or QUESTION.

Comment: "The after-school club is brilliant."
Label: PRAISE

Comment: "Why was the bus late again?"
Label: QUESTION

Comment: "Nobody replied to my email for a week."
Label: COMPLAINT

Comment: "Thanks for sorting the lost coat so quickly."
Label:`, caption: 'The final line is left open for the model to complete in the same pattern.' },
    { t: 'p', md: "Good examples are **varied** (cover the real range, including awkward cases), **correct** (a wrong example teaches a wrong pattern) and **consistent** in format. Two or three well-chosen examples usually beat ten similar ones." },
    { t: 'callout', kind: 'warn', title: 'The model copies your examples, flaws included', md: "If all your examples are three words long, you will get three-word answers. If every example is a complaint, it may lean towards “complaint”. Check that the examples look like the spread you want." },
    { t: 'widget', w: 'promptlab', props: { task: 'extract' }, caption: 'Turn the examples part on and off, and compare the formats of the replies.', skill: 'l1.examples' },
    { t: 'h', text: 'Structured outputs' },
    { t: 'p', md: "If a person will read the answer, a table or bullet list may be enough. If another tool will read it (a spreadsheet, a form, a script), ask for a strict structure such as **JSON** (a text format for labelled data) and describe the fields. A **schema** is the written description of the shape: which fields exist, their types, and which values are allowed." },
    { t: 'code', lang: 'json', src: `{
  "title": "string",
  "date": "YYYY-MM-DD",
  "category": "one of: trip, event, deadline",
  "needs_action": true
}`, caption: 'A tiny schema described by example. State the allowed values and the date format explicitly.' },
    { t: 'widget', w: 'jsonschema', props: {}, caption: 'Try breaking the JSON in the typical ways: extra prose, wrong type, missing field. Then repair it.', skill: 'l1.structured' },
    { t: 'callout', kind: 'tip', title: 'Make the format hard to get wrong', md: "Say “Return only the JSON, with no other text.” Give allowed values for categories. Ask for `null` when a value is not in the source, rather than a guess. Then validate: parse it, and check required fields exist." },
    { t: 'callout', kind: 'misconception', title: '“Valid JSON means correct data”', md: "A validator checks the *shape*. A date of 2025-02-30 can pass as a string and still be impossible, and a plausible name can be invented. Structure makes checking easier; it does not do the checking." },
    { t: 'try', prompt: "Write a two-example few-shot prompt that turns messy notes (“Sam, Tues, bring pe kit”) into a line of the form `Name | Day | Action`. Add a third, unfinished example for the model to complete.", sample: "Turn each note into: Name | Day | Action\n\nNote: Sam, Tues, bring pe kit\nOutput: Sam | Tuesday | Bring PE kit\n\nNote: priya wed - library books back\nOutput: Priya | Wednesday | Return library books\n\nNote: Jo fri sign trip form\nOutput:\n\nNotice the second example normalises case and spelling out the day, so the model learns those rules without being told." }
  ],
  reteach: [
    { style: 'analogy', md: "Training a new colleague to file forms: you can explain the rules at length, or you can do two forms in front of them and say “like that”. Examples are the second route, and people (and models) usually pick up the pattern fast, quirks included." },
    { style: 'simple', md: "Show, don’t only tell. Put two or three input-and-ideal-output pairs in the prompt, then give the new input. For machine-readable results, describe the exact fields and ask for only that." },
    { style: 'technical', md: "Few-shot examples condition the model's next-token predictions on the demonstrated pattern: the context makes outputs matching the example format far more probable. For structured outputs, a schema constrains the target shape; a validator then checks types, required fields and allowed values, but not factual truth." }
  ],
  quiz: [
    { id: 'l1-04-q1', skill: 'l1.examples', type: 'mcq', difficulty: 2,
      q: "You give three examples, all of which are polite, five-word replies. What will the model most likely produce for a new, complicated enquiry?",
      options: ["A thorough multi-paragraph reply", "A short, polite reply that may be too thin", "A refusal", "A random format"],
      answer: 1, hints: ["Models imitate the pattern they are shown.", "What do all the examples have in common?"],
      explain: "Examples set expectations for length and style as well as content. If you want range, include a variety of cases, including a hard one." },
    { id: 'l1-04-q2', skill: 'l1.examples', type: 'multi', difficulty: 2,
      q: "Select ALL the qualities of a good set of examples.",
      options: ["They are correct", "They cover the real variety of inputs, including an awkward case", "They share an identical format", "They are as numerous as possible, at any quality", "They are all nearly the same"],
      answer: [0, 1, 2], hints: ["Which options protect you from teaching a wrong pattern?", "Quantity is not the goal."],
      explain: "Correct, varied, consistent examples work. Many near-identical or flawed examples teach a narrow or wrong pattern." },
    { id: 'l1-04-q3', skill: 'l1.structured', type: 'mcq', difficulty: 3,
      q: "An assistant returns this for a request for JSON:",
      code: `Sure! Here's the data:\n{"title": "Sports Day", "date": "12 June", "needs_action": "yes"}`,
      options: ["It is fine; a human can read it", "Three issues: chatty prefix will break parsing, the date is not in the requested ISO format, and needs_action is a string not a boolean", "Only the prefix is a problem", "The only problem is that it should use single quotes"],
      answer: 1, wrong: { '2': "The prefix is one problem, but the values also break the schema." },
      hints: ["Could a program parse the whole reply as JSON?", "Compare each field with the schema you described: types and formats."],
      explain: "The prefix prevents parsing, the date is not YYYY-MM-DD and the flag is text rather than true/false. Fix by demanding “only the JSON”, giving the date format and the type, then validating." },
    { id: 'l1-04-q4', skill: 'l1.structured', type: 'mcq', difficulty: 3,
      q: "A script validates the model's JSON and it passes the schema every time. Your colleague concludes the extracted data is reliable. What is the flaw?",
      options: ["None; a validator proves correctness", "Validation proves shape only; values can be wrong or invented, so spot-check against the source", "Validators only work on short outputs", "JSON cannot hold dates"],
      answer: 1, hints: ["What does a schema check: format or truth?", "Could a perfectly shaped record contain the wrong date?"],
      explain: "Schemas check structure, types and allowed values. They cannot tell whether a date is the right one. Sample outputs against the source." },
    { id: 'l1-04-q5', skill: 'l1.structured', type: 'order', difficulty: 2,
      q: "Order a sensible workflow for extracting data from messy text into a table.",
      items: ["Decide the fields and allowed values", "Write a prompt with the schema and one or two examples", "Run it on a small sample", "Validate the structure and spot-check values against the source", "Fix the prompt, then run the full batch"],
      hints: ["Design before running.", "Try small before big."],
      explain: "Define the target, show it, test small, check both shape and truth, then scale. Running a big batch first multiplies mistakes." }
  ],
  takeaways: [
    "Few-shot prompting means showing one or more input and ideal-output examples.",
    "Examples should be correct, varied and consistently formatted: the model copies their flaws too.",
    "For machine-readable results, describe a schema, request only the data, allow null, and validate.",
    "A valid structure is not a true one: spot-check values against the source."
  ],
  apply: "Pick a repetitive text task (labelling emails, tidying notes). Write a prompt with two examples and test it on five real items; note where it slips."
}
];
