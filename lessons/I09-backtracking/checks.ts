import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

const asc = (a: number[]) => a.slice().sort((x, y) => x - y);
const key = (a: unknown) => JSON.stringify(a);

// ─── brute dùng chung (viết độc lập với solutions.ts) ───
/** Mọi tập con theo bitmask (phần tử giữ thứ tự chỉ số). */
const bitmaskSubsets = (a: number[]): number[][] => {
  const out: number[][] = [];
  for (let m = 0; m < 1 << a.length; m++) out.push(a.filter((_, i) => (m >> i) & 1));
  return out;
};
/** Mọi hoán vị (có thể trùng) bằng cách chèn phần tử mới vào mọi vị trí. */
const insertPerms = (a: number[]): number[][] => {
  let perms: number[][] = [[]];
  for (const x of a) {
    const next: number[][] = [];
    for (const p of perms) for (let pos = 0; pos <= p.length; pos++) next.push([...p.slice(0, pos), x, ...p.slice(pos)]);
    perms = next;
  }
  return perms;
};
const dedupe = (lists: number[][]): number[][] => [...new Map(lists.map((l) => [key(l), l])).values()];

/** Số cách đặt n hậu: duyệt mọi hoán vị cột rồi kiểm tra đường chéo. */
const queensBrute = (n: number): number => {
  let count = 0;
  const cols: number[] = [];
  const used = new Array<boolean>(n).fill(false);
  const rec = (): void => {
    if (cols.length === n) {
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(cols[i] - cols[j]) === j - i) return;
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (used[c]) continue;
      used[c] = true;
      cols.push(c);
      rec();
      cols.pop();
      used[c] = false;
    }
  };
  rec();
  return count;
};

/** Đáp án n=1..12 của N-Queens (OEIS A000170), dùng làm expected viết tay. */
const QUEENS = [1, 0, 0, 2, 10, 4, 40, 92, 352, 724, 2680, 14200];

