import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { examples, figures, starScores, pairScore, affineBreakdown } from '../scripts/generate-figures.mjs';

// Independent exhaustive enumeration: no DP table or generator scoring helper.
function exhaustive(a, b) {
  if (!a.length) return -2 * b.length;
  if (!b.length) return -2 * a.length;
  return Math.max((a[0] === b[0] ? 2 : -1) + exhaustive(a.slice(1), b.slice(1)),
    -2 + exhaustive(a.slice(1), b), -2 + exhaustive(a, b.slice(1)));
}
const restore = row => row.replaceAll('-', '');
function alignedScore(a, b) {
  assert.equal(a.length, b.length);
  return [...a].reduce((score, c, i) => {
    assert.ok(c !== '-' || b[i] !== '-');
    return score + (c === '-' || b[i] === '-' ? -2 : c === b[i] ? 2 : -1);
  }, 0);
}
test('star matrix, optimal pairs and synchronized gap merge', () => {
  const s = examples.star;
  for (const a of ['', 'A', 'T', ...s.sequences]) for (const b of ['', 'A', 'T', ...s.sequences]) assert.equal(pairScore(a, b), exhaustive(a, b));
  assert.deepEqual(starScores(), { matrix: [[null, 4, 6], [4, null, 2], [6, 2, null]], totals: [10, 6, 8], center: 0 });
  s.pairs.forEach(([a, b], i) => {
    assert.deepEqual([restore(a), restore(b)], [s.sequences[0], s.sequences[i + 1]]);
    assert.equal(alignedScore(a, b), exhaustive(restore(a), restore(b)));
  });
  assert.equal(new Set(s.merged.map(r => r.length)).size, 1);
  assert.deepEqual(s.merged.map(restore), s.sequences);
  for (let i = 1; i < 3; i++) {
    const columns = [...s.merged[0]].map((c, j) => [c, s.merged[i][j]]).filter(([a, b]) => a !== '-' || b !== '-');
    assert.deepEqual([0, 1].map(k => columns.map(c => c[k]).join('')), s.pairs[i - 1]);
  }
});
test('affine gap runs and scores agree with the article', () => {
  examples.affine.rows.forEach(([a, b], i) => {
    assert.deepEqual([restore(a), restore(b)], examples.affine.sequences);
    const runs = b.match(/-+/g) || [];
    const independent = restore(b).length * 2 - runs.reduce((cost, r) => cost + 3 + r.length - 1, 0);
    assert.equal(independent, [2, 0][i]);
    assert.equal(affineBreakdown(a, b).score, independent);
  });
});
test('guide merges and folded POA paths preserve the examples', () => {
  assert.deepEqual(examples.guide.merges, [['S1', 'S3'], ['S1', 'S3', 'S2'], ['S1', 'S3', 'S2', 'S4']]);
  assert.deepEqual(examples.poa.branches.map(b => examples.poa.prefix + b + examples.poa.suffix), examples.poa.sequences);
  const doc = fs.readFileSync(new URL('../docs/basics/multiple.md', import.meta.url), 'utf8');
  for (const row of ['S1 ATTGCCATT', 'S2 ATGGCCATT', 'S3 ATCTTCTT', 'S4 ACTGACC']) assert.ok(doc.includes(row));
});
test('DAG predecessors and all three DP candidates match exhaustive path alignment', () => {
  const { nodes, edges } = examples.dag;
  const order = ['C', 'A', 'T1', 'G', 'T2'];
  const predecessors = v => edges.filter(e => e[1] === v).map(e => e[0]);
  const paths = v => predecessors(v).length ? predecessors(v).flatMap(p => paths(p).map(s => s + nodes[v])) : [nodes[v]];
  assert.deepEqual(predecessors('T2'), ['A', 'G']);
  assert.deepEqual(paths('T2'), ['CAT', 'CTGT']);
  for (const query of ['', 'CAT', 'CTGT', examples.dag.query]) {
    const d = { start: Array.from({ length: query.length + 1 }, (_, j) => -2 * j) };
    for (const v of order) {
      const pred = predecessors(v).length ? predecessors(v) : ['start'];
      d[v] = [Math.max(...pred.map(p => d[p][0])) - 2];
      for (let j = 1; j <= query.length; j++) {
        d[v][j] = Math.max(
          Math.max(...pred.map(p => d[p][j - 1])) + (nodes[v] === query[j - 1] ? 2 : -1),
          Math.max(...pred.map(p => d[p][j])) - 2, d[v][j - 1] - 2);
      }
      for (let j = 0; j <= query.length; j++) assert.equal(d[v][j], Math.max(...paths(v).map(s => exhaustive(s, query.slice(0, j)))));
    }
  }
});
test('five minimal SVGs and two original POA images are referenced', () => {
  const docs = ['pairwise', 'multiple'].map(name => fs.readFileSync(new URL(`../docs/basics/${name}.md`, import.meta.url), 'utf8')).join('\n');
  assert.equal(figures().size, 5);
  for (const [name, svg] of figures()) {
    assert.ok(docs.includes(`/images/${name}`));
    assert.ok(svg.includes('<title') && svg.includes('<desc'));
    // Visible Chinese labels are short keywords; prose belongs in captions.
    for (const text of svg.matchAll(/<text\b[^>]*>(.*?)<\/text>/g)) assert.ok((text[1].match(/[\u4e00-\u9fff]/g) || []).length <= 4);
    assert.doesNotMatch(svg, /<(?:script|image|foreignObject)\b|https?:\/\/(?!www.w3.org)/);
  }
  assert.doesNotMatch(docs, /(?:psa-1|msa-[2-5])\.png/);
  for (const name of ['msa-6.png', 'msa-7.png']) assert.ok(docs.includes(`/images/${name}`));
});
