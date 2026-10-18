import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const opsGen = (ctor: string, ctorArgs: any[], n: number, step: (i: number) => [string, any[]]) => {
  const ops = [ctor];
  const args = [ctorArgs];
  for (let i = 0; i < n; i++) {
    const [op, a] = step(i);
    ops.push(op);
    args.push(a);
  }
  return [ops, args];
};

/** LCS bằng DP đầy đủ → D = N + M − 2·LCS. */
function bruteDist(a: string[], b: string[]): number {
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return a.length + b.length - 2 * dp[a.length][b.length];
}

class BruteDedup {
  cap: number;
  ids: string[] = [];
  constructor(c: number) {
    this.cap = c;
  }
  seen(id: string) {
    const i = this.ids.indexOf(id);
    if (i >= 0) {
      this.ids.splice(i, 1);
      this.ids.push(id);
      return true;
    }
    if (this.ids.length >= this.cap) this.ids.shift();
    this.ids.push(id);
    return false;
  }
}

class BruteP95 {
  s: [number, number][] = [];
  add(t: number, l: number) {
    this.s.push([t, l]);
  }
  p95(t: number) {
    const w = this.s.filter(([ts]) => ts > t - 60000 && ts <= t).map(([, l]) => l).sort((a, b) => a - b);
    if (!w.length) return 0;
    return w[Math.ceil((95 * w.length) / 100) - 1];
  }
}

function bruteSessions(users: string[], times: number[], gap: number): number[] {
  const out: number[] = [];
  let next = 0;
  for (let i = 0; i < users.length; i++) {
    let prev = -1;
    for (let j = i - 1; j >= 0; j--) if (users[j] === users[i]) { prev = j; break; }
    if (prev >= 0 && times[i] - times[prev] <= gap) out.push(out[prev]);
    else out.push(next++);
  }
  return out;
}

/** Algorithm R với LCG bằng BigInt (không dùng Math.imul). */
function bruteSample(lines: number[], k: number, seed: number): number[] {
  const res = lines.slice(0, k);
  let st = BigInt(seed);
  for (let i = k; i < lines.length; i++) {
    st = (st * 1103515245n + 12345n) % 2147483648n;
    const j = Number((st * BigInt(i + 1)) >> 31n);
    if (j < k) res[j] = lines[i];
  }
  return res;
}

