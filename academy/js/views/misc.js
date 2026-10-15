import { h, inline, mdBlock, debounce, clear, announce, today } from '../util.js';
import { levels, lessons, skillById, skillsOfLevel, projectById, glossary, resources, current, lessonById } from '../content.js';
import { state, save, streak, exportData, importData, resetAll, apiKey, weekMinutes } from '../store.js';
import { skillStatus, levelProgress, weakSkills, pickQuestions, lessonDone, projectPassed, studiedSkills } from '../mastery.js';
import { renderQuestion } from '../assess.js';
import { page, bar, linkBtn, lvStyle, levelChip, skillChip, statusPill } from './common.js';
import { chatPanel } from '../tutorui.js';
import { currentBox } from '../blocks.js';
import { PATHS, ROLE_TO_PATH } from '../paths.js';

// ── Mrs Anne (full page) ─────────────────────────────────────────────────────
export function tutorPage() {
  return page('Mrs Anne', h('p', { class: 'lede' }, 'Your personal teacher. Ask, get stuck, get unstuck. I’ll explain differently when you’re confused and give hints before answers.'), chatPanel(false));
}

// ── Progress ─────────────────────────────────────────────────────────────────
export function progressView() {
  const all = [...skillById.values()];
  const c = { strong: 0, practice: 0, new: 0 }; all.forEach((s) => c[skillStatus(s.id).status]++);
  const done = lessons.filter((l) => lessonDone(l.id)).length;
  const projs = [...projectById.values()]; const pdone = projs.filter((p) => projectPassed(p.id)).length;
  const w = weakSkills(5);
  return page('Progress',
    h('div', { class: 'grid stats' },
      stat(c.strong, 'skills strong'), stat(c.practice, 'need practice'), stat(c.new, 'not yet learned'), stat(`${done}/${lessons.length}`, 'lessons complete'), stat(`${pdone}/${projs.length}`, 'projects passed'), stat(streak(), 'day streak')),
    h('p', { class: 'muted' }, 'Mastery comes from answering questions, doing exercises and passing projects, never from opening a lesson. ', h('span', { class: 'legend' }, '● Strong  ◐ Needs practice  ○ Not yet learned')),
    w.length ? h('section', { class: 'card' }, h('h2', {}, 'Practise these next'), h('ul', { class: 'plain' }, w.map((x) => h('li', {}, h('a', { href: `#/topic/${x.skill.id}` }, x.skill.name), h('span', { class: 'muted small' }, ` — ${Math.round(x.st.score * 100)}%${x.st.stale ? ', review due' : ''}`)))), linkBtn('Start a review', '#/review')) : null,
    ...levels.map((L) => { const lp = levelProgress(L.n); const sk = skillsOfLevel(L.n); if (!sk.length) return null;
      return h('section', { class: 'level', style: lvStyle(L.n) }, h('div', { class: 'level-h' }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, L.glyph), h('div', {}, h('h2', {}, `Level ${L.n}: ${L.title}`), h('p', { class: 'muted small' }, `${lp.mastery.strong}/${lp.mastery.total} skills strong · ${lp.done}/${lp.lessons} lessons · ${lp.projDone}/${lp.projects} projects`)),
        lp.certified ? linkBtn('Certificate', `#/cert/L${L.n}`, 'btn small') : null), h('div', { class: 'skills-row' }, sk.map(skillChip))); }),
    h('section', { class: 'card' }, h('h2', {}, 'Milestones'), h('ul', { class: 'plain' }, milestones().map(([ok, t]) => h('li', { class: ok ? 'ok' : 'muted' }, (ok ? '🏅 ' : '○ ') + t)))));
}
const stat = (n, label) => h('div', { class: 'card stat' }, h('div', { class: 'big' }, String(n)), h('div', { class: 'muted small' }, label));
function milestones() {
  const d = lessons.filter((l) => lessonDone(l.id)).length; const s = [...skillById.values()].filter((x) => skillStatus(x.id).status === 'strong').length;
  return [[d >= 1, 'Completed your first lesson'], [d >= 10, 'Completed 10 lessons'], [s >= 5, '5 strong skills'], [s >= 20, '20 strong skills'], [streak() >= 3, '3-day streak'], [streak() >= 7, '7-day streak'],
    [[...projectById.values()].some((p) => projectPassed(p.id)), 'Passed a project'], ...levels.map((L) => [levelProgress(L.n).certified, `Certified: Level ${L.n} ${L.short}`])];
}

