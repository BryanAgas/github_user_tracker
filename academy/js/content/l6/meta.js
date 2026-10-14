// L6 metadata: skills, glossary, current entries, capstone project.
export const skills = [
  { id:'l6.advanced-rag', name:'Advanced retrieval design', desc:'Query decomposition, hybrid search, fusion and reranking in a retrieval pipeline.' },
  { id:'l6.rag-eval', name:'Evaluating retrieval vs generation', desc:'Measure retrieval and generation separately and classify failures.' },
  { id:'l6.graph-rag', name:'Graph-based retrieval', desc:'Know when relationships matter and what building a knowledge graph costs.' },
  { id:'l6.long-context', name:'Long-context systems', desc:'What long context does and does not solve; position effects, compaction, cost.' },
  { id:'l6.multi-agent', name:'Multi-agent architectures', desc:'Supervisor, swarm and debate patterns; shared state and coordination failures.' },
  { id:'l6.computer-use', name:'Computer-use agents', desc:'Perception-action loops over graphical interfaces and their reliability limits.' },
  { id:'l6.agent-security', name:'Securing autonomous agents', desc:'Sandboxing, permissions and prompt-injection threat modelling for agents.' },
  { id:'l6.voice', name:'Voice AI and latency budgets', desc:'Cascaded vs speech-native pipelines, turn-taking, barge-in, latency budgeting.' },
  { id:'l6.vision', name:'Vision and document understanding', desc:'VLMs, OCR pipelines and how to evaluate visual extraction.' },
  { id:'l6.reasoning', name:'Reasoning systems', desc:'Test-time compute, verifiers, search, and the limits of each.' },
  { id:'l6.serving', name:'Model serving and infrastructure', desc:'Batching, KV cache, quantisation, GPU memory and throughput vs latency.' },
  { id:'l6.safety', name:'AI safety and alignment', desc:'Specification gaming, misuse vs accident, interpretability, red-teaming, governance.' },
  { id:'l6.research-literacy', name:'Reading AI research', desc:'Read papers critically, spot weak claims and plan a reproduction.' }
];

