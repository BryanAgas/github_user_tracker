// Browser smoke test for the static site in ../site.
//
// Playwright is NOT a dependency of this repo. Point Node at any install:
//   NODE_PATH=$(npm root -g) node tests/smoke.mjs            # global install
//   PLAYWRIGHT_DIR=/path/to/node_modules node tests/smoke.mjs  # e.g. a scratch dir
// Options:
//   --shots <dir>   also save full-page screenshots (home + case study,
//                   390 and 1440 wide, light and dark) into <dir>
//   --shots-only    skip the checks (with --shots)
//   --real-fonts    let Google Fonts load (default: stubbed, so the run is hermetic)
//
// It serves site/ on a local port with the CSP from netlify.toml applied, so
// CSP violations surface as console errors.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs/promises';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const siteDir = path.join(root, 'site');
const args = process.argv.slice(2);
const shotsDir = args.includes('--shots') ? path.resolve(args[args.indexOf('--shots') + 1]) : null;
const realFonts = args.includes('--real-fonts');
const shotsOnly = args.includes('--shots-only'); // skip checks, just take screenshots

/* ---------- Resolve Playwright without making it a repo dependency ---------- */
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [process.env.PLAYWRIGHT_DIR, null];
  try { candidates.push(execSync('npm root -g', { encoding: 'utf8' }).trim()); } catch { /* ignore */ }
  for (const dir of candidates) {
    try {
      return dir ? require(require.resolve('playwright', { paths: [dir] })) : require('playwright');
    } catch { /* try next */ }
  }
  console.error('Could not find playwright. Set PLAYWRIGHT_DIR or NODE_PATH (see top of tests/smoke.mjs).');
  process.exit(2);
}
const { chromium } = loadPlaywright();

