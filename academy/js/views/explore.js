import { h, debounce } from '../util.js';
import { levels, skillById, lessons, glossary, questionsForSkill } from '../content.js';
import { skillStatus } from '../mastery.js';
import { page, lvStyle, levelChip, statusPill, linkBtn } from './common.js';
import { search } from '../tutor.js';
import { openTutor } from '../tutorui.js';

export default function explore({ id, query }) {
  if (id) return topic(id);
  const q0 = query?.get('q') || '';
  const input = h('input', { type: 'search', id: 'ex-q', class: 'search', placeholder: 'Search topics, lessons and ideas (try “attention”, “prompt”, “RAG”)…', value: q0, 'aria-label': 'Search all AI topics' });
  const lvSel = h('select', { id: 'ex-lv', 'aria-label': 'Filter by level' }, h('option', { value: '' }, 'All levels'), levels.map((L) => h('option', { value: L.n }, `Level ${L.n}: ${L.short}`)));
  const stSel = h('select', { id: 'ex-st', 'aria-label': 'Filter by mastery' }, [['', 'Any mastery'], ['new', 'Not yet learned'], ['practice', 'Needs practice'], ['strong', 'Strong']].map(([v, t]) => h('option', { value: v }, t)));
  const out = h('div', { class: 'grid topics', 'aria-live': 'polite' });
  const count = h('p', { class: 'muted small' });
  const render = () => {
    const q = input.value.trim().toLowerCase(); const lv = lvSel.value, st = stSel.value;
    let skills = [...skillById.values()].filter((s) => (!lv || s.level === +lv) && (!st || skillStatus(s.id).status === st));
    let hits = null;
    if (q) {
      hits = new Map(search(q, 40).filter((x) => x.d.lesson).map((x) => [x.d.lesson.id, x.s]));
      skills = skills.filter((s) => (s.name + ' ' + s.desc).toLowerCase().includes(q) || s.lessons.some((l) => hits.has(l)));
    }
    out.replaceChildren(...skills.map((s) => h('a', { class: 'card topic', href: `#/topic/${s.id}`, style: lvStyle(s.level) }, h('div', { class: 'row between' }, levelChip(s.level), statusPill(s.id)), h('strong', {}, s.name), h('span', { class: 'muted small' }, s.desc), h('span', { class: 'small' }, `${s.lessons.length} lesson${s.lessons.length === 1 ? '' : 's'}`))));
    count.textContent = skills.length ? `${skills.length} topics` : 'Nothing matches. Try a broader word, or ask Mrs Anne.';
  };
  const d = debounce(render, 120);
  input.addEventListener('input', d); lvSel.addEventListener('change', render); stSel.addEventListener('change', render);
  render();
  return page('Explore', h('p', { class: 'lede' }, 'Every topic in the curriculum, in any order. Curious about something? Start there.'), h('div', { class: 'filters' }, input, lvSel, stSel), count, out);
}

function topic(id) {
  const s = skillById.get(id);
  if (!s) return page('Topic not found', linkBtn('Back to Explore', '#/explore'));
  const st = skillStatus(id);
  const ls = s.lessons.map((l) => lessons.find((x) => x.id === l));
  const qn = questionsForSkill(id).length;
  const terms = glossary.filter((g) => (s.name + ' ' + s.desc).toLowerCase().includes(g.term.toLowerCase())).slice(0, 6);
  return page(s.name, h('div', { style: lvStyle(s.level) },
    h('div', { class: 'row' }, levelChip(s.level), statusPill(id)),
    h('p', { class: 'lede' }, s.desc),
    h('section', { class: 'card' }, h('h2', {}, 'Where you are'),
      st.n ? h('p', {}, `Recency-weighted score ${Math.round(st.score * 100)}% from ${st.n} pieces of evidence.${st.stale ? ' It’s been a while — a refresher will keep it strong.' : ''}`) : h('p', {}, 'No evidence yet: opening a lesson isn’t evidence, answering questions is.'),
      h('p', { class: 'muted small' }, 'Strong needs a score of 80%+ across at least three weighted pieces of evidence from at least two different places, and recent practice.'),
      h('div', { class: 'row' }, qn ? linkBtn('Practise this topic', `#/review?skill=${encodeURIComponent(id)}&count=5`) : null, h('button', { class: 'btn', type: 'button', onclick: () => openTutor(`Explain ${s.name} simply`) }, 'Ask Mrs Anne'))),
    h('h2', {}, 'Lessons that teach this'), ls.length ? h('ul', { class: 'plain' }, ls.map((l) => h('li', {}, h('a', { href: `#/lesson/${l.id}` }, l.title), h('span', { class: 'muted small' }, ` · ${l.minutes} min`)))) : h('p', { class: 'muted' }, 'No lesson covers this directly yet.'),
    terms.length ? [h('h2', {}, 'Words to know'), h('dl', { class: 'gloss' }, terms.flatMap((g) => [h('dt', {}, g.term), h('dd', {}, g.def)]))] : null));
}
