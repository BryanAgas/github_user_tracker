// streaming: time-to-first-token and tokens/sec; waiting for the full answer vs streaming it.
export const meta = { name: 'streaming', title: 'Streaming vs waiting', blurb: 'See why showing tokens as they arrive feels faster, even when the total time is the same.', level: 1, skills: ['l1.latency'] };

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

const TEXT = ('A language model writes one token at a time. Each new token needs a full pass through the network, so long answers take real time. ' +
  'Streaming sends every token to your screen the moment it exists, so you can start reading while the rest is still being written. ' +
  'The total time is the same either way, but the wait before anything appears is much shorter. ' +
  'That wait is called time to first token, and it depends on things like how long your prompt is and how busy the servers are. ' +
  'After that, the speed is measured in tokens per second. Most people read around four words per second, so very fast streams only help up to a point. ' +
  'For short answers, streaming matters little. For long ones, it is the difference between staring at a spinner and already getting value. ').repeat(4).split(/\s+/);

export function mount(el, props = {}, ctx = {}) {
  const st = { ttft: 1.2, tps: 25, len: 220, t: 0, playing: false };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, last = 0;
  const total = () => st.ttft + st.len / st.tps;
  const root = h('div', { class: 'w-b-card w-st' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const vals = {};
  const mk = (key, label, min, max, step, unit) => {
    const v = h('b'); vals[key] = v;
    const inp = h('input', { type: 'range', min, max, step, value: st[key], oninput: (e) => { st[key] = +e.target.value; st.t = Math.min(st.t, total()); upd(); } });
    return h('label', { class: 'w-b-field' }, h('span', {}, label + ': ', v, ' ' + unit), inp);
  };
  const scrub = h('input', { type: 'range', min: 0, max: 1000, value: 0, 'aria-label': 'Elapsed time', oninput: (e) => { stop(); st.t = (e.target.value / 1000) * total(); upd(); } });
  const playB = h('button', { class: 'w-b-btn w-b-primary', type: 'button', onclick: () => { if (st.playing) return stop(); if (st.t >= total()) st.t = 0; st.playing = true; last = 0; playB.textContent = '⏸ Pause'; raf = requestAnimationFrame(tick); } }, '▶ Play');
  const reset = h('button', { class: 'w-b-btn', type: 'button', onclick: () => { stop(); st.t = 0; upd(); } }, 'Restart');
  const full = h('div', { class: 'w-st-box' }), strm = h('div', { class: 'w-st-box' });
  const stats = h('div', { class: 'w-st-stats' });
  root.append(
    h('h3', { class: 'w-b-title', text: 'Waiting versus streaming' }),
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), 'drag "Elapsed time" along, then push time-to-first-token up to 4 seconds. Which side feels worse?'),
    h('div', { class: 'w-b-grid w-b-cols2' }, mk('ttft', 'Time to first token', 0.2, 5, 0.1, 's'), mk('tps', 'Speed', 5, 120, 1, 'tokens/s'), mk('len', 'Answer length', 40, 800, 10, 'tokens')),
    h('div', { class: 'w-b-row' }, playB, reset, h('label', { class: 'w-b-field w-st-scrub' }, h('span', { text: 'Elapsed time' }), scrub)),
    h('div', { class: 'w-b-grid w-b-cols2' },
      h('div', {}, h('h4', { class: 'w-st-h', text: 'A. Wait for the full answer' }), full),
      h('div', {}, h('h4', { class: 'w-st-h', text: 'B. Stream tokens as they arrive' }), strm)),
    stats, live,
    h('p', { class: 'w-b-note', text: 'Toy model: a fixed sample text and a simple clock. Real speeds vary token by token, and 1 token is roughly three-quarters of a word. The numbers here are adjustable examples, not measurements of any product.' }));
  el.append(root);

  function stop() { st.playing = false; cancelAnimationFrame(raf); playB.textContent = '▶ Play'; }
  function tick(now) {
    if (!st.playing) return;
    if (last) st.t += Math.min(0.1, (now - last) / 1000) * 1.5; last = now;
    if (st.t >= total()) { st.t = total(); upd(); stop(); return; }
    upd(); raf = requestAnimationFrame(tick);
  }
  let lastMsg = '';
  function upd() {
    const T = total(), t = st.t;
    vals.ttft.textContent = st.ttft.toFixed(1); vals.tps.textContent = st.tps; vals.len.textContent = st.len;
    scrub.value = Math.round((t / T) * 1000);
    const toks = Math.max(0, Math.min(st.len, Math.floor((t - st.ttft) * st.tps)));
    const wordsShown = Math.floor(toks * 0.75);
    const done = t >= T - 1e-6;
    full.textContent = ''; strm.textContent = '';
    full.append(done ? h('p', { class: 'w-st-text', text: TEXT.slice(0, Math.floor(st.len * 0.75)).join(' ') }) : h('p', { class: 'w-st-wait' }, h('span', { class: 'w-st-dots', 'aria-hidden': 'true', text: '…' }), ` Waiting... ${t.toFixed(1)}s (nothing to read yet)`));
    strm.append(t < st.ttft ? h('p', { class: 'w-st-wait' }, h('span', { class: 'w-st-dots', 'aria-hidden': 'true', text: '…' }), ` Waiting for the first token... ${t.toFixed(1)}s`) : h('p', { class: 'w-st-text' }, TEXT.slice(0, wordsShown).join(' '), done ? '' : h('span', { class: 'w-st-caret', 'aria-hidden': 'true', text: '▌' })));
    const readSpeed = 4; // words/s
    const bottleneck = st.tps * 0.75 > readSpeed ? 'Tokens arrive faster than most people read (about 4 words/s), so a faster model would feel the same.' : 'You read faster than tokens arrive: speed matters here.';
    stats.textContent = '';
    stats.append(
      h('div', { class: 'w-st-stat' }, h('span', { text: 'First text on screen' }), h('b', { text: `A: ${T.toFixed(1)}s   B: ${st.ttft.toFixed(1)}s` })),
      h('div', { class: 'w-st-stat' }, h('span', { text: 'Whole answer done' }), h('b', { text: `${T.toFixed(1)}s for both` })),
      h('div', { class: 'w-st-stat' }, h('span', { text: 'Time you can spend reading while it finishes' }), h('b', { text: `${Math.max(0, T - st.ttft).toFixed(1)}s (B only)` })),
      h('p', { class: 'w-st-ins', text: bottleneck }));
    const msg = `At ${t.toFixed(1)} seconds: waiting side shows ${done ? 'the full answer' : 'nothing'}; streaming side shows ${wordsShown} words. Answer completes at ${T.toFixed(1)} seconds.`;
    if (done !== (lastMsg === 'done') || !st.playing) { live.textContent = msg; lastMsg = done ? 'done' : ''; }
  }
  st.t = Math.min(total(), st.ttft + 2.5); upd();
  return () => stop();
}
