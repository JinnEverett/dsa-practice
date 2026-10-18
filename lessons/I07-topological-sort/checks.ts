import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

// ─────────────── helper sinh dữ liệu ───────────────

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/**
 * DAG ngẫu nhiên trên n node, cạnh [u, v] nghĩa là u đứng trước v. Cạnh nối vị trí i với i+1..i+1+w trong một hoán vị ngẫu nhiên
 * (w nhỏ → đường dài, đệ quy sâu). chain = true: thêm cả đường i → i+1 (đường dài đúng n node). Có thể có cạnh lặp.
 */
function dagEdges(n: number, m: number, r: Rng, w: number, chain = false): number[][] {
  if (n < 2) return [];
  const perm = r.shuffle(range(n));
  const edges: number[][] = [];
  if (chain) for (let i = 0; i + 1 < n; i++) edges.push([perm[i], perm[i + 1]]);
  for (let k = 0; k < m; k++) {
    const i = r.int(0, n - 2);
    const j = Math.min(n - 1, i + 1 + r.int(0, w));
    edges.push([perm[i], perm[j]]);
  }
  return r.shuffle(edges);
}

/** Với xác suất p thêm một cạnh ngẫu nhiên (có thể tạo chu trình). Giữ u ≠ v. */
function maybeCycle(edges: number[][], n: number, r: Rng, p: number): number[][] {
  if (n >= 2 && r.bool(p)) {
    const u = r.int(0, n - 1);
    let v = r.int(0, n - 1);
    if (v === u) v = (v + 1) % n;
    edges.push([u, v]);
  }
  return edges;
}

const flip = (edges: number[][]) => edges.map(([u, v]) => [v, u]);

/** Kiểm tra `order` là hoán vị của 0..n-1 và mọi cạnh [u, v] (u trước v) đều đúng thứ tự. */
function validTopo(order: number[], n: number, edges: number[][]): string | true {
  if (order.length !== n) return `độ dài ${order.length}, cần ${n}`;
  const pos = new Array<number>(n).fill(-1);
  for (let i = 0; i < n; i++) {
    const x = order[i];
    if (!Number.isInteger(x) || x < 0 || x >= n || pos[x] !== -1) return `phần tử ${x} không hợp lệ hoặc lặp`;
    pos[x] = i;
  }
  for (const [u, v] of edges) if (pos[u] >= pos[v]) return `vi phạm: ${u} phải đứng trước ${v}`;
  return true;
}

// ─────────────── brute độc lập ───────────────

/** Có chu trình? Bao đóng bắc cầu (Floyd–Warshall) rồi tìm node tới được chính nó. n nhỏ. */
function hasCycleClosure(n: number, edges: number[][]): boolean {
  const reach = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  for (const [u, v] of edges) reach[u][v] = true;
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) if (reach[i][k]) for (let j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
  return range(n).some((i) => reach[i][i]);
}

/** Mô phỏng: lặp chọn node chưa xếp có mọi tiền đề đã xếp; pick chọn một trong các ứng viên. */
function simulate(n: number, edges: number[][], pick: (cands: number[]) => number): number[] {
  const done = new Array<boolean>(n).fill(false);
  const out: number[] = [];
  while (out.length < n) {
    const cands = range(n).filter((v) => !done[v] && edges.every(([u, w]) => w !== v || done[u]));
    if (cands.length === 0) return [];
    const c = pick(cands);
    done[c] = true;
    out.push(c);
  }
  return out;
}

// ─────────────── chuỗi dài / case lớn ───────────────

