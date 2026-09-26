import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { checkSource } from './check.mjs';
import { checkHtml } from './check-html.mjs';
import { checkFigures } from './generate-figures.mjs';
import { siteBase } from '../docs/.vitepress/content.mjs';

const root = path.resolve('docs/.vitepress/dist');
// A failed build must not leave an old ready-to-publish marker behind.
fs.rmSync(path.join(root, 'release.json'), { force: true });
checkSource();
checkFigures();
const base = siteBase();
const result = spawnSync(process.execPath, ['node_modules/vitepress/bin/vitepress.js', 'build', 'docs'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
const redirects = JSON.parse(fs.readFileSync('migration/redirects.json', 'utf8'));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
for (const [old, target] of Object.entries(redirects)) {
  const url = base + target;
  fs.writeFileSync(path.join(root, old), `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${escape(url)}"><title>页面已迁移</title></head><body><p>页面已整理至 <a href="${escape(url)}">新位置</a>。</p><script>const target=${JSON.stringify(url)};const url=new URL(target,location.origin);const legacyLayout=["#tlayout","#layout-menu","#layout-content","#toptitle","#subtitle"];if(!url.hash && location.hash && !legacyLayout.includes(location.hash))url.hash=location.hash;url.search=location.search;location.replace(url.href);</script></body></html>\n`);
}
checkHtml(root, base);
const rev = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
const source = process.env.GITHUB_SHA || (rev.status === 0 ? rev.stdout.trim() : 'local-uncommitted');
// Only successful, checked outputs receive this marker.
fs.writeFileSync(path.join(root, 'release.json'), JSON.stringify({ schema: 1, source, base, builtAt: new Date().toISOString() }, null, 2) + '\n');
console.log(`构建完成：${root}（base=${base}）`);

function allFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? allFiles(p) : [p];
  });
}
const manifest = allFiles(root).filter(f => path.basename(f) !== 'FILES.sha256').sort().map(file =>
  createHash('sha256').update(fs.readFileSync(file)).digest('hex') + '  ' + path.relative(root, file).split(path.sep).join('/')).join('\n');
fs.writeFileSync(path.join(root, 'FILES.sha256'), manifest + '\n');
