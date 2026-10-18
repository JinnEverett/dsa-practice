import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** n khoảng [s, e) với 0 ≤ s < e ≤ maxT, độ dài ≤ maxLen. */
const randIntervals = (r: Rng, n: number, maxT: number, maxLen: number): number[][] =>
  Array.from({ length: n }, () => {
    const s = r.int(0, maxT - 1);
    return [s, Math.min(maxT, s + r.int(1, maxLen))];
  });

const MODP = 1_000_000_007n;

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int maxConcurrent(int[][] intervals)',
    title: 'Số khoảng chồng nhiều nhất',
    ref: S.maxConcurrent,
    brute: (iv: number[][]): number => {
      let best = 0;
      for (const [s] of iv) best = Math.max(best, iv.filter(([a, b]) => a <= s && s < b).length);
      return best;
    },
    cases: [
      { args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
      { args: [[[7, 10], [2, 4]]], expected: 1 },
      { args: [[[1, 5], [5, 10]]], expected: 1, note: 'kết thúc = bắt đầu: không chồng' },
      { args: [[]], expected: 0 },
      { args: [Array.from({ length: 100000 }, (_, i) => [i, 1_000_000_000])], expected: 100000, note: 'n = 10⁵ khoảng cùng kết thúc ở 10⁹' },
    ],
    gen: (n, r) => (n >= 1e5 ? [randIntervals(r, n, 1_000_000_000, 100_000_000)] : [randIntervals(r, r.int(0, 8), 12, 6)]),
    perf: { n: 1e5, limitMs: 150 },
  },
  '02': {
    sig: 'List<List<Integer>> getSkyline(int[][] buildings)',
    title: 'Đường chân trời (skyline)',
    ref: S.getSkyline,
    brute: (b: number[][]): number[][] => {
      const xs = [...new Set(b.flatMap(([l, r]) => [l, r]))].sort((p, q) => p - q);
      const out: number[][] = [];
      let last = 0;
      for (const x of xs) {
        const h = Math.max(0, ...b.filter(([l, r]) => l <= x && x < r).map((t) => t[2]));
        if (h !== last) (out.push([x, h]), (last = h));
      }
      return out;
    },
    cases: [
      { args: [[[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]]], expected: [[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]] },
      { args: [[[0, 2, 3], [2, 5, 3]]], expected: [[0, 3], [5, 0]], note: 'hai tòa nối nhau cùng chiều cao ⇒ không thêm điểm' },
      { args: [[[1, 2, 1], [1, 2, 2], [1, 2, 3]]], expected: [[1, 3], [2, 0]] },
      { args: [[[5, 6, 1]]], expected: [[5, 1], [6, 0]] },
      { args: [[]], expected: [] },
    ],
    gen: (n, r) => {
      if (n >= 1e5) return [randIntervals(r, n, 2_000_000_000, 50_000_000).map(([l, rr]) => [l, rr, r.int(1, 1_000_000_000)])];
      return [randIntervals(r, r.int(0, 7), 15, 8).map(([l, rr]) => [l, rr, r.int(1, 9)])];
    },
    perf: { n: 1e5, limitMs: 1200 },
  },
  '03': {
    sig: 'int[][] employeeFreeTime(int[][][] schedule)',
    title: 'Thời gian rảnh chung của nhân viên',
    ref: S.employeeFreeTime,
    brute: (sch: number[][][]): number[][] => {
      // đánh dấu từng đơn vị thời gian bận trên miền nhỏ
      const busy = new Array(40).fill(false);
      let lo = Infinity;
      let hi = -Infinity;
      for (const emp of sch)
        for (const [s, e] of emp) {
          for (let t = s; t < e; t++) busy[t] = true;
          lo = Math.min(lo, s);
          hi = Math.max(hi, e);
        }
      const out: number[][] = [];
      let start = -1;
      for (let t = lo; t < hi; t++) {
        if (!busy[t] && start < 0) start = t;
        if (busy[t] && start >= 0) (out.push([start, t]), (start = -1));
      }
      return out;
    },
    cases: [
      { args: [[[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]]], expected: [[3, 4]] },
      { args: [[[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]], expected: [[5, 6], [7, 9]] },
      { args: [[[[1, 2], [4, 5]]]], expected: [[2, 4]] },
      { args: [[[[1, 3]], [[3, 5]]]], expected: [], note: 'liền kề: không có khe' },
      { args: [[[[1, 10]], [[2, 3]], [[4, 5]]]], expected: [] },
    ],
    gen: (n, r) => {
      const empCount = n >= 1e5 ? 1000 : r.int(1, 4);
      const per = n >= 1e5 ? 100 : r.int(0, 3);
      const R = n >= 1e5 ? 1_000_000_000 : 30;
      return [
        Array.from({ length: empCount }, () => {
          const pts = r.distinct(per * 2, 0, R).sort((a, b) => a - b); // cặp liên tiếp ⇒ các khoảng rời nhau, đã sắp
          return Array.from({ length: per }, (_, i) => [pts[2 * i], pts[2 * i + 1]]);
        }),
      ];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
  '04': {
    sig: 'class MyCalendar {\n  MyCalendar()\n  boolean book(int start, int end)\n}',
    title: 'Lịch đặt phòng (không chồng)',
    ref: S.MyCalendar,
    brute: class {
      L: number[][] = [];
      book(s: number, e: number) {
        if (this.L.some(([a, b]) => s < b && a < e)) return false;
        this.L.push([s, e]);
        return true;
      }
    },
    cases: [
      { args: [['MyCalendar', 'book', 'book', 'book'], [[], [10, 20], [15, 25], [20, 30]]], expected: [null, true, false, true] },
      { args: [['MyCalendar', 'book', 'book', 'book'], [[], [0, 1], [1, 2], [0, 2]]], expected: [null, true, true, false] },
      { args: [['MyCalendar', 'book', 'book'], [[], [0, 1000000000], [0, 1]]], expected: [null, true, false], note: 'biên 10⁹' },
    ],
    gen: (n, r) => {
      const ops = ['MyCalendar'];
      const args: any[][] = [[]];
      const big = n >= 30000;
      for (let i = 0; i < Math.max(1, n); i++) {
        const s = big ? r.int(0, 999_000_000) : r.int(0, 20);
        ops.push('book');
        args.push([s, s + r.int(1, big ? 1000 : 6)]);
      }
      return [ops, args];
    },
    stress: { minN: 1 },
    perf: { n: 30000, limitMs: 500 },
  },
  '05': {
    sig: 'class MyCalendarTwo {\n  MyCalendarTwo()\n  boolean book(int start, int end)\n}',
    title: 'Lịch đặt phòng (cho phép chồng đôi)',
    ref: S.MyCalendarTwo,
    brute: class {
      L: number[][] = [];
      book(s: number, e: number) {
        const pts: [number, number][] = [[s, 1], [e, -1]];
        for (const [a, b] of this.L) pts.push([a, 1], [b, -1]);
        pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        let cur = 0;
        for (const [, d] of pts) if ((cur += d) >= 3) return false;
        this.L.push([s, e]);
        return true;
      }
    },
    cases: [
      { args: [['MyCalendarTwo', 'book', 'book', 'book', 'book', 'book', 'book'], [[], [10, 20], [50, 60], [10, 40], [5, 15], [5, 10], [25, 55]]], expected: [null, true, true, true, false, true, true] },
      { args: [['MyCalendarTwo', 'book', 'book', 'book'], [[], [0, 5], [0, 5], [0, 5]]], expected: [null, true, true, false] },
      { args: [['MyCalendarTwo', 'book', 'book', 'book'], [[], [0, 1], [1, 2], [0, 2]]], expected: [null, true, true, true], note: 'nửa mở: [0,1) và [1,2) không chồng' },
    ],
    gen: (n, r) => {
      const ops = ['MyCalendarTwo'];
      const args: any[][] = [[]];
      for (let i = 0; i < Math.max(1, n); i++) {
        const s = r.int(0, 25);
        ops.push('book');
        args.push([s, s + r.int(1, 8)]);
      }
      return [ops, args];
    },
    stress: { minN: 1 },
    perf: false,
  },
  '06': {
    sig: 'int rectangleArea(int[][] rectangles)',
    title: 'Diện tích hợp các hình chữ nhật',
    ref: S.rectangleArea,
    brute: (rects: number[][]): number => {
      // lưới ô đơn vị trên miền nhỏ
      const cells = new Set<string>();
      for (const [x1, y1, x2, y2] of rects) for (let x = x1; x < x2; x++) for (let y = y1; y < y2; y++) cells.add(`${x},${y}`);
      return cells.size % 1_000_000_007;
    },
    cases: [
      { args: [[[0, 0, 2, 2], [1, 0, 2, 3], [1, 0, 3, 1]]], expected: 6 },
      { args: [[[0, 0, 1000000000, 1000000000]]], expected: Number((1_000_000_000n * 1_000_000_000n) % MODP), note: '10¹⁸ mod p = 49: TS mất chính xác nếu nhân thẳng' },
      { args: [[[0, 0, 1, 1], [2, 2, 3, 3]]], expected: 2, note: 'hai hình rời nhau' },
      { args: [[[0, 0, 3, 3], [1, 1, 2, 2]]], expected: 9, note: 'hình nằm trọn trong hình khác' },
      { args: [Array.from({ length: 200 }, () => [0, 0, 1_000_000_000, 1_000_000_000])], expected: 49, note: '200 hình trùng nhau' },
    ],
    gen: (n, r) => {
      if (n >= 200) {
        return [
          Array.from({ length: 200 }, () => {
            const x1 = r.int(0, 999_999_000);
            const y1 = r.int(0, 999_999_000);
            return [x1, y1, x1 + r.int(1, 1_000_000_000 - x1), y1 + r.int(1, 1_000_000_000 - y1)];
          }),
        ];
      }
      return [
        Array.from({ length: r.int(1, 5) }, () => {
          const x1 = r.int(0, 6);
          const y1 = r.int(0, 6);
          return [x1, y1, x1 + r.int(1, 5), y1 + r.int(1, 5)];
        }),
      ];
    },
    stress: { minN: 1 },
    perf: { n: 200, limitMs: 100 },
  },
  '07': {
    sig: 'boolean canAccommodate(int[][] bookings, int rooms)',
    title: '🔴 Khách sạn đủ phòng không?',
    ref: S.canAccommodate,
    brute: (bk: number[][], rooms: number): boolean => {
      for (const [s] of bk) {
        let used = 0;
        for (const [a, b, need] of bk) if (a <= s && s < b) used += need;
        if (used > rooms) return false;
      }
      return true;
    },
    cases: [
      { args: [[[1, 5, 2], [2, 7, 3]], 4], expected: false },
      { args: [[[1, 5, 2], [2, 7, 3]], 5], expected: true },
      { args: [[[1, 5, 3], [5, 8, 3]], 3], expected: true, note: 'trả phòng sáng, nhận phòng chiều cùng ngày' },
      { args: [[], 0], expected: true },
      { args: [Array.from({ length: 100000 }, () => [1, 1_000_000_000, 10000]), 1_000_000_000], expected: true, note: 'tổng nhu cầu đúng bằng 10⁹' },
      { args: [Array.from({ length: 100000 }, () => [1, 1_000_000_000, 10000]), 999_999_999], expected: false },
    ],
    gen: (n, r) => {
      if (n >= 1e5) {
        const bk = randIntervals(r, n, 1_000_000_000, 100_000_000).map(([a, b]) => [a, b, r.int(1, 10000)]);
        return [bk, 400_000_000]; // sát ngưỡng ⇒ phải quét hết nếu không thoát sớm
      }
      return [randIntervals(r, r.int(0, 6), 12, 6).map(([a, b]) => [a, b, r.int(1, 4)]), r.int(0, 8)];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '08': {
    sig: 'int[] minAvailableDuration(int[][] slots1, int[][] slots2, int duration)',
    title: '🔴 Khung giờ họp chung sớm nhất',
    ref: S.minAvailableDuration,
    brute: (a: number[][], b: number[][], d: number): number[] => {
      let best: number[] = [];
      for (const [s1, e1] of a)
        for (const [s2, e2] of b) {
          const s = Math.max(s1, s2);
          const e = Math.min(e1, e2);
          if (e - s >= d && (best.length === 0 || s < best[0])) best = [s, s + d];
        }
      return best;
    },
    cases: [
      { args: [[[10, 50], [60, 120], [140, 210]], [[0, 15], [60, 70]], 8], expected: [60, 68] },
      { args: [[[10, 50], [60, 120], [140, 210]], [[0, 15], [60, 70]], 12], expected: [] },
      { args: [[[0, 10]], [[0, 10]], 10], expected: [0, 10], note: 'vừa khít' },
      { args: [[[5, 6]], [[6, 7]], 1], expected: [], note: 'chỉ chạm nhau: giao rỗng' },
      { args: [[[20, 30], [0, 10]], [[5, 25]], 5], expected: [5, 10], note: 'đầu vào chưa sắp' },
    ],
    gen: (n, r) => {
      const R = n >= 1e5 ? 1_000_000_000 : 40;
      const per = n >= 1e5 ? 50000 : r.int(0, 3);
      const mk = () => {
        const pts = r.distinct(per * 2, 0, R).sort((x, y) => x - y);
        return r.shuffle(Array.from({ length: per }, (_, i) => [pts[2 * i], pts[2 * i + 1]]));
      };
      return [mk(), mk(), n >= 1e5 ? 5000 : r.int(1, 6)];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
};
