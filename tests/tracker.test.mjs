import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidUsername, describeEvent, relativeTime } from '../site/assets/js/tracker.js';

const ev = (type, payload, repo = 'octo/hello') => ({ type, payload, repo: { name: repo } });

test('isValidUsername accepts GitHub-style usernames', () => {
  for (const u of ['a', 'torvalds', 'BryanAgas', 'sindre-sorhus', 'a1-b2-c3', '0', 'x'.repeat(39)]) {
    assert.equal(isValidUsername(u), true, u);
  }
});

test('isValidUsername rejects bad usernames', () => {
  for (const u of ['', '-abc', 'abc-', 'a--b', 'x'.repeat(40), 'has space', 'under_score', 'dot.name',
    'émile', 'a/b', ' torvalds', null, undefined, 42, {}]) {
    assert.equal(isValidUsername(u), false, String(u));
  }
});

test('PushEvent counts commits and pluralises', () => {
  assert.equal(describeEvent(ev('PushEvent', { commits: [{}, {}, {}] })).text, 'Pushed 3 commits to octo/hello');
  assert.equal(describeEvent(ev('PushEvent', { commits: [{}] })).text, 'Pushed 1 commit to octo/hello');
  assert.equal(describeEvent(ev('PushEvent', { commits: [] })).text, 'Pushed 0 commits to octo/hello');
});

test('PushEvent without a commit list falls back, with branch when known', () => {
  assert.equal(describeEvent(ev('PushEvent', { ref: 'refs/heads/main', head: 'abc' })).text, 'Pushed to main in octo/hello');
  assert.equal(describeEvent(ev('PushEvent', { ref: 'refs/heads/feature/x' })).text, 'Pushed to feature/x in octo/hello');
  assert.equal(describeEvent(ev('PushEvent', {})).text, 'Pushed to octo/hello');
  assert.equal(describeEvent(ev('PushEvent', undefined)).text, 'Pushed to octo/hello');
});

test('every mapped event type has its sentence', () => {
  const cases = [
    [ev('IssuesEvent', { action: 'opened' }), 'Opened an issue in octo/hello'],
    [ev('IssuesEvent', { action: 'closed' }), 'Closed an issue in octo/hello'],
    [ev('WatchEvent', { action: 'started' }), 'Starred octo/hello'],
    [ev('CreateEvent', { ref_type: 'repository', ref: null }), 'Created repository octo/hello'],
    [ev('CreateEvent', { ref_type: 'branch', ref: 'dev' }), 'Created branch dev in octo/hello'],
    [ev('CreateEvent', { ref_type: 'tag', ref: 'refs/tags/v1.0.0' }), 'Created tag v1.0.0 in octo/hello'],
    [ev('CreateEvent', { ref_type: 'branch' }), 'Created branch in octo/hello'],
    [ev('DeleteEvent', { ref_type: 'branch', ref: 'old' }), 'Deleted branch old in octo/hello'],
    [ev('ForkEvent', { forkee: {} }), 'Forked octo/hello'],
    [ev('PullRequestEvent', { action: 'opened' }), 'Opened a pull request in octo/hello'],
    [ev('PullRequestEvent', { action: 'closed' }), 'Closed a pull request in octo/hello'],
    [ev('PullRequestReviewEvent', { action: 'created' }), 'Reviewed a pull request in octo/hello'],
    [ev('IssueCommentEvent', { action: 'created' }), 'Commented on an issue in octo/hello'],
    [ev('ReleaseEvent', { action: 'published' }), 'Published a release in octo/hello'],
    [ev('PublicEvent', {}), 'Made octo/hello public'],
    [ev('MemberEvent', { action: 'added' }), 'Added a collaborator to octo/hello'],
  ];
  for (const [e, want] of cases) assert.equal(describeEvent(e).text, want, e.type);
});

test('missing payloads and actions do not throw', () => {
  for (const type of ['IssuesEvent', 'CreateEvent', 'DeleteEvent', 'PullRequestEvent', 'ReleaseEvent']) {
    const out = describeEvent({ type, repo: { name: 'o/r' } });
    assert.match(out.text, /o\/r/);
  }
  assert.equal(describeEvent({ type: 'IssuesEvent', repo: { name: 'o/r' } }).text, 'Updated an issue in o/r');
  assert.equal(describeEvent({ type: 'DeleteEvent', repo: { name: 'o/r' } }).text, 'Deleted a ref in o/r');
});

test('unknown types fall back to the type name without "Event"', () => {
  assert.equal(describeEvent(ev('GollumEvent', { pages: [] })).text, 'Gollum in octo/hello');
  assert.equal(describeEvent(ev('SponsorshipEvent', {})).text, 'Sponsorship in octo/hello');
  assert.equal(describeEvent({ repo: { name: 'o/r' } }).text, 'Activity in o/r');
});

test('repo and repoUrl are returned and the repo appears in the text', () => {
  const out = describeEvent(ev('WatchEvent', {}, 'BryanAgas/github_user_tracker'));
  assert.equal(out.repo, 'BryanAgas/github_user_tracker');
  assert.equal(out.repoUrl, 'https://github.com/BryanAgas/github_user_tracker');
  assert.ok(out.text.includes(out.repo));
});

test('events with no repo or garbage input still produce text', () => {
  const out = describeEvent({ type: 'WatchEvent' });
  assert.equal(out.text, 'Starred a repository');
  assert.equal(out.repoUrl, null);
  assert.equal(describeEvent(null).text, 'Activity in a repository');
  assert.equal(describeEvent('nope').repoUrl, null);
});

test('relativeTime buckets', () => {
  const now = Date.parse('2026-10-07T12:00:00Z');
  const ago = (ms) => new Date(now - ms).toISOString();
  assert.equal(relativeTime(ago(5_000), now), 'just now');
  assert.equal(relativeTime(ago(59_000), now), 'just now');
  assert.equal(relativeTime(ago(60_000), now), '1m ago');
  assert.equal(relativeTime(ago(45 * 60_000), now), '45m ago');
  assert.equal(relativeTime(ago(3 * 3_600_000), now), '3h ago');
  assert.equal(relativeTime(ago(23 * 3_600_000 + 59 * 60_000), now), '23h ago');
  assert.equal(relativeTime(ago(2 * 86_400_000), now), '2d ago');
  assert.equal(relativeTime(ago(89 * 86_400_000), now), '89d ago');
  assert.equal(relativeTime(ago(400 * 86_400_000), now), '1y ago');
});

test('relativeTime handles Date objects, future times and bad input', () => {
  const now = new Date('2026-10-07T12:00:00Z');
  assert.equal(relativeTime('2026-10-07T09:00:00Z', now), '3h ago');
  assert.equal(relativeTime('2026-10-07T12:05:00Z', now), 'just now');
  assert.equal(relativeTime('not a date', now), '');
  assert.equal(relativeTime(undefined, now), '');
});
