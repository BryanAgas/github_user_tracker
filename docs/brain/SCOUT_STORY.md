# SCOUT: "My Brain" story and content model

Prototype phase. Source rules: `STUDIO_SPEC.md` §1 (verified facts, do-not-publish list), §2 (positioning), §5 (voice), and `BRAIN_BRIEF.md` (compartments, "to confirm" items). Every node carries `source`: **VERIFIED** (stated in §1 or in the settled copy deck) or **CONFIRM** (from the brief's "observed in workspace" list: AI studio, agent product-research workflow, Idea Bank, Supabase backend and AI-app-builder repo, n8n). CONFIRM nodes are fine in the private prototype but must be flagged to Bryan and checked before going public.

Content rules applied: no user numbers, testimonials or outcomes for Both Homes; no phone, email or address; no employer claim for the data dictionary; no `task_tracker`; no `rork-both-homes` link (repo URL not verified); meditation-centre employers generalised as in §5; no invented product ideas (IDEAS holds the capture method and open questions only). Only links used: `bothhomes.co.uk`, `github.com/BryanAgas/{github_user_tracker,data-dictionary-app,MyCV}`, `linkedin.com/in/bryanagas`.

## 1. Research: what immersive portfolios get right and wrong

Note: most page fetches were blocked by the egress proxy (usepastel, threejs discourse, MDN, svilenkovic, hada.io). Lessons below are drawn from search-result summaries of the cited pages; treat quotes as paraphrase.

1. **The experience must be the proof, not a wrapper.** Bruno Simon's drivable 3D portfolio is remembered because the site itself demonstrates the skill being sold; it passed 400,000 visits and won Awwwards recognition ([Creative Bloq](https://www.creativebloq.com/news/3d-car-portfolio), [Pastel](https://usepastel.com/blog/how-a-design-portfolio-got-the-attention-of-400-000-visitors), [Elementor](https://elementor.com/blog/best-portfolio-website-examples/)). For Bryan, the brain must *say something true about how he thinks* (the synapses are real causal links: Tesco → clarity → tracker), not be neural wallpaper. His 2025 rebuild leans on craft details such as spatialised ambient sound ([Pasquale Pillitteri](https://pasqualepillitteri.it/es/news/7263/experiencias-web-3d-threejs-webgl)): small, polished details read as "premium" more than scale does.
2. **Recruiters decide in seconds, so a plain path must be visible on frame one.** The Ladders eye-tracking study found an average 7.4-second initial screen; winners had simple layouts, clear headings and F/E-pattern scanning; clutter and missing headers lost ([HR Dive](https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/)). → Hero text, the positioning line, "Start with Both Homes" and a "Read it as a list" link must render as HTML before any WebGL.
3. **Load time kills 3D portfolios.** Practitioners report recruiters pass over portfolios that take more than ~5 seconds and advise putting real-time 3D in an optional layer with static content as the main path ([Polycount](https://polycount.com/discussion/comment/1871390)). → Ship the brain as progressive enhancement: content first, canvas lazy, a poster/SVG brain while it loads.
4. **Mobile GPUs are where 3D breaks.** Slow first paint from 3D blocking render and crashes from GPU memory limits are the common mobile failures ([3D website troubleshooting](https://svilenkovic.com/3d/3d-website-troubleshooting); WebGL mobile performance study, [UNIR](https://reunir.unir.net/items/245800a5-2e76-4a16-a87f-06219647fa7f/full)). → On small screens use a 2D/SVG brain (compartments as large tappable regions, nodes as a list sheet), capped particle counts, pause when off-screen or tab hidden.
5. **Label everything; no mystery meat.** Navigation whose targets are hidden until hover adds cognitive load ([Wikipedia: Mystery meat navigation](https://en.wikipedia.org/wiki/Mystery_meat_navigation)); NN/g's position is that icons need visible text labels ([freeCodeCamp summarising NN/g](https://www.freecodecamp.org/news/material-design-and-the-mystery-meat-navigation-problem-65425fb5b52e/)). → Compartment names always visible in caps (PROJECTS, SKILLS…), node titles visible on focus/tap, not only on hover; a persistent "Where am I" breadcrumb (Brain › Mindset › Calm beats clever).
6. **Don't hijack scroll.** Scrolljacking overrides expected behaviour, breaks with assistive tech and punishes skimmers ([Webdesigner Depot](https://webdesignerdepot.com/how-scrolljacking-breaks-ux-fundamentals/)). → Native scroll for the list view and node panels; camera moves only on explicit click/keypress.
7. **Motion must be optional.** WCAG 2.3.3 asks that interaction-triggered motion can be disabled; vestibular reactions include dizziness and nausea; `prefers-reduced-motion` is the sufficient technique ([W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)). → Reduced motion: static brain, synapses drawn as still lines, instant panel transitions, plus a visible "Calm mode" toggle (on-brand with "calm beats clever").
8. **Gamified CVs win attention but "won't work for everyone".** Robby Leonardi's Mario-style CV went viral and got him hired, but coverage notes it suits creative roles specifically ([HR Online](https://www.humanresourcesonline.net/look-a-super-mario-inspired-interactive-cv), [CareerShift](https://careershift.com/blog/2016/09/job-seekers-get-creative-not-desperate-happens)). Bryan targets developer/product roles, so → no game mechanics gating content; exploration is a bonus layer over a readable story. Guided **thought trails** give the cinematic feel with a fixed, skimmable order and a "Next thought →" button.

**Design implications in one line each for Nova/Forge:** HTML-first content; brain = enhancement; visible labels; trails with Next/Prev; list view toggle always on screen; 2D brain on mobile; reduced-motion + calm-mode; no scroll hijack; LinkedIn/GitHub reachable in one tap from anywhere.

## 2. Hero

Eyebrow: `Bryan Agas · Product builder, UK`

1. I build calm software for the parts of life that get messy. This is the brain behind it.
2. Everything I've built started as a thought somewhere in here. Follow one.
3. Shop floor, kitchens, then code. Step inside and see how it connects.

**Recommended: option 1.** It keeps the positioning anchor word for word and adds the brain concept in five words, so a recruiter gets what Bryan does before they get the gimmick. Options 2 and 3 work as the sub-line or the loading line.

Sub: Pick a part of my brain, or follow a thought from one part to the next. Everything here is also in the plain list below.

CTAs: Start with Both Homes · Follow a thought · Get in touch

Status: `Now: shipping Both Homes on iOS and the web`

## 3. Compartments and thought nodes

### PROJECTS — Things I've built and put in public.

#### `p-bothhomes` Both Homes · VERIFIED
*One calm answer to: where is my child tonight?*

A shared calendar for separated parents. I designed, built and publish it on my own. You set the pattern once and every night is laid out months ahead, one colour per home. Changes are asked for and answered, so nothing moves without agreement. Notes sit on the day they belong to. It runs on iOS through public TestFlight and as a web app for Android and computers.

Facts: `iOS (TestFlight) · Web app · Free + Plus`  
Link: [Visit bothhomes.co.uk ↗](https://bothhomes.co.uk)

#### `p-bothhomes-decisions` Both Homes: the decisions · VERIFIED
*Four choices that shaped it more than any feature.*

A change is a request the other parent answers. Notes live on the night, not in a chat. There are no public links: an invitation goes to one email, works once and expires after seven days. And the free tier is useful on its own. Plus is £3.99 a month or £34.99 a year, and the 14-day trial asks for no card and doesn't auto-renew.

Facts: `Invite-only · Data export + deletion · Prices as of Oct 2026`  
Link: [Visit bothhomes.co.uk ↗](https://bothhomes.co.uk)

#### `p-tracker` GitHub activity tracker · VERIFIED
*Public GitHub events, turned into plain sentences.*

A command-line tool in Python, standard library only. Give it a username and it reads that person's public events from GitHub's API, then prints them as readable lines: pushed to this repo, starred that one. It handles the boring cases properly too, like a username that doesn't exist or a request that fails. Small, but it taught me to respect error states.

Facts: `Python · Standard library only · 2024`  
Link: [Code on GitHub ↗](https://github.com/BryanAgas/github_user_tracker)

#### `p-datadict` Data dictionary search · VERIFIED
*Type a column name. Get back what it means.*

A desktop search over a spreadsheet of Redshift column definitions. Type a column and it tells you the description, the table, the schema and the database. I built it to stop scrolling through a spreadsheet to answer one question. It uses Python, pandas and Tkinter, and there's a plain HTML and JavaScript version for the browser too.

Facts: `Python · pandas · Tkinter · HTML/JS · 2024`  
Link: [Code on GitHub ↗](https://github.com/BryanAgas/data-dictionary-app)

#### `p-mycv` MyCV · VERIFIED
*The first website I wrote by hand.*

A plain, multi-page CV in HTML, from January 2022. It isn't clever and I don't pretend it is. I keep it public because it's where this started: the first site I wrote line by line and put online. Everything else in this brain grew out of it.

Facts: `HTML · Jan 2022`  
Link: [Code on GitHub ↗](https://github.com/BryanAgas/MyCV)

### SKILLS — What I can do, and where each one came from.

#### `s-web` TypeScript and React · VERIFIED
*The stack behind the Both Homes site.*

The public Both Homes site is React and TypeScript, built with Vite and styled with Tailwind CSS, deployed on Netlify. I learned it because the product needed it. A product site has to load fast, read clearly on a phone and be safe to change. That's the standard I hold this work to.

Facts: `TypeScript · React · Vite · Tailwind CSS · Netlify`  

#### `s-testing` Testing and shipping safely · VERIFIED
*A publish script that refuses to push a mess.*

The Both Homes site has unit tests in Vitest and browser tests in Playwright. Publishing goes through a script that checks the branch, checks the working tree is clean and runs validation before anything is pushed. The checklist ends with looking at the live site: the deployed commit and the public routes. Shipped means checked, not just sent.

Facts: `Vitest · Playwright · Publish checks`  

#### `s-python` Python · VERIFIED
*Small tools that answer one question well.*

I use Python for tools that save someone a job. The GitHub tracker uses nothing but the standard library: an HTTP client and JSON. The data dictionary search uses pandas to read a spreadsheet and Tkinter for a simple desktop window. Neither is big. Both do one thing and handle the cases where things go wrong.

Facts: `http.client · json · pandas · Tkinter`  

#### `s-html-css` HTML and CSS · VERIFIED
*Where it started, and still the bit I check first.*

My first site was hand-written HTML in 2022. I still start there. If a page makes sense with the styles and scripts stripped away, it will make sense to a screen reader, a slow phone and a tired parent. Everything clever goes on top of that, never instead of it.

Facts: `Semantic HTML · CSS · Since 2022`  

#### `s-product` Product, pricing and policy · VERIFIED
*The parts of shipping that aren't code.*

On Both Homes I do everything: product, design, engineering and policy. That meant deciding what's free and what's paid, writing terms and a privacy policy, and building a way for people to export their data or ask for it to be deleted. My business degree helps here, and so do twelve years of working with customers face to face.

Facts: `Pricing · Terms · Privacy · BA Business Management`  

#### `s-words` Plain words · VERIFIED
*Copy is part of the interface.*

I studied public relations, advertising and communication to MA level, then spent five years explaining products to people who hadn't asked. In software that turns into labels, notifications and error messages. In Both Homes, every message may be read by someone who's already upset, so it's short, neutral and never takes a side.

Facts: `MA PR, Advertising & Applied Communication · Merit`  

### EXPERIENCE — Tills, sales floors, kitchens, then code.

#### `e-building` Building software · VERIFIED
*From a hand-coded CV to a shipped product.*

Self-taught, from 2022. I started with a plain HTML CV and kept going: Python tools in 2024, then Both Homes, a product with pricing, a privacy policy, data export and tests. Nobody handed me a curriculum. I learned each thing because the next thing I wanted to build needed it.

Facts: `2022 – now · Self-taught`  

#### `e-cafe` Cafe assistant manager · VERIFIED
*Systems only work if the person on shift can follow them.*

At a meditation centre café, from January 2021 to January 2022. I wrote rotas, planned menus, did the ordering, trained new staff and helped HR with recruitment. The lesson I took into software: a system is only as good as what the person on shift at 8am can follow without asking anyone.

Facts: `Jan 2021 – Jan 2022 · Rotas · Ordering · Training`  

#### `e-kitchen` Kitchen assistant to acting manager · VERIFIED
*Started as an assistant. Ended up running the kitchen.*

A full-time volunteer role in a meditation centre kitchen, September 2019 to December 2020. I started as a kitchen assistant and spent six months as acting kitchen manager. Menus, budgets, rotas and a team to look after. A busy kitchen teaches you that calm is a skill, and that it spreads.

Facts: `Sep 2019 – Dec 2020 · Volunteer · 6 months acting manager`  

#### `e-sales` Sales representative · VERIFIED
*Thirty seconds to explain a product to a stranger.*

Agency roles for brands including Samsung, LG, Aldi and Sainsbury's, from 2014 to 2019. The job was explaining a product in thirty seconds to someone who didn't ask. It's still the best test I know of whether a feature makes sense. If I can't say what it does that quickly, it isn't ready.

Facts: `Apr 2014 – Jun 2019 · Samsung · LG · Aldi · Sainsbury's`  

#### `e-tesco` Customer service assistant · VERIFIED
*Four years of questions from the public.*

Tesco Superstore in Sheffield, October 2010 to June 2014. Four years on the shop floor answering whatever people asked. Most of the time the problem wasn't the product or the price. It was that something hadn't been made clear. I still think most problems are clarity problems, and I build like it.

Facts: `Oct 2010 – Jun 2014 · Sheffield`  

#### `e-education` Education · VERIFIED
*Business, then communication. Both show up in the work.*

An Access to Higher Education course at Barnsley College, where I was elected Student Governor. Then a BA in Business Management and an MA in Public Relations, Advertising and Applied Communication, both at Sheffield Hallam and both with merit. At university I was also president of the Salsa Society.

Facts: `MA 2015–17 · BA 2011–14 · Access to HE 2010–11`  

### MINDSET — How I think, shown by what I've built.

#### `m-calm` Calm beats clever · VERIFIED
*Software for tense moments should lower the temperature.*

I meditate every day, and I've worked in kitchens where calm was the difference between service and chaos. So I build for calm. Both Homes has one colour per home, one question answered, and messages that never take a side. The clever version would do more. The calm version gets used when people are already stressed.

Facts: `Evidence: Both Homes tone · Daily meditation`  

#### `m-clarity` Most problems are clarity problems · VERIFIED
*Before building more, make the existing thing clearer.*

Four years on a Tesco shop floor taught me this. People rarely needed something new. They needed the thing in front of them explained. It's why the GitHub tracker prints sentences, not raw data, and why the data dictionary exists at all. When something isn't working, I look for what isn't clear before I look for what's missing.

Facts: `Evidence: tracker, data dictionary`  

#### `m-agreement` Nothing moves without agreement · VERIFIED
*Shared things change only when both sides say yes.*

In Both Homes, a change to the schedule is a request. The other parent answers it, and the calendar only updates once the decision is made. Nobody wakes up to a surprise. I think that rule works beyond calendars. When something is shared, the tool should protect the agreement, not let the fastest person win.

Facts: `Evidence: Both Homes change requests`  

#### `m-privacy` Private by default · VERIFIED
*Family data shouldn't be one link away from a stranger.*

Both Homes has no public links. An invitation goes to one email address, works once and expires after seven days. People can export their data or ask for it to be deleted. Even the GitHub tracker's browser version talks straight to GitHub, not through a server of mine. I'd rather collect less than explain more.

Facts: `Single-use invites · Export + deletion`  

#### `m-ship` Shipped means checked · VERIFIED
*It isn't done until I've seen it live.*

A release isn't finished when I press publish. It's finished when I've looked at the live site and checked the right commit is there and the public pages load. The Both Homes publish script won't push from the wrong branch or a messy working tree. Boring guardrails mean I can ship often without worrying.

Facts: `Evidence: publish script, release checklist`  

#### `m-turn-up` Turn up every week · VERIFIED
*Code, salsa and tennis all get better the same way.*

I taught myself to code, and I treat it the way I treat salsa and tennis: you get better by turning up every week, not by waiting to feel ready. I'm a dad of two, so the time is short and fixed. Small, regular steps took me from a hand-coded CV to a shipped product.

Facts: `Salsa · Tennis weekly · Dad of two`  

### CURRENT WORK — What I'm building right now.

#### `c-appstore` Getting Both Homes into the App Store · VERIFIED
*Live on TestFlight and the web. App Store next.*

Both Homes is live: the iOS app is in public TestFlight, the web app runs at app.bothhomes.co.uk for Android and computers, and the site is at bothhomes.co.uk. The App Store listing is the step I'm working on now. It's the slow, careful part, because a listing is often the first thing a parent sees.

Facts: `Status: App Store listing pending`  
Link: [Visit bothhomes.co.uk ↗](https://bothhomes.co.uk)

#### `c-backend` The Both Homes app backend · CONFIRM
*A Supabase-backed app behind the calendar.*

The Both Homes app runs on Supabase. The data behind the calendar sits there, so it's where the rule that nothing moves without agreement has to hold. The interface can promise agreement. The backend has to keep that promise, for both parents, every time.

Facts: `Supabase`  

#### `c-this-brain` This brain · CONFIRM
*You're standing inside the current project.*

This portfolio is something I'm building right now, with a small team of AI agents I direct. One researches, one designs, one builds and one reviews, and an orchestrator keeps them on brief. I decide what it says and whether it's good enough. You're looking at the prototype stage.

Facts: `Prototype · AI studio`  

#### `c-family-week` Tested against a real week · VERIFIED
*The test environment is a busy family week.*

I'm a dad of two, so most of what I build gets tested against a busy family week before anyone else sees it. That's a harsh test. If something takes three taps when one would do, or a message reads badly first thing in the morning, I'll notice. It keeps the work honest and the scope small.

Facts: `Dad of two`  

### EXPERIMENTS — AI, data, automation and agent work.

#### `x-studio` An AI studio I direct · CONFIRM
*Research, design, engineering and QA, each its own agent.*

I'm testing how far one person can go by directing AI agents like a small studio. Each has one job: research, design, engineering or independent review, with an orchestrator passing work between them and a checkpoint where I approve or stop it. The useful part isn't speed. It's that each step leaves something I can read and question.

Facts: `Orchestrator · Research · Design · Engineering · QA`  

#### `x-product-research` Agents for product research · CONFIRM
*Scout, vet, build, audit: a workflow, not a guess.*

For an e-commerce side project I set up a multi-agent workflow with four roles: a scout finds candidates, a vetter checks them, a builder prepares them and an auditor reviews the result. Splitting the work this way means one agent's enthusiasm gets checked by another. It's the same principle as nothing moving without agreement.

Facts: `Scout · Vetter · Builder · Auditor`  

#### `x-ai-builder` Prototyping with an AI app builder · CONFIRM
*An early Both Homes, built fast to learn fast.*

An early version of Both Homes started in an AI app builder. It was a quick way to see the idea on a screen and find out what mattered before committing to anything. The question it answered carried through to what's live now: where is my child tonight?

Facts: `Early repo · AI app builder`  

#### `x-automation` Automation with n8n · CONFIRM
*Connecting tools so the dull steps run themselves.*

I have n8n connected to my tools. I'm using it to learn where automation earns its place and where it just moves the mess somewhere harder to see. The cafe taught me that a system nobody understands is worse than no system, so I want every flow to be small enough to explain.

Facts: `n8n`  

#### `x-two-runtimes` One tool, two runtimes · VERIFIED
*Same search, as a desktop app and a web page.*

The data dictionary search exists twice: once in Python with pandas and Tkinter on the desktop, and once in plain HTML and JavaScript in the browser. Building it both ways showed me where the logic really lives and how much of an app is just its window. It's a small experiment I still learn from.

Facts: `Python · HTML/JS`  
Link: [Code on GitHub ↗](https://github.com/BryanAgas/data-dictionary-app)

### IDEAS — Ideas in progress, and how they get caught.

#### `i-idea-bank` The Idea Bank · CONFIRM
*Every raw idea gets written down, expanded and scored.*

Ideas arrive at bad times: on the school run, mid-rally, in the middle of a shift. So I don't trust memory. Each raw idea goes into a workbook, gets expanded into something I can actually judge, and gets a score. Scoring is how I decide which ones deserve time. Writing them down is how I stop chasing all of them.

Facts: `Capture · Expand · Score`  

#### `i-one-question` Open question: what else needs one calm answer? · VERIFIED
*Both Homes answers one question. What are the others?*

Both Homes works because it answers one question so clearly there's nothing to argue about. I keep asking where else that applies. Which other shared, emotional, everyday decisions would be easier if one plain screen just answered them? I don't have the answer yet. This is where the question lives while I think about it.


#### `i-spreadsheets` Open question: what still runs on a spreadsheet and a chat? · VERIFIED
*Look for the job people do by scrolling.*

The data dictionary existed because people were scrolling a spreadsheet to answer one question. Both Homes exists partly because group chats bury the schedule. Both started the same way: someone doing a small, repeated job the hard way. I keep an eye out for the next one. It usually looks too boring to notice.


#### `i-one-person` Open question: how much can one person run well? · CONFIRM
*Agents make more possible. Not all of it is wise.*

With agents doing research, design, engineering and review, one person can make much more than before. The open question for me is what should stay human. Deciding what a product says to someone who's upset, choosing what's free, approving a release: so far I keep those. I'm still working out where the line sits.


## 4. Synapses (follow the thought)

| From | To | Why these connect |
|---|---|---|
| `p-bothhomes` | `s-web` | The site runs on this stack |
| `p-bothhomes` | `e-tesco` | Clear answers learned at a till |
| `p-bothhomes` | `m-calm` | Calm tool for a tense situation |
| `p-bothhomes-decisions` | `m-agreement` | The rule behind change requests |
| `p-bothhomes-decisions` | `m-privacy` | Single-use invites, no public links |
| `p-bothhomes-decisions` | `s-product` | Pricing and policy are product decisions |
| `p-tracker` | `s-python` | Standard library only, by choice |
| `p-tracker` | `m-clarity` | Raw events turned into sentences |
| `p-datadict` | `x-two-runtimes` | Same tool, desktop and browser |
| `p-datadict` | `i-spreadsheets` | Born from scrolling a spreadsheet |
| `p-mycv` | `s-html-css` | Where the HTML habit started |
| `p-mycv` | `e-building` | The first step on the path |
| `s-testing` | `m-ship` | Guardrails that make shipping safe |
| `s-words` | `e-sales` | Thirty-second explanations became UI copy |
| `s-words` | `m-calm` | Neutral wording for upset readers |
| `s-product` | `e-education` | Business degree, used for real |
| `e-cafe` | `x-automation` | Systems people on shift can follow |
| `e-kitchen` | `m-calm` | Calm learned in a busy kitchen |
| `e-tesco` | `m-clarity` | Where the clarity rule came from |
| `e-sales` | `c-appstore` | A listing is a thirty-second pitch |
| `m-turn-up` | `e-building` | Weekly practice, self-taught code |
| `m-turn-up` | `c-family-week` | Short, fixed time as a dad |
| `m-agreement` | `x-product-research` | One agent checks another's work |
| `c-backend` | `m-agreement` | Where the agreement rule must hold |
| `c-this-brain` | `x-studio` | This site is the studio's output |
| `x-studio` | `i-one-person` | Raises what should stay human |
| `x-ai-builder` | `p-bothhomes` | The early prototype of Both Homes |
| `i-one-question` | `p-bothhomes` | The one-question pattern, generalised |
| `i-idea-bank` | `x-product-research` | Both are structured ways to judge candidates |
| `c-family-week` | `p-bothhomes` | Built and tested by a parent |

Every synapse crosses compartments. Hubs: `p-bothhomes` (6 links), `m-calm`, `m-agreement`, `m-clarity`. Node panels should list a node's synapses as "Connected thoughts" buttons, in both directions.

## 5. Thought trails

**How Both Homes happened** — From a till in Sheffield to a calendar two homes agree on.  
`e-tesco` → `m-clarity` → `x-ai-builder` → `p-bothhomes` → `m-agreement` → `c-appstore`

**From the shop floor to the command line** — Twelve years serving people, and what each job left behind.  
`e-tesco` → `e-sales` → `e-kitchen` → `e-cafe` → `p-mycv` → `e-building`

**How I work with AI** — Agents do the legwork. I keep the decisions.  
`x-ai-builder` → `x-product-research` → `x-studio` → `c-this-brain` → `i-one-person`

## 6. Flags for Bryan before going public

- `c-backend` The Both Homes app backend
- `c-this-brain` This brain
- `x-studio` An AI studio I direct
- `x-product-research` Agents for product research
- `x-ai-builder` Prototyping with an AI app builder
- `x-automation` Automation with n8n
- `i-idea-bank` The Idea Bank
- `i-one-person` Open question: how much can one person run well?
- Prices are stated "as of Oct 2026"; re-check at launch.

## 7. Content model (JSON)

```json
{
  "hero": {
    "recommended": "I build calm software for the parts of life that get messy. This is the brain behind it.",
    "options": [
      "I build calm software for the parts of life that get messy. This is the brain behind it.",
      "Everything I've built started as a thought somewhere in here. Follow one.",
      "Shop floor, kitchens, then code. Step inside and see how it connects."
    ],
    "eyebrow": "Bryan Agas · Product builder, UK",
    "sub": "Pick a part of my brain, or follow a thought from one part to the next. Everything here is also in the plain list below.",
    "ctas": [
      {
        "label": "Start with Both Homes",
        "to": "p-bothhomes"
      },
      {
        "label": "Follow a thought",
        "to": "trail:both-homes"
      },
      {
        "label": "Get in touch",
        "href": "https://www.linkedin.com/in/bryanagas/"
      }
    ],
    "status": "Now: shipping Both Homes on iOS and the web"
  },
  "compartments": [
    {
      "id": "projects",
      "label": "PROJECTS",
      "tagline": "Things I've built and put in public.",
      "nodes": [
        {
          "id": "p-bothhomes",
          "title": "Both Homes",
          "hook": "One calm answer to: where is my child tonight?",
          "body": "A shared calendar for separated parents. I designed, built and publish it on my own. You set the pattern once and every night is laid out months ahead, one colour per home. Changes are asked for and answered, so nothing moves without agreement. Notes sit on the day they belong to. It runs on iOS through public TestFlight and as a web app for Android and computers.",
          "facts": [
            "iOS (TestFlight)",
            "Web app",
            "Free + Plus"
          ],
          "link": {
            "label": "Visit bothhomes.co.uk",
            "href": "https://bothhomes.co.uk"
          },
          "source": "VERIFIED"
        },
        {
          "id": "p-bothhomes-decisions",
          "title": "Both Homes: the decisions",
          "hook": "Four choices that shaped it more than any feature.",
          "body": "A change is a request the other parent answers. Notes live on the night, not in a chat. There are no public links: an invitation goes to one email, works once and expires after seven days. And the free tier is useful on its own. Plus is £3.99 a month or £34.99 a year, and the 14-day trial asks for no card and doesn't auto-renew.",
          "facts": [
            "Invite-only",
            "Data export + deletion",
            "Prices as of Oct 2026"
          ],
          "link": {
            "label": "Visit bothhomes.co.uk",
            "href": "https://bothhomes.co.uk"
          },
          "source": "VERIFIED"
        },
        {
          "id": "p-tracker",
          "title": "GitHub activity tracker",
          "hook": "Public GitHub events, turned into plain sentences.",
          "body": "A command-line tool in Python, standard library only. Give it a username and it reads that person's public events from GitHub's API, then prints them as readable lines: pushed to this repo, starred that one. It handles the boring cases properly too, like a username that doesn't exist or a request that fails. Small, but it taught me to respect error states.",
          "facts": [
            "Python",
            "Standard library only",
            "2024"
          ],
          "link": {
            "label": "Code on GitHub",
            "href": "https://github.com/BryanAgas/github_user_tracker"
          },
          "source": "VERIFIED"
        },
        {
          "id": "p-datadict",
          "title": "Data dictionary search",
          "hook": "Type a column name. Get back what it means.",
          "body": "A desktop search over a spreadsheet of Redshift column definitions. Type a column and it tells you the description, the table, the schema and the database. I built it to stop scrolling through a spreadsheet to answer one question. It uses Python, pandas and Tkinter, and there's a plain HTML and JavaScript version for the browser too.",
          "facts": [
            "Python",
            "pandas",
            "Tkinter",
            "HTML/JS",
            "2024"
          ],
          "link": {
            "label": "Code on GitHub",
            "href": "https://github.com/BryanAgas/data-dictionary-app"
          },
          "source": "VERIFIED"
        },
        {
          "id": "p-mycv",
          "title": "MyCV",
          "hook": "The first website I wrote by hand.",
          "body": "A plain, multi-page CV in HTML, from January 2022. It isn't clever and I don't pretend it is. I keep it public because it's where this started: the first site I wrote line by line and put online. Everything else in this brain grew out of it.",
          "facts": [
            "HTML",
            "Jan 2022"
          ],
          "link": {
            "label": "Code on GitHub",
            "href": "https://github.com/BryanAgas/MyCV"
          },
          "source": "VERIFIED"
        }
      ]
    },
    {
      "id": "skills",
      "label": "SKILLS",
      "tagline": "What I can do, and where each one came from.",
      "nodes": [
        {
          "id": "s-web",
          "title": "TypeScript and React",
          "hook": "The stack behind the Both Homes site.",
          "body": "The public Both Homes site is React and TypeScript, built with Vite and styled with Tailwind CSS, deployed on Netlify. I learned it because the product needed it. A product site has to load fast, read clearly on a phone and be safe to change. That's the standard I hold this work to.",
          "facts": [
            "TypeScript",
            "React",
            "Vite",
            "Tailwind CSS",
            "Netlify"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "s-testing",
          "title": "Testing and shipping safely",
          "hook": "A publish script that refuses to push a mess.",
          "body": "The Both Homes site has unit tests in Vitest and browser tests in Playwright. Publishing goes through a script that checks the branch, checks the working tree is clean and runs validation before anything is pushed. The checklist ends with looking at the live site: the deployed commit and the public routes. Shipped means checked, not just sent.",
          "facts": [
            "Vitest",
            "Playwright",
            "Publish checks"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "s-python",
          "title": "Python",
          "hook": "Small tools that answer one question well.",
          "body": "I use Python for tools that save someone a job. The GitHub tracker uses nothing but the standard library: an HTTP client and JSON. The data dictionary search uses pandas to read a spreadsheet and Tkinter for a simple desktop window. Neither is big. Both do one thing and handle the cases where things go wrong.",
          "facts": [
            "http.client",
            "json",
            "pandas",
            "Tkinter"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "s-html-css",
          "title": "HTML and CSS",
          "hook": "Where it started, and still the bit I check first.",
          "body": "My first site was hand-written HTML in 2022. I still start there. If a page makes sense with the styles and scripts stripped away, it will make sense to a screen reader, a slow phone and a tired parent. Everything clever goes on top of that, never instead of it.",
          "facts": [
            "Semantic HTML",
            "CSS",
            "Since 2022"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "s-product",
          "title": "Product, pricing and policy",
          "hook": "The parts of shipping that aren't code.",
          "body": "On Both Homes I do everything: product, design, engineering and policy. That meant deciding what's free and what's paid, writing terms and a privacy policy, and building a way for people to export their data or ask for it to be deleted. My business degree helps here, and so do twelve years of working with customers face to face.",
          "facts": [
            "Pricing",
            "Terms",
            "Privacy",
            "BA Business Management"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "s-words",
          "title": "Plain words",
          "hook": "Copy is part of the interface.",
          "body": "I studied public relations, advertising and communication to MA level, then spent five years explaining products to people who hadn't asked. In software that turns into labels, notifications and error messages. In Both Homes, every message may be read by someone who's already upset, so it's short, neutral and never takes a side.",
          "facts": [
            "MA PR, Advertising & Applied Communication",
            "Merit"
          ],
          "source": "VERIFIED"
        }
      ]
    },
    {
      "id": "experience",
      "label": "EXPERIENCE",
      "tagline": "Tills, sales floors, kitchens, then code.",
      "nodes": [
        {
          "id": "e-building",
          "title": "Building software",
          "hook": "From a hand-coded CV to a shipped product.",
          "body": "Self-taught, from 2022. I started with a plain HTML CV and kept going: Python tools in 2024, then Both Homes, a product with pricing, a privacy policy, data export and tests. Nobody handed me a curriculum. I learned each thing because the next thing I wanted to build needed it.",
          "facts": [
            "2022 – now",
            "Self-taught"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "e-cafe",
          "title": "Cafe assistant manager",
          "hook": "Systems only work if the person on shift can follow them.",
          "body": "At a meditation centre café, from January 2021 to January 2022. I wrote rotas, planned menus, did the ordering, trained new staff and helped HR with recruitment. The lesson I took into software: a system is only as good as what the person on shift at 8am can follow without asking anyone.",
          "facts": [
            "Jan 2021 – Jan 2022",
            "Rotas",
            "Ordering",
            "Training"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "e-kitchen",
          "title": "Kitchen assistant to acting manager",
          "hook": "Started as an assistant. Ended up running the kitchen.",
          "body": "A full-time volunteer role in a meditation centre kitchen, September 2019 to December 2020. I started as a kitchen assistant and spent six months as acting kitchen manager. Menus, budgets, rotas and a team to look after. A busy kitchen teaches you that calm is a skill, and that it spreads.",
          "facts": [
            "Sep 2019 – Dec 2020",
            "Volunteer",
            "6 months acting manager"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "e-sales",
          "title": "Sales representative",
          "hook": "Thirty seconds to explain a product to a stranger.",
          "body": "Agency roles for brands including Samsung, LG, Aldi and Sainsbury's, from 2014 to 2019. The job was explaining a product in thirty seconds to someone who didn't ask. It's still the best test I know of whether a feature makes sense. If I can't say what it does that quickly, it isn't ready.",
          "facts": [
            "Apr 2014 – Jun 2019",
            "Samsung",
            "LG",
            "Aldi",
            "Sainsbury's"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "e-tesco",
          "title": "Customer service assistant",
          "hook": "Four years of questions from the public.",
          "body": "Tesco Superstore in Sheffield, October 2010 to June 2014. Four years on the shop floor answering whatever people asked. Most of the time the problem wasn't the product or the price. It was that something hadn't been made clear. I still think most problems are clarity problems, and I build like it.",
          "facts": [
            "Oct 2010 – Jun 2014",
            "Sheffield"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "e-education",
          "title": "Education",
          "hook": "Business, then communication. Both show up in the work.",
          "body": "An Access to Higher Education course at Barnsley College, where I was elected Student Governor. Then a BA in Business Management and an MA in Public Relations, Advertising and Applied Communication, both at Sheffield Hallam and both with merit. At university I was also president of the Salsa Society.",
          "facts": [
            "MA 2015–17",
            "BA 2011–14",
            "Access to HE 2010–11"
          ],
          "source": "VERIFIED"
        }
      ]
    },
    {
      "id": "mindset",
      "label": "MINDSET",
      "tagline": "How I think, shown by what I've built.",
      "nodes": [
        {
          "id": "m-calm",
          "title": "Calm beats clever",
          "hook": "Software for tense moments should lower the temperature.",
          "body": "I meditate every day, and I've worked in kitchens where calm was the difference between service and chaos. So I build for calm. Both Homes has one colour per home, one question answered, and messages that never take a side. The clever version would do more. The calm version gets used when people are already stressed.",
          "facts": [
            "Evidence: Both Homes tone",
            "Daily meditation"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "m-clarity",
          "title": "Most problems are clarity problems",
          "hook": "Before building more, make the existing thing clearer.",
          "body": "Four years on a Tesco shop floor taught me this. People rarely needed something new. They needed the thing in front of them explained. It's why the GitHub tracker prints sentences, not raw data, and why the data dictionary exists at all. When something isn't working, I look for what isn't clear before I look for what's missing.",
          "facts": [
            "Evidence: tracker, data dictionary"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "m-agreement",
          "title": "Nothing moves without agreement",
          "hook": "Shared things change only when both sides say yes.",
          "body": "In Both Homes, a change to the schedule is a request. The other parent answers it, and the calendar only updates once the decision is made. Nobody wakes up to a surprise. I think that rule works beyond calendars. When something is shared, the tool should protect the agreement, not let the fastest person win.",
          "facts": [
            "Evidence: Both Homes change requests"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "m-privacy",
          "title": "Private by default",
          "hook": "Family data shouldn't be one link away from a stranger.",
          "body": "Both Homes has no public links. An invitation goes to one email address, works once and expires after seven days. People can export their data or ask for it to be deleted. Even the GitHub tracker's browser version talks straight to GitHub, not through a server of mine. I'd rather collect less than explain more.",
          "facts": [
            "Single-use invites",
            "Export + deletion"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "m-ship",
          "title": "Shipped means checked",
          "hook": "It isn't done until I've seen it live.",
          "body": "A release isn't finished when I press publish. It's finished when I've looked at the live site and checked the right commit is there and the public pages load. The Both Homes publish script won't push from the wrong branch or a messy working tree. Boring guardrails mean I can ship often without worrying.",
          "facts": [
            "Evidence: publish script, release checklist"
          ],
          "source": "VERIFIED"
        },
        {
          "id": "m-turn-up",
          "title": "Turn up every week",
          "hook": "Code, salsa and tennis all get better the same way.",
          "body": "I taught myself to code, and I treat it the way I treat salsa and tennis: you get better by turning up every week, not by waiting to feel ready. I'm a dad of two, so the time is short and fixed. Small, regular steps took me from a hand-coded CV to a shipped product.",
          "facts": [
            "Salsa",
            "Tennis weekly",
            "Dad of two"
          ],
          "source": "VERIFIED"
        }
      ]
    },
    {
      "id": "current",
      "label": "CURRENT WORK",
      "tagline": "What I'm building right now.",
      "nodes": [
        {
          "id": "c-appstore",
          "title": "Getting Both Homes into the App Store",
          "hook": "Live on TestFlight and the web. App Store next.",
          "body": "Both Homes is live: the iOS app is in public TestFlight, the web app runs at app.bothhomes.co.uk for Android and computers, and the site is at bothhomes.co.uk. The App Store listing is the step I'm working on now. It's the slow, careful part, because a listing is often the first thing a parent sees.",
          "facts": [
            "Status: App Store listing pending"
          ],
          "link": {
            "label": "Visit bothhomes.co.uk",
            "href": "https://bothhomes.co.uk"
          },
          "source": "VERIFIED"
        },
        {
          "id": "c-backend",
          "title": "The Both Homes app backend",
          "hook": "A Supabase-backed app behind the calendar.",
          "body": "The Both Homes app runs on Supabase. The data behind the calendar sits there, so it's where the rule that nothing moves without agreement has to hold. The interface can promise agreement. The backend has to keep that promise, for both parents, every time.",
          "facts": [
            "Supabase"
          ],
          "source": "CONFIRM"
        },
        {
          "id": "c-this-brain",
          "title": "This brain",
          "hook": "You're standing inside the current project.",
          "body": "This portfolio is something I'm building right now, with a small team of AI agents I direct. One researches, one designs, one builds and one reviews, and an orchestrator keeps them on brief. I decide what it says and whether it's good enough. You're looking at the prototype stage.",
          "facts": [
            "Prototype",
            "AI studio"
          ],
          "source": "CONFIRM"
        },
        {
          "id": "c-family-week",
          "title": "Tested against a real week",
          "hook": "The test environment is a busy family week.",
          "body": "I'm a dad of two, so most of what I build gets tested against a busy family week before anyone else sees it. That's a harsh test. If something takes three taps when one would do, or a message reads badly first thing in the morning, I'll notice. It keeps the work honest and the scope small.",
          "facts": [
            "Dad of two"
          ],
          "source": "VERIFIED"
        }
      ]
    },
    {
      "id": "experiments",
      "label": "EXPERIMENTS",
      "tagline": "AI, data, automation and agent work.",
      "nodes": [
        {
          "id": "x-studio",
          "title": "An AI studio I direct",
          "hook": "Research, design, engineering and QA, each its own agent.",
          "body": "I'm testing how far one person can go by directing AI agents like a small studio. Each has one job: research, design, engineering or independent review, with an orchestrator passing work between them and a checkpoint where I approve or stop it. The useful part isn't speed. It's that each step leaves something I can read and question.",
          "facts": [
            "Orchestrator",
            "Research",
            "Design",
            "Engineering",
            "QA"
          ],
          "source": "CONFIRM"
        },
        {
          "id": "x-product-research",
          "title": "Agents for product research",
          "hook": "Scout, vet, build, audit: a workflow, not a guess.",
          "body": "For an e-commerce side project I set up a multi-agent workflow with four roles: a scout finds candidates, a vetter checks them, a builder prepares them and an auditor reviews the result. Splitting the work this way means one agent's enthusiasm gets checked by another. It's the same principle as nothing moving without agreement.",
          "facts": [
            "Scout",
            "Vetter",
            "Builder",
            "Auditor"
          ],
          "source": "CONFIRM"
        },
        {
          "id": "x-ai-builder",
          "title": "Prototyping with an AI app builder",
          "hook": "An early Both Homes, built fast to learn fast.",
          "body": "An early version of Both Homes started in an AI app builder. It was a quick way to see the idea on a screen and find out what mattered before committing to anything. The question it answered carried through to what's live now: where is my child tonight?",
          "facts": [
            "Early repo",
            "AI app builder"
          ],
          "source": "CONFIRM"
        },
        {
          "id": "x-automation",
          "title": "Automation with n8n",
          "hook": "Connecting tools so the dull steps run themselves.",
          "body": "I have n8n connected to my tools. I'm using it to learn where automation earns its place and where it just moves the mess somewhere harder to see. The cafe taught me that a system nobody understands is worse than no system, so I want every flow to be small enough to explain.",
          "facts": [
            "n8n"
          ],
          "source": "CONFIRM"
        },
        {
          "id": "x-two-runtimes",
          "title": "One tool, two runtimes",
          "hook": "Same search, as a desktop app and a web page.",
          "body": "The data dictionary search exists twice: once in Python with pandas and Tkinter on the desktop, and once in plain HTML and JavaScript in the browser. Building it both ways showed me where the logic really lives and how much of an app is just its window. It's a small experiment I still learn from.",
          "facts": [
            "Python",
            "HTML/JS"
          ],
          "link": {
            "label": "Code on GitHub",
            "href": "https://github.com/BryanAgas/data-dictionary-app"
          },
          "source": "VERIFIED"
        }
      ]
    },
    {
      "id": "ideas",
      "label": "IDEAS",
      "tagline": "Ideas in progress, and how they get caught.",
      "nodes": [
        {
          "id": "i-idea-bank",
          "title": "The Idea Bank",
          "hook": "Every raw idea gets written down, expanded and scored.",
          "body": "Ideas arrive at bad times: on the school run, mid-rally, in the middle of a shift. So I don't trust memory. Each raw idea goes into a workbook, gets expanded into something I can actually judge, and gets a score. Scoring is how I decide which ones deserve time. Writing them down is how I stop chasing all of them.",
          "facts": [
            "Capture",
            "Expand",
            "Score"
          ],
          "source": "CONFIRM"
        },
        {
          "id": "i-one-question",
          "title": "Open question: what else needs one calm answer?",
          "hook": "Both Homes answers one question. What are the others?",
          "body": "Both Homes works because it answers one question so clearly there's nothing to argue about. I keep asking where else that applies. Which other shared, emotional, everyday decisions would be easier if one plain screen just answered them? I don't have the answer yet. This is where the question lives while I think about it.",
          "source": "VERIFIED"
        },
        {
          "id": "i-spreadsheets",
          "title": "Open question: what still runs on a spreadsheet and a chat?",
          "hook": "Look for the job people do by scrolling.",
          "body": "The data dictionary existed because people were scrolling a spreadsheet to answer one question. Both Homes exists partly because group chats bury the schedule. Both started the same way: someone doing a small, repeated job the hard way. I keep an eye out for the next one. It usually looks too boring to notice.",
          "source": "VERIFIED"
        },
        {
          "id": "i-one-person",
          "title": "Open question: how much can one person run well?",
          "hook": "Agents make more possible. Not all of it is wise.",
          "body": "With agents doing research, design, engineering and review, one person can make much more than before. The open question for me is what should stay human. Deciding what a product says to someone who's upset, choosing what's free, approving a release: so far I keep those. I'm still working out where the line sits.",
          "source": "CONFIRM"
        }
      ]
    }
  ],
  "synapses": [
    {
      "from": "p-bothhomes",
      "to": "s-web",
      "label": "The site runs on this stack"
    },
    {
      "from": "p-bothhomes",
      "to": "e-tesco",
      "label": "Clear answers learned at a till"
    },
    {
      "from": "p-bothhomes",
      "to": "m-calm",
      "label": "Calm tool for a tense situation"
    },
    {
      "from": "p-bothhomes-decisions",
      "to": "m-agreement",
      "label": "The rule behind change requests"
    },
    {
      "from": "p-bothhomes-decisions",
      "to": "m-privacy",
      "label": "Single-use invites, no public links"
    },
    {
      "from": "p-bothhomes-decisions",
      "to": "s-product",
      "label": "Pricing and policy are product decisions"
    },
    {
      "from": "p-tracker",
      "to": "s-python",
      "label": "Standard library only, by choice"
    },
    {
      "from": "p-tracker",
      "to": "m-clarity",
      "label": "Raw events turned into sentences"
    },
    {
      "from": "p-datadict",
      "to": "x-two-runtimes",
      "label": "Same tool, desktop and browser"
    },
    {
      "from": "p-datadict",
      "to": "i-spreadsheets",
      "label": "Born from scrolling a spreadsheet"
    },
    {
      "from": "p-mycv",
      "to": "s-html-css",
      "label": "Where the HTML habit started"
    },
    {
      "from": "p-mycv",
      "to": "e-building",
      "label": "The first step on the path"
    },
    {
      "from": "s-testing",
      "to": "m-ship",
      "label": "Guardrails that make shipping safe"
    },
    {
      "from": "s-words",
      "to": "e-sales",
      "label": "Thirty-second explanations became UI copy"
    },
    {
      "from": "s-words",
      "to": "m-calm",
      "label": "Neutral wording for upset readers"
    },
    {
      "from": "s-product",
      "to": "e-education",
      "label": "Business degree, used for real"
    },
    {
      "from": "e-cafe",
      "to": "x-automation",
      "label": "Systems people on shift can follow"
    },
    {
      "from": "e-kitchen",
      "to": "m-calm",
      "label": "Calm learned in a busy kitchen"
    },
    {
      "from": "e-tesco",
      "to": "m-clarity",
      "label": "Where the clarity rule came from"
    },
    {
      "from": "e-sales",
      "to": "c-appstore",
      "label": "A listing is a thirty-second pitch"
    },
    {
      "from": "m-turn-up",
      "to": "e-building",
      "label": "Weekly practice, self-taught code"
    },
    {
      "from": "m-turn-up",
      "to": "c-family-week",
      "label": "Short, fixed time as a dad"
    },
    {
      "from": "m-agreement",
      "to": "x-product-research",
      "label": "One agent checks another's work"
    },
    {
      "from": "c-backend",
      "to": "m-agreement",
      "label": "Where the agreement rule must hold"
    },
    {
      "from": "c-this-brain",
      "to": "x-studio",
      "label": "This site is the studio's output"
    },
    {
      "from": "x-studio",
      "to": "i-one-person",
      "label": "Raises what should stay human"
    },
    {
      "from": "x-ai-builder",
      "to": "p-bothhomes",
      "label": "The early prototype of Both Homes"
    },
    {
      "from": "i-one-question",
      "to": "p-bothhomes",
      "label": "The one-question pattern, generalised"
    },
    {
      "from": "i-idea-bank",
      "to": "x-product-research",
      "label": "Both are structured ways to judge candidates"
    },
    {
      "from": "c-family-week",
      "to": "p-bothhomes",
      "label": "Built and tested by a parent"
    }
  ],
  "trails": [
    {
      "id": "both-homes",
      "title": "How Both Homes happened",
      "intro": "From a till in Sheffield to a calendar two homes agree on.",
      "stops": [
        "e-tesco",
        "m-clarity",
        "x-ai-builder",
        "p-bothhomes",
        "m-agreement",
        "c-appstore"
      ]
    },
    {
      "id": "shop-floor",
      "title": "From the shop floor to the command line",
      "intro": "Twelve years serving people, and what each job left behind.",
      "stops": [
        "e-tesco",
        "e-sales",
        "e-kitchen",
        "e-cafe",
        "p-mycv",
        "e-building"
      ]
    },
    {
      "id": "ai",
      "title": "How I work with AI",
      "intro": "Agents do the legwork. I keep the decisions.",
      "stops": [
        "x-ai-builder",
        "x-product-research",
        "x-studio",
        "c-this-brain",
        "i-one-person"
      ]
    }
  ]
}
```
