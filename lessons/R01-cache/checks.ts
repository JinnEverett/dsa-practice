import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Sinh chuỗi thao tác cho bài class: step(i) trả [op, args]. */
const opsGen = (ctor: string, ctorArgs: any[], n: number, step: (i: number) => [string, any[]]) => {
  const ops = [ctor];
  const args = [ctorArgs];
  for (let i = 0; i < n; i++) {
    const [op, a] = step(i);
    ops.push(op);
    args.push(a);
  }
  return [ops, args];
};

// ─── brute: mảng [key, value] theo thứ tự cũ → mới, tìm tuyến tính ───
class BruteLRU {
  cap: number;
  a: [number, number][] = [];
  constructor(c: number) {
    this.cap = c;
  }
  get(k: number) {
    const i = this.a.findIndex((e) => e[0] === k);
    if (i < 0) return -1;
    const [e] = this.a.splice(i, 1);
    this.a.push(e);
    return e[1];
  }
  put(k: number, v: number) {
    const i = this.a.findIndex((e) => e[0] === k);
    if (i >= 0) this.a.splice(i, 1);
    else if (this.a.length >= this.cap) this.a.shift();
    this.a.push([k, v]);
  }
  keys() {
    return this.a.map((e) => e[0]).reverse();
  }
}

class BruteTTL {
  cap: number;
  a: { k: number; v: number; exp: number }[] = [];
  constructor(c: number) {
    this.cap = c;
  }
  private alive(now: number) {
    this.a = this.a.filter((e) => now < e.exp);
  }
  put(k: number, v: number, ttl: number, now: number) {
    this.alive(now);
    const i = this.a.findIndex((e) => e.k === k);
    if (i >= 0) this.a.splice(i, 1);
    else if (this.a.length >= this.cap) this.a.shift();
    this.a.push({ k, v, exp: now + ttl });
  }
  get(k: number, now: number) {
    this.alive(now);
    const i = this.a.findIndex((e) => e.k === k);
    if (i < 0) return -1;
    const [e] = this.a.splice(i, 1);
    this.a.push(e);
    return e.v;
  }
}

class BrutePrice {
  cap: number;
  a: { id: number; cat: number; price: number }[] = [];
  constructor(c: number) {
    this.cap = c;
  }
  put(id: number, cat: number, price: number) {
    const i = this.a.findIndex((e) => e.id === id);
    if (i >= 0) this.a.splice(i, 1);
    else if (this.a.length >= this.cap) this.a.shift();
    this.a.push({ id, cat, price });
  }
  get(id: number) {
    const i = this.a.findIndex((e) => e.id === id);
    if (i < 0) return -1;
    const [e] = this.a.splice(i, 1);
    this.a.push(e);
    return e.price;
  }
  invalidateProduct(id: number) {
    this.a = this.a.filter((e) => e.id !== id);
  }
  invalidateCategory(cat: number) {
    const before = this.a.length;
    this.a = this.a.filter((e) => e.cat !== cat);
    return before - this.a.length;
  }
  size() {
    return this.a.length;
  }
}

