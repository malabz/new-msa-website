import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const doc = fs.readFileSync(new URL('../docs/basics/pairwise.md', import.meta.url), 'utf8');
const substitution = (a, b, p) => a === b ? p.match : -p.mismatch;
const matrix = (m, n, value) => Array.from({ length: m + 1 }, () => Array(n + 1).fill(value));

// Reference DP follows the explicitly stated formulas, not any linked teaching repository.
function linear(s, t, p) {
  const f = matrix(s.length, t.length, -Infinity);
  for (let i = 0; i <= s.length; i++) f[i][0] = -i * p.gap || 0;
  for (let j = 0; j <= t.length; j++) f[0][j] = -j * p.gap || 0;
  for (let i = 1; i <= s.length; i++) for (let j = 1; j <= t.length; j++) {
    f[i][j] = Math.max(f[i - 1][j - 1] + substitution(s[i - 1], t[j - 1], p),
      f[i - 1][j] - p.gap, f[i][j - 1] - p.gap);
  }
  return f;
}

function affine(s, t, p) {
  const [m, n] = [s.length, t.length];
  const M = matrix(m, n, -Infinity), X = matrix(m, n, -Infinity), Y = matrix(m, n, -Infinity);
  M[0][0] = 0;
  for (let i = 1; i <= m; i++) X[i][0] = -p.open - (i - 1) * p.extend;
  for (let j = 1; j <= n; j++) Y[0][j] = -p.open - (j - 1) * p.extend;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    M[i][j] = substitution(s[i - 1], t[j - 1], p) + Math.max(M[i - 1][j - 1], X[i - 1][j - 1], Y[i - 1][j - 1]);
    X[i][j] = Math.max(M[i - 1][j] - p.open, X[i - 1][j] - p.extend, Y[i - 1][j] - p.open);
    Y[i][j] = Math.max(M[i][j - 1] - p.open, Y[i][j - 1] - p.extend, X[i][j - 1] - p.open);
  }
  return Math.max(M[m][n], X[m][n], Y[m][n]);
}

// Independent oracle: enumerate complete alignments, then score their columns/runs.
function* alignments(s, t) {
  if (!s.length && !t.length) { yield ['', '']; return; }
  if (s.length && t.length) for (const [a, b] of alignments(s.slice(1), t.slice(1))) yield [s[0] + a, t[0] + b];
  if (s.length) for (const [a, b] of alignments(s.slice(1), t)) yield [s[0] + a, '-' + b];
  if (t.length) for (const [a, b] of alignments(s, t.slice(1))) yield ['-' + a, t[0] + b];
}
function score(a, b, p) {
  assert.equal(a.length, b.length);
  let result = 0, previous = '';
  for (let i = 0; i < a.length; i++) {
    assert.ok(a[i] !== '-' || b[i] !== '-');
    const direction = a[i] === '-' ? 'Y' : b[i] === '-' ? 'X' : '';
    result += direction ? -(direction === previous ? p.extend : p.open) : substitution(a[i], b[i], p);
    previous = direction;
  }
  return result;
}
function exhaustive(s, t, p) {
  return Math.max(...[...alignments(s, t)].map(([a, b]) => score(a, b, p)));
}
function example(name) {
  const block = doc.match(new RegExp(`<!-- example: ${name} -->\\s*\x60\x60\x60text\\n([\\s\\S]*?)\x60\x60\x60`));
  assert.ok(block, name);
  return block[1].trim().split('\n').map(line => line.trim().split(/\s+/).at(-1));
}
function sequences(maxLength) {
  const result = [''];
  for (let n = 1; n <= maxLength; n++) {
    for (let bits = 0; bits < 2 ** n; bits++) result.push(bits.toString(2).padStart(n, '0').replaceAll('0', 'A').replaceAll('1', 'C'));
  }
  return result;
}

test('正文线性矩阵、回溯路径和双序列算例一致', () => {
  const p = { match: 2, mismatch: 1, gap: 2, open: 2, extend: 2 };
  const rows = doc.split('<!-- example: linear-matrix -->')[1].trim().split('\n').slice(2, 6);
  const expected = rows.map(row => row.split('|').slice(2, -1).map(Number));
  assert.deepEqual(linear('ACG', 'AG', p), expected);
  assert.deepEqual(example('linear'), ['ACG', 'A-G']);
  assert.equal(score(...example('linear'), p), 2);
  const f = linear('ACG', 'AG', p);
  assert.equal(f[3][2], f[2][1] + 2);
  assert.equal(f[2][1], f[1][1] - 2);
  assert.equal(f[1][1], f[0][0] + 2);
});

test('正文仿射空位与 profile 示例可恢复原输入', () => {
  const p = { match: 2, mismatch: 1, open: 3, extend: 1 };
  for (const [name, expectedScore] of [['affine-grouped', 2], ['affine-split', 0]]) {
    const rows = example(name);
    assert.deepEqual(rows.map(row => row.replaceAll('-', '')), ['AAAAA', 'AAA']);
    assert.equal(score(...rows, p), expectedScore);
  }
  assert.equal(affine('AAAAA', 'AAA', p), 2);
  const profile = example('profile');
  assert.equal(new Set(profile.map(row => row.length)).size, 1);
  assert.deepEqual(profile.map(row => row.replaceAll('-', '')), ['ACG', 'ATG', 'AG']);
});

test('独立穷举校验线性及仿射递推：空输入、匹配、错配、连续空位和方向切换', () => {
  const strings = sequences(3); // 15 sequences, 225 ordered pairs per scoring scheme.
  for (const p of [
    { match: 2, mismatch: 1, open: 2, extend: 2, gap: 2 },
    { match: 2, mismatch: 1, open: 3, extend: 1 },
    { match: 2, mismatch: 10, open: 3, extend: 1 }
  ]) for (const s of strings) for (const t of strings) {
    const expected = exhaustive(s, t, p);
    assert.equal(affine(s, t, p), expected, JSON.stringify({ s, t, p }));
    if (p.gap) assert.equal(linear(s, t, p).at(-1).at(-1), expected);
  }
  assert.equal(affine('A', 'C', { match: 2, mismatch: 10, open: 3, extend: 1 }), -6);
  assert.equal(affine('', 'AAA', { match: 2, mismatch: 1, open: 3, extend: 1 }), -5);
});
