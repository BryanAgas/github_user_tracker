import { h, clear } from '../util.js';
import { WIDGET_NAMES, loadWidget, mountWidget } from '../widgets/index.js';
import { lessons, levels } from '../content.js';
import { page, levelChip, linkBtn, lvStyle } from './common.js';
import { addEvidence } from '../mastery.js';

export default async function lab({ id }, env) {
  if (id) return single(id, env);
  const metas = (await Promise.all(WIDGET_NAMES.map(async (n) => ({ n, m: (await loadWidget(n))?.meta })))).filter((x) => x.m);
  const level = h('select', { 'aria-label': 'Filter by level' }, h('option', { value: '' }, 'All levels'), levels.map((L) => h('option', { value: L.n }, `Level ${L.n}`)));
  const grid = h('div', { class: 'grid labs' });
  const draw = () => grid.replaceChildren(...metas.filter((x) => level.value === '' || x.m.level === +level.value).map(({ n, m }) => h('a', { class: 'card lab-card', href: `#/lab/${n}`, style: lvStyle(m.level ?? 0) }, levelChip(m.level ?? 0), h('strong', {}, m.title), h('span', { class: 'muted' }, m.blurb))));
  level.addEventListener('change', draw); draw();
  return page('Lab', h('p', { class: 'lede' }, 'Experiments you can touch. Change one thing, watch what happens, form a theory. That’s how understanding is built.'),
    h('div', { class: 'row' }, linkBtn('Open the code playground', '#/lab/codeplay'), h('label', { class: 'inline' }, 'Level ', level)), grid);
}
async function single(id, env) {
  const mod = WIDGET_NAMES.includes(id) ? await loadWidget(id) : null; // allow-list: never import() an arbitrary path
  if (!mod) return page('Experiment not found', linkBtn('Back to the Lab', '#/lab'));
  const m = mod.meta; const host = h('div', { class: 'widget-host big' });
  const related = lessons.filter((l) => l.blocks.some((b) => b.t === 'widget' && b.w === id)).slice(0, 5);
  const c = await mountWidget(host, id, id === 'codeplay' ? { title: 'Playground', starter: '// A safe JavaScript sandbox. Try something!\nfunction square(x) {\n  return x * x;\n}\nconsole.log(square(7));\n' } : {}, { evidence: (s, v, w) => addEvidence(s, v, w ?? 1, `widget:lab:${id}`), announce: (t) => {} });
  if (c) env.cleanups.push(c);
  return page(m.title, h('p', { class: 'lede' }, m.blurb), h('figure', { class: 'widget' }, h('div', { class: 'widget-tag' }, '🧪 Experiment'), host),
    related.length ? h('section', {}, h('h2', {}, 'Used in these lessons'), h('ul', { class: 'plain' }, related.map((l) => h('li', {}, h('a', { href: `#/lesson/${l.id}` }, l.title))))) : null,
    h('p', {}, h('a', { href: '#/lab' }, '← All experiments')));
}