/* ---------- Tiny static server mirroring Netlify's behaviour ---------- */
const toml = readFileSync(path.join(root, 'netlify.toml'), 'utf8');
const csp = (toml.match(/Content-Security-Policy\s*=\s*"([^"]+)"/) || [])[1];
if (!csp) throw new Error('No CSP found in netlify.toml');
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};
const formPosts = [];
const server = http.createServer(async (req, res) => {
  const headers = { 'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff' };
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST' && url.pathname === '/') {
    let body = '';
    for await (const chunk of req) body += chunk;
    formPosts.push(body);
    res.writeHead(200, { ...headers, 'Content-Type': 'text/plain' });
    return res.end('ok');
  }
  let file = path.join(siteDir, decodeURIComponent(url.pathname));
  if (!file.startsWith(siteDir)) { res.writeHead(400); return res.end(); }
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  let status = 200;
  if (!existsSync(file)) { status = 404; file = path.join(siteDir, '404.html'); }
  const body = await fs.readFile(file);
  res.writeHead(status, { ...headers, 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  res.end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

/* ---------- Fixtures ---------- */
const now = Date.now();
const iso = (msAgo) => new Date(now - msAgo).toISOString();
const fixtureEvents = [
  { type: 'PushEvent', repo: { name: 'mock/alpha' }, payload: { ref: 'refs/heads/main' }, created_at: iso(5 * 60e3) },
  { type: 'PushEvent', repo: { name: 'mock/alpha' }, payload: { commits: [{}, {}] }, created_at: iso(3 * 3600e3) },
  { type: 'WatchEvent', repo: { name: 'mock/beta' }, payload: { action: 'started' }, created_at: iso(26 * 3600e3) },
  { type: 'IssuesEvent', repo: { name: 'mock/gamma' }, payload: { action: 'opened' }, created_at: iso(3 * 86400e3) },
  { type: 'CreateEvent', repo: { name: 'mock/delta' }, payload: { ref_type: 'repository' }, created_at: iso(9 * 86400e3) },
  { type: 'GollumEvent', repo: { name: 'mock/wiki' }, payload: {}, created_at: iso(20 * 86400e3) },
];

/* ---------- Test harness ---------- */
const failures = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) failures.push(msg); };
const pages = ['/', '/work/both-homes/', '/thanks/', '/404.html'];
const widths = [320, 360, 768, 1280, 1600];

const browser = await chromium.launch();

// --real-fonts: fetch Google Fonts with curl (which honours the shell's proxy
// and CA settings) and hand them to the browser, so local traffic stays direct.
const fontCache = new Map();
function fetchFont(url, ua) {
  if (!fontCache.has(url)) {
    const body = execSync(`curl -sSL --fail -A ${JSON.stringify(ua)} ${JSON.stringify(url)}`, { maxBuffer: 1 << 26 });
    const contentType = url.includes('googleapis') ? 'text/css' : 'font/woff2';
    fontCache.set(url, { body, contentType });
  }
  return fontCache.get(url);
}

async function newPage(width, opts = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, ...opts });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => {
    if (!realFonts) return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    const { body, contentType } = fetchFont(route.request().url(), route.request().headers()['user-agent']);
    return route.fulfill({ status: 200, contentType, body, headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return { context, page, errors };
}

const linkCache = new Map();
async function checkLink(request, href) {
  if (linkCache.has(href)) return linkCache.get(href);
  const res = await request.get(base + href);
  linkCache.set(href, res.status());
  return res.status();
}

for (const width of shotsOnly ? [] : widths) {
  for (const p of pages) {
    const { context, page, errors } = await newPage(width);
    const res = await page.goto(base + p, { waitUntil: 'networkidle' });
    const label = `[${width}px ${p}]`;
    ok(res.status() === 200, `${label} HTTP ${res.status()}`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(overflow <= 0, `${label} horizontal overflow of ${overflow}px`);

    const audit = await page.evaluate(() => {
      const out = {};
      out.h1 = document.querySelectorAll('h1').length;
      out.lang = document.documentElement.lang;
      const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
      out.dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
      const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]);
      out.skips = levels.filter((l, i) => i > 0 && l > levels[i - 1] + 1).length;
      out.unlabelled = [...document.querySelectorAll('input:not([type=hidden]), textarea, select')]
        .filter((el) => !el.closest('[aria-hidden="true"]'))
        .filter((el) => !(el.labels && el.labels.length) && !el.getAttribute('aria-label')).map((el) => el.name);
      out.namelessButtons = [...document.querySelectorAll('button, a[href]')]
        .filter((el) => !el.textContent.trim() && !el.getAttribute('aria-label')).length;
      out.anchors = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
      out.blankNoOpener = [...document.querySelectorAll('a[target=_blank]')].filter((a) => !/noopener/.test(a.rel)).length;
      out.smallTargets = [...document.querySelectorAll('a[href], button, input, textarea')]
        .filter((el) => el.offsetParent !== null && !el.closest('p:not(.link-row), .term, [aria-hidden="true"]'))
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height < 44 && el.tagName !== 'TEXTAREA'; })
        .map((el) => `${el.tagName.toLowerCase()}:${el.textContent.trim().slice(0, 30)}`);
      return out;
    });
    ok(audit.h1 === 1, `${label} expected one h1, found ${audit.h1}`);
    ok(audit.lang === 'en-GB', `${label} html lang is "${audit.lang}"`);
    ok(audit.dupIds.length === 0, `${label} duplicate ids: ${audit.dupIds}`);
    ok(audit.skips === 0, `${label} heading levels skip`);
    ok(audit.unlabelled.length === 0, `${label} unlabelled fields: ${audit.unlabelled}`);
    ok(audit.namelessButtons === 0, `${label} ${audit.namelessButtons} links/buttons without a name`);
    ok(audit.blankNoOpener === 0, `${label} target=_blank without noopener`);
    ok(audit.smallTargets.length === 0, `${label} touch targets under 44px: ${audit.smallTargets.join(', ')}`);

    // In-page anchors and internal links
    for (const href of new Set(audit.anchors)) {
      if (href.startsWith('#')) {
        const exists = await page.evaluate((id) => !!document.getElementById(id), href.slice(1));
        ok(exists, `${label} anchor ${href} has no target`);
      } else if (href.startsWith('/')) {
        const [pathname, hash] = href.split('#');
        const status = await checkLink(page.request, pathname || '/');
        ok(status === 200, `${label} internal link ${href} → ${status}`);
        if (hash) {
          const html = await (await page.request.get(base + (pathname || '/'))).text();
          ok(html.includes(`id="${hash}"`), `${label} link ${href}: no #${hash} on target page`);
        }
      }
    }
    // Static assets referenced in <head>
    const assets = await page.evaluate(() => [...document.querySelectorAll('link[href^="/"], script[src^="/"]')]
      .map((el) => el.getAttribute('href') || el.getAttribute('src')));
    for (const a of assets) ok((await checkLink(page.request, a)) === 200, `${label} asset ${a} missing`);

    ok(errors.length === 0, `${label} console errors: ${errors.join(' | ')}`);
    await context.close();
  }
}

