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

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const SAFE_KEY = /^[A-Za-z0-9._:-]{1,80}$/; // also blocks __proto__ / constructor-style keys
const dict = (v, valid) => { const o = Object.create(null); if (isObj(v)) for (const [k, x] of Object.entries(v)) if (SAFE_KEY.test(k) && k !== '__proto__' && valid(x)) o[k] = x; return { ...o }; };
// Defensive load: any corrupt, hand-edited or hostile section falls back to a safe empty value instead of breaking every screen.
function migrate(s) {
  const f = fresh(); if (!isObj(s)) return f;
  const ev = dict(s.evidence, Array.isArray);
  for (const k of Object.keys(ev)) ev[k] = ev[k].filter((e) => isObj(e) && Number.isFinite(e.s) && Number.isFinite(e.w) && typeof e.t === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.t)).map((e) => ({ t: e.t, s: Math.max(0, Math.min(1, e.s)), w: Math.max(0, Math.min(5, e.w)), src: typeof e.src === 'string' ? e.src.slice(0, 120) : 'x' })).slice(-14);
  const num = (v) => Number.isFinite(v) ? v : 0;
  const str = (v, d = '') => (typeof v === 'string' ? v.slice(0, 60) : d);
  const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 20).map((x) => x.slice(0, 80)) : []);
  const pr = isObj(s.profile) ? s.profile : {};
  return {
    v: 1, created: str(s.created, f.created), onboarded: !!s.onboarded,
    profile: { ...f.profile, name: str(pr.name), role: str(pr.role, f.profile.role), aiRating: Math.min(5, Math.max(1, num(pr.aiRating) || 1)), coding: str(pr.coding, 'none'), goals: list(pr.goals), interests: list(pr.interests), style: str(pr.style, 'hands-on'), minutesPerWeek: Math.min(2000, Math.max(10, num(pr.minutesPerWeek) || 90)), path: str(pr.path, 'beginner'), startLevel: Math.min(7, Math.max(0, num(pr.startLevel))) },
    lessons: dict(s.lessons, isObj), evidence: ev, projects: dict(s.projects, isObj), notes: dict(s.notes, (x) => typeof x === 'string'),
    days: dict(s.days, (x) => isObj(x) && /* ok */ true), seenQuestions: dict(s.seenQuestions, Number.isFinite),
    settings: { ...f.settings, ...(isObj(s.settings) ? { theme: ['auto', 'light', 'dark'].includes(s.settings.theme) ? s.settings.theme : 'auto', model: str(s.settings.model), baseUrl: str(s.settings.baseUrl), rememberKey: !!s.settings.rememberKey } : {}) },
  };
}
function read() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { /* blocked */ }
  if (raw) {
    try { return migrate(JSON.parse(raw)); }
    catch { try { localStorage.setItem(KEY + '.corrupt', raw.slice(0, 200000)); } catch { /* ignore */ } } // keep a copy instead of silently overwriting
  }
  return mem ? migrate(mem) : fresh();
}

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
addEventListener('storage', (e) => { if (e.key === KEY && e.newValue) { try { state = migrate(JSON.parse(e.newValue)); subs.forEach((f) => f(state)); } catch { /* ignore */ } } });
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
  if (typeof json !== 'string' || json.length > 2_000_000) throw new Error('That file is too large to be a Mrs Anne export.');
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
