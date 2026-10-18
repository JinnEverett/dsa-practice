// A05 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { TreeNode } from '../../tools/lib.ts';

// ─── ex01 · Nổ bóng bay ───
// Ý tưởng: pad hai số 1 hai đầu. dp[l][r] = điểm lớn nhất khi nổ hết bóng trong khoảng MỞ (l, r); k là bóng nổ CUỐI CÙNG:
//   dp[l][r] = max_k dp[l][k] + dp[k][r] + a[l]·a[k]·a[r]. Duyệt theo độ dài khoảng tăng dần.
// Độ phức tạp: O(n³) time · O(n²) space.
// Bẫy: nghĩ "nổ đầu tiên" ⇒ hai nửa phụ thuộc nhau. Điểm tối đa ≤ 300 · 100³ = 3·10⁸ vừa int.
export function maxCoins(nums: number[]): number {
  const a = [1, ...nums, 1];
  const m = a.length;
  const dp = new Int32Array(m * m);
  for (let len = 2; len < m; len++)
    for (let l = 0; l + len < m; l++) {
      const r = l + len;
      let best = 0;
      for (let k = l + 1; k < r; k++) {
        const v = dp[l * m + k] + dp[k * m + r] + a[l] * a[k] * a[r];
        if (v > best) best = v;
      }
      dp[l * m + r] = best;
    }
  return dp[m - 1];
}

// ─── ex02 · Cây từ lá, tổng nút nhỏ nhất ───
// Ý tưởng: mỗi nút trong = tích (lá lớn nhất cây con trái) × (lá lớn nhất cây con phải). dp[i][j] = tổng nút trong nhỏ nhất khi
//   dựng cây từ arr[i..j]; chia tại k: dp[i][k] + dp[k+1][j] + max(i..k)·max(k+1..j). Precompute mx[i][j].
// Độ phức tạp: O(n³) time · O(n²) space.
// Cách khác: stack đơn điệu giảm O(n) — bỏ phần tử nhỏ hơn hai láng giềng, cộng tích với láng giềng nhỏ hơn (chứng minh bằng "tham lam", xem I11).
export function mctFromLeafValues(arr: number[]): number {
  const n = arr.length;
  const mx = new Int32Array(n * n);
  for (let i = 0; i < n; i++) {
    mx[i * n + i] = arr[i];
    for (let j = i + 1; j < n; j++) mx[i * n + j] = Math.max(mx[i * n + j - 1], arr[j]);
  }
  const dp = new Int32Array(n * n);
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len <= n; i++) {
      const j = i + len - 1;
      let best = Infinity;
      for (let k = i; k < j; k++) {
        const v = dp[i * n + k] + dp[(k + 1) * n + j] + mx[i * n + k] * mx[(k + 1) * n + j];
        if (v < best) best = v;
      }
      dp[i * n + j] = best;
    }
  return dp[n - 1];
}

// ─── ex03 · Chia đa giác thành tam giác ───
// Ý tưởng: cạnh (i, j) thuộc đúng một tam giác (i, k, j): dp[i][j] = min_k dp[i][k] + dp[k][j] + v[i]·v[k]·v[j]; dp[i][i+1] = 0.
// Độ phức tạp: O(n³) time · O(n²) space. Điểm tối đa ≤ 198 · 10⁶ ≈ 2·10⁸ vừa int.
export function minScoreTriangulation(values: number[]): number {
  const n = values.length;
  const dp = new Int32Array(n * n);
  for (let len = 2; len < n; len++)
    for (let i = 0; i + len < n; i++) {
      const j = i + len;
      let best = Infinity;
      for (let k = i + 1; k < j; k++) {
        const v = dp[i * n + k] + dp[k * n + j] + values[i] * values[k] * values[j];
        if (v < best) best = v;
      }
      dp[i * n + j] = best;
    }
  return dp[n - 1];
}

// ─── ex04 · Cướp nhà trên cây ───
// Ý tưởng: post-order trả [no, yes]: no = tiền tối đa cây con khi KHÔNG lấy node; yes = khi lấy node (con phải là "no").
// Độ phức tạp: O(n) time · O(h) space (h ≤ n ≤ 5000 ⇒ đệ quy an toàn). Cây 10⁵ node lệch ⇒ cần post-order lặp.
export function robTree(root: TreeNode | null): number {
  const f = (node: TreeNode | null): [number, number] => {
    if (!node) return [0, 0];
    const [lNo, lYes] = f(node.left);
    const [rNo, rYes] = f(node.right);
    return [Math.max(lNo, lYes) + Math.max(rNo, rYes), node.val + lNo + rNo];
  };
  const [no, yes] = f(root);
  return Math.max(no, yes);
}

// ─── ex05 · Đặt camera trên cây ───
// Ý tưởng (greedy/DP 3 trạng thái, post-order): 0 = chưa được phủ, 1 = có camera, 2 = được phủ nhưng không có camera.
//   Nếu một con ở trạng thái 0 ⇒ đặt camera ở node (1, ans++). Nếu có con ở trạng thái 1 ⇒ node được phủ (2). Ngược lại node chưa được phủ (0).
//   Gốc ở trạng thái 0 ⇒ thêm một camera. null coi là 2 (đã phủ, không cần gì).
// Độ phức tạp: O(n) time · O(h) space (n ≤ 5000).
export function minCameraCover(root: TreeNode | null): number {
  let cams = 0;
  const f = (node: TreeNode | null): number => {
    if (!node) return 2;
    const l = f(node.left);
    const r = f(node.right);
    if (l === 0 || r === 0) {
      cams++;
      return 1;
    }
    return l === 1 || r === 1 ? 2 : 0;
  };
  if (f(root) === 0) cams++;
  return cams;
}

