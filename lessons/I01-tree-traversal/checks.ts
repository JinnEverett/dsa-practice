import type { Spec } from '../../tools/spec.ts';
import type { Rng, TreeNode } from '../../tools/lib.ts';
import * as S from './solutions.ts';

// Brute đệ quy (cây trong stress nhỏ nên không lo tràn stack)
const rec = (order: 'pre' | 'in' | 'post') => (root: TreeNode | null) => {
  const out: number[] = [];
  const go = (n: TreeNode | null) => {
    if (!n) return;
    if (order === 'pre') out.push(n.val);
    go(n.left);
    if (order === 'in') out.push(n.val);
    go(n.right);
    if (order === 'post') out.push(n.val);
  };
  go(root);
  return out;
};
const levelsRec = (root: TreeNode | null) => {
  const lv: number[][] = [];
  const go = (n: TreeNode | null, d: number) => {
    if (!n) return;
    (lv[d] ??= []).push(n.val);
    go(n.left, d + 1);
    go(n.right, d + 1);
  };
  go(root, 0);
  return lv;
};
/** Cây lệch sâu đúng n node: chuỗi các con phải (mảng level-order kiểu LeetCode). */
const deepRight = (n: number) => {
  const a: (number | null)[] = [0];
  for (let i = 1; i < n; i++) a.push(null, i % 100);
  return a;
};
const treeGen = (n: number, r: Rng) => [n > 1000 ? (r.bool() ? r.tree(n) : r.skewedTree(n)) : r.tree(n, -9, 9)];
const DEEP_VALS = Array.from({ length: 100_000 }, (_, i) => (i === 0 ? 0 : i % 100));
const DEEP = { args: [deepRight(100_000)], note: 'cây lệch 10⁵ tầng — đệ quy tràn stack' };

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'List<Integer> preorder(TreeNode root)',
    title: 'Pre-order (vòng lặp)',
    ref: S.preorder,
    brute: rec('pre'),
    cases: [
      { args: [[1, null, 2, 3]], expected: [1, 2, 3] },
      { args: [[1, 2, 3, 4, 5, null, 6]], expected: [1, 2, 4, 5, 3, 6] },
      { args: [[]], expected: [] },
      { ...DEEP, expected: DEEP_VALS },
    ],
    gen: treeGen,
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'List<Integer> inorder(TreeNode root)',
    title: 'In-order (vòng lặp)',
    ref: S.inorder,
    brute: rec('in'),
    cases: [
      { args: [[1, null, 2, 3]], expected: [1, 3, 2] },
      { args: [[1, 2, 3, 4, 5, null, 6]], expected: [4, 2, 5, 1, 3, 6] },
      { args: [[]], expected: [] },
      { ...DEEP, expected: DEEP_VALS },
    ],
    gen: treeGen,
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'List<Integer> postorder(TreeNode root)',
    title: 'Post-order (vòng lặp)',
    ref: S.postorder,
    brute: rec('post'),
    cases: [
      { args: [[1, null, 2, 3]], expected: [3, 2, 1] },
      { args: [[1, 2, 3, 4, 5, null, 6]], expected: [4, 5, 2, 6, 3, 1] },
      { args: [[]], expected: [] },
      { ...DEEP, expected: DEEP_VALS.slice().reverse() },
    ],
    gen: treeGen,
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'List<List<Integer>> levelOrder(TreeNode root)',
    title: 'Duyệt theo tầng',
    ref: S.levelOrder,
    brute: levelsRec,
    cases: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
      { args: [[1]], expected: [[1]] },
      { args: [[]], expected: [] },
      { ...DEEP, expected: DEEP_VALS.map((v) => [v]) },
    ],
    gen: treeGen,
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'int maxDepth(TreeNode root)',
    title: 'Chiều cao cây',
    ref: S.maxDepth,
    brute: (root: TreeNode | null) => levelsRec(root).length,
    cases: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
      { args: [[1, null, 2]], expected: 2 },
      { args: [[]], expected: 0 },
      { ...DEEP, expected: 100_000 },
    ],
    gen: treeGen,
    perf: { n: 1e5, limitMs: 100 },
  },
  '06': {
    sig: 'List<Integer> rightSideView(TreeNode root)',
    title: 'Góc nhìn bên phải',
    ref: S.rightSideView,
    brute: (root: TreeNode | null) => levelsRec(root).map((l) => l[l.length - 1]),
    cases: [
      { args: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4] },
      { args: [[1, 2, 3, 4]], expected: [1, 3, 4] },
      { args: [[]], expected: [] },
    ],
    gen: treeGen,
    perf: { n: 1e5, limitMs: 100 },
  },
  '07': {
    sig: 'boolean isSymmetric(TreeNode root)',
    title: 'Cây đối xứng',
    ref: S.isSymmetric,
    brute: (root: TreeNode | null) => {
      const mirror = (a: TreeNode | null, b: TreeNode | null): boolean =>
        (!a && !b) || (!!a && !!b && a.val === b.val && mirror(a.left, b.right) && mirror(a.right, b.left));
      return mirror(root, root);
    },
    cases: [
      { args: [[1, 2, 2, 3, 4, 4, 3]], expected: true },
      { args: [[1, 2, 2, null, 3, null, 3]], expected: false },
      { args: [[1]], expected: true },
      { args: [[1, 2, 3]], expected: false },
    ],
    gen: (n, r) => {
      // nửa số test là cây đối xứng thật: dựng cây trái rồi gương sang phải
      const half = r.tree(Math.floor(n / 2), 0, 3);
      if (r.bool(0.5) || half.length === 0) return [r.tree(Math.max(1, n), 0, 2)];
      // level-order của cây gương: dựng bằng TreeNode
      return [mirrorArray(half, r.int(0, 3), r.bool(0.2))];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'TreeNode invertTree(TreeNode root)',
    title: 'Lật cây',
    ref: S.invertTree,
    brute: (root: TreeNode | null) => {
      const flip = (n: TreeNode | null): void => {
        if (!n) return;
        [n.left, n.right] = [n.right, n.left];
        flip(n.left);
        flip(n.right);
      };
      flip(root);
      return root;
    },
    cases: [
      { args: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1] },
      { args: [[2, 1, 3]], expected: [2, 3, 1] },
      { args: [[]], expected: [] },
    ],
    gen: (n, r) => [r.tree(n, 0, 9)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '09': {
    sig: 'List<Double> averageOfLevels(TreeNode root)',
    title: 'Lương trung bình theo cấp',
    ref: S.averageOfLevels,
    brute: (root: TreeNode | null) => levelsRec(root).map((l) => l.reduce((a, b) => a + b, 0) / l.length),
    compare: 'float',
    cases: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: [3, 14.5, 11] },
      { args: [[2147483647, 2147483647, 2147483647]], expected: [2147483647, 2147483647], note: 'Java: tổng tầng vượt int' },
    ],
    gen: (n, r) => [r.tree(Math.max(1, n), -100, 100)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '10': {
    sig: 'int widthOfBinaryTree(TreeNode root)',
    title: 'Chiều rộng lớn nhất của sơ đồ',
    ref: S.widthOfBinaryTree,
    brute: (root: TreeNode | null) => {
      // vị trí bằng BigInt, không chuẩn hóa — hiển nhiên đúng
      const lo: bigint[] = [];
      const hi: bigint[] = [];
      const go = (n: TreeNode | null, d: number, p: bigint) => {
        if (!n) return;
        if (lo[d] === undefined || p < lo[d]) lo[d] = p;
        if (hi[d] === undefined || p > hi[d]) hi[d] = p;
        go(n.left, d + 1, 2n * p);
        go(n.right, d + 1, 2n * p + 1n);
      };
      go(root, 0, 0n);
      return Number(lo.reduce((best, l, d) => (hi[d] - l + 1n > best ? hi[d] - l + 1n : best), 0n));
    },
    cases: [
      { args: [[1, 3, 2, 5, 3, null, 9]], expected: 4 },
      { args: [[1, 3, 2, 5, null, null, 9, 6, null, 7]], expected: 7 },
      { args: [[1, 3, 2, 5]], expected: 2 },
      { args: [[1]], expected: 1 },
      { args: [deepRight(3000)], expected: 1, note: 'cây lệch 3000 tầng: vị trí chưa chuẩn hóa ~2³⁰⁰⁰' },
    ],
    gen: (n, r) => [r.bool(0.3) ? r.skewedTree(Math.max(1, n)) : r.tree(Math.max(1, n), 0, 9)],
    perf: false,
  },
};

/** Dựng mảng level-order của cây đối xứng: gốc = rootVal, con trái = cây `half`, con phải = gương của nó (có thể làm lệch 1 node). */
function mirrorArray(half: (number | null)[], rootVal: number, breakIt: boolean): (number | null)[] {
  // xây TreeNode từ half, tạo gương, ghép thành cây, rồi chuyển về mảng
  type N = { val: number; left: N | null; right: N | null };
  const build = (a: (number | null)[]): N | null => {
    if (!a.length || a[0] === null) return null;
    const root: N = { val: a[0], left: null, right: null };
    const q: N[] = [root];
    let i = 1;
    let h = 0;
    while (i < a.length) {
      const node = q[h++];
      if (a[i] != null) q.push((node.left = { val: a[i]!, left: null, right: null }));
      i++;
      if (i < a.length && a[i] != null) q.push((node.right = { val: a[i]!, left: null, right: null }));
      i++;
    }
    return root;
  };
  const mirror = (n: N | null): N | null => (n ? { val: n.val, left: mirror(n.right), right: mirror(n.left) } : null);
  const left = build(half);
  const right = mirror(left);
  if (breakIt && right) right.val += 1;
  const root: N = { val: rootVal, left, right };
  const out: (number | null)[] = [];
  const q: (N | null)[] = [root];
  for (let h = 0; h < q.length; h++) {
    const n = q[h];
    if (n) {
      out.push(n.val);
      q.push(n.left, n.right);
    } else out.push(null);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}
