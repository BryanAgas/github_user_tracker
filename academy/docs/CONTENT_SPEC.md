# Mrs Anne Academy — content contract

Everything students read is data in `academy/js/content/*.js`. The engine (owned by Mrs Anne) renders it.
**Do not edit anything outside your own file(s).** Run `node academy/tools/validate-content.mjs` before you finish; it must pass for your file.

## Voice and pedagogy

- Voice: Mrs Anne — a warm, sharp headteacher who respects the student. British spelling. Plain language first, jargon second (define it the moment it appears). No hype, no buzzword soup, no "revolutionary".
- Every lesson follows: **Hook → Explain (plain) → Show (interactive) → Try (student acts) → Check (quiz) → Apply → Takeaways.**
- Teach *why it works*, not button-pressing. Use one concrete running example per lesson.
- Every lesson needs at least one interactive moment (`widget`, `predict`, `try`, or `code` exercise) *before* the quiz.
- Accuracy matters. If unsure, use WebSearch/WebFetch for authoritative sources (papers, official docs). Never invent paper titles, URLs, benchmark numbers or API names.
- **Established concepts vs current tools.** Permanent lesson text teaches durable concepts only. Anything that changes quickly (named models, products, prices, versions, benchmark rankings, API parameter names, context-window sizes) goes in a `current` entry (see below) referenced by a `{t:'current', key}` block — never hard-coded in permanent prose. In permanent prose say "a typical large language model" not a product name. Product names are allowed as *examples inside `current` entries* only.
- Use only plain facts you can defend. When something is contested or uncertain, say so.
- Each level also teaches responsible use where relevant (privacy, bias, verification, security).

## File shape — `academy/js/content/l{N}.js`

```js
export default {
  skills: [ { id:'l0.what-is-ai', name:'What AI is', desc:'one line' }, ... ],   // 8–14 per level; ids start "l{N}."
  lessons: [ Lesson, ... ],        // 7–10 per level, in teaching order
  projects: [ Project, ... ],      // L0–L6: exactly 1 capstone each; L7: 6–8 builder projects
  glossary: [ { term, def, level:N, see:['other term'] }, ... ],   // 12+ per level, def ≤ 40 words, plain language
  current: { 'key-name': { title, asOf:'2026-10', md:'...', sources:[{label,url}] } }   // volatile material only
};
```

### Lesson

```js
{
  id:'l0-01',                // l{N}-{NN}; unique, never reused
  title:'…', hook:'one-sentence reason to care',
  minutes: 12,
  skills:['l0.what-is-ai', ...],     // skill ids from your file (or earlier levels) this lesson teaches
  core: true,                // essential for every path
  code: false,               // true if the lesson needs the student to program
  deep: false,               // true = optional depth for advanced paths
  blocks: [ Block, ... ],
  reteach: [ { style:'analogy'|'simple'|'step-by-step'|'technical', md:'…' }, ... ],   // ≥2, at least one 'analogy' or 'simple'. Used when the student says "I'm confused": must explain the SAME idea a different way, not repeat.
  quiz: [ Question, ... ],   // ≥4, ≥2 different types, difficulties spread 1–3, every skill in `skills` covered by ≥1 question
  takeaways: ['…', ...],     // 3–5 short bullets
  apply: 'a 5-minute real-world task the student can do outside the app (optional but encouraged)'
}
```

### Blocks (`t` is the type)

