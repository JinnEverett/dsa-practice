import type { Spec } from '../../tools/spec.ts';
import { TreeNode, treeToArray, type Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Cây ngẫu nhiên m nút, giá trị khác nhau, trả về mảng level-order kiểu LeetCode. */
function randomTree(m: number, r: Rng): (number | null)[] {
  if (m === 0) return [];
  const vals = r.distinct(m, 0, Math.max(60, 3 * m));
  const nodes = [new TreeNode(vals[0])];
  const open: { node: TreeNode; side: 'left' | 'right' }[] = [
    { node: nodes[0], side: 'left' },
    { node: nodes[0], side: 'right' },
  ];
  for (let i = 1; i < m; i++) {
    const idx = r.int(0, open.length - 1);
    const { node, side } = open[idx];
    open[idx] = open[open.length - 1];
    open.pop();
    const c = new TreeNode(vals[i]);
    node[side] = c;
    open.push({ node: c, side: 'left' }, { node: c, side: 'right' });
  }
  return treeToArray(nodes[0]);
}
/** Mảng level-order của cây lệch phải (chuỗi) m nút: [0, null, 1, null, 2, …]. */
const chain = (m: number): (number | null)[] => {
  const a: (number | null)[] = [];
  for (let i = 0; i < m; i++) {
    a.push(i);
    if (i + 1 < m) a.push(null);
  }
  return a;
};

// brute ex01: BFS theo thời gian trên trạng thái (số job còn lại, thời gian nguội còn lại)
function bruteSchedule(tasks: string[], n: number): number {
  const letters = [...new Set(tasks)].sort();
  const start = letters.map((l) => tasks.filter((t) => t === l).length);
  const L = letters.length;
  const key = (cnt: number[], cd: number[]) => cnt.join(',') + '|' + cd.join(',');
  let frontier = new Map<string, [number[], number[]]>([[key(start, new Array(L).fill(0)), [start, new Array(L).fill(0)]]]);
  for (let t = 0; ; t++) {
    const next = new Map<string, [number[], number[]]>();
    for (const [cnt, cd] of frontier.values()) {
      if (cnt.every((c) => c === 0)) return t;
      const tick = cd.map((c) => Math.max(0, c - 1));
      next.set(key(cnt, tick), [cnt, tick]); // chạy không (idle)
      for (let i = 0; i < L; i++) {
        if (cnt[i] > 0 && cd[i] === 0) {
          const c2 = cnt.slice();
          c2[i]--;
          const d2 = tick.slice();
          d2[i] = n;
          next.set(key(c2, d2), [c2, d2]);
        }
      }
    }
    frontier = next;
  }
}

// brute ex02: độ sâu + cha bằng đệ quy; khoảng cách = qua tổ tiên chung
function bruteDistanceK(root: TreeNode | null, target: number, k: number): number[] {
  const info = new Map<number, { parent: number | null; depth: number }>();
  const walk = (u: TreeNode | null, p: number | null, d: number) => {
    if (!u) return;
    info.set(u.val, { parent: p, depth: d });
    walk(u.left, u.val, d + 1);
    walk(u.right, u.val, d + 1);
  };
  walk(root, null, 0);
  const ancestors = (v: number) => {
    const out = [v];
    for (let p = info.get(v)!.parent; p !== null; p = info.get(p)!.parent) out.push(p);
    return out;
  };
  if (!info.has(target)) return [];
  const at = ancestors(target);
  const res: number[] = [];
  for (const v of info.keys()) {
    const av = ancestors(v);
    const common = av.find((x) => at.includes(x))!;
    const dist = info.get(v)!.depth + info.get(target)!.depth - 2 * info.get(common)!.depth;
    if (dist === k) res.push(v);
  }
  return res;
}

function bruteSnakes(board: number[][]): number {
  const N = board.length;
  const total = N * N;
  const land = (s: number) => {
    const rb = Math.floor((s - 1) / N);
    let c = (s - 1) % N;
    if (rb % 2) c = N - 1 - c;
    const v = board[N - 1 - rb][c];
    return v === -1 ? s : v;
  };
  const INF = 1e9;
  const dist = new Array<number>(total + 1).fill(INF);
  dist[1] = 0;
  for (let changed = true; changed; ) {
    changed = false;
    for (let s = 1; s <= total; s++) {
      if (dist[s] >= INF) continue;
      for (let d = 1; d <= 6 && s + d <= total; d++) {
        const t = land(s + d);
        if (dist[s] + 1 < dist[t]) {
          dist[t] = dist[s] + 1;
          changed = true;
        }
      }
    }
  }
  return dist[total] >= INF ? -1 : dist[total];
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int leastInterval(String[] tasks, int n)',
    title: 'Lập lịch job có thời gian nguội',
    ref: S.leastInterval,
    brute: bruteSchedule,
    cases: [
      { args: [['A', 'A', 'A', 'B', 'B', 'B'], 2], expected: 8 },
      { args: [['A', 'A', 'A', 'B', 'B', 'B'], 0], expected: 6 },
      { args: [['A', 'A', 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], 2], expected: 16, note: '(6−1)·3 + 1 = 16 > 12 job' },
      { args: [['A', 'B', 'C'], 5], expected: 3, note: 'không có job lặp → không cần nguội' },
      { args: [[], 3], expected: 0 },
      { args: [['A', 'A', 'B', 'B'], 1], expected: 4, note: 'ABAB' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const t = Array.from({ length: big ? n : Math.min(n, 7) }, () => r.pick(big ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') : ['A', 'B', 'C']));
      return [t, big ? 50 : r.int(0, 3)];
    },
    stress: { maxN: 7 },
    perf: false,
  },
  '02': {
    sig: 'List<Integer> distanceK(TreeNode root, int target, int k)',
    title: 'Nhân viên cách k bậc trong sơ đồ tổ chức',
    ref: S.distanceK,
    brute: bruteDistanceK,
    compare: 'unordered',
    cases: [
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 2], expected: [7, 4, 1] },
      { args: [[1], 1, 3], expected: [] },
      { args: [[1], 1, 0], expected: [1] },
      { args: [[0, 1, null, 3, 2], 2, 1], expected: [1] },
    ],
    gen: (n, r) => {
      if (n > 200) {
        const m = 100000;
        return [chain(m), Math.floor(m / 2), 1000];
      }
      const m = Math.max(1, n);
      const tree = randomTree(m, r);
      const vals = tree.filter((v): v is number => v !== null);
      return [tree, r.pick(vals), r.int(0, 5)];
    },
    stress: { minN: 1 },
    // cây chuỗi 10⁵ nút: đệ quy tràn stack
    perf: { n: 1e5, limitMs: 150 },
  },
  '03': {
    sig: 'int snakesAndLadders(int[][] board)',
    title: 'Cờ rắn và thang',
    ref: S.snakesAndLadders,
    brute: bruteSnakes,
    cases: [
      {
        args: [[
          [-1, -1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1, -1],
          [-1, 35, -1, -1, 13, -1],
          [-1, -1, -1, -1, -1, -1],
          [-1, 15, -1, -1, -1, -1],
        ]],
        expected: 4,
        note: 'ví dụ chuẩn của LeetCode 909',
      },
      { args: [[[-1, -1], [-1, 3]]], expected: 1 },
      { args: [[[-1, -1, -1], [-1, 9, 8], [-1, 4, -1]]], expected: 1, note: 'xúc xắc 4 → ô 5, trên đó có thang lên ô 9 (hàng lẻ đảo chiều cột)' },
      { args: [[[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]]], expected: 2, note: '9 ô, không thang: 6 rồi 2' },
      { args: [[[-1]]], expected: 0, note: 'N = 1: đã ở đích' },
    ],
    gen: (n, r) => {
      const N = n > 200 ? 316 : r.int(2, 5);
      const total = N * N;
      const board = Array.from({ length: N }, () => new Array<number>(N).fill(-1));
      const place = (s: number, d: number) => {
        const rb = Math.floor((s - 1) / N);
        let c = (s - 1) % N;
        if (rb % 2) c = N - 1 - c;
        board[N - 1 - rb][c] = d;
      };
      const special = n > 200 ? 0.02 : 0.25;
      for (let s = 2; s < total; s++) if (r.bool(special)) place(s, r.int(1, total));
      return [board];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 60 },
  },
  '04': {
    sig: 'boolean checkSubarraySum(int[] nums, int k)',
    title: 'Mảng con có tổng chia hết cho k',
    ref: S.checkSubarraySum,
    brute: (nums: number[], k: number) => {
      for (let i = 0; i < nums.length; i++) {
        let sum = nums[i];
        for (let j = i + 1; j < nums.length; j++) {
          sum += nums[j];
          if (sum % k === 0) return true;
        }
      }
      return false;
    },
    cases: [
      { args: [[23, 2, 4, 6, 7], 6], expected: true },
      { args: [[23, 2, 6, 4, 7], 6], expected: true },
      { args: [[23, 2, 6, 4, 7], 13], expected: false },
      { args: [[0, 0], 1], expected: true, note: 'tổng 0 là bội của mọi k' },
      { args: [[5, 0, 0, 0], 3], expected: true },
      { args: [[1], 1], expected: false, note: 'cần độ dài ≥ 2' },
      { args: [[2000000000, 2000000000, 147483647], 2147483647], expected: true, note: 'Java: sum + x tràn int; mảng con [1..2] có tổng 2³¹ − 1' },
    ],
    gen: (n, r) => {
      if (n > 200) return [Array(n).fill(1), 1_000_003];
      return [r.array(n, 0, 60), r.int(1, 40)];
    },
    perf: { n: 1e5, limitMs: 60 },
  },
  '05': {
    sig: 'boolean increasingTriplet(int[] nums)',
    title: 'Có ba phần tử tăng dần',
    ref: S.increasingTriplet,
    brute: (nums: number[]) => {
      for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
          if (nums[j] > nums[i]) for (let k = j + 1; k < nums.length; k++) if (nums[k] > nums[j]) return true;
      return false;
    },
    cases: [
      { args: [[1, 2, 3, 4, 5]], expected: true },
      { args: [[5, 4, 3, 2, 1]], expected: false },
      { args: [[2, 1, 5, 0, 4, 6]], expected: true },
      { args: [[1, 1, 1]], expected: false, note: 'phải tăng NGẶT' },
      { args: [[20, 100, 10, 12, 5, 13]], expected: true, note: '10, 12, 13 — a và b không cần đúng thứ tự chỉ số' },
      { args: [[]], expected: false },
    ],
    gen: (n, r) => {
      if (n > 200) return [Array.from({ length: n }, (_, i) => n - i)]; // giảm dần: không có bộ ba
      return [r.array(n, 0, 12)];
    },
    perf: { n: 1e5, limitMs: 20 },
  },
};
