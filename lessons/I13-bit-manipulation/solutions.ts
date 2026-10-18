// I13 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Nhắc: toán tử bit của JS ép toán hạng về int32 CÓ DẤU (modulo 2³²). Số ≥ 2³¹ hoặc ≥ 2³² cần xử lý riêng; `>>> 0` đưa kết quả về không dấu.

/**
 * ex01 · singleNumber
 * Ý tưởng: XOR mọi phần tử. a ^ a = 0, a ^ 0 = a, XOR giao hoán/kết hợp ⇒ các cặp triệt tiêu, còn lại số xuất hiện một lần.
 * Độ phức tạp: O(n) thời gian, O(1) bộ nhớ (so với Set/Map: O(n) bộ nhớ).
 * Vì sao best practice: không cần bảng băm; không tràn vì XOR không tăng bit.
 * Bẫy: dùng tổng (2·sum(set) − sum(all)) cần `long` cho n lớn; XOR giữ nguyên số âm đúng dấu (kết quả int32).
 * Cách khác: sort rồi so từng cặp (O(n log n)); HashMap đếm.
 * Python/Java: Python `functools.reduce(operator.xor, nums)`; số âm trong Python vẫn đúng (vô hạn bit dấu).
 */
export function singleNumber(nums: number[]): number {
  let x = 0;
  for (const v of nums) x ^= v;
  return x;
}

/**
 * ex02 · hammingWeight
 * Ý tưởng: Brian Kernighan — `x &= x − 1` xóa bit 1 thấp nhất; đếm số lần lặp cho đến khi x = 0. n ∈ [0, 2³²) nên đưa về int32 trước
 *   (`n | 0`): mẫu bit không đổi, nên đếm số bit 1 của int32 (cả khi nó âm) cho kết quả đúng.
 * Độ phức tạp: O(số bit 1) ≤ 32.
 * Vì sao best practice: lặp theo số bit 1 chứ không theo 32 vị trí. `n | 0` giữ nguyên 32 bit thấp — an toàn cho mọi n < 2³².
 * Bẫy: `n >> 1` trên số ≥ 2³¹ cho giá trị ÂM (dịch có dấu) ⇒ vòng `while (n > 0)` dừng sớm hoặc lặp vô hạn; dùng `>>>` nếu dịch từng bit.
 * Cách khác: bảng đếm 8 bit; tính song song (SWAR); Java `Long.bitCount`/`Integer.bitCount`, Python `int.bit_count()` (3.10+) / `bin(n).count('1')`.
 * Python/Java: Java `n` là `long` — nhớ `n & (n − 1)` trên long, không ép int nếu n ≥ 2³¹ (hoặc dùng `Long.bitCount`).
 */
export function hammingWeight(n: number): number {
  let x = n | 0;
  let count = 0;
  while (x !== 0) {
    x &= x - 1; // xóa bit 1 thấp nhất
    count++;
  }
  return count;
}

/**
 * ex03 · countBits
 * Ý tưởng: DP trên bit: ans[i] = ans[i >> 1] + (i & 1) — số bit 1 của i = của i bỏ bit cuối, cộng bit cuối đó.
 * Độ phức tạp: O(n) thời gian và bộ nhớ (đầu ra đã là n + 1 phần tử).
 * Vì sao best practice: tái sử dụng kết quả nhỏ hơn, không đếm lại từng số O(n log n).
 * Bẫy: kích thước n + 1 (gồm cả 0); `i >> 1` đúng vì i ≥ 0 nhỏ.
 * Cách khác: ans[i] = ans[i & (i − 1)] + 1 (xóa bit thấp nhất).
 * Python/Java: Java `int[]`; Python `[0] * (n + 1)`.
 */
