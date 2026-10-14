// Level 0 — skills, glossary, current entries, capstone project.

export const skills = [
  { id: 'l0.what-is-ai', name: 'What AI is (and is not)', desc: 'Describe AI as software that does tasks we associate with intelligence, without magic or minds.' },
  { id: 'l0.narrow-general', name: 'Narrow vs general AI', desc: 'Tell apart today\'s task-specific systems from the science-fiction idea of general intelligence.' },
  { id: 'l0.machine-learning', name: 'Learning from examples', desc: 'Explain how machine learning differs from hand-written rules, and why data matters.' },
  { id: 'l0.neural-nets', name: 'Neurons and networks', desc: 'Describe a neural network as many simple weighted sums, tuned by training.' },
  { id: 'l0.generative-ai', name: 'Generative AI', desc: 'Distinguish systems that sort or score things from systems that produce new content.' },
  { id: 'l0.next-token', name: 'Next-token prediction', desc: 'Explain how a language model writes by repeatedly predicting what comes next, and what temperature changes.' },
  { id: 'l0.tokens', name: 'Tokens', desc: 'Explain that models read pieces of text, not words, and why that affects cost, limits and odd mistakes.' },
  { id: 'l0.context-window', name: 'Context window and memory', desc: 'Explain that a model only sees what is in its context window, and nothing else.' },
  { id: 'l0.training-inference', name: 'Training vs inference', desc: 'Separate the slow, expensive building of a model from the quick use of it, and know what a chat does not change.' },
  { id: 'l0.hallucination', name: 'Hallucination', desc: 'Explain why fluent AI text can be false, and spot claims that need checking.' },
  { id: 'l0.limits', name: 'Strengths and limits', desc: 'Match tasks to what AI is good and poor at, and calibrate how much to trust the output.' },
  { id: 'l0.responsible-ai', name: 'Responsible use', desc: 'Apply basic habits for privacy, bias, verification and honesty about AI use.' }
];

export const glossary = [
  { term: 'Artificial intelligence (AI)', def: 'Software that performs tasks we normally associate with human thinking, such as recognising speech, translating or writing. It is a broad label for many different techniques, not one single thing.', level: 0, see: ['Machine learning', 'Narrow AI'] },
  { term: 'Narrow AI', def: 'A system built or trained for one kind of task, such as spotting spam or translating text. Every AI in use today is narrow, even when it seems broad.', level: 0, see: ['General AI'] },
  { term: 'General AI', def: 'A hypothetical system that could learn and do any intellectual task a person can. It does not exist today, and experts disagree about when, or whether, it will.', level: 0, see: ['Narrow AI'] },
  { term: 'Machine learning', def: 'Getting a computer to find patterns from many examples instead of following rules a person wrote by hand. The result is a model that can handle new cases that resemble the examples.', level: 0, see: ['Model', 'Training data'] },
  { term: 'Model', def: 'The thing that training produces: a large collection of numbers that, given an input, produces an output such as a label, a score or the next piece of text.', level: 0, see: ['Parameters', 'Training'] },
  { term: 'Training data', def: 'The examples a model learns from. A model can only reflect patterns in its data, including gaps, errors and biases.', level: 0, see: ['Bias'] },
  { term: 'Neural network', def: 'A model built from many small units that each compute a weighted sum of their inputs. Layers of them, tuned together, can learn very complicated patterns.', level: 0, see: ['Parameters'] },
  { term: 'Parameters (weights)', def: 'The adjustable numbers inside a model. Training changes them gradually until the model\'s outputs are good. Large language models have billions of them.', level: 0, see: ['Training', 'Neural network'] },
  { term: 'Generative AI', def: 'AI that produces new content, such as text, images or audio, rather than only sorting or scoring existing things.', level: 0, see: ['Large language model'] },
  { term: 'Large language model (LLM)', def: 'A very large neural network trained on huge amounts of text to predict what comes next. Chat assistants are built on top of one.', level: 0, see: ['Token', 'Next-token prediction'] },
  { term: 'Token', def: 'The small piece of text a model actually reads and writes: a whole short word, part of a longer word, a number chunk or punctuation. Models count and limit text in tokens, not words.', level: 0, see: ['Context window'] },
  { term: 'Next-token prediction', def: 'The core job of a language model: given the text so far, give a probability for each possible next token, pick one, and repeat. Whole answers are built this way, one token at a time.', level: 0, see: ['Temperature'] },
  { term: 'Temperature', def: 'A setting that controls how adventurous the next-token choice is. Low means the model nearly always picks the most likely token; high means it will sometimes pick less likely ones.', level: 0, see: ['Next-token prediction'] },
  { term: 'Context window', def: 'The amount of text, counted in tokens, that a model can see at one time. It holds your instructions, the conversation so far and the answer being written. Anything outside it is invisible to the model.', level: 0, see: ['Token', 'Inference'] },
  { term: 'Training', def: 'The slow, costly process of adjusting a model\'s parameters using lots of data. It happens before you use the model, in the builder\'s data centre, not during your chat.', level: 0, see: ['Inference', 'Parameters'] },
  { term: 'Inference', def: 'Using a trained model to produce an output. Its parameters stay fixed while it does so, which is why chatting with a model does not teach it.', level: 0, see: ['Training'] },
  { term: 'Hallucination', def: 'When an AI states something false or invented in a confident, fluent way, such as a fake quotation or a source that does not exist. It happens because the model writes plausible text, not checked facts.', level: 0, see: ['Next-token prediction', 'Verification'] },
  { term: 'Verification', def: 'Checking an AI\'s claim against a reliable source you trust before you rely on it. The higher the stakes, the more checking it deserves.', level: 0, see: ['Hallucination'] },
  { term: 'Bias', def: 'A systematic lean in a model\'s outputs, usually inherited from patterns or gaps in its training data. It can treat groups of people unfairly even when nobody intended it.', level: 0, see: ['Training data'] },
  { term: 'Prompt', def: 'The text you give a model to respond to: your question, instructions and any material you include.', level: 0, see: ['Context window'] }
];

