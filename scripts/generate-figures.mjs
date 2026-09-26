// Editable, self-contained SVG teaching figures. Run npm run figures after editing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const output = fileURLToPath(new URL('../docs/public/images/', import.meta.url));
export const style = { width: 560, ink: '#27343b', muted: '#58666e', line: '#cdd7db', teal: '#087f8c', tealSoft: '#e9f5f5', orange: '#a75b28', orangeSoft: '#fbf0e7', white: '#ffffff' };
export const examples = {
  star: {
    sequences: ['ACGT', 'AGT', 'ACGTT'],
    labels: ['S1', 'S2', 'S3'],
    scoring: { match: 2, mismatch: -1, gap: -2 },
    pairs: [['ACGT', 'A-GT'], ['ACGT-', 'ACGTT']],
    merged: ['ACGT-', 'A-GT-', 'ACGTT']
  },
  affine: { sequences: ['AAAAA', 'AAA'], rows: [['AAAAA', 'AAA--'], ['AAAAA', 'A-A-A']], match: 2, open: 3, extend: 1 },
  guide: { leaves: ['S1', 'S3', 'S2', 'S4'], merges: [['S1', 'S3'], ['S1', 'S3', 'S2'], ['S1', 'S3', 'S2', 'S4']] },
  poa: { prefix: 'CCGC', branches: ['TTTT', 'AAAA'], suffix: 'CCGC', sequences: ['CCGCTTTTCCGC', 'CCGCAAAACCGC'] },
  dag: { nodes: { C: 'C', A: 'A', T1: 'T', G: 'G', T2: 'T' }, edges: [['C', 'A'], ['C', 'T1'], ['A', 'T2'], ['T1', 'G'], ['G', 'T2']], current: 'T2', query: 'AAGGC', j: 3 }
};

const escape = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
function text(x, y, value, { size = 24, color = style.ink, weight = 400, anchor = 'start', mono = false } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}" dominant-baseline="middle"${mono ? ' class="mono"' : ''}>${escape(value)}</text>`;
}
function rect(x, y, w, h, fill, stroke = 'none') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
}
function line(x1, y1, x2, y2, color = style.line, arrow = false) {
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="1.8"${arrow ? ' marker-end="url(#arrow)"' : ''}/>`;
}
function svg(title, description, height, elements) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="560" height="${height}" viewBox="0 0 560 ${height}" role="img" aria-labelledby="title desc">
<title id="title">${escape(title)}</title>
<desc id="desc">${escape(description)}</desc>
<style>text{font-family:"Segoe UI","Microsoft YaHei","PingFang SC",Arial,sans-serif}.mono{font-family:Consolas,"DejaVu Sans Mono",monospace}</style>
<defs><marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 1 1 L 7 4 L 1 7" fill="none" stroke="${style.muted}" stroke-width="1.2"/></marker></defs>
${rect(0, 0, 560, height, style.white)}
${elements.join('\n')}
</svg>
`;
}
const heading = (y, value) => text(32, y, value, { weight: 600 });
function sequence(label, value, y, { center = false, marked = [], markColor = style.tealSoft } = {}) {
  const x = 176, step = 52;
  const elements = [text(72, y, label, { mono: true, size: 27, weight: center ? 600 : 400, color: center ? style.teal : style.ink })];
  [...value].forEach((c, i) => {
    if (c === '-' || marked.includes(i)) elements.push(rect(x + i * step - 21, y - 21, 42, 42, marked.includes(i) ? markColor : style.tealSoft));
    elements.push(text(x + i * step, y, c, { size: 30, mono: true, anchor: 'middle', color: center ? style.teal : style.ink, weight: center ? 600 : 400 }));
  });
  return elements;
}

