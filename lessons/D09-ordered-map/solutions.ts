// D09 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── Cấu trúc nền: IndexedSkipList<K, V> (skip list có "span", như Redis ZSET) ───
// Ý tưởng: danh sách liên kết có thứ tự, thêm các tầng "đường cao tốc": nút ở tầng i cũng nằm ở tầng i−1 và mỗi nút được nâng thêm một tầng
//   với xác suất 1/2 (ngẫu nhiên, không cần cân bằng như cây). Tìm kiếm đi từ tầng cao xuống: trượt sang phải khi nút kế còn < key, hạ xuống tầng dưới khi không.
//   Kỳ vọng ~ 2 log₂ n bước. Mỗi liên kết lưu thêm `span` = số nút ở tầng 0 mà nó vượt qua ⇒ cộng các span trên đường đi cho ta HẠNG (rank) của key
//   và cho phép nhảy tới phần tử thứ i, tất cả O(log n).
// Bất biến: (1) tầng 0 chứa mọi nút theo thứ tự tăng của key; (2) nút có chiều cao h nằm trong h tầng đầu và liên kết tầng i của nó trỏ tới nút kế có chiều cao > i;
//   (3) span của liên kết = chênh lệch vị trí (đếm ở tầng 0) giữa hai đầu; liên kết rỗng có span = (size − vị trí nút) để công thức chèn/xóa không phải xét riêng.
// Độ phức tạp (kỳ vọng): get/set/delete/rank/at/floor/ceiling O(log n) · slice(i, j) O(log n + số phần tử) · space O(n) (trung bình 2 con trỏ/nút).
// Vì sao best practice: cài ~100 dòng, không cần xoay cây; thêm "span" biến nó thành order-statistic tree; ghi/đọc đồng thời dễ hơn cây (xem Java ConcurrentSkipListMap).
// Bẫy: quên cập nhật span ở các tầng KHÔNG chứa nút mới/nút bị xóa (mọi liên kết vượt qua vị trí đó phải ±1); sai chiều cao 0; RNG không seed làm test không tái lập;
//   so sánh khóa bằng toán tử `<` trên chuỗi/object thay vì comparator.
// Cách khác: cây đỏ-đen / AVL / treap (Java `TreeMap`), B-tree (cơ sở dữ liệu), mảng sort + binary search (chèn O(n) memmove — vẫn thắng skip list ở n nhỏ).
// Python/Java: Java có sẵn `TreeMap` / `ConcurrentSkipListMap` (không có rank); Python `sortedcontainers.SortedList` (danh sách chia khối như D06).
const MAX_LEVEL = 24;
interface SNode<K, V> {
  key: K;
  val: V;
  next: (SNode<K, V> | null)[];
  span: number[];
}

export class IndexedSkipList<K, V> {
  size = 0;
  private cmp: (a: K, b: K) => number;
  private head: SNode<K, V>;
  private level = 1;
  private seed: number;

