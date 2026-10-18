import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Khớp mẫu bằng RegExp của JS ('.' và '*' có cùng ngữ nghĩa với đề khi mẫu chỉ gồm chữ thường, '.', '*' hợp lệ). */
const bruteMatch = (s: string, p: string) => new RegExp('^(?:' + p + ')$').test(s);

function bruteBuses(routes: number[][], source: number, target: number): number {
  if (source === target) return 0;
  const R = routes.length;
  const sets = routes.map((r) => new Set(r));
  const INF: number = 1e9;
  const d = Array.from({ length: R }, (_, i) => Array.from({ length: R }, (_, j) => (i === j ? 0 : INF)));
  for (let i = 0; i < R; i++) for (let j = 0; j < R; j++) if (i !== j && routes[i].some((x) => sets[j].has(x))) d[i][j] = 1;
  for (let k = 0; k < R; k++) for (let i = 0; i < R; i++) for (let j = 0; j < R; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
  let best = INF;
  for (let i = 0; i < R; i++) if (sets[i].has(source)) for (let j = 0; j < R; j++) if (sets[j].has(target)) best = Math.min(best, d[i][j] + 1);
  return best >= INF ? -1 : best;
}

function bruteMeetings(n: number, meetings: number[][]): number {
  const ms = meetings.map((m) => [m[0], m[1]]).sort((a, b) => a[0] - b[0]);
  const freeAt = new Array<number>(n).fill(0);
  const cnt = new Array<number>(n).fill(0);
  for (const [s, e] of ms) {
    let room = -1;
    for (let i = 0; i < n; i++) if (freeAt[i] <= s) { room = i; break; }
    if (room >= 0) freeAt[room] = e;
    else {
      room = 0;
      for (let i = 1; i < n; i++) if (freeAt[i] < freeAt[room]) room = i;
      freeAt[room] += e - s;
    }
    cnt[room]++;
  }
  let best = 0;
  for (let i = 1; i < n; i++) if (cnt[i] > cnt[best]) best = i;
  return best;
}

/** Mẫu hợp lệ ngẫu nhiên: mỗi token là chữ hoặc '.', có thể kèm '*'. */
const randPattern = (len: number, r: Rng) => Array.from({ length: len }, () => r.pick(['a', 'b', '.']) + (r.bool(0.4) ? '*' : '')).join('');

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'double findMedianSortedArrays(int[] nums1, int[] nums2)',
    title: 'Trung vị của hai mảng đã sắp',
    ref: S.findMedianSortedArrays,
    brute: (a: number[], b: number[]) => {
      const m = [...a, ...b].sort((x, y) => x - y);
      return m.length % 2 ? m[(m.length - 1) / 2] : (m[m.length / 2 - 1] + m[m.length / 2]) / 2;
    },
    compare: 'float',
    cases: [
      { args: [[1, 3], [2]], expected: 2 },
      { args: [[1, 2], [3, 4]], expected: 2.5 },
      { args: [[], [1]], expected: 1 },
      { args: [[0, 0], [0, 0]], expected: 0 },
      { args: [[2147483647], [2147483647]], expected: 2147483647, note: 'Java: (a + b) / 2 tràn int' },
      { args: [[], [2, 3]], expected: 2.5 },
    ],
    gen: (n, r) => {
      const sorted = (len: number) => r.sorted(len, -50, 50);
      if (n > 200) return [r.sorted(1_000_000, -1_000_000_000, 1_000_000_000), r.sorted(1_000_000, -1_000_000_000, 1_000_000_000)];
      const a = sorted(r.int(0, n));
      const b = sorted(Math.max(a.length === 0 ? 1 : 0, r.int(0, n)));
      return [a, b];
    },
    // gộp O(m + n) hay concat + sort trên 2·10⁶ phần tử
    perf: { n: 1e6, limitMs: 3 },
  },
  '02': {
    sig: 'boolean isMatch(String s, String p)',
    title: 'Khớp mẫu với "." và "*"',
    ref: S.isMatch,
    brute: bruteMatch,
    cases: [
      { args: ['aa', 'a'], expected: false },
      { args: ['aa', 'a*'], expected: true },
      { args: ['ab', '.*'], expected: true },
      { args: ['aab', 'c*a*b'], expected: true },
      { args: ['mississippi', 'mis*is*p*.'], expected: false },
      { args: ['', 'a*b*'], expected: true, note: '"x*" khớp 0 lần' },
      { args: ['', ''], expected: true },
      { args: ['a', ''], expected: false },
    ],
    gen: (n, r) => {
      if (n > 200) return ['a'.repeat(1000), 'a*'.repeat(499) + 'b']; // đệ quy không nhớ: hàm mũ
      return [r.string(r.int(0, Math.min(n, 8)), 'ab'), randPattern(r.int(0, Math.min(n, 5)), r)];
    },
    perf: { n: 1e5, limitMs: 80 },
  },
  '03': {
    sig: 'int numBusesToDestination(int[][] routes, int source, int target)',
    title: 'Số tuyến xe buýt ít nhất',
    ref: S.numBusesToDestination,
    brute: bruteBuses,
    cases: [
      { args: [[[1, 2, 7], [3, 6, 7]], 1, 6], expected: 2 },
      { args: [[[7, 12], [4, 5, 15], [6], [15, 19], [9, 12, 13]], 15, 12], expected: -1 },
      { args: [[[1, 2]], 1, 1], expected: 0, note: 'đã ở đích' },
      { args: [[[1, 2, 3]], 1, 3], expected: 1 },
      { args: [[], 1, 2], expected: -1 },
      { args: [[[1, 2], [2, 3], [3, 4]], 1, 4], expected: 3 },
    ],
    gen: (n, r) => {
      if (n > 200) {
        const routes = Array.from({ length: 1000 }, () => r.distinct(100, 0, 99_999));
        return [routes, routes[0][0], routes[999][50]];
      }
      const R = r.int(0, 5);
      const routes = Array.from({ length: R }, () => r.distinct(r.int(1, 4), 0, 9));
      return [routes, r.int(0, 9), r.int(0, 9)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'int mostBooked(int n, int[][] meetings)',
    title: 'Phòng họp được đặt nhiều nhất',
    ref: S.mostBooked,
    brute: bruteMeetings,
    cases: [
      { args: [2, [[0, 10], [1, 5], [2, 7], [3, 4]]], expected: 0 },
      { args: [3, [[1, 20], [2, 10], [3, 5], [4, 9], [6, 8]]], expected: 1 },
      { args: [1, [[5, 6]]], expected: 0 },
      {
        args: [3, Array.from({ length: 15000 }, (_, i) => [i, i + 500000 - ((i * 37) % 7)])],
        expected: 0,
        note: '15000 cuộc ≈ 500000 phút trên 3 phòng: thời điểm kết thúc bị dời vượt 2³¹ — nếu dùng int (Java) sẽ tràn và trả 1',
      },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const M = big ? 100000 : Math.min(n, 12);
      const rooms = big ? 20000 : r.int(1, 4);
      const starts = r.distinct(M, 0, big ? 1_000_000 : Math.max(60, 3 * M));
      return [rooms, starts.map((s) => [s, s + r.int(1, big ? 500000 : 10)])];
    },
    stress: { minN: 1 },
    // 2·10⁴ phòng bão hòa: quét mọi phòng cho mỗi cuộc họp là 10⁵ × 2·10⁴
    perf: { n: 1e5, limitMs: 300 },
  },
};
