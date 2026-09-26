import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
if (Number(process.versions.node.split('.')[0]) !== 24) {
  console.error(`需要 Node.js 24，当前是 ${process.version}。请安装正确版本后重试。`);
  process.exit(1);
}
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(args) {
  const r = spawnSync(npm, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.error || r.status !== 0) {
    console.error('命令未完成。请检查上方错误；安装失败时检查网络后重新启动。', r.error?.message || '');
    process.exit(r.status || 1);
  }
}
const hash = `${process.platform}/${process.arch}/24/` + createHash('sha256').update(fs.readFileSync('package-lock.json')).digest('hex');
const previous = fs.existsSync('.preview-lock') ? fs.readFileSync('.preview-lock', 'utf8') : '';
if (!fs.existsSync('node_modules/vitepress/package.json') || previous !== hash) {
  run(['ci']);
  fs.writeFileSync('.preview-lock', hash);
}
console.log('正在启动实时预览；浏览器打开终端显示的地址。结束请按 Ctrl+C。');
run(['run', 'dev', '--', '--open']);
