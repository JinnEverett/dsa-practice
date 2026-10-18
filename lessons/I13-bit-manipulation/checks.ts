import type { Spec } from '../../tools/spec.ts';
import { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const MAXI = 2 ** 31 - 1;
const MINI = -(2 ** 31);

/** k giá trị khác nhau trong int32 (miền nhỏ khi n bé để có số âm/số gần nhau, miền rộng khi n lớn). */
function distinctVals(k: number, n: number, r: Rng): number[] {
  const small = n <= 30 && r.bool();
  return small ? r.distinct(k, -25, 25) : r.distinct(k, MINI, MAXI);
}

/** Mảng: `singles` số xuất hiện 1 lần, `k` số còn lại xuất hiện `rep` lần, đã xáo trộn. */
function repeated(n: number, rep: number, singles: number, r: Rng): number[] {
  const k = Math.max(0, Math.floor((n - singles) / rep));
  const vals = distinctVals(k + singles, n, r);
  const out: number[] = [];
  for (let i = 0; i < k; i++) for (let j = 0; j < rep; j++) out.push(vals[i]);
  for (let i = 0; i < singles; i++) out.push(vals[k + i]);
  return r.shuffle(out);
}

const popBig = (n: number) => [...BigInt(n).toString(2)].filter((c) => c === '1').length;

/** Số trong [0, 2³²) có phân bố "khó": nhỏ, gần 2³¹, gần 2³², ngẫu nhiên toàn miền. */
function u32(r: Rng): number {
  switch (r.int(0, 4)) {
    case 0: return r.int(0, 100);
    case 1: return 2 ** 31 + r.int(-3, 3);
    case 2: return 2 ** 32 - 1 - r.int(0, 3);
    default: return r.int(0, 2 ** 32 - 1);
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int singleNumber(int[] nums)',
    title: 'Số xuất hiện một lần',
    ref: S.singleNumber,
    brute: (nums: number[]) => {
      for (const v of nums) if (nums.filter((x) => x === v).length === 1) return v;
      return 0;
    },
    cases: [
      { args: [[2, 2, 1]], expected: 1 },
      { args: [[4, 1, 2, 1, 2]], expected: 4 },
      { args: [[-7]], expected: -7 },
      { args: [[MINI, 5, MINI, MAXI, 5]], expected: MAXI },
      {
        args: [[...Array.from({ length: 49999 }, (_, i) => i + 1), 123456789, ...Array.from({ length: 49999 }, (_, i) => 49999 - i)]],
        expected: 123456789,
        note: 'n = 10⁵ − 1',
      },
    ],
    stress: { minN: 1 },
    gen: (n, r) => [repeated(n % 2 === 0 ? n + 1 : n, 2, 1, r)],
    perf: { n: 1e5, limitMs: 150 },
  },
  '02': {
    sig: 'int hammingWeight(long n)',
    title: 'Đếm bit 1',
    ref: S.hammingWeight,
    brute: popBig,
    cases: [
      { args: [11], expected: 3 },
      { args: [128], expected: 1 },
      { args: [0], expected: 0 },
      { args: [2147483648], expected: 1, note: '2³¹: `>>` giữ dấu sẽ lặp vô hạn' },
      { args: [4294967293], expected: 31 },
      { args: [4294967295], expected: 32 },
    ],
    gen: (_n, r) => [u32(r)],
    perf: false, // một lần gọi ≤ 32 vòng lặp: không phân biệt được gì ở n lớn
  },
  '03': {
    sig: 'int[] countBits(int n)',
    title: 'Đếm bit cho 0..n',
    ref: S.countBits,
    brute: (n: number) => Array.from({ length: n + 1 }, (_, i) => popBig(i)),
    cases: [
      { args: [0], expected: [0] },
      { args: [2], expected: [0, 1, 1] },
      { args: [5], expected: [0, 1, 1, 2, 1, 2] },
      { args: [8], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1] },
    ],
    gen: (n, r) => [n >= 1000 ? n : r.int(0, n * 5)],
    perf: { n: 1e6, limitMs: 200 },
  },
  '04': {
    sig: 'boolean isPowerOfTwo(long n)',
    title: 'Lũy thừa của 2',
    ref: S.isPowerOfTwo,
    brute: (n: number) => {
      for (let p = 1; p <= n; p *= 2) if (p === n) return true;
      return false;
    },
    cases: [
      { args: [1], expected: true },
      { args: [16], expected: true },
      { args: [3], expected: false },
      { args: [0], expected: false },
      { args: [-2], expected: false },
      { args: [-2147483648], expected: false },
      { args: [2147483648], expected: true },
      { args: [4294967296], expected: true },
      { args: [4294967297], expected: false, note: '2³² + 1: 32 bit thấp chỉ còn 1 (bẫy int32 của TS)' },
      { args: [4503599627370496], expected: true, note: '2⁵²' },
      { args: [4503599627370497], expected: false },
      { args: [9007199254740991], expected: false, note: '2⁵³ − 1: log2 làm tròn thành 53' },
    ],
    gen: (_n, r) => {
      const k = r.int(0, 52);
      const v = r.pick([2 ** k, 2 ** k, 2 ** k + 1, 2 ** k - 1, -(2 ** k), r.int(-1000, 1000), r.int(1, 2 ** 53 - 1), 2 ** 32 + r.int(-2, 2)]);
      return [v];
    },
    perf: false, // O(1) một lần gọi
  },
  '05': {
    sig: 'long reverseBits(long n)',
    title: 'Đảo 32 bit',
    ref: S.reverseBits,
    brute: (n: number) => Number(BigInt('0b' + [...BigInt(n).toString(2).padStart(32, '0')].reverse().join(''))),
    cases: [
      { args: [43261596], expected: 964176192 },
      { args: [4294967293], expected: 3221225471 },
      { args: [0], expected: 0 },
      { args: [1], expected: 2147483648, note: 'kết quả ≥ 2³¹: TS phải `>>> 0`' },
      { args: [2147483648], expected: 1 },
      { args: [4294967295], expected: 4294967295 },
    ],
    gen: (_n, r) => [u32(r)],
    perf: false,
  },
  '06': {
    sig: 'int missingNumber(int[] nums)',
    title: 'Số bị thiếu',
    ref: S.missingNumber,
    brute: (nums: number[]) => {
      for (let i = 0; i <= nums.length; i++) if (!nums.includes(i)) return i;
      return -1;
    },
    cases: [
      { args: [[3, 0, 1]], expected: 2 },
      { args: [[0, 1]], expected: 2 },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
      { args: [[1]], expected: 0 },
      { args: [[0]], expected: 1 },
      {
        args: [Array.from({ length: 100000 }, (_, i) => (i < 77777 ? i : i + 1))],
        expected: 77777,
        note: 'n = 10⁵: tổng Gauss vượt int',
      },
    ],
    stress: { minN: 1 },
    gen: (n, r) => {
      const len = Math.max(1, n);
      const all = Array.from({ length: len + 1 }, (_, i) => i);
      all.splice(n >= 1000 ? len : r.int(0, len), 1); // perf: thiếu số lớn nhất → bản includes() quét hết
      return [r.shuffle(all)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '07': {
    sig: 'int singleNumberII(int[] nums)',
    title: 'Số xuất hiện một lần (còn lại 3 lần)',
    ref: S.singleNumberII,
    brute: (nums: number[]) => {
      const m = new Map<number, number>();
      for (const v of nums) m.set(v, (m.get(v) ?? 0) + 1);
      for (const [v, c] of m) if (c === 1) return v;
      return 0;
    },
    cases: [
      { args: [[2, 2, 3, 2]], expected: 3 },
      { args: [[0, 1, 0, 1, 0, 1, 99]], expected: 99 },
      { args: [[-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]], expected: -4 },
      { args: [[MINI, 7, 7, 7]], expected: MINI },
      { args: [[MAXI, MINI, MINI, MINI]], expected: MAXI },
      { args: [[-1]], expected: -1 },
    ],
    stress: { minN: 1 },
    gen: (n, r) => [repeated(3 * Math.floor(Math.max(0, n - 1) / 3) + 1, 3, 1, r)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'int[] singleNumberIII(int[] nums)',
    title: 'Hai số xuất hiện một lần',
    ref: S.singleNumberIII,
    brute: (nums: number[]) => {
      const m = new Map<number, number>();
      for (const v of nums) m.set(v, (m.get(v) ?? 0) + 1);
      return [...m].filter(([, c]) => c === 1).map(([v]) => v).sort((a, b) => a - b);
    },
    cases: [
      { args: [[1, 2, 1, 3, 2, 5]], expected: [3, 5] },
      { args: [[-1, 0]], expected: [-1, 0] },
      { args: [[0, 1]], expected: [0, 1] },
      { args: [[MINI, 4, 4, 0]], expected: [MINI, 0], note: 'a ^ b = −2³²⁻¹: bit thấp nhất là bit dấu' },
      { args: [[MAXI, MINI, 9, 9]], expected: [MINI, MAXI] },
    ],
    stress: { minN: 2 },
    gen: (n, r) => [repeated(2 * Math.floor(Math.max(0, n - 2) / 2) + 2, 2, 2, r)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '09': {
    sig: 'int rangeBitwiseAnd(int left, int right)',
    title: 'AND của đoạn',
    ref: S.rangeBitwiseAnd,
    brute: (left: number, right: number) => {
      let a = left;
      for (let i = left + 1; i <= right; i++) a &= i;
      return a;
    },
    cases: [
      { args: [5, 7], expected: 4 },
      { args: [0, 0], expected: 0 },
      { args: [8, 8], expected: 8 },
      { args: [1, MAXI], expected: 0 },
      { args: [600000000, 2147483645], expected: 0 },
      { args: [MAXI - 1, MAXI], expected: MAXI - 1 },
      { args: [2 ** 30, MAXI], expected: 2 ** 30, note: 'ví dụ perf: AND từng số là 10⁹ bước' },
    ],
    gen: (n, r) => {
      if (n >= 1000) return [2 ** 30, MAXI];
      const base = r.pick([0, 1, r.int(0, 5000), r.int(0, MAXI - 300), MAXI - r.int(0, 300), 2 ** 30 - r.int(0, 100)]);
      const left = Math.min(base, MAXI);
      return [left, Math.min(MAXI, left + r.int(0, 300))];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '10': {
    sig: 'int minFlagSets(int target, int[] sets)',
    title: 'Gói feature flag tối thiểu',
    ref: S.minFlagSets,
    brute: (target: number, sets: number[]) => {
      let best = Infinity;
      const rec = (i: number, or: number, used: number) => {
        if (i === sets.length) {
          if (or === target) best = Math.min(best, used);
          return;
        }
        rec(i + 1, or, used);
        rec(i + 1, or | sets[i], used + 1);
      };
      rec(0, 0, 0);
      return best === Infinity ? -1 : best;
    },
    cases: [
      { args: [7, [1, 2, 4, 3]], expected: 2 },
      { args: [5, [1, 4, 2]], expected: 2 },
      { args: [3, [1, 4]], expected: -1, note: 'gói 4 có bit ngoài target → không dùng được' },
      { args: [0, []], expected: 0 },
      { args: [0, [5, 3]], expected: 0 },
      { args: [1, []], expected: -1 },
      { args: [6, [2, 4, 6, 1]], expected: 1 },
      { args: [32767, Array.from({ length: 15 }, (_, i) => 1 << i)], expected: 15 },
      { args: [1048575, [1048575, 524288, 1]], expected: 1, note: 'target 20 bit' },
    ],
    gen: (n, r) => {
      const m = r.int(0, 15);
      const bits = r.pick([4, 8, 20]);
      const mask = (1 << bits) - 1;
      const sets = Array.from({ length: m }, () => r.int(0, mask) & r.int(0, mask) & (r.bool() ? r.int(0, mask) : mask));
      let target: number;
      if (r.bool(0.75) && m > 0) {
        target = 0;
        for (const s of sets) if (r.bool(0.5)) target |= s;
      } else target = r.int(0, mask);
      return [target, sets];
    },
    perf: false, // ≤ 2¹⁵ tập con: một lần gọi quá nhỏ để phân biệt
  },
};
