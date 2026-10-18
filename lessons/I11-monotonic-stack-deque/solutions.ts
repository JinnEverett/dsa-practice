// I11 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Mọi stack/deque dưới đây lưu CHỈ SỐ (không lưu giá trị) và là Int32Array + con trỏ → không cấp phát, không shift().

/**
 * ex01 · nextGreaterElements (mảng vòng)
 * Ý tưởng: stack giảm dần (từ đáy lên đỉnh) các chỉ số chưa tìm được "lớn hơn kế tiếp". Duyệt i = 0..2n−1 (đi vòng hai lần, dùng i % n):
 *   gặp giá trị lớn hơn giá trị ở đỉnh thì pop đỉnh và gán đáp án = giá trị hiện tại. Chỉ push ở vòng đầu (i < n).
 * Độ phức tạp: O(n) — mỗi chỉ số push một lần, pop tối đa một lần ⇒ tổng pop ≤ n dù có vòng while lồng trong vòng for (amortized).
 * Vì sao best practice: không lặp lại việc quét xa cho mỗi phần tử (O(n²) với mảng giảm dần).
 * Bẫy: `>` (nghiêm ngặt) vs `>=` — "lớn hơn" nghĩa là nghiêm ngặt, hai giá trị bằng nhau KHÔNG phải kế tiếp lớn hơn của nhau.
 * Cách khác: duyệt từ phải sang trái với stack; nhân đôi mảng.
 * Python/Java: `list` làm stack; Java `int[]` + `sp`; nhớ `i % n`.
 */
export function nextGreaterElements(nums: number[]): number[] {
  const n = nums.length;
  const res = new Array<number>(n).fill(-1);
  const stack = new Int32Array(n);
  let sp = 0;
  for (let i = 0; i < 2 * n; i++) {
    const v = nums[i % n];
    while (sp > 0 && nums[stack[sp - 1]] < v) res[stack[--sp]] = v;
    if (i < n) stack[sp++] = i;
  }
  return res;
}

/**
 * ex02 · dailyTemperatures
 * Ý tưởng: stack giảm dần các chỉ số "chưa có ngày ấm hơn". Ngày i ấm hơn đỉnh ⇒ pop j và ghi `i − j`.
 * Độ phức tạp: O(n) amortized.
 * Vì sao best practice: lưu CHỈ SỐ để tính khoảng cách `i − j` trực tiếp.
 * Bẫy: stack lưu nhiệt độ thay vì chỉ số (mất khoảng cách); không có ngày ấm hơn → 0.
 * Cách khác: duyệt phải→trái và nhảy theo `ans[j]` (không cần stack, vẫn amortized).
 * Python/Java: tương tự ex01.
 */
export function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const ans = new Array<number>(n).fill(0);
  const stack = new Int32Array(n);
  let sp = 0;
  for (let i = 0; i < n; i++) {
    while (sp > 0 && temperatures[stack[sp - 1]] < temperatures[i]) {
      const j = stack[--sp];
      ans[j] = i - j;
    }
    stack[sp++] = i;
  }
  return ans;
}

/**
 * ex03 · largestRectangleArea
 * Ý tưởng: stack TĂNG dần các chỉ số. Khi gặp cột thấp hơn đỉnh, đỉnh j không thể mở rộng sang phải nữa: nó có chiều cao h[j], mở rộng sang
 *   trái tới ngay sau phần tử mới đỉnh stack, sang phải tới i − 1 ⇒ rộng = i − (đỉnh mới) − 1 (hoặc i nếu stack rỗng). Thêm cột sentinel
 *   cao 0 ở cuối để xả hết stack.
 * Độ phức tạp: O(n).
 * Vì sao best practice: mỗi cột là "cột thấp nhất" của đúng một hình chữ nhật cực đại — ta tìm được hai biên (trái, phải) của nó bằng stack.
 * Bẫy: diện tích tới 10⁹ × 10⁵ = 10¹⁴ ⇒ Java `long`; quên sentinel; cột bằng nhau (pop khi `>=` hoặc `>` đều đúng, nhưng phải nhất quán).
 * Cách khác: chia để trị với RMQ; DP "left[i], right[i]" hai lượt stack.
 * Python/Java: Python thêm `heights + [0]`; Java mảng mới độ dài n + 1.
 */
export function largestRectangleArea(heights: number[]): number {
  const n = heights.length;
  const stack = new Int32Array(n + 1);
  let sp = 0;
  let best = 0;
  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i];
    while (sp > 0 && heights[stack[sp - 1]] >= h) {
      const height = heights[stack[--sp]];
      const width = sp === 0 ? i : i - stack[sp - 1] - 1;
      if (height * width > best) best = height * width;
    }
    stack[sp++] = i;
  }
  return best;
}

