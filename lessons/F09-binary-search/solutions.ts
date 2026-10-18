// F09 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Mọi bài dùng chung MỘT template: tìm chỉ số nhỏ nhất trong [lo, hi) có ok(i) = true.

/** Chỉ số nhỏ nhất i trong [lo, hi) mà ok(i) đúng; không có thì trả hi. ok phải đơn điệu F…F T…T. */
export function firstTrue(lo: number, hi: number, ok: (i: number) => boolean): number {
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (ok(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
const lowerBound = (a: number[], x: number) => firstTrue(0, a.length, (i) => a[i] >= x);
const upperBound = (a: number[], x: number) => firstTrue(0, a.length, (i) => a[i] > x);

// ─── ex01 · Binary search cơ bản ───
// Ý tưởng: lower bound rồi kiểm tra phần tử tại đó có đúng là target.
// Độ phức tạp: O(log n) time · O(1) space.
// Vì sao là best practice: một template cho mọi bài; không có nhánh "== thì return" riêng nên không phải nghĩ lại biên.
// Python/Java: Python `i = bisect_left(nums, target)`; Java tự viết (Arrays.binarySearch trả giá trị âm khi không thấy).
export function search(nums: number[], target: number): number {
  const i = lowerBound(nums, target);
  return i < nums.length && nums[i] === target ? i : -1;
}

// ─── ex02 · Vị trí chèn ───
// Ý tưởng: chính là lower bound.
export function searchInsert(nums: number[], target: number): number {
  return lowerBound(nums, target);
}

// ─── ex03 · Vị trí đầu và cuối ───
// Ý tưởng: đầu = lowerBound(target), cuối = upperBound(target) − 1. Hai lần tìm, mỗi lần O(log n).
// Bẫy: tìm thấy một vị trí rồi đi sang hai bên → O(n) khi cả mảng bằng target.
export function searchRange(nums: number[], target: number): number[] {
  const lo = lowerBound(nums, target);
  if (lo === nums.length || nums[lo] !== target) return [-1, -1];
  return [lo, upperBound(nums, target) - 1];
}

// ─── ex04 · Căn bậc hai nguyên ───
// Ý tưởng: binary search trên ĐÁP ÁN: r nhỏ nhất có r² > x, trừ 1. Khoảng [0, min(x, 46341) + 1].
// Độ phức tạp: O(log x) ≈ 31 bước.
// Bẫy Java: `mid * mid` với mid ~ 46341 vượt int → dùng `(long) mid * mid` hoặc so `mid > x / mid`.
// Cách khác: Newton — hội tụ nhanh hơn nhưng khó chứng minh điều kiện dừng khi viết vội.
export function mySqrt(x: number): number {
  return firstTrue(0, Math.min(x, 46341) + 1, (r) => r * r > x) - 1;
}

// ─── ex05 · Tìm trong mảng xoay ───
// Ý tưởng: tìm điểm xoay p (chỉ số phần tử nhỏ nhất — xem ex06), rồi binary search trên đoạn đã sort chứa target:
//   target ≤ nums[n − 1] → đoạn [p, n), ngược lại [0, p).
// Độ phức tạp: O(log n), hai lần tìm.
// Cách khác: một lần duyệt — ở mỗi bước xác định nửa nào đã sort và target có nằm trong nửa đó không. Ngắn hơn nhưng
//   nhiều nhánh điều kiện dễ sai; cách "tìm điểm xoay rồi tìm thường" tái sử dụng template nên ít bug hơn.
export function searchRotated(nums: number[], target: number): number {
  const n = nums.length;
  const p = firstTrue(0, n, (i) => nums[i] <= nums[n - 1]);
  const [lo, hi] = target <= nums[n - 1] ? [p, n] : [0, p];
  const i = firstTrue(lo, hi, (k) => nums[k] >= target);
  return i < hi && nums[i] === target ? i : -1;
}

// ─── ex06 · Nhỏ nhất trong mảng xoay ───
// Ý tưởng: vị từ ok(i) = nums[i] ≤ nums[n − 1] đơn điệu: phần trước điểm xoay đều > phần tử cuối, từ điểm xoay trở đi đều ≤.
// Độ phức tạp: O(log n).
export function findMin(nums: number[]): number {
  const n = nums.length;
  return nums[firstTrue(0, n, (i) => nums[i] <= nums[n - 1])];
}

// ─── ex07 · Tìm một đỉnh ───
// Ý tưởng: ok(i) = nums[i] > nums[i + 1] (đang đi xuống). Nếu nums[mid] < nums[mid + 1] thì bên phải chắc chắn có đỉnh
//   (đi lên mãi thì cuối cùng gặp −∞). Chỉ số đầu tiên "đi xuống" (hoặc n − 1) là một đỉnh.
// Độ phức tạp: O(log n).
// Ghi chú: vị từ không đơn điệu trên toàn mảng, nhưng bất biến "lo..hi luôn chứa một đỉnh" vẫn giữ → template vẫn đúng.
export function findPeakElement(nums: number[]): number {
  return firstTrue(0, nums.length - 1, (i) => nums[i] > nums[i + 1]);
}

// ─── ex08 · Tìm trong ma trận ───
// Ý tưởng: chỉ số phẳng k ↔ (Math.floor(k / c), k % c); lower bound trên r·c phần tử.
// Độ phức tạp: O(log(r·c)) time · O(1) space.
// Cách khác: bắt đầu từ góc trên phải, đi trái/xuống — O(r + c); dùng cho ma trận chỉ sort theo hàng VÀ theo cột (LeetCode 240).
export function searchMatrix(matrix: number[][], target: number): boolean {
  const c = matrix[0].length;
  const total = matrix.length * c;
  const at = (k: number) => matrix[Math.floor(k / c)][k % c];
  const k = firstTrue(0, total, (i) => at(i) >= target);
  return k < total && at(k) === target;
}

// ─── ex09 · Bậc giá cước ───
// Ý tưởng: bậc = (upper bound của w trong thresholds) − 1, tức vị trí cuối cùng có thresholds[i] ≤ w.
// Độ phức tạp: O(q log n) time · O(q) space.
// Cách khác: nếu weights cũng được sort → two pointers O(n + q) (cần nhớ chỉ số gốc để trả đúng thứ tự).
export function shippingPrices(thresholds: number[], prices: number[], weights: number[]): number[] {
  return weights.map((w) => prices[upperBound(thresholds, w) - 1]);
}

// ─── ex10 · Đếm log trong khoảng ───
// Ý tưởng: số phần tử trong [from, to] = upperBound(to) − lowerBound(from).
// Độ phức tạp: O(q log n).
// Ngoài đời: đây là cách DB dùng B-tree index cho `WHERE t BETWEEN a AND b` (xem lộ trình SQL, P02).
export function countInRange(times: number[], queries: number[][]): number[] {
  return queries.map(([from, to]) => upperBound(times, to) - lowerBound(times, from));
}
