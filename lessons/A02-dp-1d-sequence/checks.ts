import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

// F(1) = F(2) = 1
const fibMod = (k: number): number => {
  let a = 0;
  let b = 1;
  for (let i = 0; i < k; i++) [a, b] = [b, (a + b) % 1_000_000_007];
  return a;
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int coinChange(int[] coins, int amount)',
    title: 'Đổi tiền ít đồng nhất',
    ref: S.coinChange,
    brute: (coins: number[], amount: number): number => {
      // BFS theo số đồng
      const seen = new Set<number>([0]);
      let frontier = [0];
      for (let step = 0; frontier.length; step++) {
        if (frontier.includes(amount)) return step;
        const next: number[] = [];
        for (const v of frontier) for (const c of coins) if (v + c <= amount && !seen.has(v + c)) (seen.add(v + c), next.push(v + c));
        frontier = next;
      }
      return -1;
    },
    cases: [
      { args: [[1, 2, 5], 11], expected: 3 },
      { args: [[2], 3], expected: -1 },
      { args: [[1], 0], expected: 0 },
      { args: [[186, 419, 83, 408], 6249], expected: 20 },
      { args: [[2, 4, 6], 100001], expected: -1, note: 'toàn đồng chẵn, amount lẻ' },
    ],
    gen: (n, r) => (n > 1000 ? [[1, 7, 13, 101, 499, 997, 3001, 9973], n] : [r.distinct(r.int(1, 4), 1, 12), r.int(0, 40)]),
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'int change(int amount, int[] coins)',
    title: 'Đổi tiền: đếm số tổ hợp',
    ref: S.change,
    brute: (amount: number, coins: number[]): number => {
      const f = (i: number, rem: number): number => {
        if (rem === 0) return 1;
        if (i === coins.length) return 0;
        let t = 0;
        for (let k = 0; k * coins[i] <= rem; k++) t += f(i + 1, rem - k * coins[i]);
        return t;
      };
      return f(0, amount) % 1_000_000_007;
    },
    cases: [
      { args: [5, [1, 2, 5]], expected: 4 },
      { args: [3, [2]], expected: 0 },
      { args: [10, [10]], expected: 1 },
      { args: [0, [7]], expected: 1, note: 'amount = 0 ⇒ 1 cách (không dùng đồng nào)' },
    ],
    gen: (n, r) => (n > 1000 ? [n, [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]] : [r.int(0, 25), r.distinct(r.int(1, 4), 1, 10)]),
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'int lengthOfLIS(int[] nums)',
    title: 'Dãy con tăng dài nhất',
    ref: S.lengthOfLIS,
    brute: (a: number[]): number => {
      const f = (i: number, prev: number): number => {
        if (i === a.length) return 0;
        let best = f(i + 1, prev);
        if (a[i] > prev) best = Math.max(best, 1 + f(i + 1, a[i]));
        return best;
      };
      return f(0, -Infinity);
    },
    cases: [
      { args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { args: [[0, 1, 0, 3, 2, 3]], expected: 4 },
      { args: [[7, 7, 7, 7]], expected: 1, note: 'ngặt: bằng nhau không tính' },
      { args: [[5]], expected: 1 },
      { args: [Array.from({ length: 100000 }, (_, i) => i - 50000)], expected: 100000, note: 'đã tăng: bản O(n²) ≈ 5·10⁹ phép' },
    ],
    gen: (n, r) => [r.array(Math.max(1, n > 1000 ? n : Math.min(n, 14)), -10, n > 1000 ? 1e9 : 10)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '04': {
    sig: 'boolean wordBreak(String s, String[] wordDict)',
    title: 'Tách từ',
    ref: S.wordBreak,
    brute: (s: string, dict: string[]): boolean => {
      const f = (i: number): boolean => i === s.length || dict.some((w) => s.startsWith(w, i) && f(i + w.length));
      return f(0);
    },
    cases: [
      { args: ['leetcode', ['leet', 'code']], expected: true },
      { args: ['applepenapple', ['apple', 'pen']], expected: true },
      { args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expected: false },
      { args: ['a', ['b']], expected: false },
      {
        args: ['a'.repeat(99999) + 'b', Array.from({ length: 20 }, (_, i) => 'a'.repeat(i + 1))],
        expected: false,
        note: 'n = 10⁵: quét mọi j ⇒ O(n²)',
      },
    ],
    gen: (n, r) => {
      if (n > 1000) return ['a'.repeat(n - 1) + 'b', Array.from({ length: 20 }, (_, i) => 'a'.repeat(i + 1))];
      const dict = Array.from({ length: r.int(1, 4) }, () => r.string(r.int(1, 3), 'ab'));
      return [r.string(r.int(1, Math.min(n, 14) + 1), 'ab'), dict];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
  '05': {
    sig: 'int numDecodings(String s)',
    title: 'Giải mã',
    ref: S.numDecodings,
    brute: (s: string): number => {
      const f = (i: number): number => {
        if (i === s.length) return 1;
        if (s[i] === '0') return 0;
        let t = f(i + 1);
        if (i + 1 < s.length && Number(s.slice(i, i + 2)) <= 26) t += f(i + 2);
        return t;
      };
      return f(0) % 1_000_000_007;
    },
    cases: [
      { args: ['12'], expected: 2 },
      { args: ['226'], expected: 3 },
      { args: ['06'], expected: 0 },
      { args: ['0'], expected: 0 },
      { args: ['10'], expected: 1 },
      { args: ['100'], expected: 0 },
      { args: ['27'], expected: 1 },
      { args: ['1'.repeat(100000)], expected: fibMod(100001), note: 'toàn chữ số 1 ⇒ Fibonacci(n+1) mod 10⁹+7' },
    ],
    gen: (n, r) => [n > 1000 ? '1'.repeat(n) : r.string(r.int(1, Math.min(n, 16) + 1), '0112367')],
    perf: { n: 1e5, limitMs: 100 },
  },
  '06': {
    sig: 'int maxSubArray(int[] nums)',
    title: 'Tổng mảng con lớn nhất (Kadane)',
    ref: S.maxSubArray,
    brute: (a: number[]): number => {
      let best = -Infinity;
      for (let i = 0; i < a.length; i++) {
        let s = 0;
        for (let j = i; j < a.length; j++) best = Math.max(best, (s += a[j]));
      }
      return best;
    },
    cases: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[-3, -1, -2]], expected: -1, note: 'toàn âm: phải chọn ≥ 1 phần tử' },
      { args: [new Array(100000).fill(10000)], expected: 1_000_000_000 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), -10000, 10000)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '07': {
    sig: 'int maxProduct(int[] nums)',
    title: 'Tích mảng con lớn nhất',
    ref: S.maxProduct,
    brute: (a: number[]): number => {
      let best = -Infinity;
      for (let i = 0; i < a.length; i++) {
        let p = 1;
        for (let j = i; j < a.length; j++) best = Math.max(best, (p *= a[j]));
      }
      return best;
    },
    cases: [
      { args: [[2, 3, -2, 4]], expected: 6 },
      { args: [[-2, 0, -1]], expected: 0 },
      { args: [[-2, 3, -4]], expected: 24 },
      { args: [[-3]], expected: -3 },
      { args: [[0, 2]], expected: 2 },
    ],
    // ràng buộc: mọi tích mảng con vừa int ⇒ |x| ≤ 2 và n ≤ 30 (stress), hoặc ≤ 25 phần tử |x| = 2 (perf)
    gen: (n, r) => {
      if (n <= 30) return [r.array(Math.max(1, n), -2, 2)];
      const a = r.array(n, -1, 1);
      for (let k = 0; k < 20; k++) a[r.int(0, n - 1)] = r.pick([-2, 2]);
      return [a];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'int maxProfitCooldown(int[] prices)',
    title: 'Cổ phiếu có cooldown',
    ref: S.maxProfitCooldown,
    brute: (p: number[]): number => {
      const f = (i: number, holding: boolean): number => {
        if (i >= p.length) return 0;
        let best = f(i + 1, holding); // nghỉ
        if (holding) best = Math.max(best, p[i] + f(i + 2, false)); // bán rồi cooldown 1 ngày
        else best = Math.max(best, -p[i] + f(i + 1, true));
        return best;
      };
      return f(0, false);
    },
    cases: [
      { args: [[1, 2, 3, 0, 2]], expected: 3 },
      { args: [[1]], expected: 0 },
      { args: [[5, 4, 3, 2, 1]], expected: 0 },
      { args: [[1, 4, 2]], expected: 3 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n > 1000 ? n : Math.min(n, 12)), 1, 10000)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '09': {
    sig: 'int maxProfitFee(int[] prices, int fee)',
    title: 'Cổ phiếu có phí giao dịch',
    ref: S.maxProfitFee,
    brute: (p: number[], fee: number): number => {
      const f = (i: number, holding: boolean): number => {
        if (i >= p.length) return 0;
        let best = f(i + 1, holding);
        if (holding) best = Math.max(best, p[i] - fee + f(i + 1, false));
        else best = Math.max(best, -p[i] + f(i + 1, true));
        return best;
      };
      return f(0, false);
    },
    cases: [
      { args: [[1, 3, 2, 8, 4, 9], 2], expected: 8 },
      { args: [[1, 3, 7, 5, 10, 3], 3], expected: 6 },
      { args: [[5], 1], expected: 0 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n > 1000 ? n : Math.min(n, 12)), 1, 10000), r.int(0, n > 1000 ? 10000 : 6)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '10': {
    sig: 'int maxEnvelopes(int[][] envelopes)',
    title: 'Xếp thùng lồng nhau',
    ref: S.maxEnvelopes,
    brute: (e: number[][]): number => {
      const memo = new Map<number, number>();
      const f = (i: number): number => {
        if (memo.has(i)) return memo.get(i)!;
        let best = 1;
        for (let j = 0; j < e.length; j++) if (e[j][0] > e[i][0] && e[j][1] > e[i][1]) best = Math.max(best, 1 + f(j));
        memo.set(i, best);
        return best;
      };
      let ans = 0;
      for (let i = 0; i < e.length; i++) ans = Math.max(ans, f(i));
      return ans;
    },
    cases: [
      { args: [[[5, 4], [6, 4], [6, 7], [2, 3]]], expected: 3 },
      { args: [[[1, 1], [1, 1], [1, 1]]], expected: 1 },
      { args: [[[4, 5], [4, 6], [6, 7], [2, 3], [1, 1]]], expected: 4 },
      { args: [[[1, 1]]], expected: 1 },
      { args: [Array.from({ length: 100000 }, (_, i) => [i + 1, 100000 - i])], expected: 1, note: 'w tăng, h giảm' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n > 1000 ? n : Math.min(n, 12));
      const R = n > 1000 ? 1e9 : 6;
      return [Array.from({ length: len }, () => [r.int(1, R), r.int(1, R)])];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 300 },
  },
};
