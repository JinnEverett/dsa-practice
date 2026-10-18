import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const popcount = (x: number) => x.toString(2).replace(/0/g, '').length;

/** Khoảng [s, e] với s < e (phần mở rộng cho phép chạm đầu mút) trong miền [0, span]. */
const randIntervals = (n: number, span: number, maxLen: number, r: Rng): number[][] =>
  Array.from({ length: n }, () => {
    const s = r.int(0, span - 1);
    return [s, Math.min(span, s + r.int(1, maxLen))];
  });

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'boolean canJump(int[] nums)',
    title: 'Có nhảy tới ô cuối?',
    ref: S.canJump,
    brute: (nums: number[]) => {
      const n = nums.length;
      const can = new Array<boolean>(n).fill(false);
      can[0] = true;
      for (let i = 0; i < n; i++) if (can[i]) for (let k = 1; k <= nums[i] && i + k < n; k++) can[i + k] = true;
      return can[n - 1];
    },
    cases: [
      { args: [[2, 3, 1, 1, 4]], expected: true },
      { args: [[3, 2, 1, 0, 4]], expected: false },
      { args: [[0]], expected: true },
      { args: [[0, 1]], expected: false },
      { args: [[1, 0, 0]], expected: false },
      { args: [[1000, 0, 0, 0]], expected: true },
      { args: [[...new Array(99999).fill(1), 0]], expected: true, note: '10⁵ bước đơn' },
      { args: [[...new Array(50000).fill(1), 0, ...new Array(49999).fill(1)]], expected: false, note: 'kẹt giữa chừng' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > 1000) return [[...r.array(len - 1, 1, len), 0]]; // bước nhảy lớn: DP O(n²) quá giờ
      return [r.array(len, 0, 4)];
    },
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'int jump(int[] nums)',
    title: 'Số bước nhảy ít nhất',
    ref: S.jump,
    brute: (nums: number[]) => {
      const n = nums.length;
      const best = new Array<number>(n).fill(Infinity);
      best[0] = 0;
      for (let i = 0; i < n; i++) for (let k = 1; k <= nums[i] && i + k < n; k++) best[i + k] = Math.min(best[i + k], best[i] + 1);
      return best[n - 1];
    },
    cases: [
      { args: [[2, 3, 1, 1, 4]], expected: 2 },
      { args: [[2, 3, 0, 1, 4]], expected: 2 },
      { args: [[0]], expected: 0 },
      { args: [[1, 1, 1, 1]], expected: 3 },
      { args: [[10, 0, 0, 0, 0]], expected: 1 },
      { args: [new Array(100000).fill(1)], expected: 99999, note: '10⁵ ô, mỗi bước 1' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      const a = n > 1000 ? r.array(len, 1, len) : r.array(len, 0, 4); // n lớn: bước nhảy lớn → DP O(n²) quá giờ
      // bảo đảm đến được ô cuối: nếu bị kẹt ở i thì cho ô i − 1 nhảy được ít nhất 1
      let far = 0;
      for (let i = 0; i < len; i++) {
        if (i > far) ((a[i - 1] = Math.max(a[i - 1], 1)), (far = Math.max(far, i - 1 + a[i - 1])));
        far = Math.max(far, i + a[i]);
      }
      return [a];
    },
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'int eraseOverlapIntervals(int[][] intervals)',
    title: 'Xóa ít khoảng để hết chồng nhau',
    ref: S.eraseOverlapIntervals,
    brute: (iv: number[][]) => {
      // chọn tập con lớn nhất không có hai khoảng chồng nhau (vét cạn mọi tập con)
      let best = 0;
      for (let mask = 0; mask < 1 << iv.length; mask++) {
        const pick = iv.filter((_, i) => (mask >> i) & 1);
        const ok = pick.every((a, i) => pick.every((b, j) => i >= j || a[1] <= b[0] || b[1] <= a[0]));
        if (ok) best = Math.max(best, pick.length);
      }
      return iv.length - best;
    },
    cases: [
      { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 },
      { args: [[[1, 2], [1, 2], [1, 2]]], expected: 2 },
      { args: [[[1, 2], [2, 3]]], expected: 0, note: 'chạm đầu mút không tính chồng' },
      { args: [[]], expected: 0 },
      { args: [[[1, 100], [11, 22], [1, 11], [2, 12]]], expected: 2, note: 'sắp theo điểm đầu rồi giữ khoảng đầu tiên là sai' },
      { args: [Array.from({ length: 100000 }, (_, i) => [i, i + 2])], expected: 50000, note: 'khoảng i chồng với i±1: giữ 1 trong 2, xóa 50000' },
    ],
    gen: (n, r) => [randIntervals(n > 1000 ? n : Math.min(n, 12), n > 1000 ? 1e9 : 15, n > 1000 ? 1e4 : 6, r)],
    stress: { maxN: 12 },
    perf: { n: 1e5, limitMs: 500 },
  },
  '04': {
    sig: 'int[][] insertInterval(int[][] intervals, int[] newInterval)',
    title: 'Chèn khoảng và gộp',
    ref: S.insertInterval,
    brute: (iv: number[][], [ns, ne]: number[]) => {
      // phủ các ô đơn vị [x, x+1) rồi đọc ra các đoạn liên tiếp — chạm đầu mút cho ra cùng một đoạn
      const cover = new Array<boolean>(60).fill(false);
      for (const [s, e] of [...iv, [ns, ne]]) for (let x = s; x < e; x++) cover[x] = true;
      const out: number[][] = [];
      for (let x = 0; x < 60; x++) if (cover[x]) (out.length && cover[x - 1] ? (out[out.length - 1][1] = x + 1) : out.push([x, x + 1]));
      return out;
    },
    cases: [
      { args: [[[1, 3], [6, 9]], [2, 5]], expected: [[1, 5], [6, 9]] },
      { args: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]], expected: [[1, 2], [3, 10], [12, 16]] },
      { args: [[], [5, 7]], expected: [[5, 7]] },
      { args: [[[1, 5]], [6, 8]], expected: [[1, 5], [6, 8]] },
      { args: [[[1, 5]], [0, 0]], expected: [[0, 0], [1, 5]], note: 'khoảng suy biến [0,0] đứng riêng' },
      { args: [[[1, 5]], [5, 6]], expected: [[1, 6]], note: 'chạm đầu mút thì gộp' },
    ],
    gen: (n, r) => {
      // mỗi khoảng non-touching, tăng dần: [s, e] với s < e và e < s kế
      const out: number[][] = [];
      let cur = r.int(0, 3);
      for (let i = 0; i < Math.min(n, 12); i++) {
        const e = cur + r.int(1, 3);
        out.push([cur, e]);
        cur = e + r.int(1, 3);
      }
      const s = r.int(0, 40);
      return [out, [s, s + r.int(1, 8)]];
    },
    stress: { maxN: 12 },
    perf: false, // O(n) và O(n log n) (sắp lại) chênh nhau một hệ số nhỏ — không phân biệt được bằng Perf
  },
  '05': {
    sig: 'int findMinArrowShots(int[][] points)',
    title: 'Số mũi tên ít nhất bắn hết bóng',
    ref: S.findMinArrowShots,
    brute: (pts: number[][]) => {
      // mũi tên chỉ cần đặt tại điểm cuối của một quả bóng; thử mọi tập vị trí theo kích thước tăng dần
      const ends = [...new Set(pts.map((p) => p[1]))];
      for (let k = 0; k <= ends.length; k++) {
        for (let mask = 0; mask < 1 << ends.length; mask++) {
          if (popcount(mask) !== k) continue;
          const arrows = ends.filter((_, i) => (mask >> i) & 1);
          if (pts.every(([s, e]) => arrows.some((x) => s <= x && x <= e))) return k;
        }
      }
      return ends.length;
    },
    cases: [
      { args: [[[10, 16], [2, 8], [1, 6], [7, 12]]], expected: 2 },
      { args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expected: 4 },
      { args: [[[1, 2], [2, 3], [3, 4], [4, 5]]], expected: 2, note: 'chạm đầu mút vẫn chung mũi tên' },
      { args: [[[-2147483648, 2147483647]]], expected: 1 },
      { args: [[[-2147483648, 2147483647], [2147483646, 2147483647]]], expected: 1, note: 'tràn int nếu so sánh bằng phép trừ' },
      { args: [[[-2147483646, -2147483645], [2147483646, 2147483647]]], expected: 2 },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const span = big ? 2_000_000_000 : 12;
      const pts = Array.from({ length: Math.max(1, big ? n : Math.min(n, 10)) }, () => {
        const s = r.int(-span, span - 1);
        return [s, Math.min(span, s + r.int(0, big ? 50_000 : 5))];
      });
      return [pts];
    },
    stress: { minN: 1, maxN: 10 },
    perf: { n: 1e5, limitMs: 500 },
  },
  '06': {
    sig: 'int canCompleteCircuit(int[] gas, int[] cost)',
    title: 'Trạm xăng vòng tròn',
    ref: S.canCompleteCircuit,
    brute: (gas: number[], cost: number[]) => {
      const n = gas.length;
      for (let s = 0; s < n; s++) {
        let tank = 0;
        let ok = true;
        for (let k = 0; k < n && ok; k++) {
          const i = (s + k) % n;
          tank += gas[i] - cost[i];
          if (tank < 0) ok = false;
        }
        if (ok) return s;
      }
      return -1;
    },
    cases: [
      { args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3 },
      { args: [[2, 3, 4], [3, 4, 3]], expected: -1 },
      { args: [[5], [4]], expected: 0 },
      { args: [[2, 2], [1, 1]], expected: 0, note: 'nhiều điểm xuất phát hợp lệ → chỉ số nhỏ nhất' },
      { args: [[...new Array(99999).fill(0), 10], [...new Array(99999).fill(1), 0]], expected: -1, note: 'tổng gas 10 < tổng cost 99 999' },
      { args: [[0, ...new Array(99999).fill(1)], [1, ...new Array(99999).fill(0)]], expected: 1, note: 'trạm 0 thiếu 1, các trạm sau dư' },
      { args: [new Array(100000).fill(100000), new Array(100000).fill(0)], expected: 0, note: 'tổng gas 10¹⁰ > 2³¹ — Java phải dùng long' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > 1000) {
        // xấu nhất cho mô phỏng từ mọi điểm xuất phát: mọi điểm trước len−1 đều hỏng RẤT MUỘN (ở trạm len−2), đáp án = len−1
        const gas = new Array(len).fill(1);
        const cost = new Array(len).fill(0);
        gas[len - 2] = 0;
        cost[len - 2] = len - 1;
        return [gas, cost];
      }
      return [r.array(len, 0, 6), r.array(len, 0, 6)];
    },
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '07': {
    sig: 'List<Integer> partitionLabels(String s)',
    title: 'Chia chuỗi theo chữ cái',
    ref: S.partitionLabels,
    brute: (s: string) => {
      // vị trí cắt i (giữa i−1 và i) hợp lệ ⇔ hai nửa không chung chữ cái; cắt ở mọi vị trí hợp lệ
      const cuts = [0];
      for (let i = 1; i < s.length; i++) {
        const left = new Set(s.slice(0, i));
        if (![...s.slice(i)].some((ch) => left.has(ch))) cuts.push(i);
      }
      cuts.push(s.length);
      return cuts.slice(1).map((c, i) => c - cuts[i]);
    },
    cases: [
      { args: ['ababcbacadefegdehijhklij'], expected: [9, 7, 8] },
      { args: ['eccbbbbdec'], expected: [10] },
      { args: ['a'], expected: [1] },
      { args: ['abcdef'], expected: [1, 1, 1, 1, 1, 1] },
      { args: ['aaaabbbb'], expected: [4, 4] },
      { args: ['a'.repeat(50000) + 'b'.repeat(50000)], expected: [50000, 50000] },
    ],
    gen: (n, r) => [r.string(Math.max(1, n), n > 1000 ? 'abcdefghijklmnopqrstuvwxyz' : 'abcde'.slice(0, r.int(1, 5)))],
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'long candy(int[] ratings)',
    title: 'Chia kẹo',
    ref: S.candy,
    brute: (ratings: number[]) => {
      // bắt đầu mỗi em 1 viên, tăng dần đến khi mọi ràng buộc thỏa (nghiệm nhỏ nhất)
      const c = new Array<number>(ratings.length).fill(1);
      for (let changed = true; changed; ) {
        changed = false;
        for (let i = 0; i < c.length; i++) {
          if (i > 0 && ratings[i] > ratings[i - 1] && c[i] <= c[i - 1]) ((c[i] = c[i - 1] + 1), (changed = true));
          if (i + 1 < c.length && ratings[i] > ratings[i + 1] && c[i] <= c[i + 1]) ((c[i] = c[i + 1] + 1), (changed = true));
        }
      }
      return c.reduce((a, b) => a + b, 0);
    },
    cases: [
      { args: [[1, 0, 2]], expected: 5 },
      { args: [[1, 2, 2]], expected: 4 },
      { args: [[5]], expected: 1 },
      { args: [[1, 3, 2, 2, 1]], expected: 7 },
      { args: [[1, 2, 87, 87, 87, 2, 1]], expected: 13 },
      { args: [Array.from({ length: 100000 }, (_, i) => i)], expected: 5000050000, note: 'tăng dần 10⁵ phần tử: tổng 5·10⁹ > 2³¹' },
      { args: [Array.from({ length: 100000 }, (_, i) => 99999 - i)], expected: 5000050000 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), 0, n > 1000 ? 1e9 : 6)],
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '09': {
    sig: 'int maxEvents(int[][] events)',
    title: 'Tham dự nhiều sự kiện nhất',
    ref: S.maxEvents,
    brute: (events: number[][]) => {
      // mỗi sự kiện chọn một ngày trong [start, end] hoặc bỏ; mỗi ngày tối đa 1 sự kiện (DP trên tập ngày đã dùng)
      const memo = new Map<string, number>();
      const go = (i: number, used: number): number => {
        if (i === events.length) return 0;
        const key = `${i}:${used}`;
        const got = memo.get(key);
        if (got !== undefined) return got;
        let best = go(i + 1, used);
        for (let d = events[i][0]; d <= events[i][1]; d++) if (!((used >> d) & 1)) best = Math.max(best, 1 + go(i + 1, used | (1 << d)));
        memo.set(key, best);
        return best;
      };
      return go(0, 0);
    },
    cases: [
      { args: [[[1, 2], [2, 3], [3, 4]]], expected: 3 },
      { args: [[[1, 2], [2, 3], [3, 4], [1, 2]]], expected: 4 },
      { args: [[[1, 1], [1, 1], [1, 1]]], expected: 1 },
      { args: [[[1, 100000], [1, 100000], [1, 100000]]], expected: 3 },
      { args: [[[1, 1000000000], [1, 1000000000]]], expected: 2, note: 'ngày tới 10⁹ — không lặp từng ngày' },
      { args: [Array.from({ length: 100000 }, () => [1, 100000])], expected: 100000 },
    ],
    gen: (n, r) => {
      if (n > 1000) return [Array.from({ length: n }, () => { const s = r.int(1, n); return [s, s + r.int(0, 20)]; })];
      return [Array.from({ length: Math.min(n, 8) }, () => { const s = r.int(1, 8); return [s, Math.min(10, s + r.int(0, 4))]; })];
    },
    stress: { maxN: 8 },
    perf: { n: 1e5, limitMs: 800 },
  },
  '10': {
    sig: 'int scheduleCourse(int[][] courses)',
    title: 'Học nhiều khóa nhất trước hạn chót',
    ref: S.scheduleCourse,
    brute: (courses: number[][]) => {
      // dp[mask] = thời điểm xong sớm nhất khi học đúng tập `mask` theo MỘT thứ tự nào đó (vét cạn mọi thứ tự)
      const n = courses.length;
      const dp = new Array<number>(1 << n).fill(Infinity);
      dp[0] = 0;
      let best = 0;
      for (let mask = 0; mask < 1 << n; mask++) {
        if (dp[mask] === Infinity) continue;
        best = Math.max(best, popcount(mask));
        for (let j = 0; j < n; j++) {
          if ((mask >> j) & 1) continue;
          const t = dp[mask] + courses[j][0];
          if (t <= courses[j][1] && t < dp[mask | (1 << j)]) dp[mask | (1 << j)] = t;
        }
      }
      return best;
    },
    cases: [
      { args: [[[100, 200], [200, 1300], [1000, 1250], [2000, 3200]]], expected: 3 },
      { args: [[[1, 2]]], expected: 1 },
      { args: [[[3, 2], [4, 3]]], expected: 0 },
      { args: [[[5, 5], [4, 6], [2, 6]]], expected: 2 },
      { args: [Array.from({ length: 100000 }, () => [1, 100000])], expected: 100000 },
      { args: [Array.from({ length: 100000 }, () => [2, 100000])], expected: 50000 },
    ],
    gen: (n, r) => {
      if (n > 1000) return [Array.from({ length: n }, () => [r.int(1, 1000), r.int(1, 2e8)])];
      return [Array.from({ length: Math.min(n, 9) }, () => [r.int(1, 6), r.int(1, 20)])];
    },
    stress: { maxN: 9 },
    perf: { n: 1e5, limitMs: 600 },
  },
};
