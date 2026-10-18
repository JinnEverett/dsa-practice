// A12 · Đáp án best practice. Chỉ mở sau khi check ✅.

const swap = (a: Int32Array, i: number, j: number) => {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
};

/**
 * Quickselect 3-way, pivot ngẫu nhiên: sau khi chạy, a[t] là phần tử thứ t (0-based) khi sắp xếp, mọi phần tử bên trái ≤ a[t] ≤ mọi phần tử bên phải.
 */
function selectInPlace(a: Int32Array, t: number): number {
  let lo = 0;
  let hi = a.length - 1;
  while (lo < hi) {
    const p = a[lo + Math.floor(Math.random() * (hi - lo + 1))];
    let lt = lo;
    let i = lo;
    let gt = hi;
    while (i <= gt) {
      if (a[i] < p) swap(a, lt++, i++);
      else if (a[i] > p) swap(a, i, gt--);
      else i++;
    }
    if (t < lt) hi = lt - 1;
    else if (t > gt) lo = gt + 1;
    else return p;
  }
  return a[lo];
}

// ─── ex01 · Phần tử nhỏ thứ k (quickselect) ───
// Ý tưởng: partition 3 phần (<, =, > pivot) với pivot ngẫu nhiên; chỉ tiếp tục ở phần chứa chỉ số đích. Tổng công việc n + n/2 + … = O(n) kỳ vọng.
// Độ phức tạp: O(n) kỳ vọng, O(n²) xấu nhất (xác suất rất nhỏ) · O(n) space (bản sao mảng để không phá input).
// Vì sao best practice: 3-way miễn nhiễm với dữ liệu trùng; 2-way (Lomuto/Hoare thuần) trên mảng toàn giá trị bằng nhau là O(n²) dù pivot ngẫu nhiên.
// Bẫy: pivot cố định bị đánh bại bởi mảng đã sắp. Python/Java: Python viết lại bằng list (chậm ×30, cân nhắc `heapq.nsmallest` cho k nhỏ); Java dùng `int[]` và `ThreadLocalRandom`.
export function quickSelect(nums: number[], k: number): number {
  return selectInPlace(Int32Array.from(nums), k - 1);
}

// ─── ex02 · Wiggle sort II ───
// Ý tưởng: sắp xếp, chia đôi: nửa nhỏ (ceil(n/2) phần tử) và nửa lớn; xếp xen kẽ nhỏ[i] ở vị trí 2i, lớn[i] ở 2i+1 — mỗi nửa duyệt TỪ CUỐI về đầu
//   (để hai phần tử bằng nhau của hai nửa không đứng cạnh nhau).
// Độ phức tạp: O(n log n) time · O(n) space. Có bản O(n) kỳ vọng: quickselect tìm median + "virtual index" 3-way partition (khó hơn nhiều).
// Bẫy: duyệt hai nửa theo thứ tự tăng ⇒ lỗi với mảng như [4,5,5,6]. Điều kiện tồn tại: không giá trị nào xuất hiện quá ceil(n/2) lần (đề đảm bảo).
export function wiggleSortII(nums: number[]): void {
  const n = nums.length;
  const s = Int32Array.from(nums).sort();
  let small = (n + 1) >> 1; // chỉ số kế tiếp (đếm lùi) trong nửa nhỏ: s[0..small)
  let large = n; // nửa lớn: s[small0..n)
  for (let i = 0; i < n; i++) nums[i] = i % 2 === 0 ? s[--small] : s[--large];
}

