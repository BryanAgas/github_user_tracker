import { h, clear, icon, announce } from './util.js';
import { levels, lessons } from './content.js';
import { state, subscribe } from './store.js';
import { mountDrawer, openTutor, setTutorContext } from './tutorui.js';
import { applyTheme } from './views/misc.js';

const NAV = [['home', 'Home', 'home'], ['learn', 'Learn', 'learn'], ['explore', 'Explore', 'explore'], ['lab', 'Lab', 'lab'], ['build', 'Build', 'build'], ['tutor', 'Mrs Anne', 'tutor'], ['progress', 'Progress', 'progress'], ['library', 'Library', 'library']];
const BOTTOM = ['home', 'learn', 'build', 'tutor'];
const loaders = {
  home: () => import('./views/home.js').then((m) => m.default),
  learn: () => import('./views/learn.js').then((m) => m.default),
  lesson: () => import('./views/lesson.js').then((m) => m.default),
  explore: () => import('./views/explore.js').then((m) => m.default),
  topic: () => import('./views/explore.js').then((m) => (p, e) => m.default({ id: p.id, query: p.query }, e)),
  lab: () => import('./views/lab.js').then((m) => m.default),
  build: () => import('./views/build.js').then((m) => m.default),
  tutor: () => import('./views/misc.js').then((m) => m.tutorPage),
  progress: () => import('./views/misc.js').then((m) => m.progressView),
  library: () => import('./views/misc.js').then((m) => m.libraryView),
  review: () => import('./views/misc.js').then((m) => m.reviewView),
  settings: () => import('./views/misc.js').then((m) => m.settingsView),
  cert: () => import('./views/misc.js').then((m) => m.certView),
  onboarding: () => import('./views/onboarding.js').then((m) => m.default),
};
const AREA = { lesson: 'learn', topic: 'explore', cert: 'progress', review: 'learn', onboarding: 'home', settings: 'home' };
const TITLES = { home: 'Home', learn: 'Learn', lesson: 'Lesson', explore: 'Explore', topic: 'Topic', lab: 'Lab', build: 'Build', tutor: 'Mrs Anne', progress: 'Progress', library: 'Library', review: 'Review', settings: 'Settings', cert: 'Certificate', onboarding: 'Welcome' };

const main = document.getElementById('main');
let env = { cleanups: [] };

function parse() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [pathPart, qs] = raw.split('?');
  const [route, ...rest] = pathPart.split('/');
  return { route: route || 'home', id: rest.length ? decodeURIComponent(rest.join('/')) : undefined, query: new URLSearchParams(qs || '') };
}

async function render() {
  const { route, id, query } = parse();
  env.cleanups.forEach((c) => { try { c(); } catch { /* ignore */ } });
  env = { cleanups: [] };
  setTutorContext({});
  const load = loaders[route] || loaders.home;
  main.setAttribute('aria-busy', 'true');
  let node;
  try {
    const view = await load();
    node = await view({ id, query, route }, env);
  } catch (e) {
    console.error(e);
    node = h('div', { class: 'page' }, h('h1', { id: 'page-title', tabindex: '-1' }, 'Something went wrong'), h('p', {}, 'That page hit a problem. Your progress is safe.'), h('p', { class: 'muted small' }, String(e.message || e)), h('a', { class: 'btn', href: '#/home' }, 'Back home'));
  }
  clear(main); main.append(node); main.removeAttribute('aria-busy');
  const area = AREA[route] || route;
  document.querySelectorAll('[data-nav]').forEach((a) => { const on = a.dataset.nav === area; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  const t = main.querySelector('h1')?.textContent || TITLES[route] || 'Mrs Anne';
  document.title = `${t} · Mrs Anne’s AI Academy`;
  if (!location.hash.includes('noscroll')) window.scrollTo(0, 0);
  const f = main.querySelector('h1'); f?.setAttribute('tabindex', '-1'); f?.focus({ preventScroll: true });
  closeMore();
}

function buildShell() {
  const link = (k, t, ic, cls = '') => h('a', { href: `#/${k}`, class: cls, dataset: { nav: k } }, icon(ic), h('span', {}, t));
  const side = h('nav', { class: 'side', 'aria-label': 'Main' }, h('a', { class: 'brand', href: '#/home' }, h('span', { class: 'logo', 'aria-hidden': 'true' }, 'A'), h('span', {}, 'Mrs Anne', h('small', {}, 'AI Academy'))), NAV.map(([k, t, ic]) => link(k, t, ic)),
    h('div', { class: 'side-foot' }, h('a', { href: '#/settings', class: 'small' }, 'Settings & privacy')));
  const more = h('div', { class: 'more', id: 'more', hidden: true }, NAV.filter(([k]) => !BOTTOM.includes(k)).map(([k, t, ic]) => link(k, t, ic)), h('a', { href: '#/settings', dataset: { nav: 'settings' } }, icon('settings'), h('span', {}, 'Settings')));
  const bottom = h('nav', { class: 'bottom', 'aria-label': 'Main (mobile)' }, NAV.filter(([k]) => BOTTOM.includes(k)).map(([k, t, ic]) => link(k, t, ic)),
    h('button', { type: 'button', class: 'morebtn', 'aria-expanded': 'false', 'aria-controls': 'more', onclick: toggleMore }, icon('more'), h('span', {}, 'More')));
  const top = h('div', { class: 'topbar' }, h('a', { class: 'brand sm', href: '#/home' }, h('span', { class: 'logo', 'aria-hidden': 'true' }, 'A'), 'Mrs Anne'),
    h('button', { class: 'btn small', type: 'button', onclick: () => openTutor() }, icon('tutor'), ' Ask Mrs Anne'),
    h('button', { class: 'btn small icon', type: 'button', 'aria-label': 'Toggle dark mode', onclick: () => { const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); state.settings.theme = dark ? 'light' : 'dark'; applyTheme(); import('./store.js').then((m) => m.save()); } }, icon('theme')));
  document.getElementById('shell').prepend(side, top);
  document.getElementById('shell').append(bottom, more);
  mountDrawer(document.body);
}
function toggleMore() { const m = document.getElementById('more'); const b = document.querySelector('.morebtn'); const open = m.hidden; m.hidden = !open; b.setAttribute('aria-expanded', String(open)); }
function closeMore() { const m = document.getElementById('more'); if (m && !m.hidden) { m.hidden = true; document.querySelector('.morebtn').setAttribute('aria-expanded', 'false'); } }

applyTheme();
buildShell();
addEventListener('hashchange', render);
if (!location.hash && !state.onboarded) { /* first visit: Home shows the welcome call to action */ }
render();
window.__academy = { lessons: lessons.length, levels: levels.map((l) => l.ready) };
