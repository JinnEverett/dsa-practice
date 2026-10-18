import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

// ─── brute: giữ lịch sử đầy đủ, không tối ưu ───
class BFixed {
  l: number;
  w: number;
  c = new Map<string, number>();
  constructor(l: number, w: number) {
    this.l = l;
    this.w = w;
  }
  allow(u: string, t: number) {
    const key = `${u}|${Math.floor(t / this.w)}`;
    const n = this.c.get(key) ?? 0;
    if (n >= this.l) return false;
    this.c.set(key, n + 1);
    return true;
  }
}
class BLog {
  l: number;
  w: number;
  h = new Map<string, number[]>();
  constructor(l: number, w: number) {
    this.l = l;
    this.w = w;
  }
  allow(u: string, t: number) {
    const arr = this.h.get(u) ?? [];
    const inWin = arr.filter((x) => x > t - this.w).length;
    if (inWin >= this.l) return false;
    arr.push(t);
    this.h.set(u, arr);
    return true;
  }
}
class BCounter {
  l: number;
  w: number;
  c = new Map<string, number>();
  constructor(l: number, w: number) {
    this.l = l;
    this.w = w;
  }
  allow(u: string, t: number) {
    const k = Math.floor(t / this.w);
    const cur = this.c.get(`${u}|${k}`) ?? 0;
    const prev = this.c.get(`${u}|${k - 1}`) ?? 0;
    const elapsed = t % this.w;
    if (cur + Math.floor((prev * (this.w - elapsed)) / this.w) >= this.l) return false;
    this.c.set(`${u}|${k}`, cur + 1);
    return true;
  }
}
class BBucket {
  cap: number;
  rate: number;
  s = new Map<string, [number, number]>();
  constructor(c: number, r: number) {
    this.cap = c;
    this.rate = r;
  }
  allow(u: string, t: number) {
    let [milli, last] = this.s.get(u) ?? [this.cap * 1000, t];
    milli = Math.min(this.cap * 1000, milli + (t - last) * this.rate);
    last = t;
    let ok = false;
    if (milli >= 1000) {
      milli -= 1000;
      ok = true;
    }
    this.s.set(u, [milli, last]);
    return ok;
  }
}

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

/** Chuỗi allow(user, t) với t không giảm. users: số user; step: bước thời gian tối đa. */
const reqGen = (name: string, ctorArgs: any[], n: number, r: Rng, users: number, step: number) => {
  let t = r.int(0, 50);
  return opsGen(name, ctorArgs, Math.max(1, n), () => {
    t += r.int(0, step);
    return ['allow', ['u' + r.int(0, users - 1), t]];
  });
};

/** Ví dụ trong đề: [ops, args] từ danh sách (user, t). */
const seq = (name: string, ctorArgs: any[], reqs: [string, number][]) => [
  [name, ...reqs.map(() => 'allow')],
  [ctorArgs, ...reqs.map(([u, t]) => [u, t])],
];
const nulls = (exp: boolean[]) => [null, ...exp];

