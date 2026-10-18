// CAP · Đáp án best practice (mini-Redis). Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';
import { IndexedSkipList } from '../D09-ordered-map/solutions.ts';

// ─── Thành phần 1: Deque vòng (cho list) ───
// Ý tưởng: ring buffer dung lượng lũy thừa 2, `head` là chỉ số phần tử đầu; truy cập `get(i)` O(1) nên lrange(start, stop) tốn O(k) mà không phải duyệt từ đầu.
// Độ phức tạp: pushFront/pushBack/popFront/popBack O(1) amortized (nhân đôi khi đầy) · get O(1).
// Bẫy: dùng mảng + `unshift`/`shift` (O(n)); quên nhân đôi theo THỨ TỰ (phần tử đầu phải về chỉ số 0 sau khi cấp lại).
class Deque<T> {
  private buf: (T | undefined)[] = new Array(8);
  private head = 0;
  size = 0;
  private grow(): void {
    const nb = new Array<T | undefined>(this.buf.length * 2);
    for (let i = 0; i < this.size; i++) nb[i] = this.buf[(this.head + i) & (this.buf.length - 1)];
    this.buf = nb;
    this.head = 0;
  }
  pushBack(x: T): void {
    if (this.size === this.buf.length) this.grow();
    this.buf[(this.head + this.size++) & (this.buf.length - 1)] = x;
  }
  pushFront(x: T): void {
    if (this.size === this.buf.length) this.grow();
    this.head = (this.head - 1) & (this.buf.length - 1);
    this.buf[this.head] = x;
    this.size++;
  }
  popBack(): T {
    const i = (this.head + --this.size) & (this.buf.length - 1);
    const x = this.buf[i] as T;
    this.buf[i] = undefined; // thả tham chiếu
    return x;
  }
  popFront(): T {
    const x = this.buf[this.head] as T;
    this.buf[this.head] = undefined;
    this.head = (this.head + 1) & (this.buf.length - 1);
    this.size--;
    return x;
  }
  get(i: number): T {
    return this.buf[(this.head + i) & (this.buf.length - 1)] as T;
  }
}

// ─── Thành phần 2: sorted set = skip list (thứ tự) + hash map (tra điểm theo member) ───
// Ý tưởng: giống Redis ZSET. Skip list có span (D09) khóa (score, member) cho zrange/zrank O(log n); Map member → score cho zadd/zrem/zscore O(1) + biết khóa cũ để xóa khỏi skip list.
// Bất biến: Map và skip list luôn có CÙNG tập member; mỗi member đúng một khóa (score hiện hành) trong skip list.
// Độ phức tạp: zadd/zrem/zrank O(log n) · zscore O(1) · zrange O(log n + k).
interface ZKey {
  score: number;
  member: string;
}
const zcmp = (a: ZKey, b: ZKey): number => (a.score !== b.score ? (a.score < b.score ? -1 : 1) : a.member < b.member ? -1 : a.member > b.member ? 1 : 0);
class ZSet {
  sl = new IndexedSkipList<ZKey, null>(zcmp);
  scores = new Map<string, number>();
}

/** Chuẩn hóa chỉ số kiểu Redis (âm = từ cuối, hai đầu đóng, cắt vào biên); null nếu rỗng. */
const normRange = (start: number, stop: number, len: number): [number, number] | null => {
  if (start < 0) start = Math.max(0, start + len);
  if (stop < 0) stop += len;
  if (stop >= len) stop = len - 1;
  return start > stop || start >= len ? null : [start, stop];
};