export const current = {
  'context-window-sizes': {
    title: 'How big is the context window right now?',
    asOf: '2026-10',
    md: "Context windows have grown a great deal in a few years, and they differ from model to model and sometimes between a free and a paid plan of the same product. So do not memorise a number; learn where to look.\n\n- Check the provider's own model documentation page, which lists the context window for each model in tokens.\n- Remember that the window usually has to hold your input *and* the answer being written, and in many products it also holds hidden instructions and any files or tool results.\n- A bigger window is not automatically better: providers report that recall and accuracy can get worse as the amount of text grows, so what you put in still matters.\n- Chat apps may handle long conversations differently from the raw model, for example by dropping or summarising the oldest turns.\n\nLikely to go stale: the actual sizes, which models offer which size, and how apps handle long chats.",
    sources: [
      { label: 'Anthropic documentation: Context windows', url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows' }
    ]
  }
};

export const project = {
  id: 'p0', level: 0,
  title: 'Explain AI to someone, then check an AI',
  objective: 'Show you have a correct mental model of AI by explaining it in your own words, then prove you can verify an AI answer instead of just trusting it.',
  skills: ['l0.what-is-ai', 'l0.next-token', 'l0.context-window', 'l0.training-inference', 'l0.hallucination', 'l0.limits', 'l0.responsible-ai'],
  kind: 'text',
  requirements: [
    'Write a short explanation of how a chat assistant works for a specific person (for example, a relative or a colleague), in your own words.',
    'Your explanation mentions predicting what comes next, and says what the model can and cannot "see" or "remember".',
    'Include at least one misconception you are correcting.',
    'Ask any AI assistant three factual questions you can check, and record each as an "AI said / I checked / verdict" entry.',
    'Include at least one entry where you found the AI was wrong, incomplete, or unverifiable, or explain how you tried and could not.',
    'Finish with three personal rules for using AI responsibly.'
  ],
  guidance: [
    { title: 'Step 1: choose your listener', md: "Pick one real person and write one line about them under a heading `# Audience`. Someone who thinks AI is either magic or a fraud is perfect. Writing for a specific person stops you reaching for buzzwords." },
    { title: 'Step 2: write the explanation (about 150 words)', md: "Under `# How it works`, explain a chat assistant using what you learned. You need: it learned patterns from lots of text (training); when you chat it predicts the next token, over and over; it only sees what is in its context window; and chatting does not change the model. Use one analogy of your own, and say where the analogy breaks down." },
    { title: 'Step 3: bust a myth', md: "Under `# Myth busted`, pick one: “AI looks things up”, “AI understands like we do”, “it is always learning from my chat”, “bigger is always better”. State the myth, then the correction in two or three sentences." },
    { title: 'Step 4: run your own fact check', md: "Under `# AI said / I checked`, ask an AI assistant three questions with answers you can verify from a reliable source (a school textbook, an official website, a dictionary, an encyclopaedia). Good choices: a date, a specific number, a quote with its author, and one very obscure question. For each, write three lines: **AI said:** …, **I checked:** (what source you used), **Verdict:** correct, partly correct, wrong, or could not verify." },
    { title: 'Step 5: set your rules', md: "Under `# My rules`, write three rules you will follow, each with a reason. Think about what you will never paste into an AI, when you will always check, and how you will be honest about using it." }
  ],
  hints: [
    'If you do not have an AI assistant, use any free chat assistant, or ask a friend to share one of its answers with you. You are checking the answer, not the product.',
    'Questions where the AI is most likely to slip: a niche local fact, an exact quotation, a statistic with a year, or a book or article by a lesser-known author.',
    'A strong “I checked” line names the source, not just “I googled it”. If two reliable sources disagree, say so; that is a result too.',
    'Structure to copy: # Audience, # How it works, # Myth busted, # AI said / I checked, # My rules. Then fill each section with plain sentences.'
  ],
  success: [
    'A non-expert could read your explanation and then correctly say what an AI does when it answers.',
    'Your explanation never claims the model “knows”, “thinks” or “looks up” in a way the lesson corrected.',
    'Each fact-check entry names a real source you consulted.',
    'Your rules are specific (“I never paste a client\'s name”) rather than vague (“be careful”).'
  ],
  checks: [
    { id: 'len', label: 'At least 300 words', type: 'minWords', n: 300, hint: 'Aim for roughly 300 to 600 words in total: explanation, myth, three checks and your rules.' },
    { id: 'max', label: 'No more than 900 words', type: 'maxWords', n: 900, hint: 'Trim it. A clear explanation is short.' },
    { id: 'sections', label: 'At least five sections, each starting with #', type: 'sections', n: 5, hint: 'Use headings: # Audience, # How it works, # Myth busted, # AI said / I checked, # My rules.' },
    { id: 'predict', label: 'Mentions predicting what comes next', type: 'regex', pattern: '(predict\\w*|guess\\w*)[^.]{0,60}(next|following)|next[- ](word|token|piece)', flags: 'i', hint: 'Explain that the model works by predicting the next token (piece of text), repeatedly.' },
    { id: 'context', label: 'Mentions the context window or what the model can see', type: 'regex', pattern: 'context( window)?|can only see|only sees|remember', flags: 'i', hint: 'Say what the model can and cannot see or remember in a chat.' },
    { id: 'said', label: 'Has “AI said” entries', type: 'regex', pattern: 'AI said', flags: 'i', hint: 'Label each entry with “AI said:”.' },
    { id: 'checked', label: 'Has “I checked” entries', type: 'regex', pattern: 'I checked', flags: 'i', hint: 'Label each entry with “I checked:” and name your source.' },
    { id: 'verdict', label: 'Gives verdicts', type: 'regex', pattern: 'verdict[^.\\n]{0,40}(correct|wrong|partly|incorrect|unverif|could not|couldn)', flags: 'i', hint: 'End each entry with “Verdict:” correct, partly correct, wrong, or could not verify.' },
    { id: 'rules', label: 'Has a rules section', type: 'regex', pattern: '#+\\s*(my )?rules', flags: 'i', hint: 'Add a heading “# My rules” with three rules.' }
  ],
  rubric: [
    { criterion: 'Correct mental model', lookFor: 'Describes training and next-token prediction accurately; does not say the model looks things up, understands like a person, or learns from the chat.' },
    { criterion: 'Clarity for the audience', lookFor: 'Plain language, jargon defined, a sensible analogy with its limits stated.' },
    { criterion: 'Verification quality', lookFor: 'Three answerable questions; named reliable sources; honest verdicts, including an uncomfortable one if the AI was wrong.' },
    { criterion: 'Responsible use', lookFor: 'Rules are concrete and cover privacy, checking and honesty, each with a reason.' }
  ],
  extensions: [
    'Run the same three questions through two different assistants and compare which was wrong, and how confident each sounded.',
    'Ask the same factual question three times and note whether the answers differ. What does that tell you about next-token sampling?',
    'Repeat the exercise after giving the assistant a short trusted passage and asking it to answer only from that passage. Did the errors change?'
  ],
  est: '45 min'
};
