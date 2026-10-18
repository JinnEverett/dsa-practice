import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int removeDuplicates(int[] nums)',
    title: 'Xóa trùng trong mảng đã sort',
    ref: S.removeDuplicates,
    brute: (nums: number[]) => {
      const u = [...new Set(nums)];
      u.forEach((v, i) => (nums[i] = v));
      return u.length;
    },
    output: (k, args) => ({ k, prefix: args[0].slice(0, k) }),
    cases: [
      { args: [[1, 1, 2]], expected: { k: 2, prefix: [1, 2] } },
      { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: { k: 5, prefix: [0, 1, 2, 3, 4] } },
      { args: [[]], expected: { k: 0, prefix: [] } },
      { args: [[7]], expected: { k: 1, prefix: [7] } },
    ],
    gen: (n, r) => [r.sorted(n, -5, 5)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'void moveZeroes(int[] nums)',
    title: 'Dồn số 0 về cuối',
    ref: S.moveZeroes,
    brute: (nums: number[]) => {
      const nz = nums.filter((x) => x !== 0);
      nums.forEach((_, i) => (nums[i] = i < nz.length ? nz[i] : 0));
    },
    output: 'arg0',
    cases: [
      { args: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
      { args: [[0]], expected: [0] },
      { args: [[1, 2]], expected: [1, 2] },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), -2, 3).map((x) => (x > 1 ? 0 : x))],
    // bản dùng splice/shift trong vòng lặp là O(n²)
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'int[] twoSumSorted(int[] nums, int target)',
    title: 'Two Sum trên mảng đã sort',
    ref: S.twoSumSorted,
    brute: () => null, // compare chỉ kiểm tra tính hợp lệ, không cần đáp án mẫu
    compare: (got, _e, [nums, target]) => {
      if (!Array.isArray(got) || got.length !== 2) return 'phải trả về đúng 2 chỉ số';
      const [i, j] = got;
      if (!(0 <= i && i < j && j < nums.length)) return 'cần 0 ≤ i < j < n';
      return nums[i] + nums[j] === target || `nums[${i}] + nums[${j}] ≠ ${target}`;
    },
    cases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[-1, 0], -1], expected: [0, 1] },
      { args: [[1e9, 1e9], 2e9], expected: [0, 1], note: 'Java: tổng vượt int' },
      { args: [[1, 2, 3, 4, 4, 9, 56, 90], 8], expected: [3, 4] },
    ],
    gen: (n, r) => {
      const nums = r.sorted(Math.max(2, n), -50, 50);
      const i = r.int(0, nums.length - 2);
      const j = r.int(i + 1, nums.length - 1);
      return [nums, nums[i] + nums[j]];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '04': {
    sig: 'void mergeSorted(int[] nums1, int m, int[] nums2, int n)',
    title: 'Merge hai mảng đã sort tại chỗ',
    ref: S.mergeSorted,
    brute: (nums1: number[], m: number, nums2: number[], n: number) => {
      const all = [...nums1.slice(0, m), ...nums2.slice(0, n)].sort((a, b) => a - b);
      all.forEach((v, i) => (nums1[i] = v));
    },
    output: 'arg0',
    cases: [
      { args: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], expected: [1, 2, 2, 3, 5, 6] },
      { args: [[0], 0, [1], 1], expected: [1] },
      { args: [[1], 1, [], 0], expected: [1] },
      { args: [[4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3], expected: [1, 2, 3, 4, 5, 6] },
    ],
    gen: (n, r) => {
      const m = r.int(0, n);
      const k = n - m;
      return [[...r.sorted(m, -9, 9), ...new Array(k).fill(0)], m, r.sorted(k, -9, 9), k];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '05': {
    sig: 'int[] sortedSquares(int[] nums)',
    title: 'Bình phương mảng đã sort',
    ref: S.sortedSquares,
    brute: (nums: number[]) => nums.map((x) => x * x).sort((a, b) => a - b),
    cases: [
      { args: [[-4, -1, 0, 3, 10]], expected: [0, 1, 9, 16, 100] },
      { args: [[-7, -3, 2, 3, 11]], expected: [4, 9, 9, 49, 121] },
      { args: [[-3]], expected: [9] },
      { args: [[-5, -4, -1]], expected: [1, 16, 25] },
    ],
    gen: (n, r) => [r.sorted(Math.max(1, n), -1e4, 1e4)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '06': {
    sig: 'int maxArea(int[] height)',
    title: 'Bể chứa nhiều nước nhất',
    ref: S.maxArea,
    brute: (h: number[]) => {
      let best = 0;
      for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) best = Math.max(best, Math.min(h[i], h[j]) * (j - i));
      return best;
    },
    cases: [
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { args: [[1, 1]], expected: 1 },
      { args: [[0, 0, 0]], expected: 0 },
      { args: [[4, 3, 2, 1, 4]], expected: 16 },
    ],
    gen: (n, r) => [r.array(Math.max(2, n), 0, 20)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '07': {
    sig: 'List<List<Integer>> threeSum(int[] nums)',
    title: '3Sum',
    ref: S.threeSum,
    brute: (nums: number[]) => {
      const seen = new Map<string, number[]>();
      for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
          for (let k = j + 1; k < nums.length; k++)
            if (nums[i] + nums[j] + nums[k] === 0) {
              const t = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
              seen.set(t.join(','), t);
            }
      return [...seen.values()];
    },
    compare: (got, exp) => {
      if (!Array.isArray(got)) return 'phải trả về danh sách bộ ba';
      for (const t of got) {
        if (!Array.isArray(t) || t.length !== 3) return 'mỗi phần tử phải là bộ 3 số';
        if (!(t[0] <= t[1] && t[1] <= t[2])) return `bộ ba ${JSON.stringify(t)} chưa sắp tăng dần`;
      }
      const key = (a: number[][]) => a.map((t) => t.join(',')).sort().join('|');
      if (new Set(got.map((t: number[]) => t.join(','))).size !== got.length) return 'có bộ ba bị trùng';
      return key(got) === key(exp);
    },
    cases: [
      { args: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]] },
      { args: [[0, 1, 1]], expected: [] },
      { args: [[0, 0, 0, 0]], expected: [[0, 0, 0]] },
      { args: [[-2, 0, 1, 1, 2]], expected: [[-2, 0, 2], [-2, 1, 1]] },
    ],
    gen: (n, r) => [r.array(Math.max(3, n), -6, 6)],
    stress: { runs: 300, minN: 3, maxN: 30 },
    perf: { n: 3000, limitMs: 200 },
  },
  '08': {
    sig: 'void sortColors(int[] nums)',
    title: 'Sắp xếp 3 màu',
    ref: S.sortColors,
    brute: (nums: number[]) => {
      const s = nums.slice().sort((a, b) => a - b);
      s.forEach((v, i) => (nums[i] = v));
    },
    output: 'arg0',
    cases: [
      { args: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
      { args: [[2, 0, 1]], expected: [0, 1, 2] },
      { args: [[0]], expected: [0] },
      { args: [[2, 2]], expected: [2, 2] },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), 0, 2)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '09': {
    sig: 'int minTrips(int[] weights, int limit)',
    title: 'Xếp kiện hàng lên xe máy',
    ref: S.minTrips,
    brute: (weights: number[], limit: number) => {
      // ghép cặp tối đa bằng vét cạn (n nhỏ): số chuyến = n − số cặp ghép được
      const n = weights.length;
      const memo = new Map<number, number>();
      const best = (mask: number): number => {
        if (mask === 0) return 0;
        if (memo.has(mask)) return memo.get(mask)!;
        let i = 0;
        while (!(mask & (1 << i))) i++;
        const rest = mask & ~(1 << i);
        let res = 1 + best(rest);
        for (let j = i + 1; j < n; j++) if (rest & (1 << j) && weights[i] + weights[j] <= limit) res = Math.min(res, 1 + best(rest & ~(1 << j)));
        memo.set(mask, res);
        return res;
      };
      return best((1 << n) - 1);
    },
    cases: [
      { args: [[1, 2], 3], expected: 1 },
      { args: [[3, 2, 2, 1], 3], expected: 3 },
      { args: [[3, 5, 3, 4], 5], expected: 4 },
      { args: [[5], 5], expected: 1 },
    ],
    gen: (n, r) => {
      const limit = r.int(1, 12);
      return [r.array(Math.max(1, n), 1, limit), limit];
    },
    stress: { runs: 300, minN: 1, maxN: 14 },
    perf: { n: 50_000, limitMs: 100 },
  },
  '10': {
    sig: 'boolean backspaceCompare(String s, String t)',
    title: 'So sánh ô nhập có phím xóa',
    ref: S.backspaceCompare,
    brute: (s: string, t: string) => {
      const build = (x: string) => {
        const st: string[] = [];
        for (const c of x) c === '#' ? st.pop() : st.push(c);
        return st.join('');
      };
      return build(s) === build(t);
    },
    cases: [
      { args: ['ab#c', 'ad#c'], expected: true },
      { args: ['ab##', 'c#d#'], expected: true },
      { args: ['a#c', 'b'], expected: false },
      { args: ['###', 'a#'], expected: true },
      { args: ['bxj##tw', 'bxo#j##tw'], expected: true },
    ],
    gen: (n, r) => [r.string(Math.max(1, n), 'ab##'), r.string(Math.max(1, n + r.int(-2, 2)), 'ab##')],
    perf: { n: 200_000, limitMs: 100 },
  },
};
