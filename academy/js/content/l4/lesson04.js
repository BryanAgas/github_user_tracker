import quiz from './q04.js';
const Q = (id, title) => { const q = quiz.find((x) => x.id === id); return { title, fnName: q.fnName, starter: q.starter, tests: q.tests, hints: q.hints }; };

export default {
  id: 'l4-04', title: 'Retrieval strategies: hybrid search, reranking, query rewriting', minutes: 22,
  hook: 'When a RAG answer is wrong, it is usually the retrieval that failed, and you can find out which part.',
  skills: ['l4.retrieval'], core: true, code: true, deep: false,
  blocks: [
    { t: 'p', md: "At Level 3 you built a basic retrieval-augmented generation (RAG) pipeline: chunk, embed, search, answer. In production the first version meets awkward queries: product codes, typos, vague follow-ups ('what about the red one?'), and documents that nearly match. Better retrieval is the highest-leverage fix." },
    { t: 'widget', w: 'ragdemo', props: { corpus: 'product' }, caption: 'Try this: compare keyword and semantic retrieval on a query that contains an exact code, then on a query that paraphrases.' },
    { t: 'h', text: 'Hybrid retrieval' },
    { t: 'p', md: "**Keyword search** (such as BM25) is exact: great for identifiers, names, rare terms. **Semantic search** (embeddings) captures meaning: great for paraphrase. Each misses what the other finds, so run **both** and merge. A simple, robust merge is **reciprocal rank fusion (RRF)**: each document scores the sum of `1 / (k + rank)` across lists, so documents ranked well by either list float up and those ranked by both float highest. It needs no score calibration, which is its charm." },
    { t: 'h', text: 'Reranking' },
    { t: 'p', md: "First-stage retrieval is fast but coarse. A **reranker** takes the top ~50 candidates and scores each (query, passage) pair together with a heavier model, then you keep the best ~5. It costs extra latency, so it is a precision tool applied after a cheap recall step." },
    { t: 'h', text: 'Query rewriting' },
    { t: 'list', items: [
      "**Contextualise**: turn 'what about the red one?' into a standalone query using conversation history.",
      "**Expand**: generate a few alternative phrasings or add synonyms, then merge the results.",
      "**Decompose**: split a multi-part question into sub-queries.",
      "**Route**: choose which index (policies, orders, FAQs) to search." ] },
    { t: 'widget', w: 'flow', props: { title: 'A production retrieval pipeline', height: 330,
      nodes: [
        { id: 'q', label: 'User question', x: 6, y: 50, kind: 'input' },
        { id: 'rw', label: 'Rewrite to standalone query', x: 26, y: 50, kind: 'model', note: 'Resolve pronouns using chat history. Log both original and rewritten query.' },
        { id: 'kw', label: 'Keyword search', x: 50, y: 22, kind: 'tool' },
        { id: 'vec', label: 'Vector search', x: 50, y: 78, kind: 'tool' },
        { id: 'fuse', label: 'Fuse (RRF)', x: 68, y: 50, kind: 'process', note: 'Merge ranked lists without needing comparable scores.' },
        { id: 'rr', label: 'Rerank top 50 to 5', x: 84, y: 22, kind: 'model' },
        { id: 'ans', label: 'Answer with citations', x: 94, y: 70, kind: 'output', note: 'If the best score is low, answer "I could not find that" rather than guessing.' } ],
      edges: [['q', 'rw'], ['rw', 'kw'], ['rw', 'vec'], ['kw', 'fuse'], ['vec', 'fuse'], ['fuse', 'rr'], ['rr', 'ans']] } },
    { t: 'callout', kind: 'why', title: 'Measure retrieval separately', md: "Evaluate retrieval on its own with questions whose correct source passage you know: is it in the top 5? (recall@5). If the right chunk never arrives, no prompt can rescue the answer; if it arrives and the answer is still wrong, the problem is generation. Separating the two halves your debugging time." },
    { t: 'predict', q: "Users searching 'error E-4091' get generic articles about errors. Which change most directly helps?", options: ["Add keyword (BM25) search and fuse with the vector results", "Increase chunk size to 5,000 tokens", "Use a larger chat model for the answer", "Lower the temperature"], answer: 0, explain: "Embeddings blur exact codes into 'error-ness'. Keyword matching treats 'E-4091' as a rare, highly informative token. Hybrid retrieval keeps both strengths.", skill: 'l4.retrieval' },
    { t: 'p', md: "Implement the merge step." },
    { t: 'widget', w: 'codeplay', props: Q('l4-04-q4', 'Reciprocal rank fusion') },
    { t: 'try', prompt: "A user asks 'does it come in blue?' right after discussing the Model X kettle. Write the rewritten standalone query and say what could go wrong if rewriting is skipped.", sample: "Rewritten: 'Is the Model X kettle available in blue?' Without rewriting, 'does it come in blue' is embedded with no subject and retrieves any blue product, so the answer may describe the wrong item confidently." }
  ],
  reteach: [
    { style: 'analogy', md: "Hybrid search is asking two librarians: one finds books by exact title and index terms, the other by what you mean. A third person (the reranker) then reads the shortlisted books properly and picks the best few." },
    { style: 'step-by-step', md: "1. Clean up the question. 2. Search by words and by meaning. 3. Merge the two lists. 4. Re-read the best candidates carefully. 5. Answer only from what you found, with citations; admit when nothing good was found." },
    { style: 'technical', md: "Two-stage retrieval: high-recall candidate generation (BM25 + dense ANN), rank fusion (RRF, k typically around 60), then cross-encoder reranking for precision at small k. Evaluate with recall@k and MRR on labelled queries before judging answer quality." }
  ],
  quiz,
  takeaways: ['Hybrid retrieval combines exact and semantic matching.', 'Rerank a small candidate set for precision; watch the latency.', 'Rewrite queries using conversation context; log original and rewritten.', 'Measure retrieval separately from generation.'],
  apply: "Collect ten real questions your users ask and note, for each, the passage that answers it. That is the start of a retrieval test set."
};