  constructor(cmp: (a: K, b: K) => number, seed = 0x9e3779b9) {
    this.cmp = cmp;
    this.seed = seed >>> 0;
    this.head = { key: undefined as any, val: undefined as any, next: new Array(MAX_LEVEL).fill(null), span: new Array(MAX_LEVEL).fill(0) };
  }
  /** mulberry32: tất định để test tái lập. */
  private rand(): number {
    this.seed = (this.seed + 0x6d2b79f5) >>> 0;
    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  private randomLevel(): number {
    let h = 1;
    while (h < MAX_LEVEL && this.rand() < 0.5) h++;
    return h;
  }
  /** Nút cuối cùng có key < `key` ở mỗi tầng (update[]), cùng vị trí (rank[]) của chúng; head có vị trí 0. */
  private findPreds(key: K, update: SNode<K, V>[], rank: number[]): void {
    let x = this.head;
    let pos = 0;
    for (let i = this.level - 1; i >= 0; i--) {
      for (let nx = x.next[i]; nx && this.cmp(nx.key, key) < 0; nx = x.next[i]) {
        pos += x.span[i];
        x = nx;
      }
      update[i] = x;
      rank[i] = pos;
    }
  }
  private nodeOf(key: K): SNode<K, V> | null {
    let x = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      for (let nx = x.next[i]; nx && this.cmp(nx.key, key) < 0; nx = x.next[i]) x = nx;
    }
    const c = x.next[0];
    return c && this.cmp(c.key, key) === 0 ? c : null;
  }
  get(key: K): V | undefined {
    return this.nodeOf(key)?.val;
  }
  /** Đặt giá trị; trả true nếu key mới. */
  set(key: K, val: V): boolean {
    const update = new Array<SNode<K, V>>(MAX_LEVEL);
    const rank = new Array<number>(MAX_LEVEL).fill(0);
    this.findPreds(key, update, rank);
    const c = update[0].next[0];
    if (c && this.cmp(c.key, key) === 0) {
      c.val = val;
      return false;
    }
    const h = this.randomLevel();
    if (h > this.level) {
      for (let i = this.level; i < h; i++) {
        update[i] = this.head;
        rank[i] = 0;
        this.head.span[i] = this.size;
      }
      this.level = h;
    }
    const node: SNode<K, V> = { key, val, next: new Array(h).fill(null), span: new Array(h).fill(0) };
    for (let i = 0; i < h; i++) {
      node.next[i] = update[i].next[i];
      update[i].next[i] = node;
      node.span[i] = update[i].span[i] - (rank[0] - rank[i]);
      update[i].span[i] = rank[0] - rank[i] + 1;
    }
    for (let i = h; i < this.level; i++) update[i].span[i]++;
    this.size++;
    return true;
  }
  delete(key: K): boolean {
    const update = new Array<SNode<K, V>>(MAX_LEVEL);
    const rank = new Array<number>(MAX_LEVEL).fill(0);
    this.findPreds(key, update, rank);
    const x = update[0].next[0];
    if (!x || this.cmp(x.key, key) !== 0) return false;
    for (let i = 0; i < this.level; i++) {
      if (update[i].next[i] === x) {
        update[i].span[i] += x.span[i] - 1;
        update[i].next[i] = x.next[i];
      } else update[i].span[i]--;
    }
    while (this.level > 1 && this.head.next[this.level - 1] === null) this.level--;
    this.size--;
    return true;
  }
  /** Số khóa < key (= chỉ số 0-based của key nếu có trong tập). */
  rankLess(key: K): number {
    let x = this.head;
    let pos = 0;
    for (let i = this.level - 1; i >= 0; i--) {
      for (let nx = x.next[i]; nx && this.cmp(nx.key, key) < 0; nx = x.next[i]) {
        pos += x.span[i];
        x = nx;
      }
    }
    return pos;
  }
  /** Số khóa ≤ key. */
  rankLessEq(key: K): number {
    let x = this.head;
    let pos = 0;
    for (let i = this.level - 1; i >= 0; i--) {
      for (let nx = x.next[i]; nx && this.cmp(nx.key, key) <= 0; nx = x.next[i]) {
        pos += x.span[i];
        x = nx;
      }
    }
    return pos;
  }
  /** Khóa lớn nhất ≤ key. */
  floorKey(key: K): K | undefined {
    let x = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      for (let nx = x.next[i]; nx && this.cmp(nx.key, key) <= 0; nx = x.next[i]) x = nx;
    }
    return x === this.head ? undefined : x.key;
  }
  /** Khóa nhỏ nhất ≥ key. */
  ceilingKey(key: K): K | undefined {
    let x = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      for (let nx = x.next[i]; nx && this.cmp(nx.key, key) < 0; nx = x.next[i]) x = nx;
    }
    return x.next[0]?.key;
  }
  /** Nút ở chỉ số i (0-based) trong thứ tự tăng. */
  private nodeAt(i: number): SNode<K, V> | null {
    if (i < 0 || i >= this.size) return null;
    let x = this.head;
    let pos = 0;
    for (let lv = this.level - 1; lv >= 0; lv--) {
      while (x.next[lv] && pos + x.span[lv] <= i + 1) {
        pos += x.span[lv];
        x = x.next[lv]!;
      }
    }
    return x === this.head ? null : x;
  }
  at(i: number): K | undefined {
    return this.nodeAt(i)?.key;
  }
  /** Các khóa ở chỉ số i..j (cả hai đầu, đã cắt vào [0, size−1]). */
  slice(i: number, j: number): K[] {
    const out: K[] = [];
    i = Math.max(i, 0);
    j = Math.min(j, this.size - 1);
    for (let x = this.nodeAt(i), idx = i; x && idx <= j; x = x.next[0], idx++) out.push(x.key);
    return out;
  }
}

