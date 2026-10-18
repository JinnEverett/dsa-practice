import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

const MOD = 1_000_000_007n;
const powMod = (b: bigint, e: bigint): bigint => {
  let r = 1n;
  b %= MOD;
  for (; e > 0n; e >>= 1n) {
    if (e & 1n) r = (r * b) % MOD;
    b = (b * b) % MOD;
  }
  return r;
};
/** C(n, k) mod 1e9+7 (dùng cho case lớn có đáp án công thức). */
const binomMod = (n: number, k: number): number => {
  let num = 1n;
  let den = 1n;
  for (let i = 1; i <= k; i++) {
    num = (num * BigInt(n - k + i)) % MOD;
    den = (den * BigInt(i)) % MOD;
  }
  return Number((num * powMod(den, MOD - 2n)) % MOD);
};
const isPal = (s: string) => s === [...s].reverse().join('');
const LET = 'abc';

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int uniquePaths(int m, int n)',
    title: 'Số đường đi trên lưới',
    ref: S.uniquePaths,
    brute: (m: number, n: number): number => {
      const f = (r: number, c: number): number => (r === m - 1 || c === n - 1 ? 1 : f(r + 1, c) + f(r, c + 1));
      return f(0, 0) % 1_000_000_007;
    },
    cases: [
      { args: [3, 7], expected: 28 },
      { args: [3, 2], expected: 3 },
      { args: [1, 1], expected: 1 },
      { args: [1, 1000], expected: 1 },
      { args: [1000, 1000], expected: binomMod(1998, 999), note: 'C(1998, 999) mod 10⁹+7' },
    ],
    gen: (n, r) => (n >= 1000 ? [1000, 1000] : [r.int(1, 7), r.int(1, 7)]),
    perf: { n: 1000, limitMs: 100 },
  },
  '02': {
    sig: 'int uniquePathsWithObstacles(int[][] grid)',
    title: 'Đường đi có chướng ngại vật',
    ref: S.uniquePathsWithObstacles,
    brute: (g: number[][]): number => {
      const R = g.length;
      const C = g[0].length;
      const f = (r: number, c: number): number => {
        if (r >= R || c >= C || g[r][c] === 1) return 0;
        if (r === R - 1 && c === C - 1) return 1;
        return f(r + 1, c) + f(r, c + 1);
      };
      return f(0, 0) % 1_000_000_007;
    },
    cases: [
      { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 2 },
      { args: [[[0, 1], [0, 0]]], expected: 1 },
      { args: [[[1, 0]]], expected: 0, note: 'ô xuất phát bị chặn' },
      { args: [[[0, 1]]], expected: 0, note: 'ô đích bị chặn' },
      { args: [[[0]]], expected: 1 },
      { args: [Array.from({ length: 1000 }, () => new Array(1000).fill(0))], expected: binomMod(1998, 999) },
    ],
    gen: (n, r) => {
      const R = n >= 1000 ? 1000 : r.int(1, 6);
      const C = n >= 1000 ? 1000 : r.int(1, 6);
      return [Array.from({ length: R }, () => Array.from({ length: C }, () => (r.bool(n >= 1000 ? 0.0 : 0.2) ? 1 : 0)))];
    },
    perf: { n: 1000, limitMs: 100 },
  },
  '03': {
    sig: 'int minPathSum(int[][] grid)',
    title: 'Tổng nhỏ nhất trên đường đi',
    ref: S.minPathSum,
    brute: (g: number[][]): number => {
      const R = g.length;
      const C = g[0].length;
      const f = (r: number, c: number): number => {
        if (r === R - 1 && c === C - 1) return g[r][c];
        let best = Infinity;
        if (r + 1 < R) best = Math.min(best, f(r + 1, c));
        if (c + 1 < C) best = Math.min(best, f(r, c + 1));
        return g[r][c] + best;
      };
      return f(0, 0);
    },
    cases: [
      { args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expected: 7 },
      { args: [[[1, 2, 3], [4, 5, 6]]], expected: 12 },
      { args: [[[5]]], expected: 5 },
      { args: [Array.from({ length: 1000 }, () => new Array(1000).fill(100))], expected: 100 * 1999 },
    ],
    gen: (n, r) => {
      const R = n >= 1000 ? 1000 : r.int(1, 6);
      const C = n >= 1000 ? 1000 : r.int(1, 6);
      return [r.matrix(R, C, 0, 100)];
    },
    perf: { n: 1000, limitMs: 150 },
  },
  '04': {
    sig: 'int longestCommonSubsequence(String a, String b)',
    title: 'LCS',
    ref: S.longestCommonSubsequence,
    brute: (a: string, b: string): number => {
      const f = (i: number, j: number): number =>
        i === a.length || j === b.length ? 0 : a[i] === b[j] ? 1 + f(i + 1, j + 1) : Math.max(f(i + 1, j), f(i, j + 1));
      return f(0, 0);
    },
    cases: [
      { args: ['abcde', 'ace'], expected: 3 },
      { args: ['abc', 'abc'], expected: 3 },
      { args: ['abc', 'def'], expected: 0 },
      { args: ['', 'abc'], expected: 0, note: 'chuỗi rỗng' },
      { args: ['a'.repeat(3000), 'a'.repeat(3000)], expected: 3000 },
    ],
    gen: (n, r) => (n >= 1000 ? [r.string(n, 'abcd'), r.string(n, 'abcd')] : [r.string(r.int(0, 9), LET), r.string(r.int(0, 9), LET)]),
    perf: { n: 2000, limitMs: 500 },
  },
  '05': {
    sig: 'int minDistance(String a, String b)',
    title: 'Edit distance',
    ref: S.minDistance,
    brute: (a: string, b: string): number => {
      const f = (i: number, j: number): number => {
        if (i === a.length) return b.length - j;
        if (j === b.length) return a.length - i;
        if (a[i] === b[j]) return f(i + 1, j + 1);
        return 1 + Math.min(f(i + 1, j + 1), f(i + 1, j), f(i, j + 1));
      };
      return f(0, 0);
    },
    cases: [
      { args: ['horse', 'ros'], expected: 3 },
      { args: ['intention', 'execution'], expected: 5 },
      { args: ['', 'abc'], expected: 3 },
      { args: ['abc', ''], expected: 3 },
      { args: ['', ''], expected: 0 },
      { args: ['a'.repeat(3000), 'b'.repeat(3000)], expected: 3000 },
    ],
    gen: (n, r) => (n >= 1000 ? [r.string(n, 'abcd'), r.string(n, 'abcd')] : [r.string(r.int(0, 7), LET), r.string(r.int(0, 7), LET)]),
    perf: { n: 2000, limitMs: 500 },
  },
  '06': {
    sig: 'int longestPalindromeSubseq(String s)',
    title: 'Dãy con palindrome dài nhất',
    ref: S.longestPalindromeSubseq,
    brute: (s: string): number => {
      let best = 0;
      for (let mask = 1; mask < 1 << s.length; mask++) {
        let t = '';
        for (let i = 0; i < s.length; i++) if (mask >> i & 1) t += s[i];
        if (t.length > best && isPal(t)) best = t.length;
      }
      return best;
    },
    cases: [
      { args: ['bbbab'], expected: 4 },
      { args: ['cbbd'], expected: 2 },
      { args: ['a'], expected: 1 },
      { args: ['abcd'], expected: 1 },
      { args: ['a'.repeat(3000)], expected: 3000 },
    ],
    gen: (n, r) => (n >= 1000 ? [r.string(n, 'abcd')] : [r.string(r.int(1, 11), LET)]),
    stress: { minN: 1 },
    perf: { n: 2000, limitMs: 500 },
  },
  '07': {
    sig: 'String longestPalindrome(String s)',
    title: 'Chuỗi con palindrome dài nhất',
    ref: S.longestPalindrome,
    brute: (s: string): string => {
      let best = '';
      for (let i = 0; i < s.length; i++)
        for (let j = i + 1; j <= s.length; j++) {
          const t = s.slice(i, j);
          if (t.length > best.length && isPal(t)) best = t;
        }
      return best;
    },
    compare: (got, expected, [s]) => {
      if (typeof got !== 'string') return 'cần trả về chuỗi';
      if (!s.includes(got)) return `"${got}" không phải chuỗi con liên tiếp của s`;
      if (!isPal(got)) return `"${got}" không phải palindrome`;
      return got.length === expected.length || `độ dài ${got.length}, cần ${expected.length}`;
    },
    cases: [
      { args: ['babad'], expected: 'bab' },
      { args: ['cbbd'], expected: 'bb' },
      { args: ['a'], expected: 'a' },
      { args: ['ac'], expected: 'a' },
      { args: ['a'.repeat(3000)], expected: 'a'.repeat(3000) },
    ],
    gen: (n, r) => (n >= 1000 ? [r.string(n, 'a')] : [r.string(r.int(1, 12), LET)]),
    stress: { minN: 1 },
    perf: { n: 2000, limitMs: 500 },
  },
  '08': {
    sig: 'boolean isInterleave(String s1, String s2, String s3)',
    title: 'Chuỗi đan xen',
    ref: S.isInterleave,
    brute: (s1: string, s2: string, s3: string): boolean => {
      const f = (i: number, j: number): boolean => {
        if (i + j === s3.length) return i === s1.length && j === s2.length;
        return (i < s1.length && s1[i] === s3[i + j] && f(i + 1, j)) || (j < s2.length && s2[j] === s3[i + j] && f(i, j + 1));
      };
      return f(0, 0);
    },
    cases: [
      { args: ['aabcc', 'dbbca', 'aadbbcbcac'], expected: true },
      { args: ['aabcc', 'dbbca', 'aadbbbaccc'], expected: false },
      { args: ['', '', ''], expected: true },
      { args: ['a', '', 'c'], expected: false },
      { args: ['a'.repeat(1000), 'a'.repeat(1000), 'a'.repeat(2000)], expected: true, note: 'đệ quy không memo bùng nổ' },
      { args: ['a'.repeat(1000), 'a'.repeat(1000), 'a'.repeat(1999) + 'b'], expected: false },
    ],
    gen: (n, r) => {
      if (n >= 1000) return ['a'.repeat(1000), 'a'.repeat(1000), 'a'.repeat(1999) + 'b'];
      const s1 = r.string(r.int(0, 5), 'ab');
      const s2 = r.string(r.int(0, 5), 'ab');
      if (r.bool(0.6)) {
        // ghép đan xen thật rồi (đôi khi) làm hỏng một ký tự
        let i = 0;
        let j = 0;
        let s3 = '';
        while (i < s1.length || j < s2.length) s3 += j >= s2.length || (i < s1.length && r.bool()) ? s1[i++] : s2[j++];
        if (s3 && r.bool(0.3)) s3 = s3.slice(0, -1) + (s3.endsWith('a') ? 'b' : 'a');
        return [s1, s2, s3];
      }
      return [s1, s2, r.string(s1.length + s2.length, 'ab')];
    },
    perf: { n: 1000, limitMs: 100 },
  },
  '09': {
    sig: 'int maximalSquare(String[] matrix)',
    title: 'Mảnh đất vuông lớn nhất',
    ref: S.maximalSquare,
    brute: (m: string[]): number => {
      const R = m.length;
      const C = m[0].length;
      let best = 0;
      for (let r = 0; r < R; r++)
        for (let c = 0; c < C; c++)
          for (let k = 1; r + k <= R && c + k <= C; k++) {
            let ok = true;
            for (let i = r; i < r + k && ok; i++) for (let j = c; j < c + k; j++) if (m[i][j] !== '1') { ok = false; break; }
            if (ok) best = Math.max(best, k * k);
          }
      return best;
    },
    cases: [
      { args: [['10100', '10111', '11111', '10010']], expected: 4 },
      { args: [['01', '10']], expected: 1 },
      { args: [['0']], expected: 0 },
      { args: [['1']], expected: 1 },
      { args: [Array.from({ length: 1000 }, () => '1'.repeat(1000))], expected: 1_000_000, note: 'diện tích 10⁶' },
    ],
    gen: (n, r) => {
      const R = n >= 1000 ? 1000 : r.int(1, 6);
      const C = n >= 1000 ? 1000 : r.int(1, 6);
      return [Array.from({ length: R }, () => (n >= 1000 ? r.string(C, '1110') : r.string(C, '01')))];
    },
    perf: { n: 1000, limitMs: 150 },
  },
  '10': {
    sig: 'List<String> diffLines(String[] a, String[] b)',
    title: 'Diff theo dòng (LCS)',
    ref: S.diffLines,
    brute: (a: string[], b: string[]): string[] => {
      const lcs = (i: number, j: number): number =>
        i === a.length || j === b.length ? 0 : a[i] === b[j] ? 1 + lcs(i + 1, j + 1) : Math.max(lcs(i + 1, j), lcs(i, j + 1));
      const out: string[] = [];
      let i = 0;
      let j = 0;
      while (i < a.length || j < b.length) {
        if (i < a.length && j < b.length && a[i] === b[j]) (out.push(' ' + a[i]), i++, j++);
        else if (i < a.length && (j === b.length || lcs(i + 1, j) >= lcs(i, j + 1))) out.push('-' + a[i++]);
        else out.push('+' + b[j++]);
      }
      return out;
    },
    cases: [
      { args: [['a', 'b', 'c'], ['a', 'c', 'd']], expected: [' a', '-b', ' c', '+d'] },
      { args: [['x'], ['y']], expected: ['-x', '+y'], note: 'hòa: xóa trước, thêm sau' },
      { args: [[], ['a', 'b']], expected: ['+a', '+b'] },
      { args: [['a', 'b'], []], expected: ['-a', '-b'] },
      { args: [[], []], expected: [] },
      { args: [['a', 'b', 'a'], ['b', 'a', 'b']], expected: ['-a', ' b', ' a', '+b'] },
    ],
    gen: (n, r) => {
      const len = n >= 1000 ? n : r.int(0, 7);
      const alpha = n >= 1000 ? 'abcdefgh' : 'abc';
      return [Array.from({ length: len }, () => r.string(1, alpha)), Array.from({ length: len }, () => r.string(1, alpha))];
    },
    perf: { n: 2000, limitMs: 600 },
  },
};