export const glossary = [
  { term:'Reciprocal rank fusion (RRF)', def:'A way to merge several ranked lists by giving each item the sum of 1/(k+rank) across lists. It needs no score calibration, which is why it suits hybrid search.', level:6, see:['Hybrid search','Reranker'] },
  { term:'Hybrid search', def:'Combining keyword (lexical) retrieval with embedding (semantic) retrieval, then merging the results. Each catches queries the other misses.', level:6, see:['Reciprocal rank fusion (RRF)'] },
  { term:'Reranker', def:'A second-stage model that reads the query and each candidate together and re-scores them. Slower and more accurate than first-stage retrieval, so it is applied to a short list.', level:6, see:['Hybrid search'] },
  { term:'Query decomposition', def:'Splitting a complex question into simpler sub-questions that are retrieved separately, then combining the evidence.', level:6, see:['Multi-hop question'] },
  { term:'Multi-hop question', def:'A question whose answer needs facts from two or more separate passages, where the second lookup depends on the first.', level:6, see:['Query decomposition','Knowledge graph'] },
  { term:'Knowledge graph', def:'Data stored as entities (nodes) and typed relationships (edges), such as “Ada — works_at — Acme”. It makes relationship questions explicit and traversable.', level:6, see:['Graph RAG'] },
  { term:'Graph RAG', def:'Retrieval-augmented generation that builds and queries a graph of entities and relations, or summaries of graph communities, instead of or alongside plain text chunks.', level:6, see:['Knowledge graph'] },
  { term:'Context rot', def:'Informal term for degraded model performance as the input grows long or cluttered, even when the answer is present in the context.', level:6, see:['Lost in the middle'] },
  { term:'Lost in the middle', def:'The finding that many models use information at the start or end of a long input better than information buried in the middle.', level:6, see:['Context rot'] },
  { term:'Compaction', def:'Replacing older conversation or tool output with a shorter summary or a pointer, so a long-running task stays within its context budget.', level:6, see:['Context rot'] },
  { term:'Supervisor pattern', def:'A multi-agent design in which one coordinating agent assigns work to specialist agents and merges their results.', level:6, see:['Shared state'] },
  { term:'Shared state', def:'Information that several agents read and write, such as a task board or scratchpad. It enables coordination and is also where conflicts and stale data arise.', level:6, see:['Supervisor pattern'] },
  { term:'Computer-use agent', def:'An agent that operates software through its graphical interface by looking at screenshots and issuing clicks, keystrokes and scrolls.', level:6, see:['Indirect prompt injection'] },
  { term:'Indirect prompt injection', def:'An attack in which instructions are hidden in content the model reads, such as a web page or email, and the model mistakes them for legitimate commands.', level:6, see:['Computer-use agent'] },
  { term:'Barge-in', def:'In voice systems, the user interrupting while the assistant is speaking. The system must stop audio quickly and drop the interrupted reply from its context.', level:6, see:['Endpointing'] },
  { term:'Endpointing', def:'Deciding when a speaker has finished their turn. Too eager and it cuts people off; too cautious and the reply feels slow.', level:6, see:['Barge-in'] },
  { term:'Vision-language model (VLM)', def:'A model that accepts images (and often text) as input and produces text. Used for captioning, visual question answering and document reading.', level:6, see:['OCR'] },
  { term:'OCR', def:'Optical character recognition: converting pixels of text into characters. Document pipelines often combine OCR with layout analysis or a VLM.', level:6, see:['Vision-language model (VLM)'] },
  { term:'Test-time compute', def:'Computation spent while answering a question (longer reasoning, many samples, search) rather than during training.', level:6, see:['Verifier','Best-of-N'] },
  { term:'Best-of-N', def:'Generate N candidate answers and keep the one that a verifier or scoring rule rates highest.', level:6, see:['Verifier'] },
  { term:'Verifier', def:'A checker for candidate answers: a unit test, a proof checker, a rule, or a learned model. Verification is useful only to the extent the checker is reliable.', level:6, see:['Best-of-N'] },
  { term:'KV cache', def:'Stored attention keys and values for tokens already processed, so each new token does not recompute the past. It is large and often the limit on how many requests fit on a GPU.', level:6, see:['Continuous batching'] },
  { term:'Continuous batching', def:'A serving technique that adds and removes requests from a running batch at each generation step, keeping the GPU busy without waiting for the slowest request.', level:6, see:['KV cache'] },
  { term:'Quantisation', def:'Storing model weights (and sometimes activations or cache) in fewer bits, such as 8 or 4, to save memory and bandwidth at some risk to quality.', level:6, see:['KV cache'] },
  { term:'Specification gaming', def:'A system satisfying the literal wording of its objective while missing the intended purpose, for example exploiting a loophole in a reward.', level:6, see:['Reward hacking'] },
  { term:'Reward hacking', def:'Specification gaming in reinforcement learning: the agent finds behaviour that scores highly on the reward signal without doing what the designer wanted.', level:6, see:['Specification gaming'] },
  { term:'Red-teaming', def:'Structured adversarial testing in which people (or models) try to make a system fail or misbehave, in order to find problems before attackers or users do.', level:6, see:['Evaluation'] },
  { term:'Interpretability', def:'Research on understanding what computations inside a model represent and how they produce behaviour. Its practical reach today is partial and debated.', level:6, see:['Red-teaming'] },
  { term:'Ablation', def:'An experiment that removes or disables one component to measure its contribution. Absent or weak ablations are a common warning sign in papers.', level:6, see:['Baseline'] },
  { term:'Baseline', def:'The simple or prior method a new idea must beat. A claim is only as strong as the baselines it was tuned against.', level:6, see:['Ablation'] }
];

