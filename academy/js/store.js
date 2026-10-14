// The learner model. Lives in this browser only (localStorage). Collects no personal data beyond an optional nickname.
import { today, daysBetween } from './util.js';
const KEY = 'mrsanne.v1';
let mem = null; // fallback when storage is blocked
const subs = new Set();

const fresh = () => ({
  v: 1,
  created: today(),
  onboarded: false,
  profile: { name: '', role: 'beginner', aiRating: 1, coding: 'none', goals: [], interests: [], style: 'hands-on', minutesPerWeek: 90, path: 'beginner', startLevel: 0 },
  lessons: {},    // id -> { opened, completed, firstTry, best, attempts, at, minutes }
  evidence: {},   // skillId -> [{ t, s, w, src }]
  projects: {},   // id -> { ticks:[], text, code, status, checks, reviewed, passedAt, hints }
  notes: {},      // id -> reflection text
  days: {},       // yyyy-mm-dd -> { items, minutes }
  seenQuestions: {}, // qid -> count
  settings: { theme: 'auto', model: '', baseUrl: '', rememberKey: false },
});

function read() {
  try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch { /* blocked or corrupt */ }
  return mem ? migrate(mem) : fresh();
}
function migrate(s) { const f = fresh(); return { ...f, ...s, profile: { ...f.profile, ...(s.profile || {}) }, settings: { ...f.settings, ...(s.settings || {}) } }; }

export let state = read();
let timer;
export function save() {
  clearTimeout(timer);
  timer = setTimeout(flush, 150);
  subs.forEach((f) => f(state));
}
export function flush() {
  const raw = JSON.stringify(state);
  try { localStorage.setItem(KEY, raw); } catch { mem = JSON.parse(raw); }
}
addEventListener('pagehide', flush);
export const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };

export function touchDay(items = 1, minutes = 0) {
  const d = (state.days[today()] ??= { items: 0, minutes: 0 });
  d.items += items; d.minutes += minutes; save();
}
export function streak() {
  let n = 0; const d = new Date();
  const key = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  if (!state.days[key(d)]) d.setDate(d.getDate() - 1); // today not yet done doesn't break the streak
  while (state.days[key(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export function weekMinutes() {
  let m = 0; const t = today();
  for (const [k, v] of Object.entries(state.days)) if (daysBetween(k, t) < 7 && daysBetween(k, t) >= 0) m += v.minutes || 0;
  return m;
}
export function exportData() { return JSON.stringify(state, null, 2); }
export function importData(json) {
  const s = JSON.parse(json);
  if (!s || typeof s !== 'object' || s.v !== 1) throw new Error('This does not look like a Mrs Anne export.');
  state = migrate(s); flush(); subs.forEach((f) => f(state));
}
export function resetAll() { state = fresh(); mem = null; try { localStorage.removeItem(KEY); } catch { /* ignore */ } subs.forEach((f) => f(state)); }

// API key is never written to localStorage. Optionally kept for this tab only.
let keyMem = '';
export const apiKey = {
  get() { try { return keyMem || sessionStorage.getItem('mrsanne.key') || ''; } catch { return keyMem; } },
  set(k, remember) { keyMem = k; try { if (remember && k) sessionStorage.setItem('mrsanne.key', k); else sessionStorage.removeItem('mrsanne.key'); } catch { /* ignore */ } },
  clear() { this.set('', false); },
};
