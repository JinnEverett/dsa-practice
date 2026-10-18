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

// ─── hash bằng BigInt (độc lập với Math.imul) ───
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
const bHex = (s: string) => bFnv(s).toString(16).padStart(8, '0');
const cmpStr = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

class BruteRing {
  tokens: { pos: bigint; name: string; node: string }[] = [];
  addNode(node: string, v: number) {
    this.tokens = this.tokens.filter((t) => t.node !== node);
    for (let i = 0; i < v; i++) this.tokens.push({ pos: bG(node + '#' + i), name: node + '#' + i, node });
  }
  removeNode(node: string) {
    this.tokens = this.tokens.filter((t) => t.node !== node);
  }
  getNode(key: string) {
    if (!this.tokens.length) return '';
    const p = bG(key);
    const sorted = [...this.tokens].sort((a, b) => (a.pos < b.pos ? -1 : a.pos > b.pos ? 1 : cmpStr(a.name, b.name)));
    return (sorted.find((t) => t.pos >= p) ?? sorted[0]).node;
  }
}
function bruteMoved(nodes: string[], v: number, nn: string, keys: number) {
  const r = new BruteRing();
  for (const n of nodes) r.addNode(n, v);
  const before = Array.from({ length: keys }, (_, i) => r.getNode('key' + i));
  r.addNode(nn, v);
  return before.filter((b, i) => r.getNode('key' + i) !== b).length / keys;
}
function bruteRendezvous(key: string, nodes: string[]) {
  const sc = nodes.map((n) => [bG(n + ':' + key), n] as [bigint, string]);
  sc.sort((a, b) => (a[0] > b[0] ? -1 : a[0] < b[0] ? 1 : cmpStr(a[1], b[1])));
  return sc.length ? sc[0][1] : '';
}
function bruteMerkle(blocks: string[]): string {
  if (!blocks.length) return '';
  const rec = (hs: string[]): string => {
    if (hs.length === 1) return hs[0];
    const out: string[] = [];
    for (let i = 0; i < hs.length; i += 2) out.push(i + 1 < hs.length ? bHex('N' + hs[i] + hs[i + 1]) : hs[i]);
    return rec(out);
  };
  return rec(blocks.map((b) => bHex('L' + b)));
}
class BruteSync {
  blocks: string[];
  constructor(b: string[]) {
    this.blocks = [...b];
  }
  update(i: number, b: string) {
    this.blocks[i] = b;
  }
  root() {
    return bruteMerkle(this.blocks);
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class ConsistentHashRing {\n  ConsistentHashRing()\n  void addNode(String node, int vnodes)\n  void removeNode(String node)\n  String getNode(String key)\n}',
    title: 'Consistent hash ring',
    ref: S.ConsistentHashRing,
    brute: BruteRing,
    cases: [
      { args: [['ConsistentHashRing', 'getNode'], [[], ['k']]], expected: [null, ''], note: 'vòng rỗng → ""' },
      {
        args: [
          ['ConsistentHashRing', 'addNode', 'getNode', 'addNode', 'removeNode', 'getNode', 'removeNode', 'getNode'],
          [[], ['A', 3], ['user1'], ['B', 3], ['A'], ['user1'], ['B'], ['user1']],
        ],
        expected: [null, null, 'A', null, null, 'B', null, ''],
        note: 'chỉ còn một node → mọi key về node đó',
      },
      { args: [['ConsistentHashRing', 'addNode', 'addNode', 'getNode', 'getNode'], [[], ['A', 2], ['A', 1], ['x'], ['y']]], expected: [null, null, null, 'A', 'A'], note: 'addNode lại thay thế token cũ' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      if (big) {
        const names = Array.from({ length: 100 }, (_, i) => 'node' + i);
        return opsGen('ConsistentHashRing', [], Math.max(1, n), (i) => {
          if (i < 100) return ['addNode', [names[i], 100]];
          if (i % 5000 === 0) return ['removeNode', [r.pick(names)]];
          if (i % 5000 === 1) return ['addNode', [r.pick(names), 100]];
          return ['getNode', ['key' + r.int(0, 1e6)]];
        });
      }
      const names = ['n0', 'n1', 'n2', 'n3'];
      return opsGen('ConsistentHashRing', [], Math.max(1, n), () => {
        const x = r.float();
        if (x < 0.25) return ['addNode', [r.pick(names), r.int(1, 4)]];
        if (x < 0.4) return ['removeNode', [r.pick(names)]];
        return ['getNode', ['k' + r.int(0, 25)]];
      });
    },
    // tìm token bằng quét tuyến tính (10⁴ token) ở mỗi lookup: 10⁵ × 10⁴
    perf: { n: 1e5, limitMs: 500 },
  },
  '02': {
    sig: 'double movedFraction(String[] nodes, int vnodes, String newNode, int keys)',
    title: 'Tỉ lệ key di chuyển khi thêm node',
    ref: S.movedFraction,
    brute: bruteMoved,
    compare: 'float',
    cases: [
      { args: [['A'], 1, 'B', 1], note: 'một key: kết quả 0 hoặc 1 (brute tính)' },
      { args: [['A', 'B'], 50, 'C', 5000], note: 'kỳ vọng ≈ 1/3; kiểm tra bằng brute độc lập' },
    ],
    gen: (n, r) => {
      if (n > 200) return [Array.from({ length: 50 }, (_, i) => 'node' + i), 100, 'extra', n];
      const nodes = r.distinct(r.int(1, 4), 0, 8).map((i) => 'n' + i);
      return [nodes, r.int(1, 5), 'new', Math.max(1, n)];
    },
    // 2·10⁵ lookup trên vòng 5000 token bằng quét tuyến tính
    perf: { n: 1e5, limitMs: 400 },
  },
  '03': {
    sig: 'String rendezvousPick(String key, String[] nodes)',
    title: 'Rendezvous hashing',
    ref: S.rendezvousPick,
    brute: bruteRendezvous,
    cases: [
      { args: ['user1', ['a', 'b', 'c', 'd']], expected: 'b', note: 'điểm cao nhất: g("b:user1") = 4261768284' },
      { args: ['k', ['a', 'b', 'c', 'd']], expected: 'b' },
      { args: ['user2', ['d', 'a', 'c']], expected: 'c', note: 'thứ tự mảng không ảnh hưởng; b vắng mặt → c (3289612425) thắng' },
      { args: ['x', []], expected: '' },
      { args: ['x', ['only']], expected: 'only' },
    ],
    gen: (n, r) => ['key' + r.int(0, 50), r.distinct(Math.min(n, 12), 0, 80).map((i) => 'srv' + i)],
    perf: false,
  },
  '04': {
    sig: 'String merkleRoot(String[] blocks)',
    title: 'Merkle root',
    ref: S.merkleRoot,
    brute: bruteMerkle,
    cases: [
      { args: [[]], expected: '' },
      { args: [['a']], expected: '47e217fe', note: 'một khối: gốc = lá = hex8(fnv1a32("La"))' },
      { args: [['a', 'b']], expected: 'c67c2cb8' },
      { args: [['a', 'b', 'c']], expected: '9afacca6', note: 'nút lẻ được thăng lên, không nhân đôi' },
      { args: [['a', 'b', 'c', 'd', 'e']], expected: 'a3d6d827' },
      { args: [['']], expected: 'c90bfeab', note: 'khối rỗng vẫn có lá; hex đủ 8 chữ số' },
    ],
    gen: (n, r) => [Array.from({ length: n }, () => r.string(r.int(0, 4), 'abxyz'))],
    perf: { n: 1e5, limitMs: 300 },
  },
  '05': {
    sig: 'class MerkleSync {\n  MerkleSync(String[] blocks)\n  void update(int i, String block)\n  String root()\n}',
    title: 'Merkle tree cập nhật tăng dần',
    ref: S.MerkleSync,
    brute: BruteSync,
    cases: [
      { args: [['MerkleSync', 'root', 'update', 'root', 'update', 'root'], [[['a', 'b', 'c']], [], [2, 'x'], [], [2, 'c'], []]], expected: [null, '9afacca6', null, S.merkleRoot(['a', 'b', 'x']), null, '9afacca6'], note: 'đổi rồi đổi lại → gốc cũ' },
      { args: [['MerkleSync', 'root', 'update', 'root'], [[['a']], [], [0, 'b'], []]], expected: [null, '47e217fe', null, S.merkleRoot(['b'])] },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const size = big ? 50000 : r.int(1, 9);
      const blocks = Array.from({ length: size }, (_, i) => 'b' + i);
      return opsGen('MerkleSync', [blocks], Math.max(1, n), () => (r.bool(big ? 0.2 : 0.5) ? ['update', [r.int(0, size - 1), 'v' + r.int(0, 999)]] : ['root', []]));
    },
    // dựng lại cả cây ở mỗi root(): ~8·10⁴ lần × 10⁵ hash
    perf: { n: 1e5, limitMs: 700 },
  },
};