const T = true;
const F = false;

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class FixedWindowLimiter {\n  FixedWindowLimiter(int limit, long windowMs)\n  boolean allow(String user, long nowMs)\n}',
    title: 'Fixed window limiter',
    ref: S.FixedWindowLimiter,
    brute: BFixed,
    cases: [
      { args: seq('FixedWindowLimiter', [2, 1000], [['a', 0], ['a', 999], ['a', 999], ['b', 999], ['a', 1000]]), expected: nulls([T, T, F, T, T]) },
      { args: seq('FixedWindowLimiter', [1, 10], [['a', 5], ['a', 9], ['a', 10], ['a', 19], ['a', 20]]), expected: nulls([T, F, T, F, T]), note: 'cửa sổ = floor(t / W): [0,10), [10,20), ...' },
      { args: seq('FixedWindowLimiter', [3, 1000], [['a', 1700000000000], ['a', 1700000000999], ['a', 1700000001000]]), expected: nulls([T, T, T]), note: 'epoch ms: đừng dùng int' },
    ],
    gen: (n, r) => reqGen('FixedWindowLimiter', [r.int(1, 4), r.int(1, 15)], n, r, 3, 6),
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'class SlidingLogLimiter {\n  SlidingLogLimiter(int limit, long windowMs)\n  boolean allow(String user, long nowMs)\n}',
    title: 'Sliding window log',
    ref: S.SlidingLogLimiter,
    brute: BLog,
    cases: [
      { args: seq('SlidingLogLimiter', [2, 1000], [['a', 0], ['a', 500], ['a', 999], ['a', 1000], ['a', 1500], ['a', 1501]]), expected: nulls([T, T, F, T, T, F]), note: 'request ở t=0 rời cửa sổ tại t=1000 (khoảng (t−W, t])' },
      { args: seq('SlidingLogLimiter', [1, 5], [['a', 0], ['a', 1], ['a', 2], ['a', 5]]), expected: nulls([T, F, F, T]), note: 'request bị từ chối KHÔNG được ghi vào log' },
      { args: seq('SlidingLogLimiter', [2, 10], [['a', 0], ['b', 0], ['a', 0], ['b', 0], ['a', 0]]), expected: nulls([T, T, T, T, F]), note: 'mỗi user có log riêng' },
    ],
    gen: (n, r) => reqGen('SlidingLogLimiter', n > 200 ? [3000, 20000] : [r.int(1, 4), r.int(1, 15)], n, r, n > 200 ? 3 : 3, n > 200 ? 2 : 6),
    // bản ngây thơ lọc cả log (≤ 3000 phần tử) ở mỗi request
    perf: { n: 1e5, limitMs: 150 },
  },
  '03': {
    sig: 'class SlidingCounterLimiter {\n  SlidingCounterLimiter(int limit, long windowMs)\n  boolean allow(String user, long nowMs)\n}',
    title: 'Sliding window counter',
    ref: S.SlidingCounterLimiter,
    brute: BCounter,
    cases: [
      {
        args: seq('SlidingCounterLimiter', [4, 1000], [
          ['a', 100], ['a', 200], ['a', 300], ['a', 400], ['a', 500],
          ['a', 1500], ['a', 1500], ['a', 1500],
          ['a', 1900], ['a', 1900], ['a', 1900],
        ]),
        expected: nulls([T, T, T, T, F, T, T, F, T, T, F]),
        note: 'ước lượng = cur + floor(prev · (W − elapsed) / W)',
      },
      { args: seq('SlidingCounterLimiter', [2, 1000], [['a', 100], ['a', 200], ['a', 3100], ['a', 3100], ['a', 3100]]), expected: nulls([T, T, T, T, F]), note: 'nhảy qua ≥ 2 cửa sổ: prev = 0' },
    ],
    gen: (n, r) => reqGen('SlidingCounterLimiter', [r.int(1, 5), r.int(1, 20)], n, r, 2, 8),
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'class TokenBucket {\n  TokenBucket(int capacity, int refillPerSec)\n  boolean allow(String user, long nowMs)\n}',
    title: 'Token bucket',
    ref: S.TokenBucket,
    brute: BBucket,
    cases: [
      { args: seq('TokenBucket', [2, 1], [['u', 0], ['u', 0], ['u', 0], ['u', 500], ['u', 1000], ['u', 1000]]), expected: nulls([T, T, F, F, T, F]), note: 'thùng đầy lúc đầu; 500ms nạp 0,5 token' },
      { args: seq('TokenBucket', [2, 1], [['u', 0], ['u', 0], ['u', 100000], ['u', 100000], ['u', 100000]]), expected: nulls([T, T, T, T, F]), note: 'nghỉ lâu: chặn trần ở capacity' },
      { args: seq('TokenBucket', [1, 1000], [['a', 5], ['a', 5], ['a', 6], ['b', 6], ['b', 6]]), expected: nulls([T, F, T, T, F]), note: 'mỗi user một thùng, bắt đầu đầy tại lần gọi đầu' },
    ],
    gen: (n, r) => reqGen('TokenBucket', [r.int(1, 5), r.int(1, 40)], n, r, 3, 400),
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'int[] compareLimiters(int limit, long windowMs, int refillPerSec, long[] timesMs)',
    title: 'So sánh 4 limiter bằng burst',
    ref: S.compareLimiters,
    brute: (limit: number, w: number, refill: number, times: number[]) => {
      const out: number[] = [];
      const burst: number[] = [];
      for (const L of [new BFixed(limit, w), new BLog(limit, w), new BCounter(limit, w), new BBucket(limit, refill)]) {
        const ok = times.filter((t) => L.allow('u', t));
        out.push(ok.length);
        burst.push(Math.max(0, ...ok.map((t) => ok.filter((x) => x > t - w && x <= t).length)));
      }
      return [...out, ...burst];
    },
    cases: [
      { args: [2, 1000, 2, [900, 950, 1000, 1050, 1100]], expected: [4, 2, 3, 2, 4, 2, 3, 2], note: 'fixed cho 4 request trong 150 ms ở ranh giới cửa sổ' },
      { args: [3, 1000, 1, []], expected: [0, 0, 0, 0, 0, 0, 0, 0] },
      { args: [1, 100, 10, [0, 0, 0]], expected: [1, 1, 1, 1, 1, 1, 1, 1] },
    ],
    gen: (n, r) => {
      const times: number[] = [];
      let t = r.int(0, 50);
      for (let i = 0; i < n; i++) {
        t += r.int(0, 60);
        times.push(t);
      }
      return [r.int(1, 5), r.int(20, 400), r.int(1, 30), times];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
};
