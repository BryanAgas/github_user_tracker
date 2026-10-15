# Mrs Anne's AI Academy

An interactive web app that takes someone from *"I don't really understand AI"* to *"I can confidently understand, use, build and evaluate advanced AI systems."*

Plain static HTML + ES modules. **No framework, no dependencies, no build step.**

```
python3 -m http.server -d academy 8000      # then open http://localhost:8000
node academy/tests/serve.mjs 8124           # same, but with the production CSP applied
```

## What's in it

| Area | What it does |
|---|---|
| **Home** | Continue where you left off, weekly goal, streak, reviews due |
| **Learn** | Eight levels (0 Foundations → 7 Builder), ~77 lessons, personalised paths |
| **Explore** | Every topic (skill) searchable, with mastery and the lessons that teach it |
| **Lab** | 22 interactive experiments + a sandboxed JavaScript playground |
| **Build** | 15 projects with requirements, scaffolded guidance, hint ladder, automated checks, review, extensions |
| **Mrs Anne** | The tutor: offline teaching engine; optional model-backed brain (bring your own key) |
| **Progress** | Mastery per skill (Strong / Needs practice / Not yet learned), projects, milestones, level certificates |
| **Library** | Glossary, curated resources, cheat sheets, and *Current practice* notes |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how and why it works, [`docs/CONTENT_SPEC.md`](docs/CONTENT_SPEC.md) to write or edit lessons, [`docs/WIDGETS.md`](docs/WIDGETS.md) for the experiment contract, and [`docs/review/`](docs/review) for the independent review reports.

## Tests

```
node academy/tools/validate-content.mjs                  # content contract (also runs every reference solution)
node academy/tests/unit.mjs                              # mastery, paths, tutor, content integrity
NODE_PATH=$(npm root -g) node academy/tests/smoke.mjs    # every lesson/project/widget route under the production CSP
NODE_PATH=$(npm root -g) node academy/tests/flows.mjs    # end-to-end learner flows, mobile layout, mock model stream
```

Playwright is not a dependency of the repo; point `NODE_PATH` (or `PLAYWRIGHT_DIR`) at any install.

## Deploy

`academy/netlify.toml` publishes this folder as its own static site with a strict Content-Security-Policy (no inline script or style; `eval` is permitted *only* for the sandbox worker, which has no network). It does not touch the portfolio site's config at the repo root.

## Privacy and data

There are no accounts, analytics or trackers. Progress lives in this browser's `localStorage` (export/import/erase in Settings). Nothing leaves the device unless the learner connects a model: then only what they type to Mrs Anne, plus lesson title/key points and role/weak-topic names for context, goes to the endpoint they configured. The API key is held in memory (optionally in tab-scoped `sessionStorage`) and is never written to `localStorage`.