// ─── Thành phần 3: Keyspace = bảng khóa + LRU (DLL) + hết hạn (heap xóa lười) + giới hạn số khóa ───
// Ý tưởng: `map: key → Entry`; mọi Entry nằm trong một DLL theo thứ tự dùng (đầu = mới nhất) → evict O(1) khi đủ `maxKeys`.
//   Hết hạn: min-heap (expireAt, key, ver). `ver` của Entry tăng mỗi lần đặt/xóa TTL; sự kiện trong heap có ver lệch là xác chết (xóa lười, như D08).
//   `setTime(now)` XÓA CHỦ ĐỘNG mọi key hết hạn ngay (không chờ truy cập) ⇒ số key sống = map.size luôn đúng, việc evict không bao giờ bỏ key sống trong khi còn key hết hạn.
// Bất biến: (1) map.size ≤ maxKeys; (2) mọi Entry trong map đều SỐNG (expireAt > now); (3) DLL gồm đúng các Entry trong map, thứ tự dùng gần nhất;
//   (4) mỗi Entry có TTL có đúng một sự kiện hiệu lực trong heap; (5) heap.size ≤ 2·ttlCount + 16 (dựng lại khi vượt).
// Độ phức tạp: lookup/create/remove O(1) · setExpire O(log n) · setTime amortized O(log n) mỗi key hết hạn.
const NEVER = Infinity;
interface Entry {
  key: string;
  kind: number; // 0 string · 1 list · 2 zset
  str: string;
  list: Deque<string> | null;
  z: ZSet | null;
  expireAt: number;
  ver: number;
  prev: Entry;
  next: Entry;
}
interface ExpEv {
  at: number;
  key: string;
  ver: number;
}
const newEntry = (key: string, kind: number): Entry => {
  const e = { key, kind, str: '', list: null, z: null, expireAt: NEVER, ver: 0 } as unknown as Entry;
  e.prev = e.next = e;
  return e;
};

class Keyspace {
  now = 0;
  private maxKeys: number;
  private map = new Map<string, Entry>();
  private head = newEntry('', 0); // head.next = mới dùng nhất
  private tail = newEntry('', 0); // tail.prev = cũ nhất
  private heap = new Heap<ExpEv>((a, b) => a.at < b.at);
  private ttlCount = 0;
  private nextVer = 0;

  constructor(maxKeys: number) {
    this.maxKeys = maxKeys;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  get size(): number {
    return this.map.size;
  }
  setTime(now: number): void {
    this.now = now;
    for (let top = this.heap.peek(); top && top.at <= now; top = this.heap.peek()) {
      this.heap.pop();
      const e = this.map.get(top.key);
      if (e && e.ver === top.ver) this.remove(e);
    }
  }
  /** Entry sống ứng với key (không đụng LRU). */
  peek(key: string): Entry | undefined {
    return this.map.get(key);
  }
  /** Entry sống ứng với key, đồng thời đánh dấu vừa dùng. */
  lookup(key: string): Entry | undefined {
    const e = this.map.get(key);
    if (e) {
      this.unlink(e);
      this.pushFront(e);
    }
    return e;
  }
  /** Tạo Entry mới (key chưa tồn tại); đủ chỗ thì evict key cũ nhất. */
  create(key: string, kind: number): Entry {
    if (this.map.size >= this.maxKeys) this.remove(this.tail.prev);
    const e = newEntry(key, kind);
    this.map.set(key, e);
    this.pushFront(e);
    return e;
  }
  remove(e: Entry): void {
    this.unlink(e);
    this.map.delete(e.key);
    if (e.expireAt !== NEVER) this.ttlCount--;
  }
  setExpire(e: Entry, at: number): void {
    if (e.expireAt === NEVER) this.ttlCount++;
    e.expireAt = at;
    e.ver = ++this.nextVer;
    this.heap.push({ at, key: e.key, ver: e.ver });
    if (this.heap.size > 2 * this.ttlCount + 16) {
      const live: ExpEv[] = [];
      for (const x of this.map.values()) if (x.expireAt !== NEVER) live.push({ at: x.expireAt, key: x.key, ver: x.ver });
      this.heap = new Heap<ExpEv>((a, b) => a.at < b.at, live);
    }
  }
  clearExpire(e: Entry): void {
    if (e.expireAt !== NEVER) this.ttlCount--;
    e.expireAt = NEVER;
    e.ver = ++this.nextVer; // vô hiệu hóa sự kiện cũ trong heap
  }
  private unlink(e: Entry): void {
    e.prev.next = e.next;
    e.next.prev = e.prev;
  }
  private pushFront(e: Entry): void {
    e.next = this.head.next;
    e.prev = this.head;
    this.head.next.prev = e;
    this.head.next = e;
  }
}

// ─── ex01 · MiniKV (chuỗi + TTL + LRU) ───
// Ý tưởng: lớp mỏng trên Keyspace. set: key có thì ghi đè (giữ chỗ) + xóa TTL, chưa có thì create (có thể evict); get: lookup rồi trả `str` nếu kind = 0.
//   expire(ttl ≤ 0) xóa luôn key; ttl() không đụng LRU.
// Độ phức tạp: set/get/delete/ttl/size O(1) · expire O(log n) · setTime amortized O(log n)/key hết hạn.
// Bẫy: key hết hạn phải biến mất NGAY khi setTime vượt hạn (kể cả khi chưa ai truy cập) vì nó ảnh hưởng `size` và việc evict; `set` quên xóa TTL cũ;
//   `get` thất bại (key lạ) mà vẫn đẩy lên LRU; đếm key hết hạn vào maxKeys; quên rằng `ttl` không được đổi thứ tự LRU.
// Cách khác: hết hạn lười (chỉ kiểm tra khi truy cập) + lấy mẫu ngẫu nhiên định kỳ (Redis thật làm cả hai: lazy + active expiry theo mẫu) — hợp khi hàng chục triệu key.
// Python/Java: `heapq` + dict + OrderedDict; Java `PriorityQueue` + `LinkedHashMap(accessOrder=true)`; thời gian ms kiểu `long`.
export class MiniKV {
  protected ks: Keyspace;

