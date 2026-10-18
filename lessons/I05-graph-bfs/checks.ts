import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Cạnh vô hướng ngẫu nhiên: không khuyên, không trùng; hướng ghi ngẫu nhiên. */
function randEdges(n: number, m: number, r: Rng): number[][] {
  m = Math.min(m, (n * (n - 1)) / 2);
  const seen = new Set<number>();
  const out: number[][] = [];
  while (out.length < m) {
    const a = r.int(0, n - 1);
    const b = r.int(0, n - 1);
    if (a === b) continue;
    const key = Math.min(a, b) * n + Math.max(a, b);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r.bool() ? [a, b] : [b, a]);
  }
  return out;
}

/** Kích thước lưới: n lớn → lưới ~vuông có ~n ô; n nhỏ → lưới bé ngẫu nhiên. */
function dims(n: number, r: Rng): [number, number] {
  if (n > 1000) {
    const s = Math.round(Math.sqrt(n));
    return [s, s];
  }
  const cap = 2 + Math.min(6, n >> 2);
  return [r.int(1, cap), r.int(1, cap)];
}

/** Khoảng cách ngắn nhất từ src bằng nới lỏng lặp (Bellman-Ford), độc lập với BFS. */
function relaxDist(n: number, edges: number[][], srcs: number[]): number[] {
  const d = new Array<number>(n).fill(Infinity);
  for (const s of srcs) d[s] = 0;
  for (let changed = true; changed; ) {
    changed = false;
    for (const [a, b] of edges) {
      if (d[a] + 1 < d[b]) ((d[b] = d[a] + 1), (changed = true));
      if (d[b] + 1 < d[a]) ((d[a] = d[b] + 1), (changed = true));
    }
  }
  return d;
}

