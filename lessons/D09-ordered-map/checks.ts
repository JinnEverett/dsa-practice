import type { Spec } from '../../tools/spec.ts';
import { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Ngây thơ: Map + mọi truy vấn quét toàn bộ khóa. */
class NaiveOrderedMap {
  m = new Map<number, number>();
  put(k: number, v: number) {
    this.m.set(k, v);
  }
  get(k: number) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  remove(k: number) {
    return this.m.delete(k);
  }
  floorKey(k: number) {
    let best: number | null = null;
    for (const x of this.m.keys()) if (x <= k && (best === null || x > best)) best = x;
    return best;
  }
  ceilingKey(k: number) {
    let best: number | null = null;
    for (const x of this.m.keys()) if (x >= k && (best === null || x < best)) best = x;
    return best;
  }
  rangeCount(lo: number, hi: number) {
    let c = 0;
    for (const x of this.m.keys()) if (x >= lo && x <= hi) c++;
    return c;
  }
}

class NaiveCalendar {
  a: [number, number][] = [];
  book(s: number, e: number) {
    for (const [x, y] of this.a) if (s < y && x < e) return false;
    this.a.push([s, e]);
    return true;
  }
}

const genOrdered = (n: number, r: Rng) => {
  const big = n > 1000;
  const range = big ? 1e9 : 20;
  const total = Math.max(1, n);
  const ops = ['OrderedMap'];
  const args: any[][] = [[]];
  const keys: number[] = []; // một số khóa đã đặt để remove/get thường trúng
  for (let i = 0; i < total; i++) {
    const p = r.float();
    const known = keys.length && r.bool(0.7) ? keys[r.int(0, keys.length - 1)] : r.int(-range, range);
    if (p < 0.4) {
      const k = r.int(-range, range);
      if (keys.length < 5000) keys.push(k);
      ops.push('put');
      args.push([k, r.int(-1e9, 1e9)]);
    } else if (p < 0.5) (ops.push('get'), args.push([known]));
    else if (p < 0.6) (ops.push('remove'), args.push([known]));
    else if (p < 0.7) (ops.push('floorKey'), args.push([known + r.int(-1, 1)]));
    else if (p < 0.8) (ops.push('ceilingKey'), args.push([known + r.int(-1, 1)]));
    else {
      const a = r.int(-range, range);
      const b = r.int(-range, range);
      ops.push('rangeCount');
      args.push(r.bool(0.1) ? [Math.max(a, b), Math.min(a, b)] : [Math.min(a, b), Math.max(a, b)]);
    }
  }
  return [ops, args];
};


/** Chèn tăng dần 0..1999 rồi xóa các số chẵn và hỏi rangeCount/floor/ceiling: chạm tới nhiều tầng của skip list (stress n ≤ 30 không với tới). */
const sequentialCase = () => {
  const ops = ['OrderedMap'];
  const args: any[][] = [[]];
  for (let k = 0; k < 2000; k++) (ops.push('put'), args.push([k, k * 2]));
  for (let k = 0; k < 2000; k += 2) (ops.push('remove'), args.push([k]));
  for (let k = 0; k < 2000; k += 97) {
    ops.push('rangeCount', 'floorKey', 'ceilingKey');
    args.push([k, k + 500], [k], [k]);
  }
  ops.push('rangeCount');
  args.push([-5, 5000]);
  return [ops, args];
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class OrderedMap {\n  OrderedMap()\n  void put(int key, int value)\n  Integer get(int key)\n  boolean remove(int key)\n  Integer floorKey(int key)\n  Integer ceilingKey(int key)\n  int rangeCount(int lo, int hi)\n}',
    title: 'Ordered map (skip list)',
    ref: S.OrderedMap,
    brute: NaiveOrderedMap,
    cases: [
      {
        args: [
          ['OrderedMap', 'put', 'put', 'put', 'get', 'get', 'floorKey', 'floorKey', 'ceilingKey', 'ceilingKey', 'rangeCount', 'remove', 'remove', 'rangeCount', 'floorKey'],
          [[], [10, 1], [20, 2], [30, 3], [20], [25], [25], [5], [25], [31], [10, 30], [20], [20], [10, 30], [29]],
        ],
        expected: [null, null, null, null, 2, null, 20, null, 30, null, 3, true, false, 2, 10],
      },
      {
        args: [['OrderedMap', 'put', 'put', 'rangeCount', 'rangeCount', 'rangeCount', 'get'], [[], [5, 1], [5, 9], [5, 5], [6, 4], [-2147483648, 2147483647], [5]]],
        expected: [null, null, null, 1, 0, 1, 9],
        note: 'put đè khóa cũ (size vẫn 1); lo > hi → 0; biên int',
      },
      { args: [['OrderedMap', 'floorKey', 'ceilingKey', 'remove', 'rangeCount'], [[], [0], [0], [0], [0, 0]]], expected: [null, null, null, false, 0], note: 'bản đồ rỗng' },
      { args: sequentialCase(), note: '2 000 khóa tăng dần rồi xóa một nửa (nhiều tầng)' },
      { args: genOrdered(4000, new Rng(3)), note: '4 000 thao tác ngẫu nhiên, khóa rải rộng' },
    ],
    gen: genOrdered,
    // mảng sort + splice: chèn O(n) memmove; ngây thơ quét: O(n) mỗi truy vấn
    perf: { n: 1e5, limitMs: 600 },
  },
  '02': {
    sig: 'class MyCalendar {\n  MyCalendar()\n  boolean book(int start, int end)\n}',
    title: 'Đặt phòng họp không trùng giờ',
    ref: S.MyCalendar,
    brute: NaiveCalendar,
    cases: [
      { args: [['MyCalendar', 'book', 'book', 'book'], [[], [10, 20], [15, 25], [20, 30]]], expected: [null, true, false, true], note: 'LeetCode 729: [20,30) không giao [10,20)' },
      { args: [['MyCalendar', 'book', 'book', 'book', 'book'], [[], [10, 20], [10, 20], [5, 10], [0, 100]]], expected: [null, true, false, true, false], note: 'trùng hệt; chạm đầu mút; bao trùm' },
      { args: [['MyCalendar', 'book', 'book', 'book'], [[], [0, 1000000000], [999999999, 1000000000], [1000000000, 1000000001]]], expected: [null, true, false, true] },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      const ops = ['MyCalendar'];
      const args: any[][] = [[]];
      for (let i = 0; i < Math.max(1, n); i++) {
        const s = r.int(0, big ? 999990000 : 30);
        ops.push('book');
        args.push([s, s + r.int(1, big ? 5000 : 5)]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 1000 },
  },
};
