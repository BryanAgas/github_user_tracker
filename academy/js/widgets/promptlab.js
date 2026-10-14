// promptlab: toggle prompt parts, see the assembled prompt, a transparent completeness rubric, and a clearly SIMULATED response.
export const meta = { name: 'promptlab', title: 'Prompt lab', blurb: 'Switch prompt parts on and off; watch the prompt, a transparent rubric score, and a simulated response change.', level: 1, skills: ['l1.prompting'] };

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

const PARTS = [
  { id: 'role', label: 'Role', pts: 10, why: 'Sets the voice and expertise. Small effect alone, but it steers tone.' },
  { id: 'context', label: 'Context', pts: 20, why: 'The facts the model cannot guess. Missing facts produce generic or invented text.' },
  { id: 'task', label: 'Task', pts: 25, why: 'The actual request. Without it the model has to guess what you want.' },
  { id: 'constraints', label: 'Constraints', pts: 15, why: 'Length, tone limits and things to avoid. Stops rambling and over-promising.' },
  { id: 'format', label: 'Output format', pts: 15, why: 'Tells the model what shape to return, so you can use it directly.' },
  { id: 'examples', label: 'Example', pts: 15, why: 'One sample of the style you want. Often the strongest nudge.' },
];

const TASKS = {
  email: {
    label: 'Reply to a late-parcel email',
    text: {
      role: 'You are a friendly customer-care agent for an online shop.',
      context: 'Customer: Priya Rao. Order #4821 is 3 days late because of storm delays at our depot. New delivery date: Friday.',
      task: 'Write a reply to her complaint about the late parcel.',
      constraints: 'Under 80 words. Do not blame the courier. Do not promise anything beyond Friday.',
      format: 'Return a subject line, then the email body, then a sign-off with the agent name "Sam".',
      examples: 'Example of our style: "Hi Jo, thanks for flagging this. Here is where things stand..."',
    },
    lines: (on) => [
      on.format && { t: 'Subject: Update on your order #4821' },
      { t: on.examples ? 'Hi Priya, thanks for flagging this.' : on.role ? 'Hello Ms Rao,' : 'Dear customer,' },
      { t: on.context ? 'Order #4821 is three days late because storms disrupted our depot, and I am sorry for the wait.' : 'We are sorry about the delay with your order.',
        flaw: !on.context && 'No order number, reason or date: the model could not know them.' },
      { t: on.constraints ? 'It will reach you by Friday, and I will write again if that changes.' : on.context ? 'It should arrive soon, possibly next week, though the courier has been unreliable lately and we cannot guarantee anything.' : 'It might arrive soon, or maybe next week. Delays happen and these things are sometimes outside our control.',
        flaw: !on.constraints && 'Vague date, blames the courier, over-long: no constraints to hold it back.' },
      !on.constraints && { t: 'We apologise for any inconvenience this may have caused and thank you for your continued custom and understanding in this matter.' },
      { t: on.format ? 'Warm regards,\nSam, Customer Care' : 'Regards', flaw: !on.format && 'No subject line or named sign-off: you would have to edit it before sending.' },
      !on.role && { t: '', flaw: 'Tone is stiff and corporate: no role to set a friendly voice.' },
    ],
  },
  summary: {
    label: 'Summarise a council report',
    text: {
      role: 'You are an editor writing for busy managers.',
      context: 'Report: the council will add 4 km of cycle lanes on Mill Road for 1.2 million pounds, starting in March, with a 6-week closure of one lane.',
      task: 'Summarise the report.',
      constraints: 'Maximum 3 bullets, each under 20 words. Lead with the decision.',
      format: 'Use a bulleted list with no heading.',
      examples: 'Example bullet: "Decision: approve X; cost Y; starts Z."',
    },
    lines: (on) => on.context ? [
      { t: on.format ? (on.examples ? '- Decision: add 4 km of Mill Road cycle lanes; cost 1.2m pounds; starts March.' : '- The council will add 4 km of cycle lanes on Mill Road for 1.2m pounds.') : 'The report is about a plan by the council to build some new cycle lanes on Mill Road, which will cost quite a lot of money and begin at some point in the spring, and it also talks about how traffic might be affected.', flaw: !on.format && 'Unstructured paragraph: no format asked for.' },
      { t: on.format ? '- Disruption: one lane closed for 6 weeks.' : '' },
      on.constraints ? { t: '' } : { t: on.format ? '- Residents may be affected, and there are various other considerations the report mentions at length.' : 'There are also various other considerations.', flaw: 'Rambles past the point: no length limit or lead-with-the-decision rule.' },
      !on.role && { t: '', flaw: 'Not written for busy managers: no role or audience.' },
    ] : [
      { t: 'The report discusses things the council is considering. It has several sections covering various topics and conclusions.', flaw: 'Without the report text (context) the model can only produce filler.' },
    ],
  },
  extract: {
    label: 'Extract fields from an invoice',
    text: {
      role: 'You are a careful data-entry assistant.',
      context: 'Invoice text: "Bright Pipes Ltd. Invoice 20931, dated 4 June. Amount due: 482.50 pounds. Pay within 14 days."',
      task: 'Extract the supplier, invoice number and amount.',
      constraints: 'Use null for anything missing. Output nothing except the result. Do not guess.',
      format: 'Return JSON with keys supplier, invoice_number, amount_gbp (a number).',
      examples: 'Example: {"supplier":"Acme","invoice_number":"17","amount_gbp":10}',
    },
    lines: (on) => on.context ? [
      { t: on.format ? '{ "supplier": "Bright Pipes Ltd", "invoice_number": "20931", "amount_gbp": 482.5 }' : 'The supplier looks like Bright Pipes Ltd, and I think the invoice is number 20931 and it comes to 482.50 pounds, due within two weeks.', flaw: !on.format && 'Prose, not JSON: a program cannot read this reliably.' },
      !on.constraints && { t: on.format ? 'Hope that helps! Let me know if you want the due date too.' : '', flaw: on.format && 'Extra chatter around the JSON would break a parser: no "output nothing else" rule.' },
    ] : [{ t: 'Sure! Please paste the invoice text and I will extract the details.', flaw: 'The model never saw the invoice: it was not provided as context.' }],
  },
};

export function mount(el, props = {}, ctx = {}) {
  const key = TASKS[props.task] ? props.task : 'email';
  let task = key;
  const on = { role: true, context: true, task: true, constraints: false, format: false, examples: false };
  const root = h('div', { class: 'w-b-card w-pl' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const promptBox = h('div', { class: 'w-pl-prompt' });
  const rubric = h('div', { class: 'w-pl-rubric' });
  const resp = h('div', { class: 'w-pl-resp' });
  const flaws = h('ul', { class: 'w-pl-flaws' });
  const toggles = h('div', { class: 'w-pl-toggles', role: 'group', 'aria-label': 'Prompt parts' });
  const sel = h('select', { 'aria-label': 'Task', onchange: (e) => { task = e.target.value; render(); } }, Object.entries(TASKS).map(([k, v]) => h('option', { value: k, selected: k === task, text: v.label })));
  PARTS.forEach((p) => toggles.append(h('label', { class: 'w-b-check w-pl-tog' }, h('input', { type: 'checkbox', checked: on[p.id] ? true : null, 'data-part': p.id, onchange: (e) => { on[p.id] = e.target.checked; render(); } }), h('span', {}, p.label, h('small', { class: 'w-pl-pts', text: ` +${p.pts}` })))));
  root.append(
    h('h3', { class: 'w-b-title', text: 'Build a prompt, part by part' }),
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), 'switch on "Constraints" and "Output format" and see exactly which problems in the response disappear.'),
    h('div', { class: 'w-b-row' }, h('label', { class: 'w-b-field' }, h('span', { text: 'Task' }), sel),
      h('button', { class: 'w-b-btn', type: 'button', onclick: () => { PARTS.forEach((p) => { on[p.id] = p.id === 'task'; }); sync(); render(); } }, 'Task only'),
      h('button', { class: 'w-b-btn', type: 'button', onclick: () => { PARTS.forEach((p) => { on[p.id] = true; }); sync(); render(); } }, 'All parts')),
    toggles,
    h('div', { class: 'w-b-grid w-b-cols2' },
      h('div', {}, h('h4', { class: 'w-pl-h', text: 'Your prompt' }), promptBox, rubric),
      h('div', {}, h('h4', { class: 'w-pl-h' }, 'Response ', h('span', { class: 'w-b-pill warn', text: 'SIMULATED' })), resp, h('h4', { class: 'w-pl-h', text: 'What is missing or off, and why' }), flaws)),
    live,
    h('p', { class: 'w-b-note', text: 'Illustrative, not a real model: the responses are pre-written and chosen by which parts are switched on. A real model is less predictable. The score rates the prompt, using the visible point values, not the model.' }));
  el.append(root);

  function sync() { toggles.querySelectorAll('input').forEach((i) => { i.checked = on[i.dataset.part]; }); }

  function render() {
    const T = TASKS[task];
    promptBox.textContent = '';
    const active = PARTS.filter((p) => on[p.id]);
    if (!active.length) promptBox.append(h('p', { class: 'w-pl-empty', text: '(empty prompt)' }));
    ['role', 'context', 'task', 'constraints', 'format', 'examples'].forEach((id) => {
      if (on[id]) promptBox.append(h('div', { class: 'w-pl-part' }, h('span', { class: 'w-pl-tag', text: PARTS.find((p) => p.id === id).label }), T.text[id]));
    });
    const score = active.reduce((a, p) => a + p.pts, 0);
    const grade = score >= 85 ? 'Strong' : score >= 60 ? 'Good' : score >= 40 ? 'Thin' : 'Very thin';
    rubric.textContent = '';
    rubric.append(h('div', { class: 'w-pl-score' }, h('b', { text: `Prompt completeness: ${score}/100 (${grade})` })),
      h('div', { class: 'w-b-meter', role: 'img', 'aria-label': `${score} out of 100` }, h('i', { style: `width:${score}%` })),
      h('ul', { class: 'w-pl-rub' }, PARTS.map((p) => h('li', { class: on[p.id] ? 'is-on' : '' }, h('span', { 'aria-hidden': 'true', text: on[p.id] ? '✓ ' : '✗ ' }), h('b', { text: p.label }), ` (${on[p.id] ? '+' + p.pts : '0 of ' + p.pts}): ${p.why}`))));
    resp.textContent = '';
    flaws.textContent = '';
    let L;
    if (!on.task) L = [{ t: 'I am not sure what you would like me to do. Could you tell me more?', flaw: 'No task: the model has nothing to act on, so it asks (or guesses).' }];
    else L = T.lines(on).filter(Boolean);
    const txt = L.map((l) => l.t).filter((t) => t).join('\n\n');
    resp.append(h('div', { class: 'w-pl-badge', text: 'Simulated response (pre-written illustration)' }), h('div', { class: 'w-pl-rtext', text: txt || '(nothing)' }));
    const fl = L.map((l) => l.flaw).filter(Boolean);
    if (!fl.length) flaws.append(h('li', { class: 'is-ok', text: 'Nothing obviously wrong in this illustration. Real models can still slip, so always check.' }));
    fl.forEach((f) => flaws.append(h('li', { text: f })));
    const m = `Prompt score ${score} of 100, ${grade}. ${fl.length} issue${fl.length === 1 ? '' : 's'} in the simulated response.`;
    live.textContent = m; if (ctx.announce) ctx.announce(m);
  }
  render();
  return () => {};
}