export function pairScore(s, t, scoring = examples.star.scoring) {
  let prev = Array.from({ length: t.length + 1 }, (_, j) => j * scoring.gap);
  for (let i = 1; i <= s.length; i++) {
    const row = [i * scoring.gap];
    for (let j = 1; j <= t.length; j++) row[j] = Math.max(prev[j - 1] + (s[i - 1] === t[j - 1] ? scoring.match : scoring.mismatch), prev[j] + scoring.gap, row[j - 1] + scoring.gap);
    prev = row;
  }
  return prev[t.length];
}
export function starScores() {
  const { sequences } = examples.star;
  const matrix = sequences.map((s, i) => sequences.map((t, j) => i === j ? null : pairScore(s, t)));
  const totals = matrix.map(row => row.reduce((a, b) => a + (b ?? 0), 0));
  return { matrix, totals, center: totals.indexOf(Math.max(...totals)) };
}
export function affineBreakdown(a, b) {
  const { match, open, extend } = examples.affine;
  let reward = 0, previous = '', openings = 0, extensions = 0;
  if (a.length !== b.length) throw new Error('Unequal aligned lengths');
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '-' && b[i] === '-') throw new Error('Double-gap column');
    const direction = a[i] === '-' ? 'a' : b[i] === '-' ? 'b' : '';
    if (direction) direction === previous ? extensions++ : openings++;
    else if (a[i] === b[i]) reward += match;
    else throw new Error('This affine illustration contains matches and gaps only');
    previous = direction;
  }
  return { reward, openings, extensions, score: reward - openings * open - extensions * extend };
}

