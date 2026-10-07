// Progressive enhancement for the whole site: nav disclosure, contact form,
// and the in-browser GitHub activity tracker. Every page works without it.
import { isValidUsername, describeEvent, relativeTime } from './tracker.js';

document.documentElement.classList.add('js');

/* ---------- Footer year ---------- */
for (const el of document.querySelectorAll('[data-year]')) {
  el.textContent = String(new Date().getFullYear());
}

/* ---------- Mobile nav (disclosure, not a modal) ---------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  toggle.hidden = false;

  const setOpen = (open, { returnFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (!open && returnFocus) toggle.focus();
  };
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      setOpen(false, { returnFocus: true });
    }
  });
  // Close when focus or a click leaves the header.
  document.addEventListener('click', (e) => {
    if (isOpen() && !e.target.closest('.site-header')) setOpen(false);
  });
  // Reset if the viewport grows past the mobile breakpoint.
  const mq = window.matchMedia('(min-width: 721px)');
  mq.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

/* ---------- Current section in nav (home page only) ---------- */
function initScrollSpy() {
  const links = new Map();
  for (const a of document.querySelectorAll('.site-nav a[href^="/#"]')) {
    const id = a.getAttribute('href').slice(2);
    const section = document.getElementById(id);
    if (section) links.set(section, a);
  }
  if (!links.size || !('IntersectionObserver' in window)) return;

  const visible = new Set();
  const update = () => {
    // The topmost visible section wins.
    let current = null;
    for (const section of links.keys()) {
      if (visible.has(section)) { current = section; break; }
    }
    for (const [section, a] of links) {
      if (section === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    update();
  }, { rootMargin: '-35% 0px -60% 0px' });
  for (const section of links.keys()) io.observe(section);
}

/* ---------- Contact form ---------- */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FORM_COPY = {
  name: 'Please add your name.',
  emailMissing: 'Please add an email address I can reply to.',
  emailBad: 'That email address doesn’t look right.',
  message: 'Please write a short message.',
  failed: 'That didn’t send. Please try again, or message me on LinkedIn.',
  sending: 'Sending…',
};

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.noValidate = true;

  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.textContent;
  const status = document.getElementById('contact-status');
  const fields = {
    name: form.elements.namedItem('name'),
    email: form.elements.namedItem('email'),
    message: form.elements.namedItem('message'),
  };
  let attempted = false;

  const check = (key) => {
    const value = fields[key].value.trim();
    if (key === 'name') return value ? '' : FORM_COPY.name;
    if (key === 'email') {
      if (!value) return FORM_COPY.emailMissing;
      return EMAIL.test(value) ? '' : FORM_COPY.emailBad;
    }
    return value ? '' : FORM_COPY.message;
  };

  const show = (key, message) => {
    const input = fields[key];
    const error = document.getElementById(`${input.id}-error`);
    const hint = document.getElementById(`${input.id}-hint`);
    const describedBy = [hint && hint.id, message && error.id].filter(Boolean).join(' ');
    if (describedBy) input.setAttribute('aria-describedby', describedBy);
    else input.removeAttribute('aria-describedby');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      error.textContent = message;
      error.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      error.textContent = '';
      error.hidden = true;
    }
  };

  const validate = () => {
    let firstInvalid = null;
    for (const key of Object.keys(fields)) {
      const message = check(key);
      show(key, message);
      if (message && !firstInvalid) firstInvalid = fields[key];
    }
    return firstInvalid;
  };

  for (const key of Object.keys(fields)) {
    fields[key].addEventListener('input', () => {
      // Only re-check live once the person has tried to send, and only clear errors.
      if (attempted && fields[key].getAttribute('aria-invalid') === 'true' && !check(key)) show(key, '');
    });
    fields[key].addEventListener('blur', () => {
      if (attempted) show(key, check(key));
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    attempted = true;
    status.textContent = '';
    const firstInvalid = validate();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    button.disabled = true;
    button.textContent = FORM_COPY.sending;
    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      window.location.assign('/thanks/');
    } catch {
      status.textContent = FORM_COPY.failed;
      button.disabled = false;
      button.textContent = buttonLabel;
    }
  });
}

