import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

export function htmlFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(e => {
    const p = path.join(root, e.name);
    return e.isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : [];
  });
}
export function checkHtml(root, base) {
  const files = htmlFiles(root), errors = [], cache = new Map();
  const parse = f => {
    if (!cache.has(f)) cache.set(f, load(fs.readFileSync(f, 'utf8')));
    return cache.get(f);
  };
  for (const file of files) {
    const $ = parse(file);
    const relative = path.relative(root, file).split(path.sep).join('/');
    const origin = new URL(base + relative, 'https://check.invalid');
    if (!$('title').text().trim()) errors.push(`${relative}: 缺少标题`);
    if ($('mjx-merror, [data-mjx-error]').length) errors.push(`${relative}: 数学公式渲染错误`);
    $('a[href], img[src], script[src], link[href]').each((_, el) => {
      const value = $(el).attr('href') || $(el).attr('src');
      if (!value || /^(mailto:|tel:|data:|javascript:)/.test(value)) return;
      const u = new URL(value, origin);
      if (u.origin !== origin.origin) return;
      if (!u.pathname.startsWith(base)) { errors.push(`${relative}: 链接逃出 SITE_BASE: ${value}`); return; }
      let name = decodeURIComponent(u.pathname.slice(base.length));
      if (!name || name.endsWith('/')) name += 'index.html';
      const target = path.resolve(root, name);
      if (!target.startsWith(path.resolve(root) + path.sep)) { errors.push(`${relative}: 非法路径 ${value}`); return; }
      if (!fs.existsSync(target)) { errors.push(`${relative}: 文件不存在 ${value}`); return; }
      if (target.endsWith('.html') && u.hash && !u.hash.startsWith('#:~:')) {
        const id = decodeURIComponent(u.hash.slice(1));
        const dest = parse(target);
        if (!dest('[id]').toArray().some(e => dest(e).attr('id') === id)) errors.push(`${relative}: 锚点不存在 ${value}`);
      }
    });
  }
  if (errors.length) throw new Error([...new Set(errors)].join('\n'));
  console.log(`HTML 检查通过：${files.length} 页；本地资源、链接、锚点和数学公式有效。`);
  return files;
}
