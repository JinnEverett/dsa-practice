import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';
import * as B from './snippets.ts';

const snippet = (fn: string, ref: any, gen: Spec['gen'], benchScales?: Spec['benchScales'], param = 'int[] nums'): Spec => ({
  sig: `long ${fn}(${param})`,
  title: `Đoán Big-O ${fn}`,
  ref,
  cases: [],
  gen,
  benchOnly: true,
  stress: false,
  perf: false,
  benchScales,
});
const arr = (n: number, r: any) => [r.array(n, 0, 1e9)];
const sortedArr = (n: number, r: any) => [r.sorted(n, 0, n * 5)];

export const specs: Record<string, Spec> = {
  b01: snippet('b01', B.b01, arr),
  b02: snippet('b02', B.b02, arr, { m: 30_000, l: 100_000 }),
  b03: snippet('b03', B.b03, (n) => [n], undefined, 'int n'),
  b04: snippet('b04', B.b04, (n) => [n], undefined, 'int n'),
  b05: snippet('b05', B.b05, arr, { m: 30_000, l: 100_000 }),
  b06: snippet('b06', B.b06, arr, { s: 10_000, m: 30_000, l: 60_000 }),
  b07: snippet('b07', B.b07, arr),
  b08: snippet('b08', B.b08, (n) => [n], { xs: 10, s: 20, m: 25, l: 30, xl: 32 }, 'int n'),
  b09: snippet('b09', B.b09, sortedArr),
  b10: snippet('b10', B.b10, arr, { m: 10_000, l: 30_000 }),

  '01': {
    sig: 'boolean hasDuplicate(int[] nums)',
    title: 'Có phần tử trùng không?',
    ref: S.hasDuplicate,
    brute: (nums: number[]) => {
      for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] === nums[j]) return true;
      return false;
    },
    cases: [
      { args: [[1, 2, 3, 1]], expected: true },
      { args: [[1, 2, 3]], expected: false },
      { args: [[]], expected: false },
      { args: [[7]], expected: false },
      { args: [[-1, -1]], expected: true },
    ],
    gen: (n, r) => [r.bool(0.5) ? r.distinct(n, -1e9, 1e9) : r.array(n, -n, n)],
    perf: { n: 1e5, limitMs: 300 },
  },
  '02': {
    sig: 'int[] uniqueInOrder(int[] nums)',
    title: 'Bỏ trùng, giữ thứ tự',
    ref: S.uniqueInOrder,
    brute: (nums: number[]) => nums.filter((x, i) => nums.indexOf(x) === i),
    cases: [
      { args: [[3, 1, 3, 2, 1]], expected: [3, 1, 2] },
      { args: [[]], expected: [] },
      { args: [[5, 5, 5]], expected: [5] },
    ],
    gen: (n, r) => [r.array(n, -5, 5 + n)],
    perf: { n: 1e5, limitMs: 300 },
  },
  '03': {
    sig: 'int[] intersection(int[] a, int[] b)',
    title: 'Giao của hai mảng',
    ref: S.intersection,
    brute: (a: number[], b: number[]) => [...new Set(a.filter((x) => b.includes(x)))].sort((x, y) => x - y),
    cases: [
      { args: [[4, 9, 5, 9], [9, 4, 9, 8, 4]], expected: [4, 9] },
      { args: [[1], []], expected: [] },
      { args: [[10, 9, 100, 2], [100, 2, 9, 10]], expected: [2, 9, 10, 100], note: 'sort số học, không phải chuỗi' },
      { args: [[-3, -1], [-1, -3, 0]], expected: [-3, -1] },
    ],
    gen: (n, r) => [r.array(n, -2 * n - 5, 2 * n + 5), r.array(r.int(0, n), -2 * n - 5, 2 * n + 5)],
    perf: { n: 1e5, limitMs: 500 },
  },
  '04': {
    sig: 'long sumOfMultiples(int n)',
    title: 'Tổng các bội của 3 hoặc 5',
    ref: S.sumOfMultiples,
    brute: (n: number) => {
      let s = 0;
      for (let x = 0; x < n; x++) if (x % 3 === 0 || x % 5 === 0) s += x;
      return s;
    },
    cases: [
      { args: [10], expected: 23 },
      { args: [0], expected: 0 },
      { args: [1], expected: 0 },
      { args: [16], expected: 60 },
      { args: [15], expected: 45 },
      { args: [100_000_000], expected: 2333333316666668 },
    ],
    gen: (n, r) => [r.int(0, n * 37)],
    stress: { runs: 300, maxN: 300 },
    perf: { n: 100_000_000, limitMs: 20 },
  },
  '05': {
    sig: 'int mostFrequent(int[] nums)',
    title: 'Giá trị xuất hiện nhiều nhất',
    ref: S.mostFrequent,
    brute: (nums: number[]) => {
      let best = Infinity;
      let bestCount = 0;
      for (const x of nums) {
        const c = nums.filter((y) => y === x).length;
        if (c > bestCount || (c === bestCount && x < best)) {
          best = x;
          bestCount = c;
        }
      }
      return best;
    },
    cases: [
      { args: [[1, 3, 3, 2, 1]], expected: 1 },
      { args: [[5]], expected: 5 },
      { args: [[-2, -2, 7]], expected: -2 },
      { args: [[9, 8, 7]], expected: 7, note: 'mọi giá trị hòa → nhỏ nhất' },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), -6, 6)],
    perf: { n: 1e5, limitMs: 300 },
  },
  '06': {
    sig: 'long countDivisiblePairs(int[] amounts, int k)',
    title: 'Cặp có tổng chia hết cho k',
    ref: S.countDivisiblePairs,
    brute: (a: number[], k: number) => {
      let c = 0;
      for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if ((a[i] + a[j]) % k === 0) c++;
      return c;
    },
    cases: [
      { args: [[1, 2, 3, 4, 5], 3], expected: 4 },
      { args: [[-1, 1, 4], 3], expected: 2, note: 'số âm' },
      { args: [[], 7], expected: 0 },
      { args: [[5, 10, 15], 1], expected: 3, note: 'k = 1' },
      { args: [[-7, -7, 14], 7], expected: 3 },
    ],
    gen: (n, r) => [r.array(n, -50, 50), r.int(1, 12)],
    perf: { n: 1e5, limitMs: 300 },
  },
};
