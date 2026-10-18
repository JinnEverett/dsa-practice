// S00 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Tổng mảng ───
// Ý tưởng: cộng dồn một lượt.
// Độ phức tạp: O(n) time · O(1) space.
// Vì sao là best practice: vòng for cổ điển nhanh nhất trên V8 và rõ ràng. `reduce((s, x) => s + x, 0)`
//   cũng đúng và đủ nhanh — nhớ luôn truyền giá trị khởi tạo 0, nếu không mảng rỗng sẽ ném TypeError.
// Python/Java: Python dùng `sum(nums)` (built-in viết bằng C, nhanh hơn vòng for ~10×). Java: vòng for hoặc `Arrays.stream(nums).sum()`.
export function sum(nums: number[]): number {
  let total = 0;
  for (let i = 0; i < nums.length; i++) total += nums[i];
  return total;
}

// ─── ex02 · Đếm cặp có tổng bằng k ───
// Ý tưởng: duyệt từ trái sang, với mỗi x thì số cặp mới = số lần (k - x) đã xuất hiện TRƯỚC nó.
//   Cập nhật tần suất của x SAU khi đếm → tự động bảo đảm i < j và không ghép x với chính nó.
// Độ phức tạp: O(n) time · O(n) space (Map).
// Bẫy: thêm x vào Map trước khi đếm → đếm sai khi x = k - x (vd. [3], k = 6 thành 1 cặp).
// Cách khác: sort + two pointers O(n log n), O(1) space nhưng đếm phần tử trùng rắc rối hơn.
// Python/Java: Python `Counter` + `seen[k - x]` (Counter trả 0 cho key chưa có). Java: biến đếm phải là `long` — 70 000 số 1 với k = 2
//   cho ~2.45·10⁹ cặp, `int` tràn thành số âm; key `k - x` cũng có thể vượt int (|k - x| ≤ 2·10⁹) → dùng `HashMap<Long, Integer>` hoặc ép `(long) k - x`.
export function countPairs(nums: number[], k: number): number {
  const seen = new Map<number, number>();
  let pairs = 0;
  for (const x of nums) {
    pairs += seen.get(k - x) ?? 0;
    seen.set(x, (seen.get(x) ?? 0) + 1);
  }
  return pairs;
}

// Bản O(n²) để so sánh khi bench (không phải đáp án):
//   node tools/bench.ts lessons/S00-setup 02 --file lessons/S00-setup/solutions.ts --fn countPairsQuadratic --scales s,m
export function countPairsQuadratic(nums: number[], k: number): number {
  let pairs = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) if (nums[i] + nums[j] === k) pairs++;
  }
  return pairs;
}

// ─── ex03 · Đảo ngược mảng tại chỗ ───
// Ý tưởng: two pointers hai đầu, đổi chỗ rồi tiến vào giữa.
// Độ phức tạp: O(n) time · O(1) space.
// Vì sao là best practice: dùng biến tạm thay cho destructuring `[a[i], a[j]] = [a[j], a[i]]` —
//   destructuring đẹp hơn nhưng có thể chậm hơn trong vòng lặp nóng (đo ở P03).
// Python/Java: Python có thể `nums[i], nums[j] = nums[j], nums[i]` (idiom chuẩn, không chậm như destructuring JS); `nums.reverse()` bị cấm theo đề.
export function reverseInPlace(nums: number[]): void {
  for (let i = 0, j = nums.length - 1; i < j; i++, j--) {
    const t = nums[i];
    nums[i] = nums[j];
    nums[j] = t;
  }
}
