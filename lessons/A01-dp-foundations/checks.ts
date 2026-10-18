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

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int tribonacci(int n)',
    title: 'Tribonacci',
    ref: S.tribonacci,
    brute: (n: number): number => (n === 0 ? 0 : n < 3 ? 1 : (specs['01'].brute as any)(n - 1) + (specs['01'].brute as any)(n - 2) + (specs['01'].brute as any)(n - 3)),
    cases: [
      { args: [4], expected: 4 },
      { args: [25], expected: 1389537 },
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [37], expected: 2082876103, note: 'lớn nhất còn vừa int' },
    ],
    gen: (n, r) => [n > 30 ? 37 : r.int(0, 18)],
    perf: { n: 37, limitMs: 50 }, // bản đệ quy thuần O(3ⁿ) chạy hàng chục giây ở n = 37
  },
  '02': {
    sig: 'int minCostClimbingStairs(int[] cost)',
    title: 'Leo cầu thang chi phí tối thiểu',
    ref: S.minCostClimbingStairs,
    brute: (cost: number[]): number => {
      const f = (i: number): number => (i >= cost.length ? 0 : cost[i] + Math.min(f(i + 1), f(i + 2)));
      return Math.min(f(0), f(1));
    },
    cases: [
      { args: [[10, 15, 20]], expected: 15 },
      { args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6 },
      { args: [[5, 5]], expected: 5 },
      { args: [new Array(100000).fill(10000)], expected: 10000 * 50000, note: '10⁵ bậc, mỗi bậc 10⁴' },
    ],
    gen: (n, r) => [r.array(Math.max(2, n > 1000 ? n : Math.min(n, 14)), 0, 10000)],
    stress: { minN: 2 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'int rob(int[] nums)',
    title: 'House robber',
    ref: S.rob,
    brute: (a: number[]): number => {
      const f = (i: number): number => (i >= a.length ? 0 : Math.max(f(i + 1), a[i] + f(i + 2)));
      return f(0);
    },
    cases: [
      { args: [[1, 2, 3, 1]], expected: 4 },
      { args: [[2, 7, 9, 3, 1]], expected: 12 },
      { args: [[5]], expected: 5 },
      { args: [[0, 0, 0]], expected: 0 },
      { args: [new Array(100000).fill(10000)], expected: 10000 * 50000, note: 'n = 10⁵: memo đệ quy sâu n tầng sẽ tràn stack' },
    ],
    gen: (n, r) => [r.array(Math.max(1, n > 1000 ? n : Math.min(n, 22)), 0, 10000)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'int robCircular(int[] nums)',
    title: 'House robber vòng tròn',
    ref: S.robCircular,
    brute: (a: number[]): number => {
      const n = a.length;
      let best = 0;
      for (let mask = 0; mask < 1 << n; mask++) {
        let ok = true;
        let sum = 0;
        for (let i = 0; i < n && ok; i++) {
          if (!(mask >> i & 1)) continue;
          sum += a[i];
          if (n > 1 && mask >> ((i + 1) % n) & 1) ok = false;
        }
        if (ok && sum > best) best = sum;
      }
      return best;
    },
    cases: [
      { args: [[2, 3, 2]], expected: 3 },
      { args: [[1, 2, 3, 1]], expected: 4 },
      { args: [[1, 2, 3]], expected: 3 },
      { args: [[7]], expected: 7 },
      { args: [[5, 1]], expected: 5 },
      { args: [new Array(99999).fill(10000)], expected: 10000 * 49999, note: 'n lẻ lớn' },
    ],
    gen: (n, r) => [r.array(Math.max(1, n > 1000 ? n : Math.min(n, 12)), 0, 10000)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'int deleteAndEarn(int[] nums)',
    title: 'Xóa và kiếm điểm',
    ref: S.deleteAndEarn,
    brute: (nums: number[]): number => {
      // vét cạn tập giá trị khác nhau được chọn, không chọn hai giá trị liên tiếp
      const cnt = new Map<number, number>();
      for (const x of nums) cnt.set(x, (cnt.get(x) ?? 0) + 1);
      const vals = [...cnt.keys()];
      let best = 0;
      for (let mask = 0; mask < 1 << vals.length; mask++) {
        const chosen = vals.filter((_, i) => mask >> i & 1);
        const set = new Set(chosen);
        if (chosen.some((v) => set.has(v + 1))) continue;
        best = Math.max(best, chosen.reduce((s, v) => s + v * cnt.get(v)!, 0));
      }
      return best;
    },
    cases: [
      { args: [[3, 4, 2]], expected: 6 },
      { args: [[2, 2, 3, 3, 3, 4]], expected: 9 },
      { args: [[1]], expected: 1 },
      { args: [new Array(100000).fill(10000)], expected: 1000000000, note: '10⁵ × 10⁴ = 10⁹, vừa int' },
    ],
    gen: (n, r) => (n > 1000 ? [r.array(n, 1, 10000)] : [r.array(Math.max(1, Math.min(n, 12)), 1, 8)]),
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '06': {
    sig: 'int countWaysK(int n, int k)',
    title: 'Đếm cách leo thang (bước 1..k)',
    ref: S.countWaysK,
    brute: (n: number, k: number): number => {
      const M = 1_000_000_007;
      const w = new Array<number>(n + 1).fill(0);
      w[0] = 1;
      for (let i = 1; i <= n; i++) for (let j = 1; j <= Math.min(k, i); j++) w[i] = (w[i] + w[i - j]) % M;
      return w[n];
    },
    cases: [
      { args: [3, 2], expected: 3 },
      { args: [4, 3], expected: 7 },
      { args: [5, 1], expected: 1 },
      { args: [1, 5], expected: 1 },
      { args: [10000, 10000], expected: Number(powMod(2n, 9999n)), note: 'k ≥ n ⇒ 2^(n−1)' },
    ],
    gen: (n, r) => (n > 1000 ? [n, n] : [r.int(1, Math.max(1, n) + 5), r.int(1, 8)]),
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '07': {
    sig: 'int mincostTickets(int[] days, int[] costs)',
    title: 'Vé tàu',
    ref: S.mincostTickets,
    brute: (days: number[], costs: number[]): number => {
      const dur = [1, 7, 30];
      const f = (i: number): number => {
        if (i >= days.length) return 0;
        let best = Infinity;
        for (let p = 0; p < 3; p++) {
          let j = i;
          while (j < days.length && days[j] < days[i] + dur[p]) j++;
          best = Math.min(best, costs[p] + f(j));
        }
        return best;
      };
      return f(0);
    },
    cases: [
      { args: [[1, 4, 6, 7, 8, 20], [2, 7, 15]], expected: 11 },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31], [2, 7, 15]], expected: 17 },
      { args: [[1000000000], [3, 5, 9]], expected: 3, note: 'ngày 10⁹: không dựng mảng theo ngày' },
      { args: [[1, 2, 3, 4, 5, 6, 7], [10, 7, 100]], expected: 7 },
    ],
    gen: (n, r) => {
      if (n > 1000) return [r.distinct(n, 1, 1_000_000_000).sort((a, b) => a - b), [r.int(1, 10000), r.int(1, 10000), r.int(1, 10000)]];
      const len = r.int(1, Math.min(10, Math.max(1, n)));
      return [r.distinct(len, 1, 60).sort((a, b) => a - b), [r.int(1, 10), r.int(1, 20), r.int(1, 40)]];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'int minCostPaint(int[][] costs)',
    title: 'Sơn nhà',
    ref: S.minCostPaint,
    brute: (costs: number[][]): number => {
      const f = (i: number, last: number): number => {
        if (i === costs.length) return 0;
        let best = Infinity;
        for (let c = 0; c < 3; c++) if (c !== last) best = Math.min(best, costs[i][c] + f(i + 1, c));
        return best;
      };
      return f(0, -1);
    },
    cases: [
      { args: [[[17, 2, 17], [16, 16, 5], [14, 3, 19]]], expected: 10 },
      { args: [[[7, 6, 2]]], expected: 2 },
      { args: [Array.from({ length: 100000 }, () => [20, 20, 20])], expected: 2000000, note: 'n = 10⁵' },
    ],
    gen: (n, r) => [r.matrix(Math.max(1, n > 1000 ? n : Math.min(n, 9)), 3, 1, 20)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 200 },
  },
  '09': {
    sig: 'long mostPoints(int[][] questions)',
    title: 'Câu hỏi thi có điểm',
    ref: S.mostPoints,
    brute: (q: number[][]): number => {
      const f = (i: number): number => (i >= q.length ? 0 : Math.max(f(i + 1), q[i][0] + f(i + q[i][1] + 1)));
      return f(0);
    },
    cases: [
      { args: [[[3, 2], [4, 3], [4, 4], [2, 5]]], expected: 5 },
      { args: [[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]], expected: 7 },
      { args: [[[1000000000, 1]]], expected: 1000000000 },
      { args: [Array.from({ length: 100000 }, () => [1000000000, 0])], expected: 100000 * 1000000000, note: 'tổng 10¹⁴ > 2³¹: Java cần long' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n > 1000 ? n : Math.min(n, 14));
      return [Array.from({ length: len }, () => [r.int(1, n > 1000 ? 1e9 : 20), r.int(0, n > 1000 ? 100 : 5)])];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '10': {
    sig: 'int jobScheduling(int[] startTime, int[] endTime, int[] profit)',
    title: 'Xếp lịch công việc có lợi nhuận',
    ref: S.jobScheduling,
    brute: (s: number[], e: number[], p: number[]): number => {
      const n = s.length;
      let best = 0;
      for (let mask = 0; mask < 1 << n; mask++) {
        const ids: number[] = [];
        for (let i = 0; i < n; i++) if (mask >> i & 1) ids.push(i);
        let ok = true;
        for (let a = 0; a < ids.length && ok; a++)
          for (let b = a + 1; b < ids.length; b++) if (s[ids[a]] < e[ids[b]] && s[ids[b]] < e[ids[a]]) { ok = false; break; }
        if (ok) best = Math.max(best, ids.reduce((t, i) => t + p[i], 0));
      }
      return best;
    },
    cases: [
      { args: [[1, 2, 3, 3], [3, 4, 5, 6], [50, 10, 40, 70]], expected: 120 },
      { args: [[1, 2, 3, 4, 6], [3, 5, 10, 6, 9], [20, 20, 100, 70, 60]], expected: 150 },
      { args: [[1, 1, 1], [2, 3, 4], [5, 6, 4]], expected: 6 },
      { args: [[1, 3], [3, 5], [4, 5]], expected: 9, note: 'end = start tiếp theo vẫn xếp được' },
      {
        args: [Array.from({ length: 100000 }, (_, i) => i * 10), Array.from({ length: 100000 }, (_, i) => i * 10 + 10), new Array(100000).fill(10000)],
        expected: 1000000000,
        note: '10⁵ job nối đuôi nhau',
      },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n > 1000 ? n : Math.min(n, 10));
      const T = n > 1000 ? 500_000_000 : 20; // perf: khoảng dài, chồng lấn dày ⇒ quét tuyến tính O(n²) bị bắt
      const s: number[] = [];
      const e: number[] = [];
      for (let i = 0; i < len; i++) {
        const a = r.int(1, T - 1);
        s.push(a);
        e.push(a + r.int(1, n > 1000 ? 500_000_000 : 6));
      }
      return [s, e, r.array(len, 1, 10000)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 300 },
  },
};