// ─── ex06 · Người bán hàng (TSP) ───
// Ý tưởng: dp[mask][i] = chi phí nhỏ nhất đi từ 0, đã thăm đúng tập mask (luôn chứa 0 và i), đang ở i. Đáp án min_i dp[full][i] + dist[i][0].
// Độ phức tạp: O(2ⁿ · n²) time · O(2ⁿ · n) space. n = 15 ⇒ ≈ 7·10⁶ phép. Vét cạn (n-1)! = 8.7·10¹⁰ ở n = 15.
// Bẫy: n = 1 ⇒ 0; INF phải đủ lớn nhưng cộng không tràn (Java: 1e9, không dùng Integer.MAX_VALUE). 1 << n an toàn với n ≤ 15.
export function tsp(dist: number[][]): number {
  const n = dist.length;
  if (n === 1) return 0;
  const INF = 1e9;
  const full = 1 << n;
  const dp = new Int32Array(full * n).fill(INF);
  dp[1 * n + 0] = 0;
  for (let mask = 1; mask < full; mask += 2) {
    // chỉ xét mask chứa đỉnh 0 (bit 0 = 1)
    for (let i = 0; i < n; i++) {
      const cur = dp[mask * n + i];
      if (cur >= INF) continue;
      for (let j = 1; j < n; j++) {
        if (mask >> j & 1) continue;
        const nm = mask | (1 << j);
        const v = cur + dist[i][j];
        if (v < dp[nm * n + j]) dp[nm * n + j] = v;
      }
    }
  }
  let best = INF;
  for (let i = 1; i < n; i++) best = Math.min(best, dp[(full - 1) * n + i] + dist[i][0]);
  return best;
}

// ─── ex07 · Đếm chữ số 1 ───
// Ý tưởng: xét từng vị trí m = 1, 10, 100, ...: high = ⌊n/(10m)⌋, cur = ⌊n/m⌋ mod 10, low = n mod m;
//   số lần chữ số 1 xuất hiện ở vị trí này = high·m + (cur > 1 ? m : cur === 1 ? low + 1 : 0).
// Độ phức tạp: O(log n) time · O(1) space. Duyệt 1..n là O(n) = 10⁹ phép.
// Cách khác (digit DP tổng quát): xem countDigitOneDP bên dưới — cùng đáp án, dùng khi tính chất phức tạp hơn "bằng 1".
// Java: m · 10 có thể vượt int (n gần 10⁹ ⇒ m = 10⁹, m·10 = 10¹⁰) ⇒ dùng long cho m.
export function countDigitOne(n: number): number {
  let count = 0;
  for (let m = 1; m <= n; m *= 10) {
    const high = Math.floor(n / (m * 10));
    const cur = Math.floor(n / m) % 10;
    const low = n % m;
    count += high * m + (cur > 1 ? m : cur === 1 ? low + 1 : 0);
  }
  return count;
}

/** Digit DP: f(pos, tight) = số chữ số 1 xuất hiện trong mọi hậu tố hợp lệ của các số 0..n (đếm cả số 0 đứng đầu — không ảnh hưởng chữ số 1). */
export function countDigitOneDP(n: number): number {
  const d = String(n).split('').map(Number);
  const L = d.length;
  // cnt[p] = số số hợp lệ có hậu tố độ dài p tự do = 10^p ; ones[p] = tổng số chữ số 1 trong mọi hậu tố tự do độ dài p = p·10^(p-1)
  const pow10 = [1];
  for (let i = 1; i <= L; i++) pow10.push(pow10[i - 1] * 10);
  const ones = (p: number) => (p === 0 ? 0 : p * pow10[p - 1]);
  let total = 0;
  let prefixOnes = 0; // số chữ số 1 đã chọn trong tiền tố "tight"
  for (let pos = 0; pos < L; pos++) {
    const rest = L - pos - 1;
    for (let c = 0; c < d[pos]; c++) {
      // chọn chữ số c < d[pos] ở vị trí này ⇒ không còn tight, phần còn lại tự do
      total += (prefixOnes + (c === 1 ? 1 : 0)) * pow10[rest] + ones(rest);
    }
    if (d[pos] === 1) prefixOnes++;
  }
  return total + prefixOnes; // chính n
}

// ─── ex08 · 🔴 Chia việc đều cho k người ───
// Ý tưởng: target = sum/k (không chia hết hoặc max > target ⇒ false). dp[mask] = tổng của "nhóm đang dở" (mod target) khi đã dùng tập mask,
//   hoặc -1 nếu không hợp lệ. Thêm việc i: nếu dp[mask] + nums[i] ≤ target thì dp[mask | 1<<i] = (dp[mask] + nums[i]) % target.
//   Đáp án dp[full] === 0.
// Độ phức tạp: O(2ⁿ · n) time · O(2ⁿ) space (n ≤ 16). Backtracking nhồi vào k xô có thể mũ trong trường hợp xấu.
export function canPartitionKSubsets(nums: number[], k: number): boolean {
  const n = nums.length;
  let sum = 0;
  for (const x of nums) sum += x;
  if (sum % k) return false;
  const target = sum / k;
  for (const x of nums) if (x > target) return false;
  const full = (1 << n) - 1;
  const dp = new Int32Array(full + 1).fill(-1);
  dp[0] = 0;
  for (let mask = 0; mask < full; mask++) {
    if (dp[mask] < 0) continue;
    for (let i = 0; i < n; i++) {
      if (mask >> i & 1) continue;
      const v = dp[mask] + nums[i];
      if (v <= target) dp[mask | (1 << i)] = v % target;
    }
  }
  return dp[full] === 0;
}
