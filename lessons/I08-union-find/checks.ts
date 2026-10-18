import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const chain = (n: number) => Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);

/** Nhãn thành phần bằng lan truyền nhãn nhỏ nhất (độc lập với DSU). */
function labels(n: number, edges: number[][]): number[] {
  const lab = range(n);
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

/** Cây ngẫu nhiên n đỉnh (nhãn được xáo), cạnh có hướng ngẫu nhiên. */
function randTree(n: number, r: Rng): number[][] {
  const perm = r.shuffle(range(n));
  const out: number[][] = [];
  for (let i = 1; i < n; i++) {
    const p = perm[r.int(0, i - 1)];
    out.push(r.bool() ? [p, perm[i]] : [perm[i], p]);
  }
  return out;
}

/** Cạnh ngẫu nhiên, CHO PHÉP trùng và khuyên. */
const looseEdges = (n: number, m: number, r: Rng) => Array.from({ length: m }, () => [r.int(0, n - 1), r.int(0, n - 1)]);

/** Sinh dãy thao tác cho class UnionFind: perf → nửa đầu xích chuỗi union(i, i+1), nửa sau find/connected sâu. */
function ufOps(n: number, r: Rng): [string[], any[][]] {
  const big = n > 1000;
  const size = big ? n : r.int(1, Math.max(1, Math.min(n, 12)));
  const ops = ['UnionFind'];
  const args: any[][] = [[size]];
  const total = big ? n : n + 1;
  for (let i = 0; i < total; i++) {
    let op: string;
    if (big) op = i < n / 2 ? 'union' : r.pick(['find', 'find', 'connected']);
    else op = r.pick(['union', 'union', 'find', 'connected', 'count']);
    ops.push(op);
    if (op === 'count') args.push([]);
    else if (op === 'find') args.push([big ? r.int(0, 20) : r.int(0, size - 1)]); // nút gần đầu xích → sâu nhất
    else if (op === 'union') args.push(big ? [i, i + 1] : [r.int(0, size - 1), r.int(0, size - 1)]);
    else args.push(big ? [r.int(0, 20), r.int(0, size - 1)] : [r.int(0, size - 1), r.int(0, size - 1)]);
  }
  return [ops, args];
}

class QuickFind {
  lab: number[];
  comps: number;
  constructor(n: number) {
    this.lab = range(n);
    this.comps = n;
  }
  find(x: number) {
    return this.lab[x];
  }
  union(a: number, b: number) {
    const [la, lb] = [this.lab[a], this.lab[b]];
    if (la === lb) return false;
    this.lab = this.lab.map((v) => (v === lb ? la : v));
    this.comps--;
    return true;
  }
  connected(a: number, b: number) {
    return this.lab[a] === this.lab[b];
  }
  count() {
    return this.comps;
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class UnionFind {\n  UnionFind(int n)\n  int find(int x)\n  boolean union(int a, int b)\n  boolean connected(int a, int b)\n  int count()\n}',
    title: 'Tự cài Union-Find',
    ref: S.UnionFind,
    brute: QuickFind,
    // find(x) có thể trả bất kỳ phần tử nào của nhóm; yêu cầu nhất quán: giữa hai lần union thành công, cùng nhóm ⇒ cùng đại diện, khác nhóm ⇒ khác.
    compare: (got, expected, [ops, opArgs]) => {
      if (!Array.isArray(got) || got.length !== ops.length) return 'sai số lượng kết quả';
      const n = (opArgs as any[][])[0][0] as number;
      // DSU riêng của bộ chấm (nén đường + gộp theo size) để mô phỏng nhóm đúng, kể cả ở n = 2·10⁵
      const par = Int32Array.from(range(n));
      const sz = new Int32Array(n).fill(1);
      const find = (x: number) => {
        while (par[x] !== x) (par[x] = par[par[x]]), (x = par[x]);
        return x;
      };
      const rootOfGroup = new Map<number, number>(); // gốc của bộ chấm → đại diện bài làm đã trả
      const groupOfRep = new Map<number, number>(); // đại diện bài làm → gốc của bộ chấm
      for (let i = 1; i < ops.length; i++) {
        const [x, y] = (opArgs as any[][])[i];
        if (ops[i] === 'find') {
          const r = got[i];
          if (!Number.isInteger(r) || r < 0 || r >= n) return `find(${x}) trả về ${r}, không phải phần tử hợp lệ`;
          const g = find(x);
          if (find(r) !== g) return `find(${x}) = ${r} nhưng ${r} không cùng nhóm với ${x}`;
          if ((rootOfGroup.get(g) ?? r) !== r) return `find(${x}) = ${r} khác lần trước (${rootOfGroup.get(g)}) dù chưa có union nào xen giữa`;
          if ((groupOfRep.get(r) ?? g) !== g) return `hai nhóm khác nhau cùng có đại diện ${r}`;
          rootOfGroup.set(g, r);
          groupOfRep.set(r, g);
          continue;
        }
        if (got[i] !== expected[i]) return `thao tác ${i} (${ops[i]}): nhận ${JSON.stringify(got[i])}, kỳ vọng ${JSON.stringify(expected[i])}`;
        if (ops[i] === 'union' && expected[i]) {
          let ra = find(x);
          let rb = find(y);
          if (sz[ra] < sz[rb]) [ra, rb] = [rb, ra];
          par[rb] = ra;
          sz[ra] += sz[rb];
          rootOfGroup.clear();
          groupOfRep.clear();
        }
      }
      return true;
    },
    cases: [
      {
        args: [['UnionFind', 'union', 'union', 'connected', 'count', 'union', 'find', 'find', 'connected'], [[5], [0, 1], [1, 2], [0, 2], [], [0, 2], [0], [2], [0, 4]]],
        expected: [null, true, true, true, 3, false, 0, 0, false],
        note: 'find: mọi đại diện hợp lệ đều được chấp nhận (miễn nhất quán)',
      },
      { args: [['UnionFind', 'count', 'union', 'union', 'count'], [[3], [], [0, 0], [0, 1], []]], expected: [null, 3, false, true, 2] },
      { args: [['UnionFind', 'find', 'connected'], [[1], [0], [0, 0]]], expected: [null, 0, true] },
    ],
    gen: ufOps,
    stress: { runs: 300, minN: 0, maxN: 30 },
    perf: { n: 2e5, limitMs: 500 },
  },
  '02': {
    sig: 'int[] findRedundantConnection(int[][] edges)',
    title: 'Cạnh thừa tạo chu trình',
    ref: S.findRedundantConnection,
    brute: (edges: number[][]) => {
      const n = edges.length;
      // thử bỏ từng cạnh từ cuối về đầu; còn lại phải là cây (liên thông)
      for (let i = n - 1; i >= 0; i--) {
        const rest = edges.filter((_, j) => j !== i);
        if (comps(n, rest) === 1) return edges[i];
      }
      return [];
    },
    cases: [
      { args: [[[0, 1], [0, 2], [1, 2]]], expected: [1, 2] },
      { args: [[[0, 1], [1, 2], [2, 3], [0, 3], [0, 4]]], expected: [0, 3] },
      { args: [[[1, 0], [2, 1], [0, 2]]], expected: [0, 2], note: 'giữ nguyên thứ tự [u, v] như input' },
      { args: [[...chain(100000), [99999, 0]]], expected: [99999, 0], note: 'vòng 10⁵ đỉnh' },
    ],
    gen: (n, r) => {
      const v = Math.max(3, n);
      const tree = randTree(v, r);
      const adj = new Set(tree.map(([a, b]) => Math.min(a, b) * v + Math.max(a, b)));
      let extra: number[];
      do extra = [r.int(0, v - 1), r.int(0, v - 1)];
      while (extra[0] === extra[1] || adj.has(Math.min(...extra) * v + Math.max(...extra)));
      return [r.shuffle([...tree, extra])];
    },
    stress: { runs: 300, minN: 3, maxN: 30 },
    perf: { n: 1e5, limitMs: 150 },
  },
  '03': {
    sig: 'int[] componentsAfterEach(int n, int[][] edges)',
    title: 'Số thành phần sau mỗi cạnh',
    ref: S.componentsAfterEach,
    brute: (n: number, edges: number[][]) => edges.map((_, i) => comps(n, edges.slice(0, i + 1))),
    cases: [
      { args: [4, [[0, 1], [2, 3], [1, 2]]], expected: [3, 2, 1] },
      { args: [2, [[0, 0], [0, 1], [1, 0]]], expected: [2, 1, 1], note: 'khuyên và cạnh trùng' },
      { args: [3, []], expected: [] },
      { args: [100000, chain(100000)], expected: Array.from({ length: 99999 }, (_, i) => 99999 - i) },
    ],
    gen: (n, r) => {
      const v = Math.max(1, n);
      return [v, looseEdges(v, n > 1000 ? 2 * v : r.int(0, v + 3), r)];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
  '04': {
    sig: 'boolean equationsPossible(String[] equations)',
    title: 'Hệ phương trình bằng / khác',
    ref: S.equationsPossible,
    brute: (eqs: string[]) => {
      const letters = [...new Set(eqs.map((e) => e[0] + e[3]).join(''))];
      const k = letters.length;
      const val = new Map<string, number>();
      const tryAssign = (i: number): boolean => {
        if (i === k) return eqs.every((e) => (val.get(e[0]) === val.get(e[3])) === (e[1] === '='));
        for (let v = 0; v < k; v++) {
          val.set(letters[i], v);
          if (tryAssign(i + 1)) return true;
        }
        return false;
      };
      return tryAssign(0);
    },
    cases: [
      { args: [['a==b', 'b!=a']], expected: false },
      { args: [['b==a', 'a==b']], expected: true },
      { args: [['a==b', 'b==c', 'a==c']], expected: true },
      { args: [['a==b', 'b!=c', 'c==a']], expected: false },
      { args: [['c==c', 'b==d', 'x!=z']], expected: true },
      { args: [['a!=a']], expected: false },
      { args: [['a!=b', 'b==c', 'a==c']], expected: false, note: '"!=" đứng trước "==" — phải xét sau' },
    ],
    gen: (n, r) => {
      const k = r.int(1, 5);
      const alpha = 'abcde'.slice(0, k);
      return [Array.from({ length: Math.max(1, n) }, () => `${r.pick([...alpha])}${r.pick(['==', '!='])}${r.pick([...alpha])}`)];
    },
    perf: false, // chỉ 26 chữ cái → mọi cách làm hợp lý đều rất nhanh; không có thang n để phân biệt Big-O
  },
  '05': {
    sig: 'List<List<String>> accountsMerge(List<List<String>> accounts)',
    title: 'Gộp tài khoản',
    ref: S.accountsMerge,
    brute: (accounts: string[][]) => {
      let groups = accounts.map((a) => ({ name: a[0], emails: new Set(a.slice(1)) }));
      for (let merged = true; merged; ) {
        merged = false;
        for (let i = 0; i < groups.length && !merged; i++)
          for (let j = i + 1; j < groups.length && !merged; j++)
            if ([...groups[i].emails].some((e) => groups[j].emails.has(e))) {
              groups[j].emails.forEach((e) => groups[i].emails.add(e));
              groups = groups.filter((_, k) => k !== j);
              merged = true;
            }
      }
      return groups.map((g) => [g.name, ...[...g.emails].sort()]);
    },
    compare: 'unordered', // thứ tự các nhóm tùy ý; thứ tự email TRONG nhóm phải tăng dần
    cases: [
      {
        args: [[['John', 'johnsmith@mail.com', 'john_newyork@mail.com'], ['John', 'johnsmith@mail.com', 'john00@mail.com'], ['Mary', 'mary@mail.com'], ['John', 'johnnybravo@mail.com']]],
        expected: [['John', 'john00@mail.com', 'john_newyork@mail.com', 'johnsmith@mail.com'], ['Mary', 'mary@mail.com'], ['John', 'johnnybravo@mail.com']],
      },
      { args: [[['A', 'x', 'y'], ['A', 'z', 'w'], ['A', 'y', 'z']]], expected: [['A', 'w', 'x', 'y', 'z']], note: 'nối bắc cầu' },
      { args: [[['Bob', 'b1']]], expected: [['Bob', 'b1']] },
      { args: [[['A', 'x'], ['A', 'x']]], expected: [['A', 'x']], note: 'trùng hoàn toàn' },
    ],
    gen: (n, r) => {
      const pool = Math.max(3, n > 1000 ? 2 * n : Math.floor(n * 0.7) + 2);
      const name = (cls: number) => ['A', 'B', 'C'][cls]; // email thuộc lớp e % 3 → cùng email luôn cùng tên
      return [
        Array.from({ length: n }, () => {
          const cls = r.int(0, 2);
          const es = [...new Set(range(r.int(1, 3)).map(() => 3 * r.int(0, Math.floor(pool / 3)) + cls))];
          return [name(cls), ...es.map((e) => `e${e}@x.y`)];
        }),
      ];
    },
    perf: { n: 20000, limitMs: 400 },
  },
  '06': {
    sig: 'List<Integer> numIslands2(int m, int n, int[][] positions)',
    title: 'Đảo xuất hiện dần',
    ref: S.numIslands2,
    brute: (m: number, n: number, positions: number[][]) => {
      const land = Array.from({ length: m }, () => new Array(n).fill(false));
      return positions.map(([r, c]) => {
        land[r][c] = true;
        const seen = land.map((row) => row.map(() => false));
        let cnt = 0;
        const flood = (a: number, b: number) => {
          if (a < 0 || b < 0 || a >= m || b >= n || !land[a][b] || seen[a][b]) return;
          seen[a][b] = true;
          flood(a + 1, b), flood(a - 1, b), flood(a, b + 1), flood(a, b - 1);
        };
        for (let a = 0; a < m; a++) for (let b = 0; b < n; b++) if (land[a][b] && !seen[a][b]) (cnt++, flood(a, b));
        return cnt;
      });
    },
    cases: [
      { args: [3, 3, [[0, 0], [0, 1], [1, 2], [2, 1]]], expected: [1, 1, 2, 3] },
      { args: [1, 1, [[0, 0]]], expected: [1] },
      { args: [2, 2, [[0, 0], [0, 0], [1, 1], [0, 1]]], expected: [1, 1, 2, 1], note: 'thêm lại ô đã là đất' },
      { args: [5, 5, []], expected: [] },
    ],
    gen: (n, r) => {
      const [m, w] = n > 1000 ? [1000, 1000] : [r.int(1, 6), r.int(1, 6)];
      const k = n > 1000 ? n : n;
      return [m, w, Array.from({ length: k }, () => [r.int(0, m - 1), r.int(0, w - 1)])];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '07': {
    sig: 'int earliestAcq(int[][] logs, int n)',
    title: 'Thời điểm mọi người quen nhau',
    ref: S.earliestAcq,
    brute: (logs: number[][], n: number) => {
      const sorted = logs.slice().sort((a, b) => a[0] - b[0]);
      for (let i = 0; i < sorted.length; i++) if (comps(n, sorted.slice(0, i + 1).map(([, x, y]) => [x, y])) === 1) return sorted[i][0];
      return -1;
    },
    cases: [
      {
        args: [[[20190101, 0, 1], [20190104, 3, 4], [20190107, 2, 3], [20190211, 1, 5], [20190224, 2, 4], [20190301, 0, 3], [20190312, 1, 2], [20190322, 4, 5]], 6],
        expected: 20190301,
      },
      { args: [[[0, 2, 0], [1, 0, 1], [3, 0, 3], [4, 1, 2], [7, 3, 1]], 4], expected: 3, note: 'log không sắp theo thời gian' },
      { args: [[[1, 0, 1]], 3], expected: -1 },
      { args: [[[5, 0, 1]], 2], expected: 5 },
    ],
    gen: (n, r) => {
      const v = Math.max(2, n);
      const edges = r.bool(0.6) || n > 1000 ? randTree(v, r) : [];
      const extra = looseEdges(v, n > 1000 ? v : r.int(0, v), r).filter(([a, b]) => a !== b);
      const all = r.shuffle([...edges, ...extra]);
      const ts = r.distinct(all.length, 0, Math.max(60, 3 * all.length));
      return [all.map(([a, b], i) => [ts[i], a, b]), v];
    },
    stress: { runs: 300, minN: 2, maxN: 30 },
    perf: { n: 1e5, limitMs: 1500 },
  },
  '08': {
    sig: 'String smallestStringWithSwaps(String s, int[][] pairs)',
    title: 'Chuỗi nhỏ nhất sau các hoán đổi',
    ref: S.smallestStringWithSwaps,
    brute: (s: string, pairs: number[][]) => {
      // BFS qua mọi chuỗi đạt được bằng cách hoán đổi theo các cặp; lấy chuỗi nhỏ nhất
      const seen = new Set<string>([s]);
      const q = [s];
      let best = s;
      for (let h = 0; h < q.length; h++) {
        const cur = q[h];
        if (cur < best) best = cur;
        for (const [a, b] of pairs) {
          const t = cur.split('');
          [t[a], t[b]] = [t[b], t[a]];
          const nx = t.join('');
          if (!seen.has(nx)) (seen.add(nx), q.push(nx));
        }
      }
      return best;
    },
    cases: [
      { args: ['dcab', [[0, 3], [1, 2]]], expected: 'bacd' },
      { args: ['dcab', [[0, 3], [1, 2], [0, 2]]], expected: 'abcd' },
      { args: ['cba', [[0, 1], [1, 2]]], expected: 'abc' },
      { args: ['a', []], expected: 'a' },
      { args: ['bca', [[0, 2], [1, 2]]], expected: 'abc', note: 'cặp (0,2) và (1,2): 0 và 1 cùng nhóm qua 2' },
      {
        args: [Array.from({ length: 100000 }, (_, i) => String.fromCharCode(97 + ((i * 7) % 26))).join(''), chain(100000)],
        expected: Array.from({ length: 100000 }, (_, i) => String.fromCharCode(97 + ((i * 7) % 26))).sort().join(''),
        note: '10⁵ ký tự, một nhóm: kết quả là chuỗi đã sắp',
      },
    ],
    gen: (n, r) => {
      const len = n > 1000 ? n : Math.max(1, Math.min(n, 7));
      const pairs = Array.from({ length: n > 1000 ? n : r.int(0, len + 2) }, () => [r.int(0, len - 1), r.int(0, len - 1)]);
      return [r.string(len, n > 1000 ? 'abcdefghijklmnopqrstuvwxyz' : 'abcd'), pairs];
    },
    stress: { runs: 300, minN: 1, maxN: 7 },
    perf: { n: 1e5, limitMs: 500 },
  },
};
