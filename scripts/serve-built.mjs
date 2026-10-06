// QA-only static server: serve the selected build and its recorded base,
// without VitePress config, SPA fallback, or a dependency on a web server.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'docs/.vitepress/dist');
const port = Number(process.argv[3] || 4183);
const { base } = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json' };
http.createServer((req, res) => {
  const missing = () => {
    res.writeHead(404, { 'Content-Type': types['.html'] });
    fs.createReadStream(path.join(root, '404.html')).pipe(res);
  };
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (base !== '/' && pathname === base.slice(0, -1)) { res.writeHead(308, { Location: base }).end(); return; }
  if (!pathname.startsWith(base) || pathname.includes('\\') || pathname.includes('\0')) { missing(); return; }
  let relative = pathname.slice(base.length);
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { missing(); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (req.method === 'HEAD') res.end();
  else fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Static QA: http://127.0.0.1:${port}${base} (${root})`));
