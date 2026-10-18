import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const MOD = 1_000_000_007n;
const BIG = 1000; // n lớn hơn ngưỡng này → gen sinh dạng "xấu nhất" cho bản ngây thơ (dùng cho perf)

/** Sinh dãy thao tác cho bài class. */
const opsGen = (ctor: string, n: number, step: (i: number) => [string, any[]]) => {
  const ops = [ctor];
  const args: any[][] = [[]];
  for (let i = 0; i < n; i++) {
    const [op, a] = step(i);
    ops.push(op);
    args.push(a);
  }
  return [ops, args];
};

const digits = (n: number, r: Rng) => {
  let s = n === 1 ? String(r.int(0, 9)) : String(r.int(1, 9));
  for (let i = 1; i < n; i++) s += r.int(0, 9);
  return s;
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int[] nextGreaterElements(int[] nums)',
    title: 'Phần tử lớn hơn kế tiếp (mảng vòng)',
    ref: S.nextGreaterElements,
    brute: (nums: number[]) => {
      const n = nums.length;
      return nums.map((v, i) => {
        for (let d = 1; d < n; d++) if (nums[(i + d) % n] > v) return nums[(i + d) % n];
        return -1;
      });
    },
    cases: [
      { args: [[1, 2, 1]], expected: [2, -1, 2] },
      { args: [[1, 2, 3, 4, 3]], expected: [2, 3, 4, -1, 4] },
      { args: [[5]], expected: [-1] },
      { args: [[3, 3, 3]], expected: [-1, -1, -1], note: 'bằng nhau không phải lớn hơn' },
      { args: [[-1000000000, 1000000000]], expected: [1000000000, -1] },
      {
        args: [Array.from({ length: 100000 }, (_, i) => 100000 - i)],
        expected: [-1, ...new Array(99999).fill(100000)],
        note: 'giảm dần n = 10^5: bản O(n²) trượt',
      },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > BIG) return [Array.from({ length: len }, (_, i) => 1e9 - 3 * i - r.int(0, 2))]; // gần giảm dần
      return [r.array(len, -4, 4)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'int[] dailyTemperatures(int[] temperatures)',
    title: 'Daily temperatures',
    ref: S.dailyTemperatures,
    brute: (t: number[]) => t.map((v, i) => {
      for (let j = i + 1; j < t.length; j++) if (t[j] > v) return j - i;
      return 0;
    }),
    cases: [
      { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { args: [[30, 60, 90]], expected: [1, 1, 0] },
      { args: [[50]], expected: [0] },
      { args: [[70, 70, 70]], expected: [0, 0, 0] },
      {
        args: [Array.from({ length: 100000 }, (_, i) => (i % 2 === 0 ? 60 : 70))],
        expected: Array.from({ length: 100000 }, (_, i) => (i % 2 === 0 ? 1 : 0)),
        note: 'n = 10^5',
      },
      {
        args: [Array.from({ length: 100000 }, (_, i) => (i === 99999 ? 100 : 99))],
        expected: Array.from({ length: 100000 }, (_, i) => (i === 99999 ? 0 : 99999 - i)),
        note: 'quét tới cuối cho mỗi ngày: bản O(n²) trượt',
      },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > BIG) return [Array.from({ length: len }, (_, i) => (i === len - 1 ? 100 : 99 - r.int(0, 1)))];
      return [r.array(len, 30, 100)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'int largestRectangleArea(int[] heights)',
    title: 'Hình chữ nhật lớn nhất trong histogram',
    ref: S.largestRectangleArea,
    brute: (h: number[]) => {
      let best = 0;
      for (let i = 0; i < h.length; i++) {
        let mn = Infinity;
        for (let j = i; j < h.length; j++) {
          mn = Math.min(mn, h[j]);
          best = Math.max(best, mn * (j - i + 1));
        }
      }
      return best;
    },
    cases: [
      { args: [[2, 1, 5, 6, 2, 3]], expected: 10 },
      { args: [[2, 4]], expected: 4 },
      { args: [[0]], expected: 0 },
      { args: [[5]], expected: 5 },
      { args: [[3, 3, 3, 3]], expected: 12 },
      { args: [[1, 2, 3, 4, 5]], expected: 9 },
      { args: [[0, 0, 0]], expected: 0 },
      { args: [new Array(100000).fill(10000)], expected: 1000000000, note: 'n = 10^5, diện tích 10^9 sát giới hạn int' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > BIG) return [Array.from({ length: len }, () => r.int(9990, 10000))]; // cao đều → mở rộng hai phía rất xa
      return [r.array(len, 0, 8)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'int trap(int[] height)',
    title: 'Trapping rain water',
    ref: S.trap,
    brute: (h: number[]) => {
      let w = 0;
      for (let i = 0; i < h.length; i++) {
        let l = 0;
        let rr = 0;
        for (let j = 0; j <= i; j++) l = Math.max(l, h[j]);
        for (let j = i; j < h.length; j++) rr = Math.max(rr, h[j]);
        w += Math.min(l, rr) - h[i];
      }
      return w;
    },
    cases: [
      { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
      { args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { args: [[]], expected: 0 },
      { args: [[3]], expected: 0 },
      { args: [[1, 2, 3, 4]], expected: 0, note: 'dốc lên: không giữ được nước' },
      { args: [[3, 0, 3]], expected: 3 },
      { args: [[5, 5, 5]], expected: 0 },
      { args: [[10000, ...new Array(99998).fill(0), 10000]], expected: 999980000, note: 'n = 10^5' },
    ],
    gen: (n, r) => {
      if (n > BIG) return [Array.from({ length: n }, (_, i) => (i % 1000 === 0 ? 10000 : r.int(0, 100)))];
      return [r.array(n, 0, 6)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'int[] maxSlidingWindow(int[] nums, int k)',
    title: 'Sliding window maximum',
    ref: S.maxSlidingWindow,
    brute: (nums: number[], k: number) => {
      const out: number[] = [];
      for (let i = 0; i + k <= nums.length; i++) out.push(Math.max(...nums.slice(i, i + k)));
      return out;
    },
    cases: [
      { args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
      { args: [[1], 1], expected: [1] },
      { args: [[1, -1], 1], expected: [1, -1] },
      { args: [[9, 11], 2], expected: [11] },
      { args: [[4, 3, 2, 1], 4], expected: [4] },
      { args: [[2, 2, 2, 2], 2], expected: [2, 2, 2], note: 'giá trị bằng nhau' },
      {
        args: [Array.from({ length: 100000 }, (_, i) => i), 5000],
        expected: Array.from({ length: 95001 }, (_, i) => i + 4999),
        note: 'tăng dần, n = 10^5, k = 5000',
      },
      {
        args: [Array.from({ length: 100000 }, (_, i) => 100000 - i), 5000],
        expected: Array.from({ length: 95001 }, (_, i) => 100000 - i),
        note: 'giảm dần',
      },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > BIG) return [r.array(len, -10000, 10000), Math.min(len, 5000)];
      return [r.array(len, -6, 6), r.int(1, len)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 }, // bản duyệt từng cửa sổ O(n·k) với k = 5000 ≈ 5·10^8 phép → vượt xa
  },
  '06': {
    sig: 'int sumSubarrayMins(int[] arr)',
    title: 'Tổng min của mọi mảng con',
    ref: S.sumSubarrayMins,
    brute: (arr: number[]) => {
      let total = 0n;
      for (let i = 0; i < arr.length; i++) {
        let mn = Infinity;
        for (let j = i; j < arr.length; j++) {
          mn = Math.min(mn, arr[j]);
          total += BigInt(mn);
        }
      }
      return Number(total % MOD);
    },
    cases: [
      { args: [[3, 1, 2, 4]], expected: 17 },
      { args: [[11, 81, 94, 43, 3]], expected: 444 },
      { args: [[1]], expected: 1 },
      { args: [[2, 2, 2]], expected: 2 * 6, note: 'giá trị bằng nhau: không đếm trùng' },
      { args: [[5, 4, 3, 2, 1]], expected: 1 * 5 + 2 * 4 + 3 * 3 + 4 * 2 + 5 * 1 },
      {
        args: [new Array(100000).fill(1)],
        expected: Number((100000n * 100001n / 2n) % MOD),
        note: 'n = 10^5, đếm vượt int',
      },
      {
        args: [new Array(100000).fill(30000)],
        expected: Number(((100000n * 100001n / 2n) * 30000n) % MOD),
        note: 'tích vượt 2^53 nếu không mod từng bước',
      },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > BIG) return [Array.from({ length: len }, () => r.int(1, 30000))];
      return [r.array(len, 1, 6)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '07': {
    sig: 'class StockSpanner {\n  StockSpanner()\n  int next(int price)\n}',
    title: 'Stock spanner',
    ref: S.StockSpanner,
    brute: class {
      p: number[] = [];
      next(price: number) {
        this.p.push(price);
        let c = 0;
        for (let i = this.p.length - 1; i >= 0 && this.p[i] <= price; i--) c++;
        return c;
      }
    },
    cases: [
      {
        args: [['StockSpanner', 'next', 'next', 'next', 'next', 'next', 'next', 'next'], [[], [100], [80], [60], [70], [60], [75], [85]]],
        expected: [null, 1, 1, 1, 2, 1, 4, 6],
      },
      { args: [['StockSpanner', 'next', 'next', 'next'], [[], [5], [5], [5]]], expected: [null, 1, 2, 3], note: 'giá bằng nhau vẫn gộp' },
      {
        args: [
          ['StockSpanner', ...new Array(100000).fill('next')],
          [[], ...Array.from({ length: 100000 }, (_, i) => [i + 1])],
        ],
        expected: [null, ...Array.from({ length: 100000 }, (_, i) => i + 1)],
        note: 'giá tăng dần n = 10^5: bản quét lùi O(n²) trượt',
      },
    ],
    gen: (n, r) =>
      opsGen('StockSpanner', Math.max(1, n), (i) => ['next', [n > BIG ? (r.bool(0.001) ? r.int(1, 100) : i + 1) : r.int(1, 6)]]),
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'String removeKdigits(String num, int k)',
    title: 'Xóa k chữ số để số nhỏ nhất',
    ref: S.removeKdigits,
    brute: (num: string, k: number) => {
      const n = num.length;
      const m = n - k;
      if (m === 0) return '0';
      let best: bigint | null = null;
      for (let mask = 0; mask < 1 << n; mask++) {
        let bits = 0;
        let s = '';
        for (let i = 0; i < n; i++) if (mask >> i & 1) { bits++; s += num[i]; }
        if (bits !== m) continue;
        const v = BigInt(s);
        if (best === null || v < best) best = v;
      }
      return String(best);
    },
    cases: [
      { args: ['1432219', 3], expected: '1219' },
      { args: ['10200', 1], expected: '200' },
      { args: ['10', 2], expected: '0' },
      { args: ['9', 1], expected: '0' },
      { args: ['112', 1], expected: '11' },
      { args: ['12345', 2], expected: '123', note: 'tăng dần: xóa từ cuối' },
      { args: ['100', 1], expected: '0' },
      { args: ['5337', 2], expected: '33' },
      { args: ['0', 0], expected: '0' },
      { args: ['9'.repeat(100000), 50000], expected: '9'.repeat(50000), note: 'n = 10^5' },
      { args: ['1' + '0'.repeat(99999), 1], expected: '0', note: 'toàn số 0 đứng đầu sau khi xóa' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > BIG) return ['9'.repeat(len - 1) + '1', len >> 1];
      return [digits(len, r), r.int(0, len)];
    },
    stress: { minN: 1, maxN: 14 },
    perf: { n: 1e5, limitMs: 100 },
  },
};
