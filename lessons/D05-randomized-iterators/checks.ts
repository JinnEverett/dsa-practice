import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import { genOps } from '../../tools/classgen.ts';
import * as S from './solutions.ts';

class NaiveRC {
  a: number[] = [];
  insert(v: number) {
    const had = this.a.includes(v);
    this.a.push(v);
    return !had;
  }
  remove(v: number) {
    const i = this.a.indexOf(v);
    if (i < 0) return false;
    this.a.splice(i, 1);
    return true;
  }
  getRandom() {
    return this.a[0]; // giá trị bất kỳ hợp lệ; compare bỏ qua
  }
}

/** getRandom: chỉ kiểm tra giá trị trả về đang nằm trong bộ sưu tập (replay đa tập). Các thao tác khác so chính xác. */
const rcCompare = (got: any[], expected: any[], args: any[]): boolean | string => {
  const [ops, opArgs] = args as [string[], any[][]];
  const ms = new Map<number, number>();
  let size = 0;
  for (let i = 1; i < ops.length; i++) {
    if (ops[i] === 'getRandom') {
      if (!(ms.get(got[i]) ?? 0)) return `thao tác #${i}: getRandom() trả ${JSON.stringify(got[i])} nhưng giá trị đó không có trong bộ sưu tập`;
      continue;
    }
    if (got[i] !== expected[i]) return `thao tác #${i} ${ops[i]}(${opArgs[i]}): trả ${JSON.stringify(got[i])}, kỳ vọng ${JSON.stringify(expected[i])}`;
    const v = opArgs[i][0];
    if (ops[i] === 'insert') {
      ms.set(v, (ms.get(v) ?? 0) + 1);
      size++;
    } else if (expected[i]) {
      ms.set(v, ms.get(v)! - 1);
      size--;
    }
  }
  return true;
};

class NaivePeek {
  a: number[];
  constructor(a: number[]) {
    this.a = a.slice();
  }
  peek() {
    return this.a[0];
  }
  next() {
    return this.a.shift();
  }
  hasNext() {
    return this.a.length > 0;
  }
}

class NaiveZigzag {
  out: number[] = [];
  p = 0;
  constructor(a: number[], b: number[]) {
    for (let k = 0; k < Math.max(a.length, b.length); k++) {
      if (k < a.length) this.out.push(a[k]);
      if (k < b.length) this.out.push(b[k]);
    }
  }
  next() {
    return this.out[this.p++];
  }
  hasNext() {
    return this.p < this.out.length;
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class RandomizedCollection {\n  RandomizedCollection()\n  boolean insert(int val)\n  boolean remove(int val)\n  int getRandom()\n}',
    title: 'RandomizedCollection (có trùng)',
    ref: S.RandomizedCollection,
    brute: NaiveRC,
    compare: rcCompare,
    cases: [
      {
        args: [['RandomizedCollection', 'insert', 'insert', 'insert', 'getRandom', 'remove', 'getRandom'], [[], [1], [1], [2], [], [1], []]],
        expected: [null, true, false, true, 1, true, 1],
        note: 'ví dụ LeetCode 381 (getRandom: chỉ cần hợp lệ)',
      },
      { args: [['RandomizedCollection', 'remove', 'insert', 'remove', 'remove'], [[], [5], [5], [5], [5]]], expected: [null, false, true, true, false], note: 'xóa khi rỗng / xóa hết' },
      { args: [['RandomizedCollection', 'insert', 'insert', 'insert', 'remove', 'remove', 'insert', 'getRandom'], [[], [3], [4], [3], [3], [3], [3], []]], expected: [null, true, true, false, true, true, true, 3], note: 'phần tử cần xóa nằm cuối mảng' },
    ],
    gen: (n, r: Rng) => {
      const hi = n <= 200 ? 4 : 20_000;
      const cnt = new Map<number, number>();
      let size = 0;
      return genOps('RandomizedCollection', [], Math.max(1, n), () => {
        const p = r.float();
        const v = r.int(0, hi);
        if (p < 0.5) {
          cnt.set(v, (cnt.get(v) ?? 0) + 1);
          size++;
          return ['insert', [v]];
        }
        if (p < 0.85 || size === 0) {
          if (cnt.get(v)) {
            cnt.set(v, cnt.get(v)! - 1);
            size--;
          }
          return ['remove', [v]]; // có thể trượt → false
        }
        return ['getRandom', []];
      });
    },
    stress: { maxN: 80 },
    // ngây thơ: remove = indexOf + splice, O(n) trên mảng ~2·10⁴ phần tử
    perf: { n: 1e5, limitMs: 250 },
  },
  '02': {
    sig: 'class PeekingIterator {\n  PeekingIterator(int[] nums)\n  int peek()\n  int next()\n  boolean hasNext()\n}',
    title: 'PeekingIterator',
    ref: S.PeekingIterator,
    brute: NaivePeek,
    cases: [
      { args: [['PeekingIterator', 'next', 'peek', 'next', 'next', 'hasNext'], [[[1, 2, 3]], [], [], [], [], []]], expected: [null, 1, 2, 2, 3, false], note: 'ví dụ LeetCode 284' },
      { args: [['PeekingIterator', 'hasNext', 'peek', 'peek', 'next', 'hasNext'], [[[7]], [], [], [], [], []]], expected: [null, true, 7, 7, 7, false], note: 'peek nhiều lần không tiến' },
      { args: [['PeekingIterator', 'hasNext'], [[[]], []]], expected: [null, false], note: 'mảng rỗng' },
    ],
    gen: (n, r: Rng) => {
      const len = r.int(0, Math.max(1, n));
      const nums = r.array(len, -100, 100);
      let left = len;
      return genOps('PeekingIterator', [nums], Math.max(1, n), () => {
        const p = r.float();
        if (p < 0.3) return ['hasNext', []];
        if (left === 0) return ['hasNext', []];
        if (p < 0.65) return ['peek', []];
        left--;
        return ['next', []];
      });
    },
    stress: { maxN: 60 },
    // mọi thao tác O(1) thật sự; shift() của V8 đủ nhanh nên perf không phân biệt được → tự giác
    perf: false,
  },
  '03': {
    sig: 'class ZigzagIterator {\n  ZigzagIterator(int[] a, int[] b)\n  int next()\n  boolean hasNext()\n}',
    title: 'ZigzagIterator',
    ref: S.ZigzagIterator,
    brute: NaiveZigzag,
    cases: [
      { args: [['ZigzagIterator', 'next', 'next', 'next', 'next', 'next', 'next', 'hasNext'], [[[1, 2], [3, 4, 5, 6]], [], [], [], [], [], [], []]], expected: [null, 1, 3, 2, 4, 5, 6, false], note: 'ví dụ LeetCode 281' },
      { args: [['ZigzagIterator', 'hasNext', 'next', 'next', 'hasNext'], [[[], [9, 8]], [], [], [], []]], expected: [null, true, 9, 8, false], note: 'một bên rỗng' },
      { args: [['ZigzagIterator', 'hasNext'], [[[], []], []]], expected: [null, false] },
    ],
    gen: (n, r: Rng) => {
      const a = r.array(r.int(0, Math.max(1, n >> 1)), -50, 50);
      const b = r.array(r.int(0, Math.max(1, n >> 1)), -50, 50);
      let left = a.length + b.length;
      return genOps('ZigzagIterator', [a, b], Math.max(1, n), () => {
        if (left === 0 || r.bool(0.3)) return ['hasNext', []];
        left--;
        return ['next', []];
      });
    },
    stress: { maxN: 60 },
    perf: false,
  },
};
