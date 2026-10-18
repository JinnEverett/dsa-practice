// I11 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Phần tử lớn hơn kế tiếp (mảng vòng) ───
// Ý tưởng: stack giữ CHỈ SỐ của các phần tử chưa tìm được "lớn hơn kế tiếp", giá trị giảm dần (không tăng) từ đáy lên đỉnh.
//   Gặp nums[i] lớn hơn đỉnh → đỉnh tìm được đáp án = nums[i], pop; lặp đến khi hết. Mảng vòng: duyệt i = 0..2n-1, dùng i % n.
// Độ phức tạp: O(n) thời gian (mỗi chỉ số push ≤ 1 lần, pop ≤ 1 lần), O(n) bộ nhớ.
// Vì sao best practice: một lượt duyệt, không cần nhân đôi mảng.
// Bẫy: pop khi `<` (không phải `<=`) — phần tử BẰNG không phải "lớn hơn". Chỉ push ở lượt đầu (i < n) để khỏi push trùng.
// Cách khác: duyệt từ phải sang trái (stack giữ giá trị); O(n^2) quét tới.
// Python/Java: Python dùng list làm stack (append/pop); Java dùng ArrayDeque<Integer> (push/pop/peek), KHÔNG dùng Stack (chậm, synchronized).
export function nextGreaterElements(nums: number[]): number[] {
  const n = nums.length;
  const res: number[] = new Array(n).fill(-1);
  const st: number[] = [];
  for (let i = 0; i < 2 * n; i++) {
    const v = nums[i % n];
    while (st.length && nums[st[st.length - 1]] < v) res[st.pop()!] = v;
    if (i < n) st.push(i);
  }
  return res;
}

// ─── ex02 · Daily temperatures ───
// Ý tưởng: stack chỉ số, nhiệt độ giảm dần. Ngày i nóng hơn đỉnh j → đáp án[j] = i - j.
// Độ phức tạp: O(n) / O(n).
// Bẫy: chưa pop thì đáp án mặc định 0 (không có ngày nóng hơn). Dùng `<` chặt.
// Cách khác: duyệt phải→trái với bước nhảy ans[j] (nhảy theo đáp án đã biết), O(n), O(1) bộ nhớ phụ.
// Python/Java: giống ex01.
export function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const res: number[] = new Array(n).fill(0);
  const st: number[] = [];
  for (let i = 0; i < n; i++) {
    while (st.length && temperatures[st[st.length - 1]] < temperatures[i]) {
      const j = st.pop()!;
      res[j] = i - j;
    }
    st.push(i);
  }
  return res;
}

// ─── ex03 · Hình chữ nhật lớn nhất trong histogram ───
// Ý tưởng: stack chỉ số, chiều cao TĂNG dần. Khi gặp cột thấp hơn đỉnh → đỉnh h là cột thấp nhất của hình chữ nhật
//   rộng từ (phần tử dưới nó trong stack + 1) đến (i - 1). Thêm cột cao 0 ở cuối để xả hết stack (sentinel).
// Độ phức tạp: O(n) / O(n). Diện tích tối đa 10^4 · 10^5 = 10^9 < 2^31 nên `int` đủ.
// Bẫy: width = stack rỗng ? i : i - st.top - 1. Cột BẰNG nhau: pop với `>=` hoặc `>` đều đúng (đáp án như nhau).
// Cách khác: tính left[i], right[i] (hai lượt), chia để trị O(n log n).
// Python/Java: thêm sentinel bằng cách duyệt i đến n (coi h = 0) thay vì sửa mảng đầu vào.
export function largestRectangleArea(heights: number[]): number {
  const n = heights.length;
  const st: number[] = [];
  let best = 0;
  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i];
    while (st.length && heights[st[st.length - 1]] > h) {
      const height = heights[st.pop()!];
      const left = st.length ? st[st.length - 1] : -1;
      best = Math.max(best, height * (i - left - 1));
    }
    st.push(i);
  }
  return best;
}

// ─── ex04 · Trapping rain water ───
// Ý tưởng: stack chỉ số, chiều cao GIẢM dần. Gặp cột i cao hơn đáy (vừa pop) và còn cột trái l trong stack
//   → nước chứa được ở "tầng" giữa l và i: rộng (i - l - 1), cao min(h[l], h[i]) - h[đáy]. Cộng dồn theo từng tầng ngang.
// Độ phức tạp: O(n) / O(n).
// Bẫy: stack rỗng sau pop → không có thành trái, bỏ qua (break). Nước tối đa 10^4 · 10^5 = 10^9 < 2^31 nên `int` đủ (đề giới hạn height ≤ 10^4).
// Cách khác (thường được ưa hơn khi O(1) bộ nhớ): two pointers với leftMax/rightMax — đã gặp ở F05.
// Python/Java: giống ex01.
export function trap(height: number[]): number {
  const st: number[] = [];
  let water = 0;
  for (let i = 0; i < height.length; i++) {
    while (st.length && height[st[st.length - 1]] < height[i]) {
      const bottom = st.pop()!;
      if (!st.length) break;
      const l = st[st.length - 1];
      water += (i - l - 1) * (Math.min(height[l], height[i]) - height[bottom]);
    }
    st.push(i);
  }
  return water;
}

