export const skills = [
  { id:'l2.prompt-architecture', name:'Prompt architecture', desc:'Layer instructions, templates and data so a prompt is a maintainable component, not a one-off message.' },
  { id:'l2.injection', name:'Prompt injection awareness', desc:'Recognise that text the model reads can carry instructions, and design so that matters less.' },
  { id:'l2.tool-use', name:'How tool use works', desc:'Explain a tool call: the model asks, the program acts, the result goes back in.' },
  { id:'l2.tool-design', name:'Tool design and permissions', desc:'Choose, describe and limit tools so mistakes stay small and reversible.' },
  { id:'l2.workflow-patterns', name:'Workflow patterns', desc:'Choose between chaining, routing, parallelisation and gates for a given job.' },
  { id:'l2.automation', name:'AI automation', desc:'Use triggers and schedules sensibly, and know when not to automate.' },
  { id:'l2.memory', name:'Memory design', desc:'Decide what an AI system remembers, where, for how long, and with what privacy limits.' },
  { id:'l2.context-engineering', name:'Context engineering', desc:'Decide what goes into the window: retrieval vs stuffing, ordering, compaction.' },
  { id:'l2.agents', name:'Agentic workflows', desc:'Tell agents from workflows and reason about the plan, act, observe loop.' },
  { id:'l2.autonomy', name:'Autonomy levels', desc:'Match the amount of freedom given to an AI system to the cost of its mistakes.' },
  { id:'l2.multi-agent', name:'Multi-agent systems', desc:'Judge when splitting work between several agents helps and when it only adds cost.' },
  { id:'l2.evaluation', name:'Evaluation sets', desc:'Build a small, honest eval set with a rubric and use it to catch regressions.' },
  { id:'l2.judge-pitfalls', name:'Judging AI output', desc:'Use model-as-judge carefully, knowing its biases and when to check it against humans.' },
  { id:'l2.human-in-loop', name:'Human-in-the-loop', desc:'Place approval gates and escalation paths, and keep accountability with a person.' },
  { id:'l2.workflow-design', name:'Designing a workflow end to end', desc:'Turn a real job into steps, failure modes, evals and checkpoints.' }
];

export const glossary = [
  { term:'System prompt', def:'The standing instructions an application gives the model before any user input: role, rules, tone, limits. Written by the builder, usually hidden from the end user.', level:2, see:['Developer message','Prompt template'] },
  { term:'Developer message', def:'In some model interfaces, an instruction layer between the platform defaults and the end user, set by whoever builds the app. Providers name and rank layers differently, so check the documentation.', level:2, see:['System prompt'] },
  { term:'Prompt template', def:'A prompt with named slots, such as {customer_message}, filled in at run time. It lets one tested prompt serve many inputs and makes changes trackable.', level:2, see:['System prompt'] },
  { term:'Prompt injection', def:'Text the model reads, such as an email or web page, that contains instructions the model may follow as if they came from its owner. It cannot be fully prevented by wording alone.', level:2, see:['Indirect prompt injection','Least privilege'] },
  { term:'Indirect prompt injection', def:'Prompt injection where the hostile instruction is hidden in content the system fetches by itself, such as a document, web page or tool result, rather than typed by the user.', level:2, see:['Prompt injection'] },
  { term:'Tool call', def:'A structured request from the model asking the surrounding program to run a named function with given arguments. The model does not run anything; the program decides whether and how to act.', level:2, see:['Tool result','Least privilege'] },
  { term:'Tool result', def:'The output of a tool, sent back into the model context so it can continue. It is data to be read, not a trusted instruction.', level:2, see:['Tool call'] },
  { term:'Least privilege', def:'Give a tool or agent only the permissions the job needs, and no more. A read-only tool cannot delete anything, however badly it is misled.', level:2, see:['Approval gate'] },
  { term:'Prompt chaining', def:'Splitting a job into a fixed sequence of model calls, each taking the previous output as input, often with a check between steps.', level:2, see:['Routing','Gate'] },
  { term:'Routing', def:'A first step classifies the input and sends it down the matching specialised path, such as billing, technical or complaint handling.', level:2, see:['Prompt chaining'] },
  { term:'Parallelisation', def:'Running several model calls at once, either on different parts of a job (sectioning) or on the same task several times to compare answers (voting).', level:2, see:['Prompt chaining'] },
  { term:'Gate', def:'A check between workflow steps that must pass before the next step runs. It may be a rule, a model check or a human decision.', level:2, see:['Approval gate'] },
  { term:'Trigger', def:'The event that starts an automation: a schedule, a new email, a form submission, a file arriving. Choosing the trigger decides how often, and how unexpectedly, the AI runs.', level:2, see:['Idempotent'] },
  { term:'Idempotent', def:'Safe to run twice: repeating the step gives the same end state. Automations need this because triggers sometimes fire twice or a step is retried.', level:2, see:['Trigger'] },
  { term:'Long-term memory', def:'Information deliberately saved outside the context window, such as notes or preferences, and retrieved in later sessions. It exists only if someone designed it.', level:2, see:['Context window'] },
  { term:'Context engineering', def:'Deciding what information enters the model context for each step, in what order and in what form, so that the model has what it needs and little that distracts.', level:2, see:['Compaction','Retrieval'] },
  { term:'Compaction', def:'Replacing a long history with a shorter summary or set of notes to free context space, accepting that some detail is lost.', level:2, see:['Context engineering'] },
  { term:'Retrieval', def:'Looking up only the relevant pieces from a larger store and placing them in the context, instead of pasting everything in.', level:2, see:['Context engineering'] },
  { term:'Agent', def:'A system in which the model decides its own next steps and tool use in a loop until it judges the goal met, rather than following a fixed path written in advance.', level:2, see:['Workflow','Autonomy level'] },
  { term:'Workflow', def:'A system where model calls and tools follow paths decided in advance by a designer. More predictable and testable than an agent, but less flexible.', level:2, see:['Agent'] },
  { term:'Autonomy level', def:'How much an AI system may do without asking: suggest only, act with approval, act and report, or act freely. Set by the cost of mistakes, not by confidence.', level:2, see:['Approval gate'] },
  { term:'Orchestrator', def:'In a multi-agent setup, the component that splits a task, hands parts to other agents or workers, and combines their results.', level:2, see:['Handoff'] },
  { term:'Handoff', def:'Passing a task and the context needed for it from one agent or step to another, or to a human. Information missing at the handoff is lost for good.', level:2, see:['Orchestrator'] },
  { term:'Eval set', def:'A fixed collection of test inputs, with notes on what a good result looks like, run against a prompt or workflow to measure quality and catch regressions.', level:2, see:['Rubric','Regression'] },
  { term:'Rubric', def:'A short list of criteria, each with a clear description of pass and fail, used to score outputs consistently.', level:2, see:['Eval set'] },
  { term:'LLM-as-judge', def:'Using a model to score another model output against a rubric. Fast and cheap, but it has biases and must be checked against human judgement.', level:2, see:['Rubric'] },
  { term:'Regression', def:'A change that makes something that used to work stop working. Re-running the eval set after every prompt or model change is how you notice.', level:2, see:['Eval set'] },
  { term:'Approval gate', def:'A point where the system pauses and a named person must approve before an action with real consequences goes ahead.', level:2, see:['Gate','Automation bias'] },
  { term:'Automation bias', def:'The human tendency to accept a machine suggestion without proper checking, especially when it is usually right. It can turn an approval gate into a rubber stamp.', level:2, see:['Approval gate'] }
];

