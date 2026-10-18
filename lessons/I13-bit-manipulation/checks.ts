import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const MIN32 = -2147483648;
const MAX32 = 2147483647;

/** Đếm số lần xuất hiện bằng Map (độc lập với XOR). */
const counts = (nums: number[]) => {
  const m = new Map<number, number>();
  for (const v of nums) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
};

/** Mảng gồm các giá trị `single` (1 lần) và `repeat` bản sao của mỗi giá trị khác, xáo trộn. */
function withSingles(singles: number[], others: number[], repeat: number, r: Rng): number[] {
  const arr = [...singles];
  for (const v of others) for (let k = 0; k < repeat; k++) arr.push(v);
  return r.shuffle(arr);
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int singleNumber(int[] nums)',
    title: 'Số xuất hiện một lần',
    ref: S.singleNumber,
    brute: (nums: number[]) => [...counts(nums)].find(([, c]) => c === 1)![0],
    cases: [
      { args: [[2, 2, 1]], expected: 1 },
      { args: [[4, 1, 2, 1, 2]], expected: 4 },
      { args: [[1]], expected: 1 },
      { args: [[-5, 3, 3]], expected: -5, note: 'số âm' },
      { args: [[MIN32, 7, 7]], expected: MIN32 },
      { args: [[...range(100000), ...range(100000), -1]], expected: -1, note: '2·10⁵ + 1 phần tử' },
    ],
    gen: (n, r) => {
      const pairs = Math.floor(Math.max(0, n) / 2);
      const vals = r.distinct(pairs + 1, n > 1000 ? MIN32 : -20, n > 1000 ? MAX32 : Math.max(20, 3 * n));
      return [withSingles([vals[0]], vals.slice(1), 2, r)];
    },
    perf: false, // XOR và Map cùng O(n) — không phân biệt được bằng Perf (O(1) vs O(n) bộ nhớ là điều cần tự giác)
  },
  '02': {
    sig: 'int hammingWeight(long n)',
    title: 'Đếm bit 1',
    ref: S.hammingWeight,
    brute: (n: number) => n.toString(2).replace(/0/g, '').length,
    cases: [
      { args: [11], expected: 3 },
      { args: [128], expected: 1 },
      { args: [0], expected: 0 },
      { args: [2147483645], expected: 30 },
      { args: [2147483648], expected: 1, note: '2³¹: bit dấu của int32' },
      { args: [4294967293], expected: 31, note: '2³² − 3' },
      { args: [4294967295], expected: 32, note: '2³² − 1: mọi bit 1 — `n >> 1` lặp mãi' },
    ],
    gen: (_n, r) => [r.bool(0.3) ? r.int(0, 100) : r.int(0, 4294967295)],
    stress: { runs: 300, maxN: 30 },
    perf: false, // một lệnh gọi O(32) — không đo được
  },
  '03': {
    sig: 'int[] countBits(int n)',
    title: 'Đếm bit 1 của 0..n',
    ref: S.countBits,
    brute: (n: number) => range(n + 1).map((i) => i.toString(2).replace(/0/g, '').length),
    cases: [
      { args: [2], expected: [0, 1, 1] },
      { args: [5], expected: [0, 1, 1, 2, 1, 2] },
      { args: [0], expected: [0] },
      { args: [8], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1] },
    ],
    gen: (n) => [n],
    stress: { minN: 0, maxN: 40 },
    perf: { n: 1e6, limitMs: 400 },
  },
  '04': {
    sig: 'boolean isPowerOfTwo(long n)',
    title: 'Có là lũy thừa của 2?',
    ref: S.isPowerOfTwo,
    brute: (n: number) => {
      let b = BigInt(n);
      if (b <= 0n) return false;
      while (b % 2n === 0n) b /= 2n;
      return b === 1n;
    },
    cases: [
      { args: [1], expected: true },
      { args: [16], expected: true },
      { args: [3], expected: false },
      { args: [0], expected: false },
      { args: [-16], expected: false, note: 'số âm' },
      { args: [2147483648], expected: true, note: '2³¹' },
      { args: [4294967296], expected: true, note: '2³²' },
      { args: [4294967297], expected: false, note: '2³² + 1: `n & (n − 1)` trong JS chỉ thấy 32 bit thấp ⇒ báo nhầm true' },
      { args: [1099511627784], expected: false, note: '2⁴⁰ + 8' },
      { args: [1125899906842624], expected: true, note: '2⁵⁰' },
      { args: [9007199254740991], expected: false, note: '2⁵³ − 1' },
    ],
    gen: (_n, r) => {
      const e = r.int(0, 52);
      const base = 2 ** e;
      const kind = r.int(0, 5);
      let v = base;
      if (kind === 1) v = base + r.int(1, 9);
      else if (kind === 2) v = Math.max(1, base - 1);
      else if (kind === 3) v = r.int(0, 2 ** 40);
      else if (kind === 4) v = -base;
      else if (kind === 5) v = Math.min(2 ** 53 - 1, base + 2 ** r.int(0, e));
      return [v];
    },
    stress: { runs: 300, maxN: 30 },
    perf: false,
  },
  '05': {
    sig: 'long reverseBits(long n)',
    title: 'Đảo 32 bit',
    ref: S.reverseBits,
    brute: (n: number) => parseInt(n.toString(2).padStart(32, '0').split('').reverse().join(''), 2),
    cases: [
      { args: [43261596], expected: 964176192 },
      { args: [4294967293], expected: 3221225471 },
      { args: [0], expected: 0 },
      { args: [1], expected: 2147483648, note: 'kết quả có bit 31 = 1: int32 sẽ âm nếu quên `>>> 0`' },
      { args: [2147483648], expected: 1 },
      { args: [4294967295], expected: 4294967295 },
    ],
    gen: (_n, r) => [r.bool(0.3) ? r.int(0, 100) : r.int(0, 4294967295)],
    stress: { runs: 300, maxN: 30 },
    perf: false,
  },
  '06': {
    sig: 'int missingNumber(int[] nums)',
    title: 'Số bị thiếu',
    ref: S.missingNumber,
    brute: (nums: number[]) => range(nums.length + 1).find((v) => !nums.includes(v))!,
    cases: [
      { args: [[3, 0, 1]], expected: 2 },
      { args: [[0, 1]], expected: 2 },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
      { args: [[0]], expected: 1 },
      { args: [[1]], expected: 0 },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      const missing = r.int(0, len);
      return [r.shuffle(range(len + 1).filter((v) => v !== missing))];
    },
    stress: { minN: 1, maxN: 30 },
    perf: false,
  },
  '07': {
    sig: 'int singleNumberII(int[] nums)',
    title: 'Số xuất hiện một lần (các số khác 3 lần)',
    ref: S.singleNumberII,
    brute: (nums: number[]) => [...counts(nums)].find(([, c]) => c === 1)![0],
    cases: [
      { args: [[2, 2, 3, 2]], expected: 3 },
      { args: [[0, 1, 0, 1, 0, 1, 99]], expected: 99 },
      { args: [[-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]], expected: -4, note: 'số âm' },
      { args: [[MIN32, 5, 5, 5]], expected: MIN32 },
      { args: [[7]], expected: 7 },
      { args: [[MAX32, MIN32, MIN32, MIN32]], expected: MAX32 },
    ],
    gen: (n, r) => {
      const triples = Math.floor(Math.max(0, n) / 3);
      const vals = r.distinct(triples + 1, n > 1000 ? MIN32 : -20, n > 1000 ? MAX32 : Math.max(20, 3 * n));
      return [withSingles([vals[0]], vals.slice(1), 3, r)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'int[] singleNumberIII(int[] nums)',
    title: 'Hai số xuất hiện một lần',
    ref: S.singleNumberIII,
    brute: (nums: number[]) =>
      [...counts(nums)]
        .filter(([, c]) => c === 1)
        .map(([v]) => v)
        .sort((a, b) => a - b),
    cases: [
      { args: [[1, 2, 1, 3, 2, 5]], expected: [3, 5] },
      { args: [[-1, 0]], expected: [-1, 0] },
      { args: [[0, 1]], expected: [0, 1] },
      { args: [[MIN32, 5, 5, 0]], expected: [MIN32, 0], note: 'a ^ b = −2³¹' },
      { args: [[MAX32, MIN32, 7, 7]], expected: [MIN32, MAX32], note: 'a ^ b = −1' },
    ],
    gen: (n, r) => {
      const pairs = Math.floor(Math.max(0, n) / 2);
      const vals = r.distinct(pairs + 2, n > 1000 ? MIN32 : -20, n > 1000 ? MAX32 : Math.max(20, 3 * n));
      return [withSingles([vals[0], vals[1]], vals.slice(2), 2, r)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '09': {
    sig: 'int rangeBitwiseAnd(int left, int right)',
    title: 'AND của cả khoảng',
    ref: S.rangeBitwiseAnd,
    brute: (left: number, right: number) => {
      let x = left;
      for (let v = left + 1; v <= right; v++) x &= v;
      return x;
    },
    cases: [
      { args: [5, 7], expected: 4 },
      { args: [0, 0], expected: 0 },
      { args: [1, 2147483647], expected: 0, note: 'khoảng 2·10⁹ phần tử: AND lần lượt quá giờ' },
      { args: [2147483646, 2147483647], expected: 2147483646 },
      { args: [6, 7], expected: 6 },
      { args: [8, 8], expected: 8 },
    ],
    gen: (_n, r) => {
      const left = r.int(0, 300);
      return [left, left + r.int(0, 300)];
    },
    stress: { runs: 300, maxN: 30 },
    perf: false,
  },
  '10': {
    sig: 'int minFlagSets(int target, int[] sets)',
    title: 'Ít gói feature flag nhất',
    ref: S.minFlagSets,
    brute: (target: number, sets: number[]) => {
      let best = Infinity;
      for (let mask = 0; mask < 1 << sets.length; mask++) {
        let or = 0;
        let cnt = 0;
        for (let i = 0; i < sets.length; i++) if ((mask >> i) & 1) ((or |= sets[i]), cnt++);
        if (or === target) best = Math.min(best, cnt);
      }
      return best === Infinity ? -1 : best;
    },
    cases: [
      { args: [7, [1, 2, 4]], expected: 3 },
      { args: [7, [3, 4]], expected: 2 },
      { args: [7, [7]], expected: 1 },
      { args: [7, [1, 2]], expected: -1 },
      { args: [3, [1, 2, 3, 4]], expected: 1, note: 'gói 4 có bit ngoài target ⇒ không được dùng' },
      { args: [0, [1, 2]], expected: 0, note: 'target = 0: không cần gói nào' },
      { args: [5, [3]], expected: -1 },
      { args: [32767, range(15).map((i) => 1 << i)], expected: 15, note: '15 gói đơn bit' },
    ],
    gen: (n, r) => {
      const m = Math.min(15, n);
      const sets = Array.from({ length: m }, () => r.int(0, 31));
      const target = r.bool(0.7) ? sets.filter(() => r.bool()).reduce((a, b) => a | b, 0) : r.int(0, 31);
      return [target, sets];
    },
    stress: { minN: 0, maxN: 15 },
    perf: false, // 2^m với m ≤ 15 — cố định, không có thang n
  },
};
