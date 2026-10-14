// jsonschema: editable JSON + schema presets, a real mini validator, and typical LLM structured-output mistakes with a repair lesson.
export const meta = { name: 'jsonschema', title: 'JSON schema checker', blurb: 'Validate JSON against a schema, see human-readable errors, and learn how to repair typical LLM output mistakes.', level: 2, skills: ['l2.structured'] };

function h(tag, a = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [n, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (n === 'class') e.className = v; else if (n === 'style') e.style.cssText = v; else if (n === 'text') e.textContent = v;
    else if (n.startsWith('on')) e.addEventListener(n.slice(2), v); else e.setAttribute(n, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
const isType = (v, t) => (t === 'number' ? typeof v === 'number' && isFinite(v) : t === 'integer' ? Number.isInteger(v) : typeOf(v) === t);
const show = (v) => { const s = JSON.stringify(v); return s && s.length > 40 ? s.slice(0, 37) + '...' : s; };

// Real (small) validator: type, required, properties, additionalProperties:false, enum, minimum, maximum, min/maxLength, pattern, items, min/maxItems.
export function validate(schema, v, path = '$', errs = []) {
  const add = (rule, msg) => errs.push({ path, rule, msg });
  if (schema.type) {
    const ts = [].concat(schema.type);
    if (!ts.some((t) => isType(v, t))) { add('type', `Expected ${ts.join(' or ')} but got ${typeOf(v)} (${show(v)}).`); return errs; }
  }
  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(v))) add('enum', `Value ${show(v)} is not one of: ${schema.enum.map((e) => JSON.stringify(e)).join(', ')}.`);
  if (typeof v === 'number') {
    if (schema.minimum != null && v < schema.minimum) add('minimum', `${v} is below the minimum of ${schema.minimum}.`);
    if (schema.maximum != null && v > schema.maximum) add('maximum', `${v} is above the maximum of ${schema.maximum}.`);
  }
  if (typeof v === 'string') {
    if (schema.minLength != null && v.length < schema.minLength) add('minLength', `Text is ${v.length} characters; at least ${schema.minLength} needed.`);
    if (schema.maxLength != null && v.length > schema.maxLength) add('maxLength', `Text is ${v.length} characters; at most ${schema.maxLength} allowed.`);
    if (schema.pattern) { try { if (!new RegExp(schema.pattern).test(v)) add('pattern', `"${v}" does not match the required pattern ${schema.pattern}.`); } catch (e) { /* bad pattern ignored */ } }
  }
  if (Array.isArray(v)) {
    if (schema.minItems != null && v.length < schema.minItems) add('minItems', `List has ${v.length} item(s); at least ${schema.minItems} needed.`);
    if (schema.maxItems != null && v.length > schema.maxItems) add('maxItems', `List has ${v.length} items; at most ${schema.maxItems} allowed.`);
    if (schema.items) v.forEach((x, i) => validate(schema.items, x, `${path}[${i}]`, errs));
  }
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const k of schema.required || []) if (!(k in v)) errs.push({ path: `${path}.${k}`, rule: 'required', msg: `Required field "${k}" is missing.` });
    const props = schema.properties || {};
    for (const k of Object.keys(v)) {
      if (props[k]) validate(props[k], v[k], `${path}.${k}`, errs);
      else if (schema.additionalProperties === false) errs.push({ path: `${path}.${k}`, rule: 'additionalProperties', msg: `Unexpected field "${k}": the schema does not allow extra fields.` });
    }
  }
  return errs;
}

function explainParse(text, err) {
  const t = text.trim();
  if (/^```/.test(t)) return 'The reply is wrapped in a Markdown code fence (```). A JSON parser sees backticks, not JSON.';
  if (!/^[\[{]/.test(t)) return 'The text starts with ordinary words instead of { or [. Models often add a friendly sentence before the JSON.';
  if (/[}\]]\s*[A-Za-z]/.test(t.replace(/"(?:[^"\\]|\\.)*"/g, '""'))) return 'There is extra text after the closing bracket (trailing prose). JSON must be the only thing in the reply.';
  if (/,\s*[}\]]/.test(t)) return 'There is a trailing comma before a closing bracket. JSON forbids that.';
  if (/'[^']*'\s*:/.test(t)) return 'Single quotes are used for keys or strings. JSON requires double quotes.';
  return 'Not valid JSON: ' + err.message;
}

function repair(text) {
  const steps = []; let s = text;
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { s = fence[1]; steps.push('Removed the Markdown code fence.'); }
  const a = s.search(/[\[{]/);
  if (a > 0) { steps.push('Cut the sentence before the JSON.'); s = s.slice(a); }
  let depth = 0, inStr = false, end = -1;
  for (let i = 0; i < s.length; i++) { const c = s[i]; if (inStr) { if (c === '\\') i++; else if (c === '"') inStr = false; } else if (c === '"') inStr = true; else if (c === '{' || c === '[') depth++; else if (c === '}' || c === ']') { depth--; if (!depth) { end = i; break; } } }
  if (end >= 0 && end < s.trim().length - 1) { steps.push('Cut the text after the closing bracket.'); s = s.slice(0, end + 1); }
  const noComma = s.replace(/,(\s*[}\]])/g, '$1'); if (noComma !== s) { steps.push('Removed a trailing comma.'); s = noComma; }
  return { text: s, steps };
}

