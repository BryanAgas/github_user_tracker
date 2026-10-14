// L1 lessons 05-07
export default [
{
  id: 'l1-05',
  title: 'Reasoning tasks: when step-by-step helps, and how to check the logic',
  hook: 'A confident chain of reasoning is not the same as a correct one.',
  minutes: 15,
  skills: ['l1.reasoning'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Some tasks are one step: translate this sentence. Others take several: work out which of three quotes is cheapest once delivery and VAT are included. These are **reasoning tasks**, where the answer depends on getting a chain of small steps right." },
    { t: 'p', md: "A language model produces its answer one token at a time, and each token can only use what is already on the page. If the steps are written out, later steps can build on earlier ones. That is why asking for working (“work through this step by step, then give the answer”) often improves results on multi-step problems. It is a *tendency*, not a guarantee." },
    { t: 'h', text: 'When step-by-step helps and when it does not' },
    { t: 'compare', cols: ['Helps', 'Often does not help, or can hurt'], rows: [
      ["Arithmetic with several stages, scheduling, comparing options on several criteria", "Simple look-ups and rewording, where extra reasoning adds length and chances to wander"],
      ["Logic puzzles and “spot the inconsistency” tasks", "Matters of taste or opinion, where there is no chain to follow"],
      ["Planning with dependencies (what must happen before what)", "Questions where the facts are simply not available to it; reasoning cannot supply missing facts"]
    ] },
    { t: 'current', key: 'reasoning-modes' },
    { t: 'callout', kind: 'why', title: 'Plausible is not the same as valid', md: "The working a model writes looks like human reasoning, and that makes errors persuasive. A slip in step 2 can flow smoothly into a wrong answer in step 5, in perfectly fluent prose. Whether the written working truly reflects how the model arrived at its answer is itself debated, so treat it as an aid for *you* to check, not as proof." },
    { t: 'h', text: 'A simple checking routine' },
    { t: 'steps', items: [
      { title: 'Ask for the working', md: "Request the steps and the assumptions, so there is something to inspect." },
      { title: 'Re-do the key numbers yourself', md: "Use a calculator or spreadsheet for arithmetic. Models can be shaky at precise calculation, especially long or unusual sums." },
      { title: 'Test the answer against a simple case', md: "If the formula says 20 per cent of 50 is 15, you have caught it." },
      { title: 'Ask for a different route', md: "Request the answer a second way, or ask it to argue against its own answer. Disagreement is a flag to look closer." }
    ] },
    { t: 'predict', q: "A model's worked answer says: “Three tickets at £12.50 plus a £4 booking fee on each ticket = £37.50 + £4 = £41.50.” What is the most likely problem?", options: ["The ticket total is wrong", "The fee was applied once, though the working said it applies on each ticket", "It should have used more steps", "There is no problem"], answer: 1, explain: "Three tickets at £12.50 is £37.50, correct. But a £4 fee on each of three tickets is £12, giving £49.50. The working states one rule and applies another, which is exactly the kind of slip you find by reading the steps.", skill: 'l1.reasoning' },
    { t: 'callout', kind: 'misconception', title: '“It showed its working, so it must be right”', md: "Showing working makes errors *findable*, not impossible. Its value is that you can now check each step. If you do not check, you have gained only a more convincing wrong answer." },
    { t: 'try', prompt: "Write a prompt that asks an assistant to compare two phone contracts (invent the prices) and makes its reasoning easy for you to check.", sample: "“Compare Contract A (£18/month for 24 months, £30 set-up) and Contract B (£22/month for 12 months, no set-up) for someone who will keep the phone for exactly 18 months. List your assumptions, show each calculation line by line, give the total cost of each for 18 months, then state which is cheaper and by how much. Finish with a one-line check of your arithmetic.” Check: A = 18×18+30 = £354 (assuming you stay on the 24-month plan); B = 22×12 = £264 for the first year, and what happens in months 13–18 depends on assumptions the model should state." }
  ],
  reteach: [
    { style: 'analogy', md: "A long sum done in your head versus on paper. Writing down the carry-overs lets you build on each stage, and lets a teacher spot where it went wrong. But a neat page can still hold a wrong sum. The paper helps; it does not mark itself." },
    { style: 'simple', md: "For multi-step problems, ask for the steps. Then check the steps yourself, especially numbers. For simple look-ups, just ask the question." },
    { style: 'technical', md: "Generating intermediate tokens gives later tokens more context to condition on, which can improve multi-step accuracy. But each step is still a probabilistic prediction, errors compound, and the visible rationale may not faithfully describe the underlying computation. Verification therefore needs independent checks: recalculation, simple test cases, and alternative derivations." }
  ],
  quiz: [
    { id: 'l1-05-q1', skill: 'l1.reasoning', type: 'mcq', difficulty: 2,
      q: "Which task is MOST likely to benefit from asking the assistant to work step by step?",
      options: ["Translating “good morning” into French", "Deciding which of three suppliers is cheapest once delivery, VAT and a bulk discount apply", "Suggesting a name for a school club", "Rewording a sentence to be friendlier"],
      answer: 1, hints: ["Which task has several dependent stages?", "Which has a chain where an early slip changes the end result?"],
      explain: "Multi-stage calculations are where writing the working out helps. The others are single-step or taste-based tasks." },
    { id: 'l1-05-q2', skill: 'l1.reasoning', type: 'mcq', difficulty: 2,
      q: "A model writes a clear five-step argument and ends with a confident conclusion. What does the fluency tell you about its correctness?",
      options: ["It is very likely correct", "Nothing reliable: fluent working can contain an error you must check", "It is certainly wrong", "It is correct if the steps are numbered"],
      answer: 1, wrong: { '0': "Persuasive prose is exactly what language models are good at, regardless of accuracy." },
      hints: ["What are language models best at producing?", "Is smooth writing evidence of valid logic?"],
      explain: "Fluency and correctness are separate. Written working is valuable because you can inspect it, not because it proves anything." },
    { id: 'l1-05-q3', skill: 'l1.reasoning', type: 'multi', difficulty: 3,
      q: "Select ALL sensible ways to check a model's reasoning on a multi-step calculation.",
      options: ["Recompute the key figures with a calculator or spreadsheet", "Test the method on a simple case where you know the answer", "Ask for the answer by a different route and compare", "Trust it if the tone is confident", "Read the steps looking for a rule stated one way and applied another"],
      answer: [0, 1, 2, 4], hints: ["Which options are independent of the model's own confidence?", "One option relies on style."],
      explain: "Independent recalculation, simple test cases, alternative routes and careful reading all catch errors. Confidence of tone is not evidence." },
    { id: 'l1-05-q4', skill: 'l1.reasoning', type: 'mcq', difficulty: 3,
      q: "A user asks, “What was the exact attendance at our school fair last year?” and adds “think step by step”. The assistant produces a detailed estimate. What is the key issue?",
      options: ["Step-by-step prompting always fixes missing facts", "Reasoning cannot create a fact the model does not have; it should say it cannot know and ask for the figure", "The user needs a more powerful model", "The answer is probably right if it is detailed"],
      answer: 1, hints: ["Where could the model have learned the attendance?", "Can reasoning replace missing information?"],
      explain: "Reasoning combines information; it cannot conjure information that is not in the model or the conversation. Detail without a source is a warning sign, not reassurance." },
    { id: 'l1-05-q5', skill: 'l1.reasoning', type: 'order', difficulty: 2,
      q: "Put this checking routine for a reasoned answer in order.",
      items: ["Ask for the assumptions and the working", "Recalculate the key numbers yourself", "Test the method on a simple known case", "Ask for the answer by a different route or a counter-argument", "Decide whether to trust, correct or discard the answer"],
      hints: ["You cannot check what has not been shown.", "The decision comes last."],
      explain: "Surface the working first, verify independently, cross-check, then decide. Skipping straight to trust is the usual failure." }
  ],
  takeaways: [
    "Writing out steps can help on multi-stage problems; it is a tendency, not a guarantee.",
    "Reasoning combines information; it cannot supply facts that are missing.",
    "Fluent working can hide a slip. Its value is that you can check it.",
    "Recalculate key numbers, test simple cases, and ask for a second route."
  ],
  apply: "Next time you ask for a calculation, ask for the assumptions and working, then re-do one number in a spreadsheet. Note whether you found a difference."
},

{
  id: 'l1-06',
  title: 'Research with AI: sources, not just answers',
  hook: 'An assistant is a brilliant starting point for research and a dangerous place to finish it.',
  minutes: 17,
  skills: ['l1.research'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "From Level 0 you know models can **hallucinate**: produce fluent, confident statements that are false, including invented quotations, statistics and sources. For research that matters, because you will repeat what you find." },
    { t: 'p', md: "Used well, an assistant helps you *start* and *organise*: explain a topic in plain terms, list the questions worth asking, suggest search terms, compare viewpoints, and structure your notes. Used badly, it becomes a source in its own right. The discipline that separates the two is simple: **the assistant gives you leads; sources give you facts.**" },
    { t: 'h', text: 'Two modes: from memory, and with sources' },
    { t: 'compare', cols: ['Answering from memory', 'Answering with retrieved or supplied sources'], rows: [
      ["Draws on patterns in training text; may be out of date; cannot show where a claim came from", "Can point to documents or web pages; you can open them"],
      ["Citations may be invented or garbled", "Links may be real but may not say what the summary claims"],
      ["Fine for orientation and vocabulary", "Better for specific facts, but still needs checking at the source"]
    ] },
    { t: 'current', key: 'search-features' },
    { t: 'callout', kind: 'warn', title: 'The fake-citation trap', md: "A model can produce a perfectly formatted reference with believable authors, journal and year for a paper that does not exist. A real link can also be paired with a claim the page does not make. **Never cite a source you have not opened and read yourself.**" },
    { t: 'widget', w: 'claimcheck', props: {
        title: 'Spot what to verify',
        skill: 'l1.research',
        segments: [
          { text: "Marie Curie was born in Warsaw in 1867.", claim: true, status: 'true', why: "True: born 7 November 1867 in Warsaw. Easy to check in any reference work." },
          { text: " She shared the 1903 Nobel Prize in Physics with Pierre Curie and Henri Becquerel.", claim: true, status: 'true', why: "True: the 1903 Physics prize was shared by the three for work on radioactivity." },
          { text: " She received her second Nobel Prize, in Chemistry, in 1913.", claim: true, status: 'false', why: "False: her Chemistry prize was awarded in 1911. The wrong year is a typical subtle error: plausible, fluent, and one search away from being caught." },
          { text: " This work is set out in her 1904 paper “On Radiant Matter in Polish Soil” (Annals of Physics, vol. 12, pp. 44–61).", claim: true, status: 'unverifiable', why: "Unverifiable and highly suspicious: a precise-looking reference you cannot locate. Treat as invented until you find it in a catalogue or database." },
          { text: " She died in 1934 of aplastic anaemia, which was probably linked to her long exposure to radiation.", claim: true, status: 'true', why: "True, as far as is generally accepted: she died in July 1934 of aplastic anaemia, widely believed to be linked to radiation exposure. The ‘probably’ is appropriately hedged." },
          { text: " It is a remarkable story.", claim: false, status: 'true', why: "An opinion, not a checkable claim. Nothing to verify." }
        ] }, caption: 'Flag the sentences you would check before using this text. Then reveal.' },
    { t: 'h', text: 'A source discipline you can keep' },
    { t: 'steps', items: [
      { title: 'Ask for leads, not conclusions', md: "“What are the main viewpoints on X, and what search terms or kinds of source would I use to check each?”" },
      { title: 'Open the sources', md: "Find the original page, paper or dataset. Does it exist? Does it say what the summary claims?" },
      { title: 'Prefer primary or authoritative sources', md: "Official statistics, original studies, legislation, the organisation's own page. Be cautious with content that merely repeats other content." },
      { title: 'Check the date and the context', md: "Is it current? Is a number a rate or a count, for one place or a whole country?" },
      { title: 'Keep a source log', md: "For every claim you will use: the claim, the source, the date accessed, and whether you checked it yourself." }
    ] },
    { t: 'callout', kind: 'misconception', title: '“If it gives a link, it is verified”', md: "A link shows the model *pointed* somewhere. It does not show the page supports the claim. The only verification is reading the page." },
    { t: 'try', prompt: "You need three facts for a talk on the history of the printing press. Write the prompt you would use to get leads that are easy to verify, then say how you would check one fact.", sample: "Prompt: “I am preparing a 5-minute talk on the history of the printing press for adults. Give me 5 key developments as questions to research, with the type of source (for example a national library, a museum, a university press) I should consult for each. Do not give dates unless you flag them as ‘to verify’.”\nCheck: pick one claim, find it in two independent authoritative sources, note any disagreement in your log, and use the sources’ wording, not the assistant's." }
  ],
  reteach: [
    { style: 'analogy', md: "Asking an assistant for facts is like asking a well-read friend at a party. They are often right, quick to help and delightful, and they will occasionally tell you something with total confidence that they half-remember wrongly. You would not put the friend in your bibliography; you would go and look it up." },
    { style: 'simple', md: "Use the assistant to find out what to look for. Use proper sources to find out what is true. Open every source you cite." },
    { style: 'step-by-step', md: "1. Ask for questions and search terms. 2. Search for real sources. 3. Open and read them. 4. Note claim, source and date in a log. 5. Write in your own words, citing the sources you actually used." }
  ],
  quiz: [
    { id: 'l1-06-q1', skill: 'l1.research', type: 'mcq', difficulty: 2, placement: true,
      q: "An assistant gives you a reference: author names, journal, year and page numbers for a study that supports your point. What should you do before using it?",
      options: ["Use it; the formatting looks professional", "Look the study up independently in a library catalogue or database, and read it to confirm it exists and says what is claimed", "Ask the assistant if it is sure", "Cite it but add “as reported by AI”"],
      answer: 1, wrong: { '2': "Asking the same system whether it is right is not independent verification; it may confidently repeat itself." },
      hints: ["How could you establish that the paper really exists?", "Is asking the same model an independent check?"],
      explain: "Models can generate realistic but non-existent references. Independent look-up and reading are the only reliable checks." },
    { id: 'l1-06-q2', skill: 'l1.research', type: 'mcq', difficulty: 2,
      q: "Which is the best use of an assistant at the START of researching an unfamiliar topic?",
      options: ["Ask for a final answer and copy it", "Ask for an overview, key terms, and the questions to investigate, then verify with real sources", "Ask it to write the reference list", "Ask it to decide which side is right"],
      answer: 1, hints: ["What is it reliably good at here: orientation or authority?", "Which option still leaves the facts to be verified?"],
      explain: "Orientation and vocabulary are strong uses. Final answers, reference lists and verdicts need independent grounding." },
    { id: 'l1-06-q3', skill: 'l1.research', type: 'mcq', difficulty: 3,
      q: "An AI tool with web search summarises a statistic and links a page. You open the page and find the statistic is from a different year and a different country. What is the correct conclusion?",
      options: ["The tool is fine; the link proves the claim", "The summary misrepresented its source: use the page's real figure and context, or find a better source", "The page must be wrong", "Nothing; statistics are interchangeable"],
      answer: 1, hints: ["Who does the summary answer to: the page or itself?", "Context (year, place) changes a statistic's meaning."],
      explain: "Search-backed tools can still misread or over-generalise. The page is the authority; if it disagrees with the summary, trust the page and cite it accurately." },
    { id: 'l1-06-q4', skill: 'l1.research', type: 'multi', difficulty: 2,
      q: "Select ALL entries that belong in a good source log.",
      options: ["The claim you intend to use", "The source you actually opened", "The date you accessed it", "Whether you verified it yourself", "The assistant's own confidence level as proof"],
      answer: [0, 1, 2, 3], hints: ["A log should let someone else retrace your steps.", "Confidence is not a source."],
      explain: "A log records claim, source, date and verification status. A model's expressed confidence is not evidence." },
    { id: 'l1-06-q5', skill: 'l1.research', type: 'short', difficulty: 3,
      q: "In a sentence, why is “the assistant gave a link” not enough to treat a claim as verified?",
      accept: ["(page|link|source).*(not|n.t|may not).*(say|support|contain|match)", "(read|open).*(source|page|link)", "(summar|claim).*(misrepresent|wrong|differ|not (in|match))"],
      model: "Because the page might not say what the summary claims; you only know once you open and read the source.",
      hints: ["What might differ between the link and the claim?", "What action actually verifies?"],
      explain: "A link shows where the model pointed, not that the page supports the claim. Reading it is the check." }
  ],
  takeaways: [
    "Assistants give you leads; sources give you facts.",
    "References can be invented, and real links can be paired with claims the page does not make.",
    "Open and read every source you cite; keep a log of claim, source, date and check.",
    "Fluent, specific-looking detail such as exact years and page numbers is where errors hide."
  ],
  apply: "Take a fact an assistant told you recently and trace it to a primary source. Record how long it took and whether it matched."
},

