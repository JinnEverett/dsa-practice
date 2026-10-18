// P07 · Đáp án best practice (Timed set Hard/mixed). Chỉ mở sau khi check ✅ hoặc hết giờ.
import { Heap } from '../I04-heap/solutions.ts';

// ─── ex01 · Trung vị của hai mảng đã sắp (≈ LeetCode 4) ───
// Ý tưởng: trung vị chia tập gộp thành nửa trái / nửa phải bằng nhau. Chọn i phần tử từ mảng NGẮN `a`, j = ⌈(m+n)/2⌉ − i từ `b` cho nửa trái.
// Hợp lệ khi aL ≤ bR và bL ≤ aR (aL = a[i−1], aR = a[i], …) — mọi phần tử nửa trái ≤ mọi phần tử nửa phải. Binary search i trên [0, m]:
// aL > bR ⇒ lấy ít hơn từ a (hi = i − 1); ngược lại lấy nhiều hơn (lo = i + 1). Dùng ±∞ cho biên.
// Độ phức tạp: O(log(min(m, n))) time · O(1) space. Brute: gộp O(m + n); concat + sort O((m+n) log(m+n)).
// Vì sao best practice: bất biến "nửa trái ≤ nửa phải" tránh phải duyệt phần tử; cắt đôi miền tìm mỗi bước.
// Bẫy: binary search trên mảng DÀI (j có thể âm); tổng lẻ/chẵn; biên ±∞ khi i = 0 hoặc i = m; Java `(a + b) / 2` tràn `int` → ép `double` trước khi cộng.
export function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  let a = nums1;
  let b = nums2;
  if (a.length > b.length) [a, b] = [b, a];
  const m = a.length;
  const n = b.length;
  const half = (m + n + 1) >> 1;
  let lo = 0;
  let hi = m;
  while (lo <= hi) {
    const i = (lo + hi) >> 1;
    const j = half - i;
    const aL = i > 0 ? a[i - 1] : -Infinity;
    const aR = i < m ? a[i] : Infinity;
    const bL = j > 0 ? b[j - 1] : -Infinity;
    const bR = j < n ? b[j] : Infinity;
    if (aL <= bR && bL <= aR) return (m + n) % 2 === 1 ? Math.max(aL, bL) : (Math.max(aL, bL) + Math.min(aR, bR)) / 2;
    if (aL > bR) hi = i - 1;
    else lo = i + 1;
  }
  return NaN; // không xảy ra với input hợp lệ
}

// ─── ex02 · Khớp mẫu với '.' và '*' (≈ LeetCode 10) ───
// Ý tưởng: dp[i][j] = s[i..] khớp p[j..] (hậu tố). Nếu p[j+1] = '*': hoặc bỏ "x*" (dp[i][j+2]) hoặc, nếu s[i] khớp x, dùng thêm một lần (dp[i+1][j]).
// Ngược lại: s[i] khớp p[j] (bằng nhau hoặc '.') và dp[i+1][j+1]. Điền từ hậu tố ngắn nhất tới dài nhất.
// Độ phức tạp: O(|s|·|p|) time · O(|s|·|p|) space (giảm được còn O(|p|) với hai hàng). Đệ quy không nhớ là hàm mũ: s = "aaaa…", p = "a*a*a*…b".
// Bẫy: mẫu rỗng chỉ khớp chuỗi rỗng; "a*" khớp 0 lần; '*' đứng sau '.' ("`.*`") khớp mọi chuỗi; kiểm tra biên khi p[j+1] vượt độ dài.
export function isMatch(s: string, p: string): boolean {
  const m = s.length;
  const n = p.length;
  const dp: boolean[][] = Array.from({ length: m + 2 }, () => new Array<boolean>(n + 2).fill(false));
  dp[m][n] = true;
  for (let i = m; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const first = i < m && (p[j] === s[i] || p[j] === '.');
      if (j + 1 < n && p[j + 1] === '*') dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j]);
      else dp[i][j] = first && dp[i + 1][j + 1];
    }
  }
  return dp[0][0];
}