const numCmp = (a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0);

// ─── ex01 · OrderedMap ───
// Ý tưởng: bọc IndexedSkipList<number, number>. put = set; get = tra; remove = delete; floorKey/ceilingKey = thao tác của skip list;
//   rangeCount(lo, hi) = rankLessEq(hi) − rankLess(lo) (hai lần tìm hạng, KHÔNG duyệt các khóa ở giữa); lo > hi ⇒ 0.
// Độ phức tạp: mọi thao tác O(log n) kỳ vọng · space O(n).
// Bẫy: rangeCount bằng vòng lặp duyệt từ ceiling(lo) tới hi ⇒ O(số khóa trong khoảng) — đúng nhưng trượt Perf khi khoảng rộng; floor/ceiling trả null (không phải 0)
//   khi không có; put đè khóa cũ không được tăng size (và rank sai); Java `Integer` so sánh bằng `==` với giá trị > 127.
// So với mảng sort + binary search: tìm O(log n) như nhau nhưng chèn/xóa O(n) (memmove). Nhanh hơn ở n nhỏ nhờ hằng số, thua ở n lớn — xem bench trong README.
export class OrderedMap {
  private sl = new IndexedSkipList<number, number>(numCmp);

  put(key: number, value: number): void {
    this.sl.set(key, value);
  }
  get(key: number): number | null {
    return this.sl.get(key) ?? null;
  }
  remove(key: number): boolean {
    return this.sl.delete(key);
  }
  floorKey(key: number): number | null {
    return this.sl.floorKey(key) ?? null;
  }
  ceilingKey(key: number): number | null {
    return this.sl.ceilingKey(key) ?? null;
  }
  rangeCount(lo: number, hi: number): number {
    if (lo > hi) return 0;
    return this.sl.rankLessEq(hi) - this.sl.rankLess(lo);
  }
}

// ─── ex02 · MyCalendar (đặt phòng họp không trùng giờ) ───
// Ý tưởng: lưu các lần đặt đã chấp nhận trong OrderedMap (key = giờ bắt đầu, value = giờ kết thúc, nửa mở [start, end)). Các lần đặt không giao nhau nên
//   sắp theo start cũng sắp theo end. Đặt [s, e) hợp lệ ⇔ (1) lần đặt có start lớn nhất ≤ s (floor) kết thúc ≤ s, và (2) lần đặt có start nhỏ nhất ≥ s (ceiling)
//   bắt đầu ≥ e. Chỉ cần nhìn HAI hàng xóm.
// Bất biến: các khoảng trong map đôi một không giao nhau; mỗi key duy nhất.
// Độ phức tạp: book O(log n) · space O(n). Bản quét mọi khoảng O(n) mỗi lần.
// Bẫy: khoảng nửa mở: [10,20) và [20,30) KHÔNG giao nhau; chỉ kiểm tra hàng xóm phía trước mà quên phía sau (hoặc ngược lại); trùng start thì floor là chính nó ⇒ end > s ⇒ từ chối.
// Cách khác: mảng sort + binary search (chèn O(n)); cây khoảng (interval tree) khi cho phép chồng lấp và cần đếm độ chồng.
export class MyCalendar {
  private map = new IndexedSkipList<number, number>(numCmp);

  book(start: number, end: number): boolean {
    const prev = this.map.floorKey(start);
    if (prev !== undefined && this.map.get(prev)! > start) return false;
    const next = this.map.ceilingKey(start);
    if (next !== undefined && next < end) return false;
    this.map.set(start, end);
    return true;
  }
}
