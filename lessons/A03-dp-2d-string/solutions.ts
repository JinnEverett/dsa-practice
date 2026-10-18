// A03 · Đáp án best practice. Chỉ mở sau khi check ✅.
const MOD = 1_000_000_007;

// ─── ex01 · Số đường đi trên lưới ───
// Ý tưởng: dp[r][c] = dp[r-1][c] + dp[r][c-1]; nén còn một hàng. Kết quả mod 1e9+7.
// Độ phức tạp: O(m·n) time · O(n) space. (Công thức tổ hợp C(m+n-2, m-1) cần nghịch đảo modulo — ngoài phạm vi buổi này.)
export function uniquePaths(m: number, n: number): number {
  const row = new Array<number>(n).fill(1);
  for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) row[c] = (row[c] + row[c - 1]) % MOD;
  return row[n - 1];
}

// ─── ex02 · Đường đi có chướng ngại vật ───
// Ý tưởng: như ex01 nhưng ô bị chặn (1) đặt dp = 0. Hàng đơn: row[c] giữ giá trị ô phía trên trước khi ghi đè.
// Độ phức tạp: O(R·C) time · O(C) space. Bẫy: ô xuất phát bị chặn ⇒ 0.
export function uniquePathsWithObstacles(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0].length;
  const row = new Array<number>(C).fill(0);
  row[0] = grid[0][0] === 1 ? 0 : 1;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1) row[c] = 0;
      else if (c > 0) row[c] = (row[c] + row[c - 1]) % MOD;
    }
  return row[C - 1];
}

// ─── ex03 · Tổng nhỏ nhất trên đường đi ───
// Ý tưởng: dp[r][c] = grid[r][c] + min(trên, trái); hàng đầu / cột đầu chỉ có một hướng.
// Độ phức tạp: O(R·C) time · O(C) space (một hàng).
export function minPathSum(grid: number[][]): number {
  const C = grid[0].length;
  const row = new Array<number>(C).fill(Infinity);
  row[0] = 0;
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < C; c++) row[c] = grid[r][c] + Math.min(row[c], c > 0 ? row[c - 1] : Infinity);
  return row[C - 1];
}

// ─── ex04 · LCS ───
// Ý tưởng: dp[i][j] = LCS(a[0..i), b[0..j)). Cùng ký tự → chéo + 1, khác → max(trên, trái). Hai hàng luân phiên.
// Độ phức tạp: O(n·m) time · O(m) space (chỉ cần độ dài; muốn chuỗi phải giữ cả bảng và truy vết).
// Python/Java: Python dùng list; chậm ~30× — n = 3000 cũng cần ~9·10⁶ ô: ổn định trong giới hạn ×10 là sát, nên dùng 2 hàng + biến cục bộ.
export function longestCommonSubsequence(a: string, b: string): number {
  const m = b.length;
  let prev = new Int32Array(m + 1);
  let cur = new Int32Array(m + 1);
  for (let i = 1; i <= a.length; i++) {
    const ai = a.charCodeAt(i - 1);
    for (let j = 1; j <= m; j++) cur[j] = ai === b.charCodeAt(j - 1) ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    [prev, cur] = [cur, prev];
  }
  return prev[m];
}

// ─── ex05 · Edit distance ───
// Ý tưởng: dp[i][j] = số thao tác tối thiểu biến a[0..i) → b[0..j); khác ký tự: 1 + min(thay, xóa, chèn).
// Độ phức tạp: O(n·m) time · O(m) space. Bẫy: base dp[i][0] = i, dp[0][j] = j; rolling array cần giữ ô chéo trong biến.
export function minDistance(a: string, b: string): number {
  const m = b.length;
  const dp = new Int32Array(m + 1);
  for (let j = 0; j <= m; j++) dp[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let diag = dp[0]; // dp[i-1][j-1]
    dp[0] = i;
    const ai = a.charCodeAt(i - 1);
    for (let j = 1; j <= m; j++) {
      const up = dp[j]; // dp[i-1][j]
      dp[j] = ai === b.charCodeAt(j - 1) ? diag : 1 + Math.min(diag, up, dp[j - 1]);
      diag = up;
    }
  }
  return dp[m];
}

// ─── ex06 · Dãy con palindrome dài nhất ───
// Ý tưởng: dp[i][j] = LPS(s[i..j]); s[i]==s[j] → dp[i+1][j-1] + 2, khác → max(dp[i+1][j], dp[i][j-1]). i giảm dần, j tăng dần.
// Cách khác: LPS(s) = LCS(s, reverse(s)).
// Độ phức tạp: O(n²) time · O(n) space (giữ dòng i+1 và dòng i).
export function longestPalindromeSubseq(s: string): number {
  const n = s.length;
  let next = new Int32Array(n); // dp[i+1][*]
  let cur = new Int32Array(n); // dp[i][*]
  for (let i = n - 1; i >= 0; i--) {
    cur.fill(0);
    cur[i] = 1;
    for (let j = i + 1; j < n; j++) cur[j] = s[i] === s[j] ? next[j - 1] + 2 : Math.max(next[j], cur[j - 1]);
    [next, cur] = [cur, next];
  }
  return next[n - 1];
}

