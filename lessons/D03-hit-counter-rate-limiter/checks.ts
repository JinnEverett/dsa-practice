import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Ngây thơ: lưu mọi timestamp, getHits lọc toàn bộ. */
class NaiveHitCounter {
  a: number[] = [];
  hit(t: number) {
    this.a.push(t);
  }
  getHits(t: number) {
    return this.a.filter((x) => x > t - 300 && x <= t).length;
  }
}

/** Ngây thơ: mảng user theo thứ tự thấy (cuối = mới nhất) + mọi timestamp được cho phép. */
class NaiveLimiter {
  limit: number;
  w: number;
  max: number;
  order: number[] = [];
  log = new Map<number, number[]>();
  constructor(limit: number, w: number, max: number) {
    this.limit = limit;
    this.w = w;
    this.max = max;
  }
  allow(u: number, t: number) {
    const i = this.order.indexOf(u);
    if (i >= 0) this.order.splice(i, 1);
    else {
      if (this.order.length === this.max) this.log.delete(this.order.shift()!);
      this.log.set(u, []);
    }
    this.order.push(u);
    const l = this.log.get(u)!;
    if (l.filter((x) => x > t - this.w).length >= this.limit) return false;
    l.push(t);
    return true;
  }
}

const tsSteps = [0, 0, 0, 1, 1, 2, 5, 50, 150, 299, 300, 301];

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class HitCounter {\n  HitCounter()\n  void hit(int timestamp)\n  int getHits(int timestamp)\n}',
    title: 'Hit counter 300 giây',
    ref: S.HitCounter,
    brute: NaiveHitCounter,
    cases: [
      {
        args: [
          ['HitCounter', 'hit', 'hit', 'hit', 'getHits', 'hit', 'getHits', 'getHits'],
          [[], [1], [2], [3], [4], [300], [300], [301]],
        ],
        expected: [null, null, null, null, 3, null, 4, 3],
      },
      {
        args: [['HitCounter', 'hit', 'hit', 'getHits', 'getHits'], [[], [1], [1], [300], [301]]],
        expected: [null, null, null, 2, 0],
        note: 'cửa sổ (t − 300, t]: giây 1 còn ở t = 300, hết ở t = 301',
      },
      {
        args: [['HitCounter', 'hit', 'getHits', 'hit', 'getHits'], [[], [2000000000], [2000000000], [2000000299], [2000000299]]],
        expected: [null, null, 1, null, 2],
        note: 'timestamp lớn (vẫn vừa int)',
      },
    ],
    gen: (n, r: Rng) => {
      let t = r.int(0, 1000);
      const ops = ['HitCounter'];
      const args: any[][] = [[]];
      const big = n > 1000;
      for (let i = 0; i < Math.max(1, n); i++) {
        t += big ? r.pick([0, 0, 0, 0, 1]) : r.pick(tsSteps);
        // bản ngây thơ phải quét ~ mọi hit đang lưu: hit trước, hỏi sau
        const hit = big ? r.bool(0.5) : r.bool(0.6);
        ops.push(hit ? 'hit' : 'getHits');
        args.push([t]);
      }
      return [ops, args];
    },
    // ngây thơ lọc O(số hit) mỗi getHits: 5·10⁴ hit × 5·10⁴ lần hỏi
    perf: { n: 1e5, limitMs: 250 },
  },
  '02': {
    sig: 'class PerUserLimiter {\n  PerUserLimiter(int limit, long windowMs, int maxUsers)\n  boolean allow(int user, long t)\n}',
    title: 'Rate limiter theo user',
    ref: S.PerUserLimiter,
    brute: NaiveLimiter,
    cases: [
      {
        args: [
          ['PerUserLimiter', 'allow', 'allow', 'allow', 'allow', 'allow'],
          [[2, 1000, 10], [7, 0], [7, 100], [7, 200], [7, 999], [7, 1000]],
        ],
        expected: [null, true, true, false, false, true],
        note: 'cửa sổ (t − 1000, t]: yêu cầu lúc 0 hết hạn ở t = 1000; yêu cầu bị từ chối không được ghi lại',
      },
      {
        args: [
          ['PerUserLimiter', 'allow', 'allow', 'allow', 'allow'],
          [[1, 1000, 2], [1, 0], [2, 1], [3, 2], [1, 3]],
        ],
        expected: [null, true, true, true, true],
        note: 'maxUsers = 2: user 1 bị evict khi user 3 vào ⇒ được làm mới quota',
      },
      {
        args: [
          ['PerUserLimiter', 'allow', 'allow', 'allow', 'allow', 'allow'],
          [[1, 1000, 2], [1, 0], [2, 1], [1, 2], [3, 3], [1, 4]],
        ],
        expected: [null, true, true, false, true, false],
        note: 'lần bị từ chối vẫn tính là "thấy": user 1 mới hơn user 2 ⇒ user 2 bị evict, user 1 còn giữ lịch sử',
      },
      {
        args: [['PerUserLimiter', 'allow', 'allow'], [[1, 4000000000, 1], [1, 3000000000], [1, 3000000001]]],
        expected: [null, true, false],
        note: 'windowMs và t vượt int (Java cần long)',
      },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      const limit = r.int(1, big ? 5 : 3);
      const windowMs = big ? 1000 : r.int(1, 20);
      const maxUsers = big ? 10000 : r.int(1, 4);
      const users = big ? 50000 : 6;
      let t = r.int(0, 100);
      const ops = ['PerUserLimiter'];
      const args: any[][] = [[limit, windowMs, maxUsers]];
      for (let i = 0; i < Math.max(1, n); i++) {
        t += big ? r.int(0, 1) : r.int(0, 8);
        ops.push('allow');
        args.push([r.int(1, users), t]);
      }
      return [ops, args];
    },
    // ngây thơ tìm user cũ nhất O(maxUsers) mỗi lần evict
    perf: { n: 1e5, limitMs: 300 },
  },
};
