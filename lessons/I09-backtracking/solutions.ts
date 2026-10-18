// I09 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Khung chung: choose → explore → unchoose. Đường đi hiện tại là MỘT mảng dùng chung (push / pop),
// chỉ sao chép (slice) khi ghi nhận một đáp án.

/**
 * ex01 · subsets
 * Ý tưởng: cây quyết định theo từng phần tử — "lấy" hoặc "bỏ". Cách gọn: mỗi nút của cây ĐỀU là một tập con
 *   (ghi nhận ngay khi vào hàm), rồi thử thêm từng phần tử có chỉ số ≥ start.
 * Độ phức tạp: O(n · 2ⁿ) — có 2ⁿ tập con, mỗi tập sao chép tối đa n phần tử. Không thể tốt hơn vì output cỡ đó.
 * Vì sao best practice: `start` bảo đảm mỗi tập con chỉ sinh một lần theo thứ tự chỉ số tăng (không có [2,1] sau [1,2]).
 * Bẫy: quên sao chép `path` khi ghi nhận (mọi đáp án cùng trỏ vào một mảng); quên tập rỗng.
 * Cách khác: bitmask 0..2ⁿ−1 (n ≤ 30); lặp dần "thêm phần tử mới vào mọi tập đang có".
 * Python/Java: Python `res.append(path[:])`; Java `res.add(new ArrayList<>(path))`.
 */
export function subsets(nums: number[]): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  const go = (start: number) => {
    res.push(path.slice());
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]); // choose
      go(i + 1); // explore
      path.pop(); // unchoose
    }
  };
  go(0);
  return res;
}

/**
 * ex02 · subsetsWithDup
 * Ý tưởng: sắp xếp để các số bằng nhau nằm cạnh nhau; ở CÙNG một tầng của cây, bỏ qua phần tử bằng phần tử đứng ngay trước
 *   nó (`i > start && nums[i] === nums[i - 1]`). Dùng số trùng ở tầng sâu hơn thì vẫn được.
 * Độ phức tạp: O(n · số tập con khác nhau) ≤ O(n · 2ⁿ).
 * Vì sao best practice: cắt nhánh trùng NGAY từ đầu thay vì sinh hết rồi khử bằng Set (nums = 20 số bằng nhau: 2²⁰ nhánh
 *   so với 21 tập con thật).
 * Bẫy: điều kiện bỏ qua là `i > start` chứ không phải `i > 0` (nếu không sẽ cấm luôn việc dùng hai số bằng nhau liên tiếp).
 * Cách khác: đếm số lần xuất hiện của mỗi giá trị rồi chọn 0..count.
 * Python/Java: Python `nums.sort()`; Java `Arrays.sort(nums)`.
 */
export function subsetsWithDup(nums: number[]): number[][] {
  const a = nums.slice().sort((x, y) => x - y);
  const res: number[][] = [];
  const path: number[] = [];
  const go = (start: number) => {
    res.push(path.slice());
    for (let i = start; i < a.length; i++) {
      if (i > start && a[i] === a[i - 1]) continue;
      path.push(a[i]);
      go(i + 1);
      path.pop();
    }
  };
  go(0);
  return res;
}

/**
 * ex03 · permute
 * Ý tưởng: mỗi tầng chọn một phần tử CHƯA dùng (mảng `used`) đặt vào vị trí tiếp theo; đủ n thì ghi nhận.
 * Độ phức tạp: O(n · n!).
 * Vì sao best practice: `used` là mảng boolean O(1) thay vì `path.includes(x)` (O(n)).
 * Bẫy: quên bỏ đánh dấu `used` khi unchoose.
 * Cách khác: hoán đổi tại chỗ (swap(start, i)) — không cần `used`, nhưng thứ tự đáp án khác.
 * Python/Java: Python có `itertools.permutations` (dùng để kiểm tra, không nên dùng khi luyện); Java `boolean[] used`.
 */
export function permute(nums: number[]): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  const used = new Uint8Array(nums.length);
  const go = () => {
    if (path.length === nums.length) return void res.push(path.slice());
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = 1;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = 0;
    }
  };
  go();
  return res;
}

/**
 * ex04 · permuteUnique
 * Ý tưởng: sắp xếp; trong cùng tầng, bỏ qua `nums[i]` nếu bằng `nums[i-1]` mà `nums[i-1]` CHƯA được dùng (`!used[i-1]`)
 *   — tức là ép các số bằng nhau xuất hiện theo đúng thứ tự chỉ số.
 * Độ phức tạp: O(n · số hoán vị khác nhau).
 * Vì sao best practice: chỉ sinh hoán vị thật sự khác nhau; [1×8, 2] chỉ có 9 hoán vị, trong khi sinh hết rồi Set là 9! = 362 880.
 * Bẫy: điều kiện `!used[i-1]` (không phải `used[i-1]`; bản kia cũng đúng nhưng cắt nhánh kém hơn).
 * Cách khác: đếm tần suất từng giá trị (Map) và chọn giá trị còn dư.
 * Python/Java: tương tự.
 */
