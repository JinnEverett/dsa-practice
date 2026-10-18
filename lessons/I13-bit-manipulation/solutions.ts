// I13 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Nhắc lại bẫy TS: toán tử bit ép toán hạng về int32 CÓ DẤU (bit 31 là dấu).
//   0x80000000 | 0 → -2147483648 · 1 << 31 → -2147483648 · -1 >>> 0 → 4294967295 (>>> trả số không âm)

// ─── ex01 · Single Number ───
// Ý tưởng: x ^ x = 0, x ^ 0 = x, XOR giao hoán → XOR cả mảng, các cặp tự triệt tiêu, còn lại số lẻ.
// Độ phức tạp: O(n) thời gian, O(1) bộ nhớ.
// Vì sao best practice: không cần hash set (O(n) bộ nhớ), không cần sort (O(n log n)).
// Bẫy: kết quả có thể âm — XOR int32 trả đúng dấu, không cần xử lý thêm.
// Cách khác: Set thêm/xóa (O(n) bộ nhớ); cộng 2·sum(set) − sum(mảng) (tràn int Java).
// Python/Java: Python `functools.reduce(operator.xor, nums)`; Java dùng `int x = 0; x ^= v`.
export function singleNumber(nums: number[]): number {
  let x = 0;
  for (const v of nums) x ^= v;
  return x;
}

// ─── ex02 · Hamming weight (đếm bit 1 của số 32-bit không dấu) ───
// Ý tưởng: `x & (x − 1)` xóa bit 1 thấp nhất → lặp đến khi x = 0, số lần lặp = số bit 1.
// Độ phức tạp: O(số bit 1) ≤ 32, O(1) bộ nhớ.
// Vì sao best practice: số vòng lặp chỉ bằng số bit 1 (không phải 32).
// Bẫy: n tới 2³² − 1 — `while (n) { n >> 1 }` với n ≥ 2³¹ ép sang số ÂM và `>>` giữ dấu → lặp vô hạn.
//      Phải `>>> 0` để đưa về không dấu, hoặc dùng `x & (x − 1)` (đúng cả khi x âm theo int32).
// Cách khác: dịch phải từng bit với `>>>`; bảng 256 phần tử; thủ thuật SWAR 5 bước.
// Python/Java: Python `bin(n).count("1")` hoặc `n.bit_count()` (3.10+); Java `Long.bitCount(n)` / `Integer.bitCount((int) n)`.
export function hammingWeight(n: number): number {
  let x = n >>> 0;
  let c = 0;
  while (x !== 0) {
    x = (x & (x - 1)) >>> 0;
    c++;
  }
  return c;
}

// ─── ex03 · Counting Bits ───
// Ý tưởng: bits[i] = bits[i >> 1] + (i & 1) — i là i/2 dịch trái thêm bit cuối.
// Độ phức tạp: O(n) thời gian và bộ nhớ (kết quả đã là O(n)).
// Vì sao best practice: mỗi ô O(1) nhờ DP; gọi popcount cho từng số là O(n log n) hoặc O(n · bit).
// Bẫy: kích thước mảng là n + 1 (có số 0).
// Cách khác: bits[i] = bits[i & (i − 1)] + 1.
// Python/Java: Python `[i.bit_count() for i in range(n + 1)]` (đúng nhưng không DP); Java `Integer.bitCount(i)`.
export function countBits(n: number): number[] {
  const bits = new Array<number>(n + 1);
  bits[0] = 0;
  for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}

// ─── ex04 · Power of Two ───
// Ý tưởng: lũy thừa của 2 (> 0) chỉ có đúng một bit 1 → n & (n − 1) = 0.
// Độ phức tạp: O(1).
// Vì sao best practice: không lặp, không số thực.
// Bẫy: (1) n ≤ 0 phải loại trước (0 & −1 = 0). (2) n tới 2⁵³: toán tử bit TS chỉ nhìn 32 bit thấp →
//      2³² + 1 bị coi là 1 (lũy thừa của 2) — dùng BigInt. (3) `Number.isInteger(Math.log2(n))` sai với
//      2⁵³ − 1 vì log2 làm tròn thành đúng 53.
// Cách khác: lặp chia 2; so n với 2^⌊log2 n⌋ bằng BigInt.
// Python/Java: Python `n > 0 and n & (n - 1) == 0` (int vô hạn, không bẫy); Java `n > 0 && (n & (n - 1)) == 0` với `long`.
export function isPowerOfTwo(n: number): boolean {
  if (n <= 0) return false;
  const b = BigInt(n);
  return (b & (b - 1n)) === 0n;
}

