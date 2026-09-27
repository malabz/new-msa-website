import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
test('Apache 更新：完整性、路径安全、无变化、并发、暂停与失败回退', { skip: process.platform === 'win32' }, () => {
  const result = spawnSync('python3', ['tests/apache-updater-check.py'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