// ─── ex03 · Số tuyến xe buýt ít nhất (≈ LeetCode 815) ───
// Ý tưởng: kết hợp HAI kỹ thuật: (1) hash map `stop → các tuyến đi qua`, (2) BFS trên TUYẾN (không phải trên điểm dừng): nút = tuyến, mỗi bước = lên một tuyến mới.
// Mỗi tuyến và mỗi điểm dừng chỉ xử lý một lần (đánh dấu khi đẩy vào queue). Chạm đích khi tuyến vừa lên chứa `target`.
// Độ phức tạp: O(Σ độ dài tuyến) time và space. BFS trên điểm dừng, nối mọi cặp điểm trên cùng tuyến, là O(Σ L²).
// Bẫy: source == target → 0 (không cần lên xe); đếm số TUYẾN, không phải số điểm dừng; quên đánh dấu tuyến đã thăm ⇒ duyệt lại mỗi điểm dừng nhiều lần.
export function numBusesToDestination(routes: number[][], source: number, target: number): number {
  if (source === target) return 0;
  const byStop = new Map<number, number[]>();
  routes.forEach((r, i) => {
    for (const s of r) {
      let l = byStop.get(s);
      if (!l) byStop.set(s, (l = []));
      l.push(i);
    }
  });
  const routeSeen = new Uint8Array(routes.length);
  const stopSeen = new Set<number>([source]);
  let layer: number[] = [];
  for (const i of byStop.get(source) ?? []) {
    routeSeen[i] = 1;
    layer.push(i);
  }
  for (let buses = 1; layer.length; buses++) {
    const next: number[] = [];
    for (const i of layer) {
      for (const s of routes[i]) {
        if (s === target) return buses;
        if (stopSeen.has(s)) continue;
        stopSeen.add(s);
        for (const j of byStop.get(s)!) if (!routeSeen[j]) {
          routeSeen[j] = 1;
          next.push(j);
        }
      }
    }
    layer = next;
  }
  return -1;
}

// ─── ex04 · Phòng họp được đặt nhiều nhất (≈ LeetCode 2402) ───
// Ý tưởng: xử lý cuộc họp theo thứ tự `start`. Hai heap: `free` (min-heap chỉ số phòng rảnh) và `busy` (min-heap theo (thời điểm rảnh, chỉ số phòng)).
// Với cuộc họp [s, e): trước hết giải phóng mọi phòng có thời điểm rảnh ≤ s sang `free`. Còn phòng rảnh → lấy chỉ số nhỏ nhất, kết thúc ở e.
// Không còn → lấy phòng rảnh sớm nhất (hòa: chỉ số nhỏ), cuộc họp BỊ DỜI: bắt đầu ở thời điểm đó, giữ nguyên thời lượng ⇒ kết thúc ở rảnh + (e − s).
// Đếm số cuộc họp mỗi phòng; trả phòng nhiều nhất (hòa: chỉ số nhỏ).
// Độ phức tạp: O(M log M + (M + n) log n). Quét mọi phòng cho mỗi cuộc họp là O(M·n) = 10¹⁰ khi n, M = 10⁵.
// Bẫy: thời điểm kết thúc sau khi bị dời có thể vượt `int` (10⁵ cuộc × 5·10⁵ phút = 5·10¹⁰) → Java dùng `long`; sắp theo start trước; giải phóng phòng với `≤ s` (kết thúc lúc s là rảnh).
// Kết hợp kỹ thuật: sắp xếp + hai heap + mô phỏng sự kiện.
export function mostBooked(n: number, meetings: number[][]): number {
  const ms = meetings.map((m) => [m[0], m[1]]).sort((a, b) => a[0] - b[0]);
  const free = new Heap<number>((a, b) => a < b, Array.from({ length: n }, (_, i) => i));
  const busy = new Heap<[number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]));
  const cnt = new Array<number>(n).fill(0);
  for (const [s, e] of ms) {
    while (busy.size && busy.peek()![0] <= s) free.push(busy.pop()![1]);
    let room: number;
    let end: number;
    if (free.size) {
      room = free.pop()!;
      end = e;
    } else {
      const [t, r] = busy.pop()!;
      room = r;
      end = t + (e - s);
    }
    cnt[room]++;
    busy.push([end, room]);
  }
  let best = 0;
  for (let i = 1; i < n; i++) if (cnt[i] > cnt[best]) best = i;
  return best;
}