const bruteRatios = (capacity: number, requests: number[]) => {
  let lru: number[] = [];
  let fifo: number[] = [];
  let hl = 0;
  let hf = 0;
  for (const r of requests) {
    const i = lru.indexOf(r);
    if (i >= 0) {
      hl++;
      lru.splice(i, 1);
    } else if (lru.length >= capacity) lru.shift();
    lru.push(r);
    if (fifo.includes(r)) hf++;
    else {
      if (fifo.length >= capacity) fifo.shift();
      fifo.push(r);
    }
  }
  return [hl / requests.length, hf / requests.length];
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class LRUCache {\n  LRUCache(int capacity)\n  int get(int key)\n  void put(int key, int value)\n}',
    title: 'LRU cache',
    ref: S.LRUCache,
    brute: BruteLRU,
    cases: [
      {
        args: [
          ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
          [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        ],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
      { args: [['LRUCache', 'put', 'put', 'get'], [[1], [1, 10], [2, 20], [1]]], expected: [null, null, null, -1], note: 'capacity = 1' },
      { args: [['LRUCache', 'put', 'put', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [1, 9], [1], [2]]], expected: [null, null, null, null, 9, 2], note: 'put lại key đang có: không evict, chỉ refresh' },
    ],
    gen: (n, r) => {
      const cap = Math.max(2, Math.floor(n / 5));
      const keys = Math.floor(cap * 1.5) + 1;
      return opsGen('LRUCache', [cap], Math.max(1, n), () => (r.bool(0.5) ? ['put', [r.int(0, keys), r.int(0, 1e6)]] : ['get', [r.int(0, keys)]]));
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '02': {
    sig: 'class TTLCache {\n  TTLCache(int capacity)\n  void put(int key, int value, long ttl, long now)\n  int get(int key, long now)\n}',
    title: 'Cache có TTL',
    ref: S.TTLCache,
    brute: BruteTTL,
    cases: [
      {
        args: [
          ['TTLCache', 'put', 'put', 'get', 'get', 'get', 'put', 'get'],
          [[2], [1, 10, 5, 0], [2, 20, 100, 1], [1, 4], [1, 5], [2, 6], [3, 30, 10, 7], [2, 8]],
        ],
        expected: [null, null, null, 10, -1, 20, null, 20],
        note: 'hết hạn khi now ≥ put_time + ttl',
      },
      {
        args: [['TTLCache', 'put', 'put', 'put', 'get', 'get'], [[2], [1, 1, 100, 0], [2, 2, 3, 0], [3, 3, 100, 5], [1, 6], [3, 6]]],
        expected: [null, null, null, null, 1, 3],
        note: 'key 2 đã hết hạn nên put(3) không phải evict key 1',
      },
      {
        args: [['TTLCache', 'put', 'put', 'put', 'get', 'get'], [[2], [1, 1, 100, 0], [2, 2, 100, 1], [3, 3, 100, 2], [1, 3], [2, 3]]],
        expected: [null, null, null, null, -1, 2],
        note: 'đầy và không ai hết hạn → evict LRU (key 1)',
      },
      {
        args: [['TTLCache', 'put', 'put', 'get'], [[1], [1, 1, 5, 0], [1, 2, 50, 3], [1, 10]]],
        expected: [null, null, null, 2],
        note: 'put lại key đổi cả ttl; bản ghi cũ không được xóa nhầm entry mới',
      },
    ],
    gen: (n, r) => {
      const cap = Math.max(2, Math.floor(n / 6));
      const keys = cap + 5;
      let now = 0;
      return opsGen('TTLCache', [cap], Math.max(1, n), () => {
        now += r.int(0, 3);
        return r.bool(0.5) ? ['put', [r.int(0, keys), r.int(0, 1e6), r.int(1, Math.max(40, Math.floor(n / 2))), now]] : ['get', [r.int(0, keys), now]];
      });
    },
    perf: { n: 1e5, limitMs: 250 },
  },
  '03': {
    sig: 'double[] hitRatios(int capacity, int[] requests)',
    title: 'Hit ratio: LRU vs FIFO',
    ref: S.hitRatios,
    brute: bruteRatios,
    compare: 'float',
    cases: [
      { args: [3, [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]], expected: [2 / 12, 3 / 12], note: 'FIFO với capacity 3: 3 hit; LRU: 2 hit' },
      { args: [4, [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]], expected: [4 / 12, 2 / 12], note: 'Bélády: FIFO capacity 4 còn 2 hit' },
      { args: [1, [7, 7, 7, 7]], expected: [0.75, 0.75] },
      { args: [5, [1, 2, 3]], expected: [0, 0] },
    ],
    gen: (n, r) => {
      const cap = r.int(1, 6);
      return [cap, r.array(Math.max(1, n), 0, 9)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'class PriceCache {\n  PriceCache(int capacity)\n  void put(int productId, int categoryId, int price)\n  int get(int productId)\n  void invalidateProduct(int productId)\n  int invalidateCategory(int categoryId)\n  int size()\n}',
    title: 'Cache giá có invalidate',
    ref: S.PriceCache,
    brute: BrutePrice,
    cases: [
      {
        args: [
          ['PriceCache', 'put', 'put', 'put', 'invalidateCategory', 'get', 'get', 'size'],
          [[3], [1, 7, 100], [2, 7, 200], [3, 8, 300], [7], [1], [3], []],
        ],
        expected: [null, null, null, null, 2, -1, 300, 1],
      },
      {
        args: [['PriceCache', 'put', 'put', 'put', 'invalidateCategory', 'size'], [[2], [1, 5, 10], [2, 6, 20], [3, 6, 30], [5], []]],
        expected: [null, null, null, null, 0, 2],
        note: 'sản phẩm 1 (category 5) đã bị evict → invalidateCategory(5) xóa 0 entry',
      },
      {
        args: [['PriceCache', 'put', 'put', 'invalidateCategory', 'invalidateCategory', 'get'], [[5], [1, 1, 10], [1, 2, 11], [1], [2], [1]]],
        expected: [null, null, null, 0, 1, -1],
        note: 'put lại với category khác: chỉ mục phụ phải dời theo',
      },
    ],
    gen: (n, r) => {
      const cap = Math.max(2, Math.floor(n / 4));
      const prods = cap + 4;
      const cats = Math.max(2, Math.floor(prods / 8));
      return opsGen('PriceCache', [cap], Math.max(1, n), () => {
        const x = r.float();
        if (x < 0.4) return ['put', [r.int(0, prods), r.int(0, cats), r.int(1, 1e4)]];
        if (x < 0.8) return ['get', [r.int(0, prods)]];
        if (x < 0.85) return ['invalidateProduct', [r.int(0, prods)]];
        if (x < 0.95) return ['invalidateCategory', [r.int(0, cats)]];
        return ['size', []];
      });
    },
    // invalidateCategory quét cả cache là O(capacity): 10⁴ lần × 25 000 entry
    perf: { n: 1e5, limitMs: 400 },
  },
  '05': {
    sig: 'class LRUCacheList {\n  LRUCacheList(int capacity)\n  int get(int key)\n  void put(int key, int value)\n  List<Integer> keys()\n}',
    title: 'LRU bằng hash map + DLL',
    ref: S.LRUCacheList,
    brute: BruteLRU,
    cases: [
      {
        args: [
          ['LRUCacheList', 'put', 'put', 'keys', 'get', 'keys', 'put', 'keys', 'get'],
          [[2], [1, 1], [2, 2], [], [1], [], [3, 3], [], [2]],
        ],
        expected: [null, null, null, [2, 1], 1, [1, 2], null, [3, 1], -1],
        note: 'keys() trả key từ MRU → LRU',
      },
      { args: [['LRUCacheList', 'keys', 'put', 'put', 'keys'], [[1], [], [4, 1], [5, 2], []]], expected: [null, [], null, null, [5]] },
    ],
    gen: (n, r) => {
      const cap = Math.max(2, Math.floor(n / 5));
      const keys = Math.floor(cap * 1.5) + 1;
      return opsGen('LRUCacheList', [cap], Math.max(1, n), (i) => {
        // keys() duyệt cả cache: n nhỏ gọi dày để stress bắt lỗi thứ tự, n lớn chỉ gọi thưa
        if (n <= 200 ? r.bool(0.15) : i % 5000 === 4999) return ['keys', []];
        return r.bool(0.5) ? ['put', [r.int(0, keys), r.int(0, 1e6)]] : ['get', [r.int(0, keys)]];
      });
    },
    // keys() chỉ gọi thưa (mỗi 5000 thao tác) để bản chuẩn O(1) vẫn nhanh
    perf: { n: 1e5, limitMs: 400 },
  },
};
