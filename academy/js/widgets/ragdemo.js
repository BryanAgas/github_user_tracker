// ragdemo: real chunking + keyword / TF-IDF / BM25 / toy-semantic retrieval over a tiny built-in corpus.
export const meta = { name: 'ragdemo', title: 'Retrieval (RAG) lab', blurb: 'Chunk a small document set, retrieve with real TF-IDF/BM25, see the assembled prompt, and break it on purpose.', level: 2, skills: ['l2.rag'] };

function h(tag, a = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [n, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (n === 'class') e.className = v; else if (n === 'style') e.style.cssText = v; else if (n === 'text') e.textContent = v;
    else if (n.startsWith('on')) e.addEventListener(n.slice(2), v); else e.setAttribute(n, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

const CORPORA = {
  school: {
    label: 'School handbook',
    docs: [
      ['Uniform', 'Pupils wear a navy jumper and grey trousers or skirt. Black school shoes are required; trainers are only allowed on PE days. Name labels must be sewn or stuck into every item of clothing. The uniform shop is open on Tuesday afternoons.'],
      ['Term dates', 'Autumn term starts on 3 September and ends on 19 December. Half-term is the week of 27 October. Spring term runs from 6 January to 27 March. Summer term begins on 14 April and finishes on 17 July.'],
      ['Lunches', 'Hot lunches cost 2.50 pounds per day and must be ordered by 9am through the parent app. Packed lunches are welcome but must not contain nuts. Free school meals are available for eligible families; apply through the school office.'],
      ['Absence', 'If your child is ill, call the school office before 8:30am on the first day of absence. A written note is needed after three days. Medical appointments should be booked outside school hours where possible. Holidays during term time are not authorised.'],
      ['Homework', 'Homework is set on Mondays and due on Fridays. Year 3 pupils should spend about 20 minutes per night reading. Spelling practice is sent home each week. If homework is missed, children complete it at lunchtime club.'],
      ['Clubs', 'After-school clubs run from 3:30pm to 4:30pm. Choices include football on Wednesday, coding on Thursday and choir on Friday. Sign up in the parent app; places are limited to 20 pupils per club. Clubs cost 4 pounds per session.'],
    ],
    examples: [['What time must I call if my child is ill?', 'before 8:30am'], ['When does half-term start?', '27 October'], ['How much is a hot lunch?', '2.50 pounds']],
    vague: 'What is the deadline?',
  },
  product: {
    label: 'Lumo lamp support',
    docs: [
      ['Setup', 'To set up the Lumo lamp, plug it in and hold the power button for five seconds until the light pulses blue. Open the Lumo app, tap Add Device and follow the pairing steps. The lamp only works on 2.4 GHz wifi networks.'],
      ['Factory reset', 'To factory reset the lamp, hold the power button for fifteen seconds until it flashes red three times. This erases your wifi details and schedules. You will need to pair it again afterwards.'],
      ['Warranty', 'Lumo lamps include a two year limited warranty covering manufacturing defects. Damage from water or drops is not covered. To claim, email support with your order number and a photo of the fault.'],
      ['Returns', 'You can return an unused lamp within 30 days of delivery for a full refund. Refunds are issued to the original payment method within 5 business days of us receiving the item. Return postage is free in the UK.'],
      ['Brightness', 'The lamp has five brightness levels and a warm to cool colour range from 2700K to 6500K. Say dim the lamp to a connected voice assistant, or use the slider in the app. Night mode caps brightness at 10 percent.'],
      ['Safety', 'Use only the supplied power adapter. Do not cover the lamp while it is on, and keep it away from water. The lamp is rated for indoor use only and should not be used in bathrooms.'],
    ],
    examples: [['How long is the warranty?', 'two year'], ['How do I factory reset the lamp?', 'fifteen seconds'], ['What wifi does it need?', '2.4 GHz']],
    vague: 'How long does it take?',
  },
  handbook: {
    label: 'Company handbook',
    docs: [
      ['Annual leave', 'Full-time staff receive 25 days of paid annual leave plus public holidays. Leave requests should be submitted at least two weeks in advance through the HR portal. Up to five unused days can be carried over to the next year.'],
      ['Expenses', 'Submit expense claims within 30 days with receipts attached. Meals while travelling are reimbursed up to 40 pounds per day. Flights must be booked through the company travel portal. Alcohol is not reimbursed.'],
      ['Remote work', 'Staff may work remotely up to three days a week with manager approval. Core hours are 10am to 4pm, when everyone should be reachable. A home-office allowance of 300 pounds is available once every three years.'],
      ['Security', 'Use a password manager and enable two-factor authentication on every work account. Report lost laptops or suspected phishing emails to the security team within one hour. Never paste customer data into unapproved AI tools.'],
      ['Probation', 'New starters have a six month probation period with reviews at one, three and six months. Notice during probation is one week. After probation, notice is one month.'],
      ['Sick leave', 'If you are unwell, tell your manager before 9:30am. Sick pay is full pay for the first ten days each year. A doctor note is required after seven consecutive days.'],
    ],
    examples: [['How many days of annual leave do I get?', '25 days'], ['When must I report a lost laptop?', 'within one hour'], ['How long is the probation period?', 'six month']],
    vague: 'How many days do I get?',
  },
};

const STOP = new Set('a an the of to in on at is are was were be by for from and or with as it its this that these those do does did can i my you your we our what when how which who why where if not no will should must may per about'.split(' '));
function stem(w) {
  w = w.toLowerCase().replace(/'s$/, '');
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}
const words = (t) => (t.toLowerCase().match(/[a-z0-9][a-z0-9.:'-]*/g) || []).map((w) => w.replace(/[.:'-]+$/, ''));
const terms = (t) => words(t).flatMap((w) => (w.includes('-') ? [w, ...w.split('-')] : [w])).filter((w) => !STOP.has(w)).map(stem);

// Toy "semantic" lexicon: groups of words treated as one concept (a hand-made stand-in for learned embeddings).
const CONCEPTS = [
  'ill sick unwell absence absent poorly doctor', 'refund return reimburse repay money', 'cost price pay fee charge pound',
  'start begin open commence', 'end finish close', 'holiday leave vacation break half-term',
  'wifi network internet connect pair', 'reset restore wipe factory', 'warranty guarantee defect cover claim',
  'dim bright light lamp colour', 'remote home wfh', 'laptop computer device', 'security password phishing secure',
  'probation trial starter', 'lunch meal food eat', 'homework assignment task', 'club activity after-school',
  'uniform clothes wear dress shoes', 'deadline due submit within', 'long length duration period', 'call phone report tell',
].map((g) => g.split(' ').map(stem));
const conceptOf = {}; CONCEPTS.forEach((g, i) => g.forEach((w) => { conceptOf[w] = 'c' + i; }));

function chunkDocs(docs, size, overlap) {
  const out = [];
  docs.forEach(([title, text], d) => {
    const w = text.split(/\s+/), step = Math.max(1, size - overlap);
    for (let s = 0, n = 0; ; s += step, n++) {
      out.push({ doc: d, title, idx: n, text: w.slice(s, s + size).join(' '), start: s });
      if (s + size >= w.length) break;
    }
  });
  return out;
}

function buildIndex(chunks, method) {
  const toks = chunks.map((c) => method === 'semantic' ? semTokens(c.text) : terms(c.text));
  const df = new Map(); toks.forEach((t) => new Set(t).forEach((x) => df.set(x, (df.get(x) || 0) + 1)));
  const avg = toks.reduce((a, t) => a + t.length, 0) / Math.max(1, toks.length);
  return { toks, df, N: chunks.length, avg };
}
function semTokens(text) { // concepts (weight 1 each) + literal stems tagged so they count too
  const out = []; for (const t of terms(text)) { out.push('w:' + t); if (conceptOf[t]) out.push(conceptOf[t]); }
  return out;
}
const tf = (arr) => { const m = new Map(); arr.forEach((x) => m.set(x, (m.get(x) || 0) + 1)); return m; };

function retrieve(chunks, query, method) {
  const idx = buildIndex(chunks, method);
  const q = method === 'semantic' ? semTokens(query) : terms(query);
  const qset = [...new Set(q)];
  const idfTf = (t) => Math.log((idx.N + 1) / ((idx.df.get(t) || 0) + 1)) + 1;
  const scores = idx.toks.map((toks) => {
    const f = tf(toks);
    if (method === 'keyword') return qset.filter((t) => f.has(t)).length;
    if (method === 'bm25') {
      let s = 0; const k1 = 1.5, b = 0.75;
      for (const t of qset) { const n = idx.df.get(t) || 0; if (!f.has(t)) continue; const idf = Math.log(1 + (idx.N - n + 0.5) / (n + 0.5)); const x = f.get(t); s += idf * (x * (k1 + 1)) / (x + k1 * (1 - b + b * toks.length / idx.avg)); }
      return s;
    }
    // tfidf / semantic: cosine of tf-idf vectors
    const qf = tf(q); let dot = 0, nq = 0, nd = 0;
    for (const [t, c] of qf) { const w = (1 + Math.log(c)) * idfTf(t); nq += w * w; if (f.has(t)) dot += w * (1 + Math.log(f.get(t))) * idfTf(t); }
    for (const [t, c] of f) { const w = (1 + Math.log(c)) * idfTf(t); nd += w * w; }
    return nq && nd ? dot / Math.sqrt(nq * nd) : 0;
  });
  const ranked = chunks.map((c, i) => ({ ...c, score: scores[i], i })).sort((a, b) => b.score - a.score || a.i - b.i);
  return { ranked, idx, qTerms: new Set(terms(query)) };
}

function extractAnswer(top, qTerms, idx) {
  const idf = (t) => Math.log(1 + (idx.N - (idx.df.get(t) || 0) + 0.5) / ((idx.df.get(t) || 0) + 0.5));
  const cands = [];
  top.forEach((c, r) => c.text.split(/(?<=[.!?])\s+/).forEach((s) => {
    const ts = new Set(terms(s)); let sc = 0; for (const t of qTerms) if (ts.has(t)) sc += idf(t);
    cands.push({ s, sc, r });
  }));
  cands.sort((a, b) => b.sc - a.sc);
  return cands[0] && cands[0].sc > 0 ? cands[0] : null;
}

export function mount(el, props = {}, ctx = {}) {
  const st = { corpus: CORPORA[props.corpus] ? props.corpus : 'school', size: 40, overlap: 8, k: 2, method: 'bm25', q: '', gold: '', tiny: false, lowk: false, vague: false };
  const first = () => { const e = CORPORA[st.corpus].examples[0]; st.q = e[0]; st.gold = e[1]; };
  first();
  const root = h('div', { class: 'w-b-card w-rag' });
  const out = h('div', { class: 'w-rag-out' });
  const live = h('div', { class: 'w-b-sr', 'aria-live': 'polite' });
  const ctrl = h('div', { class: 'w-rag-ctrl' });
  const qIn = h('input', { type: 'text', class: 'w-b-input', id: 'rq' + Math.random().toString(36).slice(2, 6), value: st.q, 'aria-label': 'Your question', oninput: (e) => { st.q = e.target.value; st.gold = (CORPORA[st.corpus].examples.find((x) => x[0] === st.q) || [0, ''])[1]; render(); } });
  const chips = h('div', { class: 'w-b-row w-rag-chips' });

  const sliders = {};
  const mkRange = (key, label, min, max, step) => {
    const val = h('b', { text: String(st[key]) });
    const inp = h('input', { type: 'range', min, max, step, value: st[key], oninput: (e) => { st[key] = +e.target.value; val.textContent = effective()[key] + (effective()[key] !== st[key] ? ' (forced)' : ''); render(); } });
    sliders[key] = { inp, val };
    return h('label', { class: 'w-b-field' }, h('span', {}, label + ': ', val), inp);
  };
  const methodSel = h('select', { 'aria-label': 'Retrieval method', onchange: (e) => { st.method = e.target.value; render(); } },
    [['keyword', 'Keyword count (no weighting)'], ['tfidf', 'TF-IDF cosine'], ['bm25', 'BM25'], ['semantic', 'Toy "semantic" (concept groups)']].map(([v, l]) => h('option', { value: v, selected: v === st.method, text: l })));
  const corpusSel = h('select', { 'aria-label': 'Document set', onchange: (e) => { st.corpus = e.target.value; first(); qIn.value = st.q; renderChips(); render(); } },
    Object.entries(CORPORA).map(([k, c]) => h('option', { value: k, selected: k === st.corpus, text: c.label })));
  const toggle = (key, label) => h('label', { class: 'w-b-check' }, h('input', { type: 'checkbox', onchange: (e) => { st[key] = e.target.checked; ['size', 'overlap', 'k'].forEach((x) => { sliders[x].val.textContent = effective()[x] + (effective()[x] !== st[x] ? ' (forced)' : ''); }); render(); } }), label);

  ctrl.append(
    h('div', { class: 'w-b-grid w-rag-sliders' },
      h('label', { class: 'w-b-field' }, h('span', { text: 'Document set' }), corpusSel),
      h('label', { class: 'w-b-field' }, h('span', { text: 'Retrieval method' }), methodSel),
      mkRange('size', 'Chunk size (words)', 6, 80, 2), mkRange('overlap', 'Overlap (words)', 0, 20, 1), mkRange('k', 'Chunks sent to the model (top-k)', 1, 5, 1)),
    h('fieldset', { class: 'w-rag-break' }, h('legend', { text: 'Break it on purpose' }),
      toggle('tiny', 'Chunks too small (6 words, no overlap)'), toggle('lowk', 'k too low (only 1 chunk)'), toggle('vague', 'Ambiguous question (vague wording)')));
  const docsBox = h('details', { class: 'w-rag-docs' }, h('summary', { text: 'Read the source documents' }), h('div', { class: 'w-rag-doclist' }));

  root.append(
    h('h3', { class: 'w-b-title', text: 'Retrieval lab: find the right chunk' }),
    h('p', { class: 'w-b-try' }, h('b', { text: 'Try this: ' }), 'tick "Chunks too small" and watch the answer fall apart, then switch the method to see who ranks what.'),
    ctrl,
    h('div', { class: 'w-b-field w-rag-q' }, h('span', { text: 'Question' }), qIn, chips),
    out, docsBox, live,
    h('p', { class: 'w-b-note', text: 'Toy model: tiny corpus, simple stemming, a hand-made concept list standing in for real embeddings, and a template (not a language model) writing the answer. Keyword, TF-IDF and BM25 scoring are the real formulas.' }),
  );
  el.append(root);

  function renderChips() {
    chips.textContent = '';
    CORPORA[st.corpus].examples.forEach(([q, g]) => chips.append(h('button', { type: 'button', class: 'w-b-btn w-rag-chip', text: q, onclick: () => { st.q = q; st.gold = g; qIn.value = q; render(); } })));
    const dl = docsBox.querySelector('.w-rag-doclist'); dl.textContent = '';
    CORPORA[st.corpus].docs.forEach(([t, x]) => dl.append(h('p', {}, h('b', { text: t + ': ' }), x)));
  }
  function effective() { return { size: st.tiny ? 6 : st.size, overlap: st.tiny ? 0 : st.overlap, k: st.lowk ? 1 : st.k }; }

  function highlight(text, qTerms) {
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((p) => {
      const core = p.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
      if (core && qTerms.has(stem(core.toLowerCase())) && !STOP.has(core.toLowerCase())) frag.append(h('mark', { text: p })); else frag.append(p);
    });
    return frag;
  }

  function render() {
    const eff = effective(), C = CORPORA[st.corpus];
    const query = st.vague ? C.vague : st.q;
    const chunks = chunkDocs(C.docs, eff.size, Math.min(eff.overlap, eff.size - 1));
    const { ranked, idx, qTerms } = retrieve(chunks, query, st.method);
    const top = ranked.slice(0, eff.k).filter((c) => c.score > 0);
    const max = ranked[0] ? ranked[0].score || 1 : 1;
    out.textContent = '';
    if (st.vague) out.append(h('p', { class: 'w-rag-vague' }, h('b', { text: 'Ambiguous mode: ' }), `the system actually searches for "${query}" (which deadline? lunch order, homework, term dates...?).`));
    // ranked list
    const list = h('ol', { class: 'w-rag-chunks' });
    ranked.slice(0, Math.min(eff.k + 3, 8)).forEach((c, r) => {
      const sent = r < eff.k && c.score > 0;
      list.append(h('li', { class: 'w-rag-chunk' + (sent ? ' is-sent' : '') },
        h('div', { class: 'w-rag-chead' }, h('b', { text: `#${r + 1} ${c.title} (chunk ${c.idx + 1})` }),
          h('span', { class: 'w-b-pill ' + (sent ? 'good' : '') , text: sent ? 'sent to the model' : 'not sent' })),
        h('div', { class: 'w-rag-score' }, h('div', { class: 'w-b-meter', role: 'img', 'aria-label': `score ${c.score.toFixed(3)}` }, h('i', { style: `width:${Math.round((c.score / max) * 100)}%` })), h('span', { class: 'w-rag-sv', text: c.score.toFixed(3) })),
        h('div', { class: 'w-rag-ctext' }, highlight(c.text, qTerms))));
    });
    const prompt = `You are a helpful assistant. Answer ONLY from the context below.\nIf the answer is not there, say you don't know. Cite sources like [1].\n\nContext:\n` +
      (top.length ? top.map((c, i) => `[${i + 1}] (${c.title}) ${c.text}`).join('\n') : '(nothing relevant retrieved)') + `\n\nQuestion: ${query}`;
    const ptoks = Math.round(prompt.split(/\s+/).length * 1.3);
    const ans = extractAnswer(top, qTerms, idx);
    const answer = ans ? h('p', { class: 'w-rag-answer' }, `"${ans.s}" `, h('b', { text: `[${ans.r + 1}]` })) : h('p', { class: 'w-rag-answer w-rag-none' }, "I couldn't find that in the retrieved context. (An honest system says so instead of guessing.)");
    // diagnosis against the known gold answer phrase
    let diag = null, ok = null;
    if (st.gold && !st.vague && query === st.q) {
      const g = st.gold.toLowerCase(), has = (c) => c.text.toLowerCase().includes(g);
      const inTop = top.some(has);
      ok = !!(inTop && ans && ans.s.toLowerCase().includes(g));
      if (inTop && !ok) diag = `The right chunk was retrieved, but the sentence picked did not contain "${st.gold}". Chunks cut mid-sentence make extraction harder.`;
      else if (inTop) diag = `The retrieved context contains the key fact "${st.gold}".`;
      else {
        const pos = ranked.findIndex(has);
        diag = pos < 0 ? `Nothing was retrieved that holds "${st.gold}": your chunking has split the fact across two chunks (try a bigger chunk size or more overlap).`
          : `The chunk with "${st.gold}" ranked #${pos + 1}, outside the top ${eff.k}. Raise k, or try another retrieval method.`;
      }
    } else if (st.vague) diag = 'With a vague question, retrieval has little to latch on to, so it returns whatever shares a few common words. Good systems ask a clarifying question or rewrite the query first.';
    out.append(
      h('h4', { class: 'w-rag-h', text: `1. Retrieved chunks (${chunks.length} chunks in the index)` }), list,
      h('h4', { class: 'w-rag-h', text: `2. Prompt sent to the model (about ${ptoks} tokens, rough estimate)` }), h('pre', { class: 'w-b-mono w-b-panel w-rag-prompt', text: prompt }),
      h('h4', { class: 'w-rag-h', text: '3. Templated extractive answer (not a real model)' }), answer,
      ...(diag ? [h('p', { class: 'w-rag-diag ' + (ok === true ? 'is-ok' : 'is-bad') }, h('b', { text: ok === true ? 'Looks right. ' : 'Diagnosis. ' }), diag)] : []));
    live.textContent = `Retrieved ${top.length} chunk${top.length === 1 ? '' : 's'}: ${top.map((c) => c.title).join(', ') || 'none'}. ${ans ? 'Answer: ' + ans.s : 'No answer found.'} ${diag || ''}`;
    if (ctx.announce) ctx.announce(live.textContent);
  }
  renderChips(); render();
  return () => {};
}
