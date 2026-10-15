// Level 0 lessons 06-10.

export const lessonsB = [
{
  id: 'l0-06', title: 'Tokens: the pieces a model reads', hook: 'A model does not read words. This explains odd spelling mistakes, strange limits and why cost is counted the way it is.',
  minutes: 10, skills: ['l0.tokens'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "You met the word “token” in the last lesson. A **token** is the small piece of text that a language model reads and writes. Often it's a common whole word, sometimes part of a word, sometimes a bit of punctuation or a chunk of digits." },
    { t: 'p', md: "Why not whole words? There are too many (plus misspellings, names, other languages). Why not letters? Everything would become very long. Pieces in between are the compromise: common things get one token, rare things are split." },
    { t: 'widget', w: 'tokenizer', props: { text: 'Unbelievably, the cat sat on 2026 mats.' }, caption: 'Try this: type your own name, a long rare word, a number, and a sentence in another language. Which cost more tokens?' },
    { t: 'predict', q: "Which of these is likely to take the MOST tokens, relative to its length?", options: ["A short, common English word like “the”", "A long, rare word you have just made up", "A single space"], answer: 1, explain: "Common words are usually one token. A rare or invented word has to be assembled from several smaller pieces. (The widget uses a simplified toy tokeniser; real ones differ in detail but follow the same principle.)", skill: 'l0.tokens' },
    { t: 'callout', kind: 'why', title: 'A useful rule of thumb', md: "For ordinary English, a token is very roughly three-quarters of a word, so 100 tokens is around 75 words. Treat that as a ballpark only: it varies between models, and text in other languages, code and unusual formatting often take noticeably more tokens for the same meaning." },
    { t: 'h', text: 'Why you should care' },
    { t: 'list', items: [
      "**Limits are in tokens.** A model can only handle so many at once (next lesson), so a ‘long document’ is measured in tokens, not pages.",
      "**Cost and speed follow tokens.** Services typically charge, and take time, according to the number of tokens read and written.",
      "**It explains odd mistakes.** Because the model sees pieces, not letters, it can fumble tasks like counting the letters in a word, or reversing a word, that seem trivial to you.",
      "**Some languages cost more.** If a tokeniser was built mostly around English, other languages may need more tokens for the same message, which can make them slower, costlier and fit less into the limit."
    ] },
    { t: 'callout', kind: 'misconception', title: 'Myth: “The model reads words like I do”', md: "It reads a stream of token ids: numbers standing for pieces of text. It never ‘sees’ the letters inside a token unless they are spelled out. That's why “how many r's in strawberry?” has tripped up models: the question is about letters; the model sees chunks." },
    { t: 'try', prompt: "You have a 3,000-word report to summarise and a service that limits how much text you can send at once. Roughly how many tokens is the report, and why might the estimate be off?", sample: "About 4,000 tokens (3,000 words ÷ 0.75). It could be off if the report has lots of numbers, unusual terms, tables, code, or is not in English, since all of these usually break into more tokens per word." }
  ],
  reteach: [
    { style: 'analogy', md: "Think of Lego. You can't build with raw plastic, and building everything from the smallest 1×1 bricks is slow. So kits come with common shapes (a whole wall piece for common things) and small bricks for fiddly things. Tokens are the kit: common words are one big piece; rare words are made from several small pieces." },
    { style: 'simple', md: "A model reads in small chunks called tokens. Short common words are usually one token; long or rare words are split into several. Tokens decide how much fits in a model's limit and how much you pay or wait. About 4 characters, or three-quarters of an English word, per token is a rough guide." },
    { style: 'technical', md: "Tokenisers such as byte-pair encoding start from bytes or characters and repeatedly merge the most frequent adjacent pairs found in a training corpus, producing a vocabulary of tens of thousands to a few hundred thousand pieces. Text is mapped to integer ids that index the model's embedding table. Text unlike the tokeniser's corpus fragments into more tokens." }
  ],
  takeaways: ["Models read and write tokens: pieces of text that are not always words.", "Common words are usually one token; rare words, numbers and some languages take more.", "Limits, cost and speed are measured in tokens.", "Seeing chunks, not letters, explains some odd mistakes."],
  apply: "Open any free token counter online or ask an assistant to estimate: how many tokens is a 500-word email? Does a block of code of the same length use more or fewer?"
},

