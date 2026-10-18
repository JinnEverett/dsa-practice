// I14 · Đáp án best practice. Chỉ mở sau khi check ✅.
// TS: `number` chính xác tới 2⁵³ − 1 ≈ 9,007·10¹⁵. Tích hai số ~10⁹ (≈ 10¹⁸) VƯỢT giới hạn đó ⇒ nhân modulo cần mulMod/BigInt.

const gcd = (a: number, b: number): number => {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
};

/**
 * ex01 · gcdOfArray
 * Ý tưởng: gcd kết hợp được: gcd(a, b, c) = gcd(gcd(a, b), c). Gộp dần; có thể dừng khi g = 1.
 * Độ phức tạp: O(n · log(max)) — Euclid mất O(log(min(a, b))) bước vì `a % b` ít nhất giảm một nửa sau hai bước.
 * Vì sao best practice: gcd lặp (không đệ quy), `a % b` thay vì trừ liên tiếp (trừ liên tiếp: gcd(10⁹, 1) mất 10⁹ bước).
 * Bẫy: gcd(0, x) = x (khởi tạo g = 0 là phần tử trung hòa); trừ liên tiếp quá chậm.
 * Cách khác: gcd nhị phân (Stein) dùng dịch bit; Python `math.gcd`, Java không có sẵn cho int (BigInteger.gcd hoặc tự cài).
 * Python/Java: Python `math.gcd(*nums)` (3.9+); Java tự cài Euclid.
 */
export function gcdOfArray(nums: number[]): number {
  let g = 0;
  for (const v of nums) {
    g = gcd(g, v);
    if (g === 1) return 1;
  }
  return g;
}

/**
 * ex02 · countPrimes
 * Ý tưởng: sàng Eratosthenes — đánh dấu hợp số: với mỗi số nguyên tố p ≤ √n, gạch các bội của p bắt đầu từ p² (bội nhỏ hơn đã bị số nguyên tố nhỏ
 *   hơn gạch).
 * Độ phức tạp: O(n log log n) thời gian, O(n) bộ nhớ (Uint8Array n byte).
 * Vì sao best practice: bắt đầu từ p·p và bước p; chỉ lặp p đến √n. Kiểm tra từng số bằng chia thử O(√n) mỗi số ⇒ O(n√n) — quá giờ ở n = 5·10⁶.
 * Bẫy: đếm số nguyên tố NHỎ HƠN n (không phải ≤ n); n < 3 ⇒ 0; `p * p` tràn int32 trong Java khi n ~ 2·10⁹ (ở đây n ≤ 5·10⁶ nên ổn).
 * Cách khác: sàng chỉ số lẻ (nửa bộ nhớ); sàng tuyến tính O(n).
 * Python/Java: Python `bytearray`, gán lát cắt `sieve[p*p::p] = bytes(len(range(p*p, n, p)))`; Java `boolean[]`.
 */
export function countPrimes(n: number): number {
  if (n < 3) return 0;
  const composite = new Uint8Array(n);
  let count = 0;
  for (let p = 2; p < n; p++) {
    if (composite[p]) continue;
    count++;
    if (p * p < n) for (let m = p * p; m < n; m += p) composite[m] = 1;
  }
  return count;
}

/** a·b mod m với 0 ≤ a, b < m ≤ 2³¹ — không vượt 2⁵³: tách b thành 16 bit cao/thấp. */
function mulMod(a: number, b: number, m: number): number {
  const hi = Math.floor(b / 65536);
  const lo = b % 65536;
  return (((a * hi) % m) * 65536 + a * lo) % m;
}

/**
 * ex03 · modPow
 * Ý tưởng: lũy thừa nhanh (bình phương liên tiếp): xét exp theo từng bit; nếu bit là 1 thì nhân kết quả với base hiện tại; base ← base² mỗi vòng.
 *   exp ≤ 2⁵³ ⇒ ≤ 53 vòng.
 * Độ phức tạp: O(log exp) phép nhân modulo.
 * Vì sao best practice: lặp theo exp / 2 (số học, không dùng `>>` vì exp > 2³¹); mỗi phép nhân dùng `mulMod` vì a·b có thể tới (2³¹)² = 2⁶² > 2⁵³.
 * Bẫy (2⁵³!): `(a * b) % mod` với a, b ~ 10⁹ cho kết quả SAI mà không báo lỗi; mod = 1 ⇒ 0; reduce base % mod trước khi nhân.
 * Cách khác: BigInt (`(a * b) % m` đúng nhưng chậm hơn ~10×); Montgomery (nâng cao). Java `long` đủ cho mod < 2³¹ (tích < 2⁶² < 2⁶³).
 * Python/Java: Python `pow(base, exp, mod)` có sẵn; Java `BigInteger.modPow` hoặc tự cài với `long`.
 */
export function modPow(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0;
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) result = mulMod(result, b, mod);
    b = mulMod(b, b, mod);
    e = Math.floor(e / 2);
  }
  return result;
}

const P = 1_000_000_007;

