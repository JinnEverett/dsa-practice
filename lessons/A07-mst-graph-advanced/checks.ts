import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Số thành phần liên thông (vô hướng) của đồ thị n đỉnh, bỏ qua đỉnh `skip` và cạnh số `skipEdge`. */
function components(n: number, edges: number[][], skip = -1, skipEdge = -1): number {
  const p = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (p[x] === x ? x : (p[x] = find(p[x])));
  edges.forEach(([u, v], i) => {
    if (i === skipEdge || u === skip || v === skip) return;
    p[find(u)] = find(v);
  });
  let c = 0;
  for (let i = 0; i < n; i++) if (i !== skip && find(i) === i) c++;
  return c;
}

/** m cạnh phân biệt (u < v), không khuyên. */
function distinctEdges(r: Rng, n: number, m: number): number[][] {
  const seen = new Set<string>();
  const out: number[][] = [];
  for (let i = 0; i < m && n >= 2; i++) {
    const u = r.int(0, n - 1);
    const v = r.int(0, n - 1);
    const a = Math.min(u, v);
    const b = Math.max(u, v);
    if (a === b || seen.has(`${a},${b}`)) continue;
    seen.add(`${a},${b}`);
    out.push([a, b]);
  }
  return out;
}

/** Đường đi qua n đỉnh theo hoán vị ngẫu nhiên (cây DFS sâu n tầng). */
const randomPath = (r: Rng, n: number): number[][] => {
  const perm = r.shuffle(Array.from({ length: n }, (_, i) => i));
  return Array.from({ length: n - 1 }, (_, i) => [perm[i], perm[i + 1]]);
};

