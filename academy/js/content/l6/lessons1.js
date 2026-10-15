// L6 lessons 1-3: advanced RAG, graph RAG, long context.
export default [
{
  id:'l6-01', title:'Advanced RAG: retrieval you can trust', minutes:34, core:true, code:true, deep:true,
  hook:"Your RAG demo worked on ten questions; production has ten thousand. Expert retrieval is a pipeline of small, separately measurable decisions.",
  skills:['l6.advanced-rag','l6.rag-eval'],
  blocks:[
    { t:'p', md:"**Bridge from Level 5.** You can already build a basic retrieval-augmented generation (RAG) system: split documents into chunks, embed them, fetch the nearest chunks, and paste them into a prompt. You also know how embeddings and models work inside. What is missing is the discipline to make retrieval *reliable*: knowing which part broke when an answer is wrong, and having tools for each kind of break." },
    { t:'p', md:"Running example for this lesson: a hospital's staff assistant answers questions from 40,000 policy documents. A wrong answer here is expensive, so “it usually works” is not good enough." },
    { t:'h', text:'The pipeline, stage by stage' },
    { t:'p', md:"A mature retrieval pipeline has several stages, and each exists because a simpler pipeline fails in a specific way. Click through the walk-through, then we will justify each stage." },
    { t:'widget', w:'flow', props:{
        title:'An advanced retrieval pipeline',
        height:360,
        nodes:[
          {id:'q',label:'User question',x:8,y:15,kind:'input',note:'Often ambiguous, compound, or phrased differently from the documents.'},
          {id:'dec',label:'Query rewrite / decomposition',x:30,y:15,kind:'model',note:'Splits “Compare the leave policy for nurses and doctors” into two sub-queries, or rewrites a follow-up using conversation history.'},
          {id:'lex',label:'Keyword search (BM25)',x:52,y:5,kind:'tool',note:'Exact terms, codes, names, rare words. Weak on paraphrase.'},
          {id:'vec',label:'Vector search',x:52,y:30,kind:'tool',note:'Meaning-based matching. Weak on exact identifiers and negation.'},
          {id:'fuse',label:'Fuse rankings (RRF)',x:72,y:15,kind:'process',note:'Merge two ranked lists without needing comparable scores.'},
          {id:'rr',label:'Rerank top ~50',x:72,y:50,kind:'model',note:'A slower model reads query and candidate together and re-scores.'},
          {id:'ctx',label:'Assemble context',x:50,y:75,kind:'process',note:'Deduplicate, order, add source metadata, respect the token budget.'},
          {id:'gen',label:'Generate with citations',x:25,y:75,kind:'model',note:'The model must answer only from the supplied passages and cite them.'},
          {id:'chk',label:'Check citations / abstain',x:8,y:50,kind:'human',note:'Verify claims are supported; refuse or escalate when evidence is thin.'}
        ],
        edges:[['q','dec'],['dec','lex'],['dec','vec'],['lex','fuse'],['vec','fuse'],['fuse','rr'],['rr','ctx'],['ctx','gen'],['gen','chk']],
        steps:[
          {show:['q','dec'],text:'Stage 1 — understand the question. Rewrite vague follow-ups; split compound questions.'},
          {show:['q','dec','lex','vec'],text:'Stage 2 — retrieve two ways. Keyword and vector search fail on different queries.'},
          {show:['lex','vec','fuse'],text:'Stage 3 — fuse. Reciprocal rank fusion merges the two ranked lists.'},
          {show:['fuse','rr','ctx'],text:'Stage 4 — rerank a short list with a more accurate, slower model, then assemble the context.'},
          {show:['ctx','gen','chk'],text:'Stage 5 — generate with citations, then check support or abstain.'}
        ]
      }, caption:'Click a node for its note; Play steps through the stages. Nodes are draggable.' },
    { t:'h', text:'Why each stage exists' },
    { t:'list', items:[
      "**Query decomposition.** A multi-hop question needs facts from different places. One embedding of the whole question lands between them and retrieves neither well. Splitting into sub-questions retrieves each fact. Cost: extra model calls and the risk that a bad split sends you the wrong way.",
      "**Hybrid search.** Embeddings capture meaning but blur exact strings such as drug codes, policy numbers and names. Keyword search nails exact strings but misses paraphrase. Running both and merging recovers most of what either alone would lose.",
      "**Fusion.** The two engines produce scores on different scales, so you cannot just add them. Reciprocal rank fusion (RRF) uses only the *ranks*: an item scores 1/(k + rank) in each list, and the scores are summed. Items ranked well by both rise; no calibration is needed.",
      "**Reranking.** First-stage retrieval compares precomputed vectors, which is fast but coarse. A reranker reads the query and each candidate *together*, which is more accurate but too slow for the whole corpus, so you apply it to a short list. Cost: added latency proportional to the number of candidates.",
      "**Citation checking and abstention.** If the evidence is missing, the right behaviour is to say so. Without this stage the generator fills the gap with plausible text."
    ]},
    { t:'predict', q:"Two retrievers rank documents. List A: d1, d2, d3. List B: d2, d1, d4. Using RRF with k = 60, which document ends up ranked first?", options:['d1','d2','They tie exactly, so it depends on tie-breaking','d3'], answer:2, explain:"d1 scores 1/61 + 1/62; d2 scores 1/62 + 1/61. These are the same sum, so d1 and d2 tie exactly. A deterministic tie-break rule (for example by id) is part of a good implementation. Neither d3 nor d4 appears in both lists, so they score lower.", skill:'l6.advanced-rag' },
    { t:'callout', kind:'why', title:'Why rank-based fusion?', md:"Keyword scores (like BM25) and cosine similarities live on different scales, and their distributions shift as the corpus changes. Fusing by rank avoids having to normalise them. The price is that it throws away *how much* better one result was than the next, which is sometimes the useful signal." },
    { t:'h', text:'Try it: fusion in code' },
    { t:'p', md:"Implement RRF yourself. Ranks are 1-based (the top item has rank 1). Sort by score descending, and break ties alphabetically by id so results are deterministic." },
    { t:'widget', w:'codeplay', props:{
        title:'Reciprocal rank fusion',
        fnName:'rrf',
        starter:`function rrf(rankings, k) {
  // rankings: array of arrays of ids, best first. Return fused ids, best first.
  const score = {};
  // TODO: for each list, for each position i, add 1 / (k + i + 1) to that id
  return Object.keys(score);
}`,
        tests:[
          {args:[[['a','b','c'],['b','a','d']],60], expect:['a','b','c','d']},
          {args:[[['x','y'],['y','z'],['y','x']],60], expect:['y','x','z']},
          {args:[[],10], expect:[]},
          {args:[[['a','b'],['c','b']],1], expect:['b','a','c']},
          {args:[[['z'],['a']],60], expect:['a','z']}
        ],
        hints:['Use index i of forEach; rank = i + 1.','Sort with (a, b) => score[b] - score[a] || (a < b ? -1 : 1).']
      } },
    { t:'h', text:'Measure retrieval and generation separately' },
    { t:'p', md:"The most valuable habit in RAG engineering is to **evaluate the retriever and the generator separately**. If you only check the final answer you cannot tell which half to fix. For retrieval, you need a set of questions with known relevant passages, and metrics such as **recall@k** (did the right passage appear in the top k?) and **MRR** (how high did the first right passage rank?). For generation, given *perfect* context, you check faithfulness (are the claims supported by the passages?) and completeness." },
    { t:'widget', w:'ragdemo', props:{ corpus:'handbook' }, caption:'Use “break it” toggles: chunks too small, k too low, ambiguous question. For each break, decide whether it is a retrieval failure or a generation failure.' },
    { t:'compare', title:'A working failure taxonomy', cols:['Symptom','Likely stage','First thing to check'], rows:[
      ["Right passage never retrieved","Retrieval (recall)","Chunking, query rewrite, add keyword search, raise k"],
      ["Right passage retrieved but ranked low or cut off","Ranking","Reranker, token budget, ordering in prompt"],
      ["Right passage in prompt, answer wrong","Generation","Prompt, instruction to quote, answer-from-context check"],
      ["Answer cites a superseded document","Data / metadata","Versioning, date filters, deduplication"],
      ["Confident answer when nothing relevant exists","Abstention","Relevance threshold, “not found” training examples"],
      ["Wrong answer to compound question","Decomposition","Split questions, check sub-answers"]
    ]},
    { t:'callout', kind:'misconception', title:'“Better embeddings will fix it”', md:"Often the retrieval problem is not the embedding model at all: it is chunk boundaries, missing metadata, stale duplicates or exact-term queries. Diagnose with recall@k on a labelled set *before* you change models." },
    { t:'try', prompt:"Your assistant answers “What is the notice period for night-shift nurses?” incorrectly. Retrieval recall@5 on your test set is 94%. Write the first three diagnostic steps you would take, in order, and what each would show.", sample:"1. Take failing examples and log what was actually retrieved and put in the prompt: is the right passage there? If not, this is one of the 6% retrieval misses (check query rewrite and exact terms such as ‘night shift’).\n2. If the right passage is in the prompt, run the generator on a hand-written perfect context: if it still errs, it is a generation or instruction problem.\n3. Check whether multiple versions of the policy exist and the model chose the old one; metadata and date filtering fix this. Only then consider changing embeddings." },
    { t:'current', key:'l6-retrieval-stack' },
    { t:'callout', kind:'tip', title:'Reranker budget', md:"If a reranker adds 5 ms per candidate and you rerank 50 candidates in sequence, that is 250 ms of added latency. Batching and smaller candidate lists matter. Always measure the latency/quality curve for *your* data." }
  ],
  reteach:[
    { style:'analogy', md:"Think of a library. Keyword search is the catalogue (exact titles). Vector search is a knowledgeable librarian who understands what you mean. RRF is asking both and trusting books they both recommended. The reranker is a subject expert who reads the shortlisted books before you borrow them. Evaluation separately checks: did we find the right books, and did the reader use them properly?" },
    { style:'simple', md:"A retrieval system makes two kinds of mistakes: it fails to find the right text, or it finds it and the model misuses it. Measure the two separately. Use different search methods and merge them, rerank a short list, and let the system say ‘I could not find it’." },
    { style:'step-by-step', md:"1) Build a labelled set of questions with the passage that answers each. 2) Measure recall@k. 3) If low: fix chunking, add keyword search, rewrite queries. 4) If high: test the generator on perfect context. 5) Add reranking if the right passage is retrieved but low. 6) Add abstention. Re-measure after each change, changing one thing at a time." }
  ],
  quiz:[
    { id:'l6-01-q1', skill:'l6.rag-eval', type:'mcq', difficulty:3, placement:true,
      q:"A RAG system has recall@10 of 96% on a labelled set, yet only 62% of end-to-end answers are correct. Which is the most reasonable next step?",
      options:["Switch to a larger embedding model, since retrieval is the bottleneck","Inspect failures to see whether the right passage reached the prompt, and test the generator on perfect context","Raise k from 10 to 100 so more evidence is included","Remove the reranker to reduce the chance of dropping passages"],
      answer:1, hints:["Which half of the system does the 96% figure measure?","Retrieval seems fine; where else can the answer go wrong?"],
      explain:"Recall@10 says the right passage is usually among the top 10, so retrieval is probably not the main bottleneck. The gap is likely in ranking within the prompt, context assembly or generation, which you find by examining failures and testing the generator with perfect context. A better embedding model or larger k attacks the already-good part (and a larger k may add distraction).",
      wrong:{ '0':"Tempting because ‘retrieval’ is the usual suspect, but the metric says it mostly works.", '2':"More passages can bury the right one and add cost." } },
    { id:'l6-01-q2', skill:'l6.advanced-rag', type:'multi', difficulty:2,
      q:"Select every query type where adding keyword (lexical) search to vector search is most likely to help.",
      options:["“Policy HR-4471 revision date”","“How do I ask for time off when ill?” when the policy says ‘sick leave’","A drug name or product code that appears rarely in training data","A request that depends on negation (‘not eligible for…’)"],
      answer:[0,2],
      hints:["Which queries hinge on an exact string?","Paraphrase is the vector side's strength."],
      explain:"Exact identifiers and rare terms are where lexical matching is strongest. The paraphrase case (‘ill’ vs ‘sick leave’) favours vector search. Negation is hard for both methods; neither lexical nor basic vector search reliably handles it." },
    { id:'l6-01-q3', skill:'l6.advanced-rag', type:'code', difficulty:2,
      q:"Write rrf(rankings, k): rankings is an array of arrays of ids (best first, rank 1 = first). Score each id as the sum over lists of 1/(k + rank). Return all ids sorted by score descending, ties broken alphabetically ascending.",
      fnName:'rrf',
      starter:"function rrf(rankings, k) {\n  const score = {};\n  // your code\n  return [];\n}",
      tests:[
        {args:[[['a','b','c'],['b','a','d']],60], expect:['a','b','c','d']},
        {args:[[['x','y'],['y','z'],['y','x']],60], expect:['y','x','z']},
        {args:[[['a','b','c'],['d','c']],60], expect:['c','a','d','b']},
        {args:[[],10], expect:[]},
        {args:[[['p','q','r']],1], expect:['p','q','r']},
        {args:[[['a','b'],['c','b']],1], expect:['b','a','c']},
        {args:[[['z'],['a']],60], expect:['a','z']}
      ],
      hints:["Loop over lists, then over positions; rank = index + 1.","Object.keys(score).sort((a,b)=> score[b]-score[a] || (a<b?-1:1))"],
      solution:"function rrf(rankings, k) {\n  const score = {};\n  for (const list of rankings) {\n    list.forEach((id, i) => { score[id] = (score[id] || 0) + 1 / (k + i + 1); });\n  }\n  return Object.keys(score).sort((a, b) => score[b] - score[a] || (a < b ? -1 : 1));\n}",
      explain:"Each appearance adds 1/(k+rank). Document ‘c’ appears in both lists (ranks 3 and 2), so it outranks ‘a’ and ‘d’ which each appear once at rank 1. Two mistakes are caught by the tests: using the 0-based index as the rank (with k = 1 it makes a single first-place item tie with an item ranked second in two lists, so ‘b’ no longer wins) and omitting the alphabetical tie-break (‘z’ and ‘a’ tie exactly, and insertion order would put ‘z’ first)." },
    { id:'l6-01-q4', skill:'l6.advanced-rag', type:'order', difficulty:2,
      q:"Put these stages of an advanced RAG pipeline in the order they run.",
      items:["Rewrite or decompose the query","Run keyword and vector retrieval","Fuse the ranked lists","Rerank the short list","Assemble context and generate with citations","Check citations or abstain"],
      hints:["Understanding the question comes before searching.","Rerank only after you have a short merged list."],
      explain:"Each stage narrows or improves the previous one: understand, retrieve broadly, merge, refine the short list, generate, verify. Reranking before fusion would waste work on a list you then merge." },
    { id:'l6-01-q5', skill:'l6.rag-eval', type:'mcq', difficulty:3,
      q:"Your answers sometimes quote a 2019 policy that was replaced in 2023, and both versions are indexed. Which is the best classification and fix?",
      options:["A generation failure, so tighten the prompt with an instruction to be accurate and to prefer recent sources","A data/metadata failure: add versions, then filter or prefer the current one","A retrieval-recall failure, so increase k until the newest policy version is always included in the results","An embedding failure, so fine-tune the embedder on date-sensitive pairs of old and new policies"],
      answer:1, hints:["Is the right content missing, or is the wrong-but-similar content present?","What information tells the system which version is current?"],
      explain:"Both versions are similar, so retrieval returns both correctly by similarity. The system lacks information about which is authoritative. Metadata (effective dates, status) with filtering or ranking fixes it. A larger k makes it worse; a prompt reminder cannot give the model facts it does not have." },
    { id:'l6-01-q6', skill:'l6.advanced-rag', type:'short', difficulty:2,
      q:"Why does reciprocal rank fusion use ranks rather than raw scores? Answer in one sentence.",
      accept:["scale","calibrat","compar","normali[sz]","different (units|ranges|distribution)"],
      model:"Because scores from different retrievers (such as BM25 and cosine similarity) are on different, non-comparable scales, whereas ranks can be combined without calibration.",
      hints:["Think about BM25 scores versus cosine similarity values."],
      explain:"Raw scores from different systems are not comparable, and combining them needs normalisation that is fragile. Ranks are directly comparable. The trade-off is losing the size of score gaps." },
    { id:'l6-01-q7', skill:'l6.rag-eval', type:'mcq', difficulty:2,
      q:"Find the bug. A teammate wrote this to compute recall@k for one query. A query has 4 relevant passages and the top 5 results contain 2 of them. What does it return, and is that recall@5?",
      code:"function recallAtK(retrieved, relevant, k) {\n  const top = retrieved.slice(0, k);\n  const hits = top.filter((id) => relevant.includes(id)).length;\n  return hits / top.length;\n}",
      options:["0.4, which is correct recall@5","0.4; that is precision@k, and recall@5 here is 0.5 (2 of 4 relevant)","0.5, which is correct recall@5","0.4, and the bug is that slice(0, k) should be slice(0, k + 1), otherwise rank k is missed"],
      answer:1, wrong:{ '0':"Dividing by the number retrieved measures precision@k, which answers a different question.", '3':"slice(0, k) correctly takes ranks 1 to k; the end index is exclusive." },
      hints:["What is in the denominator of recall: retrieved items or relevant items?","Compute 2 / 5 and 2 / 4."],
      explain:"The function divides hits by the number retrieved (5), giving 0.4, which is precision@5. Recall divides by the number of relevant passages: 2 / 4 = 0.5. Mixing them up hides retrieval misses, because precision can look fine when only a few passages were ever relevant." },
    { id:'l6-01-q8', skill:'l6.rag-eval', type:'multi', difficulty:3,
      q:"Answer quality dropped after a pipeline change and you must decide whether retrieval or generation is responsible. Which experiments isolate the cause? Select all that apply.",
      options:["Run the generator on hand-picked gold passages and score its answers","Compare recall@k on a labelled query set before and after the change","Re-run the whole pipeline with a larger generator and see whether the score recovers","Check whether the claims in each failing answer are supported by the passages it cited"],
      answer:[0,1,3],
      hints:["An experiment isolates a cause when it changes or measures one stage only.","Which option changes two things at once?"],
      explain:"Gold passages remove retrieval from the picture; recall@k measures retrieval alone; a support check separates ‘passage missing’ from ‘passage misused’. Swapping in a larger generator for the whole pipeline confounds the stages, and a recovery would not tell you which stage was at fault." },
    { id:'l6-01-q9', skill:'l6.advanced-rag', type:'mcq', difficulty:2,
      q:"Predict the behaviour. A fusion function adds 1 / i for each document at 0-based position i in each list (instead of 1 / (k + i + 1)). What happens?",
      options:["Nothing unusual; scores are just smaller","The first item of every list scores infinity, so each list's top item beats everything else","Documents in several lists are penalised","Scores become negative"],
      answer:1, wrong:{ '0':"Smaller is not the issue; dividing by zero is.", '2':"Appearing in more lists adds score; it is not penalised." },
      hints:["Evaluate 1 / i at i = 0.","With k in the denominator the constant stops the top item from dominating."],
      explain:"1 / 0 is infinity in JavaScript, so every list's first item gets an infinite score and ties with the other lists' first items regardless of the rest. The constant k keeps early ranks from dominating and keeps the formula defined." }
  ],
  takeaways:[
    "Advanced RAG is a pipeline of small decisions; each stage exists to fix a specific failure.",
    "Hybrid search plus rank-based fusion plus reranking is a strong default; measure it on your own data.",
    "Always evaluate retrieval (recall@k, MRR) separately from generation (faithfulness, completeness).",
    "Use a failure taxonomy so that every wrong answer points to a stage to fix.",
    "The right behaviour when evidence is missing is to abstain, and that must be tested."
  ],
  apply:"Take 20 questions your team really asks. For each, write down which document answers it. Run your current search and record whether that document is in the top 5. You now have a recall@5 number and a list of failures to classify."
},

{
  id:'l6-02', title:'Graph RAG: when relationships are the question', minutes:28, core:false, code:true, deep:true,
  hook:"Some questions are not about a passage but about how things connect — and chunks of text are a poor place to store connections.",
  skills:['l6.graph-rag','l6.advanced-rag'],
  blocks:[
    { t:'p', md:"Vector search finds passages *similar* to a question. But consider: “Which customers are affected if Supplier A fails?” No single passage says this. The answer is a **path** through relationships: Supplier A supplies Part X, Part X is used at Plant 7, Plant 7 makes Product Y, Product Y is bought by Customer Z. Retrieving similar text may find some links and miss the chain." },
    { t:'p', md:"A **knowledge graph** stores facts as **entities** (nodes) and typed **relationships** (edges). **Graph RAG** uses such a graph in retrieval. There are two quite different ideas under that name, and it matters which you mean." },
    { t:'list', items:[
      "**Traversal-style.** Extract entities and relations; at query time find the entities in the question, walk the graph a few hops, and give the connected facts to the model. Good for multi-hop and “what depends on what” questions.",
      "**Summary-style (community-based).** Build the graph, group densely connected entities into communities, pre-write a summary for each, and answer broad corpus-level questions (“What are the main themes?”) by combining those summaries. This is the approach described by Microsoft researchers in the GraphRAG paper, which argues that plain vector RAG struggles with global questions because they are summarisation tasks, not lookups."
    ]},
    { t:'widget', w:'flow', props:{
        title:'A small supply-chain graph',
        height:340,
        nodes:[
          {id:'sa',label:'Supplier A',x:10,y:25,kind:'store',note:'Entity of type Supplier.'},
          {id:'sb',label:'Supplier B',x:10,y:75,kind:'store',note:'Entity of type Supplier (alternative source of Part X).'},
          {id:'px',label:'Part X',x:34,y:50,kind:'process',note:'Entity of type Part.'},
          {id:'p7',label:'Plant 7',x:58,y:50,kind:'process',note:'Entity of type Facility.'},
          {id:'py',label:'Product Y',x:78,y:30,kind:'process',note:'Entity of type Product.'},
          {id:'cz',label:'Customer Z',x:92,y:68,kind:'output',note:'Entity of type Customer.'}
        ],
        edges:[['sa','px','supplies'],['sb','px','supplies'],['px','p7','used_at'],['p7','py','makes'],['py','cz','sold_to']],
        steps:[
          {show:['sa','px'],text:'Start from the entity named in the question: Supplier A. Follow ‘supplies’ to the part it provides.'},
          {show:['sa','sb','px','p7'],text:'Hop 2: where is Part X used? Note Supplier B also supplies it, a fact that matters for ‘who else could cover?’.'},
          {show:['sa','px','p7','py','cz'],text:'Hops 3-4: Plant 7 makes Product Y, which is sold to Customer Z. Each edge is a stored fact you can cite.'}
        ]
      }, caption:'A question about dependencies is a path query. Which edge would a text-chunk retriever most likely miss?' },
    { t:'h', text:'How the graph gets built (and what it costs)' },
    { t:'steps', items:[
      { title:'Extract', md:"A language model reads each chunk and outputs entities and relations as structured data (for example subject, relation, object). This is one model call per chunk, so indexing a large corpus is expensive." },
      { title:'Resolve', md:"“IBM”, “International Business Machines” and “the company” must become one node. Entity resolution is hard and errors compound: a wrong merge creates false connections." },
      { title:'Store', md:"Put nodes and edges in a graph database or even ordinary tables. Keep a pointer from each edge back to the source passage so answers can cite it." },
      { title:'Query', md:"Identify entities in the question, expand to neighbours within a few hops, rank and trim, and pass facts plus source text to the model." }
    ]},
    { t:'predict', q:"Which question is MOST likely to benefit from a graph rather than plain vector retrieval?", options:["“What is our refund window?”","“Which of our products would be affected if supplier A fails?”","“Summarise this single contract.”","“What does the term ‘force majeure’ mean?”"], answer:1, explain:"The supplier question needs a chain of relationships across many documents. The others are answerable from one passage or one document, which text retrieval handles well and more cheaply.", skill:'l6.graph-rag' },
    { t:'compare', title:'Vector RAG vs graph-based approaches', cols:['','Vector RAG','Graph RAG'], rows:[
      ["Best for","Lookup of a passage that answers the question","Multi-hop relationships; corpus-wide summaries"],
      ["Index cost","Embed each chunk","LLM extraction on each chunk, entity resolution, graph build"],
      ["Updates","Re-embed changed chunks","Re-extract and re-resolve; harder to keep consistent"],
      ["Failure mode","Misses chains and global questions","Extraction errors, wrong merges, missing edges, stale graph"],
      ["Explainability","Show retrieved passages","Show the path and its source passages"]
    ]},
    { t:'callout', kind:'misconception', title:'“Graph RAG replaces vector RAG”', md:"It does not. The published GraphRAG results compare against a vector baseline on *global sensemaking* questions, where gains were reported in comprehensiveness and diversity of answers. For direct lookups the vector approach remains simpler and cheaper, and many production systems combine both. Treat reported gains as evidence for a question type, not a universal upgrade." },
    { t:'h', text:'Try it: multi-hop expansion' },
    { t:'widget', w:'codeplay', props:{
        title:'Expand a graph by hops',
        fnName:'reachable',
        starter:`function reachable(edges, start, maxHops) {
  // edges: [[a,b],...] treated as undirected. Return sorted array of nodes
  // reachable within maxHops hops, NOT including start.
  return [];
}`,
        tests:[
          {args:[[['A','B'],['B','C'],['C','D']],'A',2], expect:['B','C']},
          {args:[[['A','B'],['B','C'],['C','D']],'D',1], expect:['C']},
          {args:[[['A','B']],'Z',3], expect:[]}
        ],
        hints:['Breadth-first search, tracking the current frontier for each hop.','Keep a visited set so cycles do not loop forever.']
      } },
    { t:'try', prompt:"Your company has 2 million support tickets. Choose one question where you would use graph retrieval and one where you would not. For the first, name the entity types and relationships you would extract.", sample:"Graph: “Which customers were affected by incidents that shared the same root-cause component?” Entities: Ticket, Customer, Component, Incident. Relations: reported_by, caused_by, affects. Not graph: “How do I reset my password?” — a single help article answers it; vector or hybrid search is cheaper and adequate. Also note extraction cost: 2 million tickets means 2 million extraction calls, so you might extract only for a priority subset." },
    { t:'callout', kind:'warn', title:'Graph quality is invisible until you test it', md:"A graph can look impressive while containing wrong edges. Sample 100 extracted relations and have a person check them against the source; track precision of extracted facts and, for key entities, how many true relations are missing (recall). Without this, you trade a transparent retrieval error for a hidden data error." },
    { t:'current', key:'l6-retrieval-stack' }
  ],
  reteach:[
    { style:'analogy', md:"A pile of letters versus a family tree. If someone asks “who is my cousin’s grandmother?”, searching the letters for similar words is painful, but walking the family tree is easy. The catch: someone must first read all the letters and draw the tree correctly." },
    { style:'simple', md:"Graph RAG stores facts as things and the links between them, so the system can follow links to answer ‘how are these connected?’ questions. The cost is building and maintaining the graph, which needs many model calls and careful clean-up." },
    { style:'technical', md:"Retrieval over a property graph: map the query to seed entities (entity linking), run a bounded k-hop expansion, score subgraphs or paths, and serialise triples plus provenance into the prompt. The community-summary variant partitions the graph (for example with a community-detection algorithm), pre-computes hierarchical summaries, and answers global queries by map-reduce over summaries." }
  ],
  quiz:[
    { id:'l6-02-q1', skill:'l6.graph-rag', type:'mcq', difficulty:2,
      q:"A legal team asks: “Across all our contracts, which clauses conflict with the data-protection obligations we have to our largest clients?” Which design is most justified?",
      options:["Plain vector search over contract chunks with k = 5, since embeddings capture clause meaning well","Build a graph of parties, obligations and clauses, and validate extraction accuracy","Put all contracts into one very long prompt and rely on the model to cross-reference them","Fine-tune a model on the contracts so it memorises which clauses conflict with which obligations"],
      answer:1, hints:["Does the answer live in a single passage?","What is the main risk of building the graph?"],
      explain:"The question links entities (clients, obligations, clauses) across many documents, which suits traversal. Plain top-5 retrieval would miss most links. The option is only sound if extraction quality is validated, which is the main risk. A long prompt may not fit and has its own reliability limits; fine-tuning does not give citable, current facts." },
    { id:'l6-02-q2', skill:'l6.graph-rag', type:'multi', difficulty:3,
      q:"Which are genuine costs or risks of graph-based RAG? Select all that apply.",
      options:["Extraction needs a model call per chunk at indexing time","Entity resolution mistakes can create false connections","Graphs make it impossible to cite sources","Keeping the graph consistent after document updates is harder than re-embedding chunks"],
      answer:[0,1,3],
      hints:["Which statements follow from how the graph is built?","Can edges keep a pointer to their source?"],
      explain:"Indexing cost, entity-resolution errors and update complexity are real. Citation is not impossible: storing provenance on each edge supports citing the source passage." },
    { id:'l6-02-q3', skill:'l6.graph-rag', type:'code', difficulty:2,
      q:"Write reachable(edges, start, maxHops): edges are undirected pairs. Return a sorted array of all nodes reachable from start within maxHops hops (excluding start).",
      fnName:'reachable',
      starter:"function reachable(edges, start, maxHops) {\n  return [];\n}",
      tests:[
        {args:[[['A','B'],['B','C'],['C','D']],'A',2], expect:['B','C']},
        {args:[[['A','B'],['B','C'],['C','D']],'A',1], expect:['B']},
        {args:[[['A','B'],['B','C'],['C','D']],'A',3], expect:['B','C','D']},
        {args:[[['A','B'],['B','C'],['C','D']],'D',1], expect:['C']},
        {args:[[['A','B'],['B','C'],['C','A']],'A',5], expect:['B','C']},
        {args:[[['A','B']],'Z',3], expect:[]}
      ],
      hints:["Breadth-first search by levels.","Use a visited set that includes start, so cycles do not repeat nodes."],
      solution:"function reachable(edges, start, maxHops) {\n  const adj = {};\n  for (const [a, b] of edges) { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); }\n  const seen = new Set([start]);\n  let frontier = [start];\n  for (let h = 0; h < maxHops; h++) {\n    const next = [];\n    for (const n of frontier) for (const m of adj[n] || []) if (!seen.has(m)) { seen.add(m); next.push(m); }\n    frontier = next;\n  }\n  seen.delete(start);\n  return [...seen].sort();\n}",
      explain:"Level-by-level breadth-first search respects the hop limit. The triangle test checks cycles: without a visited set the search would revisit nodes or include the start. Treating edges as one-directional is the common mistake when the question is symmetric." },
    { id:'l6-02-q4', skill:'l6.graph-rag', type:'mcq', difficulty:3,
      q:"A paper reports that a graph-based method beats a vector RAG baseline on questions like ‘What are the main themes in this corpus?’. A colleague concludes ‘we should replace our vector search with it for our FAQ bot’. What is the best response?",
      options:["Agree: published results show graph RAG beats vector RAG, so it should win on every question type","Disagree: the evidence covers global questions, not FAQ lookups, so test on our own","Disagree: graph methods are known not to work with language models at any realistic scale","Agree, but only after upgrading to a larger model, because extraction quality limits graph methods"],
      answer:1, hints:["Match the question type in the evidence to your use case.","What does an FAQ question usually need?"],
      explain:"Evidence supports a specific question type. A colleague extrapolating to a different workload is making a generalisation the paper does not support. The right move is to evaluate on your own question distribution, including indexing cost." },
    { id:'l6-02-q5', skill:'l6.advanced-rag', type:'short', difficulty:2,
      q:"Name the retrieval technique that breaks a compound question into simpler sub-questions that are retrieved separately.",
      accept:["decompos","sub-?quer","sub-?question","multi-?step"],
      model:"Query decomposition.",
      hints:["It happens before retrieval, in the query-understanding stage."],
      explain:"Query decomposition handles multi-hop and compound questions without needing a graph, and the two techniques are often combined. It adds model calls and can mis-split." }
  ],
  takeaways:[
    "Graph RAG helps when the answer is a path or a corpus-wide pattern, not a passage.",
    "Two flavours exist: traversal over entities, and community summaries for global questions.",
    "The costs are real: extraction calls, entity resolution, graph maintenance.",
    "Keep provenance on edges, and validate extracted facts on a sample.",
    "Published gains apply to the question type tested; check yours."
  ],
  apply:"List five questions people ask about your organisation. Mark each ‘single passage’, ‘needs a chain of links’ or ‘corpus-wide pattern’. If almost all are ‘single passage’, you probably do not need a graph."
},

{
  id:'l6-03', title:'Long-context systems: what the big window does and does not solve', minutes:28, core:false, code:true, deep:true,
  hook:"If a model can read a whole book, why bother with retrieval? Because capacity to accept text is not the same as skill at using it.",
  skills:['l6.long-context'],
  blocks:[
    { t:'p', md:"A **context window** is the amount of text a model accepts in one request. Windows have grown enormously, and it is tempting to conclude that retrieval, memory and chunking are obsolete: just paste everything. This lesson separates what long context truly gives you from what it does not." },
    { t:'h', text:'What long context genuinely solves' },
    { t:'list', items:[
      "**Whole-document reasoning.** Tasks like ‘find contradictions between section 2 and section 9’ need both parts visible at once; chunk retrieval may never put them together.",
      "**Simplicity.** For a small corpus, pasting it in avoids an entire retrieval system and its failure modes.",
      "**Cross-reference without prior indexing.** Ad-hoc documents can be analysed immediately."
    ]},
    { t:'h', text:'What it does not solve' },
    { t:'list', items:[
      "**Reliable use of everything in the window.** Studies such as ‘Lost in the Middle’ found that, for the models tested, accuracy was often highest when the relevant information was at the beginning or end of the input and dropped when it was in the middle. Performance also tended to fall as inputs grew. Newer models may differ; the lesson is to *test* rather than assume.",
      "**Cost and latency.** Every token in the prompt is processed on every call (unless a provider caches a repeated prefix). Cost scales with input length.",
      "**Freshness and scale.** A corpus of 40,000 documents will not fit. Even if it did, data changes.",
      "**Access control.** Everything in the window is visible to the model; you cannot show different users different slices without separate retrieval.",
      "**Distraction.** Irrelevant material can mislead the model. More context is not monotonically better."
    ]},
    { t:'widget', w:'contextwindow', props:{ size:2000 }, caption:'Shrink the window and watch the oldest turns fall out. Then ask yourself: when the window is large, what changes, and what does not?' },
    { t:'callout', kind:'misconception', title:'“The window size is the effective memory”', md:"The advertised window is the *maximum accepted*. The length over which the model reliably retrieves and reasons over details is task-dependent and usually shorter. Measure it with your own documents: put a fact at several positions, add look-alike distractors, and plot accuracy against length." },
    { t:'h', text:'The quadratic bill: why agents get expensive' },
    { t:'p', md:"An agent that takes many steps usually resends the whole conversation each step. If each step adds about t tokens, then step n sends about n × t tokens. Summing over N steps gives roughly t × N(N+1)/2 tokens processed: **cost grows with the square of the number of steps**, not linearly." },
    { t:'predict', q:"An agent adds about 2,000 tokens per step and resends everything each step (no caching). Roughly how many input tokens in total are processed over 20 steps?", options:['40,000','About 420,000','About 4,000,000','800,000'], answer:1, explain:"Total = 2,000 × (1 + 2 + ... + 20) = 2,000 × 210 = 420,000. Linear thinking (20 × 2,000 = 40,000) misses that earlier steps are re-sent every time. Prompt caching can reduce the price of the repeated prefix, but the lesson is that history is not free.", skill:'l6.long-context' },
    { t:'h', text:'Compaction: keeping a long task inside its budget' },
    { t:'p', md:"**Compaction** replaces old context with something smaller. Common techniques, with their risks:" },
    { t:'compare', title:'Context management techniques', cols:['Technique','What it does','Main risk'], rows:[
      ["Truncate oldest","Drop earliest messages","Loses instructions or facts stated early"],
      ["Summarise","Replace history with a model-written summary","Summary omits a detail that later matters; errors compound"],
      ["Offload and point","Store big tool outputs outside the prompt; keep a handle","Model must remember to fetch; extra steps"],
      ["Pin","Always keep system prompt and key facts","Pinned material consumes budget permanently"],
      ["Retrieve on demand","Store memories in an index and fetch when relevant","Retrieval misses (see lesson 1)"]
    ]},
    { t:'p', md:"Whatever you choose, **pin the instructions and the user's goal**, keep the most recent turns verbatim, and treat summaries as lossy." },
    { t:'widget', w:'codeplay', props:{
        title:'Keep the system messages plus the most recent turns',
        fnName:'compact',
        starter:`function compact(messages, budget) {
  // messages: [{role, tokens}]. Always keep every 'system' message (its tokens
  // count toward the budget). Then keep the most recent non-system messages,
  // contiguous from the end, while the total stays <= budget. Return the kept indexes, ascending.
  return [];
}`,
        tests:[
          {args:[[{role:'system',tokens:10},{role:'user',tokens:20},{role:'assistant',tokens:30},{role:'user',tokens:15}],60], expect:[0,2,3]},
          {args:[[{role:'user',tokens:5},{role:'assistant',tokens:5}],7], expect:[1]},
          {args:[[{role:'system',tokens:10},{role:'user',tokens:5},{role:'assistant',tokens:50},{role:'user',tokens:5}],30], expect:[0,3]}
        ],
        hints:['Start the total with the system messages.','Walk backwards from the end; stop at the first message that does not fit.']
      } },
    { t:'try', prompt:"You are designing a coding assistant that works for hours on one repository. List what you would pin, what you would keep verbatim, what you would summarise, and what you would store outside the prompt.", sample:"Pin: system rules, the user's current goal and constraints, the project's coding conventions. Verbatim: the last few turns and the most recent tool output being acted on. Summarise: earlier discussion of dead ends (keeping a short ‘already tried and failed’ list). Offload: full file contents and long test logs (keep file paths and line numbers as handles). Also keep a running ‘decisions made’ note, because a summary that forgets a decision causes the agent to contradict itself." },
    { t:'callout', kind:'tip', title:'Decision rule', md:"Use long context when the corpus is small, the task needs the whole document at once, and you have tested accuracy at that length. Use retrieval when the corpus is large, changing, access-controlled, or when you need to cite precisely. Often the best system uses retrieval to choose *what* goes into a generously sized window." },
    { t:'current', key:'l6-long-context-now' }
  ],
  reteach:[
    { style:'analogy', md:"A very large desk does not make you a better reader. You can spread out a thousand pages, but you still read some more carefully than others, and cleaning up the desk for each new task costs time. Retrieval is a good assistant who fetches only the right pages; long context is the desk." },
    { style:'simple', md:"Big windows let you give the model more text. They do not guarantee the model uses all of it well, they make each call cost more, and they cannot hold very large or private-by-user data. Test, don't assume." },
    { style:'step-by-step', md:"To test a long-context design: 1) take real documents; 2) insert a known fact at start, middle, end; 3) add similar-looking distractors; 4) grow the input and record accuracy, latency and cost; 5) choose the window size where accuracy stays acceptable; 6) beyond that, use retrieval or compaction." }
  ],
  quiz:[
    { id:'l6-03-q1', skill:'l6.long-context', type:'mcq', difficulty:2,
      q:"A team's contract-review assistant sends all 300 pages of each contract in one prompt and finds that obligations mentioned in the middle are missed more often than those near the ends. Which interpretation is best supported?",
      options:["The model is defective and should be replaced by whichever one scores highest on a public leaderboard","This resembles published position effects; measure it at several positions, then mitigate","Long context cannot work for legal text, because contracts are too dense for any language model to read","The window is too small, so the contract must be getting truncated before it reaches the model"],
      answer:1, hints:["Is this behaviour known in research?","What action tests the hypothesis cheaply?"],
      explain:"Position effects were documented in research for tested models, and a middle-position dip is a plausible cause. The sound response is to measure on their data and apply mitigations. The absolute claims (never works; just replace the model) go beyond the evidence, and the window is not too small if the contract fits." },
    { id:'l6-03-q2', skill:'l6.long-context', type:'multi', difficulty:3,
      q:"Which are good reasons to prefer retrieval over pasting the whole corpus into a long window? Select all that apply.",
      options:["Different users must only see documents they are permitted to read","The corpus is much larger than the window","The documents change daily","The corpus is 20 pages and the task needs all of it at once"],
      answer:[0,1,2],
      hints:["Which reasons concern access, scale or freshness?","The last option favours the opposite design."],
      explain:"Access control, scale and freshness favour retrieval. A small corpus needed in full is the case where long context shines." },
    { id:'l6-03-q3', skill:'l6.long-context', type:'code', difficulty:3,
      q:"Write compact(messages, budget). messages is an array of {role, tokens}. Always keep every message with role 'system' (even if they alone exceed the budget); system tokens DO count toward the budget. Then, going backwards from the last message, keep non-system messages while the running total (system plus kept) stays within budget; stop at the first one that does not fit. Return kept indexes in ascending order.",
      fnName:'compact',
      starter:"function compact(messages, budget) {\n  return [];\n}",
      tests:[
        {args:[[{role:'system',tokens:10},{role:'user',tokens:20},{role:'assistant',tokens:30},{role:'user',tokens:15}],60], expect:[0,2,3]},
        {args:[[{role:'system',tokens:10},{role:'user',tokens:20},{role:'assistant',tokens:30},{role:'user',tokens:15}],10], expect:[0]},
        {args:[[{role:'system',tokens:10},{role:'user',tokens:20},{role:'assistant',tokens:30},{role:'user',tokens:15}],1000], expect:[0,1,2,3]},
        {args:[[{role:'user',tokens:5},{role:'assistant',tokens:5}],7], expect:[1]},
        {args:[[{role:'system',tokens:100},{role:'user',tokens:1}],50], expect:[0]},
        {args:[[{role:'system',tokens:10},{role:'user',tokens:5},{role:'assistant',tokens:50},{role:'user',tokens:5}],30], expect:[0,3]}
      ],
      hints:["Compute the system total first and start 'used' from it.","Loop i from the end; if used + tokens > budget, break."],
      solution:"function compact(messages, budget) {\n  let used = 0;\n  const keep = new Set();\n  messages.forEach((m, i) => { if (m.role === 'system') { used += m.tokens; keep.add(i); } });\n  for (let i = messages.length - 1; i >= 0; i--) {\n    if (messages[i].role === 'system') continue;\n    if (used + messages[i].tokens > budget) break;\n    used += messages[i].tokens;\n    keep.add(i);\n  }\n  return [...keep].sort((a, b) => a - b);\n}",
      explain:"Pinned messages are counted first, then recency fills the remainder. Stopping at the first misfit keeps the kept tail contiguous, which avoids conversation fragments with holes. A common bug is skipping a large message and continuing, producing a transcript with missing turns that confuse the model." },
    { id:'l6-03-q4', skill:'l6.long-context', type:'mcq', difficulty:3,
      q:"An agent runs 30 steps, each adding about 1,000 tokens to the conversation, and resends the full history every step without caching. About how many input tokens does the run process in total?",
      options:["About 30,000","About 465,000","About 900,000","About 1,000,000"],
      answer:1, hints:["Step n sends about n × 1,000 tokens.","Sum 1 to 30 = 30 × 31 / 2."],
      explain:"1,000 × (30 × 31 / 2) = 465,000. The linear guess (30,000) ignores resending. History grows linearly but the total bill grows with its square, which is why compaction and caching matter for long agent runs." },
    { id:'l6-03-q5', skill:'l6.long-context', type:'short', difficulty:2,
      q:"In one phrase, what is the term for replacing older context with a shorter summary or pointer to stay within a budget?",
      accept:["compact","summari[sz]","condens"],
      model:"Compaction (context summarisation).",
      hints:["It trades detail for space."],
      explain:"Compaction is lossy by design; its main risk is dropping a detail that later matters." }
  ],
  takeaways:[
    "A big window is capacity, not guaranteed skill: test accuracy by position and length on your data.",
    "Long context wins for small corpora and whole-document reasoning; retrieval wins for scale, freshness and access control.",
    "Agent cost grows roughly with the square of steps when history is resent.",
    "Compaction is lossy: pin goals and instructions, keep recent turns verbatim, offload bulky outputs.",
    "Position effects are documented for some models; do not assume they are gone or universal."
  ],
  apply:"Run a needle test: take one of your real documents, add a one-line fact at 10%, 50% and 90% of the way through, and ask a question about it three times each. Record how often it is found."
}
];
