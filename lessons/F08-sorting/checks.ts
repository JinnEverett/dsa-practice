import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

const num = (a: number[]) => a.slice().sort((x, y) => x - y);

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int[] mergeSort(int[] nums)',
    title: 'Tự cài merge sort',
    ref: S.mergeSort,
    brute: num,
    cases: [
      { args: [[5, 2, 3, 1]], expected: [1, 2, 3, 5] },
      { args: [[5, 1, 1, 2, 0, 0]], expected: [0, 0, 1, 1, 2, 5] },
      { args: [[]], expected: [] },
      { args: [[10, 9, 1, 100]], expected: [1, 9, 10, 100] },
    ],
    gen: (n, r) => [r.array(n, -1e9, 1e9)],
    perf: { n: 1e5, limitMs: 150 },
  },
  '02': {
    sig: 'void quickSort(int[] nums)',
    title: 'Tự cài quick sort',
    ref: S.quickSort,
    brute: (nums: number[]) => num(nums).forEach((v, i) => (nums[i] = v)),
    output: 'arg0',
    cases: [
      { args: [[3, 7, 8, 1, 4]], expected: [1, 3, 4, 7, 8] },
      { args: [[]], expected: [] },
      { args: [new Array(20_000).fill(7)], note: 'toàn phần tử giống nhau' },
      { args: [Array.from({ length: 20_000 }, (_, i) => i)], note: 'đã sort sẵn' },
      { args: [Array.from({ length: 20_000 }, (_, i) => 20_000 - i)], note: 'sort ngược' },
    ],
    gen: (n, r) => [r.pick([() => r.array(n, -5, 5), () => r.array(n, -1e9, 1e9), () => r.sorted(n, 0, n)])()],
    perf: { n: 1e5, limitMs: 150 },
  },
  '03': {
    sig: 'int[] sortAges(int[] ages)',
    title: 'Sắp xếp tuổi (counting sort)',
    ref: S.sortAges,
    brute: num,
    cases: [
      { args: [[30, 5, 30, 0, 150]], expected: [0, 5, 30, 30, 150] },
      { args: [[]], expected: [] },
    ],
    gen: (n, r) => [r.array(n, 0, 150)],
    perf: { n: 1e6, limitMs: 150 },
  },
  '04': {
    sig: 'int[] frequencySort(int[] nums)',
    title: 'Sắp theo tần suất',
    ref: S.frequencySort,
    brute: (nums: number[]) => {
      const f = (x: number) => nums.filter((y) => y === x).length;
      return nums.slice().sort((a, b) => f(a) - f(b) || b - a);
    },
    cases: [
      { args: [[1, 1, 2, 2, 2, 3]], expected: [3, 1, 1, 2, 2, 2] },
      { args: [[2, 3, 1, 3, 2]], expected: [1, 3, 3, 2, 2] },
      { args: [[-1, 1, -6, 4, 5, -6, 1, 4, 1]], expected: [5, -1, 4, 4, -6, -6, 1, 1, 1] },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), -5, 5)],
    perf: { n: 1e5, limitMs: 200 },
  },
  '05': {
    sig: 'String largestNumber(int[] nums)',
    title: 'Số lớn nhất ghép được',
    ref: S.largestNumber,
    brute: (nums: number[]) => {
      // thử mọi hoán vị (n nhỏ)
      let best = '';
      const s = nums.map(String);
      const used = new Array(s.length).fill(false);
      const rec = (cur: string, depth: number) => {
        if (depth === s.length) {
          const v = cur.replace(/^0+(?=.)/, '');
          if (v.length > best.length || (v.length === best.length && v > best)) best = v;
          return;
        }
        for (let i = 0; i < s.length; i++) if (!used[i]) {
          used[i] = true;
          rec(cur + s[i], depth + 1);
          used[i] = false;
        }
      };
      rec('', 0);
      return best;
    },
    cases: [
      { args: [[10, 2]], expected: '210' },
      { args: [[3, 30, 34, 5, 9]], expected: '9534330' },
      { args: [[0, 0]], expected: '0' },
      { args: [[1]], expected: '1' },
      { args: [[121, 12]], expected: '12121' },
    ],
    gen: (n, r) => [r.array(Math.max(1, Math.min(n, 6)), 0, r.pick([9, 99, 1000]))],
    stress: { runs: 200, minN: 1, maxN: 6 },
    perf: { n: 10_000, limitMs: 100 },
  },
  '06': {
    sig: 'int[][] mergeIntervals(int[][] intervals)',
    title: 'Gộp khoảng',
    ref: S.mergeIntervals,
    brute: (iv: number[][]) => {
      let cur = iv.map((x) => x.slice());
      let changed = true;
      while (changed) {
        changed = false;
        outer: for (let i = 0; i < cur.length; i++)
          for (let j = i + 1; j < cur.length; j++)
            if (cur[i][0] <= cur[j][1] && cur[j][0] <= cur[i][1]) {
              cur[i] = [Math.min(cur[i][0], cur[j][0]), Math.max(cur[i][1], cur[j][1])];
              cur.splice(j, 1);
              changed = true;
              break outer;
            }
      }
      return cur.sort((a, b) => a[0] - b[0]);
    },
    cases: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { args: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
      { args: [[[5, 5]]], expected: [[5, 5]] },
    ],
    gen: (n, r) => [
      Array.from({ length: Math.max(1, n) }, () => {
        const s = r.int(0, 40);
        return [s, s + r.int(0, 6)];
      }),
    ],
    perf: { n: 1e5, limitMs: 200 },
  },
  '07': {
    sig: 'long countInversions(int[] nums)',
    title: 'Đếm số nghịch thế',
    ref: S.countInversions,
    brute: (a: number[]) => {
      let c = 0;
      for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) c++;
      return c;
    },
    cases: [
      { args: [[2, 4, 1, 3, 5]], expected: 3 },
      { args: [[5, 4, 3, 2, 1]], expected: 10 },
      { args: [[1, 1, 1]], expected: 0 },
      { args: [[]], expected: 0 },
      { args: [Array.from({ length: 100_000 }, (_, i) => 100_000 - i)], expected: 4_999_950_000, note: 'Java: long' },
    ],
    gen: (n, r) => [r.array(n, -5, 5)],
    perf: { n: 1e5, limitMs: 150 },
  },
  '08': {
    sig: 'String[] rankStudents(String[] names, int[] scores)',
    title: 'Bảng điểm (sort ổn định)',
    ref: S.rankStudents,
    brute: (names: string[], scores: number[]) => {
      const out: string[] = [];
      for (let s = 100; s >= 0; s--) names.forEach((nm, i) => scores[i] === s && out.push(nm));
      return out;
    },
    cases: [
      { args: [['An', 'Bình', 'Chi', 'Dũng'], [8, 9, 8, 10]], expected: ['Dũng', 'Bình', 'An', 'Chi'] },
      { args: [[], []], expected: [] },
    ],
    gen: (n, r) => [Array.from({ length: n }, (_, i) => `s${i}`), r.array(n, 0, 5)],
    perf: { n: 1e5, limitMs: 200 },
  },
  '09': {
    sig: 'int[] rankProducts(int[][] products)',
    title: 'Xếp hạng sản phẩm',
    ref: S.rankProducts,
    brute: (ps: number[][]) => {
      const better = (a: number[], b: number[]) => {
        for (const [k, dir] of [[1, -1], [2, -1], [3, 1], [0, 1]]) if (a[k] !== b[k]) return dir * (a[k] - b[k]) < 0;
        return false;
      };
      const rest = ps.map((p) => p.slice());
      const out: number[] = [];
      while (rest.length) {
        let bi = 0;
        for (let i = 1; i < rest.length; i++) if (better(rest[i], rest[bi])) bi = i;
        out.push(rest.splice(bi, 1)[0][0]);
      }
      return out;
    },
    cases: [
      { args: [[[1, 45, 100, 200], [2, 45, 100, 150], [3, 50, 3, 999], [4, 45, 200, 500]]], expected: [3, 4, 2, 1] },
      { args: [[]], expected: [] },
      { args: [[[9, 1_000_000_000, 0, 0], [8, 0, 1_000_000_000, 0]]], expected: [9, 8] },
    ],
    gen: (n, r) => [r.shuffle(Array.from({ length: n }, (_, i) => i + 1)).map((id) => [id, r.int(40, 42), r.int(0, 3), r.int(0, 3)])],
    perf: { n: 1e5, limitMs: 300 },
  },
  '10': {
    sig: 'String[] reorderLogs(String[] logs)',
    title: 'Sắp xếp log hệ thống',
    ref: S.reorderLogs,
    brute: (logs: string[]) => {
      const isDig = (l: string) => /^\S+ \d/.test(l);
      const key = (l: string) => {
        const i = l.indexOf(' ');
        return [l.slice(i + 1), l.slice(0, i)];
      };
      const letters = logs.filter((l) => !isDig(l));
      // insertion sort hiển nhiên đúng
      for (let i = 1; i < letters.length; i++)
        for (let j = i; j > 0; j--) {
          const [a, b] = [key(letters[j - 1]), key(letters[j])];
          if (a[0] > b[0] || (a[0] === b[0] && a[1] > b[1])) [letters[j - 1], letters[j]] = [letters[j], letters[j - 1]];
          else break;
        }
      return [...letters, ...logs.filter(isDig)];
    },
    cases: [
      {
        args: [['dig1 8 1 5 1', 'let1 art can', 'dig2 3 6', 'let2 own kit dig', 'let3 art zero']],
        expected: ['let1 art can', 'let3 art zero', 'let2 own kit dig', 'dig1 8 1 5 1', 'dig2 3 6'],
      },
      { args: [['a1 9 2 3 1', 'g1 act car', 'zo4 4 7', 'ab1 off key dog', 'a8 act zoo']], expected: ['g1 act car', 'a8 act zoo', 'ab1 off key dog', 'a1 9 2 3 1', 'zo4 4 7'] },
      { args: [['b1 x', 'a1 x']], expected: ['a1 x', 'b1 x'], note: 'trùng nội dung → theo id' },
    ],
    gen: (n, r) =>
      [Array.from({ length: Math.max(1, n) }, (_, i) => (r.bool() ? `d${i} ${r.int(0, 9)} ${r.int(0, 9)}` : `${r.pick(['a', 'b'])}${r.int(0, 3)} ${r.pick(['x', 'y'])} ${r.pick(['p', 'q'])}`))],
    perf: { n: 10_000, limitMs: 100 },
  },
};
