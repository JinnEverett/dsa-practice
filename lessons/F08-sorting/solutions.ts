// F08 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Merge sort ───
// Ý tưởng: bottom-up không đệ quy: trộn các khối độ dài 1, 2, 4, … giữa 2 mảng (src ↔ dst) luân phiên.
// Độ phức tạp: O(n log n) time · O(n) space. Không đệ quy → không lo tràn stack, không tạo mảng con ở mỗi lần gọi.
// Bản đệ quy top-down (dễ viết hơn, cũng đạt):
//   sort(a): if (a.length ≤ 1) return a; mid; return merge(sort(left), sort(right))  — nhớ dùng `<=` khi trộn để stable.
// Python/Java: giống hệt; Java dùng `int[] tmp = new int[n]` và `System.arraycopy`.
export function mergeSort(nums: number[]): number[] {
  const n = nums.length;
  let src = nums.slice();
  let dst = new Array<number>(n);
  for (let width = 1; width < n; width *= 2) {
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid = Math.min(lo + width, n);
      const hi = Math.min(lo + 2 * width, n);
      let i = lo;
      let j = mid;
      let k = lo;
      while (i < mid && j < hi) dst[k++] = src[i] <= src[j] ? src[i++] : src[j++];
      while (i < mid) dst[k++] = src[i++];
      while (j < hi) dst[k++] = src[j++];
    }
    [src, dst] = [dst, src];
  }
  return src;
}

// ─── ex02 · Quick sort ───
// Ý tưởng: pivot NGẪU NHIÊN + chia 3 phần (< pivot | = pivot | > pivot, như Dutch flag F05);
//   đệ quy phần NHỎ hơn trước và lặp (vòng while) trên phần lớn → độ sâu stack O(log n) kể cả trường hợp xấu.
// Độ phức tạp: O(n log n) kỳ vọng · O(log n) stack. Mảng toàn phần tử trùng → 1 lượt chia là xong (O(n)).
// Bẫy: pivot = phần tử đầu trên mảng đã sort → O(n²) và đệ quy sâu n tầng → stack overflow.
export function quickSort(nums: number[]): void {
  const sort = (lo: number, hi: number): void => {
    while (lo < hi) {
      const pivot = nums[lo + Math.floor(Math.random() * (hi - lo + 1))];
      let lt = lo;
      let i = lo;
      let gt = hi;
      while (i <= gt) {
        if (nums[i] < pivot) {
          [nums[lt], nums[i]] = [nums[i], nums[lt]];
          lt++;
          i++;
        } else if (nums[i] > pivot) {
          [nums[i], nums[gt]] = [nums[gt], nums[i]];
          gt--;
        } else i++;
      }
      // [lo, lt) < pivot · [lt, gt] = pivot · (gt, hi] > pivot
      if (lt - lo < hi - gt) {
        sort(lo, lt - 1);
        lo = gt + 1;
      } else {
        sort(gt + 1, hi);
        hi = lt - 1;
      }
    }
  };
  sort(0, nums.length - 1);
}

// ─── ex03 · Counting sort ───
// Ý tưởng: đếm số lần mỗi tuổi 0..150, rồi xuất theo thứ tự tuổi.
// Độ phức tạp: O(n + k) với k = 151 · O(k) space phụ.
// Python/Java: Python có thể `sorted` (Timsort viết bằng C, nhanh), nhưng counting sort O(n) vẫn thắng ở n = 10⁶.
export function sortAges(ages: number[]): number[] {
  const cnt = new Array<number>(151).fill(0);
  for (const a of ages) cnt[a]++;
  const out = new Array<number>(ages.length);
  let k = 0;
  for (let age = 0; age <= 150; age++) for (let c = cnt[age]; c > 0; c--) out[k++] = age;
  return out;
}

// ─── ex04 · Sắp theo tần suất ───
// Ý tưởng: đếm tần suất, rồi sort với comparator (tần suất tăng, giá trị giảm).
// Độ phức tạp: O(n log n) time · O(n) space.
// Python/Java: Python `sorted(nums, key=lambda x: (cnt[x], -x))`. Java: cần `Integer[]` (comparator không dùng được với int[])
//   hoặc sort danh sách giá trị khác nhau rồi tự đổ ra mảng.
export function frequencySort(nums: number[]): number[] {
  const freq = new Map<number, number>();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  return nums.slice().sort((a, b) => freq.get(a)! - freq.get(b)! || b - a);
}

// ─── ex05 · Số lớn nhất ghép được ───
// Ý tưởng: a đứng trước b ⇔ chuỗi a + b > b + a. Sort theo comparator đó, nối lại; nếu ký tự đầu là '0' thì kết quả là "0".
// Độ phức tạp: O(n log n · L) với L ≤ 10 chữ số · O(n · L) space.
// Vì sao đúng: quan hệ "ab > ba" có tính bắc cầu (chứng minh qua giá trị số a·10^|b| + b), nên sort cho ra thứ tự tối ưu.
// Bẫy: so sánh số học hay so chuỗi trực tiếp đều sai ([3, 30]: "3" < "30" theo chuỗi nhưng "330" > "303").
export function largestNumber(nums: number[]): string {
  const s = nums.map(String).sort((a, b) => (a + b > b + a ? -1 : a + b < b + a ? 1 : 0));
  const joined = s.join('');
  return joined[0] === '0' ? '0' : joined;
}

