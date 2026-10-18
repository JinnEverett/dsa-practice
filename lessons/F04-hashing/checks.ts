import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int[] twoSum(int[] nums, int target)',
    title: 'Two Sum',
    ref: S.twoSum,
    brute: (nums: number[], target: number) => {
      for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] + nums[j] === target) return [i, j];
      return [];
    },
    // nhiều đáp án hợp lệ → kiểm tra tính hợp lệ thay vì so bằng
    compare: (got, _exp, [nums, target]) => {
      if (!Array.isArray(got) || got.length !== 2) return 'phải trả về đúng 2 chỉ số';
      const [i, j] = got;
      if (!(Number.isInteger(i) && Number.isInteger(j) && 0 <= i && i < j && j < nums.length)) return 'cần 0 ≤ i < j < n';
      return nums[i] + nums[j] === target ? true : `nums[${i}] + nums[${j}] = ${nums[i] + nums[j]} ≠ ${target}`;
    },
    cases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
      { args: [[-1e9, 5, 1e9], 0], expected: [0, 2] },
    ],
    gen: (n, r) => {
      const len = Math.max(2, n);
      const nums = r.array(len, -50, 50);
      const i = r.int(0, len - 2);
      const j = r.int(i + 1, len - 1);
      return [nums, nums[i] + nums[j]];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'boolean containsNearbyDuplicate(int[] nums, int k)',
    title: 'Trùng lặp gần nhau',
    ref: S.containsNearbyDuplicate,
    brute: (nums: number[], k: number) => {
      for (let i = 0; i < nums.length; i++) for (let j = i + 1; j <= Math.min(nums.length - 1, i + k); j++) if (nums[i] === nums[j]) return true;
      return false;
    },
    cases: [
      { args: [[1, 2, 3, 1], 3], expected: true },
      { args: [[1, 0, 1, 1], 1], expected: true },
      { args: [[1, 2, 3, 1, 2, 3], 2], expected: false },
      { args: [[1, 1], 0], expected: false, note: 'k = 0' },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), 0, Math.max(2, n)), r.int(0, 6)],
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'boolean isIsomorphic(String s, String t)',
    title: 'Chuỗi đẳng cấu',
    ref: S.isIsomorphic,
    brute: (s: string, t: string) => {
      for (let i = 0; i < s.length; i++) for (let j = 0; j < s.length; j++) if ((s[i] === s[j]) !== (t[i] === t[j])) return false;
      return true;
    },
    cases: [
      { args: ['egg', 'add'], expected: true },
      { args: ['foo', 'bar'], expected: false },
      { args: ['badc', 'baba'], expected: false },
      { args: ['paper', 'title'], expected: true },
      { args: ['a', 'a'], expected: true },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      const s = r.string(len, 'abcd');
      const perm = r.shuffle([...'wxyz']);
      const t = r.bool(0.5) ? [...s].map((c) => perm['abcd'.indexOf(c)]).join('') : r.string(len, 'wxyz');
      return [s, t];
    },
    perf: { n: 50_000, limitMs: 100 },
  },
  '04': {
    sig: 'boolean wordPattern(String pattern, String s)',
    title: 'Mẫu từ',
    ref: S.wordPattern,
    brute: (p: string, s: string) => {
      const w = s.split(' ');
      if (w.length !== p.length) return false;
      for (let i = 0; i < p.length; i++) for (let j = 0; j < p.length; j++) if ((p[i] === p[j]) !== (w[i] === w[j])) return false;
      return true;
    },
    cases: [
      { args: ['abba', 'dog cat cat dog'], expected: true },
      { args: ['abba', 'dog cat cat fish'], expected: false },
      { args: ['abba', 'dog dog dog dog'], expected: false },
      { args: ['aaa', 'dog dog'], expected: false },
      { args: ['a', 'x'], expected: true },
    ],
    gen: (n, r) => {
      const len = Math.max(1, Math.min(n, 300));
      const p = r.string(len, 'abc');
      const words = ['dog', 'cat', 'fish', 'ant'];
      const map = r.shuffle(words.slice());
      const w = r.bool(0.5) ? [...p].map((c) => map['abc'.indexOf(c)]) : Array.from({ length: len + (r.bool(0.1) ? 1 : 0) }, () => r.pick(words));
      return [p, w.join(' ')];
    },
    perf: false,
  },
  '05': {
    sig: 'int longestConsecutive(int[] nums)',
    title: 'Dãy số liên tiếp dài nhất',
    ref: S.longestConsecutive,
    brute: (nums: number[]) => {
      let best = 0;
      for (const x of nums) {
        let len = 0;
        while (nums.includes(x + len)) len++;
        best = Math.max(best, len);
      }
      return best;
    },
    cases: [
      { args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
      { args: [[]], expected: 0 },
      { args: [[1, 2, 0, 1]], expected: 3 },
      { args: [[-1e9, 1e9]], expected: 1 },
    ],
    // n lớn: dãy 0..n-1 xáo trộn → bản thiếu điều kiện "đầu dãy" thành O(n²)
    gen: (n, r) => [n > 1000 ? r.shuffle(Array.from({ length: n }, (_, i) => i)) : r.array(n, -n, n)],
    perf: { n: 1e5, limitMs: 200 },
  },
  '06': {
    sig: 'int[] topKFrequent(int[] nums, int k)',
    title: 'k giá trị xuất hiện nhiều nhất',
    ref: S.topKFrequent,
    brute: (nums: number[], k: number) => {
      const vals = [...new Set(nums)];
      const f = (v: number) => nums.filter((x) => x === v).length;
      return vals.sort((a, b) => f(b) - f(a) || a - b).slice(0, k);
    },
    cases: [
      { args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { args: [[4, 4, 5, 5, 6], 3], expected: [4, 5, 6] },
      { args: [[7], 1], expected: [7] },
      { args: [[3, 1, 2], 2], expected: [1, 2], note: 'tie → giá trị nhỏ trước' },
    ],
    gen: (n, r) => {
      const nums = r.array(Math.max(1, n), -5, 5);
      return [nums, r.int(1, new Set(nums).size)];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '07': {
    sig: 'int fourSumCount(int[] a, int[] b, int[] c, int[] d)',
    title: 'Bốn mảng có tổng bằng 0',
    ref: S.fourSumCount,
    brute: (a: number[], b: number[], c: number[], d: number[]) => {
      let cnt = 0;
      for (const w of a) for (const x of b) for (const y of c) for (const z of d) if (w + x + y + z === 0) cnt++;
      return cnt;
    },
    cases: [
      { args: [[1, 2], [-2, -1], [-1, 2], [0, 2]], expected: 2 },
      { args: [[0], [0], [0], [0]], expected: 1 },
      { args: [[1], [1], [1], [1]], expected: 0 },
    ],
    gen: (n, r) => {
      const len = Math.max(1, Math.min(n, 12));
      const arr = () => r.array(len, -5, 5);
      return [arr(), arr(), arr(), arr()];
    },
    stress: { runs: 200, maxN: 12 },
    perf: { n: 200, limitMs: 50 },
    benchScales: { s: 50, m: 100, l: 200, xl: 400 },
  },
  '08': {
    sig: 'List<Integer> acceptRequests(String[] ids, int[] times, int window)',
    title: 'Chống gửi trùng request',
    ref: S.acceptRequests,
    brute: (ids: string[], times: number[], window: number) => {
      const out: number[] = [];
      for (let i = 0; i < ids.length; i++) {
        let last = -1;
        for (const j of out) if (ids[j] === ids[i]) last = j;
        if (last === -1 || times[i] - times[last] >= window) out.push(i);
      }
      return out;
    },
    cases: [
      { args: [['a', 'b', 'a', 'a', 'b'], [0, 1, 5, 10, 11], 10], expected: [0, 1, 3, 4] },
      { args: [[], [], 5], expected: [] },
      { args: [['x', 'x', 'x'], [0, 3, 6], 5], expected: [0, 2], note: 'so với lần được chấp nhận, không phải lần xuất hiện' },
      { args: [['x', 'x'], [7, 7], 1], expected: [0] },
    ],
    gen: (n, r) => {
      const times: number[] = [];
      let t = 0;
      for (let i = 0; i < n; i++) times.push((t += r.int(0, 3)));
      return [Array.from({ length: n }, () => r.pick(['a', 'b', 'c', 'u1', 'u2'])), times, r.int(1, 8)];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '09': {
    sig: 'List<List<String>> duplicateFiles(String[] paths, String[] contents)',
    title: 'Tìm file trùng nội dung',
    ref: S.duplicateFiles,
    brute: (paths: string[], contents: string[]) => {
      const out: string[][] = [];
      const done = new Array(paths.length).fill(false);
      for (let i = 0; i < paths.length; i++) {
        if (done[i]) continue;
        const g = [paths[i]];
        for (let j = i + 1; j < paths.length; j++) if (contents[j] === contents[i]) (g.push(paths[j]), (done[j] = true));
        if (g.length >= 2) out.push(g);
      }
      return out;
    },
    compare: 'unordered-deep',
    cases: [
      {
        args: [['/a/1.txt', '/a/2.txt', '/b/3.txt', '/c/4.txt'], ['abcd', 'efgh', 'abcd', 'efgh']],
        expected: [['/a/1.txt', '/b/3.txt'], ['/a/2.txt', '/c/4.txt']],
      },
      { args: [[], []], expected: [] },
      { args: [['/x'], ['q']], expected: [] },
    ],
    gen: (n, r) => [Array.from({ length: n }, (_, i) => `/d${r.int(0, 3)}/f${i}.txt`), Array.from({ length: n }, () => r.string(r.int(0, 2), 'ab'))],
    perf: { n: 20_000, limitMs: 100 },
  },
  '10': {
    sig: 'List<Integer> reconcile(int[] a, int[] b)',
    title: 'Đối soát hai hệ thống',
    ref: S.reconcile,
    brute: (a: number[], b: number[]) => {
      const rest = b.slice();
      const out: number[] = [];
      for (const x of a) {
        const i = rest.indexOf(x);
        if (i >= 0) rest.splice(i, 1);
        else out.push(x);
      }
      return out.sort((x, y) => x - y);
    },
    cases: [
      { args: [[5, 3, 5, 5, 9], [5, 9, 9, 7]], expected: [3, 5, 5] },
      { args: [[], [1]], expected: [] },
      { args: [[1e9, 2], []], expected: [2, 1e9] },
    ],
    gen: (n, r) => [r.array(n, 1, 8), r.array(r.int(0, n), 1, 8)],
    perf: { n: 1e5, limitMs: 200 },
  },
};
