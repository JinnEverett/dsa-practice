// A09 · Đáp án best practice. Chỉ mở sau khi check ✅.

const codes = (s: string): Uint16Array => {
  const a = new Uint16Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
};

/** π trên mảng mã ký tự. */
function piOf(a: ArrayLike<number>): Int32Array {
  const n = a.length;
  const pi = new Int32Array(n);
  for (let i = 1, k = 0; i < n; i++) {
    while (k > 0 && a[i] !== a[k]) k = pi[k - 1];
    if (a[i] === a[k]) k++;
    pi[i] = k;
  }
  return pi;
}

// ─── ex01 · Tìm chuỗi con (KMP) ───
// Ý tưởng: π của needle; quét haystack giữ k = độ dài đang khớp; k === |needle| ⇒ xong, trả về i − |needle| + 1.
// Độ phức tạp: O(n + m) time · O(m) space. Thô O(n·m) (10¹¹ ở test lớn).
// Bẫy: không quay lui `i` — chỉ thụt `k` qua π. Python/Java: dùng `str.find` / `indexOf` cho đời thường (thường nhanh, nhưng không đảm bảo O(n+m)).
export function strStr(haystack: string, needle: string): number {
  const h = codes(haystack);
  const p = codes(needle);
  const pi = piOf(p);
  for (let i = 0, k = 0; i < h.length; i++) {
    while (k > 0 && h[i] !== p[k]) k = pi[k - 1];
    if (h[i] === p[k]) k++;
    if (k === p.length) return i - k + 1;
  }
  return -1;
}

// ─── ex02 · Prefix function ───
// Ý tưởng: xem README §2. k tăng ≤ 1 mỗi bước, mỗi vòng while giảm k ⇒ tổng O(n) (amortized).
// Độ phức tạp: O(n) time · O(n) space.
export function prefixFunction(s: string): number[] {
  return Array.from(piOf(codes(s)));
}

// ─── ex03 · Z-function ───
// Ý tưởng: giữ cửa sổ [l, r) khớp tiền tố xa nhất. i < r ⇒ z[i] ≥ min(r − i, z[i − l]); rồi mở rộng thủ công và cập nhật cửa sổ. z[0] = n.
// Độ phức tạp: O(n) time · O(n) space.
export function zFunction(s: string): number[] {
  const a = codes(s);
  const n = a.length;
  const z = new Int32Array(n);
  if (n === 0) return [];
  z[0] = n;
  for (let i = 1, l = 0, r = 0; i < n; i++) {
    if (i < r) z[i] = Math.min(r - i, z[i - l]);
    while (i + z[i] < n && a[z[i]] === a[i + z[i]]) z[i]++;
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
    }
  }
  return Array.from(z);
}

// ─── ex04 · Chuỗi lặp ───
// Ý tưởng: p = n − π[n−1] là chu kỳ nhỏ nhất; s lặp ⇔ π[n−1] > 0 và n % p === 0.
// Độ phức tạp: O(n) time · O(n) space. Cách khác: (s + s).indexOf(s, 1) < n (đúng, nhưng phụ thuộc cài đặt indexOf).
export function repeatedSubstringPattern(s: string): boolean {
  const n = s.length;
  const pi = piOf(codes(s));
  const k = pi[n - 1];
  return k > 0 && n % (n - k) === 0;
}

// ─── ex05 · Palindrome ngắn nhất bằng cách thêm vào đầu ───
// Ý tưởng: tìm palindrome tiền tố dài nhất L = π cuối của s + '#' + reverse(s); đáp án = reverse(s[L..]) + s.
// Độ phức tạp: O(n) time · O(n) space. Thử từng tiền tố rồi kiểm tra palindrome: O(n²).
// Bẫy: ký tự phân cách phải không thuộc bảng chữ cái (đề: chữ thường ⇒ dùng '#'); chuỗi rỗng.
export function shortestPalindrome(s: string): string {
  const n = s.length;
  if (n === 0) return '';
  const t = new Uint16Array(2 * n + 1);
  for (let i = 0; i < n; i++) {
    t[i] = s.charCodeAt(i);
    t[n + 1 + i] = s.charCodeAt(n - 1 - i);
  }
  t[n] = 35; // '#'
  const L = piOf(t)[2 * n];
  let head = '';
  const parts: string[] = [];
  for (let i = n - 1; i >= L; i--) parts.push(s[i]);
  head = parts.join('');
  return head + s;
}

// ─── Rolling hash dùng chung cho ex06, ex08 ───
const M = 1_000_000_007;
const B = 911_382_323 % M;
/** Nhân mod M an toàn trong double (a, b < 2³⁰). */
const mulmod = (a: number, b: number): number => (((a * (b >>> 15)) % M) * 32768 + a * (b & 32767)) % M;

class Hasher {
  readonly h: Int32Array;
  private pw: Int32Array;
  constructor(a: ArrayLike<number>, pw: Int32Array) {
    this.pw = pw;
    this.h = new Int32Array(a.length + 1);
    for (let i = 0; i < a.length; i++) this.h[i + 1] = (mulmod(this.h[i], B) + a[i]) % M;
  }
  /** hash của a[l..r) */
  get(l: number, r: number): number {
    const v = (this.h[r] - mulmod(this.h[l], this.pw[r - l])) % M;
    return v < 0 ? v + M : v;
  }
}
const powers = (n: number): Int32Array => {
  const pw = new Int32Array(n + 1);
  pw[0] = 1;
  for (let i = 1; i <= n; i++) pw[i] = mulmod(pw[i - 1], B);
  return pw;
};

