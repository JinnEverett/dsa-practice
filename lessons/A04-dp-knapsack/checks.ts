import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

const MOD = 1_000_000_007;

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int knapsack01(int[] weights, int[] values, int capacity)',
    title: 'Knapsack 0/1',
    ref: S.knapsack01,
    brute: (w: number[], v: number[], cap: number): number => {
      let best = 0;
      for (let mask = 0; mask < 1 << w.length; mask++) {
        let tw = 0;
        let tv = 0;
        for (let i = 0; i < w.length; i++) if (mask >> i & 1) (tw += w[i], (tv += v[i]));
        if (tw <= cap && tv > best) best = tv;
      }
      return best;
    },
    cases: [
      { args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
      { args: [[2, 3, 4], [3, 4, 5], 1], expected: 0, note: 'không vật nào vừa' },
      { args: [[5], [10], 5], expected: 10 },
      { args: [[1, 1, 1], [5, 5, 5], 2], expected: 10, note: 'mỗi vật chỉ một lần' },
      { args: [new Array(1000).fill(10), new Array(1000).fill(10000), 10000], expected: 10000 * 1000, note: '1000 vật × 10⁴' },
    ],
    gen: (n, r) => {
      const len = n >= 1000 ? 1000 : r.int(1, 10);
      return [r.array(len, 1, n >= 1000 ? 1000 : 8), r.array(len, 1, n >= 1000 ? 10000 : 20), n >= 1000 ? 10000 : r.int(0, 20)];
    },
    perf: { n: 1000, limitMs: 150 },
  },
  '02': {
    sig: 'int knapsackUnbounded(int[] weights, int[] values, int capacity)',
    title: 'Knapsack không giới hạn',
    ref: S.knapsackUnbounded,
    brute: (w: number[], v: number[], cap: number): number => {
      const f = (i: number, rem: number): number => {
        if (i === w.length) return 0;
        let best = 0;
        for (let k = 0; k * w[i] <= rem; k++) best = Math.max(best, k * v[i] + f(i + 1, rem - k * w[i]));
        return best;
      };
      return f(0, cap);
    },
    cases: [
      { args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
      { args: [[5, 10], [10, 25], 100], expected: 250, note: 'lấy 10 vật 10' },
      { args: [[7], [3], 6], expected: 0 },
      { args: [[1], [10000], 10000], expected: 100000000, note: '10⁴ × 10⁴ = 10⁸' },
    ],
    gen: (n, r) => {
      const len = n >= 1000 ? 1000 : r.int(1, 4);
      return [r.array(len, 1, n >= 1000 ? 1000 : 8), r.array(len, 1, n >= 1000 ? 10000 : 20), n >= 1000 ? 10000 : r.int(0, 20)];
    },
    perf: { n: 1000, limitMs: 150 },
  },
  '03': {
    sig: 'boolean canPartition(int[] nums)',
    title: 'Chia hai nhóm bằng nhau',
    ref: S.canPartition,
    brute: (a: number[]): boolean => {
      const sum = a.reduce((x, y) => x + y, 0);
      for (let mask = 0; mask < 1 << a.length; mask++) {
        let t = 0;
        for (let i = 0; i < a.length; i++) if (mask >> i & 1) t += a[i];
        if (2 * t === sum) return true;
      }
      return false;
    },
    cases: [
      { args: [[1, 5, 11, 5]], expected: true },
      { args: [[1, 2, 3, 5]], expected: false },
      { args: [[100]], expected: false },
      { args: [[2, 2]], expected: true },
      { args: [new Array(499).fill(100)], expected: false, note: 'tổng chẵn nhưng không chia được: chạy hết DP' },
    ],
    gen: (n, r) => (n >= 400 ? [new Array(499).fill(100)] : [r.array(r.int(1, 12), 1, 12)]),
    stress: { minN: 1 },
    perf: { n: 499, limitMs: 150 },
  },
  '04': {
    sig: 'int findTargetSumWays(int[] nums, int target)',
    title: 'Gán dấu +/- để ra đích',
    ref: S.findTargetSumWays,
    brute: (a: number[], target: number): number => {
      let cnt = 0;
      for (let mask = 0; mask < 1 << a.length; mask++) {
        let t = 0;
        for (let i = 0; i < a.length; i++) t += mask >> i & 1 ? a[i] : -a[i];
        if (t === target) cnt++;
      }
      return cnt % MOD;
    },
    cases: [
      { args: [[1, 1, 1, 1, 1], 3], expected: 5 },
      { args: [[1], 1], expected: 1 },
      { args: [[1], 2], expected: 0, note: '|target| > tổng' },
      { args: [[0, 0, 0, 0, 0, 0, 0, 0, 1], 1], expected: 256, note: 'mỗi số 0 nhân đôi số cách' },
      { args: [[1, 2], 2], expected: 0, note: 'tổng + target lẻ' },
      { args: [new Array(200).fill(0), 0], expected: Number(2n ** 200n % 1000000007n), note: '2²⁰⁰ mod 10⁹+7' },
    ],
    gen: (n, r) => {
      if (n >= 200) {
        const a = r.array(200, 0, 100);
        const s = a.reduce((x, y) => x + y, 0);
        return [a, s % 2];
      }
      const a = r.array(r.int(1, 12), 0, 6);
      return [a, r.int(-20, 20)];
    },
    stress: { minN: 1 },
    perf: { n: 200, limitMs: 50 },
  },
  '05': {
    sig: 'int lastStoneWeightII(int[] stones)',
    title: 'Đập đá lần 2',
    ref: S.lastStoneWeightII,
    brute: (a: number[]): number => {
      let best = Infinity;
      for (let mask = 0; mask < 1 << a.length; mask++) {
        let t = 0;
        for (let i = 0; i < a.length; i++) t += mask >> i & 1 ? a[i] : -a[i];
        best = Math.min(best, Math.abs(t));
      }
      return best;
    },
    cases: [
      { args: [[2, 7, 4, 1, 8, 1]], expected: 1 },
      { args: [[31, 26, 33, 21, 40]], expected: 5 },
      { args: [[1]], expected: 1 },
      { args: [[5, 5]], expected: 0 },
      { args: [new Array(300).fill(100)], expected: 0 },
    ],
    gen: (n, r) => [r.array(n >= 300 ? 300 : r.int(1, 12), 1, n >= 300 ? 100 : 15)],
    perf: { n: 300, limitMs: 50 },
  },
  '06': {
    sig: 'int findMaxForm(String[] strs, int m, int n)',
    title: 'Tập chuỗi nhị phân lớn nhất',
    ref: S.findMaxForm,
    brute: (strs: string[], m: number, n: number): number => {
      let best = 0;
      for (let mask = 0; mask < 1 << strs.length; mask++) {
        let z = 0;
        let o = 0;
        let c = 0;
        for (let i = 0; i < strs.length; i++)
          if (mask >> i & 1) {
            c++;
            for (const ch of strs[i]) ch === '0' ? z++ : o++;
          }
        if (z <= m && o <= n && c > best) best = c;
      }
      return best;
    },
    cases: [
      { args: [['10', '0001', '111001', '1', '0'], 5, 3], expected: 4 },
      { args: [['10', '0', '1'], 1, 1], expected: 2 },
      { args: [['0', '0', '0'], 0, 5], expected: 0 },
      { args: [new Array(600).fill('01'), 100, 100], expected: 100, note: '600 chuỗi, m = n = 100' },
    ],
    gen: (n, r) => {
      const cnt = n >= 600 ? 600 : r.int(1, 10);
      const strs = Array.from({ length: cnt }, () => r.string(r.int(1, n >= 600 ? 20 : 5), '01'));
      return [strs, n >= 600 ? 100 : r.int(0, 6), n >= 600 ? 100 : r.int(0, 6)];
    },
    perf: { n: 600, limitMs: 150 },
  },
  '07': {
    sig: 'int combinationSum4(int[] nums, int target)',
    title: 'Dãy số có thứ tự cộng bằng đích',
    ref: S.combinationSum4,
    brute: (nums: number[], target: number): number => {
      const f = (rem: number): number => {
        if (rem === 0) return 1;
        let t = 0;
        for (const x of nums) if (x <= rem) t += f(rem - x);
        return t;
      };
      return f(target) % MOD;
    },
    cases: [
      { args: [[1, 2, 3], 4], expected: 7 },
      { args: [[9], 3], expected: 0 },
      { args: [[1], 100000], expected: 1 },
      { args: [[1, 2], 5], expected: 8, note: 'Fibonacci' },
    ],
    gen: (n, r) => {
      if (n >= 1000) return [r.distinct(200, 1, 1000), 100000];
      return [r.distinct(r.int(1, 4), 1, 8), r.int(1, 14)];
    },
    stress: { minN: 1 },
    perf: { n: 1000, limitMs: 200 },
  },
  '08': {
    sig: 'int minCoinsBounded(int[] coins, int[] counts, int amount)',
    title: 'Đổi tiền với số tờ có hạn',
    ref: S.minCoinsBounded,
    brute: (coins: number[], counts: number[], amount: number): number => {
      const f = (i: number, rem: number): number => {
        if (rem === 0) return 0;
        if (i === coins.length) return Infinity;
        let best = Infinity;
        for (let k = 0; k <= counts[i] && k * coins[i] <= rem; k++) best = Math.min(best, k + f(i + 1, rem - k * coins[i]));
        return best;
      };
      const r = f(0, amount);
      return r === Infinity ? -1 : r;
    },
    cases: [
      { args: [[1, 2, 5], [5, 2, 1], 11], expected: 5 },
      { args: [[1, 2, 5], [5, 2, 1], 100], expected: -1 },
      { args: [[3], [2], 6], expected: 2 },
      { args: [[3], [2], 7], expected: -1 },
      { args: [[7], [1], 0], expected: 0 },
      { args: [[1], [1000], 1000], expected: 1000, note: 'một loại, 1000 tờ' },
    ],
    gen: (n, r) => {
      if (n >= 1000) return [r.array(100, 1, 100), r.array(100, 500, 1000), 10000];
      const k = r.int(1, 4);
      return [r.array(k, 1, 6), r.array(k, 0, 4), r.int(0, 20)];
    },
    perf: { n: 1000, limitMs: 200 },
  },
};
