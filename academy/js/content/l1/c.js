// L1 lessons 08-10
export default [
{
  id: 'l1-08',
  title: 'Analysis and images: what to trust in data, documents and pictures',
  hook: 'Assistants can read a spreadsheet or a photo in seconds; the skill is knowing which parts of what they say to believe.',
  minutes: 16,
  skills: ['l1.analysis', 'l1.multimodal'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Many assistants can now take in files and pictures as well as text; that is called being **multimodal** (more than one kind of input). That opens up useful jobs: summarising a long report, tidying a table, explaining a chart, describing a photo, reading a handwritten note. It also opens up new ways to be misled." },
    { t: 'h', text: 'Analysing documents and data' },
    { t: 'p', md: "Good uses: pulling the main points from a long document; drafting formulas; suggesting how to clean messy columns; listing patterns worth investigating; explaining what a result means in plain words." },
    { t: 'p', md: "The danger is that the answer *sounds* like analysis. A model asked about a spreadsheet may be reading only part of it, may miscount, and may report a trend that is not there. Two things matter: **what it actually did** (read the numbers, or wrote and ran code, or guessed from the first rows?) and **whether you can reproduce the result**." },
    { t: 'compare', title: 'What to trust, roughly', cols: ['Usually reasonable to lean on', 'Always verify'], rows: [
      ["Explaining what a column or term means", "Totals, averages, counts and percentages: recompute in the spreadsheet"],
      ["Suggesting a formula or chart type", "Any claimed trend, outlier or correlation: look at the data yourself"],
      ["Summarising the main points of a document", "Quoted figures and quotations: find them in the original"],
      ["Spotting inconsistent formatting", "Anything about rows it may not have read: ask how many rows it saw"]
    ] },
    { t: 'callout', kind: 'tip', title: 'Make it show its method', md: "Ask: “How many rows did you read? Show the formula or code you used. Give three example rows that support your finding.” A claim you can trace to rows is far more trustworthy than a bare conclusion." },
    { t: 'predict', q: "You upload a spreadsheet of 2,000 survey responses and the assistant says “about 62% were satisfied”. What is the best first check?", options: ["Accept it; averages are simple", "Ask how it counted, then compute the figure yourself with a filter or formula, and check how many rows it actually used", "Ask it to say it again with more decimals", "Ask it to round to the nearest 10%"], answer: 1, explain: "The headline number may rest on a partial read, a miscount or a different definition of ‘satisfied’. Recomputing takes seconds and settles it.", skill: 'l1.analysis' },
    { t: 'h', text: 'Using images' },
    { t: 'list', items: [
      "**Good uses**: describe a diagram for a screen-reader user, transcribe typed text from a photo, explain a chart, suggest what a plant or part might be, give feedback on a layout.",
      "**Limits**: it can misread small or blurry text, miscount objects, misjudge sizes and invent details that are not in the picture. Handwriting and unusual layouts are error-prone.",
      "**High-stakes images** (medical scans, safety checks, legal evidence, identifying a mushroom to eat) are not for a general assistant to decide. Use a qualified person or proper tool.",
      "**Privacy**: photos contain faces, locations, number plates, documents and other people's information. Think before uploading, as with text."
    ] },
    { t: 'callout', kind: 'why', title: 'Ask it to point to what it sees', md: "“Quote the exact text you read from the image, then answer.” If the quote is wrong, you have found the problem before it spreads into the answer." },
    { t: 'current', key: 'multimodal-check' },
    { t: 'h', text: 'Generating images' },
    { t: 'p', md: "Image generators follow the same principles as text: be specific about subject, style, composition and what to avoid. Treat results as illustrations, not evidence: a generated image of an event is not a photograph of it. Label AI-generated images where it matters, and take care with copyright, likenesses of real people and anything that could mislead viewers." },
    { t: 'try', prompt: "You have a photo of a handwritten timetable. Write a prompt that gets a clean table AND lets you check the transcription.", sample: "“Read the handwritten timetable in this photo. First, transcribe it exactly, line by line, marking any word you are unsure of with [?]. Then present it as a table with columns Day, Time, Subject, Room. Do not guess missing entries: leave them blank and list them below the table.” Then compare two or three cells with the photo yourself." }
  ],
  reteach: [
    { style: 'analogy', md: "A bright new assistant who skims your spreadsheet and gives you a verbal report. They are quick and often right, but if they only looked at the first page they will not tell you unless you ask. You wouldn’t put their total in the accounts without checking it." },
    { style: 'simple', md: "Let it explain, suggest and summarise. Recompute numbers yourself. Ask what it actually looked at. For pictures, ask it to quote or point to what it sees, and don't use it for high-stakes judgements." },
    { style: 'step-by-step', md: "1. Say what you want from the file. 2. Ask how many rows or pages it used. 3. Request the formula or method. 4. Recompute the headline figure. 5. Spot-check three examples against the source. 6. Only then use the result." }
  ],
  quiz: [
    { id: 'l1-08-q1', skill: 'l1.analysis', type: 'mcq', difficulty: 2,
      q: "An assistant reports that “sales rose steadily through the year” from your spreadsheet. Which is the best response?",
      options: ["Quote it in your report", "Plot the monthly figures yourself and compare; ask which rows it used", "Ask it to be more confident", "Ask it to change the wording to “grew strongly”"],
      answer: 1, hints: ["Can you see the trend with your own eyes in a minute?", "Does the claim depend on rows it may not have read?"],
      explain: "A plot or sum takes a minute and tests the claim directly. Describing a pattern in fluent prose is easier than finding it." },
    { id: 'l1-08-q2', skill: 'l1.analysis', type: 'multi', difficulty: 2,
      q: "Select ALL statements about using assistants on data that are sound.",
      options: ["Ask how many rows it read", "Ask for the formula or code used so you can reproduce it", "Recompute headline totals yourself", "A confident tone means the numbers are right", "Spot-check a few rows against the claim"],
      answer: [0, 1, 2, 4], hints: ["Which options make the result reproducible?", "One option trusts style."],
      explain: "Scope, method, recomputation and spot checks make an analysis trustworthy. Tone is not evidence." },
    { id: 'l1-08-q3', skill: 'l1.multimodal', type: 'mcq', difficulty: 2,
      q: "You photograph a medicine label and ask an assistant if two medicines can be taken together. What is the sensible approach?",
      options: ["Rely on the answer; it read the label", "Use it, if at all, only to read the label text clearly; get the safety judgement from a pharmacist or the official leaflet", "Ask three assistants and pick the majority", "Ask it to be very sure"],
      answer: 1, wrong: { '2': "Several models can share the same blind spots; a majority vote is not a safety check." },
      hints: ["Is this a high-stakes judgement?", "Who is accountable for medical advice?"],
      explain: "Reading text from a photo is a reasonable use (check the transcription). Safety-critical decisions need a qualified source." },
    { id: 'l1-08-q4', skill: 'l1.multimodal', type: 'short', difficulty: 3,
      q: "Give one instruction that lets you check whether an assistant misread text in an image.",
      accept: ["(quote|transcribe|repeat|write out).*(exact|text|word|line)", "(mark|flag|say).*(unsure|unclear|uncertain|\\[\\?\\])", "(show|list).*(what you (read|see))"],
      model: "“First transcribe the text exactly as you read it, marking anything uncertain, then answer.”",
      hints: ["Make the first step something you can compare with the picture.", "Ask it to expose its reading before the conclusion."],
      explain: "A literal transcription lets you compare against the image; a misreading is then caught before it spreads into the answer." },
    { id: 'l1-08-q5', skill: 'l1.multimodal', type: 'mcq', difficulty: 3,
      q: "A colleague uses an AI-generated image of a flooded street in a news post, captioned as if it were a photo of last night's event. What is wrong?",
      options: ["Nothing; it is illustrative", "A generated image is not evidence of an event; presenting it as a photograph misleads readers, so label it or use a real photo", "The resolution", "The caption is too long"],
      answer: 1, hints: ["What does a reader assume a news image is?", "What would honest labelling look like?"],
      explain: "Generated images can look realistic but record nothing. Passing them off as real documentation is deceptive; label them clearly." }
  ],
  takeaways: [
    "Multimodal assistants can read files and pictures, but can still miscount, misread or invent detail.",
    "Ask what it actually looked at and how it worked; recompute headline figures yourself.",
    "For images, ask for a literal transcription first; avoid high-stakes judgements.",
    "Generated images are illustrations, not evidence: label them honestly, and mind privacy and copyright."
  ],
  apply: "Give an assistant a small table you know well. Ask for a summary and check every number it states."
},

{
  id: 'l1-09',
  title: 'Coding with AI for non-experts, and building your prompt library',
  hook: 'You can get a working formula or a small script without being a programmer, if you stay in control of what runs.',
  minutes: 16,
  skills: ['l1.coding', 'l1.workflow'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Assistants are good at small, well-described coding jobs: a spreadsheet formula, a script that renames files, a regular expression, a short web page. For non-programmers that can feel like magic. It is not magic, and you remain responsible for anything you run." },
    { t: 'h', text: 'A safe way to work' },
    { t: 'steps', items: [
      { title: 'Describe the job with example input and output', md: "“Given a column of names like ‘smith, jo’, produce ‘Jo Smith’.” Examples remove ambiguity and give you a test." },
      { title: 'Ask for an explanation in plain English', md: "“Explain what each line does as if I have never coded.” If you cannot follow it, you cannot judge it." },
      { title: 'Test on a small copy', md: "Run on dummy data or a copy of your file first. Never try new code on the only copy of something important." },
      { title: 'Check it against your examples, plus an awkward case', md: "Empty cells, odd characters, a missing value. Ask what happens in those cases." },
      { title: 'Read for anything that deletes, sends or spends', md: "Be extra careful with code that removes files, emails people, or connects to accounts." }
    ] },
    { t: 'callout', kind: 'warn', title: 'Security and secrets', md: "Don't paste passwords, keys or private data into prompts. Be suspicious of code that downloads and runs things from the internet, asks for your credentials, or uses a package you have not heard of: assistants sometimes suggest software libraries that do not exist, and attackers can register such names." },
    { t: 'callout', kind: 'misconception', title: '“It ran without errors, so it is correct”', md: "Code can run perfectly and still do the wrong thing, such as dropping rows or mis-rounding. Passing your examples is a start; thinking about edge cases and checking real output is the rest." },
    { t: 'current', key: 'tools-check' },
    { t: 'h', text: 'Productivity: workflows and a prompt library' },
    { t: 'p', md: "The real gains come from repeating what works. A **prompt library** is a small collection of your tested prompts, saved with a note on when to use each and what to check. A **workflow** is a repeatable sequence: draft with the assistant, check against a source, edit yourself, then send." },
    { t: 'widget', w: 'flow', props: { title: 'A dependable AI-assisted workflow', height: 280,
        nodes: [
          { id: 'need', label: 'Your task and facts', x: 10, y: 50, kind: 'input', note: 'You decide what is wanted and gather the real facts.' },
          { id: 'prompt', label: 'Tested prompt from library', x: 32, y: 50, kind: 'process', note: 'Reuse a prompt that has worked, and fill in the blanks.' },
          { id: 'ai', label: 'Assistant drafts', x: 54, y: 50, kind: 'model', note: 'A first draft only. Treat it as a suggestion.' },
          { id: 'check', label: 'You verify', x: 74, y: 25, kind: 'human', note: 'Check facts, numbers, sources and tone against the real material.' },
          { id: 'final', label: 'Final result', x: 92, y: 50, kind: 'output', note: "Your name, or your organisation's name, goes on this." },
          { id: 'log', label: 'Improve the prompt', x: 54, y: 82, kind: 'store', note: 'Note what failed and update the library.' }
        ],
        edges: [['need', 'prompt'], ['prompt', 'ai'], ['ai', 'check'], ['check', 'final'], ['check', 'log', 'if flawed'], ['log', 'prompt']],
        steps: [
          { show: ['need', 'prompt'], text: 'Start with your facts and a tested prompt.' },
          { show: ['ai'], text: 'The assistant produces a draft.' },
          { show: ['check', 'final'], text: 'You verify before anything goes out.' },
          { show: ['log'], text: 'Failures improve the prompt for next time.' }
        ] }, caption: 'Step through, or click a box for its note.' },
    { t: 'code', lang: 'text', src: `PROMPT NAME: Parent letter (consent + payment)
USE WHEN: Any trip or event needing a return slip
PROMPT:
  Write a letter to parents of [YEAR GROUP] about [EVENT] on [DATE].
  Purpose: they must [ACTION] by [DEADLINE]. Cost: [COST].
  Tone: warm, brisk. 120-150 words. Plain English. No exclamation marks.
  Use only the facts above; if anything is missing, ask me.
CHECK BEFORE SENDING: date, cost, deadline, who to contact.
LAST TESTED: [date] - worked well; tends to add "exciting" - banned in rules.`, caption: 'One entry in a prompt library. The CHECK line is what turns a prompt into a dependable routine.' },
    { t: 'try', prompt: "Choose a task you do weekly (for example a status email or meeting notes). Write it as a library entry with name, when to use, prompt with [BLANKS], and a CHECK line.", sample: "NAME: Weekly team update. USE WHEN: Friday, to summarise progress. PROMPT: “Turn these notes into a 120-word update for [AUDIENCE]: Done, In progress, Blocked. Use only my notes. If a date is missing, write [date?].” CHECK: every item in the update is in my notes; no promised dates I didn’t give." }
  ],
  reteach: [
    { style: 'analogy', md: "Using code from an assistant is like borrowing a power tool from a neighbour. Useful, but you read the instructions, try it on scrap wood first and don't point it at the only door you have." },
    { style: 'simple', md: "Describe the job with an example, ask for a plain-English explanation, test on a copy, check an awkward case. Save prompts that work, with a note on what to check." },
    { style: 'step-by-step', md: "Coding: example, explain, copy, test, edge case, read for risky actions. Workflow: facts, library prompt, draft, verify, send, update the prompt if anything failed." }
  ],
  quiz: [
    { id: 'l1-09-q1', skill: 'l1.coding', type: 'mcq', difficulty: 2,
      q: "An assistant gives you a script to reorganise 400 files on your computer. What should you do FIRST?",
      options: ["Run it on the real folder; it looks right", "Ask for a plain-English explanation, then try it on a small copy of the files", "Share it with colleagues", "Disable your backups so it runs faster"],
      answer: 1, hints: ["What could go wrong if the script is slightly wrong?", "Where can you make mistakes cheaply?"],
      explain: "Understanding and testing on a copy limits damage. A script that moves or deletes files can be hard to undo." },
    { id: 'l1-09-q2', skill: 'l1.coding', type: 'mcq', difficulty: 3,
      q: "The code suggested to you begins by installing a package whose name you do not recognise. What is the sensible step?",
      options: ["Install it; the assistant knows best", "Check that the package genuinely exists, is widely used and is from a trustworthy source before installing; ask for a version without it", "Install it with administrator rights", "Ignore the error if it fails"],
      answer: 1, hints: ["Can an assistant name something that does not exist?", "What could a malicious package do?"],
      explain: "Assistants sometimes suggest non-existent packages, and attackers can register such names. Verify first or avoid the dependency." },
    { id: 'l1-09-q3', skill: 'l1.coding', type: 'mcq', difficulty: 2,
      q: "A formula the assistant wrote returns sensible numbers on your five test rows. Which extra check matters most before applying it to 5,000 rows?",
      options: ["None; it passed", "Try awkward rows: blanks, odd characters, duplicates", "Make the font bigger", "Ask it to write it in another language"],
      answer: 1, hints: ["Where do formulas usually fail?", "Real data is messier than examples."],
      explain: "Edge cases are where silent errors live. Passing easy examples does not show the formula copes with real, messy data." },
    { id: 'l1-09-q4', skill: 'l1.workflow', type: 'order', difficulty: 2,
      q: "Order a dependable AI-assisted workflow.",
      items: ["Gather the real facts and decide what is wanted", "Use a tested prompt from your library", "Get the assistant's draft", "Verify facts, numbers and tone yourself", "Send, then note what to improve in the prompt"],
      hints: ["Facts before prompts; checks before sending.", "Learning from failures closes the loop."],
      explain: "Facts, tested prompt, draft, human verification, delivery, then improvement. Verification must sit before delivery." },
    { id: 'l1-09-q5', skill: 'l1.workflow', type: 'mcq', difficulty: 3,
      q: "Why add a CHECK line to every prompt in a library?",
      options: ["It makes prompts longer", "It records what must be verified each time, so reuse does not breed complacency", "It stops the model making errors", "It is required by the model"],
      answer: 1, wrong: { '2': "A note for you cannot change what the model does; it changes what you do." },
      hints: ["Who reads the CHECK line: the model or you?", "What risk grows when a prompt ‘always works’?"],
      explain: "A prompt that worked ten times invites unthinking trust. The CHECK line keeps the human step visible." }
  ],
  takeaways: [
    "Describe code jobs with examples, ask for plain-English explanations, test on a copy, check edge cases.",
    "Be wary of code that deletes, sends, spends or installs unfamiliar packages.",
    "Save prompts that work, with when-to-use and a CHECK line.",
    "A workflow keeps a human verification step before anything goes out."
  ],
  apply: "Start a prompt library: save your three most-used prompts with a note on when to use each and one thing to check every time."
},

{
  id: 'l1-10',
  title: 'Verification habits: trust, but verify',
  hook: 'The skill that separates people who use AI well from people who get burnt by it is the checking they do afterwards.',
  minutes: 16,
  skills: ['l1.verify'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Everything in this level leads here. Models are fast, fluent and sometimes wrong in ways that are hard to see. You cannot remove the risk, but you can manage it, in proportion to what is at stake." },
    { t: 'h', text: 'Match the checking to the stakes' },
    { t: 'compare', cols: ['Stakes', 'Example', 'Checking'], rows: [
      ["Low", "Brainstorming names for a club", "Glance and judge: if it is a bad idea you will see it"],
      ["Medium", "A newsletter paragraph with dates and figures", "Check every fact, name and number against the source"],
      ["High", "Advice on health, legal, money or safety; anything published under your name", "Independent authoritative sources and, where appropriate, a qualified person. The assistant is only a starting point"]
    ] },
    { t: 'h', text: 'The trust-but-verify routine' },
    { t: 'steps', items: [
      { title: 'Decide the stakes', md: "What happens if this is wrong, and for whom?" },
      { title: 'Find the checkable claims', md: "Underline names, dates, numbers, quotations, references and any “always” or “never”." },
      { title: 'Check against something independent', md: "A source you open, a calculation you redo, or a person who knows. Not the same assistant." },
      { title: 'Look for what is missing', md: "Assistants are agreeable. Ask: what would a critic say? What did it leave out?" },
      { title: 'Record what you checked', md: "A short log of claim, source and result. It protects you and helps next time." },
      { title: 'Own the result', md: "If you send it, it is yours. Disclose AI help where required." }
    ] },
    { t: 'widget', w: 'claimcheck', props: {
        title: 'An AI-written summary: what would you check?',
        skill: 'l1.verify',
        segments: [
          { text: "Python was created by Guido van Rossum and first released in 1991.", claim: true, status: 'true', why: "True: first public release in 1991." },
          { text: " Its name comes from the comedy group Monty Python, not the snake.", claim: true, status: 'true', why: "True: van Rossum has said the name was inspired by Monty Python’s Flying Circus." },
          { text: " Python 3.0 was released in 2008 and was designed to be fully backwards compatible with Python 2.", claim: true, status: 'false', why: "Half false: Python 3.0 did arrive in 2008, but it deliberately broke backwards compatibility. A true detail and a false detail in one sentence is a classic trap: checking one half does not clear the other." },
          { text: " Because Python is a purely compiled language, it never needs an interpreter.", claim: true, status: 'false', why: "False and self-contradictory: the standard implementation runs by interpreting bytecode, so an interpreter is needed. Confident ‘never’ and ‘purely’ are red flags." },
          { text: " A 2019 survey found it to be the most loved language among all developers.", claim: true, status: 'unverifiable', why: "Unverifiable as written: which survey, who ran it, and what ‘most loved’ means? A vague source with a sweeping claim should be traced or dropped." }
        ] }, caption: 'Flag what you would verify before publishing this. Then reveal and compare.' },
    { t: 'callout', kind: 'tip', title: 'Where errors tend to hide', md: "Exact figures, dates, names, quotations and citations; claims with absolute words (“always”, “never”, “all”); sentences that mix a true detail with a doubtful one; anything you wanted to be true." },
    { t: 'h', text: 'Over-reliance' },
    { t: 'p', md: "Verification is not only about errors in the output; it is about what the habit does to you. If you stop thinking first, stop reading closely, or stop practising skills you want to keep, you become slower at spotting errors precisely when you need to. Use the assistant to extend your thinking, not to replace it: draft your own view before you ask, and keep doing the hard parts yourself on things you want to learn." },
    { t: 'callout', kind: 'misconception', title: '“Verification defeats the point of using AI”', md: "Checking is usually far quicker than creating from nothing, which is still a real saving. And a fact you have checked is a fact you can stand behind. The aim is *reliable* speed, not raw speed." },
    { t: 'try', prompt: "Write your own five-line personal AI-use checklist for work you will put your name to.", sample: "1. Never paste secrets or personal data without clearance. 2. Give task, audience, purpose and source material. 3. Check every figure, date, name and quotation against the source. 4. Open every reference; log claim and source. 5. Read it aloud, edit in my voice, and disclose AI help where asked." },
    { t: 'p', md: "Your capstone project asks you to build a reusable prompt toolkit for a real task, with before-and-after outputs and a verification log. It brings together every lesson in this level." }
  ],
  reteach: [
    { style: 'analogy', md: "A pilot's pre-flight checklist. Pilots are skilled; they still run the checklist every time because the cost of a slip is high and memory is unreliable. Your checklist matches the effort to the risk and makes the checking a habit instead of a mood." },
    { style: 'simple', md: "Ask how bad it would be if it were wrong. Check the facts, numbers and quotes against something independent. Look for what is missing. Keep a note. Remember that your name is on it." },
    { style: 'technical', md: "Model errors are not randomly distributed: they cluster in specific details (numbers, citations, rare facts) and are masked by fluent prose, so detection by general impression is poor. Verification should therefore target claim-level atoms, use independent evidence rather than self-consistency alone, and scale with the cost of error." }
  ],
  quiz: [
    { id: 'l1-10-q1', skill: 'l1.verify', type: 'mcq', difficulty: 2, placement: true,
      q: "An assistant tells you a statistic with a precise figure and a named report. You plan to include it in a published article. What is the best next step?",
      options: ["Include it; precise figures are rarely invented", "Locate the named report yourself and confirm the figure and its context before using it", "Ask the assistant to confirm it", "Round the number so it looks safer"],
      answer: 1, wrong: { '0': "Precision is exactly what makes invented numbers convincing.", '2': "Asking the same model is not independent verification." },
      hints: ["Which check is independent of the assistant?", "What changes with ‘published under my name’?"],
      explain: "Published claims need verification from the original. Specificity makes a claim look reliable, not be reliable." },
    { id: 'l1-10-q2', skill: 'l1.verify', type: 'mcq', difficulty: 3,
      q: "Here is an assistant's answer:",
      code: `Q: What is 15% of £240, and what is the total with VAT at 20%?\nA: 15% of £240 is £36. Adding 20% VAT to £36 gives £43.20. So the total is £43.20.\n(Question intended: total of £240 + VAT.)`,
      options: ["The answer is correct", "The arithmetic steps are fine, but it answered a different question: VAT should apply to £240 (giving £288), not to the £36", "The 15% is miscalculated", "VAT is 25%"],
      answer: 1, hints: ["Check each number, then ask whether it answers the question asked.", "What was the total supposed to be of?"],
      explain: "The steps are individually right (15% of 240 is 36; 36 × 1.2 is 43.20), but the answer doesn't match the question. Correct sums can still answer the wrong question: verify relevance as well as arithmetic." },
    { id: 'l1-10-q3', skill: 'l1.verify', type: 'order', difficulty: 2,
      q: "Order the steps of a trust-but-verify routine.",
      items: ["Decide how high the stakes are", "Pick out the checkable claims (numbers, names, dates, quotes, references)", "Check them against independent sources", "Ask what is missing or what a critic would say", "Record what you checked and own the result"],
      hints: ["Stakes decide how much checking.", "You can't check claims you haven't identified."],
      explain: "Stakes, then claims, then independent checking, then gaps, then a log and accountability. This order stops you spending effort in the wrong place." },
    { id: 'l1-10-q4', skill: 'l1.verify', type: 'multi', difficulty: 2,
      q: "Select ALL the signs that deserve extra scrutiny in an AI answer.",
      options: ["An exact figure with no source", "“Always” or “never” about a complicated topic", "A reference you cannot find", "A claim that is exactly what you hoped to hear", "A sentence that combines a checkable true fact with a doubtful one"],
      answer: [0, 1, 2, 3, 4], hints: ["Think about where errors hide.", "All of these are known weak spots."],
      explain: "Specific unsourced numbers, absolutes, unfindable references, wishful claims and mixed sentences are all common hiding places for errors." },
    { id: 'l1-10-q5', skill: 'l1.verify', type: 'mcq', difficulty: 3,
      q: "A team uses an assistant for first drafts. Over a year, they stop reading drafts closely because it “has always been fine”. What is the main risk?",
      options: ["The assistant gets worse", "Their error-spotting skill and attention fade, so a rare serious error slips through", "Drafts become too long", "Nothing; track record proves reliability"],
      answer: 1, hints: ["What happens to attention when a tool seems reliable?", "Rare errors are the dangerous ones."],
      explain: "A good record breeds complacency. The errors that matter are rare and well-disguised, and the reading skill needed to catch them weakens with disuse." },
    { id: 'l1-10-q6', skill: 'l1.verify', type: 'short', difficulty: 2,
      q: "Name one reason why asking the same assistant “are you sure?” is not real verification.",
      accept: ["(same|identical).*(model|assistant|source|system)", "(not|isn.t|no).*(independent)", "(repeat|confirm|double down|defend).*(itself|error|mistake|same)", "(confident|fluent)"],
      model: "It isn't independent: the same model can repeat the same error confidently. You need a different source or your own calculation.",
      hints: ["Is the second check independent of the first?", "What does a model tend to do when asked to confirm?"],
      explain: "Independent evidence, such as a primary source, a recalculation, or an expert, is what verifies. Re-asking the same system can simply repeat the mistake." }
  ],
  takeaways: [
    "Match checking effort to stakes; high-stakes advice needs authoritative sources or a qualified person.",
    "Pick out the checkable claims, and check them independently of the assistant.",
    "Errors hide in exact figures, citations, absolutes and mixed true-and-false sentences.",
    "Beware over-reliance: keep thinking first and keep your own skills sharp."
  ],
  apply: "Make a one-page personal AI checklist from this level and pin it by your screen. Use it on the next AI-assisted thing you send."
}
];
