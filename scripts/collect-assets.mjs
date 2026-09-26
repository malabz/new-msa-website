// One-time migration helper. Does not download genomic datasets.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const assets = JSON.parse(fs.readFileSync('migration/assets.json', 'utf8'));
fs.mkdirSync('docs/public/images', { recursive: true });
for (const asset of assets) {
  const result = spawnSync('curl', ['--fail', '--location', '--silent', '--show-error', '--max-time', '20', asset.source, '--output', asset.file], { encoding: 'utf8' });
  const data = fs.existsSync(asset.file) ? fs.readFileSync(asset.file) : Buffer.alloc(0);
  const png = data.length > 8 && data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (result.status === 0 && png) {
    asset.status = 'localized'; asset.bytes = data.length;
  } else {
    fs.rmSync(asset.file, { force: true });
    asset.status = 'unavailable'; asset.error = result.stderr.trim() || 'Response was not a PNG image';
    const file = path.join('docs', asset.page);
    const md = fs.readFileSync(file, 'utf8');
    const image = '/images/' + path.basename(asset.file);
    fs.writeFileSync(file, md.replace(new RegExp('!\\[[^\\]]*\\]\\(' + image.replaceAll('.', '\\.') + '\\)', 'g'), `> 原图暂时无法取得：[查看图片来源](${asset.source})。相关图注保留如下。`));
  }
  console.log(asset.file, asset.status);
}
fs.writeFileSync('migration/assets.json', JSON.stringify(assets, null, 2) + '\n');