export function permuteUnique(nums: number[]): number[][] {
  const a = nums.slice().sort((x, y) => x - y);
  const res: number[][] = [];
  const path: number[] = [];
  const used = new Uint8Array(a.length);
  const go = () => {
    if (path.length === a.length) return void res.push(path.slice());
    for (let i = 0; i < a.length; i++) {
      if (used[i] || (i > 0 && a[i] === a[i - 1] && !used[i - 1])) continue;
      used[i] = 1;
      path.push(a[i]);
      go();
      path.pop();
      used[i] = 0;
    }
  };
  go();
  return res;
}

/**
 * ex05 · combinationSum
 * Ý tưởng: chọn ứng viên theo chỉ số không giảm (`start`) để mỗi TỔ HỢP chỉ sinh một lần; được dùng lại cùng ứng viên
 *   (đệ quy với `i`, không phải `i + 1`). Cắt nhánh: sắp xếp, dừng khi `c > còn lại`.
 * Độ phức tạp: O(số tổ hợp · độ dài) cộng chi phí nhánh cụt — cắt nhánh làm nhánh cụt rất ít.
 * Vì sao best practice: sắp xếp cho phép `break` (không chỉ `continue`) khi vượt target.
 * Bẫy: sinh hoán vị rồi khử trùng; đệ quy `go(i + 1)` (không cho dùng lại).
 * Cách khác: DP đếm số cách (A04) nếu chỉ cần ĐẾM.
 * Python/Java: tương tự.
 */
export function combinationSum(candidates: number[], target: number): number[][] {
  const a = candidates.slice().sort((x, y) => x - y);
  const res: number[][] = [];
  const path: number[] = [];
  const go = (start: number, left: number) => {
    if (left === 0) return void res.push(path.slice());
    for (let i = start; i < a.length && a[i] <= left; i++) {
      path.push(a[i]);
      go(i, left - a[i]);
      path.pop();
    }
  };
  go(0, target);
  return res;
}

/**
 * ex06 · combinationSum2
 * Ý tưởng: như ex05 nhưng mỗi phần tử dùng tối đa một lần (`go(i + 1, ...)`) và input có số trùng → sort + bỏ qua
 *   `a[i] === a[i-1]` khi `i > start` (kỹ thuật ex02).
 * Độ phức tạp: O(số tổ hợp khác nhau · độ dài) + nhánh cụt.
 * Vì sao best practice: `break` khi `a[i] > left` cắt cả đoạn còn lại vì mảng đã sắp.
 * Bẫy: `i > start` vs `i > 0`; không cắt khi vượt target → duyệt thừa theo cấp số mũ.
 * Cách khác: đếm tần suất rồi chọn 0..count cho từng giá trị.
 * Python/Java: tương tự.
 */
export function combinationSum2(candidates: number[], target: number): number[][] {
  const a = candidates.slice().sort((x, y) => x - y);
  const res: number[][] = [];
  const path: number[] = [];
  const go = (start: number, left: number) => {
    if (left === 0) return void res.push(path.slice());
    for (let i = start; i < a.length && a[i] <= left; i++) {
      if (i > start && a[i] === a[i - 1]) continue;
      path.push(a[i]);
      go(i + 1, left - a[i]);
      path.pop();
    }
  };
  go(0, target);
  return res;
}

/**
 * ex07 · generateParenthesis
 * Ý tưởng: dựng chuỗi từng ký tự; thêm '(' khi còn dư (open < n), thêm ')' khi đang mở thừa (close < open).
 *   Mọi nhánh đều dẫn tới chuỗi hợp lệ — KHÔNG có nhánh cụt.
 * Độ phức tạp: O(n · Catalan(n)) ≈ O(4ⁿ / √n).
 * Vì sao best practice: sinh trực tiếp chuỗi hợp lệ thay vì sinh 2²ⁿ chuỗi rồi lọc (n = 12: 208 012 chuỗi so với 16,7 triệu).
 * Bẫy: truyền chuỗi con (nối chuỗi) tạo nhiều chuỗi trung gian; dùng mảng ký tự + join khi n lớn.
 * Cách khác: DP theo công thức Catalan ("(" A ")" B).
 * Python/Java: Java `StringBuilder.append/deleteCharAt`; Python `''.join(path)`.
 */
export function generateParenthesis(n: number): string[] {
  const res: string[] = [];
  const buf: string[] = [];
  const go = (open: number, close: number) => {
    if (buf.length === 2 * n) return void res.push(buf.join(''));
    if (open < n) {
      buf.push('(');
      go(open + 1, close);
      buf.pop();
    }
    if (close < open) {
      buf.push(')');
      go(open, close + 1);
      buf.pop();
    }
  };
  go(0, 0);
  return res;
}

