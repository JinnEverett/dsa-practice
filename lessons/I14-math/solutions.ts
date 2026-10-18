// I14 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Nhắc lại bẫy TS: `number` là double → số nguyên chính xác tới 2⁵³ − 1 (9 007 199 254 740 991).
//   a * b với a, b ~ 10⁹ đã vượt 2⁵³ → làm tròn lặng lẽ, mod ra kết quả sai. Hai cách an toàn: BigInt hoặc nhân tách (mulMod).

// ─── Helper: nhân modulo an toàn, mod < 2³¹ ───
// Tách b = bh · 2¹⁶ + bl: a · bh < 2³¹ · 2¹⁵ = 2⁴⁶, (… % m) · 2¹⁶ < 2⁴⁷, a · bl < 2⁴⁷ → mọi bước < 2⁵³.
export function mulMod(a: number, b: number, m: number): number {
  const bh = Math.floor(b / 65536);
  const bl = b % 65536;
  return (((a * bh) % m) * 65536 + a * bl) % m;
}

// ─── ex01 · GCD của mảng ───
// Ý tưởng: gcd(a, b) = gcd(b, a mod b); gcd của mảng = gộp dần g = gcd(g, x). Dừng sớm khi g = 1.
// Độ phức tạp: O(n + log max) amortized — mỗi lần g thay đổi thì ít nhất giảm một nửa, nên tổng bước Euclid O(n + log max).
// Vì sao best practice: Euclid theo phép chia O(log); phép trừ (a −= b) hay thử chia từ min xuống 1 sẽ O(max) = 10⁹.
// Bẫy: gcd(0, x) = x nên khởi tạo g = 0 là an toàn. Java `int` đủ (mod không làm tăng giá trị).
// Cách khác: gcd nhị phân (Stein) dùng dịch bit; lcm = a / gcd · b (chia trước khi nhân để khỏi tràn).
// Python/Java: Python `math.gcd(*nums)` (3.9+) / `functools.reduce(math.gcd, nums)`; Java không có gcd cho int → tự viết (BigInteger.gcd chậm).
export function gcdOfArray(nums: number[]): number {
  let g = 0;
  for (const x of nums) {
    let a = g;
    let b = x;
    while (b !== 0) {
      const t = a % b;
      a = b;
      b = t;
    }
    g = a;
    if (g === 1) break;
  }
  return g;
}

// ─── ex02 · Đếm số nguyên tố < n (sàng Eratosthenes) ───
// Ý tưởng: giữ mảng đánh dấu hợp số; với mỗi số nguyên tố p ≤ √n, đánh dấu p², p² + p, … là hợp số
//          (bắt đầu từ p² vì bội nhỏ hơn đã bị số nguyên tố nhỏ hơn đánh dấu).
// Độ phức tạp: O(n log log n) thời gian, O(n) bộ nhớ (Uint8Array: 5 MB cho n = 5·10⁶).
// Vì sao best practice: thử chia từng số tới √k là O(n√n / log n) — hàng chục lần chậm hơn ở n = 5·10⁶.
// Bẫy: n ≤ 2 → 0; `new Array(n).fill(true)` tốn 8 byte/ô, dùng Uint8Array; vòng ngoài chỉ chạy tới i·i < n.
// Cách khác: sàng tuyến tính O(n); sàng phân đoạn khi n lớn hơn bộ nhớ (segmented sieve).
// Python/Java: Python `bytearray` + gán lát cắt `s[i*i::i] = bytes(len(...))` (nhanh hơn vòng lặp ~30×); Java `boolean[]`/`BitSet`.
export function countPrimes(n: number): number {
  if (n < 3) return 0;
  const composite = new Uint8Array(n);
  let count = 0;
  for (let i = 2; i < n; i++) {
    if (composite[i] === 0) {
      count++;
      for (let j = i * i; j < n; j += i) composite[j] = 1;
    }
  }
  return count;
}

