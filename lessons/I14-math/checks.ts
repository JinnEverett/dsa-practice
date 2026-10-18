import type { Spec } from '../../tools/spec.ts';
import { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const MAXI = 2 ** 31 - 1;
const P = 1_000_000_007n;

// ───── brute độc lập (BigInt / vét cạn) ─────

const bruteGcd = (nums: number[]) => {
  for (let d = Math.min(...nums); d >= 1; d--) if (nums.every((v) => v % d === 0)) return d;
  return 1;
};

const bruteCountPrimes = (n: number) => {
  let c = 0;
  for (let k = 2; k < n; k++) {
    let ok = true;
    for (let d = 2; d < k; d++) if (k % d === 0) { ok = false; break; }
    if (ok) c++;
  }
  return c;
};

const bruteModPow = (base: number, exp: number, mod: number) => {
  let r = 1n % BigInt(mod);
  for (let i = 0; i < exp; i++) r = (r * BigInt(base)) % BigInt(mod); // exp nhỏ, nhân từng lần bằng BigInt
  return Number(r);
};

/** Tam giác Pascal bằng BigInt (số chính xác), rồi mới mod. */
const pascal: bigint[][] = [[1n]];
for (let n = 1; n <= 60; n++) {
  pascal.push(Array.from({ length: n + 1 }, (_, k) => (k === 0 || k === n ? 1n : pascal[n - 1][k - 1] + pascal[n - 1][k])));
}
const bruteNcr = (queries: number[][]) => queries.map(([n, r]) => Number(pascal[n][r] % P));

const bruteHappy = (n: number) => {
  const seen = new Set<number>();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = [...String(n)].reduce((s, c) => s + Number(c) ** 2, 0);
  }
  return n === 1;
};

const bruteToBase = (num: number, base: number) => BigInt(num).toString(base);

const bruteTrailing = (n: number) => {
  let c = 0;
  for (let i = 5; i <= n; i += 5) for (let k = i; k % 5 === 0; k /= 5) c++;
  return c;
};

/** Độc lập với ref: xác định độ dài tiền chu kỳ/chu kỳ bằng lý thuyết (2^a·5^b·m, bậc của 10 mod m), rồi sinh chữ số bằng BigInt. */
const bruteFraction = (num: number, den: number) => {
  if (num === 0) return '0';
  const neg = num < 0 !== den < 0;
  const a = BigInt(Math.abs(num));
  const b = BigInt(Math.abs(den));
  const int = a / b;
  let r = a % b;
  const head = (neg ? '-' : '') + int;
  if (r === 0n) return head;
  let d = b / (b < r ? 1n : gcdBig(r, b)); // mẫu sau khi rút gọn
  let a2 = 0;
  let a5 = 0;
  while (d % 2n === 0n) { d /= 2n; a2++; }
  while (d % 5n === 0n) { d /= 5n; a5++; }
  const pre = Math.max(a2, a5);
  let period = 0;
  if (d !== 1n) {
    let x = 10n % d;
    period = 1;
    while (x !== 1n) { x = (x * 10n) % d; period++; }
  }
  let digits = '';
  for (let i = 0; i < pre + period; i++) {
    r *= 10n;
    digits += (r / b).toString();
    r %= b;
  }
  return head + '.' + digits.slice(0, pre) + (period ? '(' + digits.slice(pre) + ')' : '');
};
function gcdBig(x: bigint, y: bigint): bigint {
  while (y) [x, y] = [y, x % y];
  return x;
}

/** Luhn tính từ TRÁI: chữ số cách cuối lẻ vị trí chẵn được nhân đôi; nhân đôi xong cộng hai chữ số (khác cách trừ 9 của ref). */
const bruteLuhn = (s: string) => {
  const ds: number[] = [];
  for (const ch of s) {
    if (ch === ' ' || ch === '-') continue;
    if (!/[0-9]/.test(ch)) return false;
    ds.push(Number(ch));
  }
  if (ds.length < 2) return false;
  let sum = 0;
  ds.forEach((d, i) => {
    if ((ds.length - i) % 2 === 0) {
      const t = d * 2;
      sum += Math.floor(t / 10) + (t % 10);
    } else sum += d;
  });
  return sum % 10 === 0;
};