/** Hai file giống nhau trừ `edits` chỗ sửa (xóa / chèn / thay). */
function similarFiles(n: number, edits: number, r: Rng): [string[], string[]] {
  const a = Array.from({ length: n }, (_, i) => 'line' + i);
  const b = a.slice();
  for (let e = 0; e < edits; e++) {
    const i = r.int(0, b.length - 1);
    const t = r.int(0, 2);
    if (t === 0) b.splice(i, 1);
    else if (t === 1) b.splice(i, 0, 'new' + e);
    else b[i] = 'chg' + e;
  }
  return [a, b];
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int myersDistance(String[] a, String[] b)',
    title: 'Khoảng cách diff Myers',
    ref: S.myersDistance,
    brute: bruteDist,
    cases: [
      { args: [['A', 'B', 'C', 'A', 'B', 'B', 'A'], ['C', 'B', 'A', 'B', 'A', 'C']], expected: 5, note: 'ví dụ trong bài báo Myers: LCS = 4' },
      { args: [['a', 'b', 'c'], ['a', 'c']], expected: 1 },
      { args: [['x'], ['y']], expected: 2, note: 'thay = xóa + thêm' },
      { args: [[], ['a', 'b', 'c']], expected: 3 },
      { args: [['a', 'b'], ['a', 'b']], expected: 0 },
      { args: [[], []], expected: 0 },
    ],
    gen: (n, r) => {
      if (n > 200) {
        const [a, b] = similarFiles(n, 50, r);
        return [a, b];
      }
      return [Array.from({ length: r.int(0, Math.max(1, n)) }, () => r.pick(['a', 'b', 'c'])), Array.from({ length: r.int(0, Math.max(1, n)) }, () => r.pick(['a', 'b', 'c']))];
    },
    // DP LCS O(N·M) = 10¹⁰ ô ở N = M = 10⁵ (≈ 50 lần sửa)
    perf: { n: 1e5, limitMs: 60 },
  },
  '02': {
    sig: 'class Dedup {\n  Dedup(int capacity)\n  boolean seen(String id)\n}',
    title: 'Dedup giới hạn bộ nhớ',
    ref: S.Dedup,
    brute: BruteDedup,
    cases: [
      { args: [['Dedup', 'seen', 'seen', 'seen', 'seen', 'seen', 'seen'], [[2], ['a'], ['b'], ['a'], ['c'], ['b'], ['a']]], expected: [null, false, false, true, false, false, false], note: 'a được làm mới nên b bị đuổi khi c đến; b quay lại là mới' },
      { args: [['Dedup', 'seen', 'seen', 'seen'], [[1], ['x'], ['x'], ['y']]], expected: [null, false, true, false] },
    ],
    gen: (n, r) => {
      const cap = n > 200 ? 20000 : r.int(1, 4);
      const ids = n > 200 ? 30000 : 7;
      return opsGen('Dedup', [cap], Math.max(1, n), () => ['seen', ['evt' + r.int(0, ids - 1)]]);
    },
    perf: { n: 1e5, limitMs: 800 },
  },
  '03': {
    sig: 'class P95Window {\n  P95Window()\n  void add(long t, int latency)\n  int p95(long t)\n}',
    title: 'p95 trong cửa sổ 60 giây',
    ref: S.P95Window,
    brute: BruteP95,
    cases: [
      { args: [['P95Window', 'add', 'add', 'add', 'p95', 'p95', 'p95'], [[], [0, 100], [1, 200], [2, 300], [3], [60000], [60002]]], expected: [null, null, null, null, 300, 300, 0], note: 'cnt=3 → hạng 3; ở t=60000 mẫu t=0 đã ra → cnt=2 → hạng 2; sau đó rỗng → 0' },
      { args: [['P95Window', ...Array(20).fill('add'), 'p95'], [[], ...Array.from({ length: 20 }, (_, i) => [i + 1, i + 1]), [20]]], expected: [null, ...Array(20).fill(null), 19], note: 'cnt=20 → hạng ⌈19⌉ = 19 (không phải 20)' },
      { args: [['P95Window', 'p95'], [[], [5]]], expected: [null, 0] },
    ],
    gen: (n, r) => {
      const big = n > 200;
      let t = r.int(0, 100);
      return opsGen('P95Window', [], Math.max(1, n), () => {
        t += r.int(0, big ? 60 : 30000);
        return r.bool(0.5) ? ['add', [t, r.int(0, 2000)]] : ['p95', [t]];
      });
    },
    // sort cả cửa sổ (~1000 mẫu) ở mỗi p95
    perf: { n: 1e5, limitMs: 250 },
  },
  '04': {
    sig: 'int[] sessionize(String[] users, long[] times, long gap)',
    title: 'Gom sự kiện thành phiên',
    ref: S.sessionize,
    brute: bruteSessions,
    cases: [
      { args: [['a', 'b', 'a', 'a', 'b'], [0, 5, 10, 100, 200], 50], expected: [0, 1, 0, 2, 3] },
      { args: [['a', 'a'], [0, 50], 50], expected: [0, 0], note: 'chênh đúng bằng gap vẫn cùng phiên' },
      { args: [['a', 'a'], [0, 51], 50], expected: [0, 1] },
      { args: [[], [], 10], expected: [] },
    ],
    gen: (n, r) => {
      const users = Array.from({ length: n }, () => 'u' + r.int(0, n > 200 ? 5000 : 3));
      let t = r.int(0, 100);
      const times = users.map(() => (t += r.int(0, n > 200 ? 60 : 12)));
      return [users, times, n > 200 ? 600 : r.int(0, 15)];
    },
    // bản ngây thơ quay lại tìm sự kiện trước của user: O(n²)
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'int[] sampleLog(int[] lines, int k, int seed)',
    title: 'Lấy mẫu log (reservoir sampling)',
    ref: S.sampleLog,
    brute: bruteSample,
    cases: [
      { args: [[10, 20, 30], 2, 1], expected: [10, 30], note: 'i=2: nextInt(3) = ⌊1103527590·3/2³¹⌋ = 1 < 2 → thay res[1]' },
      { args: [Array.from({ length: 10 }, (_, i) => i), 3, 42], expected: [8, 1, 5] },
      { args: [Array.from({ length: 20 }, (_, i) => 100 + i), 5, 2147483647], expected: [106, 117, 109, 113, 118] },
      { args: [[1, 2], 5, 7], expected: [1, 2], note: 'n < k: trả tất cả' },
      { args: [[5, 6, 7], 0, 3], expected: [] },
    ],
    gen: (n, r) => [r.array(n, 0, 1000), r.int(0, 8), r.int(0, 2147483647)],
    perf: { n: 1e6, limitMs: 100 },
  },
};