export function countBits(n: number): number[] {
  const ans = new Int32Array(n + 1);
  for (let i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
  return Array.from(ans);
}

/**
 * ex04 · isPowerOfTwo (n lên tới 2⁵³ − 1)
 * Ý tưởng: lũy thừa của 2 ⇔ n > 0 và đúng một bit 1 ⇔ n & (n − 1) = 0. Nhưng toán tử bit của JS CHỈ thấy 32 bit thấp của n,
 *   nên với n ≥ 2³² phải tách n thành hai nửa 32 bit: hi = ⌊n / 2³²⌋, lo = n mod 2³²; chỉ đúng khi MỘT nửa bằng 0 và nửa kia là lũy thừa của 2.
 * Độ phức tạp: O(1).
 * Vì sao best practice: chính xác với mọi n < 2⁵³ mà không dùng BigInt; chỉ ra lỗi im lặng của `n & (n − 1)` khi n > 2³² (2³² + 1 → "true" sai).
 * Bẫy: `n & (n − 1) === 0` đúng với n < 2³¹ nhưng SAI khi n ≥ 2³² (vd. 2⁴⁰ + 8 bị coi là lũy thừa của 2); n ≤ 0 → false.
 * Cách khác: `BigInt(n)`; vòng chia 2 (≤ 53 lần); `Math.log2` (rủi ro sai số).
 * Python/Java: Python `n > 0 and n & (n − 1) == 0`; Java `n > 0 && (n & (n − 1)) == 0L` trên `long` — không ép int.
 */
export function isPowerOfTwo(n: number): boolean {
  if (n <= 0) return false;
  const p32 = (x: number) => x > 0 && (x & (x - 1)) === 0; // x < 2³²: các bit 32 thấp không bị mất
  const hi = Math.floor(n / 4294967296);
  const lo = n - hi * 4294967296;
  return hi === 0 ? p32(lo) : lo === 0 && p32(hi);
}

/**
 * ex05 · reverseBits
 * Ý tưởng: lặp 32 lần: dịch kết quả sang trái 1 bit, nối bit thấp nhất của n vào, rồi dịch n sang phải (KHÔNG DẤU).
 * Độ phức tạp: O(32).
 * Vì sao best practice: kết quả cuối cùng `>>> 0` để đưa về số không dấu — nếu bit 31 của kết quả là 1 (vd. đảo của n = 1), int32 sẽ ÂM.
 * Bẫy: `result << 1` rồi `| bit` cho số âm ở lượt cuối; quên `>>> 0`; dùng `>>` thay `>>>` với n ≥ 2³¹.
 * Cách khác: đổi chỗ từng nửa (16/8/4/2/1 bit) — O(log 32); chuỗi nhị phân (chậm, dễ đọc).
 * Python/Java: Python không bị âm (vô hạn bit) nhưng phải giới hạn 32 bit; Java trả `long`, dùng `& 0xFFFFFFFFL`.
 */
export function reverseBits(n: number): number {
  let x = n | 0; // 32 bit thấp của n
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (x & 1);
    x >>>= 1;
  }
  return result >>> 0;
}

/**
 * ex06 · missingNumber
 * Ý tưởng: XOR mọi chỉ số 0..n với mọi phần tử; các giá trị có mặt triệt tiêu, còn lại số thiếu. (Hoặc n(n+1)/2 − sum.)
 * Độ phức tạp: O(n), O(1).
 * Vì sao best practice: XOR không tràn dù n lớn; nên khởi tạo bằng n rồi XOR `i ^ nums[i]`.
 * Bẫy: quên XOR với n (chỉ số n không nằm trong vòng lặp i < n).
 * Cách khác: công thức tổng (Java dùng `long` nếu n tới 2³¹); đánh dấu bằng mảng boolean (O(n) bộ nhớ).
 * Python/Java: tương tự.
 */
export function missingNumber(nums: number[]): number {
  let x = nums.length;
  for (let i = 0; i < nums.length; i++) x ^= i ^ nums[i];
  return x;
}

/**
 * ex07 · singleNumberII (mọi số xuất hiện 3 lần, trừ một số xuất hiện 1 lần)
 * Ý tưởng: đếm số lần thấy mỗi BIT theo modulo 3 bằng hai biến `ones`, `twos` (mã hóa bộ đếm 2 bit song song cho cả 32 vị trí):
 *   ones ^= x & ~twos; twos ^= x & ~ones. Sau mọi phần tử, `ones` giữ các bit có số lần ≡ 1 (mod 3) = số duy nhất.
 * Độ phức tạp: O(n), O(1) bộ nhớ.
 * Vì sao best practice: không cần 32 vòng lặp theo bit; xử lý số ÂM tự nhiên vì làm việc trên int32.
 * Bẫy: cách đếm từng bit (32 × n) phải ghép kết quả bằng `|= 1 << b` rồi bit 31 làm số âm (JS int32 xử lý đúng, Python thì không: phải trừ 2³²).
 * Cách khác: đếm bit 32 × n; Map đếm (O(n) bộ nhớ); sort.
 * Python/Java: Python int vô hạn ⇒ sau khi ghép 32 bit phải đổi sang có dấu (`if r >= 2**31: r -= 2**32`); Java như TS.
 */
