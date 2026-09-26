// Browser checks for the actual SVG artwork and its Markdown integration.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { figures } from './generate-figures.mjs';

const origin = process.env.QA_URL || 'http://127.0.0.1:4173/';
const output = path.resolve(process.env.QA_OUTPUT_DIR || 'qa-output/figures');
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.QA_CHROME ? { executablePath: process.env.QA_CHROME } : {}) });
const page = await browser.newPage({ viewport: { width: 760, height: 1100 } });
const report = { origin, checkedAt: new Date().toISOString(), artwork: [], pages: [], errors: [] };
page.on('pageerror', e => report.errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') report.errors.push(`${m.text()} ${m.location().url}`); });
page.on('response', r => { if (r.status() >= 400) report.errors.push(`${r.status()} ${r.url()}`); });
try {
  for (const name of figures().keys()) {
    const response = await page.request.get(new URL(`images/${name}`, origin).href);
    assert.equal(response.status(), 200);
    // Inspect served artwork in a neutral document, avoiding Chrome's implicit
    // /favicon.ico request when an SVG (rather than the site) is opened directly.
    await page.setContent('<!doctype html><head><link rel="icon" href="data:,"></head><body style="margin:0">' + (await response.text()).replace(/<\?xml[^?]*\?>/, '') + '</body>');
    const geometry = await page.evaluate(() => {
      const svg = document.querySelector('svg'), root = svg.getBoundingClientRect();
      const texts = [...svg.querySelectorAll('text')].map(el => {
        const b = el.getBoundingClientRect();
        return { text: el.textContent, x: b.left, y: b.top, right: b.right, bottom: b.bottom, size: parseFloat(getComputedStyle(el).fontSize) };
      });
      const clipped = texts.filter(b => b.x < root.left || b.y < root.top || b.right > root.right || b.bottom > root.bottom);
      const overlaps = [];
      for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i], b = texts[j];
        if (Math.min(a.right, b.right) - Math.max(a.x, b.x) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 1) overlaps.push([a.text, b.text]);
      }
      return { clipped, overlaps, minFont: Math.min(...texts.map(t => t.size)) };
    });
    assert.deepEqual(geometry.clipped, [], `${name}: clipped labels`);
    assert.deepEqual(geometry.overlaps, [], `${name}: overlapping labels`);
    assert.ok(geometry.minFont >= 22, `${name}: labels too small`);
    await page.locator('svg').screenshot({ path: path.join(output, name.replace('.svg', '-artwork.png')) });
    report.artwork.push({ name, ...geometry });
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of ['basics/pairwise.html', 'basics/multiple.html']) {
      await page.goto(new URL(route, origin).href, { waitUntil: 'networkidle' });
      const imgs = page.locator('.vp-doc img');
      assert.equal(await imgs.count(), route.includes('pairwise') ? 1 : 6);
      assert.equal(await page.locator('mjx-merror, [data-mjx-error]').count(), 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      for (const dark of [false, true]) {
        const isDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
        if (isDark !== dark) await page.locator('.VPSwitchAppearance').first().evaluate(el => el.click());
        for (let i = 0; i < await imgs.count(); i++) {
          const img = imgs.nth(i), data = await img.evaluate(el => ({ src: el.src, loaded: el.complete && el.naturalWidth > 0, width: el.getBoundingClientRect().width, alt: el.alt }));
          assert.ok(data.loaded && data.alt.length > 20);
          const name = new URL(data.src).pathname.split('/').at(-1);
          assert.ok(figures().has(name) || ['msa-6.png', 'msa-7.png'].includes(name));
          assert.ok(data.width > 0 && data.width <= width);
          if (figures().has(name)) assert.ok(data.width >= 340 && data.width <= 561);
          await img.screenshot({ path: path.join(output, `${width}-${dark ? 'dark' : 'light'}-${name.replace('.svg', '.png')}`) });
        }
        await page.locator('.vp-doc img').first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `${width}-${dark ? 'dark' : 'light'}-${route.split('/').at(-1).replace('.html', '-page.png')}`) });
      }
      report.pages.push({ route, width, themes: ['light', 'dark'] });
    }
  }
  for (const [old, target] of [['psa.html#仿射罚分', 'basics/pairwise.html#仿射罚分'], ['msa.html#星比对', 'basics/multiple.html#星比对'], ['msa.html#dag-与序列的比对', 'basics/multiple.html#dag-与序列的比对']]) {
    await page.goto(new URL(old, origin).href, { waitUntil: 'networkidle' });
    await page.waitForURL(url => decodeURI(url.href) === decodeURI(new URL(target, origin).href));
    assert.ok(await page.evaluate(() => !!document.getElementById(decodeURIComponent(location.hash.slice(1)))));
  }
  assert.deepEqual(report.errors, []);
  report.status = 'passed';
} finally {
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