const PRESETS = {
  ticket: {
    label: 'Support ticket',
    schema: { type: 'object', required: ['title', 'priority', 'category'], additionalProperties: false, properties: { title: { type: 'string', minLength: 3, maxLength: 80 }, priority: { enum: ['low', 'medium', 'high'] }, category: { enum: ['billing', 'bug', 'account'] }, estimate_hours: { type: 'number', minimum: 0, maximum: 40 }, tags: { type: 'array', maxItems: 3, items: { type: 'string' } } } },
    valid: { title: 'Cannot reset password', priority: 'high', category: 'account', estimate_hours: 2, tags: ['login'] },
    mistakes: [
      ['Wrong type', '{ "title": "Cannot reset password", "priority": "high", "category": "account", "estimate_hours": "two" }', 'The model wrote the number as a word. Fix: say "estimate_hours must be a number" in the prompt, or use schema-constrained output.'],
      ['Missing field', '{ "title": "Refund not received", "priority": "medium" }', 'A required field was left out. Fix: validate, then retry with the error message so the model can fill the gap.'],
      ['Invented value', '{ "title": "App crashes on start", "priority": "urgent", "category": "bug", "mood": "angry" }', 'The model invented "urgent" and an extra "mood" field. Enums and additionalProperties:false catch both.'],
      ['Trailing prose', 'Sure! Here is the ticket you asked for:\n{ "title": "Double charged", "priority": "high", "category": "billing" }\nLet me know if you need anything else!', 'Chatty text around the JSON. Try the Repair button, but the lasting fix is a "JSON only" instruction or a structured-output mode.'],
      ['Code fence', '```json\n{ "title": "Wrong invoice", "priority": "low", "category": "billing", }\n```', 'A Markdown fence and a trailing comma. Repair can strip both, but a strict parser would have rejected it.'],
    ],
  },
  review: {
    label: 'Review extraction',
    schema: { type: 'object', required: ['product', 'rating', 'recommends'], properties: { product: { type: 'string', minLength: 1 }, rating: { type: 'integer', minimum: 1, maximum: 5 }, recommends: { type: 'boolean' }, pros: { type: 'array', items: { type: 'string' } } } },
    valid: { product: 'Lumo lamp', rating: 4, recommends: true, pros: ['bright', 'easy setup'] },
    mistakes: [
      ['Out of range', '{ "product": "Lumo lamp", "rating": 9, "recommends": true }', 'The rating is outside 1-5. Ranges (minimum, maximum) are cheap to check and catch a lot.'],
      ['Wrong type', '{ "product": "Lumo lamp", "rating": 4.5, "recommends": "yes", "pros": "bright" }', 'A decimal where an integer is needed, a string for a boolean, and text instead of a list.'],
      ['Trailing prose', '{ "product": "Lumo lamp", "rating": 4, "recommends": true }\nI hope this helps!', 'Text after the JSON. Repair cuts it; a "reply with JSON only" rule prevents it.'],
    ],
  },
  meeting: {
    label: 'Meeting notes',
    schema: { type: 'object', required: ['date', 'attendees', 'actions'], properties: { date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }, attendees: { type: 'array', minItems: 1, items: { type: 'string' } }, actions: { type: 'array', items: { type: 'object', required: ['owner', 'task'], properties: { owner: { type: 'string' }, task: { type: 'string' } } } } } },
    valid: { date: '2025-03-14', attendees: ['Ana', 'Ben'], actions: [{ owner: 'Ana', task: 'Send the budget' }] },
    mistakes: [
      ['Bad date format', '{ "date": "14 March", "attendees": ["Ana"], "actions": [] }', 'The date is not ISO format. A pattern in the schema makes the expectation checkable.'],
      ['Nested mistake', '{ "date": "2025-03-14", "attendees": [], "actions": [{ "owner": "Ana" }] }', 'Errors can be deep inside the data. Notice the path points at the exact spot.'],
    ],
  },
};