// ─── ex03 · Dynamic array tự cài ───
// Ý tưởng: bộ đệm Int32Array có capacity; push đầy ⇒ cấp phát gấp đôi và copy; pop xong nếu size·4 ≤ capacity (và capacity > 1) ⇒ co còn một nửa.
//   Ngưỡng co (1/4) khác ngưỡng giãn (đầy) để tránh thrashing quanh một ngưỡng.
// Độ phức tạp: push/pop O(1) amortized (tổng copy ≤ 2n mỗi chiều), get O(1) · bộ nhớ ≤ 4 · size.
// Bẫy: co khi size < cap/2 ⇒ push–pop xen kẽ tốn O(n) mỗi lần. Python/Java: dùng mảng thô (`[None]*cap`, `int[]` + `Arrays.copyOf`), không dùng `append`/`ArrayList` (đó là thứ bài này mô phỏng).
export class DynamicArray {
  private buf: Int32Array = new Int32Array(1);
  private n = 0;
  private resize(cap: number): void {
    const b = new Int32Array(cap);
    b.set(this.buf.subarray(0, this.n));
    this.buf = b;
  }
  push(x: number): void {
    if (this.n === this.buf.length) this.resize(this.buf.length * 2);
    this.buf[this.n++] = x;
  }
  pop(): number {
    const x = this.buf[--this.n];
    if (this.buf.length > 1 && this.n * 4 <= this.buf.length) this.resize(this.buf.length >> 1);
    return x;
  }
  get(i: number): number {
    return this.buf[i];
  }
  capacity(): number {
    return this.buf.length;
  }
}

// ─── ex04 · RandomizedSet O(1) ───
// Ý tưởng: mảng vals + Map val → chỉ số. remove: chuyển phần tử cuối vào chỗ trống rồi pop (O(1)); getRandom: vals[random].
// Độ phức tạp: insert/remove/getRandom O(1) trung bình · O(n) space. Dùng indexOf/splice trên mảng ⇒ remove O(n).
// Bẫy: khi xóa chính phần tử cuối, cập nhật Map theo đúng thứ tự (xóa key SAU khi chuyển phần tử cuối).
export class RandomizedSet {
  private vals: number[] = [];
  private idx = new Map<number, number>();
  insert(val: number): boolean {
    if (this.idx.has(val)) return false;
    this.idx.set(val, this.vals.length);
    this.vals.push(val);
    return true;
  }
  remove(val: number): boolean {
    const i = this.idx.get(val);
    if (i === undefined) return false;
    const last = this.vals[this.vals.length - 1];
    this.vals[i] = last;
    this.idx.set(last, i);
    this.vals.pop();
    this.idx.delete(val);
    return true;
  }
  getRandom(): number {
    return this.vals[Math.floor(Math.random() * this.vals.length)];
  }
}

// ─── ex05 · Skip list ───
// Ý tưởng: danh sách liên kết nhiều tầng (tối đa 16 tầng), node thăng tầng với xác suất 1/2. Tìm: đi từ tầng cao nhất, tiến khi next < target, hạ tầng khi không tiến được.
//   add: ghi lại node đứng trước ở mỗi tầng (update[]), chen node mới (cho phép trùng). erase: bỏ node đầu tiên có giá trị num ở mọi tầng nó có mặt.
// Độ phức tạp: O(log n) kỳ vọng mỗi thao tác · O(n) space kỳ vọng. Kết quả đúng KHÔNG phụ thuộc random.
// Cách khác: mảng đã sắp + binary search + splice (đơn giản, nhanh thực tế ở n ≤ 10⁵); Java TreeMap<Integer, Integer> đếm số lần.
class SkipNode {
  val: number;
  next: (SkipNode | null)[];
  constructor(val: number, levels: number) {
    this.val = val;
    this.next = new Array<SkipNode | null>(levels).fill(null);
  }
}
const MAX_LEVEL = 16;
export class Skiplist {
  private head = new SkipNode(-Infinity, MAX_LEVEL);
  private randomLevel(): number {
    let lv = 1;
    while (lv < MAX_LEVEL && Math.random() < 0.5) lv++;
    return lv;
  }
  /** preds[l] = node cuối cùng ở tầng l có val < x. */
  private findPreds(x: number): SkipNode[] {
    const preds = new Array<SkipNode>(MAX_LEVEL);
    let cur = this.head;
    for (let l = MAX_LEVEL - 1; l >= 0; l--) {
      while (cur.next[l] !== null && cur.next[l]!.val < x) cur = cur.next[l]!;
      preds[l] = cur;
    }
    return preds;
  }
  search(target: number): boolean {
    const nxt = this.findPreds(target)[0].next[0];
    return nxt !== null && nxt.val === target;
  }
  add(num: number): void {
    const preds = this.findPreds(num);
    const lv = this.randomLevel();
    const node = new SkipNode(num, lv);
    for (let l = 0; l < lv; l++) {
      node.next[l] = preds[l].next[l];
      preds[l].next[l] = node;
    }
  }
  erase(num: number): boolean {
    const preds = this.findPreds(num);
    const node = preds[0].next[0];
    if (node === null || node.val !== num) return false;
    for (let l = 0; l < MAX_LEVEL; l++) {
      if (preds[l].next[l] !== node) break;
      preds[l].next[l] = node.next[l];
    }
    return true;
  }
}