// ── Certificate (printable, honest) ──────────────────────────────────────────
export function certView({ id }) {
  const n = /^L[0-7]$/.test(id || '') ? +id[1] : -1;
  if (n < 0) return page('Certificate', linkBtn('See my progress', '#/progress')); const L = levels[n]; const lp = levelProgress(n);
  if (!lp.certified) return page('Certificate', h('p', {}, `Level ${n} isn’t certified yet: it needs 75% of skills Strong and ${lp.projNeeded} passed project(s).`), linkBtn('See Level ' + n, `#/learn/L${n}`));
  const strong = skillsOfLevel(n).filter((s) => skillStatus(s.id).status === 'strong');
  return h('div', { class: 'page cert-wrap' }, h('h1', { id: 'page-title', tabindex: '-1', class: 'sr-only' }, 'Certificate'),
    h('div', { class: 'cert', style: lvStyle(n) }, h('div', { class: 'glyph big', 'aria-hidden': 'true' }, L.glyph), h('p', { class: 'kicker' }, 'Mrs Anne’s AI Academy'), h('h2', { class: 'display' }, `Level ${n}: ${L.title}`), h('p', {}, 'awarded to'),
      h('p', { class: 'display name' }, state.profile.name || '__________________'), h('p', {}, `for demonstrating ${strong.length} of ${skillsOfLevel(n).length} skills at Strong mastery and passing ${lp.projDone} project${lp.projDone === 1 ? '' : 's'}.`),
      h('p', { class: 'small' }, strong.map((s) => s.name).join(' · ')), h('p', { class: 'small muted' }, `Earned ${today()} · Based on recorded evidence in this browser. This is a personal record of learning, not an accredited qualification.`)),
    h('div', { class: 'row no-print' }, h('label', {}, 'Name on certificate ', h('input', { value: state.profile.name, oninput: (e) => { state.profile.name = e.target.value; save(); document.querySelector('.cert .name').textContent = e.target.value || '__________________'; } })), h('button', { class: 'btn primary', type: 'button', onclick: () => print() }, 'Print / save as PDF')));
}

// ── Library ──────────────────────────────────────────────────────────────────
export function libraryView({ query }) {
  const tab = query?.get('tab') || 'glossary';
  const tabs = h('nav', { class: 'tabs', 'aria-label': 'Library sections' }, [['glossary', 'Glossary'], ['resources', 'Resources'], ['cheat', 'Cheat sheets'], ['current', 'Current practice']].map(([k, t]) => h('a', { 'aria-current': k === tab ? 'page' : null, class: `tab ${k === tab ? 'on' : ''}`, href: `#/library?tab=${k}` }, t)));
  let body;
  if (tab === 'glossary') {
    const q = h('input', { type: 'search', class: 'search', 'aria-label': 'Search glossary', placeholder: 'Search the glossary…' });
    const dl = h('dl', { class: 'gloss' });
    const draw = () => { const s = q.value.toLowerCase(); clear(dl); glossary.filter((g) => !s || (g.term + g.def).toLowerCase().includes(s)).forEach((g) => dl.append(h('dt', { id: 'g-' + g.term.toLowerCase().replace(/\W+/g, '-') }, g.term, ' ', h('span', { class: 'chip lv', style: lvStyle(g.level) }, 'L' + g.level)), h('dd', {}, g.def, g.see?.length ? h('span', { class: 'muted small' }, ' See: ' + g.see.join(', ')) : null))); };
    q.addEventListener('input', debounce(draw, 100)); draw(); body = [q, dl];
  } else if (tab === 'resources') {
    const lv = h('select', { 'aria-label': 'Level' }, h('option', { value: '' }, 'All levels'), levels.map((L) => h('option', { value: L.n }, `Level ${L.n}`)));
    const kind = h('select', { 'aria-label': 'Kind' }, h('option', { value: '' }, 'All kinds'), [...new Set(resources.map((r) => r.kind))].map((k) => h('option', { value: k }, k)));
    const list = h('div', { class: 'grid' });
    const draw = () => list.replaceChildren(...resources.filter((r) => (lv.value === '' || r.level === +lv.value) && (!kind.value || r.kind === kind.value)).map((r) => h('a', { class: 'card res', href: r.url, target: '_blank', rel: 'noopener noreferrer' }, h('div', { class: 'row between' }, levelChip(r.level), h('span', { class: 'chip' }, r.kind)), h('strong', {}, r.title, h('span', { class: 'sr-only' }, ' (opens in a new tab)')), h('span', { class: 'muted small' }, `${r.by}${r.free === true ? ' · free' : r.free === 'mixed' ? ' · free or paid' : ''}`), h('span', { class: 'small' }, r.why))));
    lv.addEventListener('change', draw); kind.addEventListener('change', draw); draw();
    body = [h('p', { class: 'muted small' }, 'External links open in a new tab. Resources are chosen for authority; sites change, so tell us if one has moved.'), h('div', { class: 'filters' }, lv, kind), list];
  } else if (tab === 'cheat') {
    body = levels.map((L) => { const ls = lessons.filter((l) => l.level === L.n); return ls.length ? h('section', { style: lvStyle(L.n) }, h('h2', {}, `${L.glyph} Level ${L.n}: ${L.title}`), ls.map((l) => h('div', { class: 'card' }, h('h3', {}, h('a', { href: `#/lesson/${l.id}` }, l.title)), h('ul', {}, l.takeaways.map((t) => h('li', {}, inline(t))))))) : null; });
    body.unshift(h('button', { class: 'btn no-print', type: 'button', onclick: () => print() }, 'Print cheat sheets'));
  } else {
    body = [h('p', { class: 'muted' }, 'Fast-moving material lives here, separate from the lasting ideas, so it can be refreshed on its own. Each entry says when it was last checked.'), ...Object.keys(current).map((k) => currentBox(k))];
  }
  return page('Library', tabs, ...[body].flat());
}