const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int shortestPath(int n, int[][] edges, int src, int dst)',
    title: 'Đường ngắn nhất không trọng số',
    ref: S.shortestPath,
    brute: (n: number, edges: number[][], src: number, dst: number) => {
      const d = relaxDist(n, edges, [src])[dst];
      return d === Infinity ? -1 : d;
    },
    cases: [
      { args: [5, [[0, 1], [1, 2], [2, 4], [0, 3], [3, 4]], 0, 4], expected: 2 },
      { args: [4, [[0, 1], [2, 3]], 0, 3], expected: -1 },
      { args: [1, [], 0, 0], expected: 0 },
      { args: [100000, Array.from({ length: 99999 }, (_, i) => [i, i + 1]), 0, 99999], expected: 99999, note: 'đường thẳng 10⁵ đỉnh' },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      return [v, randEdges(v, n > 1000 ? 2 * v : r.int(0, 2 * v), r), r.int(0, v - 1), r.int(0, v - 1)];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '02': {
    sig: 'int numIslands(String[] grid)',
    title: 'Đếm đảo (BFS)',
    ref: S.numIslands,
    brute: (grid: string[]) => {
      const g = grid.map((row) => row.split(''));
      const flood = (r: number, c: number) => {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] !== '1') return;
        g[r][c] = '0';
        for (const [dr, dc] of D4) flood(r + dr, c + dc);
      };
      let cnt = 0;
      for (let r = 0; r < g.length; r++)
        for (let c = 0; c < g[0].length; c++)
          if (g[r][c] === '1') (cnt++, flood(r, c));
      return cnt;
    },
    cases: [
      { args: [['11110', '11010', '11000', '00000']], expected: 1 },
      { args: [['11000', '11000', '00100', '00011']], expected: 3 },
      { args: [['0']], expected: 0 },
      { args: [['1']], expected: 1 },
      {
        args: [Array.from({ length: 1000 }, (_, r) => Array.from({ length: 1000 }, (_, c) => ((r + c) % 2 === 0 ? '1' : '0')).join(''))],
        expected: 500000,
        note: 'bàn cờ 1000×1000: mỗi ô 1 là một đảo',
      },
      { args: [Array.from({ length: 1000 }, () => '1'.repeat(1000))], expected: 1, note: 'một đảo 10⁶ ô — đệ quy sâu sẽ tràn stack' },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      const p = r.pick([0.3, 0.5, 0.7]);
      return [Array.from({ length: R }, () => Array.from({ length: C }, () => (r.bool(p) ? '1' : '0')).join(''))];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'int orangesRotting(int[][] grid)',
    title: 'Cam thối lan',
    ref: S.orangesRotting,
    brute: (grid: number[][]) => {
      let g = grid.map((row) => row.slice());
      let minutes = 0;
      for (;;) {
        const next = g.map((row) => row.slice());
        let changed = false;
        for (let r = 0; r < g.length; r++)
          for (let c = 0; c < g[0].length; c++)
            if (g[r][c] === 1 && D4.some(([dr, dc]) => g[r + dr]?.[c + dc] === 2)) ((next[r][c] = 2), (changed = true));
        if (!changed) break;
        g = next;
        minutes++;
      }
      return g.some((row) => row.includes(1)) ? -1 : minutes;
    },
    cases: [
      { args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 },
      { args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1 },
      { args: [[[0, 2]]], expected: 0 },
      { args: [[[0]]], expected: 0 },
      { args: [[[1]]], expected: -1, note: 'chỉ có cam tươi, không có nguồn' },
      { args: [[Array.from({ length: 1000 }, (_, i) => (i === 0 ? 2 : 1))]], expected: 999, note: 'lan dọc một hàng' },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      const w = r.pick([[2, 6, 1], [1, 8, 1], [1, 4, 3]]); // tỉ lệ 2 : 1 : 0
      return [Array.from({ length: R }, () => Array.from({ length: C }, () => r.pick([...Array(w[0]).fill(2), ...Array(w[1]).fill(1), ...Array(w[2]).fill(0)]))) ];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'int shortestPathBinaryMatrix(int[][] grid)',
    title: 'Đường ngắn nhất 8 hướng',
    ref: S.shortestPathBinaryMatrix,
    brute: (grid: number[][]) => {
      const N = grid.length;
      if (grid[0][0] || grid[N - 1][N - 1]) return -1;
      const d = grid.map((row) => row.map(() => Infinity));
      d[0][0] = 1;
      for (let changed = true; changed; ) {
        changed = false;
        for (let r = 0; r < N; r++)
          for (let c = 0; c < N; c++)
            for (let dr = -1; dr <= 1; dr++)
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nc < 0 || nr >= N || nc >= N || grid[nr][nc]) continue;
                if (d[r][c] + 1 < d[nr][nc]) ((d[nr][nc] = d[r][c] + 1), (changed = true));
              }
      }
      return d[N - 1][N - 1] === Infinity ? -1 : d[N - 1][N - 1];
    },
    cases: [
      { args: [[[0, 1], [1, 0]]], expected: 2 },
      { args: [[[0, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: 4 },
      { args: [[[1, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: -1 },
      { args: [[[0]]], expected: 1 },
      { args: [[[1]]], expected: -1 },
      { args: [Array.from({ length: 500 }, () => new Array(500).fill(0))], expected: 500, note: 'lưới trống: đi chéo' },
    ],
    gen: (n, r) => {
      const N = n > 1000 ? Math.round(Math.sqrt(n)) : r.int(1, 2 + Math.min(6, n >> 2));
      const p = n > 1000 ? 0.15 : r.pick([0.2, 0.3, 0.4]);
      const g = Array.from({ length: N }, () => Array.from({ length: N }, () => (r.bool(p) ? 1 : 0)));
      if (n > 1000 || r.bool(0.8)) ((g[0][0] = 0), (g[N - 1][N - 1] = 0));
      return [g];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'int[][] updateMatrix(int[][] mat)',
    title: 'Khoảng cách tới số 0 gần nhất',
    ref: S.updateMatrix,
    brute: (mat: number[][]) => {
      const zeros: number[][] = [];
      mat.forEach((row, r) => row.forEach((v, c) => v === 0 && zeros.push([r, c])));
      return mat.map((row, r) => row.map((_, c) => Math.min(...zeros.map(([zr, zc]) => Math.abs(zr - r) + Math.abs(zc - c)))));
    },
    cases: [
      { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
      { args: [[[0, 0, 0], [0, 1, 0], [1, 1, 1]]], expected: [[0, 0, 0], [0, 1, 0], [1, 2, 1]] },
      { args: [[[0]]], expected: [[0]] },
      {
        args: [Array.from({ length: 200 }, (_, r) => Array.from({ length: 500 }, (_, c) => (r === 0 && c === 0 ? 0 : 1)))],
        expected: Array.from({ length: 200 }, (_, r) => Array.from({ length: 500 }, (_, c) => r + c)),
        note: 'một số 0 ở góc: dist = r + c',
      },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      const p = n > 1000 ? 0.001 : r.pick([0.2, 0.5]); // thưa số 0 → BFS đi xa
      const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (r.bool(p) ? 0 : 1)));
      g[r.int(0, R - 1)][r.int(0, C - 1)] = 0; // bảo đảm có ít nhất một số 0
      return [g];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '06': {
    sig: 'int openLock(String[] deadends, String target)',
    title: 'Ổ khóa 4 bánh xe',
    ref: S.openLock,
    brute: (deadends: string[], target: string) => {
      // Bellman-Ford trên 10⁴ trạng thái (độc lập với BFS)
      const dead = new Set(deadends);
      const dist = new Map<string, number>();
      if (!dead.has('0000')) dist.set('0000', 0);
      const nbrs = (s: string): string[] => {
        const out: string[] = [];
        for (let i = 0; i < 4; i++)
          for (const d of [1, 9]) out.push(s.slice(0, i) + ((+s[i] + d) % 10) + s.slice(i + 1));
        return out;
      };
      for (let changed = true; changed; ) {
        changed = false;
        for (const [s, ds] of [...dist]) {
          for (const t of nbrs(s)) {
            if (dead.has(t)) continue;
            if (!dist.has(t) || dist.get(t)! > ds + 1) (dist.set(t, ds + 1), (changed = true));
          }
        }
      }
      return dist.get(target) ?? -1;
    },
    cases: [
      { args: [['0201', '0101', '0102', '1212', '2002'], '0202'], expected: 6 },
      { args: [['8888'], '0009'], expected: 1 },
      { args: [['8887', '8889', '8878', '8898', '8788', '8988', '7888', '9888'], '8888'], expected: -1 },
      { args: [['0000'], '8888'], expected: -1, note: 'xuất phát đã nằm trong deadends' },
      { args: [[], '0000'], expected: 0 },
      { args: [[], '5555'], expected: 20 },
    ],
    gen: (n, r) => {
      const pad = (x: number) => String(x).padStart(4, '0');
      const target = pad(r.int(0, 9999));
      const dead = new Set<string>();
      const k = Math.min(n * 20, 400); // nhiều deadends để có ca bị chặn hoàn toàn
      for (let i = 0; i < k; i++) {
        const d = pad(r.bool(0.5) ? r.int(0, 9999) : r.int(0, 99));
        if (d !== target) dead.add(d);
      }
      return [[...dead], target];
    },
    stress: { runs: 60, minN: 0, maxN: 30 },
    perf: false, // không gian trạng thái cố định 10⁴ → không có thang n để phân biệt Big-O
  },
  '07': {
    sig: 'int ladderLength(String beginWord, String endWord, String[] wordList)',
    title: 'Word ladder',
    ref: S.ladderLength,
    brute: (begin: string, end: string, list: string[]) => {
      const nodes = [begin, ...list.filter((w) => w !== begin)];
      const diff1 = (a: string, b: string) => [...a].filter((ch, i) => ch !== b[i]).length === 1;
      const d = new Array<number>(nodes.length).fill(Infinity);
      d[0] = 1;
      for (let changed = true; changed; ) {
        changed = false;
        for (let i = 0; i < nodes.length; i++)
          for (let j = 0; j < nodes.length; j++)
            if (d[i] + 1 < d[j] && diff1(nodes[i], nodes[j]) && (j === 0 || true)) ((d[j] = d[i] + 1), (changed = true));
      }
      const t = nodes.indexOf(end);
      return t < 0 || d[t] === Infinity ? 0 : d[t];
    },
    cases: [
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], expected: 5 },
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], expected: 0, note: 'endWord không có trong wordList' },
      { args: ['a', 'c', ['a', 'b', 'c']], expected: 2 },
      { args: ['abc', 'abd', []], expected: 0 },
    ],
    gen: (n, r) => {
      const L = n > 1000 ? 8 : r.int(1, 4);
      const alpha = 'abc'; // n lớn: 5000 trong 3⁸ = 6561 từ → đồ thị dày
      const total = alpha.length ** L;
      const cnt = Math.min(total - 2, n > 1000 ? 5000 : r.int(0, Math.max(1, n)));
      const all = new Set<string>();
      while (all.size < cnt + 2) all.add(r.string(L, alpha));
      const words = [...all];
      const begin = words[0];
      const end = words[1];
      const list = words.slice(2);
      if (r.bool(0.8)) list.splice(r.int(0, list.length), 0, end); // thường có end trong list
      if (r.bool(0.3)) list.splice(r.int(0, list.length), 0, begin); // begin có thể có trong list
      return [begin, end, list];
    },
    perf: { n: 5000, limitMs: 150 },
  },
  '08': {
    sig: 'int[] shortestPathNodes(int n, int[][] edges, int src, int dst)',
    title: 'Khôi phục đường ngắn nhất',
    ref: S.shortestPathNodes,
    brute: (n: number, edges: number[][], src: number, dst: number) => {
      const d = relaxDist(n, edges, [src]);
      if (d[dst] === Infinity) return [];
      const adj = Array.from({ length: n }, () => [] as number[]);
      for (const [a, b] of edges) (adj[a].push(b), adj[b].push(a));
      const path = [dst];
      while (path[path.length - 1] !== src) {
        const u = path[path.length - 1];
        path.push(adj[u].find((v) => d[v] === d[u] - 1)!);
      }
      return path.reverse();
    },
    compare: (got, expected, [_n, edges, src, dst]) => {
      if (!Array.isArray(got)) return 'cần trả về mảng';
      if (expected.length === 0) return got.length === 0 || 'không có đường: phải trả về []';
      if (got.length !== expected.length) return `đường có ${got.length} đỉnh, tối thiểu là ${expected.length}`;
      if (got[0] !== src || got[got.length - 1] !== dst) return 'phải bắt đầu ở src và kết thúc ở dst';
      const has = new Set<number>();
      for (const [a, b] of edges as number[][]) (has.add(a * 1_000_003 + b), has.add(b * 1_000_003 + a));
      for (let i = 0; i + 1 < got.length; i++) if (!has.has(got[i] * 1_000_003 + got[i + 1])) return `${got[i]} → ${got[i + 1]} không phải cạnh`;
      return true;
    },
    cases: [
      { args: [5, [[0, 1], [1, 2], [2, 4], [0, 3], [3, 4]], 0, 4], expected: [0, 3, 4], note: 'đường 0-1-2-4 dài 3 cạnh, 0-3-4 dài 2 cạnh' },
      { args: [4, [[0, 1], [2, 3]], 0, 3], expected: [] },
      { args: [3, [[0, 1]], 2, 2], expected: [2] },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      return [v, randEdges(v, n > 1000 ? 2 * v : r.int(0, 2 * v), r), r.int(0, v - 1), r.int(0, v - 1)];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
  '09': {
    sig: 'int[] nearestWarehouse(int n, int[][] roads, int[] warehouses)',
    title: 'Kho gần nhất (multi-source)',
    ref: S.nearestWarehouse,
    brute: (n: number, roads: number[][], wh: number[]) => relaxDist(n, roads, wh).map((x) => (x === Infinity ? -1 : x)),
    cases: [
      { args: [5, [[0, 1], [1, 2], [3, 4]], [0]], expected: [0, 1, 2, -1, -1] },
      { args: [6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]], [0, 5]], expected: [0, 1, 2, 2, 1, 0] },
      { args: [1, [], [0]], expected: [0] },
      {
        args: [100000, Array.from({ length: 99999 }, (_, i) => [i, i + 1]), [0, 99999]],
        expected: Array.from({ length: 100000 }, (_, i) => Math.min(i, 99999 - i)),
        note: 'đường thẳng 10⁵ đỉnh, kho ở hai đầu',
      },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      const k = n > 1000 ? 100 : r.int(1, Math.min(v, 3));
      return [v, randEdges(v, n > 1000 ? Math.floor(1.2 * v) : r.int(0, v), r), r.distinct(k, 0, v - 1)];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
  '10': {
    sig: 'int shortestPathWithBreaks(int[][] grid, int k)',
    title: 'Robot phá vật cản (BFS trạng thái)',
    ref: S.shortestPathWithBreaks,
    brute: (grid: number[][], k: number) => {
      const R = grid.length;
      const C = grid[0].length;
      // d[r][c][u] = số bước ít nhất để tới (r,c) đã phá đúng u vật cản — nới lỏng lặp
      const d = grid.map((row) => row.map(() => new Array<number>(k + 1).fill(Infinity)));
      d[0][0][0] = 0;
      for (let changed = true; changed; ) {
        changed = false;
        for (let r = 0; r < R; r++)
          for (let c = 0; c < C; c++)
            for (let u = 0; u <= k; u++) {
              if (d[r][c][u] === Infinity) continue;
              for (const [dr, dc] of D4) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                const nu = u + grid[nr][nc];
                if (nu <= k && d[r][c][u] + 1 < d[nr][nc][nu]) ((d[nr][nc][nu] = d[r][c][u] + 1), (changed = true));
              }
            }
      }
      const best = Math.min(...d[R - 1][C - 1]);
      return best === Infinity ? -1 : best;
    },
    cases: [
      { args: [[[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]], 1], expected: 6 },
      { args: [[[0, 1, 1], [1, 1, 1], [1, 0, 0]], 1], expected: -1 },
      { args: [[[0]], 0], expected: 0 },
      { args: [[[0, 1], [1, 0]], 0], expected: -1 },
      { args: [Array.from({ length: 300 }, () => new Array(300).fill(0)), 5], expected: 598, note: 'lưới trống' },
    ],
    gen: (n, r) => {
      const [R, C] = n > 1000 ? [Math.round(Math.sqrt(n)), Math.round(Math.sqrt(n))] : dims(n, r);
      const p = n > 1000 ? 0.3 : r.pick([0.3, 0.5]);
      const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (r.bool(p) ? 1 : 0)));
      g[0][0] = 0;
      g[R - 1][C - 1] = 0;
      return [g, n > 1000 ? 20 : r.int(0, 4)];
    },
    perf: { n: 20000, limitMs: 200 },
  },
};
