// A04 · Đáp án best practice. Chỉ mở sau khi check ✅.
const MOD = 1_000_000_007;

// ─── ex01 · Knapsack 0/1 ───
// Ý tưởng: dp[j] = giá trị lớn nhất với sức chứa ≤ j; mỗi vật duyệt j GIẢM dần để dp[j-w] còn là của vòng trước.
// Độ phức tạp: O(n·W) time · O(W) space.
// Bẫy: duyệt xuôi ⇒ thành unbounded.
export function knapsack01(weights: number[], values: number[], capacity: number): number {
  const dp = new Int32Array(capacity + 1);
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i];
    const v = values[i];
    for (let j = capacity; j >= w; j--) if (dp[j - w] + v > dp[j]) dp[j] = dp[j - w] + v;
  }
  return dp[capacity];
}

// ─── ex02 · Knapsack không giới hạn ───
// Ý tưởng: cùng công thức, nhưng j TĂNG dần để vật được lấy lặp lại.
// Độ phức tạp: O(n·W) time · O(W) space.
export function knapsackUnbounded(weights: number[], values: number[], capacity: number): number {
  const dp = new Int32Array(capacity + 1);
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i];
    const v = values[i];
    for (let j = w; j <= capacity; j++) if (dp[j - w] + v > dp[j]) dp[j] = dp[j - w] + v;
  }
  return dp[capacity];
}

// ─── ex03 · Chia hai nhóm bằng nhau ───
// Ý tưởng: tổng S lẻ ⇒ false; ngược lại subset sum tới S/2 (dp[j] = đạt được tổng j), j giảm dần.
// Độ phức tạp: O(n·S/2) time · O(S) space. Cắt sớm khi dp[S/2] đã true.
// Python/Java: Python dùng bitset số nguyên `bits |= bits << x` (nhanh hơn nhiều); Java `BitSet`/`long[]`.
export function canPartition(nums: number[]): boolean {
  let sum = 0;
  for (const x of nums) sum += x;
  if (sum % 2) return false;
  const half = sum / 2;
  const dp = new Uint8Array(half + 1);
  dp[0] = 1;
  for (const x of nums) {
    for (let j = half; j >= x; j--) if (dp[j - x]) dp[j] = 1;
    if (dp[half]) return true;
  }
  return dp[half] === 1;
}

// ─── ex04 · Gán dấu +/- ───
// Ý tưởng: P - (S-P) = target ⇒ P = (S+target)/2; đếm số tập con có tổng P (0/1, j giảm dần). Mod 1e9+7.
// Độ phức tạp: O(n·P) time · O(P) space.
// Bẫy: |target| > S hoặc (S+target) lẻ ⇒ 0; phần tử 0 nhân đôi số cách (vòng j chạy tới x = 0 vẫn đúng vì j ≥ 0).
export function findTargetSumWays(nums: number[], target: number): number {
  let sum = 0;
  for (const x of nums) sum += x;
  if (Math.abs(target) > sum || (sum + target) % 2) return 0;
  const P = (sum + target) / 2;
  const dp = new Array<number>(P + 1).fill(0);
  dp[0] = 1;
  for (const x of nums) for (let j = P; j >= x; j--) dp[j] = (dp[j] + dp[j - x]) % MOD;
  return dp[P];
}

// ─── ex05 · Đập đá lần 2 ───
// Ý tưởng: chia đá thành hai nhóm (dấu + / −) sao cho |hiệu| nhỏ nhất ⇒ subset sum lớn nhất ≤ S/2; đáp án S − 2·best.
// Độ phức tạp: O(n·S/2) time · O(S) space.
export function lastStoneWeightII(stones: number[]): number {
  let sum = 0;
  for (const x of stones) sum += x;
  const half = sum >> 1;
  const dp = new Uint8Array(half + 1);
  dp[0] = 1;
  for (const x of stones) for (let j = half; j >= x; j--) if (dp[j - x]) dp[j] = 1;
  let best = half;
  while (!dp[best]) best--;
  return sum - 2 * best;
}

// ─── ex06 · Tập chuỗi nhị phân lớn nhất ───
// Ý tưởng: knapsack 2 chiều: mỗi chuỗi tiêu tốn (zeros, ones); dp[a][b] = số chuỗi tối đa với ≤ a số 0 và ≤ b số 1. Duyệt a, b giảm dần.
// Độ phức tạp: O(L · m · n) time · O(m·n) space (L = số chuỗi).
export function findMaxForm(strs: string[], m: number, n: number): number {
  const w = n + 1;
  const dp = new Int32Array((m + 1) * w);
  for (const s of strs) {
    let z = 0;
    for (let i = 0; i < s.length; i++) if (s[i] === '0') z++;
    const o = s.length - z;
    for (let a = m; a >= z; a--)
      for (let b = n; b >= o; b--) {
        const cand = dp[(a - z) * w + b - o] + 1;
        if (cand > dp[a * w + b]) dp[a * w + b] = cand;
      }
  }
  return dp[m * w + n];
}

// ─── ex07 · 🔴 Dãy số có thứ tự cộng bằng đích ───
// Ý tưởng: đếm HOÁN VỊ: dp[t] = Σ dp[t - x]; tổng t ở vòng NGOÀI (khác ex02 của A02 — đồng ở vòng ngoài ⇒ tổ hợp).
// Độ phức tạp: O(target · n) time · O(target) space. Kết quả mod 1e9+7.
export function combinationSum4(nums: number[], target: number): number {
  const dp = new Array<number>(target + 1).fill(0);
  dp[0] = 1;
  for (let t = 1; t <= target; t++) {
    let s = 0;
    for (const x of nums) if (x <= t) s += dp[t - x];
    dp[t] = s % MOD; // s < n·MOD ≤ 200·1e9 < 2⁵³
  }
  return dp[target];
}

// ─── ex08 · 🔴 Đổi tiền với số tờ có hạn ───
// Ý tưởng: bounded knapsack, tối thiểu số tờ: tách counts[i] thành gói 1,2,4,…,dư (k tờ mệnh giá c ⇒ giá trị k·c, chi phí k);
//   mỗi gói là vật 0/1: dp[a] = min(dp[a - k·c] + k), a giảm dần. -1 nếu dp[amount] vô cực.
// Độ phức tạp: O(amount · Σ log counts) time · O(amount) space. Bản "trải phẳng" từng tờ: O(amount · Σ counts) = 10⁹ ở test lớn.
// Bẫy: gói dư; INF + k tràn (Java: dùng amount + 1 hoặc Integer.MAX_VALUE / 2).
export function minCoinsBounded(coins: number[], counts: number[], amount: number): number {
  const INF = 1 << 30;
  const dp = new Int32Array(amount + 1).fill(INF);
  dp[0] = 0;
  for (let i = 0; i < coins.length; i++) {
    let left = counts[i];
    for (let k = 1; left > 0; k <<= 1) {
      const take = Math.min(k, left);
      left -= take;
      const val = take * coins[i];
      for (let a = amount; a >= val; a--) if (dp[a - val] + take < dp[a]) dp[a] = dp[a - val] + take;
    }
  }
  return dp[amount] >= INF ? -1 : dp[amount];
}