// ── Review: spaced, adaptive practice ────────────────────────────────────────
export function reviewView({ query }) {
  const skill = query?.get('skill'); const level = query?.get('level'); const count = Math.min(20, Math.max(1, parseInt(query?.get('count') || '6', 10) || 6));
  const host = h('div', { class: 'quiz' }); const sum = h('div', { 'aria-live': 'polite' });
  // Review draws only from what the learner has actually met, never from lessons they haven't opened.
  const studied = studiedSkills();
  const weak = weakSkills(8).map((w) => w.skill.id);
  let qs = pickQuestions({ skills: skill ? [skill] : level != null ? undefined : (weak.length >= 2 ? weak : studied), level: level != null ? +level : undefined, count });
  if (qs.length < 3 && !skill && level == null) qs = pickQuestions({ skills: studied, count });
  if (!qs.length) return page('Review', h('p', {}, 'No questions available yet. Complete a lesson first.'), linkBtn('Go to Learn', '#/learn'));
  const res = [];
  qs.forEach((q, i) => host.append(renderQuestion(q, { number: `${i + 1}/${qs.length}`, src: 'review', onResolved: (r) => { res.push(r); if (res.length === qs.length) finish(); } })));
  const finish = () => {
    const avg = res.reduce((a, r) => a + r.score, 0) / res.length;
    const sk = [...new Set(res.map((r) => r.skill))].map((id) => skillById.get(id));
    sum.replaceChildren(h('div', { class: 'callout good' }, h('h3', {}, `Review done: ${Math.round(avg * 100)}%`), h('p', {}, 'Skill status now:'), h('ul', { class: 'plain' }, sk.map((s) => h('li', {}, s.name, ' ', statusPill(s.id)))), h('div', { class: 'row' }, linkBtn('Another round', '#/review?r=' + Date.now(), 'btn primary'), linkBtn('See progress', '#/progress', 'btn'))));
    announce('Review complete');
  };
  return page(skill ? `Practise: ${skillById.get(skill)?.name || 'topic'}` : level != null ? `Level ${level} challenge` : 'Review', h('p', { class: 'lede' }, 'Questions chosen from your weakest and stalest skills, harder where you’re strong. Each answer updates your mastery.'), host, sum);
}

