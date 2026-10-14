// agentloop: a scripted (not live) agent run: Think -> Act -> Observe, with failure / ambiguity / approval toggles.
export const meta = { name: 'agentloop', title: 'Agent loop stepper', blurb: 'Step through a scripted agent run and see how failures, vague goals and human approval change what happens.', level: 3, skills: ['l3.agents'] };

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

const SC = {
  trip: {
    label: 'Plan a trip', goal: 'Book a 2-night stay in Edinburgh for under 300 pounds.', vague: 'Book me a trip.',
    ask: 'Which city, which dates, and what is your budget?', answer: 'Edinburgh, 2 nights from Friday, under 300 pounds total.',
    plan: ['Find hotels that fit', 'Check budget and dates', 'Book the best option'],
    t1: { name: 'search_hotels', args: '{city:"Edinburgh", nights:2, max_total:300}', err: 'Error: request timed out after 10s', alt: 'search_hotels_cached', altArgs: '{city:"Edinburgh", nights:2}', res: '3 options: Rowan Inn 240, Thistle House 275, Castle View 320' },
    t2: { name: 'check_budget', args: '{options:["Rowan Inn","Thistle House"], limit:300}', res: 'Both fit. Rowan Inn is cheapest (240) with free cancellation.' },
    t3: { name: 'book_hotel', args: '{hotel:"Rowan Inn", nights:2, pay:true}', res: 'Booking confirmed, ref RI-4471. Charged 240 pounds.', risk: 'This spends real money.', denied: 'Stopped before paying. Shortlist handed to the human: Rowan Inn (240), Thistle House (275).' },
    final: 'Booked Rowan Inn for 2 nights at 240 pounds (reference RI-4471).',
  },
  refund: {
    label: 'Handle a refund', goal: 'Refund order #1042 if it arrived damaged.', vague: 'Fix my order.',
    ask: 'Which order number, and what is wrong with it?', answer: 'Order #1042. The mug arrived cracked.',
    plan: ['Look up the order', 'Check the refund policy', 'Issue the refund'],
    t1: { name: 'lookup_order', args: '{id:1042}', err: 'Error 503: orders service unavailable', alt: 'lookup_order', altArgs: '{id:1042}  (retry after 2s)', res: 'Order #1042: ceramic mug, 18 pounds, delivered 3 days ago.' },
    t2: { name: 'check_policy', args: '{reason:"damaged", days_since_delivery:3}', res: 'Damaged items are refundable within 30 days with a photo. Photo on file: yes.' },
    t3: { name: 'issue_refund', args: '{order:1042, amount:18}', res: 'Refund of 18 pounds sent to the original payment method.', risk: 'Refunds move money and cannot be undone.', denied: 'Refund not issued. Case escalated to a support agent with the policy check attached.' },
    final: 'Refunded 18 pounds for order #1042 (damaged, within 30 days).',
  },
  data: {
    label: 'Analyse data', goal: 'Find which product category grew fastest last quarter and email the team.', vague: 'How are sales?',
    ask: 'Which measure (revenue or units), which period, and who should receive it?', answer: 'Revenue, last quarter versus the one before, send to the sales team.',
    plan: ['Query quarterly revenue', 'Compare growth by category', 'Send the summary'],
    t1: { name: 'run_sql', args: 'SELECT category, SUM(rev) FROM sales GROUP BY category, quarter', err: 'SQL error: column "quarter" does not exist (did you mean "qtr"?)', alt: 'run_sql', altArgs: 'SELECT category, SUM(rev) FROM sales GROUP BY category, qtr', res: '4 categories x 2 quarters returned.' },
    t2: { name: 'compare_growth', args: '{metric:"rev", periods:["Q2","Q3"]}', res: 'Garden +31%, Kitchen +12%, Toys +4%, Books -2%.' },
    t3: { name: 'send_email', args: '{to:"sales-team", body:"Garden grew fastest (+31%)."}', res: 'Email sent to 14 recipients.', risk: 'An email to 14 people cannot be recalled.', denied: 'Email not sent. Draft saved for a human to review.' },
    final: 'Garden grew fastest last quarter (+31%). The team has been emailed.',
  },
};

