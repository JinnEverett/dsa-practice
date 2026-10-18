// D02 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · LRUCache ───
// Ý tưởng: hash map key → node của danh sách liên kết đôi (DLL); DLL giữ thứ tự dùng: đầu = mới nhất, cuối = cũ nhất.
//   get: tra map, đưa node lên đầu. put: có key → cập nhật + đưa lên đầu; chưa có → thêm ở đầu, vượt sức chứa thì bỏ node cuối (và xóa khỏi map).
//   Hai node canh `head`/`tail` (sentinel) làm mọi thao tác chèn/xóa không phải xét biên.
// Bất biến: map.size === số node thật trong DLL ≤ capacity; mỗi key có đúng một node; node `head.next` là mới dùng nhất.
// Độ phức tạp: get/put O(1) · space O(capacity).
// Vì sao best practice: không phụ thuộc hành vi nội bộ của Map; node trỏ lẫn nhau để xóa khỏi giữa danh sách O(1).
// Bẫy: capacity = 0 (put phải là no-op, không evict từ cache rỗng); quên xóa key bị evict khỏi map; put key đã có mà không đưa lên đầu.
// Cách khác: `Map` của JS nhớ thứ tự chèn → `delete` rồi `set` lại để đưa lên cuối, evict `map.keys().next().value`. Ngắn hơn nhiều,
//   đủ dùng thực tế (đo: ~2.5× chậm hơn DLL ở 10⁶ thao tác, capacity 5 000), nhưng ẩn mất cấu trúc (phỏng vấn thường yêu cầu tự cài DLL).
// Python/Java: Python `OrderedDict.move_to_end` / `popitem(last=False)`; Java `LinkedHashMap(capacity, 0.75f, true)` + override `removeEldestEntry`.
interface LNode {
  key: number;
  val: number;
  prev: LNode;
  next: LNode;
}
const newNode = (key: number, val: number): LNode => {
  const n = { key, val } as LNode;
  n.prev = n.next = n;
  return n;
};
export class LRUCache {
  private cap: number;
  private map = new Map<number, LNode>();
  private head = newNode(0, 0); // sentinel đầu: head.next = mới nhất
  private tail = newNode(0, 0); // sentinel cuối: tail.prev = cũ nhất

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
    const n = this.map.get(key);
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
    const fresh = newNode(key, value);
    this.map.set(key, fresh);
    this.pushFront(fresh);
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
// Ý tưởng: ba bảng. `vals`: key → giá trị; `freq`: key → số lần dùng; `buckets`: tần suất f → Set các key có tần suất f, theo thứ tự chèn
//   (Set của JS giữ thứ tự chèn ⇒ phần tử đầu tiên = dùng lâu nhất trong nhóm tần suất đó). Biến `minFreq` = tần suất nhỏ nhất đang có.
//   "Dùng" một key (get, hoặc put key đã có): chuyển key từ bucket f sang bucket f+1; nếu bucket f rỗng và f === minFreq thì minFreq++.
//   Evict: lấy key đầu tiên của bucket minFreq. Key mới có tần suất 1 ⇒ đặt minFreq = 1.
// Bất biến: mỗi key đang có nằm đúng ở bucket freq[key]; minFreq trỏ tới bucket không rỗng khi cache không rỗng; hòa tần suất → LRU.
// Độ phức tạp: get/put O(1) · space O(capacity).
// Bẫy: put key đã có phải tính là một lần dùng; evict TRƯỚC khi thêm key mới (không thì có thể evict chính key vừa thêm, vì tần suất 1);
//   quên cập nhật minFreq khi bucket nhỏ nhất rỗng; capacity = 0.
// Cách khác: mỗi bucket là DLL tự cài (giống LRU) thay vì Set — nhanh hơn một chút, nhiều code hơn.
// Python/Java: `defaultdict(OrderedDict)` / `Map<Integer, LinkedHashSet<Integer>>`; cùng ý tưởng.
export class LFUCache {
  private cap: number;
  private vals = new Map<number, number>();
  private freq = new Map<number, number>();
  private buckets = new Map<number, Set<number>>();
  private minFreq = 0;

  constructor(capacity: number) {
    this.cap = capacity;
  }
  get(key: number): number {
    if (!this.vals.has(key)) return -1;
    this.touch(key);
    return this.vals.get(key)!;
  }
  put(key: number, value: number): void {
    if (this.cap === 0) return;
    if (this.vals.has(key)) {
      this.vals.set(key, value);
      this.touch(key);
      return;
    }
    if (this.vals.size === this.cap) {
      const bucket = this.buckets.get(this.minFreq)!;
      const victim = bucket.values().next().value as number;
      bucket.delete(victim);
      if (bucket.size === 0) this.buckets.delete(this.minFreq);
      this.vals.delete(victim);
      this.freq.delete(victim);
    }
    this.vals.set(key, value);
    this.freq.set(key, 1);
    this.bucket(1).add(key);
    this.minFreq = 1;
  }
  private bucket(f: number): Set<number> {
    let b = this.buckets.get(f);
    if (!b) this.buckets.set(f, (b = new Set()));
    return b;
  }
  private touch(key: number): void {
    const f = this.freq.get(key)!;
    const b = this.buckets.get(f)!;
    b.delete(key);
    if (b.size === 0) {
      this.buckets.delete(f);
      if (this.minFreq === f) this.minFreq = f + 1;
    }
    this.freq.set(key, f + 1);
    this.bucket(f + 1).add(key);
  }
}
