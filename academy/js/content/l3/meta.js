import p3tests from './p3tests.js';

export const skills = [
  { id: 'l3.js-basics', name: 'Programming you need', desc: 'Read and write JSON, arrays, objects and simple async-minded JavaScript.' },
  { id: 'l3.http-apis', name: 'HTTP and APIs', desc: 'Describe a request and response: method, URL, headers, body, status code.' },
  { id: 'l3.secrets', name: 'Handling secrets', desc: 'Keep API keys out of code, browsers and logs; know what to do if one leaks.' },
  { id: 'l3.model-api', name: 'Calling a model API', desc: 'Build messages, system prompts and parameters, and read a response and its usage.' },
  { id: 'l3.errors-retries', name: 'Errors, limits and retries', desc: 'Classify failures, respect rate limits, and retry with exponential backoff.' },
  { id: 'l3.structured-output', name: 'Structured outputs and validation', desc: 'Get machine-readable output, then parse, validate and repair it.' },
  { id: 'l3.tool-calling', name: 'Tool and function calling', desc: 'Describe tools, run the dispatch loop, and return results or errors to the model.' },
  { id: 'l3.embeddings', name: 'Embeddings and similarity', desc: 'Turn text into vectors and compare them with cosine similarity.' },
  { id: 'l3.vector-search', name: 'Vector search and databases', desc: 'Exact versus approximate nearest-neighbour search, and metadata filters.' },
  { id: 'l3.chunking', name: 'Chunking and retrieval', desc: 'Split documents into overlapping chunks and retrieve the best ones.' },
  { id: 'l3.rag', name: 'Retrieval-augmented generation', desc: 'Build grounded prompts with citations and diagnose RAG failures.' },
  { id: 'l3.streaming', name: 'Streaming responses', desc: 'Assemble streamed deltas and design for perceived latency and mid-stream failure.' },
  { id: 'l3.multimodal', name: 'Multimodal apps', desc: 'Send images and documents to a model and plan for their cost and risk.' },
  { id: 'l3.architecture', name: 'AI application architecture', desc: 'Place keys on the server, add queues, limits, logging and tenant isolation.' }
];

