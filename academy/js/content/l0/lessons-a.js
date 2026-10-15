// Level 0 lessons 01-05.

export const lessonsA = [
{
  id: 'l0-01', title: 'Your first 10 minutes: what AI actually is', hook: 'You already use AI every day; ten minutes from now you will be able to say exactly what it is, and what it is not.',
  minutes: 12, skills: ['l0.what-is-ai', 'l0.narrow-general'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "If your honest thought is “I don't really understand AI”, you are in the right place, and in good company. By the end of this level you will be able to explain it. You already bring more than you think: you have used a phone that finishes your sentences and a map that reroutes around traffic." },
    { t: 'h', text: 'Sort these first, explain later' },
    { t: 'p', md: "Before I explain anything, sort these everyday things into two boxes: those that use AI, and ordinary software that follows fixed instructions. Go with your gut. This isn't marked." },
    { t: 'widget', w: 'sorter', props: {
        title: 'AI, or ordinary software?',
        buckets: ['Uses AI', 'Ordinary software'],
        skill: 'l0.what-is-ai',
        items: [
          { text: 'Your phone suggesting the next word as you type a message', bucket: 'Uses AI', why: 'The suggestions come from a model that learned which words tend to follow which, from lots of text.' },
          { text: 'A calculator adding 17 + 25', bucket: 'Ordinary software', why: 'Fixed arithmetic rules, always the same answer. Nobody needs a model to add.' },
          { text: 'A spam filter deciding an email looks like junk', bucket: 'Uses AI', why: 'Nobody can write a rule for every kind of spam, so the filter learns patterns from examples of spam and not-spam.' },
          { text: 'A spreadsheet adding up a column of numbers', bucket: 'Ordinary software', why: 'A rule written by a programmer: add these cells. No learning involved.' },
          { text: 'Face unlock on a phone', bucket: 'Uses AI', why: 'Recognising a face under different lighting and angles can\'t be done with simple rules, so it is learned from many examples.' },
          { text: 'A traffic light that changes every 60 seconds on a timer', bucket: 'Ordinary software', why: 'A timer is a fixed rule. (Some modern junctions do use sensors and smarter control, but a plain timer is not AI.)' }
        ]
      }, caption: 'Select an item, then choose its box (press the “Put in” button). When all are placed, press Check.' },
    { t: 'p', md: "Notice what pushed things into the first box: the task was something we find easy but can't easily write rules for, like recognising a face or judging whether an email smells like spam. That's the heart of it." },
    { t: 'h', text: 'A plain definition' },
    { t: 'p', md: "**Artificial intelligence (AI)** is software that performs tasks we normally associate with human thinking: recognising speech, translating, spotting patterns, writing, making recommendations. It's a broad label for many different techniques, a bit like “transport” covers bicycles and aeroplanes." },
    { t: 'p', md: "Notice what the definition does *not* say. It doesn't say the software understands, has opinions, or is alive. It says the software does a task. Keep that distinction in your pocket; it will protect you from a lot of hype." },
    { t: 'callout', kind: 'misconception', title: 'Myth: “AI means a thinking machine, like in films”', md: "The AI in films is usually *general* AI: a machine that can do anything a person can. That doesn't exist today. Every AI you can use right now is **narrow**: very good at a kind of task, and useless outside it." },
    { t: 'predict', q: "A chess program beats the world champion. A friend says, “So it could also plan your holiday, right?” What is the best answer?", options: ["Yes, if it can beat a champion it is clearly general intelligence.", "No. It is narrow: brilliant at chess and unable to do anything it wasn't built for.", "Yes, but only if you connect it to the internet.", "No, because chess is too simple for it to count as AI."], answer: 1, explain: "A chess engine is the classic narrow system. Winning at one thing, however impressive, doesn't transfer to unrelated tasks. The recent chat assistants *feel* broader because they handle lots of language tasks, but they are still not general intelligence in the science-fiction sense.", skill: 'l0.narrow-general' },
    { t: 'compare', title: 'Narrow vs general AI', cols: ['', 'Narrow AI', 'General AI'], rows: [
      ['What it is', 'Built or trained for one kind of task, or a family of related ones', 'A system that could learn and do any intellectual task a person can'],
      ['Does it exist?', 'Yes. Everything in use today', 'No. It remains a goal and a debate'],
      ['Example', 'A spam filter, a translator, a chat assistant', 'The robots in films']
    ] },
    { t: 'callout', kind: 'why', title: 'Why “broad-feeling” does not mean general', md: "A chat assistant can draft an email, explain tax terms and write a poem, so it feels general. But all of that is one skill: producing plausible text. It has no body, no goals of its own, and it can't tell you whether it is right. You will see the machinery behind this in lessons 4 to 6." },
    { t: 'try', prompt: "In one or two sentences, finish this: “AI is ___, and it is not ___.” Write it in your own words, as if to a ten-year-old.", sample: "A good answer is something like: “AI is software that does tasks that normally need human judgement, like recognising pictures or writing text. It is not a thinking, feeling mind, and today's AI can only do the kinds of things it was built or trained for.” If you said it's ‘a computer that thinks’, that is the one idea to adjust: it performs tasks; it doesn't think the way we do." },
    { t: 'p', md: "Over this level you will build the picture one step at a time: learning from examples, neural networks, generative AI, language models, tokens, memory, training, hallucinations and responsible use. Each lesson has something you can click and play with. Nothing here needs maths or coding." }
  ],
  reteach: [
    { style: 'analogy', md: "Think of “AI” like the word “vehicle”. A skateboard and a jumbo jet are both vehicles, but nobody expects the skateboard to cross the Atlantic. Each AI system is a particular tool built for a particular job. Some are a bit more versatile, but none is the all-purpose machine from the films." },
    { style: 'simple', md: "AI = software that does a task which usually needs human judgement. Today every AI is good at some things and hopeless at others. If a program just follows fixed instructions (add these numbers), that is ordinary software. If it had to *learn* how to do the task from examples (spot spam), that is where AI comes in." },
    { style: 'step-by-step', md: "1. Ask: could a programmer write exact rules for this task? 2. If yes (adding, sorting by date), it is ordinary software. 3. If no, because the task is fuzzy (is this a cat? does this email look like a scam?), the software has to learn from examples. That is AI. 4. Then ask: can it do other, unrelated tasks? If not, it is narrow, which is every AI today." }
  ],
  takeaways: ["AI is software that does tasks we link to human thinking; it is a broad label, not one machine.", "Fuzzy tasks that can't be written as exact rules (faces, spam, language) are where AI is used.", "Everything available today is narrow AI. General AI is a goal and a debate, not a product.", "Feeling broad is not the same as being general."],
  apply: "Look at your phone for five minutes. Find three features you would now call AI and one that is just ordinary software. For each AI feature, write down what examples it must have learned from."
},

