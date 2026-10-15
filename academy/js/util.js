// Small DOM + text helpers. Everything renders through textContent / createElement: no innerHTML anywhere.
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  append(el, kids);
  return el;
}
export function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}
export const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Inline markdown subset: **bold**, *italic*, `code`, [text](https://… | #/route). Safe by construction.
const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)\s]+\))/;
export function inline(s, parent = document.createDocumentFragment()) {
  s = String(s ?? '');
  let m;
  while ((m = INLINE.exec(s))) {
    if (m.index) parent.append(s.slice(0, m.index));
    const t = m[0];
    if (m[1]) parent.append(h('code', {}, t.slice(1, -1)));
    else if (m[2]) parent.append(inline(t.slice(2, -2), h('strong')));
    else if (m[3]) parent.append(inline(t.slice(1, -1), h('em')));
    else {
      const mm = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(t);
      const url = mm[2];
      if (/^(https:\/\/|#\/)/.test(url)) {
        const ext = url.startsWith('http');
        parent.append(h('a', { href: url, ...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }, mm[1], ext ? h('span', { class: 'sr-only' }, ' (opens in a new tab)') : null));
      } else parent.append(mm[1]);
    }
    s = s.slice(m.index + t.length);
  }
  if (s) parent.append(s);
  return parent;
}
// Multi-paragraph md (used by `current` entries): blank line = paragraph, lines starting "- " = bullets.
export function mdBlock(src) {
  const root = h('div', { class: 'md' });
  // fenced code blocks first, then paragraphs / bullets / numbered lists in the remaining text
  const parts = String(src || '').split(/^```[^\n]*\n([\s\S]*?)^```[ \t]*$/m);
  parts.forEach((part, idx) => {
    if (idx % 2 === 1) { root.append(h('pre', { class: 'codeblock', tabindex: '0' }, h('code', {}, part.replace(/\n$/, '')))); return; }
    for (const para of part.split(/\n{2,}/)) {
      const lines = para.split('\n').filter((l) => l.trim());
      if (!lines.length) continue;
      if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) root.append(h('ul', {}, lines.map((l) => h('li', {}, inline(l.replace(/^\s*[-•*]\s+/, ''))))));
      else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) root.append(h('ol', {}, lines.map((l) => h('li', {}, inline(l.replace(/^\s*\d+[.)]\s+/, ''))))));
      else if (/^#{1,3}\s/.test(lines[0])) root.append(h('h4', {}, inline(lines[0].replace(/^#+\s*/, ''))), ...(lines.length > 1 ? [h('p', {}, inline(lines.slice(1).join(' ')))] : []));
      else root.append(h('p', {}, inline(lines.join(' '))));
    }
  });
  return root;
}
export function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const shuffle = (arr, rnd = Math.random) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const pct = (x) => Math.round(x * 100);
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
export const plural = (n, w, pl = w + 's') => `${n} ${n === 1 ? w : pl}`;
export function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
let live;
export function announce(msg) { live ??= document.getElementById('live'); if (!live) return; live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 30); }
export function icon(name) {
  // tiny inline SVG icon set (decorative; aria-hidden)
  const P = {
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10', learn: 'M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-7a3 3 0 0 0-3 3', explore: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
    lab: 'M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3', build: 'M14 6l4 4M4 20l5-1 10-10-4-4L5 15z', tutor: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
    progress: 'M4 20V10M10 20V4M16 20v-8M22 20H2', library: 'M5 3h4v18H5zM11 3h4v18h-4zM17 5l3.5 1-4 15-3.5-1z', more: 'M5 12h.01M12 12h.01M19 12h.01', settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2l-2.3-.9-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.5c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z',
    check: 'M5 12.5l4.5 4.5L19 7.5', flame: 'M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 2.5 2 2.5C11 9 11 6 12 3z', send: 'M4 12l16-8-6 16-3-7z', theme: 'M12 3a9 9 0 1 0 0 18zM12 3v18', close: 'M6 6l12 12M18 6L6 18', arrow: 'M5 12h14M13 6l6 6-6 6',
  };
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', '22'); s.setAttribute('height', '22'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', P[name] || P.more); s.append(p);
  return s;
}
