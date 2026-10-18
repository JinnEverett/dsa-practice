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

const key = (p: number[]) => p[0] * 1_000_000 + p[1];
const FIRST = 2_000_000_000_000_000; // cursor trang đầu

/** Tạo `total` bài duy nhất, chia vào k feed, mỗi feed sắp giảm dần theo (ts, id). */
function makeFeeds(total: number, k: number, maxTs: number, r: Rng): number[][][] {
  const ids = r.distinct(total, 0, Math.max(60, 3 * total));
  const feeds: number[][][] = Array.from({ length: k }, () => []);
  for (const id of ids) feeds[r.int(0, k - 1)].push([r.int(1, maxTs), id]);
  for (const f of feeds) f.sort((a, b) => key(b) - key(a));
  return feeds;
}

class BruteFeed {
  all: number[][];
  constructor(feeds: number[][][]) {
    this.all = feeds.flat().sort((a, b) => key(b) - key(a));
  }
  page(cursor: number, limit: number) {
    return this.all.filter((p) => key(p) < cursor).slice(0, limit);
  }
}

const bruteTop = (cnt: Map<string, number>, k: number) =>
  [...cnt].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).slice(0, k).map((e) => e[0]);

class BruteCounter {
  cnt = new Map<string, number>();
  add(s: string) {
    this.cnt.set(s, (this.cnt.get(s) ?? 0) + 1);
  }
  top(k: number) {
    return bruteTop(this.cnt, k);
  }
}