// ─── ex07 · Chuỗi con palindrome dài nhất (liên tiếp) ───
// Ý tưởng: mở rộng quanh 2n-1 tâm (tâm là ký tự hoặc khe giữa hai ký tự).
// Độ phức tạp: O(n²) time · O(1) space. Nhiều đáp án hợp lệ ⇒ bài dùng compare. Manacher O(n) ở A09.
export function longestPalindrome(s: string): string {
  let bestL = 0;
  let bestLen = 0;
  for (let c = 0; c < 2 * s.length - 1; c++) {
    let l = c >> 1;
    let r = l + (c & 1);
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--;
      r++;
    }
    if (r - l - 1 > bestLen) {
      bestLen = r - l - 1;
      bestL = l + 1;
    }
  }
  return s.slice(bestL, bestL + bestLen);
}

// ─── ex08 · Chuỗi đan xen ───
// Ý tưởng: dp[i][j] = s3[0..i+j) tạo được từ s1[0..i) và s2[0..j) đan xen; nén còn một hàng.
// Độ phức tạp: O(n·m) time · O(m) space. Bẫy: |s1|+|s2| ≠ |s3| ⇒ false ngay.
export function isInterleave(s1: string, s2: string, s3: string): boolean {
  const n = s1.length;
  const m = s2.length;
  if (n + m !== s3.length) return false;
  const dp = new Array<boolean>(m + 1).fill(false);
  dp[0] = true;
  for (let j = 1; j <= m; j++) dp[j] = dp[j - 1] && s2[j - 1] === s3[j - 1];
  for (let i = 1; i <= n; i++) {
    dp[0] = dp[0] && s1[i - 1] === s3[i - 1];
    for (let j = 1; j <= m; j++) dp[j] = (dp[j] && s1[i - 1] === s3[i + j - 1]) || (dp[j - 1] && s2[j - 1] === s3[i + j - 1]);
  }
  return dp[m];
}

// ─── ex09 · 🔴 Mảnh đất vuông lớn nhất ───
// Ý tưởng: dp[r][c] = cạnh của hình vuông toàn '1' lớn nhất có góc DƯỚI-PHẢI tại (r,c) = 1 + min(trên, trái, chéo).
// Độ phức tạp: O(R·C) time · O(C) space. Trả về DIỆN TÍCH (cạnh²).
export function maximalSquare(matrix: string[]): number {
  const C = matrix[0].length;
  let prev = new Int32Array(C + 1);
  let cur = new Int32Array(C + 1);
  let best = 0;
  for (const line of matrix) {
    for (let c = 1; c <= C; c++) {
      cur[c] = line[c - 1] === '1' ? 1 + Math.min(prev[c], cur[c - 1], prev[c - 1]) : 0;
      if (cur[c] > best) best = cur[c];
    }
    [prev, cur] = [cur, prev];
  }
  return best * best;
}

// ─── ex10 · 🔴 Diff theo dòng ───
// Ý tưởng: bảng suffix lcs[i][j] = LCS(a[i..], b[j..]); truy vết từ (0,0): bằng nhau → giữ; khác → xóa a[i] nếu
//   lcs[i+1][j] ≥ lcs[i][j+1] (ưu tiên xóa trước thêm), ngược lại thêm b[j]. Hết một bên → phần còn lại xóa/thêm hết.
// Độ phức tạp: O(n·m) time · O(n·m) space (cần cả bảng để truy vết; Hirschberg giảm còn O(min) nhưng ngoài phạm vi).
// Bẫy: quy tắc tie phải cố định để đầu ra duy nhất; Python/Java: bảng int 2D 4·10⁶ ô — Java dùng int[][], Python dùng list of list (chậm hơn, giới hạn ×10 đã tính).
export function diffLines(a: string[], b: string[]): string[] {
  const n = a.length;
  const m = b.length;
  const w = m + 1;
  const lcs = new Int32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i * w + j] = a[i] === b[j] ? lcs[(i + 1) * w + j + 1] + 1 : Math.max(lcs[(i + 1) * w + j], lcs[i * w + j + 1]);
  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push(' ' + a[i]);
      i++;
      j++;
    } else if (lcs[(i + 1) * w + j] >= lcs[i * w + j + 1]) out.push('-' + a[i++]);
    else out.push('+' + b[j++]);
  }
  while (i < n) out.push('-' + a[i++]);
  while (j < m) out.push('+' + b[j++]);
  return out;
}
