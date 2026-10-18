import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const SAFE = 9007199254740991; // 2⁵³ − 1
const P = 1_000_000_007n;

/** Số nguyên tố ≤ n-1 bằng chia thử (độc lập với sàng). */
const isPrime = (x: number) => {
  if (x < 2) return false;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
  return true;
};

/** (base ^ exp) mod m bằng BigInt, lặp exp lần (chỉ dùng exp nhỏ). */
const powSlow = (base: number, exp: number, mod: number) => {
  let r = 1n % BigInt(mod);
  for (let i = 0; i < exp; i++) r = (r * BigInt(base)) % BigInt(mod);
  return Number(r);
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int gcdOfArray(int[] nums)',
    title: 'GCD của cả mảng',
    ref: S.gcdOfArray,
    brute: (nums: number[]) => {
      // ước chung lớn nhất = số d lớn nhất chia hết mọi phần tử (thử d từ min xuống 1)
      for (let d = Math.min(...nums); d >= 1; d--) if (nums.every((v) => v % d === 0)) return d;
      return 1;
    },
    cases: [
      { args: [[12, 18, 24]], expected: 6 },
      { args: [[7]], expected: 7 },
      { args: [[7, 13]], expected: 1 },
      { args: [[1000000000, 500000000, 250000000]], expected: 250000000 },
      { args: [[1000000000, 1, 999999937]], expected: 1, note: 'gcd(10⁹, 1) bằng phép trừ liên tiếp mất 10⁹ bước' },
      { args: [[...new Array(99999).fill(6), 4]], expected: 2 },
    ],
    gen: (n, r) => {
      if (n > 1000) return [[1000000000, 1, ...r.array(n - 2, 1, 1000000000)]];
      const g = r.int(1, 12);
      return [r.array(Math.max(1, n), 1, 30).map((x) => x * g)];
    },
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'int countPrimes(int n)',
    title: 'Đếm số nguyên tố < n',
    ref: S.countPrimes,
    brute: (n: number) => range(n).filter(isPrime).length,
    cases: [
      { args: [10], expected: 4 },
      { args: [0], expected: 0 },
      { args: [1], expected: 0 },
      { args: [2], expected: 0, note: 'nhỏ hơn n, không phải ≤ n' },
      { args: [3], expected: 1 },
      { args: [100], expected: 25 },
      { args: [1000000], expected: 78498 },
      { args: [5000000], expected: 348513 },
    ],
    gen: (n) => [n],
    stress: { minN: 0, maxN: 60 },
    perf: { n: 5e6, limitMs: 300 },
  },
  '03': {
    sig: 'int modPow(long base, long exp, int mod)',
    title: 'Lũy thừa modulo',
    ref: S.modPow,
    brute: (base: number, exp: number, mod: number) => powSlow(base, exp, mod),
    cases: [
      { args: [2, 10, 1000], expected: 24 },
      { args: [3, 0, 7], expected: 1, note: 'exp = 0' },
      { args: [5, 3, 1], expected: 0, note: 'mod = 1' },
      { args: [2, 1000000000000000, 1000000007], expected: 264444359, note: 'exp = 10¹⁵ — lặp exp lần không bao giờ xong; (a·b) % m mất chính xác khi a·b > 2⁵³' },
      { args: [123456789, 987654321987, 998244353], expected: 125393818 },
      { args: [2, SAFE, 2147483647], expected: 128, note: 'mod 2³¹ − 1: a·b tới 2⁶² > 2⁵³' },
      { args: [SAFE, SAFE, 2147483629], expected: 1067005487, note: 'base cũng rất lớn' },
      { args: [1000000006, 1000000000000001, 1000000007], expected: 1000000006, note: '(−1)^lẻ' },
    ],
    gen: (n, r) => [r.bool(0.5) ? r.int(0, SAFE) : r.int(0, 1000), n, r.int(1, 2147483647)],
    stress: { minN: 0, maxN: 30 },
    perf: false, // một lần gọi ~53 vòng
  },
  '04': {
    sig: 'int nCrMod(int n, int r)',
    title: 'C(n, r) mod 10⁹+7',
    ref: S.nCrMod,
    brute: (n: number, r: number) => {
      // tam giác Pascal với phép cộng modulo (không cần nhân/chia)
      const M = 1_000_000_007;
      let row = [1];
      for (let i = 1; i <= n; i++) {
        const next = new Array<number>(i + 1).fill(1);
        for (let j = 1; j < i; j++) next[j] = (row[j - 1] + row[j]) % M;
        row = next;
      }
      return row[r];
    },
    cases: [
      { args: [5, 2], expected: 10 },
      { args: [10, 0], expected: 1 },
      { args: [10, 10], expected: 1 },
      { args: [1000, 500], expected: 159835829 },
      { args: [100000, 50000], expected: 149033233 },
      { args: [1000000, 1], expected: 1000000 },
      { args: [1000000, 500000], expected: 996692777, note: 'tích modulo cần mulMod; Pascal O(n·r) quá giờ' },
      { args: [1000000, 10], expected: 938980468 },
    ],
    gen: (n, r) => {
      if (n > 1000) return [1000000, 500000]; // r = n/2: tử số và mẫu số mỗi bên 5·10⁵ phép nhân
      return [n, r.int(0, n)];
    },
    stress: { minN: 0, maxN: 30 },
    perf: { n: 1e6, limitMs: 300 },
  },
  '05': {
    sig: 'boolean isHappy(int n)',
    title: 'Số hạnh phúc',
    ref: S.isHappy,
    brute: (n: number) => {
      let x = n;
      for (let i = 0; i < 2000; i++) {
        if (x === 1) return true;
        x = String(x).split('').reduce((s, d) => s + Number(d) ** 2, 0);
      }
      return false;
    },
    cases: [
      { args: [19], expected: true },
      { args: [2], expected: false },
      { args: [1], expected: true },
      { args: [7], expected: true },
      { args: [4], expected: false },
      { args: [2147483647], expected: false },
      { args: [1999999999], expected: false },
    ],
    gen: (n, r) => [r.int(1, 10 ** r.int(1, 9)) + (n > 0 ? 0 : 0)],
    stress: { minN: 0, maxN: 30 },
    perf: false,
  },
  '06': {
    sig: 'String toBase(long num, int base)',
    title: 'Đổi cơ số',
    ref: S.toBase,
    brute: (num: number, base: number) => num.toString(base), // chuẩn có sẵn của JS (đúng với số nguyên an toàn)
    cases: [
      { args: [255, 16], expected: 'ff' },
      { args: [-255, 16], expected: '-ff' },
      { args: [0, 2], expected: '0' },
      { args: [35, 36], expected: 'z' },
      { args: [10, 2], expected: '1010' },
      { args: [SAFE, 36], expected: '2gosa7pa2gv' },
      { args: [-SAFE, 2], expected: '-' + '1'.repeat(53) },
      { args: [1, 36], expected: '1' },
    ],
    gen: (_n, r) => {
      const mag = r.pick([100, 100000, 4294967296, SAFE]);
      return [r.int(-mag, mag), r.int(2, 36)];
    },
    stress: { runs: 300, maxN: 30 },
    perf: false,
  },
  '07': {
    sig: 'int trailingZeroes(int n)',
    title: 'Chữ số 0 ở cuối n!',
    ref: S.trailingZeroes,
    brute: (n: number) => {
      let f = 1n;
      for (let i = 2n; i <= BigInt(n); i++) f *= i;
      let z = 0;
      while (f % 10n === 0n) ((f /= 10n), z++);
      return z;
    },
    cases: [
      { args: [3], expected: 0 },
      { args: [5], expected: 1 },
      { args: [0], expected: 0 },
      { args: [25], expected: 6, note: '25 = 5² góp hai thừa số 5' },
      { args: [100], expected: 24 },
      { args: [10000], expected: 2499 },
      { args: [2147483647], expected: 536870902, note: 'n! có hàng tỉ chữ số; duyệt từng số 2·10⁹ bước' },
    ],
    gen: (n, r) => [r.int(0, 300) + (n >= 0 ? 0 : 0)],
    stress: { minN: 0, maxN: 30 },
    perf: false,
  },
  '08': {
    sig: 'String fractionToDecimal(int numerator, int denominator)',
    title: 'Phân số → số thập phân',
    ref: S.fractionToDecimal,
    brute: (num: number, den: number) => {
      if (num === 0) return '0';
      const neg = num < 0 !== den < 0;
      const a = BigInt(Math.abs(num));
      const b = BigInt(Math.abs(den));
      let out = (neg ? '-' : '') + String(a / b);
      let rem = a % b;
      if (rem === 0n) return out;
      const rems: bigint[] = [];
      const digs: string[] = [];
      while (rem !== 0n && !rems.includes(rem)) {
        rems.push(rem);
        digs.push(String((rem * 10n) / b));
        rem = (rem * 10n) % b;
      }
      out += '.';
      if (rem === 0n) return out + digs.join('');
      const at = rems.indexOf(rem);
      return out + digs.slice(0, at).join('') + '(' + digs.slice(at).join('') + ')';
    },
    cases: [
      { args: [1, 2], expected: '0.5' },
      { args: [2, 1], expected: '2' },
      { args: [4, 333], expected: '0.(012)' },
      { args: [-50, 8], expected: '-6.25' },
      { args: [1, 6], expected: '0.1(6)' },
      { args: [0, -5], expected: '0', note: 'không có "-0"' },
      { args: [1, 7], expected: '0.(142857)' },
      { args: [22, 7], expected: '3.(142857)' },
      { args: [-2147483648, -1], expected: '2147483648', note: '−2³¹ / −1 tràn int' },
      { args: [-1, -2147483648], expected: '0.0000000004656612873077392578125', note: '1 / 2³¹: 31 chữ số, kết thúc, không tuần hoàn' },
      { args: [1, -3], expected: '-0.(3)' },
    ],
    gen: (n, r) => {
      if (n > 1000) return [1, 99989]; // chu kỳ 99 988 chữ số
      const den = r.int(1, 60) * (r.bool() ? -1 : 1);
      return [r.int(-200, 200), den];
    },
    stress: { minN: 0, maxN: 30 },
    perf: { n: 99989, limitMs: 200 },
  },
  '09': {
    sig: 'boolean luhnValid(String number)',
    title: 'Kiểm tra số thẻ bằng Luhn',
    ref: S.luhnValid,
    brute: (s: string) => {
      const doubled = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
      const rev = [...s].reverse().map(Number);
      return rev.reduce((acc, d, i) => acc + (i % 2 === 1 ? doubled[d] : d), 0) % 10 === 0;
    },
    cases: [
      { args: ['79927398713'], expected: true },
      { args: ['79927398710'], expected: false },
      { args: ['4539578763621486'], expected: true },
      { args: ['4111111111111111'], expected: true },
      { args: ['4111111111111112'], expected: false },
      { args: ['0'], expected: true },
      { args: ['18'], expected: true },
      { args: ['19'], expected: false },
      { args: ['0000000000'], expected: true },
    ],
    gen: (n, r) => [r.string(Math.max(1, n), '0123456789')],
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e6, limitMs: 100 },
  },
  '10': {
    sig: 'long nextCollision(long a, long b, long t)',
    title: 'Lần trùng lịch cron kế tiếp',
    ref: S.nextCollision,
    brute: (a: number, b: number, t: number) => {
      for (let x = t; ; x++) if (x % a === 0 && x % b === 0) return x;
    },
    cases: [
      { args: [4, 6, 0], expected: 0, note: 'cả hai chạy lúc 0' },
      { args: [4, 6, 1], expected: 12 },
      { args: [4, 6, 12], expected: 12, note: '≥ t, có thể bằng t' },
      { args: [4, 6, 13], expected: 24 },
      { args: [5, 7, 100], expected: 105 },
      { args: [1, 1, 123456789012345], expected: 123456789012345 },
      { args: [9999991, 9999973, 1000000000000000], expected: 1099996040002673, note: 'lcm ≈ 10¹⁴; t = 10¹⁵' },
      { args: [10000000, 9999999, 5], expected: 99999990000000, note: 'a, b nguyên tố cùng nhau: lcm = a·b ≈ 10¹⁴' },
    ],
    gen: (_n, r) => [r.int(1, 30), r.int(1, 30), r.int(0, 200)],
    stress: { runs: 300, maxN: 30 },
    perf: false,
  },
};
