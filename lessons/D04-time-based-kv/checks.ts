import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import { genOps } from '../../tools/classgen.ts';
import * as S from './solutions.ts';

class NaiveTimeMap {
  a: [string, string, number][] = [];
  set(k: string, v: string, t: number) {
    this.a.push([k, v, t]);
  }
  get(k: string, t: number) {
    let best = '';
    let bt = -1;
    for (const [kk, v, tt] of this.a) if (kk === k && tt <= t && tt > bt) [best, bt] = [v, tt];
    return best;
  }
}

// mỗi snap sao chép cả mảng
class NaiveSnap {
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
    title: 'TimeMap',
    ref: S.TimeMap,
    brute: NaiveTimeMap,
    cases: [
      {
        args: [['TimeMap', 'set', 'get', 'get', 'set', 'get', 'get'], [[], ['foo', 'bar', 1], ['foo', 1], ['foo', 3], ['foo', 'bar2', 4], ['foo', 4], ['foo', 5]]],
        expected: [null, null, 'bar', 'bar', null, 'bar2', 'bar2'],
        note: 'ví dụ LeetCode 981',
      },
      { args: [['TimeMap', 'get', 'set', 'get'], [[], ['x', 5], ['x', 'a', 10], ['x', 9]]], expected: [null, '', null, ''], note: 'key chưa có / trước mọi timestamp' },
      { args: [['TimeMap', 'set', 'set', 'get', 'get'], [[], ['a', 'v1', 1], ['b', 'w1', 2], ['a', 2], ['b', 1]]], expected: [null, null, null, 'v1', ''], note: 'key độc lập' },
      { args: [['TimeMap', 'set', 'get'], [[], ['k', 'big', 1000000000], ['k', 1000000000]]], expected: [null, null, 'big'], note: 'timestamp lớn' },
    ],
    gen: (n, r: Rng) => {
      let t = 0;
      const keys = n <= 200 ? ['a', 'b', 'c'] : ['k0', 'k1', 'k2', 'k3', 'k4'];
      return genOps('TimeMap', [], Math.max(1, n), () => {
        const key = r.pick(keys);
        if (r.bool(0.5)) {
          t += r.int(1, 3);
          return ['set', [key, r.string(3, 'abcdef'), t]];
        }
        return ['get', [key, r.int(0, t + 2)]];
      });
    },
    stress: { maxN: 80 },
    // ngây thơ: get quét mọi bản ghi (~5·10⁴) cho ~5·10⁴ truy vấn
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'class SnapshotArray {\n  SnapshotArray(int length)\n  void set(int index, int val)\n  int snap()\n  int get(int index, int snap_id)\n}',
    title: 'SnapshotArray',
    ref: S.SnapshotArray,
    brute: NaiveSnap,
    cases: [
      {
        args: [['SnapshotArray', 'set', 'snap', 'set', 'get'], [[3], [0, 5], [], [0, 6], [0, 0]]],
        expected: [null, null, 0, null, 5],
        note: 'ví dụ LeetCode 1146',
      },
      { args: [['SnapshotArray', 'snap', 'get', 'set', 'set', 'snap', 'get', 'get'], [[2], [], [1, 0], [1, 4], [1, 9], [], [1, 0], [1, 1]]], expected: [null, 0, 0, null, null, 1, 0, 9], note: 'mặc định 0; set 2 lần trước snap lấy lần cuối' },
      { args: [['SnapshotArray', 'set', 'snap', 'snap', 'snap', 'get', 'get'], [[1], [0, 7], [], [], [], [0, 2], [0, 0]]], expected: [null, null, 0, 1, 2, 7, 7], note: 'snap liên tiếp không đổi giá trị' },
    ],
    gen: (n, r: Rng) => {
      const small = n <= 200;
      const len = small ? r.int(1, 5) : 50_000;
      let snaps = 0;
      return genOps('SnapshotArray', [len], Math.max(1, n), () => {
        const p = r.float();
        if (p < 0.55) return ['set', [r.int(0, len - 1), r.int(0, 1_000_000_000)]];
        if (p < 0.7 || snaps === 0) {
          snaps++;
          return ['snap', []];
        }
        return ['get', [r.int(0, len - 1), r.int(0, snaps - 1)]];
      });
    },
    stress: { maxN: 80 },
    // ngây thơ: snap sao chép cả mảng 5·10⁴ phần tử × ~1.5·10⁴ lần snap
    perf: { n: 1e5, limitMs: 250 },
  },
};
