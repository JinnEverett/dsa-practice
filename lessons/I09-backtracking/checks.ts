import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const asc = (a: number[]) => a.slice().sort((x, y) => x - y);
const uniqBy = (lists: number[][]) => [...new Map(lists.map((l) => [JSON.stringify(l), l])).values()];

/** Mọi tập con theo bitmask; phần tử giữ thứ tự chỉ số. */
const allSubsetsByIndex = (nums: number[]): number[][] =>
  Array.from({ length: 1 << nums.length }, (_, mask) => nums.filter((_, i) => (mask >> i) & 1));

/** Mọi hoán vị của các chỉ số 0..n−1 bằng cách chèn dần (độc lập với khung choose/unchoose của ref). */
function allPerms(n: number): number[][] {
  let perms: number[][] = [[]];
  for (let v = 0; v < n; v++) perms = perms.flatMap((p) => range(p.length + 1).map((k) => [...p.slice(0, k), v, ...p.slice(k)]));
  return perms;
}

const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'List<List<Integer>> subsets(int[] nums)',
    title: 'Mọi tập con',
    ref: S.subsets,
    brute: allSubsetsByIndex,
    compare: 'unordered', // thứ tự các tập con tùy ý; trong mỗi tập, giữ thứ tự xuất hiện trong nums
    cases: [
      { args: [[1, 2, 3]], expected: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]] },
      { args: [[0]], expected: [[], [0]] },
      { args: [[3, 1]], expected: [[], [3], [1], [3, 1]], note: 'giữ thứ tự trong nums (3 trước 1)' },
      { args: [[]], expected: [[]] },
    ],
    gen: (n, r) => [r.distinct(n, -10, Math.max(10, 3 * n))],
    stress: { maxN: 8 },
    perf: { n: 16, limitMs: 200 },
  },
  '02': {
    sig: 'List<List<Integer>> subsetsWithDup(int[] nums)',
    title: 'Tập con không trùng (input có số lặp)',
    ref: S.subsetsWithDup,
    brute: (nums: number[]) => uniqBy(allSubsetsByIndex(nums).map(asc)),
    compare: 'unordered', // mỗi tập con liệt kê TĂNG DẦN, không lặp tập con
    cases: [
      { args: [[1, 2, 2]], expected: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] },
      { args: [[0]], expected: [[], [0]] },
      { args: [[2, 1, 2]], expected: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]], note: 'input chưa sắp' },
      { args: [[4, 4, 4]], expected: [[], [4], [4, 4], [4, 4, 4]] },
    ],
    gen: (n, r) => [r.array(n, 1, n > 8 ? 3 : 4)],
    stress: { maxN: 8 },
    perf: { n: 20, limitMs: 100 },
  },
  '03': {
    sig: 'List<List<Integer>> permute(int[] nums)',
    title: 'Mọi hoán vị',
    ref: S.permute,
    brute: (nums: number[]) => allPerms(nums.length).map((p) => p.map((i) => nums[i])),
    compare: 'unordered',
    cases: [
      { args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[0, 1]], expected: [[0, 1], [1, 0]] },
      { args: [[1]], expected: [[1]] },
    ],
    gen: (n, r) => [r.distinct(Math.max(1, n), -10, Math.max(10, 3 * n))],
    stress: { minN: 1, maxN: 6 },
    perf: { n: 9, limitMs: 800 },
    benchScales: { xs: 6, s: 7, m: 8, l: 9, xl: 10 }, // bench: n = 6..10 (n! tăng rất nhanh)
  },
  '04': {
    sig: 'List<List<Integer>> permuteUnique(int[] nums)',
    title: 'Hoán vị không trùng',
    ref: S.permuteUnique,
    brute: (nums: number[]) => uniqBy(allPerms(nums.length).map((p) => p.map((i) => nums[i]))),
    compare: 'unordered',
    cases: [
      { args: [[1, 1, 2]], expected: [[1, 1, 2], [1, 2, 1], [2, 1, 1]] },
      { args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[5, 5, 5]], expected: [[5, 5, 5]] },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), 1, n > 7 ? 2 : 3)],
    stress: { minN: 1, maxN: 7 },
    perf: { n: 10, limitMs: 100 },
  },
  '05': {
    sig: 'List<List<Integer>> combinationSum(int[] candidates, int target)',
    title: 'Tổ hợp có tổng bằng target (dùng lại được)',
    ref: S.combinationSum,
    brute: (cands: number[], target: number) => {
      // chọn số lần dùng mỗi ứng viên (theo thứ tự tăng dần của giá trị) rồi lọc tổng
      const a = asc(cands);
      const out: number[][] = [];
      const go = (i: number, left: number, cur: number[]) => {
        if (i === a.length) return void (left === 0 && out.push(cur));
        for (let k = 0; k * a[i] <= left; k++) go(i + 1, left - k * a[i], [...cur, ...new Array(k).fill(a[i])]);
      };
      go(0, target, []);
      return out;
    },
    compare: 'unordered', // mỗi tổ hợp liệt kê không giảm, không lặp tổ hợp
    cases: [
      { args: [[2, 3, 6, 7], 7], expected: [[2, 2, 3], [7]] },
      { args: [[2, 3, 5], 8], expected: [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
      { args: [[2], 1], expected: [] },
      { args: [[7, 3, 2], 7], expected: [[2, 2, 3], [7]], note: 'input chưa sắp' },
    ],
    gen: (n, r) => {
      const pool = range(14).map((i) => i + 2);
      const k = r.int(1, n > 25 ? 6 : 4);
      return [asc(r.shuffle(pool).slice(0, n > 25 ? 6 : k)), n > 25 ? n : r.int(1, Math.max(1, n))];
    },
    stress: { maxN: 25 },
    perf: { n: 120, limitMs: 100 },
  },
  '06': {
    sig: 'List<List<Integer>> combinationSum2(int[] candidates, int target)',
    title: 'Tổ hợp có tổng bằng target (mỗi số một lần)',
    ref: S.combinationSum2,
    brute: (cands: number[], target: number) =>
      uniqBy(
        allSubsetsByIndex(cands)
          .filter((s) => s.reduce((x, y) => x + y, 0) === target)
          .map(asc),
      ),
    compare: 'unordered',
    cases: [
      { args: [[10, 1, 2, 7, 6, 1, 5], 8], expected: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] },
      { args: [[2, 5, 2, 1, 2], 5], expected: [[1, 2, 2], [5]] },
      { args: [[1], 2], expected: [] },
      { args: [[1, 1, 1], 2], expected: [[1, 1]], note: 'không sinh [1,1] nhiều lần' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      const c = r.array(len, 1, n > 10 ? 6 : 8);
      return [c, n > 10 ? 40 : r.int(1, 15)];
    },
    stress: { minN: 1, maxN: 10 },
    perf: { n: 22, limitMs: 100 },
  },
  '07': {
    sig: 'List<String> generateParenthesis(int n)',
    title: 'Sinh ngoặc hợp lệ',
    ref: S.generateParenthesis,
    brute: (n: number) => {
      const out: string[] = [];
      for (let mask = 0; mask < 1 << (2 * n); mask++) {
        let bal = 0;
        let s = '';
        for (let i = 2 * n - 1; i >= 0 && bal >= 0; i--) {
          const open = (mask >> i) & 1;
          bal += open ? 1 : -1;
          s += open ? '(' : ')';
        }
        if (bal === 0) out.push(s);
      }
      return out;
    },
    compare: 'unordered',
    cases: [
      { args: [3], expected: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
      { args: [1], expected: ['()'] },
      { args: [2], expected: ['(())', '()()'] },
    ],
    gen: (n) => [Math.max(1, n)],
    stress: { minN: 1, maxN: 6 },
    perf: { n: 12, limitMs: 1000 },
  },
  '08': {
    sig: 'boolean exist(String[] board, String word)',
    title: 'Tìm từ trong bảng chữ cái',
    ref: S.exist,
    brute: (board: string[], word: string) => {
      const R = board.length;
      const C = board[0].length;
      const used = board.map((row) => new Array(row.length).fill(false));
      const go = (r: number, c: number, k: number): boolean => {
        if (r < 0 || c < 0 || r >= R || c >= C || used[r][c] || board[r][c] !== word[k]) return false;
        if (k === word.length - 1) return true;
        used[r][c] = true;
        const ok = D4.some(([dr, dc]) => go(r + dr, c + dc, k + 1));
        used[r][c] = false;
        return ok;
      };
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (go(r, c, 0)) return true;
      return false;
    },
    cases: [
      { args: [['ABCE', 'SFCS', 'ADEE'], 'ABCCED'], expected: true },
      { args: [['ABCE', 'SFCS', 'ADEE'], 'SEE'], expected: true },
      { args: [['ABCE', 'SFCS', 'ADEE'], 'ABCB'], expected: false, note: 'không dùng lại ô' },
      { args: [['A'], 'A'], expected: true },
      { args: [['A'], 'AA'], expected: false },
      {
        args: [Array.from({ length: 10 }, () => 'a'.repeat(10)), 'a'.repeat(30) + 'b'],
        expected: false,
        note: 'bảng toàn "a", từ có "b" — không cắt nhánh sẽ chạy cực lâu',
      },
      { args: [['aaa', 'aab'], 'aaaaab'], expected: true },
    ],
    gen: (n, r) => {
      if (n > 4) {
        const side = n;
        return [Array.from({ length: side }, () => 'a'.repeat(side)), 'a'.repeat(2 * side) + 'b'];
      }
      const R = r.int(1, 4);
      const C = r.int(1, 4);
      return [Array.from({ length: R }, () => r.string(C, 'ab')), r.string(r.int(1, 6), 'ab')];
    },
    stress: { maxN: 4 },
    perf: { n: 10, limitMs: 100 },
  },
  '09': {
    sig: 'int totalNQueens(int n)',
    title: 'Đếm cách đặt n quân hậu',
    ref: S.totalNQueens,
    brute: (n: number) => allPerms(n).filter((p) => p.every((c, r) => p.every((c2, r2) => r2 <= r || Math.abs(c - c2) !== r2 - r))).length,
    cases: [
      { args: [1], expected: 1 },
      { args: [2], expected: 0 },
      { args: [3], expected: 0 },
      { args: [4], expected: 2 },
      { args: [5], expected: 10 },
      { args: [6], expected: 4 },
      { args: [8], expected: 92 },
      { args: [10], expected: 724 },
      { args: [12], expected: 14200 },
      { args: [13], expected: 73712 },
    ],
    gen: (n) => [Math.max(1, n)],
    stress: { minN: 1, maxN: 7 },
    perf: { n: 13, limitMs: 800 },
  },
  '10': {
    sig: 'List<String> restoreIpAddresses(String s)',
    title: 'Khôi phục địa chỉ IP từ log mất dấu chấm',
    ref: S.restoreIpAddresses,
    brute: (s: string) => {
      const out: string[] = [];
      for (let a = 1; a <= 3; a++)
        for (let b = 1; b <= 3; b++)
          for (let c = 1; c <= 3; c++) {
            const d = s.length - a - b - c;
            if (d < 1 || d > 3) continue;
            const parts = [s.slice(0, a), s.slice(a, a + b), s.slice(a + b, a + b + c), s.slice(a + b + c)];
            if (parts.every((p) => (p === '0' || p[0] !== '0') && +p <= 255)) out.push(parts.join('.'));
          }
      return out;
    },
    compare: 'unordered',
    cases: [
      { args: ['25525511135'], expected: ['255.255.11.135', '255.255.111.35'] },
      { args: ['0000'], expected: ['0.0.0.0'] },
      { args: ['101023'], expected: ['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3'] },
      { args: ['1111'], expected: ['1.1.1.1'] },
      { args: ['999999999999'], expected: [] },
      { args: ['1'], expected: [] },
      { args: ['010010'], expected: ['0.10.0.10', '0.100.1.0'], note: 'số 0 đứng đầu' },
    ],
    gen: (_n, r) => [r.string(r.int(1, 13), '0125')],
    stress: { runs: 300, maxN: 30 },
    perf: false, // độ dài ≤ 12 cố định, không có thang n
  },
};
