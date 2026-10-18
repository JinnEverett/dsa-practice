import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

// ─── helper dùng chung ───
const edgeKey = (a: string, b: string) => a + '\u0000' + b;
const edgeSet = (deps: string[][]) => new Set(deps.map(([a, b]) => edgeKey(a, b)));

/** Floyd–Warshall (chỉ dùng ở n nhỏ): reach[i][j] = i phụ thuộc (gián tiếp) j. */
function reach(modules: string[], deps: string[][]): boolean[][] {
  const n = modules.length;
  const idx = new Map(modules.map((m, i) => [m, i]));
  const r = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  for (const [a, b] of deps) r[idx.get(a)!][idx.get(b)!] = true;
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) if (r[i][k]) for (let j = 0; j < n; j++) if (r[k][j]) r[i][j] = true;
  return r;
}
const cyclicNodes = (modules: string[], deps: string[][]) => {
  const r = reach(modules, deps);
  return modules.filter((_, i) => r[i][i]);
};

/** DAG ngẫu nhiên: thứ hạng ẩn `rank`; cạnh luôn trỏ từ hạng cao xuống hạng thấp. cycleP = xác suất thêm 1 cạnh ngược. */
function randomGraph(n: number, edges: number, cycleP: number, r: Rng, chain = false): [string[], string[][]] {
  const names = Array.from({ length: n }, (_, i) => 'm' + i);
  r.shuffle(names); // thứ tự khai báo
  const rank = r.shuffle(Array.from({ length: n }, (_, i) => i)); // rank[i] của names[i]
  const byRank = new Array<number>(n);
  rank.forEach((rk, i) => (byRank[rk] = i));
  const deps: string[][] = [];
  if (n >= 2) {
    if (chain) for (let x = 1; x < n; x++) deps.push([names[byRank[x]], names[byRank[x - 1]]]); // đường dài n tầng
    for (let k = 0; k < edges; k++) {
      const x = r.int(1, n - 1);
      const y = r.int(0, x - 1);
      deps.push([names[byRank[x]], names[byRank[y]]]);
    }
    if (r.bool(cycleP)) {
      const x = r.int(0, n - 2);
      const y = r.int(x + 1, n - 1);
      deps.push([names[byRank[x]], names[byRank[y]]]); // thấp phụ thuộc cao → có thể tạo vòng
    }
  } else if (n === 1 && r.bool(cycleP)) deps.push([names[0], names[0]]);
  return [names, deps];
}

// ─── brute ───
const bruteResolve = (modules: string[], deps: string[][]) => {
  const done = new Set<string>();
  const out: string[] = [];
  while (out.length < modules.length) {
    const next = modules.find((m) => !done.has(m) && deps.every(([a, b]) => a !== m || done.has(b)));
    if (next === undefined) return [];
    done.add(next);
    out.push(next);
  }
  return out;
};
const bruteLevels = (modules: string[], deps: string[][]) => {
  const lvl = new Map(modules.map((m) => [m, 0]));
  for (let it = 0; it <= modules.length; it++) {
    let changed = false;
    for (const [a, b] of deps) if (lvl.get(a)! < lvl.get(b)! + 1) { lvl.set(a, lvl.get(b)! + 1); changed = true; }
    if (!changed) break;
    if (it === modules.length) return [];
  }
  const max = Math.max(-1, ...lvl.values());
  return Array.from({ length: max + 1 }, (_, k) => modules.filter((m) => lvl.get(m) === k).sort());
};

/** Kiểm tra `got` là chu trình hợp lệ trong deps: x_i phụ thuộc x_{i+1}, x_{k−1} phụ thuộc x_0, các đỉnh khác nhau. */
function validCycle(cyc: string[], deps: string[][], modules: string[]): true | string {
  if (cyc.length === 0) return 'chu trình rỗng';
  const es = edgeSet(deps);
  const mods = new Set(modules);
  if (new Set(cyc).size !== cyc.length) return 'chu trình lặp đỉnh';
  for (let i = 0; i < cyc.length; i++) {
    if (!mods.has(cyc[i])) return `"${cyc[i]}" không phải module`;
    const next = cyc[(i + 1) % cyc.length];
    if (!es.has(edgeKey(cyc[i], next))) return `không có cạnh ${cyc[i]} → ${next} (a phụ thuộc b)`;
  }
  return true;
}
function validOrder(order: string[], modules: string[], deps: string[][]): true | string {
  if (order.length !== modules.length || new Set(order).size !== modules.length) return 'không phải hoán vị của providers';
  const pos = new Map(order.map((m, i) => [m, i]));
  for (const m of modules) if (!pos.has(m)) return `thiếu ${m}`;
  for (const [a, b] of deps) if (pos.get(b)! > pos.get(a)!) return `${b} phải được khởi tạo trước ${a}`;
  return true;
}

