# Studio spec: bryan agas portfolio

> Creative direction superseded by `BRAIN_BRIEF.md` (Brief v2, "My Brain"). Facts and do-not-publish rules below still apply.

Single source of truth for the portfolio site in `site/`. Strategy, IA, design
system and copy are settled here; the build follows this document.

## 1. Project state

- **Subject:** Bryan Agas, UK. Self-taught builder. GitHub `BryanAgas`,
  LinkedIn `linkedin.com/in/bryanagas`.
- **Objective:** A personal portfolio that gets the right people (hiring
  managers for junior/product-minded developer roles, founders and
  collaborators, early Both Homes users and press) to understand what Bryan
  builds, trust it, and get in touch.
- **Primary conversion:** a message via the contact form or LinkedIn.
  Secondary: open Both Homes; view GitHub.
- **Deploy target:** Netlify (static, Netlify Forms for contact).

### Verified facts (the only facts the site may state)

| Area | Fact |
|---|---|
| Product | **Both Homes** — "A calm shared calendar for separated parents." Answers one question: *where is my child tonight?* Set the pattern once, nights laid out months ahead, one colour per home. Changes are requested and answered; nothing moves without agreement. Notes on days. Invite-only sharing: one email, works once, expires after seven days. Free tier (first own calendar, two homes, six templates, three shared requests per person per child per month; viewing and responding free) + Plus (£3.99/mo, £34.99/yr; extra calendars; a decision-maker can sponsor a child calendar; one 14-day trial with no payment details, no automatic renewal). Source: bothhomes.co.uk homepage source, `web/src/pages/Index.tsx`, `web/src/site.ts`. iOS via public TestFlight (App Store listing pending), web app at app.bothhomes.co.uk, site at bothhomes.co.uk. Publisher: Bryan Agas. Data export and account deletion available to users. |
| Both Homes site stack | React, TypeScript, Vite, Tailwind CSS; unit tests (Vitest) and browser tests (Playwright); deployed on Netlify with a publish script that checks the branch, clean tree and validation before pushing. README checklist: verify the deployed commit and public routes after publishing. Web app is "for Android and computers" (`site.ts`). |
| github_user_tracker (2024) | Python CLI, standard library only (`http.client`, `json`), reads the public GitHub events API, prints readable activity, handles bad usernames and failed requests. |
| data-dictionary-app (2024) | Python + pandas + Tkinter desktop search over a Redshift data dictionary spreadsheet (columns → description, table, schema, database), plus a browser version in plain HTML/JS. |
| MyCV (Jan 2022) | First hand-coded website: a multi-page HTML CV. |
| Work history | Tesco Superstore, Sheffield — Customer Service Assistant (Oct 2010–Jun 2014). Sales Representative via agencies for brands including Samsung, LG, Aldi, Sainsbury's (Apr 2014–Jun 2019). Kadampa Meditation Centre — full-time volunteer: kitchen assistant, then acting kitchen manager for six months (Sep 2019–Dec 2020). Manjushri Kadampa Meditation Centre — Cafe Assistant Manager (Jan 2021–Jan 2022): rotas, menus, ordering, training new staff, recruitment with HR. |
| Education | MA Public Relations, Advertising and Applied Communication, Sheffield Hallam (2015–2017, merit). BA Business Management, Sheffield Hallam (2011–2014, merit). Access to HE, Barnsley College (2010–2011, merit; elected Student Governor). |
| Personal | Dad of two. Salsa (was president of the Salsa Society at university). Tennis weekly. Daily meditation. |

### Do NOT publish

Phone number, personal email, the Both Homes correspondence address, the
Twitter/Facebook links from the 2022 CV, star ratings for soft skills, the
empty `task_tracker` repo, any employer claim for the data-dictionary work,
any user numbers, testimonials or outcomes for Both Homes (none are verified).

## 2. Positioning

**Line:** *I build calm software for the parts of life that get messy.*

Why it works: Both Homes is literally a calm tool for a tense situation; twelve
years serving people face to face (tills, sales floors, kitchens) is where the
instinct for "calm under pressure, clear for the person in front of you" came
from. The career path is not hidden — it is the differentiator. Most junior
developer portfolios show tutorial projects; this one leads with a shipped,
priced, privacy-literate product that one person built.

