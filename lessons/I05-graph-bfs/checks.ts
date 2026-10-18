import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

// ───────────── helper sinh dữ liệu ─────────────

/** m cạnh vô hướng ngẫu nhiên (không tự lặp, có thể trùng cặp). Cần n >= 2 nếu m > 0. */
function randEdges(n: number, m: number, r: Rng): number[][] {
  const out: number[][] = [];
  if (n < 2) return out;
  for (let i = 0; i < m; i++) {
    const u = r.int(0, n - 1);
    let v = r.int(0, n - 2);
    if (v >= u) v++;
    out.push([u, v]);
  }
  return out;
}

/** Kích thước lưới có ~n ô: n lớn → lưới vuông, n nhỏ → hình chữ nhật ngẫu nhiên. */
function dims(n: number, r: Rng): [number, number] {
  const cells = Math.max(1, n);
  if (n > 1000) {
    const side = Math.ceil(Math.sqrt(cells));
    return [side, side];
  }
  const R = r.int(1, Math.ceil(Math.sqrt(cells)) + 1);
  return [R, Math.ceil(cells / R)];
}

function randGrid(R: number, C: number, r: Rng, vals: number[]): number[][] {
  return Array.from({ length: R }, () => Array.from({ length: C }, () => r.pick(vals)));
}

/** Lưới rắn: hàng chẵn toàn 1, hàng lẻ là 0 trừ một ô nối (luân phiên phải/trái). Tạo MỘT đường đi dài ~ R*C/2. */
function snake(R: number, C: number): number[][] {
  const g = Array.from({ length: R }, () => new Array<number>(C).fill(0));
  for (let r = 0; r < R; r += 2) g[r].fill(1);
  for (let r = 1; r < R; r += 2) g[r][((r >> 1) & 1) === 0 ? C - 1 : 0] = 1;
  return g;
}

const pathEdges = (n: number): number[][] => Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);
const INF = 1e9;

/** Bellman-Ford trên đồ thị vô hướng: dist từ tập nguồn (brute độc lập với BFS). */
function bfDist(n: number, edges: number[][], sources: number[]): number[] {
  const d = new Array<number>(n).fill(INF);
  for (const s of sources) d[s] = 0;
  for (let it = 0; it < n; it++) {
    let changed = false;
    for (const [u, v] of edges) {
      if (d[u] + 1 < d[v]) (d[v] = d[u] + 1), (changed = true);
      if (d[v] + 1 < d[u]) (d[u] = d[v] + 1), (changed = true);
    }
    if (!changed) break;
  }
  return d;
}

/** Bellman-Ford trên các ô của lưới với hàm láng giềng tuỳ ý. */
function gridDistBF(R: number, C: number, starts: number[], moves: number[][], blocked: (r: number, c: number) => boolean): number[] {
  const d = new Array<number>(R * C).fill(INF);
  for (const s of starts) d[s] = 0;
  for (let it = 0; it < R * C; it++) {
    let changed = false;
    for (let r = 0; r < R; r++)
      for (let c = 0; c < C; c++) {
        if (blocked(r, c) || d[r * C + c] >= INF) continue;
        for (const [dr, dc] of moves) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= R || nc >= C || blocked(nr, nc)) continue;
          if (d[r * C + c] + 1 < d[nr * C + nc]) (d[nr * C + nc] = d[r * C + c] + 1), (changed = true);
        }
      }
    if (!changed) break;
  }
  return d;
}

const M4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const M8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

/** Dùng cho ex01/ex08: gen chung. n lớn → đỉnh 0 nối tới mọi đỉnh + cạnh ngẫu nhiên (hàng đợi rất rộng). */
function genPair(n: number, r: Rng): any[] {
  const nodes = Math.max(1, n);
  let edges: number[][];
  if (n > 1000) {
    edges = randEdges(nodes, nodes, r);
    for (let i = 1; i < nodes; i++) edges.push([0, i]);
    return [nodes, edges, 0, nodes - 1];
  }
  edges = randEdges(nodes, r.int(0, 2 * nodes), r);
  return [nodes, edges, r.int(0, nodes - 1), r.int(0, nodes - 1)];
}

