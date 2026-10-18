import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Rừng ngẫu nhiên n node với chỉ số xáo trộn; deep = true → cả rừng là một chuỗi dài n. */
const forest = (n: number, r: Rng, deep: boolean) => {
  const order = r.shuffle(Array.from({ length: n }, (_, i) => i));
  const parent = new Array<number>(n).fill(-1);
  for (let k = 1; k < n; k++) {
    if (!deep && r.bool(0.1)) continue; // thêm gốc
    parent[order[k]] = deep ? order[k - 1] : order[r.int(0, k - 1)];
  }
  return parent;
};

const depthBrute = (parent: number[]) => {
  let best = 0;
  for (let i = 0; i < parent.length; i++) {
    let d = 1;
    for (let u = i; parent[u] !== -1; u = parent[u]) d++;
    best = Math.max(best, d);
  }
  return best;
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'double myPow(double x, int n)',
    title: 'Lũy thừa nhanh',
    ref: S.myPow,
    brute: (x: number, n: number) => Math.pow(x, n),
    compare: 'float',
    cases: [
      { args: [2, 10], expected: 1024 },
      { args: [2.1, 3], expected: 9.261 },
      { args: [2, -2], expected: 0.25 },
      { args: [1, -2147483648], expected: 1, note: 'Java: −n tràn khi n = −2³¹' },
      { args: [-1, 2147483647], expected: -1 },
      { args: [0.5, 0], expected: 1 },
    ],
    // n lớn (perf): x = 1, số mũ 2³¹ − 1 → bản nhân n lần mất vài giây
    gen: (n, r) => (n > 1000 ? [1, n] : [r.pick([-2, -1.5, -1, 0.5, 1, 1.1, 2]), r.int(-12, 12)]),
    perf: { n: 2147483647, limitMs: 50 },
    benchScales: { s: 1e3 + 1, m: 1e6, l: 1e9 },
  },
  '02': {
    sig: 'long fib(int n)',
    title: 'Fibonacci có memo',
    ref: S.fib,
    brute: (n: number) => {
      let a = 0;
      let b = 1;
      for (let i = 0; i < n; i++) [a, b] = [b, a + b];
      return a;
    },
    cases: [
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [10], expected: 55 },
      { args: [50], expected: 12586269025 },
      { args: [75], expected: 2111485077978050 },
    ],
    gen: (n) => [Math.min(n, 75)],
    perf: { n: 75, limitMs: 50 },
    benchScales: { xs: 10, s: 25, m: 30, l: 35 },
  },
  '03': {
    sig: 'int climbStairs(int n)',
    title: 'Leo cầu thang',
    ref: S.climbStairs,
    brute: (n: number) => {
      let a = 1;
      let b = 1;
      for (let i = 0; i < n; i++) [a, b] = [b, a + b];
      return a;
    },
    cases: [
      { args: [1], expected: 1 },
      { args: [2], expected: 2 },
      { args: [3], expected: 3 },
      { args: [5], expected: 8 },
      { args: [45], expected: 1836311903 },
    ],
    gen: (n) => [Math.max(1, Math.min(n, 45))],
    perf: { n: 45, limitMs: 50 },
    benchScales: { xs: 10, s: 25, m: 30, l: 35 },
  },
  '04': {
    sig: 'int[][] hanoi(int n)',
    title: 'Tháp Hà Nội',
    ref: S.hanoi,
    brute: () => null,
    compare: (moves, _e, [n]) => {
      if (!Array.isArray(moves)) return 'phải trả về danh sách nước đi';
      if (moves.length !== 2 ** n - 1) return `số nước ${moves.length} ≠ 2^${n} − 1 = ${2 ** n - 1}`;
      const pegs: number[][] = [[], Array.from({ length: n }, (_, i) => n - i), [], []];
      for (let k = 0; k < moves.length; k++) {
        const [f, t] = moves[k];
        if (![1, 2, 3].includes(f) || ![1, 2, 3].includes(t) || f === t) return `nước ${k + 1} không hợp lệ: [${f},${t}]`;
        const disk = pegs[f].pop();
        if (disk === undefined) return `nước ${k + 1}: cọc ${f} rỗng`;
        if (pegs[t].length && pegs[t][pegs[t].length - 1] < disk) return `nước ${k + 1}: đặt đĩa ${disk} lên đĩa nhỏ hơn`;
        pegs[t].push(disk);
      }
      return pegs[3].length === n || 'chưa chuyển hết đĩa sang cọc 3';
    },
    cases: [
      { args: [2], expected: [[1, 2], [1, 3], [2, 3]] },
      { args: [0], expected: [] },
      { args: [1], expected: [[1, 3]] },
      { args: [16] },
    ],
    gen: (n) => [Math.min(n, 12)],
    stress: { runs: 13, maxN: 12 },
    perf: false,
  },
  '05': {
    sig: 'List<String> noConsecutiveOnes(int n)',
    title: 'Chuỗi nhị phân không có "11"',
    ref: S.noConsecutiveOnes,
    brute: (n: number) => {
      const out: string[] = [];
      for (let m = 0; m < 1 << n; m++) {
        const s = m.toString(2).padStart(n, '0');
        if (!s.includes('11')) out.push(s);
      }
      return out;
    },
    cases: [
      { args: [3], expected: ['000', '001', '010', '100', '101'] },
      { args: [1], expected: ['0', '1'] },
      { args: [2], expected: ['00', '01', '10'] },
    ],
    gen: (n) => [Math.max(1, Math.min(n, 14))],
    stress: { runs: 14, minN: 1, maxN: 14 },
    perf: false,
  },
  '06': {
    sig: 'String decodeString(String s)',
    title: 'Giải mã chuỗi lồng nhau',
    ref: S.decodeString,
    brute: (s: string) => {
      let prev = '';
      while (prev !== s) {
        prev = s;
        s = s.replace(/(\d+)\[([a-z]*)\]/, (_m, k, inner) => inner.repeat(Number(k)));
      }
      return s;
    },
    cases: [
      { args: ['3[a]2[bc]'], expected: 'aaabcbc' },
      { args: ['3[a2[c]]'], expected: 'accaccacc' },
      { args: ['2[abc]3[cd]ef'], expected: 'abcabccdcdcdef' },
      { args: ['10[x]'], expected: 'xxxxxxxxxx' },
      { args: ['abc'], expected: 'abc' },
      { args: ['100[ab2[c]]'] },
    ],
    gen: (n, r) => {
      const gen = (depth: number): string => {
        let s = '';
        const parts = r.int(1, 3);
        for (let i = 0; i < parts; i++) s += depth > 0 && r.bool(0.5) ? `${r.int(1, 12)}[${gen(depth - 1)}]` : r.string(r.int(1, 2), 'ab');
        return s;
      };
      return [gen(Math.min(3, Math.floor(n / 8)))];
    },
    perf: false,
  },
  '07': {
    sig: 'int calculate(String s)',
    title: 'Máy tính biểu thức',
    ref: S.calculate,
    cases: [
      { args: ['1 + 2 * 3'], expected: 7 },
      { args: ['(1+2)*3'], expected: 9 },
      { args: ['14 - 3/2'], expected: 13 },
      { args: ['2*(5-(3+4))/3'], expected: -1, note: 'chia làm tròn về 0' },
      { args: ['7-7/2*2'], expected: 1 },
      { args: ['42'], expected: 42 },
      { args: [' ( ( 8 ) ) '], expected: 8 },
      { args: ['1-1-1'], expected: -1, note: 'trừ kết hợp trái' },
      { args: ['0-7/2'], expected: -3 },
      { args: ['100/7/2'], expected: 7 },
    ],
    gen: (n, r) => {
      const gen = (depth: number): string => {
        let s = depth > 0 && r.bool(0.3) ? `(${gen(depth - 1)})` : String(r.int(0, 20));
        for (let i = r.int(0, 2); i > 0; i--) {
          const op = r.pick(['+', '-', '*', '/']);
          // vế phải của '/' luôn là số dương → không bao giờ chia cho 0
          const rhs = op !== '/' && depth > 0 && r.bool(0.3) ? `(${gen(depth - 1)})` : String(r.int(1, 20));
          s += ` ${op} ${rhs}`;
        }
        return s;
      };
      return [gen(Math.min(3, Math.floor(n / 8)))];
    },
    // brute: Function eval với phép chia làm tròn về 0
    brute: (s: string) => {
      const evalTrunc = (expr: string): number => {
        // thay mọi a / b bằng Math.trunc(a / b) bằng cách tính từng ngoặc trong cùng
        let e = expr;
        const inner = /\(([^()]*)\)/;
        while (inner.test(e)) e = e.replace(inner, (_m, x) => String(flat(x)));
        return flat(e);
      };
      const flat = (e: string): number => {
        const tokens = e.replace(/\s+/g, '').match(/\d+|[-+*/]|--/g) ?? [];
        // xử lý số âm sinh ra sau khi thay ngoặc: "-3" sau toán tử
        const vals: number[] = [];
        const ops: string[] = [];
        let i = 0;
        const readNum = () => {
          let sign = 1;
          while (tokens[i] === '-' || tokens[i] === '--') sign *= tokens[i++] === '-' ? -1 : 1;
          return sign * Number(tokens[i++]);
        };
        vals.push(readNum());
        while (i < tokens.length) {
          ops.push(tokens[i++]);
          vals.push(readNum());
        }
        // * / trước
        const v2 = [vals[0]];
        const o2: string[] = [];
        ops.forEach((op, k) => {
          if (op === '*') v2.push(v2.pop()! * vals[k + 1]);
          else if (op === '/') v2.push(Math.trunc(v2.pop()! / vals[k + 1]));
          else {
            o2.push(op);
            v2.push(vals[k + 1]);
          }
        });
        return o2.reduce((acc, op, k) => (op === '+' ? acc + v2[k + 1] : acc - v2[k + 1]), v2[0]);
      };
      return evalTrunc(s) + 0;
    },
    perf: false,
  },
  '08': {
    sig: 'int kthGrammar(int n, int k)',
    title: 'Ký tự thứ k của văn phạm',
    ref: S.kthGrammar,
    brute: (n: number, k: number) => {
      let row = '0';
      for (let i = 1; i < n; i++) row = [...row].map((c) => (c === '0' ? '01' : '10')).join('');
      return Number(row[k - 1]);
    },
    cases: [
      { args: [1, 1], expected: 0 },
      { args: [2, 1], expected: 0 },
      { args: [2, 2], expected: 1 },
      { args: [4, 5], expected: 1 },
      { args: [30, 536870912], expected: 1 },
    ],
    gen: (n, r) => {
      const rows = Math.max(1, Math.min(14, n));
      return [rows, r.int(1, 2 ** (rows - 1))];
    },
    perf: false,
  },
  '09': {
    sig: 'int maxCategoryDepth(int[] parent)',
    title: 'Độ sâu cây danh mục',
    ref: S.maxCategoryDepth,
    brute: depthBrute,
    cases: [
      { args: [[-1, 0, 0, 1, 3]], expected: 4 },
      { args: [[-1, -1]], expected: 1 },
      { args: [[-1]], expected: 1 },
      { args: [[1, 2, -1]], expected: 3 },
      { args: [Array.from({ length: 100_000 }, (_, i) => i - 1)], expected: 100_000, note: 'chuỗi 10⁵ tầng — đệ quy sẽ tràn stack' },
    ],
    gen: (n, r) => [forest(Math.max(1, n), r, r.bool(0.3))],
    perf: { n: 1e5, limitMs: 250 },
  },
  '10': {
    sig: 'long[] folderSizes(int[] parent, int[] sizes)',
    title: 'Dung lượng thư mục',
    ref: S.folderSizes,
    brute: (parent: number[], sizes: number[]) => {
      const total = new Array(parent.length).fill(0);
      for (let i = 0; i < parent.length; i++) for (let u = i; u !== -1; u = parent[u]) total[u] += sizes[i];
      return total;
    },
    cases: [
      { args: [[-1, 0, 0, 1], [5, 10, 20, 7]], expected: [42, 17, 20, 7] },
      { args: [[-1], [0]], expected: [0] },
      {
        args: [Array.from({ length: 100_000 }, (_, i) => i - 1), new Array(100_000).fill(1e9)],
        expected: Array.from({ length: 100_000 }, (_, i) => (100_000 - i) * 1e9),
        note: 'chuỗi 10⁵ tầng, tổng 10¹⁴ (Java: long)',
      },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      return [forest(len, r, r.bool(0.3)), r.array(len, 0, 1e9)];
    },
    perf: { n: 1e5, limitMs: 250 },
  },
};
