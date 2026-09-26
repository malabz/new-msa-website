import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { walk } from '../docs/.vitepress/content.mjs';
const urls = new Map();
for (const file of walk('docs')) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)) {
    const url = m[1].split('#')[0];
    if (!urls.has(url)) urls.set(url, []);
    urls.get(url).push(file);
  }
}
function request(url, head = true) {
  return new Promise(resolve => {
    const args = ['-L', '-sS', '--max-time', '12', '--output', '/dev/null', '--write-out', '%{http_code}', ...(head ? ['--head'] : ['--range', '0-0', '--max-filesize', '1048576']), url];
    const p = spawn('curl', args); let out = '', err = '';
    p.stdout.on('data', d => out += d); p.stderr.on('data', d => err += d);
    p.on('error', e => resolve({ code: 0, error: e.message }));
    p.on('close', exit => resolve({ code: Number(out) || 0, exit, error: err.trim() }));
  });
}
const queue = [...urls], results = [];
await Promise.all(Array.from({ length: 10 }, async () => {
  while (queue.length) {
    const [url, pages] = queue.shift();
    let r = await request(url);
    if ([404,405,410].includes(r.code)) r = await request(url, false);
    const status = r.code >= 200 && r.code < 400 ? 'reachable' : [404,410].includes(r.code) ? 'not-found' : [401,403,429].includes(r.code) ? 'restricted' : 'unverified';
    results.push({ url, pages: [...new Set(pages)], status, ...r });
    if (results.length % 40 === 0) console.log(`已检查 ${results.length}/${urls.size} 个外链`);
  }
}));
results.sort((a,b) => a.url.localeCompare(b.url));
fs.mkdirSync('migration', { recursive: true });
fs.writeFileSync('migration/external-links.json', JSON.stringify({ checkedAt: new Date().toISOString(), method: 'HEAD; 404/405/410 retried using bounded GET; no genome datasets downloaded', results }, null, 2) + '\n');
console.log(results.reduce((a,r) => (a[r.status] = (a[r.status] || 0) + 1, a), {}));
