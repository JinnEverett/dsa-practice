// F10 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Lũy thừa nhanh ───
// Ý tưởng: xⁿ = (x^(n/2))² nếu n chẵn, x · (x^(n/2))² nếu n lẻ. n âm → (1/x)^|n|.
// Độ phức tạp: O(log |n|) time · O(log |n|) stack (bản đệ quy) — bản vòng lặp theo bit của n là O(1) bộ nhớ.
// Bẫy: gọi f(n/2) HAI lần trong cùng một tầng → T(n) = 2T(n/2) → O(n), mất hết lợi ích. Phải gọi 1 lần rồi bình phương.
// Python/Java: Java `long N = n; if (N < 0) { x = 1 / x; N = -N; }` — không ép long thì -(-2³¹) vẫn âm. Python không tràn.
export function myPow(x: number, n: number): number {
  if (n < 0) return myPow(1 / x, -n);
  if (n === 0) return 1;
  const half = myPow(x, Math.floor(n / 2));
  return n % 2 === 0 ? half * half : half * half * x;
}

// ─── ex02 · Fibonacci có memo ───
// Ý tưởng: memo theo n — mỗi giá trị chỉ tính 1 lần.
// Độ phức tạp: O(n) time · O(n) space (memo + stack).
// Bản tốt hơn nữa (không đệ quy): hai biến a, b chạy n bước — O(n) time, O(1) space (đây là "tabulation", A01).
// Python/Java: Python `@functools.cache` trên hàm đệ quy; Java `long[] memo = new long[n + 1]`.
export function fib(n: number): number {
  const memo = new Array<number>(n + 1).fill(-1);
  const go = (k: number): number => {
    if (k <= 1) return k;
    if (memo[k] !== -1) return memo[k];
    return (memo[k] = go(k - 1) + go(k - 2));
  };
  return go(n);
}

// ─── ex03 · Leo cầu thang ───
// Ý tưởng: bước cuối là 1 bậc hoặc 2 bậc → ways(n) = ways(n − 1) + ways(n − 2), ways(1) = 1, ways(2) = 2. Chính là Fibonacci.
// Độ phức tạp: O(n) với memo.
export function climbStairs(n: number): number {
  const memo = new Map<number, number>();
  const ways = (k: number): number => {
    if (k <= 2) return k;
    const hit = memo.get(k);
    if (hit !== undefined) return hit;
    const v = ways(k - 1) + ways(k - 2);
    memo.set(k, v);
    return v;
  };
  return ways(n);
}

// ─── ex04 · Tháp Hà Nội ───
// Ý tưởng: chuyển n đĩa từ A sang C qua B = chuyển n − 1 đĩa A → B (qua C), chuyển đĩa lớn nhất A → C,
//   rồi chuyển n − 1 đĩa B → C (qua A).
// Độ phức tạp: T(n) = 2T(n − 1) + 1 → 2ⁿ − 1 nước, O(2ⁿ) time · O(n) stack. Đây là số nước tối thiểu (chứng minh quy nạp).
export function hanoi(n: number): number[][] {
  const moves: number[][] = [];
  const move = (k: number, from: number, to: number, via: number) => {
    if (k === 0) return;
    move(k - 1, from, via, to);
    moves.push([from, to]);
    move(k - 1, via, to, from);
  };
  move(n, 1, 3, 2);
  return moves;
}

// ─── ex05 · Chuỗi nhị phân không có "11" ───
// Ý tưởng: xây từng ký tự; luôn được thêm '0'; chỉ thêm '1' khi ký tự trước không phải '1'. Thêm '0' trước '1' → kết quả tự
//   đúng thứ tự từ điển, không cần sort.
// Độ phức tạp: O(F(n+2) · n) — số chuỗi kết quả là Fibonacci, mỗi chuỗi dài n.
// Python/Java: Java dùng `StringBuilder` + `append`/`deleteCharAt` (backtracking) thay vì nối chuỗi mới mỗi tầng.
export function noConsecutiveOnes(n: number): string[] {
  const out: string[] = [];
  const build = (cur: string, lastOne: boolean) => {
    if (cur.length === n) {
      out.push(cur);
      return;
    }
    build(cur + '0', false);
    if (!lastOne) build(cur + '1', true);
  };
  build('', false);
  return out;
}

// ─── ex06 · Giải mã chuỗi lồng nhau ───
// Ý tưởng: hàm parse(i) đọc từ vị trí i tới khi gặp ']' hoặc hết chuỗi, trả về [chuỗi đã giải mã, vị trí dừng].
//   Gặp số → đọc hết số k, bỏ '[', gọi đệ quy parse cho khối con, lặp k lần, bỏ ']'.
// Độ phức tạp: O(độ dài kết quả) time · O(độ sâu lồng) stack.
// Cách khác: 2 stack (stack số đếm, stack chuỗi đang dựng) — cùng độ phức tạp, không đệ quy.
export function decodeString(s: string): string {
  const parse = (i: number): [string, number] => {
    const parts: string[] = [];
    while (i < s.length && s[i] !== ']') {
      if (s[i] >= '0' && s[i] <= '9') {
        let k = 0;
        while (s[i] >= '0' && s[i] <= '9') k = k * 10 + (s.charCodeAt(i++) - 48);
        const [inner, next] = parse(i + 1); // bỏ '['
        parts.push(inner.repeat(k));
        i = next + 1; // bỏ ']'
      } else parts.push(s[i++]);
    }
    return [parts.join(''), i];
  };
  return parse(0)[0];
}

