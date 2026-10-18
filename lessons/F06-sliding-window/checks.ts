import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

/** Duyệt mọi đoạn [l, r] — dùng làm brute cho các bài "đoạn con liên tiếp". */
const allSub = <T>(n: number, f: (l: number, r: number) => T | undefined) => {
  const out: T[] = [];
  for (let l = 0; l < n; l++) for (let r = l; r < n; r++) {
    const v = f(l, r);
    if (v !== undefined) out.push(v);
  }
  return out;
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'long maxSumK(int[] nums, int k)',
    title: 'Tổng lớn nhất của k phần tử liên tiếp',
    ref: S.maxSumK,
    brute: (nums: number[], k: number) => Math.max(...allSub(nums.length, (l, r) => (r - l + 1 === k ? nums.slice(l, r + 1).reduce((a, b) => a + b, 0) : undefined))),
    cases: [
      { args: [[2, 1, 5, 1, 3, 2], 3], expected: 9 },
      { args: [[-1, -2, -3], 2], expected: -3 },
      { args: [[1e9, 1e9, 1e9], 3], expected: 3e9, note: 'Java: long' },
      { args: [[5], 1], expected: 5 },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      return [r.array(len, -100, 100), r.int(1, len)];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '02': {
    sig: 'int countWindows(int[] nums, int k, int threshold)',
    title: 'Đếm cửa sổ đạt ngưỡng trung bình',
    ref: S.countWindows,
    brute: (nums: number[], k: number, t: number) =>
      allSub(nums.length, (l, r) => (r - l + 1 === k && nums.slice(l, r + 1).reduce((a, b) => a + b, 0) / k >= t ? 1 : undefined)).length,
    cases: [
      { args: [[2, 2, 2, 2, 5, 5, 5, 8], 3, 4], expected: 3 },
      { args: [[11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5], expected: 6 },
      { args: [[1, 1, 1], 1, 0], expected: 3 },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      return [r.array(len, 1, 10), r.int(1, len), r.int(0, 10)];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '03': {
    sig: 'int lengthOfLongestSubstring(String s)',
    title: 'Chuỗi con dài nhất không lặp ký tự',
    ref: S.lengthOfLongestSubstring,
    brute: (s: string) => Math.max(0, ...allSub(s.length, (l, r) => (new Set(s.slice(l, r + 1)).size === r - l + 1 ? r - l + 1 : undefined))),
    cases: [
      { args: ['abcabcbb'], expected: 3 },
      { args: ['bbbbb'], expected: 1 },
      { args: ['pwwkew'], expected: 3 },
      { args: [''], expected: 0 },
      { args: ['abba'], expected: 2, note: 'l không được lùi' },
      { args: [' '], expected: 1 },
    ],
    gen: (n, r) => [r.string(n, 'abcd ')],
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'int minSubArrayLen(int target, int[] nums)',
    title: 'Đoạn con ngắn nhất có tổng ≥ target',
    ref: S.minSubArrayLen,
    brute: (target: number, nums: number[]) =>
      Math.min(Infinity, ...allSub(nums.length, (l, r) => (nums.slice(l, r + 1).reduce((a, b) => a + b, 0) >= target ? r - l + 1 : undefined))) === Infinity
        ? 0
        : Math.min(...allSub(nums.length, (l, r) => (nums.slice(l, r + 1).reduce((a, b) => a + b, 0) >= target ? r - l + 1 : undefined))),
    cases: [
      { args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
      { args: [4, [1, 4, 4]], expected: 1 },
      { args: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0 },
    ],
    gen: (n, r) => [r.int(1, 60), r.array(Math.max(1, n), 1, 10)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '05': {
    sig: 'int characterReplacement(String s, int k)',
    title: 'Thay tối đa k ký tự',
    ref: S.characterReplacement,
    brute: (s: string, k: number) =>
      Math.max(
        ...allSub(s.length, (l, r) => {
          const cnt = new Map<string, number>();
          for (const c of s.slice(l, r + 1)) cnt.set(c, (cnt.get(c) ?? 0) + 1);
          return r - l + 1 - Math.max(...cnt.values()) <= k ? r - l + 1 : undefined;
        }),
      ),
    cases: [
      { args: ['ABAB', 2], expected: 4 },
      { args: ['AABABBA', 1], expected: 4 },
      { args: ['A', 0], expected: 1 },
    ],
    gen: (n, r) => {
      const s = r.string(Math.max(1, n), 'ABC');
      return [s, r.int(0, s.length)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '06': {
    sig: 'List<Integer> findAnagrams(String s, String p)',
    title: 'Mọi vị trí anagram',
    ref: S.findAnagrams,
    brute: (s: string, p: string) => {
      const key = (x: string) => [...x].sort().join('');
      const kp = key(p);
      const out: number[] = [];
      for (let i = 0; i + p.length <= s.length; i++) if (key(s.slice(i, i + p.length)) === kp) out.push(i);
      return out;
    },
    cases: [
      { args: ['cbaebabacd', 'abc'], expected: [0, 6] },
      { args: ['abab', 'ab'], expected: [0, 1, 2] },
      { args: ['a', 'ab'], expected: [] },
      { args: ['aaa', 'aa'], expected: [0, 1] },
    ],
    gen: (n, r) => [r.string(Math.max(1, n), 'abc'), r.string(r.int(1, 4), 'abc')],
    perf: { n: 1e5, limitMs: 100 },
  },
  '07': {
    sig: 'int totalFruit(int[] fruits)',
    title: 'Hái quả với 2 giỏ',
    ref: S.totalFruit,
    brute: (f: number[]) => Math.max(...allSub(f.length, (l, r) => (new Set(f.slice(l, r + 1)).size <= 2 ? r - l + 1 : undefined))),
    cases: [
      { args: [[1, 2, 1]], expected: 3 },
      { args: [[0, 1, 2, 2]], expected: 3 },
      { args: [[1, 2, 3, 2, 2]], expected: 4 },
      { args: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], expected: 5 },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      return [r.array(len, 0, Math.min(len - 1, 3))];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'String minWindow(String s, String t)',
    title: 'Cửa sổ nhỏ nhất chứa đủ ký tự',
    ref: S.minWindow,
    brute: (s: string, t: string) => {
      const need = new Map<string, number>();
      for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
      let best = '';
      for (let len = 1; len <= s.length && !best; len++)
        for (let l = 0; l + len <= s.length; l++) {
          const cnt = new Map<string, number>();
          for (const c of s.slice(l, l + len)) cnt.set(c, (cnt.get(c) ?? 0) + 1);
          if ([...need].every(([c, k]) => (cnt.get(c) ?? 0) >= k)) {
            best = s.slice(l, l + len);
            break;
          }
        }
      return best;
    },
    cases: [
      { args: ['ADOBECODEBANC', 'ABC'], expected: 'BANC' },
      { args: ['a', 'aa'], expected: '' },
      { args: ['a', 'a'], expected: 'a' },
      { args: ['abcab', 'ab'], expected: 'ab', note: 'cùng độ dài → bắt đầu sớm nhất' },
      { args: ['aA', 'A'], expected: 'A' },
    ],
    gen: (n, r) => [r.string(Math.max(1, n), 'abcA'), r.string(r.int(1, 3), 'abcA')],
    perf: { n: 1e5, limitMs: 100 },
  },
  '09': {
    sig: 'int peakLoad(int[] times, int w)',
    title: 'Đỉnh tải trong cửa sổ thời gian',
    ref: S.peakLoad,
    brute: (t: number[], w: number) => Math.max(0, ...allSub(t.length, (l, r) => (t[r] - t[l] < w ? r - l + 1 : undefined))),
    cases: [
      { args: [[0, 100, 500, 900, 1000, 1001], 1000], expected: 5 },
      { args: [[], 10], expected: 0 },
      { args: [[5, 5, 5], 1], expected: 3 },
      { args: [[0, 10, 20], 10], expected: 1 },
    ],
    gen: (n, r) => [r.sorted(n, 0, 50), r.int(1, 15)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '10': {
    sig: 'int longestStreak(int[] days, int k)',
    title: 'Streak dài nhất khi được bù k ngày',
    ref: S.longestStreak,
    brute: (d: number[], k: number) => Math.max(...allSub(d.length, (l, r) => (d.slice(l, r + 1).filter((x) => x === 0).length <= k ? r - l + 1 : undefined)), 0),
    cases: [
      { args: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expected: 6 },
      { args: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], expected: 10 },
      { args: [[0, 0], 0], expected: 0 },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      return [r.array(len, 0, 1), r.int(0, len)];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
};
