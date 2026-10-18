import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Sinh dãy thao tác cho class kiểu "mảng + cập nhật điểm + truy vấn đoạn": [ops, args]. */
function arrayOps(r: Rng, ctor: string, upd: string, qry: string, n: number, len: number, valLo: number, valHi: number, big: boolean) {
  const nums = r.array(len, valLo, valHi);
  const ops = [ctor];
  const args: any[][] = [[nums]];
  for (let i = 0; i < Math.max(1, n); i++) {
    if (r.bool()) {
      ops.push(upd);
      args.push([r.int(0, len - 1), r.int(valLo, valHi)]);
    } else {
      ops.push(qry);
      // perf: đoạn rộng để quét thô thật sự tốn O(n)
      const l = big ? r.int(0, len >> 3) : r.int(0, len - 1);
      const rr = big ? r.int(len - 1 - (len >> 3), len - 1) : r.int(l, len - 1);
      args.push([l, Math.max(l, rr)]);
    }
  }
  return [ops, args];
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class NumArrayMutable {\n  NumArrayMutable(int[] nums)\n  void update(int index, int val)\n  long sumRange(int left, int right)\n}',
    title: 'Tổng đoạn có cập nhật (Fenwick)',
    ref: S.NumArrayMutable,
    brute: class {
      a: number[];
      constructor(nums: number[]) {
        this.a = nums.slice();
      }
      update(i: number, v: number) {
        this.a[i] = v;
      }
      sumRange(l: number, r: number) {
        let s = 0;
        for (let i = l; i <= r; i++) s += this.a[i];
        return s;
      }
    },
    cases: [
      { args: [['NumArrayMutable', 'sumRange', 'update', 'sumRange'], [[[1, 3, 5]], [0, 2], [1, 2], [0, 2]]], expected: [null, 9, null, 8] },
      { args: [['NumArrayMutable', 'sumRange', 'update', 'sumRange'], [[[7]], [0, 0], [0, -7], [0, 0]]], expected: [null, 7, null, -7] },
      {
        args: [['NumArrayMutable', 'sumRange', 'update', 'sumRange'], [[new Array(100000).fill(1_000_000_000)], [0, 99999], [0, -1_000_000_000], [0, 99999]]],
        expected: [null, 100000 * 1_000_000_000, null, 100000 * 1_000_000_000 - 2_000_000_000],
        note: 'tổng 10¹⁴ > 2³¹: Java cần long',
      },
    ],
    gen: (n, r) => (n >= 1e5 ? arrayOps(r, 'NumArrayMutable', 'update', 'sumRange', n, 1e5, -1_000_000_000, 1_000_000_000, true) : arrayOps(r, 'NumArrayMutable', 'update', 'sumRange', n, r.int(1, 8), -20, 20, false)),
    perf: { n: 1e5, limitMs: 300 },
  },
  '02': {
    sig: 'List<Integer> countSmaller(int[] nums)',
    title: 'Đếm số phần tử nhỏ hơn bên phải',
    ref: S.countSmaller,
    brute: (nums: number[]): number[] => nums.map((x, i) => nums.slice(i + 1).filter((y) => y < x).length),
    cases: [
      { args: [[5, 2, 6, 1]], expected: [2, 1, 1, 0] },
      { args: [[-1]], expected: [0] },
      { args: [[-1, -1]], expected: [0, 0] },
      { args: [Array.from({ length: 100000 }, (_, i) => 100000 - i)], expected: Array.from({ length: 100000 }, (_, i) => 99999 - i), note: 'giảm dần: bản O(n²) ≈ 5·10⁹ phép' },
    ],
    gen: (n, r) => [r.array(Math.max(1, n >= 1e5 ? n : Math.min(n, 12)), n >= 1e5 ? -1_000_000_000 : -5, n >= 1e5 ? 1_000_000_000 : 5)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 500 },
  },
  '03': {
    sig: 'class RangeMin {\n  RangeMin(int[] nums)\n  void update(int i, int val)\n  int query(int l, int r)\n}',
    title: 'Min đoạn có cập nhật (segment tree)',
    ref: S.RangeMin,
    brute: class {
      a: number[];
      constructor(nums: number[]) {
        this.a = nums.slice();
      }
      update(i: number, v: number) {
        this.a[i] = v;
      }
      query(l: number, r: number) {
        return Math.min(...this.a.slice(l, r + 1));
      }
    },
    cases: [
      { args: [['RangeMin', 'query', 'update', 'query'], [[[5, 3, 8]], [0, 2], [1, 10], [0, 2]]], expected: [null, 3, null, 5] },
      { args: [['RangeMin', 'query', 'query'], [[[4]], [0, 0], [0, 0]]], expected: [null, 4, 4] },
      { args: [['RangeMin', 'query', 'update', 'query'], [[[-2147483648, 2147483647]], [0, 1], [0, 2147483647], [0, 1]]], expected: [null, -2147483648, null, 2147483647], note: 'biên int' },
    ],
    gen: (n, r) => (n >= 1e5 ? arrayOps(r, 'RangeMin', 'update', 'query', n, 1e5, -1_000_000_000, 1_000_000_000, true) : arrayOps(r, 'RangeMin', 'update', 'query', n, r.int(1, 8), -20, 20, false)),
    perf: { n: 1e5, limitMs: 300 },
  },
  '04': {
    sig: 'long countRangeSum(int[] nums, int lower, int upper)',
    title: 'Đếm đoạn có tổng trong [lower, upper]',
    ref: S.countRangeSum,
    brute: (nums: number[], lo: number, hi: number): number => {
      let c = 0;
      for (let i = 0; i < nums.length; i++) {
        let s = 0;
        for (let j = i; j < nums.length; j++) {
          s += nums[j];
          if (s >= lo && s <= hi) c++;
        }
      }
      return c;
    },
    cases: [
      { args: [[-2, 5, -1], -2, 2], expected: 3 },
      { args: [[0], 0, 0], expected: 1 },
      { args: [[1, 2, 3], 10, 20], expected: 0 },
      { args: [new Array(100000).fill(0), 0, 0], expected: 5_000_050_000, note: 'n(n+1)/2 = 5·10⁹ > int' },
    ],
    gen: (n, r) => {
      if (n >= 1e5) return [r.array(n, -10000, 10000), -100000, 100000];
      const lo = r.int(-6, 3);
      return [r.array(Math.max(1, Math.min(n, 12)), -5, 5), lo, lo + r.int(0, 8)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 600 },
  },
  '05': {
    sig: 'long reversePairs(int[] nums)',
    title: 'Cặp đảo ngược quan trọng',
    ref: S.reversePairs,
    brute: (nums: number[]): number => {
      let c = 0;
      for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] > 2 * nums[j]) c++;
      return c;
    },
    cases: [
      { args: [[1, 3, 2, 3, 1]], expected: 2 },
      { args: [[2, 4, 3, 5, 1]], expected: 3 },
      { args: [[5]], expected: 0 },
      {
        args: [[...new Array(50000).fill(2147483647), ...new Array(50000).fill(-2147483648)]],
        expected: 50000 * 50000 + (50000 * 49999) / 2,
        note: '2·nums[j] tràn int; đáp án > 2³¹',
      },
    ],
    gen: (n, r) => [r.array(Math.max(1, n >= 1e5 ? n : Math.min(n, 12)), n >= 1e5 ? -2147483648 : -6, n >= 1e5 ? 2147483647 : 6)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 600 },
  },
  '06': {
    sig: 'class RangeAddSum {\n  RangeAddSum(int n)\n  void add(int l, int r, long v)\n  long sum(int l, int r)\n}',
    title: 'Cộng đoạn, tổng đoạn',
    ref: S.RangeAddSum,
    brute: class {
      a: number[];
      constructor(n: number) {
        this.a = new Array(n).fill(0);
      }
      add(l: number, r: number, v: number) {
        for (let i = l; i <= r; i++) this.a[i] += v;
      }
      sum(l: number, r: number) {
        let s = 0;
        for (let i = l; i <= r; i++) s += this.a[i];
        return s;
      }
    },
    cases: [
      { args: [['RangeAddSum', 'add', 'sum', 'add', 'sum'], [[5], [1, 3, 2], [0, 4], [2, 4, 1], [2, 3]]], expected: [null, null, 6, null, 6] },
      { args: [['RangeAddSum', 'sum', 'add', 'sum'], [[1], [0, 0], [0, 0, -5], [0, 0]]], expected: [null, 0, null, -5] },
      {
        args: [['RangeAddSum', 'add', 'add', 'sum'], [[100000], [0, 99999, 10000], [0, 99999, 10000], [0, 99999]]],
        expected: [null, null, null, 2 * 10000 * 100000],
        note: 'cộng cả mảng hai lần',
      },
    ],
    gen: (n, r) => {
      const len = n >= 1e5 ? 1e5 : r.int(1, 8);
      const ops = ['RangeAddSum'];
      const args: any[][] = [[len]];
      for (let i = 0; i < Math.max(1, n); i++) {
        const l = n >= 1e5 ? r.int(0, len >> 3) : r.int(0, len - 1);
        const rr = n >= 1e5 ? r.int(len - 1 - (len >> 3), len - 1) : r.int(l, len - 1);
        ops.push(r.bool() ? 'add' : 'sum');
        args.push(ops[ops.length - 1] === 'add' ? [l, Math.max(l, rr), r.int(-10000, 10000)] : [l, Math.max(l, rr)]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '07': {
    sig: 'int[] rankAfterEachScore(int[] scores)',
    title: '🔴 Xếp hạng sau mỗi lần nộp bài',
    ref: S.rankAfterEachScore,
    brute: (scores: number[]): number[] => scores.map((s, i) => 1 + scores.slice(0, i).filter((x) => x > s).length),
    cases: [
      { args: [[5, 3, 5, 10, 1]], expected: [1, 2, 1, 1, 5] },
      { args: [[7]], expected: [1] },
      { args: [[2, 2, 2]], expected: [1, 1, 1], note: 'bằng điểm ⇒ cùng hạng' },
      { args: [Array.from({ length: 100000 }, (_, i) => 100000 - i)], expected: Array.from({ length: 100000 }, (_, i) => i + 1), note: 'điểm giảm dần ⇒ hạng i+1' },
    ],
    gen: (n, r) => [r.array(Math.max(1, n >= 1e5 ? n : Math.min(n, 12)), 0, n >= 1e5 ? 1_000_000_000 : 6)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 500 },
  },
  '08': {
    sig: 'class MyCalendarThree {\n  MyCalendarThree()\n  int book(int startTime, int endTime)\n}',
    title: '🔴 Lịch đặt phòng: mức chồng chéo cao nhất',
    ref: S.MyCalendarThree,
    brute: class {
      ev: number[][] = [];
      book(s: number, e: number) {
        this.ev.push([s, e]);
        const pts: [number, number][] = [];
        for (const [a, b] of this.ev) pts.push([a, 1], [b, -1]);
        pts.sort((x, y) => x[0] - y[0] || x[1] - y[1]); // kết thúc trước bắt đầu tại cùng thời điểm
        let cur = 0;
        let best = 0;
        for (const [, d] of pts) best = Math.max(best, (cur += d));
        return best;
      }
    },
    cases: [
      {
        args: [['MyCalendarThree', 'book', 'book', 'book', 'book', 'book', 'book'], [[], [10, 20], [50, 60], [10, 40], [5, 15], [5, 10], [25, 55]]],
        expected: [null, 1, 1, 2, 3, 3, 3],
      },
      { args: [['MyCalendarThree', 'book', 'book'], [[], [0, 1], [1, 2]]], expected: [null, 1, 1], note: 'nửa mở: [0,1) và [1,2) không chồng' },
      { args: [['MyCalendarThree', 'book', 'book'], [[], [0, 1000000000], [999999999, 1000000000]]], expected: [null, 1, 2], note: 'biên 10⁹' },
    ],
    gen: (n, r) => {
      const ops = ['MyCalendarThree'];
      const args: any[][] = [[]];
      const big = n >= 30000;
      for (let i = 0; i < Math.max(1, n); i++) {
        const s = big ? r.int(0, 999_000_000) : r.int(0, 20);
        ops.push('book');
        args.push([s, s + r.int(1, big ? 1_000_000 : 8)]);
      }
      return [ops, args];
    },
    stress: { minN: 1, maxN: 25 },
    perf: { n: 30000, limitMs: 500 },
  },
};