// ─── ex07 · Máy tính biểu thức (recursive descent) ───
// Ý tưởng: mỗi mức ưu tiên là một hàm: expr xử lý + −, term xử lý * /, factor xử lý số và ngoặc (gọi lại expr).
//   Vị trí đọc `pos` dùng chung. Cách này mở rộng được (thêm %, ^, dấu một ngôi) mà không đổi cấu trúc.
// Độ phức tạp: O(n) time · O(độ sâu ngoặc) stack.
// Bẫy: chia nguyên trong JS phải `Math.trunc(a / b)` (làm tròn về 0), KHÔNG phải Math.floor (sai với số âm).
//   Python: `int(a / b)` hoặc tự xử lý dấu — `a // b` làm tròn xuống (−4 // 3 = −2 ≠ −1). Java: `/` trên int đã làm tròn về 0.
export function calculate(s: string): number {
  let pos = 0;
  const peek = () => {
    while (s[pos] === ' ') pos++;
    return s[pos];
  };
  const factor = (): number => {
    if (peek() === '(') {
      pos++;
      const v = expr();
      peek();
      pos++; // ')'
      return v;
    }
    let v = 0;
    while (s[pos] >= '0' && s[pos] <= '9') v = v * 10 + (s.charCodeAt(pos++) - 48);
    return v;
  };
  const term = (): number => {
    let v = factor();
    for (let op = peek(); op === '*' || op === '/'; op = peek()) {
      pos++;
      const rhs = factor();
      v = op === '*' ? v * rhs : Math.trunc(v / rhs);
    }
    return v;
  };
  function expr(): number {
    let v = term();
    for (let op = peek(); op === '+' || op === '-'; op = peek()) {
      pos++;
      const rhs = term();
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  }
  return expr() + 0;
}

// ─── ex08 · Ký tự thứ k của văn phạm ───
// Ý tưởng: ký tự k của hàng n sinh ra từ ký tự ⌈k/2⌉ của hàng n − 1: vị trí lẻ giữ nguyên, vị trí chẵn lật bit.
// Độ phức tạp: O(n) time · O(n) stack.
// Cách khác (mẹo bit): đáp án = số bit 1 trong (k − 1) mod 2.
export function kthGrammar(n: number, k: number): number {
  if (n === 1) return 0;
  const parent = kthGrammar(n - 1, Math.ceil(k / 2));
  return k % 2 === 1 ? parent : 1 - parent;
}

// ─── ex09 · Độ sâu cây danh mục ───
// Ý tưởng: dựng danh sách con, duyệt DFS bằng STACK TỰ QUẢN (không đệ quy) mang theo độ sâu.
// Độ phức tạp: O(n) time · O(n) space.
// Vì sao không đệ quy: chuỗi 10⁵ tầng → đệ quy sâu 10⁵ → tràn stack ở cả 3 ngôn ngữ.
// Cách khác: memo depth[i] = 1 + depth[parent[i]] tính bằng vòng lặp đi ngược lên cha (cũng phải không đệ quy).
export function maxCategoryDepth(parent: number[]): number {
  const n = parent.length;
  const children: number[][] = Array.from({ length: n }, () => []);
  const stack: number[] = [];
  const depth = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (parent[i] === -1) {
      depth[i] = 1;
      stack.push(i);
    } else children[parent[i]].push(i);
  }
  let best = 0;
  while (stack.length) {
    const u = stack.pop()!;
    best = Math.max(best, depth[u]);
    for (const c of children[u]) {
      depth[c] = depth[u] + 1;
      stack.push(c);
    }
  }
  return best;
}

// ─── ex10 · Dung lượng thư mục ───
// Ý tưởng: duyệt từ gốc bằng stack, ghi lại THỨ TỰ thăm (cha luôn đứng trước con). Duyệt ngược thứ tự đó và cộng
//   total[u] vào total[parent[u]] → khi xử lý một node, mọi con của nó đã được cộng xong (post-order không đệ quy).
// Độ phức tạp: O(n) time · O(n) space.
// Python/Java: Java `long[] total` (tổng có thể tới 10¹⁴).
export function folderSizes(parent: number[], sizes: number[]): number[] {
  const n = parent.length;
  const children: number[][] = Array.from({ length: n }, () => []);
  const stack: number[] = [];
  for (let i = 0; i < n; i++) {
    if (parent[i] === -1) stack.push(i);
    else children[parent[i]].push(i);
  }
  const order: number[] = [];
  while (stack.length) {
    const u = stack.pop()!;
    order.push(u);
    for (const c of children[u]) stack.push(c);
  }
  const total = sizes.slice();
  for (let k = order.length - 1; k >= 0; k--) {
    const u = order[k];
    if (parent[u] !== -1) total[parent[u]] += total[u];
  }
  return total;
}