export const current = {
  'l6-retrieval-stack': {
    title:'Choosing a retrieval stack right now',
    asOf:'2026-10',
    md:"The durable ideas in this lesson (hybrid retrieval, fusion, reranking, separate evaluation of retrieval and generation) have been stable for years. The specific products change quickly: vector databases, managed search services and hosted rerankers appear, merge and change pricing constantly.\n\nWhat to check when you choose: does your search engine support both keyword and vector queries and a built-in fusion step? Which rerankers can you call, at what latency per candidate, and are they permitted for your data? What embedding models are available in your languages and domain, and how many dimensions do they produce (storage and speed scale with that)?\n\nMethod: build a small labelled set of real queries with known relevant passages (50 is a useful start), then compare candidate stacks on recall@k and on end-to-end answer correctness. Leaderboards are a starting list, not a decision.\n\nLikely to go stale: product names, default parameters, supported fusion options, prices. RRF's constant k=60 is the value the original authors fixed in a pilot study, not a law; tune it on your own data.",
    sources:[
      { label:'Cormack, Clarke, Buettcher (2009) — Reciprocal Rank Fusion (Google Research listing)', url:'https://research.google/pubs/pub36196/' },
      { label:'Edge et al. — From Local to Global: A Graph RAG Approach (arXiv 2404.16130)', url:'https://arxiv.org/abs/2404.16130' }
    ]
  },
  'l6-long-context-now': {
    title:'Long context in practice right now',
    asOf:'2026-10',
    md:"Advertised context-window sizes have grown by orders of magnitude, and they keep changing. The window is the most the model accepts, which is not the same as the length over which it reliably uses information.\n\nHow to check for your task: take your real documents, place a known fact at the start, middle and end, grow the input in steps, and measure accuracy at each length. Add distractors that look like the answer. Measure cost and latency at each size too, because the entire input is processed on every call unless your provider offers caching.\n\nThe published evidence that position matters is the 'Lost in the Middle' study, which tested particular models from 2023. Newer models may behave differently, so treat it as a method and a warning rather than a current ranking.\n\nLikely to go stale: window sizes, prompt-caching rules and discounts, which models handle long inputs best.",
    sources:[
      { label:'Liu et al. — Lost in the Middle: How Language Models Use Long Contexts (arXiv 2307.03172)', url:'https://arxiv.org/abs/2307.03172' }
    ]
  },
  'l6-multi-agent-now': {
    title:'Multi-agent systems: what practitioners report',
    asOf:'2026-10',
    md:"Frameworks for multi-agent systems come and go; the design questions do not. Two public sources are worth reading as a pair.\n\nAnthropic describes an orchestrator-worker research system in which a lead agent plans and delegates to parallel sub-agents, and reports that it works well for broad, parallelisable research but costs substantially more tokens than a single agent. Separately, a Berkeley-led study of failures across several open-source multi-agent frameworks proposes a taxonomy (MAST) with three families of failure: specification problems, inter-agent misalignment and weak task verification, and argues many failures are design problems rather than just model weakness.\n\nThe honest summary: multi-agent designs can help on parallel, breadth-heavy tasks, and they add coordination cost and new failure modes. Whether they beat a single well-tooled agent is task-dependent; measure it.\n\nLikely to go stale: framework names, protocol standards, the reported token multipliers and failure rates.",
    sources:[
      { label:'Anthropic — How we built our multi-agent research system', url:'https://www.anthropic.com/engineering/multi-agent-research-system' },
      { label:'Anthropic — Building effective agents', url:'https://www.anthropic.com/engineering/building-effective-agents' },
      { label:'Cemri et al. — Why Do Multi-Agent LLM Systems Fail? (arXiv 2503.13657)', url:'https://arxiv.org/abs/2503.13657' }
    ]
  },
  'l6-computer-use-now': {
    title:'Computer-use agents: current guidance',
    asOf:'2026-10',
    md:"Several providers offer computer-use capabilities in which a model sees screenshots and returns mouse and keyboard actions that your code executes. Tool names, supported actions and versions change frequently, so read your provider's documentation before building.\n\nProvider documentation for this capability emphasises the same safeguards this lesson teaches: run it in an isolated virtual machine or container with minimal privileges, keep sensitive credentials and data out of reach, limit internet access to an allowlist, and ask a human to confirm consequential actions. Documentation also warns that instructions embedded in web pages or images can override or confuse the model.\n\nOWASP ranks prompt injection first in its list of risks for LLM applications; its guidance treats mitigations as risk reduction, not elimination.\n\nLikely to go stale: tool versions, action sets, reliability on benchmarks, and recommended settings.",
    sources:[
      { label:'Anthropic — Computer use tool documentation', url:'https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool' },
      { label:'OWASP — Top 10 for Large Language Model Applications', url:'https://owasp.org/www-project-top-10-for-large-language-model-applications/' }
    ]
  },
  'l6-reasoning-debate': {
    title:'Reasoning models: evidence and open disputes',
    asOf:'2026-10',
    md:"Reasoning models spend extra computation at answer time. Three bodies of evidence are worth knowing, and they point in somewhat different directions.\n\nFor: a study of test-time compute (Snell et al.) found that, on problems where a smaller model has a non-trivial chance of success, allocating extra inference compute well can match or beat a much larger model, and that the best strategy depends on question difficulty. Process-level supervision (Lightman et al.) improved mathematical problem solving over outcome-only supervision in their experiments.\n\nAgainst, or at least cautionary: Apple researchers argued, in 'The Illusion of Thinking', that reasoning models' accuracy collapses beyond a complexity threshold on controlled puzzles. Critics replied that part of the collapse came from experimental design, such as output-length limits. How far the paper's conclusion survives is disputed.\n\nWhat this lesson asserts is therefore limited: extra compute helps most where answers are checkable and the base model is partly competent, and its benefits are uneven. Whether this amounts to ‘real’ reasoning is a philosophical dispute that engineering decisions do not need to settle.\n\nLikely to go stale: model names, benchmark results, and which tasks reasoning modes help.",
    sources:[
      { label:'Snell et al. — Scaling LLM Test-Time Compute Optimally (arXiv 2408.03314)', url:'https://arxiv.org/abs/2408.03314' },
      { label:'Lightman et al. — Let\'s Verify Step by Step (arXiv 2305.20050)', url:'https://arxiv.org/abs/2305.20050' },
      { label:'Shojaee et al. — The Illusion of Thinking (arXiv 2506.06941)', url:'https://arxiv.org/abs/2506.06941' },
      { label:'Wang et al. — Self-Consistency Improves Chain of Thought Reasoning (arXiv 2203.11171)', url:'https://arxiv.org/abs/2203.11171' },
      { label:'Turpin et al. — Language Models Don\'t Always Say What They Think (arXiv 2305.04388)', url:'https://arxiv.org/abs/2305.04388' }
    ]
  },
  'l6-serving-now': {
    title:'Serving stacks right now',
    asOf:'2026-10',
    md:"Open-source inference engines (vLLM is the best-known example) and managed endpoints both implement the ideas in this lesson: continuous batching, paged KV-cache management, quantised weights and prefix caching. The vLLM paper introduced PagedAttention and reported roughly 2 to 4 times higher throughput than earlier systems at similar latency in its benchmarks; your numbers depend on your model, hardware and traffic.\n\nWhat to check: the engine's supported quantisation formats and the quality loss on your task (always run your own evaluation); whether prefix caching is supported for your shared system prompts; the GPU memory you actually have after weights and activations; and the provider's rate limits and queueing behaviour if you use a managed endpoint.\n\nLikely to go stale: engine names and feature lists, supported hardware, and every price and throughput figure.",
    sources:[
      { label:'Kwon et al. — Efficient Memory Management for LLM Serving with PagedAttention (arXiv 2309.06180)', url:'https://arxiv.org/abs/2309.06180' },
      { label:'vLLM documentation', url:'https://docs.vllm.ai/' }
    ]
  },
  'l6-safety-landscape': {
    title:'Safety and governance: where things stand',
    asOf:'2026-10',
    md:"Governance is moving. Two reference points that are stable enough to learn from: the NIST AI Risk Management Framework is a voluntary framework organised around four functions (Govern, Map, Measure, Manage); the EU AI Act is binding law that takes a risk-based approach, with different obligations phased in on different dates. Some dates and details have been under revision, so check the European Commission's pages for current timelines rather than relying on any summary, including this one.\n\nOn technical research, a few empirical results are widely discussed: model organisms of deceptive behaviour, and a study in which a model strategically complied with a training objective it disagreed with in a constructed scenario (‘alignment faking’). Researchers disagree about how far such laboratory results predict real-world risk.\n\nLikely to go stale: laws and dates, institutional names, which results have been replicated, and every claim about capability levels.",
    sources:[
      { label:'NIST — AI Risk Management Framework', url:'https://www.nist.gov/itl/ai-risk-management-framework' },
      { label:'European Commission — Regulatory framework for AI', url:'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai' },
      { label:'Greenblatt et al. — Alignment faking in large language models (arXiv 2412.14093)', url:'https://arxiv.org/abs/2412.14093' },
      { label:'Hubinger et al. — Sleeper Agents (arXiv 2401.05566)', url:'https://arxiv.org/abs/2401.05566' },
      { label:'Amodei et al. — Concrete Problems in AI Safety (arXiv 1606.06565)', url:'https://arxiv.org/abs/1606.06565' },
      { label:'DeepMind — Specification gaming: the flip side of AI ingenuity', url:'https://deepmind.google/discover/blog/specification-gaming-the-flip-side-of-ai-ingenuity/' }
    ]
  }
};

