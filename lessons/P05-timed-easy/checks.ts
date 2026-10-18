import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int majorityElement(int[] nums)',
    title: 'Mã lỗi chiếm đa số',
    ref: S.majorityElement,
    brute: (nums: number[]) => {
      const cnt = new Map<number, number>();
      for (const x of nums) cnt.set(x, (cnt.get(x) ?? 0) + 1);
      for (const [k, v] of cnt) if (v * 2 > nums.length) return k;
      return -1;
    },
    cases: [
      { args: [[3, 2, 3]], expected: 3 },
      { args: [[2, 2, 1, 1, 1, 2, 2]], expected: 2 },
      { args: [[7]], expected: 7 },
      { args: [[-1, -1, 5]], expected: -1 },
    ],
    gen: (n, r) => {
      const m = Math.max(1, n);
      const major = r.int(-5, 5);
      const k = Math.floor(m / 2) + 1;
      const arr = [...Array(k).fill(major), ...r.array(m - k, -5, 5)];
      return [r.shuffle(arr)];
    },
    perf: { n: 1e5, limitMs: 30 },
  },
  '02': {
    sig: 'int maxProfit(int[] prices)',
    title: 'Lãi lớn nhất, một lần mua – một lần bán',
    ref: S.maxProfit,
    brute: (prices: number[]) => {
      let best = 0;
      for (let i = 0; i < prices.length; i++) for (let j = i + 1; j < prices.length; j++) best = Math.max(best, prices[j] - prices[i]);
      return best;
    },
    cases: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[]], expected: 0 },
      { args: [[5]], expected: 0 },
      { args: [[2, 4, 1]], expected: 2, note: 'bán phải sau mua: 1 ở cuối không dùng được' },
    ],
    gen: (n, r) => [r.array(n, 0, n > 200 ? 1_000_000_000 : 20)],
    perf: { n: 1e5, limitMs: 20 },
  },
  '03': {
    sig: 'boolean isSubsequence(String s, String t)',
    title: 'Chuỗi lệnh có xuất hiện đúng thứ tự trong nhật ký?',
    ref: S.isSubsequence,
    brute: (s: string, t: string) => {
      // DP độ dài dãy con chung dài nhất == |s|
      const dp = Array.from({ length: s.length + 1 }, () => new Array<number>(t.length + 1).fill(0));
      for (let i = 1; i <= s.length; i++)
        for (let j = 1; j <= t.length; j++) dp[i][j] = s[i - 1] === t[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      return dp[s.length][t.length] === s.length;
    },
    cases: [
      { args: ['abc', 'ahbgdc'], expected: true },
      { args: ['axc', 'ahbgdc'], expected: false },
      { args: ['', 'abc'], expected: true },
      { args: ['a', ''], expected: false },
      { args: ['aa', 'a'], expected: false },
    ],
    gen: (n, r) => [r.string(r.int(0, Math.max(1, n >> 1)), 'abc'), r.string(n, 'abc')],
    perf: false,
  },
  '04': {
    sig: 'List<String> summaryRanges(int[] nums)',
    title: 'Tóm tắt dãy mã vé liên tiếp',
    ref: S.summaryRanges,
    brute: (nums: number[]) => {
      const out: string[] = [];
      let start = 0;
      for (let i = 1; i <= nums.length; i++) {
        if (i === nums.length || nums[i] !== nums[i - 1] + 1) {
          out.push(i - 1 > start ? `${nums[start]}->${nums[i - 1]}` : `${nums[start]}`);
          start = i;
        }
      }
      return out;
    },
    cases: [
      { args: [[0, 1, 2, 4, 5, 7]], expected: ['0->2', '4->5', '7'] },
      { args: [[0, 2, 3, 4, 6, 8, 9]], expected: ['0', '2->4', '6', '8->9'] },
      { args: [[]], expected: [] },
      { args: [[-1]], expected: ['-1'] },
      { args: [[-2147483648, 2147483647]], expected: ['-2147483648', '2147483647'], note: 'biên int: Java phải dùng long khi so sánh' },
      { args: [[2147483646, 2147483647]], expected: ['2147483646->2147483647'] },
    ],
    gen: (n, r) => {
      const a = new Set<number>();
      for (let i = 0; i < n; i++) a.add(r.int(-8, Math.max(8, n)));
      return [[...a].sort((x, y) => x - y)];
    },
    perf: false,
  },
  '05': {
    sig: 'int[] nextGreaterElement(int[] nums1, int[] nums2)',
    title: 'Phần tử lớn hơn kế tiếp',
    ref: S.nextGreaterElement,
    brute: (nums1: number[], nums2: number[]) =>
      nums1.map((x) => {
        const i = nums2.indexOf(x);
        for (let j = i + 1; j < nums2.length; j++) if (nums2[j] > x) return nums2[j];
        return -1;
      }),
    cases: [
      { args: [[4, 1, 2], [1, 3, 4, 2]], expected: [-1, 3, -1] },
      { args: [[2, 4], [1, 2, 3, 4]], expected: [3, -1] },
      { args: [[], [1, 2]], expected: [] },
      { args: [[5], [5]], expected: [-1] },
    ],
    gen: (n, r) => {
      const nums2 = r.distinct(n, -50, Math.max(60, 3 * n));
      const nums1 = nums2.filter(() => r.bool(0.5));
      return [r.shuffle(nums1), nums2];
    },
    perf: { n: 1e5, limitMs: 120 },
  },
  '06': {
    sig: 'int longestPalindromeLetters(String s)',
    title: 'Palindrome dài nhất ghép từ các chữ cái',
    ref: S.longestPalindromeLetters,
    brute: (s: string) => {
      // thử mọi tập con (n ≤ 14): tập con ghép được palindrome iff số chữ có count lẻ ≤ 1
      let best = 0;
      for (let mask = 0; mask < 1 << s.length; mask++) {
        const cnt: Record<string, number> = {};
        let size = 0;
        for (let i = 0; i < s.length; i++) if (mask >> i & 1) (cnt[s[i]] = (cnt[s[i]] ?? 0) + 1), size++;
        if (Object.values(cnt).filter((v) => v % 2).length <= 1) best = Math.max(best, size);
      }
      return best;
    },
    cases: [
      { args: ['abccccdd'], expected: 7 },
      { args: ['a'], expected: 1 },
      { args: [''], expected: 0 },
      { args: ['Aa'], expected: 1, note: 'phân biệt hoa/thường' },
      { args: ['aaabbb'], expected: 5 },
    ],
    gen: (n, r) => [r.string(Math.min(n, 12), 'abcAB')],
    stress: { maxN: 12 },
    perf: false,
  },
};
