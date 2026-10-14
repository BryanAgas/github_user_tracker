// rlgrid: tabular Q-learning on a small grid world (epsilon-greedy), reward editor, reward-hacking preset.
export const meta = { name: 'rlgrid', title: 'Grid-world learner', blurb: 'Watch a Q-learning agent learn from rewards, edit the rewards, and catch it gaming a badly designed one.', level: 3, skills: ['l3.rl'] };

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
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const R = 5, C = 6, START = [4, 0];
const MAPS = {
  classic: ['.....G', '.##.T.', '......', '.T.#..', '...#..'],
  hack: ['.....G', '.##.T.', '......', '.T.#..', '.C.#..'],
};
const ACTS = [[-1, 0, '↑', 'up'], [0, 1, '→', 'right'], [1, 0, '↓', 'down'], [0, -1, '←', 'left']];
const TOOLS = [['G', 'Goal (+10, ends episode)'], ['T', 'Trap (-10, ends episode)'], ['C', 'Coin (+1 every time you step on it)'], ['#', 'Wall'], ['.', 'Erase']];
const ALPHA = 0.5, GAMMA = 0.95, STEP = -0.04, MAXSTEPS = 40;

export function mount(el, props = {}, ctx = {}) {
  let grid, Q, rng, episodes = 0, recent = [], tool = 'G', timer = null, agent = START.slice(), speed = 20;
  let eps = 0.2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = h('div', { class: 'w-b-card w-rl' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const board = h('div', { class: 'w-rl-board', role: 'grid', 'aria-label': 'Grid world. Arrow keys move between cells, Enter paints the selected tool.' });
  const stats = h('div', { class: 'w-rl-stats' }), policy = h('p', { class: 'w-rl-policy' });
  const toolBar = h('div', { class: 'w-b-row w-rl-tools', role: 'group', 'aria-label': 'Paint tool' }, TOOLS.map(([k, l]) => h('button', { type: 'button', class: 'w-b-btn w-rl-tool', 'data-tool': k, 'aria-pressed': k === tool ? 'true' : 'false', onclick: () => { tool = k; [...toolBar.children].forEach((b) => b.setAttribute('aria-pressed', b.dataset.tool === tool ? 'true' : 'false')); } }, l)));
  const playB = h('button', { class: 'w-b-btn', type: 'button', onclick: togglePlay }, '▶ Train continuously');
  const spV = h('b', { text: String(speed) }), epV = h('b', { text: eps.toFixed(2) });
  root.append(
    h('h3', { class: 'w-b-title', text: 'A tiny agent learns by trial and error' }),
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), 'press "Reward-hacking preset", train for a few seconds, then read what the agent "learned". Is it doing what we wanted?'),
    h('div', { class: 'w-b-row' },
      h('button', { class: 'w-b-btn w-b-primary', type: 'button', onclick: () => { train(100); } }, 'Train 100 episodes'),
      h('button', { class: 'w-b-btn', type: 'button', onclick: () => { stepOnce(); } }, 'Step (one move)'), playB,
      h('button', { class: 'w-b-btn', type: 'button', onclick: () => { stop(); newQ(); render(); } }, 'Reset learning'),
      h('button', { class: 'w-b-btn', type: 'button', onclick: () => { stop(); load('classic'); } }, 'Classic map'),
      h('button', { class: 'w-b-btn', type: 'button', onclick: () => { stop(); load('hack'); train(300); } }, 'Reward-hacking preset')),
    h('div', { class: 'w-b-grid w-b-cols2' },
      h('label', { class: 'w-b-field' }, h('span', {}, 'Speed: ', spV, ' episodes per second'), h('input', { type: 'range', min: 2, max: 200, value: speed, oninput: (e) => { speed = +e.target.value; spV.textContent = speed; } })),
      h('label', { class: 'w-b-field' }, h('span', {}, 'Exploration (epsilon): ', epV, ' of moves are random'), h('input', { type: 'range', min: 0, max: 0.5, step: 0.01, value: eps, oninput: (e) => { eps = +e.target.value; epV.textContent = eps.toFixed(2); } }))),
    h('p', { class: 'w-rl-lbl' }, h('b', { text: 'Reward editor. ' }), 'Pick a tool, then click (or press Enter on) a cell. Changing rewards resets learning.'), toolBar,
    board, stats, policy, live,
    h('p', { class: 'w-b-note', text: 'Toy model: real tabular Q-learning (learning rate 0.5, discount 0.95, step cost -0.04, 40-move episodes), but on a 5 by 6 grid. Arrow = best-known move; number = estimated value; shading shows how good the cell looks.' }));
  el.append(root);

  function load(name) { grid = MAPS[name].map((r) => r.split('')); newQ(); if (name === 'hack') { /* trained by caller */ } else train(120); render(); }
  function newQ() { Q = Array.from({ length: R * C }, () => [0, 0, 0, 0]); rng = mulberry32(7); episodes = 0; recent = []; agent = START.slice(); }
  const at = (r, c) => (r < 0 || c < 0 || r >= R || c >= C ? '#' : grid[r][c]);
  function move(r, c, a) { // returns [nr, nc, reward, done]
    const nr = r + ACTS[a][0], nc = c + ACTS[a][1], t = at(nr, nc);
    if (t === '#') return [r, c, STEP, false];
    if (t === 'G') return [nr, nc, 10, true]; if (t === 'T') return [nr, nc, -10, true]; if (t === 'C') return [nr, nc, 1 + STEP, false];
    return [nr, nc, STEP, false];
  }
  const best = (s) => { let b = 0; for (let a = 1; a < 4; a++) if (Q[s][a] > Q[s][b] + 1e-9) b = a; return b; };
  function pick(s, e) { if (rng() < e) return Math.floor(rng() * 4); const m = Math.max(...Q[s]), c = Q[s].map((q, i) => (Math.abs(q - m) < 1e-9 ? i : -1)).filter((i) => i >= 0); return c[Math.floor(rng() * c.length)]; }
  function update(r, c, a) { const [nr, nc, rew, done] = move(r, c, a), s = r * C + c, s2 = nr * C + nc; Q[s][a] += ALPHA * (rew + (done ? 0 : GAMMA * Math.max(...Q[s2])) - Q[s][a]); return [nr, nc, rew, done]; }
  function episode() { let r = START[0], c = START[1], ret = 0; for (let i = 0; i < MAXSTEPS; i++) { const a = pick(r * C + c, eps); const [nr, nc, rew, done] = update(r, c, a); ret += rew; r = nr; c = nc; if (done) break; } episodes++; recent.push(ret); if (recent.length > 30) recent.shift(); }
  function train(n) { for (let i = 0; i < n; i++) episode(); agent = START.slice(); render(); }
  function stepOnce() { const [r, c] = agent, a = pick(r * C + c, eps), [nr, nc, , done] = update(r, c, a); agent = done || at(nr, nc) === '#' && false ? START.slice() : [nr, nc]; if (done) episodes++; render(); }
  function togglePlay() { if (timer) return stop(); playB.textContent = '⏸ Pause training'; timer = setInterval(() => train(Math.max(1, Math.round(speed / 10))), 100); }
  function stop() { if (timer) clearInterval(timer); timer = null; playB.textContent = '▶ Train continuously'; }

  function greedyPath() {
    let r = START[0], c = START[1], total = 0; const path = [], seen = new Map(); let end = 'steps';
    for (let i = 0; i < 30; i++) {
      const s = r * C + c; const a = best(s); const [nr, nc, rew, done] = move(r, c, a); path.push(ACTS[a][3]); total += rew;
      if (nr === r && nc === c && at(r + ACTS[a][0], c + ACTS[a][1]) === '#') { end = 'stuck'; break; }
      r = nr; c = nc; if (done) { end = at(r, c) === 'G' ? 'goal' : 'trap'; break; }
      const k = s + ':' + a; seen.set(k, (seen.get(k) || 0) + 1); if (seen.get(k) > 2) { end = 'loop'; break; }
    }
    return { path, end, total };
  }

  function render() {
    board.textContent = '';
    let mx = 1, mn = -1; for (let s = 0; s < R * C; s++) { const m = Math.max(...Q[s]); mx = Math.max(mx, m); mn = Math.min(mn, m); }
    for (let r = 0; r < R; r++) {
      const row = h('div', { class: 'w-rl-row', role: 'row' });
      for (let c = 0; c < C; c++) {
        const t = grid[r][c], s = r * C + c, isStart = r === START[0] && c === START[1], isAgent = agent[0] === r && agent[1] === c;
        const q = Math.max(...Q[s]), b = best(s), learned = Q[s].some((x) => Math.abs(x) > 0.05);
        let label = { G: 'GOAL', T: 'TRAP', C: 'COIN', '#': '' }[t] || '';
        const heat = t === '.' && learned ? (q >= 0 ? `color-mix(in srgb, var(--good) ${Math.round((q / mx) * 55)}%, var(--surface))` : `color-mix(in srgb, var(--bad) ${Math.round((q / mn) * 55)}%, var(--surface))`) : null;
        const cell = h('button', { type: 'button', role: 'gridcell', class: `w-rl-cell t${t === '#' ? 'W' : t === '.' ? 'E' : t}${isAgent ? ' is-agent' : ''}`, style: heat ? `background:${heat}` : null, 'data-r': r, 'data-c': c, tabindex: r === 0 && c === 0 ? 0 : -1,
          'aria-label': `Row ${r + 1}, column ${c + 1}: ${t === '#' ? 'wall' : t === 'G' ? 'goal' : t === 'T' ? 'trap' : t === 'C' ? 'coin' : isStart ? 'start' : 'empty'}${t === '.' && learned ? `, best move ${ACTS[b][3]}, value ${q.toFixed(1)}` : ''}${isAgent ? ', agent here' : ''}`,
          onclick: () => paint(r, c), onkeydown: (e) => navKey(e, r, c) },
        t === '#' ? h('span', { class: 'w-rl-wall', 'aria-hidden': 'true', text: '▨' }) : null,
        label ? h('span', { class: 'w-rl-tag', text: label }) : null,
        t === '.' && learned ? h('span', { class: 'w-rl-arrow', 'aria-hidden': 'true', text: ACTS[b][2] }) : null,
        t === '.' || t === 'C' ? h('span', { class: 'w-rl-val', 'aria-hidden': 'true', text: learned ? (Math.abs(q) < 0.05 ? '0.0' : q.toFixed(1)) : '' }) : null,
        isStart ? h('span', { class: 'w-rl-start', 'aria-hidden': 'true', text: 'S' }) : null,
        isAgent ? h('span', { class: 'w-rl-ag', 'aria-hidden': 'true', text: '●' }) : null);
        row.append(cell);
      }
      board.append(row);
    }
    const avg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
    stats.textContent = `Episodes trained: ${episodes}    Average return (last ${recent.length}): ${avg.toFixed(1)}`;
    const g = greedyPath(), hasCoin = grid.some((r) => r.includes('C'));
    let txt;
    if (!episodes) txt = 'Untrained: the agent knows nothing yet. Press Train.';
    else if (g.end === 'goal') txt = `Learned policy: from the start the agent goes ${g.path.join(', ')} and reaches the GOAL (return ${g.total.toFixed(1)}). It does what we wanted.`;
    else if (g.end === 'loop' && hasCoin) txt = `Reward hacking: the agent shuffles ${g.path.slice(0, 4).join(', ')}... over the COIN again and again and never goes to the goal. We rewarded coin-grabbing, so it grabs coins. The reward, not the agent, was the mistake.`;
    else if (g.end === 'trap') txt = `Learned policy so far walks into a TRAP (${g.path.join(', ')}). It needs more training, or the map leaves no better route.`;
    else txt = `The agent is still unsure (${g.path.slice(0, 6).join(', ')}...). Train more, or check there is a goal it can reach.`;
    policy.textContent = txt;
    live.textContent = `${episodes} episodes. ${txt}`; if (ctx.announce && !timer) ctx.announce(txt);
  }
  function paint(r, c) {
    if (r === START[0] && c === START[1] && tool !== '.') return;
    if (grid[r][c] === tool || (tool === '.' && grid[r][c] === '.')) return;
    stop(); grid[r][c] = tool; newQ(); train(60); render();
    const cell = board.querySelector(`[data-r="${r}"][data-c="${c}"]`); if (cell) cell.focus();
  }
  function navKey(e, r, c) {
    const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]; if (!d) return;
    e.preventDefault(); const t = board.querySelector(`[data-r="${r + d[0]}"][data-c="${c + d[1]}"]`);
    if (t) { board.querySelectorAll('[tabindex="0"]').forEach((x) => x.setAttribute('tabindex', '-1')); t.setAttribute('tabindex', '0'); t.focus(); }
  }
  load('classic');
  return () => stop();
}
