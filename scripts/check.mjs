import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getPages, groups } from '../docs/.vitepress/content.mjs';

export function checkSource(root = path.resolve('docs')) {
  const pages = getPages(root);
  const errors = [];
  for (const p of pages) {
    if (p.relative !== 'index.md' && !groups.some(([dir]) => p.relative.startsWith(dir + '/')))
      errors.push(`${p.relative}: 请将文章放入现有分组目录。`);
    if (!/^[a-z0-9/-]+\.md$/.test(p.relative)) errors.push(`${p.relative}: 文件名应使用英文小写和连字符。`);
    const text = fs.readFileSync(p.file, 'utf8');
    if (/^# jemdoc:|^~~~|^={1,4} /m.test(text)) errors.push(`${p.relative}: 残留 jemdoc 标记。`);
    if ((text.match(/^```/gm) || []).length % 2) errors.push(`${p.relative}: 代码围栏不配对。`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Markdown 检查通过：${pages.length} 页。`);
  return pages;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) checkSource();
