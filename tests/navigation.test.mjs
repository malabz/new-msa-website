import test from 'node:test';
import assert from 'node:assert/strict';
import { pageLink, containsPage, sectionForPage, headingIsActive } from '../docs/.vitepress/theme/navigation.mjs';

const groups = [
  { text: '比对基础', items: [{ text: '双序列', link: '/basics/pairwise.html' }] },
  { text: '软件指南', items: [{ text: '课题组软件', link: '/software/lab.html' }] }
];
test('阅读导航直接复用生成的栏目，页面匹配不依赖部署前缀', () => {
  assert.equal(pageLink('basics/pairwise.md'), '/basics/pairwise.html');
  assert.equal(sectionForPage(groups, 'software/lab.md').text, '软件指南');
  assert.equal(sectionForPage(groups, 'index.md'), undefined);
  assert.equal(containsPage(groups[0], '/basics/pairwise.html'), true);
  assert.equal(containsPage(groups[0], '/basics/pairwise.html-other'), false);
});
test('新增 Markdown 导航项不需要在主题中注册', () => {
  const updated = [...groups, { text: '开发工具', items: [{ link: '/development/new-guide.html' }] }];
  assert.equal(sectionForPage(updated, 'development/new-guide.md').text, '开发工具');
});
test('目录滚动定位以固定导航下方为阈值', () => {
  assert.equal(headingIsActive(100, 100), true);
  assert.equal(headingIsActive(101, 100), false);
  assert.equal(headingIsActive(-40, 100), true);
});