export function singleNumberII(nums: number[]): number {
  let ones = 0;
  let twos = 0;
  for (const x of nums) {
    ones = (ones ^ x) & ~twos;
    twos = (twos ^ x) & ~ones;
  }
  return ones;
}

/**
 * ex08 · singleNumberIII (hai số xuất hiện một lần, còn lại hai lần)
 * Ý tưởng: XOR mọi phần tử = a ^ b (a ≠ b). Lấy một bit 1 bất kỳ của a ^ b (bit thấp nhất: `x & −x`) — a và b KHÁC nhau ở bit đó. Chia mảng theo
 *   bit đó thành hai nhóm; mỗi nhóm chứa đúng một trong a, b (và các cặp trùng nằm trọn trong một nhóm) ⇒ XOR từng nhóm ra a và b.
 * Độ phức tạp: O(n), O(1).
 * Vì sao best practice: hai lượt, không bộ nhớ phụ.
 * Bẫy: a ^ b = −2³¹ (khi một số là −2³¹): `−x` tràn ở Java (vẫn cho −2³¹) nhưng `x & −x` vẫn đúng — đừng dùng `Math.abs`; trả về TĂNG DẦN.
 * Cách khác: Set/Map (O(n) bộ nhớ).
 * Python/Java: Python `x & -x` đúng với số âm; sắp `sorted([a, b])`.
 */
export function singleNumberIII(nums: number[]): number[] {
  let xor = 0;
  for (const v of nums) xor ^= v;
  const lowbit = xor & -xor;
  let a = 0;
  let b = 0;
  for (const v of nums) {
    if (v & lowbit) a ^= v;
    else b ^= v;
  }
  return a < b ? [a, b] : [b, a];
}

/**
 * ex09 · rangeBitwiseAnd
 * Ý tưởng: AND của mọi số trong [left, right] = TIỀN TỐ CHUNG (bit cao) của left và right, các bit thấp còn lại bằng 0 (vì trong khoảng sẽ có số
 *   mà bit đó là 0). Dịch phải cả hai tới khi bằng nhau, đếm số lần dịch, rồi dịch trái lại.
 * Độ phức tạp: O(31).
 * Vì sao best practice: không lặp theo độ dài khoảng (tới 2³¹).
 * Bẫy: AND lần lượt cả khoảng ⇒ 2·10⁹ phép; kết quả dịch trái luôn ≤ right < 2³¹ nên không tràn dấu.
 * Cách khác: `while (right > left) right &= right − 1` (xóa dần bit thấp của right).
 * Python/Java: Java `int` đủ (right ≤ 2³¹ − 1).
 */
export function rangeBitwiseAnd(left: number, right: number): number {
  let shift = 0;
  while (left !== right) {
    left >>= 1;
    right >>= 1;
    shift++;
  }
  return left << shift;
}

/**
 * ex10 · minFlagSets
 * Ý tưởng: ≤ 15 gói ⇒ duyệt mọi tập con (2¹⁵ = 32 768) bằng bitmask `s`. OR của tập con tính dần: orOf[s] = orOf[s & (s − 1)] | sets[ctz(s)].
 *   Hợp lệ ⇔ OR đúng bằng target. Lấy kích thước nhỏ nhất. Gói có bit ngoài target làm OR vượt target nên không bao giờ được chọn.
 * Độ phức tạp: O(2^m) thời gian và bộ nhớ.
 * Vì sao best practice: mỗi tập con O(1) nhờ tái sử dụng kết quả của tập con nhỏ hơn (xóa bit thấp nhất); không OR lại từ đầu O(m).
 * Bẫy: target = 0 ⇒ 0 gói (tập rỗng); "OR ra đúng target" không phải "bao phủ target" — gói thừa bit làm hỏng.
 * Cách khác: DP trên mặt nạ đích (dp[mask]); lọc trước các gói là tập con của target.
 * Python/Java: ctz: Java `Integer.numberOfTrailingZeros`, Python `(s & -s).bit_length() - 1`.
 */
export function minFlagSets(target: number, sets: number[]): number {
  const m = sets.length;
  const orOf = new Int32Array(1 << m);
  let best = target === 0 ? 0 : Infinity;
  for (let s = 1; s < 1 << m; s++) {
    const low = s & -s;
    orOf[s] = orOf[s ^ low] | sets[31 - Math.clz32(low)];
    if (orOf[s] === target) {
      let c = 0;
      for (let t = s; t; t &= t - 1) c++;
      if (c < best) best = c;
    }
  }
  return best === Infinity ? -1 : best;
}
