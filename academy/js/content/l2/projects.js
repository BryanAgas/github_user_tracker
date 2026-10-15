export default [
{
  id:'p2', level:2,
  title:'Design a multi-step AI workflow for a real job',
  objective:"Produce a design document for a realistic multi-step AI workflow: architecture, tool and permission plan, context plan, failure-modes table, an eval set of at least ten cases and clearly placed human checkpoints.",
  skills:['l2.workflow-design','l2.workflow-patterns','l2.evaluation','l2.human-in-loop','l2.prompt-architecture','l2.context-engineering'],
  kind:'text',
  requirements:[
    "Names a real job (yours or a colleague's), its inputs, outputs, and what a good result looks like.",
    "Describes the architecture step by step, naming the pattern used for each (chain, routing, parallel, gate) and why.",
    "States the prompt layers: standing rules, template with slots, and which inputs are untrusted data.",
    "Lists tools, with read/write marked and permissions limited to what each step needs.",
    "Explains what goes in the context at each step, what is retrieved, and what is remembered (with privacy limits).",
    "Contains a failure-modes table with at least six rows: step, what could go wrong, how you would notice, how damage is limited.",
    "Contains an eval set of at least ten numbered cases, each with the expected result, including edge, must-escalate and trick cases.",
    "Places human checkpoints: what needs approval, what escalates, what the approver sees, who is accountable.",
    "States the autonomy level and the stopping/kill rules, and says what you would NOT automate."
  ],
  guidance:[
    { title:'Choose a job worth designing', md:"**How the checker reads your work.** Every section that starts with a # heading needs at least 25 words of ordinary sentences. Table rows and code lines do not count as sentences, so write a sentence or two under each table. Lines may not repeat, and the whole text has to read like real writing, not a list of keywords.\n\nPick something real with 3 to 6 steps: triaging support emails, preparing meeting minutes and actions, screening applications against a checklist, producing a weekly report from several sources. Avoid jobs where the whole value is a single clever answer." },
    { title:'Write the job card', md:"One paragraph: inputs, outputs, volume, who uses the result, and what a good result looks like. Add one sentence on the worst realistic mistake." },
    { title:'Draw the architecture in words', md:"List each step: what goes in, what the model or rule does, what comes out, which pattern it uses. Mark the gates. If you prefer, sketch it in the flow widget in Lesson 3 first and then describe it." },
    { title:'Prompt, tools and context', md:"For each model step give its standing rules and template slots. List tools and mark read or write. Say what is retrieved versus pasted, what is remembered, and how untrusted input is fenced." },
    { title:'Failure-modes table', md:"Use a markdown table with columns: Step | What could go wrong | How we notice | How damage is limited. Include at least one injection or bad-input row and one missing-input row." },
    { title:'Eval set', md:"Number the cases 1 to 10 or more. For each: the input (or a description), the type (typical, edge, escalate, trick), and the expected result written before you imagine the output." },
    { title:'Human checkpoints', md:"Say which action needs approval, what the approver sees, what escalates, who is accountable, and how you would test that the review is real." },
    { title:'Self-review', md:"Read it as a sceptical head teacher: where could this embarrass us? Add one sentence on what you would not automate and why." }
  ],
  hints:[
    "If you are stuck for a job, take any task where you copy information from one place, transform it and send it somewhere.",
    "The failure-modes table is easier if you walk the workflow and ask three questions of each step: bad input, wrong output, outside action.",
    "For the eval set, write the trick cases first (injection, empty input, contradicting data); they are the ones people forget.",
    "A checkpoint belongs immediately before the first action that is public, costly or irreversible. Mark that action first, then place the checkpoint just ahead of it."
  ],
  success:[
    "A reader could build the workflow from your document without asking you questions.",
    "Every step has a stated pattern and a stated failure mode.",
    "Eval cases have expected results that someone else could mark.",
    "At least one case is designed to skip automation and reach a person.",
    "The accountable person is named by role, and the approver's view is described."
  ],
  checks:[
    { id:'sections', label:'At least six distinct headed sections', type:'sections', n:6, hint:"Use lines starting with # for sections such as Job, Architecture, Prompts and tools, Context and memory, Failure modes, Eval set, Human checkpoints." },
    { id:'minwords', label:'At least 650 words', type:'minWords', n:650, hint:"A realistic design takes more than a page. Add detail to the failure modes and eval cases." },
    { id:'table', label:'Contains a failure-modes table', type:'regex', pattern:"\\|[^\\n]+\\|[^\\n]+\\|[^\\n]*\\n\\s*\\|?\\s*:?-{2,}", hint:"Include a markdown table with a header row and a separator row of dashes, e.g. | Step | Failure | Detection | Limit |." },
    { id:'failure-word', label:'Uses the words failure and detect/notice', type:'regex', pattern:"failure[\\s\\S]*(detect|notice|monitor)", hint:"Say how each failure would be noticed." },
    { id:'ten-cases', label:'Eval set has ten numbered cases, up to case 10', type:'regex', flags:'im', pattern:"(?=(?:[\\s\\S]*?^[ \\t]*\\|?[ \\t]*(?:[-*][ \\t]*)?(?:case[ \\t]*|test[ \\t]*)?#?\\d{1,2}[ \\t]*[.):\\-][^\\n]{15,}$){10})(?=[\\s\\S]*^[ \\t]*\\|?[ \\t]*(?:[-*][ \\t]*)?(?:case[ \\t]*|test[ \\t]*)?#?10[ \\t]*[.):\\-])", hint:"Number your cases 1 to 10 or more, one per line, each with its input and expected result on that line, e.g. '10. Input: ... Expected: ...'." },
    { id:'escalate', label:'Mentions escalation and approval', type:'regex', pattern:"(escalat)[\\s\\S]*(approv)|(approv)[\\s\\S]*(escalat)", hint:"Describe both what needs approval and what escalates to a person." },
    { id:'inject', label:'Considers prompt injection or untrusted input', type:'regex', pattern:"inject|untrusted", hint:"Say how outside text is fenced and what a hostile input could do." },
    { id:'accountable', label:'Names an accountable person or role', type:'regex', pattern:"accountab|responsib|owner", hint:"Name the role that owns the outcome." },
    { id:'parts', label:'Own headed parts for the architecture, the prompts and tools, and the human checkpoints', type:'regex', flags:'im', pattern:"(?=[\\s\\S]*^#+[ \\t]*[^\\n]*(?:architecture|workflow|pipeline))(?=[\\s\\S]*^#+[ \\t]*[^\\n]*(?:prompt|tool))(?=[\\s\\S]*^#+[ \\t]*[^\\n]*(?:checkpoint|oversight|approval|human))", hint:"Give the architecture, the prompts and tools, and the human checkpoints each their own heading starting with #, for example “# Architecture”, “# Prompts and tools”, “# Human checkpoints”." },
    { id:'autonomy', label:'States autonomy level or what is not automated', type:'regex', pattern:"autonom|not automat|will not automat|do not automat|never automat", hint:"State the autonomy level and one thing you will not automate." }
  ],
  rubric:[
    { criterion:'Fit of pattern to job', lookFor:'Each step uses a pattern that matches its need; no unnecessary agent or step; reasons given.' },
    { criterion:'Prompt and context design', lookFor:'Standing rules separated from template and untrusted data; context contents chosen deliberately; memory limited with privacy stated.' },
    { criterion:'Failure analysis', lookFor:'Specific, plausible failures including bad input, missing input and injection; detection and limits are concrete.' },
    { criterion:'Evaluation quality', lookFor:'Ten or more cases covering typical, edge, escalate and trick; expected results written in advance; critical cases identified.' },
    { criterion:'Human oversight', lookFor:'Checkpoints placed before the costly action; approver view described; accountability named; automation bias considered.' },
    { criterion:'Realism and honesty', lookFor:'Real job, honest limits, no overclaiming; says what will not be automated.' }
  ],
  extensions:[
    "Run your eval set by hand on a real AI tool, record pass/fail per case, and revise the design once.",
    "Add a cost estimate: calls per run, tokens per call, runs per month, using the cost calculator with your provider's real numbers.",
    "Write a one-page runbook: what the on-call person does when the failure alerts fire.",
    "Redesign the workflow at a lower autonomy level and at a higher one; argue which is right."
  ],
  est:'90 min'
}
];
