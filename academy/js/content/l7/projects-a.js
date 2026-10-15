// Level 7 projects p7a-p7d
import { SG, secWith, times, tableRows, caseLines, quotes, causes, mitigated, pct } from './check-helpers.js';
const pyCall = `# assistant.py : minimal, runnable outside the app (pip install anthropic)
# Any provider works the same way: a system message, the user's message, a limit on output.
# Keep the key and model name in environment variables, never in the code.
import os, json
import anthropic

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY from the environment
MODEL = os.environ["MODEL_NAME"]        # look up a current model name in your provider's docs

SYSTEM = (
    "You answer questions using ONLY the provided context. "
    "If the context does not contain the answer, reply exactly: I don't know. "
    "Cite the source id in square brackets after each claim."
)

def ask(question, context):
    msg = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system=SYSTEM,
        messages=[{"role": "user", "content": "Context:\\n" + context + "\\n\\nQuestion: " + question}],
    )
    return msg.content[0].text

if __name__ == "__main__":
    print(ask("When does the library close?", "[handbook p4] The library closes at 6pm on Fridays."))`;

const evalHarness = `# run_eval.py : run every case, save raw outputs, score simply
import json, sys
from assistant import ask

cases = [json.loads(l) for l in open(sys.argv[1])]
results = []
for c in cases:
    out = ask(c["input"], c["context"])
    ok = all(w.lower() in out.lower() for w in c.get("must_include", []))
    if c["category"] == "refuse":
        ok = "don't know" in out.lower()
    results.append({"id": c["id"], "category": c["category"], "pass": ok, "output": out})
json.dump(results, open("results.json", "w"), indent=2)
by = {}
for r in results:
    by.setdefault(r["category"], []).append(r["pass"])
for k, v in by.items():
    print(k, round(sum(v) / len(v), 2), "(" + str(len(v)) + " cases)")`;