{
  id: 'l0-07', title: 'Context window: what the model can see', hook: 'Why does a chat assistant forget things you said earlier, and why does a new chat start from scratch?',
  minutes: 13, skills: ['l0.context-window'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Imagine talking to someone who, every time they reply, is handed a transcript of the conversation so far and nothing else: no memory of yesterday, no recollection beyond the page. That's much closer to how a chat model works than a friend with a memory." },
    { t: 'h', text: 'The context window' },
    { t: 'p', md: "The **context window** is the amount of text, counted in tokens, that the model can look at when producing a reply. It contains your instructions, the conversation so far, anything you pasted in, and the reply being written. If it isn't in the window, the model can't see it. Full stop." },
    { t: 'widget', w: 'contextwindow', props: {}, caption: 'Try this: ask the question about the early fact, then shrink the window and ask again. Watch what happens to the oldest messages.' },
    { t: 'predict', q: "In a very long chat, you ask about something you mentioned at the start. The window is now full, and the app has dropped the oldest messages. What will the assistant most likely do?", options: ["Answer correctly, because it never forgets.", "Be unable to see it. It may say it doesn't know, or, worse, guess something plausible.", "Retrieve it from its training data."], answer: 1, explain: "What fell out of the window is invisible. A model may admit that, or invent a plausible reply. Your fact was never in its training data; it only existed in the chat.", skill: 'l0.context-window' },
    { t: 'callout', kind: 'analogy', title: 'A desk, not a library', md: "The context window is the size of the desk the model is working at. Only papers on the desk can be read. Training (next lesson) built the model's general knowledge, a bit like what's in its head, but your specific documents and messages only count when they're on the desk. A bigger desk helps, but a messy desk is harder to work from, and clearing it means everything on it is gone." },
    { t: 'callout', kind: 'misconception', title: 'Myth: “It remembers me from last time”', md: "By default a new chat starts empty. The model doesn't carry your earlier conversations in its head. Some apps offer a ‘memory’ feature, but that is the app saving notes and putting them back on the desk at the start of a new chat; it's not the model learning you. We look at how that works properly in Level 2." },
    { t: 'h', text: 'What fills the window' },
    { t: 'list', items: [
      "Hidden instructions from the app (how to behave).",
      "Everything you and the assistant have said so far, which is re-read every single turn.",
      "Documents or text you paste in.",
      "The reply it is writing right now."
    ] },
    { t: 'p', md: "Because the whole conversation is re-read each turn, long chats cost more and can get less reliable: the more text there is, the more chance something important is overlooked. Bigger windows help, but providers themselves note that accuracy can fall as the amount of text grows, so putting in the right material beats putting in everything." },
    { t: 'current', key: 'context-window-sizes' },
    { t: 'try', prompt: "You're working on a long project in one chat and the assistant starts contradicting earlier instructions. Give two likely reasons and one thing you could do.", sample: "Likely reasons: the early instructions may have fallen out of the window (or been summarised away by the app); or the window is so full that important details get lost among everything else. Fix: start a fresh chat with a short, clear summary of the key decisions and instructions at the top, rather than relying on it to remember." }
  ],
  reteach: [
    { style: 'analogy', md: "A whiteboard. The model can read everything written on the whiteboard, but it's a fixed size. When it fills up, someone rubs out the oldest lines to make room. The model does not remember what was rubbed out, and it never remembers a previous day's whiteboard unless someone writes it up again." },
    { style: 'simple', md: "The model only sees the text in its context window: your messages, its replies, and anything you pasted. Anything else, including a conversation from last week, is invisible to it. When the window is full, old text drops out and is gone." },
    { style: 'step-by-step', md: "1. You send message 1. The model sees: instructions + message 1. 2. It replies. 3. You send message 2. The model sees: instructions + message 1 + reply 1 + message 2. 4. Each turn, everything so far is passed in again. 5. When the total would exceed the limit, something has to be removed or shortened. 6. A new chat begins at step 1 again with nothing from before." }
  ],
  takeaways: ["The model only sees what is in its context window: instructions, the conversation, pasted text, and its own reply.", "Old text can drop out; a new chat starts empty.", "Chatting does not teach the model. App ‘memory’ is notes put back into the window.", "More text is not automatically better; relevant text is."],
  apply: "Start a new chat with any assistant, tell it two facts about a made-up person, chat a bit, then ask for them back. Then open another new chat and ask again. Note exactly what it can and can't see."
},

