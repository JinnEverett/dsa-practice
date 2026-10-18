import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Đồ thị ngẫu nhiên n nút, tối đa `m` cạnh. */
const randGraph = (n: number, m: number, r: Rng): number[][] =>
  n < 2 ? [] : Array.from({ length: m }, () => {
    const a = r.int(0, n - 1);
    let b = r.int(0, n - 1);
    if (a === b) b = (a + 1) % n;
    return [a, b];
  });

/** Đồ thị thang L tầng: nút 0 = nguồn; tầng i có nút 2i−1, 2i; nối đầy đủ giữa hai tầng kề nhau. Đích = nút cuối. */
function ladder(L: number): [number, number[][], number, number] {
  const edges: number[][] = [[0, 1], [0, 2]];
  for (let i = 1; i < L; i++) for (const a of [2 * i - 1, 2 * i]) for (const b of [2 * i + 1, 2 * i + 2]) edges.push([a, b]);
  return [2 * L + 1, edges, 0, 2 * L];
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int lowerBound(int[] nums, int target)',
    title: 'Vị trí chèn (lower bound)',
    ref: S.lowerBound,
    brute: (nums: number[], t: number) => {
      let i = 0;
      while (i < nums.length && nums[i] < t) i++;
      return i;
    },
    cases: [
      { args: [[1, 3, 3, 5], 3], expected: 1 },
      { args: [[1, 3, 3, 5], 4], expected: 3 },
      { args: [[1, 3, 3, 5], 0], expected: 0 },
      { args: [[1, 3, 3, 5], 9], expected: 4, note: 'target lớn hơn mọi phần tử → n' },
      { args: [[], 5], expected: 0 },
      { args: [[1], 2], expected: 1 },
    ],
    gen: (n, r) => [r.sorted(n, 0, 8), r.int(0, 9)],
    perf: false,
  },
  '02': {
    sig: 'List<String> sortByFrequency(String[] words)',
    title: 'Sắp từ theo tần suất (tie-break chữ cái)',
    ref: S.sortByFrequency,
    brute: (words: string[]) => {
      const cnt: Record<string, number> = Object.create(null);
      for (const w of words) cnt[w] = (cnt[w] ?? 0) + 1;
      const uniq = Object.keys(cnt);
      // chọn dần phần tử "tốt nhất" còn lại
      const out: string[] = [];
      while (uniq.length) {
        let bi = 0;
        for (let i = 1; i < uniq.length; i++) if (cnt[uniq[i]] > cnt[uniq[bi]] || (cnt[uniq[i]] === cnt[uniq[bi]] && cmp(uniq[i], uniq[bi]) < 0)) bi = i;
        out.push(uniq.splice(bi, 1)[0]);
      }
      return out;
    },
    cases: [
      { args: [['b', 'a', 'b', 'a']], expected: ['a', 'b'], note: 'hòa tần suất → chữ cái tăng dần' },
      { args: [['x', 'y', 'y', 'z', 'z', 'z']], expected: ['z', 'y', 'x'] },
      { args: [[]], expected: [] },
      { args: [['pear', 'apple', 'fig']], expected: ['apple', 'fig', 'pear'] },
    ],
    gen: (n, r) => [Array.from({ length: n }, () => r.pick(['a', 'b', 'cc', 'd', 'ee', 'fig']))],
    perf: false,
  },
  '03': {
    sig: 'int kthSmallest(int[] nums, int k)',
    title: 'Phần tử nhỏ thứ k',
    ref: S.kthSmallest,
    brute: (nums: number[], k: number) => [...nums].sort((a, b) => a - b)[k - 1],
    cases: [
      { args: [[10, 9, 1], 2], expected: 9, note: 'sort() mặc định sẽ cho [1, 10, 9]' },
      { args: [[3, 1, 2], 1], expected: 1 },
      { args: [[100, 20, 3], 3], expected: 100 },
      { args: [[-5, -10, 0], 1], expected: -10, note: 'số âm' },
    ],
    gen: (n, r) => {
      const a = r.array(Math.max(1, n), -50, 300);
      return [a, r.int(1, a.length)];
    },
    stress: { minN: 1 },
    perf: false,
  },
  '04': {
    sig: 'int shortestPath(int n, int[][] edges, int src, int dst)',
    title: 'Đường ngắn nhất (BFS) — lỗi hiệu năng',
    ref: S.shortestPath,
    brute: (n: number, edges: number[][], src: number, dst: number) => {
      const INF: number = 1e9;
      const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)));
      for (const [a, b] of edges) d[a][b] = d[b][a] = Math.min(d[a][b], 1);
      for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
      return d[src][dst] >= INF ? -1 : d[src][dst];
    },
    cases: [
      { args: [4, [[0, 1], [1, 2], [2, 3]], 0, 3], expected: 3 },
      { args: [4, [[0, 1], [2, 3]], 0, 3], expected: -1 },
      { args: [1, [], 0, 0], expected: 0 },
      { args: [3, [[0, 1], [1, 2], [0, 2]], 0, 2], expected: 1 },
    ],
    gen: (n, r) => {
      if (n > 200) return ladder(24);
      const m = Math.max(1, n);
      return [m, randGraph(m, r.int(0, 2 * m), r), r.int(0, m - 1), r.int(0, m - 1)];
    },
    stress: { minN: 1 },
    // thang 24 tầng: bản lỗi nhân đôi hàng đợi mỗi tầng (2²⁴ phần tử) — quá giờ/hết bộ nhớ
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'int productMod(int[] nums, int mod)',
    title: 'Tích theo mod (tràn 2⁵³)',
    ref: S.productMod,
    brute: (nums: number[], mod: number) => Number(nums.reduce((p, x) => (p * BigInt(x)) % BigInt(mod), 1n)),
    cases: [
      { args: [[999999999, 999999999], 1000000007], expected: 64, note: '(−8)² = 64; tích thật 999999998000000001 không biểu diễn chính xác bằng double' },
      { args: [[1000000000, 1000000000], 1000000007], expected: 49 },
      { args: [[2, 3, 4], 5], expected: 4 },
      { args: [[7], 2], expected: 1 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), 1, 1_000_000_000), r.int(500_000_000, 1_000_000_007)],
    stress: { minN: 1 },
    perf: false,
  },
  '06': {
    sig: 'int secondLargest(int[] nums)',
    title: 'Giá trị lớn thứ hai (không đổi input)',
    ref: S.secondLargest,
    brute: (nums: number[]) => {
      const d = [...new Set(nums)].sort((a, b) => b - a);
      return d.length >= 2 ? d[1] : -1;
    },
    // so sánh CẢ giá trị trả về lẫn mảng đầu vào sau khi gọi: kỳ vọng là mảng không đổi
    output: (ret: any, args: any[]) => [ret, args[0]],
    cases: [
      { args: [[1, 2]], expected: [1, [1, 2]], note: 'mảng đầu vào phải còn nguyên [1, 2]' },
      { args: [[5, 5, 5]], expected: [-1, [5, 5, 5]] },
      { args: [[3, 9, 9, 4]], expected: [4, [3, 9, 9, 4]] },
      { args: [[]], expected: [-1, []] },
    ],
    gen: (n, r) => [r.array(n, 0, 6)],
    perf: false,
  },
  '07': {
    sig: 'int coinChange(int[] coins, int amount)',
    title: 'Đổi tiền ít đồng nhất (tham lam sai)',
    ref: S.coinChange,
    brute: (coins: number[], amount: number) => {
      // BFS theo số đồng — độc lập với DP của ref
      const dist = new Array<number>(amount + 1).fill(-1);
      dist[0] = 0;
      const q = [0];
      for (let h = 0; h < q.length; h++) for (const c of coins) {
        const v = q[h] + c;
        if (v <= amount && dist[v] < 0) {
          dist[v] = dist[q[h]] + 1;
          q.push(v);
        }
      }
      return dist[amount];
    },
    cases: [
      { args: [[1, 3, 4], 6], expected: 2, note: 'tham lam cho 3 (4+1+1)' },
      { args: [[2, 5], 6], expected: 3, note: '2+2+2; tham lam: 5, dư 1 → −1' },
      { args: [[2], 3], expected: -1 },
      { args: [[1, 5, 10, 25], 63], expected: 6 },
      { args: [[3], 0], expected: 0 },
    ],
    gen: (n, r) => [r.distinct(r.int(1, 4), 1, 12), r.int(0, Math.max(2, n))],
    perf: false,
  },
  '08': {
    sig: 'int[] bfsOrder(int n, int[][] edges, int src)',
    title: 'Thứ tự duyệt BFS (shift() O(n))',
    ref: S.bfsOrder,
    brute: (n: number, edges: number[][], src: number) => {
      const nb = Array.from({ length: n }, () => new Set<number>());
      for (const [a, b] of edges) {
        nb[a].add(b);
        nb[b].add(a);
      }
      const order = [src];
      const inOrder = new Set(order);
      for (let i = 0; i < order.length; i++)
        for (const v of [...nb[order[i]]].sort((x, y) => x - y)) if (!inOrder.has(v)) {
          inOrder.add(v);
          order.push(v);
        }
      return order;
    },
    cases: [
      { args: [5, [[0, 2], [0, 1], [1, 3], [2, 4]], 0], expected: [0, 1, 2, 3, 4] },
      { args: [4, [[1, 2]], 0], expected: [0], note: 'nút không tới được không xuất hiện' },
      { args: [1, [], 0], expected: [0] },
    ],
    gen: (n, r) => {
      if (n > 200) return [n, Array.from({ length: n - 1 }, (_, i) => [0, i + 1]), 0]; // đồ thị sao: hàng đợi n phần tử
      const m = Math.max(1, n);
      return [m, randGraph(m, r.int(0, 2 * m), r), r.int(0, m - 1)];
    },
    stress: { minN: 1 },
    // shift() trên hàng đợi 10⁵ phần tử: hàng chục giây
    perf: { n: 2e5, limitMs: 300 },
  },
};