Message hierarchy:
1. I ship real products (Both Homes: iOS + web + site, pricing, privacy, terms).
2. I build for people, because I spent twelve years in front of them.
3. I'm still curious and still building small tools (CLI, data dictionary).
4. Here's how to reach me.

## 3. Information architecture

```
/                       Home (single long page, anchored sections)
  #work                 Selected work
  #path                 The path (timeline)
  #tracker              Live: GitHub activity tracker (interactive demo)
  #about                Off the clock
  #contact              Contact (form + links)
/work/both-homes/       Case study
/thanks/                Form success page
/404.html               Not found
```

Header: wordmark "Bryan Agas" (links home) + nav: Work, Path, Tracker, About,
Contact. On ≤ 720px: wordmark + a "Menu" button that opens a full-width
disclosure panel (not a modal), `aria-expanded`, closes on link click and Esc.
Skip link to `#main`. Footer: a repeated contact line (`Say hello →` to #contact, LinkedIn), small sitemap, GitHub, LinkedIn, "Source on
GitHub" link to this repo, year.

Home section order and purpose:
1. **Hero** — who, what, the positioning line, two CTAs: "See Both Homes"
   (→ case study) and "Get in touch" (→ #contact). A small status line in mono:
   `Now: building Both Homes · Based in the UK`.
2. **Work** — Both Homes as a large feature (illustration + summary + links:
   case study, visit site); then a 3-up list of smaller work: GitHub activity
   tracker (links to #tracker demo + repo), Data dictionary search (repo),
   MyCV 2022 ("where the code started", repo).
3. **Path** — ledger-style timeline, newest first, 2022→now "Building
   software", 2021–22 Cafe assistant manager, 2019–20 kitchen, 2014–19 sales,
   2010–14 Tesco; education as a compact secondary list. Each entry: one line
   on what it taught that shows up in the software.
4. **Tracker** — in-browser port of this repo's CLI: input + "Fetch activity"
   button, results as a terminal-styled list. Example chips. Clear states.
5. **About** — short personal paragraph + four "off the clock" facts.
6. **Contact** — short invitation, Netlify form (name, email, message,
   honeypot), plus LinkedIn and GitHub links.

CTA system: primary button (filled ink) used once per viewport at most;
secondary = underlined text link with arrow. External links get a visible ↗
and `rel="noopener"`.

## 4. Design system

**Concept: "the working notebook."** Off-white paper, near-black ink, a single
ballpoint-blue accent and a highlighter used sparingly behind a few words.
Mono "margin notes" (dates, labels) sit in a left gutter like a ledger. It is
calm, human and deliberately distinct from Both Homes' own cream/terracotta/
teal brand (which appears only inside the Both Homes illustration).

Tokens (CSS custom properties on `:root`, dark theme under
`prefers-color-scheme: dark` and `[data-theme]` — no theme toggle needed):

| Token | Light | Dark |
|---|---|---|
| `--paper` | `#F5F2EB` | `#121316` |
| `--paper-2` (raised) | `#FFFFFF` | `#1A1C21` |
| `--ink` | `#17171A` | `#ECEAE4` |
| `--ink-2` (secondary text) | `#55534E` | `#A9A69F` |
| `--rule` | `#DAD5CA` | `#2C2E35` |
| `--accent` (ballpoint) | `#2340B0` | `#9DB0FF` |
| `--highlight` | `#F7DE6B` (text on it stays `--ink` light) | `#5A4A0B` |
| `--ok` / `--warn` | `#1D6B45` / `#9A3B12` | `#7FD1A6` / `#F2A27E` |

All text pairs must meet WCAG AA (verify; adjust tokens if not).

Type (Google Fonts, `display=swap`, only listed weights):
- Display: **Newsreader** (opsz), 400 + 400 italic + 600. Headlines use
  regular weight at large size; italics for emphasis words.
- Body/UI: **Hanken Grotesk** 400, 500, 600.
- Mono: **JetBrains Mono** 400, 500 — labels, dates, tracker output.

Scale (fluid with `clamp`): display 2.75→5.25rem; h2 2→3rem; h3 1.25→1.5rem;
body 1.0625rem/1.6; small .875rem; mono labels .8125rem, uppercase,
letter-spacing .06em.

Spacing: 4px base — `--s-1` 4 … `--s-10` 160 (4, 8, 12, 16, 24, 32, 48, 64,
96, 160). Section padding block: `clamp(64px, 10vw, 144px)`.
Container: 72rem max, gutter `clamp(16px, 4vw, 40px)`. Ledger layout: on
≥ 900px a 12-col grid where margin notes take cols 1–3, content 4–12; below
that, notes stack above content.
Radius: 2px (inputs/buttons), 10px (illustration frame). Mostly flat; one
shadow token `--lift` for the illustration only.
Rules: hairline `1px solid var(--rule)` separate sections and timeline rows.
Motion: 160ms/240ms, `cubic-bezier(.2,.7,.2,1)`. Only: link underline grow,
button press, menu panel, tracker rows fading in (stagger ≤ 30ms, max 12
rows). Everything off under `prefers-reduced-motion`.
Focus: 2px solid `--accent` outline, 3px offset, everywhere.
Breakpoints: 480, 720, 900, 1200.
Icons: none from libraries; use typographic arrows (→ ↗) and the product's
own illustration.

Both Homes illustration (pure HTML/CSS, no image): a 2-week calendar strip of
14 day cells labelled M T W T F S S, each night coloured one of two homes
(terracotta `#C9603F`, teal `#2C7A6B` on cream `#F6F1E7`), with one small
note marker ("Swim kit") and a pending-change chip ("Swap Fri? · Awaiting
reply"). `role="img"` with a descriptive `aria-label`.

## 5. Copy deck

Voice: plain British English, first person, short sentences, specific nouns,
no hype. Never: "passionate", "journey" (as a noun about career), "transforming
ideas", "welcome to my portfolio", "cutting-edge".

**Meta (home)** title: `Bryan Agas — I build calm software for messy parts of life`
description: `Bryan Agas builds Both Homes, a calm shared calendar for separated parents, and small tools in Python and the browser. Twelve years serving people before writing code.`

**Hero**
- Eyebrow (mono): `Bryan Agas · Product builder, UK`
- H1: `I build calm software for the parts of life that get <em>messy</em>.`
- Lede: `Right now that's Both Homes, a shared calendar that tells separated parents one thing without argument: where their child is sleeping tonight. Before code, I spent twelve years on tills, sales floors and in busy kitchens — which is where I learned what "clear" has to mean for the person in front of you.`
- CTAs: `See how Both Homes works` · `Get in touch`
- Status: `Now — shipping Both Homes on iOS and the web`
- Stack line (mono, under CTAs, visible above the fold): `Works in TypeScript · React · Python · HTML & CSS`

**Work**
- H2: `Selected work`
- Note: `2022 — now`
- Both Homes feature — label `Product · 2026`; title `Both Homes`; body: `A shared calendar for separated parents. Set the pattern once and every night is laid out months ahead, one colour per home. Changes are asked for and answered, so nothing moves without agreement. Invite-only, with no public links.` Facts row (mono): `iOS (TestFlight) · Web app · Free + Plus`. Links: `Read the case study →`, `Visit bothhomes.co.uk ↗`.
- Small work items:
  1. `GitHub activity tracker` — `Python, standard library only` — `A command-line tool that reads a user's public GitHub events and turns them into plain sentences. You can try a browser version of it below.` Links: `Try it →` (#tracker), `Code ↗`.
  2. `Data dictionary search` — `Python, pandas, Tkinter` — `Type a column name, get back what it means and which table, schema and database it lives in. Built to stop hunting through a spreadsheet of Redshift column definitions.` Link: `Code ↗`.
  3. `MyCV` — `HTML, 2022` — `The first website I wrote by hand: a plain multi-page CV. Kept public because it's where this started.` Link: `Code ↗`.

**Path**
- H2: `The path here`
- Intro: `Not a straight line, and I wouldn't swap it. Each job left something that shows up in what I build.`
- Rows (note = dates; title; place; lesson):
  - `2022 — now` · `Building software` · `Self-taught` · `From a hand-coded CV to a shipped product with pricing, a privacy policy, data export and tests.`
  - `2021 — 2022` · `Cafe assistant manager` · `A meditation centre café` · `Rotas, menus, ordering and training new staff. Systems only work if the person on shift can follow them at 8am.`
  - `2019 — 2020` · `Kitchen assistant → acting kitchen manager` · `A meditation centre kitchen (volunteer)` · `Six months running a kitchen I'd started in as an assistant: monthly menus, budgets, rotas and a team to look after.`
  - `2014 — 2019` · `Sales representative` · `Agency roles for Samsung, LG, Aldi and Sainsbury's` · `Explaining a product in thirty seconds to someone who didn't ask. Still the best test of whether a feature makes sense.`
  - `2010 — 2014` · `Customer service assistant` · `Tesco Superstore, Sheffield` · `Four years of questions from the public. Most problems are clarity problems.`
- Education sub-list H3 `Education`: MA Public Relations, Advertising and Applied Communication — Sheffield Hallam University, 2015–2017 · BA Business Management — Sheffield Hallam University, 2011–2014 · Access to Higher Education — Barnsley College, 2010–2011 (elected Student Governor).

**Tracker**
- Note: `Live demo`
- H2: `GitHub activity, in plain English`
- Body: `This is the browser version of my <a>github_user_tracker</a> CLI. Type any GitHub username and it reads their latest public events straight from GitHub's API — nothing goes through a server of mine.`
- Label: `GitHub username`; placeholder `e.g. torvalds`; button `Fetch activity`.
- Chips label: `Try:` → `torvalds`, `gaearon`, `sindresorhus`.
- Prompt line before results (mono): `$ github-activity <username>`
- States: idle `Results will appear here.`; loading `Fetching public events for @{u}…`; empty `No public activity for @{u} in the last 90 days. GitHub only shares public events from that window.`; 404 `There's no GitHub user called @{u}. Check the spelling?`; rate limit (403/429) `GitHub's limit for anonymous requests has been reached from your network. It resets within the hour.`; network `Couldn't reach GitHub. Check your connection and try again.`; invalid `GitHub usernames use letters, numbers and single hyphens, up to 39 characters.`
- Event sentences: Push `Pushed {n} commit(s) to {repo}` (if commit list absent: `Pushed to {repo}`; include branch if `ref` present: `Pushed to main in {repo}`), Issues `{Action} an issue in {repo}`, Watch `Starred {repo}`, Create `Created {ref_type} {ref?} in {repo}` (repo: `Created repository {repo}`), Delete `Deleted {ref_type} {ref} in {repo}`, Fork `Forked {repo}`, PullRequest `{Action} a pull request in {repo}`, PullRequestReview `Reviewed a pull request in {repo}`, IssueComment `Commented on an issue in {repo}`, Release `Published a release in {repo}`, Public `Made {repo} public`, Member `Added a collaborator to {repo}`, fallback `{Type without "Event"} in {repo}`. Each row also shows relative time (`3h ago`, `2d ago`, absolute date in `title`/`<time datetime>`), and repo links to github.com.
- Footnote: `Shows up to 30 recent public events. Private work, like Both Homes, doesn't appear here.`

**About**
- Note: `Off the clock`
- H2: `The rest of the week`
- Body: `I'm a dad of two, so most of what I build gets tested against a busy family week. I taught myself to code, and I treat it the way I treat salsa and tennis: you get better by turning up every week.`
- Facts list: `Salsa — ran the university Salsa Society as president.` · `Tennis — once a week, every week.` · `Meditation — a daily habit, and the reason I value calm software.` · `Studied — PR, advertising and business at Sheffield Hallam.`

**Contact**
- Note: `Contact`
- H2: `Say hello`
- Body: `I'm open to developer and product roles, collaborations, and conversations with anyone who's thought hard about co-parenting tools. I read everything that comes through this form.`
- Fields: `Your name`, `Email`, `Message` (with hint `A few lines is plenty.`), button `Send message`. Errors: `Please add your name.`, `Please add an email address I can reply to.`, `That email address doesn't look right.`, `Please write a short message.` Submitting state `Sending…`. Failure: `That didn't send. Please try again, or message me on LinkedIn.`
- Alt links: `LinkedIn ↗`, `GitHub ↗`.

**Thanks page**: H1 `Thanks — message received.` body `I'll reply to the email you gave, usually within a few days.` link `← Back to the site`.

**404**: H1 `This page isn't here.` body `It may have moved, or the link may be mistyped.` link `Go to the homepage`.

**Case study /work/both-homes/** (meta title `Both Homes — case study · Bryan Agas`):
- Breadcrumb `Work / Both Homes`; label `Case study · 2026`
- H1 `Both Homes: one calm answer to "where is my child tonight?"`
- Lede: `A shared calendar for separated parents that I designed, built and publish on my own. It runs as an iOS app (in public TestFlight while the App Store listing is finalised) and as a web app for Android and computers.`
- Facts list (dl): Role `Everything: product, design, engineering, policy` · Platforms `iOS, web` · Public site `React, TypeScript, Vite, Tailwind, Vitest, Playwright, Netlify` · Status `Live; App Store listing pending`
- Section `The problem` — `When a child lives across two homes, the schedule is the thing everyone has to agree on and the thing most likely to start an argument. Group chats bury it, shared generic calendars let anyone change anything, and the question a child or a parent actually asks is simple: where am I sleeping tonight?`
- Section `The idea` — `Answer that one question so clearly that there's nothing to argue about. Set the pattern once and every night is laid out months ahead, one colour per home, in the same place for both homes.` + the illustration.
- Section `Decisions that shaped it` — four items:
  1. `Nothing moves without agreement.` `A change is a request that the other parent answers. The calendar only updates once the required decisions are made, so neither parent wakes up to a surprise.`
  2. `Notes live on the day.` `Swimming kit, a passport, a dentist appointment. A short note attached to a night means both homes see it in context, not lost in a chat thread.`
  3. `Private by default.` `No public links. An invitation goes to one email address, works once and expires after seven days. People can export their data or ask for deletion from the site.`
  4. `A free tier that's genuinely useful.` `One calendar, two homes, templates and a few shared requests a month are free, and so is viewing and responding. Plus (£3.99 a month or £34.99 a year) adds calendars and lets a decision-maker sponsor a child's calendar. The 14-day trial asks for no payment details and doesn't auto-renew. (Prices as of October 2026.)`
- Section `How it's built and shipped` — `The public site is React and TypeScript on Vite and Tailwind, with unit tests in Vitest and browser tests in Playwright. Publishing goes through a script that refuses to push unless the branch, working tree and checks are clean, and the release checklist ends with checking the deployed commit and the live routes. Terms, a privacy policy and a page for exporting or deleting your data ship with the product.`
- Section `What I'd tell the next person building in this space` — `Tone is a feature. Every label and notification is read by someone who may already be upset, so the copy is short, neutral and never takes a side.`
- CTA block: `Visit bothhomes.co.uk ↗` · `Get in touch about Both Homes →` (→ /#contact)
- Next: `← Back to all work`

## 6. Technical architecture

- Plain static HTML + one CSS file + one small ES module (no framework, no
  build step, no dependencies). Reason: content site, fastest possible, easy
  for Bryan to maintain.
- Files: `site/index.html`, `site/work/both-homes/index.html`,
  `site/thanks/index.html`, `site/404.html`, `site/assets/css/main.css`,
  `site/assets/js/main.js` (nav, form validation, tracker),
  `site/assets/js/tracker.js` (pure functions: validate username, describe
  event, relative time — importable by tests), `site/favicon.svg`,
  `site/og.png` (1200×630), `site/robots.txt`, `site/sitemap.xml`,
  `site/site.webmanifest`, `netlify.toml` at repo root (publish `site`,
  headers incl. CSP, caching, 404).
- Canonical domain: use `https://bryan-agas.netlify.app` (to be confirmed at
  deploy; keep in one place per page).
- JSON-LD `Person` on home (name, url, sameAs GitHub + LinkedIn, jobTitle
  "Product builder") and `SoftwareApplication` on the case study.
- Tests: `tests/tracker.test.mjs` with `node --test` for the pure functions;
  Playwright smoke script for pages, nav, form validation, tracker (mocked
  API), axe-free basic a11y checks, no console errors, no horizontal scroll
  at 360/768/1280/1600.
- Python CLI stays; make `display_event` tolerant of missing payload fields
  (GitHub no longer always includes commit lists in push events).

## 7. Scout research adjustments (applied)

Evidence: recruiters form a view in ~30s and filter portfolios that don't show
skills fast (Rumie, CodeSignal, DevPlaybook); original work beats tutorial
clones (Scrimba); 3–5 projects with problem → decisions → outcome
(PW Skills); broken links are the top killer (DevPlaybook); career changers
should translate earlier jobs into skills (Help Scout, 2U).
Applied: stack line above the fold; contact in hero + footer; each work item
carries one-line description, stack and code link; the Path section translates
each job into a product lesson; MyCV is framed as the starting point, not a
showcase; employer/religious names from the 2022 CV are generalised; no
Redshift schema details or the repo's spreadsheet are shown.
