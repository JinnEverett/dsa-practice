// A01 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Tribonacci ───
// Ý tưởng: state dp[i] = T(i); transition T(i) = T(i-1) + T(i-2) + T(i-3); base T0=0, T1=T2=1. Chỉ cần 3 biến.
// Độ phức tạp: O(n) time · O(1) space.
// Vì sao best practice: bottom-up, không đệ quy, nén bộ nhớ. Bản memo (top-down) tương đương:
//   const f = (i) => i < 3 ? (i === 0 ? 0 : 1) : memo[i] ??= f(i-1) + f(i-2) + f(i-3).
// Bẫy: đệ quy thuần O(3ⁿ) (n = 37 mất hàng chục giây). Java: n ≤ 37 mới vừa `int` (T37 = 2 082 876 103).
// Python/Java: Python dùng `@cache`; Java dùng 3 biến `int`.
export function tribonacci(n: number): number {
  if (n === 0) return 0;
  let a = 0;
  let b = 1;
  let c = 1; // T(i-2), T(i-1), T(i)
  for (let i = 3; i <= n; i++) [a, b, c] = [b, c, a + b + c];
  return c;
}

// ─── ex02 · Leo cầu thang chi phí tối thiểu ───
// Ý tưởng: dp[i] = chi phí tối thiểu để *đứng* ở bậc i (chưa trả cost[i]); dp[0]=dp[1]=0;
//   dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]); đáp án dp[n] (đỉnh nằm sau bậc cuối).
// Độ phức tạp: O(n) time · O(1) space.
// Bẫy: nhầm "đỉnh" là bậc n-1 (phải là vị trí n). Cách khác: dp[i] = chi phí khi *rời* bậc i, đáp án min(dp[n-1], dp[n-2]).
export function minCostClimbingStairs(cost: number[]): number {
  let p2 = 0; // dp[i-2]
  let p1 = 0; // dp[i-1]
  for (let i = 2; i <= cost.length; i++) [p2, p1] = [p1, Math.min(p1 + cost[i - 1], p2 + cost[i - 2])];
  return p1;
}

// ─── ex03 · House robber ───
// Ý tưởng: dp[i] = tiền tối đa khi xét nhà 0..i; dp[i] = max(dp[i-1], dp[i-2] + a[i]).
// Độ phức tạp: O(n) time · O(1) space.
// Cách khác: memo đệ quy (tràn stack ở n = 10⁵ — bài này cố ý để n lớn).
export function rob(nums: number[]): number {
  let p2 = 0;
  let p1 = 0;
  for (const x of nums) [p2, p1] = [p1, Math.max(p1, p2 + x)];
  return p1;
}

// ─── ex04 · House robber vòng tròn ───
// Ý tưởng: nhà 0 và n-1 kề nhau → không lấy cả hai ⇒ max(rob(0..n-2), rob(1..n-1)). n = 1 là trường hợp riêng.
// Độ phức tạp: O(n) time · O(1) space. Tái dùng một hàm helper theo đoạn thay vì slice (tránh copy).
function robRange(a: number[], lo: number, hi: number): number {
  let p2 = 0;
  let p1 = 0;
  for (let i = lo; i <= hi; i++) [p2, p1] = [p1, Math.max(p1, p2 + a[i])];
  return p1;
}
export function robCircular(nums: number[]): number {
  const n = nums.length;
  if (n === 1) return nums[0];
  return Math.max(robRange(nums, 0, n - 2), robRange(nums, 1, n - 1));
}

// ─── ex05 · Xóa và kiếm điểm ───
// Ý tưởng: gom theo giá trị: gain[v] = v · count(v). Chọn v thì không được chọn v±1 ⇒ chính là house robber trên trục giá trị.
// Độ phức tạp: O(n + V) time (V = max giá trị ≤ 10⁴) · O(V) space.
// Bẫy: tổng điểm tối đa 10⁹ vẫn vừa `int`, nhưng v · count ở Java nên tính bằng `long` cho an toàn.
export function deleteAndEarn(nums: number[]): number {
  let max = 0;
  for (const x of nums) if (x > max) max = x;
  const gain = new Array<number>(max + 1).fill(0);
  for (const x of nums) gain[x] += x;
  let p2 = 0;
  let p1 = 0;
  for (let v = 1; v <= max; v++) [p2, p1] = [p1, Math.max(p1, p2 + gain[v])];
  return p1;
}

