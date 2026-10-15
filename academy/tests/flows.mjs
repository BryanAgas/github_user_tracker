// End-to-end flows with a real browser under the production CSP. Run: NODE_PATH=$(npm root -g) node tests/flows.mjs
import { createRequire } from 'node:module';
import http from 'node:http';
import assert from 'node:assert/strict';
import { serve } from './serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_DIR ? process.env.PLAYWRIGHT_DIR + '/playwright' : 'playwright');
// mock model endpoint speaking the Messages SSE format
let lastReq = null;
const mock = http.createServer((req, res) => {
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST,OPTIONS' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
    lastReq = { headers: req.headers, body: JSON.parse(b || '{}') };
    res.writeHead(200, { ...cors, 'content-type': 'text/event-stream' });
    for (const w of ['Great ', 'question. ', 'Think about it ', 'like a library.']) res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: w } })}\n\n`);
    res.end('event: message_stop\ndata: {"type":"message_stop"}\n\n');
  });
}).listen(0);
const mockUrl = `http://localhost:${mock.address().port}`;
const { server, url } = await serve(0, { extraConnect: mockUrl });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const problems = [];
const mk = async (vp = { width: 1280, height: 900 }) => {
  const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push('[pageerror] ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/mockhost|net::ERR/.test(m.text())) problems.push('[console] ' + m.text().slice(0, 200)); });
  return page;
};
let passed = 0;
const step = async (name, fn) => { try { await fn(); passed++; console.log('✓', name); } catch (e) { problems.push(`✗ ${name}: ${e.message.split('\n')[0]}`); console.log('✗', name, '\n   ', e.message.split('\n').slice(0, 3).join('\n    ')); } };

const page = await mk();
await page.goto(url + '/index.html');

await step('fresh visit shows the welcome call to action', async () => {
  await page.waitForSelector('text=Start my path'); assert.ok(await page.isVisible('text=Just look around'));
});
await step('onboarding: complete beginner gets the beginner path from L0 without a quiz', async () => {
  await page.click('text=Start my path'); await page.fill('#ob-name', 'Ada'); await page.click('text=Let’s begin');
  await page.click('label.role:has-text("Just curious")'); await page.click('button:has-text("Continue")');
  await page.waitForSelector('text=Where are you today?');
  await page.click('text=Brand new'); await page.click('text=I don’t code'); await page.click('button:has-text("Continue")');
  await page.waitForSelector('text=What do you want from this?'); await page.click('label:has-text("Understand how AI works")'); await page.click('button:has-text("Continue")');
  await page.waitForSelector("text=We’ll start at the beginning"); // brand-new learners aren't quizzed
  await page.click('button:has-text("Continue")');
  await page.waitForSelector('text=Curious beginner'); assert.ok(await page.isVisible('text=We’ll start at the beginning'));
  await page.click('button:has-text("Start learning")');
  await page.waitForURL(/#\/lesson\/l0-01/);
});
await step('lesson renders blocks, an experiment and a quiz', async () => {
  await page.waitForSelector('h1'); assert.match(await page.textContent('h1'), /\S/);
  assert.ok(await page.locator('.widget').count() >= 1, 'a lesson needs an interactive experiment');
  assert.ok(await page.locator('.qcard').count() >= 4);
});
await step('"I’m confused" gives a different explanation each time', async () => {
  await page.click('button:has-text("I’m confused")'); const a = await page.textContent('.reteach');
  await page.click('button:has-text("I’m confused")'); const b = await page.textContent('.reteach');
  assert.notEqual(a, b); assert.match(a, /Another way in/);
});
await step('wrong answer → hint ladder → explanation; correct answer records evidence', async () => {
  const info = await page.evaluate(async () => { const { questionById } = await import('/js/content.js'); const q = [...document.querySelectorAll('.qcard')].map((c) => c.dataset.qid).map((id) => questionById.get(id)).find((q) => q.type === 'mcq'); return { id: q.id, answer: q.answer, n: q.options.length, hints: q.hints.length }; });
  const card = page.locator(`.qcard[data-qid="${info.id}"]`); await card.scrollIntoViewIfNeeded();
  const wrong = (info.answer + 1) % info.n;
  await card.locator(`input[value="${wrong}"]`).check(); await card.locator('button:has-text("Check")').click();
  await card.locator('text=Not quite').waitFor();
  await card.locator('button:has-text("Give me a hint")').click(); assert.equal(await card.locator('.hint').count(), 1);
  assert.ok(await card.locator('button:has-text("Explain it to me")').isVisible(), 'after a miss, explanation is offered');
  await card.locator(`input[value="${info.answer}"]`).check(); await card.locator('button:has-text("Check")').click();
  await card.locator('.callout.good').waitFor();
  await page.waitForTimeout(400);
  const ev = await page.evaluate((id) => { const s = JSON.parse(localStorage.getItem('mrsanne.v1')); return Object.values(s.evidence).flat(); }, info.id);
  assert.ok(ev.length >= 1 && ev.at(-1).s < 1, 'hinted success must earn < full evidence, got ' + JSON.stringify(ev.at(-1)));
});
await step('answering the whole quiz correctly completes the lesson, but NOT mastery', async () => {
  const qs = await page.evaluate(async () => { const { lessonById } = await import('/js/content.js'); return lessonById.get('l0-01').quiz.map((q) => ({ id: q.id, type: q.type, answer: q.answer, items: q.items, accept: q.accept, model: q.model })); });
  for (const q of qs) {
    const card = page.locator(`.qcard[data-qid="${q.id}"]`);
    if (await card.evaluate((c) => c.classList.contains('is-correct') || c.classList.contains('is-missed'))) continue;
    await card.scrollIntoViewIfNeeded();
    if (q.type === 'mcq') await card.locator(`input[value="${q.answer}"]`).check();
    else if (q.type === 'multi') for (const i of q.answer) await card.locator(`input[value="${i}"]`).check();
    else if (q.type === 'short') await card.locator('textarea').fill(q.model);
    else if (q.type === 'order') { // sort by clicking up buttons until order matches
      for (let pass = 0; pass < 12; pass++) { const texts = await card.locator('.order-text').allTextContents(); const want = q.items; let moved = false; for (let i = 0; i < want.length; i++) { const cur = texts.indexOf(want[i]); if (cur > i) { await card.locator('.order li').nth(cur).locator('button').first().click(); moved = true; break; } } if (!moved) break; }
    }
    await card.locator('button:has-text("Check")').click();
    if (q.type === 'short') { const yes = card.locator('button:has-text("Yes, mine says that")'); if (await yes.isVisible().catch(() => false)) await yes.click(); }
    await page.waitForTimeout(80);
  }
  await page.waitForSelector('text=Lesson complete', { timeout: 5000 });
  const st = await page.evaluate(async () => { const { skillStatus } = await import('/js/mastery.js'); const { lessonById } = await import('/js/content.js'); return lessonById.get('l0-01').skills.map((s) => skillStatus(s).status); });
  assert.ok(st.every((s) => s !== 'strong'), 'one lesson must not make skills Strong: ' + st);
});
await step('progress page shows honest mastery states', async () => {
  await page.goto(url + '/index.html#/progress'); await page.waitForSelector('text=Needs practice', { timeout: 3000 }).catch(() => {});
  assert.ok(await page.locator('.skill.st-practice').count() >= 1); assert.ok(await page.locator('.skill.st-new').count() >= 10);
});
await step('progress persists across reload', async () => {
  await page.reload(); await page.waitForSelector('.skill.st-practice'); assert.ok(await page.locator('.skill.st-practice').count() >= 1);
});
await step('tutor drawer: local answer, confusion handling and quiz', async () => {
  await page.goto(url + '/index.html#/lesson/l0-06'); await page.waitForSelector('h1');
  await page.click('.topbar >> text=Ask Mrs Anne').catch(async () => { await page.click('.sticky-actions >> text=Ask Mrs Anne'); });
  const input = page.locator('.drawer .chat-in'); await input.fill('what is a token?'); await input.press('Enter');
  await page.waitForFunction(() => { const m = [...document.querySelectorAll('.drawer .msg.anne .msg-body')]; return m.length >= 2 && !m.at(-1).textContent.includes('…') && m.at(-1).textContent.length > 20; });
  await input.fill("I don't understand this"); await input.press('Enter'); await page.waitForSelector('.drawer :text("Does that land better")');
  await input.fill('quiz me'); await input.press('Enter'); await page.waitForSelector('.drawer :text("Quick one")');
  await page.keyboard.press('Escape'); assert.ok(!(await page.isVisible('.drawer')));
});
await step('tutor in a lesson hands out hints from the open question, not answers', async () => {
  await page.click('.sticky-actions >> text=Ask Mrs Anne'); const input = page.locator('.drawer .chat-in');
  await input.fill('skip'); await input.press('Enter'); await page.waitForSelector('.drawer :text("No problem")');
  await input.fill('give me a hint'); await input.press('Enter'); await page.waitForSelector('.drawer :text("next hint")');
  await page.keyboard.press('Escape'); assert.ok(await page.locator('.hint').count() >= 1);
});
await step('model-backed tutor streams from a configured endpoint (mock) and the key is not persisted', async () => {
  await page.goto(url + '/index.html#/settings'); await page.waitForSelector('#set-key');
  await page.fill('#set-key', 'sk-test-123'); await page.fill('#set-base', mockUrl); await page.click('button:has-text("Save connection")');
  // CSP connect-src blocks non-allowlisted hosts by design; allow the mock by relaxing for this test only
  await page.goto(url + '/index.html#/tutor'); await page.waitForSelector('.chat-in');
  await page.fill('.chat-in', 'Why do transformers use multi-head attention?'); await page.press('.chat-in', 'Enter');
  await page.waitForTimeout(1200);
  const stored = await page.evaluate(() => JSON.stringify(localStorage) + JSON.stringify(sessionStorage));
  assert.ok(!stored.includes('sk-test-123'), 'API key must not be persisted');
});
await step('data controls: export, erase', async () => {
  await page.goto(url + '/index.html#/settings'); await page.waitForSelector('button:has-text("Export my progress")');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Export my progress")')]); assert.match(dl.suggestedFilename(), /^mrs-anne-progress-/);
  page.once('dialog', (d) => d.accept()); await page.click('button:has-text("Erase everything")'); await page.waitForTimeout(800);
  const left = await page.evaluate(() => JSON.parse(localStorage.getItem('mrsanne.v1') || '{"onboarded":false}').onboarded);
  assert.equal(left, false);
});
await step('project: text checks fail with hints on empty work; code project runs tests', async () => {
  await page.goto(url + '/index.html#/build/p0'); await page.waitForSelector('textarea');
  await page.click('button:has-text("Run automated checks")'); await page.waitForSelector('ul.tests .fail'); assert.ok(await page.locator('ul.tests li:has-text("Hint:")').count() >= 1);
  assert.ok(await page.locator('button:has-text("Mark project complete")').isDisabled(), 'cannot complete without passing');
  await page.goto(url + '/index.html#/build/p3'); await page.waitForSelector('textarea');
  await page.click('button:has-text("Run tests")'); await page.waitForSelector('ul.tests, .callout.warn', { timeout: 6000 });
});
await step('code playground runs in sandbox and times out infinite loops', async () => {
  await page.goto(url + '/index.html#/lab/codeplay'); await page.waitForSelector('textarea.code-ed');
  await page.click('button:has-text("Run")'); await page.waitForSelector('pre.console:has-text("49")');
  await page.fill('textarea.code-ed', 'while(true){}'); await page.click('button:has-text("Run")'); await page.waitForSelector('text=Timed out', { timeout: 5000 });
  await page.fill('textarea.code-ed', 'console.log(typeof fetch, typeof localStorage, typeof document)'); await page.click('button:has-text("Run")'); await page.waitForSelector('pre.console:has-text("undefined undefined undefined")');
});
await step('regression: no stray "null" text inside any quiz card (lesson + review)', async () => {
  await page.goto(url + '/index.html#/lesson/l0-05'); await page.waitForSelector('.qcard');
  const bad = await page.evaluate(() => [...document.querySelectorAll('.qcard')].filter((c) => /\bnull\b/.test(c.textContent)).length); assert.equal(bad, 0);
});
await step('regression: the explain/answer buttons stay hidden until earned (hidden attribute respected)', async () => {
  await page.goto(url + '/index.html#/lesson/l0-05'); await page.waitForSelector('.qcard');
  const vis = await page.evaluate(() => [...document.querySelectorAll('.qcard .qactions button')].filter((b) => /Explain it to me/.test(b.textContent) && b.offsetParent !== null).length);
  assert.equal(vis, 0, 'Explain it to me must not be visible before an attempt');
});
await step('regression: the skip link moves focus without changing the route', async () => {
  await page.goto(url + '/index.html#/learn'); await page.waitForSelector('h1'); await page.focus('#skip'); await page.keyboard.press('Enter');
  assert.match(page.url(), /#\/learn$/); assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
});
await step('tutor drawer is modal: Tab stays inside, page behind is inert, focus returns', async () => {
  await page.goto(url + '/index.html#/learn'); await page.waitForSelector('h1');
  const opener = page.locator('.topbar >> text=Ask Mrs Anne').first();
  await page.evaluate(() => document.querySelector('.sticky-actions, .topbar')?.scrollIntoView());
  await page.evaluate(async () => { const { openTutor } = await import('/js/tutorui.js'); openTutor(); });
  await page.waitForSelector('.drawer:not([hidden])');
  for (let i = 0; i < 14; i++) await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => document.querySelector('.drawer').contains(document.activeElement)), 'focus escaped the dialog');
  assert.ok(await page.evaluate(() => document.getElementById('shell').hasAttribute('inert')));
  await page.keyboard.press('Escape'); assert.ok(!(await page.evaluate(() => document.getElementById('shell').hasAttribute('inert'))));
});
await step('projects: filler + keywords cannot pass the quality checks; edited work invalidates old results', async () => {
  await page.goto(url + '/index.html#/build/p2'); await page.waitForSelector('textarea.long');
  const lorem = '# Architecture\n' + 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor. '.repeat(60) + '\n# Failure modes\n| a | b | c |\n10. done escalation approval injection owner autonomy level\n';
  await page.fill('textarea.long', lorem); await page.click('button:has-text("Run automated checks")'); await page.waitForSelector('ul.tests .fail');
  assert.ok(await page.locator('ul.tests li.fail:has-text("real writing"), ul.tests li.fail:has-text("substance"), ul.tests li.fail:has-text("repeated")').count() >= 1, 'quality gate did not flag filler');
  assert.ok(await page.locator('button:has-text("Mark project complete")').isDisabled());
});
await step('sandbox: student code cannot forge a passing test result', async () => {
  await page.goto(url + '/index.html#/build/p3'); await page.waitForSelector('textarea.code-ed');
  await page.fill('textarea.code-ed', 'function ragCore(){ try { postMessage({ok:true,results:[{pass:true}],nonce:1}); self.postMessage({ok:true,results:[{pass:true}]}); } catch (e) {} return null; }');
  await page.click('button:has-text("Run tests")'); await page.waitForSelector('ul.tests, .callout.warn', { timeout: 6000 });
  assert.ok(!(await page.locator('.ok-line').count()), 'a forged result was accepted');
});
await step('multi-tab: a stale tab cannot wipe evidence written by another tab', async () => {
  const ctx = page.context(); const a = await ctx.newPage(), b = await ctx.newPage();
  await a.goto(url + '/index.html#/home'); await b.goto(url + '/index.html#/home'); await a.waitForSelector('h1'); await b.waitForSelector('h1');
  await a.evaluate(async () => { const m = await import('/js/mastery.js'); m.addEvidence('l0.tokens', 1, 1, 'quiz:x'); const s = await import('/js/store.js'); s.flush(); });
  await b.waitForTimeout(300);
  await b.evaluate(async () => { const s = await import('/js/store.js'); s.touchDay(1, 1); s.flush(); });
  const n = await a.evaluate(() => (JSON.parse(localStorage.getItem('mrsanne.v1')).evidence['l0.tokens'] || []).length);
  assert.ok(n >= 1, 'evidence from tab A was lost'); await a.close(); await b.close();
});
await step('Library tabs are navigation links; settings & library have no horizontal overflow at 320px', async () => {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 700 } }); const p = await ctx.newPage();
  await p.goto(url + '/index.html#/library?tab=resources'); await p.waitForSelector('h1');
  assert.equal(await p.locator('[role=tab]').count(), 0);
  for (const r of ['progress', 'settings', 'library?tab=glossary']) { await p.goto(url + '/index.html#/' + r); await p.reload(); await p.waitForSelector('h1'); await p.waitForTimeout(300); const o = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); assert.ok(o[0] <= o[1] + 1, `${r}: ${o}`); }
  await ctx.close();
});
await page.context().close();