// ─── semver brute (BigInt, độc lập với ref) ───
const enc = (s: string) => {
  const [x, y, z] = s.split('.').map(BigInt);
  const B = 4_000_000n;
  return (x * B + y) * B + z;
};
function bruteSemver(versions: string[], range: string): string {
  const B = 4_000_000n;
  const mk = (x: bigint, y: bigint, z: bigint) => (x * B + y) * B + z;
  let lo: bigint;
  let hi: bigint | null = null;
  const body = range.replace(/^(\^|~|>=)/, '');
  const [X, Y, Z] = body.split('.').map(BigInt);
  lo = mk(X, Y, Z);
  if (range[0] === '^') hi = X > 0n ? mk(X + 1n, 0n, 0n) : Y > 0n ? mk(0n, Y + 1n, 0n) : mk(0n, 0n, Z + 1n);
  else if (range[0] === '~') hi = mk(X, Y + 1n, 0n);
  else if (range.startsWith('>=')) hi = null;
  else hi = lo + 1n;
  const ok = versions.filter((v) => enc(v) >= lo && (hi === null || enc(v) < hi));
  ok.sort((a, b) => (enc(a) < enc(b) ? -1 : enc(a) > enc(b) ? 1 : 0));
  return ok.length ? ok[ok.length - 1] : '';
}