export const projects = [
  {
    id:'p6', level:6,
    title:'Architecture review of a hard system',
    objective:'Write an expert-grade architecture review of a demanding AI system: a design, a threat model, a failure analysis and an evaluation strategy, with every important claim justified or marked uncertain.',
    skills:['l6.advanced-rag','l6.rag-eval','l6.multi-agent','l6.agent-security','l6.serving','l6.safety','l6.research-literacy','l6.long-context'],
    kind:'text',
    requirements:[
      'Choose ONE system from the brief list (or propose an equivalent) and state its purpose, users and what a wrong answer costs.',
      'Describe the architecture with named components and data flows, and justify at least three design choices against a named alternative.',
      'Include a threat model: assets, attacker goals, entry points (including indirect prompt injection), and for each threat a mitigation and a residual risk.',
      'Include a failure analysis: at least six distinct failure modes with cause, detection and mitigation.',
      'Include an evaluation strategy: what is measured at component level and end-to-end, how the test set is built, success thresholds, and how regressions are caught.',
      'Include a numeric capacity, latency or cost estimate with the arithmetic shown and assumptions stated.',
      'State rollout and rollback plans and the human oversight points.',
      'End with open questions and the evidence that would change your recommendation.'
    ],
    guidance:[
      { title:'1. Pick the system and write the one-paragraph brief', md:"Choose one: (a) a clinical-guideline assistant for hospital staff over 40,000 policy documents; (b) a browser agent that books travel and files expenses on behalf of employees; (c) a voice agent that handles first-line customer-service calls for a bank; (d) a research assistant that reads papers and runs analysis code. State users, volume, and the cost of a wrong or unsafe answer. The cost of error decides almost every later choice." },
      { title:'2. Draw the architecture in words', md:"List components (ingest, retrieval, models, tools, memory, guardrails, human review) and the data that moves between them. For each major choice name the alternative you rejected and why: single agent vs multi-agent, long context vs retrieval, cascaded vs speech-native, and so on. Mrs Anne's test: could a colleague disagree with a specific sentence?" },
      { title:'3. Threat-model it', md:"Use a table or list: asset, attacker, entry point, attack, mitigation, residual risk. Do not forget that anything the system *reads* (documents, web pages, tool results, emails, images) is an entry point. Apply least privilege and separate what is read from what may be acted on. Mitigations reduce risk; say what remains." },
      { title:'4. Analyse failures', md:"Write at least six failure modes. Good ones are specific: ‘retriever returns the superseded version of a policy because both are indexed’, not ‘the model hallucinates’. For each: cause, how you would notice, and what you do. Include at least one silent failure (nothing errors, the answer is wrong)." },
      { title:'5. Design the evaluation', md:"Separate component evaluation (retrieval recall@k, transcription word error rate, tool-call accuracy) from end-to-end evaluation (task success, safety violations). Say how you build the test set, who labels it, where judges are models and how you check those judges, and what threshold gates a release. Include adversarial cases written by someone trying to break it." },
      { title:'6. Do the arithmetic', md:"Pick one quantity that could sink the design and compute it: KV-cache memory for your concurrency, end-to-end latency against a budget, or monthly token cost at your volume. Show assumptions and units. A wrong-by-10x estimate that is shown honestly is more useful than an unexplained one." },
      { title:'7. Rollout, oversight and open questions', md:"Describe staged rollout, monitoring, a kill switch, rollback, and which actions need human approval. Finish with what you do not know and what evidence would change your mind." }
    ],
    hints:[
      'If you are stuck on the threat model, list everything the system reads from outside your control, then ask what the worst thing is that text in each of those could make the system do.',
      'A failure mode without a detection method is only half a failure mode. Ask: what metric or log line would show this happened?',
      'For the estimate, write the formula first (for KV cache: 2 x layers x KV heads x head dimension x tokens x bytes x concurrent sequences), then substitute assumed numbers.',
      'Structure your review with headed sections: Context, Architecture, Design decisions, Threat model, Failure analysis, Evaluation, Capacity estimate, Rollout and oversight, Open questions. Then go back and make each section cite a trade-off.'
    ],
    success:[
      'A reader can tell what would make the system unsafe to ship, and the review says so.',
      'Every major design decision names a rejected alternative and the reason.',
      'The threat model covers indirect prompt injection and states residual risk, not only mitigations.',
      'The evaluation plan separates components from end-to-end, includes adversarial cases, and defines a release gate.',
      'At least one numeric estimate is shown with assumptions and units.',
      'Uncertain claims are labelled as uncertain and open questions are stated.'
    ],
    checks:[
      { id:'len', label:'At least 900 words', type:'minWords', n:900, hint:'An architecture review of a hard system needs depth; expand failure analysis and evaluation.' },
      { id:'sections', label:'At least 7 headed sections', type:'sections', n:7, hint:'Use lines starting with # for Context, Architecture, Threat model, Failure analysis, Evaluation, Capacity, Rollout, Open questions.' },
      { id:'threat', label:'Mentions a threat model and prompt injection', type:'regex', pattern:'threat model[\\s\\S]*injection|injection[\\s\\S]*threat model', flags:'i', hint:'Include a threat model section that discusses (indirect) prompt injection.' },
      { id:'failure', label:'Discusses failure modes with detection', type:'regex', pattern:'failure mode[\\s\\S]*(detect|monitor|alert)', flags:'i', hint:'List failure modes and how each is detected.' },
      { id:'eval', label:'Evaluation covers recall or accuracy and a release gate', type:'regex', pattern:'(recall|precision|accuracy|success rate)[\\s\\S]*(threshold|gate|release)', flags:'i', hint:'State metrics and the threshold that gates release.' },
      { id:'tradeoff', label:'Names rejected alternatives', type:'regex', pattern:'(alternative|instead of|rather than|rejected)', flags:'i', hint:'Justify at least three choices against alternatives you rejected.' },
      { id:'numbers', label:'Shows an estimate with arithmetic', type:'regex', pattern:'\\d[\\d,.]*\\s*(x|×|\\*|/|=)\\s*\\d', flags:'i', hint:'Show the calculation, for example tokens x bytes x sessions = memory.' },
      { id:'rollback', label:'Includes rollback or kill switch and human oversight', type:'regex', pattern:'(rollback|kill switch)[\\s\\S]*(human|approval|review)|(human|approval|review)[\\s\\S]*(rollback|kill switch)', flags:'i', hint:'Describe rollback/kill-switch and the points where a person approves.' }
    ],
    rubric:[
      { criterion:'Problem framing and stakes', lookFor:'Users, volume and cost of error are explicit and later decisions follow from them.' },
      { criterion:'Architecture and trade-offs', lookFor:'Components and flows are clear; each major choice is justified against a named alternative with an honest downside.' },
      { criterion:'Threat model', lookFor:'Assets, attackers, entry points (including content the system reads), mitigations and residual risk; least privilege applied; no claim that injection is solved.' },
      { criterion:'Failure analysis', lookFor:'Six or more specific failure modes with cause, detection and response, including a silent failure.' },
      { criterion:'Evaluation strategy', lookFor:'Component and end-to-end metrics, test-set construction, adversarial cases, judge validation, release gate, regression plan.' },
      { criterion:'Quantitative reasoning', lookFor:'A correct, assumption-labelled estimate that influences the design.' },
      { criterion:'Epistemic honesty', lookFor:'Claims sourced or marked uncertain; contested points presented fairly; open questions named.' }
    ],
    extensions:[
      'Write a one-page rebuttal as a sceptical reviewer, then revise your design in response.',
      'Compare two architectures for the same system on a cost-versus-risk chart and defend your choice.',
      'Design the red-team exercise: who attacks, with what instructions, what counts as a finding.'
    ],
    est:'3 hours'
  }
];
