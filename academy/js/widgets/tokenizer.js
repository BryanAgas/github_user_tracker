// Token visualiser: a TOY greedy sub-word tokenizer with byte fallback.
export const meta = { name: 'tokenizer', title: 'Token visualiser', blurb: 'Type anything and see how a model chops it into tokens.', level: 0, skills: ['l0.tokens'] };

const h = (t, a = {}, ...k) => {
  const e = document.createElement(t);
  for (const [n, v] of Object.entries(a)) {
    if (v == null || v === false) continue;
    if (n === 'class') e.className = v;
    else if (n === 'style') e.style.cssText = v;
    else if (n.startsWith('on')) e.addEventListener(n.slice(2), v);
    else e.setAttribute(n, v === true ? '' : v);
  }
  for (const c of k.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
};

const WORDS = ('the of and to in is it you that he was for on are with as I his they be at one have this from or had by not but what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part ' +
  'model token word text language learn learning machine computer data train system answer question example please hello world today good great new small large happy sad cat dog house book read write run walk talk think know want need help work play game music school friend family city country night morning sun sky blue red green water food very really just also here where why because after before over under again always never every any most such only own same tell show give take put keep let begin seem turn start might story AI chat prompt context window').split(/\s+/);
const PIECES = ('Un believ iz ization magic rare piece split sub ing ed er est ly tion ation ions s es un re in ion al ness able ment ous ity ize ise ful less pre dis over under anti de ex en em im ir il non mis out sub super tri uni inter trans th an on st ch sh qu ck ng nt nd ll ss ee oo ou ea ai ar or ur ir at it et ot ut ic ac op ap ig of ro ta to ke ve me ne na la le li lo ma mi mo no pe ra ri se si so te ti tu ve vi').split(/\s+/);
const PUNCT = ['.', ',', '!', '?', ';', ':', "'", '"', '-', '(', ')', '/', '%', '$', '@', '#', '&', '*', '+', '=', '_', '\n', '▁'];
const vocab = new Map();
const add = (s) => { if (!vocab.has(s)) vocab.set(s, vocab.size + 256); };
for (const w of WORDS) add('▁' + w);
for (const w of WORDS.slice(0, 40)) add('▁' + w[0].toUpperCase() + w.slice(1));
for (const w of WORDS.slice(0, 60)) add(w);
for (const p of PIECES) add(p);
for (const c of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') { add(c); add('▁' + c); }
for (const p of PUNCT) add(p);
for (const d of '0123456789') add(d);
const MAXLEN = Math.max(...[...vocab.keys()].map((k) => k.length));

function tokenize(text) {
  const out = [];
  const chunks = text.match(/ ?[\p{L}\p{M}]+| ?\p{N}| ?[^\s\p{L}\p{N}]|\n| /gu) || [];
  for (const raw of chunks) {
    const s = raw.replace(/^ /, '▁').replace(/^▁$/, '▁');
    let i = 0;
    const word = [];
    while (i < s.length) {
      let found = null;
      for (let l = Math.min(MAXLEN, s.length - i); l > 0; l--) {
        const sub = s.slice(i, i + l);
        if (vocab.has(sub)) { found = sub; break; }
      }
      if (found) { word.push({ t: found, id: vocab.get(found), kind: 'piece' }); i += found.length; }
      else {
        const cp = String.fromCodePoint(s.codePointAt(i));
        for (const b of new TextEncoder().encode(cp)) word.push({ t: '<0x' + b.toString(16).toUpperCase().padStart(2, '0') + '>', id: b, kind: 'byte', ch: cp });
        i += cp.length;
      }
    }
    out.push(word);
  }
  return out;
}

const PRESETS = [
  ['Everyday English', 'The cat sat on the mat and looked at the sun.'],
  ['A rare word', 'Pneumonoultramicroscopic tokenization is unbelievably uncommon.'],
  ['Numbers', 'Call 07700 900123 before 2026-10-14, price: $1234.56'],
  ['Other languages', 'Hello! こんにちは 你好 Привет'],
  ['Spaces & caps', 'hello  Hello  HELLO   hello'],
  ['Emoji', 'I love this 😀🚀 so much'],
];

export function mount(el, props = {}) {
  const start = props.text || 'Anne ordered pneumonoultramicroscopic tea for 12345 people. こんにちは';
  const ta = h('textarea', { class: 'wa-input', rows: '3', maxlength: '400', 'aria-label': 'Text to tokenise', spellcheck: 'false' });
  ta.value = start;
  const stats = h('div', { class: 'wa-stats' });
  const toks = h('div', { class: 'w-tokenizer-toks', role: 'list', 'aria-label': 'Tokens' });
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const ids = h('details', { class: 'wa-details' }, h('summary', {}, 'Token ids as a list'), h('code', { class: 'w-tokenizer-ids' }));
  const stat = (k, label) => { const v = h('b', {}, '0'); stats.append(h('div', { class: 'wa-stat' }, v, h('span', {}, label))); return v; };
  const sTok = stat('t', 'tokens'), sChr = stat('c', 'characters'), sWord = stat('w', 'words'), sRatio = stat('r', 'tokens per word');
  let timer;

  function render() {
    const text = ta.value;
    const words = tokenize(text);
    const flat = words.flat();
    const wc = (text.trim().match(/\S+/g) || []).length;
    sTok.textContent = flat.length; sChr.textContent = [...text].length; sWord.textContent = wc;
    sRatio.textContent = wc ? (flat.length / wc).toFixed(1) : '–';
    toks.replaceChildren();
    let n = 0;
    flat.forEach((t) => {
      const shown = t.t.replace(/▁/g, '·').replace(/\n/g, '↵');
      const title = t.kind === 'byte' ? `Byte fallback: one byte of “${t.ch}”` : (t.t.startsWith('▁') ? 'Starts with a space' : 'Piece inside or after a word');
      toks.append(h('span', { class: 'w-tokenizer-tok c' + (n++ % 5) + (t.kind === 'byte' ? ' is-byte' : ''), role: 'listitem', title },
        h('span', { class: 'w-tokenizer-t' }, shown), h('span', { class: 'w-tokenizer-id' }, String(t.id))));
    });
    el.querySelector('.w-tokenizer-ids').textContent = flat.map((t) => t.id).join(', ') || '(empty)';
    const longest = words.reduce((b, w) => (w.length > b.length ? w : b), []);
    const bytes = flat.filter((t) => t.kind === 'byte').length;
    clearTimeout(timer);
    timer = setTimeout(() => {
      live.textContent = flat.length ? `${flat.length} tokens for ${wc} words.` + (longest.length > 2 ? ` The most split piece took ${longest.length} tokens.` : '') + (bytes ? ` ${bytes} tokens are single bytes because the toy vocabulary has no piece for those characters.` : '') : 'Nothing to tokenise yet.';
    }, 350);
  }

  ta.addEventListener('input', render);
  const chips = h('div', { class: 'wa-chips', role: 'group', 'aria-label': 'Example texts' },
    PRESETS.map(([l, t]) => h('button', { type: 'button', class: 'wa-btn wa-btn-small', onclick: () => { ta.value = t; render(); ta.focus(); } }, l)));

  el.append(h('section', { class: 'wa w-tokenizer' },
    h('header', { class: 'wa-head' }, h('h3', {}, 'Token visualiser'), h('p', {}, 'Models do not read letters or words. They read tokens: numbered pieces of text.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'compare "hello", "Hello" and " hello", then paste a number or a word in another language.'),
    h('label', { class: 'wa-field' }, h('span', {}, 'Your text'), ta),
    chips, stats,
    h('div', { class: 'wa-out' }, toks),
    h('p', { class: 'wa-legend' }, h('span', { class: 'w-tokenizer-tok c0' }, h('span', { class: 'w-tokenizer-t' }, '·the'), h('span', { class: 'w-tokenizer-id' }, 'id')), ' · means a leading space is part of the token. Dashed tokens are raw bytes (the fallback for anything the vocabulary lacks).'),
    ids, live,
    h('p', { class: 'wa-note' }, 'Toy model: this tokeniser has only ~' + vocab.size + ' pieces and a simple greedy longest-match rule. Real tokenisers learn ~100,000 pieces from data, so their exact splits and ids differ.')));
  render();
  return () => clearTimeout(timer);
}
