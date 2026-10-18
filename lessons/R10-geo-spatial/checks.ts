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

// ─── brute ───
/** Geohash bằng số nguyên: lon/lat → chỉ số ô ở độ phân giải 2^bits rồi xen bit (khác cách chia đôi lặp của ref). */
function bruteGeohash(lat: number, lon: number, precision: number): string {
  const total = 5 * precision;
  const lonBits = Math.ceil(total / 2);
  const latBits = Math.floor(total / 2);
  const idx = (v: number, lo: number, hi: number, bits: number) => {
    const n = 2 ** bits;
    return Math.min(n - 1, Math.floor(((v - lo) / (hi - lo)) * n));
  };
  const lonI = idx(lon, -180, 180, lonBits);
  const latI = idx(lat, -90, 90, latBits);
  const bits: number[] = [];
  for (let i = 0; i < total; i++) {
    if (i % 2 === 0) bits.push(Math.floor(lonI / 2 ** (lonBits - 1 - i / 2)) % 2);
    else bits.push(Math.floor(latI / 2 ** (latBits - 1 - (i - 1) / 2)) % 2);
  }
  let out = '';
  for (let c = 0; c < precision; c++) out += '0123456789bcdefghjkmnpqrstuvwxyz'[bits.slice(5 * c, 5 * c + 5).reduce((a, b) => a * 2 + b, 0)];
  return out;
}
function bruteHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(p(lat2 - lat1) / 2) ** 2 + Math.cos(p(lat1)) * Math.cos(p(lat2)) * Math.sin(p(lon2 - lon1) / 2) ** 2;
  return 6371.0 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
