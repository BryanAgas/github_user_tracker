# Widget contract

A widget is an ES module at `academy/js/widgets/<name>.js`:

```js
export const meta = { name:'tokenizer', title:'Token visualiser', blurb:'one line', level:0, skills:['l0.tokens'] };
export function mount(el, props = {}, ctx = {}) {
  // build DOM inside `el` (already empty). Return an optional cleanup function.
  return () => { /* clear timers, listeners on window/document */ };
}
```

`ctx` (all optional, always guard): `ctx.evidence(skillId, score0to1, weight=1)` records learning evidence (use only where the widget truly tests understanding, with `props.skill`); `ctx.announce(text)` posts to an aria-live region.

`widgets/index.js` (owned by Mrs Anne) registers widgets from the list below — **do not edit it**. Just create your files; if `meta.name` matches the registry the engine lazy-loads it.

## Rules

- Vanilla JS, **no dependencies, no network, no `eval`, no `innerHTML` with unescaped data** (use `textContent` / `createElement`; a tiny `h(tag, attrs, ...kids)` helper is fine inside your file).
- CSS: write to your own stylesheet `academy/css/widgets-<a|b>.css` (given in your brief). Class names prefixed `w-<widgetname>-` or `w-`. Use ONLY these theme variables (defined in `css/tokens.css`, light + dark): `--bg --surface --surface-2 --ink --ink-soft --line --brand --brand-ink --accent --good --warn --bad --radius --radius-sm --shadow --font --font-display --mono`, plus `--brand-soft --accent-soft --good-soft --warn-soft --bad-soft` for tinted backgrounds. Never hard-code colours except inside canvases where you read them via `getComputedStyle(document.documentElement)`. Redraw canvases when the colour scheme changes (listen to `matchMedia('(prefers-color-scheme: dark)')`) and on resize (`ResizeObserver`).
- **Accessible**: every control is a real `<button>`/`<input>`/`<select>` with a visible label; keyboard operable (drag interactions must have a keyboard alternative, e.g. arrow keys or buttons); focus visible; don't convey meaning by colour alone; honour `prefers-reduced-motion` (no auto-animation; offer Play/Step buttons); canvases get `role="img"` + `aria-label` and a text summary in a sibling `aria-live="polite"` element that updates on interaction.
- **Mobile**: usable at 360px width (stack columns, ≥44px touch targets, `touch-action` set sensibly for drag, never horizontal page scroll). Containers are fluid: `width:100%`, canvases sized from `el.clientWidth` × devicePixelRatio.
- **Honest**: anything simulated/toy must say so in a small visible note ("Toy model: real tokenisers learn ~100k pieces…"). Never present canned output as real model output. Never use real vendor prices.
- Every widget starts in an interesting state (don't open on blank) and has a "Reset" where state accumulates. Include a one-line "Try this:" prompt to invite experimentation.
- Compute real things where the point is the computation (training a tiny net, TF-IDF retrieval, softmax, cosine). Deterministic seeded RNG (mulberry32) so behaviour is reproducible.
- Keep each file < ~500 lines. Export `meta` and `mount` only.

## Catalogue and props

### Batch A (VISUALIZER-A → `css/widgets-a.css`)

| name | props | what it shows |
|---|---|---|
| `tokenizer` | `{text?}` | Type text → coloured tokens with ids using a TOY greedy sub-word tokenizer (built-in vocab of ~300 common pieces + byte fallback); counts tokens/chars/words; shows that spaces, rare words, numbers, and non-English text split differently. |
| `nextword` | `{scenario?:'sky'|'doctor'|'code'}` | The core LLM idea: probabilities for the next token for a few hand-authored prompts. Temperature slider reshapes the distribution (real softmax over logits); top-p/top-k toggles; "Sample 10 continuations" button; shows greedy vs sampled. |
| `contextwindow` | `{size?:number}` | A chat fills a fixed token budget; slider shrinks/grows the window; oldest turns visibly fall out; a question about an early fact fails when it has fallen out. Shows "what the model can see". |
| `attention` | `{sentence?:'it'|'bank'|'cat'}` | Pick a word; heat bars show how strongly it "looks at" other words (hand-authored toy weights, labelled as such); toggle several "heads" with different roles. |
| `dotproduct` | `{}` | Two draggable 2-D arrows (mouse/touch + arrow keys); shows dot product, cosine similarity, angle; then a mini attention calc: 1 query vs 3 keys → scores → softmax → weighted sum. |
| `embeddings` | `{mode?:'neighbors'|'analogy'|'search'}` | 2-D map (hand-placed toy vectors for ~40 words in clusters) + cosine nearest neighbours on click; analogy mode (king − man + woman); search mode ranks words by similarity to a typed/picked word. States clearly that real embeddings have hundreds–thousands of dimensions. |
| `neuron` | `{}` | One artificial neuron: 3 inputs, weights, bias sliders, activation (step/sigmoid/ReLU), output meter, and a "make it say yes only when…" mini-challenge. |
| `nnplayground` | `{dataset?:'xor'|'circle'|'linear'|'spiral'}` | Tiny MLP (1–2 hidden layers, 2–8 units, tanh) actually trained in JS on 2-D points; decision-region canvas; loss curve; sliders: units, learning rate; buttons Train/Step/Reset/New data. Real maths. |
| `gradient` | `{}` | Ball rolling on a 1-D loss curve and a 2-D contour; learning-rate slider showing too small / just right / diverging; Step/Play. |
| `sorter` | `{title, buckets:[str], items:[{text,bucket,why}], skill?}` | Click/tap-to-assign (and drag) items into buckets; check button gives per-item feedback with `why`; calls `ctx.evidence(skill, fractionCorrect)` once on first check. |
| `claimcheck` | `{title, segments:[{text, claim?:bool, status?:'true'|'false'|'unverifiable', why?}], skill?}` | A passage of fluent text; student flags sentences they'd verify/doubt; reveal shows which were fabricated/true/unverifiable, scores precision/recall of their flags; evidence as `sorter`. |

### Batch B (VISUALIZER-B → `css/widgets-b.css`)

| name | props | what it shows |
|---|---|---|
| `flow` | `{nodes:[{id,label,x,y,note?,kind?:'input'|'process'|'store'|'model'|'tool'|'output'|'human'}], edges:[[from,to,label?]], steps?:[{show:[ids], text}], height?:number, title?}` | Generic SVG architecture/workflow diagram. x,y are 0–100 (percent). Nodes are draggable (pointer + arrow keys when focused) and click/Enter reveals `note`. If `steps` given: Prev/Next/Play walk-through highlights nodes/edges and shows `text`. This is the workhorse for agent loops, RAG pipelines, training loops, architectures. Must wrap long labels. |
| `ragdemo` | `{corpus?:'school'|'product'|'handbook'}` | Built-in small corpus of documents. Controls: chunk size, overlap, top-k, retrieval method (keyword / TF-IDF / "semantic" using toy embeddings). Type a question → chunks scored (real TF-IDF/BM25-ish) → assembled prompt shown → a templated extractive "answer" with citations. Includes a "break it" toggle set (chunks too small, k too low, ambiguous question) that visibly causes failures. |
| `agentloop` | `{scenario?:'trip'|'refund'|'data'}` | Step through a scripted agent run: Think → Act (tool call w/ args) → Observe → …; panels for goal, scratchpad/plan, tool results, and context size growing. Toggles: "inject tool failure", "ambiguous goal", "require human approval" — each changes the script so the student sees recovery/escalation. Clearly labelled scripted simulation. |
| `promptlab` | `{task?:'email'|'summary'|'extract'}` | Build a prompt from toggleable parts (role, context, task, constraints, output format, examples); live-assembled prompt text; a transparent rubric meter scoring completeness of the *prompt*; shows a pre-written SIMULATED response whose quality visibly changes with which parts are on. Clear note: "illustrative, not a real model". |
| `streaming` | `{}` | Sliders for time-to-first-token and tokens/sec; side-by-side "wait for full answer" vs "stream"; shows perceived latency; tokens appear on a Play button. |
| `costcalc` | `{}` | Calculator: requests/day, input/output tokens, **user-editable** price per million tokens (defaults clearly labelled "example numbers — enter your provider's"), cache hit %, retries %, → monthly cost, bar breakdown, and "what changes it most" sensitivity. |
| `evalmatrix` | `{}` | Confusion matrix + threshold slider over a fixed scored dataset (100 items with scores/labels): precision, recall, F1, false positives/negatives counts; ROC-ish curve with the current point; scenario selector (spam filter vs cancer screening vs content guardrail) that shows why the best threshold differs. |
| `jsonschema` | `{schema?, sample?}` | Left: editable JSON; right: schema (selectable presets); live validation with human-readable errors (type, required, enum, range, additionalProperties) — a real mini validator; examples of typical LLM structured-output mistakes (trailing prose, wrong type, missing field) with a "repair" lesson. |
| `rlgrid` | `{}` | Grid world; Q-learning agent actually trains (epsilon-greedy), shows value heat/arrows, reward editor (add trap/goal), speed slider, Step/Train/Reset; text summary of learned policy; shows reward hacking when a bad reward is chosen (preset). |
| `timeline` | `{events:[{year,title,text,kind?}], title?}` | Horizontal/vertical scrollable timeline with filter chips by kind; keyboard navigable; for AI history and for "how a request flows over time". |

### Mrs Anne's own widgets (engine) — you may *use* these in lessons

| name | props | |
|---|---|---|
| `codeplay` | `{starter, fnName?, tests?:[{args,expect}], hints?:[str], title?}` | JS editor + Run + tests in a sandbox worker. |
| `quizcard` | `{questionId}` | Embeds any question from the same lesson's `quiz` inline. |
