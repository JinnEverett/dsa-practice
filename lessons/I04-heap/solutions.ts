// I04 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── Heap<T> tổng quát (dùng cho mọi bài) ───
// less(a, b) = true nếu a phải nằm trên b (min-heap: a < b).
export class Heap<T> {
  private a: T[] = [];
  private less: (x: T, y: T) => boolean;
  constructor(less: (x: T, y: T) => boolean, items?: T[]) {
    this.less = less;
    if (items) {
      this.a = items.slice();
      for (let i = (this.a.length >> 1) - 1; i >= 0; i--) this.down(i); // heapify O(n)
    }
  }
  get size(): number {
    return this.a.length;
  }
  peek(): T | undefined {
    return this.a[0];
  }
  push(x: T): void {
    this.a.push(x);
    this.up(this.a.length - 1);
  }
  pop(): T | undefined {
    const a = this.a;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      this.down(0);
    }
    return top;
  }
  private up(i: number): void {
    const a = this.a;
    const x = a[i];
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(x, a[p])) break;
      a[i] = a[p]; // dời cha xuống thay vì swap → ít phép ghi hơn
      i = p;
    }
    a[i] = x;
  }
  private down(i: number): void {
    const a = this.a;
    const n = a.length;
    const x = a[i];
    for (;;) {
      const l = 2 * i + 1;
      if (l >= n) break;
      const r = l + 1;
      const c = r < n && this.less(a[r], a[l]) ? r : l; // con "nhỏ hơn"
      if (!this.less(a[c], x)) break;
      a[i] = a[c];
      i = c;
    }
    a[i] = x;
  }
}

// ─── ex01 · Tự cài min-heap ───
// Ý tưởng: bọc Heap<number>. Python/Java: tự viết sift up/down trên list/int[] (có thể dùng ArrayList<Integer> trong Java).
// Độ phức tạp: push/pop O(log n), peek/size O(1).
export class MinHeap {
  private h = new Heap<number>((x, y) => x < y);
  push(x: number): void {
    this.h.push(x);
  }
  pop(): number {
    return this.h.pop()!;
  }
  peek(): number {
    return this.h.peek()!;
  }
  size(): number {
    return this.h.size;
  }
}

// ─── ex02 · Heap sort ───
// Ý tưởng: heapify thành MAX-heap tại chỗ (sift down từ n/2 − 1 về 0), rồi lặp: đổi a[0] (max) với a[end], sift down trên [0, end).
// Độ phức tạp: O(n log n) time · O(1) space. Không stable.
export function heapSort(nums: number[]): void {
  const down = (i: number, n: number) => {
    const x = nums[i];
    for (;;) {
      const l = 2 * i + 1;
      if (l >= n) break;
      const c = l + 1 < n && nums[l + 1] > nums[l] ? l + 1 : l;
      if (nums[c] <= x) break;
      nums[i] = nums[c];
      i = c;
    }
    nums[i] = x;
  };
  const n = nums.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) down(i, n);
  for (let end = n - 1; end > 0; end--) {
    const t = nums[0];
    nums[0] = nums[end];
    nums[end] = t;
    down(0, end);
  }
}

// ─── ex03 · Phần tử lớn thứ k ───
// Ý tưởng: min-heap giữ k phần tử lớn nhất đã thấy; đỉnh = lớn thứ k.
// Độ phức tạp: O(n log k) time · O(k) space.
// Python/Java: Python `heapq.nlargest(k, nums)[-1]` hoặc heap kích thước k thủ công; Java `PriorityQueue` + `if (pq.size() > k) pq.poll()`.
export function findKthLargest(nums: number[], k: number): number {
  const h = new Heap<number>((x, y) => x < y);
  for (const x of nums) {
    if (h.size < k) h.push(x);
    else if (x > h.peek()!) {
      h.pop();
      h.push(x);
    }
  }
  return h.peek()!;
}

// ─── ex04 · Lớn thứ k trong stream ───
// Ý tưởng: như ex03 nhưng giữ heap qua các lần add.
// Độ phức tạp: add O(log k) · O(k) space.
export class KthLargest {
  private h = new Heap<number>((x, y) => x < y);
  private k: number;
  constructor(k: number, nums: number[]) {
    this.k = k;
    for (const x of nums) this.add(x);
  }
  add(val: number): number {
    if (this.h.size < this.k) this.h.push(val);
    else if (val > this.h.peek()!) {
      this.h.pop();
      this.h.push(val);
    }
    return this.h.peek()!;
  }
}

// ─── ex05 · Đập đá ───
// Ý tưởng: max-heap; pop 2 viên lớn nhất, đẩy phần dư (nếu > 0).
// Độ phức tạp: O(n log n) time · O(n) space (heapify O(n) lúc đầu).
// Python/Java: Python đẩy số âm vào heapq; Java `PriorityQueue<>(Collections.reverseOrder())`.
export function lastStoneWeight(stones: number[]): number {
  const h = new Heap<number>((x, y) => x > y, stones);
  while (h.size > 1) {
    const y = h.pop()!;
    const x = h.pop()!;
    if (y > x) h.push(y - x);
  }
  return h.peek() ?? 0;
}