// ─── ex06 · Reservoir sampling (RNG đặc tả) ───
// Ý tưởng: Algorithm R: giữ k phần tử đầu; với phần tử i ≥ k: state = state·48271 mod (2³¹−1); j = state mod (i+1); j < k ⇒ reservoir[j] = stream[i].
// Độ phức tạp: O(n) time · O(k) space (bên ngoài input). Mỗi phần tử có xác suất k/n nằm trong kết quả (với RNG tốt).
// Bẫy: JS `state * 48271` < 2⁴⁷ nên chính xác; LCG 1103515245 thì không. Java: `long`. Thứ tự: sinh số NGAY cả khi j sau đó ≥ k (mỗi i ≥ k đúng một lần gọi RNG).
export function reservoirSample(stream: number[], k: number, seed: number): number[] {
  const res = stream.slice(0, k);
  let state = seed;
  for (let i = k; i < stream.length; i++) {
    state = (state * 48271) % 2147483647;
    const j = state % (i + 1);
    if (j < k) res[j] = stream[i];
  }
  return res;
}

// ─── ex07 · k phần tử lớn nhất bằng quickselect ───
// Ý tưởng: selectInPlace với chỉ số n − k: sau đó a[n−k..] chứa k phần tử lớn nhất (không cần sắp thứ tự).
// Độ phức tạp: O(n) kỳ vọng · O(n) space. Sort + cắt: O(n log n); heap kích thước k: O(n log k) (xấu khi k ~ n/2).
export function topKQuickselect(nums: number[], k: number): number[] {
  const a = Int32Array.from(nums);
  const n = a.length;
  selectInPlace(a, n - k);
  return Array.from(a.subarray(n - k));
}

// ─── ex08 · 🔴 Xếp playlist không hai bài cùng nghệ sĩ liền nhau ───
// Ý tưởng: đếm tần suất; nếu tần suất lớn nhất > ⌈n/2⌉ ⇒ ""; ngược lại xếp lần lượt từng ký tự (theo tần suất giảm dần) vào các vị trí 0, 2, 4, … rồi 1, 3, 5, …
// Độ phức tạp: O(n + 26 log 26) time · O(n) space. Cách khác: heap lấy hai ký tự phổ biến nhất mỗi bước (O(n log 26)), dùng Heap của I04.
// Bẫy: điều kiện ⌈n/2⌉ (n lẻ cho phép tần suất (n+1)/2); điền theo thứ tự tần suất giảm dần — nếu ký tự phổ biến nhất không đi đầu, xung đột xảy ra.
export function reorganizeString(s: string): string {
  const n = s.length;
  const cnt = new Array<number>(26).fill(0);
  for (let i = 0; i < n; i++) cnt[s.charCodeAt(i) - 97]++;
  const order = cnt.map((c, i) => i).filter((i) => cnt[i] > 0).sort((a, b) => cnt[b] - cnt[a]);
  if (order.length && cnt[order[0]] > (n + 1) >> 1) return '';
  const out = new Array<string>(n);
  let pos = 0;
  for (const ch of order) {
    const c = String.fromCharCode(97 + ch);
    for (let t = 0; t < cnt[ch]; t++) {
      out[pos] = c;
      pos += 2;
      if (pos >= n) pos = 1;
    }
  }
  return out.join('');
}
