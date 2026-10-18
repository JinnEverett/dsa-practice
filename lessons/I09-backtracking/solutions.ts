// I09 · Đáp án best practice. Chỉ mở sau khi check ✅.
//
// Khung chung (choose → explore → unchoose):
//   dfs(trạng thái):
//     nếu trạng thái là một đáp án → ghi lại BẢN SAO của path
//     với mỗi lựa chọn hợp lệ: choose (push) → dfs(trạng thái mới) → unchoose (pop)
// Python/Java chung: path là list/ArrayList dùng chung; khi ghi đáp án phải COPY (`path[:]` / `new ArrayList<>(path)`).

// ─── ex01 · Subsets (LC 78) ───
// Ý tưởng: mỗi bước chọn phần tử tiếp theo từ chỉ số `start` trở đi (chỉ đi "về phía trước" nên mỗi tập chỉ sinh đúng một lần).
//   Mọi nút của cây đệ quy đều là một đáp án (tập con) → ghi lại ngay khi vào nút.
// Độ phức tạp: O(n · 2ⁿ) thời gian (2ⁿ tập, mỗi tập sao chép O(n)); đệ quy sâu ≤ n.
// Vì sao best practice: không cần xét "có/không lấy" từng phần tử qua 2 nhánh, ít nhánh rỗng; cùng khuôn với combinations.
// Bẫy: push `path` thẳng vào kết quả (không copy) → mọi phần tử của kết quả trỏ cùng một mảng và cuối cùng rỗng.
// Cách khác: bitmask 0..2ⁿ−1 (n ≤ 30); hoặc lặp: res = [[]]; mỗi x: res.push(...res.map(s => [...s, x])).
// Python: `itertools.combinations` cho mỗi kích thước; Java: `new ArrayList<>(path)` khi `res.add`.
export function subsets(nums: number[]): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  const dfs = (start: number): void => {
    res.push(path.slice());
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]); // choose
      dfs(i + 1); // explore
      path.pop(); // unchoose
    }
  };
  dfs(0);
  return res;
}

// ─── ex02 · Subsets II (LC 90) ───
// Ý tưởng: sort để các giá trị bằng nhau đứng cạnh nhau; trong cùng một vòng lặp ở cùng một tầng, bỏ qua `nums[i]` nếu
//   `i > start && nums[i] === nums[i-1]` (đã thử giá trị đó làm "phần tử kế tiếp" rồi). Lấy 2 số 2 liên tiếp vẫn được
//   vì ở tầng sau `i === start`.
// Độ phức tạp: O(n log n + n · S) với S = số tập con khác nhau; không sinh trùng nên không tốn công khử trùng.
// Vì sao best practice: cắt nhánh trùng NGAY TRƯỚC khi đi vào (không đợi khử trùng bằng Set<string> ở cuối: sinh 2ⁿ rồi bỏ).
// Bẫy: `i > 0` thay vì `i > start` (cắt luôn cả đáp án [2,2]); quên sort (các giá trị bằng nhau không kề nhau).
// Cách khác: đếm số lần xuất hiện từng giá trị rồi chọn 0..cnt lần mỗi giá trị.
// Python/Java: `sorted(nums)` / `Arrays.sort(nums)` (nhớ sort bản copy nếu đề bắt không đổi input).
export function subsetsWithDup(nums: number[]): number[][] {
  const a = nums.slice().sort((x, y) => x - y);
  const res: number[][] = [];
  const path: number[] = [];
  const dfs = (start: number): void => {
    res.push(path.slice());
    for (let i = start; i < a.length; i++) {
      if (i > start && a[i] === a[i - 1]) continue; // cùng tầng, cùng giá trị → trùng nhánh
      path.push(a[i]);
      dfs(i + 1);
      path.pop();
    }
  };
  dfs(0);
  return res;
}

// ─── ex03 · Permutations (LC 46) ───
// Ý tưởng: mỗi tầng chọn một phần tử CHƯA dùng (mảng `used`) cho vị trí hiện tại; đủ n phần tử thì ghi đáp án.
// Độ phức tạp: O(n · n!) thời gian, O(n) bộ nhớ phụ ngoài kết quả.
// Vì sao best practice: `used[]` O(1) mỗi lần kiểm tra (khác `path.includes(x)` O(n)), dễ mở rộng sang ex04.
// Bẫy: nhầm với subsets (dùng `start`): hoán vị cần xét lại mọi chỉ số chưa dùng ở mỗi tầng.
// Cách khác: hoán đổi tại chỗ (swap(i, k) rồi đệ quy k+1, đổi lại) — ít bộ nhớ hơn nhưng khó bỏ trùng.
// Python: `itertools.permutations`; Java: `boolean[] used`.
export function permute(nums: number[]): number[][] {
  const n = nums.length;
  const res: number[][] = [];
  const path: number[] = [];
  const used = new Array<boolean>(n).fill(false);
  const dfs = (): void => {
    if (path.length === n) {
      res.push(path.slice());
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      dfs();
      path.pop();
      used[i] = false;
    }
  };
  dfs();
  return res;
}

