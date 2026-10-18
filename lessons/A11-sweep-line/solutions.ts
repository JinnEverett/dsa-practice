// A11 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── ex01 · Số khoảng chồng nhiều nhất ───
// Ý tưởng: sort riêng starts và ends; hai con trỏ: starts[i] < ends[j] ⇒ mở thêm một khoảng; ngược lại đóng một khoảng (end = start thì đóng TRƯỚC ⇒ dấu < chặt).
// Độ phức tạp: O(n log n) time · O(n) space. Mảng đếm theo tọa độ 10⁹ không khả thi.
// Bẫy: Int32Array.sort() sắp theo SỐ (mảng thường phải có comparator). Java: Arrays.sort(int[]) đủ.
export function maxConcurrent(intervals: number[][]): number {
  const n = intervals.length;
  const starts = new Int32Array(n);
  const ends = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    starts[i] = intervals[i][0];
    ends[i] = intervals[i][1];
  }
  starts.sort();
  ends.sort();
  let best = 0;
  let cur = 0;
  for (let i = 0, j = 0; i < n; ) {
    if (starts[i] < ends[j]) {
      cur++;
      i++;
      if (cur > best) best = cur;
    } else {
      cur--;
      j++;
    }
  }
  return best;
}

// ─── ex02 · Đường chân trời (skyline) ───
// Ý tưởng: duyệt các hoành độ quan trọng tăng dần; đẩy các tòa bắt đầu ≤ x vào max-heap [h, right]; pop đỉnh đã kết thúc (right ≤ x) — lazy deletion;
//   chiều cao hiện tại = đỉnh heap hoặc 0; chỉ ghi điểm khi chiều cao đổi.
// Độ phức tạp: O(n log n) time · O(n) space.
// Python: heapq với (-h, -right); Java: PriorityQueue<int[]> comparator Integer.compare.
export function getSkyline(buildings: number[][]): number[][] {
  const b = buildings.slice().sort((p, q) => p[0] - q[0]);
  const xs = new Set<number>();
  for (const [l, r] of b) {
    xs.add(l);
    xs.add(r);
  }
  const sorted = Array.from(xs).sort((p, q) => p - q);
  const heap = new Heap<[number, number]>((p, q) => p[0] > q[0]);
  const out: number[][] = [];
  let i = 0;
  let last = 0;
  for (const x of sorted) {
    while (i < b.length && b[i][0] <= x) {
      heap.push([b[i][2], b[i][1]]);
      i++;
    }
    while (heap.size && heap.peek()![1] <= x) heap.pop();
    const h = heap.size ? heap.peek()![0] : 0;
    if (h !== last) {
      out.push([x, h]);
      last = h;
    }
  }
  return out;
}

// ─── ex03 · Thời gian rảnh chung của nhân viên ───
// Ý tưởng: gộp mọi khoảng bận, sort theo start, giữ maxEnd; start > maxEnd ⇒ khe rảnh [maxEnd, start] (khe độ dài 0 không tính).
// Độ phức tạp: O(N log N) time (N = tổng số khoảng) · O(N) space. Bài dùng int[][][] — lớp ngoài là nhân viên.
export function employeeFreeTime(schedule: number[][][]): number[][] {
  const all: number[][] = [];
  for (const emp of schedule) for (const iv of emp) all.push(iv);
  all.sort((a, b) => a[0] - b[0]);
  const out: number[][] = [];
  if (!all.length) return out;
  let maxEnd = all[0][1];
  for (let i = 1; i < all.length; i++) {
    if (all[i][0] > maxEnd) out.push([maxEnd, all[i][0]]);
    if (all[i][1] > maxEnd) maxEnd = all[i][1];
  }
  return out;
}

// ─── ex04 · Lịch đặt phòng (không chồng) ───
// Ý tưởng: giữ starts/ends song song, đã sắp theo start (các khoảng đã nhận không chồng nhau). Với [s, e): k = vị trí chèn của s;
//   hợp lệ khi khoảng k−1 có end ≤ s và khoảng k có start ≥ e. Chèn bằng splice.
// Độ phức tạp: O(log n) tìm + O(n) memmove chèn (thực tế rất nhanh) · O(n) space. Duyệt toàn bộ danh sách mỗi lần: O(n) ⇒ O(n²) tổng.
// Java: TreeMap.floorEntry/ceilingEntry cho O(log n) chắc chắn.
export class MyCalendar {
  private starts: number[] = [];
  private ends: number[] = [];
  book(start: number, end: number): boolean {
    const s = this.starts;
    let lo = 0;
    let hi = s.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (s[mid] < start) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0 && this.ends[lo - 1] > start) return false;
    if (lo < s.length && s[lo] < end) return false;
    s.splice(lo, 0, start);
    this.ends.splice(lo, 0, end);
    return true;
  }
}