/* ---------- 404 status ---------- */
if (!shotsOnly) {
  const res = await fetch(`${base}/no/such/page/`);
  ok(res.status === 404, `unknown path returned ${res.status}`);
}

/* ---------- Mobile menu, keyboard only ---------- */
if (!shotsOnly) {
  const { context, page, errors } = await newPage(360);
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  const toggle = page.locator('.nav-toggle');
  ok(await toggle.isVisible(), '[menu] toggle not visible at 360px');
  ok(!(await page.locator('#site-nav a[href="/#work"]').isVisible()), '[menu] nav links visible before opening');
  let focused = '';
  for (let i = 0; i < 5 && focused !== 'nav-toggle'; i++) {
    await page.keyboard.press('Tab');
    focused = await page.evaluate(() => document.activeElement.className);
  }
  ok(focused === 'nav-toggle', '[menu] could not reach the toggle with Tab');
  await page.keyboard.press('Enter');
  ok((await toggle.getAttribute('aria-expanded')) === 'true', '[menu] Enter did not open');
  await page.waitForTimeout(300);
  ok(await page.locator('#site-nav a[href="/#work"]').isVisible(), '[menu] links not visible when open');
  await page.keyboard.press('Tab');
  ok(await page.evaluate(() => document.activeElement.getAttribute('href') === '/#work'), '[menu] Tab does not move into the menu');
  await page.keyboard.press('Escape');
  ok((await toggle.getAttribute('aria-expanded')) === 'false', '[menu] Esc did not close');
  ok(await page.evaluate(() => document.activeElement.classList.contains('nav-toggle')), '[menu] focus not returned to toggle');
  await page.waitForTimeout(300);
  ok(!(await page.locator('#site-nav a[href="/#work"]').isVisible()), '[menu] links still visible after Esc');
  // Link click closes
  await toggle.click();
  await page.waitForTimeout(300);
  await page.locator('#site-nav a[href="/#contact"]').click();
  ok((await toggle.getAttribute('aria-expanded')) === 'false', '[menu] link click did not close');
  ok(errors.length === 0, `[menu] console errors: ${errors.join(' | ')}`);
  await context.close();
}

