// Level 5 lessons 04-06: attention, transformer, pretraining + data quality
export const lessons = [
{
  id:'l5-04', title:'Attention from first principles', hook:'Attention is a soft, learned lookup: each token asks a question, every token offers a key and a value, and the answer is a weighted blend.',
  minutes:22, skills:['l5.attention'], core:true, code:true, deep:false,
  blocks:[
    {t:'p', md:"A sentence like 'The trophy would not fit in the suitcase because **it** was too big' needs the model to decide what 'it' refers to. Reading every earlier word with equal weight would blur everything together. **Attention** lets each position decide how much to read from each other position."},
    {t:'h', text:'Step 1: similarity by dot product'},
    {t:'p', md:"Recall the **dot product** of two vectors: multiply matching components and add. It is large and positive when the vectors point the same way, near zero when they are perpendicular, negative when opposed. Attention uses it as a relevance score."},
    {t:'widget', w:'dotproduct', props:{}, caption:'Try this: drag the two arrows to make the dot product zero, then negative. Then use the mini attention calculation below the arrows.', skill:'l5.attention'},
    {t:'h', text:'Step 2: queries, keys and values'},
    {t:'p', md:"Each token's vector is multiplied by three learned matrices to make three different vectors. The **query** (q) says what this position is looking for. The **key** (k) says what this position offers to be matched on. The **value** (v) is the content that gets passed along if it is chosen. Splitting key from value matters: the thing you match on need not be the thing you retrieve."},
    {t:'steps', items:[
      {title:'Score', md:"For one query, compute its dot product with every key: `score_i = q . k_i`."},
      {title:'Scale', md:"Divide each score by `sqrt(d)`, where `d` is the key dimension."},
      {title:'Softmax', md:"Turn scores into weights that are positive and sum to 1: `w_i = exp(s_i) / sum_j exp(s_j)`."},
      {title:'Blend', md:"Output = `sum_i w_i * v_i`, the weighted average of the values."}
    ]},
    {t:'p', md:"In one line: `Attention(Q, K, V) = softmax(Q K^T / sqrt(d)) V`. This is the scaled dot-product attention from the paper [Attention Is All You Need](https://arxiv.org/abs/1706.03762) (Vaswani et al., 2017)."},
    {t:'callout', kind:'why', title:'Why divide by the square root of d?', md:"If query and key components are roughly independent with variance 1, the dot product of two d-dimensional vectors has variance about d, so scores grow with dimension. Large scores push softmax towards a near one-hot output where gradients are tiny, which makes training hard. Dividing by sqrt(d) keeps the scores at a stable scale."},
    {t:'predict', q:"A query has equal dot product with three keys. What are the attention weights?", options:['All zero','1/3 each','1, 0, 0','They depend on the values'], answer:1, explain:"Softmax of equal scores gives equal weights, 1/3 each, and the output is the plain average of the three values. The values only affect what is blended, not how much weight each gets.", skill:'l5.attention'},
    {t:'widget', w:'attention', props:{sentence:'it'}, caption:'Try this: pick a word and compare heads. These weights are hand-authored toy values to show the idea; a real model learns them and they are rarely this tidy.'},
    {t:'h', text:'Heads, masks and cost'},
    {t:'list', items:["**Multi-head**: run several attention operations in parallel with different learned projections, then concatenate the results. Different heads can specialise, though not every head has a neat human-readable role.","**Causal mask**: in a decoder generating text, position i may only attend to positions up to i. Future scores are set to minus infinity before softmax so their weight becomes zero. Without it the model could cheat by reading the answer.","**Cost**: every position scores against every other, so the score matrix has n x n entries. Doubling the context length roughly quadruples that part of the work and memory, which is why long context is expensive and why efficient-attention methods are an active research area."]},
    {t:'callout', kind:'misconception', title:'"Attention weights explain the model"', md:"It is tempting to read a heat map of weights as the model's reasoning. Research has shown attention weights are not a reliable explanation of why a model produced an output: later layers, the MLPs and the values all matter. Treat them as one partial view."},
    {t:'widget', w:'codeplay', props:{title:'Softmax and attention for tiny vectors', fnName:'softmax', starter:`function softmax(xs) {
  // return probabilities rounded to 4 d.p.
  // hint: subtract the max first for stability
}`, tests:[{args:[[0,0]],expect:[0.5,0.5]},{args:[[1,2,3]],expect:[0.09,0.2447,0.6652]},{args:[[1000,1000]],expect:[0.5,0.5]}], hints:['exp(x - max) avoids overflow for big scores.']}}
  ],
  reteach:[
    {style:'analogy', md:"Think of a library with a card catalogue. Your query is the topic on your slip of paper. Each book has a catalogue card (its key) and the book itself (its value). You compare your slip with every card, decide how relevant each book is, then read a blend of the books in proportion to relevance. Softmax is the step that turns 'how relevant' into 'what fraction of my attention'."},
    {style:'step-by-step', md:"Concrete numbers: q = [1, 0]; keys [1, 0] and [0, 1]; values [10, 0] and [0, 10]. Scores = 1 and 0. Divide by sqrt(2): 0.707 and 0. Softmax gives weights about 0.67 and 0.33. Output = 0.67*[10, 0] + 0.33*[0, 10] = about [6.7, 3.3]. The first key matched the query better, so its value dominates."}
  ],
  quiz:[
    {id:'l5-04-q1', skill:'l5.attention', type:'mcq', difficulty:2, q:"Why is the dot product divided by sqrt(d) before softmax?", options:['To keep scores from growing with dimension and saturating the softmax','To make the output a probability','To remove the need for keys','To make the computation run on a GPU'], answer:0, wrong:{'1':'Softmax, not the scaling, produces the probabilities.'}, hints:['How does the variance of a dot product depend on the number of components?'], explain:"Dot products of d-dimensional vectors tend to grow with d, which makes softmax nearly one-hot with vanishing gradients. Scaling counteracts that. The probability normalisation is softmax's job."},
    {id:'l5-04-q2', skill:'l5.attention', type:'code', difficulty:2, q:"Write softmax(xs) returning an array of probabilities, each rounded to 4 decimal places. It must not overflow for large inputs such as [1000, 1000]. Return [] for an empty array.", fnName:'softmax', starter:`function softmax(xs) {
  // your code
}`, tests:[{args:[[0,0]],expect:[0.5,0.5]},{args:[[1,2,3]],expect:[0.09,0.2447,0.6652]},{args:[[1000,1000]],expect:[0.5,0.5]},{args:[[]],expect:[]}], hints:['Subtract the maximum from every element before exponentiating.','Divide each exponential by the sum of exponentials.'], solution:`function softmax(xs) {
  if (xs.length === 0) return [];
  const m = Math.max(...xs);
  const e = xs.map((x) => Math.exp(x - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => Math.round((v / s) * 10000) / 10000);
}`, explain:"Softmax is unchanged if you subtract the same constant from every input, so subtracting the max keeps exp() from overflowing. Without it, exp(1000) is Infinity and you get NaN."},
    {id:'l5-04-q3', skill:'l5.attention', type:'code', difficulty:3, q:"Write attend(q, keys, values): scaled dot-product attention for ONE query. Scores are dot(q, key)/sqrt(len(q)); weights = softmax of scores; return the weighted sum of the value vectors, each component rounded to 4 decimal places.", fnName:'attend', starter:`function attend(q, keys, values) {
  // your code
}`, tests:[{args:[[1,0],[[1,0],[0,1]],[[10,0],[0,10]]],expect:[6.6976,3.3024]},{args:[[1,1],[[1,1],[1,1]],[[2,0],[4,6]]],expect:[3,3]},{args:[[1,0],[[5,0]],[[7,8]]],expect:[7,8]},{args:[[2,0],[[2,0],[0,2],[-2,0]],[[1,0],[0,1],[1,1]]],expect:[0.9444,0.0589]}], hints:['First build the scores array, then softmax it (subtract the max).','Then for each output component j sum weights[i]*values[i][j].'], solution:`function attend(q, keys, values) {
  const d = q.length;
  const scores = keys.map((k) => k.reduce((a, x, i) => a + x * q[i], 0) / Math.sqrt(d));
  const m = Math.max(...scores);
  const e = scores.map((s) => Math.exp(s - m));
  const z = e.reduce((a, b) => a + b, 0);
  const w = e.map((v) => v / z);
  const out = new Array(values[0].length).fill(0);
  w.forEach((wi, i) => values[i].forEach((v, j) => { out[j] += wi * v; }));
  return out.map((v) => Math.round(v * 10000) / 10000);
}`, explain:"Equal keys give equal weights, hence the plain average [3,3]. With a single key the weight is 1 so you get that key's value back. Do not round the weights before blending, only the final output."},
    {id:'l5-04-q4', skill:'l5.attention', type:'mcq', difficulty:2, q:"What does the causal mask do in a decoder-only language model?", options:['It stops each position attending to later positions so it cannot see the tokens it must predict','It hides padding tokens from the loss','It randomly drops attention heads','It removes the softmax'], answer:0, hints:['What would happen in training if token 5 could read token 6?'], explain:"Training predicts every next token in parallel, so each position must be blocked from reading the future; otherwise it would simply copy the answer. Padding masks are a different mechanism."},
    {id:'l5-04-q5', skill:'l5.attention', type:'mcq', difficulty:3, q:"You double the context length from 8k to 16k tokens. Roughly what happens to the size of the attention score matrix for one head?", options:['It doubles','It quadruples','It stays the same','It grows by 8k entries'], answer:1, hints:['Scores are token-by-token.'], explain:"The matrix is n x n, so doubling n gives 4x entries. Option 1 treats the cost as linear in length, which holds for most other parts of the model but not the scores."},
    {id:'l5-04-q6', skill:'l5.attention', type:'multi', difficulty:2, q:"Select all that are true of scaled dot-product attention.", options:['Weights are non-negative and sum to 1 for each query','The output is a weighted average of value vectors','Keys and values must be identical vectors','The softmax is applied across the keys for a given query'], answer:[0,1,3], hints:['Remember what the query, key and value each do.'], explain:"Softmax across keys gives weights summing to 1 and the output blends values. Keys and values are produced by separate learned projections, so they need not be equal."}
  ],
  takeaways:['Attention scores a query against all keys, softmaxes, and blends the values.','Scaling by sqrt(d) keeps the softmax from saturating.','A causal mask stops a decoder reading future tokens.','Cost grows with the square of sequence length.','Attention weights are an incomplete explanation of model behaviour.'],
  apply:'Take the worked numbers in the re-teach panel and change one key so it matches the query more strongly. Predict, then check, how the weights move.'
},
{
  id:'l5-05', title:'The transformer', hook:'A transformer is one repeated block, attention then a small neural net with shortcuts around each, stacked dozens of times.',
  minutes:20, skills:['l5.transformer'], core:true, code:true, deep:false,
  blocks:[
    {t:'p', md:"You now have the ingredients. The **transformer** (Vaswani et al., 2017) arranges them into a block that is repeated many times. Most large language models today are **decoder-only** transformers: they read the tokens so far and predict the next one."},
    {t:'widget', w:'flow', props:{title:'One decoder-only transformer, step by step', height:520,
      nodes:[
        {id:'tok', label:'Token ids', x:50, y:4, kind:'input', note:'Text is split into tokens and mapped to integer ids.'},
        {id:'emb', label:'Embedding + position', x:50, y:17, kind:'process', note:'Each id is looked up in the embedding table; positional information is added or applied inside attention (see below).'},
        {id:'n1', label:'Normalise', x:50, y:30, kind:'process', note:'Layer normalisation (or a variant such as RMSNorm) keeps activations on a stable scale.'},
        {id:'att', label:'Masked self-attention', x:50, y:42, kind:'model', note:'Each position reads from earlier positions. This is the only place tokens exchange information.'},
        {id:'add1', label:'Add (residual)', x:82, y:46, kind:'process', note:'The block input is added back to the attention output: x + Attention(x).'},
        {id:'n2', label:'Normalise', x:50, y:56, kind:'process', note:'Second normalisation before the feed-forward network.'},
        {id:'mlp', label:'MLP (feed-forward)', x:50, y:68, kind:'model', note:'A two-layer network applied to each position separately. It holds a large share of the parameters.'},
        {id:'add2', label:'Add (residual)', x:82, y:72, kind:'process', note:'Again x + MLP(x). Blocks 2 to N repeat these steps.'},
        {id:'out', label:'Final norm + unembedding', x:50, y:82, kind:'process', note:'Projects each vector to one score (logit) per vocabulary token.'},
        {id:'sm', label:'Softmax: next-token probabilities', x:50, y:94, kind:'output', note:'Probabilities over the vocabulary for the next token.'}
      ],
      edges:[['tok','emb'],['emb','n1'],['n1','att'],['att','add1'],['emb','add1','shortcut'],['add1','n2'],['n2','mlp'],['mlp','add2'],['add1','add2','shortcut'],['add2','out','after N blocks'],['out','sm']],
      steps:[
        {show:['tok','emb'], text:'Tokens become vectors, and the model is told where each token sits in the sequence.'},
        {show:['n1','att','add1'], text:'Attention mixes information across positions. The shortcut adds the original vector back.'},
        {show:['n2','mlp','add2'], text:'The MLP transforms each position on its own, again with a shortcut.'},
        {show:['out','sm'], text:'After all blocks, the last position\'s vector is turned into probabilities for the next token.'}
      ]}, caption:'Try this: press Next to walk through one pass, then click a box to read its note. Drag boxes to rearrange.'},
    {t:'h', text:'Residual connections'},
    {t:'p', md:"Each sub-layer is wrapped as `x + Layer(x)`. The block only has to learn a *change* to the representation, and gradients have a direct path back through the additions, which is a main reason very deep stacks can be trained. A useful picture: a **residual stream** runs up through the model and every attention and MLP layer reads from it and writes small updates into it."},
    {t:'h', text:'Positional information'},
    {t:'p', md:"Attention on its own treats its inputs as a set: shuffle the tokens and, apart from the result being shuffled the same way, nothing changes. 'Dog bites man' and 'man bites dog' would look alike. So order must be supplied. The original paper added fixed sinusoidal position vectors. Other approaches learn position embeddings, or (in many recent models) rotate the query and key vectors by a position-dependent angle (**rotary** position embeddings), so that the attention score depends on relative distance. Which is used affects how well a model handles contexts longer than it was trained on."},
    {t:'predict', q:"If you removed all positional information from a causal (masked) decoder-only transformer, which statement is closest to the truth?", options:['It would work exactly as before','It could not tell word order directly, though the causal mask leaks a weak signal of how many tokens came before','It would no longer be able to use attention','It would only fail on non-English text'], answer:1, explain:"Without position signals, attention scores depend only on content. The causal mask does let a position implicitly count how many tokens it can see, so models can sometimes recover some order, but this is weak compared with explicit position information.", skill:'l5.transformer'},
    {t:'h', text:'Where the parameters live and what compute costs'},
    {t:'p', md:"With model width `d`, one attention layer has four `d x d` matrices (query, key, value, output): about `4d^2` parameters. The MLP usually expands to `4d` and back: about `8d^2`. So one block is roughly `12 d^2`, and a model with `L` blocks and vocabulary `V` has about `12 L d^2 + V d` parameters. This is an approximation: gated MLPs, grouped-query attention and tied embeddings change the constants, but the scaling is right. For a model with 96 layers and `d = 12288` it gives roughly 175 billion, which matches the published size of GPT-3."},
    {t:'p', md:"A useful compute rule of thumb: running the model forward costs about `2N` floating-point operations per token for `N` parameters (one multiply and one add per weight), ignoring the attention-score terms. Training costs about `6N` per token, because the backward pass costs roughly twice the forward pass."},
    {t:'callout', kind:'misconception', title:'"The transformer is one big attention layer"', md:"A large share of the parameters, often around two-thirds in the standard layout, sit in the MLPs, not the attention. Attention moves information between positions; the MLP does heavy per-position computation and is often described as where much factual association is stored, though how knowledge is stored is still an active research question."},
    {t:'try', prompt:"Using 12*L*d^2 + V*d, estimate the parameters for L = 32, d = 4096, V = 32000. Is the embedding table a large part of the total?", sample:"12 * 32 * 4096^2 = 12 * 32 * 16,777,216 = about 6.44 billion, plus 32000 * 4096 = 131 million, total about 6.57 billion. The embedding table is around 2% of the total: small at this scale, though it can be a large fraction for tiny models."}
  ],
  reteach:[
    {style:'analogy', md:"Picture a document passed round a committee. Each round has two stages: first a discussion where members read each other's notes (attention), then each member privately thinks and revises their own note (MLP). The original note is never thrown away: each stage only adds an annotation (residual). After many rounds the last member's note is used to guess the next word."},
    {style:'technical', md:"For hidden state x (n positions by d): x1 = x + Attn(Norm(x)) with a causal mask; x2 = x1 + MLP(Norm(x1)). Repeat for L layers. Logits = Norm(x_L) W_unembed, a V-way score for each position; softmax gives next-token probabilities. Training sums the cross-entropy at every position in parallel because the mask hides the future."}
  ],
  quiz:[
    {id:'l5-05-q1', skill:'l5.transformer', type:'mcq', difficulty:1, q:"What is the main benefit of residual (shortcut) connections?", options:['Each layer only needs to learn a change, and gradients have a direct path through deep stacks','They reduce the number of parameters','They replace attention','They make the vocabulary smaller'], answer:0, hints:['Think about x + Layer(x).'], explain:"The additive path lets gradients flow backwards and makes layers learn refinements. They do not reduce parameters."},
    {id:'l5-05-q2', skill:'l5.transformer', type:'mcq', difficulty:2, q:"Why does a transformer need positional information at all?", options:['Attention by itself does not know token order; without positions, word order is lost','Tokens would otherwise be too long','The softmax needs positive numbers','The embedding table is too small'], answer:0, hints:['Does the attention formula use position anywhere?'], explain:"Scores come from content only, so shuffling inputs gives a correspondingly shuffled output. Position signals are what let the model distinguish 'dog bites man' from 'man bites dog'."},
    {id:'l5-05-q3', skill:'l5.transformer', type:'code', difficulty:3, q:"Write approxParams(layers, dModel, vocab) using the approximation 12*layers*dModel^2 + vocab*dModel and return the number as an integer.", fnName:'approxParams', starter:`function approxParams(layers, dModel, vocab) {
  // your code
}`, tests:[{args:[12,768,50257],expect:123532032},{args:[32,4096,32000],expect:6573522944},{args:[0,512,1000],expect:512000}], hints:['Block parameters: 12 * L * d * d.','Add the embedding table, vocab * d.'], solution:`function approxParams(layers, dModel, vocab) {
  return 12 * layers * dModel * dModel + vocab * dModel;
}`, explain:"12 x 12 x 768^2 = 84,934,656 plus 50,257 x 768 = 38,597,376 gives 123,532,032, close to the published size of the smallest GPT-2 (about 124M). With zero layers only the embedding table remains."},
    {id:'l5-05-q4', skill:'l5.transformer', type:'multi', difficulty:2, q:"Select all that describe a decoder-only transformer language model.", options:['It is trained to predict the next token at every position','It uses a causal mask so positions cannot see the future','It must have a separate encoder stack to read the prompt','The prompt and the generated text are processed by the same stack'], answer:[0,1,3], hints:['Where does the prompt go?'], explain:"Decoder-only models treat the prompt as the earlier part of the sequence and continue it with the same stack. A separate encoder belongs to encoder-decoder designs."},
    {id:'l5-05-q5', skill:'l5.transformer', type:'mcq', difficulty:2, q:"A dense model has 7 billion parameters. Roughly how many floating-point operations does generating ONE token's forward pass take (ignoring attention-score terms)?", options:['About 14 billion (2N)','About 7 billion','About 42 billion','About 49 billion'], answer:0, wrong:{'2':'6N is the training cost per token, including the backward pass.'}, hints:['Each weight is used for one multiply and one add.'], explain:"Forward is about 2 FLOPs per parameter per token: 14 billion. The 6N figure is for training, which adds a backward pass costing about twice the forward."}
  ],
  takeaways:['A block is attention then MLP, each with normalisation and a residual shortcut.','Positions must be injected because attention itself ignores order.','Decoder-only models are causally masked next-token predictors.','Parameters per block are roughly 12 d^2; the MLP holds most of them.','Forward cost is about 2N FLOPs per token; training about 6N.'],
  apply:'Look up the layer count and hidden size of any open model (its config file lists them) and check the 12*L*d^2 estimate against its stated parameter count. Note the gap and what might explain it.'
},
{
  id:'l5-06', title:'Training a large language model', hook:'Pretraining is next-token prediction at enormous scale, and the quality of the data matters at least as much as the amount.',
  minutes:24, skills:['l5.pretraining','l5.data-quality'], core:true, code:true, deep:false,
  blocks:[
    {t:'p', md:"A base language model is built in a stage called **pretraining**. The objective is simple: given the tokens so far, predict the next one. The loss is the cross-entropy you met in lesson 1, averaged over every position in a huge amount of text. No human labels are needed because the text itself supplies the answers, which is what makes it possible to use web-scale data."},
    {t:'widget', w:'flow', props:{title:'A pretraining pipeline', height:420,
      nodes:[
        {id:'raw', label:'Raw text sources', x:10, y:12, kind:'store', note:'Web pages, books, code, papers and other text. What is included, and with what legal basis, is a major design and policy decision.'},
        {id:'clean', label:'Filter + clean', x:10, y:40, kind:'process', note:'Remove boilerplate, low-quality or unsafe text, personal data where possible, and unwanted languages.'},
        {id:'dedupe', label:'Deduplicate', x:10, y:68, kind:'process', note:'Remove exact and near-duplicate documents; duplication wastes compute and increases memorisation.'},
        {id:'tok', label:'Tokenise + pack', x:40, y:78, kind:'process', note:'Convert to token ids and pack into fixed-length sequences.'},
        {id:'model', label:'Model forward pass', x:70, y:60, kind:'model', note:'Predict the next-token distribution at every position.'},
        {id:'loss', label:'Cross-entropy loss', x:70, y:30, kind:'process', note:'Compare predictions with the true next tokens.'},
        {id:'upd', label:'Backprop + optimiser step', x:40, y:15, kind:'process', note:'Compute gradients and update billions of weights, in parallel across many accelerators.'}
      ],
      edges:[['raw','clean'],['clean','dedupe'],['dedupe','tok'],['tok','model'],['model','loss'],['loss','upd'],['upd','model','new weights']],
      steps:[
        {show:['raw','clean','dedupe'], text:'Data work happens before a single gradient step, and decides much of what the model can learn.'},
        {show:['tok','model','loss'], text:'Batches of token sequences run through the model; the loss is next-token cross-entropy.'},
        {show:['upd','model'], text:'Gradients update the weights. The loop repeats for hundreds of thousands of steps.'}
      ]}, caption:'Try this: step through, then click each box to read the note.'},
    {t:'h', text:'Reading the loss'},
    {t:'p', md:"The training loss is the average of `-ln(p)` for the correct next token. **Perplexity** is `exp(loss)`: informally, the number of equally likely choices the model is hesitating between. A loss of 2.0 corresponds to a perplexity near 7.4. Lower loss on held-out text means a better predictor of text, but it is not the same as being more helpful, honest or safe."},
    {t:'h', text:'Scaling: what the research says'},
    {t:'p', md:"Empirically, test loss falls smoothly, roughly as a power law, as you increase parameters, data and compute together (Kaplan et al., 2020). [Hoffmann et al. (2022)](https://arxiv.org/abs/2203.15556), the 'Chinchilla' study, found that for a fixed compute budget, earlier large models were under-trained: parameters and training tokens should grow in roughly equal proportion, which is often summarised as around 20 training tokens per parameter. Treat that number as a rule of thumb from one set of experiments, not a law."},
    {t:'p', md:"Two caveats keep this honest. First, many modern models are deliberately trained on far more tokens than that ratio, because a smaller model trained longer is cheaper to run for the rest of its life. Second, whether abilities appear suddenly at scale ('emergence') or only look sudden because of the metric used is debated in the research literature."},
    {t:'p', md:"Compute: training costs about `6 * N * D` floating-point operations for `N` parameters and `D` tokens. Divide by the achieved throughput (accelerators x peak FLOP/s x utilisation, where real utilisation is well below 100%) to estimate time."},
    {t:'predict', q:"You double the number of training tokens for a fixed 7B-parameter model. What happens to the training compute?", options:['It stays the same','It roughly doubles','It roughly quadruples','It halves'], answer:1, explain:"Compute is about 6*N*D, so with N fixed it is linear in D. Doubling the data doubles the FLOPs. Quadrupling would be the cost if you doubled both N and D.", skill:'l5.pretraining'},
    {t:'h', text:'What "training data quality" actually means'},
    {t:'p', md:"'Quality' is not one property. It is fitness for the model's intended behaviour, and it has several concrete dimensions:"},
    {t:'list', items:["**Correctness and signal**: text that is accurate, coherent and informative, rather than spam, machine-generated filler or boilerplate.","**Diversity and coverage**: enough variety in topic, language, style and domain for the uses you care about; gaps become blind spots.","**Duplication**: repeated documents are over-weighted and raise the chance of verbatim memorisation. Deduplicating is a standard step.","**Contamination**: evaluation questions or answers appearing in training data make benchmark scores optimistic.","**Privacy, licence and safety**: personal data, copyrighted or restricted material and harmful content create legal and ethical obligations.","**Label and annotation quality** (for fine-tuning data): inconsistent or wrong labels are learned faithfully."]},
    {t:'callout', kind:'misconception', title:'"More data is always better"', md:"Scale helps when the data is useful. Carefully filtered smaller datasets have been reported to match or beat larger unfiltered ones in several studies, and noisy or duplicated data wastes compute. The right question is 'more of what?' rather than 'more?'."},
    {t:'callout', kind:'warn', title:'Responsible use', md:"Pretraining sets raise open questions about consent, copyright and personal data. When you pick or train a model, ask what is known about its data, and do not assume absence of documentation means absence of problems."},
    {t:'try', prompt:"You are fine-tuning a customer-support model on 20,000 past chat transcripts. List four data-quality checks you would run before training and why each matters.", sample:"1. Deduplicate near-identical transcripts so common phrases are not over-weighted. 2. Remove or mask personal data (names, card numbers). 3. Check agent replies for wrong or non-compliant advice, since the model will imitate them faithfully. 4. Hold out a test set by time or customer before training, so evaluation is not contaminated. Also check coverage: if refund disputes are 1% of the data, expect weak refund behaviour."}
  ],
  reteach:[
    {style:'analogy', md:"Pretraining is like learning to read by guessing the next word in billions of sentences. You never get told 'this is grammar' or 'this is geography', but to guess well you have to pick up both. And as with a student, the quality of the books matters: a library full of copies of the same few pages, or of errors, produces a worse reader than a smaller, varied, accurate library."},
    {style:'step-by-step', md:"1. Collect and clean text. 2. Remove duplicates. 3. Convert to token ids. 4. Feed sequences in; at each position the model outputs probabilities for the next token. 5. Compute the average -ln(probability of the true token). 6. Backprop and update. 7. Repeat. Compute needed is about 6 x parameters x tokens."}
  ],
  quiz:[
    {id:'l5-06-q1', skill:'l5.pretraining', type:'mcq', difficulty:1, q:"What is the standard objective for pretraining a decoder-only language model?", options:['Predict the next token given the preceding tokens','Classify each document into a topic','Maximise human ratings of answers','Translate text between languages'], answer:0, hints:['No human labelling is needed.'], explain:"Next-token prediction uses the text itself as the label. Human ratings enter later (preference tuning)."},
    {id:'l5-06-q2', skill:'l5.pretraining', type:'code', difficulty:3, q:"Write trainingDays(params, tokens, gpus, flopsPerGpu, utilisation): estimate training time in days using total FLOPs = 6*params*tokens and throughput = gpus*flopsPerGpu*utilisation (FLOP/s). Round to 2 decimal places.", fnName:'trainingDays', starter:`function trainingDays(params, tokens, gpus, flopsPerGpu, utilisation) {
  // your code
}`, tests:[{args:[1e9,2e10,8,1e14,0.4],expect:4.34},{args:[7e9,1.4e11,64,3e14,0.5],expect:7.09},{args:[0,1e9,8,1e14,0.4],expect:0}], hints:['Total FLOPs divided by FLOP/s gives seconds.','Divide seconds by 86400 for days.'], solution:`function trainingDays(params, tokens, gpus, flopsPerGpu, utilisation) {
  const flops = 6 * params * tokens;
  const seconds = flops / (gpus * flopsPerGpu * utilisation);
  return Math.round((seconds / 86400) * 100) / 100;
}`, explain:"For the first case 6*1e9*2e10 = 1.2e20 FLOPs at 3.2e14 FLOP/s is 375,000 s, about 4.34 days. Real runs also lose time to restarts and failures, so treat this as a lower bound. The hardware numbers here are made up for the exercise."},
    {id:'l5-06-q3', skill:'l5.pretraining', type:'mcq', difficulty:2, q:"A model's average cross-entropy on held-out text is 2.0 nats. About what perplexity is that?", options:['2','About 4','About 7.4','About 20'], answer:2, hints:['Perplexity = e^loss.','e^2 is about 7.39.'], explain:"exp(2.0) is about 7.39. Perplexity of 2 would correspond to a loss of ln 2 = 0.69."},
    {id:'l5-06-q4', skill:'l5.data-quality', type:'mcq', difficulty:2, q:"A model scores very highly on a public benchmark, but performs poorly on your own new questions of the same type. Which data issue should you suspect first?", options:['Benchmark contamination: the benchmark items may have been in the training data','The tokeniser is too small','The model is too deep','The learning rate was too low'], answer:0, hints:['Where might the benchmark text have come from?'], explain:"If test questions leaked into training data, the score measures memorisation. Fresh private items expose this. The other options would not specifically inflate public scores."},
    {id:'l5-06-q5', skill:'l5.data-quality', type:'code', difficulty:2, q:"Write dedupe(texts): remove exact duplicates after normalising (trim, collapse runs of whitespace to one space, lowercase). Keep the FIRST original text of each group, in original order.", fnName:'dedupe', starter:`function dedupe(texts) {
  // your code
}`, tests:[{args:[['Hello  world','hello world','Bye']],expect:['Hello  world','Bye']},{args:[[' a ','A','b','a']],expect:[' a ','b']},{args:[[]],expect:[]}], hints:['Build a normalised key for each text.','Keep a Set of keys already seen.'], solution:`function dedupe(texts) {
  const seen = new Set();
  const out = [];
  for (const t of texts) {
    const key = t.trim().replace(/\\s+/g, ' ').toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(t); }
  }
  return out;
}`, explain:"Normalising before comparison catches trivial variants. This only removes exact duplicates after normalisation; real pipelines also remove near-duplicates with techniques such as MinHash."},
    {id:'l5-06-q6', skill:'l5.data-quality', type:'order', difficulty:2, q:"Put these steps of preparing a fine-tuning dataset in a sensible order.", items:['Collect candidate examples','Remove personal data and duplicates','Split into train and held-out test sets','Train the model','Evaluate on the held-out set'], hints:['Which split must happen before training?'], explain:"Clean first, split before training so the test set stays untouched, then train and evaluate. Splitting after cleaning but before training avoids duplicates leaking across the split."}
  ],
  takeaways:['Pretraining = next-token prediction with cross-entropy on huge text corpora.','Training compute is about 6*N*D FLOPs; check how utilisation affects real time.','Compute-optimal scaling grows parameters and tokens together (about 20 tokens per parameter as a rough guide), but practice often trains smaller models longer.','Data quality means signal, diversity, deduplication, no contamination, and lawful handling.','Lower loss on text is not the same as a helpful, safe assistant.'],
  apply:'Choose any open model with a published model card. Find what it says about its training data. List what is documented and what is not.'
}
];