function build(sc, o, decision) {
  const S = SC[sc], st = []; const tok = (t) => Math.round(t.split(/\s+/).length * 1.4) + 18;
  const add = (kind, text, extra = {}) => st.push({ kind, text, tokens: tok(text + (extra.args || '') + (extra.result || '')), ...extra });
  let goal = S.goal, doing = 0;
  if (o.vague) {
    goal = S.vague;
    add('think', `The goal "${S.vague}" is too vague to act on safely. Guessing could waste money or time, so I should ask.`, { plan: -1 });
    add('ask', S.ask, { who: 'Agent asks the human' });
    add('observe', `Human replies: "${S.answer}"`, { who: 'Human replies', result: S.answer, goal: S.goal });
    goal = S.goal;
  }
  const g = () => goal;
  add('think', `Plan: (1) ${S.plan[0]}, (2) ${S.plan[1]}, (3) ${S.plan[2]}. Start with step 1.`, { plan: 0, goal: g() });
  const t1 = S.t1;
  add('act', `Call ${t1.name}`, { tool: t1.name, args: t1.args, plan: 0 });
  if (o.fail) {
    add('observe', t1.err, { result: t1.err, fail: true, plan: 0 });
    add('think', 'That failed. I will not pretend it worked. A retry or a fallback is reasonable, but I will stop and report if it fails again.', { plan: 0 });
    add('act', `Retry with ${t1.alt}`, { tool: t1.alt, args: t1.altArgs, plan: 0 });
  }
  add('observe', t1.res, { result: t1.res, plan: 1 });
  add('think', 'Now check the result against the constraints before doing anything with side effects.', { plan: 1 });
  add('act', `Call ${S.t2.name}`, { tool: S.t2.name, args: S.t2.args, plan: 1 });
  add('observe', S.t2.res, { result: S.t2.res, plan: 2 });
  add('think', `Next is "${S.plan[2]}". ${S.t3.risk}${o.approve ? ' My rules say this needs a human to approve it first.' : ''}`, { plan: 2 });
  if (o.approve) {
    add('approval', `Approval needed: ${S.t3.name}(${S.t3.args})`, { gate: true, plan: 2 });
    if (decision === 'deny') { add('final', S.t3.denied, { plan: 3, outcome: 'Escalated' }); return st; }
    if (!decision) return st;
  }
  add('act', `Call ${S.t3.name}`, { tool: S.t3.name, args: S.t3.args, plan: 2 });
  add('observe', S.t3.res, { result: S.t3.res, plan: 3 });
  add('final', S.final, { plan: 3, outcome: 'Done' });
  return st;
}

const LABEL = { think: ['Think', '\u{1F4AD}'], act: ['Act', '⚡'], observe: ['Observe', '\u{1F440}'], ask: ['Ask human', '❓'], approval: ['Approval', '✋'], final: ['Finish', '✔'] };

