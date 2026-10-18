// D02 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · LRUCache (DLL tự cài) ───
// Ý tưởng: Map key → node; node nằm trong danh sách liên kết đôi theo thứ tự dùng: gần đây nhất ở sát head, lâu nhất ở sát tail.
//   Dùng 2 node canh (sentinel) head/tail để chèn/xóa không cần xét biên.
// Bất biến: |map| = số node thật trong list ≤ capacity; list đi từ head.next (mới nhất) đến tail.prev (cũ nhất) đúng thứ tự dùng.
// Độ phức tạp: get/put O(1) · space O(capacity).
// Vì sao best practice: không phụ thuộc thứ tự chèn của Map (JS có, Java/Python khác) → chuyển sang ngôn ngữ nào cũng được; xóa tham chiếu khi evict.
// Bẫy: capacity = 0 (put phải không làm gì, nếu không evict list rỗng → lỗi); put key đã có phải cập nhật value VÀ đẩy lên đầu;
//   quên xóa key khỏi map khi evict; evict TRƯỚC khi chèn node mới thì cap=0 vẫn lỗi → chặn cap=0 sớm.
// Cách khác: dùng chính `Map` của JS (giữ thứ tự chèn): delete + set để "chạm", `map.keys().next().value` là cũ nhất — ngắn hơn nhưng giấu cấu trúc.
// Python/Java: Python `OrderedDict.move_to_end` / `popitem(last=False)`; Java `LinkedHashMap(cap, 0.75f, true)` + override `removeEldestEntry`.
class LNode {
  key = 0;
  val = 0;
  prev: LNode = this;
  next: LNode = this;
}
export class LRUCache {
  private map = new Map<number, LNode>();
  private head = new LNode(); // sentinel: head.next = mới nhất
  private tail = new LNode(); // sentinel: tail.prev = cũ nhất
  private cap: number;
  constructor(capacity: number) {
    this.cap = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  get(key: number): number {
    const n = this.map.get(key);
    if (!n) return -1;
    this.unlink(n);
    this.pushFront(n);
    return n.val;
  }
  put(key: number, value: number): void {
    if (this.cap === 0) return;
    let n = this.map.get(key);
    if (n) {
      n.val = value;
      this.unlink(n);
      this.pushFront(n);
      return;
    }
    if (this.map.size === this.cap) {
      const old = this.tail.prev;
      this.unlink(old);
      this.map.delete(old.key);
    }
    n = new LNode();
    n.key = key;
    n.val = value;
    this.map.set(key, n);
    this.pushFront(n);
  }
  private unlink(n: LNode): void {
    n.prev.next = n.next;
    n.next.prev = n.prev;
  }
  private pushFront(n: LNode): void {
    n.next = this.head.next;
    n.prev = this.head;
    this.head.next.prev = n;
    this.head.next = n;
  }
}

// ─── ex02 · LFUCache ───
// Ý tưởng: vals: key → {value, freq}; buckets: freq → Set<key> (Set của JS giữ thứ tự chèn → phần tử đầu = dùng cũ nhất trong bucket);
//   minFreq = tần suất nhỏ nhất đang có. "Chạm" key: chuyển key từ bucket f sang bucket f+1; nếu bucket f rỗng và f = minFreq thì minFreq++.
//   Evict: lấy phần tử đầu của bucket[minFreq]. Chèn key mới: freq = 1, minFreq = 1 (đặt SAU khi evict).
// Bất biến: mỗi key đúng một bucket (bucket[freq(key)]); không có bucket rỗng được tham chiếu bởi minFreq khi cache không rỗng;
//   trong bucket, thứ tự Set = thứ tự chạm gần nhất tăng dần (tie → LRU).
// Độ phức tạp: get/put O(1) · space O(capacity).
// Bẫy: capacity = 0; put key đã có cũng tính là một lần dùng (tăng freq); minFreq không được tăng khi bucket cũ vẫn còn phần tử;
//   evict xong mới đặt minFreq = 1 (đặt trước rồi evict sẽ sai); quên xóa bucket rỗng → rò bộ nhớ.
// Cách khác: freq-list là DLL của DLL (LFU gốc của Shah et al.) — đúng O(1) không dựa vào thứ tự của Set; Java `LinkedHashSet` làm đúng việc của Set ở đây.
// Python/Java: Python `OrderedDict` per freq (`popitem(last=False)`); Java `LinkedHashSet<Integer>` per freq, `iterator().next()` rồi `remove`.
export class LFUCache {
  private vals = new Map<number, { value: number; freq: number }>();
  private buckets = new Map<number, Set<number>>();
  private minFreq = 0;
  private cap: number;
  constructor(capacity: number) {
    this.cap = capacity;
  }
  get(key: number): number {
    const e = this.vals.get(key);
    if (!e) return -1;
    this.touch(key, e);
    return e.value;
  }
  put(key: number, value: number): void {
    if (this.cap === 0) return;
    const e = this.vals.get(key);
    if (e) {
      e.value = value;
      this.touch(key, e);
      return;
    }
    if (this.vals.size === this.cap) {
      const set = this.buckets.get(this.minFreq)!;
      const victim: number = set.values().next().value!;
      set.delete(victim);
      if (set.size === 0) this.buckets.delete(this.minFreq);
      this.vals.delete(victim);
    }
    this.vals.set(key, { value, freq: 1 });
    this.add(1, key);
    this.minFreq = 1;
  }
  private touch(key: number, e: { value: number; freq: number }): void {
    const set = this.buckets.get(e.freq)!;
    set.delete(key);
    if (set.size === 0) {
      this.buckets.delete(e.freq);
      if (this.minFreq === e.freq) this.minFreq++;
    }
    e.freq++;
    this.add(e.freq, key);
  }
  private add(freq: number, key: number): void {
    let s = this.buckets.get(freq);
    if (!s) this.buckets.set(freq, (s = new Set()));
    s.add(key);
  }
}
