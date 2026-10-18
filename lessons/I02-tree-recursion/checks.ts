import type { Spec } from '../../tools/spec.ts';
import { buildTree as buildFrom, type Rng, type TreeNode } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Cây ngẫu nhiên giá trị khác nhau (đổi nhãn các node thành hoán vị 1..n). */
const distinctTree = (n: number, r: Rng) => {
  const a = r.tree(n);
  const labels = r.shuffle(Array.from({ length: n }, (_, i) => i + 1));
  let k = 0;
  return a.map((v) => (v === null ? null : labels[k++]));
};
const vals = (a: (number | null)[]) => a.filter((v): v is number => v !== null);

/** Danh sách mọi node + cha + độ sâu (dùng cho brute). */
const nodesOf = (root: TreeNode | null) => {
  const out: { node: TreeNode; parent: TreeNode | null; depth: number }[] = [];
  const st: [TreeNode | null, TreeNode | null, number][] = [[root, null, 0]];
  while (st.length) {
    const [n, p, d] = st.pop()!;
    if (!n) continue;
    out.push({ node: n, parent: p, depth: d });
    st.push([n.left, n, d + 1], [n.right, n, d + 1]);
  }
  return out;
};
const heightOf = (n: TreeNode | null): number => (n ? 1 + Math.max(heightOf(n.left), heightOf(n.right)) : 0);
const ancestors = (root: TreeNode | null, v: number) => {
  const info = nodesOf(root);
  const parent = new Map(info.map((x) => [x.node, x.parent]));
  let cur = info.find((x) => x.node.val === v)!.node as TreeNode | null;
  const chain: TreeNode[] = [];
  while (cur) {
    chain.push(cur);
    cur = parent.get(cur) ?? null;
  }
  return chain; // từ v lên gốc
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int diameterOfBinaryTree(TreeNode root)',
    title: 'Đường kính cây',
    ref: S.diameterOfBinaryTree,
    brute: (root: TreeNode | null) => {
      // BFS từ mọi node trên đồ thị vô hướng tương ứng
      const info = nodesOf(root);
      const adj = new Map<TreeNode, TreeNode[]>(info.map((x) => [x.node, []]));
      for (const x of info) if (x.parent) (adj.get(x.node)!.push(x.parent), adj.get(x.parent)!.push(x.node));
      let best = 0;
      for (const s of info) {
        const dist = new Map([[s.node, 0]]);
        const q = [s.node];
        for (let h = 0; h < q.length; h++) for (const nb of adj.get(q[h])!) if (!dist.has(nb)) (dist.set(nb, dist.get(q[h])! + 1), q.push(nb));
        best = Math.max(best, ...dist.values());
      }
      return best;
    },
    cases: [
      { args: [[1, 2, 3, 4, 5]], expected: 3 },
      { args: [[1, 2]], expected: 1 },
      { args: [[1]], expected: 0 },
      { args: [[1, 2, null, 3, 4, 5, null, null, 6]], expected: 4, note: 'đường dài nhất không đi qua gốc' },
    ],
    gen: (n, r) => [r.tree(Math.max(1, n))],
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'boolean isBalanced(TreeNode root)',
    title: 'Cây cân bằng',
    ref: S.isBalanced,
    brute: (root: TreeNode | null) => nodesOf(root).every(({ node }) => Math.abs(heightOf(node.left) - heightOf(node.right)) <= 1),
    cases: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: true },
      { args: [[1, 2, 2, 3, 3, null, null, 4, 4]], expected: false },
      { args: [[]], expected: true },
      { args: [[1, 2, 2, 3, null, null, 3, 4, null, null, 4]], expected: false, note: 'gốc cân bằng nhưng node con thì không' },
    ],
    gen: (n, r) => [r.tree(n)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'boolean hasPathSum(TreeNode root, int targetSum)',
    title: 'Có đường gốc → lá với tổng cho trước?',
    ref: S.hasPathSum,
    brute: (root: TreeNode | null, t: number) => {
      const info = nodesOf(root);
      const parent = new Map(info.map((x) => [x.node, x.parent]));
      return info.some(({ node }) => {
        if (node.left || node.right) return false;
        let s = 0;
        for (let c: TreeNode | null = node; c; c = parent.get(c) ?? null) s += c.val;
        return s === t;
      });
    },
    cases: [
      { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22], expected: true },
      { args: [[1, 2, 3], 5], expected: false },
      { args: [[], 0], expected: false },
      { args: [[1, 2], 1], expected: false, note: 'node 1 không phải lá' },
    ],
    gen: (n, r) => [r.tree(n, -3, 3), r.int(-6, 6)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'List<List<Integer>> pathSumAll(TreeNode root, int targetSum)',
    title: 'Liệt kê mọi đường có tổng cho trước',
    ref: S.pathSumAll,
    brute: (root: TreeNode | null, t: number) => {
      const info = nodesOf(root);
      const parent = new Map(info.map((x) => [x.node, x.parent]));
      const out: number[][] = [];
      for (const { node } of info) {
        if (node.left || node.right) continue;
        const path: number[] = [];
        for (let c: TreeNode | null = node; c; c = parent.get(c) ?? null) path.unshift(c.val);
        if (path.reduce((a, b) => a + b, 0) === t) out.push(path);
      }
      return out;
    },
    compare: 'unordered',
    cases: [
      { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22], expected: [[5, 4, 11, 2], [5, 8, 4, 5]] },
      { args: [[1, 2, 3], 5], expected: [] },
      { args: [[], 0], expected: [] },
    ],
    gen: (n, r) => [r.tree(n, -2, 2), r.int(-3, 3)],
    perf: { n: 5000, limitMs: 100 },
  },
  '05': {
    sig: 'int lowestCommonAncestor(TreeNode root, int p, int q)',
    title: 'Tổ tiên chung gần nhất',
    ref: S.lowestCommonAncestor,
    brute: (root: TreeNode | null, p: number, q: number) => {
      const ap = ancestors(root, p);
      const aq = new Set(ancestors(root, q));
      return ap.find((x) => aq.has(x))!.val;
    },
    cases: [
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expected: 3 },
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expected: 5 },
      { args: [[1, 2], 1, 2], expected: 1 },
    ],
    gen: (n, r) => {
      const t = distinctTree(Math.max(2, n), r);
      const v = vals(t);
      return [t, r.pick(v), r.pick(v)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '06': {
    sig: 'int maxPathSum(TreeNode root)',
    title: 'Tổng đường đi lớn nhất',
    ref: S.maxPathSum,
    brute: (root: TreeNode | null) => {
      // mọi cặp (u, v): tổng trên đường u → LCA → v
      const info = nodesOf(root);
      const parent = new Map(info.map((x) => [x.node, x.parent]));
      const up = (n: TreeNode) => {
        const c: TreeNode[] = [];
        for (let x: TreeNode | null = n; x; x = parent.get(x) ?? null) c.push(x);
        return c;
      };
      let best = -Infinity;
      for (const a of info) for (const b of info) {
        const ua = up(a.node);
        const ub = up(b.node);
        const sb = new Set(ub);
        const lca = ua.find((x) => sb.has(x))!;
        let s = 0;
        for (const x of ua) { s += x.val; if (x === lca) break; }
        for (const x of ub) { if (x === lca) break; s += x.val; }
        best = Math.max(best, s);
      }
      return best;
    },
    cases: [
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[-10, 9, 20, null, null, 15, 7]], expected: 42 },
      { args: [[-3]], expected: -3 },
      { args: [[2, -1]], expected: 2 },
    ],
    gen: (n, r) => [r.tree(Math.max(1, n), -10, 10)],
    stress: { runs: 300, maxN: 25 },
    perf: { n: 30_000, limitMs: 100 },
  },
  '07': {
    sig: 'TreeNode buildTree(int[] preorder, int[] inorder)',
    title: 'Dựng cây từ pre-order + in-order',
    ref: S.buildTree,
    brute: (pre: number[], ino: number[]) => {
      const build = (p: number[], i: number[]): (number | null)[] => {
        // dựng bằng đệ quy slice (chậm, hiển nhiên đúng) rồi trả mảng level-order
        type N = { v: number; l: N | null; r: N | null };
        const go = (pp: number[], ii: number[]): N | null => {
          if (!pp.length) return null;
          const k = ii.indexOf(pp[0]);
          return { v: pp[0], l: go(pp.slice(1, k + 1), ii.slice(0, k)), r: go(pp.slice(k + 1), ii.slice(k + 1)) };
        };
        const root = go(p, i);
        const out: (number | null)[] = [];
        const q: (N | null)[] = [root];
        for (let h = 0; h < q.length; h++) {
          const x = q[h];
          if (x) (out.push(x.v), q.push(x.l, x.r));
          else out.push(null);
        }
        while (out.length && out[out.length - 1] === null) out.pop();
        return out;
      };
      return build(pre, ino);
    },
    cases: [
      { args: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]], expected: [3, 9, 20, null, null, 15, 7] },
      { args: [[-1], [-1]], expected: [-1] },
      { args: [[1, 2], [2, 1]], expected: [1, 2] },
    ],
    gen: (n, r) => {
      const t = distinctTree(Math.max(1, n), r);
      // lấy pre/in-order từ mảng level-order bằng TreeNode tạm
      const root = buildFrom(t);
      const pre: number[] = [];
      const ino: number[] = [];
      const go = (x: TreeNode | null) => {
        if (!x) return;
        pre.push(x.val);
        go(x.left);
        ino.push(x.val);
        go(x.right);
      };
      go(root);
      return [pre, ino];
    },
    perf: { n: 3000, limitMs: 50 },
  },
  '08': {
    sig: 'String serialize(TreeNode root)',
    title: 'Serialize cây',
    ref: S.serialize,
    brute: (root: TreeNode | null) => {
      const out: string[] = [];
      const go = (x: TreeNode | null) => {
        if (!x) return void out.push('#');
        out.push(String(x.val));
        go(x.left);
        go(x.right);
      };
      go(root);
      return out.join(',');
    },
    cases: [
      { args: [[1, 2, 3, null, null, 4, 5]], expected: '1,2,#,#,3,4,#,#,5,#,#' },
      { args: [[]], expected: '#' },
      { args: [[-7]], expected: '-7,#,#' },
    ],
    gen: (n, r) => [r.bool(0.3) ? r.skewedTree(n, -50, 50) : r.tree(n, -50, 50)],
    perf: { n: 10_000, limitMs: 50 },
  },
  '09': {
    sig: 'TreeNode deserialize(String data)',
    title: 'Deserialize cây',
    ref: S.deserialize,
    brute: (data: string) => {
      const tok = data.split(',');
      let i = 0;
      type N = { v: number; l: N | null; r: N | null };
      const go = (): N | null => {
        const t = tok[i++];
        if (t === '#') return null;
        const n: N = { v: Number(t), l: null, r: null };
        n.l = go();
        n.r = go();
        return n;
      };
      const root = go();
      const out: (number | null)[] = [];
      const q: (N | null)[] = [root];
      for (let h = 0; h < q.length; h++) {
        const x = q[h];
        if (x) (out.push(x.v), q.push(x.l, x.r));
        else out.push(null);
      }
      while (out.length && out[out.length - 1] === null) out.pop();
      return out;
    },
    cases: [
      { args: ['1,2,#,#,3,4,#,#,5,#,#'], expected: [1, 2, 3, null, null, 4, 5] },
      { args: ['#'], expected: [] },
      { args: ['-7,#,#'], expected: [-7] },
    ],
    gen: (n, r) => [S.serialize(buildFrom(r.bool(0.3) ? r.skewedTree(n, -50, 50) : r.tree(n, -50, 50)))],
    perf: { n: 10_000, limitMs: 50 },
  },
  '10': {
    sig: 'int distanceBetween(TreeNode root, int a, int b)',
    title: 'Khoảng cách giữa hai nhân viên',
    ref: S.distanceBetween,
    brute: (root: TreeNode | null, a: number, b: number) => {
      const ua = ancestors(root, a);
      const ub = ancestors(root, b);
      const sb = new Set(ub);
      const i = ua.findIndex((x) => sb.has(x));
      return i + ub.indexOf(ua[i]);
    },
    cases: [
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 0], expected: 3 },
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 7, 4], expected: 2 },
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 5], expected: 0 },
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 3, 7], expected: 3, note: 'một người là cấp trên của người kia' },
    ],
    gen: (n, r) => {
      const t = distinctTree(Math.max(1, n), r);
      const v = vals(t);
      return [t, r.pick(v), r.pick(v)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
};
