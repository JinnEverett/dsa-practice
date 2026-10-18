import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Ngây thơ: Map id → {at, period}; advance sinh MỌI lần phát ≤ now rồi sắp (at, id). */
class NaiveScheduler {
  m = new Map<number, { at: number; period: number }>();
  schedule(id: number, at: number) {
    this.m.set(id, { at, period: 0 });
  }
  scheduleEvery(id: number, at: number, period: number) {
    this.m.set(id, { at, period });
  }
  cancel(id: number) {
    return this.m.delete(id);
  }
  advance(now: number) {
    const ev: [number, number][] = [];
    for (const [id, j] of [...this.m]) {
      if (j.period === 0) {
        if (j.at <= now) (ev.push([j.at, id]), this.m.delete(id));
      } else {
        while (j.at <= now) (ev.push([j.at, id]), (j.at += j.period));
      }
    }
    return ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((e) => e[1]);
  }
}

/** Ngây thơ: Map taskId → {user, prio}; execTop quét tìm max. */
class NaiveTaskManager {
  m = new Map<number, { user: number; prio: number }>();
  constructor(tasks: number[][]) {
    for (const [u, t, p] of tasks) this.m.set(t, { user: u, prio: p });
  }
  add(u: number, t: number, p: number) {
    this.m.set(t, { user: u, prio: p });
  }
  edit(t: number, p: number) {
    this.m.get(t)!.prio = p;
  }
  rmv(t: number) {
    this.m.delete(t);
  }
  execTop() {
    let bt = -1;
    let bp = -Infinity;
    for (const [t, x] of this.m) if (x.prio > bp || (x.prio === bp && t > bt)) ((bt = t), (bp = x.prio));
    if (bt < 0) return -1;
    const u = this.m.get(bt)!.user;
    this.m.delete(bt);
    return u;
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class TaskScheduler {\n  TaskScheduler()\n  void schedule(int id, long at)\n  void scheduleEvery(int id, long at, long period)\n  boolean cancel(int id)\n  List<Integer> advance(long now)\n}',
    title: 'Task scheduler (hẹn giờ, hủy, lặp lại)',
    ref: S.TaskScheduler,
    brute: NaiveScheduler,
    cases: [
      {
        args: [
          ['TaskScheduler', 'schedule', 'schedule', 'schedule', 'cancel', 'cancel', 'advance', 'advance', 'advance'],
          [[], [1, 10], [2, 5], [3, 10], [2], [9], [9], [10], [100]],
        ],
        expected: [null, null, null, null, true, false, [], [1, 3], []],
        note: 'cùng thời điểm → id nhỏ trước; hủy; advance xóa việc đã phát',
      },
      {
        args: [
          ['TaskScheduler', 'scheduleEvery', 'advance', 'advance', 'cancel', 'advance'],
          [[], [7, 10, 5], [9], [22], [7], [100]],
        ],
        expected: [null, null, [], [7, 7, 7], true, []],
        note: 'lặp: phát ở 10, 15, 20 khi advance(22); hủy dừng hẳn',
      },
      {
        args: [
          ['TaskScheduler', 'schedule', 'schedule', 'advance', 'scheduleEvery', 'scheduleEvery', 'advance'],
          [[], [1, 50], [1, 5], [10], [2, 20, 10], [3, 20, 10], [40]],
        ],
        expected: [null, null, null, [1], null, null, [2, 3, 2, 3, 2, 3]],
        note: 'lên lịch lại cùng id thay thế việc cũ (không phát hai lần); hai việc lặp cùng nhịp: (thời điểm, id)',
      },
      {
        args: [['TaskScheduler', 'schedule', 'advance'], [[], [1, 9000000000], [9000000000]]],
        expected: [null, null, [1]],
        note: 'thời điểm vượt int (Java: long)',
      },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      const ids = big ? 50000 : 6;
      const total = Math.max(1, n);
      const ops = ['TaskScheduler'];
      const args: any[][] = [[]];
      let now = 0;
      for (let i = 0; i < total; i++) {
        const p = r.float();
        const horizon = big ? 100000 : 30;
        if (p < (big ? 0.5 : 0.35)) {
          if (r.bool(big ? 0.02 : 0.2)) {
            ops.push('scheduleEvery');
            args.push([r.int(1, ids), now + r.int(0, horizon), big ? r.int(5000, 50000) : r.int(1, 12)]);
          } else {
            ops.push('schedule');
            args.push([r.int(1, ids), now + r.int(0, horizon)]);
          }
        } else if (p < (big ? 0.75 : 0.55)) {
          ops.push('cancel');
          args.push([r.int(1, ids)]);
        } else {
          now += r.int(0, big ? 3 : 6);
          ops.push('advance');
          args.push([now]);
        }
      }
      return [ops, args];
    },
    // ngây thơ: advance quét mọi việc đang chờ (~2·10⁴)
    perf: { n: 1e5, limitMs: 400 },
  },
  '02': {
    sig: 'class TaskManager {\n  TaskManager(int[][] tasks)\n  void add(int userId, int taskId, int priority)\n  void edit(int taskId, int newPriority)\n  void rmv(int taskId)\n  int execTop()\n}',
    title: 'Task manager (ưu tiên, sửa, xóa)',
    ref: S.TaskManager,
    brute: NaiveTaskManager,
    cases: [
      {
        args: [
          ['TaskManager', 'add', 'edit', 'execTop', 'rmv', 'add', 'execTop'],
          [[[[1, 101, 10], [2, 102, 20], [3, 103, 15]]], [4, 104, 5], [102, 8], [], [101], [5, 105, 15], []],
        ],
        expected: [null, null, null, 3, null, null, 5],
        note: 'ví dụ LeetCode 3408: sau edit(102 → 8), task 103 (ưu tiên 15) cao nhất → user 3; sau rmv(101) và add(105, ưu tiên 15) → user 5',
      },
      {
        args: [['TaskManager', 'execTop', 'add', 'execTop', 'execTop'], [[[]], [], [7, 1, 3], [], []]],
        expected: [null, -1, null, 7, -1],
        note: 'rỗng → −1',
      },
      {
        args: [
          ['TaskManager', 'execTop', 'edit', 'execTop', 'execTop'],
          [[[[1, 5, 10], [2, 9, 10], [3, 7, 10]]], [], [5, 3], [], []],
        ],
        expected: [null, 2, null, 3, 1],
        note: 'hòa ưu tiên 10 → taskId lớn hơn trước (9 → user 2), rồi edit(5 → 3) khiến task 7 (user 3) đi trước task 5 (user 1)',
      },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      let nextTask = 1;
      const alive: number[] = [];
      const posOf = new Map<number, number>();
      const track = (t: number) => (posOf.set(t, alive.length), alive.push(t));
      const untrack = (t: number) => {
        const k = posOf.get(t)!;
        const last = alive[alive.length - 1];
        alive[k] = last;
        posOf.set(last, k);
        alive.pop();
        posOf.delete(t);
      };
      const initial: number[][] = [];
      const initCount = big ? 20000 : r.int(0, 4);
      const prioMax = big ? 1000000 : 4;
      // userId = taskId để biết execTop đã chạy task nào; `sim` giữ trạng thái "thật" nhằm sinh thao tác hợp lệ
      for (let i = 0; i < initCount; i++) {
        initial.push([nextTask, nextTask, r.int(0, prioMax)]);
        track(nextTask++);
      }
      const sim: any = big ? new S.TaskManager(initial) : new NaiveTaskManager(initial);
      const ops = ['TaskManager'];
      const args: any[][] = [[initial]];
      const total = Math.max(1, n);
      for (let i = 0; i < total; i++) {
        const p = r.float();
        if (alive.length === 0 || p < 0.25) {
          const pr = r.int(0, prioMax);
          ops.push('add');
          args.push([nextTask, nextTask, pr]);
          sim.add(nextTask, nextTask, pr);
          track(nextTask++);
        } else if (p < 0.5) {
          const t = alive[r.int(0, alive.length - 1)];
          const pr = r.int(0, prioMax);
          ops.push('edit');
          args.push([t, pr]);
          sim.edit(t, pr);
        } else if (p < 0.6) {
          const t = alive[r.int(0, alive.length - 1)];
          ops.push('rmv');
          args.push([t]);
          sim.rmv(t);
          untrack(t);
        } else {
          ops.push('execTop');
          args.push([]);
          const u = sim.execTop();
          if (u >= 0) untrack(u);
        }
      }
      return [ops, args];
    },
    // ngây thơ: execTop quét mọi task
    perf: { n: 1e5, limitMs: 400 },
  },
};
