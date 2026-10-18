import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** DAG ngẫu nhiên: cạnh [u, v] với u đứng trước v trong một hoán vị ẩn; không khuyên, không trùng. */
function randDag(n: number, m: number, r: Rng): number[][] {
  if (n < 2) return [];
  m = Math.min(m, (n * (n - 1)) / 2);
  const perm = r.shuffle(Array.from({ length: n }, (_, i) => i));
  const seen = new Set<number>();
  const out: number[][] = [];
  while (out.length < m) {
    let a = r.int(0, n - 1);
    let b = r.int(0, n - 1);
    if (a === b) continue;
    if (a > b) [a, b] = [b, a];
    if (seen.has(a * n + b)) continue;
    seen.add(a * n + b);
    out.push([perm[a], perm[b]]);
  }
  return out;
}

/** Đồ thị có hướng bất kỳ (thường có chu trình): không khuyên, không trùng. */
function randDigraph(n: number, m: number, r: Rng): number[][] {
  if (n < 2) return [];
  m = Math.min(m, n * (n - 1));
  const seen = new Set<number>();
  const out: number[][] = [];
  while (out.length < m) {
    const a = r.int(0, n - 1);
    const b = r.int(0, n - 1);
    if (a === b || seen.has(a * n + b)) continue;
    seen.add(a * n + b);
    out.push([a, b]);
  }
  return out;
}

const chain = (n: number) => Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Bao đóng bắc cầu (Floyd–Warshall) — độc lập với Kahn/DFS. */
function closure(n: number, edges: number[][]): boolean[][] {
  const reach = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  for (const [a, b] of edges) reach[a][b] = true;
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (reach[i][k] && reach[k][j]) reach[i][j] = true;
  return reach;
}
const hasCycle = (n: number, edges: number[][]) => closure(n, edges).some((row, i) => row[i]);