{
  id: 'l0-02', title: 'Machine learning: examples instead of rules', hook: 'Some jobs are impossible to write rules for; machine learning is how computers get around that.',
  minutes: 12, skills: ['l0.machine-learning'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "Last time you saw that AI tackles tasks we can't write rules for. Let's look at *how*. This single idea, learning from examples, is what makes everything else in this level make sense." },
    { t: 'h', text: 'The rule-writing trap' },
    { t: 'p', md: "Imagine you have to build a program that decides whether an email is spam. The traditional way is to write rules. Try it in your head:" },
    { t: 'list', items: ["If the email says “WINNER”, treat it as spam.", "If the email says “free money”, treat it as spam.", "If the email says “you have won”, treat it as spam.", "Otherwise, let it through."] },
    { t: 'p', md: "That is a hand-written spam filter. A person had to think of every rule." },
    { t: 'predict', q: "A scammer sends: “Fr33 m0ney inside!!! Click now”. What does the rule-based filter above do?", options: ["Catches it, because it contains the idea of free money.", "Misses it, because the exact phrases are not present.", "Crashes, because of the number zero."], answer: 1, explain: "Rules match exact text. The scammer only has to change a few letters to slip past, and then someone has to write a new rule, forever. That is the trap: the world has too many variations for hand-written rules.", skill: 'l0.machine-learning' },
    { t: 'h', text: 'Flip it around' },
    { t: 'p', md: "**Machine learning** flips the process. Instead of a person writing the rules and feeding data in, you give the computer many *examples* with the right answers (thousands of emails marked “spam” or “not spam”) and let it work out for itself which patterns separate them. What comes out is a **model**: the thing that has learned." },
    { t: 'compare', title: 'Two ways to build the same thing', cols: ['', 'Rules (traditional)', 'Machine learning'], rows: [
      ['Who works out the logic?', 'A programmer', 'The computer, from examples'],
      ['What you provide', 'Rules', 'Examples with answers (the training data)'],
      ['What you get', 'A program', 'A model that has learned a pattern'],
      ['Copes with new variations?', 'Only if someone anticipated them', 'Often, if they resemble the examples'],
      ['Biggest risk', 'Rules you forgot', 'Examples that are poor, biased or incomplete']
    ] },
    { t: 'callout', kind: 'analogy', title: 'Teaching a child to recognise dogs', md: "You don't give a toddler a rulebook (“four legs, fur, tail, barks”; that would include cats). You point at lots of dogs and say “dog”, and at lots of non-dogs and say “not dog”. Eventually they get it, and can recognise a dog breed they've never met. Machine learning is much the same, with one big difference: the computer needs far more examples than a toddler and has no common sense to lean on." },
    { t: 'h', text: 'Watch a machine find a pattern' },
    { t: 'p', md: "Below is a tiny version. Two kinds of points are scattered on a grid. A small learning program is going to work out where the border between them lies, just from the examples. Press Train and watch the shaded regions settle. (How it is built is next lesson's story.)" },
    { t: 'widget', w: 'nnplayground', props: { dataset: 'linear', pretrain: 0 }, caption: 'Try this: press Train and watch the shaded regions settle. Then click New data and train again: same method, new examples, new border.' },
    { t: 'callout', kind: 'why', title: 'Why the data matters so much', md: "The model can only learn what is in its examples. If every dog photo in the training set is taken in a park, it may learn “grass means dog”. If the examples lack a group of people, it will do worse for them. “Garbage in, garbage out” is the oldest rule in the field, and it is why lesson 10 returns to bias." },
    { t: 'callout', kind: 'misconception', title: 'Myth: “Someone programmed the AI with the answers”', md: "Nobody wrote down the answers. People wrote the *learning procedure* and gathered the examples. What the model ends up knowing is spread across numbers that no person set by hand, which is also why even its builders can't always explain a particular decision." },
    { t: 'try', prompt: "Pick a task you'd like a computer to do (for example, sorting your photos into holidays). What examples would you have to collect so that it could learn this, and what might go wrong with them?", sample: "For photos: many photos labelled by trip. Things that could go wrong: if most examples are sunny beach shots, it may call any sunny photo ‘holiday’; if you only labelled summer trips, it fails on a ski trip; if some were labelled wrongly, it learns your mistakes. The point is that the quality and spread of the examples decide the quality of the model." }
  ],
  reteach: [
    { style: 'analogy', md: "Rules are like handing a new cook a recipe. Machine learning is like having them taste a thousand dishes labelled “good” and “not good” until they develop a feel for it. The recipe covers what you foresaw; the taster copes with new dishes, but can pick up a bad habit if the dishes they tasted were unrepresentative." },
    { style: 'simple', md: "Traditional program: you tell the computer the steps. Machine learning: you show the computer lots of solved examples and it works out the steps itself. The result is called a model. It's only as good as the examples it saw." },
    { style: 'technical', md: "In supervised learning you have inputs x and labels y. A model with adjustable parameters produces predictions from x; a loss function measures how far the predictions are from y; and an optimiser nudges the parameters to shrink the loss. After many passes the model generalises to unseen x that resemble the training distribution, and degrades on inputs that don't." }
  ],
  takeaways: ["Machine learning replaces hand-written rules with patterns learned from examples.", "What it produces is a model, which can often handle new cases that resemble its examples.", "A model is only as good, and as fair, as the examples it learned from.", "Nobody typed the answers in, and the model does not update itself after it is built."],
  apply: "Think of one decision you make with a feel for it rather than rules (is this milk off? is this stranger trustworthy?). What ‘examples’ built that feel? Where could those examples have misled you?"
},

