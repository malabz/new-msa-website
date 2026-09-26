import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sidebar, tokenize, siteBase } from '../docs/.vitepress/content.mjs';

test('新增 Markdown 自动进入导航，标题与排序遵守约定', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'msa-nav-'));
  try {
    fs.mkdirSync(path.join(root, 'basics'));
    fs.writeFileSync(path.join(root, 'basics', 'z.md'), '---\ntitle: 显式标题\norder: 1\n---\n# 备用标题');
    fs.writeFileSync(path.join(root, 'basics', 'a.md'), '# 一级标题\n\n文章');
    assert.deepEqual(sidebar(root)[0].items.map(x => x.text), ['显式标题', '一级标题']);
    fs.writeFileSync(path.join(root, 'basics', 'b.md'), '# 新增文章');
    assert.equal(sidebar(root)[0].items.length, 3);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test('中文连续文本和英文工具名称可分词', () => {
  for (const [text, term] of [['多基因组比对算法', '基因'], ['生成模拟数据', '模拟'], ['重比对工具', '重比'], ['HAlign 与 POA', 'halign'], ['MGA-Dataset', 'mga-dataset']])
    assert.ok(tokenize(text).includes(term));
});
test('部署前缀明确且拒绝非法路径', () => {
  assert.equal(siteBase('/~cjt/MSA/'), '/~cjt/MSA/');
  assert.equal(siteBase('/'), '/');
  for (const bad of ['relative', '//', '/../', '/foo', '/a/./']) assert.throws(() => siteBase(bad));
});