// ─── ex03 · Lũy thừa nhanh theo modulo ───
// Ý tưởng: exp = Σ bit_i · 2^i ⇒ base^exp = Π base^(2^i) (chỉ những bit i bật). Bình phương dần, nhân khi bit bật.
// Độ phức tạp: O(log exp) phép nhân modulo (≤ 53 vòng ở đây).
// Vì sao best practice: lặp exp lần là O(exp) = 9·10¹⁵ — không bao giờ xong.
// Bẫy: (1) a · b ~ 2⁶² vượt 2⁵³ → dùng mulMod (hoặc BigInt). (2) exp tới 2⁵³: `exp >>= 1` hay `exp & 1` chỉ nhìn 32 bit → dùng
//      `exp % 2` và `Math.floor(exp / 2)` (chia 2 chính xác với double). (3) mod = 1 → kết quả 0, kể cả exp = 0. (4) base phải `% mod` trước.
// Cách khác: BigInt (đúng nhưng chậm hơn ~10–50 lần); đệ quy pow(b, e/2)².
// Python/Java: Python `pow(base, exp, mod)` có sẵn; Java `long` đủ vì mod < 2³¹ ⇒ tích < 2⁶² < 2⁶³.
export function modPow(base: number, exp: number, mod: number): number {
  let result = 1 % mod;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) result = mulMod(result, b, mod);
    b = mulMod(b, b, mod);
    e = Math.floor(e / 2);
  }
  return result;
}

// ─── ex04 · Tổ hợp C(n, r) mod 10⁹+7 cho nhiều truy vấn ───
// Ý tưởng: C(n, r) = n! · inv(r!) · inv((n−r)!) (mod p). Tiền xử lý giai thừa và nghịch đảo giai thừa tới max n một lần:
//          inv(N!) = (N!)^(p−2) theo Fermat (p nguyên tố), rồi inv((k−1)!) = inv(k!) · k đi ngược xuống.
// Độ phức tạp: O(N + q) thời gian (N = max n, q = số truy vấn), O(N) bộ nhớ; mỗi truy vấn O(1).
// Vì sao best practice: tính giai thừa/tích r số cho từng truy vấn là O(q · N) = 10¹¹ ở giới hạn đề.
// Bẫy: (1) tích hai số ~ 10⁹ vượt 2⁵³ → mulMod. (2) Java `a * b % MOD` với `int` tràn → ép `long`. (3) chỉ có nghịch đảo khi mod nguyên tố
//      (p = 10⁹+7 thì n! không chia hết cho p vì n < p). (4) không bao giờ chia số nguyên trước khi mod.
// Cách khác: tam giác Pascal O(n²) (chỉ được khi n ≤ 5 000); nghịch đảo từng số bằng modPow (thêm hệ số log).
// Python/Java: Python `pow(x, -1, p)` (3.8+) hoặc `pow(x, p − 2, p)`, không lo tràn; Java `long` + `% MOD` sau mỗi phép nhân.
export function nCrMod(queries: number[][]): number[] {
  const MOD = 1_000_000_007;
  let maxN = 0;
  for (const [n] of queries) if (n > maxN) maxN = n;
  const fact = new Array<number>(maxN + 1);
  fact[0] = 1;
  for (let i = 1; i <= maxN; i++) fact[i] = mulMod(fact[i - 1], i, MOD);
  const inv = new Array<number>(maxN + 1);
  inv[maxN] = modPow(fact[maxN], MOD - 2, MOD);
  for (let i = maxN; i >= 1; i--) inv[i - 1] = mulMod(inv[i], i, MOD);
  return queries.map(([n, r]) => mulMod(mulMod(fact[n], inv[r], MOD), inv[n - r], MOD));
}

// ─── ex05 · Số happy ───
// Ý tưởng: dãy "tổng bình phương các chữ số" hoặc về 1 hoặc rơi vào chu trình → phát hiện chu trình bằng Floyd (chậm/nhanh).
// Độ phức tạp: O(log n) bước đầu rồi giá trị ≤ 810 (9 chữ số · 81) → O(1) bộ nhớ với Floyd.
// Vì sao best practice: không cần Set; cùng khuôn "phát hiện chu trình" như linked list (F11).
// Bẫy: n tới 2³¹ − 1: tổng bình phương một số 10 chữ số ≤ 810 nên dãy luôn bị chặn → chu trình chắc chắn xảy ra.
// Cách khác: Set các giá trị đã thấy; hoặc biết chu trình duy nhất là 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4, dừng khi gặp 4.
// Python/Java: dùng `divmod` / `% 10` và `/ 10`; Java int đủ.
export function isHappy(n: number): boolean {
  const next = (x: number): number => {
    let s = 0;
    while (x > 0) {
      const d = x % 10;
      s += d * d;
      x = (x - d) / 10;
    }
    return s;
  };
  let slow = n;
  let fast = next(n);
  while (fast !== 1 && slow !== fast) {
    slow = next(slow);
    fast = next(next(fast));
  }
  return fast === 1;
}