function affineFigure() {
  const a = examples.affine, e = [];
  a.rows.forEach((rows, index) => {
    const y = index * 280, stats = affineBreakdown(...rows);
    e.push(heading(y + 36, index ? '② 分散空位' : '① 连续空位'));
    e.push(...sequence('S', rows[0], y + 90), ...sequence('T', rows[1], y + 140));
    const gapPositions = [...rows[1]].flatMap((c, i) => c === '-' ? [176 + 52 * i] : []);
    const labelPositions = index ? [228, 332] : [310, 418];
    gapPositions.forEach((x, j) => {
      const opening = index || j === 0;
      e.push(line(x, y + 164, labelPositions[j], y + 186, style.muted));
      e.push(text(labelPositions[j], y + 204, `${opening ? '开启' : '延伸'} −${opening ? a.open : a.extend}`, { anchor: 'middle', size: 22, color: opening ? style.orange : style.teal }));
    });
    e.push(text(40, y + 252, index ? `${stats.reward} − ${a.open} − ${a.open} = ${stats.score}` : `${stats.reward} − (${a.open} + ${a.extend}) = ${stats.score}`, { size: 26, weight: 600 }));
  });
  e.push(line(32, 280, 528, 280));
  return svg('连续与分散空位的仿射罚分', 'AAAAA 与 AAA 的两种排列。AAA-- 开启一次、延伸一次，得分 2；A-A-A 开启两次，得分 0。', 568, e);
}
function centerFigure() {
  const { labels, sequences } = examples.star;
  const { matrix, totals, center } = starScores();
  const e = [];
  sequences.forEach((s, i) => e.push(text(40, 42 + 39 * i, labels[i], { mono: true, color: i === center ? style.teal : style.ink, weight: i === center ? 600 : 400 }), text(148, 42 + 39 * i, s, { mono: true, size: 28 })));
  const columns = [166, 258, 350, 466];
  ['S1', 'S2', 'S3', '总分'].forEach((s, j) => e.push(text(columns[j], 185, s, { anchor: 'middle', weight: 600 })));
  e.push(text(320, 42, '中心序列', { size: 22, color: style.teal }));
  e.push(line(32, 209, 528, 209));
  matrix.forEach((row, i) => {
    const y = 244 + i * 54;
    if (i === center) e.push(rect(32, y - 25, 496, 50, style.tealSoft));
    e.push(text(54, y, labels[i], { mono: true, weight: i === center ? 600 : 400, color: i === center ? style.teal : style.ink }));
    [...row, totals[i]].forEach((v, j) => e.push(text(columns[j], y, v ?? '—', { mono: true, size: 27, anchor: 'middle', color: i === center ? style.teal : style.ink, weight: j === 3 ? 600 : 400 })));
  });
  e.push(line(408, 169, 408, 378), line(32, 382, 528, 382));

  return svg('按两两比对得分选择中心序列', 'S1=ACGT，S2=AGT，S3=ACGTT。匹配加2、错配减1、空位减2。两两得分4、6、2，总分10、6、8，选择S1。', 406, e);
}
function pairsFigure() {
  const e = [];
  examples.star.pairs.forEach(([s, t], i) => {
    const y = i * 204;
    e.push(heading(y + 36, `S1 ↔ S${i + 2}`));
    e.push(text(378, y + 36, '两两比对', { size: 22, color: style.muted }));
    e.push(...sequence('S1', s, y + 92, { center: true }), ...sequence(`S${i + 2}`, t, y + 142));

  });
  e.push(line(32, 212, 528, 212));
  return svg('中心序列与其余序列分别比对', 'S1 ACGT 与 S2 A-GT 得分4；S1 ACGT- 与 S3 ACGTT 得分6。蓝绿色始终表示中心S1，浅底表示空位。', 420, e);
}
function mergeFigure() {
  const e = [heading(36, '① 已有比对'), ...sequence('S1', examples.star.pairs[0][0], 91, { center: true }), ...sequence('S2', examples.star.pairs[0][1], 141)];
  e.push(line(280, 176, 280, 206, style.muted, true));
  e.push(heading(245, '② 同步空位'));
  examples.star.merged.slice(0, 2).forEach((row, i) => e.push(...sequence(`S${i + 1}`, row, 300 + i * 50, { center: i === 0, marked: [4], markColor: style.orangeSoft })));

  e.push(line(280, 424, 280, 454, style.muted, true));
  e.push(heading(490, '③ 合并结果'));
  examples.star.merged.forEach((row, i) => e.push(...sequence(`S${i + 1}`, row, 544 + i * 50, { center: i === 0 })));
  return svg('同步空位并合并三条序列', '先保留S1与S2已有的比对，再同步补入S1的新末端空位，最后加入S3。结果为ACGT-、A-GT-、ACGTT。', 684, e);
}
function guideFigure() {
  const e = [heading(24, '合并顺序')];
  const branches = [[306,64,306,136],[306,64,408,64],[306,136,408,136],[208,100,306,100],[208,100,208,232],[208,232,408,232],[112,166,208,166],[112,166,112,332],[112,332,408,332]];
  branches.forEach(coords => e.push(line(...coords, style.muted)));
  examples.guide.leaves.forEach((name, i) => e.push(text(430, [64,136,232,332][i], name, { mono: true, size: 30 })));
  [[306,100],[208,166],[112,249]].forEach(([x,y],i) => {
    e.push(`<circle cx="${x}" cy="${y}" r="19" fill="${style.teal}"/>`, text(x,y,i+1,{anchor:'middle',size:23,color:style.white,weight:600}));
  });

  return svg('指导树中的渐进式合并顺序', '先合并S1与S3，再加入S2，最后加入S4。树的枝长只用于排版，不表示进化距离。', 372, e);
}
export function figures() {
  return new Map([
    ['pairwise-affine-gaps.svg', affineFigure()],
    ['msa-star-center.svg', centerFigure()],
    ['msa-star-pairs.svg', pairsFigure()],
    ['msa-star-merge.svg', mergeFigure()],
    ['msa-guide-tree.svg', guideFigure()]
  ]);
}
export function checkFigures() {
  for (const [name, contents] of figures()) {
    const file=path.join(output,name);
    if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==contents) throw new Error(`配图未更新：${name}；请运行 npm run figures。`);
  }
  console.log('SVG 配图检查通过：5 张，与生成脚本一致。');
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  if(process.argv.includes('--check'))checkFigures();
  else{
    fs.mkdirSync(output,{recursive:true});
    for(const [name,contents] of figures())fs.writeFileSync(path.join(output,name),contents);
    console.log('已生成 5 张 SVG 教学配图。');
  }
}