const APP: [string[], string[][]] = [
  ['app', 'db', 'cache', 'log'],
  [['app', 'db'], ['app', 'cache'], ['db', 'log'], ['cache', 'log']],
];

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'List<String> resolve(String[] modules, String[][] deps)',
    title: 'Thứ tự khởi tạo module',
    ref: S.resolve,
    brute: bruteResolve,
    cases: [
      { args: [...APP], expected: ['log', 'db', 'cache', 'app'] },
      { args: [['b', 'a'], []], expected: ['b', 'a'], note: 'tie-break theo thứ tự khai báo, không theo bảng chữ cái' },
      { args: [['a', 'b'], [['a', 'b'], ['b', 'a']]], expected: [], note: 'chu trình' },
      { args: [['x'], [['x', 'x']]], expected: [], note: 'tự phụ thuộc' },
      { args: [['c', 'b', 'a'], [['c', 'a'], ['c', 'a'], ['b', 'a']]], expected: ['a', 'c', 'b'], note: 'cạnh lặp; a sẵn sàng trước, sau đó c (chỉ số 0) trước b (1)' },
      { args: [[], []], expected: [] },
    ],
    gen: (n, r) => {
      const m = Math.max(1, n);
      const big = n > 200;
      return randomGraph(m, big ? 2 * m : r.int(0, 2 * m), big ? 0 : 0.2, r);
    },
    // hoàn tất bằng cách quét lại toàn bộ danh sách ở mỗi bước là O(n²)
    perf: { n: 1e5, limitMs: 800 },
  },
  '02': {
    sig: 'List<String> findCycle(String[] modules, String[][] deps)',
    title: 'Tìm một chu trình phụ thuộc',
    ref: S.findCycle,
    brute: (modules: string[], deps: string[][]) => {
      const c = cyclicNodes(modules, deps);
      return c.length ? [c[0]] : []; // chỉ dùng làm dấu "có chu trình"; compare kiểm tra tính hợp lệ của bài làm
    },
    compare: (got: string[], expected: string[], args: any[]) => {
      if (expected.length === 0) return got.length === 0 ? true : 'đồ thị không có chu trình nhưng bài làm trả chu trình';
      if (got.length === 0) return 'có chu trình nhưng bài làm trả rỗng';
      return validCycle(got, args[1], args[0]);
    },
    cases: [
      { args: [['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['c', 'a']]], expected: ['a', 'b', 'c'] },
      { args: [['a'], [['a', 'a']]], expected: ['a'], note: 'tự phụ thuộc' },
      { args: [...APP], expected: [] },
      { args: [['t', 'a', 'b'], [['t', 'a'], ['a', 'b'], ['b', 'a']]], expected: ['a', 'b'], note: 'đường dẫn tới chu trình (t) không thuộc chu trình' },
    ],
    gen: (n, r) => {
      const m = Math.max(1, n);
      const big = n > 200;
      if (big) {
        // chuỗi dài m_0 → m_1 → … rồi cạnh ngược về giữa: chu trình dài ~n/2, đệ quy sâu n
        const names = Array.from({ length: m }, (_, i) => 'm' + i);
        const deps: string[][] = [];
        for (let i = 0; i + 1 < m; i++) deps.push([names[i], names[i + 1]]);
        deps.push([names[m - 1], names[Math.floor(m / 2)]]);
        return [names, deps];
      }
      return randomGraph(m, r.int(0, 2 * m), 0.5, r);
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '03': {
    sig: 'List<List<String>> buildLevels(String[] modules, String[][] deps)',
    title: 'Chia tầng khởi tạo song song',
    ref: S.buildLevels,
    brute: bruteLevels,
    cases: [
      { args: [...APP], expected: [['log'], ['cache', 'db'], ['app']], note: 'trong tầng: tên tăng dần' },
      { args: [['b', 'a', 'c'], []], expected: [['a', 'b', 'c']] },
      { args: [['a', 'b'], [['a', 'b'], ['b', 'a']]], expected: [] },
      { args: [['a', 'b', 'c'], [['c', 'b'], ['b', 'a'], ['c', 'a']]], expected: [['a'], ['b'], ['c']], note: 'tầng = 1 + max tầng phụ thuộc' },
      { args: [[], []], expected: [] },
    ],
    gen: (n, r) => {
      const m = Math.max(1, n);
      const big = n > 200;
      return randomGraph(m, big ? m : r.int(0, 2 * m), big ? 0 : 0.2, r, big);
    },
    // chuỗi n tầng: bản lặp "relax" đến khi ổn định là O(n · e)
    perf: { n: 1e5, limitMs: 900 },
  },
  '04': {
    sig: 'List<String> initProviders(String[] providers, String[][] deps)',
    title: 'Khởi tạo provider kiểu NestJS (báo vòng kèm đường đi)',
    ref: S.initProviders,
    brute: (providers: string[], deps: string[][]) => (cyclicNodes(providers, deps).length ? ['CYCLE'] : ['OK']),
    compare: (got: string[], expected: string[], args: any[]) => {
      const [providers, deps] = args as [string[], string[][]];
      const cyc = expected[0] === 'CYCLE' || (expected[0] ?? '').startsWith('Circular dependency: ');
      if (!cyc) return validOrder(got, providers, deps);
      if (got.length !== 1 || !got[0].startsWith('Circular dependency: ')) return 'có vòng: cần trả đúng 1 phần tử "Circular dependency: A -> B -> ... -> A"';
      const path = got[0].slice('Circular dependency: '.length).split(' -> ');
      if (path.length < 2 || path[0] !== path[path.length - 1]) return 'đường đi phải khép kín (đỉnh đầu lặp lại ở cuối)';
      return validCycle(path.slice(0, -1), deps, providers);
    },
    cases: [
      { args: [...APP], expected: ['log', 'db', 'cache', 'app'] },
      { args: [['A', 'B', 'C'], [['A', 'B'], ['B', 'C'], ['C', 'A']]], expected: ['Circular dependency: A -> B -> C -> A'] },
      { args: [['svc', 'A', 'B'], [['svc', 'A'], ['A', 'B'], ['B', 'B']]], expected: ['Circular dependency: B -> B'], note: 'chỉ in chu trình, không in đường dẫn tới nó' },
    ],
    gen: (n, r) => {
      const m = Math.max(1, n);
      const big = n > 200;
      return randomGraph(m, big ? 2 * m : r.int(0, 2 * m), big ? 0 : 0.35, r);
    },
    perf: { n: 1e5, limitMs: 800 },
  },
  '05': {
    sig: 'String maxSatisfying(String[] versions, String range)',
    title: 'Semver rút gọn: phiên bản lớn nhất thỏa range',
    ref: S.maxSatisfying,
    brute: bruteSemver,
    cases: [
      { args: [['1.2.3', '1.9.0', '1.10.0', '2.0.0', '0.2.5', '0.2.9', '0.3.0'], '^1.2.3'], expected: '1.10.0', note: '1.10.0 > 1.9.0 (so số, không so chuỗi)' },
      { args: [['1.2.3', '1.2.9', '1.3.0'], '~1.2.3'], expected: '1.2.9' },
      { args: [['1.9.0', '2.0.0', '0.1.0'], '>=1.9.0'], expected: '2.0.0' },
      { args: [['1.2.3', '1.2.4', '0.2.5', '0.2.9', '0.3.0'], '^0.2.3'], expected: '0.2.9', note: '^0.y.z chỉ cho phép đổi patch' },
      { args: [['0.0.3', '0.0.4', '0.1.0'], '^0.0.3'], expected: '0.0.3', note: '^0.0.z khóa luôn patch' },
      { args: [['1.9.0', '1.9.0'], '1.9.0'], expected: '1.9.0' },
      { args: [['1.0.0', '2.1.0'], '^3.0.0'], expected: '', note: 'không có phiên bản thỏa → chuỗi rỗng' },
      { args: [[], '>=0.0.0'], expected: '' },
    ],
    gen: (n, r) => {
      const v = () => `${r.int(0, 3)}.${r.int(0, 12)}.${r.int(0, 12)}`;
      const range = r.pick(['^', '~', '>=', '']) + v();
      return [Array.from({ length: Math.max(0, n) }, v), range];
    },
    perf: false,
  },
};