export const glossary = [
  { term: 'API', def: 'A set of rules that lets one program ask another to do something over a defined interface, usually by sending a request and receiving a response.', level: 3, see: ['HTTP', 'endpoint'] },
  { term: 'HTTP', def: 'The request and response protocol of the web. A request has a method, URL, headers and optional body; a response has a status code, headers and a body.', level: 3, see: ['API', 'status code'] },
  { term: 'endpoint', def: 'A specific URL on a server that accepts requests for one kind of action, such as creating a message or listing files.', level: 3, see: ['API'] },
  { term: 'status code', def: 'A three-digit number in an HTTP response. 2xx means success, 4xx means your request was wrong or refused, 5xx means the server failed.', level: 3, see: ['HTTP', 'rate limit'] },
  { term: 'JSON', def: 'A plain-text format for data built from objects, arrays, strings, numbers, booleans and null. Almost every model API sends and receives it.', level: 3, see: ['JSON Schema'] },
  { term: 'API key', def: 'A secret string that identifies and authorises your application to a service. Anyone who holds it can spend your money and read your data.', level: 3, see: ['secret'] },
  { term: 'secret', def: 'Any credential that must not be public: API keys, tokens, passwords. Keep it in server-side environment variables or a secrets manager, never in code or browsers.', level: 3, see: ['API key'] },
  { term: 'messages array', def: 'The list of turns, each with a role and content, that you send to a chat-style model. The model has no memory beyond what you include in it.', level: 3, see: ['system prompt'] },
  { term: 'system prompt', def: 'Standing instructions you give the model about its role, rules and format, kept separate from the user turns. It guides behaviour but is not a security boundary.', level: 3, see: ['messages array'] },
  { term: 'rate limit', def: 'A cap a provider places on how many requests or tokens you may use per period. Exceeding it returns an error, often with a hint about when to retry.', level: 3, see: ['exponential backoff', 'status code'] },
  { term: 'exponential backoff', def: 'A retry strategy where the wait doubles after each failure, up to a cap, usually with random jitter so many clients do not retry in step.', level: 3, see: ['rate limit', 'idempotency'] },
  { term: 'idempotency', def: 'A property of an operation: repeating it has the same effect as doing it once. It decides which requests are safe to retry automatically.', level: 3, see: ['exponential backoff'] },
  { term: 'JSON Schema', def: 'A standard, machine-readable description of what a JSON value must look like: its fields, types, allowed values and which are required.', level: 3, see: ['JSON', 'structured output'] },
  { term: 'structured output', def: 'Model output that follows a fixed machine-readable shape, such as JSON matching a schema, so that code can use it without guessing.', level: 3, see: ['JSON Schema'] },
  { term: 'validation', def: 'Checking that data meets your rules before using it. Model output is untrusted input, so it must be validated exactly like user input.', level: 3, see: ['structured output'] },
  { term: 'tool calling', def: 'A pattern where the model returns a request to run one of your named functions with arguments. Your code runs it and sends the result back.', level: 3, see: ['dispatch loop'] },
  { term: 'dispatch loop', def: 'The code that repeatedly calls the model, executes any tool calls it asks for, appends the results, and stops when it gives a final answer or a step limit is hit.', level: 3, see: ['tool calling'] },
  { term: 'embedding', def: 'A list of numbers representing a piece of text so that texts with similar meaning get nearby vectors. Used for search, clustering and recommendations.', level: 3, see: ['cosine similarity', 'vector database'] },
  { term: 'cosine similarity', def: 'A score from -1 to 1 for how closely two vectors point in the same direction. It ignores length and is the usual way to compare embeddings.', level: 3, see: ['embedding'] },
  { term: 'vector database', def: 'A store built to hold embeddings with metadata and find the nearest ones to a query quickly, often using approximate search.', level: 3, see: ['embedding', 'approximate nearest neighbour'] },
  { term: 'approximate nearest neighbour', def: 'Search that finds very close vectors, not guaranteed to be the closest, in exchange for large speed gains. Recall measures how often it matches exact search.', level: 3, see: ['vector database'] },
  { term: 'metadata filter', def: 'A condition on stored fields, such as tenant, date or document type, applied during search so results come only from permitted records.', level: 3, see: ['vector database', 'tenancy'] },
  { term: 'chunking', def: 'Splitting documents into smaller passages before indexing, so retrieval returns focused pieces that fit the prompt. Chunk size and overlap are design choices.', level: 3, see: ['RAG'] },
  { term: 'RAG', def: 'Retrieval-augmented generation: fetch relevant passages from your own data at question time and put them in the prompt, so the model answers from them.', level: 3, see: ['chunking', 'grounding'] },
  { term: 'grounding', def: 'Constraining an answer to supplied sources, and showing which source supports which claim, so it can be checked rather than trusted.', level: 3, see: ['RAG', 'citation'] },
  { term: 'citation', def: 'A reference from a claim in an answer to the source passage that supports it. Your code should check that every cited reference really exists.', level: 3, see: ['grounding'] },
  { term: 'streaming', def: 'Receiving a response in small pieces as it is generated instead of all at once, so users see text sooner and long requests avoid timeouts.', level: 3, see: ['delta'] },
  { term: 'delta', def: 'One small increment in a stream, such as a few characters of text or a fragment of tool arguments. You join deltas to rebuild the full message.', level: 3, see: ['streaming'] },
  { term: 'multimodal', def: 'Able to take in or produce more than text, such as images, audio or documents. The input still costs tokens and can carry hidden instructions.', level: 3, see: ['prompt injection'] },
  { term: 'tenancy', def: 'Serving several customers from one system. Multi-tenant designs must guarantee that one tenant can never retrieve or see another tenant\'s data.', level: 3, see: ['metadata filter'] },
  { term: 'prompt injection', def: 'Text in retrieved documents, images or tool results that tries to give the model new instructions. Treat all such content as data, never as commands.', level: 3, see: ['grounding'] }
];

const SRC_MSG = { label: 'Anthropic Messages API reference (verified 2026-10)', url: 'https://platform.claude.com/docs/en/api/messages' };