/** Đóng bao bắc cầu: reach[i][j] (có hướng). */
function closure(n: number, edges: number[][]): boolean[][] {
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));
  for (const [u, v] of edges) d[u][v] = true;
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (d[i][k] && d[k][j]) d[i][j] = true;
  return d;
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'long mstWeight(int n, int[][] edges)',
    title: 'MST bằng Kruskal',
    ref: S.mstWeight,
    brute: (n: number, edges: number[][]): number => {
      // Prim ma trận O(n²) với cạnh nhỏ nhất của từng cặp
      if (n === 1) return 0;
      const w = Array.from({ length: n }, () => new Array<number>(n).fill(Infinity));
      for (const [u, v, c] of edges) w[u][v] = w[v][u] = Math.min(w[u][v], c);
      const inT = new Array(n).fill(false);
      const d = new Array<number>(n).fill(Infinity);
      d[0] = 0;
      let total = 0;
      for (let it = 0; it < n; it++) {
        let u = -1;
        for (let v = 0; v < n; v++) if (!inT[v] && (u === -1 || d[v] < d[u])) u = v;
        if (d[u] === Infinity) return -1;
        inT[u] = true;
        total += d[u];
        for (let v = 0; v < n; v++) if (!inT[v] && w[u][v] < d[v]) d[v] = w[u][v];
      }
      return total;
    },
    cases: [
      { args: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10], [0, 2, 4]]], expected: 6 },
      { args: [3, [[0, 1, 5]]], expected: -1, note: 'không liên thông' },
      { args: [1, []], expected: 0 },
      { args: [2, [[0, 1, 7], [0, 1, 3]]], expected: 3, note: 'cạnh song song' },
      { args: [100000, Array.from({ length: 99999 }, (_, i) => [i, i + 1, 1_000_000_000])], expected: 99999 * 1_000_000_000, note: 'tổng ≈ 10¹⁴ > 2³¹' },
    ],
    gen: (n, r) => {
      if (n >= 1e5) {
        const chain = Array.from({ length: n - 1 }, (_, i) => [i, i + 1, r.int(1, 1_000_000_000)]);
        const extra = distinctEdges(r, n, n + 1).map(([u, v]) => [u, v, r.int(1, 1_000_000_000)]);
        return [n, r.shuffle([...chain, ...extra])];
      }
      const nn = r.int(1, 7);
      return [nn, distinctEdges(r, nn, r.int(0, 12)).map(([u, v]) => [u, v, r.int(1, 9)])];
    },
    perf: { n: 1e5, limitMs: 1200 },
  },
  '02': {
    sig: 'long minCostConnectPoints(int[][] points)',
    title: 'Nối các điểm (Manhattan MST)',
    ref: S.minCostConnectPoints,
    brute: (pts: number[][]): number => {
      // Kruskal trên mọi cặp
      const n = pts.length;
      const es: number[][] = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) es.push([i, j, Math.abs(pts[i][0] - pts[j][0]) + Math.abs(pts[i][1] - pts[j][1])]);
      es.sort((a, b) => a[2] - b[2]);
      const p = Array.from({ length: n }, (_, i) => i);
      const find = (x: number): number => (p[x] === x ? x : (p[x] = find(p[x])));
      let t = 0;
      for (const [u, v, w] of es) if (find(u) !== find(v)) ((p[find(u)] = find(v)), (t += w));
      return t;
    },
    cases: [
      { args: [[[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]], expected: 20 },
      { args: [[[3, 12], [-2, 5], [-4, 1]]], expected: 18 },
      { args: [[[5, 5]]], expected: 0 },
      { args: [[[0, 0], [0, 0]]], expected: 0, note: 'hai điểm trùng nhau' },
    ],
    gen: (n, r) => {
      const len = n >= 2000 ? 2000 : r.int(1, 8);
      const R = n >= 2000 ? 1_000_000 : 8;
      return [Array.from({ length: len }, () => [r.int(-R, R), r.int(-R, R)])];
    },
    stress: { minN: 1 },
    perf: { n: 2000, limitMs: 300 }, // Kruskal trên 2·10⁶ cạnh chậm hơn Prim O(n²) rõ rệt
  },
  '03': {
    sig: 'List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections)',
    title: 'Cầu (critical connections)',
    ref: S.criticalConnections,
    brute: (n: number, conns: number[][]): number[][] => {
      const base = components(n, conns);
      const out: number[][] = [];
      conns.forEach(([u, v], i) => {
        if (components(n, conns, -1, i) > base) out.push([Math.min(u, v), Math.max(u, v)]);
      });
      return out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    },
    cases: [
      { args: [4, [[0, 1], [1, 2], [2, 0], [1, 3]]], expected: [[1, 3]] },
      { args: [2, [[0, 1]]], expected: [[0, 1]] },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { args: [5, [[3, 4]]], expected: [[3, 4]], note: 'đồ thị không liên thông' },
      { args: [6, [[4, 0], [0, 1], [1, 2], [2, 0], [3, 4], [5, 4]]], expected: [[0, 4], [3, 4], [4, 5]] },
    ],
    gen: (n, r) => {
      if (n >= 5000) return [5000, randomPath(r, 5000)];
      const nn = r.int(1, 8);
      return [nn, distinctEdges(r, nn, r.int(0, 10))];
    },
    perf: { n: 5000, limitMs: 100 },
  },
  '04': {
    sig: 'List<Integer> articulationPoints(int n, int[][] edges)',
    title: 'Điểm khớp',
    ref: S.articulationPoints,
    brute: (n: number, edges: number[][]): number[] => {
      const base = components(n, edges);
      const out: number[] = [];
      for (let v = 0; v < n; v++) if (components(n, edges, v) > base) out.push(v);
      return out;
    },
    cases: [
      { args: [5, [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]]], expected: [1, 3] },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { args: [2, [[0, 1]]], expected: [], note: 'bỏ một đầu mút không tăng số thành phần' },
      { args: [4, [[0, 1], [0, 2], [0, 3]]], expected: [0], note: 'gốc có ≥ 2 con' },
      { args: [1, []], expected: [] },
    ],
    gen: (n, r) => {
      if (n >= 5000) return [5000, randomPath(r, 5000)];
      const nn = r.int(1, 8);
      return [nn, distinctEdges(r, nn, r.int(0, 10))];
    },
    perf: { n: 5000, limitMs: 100 },
  },
  '05': {
    sig: 'int countSCC(int n, int[][] edges)',
    title: 'Đếm thành phần liên thông mạnh',
    ref: S.countSCC,
    brute: (n: number, edges: number[][]): number => {
      const d = closure(n, edges);
      let c = 0;
      for (let i = 0; i < n; i++) {
        let rep = true;
        for (let j = 0; j < i; j++) if (d[i][j] && d[j][i]) rep = false;
        if (rep) c++;
      }
      return c;
    },
    cases: [
      { args: [5, [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]]], expected: 3 },
      { args: [3, []], expected: 3 },
      { args: [1, []], expected: 1 },
      { args: [4, [[0, 1], [1, 0], [2, 3], [3, 2]]], expected: 2 },
      { args: [5000, Array.from({ length: 5000 }, (_, i) => [i, (i + 1) % 5000])], expected: 1, note: 'một vòng 5000 đỉnh' },
      { args: [5000, Array.from({ length: 4999 }, (_, i) => [i, i + 1])], expected: 5000, note: 'chuỗi hướng 5000 đỉnh' },
    ],
    gen: (n, r) => {
      const nn = n >= 5000 ? 5000 : r.int(1, 7);
      const m = n >= 5000 ? 20000 : r.int(0, 10);
      return [nn, Array.from({ length: m }, () => [r.int(0, nn - 1), r.int(0, nn - 1)])];
    },
    perf: { n: 5000, limitMs: 100 },
  },
  '06': {
    sig: 'List<String> findItinerary(List<List<String>> tickets)',
    title: 'Lịch trình bay (Euler path)',
    ref: S.findItinerary,
    brute: (tickets: string[][]): string[] => {
      // backtracking thử điểm đến theo thứ tự từ điển; lời giải đầu tiên là nhỏ nhất
      const used = new Array(tickets.length).fill(false);
      const path = ['JFK'];
      const dfs = (): boolean => {
        if (path.length === tickets.length + 1) return true;
        const u = path[path.length - 1];
        const cand = tickets.map((t, i) => [t[1], i, t[0]] as [string, number, string]).filter(([, i, from]) => !used[i] && from === u).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
        for (const [to, i] of cand) {
          used[i] = true;
          path.push(to);
          if (dfs()) return true;
          path.pop();
          used[i] = false;
        }
        return false;
      };
      dfs();
      return path;
    },
    cases: [
      { args: [[['MUC', 'LHR'], ['JFK', 'MUC'], ['SFO', 'SJC'], ['LHR', 'SFO']]], expected: ['JFK', 'MUC', 'LHR', 'SFO', 'SJC'] },
      {
        args: [[['JFK', 'SFO'], ['JFK', 'ATL'], ['SFO', 'ATL'], ['ATL', 'JFK'], ['ATL', 'SFO']]],
        expected: ['JFK', 'ATL', 'JFK', 'SFO', 'ATL', 'SFO'],
        note: 'chọn nhỏ nhất theo từ điển nhưng phải đi hết vé',
      },
      { args: [[['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']]], expected: ['JFK', 'NRT', 'JFK', 'KUL'], note: 'đi KUL trước sẽ kẹt' },
      {
        args: [Array.from({ length: 20000 }, (_, i) => (i % 2 === 0 ? ['JFK', 'AAA'] : ['AAA', 'JFK']))],
        expected: Array.from({ length: 20001 }, (_, i) => (i % 2 === 0 ? 'JFK' : 'AAA')),
        note: '20 000 vé: đệ quy sâu m tầng sẽ tràn stack',
      },
    ],
    gen: (n, r) => {
      // đi bộ ngẫu nhiên bắt đầu ở JFK ⇒ chắc chắn tồn tại đường Euler dùng hết vé
      const names = ['JFK', 'ATL', 'SFO', 'LAX', 'ORD', 'DFW', 'SEA', 'BOS'];
      const m = n >= 30000 ? 30000 : r.int(1, 8);
      const pool = n >= 30000 ? names : names.slice(0, r.int(2, 5));
      const walk = ['JFK'];
      for (let i = 0; i < m; i++) {
        let nxt = r.pick(pool);
        if (nxt === walk[walk.length - 1] && pool.length > 1) nxt = pool[(pool.indexOf(nxt) + 1) % pool.length];
        walk.push(nxt);
      }
      return [r.shuffle(walk.slice(0, -1).map((a, i) => [a, walk[i + 1]]))];
    },
    stress: { minN: 1 },
    perf: { n: 30000, limitMs: 200 },
  },
  '07': {
    sig: 'long minimumCost(int n, int[][] connections)',
    title: '🔴 Nối các thành phố bằng đường cáp',
    ref: S.minimumCost,
    brute: (n: number, conns: number[][]): number => {
      if (n === 1) return 0;
      const w = Array.from({ length: n }, () => new Array<number>(n).fill(Infinity));
      for (const [a, b, c] of conns) w[a - 1][b - 1] = w[b - 1][a - 1] = Math.min(w[a - 1][b - 1], c);
      const inT = new Array(n).fill(false);
      const d = new Array<number>(n).fill(Infinity);
      d[0] = 0;
      let total = 0;
      for (let it = 0; it < n; it++) {
        let u = -1;
        for (let v = 0; v < n; v++) if (!inT[v] && (u === -1 || d[v] < d[u])) u = v;
        if (d[u] === Infinity) return -1;
        inT[u] = true;
        total += d[u];
        for (let v = 0; v < n; v++) if (!inT[v] && w[u][v] < d[v]) d[v] = w[u][v];
      }
      return total;
    },
    cases: [
      { args: [3, [[1, 2, 5], [1, 3, 6], [2, 3, 1]]], expected: 6 },
      { args: [4, [[1, 2, 3], [3, 4, 4]]], expected: -1 },
      { args: [1, []], expected: 0 },
      { args: [100000, Array.from({ length: 99999 }, (_, i) => [i + 1, i + 2, 1_000_000_000])], expected: 99999 * 1_000_000_000, note: 'tổng ≈ 10¹⁴' },
    ],
    gen: (n, r) => {
      if (n >= 1e5) {
        const chain = Array.from({ length: n - 1 }, (_, i) => [i + 1, i + 2, r.int(1, 1_000_000_000)]);
        const extra = distinctEdges(r, n, n + 1).map(([u, v]) => [u + 1, v + 1, r.int(1, 1_000_000_000)]);
        return [n, r.shuffle([...chain, ...extra])];
      }
      const nn = r.int(1, 7);
      return [nn, distinctEdges(r, nn, r.int(0, 12)).map(([u, v]) => [u + 1, v + 1, r.int(1, 9)])];
    },
    perf: { n: 1e5, limitMs: 1800 },
  },
  '08': {
    sig: 'List<List<Integer>> circularServiceGroups(int n, int[][] deps)',
    title: '🔴 Nhóm service phụ thuộc vòng',
    ref: S.circularServiceGroups,
    brute: (n: number, deps: number[][]): number[][] => {
      const d = closure(n, deps);
      const groups: number[][] = [];
      const done = new Array(n).fill(false);
      for (let i = 0; i < n; i++) {
        if (done[i]) continue;
        const g = [];
        for (let j = 0; j < n; j++) if (d[i][j] && d[j][i]) (g.push(j), (done[j] = true));
        if (g.length >= 2) groups.push(g);
      }
      return groups;
    },
    cases: [
      { args: [4, [[0, 1], [1, 0], [2, 3]]], expected: [[0, 1]] },
      { args: [5, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 3]]], expected: [[0, 1, 2], [3, 4]] },
      { args: [3, [[0, 1], [1, 2]]], expected: [] },
      { args: [6, [[4, 5], [5, 4], [0, 1], [1, 0]]], expected: [[0, 1], [4, 5]], note: 'nhóm sắp theo phần tử nhỏ nhất' },
      { args: [3, []], expected: [] },
    ],
    gen: (n, r) => {
      const nn = n >= 5000 ? 5000 : r.int(1, 8);
      const m = n >= 5000 ? 8000 : r.int(0, 12);
      const edges = Array.from({ length: m }, () => [r.int(0, nn - 1), r.int(0, nn - 1)]).filter(([a, b]) => a !== b);
      return [nn, edges];
    },
    perf: { n: 5000, limitMs: 100 },
  },
};
