export const lessonsA = [
  /* ---------------------------------------------------------------- 01 */
  {
    id: 'l3-01',
    title: 'From user to builder: the programming you need',
    hook: 'You can already get good answers from a model; now your own code has to ask for them, and code needs a few basics first.',
    minutes: 25,
    skills: ['l3.js-basics'],
    core: true,
    code: true,
    deep: false,
    blocks: [
      { t: 'p', md: "In Levels 1 and 2 you typed prompts into a chat window. A person read the answer and decided what to do with it. In Level 3 **your program** sends the prompt and reads the answer, so the answer has to be something a program can use. That changes the skills you need, but only a few of them, and this lesson teaches exactly those." },
      { t: 'callout', kind: 'why', title: 'What you can do, and what is missing', md: "You can write clear prompts, give examples, and check outputs. What is missing is the plumbing: sending data between programs, reading it safely, and coping with things that take time or fail. We will use **JavaScript** because it runs right here in the browser; every idea transfers to Python, which we show beside it later." },
      { t: 'h', text: '1. JSON: the language programs use to talk' },
      { t: 'p', md: "**JSON** is plain text that describes data using only a few shapes: an **object** (named fields in curly braces), an **array** (an ordered list in square brackets), a **string** in double quotes, a **number**, `true` or `false`, and `null`. Model APIs send and receive JSON almost everywhere." },
      { t: 'code', lang: 'js', src: `// A JSON text is just a string until you parse it.
const text = '{"model": "demo", "messages": [{"role": "user", "content": "Hi"}], "temperature": 0.2}';

const request = JSON.parse(text);          // string -> JavaScript value
console.log(request.messages[0].content);   // "Hi"   (dot for fields, [n] for position)
console.log(request.messages.length);       // 1

const back = JSON.stringify(request);       // value -> string, ready to send
console.log(typeof back);                   // "string"`, caption: 'Runs anywhere JavaScript runs, including your browser console.' },
      { t: 'callout', kind: 'misconception', title: 'JSON is not a JavaScript object', md: "A JSON *text* is a string. Single quotes, trailing commas and comments are all invalid JSON, even though JavaScript objects allow some of them. `JSON.parse` throws an error on bad input, so always wrap it in `try/catch` when the text came from outside, and a model counts as outside." },
      { t: 'predict', q: 'What does JSON.parse(\'{"a": 1,}\') do?', options: ['Returns {a: 1}, ignoring the extra comma', 'Throws a SyntaxError because the trailing comma is not valid JSON', 'Returns null', 'Returns the string unchanged'], answer: 1, explain: 'JSON is stricter than JavaScript. A trailing comma makes the text invalid, and parse throws. Models sometimes produce exactly this kind of slip, which is why Lesson 4 builds a parse-validate-repair loop.', skill: 'l3.js-basics' },
      { t: 'h', text: '2. Arrays and objects: the two moves you use constantly' },
      { t: 'p', md: "Almost every task in this level is some version of: take a list, keep some items, change each item, add them up. Four methods cover it. `filter` keeps items that pass a test, `map` changes each item, `reduce` folds a list into one value, and `sort` orders it (give it a comparison function, or numbers sort as text)." },
      { t: 'code', lang: 'js', src: `const items = [{ name: 'a', price: 2, qty: 3 }, { name: 'b', price: 1.5, qty: 2 }, { name: 'c', price: 9, qty: 0 }];

const inStock = items.filter((it) => it.qty > 0);                 // keep
const names   = inStock.map((it) => it.name);                      // change -> ["a","b"]
const total   = inStock.reduce((sum, it) => sum + it.price * it.qty, 0);   // fold -> 9

const byPrice = [...items].sort((x, y) => y.price - x.price);      // copy first, then sort high to low
const price = items[0]?.price ?? 0;                                // ?. and ?? guard against missing values`, caption: 'Copy before sorting: sort changes the array it is called on.' },
      { t: 'h', text: '3. Async: the mental model' },
      { t: 'p', md: "A model call takes seconds. Your program must not freeze while it waits, so JavaScript lets a function say \"start this, and carry on; I will pick up the result later\". That function returns a **promise**: a receipt for a result that is not here yet. `await` pauses *that function* (not the whole program) until the receipt is honoured, and a failed receipt becomes a thrown error." },
      { t: 'predict', q: "What prints, in order?\n\nconsole.log('A'); setTimeout(() => console.log('B'), 0); Promise.resolve().then(() => console.log('C')); console.log('D');", options: ['A B C D', 'A D C B', 'A C D B', 'A D B C'], answer: 1, explain: "Synchronous lines run first (A, D). Then promise callbacks run (C), and timers run after that (B). You do not need to memorise queues; the lesson is that code after a call to something slow does not wait for it unless you await it.", skill: 'l3.js-basics' },
      { t: 'code', lang: 'js', src: `// Do not run as-is: this calls a real service. It shows the SHAPE of async code.
async function ask(question) {
  try {
    const res = await fetch('https://example.com/api/answer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);   // 4xx / 5xx do NOT throw by themselves
    return await res.json();                              // parse the body as JSON
  } catch (err) {
    return { error: String(err) };                        // network failure or bad status ends up here
  }
}`, caption: 'Run this pattern in your own environment against a service you control. The in-app exercises below use no network.' },
      { t: 'h', text: '4. HTTP in one picture' },
      { t: 'p', md: "Calling a web service is a conversation of two messages. Your **request** has a method (GET to read, POST to send), a URL, headers (small labelled settings such as `content-type`), and often a JSON body. The **response** has a status code, headers, and a body. Lesson 2 goes deeper; for now, notice that you already know all the parts." },
      { t: 'callout', kind: 'tip', title: 'How the exercises work in this level', md: "Everything you run in this app is a **pure function of JSON**: arguments in, a value out, no network. Real API calls appear as display code marked *run this in your own environment*. The pure functions are the part that really needs thought, and they are what you will test in production too." },
      { t: 'widget', w: 'codeplay', props: { title: 'Warm-up: parse and total', fnName: 'totalPrice', starter: `function totalPrice(jsonText) {
  // jsonText is a JSON array like '[{"price":2,"qty":3},{"price":1.5}]'
  // Return the sum of price * qty (qty defaults to 1).
  // If the text is not valid JSON, or not an array, return null.
}`, tests: [{ args: ['[{"price":2,"qty":3},{"price":1.5}]'], expect: 7.5 }, { args: ['[]'], expect: 0 }, { args: ['not json'], expect: null }, { args: ['{"price":1}'], expect: null }], hints: ['Wrap JSON.parse in try/catch and return null from the catch.', 'Check Array.isArray(data) before looping.', 'Use (item.qty ?? 1) so a missing qty counts as one.'] }, caption: 'Write it, press Run, and read the failing test messages: they are your debugger.', skill: 'l3.js-basics' },
      { t: 'try', prompt: 'In two or three sentences, explain to a friend why `await fetch(...)` does not throw an error when the server answers with status 500, and what you must check instead.', sample: "`fetch` only rejects when the request could not be completed at all (for example no network). A server that replies with 500 has still replied, so the promise resolves normally. You must check `res.ok` or `res.status` yourself and decide what to do with a failure." }
    ],
    reteach: [
      { style: 'analogy', md: "Think of ordering at a restaurant. The **menu card** you hand over is JSON: a tidy, agreed format both sides can read. The **waiter's receipt** is a promise: you are not holding your food yet, but you can go and talk to friends (other code runs) and come back when your name is called (`await`). The **kitchen's reply** might be 'sorry, we are out of that' (an HTTP error status), which is a reply, not a crash, so you have to read it." },
      { style: 'simple', md: "Four ideas. (1) JSON is text in a strict format; parse it to use it, and expect parsing to fail sometimes. (2) Arrays are lists and objects are labelled boxes; filter, map and reduce handle most list chores. (3) Slow things return a promise; use await inside an async function. (4) A web call is a request out and a response back, and a bad status is still a response." },
      { style: 'step-by-step', md: "To total a list from JSON text: 1) call JSON.parse inside try/catch; 2) if it threw, return the fallback; 3) check it is an array; 4) reduce it, starting from 0; 5) return the number. Write the failure cases first, because they are where beginners lose time." }
    ],
    quiz: [
      { id: 'l3-01-q1', skill: 'l3.js-basics', type: 'mcq', difficulty: 1, q: 'Which of these is valid JSON text?', options: ["{'name': 'Ada'}", '{"name": "Ada",}', '{"name": "Ada", "langs": ["JS", "Python"]}', '{name: "Ada"}'], answer: 2, wrong: { '0': 'Single quotes are fine in JavaScript but not in JSON.', '1': 'Trailing commas are not allowed in JSON.', '3': 'JSON keys must be in double quotes.' }, hints: ['JSON is stricter than JavaScript object syntax.', 'Look at quotes and commas.'], explain: 'Only the third option follows every JSON rule: double-quoted keys and strings, no trailing comma. The others are valid JavaScript objects in some cases but fail JSON.parse, which is why model output must be parsed defensively.' },
      { id: 'l3-01-q2', skill: 'l3.js-basics', type: 'mcq', difficulty: 2, q: 'What does this print?', code: "const nums = [10, 9, 1];\nconsole.log(nums.sort());", options: ['[1, 9, 10]', '[10, 9, 1]', '[1, 10, 9]', '[9, 10, 1]'], answer: 2, wrong: { '0': 'That would be a numeric sort; without a comparison function sort compares as text.' }, hints: ['Without a comparison function, sort converts items to strings.', 'Compare "1", "10" and "9" as text, character by character.'], explain: 'Default sort compares as text, so "1" < "10" < "9". Pass (a, b) => a - b for numeric order. This bug appears all the time when sorting similarity scores.' },
      { id: 'l3-01-q3', skill: 'l3.js-basics', type: 'mcq', difficulty: 2, q: 'A teammate writes `const res = await fetch(url); const data = await res.json();` and says "it handles errors because await would throw". The server returns 503 with a JSON error body. What happens?', options: ['fetch throws, so the code stops safely', 'No exception: data holds the error body and the code carries on as if it were a normal result', 'res.json() returns null', 'The promise never settles'], answer: 1, hints: ['What does fetch consider a failure?', 'The server did answer.'], explain: 'fetch rejects only when no response is received. A 503 is a response, so the code continues with error data. You must check res.ok. Assuming "await will throw" is a classic cause of silent failures.' },
      { id: 'l3-01-q4', skill: 'l3.js-basics', type: 'order', difficulty: 2, q: 'Put these steps of a safe "read model output" function in order.', items: ['Receive the raw text', 'Try JSON.parse inside try/catch', 'Check the result is the shape you expect', 'Use the value'], hints: ['You cannot check a shape before you have a value.', 'Never use data before validating it.'], explain: 'Parse first (guarded), then validate, then use. Skipping validation is how malformed model output becomes a crash or a bug later.' },
      { id: 'l3-01-q5', skill: 'l3.js-basics', type: 'code', difficulty: 2, q: 'Write totalPrice(jsonText). The text is a JSON array of objects with a price and an optional qty (default 1). Return the sum of price * qty. Return null if the text is invalid JSON or is not an array.', fnName: 'totalPrice', starter: "function totalPrice(jsonText) {\n  \n}", tests: [{ args: ['[{"price":2,"qty":3},{"price":1.5}]'], expect: 7.5 }, { args: ['[]'], expect: 0 }, { args: ['not json'], expect: null }, { args: ['{"price":1}'], expect: null }, { args: ['[{"price":4,"qty":0}]'], expect: 0 }], hints: ['try { JSON.parse } catch { return null }', 'Array.isArray, then reduce with an initial value of 0.'], solution: `function totalPrice(jsonText) {
  let data;
  try { data = JSON.parse(jsonText); } catch (e) { return null; }
  if (!Array.isArray(data)) return null;
  return data.reduce((sum, it) => sum + it.price * (it.qty ?? 1), 0);
}`, explain: 'The shape is parse inside try/catch, validate the type, then compute. Note the qty of 0 case: using || 1 instead of ?? 1 would wrongly treat zero as missing.' }
    ],
    takeaways: [
      'JSON is strict text; parse it defensively and validate what you get.',
      'filter, map and reduce handle most list work; copy before you sort.',
      'A promise is a receipt for a result that has not arrived; await collects it inside an async function.',
      'A bad HTTP status is still a response; check it yourself.',
      'In this level, exercises are pure functions of JSON: easy to test, and the same ones you will test in production.'
    ],
    apply: "Open your browser's developer console (usually F12), paste the JSON example from this lesson, and change it: break it with a trailing comma and read the exact error message."
  },

  /* ---------------------------------------------------------------- 02 */
  {
    id: 'l3-02',
    title: 'APIs, HTTP and keeping secrets',
    hook: 'A leaked API key can be abused within minutes and you will pay the bill, so learn where keys live before you write a single model call.',
    minutes: 20,
    skills: ['l3.http-apis', 'l3.secrets'],
    core: true,
    code: false,
    deep: false,
    blocks: [
      { t: 'p', md: "An **API** (application programming interface) is a doorway one program offers to other programs. A **web API** is that doorway over **HTTP**, the same protocol browsers use. When your code calls a model, it sends an HTTP request to the provider's **endpoint** (a specific URL) and reads the HTTP response." },
      { t: 'h', text: 'Anatomy of a request and a response' },
      { t: 'compare', title: 'The two messages in an HTTP conversation', cols: ['Part', 'Request (you send)', 'Response (you receive)'], rows: [['First line', 'Method and URL, such as POST to an endpoint', 'Status code, such as 200 or 429'], ['Headers', 'Labels: content type, credentials, API version', 'Labels: content type, request id, rate-limit hints, retry-after'], ['Body', 'Usually JSON: your prompt and settings', 'Usually JSON: the result, or an error object']] },
      { t: 'p', md: "Status codes group by their first digit: **2xx** worked, **4xx** your request was wrong or refused (bad body, missing credentials, no permission, too many requests), **5xx** the server had a problem. That grouping decides your reaction: fix the request for most 4xx, wait and retry for 429 and 5xx. Lesson 3 returns to this." },
      { t: 'code', lang: 'bash', src: `# Run this in your own environment, with the key set in your shell, never typed into code.
# (Header names and the version string are provider-specific: copy them from your provider's docs.)
curl https://api.example-provider.com/v1/chat \\
  -H "content-type: application/json" \\
  -H "authorization: Bearer $PROVIDER_API_KEY" \\
  -d '{"model": "MODEL_NAME", "messages": [{"role": "user", "content": "Say hello"}]}'`, caption: 'Placeholders only. Notice that the key is read from an environment variable, $PROVIDER_API_KEY.' },
      { t: 'callout', kind: 'tip', title: 'Provider-specific vs durable', md: "Durable: method, URL, headers, JSON body, status codes, a key sent in a header. Provider-specific: the exact URL, the header name for the key (some use `authorization: Bearer`, some use a custom header), required version headers, and field names. Always copy those from the official documentation of the provider you use." },
      { t: 'h', text: 'Secrets: the rules' },
      { t: 'p', md: "An **API key** is a password for your account. Whoever holds it can make calls that you pay for and may read data tied to your account. Treat it like a bank card number." },
      { t: 'list', items: ["**Never put a key in code** that goes into version control, even in a private repository: history keeps it forever.", "**Never put a key in a web page or mobile app.** Anything shipped to the user's device can be extracted. Browser code must call *your* server, and your server holds the key.", "**Load keys from the environment** (environment variables or a secrets manager), one key per environment, with the smallest permissions and spending limits the provider offers.", "**Never log a key** or a full request header. Logging libraries and error reports love to capture headers.", "**Rotate on suspicion.** If a key might have leaked, revoke it first and investigate second."] },
      { t: 'widget', w: 'flow', props: { title: 'Where the key lives', height: 300, nodes: [{ id: 'user', label: 'User browser or app', x: 12, y: 50, kind: 'input', note: 'Untrusted. Anything here can be read by the user. No keys, ever.' }, { id: 'server', label: 'Your server', x: 45, y: 50, kind: 'process', note: 'Trusted. Holds the key in an environment variable, checks who is calling, applies limits.' }, { id: 'vault', label: 'Secrets manager / env vars', x: 45, y: 15, kind: 'store', note: 'Where the key is stored at rest, outside the code repository.' }, { id: 'provider', label: 'Model provider API', x: 82, y: 50, kind: 'model', note: 'Receives the key in a request header and bills the account that owns it.' }], edges: [['user', 'server', 'your own API'], ['vault', 'server', 'key loaded at start'], ['server', 'provider', 'request + key']], steps: [{ show: ['user', 'server'], text: 'The user talks only to your server, using your own login or session.' }, { show: ['vault', 'server'], text: 'Your server loads the key from the environment at start-up.' }, { show: ['server', 'provider'], text: 'Only the server adds the key and calls the provider.' }, { show: ['user', 'server', 'vault', 'provider'], text: 'The key never crosses to the left of the server.' }] }, caption: 'Click through the steps, then click a node to read its note.' },
      { t: 'callout', kind: 'misconception', title: '"My repo is private, so it is fine"', md: "Private repositories get forked, cloned onto laptops, made public by mistake, and read by contractors. Automated scanners also hunt public repositories for key patterns within minutes of a push. Assume anything committed has leaked." },
      { t: 'try', prompt: "You have just noticed your teammate committed an API key to the team repository yesterday. List, in order, what you do in the first thirty minutes.", sample: "1) Revoke or rotate the key in the provider console straight away, because deleting the commit does not un-leak it. 2) Create a new key and put it in the environment or secrets manager, not in code. 3) Check the provider's usage page for calls you do not recognise and set a spending limit. 4) Remove the key from the code and, if policy allows, from history; add a secret scanner to the repository. 5) Write down what happened, without blaming, and how to prevent it." }
    ],
    reteach: [
      { style: 'analogy', md: "Your API key is the key to a company credit card kept in your server's locked drawer. Customers (browsers) ask the receptionist (your server) to buy things for them; the receptionist checks the request is reasonable and then uses the card. If you hand customers the card itself, they can spend freely, and you will not find out until the statement arrives." },
      { style: 'simple', md: "HTTP is request out, response back. The status code's first digit tells you who is at fault: 4 means you, 5 means them. The key goes in a header, is read from the environment on a server you control, and is never in code, a browser, or a log." },
      { style: 'technical', md: "A web API call is an HTTP exchange: method and URL, request headers, optional body; then status line, response headers and body. Authentication is typically a bearer token or custom header. Secrets management means the credential's lifecycle (issue, store, inject, rotate, revoke) is handled outside source control, with least privilege, per-environment keys and spend caps. Client-side code is untrusted by definition, so credentials and authorisation decisions belong on the server." }
    ],
    quiz: [
      { id: 'l3-02-q1', skill: 'l3.secrets', type: 'mcq', difficulty: 2, q: 'A startup builds a mobile chat app. To save time, the developer puts the provider API key inside the app and calls the provider directly. What is the correct assessment?', options: ['Fine, as long as the app code is obfuscated', 'Fine, because the key is only used over HTTPS', 'Unsafe: anyone can extract the key from the app, so calls should go through the startup\'s own server that holds the key', 'Fine for a prototype, and becomes unsafe only at scale'], answer: 2, wrong: { '0': 'Obfuscation slows people down but does not stop extraction, and network traffic can be inspected.', '1': 'HTTPS protects data in transit from third parties, not from the user who owns the device.', '3': 'Abuse can start with the first public download, not at scale.' }, hints: ['Who controls the device the app runs on?', 'Where could the key live so users never receive it?'], explain: 'Anything shipped to a user device can be read by that user. The key must stay on a server you control, which also gives you a place to add logins, limits and logging.' },
      { id: 'l3-02-q2', skill: 'l3.http-apis', type: 'mcq', difficulty: 1, q: 'A request returns status 401. What is the most likely cause?', options: ['The provider\'s servers crashed', 'The request was missing valid credentials', 'You sent too many requests', 'The response body was too large'], answer: 1, hints: ['4xx means the problem is with the request.', 'Think authentication.'], explain: 'A 401 conventionally means authentication failed or is missing, for example a wrong, expired or absent key. A crash would be 5xx and too many requests would be 429.' },
      { id: 'l3-02-q3', skill: 'l3.secrets', type: 'multi', difficulty: 2, q: 'Which of these are safe places for a production API key? Select all that apply.', options: ['A server environment variable or secrets manager', 'A constant in the web app\'s JavaScript bundle', 'A .env file that is listed in .gitignore, on the server', 'A commented-out line in the repository "for later"', 'A support ticket so a colleague can help debug'], answer: [0, 2], hints: ['Think about who can read each place.', 'Version control and tickets keep history.'], explain: 'Environment variables, secrets managers and a git-ignored env file on the server keep the key out of shared history. A bundle is delivered to every visitor, a commented line is still committed, and tickets are widely readable and permanent.' },
      { id: 'l3-02-q4', skill: 'l3.secrets', type: 'order', difficulty: 2, q: 'Order the response to a key that was accidentally pushed to a public repository.', items: ['Revoke the exposed key', 'Create a new key and store it in the secrets manager', 'Review provider usage for suspicious calls', 'Add secret scanning to prevent a repeat'], hints: ['Stop the damage before investigating.', 'Prevention comes last.'], explain: 'Revoking first stops further abuse; deleting the commit is not enough because copies exist. Then restore service, audit, and prevent.' },
      { id: 'l3-02-q5', skill: 'l3.http-apis', type: 'code', difficulty: 2, q: 'Write redactHeaders(headers). It receives an object of HTTP headers and returns a NEW object for logging in which the values of authorization, x-api-key, api-key and cookie (compared case-insensitively) are replaced by "[REDACTED]". Other headers are unchanged.', fnName: 'redactHeaders', starter: "function redactHeaders(headers) {\n  \n}", tests: [{ args: [{ 'Authorization': 'Bearer abc', 'Content-Type': 'application/json' }], expect: { 'Authorization': '[REDACTED]', 'Content-Type': 'application/json' } }, { args: [{ 'X-API-Key': 'k1', cookie: 'a=b', accept: '*/*' }], expect: { 'X-API-Key': '[REDACTED]', cookie: '[REDACTED]', accept: '*/*' } }, { args: [{}], expect: {} }, { args: [{ 'x-request-id': 'r1' }], expect: { 'x-request-id': 'r1' } }], hints: ['Object.entries(headers) gives you [name, value] pairs.', 'Compare name.toLowerCase() with a list of sensitive names, then build a new object with Object.fromEntries.'], solution: `function redactHeaders(headers) {
  const secret = ['authorization', 'x-api-key', 'api-key', 'cookie'];
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, secret.includes(k.toLowerCase()) ? '[REDACTED]' : v]));
}`, explain: 'Redaction must be case-insensitive because HTTP header names are, and it must return a copy so the real request is not altered. Logging redacted headers keeps debugging power without storing credentials.' }
    ],
    takeaways: [
      'An HTTP exchange is request (method, URL, headers, body) then response (status, headers, body).',
      '4xx usually means fix your request; 429 and 5xx are usually worth retrying.',
      'Keys live on servers you control, loaded from the environment, never in code, browsers, apps or logs.',
      'If a key might have leaked, revoke it first.',
      'Header names, URLs and versions are provider-specific; copy them from the official docs.'
    ],
    apply: "Search one of your own projects for the words key, secret and token. Anything that looks like a real credential in a file under version control is a finding to rotate."
  },

  /* ---------------------------------------------------------------- 03 */
  {
    id: 'l3-03',
    title: 'Calling a model API: messages, limits and retries',
    hook: 'The first successful call is easy; the code that survives timeouts, rate limits and long conversations is what makes it an application.',
    minutes: 30,
    skills: ['l3.model-api', 'l3.errors-retries'],
    core: true,
    code: true,
    deep: false,
    blocks: [
      { t: 'p', md: "A chat-style model API is, at heart, a function: you send the **conversation so far** and settings; you receive the **next assistant turn** and some bookkeeping. The model remembers nothing between calls. If your assistant seems to remember, that is because your code sent the earlier turns again." },
      { t: 'h', text: 'Anatomy of a call' },
      { t: 'list', items: ["**Model name**: which model to use. Names change often, so keep it in configuration, not scattered through code.", "**Messages array**: ordered turns, each with a **role** (typically user or assistant) and **content**. Content may be plain text or a list of typed parts such as images.", "**System prompt**: standing instructions about role, rules and format. Some providers take it as a separate field and others as a first message; the concept is the same.", "**Output limit**: the maximum number of tokens the model may generate. Hit it and the answer is cut off mid-sentence.", "**Sampling settings** (such as temperature): control how adventurous the choice of the next token is. Which settings exist, and their ranges, vary by provider and model."] },
      { t: 'current', key: 'l3-message-shapes' },
      { t: 'code', lang: 'js', src: `// Display only: run in your own environment with your provider's official SDK or fetch.
// Field names below are illustrative; copy the real ones from your provider's reference.
const body = {
  model: process.env.MODEL_NAME,
  max_tokens: 500,                         // output limit (name varies by provider)
  system: 'You are a concise support assistant. Answer in two sentences.',
  messages: [
    { role: 'user', content: 'My invoice is wrong.' },
    { role: 'assistant', content: 'Sorry about that. What is the invoice number?' },
    { role: 'user', content: 'INV-204' },     // the new turn goes last
  ],
};
// response (shape varies): { content: [...], stop_reason: '...', usage: { input_tokens: 61, output_tokens: 24 } }`, caption: 'Run this pattern in your own environment.' },
      { t: 'code', lang: 'python', src: `# Display only: run in your own environment.
import os, requests

body = {
    "model": os.environ["MODEL_NAME"],
    "max_tokens": 500,
    "system": "You are a concise support assistant. Answer in two sentences.",
    "messages": [{"role": "user", "content": "My invoice is wrong."}],
}
r = requests.post(os.environ["API_URL"], json=body, headers={"authorization": "Bearer " + os.environ["API_KEY"]}, timeout=60)
r.raise_for_status()      # turns 4xx/5xx into an exception
print(r.json())`, caption: 'The same call in Python. The official SDKs wrap this and usually add retries for you.' },
      { t: 'callout', kind: 'warn', title: 'Always read why generation stopped', md: "Responses carry a stop reason. A normal finish and \"hit the output limit\" look identical in the text but are very different: the second means the answer is incomplete. Check it, and log token usage on every call; that is how you find cost problems." },
      { t: 'h', text: 'Your code owns the conversation' },
      { t: 'p', md: "Because the model is stateless, your code must build the messages array each time. Long chats eventually exceed the model's context window and cost more per turn, so a common first policy is to keep only the last few turns plus the system prompt. Alternating roles matters to many APIs, so a trimmed history should not start with an assistant turn." },
      { t: 'widget', w: 'codeplay', props: { title: 'Build the messages', fnName: 'buildMessages', starter: `function buildMessages(system, history, userText, maxTurns) {
  // history: [{role:'user'|'assistant', content}] oldest first
  // Keep only the last maxTurns*2 history items.
  // If the first kept item is an assistant turn, drop it.
  // Append {role:'user', content: userText.trim()}.
  // If userText is empty after trimming, return null.
  // Return { system, messages }.
}`, tests: [{ args: ['Be brief.', [], ' hello ', 2], expect: { system: 'Be brief.', messages: [{ role: 'user', content: 'hello' }] } }, { args: ['S', [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'user', content: 'c' }, { role: 'assistant', content: 'd' }], 'e', 1], expect: { system: 'S', messages: [{ role: 'user', content: 'c' }, { role: 'assistant', content: 'd' }, { role: 'user', content: 'e' }] } }, { args: ['S', [{ role: 'user', content: 'a' }], '   ', 1], expect: null }], hints: ['history.slice(-n) with n = maxTurns * 2; careful: slice(-0) returns everything.', 'After slicing, if kept[0] && kept[0].role === "assistant", kept.shift().'] }, skill: 'l3.model-api' },
      { t: 'h', text: 'When things go wrong' },
      { t: 'current', key: 'l3-error-handling-practice' },
      { t: 'p', md: "**Retry only what is safe and likely to succeed.** Retry network timeouts, 429 and 5xx. Do not retry most other 4xx: sending the same bad request again just fails again. Also think about **idempotency**: repeating a read-only call is harmless, but repeating a call that triggers an action (send an email, charge a card) could do it twice. Keep such actions outside the retry loop, or make them safe to repeat with a unique request key." },
      { t: 'p', md: "**Exponential backoff** means waiting longer after each failure: for example 500 ms, 1 s, 2 s, 4 s, capped at some maximum. **Jitter** adds randomness so a thousand clients that failed together do not all retry together. If the server tells you how long to wait, obey that instead." },
      { t: 'predict', q: 'Base delay 500 ms, doubling each time, cap 4000 ms. What are the waits before retries 1 to 6?', options: ['500, 1000, 1500, 2000, 2500, 3000', '500, 1000, 2000, 4000, 4000, 4000', '500, 1000, 2000, 4000, 8000, 16000', '500, 500, 500, 500, 500, 500'], answer: 1, explain: 'Each wait doubles (500, 1000, 2000, 4000) until the cap stops further growth, so the last two stay at 4000. The uncapped sequence would reach silly waits quickly, and the linear one does not back off fast enough to relieve a struggling server.', skill: 'l3.errors-retries' },
      { t: 'widget', w: 'codeplay', props: { title: 'Compute the schedule', fnName: 'backoffSchedule', starter: `function backoffSchedule(retries, baseMs, capMs) {
  // Return an array of waits (ms), one per retry:
  // baseMs, 2*baseMs, 4*baseMs, ... never more than capMs.
  // retries = 0 -> []
}`, tests: [{ args: [4, 500, 4000], expect: [500, 1000, 2000, 4000] }, { args: [6, 500, 4000], expect: [500, 1000, 2000, 4000, 4000, 4000] }, { args: [0, 500, 4000], expect: [] }], hints: ['Math.min(capMs, baseMs * 2 ** i)', 'Build the array with a for loop over i from 0 to retries - 1.'] }, skill: 'l3.errors-retries' },
      { t: 'try', prompt: 'Your app calls a model to draft a customer email and then, in the same function, sends it. The function is wrapped in a retry loop for 5xx errors. Describe the bug that could occur and how to fix the design.', sample: "If the send succeeds but the connection drops before your code sees the success (or the failure happens after the send), the retry will draft and send the email again, so the customer receives duplicates. Fix: retry only the model call. Do the send once, after the draft is final, and make it idempotent (for example a unique message key that the mail service de-duplicates)." }
    ],
    reteach: [
      { style: 'analogy', md: "Imagine phoning a clerk who has no memory of previous calls. Each time you ring, you must read out the whole file so far, then ask your new question. That file is the messages array. If the line is busy you do not redial every second (you would jam the exchange); you wait a bit, then a bit longer, and you add a random pause so everyone who was cut off does not redial at the exact same instant. That is backoff with jitter." },
      { style: 'simple', md: "A model call needs: which model, the conversation so far, instructions, and a limit. You get back text plus a reason it stopped and a token count. Keep the model name in config, trim long conversations, and log usage. On failure: retry only temporary problems, wait longer each time, and never retry something that has a side effect unless it is safe to repeat." },
      { style: 'step-by-step', md: "Resilient call, in order: 1) Build the request from config. 2) Send it with a timeout. 3) If the status is 2xx, check the stop reason and log usage. 4) If it is 429, 5xx or a timeout and you have attempts left, wait (honour any retry hint, otherwise backoff with jitter) and go to step 2. 5) Otherwise give up with a clear error that includes the request id." }
    ],
    quiz: [
      { id: 'l3-03-q1', skill: 'l3.errors-retries', type: 'mcq', difficulty: 2, placement: true, q: 'Your service gets HTTP 429 from a model API at peak time. What is the best first design response?', options: ['Retry immediately in a tight loop until it works', 'Retry with exponentially growing waits plus jitter, honouring any retry hint, with a maximum number of attempts', 'Switch to a different key on every failure to avoid the limit', 'Treat it as a permanent failure and show an error'], answer: 1, wrong: { '0': 'A tight loop adds load exactly when capacity is short and may deepen the limit.', '2': 'Rotating keys to evade a limit usually breaches the provider\'s terms and hides the real capacity problem.', '3': 'Rate limits are normally transient; giving up wastes recoverable requests.' }, hints: ['Is a rate limit usually temporary?', 'What happens if every client retries at the same instant?'], explain: 'A 429 says "slow down". Backoff with jitter spreads retries out and honours the server\'s hint, while an attempt cap prevents endless loops. A spend-cap 429 may not clear by waiting, which is why a cap and clear error still matter.' },
      { id: 'l3-03-q2', skill: 'l3.model-api', type: 'mcq', difficulty: 2, q: 'A chatbot "forgets" the user\'s name after a few messages even though the conversation continues in the UI. The code sends only the newest user message each call. What is the real cause?', options: ['The model\'s memory is too small', 'The model is stateless: earlier turns were never included in the messages array', 'The temperature is too high', 'The system prompt is too long'], answer: 1, hints: ['What does the model receive on each call?', 'Where does "memory" come from?'], explain: 'Chat APIs do not store your conversation. Unless you send earlier turns (or a summary), the model cannot know them. Temperature affects style, not what information is available.' },
      { id: 'l3-03-q3', skill: 'l3.model-api', type: 'short', difficulty: 2, q: 'A response arrives and the text ends mid-sentence. Name the response field you should check first, and what it tells you.', accept: ['stop.?reason|finish.?reason', 'max.?tokens|output limit|token limit|length'], model: 'The stop (finish) reason: it will show the answer hit the output token limit and is truncated, so raise the limit, shorten the answer, or continue.', hints: ['Responses include a reason generation ended.', 'It usually names the limit you set.'], explain: 'The stop reason distinguishes a natural finish from hitting the output limit. Checking it (and logging it) turns a mysterious truncation into an obvious configuration issue.' },
      { id: 'l3-03-q4', skill: 'l3.errors-retries', type: 'multi', difficulty: 2, q: 'Which failures are usually worth an automatic retry with backoff? Select all that apply.', options: ['Network timeout', 'HTTP 429 rate limit', 'HTTP 500 server error', 'HTTP 400 invalid request (for example malformed JSON in your body)', 'HTTP 401 with a wrong API key'], answer: [0, 1, 2], hints: ['Would sending the identical request again change anything?', 'Transient versus permanent.'], explain: 'Timeouts, rate limits and server errors are often transient. A 400 or 401 will fail identically until you fix the request or credentials, so retrying only adds noise and cost.' },
      { id: 'l3-03-q5', skill: 'l3.model-api', type: 'code', difficulty: 2, q: 'Write buildMessages(system, history, userText, maxTurns). Keep the last maxTurns*2 history items; if the first kept item is an assistant turn, drop it; append {role:"user", content:userText.trim()}. If trimmed userText is empty return null. Return {system, messages}.', fnName: 'buildMessages', starter: "function buildMessages(system, history, userText, maxTurns) {\n  \n}", tests: [{ args: ['Be brief.', [], ' hello ', 2], expect: { system: 'Be brief.', messages: [{ role: 'user', content: 'hello' }] } }, { args: ['S', [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'user', content: 'c' }, { role: 'assistant', content: 'd' }], 'e', 1], expect: { system: 'S', messages: [{ role: 'user', content: 'c' }, { role: 'assistant', content: 'd' }, { role: 'user', content: 'e' }] } }, { args: ['S', [{ role: 'user', content: 'a' }], '   ', 1], expect: null }, { args: ['S', [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }], 'c', 0], expect: { system: 'S', messages: [{ role: 'user', content: 'c' }] } }, { args: ['S', [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'user', content: 'c' }], 'd', 1], expect: { system: 'S', messages: [{ role: 'user', content: 'c' }, { role: 'user', content: 'd' }] } }], hints: ['history.slice(-n) returns everything when n is 0; handle that case separately.', 'Trim first and return null early.'], solution: `function buildMessages(system, history, userText, maxTurns) {
  const text = String(userText).trim();
  if (!text) return null;
  const n = maxTurns * 2;
  let kept = n > 0 ? history.slice(-n) : [];
  if (kept.length && kept[0].role === 'assistant') kept = kept.slice(1);
  return { system, messages: [...kept, { role: 'user', content: text }] };
}`, explain: 'The maxTurns 0 case is the trap: slice(-0) is slice(0) and keeps everything. The last test shows odd-length trimming: only the two newest items are kept, and no assistant turn leads.' },
      { id: 'l3-03-q6', skill: 'l3.errors-retries', type: 'code', difficulty: 2, q: 'Write backoffSchedule(retries, baseMs, capMs): an array with one wait per retry, doubling from baseMs and never exceeding capMs. retries 0 gives an empty array.', fnName: 'backoffSchedule', starter: "function backoffSchedule(retries, baseMs, capMs) {\n  \n}", tests: [{ args: [4, 500, 4000], expect: [500, 1000, 2000, 4000] }, { args: [6, 500, 4000], expect: [500, 1000, 2000, 4000, 4000, 4000] }, { args: [0, 500, 4000], expect: [] }, { args: [3, 1000, 500], expect: [500, 500, 500] }], hints: ['Math.min(capMs, baseMs * 2 ** i)', 'The cap applies even to the first wait when base is larger than the cap.'], solution: `function backoffSchedule(retries, baseMs, capMs) {
  const out = [];
  for (let i = 0; i < retries; i++) out.push(Math.min(capMs, baseMs * 2 ** i));
  return out;
}`, explain: 'Doubling then capping gives quick early retries for blips and bounded waits for long outages. In real code you would add random jitter to each wait, which is left out here so the answer is testable.' }
    ],
    takeaways: [
      'Chat models are stateless: your code builds the messages array every call.',
      'Check the stop reason and log token usage on every response.',
      'Retry only transient failures (timeouts, 429, 5xx), with capped exponential backoff and jitter.',
      'Never wrap a side effect (send, charge) inside a retry loop without idempotency.',
      'Parameter names and shapes are provider-specific; use the official SDK and reference.'
    ],
    apply: "Take any API you use at work and write down: what happens in your code on a timeout, on a 429, and on a 400. If the answer is 'I do not know', that is your next task."
  }
];
