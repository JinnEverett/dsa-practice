import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

class NaiveRandomizedCollection {
  a: number[] = [];
  insert(v: number) {
    const fresh = !this.a.includes(v);
    this.a.push(v);
    return fresh;
  }
  remove(v: number) {
    const i = this.a.indexOf(v);
    if (i < 0) return false;
    this.a.splice(i, 1);
    return true;
  }
  getRandom() {
    return this.a[Math.floor(Math.random() * this.a.length)];
  }
}

/** Kiểm tra một lần chạy của RandomizedCollection bằng cách mô phỏng lại: boolean đúng, getRandom thuộc tập,
 *  và với các đợt getRandom dài (≥ 600 lần liên tiếp, không thao tác khác) tần suất mỗi giá trị khớp bội số (±6σ). */
const compareRC = (got: any[], _expected: any[], args: any[]): boolean | string => {
  const [ops, opArgs] = args as [string[], any[][]];
  const cnt = new Map<number, number>();
  let total = 0;
  let run: number[] = [];
  const flush = (at: number): string | null => {
    if (run.length < 600) return (run = []), null;
    const seen = new Map<number, number>();
    for (const v of run) seen.set(v, (seen.get(v) ?? 0) + 1);
    for (const [v, c] of cnt) {
      const p = c / total;
      const exp = run.length * p;
      const sd = Math.sqrt(run.length * p * (1 - p));
      const obs = seen.get(v) ?? 0;
      if (Math.abs(obs - exp) > 6 * sd + 3) return `thao tác ${at}: getRandom không đều — giá trị ${v} xuất hiện ${obs}/${run.length} lần, kỳ vọng ≈ ${exp.toFixed(0)}`;
    }
    run = [];
    return null;
  };
  for (let i = 1; i < ops.length; i++) {
    const op = ops[i];
    if (op === 'getRandom') {
      const v = got[i];
      if ((cnt.get(v) ?? 0) === 0) return `thao tác ${i}: getRandom trả ${v} nhưng ${v} không có trong tập`;
      run.push(v);
      continue;
    }
    const bad = flush(i);
    if (bad) return bad;
    const v = opArgs[i][0];
    const c = cnt.get(v) ?? 0;
    const want = op === 'insert' ? c === 0 : c > 0;
    if (got[i] !== want) return `thao tác ${i}: ${op}(${v}) trả ${got[i]}, kỳ vọng ${want}`;
    if (op === 'insert') (cnt.set(v, c + 1), total++);
    else if (c > 0) (c === 1 ? cnt.delete(v) : cnt.set(v, c - 1), total--);
  }
  return flush(ops.length) ?? true;
};

class NaivePeeking {
  a: number[];
  i = 0;
  constructor(a: number[]) {
    this.a = a;
  }
  peek() {
    return this.a[this.i];
  }
  next() {
    return this.a[this.i++];
  }
  hasNext() {
    return this.i < this.a.length;
  }
}

