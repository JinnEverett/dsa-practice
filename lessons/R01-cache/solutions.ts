// R01 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── ex01 · LRU cache ───
// Ý tưởng: JS `Map` nhớ thứ tự chèn → "đưa lên đầu" = delete rồi set lại; phần tử cũ nhất là `keys().next()`.
// Độ phức tạp: O(1) mỗi thao tác · O(capacity) space.
// Vì sao best practice (trong TS): ngắn, ít chỗ sai. Ở ex05 bạn tự cài hash map + doubly linked list để hiểu cái Map đang làm hộ.
// Bẫy: quên refresh khi `put` key đã có; evict TRƯỚC khi chèn key mới nhưng chỉ khi key mới; `get` miss không được đụng thứ tự.
// Cách khác: DLL + Map (ex05) — cùng Big-O, không phụ thuộc đặc tính ngôn ngữ.
// Đo thật (capacity 2·10⁴, 50% put / 50% get, máy soạn): Map-LRU 33 ms ở 10⁵ thao tác, 884 ms ở 10⁶, 10,4 s ở 10⁷;
// DLL 25 ms / 164 ms / 2,2 s. Map "O(1)" nhưng V8 phải bỏ qua các ô đã xóa ở đầu bảng khi lấy `keys().next()`,
// nên tăng nhanh hơn tuyến tính — hằng số ẩn trong Big-O (xem P03).
// Python: `OrderedDict` (`move_to_end`, `popitem(last=False)`). Java: `LinkedHashMap(cap, 0.75f, true)` + override `removeEldestEntry`.
export class LRUCache {
  private cap: number;
  private m = new Map<number, number>();
  constructor(capacity: number) {
    this.cap = capacity;
  }
  get(key: number): number {
    if (!this.m.has(key)) return -1;
    const v = this.m.get(key)!;
    this.m.delete(key);
    this.m.set(key, v);
    return v;
  }
  put(key: number, value: number): void {
    if (this.m.has(key)) this.m.delete(key);
    else if (this.m.size >= this.cap) this.m.delete(this.m.keys().next().value!);
    this.m.set(key, value);
  }
}

// ─── ex02 · TTL cache ───
// Ý tưởng: Map giữ thứ tự LRU như ex01 + min-heap theo `expireAt` để dọn các entry hết hạn ở đầu MỖI thao tác
// (lazy theo thời gian gọi, nhưng không bao giờ quét toàn bộ). Heap có thể chứa bản ghi cũ (key đã bị put lại / bị evict):
// khi pop, so `ver` với entry hiện tại — khác thì bỏ qua ("lazy deletion").
// Độ phức tạp: O(log n) amortized mỗi thao tác · O(n) space (heap có thể giữ bản ghi cũ đến lúc hết hạn).
// Vì sao best practice: quét toàn bộ để tìm entry hết hạn là O(n)/thao tác; chỉ kiểm tra khi `get` thì entry hết hạn
// vẫn chiếm chỗ và đẩy entry còn sống ra khỏi cache sai.
// Bẫy: hết hạn khi `now >= expireAt` (không phải `>`); `capacity` chỉ tính entry còn sống; put lại key phải đổi cả ttl.
// Python: `heapq` với tuple `(expireAt, ver, key)`. Java: `PriorityQueue<long[]>` + `LinkedHashMap`.
export class TTLCache {
  private cap: number;
  private m = new Map<number, { v: number; exp: number; ver: number }>();
  private heap = new Heap<{ exp: number; key: number; ver: number }>((a, b) => a.exp < b.exp);
  private ver = 0;
  constructor(capacity: number) {
    this.cap = capacity;
  }
  private purge(now: number): void {
    for (let top = this.heap.peek(); top && top.exp <= now; top = this.heap.peek()) {
      this.heap.pop();
      if (this.m.get(top.key)?.ver === top.ver) this.m.delete(top.key);
    }
  }
  put(key: number, value: number, ttl: number, now: number): void {
    this.purge(now);
    if (this.m.has(key)) this.m.delete(key);
    else if (this.m.size >= this.cap) this.m.delete(this.m.keys().next().value!);
    const exp = now + ttl;
    const ver = ++this.ver;
    this.m.set(key, { v: value, exp, ver });
    this.heap.push({ exp, key, ver });
  }
  get(key: number, now: number): number {
    this.purge(now);
    const e = this.m.get(key);
    if (!e) return -1;
    this.m.delete(key);
    this.m.set(key, e);
    return e.v;
  }
}

// ─── ex03 · So sánh LRU và FIFO ───
// Ý tưởng: mô phỏng hai chính sách trên cùng chuỗi request. LRU: hit thì đưa lên đầu; FIFO: hit KHÔNG đổi thứ tự.
// Độ phức tạp: O(n) time · O(capacity) space.
// Bẫy: FIFO cũng phải đẩy phần tử vào theo thứ tự đến và chỉ evict khi đầy; chia cho tổng request, không phải số miss.
// Gợi ý quan sát (Bélády): với FIFO, tăng capacity có thể làm hit ratio GIẢM — thử chuỗi 1,2,3,4,1,2,5,1,2,3,4,5.
export function hitRatios(capacity: number, requests: number[]): number[] {
  const lru = new Map<number, true>();
  const fifo = new Set<number>();
  let hl = 0;
  let hf = 0;
  for (const r of requests) {
    if (lru.has(r)) {
      hl++;
      lru.delete(r);
    } else if (lru.size >= capacity) lru.delete(lru.keys().next().value!);
    lru.set(r, true);

    if (fifo.has(r)) hf++;
    else {
      if (fifo.size >= capacity) fifo.delete(fifo.values().next().value!); // Set cũng giữ thứ tự chèn
      fifo.add(r);
    }
  }
  return [hl / requests.length, hf / requests.length];
}

