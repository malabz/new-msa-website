import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('发布保留 site 连续历史并跳过过期源码', () => {
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'msa-publish-test-'));
  const repo=path.join(temp,'source'), remote=path.join(temp,'remote.git');
  fs.mkdirSync(repo);
  const script=path.resolve('scripts/publish.mjs');
  function git(args,cwd=repo) {
    const r=spawnSync('git',args,{cwd,encoding:'utf8'}); assert.equal(r.status,0,r.stderr); return r.stdout.trim();
  }
  function nextSource(value) {
    fs.writeFileSync(path.join(repo,'source.md'),value);
    git(['add','source.md']); git(['-c','user.name=QA','-c','user.email=qa@example.invalid','commit','-m',value]);
    git(['push','origin','main']); return git(['rev-parse','HEAD']);
  }
  const dist=path.join(repo,'docs/.vitepress/dist');
  function publish(source) {
    fs.mkdirSync(dist,{recursive:true});
    fs.writeFileSync(path.join(dist,'index.html'),'<h1>'+source+'</h1>');
    fs.writeFileSync(path.join(dist,'release.json'),JSON.stringify({source}));
    const r=spawnSync(process.execPath,[script],{cwd:repo,encoding:'utf8',env:{...process.env,GITHUB_SHA:source}});
    assert.equal(r.status,0,r.stdout+r.stderr);
    return git(['ls-remote','origin','refs/heads/site']).split(/\s+/)[0];
  }
  try {
    git(['init','--bare',remote]); git(['init','-b','main']); git(['remote','add','origin',remote]);
    const firstSource=nextSource('first'), firstSite=publish(firstSource);
    const secondSource=nextSource('second'), secondSite=publish(secondSource);
    assert.notEqual(firstSite,secondSite);
    git(['merge-base','--is-ancestor',firstSite,secondSite],remote);
    assert.equal(publish(firstSource),secondSite);
  } finally { fs.rmSync(temp,{recursive:true,force:true}); }
});
