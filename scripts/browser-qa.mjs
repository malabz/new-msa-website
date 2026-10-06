import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { getPages } from '../docs/.vitepress/content.mjs';

const origin = process.env.QA_URL || 'http://127.0.0.1:4173/';
const options = { headless: true, ...(process.env.QA_CHROME ? { executablePath: process.env.QA_CHROME } : {}) };
const browser = await chromium.launch(options);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
let expectedMissing = false;
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !expectedMissing) errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400 && !expectedMissing) errors.push(`${r.status()}: ${r.url()}`); });
const report = { testedAt: new Date().toISOString(), origin, pages: [], searches: [], screenshots: [] };
const output = process.env.QA_OUTPUT_DIR || 'qa-output';
const artifact = name => path.join(output, name);
fs.mkdirSync(output, { recursive: true });
try {
  for (const p of getPages('docs')) {
    const url = new URL(p.relative.replace(/\.md$/, '.html'), origin);
    const res = await page.goto(url.href, { waitUntil: 'networkidle' });
    assert.equal(res.status(), 200, url.href);
    await page.locator('.VPNav').waitFor();
    const brokenImages = await page.locator('.vp-doc img').evaluateAll(imgs => imgs.filter(i => !i.complete || !i.naturalWidth).map(i => i.src));
    assert.deepEqual(brokenImages, [], p.relative);
    assert.equal(await page.locator('mjx-merror, [data-mjx-error]').count(), 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `desktop overflow ${p.relative}`);
    assert.equal(await page.locator('a[href*="contributing"], .edit-link-button').count(), 0, p.relative);
    report.pages.push(p.relative);
  }
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.screenshot({ path: artifact('home-desktop.png'), fullPage: true });
  assert.equal(await page.locator('.VPHomeHero, .VPFeature').count(), 0);
  assert.equal((await page.locator('.vp-doc h1').innerText()).replace(/\u200b/g, '').trim(), 'MSA');
  assert.equal(await page.title(), 'MSA');
  assert.equal((await page.locator('.VPNavBarTitle').innerText()).replace(/\s+/g, ' ').trim(), 'MSA');
  const github = page.locator('.VPNavBarSocialLinks a[aria-label="github"]');
  assert.equal(await github.getAttribute('href'), 'https://github.com/malabz/new-msa-website');
  assert.ok(await page.locator('.vp-doc ul a').count() >= 16);
  const homeWidth = await page.locator('.vp-doc').evaluate(e => e.getBoundingClientRect().width);
  assert.ok(homeWidth <= 1061 && homeWidth >= 1000, 'Desktop directory should have a 1060px canvas');
  assert.equal(await page.locator('.home-directory-row').count(), 6);
  assert.equal(await page.locator('.home-directory-row li a').count(), 16);
  await page.locator('.VPSwitchAppearance').first().click();
  await page.screenshot({ path: artifact('home-dark.png'), fullPage: true });
  await page.locator('.VPSwitchAppearance').first().click();
  report.academicHome = 'passed';
  for (const query of ['基因组比对', '重比对', '模拟数据', 'HAlign', 'MGA-Dataset', 'POA']) {
    await page.locator('.VPNavBarSearch button').click();
    const input = page.locator('#localsearch-input');
    await input.fill(query);
    await page.locator('.VPLocalSearchBox .results li').first().waitFor();
    const found = await page.locator('.VPLocalSearchBox .results').innerText();
    assert.ok(found.length > 0);
    report.searches.push({ query, results: found.slice(0, 220) });
    await page.keyboard.press('Escape');
  }
  await page.locator('.VPNavBarSearch button').click();
  await page.locator('#localsearch-input').fill('贡献指南');
  await page.locator('.VPLocalSearchBox .results, .VPLocalSearchBox .no-results').first().waitFor();
  assert.equal(await page.locator('.VPLocalSearchBox a[href*="contributing"]').count(), 0);
  assert.doesNotMatch(await page.locator('.VPLocalSearchBox').innerText(), /#\s*贡献指南/);
  await page.keyboard.press('Escape');
  await page.goto(new URL('basics/pairwise.html', origin).href, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.VPDoc .aside').count(), 0, 'No separate right outline');
  assert.equal(await page.locator('#local-search').count(), 1, 'One search instance');
  assert.equal(await page.getByRole('tab', { name: '文档目录', exact: true }).getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('.reading-group-title[aria-expanded="true"]').count(), 1);
  assert.equal(await page.locator('.reading-group-title[aria-expanded="true"]').innerText(), '比对基础');
  const beforeTab = await page.evaluate(() => scrollY);
  await page.getByRole('tab', { name: '文档目录', exact: true }).press('ArrowRight');
  assert.equal(await page.getByRole('tab', { name: '本页内容', exact: true }).getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#reading-panel-documents').isVisible(), false);
  assert.equal(await page.evaluate(() => scrollY), beforeTab, 'Tab switch preserves article position');
  assert.equal(await page.locator('.reading-outline a').count(), await page.locator('.vp-doc h2[id], .vp-doc h3[id]').count());
  await page.locator('.reading-outline').getByRole('link', { name: '仿射空位罚分', exact: true }).click();
  await page.waitForURL(/#%E4%BB%BF%E5%B0%84%E7%BD%9A%E5%88%86$/);
  await page.waitForFunction(() => document.querySelector('.reading-outline a[aria-current="location"]')?.textContent === '仿射空位罚分');
  await page.getByRole('tab', { name: '本页内容', exact: true }).press('Home');
  await page.locator('.reading-navigation').getByRole('link', { name: '多序列比对', exact: true }).click();
  await page.waitForURL('**/basics/multiple.html');
  assert.equal(await page.getByRole('tab', { name: '文档目录', exact: true }).getAttribute('aria-selected'), 'true');
  await page.goto(new URL('basics/pairwise.html', origin).href, { waitUntil: 'networkidle' });
  report.readingNavigation = 'passed';
  assert.match(await page.title(), / \| MSA$/);
  assert.ok(await page.locator('mjx-container').count() > 0);
  await page.screenshot({ path: artifact('formulas-desktop.png'), fullPage: true });
  await page.locator('.VPSwitchAppearance').first().click();
  assert.ok(await page.locator('html').evaluate(e => e.classList.contains('dark')));
  await page.screenshot({ path: artifact('formulas-dark.png'), fullPage: true });
  await page.locator('.VPSwitchAppearance').first().click();
  await page.goto(new URL('software/third-party.html', origin).href, { waitUntil: 'networkidle' });
  await page.locator('.vp-doc table').first().screenshot({ path: artifact('table.png') });
  const code = page.locator('.vp-doc div[class*="language-"]').first();
  await code.scrollIntoViewIfNeeded();
  await code.screenshot({ path: artifact('code.png') });
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await code.locator('button.copy').click();
  assert.ok((await page.evaluate(() => navigator.clipboard.readText())).trim().length > 0);
  await page.goto(new URL('basics/genome.html', origin).href, { waitUntil: 'networkidle' });
  await page.locator('.vp-doc img').first().screenshot({ path: artifact('figure.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const p of getPages('docs')) {
    await page.goto(new URL(p.relative.replace(/\.md$/, '.html'), origin).href, { waitUntil: 'networkidle' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `mobile overflow ${p.relative}`);
  }
  await page.goto(new URL('software/third-party.html', origin).href, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '文档导航' }).click();
  await page.waitForFunction(() => {
    const nav = document.querySelector('.VPSidebar.open');
    return nav && Math.abs(nav.getBoundingClientRect().left) < 1;
  });
  await page.screenshot({ path: artifact('mobile-navigation.png') });
  assert.equal(await page.locator('.VPSidebar').getAttribute('role'), 'dialog');
  await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'tab');
  await page.getByRole('tab', { name: '本页内容', exact: true }).click();
  await page.locator('.reading-outline a').first().click();
  await page.locator('.VPSidebar.open').waitFor({ state: 'detached' });
  assert.equal(await page.locator('.VPSidebar').evaluate(e => e.hasAttribute('inert')), true);
  assert.notEqual(await page.locator('body').evaluate(e => getComputedStyle(e).overflow), 'hidden');
  await page.getByRole('button', { name: '文档导航', exact: true }).click();
  await page.getByRole('tab', { name: '本页内容', exact: true }).press('Escape');
  await page.locator('.VPSidebar.open').waitFor({ state: 'detached' });
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-controls')), 'VPSidebarNav');
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.screenshot({ path: artifact('home-mobile.png'), fullPage: true });
  await page.locator('.VPNavBarSearch button').click();
  await page.locator('#localsearch-input').fill('MGA-Dataset');
  await page.locator('.VPLocalSearchBox .results li').first().waitFor();
  assert.match(await page.locator('.VPLocalSearchBox .results').innerText(), /MGA-Dataset/);
  await page.keyboard.press('Escape');
  report.mobileSearch = 'passed';
  const redirects = JSON.parse(fs.readFileSync('migration/redirects.json', 'utf8'));
  for (const [old, target] of Object.entries(redirects)) {
    await page.goto(new URL(old, origin).href, { waitUntil: 'networkidle' });
    await page.waitForURL(new URL(target, origin).href);
  }
  for (const [old, target] of [['psa.html#toptitle', 'basics/pairwise.html'], ['msaligners.html#TABLENAME', 'software/third-party.html#catalog']]) {
    await page.goto(new URL(old, origin).href, { waitUntil: 'networkidle' });
    await page.waitForURL(new URL(target, origin).href);
  }
  report.screenshots = ['home-desktop.png', 'home-dark.png', 'formulas-desktop.png', 'formulas-dark.png', 'mobile-navigation.png', 'home-mobile.png', 'table.png', 'code.png', 'figure.png'];
  expectedMissing = true;
  for (const route of ['not-a-page.html', 'development/contributing.html']) {
    const missing = await page.goto(new URL(route, origin).href);
    assert.equal(missing.status(), 404, route);
  }
  report.contributionPageRemoved = 'passed';
  assert.deepEqual(errors, []);
  report.status = 'passed'; report.redirects = Object.keys(redirects).length;
} finally {
  report.errors = errors;
  fs.writeFileSync(artifact('browser-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
