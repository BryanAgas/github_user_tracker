# GitHub User Activity CLI
This is a simple command-line interface (CLI) application built with Python that fetches and displays recent activity for a specified GitHub user using the GitHub API. This project allows you to practice working with APIs, JSON handling, and building a basic CLI app.

## Features
Fetch recent activity of a specified GitHub user.
Display the activity in a readable format.
Example: Pushed commits, opened issues, starred repositories.
Handles errors such as invalid usernames and API request failures.

## How to Use

    python github_activity.py username

## Portfolio site

`site/` holds Bryan Agas's portfolio: plain static HTML, one stylesheet and two
small ES modules. There's no framework, no dependencies and no build step.

- `site/index.html` is the home page (work, path, tracker, about, contact).
  `site/work/both-homes/` is the case study, `site/thanks/` is the contact
  form's success page and `site/404.html` is the not-found page.
- `site/assets/js/tracker.js` holds the pure functions behind the in-browser
  version of this CLI (`isValidUsername`, `describeEvent`, `relativeTime`).
- `site/assets/js/main.js` handles the mobile menu, contact form validation
  and the live tracker.

### Preview locally

    python3 -m http.server -d site 8000

Then open http://localhost:8000. The contact form only submits on Netlify.

### Tests

Unit tests for `tracker.js` use Node's built-in runner (Node 20+):

    node --test tests/*.test.mjs

The browser smoke test (`tests/smoke.mjs`) serves `site/` with the production
CSP and checks every page at 320, 360, 768, 1280 and 1600px: console errors,
horizontal scroll, links and anchors, the mobile menu, form validation and
the tracker against a mocked GitHub API. Playwright isn't a dependency of
this repo, so point Node at an existing install:

    NODE_PATH=$(npm root -g) node tests/smoke.mjs
    # or: PLAYWRIGHT_DIR=/path/to/node_modules node tests/smoke.mjs

Add `--shots <dir>` to save screenshots.

### Deploy

Deploys to https://bryan-agas.netlify.app. Netlify publishes `site/` as-is (see `netlify.toml`, which also sets the
security and caching headers). The contact form uses Netlify Forms.