class BruteGrid {
  pts = new Map<number, [number, number]>();
  constructor(_cell: number) {}
  add(id: number, x: number, y: number) {
    this.pts.set(id, [x, y]);
  }
  move(id: number, x: number, y: number) {
    this.pts.set(id, [x, y]);
  }
  withinRadius(x: number, y: number, r: number) {
    return [...this.pts].filter(([, [px, py]]) => (px - x) ** 2 + (py - y) ** 2 <= r * r).map(([id]) => id).sort((a, b) => a - b);
  }
}
const bruteK = (pts: number[][], x: number, y: number, k: number) =>
  pts
    .map((p, i) => ({ d: (p[0] - x) ** 2 + (p[1] - y) ** 2, i }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .slice(0, k)
    .map((e) => e.i);
class BruteDrivers {
  m = new Map<number, [number, number]>();
  update(id: number, x: number, y: number) {
    this.m.set(id, [x, y]);
  }
  remove(id: number) {
    this.m.delete(id);
  }
  nearest(x: number, y: number, k: number) {
    return [...this.m]
      .map(([id, [px, py]]) => ({ d: (px - x) ** 2 + (py - y) ** 2, id }))
      .sort((a, b) => a.d - b.d || a.id - b.id)
      .slice(0, k)
      .map((e) => e.id);
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'String geohash(double lat, double lon, int precision)',
    title: 'Geohash',
    ref: S.geohash,
    brute: bruteGeohash,
    cases: [
      { args: [57.64911, 10.40744, 11], expected: 'u4pruydqqvj', note: 'ví dụ chuẩn (Wikipedia)' },
      { args: [42.6, -5.6, 5], expected: 'ezs42' },
      { args: [0, 0, 5], expected: 's0000', note: '(0,0): kinh độ ≥ 0 và vĩ độ ≥ 0 → nửa trên cả hai' },
      { args: [90, 180, 3], expected: 'zzz', note: 'biên trên thuộc nửa trên → toàn bit 1' },
      { args: [-90, -180, 3], expected: '000' },
      { args: [21.0285, 105.8542, 7], expected: 'w7er8u0', note: 'Hà Nội (đối chiếu bằng bản Python độc lập)' },
    ],
    gen: (_n, r) => [r.int(-900000, 900000) / 10000, r.int(-1800000, 1800000) / 10000, r.int(1, 12)],
    perf: false,
  },
  '02': {
    sig: 'double haversineKm(double lat1, double lon1, double lat2, double lon2)',
    title: 'Khoảng cách haversine',
    ref: S.haversineKm,
    brute: bruteHaversine,
    compare: 'float',
    cases: [
      { args: [10, 20, 10, 20], expected: 0 },
      { args: [0, 0, 0, 90], expected: (Math.PI / 2) * 6371, note: 'một phần tư xích đạo = πR/2' },
      { args: [0, 0, 0, 180], expected: Math.PI * 6371, note: 'hai điểm đối xứng: nửa chu vi' },
      { args: [90, 0, -90, 123], expected: Math.PI * 6371, note: 'cực Bắc ↔ cực Nam' },
      { args: [48.8566, 2.3522, 51.5074, -0.1278], expected: 343.55606034104164, note: 'Paris – London ≈ 343,6 km' },
      { args: [21.0285, 105.8542, 10.8231, 106.6297], expected: 1137.804375792417, note: 'Hà Nội – TP.HCM (đường chim bay)' },
    ],
    gen: (_n, r) => [r.int(-900000, 900000) / 10000, r.int(-1800000, 1800000) / 10000, r.int(-900000, 900000) / 10000, r.int(-1800000, 1800000) / 10000],
    perf: false,
  },
  '03': {
    sig: 'class GridIndex {\n  GridIndex(double cell)\n  void add(int id, double x, double y)\n  void move(int id, double x, double y)\n  List<Integer> withinRadius(double x, double y, double r)\n}',
    title: 'Chỉ mục lưới',
    ref: S.GridIndex,
    brute: BruteGrid,
    cases: [
      {
        args: [
          ['GridIndex', 'add', 'add', 'add', 'withinRadius', 'withinRadius', 'move', 'withinRadius'],
          [[10], [1, 0, 0], [2, 5, 5], [3, 100, 100], [0, 0, 7], [0, 0, 8], [1, 100, 101], [100, 100, 2]],
        ],
        expected: [null, null, null, null, [1], [1, 2], null, [1, 3]],
        note: '(5,5) cách gốc √50 ≈ 7,07: r = 7 loại, r = 8 nhận',
      },
      { args: [['GridIndex', 'add', 'add', 'withinRadius'], [[1], [4, 3, 4], [7, -3, -4], [0, 0, 5]]], expected: [null, null, null, [4, 7]], note: 'biên (khoảng cách đúng bằng r) được tính; tọa độ âm' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const span = big ? 100000 : 40;
      const cell = big ? 100 : r.pick([1, 3, 7]);
      let id = 0;
      const ids: number[] = [];
      return opsGen('GridIndex', [cell], Math.max(1, n), (i) => {
        const x = r.int(big ? 0 : -span, span);
        const y = r.int(big ? 0 : -span, span);
        if (ids.length === 0 || (big ? i < n * 0.4 : r.bool(0.35))) {
          ids.push(id);
          return ['add', [id++, x, y]];
        }
        if (r.bool(big ? 0.4 : 0.3)) return ['move', [r.pick(ids), x, y]];
        return ['withinRadius', [x, y, big ? r.int(50, 300) : r.int(0, 30)]];
      });
    },
    // quét tuyến tính mọi điểm (~4·10⁴) ở mỗi truy vấn (~3·10⁴ lần)
    perf: { n: 1e5, limitMs: 600 },
  },
  '04': {
    sig: 'int[] kNearest(int[][] pts, int x, int y, int k)',
    title: 'k điểm gần nhất',
    ref: S.kNearest,
    brute: bruteK,
    cases: [
      { args: [[[0, 0], [3, 4], [1, 1], [3, 4]], 0, 0, 3], expected: [0, 2, 1], note: 'hòa khoảng cách 25: chỉ số nhỏ trước' },
      { args: [[[0, 0], [3, 4], [1, 1], [3, 4]], 0, 0, 10], expected: [0, 2, 1, 3], note: 'k > n: trả tất cả' },
      { args: [[], 5, 5, 3], expected: [] },
      { args: [[[30000000, 30000000], [-30000000, -30000000]], -30000000, -30000000, 1], expected: [1], note: 'tọa độ lớn: bình phương ≈ 7·10¹⁵ vẫn chính xác (Java cần long)' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const R = big ? 30000000 : 6;
      return [Array.from({ length: n }, () => [r.int(-R, R), r.int(-R, R)]), r.int(-R, R), r.int(-R, R), big ? 10 : r.int(0, 6)];
    },
    // sort cả 5·10⁵ điểm theo khoảng cách
    perf: { n: 5e5, limitMs: 100 },
  },
  '05': {
    sig: 'class DriverIndex {\n  DriverIndex()\n  void update(int driverId, int x, int y)\n  void remove(int driverId)\n  int[] nearest(int x, int y, int k)\n}',
    title: 'Chỉ mục tài xế gần nhất',
    ref: S.DriverIndex,
    brute: BruteDrivers,
    cases: [
      {
        args: [
          ['DriverIndex', 'update', 'update', 'update', 'nearest', 'remove', 'nearest', 'update', 'nearest'],
          [[], [1, 0, 0], [2, 10, 0], [3, 5, 0], [0, 0, 2], [1], [0, 0, 2], [4, 5, 0], [0, 0, 2]],
        ],
        expected: [null, null, null, null, [1, 3], null, [3, 2], null, [3, 4]],
        note: 'tài xế 3 và 4 cùng khoảng cách → id nhỏ trước',
      },
      { args: [['DriverIndex', 'nearest', 'update', 'update', 'nearest'], [[], [5, 5, 3], [9, 100000, 100000], [8, 0, 0], [50000, 50000, 5]]], expected: [null, [], null, null, [8, 9]], note: 'k > số tài xế; hai góc xa nhau' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const span = big ? 100000 : 3000;
      const drivers = big ? 30000 : 8;
      return opsGen('DriverIndex', [], Math.max(1, n), (i) => {
        const x = r.int(0, span);
        const y = r.int(0, span);
        const id = r.int(0, drivers - 1);
        const t = r.float();
        if (t < (big ? 0.5 : 0.4)) return ['update', [id, x, y]];
        if (t < (big ? 0.55 : 0.5)) return ['remove', [id]];
        return ['nearest', [x, y, big ? 3 : r.int(1, 4)]];
      });
    },
    // quét tuyến tính mọi tài xế (~3·10⁴) ở mỗi truy vấn (~4,5·10⁴ lần)
    perf: { n: 1e5, limitMs: 1000 },
  },
};
