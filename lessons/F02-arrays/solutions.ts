// F02 · Đáp án best practice. Chỉ mở sau khi check ✅.

function reverseRange(a: number[], i: number, j: number): void {
  for (; i < j; i++, j--) {
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
}

// ─── ex01 · Xoay mảng sang phải k bước ───
// Ý tưởng: mẹo đảo 3 lần — đảo cả mảng, đảo k phần tử đầu, đảo phần còn lại.
// Độ phức tạp: O(n) time · O(1) space.
// Bẫy: k > n → phải k %= n; n = 0 thì k % 0 = NaN → return sớm.
// Cách khác: mảng phụ `out[(i + k) % n] = nums[i]` rồi copy lại — dễ nghĩ hơn nhưng O(n) bộ nhớ.
//   Cách "nối vòng" (cyclic replacements) cũng O(1) nhưng khó viết đúng hơn nhiều.
// Python/Java: Python `nums[:] = nums[-k:] + nums[:-k]` gọn nhưng tạo bản sao O(n) (và sai khi k = 0 nếu
//   không % n — `nums[-0:]` là cả mảng). Java: viết hàm reverse(int[] a, int i, int j) giống TS.
export function rotateRight(nums: number[], k: number): void {
  const n = nums.length;
  if (n === 0) return;
  k %= n;
  reverseRange(nums, 0, n - 1);
  reverseRange(nums, 0, k - 1);
  reverseRange(nums, k, n - 1);
}

// ─── ex02 · Cộng một ───
// Ý tưởng: cộng từ hàng đơn vị; gặp 9 thì thành 0 và nhớ 1 sang trái; gặp chữ số < 9 thì +1 rồi xong.
//   Nếu mọi chữ số đều là 9 → kết quả là 1 theo sau bởi n số 0.
// Độ phức tạp: O(n) time · O(1) space phụ (ngoài kết quả).
// Vì sao là best practice: dừng sớm ngay khi hết nhớ, không cần biến carry tổng quát.
// Python/Java: Java trả về `int[]` mới khi toàn 9: `int[] r = new int[n + 1]; r[0] = 1;` (phần còn lại mặc định 0).
export function plusOne(digits: number[]): number[] {
  const out = digits.slice();
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i] < 9) {
      out[i]++;
      return out;
    }
    out[i] = 0;
  }
  out.unshift(1); // chỉ xảy ra khi toàn số 9, O(n) một lần
  return out;
}

// ─── ex03 · Tam giác Pascal ───
// Ý tưởng: hàng i có i + 1 phần tử, hai đầu là 1, ở giữa row[j] = prev[j - 1] + prev[j].
// Độ phức tạp: O(numRows²) time và space (chính là kích thước output).
// Python/Java: Java `List<List<Integer>>`: mỗi hàng `new ArrayList<>()`, `row.add(prev.get(j - 1) + prev.get(j))`.
export function pascal(numRows: number): number[][] {
  const rows: number[][] = [];
  for (let i = 0; i < numRows; i++) {
    const row = new Array<number>(i + 1).fill(1);
    for (let j = 1; j < i; j++) row[j] = rows[i - 1][j - 1] + rows[i - 1][j];
    rows.push(row);
  }
  return rows;
}

// ─── ex04 · Chuyển vị ma trận ───
// Ý tưởng: out[c][r] = matrix[r][c]; ma trận kết quả có kích thước c × r.
// Độ phức tạp: O(r·c) time và space.
// Bẫy: ma trận không vuông → không làm tại chỗ được; tạo out với số hàng = số cột cũ.
// Python/Java: Python `[list(row) for row in zip(*matrix)]` là idiom chuẩn. Java: `new int[c][r]`.
export function transpose(matrix: number[][]): number[][] {
  const r = matrix.length;
  const c = matrix[0].length;
  const out = Array.from({ length: c }, () => new Array<number>(r));
  for (let i = 0; i < r; i++) {
    const row = matrix[i];
    for (let j = 0; j < c; j++) out[j][i] = row[j];
  }
  return out;
}

// ─── ex05 · Duyệt xoắn ốc ───
// Ý tưởng: 4 biên top/bottom/left/right. Đi phải theo hàng top (top++), đi xuống theo cột right (right--),
//   đi trái theo hàng bottom (bottom--) NẾU còn hàng, đi lên theo cột left (left++) NẾU còn cột.
// Độ phức tạp: O(r·c) time · O(1) space phụ.
// Bẫy: thiếu 2 điều kiện "nếu còn hàng/cột" → ma trận 1 hàng hoặc 1 cột bị đọc lặp phần tử.
// Cách khác: mảng visited + đổi hướng khi chạm biên/ô đã thăm — tốn O(r·c) bộ nhớ.
export function spiralOrder(matrix: number[][]): number[] {
  const out: number[] = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) out.push(matrix[top][j]);
    top++;
    for (let i = top; i <= bottom; i++) out.push(matrix[i][right]);
    right--;
    if (top <= bottom) {
      for (let j = right; j >= left; j--) out.push(matrix[bottom][j]);
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) out.push(matrix[i][left]);
      left++;
    }
  }
  return out;
}

