// Onboarding placement for realistic personas. Run: NODE_PATH=$(npm root -g) node tests/placement.mjs
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { serve } from './serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_DIR ? process.env.PLAYWRIGHT_DIR + '/playwright' : 'playwright');
const { server, url } = await serve();
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const RATING = ['Brand new', 'Casual user', 'Regular user', 'Power user / builder', 'Practitioner'];
const CODING = ['I don’t code', 'A little', 'Comfortable in at least one language', 'Professional developer'];
const ROLE = { business: 'Business professional', developer: 'Developer', engineer: 'AI engineer', nontech: 'Non-technical professional' };
let fails = 0;
async function persona(name, { role, rating, coding, knows, expectStart, expectAsked, expectNoZeroEvidence = true }) {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  try {
    await p.goto(url + '/index.html#/onboarding'); await p.waitForSelector('text=Let’s begin'); await p.click('text=Let’s begin');
    await p.click(`label.role:has-text("${ROLE[role]}")`); await p.click('button:has-text("Continue")');
    await p.click(`label:has-text("${RATING[rating]}")`); await p.click(`label:has-text("${CODING[coding]}")`); await p.click('button:has-text("Continue")');
    await p.click('button:has-text("Continue")');
    const asked = [];
    for (let i = 0; i < 20; i++) {
      const found = await Promise.race([p.waitForSelector('#cal-q', { timeout: 4000 }).then(() => 'q').catch(() => null), p.waitForSelector('text=Here’s your path', { timeout: 4000 }).then(() => 'r').catch(() => null), p.waitForSelector('text=We’ll start at the beginning', { timeout: 4000 }).then(() => 'b').catch(() => null)]);
      if (found !== 'q') break;
      const info = await p.evaluate(async () => { const { questionById } = await import('/js/content.js'); const q = questionById.get(document.querySelector('#cal-q').dataset.qid); return { id: q.id, level: q.level, answer: q.answer, n: q.options.length }; });
      asked.push(info.level);
      const pick = info.level <= knows ? info.answer : (info.answer + 1) % info.n;
      await p.locator(`input[name=cal][value="${pick}"]`).check(); await p.click('button:has-text("Answer")'); await p.waitForTimeout(150);
    }
    if (await p.locator('text=We’ll start at the beginning').count() && asked.length === 0 && (await p.locator('button:has-text("Continue")').count())) await p.click('button:has-text("Continue")');
    await p.waitForSelector('text=Here’s your path', { timeout: 5000 });
    const text = await p.textContent('.card.feature');
    const lvl = (text.match(/start at (?:Level )?(\d)/) || [])[1];
    const start = lvl ? +lvl : 0;
    await p.click('button:has-text("Start learning")'); await p.waitForTimeout(400);
    const ev = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('mrsanne.v1') || '{}'); return Object.values(s.evidence || {}).flat(); });
    assert.deepEqual([...new Set(asked)], expectAsked, `${name}: asked levels ${[...new Set(asked)]} (expected ${expectAsked})`);
    assert.equal(start, expectStart, `${name}: start level ${start} (expected ${expectStart}); card: ${text.slice(0, 160)}`);
    if (expectNoZeroEvidence) assert.ok(ev.every((e) => e.s > 0), `${name}: a missed placement question was stored as 0% evidence`);
    assert.equal(errs.length, 0, errs.join('; '));
    console.log('✓', name, `→ asked levels [${[...new Set(asked)]}], start L${start}, ${ev.length} evidence rows`);
  } catch (e) { fails++; console.log('✗', name, '\n   ', e.message.split('\n')[0]); }
  await ctx.close();
}
await persona('Marcus (business, regular user, no code) knows L0-L1, not L2', { role: 'business', rating: 2, coding: 0, knows: 1, expectStart: 2, expectAsked: [0, 1, 2] });
await persona('Marcus misses a basic L1 question → starts at L1, not L2', { role: 'business', rating: 2, coding: 0, knows: 0, expectStart: 1, expectAsked: [0, 1] });
await persona('Dev (professional, casual user) knows L0-L2; not asked about model internals', { role: 'developer', rating: 1, coding: 3, knows: 2, expectStart: 3, expectAsked: [0, 1, 2, 3] });
await persona('Ines (engineer, practitioner) knows through L4 → starts at L5', { role: 'engineer', rating: 4, coding: 3, knows: 4, expectStart: 5, expectAsked: [0, 1, 2, 3, 4, 5] });
await persona('Ines also passes L5 → capped at L5 (never skips L5 content entirely)', { role: 'engineer', rating: 4, coding: 3, knows: 6, expectStart: 5, expectAsked: [0, 1, 2, 3, 4, 5, 6] });
await browser.close(); server.close();
console.log(fails ? `\n${fails} persona(s) failed` : '\nall placement personas passed');
process.exit(fails ? 1 : 0);
