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

// ─── hash cài lại bằng BigInt (độc lập với Math.imul của ref) ───
const M32 = 0xffffffffn;
function bFnv(s: string): bigint {
  let h = 2166136261n;
  for (let i = 0; i < s.length; i++) h = ((h ^ BigInt(s.charCodeAt(i))) * 16777619n) & M32;
  return h;
}
function bG(s: string): bigint {
  let h = bFnv(s);
  h ^= h >> 16n;
  h = (h * 0x85ebca6bn) & M32;
  h ^= h >> 13n;
  h = (h * 0xc2b2ae35n) & M32;
  h ^= h >> 16n;
  return h;
}
const bPos = (item: string, k: number, m: number): number[] => {
  const h1 = bG(item);
  const h2 = bG(item + '#');
  return Array.from({ length: k }, (_, i) => Number((h1 + BigInt(i) * h2) % BigInt(m)));
};

class BruteBloom {
  m: number;
  k: number;
  on = new Set<number>();
  constructor(m: number, k: number) {
    this.m = m;
    this.k = k;
  }
  add(x: string) {
    for (const p of bPos(x, this.k, this.m)) this.on.add(p);
  }
  mightContain(x: string) {
    return bPos(x, this.k, this.m).every((p) => this.on.has(p));
  }
}
const bruteMeasure = (n: number, m: number, k: number, probes: number) => {
  const bf = new BruteBloom(m, k);
  for (let i = 0; i < n; i++) bf.add('key' + i);
  let fp = 0;
  for (let i = 0; i < probes; i++) if (bf.mightContain('probe' + i)) fp++;
  return [Math.pow(1 - Math.exp((-k * n) / m), k), probes === 0 ? 0 : fp / probes];
};
class BruteCMS {
  w: number;
  rows: number[][];
  constructor(w: number, d: number) {
    this.w = w;
    this.rows = Array.from({ length: d }, () => new Array<number>(w).fill(0));
  }
  add(x: string, c: number) {
    bPos(x, this.rows.length, this.w).forEach((p, r) => (this.rows[r][p] += c));
  }
  estimate(x: string) {
    return Math.min(...bPos(x, this.rows.length, this.w).map((p, r) => this.rows[r][p]));
  }
}
class ExactDistinct {
  s = new Set<string>();
  constructor(_b: number) {}
  add(x: string) {
    this.s.add(x);
  }
  estimate() {
    return this.s.size;
  }
}
const bruteParams = (n: number, p: number) => {
  const m = Math.ceil((n * Math.log2(1 / p)) / Math.LN2);
  return [m, Math.max(1, Math.round((m / n) * Math.LN2))];
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class BloomFilter {\n  BloomFilter(int m, int k)\n  void add(String item)\n  boolean mightContain(String item)\n}',
    title: 'Bloom filter',
    ref: S.BloomFilter,
    brute: BruteBloom,
    cases: [
      { args: [['BloomFilter', 'mightContain', 'add', 'mightContain'], [[1000000, 7], ['x'], ['x'], ['x']]], expected: [null, false, null, true], note: 'bảng trống → luôn false; đã add → luôn true (không sai âm)' },
      { args: [['BloomFilter', 'add', 'mightContain', 'mightContain'], [[1, 3], ['a'], ['hoàn toàn khác'.replace(/[^\x00-\x7f]/g, 'o')], ['']]], expected: [null, null, true, true], note: 'm = 1: mọi item cùng một ô → sai dương chắc chắn' },
      { args: [['BloomFilter', 'add', 'add', 'mightContain', 'mightContain', 'mightContain'], [[64, 3], ['alice'], ['bob'], ['alice'], ['bob'], ['alice']]], expected: [null, null, null, true, true, true] },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const [m, k] = big ? [1_000_000, 7] : [r.int(1, 64), r.int(1, 4)];
      const pool = Array.from({ length: big ? 50000 : 14 }, (_, i) => 'item' + i);
      return opsGen('BloomFilter', [m, k], Math.max(1, n), () => (r.bool(0.5) ? ['add', [r.pick(pool)]] : ['mightContain', [r.pick(pool)]]));
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '02': {
    sig: 'double[] measureBloom(int n, int m, int k, int probes)',
    title: 'Sai dương: lý thuyết vs đo thật',
    ref: S.measureBloom,
    brute: bruteMeasure,
    compare: 'float',
    cases: [
      { args: [1, 1, 1, 5], expected: [1 - Math.exp(-1), 1], note: 'm = 1: lý thuyết 1 − e⁻¹, thực tế mọi probe đều trúng' },
      { args: [0, 100, 3, 10], expected: [0, 0], note: 'chưa chèn gì' },
      { args: [10, 100, 2, 0], expected: [Math.pow(1 - Math.exp(-0.2), 2), 0], note: 'không probe → tỉ lệ thực = 0' },
    ],
    gen: (n, r) => (n > 200 ? [n, 10 * n, 7, n] : [r.int(0, 12), r.int(1, 60), r.int(1, 4), r.int(0, 25)]),
    perf: { n: 1e5, limitMs: 400 },
  },
  '03': {
    sig: 'class CountMinSketch {\n  CountMinSketch(int width, int depth)\n  void add(String item, int count)\n  int estimate(String item)\n}',
    title: 'Count-Min Sketch',
    ref: S.CountMinSketch,
    brute: BruteCMS,
    cases: [
      { args: [['CountMinSketch', 'add', 'add', 'estimate', 'estimate'], [[1, 1], ['a', 3], ['b', 4], ['a'], ['zzz']]], expected: [null, null, null, 7, 7], note: 'width = 1: mọi item cùng một ô' },
      { args: [['CountMinSketch', 'estimate', 'add', 'estimate'], [[1000, 4], ['q'], ['q', 5], ['q']]], expected: [null, 0, null, 5], note: 'bảng thưa: ước lượng chính xác' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const pool = Array.from({ length: big ? 20000 : 10 }, (_, i) => 'k' + i);
      return opsGen('CountMinSketch', big ? [4096, 5] : [r.int(1, 8), r.int(1, 3)], Math.max(1, n), () => (r.bool(0.6) ? ['add', [r.pick(pool), r.int(1, 100)]] : ['estimate', [r.pick(pool)]]));
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '04': {
    sig: 'class HyperLogLog {\n  HyperLogLog(int b)\n  void add(String item)\n  long estimate()\n}',
    title: 'HyperLogLog',
    ref: S.HyperLogLog,
    brute: ExactDistinct,
    // so với số phần tử khác nhau THẬT; sai số cho phép = 4 · 1,04/√m (4σ), tối thiểu 1
    compare: (got: any[], expected: any[], args: any[]) => {
      const [ops, opArgs] = args as [string[], any[][]];
      const m = 2 ** opArgs[0][0];
      for (let i = 1; i < ops.length; i++) {
        if (ops[i] !== 'estimate') continue;
        const truth = expected[i];
        const tol = truth === 0 ? 0 : Math.max(1, (4 * 1.04 * truth) / Math.sqrt(m));
        if (Math.abs(got[i] - truth) > tol) return `ước lượng ${got[i]} lệch quá ${tol.toFixed(1)} so với số phần tử khác nhau thật ${truth} (m = ${m})`;
      }
      return true;
    },
    cases: [
      { args: [['HyperLogLog', 'estimate', 'add', 'add', 'add', 'estimate'], [[10], [], ['a'], ['b'], ['a'], []]], expected: [null, 0, null, null, null, 2], note: 'n nhỏ: linear counting cho kết quả gần chính xác (cho phép lệch ±1)' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const pool = big ? 60000 : 20;
      let tick = 0;
      return opsGen('HyperLogLog', [big ? 12 : r.int(4, 6)], Math.max(1, n), () => (r.bool(big ? 0.99 : 0.7) ? ['add', ['user' + r.int(0, pool - 1)]] : (tick++, ['estimate', []])));
    },
    perf: { n: 1e5, limitMs: 150 },
  },
  '05': {
    sig: 'long[] bloomParams(int n, double p)',
    title: 'Chọn tham số Bloom filter',
    ref: S.bloomParams,
    brute: bruteParams,
    cases: [
      { args: [1000, 0.01], expected: [9586, 7], note: '≈ 9,6 bit/item, 7 hàm hash' },
      { args: [1000000, 0.001], expected: [14377588, 10], note: '≈ 14,4 bit/item' },
      { args: [1, 0.5], expected: [2, 1] },
      { args: [1000000000, 0.000000001], expected: [43132762699, 30], note: 'm vượt 2³¹ → Java cần long' },
    ],
    gen: (_n, r) => [r.int(1, 1_000_000_000), r.int(1, 500) / 1000],
    perf: false,
  },
};
