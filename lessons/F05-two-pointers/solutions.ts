// F05 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Xóa trùng trong mảng đã sort ───
// Ý tưởng: con trỏ ghi w; bất biến nums[0..w) không trùng. Chỉ ghi nums[r] khi khác phần tử cuối đã ghi.
// Độ phức tạp: O(n) time · O(1) space.
// Bẫy: so với nums[r − 1] thay vì nums[w − 1] cũng đúng với mảng sort (vì trùng nằm liền nhau), nhưng so với
//   phần tử đã ghi thể hiện đúng bất biến và dùng lại được cho biến thể "giữ tối đa 2 lần" (so với nums[w − 2]).
// Python/Java: Python phải gán từng phần tử `nums[w] = nums[r]`, không gán lại cả list.
export function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;
  let w = 1;
  for (let r = 1; r < nums.length; r++) {
    if (nums[r] !== nums[w - 1]) nums[w++] = nums[r];
  }
  return w;
}

// ─── ex02 · Dồn số 0 về cuối ───
// Ý tưởng: con trỏ ghi w gom mọi số khác 0 lên đầu (giữ thứ tự), sau đó lấp 0 từ w đến hết.
// Độ phức tạp: O(n) time · O(1) space.
// Cách khác: hoán đổi nums[w] ↔ nums[r] khi nums[r] ≠ 0 — một lượt, số lần ghi ít hơn khi mảng ít số 0.
export function moveZeroes(nums: number[]): void {
  let w = 0;
  for (let r = 0; r < nums.length; r++) if (nums[r] !== 0) nums[w++] = nums[r];
  while (w < nums.length) nums[w++] = 0;
}

// ─── ex03 · Two Sum trên mảng đã sort ───
// Ý tưởng: con trỏ ngược chiều; tổng nhỏ quá → i++, lớn quá → j--.
// Độ phức tạp: O(n) time · O(1) space.
// Vì sao đúng: nếu nums[i] + nums[j] > target thì j không thể ghép với bất kỳ i' ≥ i → bỏ j an toàn (đối xứng cho i).
// Python/Java: Java `long sum = (long) nums[i] + nums[j]` — hai số 10⁹ cộng lại tràn int.
export function twoSumSorted(nums: number[], target: number): number[] {
  let i = 0;
  let j = nums.length - 1;
  while (i < j) {
    const sum = nums[i] + nums[j];
    if (sum === target) return [i, j];
    if (sum < target) i++;
    else j--;
  }
  return [];
}

// ─── ex04 · Merge tại chỗ ───
// Ý tưởng: ghi TỪ CUỐI: so phần tử lớn nhất còn lại của hai mảng, đặt vào ô k = i + j + 1 cuối cùng còn trống.
//   Vùng ghi luôn ở sau vùng đọc của nums1 → không đè dữ liệu chưa đọc.
// Độ phức tạp: O(m + n) time · O(1) space.
// Bẫy: dừng khi i < 0 nhưng nums2 còn → phải chép nốt; ngược lại nums1 còn thì đã nằm đúng chỗ, không cần làm gì.
export function mergeSorted(nums1: number[], m: number, nums2: number[], n: number): void {
  let i = m - 1;
  let j = n - 1;
  for (let k = m + n - 1; j >= 0; k--) {
    nums1[k] = i >= 0 && nums1[i] > nums2[j] ? nums1[i--] : nums2[j--];
  }
}

// ─── ex05 · Bình phương mảng đã sort ───
// Ý tưởng: bình phương lớn nhất nằm ở MỘT TRONG HAI ĐẦU (số âm lớn hoặc số dương lớn). Two pointers hai đầu,
//   lấy |giá trị| lớn hơn, ghi vào out từ cuối về đầu.
// Độ phức tạp: O(n) time · O(n) space cho output.
// Cách khác: bình phương rồi sort — O(n log n), một dòng, đủ dùng khi không đòi hỏi O(n).
export function sortedSquares(nums: number[]): number[] {
  const n = nums.length;
  const out = new Array<number>(n);
  let i = 0;
  let j = n - 1;
  for (let k = n - 1; k >= 0; k--) {
    if (Math.abs(nums[i]) > Math.abs(nums[j])) out[k] = nums[i] * nums[i++];
    else out[k] = nums[j] * nums[j--];
  }
  return out;
}

// ─── ex06 · Bể chứa nhiều nước nhất ───
// Ý tưởng: bắt đầu rộng nhất (i = 0, j = n − 1), luôn di chuyển cột THẤP hơn vào trong.
// Vì sao đúng: diện tích bị chặn bởi cột thấp; giữ cột thấp và thu hẹp chiều rộng thì diện tích chỉ có thể giảm →
//   mọi cặp chứa cột thấp đó với j' < j đều không tốt hơn → loại cột thấp an toàn.
// Độ phức tạp: O(n) time · O(1) space.
export function maxArea(height: number[]): number {
  let i = 0;
  let j = height.length - 1;
  let best = 0;
  while (i < j) {
    const h = Math.min(height[i], height[j]);
    best = Math.max(best, h * (j - i));
    if (height[i] < height[j]) i++;
    else j--;
  }
  return best;
}