// ─── ex04 · Cache giá sản phẩm có invalidate ───
// Ý tưởng: LRU (Map) + chỉ mục phụ `category → Set<productId>` để `invalidateCategory` không phải quét cả cache.
// Mọi đường xóa (evict, invalidate, put đổi category) đều phải cập nhật chỉ mục phụ — đây là chỗ hay sai.
// Độ phức tạp: put/get/invalidateProduct O(1) · invalidateCategory O(số entry bị xóa) · O(n) space.
// Bẫy: evict mà quên gỡ khỏi chỉ mục category → `invalidateCategory` trả số đếm sai / rò rỉ bộ nhớ.
// Python: `dict` (3.7+ giữ thứ tự) + `defaultdict(set)`. Java: `LinkedHashMap` + `HashMap<Integer, Set<Integer>>`.
export class PriceCache {
  private cap: number;
  private m = new Map<number, { price: number; cat: number }>();
  private byCat = new Map<number, Set<number>>();
  constructor(capacity: number) {
    this.cap = capacity;
  }
  private drop(id: number): void {
    const e = this.m.get(id);
    if (!e) return;
    this.m.delete(id);
    const s = this.byCat.get(e.cat)!;
    s.delete(id);
    if (s.size === 0) this.byCat.delete(e.cat);
  }
  put(productId: number, categoryId: number, price: number): void {
    if (this.m.has(productId)) this.drop(productId);
    else if (this.m.size >= this.cap) this.drop(this.m.keys().next().value!);
    this.m.set(productId, { price, cat: categoryId });
    let s = this.byCat.get(categoryId);
    if (!s) this.byCat.set(categoryId, (s = new Set()));
    s.add(productId);
  }
  get(productId: number): number {
    const e = this.m.get(productId);
    if (!e) return -1;
    this.m.delete(productId);
    this.m.set(productId, e);
    return e.price;
  }
  invalidateProduct(productId: number): void {
    this.drop(productId);
  }
  invalidateCategory(categoryId: number): number {
    const s = this.byCat.get(categoryId);
    if (!s) return 0;
    const n = s.size;
    for (const id of [...s]) this.drop(id);
    return n;
  }
  size(): number {
    return this.m.size;
  }
}

// ─── ex05 · LRU bằng hash map + doubly linked list ───
// Ý tưởng: danh sách liên kết đôi có sentinel head/tail (head.next = MRU, tail.prev = LRU) + Map key → node.
// Mọi thao tác: tìm node bằng Map O(1), cắt node khỏi vị trí cũ và chèn lên đầu O(1) nhờ có `prev`.
// Độ phức tạp: O(1) mỗi thao tác · O(capacity) space.
// Vì sao best practice (khi không có/không tin được Map có thứ tự): đúng ở mọi ngôn ngữ, là thứ `LinkedHashMap`, `OrderedDict`
// và Redis đang làm. Sentinel loại bỏ mọi `if (node === head)`.
// Bẫy: quên cập nhật `prev` của node sau khi cắt; evict phải xóa cả khỏi Map; capacity = 1.
// Python: node là class với `__slots__`; Java: `class Node { int k, v; Node prev, next; }` + `HashMap<Integer, Node>`.
class DNode {
  key = 0;
  val = 0;
  prev: DNode = this;
  next: DNode = this;
}
export class LRUCacheList {
  private cap: number;
  private map = new Map<number, DNode>();
  private head = new DNode(); // sentinel: head.next là MRU
  private tail = new DNode(); // sentinel: tail.prev là LRU
  constructor(capacity: number) {
    this.cap = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  private unlink(n: DNode): void {
    n.prev.next = n.next;
    n.next.prev = n.prev;
  }
  private pushFront(n: DNode): void {
    n.next = this.head.next;
    n.prev = this.head;
    this.head.next.prev = n;
    this.head.next = n;
  }
  get(key: number): number {
    const n = this.map.get(key);
    if (!n) return -1;
    this.unlink(n);
    this.pushFront(n);
    return n.val;
  }
  put(key: number, value: number): void {
    let n = this.map.get(key);
    if (n) {
      n.val = value;
      this.unlink(n);
    } else {
      if (this.map.size >= this.cap) {
        const lru = this.tail.prev;
        this.unlink(lru);
        this.map.delete(lru.key);
      }
      n = new DNode();
      n.key = key;
      n.val = value;
      this.map.set(key, n);
    }
    this.pushFront(n);
  }
  keys(): number[] {
    const out: number[] = [];
    for (let n = this.head.next; n !== this.tail; n = n.next) out.push(n.key);
    return out;
  }
}
