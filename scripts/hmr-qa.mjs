import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const file='docs/basics/qa-temporary-article.md';
if(fs.existsSync(file)) throw new Error('QA 临时文件已存在，拒绝覆盖。');
const origin=process.env.QA_URL || 'http://127.0.0.1:5173/';
const browser=await chromium.launch({headless:true,...(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME}:{})});
const page=await browser.newPage();
try {
  await page.goto(origin,{waitUntil:'networkidle'});
  fs.writeFileSync(file,'# 自动导航验收文章\n\n实时预览初始正文。\n');
  let ready=false;
  for(let i=0;i<30;i++) {
    try {
      await page.goto(new URL('basics/qa-temporary-article.html',origin).href,{waitUntil:'networkidle',timeout:5000});
      if(await page.locator('h1').filter({hasText:'自动导航验收文章'}).count()) {ready=true;break;}
    } catch {}
    await new Promise(r=>setTimeout(r,500));
  }
  assert.ok(ready,'New Markdown route must appear without restarting manually');
  await page.locator('.reading-navigation a').filter({hasText:'自动导航验收文章'}).waitFor();
  fs.appendFileSync(file,'\n实时更新验收成功。\n');
  await page.getByText('实时更新验收成功。',{exact:true}).waitFor();
  fs.writeFileSync(file,'---\ntitle: 自动排序验收\norder: 0\n---\n# 自动排序验收\n\nMSAReadingRefreshProbe\n');
  await page.locator('.vp-doc h1').filter({hasText:'自动排序验收'}).waitFor();
  await page.waitForFunction(() => document.querySelector('.reading-group a')?.textContent === '自动排序验收');
  await page.locator('.VPNavBarSearch button').click();
  await page.locator('#localsearch-input').fill('MSAReadingRefreshProbe');
  await page.locator('.VPLocalSearchBox a[href*="qa-temporary-article"]').first().waitFor();
  await page.keyboard.press('Escape');
  console.log('新增 Markdown 导航、路由、标题排序、正文与搜索热更新：通过。');
} finally {
  fs.rmSync(file,{force:true});
  await browser.close();
}