// ─── ex06 · Đổi cơ số ───
// Ý tưởng: lặp lấy `n mod base` làm chữ số thấp nhất, rồi `n ← (n − d) / base`; đảo chuỗi ở cuối. Số âm: xử lý dấu '-' riêng.
// Độ phức tạp: O(log_base |n|).
// Vì sao best practice: không dùng `n / base` thô — với n ~ 2⁵³, phép chia double làm tròn có thể sai 1 đơn vị; `(n − d) / base` luôn chia hết nên chính xác.
// Bẫy: n = 0 → "0"; chữ số ≥ 10 dùng chữ thường a–z; `%` của số âm trong TS/Java/C cho kết quả âm (Python cho dương) → lấy |n| trước.
// Cách khác: `n.toString(base)` (TS, đúng tới 2⁵³), `Long.toString(n, base)` (Java), `numpy.base_repr`; BigInt khi vượt 2⁵³.
// Python/Java: Python không có hàm sẵn cho base bất kỳ → tự viết bằng `divmod`; Java `Long.toString(num, base)` (lowercase) có sẵn.
export function toBase(num: number, base: number): string {
  if (num === 0) return '0';
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz';
  const neg = num < 0;
  let n = Math.abs(num);
  const out: string[] = [];
  while (n > 0) {
    const d = n % base;
    out.push(digits[d]);
    n = (n - d) / base;
  }
  if (neg) out.push('-');
  return out.reverse().join('');
}

// ─── ex07 · Số chữ số 0 cuối của n! ───
// Ý tưởng: mỗi chữ số 0 cuối ứng với một thừa số 10 = 2 · 5; thừa số 2 luôn dư → đếm số thừa số 5 trong n!:
//          ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + … (Legendre).
// Độ phức tạp: O(log₅ n).
// Vì sao best practice: duyệt 1..n và chia 5 từng số là O(n) = 2·10⁹ ở giới hạn đề; tính n! thì vô vọng.
// Bẫy: `n /= 5` giữ phần thập phân trong TS → dùng Math.floor (hoặc `(n / 5) | 0` vì n < 2³¹); đừng cộng ⌊n/5^k⌋ với 5^k tràn int Java (chia dần n thay vì tính lũy thừa).
// Cách khác: cộng ⌊n / 5^k⌋ với 5^k tính trước (cẩn thận 5^k tràn int trong Java); đếm số 5 trong từng 1..n (O(n)).
// Python/Java: Python `n //= 5`; Java `n /= 5` (chia nguyên).
export function trailingZeroes(n: number): number {
  let count = 0;
  while (n > 0) {
    n = Math.floor(n / 5);
    count += n;
  }
  return count;
}

// ─── ex08 · Phân số → số thập phân ───
// Ý tưởng: mô phỏng phép chia tay. Phần dư lặp lại ⇒ chu kỳ: dùng Map<dư, vị trí chữ số> để chèn '(' tại lần đầu thấy dư đó.
// Độ phức tạp: O(độ dài kết quả) — đề bảo đảm < 10⁴.
// Vì sao best practice: một lượt, không cần phân tích 2/5 hay bậc của 10 mod mẫu.
// Bẫy: (1) dấu: âm khi hai số khác dấu và tử ≠ 0. (2) −2³¹ / −1 = 2³¹ vượt int → Java/C++ dùng `long`, lấy trị tuyệt đối bằng `long`. (3) tử = 0 → "0"
//      (không "-0"). (4) khóa Map là phần DƯ chứ không phải chữ số. (5) `r * 10` tới 2³⁵ → `long` trong Java.
// Cách khác: phân tích mẫu = 2^a · 5^b · m: tiền chu kỳ max(a, b), chu kỳ = bậc của 10 modulo m.
// Python/Java: Python `divmod`, int vô hạn; Java dùng `long` cho tử/mẫu/dư, `StringBuilder`, `HashMap<Long, Integer>`.
export function fractionToDecimal(numerator: number, denominator: number): string {
  if (numerator === 0) return '0';
  const neg = numerator < 0 !== denominator < 0;
  const a = Math.abs(numerator);
  const b = Math.abs(denominator);
  let out = (neg ? '-' : '') + Math.floor(a / b);
  let r = a % b;
  if (r === 0) return out;
  out += '.';
  const seen = new Map<number, number>();
  const digits: string[] = [];
  while (r !== 0 && !seen.has(r)) {
    seen.set(r, digits.length);
    r *= 10;
    digits.push(String(Math.floor(r / b)));
    r %= b;
  }
  if (r !== 0) {
    const at = seen.get(r)!;
    return out + digits.slice(0, at).join('') + '(' + digits.slice(at).join('') + ')';
  }
  return out + digits.join('');
}

