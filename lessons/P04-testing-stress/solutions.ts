// P04 · Bản sửa + cách tìm lỗi bằng stress test. Chỉ mở sau khi check ✅ (và sau khi bạn tự tìm lỗi bằng stress test).
//
// Mỗi mục: Lỗi là gì · Phản ví dụ NHỎ NHẤT · Stress test nào bắt được (generator cần gì) · Bản sửa · Bài học.

// ─── ex01 · lowerBound: sai khi target lớn hơn mọi phần tử ───
// Lỗi: `hi = n − 1` làm khoảng tìm [lo, hi] bỏ mất đáp án hợp lệ `n` (vị trí chèn cuối mảng).
// Phản ví dụ nhỏ nhất: nums = [1], target = 2 → bản lỗi trả 0, đúng là 1. (Cả mảng rỗng với bản này vẫn đúng: lo = 0, hi = −1 → 0.)
// Stress bắt được khi: target được sinh vượt max(nums) (gen chỉ lấy target trong mảng thì KHÔNG thấy). Brute: quét tuyến tính.
// Bài học: khi đáp án có thể là `n` (một phía "ngoài" mảng), khoảng tìm phải là nửa mở [lo, hi) với hi = n; liệt kê tập đáp án có thể có TRƯỚC khi chọn biên.
export function lowerBound(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// ─── ex02 · sortByFrequency: thiếu tie-break → kết quả không tất định/không khớp đề ───
// Lỗi: comparator chỉ so tần suất; khi bằng nhau, thứ tự phụ thuộc thứ tự chèn (TS/Python) hoặc thứ tự băm (Java HashMap).
// Phản ví dụ nhỏ nhất: ["b", "a"] → bản lỗi trả ["b", "a"], đề yêu cầu ["a", "b"].
// Stress bắt được khi: gen sinh nhiều từ có cùng tần suất (miền từ nhỏ) và brute là bản có tie-break ĐẦY ĐỦ. Test chỉ kiểm tra "đã sắp theo tần suất"
// sẽ không thấy.
// Bài học: mọi comparator phải là thứ tự toàn phần (total order); mọi kết quả nên tất định.
export function sortByFrequency(words: string[]): string[] {
  const cnt = new Map<string, number>();
  for (const w of words) cnt.set(w, (cnt.get(w) ?? 0) + 1);
  return [...cnt.keys()].sort((a, b) => cnt.get(b)! - cnt.get(a)! || (a < b ? -1 : a > b ? 1 : 0));
}

// ─── ex03 · kthSmallest: sort() mặc định so chuỗi ───
// Lỗi: `Array.prototype.sort()` không có comparator đổi phần tử sang chuỗi: [10, 9, 1] → [1, 10, 9].
// Phản ví dụ nhỏ nhất: nums = [10, 9], k = 1 → bản lỗi trả 10 (chuỗi "10" < "9"), đúng là 9.
// Stress bắt được khi: gen có số nhiều chữ số (miền ≥ 10) — gen chỉ 0..9 sẽ KHÔNG thấy. Bài học: chọn miền giá trị gen vượt các "ngưỡng" (1 → 2 chữ số, âm, 0).
// Python/Java không có bug này khi sắp số; nó xuất hiện khi dữ liệu bị đổi thành chuỗi (CSV/JSON/argv) và sắp như chuỗi.
export function kthSmallest(nums: number[], k: number): number {
  const a = Float64Array.from(nums);
  a.sort(); // typed array sort() mặc định là sắp theo SỐ
  return a[k - 1];
}

// ─── ex04 · shortestPath: đánh dấu visited khi LẤY RA khỏi queue ───
// Lỗi: một nút có thể được đẩy vào queue nhiều lần (từ nhiều cha) trước khi bị lấy ra; mỗi bản sao đều được mở rộng lại ⇒ số phần tử trong queue nhân đôi mỗi tầng
// ở đồ thị dạng "thang" (2 nút/tầng, nối đầy đủ giữa hai tầng kề nhau): 2^tầng. Kết quả vẫn ĐÚNG — lỗi chỉ lộ ra ở hiệu năng.
// Phản ví dụ: thang 24 tầng (50 nút): bản lỗi chạy hàng chục giây/hết bộ nhớ, bản đúng < 1 ms.
// Stress bắt được khi: (a) có giới hạn thời gian cho mỗi test và (b) gen sinh đồ thị CÓ CẤU TRÚC (thang, lưới), không chỉ đồ thị ngẫu nhiên thưa.
// Bài học: đánh dấu visited khi ĐẨY VÀO queue (mỗi nút vào queue đúng một lần); stress test cũng phải đo thời gian.
export function shortestPath(n: number, edges: number[][], src: number, dst: number): number {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const dist = new Int32Array(n).fill(-1);
  dist[src] = 0;
  const queue = [src];
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    if (u === dst) return dist[u];
    for (const v of adj[u]) {
      if (dist[v] < 0) {
        dist[v] = dist[u] + 1;
        queue.push(v);
      }
    }
  }
  return -1;
}

