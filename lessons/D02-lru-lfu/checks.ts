import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import { genOps } from '../../tools/classgen.ts';
import * as S from './solutions.ts';

class NaiveLRU {
  cap: number;
  a: [number, number][] = []; // cũ nhất ở đầu
  constructor(cap: number) {
    this.cap = cap;
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
    this.a.push([k, v]);
    if (this.a.length > this.cap) this.a.shift();
  }
}

class NaiveLFU {
  cap: number;
  t = 0;
  a: { k: number; v: number; f: number; t: number }[] = [];
  constructor(cap: number) {
    this.cap = cap;
  }
  get(k: number) {
    const e = this.a.find((x) => x.k === k);
    if (!e) return -1;
    e.f++;
    e.t = ++this.t;
    return e.v;
  }
  put(k: number, v: number) {
    if (this.cap === 0) return;
    const e = this.a.find((x) => x.k === k);
    if (e) {
      e.v = v;
      e.f++;
      e.t = ++this.t;
      return;
    }
    if (this.a.length === this.cap) {
      let b = 0;
      for (let i = 1; i < this.a.length; i++) {
        const x = this.a[i];
        const y = this.a[b];
        if (x.f < y.f || (x.f === y.f && x.t < y.t)) b = i;
      }
      this.a.splice(b, 1);
    }
    this.a.push({ k, v, f: 1, t: ++this.t });
  }
}

// chuỗi get/put ngẫu nhiên; capacity và miền key phụ thuộc n (n ≤ 200: nhỏ để ép evict/tie; lớn: cho perf)
const cacheGen = (name: string) => (n: number, r: Rng) => {
  const small = n <= 200;
  const cap = small ? r.int(0, 5) : 20_000;
  const keys = small ? 8 : 40_000;
  return genOps(name, [cap], Math.max(1, n), () => {
    const k = r.int(0, keys);
    return r.bool(0.5) ? ['get', [k]] : ['put', [k, r.int(0, 1000)]];
  });
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class LRUCache {\n  LRUCache(int capacity)\n  int get(int key)\n  void put(int key, int value)\n}',
    title: 'LRU cache',
    ref: S.LRUCache,
    brute: NaiveLRU,
    cases: [
      {
        args: [['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
        note: 'ví dụ LeetCode 146',
      },
      { args: [['LRUCache', 'put', 'get', 'put', 'get'], [[0], [1, 1], [1], [2, 2], [2]]], expected: [null, null, -1, null, -1], note: 'capacity = 0' },
      { args: [['LRUCache', 'put', 'put', 'put', 'get', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [1, 10], [1], [3, 3], [2], [1]]], expected: [null, null, null, null, 10, null, -1, 10], note: 'put key đã có = chạm' },
      { args: [['LRUCache', 'put', 'put', 'get', 'get'], [[1], [5, 1], [6, 2], [5], [6]]], expected: [null, null, null, -1, 2], note: 'capacity = 1' },
    ],
    gen: cacheGen('LRUCache'),
    stress: { maxN: 80 },
    // bản ngây thơ (mảng): mỗi thao tác quét ~2·10⁴ phần tử → ~10⁹ bước
    perf: { n: 1e5, limitMs: 200 },
  },
  '02': {
    sig: 'class LFUCache {\n  LFUCache(int capacity)\n  int get(int key)\n  void put(int key, int value)\n}',
    title: 'LFU cache',
    ref: S.LFUCache,
    brute: NaiveLFU,
    cases: [
      {
        args: [['LFUCache', 'put', 'put', 'get', 'put', 'get', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]]],
        expected: [null, null, null, 1, null, -1, 3, null, -1, 3, 4],
        note: 'ví dụ LeetCode 460',
      },
      { args: [['LFUCache', 'put', 'get'], [[0], [0, 0], [0]]], expected: [null, null, -1], note: 'capacity = 0' },
      { args: [['LFUCache', 'put', 'put', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [3, 3], [1], [2]]], expected: [null, null, null, null, -1, 2], note: 'hòa tần suất → bỏ cái LRU (key 1)' },
      { args: [['LFUCache', 'put', 'put', 'put', 'put', 'get', 'get'], [[2], [1, 1], [1, 2], [2, 3], [3, 4], [2], [1]]], expected: [null, null, null, null, null, -1, 2], note: 'put key đã có tăng tần suất' },
    ],
    gen: cacheGen('LFUCache'),
    stress: { maxN: 80 },
    // bản ngây thơ: quét toàn bộ để tìm nạn nhân → ~10⁹ bước
    perf: { n: 1e5, limitMs: 400 },
  },
};
