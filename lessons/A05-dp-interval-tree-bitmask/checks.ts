import type { Spec } from '../../tools/spec.ts';
import { TreeNode } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Liệt kê node + chỉ số cha (brute cho bài cây). */
function flatten(root: TreeNode | null): { vals: number[]; parent: number[]; kids: number[][] } {
  const vals: number[] = [];
  const parent: number[] = [];
  const kids: number[][] = [];
  const walk = (node: TreeNode | null, p: number) => {
    if (!node) return;
    const id = vals.length;
    vals.push(node.val);
    parent.push(p);
    kids.push([]);
    if (p >= 0) kids[p].push(id);
    walk(node.left, id);
    walk(node.right, id);
  };
  walk(root, -1);
  return { vals, parent, kids };
}

/** Mảng level-order của một đường thẳng n node (lệch trái), mỗi node mang giá trị val(i). */
const chain = (n: number, val: (i: number) => number): (number | null)[] => {
  const out: (number | null)[] = [];
  for (let i = 0; i < n; i++) {
    out.push(val(i));
    if (i < n - 1) out.push(null); // con phải rỗng; con trái là phần tử kế tiếp... (xem buildTree: trái trước, phải sau)
  }
  return out;
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int maxCoins(int[] nums)',
    title: 'Nổ bóng bay',
    ref: S.maxCoins,
    brute: (nums: number[]): number => {
      const f = (a: number[]): number => {
        if (a.length === 0) return 0;
        let best = 0;
        for (let i = 0; i < a.length; i++) {
          const gain = (a[i - 1] ?? 1) * a[i] * (a[i + 1] ?? 1);
          best = Math.max(best, gain + f([...a.slice(0, i), ...a.slice(i + 1)]));
        }
        return best;
      };
      return f(nums);
    },
    cases: [
      { args: [[3, 1, 5, 8]], expected: 167 },
      { args: [[1, 5]], expected: 10 },
      { args: [[7]], expected: 7 },
      { args: [[0, 0, 0]], expected: 0 },
    ],
    gen: (n, r) => [r.array(n >= 300 ? 300 : r.int(1, 7), 0, 100)],
    perf: { n: 300, limitMs: 400 },
  },
  '02': {
    sig: 'int mctFromLeafValues(int[] arr)',
    title: 'Cây từ lá, tổng nút nhỏ nhất',
    ref: S.mctFromLeafValues,
    brute: (arr: number[]): number => {
      const f = (l: number, r: number): number => {
        if (l === r) return 0;
        let best = Infinity;
        for (let k = l; k < r; k++) {
          const a = Math.max(...arr.slice(l, k + 1));
          const b = Math.max(...arr.slice(k + 1, r + 1));
          best = Math.min(best, f(l, k) + f(k + 1, r) + a * b);
        }
        return best;
      };
      return f(0, arr.length - 1);
    },
    cases: [
      { args: [[6, 2, 4]], expected: 32 },
      { args: [[4, 11]], expected: 44 },
      { args: [[15, 13, 5, 3, 15]], expected: 500 },
      { args: [[7, 7]], expected: 49 },
    ],
    gen: (n, r) => [r.array(n >= 200 ? 200 : r.int(2, 8), 1, 15)],
    stress: { minN: 2 },
    perf: { n: 200, limitMs: 400 },
  },
  '03': {
    sig: 'int minScoreTriangulation(int[] values)',
    title: 'Chia đa giác thành tam giác',
    ref: S.minScoreTriangulation,
    brute: (v: number[]): number => {
      const f = (i: number, j: number): number => {
        if (j - i < 2) return 0;
        let best = Infinity;
        for (let k = i + 1; k < j; k++) best = Math.min(best, f(i, k) + f(k, j) + v[i] * v[k] * v[j]);
        return best;
      };
      return f(0, v.length - 1);
    },
    cases: [
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[3, 7, 4, 5]], expected: 144 },
      { args: [[1, 3, 1, 4, 1, 5]], expected: 13 },
      { args: [new Array(200).fill(1)], expected: 198, note: '198 tam giác × 1' },
    ],
    gen: (n, r) => [r.array(n >= 200 ? 200 : r.int(3, 9), 1, 100)],
    stress: { minN: 3 },
    perf: { n: 200, limitMs: 300 },
  },
  '04': {
    sig: 'int robTree(TreeNode root)',
    title: 'Cướp nhà trên cây',
    ref: S.robTree,
    brute: (root: TreeNode | null): number => {
      const { vals, parent } = flatten(root);
      let best = 0;
      for (let mask = 0; mask < 1 << vals.length; mask++) {
        let ok = true;
        let sum = 0;
        for (let i = 0; i < vals.length && ok; i++) {
          if (!(mask >> i & 1)) continue;
          sum += vals[i];
          if (parent[i] >= 0 && mask >> parent[i] & 1) ok = false;
        }
        if (ok && sum > best) best = sum;
      }
      return best;
    },
    cases: [
      { args: [[3, 2, 3, null, 3, null, 1]], expected: 7 },
      { args: [[3, 4, 5, 1, 3, null, 1]], expected: 9 },
      { args: [[]], expected: 0 },
      { args: [[5]], expected: 5 },
      { args: [chain(5000, () => 1)], expected: 2500, note: 'cây lệch 5000 tầng' },
    ],
    gen: (n, r) => [n >= 5000 ? r.skewedTree(5000, 0, 10000) : r.tree(r.int(0, 12), 0, 20)],
    perf: { n: 5000, limitMs: 100 },
  },
  '05': {
    sig: 'int minCameraCover(TreeNode root)',
    title: 'Đặt camera trên cây',
    ref: S.minCameraCover,
    brute: (root: TreeNode | null): number => {
      const { parent, kids } = flatten(root);
      const n = parent.length;
      let best = Infinity;
      for (let mask = 0; mask < 1 << n; mask++) {
        let ok = true;
        for (let i = 0; i < n && ok; i++) {
          const covered = mask >> i & 1 || (parent[i] >= 0 && mask >> parent[i] & 1) || kids[i].some((c) => mask >> c & 1);
          if (!covered) ok = false;
        }
        if (ok) {
          let c = 0;
          for (let i = 0; i < n; i++) c += mask >> i & 1;
          best = Math.min(best, c);
        }
      }
      return n === 0 ? 0 : best;
    },
    cases: [
      { args: [[0, 0, null, 0, 0]], expected: 1 },
      { args: [[0, 0, null, 0, null, 0, null, null, 0]], expected: 2 },
      { args: [[0]], expected: 1 },
      { args: [[]], expected: 0 },
      { args: [chain(5000, () => 0)], expected: Math.ceil(5000 / 3), note: 'đường thẳng 5000 node: ⌈n/3⌉' },
    ],
    gen: (n, r) => [n >= 5000 ? r.skewedTree(5000, 0, 0) : r.tree(r.int(0, 12), 0, 0)],
    perf: { n: 5000, limitMs: 100 },
  },
  '06': {
    sig: 'int tsp(int[][] dist)',
    title: 'Người bán hàng (TSP)',
    ref: S.tsp,
    brute: (dist: number[][]): number => {
      const n = dist.length;
      if (n === 1) return 0;
      let best = Infinity;
      const perm = (cur: number[], used: number) => {
        if (cur.length === n) {
          let c = 0;
          for (let i = 0; i < n; i++) c += dist[cur[i]][cur[(i + 1) % n]];
          best = Math.min(best, c);
          return;
        }
        for (let v = 1; v < n; v++) if (!(used >> v & 1)) perm([...cur, v], used | (1 << v));
      };
      perm([0], 1);
      return best;
    },
    cases: [
      { args: [[[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]], expected: 80 },
      { args: [[[0]]], expected: 0 },
      { args: [[[0, 3], [5, 0]]], expected: 8, note: 'đồ thị có hướng: 3 + 5' },
      { args: [Array.from({ length: 15 }, (_, i) => Array.from({ length: 15 }, (_, j) => (i === j ? 0 : 1_000_000)))], expected: 15_000_000, note: 'n = 15, mọi cạnh 10⁶' },
    ],
    gen: (n, r) => {
      const k = n >= 15 ? 15 : r.int(1, 8);
      const hi = n >= 15 ? 1_000_000 : 20;
      return [Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => (i === j ? 0 : r.int(1, hi))))];
    },
    stress: { minN: 1, maxN: 12 }, // n < 15 ⇒ gen chỉ sinh 15 thành phố ở phần perf
    perf: { n: 15, limitMs: 300 },
  },
  '07': {
    sig: 'int countDigitOne(int n)',
    title: 'Đếm chữ số 1',
    ref: S.countDigitOne,
    brute: (n: number): number => {
      let c = 0;
      for (let x = 1; x <= n; x++) for (const ch of String(x)) if (ch === '1') c++;
      return c;
    },
    cases: [
      { args: [13], expected: 6 },
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [99], expected: 20 },
      { args: [999], expected: 300 },
      { args: [99999], expected: 50000 },
      { args: [1_000_000_000], expected: 900_000_001, note: '10⁹: duyệt 1..n mất ~10⁹ phép' },
      { args: [999_999_999], expected: 900_000_000 },
    ],
    gen: (n, r) => [n >= 1_000_000 ? 1_000_000_000 : r.int(0, 3000)],
    perf: { n: 1_000_000_000, limitMs: 50 },
  },
  '08': {
    sig: 'boolean canPartitionKSubsets(int[] nums, int k)',
    title: 'Chia việc đều cho k người',
    ref: S.canPartitionKSubsets,
    brute: (nums: number[], k: number): boolean => {
      const sum = nums.reduce((a, b) => a + b, 0);
      if (sum % k) return false;
      const target = sum / k;
      const buckets = new Array(k).fill(0);
      const f = (i: number): boolean => {
        if (i === nums.length) return buckets.every((b) => b === target);
        for (let b = 0; b < k; b++) {
          if (buckets[b] + nums[i] > target) continue;
          buckets[b] += nums[i];
          const ok = f(i + 1);
          buckets[b] -= nums[i];
          if (ok) return true;
        }
        return false;
      };
      return f(0);
    },
    cases: [
      { args: [[4, 3, 2, 3, 5, 2, 1], 4], expected: true },
      { args: [[1, 2, 3, 4], 3], expected: false },
      { args: [[2, 2, 2, 2, 3, 4, 5], 4], expected: false },
      { args: [[5], 1], expected: true },
      { args: [[10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], 8], expected: true, note: 'n = 16' },
    ],
    gen: (n, r) => {
      if (n >= 16) {
        const k = 4;
        const a = r.array(15, 1, 20);
        const s = a.reduce((x, y) => x + y, 0);
        a.push(k - (s % k) || k); // tổng chia hết cho k
        return [a, k];
      }
      return [r.array(r.int(1, 8), 1, 6), r.int(1, 4)];
    },
    stress: { minN: 1, maxN: 12 },
    perf: { n: 16, limitMs: 100 },
  },
};