{
  id: 'l0-03', title: 'Neural networks: from one neuron to many', hook: 'Behind most modern AI is one very simple idea repeated billions of times.',
  minutes: 14, skills: ['l0.neural-nets'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "You'll often hear that modern AI is built on “neural networks”. The name sounds like brain surgery, but the idea is ordinary arithmetic. We'll build it from the smallest piece." },
    { t: 'h', text: 'One neuron: a tiny decision-maker' },
    { t: 'p', md: "Think about deciding whether to go to the park. You weigh up a few things: is it sunny? is it warm? are your friends going? Some matter more than others. A **neuron** in a neural network does the same thing, with numbers." },
    { t: 'list', items: [
      "**Inputs** are the facts coming in (sunny? friends going?).",
      "A **weight** is a number saying how much one input matters. Friends might matter a lot, the weather a little. A negative weight argues *against*.",
      "The **bias** is a built-in tilt before any input arrives. A lazy person has a tilt towards “no”.",
      "The neuron multiplies each input by its weight, adds the results and the bias, and says “yes” if the total is high enough."
    ] },
    { t: 'widget', w: 'neuron', props: {}, caption: 'Try this: move one slider at a time and watch the answer change. You do not need a perfect score; the point is to feel what each slider does.' },
    { t: 'predict', q: "You turn one weight from positive to strongly negative. What does that input now do to the neuron?", options: ["Nothing, because weights only make things bigger.", "It pushes the neuron towards “no” whenever that input is on.", "It switches the neuron off for good."], answer: 1, explain: "A negative weight means “when this is present, argue against saying yes”. Weights can be positive (for), negative (against) or near zero (ignored). Learning is mostly finding good weights.", skill: 'l0.neural-nets' },
    { t: 'h', text: 'Many neurons: a network' },
    { t: 'p', md: "One neuron can only draw a straight line between “yes” and “no”. Join neurons in **layers**, so that the answers of one layer feed the next, and the network can capture curvy, tangled patterns. Nobody tells it what to look for; that emerges from training." },
    { t: 'p', md: "Training is trial and error at enormous scale. Show the network an example, see how wrong its answer is, and nudge every weight a tiny amount towards being less wrong. Repeat millions of times. Below, a small network does this on two kinds of points sitting in opposite corners, which no single straight line can separate." },
    { t: 'widget', w: 'nnplayground', props: { dataset: 'xor' }, caption: 'Try this: with 1 unit it struggles. Raise the units to 4 and train again, and watch the error number fall.' },
    { t: 'callout', kind: 'why', title: 'Why more units helped', md: "With very few neurons the network doesn't have enough adjustable weights to bend its border around the pattern. Real AI models have *billions* of weights. That scale is what lets them capture something as complicated as language, but they work the same way as your four-unit toy." },
    { t: 'callout', kind: 'misconception', title: 'Myth: “A neural network works like a brain”', md: "The inspiration was loosely biological, but an artificial neuron is just a weighted sum and a yes/no rule. A real brain is far more complex, and we don't fully understand how it learns. “Neural network” is a name, not a claim that it thinks like you." },
    { t: 'callout', kind: 'tip', title: 'For the curious (optional)', md: "Real neurons squash their total through a rule called an *activation function* (names like sigmoid and ReLU), and training uses an algorithm called *backpropagation* to work out which way to nudge each weight. You don't need any of these names for the rest of this level." },
    { t: 'try', prompt: "In your own words: what are the weights in a network, and what does training do to them?", sample: "Weights are the adjustable numbers that say how much each input matters to each neuron. Training shows the network lots of examples, measures how wrong it is, and nudges the weights a little to be less wrong, again and again, until the answers are good. A model's ‘knowledge’ lives in those numbers." }
  ],
  reteach: [
    { style: 'analogy', md: "Picture a mixing desk with thousands of sliders. Each slider is a weight. Music (the input) goes in, passes through the sliders, and something comes out. Training is a very patient engineer who nudges each slider slightly after every song, to make the output closer to what was wanted. After millions of nudges the desk produces good output without anyone understanding every slider." },
    { style: 'simple', md: "A neural network is lots of simple calculators wired in layers. Each one multiplies its inputs by importance numbers (weights), adds them up, and passes on a result. Training adjusts all the importance numbers until the final answers are good." },
    { style: 'step-by-step', md: "1. Input numbers go into the first layer. 2. Each neuron multiplies every input by its weight, adds them up, and adds its bias. 3. A simple rule turns that total into the neuron's answer. 4. Those outputs feed the next layer. 5. The last layer gives the answer. 6. Training compares the answer with the right one and nudges the weights to reduce the error. Repeat." }
  ],
  takeaways: ["A neuron is a weighted sum plus a bias, passed through a simple rule.", "Layers of neurons can learn patterns that a single neuron can't.", "Training nudges all the weights, little by little, to make the output less wrong.", "‘Neural’ is an inspiration, not a claim that it works like a brain."],
  apply: "Pick a yes/no decision you make (should I take an umbrella?). List three inputs and give each an importance from -3 to +3. Add them up for today. Does your 'neuron' agree with what you'd actually do?"
},