export function mount(el, props = {}, ctx = {}) {
  const S0 = SC[props.scenario] ? props.scenario : 'trip';
  const o = { sc: S0, fail: true, vague: false, approve: true };
  let decision = null, pos = 0, timer = null, steps = [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = h('div', { class: 'w-b-card w-agent' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const log = h('ol', { class: 'w-agent-log', 'aria-label': 'Agent steps so far' });
  const side = h('div', { class: 'w-agent-side' });
  const gate = h('div', { class: 'w-agent-gate' });
  const nextB = h('button', { class: 'w-b-btn w-b-primary', type: 'button', onclick: () => advance() }, 'Next step →');
  const backB = h('button', { class: 'w-b-btn', type: 'button', onclick: () => { stop(); pos = Math.max(1, pos - 1); if (steps[pos - 1] && !steps[pos - 1].gate && decision && pos <= gateIndex()) decision = null; refresh(); } }, '← Back');
  const playB = h('button', { class: 'w-b-btn', type: 'button', onclick: () => { if (timer) return stop(); if (pos >= steps.length) { pos = 1; } playB.textContent = '⏸ Pause'; timer = setInterval(() => { if (!advance(true)) stop(); }, reduce.matches ? 3500 : 1800); } }, '▶ Play');
  const resetB = h('button', { class: 'w-b-btn', type: 'button', onclick: () => { stop(); decision = null; pos = 1; rebuild(); } }, 'Reset');
  const scSel = h('select', { 'aria-label': 'Scenario', onchange: (e) => { o.sc = e.target.value; stop(); decision = null; pos = 1; rebuild(); } }, Object.entries(SC).map(([k, v]) => h('option', { value: k, selected: k === o.sc, text: v.label })));
  const tg = (key, label, hint) => h('label', { class: 'w-b-check' }, h('input', { type: 'checkbox', checked: o[key] ? true : null, onchange: (e) => { o[key] = e.target.checked; stop(); decision = null; pos = 1; rebuild(); } }), h('span', {}, label, h('small', { class: 'w-agent-hint', text: ' ' + hint })));

  root.append(
    h('h3', { class: 'w-b-title', text: 'Follow an agent, one step at a time' }),
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), 'turn off "inject tool failure", then switch "ambiguous goal" on. Compare how the run changes.'),
    h('div', { class: 'w-b-row' }, h('label', { class: 'w-b-field' }, h('span', { text: 'Scenario' }), scSel)),
    h('div', { class: 'w-agent-toggles' }, tg('fail', 'Inject tool failure', '(the first tool call breaks)'), tg('vague', 'Ambiguous goal', '(the agent must ask)'), tg('approve', 'Require human approval', '(before the risky action)')),
    h('div', { class: 'w-b-row' }, backB, nextB, playB, resetB),
    h('div', { class: 'w-agent-main' }, log, side), gate, live,
    h('p', { class: 'w-b-note', text: 'Scripted simulation: no real model or tools are running. Every step is pre-written; the toggles just swap which script plays. Real agents improvise, so the same ideas appear less tidily.' }));
  el.append(root);

  const gateIndex = () => steps.findIndex((s) => s.gate) + 1;
  function stop() { if (timer) { clearInterval(timer); timer = null; } playB.textContent = '▶ Play'; }
  function rebuild() { steps = build(o.sc, o, decision); if (pos < 1) pos = 1; if (pos > steps.length) pos = steps.length; refresh(); }
  function advance(auto) {
    const cur = steps[pos - 1];
    if (cur && cur.gate && !decision) return false; // waiting on human
    if (pos >= steps.length) return false;
    pos++; refresh(); const n = steps[pos - 1];
    return !(n && n.gate) && pos < steps.length;
  }
  function decide(d) { decision = d; steps = build(o.sc, o, d); pos++; refresh(); }

  function refresh() {
    steps = build(o.sc, o, decision);
    const shown = steps.slice(0, pos), cur = shown[shown.length - 1];
    log.textContent = '';
    shown.forEach((s, i) => {
      const [name, icon] = LABEL[s.kind];
      log.append(h('li', { class: `w-agent-step k-${s.kind}${i === shown.length - 1 ? ' is-cur' : ''}${s.fail ? ' is-fail' : ''}`, 'aria-current': i === shown.length - 1 ? 'step' : null },
        h('div', { class: 'w-agent-sh' }, h('span', { class: 'w-agent-ic', 'aria-hidden': 'true', text: icon }), h('b', { text: s.who || name }), s.fail ? h('span', { class: 'w-b-pill bad', text: 'failed' }) : null),
        s.tool ? h('div', { class: 'w-b-mono w-agent-call', text: `${s.tool}(${s.args})` }) : null,
        h('div', { class: 'w-agent-st', text: s.text })));
    });
    log.scrollTop = log.scrollHeight;
    // side panels
    const S = SC[o.sc]; let goal = o.vague ? S.vague : S.goal; let plan = -1; let toks = 320;
    const results = [];
    shown.forEach((s) => { toks += s.tokens; if (s.goal) goal = s.goal; if (s.plan != null) plan = s.plan; if (s.kind === 'observe' && s.who !== 'Human replies') results.push(s); });
    side.textContent = '';
    side.append(
      h('div', { class: 'w-b-panel' }, h('h4', { text: 'Goal' }), h('div', { text: goal })),
      h('div', { class: 'w-b-panel' }, h('h4', { text: 'Plan / scratchpad' }), h('ul', { class: 'w-agent-plan' }, S.plan.map((p, i) => h('li', { class: i < plan ? 'is-done' : i === plan ? 'is-now' : '' }, h('span', { 'aria-hidden': 'true', text: i < plan ? '✓ ' : i === plan ? '► ' : '○ ' }), p, h('span', { class: 'w-b-sr', text: i < plan ? ' (done)' : i === plan ? ' (in progress)' : ' (to do)' }))))),
      h('div', { class: 'w-b-panel' }, h('h4', { text: 'Tool results' }), results.length ? h('ul', { class: 'w-agent-res' }, results.map((r) => h('li', { class: r.fail ? 'is-fail' : '' }, (r.fail ? 'Failed: ' : 'OK: '), r.result))) : h('div', { class: 'w-agent-empty', text: 'None yet' })),
      h('div', { class: 'w-b-panel' }, h('h4', { text: 'Context size (grows every step)' }), h('div', { class: 'w-b-meter', role: 'img', 'aria-label': `about ${toks} tokens` }, h('i', { style: `width:${Math.min(100, toks / 12)}%` })), h('small', { text: `about ${toks} tokens (rough estimate: includes a 320-token system prompt)` })));
    gate.textContent = '';
    if (cur && cur.gate && !decision) {
      gate.append(h('div', { class: 'w-agent-gatebox', role: 'group', 'aria-label': 'Human approval' }, h('b', { text: 'The agent is paused and waiting for you. ' }), S.t3.risk,
        h('div', { class: 'w-b-row' }, h('button', { class: 'w-b-btn w-b-primary', type: 'button', onclick: () => decide('approve') }, 'Approve'), h('button', { class: 'w-b-btn', type: 'button', onclick: () => decide('deny') }, 'Deny and escalate'))));
    }
    const waiting = cur && cur.gate && !decision;
    nextB.disabled = waiting || pos >= steps.length; backB.disabled = pos <= 1;
    const msg = `Step ${pos}${decision || !waiting ? '' : ''}: ${(LABEL[cur.kind][0])}. ${cur.tool ? cur.tool + ' ' : ''}${cur.text}${waiting ? ' Waiting for your approval.' : ''}`;
    live.textContent = msg; if (ctx.announce) ctx.announce(msg);
  }
  pos = 3; rebuild();
  return () => stop();
}
