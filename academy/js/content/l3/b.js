import { T } from './tests.js';

export const lessonsB = [
  /* ---------------------------------------------------------------- 04 */
  {
    id: 'l3-04',
    title: 'Structured outputs: parse, validate, repair',
    hook: 'A paragraph is for people; a program needs fields, and a model will sometimes hand you the wrong ones.',
    minutes: 25,
    skills: ['l3.structured-output'],
    core: true,
    code: true,
    deep: false,
    blocks: [
      { t: 'p', md: "In Level 1 you asked for tidy formats by prompting. In an application the stakes are higher: the reply goes into a database, a form or another function. A **structured output** is a reply with a fixed machine-readable shape, usually JSON. The central idea of this lesson is simple: **model output is untrusted input.** Treat it exactly as you would text typed by an anonymous user." },
      { t: 'h', text: 'Three layers of defence' },
      { t: 'steps', items: [{ title: 'Ask well', md: "Say what shape you want, show one example, and give the allowed values for fields such as `status`. Prompting alone gets you most of the way and never all of it." }, { title: 'Constrain if the provider can', md: "Many providers can force output to match a JSON Schema, or force tool arguments to match one. This greatly reduces broken output but has limits, which differ by provider." }, { title: 'Validate always', md: "Parse the text, check every field against your rules, and only then use it. Your rules are richer than any constraint a provider supports (for example business rules such as 'refund must not exceed the order total')." }] },
      { t: 'current', key: 'l3-structured-output-features' },
      { t: 'h', text: 'JSON Schema in one minute' },
      { t: 'p', md: "**JSON Schema** is a standard way to describe what a JSON value must look like: its `type`, which fields are `required`, allowed `enum` values, number ranges, and whether extra fields are permitted. Try the widget: break the JSON in each way a model typically does, and read the error messages." },
      { t: 'widget', w: 'jsonschema', props: {}, caption: 'Try this: delete a required field, then change a number into a string, then add trailing prose around the JSON.' },
      { t: 'h', text: 'The parse, validate, repair loop' },
      { t: 'p', md: "Failures fall into predictable groups: the JSON is wrapped in chatter or code fences; the JSON is syntactically broken; a field is missing; a field has the wrong type; a value is outside the allowed set. A robust pipeline handles them in this order." },
      { t: 'list', ordered: true, items: ["**Extract** the JSON from the text (cheap and deterministic, for example the span from the first `{` to the last `}`).", "**Parse** it. A syntax failure means no value yet.", "**Validate** against the schema and collect *all* errors, not just the first.", "**Repair**: send the model its own output plus the error list and ask for a corrected version. Allow one or two attempts, then give up.", "**Fail safely**: return a clear error or a safe default, never half-trusted data."] },
      { t: 'code', lang: 'js', src: `// Display only: the repair loop around a real model call (run in your own environment).
async function getStructured(callModel, prompt, validate, maxAttempts = 2) {
  let messages = [{ role: 'user', content: prompt }];
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const text = await callModel(messages);
    const result = validate(text);            // { ok: true, value } or { ok: false, errors: [...] }
    if (result.ok) return result.value;
    messages = [
      ...messages,
      { role: 'assistant', content: text },
      { role: 'user', content: 'Your JSON had these problems: ' + result.errors.join('; ') + '. Reply with corrected JSON only.' },
    ];
  }
  throw new Error('No valid output after ' + maxAttempts + ' attempts');   // fail loudly, log the last text
}`, caption: 'The validator is a pure function, so it is the part you can test thoroughly without any network.' },
      { t: 'callout', kind: 'misconception', title: '"Valid JSON means correct output"', md: "Valid JSON only means the *punctuation* is right. A schema-valid answer can still be wrong: a made-up order number, a plausible but false category, a date in the wrong year. Validation catches shape errors and impossible values; it cannot catch confident mistakes, which still need checking against real data." },
      { t: 'predict', q: 'A schema says `age` must be a number. The model returns {"age": "36"}. A teammate says "JavaScript will coerce it, so skip the check". What is the best response?', options: ['Agree: "36" and 36 behave the same everywhere', 'Reject or repair: the type is wrong, and downstream code (databases, comparisons, other services) may behave differently', 'Ignore the field', 'Retry the whole request forever'], answer: 1, explain: 'Silent coercion hides problems and spreads them: "36" + 1 is "361" in JavaScript. Decide deliberately whether to convert, repair or reject, and record that failure rate; a high rate means your prompt or schema needs work.', skill: 'l3.structured-output' },
      { t: 'widget', w: 'codeplay', props: { title: 'Write the validator', fnName: 'parseAndValidate', starter: `function parseAndValidate(text, schema) {
  // schema: { required: ['name'], types: { name: 'string' }, enums: { status: ['yes','no'] } }
  // 1. Extract the span from the first '{' to the last '}'. None -> {ok:false, errors:['invalid_json']}
  // 2. JSON.parse it; on failure -> {ok:false, errors:['invalid_json']}
  // 3. Collect errors in this order: 'missing:<field>' for each required field that is undefined,
  //    then 'type:<field>' for each present field whose type is wrong,
  //    then 'enum:<field>' for each present field not in its list.
  // 4. No errors -> {ok:true, value}.   Otherwise {ok:false, errors}.
}`, tests: T.parseAndValidate, hints: ['indexOf("{") and lastIndexOf("}") give you the span.', 'Type check: arrays need Array.isArray; null should fail every type.'] }, skill: 'l3.structured-output' }
    ],
    reteach: [
      { style: 'analogy', md: "A model's reply is like a form filled in by a stranger. You would not post it straight into your accounts system. You would check the handwriting is legible (parse), that every box is filled (required), that the right kind of thing is in each box (types), and that choices were ticked from the list (enum). If it is wrong you send it back with the problems circled (repair), and after two tries you phone someone (fail safely)." },
      { style: 'simple', md: "Ask clearly, constrain if you can, and always check. Checking means: pull out the JSON, parse it, compare against the schema, list every problem. If there are problems, show the model its mistakes and ask once or twice more; then stop." },
      { style: 'technical', md: "Treat the model as an untrusted component whose interface contract you enforce at the boundary. Compose cheap deterministic stages (extract, parse), a schema validator returning structured errors, and a bounded retry that feeds the error list back as context. Track per-field failure rates and repair success rates as quality metrics; a rising repair rate signals prompt or schema drift." }
    ],
    quiz: [
      { id: 'l3-04-q1', skill: 'l3.structured-output', type: 'mcq', difficulty: 2, q: 'A provider offers a feature that forces model output to match your JSON Schema. A teammate proposes deleting your validation code. What is the best response?', options: ['Agree: once output is forced to match the schema, a separate validation step only adds latency', 'Keep it: constraints cover only part of the rules, and valid output can still be wrong', 'Keep validation during development and testing, then switch it off in production to save time', 'Replace it with a second model that re-reads every output and approves it before it is used'], answer: 1, wrong: { '0': 'Constraint guarantees shape, not truth, and often not every rule you care about.', '3': 'A second model is slower, costlier and itself unreliable for checks that a few lines of code do exactly.' }, hints: ['Think about truncation (output limit) and rules the schema cannot express.', 'What does "valid" mean here?'], explain: 'Constrained decoding reduces malformed output, but you still face refusals, truncation, unsupported schema keywords and semantic mistakes. Validation is cheap and exact; keep it.' },
      { id: 'l3-04-q2', skill: 'l3.structured-output', type: 'order', difficulty: 2, q: 'Order a robust handler for model output.', items: ['Extract the JSON text from the reply', 'Parse it, catching syntax errors', 'Validate against the schema and collect all errors', 'If invalid, ask the model to repair, with a limited number of attempts', 'If still invalid, fail safely with a logged error'], hints: ['You cannot validate what you have not parsed.', 'Repair must be bounded.'], explain: 'The order moves from cheapest, most deterministic steps to the costly model call, and ends with a safe failure so bad data never flows downstream.' },
      { id: 'l3-04-q3', skill: 'l3.structured-output', type: 'multi', difficulty: 2, q: 'Which of these problems can schema validation catch? Select all that apply.', options: ['A required field is missing', 'A number field contains text', 'A status field contains a value outside the allowed list', 'A customer name is spelled correctly but belongs to a different customer', 'A summary states a false fact in a correctly typed string'], answer: [0, 1, 2], hints: ['Validation checks shape and allowed values.', 'It cannot know the truth.'], explain: 'Schemas check structure, types and allowed values. Whether content is true or refers to the right entity needs checks against real data or human review.' },
      { id: 'l3-04-q4', skill: 'l3.structured-output', type: 'mcq', difficulty: 3, q: 'Your pipeline retries invalid output up to 5 times by re-sending the same prompt, unchanged. Failure rates barely improve. What is the most useful change?', options: ['Send the previous output and the exact validation errors, and cap attempts at two or three', 'Raise the retry limit to twenty so that more of the identical attempts get a chance to succeed', 'Lower the output token limit so the model has less room to make mistakes in its reply', 'Remove the schema from the prompt, because describing the format only confuses the model'], answer: 0, hints: ['Does the model know what was wrong?', 'More attempts of the same thing rarely help.'], explain: 'Identical retries mostly repeat the same mistake. Feeding the concrete errors back turns a blind retry into a targeted correction, and a low cap keeps cost and latency bounded.' },
      { id: 'l3-04-q5', skill: 'l3.structured-output', type: 'code', difficulty: 3, q: 'Write parseAndValidate(text, schema). Extract the span from the first "{" to the last "}", parse it, and check it against schema {required, types, enums}. Errors: "invalid_json" alone if extraction/parsing fails; otherwise "missing:<f>" for required fields that are undefined, then "type:<f>" for present fields of the wrong type (string, number, boolean, array, object; null fails all), then "enum:<f>" for present fields outside their list. Return {ok:true,value} or {ok:false,errors}.', fnName: 'parseAndValidate', starter: "function parseAndValidate(text, schema) {\n  \n}", tests: T.parseAndValidate, hints: ['text.indexOf("{") and text.lastIndexOf("}"); slice from start to end + 1.', 'Write a small isType(value, name) helper; remember null and arrays are typeof "object".'], solution: `function parseAndValidate(text, schema) {
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s < 0 || e < s) return { ok: false, errors: ['invalid_json'] };
  let value;
  try { value = JSON.parse(text.slice(s, e + 1)); } catch (err) { return { ok: false, errors: ['invalid_json'] }; }
  const isType = (v, t) => {
    if (t === 'array') return Array.isArray(v);
    if (t === 'object') return v !== null && typeof v === 'object' && !Array.isArray(v);
    if (t === 'number') return typeof v === 'number' && Number.isFinite(v);
    return typeof v === t;
  };
  const errors = [];
  for (const f of schema.required || []) if (value[f] === undefined) errors.push('missing:' + f);
  for (const [f, t] of Object.entries(schema.types || {})) if (value[f] !== undefined && !isType(value[f], t)) errors.push('type:' + f);
  for (const [f, list] of Object.entries(schema.enums || {})) if (value[f] !== undefined && !list.includes(value[f])) errors.push('enum:' + f);
  return errors.length ? { ok: false, errors } : { ok: true, value };
}`, explain: 'Extraction by first and last brace handles both code fences and chatter. Returning all errors at once (not just the first) gives a repair prompt everything it needs. The null case shows why typeof alone is not enough.' }
    ],
    takeaways: [
      'Model output is untrusted input: extract, parse, validate, and only then use it.',
      'Provider-side schema constraints help but do not replace your own validation.',
      'Collect all validation errors and feed them back for a bounded repair attempt.',
      'Valid shape does not mean true content; verify facts against real data.',
      'Measure how often each failure type happens: it tells you where the prompt needs work.'
    ],
    apply: "Pick a task you currently do by prompting (summarise a ticket, tag an email). Write the JSON Schema for its output on paper: fields, types, allowed values. Notice how many ambiguities the exercise exposes."
  },

  /* ---------------------------------------------------------------- 05 */
  {
    id: 'l3-05',
    title: 'Tool calling and the dispatch loop',
    hook: 'A model cannot check the weather or refund an order, but it can ask your code to, and your code decides whether to obey.',
    minutes: 30,
    skills: ['l3.tool-calling'],
    core: true,
    code: true,
    deep: false,
    blocks: [
      { t: 'p', md: "In Level 2 you used tools through a product. Now you build the machinery. **Tool calling** (also called function calling) lets the model respond not with prose but with a request: \"please run `get_temp` with `{city: 'Oslo'}`\". The model never runs anything. **Your code** runs the function and sends the result back; the model then continues, now knowing the answer." },
      { t: 'callout', kind: 'why', title: 'Why this matters', md: "Tool calling is how a model reads your database, files tickets, searches documents, or does arithmetic reliably. It is also how a mistaken or manipulated model could try to do damage, so the code that receives tool requests is a **security boundary**, not plumbing." },
      { t: 'h', text: 'The loop' },
      { t: 'widget', w: 'flow', props: { title: 'The dispatch loop', height: 330, nodes: [{ id: 'app', label: 'Your app', x: 12, y: 50, kind: 'process', note: 'Holds the conversation and the registry of allowed tools.' }, { id: 'model', label: 'Model', x: 50, y: 18, kind: 'model', note: 'Replies either with final text or with one or more tool requests (name + arguments). It cannot execute anything.' }, { id: 'disp', label: 'Dispatcher', x: 50, y: 82, kind: 'process', note: 'Looks the name up in an allow-list, validates arguments, runs the function, catches errors.' }, { id: 'tool', label: 'Your function / API', x: 88, y: 82, kind: 'tool', note: 'Real work happens here, with your permissions, not the model\'s.' }, { id: 'out', label: 'Final answer', x: 88, y: 18, kind: 'output' }], edges: [['app', 'model', 'messages + tool list'], ['model', 'disp', 'tool request(s)'], ['disp', 'tool', 'validated call'], ['tool', 'disp', 'result or error'], ['disp', 'app', 'tool result message'], ['model', 'out', 'no more tools']], steps: [{ show: ['app', 'model'], text: 'Send the conversation and the tool descriptions (name, purpose, argument schema).' }, { show: ['model', 'disp'], text: 'The model replies with a request to call a named tool with arguments.' }, { show: ['disp', 'tool'], text: 'Your dispatcher checks the name and arguments, then runs the function.' }, { show: ['tool', 'disp', 'app'], text: 'The result (or an error) is appended to the conversation as a tool-result message, linked to the request by an id.' }, { show: ['app', 'model', 'out'], text: 'Call the model again. Repeat until it answers in plain text, or a step limit stops the loop.' }] }, caption: 'Step through, then click each node.' },
      { t: 'current', key: 'l3-tool-calling-shapes' },
      { t: 'code', lang: 'python', src: `# Anthropic Python SDK (provider-specific): a complete tool-use loop. Run in your own environment.
import anthropic

client = anthropic.Anthropic()
MODEL = "claude-opus-5-5"   # check the provider's models page; keep in config

TOOLS = [{
    "name": "get_temp",
    "description": "Current temperature in Celsius for a city. Use only for weather questions.",
    "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]},
}]
REGISTRY = {"get_temp": lambda city: {"london": 12, "paris": 15, "oslo": 3}[city.lower()]}   # the allow-list

def run(user_text, max_steps=5):
    messages = [{"role": "user", "content": user_text}]
    for _ in range(max_steps):                       # never loop forever
        response = client.messages.create(model=MODEL, max_tokens=1024, tools=TOOLS, messages=messages)
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason != "tool_use":       # no tool requested: this is the final answer
            return next(b.text for b in response.content if b.type == "text")
        results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            try:
                output = REGISTRY[block.name](**block.input)      # unknown name -> KeyError -> error result
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(output)})
            except Exception as e:
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": "Error: " + str(e), "is_error": True})
        messages.append({"role": "user", "content": results})    # one tool_result per tool_use id, results first
    raise RuntimeError("Step limit reached")

print(run("What is the temperature in Oslo?"))`, caption: 'Tool-use round trip, Python. Provider-specific: tool_use and tool_result blocks, the id link, is_error, stop_reason "tool_use". Verified against the official tool-use docs, 2026-10.' },
      { t: 'code', lang: 'ts', src: `// Anthropic TypeScript SDK (provider-specific): the same loop. Run in your own environment (Node).
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const MODEL = "claude-opus-5-5"; // check the provider's models page; keep in config

const tools: Anthropic.Tool[] = [{
  name: "get_temp",
  description: "Current temperature in Celsius for a city. Use only for weather questions.",
  input_schema: { type: "object", properties: { city: { type: "string" } }, required: ["city"] },
}];
const registry: Record<string, (input: any) => string> = {
  get_temp: ({ city }) => String({ london: 12, paris: 15, oslo: 3 }[String(city).toLowerCase()] ?? "unknown city"),
};

async function run(userText: string, maxSteps = 5): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userText }];
  for (let step = 0; step < maxSteps; step++) {
    const response = await client.messages.create({ model: MODEL, max_tokens: 1024, tools, messages });
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "tool_use") {
      const text = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
      return text?.text ?? "";
    }
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const fn = Object.prototype.hasOwnProperty.call(registry, block.name) ? registry[block.name] : undefined;
      results.push(fn
        ? { type: "tool_result", tool_use_id: block.id, content: fn(block.input) }
        : { type: "tool_result", tool_use_id: block.id, content: "Error: unknown tool " + block.name, is_error: true });
    }
    messages.push({ role: "user", content: results });
  }
  throw new Error("Step limit reached");
}`, caption: 'Tool-use round trip, TypeScript. Compare the dispatcher you write below: same job, tested without any network.' },
      { t: 'h', text: 'Dispatch rules that keep you safe' },
      { t: 'list', items: ["**Allow-list:** only names in your registry can run; an unknown name is an error result, never a lookup into code.", "**Validate arguments** exactly as you validate any input. Arguments may arrive as an object or as a JSON string, and may be wrong or malicious.", "**Return errors as results,** with the same id, so the model can recover, instead of crashing the loop.", "**Least privilege:** a tool should do the smallest thing needed, with the user's permissions, not the app's. Put human confirmation in front of anything destructive or expensive.", "**Cap the loop** with a maximum number of steps, and log every call and result."] },
      { t: 'callout', kind: 'warn', title: 'Never eval model output', md: "Do not pass model-provided strings to `eval`, a shell, or string-built SQL. Treat arguments as data, and use parameterised queries. A tool result can also contain text trying to steer the model (prompt injection); the model should be told to treat tool output as data." },
      { t: 'widget', w: 'agentloop', props: { scenario: 'refund' }, caption: 'Try this: switch on "inject tool failure" and watch how an error result lets the run recover.' },
      { t: 'widget', w: 'codeplay', props: { title: 'Write the dispatcher', fnName: 'dispatch', starter: `function dispatch(calls) {
  const TOOLS = {
    add: ({ a, b }) => { if (typeof a !== 'number' || typeof b !== 'number') throw new Error('a and b must be numbers'); return a + b; },
    get_temp: ({ city }) => {
      const t = { london: 12, paris: 15, oslo: 3 }[String(city).toLowerCase()];
      if (t === undefined) throw new Error('unknown city: ' + city);
      return t;
    },
  };
  // calls: [{ id, name, args }] where args is an object OR a JSON string.
  // Return one result per call, in order: { tool_call_id, content, is_error }.
  //  - unknown tool            -> content 'unknown tool: <name>', is_error true
  //  - args string not JSON    -> content 'invalid arguments', is_error true
  //  - tool throws             -> content = error message, is_error true
  //  - success                 -> content = String(result), is_error false
}`, tests: T.dispatch, hints: ['Use Object.prototype.hasOwnProperty.call(TOOLS, name) so "toString" is not treated as a tool.', 'Wrap the JSON.parse and the tool call in separate try/catch blocks, so you can give different messages.'] }, skill: 'l3.tool-calling' },
      { t: 'try', prompt: 'You are giving a support assistant three tools: look_up_order, issue_refund, and send_email. Which one needs a human confirmation step, what two checks should the dispatcher make before issue_refund runs, and why?', sample: "issue_refund (and arguably send_email, since it is irreversible and visible to a customer) should require confirmation. Before it runs, the dispatcher should check that the order belongs to the authenticated customer or case (authorisation uses your data, not the model's claim), and that the amount is within the order total and any policy limit. The model's argument is a suggestion; the dispatcher enforces the rules." }
    ],
    reteach: [
      { style: 'analogy', md: "Picture a hotel guest (the model) phoning the concierge (your dispatcher). The guest cannot leave the room, so they say, 'Please book a taxi to the airport for six.' The concierge checks the request is something the hotel offers, checks the details make sense, then books it and phones back: 'Done, a car at six', or 'Sorry, there is no airport at that address.' The guest never touches the phone to the taxi firm." },
      { style: 'simple', md: "The model asks; your code does. Each request has a name and arguments and an id. You look the name up in a list of allowed tools, check the arguments, run the function, and send back the result with the same id. Errors go back as results too. Repeat until the model answers in words, with a limit so it cannot loop forever." },
      { style: 'step-by-step', md: "Loop: 1) Send messages and tool descriptions. 2) If the reply has no tool requests, you are done. 3) For each request: find the tool, parse and validate the args, call it, capture the result or error. 4) Append one result message per request, carrying the request id. 5) Increase the step counter; stop if it reaches the limit; else go to 1." }
    ],
    quiz: [
      { id: 'l3-05-q1', skill: 'l3.tool-calling', type: 'order', difficulty: 2, q: 'Order the events in one round of the tool-calling loop.', items: ['Your app sends the conversation and tool descriptions to the model', 'The model replies with a request to call a named tool with arguments', 'Your dispatcher validates the request and runs the function', 'The result is appended to the conversation, linked by the request id', 'Your app calls the model again'], hints: ['The model asks before anything runs.', 'The model needs the result before it can continue.'], explain: 'The model only proposes the call. Execution is entirely yours, and the model sees the outcome only because you add it to the next request.' },
      { id: 'l3-05-q2', skill: 'l3.tool-calling', type: 'mcq', difficulty: 2, q: 'A model returns a tool call for "run_sql" with the argument "DROP TABLE customers". Your registry has a run_sql tool that executes whatever string it receives. Who is at fault, and what is the fix?', options: ['The model alone is at fault; moving to a larger model will stop it producing such calls', 'The design: the tool grants far too much power. Use narrow, parameterised tools and read-only credentials', 'The user, for asking a question that led the model to produce such a destructive command', 'No one: models are expected to behave, and a rare bad call is simply the cost of automation'], answer: 1, wrong: { '0': 'Even the best model can be mistaken or manipulated through injected text. Safety cannot depend on model behaviour alone.' }, hints: ['Who decides what a tool is allowed to do?', 'Think least privilege.'], explain: 'The dispatcher and tool are your security boundary. Giving the model arbitrary SQL means any mistake or injected instruction can run it. Narrow tools, minimal permissions and confirmations make a bad request harmless.' },
      { id: 'l3-05-q3', skill: 'l3.tool-calling', type: 'multi', difficulty: 2, q: 'Which are good practices in a dispatcher? Select all that apply.', options: ['Look the tool name up in an allow-list', 'Validate arguments before running the tool', 'Return tool failures to the model as error results with the request id', 'Run any function whose name the model provides, using eval or dynamic lookup', 'Limit the number of loop steps'], answer: [0, 1, 2, 4], hints: ['One option hands control to the model.', 'Failures should not crash the loop.'], explain: 'Allow-listing, validation, error results and step limits all keep the loop safe and recoverable. Dynamic lookup or eval lets any text the model produces choose what runs.' },
      { id: 'l3-05-q4', skill: 'l3.tool-calling', type: 'mcq', difficulty: 3, q: 'Your loop sometimes runs 40 model calls on one question, with the model calling the same tool with the same arguments each time. What is the best protection?', options: ['Trust the model: it will stop eventually, and cutting it off risks losing a useful answer', 'Increase the output token limit, so each reply has room to finish the whole task at once', 'A hard step cap, repeat-call detection, and a clear message when the limit is reached', 'Turn off logging to save time, since the records of repeated calls only add storage cost'], answer: 2, hints: ['Loops need an exit that does not rely on the model.', 'What would you log to see this happening?'], explain: 'Models can get stuck. A hard step cap plus repeat detection bounds cost and latency regardless of model behaviour; logs let you diagnose the cause (often an unclear tool description or an error message that does not help).' },
      { id: 'l3-05-q5', skill: 'l3.tool-calling', type: 'code', difficulty: 3, q: 'Write dispatch(calls). Each call is {id, name, args} where args is an object or a JSON string. The TOOLS registry (add, get_temp) is inside the starter. Return, in order, {tool_call_id, content, is_error} for each call. Unknown tool: content "unknown tool: <name>". Args string that is not valid JSON: content "invalid arguments". A tool that throws: content is the error message. Success: content is String(result).', fnName: 'dispatch', starter: `function dispatch(calls) {
  const TOOLS = {
    add: ({ a, b }) => { if (typeof a !== 'number' || typeof b !== 'number') throw new Error('a and b must be numbers'); return a + b; },
    get_temp: ({ city }) => {
      const t = { london: 12, paris: 15, oslo: 3 }[String(city).toLowerCase()];
      if (t === undefined) throw new Error('unknown city: ' + city);
      return t;
    },
  };

}`, tests: T.dispatch, hints: ['Use Object.prototype.hasOwnProperty.call(TOOLS, call.name); a plain TOOLS[name] would find "toString".', 'Parse string args in their own try/catch before calling the tool.'], solution: `function dispatch(calls) {
  const TOOLS = {
    add: ({ a, b }) => { if (typeof a !== 'number' || typeof b !== 'number') throw new Error('a and b must be numbers'); return a + b; },
    get_temp: ({ city }) => {
      const t = { london: 12, paris: 15, oslo: 3 }[String(city).toLowerCase()];
      if (t === undefined) throw new Error('unknown city: ' + city);
      return t;
    },
  };
  return calls.map((c) => {
    const fail = (content) => ({ tool_call_id: c.id, content, is_error: true });
    if (!Object.prototype.hasOwnProperty.call(TOOLS, c.name)) return fail('unknown tool: ' + c.name);
    let args = c.args;
    if (typeof args === 'string') {
      try { args = JSON.parse(args); } catch (e) { return fail('invalid arguments'); }
    }
    try { return { tool_call_id: c.id, content: String(TOOLS[c.name](args)), is_error: false }; }
    catch (e) { return fail(e.message); }
  });
}`, explain: 'Every call gets exactly one result, even failures, so the model can react. The toString test shows why an allow-list check must use own-property lookup: a naive TOOLS[name] would find inherited object methods.' }
    ],
    takeaways: [
      'The model proposes tool calls; your code decides, validates and executes.',
      'Every tool request needs exactly one result message with the matching id, even if it is an error.',
      'Dispatcher = allow-list + argument validation + error handling + step cap + logging.',
      'Least privilege and human confirmation protect you when the model is wrong or manipulated.',
      'Field names for tools differ between providers; the loop is the same.'
    ],
    apply: "List three actions a support assistant might need. For each, write who is allowed to trigger it, what arguments it needs, and whether a person must confirm. You have just drafted a tool registry."
  },

  /* ---------------------------------------------------------------- 06 */
  {
    id: 'l3-06',
    title: 'Embeddings: search by meaning',
    hook: 'Keyword search misses "car" when the document says "automobile"; embeddings find them because they compare meaning, not spelling.',
    minutes: 25,
    skills: ['l3.embeddings'],
    core: true,
    code: true,
    deep: false,
    blocks: [
      { t: 'p', md: "An **embedding** is a list of numbers (a vector) that represents a piece of text, produced by a special model, so that texts with similar meaning get vectors that are close together. You send text to an embeddings endpoint and receive, for example, a list of a thousand or so numbers. By itself the list is meaningless; its value is in **comparing** it with other lists." },
      { t: 'widget', w: 'embeddings', props: { mode: 'neighbors' }, caption: 'A toy 2-D map. Real embeddings have hundreds to thousands of dimensions. Try this: click a word and see its nearest neighbours.' },
      { t: 'h', text: 'Comparing vectors' },
      { t: 'p', md: "The usual measure is **cosine similarity**: the cosine of the angle between two vectors. It is 1 when they point the same way, 0 when they are unrelated (at right angles), and -1 when opposite. It ignores length, so a long document and a short one about the same thing can still match. It is built from the **dot product**: multiply matching positions and add up, then divide by the two lengths." },
      { t: 'widget', w: 'dotproduct', props: {}, caption: 'Drag the arrows (or use arrow keys). Watch the cosine as the angle changes.' },
      { t: 'code', lang: 'js', src: `// Display only: calling an embeddings endpoint (run in your own environment).
// The URL, model name and response field names are provider-specific.
const res = await fetch(process.env.EMBEDDINGS_URL, {
  method: 'POST',
  headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.API_KEY },
  body: JSON.stringify({ model: process.env.EMBEDDING_MODEL, input: ['How do I reset my password?', 'Steps to change your login credentials'] }),
});
const data = await res.json();            // typically one vector per input text
// Store each vector next to its text (and metadata) so you can search later.`, caption: 'Several providers offer embedding models; some chat-model vendors do not, and open models can run locally.' },
      { t: 'callout', kind: 'warn', title: 'Rules you must not break', md: "Use **the same embedding model** for the documents and for the questions: vectors from different models live in unrelated spaces and cannot be compared. If you change model, re-embed everything. Also, similarity is not truth: the nearest text is merely the most *related*, and may not answer the question." },
      { t: 'predict', q: 'Two sentences get cosine similarity 0.93 from an embedding model. What can you safely conclude?', options: ['They mean exactly the same thing', 'They are very likely about related things, but check that they do not contradict (for example, a statement and its negation can score high)', 'One is a translation of the other', 'The model is wrong, because only 1.0 is a match'], answer: 1, explain: 'Embeddings capture topic and context, not logic. "The invoice was paid" and "The invoice was not paid" are usually close. Scores are also not comparable across different models, so choose thresholds from your own examples.', skill: 'l3.embeddings' },
      { t: 'widget', w: 'codeplay', props: { title: 'Cosine similarity', fnName: 'cosine', starter: `function cosine(a, b) {
  // Return the cosine similarity rounded to 3 decimals.
  // Different lengths -> null. Any zero-length vector (all zeros) -> 0.
}`, tests: T.cosine, hints: ['dot = sum of a[i]*b[i]; length = Math.sqrt(sum of squares).', 'Check for zero lengths before dividing.'] }, skill: 'l3.embeddings' },
      { t: 'try', prompt: 'You embed your help-centre articles and a customer asks "my card was declined". Describe two situations in which the closest article would be a poor answer, and what you could add to the system to catch them.', sample: "(1) No article covers the issue, so the nearest one is only loosely related; add a minimum-similarity threshold and an 'I could not find this' path. (2) The nearest article is about a similar but different problem (a declined card versus a refunded card) or is outdated; add a reranking or answer-checking step, metadata such as product and date, and let a human review a sample of low-confidence matches." }
    ],
    reteach: [
      { style: 'analogy', md: "Imagine a huge library where books are shelved not alphabetically but by *what they are about*: cooking near baking, football near rugby. An embedding is the book's shelf coordinates. To find books like your question, you work out the coordinates for your question, walk to that spot, and look at what is nearby. Cosine similarity is a way of asking 'how much do these two coordinate-lines point in the same direction?'" },
      { style: 'simple', md: "Embedding = text turned into numbers so that similar meanings give similar numbers. To compare two, use cosine similarity: near 1 is similar, near 0 unrelated. Always use one embedding model for everything you compare, and remember nearest means related, not correct." },
      { style: 'step-by-step', md: "To search: 1) Embed every document once and store the vectors. 2) When a question arrives, embed it with the same model. 3) Compute the cosine similarity between the question vector and each document vector. 4) Sort from highest to lowest. 5) Take the top k. 6) Apply a minimum score so you can say 'nothing relevant found'." }
    ],
    quiz: [
      { id: 'l3-06-q1', skill: 'l3.embeddings', type: 'mcq', difficulty: 2, q: 'A team embeds its documents with model A. Later they embed incoming questions with a newer model B because it is cheaper. Search quality collapses. Why?', options: ['Model B produces shorter vectors, and shorter vectors cannot be compared with longer ones', 'Cosine similarity cannot be applied once two different models have each produced vectors', 'The documents are too long for the newer model, so their embeddings were silently truncated', 'Different models use different vector spaces, so the documents must be re-embedded'], answer: 3, hints: ['What defines a "space" of embeddings?', 'Can you compare coordinates from two different maps?'], explain: 'Each model learns its own coordinate system. Comparing vectors across models is like comparing coordinates from two unrelated maps. Changing models means re-embedding the whole collection.' },
      { id: 'l3-06-q2', skill: 'l3.embeddings', type: 'multi', difficulty: 2, q: 'Which statements about cosine similarity are true? Select all that apply.', options: ['It measures the angle between vectors, ignoring their length', 'A value near 0 suggests the texts are unrelated', 'A high value guarantees the two texts agree with each other', 'Values from different embedding models are directly comparable', 'It can be computed from dot products'], answer: [0, 1, 4], hints: ['Think about what the formula divides by.', 'Related is not the same as agreeing.'], explain: 'Cosine is an angle-based score built from dot products. High scores mean related, not agreeing, and the scale differs per model, so thresholds must be tuned for the model you use.' },
      { id: 'l3-06-q3', skill: 'l3.embeddings', type: 'code', difficulty: 2, q: 'Write cosine(a, b) returning the cosine similarity rounded to 3 decimals. Return null if the lengths differ and 0 if either vector is all zeros.', fnName: 'cosine', starter: "function cosine(a, b) {\n  \n}", tests: T.cosine, hints: ['dot / (|a| * |b|)', 'Guard the zero-length case before dividing, otherwise you get NaN.'], solution: `function cosine(a, b) {
  if (a.length !== b.length) return null;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return Math.round((dot / (Math.sqrt(na) * Math.sqrt(nb))) * 1000) / 1000;
}`, explain: 'Cosine is the dot product divided by the product of lengths. The zero-vector guard avoids NaN, a common bug when empty text produces an all-zero vector.' },
      { id: 'l3-06-q4', skill: 'l3.embeddings', type: 'code', difficulty: 3, q: 'Write topK(query, items, k). items is an array of {id, vec}. Return the ids of the k items with the highest cosine similarity to query, best first. Break ties by id in ascending order. k of 0 returns []. If k exceeds the number of items return them all.', fnName: 'topK', starter: "function topK(query, items, k) {\n  \n}", tests: T.topK, hints: ['Compute a score for each item, then sort with a comparison that falls back to the id when scores are equal.', 'Compare ids with a < b ? -1 : 1 so the order is deterministic.'], solution: `function topK(query, items, k) {
  const cos = (a, b) => {
    let d = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return na === 0 || nb === 0 ? 0 : d / (Math.sqrt(na) * Math.sqrt(nb));
  };
  return items
    .map((it) => ({ id: it.id, s: cos(query, it.vec) }))
    .sort((x, y) => (y.s - x.s) || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0))
    .slice(0, Math.max(0, k))
    .map((x) => x.id);
}`, explain: 'Deterministic tie-breaking matters: without it, retrieval results can change between runs, which makes bugs and evaluations hard to reproduce. This is exact (brute-force) search, which Lesson 7 contrasts with approximate search.' }
    ],
    takeaways: [
      'An embedding is a vector for a text; similar meaning gives nearby vectors.',
      'Cosine similarity compares direction, built from the dot product; near 1 related, near 0 unrelated.',
      'Use one embedding model for everything you compare; changing models means re-embedding.',
      'Nearest means related, not true or even on point: use thresholds and checks.',
      'Brute-force top-k is a few lines and is correct for small collections.'
    ],
    apply: "Write ten short questions your users might ask and ten short answers or titles. Without running anything, pair them up by hand and note two pairs where the keywords do not overlap at all. Those are the pairs embeddings should win."
  }
];