| t | fields | notes |
|---|---|---|
| `p` | `md` | inline markdown only: `**bold**`, `*italic*`, `` `code` ``, `[text](https://…)`. One idea per paragraph. |
| `h` | `text` | subheading |
| `list` | `items:[md]`, `ordered?:bool` | |
| `steps` | `items:[{title, md}]` | numbered walk-through |
| `callout` | `kind:'tip'|'warn'|'why'|'analogy'|'misconception'`, `title?`, `md` | use `misconception` to name and kill a common wrong belief |
| `widget` | `w:'name'`, `props:{}`, `caption?`, `skill?` | interactive widget from `docs/WIDGETS.md`. Only use widgets listed there. |
| `predict` | `q`, `options:[…]`, `answer:int`, `explain`, `skill?` | "commit to a guess first" mini-check, shown *before* the explanation. Light evidence. |
| `try` | `prompt`, `sample` | free-response; student writes, then sees `sample` (model answer, md). Not scored. |
| `reveal` | `label`, `md` | click-to-reveal |
| `code` | `lang`, `src`, `caption?` | display only (use template literal; no backticks or `${` inside). Python/JS/JSON/bash allowed for *display*. |
| `compare` | `title?`, `cols:[…]`, `rows:[[…]]` | small table, cells are inline md |
| `current` | `key` | renders `current[key]` (yours or any other level's) in a clearly badged "Current practice — as of {asOf}" box |

String rules: write `md`/text fields as **double-quoted single-line strings** (so inline backticks are safe). Use template literals only for `code.src`, `starter`, `solution`. No raw HTML anywhere.

### Questions

All questions: `id` (`l0-01-q1`, unique), `skill` (a skill id), `type`, `q`, `difficulty` (1 easy–3 hard), `hints` (array: first nudge, then a stronger hint — ≥1, ideally 2), `explain` (why the right answer is right AND what the tempting wrong answer gets wrong), optional `placement:true` (use on exactly 1–2 questions per level that a knowledgeable person would get right and a novice would likely miss — used for the onboarding level check; must be self-contained, no widget needed).

```js
{type:'mcq',   q, code?, options:[…3–5], answer:int, wrong?:{ '0':'why option 0 tempts but fails' }}
{type:'multi', q, options:[…], answer:[int,…]}          // select all that apply
{type:'order', q, items:[…in CORRECT order…]}            // UI shuffles
{type:'short', q, accept:['regex','regex'], model:'a model answer'}   // case-insensitive regexes; be generous with synonyms
{type:'code',  q, fnName, starter, tests:[{args:[…json…], expect:json}], solution}   // JavaScript only; pure function; tests ≥3 incl. an edge case
```

- Prefer scenario questions ("A team does X… what should they do?"), debugging ("what is wrong with this prompt/code?"), architecture decisions, and *predict-the-output* over definition recall. At most one in three questions may be pure recall.
- Wrong options must be plausible misconceptions, never silly.
- `code` questions: JavaScript, pure functions of JSON arguments, no DOM, no network, no async. They run in a sandboxed worker with a 2 s timeout. For API-ish topics, have students write the *logic* around calls (parse a response, build a messages array, retry/backoff schedule, cosine similarity, chunking, tool-dispatch over a transcript) — tests pass the "model output" in as JSON.

### Project

```js
{
  id:'p0', level:0, title, objective, skills:[ids],
  kind:'text'|'code',      // what the student submits
  requirements:[ 'checklist items the student ticks off' ],
  guidance:[ {title, md} ],             // step-by-step, scaffolded
  hints:[ 'stronger and stronger — last one nearly gives the approach' ],
  success:[ 'observable success criteria' ],
  checks:[ {id, label, type:'regex'|'minWords'|'maxWords'|'sections', pattern?, flags?, n?, hint} ],   // automated checks on text projects (regex must match; sections: n distinct lines starting with '#' or 'Section:')
  // for kind:'code': fnName, starter, tests:[{args, expect, label}]
  rubric:[ {criterion, lookFor} ],      // used by the AI/local reviewer
  extensions:[ 'harder follow-ups' ],
  est:'45 min'
}
```
Projects progress SIMPLE → PRACTICAL → REALISTIC → PRODUCTION-LIKE across levels. Level 7 projects are real products (assistant, research agent, RAG knowledge system, voice app, automation, multi-agent system, AI SaaS, evaluation system, production app). Because the browser cannot call model APIs without the student's key, L7 projects are *specification + design + implementation-plan + test-plan + evaluation* deliverables (kind 'text') plus kind 'code' parts for the pure logic (e.g. a retrieval ranking function, an eval scorer, a router). Give real, runnable-outside-the-app starter guidance in `guidance` (Python/JS snippets as display), and make success criteria demand evidence (eval results, failure analysis), not vibes.

### `current` entries

`current['models-landscape'] = { title:'How to choose a model right now', asOf:'2026-10', md:'…', sources:[{label,url}] }`. `md` may use paragraph-level inline markdown with `\n\n` between paragraphs and lines starting with `- ` for bullets. Always state what is likely to go stale. Verify with web sources and cite them. Do not quote prices or leaderboard ranks; describe how to *check* them.

## Level map (Mrs Anne's curriculum — stay in your lane, but you may reference other levels)

- L0 AI Foundations: what AI is · ML · neural nets · generative AI · LLMs · tokens · context · training vs inference · hallucination · strengths/limits · responsible AI
- L1 Using AI Well: prompting fundamentals · context · instructions · examples · structured outputs · reasoning tasks · research · writing · analysis · images · coding · productivity · verification
- L2 Advanced AI Use: prompt architecture · tool use · workflows · automation · memory · context engineering · agentic workflows · multi-agent · evaluation · human-in-the-loop
- L3 AI Development: APIs · JS/Python basics as needed · model APIs · structured outputs · function/tool calling · embeddings · vector DBs · retrieval · RAG · streaming · multimodal · app architecture
- L4 Advanced AI Engineering: agent architecture · orchestration · planning · memory systems · retrieval strategies · eval frameworks · guardrails · observability · cost · latency · caching · reliability · deployment · security
- L5 Models & ML: transformers · attention · embeddings · training · fine-tuning · RL · RLHF/preference optimisation · model evaluation · data quality · open-source models · running models · model selection
- L6 Expert: advanced RAG · graph RAG · long context · multi-agent architectures · computer-use agents · voice AI · vision · reasoning systems · AI infrastructure · model serving · safety · alignment · research literacy
- L7 AI Builder: real products (see Project)

Each level's first lesson should briefly bridge from the previous level ("what you can already do; what's missing"). Each level's last lesson should prepare the capstone.