const isValidPart = (p: string) => /^(0|[1-9][0-9]{0,2})$/.test(p) && Number(p) <= 255;

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'List<List<Integer>> subsets(int[] nums)',
    title: 'Subsets',
    ref: S.subsets,
    brute: bitmaskSubsets,
    compare: 'unordered',
    cases: [
      { args: [[1, 2, 3]], expected: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]] },
      { args: [[0]], expected: [[], [0]] },
      { args: [[]], expected: [[]] },
      { args: [[3, 1]], expected: [[], [3], [1], [3, 1]], note: 'giữ thứ tự chỉ số, không sort' },
    ],
    gen: (n, r) => [r.distinct(Math.min(n, 22), -30, 30)],
    stress: { maxN: 10 },
    benchScales: { s: 10, m: 16, l: 20 },
    perf: { n: 16, limitMs: 300 },
  },
  '02': {
    sig: 'List<List<Integer>> subsetsWithDup(int[] nums)',
    title: 'Subsets II (có phần tử trùng)',
    ref: S.subsetsWithDup,
    brute: (a: number[]) => dedupe(bitmaskSubsets(asc(a))),
    compare: 'unordered',
    cases: [
      { args: [[1, 2, 2]], expected: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] },
      { args: [[0]], expected: [[], [0]] },
      { args: [[]], expected: [[]] },
      { args: [[2, 1, 2]], expected: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]], note: 'input chưa sort; mỗi tập con trả về tăng dần' },
      { args: [[4, 4, 4, 1, 4]], note: 'nhiều số 4' },
    ],
    gen: (n, r) => [r.array(Math.min(n, 20), n > 12 ? 0 : -3, n > 12 ? 3 : 3)],
    stress: { maxN: 12 },
    perf: { n: 20, limitMs: 60 },
  },
  '03': {
    sig: 'List<List<Integer>> permute(int[] nums)',
    title: 'Permutations',
    ref: S.permute,
    brute: insertPerms,
    compare: 'unordered',
    cases: [
      { args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[0, 1]], expected: [[0, 1], [1, 0]] },
      { args: [[1]], expected: [[1]] },
    ],
    gen: (n, r) => [r.distinct(Math.max(1, Math.min(n, 10)), -10, 10)],
    stress: { minN: 1, maxN: 7 },
    benchScales: { s: 6, m: 8, l: 9 },
    perf: { n: 8, limitMs: 100 },
  },
  '04': {
    sig: 'List<List<Integer>> permuteUnique(int[] nums)',
    title: 'Permutations II (có phần tử trùng)',
    ref: S.permuteUnique,
    brute: (a: number[]) => dedupe(insertPerms(a)),
    compare: 'unordered',
    cases: [
      { args: [[1, 1, 2]], expected: [[1, 1, 2], [1, 2, 1], [2, 1, 1]] },
      { args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[2, 2, 2]], expected: [[2, 2, 2]] },
      { args: [[1]], expected: [[1]] },
    ],
    gen: (n, r) => [r.array(Math.max(1, Math.min(n, 10)), 0, n >= 9 ? 2 : 3)],
    stress: { minN: 1, maxN: 8 },
    perf: { n: 10, limitMs: 80 },
  },
  '05': {
    sig: 'List<List<Integer>> combinationSum(int[] candidates, int target)',
    title: 'Combination Sum (dùng lại được)',
    ref: S.combinationSum,
    // brute: duyệt "số lần dùng" của từng ứng viên (không dùng start-index như ref)
    brute: (c: number[], target: number) => {
      const a = asc(c);
      const out: number[][] = [];
      const rec = (i: number, remain: number, acc: number[]): void => {
        if (i === a.length) {
          if (remain === 0) out.push(acc);
          return;
        }
        for (let times = 0; times * a[i] <= remain; times++) rec(i + 1, remain - times * a[i], acc.concat(new Array<number>(times).fill(a[i])));
      };
      rec(0, target, []);
      return out;
    },
    compare: 'unordered',
    cases: [
      { args: [[2, 3, 6, 7], 7], expected: [[2, 2, 3], [7]] },
      { args: [[2, 3, 5], 8], expected: [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
      { args: [[2], 1], expected: [] },
      { args: [[7, 3, 2], 7], expected: [[2, 2, 3], [7]], note: 'input chưa sort' },
      { args: [[1], 5], expected: [[1, 1, 1, 1, 1]] },
    ],
    gen: (n, r) => {
      // perf (n ≥ 10): ứng viên 1..n xáo trộn, target 40
      if (n >= 10) return [r.shuffle(Array.from({ length: n }, (_, i) => i + 1)), 40];
      const len = Math.max(1, Math.min(n, 6));
      return [r.distinct(len, 1, 12), r.int(1, 20)];
    },
    stress: { minN: 1, maxN: 6 },
    perf: { n: 10, limitMs: 80 },
  },
  '06': {
    sig: 'List<List<Integer>> combinationSum2(int[] candidates, int target)',
    title: 'Combination Sum II (dùng một lần, có trùng)',
    ref: S.combinationSum2,
    brute: (c: number[], target: number) =>
      dedupe(bitmaskSubsets(asc(c)).filter((s) => s.reduce((x, y) => x + y, 0) === target)),
    compare: 'unordered',
    cases: [
      { args: [[10, 1, 2, 7, 6, 1, 5], 8], expected: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] },
      { args: [[2, 5, 2, 1, 2], 5], expected: [[1, 2, 2], [5]] },
      { args: [[2, 2, 2], 1], expected: [] },
      { args: [[1, 1, 1, 1], 2], expected: [[1, 1]] },
    ],
    gen: (n, r) => {
      if (n >= 50) return [r.array(n, 1, 50), 30]; // perf: 100 ứng viên, nhiều trùng
      const len = Math.max(1, Math.min(n, 14));
      return [r.array(len, 1, 8), r.int(1, 15)];
    },
    stress: { minN: 1, maxN: 14 },
    perf: { n: 100, limitMs: 100 },
  },
  '07': {
    sig: 'List<String> generateParenthesis(int n)',
    title: 'Generate Parentheses',
    ref: S.generateParenthesis,
    // brute: mọi chuỗi 2^(2n) rồi lọc chuỗi cân bằng
    brute: (n: number) => {
      const out: string[] = [];
      for (let m = 0; m < 1 << (2 * n); m++) {
        let s = '';
        let bal = 0;
        let ok = true;
        for (let i = 2 * n - 1; i >= 0; i--) {
          const open = (m >> i) & 1;
          s += open ? '(' : ')';
          bal += open ? 1 : -1;
          if (bal < 0) ok = false;
        }
        if (ok && bal === 0) out.push(s);
      }
      return out;
    },
    compare: 'unordered',
    cases: [
      { args: [1], expected: ['()'] },
      { args: [2], expected: ['(())', '()()'] },
      { args: [3], expected: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
      { args: [8], note: 'C₈ = 1430 chuỗi (brute duyệt 2¹⁶)' },
    ],
    gen: (n) => [Math.max(1, Math.min(n, 11))],
    stress: { minN: 1, maxN: 7 },
    perf: { n: 11, limitMs: 300 },
  },
  '08': {
    sig: 'boolean exist(String[] board, String word)',
    title: 'Word Search',
    ref: S.exist,
    // brute: duyệt đường đi bằng stack tường minh, đường đi lưu cả mảng ô (kiểm tra "đã đi" bằng includes)
    brute: (board: string[], word: string) => {
      const m = board.length;
      const n = board[0].length;
      for (let r0 = 0; r0 < m; r0++)
        for (let c0 = 0; c0 < n; c0++) {
          const stack: number[][][] = [[[r0, c0]]];
          while (stack.length) {
            const path = stack.pop()!;
            const [r, c] = path[path.length - 1];
            if (board[r][c] !== word[path.length - 1]) continue;
            if (path.length === word.length) return true;
            for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue;
              if (path.some(([pr, pc]) => pr === nr && pc === nc)) continue;
              stack.push([...path, [nr, nc]]);
            }
          }
        }
      return false;
    },
    cases: [
      { args: [['ABCE', 'SFCS', 'ADEE'], 'ABCCED'], expected: true },
      { args: [['ABCE', 'SFCS', 'ADEE'], 'SEE'], expected: true },
      { args: [['ABCE', 'SFCS', 'ADEE'], 'ABCB'], expected: false, note: 'không dùng lại ô' },
      { args: [['a'], 'a'], expected: true },
      { args: [['a'], 'ab'], expected: false },
      { args: [['aa'], 'aaa'], expected: false, note: 'word dài hơn số ô' },
    ],
    gen: (n, r) => {
      if (n >= 6) {
        // perf (đối kháng): bàn 6×6 toàn 'a', word = 15 chữ 'a' rồi 'b' (không có 'b' trên bàn)
        return [Array.from({ length: 6 }, () => 'a'.repeat(6)), 'a'.repeat(15) + 'b'];
      }
      const m = r.int(1, Math.max(1, n));
      const c = r.int(1, Math.max(1, n));
      const board = Array.from({ length: m }, () => r.string(c, 'abc'));
      let word: string;
      if (r.bool(0.6)) {
        // đi bộ ngẫu nhiên trên bàn (không lặp ô) → hay ra true
        let rr = r.int(0, m - 1);
        let cc = r.int(0, c - 1);
        const seen = new Set<number>([rr * c + cc]);
        word = board[rr][cc];
        for (let step = r.int(0, 6); step > 0; step--) {
          const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]]
            .map(([dr, dc]) => [rr + dr, cc + dc])
            .filter(([a, b]) => a >= 0 && b >= 0 && a < m && b < c && !seen.has(a * c + b));
          if (!opts.length) break;
          [rr, cc] = r.pick(opts);
          seen.add(rr * c + cc);
          word += board[rr][cc];
        }
      } else word = r.string(r.int(1, 7), 'abc');
      return [board, word];
    },
    stress: { maxN: 5, minN: 1 },
    perf: { n: 6, limitMs: 50, java: 40 },
  },
  '09': {
    sig: 'int totalNQueens(int n)',
    title: 'N-Queens (đếm nghiệm)',
    ref: S.totalNQueens,
    brute: queensBrute,
    cases: [
      ...[1, 2, 3, 4, 5, 6, 8, 9, 12].map((n) => ({ args: [n], expected: QUEENS[n - 1] })),
    ],
    gen: (n) => [Math.max(1, Math.min(n, 14))],
    stress: { minN: 1, maxN: 8 },
    benchScales: { s: 8, m: 10, l: 12, xl: 14 },
    perf: { n: 12, limitMs: 150 },
  },
  '10': {
    sig: 'List<String> restoreIpAddresses(String s)',
    title: 'Khôi phục IP từ log mất dấu chấm',
    ref: S.restoreIpAddresses,
    // brute: ba vòng lặp chọn vị trí dấu chấm, kiểm tra bằng regex
    brute: (s: string) => {
      const out: string[] = [];
      const L = s.length;
      for (let i = 1; i < L; i++)
        for (let j = i + 1; j < L; j++)
          for (let k = j + 1; k < L; k++) {
            const parts = [s.slice(0, i), s.slice(i, j), s.slice(j, k), s.slice(k)];
            if (parts.every(isValidPart)) out.push(parts.join('.'));
          }
      return out;
    },
    compare: 'unordered',
    cases: [
      { args: ['25525511135'], expected: ['255.255.11.135', '255.255.111.35'] },
      { args: ['0000'], expected: ['0.0.0.0'] },
      { args: ['101023'], expected: ['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3'] },
      { args: ['1111'], expected: ['1.1.1.1'] },
      { args: ['111'], expected: [], note: 'quá ngắn' },
      { args: ['1234567890123'], expected: [], note: 'quá dài (> 12)' },
      { args: ['256256256256'], expected: [], note: 'đoạn > 255' },
      { args: ['010010'], expected: ['0.10.0.10', '0.100.1.0'], note: 'số 0 đứng đầu' },
    ],
    gen: (n, r) => [r.string(Math.min(n, 16), '01259')],
    stress: { maxN: 16 },
    perf: false,
  },
};
