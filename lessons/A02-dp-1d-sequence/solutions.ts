// A02 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Đổi tiền ít đồng nhất ───
// Ý tưởng: dp[a] = số đồng ít nhất tạo đúng a; dp[a] = min(dp[a-c] + 1); dp[0] = 0; chưa tới = INF.
// Độ phức tạp: O(amount · k) time · O(amount) space.
// Bẫy: INF + 1 (Java: dùng amount + 1 làm INF thay cho Integer.MAX_VALUE); không đổi được → -1.
// Python/Java: Python `float('inf')`; Java `int[] dp` với `Arrays.fill(dp, amount + 1)`.
export function coinChange(coins: number[], amount: number): number {
  const INF = amount + 1;
  const dp = new Array<number>(amount + 1).fill(INF);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++)
    for (const c of coins) if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
  return dp[amount] >= INF ? -1 : dp[amount];
}

// ─── ex02 · Đổi tiền: đếm số tổ hợp ───
// Ý tưởng: dp[a] = số tổ hợp tạo a; đồng ở vòng NGOÀI, amount ở vòng trong ⇒ mỗi tổ hợp đếm đúng một lần (không phân biệt thứ tự).
// Độ phức tạp: O(amount · k) time · O(amount) space. Kết quả mod 1e9+7.
// Bẫy: đảo hai vòng lặp ⇒ đếm hoán vị. Java: cộng bằng `long`/`(a + b) % MOD`.
export function change(amount: number, coins: number[]): number {
  const M = 1_000_000_007;
  const dp = new Array<number>(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins) for (let a = c; a <= amount; a++) dp[a] = (dp[a] + dp[a - c]) % M;
  return dp[amount];
}

// ─── ex03 · LIS O(n log n) ───
// Ý tưởng: tails[k] = đuôi nhỏ nhất của dãy tăng ngặt độ dài k+1; mỗi x thay phần tử đầu tiên ≥ x (lower bound) hoặc nối thêm.
// Độ phức tạp: O(n log n) time · O(n) space. Bản O(n²) với n = 10⁵ ≈ 5·10⁹ phép ⇒ trượt Perf.
// Bẫy: ngặt → lower bound (≥ x); không giảm → upper bound (> x). `tails` không phải LIS thật.
// Python/Java: `bisect_left` / tự viết lower bound.
export function lengthOfLIS(nums: number[]): number {
  const tails: number[] = [];
  for (const x of nums) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}

// ─── ex04 · Tách từ ───
// Ý tưởng: dp[i] = s[0..i) tách được; dp[i] = ∃ j ∈ [i-L, i): dp[j] ∧ s[j..i) ∈ dict, L = độ dài từ dài nhất.
// Độ phức tạp: O(n · L) set lookup (mỗi lần slice O(L)) · O(n) space. Quét mọi j ⇒ O(n²) (trượt Perf).
// Python/Java: `set`/`HashSet`; Java `s.substring(j, i)`.
export function wordBreak(s: string, wordDict: string[]): boolean {
  const dict = new Set(wordDict);
  let L = 0;
  for (const w of wordDict) if (w.length > L) L = w.length;
  const n = s.length;
  const dp = new Array<boolean>(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i++)
    for (let j = Math.max(0, i - L); j < i; j++)
      if (dp[j] && dict.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
  return dp[n];
}

// ─── ex05 · Giải mã ───
// Ý tưởng: dp[i] = số cách giải mã s[0..i); lấy 1 chữ số (≠ '0') từ dp[i-1], lấy 2 chữ số (10..26) từ dp[i-2]. Nén còn 2 biến.
// Độ phức tạp: O(n) time · O(1) space. Mod 1e9+7.
// Bẫy: '0' đứng đầu cặp ("06") không hợp lệ; "10", "20" chỉ có một cách.
export function numDecodings(s: string): number {
  const M = 1_000_000_007;
  let p2 = 1; // dp[i-2]
  let p1 = s[0] === '0' ? 0 : 1; // dp[i-1]
  for (let i = 2; i <= s.length; i++) {
    let cur = 0;
    if (s[i - 1] !== '0') cur += p1;
    const two = (s.charCodeAt(i - 2) - 48) * 10 + (s.charCodeAt(i - 1) - 48);
    if (two >= 10 && two <= 26) cur += p2;
    [p2, p1] = [p1, cur % M];
  }
  return p1;
}

// ─── ex06 · Kadane ───
// Ý tưởng: cur = tổng lớn nhất của mảng con kết thúc tại i = max(a[i], cur + a[i]).
// Độ phức tạp: O(n) time · O(1) space. Mảng toàn âm vẫn phải chọn ≥ 1 phần tử (đừng khởi tạo best = 0).
export function maxSubArray(nums: number[]): number {
  let cur = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    if (cur > best) best = cur;
  }
  return best;
}

// ─── ex07 · Tích mảng con lớn nhất ───
// Ý tưởng: giữ max và min của tích kết thúc tại i (số âm đảo vai trò): mx' = max(x, mx·x, mn·x), mn' = min(...).
// Độ phức tạp: O(n) time · O(1) space. Số 0 tự reset vì x nằm trong max/min.
export function maxProduct(nums: number[]): number {
  let mx = nums[0];
  let mn = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const a = mx * x;
    const b = mn * x;
    mx = Math.max(x, a, b);
    mn = Math.min(x, a, b);
    if (mx > best) best = mx;
  }
  return best;
}

// ─── ex08 · Mua bán cổ phiếu có cooldown ───
// Ý tưởng (state machine): hold (đang cầm), sold (vừa bán hôm nay), rest (rảnh, được mua).
//   hold' = max(hold, rest - p) · sold' = hold + p · rest' = max(rest, sold). Đáp án max(sold, rest).
// Độ phức tạp: O(n) time · O(1) space.
export function maxProfitCooldown(prices: number[]): number {
  let hold = -Infinity;
  let sold = 0;
  let rest = 0;
  for (const p of prices) {
    const prevSold = sold;
    sold = hold + p;
    hold = Math.max(hold, rest - p);
    rest = Math.max(rest, prevSold);
  }
  return Math.max(sold, rest);
}

// ─── ex09 · Mua bán cổ phiếu có phí ───
// Ý tưởng: hold / free; trả phí lúc bán: free' = max(free, hold + p - fee), hold' = max(hold, free - p).
// Độ phức tạp: O(n) time · O(1) space.
export function maxProfitFee(prices: number[], fee: number): number {
  let hold = -Infinity;
  let free = 0;
  for (const p of prices) {
    const h = Math.max(hold, free - p);
    free = Math.max(free, hold + p - fee);
    hold = h;
  }
  return free;
}

// ─── ex10 · 🔴 Xếp thùng lồng nhau ───
// Ý tưởng: sort theo w tăng, với w bằng nhau thì h GIẢM (để hai thùng cùng w không lồng nhau được); rồi LIS ngặt trên h.
// Độ phức tạp: O(n log n) time · O(n) space.
// Bẫy: quên sắp h giảm khi w bằng nhau ⇒ đếm nhầm hai thùng cùng rộng. Java: Comparator dùng Integer.compare (tránh a - b tràn với 10⁹).
export function maxEnvelopes(envelopes: number[][]): number {
  const e = envelopes.slice().sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  return lengthOfLIS(e.map((x) => x[1]));
}