/* ---------- Contact form ---------- */
if (!shotsOnly) {
  const { context, page, errors } = await newPage(768);
  await page.goto(base + '/#contact', { waitUntil: 'networkidle' });
  ok(await page.evaluate(() => document.getElementById('contact-form').noValidate), '[form] novalidate not set by JS');
  await page.locator('#contact-form button[type=submit]').click();
  const errs = await page.evaluate(() => ['c-name', 'c-email', 'c-message'].map((id) => ({
    invalid: document.getElementById(id).getAttribute('aria-invalid'),
    describedby: document.getElementById(id).getAttribute('aria-describedby') || '',
    text: document.getElementById(`${id}-error`).textContent,
    hidden: document.getElementById(`${id}-error`).hidden,
  })));
  ok(errs.every((e) => e.invalid === 'true' && !e.hidden && e.describedby.includes('-error')), '[form] empty submit did not flag all fields');
  ok(errs[0].text === 'Please add your name.', `[form] name error: ${errs[0].text}`);
  ok(errs[1].text === 'Please add an email address I can reply to.', `[form] email error: ${errs[1].text}`);
  ok(errs[2].text === 'Please write a short message.', `[form] message error: ${errs[2].text}`);
  ok(errs[2].describedby.includes('c-message-hint'), '[form] message lost its hint');
  ok(await page.evaluate(() => document.activeElement.id === 'c-name'), '[form] focus not on first invalid field');

  await page.fill('#c-name', 'Test Person');
  await page.fill('#c-email', 'not-an-email');
  await page.fill('#c-message', 'Hello there.');
  await page.locator('#contact-form button[type=submit]').click();
  ok((await page.textContent('#c-email-error')) === 'That email address doesn’t look right.', '[form] bad email message wrong');
  ok(await page.evaluate(() => document.activeElement.id === 'c-email'), '[form] focus not on email');
  ok((await page.getAttribute('#c-name', 'aria-invalid')) === null, '[form] fixed name still invalid');

  // Failure path
  await page.route(`${base}/`, (route) => route.request().method() === 'POST'
    ? route.fulfill({ status: 500, body: 'nope' }) : route.continue());
  await page.fill('#c-email', 'test@example.com');
  await page.locator('#contact-form button[type=submit]').click();
  await page.waitForFunction(() => document.getElementById('contact-status').textContent.length > 0);
  ok((await page.textContent('#contact-status')) === 'That didn’t send. Please try again, or message me on LinkedIn.', '[form] failure copy wrong');
  ok(!(await page.locator('#contact-form button[type=submit]').isDisabled()), '[form] button stays disabled after failure');
  await page.unroute(`${base}/`);

  // Success path: posts urlencoded to / then goes to /thanks/
  await Promise.all([page.waitForURL('**/thanks/'), page.locator('#contact-form button[type=submit]').click()]);
  const posted = new URLSearchParams(formPosts.at(-1) || '');
  ok(posted.get('form-name') === 'contact' && posted.get('email') === 'test@example.com', '[form] POST body wrong');
  ok(errors.filter((e) => !/500/.test(e)).length === 0, `[form] console errors: ${errors.join(' | ')}`);
  await context.close();
}

