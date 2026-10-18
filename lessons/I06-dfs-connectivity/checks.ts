import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Cạnh ngẫu nhiên không khuyên. dup = cho phép cạnh trùng (song song). */
function randEdges(n: number, m: number, r: Rng, dup = false): number[][] {
  if (n < 2) return [];
  if (!dup) m = Math.min(m, (n * (n - 1)) / 2);
  const seen = new Set<number>();
  const out: number[][] = [];
  while (out.length < m) {
    const a = r.int(0, n - 1);
    const b = r.int(0, n - 1);
    if (a === b) continue;
    const key = Math.min(a, b) * n + Math.max(a, b);
    if (!dup && seen.has(key)) continue;
    seen.add(key);
    out.push(r.bool() ? [a, b] : [b, a]);
  }
  return out;
}

/** Đường thẳng qua mọi đỉnh theo thứ tự hoán vị ngẫu nhiên (DFS sâu n tầng, bộ nhớ nhảy lung tung). */
function shuffledPath(n: number, r: Rng): { order: number[]; edges: number[][] } {
  const order = r.shuffle(Array.from({ length: n }, (_, i) => i));
  return { order, edges: order.slice(1).map((v, i) => [order[i], v]) };
}

function dims(n: number, r: Rng): [number, number] {
  if (n > 1000) {
    const s = Math.round(Math.sqrt(n));
    return [s, s];
  }
  const cap = 2 + Math.min(6, n >> 2);
  return [r.int(1, cap), r.int(1, cap)];
}

/** Nhãn thành phần bằng lan truyền nhãn nhỏ nhất (độc lập với DFS/BFS). */
function labels(n: number, edges: number[][]): number[] {
  const lab = Array.from({ length: n }, (_, i) => i);
  for (let changed = true; changed; ) {
    changed = false;
    for (const [a, b] of edges) {
      const m = Math.min(lab[a], lab[b]);
      if (lab[a] !== m || lab[b] !== m) ((lab[a] = lab[b] = m), (changed = true));
    }
  }
  return lab;
}
const comps = (n: number, edges: number[][]) => new Set(labels(n, edges)).size;

const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const path = (n: number) => Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);