{
  id: 'l0-08', title: 'Training vs inference: building a model vs using it', hook: 'Understanding when a model learns, and when it absolutely does not, clears up a dozen misunderstandings at once.',
  minutes: 13, skills: ['l0.training-inference'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Every AI model has two very different phases in its life, and mixing them up is behind many myths. Think of the difference between a chef training for years and a chef cooking your dinner tonight." },
    { t: 'h', text: 'Phase 1: training' },
    { t: 'p', md: "**Training** is where the model's parameters (those billions of weights from lesson 3) get set. For a large language model this means processing a huge amount of text, predicting the next token over and over, and nudging the weights after each miss. It requires specialised hardware, large amounts of electricity and money, and takes a long time. It happens once (or occasionally), at the model builder, before you ever meet the model." },
    { t: 'p', md: "Usually there are further stages after that first one. The initial stage makes the model good at continuing text; later stages shape it into a helpful assistant, for example by training it on examples of good answers and on human ratings of which of its answers people prefer. Roughly: first it learns language and a lot of facts, then it learns to behave like an assistant." },
    { t: 'h', text: 'Phase 2: inference' },
    { t: 'p', md: "**Inference** is using the finished model. You send text; the model, with its weights frozen, predicts tokens and sends back an answer. It's much cheaper per use and takes seconds. Nothing in the model changes." },
    { t: 'widget', w: 'flow', props: {
        title: 'The life of a model',
        height: 320,
        nodes: [
          { id: 'data', label: 'Huge text collection', x: 12, y: 20, kind: 'input', note: 'The training data: vast amounts of text. Its gaps and biases end up in the model.' },
          { id: 'train', label: 'Training (predict, miss, nudge, repeat)', x: 40, y: 20, kind: 'process', note: 'Done by the builder, on huge amounts of hardware, over a long time. This is where weights are set.' },
          { id: 'tune', label: 'Further tuning, including human feedback', x: 70, y: 20, kind: 'process', note: 'Shapes a text-continuer into a helpful assistant, using examples of good answers and human preferences.' },
          { id: 'model', label: 'Finished model (weights frozen)', x: 70, y: 55, kind: 'model', note: 'A fixed set of numbers. Your chats do not change it.' },
          { id: 'you', label: 'You: a prompt', x: 12, y: 85, kind: 'human', note: 'Your question, plus the conversation so far, goes in as the context.' },
          { id: 'infer', label: 'Inference (predict tokens)', x: 40, y: 85, kind: 'process', note: 'Fast and cheap compared with training. Reads the context, writes an answer, learns nothing.' },
          { id: 'answer', label: 'Answer', x: 82, y: 85, kind: 'output', note: 'Generated text. Not checked by anything unless you check it.' }
        ],
        edges: [['data', 'train'], ['train', 'tune'], ['tune', 'model'], ['you', 'infer', 'prompt'], ['model', 'infer', 'uses'], ['infer', 'answer']],
        steps: [
          { show: ['data', 'train'], text: 'Training: the builder shows the model enormous amounts of text and nudges its weights, repeatedly.' },
          { show: ['data', 'train', 'tune', 'model'], text: 'Further tuning shapes it into an assistant. The result is a finished model: frozen numbers.' },
          { show: ['model', 'you', 'infer', 'answer'], text: 'Inference: your prompt goes in, the frozen model predicts tokens, an answer comes out. Nothing is learned.' }
        ]
      }, caption: 'Step through with Next. Click a box for a note.' },
    { t: 'predict', q: "You spend an hour correcting an assistant's mistakes in one chat. Did you improve the model for the next person who uses it?", options: ["Yes, it learns from every conversation immediately.", "No. The chat happens at inference time, and the weights don't change.", "Yes, but only if you thank it."], answer: 1, explain: "Inference doesn't update the weights. Your corrections only live in that chat's context. (Separately, some providers may use conversations, depending on their policy and your settings, as material for a later training round. That is a deliberate step by the company, not the chat itself learning, and it's why you should check the privacy settings.)", skill: 'l0.training-inference' },
    { t: 'callout', kind: 'misconception', title: 'Myth: “It is always learning from our chat”', md: "While you chat, the model isn't learning. It's reading your conversation as context and predicting. Whether a company later *uses* chats to help train future models depends on its policy and your settings, so check them. That is a separate, later, deliberate process." },
    { t: 'callout', kind: 'misconception', title: 'Myth: “Bigger is always better”', md: "More parameters and more training data often improve a model, but not always. Bigger models are slower and costlier to run. Data quality matters as much as quantity. A smaller model that fits the task can be the better choice. And any model, big or small, stops learning when training stops." },
    { t: 'callout', kind: 'why', title: 'The “knowledge cut-off”', md: "Because training happens before use, a model's built-in knowledge stops at some point in time. Anything that happened after, it simply doesn't have unless the information is put into the context window or provided through a tool. This is why a plain assistant may be out of date about recent events, and why you can't assume it knows today\'s news." },
    { t: 'compare', title: 'Training vs inference', cols: ['', 'Training', 'Inference'], rows: [
      ['What happens', 'Weights are adjusted using lots of data', 'Frozen weights produce an answer'],
      ['Who, where', 'The builder, in data centres', 'Anyone using the model, anywhere'],
      ['Time and cost', 'Very long and very expensive', 'Seconds and comparatively cheap'],
      ['Does the model change?', 'Yes, that\'s the point', 'No']
    ] },
    { t: 'try', prompt: "A friend says: “I told it my favourite colour yesterday, so it knows me now.” In two sentences, explain what's really going on, using the words ‘inference’ and ‘context’.", sample: "Chatting is inference: the model's weights are frozen, so it can't have learned your colour. If it appears to remember, either the information is still in the current context window, or the app has a memory feature that saved a note and put it back into the context." }
  ],
  reteach: [
    { style: 'analogy', md: "Training is a chef spending years at cookery school and in kitchens. Inference is that chef cooking your dinner tonight. Your dinner order doesn't send the chef back to school; at most it sits on the order ticket (the context) for tonight. If a restaurant later uses lots of orders to redesign its menu, that is a separate deliberate decision." },
    { style: 'simple', md: "Training = building the model, slowly, with lots of data and computing power. Inference = using the built model, quickly. When you chat, you're doing inference, so the model doesn't learn from you. What it knows was fixed at training time." },
    { style: 'technical', md: "Training runs gradient-based optimisation over a large corpus (pre-training), followed by post-training stages such as supervised fine-tuning on demonstrations and preference-based methods that use human rankings (RLHF and relatives). Inference is a forward pass with fixed weights, repeated per generated token; any 'adaptation' within a session happens through the context (in-context learning), not weight updates." }
  ],
  takeaways: ["Training builds the model (sets the weights); inference uses it (weights frozen).", "Chatting doesn't teach the model. Corrections live only in that chat's context.", "A model's knowledge stops at its training cut-off unless fresh information is supplied.", "Bigger is often, but not always, better, and it costs more to run."],
  apply: "Find the privacy or data-controls settings of an AI tool you use (or a free one). Does it say whether your chats may be used to improve its models? Write down what you'd choose and why."
},