/* ---------- Tracker (mocked GitHub API) ---------- */
if (!shotsOnly) {
  const { context, page, errors } = await newPage(1280);
  let lastAccept = '';
  await context.route('https://api.github.com/**', (route) => {
    const url = new URL(route.request().url());
    lastAccept = route.request().headers().accept || '';
    const user = decodeURIComponent(url.pathname.split('/')[2]);
    const cors = { 'Access-Control-Allow-Origin': '*' };
    if (user === 'mockuser') return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(fixtureEvents) });
    if (user === 'quietuser') return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: '[]' });
    if (user === 'limited') return route.fulfill({ status: 403, contentType: 'application/json', headers: cors, body: '{"message":"API rate limit exceeded"}' });
    return route.fulfill({ status: 404, contentType: 'application/json', headers: cors, body: '{"message":"Not Found"}' });
  });
  await page.goto(base + '/#tracker', { waitUntil: 'networkidle' });
  const out = page.locator('#tracker-output');
  ok((await out.getAttribute('aria-live')) === 'polite', '[tracker] output is not aria-live polite');
  ok((await out.textContent()).trim() === 'Results will appear here.', '[tracker] idle copy wrong');

  await page.fill('#gh-user', 'mockuser');
  await page.click('#tracker-form button[type=submit]');
  await page.waitForSelector('#tracker-output li.term__row');
  const rows = await page.$$eval('#tracker-output li.term__row', (lis) => lis.map((li) => ({
    text: li.querySelector('.term__text').textContent,
    href: li.querySelector('a')?.getAttribute('href'),
    datetime: li.querySelector('time')?.getAttribute('datetime'),
    when: li.querySelector('time')?.textContent,
  })));
  ok(rows.length === fixtureEvents.length, `[tracker] expected ${fixtureEvents.length} rows, got ${rows.length}`);
  ok(rows[0].text === 'Pushed to main in mock/alpha' && rows[0].href === 'https://github.com/mock/alpha', `[tracker] row 0: ${JSON.stringify(rows[0])}`);
  ok(rows[0].when === '5m ago' && !!rows[0].datetime, `[tracker] row 0 time: ${rows[0].when}`);
  ok(rows[1].text === 'Pushed 2 commits to mock/alpha', `[tracker] row 1: ${rows[1].text}`);
  ok(rows[5].text === 'Gollum in mock/wiki', `[tracker] fallback row: ${rows[5].text}`);
  ok(/vnd\.github\+json/.test(lastAccept), '[tracker] Accept header missing');
  ok((await out.getAttribute('aria-busy')) === 'false', '[tracker] aria-busy stuck on');
  ok((await page.textContent('#term-user')) === 'mockuser', '[tracker] prompt not updated');

  await page.click('.chip[data-user="torvalds"]'); // unknown to the mock → 404
  await page.waitForFunction(() => /no GitHub user/.test(document.getElementById('tracker-output').textContent));
  ok((await out.textContent()).trim() === 'There’s no GitHub user called @torvalds. Check the spelling?', '[tracker] 404 copy wrong');

  await page.fill('#gh-user', 'limited');
  await page.press('#gh-user', 'Enter');
  await page.waitForFunction(() => /limit/.test(document.getElementById('tracker-output').textContent));
  ok((await out.textContent()).trim() === 'GitHub’s limit for anonymous requests has been reached from your network. It resets within the hour.', '[tracker] rate-limit copy wrong');

  await page.fill('#gh-user', 'quietuser');
  await page.press('#gh-user', 'Enter');
  await page.waitForFunction(() => /No public activity/.test(document.getElementById('tracker-output').textContent));
  ok((await out.textContent()).trim().startsWith('No public activity for @quietuser in the last 90 days.'), '[tracker] empty copy wrong');

  await page.fill('#gh-user', 'bad--name');
  await page.press('#gh-user', 'Enter');
  ok((await out.textContent()).trim() === 'GitHub usernames use letters, numbers and single hyphens, up to 39 characters.', '[tracker] invalid copy wrong');
  ok((await page.getAttribute('#gh-user', 'aria-invalid')) === 'true', '[tracker] invalid input not flagged');

  // Network failure
  await context.unroute('https://api.github.com/**');
  await context.route('https://api.github.com/**', (route) => route.abort('internetdisconnected'));
  await page.fill('#gh-user', 'someone');
  await page.press('#gh-user', 'Enter');
  await page.waitForFunction(() => /Couldn’t reach GitHub/.test(document.getElementById('tracker-output').textContent));
  ok(true, 'network state');

  const realErrors = errors.filter((e) => !/Failed to load resource|ERR_INTERNET_DISCONNECTED|status of 40[34]/.test(e));
  ok(realErrors.length === 0, `[tracker] console errors: ${realErrors.join(' | ')}`);

  if (shotsDir) {
    // Keep a filled tracker for the screenshots below.
    await context.unroute('https://api.github.com/**');
  }
  await context.close();
}

/* ---------- Screenshots ---------- */
if (shotsDir) {
  mkdirSync(shotsDir, { recursive: true });
  for (const scheme of ['light', 'dark']) {
    for (const width of [390, 1440]) {
      for (const [name, p] of [['home', '/'], ['case', '/work/both-homes/']]) {
        const { context, page } = await newPage(width, { colorScheme: scheme, reducedMotion: 'reduce', deviceScaleFactor: width < 600 ? 2 : 1 });
        await context.route('https://api.github.com/**', (route) => route.fulfill({
          status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(fixtureEvents) }));
        await page.goto(base + p, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(shotsDir, `${name}-${width}-${scheme}-fold.png`) });
        await page.locator('.bh').screenshot({ path: path.join(shotsDir, `${name}-${width}-${scheme}-bh.png`) });
        if (p === '/') {
          await page.fill('#gh-user', 'mockuser');
          await page.click('#tracker-form button[type=submit]');
          await page.waitForSelector('#tracker-output li.term__row');
        }
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(shotsDir, `${name}-${width}-${scheme}.png`), fullPage: true });
        await context.close();
      }
    }
  }
}

await browser.close();
server.close();

if (failures.length) {
  console.log(`FAIL ${failures.length} of ${checks} checks`);
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
}
console.log(`PASS ${checks} checks across ${pages.length} pages × ${widths.length} widths, menu, form and tracker`);
