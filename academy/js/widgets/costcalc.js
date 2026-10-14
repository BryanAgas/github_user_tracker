// costcalc: token cost calculator with editable (example) prices and a sensitivity analysis.
export const meta = { name: 'costcalc', title: 'Cost calculator', blurb: 'Estimate monthly LLM spend from traffic, tokens, caching and retries, and see which lever matters most.', level: 3, skills: ['l3.cost'] };

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
const DEF = { req: 5000, tin: 1800, tout: 350, pin: 3, pout: 15, pcache: 0.3, hit: 40, retry: 5 };
const FIELDS = [
  ['req', 'Requests per day', 'req/day', 'Traffic'], ['tin', 'Input tokens per request', 'tokens', 'Prompt + context'], ['tout', 'Output tokens per request', 'tokens', 'Answer length'],
  ['pin', 'Input price per million tokens', 'money', 'Example number: enter your provider\'s'], ['pout', 'Output price per million tokens', 'money', 'Example number: enter your provider\'s'],
  ['pcache', 'Cached-input price per million', 'money', 'Example number: enter your provider\'s'], ['hit', 'Cache hit rate', '%', 'Share of input served from cache'], ['retry', 'Retry rate', '%', 'Requests that run again'],
];
function cost(v) {
  const days = 30, reqs = v.req * days, hit = Math.min(1, v.hit / 100), rr = v.retry / 100;
  const inU = reqs * v.tin * (1 - hit) * v.pin / 1e6, inC = reqs * v.tin * hit * v.pcache / 1e6, out = reqs * v.tout * v.pout / 1e6;
  const base = inU + inC + out, retries = base * rr;
  return { inU, inC, out, retries, total: base + retries };
}
const money = (x) => (x < 100 ? x.toFixed(2) : Math.round(x).toLocaleString('en-US'));

export function mount(el, props = {}, ctx = {}) {
  const v = { ...DEF };
  const root = h('div', { class: 'w-b-card w-cc' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const inputs = {};
  const form = h('div', { class: 'w-b-grid w-cc-form' }, FIELDS.map(([k, label, unit, hint]) => {
    const inp = h('input', { type: 'number', min: 0, step: 'any', inputmode: 'decimal', value: v[k], id: 'cc-' + k + Math.random().toString(36).slice(2, 5), oninput: (e) => { const n = parseFloat(e.target.value); v[k] = isFinite(n) && n >= 0 ? n : 0; if (k === 'hit' || k === 'retry') v[k] = Math.min(v[k], 100); upd(); } });
    inputs[k] = inp;
    return h('label', { class: 'w-b-field' }, h('span', { text: `${label} (${unit})` }), inp, h('small', { class: 'w-cc-hint', text: hint }));
  }));
  const total = h('div', { class: 'w-cc-total' }), bars = h('div', { class: 'w-cc-bars' }), sens = h('div', { class: 'w-cc-sens' });
  root.append(
    h('h3', { class: 'w-b-title', text: 'What will this cost per month?' }),
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), 'raise the cache hit rate to 80% and compare it with halving the output tokens. Which saves more?'),
    h('div', { class: 'w-b-note w-cc-warn', text: 'Example numbers only. These are NOT any provider\'s real prices; type in the prices from your own provider. Costs are in any currency you like.' }),
    form, h('div', { class: 'w-b-row' }, h('button', { class: 'w-b-btn', type: 'button', onclick: () => { Object.assign(v, DEF); FIELDS.forEach(([k]) => { inputs[k].value = v[k]; }); upd(); } }, 'Reset to examples')),
    total, h('h4', { class: 'w-cc-h', text: 'Where the money goes' }), bars, h('h4', { class: 'w-cc-h', text: 'What changes it most? (each input raised by 20%)' }), sens, live,
    h('p', { class: 'w-b-note', text: 'Simple model: 30 days a month, retries repeat the whole request, and a cache hit replaces the normal input price with the cached price. Real bills add extras such as minimums, tool calls and rounding.' }));
  el.append(root);

  function upd() {
    const c = cost(v);
    total.textContent = '';
    total.append(h('span', { class: 'w-cc-lbl', text: 'Estimated monthly cost' }), h('b', { class: 'w-cc-big', text: money(c.total) }), h('span', { class: 'w-cc-per', text: `${(c.total / Math.max(1, v.req * 30) * 1000).toFixed(2)} per 1,000 requests` }));
    const parts = [['Input (fresh)', c.inU], ['Input (cached)', c.inC], ['Output', c.out], ['Retries', c.retries]];
    const mx = Math.max(1e-9, ...parts.map((p) => p[1]));
    bars.textContent = '';
    parts.forEach(([n, x], i) => bars.append(h('div', { class: 'w-cc-bar' }, h('span', { class: 'w-cc-bn', text: n }), h('div', { class: 'w-b-meter' }, h('i', { class: 'w-cc-fill' + i, style: `width:${(x / mx) * 100}%` })), h('span', { class: 'w-cc-bv', text: `${money(x)} (${c.total ? Math.round((x / c.total) * 100) : 0}%)` }))));
    const rows = FIELDS.map(([k, label]) => { const w = { ...v, [k]: Math.min(k === 'hit' || k === 'retry' ? 100 : 1e12, v[k] * 1.2) }; return { label, d: cost(w).total - c.total }; }).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    const md = Math.max(1e-9, ...rows.map((r) => Math.abs(r.d)));
    sens.textContent = '';
    rows.forEach((r) => sens.append(h('div', { class: 'w-cc-bar' }, h('span', { class: 'w-cc-bn', text: r.label }), h('div', { class: 'w-b-meter' }, h('i', { class: r.d < 0 ? 'w-cc-neg' : 'w-cc-pos', style: `width:${(Math.abs(r.d) / md) * 100}%` })), h('span', { class: 'w-cc-bv', text: `${r.d >= 0 ? '+' : '-'}${money(Math.abs(r.d))} (${r.d >= 0 ? 'costs more' : 'saves'})` }))));
    const m = `Estimated monthly cost ${money(c.total)}. Biggest lever: ${rows[0].label}.`;
    live.textContent = m; if (ctx.announce) ctx.announce(m);
  }
  upd();
  return () => {};
}