export const current = {
  'l3-message-shapes': {
    title: 'What a chat-model request and response look like today',
    asOf: '2026-10',
    md: "The shapes below are one provider's (Anthropic's Messages API); other providers differ in details. The concepts are shared: a model name, a list of turns, a limit on output length, optional system instructions, and sampling settings.\n\nAnthropic's Messages endpoint is a POST to `/v1/messages` with a JSON body. Required fields are `model`, `max_tokens` and `messages`. The `system` prompt is a separate top-level field, not a message role. `messages` alternates `user` and `assistant` turns, and `content` is either a string or an array of typed blocks (text, image, document, tool_use, tool_result and more). Headers carry your key and an API-version string.\n\nThe response holds a `content` array of blocks, a `stop_reason` (for example `end_turn`, `max_tokens`, `tool_use`) and a `usage` object with token counts. Always read `stop_reason`: `max_tokens` means the answer was cut off.\n\nOther providers differ: some put the system prompt inside the messages array, some name the length limit differently, and some offer more than one API style for the same models. Do not copy parameter names from memory. Open the provider's reference page, and prefer its official SDK, which tracks these changes for you.\n\nLikely to go stale: model names, parameter names, which sampling settings are still accepted on newer models, and the available block types.",
    sources: [SRC_MSG, { label: 'Anthropic API errors', url: 'https://platform.claude.com/docs/en/api/errors' }]
  },
  'l3-error-handling-practice': {
    title: 'Error codes and retry guidance, as one provider documents them',
    asOf: '2026-10',
    md: "Anthropic documents these HTTP statuses: 400 invalid request, 401 authentication, 402 billing, 403 permission, 404 not found, 413 request too large, 429 rate limit, 500 internal error, 504 timeout and 529 overloaded. Errors come back as JSON with a type and message, plus a request id that you should log and quote to support.\n\nThe shared pattern: 4xx errors other than 429 mean your request or credentials are wrong, so retrying the same request will not help. 429, 5xx and network timeouts are usually transient and worth retrying with backoff. If the response carries a `retry-after` hint, honour it. The provider's official SDK retries some transient failures automatically (twice by default, at the time of checking), so avoid stacking your own retries on top without noticing.\n\nTwo subtle cases: a 429 caused by a spend cap does not clear by waiting, and a streaming response can fail after a 200 status has already been sent, so streams need their own error handling.\n\nLikely to go stale: the status list, default retry counts, header names and limits. Check the errors and rate-limit pages of your provider.",
    sources: [{ label: 'Anthropic API errors (verified 2026-10)', url: 'https://platform.claude.com/docs/en/api/errors' }]
  },
  'l3-structured-output-features': {
    title: 'Structured output support right now',
    asOf: '2026-10',
    md: "Two layers exist, and good applications use both. Layer one is provider support: some APIs let you pass a JSON Schema and constrain the output to it. For Anthropic this is an `output_config.format` of type `json_schema`; strict tool use (`strict: true`) does the same for tool arguments. Layer two is your own validation, which you still need.\n\nCaveats documented for Anthropic's version: only a subset of JSON Schema is supported (for example no numeric `minimum`/`maximum` and no string length limits), objects need `additionalProperties: false`, the first use of a schema adds compile latency, and output can still be unusable when `stop_reason` is `refusal` or `max_tokens`. Enum values may come back with different capitalisation. So: read the stop reason, then parse, then validate against your full rules.\n\nOther providers offer similar features under different names, with different schema subsets, and older or smaller models may offer none, in which case you rely on prompting plus the parse-validate-repair loop from this lesson.\n\nLikely to go stale: which models support it, which schema keywords are accepted, and parameter names.",
    sources: [{ label: 'Anthropic structured outputs (verified 2026-10)', url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs' }]
  },
  'l3-tool-calling-shapes': {
    title: 'What tool calling looks like on the wire today',
    asOf: '2026-10',
    md: "In Anthropic's API you pass a `tools` array; each tool has a `name`, a `description` and an `input_schema` (JSON Schema). When the model wants a tool it replies with `stop_reason: tool_use` and one or more `tool_use` blocks carrying an `id`, the tool `name` and an `input` object. You run the function, then send a new user turn containing a `tool_result` block that quotes the same id, and call the API again. A `tool_choice` setting controls whether the model may, must, or must not use tools; support for forcing a tool varies by model.\n\nOther providers use the same loop with different field names. A common variation is that arguments arrive as a JSON string you must parse yourself, and results are sent back in a dedicated tool role. That is why the exercise in this lesson accepts both.\n\nSome tools (web search, code execution) are run by the provider, not by you. Then you see the results but write no dispatcher for them.\n\nLikely to go stale: block and field names, tool-choice options, and the list of provider-run tools. The Model Context Protocol (MCP) is an open standard that many tools now speak; check its site for the current version.",
    sources: [
      { label: 'Anthropic tool use overview (verified 2026-10)', url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview' },
      { label: 'Model Context Protocol', url: 'https://modelcontextprotocol.io/' }
    ]
  },
  'l3-streaming-shapes': {
    title: 'How streaming is delivered today',
    asOf: '2026-10',
    md: "Most model APIs stream over server-sent events (SSE): the HTTP response stays open and the server writes small named events. In Anthropic's API you set `stream: true` and receive events such as `message_start`, then for each content block a start, a series of `content_block_delta` events, and a stop, then `message_delta` (which carries the final stop reason and usage) and `message_stop`. Text arrives as text deltas; tool arguments arrive as fragments of a JSON string that is only valid once the block is finished.\n\nTwo practical points the docs make: long requests are safer streamed (idle connections can be dropped), and an error can arrive mid-stream after a 200 status, so check for error events. The official SDKs offer helpers that accumulate the final message for you.\n\nOther providers use similar SSE streams with different event names, and some offer WebSockets for real-time audio. Use the SDK or the reference page, not memory.\n\nLikely to go stale: event names, delta types, and the existence of helper methods.",
    sources: [{ label: 'Anthropic streaming (verified 2026-10)', url: 'https://platform.claude.com/docs/en/build-with-claude/streaming' }]
  },
  'l3-vector-db-options': {
    title: 'How to choose where vectors live',
    asOf: '2026-10',
    md: "Options fall into groups, and the groups matter more than the brand names. First, a vector extension inside a database you already run (PostgreSQL with the pgvector extension is a widely used example): one system, transactions, SQL filters, good to a moderate scale. Second, dedicated vector databases and managed vector services: built for large indexes and high query rates, with their own operations or bill. Third, search engines that added vector search next to keyword search, which suits hybrid retrieval. Fourth, an in-memory array and a loop, which is perfectly correct for a few thousand vectors and a good first version.\n\nHow to decide: count your vectors, estimate queries per second, list the metadata filters you need (tenant, date, access rights), and ask whether you must also do keyword search. Then test candidates on your own questions and measure recall against exact search, latency, and cost.\n\nLikely to go stale: product names, features, limits and prices. Never choose from a feature table alone; run a small evaluation.",
    sources: [{ label: 'pgvector project (PostgreSQL extension)', url: 'https://github.com/pgvector/pgvector' }]
  },
  'l3-multimodal-inputs': {
    title: 'Sending images and documents to a model',
    asOf: '2026-10',
    md: "Several chat APIs accept images and documents inside a message as typed content blocks. In Anthropic's Messages API the input block types include `image` and `document`, with the data supplied as base64, a URL or a reference to an uploaded file. Other providers use similar structures with different names. Audio and video support, and whether a model can produce images or speech, vary a lot by provider and model.\n\nDurable rules: images and pages consume tokens like text does, so size and count affect cost and latency; large files may need resizing or page limits; document text can contain instructions that the model might follow, so treat it as untrusted; and read any privacy terms before sending personal images or documents.\n\nLikely to go stale: supported formats, size limits, token accounting for images, and which models can see, hear or speak. Check your provider's vision and file documentation.",
    sources: [SRC_MSG]
  }
};

const starter = `function ragCore(question, docs, opts) {
  // opts: { size, overlap, k, minScore, tenant }
  const STOP = new Set(['the','a','an','of','to','is','are','in','on','for','and','or','what','how','do','does','i','my','can','get']);
  const norm = (w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w);
  const tok = (s) => (String(s).toLowerCase().match(/[a-z0-9]+/g) || []).map(norm);

  // 1. question terms: unique tokens that are not stop words
  // 2. guard: no terms, or size <= 0, or overlap < 0, or overlap >= size  -> not answerable
  // 3. for each doc (skip docs whose tenant differs when opts.tenant is set):
  //      chunk its words (split on whitespace) with the given size and overlap
  //      chunk ref = doc.id + ':' + chunkIndex ; score = round2(matched terms / total terms)
  // 4. keep chunks with score > 0 and score >= minScore; sort by score desc, then original order; take k
  // 5. none left -> not answerable; otherwise build the grounded prompt (see guidance)
  return { answerable: false, refs: [], scores: [], prompt: null };
}`;

export const projects = [
  {
    id: 'p3',
    level: 3,
    title: 'Capstone: a tenant-safe RAG pipeline core',
    objective: 'Write the pure-logic heart of a retrieval-augmented generation service: chunk documents, score chunks against a question, select the best, and build a grounded prompt with numbered citations, while refusing to cross tenant boundaries and saying "not answerable" when evidence is missing.',
    skills: ['l3.chunking', 'l3.rag', 'l3.vector-search', 'l3.architecture', 'l3.js-basics'],
    kind: 'code',
    requirements: [
      'Chunks documents by words with the given size and overlap (the last chunk stops at the end of the text)',
      'Scores each chunk as the fraction of distinct question terms it contains, rounded to 2 decimals',
      'Only searches documents belonging to opts.tenant when a tenant is given',
      'Returns answerable:false with prompt:null when nothing relevant is found, or when settings are invalid',
      'Builds a prompt with numbered sources [1], [2] ... and a refusal instruction',
      'Passes every test, including the edge cases'
    ],
    guidance: [
      { title: 'Read the contract first', md: "Inputs: a question string, an array of docs `{id, tenant, text}`, and `opts` with `size`, `overlap`, `k`, `minScore` and optionally `tenant`. Output: `{answerable, refs, scores, prompt}`. `refs` are chunk references such as `refunds:0` (document id, colon, chunk index), in the order they appear as sources [1], [2]." },
      { title: 'Terms and guards', md: "Tokenise with the helper in the starter, remove stop words, and de-duplicate. If there are no terms, or `size <= 0`, or `overlap < 0`, or `overlap >= size`, return the not-answerable result straight away. An overlap as large as the chunk would never move forward, which is a classic infinite-loop bug." },
      { title: 'Chunk with overlap', md: "Split each document on whitespace. The window start moves by `size - overlap`. Push the window `words.slice(i, i + size)` joined by single spaces, and stop after the window that reaches the end, so you never emit a chunk that is just a tail already covered." },
      { title: 'Tenant filter before scoring', md: "If `opts.tenant` is defined, skip documents whose `tenant` is different, before any scoring. Filtering after ranking is how data leaks happen: the top-k could be filled by other tenants' text and then removed, or worse, not removed." },
      { title: 'Score and select', md: "Score is matched terms divided by total terms, rounded with `Math.round(x * 100) / 100`. Keep chunks with `score > 0` and `score >= minScore`. Sort by score descending; ties keep original order (document order, then chunk index). Take the first `k`." },
      { title: 'Build the prompt', md: "Exactly: the line `Answer using only the sources below. Cite sources like [1]. If the sources do not contain the answer, say \"I don't know\".`, a blank line, `Sources:`, then one line per chunk `[n] (ref) text`, a blank line, and `Question: ` plus the original question. Join lines with `\\n`. Return refs and scores in the same order as the sources." }
    ],
    hints: [
      'Do the work in the order of the comments in the starter; return early for the guard cases.',
      'Build one flat array of candidate chunks (with ref, text, score and an order number) before sorting; the order number gives you stable tie-breaking.',
      'The chunk loop is: for (let i = 0, n = 0; i < words.length; i += step, n++) { push window; if (i + size >= words.length) break; }',
      'Prompt: header + "\\n\\nSources:\\n" + lines.join("\\n") + "\\n\\nQuestion: " + question.'
    ],
    success: [
      'All hidden-style tests pass, including tenant isolation, no-evidence, stop-word-only and invalid-settings cases',
      'You can explain why the tenant filter happens before scoring',
      'You can name two ways this toy scorer would fail on real data and what you would use instead (embeddings, hybrid search)'
    ],
    fnName: 'ragCore',
    starter,
    tests: p3tests,
    rubric: [
      { criterion: 'Correct chunking', lookFor: 'Step is size minus overlap, stops at the end, no empty or duplicate tail chunks, guards invalid settings.' },
      { criterion: 'Security of retrieval', lookFor: 'Tenant filter applied before ranking; no path where another tenant\'s text reaches the prompt.' },
      { criterion: 'Honest failure', lookFor: 'Returns answerable:false rather than prompting with irrelevant chunks; prompt tells the model to say it does not know.' },
      { criterion: 'Clarity', lookFor: 'Small named helpers, no mutation of inputs, deterministic ordering.' }
    ],
    extensions: [
      'Replace the term-overlap score with cosine similarity over toy embeddings you pass in, and compare results on paraphrased questions.',
      'Add a citation checker that rejects an answer citing [3] when only two sources were supplied (you wrote the idea in lesson 8).',
      'Write the same function in Python and run it against a real model API in your own environment; record three failures and their causes.',
      'Add a per-tenant token budget that trims the lowest-ranked chunks until the prompt fits.'
    ],
    est: '60-90 min'
  }
];
