import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const rotate = (a: number[], k: number) => (a.length ? [...a.slice(k % a.length), ...a.slice(0, k % a.length)] : a);
const distinctSorted = (n: number, r: Rng, range = 3 * n + 10) => r.distinct(n, -range, range).sort((a, b) => a - b);

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int search(int[] nums, int target)',
    title: 'Binary search cơ bản',
    ref: S.search,
    brute: (nums: number[], t: number) => nums.indexOf(t),
    cases: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { args: [[], 1], expected: -1 },
      { args: [[5], 5], expected: 0 },
      { args: [[1, 2], 3], expected: -1 },
    ],
    gen: (n, r) => {
      const a = distinctSorted(n, r);
      return [a, r.bool() && n ? r.pick(a) : r.int(-3 * n - 12, 3 * n + 12)];
    },
    perf: false,
  },
  '02': {
    sig: 'int searchInsert(int[] nums, int target)',
    title: 'Vị trí chèn',
    ref: S.searchInsert,
    brute: (nums: number[], t: number) => {
      const i = nums.findIndex((x) => x >= t);
      return i === -1 ? nums.length : i;
    },
    cases: [
      { args: [[1, 3, 5, 6], 5], expected: 2 },
      { args: [[1, 3, 5, 6], 2], expected: 1 },
      { args: [[1, 3, 5, 6], 7], expected: 4 },
      { args: [[], 3], expected: 0 },
      { args: [[1, 3], 0], expected: 0 },
    ],
    gen: (n, r) => [distinctSorted(n, r), r.int(-3 * n - 12, 3 * n + 12)],
    perf: false,
  },
  '03': {
    sig: 'int[] searchRange(int[] nums, int target)',
    title: 'Vị trí đầu và cuối',
    ref: S.searchRange,
    brute: (nums: number[], t: number) => [nums.indexOf(t), nums.lastIndexOf(t)],
    cases: [
      { args: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
      { args: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
      { args: [[], 0], expected: [-1, -1] },
      { args: [[2, 2], 2], expected: [0, 1] },
    ],
    gen: (n, r) => [r.sorted(n, 0, 6), r.int(-1, 7)],
    // input toàn phần tử bằng target, gọi nhiều lần qua perf → bản "loang hai bên" O(n) vẫn nhanh ở 1 lần gọi,
    // nên Perf ở đây không phân biệt được; phần giải thích ở solutions.
    perf: false,
  },
  '04': {
    sig: 'int mySqrt(int x)',
    title: 'Căn bậc hai nguyên',
    ref: S.mySqrt,
    brute: (x: number) => Math.floor(Math.sqrt(x)),
    cases: [
      { args: [4], expected: 2 },
      { args: [8], expected: 2 },
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [2147483647], expected: 46340, note: 'Java: mid * mid tràn int' },
      { args: [2147395600], expected: 46340 },
      { args: [2147395599], expected: 46339 },
    ],
    gen: (n, r) => [r.bool(0.5) ? r.int(0, n * n + 5) : r.int(0, 2147483647)],
    perf: false,
  },
  '05': {
    sig: 'int searchRotated(int[] nums, int target)',
    title: 'Tìm trong mảng xoay',
    ref: S.searchRotated,
    brute: (nums: number[], t: number) => nums.indexOf(t),
    cases: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { args: [[1], 0], expected: -1 },
      { args: [[1, 3], 3], expected: 1 },
      { args: [[3, 1], 1], expected: 1 },
      { args: [[5, 1, 3], 5], expected: 0 },
    ],
    gen: (n, r) => {
      const a = rotate(distinctSorted(Math.max(1, n), r), r.int(0, 50));
      return [a, r.bool() ? r.pick(a) : r.int(-3 * n - 12, 3 * n + 12)];
    },
    perf: false,
  },
  '06': {
    sig: 'int findMin(int[] nums)',
    title: 'Nhỏ nhất trong mảng xoay',
    ref: S.findMin,
    brute: (nums: number[]) => Math.min(...nums),
    cases: [
      { args: [[3, 4, 5, 1, 2]], expected: 1 },
      { args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { args: [[11, 13, 15, 17]], expected: 11 },
      { args: [[2, 1]], expected: 1 },
    ],
    gen: (n, r) => [rotate(distinctSorted(Math.max(1, n), r), r.int(0, 50))],
    perf: false,
  },
  '07': {
    sig: 'int findPeakElement(int[] nums)',
    title: 'Tìm một đỉnh',
    ref: S.findPeakElement,
    brute: () => null,
    compare: (got, _e, [nums]) => {
      if (!Number.isInteger(got) || got < 0 || got >= nums.length) return `chỉ số ${got} ngoài mảng`;
      const left = got === 0 ? -Infinity : nums[got - 1];
      const right = got === nums.length - 1 ? -Infinity : nums[got + 1];
      return (nums[got] > left && nums[got] > right) || `nums[${got}] = ${nums[got]} không phải đỉnh`;
    },
    cases: [
      { args: [[1, 2, 3, 1]], expected: 2 },
      { args: [[1, 2, 1, 3, 5, 6, 4]], expected: 5 },
      { args: [[1]], expected: 0 },
      { args: [[2, 1]], expected: 0 },
      { args: [[1, 2]], expected: 1 },
    ],
    gen: (n, r) => {
      const a = [r.int(0, 5)];
      for (let i = 1; i < Math.max(1, n); i++) a.push(a[i - 1] + (r.bool() ? 1 : -1) * r.int(1, 3));
      return [a];
    },
    perf: false,
  },
  '08': {
    sig: 'boolean searchMatrix(int[][] matrix, int target)',
    title: 'Tìm trong ma trận',
    ref: S.searchMatrix,
    brute: (m: number[][], t: number) => m.some((row) => row.includes(t)),
    cases: [
      { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], expected: true },
      { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], expected: false },
      { args: [[[1]], 2], expected: false },
      { args: [[[1], [3]], 3], expected: true },
    ],
    gen: (n, r) => {
      const rows = r.int(1, 5);
      const cols = r.int(1, 5);
      const vals = distinctSorted(rows * cols, r);
      const m = Array.from({ length: rows }, (_, i) => vals.slice(i * cols, (i + 1) * cols));
      return [m, r.bool() ? r.pick(vals) : r.int(-40, 40)];
    },
    perf: false,
  },
  '09': {
    sig: 'int[] shippingPrices(int[] thresholds, int[] prices, int[] weights)',
    title: 'Bậc giá cước',
    ref: S.shippingPrices,
    brute: (th: number[], pr: number[], ws: number[]) =>
      ws.map((w) => {
        let i = 0;
        while (i + 1 < th.length && th[i + 1] <= w) i++;
        return pr[i];
      }),
    cases: [
      { args: [[0, 500, 1000, 5000], [15, 22, 30, 60], [0, 499, 500, 4999, 100000]], expected: [15, 15, 22, 30, 60] },
      { args: [[0], [9], [0, 1e9]], expected: [9, 9] },
      { args: [[0, 10], [1, 2], []], expected: [] },
    ],
    gen: (n, r) => {
      const k = Math.max(1, n);
      const th = [0, ...r.distinct(k - 1, 1, 10 * k + 10).sort((a, b) => a - b)];
      return [th, r.array(k, 1, 100), r.array(n, 0, 10 * k + 20)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '10': {
    sig: 'int[] countInRange(int[] times, int[][] queries)',
    title: 'Đếm log trong khoảng thời gian',
    ref: S.countInRange,
    brute: (times: number[], qs: number[][]) => qs.map(([f, t]) => times.filter((x) => f <= x && x <= t).length),
    cases: [
      { args: [[1, 3, 3, 5, 8], [[3, 5], [0, 0], [2, 8], [9, 10]]], expected: [3, 0, 4, 0] },
      { args: [[], [[0, 10]]], expected: [0] },
    ],
    gen: (n, r) => {
      const T = 3 * n + 5;
      return [
        r.sorted(n, 0, T),
        Array.from({ length: n }, () => {
          const a = r.int(0, T);
          return [a, a + r.int(0, Math.max(1, n))];
        }),
      ];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
};