/* ---------- GitHub activity tracker ---------- */
const TRACKER_COPY = {
  idle: 'Results will appear here.',
  loading: (u) => `Fetching public events for @${u}…`,
  empty: (u) => `No public activity for @${u} in the last 90 days. GitHub only shares public events from that window.`,
  notFound: (u) => `There’s no GitHub user called @${u}. Check the spelling?`,
  rateLimit: 'GitHub’s limit for anonymous requests has been reached from your network. It resets within the hour.',
  network: 'Couldn’t reach GitHub. Check your connection and try again.',
  invalid: 'GitHub usernames use letters, numbers and single hyphens, up to 39 characters.',
};
const MAX_STAGGER = 12;

function initTracker() {
  const form = document.getElementById('tracker-form');
  const output = document.getElementById('tracker-output');
  const input = document.getElementById('gh-user');
  const promptUser = document.getElementById('term-user');
  if (!form || !output || !input) return;
  form.noValidate = true;

  let controller = null;
  const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  const message = (text, variant) => {
    const p = document.createElement('p');
    p.className = `term__msg${variant ? ` term__msg--${variant}` : ''}`;
    p.textContent = text;
    output.replaceChildren(p);
  };

  const renderEvents = (events) => {
    const list = document.createElement('ol');
    list.className = 'term__list';
    const now = Date.now();
    events.forEach((event, i) => {
      const { text, repo, repoUrl } = describeEvent(event);
      const li = document.createElement('li');
      li.className = 'term__row';
      li.style.setProperty('--i', String(Math.min(i, MAX_STAGGER - 1)));

      const time = document.createElement('time');
      if (event && event.created_at) {
        time.dateTime = event.created_at;
        const date = new Date(event.created_at);
        if (!Number.isNaN(date.getTime())) time.title = dateFormat.format(date);
      }
      time.textContent = relativeTime(event && event.created_at, now) || '—';

      const span = document.createElement('span');
      span.className = 'term__text';
      const at = repoUrl ? text.lastIndexOf(repo) : -1;
      if (at >= 0) {
        const a = document.createElement('a');
        a.href = repoUrl;
        a.textContent = repo;
        a.rel = 'noopener';
        a.target = '_blank';
        span.append(text.slice(0, at), a, text.slice(at + repo.length));
      } else {
        span.textContent = text;
      }
      li.append(time, span);
      list.append(li);
    });
    const count = document.createElement('p');
    count.className = 'term__count';
    count.textContent = `${events.length} event${events.length === 1 ? '' : 's'}`;
    output.replaceChildren(list, count);
  };

  const run = async (raw) => {
    const username = raw.trim().replace(/^@/, '');
    input.value = username;
    promptUser.textContent = username || '<username>';

    if (controller) controller.abort();
    if (!isValidUsername(username)) {
      controller = null;
      input.setAttribute('aria-invalid', 'true');
      output.setAttribute('aria-busy', 'false');
      message(TRACKER_COPY.invalid, 'error');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');

    const ctrl = new AbortController();
    controller = ctrl;
    output.setAttribute('aria-busy', 'true');
    message(TRACKER_COPY.loading(username), 'loading');

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=30`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: ctrl.signal,
      });
      if (ctrl !== controller) return;
      if (res.status === 404) {
        message(TRACKER_COPY.notFound(username), 'error');
      } else if (res.status === 403 || res.status === 429) {
        message(TRACKER_COPY.rateLimit, 'error');
      } else if (!res.ok) {
        message(TRACKER_COPY.network, 'error');
      } else {
        const data = await res.json();
        if (ctrl !== controller) return;
        if (!Array.isArray(data) || data.length === 0) message(TRACKER_COPY.empty(username));
        else renderEvents(data.slice(0, 30));
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      if (ctrl === controller) message(TRACKER_COPY.network, 'error');
    } finally {
      if (ctrl === controller) {
        output.setAttribute('aria-busy', 'false');
        controller = null;
      }
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run(input.value);
  });
  for (const chip of form.querySelectorAll('.chip[data-user]')) {
    chip.addEventListener('click', () => run(chip.dataset.user));
  }
}

initNav();
initScrollSpy();
initContactForm();
initTracker();