const N = 20_000;
const chainReq = (n: number) => range(n - 1).map((i) => [i, i + 1]); // môn i cần môn i+1 (DAG, đường dài n)

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'boolean canFinish(int numCourses, int[][] prerequisites)',
    title: 'Course Schedule (có học hết được không)',
    ref: S.canFinish,
    brute: (n: number, pre: number[][]) => !hasCycleClosure(n, flip(pre)),
    cases: [
      { args: [2, [[1, 0]]], expected: true },
      { args: [2, [[1, 0], [0, 1]]], expected: false },
      { args: [1, []], expected: true },
      { args: [3, [[1, 0], [1, 2], [0, 1]]], expected: false, note: 'chu trình 0 ↔ 1, môn 2 vô can' },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true, note: 'kim cương' },
      { args: [5, []], expected: true },
      { args: [N, chainReq(N)], expected: true, note: 'chuỗi 2·10⁴ môn — DFS đệ quy tràn stack' },
      { args: [N, [...chainReq(N), [N - 1, 0]]], expected: false, note: 'chuỗi 2·10⁴ khép kín thành vòng' },
    ],
    gen: (n, r) => {
      const c = Math.max(1, n);
      const big = n > 1000;
      return [c, maybeCycle(flip(dagEdges(c, 2 * c, r, big ? 3 : 4, big)), c, r, big ? 0 : 0.5)];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
  '02': {
    sig: 'int[] findOrder(int numCourses, int[][] prerequisites)',
    title: 'Course Schedule II (thứ tự học)',
    ref: S.findOrder,
    brute: (n: number, pre: number[][]) => simulate(n, flip(pre), (c) => c[c.length - 1]),
    compare: (got: number[], expected: number[], args: any[]) => {
      const [n, pre] = args as [number, number[][]];
      if (expected.length === 0) return got.length === 0 || 'đồ thị có chu trình → phải trả mảng rỗng';
      if (got.length === 0) return 'có thứ tự hợp lệ nhưng bạn trả mảng rỗng';
      return validTopo(got, n, flip(pre));
    },
    cases: [
      { args: [2, [[1, 0]]], expected: [0, 1] },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: [0, 1, 2, 3], note: 'cũng chấp nhận [0,2,1,3]' },
      { args: [1, []], expected: [0] },
      { args: [2, [[1, 0], [0, 1]]], expected: [] },
      { args: [3, [[0, 1], [1, 2], [2, 1]]], expected: [], note: 'chu trình nằm ở phần sau của đồ thị' },
      { args: [N, chainReq(N)], expected: range(N).reverse(), note: 'chuỗi 2·10⁴ môn' },
    ],
    gen: (n, r) => {
      const c = Math.max(1, n);
      const big = n > 1000;
      return [c, maybeCycle(flip(dagEdges(c, 2 * c, r, big ? 3 : 4, big)), c, r, big ? 0 : 0.3)];
    },
    perf: { n: 1e5, limitMs: 250 },
  },
  '03': {
    sig: 'int[] lexSmallestTopo(int n, int[][] edges)',
    title: 'Thứ tự topo nhỏ nhất theo từ điển',
    ref: S.lexSmallestTopo,
    brute: (n: number, edges: number[][]) => simulate(n, edges, (c) => Math.min(...c)),
    cases: [
      { args: [3, [[2, 0], [0, 1]]], expected: [2, 0, 1] },
      { args: [4, []], expected: [0, 1, 2, 3] },
      { args: [4, [[3, 0], [3, 1]]], expected: [2, 3, 0, 1] },
      { args: [2, [[0, 1], [1, 0]]], expected: [] },
      { args: [5, [[4, 0], [1, 3]]], expected: [1, 2, 3, 4, 0] },
      { args: [1, []], expected: [0] },
      { args: [N, range(N - 1).map((i) => [i + 1, i])], expected: range(N).reverse(), note: 'chuỗi ngược 2·10⁴' },
      { args: [N, range(N - 1).map((i) => [i + 1, 0])], expected: [...range(N - 1).map((i) => i + 1), 0], note: 'node 0 phụ thuộc mọi node khác' },
    ],
    gen: (n, r) => {
      const c = Math.max(1, n);
      const big = n > 1000;
      // big: DAG thưa → tập "sẵn sàng" rất lớn, nhiều lần push/pop heap
      return [c, maybeCycle(dagEdges(c, big ? Math.floor(c / 2) : 2 * c, r, big ? 50 : 4), c, r, big ? 0 : 0.25)];
    },
    perf: { n: 1e5, limitMs: 250 },
  },
  '04': {
    sig: 'String alienOrder(String[] words)',
    title: 'Từ điển người ngoài hành tinh',
    ref: S.alienOrder,
    brute: (words: string[]) => {
      const letters = [...new Set(words.join('').split(''))];
      const perm = (rest: string[], cur: string[]): string | null => {
        if (rest.length === 0) {
          const rank = new Map(cur.map((c, i) => [c, i]));
          const le = (a: string, b: string) => {
            let i = 0;
            while (i < a.length && i < b.length && a[i] === b[i]) i++;
            if (i === a.length) return true; // a là tiền tố của b (hoặc bằng)
            if (i === b.length) return false;
            return rank.get(a[i])! < rank.get(b[i])!;
          };
          for (let i = 0; i < words.length; i++) for (let j = i + 1; j < words.length; j++) if (!le(words[i], words[j])) return null;
          return cur.join('');
        }
        for (let k = 0; k < rest.length; k++) {
          const got = perm([...rest.slice(0, k), ...rest.slice(k + 1)], [...cur, rest[k]]);
          if (got !== null) return got;
        }
        return null;
      };
      return perm(letters, []) ?? '';
    },
    compare: (got: string, expected: string, args: any[]) => {
      const words = args[0] as string[];
      if (expected === '') return got === '' || 'không tồn tại thứ tự hợp lệ → phải trả ""';
      if (got === '') return 'có thứ tự hợp lệ nhưng bạn trả ""';
      const letters = new Set(words.join('').split(''));
      if (got.length !== letters.size || new Set(got).size !== got.length || [...got].some((c) => !letters.has(c))) {
        return 'kết quả phải chứa mỗi chữ cái xuất hiện trong words đúng một lần';
      }
      const rank = new Map([...got].map((c, i) => [c, i]));
      for (let i = 0; i + 1 < words.length; i++) {
        const a = words[i];
        const b = words[i + 1];
        let j = 0;
        while (j < a.length && j < b.length && a[j] === b[j]) j++;
        if (j === a.length) continue;
        if (j === b.length) return `"${a}" đứng trước "${b}" là vô lý (tiền tố dài hơn đứng trước)`;
        if (rank.get(a[j])! > rank.get(b[j])!) return `"${a}" phải đứng trước "${b}" nhưng ${a[j]} xếp sau ${b[j]}`;
      }
      return true;
    },
    cases: [
      { args: [['wrt', 'wrf', 'er', 'ett', 'rftt']], expected: 'wertf' },
      { args: [['z', 'x']], expected: 'zx' },
      { args: [['z', 'x', 'z']], expected: '', note: 'z < x < z' },
      { args: [['abc', 'ab']], expected: '', note: 'tiền tố dài đứng trước' },
      { args: [['a']], expected: 'a' },
      { args: [['ab', 'ab']], expected: 'ab', note: 'cũng chấp nhận "ba" (không có ràng buộc)' },
      { args: [['ab', 'abc']], expected: 'abc', note: 'chấp nhận mọi hoán vị của a, b, c' },
      { args: [['a', 'b', 'a', 'b']], expected: '' },
      { args: [['ac', 'ab', 'zc', 'zb']], expected: 'azcb', note: 'c < b, a < z' },
      { args: [[...'zyxwvutsrqponmlkjihgfedcba']], expected: 'zyxwvutsrqponmlkjihgfedcba' },
      { args: [['a'.repeat(20_000) + 'b', 'a'.repeat(20_000) + 'a']], expected: 'ba', note: 'tiền tố chung dài 2·10⁴' },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const k = Math.max(1, n);
      if (big) {
        // thứ tự chữ cái ngẫu nhiên trên 26 chữ; sinh từ ngẫu nhiên rồi sort theo thứ tự đó → luôn hợp lệ
        const order = r.shuffle('abcdefghijklmnopqrstuvwxyz'.split(''));
        const rank = new Map(order.map((c, i) => [c, i]));
        const words = Array.from({ length: k }, () => r.string(r.int(1, 6)));
        words.sort((a, b) => {
          let i = 0;
          while (i < a.length && i < b.length && a[i] === b[i]) i++;
          if (i === a.length) return i === b.length ? 0 : -1;
          if (i === b.length) return 1;
          return rank.get(a[i])! - rank.get(b[i])!;
        });
        return [words];
      }
      const alpha = 'abcde'.slice(0, r.int(2, 5));
      const words = Array.from({ length: k }, () => r.string(r.int(1, 4), alpha));
      if (r.bool(0.65)) {
        const order = r.shuffle(alpha.split(''));
        const rank = new Map(order.map((c, i) => [c, i]));
        words.sort((a, b) => {
          let i = 0;
          while (i < a.length && i < b.length && a[i] === b[i]) i++;
          if (i === a.length) return i === b.length ? 0 : -1;
          if (i === b.length) return 1;
          return rank.get(a[i])! - rank.get(b[i])!;
        });
      }
      return [words];
    },
    stress: { runs: 300, minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 150 },
  },
  '05': {
    sig: 'int minimumSemesters(int n, int[][] relations)',
    title: 'Số học kỳ tối thiểu',
    ref: S.minimumSemesters,
    brute: (n: number, rel: number[][]) => {
      // mô phỏng từng học kỳ: học mọi môn mà mọi tiền đề đã học xong ở các kỳ trước
      const done = new Array<boolean>(n + 1).fill(false);
      let count = 0;
      let sem = 0;
      while (count < n) {
        const now: number[] = [];
        for (let v = 1; v <= n; v++) if (!done[v] && rel.every(([a, b]) => b !== v || done[a])) now.push(v);
        if (now.length === 0) return -1;
        for (const v of now) done[v] = true;
        count += now.length;
        sem++;
      }
      return sem;
    },
    cases: [
      { args: [3, [[1, 3], [2, 3]]], expected: 2 },
      { args: [3, [[1, 2], [2, 3], [3, 1]]], expected: -1 },
      { args: [1, []], expected: 1 },
      { args: [4, [[1, 2], [2, 3], [3, 4]]], expected: 4 },
      { args: [5, []], expected: 1 },
      { args: [4, [[1, 2], [1, 3], [2, 4], [3, 4], [1, 4]]], expected: 3, note: 'cạnh tắt 1→4 không làm ngắn hơn' },
      { args: [N, range(N - 1).map((i) => [i + 1, i + 2])], expected: N, note: 'chuỗi 2·10⁴' },
      { args: [N, range(N - 1).map((i) => [1, i + 2])], expected: 2, note: 'hình sao' },
      { args: [N, [...range(N - 1).map((i) => [i + 1, i + 2]), [N, 1]]], expected: -1 },
    ],
    gen: (n, r) => {
      const c = Math.max(1, n);
      const big = n > 1000;
      const edges = maybeCycle(dagEdges(c, 2 * c, r, big ? 3 : 4, big), c, r, big ? 0 : 0.3);
      return [c, edges.map(([u, v]) => [u + 1, v + 1])];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
  '06': {
    sig: 'List<Integer> eventualSafeNodes(int[][] graph)',
    title: 'Các node an toàn',
    ref: S.eventualSafeNodes,
    brute: (graph: number[][]) => {
      const n = graph.length;
      // reach[u] = tập node đi tới được bằng ≥ 1 cạnh
      const reach = range(n).map((u) => {
        const seen = new Set<number>();
        const stack = [...graph[u]];
        while (stack.length) {
          const v = stack.pop()!;
          if (seen.has(v)) continue;
          seen.add(v);
          stack.push(...graph[v]);
        }
        return seen;
      });
      // an toàn ⇔ không đi tới được node nằm trên chu trình (kể cả chính nó)
      return range(n).filter((u) => ![...reach[u]].some((v) => reach[v].has(v)) && !reach[u].has(u));
    },
    cases: [
      { args: [[[1, 2], [2, 3], [5], [0], [5], [], []]], expected: [2, 4, 5, 6] },
      { args: [[[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]], expected: [4] },
      { args: [[[]]], expected: [0] },
      { args: [[[1], [0]]], expected: [] },
      { args: [[[1], [2], []]], expected: [0, 1, 2] },
      { args: [[[1], [2], [1], [0]]], expected: [], note: 'mọi node đều tới được chu trình 1 ↔ 2' },
      { args: [[[], [0], [0], [1, 2]]], expected: [0, 1, 2, 3] },
      { args: [range(N).map((i) => (i < N - 1 ? [i + 1] : []))], expected: range(N), note: 'đường 2·10⁴ node, đều an toàn' },
      { args: [range(N).map((i) => (i < N - 1 ? [i + 1] : [N - 2]))], expected: [], note: 'đường 2·10⁴ node kết thúc bằng chu trình' },
    ],
    gen: (n, r) => {
      const c = Math.max(1, n);
      const big = n > 1000;
      // cạnh phân biệt, không tự trỏ. big: đường dài + vài cạnh "ngược" để một phần node không an toàn
      const perm = r.shuffle(range(c));
      const rows: Set<number>[] = Array.from({ length: c }, () => new Set<number>());
      const m = big ? 2 * c : Math.floor(c * 1.2);
      if (big) for (let i = 0; i + 1 < c; i++) rows[perm[i]].add(perm[i + 1]);
      for (let k = 0; k < m && c >= 2; k++) {
        const i = r.int(0, c - 1);
        let j: number;
        if (big) j = r.bool(0.0002) ? r.int(0, c - 1) : Math.min(c - 1, i + 1 + r.int(0, 3));
        else j = r.int(0, c - 1);
        if (i !== j) rows[perm[i]].add(perm[j]);
      }
      return [rows.map((s) => r.shuffle([...s]))];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '07': {
    sig: 'String[] migrationOrder(String[] names, String[][] deps)',
    title: '🔴 Thứ tự chạy migration',
    ref: S.migrationOrder,
    brute: (names: string[], deps: string[][]) => {
      const done = new Set<string>();
      const out: string[] = [];
      while (out.length < names.length) {
        const cands = names.filter((v) => !done.has(v) && deps.every(([a, b]) => a !== v || done.has(b)));
        if (cands.length === 0) return [];
        cands.sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
        done.add(cands[0]);
        out.push(cands[0]);
      }
      return out;
    },
    cases: [
      { args: [['b', 'a', 'c'], [['c', 'a']]], expected: ['a', 'b', 'c'] },
      { args: [['m2', 'm1'], [['m1', 'm2']]], expected: ['m2', 'm1'], note: 'm1 phụ thuộc m2' },
      { args: [['c', 'a', 'b'], [['a', 'c']]], expected: ['b', 'c', 'a'] },
      { args: [['x'], []], expected: ['x'] },
      { args: [['a', 'b'], [['a', 'b'], ['b', 'a']]], expected: [] },
      { args: [['a', 'ab', 'b'], []], expected: ['a', 'ab', 'b'], note: '"a" < "ab" (tiền tố)' },
      { args: [['u_2', 'u_10', 'u_1'], []], expected: ['u_1', 'u_10', 'u_2'], note: 'so chuỗi, không phải so số' },
      { args: [['a', 'b', 'c'], [['b', 'a'], ['b', 'a'], ['c', 'b']]], expected: ['a', 'b', 'c'], note: 'khai báo trùng' },
      {
        args: [range(N).map((i) => 'm' + String(i).padStart(6, '0')), range(N - 1).map((i) => ['m' + String(i).padStart(6, '0'), 'm' + String(i + 1).padStart(6, '0')])],
        expected: range(N).reverse().map((i) => 'm' + String(i).padStart(6, '0')),
        note: 'chuỗi phụ thuộc 2·10⁴ migration',
      },
    ],
    gen: (n, r) => {
      const c = Math.max(1, n);
      const big = n > 1000;
      const seen = new Set<string>();
      const names: string[] = [];
      while (names.length < c) {
        const s = r.string(r.int(big ? 5 : 1, big ? 10 : 3), big ? 'abcdefghijklmnopqrstuvwxyz0123456789_' : 'abc');
        if (!seen.has(s)) {
          seen.add(s);
          names.push(s);
        }
        if (!big && seen.size >= 39) break; // miền tên nhỏ: dừng khi hết tên phân biệt
      }
      const k = names.length;
      const edges = maybeCycle(dagEdges(k, big ? Math.floor(k * 1.2) : 2 * k, r, big ? 50 : 4), k, r, big ? 0 : 0.25);
      // [u, v]: u trước v → deps [v, u] (v phụ thuộc u)
      return [names, edges.map(([u, v]) => [names[v], names[u]])];
    },
    perf: { n: 1e5, limitMs: 700 },
  },
  '08': {
    sig: 'long minBuildTime(int n, int[][] deps, int[] duration)',
    title: '🔴 Thời gian build tối thiểu',
    ref: S.minBuildTime,
    brute: (n: number, deps: number[][], dur: number[]) => {
      // relaxation lặp tới khi hết thay đổi: fin[v] = dur[v] + max fin[u]
      const fin = dur.slice();
      for (let changed = true; changed; ) {
        changed = false;
        for (const [a, b] of deps) {
          if (fin[b] + dur[a] > fin[a]) {
            fin[a] = fin[b] + dur[a];
            changed = true;
          }
        }
      }
      return Math.max(0, ...fin);
    },
    cases: [
      { args: [3, [[2, 0], [2, 1]], [3, 4, 2]], expected: 6 },
      { args: [1, [], [5]], expected: 5 },
      { args: [3, [], [1, 2, 3]], expected: 3, note: 'chạy song song' },
      { args: [3, [[1, 0], [2, 1]], [1_000_000_000, 1_000_000_000, 1_000_000_000]], expected: 3_000_000_000, note: 'bẫy tràn int Java' },
      { args: [5, [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3]], [2, 3, 1, 4, 1]], expected: 10 },
      { args: [4, [[3, 0], [3, 1]], [1, 1, 100, 1]], expected: 100, note: 'node độc lập dài 100 → đáp án là max mọi node' },
      { args: [N, chainReq(N), Array(N).fill(1_000_000_000)], expected: 20_000_000_000_000, note: 'chuỗi 2·10⁴ × 10⁹ = 2·10¹³' },
    ],
    gen: (n, r) => {
      const c = Math.max(1, n);
      const big = n > 1000;
      const edges = dagEdges(c, 2 * c, r, big ? 3 : 4, big);
      // [u, v]: u trước v → deps [v, u]
      return [c, edges.map(([u, v]) => [v, u]), r.array(c, 1, big ? 1_000_000_000 : 10)];
    },
    perf: { n: 1e5, limitMs: 200, java: 1000 },
  },
};
