import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

class NaiveNumArray {
  nums: number[];
  constructor(nums: number[]) {
    this.nums = nums.slice();
  }
  sumRange(l: number, r: number) {
    let s = 0;
    for (let i = l; i <= r; i++) s += this.nums[i];
    return s;
  }
}

class NaiveNumMatrix {
  m: number[][];
  constructor(m: number[][]) {
    this.m = m.map((row) => row.slice());
  }
  sumRegion(r1: number, c1: number, r2: number, c2: number) {
    let s = 0;
    for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) s += this.m[i][j];
    return s;
  }
}

const countSub = (nums: number[], pred: (sum: number, len: number, ones: number) => boolean) => {
  let c = 0;
  for (let l = 0; l < nums.length; l++) {
    let sum = 0;
    for (let r = l; r < nums.length; r++) {
      sum += nums[r];
      if (pred(sum, r - l + 1, 0)) c++;
    }
  }
  return c;
};

const pairLR = (n: number, r: Rng) => {
  const a = r.int(0, n - 1);
  const b = r.int(0, n - 1);
  return [Math.min(a, b), Math.max(a, b)];
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'long[] runningSum(int[] nums)',
    title: 'Tổng cộng dồn',
    ref: S.runningSum,
    brute: (nums: number[]) => nums.map((_, i) => nums.slice(0, i + 1).reduce((a, b) => a + b, 0)),
    cases: [
      { args: [[1, 2, 3, 4]], expected: [1, 3, 6, 10] },
      { args: [[3, 1, 2, 10, 1]], expected: [3, 4, 6, 16, 17] },
      { args: [[]], expected: [] },
      { args: [[1e9, 1e9, 1e9]], expected: [1e9, 2e9, 3e9], note: 'Java: long' },
    ],
    gen: (n, r) => [r.array(n, -1e9, 1e9)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '02': {
    sig: 'class NumArray {\n  NumArray(int[] nums)\n  long sumRange(int left, int right)\n}',
    title: 'Truy vấn tổng đoạn (class)',
    ref: S.NumArray,
    brute: NaiveNumArray,
    cases: [
      {
        args: [['NumArray', 'sumRange', 'sumRange', 'sumRange'], [[[-2, 0, 3, -5, 2, -1]], [0, 2], [2, 5], [0, 5]]],
        expected: [null, 1, -1, -3],
      },
      { args: [['NumArray', 'sumRange'], [[[7]], [0, 0]]], expected: [null, 7] },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      const q = Math.max(1, n);
      const ops = ['NumArray', ...new Array(q).fill('sumRange')];
      const args = [[r.array(len, -1e5, 1e5)], ...Array.from({ length: q }, () => pairLR(len, r))];
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'int pivotIndex(int[] nums)',
    title: 'Chỉ số cân bằng',
    ref: S.pivotIndex,
    brute: (nums: number[]) => {
      const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
      for (let i = 0; i < nums.length; i++) if (sum(nums.slice(0, i)) === sum(nums.slice(i + 1))) return i;
      return -1;
    },
    cases: [
      { args: [[1, 7, 3, 6, 5, 6]], expected: 3 },
      { args: [[1, 2, 3]], expected: -1 },
      { args: [[2, 1, -1]], expected: 0 },
      { args: [[0]], expected: 0 },
      { args: [[-1, -1, 0, 1, 1, 0]], expected: 5 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), -2, 2)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '04': {
    sig: 'int subarraySum(int[] nums, int k)',
    title: 'Đếm đoạn con có tổng bằng k',
    ref: S.subarraySum,
    brute: (nums: number[], k: number) => countSub(nums, (s) => s === k),
    cases: [
      { args: [[1, 1, 1], 2], expected: 2 },
      { args: [[1, 2, 3], 3], expected: 2 },
      { args: [[1, -1, 0], 0], expected: 3 },
      { args: [[0, 0, 0], 0], expected: 6 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), -3, 3), r.int(-4, 4)],
    // n = 2·10⁴ → O(n²) = 4·10⁸ phép: bản 2 vòng lặp mất ~0.5–1 s, vượt giới hạn
    perf: { n: 20_000, limitMs: 30 },
  },
  '05': {
    sig: 'class NumMatrix {\n  NumMatrix(int[][] matrix)\n  int sumRegion(int row1, int col1, int row2, int col2)\n}',
    title: 'Tổng hình chữ nhật (class)',
    ref: S.NumMatrix,
    brute: NaiveNumMatrix,
    cases: [
      {
        args: [
          ['NumMatrix', 'sumRegion', 'sumRegion', 'sumRegion'],
          [[[[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]]], [2, 1, 4, 3], [1, 1, 2, 2], [1, 2, 2, 4]],
        ],
        expected: [null, 8, 11, 12],
      },
      { args: [['NumMatrix', 'sumRegion'], [[[[-4]]], [0, 0, 0, 0]]], expected: [null, -4] },
    ],
    gen: (n, r) => {
      const R = Math.max(1, Math.min(200, Math.round(Math.sqrt(Math.max(1, n)) + r.int(0, 2))));
      const C = Math.max(1, Math.min(200, Math.round(Math.sqrt(Math.max(1, n)) + r.int(0, 2))));
      const q = Math.max(1, Math.min(n, 10_000));
      const ops = ['NumMatrix', ...new Array(q).fill('sumRegion')];
      const args: any[] = [[r.matrix(R, C, -1e4, 1e4)]];
      for (let k = 0; k < q; k++) {
        const [r1, r2] = pairLR(R, r);
        const [c1, c2] = pairLR(C, r);
        args.push([r1, c1, r2, c2]);
      }
      return [ops, args];
    },
    perf: { n: 40_000, limitMs: 50 },
  },
  '06': {
    sig: 'int[] flightBookings(int[][] bookings, int n)',
    title: 'Đặt chỗ chuyến bay',
    ref: S.flightBookings,
    brute: (bookings: number[][], n: number) => {
      const out = new Array(n).fill(0);
      for (const [f, l, s] of bookings) for (let i = f; i <= l; i++) out[i - 1] += s;
      return out;
    },
    cases: [
      { args: [[[1, 2, 10], [2, 3, 20], [2, 5, 25]], 5], expected: [10, 55, 45, 25, 25] },
      { args: [[[1, 2, 10], [2, 2, 15]], 2], expected: [10, 25] },
      { args: [[], 3], expected: [0, 0, 0] },
    ],
    gen: (n, r) => {
      const fl = Math.max(1, n);
      return [Array.from({ length: n }, () => [...pairLR(fl, r).map((x) => x + 1), r.int(1, 1e4)]), fl];
    },
    perf: { n: 20_000, limitMs: 30 },
  },
  '07': {
    sig: 'int findMaxLength(int[] nums)',
    title: 'Đoạn dài nhất có số 0 = số 1',
    ref: S.findMaxLength,
    brute: (nums: number[]) => {
      let best = 0;
      for (let l = 0; l < nums.length; l++) {
        let bal = 0;
        for (let r = l; r < nums.length; r++) {
          bal += nums[r] ? 1 : -1;
          if (bal === 0) best = Math.max(best, r - l + 1);
        }
      }
      return best;
    },
    cases: [
      { args: [[0, 1]], expected: 2 },
      { args: [[0, 1, 0]], expected: 2 },
      { args: [[0, 1, 1, 1, 1, 1, 0, 0, 0]], expected: 6 },
      { args: [[1]], expected: 0 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), 0, 1)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '08': {
    sig: 'int subarraysDivByK(int[] nums, int k)',
    title: 'Đếm đoạn có tổng chia hết cho k',
    ref: S.subarraysDivByK,
    brute: (nums: number[], k: number) => countSub(nums, (s) => s % k === 0),
    cases: [
      { args: [[4, 5, 0, -2, -3, 1], 5], expected: 7 },
      { args: [[5], 9], expected: 0 },
      { args: [[-1, 2, 9], 2], expected: 2, note: 'số âm' },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), -20, 20), r.int(2, 7)],
    perf: { n: 30_000, limitMs: 30 },
  },
  '09': {
    sig: 'boolean carPooling(int[][] trips, int capacity)',
    title: 'Xe đưa đón nhân viên',
    ref: S.carPooling,
    brute: (trips: number[][], cap: number) => {
      for (let km = 0; km <= 1000; km++) {
        let load = 0;
        for (const [num, f, t] of trips) if (f <= km && km < t) load += num;
        if (load > cap) return false;
      }
      return true;
    },
    cases: [
      { args: [[[2, 1, 5], [3, 3, 7]], 4], expected: false },
      { args: [[[2, 1, 5], [3, 3, 7]], 5], expected: true },
      { args: [[[2, 1, 5], [3, 5, 7]], 3], expected: true, note: 'xuống ở km 5 rồi người khác mới lên' },
    ],
    gen: (n, r) => {
      const trips = Array.from({ length: Math.max(1, n) }, () => {
        const f = r.int(0, 20);
        return [r.int(1, 5), f, r.int(f + 1, 21)];
      });
      return [trips, r.int(1, 15)];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '10': {
    sig: 'int maxOnline(int[][] sessions, int T)',
    title: 'Số user online cao nhất',
    ref: S.maxOnline,
    brute: (sessions: number[][], T: number) => {
      let best = 0;
      for (let t = 0; t <= T; t++) best = Math.max(best, sessions.filter(([s, e]) => s <= t && t < e).length);
      return best;
    },
    cases: [
      { args: [[[0, 10], [5, 15], [10, 20]], 20], expected: 2 },
      { args: [[], 5], expected: 0 },
      { args: [[[1, 3], [1, 3], [2, 4]], 4], expected: 3 },
    ],
    gen: (n, r) => {
      const T = n > 1000 ? 1_000_000 : r.int(1, 40);
      return [
        Array.from({ length: n }, () => {
          const s = r.int(0, T - 1);
          return [s, r.int(s + 1, T)];
        }),
        T,
      ];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
};