  constructor(maxKeys: number) {
    this.ks = new Keyspace(maxKeys);
  }
  setTime(now: number): void {
    this.ks.setTime(now);
  }
  set(key: string, value: string): void {
    let e = this.ks.lookup(key);
    if (!e) e = this.ks.create(key, 0);
    else {
      this.ks.clearExpire(e);
      e.kind = 0;
      e.list = null;
      e.z = null;
    }
    e.str = value;
  }
  get(key: string): string | null {
    const e = this.ks.lookup(key);
    return e && e.kind === 0 ? e.str : null;
  }
  delete(key: string): boolean {
    const e = this.ks.peek(key);
    if (!e) return false;
    this.ks.remove(e);
    return true;
  }
  expire(key: string, ttlMs: number): boolean {
    const e = this.ks.lookup(key);
    if (!e) return false;
    if (ttlMs <= 0) this.ks.remove(e);
    else this.ks.setExpire(e, this.ks.now + ttlMs);
    return true;
  }
  ttl(key: string): number {
    const e = this.ks.peek(key);
    if (!e) return -2;
    return e.expireAt === NEVER ? -1 : e.expireAt - this.ks.now;
  }
  size(): number {
    return this.ks.size;
  }
}

// ─── ex02 · MiniRedis (thêm list + sorted set; kiểu khóa; WRONGTYPE) ───
// Ý tưởng: mỗi Entry có kiểu cố định (string/list/zset). List = Deque vòng; zset = skip list + Map. Lệnh sai kiểu KHÔNG đổi dữ liệu và trả giá trị "thất bại" của lệnh đó
//   (−1 / null / false / []) nhưng vẫn đẩy key lên LRU (mọi lệnh gặp key sống đều tính là dùng, trừ ttl/type/size). List hoặc zset rỗng thì key bị xóa
//   (giải phóng chỗ và bỏ TTL). Tạo key mới (kể cả list/zset) có thể evict key LRU.
// Độ phức tạp: lpush/rpush/lpop/rpop O(1) · lrange O(k) · zadd/zrem/zrank O(log n) · zrange O(log n + k) · zscore O(1) · space O(tổng phần tử).
// Vì sao best practice: mỗi thao tác dùng đúng cấu trúc cho nó (deque, skip list), không cấu trúc nào làm hộ việc của cấu trúc khác; quy tắc keyspace (LRU/TTL/capacity) nằm một chỗ.
// Bẫy: zadd cùng member khác score phải XÓA khóa cũ khỏi skip list trước khi chèn khóa mới (không thì member xuất hiện hai lần); zrem/lpop làm tập rỗng mà quên xóa key;
//   chỉ số âm của lrange/zrange (−1 là phần tử cuối; `stop` lớn bị cắt; start > stop ⇒ rỗng); so sánh member bằng `<` trên UTF-16 (đề giới hạn ASCII để ba ngôn ngữ cùng thứ tự).
// Cách khác: dùng `Array` + `splice` cho list (lpush O(n)); dùng mảng sort cho zset (zadd O(n)); LRU xấp xỉ bằng lấy mẫu (Redis thật) để khỏi tốn 2 con trỏ/key.
// Python/Java: Python `collections.deque` (không có truy cập giữa O(1)) hoặc list; zset cần `sortedcontainers`/tự cài; Java `ArrayDeque` (không có get(i)) hoặc `ArrayList` +
//   `TreeSet<long[]>`/`TreeMap` (không có rank O(log n)) ⇒ phải tự cài skip list có span hoặc cây có kích thước cây con.
export class MiniRedis extends MiniKV {
  private listFor(key: string, create: boolean): Deque<string> | null | undefined {
    // trả undefined nếu SAI KIỂU; null nếu không tồn tại và không tạo
    const e = this.ks.lookup(key);
    if (e) return e.kind === 1 ? e.list : undefined;
    if (!create) return null;
    const ne = this.ks.create(key, 1);
    ne.list = new Deque<string>();
    return ne.list;
  }
  private zsetFor(key: string, create: boolean): ZSet | null | undefined {
    const e = this.ks.lookup(key);
    if (e) return e.kind === 2 ? e.z : undefined;
    if (!create) return null;
    const ne = this.ks.create(key, 2);
    ne.z = new ZSet();
    return ne.z;
  }
  private dropIfEmpty(key: string, empty: boolean): void {
    if (!empty) return;
    const e = this.ks.peek(key);
    if (e) this.ks.remove(e);
  }