export const current = {
  'tool-protocols': {
    title:'How tools get connected to models right now',
    asOf:'2026-10',
    md:"Every major model provider offers some form of tool (or function) calling: you describe tools with a name, a description and a schema of arguments; the model replies with a structured request; your program runs it. The concept in this lesson is stable. The wrappers around it are not.\n\nOne widely discussed open standard is the Model Context Protocol (MCP), introduced by Anthropic in late 2024 as a common way for AI applications (clients) to connect to tools and data sources (servers), so that one integration can be reused across applications. Treat it as an example of the direction of travel: standard connectors rather than one-off glue code.\n\nLikely to go stale: which protocols are dominant, the names of parameters and message formats, which products support which connectors, and the security guidance around third-party connectors. To check: read the protocol specification and your provider's tool-use documentation, and ask who wrote any connector you install, because a connector is code that can act on your behalf.",
    sources:[
      { label:'Anthropic: Introducing the Model Context Protocol', url:'https://www.anthropic.com/news/model-context-protocol' },
      { label:'Model Context Protocol documentation', url:'https://modelcontextprotocol.io' }
    ]
  },
  'workflow-vocabulary': {
    title:'How people name workflows and agents right now',
    asOf:'2026-10',
    md:"The split used in this level, workflows (paths set in advance by code) versus agents (the model directs its own process and tool use), follows Anthropic's engineering essay on building effective agents. It lists five common workflow patterns: prompt chaining, routing, parallelisation, orchestrator-workers and evaluator-optimiser.\n\nNot everyone uses these words the same way. Some vendors call anything with a tool an 'agent'; some tools market a fixed no-code flow as an 'agentic' feature. When you read a product page, ignore the label and ask the durable question: who decides the next step, a person's design or the model at run time?\n\nLikely to go stale: the labels, the products that offer visual flow builders, and the claims about how autonomous they are. The question above will not.",
    sources:[
      { label:'Anthropic: Building effective agents', url:'https://www.anthropic.com/engineering/building-effective-agents' }
    ]
  },
  'long-context-reality': {
    title:'What research says about long context, and what to check yourself',
    asOf:'2026-10',
    md:"A well-known 2023 study (Liu and colleagues, 'Lost in the Middle') found that models tended to use information best when it sat at the start or end of a long input, and worse when it sat in the middle, and that accuracy fell as inputs grew. Newer models have since been trained to cope better with long inputs, and how much better varies by model and task.\n\nSo do not rely on either the old finding or a vendor's claim. Likely to go stale: how large the windows are, how well each model uses them, and what long inputs cost. To check: put one key fact at the start, middle and end of a long input from your own work, ask a question that needs it, and see what your model does. That ten-minute test is your own small eval.",
    sources:[
      { label:'Liu et al., Lost in the Middle: How Language Models Use Long Contexts (arXiv:2307.03172)', url:'https://arxiv.org/abs/2307.03172' }
    ]
  },
  'injection-guidance': {
    title:'Where prompt-injection guidance stands',
    asOf:'2026-10',
    md:"The OWASP project that maintains the Top 10 risks for LLM applications lists prompt injection as its first entry, covering both direct attempts (typed by a user) and indirect ones (hidden in content the system reads). Its advice centres on controls around the model: limiting privileges, validating outputs, separating untrusted content and requiring human approval for high-impact actions.\n\nThere is no known complete fix at the model level, so treat any vendor claim of 'injection-proof' with scepticism. Likely to go stale: the numbering and wording of the list, and the specific detection tools on offer. To check: read the current OWASP entry and your provider's security guidance before giving any system power to act on untrusted text.",
    sources:[
      { label:'OWASP GenAI Security Project: LLM01 Prompt Injection', url:'https://genai.owasp.org/llmrisk/llm01-prompt-injection/' }
    ]
  }
};
