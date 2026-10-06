import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createMarkdownRenderer } from 'vitepress';
import { load } from 'cheerio';
import { homeDirectory, renderSearchContent } from '../docs/.vitepress/home-directory.mjs';

const md = await createMarkdownRenderer(process.cwd(), { config: md => md.use(homeDirectory) });
const render = (source, relativePath = 'index.md') => md.render(source, { relativePath });

test('首页普通 Markdown 自动生成六个目录行，保持所有链接与锚点', () => {
  const source = fs.readFileSync('docs/index.md', 'utf8').replace(/^---[\s\S]*?---\s*/, '');
  const $ = load(render(source));
  assert.equal($('.home-directory-row').length, 6);
  assert.equal($('.home-directory-row li a').length, 16);
  assert.equal($('.home-resource').length, 1);
  assert.equal($('#多基因组数据资源').length, 1);
  assert.equal($('.home-resource a[href="https://github.com/malabz/MGA-Dataset"]').length, 1);
  assert.equal($('section section').length, 0, 'Sections must be siblings, never nested');
});

test('添加或改名栏目不需要注册，兼容普通列表和链接', () => {
  const $ = load(render('# MSA\n\n## 新栏目\n\n一段说明。\n\n- [新文章](./basics/new.md)\n\n## 另一栏目\n\n另一段说明。\n\n- [参考](./data/new.md)'));
  assert.equal($('.home-directory-row').length, 2);
  const heading = $('.home-directory-row').first().find('h2').clone();
  heading.find('.header-anchor').remove();
  assert.equal(heading.text().trim(), '新栏目');
  assert.equal($('section section').length, 0);
});

test('富文本栏目退回正常文档流，文章页完全不受影响', () => {
  const source = '## 标题\n\n第一段。\n\n第二段。\n\n- [链接](./other.md)\n\n### 子标题\n\n补充。';
  assert.equal(load(render(source))('.home-directory-row').length, 0);
  assert.equal(load(render(source))('.home-resource').length, 1);
  assert.equal(load(render(source, 'basics/pairwise.md'))('section').length, 0);
});

test('带外链的首页标题可被搜索识别，搜索关闭约定仍然有效', () => {
  const source = '## [MGA-Dataset](https://github.com/malabz/MGA-Dataset) {#多基因组数据资源}\n\n资源说明。';
  const $ = load(renderSearchContent(source, { relativePath: 'index.md' }, md));
  assert.equal($('h2 a').length, 1);
  assert.equal($('h2 a').attr('class'), 'header-anchor');
  assert.match($('h2').text(), /MGA-Dataset/);
  assert.equal(load(render(source))('h2 a').length, 2, 'Page retains its clickable heading');
  assert.equal(renderSearchContent('---\nsearch: false\n---\n# Private', { relativePath: 'index.md' }, md), '');
  assert.equal(renderSearchContent(source, { relativePath: 'other.md' }, md), render(source, 'other.md'));
});