{
  id: 'l0-09', title: 'Hallucinations: confident and wrong', hook: 'AI can state something false in a perfectly calm voice. Once you see why, you will know exactly when to check.',
  minutes: 14, skills: ['l0.hallucination'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Here is the most important practical lesson in the level. A **hallucination** is when an AI states something false or invented as if it were true: a quotation nobody said, a court case that never happened, a book that doesn't exist, with a perfectly real-looking reference." },
    { t: 'h', text: 'Try to catch one' },
    { t: 'p', md: "Below is a fluent paragraph of the kind an assistant might write. Flag the sentences you would want to verify before relying on them, then reveal which were actually shaky. (This passage was written by hand for this exercise, not by a live model.)" },
    { t: 'widget', w: 'claimcheck', props: {
        title: 'A confident biography of a (made-up) author',
        skill: 'l0.hallucination',
        segments: [
          { text: 'Marguerite Ellison-Voss is a celebrated British novelist who published her first book in 1987. ', claim: true, status: 'false', why: 'Marguerite Ellison-Voss is invented for this exercise. A fluent opening does not make the person real; with an unknown name, the model has nothing to check and still sounds sure.' },
          { text: 'Her debut novel, The Salt Orchard, won the fictional Harlow Prize in 1988. ', claim: true, status: 'false', why: 'Invented title and invented prize. Specific names and dates are exactly what a model produces when it fills in a pattern.' },
          { text: 'Novels, in general, are works of fiction in prose. ', claim: false, status: 'true', why: 'A widely known general statement. Low risk, though not worth ignoring in high-stakes writing.' },
          { text: 'Critics have often compared her work to that of other writers of the period. ', claim: false, status: 'unverifiable', why: 'Vague wording that can\'t be checked; there are no named critics or sources. Vagueness is a sign nothing concrete stands behind it.' },
          { text: 'She is quoted as saying, “A sentence is a promise you must keep.” ', claim: true, status: 'false', why: 'A fabricated quotation. Quotes with an attributed speaker are a classic hallucination, because they sound right.' }
        ]
      }, caption: 'Tap the sentences you would verify, then press Reveal.' },
    { t: 'h', text: 'Why it happens' },
    { t: 'p', md: "Recall what a language model does: it predicts a plausible next token, over and over. “Plausible” is the key word. The model is trained to produce text that *fits*, not text that has been checked. When it knows a fact well, the plausible continuation is usually the true one. When it doesn't, such as a rare fact, an obscure name or something after its cut-off, it still produces the most plausible-looking continuation, which can be entirely invented." },
    { t: 'list', items: [
      "**No built-in fact-check.** Nothing in the basic process compares the output with reality.",
      "**Fluency hides uncertainty.** The writing sounds the same whether the model is sure or guessing; tone is not evidence.",
      "**Rare or specific details are riskiest.** Names, numbers, dates, quotations, citations, URLs and legal or medical specifics.",
      "**Leading questions invite it.** Asking “Why did X do Y?” may produce an explanation even if X never did Y.",
      "**It can be wrong about itself.** Asking a model how sure it is, or how it got its answer, may also produce a plausible-sounding but unreliable reply."
    ] },
    { t: 'callout', kind: 'misconception', title: 'Myth: “If it sounds sure, it must know”', md: "Confidence in an AI's tone has almost no connection to accuracy. A person who is bluffing might hesitate. A model has no hesitation to show." },
    { t: 'predict', q: "Which request is most likely to produce a hallucination from a plain assistant with no search tool?", options: ["Rewrite this paragraph more politely (paragraph supplied).", "Give me the exact page number and quote from a 1974 report by a small local council.", "Explain in simple words what photosynthesis is."], answer: 1, explain: "The first task works on text you supplied, and the third is a common, heavily repeated topic. The second asks for obscure, exact details, which is where models most often fill gaps with confident inventions.", skill: 'l0.hallucination' },
    { t: 'h', text: 'What to do about it' },
    { t: 'steps', items: [
      { title: 'Match the checking to the stakes', md: "A joke needs no check. A medical, legal, financial or published claim needs a lot." },
      { title: 'Check the specifics', md: "Names, numbers, dates, quotes and links. Search for them in a source you trust. If you can't find a reference, treat it as unreal until proven otherwise." },
      { title: 'Supply the source', md: "You\'ll see in Level 1 that giving the model the text and asking it to answer only from that text, and to quote where, makes errors rarer and easier to spot. It reduces the problem; it doesn't remove it." },
      { title: 'Ask for what you can verify', md: "Request quotes or section references you can look up, and say it\'s fine to answer “I don\'t know”." }
    ] },
    { t: 'callout', kind: 'why', title: 'Search-connected assistants', md: "Some assistants can search the web or read documents and then write an answer. That helps, because the facts are put in front of the model. It's still the same generating machine on top, so it can misread a source, cite the wrong one, or blend sources. Open the link and check." },
    { t: 'try', prompt: "Write a one-sentence rule for yourself about what you will always check in an AI answer, and one thing you won't bother checking.", sample: "Always check: any name, number, date, quotation, citation or link that I will repeat to someone else or act on. Won't bother: a casual brainstorm of party themes, where being wrong costs nothing." }
  ],
  reteach: [
    { style: 'analogy', md: "Imagine a brilliant improviser who is asked about a topic they half-remember, and who never says “I'm not sure”. They'll give a smooth, convincing answer in the same tone either way. The smoothness is a skill, not a sign of truth. A hallucination is the model\'s version of that: a fluent answer that fits the pattern, whether or not it is real." },
    { style: 'simple', md: "The model writes what sounds like a good answer. It doesn't check facts. So sometimes it writes fluent things that are false, especially about specific, rare details such as names, numbers, quotes and sources. Its tone gives no clue. So check the details that matter." },
    { style: 'step-by-step', md: "1. Look at the claims that could cause harm if wrong. 2. Pick out the checkable details: names, numbers, dates, quotes, references. 3. Look each up in a source you trust, not in the same assistant. 4. If you can't verify something, say so, or leave it out. 5. Record what you verified so you can show your work." }
  ],
  takeaways: ["Hallucinations are fluent, confident falsehoods; they come from generating plausible text, not checked facts.", "Tone tells you nothing about accuracy.", "Specific details (names, numbers, quotes, citations, links) are the riskiest.", "Match checking to stakes, and verify with an independent source."],
  apply: "Ask an assistant for a short biography of someone modestly known (a local figure, or a small-company founder you can verify). Check three claims. How many held up?"
},