/**
 * ex04 · nCrMod
 * Ý tưởng: C(n, r) = n·(n−1)·…·(n−r+1) / r!. Tử số và r! đều mod P; chia mod P = nhân với NGHỊCH ĐẢO mod P của r!, tính bằng định lý Fermat nhỏ:
 *   a^(P−2) ≡ a⁻¹ (mod P) với P nguyên tố và P ∤ a (n ≤ 10⁶ < P nên r! không chia hết cho P).
 * Độ phức tạp: O(min(r, n − r)) + O(log P).
 * Vì sao best practice: dùng đối xứng C(n, r) = C(n, n − r) để chọn r nhỏ; không dựng cả bảng giai thừa.
 * Bẫy: chia số nguyên thường sau khi đã mod (SAI: (a % P) / (b % P)); tích hai số ~10⁹ cần `mulMod` (2⁵³); tam giác Pascal O(n·r) quá chậm.
 * Cách khác: tiền xử lý giai thừa + nghịch đảo giai thừa cho nhiều truy vấn; tam giác Pascal chỉ cho n nhỏ.
 * Python/Java: Python `pow(x, P − 2, P)`; Java `long` với `% P` sau mỗi phép nhân.
 */
export function nCrMod(n: number, r: number): number {
  r = Math.min(r, n - r);
  let num = 1;
  let den = 1;
  for (let i = 0; i < r; i++) {
    num = mulMod(num, (n - i) % P, P);
    den = mulMod(den, i + 1, P);
  }
  return mulMod(num, modPow(den, P - 2, P), P);
}

/**
 * ex05 · isHappy
 * Ý tưởng: lặp "thay n bằng tổng bình phương các chữ số". Hoặc về 1 (vui vẻ) hoặc rơi vào một chu trình. Phát hiện chu trình bằng Floyd
 *   (rùa–thỏ) hoặc tập đã gặp.
 * Độ phức tạp: sau bước đầu số ≤ 9²·10 = 810 nên chu trình rất ngắn: O(log n) cho bước đầu + hằng số.
 * Vì sao best practice: Floyd dùng O(1) bộ nhớ; không cần Set.
 * Bẫy: chu trình luôn chứa số 4 (4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4) — nhưng không nên hard-code; không dừng khi n < 10 (7 → 49 → ... → 1).
 * Cách khác: Set các số đã thấy; hard-code chu trình chứa 4.
 * Python/Java: tách chữ số bằng `divmod`/`% 10`.
 */
export function isHappy(n: number): boolean {
  const step = (x: number) => {
    let s = 0;
    while (x > 0) {
      const d = x % 10;
      s += d * d;
      x = Math.floor(x / 10);
    }
    return s;
  };
  let slow = n;
  let fast = step(n);
  while (fast !== 1 && slow !== fast) {
    slow = step(slow);
    fast = step(step(fast));
  }
  return fast === 1;
}

/**
 * ex06 · toBase
 * Ý tưởng: chia liên tiếp cho base, thu số dư làm chữ số từ thấp lên cao, rồi đảo; số âm: xử lý giá trị tuyệt đối và thêm '-'.
 * Độ phức tạp: O(log_base |num|).
 * Vì sao best practice: bảng chữ số "0123456789abcdefghijklmnopqrstuvwxyz"; dùng `% ` và `Math.floor(/)` thay vì `>>` vì |num| tới 2⁵³.
 * Bẫy: num = 0 ⇒ "0" (vòng lặp không chạy); num = Long.MIN_VALUE ở Java (`Math.abs` tràn) — ở đây |num| ≤ 2⁵³ − 1 nên không gặp; chữ cái viết thường.
 * Cách khác: đệ quy; thư viện `Number.prototype.toString(base)`, Python `numpy.base_repr`, Java `Long.toString(num, base)` (chỉ để so sánh, không dùng khi luyện).
 * Python/Java: Python `divmod`; Java `StringBuilder.reverse()`.
 */
export function toBase(num: number, base: number): string {
  if (num === 0) return '0';
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz';
  let x = Math.abs(num);
  let out = '';
  while (x > 0) {
    out = digits[x % base] + out;
    x = Math.floor(x / base);
  }
  return num < 0 ? '-' + out : out;
}

/**
 * ex07 · trailingZeroes
 * Ý tưởng: chữ số 0 cuối của n! = số cặp (2, 5) trong phân tích thừa số = số thừa số 5 (luôn có nhiều thừa số 2 hơn). Số lần 5 xuất hiện trong n! =
 *   ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + … (công thức Legendre).
 * Độ phức tạp: O(log₅ n).
 * Vì sao best practice: không bao giờ tính n! (có hàng tỉ chữ số); đếm trực tiếp số lần xuất hiện của thừa số 5.
 * Bẫy: chỉ cộng ⌊n/5⌋ (thiếu 25 = 5² đóng góp 2 thừa số 5); duyệt từng số từ 1 đến n ở n = 2³¹ − 1 mất ~2·10⁹ bước.
 * Cách khác: lặp `n = ⌊n/5⌋; count += n`.
 * Python/Java: Java `int`: `n / 5` nguyên; tổng ≤ n/4 ≈ 5,4·10⁸ vừa int.
 */