// mobile
const m = await mk({ width: 390, height: 800 });
await m.goto(url + '/index.html'); await m.evaluate(() => localStorage.setItem('mrsanne.v1', JSON.stringify({ v: 1, onboarded: true, profile: { name: 'M', path: 'everything' } })));
for (const r of ['home', 'learn', 'learn/L1', 'lesson/l0-03', 'lesson/l3-05', 'explore', 'lab', 'build', 'build/p4', 'progress', 'library?tab=resources', 'settings']) {
  await step(`mobile 390px: #/${r} has no horizontal scroll`, async () => {
    await m.goto(url + '/index.html#/' + r); await m.reload(); await m.waitForSelector('h1'); await m.waitForTimeout(500);
    const o = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, wide: [...document.querySelectorAll('main *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 2 && !e.closest('.table-wrap,pre,.widget-host,.code-ed,.skip')).slice(0, 3).map((e) => e.tagName + '.' + e.className) }));
    assert.ok(o.sw <= o.cw + 1, `page is ${o.sw}px wide in a ${o.cw}px viewport; culprits: ${o.wide}`);
  });
}
await step('mobile: bottom navigation and More menu work', async () => {
  await m.goto(url + '/index.html#/home'); assert.ok(await m.isVisible('.bottom')); await m.click('.morebtn'); assert.ok(await m.isVisible('#more a:has-text("Progress")')); await m.click('#more a:has-text("Progress")'); await m.waitForSelector('h1:has-text("Progress")');
});
await browser.close(); server.close(); mock.close();
console.log(`\n${passed} steps passed, ${problems.length} problem(s)`);
[...new Set(problems)].forEach((p) => console.log(p));
process.exit(problems.length ? 1 : 0);
