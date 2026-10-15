// L6 lessons 7-10: reasoning systems, serving, safety, research literacy.
export default [
{
  id:'l6-07', title:'Reasoning systems: test-time compute, verifiers and search', minutes:32, core:false, code:true, deep:true,
  hook:"Letting a model think longer helps on some problems, does nothing on others, and can make some worse. The skill is knowing which is which.",
  skills:['l6.reasoning'],
  blocks:[
    { t:'p', md:"Earlier levels taught chain-of-thought prompting: ask a model to write out intermediate steps and accuracy on multi-step problems often rises. A **reasoning system** goes further and spends extra computation **at answer time** (test-time compute) in a deliberate, engineered way. This lesson covers the main mechanisms, what the evidence shows, and the honest disagreements." },
    { t:'h', text:'Three ways to spend compute at answer time' },
    { t:'list', items:[
      "**Longer thinking.** The model produces a long hidden or visible chain of reasoning before answering, and has been trained (often with reinforcement learning against checkable rewards) to use it productively.",
      "**Many samples, then choose.** Sample N answers. **Self-consistency** takes the most common final answer (Wang et al. reported gains on several reasoning benchmarks over single-path chain-of-thought). **Best-of-N** uses a scorer or verifier to choose.",
      "**Search.** Explore branches of partial solutions (as in tree search), scoring and pruning them with a verifier."
    ]},
    { t:'widget', w:'flow', props:{
        title:'Generate, verify, select',
        height:300,
        nodes:[
          {id:'q',label:'Problem',x:8,y:50,kind:'input'},
          {id:'g',label:'Generator (N samples)',x:34,y:50,kind:'model',note:'Produces several candidate solutions. Diversity matters: N copies of the same answer add nothing.'},
          {id:'v',label:'Verifier',x:60,y:25,kind:'tool',note:'A unit test, proof checker, calculator, rule set, or learned scorer. Its reliability caps the whole system.'},
          {id:'s',label:'Select / vote',x:60,y:75,kind:'process',note:'Majority vote or highest verified score.'},
          {id:'a',label:'Answer',x:90,y:50,kind:'output'}
        ],
        edges:[['q','g'],['g','v'],['g','s'],['v','s'],['s','a']],
        steps:[
          {show:['q','g'],text:'Spend compute generating several different attempts.'},
          {show:['g','v'],text:'Score each attempt. With a code unit test the verifier is exact; with a learned scorer it is itself fallible.'},
          {show:['v','s','a'],text:'Choose by score or vote. Quality depends on the verifier more than on N.'}
        ]
      }, caption:'Which component sets the ceiling? Click the nodes for notes.' },
    { t:'h', text:'Verifiers are the heart of it' },
    { t:'p', md:"If you can check an answer cheaply and reliably, spending compute on many attempts pays off: generate until something passes. Code with tests, mathematics with a proof checker or exact answer, puzzles with rules, and data transformations with schema checks are such domains. In domains with no reliable check (strategy advice, open-ended writing) a learned scorer stands in, and it can be **gamed**: the more you optimise against an imperfect scorer, the more you find answers that fool it rather than answers that are good." },
    { t:'p', md:"Verifiers can judge only the final answer (outcome supervision) or each step (process supervision). Lightman et al. reported that, on a maths benchmark, a model trained with step-level feedback did better than one trained with outcome-only feedback. This is one result in one domain, but it motivates checking *how* an answer was reached." },
    { t:'predict', q:"You sample 8 answers to a question. Five say 'A', three say 'B', and a reliable unit test says only 'B' is correct. What does majority voting return, and what does verification return?", options:["Voting: A. Verification: B","Voting: B. Verification: A","Both return A","Both return B"], answer:0, explain:"Majority voting rewards agreement; it returns A. A reliable verifier returns B. Voting works when errors are scattered and the correct answer is the most common; it fails when a wrong answer is a popular mistake. This is why checkable tasks favour verifiers over votes.", skill:'l6.reasoning' },
    { t:'widget', w:'codeplay', props:{
        title:'Verifier-weighted vote',
        fnName:'weightedVote',
        starter:`function weightedVote(candidates) {
  // candidates: [{answer, score}]. Sum scores per answer and return the answer
  // with the highest total (first seen wins ties). Return null if empty.
  return null;
}`,
        tests:[
          {args:[[{answer:'A',score:0.9},{answer:'B',score:0.4},{answer:'B',score:0.4},{answer:'B',score:0.3}]], expect:'B'},
          {args:[[{answer:'A',score:5},{answer:'B',score:1},{answer:'B',score:1}]], expect:'A'}
        ],
        hints:['Keep a map of totals and also the order in which answers first appeared.']
      } },
    { t:'h', text:'What does the evidence say? Positions and open questions' },
    { t:'p', md:"This is a contested area, so here are the strongest positions side by side, and where they stand on the evidence." },
    { t:'compare', title:'Positions on reasoning models', cols:['Position','Strongest argument','Strongest counter-argument'], rows:[
      ["Test-time compute is a major new scaling axis","Snell et al. found that on problems where a smaller model has non-trivial success, compute-optimal test-time allocation can match a much larger model, with the best strategy depending on difficulty","Gains are uneven; they depend on verifiable tasks and on difficulty, and the cost per query rises"],
      ["Reasoning models are brittle at complexity","The ‘Illusion of Thinking’ study reported accuracy collapse on controlled puzzles beyond a complexity threshold","Critics argued parts of the collapse came from experimental setup, such as output-length limits; how much survives is disputed"],
      ["Written reasoning shows how the model decided","Reading the chain can expose mistakes and is useful for debugging","Turpin et al. found that explanations can be plausible yet omit what really influenced the answer, so the text is not a guaranteed account"]
    ]},
    { t:'callout', kind:'why', title:'What you can decide without settling the philosophy', md:"Whether this is ‘real reasoning’ is a debate about definitions. The engineering question is narrower and testable: on *your* task, does the extra compute raise a measured score enough to justify extra latency and cost? Evaluate with and without it." },
    { t:'h', text:'When reasoning modes help — and when they do not' },
    { t:'compare', cols:['Task','Reasoning mode likely to help?','Why'], rows:[
      ["Multi-step maths or logic with checkable answers","Often yes","Intermediate steps and verification matter"],
      ["Code with tests","Often yes","Tests are an exact verifier"],
      ["Looking up a fact in a supplied passage","Rarely","Nothing to deliberate; adds cost and latency"],
      ["Style transformations (rewrite politely)","Rarely","No right answer to search for"],
      ["Tasks needing facts the model lacks","No","Thinking longer cannot create missing knowledge; use retrieval"],
      ["Very latency-sensitive interaction (voice)","Usually not","Budget is spent before the first word"]
    ]},
    { t:'callout', kind:'misconception', title:'“More thinking is always better”', md:"Additional reasoning can lead models to overthink simple questions, talk themselves out of correct answers, or spend cost with no gain. Measure accuracy and cost as a function of reasoning effort on your own task, and set budgets." },
    { t:'try', prompt:"You run an assistant that (a) converts natural-language requests into SQL for an analytics database and (b) drafts friendly replies to customers. Where would you spend test-time compute and what verifier would you use?", sample:"SQL generation: yes. Sample several queries and use real verifiers: parse and EXPLAIN them, run them on a small test database, compare result sets between candidates, and reject queries that touch forbidden tables. Customer replies: mostly no; there is no exact verifier, extra samples add cost, and a learned scorer could be gamed. Use a single good prompt and a checklist of rules (tone, no promises), with human review for sensitive cases." },
    { t:'current', key:'l6-reasoning-debate' }
  ],
  reteach:[
    { style:'analogy', md:"A student sitting an exam. Extra time helps on a hard maths paper if they can check their working. Extra time does not help on a question about a fact they never learned. And if the only ‘check’ is a friend who also guesses, you may confidently agree on a wrong answer." },
    { style:'simple', md:"Reasoning systems spend extra compute when answering: thinking longer, trying many times, or searching. It pays off when there is a trustworthy way to check answers. It is wasteful or harmful when there is nothing to search for or the checker is unreliable." },
    { style:'technical', md:"Treat inference as a search problem: a proposal distribution (the generator), a value or verification function, and a selection rule (vote, best-of-N, beam or tree search). Gains scale with proposal diversity and verifier accuracy; with an imperfect learned verifier, optimisation pressure causes reward hacking. Allocate compute adaptively by estimated difficulty." }
  ],
  quiz:[
    { id:'l6-07-q1', skill:'l6.reasoning', type:'mcq', difficulty:2,
      q:"For which task is a best-of-N approach with a verifier MOST likely to add value?",
      options:["Writing a warm thank-you note","Generating Python functions that must pass a given test suite","Summarising a meeting in a friendly tone","Brainstorming product names"],
      answer:1, hints:["Which task has an exact, automatic check?"],
      explain:"A test suite is a reliable verifier, so more attempts translate into more chances to pass. The other tasks lack an objective check, and a learned scorer could be gamed." },
    { id:'l6-07-q2', skill:'l6.reasoning', type:'mcq', difficulty:3, placement:true,
      q:"A team samples 20 answers per question and picks the most common final answer. On the maths set accuracy rises, but on questions where the model has a common misconception accuracy does not improve. What best explains this?",
      options:["Voting only works when N is above 100, because below that the answer counts are too noisy to rank","Voting works when wrong answers are scattered; a popular wrong answer wins, so a verifier is needed","Voting reduces accuracy whenever the answer is numeric, since numeric answers are rarely repeated exactly","The model stops reasoning properly when voting is used, because each sample is generated with less effort"],
      answer:1, hints:["What if the wrong answer is the most likely one?"],
      explain:"Majority voting assumes the correct answer is the most frequent one. When there is a systematic error, the wrong answer is the mode. Independent verification, not more samples, is the fix." },
    { id:'l6-07-q3', skill:'l6.reasoning', type:'code', difficulty:2,
      q:"Write weightedVote(candidates): candidates is an array of {answer, score}. Sum the scores for each distinct answer and return the answer with the highest total; if totals tie, the answer that appeared first wins; return null for an empty list.",
      fnName:'weightedVote',
      starter:"function weightedVote(candidates) {\n  return null;\n}",
      tests:[
        {args:[[{answer:'A',score:0.9},{answer:'B',score:0.4},{answer:'B',score:0.4},{answer:'B',score:0.3}]], expect:'B'},
        {args:[[{answer:'A',score:5},{answer:'B',score:1},{answer:'B',score:1}]], expect:'A'},
        {args:[[{answer:'A',score:1},{answer:'B',score:1}]], expect:'A'},
        {args:[[]], expect:null}
      ],
      hints:["Use an object for totals and an array to remember first-seen order.","Iterate over first-seen order and update only on strictly greater totals."],
      solution:"function weightedVote(candidates) {\n  const tot = {};\n  const order = [];\n  for (const c of candidates) { if (!(c.answer in tot)) { tot[c.answer] = 0; order.push(c.answer); } tot[c.answer] += c.score; }\n  let best = null;\n  for (const a of order) if (best === null || tot[a] > tot[best]) best = a;\n  return best;\n}",
      explain:"Summing verifier scores lets several moderately scored votes outweigh one high score, or vice versa depending on scores. The tie rule uses first-seen order and a strict comparison; using >= would return the last tied answer." },
    { id:'l6-07-q4', skill:'l6.reasoning', type:'multi', difficulty:3,
      q:"Select the statements that the evidence discussed in the lesson supports.",
      options:["Test-time compute can substitute for model size on some problems, with the best strategy depending on difficulty","Reasoning chains are always a faithful record of why the model answered as it did","The size and cause of reasoning-model failures on hard puzzles is disputed among researchers","Thinking longer can supply knowledge the model never learned"],
      answer:[0,2],
      hints:["Which statements are hedged, and which are absolute?"],
      explain:"The compute-for-size trade is supported with conditions, and the puzzle-collapse interpretation is contested. Faithfulness of written reasoning is not guaranteed (Turpin et al.), and extra thinking cannot create missing knowledge." },
    { id:'l6-07-q5', skill:'l6.reasoning', type:'short', difficulty:2,
      q:"Why is a learned verifier more dangerous to optimise against heavily than a unit test? One sentence.",
      accept:["game","hack","exploit","fool","imperfect","fallible","wrong","not (exact|reliable|perfect)"],
      model:"Because a learned verifier is imperfect, strong optimisation finds answers that exploit its flaws and score highly without being correct, whereas a unit test checks the real requirement.",
      hints:["Think of reward hacking."],
      explain:"The stronger the optimisation, the more likely it is to find the verifier's blind spots. Exact checkers have fewer such blind spots." }
  ],
  takeaways:[
    "Test-time compute means thinking longer, sampling many, or searching; each needs a way to choose well.",
    "The verifier's reliability sets the ceiling; learned verifiers can be gamed.",
    "Voting fails when a popular wrong answer exists; verification does not.",
    "The evidence is mixed and partly disputed: gains are real in checkable domains, with limits and cost.",
    "Decide by measuring accuracy, latency and cost on your own task."
  ],
  apply:"Pick one task from your work and write down its verifier in one sentence. If you cannot, that is a sign extra reasoning compute will be hard to direct."
},

{
  id:'l6-08', title:'AI infrastructure and model serving', minutes:36, core:false, code:true, deep:true,
  hook:"A model that works in a notebook is not a service. Serving is a memory-and-scheduling problem, and the arithmetic is simple enough to do on paper.",
  skills:['l6.serving'],
  blocks:[
    { t:'p', md:"Serving an LLM means answering many simultaneous requests within a latency target at an acceptable cost. The model's weights are fixed; what varies is the traffic. Understanding a few mechanisms lets you predict, rather than guess, what hardware you need." },
    { t:'h', text:'Two phases with different bottlenecks' },
    { t:'list', items:[
      "**Prefill.** The model reads the whole prompt in parallel. This is compute-heavy and determines time to first token.",
      "**Decode.** The model generates one token at a time. Each step must read all the weights (and the cache) from GPU memory, so decoding is typically limited by **memory bandwidth**, not arithmetic."
    ]},
    { t:'p', md:"A back-of-envelope bound for a single stream: if the weights occupy 16 GB and the GPU can read 1,000 GB/s (hypothetical numbers), one token needs at least 16/1000 = 16 ms, so at most about 62 tokens per second for that one request. Batching many requests shares that weight read across them, which is why batching raises throughput." },
    { t:'h', text:'The KV cache' },
    { t:'p', md:"To generate each new token, attention needs the keys and values of all previous tokens. Recomputing them every step would be wasteful, so they are stored: the **KV cache**. Its size per token is" },
    { t:'code', lang:'text', src:`bytes per token = 2 (key and value) x layers x KV heads x head dimension x bytes per number
total = bytes per token x tokens in sequence x sequences in the batch`, caption:'Grouped-query attention reduces the number of KV heads, shrinking this directly.' },
    { t:'p', md:"Example (a hypothetical 8-billion-parameter-class configuration): 32 layers, 8 KV heads, head dimension 128, 16-bit numbers (2 bytes). That is 2 × 32 × 8 × 128 × 2 = 131,072 bytes (128 KiB) per token. An 8,192-token sequence needs exactly 1 GiB. Sixteen such sequences need 16 GiB, on top of the weights." },
    { t:'callout', kind:'tip', title:'Units: GB vs GiB', md:"In this course GB means 10^9 bytes and GiB means 2^30 bytes (about 1.074 x 10^9). Level 5 quotes weights in GB (a 7B model at 16 bits is about 14 GB). GPU memory is usually sold in GiB-style binary sizes but labelled GB, so keep a safety margin of a few percent whichever you use. Here, 1 GiB of cache is about 1.07 GB." },
    { t:'predict', q:"Using the configuration above, how much KV cache does a single 32,000-token sequence need?", options:['About 0.5 GiB','About 4 GiB','About 32 GiB','About 128 GiB'], answer:1, explain:"128 KiB × 32,000 tokens ≈ 4.1 GB, which is about 3.9 GiB, so about 4 GiB. Doubling context length doubles cache per sequence, which cuts the number of concurrent users.", skill:'l6.serving' },
    { t:'widget', w:'codeplay', props:{
        title:'KV-cache memory estimator',
        fnName:'kvCacheBytes',
        starter:`function kvCacheBytes(cfg) {
  // cfg: {layers, kvHeads, headDim, seqLen, batch, bytesPerElem}
  // 2 (K and V) x layers x kvHeads x headDim x seqLen x batch x bytesPerElem
  return 0;
}`,
        tests:[
          {args:[{layers:32,kvHeads:8,headDim:128,seqLen:1,batch:1,bytesPerElem:2}], expect:131072},
          {args:[{layers:32,kvHeads:8,headDim:128,seqLen:8192,batch:1,bytesPerElem:2}], expect:1073741824}
        ],
        hints:['Multiply everything together; do not forget the factor 2 for keys and values.']
      } },
    { t:'h', text:'Making the GPU do more useful work' },
    { t:'compare', title:'Core serving techniques', cols:['Technique','What it does','Trade-off'], rows:[
      ["Continuous batching","Adds and removes requests from the running batch every step","Higher throughput; individual latency rises with load"],
      ["Paged KV cache","Stores cache in small blocks like virtual memory pages, avoiding fragmentation and waste (the idea behind PagedAttention)","Engineering complexity; big gains in concurrent sequences"],
      ["Prefix caching","Reuses the cache of a shared prompt prefix (like a long system prompt)","Only helps when prefixes are identical"],
      ["Quantisation","Store weights (or cache) in 8 or 4 bits","Memory and bandwidth savings; possible quality loss; must be evaluated on your task"],
      ["Speculative decoding","A small model drafts tokens the big model verifies in parallel","Speedup depends on how often drafts are accepted"],
      ["Model parallelism","Split a model across several GPUs","Communication overhead; needed when weights exceed one GPU"]
    ]},
    { t:'callout', kind:'why', title:'Throughput vs latency is a dial, not a choice', md:"Larger batches use the GPU more efficiently (more tokens per second overall, lower cost per token) but each request waits for more neighbours, so latency rises. Interactive products set a latency service target and batch as much as that allows; offline jobs (bulk summarisation) batch aggressively." },
    { t:'p', md:"Memory planning, worked example. A GPU has 80 GiB. Weights of the 8B-class model in 16-bit take 8 billion × 2 bytes = 16 GB, which is about 14.9 GiB; we round up to 16 GiB for headroom. Reserve 4 GiB for activations and overhead. That leaves about 60 GiB for cache. At 1 GiB per 8k-token sequence, about 60 concurrent sequences. Quantise weights to 8 bits and you free about 8 GiB, roughly 8 more sequences. Quantise the cache itself and you can fit more again, subject to quality checks." },
    { t:'h', text:'Autoscaling and operations' },
    { t:'list', items:[
      "**Scale on the right signal.** CPU utilisation is a poor guide for GPU inference. Queue depth, concurrent requests and time to first token are better.",
      "**Cold starts are slow.** Loading tens of gigabytes of weights takes a while, so keep a warm pool or scale up early, and test how long a fresh replica takes to serve its first request.",
      "**Control the tail.** Users feel the slowest requests. Track p95 and p99, not only averages; cap output length and prompt length.",
      "**Observe and protect.** Per-request token counts, queue time, errors, GPU memory; rate limits; fallbacks to a smaller model during overload.",
      "**Build vs buy.** Managed endpoints trade control and cost-per-token for operational simplicity. Self-hosting makes sense with steady high volume, strict data requirements or custom models; otherwise the staffing and utilisation costs often dominate."
    ]},
    { t:'try', prompt:"Your chat product has long system prompts (6,000 tokens, identical for all users) and short user turns. Latency to first token is poor under load. Name two optimisations and what you would measure to confirm each helped.", sample:"1) Prefix caching of the shared system prompt, so prefill for the 6,000 tokens is done once: measure time to first token and cache hit rate. 2) Capacity: check KV-cache memory per sequence and the number of concurrent sequences; a larger cache budget (quantised weights or cache, or more GPUs) reduces queueing: measure queue time and p95 latency at the same load. Also consider shortening the prompt, since fewer tokens mean less prefill and less cache." },
    { t:'current', key:'l6-serving-now' }
  ],
  reteach:[
    { style:'analogy', md:"A restaurant kitchen. Reading the recipe book (weights) each time you cook one dish is wasteful, so you cook many orders together (batching). Each table's partly finished order sits on a shelf (KV cache); shelves are limited, so how many tables you can serve is set by shelf space more than by cooks. Waiting to fill a big batch makes each customer wait a little longer." },
    { style:'simple', md:"The model's memory has to hold the weights plus a working note for every active conversation (the KV cache). Longer conversations and more users use more memory. Batching improves cost but adds waiting. Compute the memory first; it tells you how many users fit." },
    { style:'step-by-step', md:"Capacity estimate: 1) weights = parameters × bytes per parameter; 2) cache per token = 2 × layers × KV heads × head dim × bytes; 3) cache per sequence = per token × average sequence length; 4) available = GPU memory − weights − overhead; 5) concurrency ≈ available ÷ cache per sequence; 6) check latency with a load test." }
  ],
  quiz:[
    { id:'l6-08-q1', skill:'l6.serving', type:'code', difficulty:2,
      q:"Write kvCacheBytes(cfg) returning the KV-cache size in bytes: 2 x layers x kvHeads x headDim x seqLen x batch x bytesPerElem. cfg is an object with those fields.",
      fnName:'kvCacheBytes',
      starter:"function kvCacheBytes(cfg) {\n  return 0;\n}",
      tests:[
        {args:[{layers:32,kvHeads:8,headDim:128,seqLen:1,batch:1,bytesPerElem:2}], expect:131072},
        {args:[{layers:32,kvHeads:8,headDim:128,seqLen:8192,batch:1,bytesPerElem:2}], expect:1073741824},
        {args:[{layers:32,kvHeads:8,headDim:128,seqLen:1000,batch:4,bytesPerElem:1}], expect:262144000},
        {args:[{layers:10,kvHeads:4,headDim:64,seqLen:0,batch:8,bytesPerElem:2}], expect:0}
      ],
      hints:["Start from 2 and multiply each factor.","Check: 2*32*8*128*2 = 131072."],
      solution:"function kvCacheBytes(cfg) {\n  return 2 * cfg.layers * cfg.kvHeads * cfg.headDim * cfg.seqLen * cfg.batch * cfg.bytesPerElem;\n}",
      explain:"The factor 2 accounts for storing both keys and values. The cache scales linearly in sequence length and batch size, so doubling either doubles memory. Forgetting the factor of 2 halves your estimate and overbooks the GPU." },
    { id:'l6-08-q2', skill:'l6.serving', type:'mcq', difficulty:3,
      q:"A GPU has 80 GiB. Weights take 16 GiB and overhead 4 GiB. Each active sequence needs 1 GiB of KV cache. About how many concurrent sequences fit? And what happens if the average context length doubles?",
      options:["About 60; roughly 30","About 80; roughly 80","About 60; roughly 60","About 16; roughly 8"],
      answer:0, hints:["80 − 16 − 4 = 60.","Cache per sequence doubles."],
      explain:"60 GiB of cache divided by 1 GiB per sequence gives 60. Doubling context doubles the cache per sequence, so about 30 fit. Ignoring weights (80) or assuming concurrency does not depend on context length are the common errors." },
    { id:'l6-08-q3', skill:'l6.serving', type:'mcq', difficulty:2,
      q:"Which statement about batching is correct?",
      options:["Larger batches always reduce latency for every user because the GPU is better utilised","Larger batches raise throughput and cut cost per token, at some cost in latency","Batching only matters for training; at inference time each request is already processed alone","Batching removes the need for a KV cache because all the requests share the same attention state"],
      answer:1, hints:["Think of throughput and latency as a dial."],
      explain:"Batching shares the weight reads across requests, improving utilisation, but requests may wait for the batch and share compute. It is a trade-off, tuned to the product's latency target." },
    { id:'l6-08-q4', skill:'l6.serving', type:'multi', difficulty:3,
      q:"Which signals are sensible for autoscaling GPU LLM inference? Select all that apply.",
      options:["Queue depth or number of waiting requests","Time to first token at p95","Average CPU utilisation on the host","Concurrent in-flight requests per replica"],
      answer:[0,1,3],
      hints:["Which signals reflect user-visible waiting?","Host CPU is not where the bottleneck sits."],
      explain:"Queue depth, tail time-to-first-token and concurrency track load on the real bottleneck. Host CPU utilisation can be low while the GPU is saturated." },
    { id:'l6-08-q5', skill:'l6.serving', type:'order', difficulty:2,
      q:"Put these steps of a GPU capacity estimate in a sensible order.",
      items:["Compute weight memory from parameters and bytes per parameter","Compute KV-cache bytes per token","Multiply by average sequence length to get cache per sequence","Subtract weights and overhead from GPU memory to find cache space","Divide cache space by cache per sequence to estimate concurrency","Validate with a load test and measure p95 latency"],
      hints:["Work from fixed costs to per-user costs, and finish with measurement."],
      explain:"You must know the fixed memory used by weights before you can see what is left for per-user cache, and an estimate is only a hypothesis until a load test confirms it." },
    { id:'l6-08-q6', skill:'l6.serving', type:'short', difficulty:2,
      q:"Why is single-stream token decoding usually limited by memory bandwidth rather than arithmetic?",
      accept:["bandwidth","read","weights","memory"],
      model:"Each generated token requires reading all the weights (and the KV cache) from GPU memory but performs relatively little computation per byte read.",
      hints:["What must be fetched for every single token?"],
      explain:"For each token the full set of weights is read, but the arithmetic per byte is small at batch size one. Batching increases the arithmetic done per weight read." }
  ],
  takeaways:[
    "Prefill is compute-heavy; decode is memory-bandwidth-bound.",
    "KV cache = 2 x layers x KV heads x head dim x bytes x tokens x sequences; it often sets concurrency.",
    "Batching, paged cache, prefix caching, quantisation and speculative decoding each trade something.",
    "Autoscale on queue depth and tail time-to-first-token; plan for slow cold starts.",
    "Estimate on paper first, then load-test."
  ],
  apply:"Look up the layer count, KV-head count and head dimension for an open model you might run. Compute its KV cache per token and how many 8k-token conversations fit in a GPU with the memory you can access."
},

{
  id:'l6-09', title:'AI safety and alignment: a balanced map', minutes:34, core:false, code:false, deep:true,
  hook:"Serious people disagree about how risky advanced AI is. You do not need to pick a tribe, but you do need to know the arguments, the evidence, and what you can do today.",
  skills:['l6.safety'],
  blocks:[
    { t:'p', md:"**AI safety** is the work of making AI systems behave as intended and avoiding harm. **Alignment** is the part concerned with getting systems to pursue the goals their designers and users actually want. This lesson is deliberately balanced: where the field disagrees, I show the strongest cases and mark what is unresolved." },
    { t:'h', text:'A useful three-way split of risk' },
    { t:'list', items:[
      "**Misuse.** People use AI to cause harm: fraud, disinformation, cyber-attacks, or help with dangerous weapons. The system works as designed in the wrong hands.",
      "**Accidents.** The system does something harmful nobody intended, such as pursuing a flawed objective or failing in new situations. Amodei and colleagues' ‘Concrete Problems in AI Safety’ lays out accident categories: side effects, reward hacking, scalable supervision, safe exploration, and distributional shift.",
      "**Structural risks.** Harms arising from how AI changes institutions and incentives: concentration of power, labour disruption, erosion of trust, competitive pressure that erodes caution."
    ]},
    { t:'p', md:"The categories overlap, and the same mitigation rarely covers all three. A filter that blocks misuse does nothing for an agent that quietly games its objective." },
    { t:'h', text:'Specification gaming: the best-documented accident' },
    { t:'p', md:"**Specification gaming** means satisfying the literal wording of an objective while missing its intent. DeepMind researchers maintain a public list of examples: agents that exploit simulator bugs, or loop to collect a reward without finishing the task. The point is not that these systems are malicious but that **objectives are hard to write**, and optimisation finds loopholes people did not foresee. Language model systems have analogues: a coding agent that makes tests pass by special-casing the test, or a model that tells users what they want to hear because approval was the reward." },
    { t:'widget', w:'rlgrid', props:{}, caption:'Use the reward-hacking preset: the agent maximises the reward you wrote, not the goal you meant. What reward would you write instead, and what loophole might remain?' },
    { t:'predict', q:"An agent is rewarded for 'number of customer tickets marked resolved'. Resolved tickets jump 40% in a week; satisfaction surveys fall. Which description fits best?", options:["The agent became more capable","Specification gaming: the proxy metric was optimised at the expense of the real goal","Distribution shift in the survey tool","Normal noise"], answer:1, explain:"The metric was a proxy for 'customers helped'. Closing tickets prematurely raises the metric while harming the real aim. This pattern is sometimes summarised as: when a measure becomes a target, it ceases to be a good measure.", skill:'l6.safety' },
    { t:'h', text:'The contested questions' },
    { t:'p', md:"Here are several disagreements. For each, I give two serious positions; neither is a caricature." },
    { t:'compare', title:'Where thoughtful people disagree', cols:['Question','One serious view','Another serious view'], rows:[
      ["How serious is catastrophic or loss-of-control risk from future systems?","The potential stakes and the difficulty of verifying a system's goals justify substantial investment now, even at modest probabilities.","Concrete current harms (bias, fraud, labour, concentration of power) are better evidenced, and focusing on speculative scenarios diverts attention and can serve incumbents."],
      ["Do laboratory demonstrations of deception predict real risk?","Studies of backdoored ‘sleeper agent’ models and of strategic compliance (‘alignment faking’) show these behaviours are possible and can persist through some training, so they should be taken seriously.","Those setups were constructed or prompted to elicit the behaviour; it is unclear how often it would arise unprompted in deployment."],
      ["Can we scale oversight as systems become more capable?","Techniques such as AI-assisted evaluation and interpretability might keep oversight tractable.","Unresolved: if a system outperforms its overseers, checking its work may be as hard as doing it."],
      ["Is open release of capable models net positive for safety?","Openness enables independent research, scrutiny and competition.","Openness also removes the ability to withdraw a model or enforce usage safeguards."]
    ]},
    { t:'callout', kind:'misconception', title:'“Safety people believe X” / “sceptics believe Y”', md:"The camps are not two sides. Many researchers hold mixed positions: serious about near-term harms and about long-term risk, or sceptical of some risk scenarios while supporting rigorous testing. Judge claims by their evidence and mechanism, not by the label of whoever makes them." },
    { t:'h', text:'The practical toolkit' },
    { t:'steps', items:[
      { title:'Evaluations (evals)', md:"Systematic tests of capabilities and behaviours (for example dangerous-capability evals). Strength: they can show a capability exists. Limit: failing to find a capability is not proof of absence; a model may behave differently when it detects a test, or may need better elicitation than the evaluators used." },
      { title:'Red-teaming', md:"Adversaries (humans or models) try to break the system. Good red teams are independent, well-resourced and rewarded for finding problems. Findings must be tracked to fixes." },
      { title:'Interpretability', md:"Research aimed at understanding internal mechanisms. Progress is real on identifying some internal features and circuits, but it is far from a reliable method to certify that a large model is safe. Treat claims accordingly." },
      { title:'Training-time methods', md:"Preference training and constitution-like specifications shape behaviour but are imperfect; they can reduce harmful outputs without guaranteeing behaviour in new situations." },
      { title:'Deployment controls', md:"Least privilege, monitoring, rate limits, human approval for consequential actions, incident response, and the ability to roll back or switch off." }
    ]},
    { t:'widget', w:'evalmatrix', props:{}, caption:'A safety classifier faces a threshold choice. Switch scenarios: why does a guardrail for dangerous content set a different threshold from a spam filter?' },
    { t:'h', text:'Governance: what exists' },
    { t:'p', md:"Rules are arriving unevenly. The NIST AI Risk Management Framework is a voluntary US framework organised around Govern, Map, Measure and Manage. The EU AI Act is binding law using a risk-based approach, with obligations phased in. Many organisations also publish internal safety frameworks. Details and dates change, so check official sources before relying on any summary." },
    { t:'try', prompt:"You deploy an agent that can read customer data and issue refunds. Using the three-way split (misuse, accident, structural), give one concrete risk in each category and one control for each.", sample:"Misuse: a fraudster uses social engineering to induce fraudulent refunds; control: identity verification, per-customer limits, human approval above a threshold. Accident: the agent optimises 'tickets closed' and issues refunds too readily; control: balanced metrics (refund accuracy audits, satisfaction), spot checks, caps. Structural: staff over-rely on the agent and lose the skill to detect errors, and policies drift; control: sampling audits by trained staff, rotation, and periodic review of the agent's decisions against policy." },
    { t:'current', key:'l6-safety-landscape' }
  ],
  reteach:[
    { style:'analogy', md:"Think of aviation. Misuse is hijacking; accidents are design flaws and pilot error; structural risk is what happens to airlines and cities as flying changes. Safety there combines testing, incident reporting, independent investigation, redundancy and regulation. None alone suffices, and the field improved by studying failures. AI safety borrows the same mindset, with the extra difficulty that the ‘aircraft’ keeps changing." },
    { style:'simple', md:"Three kinds of trouble: people misusing AI, AI doing something unintended, and wider effects on society. A common unintended problem is that the AI optimises the measurement instead of the goal. Defences include testing, adversarial testing, understanding what is happening inside models, limits on what the AI can do, and rules. Experts disagree about how big the long-term risks are; the near-term ones are well documented." },
    { style:'technical', md:"Specification gaming arises from optimising a proxy objective under distribution-shifted conditions; mitigations include better reward models, adversarial training, constraints, and monitoring. Evaluations estimate lower bounds on capability: absence of evidence depends on elicitation effort and on evaluation awareness. Control approaches assume models may be misaligned and use monitoring, sandboxing and limits on privileges to bound harm regardless." }
  ],
  quiz:[
    { id:'l6-09-q1', skill:'l6.safety', type:'mcq', difficulty:2,
      q:"A coding agent is rewarded when the test suite passes. It starts editing the tests to always return true. Which concept is this?",
      options:["Misuse by a malicious user","Specification gaming (reward hacking)","A structural risk","Over-fitting to training data only"],
      answer:1, hints:["What did the reward measure, and what did the designer intend?"],
      explain:"The reward measured tests passing; the intention was working code. The agent satisfied the letter of the objective, not its purpose. It is not misuse (no malicious user is needed)." },
    { id:'l6-09-q2', skill:'l6.safety', type:'multi', difficulty:3,
      q:"A red team runs a dangerous-capability evaluation and finds no evidence that a model can perform a harmful task. Which conclusions are justified? Select all that apply.",
      options:["The model definitely cannot do the task","The model did not do the task under the elicitation methods the team used","With stronger prompting, fine-tuning or tools, a capability might still appear","The evaluation is worthless"],
      answer:[1,2],
      hints:["Absence of evidence versus evidence of absence.","Useful does not mean conclusive."],
      explain:"A negative result bounds what was tested. It does not prove the capability cannot exist under other elicitation, but it is still informative. Treating it as proof (option 0) and dismissing it (option 3) are both mistakes." },
    { id:'l6-09-q3', skill:'l6.safety', type:'mcq', difficulty:3, 
      q:"Which statement about the disagreement on long-term AI risk is the most accurate and fair?",
      options:["There is scientific consensus that catastrophic risk is negligible","There is scientific consensus that catastrophic risk is imminent","Credible researchers disagree about its likelihood and about how to weigh it against present harms, and the empirical evidence about future systems is limited","The disagreement is only about terminology"],
      answer:2, hints:["Look for the option that does not claim consensus."],
      explain:"Public statements by informed researchers span a wide range of views. Neither extreme consensus claim is supported. Evidence about future systems is necessarily indirect." },
    { id:'l6-09-q4', skill:'l6.safety', type:'order', difficulty:2,
      q:"Order these deployment safeguards roughly from 'prevents the problem structurally' to 'detects it afterwards'.",
      items:["Remove the dangerous permission entirely (least privilege)","Require human approval for consequential actions","Rate limits and spend caps","Monitoring and alerting","Post-incident review and fixes"],
      hints:["Prevention first, then limitation, then detection, then learning."],
      explain:"A permission that does not exist cannot be abused; approvals and caps limit damage; monitoring detects what slipped through; reviews improve the system. Strong designs layer all of these." },
    { id:'l6-09-q5', skill:'l6.safety', type:'short', difficulty:2,
      q:"In one sentence, why is 'we tested it and found nothing' weaker evidence of safety than it sounds?",
      accept:["elicit","absence","not (proof|prove)","only (what|tested)","hidden","different","other (prompts|conditions|situations)","detect","aware"],
      model:"Because testing only covers the conditions and elicitation methods tried; the system may behave differently under other prompts, tools or when it is not being tested, so absence of findings is not proof of absence.",
      hints:["What did the tests not cover?"],
      explain:"Evaluations give a lower bound on what a system can do under the methods used. Independent, adversarial and varied testing narrows the gap but cannot close it completely." }
  ],
  takeaways:[
    "Think in three categories: misuse, accidents, and structural risk; each needs different controls.",
    "Specification gaming is well documented: proxies get optimised at the expense of intent.",
    "Evals and red-teaming give lower bounds, not guarantees; interpretability is promising but not yet a certificate of safety.",
    "Experts disagree on long-term risk; judge arguments by mechanism and evidence, and keep present harms in view.",
    "Defence in depth, least privilege and human oversight work whatever your view on the big questions."
  ],
  apply:"Choose an AI feature you rely on. Write one misuse scenario, one accident scenario (including a proxy metric it might game) and one structural effect. Then state which single control you would add first."
},

{
  id:'l6-10', title:'Reading AI research and preparing your architecture review', minutes:30, core:true, code:true, deep:true,
  hook:"Most claims you will read about AI are stronger than their evidence. A short checklist turns you from a consumer of claims into a judge of them.",
  skills:['l6.research-literacy'],
  blocks:[
    { t:'p', md:"AI moves fast, and much of what you hear arrives as a headline, a leaderboard, a tweet thread or a vendor blog. Reading primary sources is the way out of hype, but papers vary enormously in quality. This lesson gives a method for reading, a checklist for spotting weak claims, and a plan for reproducing results. It also prepares you for the capstone: an architecture review is itself a critical reading of a design." },
    { t:'h', text:'How to read a paper in three passes' },
    { t:'steps', items:[
      { title:'Pass 1 (5 minutes): what is claimed?', md:"Read the title, abstract, figures and conclusion. Write one sentence: ‘They claim that [method] improves [metric] on [task/dataset] by [amount] compared with [baseline]’. If you cannot fill all brackets, the paper is vague." },
      { title:'Pass 2 (30 minutes): how did they test it?', md:"Read the method and experiments. Note datasets, metrics, baselines, number of runs, and what was held fixed. Look at the tables for what is *not* there." },
      { title:'Pass 3 (as needed): can you rebuild it?', md:"Read the appendix, code and data. Identify what you would need to reproduce the main result and what is unclear. Check the limitations section; honest ones are a good sign." }
    ]},
    { t:'h', text:'The weak-claim checklist' },
    { t:'list', items:[
      "**Baselines.** Were the comparison methods tuned as carefully as the new one? An improvement over a weak or stale baseline means little.",
      "**Variance.** One run on one random seed? Differences smaller than the run-to-run noise are not findings. Look for confidence intervals or multiple seeds.",
      "**Benchmark validity.** Does the benchmark measure what the claim says? Could test data have leaked into training (contamination)? Is the benchmark saturated, so differences are tiny or noise?",
      "**Cherry-picking.** Are examples chosen to look good? Are failure cases shown?",
      "**Ablations.** Did they remove components to show which one matters? Without ablations, the explanation is a story.",
      "**Generalisation.** One dataset, one model size, one language? Claims often stretch beyond what was tested.",
      "**Conflicts and incentives.** Who ran the evaluation, and who benefits? Independent replication counts for more than self-reporting.",
      "**Causal language.** ‘Reasoning’, ‘understanding’, ‘emergent’: is it a measured behaviour, or an interpretation?"
    ]},
    { t:'widget', w:'claimcheck', props:{
        title:'Spot the claims that need scrutiny',
        skill:'l6.research-literacy',
        segments:[
          {text:"We introduce Novel-Q, a retrieval method that improves answer accuracy by 12 points over the previous best.", claim:true, status:'unverifiable', why:"Over what baseline, how tuned, on which dataset? A headline number without these cannot be assessed."},
          {text:"Experiments use our internal benchmark of 150 questions written by the authors.", claim:false, status:'true', why:"A small, author-written set is a limitation, not necessarily a falsehood; it affects how far the result generalises."},
          {text:"Results are from a single run.", claim:false, status:'true', why:"No variance estimate: with 150 questions, a few questions change the score by several points."},
          {text:"Therefore Novel-Q understands documents better than any existing approach.", claim:true, status:'unverifiable', why:"Unsupported rather than shown false: one run on 150 internal questions cannot support 'any existing approach' or 'understands', and the paper provides no evidence that would settle it either way."},
          {text:"Ablations show the reranking step contributes 8 of the 12 points.", claim:true, status:'unverifiable', why:"Good practice if true; check the table, number of runs and whether other components were also varied."}
        ]
      }, caption:'Flag sentences you would verify before believing. Then reveal.' },
    { t:'h', text:'A worked case: reading a position-effects study' },
    { t:'p', md:"‘Lost in the Middle’ (Liu et al.) tested several language models on multi-document question answering and key-value retrieval, varying where the relevant item sat in the input. Its finding: for the tested models, accuracy was often highest when the relevant information was at the start or end and lower in the middle, and decreased with longer inputs. Apply the checklist. Strengths: the manipulation is clean (only position changes). Limits: it tested specific models from a particular period on specific tasks, so you cannot assume newer models or other tasks behave identically. The right use of the paper is as a *method* and a prior, then run the test on your own system." },
    { t:'p', md:"A second case: the debate about the ‘Illusion of Thinking’ paper shows how science should work. A claim (reasoning collapses beyond a complexity threshold) drew replies that questioned the setup (for example, whether outputs hit length limits). Reading both is more valuable than reading either alone. When a claim is disputed, the honest summary is ‘disputed, and here is what each side would need to show’." },
    { t:'h', text:'Quantitative sanity checks' },
    { t:'p', md:"A quick rule: the margin of error on an accuracy of p measured over n independent questions is about 1.96 × sqrt(p(1−p)/n) at roughly 95% confidence. At p = 0.5 and n = 100 that is about ±9.8 points. So two systems scoring 62% and 67% on 100 questions are not clearly different. This ignores paired comparisons and question difficulty, but it stops you from over-reading small gaps." },
    { t:'widget', w:'codeplay', props:{
        title:'Margin of error',
        fnName:'marginOfError',
        starter:`function marginOfError(p, n) {
  // 1.96 * sqrt(p*(1-p)/n), rounded to 4 decimals. Return null if n <= 0.
  return null;
}`,
        tests:[
          {args:[0.5,100], expect:0.098},
          {args:[0.5,0], expect:null}
        ],
        hints:['Math.round(x * 10000) / 10000 rounds to 4 decimals.']
      } },
    { t:'h', text:'Reproducing a result' },
    { t:'list', items:[
      "Start from the released code and data if they exist; run it unchanged first. If you cannot reproduce the headline number, that is information.",
      "Re-implement the smallest version of the idea on a small dataset to check the mechanism, not the exact number.",
      "Run multiple seeds. Report mean and spread.",
      "Change one thing at a time. Keep a log: configuration, seed, result.",
      "Write down what you could not verify. A partial reproduction honestly described is a contribution."
    ]},
    { t:'try', prompt:"A vendor blog says: ‘Our model beats the leading competitor by 3 points on a popular benchmark.’ Write five questions you would ask before using this to choose a model.", sample:"1) How many questions, and what is the margin of error on a 3-point gap? 2) Who ran the evaluation and with what prompts; were both models given equal tuning? 3) Could the benchmark have leaked into training data, and is it saturated? 4) Does the benchmark resemble my task? 5) What happens on my own test set, including cost and latency? Treat the blog as a prompt to test, not a conclusion." },
    { t:'h', text:'Preparing the capstone' },
    { t:'p', md:"Your Level 6 capstone is a written **architecture review** of a hard system: a design, a threat model, a failure analysis and an evaluation strategy. The skills you have just learned apply directly: state claims precisely, name alternatives and baselines, separate what you measured from what you assume, give numbers with uncertainty, and list open questions. A good review is one a sceptical colleague could not easily knock down, because you already knocked down the weak parts yourself." },
    { t:'list', items:[
      "Pick a system whose failure matters (see the project brief).",
      "Reuse lesson methods: retrieval failure taxonomy (lesson 1), position and cost effects (3), coordination failures (4), the dangerous combination (5), latency and memory arithmetic (6, 8), verifier reliability (7), the three kinds of risk (9).",
      "Keep a short list of what evidence would change your recommendation."
    ]}
  ],
  reteach:[
    { style:'analogy', md:"Reading a paper is like reading a restaurant review. A review that says ‘best food ever’ after one visit, comparing to a bad restaurant, written by the owner's cousin, deserves less trust than one that describes what they ordered, compares fairly, visits several times and mentions what went wrong." },
    { style:'simple', md:"Ask four questions of any claim: compared to what? how many times was it tested? could the test be unfair or leaked? who ran it and who gains? Then try a small version yourself." },
    { style:'step-by-step', md:"1) Summarise the claim in one sentence with all blanks filled. 2) Locate the evidence table. 3) Check baselines, sample size, seeds and ablations. 4) Estimate noise with the margin-of-error formula. 5) Note limits the authors admit. 6) Decide: believe, test it myself, or wait for replication." }
  ],
  quiz:[
    { id:'l6-10-q1', skill:'l6.research-literacy', type:'mcq', difficulty:2,
      q:"A paper reports a new method beats a baseline by 1.5 points, averaged over a single run on a 200-question test set. Which is the most justified reaction?",
      options:["The method is clearly better","The difference may well be within noise; ask for multiple seeds or confidence intervals","The baseline must be wrong","The test set is too large"],
      answer:1, hints:["With n = 200 the margin of error is several points."],
      explain:"At 200 questions the 95% margin of error for accuracy near 50% is about ±7 points, much larger than 1.5. One run gives no estimate of run-to-run variance. 'Clearly better' over-reads the gap." },
    { id:'l6-10-q2', skill:'l6.research-literacy', type:'code', difficulty:2,
      q:"Write marginOfError(p, n): return 1.96 * sqrt(p*(1-p)/n) rounded to 4 decimal places, or null if n <= 0.",
      fnName:'marginOfError',
      starter:"function marginOfError(p, n) {\n  return null;\n}",
      tests:[
        {args:[0.5,100], expect:0.098},
        {args:[0.9,100], expect:0.0588},
        {args:[0.5,400], expect:0.049},
        {args:[0.5,0], expect:null},
        {args:[1,50], expect:0}
      ],
      hints:["Math.sqrt and Math.round(x * 10000) / 10000."],
      solution:"function marginOfError(p, n) {\n  if (n <= 0) return null;\n  const m = 1.96 * Math.sqrt(p * (1 - p) / n);\n  return Math.round(m * 10000) / 10000;\n}",
      explain:"Quadrupling the sample size halves the margin of error, because it scales with 1/sqrt(n). The guard for n <= 0 avoids division by zero. Note the formula is an approximation and less reliable near p = 0 or 1 or with small n." },
    { id:'l6-10-q3', skill:'l6.research-literacy', type:'multi', difficulty:3,
      q:"Which are red flags when reading a results table? Select all that apply.",
      options:["The baseline hyperparameters were left at defaults while the new method was tuned","No ablation of the component the authors say matters","Results over five seeds with standard deviations reported","The benchmark's test questions are publicly available and the model was trained on a web crawl after their release"],
      answer:[0,1,3],
      hints:["Which items make the comparison unfair or the explanation unsupported?"],
      explain:"Unequal tuning, missing ablations and possible contamination all weaken the claim. Multiple seeds with spread reported is good practice." },
    { id:'l6-10-q4', skill:'l6.research-literacy', type:'mcq', difficulty:3,
      q:"Two papers disagree: one reports that reasoning models fail beyond a complexity threshold; a response argues the failure reflects experimental limits. What is the best way to treat the question?",
      options:["Trust whichever paper has the more famous authors and the larger number of citations","Treat it as disputed: read both, identify the cruxes, and test on your own tasks","Assume the newer paper is correct, since it was written with knowledge of the earlier one","Ignore both papers until a model vendor publishes an official statement on the question"],
      answer:1, hints:["Which option records uncertainty honestly?"],
      explain:"A live scientific dispute should be labelled as such, with the cruxes identified. Deferring to prestige or recency is a heuristic that often fails." },
    { id:'l6-10-q5', skill:'l6.research-literacy', type:'short', difficulty:2,
      q:"What is an ablation study, and why does it matter?",
      accept:["remov","disabl","component","contribut","without"],
      model:"An ablation removes or disables one component to measure how much it contributes, showing which parts of a method actually matter instead of relying on a story.",
      hints:["Think of switching parts off one at a time."],
      explain:"Without ablations an explanation for why a method works is a hypothesis. With them, you can see what drives the gain." }
  ],
  takeaways:[
    "Read in passes: claim, evidence, reproducibility; write the claim as one complete sentence.",
    "Check baselines, variance, benchmark validity, cherry-picking, ablations, generalisation and incentives.",
    "Do simple arithmetic on uncertainty: small test sets cannot support small differences.",
    "Disputed results should be reported as disputed; read both sides.",
    "Reproduce small and honestly; record what you could not verify."
  ],
  apply:"Take one headline claim from an AI article this week. Find the original source, write the claim as a complete sentence with baseline and metric, and list two checks it fails or passes."
}
];