// ─── ex05 · productMod: nhân hai số ~10⁹ vượt 2⁵³ ───
// Lỗi: `p * x` có thể tới ~10¹⁸ > 2⁵³ ≈ 9·10¹⁵; double làm tròn nên phần dư sai. Ở Java `int` tràn 2³¹; `long` đủ cho 10⁹·10⁹ nhưng không đủ cho 10¹⁰·10¹⁰.
// Phản ví dụ nhỏ nhất: nums = [999999999, 999999999], mod = 1000000007 → đúng là 64 (vì 999999999 ≡ −8 nên bình phương ≡ 64), bản lỗi trả số khác.
// Stress bắt được khi: gen dùng giá trị CỠ 10⁹ (gen 0..100 không bao giờ tràn). Brute: BigInt.
// Bản sửa: BigInt, hoặc nhân modulo bằng cách tách một thừa số thành hai nửa 15 bit (các tích trung gian < 2⁴⁶).
export function productMod(nums: number[], mod: number): number {
  const mulmod = (a: number, b: number): number => (((a * (b >>> 15)) % mod) * 32768 + a * (b & 32767)) % mod;
  let p = 1 % mod;
  for (const x of nums) p = mulmod(p, x % mod);
  return p;
}

// ─── ex06 · secondLargest: sửa mảng của người gọi ───
// Lỗi: `nums.sort(...)` sắp xếp NGAY TRONG mảng đầu vào (side effect). Kết quả trả về đúng, nhưng người gọi bị đổi dữ liệu.
// Phản ví dụ nhỏ nhất: nums = [1, 2] → bản lỗi để lại [2, 1]. Chỉ thấy khi test kiểm tra CẢ đầu vào sau khi gọi.
// Stress bắt được khi: sao chép đầu vào trước khi gọi rồi so sánh sau khi gọi ("bất biến: hàm không đổi input").
// Bản sửa: một lượt O(n), giữ hai giá trị lớn nhất khác nhau — không cần sort, không sửa input.
export function secondLargest(nums: number[]): number {
  let first = -Infinity;
  let second = -Infinity;
  for (const x of nums) {
    if (x > first) {
      second = first;
      first = x;
    } else if (x < first && x > second) second = x;
  }
  return second === -Infinity ? -1 : second;
}

// ─── ex07 · coinChange: tham lam sai ───
// Lỗi: lấy đồng lớn nhất trước chỉ đúng với hệ tiền "chuẩn" (canonical). Với [1, 3, 4] và 6: tham lam 4+1+1 = 3 đồng, tối ưu 3+3 = 2 đồng.
// Phản ví dụ nhỏ nhất: coins = [1, 3, 4], amount = 6 → bản lỗi 3, đúng 2. Bản lỗi còn sai ở coins = [2, 5], amount = 6: tham lam lấy 5, dư 1 ⇒ trả −1 trong khi 2+2+2 = 6.
// Stress bắt được khi: brute là vét cạn/DP chính xác và gen sinh tập đồng ngẫu nhiên (không chỉ 1,5,10,25).
// Bài học: tham lam cần CHỨNG MINH (exchange argument); luôn có brute để phản bác trực giác.
export function coinChange(coins: number[], amount: number): number {
  const INF = amount + 1;
  const dp = new Array<number>(amount + 1).fill(INF);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) for (const c of coins) if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
  return dp[amount] >= INF ? -1 : dp[amount];
}

// ─── ex08 · bfsOrder: shift() trong vòng lặp ───
// Lỗi: `Array.prototype.shift()` trên mảng lớn là O(n) (V8 chỉ "cắt đầu" O(1) với mảng nhỏ). Kết quả đúng, chậm O(n²).
// Đo thật (máy soạn): rút cạn mảng bằng shift(): 10⁴ phần tử 1 ms · 5·10⁴ → 2 705 ms · 10⁵ → 10 529 ms · 2·10⁵ → 42 861 ms.
// Phản ví dụ: đồ thị sao (một nút nối 10⁵ nút): hàng đợi có 10⁵ phần tử. Python `list.pop(0)` và Java `ArrayList.remove(0)` cũng O(n).
// Stress bắt được khi: có test kích thước LỚN có giới hạn thời gian (stress n nhỏ không thấy) — "stress" gồm cả cỡ lớn có cấu trúc.
// Bản sửa: chỉ số đầu `head++` (hoặc ring buffer / `deque` / `ArrayDeque`).
export function bfsOrder(n: number, edges: number[][], src: number): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  for (const list of adj) list.sort((x, y) => x - y);
  const seen = new Uint8Array(n);
  seen[src] = 1;
  const order = [src];
  for (let head = 0; head < order.length; head++) {
    for (const v of adj[order[head]]) {
      if (!seen[v]) {
        seen[v] = 1;
        order.push(v);
      }
    }
  }
  return order;
}