{
  id: 'l0-04', title: 'Generative AI: making new things', hook: 'Why did AI go from sorting your photos to writing your emails?',
  minutes: 11, skills: ['l0.generative-ai'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "The AI you've met so far mostly *judges*: this is spam, this is a dog, this customer will leave. A newer kind *makes* things. It writes a paragraph, draws a picture, or composes a tune. That's **generative AI**." },
    { t: 'widget', w: 'sorter', props: {
        title: 'Judging or making?',
        buckets: ['Judges / sorts / scores', 'Generates something new'],
        skill: 'l0.generative-ai',
        items: [
          { text: 'A tool that labels each email as spam or not spam', bucket: 'Judges / sorts / scores', why: 'It outputs a label for something that already exists.' },
          { text: 'A tool that writes a reply to an email', bucket: 'Generates something new', why: 'It produces new text that did not exist before.' },
          { text: 'A system that rates how likely a loan is to be repaid', bucket: 'Judges / sorts / scores', why: 'The output is a score about an existing case.' },
          { text: 'A tool that produces a picture from a written description', bucket: 'Generates something new', why: 'It creates a new image.' },
          { text: 'A photo app grouping pictures by person', bucket: 'Judges / sorts / scores', why: 'It sorts existing photos into groups.' },
          { text: 'A tool that continues a story you started', bucket: 'Generates something new', why: 'It adds new text, one piece after another.' }
        ]
      }, caption: 'Select an item, then choose its box (press the “Put in” button). When all are placed, press Check.' },
    { t: 'h', text: 'How can a machine “make” anything?' },
    { t: 'p', md: "Here's the trick, and it's a lovely one. A generative model is trained on a huge number of examples of the thing it will make, and what it learns is the *pattern*: what typically goes with what. To make something new, it uses that pattern to produce one more plausible piece, then another, then another." },
    { t: 'callout', kind: 'analogy', title: 'The very well-read improviser', md: "Imagine someone who has read an enormous library and can now continue any sentence you start in a fluent, fitting way. They're not recalling a page; they're drawing on a feel for how such text goes. That's close to what a text model does. The weak point of the analogy: the improviser knows when they're making something up. The model has no such sense." },
    { t: 'predict', q: "A text-generating model writes you a short poem about your cat. Where does that poem come from?", options: ["It's a poem someone else wrote, retrieved from a database.", "It's assembled new, piece by piece, following patterns learned from lots of text.", "It's copied from the last person who asked something similar."], answer: 1, explain: "Generation builds new output from learned patterns. It can sometimes reproduce memorised phrases, especially famous or often-repeated ones, but it is not looking things up in a database of finished poems.", skill: 'l0.generative-ai' },
    { t: 'callout', kind: 'misconception', title: 'Myth: “AI just copies and pastes from the internet”', md: "Mostly no: it generates by learning patterns, not by storing and retrieving whole documents. But it isn't magic originality either. It can echo memorised text, reflect the style of its data, and produce things that merely *resemble* what it saw. Both “it's pure copying” and “it's pure creativity” are wrong." },
    { t: 'h', text: 'Many media, one idea' },
    { t: 'p', md: "Text is the most familiar, but the same idea (learn the pattern, then produce something that fits it) applies to images, audio, video and code. Different systems use different technical methods, but each learns from many examples and then produces new output that resembles them." },
    { t: 'try', prompt: "Write one thing generative AI is likely to be good at and one thing that could go wrong, based on the ‘well-read improviser’ idea.", sample: "Good at: drafting, rephrasing and brainstorming, because fluent plausible text is exactly what it makes. Could go wrong: it may produce something that sounds right but is false, because it is producing what fits the pattern, not checking facts. We unpack that properly in lesson 9." }
  ],
  reteach: [
    { style: 'analogy', md: "A judging AI is like a bouncer at a door: it looks at each person and says in or out. A generative AI is like a ghostwriter: it produces new pages. Both learned from examples, but one outputs a verdict and the other outputs content." },
    { style: 'simple', md: "Some AI answers questions about things that exist (is this spam?). Generative AI creates new things (write this email). It does it by learning the patterns in huge amounts of existing material and then producing something new that fits those patterns." },
    { style: 'technical', md: "Discriminative models learn p(label | input); generative models learn the distribution of the data itself (or conditional distributions like p(next token | previous tokens)), so they can be sampled to produce new examples. Text models are autoregressive: sample one token, append it, repeat." }
  ],
  takeaways: ["Generative AI makes new content; other AI mostly sorts, labels or scores.", "It learns patterns from examples, then produces new output that fits them.", "It is neither a copy-paste machine nor a human-style creator.", "Fluent output is not the same as correct output."],
  apply: "Next time you see an AI-made image or paragraph, ask: what pattern did it learn, and what might it have got subtly wrong that looks plausible?"
},

