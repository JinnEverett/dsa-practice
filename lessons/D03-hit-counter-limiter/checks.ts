import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import { genOps } from '../../tools/classgen.ts';
import * as S from './solutions.ts';

class NaiveHits {
  a: number[] = [];
  hit(t: number) {
    this.a.push(t);
  }
  getHits(t: number) {
    return this.a.filter((x) => x > t - 300 && x <= t).length;
  }
}

// mỗi user: toàn bộ lịch sử request được phép; thứ tự LRU của user: mảng, cũ nhất ở đầu
class NaiveLimiter {
  limit: number;
  w: number;
  maxUsers: number;
  order: number[] = [];
  hist = new Map<number, number[]>();
  constructor(limit: number, w: number, maxUsers: number) {
    this.limit = limit;
    this.w = w;
    this.maxUsers = maxUsers;
  }
  allow(user: number, t: number) {
    const i = this.order.indexOf(user);
    if (i >= 0) this.order.splice(i, 1);
    else if (this.order.length === this.maxUsers) this.hist.delete(this.order.shift()!);
    this.order.push(user);
    if (!this.hist.has(user)) this.hist.set(user, []);
    const h = this.hist.get(user)!;
    if (h.filter((x) => x >= t - this.w + 1).length >= this.limit) return false;
    h.push(t);
    return true;
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class HitCounter {\n  HitCounter()\n  void hit(int timestamp)\n  int getHits(int timestamp)\n}',
    title: 'Hit counter (300 giây)',
    ref: S.HitCounter,
    brute: NaiveHits,
    cases: [
      {
        args: [['HitCounter', 'hit', 'hit', 'hit', 'getHits', 'hit', 'getHits', 'getHits'], [[], [1], [2], [3], [4], [300], [300], [301]]],
        expected: [null, null, null, null, 3, null, 4, 3],
        note: 'ví dụ LeetCode 362',
      },
      { args: [['HitCounter', 'hit', 'hit', 'getHits', 'getHits'], [[], [1], [1], [300], [301]]], expected: [null, null, null, 2, 0], note: 'cửa sổ (t−300, t]: giây 1 hết hạn ở t=301' },
      { args: [['HitCounter', 'hit', 'hit', 'getHits', 'hit', 'getHits'], [[], [1], [301], [301], [601], [601]]], expected: [null, null, null, 1, null, 1], note: 'hai giây khác nhau cùng ô vòng (1 và 301 cùng 1 mod 300)' },
      { args: [['HitCounter', 'hit', 'getHits', 'getHits'], [[], [1000000000], [1000000000], [1000000299]]], expected: [null, null, 1, 1], note: 'timestamp lớn (vừa int)' },
    ],
    gen: (n, r: Rng) => {
      let t = 1;
      return genOps('HitCounter', [], Math.max(1, n), () => {
        t += r.int(0, n <= 200 ? 90 : 1);
        return r.bool(0.6) ? ['hit', [t]] : ['getHits', [t]];
      });
    },
    stress: { maxN: 80 },
    // ngây thơ: getHits quét toàn bộ lịch sử (~5·10⁴ hit) cho ~4·10⁴ truy vấn
    perf: { n: 1e5, limitMs: 200 },
  },
  '02': {
    sig: 'class PerUserLimiter {\n  PerUserLimiter(int limit, int windowSec, int maxUsers)\n  boolean allow(int user, int t)\n}',
    title: 'Rate limiter theo user, bộ nhớ có giới hạn',
    ref: S.PerUserLimiter,
    brute: NaiveLimiter,
    cases: [
      {
        args: [['PerUserLimiter', 'allow', 'allow', 'allow', 'allow', 'allow'], [[2, 10, 5], [1, 1], [1, 2], [1, 3], [1, 11], [1, 12]]],
        expected: [null, true, true, false, true, true],
        note: 'limit 2 / 10s: t=3 bị chặn; t=11 cửa sổ [2,11] chỉ còn request t=2 → được',
      },
      { args: [['PerUserLimiter', 'allow', 'allow', 'allow'], [[1, 5, 1], [7, 100], [7, 104], [7, 105]]], expected: [null, true, false, true], note: 'cửa sổ [t−4, t]: t=104 còn thấy 100; t=105 thì không' },
      {
        args: [['PerUserLimiter', 'allow', 'allow', 'allow', 'allow'], [[1, 100, 1], [1, 0], [2, 1], [1, 2], [1, 3]]],
        expected: [null, true, true, true, false],
        note: 'maxUsers=1: user 2 đuổi user 1; user 1 quay lại mất lịch sử nên được phép',
      },
      {
        args: [['PerUserLimiter', 'allow', 'allow', 'allow', 'allow', 'allow'], [[1, 100, 2], [1, 0], [2, 1], [1, 2], [3, 3], [1, 4]]],
        expected: [null, true, true, false, true, false],
        note: 'cuộc gọi bị từ chối vẫn chạm user 1 → user 3 đuổi user 2 (không phải user 1); user 1 vẫn bị chặn',
      },
    ],
    gen: (n, r: Rng) => {
      const small = n <= 200;
      const limit = small ? r.int(1, 3) : 3;
      const w = small ? r.int(1, 6) : 20;
      const maxUsers = small ? r.int(1, 4) : 8000;
      const users = small ? 6 : 12000;
      let t = 0;
      return genOps('PerUserLimiter', [limit, w, maxUsers], Math.max(1, n), () => {
        t += r.int(0, small ? 2 : 1);
        return ['allow', [r.int(0, users), t]];
      });
    },
    stress: { maxN: 80 },
    // ngây thơ: tìm user bằng indexOf trên danh sách ~8·10³ user → ~10⁹ bước
    perf: { n: 1e5, limitMs: 300 },
  },
};
