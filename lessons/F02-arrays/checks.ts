import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Ma trận ngẫu nhiên có tổng số ô ≈ n (tối thiểu 1 × 1), kích thước lệch ngẫu nhiên. */
const randMatrix = (n: number, r: Rng, lo = -9, hi = 9) => {
  const rows = Math.max(1, r.int(1, Math.max(1, Math.round(Math.sqrt(n) * 1.5))));
  const cols = Math.max(1, Math.round(Math.max(1, n) / rows));
  return r.matrix(rows, cols, lo, hi);
};
const side = (n: number) => Math.max(1, Math.round(Math.sqrt(n)));

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'void rotateRight(int[] nums, int k)',
    title: 'Xoay mảng sang phải k bước',
    ref: S.rotateRight,
    brute: (nums: number[], k: number) => {
      for (let s = 0; s < k % Math.max(1, nums.length); s++) nums.unshift(nums.pop()!);
    },
    output: 'arg0',
    cases: [
      { args: [[1, 2, 3, 4, 5, 6, 7], 3], expected: [5, 6, 7, 1, 2, 3, 4] },
      { args: [[-1, -100, 3, 99], 2], expected: [3, 99, -1, -100] },
      { args: [[], 5], expected: [] },
      { args: [[1, 2], 0], expected: [1, 2] },
      { args: [[1, 2, 3], 1_000_000_000], expected: [3, 1, 2], note: 'k rất lớn → k % n' },
    ],
    gen: (n, r) => [r.array(n, -100, 100), r.bool(0.2) ? r.int(0, 1e9) : r.int(0, 2 * n + 2)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'int[] plusOne(int[] digits)',
    title: 'Cộng một',
    ref: S.plusOne,
    brute: (digits: number[]) => (BigInt(digits.join('')) + 1n).toString().split('').map(Number),
    cases: [
      { args: [[1, 2, 3]], expected: [1, 2, 4] },
      { args: [[9, 9]], expected: [1, 0, 0] },
      { args: [[0]], expected: [1] },
      { args: [[9]], expected: [1, 0] },
      { args: [[1, 9, 9, 9]], expected: [2, 0, 0, 0] },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (len === 1) return [[r.int(0, 9)]];
      const d = r.bool(0.3) ? new Array(len).fill(9) : r.array(len, 0, 9);
      if (r.bool(0.4)) for (let i = r.int(0, len - 1); i < len; i++) d[i] = 9;
      d[0] = r.int(1, 9);
      return [d];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'List<List<Integer>> pascal(int numRows)',
    title: 'Tam giác Pascal',
    ref: S.pascal,
    brute: (numRows: number) => {
      const C = (n: number, k: number): number => (k === 0 || k === n ? 1 : C(n - 1, k - 1) + C(n - 1, k));
      return Array.from({ length: numRows }, (_, i) => Array.from({ length: i + 1 }, (_, j) => C(i, j)));
    },
    cases: [
      { args: [5], expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]] },
      { args: [0], expected: [] },
      { args: [1], expected: [[1]] },
    ],
    gen: (n) => [Math.min(n, 18)],
    stress: { runs: 19, maxN: 18 },
    perf: false,
  },
  '04': {
    sig: 'int[][] transpose(int[][] matrix)',
    title: 'Chuyển vị ma trận',
    ref: S.transpose,
    brute: (m: number[][]) => m[0].map((_, j) => m.map((row) => row[j])),
    cases: [
      { args: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]] },
      { args: [[[7]]], expected: [[7]] },
      { args: [[[1], [2], [3]]], expected: [[1, 2, 3]] },
    ],
    gen: (n, r) => [randMatrix(n, r)],
    perf: { n: 1e6, limitMs: 300 },
  },
  '05': {
    sig: 'List<Integer> spiralOrder(int[][] matrix)',
    title: 'Duyệt xoắn ốc',
    ref: S.spiralOrder,
    brute: (m: number[][]) => {
      const R = m.length;
      const C = m[0].length;
      const seen = m.map((row) => row.map(() => false));
      const D = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      const out: number[] = [];
      let r = 0;
      let c = 0;
      let d = 0;
      for (let k = 0; k < R * C; k++) {
        out.push(m[r][c]);
        seen[r][c] = true;
        const nr = r + D[d][0];
        const nc = c + D[d][1];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C || seen[nr][nc]) d = (d + 1) % 4;
        r += D[d][0];
        c += D[d][1];
      }
      return out;
    },
    cases: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
      { args: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { args: [[[1, 2, 3]]], expected: [1, 2, 3] },
      { args: [[[5]]], expected: [5] },
    ],
    gen: (n, r) => [randMatrix(n, r, 0, 99)],
    perf: { n: 1e6, limitMs: 300 },
  },
  '06': {
    sig: 'void rotateImage(int[][] matrix)',
    title: 'Xoay ảnh 90° tại chỗ',
    ref: S.rotateImage,
    brute: (m: number[][]) => {
      const n = m.length;
      const copy = m.map((row) => row.slice());
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) m[j][n - 1 - i] = copy[i][j];
    },
    output: 'arg0',
    cases: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
      { args: [[[1]]], expected: [[1]] },
      { args: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
    ],
    gen: (n, r) => [r.matrix(side(n), side(n), -50, 50)],
    perf: { n: 1e6, limitMs: 300 },
  },
  '07': {
    sig: 'void setZeroes(int[][] matrix)',
    title: 'Đặt 0 cho hàng và cột',
    ref: S.setZeroes,
    brute: (m: number[][]) => {
      const zr = new Set<number>();
      const zc = new Set<number>();
      m.forEach((row, i) => row.forEach((v, j) => v === 0 && (zr.add(i), zc.add(j))));
      m.forEach((row, i) => row.forEach((_, j) => (zr.has(i) || zc.has(j)) && (row[j] = 0)));
    },
    output: 'arg0',
    cases: [
      { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
      { args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], expected: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]] },
      { args: [[[1, 0]]], expected: [[0, 0]] },
      { args: [[[1], [0], [2]]], expected: [[0], [0], [0]] },
      { args: [[[5, 6], [7, 8]]], expected: [[5, 6], [7, 8]] },
    ],
    gen: (n, r) => {
      const m = randMatrix(n, r, 1, 9);
      const zeros = r.int(0, 3);
      for (let z = 0; z < zeros; z++) m[r.int(0, m.length - 1)][r.int(0, m[0].length - 1)] = 0;
      return [m];
    },
    perf: { n: 1e6, limitMs: 300 },
  },
  '08': {
    sig: 'int[] productExceptSelf(int[] nums)',
    title: 'Tích các phần tử còn lại',
    ref: S.productExceptSelf,
    brute: (nums: number[]) => nums.map((_, i) => nums.reduce((p, v, j) => (j === i ? p : p * v), 1)),
    cases: [
      { args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { args: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
      { args: [[0, 0]], expected: [0, 0] },
      { args: [[2, 3]], expected: [3, 2] },
    ],
    gen: (n, r) => {
      const len = Math.max(2, n);
      const a = new Array(len).fill(0).map(() => (r.bool(0.05) ? 0 : r.pick([1, -1])));
      const big = r.int(0, 6);
      for (let k = 0; k < big; k++) a[r.int(0, len - 1)] = r.int(2, 30) * r.pick([1, -1]);
      return [a];
    },
    stress: { runs: 300, minN: 2, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '09': {
    sig: 'List<Integer> missingOrders(int[] scanned)',
    title: 'Mã đơn bị thất lạc',
    ref: S.missingOrders,
    brute: (a: number[]) => {
      const out: number[] = [];
      for (let v = 1; v <= a.length; v++) if (!a.includes(v)) out.push(v);
      return out;
    },
    cases: [
      { args: [[4, 3, 2, 7, 8, 2, 3, 1]], expected: [5, 6] },
      { args: [[1, 1]], expected: [2] },
      { args: [[1]], expected: [] },
      { args: [[2, 2, 2]], expected: [1, 3] },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      return [r.bool(0.3) ? r.shuffle(Array.from({ length: len }, (_, i) => i + 1)) : r.array(len, 1, len)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '10': {
    sig: 'long[][] revenueHeatmap(int[][] events)',
    title: 'Heatmap doanh thu theo giờ',
    ref: S.revenueHeatmap,
    brute: (events: number[][]) =>
      Array.from({ length: 7 }, (_, d) =>
        Array.from({ length: 24 }, (_, h) => events.filter((e) => e[0] === d && e[1] === h).reduce((s, e) => s + e[2], 0)),
      ),
    cases: [
      {
        args: [[[1, 9, 100], [1, 9, 50], [6, 23, 7]]],
        expected: Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => (d === 1 && h === 9 ? 150 : d === 6 && h === 23 ? 7 : 0))),
      },
      { args: [[]], note: 'không có sự kiện → 7 × 24 số 0' },
      { args: [new Array(3000).fill([2, 5, 1_000_000])], note: 'một ô 3·10⁹ > 2³¹ (Java: long)' },
    ],
    gen: (n, r) => [Array.from({ length: n }, () => [r.int(0, 6), r.int(0, 23), r.int(0, 1_000_000)])],
    perf: { n: 1e6, limitMs: 300 },
  },
};