/**
 * ex04 · trap
 * Ý tưởng: stack giảm dần. Khi gặp cột cao hơn đỉnh, đỉnh là "đáy" của một vũng: cột trái là phần tử mới đỉnh stack, cột phải là i ⇒
 *   nước = (min(h[trái], h[i]) − h[đáy]) × (i − trái − 1).
 * Độ phức tạp: O(n) thời gian, O(n) bộ nhớ.
 * Vì sao best practice: tính nước THEO TỪNG LỚP ngang; mỗi cột bị pop một lần. (Hai con trỏ cho O(1) bộ nhớ là cách khác.)
 * Bẫy: tổng tới 10⁵ × 10⁵ = 10¹⁰ ⇒ Java `long`; stack rỗng sau pop ⇒ không có cột trái, không có vũng.
 * Cách khác: hai con trỏ trái/phải giữ `leftMax`, `rightMax` (O(1) bộ nhớ); prefix/suffix max O(n) bộ nhớ.
 * Python/Java: tương tự ex03.
 */
export function trap(height: number[]): number {
  const n = height.length;
  const stack = new Int32Array(n);
  let sp = 0;
  let water = 0;
  for (let i = 0; i < n; i++) {
    while (sp > 0 && height[stack[sp - 1]] < height[i]) {
      const bottom = height[stack[--sp]];
      if (sp === 0) break;
      const left = stack[sp - 1];
      water += (Math.min(height[left], height[i]) - bottom) * (i - left - 1);
    }
    stack[sp++] = i;
  }
  return water;
}

/**
 * ex05 · maxSlidingWindow
 * Ý tưởng: DEQUE các chỉ số với giá trị GIẢM dần từ đầu đến cuối. Với mỗi i: (1) pop cuối khi nhỏ hơn hoặc bằng nums[i] (chúng không bao giờ
 *   là max nữa vì nums[i] vừa lớn hơn vừa mới hơn); (2) push i; (3) pop đầu nếu đã trượt ra khỏi cửa sổ (chỉ số ≤ i − k); (4) đầu deque là max.
 * Độ phức tạp: O(n) amortized — mỗi chỉ số vào deque một lần, ra tối đa một lần. (Heap: O(n log n).)
 * Vì sao best practice: deque là Int32Array + head/tail — pop đầu chỉ là head++.
 * Bẫy: dùng `shift()` cho mảng thường (O(n)); bỏ đầu theo GIÁ TRỊ thay vì chỉ số.
 * Cách khác: max-heap lười (lazy deletion), sparse table.
 * Python/Java: Python `collections.deque`; Java `ArrayDeque<Integer>` hoặc int[] như ở đây.
 */