export function mount(el, props = {}, ctx = {}) {
  const presets = { ...PRESETS };
  if (props.schema) presets.custom = { label: 'From the lesson', schema: props.schema, valid: props.sample || {}, mistakes: [] };
  let key = props.schema ? 'custom' : 'ticket';
  const root = h('div', { class: 'w-b-card w-js' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const ta = h('textarea', { class: 'w-js-ta', spellcheck: 'false', rows: 11, 'aria-label': 'JSON to check', oninput: check });
  const schemaPre = h('pre', { class: 'w-b-mono w-b-panel w-js-schema', tabindex: 0, 'aria-label': 'Schema' });
  const result = h('div', { class: 'w-js-result' }), lesson = h('div', { class: 'w-js-lesson' }), mist = h('div', { class: 'w-b-row' });
  const sel = h('select', { 'aria-label': 'Schema preset', onchange: (e) => { key = e.target.value; load(true); } }, Object.entries(presets).map(([k, v]) => h('option', { value: k, selected: k === key, text: v.label })));
  const repairB = h('button', { class: 'w-b-btn', type: 'button', onclick: doRepair }, 'Repair it');
  root.append(
    h('h3', { class: 'w-b-title', text: 'Does this JSON match the schema?' }),
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), 'edit a value in the JSON (change "high" to "urgent"), or load a typical model mistake below and fix it.'),
    h('div', { class: 'w-b-row' }, h('label', { class: 'w-b-field' }, h('span', { text: 'Schema' }), sel)),
    h('div', { class: 'w-b-grid w-b-cols2' },
      h('div', { class: 'w-b-field' }, h('label', { text: 'JSON (editable)' }), ta),
      h('div', { class: 'w-b-field' }, h('span', { text: 'Schema (the rules)' }), schemaPre)),
    h('div', { class: 'w-b-row' }, h('button', { class: 'w-b-btn', type: 'button', onclick: () => { ta.value = JSON.stringify(presets[key].valid, null, 2); check(); } }, 'Load a valid example'), repairB),
    h('h4', { class: 'w-js-h', text: 'Typical model mistakes (click to load)' }), mist,
    result, lesson, live,
    h('p', { class: 'w-b-note', text: 'This is a small real validator (type, required, enum, range, length, pattern, items, extra fields), not the full JSON Schema standard. The "model mistakes" are hand-written examples, not live model output.' }));
  el.append(root);

  function load(reset) {
    const p = presets[key];
    schemaPre.textContent = JSON.stringify(p.schema, null, 2);
    mist.textContent = '';
    if (!p.mistakes.length) mist.append(h('span', { class: 'w-js-none', text: 'No examples for this schema.' }));
    p.mistakes.forEach(([label, text, why], i) => mist.append(h('button', { class: 'w-b-btn', type: 'button', onclick: () => { ta.value = text; lesson.textContent = ''; lesson.append(h('div', { class: 'w-js-tip' }, h('b', { text: `${label}: ` }), why)); check(true); } }, label)));
    if (reset) { const first = p.mistakes[0]; ta.value = first ? first[1] : JSON.stringify(p.valid, null, 2); lesson.textContent = ''; if (first) lesson.append(h('div', { class: 'w-js-tip' }, h('b', { text: `${first[0]}: ` }), first[2])); }
    check(true);
  }
  function check(keepLesson) {
    if (keepLesson !== true) lesson.textContent = '';
    const text = ta.value; let msg;
    result.textContent = '';
    let data, parsed = true;
    try { data = JSON.parse(text); } catch (e) { parsed = false; msg = explainParse(text, e); }
    repairB.disabled = parsed;
    if (!parsed) {
      result.append(h('div', { class: 'w-js-status bad' }, h('b', { text: '✗ Not valid JSON. ' }), 'The checker cannot even read it.'), h('p', { class: 'w-js-err' }, msg), h('p', { class: 'w-js-small', text: 'Press "Repair it" to try an automatic clean-up.' }));
      live.textContent = 'Not valid JSON. ' + msg; return;
    }
    const errs = validate(presets[key].schema, data);
    if (!errs.length) { result.append(h('div', { class: 'w-js-status good' }, h('b', { text: '✓ Valid. ' }), 'Every rule in the schema is satisfied.')); live.textContent = 'Valid. All schema rules pass.'; return; }
    result.append(h('div', { class: 'w-js-status bad' }, h('b', { text: `✗ ${errs.length} problem${errs.length > 1 ? 's' : ''}` })),
      h('ul', { class: 'w-js-errs' }, errs.map((e) => h('li', {}, h('code', { text: e.path }), ' ', h('span', { class: 'w-b-pill', text: e.rule }), ' ', e.msg))),
      h('details', { class: 'w-js-retry' }, h('summary', { text: 'How to ask the model to fix it (retry prompt)' }), h('pre', { class: 'w-b-mono w-b-panel', text: `Your last reply failed validation:\n${errs.map((e) => `- ${e.path}: ${e.msg}`).join('\n')}\n\nReturn corrected JSON only, matching the schema.` })));
    live.textContent = `${errs.length} problem${errs.length > 1 ? 's' : ''}: ` + errs.map((e) => `${e.path} ${e.msg}`).join(' ');
  }
  function doRepair() {
    const r = repair(ta.value);
    let ok = true; try { JSON.parse(r.text); } catch (e) { ok = false; }
    if (r.steps.length) ta.value = r.text.trim();
    lesson.textContent = '';
    lesson.append(h('div', { class: 'w-js-tip' }, h('b', { text: 'Repair lesson: ' }), r.steps.length ? r.steps.join(' ') : 'No known pattern found.', ok || !r.steps.length ? '' : ' Still not valid.', ' Repair is a patch. Better: ask for JSON only, use a structured-output mode, validate every reply, and retry with the error message.'));
    check(true);
  }
  ta.value = ''; load(true);
  return () => {};
}