// ─── ex06 · Chuỗi con lặp dài nhất ───
// Ý tưởng: độ dài L có chuỗi con xuất hiện ≥ 2 lần ⇒ mọi L' < L cũng có (đơn điệu) ⇒ binary search L; mỗi bước băm mọi đoạn dài L,
//   gặp hash trùng thì KIỂM CHỨNG bằng so sánh thật (va chạm không làm sai kết quả).
// Độ phức tạp: O(n log n) kỳ vọng · O(n) space.
// Bẫy: JS nhân mod 10⁹ phải qua mulmod; trừ mod ra âm; nhiều đáp án hợp lệ ⇒ bài dùng compare.
export function longestDupSubstring(s: string): string {
  const n = s.length;
  const a = codes(s);
  const hs = new Hasher(a, powers(n));
  const find = (L: number): number => {
    const first = new Map<number, number>(); // hash -> vị trí đầu tiên
    let extra: Map<number, number[]> | undefined; // chỉ dùng khi hai đoạn KHÁC nhau trùng hash (hiếm)
    for (let i = 0; i + L <= n; i++) {
      const key = hs.get(i, i + L);
      const j = first.get(key);
      if (j === undefined) {
        first.set(key, i);
        continue;
      }
      const sub = s.slice(i, i + L);
      if (s.startsWith(sub, j)) return i;
      const others = extra?.get(key);
      if (others) {
        for (const o of others) if (s.startsWith(sub, o)) return i;
        others.push(i);
      } else (extra ??= new Map()).set(key, [i]); // va chạm thật: nhớ lại để so tiếp
    }
    return -1;
  };
  let lo = 0; // luôn có độ dài lo thỏa (0 thì tầm thường)
  let hi = n - 1;
  let at = -1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    const pos = find(mid);
    if (pos >= 0) {
      lo = mid;
      at = pos;
    } else hi = mid - 1;
  }
  return lo === 0 ? '' : s.slice(at, at + lo);
}

// ─── ex07 · 🔴 Tìm mọi vị trí khớp (kể cả chồng lấn) ───
// Ý tưởng: Z-function của pattern + '#' + text (hoặc KMP): vị trí i trong text khớp khi z[|pattern| + 1 + i] ≥ |pattern|.
// Độ phức tạp: O(n + m) time · O(n + m) space. Thô O(n·m).
// Bẫy: ký tự phân cách ngoài bảng chữ cái; kết quả có thể tới 10⁶ phần tử.
export function findAll(text: string, pattern: string): number[] {
  const m = pattern.length;
  const t = new Uint16Array(m + 1 + text.length);
  for (let i = 0; i < m; i++) t[i] = pattern.charCodeAt(i);
  t[m] = 35;
  for (let i = 0; i < text.length; i++) t[m + 1 + i] = text.charCodeAt(i);
  const n = t.length;
  const z = new Int32Array(n);
  const out: number[] = [];
  for (let i = 1, l = 0, r = 0; i < n; i++) {
    if (i < r) z[i] = Math.min(r - i, z[i - l]);
    while (i + z[i] < n && t[z[i]] === t[i + z[i]]) z[i]++;
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
    }
    if (i > m && z[i] === m) out.push(i - m - 1);
  }
  return out;
}

// ─── ex08 · 🔴 Chuỗi con chung dài nhất ───
// Ý tưởng: đơn điệu theo độ dài ⇒ binary search L; với L: băm mọi đoạn dài L của a vào Map, quét b tìm hash trùng + kiểm chứng.
// Độ phức tạp: O((n + m) log min(n, m)) kỳ vọng · O(n) space. DP O(n·m) = 10¹⁰ ở n = m = 10⁵.
export function longestCommonSubstring(a: string, b: string): number {
  const ca = codes(a);
  const cb = codes(b);
  const pw = powers(Math.max(ca.length, cb.length));
  const ha = new Hasher(ca, pw);
  const hb = new Hasher(cb, pw);
  const has = (L: number): boolean => {
    const first = new Map<number, number>();
    let extra: Map<number, number[]> | undefined;
    for (let i = 0; i + L <= ca.length; i++) {
      const key = ha.get(i, i + L);
      if (!first.has(key)) first.set(key, i);
      else {
        // hiếm: hai đoạn của a trùng hash; chỉ cần nhớ thêm nếu chúng KHÁC nhau
        const j = first.get(key)!;
        if (a.slice(i, i + L) !== a.slice(j, j + L)) (extra ??= new Map()).set(key, [...(extra.get(key) ?? []), i]);
      }
    }
    for (let j = 0; j + L <= cb.length; j++) {
      const key = hb.get(j, j + L);
      const i = first.get(key);
      if (i === undefined) continue;
      const sub = b.slice(j, j + L);
      if (a.startsWith(sub, i)) return true;
      for (const o of extra?.get(key) ?? []) if (a.startsWith(sub, o)) return true;
    }
    return false;
  };
  let lo = 0;
  let hi = Math.min(ca.length, cb.length);
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (has(mid)) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
