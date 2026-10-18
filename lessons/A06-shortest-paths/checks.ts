import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Bellman-Ford thô (brute độc lập với Dijkstra): dist từ s, có hướng. */
function bellman(n: number, edges: number[][], s: number): number[] {
  const d = new Array<number>(n).fill(Infinity);
  d[s] = 0;
  for (let i = 0; i < n; i++) for (const [u, v, w] of edges) if (d[u] + w < d[v]) d[v] = d[u] + w;
  return d;
}

/** m cạnh ngẫu nhiên u ≠ v, trọng số trong [wlo, whi]. */
const randEdges = (r: Rng, n: number, m: number, wlo: number, whi: number): number[][] =>
  n < 2 ? [] : Array.from({ length: m }, () => {
    const u = r.int(0, n - 1);
    let v = r.int(0, n - 2);
    if (v >= u) v++;
    return [u, v, r.int(wlo, whi)];
  });

/** Brute cho bài minimax trên lưới: giá trị T nhỏ nhất sao cho BFS chỉ qua được các bước "chi phí ≤ T". */
function minimaxGrid(grid: number[][], stepCost: (a: number, b: number) => number, startCost: number): number {
  const R = grid.length;
  const C = grid[0].length;
  const cands = new Set<number>([startCost]);
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      for (const [dr, dc] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nc >= 0 && nr < R && nc < C) cands.add(stepCost(grid[r][c], grid[nr][nc]));
      }
  for (const T of [...cands].sort((a, b) => a - b)) {
    if (startCost > T) continue;
    const seen = new Set<number>([0]);
    const st = [0];
    while (st.length) {
      const id = st.pop()!;
      const r = Math.floor(id / C);
      const c = id % C;
      for (const [dr, dc] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen.has(nr * C + nc)) continue;
        if (stepCost(grid[r][c], grid[nr][nc]) > T) continue;
        seen.add(nr * C + nc);
        st.push(nr * C + nc);
      }
    }
    if (seen.has(R * C - 1)) return T;
  }
  return -1;
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int networkDelayTime(int[][] times, int n, int k)',
    title: 'Thời gian lan truyền tín hiệu (Dijkstra)',
    ref: S.networkDelayTime,
    brute: (times: number[][], n: number, k: number): number => {
      const d = bellman(n, times.map(([u, v, w]) => [u - 1, v - 1, w]), k - 1);
      const m = Math.max(...d);
      return m === Infinity ? -1 : m;
    },
    cases: [
      { args: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], expected: 2 },
      { args: [[[1, 2, 1]], 2, 1], expected: 1 },
      { args: [[[1, 2, 1]], 2, 2], expected: -1 },
      { args: [[], 1, 1], expected: 0, note: 'một nút' },
    ],
    gen: (n, r) => {
      if (n >= 1e5) {
        const chain = Array.from({ length: n - 1 }, (_, i) => [i + 1, i + 2, r.int(1, 100)]);
        const extra = randEdges(r, n, n + 1, 1, 100).map(([u, v, w]) => [u + 1, v + 1, w]);
        return [[...chain, ...extra], n, 1];
      }
      const nn = r.int(1, 6);
      return [randEdges(r, nn, r.int(0, 10), 1, 9).map(([u, v, w]) => [u + 1, v + 1, w]), nn, r.int(1, nn)];
    },
    perf: { n: 1e5, limitMs: 1500 },
  },
  '02': {
    sig: 'int findCheapestPrice(int n, int[][] flights, int src, int dst, int k)',
    title: 'Vé rẻ nhất với ≤ k điểm dừng',
    ref: S.findCheapestPrice,
    brute: (n: number, flights: number[][], src: number, dst: number, k: number): number => {
      let best = Infinity;
      const dfs = (u: number, cost: number, edgesUsed: number) => {
        if (u === dst) best = Math.min(best, cost);
        if (edgesUsed === k + 1) return;
        for (const [a, b, w] of flights) if (a === u) dfs(b, cost + w, edgesUsed + 1);
      };
      dfs(src, 0, 0);
      return best === Infinity ? -1 : best;
    },
    cases: [
      { args: [4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1], expected: 700 },
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1], expected: 200 },
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0], expected: 500, note: 'k = 0: bay thẳng' },
      { args: [3, [[0, 1, 1]], 0, 2, 5], expected: -1 },
    ],
    gen: (n, r) => {
      if (n >= 1000) return [1000, randEdges(r, 1000, 5000, 1, 10000), 0, 999, 999];
      const nn = r.int(2, 6);
      let dst = r.int(0, nn - 1);
      const src = r.int(0, nn - 1);
      if (dst === src) dst = (dst + 1) % nn;
      return [nn, randEdges(r, nn, r.int(0, 9), 1, 20), src, dst, r.int(0, nn)];
    },
    perf: { n: 1000, limitMs: 300 },
  },
  '03': {
    sig: 'int minimumEffortPath(int[][] heights)',
    title: 'Đường đi tốn sức ít nhất',
    ref: S.minimumEffortPath,
    brute: (h: number[][]): number => (h.length === 1 && h[0].length === 1 ? 0 : minimaxGrid(h, (a, b) => Math.abs(a - b), 0)),
    cases: [
      { args: [[[1, 2, 2], [3, 8, 2], [5, 3, 5]]], expected: 2 },
      { args: [[[1, 2, 3], [3, 8, 4], [5, 3, 5]]], expected: 1 },
      { args: [[[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]]], expected: 0 },
      { args: [[[7]]], expected: 0 },
    ],
    gen: (n, r) => {
      const R = n >= 300 ? 300 : r.int(1, 4);
      const C = n >= 300 ? 300 : r.int(1, 4);
      return [r.matrix(R, C, 1, n >= 300 ? 1_000_000 : 9)];
    },
    perf: { n: 300, limitMs: 600 },
  },
  '04': {
    sig: 'int minCostGrid(int[][] grid)',
    title: 'Sửa mũi tên với chi phí tối thiểu (0-1 BFS)',
    ref: S.minCostGrid,
    brute: (grid: number[][]): number => {
      // thả lỏng lặp tới khi hết thay đổi (Bellman-Ford trên lưới)
      const R = grid.length;
      const C = grid[0].length;
      const D = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const dist = new Array(R * C).fill(Infinity);
      dist[0] = 0;
      for (let changed = true; changed; ) {
        changed = false;
        for (let r = 0; r < R; r++)
          for (let c = 0; c < C; c++)
            D.forEach(([dr, dc], t) => {
              const nr = r + dr;
              const nc = c + dc;
              if (nr < 0 || nc < 0 || nr >= R || nc >= C) return;
              const w = grid[r][c] === t + 1 ? 0 : 1;
              if (dist[r * C + c] + w < dist[nr * C + nc]) (dist[nr * C + nc] = dist[r * C + c] + w, (changed = true));
            });
      }
      return dist[R * C - 1];
    },
    cases: [
      { args: [[[1, 1, 1, 1], [2, 2, 2, 2], [1, 1, 1, 1], [2, 2, 2, 2]]], expected: 3 },
      { args: [[[1, 1, 3], [3, 2, 2], [1, 1, 4]]], expected: 0 },
      { args: [[[1, 2], [4, 3]]], expected: 1 },
      { args: [[[2, 2, 2], [2, 2, 2]]], expected: 3 },
      { args: [[[4]]], expected: 0 },
    ],
    gen: (n, r) => {
      const R = n >= 400 ? 400 : r.int(1, 5);
      const C = n >= 400 ? 400 : r.int(1, 5);
      return [r.matrix(R, C, 1, 4)];
    },
    perf: { n: 400, limitMs: 200 },
  },
  '05': {
    sig: 'boolean hasNegativeCycle(int n, int[][] edges)',
    title: 'Có chu trình âm không (Bellman-Ford)',
    ref: S.hasNegativeCycle,
    brute: (n: number, edges: number[][]): boolean => {
      // Floyd-Warshall: d[i][i] < 0
      const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
      for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w);
      for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
      return d.some((row, i) => row[i] < 0);
    },
    cases: [
      { args: [3, [[0, 1, 1], [1, 2, -1], [2, 0, -1]]], expected: true },
      { args: [3, [[0, 1, 1], [1, 2, -1], [2, 0, 0]]], expected: false, note: 'tổng chu trình = 0' },
      { args: [4, []], expected: false },
      { args: [4, [[2, 3, -5], [3, 2, 6]]], expected: false, note: 'chu trình +1' },
      { args: [4, [[2, 3, -5], [3, 2, 4]]], expected: true, note: 'chu trình −1' },
      { args: [4, [[0, 1, 1], [2, 3, -2], [3, 2, 1]]], expected: true, note: 'chu trình âm nằm ngoài thành phần của đỉnh 0' },
    ],
    gen: (n, r) => {
      if (n >= 1000) {
        // DAG có cạnh âm: không có chu trình âm; chuỗi i→i+1 buộc nhiều vòng thả lỏng
        const chain = Array.from({ length: 999 }, (_, i) => [i, i + 1, -1]);
        const extra = Array.from({ length: 4000 }, () => {
          const u = r.int(0, 998);
          return [u, r.int(u + 1, 999), r.int(-100, 100)];
        });
        return [1000, r.shuffle([...chain, ...extra])];
      }
      const nn = r.int(1, 6);
      return [nn, randEdges(r, nn, r.int(0, 8), -4, 6)];
    },
    perf: { n: 1000, limitMs: 150 },
  },
  '06': {
    sig: 'int findTheCity(int n, int[][] edges, int distanceThreshold)',
    title: 'Thành phố ít láng giềng nhất (Floyd-Warshall)',
    ref: S.findTheCity,
    brute: (n: number, edges: number[][], T: number): number => {
      const und = edges.flatMap(([u, v, w]) => [[u, v, w], [v, u, w]]);
      let bestCity = -1;
      let bestCnt = Infinity;
      for (let s = 0; s < n; s++) {
        const d = bellman(n, und, s);
        const cnt = d.filter((x, j) => j !== s && x <= T).length;
        if (cnt <= bestCnt) (bestCnt = cnt, (bestCity = s));
      }
      return bestCity;
    },
    cases: [
      { args: [4, [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], 4], expected: 3 },
      { args: [5, [[0, 1, 2], [0, 4, 8], [1, 2, 3], [1, 4, 2], [2, 3, 1], [3, 4, 1]], 2], expected: 0 },
      { args: [3, [], 5], expected: 2, note: 'không ai thấy ai ⇒ hòa ⇒ chỉ số lớn nhất' },
      { args: [2, [[0, 1, 10]], 9], expected: 1 },
    ],
    gen: (n, r) => {
      const nn = n >= 100 ? 100 : r.int(2, 7);
      const seen = new Set<string>();
      const edges: number[][] = [];
      const m = n >= 100 ? 1500 : r.int(0, 10);
      for (let i = 0; i < m; i++) {
        const u = r.int(0, nn - 1);
        const v = r.int(0, nn - 1);
        if (u === v || seen.has(`${Math.min(u, v)},${Math.max(u, v)}`)) continue;
        seen.add(`${Math.min(u, v)},${Math.max(u, v)}`);
        edges.push([u, v, r.int(1, n >= 100 ? 10000 : 9)]);
      }
      return [nn, edges, n >= 100 ? 5000 : r.int(1, 15)];
    },
    stress: { minN: 2 },
    perf: { n: 100, limitMs: 50 },
  },
  '07': {
    sig: 'long[] shippingCost(int n, int[][] roads, int warehouse)',
    title: '🔴 Phí vận chuyển từ kho',
    ref: S.shippingCost,
    brute: (n: number, roads: number[][], wh: number): number[] =>
      bellman(n, roads.flatMap(([u, v, w]) => [[u, v, w], [v, u, w]]), wh).map((d) => (d === Infinity ? -1 : d)),
    cases: [
      { args: [4, [[0, 1, 5], [1, 2, 3]], 0], expected: [0, 5, 8, -1] },
      { args: [1, [], 0], expected: [0] },
      { args: [3, [[0, 1, 4], [1, 2, 4], [0, 2, 9]], 2], expected: [8, 4, 0] },
      {
        args: [200000, Array.from({ length: 199999 }, (_, i) => [i, i + 1, 1_000_000_000]), 0],
        expected: Array.from({ length: 200000 }, (_, i) => i * 1_000_000_000),
        note: 'tổng tới 2·10¹⁴ > 2³¹: Java cần long',
      },
    ],
    gen: (n, r) => {
      if (n >= 1e5) {
        const chain = Array.from({ length: n - 1 }, (_, i) => [i, i + 1, r.int(1, 1_000_000_000)]);
        return [n, [...chain, ...randEdges(r, n, n + 1, 1, 1_000_000_000)], 0];
      }
      const nn = r.int(1, 7);
      return [nn, randEdges(r, nn, r.int(0, 10), 1, 20), r.int(0, nn - 1)];
    },
    perf: { n: 1e5, limitMs: 800 },
  },
  '08': {
    sig: 'int swimInWater(int[][] grid)',
    title: '🔴 Bơi qua hồ ngập',
    ref: S.swimInWater,
    brute: (g: number[][]): number => minimaxGrid(g, (_a, b) => b, g[0][0]),
    cases: [
      { args: [[[0, 2], [1, 3]]], expected: 3 },
      { args: [[[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]], expected: 16 },
      { args: [[[0]]], expected: 0 },
      { args: [[[5, 1], [1, 0]]], expected: 5, note: 'ô xuất phát cũng tính' },
    ],
    gen: (n, r) => {
      const R = n >= 300 ? 300 : r.int(1, 4);
      const C = n >= 300 ? 300 : r.int(1, 4);
      return [r.matrix(R, C, 0, n >= 300 ? 1_000_000 : 9)];
    },
    perf: { n: 300, limitMs: 600 },
  },
};
