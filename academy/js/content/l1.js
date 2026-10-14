// Level 1: Using AI Well
import a from './l1/a.js';
import b from './l1/b.js';
import c from './l1/c.js';

export default {
  skills: [
    { id: 'l1.clarity', name: 'Clear requests', desc: 'State the task, audience and purpose so the model need not guess.' },
    { id: 'l1.context', name: 'Giving context', desc: 'Supply the background and source material the model cannot know.' },
    { id: 'l1.privacy', name: 'Protecting private information', desc: 'Decide what not to paste, and anonymise what you do.' },
    { id: 'l1.constraints', name: 'Instructions and constraints', desc: 'Control length, format and limits with testable rules.' },
    { id: 'l1.examples', name: 'Teaching by example', desc: 'Use few-shot examples that are correct, varied and consistent.' },
    { id: 'l1.structured', name: 'Structured outputs', desc: 'Ask for tables and JSON, and validate shape separately from truth.' },
    { id: 'l1.reasoning', name: 'Reasoning tasks', desc: 'Know when step-by-step helps and how to check the logic.' },
    { id: 'l1.research', name: 'Research with source discipline', desc: 'Use AI for leads, verify against real sources, avoid fake citations.' },
    { id: 'l1.writing', name: 'Writing and editing honestly', desc: 'Edit with AI while keeping your voice, accuracy and integrity.' },
    { id: 'l1.analysis', name: 'Analysing data and documents', desc: 'Know what to trust, and recompute what matters.' },
    { id: 'l1.multimodal', name: 'Working with images', desc: 'Use pictures as input and output, aware of limits and risks.' },
    { id: 'l1.coding', name: 'Coding with AI safely', desc: 'Get small scripts and formulas, test them, and read before running.' },
    { id: 'l1.workflow', name: 'Workflows and prompt libraries', desc: 'Turn what works into repeatable routines with a human check.' },
    { id: 'l1.verify', name: 'Verification habits', desc: 'Match checking to stakes and check against independent evidence.' }
  ],

  lessons: [...a, ...b, ...c],

  projects: [
    {
      id: 'p1', level: 1,
      title: 'Build a reusable prompt toolkit for a real task',
      objective: 'Choose a real, repeated task and build a tested, safe, reusable set of prompts for it, with before-and-after evidence and a verification log.',
      skills: ['l1.clarity', 'l1.context', 'l1.privacy', 'l1.constraints', 'l1.examples', 'l1.structured', 'l1.verify', 'l1.workflow'],
      kind: 'text',
      requirements: [
        'Pick a real task you do repeatedly (for example weekly updates, parent letters, meeting notes, study summaries, customer replies).',
        'Write a BEFORE prompt (your naive first attempt) and paste the output it produced, or an honest description of it.',
        'Write an AFTER prompt that states task, audience, purpose, context, constraints and a format, with at least one example.',
        'Paste the AFTER output and say what improved, and what is still wrong.',
        'Add a privacy note listing what you removed or never include.',
        'Provide a verification log with at least five claims or items checked, the independent source or method used, and the result.',
        'Finish with a reusable template with [BLANKS], a "when to use" note and a CHECK line.'
      ],
      guidance: [
        { title: 'Choose the task', md: "Pick something you really do, ideally weekly. A real task gives real evidence. Write two sentences: who the output is for and what it is for." },
        { title: 'Record a naive BEFORE', md: "Write the quick, vague prompt you would normally type. Run it with an assistant and paste the output. Do not polish it: the point is an honest comparison." },
        { title: 'Build the AFTER', md: "Use the parts from this level: task, audience, purpose, context (anonymised), labelled constraints that can be tested, a format, and one or two examples. Run it and paste the output." },
        { title: 'Check it properly', md: "List every checkable item in the AFTER output: names, dates, numbers, quotations, references. Check each against the source or by recomputing. Record claim, method, result. Include at least one thing you corrected or rejected." },
        { title: 'Write the privacy note', md: "Say what personal or confidential details you removed, how you replaced them, and what you would never paste for this task." },
        { title: 'Package the toolkit', md: "Write the final template with [BLANKS], a when-to-use note, the CHECK line, and one lesson learned. Anyone else should be able to pick it up." }
      ],
      hints: [
        'Use clear headings: ## Task, ## Before, ## After, ## What changed, ## Privacy, ## Verification log, ## Template.',
        'A verification log can be a simple list: Claim | Checked against | Result (correct / corrected / could not verify).',
        'If you cannot run an assistant, describe a realistic output and mark it as an example you wrote; but be honest about it.',
        'Your template should name the reader, the purpose and the limits in testable words, and end with a CHECK line saying what a human must verify every time.'
      ],
      success: [
        'The AFTER prompt is visibly more specific than the BEFORE and the improvement is explained, not just claimed.',
        'Constraints are testable (numbers, formats, named reader).',
        'The verification log checks against independent evidence and records at least one correction or an honest "could not verify".',
        'No personal or confidential data appears in the prompts.',
        'The template could be reused by someone else without further explanation.'
      ],
      checks: [
        { id: 'sections', label: 'Has at least 6 headed sections', type: 'sections', n: 6, hint: 'Use lines starting with # for Task, Before, After, What changed, Privacy, Verification log, Template.' },
        { id: 'words', label: 'At least 400 words', type: 'minWords', n: 400, hint: 'Include both prompts, outputs, your analysis, the log and the template.' },
        { id: 'before', label: 'Includes a BEFORE prompt', type: 'regex', pattern: '\\bbefore\\b', hint: 'Label your first, naive prompt as Before.' },
        { id: 'after', label: 'Includes an AFTER prompt', type: 'regex', pattern: '\\bafter\\b', hint: 'Label your improved prompt as After.' },
        { id: 'verify', label: 'Has a verification log', type: 'regex', pattern: 'verif(y|ication|ied)', hint: 'Add a verification log section listing claims, sources and results.' },
        { id: 'privacy', label: 'Has a privacy note', type: 'regex', pattern: '(privacy|personal data|anonymi[sz]|confidential|redact)', hint: 'State what you removed or never paste.' },
        { id: 'audience', label: 'Names an audience or reader', type: 'regex', pattern: '(audience|reader|for (parents|staff|students|customers|a ))', hint: 'Say who the output is for.' },
        { id: 'blanks', label: 'Template has [BLANKS] to fill', type: 'regex', pattern: '\\[[A-Za-z][^\\]]{1,40}\\]', hint: 'Use square-bracket placeholders such as [DATE] in the template.' },
        { id: 'check', label: 'Template includes a CHECK line', type: 'regex', pattern: '\\bcheck\\b', hint: 'Add a line saying what a human must verify each time.' }
      ],
      rubric: [
        { criterion: 'Prompt quality', lookFor: 'AFTER names task, audience, purpose, context, testable constraints, format and an example; clear improvement over BEFORE.' },
        { criterion: 'Evidence', lookFor: 'Real outputs (or honestly labelled examples) shown for both versions, with specific comparison.' },
        { criterion: 'Verification', lookFor: 'At least five items checked against independent sources or recalculation; includes a correction or admitted gap.' },
        { criterion: 'Privacy and integrity', lookFor: 'Sensitive details excluded; honest about AI use; no invented sources.' },
        { criterion: 'Reusability', lookFor: 'Template with blanks, when-to-use and CHECK line that a stranger could use.' }
      ],
      extensions: [
        'Test the template on three different inputs and note where it breaks.',
        'Add a structured-output (JSON or table) variant and a validation step.',
        'Ask a colleague to use the template without your help and record what they struggled with.',
        'Write a one-page guide for your team on safe AI use for this task.'
      ],
      est: '60-90 min'
    }
  ],

  glossary: [
    { term: 'Prompt', def: 'The text you give an assistant to tell it what you want, including instructions, context and examples.', level: 1, see: ['Context', 'Constraint'] },
    { term: 'Context', def: 'Background information supplied in the conversation: the situation, source text, earlier decisions and what success looks like.', level: 1, see: ['Prompt'] },
    { term: 'Constraint', def: 'A limit on the answer, such as length, format, order or tone. The best constraints are specific enough to check.', level: 1, see: ['Prompt'] },
    { term: 'Zero-shot', def: 'Asking for something without giving any worked examples in the prompt.', level: 1, see: ['Few-shot prompting'] },
    { term: 'Few-shot prompting', def: 'Including a few examples of input and ideal output in the prompt so the model copies the pattern.', level: 1, see: ['Zero-shot'] },
    { term: 'Structured output', def: 'An answer in a fixed, machine-readable shape such as a table or JSON, so other tools can use it.', level: 1, see: ['JSON', 'Schema'] },
    { term: 'JSON', def: 'A plain-text format for labelled data, made of named fields and values, that many programs can read.', level: 1, see: ['Schema'] },
    { term: 'Schema', def: 'A written description of the shape data must have: which fields exist, their types and allowed values.', level: 1, see: ['JSON', 'Validation'] },
    { term: 'Validation', def: 'Automatically checking that data matches a schema. It confirms the shape is right, not that the content is true.', level: 1, see: ['Schema'] },
    { term: 'Step-by-step prompting', def: 'Asking the model to write out intermediate steps before an answer, which can help on multi-stage problems.', level: 1, see: ['Reasoning task'] },
    { term: 'Reasoning task', def: 'A problem where the answer depends on a chain of dependent steps, such as multi-part calculations or planning.', level: 1, see: ['Step-by-step prompting'] },
    { term: 'Hallucination', def: 'A fluent, confident statement from a model that is false or unsupported, including invented facts and references.', level: 1, see: ['Source log'] },
    { term: 'Source log', def: 'A short record of each claim you use, where you checked it, when, and whether you verified it yourself.', level: 1, see: ['Verification'] },
    { term: 'Verification', def: 'Checking a claim or result against independent evidence, such as an original source or your own recalculation.', level: 1, see: ['Hallucination'] },
    { term: 'Multimodal', def: 'Able to work with more than one kind of input or output, such as text, images and files.', level: 1, see: [] },
    { term: 'Anonymisation', def: 'Removing or replacing names and identifying details before sharing text, for example calling a pupil “Pupil A”.', level: 1, see: ['Prompt'] },
    { term: 'Prompt library', def: 'A saved collection of your tested prompts, each with notes on when to use it and what to check.', level: 1, see: ['Prompt'] },
    { term: 'Over-reliance', def: 'Trusting or depending on AI output so much that you stop checking or practising your own skills.', level: 1, see: ['Verification'] }
  ],

  current: {
    'privacy-check': {
      title: 'Checking what a service does with your chats',
      asOf: '2026-10',
      md: "Services differ in what they keep, for how long, whether staff may review conversations, and whether chats may be used to improve their models. Consumer accounts, paid plans, school or workplace accounts and developer access are often treated differently, and settings and terms change.\n\nBefore relying on any assistant for work involving other people's information, find three things in the provider's own help or privacy pages: (1) whether your chats can be used for training and how to switch that off; (2) how long conversations are kept and whether deleting them removes them from backups; (3) whether temporary or private chat modes exist and what they actually do.\n\nSecondary articles that compare providers can be out of date or disagree with each other, so use the provider's own current pages and your organisation's policy. Switching off training generally affects future chats, not data already collected.\n\nWhat is likely to go stale: setting names and locations, default behaviours, retention periods, which account types are covered.",
      sources: [
        { label: 'Tom’s Guide: a comparison of chatbot privacy (secondary; check providers directly)', url: 'https://www.tomsguide.com/ai/i-compared-the-privacy-of-chatgpt-gemini-claude-and-perplexity-heres-the-one-you-should-trust-most-with-your-personal-info' },
        { label: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework' }
      ]
    },
    'reasoning-modes': {
      title: 'Built-in "thinking" modes and prompting for reasoning',
      asOf: '2026-10',
      md: "Many current assistants offer a mode in which the model spends extra effort working through a problem before answering. Providers' own guidance has been moving towards telling such models what the problem and success criteria are, rather than scripting every reasoning step, and suggests that older tricks such as \"think step by step\" can be unnecessary for them.\n\nThat guidance comes from secondary summaries as well as vendor documents and differs by provider and model, so treat it as a prompt to test rather than a rule. With a standard (non-thinking) mode, asking for explicit working still often helps on multi-step problems.\n\nWhichever mode you use, the checking routine does not change: recompute key numbers and test simple cases.\n\nWhat is likely to go stale: which assistants have a thinking mode, what it is called, whether it is on by default, and how much explicit step-by-step prompting still helps.",
      sources: [
        { label: 'Anthropic prompt engineering documentation', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' },
        { label: 'OpenAI prompt engineering guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering' },
        { label: 'Google Gemini prompting strategies', url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies' }
      ]
    },
    'search-features': {
      title: 'Assistants with web search and citations',
      asOf: '2026-10',
      md: "Many assistants can now search the web or a document set and show links beside their answers. Examples include search-enabled modes of general chat assistants and dedicated AI search tools. This helps because you can open the sources, but it does not make the summary trustworthy: the summary can still misstate a page, mix up dates or places, or lean on weak sources.\n\nTo check what your tool does, test it on a question where you already know the answer. See whether it shows sources by default, whether the links open real pages, and whether the pages say what the summary says.\n\nWhat is likely to go stale: which tools have search, whether it is on by default, how citations are displayed, and how often they are accurate. Test your own tool occasionally rather than trusting reputation.",
      sources: [
        { label: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework' }
      ]
    },
    'multimodal-check': {
      title: 'What your assistant can currently do with files and images',
      asOf: '2026-10',
      md: "Capabilities differ widely between assistants and between free and paid plans: which file types can be uploaded, size limits, whether the assistant can run code to calculate on a spreadsheet, whether it can read handwriting, and whether it can generate images.\n\nBefore a real task, run a short test: upload a small file whose contents you know and ask a question with a known answer, including a count and a total. Ask it how it got the answer. This tells you whether it is reading all the data and whether it runs code or estimates.\n\nWhat is likely to go stale: file types and limits, whether code execution is available, image-generation features, and any rules about generating images of people.",
      sources: [
        { label: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework' }
      ]
    },
    'tools-check': {
      title: 'Choosing tools for code help',
      asOf: '2026-10',
      md: "Code help comes in several forms: general chat assistants, assistants built into editors or spreadsheets, and tools that can run code and show results. Tools that run code for you can check their own output, but you should still read what they did, especially for anything that changes files or sends data elsewhere.\n\nFor a non-programmer, a good first choice is whichever tool is already approved where you work, and which can explain code in plain language. Check your organisation's policy on pasting code or data into external services.\n\nWhat is likely to go stale: product names and features, what the built-in assistants in office suites can do, and what each plan includes.",
      sources: [
        { label: 'OWASP Top 10 for LLM applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' }
      ]
    }
  }
};