// ─── ex05 · Lịch đặt phòng (cho phép chồng đôi, không chồng ba) ───
// Ý tưởng: giữ danh sách các khoảng đã nhận `booked` và danh sách các đoạn bị chồng đôi `overlaps`. Khoảng mới chồng với một đoạn trong `overlaps` ⇒ sẽ chồng ba ⇒ từ chối.
//   Ngược lại thêm giao của nó với từng khoảng trong `booked` vào `overlaps`, rồi thêm khoảng mới vào `booked`.
// Độ phức tạp: O(k) mỗi lần gọi (k = số lần đã nhận) · O(k) space. Đủ cho tối đa 3000 lần gọi; mức chồng cao hơn: segment tree động (A08 ex08).
export class MyCalendarTwo {
  private booked: number[][] = [];
  private overlaps: number[][] = [];
  book(start: number, end: number): boolean {
    for (const [a, b] of this.overlaps) if (start < b && a < end) return false;
    for (const [a, b] of this.booked) {
      const s = Math.max(a, start);
      const e = Math.min(b, end);
      if (s < e) this.overlaps.push([s, e]);
    }
    this.booked.push([start, end]);
    return true;
  }
}

// ─── ex06 · Diện tích hợp các hình chữ nhật ───
// Ý tưởng: nén y; sự kiện theo x (mở +1 / đóng −1 trên các slab y thuộc [y1, y2)). Giữa hai x liên tiếp: area += cover · Δx với cover = tổng độ dài slab có count > 0. Mod 1e9+7.
// Độ phức tạp: O(n²) time (n hình, mỗi sự kiện quét ≤ 2n slab) · O(n) space.
// Bẫy: cover · Δx tới 10¹⁸ vượt 2⁵³ ⇒ nhân mod bằng mulmod tách bit (TS). Java: ((cover % M) * (dx % M)) % M vẫn vừa long.
const M = 1_000_000_007;
const mulmod = (a: number, b: number): number => (((a * (b >>> 15)) % M) * 32768 + a * (b & 32767)) % M;
export function rectangleArea(rectangles: number[][]): number {
  const ys = Array.from(new Set(rectangles.flatMap((r) => [r[1], r[3]]))).sort((a, b) => a - b);
  const yIndex = new Map<number, number>();
  ys.forEach((y, i) => yIndex.set(y, i));
  const events: number[][] = []; // [x, delta, yLowIdx, yHighIdx]
  for (const [x1, y1, x2, y2] of rectangles) {
    events.push([x1, 1, yIndex.get(y1)!, yIndex.get(y2)!]);
    events.push([x2, -1, yIndex.get(y1)!, yIndex.get(y2)!]);
  }
  events.sort((a, b) => a[0] - b[0]);
  const count = new Int32Array(ys.length); // slab i = [ys[i], ys[i+1])
  let area = 0;
  let prevX = events[0][0];
  for (const [x, d, lo, hi] of events) {
    if (x > prevX) {
      let cover = 0;
      for (let i = 0; i + 1 < ys.length; i++) if (count[i] > 0) cover += ys[i + 1] - ys[i];
      area = (area + mulmod(cover % M, (x - prevX) % M)) % M;
      prevX = x;
    }
    for (let i = lo; i < hi; i++) count[i] += d;
  }
  return area;
}

// ─── ex07 · 🔴 Khách sạn đủ phòng không? ───
// Ý tưởng: mỗi đặt phòng [in, out, need]: sự kiện (in, +need), (out, −need); cùng thời điểm xử lý −need trước +need (khách trả phòng buổi sáng, khách mới nhận phòng buổi chiều). Tổng đang dùng ≤ rooms ở mọi lúc.
// Độ phức tạp: O(n log n) time · O(n) space. Mảng đếm theo ngày (10⁹) không khả thi.
// Bẫy: tổng nhu cầu tới 10⁹ vẫn vừa int, nhưng Java dùng long cho an toàn.
export function canAccommodate(bookings: number[][], rooms: number): boolean {
  // Mẹo hiệu năng TS: gói (thời điểm, chỉ số) thành MỘT số (thời điểm · 2¹⁷ + chỉ số < 2⁵³) rồi dùng Float64Array.sort() gốc
  // — nhanh hơn nhiều so với sort mảng các cặp bằng comparator.
  const n = bookings.length;
  const K = 131072; // 2¹⁷ > n
  const starts = new Float64Array(n);
  const ends = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    starts[i] = bookings[i][0] * K + i;
    ends[i] = bookings[i][1] * K + i;
  }
  starts.sort();
  ends.sort();
  let cur = 0;
  for (let i = 0, j = 0; i < n; ) {
    const si = starts[i] % K;
    const ts = (starts[i] - si) / K;
    const ej = ends[j] % K;
    const te = (ends[j] - ej) / K;
    if (ts < te) {
      cur += bookings[si][2];
      if (cur > rooms) return false;
      i++;
    } else {
      cur -= bookings[ej][2];
      j++;
    }
  }
  return true;
}

// ─── ex08 · 🔴 Khung giờ họp chung sớm nhất ───
// Ý tưởng: sort hai danh sách theo start; two pointers: giao của hai khoảng hiện tại [max(s), min(e)]; đủ dài ⇒ trả [start, start + duration] (đầu tiên tìm được cũng là sớm nhất);
//   không thì tiến con trỏ có end nhỏ hơn.
// Độ phức tạp: O(n log n) time (sort) · O(1) space phụ.
export function minAvailableDuration(slots1: number[][], slots2: number[][], duration: number): number[] {
  const a = slots1.slice().sort((p, q) => p[0] - q[0]);
  const b = slots2.slice().sort((p, q) => p[0] - q[0]);
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const s = Math.max(a[i][0], b[j][0]);
    const e = Math.min(a[i][1], b[j][1]);
    if (e - s >= duration) return [s, s + duration];
    if (a[i][1] < b[j][1]) i++;
    else j++;
  }
  return [];
}
