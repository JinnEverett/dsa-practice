import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const asc = (a: number[]) => a.slice().sort((x, y) => x - y);

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int minEatingSpeed(int[] piles, int h)',
    title: 'Koko ăn chuối',
    ref: S.minEatingSpeed,
    brute: (piles: number[], h: number): number => {
      for (let k = 1; ; k++) if (sum(piles.map((p) => Math.ceil(p / k))) <= h) return k;
    },
    cases: [
      { args: [[3, 6, 7, 11], 8], expected: 4 },
      { args: [[30, 11, 23, 4, 20], 5], expected: 30 },
      { args: [[30, 11, 23, 4, 20], 6], expected: 23 },
      { args: [[1000000000], 2], expected: 500000000 },
      { args: [new Array(100000).fill(1000000000), 100000], expected: 1000000000, note: 'h = n: ăn hết mỗi giờ một đống' },
    ],
    gen: (n, r) => {
      if (n >= 1e5) return [r.array(n, 1, 1_000_000_000), 2 * n];
      const len = r.int(1, 6);
      return [r.array(len, 1, 20), r.int(len, len + 12)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 250 },
  },
  '02': {
    sig: 'int shipWithinDays(int[] weights, int days)',
    title: 'Tàu chở hàng trong D ngày',
    ref: S.shipWithinDays,
    brute: (w: number[], days: number): number => {
      for (let cap = Math.max(...w); ; cap++) {
        let need = 1;
        let cur = 0;
        for (const x of w) {
          if (cur + x > cap) (need++, (cur = 0));
          cur += x;
        }
        if (need <= days) return cap;
      }
    },
    cases: [
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
      { args: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
      { args: [[1, 2, 3, 1, 1], 4], expected: 3 },
      { args: [[10], 1], expected: 10 },
    ],
    gen: (n, r) => {
      if (n >= 1e5) return [r.array(n, 1, 10000), 100];
      const len = r.int(1, 8);
      return [r.array(len, 1, 15), r.int(1, len)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 150 },
  },
  '03': {
    sig: 'long splitArray(int[] nums, int k)',
    title: 'Chia mảng k phần, cực tiểu hóa tổng lớn nhất',
    ref: S.splitArray,
    brute: (nums: number[], k: number): number => {
      // DP O(k·n²): f[j][i] = tổng lớn nhất nhỏ nhất khi chia i phần tử đầu thành j phần
      const n = nums.length;
      const pre = [0];
      for (const x of nums) pre.push(pre[pre.length - 1] + x);
      const f = Array.from({ length: k + 1 }, () => new Array<number>(n + 1).fill(Infinity));
      f[0][0] = 0;
      for (let j = 1; j <= k; j++)
        for (let i = j; i <= n; i++) for (let t = j - 1; t < i; t++) f[j][i] = Math.min(f[j][i], Math.max(f[j - 1][t], pre[i] - pre[t]));
      return f[k][n];
    },
    cases: [
      { args: [[7, 2, 5, 10, 8], 2], expected: 18 },
      { args: [[1, 2, 3, 4, 5], 2], expected: 9 },
      { args: [[1, 4, 4], 3], expected: 4 },
      { args: [new Array(100000).fill(1_000_000_000), 1], expected: 100000 * 1_000_000_000, note: 'tổng 10¹⁴: Java cần long' },
    ],
    gen: (n, r) => {
      if (n >= 1e5) return [r.array(n, 1, 1_000_000_000), 1000];
      const len = r.int(1, 8);
      return [r.array(len, 1, 15), r.int(1, len)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 250 },
  },
  '04': {
    sig: 'int minDays(int[] bloomDay, int m, int k)',
    title: 'Ngày sớm nhất làm đủ bó hoa',
    ref: S.minDays,
    brute: (b: number[], m: number, k: number): number => {
      for (const d of [...new Set(b)].sort((x, y) => x - y)) {
        let bouquets = 0;
        let run = 0;
        for (const x of b) {
          if (x <= d) {
            if (++run === k) (bouquets++, (run = 0));
          } else run = 0;
        }
        if (bouquets >= m) return d;
      }
      return -1;
    },
    cases: [
      { args: [[1, 10, 3, 10, 2], 3, 1], expected: 3 },
      { args: [[1, 10, 3, 10, 2], 3, 2], expected: -1 },
      { args: [[7, 7, 7, 7, 12, 7, 7], 2, 3], expected: 12 },
      { args: [[1000000000, 1000000000], 1, 1], expected: 1000000000 },
      { args: [new Array(100000).fill(5), 1000000, 100000], expected: -1, note: 'm·k = 10¹¹ tràn int' },
    ],
    gen: (n, r) => {
      if (n >= 1e5) return [r.array(n, 1, 1_000_000_000), 1000, 50];
      const len = r.int(1, 8);
      return [r.array(len, 1, 10), r.int(1, 4), r.int(1, 3)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 200 },
  },
  '05': {
    sig: 'int smallestDivisor(int[] nums, int threshold)',
    title: 'Ước số nhỏ nhất',
    ref: S.smallestDivisor,
    brute: (nums: number[], t: number): number => {
      for (let d = 1; ; d++) if (sum(nums.map((x) => Math.ceil(x / d))) <= t) return d;
    },
    cases: [
      { args: [[1, 2, 5, 9], 6], expected: 5 },
      { args: [[44, 22, 33, 11, 1], 5], expected: 44 },
      { args: [[21212, 10101, 12121], 1000000], expected: 1 },
      { args: [[1000000], 1], expected: 1000000 },
    ],
    gen: (n, r) => {
      if (n >= 1e5) return [r.array(n, 1, 1_000_000), 2 * n];
      const len = r.int(1, 6);
      return [r.array(len, 1, 20), r.int(len, len + 20)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 150 },
  },
  '06': {
    sig: 'int findKthNumber(int m, int n, int k)',
    title: 'Phần tử nhỏ thứ k trong bảng cửu chương',
    ref: S.findKthNumber,
    brute: (m: number, n: number, k: number): number => {
      const all: number[] = [];
      for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) all.push(i * j);
      return asc(all)[k - 1];
    },
    cases: [
      { args: [3, 3, 5], expected: 3 },
      { args: [2, 3, 6], expected: 6 },
      { args: [1, 1, 1], expected: 1 },
      { args: [30000, 30000, 900_000_000], expected: 900_000_000, note: 'bảng 9·10⁸ ô: không dựng bảng' },
      { args: [30000, 30000, 1], expected: 1 },
    ],
    gen: (n, r) => {
      if (n >= 30000) return [30000, 30000, 450_000_000];
      const m = r.int(1, 6);
      const nn = r.int(1, 6);
      return [m, nn, r.int(1, m * nn)];
    },
    stress: { minN: 1, maxN: 25 },
    perf: { n: 30000, limitMs: 100 },
  },
  '07': {
    sig: 'int maxDistance(int[] position, int m)',
    title: '🔴 Đặt router xa nhau nhất',
    ref: S.maxDistance,
    brute: (pos: number[], m: number): number => {
      const p = asc(pos);
      let best = 0;
      const rec = (start: number, chosen: number[]) => {
        if (chosen.length === m) {
          let d = Infinity;
          for (let i = 1; i < m; i++) d = Math.min(d, chosen[i] - chosen[i - 1]);
          best = Math.max(best, d);
          return;
        }
        for (let i = start; i < p.length; i++) rec(i + 1, [...chosen, p[i]]);
      };
      rec(0, []);
      return best;
    },
    cases: [
      { args: [[1, 2, 3, 4, 7], 3], expected: 3 },
      { args: [[5, 4, 3, 2, 1, 1000000000], 2], expected: 999999999 },
      { args: [[1, 2], 2], expected: 1 },
      { args: [[10, 1, 5], 3], expected: 4, note: 'm = n: đặt hết, khoảng cách nhỏ nhất giữa các cặp kề' },
    ],
    gen: (n, r) => {
      if (n >= 1e5) return [r.distinct(n, 1, 1_000_000_000), 1000];
      const len = r.int(2, 8);
      return [r.distinct(len, 1, 40), r.int(2, len)];
    },
    stress: { minN: 2 },
    perf: { n: 1e5, limitMs: 200 },
  },
  '08': {
    sig: 'double minmaxGasDist(int[] stations, int k)',
    title: '🔴 Thêm trạm xăng: khoảng cách lớn nhất nhỏ nhất',
    ref: S.minmaxGasDist,
    brute: (stations: number[], k: number): number => {
      // vét cạn cách chia k trạm vào các khoảng: khoảng g nhận c trạm ⇒ khoảng con g/(c+1)
      const gaps = stations.slice(1).map((s, i) => s - stations[i]);
      let best = Infinity;
      const rec = (i: number, left: number, cur: number) => {
        if (i === gaps.length) {
          best = Math.min(best, cur);
          return;
        }
        for (let c = 0; c <= left; c++) rec(i + 1, left - c, Math.max(cur, gaps[i] / (c + 1)));
      };
      rec(0, k, 0);
      return best;
    },
    compare: (got, expected) => typeof got === 'number' && Math.abs(got - expected) <= 1e-6 || `cần ${expected} (sai số ≤ 1e-6)`,
    cases: [
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 9], expected: 0.5 },
      { args: [[23, 24, 36, 39, 46, 56, 57, 65, 84, 98], 1], expected: 14.0 },
      { args: [[0, 10], 1], expected: 5.0 },
      { args: [[0, 10, 11], 0], expected: 10.0, note: 'k = 0: giữ nguyên khoảng lớn nhất' },
      { args: [[0, 100000000], 1_000_000_000], expected: 100000000 / 1_000_000_001, note: 'k = 10⁹: mô phỏng từng trạm không khả thi' },
    ],
    gen: (n, r) => {
      if (n >= 2000) return [r.distinct(n, 0, 100_000_000).sort((a, b) => a - b), 1_000_000_000];
      const len = r.int(2, 5);
      return [r.distinct(len, 0, 30).sort((a, b) => a - b), r.int(0, 5)];
    },
    stress: { minN: 2 },
    perf: { n: 2000, limitMs: 100 },
  },
};