// ─── ex06 · Xoay ảnh 90° ───
// Ý tưởng: xoay phải 90° = transpose (đổi chéo qua đường chéo chính) + đảo từng hàng.
// Độ phức tạp: O(n²) time · O(1) space.
// Vì sao là best practice: hai bước đơn giản, mỗi bước dễ kiểm chứng; không phải nhớ công thức xoay 4 ô.
// Bẫy: transpose phải chỉ duyệt j > i, nếu duyệt cả ma trận thì đổi chỗ 2 lần = không đổi gì.
// Python/Java: Python `matrix[:] = [list(r)[::-1] for r in zip(*matrix)]` gọn nhưng tạo ma trận mới (O(n²) bộ nhớ).
export function rotateImage(matrix: number[][]): void {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const t = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = t;
    }
  }
  for (const row of matrix) reverseRange(row, 0, n - 1);
}

// ─── ex07 · Đặt 0 cho hàng và cột ───
// Ý tưởng O(1): dùng hàng 0 và cột 0 làm "cờ". Trước tiên nhớ riêng hàng 0 / cột 0 có số 0 ban đầu không.
//   Quét ô (i ≥ 1, j ≥ 1): gặp 0 thì đặt matrix[i][0] = matrix[0][j] = 0. Sau đó xóa theo cờ, cuối cùng xử lý hàng 0 / cột 0.
// Độ phức tạp: O(r·c) time · O(1) space.
// Bẫy: đặt 0 ngay khi gặp → các số 0 "mới" lan tiếp và xóa nhầm. Phải tách pha "ghi nhận" và pha "xóa".
// Cách khác (dễ hơn, vẫn đạt): hai mảng boolean rows[r], cols[c] — O(r + c) bộ nhớ.
export function setZeroes(matrix: number[][]): void {
  const r = matrix.length;
  const c = matrix[0].length;
  const firstRowZero = matrix[0].some((v) => v === 0);
  let firstColZero = false;
  for (let i = 0; i < r; i++) if (matrix[i][0] === 0) firstColZero = true;
  for (let i = 1; i < r; i++) {
    for (let j = 1; j < c; j++) {
      if (matrix[i][j] === 0) {
        matrix[i][0] = 0;
        matrix[0][j] = 0;
      }
    }
  }
  for (let i = 1; i < r; i++) {
    for (let j = 1; j < c; j++) {
      if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
    }
  }
  if (firstRowZero) matrix[0].fill(0);
  if (firstColZero) for (let i = 0; i < r; i++) matrix[i][0] = 0;
}

// ─── ex08 · Tích các phần tử còn lại ───
// Ý tưởng: out[i] = (tích bên trái i) × (tích bên phải i). Lượt 1 ghi tích bên trái vào out,
//   lượt 2 đi từ phải sang nhân thêm tích bên phải (giữ trong 1 biến).
// Độ phức tạp: O(n) time · O(1) space phụ.
// Bẫy: dùng phép chia → sai khi có số 0 (đề cấm luôn). JS có thể sinh -0 (vd. 0 × -3): bộ chấm coi -0 = 0.
// Python/Java: giống hệt; Java dùng int vì đề bảo đảm tích vừa int.
export function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const out = new Array<number>(n);
  out[0] = 1;
  for (let i = 1; i < n; i++) out[i] = out[i - 1] * nums[i - 1];
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}

// ─── ex09 · Mã đơn bị thất lạc ───
// Ý tưởng: mọi giá trị nằm trong [1, n] → dùng chính mảng làm bảng đánh dấu: gặp v thì đổi dấu ô v − 1 thành âm.
//   Ô nào còn dương ở cuối → mã (chỉ số + 1) chưa từng xuất hiện.
// Độ phức tạp: O(n) time · O(1) space phụ.
// Bẫy: ô có thể đã bị đổi âm → lấy Math.abs(v) trước khi dùng làm chỉ số; đổi dấu bằng -Math.abs để không lật lại.
// Cách khác: Set/boolean[] — O(n) bộ nhớ, dễ hơn, đủ dùng trong code thật.
export function missingOrders(scanned: number[]): number[] {
  for (const v of scanned) {
    const idx = Math.abs(v) - 1;
    scanned[idx] = -Math.abs(scanned[idx]);
  }
  const out: number[] = [];
  for (let i = 0; i < scanned.length; i++) if (scanned[i] > 0) out.push(i + 1);
  return out;
}

// ─── ex10 · Heatmap doanh thu theo giờ ───
// Ý tưởng: tạo đúng ma trận 7 × 24 toàn 0 (mỗi hàng là mảng riêng), cộng dồn từng sự kiện.
// Độ phức tạp: O(m) time với m sự kiện · O(1) space (ma trận cố định 168 ô).
// Bẫy: `new Array(7).fill(new Array(24).fill(0))` → 7 hàng là CÙNG một mảng, cộng vào hàng 1 cũng thấy ở hàng 6.
// Python/Java: Java phải là `long[][]` (1 ô tới 10¹² > 2³¹); Python `[[0] * 24 for _ in range(7)]`.
export function revenueHeatmap(events: number[][]): number[][] {
  const grid = Array.from({ length: 7 }, () => new Array<number>(24).fill(0));
  for (const [day, hour, amount] of events) grid[day][hour] += amount;
  return grid;
}
