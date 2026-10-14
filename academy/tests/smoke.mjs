// Loads every route in a real browser under the production CSP; fails on console errors / page errors / failed requests.
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_DIR ? process.env.PLAYWRIGHT_DIR + '/playwright' : 'playwright');
const { server, url } = await serve();
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`[console.${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => problems.push('[pageerror] ' + e.message));
page.on('requestfailed', (r) => problems.push('[requestfailed] ' + r.url()));
page.on('response', (r) => { if (r.status() >= 400) problems.push(`[http ${r.status()}] ${r.url()}`); });
await page.goto(url + '/index.html');
await page.evaluate(() => { localStorage.setItem('mrsanne.v1', JSON.stringify({ v: 1, onboarded: true, profile: { name: 'Test', path: 'everything' } })); });
const routes = ['home', 'learn', 'learn/L0', 'learn/L3', 'explore', 'lab', 'build', 'tutor', 'progress', 'library', 'library?tab=resources', 'library?tab=cheat', 'library?tab=current', 'review', 'settings', 'onboarding'];
const lessonIds = await page.evaluate(async () => (await import('/js/content.js')).lessons.map((l) => l.id));
const projIds = await page.evaluate(async () => [...(await import('/js/content.js')).projectById.keys()]);
const wnames = await page.evaluate(async () => (await import('/js/widgets/index.js')).WIDGET_NAMES);
let n = 0;
for (const r of [...routes, ...lessonIds.map((i) => 'lesson/' + i), ...projIds.map((i) => 'build/' + i), ...wnames.map((w) => 'lab/' + w)]) {
  await page.goto(url + '/index.html#/' + r); await page.reload();
  await page.waitForSelector('#page-title', { timeout: 8000 }).catch(() => problems.push('[no h1] ' + r));
  if (r.startsWith('lesson/')) { await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(150); }
  else await page.waitForTimeout(r.startsWith('lab/') ? 400 : 100);
  const t = await page.textContent('h1').catch(() => '');
  if (/went wrong|not found/i.test(t || '')) problems.push('[error page] ' + r + ': ' + t);
  n++;
}
console.log(`visited ${n} routes (${lessonIds.length} lessons, ${projIds.length} projects, ${wnames.length} widgets)`);
const uniq = [...new Set(problems)];
uniq.forEach((p) => console.log(p));
await browser.close(); server.close();
process.exit(uniq.length ? 1 : 0);
