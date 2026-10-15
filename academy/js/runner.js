// Runs student JavaScript safely: fresh Worker per run, hard 2 s timeout, no network inside.
const URL_ = new URL('./runner-worker.js', import.meta.url);
export function runCode({ code, fnName, tests, timeout = 2000 }) {
  return new Promise((resolve) => {
    let w;
    try { w = new Worker(URL_); } catch (e) { return resolve({ ok: false, error: 'Code sandbox unavailable in this browser: ' + e.message, results: [], logs: [] }); }
    const done = (r) => { clearTimeout(t); w.terminate(); resolve(r); };
    const t = setTimeout(() => done({ ok: false, error: `Timed out after ${timeout / 1000}s — is there an infinite loop?`, results: [], logs: [] }), timeout);
    const nonce = crypto.getRandomValues(new Uint32Array(4)).join('-'); // worker echoes it; student code can't know it
    w.onmessage = (e) => { if (e.data?.nonce === nonce) done(e.data); };
    w.onerror = (e) => done({ ok: false, error: e.message || 'Script error', results: [], logs: [] });
    w.postMessage({ code, fnName, tests, nonce });
  });
}
