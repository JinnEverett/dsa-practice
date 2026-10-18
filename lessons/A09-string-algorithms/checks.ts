import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

/** Số lần xuất hiện (cho phép chồng lấn) của sub trong s. */
const occurrences = (s: string, sub: string): number => {
  let c = 0;
  for (let i = s.indexOf(sub); i !== -1; i = s.indexOf(sub, i + 1)) c++;
  return c;
};
const isPal = (s: string) => s === [...s].reverse().join('');

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int strStr(String haystack, String needle)',
    title: 'Tìm chuỗi con (KMP)',
    ref: S.strStr,
    brute: (h: string, n: string): number => {
      for (let i = 0; i + n.length <= h.length; i++) {
        let j = 0;
        while (j < n.length && h[i + j] === n[j]) j++;
        if (j === n.length) return i;
      }
      return -1;
    },
    cases: [
      { args: ['sadbutsad', 'sad'], expected: 0 },
      { args: ['leetcode', 'leeto'], expected: -1 },
      { args: ['hello', 'll'], expected: 2 },
      { args: ['a', 'a'], expected: 0 },
      { args: ['abc', 'abcd'], expected: -1, note: 'needle dài hơn haystack' },
      { args: ['a'.repeat(10_000), 'a'.repeat(5_000) + 'b'], expected: -1, note: 'dài hơn nữa (10⁶) ở phần Perf: O(n·m) thô ≈ 2.5·10¹¹ phép' },
    ],
    gen: (n, r) =>
      n >= 1e6
        ? ['a'.repeat(1_000_000), 'a'.repeat(500_000) + 'b']
        : [r.string(r.int(1, 12), 'ab'), r.string(r.int(1, 4), 'ab')],
    stress: { minN: 1 },
    perf: { n: 1e6, limitMs: 300 },
  },
  '02': {
    sig: 'int[] prefixFunction(String s)',
    title: 'Prefix function',
    ref: S.prefixFunction,
    brute: (s: string): number[] =>
      Array.from(s, (_, i) => {
        for (let k = i; k >= 1; k--) if (s.slice(0, k) === s.slice(i + 1 - k, i + 1)) return k; // border thực sự: k ≤ i
        return 0;
      }),
    cases: [
      { args: ['abab'], expected: [0, 0, 1, 2] },
      { args: ['aabaaab'], expected: [0, 1, 0, 1, 2, 2, 3] },
      { args: ['a'], expected: [0] },
      { args: ['abcabcd'], expected: [0, 0, 0, 1, 2, 3, 0] },
      { args: ['aaaa'], expected: [0, 1, 2, 3] },
    ],
    gen: (n, r) => [n >= 1e6 ? r.string(n, 'ab') : r.string(r.int(1, 14), 'ab')],
    stress: { minN: 1 },
    perf: { n: 1e6, limitMs: 800 },
  },
  '03': {
    sig: 'int[] zFunction(String s)',
    title: 'Z-function',
    ref: S.zFunction,
    brute: (s: string): number[] =>
      Array.from(s, (_, i) => {
        if (i === 0) return s.length;
        let k = 0;
        while (i + k < s.length && s[k] === s[i + k]) k++;
        return k;
      }),
    cases: [
      { args: ['aaaaa'], expected: [5, 4, 3, 2, 1] },
      { args: ['abacaba'], expected: [7, 0, 1, 0, 3, 0, 1] },
      { args: ['a'], expected: [1], note: 'z[0] = n' },
      { args: ['abc'], expected: [3, 0, 0] },
    ],
    gen: (n, r) => [n >= 1e6 ? r.string(n, 'ab') : r.string(r.int(1, 14), 'ab')],
    stress: { minN: 1 },
    perf: { n: 1e6, limitMs: 800 },
  },
  '04': {
    sig: 'boolean repeatedSubstringPattern(String s)',
    title: 'Chuỗi lặp',
    ref: S.repeatedSubstringPattern,
    brute: (s: string): boolean => {
      for (let len = 1; len * 2 <= s.length; len++) if (s.length % len === 0 && s.slice(0, len).repeat(s.length / len) === s) return true;
      return false;
    },
    cases: [
      { args: ['abab'], expected: true },
      { args: ['aba'], expected: false },
      { args: ['abcabcabcabc'], expected: true },
      { args: ['a'], expected: false },
      { args: ['aa'], expected: true },
      { args: ['a'.repeat(99_999) + 'b'], expected: false },
    ],
    gen: (n, r) => {
      if (n >= 1e6) return ['ab'.repeat(500_000)];
      if (r.bool(0.5)) return [r.string(r.int(1, 4), 'ab').repeat(r.int(1, 4))];
      return [r.string(r.int(1, 12), 'ab')];
    },
    stress: { minN: 1 },
    perf: { n: 1e6, limitMs: 150 },
  },
  '05': {
    sig: 'String shortestPalindrome(String s)',
    title: 'Palindrome ngắn nhất bằng cách thêm vào đầu',
    ref: S.shortestPalindrome,
    brute: (s: string): string => {
      for (let k = s.length; k >= 0; k--) {
        if (isPal(s.slice(0, k))) return [...s.slice(k)].reverse().join('') + s;
      }
      return s;
    },
    cases: [
      { args: ['aacecaaa'], expected: 'aaacecaaa' },
      { args: ['abcd'], expected: 'dcbabcd' },
      { args: [''], expected: '' },
      { args: ['a'], expected: 'a' },
      { args: ['aba'], expected: 'aba' },
      {
        // a^m b a^(m−1) c: tiền tố palindrome dài nhất là a^m; thử từng tiền tố từ dài xuống ngắn tốn ~m²/2 phép
        args: ['a'.repeat(19_999) + 'b' + 'a'.repeat(19_998) + 'c'],
        expected: 'c' + 'a'.repeat(19_998) + 'b' + 'a'.repeat(19_999) + 'b' + 'a'.repeat(19_998) + 'c',
        note: 'dạng aᵐ b aᵐ⁻¹ c: tiền tố palindrome dài nhất là aᵐ; thử từng tiền tố là O(n²) (ở n = 10⁶ trong Perf)',
      },
    ],
    gen: (n, r) => (n >= 1e6 ? ['a'.repeat(499_999) + 'b' + 'a'.repeat(499_998) + 'c'] : [r.string(r.int(0, 12), 'ab')]),
    perf: { n: 1e6, limitMs: 500 },
  },
  '06': {
    sig: 'String longestDupSubstring(String s)',
    title: 'Chuỗi con lặp dài nhất (rolling hash)',
    ref: S.longestDupSubstring,
    brute: (s: string): string => {
      for (let L = s.length - 1; L >= 1; L--) {
        const seen = new Set<string>();
        for (let i = 0; i + L <= s.length; i++) {
          const sub = s.slice(i, i + L);
          if (seen.has(sub)) return sub;
          seen.add(sub);
        }
      }
      return '';
    },
    compare: (got, expected, [s]) => {
      if (typeof got !== 'string') return 'cần trả về chuỗi';
      if (expected === '') return got === '' || `không có chuỗi con lặp, cần ""`;
      if (got.length !== expected.length) return `độ dài ${got.length}, cần ${expected.length}`;
      return occurrences(s, got) >= 2 || `"${got.slice(0, 20)}…" không xuất hiện ≥ 2 lần`;
    },
    cases: [
      { args: ['banana'], expected: 'ana' },
      { args: ['abcd'], expected: '' },
      { args: ['aa'], expected: 'a' },
      { args: ['aaaaa'], expected: 'aaaa', note: 'hai lần xuất hiện chồng lấn' },
      { args: ['abcabcabc'], expected: 'abcabc' },
    ],
    gen: (n, r) => [n >= 1e5 ? r.string(n, 'abcdefghij') : r.string(r.int(1, 14), 'ab')],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 1500 },
  },
  '07': {
    sig: 'List<Integer> findAll(String text, String pattern)',
    title: '🔴 Tìm mọi vị trí khớp',
    ref: S.findAll,
    brute: (text: string, p: string): number[] => {
      const out: number[] = [];
      for (let i = 0; i + p.length <= text.length; i++) if (text.startsWith(p, i)) out.push(i);
      return out;
    },
    cases: [
      { args: ['aaaaa', 'aa'], expected: [0, 1, 2, 3], note: 'chồng lấn' },
      { args: ['abcabc', 'bc'], expected: [1, 4] },
      { args: ['abc', 'd'], expected: [] },
      { args: ['abc', 'abcd'], expected: [] },
      {
        args: ['a'.repeat(20_000), 'a'.repeat(10_000)],
        expected: Array.from({ length: 10_001 }, (_, i) => i),
        note: '10 001 vị trí chồng lấn (ở n = 10⁶ trong Perf: thô O(n·m) ≈ 2.5·10¹¹ phép)',
      },
    ],
    gen: (n, r) => (n >= 1e6 ? ['a'.repeat(1_000_000), 'a'.repeat(500_000)] : [r.string(r.int(0, 14), 'ab'), r.string(r.int(1, 3), 'ab')]),
    perf: { n: 1e6, limitMs: 500 },
  },
  '08': {
    sig: 'int longestCommonSubstring(String a, String b)',
    title: '🔴 Chuỗi con chung dài nhất',
    ref: S.longestCommonSubstring,
    brute: (a: string, b: string): number => {
      let best = 0;
      for (let i = 0; i < a.length; i++)
        for (let j = 0; j < b.length; j++) {
          let k = 0;
          while (i + k < a.length && j + k < b.length && a[i + k] === b[j + k]) k++;
          best = Math.max(best, k);
        }
      return best;
    },
    cases: [
      { args: ['abcdxyz', 'xyzabcd'], expected: 4 },
      { args: ['abc', 'def'], expected: 0 },
      { args: ['', 'abc'], expected: 0 },
      { args: ['abc', 'abc'], expected: 3 },
      { args: ['a'.repeat(100_000), 'a'.repeat(50_000)], expected: 50_000 },
    ],
    gen: (n, r) => (n >= 1e5 ? [r.string(n, 'ab'), r.string(n, 'ab')] : [r.string(r.int(0, 10), 'ab'), r.string(r.int(0, 10), 'ab')]),
    perf: { n: 1e5, limitMs: 2000 },
  },
};
