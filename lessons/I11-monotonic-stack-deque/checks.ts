import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const M = 1_000_000_007n;

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int[] nextGreaterElements(int[] nums)',
    title: 'Phần tử lớn hơn kế tiếp (mảng vòng)',
    ref: S.nextGreaterElements,
    brute: (nums: number[]) => {
      const n = nums.length;
      return nums.map((v, i) => {
        for (let k = 1; k < n; k++) if (nums[(i + k) % n] > v) return nums[(i + k) % n];
        return -1;
      });
    },
    cases: [
      { args: [[1, 2, 1]], expected: [2, -1, 2] },
      { args: [[1, 2, 3, 4, 3]], expected: [2, 3, 4, -1, 4] },
      { args: [[5]], expected: [-1] },
      { args: [[2, 2, 2]], expected: [-1, -1, -1], note: '"lớn hơn" nghiêm ngặt' },
      { args: [Array.from({ length: 100000 }, (_, i) => 100000 - i)], expected: [-1, ...new Array(99999).fill(100000)], note: 'giảm dần 10⁵: bản O(n²) quá giờ' },
    ],
    gen: (n, r) => (n > 1000 ? [Array.from({ length: n }, (_, i) => n - i)] : [r.array(Math.max(1, n), -5, 5)]),
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'int[] dailyTemperatures(int[] temperatures)',
    title: 'Số ngày chờ ngày ấm hơn',
    ref: S.dailyTemperatures,
    brute: (t: number[]) =>
      t.map((v, i) => {
        for (let j = i + 1; j < t.length; j++) if (t[j] > v) return j - i;
        return 0;
      }),
    cases: [
      { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { args: [[30, 60, 90]], expected: [1, 1, 0] },
      { args: [[50]], expected: [0] },
      { args: [[5, 5, 5]], expected: [0, 0, 0] },
      { args: [Array.from({ length: 100000 }, (_, i) => 100000 - i)], expected: new Array(100000).fill(0), note: 'giảm dần 10⁵' },
    ],
    gen: (n, r) => (n > 1000 ? [Array.from({ length: n }, (_, i) => n - i)] : [r.array(Math.max(1, n), 30, 40)]),
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'long largestRectangleArea(int[] heights)',
    title: 'Hình chữ nhật lớn nhất trong histogram',
    ref: S.largestRectangleArea,
    brute: (h: number[]) => {
      let best = 0;
      for (let i = 0; i < h.length; i++) {
        let m = Infinity;
        for (let j = i; j < h.length; j++) {
          m = Math.min(m, h[j]);
          best = Math.max(best, m * (j - i + 1));
        }
      }
      return best;
    },
    cases: [
      { args: [[2, 1, 5, 6, 2, 3]], expected: 10 },
      { args: [[2, 4]], expected: 4 },
      { args: [[1]], expected: 1 },
      { args: [[0, 0]], expected: 0 },
      { args: [[2, 2, 2, 2]], expected: 8 },
      { args: [new Array(100000).fill(1000000000)], expected: 100000000000000, note: '10⁹ × 10⁵ = 10¹⁴ — Java dùng long' },
      { args: [range(100000).map((i) => i + 1)], expected: 2500050000, note: 'tăng dần: 50 000 × 50 001 > 2³¹' },
    ],
    gen: (n, r) => [n > 1000 ? Array.from({ length: n }, (_, i) => (i % 2 ? 1e9 : 1e9 - i)) : r.array(Math.max(1, n), 0, 6)],
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'long trap(int[] height)',
    title: 'Hứng nước mưa',
    ref: S.trap,
    brute: (h: number[]) => h.reduce((sum, v, i) => sum + Math.max(0, Math.min(Math.max(...h.slice(0, i + 1)), Math.max(...h.slice(i))) - v), 0),
    cases: [
      { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
      { args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { args: [[5]], expected: 0 },
      { args: [[1, 2, 3]], expected: 0 },
      { args: [[3, 0, 3]], expected: 3 },
      { args: [[100000, ...new Array(99998).fill(0), 100000]], expected: 9999800000, note: 'một vũng khổng lồ: 10⁵ × 99 998 > 2³¹' },
    ],
    gen: (n, r) => [n > 1000 ? Array.from({ length: n }, (_, i) => (i % 2 ? 1 : 100000 - (i % 7))) : r.array(Math.max(1, n), 0, 6)],
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'int[] maxSlidingWindow(int[] nums, int k)',
    title: 'Max cửa sổ trượt',
    ref: S.maxSlidingWindow,
    brute: (nums: number[], k: number) => range(nums.length - k + 1).map((i) => Math.max(...nums.slice(i, i + k))),
    cases: [
      { args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
      { args: [[1], 1], expected: [1] },
      { args: [[1, -1], 1], expected: [1, -1] },
      { args: [[9, 11], 2], expected: [11] },
      { args: [[4, 3, 2, 1], 4], expected: [4], note: 'k = n' },
      { args: [Array.from({ length: 100000 }, (_, i) => 100000 - i), 50000], expected: range(50001).map((j) => 100000 - j), note: 'giảm dần, k = n/2' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > 1000) return [Array.from({ length: n }, (_, i) => n - i), n >> 1];
      return [r.array(len, -5, 5), r.int(1, len)];
    },
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '06': {
    sig: 'int sumSubarrayMins(int[] arr)',
    title: 'Tổng min của mọi mảng con',
    ref: S.sumSubarrayMins,
    brute: (arr: number[]) => {
      let sum = 0n;
      for (let i = 0; i < arr.length; i++) {
        let m = arr[i];
        for (let j = i; j < arr.length; j++) {
          m = Math.min(m, arr[j]);
          sum += BigInt(m);
        }
      }
      return Number(sum % M);
    },
    cases: [
      { args: [[3, 1, 2, 4]], expected: 17 },
      { args: [[11, 81, 94, 43, 3]], expected: 444 },
      { args: [[1]], expected: 1 },
      { args: [[2, 2, 2]], expected: 12, note: 'giá trị bằng nhau: mỗi mảng con đếm đúng một lần' },
      {
        args: [new Array(100000).fill(1000000000)],
        expected: Number((1000000000n * ((100000n * 100001n) / 2n)) % M),
        note: 'toàn 10⁹',
      },
      {
        // 10⁹ ở khắp nơi, riêng ô giữa là 10⁹ − 1: ô giữa có left·right = 5·10⁹, nhân với 10⁹ ≈ 5·10¹⁸ > 2⁵³ — nhân thẳng sẽ mất chính xác
        args: [Array.from({ length: 100000 }, (_, i) => (i === 50000 ? 999999999 : 1000000000))],
        expected: Number(((999999999n * (50001n * 50000n) + 1000000000n * ((100000n * 100001n) / 2n - 50001n * 50000n)) % M)),
        note: 'bẫy 2⁵³: arr[i]·left·right ~ 5·10¹⁸',
      },
    ],
    gen: (n, r) => [n > 1000 ? Array.from({ length: n }, (_, i) => 1e9 - ((n >> 1) - Math.abs(i - (n >> 1)))) : r.array(Math.max(1, n), 1, 6)],
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 150 },
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
      { args: [['StockSpanner', 'next', 'next', 'next', 'next', 'next', 'next', 'next'], [[], [100], [80], [60], [70], [60], [75], [85]]], expected: [null, 1, 1, 1, 2, 1, 4, 6] },
      { args: [['StockSpanner', 'next', 'next', 'next'], [[], [5], [5], [5]]], expected: [null, 1, 2, 3], note: 'giá bằng nhau tính vào span' },
      {
        args: [['StockSpanner', ...new Array(100000).fill('next')], [[], ...range(100000).map((i) => [i + 1])]],
        expected: [null, ...range(100000).map((i) => i + 1)],
        note: 'giá tăng dần 10⁵: quét lại từng ngày là O(n²)',
      },
    ],
    gen: (n, r) => {
      const ops = ['StockSpanner'];
      const args: any[][] = [[]];
      for (let i = 0; i < Math.max(1, n); i++) {
        ops.push('next');
        args.push([n > 1000 ? i + r.int(0, 3) : r.int(1, 8)]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'String removeKdigits(String num, int k)',
    title: 'Xóa k chữ số để số nhỏ nhất',
    ref: S.removeKdigits,
    brute: (num: string, k: number) => {
      // thử mọi cách GIỮ LẠI n − k chữ số (đúng thứ tự), lấy giá trị số nhỏ nhất
      const n = num.length;
      let best: bigint | null = null;
      for (let mask = 0; mask < 1 << n; mask++) {
        if (mask.toString(2).replace(/0/g, '').length !== n - k) continue;
        const kept = [...num].filter((_, i) => (mask >> i) & 1).join('');
        const v = kept === '' ? 0n : BigInt(kept);
        if (best === null || v < best) best = v;
      }
      return String(best ?? 0n);
    },
    cases: [
      { args: ['1432219', 3], expected: '1219' },
      { args: ['10200', 1], expected: '200', note: 'bỏ số 0 đứng đầu' },
      { args: ['10', 2], expected: '0' },
      { args: ['112', 1], expected: '11' },
      { args: ['12345', 2], expected: '123', note: 'dãy tăng dần: xóa ở đuôi' },
      { args: ['9', 1], expected: '0' },
      { args: ['100', 1], expected: '0' },
      { args: ['5337', 2], expected: '33' },
      { args: ['0', 0], expected: '0' },
      { args: ['9'.repeat(100000), 50000], expected: '9'.repeat(50000), note: '10⁵ chữ số — xóa từng chữ số một là O(n·k)' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n > 1000 ? n : Math.min(n, 10));
      const digits = r.string(len, n > 1000 ? '0123456789' : '0123');
      const num = len === 1 ? digits : String(r.int(1, 9)) + digits.slice(1);
      return [num, r.int(0, len)];
    },
    stress: { minN: 1, maxN: 10 },
    perf: { n: 1e5, limitMs: 150 },
  },
};