// ─── ex06 · k điểm gần nhất ───
// Ý tưởng: MAX-heap theo bình phương khoảng cách, kích thước k: điểm mới gần hơn đỉnh thì thay đỉnh.
// Độ phức tạp: O(n log k) time · O(k) space.
// Cách khác: quickselect theo khoảng cách — O(n) trung bình (A12); sort toàn bộ — O(n log n), một dòng.
export function kClosest(points: number[][], k: number): number[][] {
  const d = (p: number[]) => p[0] * p[0] + p[1] * p[1];
  const h = new Heap<number[]>((a, b) => d(a) > d(b));
  for (const p of points) {
    if (h.size < k) h.push(p);
    else if (d(p) < d(h.peek()!)) {
      h.pop();
      h.push(p);
    }
  }
  const out: number[][] = [];
  while (h.size) out.push(h.pop()!);
  return out;
}

// ─── ex07 · Gộp k mảng đã sort ───
// Ý tưởng: heap phần tử [giá trị, mảng i, vị trí j]; pop min, đẩy phần tử kế của mảng i.
// Độ phức tạp: O(N log k) time · O(k) heap.
// Python/Java: Python `heapq.merge(*arrays)` làm sẵn việc này (generator); Java `PriorityQueue<int[]>`.
export function mergeKArrays(arrays: number[][]): number[] {
  const h = new Heap<[number, number, number]>((a, b) => a[0] < b[0]);
  arrays.forEach((arr, i) => arr.length && h.push([arr[0], i, 0]));
  const out: number[] = [];
  while (h.size) {
    const [v, i, j] = h.pop()!;
    out.push(v);
    if (j + 1 < arrays[i].length) h.push([arrays[i][j + 1], i, j + 1]);
  }
  return out;
}

// ─── ex08 · Median của stream ───
// Ý tưởng: low = max-heap (nửa nhỏ), high = min-heap (nửa lớn). addNum: đẩy vào low, chuyển đỉnh low sang high (giữ thứ tự),
//   nếu high nhiều hơn low thì chuyển ngược lại → |low| = |high| hoặc |low| = |high| + 1.
// Độ phức tạp: addNum O(log n) · findMedian O(1).
export class MedianFinder {
  private low = new Heap<number>((x, y) => x > y);
  private high = new Heap<number>((x, y) => x < y);
  addNum(num: number): void {
    this.low.push(num);
    this.high.push(this.low.pop()!);
    if (this.high.size > this.low.size) this.low.push(this.high.pop()!);
  }
  findMedian(): number {
    return this.low.size > this.high.size ? this.low.peek()! : (this.low.peek()! + this.high.peek()!) / 2;
  }
}

// ─── ex09 · Số phòng họp tối thiểu ───
// Ý tưởng: sort theo start; min-heap thời điểm kết thúc của các phòng đang dùng. Cuộc họp mới: nếu phòng sớm rảnh nhất
//   (đỉnh heap) đã kết thúc ≤ start thì dùng lại (pop), luôn push end mới. Số phòng = kích thước heap lớn nhất (= cuối cùng).
// Độ phức tạp: O(n log n) time · O(n) space.
// Cách khác: sweep line — sort riêng mảng start và end, hai con trỏ đếm số cuộc họp đang diễn ra (A11).
export function minMeetingRooms(intervals: number[][]): number {
  const iv = intervals.slice().sort((a, b) => a[0] - b[0]);
  const ends = new Heap<number>((x, y) => x < y);
  for (const [s, e] of iv) {
    if (ends.size && ends.peek()! <= s) ends.pop();
    ends.push(e);
  }
  return ends.size;
}

// ─── ex10 · CPU đơn luồng ───
// Ý tưởng: sort chỉ số job theo enqueueTime. Thời điểm `time`: đẩy mọi job đã đến (enqueue ≤ time) vào heap theo
//   (processingTime, index); heap rỗng thì nhảy time tới job đến kế tiếp; pop job tốt nhất, time += processing.
// Độ phức tạp: O(n log n) time · O(n) space.
// Bẫy: quên nhảy thời gian khi CPU rảnh mà chưa job nào đến → lặp vô hạn. Java: `long time` (tổng processing tới 10¹⁴).
export function getOrder(tasks: number[][]): number[] {
  const idx = tasks.map((_, i) => i).sort((a, b) => tasks[a][0] - tasks[b][0]);
  const h = new Heap<number>((a, b) => tasks[a][1] < tasks[b][1] || (tasks[a][1] === tasks[b][1] && a < b));
  const out: number[] = [];
  let time = 0;
  let p = 0;
  while (out.length < tasks.length) {
    if (!h.size && time < tasks[idx[p]][0]) time = tasks[idx[p]][0];
    while (p < idx.length && tasks[idx[p]][0] <= time) h.push(idx[p++]);
    const j = h.pop()!;
    out.push(j);
    time += tasks[j][1];
  }
  return out;
}
