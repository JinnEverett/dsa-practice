import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

class NaiveTimeMap {
  m = new Map<string, [number, string][]>();
  set(k: string, v: string, t: number) {
    if (!this.m.has(k)) this.m.set(k, []);
    this.m.get(k)!.push([t, v]);
  }
  get(k: string, t: number) {
    let best = '';
    let bt = -1;
    for (const [ts, v] of this.m.get(k) ?? []) if (ts <= t && ts > bt) ((bt = ts), (best = v));
    return best;
  }
}

class NaiveSnapshotArray {
  cur: number[];
  snaps: number[][] = [];
  constructor(len: number) {
    this.cur = new Array(len).fill(0);
  }
  set(i: number, v: number) {
    this.cur[i] = v;
  }
  snap() {
    this.snaps.push(this.cur.slice());
    return this.snaps.length - 1;
  }
  get(i: number, s: number) {
    return this.snaps[s][i];
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class TimeMap {\n  TimeMap()\n  void set(String key, String value, int timestamp)\n  String get(String key, int timestamp)\n}',
    title: 'Time-based key-value store',
    ref: S.TimeMap,
    brute: NaiveTimeMap,
    cases: [
      {
        args: [
          ['TimeMap', 'set', 'get', 'get', 'set', 'get', 'get'],
          [[], ['foo', 'bar', 1], ['foo', 1], ['foo', 3], ['foo', 'bar2', 4], ['foo', 4], ['foo', 5]],
        ],
        expected: [null, null, 'bar', 'bar', null, 'bar2', 'bar2'],
      },
      { args: [['TimeMap', 'get', 'set', 'get'], [[], ['x', 5], ['x', 'a', 10], ['x', 9]]], expected: [null, '', null, ''], note: 'key lạ / timestamp trước mọi bản ghi → ""' },
      {
        args: [['TimeMap', 'set', 'set', 'get', 'get', 'get'], [[], ['k', 'v1', 10], ['k', 'v2', 20], ['k', 19], ['k', 20], ['k', 10000000]]],
        expected: [null, null, null, 'v1', 'v2', 'v2'],
        note: 'tại đúng timestamp được đặt',
      },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      const keys = big ? ['a', 'b', 'c'] : ['a', 'b', 'c', 'd'];
      const last = new Map<string, number>();
      const ops = ['TimeMap'];
      const args: any[][] = [[]];
      const total = Math.max(1, n);
      for (let i = 0; i < total; i++) {
        const k = r.pick(keys);
        const setNow = big ? i < total * 0.5 : r.bool(0.5);
        if (setNow) {
          const t = (last.get(k) ?? 0) + r.int(1, big ? 100 : 4);
          last.set(k, t);
          ops.push('set');
          args.push([k, r.string(r.int(1, 4), 'abc'), t]);
        } else {
          ops.push('get');
          args.push([k, r.int(0, (last.get(k) ?? 0) + 3)]);
        }
      }
      return [ops, args];
    },
    // ngây thơ quét O(m) mỗi get: ~1.7·10⁴ bản ghi/key × 5·10⁴ get
    perf: { n: 1e5, limitMs: 250 },
  },
  '02': {
    sig: 'class SnapshotArray {\n  SnapshotArray(int length)\n  void set(int index, int val)\n  int snap()\n  int get(int index, int snapId)\n}',
    title: 'Snapshot array (cấu hình có phiên bản)',
    ref: S.SnapshotArray,
    brute: NaiveSnapshotArray,
    cases: [
      {
        args: [['SnapshotArray', 'set', 'snap', 'set', 'get'], [[3], [0, 5], [], [0, 6], [0, 0]]],
        expected: [null, null, 0, null, 5],
      },
      {
        args: [['SnapshotArray', 'snap', 'get', 'set', 'set', 'snap', 'get', 'get'], [[2], [], [1, 0], [1, 7], [1, 8], [], [1, 0], [1, 1]]],
        expected: [null, 0, 0, null, null, 1, 0, 8],
        note: 'chưa đặt → 0; set hai lần trong cùng phiên bản thì giữ lần cuối',
      },
      {
        args: [['SnapshotArray', 'set', 'snap', 'snap', 'set', 'snap', 'get', 'get', 'get'], [[1], [0, -2147483648], [], [], [0, 2147483647], [], [0, 0], [0, 1], [0, 2]]],
        expected: [null, null, 0, 1, null, 2, -2147483648, -2147483648, 2147483647],
        note: 'biên int, snap không có thay đổi',
      },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      const length = big ? 100000 : r.int(1, 5);
      const ops = ['SnapshotArray'];
      const args: any[][] = [[length]];
      let snaps = 0;
      for (let i = 0; i < Math.max(1, n); i++) {
        const p = r.float();
        if (p < (big ? 0.25 : 0.2)) {
          ops.push('snap');
          args.push([]);
          snaps++;
        } else if (p < 0.6 || snaps === 0) {
          ops.push('set');
          args.push([r.int(0, length - 1), big ? r.int(-1e9, 1e9) : r.int(-3, 3)]);
        } else {
          ops.push('get');
          args.push([r.int(0, length - 1), r.int(0, snaps - 1)]);
        }
      }
      return [ops, args];
    },
    // ngây thơ sao chép 10⁵ ô mỗi snap × 2.5·10⁴ snap
    perf: { n: 1e5, limitMs: 250 },
  },
};
