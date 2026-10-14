// Static server that applies the CSP rules from netlify.toml, so CSP violations show up as console errors in tests.
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const toml = readFileSync(path.join(root, 'netlify.toml'), 'utf8');
const csps = [...toml.matchAll(/for = "([^"]+)"\s*\n\s*\[headers\.values\]\s*\n\s*Content-Security-Policy = "([^"]+)"/g)].map((m) => [m[1], m[2]]);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml' };
export function serve(port = 0, { csp = true, extraConnect = '' } = {}) {
  return new Promise((res) => {
    const s = http.createServer((req, rsp) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root) || !existsSync(f) || !statSync(f).isFile()) { rsp.writeHead(404); return rsp.end('nf'); }
      const h = { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' };
      if (csp) { const specific = csps.find(([k]) => k === p); const generic = csps.find(([k]) => k === '/*'); h['content-security-policy'] = (specific || generic)[1].replace(/connect-src 'self'/, (m) => (extraConnect && !specific ? m + ' ' + extraConnect : m)); }
      rsp.writeHead(200, h); rsp.end(readFileSync(f));
    }).listen(port, () => res({ server: s, url: `http://localhost:${s.address().port}` }));
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { const { url } = await serve(+process.argv[2] || 8124); console.log('serving', url); }
