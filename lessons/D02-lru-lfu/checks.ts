import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

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

/** Ngây thơ: mảng [key, val] theo thứ tự dùng (cuối = mới nhất), mọi thao tác O(capacity). */
class NaiveLRU {
  cap: number;
  a: [number, number][] = [];
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
    if (this.cap === 0) return;
    const i = this.a.findIndex((e) => e[0] === k);
    if (i >= 0) this.a.splice(i, 1);
    else if (this.a.length === this.cap) this.a.shift();
    this.a.push([k, v]);
  }
}

/** Ngây thơ: mỗi key lưu (tần suất, thời điểm dùng gần nhất); evict bằng quét toàn bộ. */
class NaiveLFU {
  cap: number;
  m = new Map<number, { v: number; f: number; t: number }>();
  clock = 0;
  constructor(cap: number) {
    this.cap = cap;
  }
  get(k: number) {
    const e = this.m.get(k);
    if (!e) return -1;
    e.f++;
    e.t = ++this.clock;
    return e.v;
  }
  put(k: number, v: number) {
    if (this.cap === 0) return;
    const e = this.m.get(k);
    if (e) {
      e.v = v;
      e.f++;
      e.t = ++this.clock;
      return;
    }
    if (this.m.size === this.cap) {
      let bk = 0;
      let best: { f: number; t: number } | null = null;
      for (const [key, x] of this.m) if (!best || x.f < best.f || (x.f === best.f && x.t < best.t)) ((best = x), (bk = key));
      this.m.delete(bk);
    }
    this.m.set(k, { v, f: 1, t: ++this.clock });
  }
}

const genCache = (ctor: string) => (n: number, r: Rng) => {
  const big = n > 1000;
  const cap = big ? 5000 : r.int(0, 4);
  const keys = big ? 12000 : 6;
  return opsGen(ctor, [cap], Math.max(1, n), () => {
    // key hơi lệch về nhóm "nóng" để LFU và LRU khác nhau rõ
    const k = r.bool(0.5) ? r.int(0, Math.min(keys, 20)) : r.int(0, keys);
    return r.bool(0.5) ? ['get', [k]] : ['put', [k, r.int(-1e9, 1e9)]];
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
        args: [
          ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
          [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        ],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
      { args: [['LRUCache', 'put', 'get'], [[0], [1, 1], [1]]], expected: [null, null, -1], note: 'sức chứa 0' },
      {
        args: [['LRUCache', 'put', 'put', 'put', 'get', 'get'], [[2], [1, 10], [2, 20], [1, 11], [2], [1]]],
        expected: [null, null, null, null, 20, 11],
        note: 'put key đã có cập nhật giá trị + đưa lên mới nhất',
      },
    ],
    gen: genCache('LRUCache'),
    // ngây thơ O(capacity) = 5000 mỗi thao tác
    perf: { n: 1e5, limitMs: 300 },
  },
  '02': {
    sig: 'class LFUCache {\n  LFUCache(int capacity)\n  int get(int key)\n  void put(int key, int value)\n}',
    title: 'LFU cache',
    ref: S.LFUCache,
    brute: NaiveLFU,
    cases: [
      {
        args: [
          ['LFUCache', 'put', 'put', 'get', 'put', 'get', 'get', 'put', 'get', 'get', 'get'],
          [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]],
        ],
        expected: [null, null, null, 1, null, -1, 3, null, -1, 3, 4],
      },
      { args: [['LFUCache', 'put', 'get'], [[0], [0, 0], [0]]], expected: [null, null, -1], note: 'sức chứa 0' },
      {
        args: [['LFUCache', 'put', 'put', 'put', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [1, 5], [3, 3], [1], [2]]],
        expected: [null, null, null, null, null, 5, -1],
        note: 'put key đã có tính là một lần dùng',
      },
      {
        args: [['LFUCache', 'put', 'put', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [3, 3], [1], [2], [3]]],
        expected: [null, null, null, null, -1, 2, 3],
        note: 'hòa tần suất → bỏ key dùng lâu nhất',
      },
    ],
    gen: genCache('LFUCache'),
    perf: { n: 1e5, limitMs: 300 },
  },
};
