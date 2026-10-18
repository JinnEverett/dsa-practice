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

class BruteDelay {
  jobs: { id: number; at: number; pr: number }[] = [];
  schedule(id: number, at: number, pr: number) {
    this.jobs.push({ id, at, pr });
  }
  poll(now: number) {
    const due = this.jobs.filter((j) => j.at <= now).sort((a, b) => a.at - b.at || b.pr - a.pr || a.id - b.id);
    this.jobs = this.jobs.filter((j) => j.at > now);
    return due.map((j) => j.id);
  }
}

class BruteWheel {
  S: number;
  now = 0;
  timers: { id: number; at: number }[] = [];
  constructor(s: number) {
    this.S = s;
  }
  add(id: number, d: number) {
    this.timers.push({ id, at: this.now + d });
  }
  tick() {
    this.now++;
    const fired = this.timers.filter((t) => t.at === this.now).map((t) => t.id);
    this.timers = this.timers.filter((t) => t.at !== this.now);
    return fired;
  }
}

/** Cron rút gọn: duyệt từng phút (đúng nhưng chậm) — độc lập với cách tính theo tập của ref. */
function bruteCron(cron: string, minute: number): number {
  const [mf, hf] = cron.split(' ');
  const match = (f: string, v: number, limit: number) => {
    if (f === '*') return true;
    if (f.startsWith('*/')) return v % Number(f.slice(2)) === 0;
    return f.split(',').map(Number).includes(v);
  };
  for (let t = minute + 1; ; t++) {
    if (match(mf, t % 60, 60) && match(hf, Math.floor(t / 60) % 24, 24)) return t;
  }
}

