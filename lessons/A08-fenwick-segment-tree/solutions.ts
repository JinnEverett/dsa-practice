// A08 · Đáp án best practice. Chỉ mở sau khi check ✅.

/** Fenwick tree 1-indexed dùng Float64Array (tổng chính xác tới 2⁵³). */
class Fenwick {
  readonly n: number;
  readonly t: Float64Array;
  constructor(n: number) {
    this.n = n;
    this.t = new Float64Array(n + 1);
  }
  add(i: number, d: number): void {
    for (; i <= this.n; i += i & -i) this.t[i] += d;
  }
  prefix(i: number): number {
    let s = 0;
    for (; i > 0; i -= i & -i) s += this.t[i];
    return s;
  }
}

/** Số phần tử trong mảng tăng `a` nhỏ hơn x (vị trí chèn trái). */
function lowerBound(a: ArrayLike<number>, x: number): number {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
/** Số phần tử ≤ x. */
function upperBound(a: ArrayLike<number>, x: number): number {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
const sortedUnique = (a: number[]): number[] => Array.from(new Set(a)).sort((x, y) => x - y);

// ─── ex01 · Tổng đoạn có cập nhật (Fenwick) ───
// Ý tưởng: BIT trên mảng; update(i, val) cộng chênh lệch val − nums[i]; sumRange = prefix(r+1) − prefix(l). Dựng O(n) bằng "đẩy lên cha".
// Độ phức tạp: dựng O(n), mỗi thao tác O(log n). Quét thô O(n) mỗi truy vấn ⇒ 10¹⁰ phép ở n = q = 10⁵.
// Bẫy: BIT 1-indexed; tổng tới 10¹⁴ ⇒ Java `long`. Python/Java: mảng thường, cùng công thức.
export class NumArrayMutable {
  private nums: number[];
  private bit: Fenwick;
  constructor(nums: number[]) {
    this.nums = nums.slice();
    const n = nums.length;
    this.bit = new Fenwick(n);
    const t = this.bit.t;
    for (let i = 1; i <= n; i++) {
      t[i] += nums[i - 1];
      const j = i + (i & -i);
      if (j <= n) t[j] += t[i];
    }
  }
  update(index: number, val: number): void {
    this.bit.add(index + 1, val - this.nums[index]);
    this.nums[index] = val;
  }
  sumRange(left: number, right: number): number {
    return this.bit.prefix(right + 1) - this.bit.prefix(left);
  }
}

// ─── ex02 · Đếm số phần tử nhỏ hơn bên phải ───
// Ý tưởng: nén tọa độ; duyệt từ phải sang trái: counts[i] = prefix(rank − 1) (số giá trị nhỏ hơn đã thấy), rồi add(rank, 1).
// Độ phức tạp: O(n log n) time · O(n) space. Bản O(n²) = 5·10⁹ phép ở n = 10⁵.
// Cách khác: merge sort đếm khi trộn.
export function countSmaller(nums: number[]): number[] {
  const S = sortedUnique(nums);
  const bit = new Fenwick(S.length);
  const out = new Array<number>(nums.length);
  for (let i = nums.length - 1; i >= 0; i--) {
    const rank = lowerBound(S, nums[i]) + 1;
    out[i] = bit.prefix(rank - 1);
    bit.add(rank, 1);
  }
  return out;
}

// ─── ex03 · Min đoạn có cập nhật (segment tree) ───
// Ý tưởng: segment tree bottom-up (mảng 2n). update: ghi lá rồi tính lại các tổ tiên; query [l, r]: gộp các node phủ đoạn.
// Độ phức tạp: dựng O(n), mỗi thao tác O(log n) · O(n) space. Đúng cho phép giao hoán (min).
export class RangeMin {
  private n: number;
  private t: Int32Array;
  constructor(nums: number[]) {
    this.n = nums.length;
    this.t = new Int32Array(2 * this.n);
    for (let i = 0; i < this.n; i++) this.t[this.n + i] = nums[i];
    for (let i = this.n - 1; i >= 1; i--) this.t[i] = Math.min(this.t[2 * i], this.t[2 * i + 1]);
  }
  update(i: number, val: number): void {
    const t = this.t;
    let p = i + this.n;
    t[p] = val;
    for (; p > 1; p >>= 1) t[p >> 1] = Math.min(t[p], t[p ^ 1]);
  }
  query(l: number, r: number): number {
    const t = this.t;
    let res = 2147483647;
    for (l += this.n, r += this.n + 1; l < r; l >>= 1, r >>= 1) {
      if (l & 1) res = Math.min(res, t[l++]);
      if (r & 1) res = Math.min(res, t[--r]);
    }
    return res;
  }
}

// ─── ex04 · Đếm đoạn có tổng trong [lower, upper] ───
// Ý tưởng: prefix P[0..n]; đếm cặp i < j với P[j] − upper ≤ P[i] ≤ P[j] − lower ⇒ BIT trên P đã nén: truy vấn trước, thêm P[j] sau.
// Độ phức tạp: O(n log n) time · O(n) space. Bản O(n²) = 5·10⁹.
// Bẫy: kết quả tới n(n+1)/2 = 5·10⁹ > int ⇒ Java `long`; prefix cũng dùng `long`.
export function countRangeSum(nums: number[], lower: number, upper: number): number {
  const n = nums.length;
  const P = new Array<number>(n + 1).fill(0);
  for (let i = 0; i < n; i++) P[i + 1] = P[i] + nums[i];
  const S = sortedUnique(P);
  const bit = new Fenwick(S.length);
  let count = 0;
  bit.add(lowerBound(S, P[0]) + 1, 1);
  for (let j = 1; j <= n; j++) {
    const hi = upperBound(S, P[j] - lower); // số giá trị ≤ P[j] − lower
    const lo = lowerBound(S, P[j] - upper); // số giá trị < P[j] − upper
    count += bit.prefix(hi) - bit.prefix(lo);
    bit.add(lowerBound(S, P[j]) + 1, 1);
  }
  return count;
}

// ─── ex05 · Cặp đảo ngược quan trọng ───
// Ý tưởng: đếm i < j với nums[i] > 2·nums[j]. Duyệt j; số giá trị đã thấy > 2·nums[j] = đã thêm − prefix(upperBound(S, 2·nums[j])).
// Độ phức tạp: O(n log n) time · O(n) space.
// Bẫy: 2·nums[j] tràn int ⇒ Java `2L * nums[j]`; kết quả tới 5·10⁹ ⇒ `long`.
export function reversePairs(nums: number[]): number {
  const S = sortedUnique(nums);
  const bit = new Fenwick(S.length);
  let count = 0;
  for (let j = 0; j < nums.length; j++) {
    count += j - bit.prefix(upperBound(S, 2 * nums[j]));
    bit.add(lowerBound(S, nums[j]) + 1, 1);
  }
  return count;
}

// ─── ex06 · Cộng đoạn, tổng đoạn (2 Fenwick) ───
// Ý tưởng: lưu mảng sai phân d. add(l, r, v): d[l] += v, d[r+1] −= v. prefixSum(i) = i·Σd[1..i] − Σ((k−1)·d[k]) ⇒ cần hai BIT: B1 (d) và B2 ((k−1)·d).
// Độ phức tạp: O(log n) mỗi thao tác · O(n) space.
// Cách khác: segment tree + lazy propagation (xem README §5) — tổng quát hơn nhưng nhiều code hơn.
export class RangeAddSum {
  private n: number;
  private b1: Fenwick;
  private b2: Fenwick;
  constructor(n: number) {
    this.n = n;
    this.b1 = new Fenwick(n + 1);
    this.b2 = new Fenwick(n + 1);
  }
  private prefix(i: number): number {
    return this.b1.prefix(i) * i - this.b2.prefix(i);
  }
  add(l: number, r: number, v: number): void {
    const p = l + 1;
    const q = r + 1;
    this.b1.add(p, v);
    this.b1.add(q + 1, -v);
    this.b2.add(p, v * (p - 1));
    this.b2.add(q + 1, -v * q);
  }
  sum(l: number, r: number): number {
    return this.prefix(r + 1) - this.prefix(l);
  }
}

// ─── ex07 · 🔴 Xếp hạng sau mỗi lần nộp bài ───
// Ý tưởng: offline: nén điểm; ngay khi nộp, rank = 1 + số điểm đã nộp TRƯỚC đó lớn hơn hẳn = đã thêm − prefix(upperBound(S, s)); rồi thêm điểm vào BIT.
// Độ phức tạp: O(n log n) time · O(n) space. Bản đếm tuyến tính O(n²).
export function rankAfterEachScore(scores: number[]): number[] {
  const S = sortedUnique(scores);
  const bit = new Fenwick(S.length);
  return scores.map((s, i) => {
    const rank = 1 + i - bit.prefix(upperBound(S, s));
    bit.add(lowerBound(S, s) + 1, 1);
    return rank;
  });
}

// ─── ex08 · 🔴 Lịch đặt phòng — mức chồng chéo cao nhất ───
// Ý tưởng: segment tree ĐỘNG trên [0, 10⁹): node tạo lười. book(s, e): cộng 1 cho [s, e−1]; max[node] = max(max[trái], max[phải]) + add[node]
//   ("tag vĩnh viễn", không cần push-down vì phép max+cộng đoạn giao hoán). Đáp án = max[gốc].
// Độ phức tạp: O(log C) time mỗi book (C = 10⁹ ⇒ ~30 tầng) · O(k log C) space. Duy trì danh sách sự kiện rồi quét: O(k) mỗi lần ⇒ O(k²).
// Bẫy: khoảng nửa mở [s, e) ⇒ cập nhật [s, e−1]; API online nên không nén tọa độ trước được.
export class MyCalendarThree {
  private L: Int32Array = new Int32Array(1 << 16);
  private R: Int32Array = new Int32Array(1 << 16);
  private mx: Int32Array = new Int32Array(1 << 16);
  private ad: Int32Array = new Int32Array(1 << 16);
  private cnt = 2; // node 0 = nút rỗng (mx = 0, con chưa tạo trỏ vào đây); gốc = node 1
  private newNode(): number {
    if (this.cnt === this.L.length) {
      const grow = (a: Int32Array) => {
        const b = new Int32Array(a.length * 2);
        b.set(a);
        return b;
      };
      this.L = grow(this.L);
      this.R = grow(this.R);
      this.mx = grow(this.mx);
      this.ad = grow(this.ad);
    }
    return this.cnt++;
  }
  private update(node: number, lo: number, hi: number, l: number, r: number): void {
    if (l <= lo && hi <= r) {
      this.mx[node]++;
      this.ad[node]++;
      return;
    }
    const mid = (lo + hi) >> 1;
    if (l <= mid) {
      if (!this.L[node]) this.L[node] = this.newNode();
      this.update(this.L[node], lo, mid, l, r);
    }
    if (r > mid) {
      if (!this.R[node]) this.R[node] = this.newNode();
      this.update(this.R[node], mid + 1, hi, l, r);
    }
    this.mx[node] = Math.max(this.mx[this.L[node]], this.mx[this.R[node]]) + this.ad[node];
  }
  book(startTime: number, endTime: number): number {
    this.update(1, 0, 999_999_999, startTime, endTime - 1);
    return this.mx[1];
  }
}