{
  id: 'l1-07',
  title: 'Writing and editing with AI, honestly',
  hook: 'Used well, an assistant is a sharp editor; used carelessly, it makes everything sound the same and puts words in your mouth.',
  minutes: 14,
  skills: ['l1.writing'],
  core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Writing is where most people first use AI, and where the habits matter most. The best pattern is not “write it for me”; it is **you decide what to say, the assistant helps you say it, and you take responsibility for the result**." },
    { t: 'h', text: 'Roles the assistant plays well' },
    { t: 'list', items: [
      "**Editor**: tighten, fix grammar, cut jargon, adjust reading level. Say “keep my meaning and my voice; show changes”.",
      "**Challenger**: “What would a sceptical reader object to?” “What is missing from this argument?”",
      "**Structurer**: turn rough notes into an outline, then you write the sentences.",
      "**Variant generator**: five alternative subject lines, three ways to open, to choose from."
    ] },
    { t: 'callout', kind: 'tip', title: 'Give it your voice', md: "Paste a paragraph of your own writing and say “match this style”. Without it you will get the average style of the internet: smooth, upbeat, slightly formal, and unmistakably generic." },
    { t: 'callout', kind: 'warn', title: 'Watch for the sameness', md: "Generated text often carries tell-tale habits: filler openings, stacked adjectives, lists of three, a neat moral at the end. Read it aloud. If you would never say it, change it." },
    { t: 'h', text: 'Honesty: attribution, plagiarism and disclosure' },
    { t: 'list', items: [
      "**Know the rules.** Schools, exams, publishers and employers have different policies on AI help. Read them, and if unclear, ask. “I didn’t know” does not protect you.",
      "**It is your name on it.** If you submit or publish text as your own, you are responsible for its accuracy, fairness and originality.",
      "**Disclose where expected.** Many settings now ask you to say if and how AI was used. Do so plainly.",
      "**Text can echo existing work.** Models can reproduce phrasing or ideas from sources without telling you. Check anything that reads as distinctive, and never present someone else's ideas as your own.",
      "**Do not pass off AI detectors as proof.** Detection tools are unreliable and can wrongly flag honest work, so they should not be the sole basis for accusing anyone."
    ] },
    { t: 'predict', q: "You ask an assistant to improve your paragraph and it returns something much more polished. What should you do before using it?", options: ["Paste it straight in; it is better", "Check that the meaning, facts and tone still match what you intended, and that you are allowed to use AI help here", "Ask it to add citations", "Remove all your original wording"], answer: 1, explain: "Polish can quietly change meaning or add claims. You are responsible for the final text and for following the rules of the setting.", skill: 'l1.writing' },
    { t: 'code', lang: 'text', src: `Edit the paragraph below.
Keep my meaning and my voice.
Fix grammar and cut anything repeated.
Do not add facts or claims.
Show the edited version, then a short list of what you changed and why.

PARAGRAPH
[paste here]`, caption: 'An editing prompt that keeps you in charge: it forbids added facts and lists the changes.' },
    { t: 'callout', kind: 'misconception', title: '“AI writing is always detectable, so it is risky only if I get caught”', md: "The question is not detection; it is honesty and responsibility. Even where nobody would ever know, you remain accountable for what you put your name to, and relying on it for every sentence slowly weakens your own writing." },
    { t: 'try', prompt: "Write an editing prompt for a paragraph you wrote, stating what to keep, what to improve and what not to do.", sample: "“Edit my paragraph for a general reader. Keep my argument and first-person voice. Shorten sentences over 25 words. Replace jargon with plain words. Do not add examples or facts. Return the edit, then bullet-list every change.” The ‘do not add’ and ‘list every change’ rules let you see and veto what it did." }
  ],
  reteach: [
    { style: 'analogy', md: "A good editor at a publishing house improves your book but does not sign it. You decide what the book says; they help it say it well; your name is on the cover and so are you accountable for the contents." },
    { style: 'simple', md: "You decide the message. The assistant helps with the wording. You check the result, follow the rules of the setting and say so if you are asked." },
    { style: 'step-by-step', md: "1. Write or outline your own points first. 2. Ask for specific edits, not a rewrite from nothing. 3. Forbid new facts. 4. Compare before and after. 5. Check against any AI-use policy. 6. Disclose if required." }
  ],
  quiz: [
    { id: 'l1-07-q1', skill: 'l1.writing', type: 'mcq', difficulty: 2,
      q: "Which prompt keeps you most in control of an edit?",
      options: ["Make this better.", "Rewrite this completely so it sounds professional.", "Edit for grammar and clarity, keep my meaning and voice, add no new facts, and list your changes.", "Write a much longer version."],
      answer: 2, hints: ["Which one limits what the assistant may change?", "Which one lets you review each change?"],
      explain: "Limits on what may change, plus a change list, keep your meaning intact and make the edit reviewable." },
    { id: 'l1-07-q2', skill: 'l1.writing', type: 'mcq', difficulty: 3,
      q: "A student submits an AI-drafted essay with a reference list generated by the same assistant, and does not check either. Which risks are most serious?",
      options: ["The font may look different", "Invented references and facts, plus possible breach of the course's AI policy", "The essay will be too short", "Teachers dislike long essays"],
      answer: 1, hints: ["Which problem can cause an academic misconduct finding?", "What did the earlier research lesson say about generated references?"],
      explain: "Unchecked claims and references are an accuracy and integrity risk, and unauthorised use may breach policy. Both are the student's responsibility." },
    { id: 'l1-07-q3', skill: 'l1.writing', type: 'multi', difficulty: 2,
      q: "Select ALL sound habits when using an assistant for writing.",
      options: ["Check the local policy on AI use", "Tell it to add no new facts when editing", "Read the output aloud and change what you would never say", "Submit it unchanged if it sounds polished", "Disclose use where asked"],
      answer: [0, 1, 2, 4], hints: ["Which habits protect accuracy and honesty?", "One option is just trust in polish."],
      explain: "Policy, constraints, personal voice and disclosure are the responsible habits. Polish is not a proof of accuracy or originality." },
    { id: 'l1-07-q4', skill: 'l1.writing', type: 'mcq', difficulty: 3,
      q: "A manager says: “Run every piece of staff writing through an AI detector and discipline anyone flagged.” What is the best response?",
      options: ["Agree; detectors are accurate", "Point out that detectors are unreliable and can wrongly flag honest work, so a flag should prompt a conversation, not a punishment", "Agree, but only for junior staff", "Suggest banning all writing tools"],
      answer: 1, hints: ["Can a tool prove who wrote something?", "What happens to an honest writer who is wrongly flagged?"],
      explain: "Detection is probabilistic and error-prone, including false positives. A flag is at most a reason to talk, not evidence of misconduct." },
    { id: 'l1-07-q5', skill: 'l1.writing', type: 'short', difficulty: 2,
      q: "Name one phrase to add to an editing prompt that stops the assistant inventing content.",
      accept: ["(do not|don.t|no).*(add|invent|new).*(fact|claim|content|information|example)", "(only|just).*(edit|change).*(wording|grammar|phrasing)", "keep.*(meaning|facts)"],
      model: "“Do not add any new facts or claims; only improve the wording.”",
      hints: ["Forbid additions explicitly.", "Say what the edit is allowed to touch."],
      explain: "An explicit ban on new facts, with a request for a change list, makes silent additions much easier to spot." }
  ],
  takeaways: [
    "You choose the message; the assistant helps with the wording; you remain responsible.",
    "Constrain edits (keep meaning, add no facts) and ask for a list of changes.",
    "Know and follow the rules on AI use; disclose where expected; do not rely on detectors as proof.",
    "Give it samples of your own voice or the output will sound generic."
  ],
  apply: "Edit something you wrote with an assistant using a ‘no new facts, list changes’ prompt. Reject at least one change, and say why."
}
];
