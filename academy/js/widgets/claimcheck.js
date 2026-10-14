// Claim check: flag the sentences you would verify, then reveal which were fabricated.
export const meta = { name: 'claimcheck', title: 'Spot the shaky claim', blurb: 'Fluent text can hide made-up facts: flag what you would check.', level: 0, skills: [] };

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

const DEMO = {
  title: 'An AI-written biography of a (fictional) scientist',
  segments: [
    { text: 'Dr Maren Ellsworth is a marine biologist who studies how coral reefs recover after storms. ', claim: false },
    { text: 'She earned her doctorate at the University of Exeter in 2009. ', claim: true, status: 'unverifiable', why: 'Plausible and specific, but with no source you cannot tell. This is exactly the kind of detail a model can invent.' },
    { text: 'Her 2014 paper in the journal Nature Reefs Quarterly showed that coral can regrow 40 percent faster in shaded water. ', claim: true, status: 'false', why: 'Fabricated: there is no such journal, and the very precise figure is a classic hallucination signature.' },
    { text: 'Coral reefs are made of tiny animals called polyps. ', claim: true, status: 'true', why: 'True general knowledge, easy to confirm in any encyclopaedia.' },
    { text: 'She was awarded the Blue Planet Medal by the Royal Society in 2017. ', claim: true, status: 'false', why: 'Fabricated: invented award with a real institution attached to make it sound credible.' },
    { text: 'Many researchers in this field work closely with local fishing communities. ', claim: false },
    { text: 'Water temperatures above roughly 30 degrees Celsius can cause coral bleaching. ', claim: true, status: 'true', why: 'Broadly true: sustained heat stress is a leading cause of bleaching. Still worth a quick check for exact thresholds.' },
  ],
};

export function mount(el, props = {}, ctx = {}) {
  const cfg = props.segments ? props : DEMO;
  const segs = cfg.segments.map((s, i) => ({ ...s, i, claim: s.claim != null ? s.claim : !!s.status, flag: false }));
  let revealed = false, reported = false;
  const para = h('p', { class: 'w-claimcheck-text' });
  const result = h('div', { class: 'w-claimcheck-result', hidden: true });
  const live = h('p', { class: 'wa-live', 'aria-live': 'polite' });
  const reveal = h('button', { type: 'button', class: 'wa-btn wa-btn-primary', onclick: doReveal }, 'Reveal');
  const LABEL = { true: ['✓', 'Checks out'], false: ['✗', 'Fabricated'], unverifiable: ['?', 'Can’t verify'] };
  const needs = (s) => s.claim && s.status !== 'true';

  function render() {
    para.replaceChildren();
    segs.forEach((s) => {
      if (!s.claim) { para.append(h('span', { class: 'w-claimcheck-plain' }, s.text)); return; }
      const lab = revealed && s.status ? LABEL[s.status] : null;
      para.append(h('button', { type: 'button', class: 'w-claimcheck-seg' + (s.flag ? ' is-flag' : '') + (lab ? ' st-' + s.status : ''), 'aria-pressed': String(s.flag), disabled: revealed ? true : null, onclick: () => { s.flag = !s.flag; render(); } },
        s.flag ? h('span', { class: 'w-claimcheck-flag' }, '⚑ I’d check this ') : null, s.text, lab ? h('span', { class: 'w-claimcheck-tag' }, ' [' + lab[0] + ' ' + lab[1] + (s.flag ? ', you flagged it' : ', not flagged') + ']') : null), ' ');
    });
    const n = segs.filter((s) => s.flag).length;
    reveal.disabled = revealed;
    live.textContent = revealed ? live.textContent : `${n} sentence${n === 1 ? '' : 's'} flagged.`;
  }
  function doReveal() {
    revealed = true;
    const flagged = segs.filter((s) => s.claim && s.flag), pos = segs.filter(needs), tp = flagged.filter(needs).length;
    const prec = flagged.length ? tp / flagged.length : 0, rec = pos.length ? tp / pos.length : 1, f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0;
    const missed = pos.filter((s) => !s.flag), wasted = flagged.filter((s) => !needs(s));
    result.hidden = false;
    result.replaceChildren(
      h('div', { class: 'wa-stats' }, h('div', { class: 'wa-stat' }, h('b', {}, Math.round(prec * 100) + '%'), h('span', {}, 'precision: of your flags, how many needed it')), h('div', { class: 'wa-stat' }, h('b', {}, Math.round(rec * 100) + '%'), h('span', {}, 'recall: of the shaky claims, how many you caught'))),
      h('p', {}, missed.length ? `You missed ${missed.length} shaky claim${missed.length > 1 ? 's' : ''}. ` : 'You caught every shaky claim. ', wasted.length ? `${wasted.length} of your flags were on claims that turned out fine (not wasted: checking is cheap, but you cannot verify everything).` : ''),
      h('ul', { class: 'w-claimcheck-notes' }, segs.filter((s) => s.claim && s.status).map((s) => h('li', { class: 'st-' + s.status }, h('b', {}, LABEL[s.status][0] + ' ' + LABEL[s.status][1] + ': '), '“' + s.text.trim().slice(0, 70) + (s.text.length > 70 ? '…' : '') + '” ', s.why || ''))));
    if (!reported && props.skill && ctx.evidence) ctx.evidence(props.skill, f1);
    reported = true; render();
    live.textContent = `Revealed. Precision ${Math.round(prec * 100)} percent, recall ${Math.round(rec * 100)} percent. ${missed.length} shaky claims missed.`;
    if (ctx.announce) ctx.announce(live.textContent);
  }
  const reset = () => { segs.forEach((s) => { s.flag = false; }); revealed = false; result.hidden = true; result.replaceChildren(); render(); };

  el.append(h('section', { class: 'wa w-claimcheck' },
    h('header', { class: 'wa-head' }, h('h3', {}, cfg.title || 'Spot the shaky claim'), h('p', {}, 'AI text sounds confident whether or not it is right. Tap each sentence you would verify before trusting.')),
    h('p', { class: 'wa-try' }, h('b', {}, 'Try this: '), 'be picky about specific names, numbers, dates and awards. Those are what models invent most.'),
    para,
    h('div', { class: 'wa-row' }, reveal, h('button', { type: 'button', class: 'wa-btn', onclick: reset }, 'Reset')),
    result, live,
    h('p', { class: 'wa-note' }, 'The passage is pre-written for this exercise, not real model output. Precision rewards flagging only what needs checking; recall rewards catching every problem.')));
  render();
}