// ───────────── specs ─────────────

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int shortestPath(int n, int[][] edges, int src, int dst)',
    title: 'Đường ngắn nhất (vô hướng)',
    ref: S.shortestPath,
    brute: (n: number, edges: number[][], src: number, dst: number) => {
      const d = bfDist(n, edges, [src])[dst];
      return d >= INF ? -1 : d;
    },
    cases: [
      { args: [5, [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4]], 0, 4], expected: 2 },
      { args: [4, [[0, 1], [2, 3]], 0, 3], expected: -1 },
      { args: [1, [], 0, 0], expected: 0 },
      { args: [3, [[0, 1], [0, 1], [1, 2]], 0, 2], expected: 2, note: 'cạnh trùng' },
      { args: [100000, pathEdges(100000), 0, 99999], expected: 99999, note: 'đường dài 10⁵' },
    ],
    gen: genPair,
    perf: { n: 1e5, limitMs: 600 },
  },
  '02': {
    sig: 'int numIslands(String[] grid)',
    title: 'Số đảo',
    ref: S.numIslands,
    brute: (grid: string[]) => {
      const R = grid.length;
      const C = grid[0].length;
      const g = grid.map((row) => row.split(''));
      const fill = (r: number, c: number): void => {
        if (r < 0 || c < 0 || r >= R || c >= C || g[r][c] !== '1') return;
        g[r][c] = '0';
        fill(r + 1, c);
        fill(r - 1, c);
        fill(r, c + 1);
        fill(r, c - 1);
      };
      let cnt = 0;
      for (let r = 0; r < R; r++)
        for (let c = 0; c < C; c++)
          if (g[r][c] === '1') {
            cnt++;
            fill(r, c);
          }
      return cnt;
    },
    cases: [
      { args: [['11110', '11010', '11000', '00000']], expected: 1 },
      { args: [['11000', '11000', '00100', '00011']], expected: 3 },
      { args: [['0']], expected: 0 },
      { args: [['1']], expected: 1 },
      {
        args: [Array.from({ length: 300 }, (_, i) => (i % 2 === 0 ? '10'.repeat(150) : '0'.repeat(300)))],
        expected: 150 * 150,
        note: '300×300, các ô 1 cô lập',
      },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      const p = n > 1000 ? 0.6 : r.pick([0.3, 0.5, 0.7]);
      return [Array.from({ length: R }, () => Array.from({ length: C }, () => (r.bool(p) ? '1' : '0')).join(''))];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
  '03': {
    sig: 'int orangesRotting(int[][] grid)',
    title: 'Cam thối (multi-source BFS)',
    ref: S.orangesRotting,
    brute: (grid: number[][]) => {
      // mô phỏng từng phút
      let g = grid.map((row) => row.slice());
      const R = g.length;
      const C = g[0].length;
      let minutes = 0;
      for (;;) {
        const next = g.map((row) => row.slice());
        let changed = false;
        for (let r = 0; r < R; r++)
          for (let c = 0; c < C; c++)
            if (g[r][c] === 1)
              for (const [dr, dc] of M4) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nc >= 0 && nr < R && nc < C && g[nr][nc] === 2) {
                  next[r][c] = 2;
                  changed = true;
                }
              }
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
      { args: [[[0]]], expected: 0, note: 'không có cam' },
      { args: [[[1]]], expected: -1, note: 'cam tươi không có nguồn thối' },
      (() => {
        const g = snake(100, 100);
        g[0][0] = 2;
        const cells = g.flat().filter((v) => v > 0).length;
        return { args: [g], expected: cells - 1, note: 'lưới rắn 100×100: một đường dài' };
      })(),
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      if (n > 1000) {
        const g = snake(R, C);
        g[0][0] = 2;
        return [g];
      }
      return [randGrid(R, C, r, r.pick([[0, 1, 1, 1, 2], [1, 1, 1, 2], [0, 0, 1, 2]]))];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '04': {
    sig: 'int shortestPathBinaryMatrix(int[][] grid)',
    title: 'Ma trận nhị phân, 8 hướng',
    ref: S.shortestPathBinaryMatrix,
    brute: (grid: number[][]) => {
      const n = grid.length;
      const d = gridDistBF(n, n, [0], M8, (r, c) => grid[r][c] === 1);
      if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;
      const v = d[n * n - 1];
      return v >= INF ? -1 : v + 1;
    },
    cases: [
      { args: [[[0, 1], [1, 0]]], expected: 2 },
      { args: [[[0, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: 4 },
      { args: [[[1, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: -1 },
      { args: [[[0]]], expected: 1 },
      { args: [[[1]]], expected: -1 },
      { args: [Array.from({ length: 300 }, () => new Array<number>(300).fill(0))], expected: 300, note: 'lưới trống 300×300' },
    ],
    gen: (n, r) => {
      const side = n > 1000 ? Math.ceil(Math.sqrt(n)) : r.int(1, Math.floor(Math.sqrt(Math.max(1, n))) + 1);
      const p = n > 1000 ? 0.2 : r.pick([0.2, 0.35, 0.5]);
      const g = Array.from({ length: side }, () => Array.from({ length: side }, () => (r.bool(p) ? 1 : 0)));
      if (n > 1000 || !r.bool(0.1)) (g[0][0] = 0), (g[side - 1][side - 1] = 0);
      return [g];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
  '05': {
    sig: 'int[][] updateMatrix(int[][] mat)',
    title: 'Khoảng cách tới số 0 gần nhất',
    ref: S.updateMatrix,
    brute: (mat: number[][]) => {
      const zeros: number[][] = [];
      mat.forEach((row, r) => row.forEach((v, c) => v === 0 && zeros.push([r, c])));
      return mat.map((row, r) => row.map((_, c) => Math.min(...zeros.map(([a, b]) => Math.abs(a - r) + Math.abs(b - c)))));
    },
    cases: [
      { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
      { args: [[[0, 0, 0], [0, 1, 0], [1, 1, 1]]], expected: [[0, 0, 0], [0, 1, 0], [1, 2, 1]] },
      { args: [[[0]]], expected: [[0]] },
      {
        args: [Array.from({ length: 300 }, (_, i) => Array.from({ length: 300 }, (_, j) => (i === 0 && j === 0 ? 0 : 1)))],
        expected: Array.from({ length: 300 }, (_, i) => Array.from({ length: 300 }, (_, j) => i + j)),
        note: 'một số 0 ở góc: dist = i + j',
      },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      if (n > 1000) {
        const g = Array.from({ length: R }, () => new Array<number>(C).fill(1));
        g[0][0] = 0;
        return [g];
      }
      const g = randGrid(R, C, r, r.pick([[0, 1, 1], [0, 1, 1, 1, 1, 1]]));
      g[r.int(0, R - 1)][r.int(0, C - 1)] = 0; // đảm bảo có ít nhất một số 0
      return [g];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
  '06': {
    sig: 'int openLock(String[] deadends, String target)',
    title: 'Mở khóa số',
    ref: S.openLock,
    brute: (deadends: string[], target: string) => {
      // relax theo lớp (Bellman-Ford trên 10⁴ trạng thái), độc lập với hàng đợi BFS
      const dead = new Set(deadends);
      if (dead.has('0000')) return -1;
      const d = new Array<number>(10000).fill(INF);
      d[0] = 0;
      for (let pass = 0; pass < 10000; pass++) {
        let changed = false;
        for (let s = 0; s < 10000; s++) {
          if (d[s] >= INF) continue;
          const str = String(s).padStart(4, '0');
          for (let w = 0; w < 4; w++)
            for (const delta of [1, 9]) {
              const t = str.slice(0, w) + ((Number(str[w]) + delta) % 10) + str.slice(w + 1);
              if (dead.has(t)) continue;
              if (d[s] + 1 < d[Number(t)]) (d[Number(t)] = d[s] + 1), (changed = true);
            }
        }
        if (!changed) break;
      }
      const v = d[Number(target)];
      return v >= INF ? -1 : v;
    },
    stress: { runs: 60 },
    cases: [
      { args: [['0201', '0101', '0102', '1212', '2002'], '0202'], expected: 6 },
      { args: [['8888'], '0009'], expected: 1 },
      { args: [['8887', '8889', '8878', '8898', '8788', '8988', '7888', '9888'], '8888'], expected: -1 },
      { args: [['0000'], '8888'], expected: -1, note: '0000 là deadend' },
      { args: [[], '0000'], expected: 0 },
      { args: [[], '5555'], expected: 20 },
    ],
    gen: (n, r) => {
      const target = String(r.int(0, 9999)).padStart(4, '0');
      const cnt = n > 1000 ? 6000 : r.int(0, Math.max(0, n) * 6);
      const dead: string[] = [];
      for (let i = 0; i < cnt; i++) {
        const d = String(r.int(0, 9999)).padStart(4, '0');
        if (d !== target && (n > 1000 ? d !== '0000' : true)) dead.push(d);
      }
      return [dead, n > 1000 ? '9999' : target];
    },
    benchScales: { xs: 10, s: 1000, m: 10000, l: 10000, xl: 10000 },
    perf: { n: 1e4, limitMs: 100 },
  },
  '07': {
    sig: 'int ladderLength(String beginWord, String endWord, String[] wordList)',
    title: 'Word Ladder',
    ref: S.ladderLength,
    brute: (begin: string, end: string, list: string[]) => {
      // Bellman-Ford trên mọi cặp từ (khác đúng 1 ký tự)
      const words = Array.from(new Set([begin, ...list]));
      const adj = (a: string, b: string) => {
        let diff = 0;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
        return diff === 1;
      };
      const d = new Map<string, number>(words.map((w) => [w, INF]));
      d.set(begin, 1);
      for (let pass = 0; pass < words.length; pass++) {
        let changed = false;
        for (const a of words)
          for (const b of words)
            if (adj(a, b) && d.get(a)! + 1 < d.get(b)!) (d.set(b, d.get(a)! + 1), (changed = true));
        if (!changed) break;
      }
      if (!list.includes(end)) return 0;
      const v = d.get(end)!;
      return v >= INF ? 0 : v;
    },
    cases: [
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], expected: 5 },
      { args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], expected: 0 },
      { args: ['a', 'c', ['a', 'b', 'c']], expected: 2 },
      { args: ['aa', 'bb', ['ab', 'bb']], expected: 3, note: 'beginWord không có trong list' },
      { args: ['abc', 'xyz', ['abd', 'xyz']], expected: 0 },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const L = big ? 8 : r.int(1, 3);
      const A = big ? 4 : 3;
      const total = A ** L;
      const toWord = (x: number) => {
        let s = '';
        for (let i = 0; i < L; i++) (s = String.fromCharCode(97 + (x % A)) + s), (x = Math.floor(x / A));
        return s;
      };
      const cnt = Math.min(Math.max(1, n), total - 1);
      const ids = r.distinct(cnt + 1, 0, total - 1); // ids[0] = begin, phần còn lại = wordList
      const list = ids.slice(1).map(toWord);
      const end = r.bool(0.85) ? list[r.int(0, list.length - 1)] : toWord(ids[0] === 0 ? 1 : 0);
      return [toWord(ids[0]), end === toWord(ids[0]) ? list[list.length - 1] : end, list];
    },
    benchScales: { xs: 10, s: 1000, m: 20000, l: 60000, xl: 60000 },
    perf: { n: 2e4, limitMs: 1500 },
  },
  '08': {
    sig: 'int[] shortestPathNodes(int n, int[][] edges, int src, int dst)',
    title: 'Khôi phục đường đi ngắn nhất',
    ref: S.shortestPathNodes,
    brute: (n: number, edges: number[][], src: number, dst: number) => {
      // Bellman-Ford có theo dõi pred
      const d = new Array<number>(n).fill(INF);
      const pred = new Array<number>(n).fill(-1);
      d[src] = 0;
      for (let it = 0; it < n; it++) {
        let changed = false;
        for (const [u, v] of edges) {
          if (d[u] + 1 < d[v]) (d[v] = d[u] + 1), (pred[v] = u), (changed = true);
          if (d[v] + 1 < d[u]) (d[u] = d[v] + 1), (pred[u] = v), (changed = true);
        }
        if (!changed) break;
      }
      if (d[dst] >= INF) return [];
      const path = [dst];
      while (path[path.length - 1] !== src) path.push(pred[path[path.length - 1]]);
      return path.reverse();
    },
    compare: (got: number[], expected: number[], args: any[]) => {
      const [, edges, src, dst] = args as [number, number[][], number, number];
      if (expected.length === 0) return got.length === 0 || 'không tới được thì phải trả []';
      if (!Array.isArray(got) || got.length === 0) return 'trả [] dù có đường đi';
      if (got.length !== expected.length) return `độ dài đường đi ${got.length} nhưng đường ngắn nhất có ${expected.length} đỉnh`;
      if (got[0] !== src || got[got.length - 1] !== dst) return 'đường đi phải bắt đầu ở src và kết thúc ở dst';
      const has = new Set(edges.map(([u, v]) => (u < v ? `${u},${v}` : `${v},${u}`)));
      for (let i = 0; i + 1 < got.length; i++) {
        const a = Math.min(got[i], got[i + 1]);
        const b = Math.max(got[i], got[i + 1]);
        if (!has.has(`${a},${b}`)) return `${got[i]} → ${got[i + 1]} không phải một cạnh`;
      }
      return true;
    },
    cases: [
      { args: [5, [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4]], 0, 4], expected: [0, 3, 4] },
      { args: [4, [[0, 1], [2, 3]], 0, 3], expected: [] },
      { args: [3, [[0, 1]], 2, 2], expected: [2], note: 'src === dst' },
      { args: [100000, pathEdges(100000), 0, 99999], expected: Array.from({ length: 100000 }, (_, i) => i), note: 'đường duy nhất, 10⁵ đỉnh' },
    ],
    gen: genPair,
    perf: { n: 1e5, limitMs: 600 },
  },
  '09': {
    sig: 'int[] nearestWarehouse(int n, int[][] roads, int[] warehouses)',
    title: '🔴 Kho gần nhất',
    ref: S.nearestWarehouse,
    brute: (n: number, roads: number[][], wh: number[]) => bfDist(n, roads, wh).map((d) => (d >= INF ? -1 : d)),
    cases: [
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], [0, 4]], expected: [0, 1, 2, 1, 0] },
      { args: [4, [[0, 1]], [0]], expected: [0, 1, -1, -1] },
      { args: [3, [], [1]], expected: [-1, 0, -1] },
      { args: [100000, pathEdges(100000), [0, 99999]], expected: Array.from({ length: 100000 }, (_, i) => Math.min(i, 99999 - i)), note: '10⁵ điểm, 2 kho hai đầu' },
    ],
    gen: (n, r) => {
      const nodes = Math.max(1, n);
      const w = n > 1000 ? nodes / 10 : r.int(1, Math.min(nodes, 3));
      return [nodes, randEdges(nodes, n > 1000 ? 2 * nodes : r.int(0, 2 * nodes), r), r.distinct(Math.floor(w), 0, nodes - 1)];
    },
    perf: { n: 1e5, limitMs: 600 },
  },
  '10': {
    sig: 'int shortestPathWithBreaks(int[][] grid, int k)',
    title: '🔴 Robot kho phá vật cản',
    ref: S.shortestPathWithBreaks,
    brute: (grid: number[][], k: number) => {
      // Bellman-Ford trên (ô, số vật cản đã phá)
      const R = grid.length;
      const C = grid[0].length;
      const K = k + 1;
      const d = new Array<number>(R * C * K).fill(INF);
      d[0] = 0;
      for (let it = 0; it < R * C * K; it++) {
        let changed = false;
        for (let r = 0; r < R; r++)
          for (let c = 0; c < C; c++)
            for (let u = 0; u < K; u++) {
              const cur = d[(r * C + c) * K + u];
              if (cur >= INF) continue;
              for (const [dr, dc] of M4) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                const nu = u + grid[nr][nc];
                if (nu > k) continue;
                const idx = (nr * C + nc) * K + nu;
                if (cur + 1 < d[idx]) (d[idx] = cur + 1), (changed = true);
              }
            }
        if (!changed) break;
      }
      let best = INF;
      for (let u = 0; u < K; u++) best = Math.min(best, d[((R - 1) * C + (C - 1)) * K + u]);
      return best >= INF ? -1 : best;
    },
    stress: { runs: 150, maxN: 20 },
    cases: [
      { args: [[[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]], 1], expected: 6 },
      { args: [[[0, 1, 1], [1, 1, 1], [1, 0, 0]], 1], expected: -1 },
      { args: [[[0]], 0], expected: 0 },
      { args: [[[0, 1, 0]], 0], expected: -1 },
      { args: [[[0, 1, 0]], 1], expected: 2 },
      { args: [Array.from({ length: 100 }, () => new Array<number>(100).fill(0)), 0], expected: 198, note: 'lưới trống 100×100' },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      const p = n > 1000 ? 0.3 : r.pick([0.2, 0.4, 0.6]);
      const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (r.bool(p) ? 1 : 0)));
      g[0][0] = 0;
      g[R - 1][C - 1] = 0;
      return [g, n > 1000 ? 30 : r.int(0, 4)];
    },
    benchScales: { xs: 10, s: 1000, m: 10000, l: 40000, xl: 40000 },
    perf: { n: 1e4, limitMs: 500 },
  },
};