// ─── ex05 · Reverse Bits (32-bit không dấu) ───
// Ý tưởng: 32 lần: đẩy bit thấp nhất của x vào cuối kết quả (r = r << 1 | x & 1; x >>>= 1).
// Độ phức tạp: O(32) = O(1).
// Vì sao best practice: chỉ dùng dịch bit, không chuỗi.
// Bẫy: sau 32 lần `r` có bit 31 = 1 là số ÂM trong TS → trả `r >>> 0`. Dùng `>>` thay `>>>` cho x cũng sai khi x ≥ 2³¹.
// Cách khác: hoán đổi theo khối 16/8/4/2/1 bit (divide & conquer, O(log 32)); bảng tra 256 mục khi gọi nhiều lần.
// Python/Java: Python không bị âm nhưng phải đủ 32 bit (`int(f"{n:032b}"[::-1], 2)`); Java `Integer.reverse((int) n) & 0xFFFFFFFFL` (kết quả `long`).
export function reverseBits(n: number): number {
  let x = n >>> 0;
  let r = 0;
  for (let i = 0; i < 32; i++) {
    r = (r << 1) | (x & 1);
    x >>>= 1;
  }
  return r >>> 0;
}

// ─── ex06 · Missing Number ───
// Ý tưởng: XOR mọi chỉ số 0..n với mọi giá trị → mọi số có mặt triệt tiêu, còn lại số thiếu.
// Độ phức tạp: O(n) thời gian, O(1) bộ nhớ.
// Vì sao best practice: không có nguy cơ tràn. Công thức Gauss n(n+1)/2 với n = 10⁵ đã là 5·10⁹ > 2³¹: Java `int` tràn
//      (vì wrap-around nhất quán nên vẫn ra đúng, nhưng nên dùng `long`); XOR thì khỏi lo.
// Bẫy: khởi tạo x = n (chỉ số n không có trong vòng lặp i < n).
// Cách khác: tổng Gauss (cần long), sort + duyệt, boolean mảng đánh dấu O(n) bộ nhớ.
// Python/Java: Python `n*(n+1)//2 - sum(nums)` gọn, không tràn; Java dùng `long` nếu theo công thức Gauss.
export function missingNumber(nums: number[]): number {
  let x = nums.length;
  for (let i = 0; i < nums.length; i++) x ^= i ^ nums[i];
  return x;
}

// ─── ex07 · Single Number II (các số khác xuất hiện đúng 3 lần) ───
// Ý tưởng: mỗi bit đếm số lần xuất hiện mod 3 — dùng hai mặt nạ `ones` (bit đã thấy 1 lần mod 3) và `twos` (2 lần):
//          ones = (ones ^ x) & ~twos; twos = (twos ^ x) & ~ones. Sau cả mảng, bit nào còn trong `ones` thuộc số đơn.
// Độ phức tạp: O(n) thời gian, O(1) bộ nhớ.
// Vì sao best practice: không Map (O(n) bộ nhớ); làm việc trực tiếp trên int32 nên số âm tự đúng.
// Bẫy: số âm — cách đếm 32 bit rồi ráp lại bằng `result |= 1 << i` cũng đúng nhờ bit 31 là dấu; nếu ráp bằng `+= 2 ** i` thì sai.
// Cách khác: đếm từng bit 0..31 (32n phép toán), rồi mod 3; hoặc Map đếm.
// Python/Java: Python int vô hạn → phải tự xử lý dấu (nếu bit 31 bật, trừ 2³²); Java giống TS.
export function singleNumberII(nums: number[]): number {
  let ones = 0;
  let twos = 0;
  for (const x of nums) {
    ones = (ones ^ x) & ~twos;
    twos = (twos ^ x) & ~ones;
  }
  return ones;
}

