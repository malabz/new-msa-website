import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const dist = path.resolve('docs/.vitepress/dist');
const release = JSON.parse(fs.readFileSync(path.join(dist, 'release.json'), 'utf8'));
const source = process.env.GITHUB_SHA;
if (!source || release.source !== source) throw new Error('构建来源与待发布提交不一致。');
function git(args, cwd = process.cwd(), allowFailure = false) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0 && !allowFailure) throw new Error(r.stderr || `git ${args[0]} failed`);
  return r;
}
function isCurrent() {
  const remote = git(['ls-remote', '--exit-code', 'origin', 'refs/heads/main']).stdout.trim().split(/\s+/)[0];
  return remote === source;
}
if (!isCurrent()) { console.log('源码已更新，跳过旧构建发布。'); process.exit(0); }
const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'msa-publish-'));
const work = path.join(parent, 'site');
const exists = git(['ls-remote', '--exit-code', 'origin', 'refs/heads/site'], undefined, true);
if (![0, 2].includes(exists.status)) throw new Error(exists.stderr);
if (exists.status === 0) {
  git(['fetch', 'origin', 'refs/heads/site:refs/remotes/origin/site']);
  git(['worktree', 'add', '--detach', work, 'refs/remotes/origin/site']);
} else {
  git(['worktree', 'add', '--detach', work, 'HEAD']);
  git(['checkout', '--orphan', 'msa-site-initial'], work);
}
try {
  // Work is a newly-created isolated worktree, never the source checkout.
  for (const entry of fs.readdirSync(work)) {
    if (entry !== '.git') fs.rmSync(path.join(work, entry), { recursive: true, force: true });
  }
  fs.cpSync(dist, work, { recursive: true });
  git(['add', '-A'], work);
  if (git(['diff', '--cached', '--quiet'], work, true).status === 0) process.exitCode = 0;
  else {
    git(['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-m', `Build site from ${source}`], work);
    if (isCurrent()) git(['push', 'origin', 'HEAD:refs/heads/site'], work);
    else console.log('提交前源码已更新，本次不推送。');
  }
} finally {
  git(['worktree', 'remove', '--force', work], undefined, true);
  fs.rmSync(parent, { recursive: true, force: true });
}
