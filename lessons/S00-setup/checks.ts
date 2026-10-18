import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int sum(int[] nums)',
    title: 'Tổng mảng',
    ref: S.sum,
    brute: (nums: number[]) => nums.reduce((s, x) => s + x, 0),
    cases: [
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[]], expected: 0, note: 'mảng rỗng' },
      { args: [[-5]], expected: -5 },
      { args: [[1000, -1000, 7]], expected: 7 },
    ],
    gen: (n, r) => [r.array(n, -1000, 1000)],
    perf: { n: 1e6, limitMs: 200 },
  },
  '02': {
    sig: 'long countPairs(int[] nums, int k)',
    title: 'Đếm cặp có tổng bằng k',
    ref: S.countPairs,
    brute: S.countPairsQuadratic,
    cases: [
      { args: [[1, 5, 3, 3, 3], 6], expected: 4 },
      { args: [[2, 2, 2, 2], 4], expected: 6 },
      { args: [[], 0], expected: 0 },
      { args: [[3], 6], expected: 0, note: 'không ghép phần tử với chính nó' },
      { args: [[-1, 1, 0, 0], 0], expected: 2 },
      { args: [[1e9, -1e9, 0], 0], expected: 1 },
      { args: [new Array(70_000).fill(1), 2], expected: 2_449_965_000, note: 'số cặp > 2^31 — Java/C++ phải dùng long' },
    ],
    gen: (n, r) => {
      const v = r.int(2, Math.max(2, n));
      return [r.array(n, -v, v), r.int(-v, v)];
    },
    perf: { n: 1e5, limitMs: 500 },
  },
  '03': {
    sig: 'void reverseInPlace(int[] nums)',
    title: 'Đảo ngược mảng tại chỗ',
    ref: S.reverseInPlace,
    brute: (nums: number[]) => {
      const copy = nums.slice().reverse();
      for (let i = 0; i < nums.length; i++) nums[i] = copy[i];
    },
    output: 'arg0',
    cases: [
      { args: [[1, 2, 3, 4]], expected: [4, 3, 2, 1] },
      { args: [[7]], expected: [7] },
      { args: [[]], expected: [] },
      { args: [[1, 2, 3]], expected: [3, 2, 1] },
    ],
    gen: (n, r) => [r.array(n, -100, 100)],
    perf: { n: 1e6, limitMs: 200 },
  },
};