// ─── ex09 · 🔴 Luhn ───
// Ý tưởng: bỏ dấu cách và '-'; từ PHẢI sang TRÁI, nhân đôi mỗi chữ số ở vị trí thứ 2, 4, … ; nếu > 9 thì trừ 9 (= cộng hai chữ số);
//          tổng chia hết cho 10 ⇒ hợp lệ.
// Độ phức tạp: O(L) thời gian, O(1) bộ nhớ (ngoài bản sao khi lọc ký tự).
// Vì sao best practice: một lượt, đi từ phải nên không cần biết độ dài trước (stream được).
// Bẫy: (1) đi từ trái sang mà quên tính chẵn/lẻ theo độ dài → sai ở độ dài lẻ. (2) ký tự lạ (chữ, '.') ⇒ false, không bỏ qua.
//      (3) dưới 2 chữ số ⇒ false. (4) so sánh `c >= '0' && c <= '9'`, đừng dùng `parseInt` (nhận cả "1e3", "0x…").
// Cách khác: bảng tra cho chữ số được nhân đôi `[0,2,4,6,8,1,3,5,7,9]`.
// Python/Java: Python `ch.isdigit()` nhận cả chữ số Unicode (vd. '٣') → so `'0' <= ch <= '9'`; Java `Character.isDigit` cũng nhận Unicode → so `c >= '0' && c <= '9'`.
export function luhnValid(number: string): boolean {
  let sum = 0;
  let digits = 0;
  for (let i = number.length - 1; i >= 0; i--) {
    const c = number.charCodeAt(i);
    if (c === 32 || c === 45) continue; // ' ' và '-'
    if (c < 48 || c > 57) return false;
    let d = c - 48;
    if (digits % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    digits++;
  }
  return digits >= 2 && sum % 10 === 0;
}

// ─── ex10 · 🔴 Hai cron trùng nhau ───
// Ý tưởng: thời điểm cả hai cùng chạy là bội của lcm(a, b) = a / gcd(a, b) · b. Tìm bội nhỏ nhất của L không nhỏ hơn t:
//          nếu t mod L = 0 thì t, ngược lại t + (L − t mod L).
// Độ phức tạp: O(log min(a, b)) cho gcd.
// Vì sao best practice: mô phỏng từng phút tới đáp án là O(L) = 10¹⁴ bước.
// Bẫy: (1) `a * b / g` tính trước khi chia có thể tràn (đề giới hạn a, b ≤ 10⁷ nên chưa tràn; ngoài đề nên chia `a / g` trước).
//      (2) t chia hết cho L thì trả t chứ không phải t + L (ngày 0 và `t = 0` đều hợp lệ). (3) Java `long` bắt buộc cho t ~ 10¹⁵.
// Cách khác: `Math.ceil(t / L) * L` (đúng khi t < 2⁵³ nhưng dễ sai khi quên làm tròn; ưu tiên dùng `%`).
// Python/Java: Python `math.lcm(a, b)` (3.9+) và `-(-t // L) * L`; Java tự viết gcd, dùng `long`.
export function nextCollision(a: number, b: number, t: number): number {
  let x = a;
  let y = b;
  while (y !== 0) {
    const r = x % y;
    x = y;
    y = r;
  }
  const lcm = (a / x) * b;
  const rem = t % lcm;
  return rem === 0 ? t : t + (lcm - rem);
}
