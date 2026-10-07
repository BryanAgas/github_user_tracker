// Pure helpers for the in-browser port of github_activity.py.
// No DOM access here, so `node --test` can import this file directly.

const USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9]))*$/;

/**
 * GitHub username rules: 1–39 characters, letters, numbers and single
 * hyphens, and it can't start or end with a hyphen.
 */
export function isValidUsername(u) {
  return typeof u === 'string' && u.length >= 1 && u.length <= 39 && USERNAME.test(u);
}

const capitalise = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const stripRef = (ref) => (typeof ref === 'string' ? ref.replace(/^refs\/(heads|tags)\//, '') : '');

/**
 * Turn one GitHub event into a plain sentence.
 * Returns { text, repo, repoUrl }; `repo` appears verbatim inside `text`
 * so the UI can link it. Tolerates missing payload fields throughout.
 */
export function describeEvent(event) {
  const e = event && typeof event === 'object' ? event : {};
  const p = e.payload && typeof e.payload === 'object' ? e.payload : {};
  const name = e.repo && typeof e.repo.name === 'string' && e.repo.name ? e.repo.name : '';
  const repo = name || 'a repository';
  const repoUrl = name ? `https://github.com/${name}` : null;
  const type = typeof e.type === 'string' ? e.type : '';
  const action = typeof p.action === 'string' && p.action ? capitalise(p.action) : 'Updated';
  const ref = stripRef(p.ref);
  const refType = typeof p.ref_type === 'string' && p.ref_type ? p.ref_type : '';

  let text;
  switch (type) {
    case 'PushEvent': {
      if (Array.isArray(p.commits)) {
        const n = p.commits.length;
        text = `Pushed ${n} commit${n === 1 ? '' : 's'} to ${repo}`;
      } else {
        text = ref ? `Pushed to ${ref} in ${repo}` : `Pushed to ${repo}`;
      }
      break;
    }
    case 'IssuesEvent':
      text = `${action} an issue in ${repo}`;
      break;
    case 'WatchEvent':
      text = `Starred ${repo}`;
      break;
    case 'CreateEvent':
      if (refType === 'repository') text = `Created repository ${repo}`;
      else text = `Created ${[refType || 'a ref', ref].filter(Boolean).join(' ')} in ${repo}`;
      break;
    case 'DeleteEvent':
      text = `Deleted ${[refType || 'a ref', ref].filter(Boolean).join(' ')} in ${repo}`;
      break;
    case 'ForkEvent':
      text = `Forked ${repo}`;
      break;
    case 'PullRequestEvent':
      text = `${action} a pull request in ${repo}`;
      break;
    case 'PullRequestReviewEvent':
      text = `Reviewed a pull request in ${repo}`;
      break;
    case 'IssueCommentEvent':
      text = `Commented on an issue in ${repo}`;
      break;
    case 'ReleaseEvent':
      text = `Published a release in ${repo}`;
      break;
    case 'PublicEvent':
      text = `Made ${repo} public`;
      break;
    case 'MemberEvent':
      text = `Added a collaborator to ${repo}`;
      break;
    default: {
      const label = type.replace(/Event$/, '') || 'Activity';
      text = `${label} in ${repo}`;
    }
  }
  return { text, repo, repoUrl };
}

/**
 * Short relative time: "just now", "5m ago", "3h ago", "2d ago", "1y ago".
 * `now` may be a Date or a millisecond timestamp. Returns "" for bad input.
 */
export function relativeTime(iso, now = Date.now()) {
  if (typeof iso !== 'string' || iso === '') return '';
  const then = new Date(iso).getTime();
  const at = now instanceof Date ? now.getTime() : Number(now);
  if (!Number.isFinite(then) || !Number.isFinite(at)) return '';
  const s = Math.floor((at - then) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 365) return `${d}d ago`;
  return `${Math.floor(d / 365)}y ago`;
}