export function trailingZeroes(n: number): number {
  let count = 0;
  while (n >= 5) {
    n = Math.floor(n / 5);
    count += n;
  }
  return count;
}

/**
 * ex08 · fractionToDecimal
 * Ý tưởng: chia tay. Phần nguyên = ⌊|a| / |b|⌋; sau đó lặp: nhân dư với 10, chữ số = ⌊dư·10 / |b|⌋, dư mới = dư·10 mod |b|. Nếu dư lặp lại một giá trị đã
 *   gặp thì từ vị trí gặp trước đó là phần tuần hoàn → bao bằng ngoặc.
 * Độ phức tạp: O(|b|) số chữ số tối đa (số dư khác nhau < |b|).
 * Vì sao best practice: Map dư → vị trí chữ số để chèn '(' đúng chỗ; dùng giá trị tuyệt đối và ghi dấu '-' riêng.
 * Bẫy: −2³¹ / −1 = 2³¹ tràn int (Java dùng `long`); dấu âm khi tử âm hoặc mẫu âm (không phải cả hai); numerator = 0 ⇒ "0" (không "-0");
 *   chia hết ⇒ không có dấu '.'.
 * Cách khác: lưu chuỗi và `indexOf` dư (chậm).
 * Python/Java: Python `divmod` dùng số nguyên vô hạn; Java ép sang `long` trước khi lấy `Math.abs`.
 */
export function fractionToDecimal(numerator: number, denominator: number): string {
  if (numerator === 0) return '0';
  const neg = numerator < 0 !== denominator < 0;
  const a = Math.abs(numerator);
  const b = Math.abs(denominator);
  let out = (neg ? '-' : '') + Math.floor(a / b);
  let rem = a % b;
  if (rem === 0) return out;
  out += '.';
  const seen = new Map<number, number>();
  const digits: string[] = [];
  while (rem !== 0 && !seen.has(rem)) {
    seen.set(rem, digits.length);
    rem *= 10;
    digits.push(String(Math.floor(rem / b)));
    rem %= b;
  }
  if (rem === 0) return out + digits.join('');
  const at = seen.get(rem)!;
  return out + digits.slice(0, at).join('') + '(' + digits.slice(at).join('') + ')';
}

/**
 * ex09 · luhnValid
 * Ý tưởng: duyệt chữ số từ PHẢI sang trái; chữ số ở vị trí thứ 2, 4, 6… tính từ phải được nhân đôi (nếu > 9 thì trừ 9); tổng chia hết cho 10 thì hợp lệ.
 * Độ phức tạp: O(L), O(1) bộ nhớ.
 * Vì sao best practice: một lượt, không đảo chuỗi, không cắt chuỗi con. Luhn bắt lỗi gõ nhầm một chữ số và hầu hết lỗi đảo hai chữ số liền nhau.
 * Bẫy: bắt đầu nhân đôi từ chữ số THỨ HAI tính từ phải (không phải chữ số cuối); chữ số ngoài 0–9 ⇒ không hợp lệ (đề bảo đảm chỉ có chữ số);
 *   chuỗi dài 10⁶ — không dùng `slice` trong vòng lặp (O(n²)).
 * Cách khác: bảng tra cho chữ số nhân đôi [0,2,4,6,8,1,3,5,7,9].
 * Python/Java: Python `int(ch)`; Java `s.charAt(i) - '0'`.
 */
export function luhnValid(number: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let d = number.charCodeAt(i) - 48;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

/**
 * ex10 · nextCollision
 * Ý tưởng: hai cron chạy cùng lúc đúng tại bội chung của a và b, tức bội của lcm(a, b) = a / gcd(a, b) · b. Lần trùng đầu tiên ≥ t là ⌈t / L⌉ · L.
 * Độ phức tạp: O(log min(a, b)).
 * Vì sao best practice: tính `a / gcd * b` (chia trước nhân) để số trung gian không phình ra; không mô phỏng từng phút (t tới 10¹⁵).
 * Bẫy: `a * b / gcd` có thể tràn (Java `int` hoặc TS vượt 2⁵³ với a, b ~10⁹; ở đây a, b ≤ 10⁷ nhưng giữ thói quen chia trước); t = 0 ⇒ 0
 *   (cả hai chạy lúc 0); `Math.ceil(t / L)` mất chính xác khi t ~10¹⁵ ⇒ dùng `Math.floor((t + L − 1) / L)` hoặc số học nguyên.
 * Cách khác: BigInt khi a, b lớn hơn.
 * Python/Java: Java `long`; Python int vô hạn.
 */
export function nextCollision(a: number, b: number, t: number): number {
  const L = (a / gcd(a, b)) * b;
  const k = t % L === 0 ? t / L : Math.floor(t / L) + 1;
  return k * L;
}
