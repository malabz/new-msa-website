import { chromium } from 'playwright';
import fs from 'node:fs';
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
fs.mkdirSync('qa-output', { recursive: true });
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
    report.pages.push(p.relative);
  }
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'qa-output/home-desktop.png', fullPage: true });
  report.screenshots.push('home-desktop.png');
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
  await page.goto(new URL('basics/pairwise.html', origin).href, { waitUntil: 'networkidle' });
  assert.ok(await page.locator('mjx-container').count() > 0);
  await page.screenshot({ path: 'qa-output/formulas-desktop.png', fullPage: true });
  await page.locator('.VPSwitchAppearance').first().click();
  assert.ok(await page.locator('html').evaluate(e => e.classList.contains('dark')));
  await page.screenshot({ path: 'qa-output/formulas-dark.png', fullPage: true });
  await page.locator('.VPSwitchAppearance').first().click();
  await page.goto(new URL('software/third-party.html', origin).href, { waitUntil: 'networkidle' });
  await page.locator('.vp-doc table').first().screenshot({ path: 'qa-output/table.png' });
  const code = page.locator('.vp-doc div[class*="language-"]').first();
  await code.scrollIntoViewIfNeeded();
  await code.screenshot({ path: 'qa-output/code.png' });
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await code.locator('button.copy').click();
  assert.ok((await page.evaluate(() => navigator.clipboard.readText())).trim().length > 0);
  await page.goto(new URL('basics/genome.html', origin).href, { waitUntil: 'networkidle' });
  await page.locator('.vp-doc img').first().screenshot({ path: 'qa-output/figure.png' });
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
  await page.screenshot({ path: 'qa-output/mobile-navigation.png' });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'qa-output/home-mobile.png', fullPage: true });
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
  report.screenshots = ['home-desktop.png', 'formulas-desktop.png', 'formulas-dark.png', 'mobile-navigation.png', 'home-mobile.png', 'table.png', 'code.png', 'figure.png'];
  expectedMissing = true;
  const missing = await page.goto(new URL('not-a-page.html', origin).href);
  assert.equal(missing.status(), 404);
  assert.deepEqual(errors, []);
  report.status = 'passed'; report.redirects = Object.keys(redirects).length;
} finally {
  report.errors = errors;
  fs.writeFileSync('qa-output/browser-report.json', JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
