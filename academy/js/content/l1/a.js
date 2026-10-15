// L1 lessons 01-04
export default [
{
  id: 'l1-01',
  title: 'Say what you mean: clarity, task and audience',
  hook: 'Skip ahead if you already do this (jump to the quiz and go on if you score 4/4); if not, every detail you leave out is filled in with a guess.',
  minutes: 14,
  skills: ['l1.clarity'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "In Level 0 you learned that a language model continues text it has been given, one small piece at a time. That explains the first rule of using one well: **it responds to what is on the page, not to what is in your head.** You already know what AI is. What has been missing is how to steer it." },
    { t: 'callout', kind: 'tip', title: 'Skip ahead if you already do this', md: "If you use an assistant every week and your requests already state the task, the reader and the purpose, go straight to the quiz. Score four out of four and move on to lesson 2. The lessons on research and verification (6 to 10) matter most for everyone." },
    { t: 'p', md: "Think of a very capable temporary member of staff who has never met you. They are quick, well-read and keen to please, but they know nothing about your school, your reader or your purpose. If you say “write something about the trip”, they will produce something. It will be the most *typical* something, which is rarely the something you needed." },
    { t: 'h', text: 'Three things every good request contains' },
    { t: 'list', items: [
      "**Task**: the action, in a verb. “Draft”, “summarise”, “compare”, “check” are all different jobs.",
      "**Audience**: who will read or use the result. A note for parents and a note for governors are different documents.",
      "**Purpose**: what the result is for and what a good one looks like. “So that parents can decide whether to sign the consent form by Friday” is worth ten adjectives."
    ] },
    { t: 'callout', kind: 'why', title: 'Why vagueness costs you', md: "When a request leaves a gap, the model fills it with the most common pattern in its training text. Vague in, generic out. That is not laziness on its part; it is the only thing it can do with the information it has." },
    { t: 'widget', w: 'promptlab', props: { task: 'email' }, caption: "Choose “Reply to a late-parcel email” in the Task menu. Press “Task only”, then switch on one part at a time (Context, Constraints, Output format…) and watch the score and the simulated reply change. The six parts here cover the same ground as task, audience and purpose: audience lives in Role and Context, purpose in Task and Constraints.", skill: 'l1.clarity' },
    { t: 'predict', q: "In the lab above you leave Task switched on but switch the *Context* part off (the customer's name, order number and reason for delay). What happens to the reply?", options: ["It refuses to answer", "It becomes vague: no order number, reason or date", "It becomes more accurate, since it has fewer things to juggle", "Nothing changes, because the task alone is enough"], answer: 1, explain: "The model cannot know facts you did not provide, so it fills the gap with generic wording. That is exactly what the lab shows: vague apology, no order number, no date.", skill: 'l1.clarity' },
    { t: 'compare', title: 'Same job, two requests', cols: ['Weak', 'Stronger'], rows: [
      ["Write about the new forklift rules.", "Write a 120-word update for the ops team about the new forklift safety rules. Tone: direct and factual. End with the one thing each shift lead must do by Friday."],
      ["Make this better.", "Edit this paragraph for a new starter on their first day: shorter sentences, no jargon, keep every fact. Show the result only."],
      ["Summarise the report.", "Summarise the attached carrier performance report in five bullets for a regional manager deciding whether to renew the contract. Put the on-time rate and the main risk first."]
    ] },
    { t: 'callout', kind: 'misconception', title: 'There are no magic words', md: "People swap “secret prompt formulas” as if certain phrases unlock hidden power. What actually works is ordinary clarity: a clear task, a clear reader, a clear purpose. A longer prompt is not automatically better; a *more specific* one is." },
    { t: 'try', prompt: "Here is a weak request: “Write something about the delayed shipment.” Rewrite it so that it states the task, the audience and the purpose. Invent plausible details.", sample: "A model rewrite: “Write a 100-word update to our key account manager at Northfield Retail about shipment NR-4471, held at customs since Monday. Purpose: she must decide by 3pm whether to reroute by air. Tone: calm and factual. Include the cost difference (about 1,800 pounds) and the revised ETA for each option.” Notice it names the task (update), the reader (key account manager), the purpose (a decision by 3pm) and supplies facts the model could not know." },
    { t: 'reveal', label: 'A check you can run on any prompt', md: "Ask yourself: *if I handed this note to a competent stranger, could they do the job without coming back with five questions?* If not, answer those questions in the prompt first." }
  ],
  reteach: [
    { style: 'analogy', md: "Ordering at a café: “a coffee” gets you the house default. “A large oat flat white, to take away” gets what you wanted. The barista is not being difficult; the first order simply left the choices open. Your prompt is your order." },
    { style: 'simple', md: "Three questions before you press send: What do I want done? Who is it for? What is it for? If your prompt answers all three, it is already better than most." },
    { style: 'step-by-step', md: "1. Write the verb (draft, summarise, check). 2. Add the object (a letter, a table, five bullets). 3. Name the reader. 4. State the purpose or decision it supports. 5. Add any facts the model cannot know. 6. Read it as a stranger would." }
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
      "**Situation**: “We are a regional freight forwarder and our Rotterdam consolidation has slipped by two days.”",
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
          { text: 'A shipment list with consignee names, addresses and phone numbers', bucket: 'Remove or anonymise first', why: 'Replace names with labels such as “Consignee A” and drop addresses and phone numbers unless the wording genuinely needs them; check policy first.' },
          { text: 'A customer complaint email with names and an order number', bucket: 'Remove or anonymise first', why: 'Strip names, contact details and reference numbers; the wording is what you need help with.' },
          { text: 'Passwords, API keys or login codes', bucket: 'Do not paste', why: 'Secrets must never be pasted into chat. If one was, treat it as exposed and change it.' },
          { text: 'An employee’s medical or disciplinary file', bucket: 'Do not paste', why: 'Highly sensitive and usually covered by strict rules. Do not use a general chat assistant for them.' },
          { text: 'Draft quarterly margins marked confidential, in a free personal chatbot account', bucket: 'Do not paste', why: 'Not in a personal account. In an approved company tool covered by a data agreement the same data may be fine: the rule is policy and tool, not the data type alone.' }
        ] }, caption: 'Sort each item, then check the reasons.' },
    { t: 'current', key: 'privacy-check' },
    { t: 'callout', kind: 'misconception', title: '“I deleted it, so it is gone”', md: "Deleting a chat from your history is not the same as every copy ceasing to exist. Retention and review rules vary by service. Treat anything you paste as shared with a third party, and anonymise as a habit." },
    { t: 'try', prompt: "Rewrite this so it is useful but safe: “Dana Okoye at Harbour Freight (07700 900123) has chased shipment HF-20931 for a week and says our depot lost it. Draft a reply.”", sample: "“Draft a calm, professional reply from an account manager to a customer who believes the carrier lost their consignment after a week of chasing. Acknowledge the frustration, say we are tracing the shipment and will update within 24 hours, do not admit liability, do not name staff. Tone: warm but firm. 120 words.” The name, phone number and shipment reference are gone; the model needs only the situation and the desired tone." }
  ],
  reteach: [
    { style: 'analogy', md: "Briefing a temp who covers your desk for a week: you leave the procedures, the contact list for suppliers and what is in progress. You do not leave the safe combination or other people’s confidential files. Give the helper what lets them do the job; hold back what could cause harm." },
    { style: 'simple', md: "Two jobs. One: add what the model cannot possibly know. Two: before you press send, remove names, numbers and secrets. If you would not post it on a public noticeboard, think carefully before pasting it." },
    { style: 'step-by-step', md: "1. List the facts the answer depends on. 2. Paste or summarise them, labelled. 3. Say whether to use only that material. 4. Scan for personal data, secrets and confidential items. 5. Replace names with labels such as “Pupil A”. 6. Send." }
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
    { t: 'widget', w: 'promptlab', props: { task: 'summary' }, caption: 'Choose “Summarise a council report” in the Task menu. Switch Constraints and Output format on and off, one at a time. What changes, and what stays the same?', skill: 'l1.constraints' },
    { t: 'h', text: 'A prompt with sections' },
    { t: 'code', lang: 'text', src: `TASK
Summarise the report below for a busy regional manager.

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
    { t: 'try', prompt: "This prompt is tangled: “Write a short, upbeat but professional update on the warehouse safety record, don’t make it too long or boring, mention the days without an accident and thank everyone and use a good tone.” Rewrite it with labelled parts and testable constraints. Invent 312 days without a lost-time injury.", sample: "TASK: Write a team update on the warehouse safety record.\nFACTS: 312 days without a lost-time injury; 14 near-miss reports this quarter; new forklift training starts in May.\nRULES: 90–110 words. Upbeat but plain tone, no exclamation marks. Thank the shift leads by role, not by name. End with the date of the next safety briefing (to be filled in by me).\nFORMAT: One paragraph, no heading.\nA marker can now test each rule: word count, tone, facts present, format." }
  ],
  reteach: [
    { style: 'analogy', md: "Instructions are the frame around a picture. The picture (content) can still be wrong, but a good frame stops it spilling over the wall. Be exact about the frame’s size and shape: 100 words, 5 bullets, plain English." },
    { style: 'simple', md: "Say what you want, in numbers where you can. “Under 100 words”, “three bullets”, “plain English”. Avoid fuzzy words such as “short”, “nice”, “professional” on their own." },
    { style: 'step-by-step', md: "1. Write the task in one sentence. 2. Put the material in its own labelled section. 3. List rules, each one checkable. 4. Order them if they could clash. 5. Say what to do if the task cannot be done. 6. Check the output against each rule." }
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
    { t: 'code', lang: 'text', src: `Classify each customer message as PRAISE, COMPLAINT or QUESTION.

Message: "The driver was brilliant, thank you."
Label: PRAISE

Message: "Where can I see Tuesday's delivery slot?"
Label: QUESTION

Message: "Nobody replied to my email for a week."
Label: COMPLAINT

Message: "Thanks for sorting the damaged pallet so quickly."
Label:`, caption: 'The final line is left open for the model to complete in the same pattern.' },
    { t: 'p', md: "Good examples are **varied** (cover the real range, including awkward cases), **correct** (a wrong example teaches a wrong pattern) and **consistent** in format. Two or three well-chosen examples usually beat ten similar ones." },
    { t: 'callout', kind: 'warn', title: 'The model copies your examples, flaws included', md: "If all your examples are three words long, you will get three-word answers. If every example is a complaint, it may lean towards “complaint”. Check that the examples look like the spread you want." },
    { t: 'widget', w: 'promptlab', props: { task: 'extract' }, caption: 'Choose “Extract fields from an invoice” in the Task menu. Turn the Example and Output format parts on and off, and compare the shapes of the replies.', skill: 'l1.examples' },
    { t: 'h', text: 'Structured outputs' },
    { t: 'p', md: "If a person will read the answer, a table or bullet list may be enough. If another tool will read it (a spreadsheet, a form, a script), ask for a strict structure such as **JSON** (a text format for labelled data) and describe the fields. A **schema** is the written description of the shape: which fields exist, their types, and which values are allowed." },
    { t: 'code', lang: 'json', src: `{
  "ref": "HF-20931",
  "eta": "2026-06-12",
  "status": "one of: on_time, delayed, held",
  "needs_action": true
}`, caption: 'A tiny schema described by example. State the allowed values and the date format explicitly.' },
    { t: 'callout', kind: 'analogy', title: 'Before you open the checker: what a schema is', md: "A schema is just the rules printed on a form: which boxes exist, which must be filled in, whether a box takes text or a number, and which choices are allowed (a tick-box with fixed options). The checker below applies those rules to a filled-in form and tells you, in plain English, which box is wrong. You do not need to read the rules text on the right; focus on the error messages." },
    { t: 'widget', w: 'jsonschema', props: {}, caption: 'Look at the error messages, not the rules text. Try breaking the filled-in form the typical ways: extra chatter, a number in quotes, a missing box. Then repair it.', skill: 'l1.structured' },
    { t: 'callout', kind: 'tip', title: 'Make the format hard to get wrong', md: "Say “Return only the JSON, with no other text.” Give allowed values for categories. Ask for `null` when a value is not in the source, rather than a guess. Then validate: parse it, and check required fields exist." },
    { t: 'callout', kind: 'misconception', title: '“Valid JSON means correct data”', md: "A validator checks the *shape*. A date of 2025-02-30 can pass as a string and still be impossible, and a plausible name can be invented. Structure makes checking easier; it does not do the checking." },
    { t: 'try', prompt: "Write a two-example few-shot prompt that turns messy notes (“Sam, Tues, check dock 4 seals”) into a line of the form `Name | Day | Action`. Add a third, unfinished example for the model to complete.", sample: "Turn each note into: Name | Day | Action\n\nNote: Sam, Tues, check dock 4 seals\nOutput: Sam | Tuesday | Check dock 4 seals\n\nNote: priya wed - carrier invoices back\nOutput: Priya | Wednesday | Return carrier invoices\n\nNote: Jo fri sign customs form\nOutput:\n\nNotice the second example normalises case and spells out the day, so the model learns those rules without being told." }
  ],
  reteach: [
    { style: 'analogy', md: "Training a new colleague to file forms: you can explain the rules at length, or you can do two forms in front of them and say “like that”. Examples are the second route, and people (and models) usually pick up the pattern fast, quirks included." },
    { style: 'simple', md: "Show, don’t only tell. Put two or three input-and-ideal-output pairs in the prompt, then give the new input. For machine-readable results, describe the exact fields and ask for only that." },
    { style: 'technical', md: "Few-shot examples condition the model's next-token predictions on the demonstrated pattern: the context makes outputs matching the example format far more probable. For structured outputs, a schema constrains the target shape; a validator then checks types, required fields and allowed values, but not factual truth." }
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