  type(key: string): string {
    const e = this.ks.peek(key);
    return e ? ['string', 'list', 'zset'][e.kind] : 'none';
  }
  lpush(key: string, value: string): number {
    const d = this.listFor(key, true);
    if (d === undefined) return -1;
    d!.pushFront(value);
    return d!.size;
  }
  rpush(key: string, value: string): number {
    const d = this.listFor(key, true);
    if (d === undefined) return -1;
    d!.pushBack(value);
    return d!.size;
  }
  lpop(key: string): string | null {
    const d = this.listFor(key, false);
    if (!d) return null;
    const v = d.popFront();
    this.dropIfEmpty(key, d.size === 0);
    return v;
  }
  rpop(key: string): string | null {
    const d = this.listFor(key, false);
    if (!d) return null;
    const v = d.popBack();
    this.dropIfEmpty(key, d.size === 0);
    return v;
  }
  lrange(key: string, start: number, stop: number): string[] {
    const d = this.listFor(key, false);
    if (!d) return [];
    const r = normRange(start, stop, d.size);
    const out: string[] = [];
    if (r) for (let i = r[0]; i <= r[1]; i++) out.push(d.get(i));
    return out;
  }
  zadd(key: string, score: number, member: string): number {
    const z = this.zsetFor(key, true);
    if (z === undefined) return -1;
    const old = z!.scores.get(member);
    if (old !== undefined) {
      if (old === score) return 0;
      z!.sl.delete({ score: old, member });
    }
    z!.sl.set({ score, member }, null);
    z!.scores.set(member, score);
    return old === undefined ? 1 : 0;
  }
  zrem(key: string, member: string): boolean {
    const z = this.zsetFor(key, false);
    if (!z) return false;
    const old = z.scores.get(member);
    if (old === undefined) return false;
    z.sl.delete({ score: old, member });
    z.scores.delete(member);
    this.dropIfEmpty(key, z.scores.size === 0);
    return true;
  }
  zrange(key: string, start: number, stop: number): string[] {
    const z = this.zsetFor(key, false);
    if (!z) return [];
    const r = normRange(start, stop, z.scores.size);
    return r ? z.sl.slice(r[0], r[1]).map((k) => k.member) : [];
  }
  zrank(key: string, member: string): number {
    const z = this.zsetFor(key, false);
    if (!z) return -1;
    const s = z.scores.get(member);
    return s === undefined ? -1 : z.sl.rankLess({ score: s, member });
  }
  zscore(key: string, member: string): number | null {
    const z = this.zsetFor(key, false);
    if (!z) return null;
    return z.scores.get(member) ?? null;
  }
}