const bruteCollision = (a: number, b: number, t: number) => {
  let x = t;
  while (x % a !== 0 || x % b !== 0) x++;
  return x;
};

// ───── sinh dữ liệu ─────

function luhnCheckDigit(body: number[]): number {
  // body: các chữ số trước chữ số kiểm tra (từ trái sang phải). Chữ số kiểm tra làm tổng ≡ 0 (mod 10).
  let sum = 0;
  body.slice().reverse().forEach((d, i) => {
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  });
  return (10 - (sum % 10)) % 10;
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int gcdOfArray(int[] nums)',
    title: 'GCD của mảng',
    ref: S.gcdOfArray,
    brute: bruteGcd,
    cases: [
      { args: [[12]], expected: 12 },
      { args: [[12, 18, 24]], expected: 6 },
      { args: [[7, 13]], expected: 1 },
      { args: [[1000000000, 500000000, 250000000]], expected: 250000000 },
      { args: [[MAXI, MAXI - 1]], expected: 1 },
      { args: [[MAXI, MAXI]], expected: MAXI },
    ],
    stress: { minN: 1 },
    gen: (n, r) => {
      if (n >= 1000) return [[...r.array(n, 1_000_000_000, MAXI)]]; // perf: gcd = 1, min ≈ 10⁹ → thử chia từ min xuống 1 mất 10⁹ bước
      const g = r.int(1, 40);
      return [Array.from({ length: Math.max(1, n) }, () => g * r.int(1, 25))];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '02': {
    sig: 'int countPrimes(int n)',
    title: 'Đếm số nguyên tố < n',
    ref: S.countPrimes,
    brute: bruteCountPrimes,
    cases: [
      { args: [0], expected: 0 },
      { args: [1], expected: 0 },
      { args: [2], expected: 0 },
      { args: [3], expected: 1 },
      { args: [10], expected: 4 },
      { args: [100], expected: 25 },
      { args: [1000000], expected: 78498 },
      { args: [5000000], expected: 348513, note: 'n = 5·10⁶' },
    ],
    gen: (n, r) => [n >= 1000 ? n : r.int(0, n * 10)],
    perf: { n: 5e6, limitMs: 300 },
  },
  '03': {
    sig: 'int modPow(long base, long exp, int mod)',
    title: 'Lũy thừa nhanh theo modulo',
    ref: S.modPow,
    brute: bruteModPow,
    cases: [
      { args: [2, 10, 1000], expected: 24 },
      { args: [2, 0, 1], expected: 0, note: 'mod = 1 → luôn 0' },
      { args: [0, 0, 7], expected: 1, note: '0⁰ = 1' },
      { args: [0, 5, 7], expected: 0 },
      { args: [7, 1, 1], expected: 0 },
      { args: [3, 200, 13], expected: 9 },
      { args: [5, 3, MAXI], expected: 125 },
      { args: [1000000000, 1000000000, MAXI], expected: 113512624, note: 'tích ~ 2⁶² vượt 2⁵³' },
      { args: [123456789, 9007199254740991, MAXI], expected: 1001342102, note: 'exp = 2⁵³ − 1: `>>` chỉ nhìn 32 bit' },
      { args: [MAXI - 1, 9007199254740990, MAXI], expected: 1, note: 'Fermat: a^(p−1) ≡ 1' },
      { args: [9007199254740991, 9007199254740991, 1000000007], expected: 787983433 },
    ],
    gen: (n, r) => {
      if (n >= 1000) return [123456789, 4_000_000_000, MAXI]; // perf: lặp exp lần = 4·10⁹ bước
      const bigMod = r.bool();
      const mod = bigMod ? MAXI - r.int(0, 5) : r.int(1, 100);
      const base = r.pick([r.int(0, 50), r.int(0, 2 ** 53 - 1), r.int(0, MAXI)]);
      return [base, r.int(0, 60), mod];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '04': {
    sig: 'int[] nCrMod(int[][] queries)',
    title: 'Tổ hợp C(n, r) mod 10⁹+7',
    ref: S.nCrMod,
    brute: bruteNcr,
    cases: [
      { args: [[[5, 2]]], expected: [10] },
      { args: [[]], expected: [] },
      { args: [[[0, 0], [1, 0], [1, 1], [100, 50], [1000, 3]]], expected: [1, 1, 1, 538992043, 166167000] },
      {
        args: [[[1000000, 500000], [1000000, 1], [1000000, 0], [1000000, 1000000], [1000000, 999999]]],
        expected: [996692777, 1000000, 1, 1, 1000000],
        note: 'n = 10⁶: tích hai số ~ 10⁹ vượt 2⁵³',
      },
    ],
    gen: (n, r) => {
      const big = n >= 1000;
      const qs: number[][] = [];
      for (let i = 0; i < n; i++) {
        const N = big ? r.int(0, 1_000_000) : r.int(0, 60);
        qs.push([N, r.int(0, N)]);
      }
      if (big) qs.push([1_000_000, 500_000]); // luôn có n lớn nhất
      return [qs];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '05': {
    sig: 'boolean isHappy(int n)',
    title: 'Số happy',
    ref: S.isHappy,
    brute: bruteHappy,
    cases: [
      { args: [1], expected: true },
      { args: [19], expected: true },
      { args: [2], expected: false },
      { args: [7], expected: true },
      { args: [4], expected: false },
      { args: [116], expected: false },
      { args: [1111111], expected: true },
      { args: [MAXI], expected: false },
    ],
    stress: { minN: 0 },
    gen: (n, r) => [r.pick([r.int(1, 1000), r.int(1, MAXI), r.int(1, 100) * 10 ** r.int(0, 7)])],
    perf: false, // O(log n) một lần gọi
  },
  '06': {
    sig: 'String toBase(long num, int base)',
    title: 'Đổi cơ số',
    ref: S.toBase,
    brute: bruteToBase,
    cases: [
      { args: [255, 16], expected: 'ff' },
      { args: [-255, 16], expected: '-ff' },
      { args: [0, 2], expected: '0' },
      { args: [35, 36], expected: 'z' },
      { args: [10, 10], expected: '10' },
      { args: [-1, 2], expected: '-1' },
      { args: [100, 7], expected: '202' },
      { args: [9007199254740991, 2], expected: '1'.repeat(53), note: '2⁵³ − 1' },
      { args: [-9007199254740991, 36], expected: '-2gosa7pa2gv' },
    ],
    gen: (_n, r) => {
      const base = r.int(2, 36);
      const mag = r.pick([r.int(0, 100), r.int(0, 100000), r.int(0, 2 ** 53 - 1), 2 ** 53 - 1 - r.int(0, 50)]);
      return [r.bool() ? -mag : mag, base];
    },
    perf: false,
  },
  '07': {
    sig: 'int trailingZeroes(int n)',
    title: 'Số 0 cuối của n!',
    ref: S.trailingZeroes,
    brute: bruteTrailing,
    cases: [
      { args: [0], expected: 0 },
      { args: [3], expected: 0 },
      { args: [5], expected: 1 },
      { args: [25], expected: 6 },
      { args: [100], expected: 24 },
      { args: [10000], expected: 2499 },
      { args: [MAXI], expected: 536870902, note: 'n = 2³¹ − 1' },
    ],
    gen: (n, r) => [n >= 1000 ? MAXI : r.int(0, n * 100)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '08': {
    sig: 'String fractionToDecimal(int numerator, int denominator)',
    title: 'Phân số → số thập phân',
    ref: S.fractionToDecimal,
    brute: bruteFraction,
    cases: [
      { args: [1, 2], expected: '0.5' },
      { args: [2, 1], expected: '2' },
      { args: [4, 333], expected: '0.(012)' },
      { args: [1, 6], expected: '0.1(6)' },
      { args: [-50, 8], expected: '-6.25' },
      { args: [0, -5], expected: '0' },
      { args: [1, -3], expected: '-0.(3)' },
      { args: [-1, 3], expected: '-0.(3)' },
      { args: [22, 7], expected: '3.(142857)' },
      { args: [1, 90], expected: '0.0(1)' },
      { args: [7, -12], expected: '-0.58(3)' },
      { args: [MAXI, 2], expected: '1073741823.5' },
      { args: [-(2 ** 31), -1], expected: '2147483648', note: '−2³¹ / −1 vượt int' },
      { args: [-1, -(2 ** 31)], expected: '0.0000000004656612873077392578125', note: 'mẫu −2³¹' },
    ],
    gen: (n, r) => {
      const num = r.pick([r.int(-1000, 1000), r.int(-1000, 1000), r.int(-(2 ** 31), MAXI)]);
      let den = r.pick([r.int(1, 300), r.int(1, 60) * 2 ** r.int(0, 5), r.int(1, 40) * 5 ** r.int(0, 3), 2 ** r.int(0, 31)]);
      if (den > 2 ** 31 - 1) den = 2 ** 31 - 1; // 2³¹ chỉ có thể là −2³¹
      den = r.bool() ? -den : den;
      return [num, den];
    },
    perf: false,
  },
  '09': {
    sig: 'boolean luhnValid(String number)',
    title: 'Kiểm tra Luhn',
    ref: S.luhnValid,
    brute: bruteLuhn,
    cases: [
      { args: ['4539578763621486'], expected: true },
      { args: ['4539578763621487'], expected: false },
      { args: ['79927398713'], expected: true },
      { args: ['4539 5787 6362 1486'], expected: true },
      { args: ['4539-5787-6362-1486'], expected: true },
      { args: ['00'], expected: true },
      { args: ['18'], expected: true },
      { args: ['59'], expected: true },
      { args: ['8'], expected: false, note: '< 2 chữ số' },
      { args: ['0'], expected: false },
      { args: [''], expected: false },
      { args: [' - '], expected: false },
      { args: ['4539x578763621486'], expected: false, note: 'ký tự lạ' },
    ],
    gen: (n, r) => {
      const k = Math.max(0, n);
      const digits = Array.from({ length: k }, () => r.int(0, 9));
      if (k >= 2 && r.bool()) digits[k - 1] = luhnCheckDigit(digits.slice(0, k - 1));
      let s = digits.join('');
      if (n < 1000 && r.bool(0.3)) s = s.replace(/(\d{4})(?=\d)/g, r.bool() ? '$1 ' : '$1-');
      if (n < 1000 && k > 0 && r.bool(0.1)) {
        const i = r.int(0, s.length - 1);
        s = s.slice(0, i) + r.pick(['x', '.', 'a']) + s.slice(i + 1);
      }
      return [s];
    },
    perf: { n: 3e5, limitMs: 100 },
  },
  '10': {
    sig: 'long nextCollision(long a, long b, long t)',
    title: 'Hai cron trùng nhau',
    ref: S.nextCollision,
    brute: bruteCollision,
    cases: [
      { args: [4, 6, 0], expected: 0 },
      { args: [4, 6, 1], expected: 12 },
      { args: [4, 6, 12], expected: 12 },
      { args: [4, 6, 13], expected: 24 },
      { args: [1, 1, 5], expected: 5 },
      { args: [7, 13, 91], expected: 91 },
      { args: [9999991, 9999973, 0], expected: 0 },
      { args: [9999991, 9999973, 1], expected: 99999640000243, note: 'lcm ~ 10¹⁴: mô phỏng từng phút không kịp' },
      { args: [10000000, 9999991, 1000000000000000], expected: 1099999010000000 },
    ],
    gen: (n, r) => {
      if (n >= 1000) return [9999991, 9999973, 1_000_000_000_000_000];
      return [r.int(1, 30), r.int(1, 30), r.int(0, 200)];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
};