// ─── ex04 · Permutations II (LC 47) ───
// Ý tưởng: sort; trong cùng tầng, giá trị bằng nhau chỉ được dùng theo đúng thứ tự chỉ số:
//   bỏ qua `i` nếu `a[i] === a[i-1] && !used[i-1]` (bản sao đứng trước chưa được dùng ở nhánh này nghĩa là ta đang
//   định "chen" bản sau lên trước → trùng).
// Độ phức tạp: O(n · P) với P = số hoán vị khác nhau (≤ n!).
// Vì sao best practice: cắt nhánh trùng tại chỗ; khử trùng bằng Set ở cuối vẫn phải sinh n! hoán vị (n = 10 toàn giá trị
//   trong {0,1,2}: 3 628 800 so với 4 200).
// Bẫy: điều kiện `used[i-1]` (không phải `!used[i-1]`) cũng cho đáp án đúng nhưng cắt kém hơn; quên sort.
// Cách khác: đếm tần suất từng giá trị (Map) rồi chọn giá trị còn số lượng > 0 ở mỗi tầng.
// Python: `Counter`; Java: `Arrays.sort` + `boolean[] used`.
export function permuteUnique(nums: number[]): number[][] {
  const a = nums.slice().sort((x, y) => x - y);
  const n = a.length;
  const res: number[][] = [];
  const path: number[] = [];
  const used = new Array<boolean>(n).fill(false);
  const dfs = (): void => {
    if (path.length === n) {
      res.push(path.slice());
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      if (i > 0 && a[i] === a[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      path.push(a[i]);
      dfs();
      path.pop();
      used[i] = false;
    }
  };
  dfs();
  return res;
}

// ─── ex05 · Combination Sum (LC 39) ───
// Ý tưởng: sort; dfs(start, remain). Chọn candidates[i] với i ≥ start, rồi đệ quy với CHÍNH i (được dùng lại).
//   remain === 0 → ghi đáp án. Vì đã sort, gặp c > remain thì `break` (mọi số sau còn lớn hơn).
// Độ phức tạp: O(số nút của cây) — tối đa ~ O(n^(target/min)); cắt nhánh bằng sort + break giảm rất nhiều.
// Vì sao best practice: `start` loại hoán vị của cùng một tổ hợp ([2,3] và [3,2]); `break` thay `continue` cắt cả phần đuôi.
// Bẫy: bắt đầu vòng lặp từ 0 ở mỗi tầng → sinh hoán vị, phải khử trùng; quên sort mà vẫn `break` → mất đáp án.
// Cách khác: DP đếm số cách (nhưng bài cần liệt kê nên vẫn phải backtrack).
// Java: `Arrays.sort(candidates)`; Python: `candidates.sort()` trên bản copy.
export function combinationSum(candidates: number[], target: number): number[][] {
  const a = candidates.slice().sort((x, y) => x - y);
  const res: number[][] = [];
  const path: number[] = [];
  const dfs = (start: number, remain: number): void => {
    if (remain === 0) {
      res.push(path.slice());
      return;
    }
    for (let i = start; i < a.length; i++) {
      if (a[i] > remain) break;
      path.push(a[i]);
      dfs(i, remain - a[i]);
      path.pop();
    }
  };
  dfs(0, target);
  return res;
}

// ─── ex06 · Combination Sum II (LC 40) ───
// Ý tưởng: ghép ex02 (sort + bỏ trùng cùng tầng) với ex05 (remain + break); mỗi phần tử dùng tối đa một lần → đệ quy i + 1.
// Độ phức tạp: O(số nút của cây đã cắt); không cắt nhánh sẽ là O(2ⁿ) với n tới 100.
// Vì sao best practice: sort cho phép cả hai kiểu cắt (bỏ trùng + break khi vượt) chỉ bằng hai dòng.
// Bẫy: quên `i > start` (dùng `i > 0`); dùng `continue` thay `break` khi vượt remain (vẫn đúng nhưng lãng phí).
// Cách khác: đếm tần suất rồi chọn 0..cnt lần mỗi giá trị khác nhau.
export function combinationSum2(candidates: number[], target: number): number[][] {
  const a = candidates.slice().sort((x, y) => x - y);
  const res: number[][] = [];
  const path: number[] = [];
  const dfs = (start: number, remain: number): void => {
    if (remain === 0) {
      res.push(path.slice());
      return;
    }
    for (let i = start; i < a.length; i++) {
      if (a[i] > remain) break;
      if (i > start && a[i] === a[i - 1]) continue;
      path.push(a[i]);
      dfs(i + 1, remain - a[i]);
      path.pop();
    }
  };
  dfs(0, target);
  return res;
}

// ─── ex07 · Generate Parentheses (LC 22) ───
// Ý tưởng: dựng chuỗi từng ký tự; chỉ thêm '(' nếu open < n, chỉ thêm ')' nếu close < open. Mọi nhánh sinh ra đều hợp lệ
//   → không phải kiểm tra lại, không sinh nhánh chết.
// Độ phức tạp: O(n · Cₙ) với Cₙ = số Catalan (≈ 4ⁿ / n^1.5); so với duyệt 2²ⁿ chuỗi rồi lọc.
// Vì sao best practice: cắt nhánh bằng bất biến "close ≤ open ≤ n" thay vì sinh rồi lọc.
// Bẫy: thêm ')' khi close < n (thay vì close < open) → sinh chuỗi sai.
// Cách khác: đệ quy theo công thức Catalan "( A ) B"; DP theo n.
// Python/Java: dùng list ký tự / StringBuilder (setLength khi unchoose); nối chuỗi bất biến cũng được vì n nhỏ.
export function generateParenthesis(n: number): string[] {
  const res: string[] = [];
  const buf: string[] = [];
  const dfs = (open: number, close: number): void => {
    if (buf.length === 2 * n) {
      res.push(buf.join(''));
      return;
    }
    if (open < n) {
      buf.push('(');
      dfs(open + 1, close);
      buf.pop();
    }
    if (close < open) {
      buf.push(')');
      dfs(open, close + 1);
      buf.pop();
    }
  };
  dfs(0, 0);
  return res;
}

// ─── ex08 · Word Search (LC 79) ───
// Ý tưởng: thử mọi ô làm điểm bắt đầu; dfs(r, c, k) khớp word[k], đánh dấu ô đã đi (visited) rồi thử 4 hướng, gỡ dấu khi quay lui.
//   Cắt nhánh: đếm ký tự trước — nếu board thiếu ký tự nào word cần thì trả false ngay; và nếu ký tự đầu của word hiếm hơn
//   ký tự cuối thì đảo word (bắt đầu từ đầu hiếm → ít điểm bắt đầu, ít nhánh).
// Độ phức tạp: O(m·n·3^L) tồi nhất (L = |word|; mỗi bước tối đa 3 hướng mới). Cắt nhánh đếm ký tự biến ca tồi
//   "bàn toàn 'a', word = a…ab" từ hàng triệu nhánh xuống O(m·n + L).
// Vì sao best practice: kiểm tra đếm ký tự là O(mn + L), rẻ, loại cả lớp input đối kháng.
// Bẫy: không gỡ visited khi quay lui; dùng lại ô đang đi; quên trường hợp |word| > m·n.
// Cách khác: đánh dấu bằng cách ghi tạm ký tự '#' lên board (tiết kiệm bộ nhớ, nhưng sửa input → phải khôi phục).
// Python: board là list[str] (bất biến) → copy sang list[list[str]] hoặc dùng set visited; Java: `board[i].charAt(j)`, mảng boolean[][].
export function exist(board: string[], word: string): boolean {
  const m = board.length;
  const n = m ? board[0].length : 0;
  if (word.length === 0) return true;
  if (word.length > m * n) return false;
  const cnt = new Map<string, number>();
  for (const row of board) for (const ch of row) cnt.set(ch, (cnt.get(ch) ?? 0) + 1);
  const need = new Map<string, number>();
  for (const ch of word) need.set(ch, (need.get(ch) ?? 0) + 1);
  for (const [ch, k] of need) if ((cnt.get(ch) ?? 0) < k) return false;
  // bắt đầu từ đầu hiếm hơn
  const w = (cnt.get(word[0]) ?? 0) > (cnt.get(word[word.length - 1]) ?? 0) ? [...word].reverse().join('') : word;
  const seen = new Uint8Array(m * n);
  const dfs = (r: number, c: number, k: number): boolean => {
    if (board[r][c] !== w[k]) return false;
    if (k === w.length - 1) return true;
    seen[r * n + c] = 1;
    let ok = false;
    if (r > 0 && !seen[(r - 1) * n + c]) ok = dfs(r - 1, c, k + 1);
    if (!ok && r + 1 < m && !seen[(r + 1) * n + c]) ok = dfs(r + 1, c, k + 1);
    if (!ok && c > 0 && !seen[r * n + c - 1]) ok = dfs(r, c - 1, k + 1);
    if (!ok && c + 1 < n && !seen[r * n + c + 1]) ok = dfs(r, c + 1, k + 1);
    seen[r * n + c] = 0;
    return ok;
  };
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (dfs(r, c, 0)) return true;
  return false;
}

// ─── ex09 · N-Queens II (LC 52) ───
// Ý tưởng: đặt từng hàng một; ba bitmask: cột bị chiếm, đường chéo "\" và "/" (dịch 1 bit mỗi hàng). Ô trống của hàng
//   hiện tại = ~(cols | d1 | d2) & mask; lấy bit thấp nhất bằng `x & -x`.
// Độ phức tạp: O(số nút của cây hợp lệ) — rất nhỏ so với n! (n = 12: ≈ 856 189 nút / 14 200 đáp án); bộ nhớ O(n).
// Vì sao best practice: kiểm tra "có bị chiếu không" O(1) bằng bit thay vì quét các hàng trước O(n).
// Bẫy: mask đường chéo không dịch đúng chiều; n = 1 → 1; n = 2, 3 → 0.
// Cách khác: mảng boolean cols[], diag1[r+c], diag2[r−c+n−1] (đúng nhưng hằng số lớn hơn); đối xứng (chỉ xét nửa cột đầu ×2).
// Java: dùng `int` đủ (n ≤ 12); `Integer.lowestOneBit`; Python: `x & -x` và `bin(x).count`; đệ quy sâu ≤ n nên an toàn.
export function totalNQueens(n: number): number {
  const full = (1 << n) - 1;
  const dfs = (cols: number, d1: number, d2: number): number => {
    if (cols === full) return 1;
    let count = 0;
    let avail = full & ~(cols | d1 | d2);
    while (avail) {
      const bit = avail & -avail;
      avail ^= bit;
      count += dfs(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1);
    }
    return count;
  };
  return dfs(0, 0, 0);
}

// ─── ex10 · 🔴 Khôi phục IP từ log mất dấu chấm (LC 93) ───
// Ý tưởng: cắt `s` thành đúng 4 đoạn; mỗi đoạn dài 1..3, giá trị 0..255, không có số 0 đứng đầu (trừ chính "0").
//   dfs(pos, parts): còn lại phải nằm trong [4−parts, 3·(4−parts)] ký tự, không thì cắt nhánh ngay.
// Độ phức tạp: ≤ 3⁴ = 81 cách cắt → O(1) theo hằng số (n ≤ 20; n > 12 chắc chắn rỗng).
// Vì sao best practice: cắt nhánh theo độ dài còn lại; kiểm tra số bằng so sánh chuỗi/phép nhân, không dùng parseInt tùy tiện.
// Bẫy: "01", "00", "256", "0.0.0.0" (hợp lệ), chuỗi chứa ký tự không phải chữ số (đề bảo đảm chỉ có chữ số).
// Cách khác: ba vòng lặp lồng nhau chọn vị trí đặt dấu chấm (cũng đúng khi chỉ có 3 dấu).
// Python: `s[pos:pos+k]`, `".".join(parts)`; Java: `s.substring`, `String.join(".", parts)`.
export function restoreIpAddresses(s: string): string[] {
  const res: string[] = [];
  const parts: string[] = [];
  const dfs = (pos: number): void => {
    const left = 4 - parts.length;
    const rest = s.length - pos;
    if (rest < left || rest > 3 * left) return;
    if (left === 0) {
      res.push(parts.join('.'));
      return;
    }
    for (let len = 1; len <= 3 && pos + len <= s.length; len++) {
      const seg = s.substring(pos, pos + len);
      if (len > 1 && seg[0] === '0') break; // số 0 đứng đầu: mọi đoạn dài hơn cũng sai
      if (Number(seg) > 255) break;
      parts.push(seg);
      dfs(pos + len);
      parts.pop();
    }
  };
  dfs(0);
  return res;
}