/** Mô phỏng từng đơn vị thời gian — "hiển nhiên đúng", rất chậm khi thời gian dài. */
function bruteSim(workers: number, jobs: number[][]): number[] {
  const n = jobs.length;
  const fin = new Array<number>(n).fill(-1);
  const state = jobs.map((j) => ({ ready: j[0], attempt: 0, running: false, end: 0 }));
  let free = workers;
  for (let t = 0; fin.some((x) => x < 0); t++) {
    for (let i = 0; i < n; i++) {
      const s = state[i];
      if (s.running && s.end <= t) {
        s.running = false;
        free++;
        if (s.attempt < jobs[i][3]) {
          s.ready = s.end + 10 * 2 ** s.attempt;
          s.attempt++;
        } else fin[i] = s.end;
      }
    }
    const cand = state.map((s, i) => ({ s, i })).filter(({ s, i }) => fin[i] < 0 && !s.running && s.ready <= t);
    cand.sort((a, b) => jobs[b.i][1] - jobs[a.i][1] || a.s.ready - b.s.ready || a.i - b.i);
    for (const { s, i } of cand) {
      if (free === 0) break;
      free--;
      s.running = true;
      s.end = t + jobs[i][2];
    }
  }
  return fin;
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class DelayQueue {\n  DelayQueue()\n  void schedule(int id, long runAt, int priority)\n  List<Integer> poll(long now)\n}',
    title: 'Delay queue',
    ref: S.DelayQueue,
    brute: BruteDelay,
    cases: [
      {
        args: [
          ['DelayQueue', 'schedule', 'schedule', 'schedule', 'schedule', 'poll', 'poll', 'poll'],
          [[], [1, 100, 0], [2, 50, 0], [3, 50, 5], [4, 200, 9], [49], [60], [1000]],
        ],
        expected: [null, null, null, null, null, [], [3, 2], [1, 4]],
        note: 'cùng runAt: priority cao trước; poll xóa job đã trả',
      },
      { args: [['DelayQueue', 'schedule', 'schedule', 'poll'], [[], [7, 10, 1], [5, 10, 1], [10]]], expected: [null, null, null, [5, 7]], note: 'hòa tất cả: id nhỏ trước' },
      { args: [['DelayQueue', 'poll', 'schedule', 'poll', 'poll'], [[], [5], [1, 3, 0], [3], [4]]], expected: [null, [], null, [1], []] },
    ],
    gen: (n, r) => {
      let now = 0;
      let id = 0;
      return opsGen('DelayQueue', [], Math.max(1, n), () => {
        now += r.int(0, 2);
        if (r.bool(0.7)) return ['schedule', [id++, now + r.int(-3, n > 200 ? 30000 : 12), r.int(0, 3)]];
        return ['poll', [now]];
      });
    },
    // bản ngây thơ sort + lọc toàn bộ job đang chờ (~10⁴) ở mỗi poll
    perf: { n: 1e5, limitMs: 150 },
  },
  '02': {
    sig: 'long[] retrySchedule(int attempts, long baseMs, long capMs, long deadlineMs)',
    title: 'Lịch retry exponential backoff',
    ref: S.retrySchedule,
    brute: (attempts: number, base: number, cap: number, deadline: number) => {
      // BigInt: không tràn, tính thẳng base · 2^i
      const out: number[] = [];
      let t = 0n;
      for (let i = 0; i < attempts; i++) {
        let d = BigInt(base) * 2n ** BigInt(i);
        if (d > BigInt(cap)) d = BigInt(cap);
        t += d;
        if (t > BigInt(deadline)) break;
        out.push(Number(t));
      }
      return out;
    },
    cases: [
      { args: [5, 100, 1000, 100000], expected: [100, 300, 700, 1500, 2500] },
      { args: [6, 1000, 5000, 12000], expected: [1000, 3000, 7000, 12000], note: 'dừng khi mốc kế (17000) vượt deadline; mốc = deadline vẫn được lấy' },
      { args: [100, 1, 1000000000000, 1000000000000], expected: undefined as any, note: 'attempts lớn: không tràn' },
      { args: [3, 500, 100, 10000], expected: [100, 200, 300], note: 'cap < base: chặn ngay từ lần đầu' },
      { args: [0, 100, 1000, 10000], expected: [] },
    ].map((c) => (c.expected === undefined ? { args: c.args, note: c.note } : c)),
    gen: (n, r) => [r.int(0, Math.min(100, n + 3)), r.int(1, 1000), r.int(1, 1e9), r.int(0, 1e9 * 5)],
    perf: false,
  },
  '03': {
    sig: 'class TimerWheel {\n  TimerWheel(int slots)\n  void add(int id, int delayTicks)\n  List<Integer> tick()\n}',
    title: 'Timer wheel',
    ref: S.TimerWheel,
    brute: BruteWheel,
    cases: [
      {
        args: [
          ['TimerWheel', 'add', 'add', 'add', 'tick', 'tick', 'tick', 'tick', 'tick'],
          [[4], [1, 2], [2, 2], [3, 5], [], [], [], [], []],
        ],
        expected: [null, null, null, null, [], [1, 2], [], [], [3]],
        note: 'delay 5 > slots 4: nổ ở vòng thứ hai; cùng tick thì theo thứ tự add',
      },
      { args: [['TimerWheel', 'add', 'tick', 'add', 'tick', 'tick'], [[3], [1, 3], [], [2, 1], [], []]], expected: [null, null, [], null, [2], [1]], note: 'add giữa chừng: delay tính từ thời điểm hiện tại' },
      { args: [['TimerWheel', 'add', 'tick', 'tick', 'tick', 'tick'], [[2], [9, 4], [], [], [], []]], expected: [null, null, [], [], [], [9]], note: 'delay = 2 · slots' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const slots = big ? 1000 : r.int(1, 5);
      let pending = 0;
      let id = 0;
      return opsGen('TimerWheel', [slots], Math.max(1, n), () => {
        if (r.bool(big ? 0.45 : 0.5)) {
          pending++;
          return ['add', [id++, r.int(1, big ? 50000 : 12)]];
        }
        return ['tick', []];
      });
    },
    // bản ngây thơ quét mọi timer đang chờ (~2·10⁴) ở mỗi tick
    perf: { n: 1e5, limitMs: 150 },
  },
  '04': {
    sig: 'long nextRun(String cron, long minute)',
    title: 'Lần chạy kế tiếp của cron',
    ref: S.nextRun,
    brute: bruteCron,
    cases: [
      { args: ['*/15 *', 0], expected: 15 },
      { args: ['0 9', 0], expected: 540, note: '09:00 ngày đầu' },
      { args: ['0 9', 540], expected: 1980, note: 'đúng phút vừa chạy → lần kế là ngày hôm sau (1440 + 540)' },
      { args: ['30,45 2,14', 150], expected: 165, note: '02:30 → 02:45' },
      { args: ['30,45 2,14', 165], expected: 870, note: '02:45 → 14:30' },
      { args: ['5 23', 1439], expected: 2825, note: '23:59 → 23:05 hôm sau (1440 + 23·60 + 5)' },
      { args: ['* *', 1000000000000], expected: 1000000000001 },
    ],
    gen: (n, r) => {
      const field = (limit: number, steps: number[]) => {
        const k = r.int(0, 2);
        if (k === 0) return '*';
        if (k === 1) return '*/' + r.pick(steps);
        const vals = r.distinct(r.int(1, 3), 0, limit - 1);
        return vals.join(',');
      };
      return [`${field(60, [1, 5, 7, 15, 30, 59])} ${field(24, [1, 2, 5, 12, 23])}`, r.int(0, 1_000_000_000_000)];
    },
    perf: false,
  },
  '05': {
    sig: 'long[] simulateJobQueue(int workers, int[][] jobs)',
    title: 'Mô phỏng job queue có ưu tiên + retry',
    ref: S.simulateJobQueue,
    brute: bruteSim,
    cases: [
      { args: [1, [[0, 1, 5, 0], [0, 9, 3, 0], [1, 5, 2, 0]]], expected: [10, 3, 5], note: 'job 1 (ưu tiên 9) chạy trước, rồi job 2 (5), rồi job 0 (1)' },
      { args: [1, [[0, 1, 5, 1]]], expected: [20], note: 'chạy 0→5 thất bại, retry sau 10 → ready=15, chạy 15→20' },
      { args: [2, [[0, 1, 4, 0], [0, 1, 4, 0], [0, 1, 4, 0]]], expected: [4, 4, 8], note: 'hòa ưu tiên và ready: chỉ số nhỏ trước' },
      { args: [1, [[0, 5, 2, 2], [1, 1, 1, 0]]], expected: [36, 3], note: 'job 0 thất bại 2 lần: chạy 0–2, ready 12 → 12–14, ready 34 → 34–36; job 1 chạy xen vào lúc rảnh (2–3)' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const jobs = Array.from({ length: Math.max(1, big ? n : Math.min(n, 9)) }, () => [
        r.int(0, big ? 600000 : 25),
        r.int(0, 3),
        r.int(1, big ? 20 : 6),
        r.int(0, 2),
      ]);
      return [big ? 20 : r.int(1, 3), jobs];
    },
    // mô phỏng từng giây: T ≈ 6·10⁵ × 10⁵ job → quá giờ
    perf: { n: 1e5, limitMs: 800 },
  },
};