/** Lưới "rắn": hàng chẵn toàn 1, hàng lẻ chỉ 1 ô ở đầu trái/phải xen kẽ → MỘT đảo dài ~R·C/2 ô. */
const snake = (R: number, C: number): number[][] =>
  Array.from({ length: R }, (_, i) =>
    Array.from({ length: C }, (_, c) => (i % 2 === 0 ? 1 : (i % 4 === 1 ? c === C - 1 : c === 0) ? 1 : 0)),
  );

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int countComponents(int n, int[][] edges)',
    title: 'Đếm thành phần liên thông',
    ref: S.countComponents,
    brute: (n: number, edges: number[][]) => comps(n, edges),
    cases: [
      { args: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 1 },
      { args: [1, []], expected: 1 },
      { args: [100000, []], expected: 100000, note: '10⁵ đỉnh cô lập' },
      { args: [100000, path(100000)], expected: 1, note: 'đường thẳng 10⁵ đỉnh — đệ quy sâu 10⁵ tầng sẽ tràn stack' },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      return [v, randEdges(v, n > 1000 ? Math.floor(v / 2) : r.int(0, v), r)];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '02': {
    sig: 'int[][] floodFill(int[][] image, int sr, int sc, int color)',
    title: 'Flood fill',
    ref: S.floodFill,
    brute: (image: number[][], sr: number, sc: number, color: number) => {
      const g = image.map((row) => row.slice());
      const old = g[sr][sc];
      const seen = new Set<number>();
      const go = (r: number, c: number) => {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] !== old || seen.has(r * 1000 + c)) return;
        seen.add(r * 1000 + c);
        for (const [dr, dc] of D4) go(r + dr, c + dc);
      };
      go(sr, sc);
      for (const k of seen) g[(k / 1000) | 0][k % 1000] = color;
      return g;
    },
    cases: [
      { args: [[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
      { args: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], expected: [[0, 0, 0], [0, 0, 0]], note: 'màu mới trùng màu gốc' },
      { args: [[[5]], 0, 0, 7], expected: [[7]] },
      {
        args: [Array.from({ length: 600 }, () => new Array(600).fill(3)), 0, 0, 9],
        expected: Array.from({ length: 600 }, () => new Array(600).fill(9)),
        note: 'ảnh một màu 600×600 — đệ quy sâu 3.6·10⁵ tầng',
      },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (n > 1000 ? (r.bool(0.1) ? 1 : 0) : r.int(0, 2))));
      return [g, r.int(0, R - 1), r.int(0, C - 1), r.int(0, 3)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'int maxAreaOfIsland(int[][] grid)',
    title: 'Đảo lớn nhất',
    ref: S.maxAreaOfIsland,
    brute: (grid: number[][]) => {
      const R = grid.length;
      const C = grid[0].length;
      const lab = grid.map((row, r) => row.map((v, c) => (v ? r * C + c : -1)));
      for (let changed = true; changed; ) {
        changed = false;
        for (let r = 0; r < R; r++)
          for (let c = 0; c < C; c++)
            for (const [dr, dc] of D4) {
              const nr = r + dr;
              const nc = c + dc;
              if (lab[r][c] < 0 || lab[nr]?.[nc] === undefined || lab[nr][nc] < 0) continue;
              const m = Math.min(lab[r][c], lab[nr][nc]);
              if (lab[r][c] !== m || lab[nr][nc] !== m) ((lab[r][c] = lab[nr][nc] = m), (changed = true));
            }
      }
      const cnt = new Map<number, number>();
      for (const row of lab) for (const x of row) if (x >= 0) cnt.set(x, (cnt.get(x) ?? 0) + 1);
      return Math.max(0, ...cnt.values());
    },
    cases: [
      { args: [[[0, 0, 1, 0, 0], [0, 1, 1, 0, 0], [0, 0, 0, 0, 1]]], expected: 3 },
      { args: [[[0, 0, 0]]], expected: 0 },
      { args: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], expected: 1 },
      { args: [snake(401, 400)], expected: 201 * 400 + 200, note: 'đảo "rắn" dài 80 600 ô — đệ quy sẽ tràn stack' },
      { args: [Array.from({ length: 1000 }, () => new Array(1000).fill(1))], expected: 1000000 },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      const p = r.pick([0.4, 0.55, 0.7]);
      return [Array.from({ length: R }, () => Array.from({ length: C }, () => (r.bool(p) ? 1 : 0)))];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'boolean hasCycleUndirected(int n, int[][] edges)',
    title: 'Chu trình trong đồ thị vô hướng',
    ref: S.hasCycleUndirected,
    // rừng ⇔ số cạnh = n − số thành phần
    brute: (n: number, edges: number[][]) => edges.length > n - comps(n, edges),
    cases: [
      { args: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: true },
      { args: [4, [[0, 1], [1, 2], [2, 3]]], expected: false },
      { args: [3, [[0, 1], [1, 0]]], expected: true, note: 'hai cạnh song song = chu trình độ dài 2' },
      { args: [5, [[0, 1], [3, 4]]], expected: false, note: 'không liên thông' },
      { args: [1, []], expected: false },
      { args: [100000, path(100000)], expected: false, note: 'đường thẳng 10⁵' },
      { args: [100000, [...path(100000), [99999, 0]]], expected: true, note: 'vòng 10⁵ đỉnh' },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      if (n > 1000) return [v, shuffledPath(v, r).edges]; // rừng sâu → bắt buộc duyệt hết
      const m = r.int(0, Math.max(1, v));
      return [v, randEdges(v, m, r, true)];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '05': {
    sig: 'boolean hasCycleDirected(int n, int[][] edges)',
    title: 'Chu trình trong đồ thị có hướng',
    ref: S.hasCycleDirected,
    brute: (n: number, edges: number[][]) => {
      const reach = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
      for (const [a, b] of edges) reach[a][b] = true;
      for (let k = 0; k < n; k++)
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (reach[i][k] && reach[k][j]) reach[i][j] = true;
      return reach.some((row, i) => row[i]);
    },
    cases: [
      { args: [4, [[0, 1], [1, 2], [2, 3], [3, 1]]], expected: true },
      { args: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expected: false, note: 'kim cương: không phải chu trình' },
      { args: [2, [[0, 1], [1, 0]]], expected: true },
      { args: [3, []], expected: false },
      { args: [100000, path(100000)], expected: false, note: 'chuỗi phụ thuộc dài 10⁵' },
      { args: [100000, [...path(100000), [99999, 0]]], expected: true },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      if (n > 1000) {
        // DAG sâu: đường thẳng theo thứ tự hoán vị + cạnh "tiến" thêm → không có chu trình
        const { order, edges } = shuffledPath(v, r);
        for (let i = 0; i < v; i++) {
          const a = r.int(0, v - 1);
          const b = r.int(0, v - 1);
          if (a < b) edges.push([order[a], order[b]]);
        }
        return [v, edges];
      }
      return [v, randEdges(v, r.int(0, v + 2), r, true).map(([a, b]) => (r.bool(0.7) && a > b ? [b, a] : [a, b]))];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '06': {
    sig: 'boolean isBipartite(int[][] graph)',
    title: 'Đồ thị hai phía',
    ref: S.isBipartite,
    // vét cạn mọi cách tô 2 màu (n nhỏ)
    brute: (graph: number[][]) => {
      const n = graph.length;
      for (let mask = 0; mask < 1 << n; mask++) {
        let ok = true;
        for (let u = 0; u < n && ok; u++) for (const v of graph[u]) if (((mask >> u) & 1) === ((mask >> v) & 1)) ok = false;
        if (ok) return true;
      }
      return false;
    },
    cases: [
      { args: [[[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]], expected: false },
      { args: [[[1, 3], [0, 2], [1, 3], [0, 2]]], expected: true },
      { args: [[[], []]], expected: true },
      { args: [[[1], [0], [3, 4], [2, 4], [2, 3]]], expected: false, note: 'thành phần thứ hai có chu trình lẻ' },
      {
        args: [Array.from({ length: 100000 }, (_, i) => [...(i > 0 ? [i - 1] : []), ...(i < 99999 ? [i + 1] : [])])],
        expected: true,
        note: 'đường thẳng 10⁵ đỉnh',
      },
      {
        args: [Array.from({ length: 99999 }, (_, i) => [(i + 99998) % 99999, (i + 1) % 99999])],
        expected: false,
        note: 'vòng lẻ 99 999 đỉnh',
      },
    ],
    gen: (n, r) => {
      if (n > 1000) {
        const { order } = shuffledPath(n, r);
        const adj: number[][] = Array.from({ length: n }, () => []);
        for (let i = 0; i + 1 < n; i++) (adj[order[i]].push(order[i + 1]), adj[order[i + 1]].push(order[i]));
        return [adj];
      }
      const v = Math.max(1, Math.min(n, 12));
      const adj: number[][] = Array.from({ length: v }, () => []);
      if (r.bool(0.5)) {
        // cố ý hai phía: chỉ nối hai nhóm
        const side = Array.from({ length: v }, () => r.int(0, 1));
        for (const [a, b] of randEdges(v, r.int(0, v + 2), r)) if (side[a] !== side[b]) (adj[a].push(b), adj[b].push(a));
      } else for (const [a, b] of randEdges(v, r.int(0, v + 2), r)) (adj[a].push(b), adj[b].push(a));
      return [adj];
    },
    stress: { runs: 300, maxN: 12 },
    perf: { n: 1e5, limitMs: 200 },
  },
  '07': {
    sig: 'String[] captureRegions(String[] board)',
    title: 'Vùng bị bao quanh',
    ref: S.captureRegions,
    brute: (board: string[]) => {
      const R = board.length;
      const C = board[0].length;
      const safe = board.map((row, r) => Array.from(row, (ch, c) => ch === 'O' && (r === 0 || c === 0 || r === R - 1 || c === C - 1)));
      for (let changed = true; changed; ) {
        changed = false;
        for (let r = 0; r < R; r++)
          for (let c = 0; c < C; c++)
            if (board[r][c] === 'O' && !safe[r][c] && D4.some(([dr, dc]) => safe[r + dr]?.[c + dc])) ((safe[r][c] = true), (changed = true));
      }
      return board.map((row, r) => Array.from(row, (ch, c) => (ch === 'O' && !safe[r][c] ? 'X' : ch)).join(''));
    },
    cases: [
      { args: [['XXXX', 'XOOX', 'XXOX', 'XOXX']], expected: ['XXXX', 'XXXX', 'XXXX', 'XOXX'] },
      { args: [['X']], expected: ['X'] },
      { args: [['O']], expected: ['O'] },
      { args: [['OOO', 'OXO', 'OOO']], expected: ['OOO', 'OXO', 'OOO'] },
      { args: [['XXX', 'XOX', 'XXX']], expected: ['XXX', 'XXX', 'XXX'] },
      {
        args: [Array.from({ length: 1000 }, () => 'O'.repeat(1000))],
        expected: Array.from({ length: 1000 }, () => 'O'.repeat(1000)),
        note: '10⁶ ô O nối với biên — đệ quy từ biên sẽ tràn stack',
      },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      const p = n > 1000 ? 0.7 : r.pick([0.4, 0.6]);
      return [Array.from({ length: R }, () => Array.from({ length: C }, () => (r.bool(p) ? 'O' : 'X')).join(''))];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'List<List<Integer>> pacificAtlantic(int[][] heights)',
    title: 'Nước chảy ra hai đại dương',
    ref: S.pacificAtlantic,
    compare: 'unordered', // sắp các cặp [r, c] theo thứ tự bất kỳ, nhưng KHÔNG đảo r/c trong từng cặp
    brute: (h: number[][]) => {
      const R = h.length;
      const C = h[0].length;
      const out: number[][] = [];
      for (let r = 0; r < R; r++)
        for (let c = 0; c < C; c++) {
          const seen = new Set<number>();
          let pac = false;
          let atl = false;
          const go = (a: number, b: number) => {
            if (seen.has(a * 1000 + b)) return;
            seen.add(a * 1000 + b);
            if (a === 0 || b === 0) pac = true;
            if (a === R - 1 || b === C - 1) atl = true;
            for (const [dr, dc] of D4) if (h[a + dr]?.[b + dc] !== undefined && h[a + dr][b + dc] <= h[a][b]) go(a + dr, b + dc);
          };
          go(r, c);
          if (pac && atl) out.push([r, c]);
        }
      return out;
    },
    cases: [
      {
        args: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]],
        expected: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]],
      },
      { args: [[[1]]], expected: [[0, 0]] },
      { args: [[[2, 1], [1, 2]]], expected: [[0, 0], [0, 1], [1, 0], [1, 1]] },
      {
        args: [Array.from({ length: 300 }, (_, r) => Array.from({ length: 300 }, (_, c) => r + c))],
        expected: [...Array.from({ length: 300 }, (_, c) => [299, c]), ...Array.from({ length: 299 }, (_, r) => [r, 299])],
        note: 'độ cao tăng dần: chỉ biên dưới và biên phải',
      },
    ],
    gen: (n, r) => {
      const [R, C] = dims(n, r);
      const hi = n > 1000 ? 1000 : r.pick([2, 4, 8]);
      return [Array.from({ length: R }, () => Array.from({ length: C }, () => r.int(0, hi)))];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
  '09': {
    sig: 'int findCircleNum(int[][] isConnected)',
    title: 'Nhóm khách hàng liên kết',
    ref: S.findCircleNum,
    brute: (m: number[][]) => {
      const n = m.length;
      const edges: number[][] = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (m[i][j]) edges.push([i, j]);
      return comps(n, edges);
    },
    cases: [
      { args: [[[1, 1, 0], [1, 1, 0], [0, 0, 1]]], expected: 2 },
      { args: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 3 },
      { args: [[[1]]], expected: 1 },
      { args: [Array.from({ length: 1000 }, () => new Array(1000).fill(1))], expected: 1 },
      { args: [Array.from({ length: 1000 }, (_, i) => Array.from({ length: 1000 }, (_, j) => (i === j ? 1 : 0)))], expected: 1000 },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n > 1000 ? 1000 : n);
      const m = Array.from({ length: v }, (_, i) => Array.from({ length: v }, (_, j) => (i === j ? 1 : 0)));
      for (const [a, b] of randEdges(v, n > 1000 ? v : r.int(0, v), r)) m[a][b] = m[b][a] = 1;
      return [m];
    },
    perf: { n: 1000, limitMs: 100 },
  },
  '10': {
    sig: 'int makeConnected(int n, int[][] connections)',
    title: 'Số dây cáp cần kéo lại',
    ref: S.makeConnected,
    brute: (n: number, c: number[][]) => (c.length < n - 1 ? -1 : comps(n, c) - 1),
    cases: [
      { args: [4, [[0, 1], [0, 2], [1, 2]]], expected: 1 },
      { args: [6, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3]]], expected: 2 },
      { args: [6, [[0, 1], [0, 2], [0, 3], [1, 2]]], expected: -1 },
      { args: [1, []], expected: 0 },
      { args: [2, [[0, 1], [0, 1]]], expected: 0, note: 'dây thừa nhưng đã nối hết' },
      { args: [100000, []], expected: -1 },
      { args: [100000, path(100000)], expected: 0 },
      { args: [100000, [...path(100000).filter((_, i) => i !== 50000), [0, 1]]], expected: 1, note: 'thiếu cầu giữa hai nửa, thừa một dây' },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      const m = n > 1000 ? v + 1000 : r.int(0, v + 3);
      return [v, randEdges(v, m, r, true)];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
};
