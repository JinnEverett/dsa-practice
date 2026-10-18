import type { Spec } from '../../tools/spec.ts';
import { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

class NaiveLeaderboard {
  m = new Map<number, number>();
  addScore(id: number, s: number) {
    this.m.set(id, (this.m.get(id) ?? 0) + s);
  }
  top(k: number) {
    return [...this.m.values()].sort((a, b) => b - a).slice(0, k).reduce((x, y) => x + y, 0);
  }
  reset(id: number) {
    this.m.delete(id);
  }
}

class NaiveRankBoard {
  m = new Map<number, number>();
  order() {
    return [...this.m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map((e) => e[0]);
  }
  update(p: number, s: number) {
    this.m.set(p, s);
  }
  rank(p: number) {
    const i = this.order().indexOf(p);
    return i < 0 ? -1 : i + 1;
  }
  top(k: number) {
    return this.order().slice(0, k);
  }
}


/** Case lớn (> 1024 phần tử) để chạm vào đường tách/xóa khối của SortedKeys, mà stress n ≤ 30 không với tới. */
const bigAddResetLeaderboard = () => {
  const r = new Rng(5);
  const ops = ['Leaderboard'];
  const args: any[][] = [[]];
  const N = 3000;
  for (let id = 1; id <= N; id++) (ops.push('addScore'), args.push([id, r.int(1, 10000)]));
  for (let i = 0; i < 400; i++) (ops.push('addScore'), args.push([r.int(1, N), r.int(1, 10000)]));
  ops.push('top'), args.push([100]);
  const order = Array.from({ length: N }, (_, i) => i + 1);
  r.shuffle(order);
  for (let i = 0; i < N - 40; i++) {
    ops.push('reset'), args.push([order[i]]);
    if (i % 500 === 0) (ops.push('top'), args.push([20]));
  }
  ops.push('top'), args.push([40]);
  return [ops, args];
};

const genRankBoard = (n: number, r: Rng) => {
    const big = n > 1000;
    const ids = big ? 50000 : 7;
    const maxScore = big ? 1e9 : 4;
    const ops = ['RankBoard'];
    const args: any[][] = [[]];
    const total = Math.max(1, n);
    for (let i = 0; i < total; i++) {
      const p = r.float();
      if ((big && i < total * 0.3) || p < 0.4) {
        ops.push('update');
        args.push([r.int(1, ids), r.int(0, maxScore)]);
      } else if (p < 0.8) {
        ops.push('rank');
        args.push([r.int(1, ids)]);
      } else {
        ops.push('top');
        args.push([r.int(0, big ? 100 : 8)]);
      }
    }
    return [ops, args];
  };

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class Leaderboard {\n  Leaderboard()\n  void addScore(int playerId, int score)\n  long top(int K)\n  void reset(int playerId)\n}',
    title: 'Leaderboard (tổng K điểm cao nhất)',
    ref: S.Leaderboard,
    brute: NaiveLeaderboard,
    cases: [
      {
        args: [
          ['Leaderboard', 'addScore', 'addScore', 'addScore', 'addScore', 'addScore', 'top', 'reset', 'reset', 'addScore', 'top'],
          [[], [1, 73], [2, 56], [3, 39], [4, 51], [5, 4], [1], [1], [2], [2, 51], [3]],
        ],
        expected: [null, null, null, null, null, null, 73, null, null, null, 141],
      },
      {
        args: [['Leaderboard', 'addScore', 'addScore', 'addScore', 'top', 'addScore', 'top'], [[], [7, 5], [7, 5], [9, 9], [2], [9, 1], [1]]],
        expected: [null, null, null, null, 19, null, 10],
        note: 'addScore cộng dồn; top(2) cộng cả hai người',
      },
      {
        args: [['Leaderboard', 'addScore', 'addScore', 'top'], [[], [1, 10000], [2, 10000], [2]]],
        expected: [null, null, null, 20000],
      },
      { args: bigAddResetLeaderboard(), note: '3 000 người chơi, rồi reset gần hết (tách và xóa khối)' },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      const ids = big ? 50000 : 6;
      const present = new Set<number>();
      const ops = ['Leaderboard'];
      const args: any[][] = [[]];
      const total = Math.max(1, n);
      for (let i = 0; i < total; i++) {
        const p = r.float();
        if (present.size === 0 || (big && i < total * 0.3) || p < 0.5) {
          const id = r.int(1, ids);
          present.add(id);
          ops.push('addScore');
          args.push([id, r.int(1, big ? 10000 : 20)]);
        } else if (p < 0.65) {
          const id = r.int(1, ids);
          if (present.has(id)) {
            present.delete(id);
            ops.push('reset');
            args.push([id]);
          } else {
            ops.push('top');
            args.push([r.int(1, Math.min(present.size, 100))]);
          }
        } else {
          ops.push('top');
          args.push([r.int(1, Math.min(present.size, big ? 100 : 6))]);
        }
      }
      return [ops, args];
    },
    // ngây thơ sort/quét mọi người chơi mỗi lần top: ~3·10⁴ top × 5·10⁴ người
    perf: { n: 1e5, limitMs: 400 },
  },
  '02': {
    sig: 'class RankBoard {\n  RankBoard()\n  void update(int player, int score)\n  int rank(int player)\n  List<Integer> top(int k)\n}',
    title: 'Bảng xếp hạng (rank + top-k)',
    ref: S.RankBoard,
    brute: NaiveRankBoard,
    cases: [
      {
        args: [
          ['RankBoard', 'update', 'update', 'update', 'rank', 'rank', 'rank', 'rank', 'top', 'update', 'top', 'rank'],
          [[], [10, 50], [20, 80], [30, 50], [20], [10], [30], [99], [2], [30, 100], [5], [10]],
        ],
        expected: [null, null, null, null, 1, 2, 3, -1, [20, 10], null, [30, 20, 10], 3],
        note: 'hòa điểm → id nhỏ hơn đứng trước; người lạ → −1; top(k) khi k > số người → trả hết',
      },
      {
        args: [['RankBoard', 'update', 'update', 'rank', 'update', 'rank', 'top'], [[], [1, 5], [2, 9], [1], [1, 9], [1], [2]]],
        expected: [null, null, null, 2, null, 1, [1, 2]],
        note: 'update ĐẶT điểm (không cộng), hòa 9–9 → id 1 trước',
      },
      { args: [['RankBoard', 'top', 'rank'], [[], [3], [1]]], expected: [null, [], -1], note: 'bảng rỗng' },
      { args: genRankBoard(6000, new Rng(9)), note: '6 000 thao tác (hàng nghìn người: tách khối)' },
    ],
    gen: genRankBoard,
    // ngây thơ sort toàn bộ mỗi lần rank/top
    perf: { n: 1e5, limitMs: 400 },
  },
};