/** Kiểm tra `order` là hoán vị 0..n−1 và tôn trọng mọi cạnh [u, v] (u trước v). */
function validTopo(order: number[], n: number, edges: number[][]): true | string {
  if (!Array.isArray(order) || order.length !== n) return `cần đúng ${n} phần tử, nhận ${order?.length}`;
  const pos = new Array<number>(n).fill(-1);
  for (let i = 0; i < n; i++) {
    const v = order[i];
    if (!Number.isInteger(v) || v < 0 || v >= n || pos[v] !== -1) return `${v} không hợp lệ hoặc lặp`;
    pos[v] = i;
  }
  for (const [u, v] of edges) if (pos[u] > pos[v]) return `${v} đứng trước ${u} nhưng ${u} phải xong trước`;
  return true;
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'boolean canFinish(int numCourses, int[][] prerequisites)',
    title: 'Có học xong tất cả môn?',
    ref: S.canFinish,
    brute: (n: number, pre: number[][]) => !hasCycle(n, pre),
    cases: [
      { args: [2, [[1, 0]]], expected: true },
      { args: [2, [[1, 0], [0, 1]]], expected: false },
      { args: [1, []], expected: true },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true, note: 'kim cương' },
      { args: [100000, chain(100000).map(([a, b]) => [b, a])], expected: true, note: 'chuỗi tiên quyết dài 10⁵' },
      { args: [100000, [...chain(100000).map(([a, b]) => [b, a]), [0, 99999]]], expected: false },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      const e = r.bool(0.5) ? randDag(v, n > 1000 ? 2 * v : r.int(0, v + 2), r) : randDigraph(v, n > 1000 ? 2 * v : r.int(0, v + 2), r);
      return [v, e];
    },
    perf: { n: 1e5, limitMs: 500 },
  },
  '02': {
    sig: 'int[] findOrder(int numCourses, int[][] prerequisites)',
    title: 'Thứ tự học các môn',
    ref: S.findOrder,
    brute: (n: number, pre: number[][]) => {
      // đặt lần lượt môn nào đã đủ tiên quyết (quét lại toàn bộ mỗi lượt)
      const done = new Array<boolean>(n).fill(false);
      const out: number[] = [];
      while (out.length < n) {
        const next = range(n).find((v) => !done[v] && pre.every(([a, b]) => a !== v || done[b]));
        if (next === undefined) return [];
        done[next] = true;
        out.push(next);
      }
      return out;
    },
    compare: (got, expected, [n, pre]) => {
      if (expected.length === 0) return (Array.isArray(got) && got.length === 0) || 'có chu trình: phải trả về []';
      return validTopo(got, n, (pre as number[][]).map(([a, b]) => [b, a]));
    },
    cases: [
      { args: [2, [[1, 0]]], expected: [0, 1] },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: [0, 1, 2, 3], note: 'cũng chấp nhận [0,2,1,3]' },
      { args: [2, [[1, 0], [0, 1]]], expected: [] },
      { args: [1, []], expected: [0] },
      { args: [100000, chain(100000).map(([a, b]) => [b, a])], expected: range(100000) },
      { args: [100000, [...chain(100000).map(([a, b]) => [b, a]), [0, 99999]]], expected: [] },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      const pre = (r.bool(0.7) ? randDag(v, n > 1000 ? 2 * v : r.int(0, v + 2), r) : randDigraph(v, r.int(0, v + 2), r)).map(([a, b]) => [b, a]);
      return [v, pre];
    },
    perf: { n: 1e5, limitMs: 500 },
  },
  '03': {
    sig: 'int[] lexSmallestTopo(int n, int[][] edges)',
    title: 'Thứ tự topo nhỏ nhất theo từ điển',
    ref: S.lexSmallestTopo,
    brute: (n: number, edges: number[][]) => {
      const placed = new Array<boolean>(n).fill(false);
      const out: number[] = [];
      while (out.length < n) {
        const next = range(n).find((v) => !placed[v] && edges.every(([a, b]) => b !== v || placed[a]));
        if (next === undefined) return [];
        placed[next] = true;
        out.push(next);
      }
      return out;
    },
    cases: [
      { args: [4, [[3, 1], [2, 1], [0, 3]]], expected: [0, 2, 3, 1] },
      { args: [3, []], expected: [0, 1, 2] },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { args: [5, [[4, 0], [3, 0]]], expected: [1, 2, 3, 4, 0], note: 'đỉnh nhỏ 0 phải chờ' },
      { args: [100000, chain(100000)], expected: range(100000) },
      { args: [100000, chain(100000).map(([a, b]) => [b, a])], expected: range(100000).reverse(), note: 'chuỗi ngược' },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      return [v, r.bool(0.8) ? randDag(v, n > 1000 ? 2 * v : r.int(0, v + 2), r) : randDigraph(v, r.int(0, v + 2), r)];
    },
    perf: { n: 1e5, limitMs: 500 },
  },
  '04': {
    sig: 'String alienOrder(String[] words)',
    title: 'Bảng chữ cái người ngoài hành tinh',
    ref: S.alienOrder,
    // thử mọi hoán vị các chữ cái có mặt
    brute: (words: string[]) => {
      const letters = [...new Set(words.join(''))];
      const perm = (rest: string[], acc: string[]): string | null => {
        if (!rest.length) return acc.join('');
        for (let i = 0; i < rest.length; i++) {
          const got = perm([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, rest[i]]);
          if (got !== null) return got;
        }
        return null;
      };
      const ok = (order: string) => {
        const rank = (ch: string) => order.indexOf(ch);
        for (let i = 0; i + 1 < words.length; i++) {
          const [a, b] = [words[i], words[i + 1]];
          let k = 0;
          while (k < a.length && k < b.length && a[k] === b[k]) k++;
          if (k === Math.min(a.length, b.length)) {
            if (a.length > b.length) return false;
          } else if (rank(a[k]) > rank(b[k])) return false;
        }
        return true;
      };
      const all: string[] = [];
      const gather = (rest: string[], acc: string[]) => {
        if (!rest.length) return void all.push(acc.join(''));
        rest.forEach((ch, i) => gather([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, ch]));
      };
      gather(letters, []);
      void perm;
      return all.find(ok) ?? '';
    },
    compare: (got, expected, [words]) => {
      if (typeof got !== 'string') return 'cần trả về chuỗi';
      if (expected === '') return got === '' || 'không có thứ tự hợp lệ: phải trả về ""';
      const letters = new Set((words as string[]).join(''));
      if (got.length !== letters.size || new Set(got).size !== got.length || [...got].some((c) => !letters.has(c))) return 'phải chứa đúng mỗi chữ cái xuất hiện một lần';
      const rank = new Map([...got].map((c, i) => [c, i]));
      for (let i = 0; i + 1 < words.length; i++) {
        const [a, b] = [words[i], words[i + 1]] as string[];
        let k = 0;
        while (k < a.length && k < b.length && a[k] === b[k]) k++;
        if (k === Math.min(a.length, b.length)) {
          if (a.length > b.length) return 'tiền tố phải đứng trước';
        } else if (rank.get(a[k])! > rank.get(b[k])!) return `"${a}" phải đứng trước "${b}" nhưng thứ tự của bạn đặt ${b[k]} trước ${a[k]}`;
      }
      return true;
    },
    cases: [
      { args: [['wrt', 'wrf', 'er', 'ett', 'rftt']], expected: 'wertf' },
      { args: [['z', 'x']], expected: 'zx' },
      { args: [['z', 'x', 'z']], expected: '', note: 'z < x < z' },
      { args: [['abc', 'ab']], expected: '', note: 'từ dài đứng trước chính tiền tố của nó' },
      { args: [['a']], expected: 'a' },
      { args: [['ab', 'ab']], expected: 'ab', note: 'hai từ giống nhau' },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const alpha = big ? 'abcdefghijklmnopqrstuvwxyz' : 'abcde'.slice(0, r.int(1, 5));
      const hidden = r.shuffle([...alpha]);
      const rank = new Map(hidden.map((c, i) => [c, i]));
      const cmp = (a: string, b: string) => {
        let k = 0;
        while (k < a.length && k < b.length && a[k] === b[k]) k++;
        if (k === a.length || k === b.length) return a.length - b.length;
        return rank.get(a[k])! - rank.get(b[k])!;
      };
      const count = big ? n : Math.max(1, r.int(1, Math.min(n, 6) + 1));
      const words = Array.from({ length: count }, () => r.string(r.int(1, big ? 8 : 3), alpha));
      if (big || r.bool(0.6)) words.sort(cmp); // hợp lệ theo bảng ẩn; còn lại để ngẫu nhiên (thường vô lý)
      return [words];
    },
    stress: { runs: 300, maxN: 12 },
    perf: { n: 1e5, limitMs: 150 },
  },
  '05': {
    sig: 'int minimumSemesters(int n, int[][] relations)',
    title: 'Số học kỳ tối thiểu',
    ref: S.minimumSemesters,
    brute: (n: number, rel: number[][]) => {
      // độ dài đường dài nhất (theo đỉnh) bằng nới lỏng lặp; còn nới được sau n vòng ⇒ có chu trình
      const depth = new Array<number>(n).fill(1);
      for (let round = 0; round <= n; round++) {
        let changed = false;
        for (const [a, b] of rel) if (depth[a] + 1 > depth[b]) ((depth[b] = depth[a] + 1), (changed = true));
        if (!changed) return Math.max(...depth);
      }
      return -1;
    },
    cases: [
      { args: [3, [[0, 2], [1, 2]]], expected: 2 },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expected: -1 },
      { args: [1, []], expected: 1 },
      { args: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expected: 3 },
      { args: [100000, chain(100000)], expected: 100000 },
      { args: [100000, []], expected: 1 },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      return [v, r.bool(0.85) ? randDag(v, n > 1000 ? 2 * v : r.int(0, v + 2), r) : randDigraph(v, r.int(0, v + 2), r)];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '06': {
    sig: 'List<Integer> eventualSafeNodes(int[][] graph)',
    title: 'Đỉnh an toàn cuối cùng',
    ref: S.eventualSafeNodes,
    brute: (graph: number[][]) => {
      const n = graph.length;
      const edges = graph.flatMap((vs, u) => vs.map((v) => [u, v]));
      const reach = closure(n, edges);
      const onCycle = range(n).map((v) => reach[v][v]);
      return range(n).filter((v) => !onCycle[v] && !range(n).some((w) => reach[v][w] && onCycle[w]));
    },
    cases: [
      { args: [[[1, 2], [2, 3], [5], [0], [5], [], []]], expected: [2, 4, 5, 6] },
      { args: [[[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]], expected: [4] },
      { args: [[[]]], expected: [0] },
      { args: [[[0]]], expected: [], note: 'khuyên' },
      { args: [Array.from({ length: 100000 }, (_, i) => (i < 99999 ? [i + 1] : []))], expected: range(100000), note: 'chuỗi 10⁵' },
      { args: [Array.from({ length: 100000 }, (_, i) => [(i + 1) % 100000])], expected: [], note: 'vòng 10⁵' },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      const adj: number[][] = Array.from({ length: v }, () => []);
      const m = n > 1000 ? v : r.int(0, 2 * v);
      const dag = n > 1000 || r.bool(0.5);
      const edges = dag ? randDag(v, m, r) : randDigraph(v, m, r);
      for (const [a, b] of edges) adj[a].push(b);
      if (!dag && r.bool(0.3)) {
        const x = r.int(0, v - 1);
        adj[x] = adj[x].includes(x) ? adj[x] : [...adj[x], x]; // thêm khuyên
      }
      return [adj];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '07': {
    sig: 'String[] migrationOrder(String[] names, String[][] deps)',
    title: 'Thứ tự chạy migration',
    ref: S.migrationOrder,
    brute: (names: string[], deps: string[][]) => {
      const done = new Set<string>();
      const out: string[] = [];
      while (out.length < names.length) {
        const ready = names.filter((s) => !done.has(s) && deps.every(([name, req]) => name !== s || done.has(req)));
        if (!ready.length) return [];
        const next = ready.reduce((a, b) => (a < b ? a : b));
        done.add(next);
        out.push(next);
      }
      return out;
    },
    cases: [
      { args: [['b', 'a', 'c'], [['c', 'a']]], expected: ['a', 'b', 'c'] },
      { args: [['m2', 'm1'], [['m1', 'm2']]], expected: ['m2', 'm1'] },
      { args: [['a', 'b'], [['a', 'b'], ['b', 'a']]], expected: [] },
      { args: [['x'], []], expected: ['x'] },
      { args: [['c', 'b', 'a'], [['a', 'b'], ['a', 'b'], ['c', 'a']]], expected: ['b', 'a', 'c'], note: 'dòng deps lặp lại' },
      {
        args: [
          range(100000).map((i) => 'm' + String(i).padStart(6, '0')),
          range(99999).map((i) => ['m' + String(i).padStart(6, '0'), 'm' + String(i + 1).padStart(6, '0')]),
        ],
        expected: range(100000).reverse().map((i) => 'm' + String(i).padStart(6, '0')),
        note: 'mỗi migration cần cái đứng sau nó',
      },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      const set = new Set<string>();
      while (set.size < v) set.add(n > 1000 ? 'm' + String(r.int(0, 9999999)).padStart(7, '0') : r.string(r.int(1, v > 60 ? 8 : 3), 'ab_1'));
      const names = r.shuffle([...set]);
      const idx = r.bool(0.8) ? randDag(v, n > 1000 ? 2 * v : r.int(0, v + 2), r) : randDigraph(v, r.int(0, v + 2), r);
      if (idx.length && r.bool(0.2)) idx.push(idx[0]); // dòng lặp
      return [names, idx.map(([a, b]) => [names[b], names[a]])]; // [name, requires]
    },
    perf: { n: 1e5, limitMs: 1200 },
  },
  '08': {
    sig: 'long minBuildTime(int n, int[][] deps, int[] duration)',
    title: 'Thời gian build tối thiểu',
    ref: S.minBuildTime,
    brute: (n: number, deps: number[][], dur: number[]) => {
      const finish = dur.slice();
      for (let changed = true; changed; ) {
        changed = false;
        for (const [a, b] of deps) if (finish[a] + dur[b] > finish[b]) ((finish[b] = finish[a] + dur[b]), (changed = true));
      }
      return Math.max(...finish);
    },
    cases: [
      { args: [3, [[0, 2], [1, 2]], [3, 2, 5]], expected: 8 },
      { args: [5, [[0, 4], [1, 4], [2, 4], [3, 4]], [1, 2, 3, 4, 5]], expected: 9 },
      { args: [1, [], [7]], expected: 7 },
      { args: [3, [], [4, 9, 2]], expected: 9, note: 'không phụ thuộc: lấy max, không phải tổng' },
      { args: [100000, chain(100000), new Array(100000).fill(1000000000)], expected: 100000000000000, note: '10⁵ × 10⁹ = 10¹⁴ — Java phải dùng long' },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      return [v, randDag(v, n > 1000 ? 2 * v : r.int(0, v + 2), r), r.array(v, 1, n > 1000 ? 1e9 : 20)];
    },
    perf: { n: 1e5, limitMs: 500 },
  },
};