// ─── ex08 · Single Number III (hai số đơn, còn lại đúng 2 lần) ───
// Ý tưởng: XOR cả mảng = a ^ b ≠ 0. Lấy một bit 1 bất kỳ của nó (lowbit = x & −x): a và b khác nhau ở bit đó →
//          chia mảng làm hai nhóm theo bit đó, mỗi nhóm chứa đúng một số đơn (các cặp luôn cùng nhóm) → XOR từng nhóm.
// Độ phức tạp: O(n) thời gian, O(1) bộ nhớ.
// Vì sao best practice: hai lượt duyệt, không Map.
// Bẫy: x = −2³¹ thì −x tràn trong Java (vẫn bằng x), vẫn đúng vì chỉ cần `x & −x` còn bit 31; kiểm tra nhóm bằng `!== 0`
//      chứ không `=== lowbit`. Kết quả phải trả TĂNG DẦN.
// Cách khác: Map đếm (O(n) bộ nhớ); sort rồi duyệt (O(n log n)).
// Python/Java: Python `x & -x` đúng với số âm (int vô hạn dạng bù hai); Java `x & -x`, `Integer.MIN_VALUE` vẫn đúng.
export function singleNumberIII(nums: number[]): number[] {
  let x = 0;
  for (const v of nums) x ^= v;
  const low = x & -x;
  let a = 0;
  let b = 0;
  for (const v of nums) {
    if ((v & low) !== 0) a ^= v;
    else b ^= v;
  }
  return a < b ? [a, b] : [b, a];
}

// ─── ex09 · Bitwise AND of Numbers Range ───
// Ý tưởng: AND của cả đoạn [left, right] = tiền tố chung (theo bit) của left và right, phần còn lại bằng 0.
//          Dịch phải cả hai đến khi bằng nhau, đếm số lần dịch, rồi dịch trái lại.
// Độ phức tạp: O(31) = O(1).
// Vì sao best practice: AND lần lượt từ left đến right là O(right − left) — tới 2·10⁹ bước.
// Bẫy: right tới 2³¹ − 1: `left << shift` vẫn không âm vì kết quả ≤ right. Đừng dùng `1 << 31`.
// Cách khác: `while (right > left) right &= right − 1` (xóa bit thấp nhất của right đến khi ≤ left).
// Python/Java: giống hệt; Java dùng `int` đủ.
export function rangeBitwiseAnd(left: number, right: number): number {
  let shift = 0;
  while (left !== right) {
    left >>= 1;
    right >>= 1;
    shift++;
  }
  return left << shift;
}

// ─── ex10 · 🔴 Gói feature flag tối thiểu ───
// Ý tưởng: ≤ 15 gói → duyệt mọi tập con bằng bitmask `mask ∈ [0, 2^m)`. OR của tập con tính O(1) từ tập con
//          nhỏ hơn: or[mask] = or[mask & (mask − 1)] | sets[bit thấp nhất của mask]. Giữ tập có or = target và ít bit nhất.
// Độ phức tạp: O(2^m) thời gian và bộ nhớ (m ≤ 15 → 32 768 tập).
// Vì sao best practice: không đệ quy, không tính lại OR từ đầu cho mỗi tập (O(2^m · m)).
// Bẫy: OR phải BẰNG target chứ không chỉ chứa target — gói có bit ngoài target không bao giờ được dùng. target = 0 → 0 gói.
// Cách khác: backtracking include/exclude; DP trên mask của target (2^20 · m — chậm hơn khi m nhỏ).
// Python/Java: popcount `mask.bit_count()` / `Integer.bitCount(mask)`; bit thấp nhất `(mask & -mask).bit_length() - 1` / `Integer.numberOfTrailingZeros`.
export function minFlagSets(target: number, sets: number[]): number {
  const m = sets.length;
  const or = new Int32Array(1 << m);
  let best = target === 0 ? 0 : -1;
  for (let mask = 1; mask < 1 << m; mask++) {
    const low = mask & -mask;
    or[mask] = or[mask ^ low] | sets[31 - Math.clz32(low)];
    if (or[mask] === target) {
      let c = 0;
      for (let t = mask; t !== 0; t &= t - 1) c++;
      if (best === -1 || c < best) best = c;
    }
  }
  return best;
}