export default [
  {
    id: 'p7a', level: 7,
    title: 'Build a scoped AI assistant: spec, eval and failure report',
    objective: "Design and build a narrow assistant for one real user group, and prove how well it works with a test set and an honest failure analysis.",
    skills: ['l7.scoping', 'l7.spec-writing', 'l7.eval-driven-dev', 'l7.failure-ux'],
    kind: 'text',
    requirements: [
      "Name a real first user and the job the assistant does for them",
      "Write a scope statement with an explicit out-of-scope list",
      "Write a six-part spec (users, inputs/outputs, rules, numeric quality bar, failure behaviour, constraints)",
      "Create an evaluation set of at least 30 cases with typical, edge, adversarial and should-refuse categories",
      "Run the assistant on the set (outside this app), record pass rate overall and per category",
      "Analyse at least five real failures: cause, fix attempted, result",
      "Describe the failure UX for timeout, no-result and malformed output",
      "State the cost per request you measured or estimated, with your assumptions",
    ],
    guidance: [
      { title: '1. Pick the user and write the scope', md: "Choose a group you can actually ask: a club, a class, a family business. Interview one person for five minutes. Write who, job, out of scope, success measure. If the out-of-scope list is empty, your scope is too big." },
      { title: '2. Write the spec and 30 cases before coding', md: "Fill the six parts. Then write cases as JSON lines: id, input, context, category, must_include. Include at least six should-refuse cases where the context genuinely lacks the answer, and four adversarial ones that try to break your rules." },
      { title: '3. Get a baseline running', md: "Run the starter below with your own API key. It is a deliberately plain version: that is your baseline number." },
      { title: 'Starter: the assistant', md: "Python, runnable on your machine. The system prompt carries the rules from your spec.\n\n```python\n" + pyCall.replace(/`/g, "'") + "\n```" },
      { title: 'Starter: the evaluation harness', md: "Each line of cases.jsonl is one test. Run: python run_eval.py cases.jsonl\n\n```python\n" + evalHarness.replace(/`/g, "'") + "\n```" },
      { title: '4. Read failures, change one thing, re-run', md: "Open every failure. Group by cause: wrong context, ignored rule, malformed answer, bad test. Change one thing per run (a rule, the context format, a length limit) and keep a before/after table. Check for regressions: previously passing cases that now fail." },
      { title: '5. Design the failure experience', md: "Write exactly what the user sees when: the model times out, nothing relevant is found, the output is unusable. Include the next step you offer them." },
      { title: '6. Write the report', md: "Headings: Problem and user, Scope, Spec, Evaluation set, Results (table), Failure analysis, Failure UX, Cost, Limits and next experiment." },
    ],
    hints: [
      "If everything passes on the first run, your test set is too easy. Add harder and adversarial cases.",
      "Write the refusal cases first; they reveal whether the assistant invents.",
      "Report the per-category table before the overall figure.",
      "A good failure analysis names the cause (retrieval, prompt, test error) rather than just 'the model was wrong'.",
      "Keep a results log: date, change made, overall, per category, regressions.",
    ],
    success: [
      "A reviewer can read your numbers and re-run your cases themselves",
      "Per-category results are shown, not only a single average",
      "At least five failures are explained with a cause and an outcome after the fix",
      "Out-of-scope behaviour is tested, not just stated",
      "You state what remains broken",
    ],
    checks: [
      { id: 'sections', label: 'At least 9 headed sections', type: 'sections', n: 9, hint: "Start each section line with '#': Problem and user, Scope, Spec, Evaluation set, Results, Failure analysis, Failure UX, Cost, Limits." },
      { id: 'words-min', label: 'At least 700 words', type: 'minWords', n: 700, hint: 'Explain your reasoning, results and failures in full.' },
      { id: 'words-max', label: 'No more than 3500 words', type: 'maxWords', n: 3500, hint: 'Cut padding: a reviewer should be able to read this in ten minutes.' },
      { id: 'scope', label: 'A Scope section of real content that gives a numeric success measure and an out-of-scope list', type: 'regex', flags: 'im', pattern: secWith('scope', 250, '(?:out.of.scope|will not|won.t)', '\\d+[ \\t]*(?:%|cases|questions|users)'), hint: "Under a '# Scope' heading: who, job, what it will NOT do, and a success number such as '85% on 40 cases'." },
      { id: 'spec', label: 'A Spec section with at least three numeric thresholds', type: 'regex', flags: 'im', pattern: secWith('spec', 350, '\\d+(?:[ \\t]*(?:%|ms|seconds|words|characters))' ), hint: "Under '# Spec': inputs/outputs, rules, quality bar with percentages, failure behaviour, constraints." },
      { id: 'evalset', label: 'Evaluation set of 30+ cases naming all four categories', type: 'regex', flags: 'im', pattern: secWith('evaluation set|eval set|test set', 200, '\\b(?:[3-9]\\d|\\d{3,})[ \\t]*(?:cases|test cases|questions)', 'typical', 'edge', 'adversarial', 'refus'), hint: "Under an '# Evaluation set' heading state the case count (e.g. '34 cases') and the typical / edge / adversarial / refuse split." },
      { id: 'results-table', label: 'A results table with at least three category rows (name | number | note)', type: 'regex', flags: 'im', pattern: tableRows(3), hint: "Use a markdown table: | category | pass rate | cases | with at least three consecutive rows containing a number." },
      { id: 'results-pct', label: 'A Results section with at least three percentages', type: 'regex', flags: 'im', pattern: secWith('results', 150, pct(3, SG)), hint: "Under '# Results' report overall and per-category pass rates as percentages." },
      { id: 'failures', label: 'Five failures each with a stated cause', type: 'regex', flags: 'im', pattern: causes(5), hint: "Write each failure on its own line, e.g. 'F3 ... cause: retrieval returned the 2023 page because ...'." },
      { id: 'failure-ux', label: 'Failure UX with three quoted user-facing messages', type: 'regex', flags: 'im', pattern: secWith('failure ux|failure experience|failure handling', 200, quotes(3, SG)), hint: "Under '# Failure UX' quote the exact message shown for timeout, no result and malformed output." },
      { id: 'cost', label: 'Cost section with token counts and a per-request figure', type: 'regex', flags: 'im', pattern: secWith('cost', 120, '\\d[\\d,.]*[ \\t]+(?:\\w+[ \\t]+)?tokens', '(?:per request|per query|per question)'), hint: "State input and output tokens per request, the price you assumed (cite where you checked it), and cost per request." },
    ],
    rubric: [
      { criterion: 'Scope and user', lookFor: 'Specific named user, a job, a non-empty out-of-scope list, measurable success.' },
      { criterion: 'Evaluation quality', lookFor: 'At least 30 cases, four categories, refusal and adversarial cases genuinely hard.' },
      { criterion: 'Evidence', lookFor: 'Real numbers per category, a before/after table, regressions checked.' },
      { criterion: 'Failure analysis', lookFor: 'Five or more failures with causes and outcomes; honesty about what remains.' },
      { criterion: 'Failure UX and cost', lookFor: 'Concrete messages for three failure modes; stated cost assumptions.' },
    ],
    extensions: ["Add a second evaluator who writes 10 cases you have not seen", "Compare two approaches on the same set", "Run a pilot with five users and add their questions to the set"],
    est: '4 hours',
  },

  {
    id: 'p7b', level: 7,
    title: 'Research agent: bounded loops and a trace summariser',
    objective: "Design a research agent with strict limits, then implement the pure function that turns its event trace into a summary you can audit.",
    skills: ['l7.agent-design', 'l7.evidence-reporting', 'l7.cost-guardrails'],
    kind: 'code',
    requirements: [
      "Define the agent's goal, tools (each read-only or write), step cap and stop conditions",
      "Make the agent emit a trace of events: think, tool_call, tool_result, final",
      "Implement summariseTrace below so it passes all tests",
      "Run your real agent on 5 questions and summarise each trace with your function (outside this app)",
      "Record two traces that went wrong and diagnose them from the summary",
    ],
    guidance: [
      { title: '1. Design the loop on paper', md: "List the tools (search, fetch page, note). Mark each as read or write. Choose a step cap (for example 8), a repeated-call rule, and what the agent returns when it runs out: a partial result with what it found and what it did not." },
      { title: 'Starter: a bounded agent loop', md: "Provider-agnostic skeleton in Python. Plug in your model call and tools.\n\n```python\nMAX_STEPS = 8\n\ndef run(goal, tools, model_step):\n    trace, seen = [], set()\n    for step in range(MAX_STEPS):\n        action = model_step(goal, trace)          # returns dict: {type: 'tool_call'|'final', ...}\n        if action['type'] == 'final':\n            trace.append({'type': 'final', 'ms': 0, 'citations': action.get('citations', [])})\n            return trace\n        key = (action['tool'], str(action['args']))\n        if key in seen:                              # repeated identical call: stop\n            trace.append({'type': 'final', 'ms': 0, 'citations': [], 'note': 'loop detected'})\n            return trace\n        seen.add(key)\n        trace.append({'type': 'tool_call', 'tool': action['tool'], 'ms': 0})\n        try:\n            result = tools[action['tool']](**action['args'])\n            trace.append({'type': 'tool_result', 'tool': action['tool'], 'ok': True, 'ms': 120})\n        except Exception:\n            trace.append({'type': 'tool_result', 'tool': action['tool'], 'ok': False, 'ms': 120})\n    return trace   # ran out of steps: no 'final' event\n```" },
      { title: '2. Implement summariseTrace', md: "Event shapes: {type:'think', ms}, {type:'tool_call', tool, ms}, {type:'tool_result', tool, ok, ms}, {type:'final', citations:[...], ms}. Return {toolCalls, toolFailures, uniqueCitations (sorted), totalMs, finished (true if a final event exists), repeatedTools (tools called two or more times, sorted)}. Handle the empty trace." },
      { title: '3. Use it on real runs', md: "Summarise five real traces. Tabulate toolCalls, failures, finished, citations. A run with finished false hit the cap: read it." },
      { title: '4. Write down two bad runs', md: "For each: what the summary showed, what you found in the trace, what limit or rule you changed." },
    ],
    hints: [
      "Count tool_call events for toolCalls and tool_result events with ok false for toolFailures.",
      "Use an object or Map to count calls per tool name.",
      "uniqueCitations: collect from final events, de-duplicate, sort alphabetically.",
      "finished is true only if some event has type 'final'.",
      "For an empty array, return zeros, empty arrays and finished false.",
    ],
    success: [
      "All tests pass",
      "You ran your function on real agent traces and have the table",
      "Two failed runs are diagnosed using the summary",
      "Your step cap and loop rule are justified by what you saw",
    ],
    rubric: [
      { criterion: 'Correctness', lookFor: 'All tests pass, including empty trace, missing citations and repeated tools.' },
      { criterion: 'Agent limits', lookFor: 'Step cap, repeat detection, a defined partial-result behaviour.' },
      { criterion: 'Evidence', lookFor: 'Real traces summarised, not invented ones.' },
      { criterion: 'Diagnosis', lookFor: 'Failures explained from trace evidence with a changed rule.' },
    ],
    extensions: ["Add a per-run token budget to the trace and flag overruns", "Flag runs where a citation was never fetched by any tool call", "Render a text timeline of the trace"],
    fnName: 'summariseTrace',
    starter: "function summariseTrace(events) {\n  // return { toolCalls, toolFailures, uniqueCitations, totalMs, finished, repeatedTools }\n}",
    tests: [
      { label: 'empty trace', args: [[]], expect: { toolCalls: 0, toolFailures: 0, uniqueCitations: [], totalMs: 0, finished: false, repeatedTools: [] } },
      { label: 'normal run with citations deduplicated and sorted', args: [[
        { type: 'think', ms: 50 }, { type: 'tool_call', tool: 'search', ms: 5 }, { type: 'tool_result', tool: 'search', ok: true, ms: 200 },
        { type: 'final', ms: 100, citations: ['b', 'a', 'b'] },
      ]], expect: { toolCalls: 1, toolFailures: 0, uniqueCitations: ['a', 'b'], totalMs: 355, finished: true, repeatedTools: [] } },
      { label: 'failure and repeated tool, no final', args: [[
        { type: 'tool_call', tool: 'fetch', ms: 1 }, { type: 'tool_result', tool: 'fetch', ok: false, ms: 300 },
        { type: 'tool_call', tool: 'fetch', ms: 1 }, { type: 'tool_result', tool: 'fetch', ok: false, ms: 300 },
        { type: 'tool_call', tool: 'search', ms: 1 },
      ]], expect: { toolCalls: 3, toolFailures: 2, uniqueCitations: [], totalMs: 603, finished: false, repeatedTools: ['fetch'] } },
      { label: 'final without citations field', args: [[{ type: 'final', ms: 10 }]], expect: { toolCalls: 0, toolFailures: 0, uniqueCitations: [], totalMs: 10, finished: true, repeatedTools: [] } },
    ],
    est: '3 hours',
  },

  {
    id: 'p7c', level: 7,
    title: 'RAG knowledge system: hybrid retrieval with rank fusion',
    objective: "Build a question-answering system over a real document set, measure retrieval and answer quality separately, and implement the rank-fusion function that merges keyword and semantic results.",
    skills: ['l7.retrieval-systems', 'l7.eval-driven-dev', 'l7.user-trust'],
    kind: 'code',
    requirements: [
      "Choose a document set you have the right to use (for example a public handbook or your own notes)",
      "Chunk it and index it two ways: keyword search and embedding search",
      "Write at least 25 questions with the correct source chunk marked, including 5 that have no answer",
      "Implement rrfFuse (below) to merge the two ranked lists",
      "Measure recall at k=3 for keyword only, semantic only and fused (outside this app) and tabulate",
      "Show sources with every answer and a clear 'not found' behaviour",
      "Analyse at least five retrieval misses",
    ],
    guidance: [
      { title: '1. Prepare the corpus', md: "Choose 10 to 30 pages of text. Record where each chunk came from (file, heading, page) so you can cite it. Remove personal data. Check you may use it." },
      { title: 'Starter: chunk and keyword search', md: "Runnable Python with no external services.\n\n```python\nimport re, math\nfrom collections import Counter\n\ndef chunk(text, size=120, overlap=30):\n    words = text.split()\n    step = size - overlap\n    return [' '.join(words[i:i+size]) for i in range(0, max(len(words) - overlap, 1), step)]\n\ndef tokens(s):\n    return re.findall(r'[a-z0-9]+', s.lower())\n\ndef build_idf(chunks):\n    n = len(chunks)\n    df = Counter(t for c in chunks for t in set(tokens(c)))\n    return {t: math.log((n + 1) / (d + 0.5)) for t, d in df.items()}\n\ndef keyword_rank(query, chunks, idf, k=5):\n    q = tokens(query)\n    scores = []\n    for i, c in enumerate(chunks):\n        tf = Counter(tokens(c))\n        scores.append((sum(tf[t] * idf.get(t, 0) for t in q), i))\n    scores.sort(reverse=True)\n    return [i for s, i in scores[:k] if s > 0]\n```" },
      { title: 'Starter: semantic ranking', md: "Get embeddings for each chunk and the query from your provider's embeddings endpoint (see your provider docs for the exact call), then rank by cosine similarity.\n\n```python\ndef cosine(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    na = math.sqrt(sum(x * x for x in a))\n    nb = math.sqrt(sum(y * y for y in b))\n    return dot / (na * nb) if na and nb else 0.0\n\ndef semantic_rank(q_vec, chunk_vecs, k=5):\n    scored = sorted(((cosine(q_vec, v), i) for i, v in enumerate(chunk_vecs)), reverse=True)\n    return [i for s, i in scored[:k]]\n```" },
      { title: '2. Implement rrfFuse', md: "Reciprocal rank fusion: each list gives each item 1/(k + rank) with rank starting at 1; sum across lists; sort by score descending, tie broken by id ascending. Only the first appearance of an id within a list counts. Return the top N as {id, score} with score rounded to 6 decimals. topN of 0 or less means return all." },
      { title: '3. Measure', md: "For each question, is the correct chunk in the top 3? Compute recall for keyword, semantic and fused. The fused list should usually be at least as good as the better of the two; if not, find out why." },
      { title: '4. Answers, citations and the no-answer path', md: "Pass the top chunks to the model with a rule: answer only from them, cite chunk ids, and say you do not know otherwise. Test the 5 unanswerable questions: do you get a refusal?" },
    ],
    hints: [
      "Rank starts at 1, so the first item earns 1/(k+1).",
      "Use an object keyed by id to accumulate scores; remember to ignore repeats of an id inside one list.",
      "Sort with a comparator: higher score first, then id ascending.",
      "Round with Math.round(x * 1e6) / 1e6.",
      "Handle empty rankings and topN <= 0.",
    ],
    success: [
      "All tests pass",
      "A table compares keyword, semantic and fused recall at k=3 on 25 questions",
      "Five retrieval misses are explained (chunking, vocabulary mismatch, etc.)",
      "Unanswerable questions are refused and the refusal rate is reported",
      "Every answer displays its sources",
    ],
    rubric: [
      { criterion: 'Retrieval engineering', lookFor: 'Chunking choices justified; two retrievers; fusion implemented correctly.' },
      { criterion: 'Evaluation', lookFor: 'Ground-truth chunks marked; recall measured separately from answer quality.' },
      { criterion: 'Failure analysis', lookFor: 'Misses grouped by cause with a fix tried.' },
      { criterion: 'Trust design', lookFor: 'Sources shown; honest not-found behaviour.' },
    ],
    extensions: ["Tune the fusion constant k and chunk size, and report the grid", "Add a reranking step and measure its effect", "Add document dates and prefer the newest"],
    fnName: 'rrfFuse',
    starter: "function rrfFuse(rankings, k, topN) {\n  // rankings: array of arrays of ids (best first)\n  // return [{ id, score }] sorted by score desc, then id asc; score rounded to 6 decimals\n  // topN <= 0 means return all\n}",
    tests: [
      { label: 'two lists, ties broken by id', args: [[['a', 'b', 'c'], ['b', 'a', 'd']], 60, 3], expect: [{ id: 'a', score: 0.032522 }, { id: 'b', score: 0.032522 }, { id: 'c', score: 0.015873 }] },
      { label: 'tie broken by id even when insertion order is reversed', args: [[['b', 'a'], ['a', 'b']], 60, 0], expect: [{ id: 'a', score: 0.032522 }, { id: 'b', score: 0.032522 }] },
      { label: 'rank is 1-based: a single first place with k=1 scores 0.5', args: [[['solo']], 1, 0], expect: [{ id: 'solo', score: 0.5 }] },
      { label: 'topN truncates after sorting', args: [[['c', 'b', 'a']], 60, 2], expect: [{ id: 'c', score: 0.016393 }, { id: 'b', score: 0.016129 }] },
      { label: 'empty input', args: [[], 60, 5], expect: [] },
      { label: 'duplicate id inside one list counts once', args: [[['x', 'x', 'y']], 60, 0], expect: [{ id: 'x', score: 0.016393 }, { id: 'y', score: 0.015873 }] },
      { label: 'agreement beats a single high rank', args: [[['p', 'q'], ['q', 'r'], ['q']], 10, 1], expect: [{ id: 'q', score: 0.265152 }] },
    ],
    est: '5 hours',
  },

  {
    id: 'p7d', level: 7,
    title: 'Voice application: design, latency budget and test plan',
    objective: "Specify and plan a voice-driven assistant for a real setting, with a latency budget, a spoken failure design and a test plan that covers noise, accents and misrecognition.",
    skills: ['l7.spec-writing', 'l7.failure-ux', 'l7.user-trust', 'l7.cost-guardrails'],
    kind: 'text',
    requirements: [
      "Describe the user, the setting (hands busy? noisy?) and why voice beats typing there",
      "Draw the pipeline: speech to text, reasoning, text to speech, with where each could fail",
      "Set a latency budget in milliseconds per stage and a total target; say how you will measure it",
      "Define what the assistant does when it mishears, hears nothing, or is interrupted",
      "Specify privacy handling for recordings and transcripts",
      "Write a test plan of at least 20 spoken or transcribed cases including noise, accents or speech varieties, numbers and names",
      "List the metrics (for example word error rate, task success, time to first audio) and thresholds",
      "Name at least three risks and mitigations, including consent and misuse (for example voice impersonation)",
    ],
    guidance: [
      { title: '1. Is voice the right interface?', md: "Voice earns its place when hands or eyes are busy, or typing is hard. It is poor for private information in public places and for long precise detail. Write one honest paragraph on both sides." },
      { title: 'Starter: the pipeline you can run today', md: "A text-only harness lets you test the reasoning stage without audio. Python, runnable:\n\n```python\n# voice_harness.py : feed transcripts (from a speech-to-text tool or typed) into your assistant\nimport time, json, sys\nfrom assistant import ask   # from project p7a, or your own\n\nrows = []\nfor line in open(sys.argv[1]):\n    case = json.loads(line)   # {id, transcript, expected_intent, condition}\n    t0 = time.time()\n    reply = ask(case['transcript'], case.get('context', ''))\n    rows.append({'id': case['id'], 'condition': case['condition'], 'ms': round((time.time() - t0) * 1000), 'reply': reply})\njson.dump(rows, open('voice_results.json', 'w'), indent=2)\nprint('median ms:', sorted(r['ms'] for r in rows)[len(rows) // 2])\n```" },
      { title: '2. Latency budget', md: "People notice pauses in speech quickly. Allocate time: capture end-of-speech detection, transcription, model first token, first audio out. Write the numbers you aim for, then measure with the harness plus your speech tools. A streaming reply (speak the first sentence while the rest is generated) is the usual way to shrink perceived delay." },
      { title: '3. Speak the failures', md: "Write the exact spoken lines for: no speech heard, low-confidence transcription (confirm back: 'Did you say ...?'), model failure, and user interrupting. Keep them short; nobody wants to listen to a paragraph of apology." },
      { title: '4. Test plan', md: "Table: case id, condition (quiet, noisy, fast speech, accent, number, name), expected outcome, pass criteria. Include confusable numbers (15 vs 50) and names. Predict which will fail." },
      { title: '5. Privacy and misuse', md: "State whether audio is stored, for how long, who can hear it, how users delete it, and how you obtain consent. Note that cloned or synthetic voices can be used to impersonate people, and say what you will not do." },
    ],
    hints: [
      "Put the budget in a table: stage, target ms, how measured.",
      "Confirming back for numbers and names is a cheap, strong mitigation.",
      "Test with a real speaker if you can; synthetic audio hides accent and noise problems.",
      "State a threshold for each metric so the plan can fail.",
      "A voice product needs an exit to a human or to a screen for anything sensitive.",
    ],
    success: [
      "The latency budget is numeric and has a measurement method",
      "Misrecognition and silence have specific spoken responses",
      "The test plan has at least 20 cases across varied conditions with thresholds",
      "Privacy and consent are specified, not implied",
      "Risks include voice misuse",
    ],
    checks: [
      { id: 'sections', label: 'At least 8 headed sections', type: 'sections', n: 8, hint: "Use '#' headings: Fit for voice, Pipeline, Latency budget, Failures, Privacy, Test plan, Metrics, Risks." },
      { id: 'words-min', label: 'At least 700 words', type: 'minWords', n: 700, hint: 'Add detail on each stage, case and risk.' },
      { id: 'words-max', label: 'No more than 3500 words', type: 'maxWords', n: 3500, hint: 'Trim filler; keep the plan reviewable.' },
      { id: 'latency', label: 'Latency section with four or more millisecond figures', type: 'regex', flags: 'im', pattern: secWith('latency', 200, times('\\d+[ \\t]*(?:ms|milliseconds)\\b', 4, SG)), hint: "Under '# Latency budget' give ms per stage (end-of-speech, transcription, first token, first audio) and a total." },
      { id: 'cases', label: 'A test plan of 20 numbered cases, each described in a full line', type: 'regex', flags: 'im', pattern: caseLines(20), hint: "Number your cases 1. to 20. (or table rows starting | 1 |), each with condition and expected outcome on the same line." },
      { id: 'conditions', label: 'Test conditions include noise, accents/dialects, numbers and names', type: 'regex', flags: 'im', pattern: '(?=[\\s\\S]*\\bnois)(?=[\\s\\S]*(?:accent|dialect))(?=[\\s\\S]*\\bnumbers?\\b)(?=[\\s\\S]*\\bnames?\\b)', hint: 'Cover background noise, accents or dialects, confusable numbers (15 vs 50) and names.' },
      { id: 'spoken', label: 'Three quoted spoken lines for mishearing, silence and error', type: 'regex', flags: 'im', pattern: secWith('failure|spoken', 200, quotes(3, SG)), hint: "Under '# Failures' quote the exact words the assistant says in each case." },
      { id: 'metrics', label: 'Two metrics with numeric thresholds', type: 'regex', flags: 'im', pattern: times('(?:word error rate|\\bWER\\b|task success|time to first audio|latency)[^\\n]{0,80}?(?:<=?|>=?|\\u2264|\\u2265|under|below|above|at least|within)[ \\t]*\\d+', 2), hint: "e.g. 'WER <= 10% in quiet, <= 20% in noise' and 'time to first audio under 1500 ms'." },
      { id: 'privacy', label: 'Privacy section with a retention period or an explicit no-storage statement, and consent', type: 'regex', flags: 'im', pattern: secWith('privacy|consent', 200, '(?:\\d+[ \\t]*(?:days|hours|weeks|months)|not stored|no recordings?|deleted immediately)', 'consent'), hint: "State what is stored, for how many days, who can access it, how to delete it and how consent is obtained." },
      { id: 'risks', label: 'Three named risks each with a mitigation', type: 'regex', flags: 'im', pattern: mitigated(3), hint: "Write e.g. 'Risk: voice cloning impersonation - mitigation: no custom voices without recorded consent'." },
    ],
    rubric: [
      { criterion: 'Fit for voice', lookFor: 'Honest argument for and against voice in this setting.' },
      { criterion: 'Latency design', lookFor: 'Per-stage numbers, streaming strategy, a measurement method.' },
      { criterion: 'Failure UX', lookFor: 'Concrete spoken lines for mishearing, silence, errors, interruption.' },
      { criterion: 'Test plan', lookFor: 'At least 20 varied cases, metrics and thresholds, some run for real.' },
      { criterion: 'Safety and privacy', lookFor: 'Consent, retention, deletion, impersonation risks, escalation.' },
    ],
    extensions: ["Run the text harness and report median and worst latency of the reasoning stage", "Record five real speech samples and report transcription errors", "Design a screen-based fallback for noisy environments"],
    est: '3 hours',
  },
];
