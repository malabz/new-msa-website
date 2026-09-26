import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

test('服务器首次部署、快进、失败保留和非空目录保护', { skip: process.platform === 'win32' }, () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'msa-deploy-test-'));
  const remote = path.join(temp, 'repository'), deploy = path.join(temp, 'deploy');
  fs.mkdirSync(remote);
  function git(args) {
    const r = spawnSync('git', args, { cwd: remote, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
  }
  function commit(version, valid = true) {
    fs.writeFileSync(path.join(remote, 'index.html'), `<h1>${version}</h1>`);
    fs.writeFileSync(path.join(remote, '404.html'), '<h1>404</h1>');
    fs.writeFileSync(path.join(remote, 'release.json'), JSON.stringify({ source: version }));
    fs.writeFileSync(path.join(remote, 'FILES.sha256'), ['index.html','404.html','release.json'].map(p => createHash('sha256').update(fs.readFileSync(path.join(remote, p))).digest('hex') + '  ' + p).join('\n') + '\n');
    if (!valid) fs.writeFileSync(path.join(remote, 'index.html'), 'tampered');
    git(['add', '.']); git(['-c','user.name=QA','-c','user.email=qa@example.invalid','commit','-m',version]);
    return git(['rev-parse','HEAD']);
  }
  const script=path.resolve('deploy/update-site.sh');
  const update=target=>spawnSync('bash',[script,remote,target],{encoding:'utf8'});
  try {
    git(['init','-b','site']);
    const first=commit('v1');
    let r=update(deploy); assert.equal(r.status,0,r.stderr);
    assert.equal(fs.readlinkSync(path.join(deploy,'current')),`releases/${first}`);
    const second=commit('v2');
    r=update(deploy); assert.equal(r.status,0,r.stderr);
    assert.equal(fs.readlinkSync(path.join(deploy,'current')),`releases/${second}`);
    assert.ok(fs.existsSync(path.join(deploy,'releases',first)));
    commit('v3-broken',false); r=update(deploy); assert.notEqual(r.status,0);
    assert.equal(fs.readlinkSync(path.join(deploy,'current')),`releases/${second}`);
    const unrelated=path.join(temp,'unrelated'); fs.mkdirSync(unrelated); fs.writeFileSync(path.join(unrelated,'keep'),'keep');
    assert.notEqual(update(unrelated).status,0);
    assert.equal(fs.readFileSync(path.join(unrelated,'keep'),'utf8'),'keep');
  } finally { fs.rmSync(temp,{recursive:true,force:true}); }
});
