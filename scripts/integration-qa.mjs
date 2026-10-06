import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const repo = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'msa-build-qa-'));
try {
  for (const name of ['docs','scripts','migration','package.json']) {
    fs.cpSync(path.join(repo,name),path.join(temp,name),{recursive:true, filter: p => !p.includes(`${path.sep}.vitepress${path.sep}dist`) && !p.includes(`${path.sep}.vitepress${path.sep}cache`)});
  }
  fs.symlinkSync(path.join(repo,'node_modules'),path.join(temp,'node_modules'),process.platform === 'win32' ? 'junction' : 'dir');
  const article=path.join(temp,'docs/basics/new-contribution.md');
  fs.writeFileSync(article,'# 新增协作文章\n\n新增中文检索验收词。\n');
  const build=()=>spawnSync(process.execPath,['scripts/build.mjs'],{cwd:temp,encoding:'utf8',env:{...process.env,SITE_BASE:'/'},maxBuffer:8*1024*1024});
  let r=build(); assert.equal(r.status,0,r.stdout+r.stderr);
  const dist=path.join(temp,'docs/.vitepress/dist');
  assert.ok(fs.existsSync(path.join(dist,'basics/new-contribution.html')));
  assert.ok(fs.readFileSync(path.join(dist,'basics/pairwise.html'),'utf8').includes('new-contribution.html'));
  const chunks=fs.readdirSync(path.join(dist,'assets')).filter(p=>p.endsWith('.js')).map(p=>fs.readFileSync(path.join(dist,'assets',p),'utf8')).join('\n');
  assert.ok(chunks.includes('新增协作文章'));
  assert.ok(chunks.includes('new-contribution'));
  console.log('新增 Markdown 自动进入构建、导航和搜索产物：通过。');
  fs.appendFileSync(article,'\n[故意失效的站内链接](missing-test-page.md)\n');
  r=build(); assert.notEqual(r.status,0,'Broken link must fail build');
  assert.ok(!fs.existsSync(path.join(dist,'release.json')),'Failed build must remove publication marker');
  console.log('故意制造失效链接：构建失败，发布标记不存在；通过。');
} finally { fs.rmSync(temp,{recursive:true,force:true}); }