class BruteTrending {
  posts: [string, number][] = [];
  post(tag: string, t: number) {
    this.posts.push([tag, t]);
  }
  top(k: number, t: number) {
    const cnt = new Map<string, number>();
    for (const [tag, pt] of this.posts) if (pt > t - 3_600_000 && pt <= t) cnt.set(tag, (cnt.get(tag) ?? 0) + 1);
    return bruteTop(cnt, k);
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class FeedMerger {\n  FeedMerger(int[][][] feeds)\n  int[][] page(long cursor, int limit)\n}',
    title: 'Feed gộp với cursor',
    ref: S.FeedMerger,
    brute: BruteFeed,
    cases: [
      {
        args: [
          ['FeedMerger', 'page', 'page', 'page'],
          [[[[[50, 3], [20, 1]], [[40, 9], [20, 7], [5, 2]]]], [FIRST, 3], [20000000 + 7 + 0, 10], [5000002, 1]],
        ],
        expected: [null, [[50, 3], [40, 9], [20, 7]], [[20, 1], [5, 2]], []],
        note: 'cursor = key của bài cuối trang trước (20·10⁶+7); cùng ts=20 thì id lớn đứng trước',
      },
      { args: [['FeedMerger', 'page', 'page'], [[[[], []]], [FIRST, 5], [1, 5]]], expected: [null, [], []], note: 'feed rỗng' },
      { args: [['FeedMerger', 'page'], [[[[[1000000000, 999999]]]], [FIRST, 3]]], expected: [null, [[1000000000, 999999]]], note: 'key lớn nhất ≈ 10¹⁵: Java cần long' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const total = Math.max(1, n);
      const feeds = makeFeeds(total, big ? 100 : r.int(1, 4), big ? 1_000_000_000 : 12, r);
      const all = feeds.flat();
      const q = big ? 1000 : Math.max(1, n);
      return opsGen('FeedMerger', [feeds], q, () => {
        const c = r.float();
        const cursor = c < 0.2 ? FIRST : all.length && c < 0.9 ? key(r.pick(all)) : r.int(0, 20_000_000);
        return ['page', [cursor, r.int(1, 10)]];
      });
    },
    // trang đầu mỗi lần gộp + sort cả kho (10⁵ bài) hoặc duyệt tuyến tính từng feed đều quá giờ ở 1000 truy vấn
    perf: { n: 1e5, limitMs: 150 },
  },
  '02': {
    sig: 'List<String> topKFrequentWords(String[] words, int k)',
    title: 'Top K từ thường xuyên nhất',
    ref: S.topKFrequentWords,
    brute: (words: string[], k: number) => {
      const cnt = new Map<string, number>();
      for (const w of words) cnt.set(w, (cnt.get(w) ?? 0) + 1);
      return bruteTop(cnt, k);
    },
    cases: [
      { args: [['i', 'love', 'leetcode', 'i', 'love', 'coding'], 2], expected: ['i', 'love'] },
      { args: [['the', 'day', 'is', 'sunny', 'the', 'the', 'the', 'sunny', 'is', 'is'], 4], expected: ['the', 'is', 'sunny', 'day'] },
      { args: [['b', 'a', 'c'], 5], expected: ['a', 'b', 'c'], note: 'k lớn hơn số từ khác nhau' },
    ],
    gen: (n, r) => {
      const pool = Math.max(3, Math.min(n, 12));
      return [Array.from({ length: Math.max(1, n) }, () => 'w' + r.int(0, pool - 1) + r.pick(['', 'a', 'z'])), r.int(1, 8)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'class TopKCounter {\n  TopKCounter()\n  void add(String item)\n  List<String> top(int k)\n}',
    title: 'TopKCounter',
    ref: S.TopKCounter,
    brute: BruteCounter,
    cases: [
      { args: [['TopKCounter', 'add', 'add', 'add', 'top', 'add', 'top'], [[], ['x'], ['y'], ['x'], [1], ['y'], [2]]], expected: [null, null, null, null, ['x'], null, ['x', 'y']], note: 'hòa count: chữ cái tăng dần' },
      { args: [['TopKCounter', 'top', 'add', 'top'], [[], [3], ['a'], [3]]], expected: [null, [], null, ['a']] },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const pool = big ? 2000 : 6;
      return opsGen('TopKCounter', [], Math.max(1, n), () =>
        r.bool(big ? 0.98 : 0.7) ? ['add', ['it' + r.int(0, pool - 1)]] : ['top', [r.int(1, 10)]],
      );
    },
    // top() sort cả bộ đếm (≈2000 mục) ở mỗi lần gọi (2% = 2000 lần) → quá giờ
    perf: { n: 1e5, limitMs: 400 },
  },
  '04': {
    sig: 'class Trending {\n  Trending()\n  void post(String tag, long t)\n  List<String> top(int k, long t)\n}',
    title: 'Trending trong 1 giờ',
    ref: S.Trending,
    brute: BruteTrending,
    cases: [
      {
        args: [
          ['Trending', 'post', 'post', 'post', 'top', 'top', 'top'],
          [[], ['a', 0], ['b', 1000], ['a', 2000], [2, 3000], [2, 3600000], [2, 3601000]],
        ],
        expected: [null, null, null, null, ['a', 'b'], ['a', 'b'], ['a']],
        note: 'cửa sổ (t − 3 600 000, t]: ở t=3 600 000 bài a@0 đã ra (còn a=1, b=1); ở 3 601 000 bài b@1000 cũng ra',
      },
      { args: [['Trending', 'post', 'top', 'top'], [[], ['a', 0], [1, 3599999], [1, 3600000]]], expected: [null, null, ['a'], []], note: 'thời gian trôi dù không ai đăng' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const step = big ? 2000 : 1_500_000;
      const pool = big ? 300 : 5;
      let t = r.int(0, 100);
      return opsGen('Trending', [], Math.max(1, n), () => {
        t += r.int(0, step);
        return r.bool(big ? 0.9 : 0.6) ? ['post', ['t' + r.int(0, pool - 1), t]] : ['top', [r.int(1, 5), t]];
      });
    },
    perf: { n: 1e5, limitMs: 350 },
  },
  '05': {
    sig: 'long[] mergeTimelines(long[][] streams, int limit)',
    title: 'Gộp timeline k nguồn',
    ref: S.mergeTimelines,
    brute: (streams: number[][], limit: number) => streams.flat().sort((a, b) => a - b).slice(0, limit),
    cases: [
      { args: [[[1, 4, 9], [2, 3, 10], []], 5], expected: [1, 2, 3, 4, 9] },
      { args: [[[5, 5], [5]], 10], expected: [5, 5, 5], note: 'giữ cả giá trị trùng; limit > tổng' },
      { args: [[], 3], expected: [] },
      { args: [[[1000000000000], [999999999999]], 1], expected: [999999999999], note: 'epoch ms: Java cần long' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const k = big ? 1000 : r.int(0, 4);
      const per = big ? Math.floor(n / k) : r.int(0, 6);
      const streams = Array.from({ length: k }, () => r.sorted(per, 0, big ? 1_000_000_000_000 : 20));
      return [streams, big ? 100 : r.int(0, 15)];
    },
    // N = 10⁶ phần tử, limit = 100: gộp hết + sort quá giờ
    perf: { n: 1e6, limitMs: 20 },
  },
};
