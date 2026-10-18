import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const word = (r: Rng, max: number, alpha = LOWER) => r.string(r.int(0, max), alpha);

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'boolean isPalindrome(String s)',
    title: 'Palindrome hợp lệ',
    ref: S.isPalindrome,
    brute: (s: string) => {
      const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');
      return t === [...t].reverse().join('');
    },
    cases: [
      { args: ['A man, a plan, a canal: Panama'], expected: true },
      { args: ['race a car'], expected: false },
      { args: [' '], expected: true },
      { args: [''], expected: true },
      { args: ['0P'], expected: false, note: 'chữ số khác chữ cái' },
      { args: ['.,'], expected: true },
    ],
    gen: (n, r) => {
      const half = r.string(Math.floor(n / 2), 'abAB01 ,.:');
      const mid = r.bool() ? r.string(1, 'aB1.') : '';
      const s = half + mid + [...half].reverse().join('');
      return [r.bool(0.6) ? s : r.string(n, 'abAB01 ,.:')];
    },
    perf: { n: 200_000, limitMs: 100 },
  },
  '02': {
    sig: 'boolean isAnagram(String s, String t)',
    title: 'Anagram',
    ref: S.isAnagram,
    brute: (s: string, t: string) => [...s].sort().join('') === [...t].sort().join(''),
    cases: [
      { args: ['anagram', 'nagaram'], expected: true },
      { args: ['rat', 'car'], expected: false },
      { args: ['', ''], expected: true },
      { args: ['ab', 'a'], expected: false, note: 'khác độ dài' },
      { args: ['aacc', 'ccac'], expected: false },
    ],
    gen: (n, r) => {
      const s = r.string(n, 'abc');
      const t = r.bool(0.5) ? r.shuffle([...s]).join('') : r.string(n + r.int(-1, 1) * (n > 0 ? 1 : 0), 'abc');
      return [s, t];
    },
    perf: { n: 100_000, limitMs: 100 },
  },
  '03': {
    sig: 'int firstUniqChar(String s)',
    title: 'Ký tự không lặp đầu tiên',
    ref: S.firstUniqChar,
    brute: (s: string) => {
      for (let i = 0; i < s.length; i++) if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) return i;
      return -1;
    },
    cases: [
      { args: ['leetcode'], expected: 0 },
      { args: ['loveleetcode'], expected: 2 },
      { args: ['aabb'], expected: -1 },
      { args: ['z'], expected: 0 },
    ],
    gen: (n, r) => [r.string(Math.max(1, n), r.bool() ? 'abc' : LOWER)],
    perf: { n: 100_000, limitMs: 100 },
  },
  '04': {
    sig: 'String longestCommonPrefix(String[] strs)',
    title: 'Tiền tố chung dài nhất',
    ref: S.longestCommonPrefix,
    brute: (strs: string[]) => {
      let p = '';
      for (let len = 1; len <= Math.min(...strs.map((s) => s.length)); len++) {
        const cand = strs[0].slice(0, len);
        if (strs.every((s) => s.startsWith(cand))) p = cand;
        else break;
      }
      return p;
    },
    cases: [
      { args: [['flower', 'flow', 'flight']], expected: 'fl' },
      { args: [['dog', 'racecar', 'car']], expected: '' },
      { args: [['a']], expected: 'a' },
      { args: [['', 'abc']], expected: '' },
      { args: [['abc', 'abc']], expected: 'abc' },
      { args: [['ab', 'a']], expected: 'a' },
    ],
    gen: (n, r) => {
      const base = r.string(r.int(0, 8), 'ab');
      return [Array.from({ length: Math.max(1, n) }, () => base.slice(0, r.int(0, base.length)) + word(r, 3, 'ab'))];
    },
    perf: { n: 10_000, limitMs: 100 },
  },
  '05': {
    sig: 'String reverseWords(String s)',
    title: 'Đảo thứ tự từ',
    ref: S.reverseWords,
    brute: (s: string) => {
      const words: string[] = [];
      let cur = '';
      for (const ch of s + ' ') {
        if (ch === ' ') {
          if (cur) words.unshift(cur);
          cur = '';
        } else cur += ch;
      }
      return words.join(' ');
    },
    cases: [
      { args: ['the sky is blue'], expected: 'blue is sky the' },
      { args: ['  hello world  '], expected: 'world hello' },
      { args: ['a good   example'], expected: 'example good a' },
      { args: ['x'], expected: 'x' },
    ],
    gen: (n, r) => {
      const s = r.string(Math.max(1, n), 'ab1   ');
      return [/[^ ]/.test(s) ? s : s + 'z'];
    },
    perf: { n: 100_000, limitMs: 100 },
  },
  '06': {
    sig: 'String compress(String s)',
    title: 'Nén chuỗi (run-length)',
    ref: S.compress,
    brute: (s: string) => s.replace(/(.)\1*/g, (m, c) => (m.length > 1 ? c + m.length : c)),
    cases: [
      { args: ['aaabccdddd'], expected: 'a3bc2d4' },
      { args: ['abc'], expected: 'abc' },
      { args: ['aaaaaaaaaaaa'], expected: 'a12' },
      { args: [''], expected: '' },
      { args: ['aA'], expected: 'aA', note: 'phân biệt hoa/thường' },
    ],
    gen: (n, r) => {
      let s = '';
      while (s.length < n) s += r.pick(['a', 'b', 'B']).repeat(r.bool(0.2) ? r.int(10, 15) : r.int(1, 3));
      return [s.slice(0, n)];
    },
    perf: { n: 100_000, limitMs: 100 },
  },
  '07': {
    sig: 'List<List<String>> groupAnagrams(String[] strs)',
    title: 'Gom nhóm anagram',
    ref: S.groupAnagrams,
    brute: (strs: string[]) => {
      const used = new Array(strs.length).fill(false);
      const key = (w: string) => [...w].sort().join('');
      const out: string[][] = [];
      for (let i = 0; i < strs.length; i++) {
        if (used[i]) continue;
        const g = [strs[i]];
        used[i] = true;
        for (let j = i + 1; j < strs.length; j++) if (!used[j] && key(strs[j]) === key(strs[i])) (g.push(strs[j]), (used[j] = true));
        out.push(g);
      }
      return out;
    },
    compare: 'unordered-deep',
    cases: [
      { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
      { args: [['']], expected: [['']] },
      { args: [['a']], expected: [['a']] },
      { args: [['ab', 'ba', 'ab']], expected: [['ab', 'ab', 'ba']] },
    ],
    gen: (n, r) => [Array.from({ length: Math.max(1, n) }, () => word(r, 4, 'abc'))],
    perf: { n: 10_000, limitMs: 200 },
  },
  '08': {
    sig: 'int myAtoi(String s)',
    title: 'atoi 32-bit',
    ref: S.myAtoi,
    brute: (s: string) => {
      const m = /^ *([+-]?)(\d+)/.exec(s);
      if (!m) return 0;
      const v = BigInt(m[1] === '-' ? '-' + m[2] : m[2]);
      const MAX = 2n ** 31n - 1n;
      const MIN = -(2n ** 31n);
      return Number(v > MAX ? MAX : v < MIN ? MIN : v);
    },
    cases: [
      { args: ['42'], expected: 42 },
      { args: ['   -042'], expected: -42 },
      { args: ['1337c0d3'], expected: 1337 },
      { args: ['0-1'], expected: 0 },
      { args: ['words 987'], expected: 0 },
      { args: ['-91283472332'], expected: -2147483648 },
      { args: ['+-12'], expected: 0 },
      { args: ['2147483648'], expected: 2147483647 },
      { args: [''], expected: 0 },
      { args: ['  -0'], expected: 0 },
      { args: ['00000000000000000000123'], expected: 123 },
    ],
    gen: (n, r) => [r.string(r.int(0, 3), ' ') + r.string(r.int(0, 1), '+-') + r.string(Math.min(n, 15), '0123456789') + r.string(r.int(0, 3), 'a. -9')],
    perf: false,
  },
  '09': {
    sig: 'String slugify(String title)',
    title: 'Slug cho URL',
    ref: S.slugify,
    cases: [
      { args: ['Hướng dẫn  Đăng ký — Tài khoản (2026)!'], expected: 'huong-dan-dang-ky-tai-khoan-2026' },
      { args: ['  --Xin chào--  '], expected: 'xin-chao' },
      { args: ['!!!'], expected: '' },
      { args: ['Ngô Bảo Châu'], expected: 'ngo-bao-chau' },
      { args: [''], expected: '' },
      { args: ['ĐƯỜNG Lê Lợi, Quận 1'], expected: 'duong-le-loi-quan-1' },
      { args: ['Phở bò & Bún chả'], expected: 'pho-bo-bun-cha' },
      { args: ['Ứng dụng Ợ Ỵ ỹ'], expected: 'ung-dung-o-y-y' },
      { args: ['abc123'], expected: 'abc123' },
    ],
    gen: (n, r) => [r.string(n, 'aăâđeêioôơuưyÁẮẦĐẾÍỌỐỜỨỶ 1-!,')],
    stress: false,
    perf: { n: 100_000, limitMs: 200 },
  },
  '10': {
    sig: 'String addStrings(String num1, String num2)',
    title: 'Cộng hai số dạng chuỗi',
    ref: S.addStrings,
    brute: (a: string, b: string) => (BigInt(a) + BigInt(b)).toString(),
    cases: [
      { args: ['11', '123'], expected: '134' },
      { args: ['456', '77'], expected: '533' },
      { args: ['0', '0'], expected: '0' },
      { args: ['995', '17'], expected: '1012' },
      { args: ['9999999999999999999', '1'], expected: '10000000000000000000', note: 'vượt 2⁶³' },
    ],
    gen: (n, r) => {
      const num = (len: number) => (len <= 1 ? String(r.int(0, 9)) : String(r.int(1, 9)) + r.string(len - 1, r.bool() ? '9' : '0123456789'));
      return [num(Math.max(1, n)), num(r.int(1, Math.max(1, n)))];
    },
    perf: { n: 100_000, limitMs: 150 },
  },
};