// ─── ex05 · Sliding window maximum (deque) ───
// Ý tưởng: deque chứa CHỈ SỐ, giá trị giảm dần từ đầu đến cuối. Đầu deque luôn là max cửa sổ.
//   Thêm i: pop cuối khi nums[cuối] <= nums[i] (không bao giờ là max nữa vì i vừa mới hơn vừa lớn hơn). Pop đầu nếu chỉ số <= i - k.
// Độ phức tạp: O(n) / O(k). Mỗi chỉ số vào/ra deque ≤ 1 lần.
// Vì sao best practice: heap lười xóa là O(n log n); duyệt từng cửa sổ là O(nk).
// Bẫy: dùng Array.shift() làm pop đầu là O(n) → dùng mảng + con trỏ `head` (như bên dưới) hoặc ring buffer.
// Cách khác: sparse table / segment tree O(n log n); chia khối prefix-max/suffix-max O(n).
// Python/Java: Python `collections.deque` (popleft O(1)); Java `ArrayDeque<Integer>` (pollFirst/pollLast/peekFirst).
export function maxSlidingWindow(nums: number[], k: number): number[] {
  const n = nums.length;
  const dq: number[] = new Array(n); // mảng + head/tail thay cho deque
  let head = 0;
  let tail = 0;
  const res: number[] = [];
  for (let i = 0; i < n; i++) {
    while (tail > head && nums[dq[tail - 1]] <= nums[i]) tail--;
    dq[tail++] = i;
    if (dq[head] <= i - k) head++;
    if (i >= k - 1) res.push(nums[dq[head]]);
  }
  return res;
}

// ─── ex06 · Tổng min của mọi mảng con ───
// Ý tưởng: ĐÓNG GÓP của từng phần tử. arr[i] là min của (i - L) · (R - i) mảng con, với L = chỉ số bên trái gần nhất có giá trị < arr[i],
//   R = chỉ số bên phải gần nhất có giá trị <= arr[i] (một bên chặt, một bên không chặt để không đếm trùng khi có giá trị bằng nhau).
//   Một lượt stack tính cả hai: khi pop j vì arr[i] <= arr[j]: R(j) = i, L(j) = phần tử dưới j trong stack.
// Độ phức tạp: O(n) / O(n).
// Bẫy: số mảng con nhận arr[j] làm min có thể ~ (n/2)^2 = 2.5·10^9 > 2^31 (Java: `long`); arr[j] · count có thể ~ 10^14 nên
//   lấy count % MOD TRƯỚC khi nhân (≤ 10^9 · 3·10^4 = 3·10^13 < 2^53, an toàn với double của TS).
// Cách khác: DP với stack: dp[i] = tổng min của mảng con kết thúc ở i.
// Python/Java: Python int vô hạn nên nhân thẳng rồi % MOD; Java ép `long` trước khi nhân.
const MOD = 1_000_000_007;
export function sumSubarrayMins(arr: number[]): number {
  const n = arr.length;
  const st: number[] = [];
  let total = 0;
  for (let i = 0; i <= n; i++) {
    const cur = i === n ? -1 : arr[i];
    while (st.length && arr[st[st.length - 1]] >= cur) {
      const j = st.pop()!;
      const left = st.length ? st[st.length - 1] : -1;
      const count = ((j - left) * (i - j)) % MOD; // ≤ 2.5·10^9 an toàn trong double
      total = (total + ((arr[j] * count) % MOD)) % MOD; // arr ≤ 3·10^4 → tích < 10^14 < 2^53
    }
    st.push(i);
  }
  return total;
}

// ─── ex07 · Stock spanner (class) ───
// Ý tưởng: stack các cặp (giá, span) với giá GIẢM dần. next(p): span = 1; trong khi đỉnh có giá <= p: span += đỉnh.span, pop. Push (p, span).
// Độ phức tạp: amortized O(1) mỗi next, O(n) bộ nhớ.
// Bẫy: gộp span của phần tử bị pop (không phải đếm lại từng ngày). Dùng `<=`: giá bằng hôm nay vẫn tính vào span.
// Cách khác: lưu chỉ số + mảng giá, span = i - chỉ số đỉnh còn lại.
// Python/Java: Python list các tuple/2 list song song; Java `ArrayDeque<int[]>`.
export class StockSpanner {
  private prices: number[] = [];
  private spans: number[] = [];
  next(price: number): number {
    let span = 1;
    while (this.prices.length && this.prices[this.prices.length - 1] <= price) {
      this.prices.pop();
      span += this.spans.pop()!;
    }
    this.prices.push(price);
    this.spans.push(span);
    return span;
  }
}

// ─── ex08 · Xóa k chữ số để số nhỏ nhất ───
// Ý tưởng: stack chữ số tăng dần (không giảm). Với mỗi chữ số c: còn k > 0 và đỉnh > c thì pop (xóa) — chữ số đứng trước mà lớn hơn
//   chữ số sau làm số lớn lên. Hết chuỗi mà k > 0 → xóa k chữ số cuối. Bỏ số 0 đứng đầu; rỗng → "0".
// Độ phức tạp: O(n) / O(n).
// Bẫy: quên xóa tiếp ở cuối khi chuỗi đã tăng dần ("12345", k=2 → "123"); quên bỏ số 0 đầu ("10200", k=1 → "200"); ghép chuỗi bằng += trong vòng lặp ở Java/Python cũ là O(n^2) → dùng mảng rồi join / StringBuilder.
// Cách khác: không có cách đơn giản hơn; DP là quá mức.
// Python/Java: Python `''.join(st).lstrip('0') or '0'`; Java `StringBuilder` làm stack (append/setLength).
export function removeKdigits(num: string, k: number): string {
  const st: string[] = [];
  for (const c of num) {
    while (k > 0 && st.length && st[st.length - 1] > c) {
      st.pop();
      k--;
    }
    st.push(c);
  }
  st.length -= k; // k còn lại > 0 → xóa từ cuối
  let i = 0;
  while (i < st.length - 1 && st[i] === '0') i++;
  const s = st.slice(i).join('');
  return s === '' ? '0' : s;
}
