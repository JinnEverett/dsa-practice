// F07 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Tổng cộng dồn ───
// Ý tưởng: out[i] = out[i − 1] + nums[i].
// Độ phức tạp: O(n) time · O(n) space (output).
// Python/Java: Python `list(itertools.accumulate(nums))`; Java `long[] out` (10⁵ × 10⁹ vượt int).
export function runningSum(nums: number[]): number[] {
  const out = new Array<number>(nums.length);
  let sum = 0;
  for (let i = 0; i < nums.length; i++) out[i] = sum += nums[i];
  return out;
}

// ─── ex02 · Truy vấn tổng đoạn ───
// Ý tưởng: dựng prefix độ dài n + 1 trong constructor; sumRange = prefix[r + 1] − prefix[l].
// Độ phức tạp: O(n) khởi tạo · O(1) mỗi truy vấn · O(n) bộ nhớ.
// Python/Java: Java field `private final long[] prefix;`. Python `self.prefix = [0, *accumulate(nums)]`.
export class NumArray {
  private prefix: number[];
  constructor(nums: number[]) {
    this.prefix = new Array<number>(nums.length + 1);
    this.prefix[0] = 0;
    for (let i = 0; i < nums.length; i++) this.prefix[i + 1] = this.prefix[i] + nums[i];
  }
  sumRange(left: number, right: number): number {
    return this.prefix[right + 1] - this.prefix[left];
  }
}

// ─── ex03 · Chỉ số cân bằng ───
// Ý tưởng: tổng toàn mảng = total. Duyệt i với left = tổng bên trái; bên phải = total − left − nums[i].
// Độ phức tạp: O(n) time · O(1) space (không cần mảng prefix).
export function pivotIndex(nums: number[]): number {
  let total = 0;
  for (const x of nums) total += x;
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}

// ─── ex04 · Đếm đoạn có tổng = k ───
// Ý tưởng: prefix sum + Map đếm số lần mỗi prefix đã xuất hiện; khởi tạo {0: 1}.
// Độ phức tạp: O(n) time · O(n) space.
// Bẫy: sliding window không dùng được vì có số âm; quên {0: 1}.
export function subarraySum(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]);
  let sum = 0;
  let count = 0;
  for (const x of nums) {
    sum += x;
    count += seen.get(sum - k) ?? 0;
    seen.set(sum, (seen.get(sum) ?? 0) + 1);
  }
  return count;
}

// ─── ex05 · Tổng hình chữ nhật ───
// Ý tưởng: prefix 2D kích thước (r + 1) × (c + 1); truy vấn bằng bao hàm – loại trừ 4 góc.
// Độ phức tạp: O(r·c) khởi tạo · O(1) mỗi truy vấn.
export class NumMatrix {
  private P: number[][];
  constructor(matrix: number[][]) {
    const r = matrix.length;
    const c = matrix[0].length;
    this.P = Array.from({ length: r + 1 }, () => new Array<number>(c + 1).fill(0));
    for (let i = 0; i < r; i++)
      for (let j = 0; j < c; j++) this.P[i + 1][j + 1] = matrix[i][j] + this.P[i][j + 1] + this.P[i + 1][j] - this.P[i][j];
  }
  sumRegion(row1: number, col1: number, row2: number, col2: number): number {
    const P = this.P;
    return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1];
  }
}

// ─── ex06 · Đặt chỗ chuyến bay ───
// Ý tưởng: difference array: diff[first − 1] += seats, diff[last] −= seats; kết quả = prefix của diff.
// Độ phức tạp: O(n + b) time · O(n) space.
// Bẫy: chuyến đánh số từ 1 → trừ 1 khi đổi sang chỉ số; diff dài n + 1 để diff[last] không vượt biên khi last = n.
export function flightBookings(bookings: number[][], n: number): number[] {
  const diff = new Array<number>(n + 1).fill(0);
  for (const [first, last, seats] of bookings) {
    diff[first - 1] += seats;
    diff[last] -= seats;
  }
  const out = new Array<number>(n);
  let run = 0;
  for (let i = 0; i < n; i++) out[i] = run += diff[i];
  return out;
}

// ─── ex07 · Đoạn dài nhất có số 0 = số 1 ───
// Ý tưởng: đổi 0 → −1; cần đoạn có tổng 0 dài nhất ⇔ hai prefix bằng nhau xa nhau nhất.
//   Lưu chỉ số ĐẦU TIÊN của mỗi giá trị prefix (khởi tạo prefix 0 ở chỉ số −1).
// Độ phức tạp: O(n) time · O(n) space (prefix nằm trong [−n, n] → có thể dùng mảng 2n + 1 thay Map).
export function findMaxLength(nums: number[]): number {
  const first = new Map<number, number>([[0, -1]]);
  let sum = 0;
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i] === 1 ? 1 : -1;
    const j = first.get(sum);
    if (j === undefined) first.set(sum, i);
    else best = Math.max(best, i - j);
  }
  return best;
}

// ─── ex08 · Đếm đoạn có tổng chia hết cho k ───
// Ý tưởng: (prefix[i] − prefix[j]) chia hết cho k ⇔ prefix[i] ≡ prefix[j] (mod k). Đếm số dư (đã chuẩn hóa không âm).
// Độ phức tạp: O(n + k) time · O(k) space (mảng đếm số dư).
// Bẫy: JS/Java `-2 % 5 === -2` → phải ((x % k) + k) % k; Python `%` đã không âm. Java: `Math.floorMod(sum, k)`.
export function subarraysDivByK(nums: number[], k: number): number {
  const cnt = new Array<number>(k).fill(0);
  cnt[0] = 1;
  let mod = 0;
  let count = 0;
  for (const x of nums) {
    mod = (((mod + x) % k) + k) % k;
    count += cnt[mod]++;
  }
  return count;
}

// ─── ex09 · Xe đưa đón ───
// Ý tưởng: difference array theo km: +num ở from, −num ở to (xuống ở to trước khi người khác lên ở to).
//   Quét prefix, bất kỳ lúc nào vượt capacity → false.
// Độ phức tạp: O(t + K) với K = km lớn nhất (10³) · O(K) space.
// Cách khác: sort sự kiện (sweep line, A11) — dùng khi tọa độ lớn.
export function carPooling(trips: number[][], capacity: number): boolean {
  const diff = new Array<number>(1001).fill(0);
  for (const [num, from, to] of trips) {
    diff[from] += num;
    diff[to] -= num;
  }
  let load = 0;
  for (const d of diff) {
    load += d;
    if (load > capacity) return false;
  }
  return true;
}

// ─── ex10 · Số user online cao nhất ───
// Ý tưởng: difference array trên [0, T]: +1 ở start, −1 ở end (nửa mở [start, end) → end không tính).
// Độ phức tạp: O(s + T) time · O(T) space.
// Ngoài đời: T lớn hoặc dữ liệu thưa → sort 2s sự kiện (end trước start khi cùng thời điểm) — O(s log s), A11.
export function maxOnline(sessions: number[][], T: number): number {
  const diff = new Int32Array(T + 1);
  for (const [s, e] of sessions) {
    diff[s]++;
    diff[e]--;
  }
  let cur = 0;
  let best = 0;
  for (let t = 0; t <= T; t++) {
    cur += diff[t];
    if (cur > best) best = cur;
  }
  return best;
}
