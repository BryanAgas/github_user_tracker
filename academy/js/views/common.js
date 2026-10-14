import { h, inline } from '../util.js';
import { levels } from '../content.js';
import { skillStatus } from '../mastery.js';

export const lvStyle = (n) => ({ '--lv': levels[n].hue });
export const levelChip = (n) => h('span', { class: 'chip lv', style: lvStyle(n) }, h('span', { 'aria-hidden': 'true' }, levels[n].glyph + ' '), `Level ${n}`);
export function statusPill(skillId) {
  const s = skillStatus(skillId);
  return h('span', { class: `pill st-${s.status}`, title: s.n ? `${Math.round(s.score * 100)}% from ${s.n} pieces of evidence` : 'No evidence yet' }, h('span', { 'aria-hidden': 'true' }, s.glyph + ' '), s.label);
}
export const skillChip = (sk) => h('a', { class: `skill st-${skillStatus(sk.id).status}`, href: `#/topic/${sk.id}` }, h('span', { 'aria-hidden': 'true' }, skillStatus(sk.id).glyph + ' '), sk.name, h('span', { class: 'sr-only' }, ' — ' + skillStatus(sk.id).label));
export function bar(frac, label) {
  const p = Math.round(Math.max(0, Math.min(1, frac)) * 100);
  return h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': p, 'aria-label': label }, h('span', { style: { width: p + '%' } }));
}
export const page = (title, ...kids) => h('div', { class: 'page' }, h('h1', { id: 'page-title', tabindex: '-1' }, title), ...kids);
export const empty = (msg, action) => h('div', { class: 'empty' }, h('p', {}, inline(msg)), action);
export const linkBtn = (label, href, cls = 'btn primary') => h('a', { class: cls, href }, label);