// ─── ex07 · 3Sum ───
// Ý tưởng: sort; cố định k (bỏ qua nếu bằng phần tử trước — tránh trùng); tìm cặp tổng −nums[k] trong (k, n) bằng
//   two pointers; tìm được thì tiến cả i, j qua các giá trị trùng.
// Độ phức tạp: O(n²) time · O(log n)–O(n) space cho sort.
// Tối ưu nhỏ: nums[k] > 0 thì dừng (mọi phần tử sau đều dương).
// Cách khác: với mỗi k dùng hash set — cũng O(n²) nhưng khó bỏ trùng và tốn bộ nhớ.
// Python/Java: Java `Arrays.sort(nums)`, kết quả `List<List<Integer>>` với `Arrays.asList(a, b, c)`.
export function threeSum(nums: number[]): number[][] {
  const a = nums.slice().sort((x, y) => x - y);
  const out: number[][] = [];
  for (let k = 0; k < a.length - 2; k++) {
    if (a[k] > 0) break;
    if (k > 0 && a[k] === a[k - 1]) continue;
    let i = k + 1;
    let j = a.length - 1;
    while (i < j) {
      const sum = a[k] + a[i] + a[j];
      if (sum < 0) i++;
      else if (sum > 0) j--;
      else {
        out.push([a[k], a[i], a[j]]);
        while (i < j && a[i] === a[i + 1]) i++;
        while (i < j && a[j] === a[j - 1]) j--;
        i++;
        j--;
      }
    }
  }
  return out;
}

// ─── ex08 · Sắp xếp 3 màu (Dutch national flag) ───
// Ý tưởng: bất biến [0, lo) = 0 · [lo, mid) = 1 · [mid, hi] = chưa xét · (hi, n) = 2.
//   nums[mid] = 0 → đổi với lo, lo++, mid++ · = 1 → mid++ · = 2 → đổi với hi, hi-- (KHÔNG tăng mid: phần tử mới đổi về chưa xét).
// Độ phức tạp: O(n) time, một lượt · O(1) space.
export function sortColors(nums: number[]): void {
  let lo = 0;
  let mid = 0;
  let hi = nums.length - 1;
  while (mid <= hi) {
    if (nums[mid] === 0) {
      [nums[lo], nums[mid]] = [nums[mid], nums[lo]];
      lo++;
      mid++;
    } else if (nums[mid] === 1) mid++;
    else {
      [nums[mid], nums[hi]] = [nums[hi], nums[mid]];
      hi--;
    }
  }
}

// ─── ex09 · Xếp kiện hàng lên xe ───
// Ý tưởng (greedy + two pointers): sort; kiện nặng nhất (j) luôn đi một chuyến; nếu ghép được với kiện nhẹ nhất (i) thì ghép.
// Vì sao đúng: kiện nặng nhất nếu không ghép được với kiện nhẹ nhất thì không ghép được với ai → đi một mình.
//   Nếu ghép được, ghép với kiện nhẹ nhất không bao giờ tệ hơn (lập luận đổi chỗ — exchange argument, I10).
// Độ phức tạp: O(n log n) time (sort) · O(1) space phụ (nếu sort tại chỗ).
export function minTrips(weights: number[], limit: number): number {
  const w = weights.slice().sort((a, b) => a - b);
  let i = 0;
  let j = w.length - 1;
  let trips = 0;
  while (i <= j) {
    if (w[i] + w[j] <= limit) i++;
    j--;
    trips++;
  }
  return trips;
}

// ─── ex10 · So sánh ô nhập có phím xóa ───
// Ý tưởng O(1) bộ nhớ: duyệt cả hai chuỗi TỪ CUỐI. Hàm nextValid(s, i) bỏ qua ký tự bị xóa: gặp '#' thì skip++,
//   gặp chữ khi skip > 0 thì skip--, ngược lại đó là ký tự còn sống. So từng cặp ký tự sống.
// Độ phức tạp: O(n + m) time · O(1) space.
// Cách khác (dễ hơn): dùng stack dựng lại chuỗi cuối rồi so — O(n + m) bộ nhớ; hoàn toàn chấp nhận được trong code thật.
function nextValid(s: string, i: number): number {
  let skip = 0;
  while (i >= 0) {
    if (s[i] === '#') skip++;
    else if (skip > 0) skip--;
    else break;
    i--;
  }
  return i;
}
export function backspaceCompare(s: string, t: string): boolean {
  let i = s.length - 1;
  let j = t.length - 1;
  for (;;) {
    i = nextValid(s, i);
    j = nextValid(t, j);
    if (i < 0 || j < 0) return i < 0 && j < 0;
    if (s[i] !== t[j]) return false;
    i--;
    j--;
  }
}