// ─── ex06 · Gộp khoảng ───
// Ý tưởng: sort theo start; duyệt, nếu start ≤ end của khoảng cuối trong kết quả thì nới end = max, ngược lại mở khoảng mới.
// Độ phức tạp: O(n log n) time · O(n) space.
// Bẫy: chỉ gán end = cur.end (thiếu max) → sai khi khoảng sau nằm lọt trong khoảng trước ([1,4],[2,3]).
export function mergeIntervals(intervals: number[][]): number[][] {
  const sorted = intervals.map((x) => [x[0], x[1]]).sort((a, b) => a[0] - b[0]);
  const out: number[][] = [];
  for (const cur of sorted) {
    const last = out[out.length - 1];
    if (last && cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]);
    else out.push(cur);
  }
  return out;
}

// ─── ex07 · Đếm nghịch thế ───
// Ý tưởng: merge sort; khi trộn mà lấy phần tử từ nửa PHẢI (src[j] < src[i]), mọi phần tử còn lại của nửa trái (mid − i)
//   đều lớn hơn src[j] → cộng (mid − i) nghịch thế.
// Độ phức tạp: O(n log n) time · O(n) space.
// Bẫy: dùng `<` thay `<=` khi lấy bên trái → đếm nhầm cặp bằng nhau là nghịch thế.
// Cách khác: Fenwick tree trên giá trị đã nén (A08) — cũng O(n log n).
// Python/Java: Java biến đếm `long`.
export function countInversions(nums: number[]): number {
  const n = nums.length;
  let src = nums.slice();
  let dst = new Array<number>(n);
  let inv = 0;
  for (let width = 1; width < n; width *= 2) {
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid = Math.min(lo + width, n);
      const hi = Math.min(lo + 2 * width, n);
      let i = lo;
      let j = mid;
      let k = lo;
      while (i < mid && j < hi) {
        if (src[i] <= src[j]) dst[k++] = src[i++];
        else {
          inv += mid - i;
          dst[k++] = src[j++];
        }
      }
      while (i < mid) dst[k++] = src[i++];
      while (j < hi) dst[k++] = src[j++];
    }
    [src, dst] = [dst, src];
  }
  return inv;
}

// ─── ex08 · Bảng điểm (sort ổn định) ───
// Ý tưởng: sort chỉ số theo điểm giảm dần bằng sort ỔN ĐỊNH của thư viện → cùng điểm giữ thứ tự input.
// Độ phức tạp: O(n log n) time · O(n) space.
// Ghi chú: TS (ES2019+), Python, Java `Arrays.sort(Integer[])`/`List.sort` đều stable. Muốn không phụ thuộc
//   thì thêm tiêu chí phụ là chỉ số: `scores[b] - scores[a] || a - b`.
// Cách khác: counting sort theo điểm 0..100 — O(n + 101), tự nhiên ổn định.
export function rankStudents(names: string[], scores: number[]): string[] {
  const idx = names.map((_, i) => i);
  idx.sort((a, b) => scores[b] - scores[a]);
  return idx.map((i) => names[i]);
}

// ─── ex09 · Xếp hạng sản phẩm ───
// Ý tưởng: một comparator nhiều tiêu chí, nối bằng `||` (TS) — tiêu chí sau chỉ được xét khi tiêu chí trước hòa.
// Độ phức tạp: O(n log n).
// Python/Java: Python `sorted(products, key=lambda p: (-p[1], -p[2], p[3], p[0]))`.
//   Java: `Arrays.sort(products, (a, b) -> a[1] != b[1] ? Integer.compare(b[1], a[1]) : a[2] != b[2] ? Integer.compare(b[2], a[2]) : ...)`
//   hoặc `Comparator.comparingInt((int[] p) -> -p[1]).thenComparingInt(p -> -p[2])...`.
export function rankProducts(products: number[][]): number[] {
  return products
    .slice()
    .sort((a, b) => b[1] - a[1] || b[2] - a[2] || a[3] - b[3] || a[0] - b[0])
    .map((p) => p[0]);
}

// ─── ex10 · Sắp xếp log ───
// Ý tưởng: tách log chữ / log số (log số giữ nguyên thứ tự); log chữ sort theo (nội dung, id) bằng so sánh mã ký tự.
// Độ phức tạp: O(n log n · L).
// Bẫy: `localeCompare` mặc định theo locale (có thể xếp khác thứ tự mã ký tự) → dùng so sánh `<` / `>` trực tiếp.
// Python/Java: Python `key=lambda l: (body, id)` với body/id tách bằng `split(' ', 1)`; Java `compareTo` (so theo mã UTF-16).
export function reorderLogs(logs: string[]): string[] {
  const letters: [string, string, string][] = [];
  const digits: string[] = [];
  for (const log of logs) {
    const sp = log.indexOf(' ');
    const id = log.slice(0, sp);
    const body = log.slice(sp + 1);
    if (body[0] >= '0' && body[0] <= '9') digits.push(log);
    else letters.push([body, id, log]);
  }
  const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
  letters.sort((a, b) => cmp(a[0], b[0]) || cmp(a[1], b[1]));
  return [...letters.map((x) => x[2]), ...digits];
}