// ─── ex06 · Đếm cách leo thang (bước 1..k) ───
// Ý tưởng: ways[i] = Σ_{j=1..k} ways[i-j]. Giữ tổng cửa sổ S = ways[i-k..i-1]: ways[i] = S; rồi S += ways[i] − ways[i-k].
// Độ phức tạp: O(n) time · O(n) space (cần ways[i-k] để trừ). Bản thô O(n·k) = 10¹⁰ khi n = k = 10⁵.
// Bẫy: phép trừ mod có thể âm → `(S - x + M) % M`. Java: dùng `long` rồi ép `int` sau `% M`.
export function countWaysK(n: number, k: number): number {
  const M = 1_000_000_007;
  const ways = new Array<number>(n + 1).fill(0);
  ways[0] = 1;
  let window = 1; // ways[max(0,i-k)..i-1]
  for (let i = 1; i <= n; i++) {
    ways[i] = window;
    window = (window + ways[i]) % M;
    if (i - k >= 0) window = (window - ways[i - k] + M) % M;
  }
  return ways[n];
}

// ─── ex07 · Vé tàu ───
// Ý tưởng: ngày tới 10⁹ ⇒ DP theo chỉ số: dp[i] = chi phí tối thiểu phủ các ngày days[0..i-1].
//   Với mỗi loại vé (hiệu lực d ngày), lo = chỉ số nhỏ nhất có days[lo] > days[i] − d (two pointers, đơn điệu):
//   dp[i+1] = min_p dp[lo_p] + cost_p.
// Độ phức tạp: O(n) time · O(n) space (n = số ngày đi). Bản "mảng theo ngày" 365 phần tử không scale được lên 10⁹.
// Python/Java: bisect_left / Arrays binary search cũng được (O(n log n)); two pointers nhanh hơn.
export function mincostTickets(days: number[], costs: number[]): number {
  const dur = [1, 7, 30];
  const n = days.length;
  const dp = new Array<number>(n + 1).fill(0);
  const lo = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    let best = Infinity;
    for (let p = 0; p < 3; p++) {
      while (days[lo[p]] <= days[i] - dur[p]) lo[p]++;
      best = Math.min(best, dp[lo[p]] + costs[p]);
    }
    dp[i + 1] = best;
  }
  return dp[n];
}

// ─── ex08 · Sơn nhà ───
// Ý tưởng: dp[i][c] = chi phí tối thiểu sơn nhà 0..i với nhà i màu c; dp[i][c] = costs[i][c] + min(dp[i-1][c'≠c]). Chỉ cần dòng trước.
// Độ phức tạp: O(n) time · O(1) space.
export function minCostPaint(costs: number[][]): number {
  let a = 0;
  let b = 0;
  let c = 0;
  for (const [x, y, z] of costs) [a, b, c] = [x + Math.min(b, c), y + Math.min(a, c), z + Math.min(a, b)];
  return Math.min(a, b, c);
}

// ─── ex09 · 🔴 Câu hỏi thi có điểm ───
// Ý tưởng: duyệt ngược. dp[i] = điểm tối đa từ câu i đến hết; dp[i] = max(dp[i+1] (bỏ), points + dp[i+brain+1] (làm)).
//   Chỉ số nhảy vượt n thì coi là n (dp[n] = 0).
// Độ phức tạp: O(n) time · O(n) space. Bẫy: điểm tới 10¹⁴ → Java `long`.
export function mostPoints(questions: number[][]): number {
  const n = questions.length;
  const dp = new Array<number>(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const [pts, brain] = questions[i];
    dp[i] = Math.max(dp[i + 1], pts + dp[Math.min(n, i + brain + 1)]);
  }
  return dp[0];
}

// ─── ex10 · 🔴 Xếp lịch công việc có lợi nhuận ───
// Ý tưởng: sort job theo end. dp[i] = lợi nhuận tối đa khi chỉ xét i job đầu (theo end). Job i: bỏ → dp[i]; chọn → profit + dp[p]
//   với p = số job có end ≤ start_i (binary search trên mảng end đã sort).
// Độ phức tạp: O(n log n) time · O(n) space. Bản duyệt tuyến tính tìm job không chồng lấn: O(n²) (n = 10⁵ → trượt Perf).
// Python/Java: `bisect_right(ends, start)` / `Arrays.binarySearch` (cẩn thận trùng giá trị) hoặc tự viết upper bound.
export function jobScheduling(startTime: number[], endTime: number[], profit: number[]): number {
  const n = startTime.length;
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => endTime[a] - endTime[b]);
  const ends = order.map((i) => endTime[i]);
  const dp = new Array<number>(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    const j = order[i];
    // p = số job có end ≤ start_j (upper bound)
    let lo = 0;
    let hi = i;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (ends[mid] <= startTime[j]) lo = mid + 1;
      else hi = mid;
    }
    dp[i + 1] = Math.max(dp[i], dp[lo] + profit[j]);
  }
  return dp[n];
}
