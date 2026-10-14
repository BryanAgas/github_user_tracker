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
    { t: 'widget', w: 'codeplay', props: { title: 'Reciprocal rank fusion', fnName: 'rrf', starter: "function rrf(rankings, k) {\n  // rankings: [[id, id, ...], [id, ...]] best first\n  // score(id) = sum over lists of 1/(k + rank), rank starting at 1\n  // return ids by score desc; ties by id ascending\n}", tests: [{ args: [[['a', 'b'], ['b', 'a']], 60], expect: ['a', 'b'] }], hints: ['Use an object to accumulate scores.', 'Sort by score then by id.'] } },
    { t: 'try', prompt: "A user asks 'does it come in blue?' right after discussing the Model X kettle. Write the rewritten standalone query and say what could go wrong if rewriting is skipped.", sample: "Rewritten: 'Is the Model X kettle available in blue?' Without rewriting, 'does it come in blue' is embedded with no subject and retrieves any blue product, so the answer may describe the wrong item confidently." }
  ],
  reteach: [
    { style: 'analogy', md: "Hybrid search is asking two librarians: one finds books by exact title and index terms, the other by what you mean. A third person (the reranker) then reads the shortlisted books properly and picks the best few." },
    { style: 'step-by-step', md: "1. Clean up the question. 2. Search by words and by meaning. 3. Merge the two lists. 4. Re-read the best candidates carefully. 5. Answer only from what you found, with citations; admit when nothing good was found." },
    { style: 'technical', md: "Two-stage retrieval: high-recall candidate generation (BM25 + dense ANN), rank fusion (RRF, k typically around 60), then cross-encoder reranking for precision at small k. Evaluate with recall@k and MRR on labelled queries before judging answer quality." }
  ],
  quiz: [
    { id: 'l4-04-q1', skill: 'l4.retrieval', type: 'mcq', difficulty: 2, q: "Postmortem: a RAG assistant said a warranty is 12 months. The policy says 24 months for the premium range. Logs show the premium policy chunk was never retrieved; an older general policy was. What do you fix first?", options: ["Retrieval: add recall measures, metadata filters or hybrid search so the right chunk is fetched", "The answer prompt: add 'be accurate'", "Switch to a larger model", "Increase the temperature to explore more"], answer: 0, hints: ["Was the correct source ever in the prompt?", "Fix the stage that failed."], explain: "The answer was faithful to what was retrieved. The evidence was wrong or missing, so tuning generation cannot help." },
    { id: 'l4-04-q2', skill: 'l4.retrieval', type: 'mcq', difficulty: 2, q: "Why use reciprocal rank fusion rather than adding raw BM25 and cosine scores together?", options: ["The score scales differ and are not comparable; ranks are", "RRF is always more accurate than any single list", "Cosine scores are illegal to add", "BM25 scores are always larger"], answer: 0, hints: ["What units is each score in?", "Think about calibration."], explain: "BM25 and cosine live on different scales that shift with the corpus. Ranks are comparable across lists. RRF is a robust default, not a guarantee of best accuracy." },
    { id: 'l4-04-q3', skill: 'l4.retrieval', type: 'multi', difficulty: 3, q: "Retrieval latency has risen sharply after adding a reranker over the top 200 candidates. Which changes would likely help without wrecking quality? Select all that apply.", options: ["Rerank only the top 30 to 50", "Use a smaller or faster reranker", "Remove first-stage retrieval entirely and rerank the whole corpus", "Cache reranked results for repeated queries"], answer: [0, 1, 3], hints: ["Reranking cost scales with candidates.", "Which option increases work?"], explain: "Rerankers are expensive per pair, so limit candidates, pick a lighter model, or cache. Reranking the whole corpus would be far slower." },
    { id: 'l4-04-q4', skill: 'l4.retrieval', type: 'code', difficulty: 3, q: "Write rrf(rankings, k): each ranking is an array of ids best-first. score(id) = sum of 1/(k + rank) over rankings that contain it (rank starts at 1). Return all ids sorted by score descending; ties by id ascending.", fnName: 'rrf',
      starter: "function rrf(rankings, k) {\n  return [];\n}",
      tests: [
        { args: [[['a', 'b'], ['b', 'a']], 60], expect: ['a', 'b'] },
        { args: [[['a', 'b', 'c'], ['c', 'b', 'd']], 60], expect: ['c', 'b', 'a', 'd'] },
        { args: [[['x']], 60], expect: ['x'] },
        { args: [[], 60], expect: [] },
        { args: [[['m', 'n'], ['o', 'm']], 1], expect: ['m', 'o', 'n'] } ],
      solution: "function rrf(rankings, k) {\n  const score = {};\n  for (const list of rankings) {\n    list.forEach((id, i) => { score[id] = (score[id] || 0) + 1 / (k + i + 1); });\n  }\n  return Object.keys(score).sort((a, b) => (score[b] - score[a]) || (a < b ? -1 : a > b ? 1 : 0));\n}",
      hints: ["rank = index + 1.", "Appearing in two lists adds two terms."], explain: "In test 2, c (third, then first) narrowly beats b (second in both), and both beat a and d which appear in only one list. In the last test with k=1: m scores 1/2+1/3, o 1/2, n 1/3." }
  ],
  takeaways: ['Hybrid retrieval combines exact and semantic matching.', 'Rerank a small candidate set for precision; watch the latency.', 'Rewrite queries using conversation context; log original and rewritten.', 'Measure retrieval separately from generation.'],
  apply: "Collect ten real questions your users ask and note, for each, the passage that answers it. That is the start of a retrieval test set."
};