{
  id: 'l0-05', title: 'Large language models: predicting what comes next', hook: 'A chat assistant can seem to understand you. Here is the surprisingly simple trick underneath.',
  minutes: 12, skills: ['l0.next-token'], core: true, code: false, deep: false,
  blocks: [
    { t: 'p', md: "A **large language model (LLM)** is a very large neural network trained on a huge amount of text. All the chat assistants you may have met are built on one. Its entire job is this: **given the text so far, predict what comes next.** (It works in small pieces of text called **tokens**, usually a word or part of one. The next lesson looks at them closely.)" },
    { t: 'p', md: "That's it. Answering questions, summarising, translating and coding all come from doing that one thing extraordinarily well. Watch it happen first." },
    { t: 'widget', w: 'nextword', props: { scenario: 'sky' }, caption: 'Try this: the bars show how likely each possible next piece is. Press “Sample 10 continuations” and see whether you get the same one every time.' },
    { t: 'predict', q: "The most likely piece has the tallest bar. If you ask for ten continuations of the same prompt, what will happen?", options: ["The identical answer every time, because the top choice is always used.", "Usually the likely one, but sometimes others, so answers can vary.", "A random word from the dictionary each time."], answer: 1, explain: "By default a model picks according to the probabilities rather than always taking the top choice, so likely options come up often and unlikely ones occasionally. That is why the same question can get differently worded answers.", skill: 'l0.next-token' },
    { t: 'h', text: 'Writing is predicting, over and over' },
    { t: 'steps', items: [
      { title: 'Read', md: "The model takes all the text so far: your question and any earlier conversation." },
      { title: 'Score', md: "It gives every possible next piece a probability. After “The sky is”, “blue” scores high and “sandwich” scores tiny." },
      { title: 'Pick', md: "One piece is chosen according to those probabilities." },
      { title: 'Append and repeat', md: "That piece is added to the text and the process runs again, until the answer is complete. A long answer is hundreds of these picks in a row." }
    ] },
    { t: 'p', md: "**Temperature** is the dial for how adventurous the pick is. Low: the model nearly always takes the most likely piece, which is steady and repetitive. High: less likely pieces get a real chance, which means more variety and more risk of nonsense. Scroll back up, slide the temperature in the widget, and sample again." },
    { t: 'callout', kind: 'misconception', title: 'Myth: “It looks things up”', md: "A language model on its own does not search anything. Its answer is generated from patterns baked into its numbers during training. Some products add a separate search step in front of the model, and that does change things, but it is an added tool, not what the model is." },
    { t: 'callout', kind: 'misconception', title: 'Myth: “It understands like we do”', md: "It is remarkably good at producing text that fits, which often requires capturing real structure in language and the world. Whether that is ‘understanding’ is genuinely debated. The safe working view: it predicts plausible continuations; it doesn't check them against reality or know when it is wrong." },
    { t: 'try', prompt: "Explain to an imaginary friend, in three sentences, how a chat assistant produces a long answer. Use the words ‘predict’ and ‘next’.", sample: "A chat assistant reads everything so far and predicts a probability for each possible next piece of text. It picks one, adds it to the text, and repeats, so a whole answer is built one piece at a time. It picks among likely options rather than always the top one, which is why wording can differ each time." }
  ],
  reteach: [
    { style: 'analogy', md: "Think of your phone's predictive text, but trained on a vast library and able to look at a whole conversation, not just the last word. If you kept tapping the middle suggestion, you'd get a sentence. A chat model does the same, with a far better sense of what fits and a dial (temperature) for how often it picks the second or third suggestion." },
    { style: 'simple', md: "The model is a next-piece-of-text predictor. It gives each possible next piece a probability, picks one, adds it, and repeats. Answers are built this way, piece by piece. Because there is some randomness in the pick, you can get different answers to the same question." },
    { style: 'technical', md: "The model outputs logits over its vocabulary; softmax(logits / T) gives probabilities. Lower T sharpens the distribution toward the argmax; higher T flattens it. Sampling strategies such as top-k and top-p truncate the tail before sampling. Generation is autoregressive: each sampled token is appended to the context and the forward pass is repeated." }
  ],
  takeaways: ["An LLM is trained to predict the next token given the text so far.", "Answers are built by repeating that prediction, one token at a time.", "Picks are sampled from probabilities, so wording varies; temperature changes how adventurous the pick is.", "It generates plausible text rather than looking facts up or checking them."],
  apply: "Ask any assistant the same question three times. Compare the answers. What stayed the same (likely high-probability content) and what changed (wording)?"
}
];