{
  id: 'l0-10', title: 'Strengths, limits and using AI responsibly', hook: 'You now have the mental model. Here is how to use it: where AI helps, where it should not be trusted, and the habits that keep you safe.',
  minutes: 15, skills: ['l0.limits', 'l0.responsible-ai'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "You now know what AI is, how it learns, how a language model writes, what it can see, and why it can be confidently wrong. This final lesson turns that knowledge into judgement: *when* to use it, *how far* to trust it, and what to protect." },
    { t: 'h', text: 'Where it helps, where it struggles' },
    { t: 'widget', w: 'sorter', props: {
        title: 'Good use, or risky without checking?',
        buckets: ['Good fit', 'Risky: needs strong checking or a different tool'],
        skill: 'l0.limits',
        items: [
          { text: 'Rewording your own rough email so it sounds friendlier', bucket: 'Good fit', why: 'You supplied the content and can read the result in seconds. Low risk, easy to judge.' },
          { text: 'Brainstorming twenty names for a school club', bucket: 'Good fit', why: 'Variety is the goal and there is no single right answer to get wrong.' },
          { text: 'Asking for the exact dose of a medicine for a child', bucket: 'Risky: needs strong checking or a different tool', why: 'A wrong detail can cause real harm, and models can state wrong specifics confidently. Use a pharmacist or official guidance.' },
          { text: 'Summarising a long article that you pasted in', bucket: 'Good fit', why: 'The source is in the context and you can spot-check against it, though read the summary critically.' },
          { text: 'Asking for legal citations to include in a court filing', bucket: 'Risky: needs strong checking or a different tool', why: 'Invented cases are a well-known failure. Every citation must be verified in an official source.' },
          { text: 'Doing exact arithmetic on a long list of figures by asking it to add them up in its reply', bucket: 'Risky: needs strong checking or a different tool', why: 'A language model predicts digits; it doesn\'t calculate. A spreadsheet or calculator is the right tool (some assistants can run code, which helps).' }
        ]
      }, caption: 'Select an item, then choose its box. Notice what the risky ones have in common.' },
    { t: 'p', md: "Did you spot it? The good fits are tasks where you provide the material or where there is no single right answer, and where you can check the result quickly. The risky ones depend on exact facts, carry real consequences, or need precise calculation." },
    { t: 'compare', title: 'A fair summary', cols: ['Usually strong at', 'Usually weak at'], rows: [
      ['Drafting, rewording, summarising supplied text', 'Exact facts, figures and citations from memory'],
      ['Brainstorming and offering alternatives', 'Reliable arithmetic and counting'],
      ['Explaining common ideas at different levels', 'Knowing what happened after its training cut-off'],
      ['Translating and reformatting', 'Knowing when it is wrong']
    ] },
    { t: 'callout', kind: 'misconception', title: 'Myth: “AI is either magic or useless”', md: "Neither. It is a powerful pattern tool with specific strengths and specific blind spots. People who treat it as magic get burned by confident errors; people who dismiss it miss real help. Calibrated trust, matched to the task and the stakes, is the skill." },
    { t: 'h', text: 'Four habits of responsible use' },
    { t: 'steps', items: [
      { title: 'Protect private information', md: "Treat what you type as something that leaves your control, unless you know your tool\'s policy. Don\'t paste passwords, other people\'s personal details, medical or financial records, or confidential work material into a tool you haven\'t been cleared to use for it. Check whether the tool may keep your chats or use them to improve its models." },
      { title: 'Verify what matters', md: "Check names, numbers, quotations and sources independently, scaled to the stakes (last lesson)." },
      { title: 'Watch for bias', md: "A model reflects patterns in its training data, including stereotypes and gaps. If it is describing, ranking or making decisions about people, look hard at who might be treated unfairly, and keep a human accountable." },
      { title: 'Be honest and keep the responsibility', md: "Say when you've used AI where it matters (school, work, publishing). The answer is still yours to stand behind: \"the AI said so\" is not a defence." }
    ] },
    { t: 'predict', q: "A manager pastes a spreadsheet of staff performance reviews, with names and ratings, into a public chatbot to ask for “fair promotion rankings”. What is the biggest problem?", options: ["The chatbot will be bored.", "It shares private personal data with an outside service, and a model's ranking of people can reflect bias without any human accountability.", "Spreadsheets cannot be read by chatbots.", "There is no problem; the chatbot is objective."], answer: 1, explain: "Two issues at once: privacy (personal data leaving the organisation) and fairness (a model\'s ‘objective’ ranking can encode bias; it is not neutral). A responsible approach keeps data protected and a human accountable for decisions about people.", skill: 'l0.responsible-ai' },
    { t: 'callout', kind: 'why', title: 'Appropriate trust is the whole game', md: "Over-trust leads to confident mistakes; under-trust wastes real help. Ask three questions for every use: What happens if this is wrong? Can I check it quickly? Am I sharing anything I shouldn\'t? Those three answer most decisions." },
    { t: 'try', prompt: "Choose a real task you might use AI for this week. Say how you'd use it, what you'd check, and what you would not paste in.", sample: "Example: summarising a long article for a meeting. I'd paste only the public article, ask for a summary with key points and quote the sentences they come from, check two or three of the quotes against the article, and not paste anything from internal documents. I'd say in the meeting that I used an AI summary." },
    { t: 'h', text: 'Ready for the capstone' },
    { t: 'p', md: "Your capstone project, **Explain AI to someone, then check an AI**, pulls this level together. You'll write a short explanation for a real person, bust one myth, run three fact-checks on an AI assistant and record what you found, and set three rules for yourself. Nothing new to learn; just show what you now know." }
  ],
  reteach: [
    { style: 'analogy', md: "An AI assistant is like a very fast, well-read intern who never admits uncertainty. You wouldn't have them do your tax return unsupervised, or give them the staff files to take home. But you'd happily have them draft, brainstorm and summarise, and you'd skim their work before it goes out. Trust scales with stakes and with how easily you can check." },
    { style: 'simple', md: "Use AI for drafting, rewording, summarising what you give it, and brainstorming. Be careful with exact facts, numbers, citations and anything where a mistake could hurt someone. Don't paste private information into tools you don\'t trust. Check what matters. Own the result." },
    { style: 'step-by-step', md: "Before using AI on a task: 1. What happens if the output is wrong? (low / high). 2. Can I check it quickly? 3. Does my input include anything private or confidential? 4. Could the output treat people unfairly? 5. If the stakes are high, do I have a person-in-charge and a source to verify against? Then decide how much to trust it." }
  ],
  takeaways: ["AI is strongest where you supply the material and can check quickly; weakest on exact facts, arithmetic and high-stakes details.", "Trust should scale with the stakes and with how easily you can verify.", "Protect private data, watch for bias, verify what matters, and be honest about using AI.", "You stay responsible for what you use or publish."],
  apply: "Write your own three-line AI policy for yourself: one thing you will use it for, one thing you will always check, one thing you will never paste in. Keep it; it becomes part of your capstone."
}
];