/**
 * ex08 · exist
 * Ý tưởng: thử bắt đầu ở mọi ô khớp chữ đầu; DFS 4 hướng, đánh dấu ô đang dùng (unchoose khi quay lui), dừng khi khớp đủ từ.
 * Độ phức tạp: O(R·C · 3^L) tệ nhất; cắt nhánh làm nó nhanh trong thực tế.
 * Vì sao best practice — CẮT NHÁNH TRƯỚC: nếu số lần xuất hiện của một chữ cái trong bảng ít hơn trong từ thì chắc chắn false (O(R·C + L)
 *   thay vì bùng nổ trên bảng toàn 'a' với từ "aaaa…ab"); thêm: nếu chữ cuối hiếm hơn chữ đầu thì tìm từ đảo ngược.
 * Bẫy: không bỏ đánh dấu ô khi quay lui; dùng lại một ô trong cùng đường đi.
 * Cách khác: trie khi tìm nhiều từ (I12).
 * Python/Java: Java đánh dấu bằng `board[r][c] = '#'` rồi khôi phục (nếu board là char[][]); ở đây board là String[] nên dùng `Uint8Array`.
 */
export function exist(board: string[], word: string): boolean {
  const R = board.length;
  const C = board[0].length;
  const need = new Map<string, number>();
  for (const ch of word) need.set(ch, (need.get(ch) ?? 0) + 1);
  const have = new Map<string, number>();
  for (const row of board) for (const ch of row) have.set(ch, (have.get(ch) ?? 0) + 1);
  for (const [ch, k] of need) if ((have.get(ch) ?? 0) < k) return false;
  if ((have.get(word[0]) ?? 0) > (have.get(word[word.length - 1]) ?? 0)) word = [...word].reverse().join('');
  const seen = new Uint8Array(R * C);
  const go = (r: number, c: number, k: number): boolean => {
    if (board[r][c] !== word[k]) return false;
    if (k === word.length - 1) return true;
    seen[r * C + c] = 1;
    let ok = false;
    if (!ok && r > 0 && !seen[(r - 1) * C + c]) ok = go(r - 1, c, k + 1);
    if (!ok && r < R - 1 && !seen[(r + 1) * C + c]) ok = go(r + 1, c, k + 1);
    if (!ok && c > 0 && !seen[r * C + c - 1]) ok = go(r, c - 1, k + 1);
    if (!ok && c < C - 1 && !seen[r * C + c + 1]) ok = go(r, c + 1, k + 1);
    seen[r * C + c] = 0;
    return ok;
  };
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (go(r, c, 0)) return true;
  return false;
}

/**
 * ex09 · totalNQueens
 * Ý tưởng: đặt từng hàng một; ba tập "cột bị chiếm", "đường chéo chính", "đường chéo phụ" biểu diễn bằng bitmask số nguyên.
 *   Vị trí hợp lệ = `~(cols | d1 | d2) & full`; lấy bit thấp nhất bằng `x & -x`.
 * Độ phức tạp: O(n!) cận trên; thực tế nhỏ hơn nhiều nhờ cắt nhánh (n = 12: 14 200 nghiệm).
 * Vì sao best practice: kiểm tra xung đột O(1) bằng bit, không cần quét cả mảng các quân đã đặt.
 * Bẫy: dịch chéo phải dịch theo cả hai hướng khi xuống hàng; quên mask `full`.
 * Cách khác: ba mảng boolean `cols[]`, `diag1[r+c]`, `diag2[r−c+n−1]` (chậm hơn bitmask nhưng dễ đọc).
 * Python/Java: Python int không tràn; Java `int` đủ với n ≤ 16 (32 bit).
 */
export function totalNQueens(n: number): number {
  const full = (1 << n) - 1;
  let count = 0;
  const go = (cols: number, d1: number, d2: number) => {
    if (cols === full) return void count++;
    let avail = full & ~(cols | d1 | d2);
    while (avail) {
      const bit = avail & -avail;
      avail ^= bit;
      go(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1);
    }
  };
  go(0, 0, 0);
  return count;
}

/**
 * ex10 · restoreIpAddresses
 * Ý tưởng: cắt chuỗi thành đúng 4 đoạn, mỗi đoạn dài 1..3, giá trị 0..255, không có số 0 đứng đầu (trừ chính "0").
 *   Cắt nhánh: còn lại phải nằm trong [số đoạn còn thiếu, 3 × số đoạn còn thiếu].
 * Độ phức tạp: O(3⁴) = hằng số cho mỗi chuỗi (độ dài ≤ 12).
 * Vì sao best practice: cắt nhánh theo độ dài còn lại giúp bỏ sớm; kiểm tra số 0 đầu ngay khi chọn đoạn.
 * Bẫy: "01", "00" không hợp lệ; "256" quá giới hạn; độ dài khác 4..12 → không có đáp án.
 * Cách khác: ba vòng lặp lồng nhau chọn 3 vị trí cắt.
 * Python/Java: Java `String.substring`, Python slice.
 */
export function restoreIpAddresses(s: string): string[] {
  const res: string[] = [];
  const parts: string[] = [];
  const go = (pos: number) => {
    const left = 4 - parts.length;
    const rest = s.length - pos;
    if (rest < left || rest > 3 * left) return;
    if (left === 0) return void res.push(parts.join('.'));
    for (let len = 1; len <= 3 && pos + len <= s.length; len++) {
      const seg = s.slice(pos, pos + len);
      if (len > 1 && seg[0] === '0') break;
      if (+seg > 255) break;
      parts.push(seg);
      go(pos + len);
      parts.pop();
    }
  };
  go(0);
  return res;
}