// ── Settings / privacy ───────────────────────────────────────────────────────
export function settingsView() {
  const s = state.settings; const p = state.profile;
  const msg = h('p', { 'aria-live': 'polite', class: 'muted' });
  const theme = h('select', { id: 'set-theme', onchange: (e) => { s.theme = e.target.value; save(); applyTheme(); } }, [['auto', 'Match my device'], ['light', 'Light'], ['dark', 'Dark']].map(([v, t]) => h('option', { value: v, selected: s.theme === v ? true : null }, t)));
  const key = h('input', { id: 'set-key', type: 'password', autocomplete: 'off', placeholder: 'sk-…', value: apiKey.get() });
  const remember = h('input', { id: 'set-rem', type: 'checkbox', checked: s.rememberKey ? true : null });
  const file = h('input', { type: 'file', accept: 'application/json', class: 'sr-only', id: 'imp', onchange: async (e) => { try { importData(await e.target.files[0].text()); msg.textContent = 'Imported. Reloading…'; setTimeout(() => location.reload(), 600); } catch (err) { msg.textContent = err.message; } } });
  return page('Settings & privacy',
    h('section', { class: 'card' }, h('h2', {}, 'You'), field('Nickname (optional; used only on this device)', h('input', { id: 'set-name', value: p.name, maxlength: 40, oninput: (e) => { p.name = e.target.value; save(); } })),
      field('Weekly learning goal (minutes)', h('input', { id: 'set-min', type: 'number', min: 15, max: 1200, step: 15, value: p.minutesPerWeek, oninput: (e) => { p.minutesPerWeek = +e.target.value || 60; save(); } })),
      field('Path', h('select', { id: 'set-path', onchange: (e) => { p.path = e.target.value; save(); msg.textContent = 'Path updated.'; } }, Object.entries(PATHS).map(([k, P]) => h('option', { value: k, selected: p.path === k ? true : null }, P.label)))), field('Theme', theme),
      h('a', { class: 'btn', href: '#/onboarding' }, 'Redo the welcome check')),
    h('section', { class: 'card' }, h('h2', {}, 'Connect a model (optional)'),
      h('p', {}, 'Without this, Mrs Anne still teaches from the course: re-explaining, hints, quizzes, search. With a model connected, she can also answer open-ended questions and review your project writing in more depth.'),
      h('div', { class: 'callout warn' }, h('strong', {}, 'Read this first. '), 'This app has no server. Your key lives only in this tab’s memory (never saved to disk unless you tick “remember for this tab”, which uses session storage and disappears when you close the tab). Messages go straight from your browser to the address below. Use a key with a low spend limit, never one shared with others, and don’t paste secrets or personal data into the chat.'),
      field('API key', key), field('Model name', h('input', { id: 'set-model', value: s.model, placeholder: 'claude-sonnet-5-5', oninput: (e) => { s.model = e.target.value.trim(); save(); } })),
      h('p', { class: 'muted small' }, 'Custom endpoints (a proxy or gateway) only work if the site host allows them in its Content-Security-Policy connect-src; the default deployment allows api.anthropic.com only.'), field('API base URL', h('input', { id: 'set-base', value: s.baseUrl, placeholder: 'https://api.anthropic.com', oninput: (e) => { s.baseUrl = e.target.value.trim(); save(); } })),
      h('label', { class: 'inline' }, remember, ' Remember the key for this tab only'),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { apiKey.set(key.value.trim(), remember.checked); s.rememberKey = remember.checked; save(); msg.textContent = key.value.trim() ? 'Connected for this session.' : 'Disconnected.'; } }, 'Save connection'), h('button', { class: 'btn', type: 'button', onclick: () => { apiKey.clear(); key.value = ''; msg.textContent = 'Key removed.'; } }, 'Remove key'))),
    h('section', { class: 'card' }, h('h2', {}, 'Your data'),
      h('p', {}, 'Everything about your learning (progress, answers, project drafts) is stored in this browser only. There are no accounts, no analytics and no tracking. Nothing is sent anywhere unless you connect a model above, and then only what you type to Mrs Anne (plus the lesson title and key points, and your role and weak-topic names for context).'),
      h('ul', {}, h('li', {}, 'Because there is no account, there is no login to protect, and no server holds your data. Clearing site data erases your progress, so export a backup.'), h('li', {}, 'We store a nickname only if you give one.')),
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => { const b = new Blob([exportData()], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(b), download: `mrs-anne-progress-${today()}.json` }); document.body.append(a); a.click(); a.remove(); } }, 'Export my progress'), h('label', { class: 'btn', for: 'imp' }, 'Import a backup'), file,
        h('button', { class: 'btn danger', type: 'button', onclick: () => { if (confirm('Erase all progress on this device? This cannot be undone.')) { resetAll(); location.hash = '#/home'; location.reload(); } } }, 'Erase everything')), msg));
}
const field = (label, input) => h('div', { class: 'field' }, h('label', { for: input.id }, label), input);
export function applyTheme() { const t = state.settings.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }
