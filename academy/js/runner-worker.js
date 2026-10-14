// Sandboxed code runner. Runs in a dedicated Worker: no DOM, no storage, and network APIs removed before student code runs.
// Served with its own CSP (see netlify.toml) that allows eval here only.
for (const k of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'indexedDB', 'caches', 'navigator', 'BroadcastChannel']) { try { self[k] = undefined; } catch { /* ignore */ } }
const canon = (v) => JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x === undefined ? null : typeof x === 'number' && !Number.isFinite(x) ? String(x) : x));
const deepEq = (a, b) => { try { return canon(a) === canon(b); } catch { return false; } };
const short = (v) => { let s; try { s = canon(v); } catch { s = String(v); } return s === undefined ? 'undefined' : s.length > 160 ? s.slice(0, 160) + '…' : s; };

self.onmessage = (e) => {
  const { code, fnName, tests } = e.data;
  const logs = [];
  const fmt = (a) => a.map((x) => (typeof x === 'string' ? x : short(x))).join(' ');
  const con = { log: (...a) => logs.push(fmt(a)), info: (...a) => logs.push(fmt(a)), warn: (...a) => logs.push('warn: ' + fmt(a)), error: (...a) => logs.push('error: ' + fmt(a)) };
  let fn;
  try {
    const factory = new Function('console', `"use strict";\n${code}\n;return ${fnName ? `typeof ${fnName} === 'function' ? ${fnName} : undefined` : 'undefined'};`);
    fn = factory(con);
  } catch (err) {
    return self.postMessage({ ok: false, error: `${err.name}: ${err.message}`, logs, results: [] });
  }
  if (!tests?.length) return self.postMessage({ ok: true, logs, results: [], noTests: true });
  if (typeof fn !== 'function') return self.postMessage({ ok: false, error: `I couldn’t find a function called ${fnName}. Keep that name exactly.`, logs, results: [] });
  const results = tests.map((t) => {
    try {
      const args = JSON.parse(JSON.stringify(t.args ?? []));
      const got = fn(...args);
      if (got && typeof got.then === 'function') return { pass: false, error: 'Your function returned a Promise — keep it synchronous here.', args: t.args, expect: short(t.expect), label: t.label };
      return { pass: deepEq(got, t.expect), got: short(got), expect: short(t.expect), args: short(t.args), label: t.label };
    } catch (err) { return { pass: false, error: `${err.name}: ${err.message}`, args: short(t.args), expect: short(t.expect), label: t.label }; }
  });
  self.postMessage({ ok: results.every((r) => r.pass), results, logs });
};
