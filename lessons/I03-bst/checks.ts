import type { Spec } from '../../tools/spec.ts';
import { buildTree, TreeNode, type Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const inorderOf = (root: TreeNode | null) => {
  const out: number[] = [];
  const st: TreeNode[] = [];
  let c = root;
  while (c || st.length) {
    while (c) (st.push(c), (c = c.left));
    c = st.pop()!;
    out.push(c.val);
    c = c.right;
  }
  return out;
};
const valsOf = (a: (number | null)[]) => a.filter((v): v is number => v !== null);
const heightArr = (a: (number | null)[]) => {
  const h = (n: TreeNode | null): number => (n ? 1 + Math.max(h(n.left), h(n.right)) : 0);
  return h(buildTree(a));
};
const isBstArr = (a: (number | null)[]) => {
  const ino = inorderOf(buildTree(a));
  return ino.every((v, i) => i === 0 || ino[i - 1] < v);
};
const bstGen = (n: number, r: Rng) => r.bst(Math.max(1, n), 0, n > 1000 ? 1e9 : Math.max(60, 3 * n));

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'TreeNode searchBST(TreeNode root, int val)',
    title: 'Tìm trong BST',
    ref: S.searchBST,
    brute: (root: TreeNode | null, v: number) => {
      const st = [root];
      while (st.length) {
        const n = st.pop();
        if (!n) continue;
        if (n.val === v) return n;
        st.push(n.left, n.right);
      }
      return null;
    },
    cases: [
      { args: [[4, 2, 7, 1, 3], 2], expected: [2, 1, 3] },
      { args: [[4, 2, 7, 1, 3], 5], expected: [] },
    ],
    gen: (n, r) => {
      const t = bstGen(n, r);
      return [t, r.bool() ? r.pick(valsOf(t)) : r.int(0, 61)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'TreeNode insertIntoBST(TreeNode root, int val)',
    title: 'Chèn vào BST',
    ref: S.insertIntoBST,
    brute: (root: TreeNode | null, v: number) => {
      const ins = (n: TreeNode | null): TreeNode => {
        if (!n) return new TreeNode(v);
        if (v < n.val) n.left = ins(n.left);
        else n.right = ins(n.right);
        return n;
      };
      return ins(root);
    },
    cases: [
      { args: [[4, 2, 7, 1, 3], 5], expected: [4, 2, 7, 1, 3, 5] },
      { args: [[], 5], expected: [5] },
      { args: [[40, 20, 60, 10, 30, 50, 70], 25], expected: [40, 20, 60, 10, 30, 50, 70, null, null, 25] },
    ],
    gen: (n, r) => {
      const t = n === 0 ? [] : bstGen(n, r);
      const used = new Set(valsOf(t));
      let v = r.int(0, 200);
      while (used.has(v)) v++;
      return [t, v];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'boolean isValidBST(TreeNode root)',
    title: 'Kiểm tra BST hợp lệ',
    ref: S.isValidBST,
    brute: (root: TreeNode | null) => {
      // định nghĩa trực tiếp: mọi node trái < node < mọi node phải
      const all = (n: TreeNode | null): number[] => (n ? [n.val, ...all(n.left), ...all(n.right)] : []);
      const ok = (n: TreeNode | null): boolean =>
        !n || (all(n.left).every((v) => v < n.val) && all(n.right).every((v) => v > n.val) && ok(n.left) && ok(n.right));
      return ok(root);
    },
    cases: [
      { args: [[2, 1, 3]], expected: true },
      { args: [[5, 1, 4, null, null, 3, 6]], expected: false },
      { args: [[5, 1, 6, null, null, 4, 7]], expected: false, note: '4 nằm trong cây con phải của 5' },
      { args: [[2147483647]], expected: true },
      { args: [[-2147483648, null, 2147483647]], expected: true, note: 'Java: biên Integer.MIN/MAX' },
      { args: [[1, 1]], expected: false, note: 'trùng giá trị' },
    ],
    gen: (n, r) => {
      const t = bstGen(Math.max(1, n), r);
      const kind = r.int(0, 2);
      if (kind === 0) return [t];
      if (kind === 1) return [r.tree(Math.max(1, n), 0, 9)];
      // đổi chỗ 2 giá trị → gần đúng nhưng sai
      const idx = t.map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0);
      const [a, b] = [r.pick(idx), r.pick(idx)];
      [t[a], t[b]] = [t[b], t[a]];
      return [t];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'int kthSmallest(TreeNode root, int k)',
    title: 'Phần tử nhỏ thứ k',
    ref: S.kthSmallest,
    brute: (root: TreeNode | null, k: number) => inorderOf(root).sort((a, b) => a - b)[k - 1],
    cases: [
      { args: [[3, 1, 4, null, 2], 1], expected: 1 },
      { args: [[5, 3, 6, 2, 4, null, null, 1], 3], expected: 3 },
    ],
    gen: (n, r) => {
      const t = bstGen(Math.max(1, n), r);
      return [t, r.int(1, valsOf(t).length)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'TreeNode deleteNode(TreeNode root, int key)',
    title: 'Xóa node khỏi BST',
    ref: S.deleteNode,
    brute: () => null,
    compare: (got, _e, [tree, key]) => {
      if (!isBstArr(got)) return 'kết quả không còn là BST';
      const want = valsOf(tree).filter((v) => v !== key).sort((a, b) => a - b);
      const have = valsOf(got).sort((a, b) => a - b);
      if (have.join() !== want.join()) return `tập giá trị sai: còn [${have.slice(0, 10)}…], cần [${want.slice(0, 10)}…]`;
      return heightArr(got) <= heightArr(tree) || 'chiều cao cây tăng sau khi xóa';
    },
    cases: [
      { args: [[5, 3, 6, 2, 4, null, 7], 3], expected: [5, 4, 6, 2, null, null, 7] },
      { args: [[5, 3, 6, 2, 4, null, 7], 0], expected: [5, 3, 6, 2, 4, null, 7] },
      { args: [[], 0], expected: [] },
      { args: [[5], 5], expected: [] },
      { args: [[5, 3, 6, 2, 4, null, 7], 5], expected: [6, 3, 7, 2, 4] },
    ],
    gen: (n, r) => {
      const t = n === 0 ? [] : bstGen(n, r);
      const v = valsOf(t);
      return [t, v.length && r.bool(0.8) ? r.pick(v) : r.int(0, 61)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '06': {
    sig: 'TreeNode sortedArrayToBST(int[] nums)',
    title: 'Mảng đã sort → BST cân bằng',
    ref: S.sortedArrayToBST,
    brute: () => null,
    compare: (got, _e, [nums]) => {
      const root = buildTree(got);
      if (inorderOf(root).join() !== nums.join()) return 'in-order của cây khác mảng đầu vào (không phải BST đúng tập giá trị)';
      let ok = true;
      const h = (n: TreeNode | null): number => {
        if (!n) return 0;
        const a = h(n.left);
        const b = h(n.right);
        if (Math.abs(a - b) > 1) ok = false;
        return 1 + Math.max(a, b);
      };
      h(root);
      return ok || 'cây chưa cân bằng chiều cao';
    },
    cases: [
      { args: [[-10, -3, 0, 5, 9]], expected: [0, -3, 9, -10, null, 5] },
      { args: [[1, 3]], expected: [3, 1] },
      { args: [[7]], expected: [7] },
    ],
    gen: (n, r) => [r.distinct(Math.max(1, n), -Math.max(1000, 3 * n), Math.max(1000, 3 * n)).sort((a, b) => a - b)],
    perf: { n: 10_000, limitMs: 50 },
  },
  '07': {
    sig: 'int successor(TreeNode root, int x)',
    title: 'Successor',
    ref: S.successor,
    brute: (root: TreeNode | null, x: number) => {
      const bigger = inorderOf(root).filter((v) => v > x);
      return bigger.length ? Math.min(...bigger) : -1;
    },
    cases: [
      { args: [[5, 3, 6, 2, 4, null, null, 1], 1], expected: 2 },
      { args: [[5, 3, 6, 2, 4, null, null, 1], 4], expected: 5 },
      { args: [[5, 3, 6, 2, 4, null, null, 1], 6], expected: -1 },
      { args: [[5, 3, 6, 2, 4, null, null, 1], 0], expected: 1 },
    ],
    gen: (n, r) => [bstGen(Math.max(1, n), r), r.int(0, 62)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'int lcaBST(TreeNode root, int p, int q)',
    title: 'LCA trong BST',
    ref: S.lcaBST,
    brute: (root: TreeNode | null, p: number, q: number) => {
      const path = (v: number) => {
        const out: number[] = [];
        for (let n = root; n; n = v < n.val ? n.left : n.right) {
          out.push(n.val);
          if (n.val === v) break;
        }
        return out;
      };
      const a = path(p);
      const b = new Set(path(q));
      return a.filter((v) => b.has(v)).pop()!;
    },
    cases: [
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], expected: 6 },
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4], expected: 2 },
      { args: [[2, 1], 2, 1], expected: 2 },
    ],
    gen: (n, r) => {
      const t = bstGen(Math.max(1, n), r);
      const v = valsOf(t);
      return [t, r.pick(v), r.pick(v)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '09': {
    sig: 'long rangeSumBST(TreeNode root, int low, int high)',
    title: 'Tổng doanh thu theo khoảng giá',
    ref: S.rangeSumBST,
    brute: (root: TreeNode | null, lo: number, hi: number) => inorderOf(root).filter((v) => lo <= v && v <= hi).reduce((a, b) => a + b, 0),
    cases: [
      { args: [[10, 5, 15, 3, 7, null, 18], 7, 15], expected: 32 },
      { args: [[10, 5, 15, 3, 7, 13, 18, 1, null, 6], 6, 10], expected: 23 },
      { args: [[1000000000, 999999999, null, 999999998], 0, 1000000000], expected: 2999999997, note: 'Java: long' },
    ],
    gen: (n, r) => {
      const a = r.int(0, 60);
      return [bstGen(Math.max(1, n), r), a, a + r.int(0, 30)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '10': {
    sig: 'class BSTIterator {\n  BSTIterator(TreeNode root)\n  int next()\n  boolean hasNext()\n}',
    title: 'Iterator phân trang trên BST',
    ref: S.BSTIterator,
    brute: class {
      a: number[];
      i = 0;
      constructor(root: TreeNode | null) {
        this.a = inorderOf(root);
      }
      next() {
        return this.a[this.i++];
      }
      hasNext() {
        return this.i < this.a.length;
      }
    },
    cases: [
      {
        args: [
          ['BSTIterator', 'next', 'next', 'hasNext', 'next', 'next', 'next', 'hasNext'],
          [[[7, 3, 15, null, null, 9, 20]], [], [], [], [], [], [], []],
        ],
        expected: [null, 3, 7, true, 9, 15, 20, false],
      },
    ],
    gen: (n, r) => {
      const t = bstGen(Math.max(1, n), r);
      const total = valsOf(t).length;
      const ops = ['BSTIterator'];
      const args: any[][] = [[t]];
      let left = total;
      while (left > 0) {
        if (r.bool(0.3)) ops.push('hasNext');
        else {
          ops.push('next');
          left--;
        }
        args.push([]);
      }
      ops.push('hasNext');
      args.push([]);
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
};
