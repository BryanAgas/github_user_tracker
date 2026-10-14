// Widget registry. Widgets are lazy-loaded ES modules (see docs/WIDGETS.md). Lesson blocks refer to them by name.
import { h } from '../util.js';
export const WIDGET_NAMES = ['tokenizer', 'nextword', 'contextwindow', 'attention', 'dotproduct', 'embeddings', 'neuron', 'nnplayground', 'gradient', 'sorter', 'claimcheck',
  'flow', 'ragdemo', 'agentloop', 'promptlab', 'streaming', 'costcalc', 'evalmatrix', 'jsonschema', 'rlgrid', 'timeline', 'codeplay'];
const cache = new Map();
export function loadWidget(name) {
  if (!cache.has(name)) cache.set(name, import(`./${name}.js`).catch((e) => { console.warn('widget failed', name, e); return null; }));
  return cache.get(name);
}
export async function mountWidget(host, name, props, ctx) {
  const mod = await loadWidget(name);
  if (!mod?.mount) { host.append(h('p', { class: 'muted' }, `The “${name}” experiment is unavailable right now.`)); return null; }
  try { return mod.mount(host, props || {}, ctx || {}) || null; }
  catch (e) { console.error(e); host.append(h('p', { class: 'muted' }, `The “${name}” experiment hit a problem: ${e.message}`)); return null; }
}
