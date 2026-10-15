# Reviewer report: accessibility, security, code quality 

Scope: academy/ (no-build ES modules), served with production CSP via tests/serve.mjs. axe-core not available offline; hand-checked + scripted Playwright.
Legend: [V] verified in browser/script, [S] suspected from code reading.

## Security / privacy

No Blocker found. No innerHTML/insertAdjacentHTML/outerHTML/document.write/eval in js/ outside the worker. 132 routes (all lessons, projects, 22 widgets) load with zero CSP or console errors. No third-party requests.

### High
H1 [V] Multi-tab data loss (store.js:21-37, no `storage` listener). `state` lives in memory and the whole object is written on every save/pagehide. A second tab opened earlier overwrote the first tab's evidence (reproduced: tab A wrote evidence for 1 skill, a stale tab B called touchDay, localStorage then held 0 skills). Fix: on `storage` event re-read state; or merge-on-write (re-read, append evidence/days by timestamp) before setItem.

### Medium
M1 [V] Imported backup is not validated (js/store.js:20-21 migrate, :55-58 importData). Only `v===1` is checked. `lessons`, `notes`, `seenQuestions`, `projects`, `evidence`, `days` set to null, or evidence entries missing `src`/null/non-array, throw in skillStatus (mastery.js:21-27), streak (store.js:44), openLesson, projectRec, etc. Result: Progress/Learn/Lesson/Build/Review pages show "Something went wrong" until Erase everything. Fix: in migrate(), rebuild each section with type checks (plain objects, arrays of {t:string,s:0..1,w:0..5,src:string}), cap size (e.g. 2 MB), skip keys `__proto__`/`constructor`, and build maps with Object.create(null) or Map.
M2 [V] Worker result spoofing: student code can call `self.postMessage({ok:true,results:[{pass:true,...}]})` (runner-worker.js:16-30) and pass any test / project check. Impact: mastery integrity only. Fix: capture `const post=self.postMessage.bind(self)` and a per-run nonce in closure, then overwrite `self.postMessage` (and prototype) with a no-op before running student code; runner.js ignores messages without nonce.
M3 [S] Netlify header merge: netlify.toml defines a CSP for /* and a different one for /js/runner-worker.js. If Netlify delivers both, browsers enforce the intersection and generic `script-src 'self'` forbids `new Function` => code runner dead in production. tests/serve.mjs picks only the specific one so tests cannot catch it. Verify with `curl -I` after deploy; safer: serve worker from a path excluded from /* (or add `!` rules / use _headers with explicit paths).

### Low
L1 [V] Worker sandbox claims "no storage, network removed": `indexedDB`, `caches`, `navigator` remain (assignment to read-only accessors silently fails in sloppy mode), `delete self.fetch` restores fetch, nested Worker and dynamic same-origin `import()` work. Network is nevertheless truly blocked by worker CSP `connect-src 'none'` (verified: fetch same-origin, localhost, api.anthropic.com all fail; sendBeacon absent; exfil server got 0 hits). Worker can open same-origin IndexedDB/Cache (app uses none). Fix: delete properties from prototype chain or accept and fix comment; add `worker-src 'none'` in worker CSP.
L2 [V] Console log flood: 300k console.log lines are all returned and rendered (codeplay.js renderResult): 3.6 s main-thread freeze, 3.4 MB DOM. Cap logs (e.g. 200 lines / 20 KB) in worker.
L3 [V] Memory/CPU bombs are contained: while(true), 8x1 GB Uint8Array, array push loop all end at the timeout via terminate(); page stayed responsive. Fresh worker per run, prototype pollution does not leak (verified).
L4 [V] `#/lab/<id>` passes the URL segment to `import(`./${name}.js`)` (widgets/index.js:7). Path segments like `../content/l0` import arbitrary same-origin modules (no origin escape; CSP script-src 'self'). Whitelist against WIDGET_NAMES.
L5 [V] XSS probes: `<img onerror>` in nickname, notes, project text/code, model/baseUrl settings, every route segment/query param, tutor input (also `javascript:`/`data:` links, fenced script): no execution, no img elements created. util.inline only emits https:// and #/ links with rel=noopener noreferrer. Model/tutor output goes through same renderer, so a model reply can contain clickable https links (phishing only).
L6 [S] API key: held in module memory; optional sessionStorage (store.js:65-70); never in localStorage, never logged; error text from server only (tutor.js:215-219). Custom baseUrl is user-controlled and the key is sent there, but CSP connect-src blocks anything except self/api.anthropic.com. NB `connect-src 'self'`: a baseUrl of the site's own origin would receive the key. Validate baseUrl === https://api.anthropic.com or warn. Settings page shows "Connected for this session" without validating the key.
L7 [S] Prompt injection: lesson content is first-party; user text is passed raw. Project review prompt wraps submission in """ (build.js:102) but a submission containing """ can break out; low impact (output only displayed). Use XML-ish tags + system instruction (already says treat as data).
L8 [V] Corrupt localStorage JSON is silently replaced by a fresh state on first save/pagehide (data loss, no backup). Keep the raw blob under a `.corrupt` key.

## Accessibility

### High
A1 [V] Skip link `<a class="skip" href="#main">` (index.html:17) changes the hash to `#main`; the router treats it as route "main" and falls back to Home, replacing the current page (verified on #/learn). Fix: make it a button/handler that focuses `#main` (preventDefault), or route-ignore.
A2 [V] Form-control borders fail 1.4.11: `--line` vs background is 1.28:1 light / 1.54:1 dark (inputs, selects, textareas, .opt cards, app.css:43,117). Use a border of >=3:1 (e.g. #8a8398 light).
A3 [V] Light-theme text contrast failures (computed): `.kicker` accent #e8590c on #fbf7f0 3.35:1 (12.8px); `.widget-tag` 3.58:1; accent on accent-soft 3.05:1; `.st-strong`/`.chip.good`/`.badge.live` good #1b7f4b on #dff3e8 4.33:1 (11-12px text); `.level.dim{opacity:.78}` drops muted text on the Learn page to 3.9-4.1:1; focus ring accent on brand-soft 2.93:1. Dark theme passes everything except borders. Fix: --accent text variant #b9480a (>=4.8:1), --good #17693f.


### Medium (a11y)
A4 [V] Tutor drawer is not modal: no focus trap (second Tab leaves the drawer into the page behind), no `aria-modal`, background not `inert` (tutorui.js:54-66). Focus does move in on open and return to the opener on Esc/close (verified). Fix: set `main`/nav `inert` while open (or trap Tab), add aria-modal="true".
A5 [V] Focus loss on interaction: onboarding path `<select>` (onboarding.js:234) re-renders the step on every change and moves focus to the h1, so keyboard users get one ArrowDown per focus trip (WCAG 3.2.2); calibration "Answer"/"I don't know" re-renders and drops focus to BODY (onboarding.js:210-221). Fix: keep select state in place (update the summary only), and focus the new question's heading after ask().
A6 [V] Custom role/chip controls signal selection by colour/border only: radios and checkboxes in `.roles` and `.chipbox` are `opacity:0` (app.css:65,88), unchecked chip borders are 1.3:1. Add a check glyph/outline for checked state.
A7 [V] Library tabs use role=tab/tablist on plain links without tabpanel/aria-controls/roving tabindex (misc.js:55). Use a `<nav>` with aria-current instead.
A8 [V] 320 px reflow (400% zoom) overflows horizontally on Progress (`.legend{white-space:nowrap}` width 380) and Settings (label/input 329). Every other page tested (home, learn, lesson, build, library, tutor, 3 widgets, review) reflows.
A9 [S] Streaming model replies re-render the whole message inside `role=log aria-live=polite` on each delta (tutorui.js:33): screen readers re-read partial text. Render into a non-live node and announce once when finished. Enter while a reply is pending still submits (requestSubmit ignores the disabled button), see B5.

### Low (a11y)
- Initial load focuses the h1 (app.js:48) so the skip link is skipped on first Tab (acceptable) but see A1 for when used.
- Visually hidden file input for import (`.sr-only`, misc.js:104) gets focus without a visible indicator on its label; add `input:focus-visible + label` styling.
- Inline radio/checkbox inputs are 18x18 px (WCAG 2.5.8 passes via label hit area); breadcrumb link 17 px high.
- Step counter "Step n of 6" is aria-hidden (onboarding.js:168): SR users lose orientation.
- Search results (glossary, explore) change without an announcement outside explore's aria-live.
- Mastery states are NOT colour-only (glyph + text label in pills and sr-only text in chips): good. Reduced motion handled globally (app.css:146), but `scrollIntoView({behavior:'smooth'})` in lesson.js:67,79,86 ignores it (CSS `scroll-behavior` override does not cover JS option in all browsers); pass `behavior: matchMedia('(prefers-reduced-motion)').matches ? 'auto':'smooth'`.
- Code editors trap Tab until Esc: documented on-page, passes 2.1.2 as an advertised mechanism.
- `.logo` "A" scanner flagged 1:1 (gradient background, aria-hidden): manual check advised only.

## Code quality / logic bugs

### High
B1 [V] Stale-tab overwrite: see H1.

### Medium
B2 [V] Tutor request history starts with an assistant turn from the 7th model call on: `history.slice(-12)` is taken after pushing the user message (tutor.js:~55). Roles sent per call: u, uau, ... , then `auauau...`. The Messages API rejects a conversation that does not start with a user turn, so every long chat ends with "couldn't reach the model: ...". Fix: slice then drop leading assistant entries (or slice(-11) of the pre-push history).
B3 [V] Drawer header goes stale: `refreshHeader` is one module-level variable (tutorui.js:8,20) reassigned by whichever `chatPanel()` was created last. After visiting #/tutor, lesson context chips/status in the drawer never update (verified: on a lesson the drawer still shows "What should I do next?" chips). Fix: keep a Set of refresh callbacks.
B4 [V] Placement quiz writes evidence despite "no marks": wrong/"I don't know" adds score-0 evidence (onboarding.js:218), puts skills into Needs practice/Review due, and Back + redo duplicates it. Either don't write evidence for wrong/skip or label honestly.
B5 [S] Concurrent tutor sends: chips and Enter are not blocked while `send.disabled` (tutorui.js:31,43), so two `respond()` calls interleave history roles. Guard with a `busy` flag.
B6 [S] Async view race: render() (app.js:30-48) is not serialised; a slow view (Lab awaits 22 module imports) can finish after a later route and replace it, and widget cleanups pushed after navigation (`env.cleanups.push` in blocks.js:284, lab.js:176) go to an already-run env => timers/listeners leak. Not reproduced with local latency; add a navigation token checked before `main.append` and when pushing cleanups.
B7 [S] Project completion gate can be stale/gamed: `lastChecks` is in-memory and not invalidated when the text is edited after "Run checks" (build.js:72-86,119); "Get a review" is satisfied by any >=40 chars. Also unused `frac` (build.js:112). Invalidate lastChecks on input; require the review for the current text hash.
B8 [S] Evidence inflation: retaking a lesson quiz re-adds full-weight evidence for the same question ids (lesson.js:46-49 + assess.js resolve); the "firstTry" stored in recordQuiz is overwritten by retakes (mastery.js:71) although labelled first-try. The "two sources" rule counts `type:second-token`, so two different review questions count as two sources (mastery.js:28), not two "places". Dedupe by qid per day or down-weight repeats; store real first-try separately.
B9 [S] Short-answer self-marking: "Yes, mine says that" gives 0.6-0.75 credit unconditionally (assess.js:164-170), and the synthetic extra click bumps `attempts` so even honest self-marks lose 0.2. Acceptable pedagogically but undermines "Strong = evidence"; weight self-marked evidence lower in mastery rather than in the score.
B10 [V] Opening a lesson calls touchDay(1,0) every render (lesson.js:14), so the streak counts mere page views, contradicting "opening never counts".
B11 [V] Double-click on a code question's Check runs the grader twice (assess.js check handler awaits `grade` without disabling): attempts +2, can trigger giveUp/reveal. Disable Check while pending.

### Low
- Review route: `?count=abc` -> NaN -> pickQuestions returns every question (assess/mastery.js:picked.length >= NaN never true). Clamp to 1..20.
- `#/cert` with no id throws (`id.slice`, misc.js:42) -> generic error page; guard.
- mcq wrong answer disables the checked radio (assess.js:~98): focus drops to body; use aria-disabled/ keep focusable.
- Custom path "reload" in learn.js:61 uses location.reload() instead of re-render.
- runner.js timeout 2 s starts before worker is parsed (slow devices may false-timeout); consider starting the timer on first message.
- Chat error path leaves "..." placeholder if respond() throws (tutorui.js:33,39).

## What is solid
- Rendering is DOM-API only; markdown subset allows only https:// and #/ links with noopener noreferrer; verified no execution for any injection vector tried.
- Production CSP is tight (default-src 'self', no inline script/style, connect-src limited, frame-ancestors none, form-action none); all 132 routes + 22 widgets run under it with zero violations; no third-party requests; no analytics.
- Worker: fresh per run, hard terminate timeout, worker CSP `connect-src 'none'` demonstrably blocks fetch (even same-origin), sendBeacon absent, memory/CPU bombs contained, prototype pollution does not escape, structured results rendered via textContent.
- API key never reaches localStorage/exports (exportData only serialises `state`), optional sessionStorage only.
- Keyboard: every page has exactly one h1 that receives focus on route change; document.title updates; aria-current on nav; More menu uses aria-expanded and closes on navigation; reorder question uses buttons not drag; code editors have documented Esc-Tab escape; drawer returns focus to opener and closes on Esc; non-colour mastery cues; reduced-motion CSS; 44px buttons.
- Dark theme text contrast passes everywhere tested; light theme passes except items in A3.
- Mastery design (recency weighting, staleness, hint penalties, "reveal = 0") is coherent and well documented.

## Not done / limits
axe-core was unavailable offline; screen-reader behaviour not tested; widgets keyboard-checked only by code reading and smoke loading (flow, sorter, claimcheck, nnplayground, dotproduct, embeddings mount without errors) - a manual keyboard pass of each is still recommended. Reproduction scripts: scratchpad/reviewer/*.mjs.
