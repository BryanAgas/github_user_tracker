// Mrs Anne, the tutor. Two brains:
//  1. Local (always works, offline): reteach in different styles, hint ladders, Socratic quizzing, course search, recommendations.
//  2. Model-backed (optional, bring-your-own key): open-ended Q&A with the lesson as context. The key is never stored on disk.
import { lessons, lessonById, glossary, skillById, questionById } from './content.js';
import { state, apiKey } from './store.js';
import { weakSkills, skillStatus, pickQuestions, addEvidence, levelProgress } from './mastery.js';
import { nextUp, PATHS } from './paths.js';

const STOP = new Set('the a an and or but if then of to in on for with as is are was were be been it its this that these those at by from not no do does did how what why when which who can could would should i you we they he she my your our their me about into than so just also very more most some any'.split(' '));
const toks = (s) => (String(s).toLowerCase().match(/[a-z][a-z0-9'-]{2,}/g) || []).filter((w) => !STOP.has(w)).map((w) => w.replace(/(ing|ed|es|s)$/, (m, a, off, str) => (str.length - m.length >= 4 ? '' : m)));

let index;
function buildIndex() {
  const docs = [];
  const text = (b) => b.t === 'p' || b.t === 'callout' ? b.md : b.t === 'list' ? b.items.join(' ') : b.t === 'steps' ? b.items.map((s) => s.title + '. ' + s.md).join(' ') : b.t === 'reveal' ? b.md : '';
  for (const L of lessons) {
    L.blocks.forEach((b) => { const t = text(b); if (t.length > 30) docs.push({ lesson: L, text: t, kind: 'lesson' }); });
    docs.push({ lesson: L, text: `${L.title}. ${L.hook}. ${(L.takeaways || []).join(' ')}`, kind: 'lesson' });
  }
  for (const g of glossary) docs.push({ text: `${g.term}: ${g.def}`, kind: 'gloss', term: g.term });
  const df = new Map();
  docs.forEach((d) => { d.tf = new Map(); toks(d.text).forEach((w) => d.tf.set(w, (d.tf.get(w) || 0) + 1)); d.tf.forEach((_, w) => df.set(w, (df.get(w) || 0) + 1)); d.len = Math.max(1, [...d.tf.values()].reduce((a, b) => a + b, 0)); });
  index = { docs, df, N: docs.length };
}
export function search(q, limit = 3) {
  if (!index) buildIndex();
  const qt = [...new Set(toks(q))]; if (!qt.length) return [];
  const out = index.docs.map((d) => {
    let s = 0; for (const w of qt) { const f = d.tf.get(w); if (f) s += (f / Math.sqrt(d.len)) * Math.log(1 + index.N / index.df.get(w)); }
    return { d, s: s / Math.sqrt(qt.length) };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  return out.slice(0, limit);
}

const I = {
  confused: /(confus|don'?t (get|understand|follow)|do not (get|understand)|\blost\b|makes? no sense|too (hard|difficult|technical)|explain (it |that |this )?(again|differently|another way|simpler|more simply)|simpl(er|ify)|\beli5\b|plain (english|words)|another way)/i,
  technical: /(more technical|go deeper|under the hood|in more detail|the maths?\b|how does it really)/i,
  example: /(\bexample|analogy|show me how|illustrate|real[- ]world)/i,
  hint: /(\bhint\b|i'?m stuck|stuck on|help me with (this|the) (question|exercise|task))/i,
  answerNow: /(just (tell|give) me|give me the answer|show (me )?the (answer|solution)|what'?s the answer)/i,
  quiz: /(quiz me|test me|ask me a question|practi[cs]e|check my understanding|question me)/i,
  next: /(what (should|do) i (do|learn|study|try)( next)?|what'?s next|recommend|next step|where (do|should) i (start|go)|what now)/i,
  progress: /(how am i doing|my progress|weak(ness)?|struggl|strong(est)? areas|revise|revision)/i,
  define: /^(?:what(?:'s| is| are)|define|meaning of|explain|tell me about)\s+(?:an?\s+|the\s+)?(.{2,60}?)\??$/i,
  greet: /^(hi|hello|hey|good (morning|afternoon|evening))\b/i,
  thanks: /\b(thanks|thank you|cheers)\b/i,
};

export class Tutor {
  constructor() { this.history = []; this.reteach = {}; this.pending = null; }

  get modelReady() { return !!apiKey.get(); }

  /** ctx: { lessonId?, hintCurrent?: () => 'shown'|'none'|'done' } */
  async respond(text, ctx = {}, onDelta) {
    text = text.trim();
    this.history.push({ role: 'user', content: text });
    let out;
    const local = this.local(text, ctx);
    // Structured local intents always win (they drive the app: hints, quizzes). Open questions go to the model when connected.
    if (local.structured || !this.modelReady) out = local;
    else {
      try { out = { md: await askModel(this.history.slice(-12), systemPrompt(ctx), onDelta), actions: local.actions || [], source: 'model' }; }
      catch (e) { out = { ...local, md: `${local.md}\n\n(I couldn’t reach the model: ${e.message}. Answering from the course material instead.)` }; }
    }
    this.history.push({ role: 'assistant', content: out.md });
    return out;
  }

  local(text, ctx) {
    const L = ctx.lessonId ? lessonById.get(ctx.lessonId) : null;
    // pending Socratic quiz question gets first claim on the next message
    if (this.pending && (this.pending.lessonId || null) !== (ctx.lessonId || null)) this.pending = null; // don't carry a question across lessons
    if (this.pending) { const r = this.gradePending(text); if (r) return r; }
    if (I.greet.test(text)) return { md: `Hello${state.profile.name ? ', ' + state.profile.name : ''}. I’m Mrs Anne. Ask me about anything in the course, tell me you’re confused (I’ll explain it another way), or say “quiz me”.`, structured: true, chips: this.chips(L) };
    if (I.thanks.test(text) && text.length < 40) return { md: 'You’re very welcome. What would you like to tackle next?', structured: true, chips: this.chips(L) };
    if (I.answerNow.test(text)) return this.answerNow(ctx);
    if (I.hint.test(text)) return this.hint(ctx);
    if (I.confused.test(text)) return this.reteachNow(L, text);
    if (I.technical.test(text)) return this.deeper(L);
    if (I.quiz.test(text)) return this.quizMe(L);
    if (I.next.test(text)) return this.recommend();
    if (I.progress.test(text)) return this.progress();
    if (I.example.test(text) && L) { const r = this.example(L); if (r) return r; }
    const d = text.match(I.define);
    if (d) { const g = this.glossaryFor(d[1]); if (g) return g; }
    return this.answerFromCourse(text, L);
  }

  chips(L) { return L ? ['I’m confused', 'Give me an example', 'Quiz me', 'Go deeper'] : ['What should I do next?', 'How am I doing?', 'Quiz me']; }

  reteachNow(L, text) {
    if (!L) return { md: 'Happy to. Which lesson or idea? Open a lesson and ask me there, or name the idea (for example “tokens”) and I’ll explain it from scratch.', structured: true };
    const opts = L.reteach || [];
    if (!opts.length) return { md: 'Let me say it more simply: ' + L.hook + ' Try the interactive experiment again, changing one thing at a time.', structured: true };
    let order = opts.map((_, i) => i);
    if (/simpl|eli5|plain/i.test(text)) order.sort((a, b) => rank(opts[a].style, ['simple', 'analogy', 'step-by-step', 'technical']) - rank(opts[b].style, ['simple', 'analogy', 'step-by-step', 'technical']));
    const n = (this.reteach[L.id] = (this.reteach[L.id] ?? -1) + 1);
    const r = opts[order[n % order.length]];
    const intro = { analogy: 'Let’s try an analogy.', simple: 'Here it is in the plainest words I can manage.', 'step-by-step': 'Let’s go one step at a time.', technical: 'Here’s the more precise version.' }[r.style];
    return { md: `${intro}\n\n${r.md}\n\nDoes that land better? If not, say so and I’ll come at it from yet another angle.`, structured: true, chips: ['Still confused', 'That helps — quiz me', 'Go deeper'] };
  }
  deeper(L) {
    const t = L?.reteach?.find((r) => r.style === 'technical');
    if (t) return { md: `Here is the more precise version.\n\n${t.md}`, structured: true, chips: ['Quiz me', 'I’m confused'] };
    const nxt = L && lessons.find((l) => l.level > L.level && l.skills.some((s) => L.skills.includes(s)));
    return { md: L ? 'The lesson covers this at the depth for this level. For more depth, look at the Library glossary entries and the next level’s lessons.' : 'Tell me which idea you’d like to go deeper on.', structured: true, actions: nxt ? [{ label: `Deeper: ${nxt.title}`, href: `#/lesson/${nxt.id}` }] : [{ label: 'Open the Library', href: '#/library' }] };
  }
  example(L) {
    const a = L.blocks.find((b) => b.t === 'callout' && b.kind === 'analogy') || null;
    const r = L.reteach?.find((x) => x.style === 'analogy');
    if (r) return { md: `Here’s a concrete way to see it.\n\n${r.md}`, structured: true, chips: ['Another one', 'Quiz me'] };
    if (a) return { md: a.md, structured: true };
    return null;
  }
  hint(ctx) {
    const r = ctx.hintCurrent?.();
    if (r === 'shown') return { md: 'I’ve put the next hint under the question. Try again with it, and tell me what you think the first step is.', structured: true };
    if (r === 'done') return { md: 'That’s every hint I have for this one. Explain your thinking to me in a sentence and I’ll tell you where it goes off track — or press “Explain it to me” under the question.', structured: true };
    return { md: 'Open an exercise or quiz question and ask me again — I’ll walk you through hints from gentle nudge to strong, before any solution.', structured: true };
  }
  answerNow(ctx) {
    const r = ctx.hintCurrent?.();
    return { md: `I’d rather you got there yourself — that’s what sticks. ${r === 'shown' ? 'I’ve revealed a first hint.' : 'Ask for a hint and I’ll give a gentle nudge first, then a stronger one.'} When the hints run out, “Explain it to me” under the question walks through the full solution.`, structured: true };
  }
  quizMe(L) {
    const skills = L ? L.skills : weakSkills(4).map((w) => w.skill.id);
    const qs = pickQuestions({ skills: skills.length ? skills : undefined, count: 6 }).filter((q) => q.type === 'mcq' || q.type === 'short');
    const q = qs[0];
    if (!q) return { md: 'Let’s do a proper review session.', structured: true, actions: [{ label: 'Start a review', href: '#/review' }] };
    this.pending = { q, tries: 0, lessonId: L?.id || null };
    const opts = q.type === 'mcq' ? '\n\n' + q.options.map((o, i) => `**${'ABCDE'[i]}.** ${o}`).join('\n\n') : '';
    return { md: `Quick one.${q.code ? '' : ''}\n\n${q.q}${opts}\n\n${q.type === 'mcq' ? 'Reply with a letter — or say “hint”.' : 'Answer in a sentence or two — or say “hint”.'}`, structured: true, code: q.code };
  }
  gradePending(text) {
    const p = this.pending; const q = p.q;
    if (I.hint.test(text)) { const hs = q.hints || []; const h = hs[Math.min(p.tries, hs.length - 1)]; p.tries++; return { md: h ? `Hint: ${h}` : 'Think about what the question is really asking.', structured: true }; }
    if (/^(skip|stop|cancel|never ?mind|no)\b/i.test(text)) { this.pending = null; return { md: 'No problem. We can come back to it.', structured: true }; }
    let ok = null;
    if (q.type === 'mcq') {
      const m = text.trim().match(/^\(?([a-e])\)?[.)\s]*$/i) || text.match(/\b(?:answer is|i think|going with|pick)\s+\(?([a-e])\b/i);
      const idx = m ? 'abcde'.indexOf(m[1].toLowerCase()) : q.options.findIndex((o) => o.toLowerCase() === text.trim().toLowerCase());
      if (idx < 0 || idx >= q.options.length) return null;
      ok = idx === q.answer;
      if (!ok) { p.tries++; if (p.tries < 2) return { md: `Not quite${q.wrong?.[idx] ? ' — ' + q.wrong[idx] : ''}. Have another go, or say “hint”.`, structured: true }; }
    } else {
      ok = q.accept.some((r) => new RegExp(r, 'i').test(text));
      if (!ok) { p.tries++; if (p.tries < 2) return { md: 'I can’t quite see that in your answer. Say more about *why* — or say “hint”.', structured: true }; }
    }
    this.pending = null;
    addEvidence(q.skill, ok ? Math.max(0.4, 1 - 0.25 * p.tries) : 0, 0.7, `tutor:${q.id}`);
    return { md: `${ok ? 'Yes!' : 'Let me show you.'} ${q.explain}\n\n${q.type === 'short' && !ok ? 'Model answer: ' + q.model + '\n\n' : ''}Another?`, structured: true, chips: ['Quiz me', 'Explain differently', 'What next?'] };
  }
  recommend() {
    const n = nextUp(); const w = weakSkills(3);
    const lines = [];
    const actions = [];
    if (n.kind === 'lesson') { lines.push(`Your next step on the **${PATHS[state.profile.path]?.label || 'your'}** path is **${n.lesson.title}** (about ${n.lesson.minutes} minutes).`); actions.push({ label: 'Open the lesson', href: `#/lesson/${n.lesson.id}` }); }
    else if (n.kind === 'project') { lines.push(`You’ve finished the lessons on your path. Time to build: **${n.project.title}**.`); actions.push({ label: 'Open the project', href: `#/build/${n.project.id}` }); }
    else lines.push('You’ve completed everything on your path — brilliant. Explore another level or pick a harder project.');
    if (w.length) { lines.push(`Worth revising first: ${w.map((x) => '**' + x.skill.name + '**').join(', ')}.`); actions.push({ label: 'Review weak spots', href: '#/review' }); }
    return { md: lines.join('\n\n'), structured: true, actions };
  }
  progress() {
    const strong = [...skillById.values()].filter((s) => skillStatus(s.id).status === 'strong');
    const w = weakSkills(5);
    const started = [...skillById.values()].filter((s) => skillStatus(s.id).status !== 'new').length;
    const parts = [`You have evidence of ${started} skills so far; ${strong.length} ${strong.length === 1 ? 'is' : 'are'} strong.`];
    if (strong.length) parts.push('Strong: ' + strong.slice(0, 5).map((s) => s.name).join(', ') + '.');
    if (w.length) parts.push('Needs practice: ' + w.map((x) => `${x.skill.name} (${Math.round(x.st.score * 100)}%${x.st.stale ? ', review due' : ''})`).join(', ') + '.');
    else parts.push('Nothing flagged as weak right now.');
    return { md: parts.join('\n\n'), structured: true, actions: [{ label: 'See my progress', href: '#/progress' }, ...(w.length ? [{ label: 'Practise weak spots', href: '#/review' }] : [])] };
  }
  glossaryFor(term) {
    const t = term.toLowerCase().replace(/[?.!]$/, '').trim();
    const g = glossary.find((x) => x.term.toLowerCase() === t) || glossary.find((x) => x.term.toLowerCase() === t.replace(/s$/, '')) || glossary.find((x) => x.term.toLowerCase().includes(t) && t.length > 3);
    if (!g) return null;
    const rel = lessons.filter((l) => toks(l.title + ' ' + l.takeaways.join(' ')).includes(toks(g.term)[0])).slice(0, 2);
    return { md: `**${g.term}** — ${g.def}${g.see?.length ? `\n\nRelated: ${g.see.join(', ')}.` : ''}`, structured: false, actions: rel.map((l) => ({ label: `Lesson: ${l.title}`, href: `#/lesson/${l.id}` })), chips: ['Give me an example', 'Quiz me'] };
  }
  answerFromCourse(text, L) {
    const hits = search(text, 6).filter((h) => h.s > 0.35);
    // prefer current lesson when relevant
    hits.sort((a, b) => (b.s + (L && b.d.lesson === L ? 0.4 : 0)) - (a.s + (L && a.d.lesson === L ? 0.4 : 0)));
    const top = hits[0];
    if (!top) return { md: `I can’t find that in the course material${this.modelReady ? '' : ', and I’m running without a model connected, so I can’t answer open questions yet'}. Try rephrasing with the key term, check the Library glossary, or connect a model in Settings for open-ended help.`, actions: [{ label: 'Search the Library', href: '#/library' }, { label: 'Settings', href: '#/settings' }], chips: this.chips(L) };
    const d = top.d;
    const where = d.kind === 'gloss' ? { label: 'Library glossary', href: '#/library' } : { label: `Read: ${d.lesson.title}`, href: `#/lesson/${d.lesson.id}` };
    const second = hits.find((h) => h.d !== d && h.d.kind === 'lesson' && h.d.lesson !== d.lesson);
    return { md: `${d.kind === 'gloss' ? '' : 'From the course: '}${d.text}${d.kind === 'lesson' ? '' : ''}`, actions: [where, ...(second ? [{ label: `Also: ${second.d.lesson.title}`, href: `#/lesson/${second.d.lesson.id}` }] : [])], chips: ['I’m confused', 'Give me an example', 'Quiz me'], note: 'local' };
  }
}
const rank = (s, order) => { const i = order.indexOf(s); return i < 0 ? 9 : i; };

// ── Model-backed brain ───────────────────────────────────────────────────────
export function systemPrompt(ctx = {}) {
  const L = ctx.lessonId ? lessonById.get(ctx.lessonId) : null;
  const weak = weakSkills(4).map((w) => w.skill.name);
  const p = state.profile;
  return [
    'You are Mrs Anne, a warm, sharp, plain-spoken headteacher and AI tutor inside a web course that takes people from AI beginner to AI builder.',
    'Teach; don’t just tell. Use plain language before jargon. Prefer a short explanation, then one concrete example, then a question that checks understanding.',
    'For exercises, quizzes and projects: give a hint first, then a stronger hint, then an explanation; reveal a full solution only if the student has tried and asks again. Never do their graded work for them.',
    'If the student is confused, explain the same idea a different way (analogy, simpler words, step by step) rather than repeating yourself. If they seem advanced, challenge them with a harder follow-up.',
    'Be accurate. Separate established concepts from fast-changing tools; if you are unsure, say so. Keep replies under about 180 words unless asked for more. British spelling.',
    `Student: role=${p.role}, AI experience ${p.aiRating}/5, coding=${p.coding}, path=${p.path}.${weak.length ? ' Currently weaker on: ' + weak.join(', ') + '.' : ''}`,
    L ? `They are on the lesson “${L.title}” (level ${L.level}). Lesson key points: ${L.takeaways.join(' | ')}. Hook: ${L.hook}` : 'They are browsing the app, not inside a lesson.',
  ].join('\n');
}

export async function askModel(messages, system, onDelta) {
  const base = (state.settings.baseUrl || 'https://api.anthropic.com').replace(/\/$/, '');
  const res = await fetch(`${base}/v1/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey.get(), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: state.settings.model || 'claude-sonnet-5-5', max_tokens: 700, system, stream: true, messages }),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.error?.message || msg; } catch { /* ignore */ }
    throw new Error(res.status === 401 ? 'the API key was rejected' : msg);
  }
  const reader = res.body.getReader(); const dec = new TextDecoder();
  let buf = '', full = '';
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
      const line = chunk.split('\n').find((l) => l.startsWith('data:')); if (!line) continue;
      let ev; try { ev = JSON.parse(line.slice(5)); } catch { continue; }
      if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') { full += ev.delta.text; onDelta?.(full); }
      else if (ev.type === 'error') throw new Error(ev.error?.message || 'stream error');
    }
  }
  if (!full) throw new Error('empty response');
  return full;
}

// One-shot helper for project review.
export async function reviewWithModel(prompt, system) { return askModel([{ role: 'user', content: prompt }], system); }
export const shared = new Tutor();