export function maxSlidingWindow(nums: number[], k: number): number[] {
  const n = nums.length;
  const dq = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    while (tail > head && nums[dq[tail - 1]] <= nums[i]) tail--;
    dq[tail++] = i;
    if (dq[head] <= i - k) head++;
    if (i >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}

const MOD = 1_000_000_007;

/** a·b mod MOD với a, b < MOD (< 2³⁰) mà không vượt 2⁵³: tách b thành phần cao/thấp 16 bit. */
function mulMod(a: number, b: number): number {
  const hi = Math.floor(b / 65536);
  const lo = b % 65536;
  return (((a * hi) % MOD) * 65536 + a * lo) % MOD;
}

/**
 * ex06 · sumSubarrayMins
 * Ý tưởng: ĐÓNG GÓP của từng phần tử — arr[i] là min của (số điểm bắt đầu có thể) × (số điểm kết thúc có thể) mảng con. Dùng stack tăng dần
 *   tìm `left[i]` = khoảng cách tới phần tử NHỎ HƠN NGHIÊM NGẶT bên trái, `right[i]` = khoảng cách tới phần tử NHỎ HƠN HOẶC BẰNG bên phải
 *   (một bên nghiêm ngặt, một bên không → mỗi mảng con có min lặp được tính đúng một lần).
 * Độ phức tạp: O(n).
 * Vì sao best practice: không liệt kê O(n²) mảng con; tư duy "mỗi phần tử đóng góp bao nhiêu" áp dụng cho sum of max, range, ...
 * Bẫy (2⁵³!): arr[i] ≤ 10⁹, left·right ≤ 10¹⁰ ⇒ tích tới 10¹⁹ > 2⁵³ ⇒ phép nhân `number` mất chính xác. Giảm mod từng thừa số rồi nhân bằng
 *   `mulMod` (tách 16 bit) hoặc BigInt. Java: `long` đủ cho (arr[i] % MOD) × (left·right % MOD) < 10¹⁸ < 9,2·10¹⁸.
 * Cách khác: DP trên stack `dp[i] = dp[prev smaller] + arr[i]·(i − prev)`.
 * Python/Java: Python int không tràn; Java ép kiểu `long` trước khi nhân.
 */
export function sumSubarrayMins(arr: number[]): number {
  const n = arr.length;
  const left = new Int32Array(n);
  const right = new Int32Array(n);
  const stack = new Int32Array(n);
  let sp = 0;
  for (let i = 0; i < n; i++) {
    while (sp > 0 && arr[stack[sp - 1]] >= arr[i]) sp--; // bên trái: nhỏ hơn NGHIÊM NGẶT
    left[i] = sp === 0 ? i + 1 : i - stack[sp - 1];
    stack[sp++] = i;
  }
  sp = 0;
  for (let i = n - 1; i >= 0; i--) {
    while (sp > 0 && arr[stack[sp - 1]] > arr[i]) sp--; // bên phải: nhỏ hơn hoặc BẰNG
    right[i] = sp === 0 ? n - i : stack[sp - 1] - i;
    stack[sp++] = i;
  }
  let total = 0;
  for (let i = 0; i < n; i++) {
    const count = (left[i] * right[i]) % MOD; // ≤ 10¹⁰ < 2⁵³
    total = (total + mulMod(arr[i] % MOD, count)) % MOD;
  }
  return total;
}

/**
 * ex07 · StockSpanner
 * Ý tưởng: stack các cặp (giá, span) giảm dần. `next(price)`: span = 1; trong khi đỉnh có giá ≤ price thì pop và cộng span của nó.
 *   Push (price, span). Mỗi ngày bị "nuốt" vào đúng một cặp ⇒ amortized O(1).
 * Độ phức tạp: O(1) amortized mỗi lần gọi, O(n) bộ nhớ.
 * Vì sao best practice: cộng SPAN đã gộp thay vì quét lại từng ngày — nếu quét lại là O(n) mỗi lần với giá tăng dần.
 * Bẫy: `<=` (span tính cả ngày giá bằng nhau); stack lưu span riêng với giá.
 * Cách khác: stack chỉ số + mảng giá (span = index − index đỉnh sau pop).
 * Python/Java: hai list song song hoặc list tuple; Java hai `int[]`.
 */
export class StockSpanner {
  private prices: number[] = [];
  private spans: number[] = [];
  next(price: number): number {
    let span = 1;
    const p = this.prices;
    const s = this.spans;
    while (p.length > 0 && p[p.length - 1] <= price) {
      p.pop();
      span += s.pop()!;
    }
    p.push(price);
    s.push(span);
    return span;
  }
}

/**
 * ex08 · removeKdigits
 * Ý tưởng: muốn số nhỏ nhất ⇒ ưu tiên giảm chữ số đứng TRƯỚC. Stack tăng dần: gặp chữ số nhỏ hơn đỉnh và còn lượt xóa thì pop đỉnh
 *   (xóa chữ số lớn đứng trước chữ số nhỏ hơn). Hết chữ số mà còn lượt thì cắt bớt đuôi. Bỏ số 0 đứng đầu; rỗng ⇒ "0".
 * Độ phức tạp: O(n).
 * Vì sao best practice (exchange argument): tại vị trí đầu tiên s[i] > s[i+1], xóa s[i] cho số nhỏ hơn mọi cách xóa chữ số khác ở bên phải.
 * Bẫy: quên xóa ở đuôi khi dãy tăng dần ("12345", k=2 → "123"); quên số 0 đầu ("10200", k=1 → "200"); k = len → "0".
 * Cách khác: xóa lần lượt từng chữ số (O(n·k) — quá giờ ở 10⁵).
 * Python/Java: dùng list/`StringBuilder` làm stack rồi join; không nối chuỗi trong vòng lặp.
 */
export function removeKdigits(num: string, k: number): string {
  const stack: string[] = [];
  for (const d of num) {
    while (k > 0 && stack.length > 0 && stack[stack.length - 1] > d) {
      stack.pop();
      k--;
    }
    stack.push(d);
  }
  while (k > 0) {
    stack.pop();
    k--;
  }
  let start = 0;
  while (start < stack.length - 1 && stack[start] === '0') start++;
  const s = stack.slice(start).join('');
  return s === '' ? '0' : s;
}