class NaiveZigzag {
  merged: number[] = [];
  i = 0;
  constructor(a: number[], b: number[]) {
    for (let k = 0; k < Math.max(a.length, b.length); k++) {
      if (k < a.length) this.merged.push(a[k]);
      if (k < b.length) this.merged.push(b[k]);
    }
  }
  next() {
    return this.merged[this.i++];
  }
  hasNext() {
    return this.i < this.merged.length;
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class RandomizedCollection {\n  RandomizedCollection()\n  boolean insert(int val)\n  boolean remove(int val)\n  int getRandom()\n}',
    title: 'Multiset ngẫu nhiên',
    ref: S.RandomizedCollection,
    brute: NaiveRandomizedCollection,
    compare: compareRC,
    cases: [
      { args: [['RandomizedCollection', 'insert', 'insert', 'insert', 'getRandom', 'remove', 'getRandom'], [[], [1], [1], [2], [], [1], []]], note: 'ví dụ trong đề (getRandom kiểm bằng compare)' },
      { args: [['RandomizedCollection', 'remove', 'insert', 'remove', 'remove'], [[], [5], [5], [5], [5]]], expected: [null, false, true, true, false] },
      { args: [['RandomizedCollection', 'insert', 'insert', 'remove', 'remove', 'insert', 'insert'], [[], [7], [7], [7], [7], [7], [7]]], expected: [null, true, false, true, true, true, false], note: 'xóa hết bản sao rồi chèn lại: insert phải trả true' },
      {
        args: [
          ['RandomizedCollection', 'insert', 'insert', 'insert', ...new Array(1000).fill('getRandom')],
          [[], [1], [1], [2], ...new Array(1000).fill([])],
        ],
        note: 'phân phối: 1 phải xuất hiện ≈ 2/3 số lần',
      },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      const range = big ? 20000 : 4;
      const ops = ['RandomizedCollection'];
      const args: any[][] = [[]];
      const cnt = new Map<number, number>();
      let tot = 0;
      const total = Math.max(1, n);
      for (let i = 0; i < total; i++) {
        const p = r.float();
        const op = tot === 0 || (big && i < total * 0.5) || p < 0.4 ? 'insert' : p < 0.7 ? 'remove' : 'getRandom';
        const v = r.int(0, range);
        if (op === 'remove' && r.bool(0.7) && tot > 0) {
          // phần lớn remove nhắm vào giá trị đang có để tập không cạn quá nhanh
          const k = cnt.size <= 50 ? r.pick([...cnt.keys()]) : v;
          ops.push(op);
          args.push([k]);
          const c = cnt.get(k) ?? 0;
          if (c > 0) (c === 1 ? cnt.delete(k) : cnt.set(k, c - 1), tot--);
          continue;
        }
        ops.push(op);
        args.push(op === 'getRandom' ? [] : [v]);
        if (op === 'insert') (cnt.set(v, (cnt.get(v) ?? 0) + 1), tot++);
        else if (op === 'remove') {
          const c = cnt.get(v) ?? 0;
          if (c > 0) (c === 1 ? cnt.delete(v) : cnt.set(v, c - 1), tot--);
        }
      }
      return [ops, args];
    },
    // ngây thơ: remove/insert quét O(n) (indexOf / includes)
    perf: { n: 1e5, limitMs: 250 },
  },
  '02': {
    sig: 'class PeekingIterator {\n  PeekingIterator(int[] nums)\n  int peek()\n  int next()\n  boolean hasNext()\n}',
    title: 'Peeking iterator',
    ref: S.PeekingIterator,
    brute: NaivePeeking,
    cases: [
      { args: [['PeekingIterator', 'next', 'peek', 'next', 'next', 'hasNext'], [[[1, 2, 3]], [], [], [], [], []]], expected: [null, 1, 2, 2, 3, false] },
      { args: [['PeekingIterator', 'hasNext'], [[[]], []]], expected: [null, false], note: 'nguồn rỗng' },
      { args: [['PeekingIterator', 'peek', 'peek', 'hasNext', 'next', 'hasNext'], [[[9]], [], [], [], [], []]], expected: [null, 9, 9, true, 9, false], note: 'peek nhiều lần không làm tiến' },
    ],
    gen: (n, r: Rng) => {
      const len = r.int(0, Math.max(1, n));
      const nums = r.array(len, -50, 50);
      let left = len;
      const ops = ['PeekingIterator'];
      const args: any[][] = [[nums]];
      for (let i = 0; i < Math.max(1, n); i++) {
        const op = left === 0 ? 'hasNext' : r.pick(['peek', 'next', 'hasNext', 'peek']);
        if (op === 'next') left--;
        ops.push(op);
        args.push([]);
      }
      return [ops, args];
    },
    perf: false,
  },
  '03': {
    sig: 'class ZigzagIterator {\n  ZigzagIterator(int[] a, int[] b)\n  int next()\n  boolean hasNext()\n}',
    title: 'Zigzag iterator (gộp xen kẽ hai nguồn)',
    ref: S.ZigzagIterator,
    brute: NaiveZigzag,
    cases: [
      { args: [['ZigzagIterator', 'next', 'next', 'next', 'next', 'next', 'next', 'hasNext'], [[[1, 2], [3, 4, 5, 6]], [], [], [], [], [], [], []]], expected: [null, 1, 3, 2, 4, 5, 6, false] },
      { args: [['ZigzagIterator', 'hasNext', 'next', 'hasNext'], [[[], [7]], [], [], []]], expected: [null, true, 7, false], note: 'một nguồn rỗng' },
      { args: [['ZigzagIterator', 'hasNext'], [[[], []], []]], expected: [null, false], note: 'cả hai rỗng' },
    ],
    gen: (n, r: Rng) => {
      const a = r.array(r.int(0, Math.max(1, n)), -9, 9);
      const b = r.array(r.int(0, Math.max(1, n)), -9, 9);
      let left = a.length + b.length;
      const ops = ['ZigzagIterator'];
      const args: any[][] = [[a, b]];
      for (let i = 0; i < Math.max(1, n); i++) {
        const op = left === 0 || r.bool(0.3) ? 'hasNext' : 'next';
        if (op === 'next') left--;
        ops.push(op);
        args.push([]);
      }
      return [ops, args];
    },
    perf: false,
  },
};
