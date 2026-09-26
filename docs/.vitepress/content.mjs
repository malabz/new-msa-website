import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const groups = [
  ['basics', '比对基础'], ['realignment', '重比对'], ['data', '数据与评测'],
  ['software', '软件指南'], ['development', '开发工具'], ['publications', '论文成果']
];

export function walk(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(e => {
    if (e.name.startsWith('.')) return [];
    const p = path.join(root, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

export function getPages(root) {
  return walk(root).map(file => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const relative = path.relative(root, file).split(path.sep).join('/');
    return {
      file, relative, title: data.title || content.match(/^#\s+(.+)$/m)?.[1] || path.basename(file, '.md'),
      order: Number.isFinite(data.order) ? data.order : Infinity,
      link: '/' + relative.replace(/\.md$/, '.html')
    };
  });
}

export function sidebar(root) {
  const pages = getPages(root);
  return groups.map(([dir, text]) => ({ text, collapsed: false,
    items: pages.filter(p => p.relative.startsWith(dir + '/')).sort((a, b) =>
      (a.order - b.order) || a.relative.localeCompare(b.relative, 'en'))
      .map(p => ({ text: p.title, link: p.link }))
  }));
}

// Same function is bundled into browser search and used while indexing.
export function tokenize(text) {
  const lower = text.toLowerCase();
  const terms = lower.match(/[a-z0-9]+(?:[-_][a-z0-9]+)*/g) || [];
  for (const run of lower.match(/[\p{Script=Han}]+/gu) || []) {
    terms.push(run);
    if (run.length === 1) terms.push(run);
    for (let i = 0; i < run.length - 1; i++) terms.push(run.slice(i, i + 2));
  }
  return [...new Set(terms)];
}

export function siteBase(value = process.env.SITE_BASE || '/') {
  if (!/^\/(?:[A-Za-z0-9_~.-]+\/)*$/.test(value) || value.includes('/../') || value.includes('/./'))
    throw new Error('SITE_BASE 必须是 / 或 /子路径/（英文 URL 路径，前后带 /）。');
  return value;
}
