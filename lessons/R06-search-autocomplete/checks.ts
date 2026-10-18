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
const cmpStr = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

// ─── brute ───
class BruteSuggest {
  k: number;
  m = new Map<string, number>();
  constructor(k: number) {
    this.k = k;
  }
  add(w: string, wt: number) {
    this.m.set(w, (this.m.get(w) ?? 0) + wt);
  }
  query(p: string) {
    return [...this.m]
      .filter(([w]) => w.startsWith(p))
      .sort((a, b) => b[1] - a[1] || cmpStr(a[0], b[0]))
      .slice(0, this.k)
      .map((e) => e[0]);
  }
}
class BruteIndex {
  docs: [number, Set<string>][] = [];
  add(id: number, text: string) {
    this.docs.push([id, new Set(text.toLowerCase().split(/\s+/).filter(Boolean))]);
  }
  query(q: string) {
    const qs = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!qs.length) return [];
    return this.docs.filter(([, s]) => qs.every((t) => s.has(t))).map(([id]) => id);
  }
}
/** Levenshtein viết lại bằng ma trận đầy đủ (độc lập với bản rolling của ref). */
function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[a.length][b.length];
}
const bruteFuzzy = (dict: string[], q: string, m: number) =>
  dict
    .map((w) => [editDistance(w, q), w] as [number, string])
    .filter(([d]) => d <= m)
    .sort((x, y) => x[0] - y[0] || cmpStr(x[1], y[1]))
    .map((x) => x[1]);
class BruteBK {
  words = new Set<string>();
  add(w: string) {
    this.words.add(w);
  }
  search(q: string, m: number) {
    return bruteFuzzy([...this.words], q, m);
  }
}
// bảng thay thế thủ công — độc lập với Unicode NFD của ref
const FROM = 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ';
const TO = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
const stripVi = (s: string) => [...s.toLowerCase()].map((c) => (FROM.includes(c) ? TO[FROM.indexOf(c)] : c)).join('');
const bruteVi = (names: string[], query: string) => {
  const qs = stripVi(query.normalize('NFC')).split(/\s+/).filter(Boolean);
  return names.filter((n) => {
    const ts = stripVi(n.normalize('NFC')).split(/\s+/).filter(Boolean);
    return qs.every((q) => ts.some((t) => t.slice(0, q.length) === q));
  });
};

const VI = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Văn', 'Thị', 'Anh', 'Bình', 'Cường', 'Dũng', 'Hà', 'Hiếu', 'Khánh', 'Linh', 'Mai', 'Nam', 'Oanh', 'Phương', 'Quân', 'Sơn', 'Tâm', 'Uyên', 'Việt', 'Yến'];
const SYL = ['ba', 'ka', 'ro', 'mi', 'su', 'te', 'no', 'la', 'chi', 'do', 'ven', 'tor', 'an', 'el', 'is', 'ur'];

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class Suggest {\n  Suggest(int k)\n  void add(String word, int weight)\n  List<String> query(String prefix)\n}',
    title: 'Gợi ý top-k có cache tại node',
    ref: S.Suggest,
    brute: BruteSuggest,
    cases: [
      {
        args: [
          ['Suggest', 'add', 'add', 'add', 'add', 'query', 'query', 'query', 'add', 'query'],
          [[2], ['apple', 5], ['app', 5], ['apply', 1], ['banana', 9], ['ap'], [''], ['x'], ['apply', 10], ['app']],
        ],
        expected: [null, null, null, null, null, ['app', 'apple'], ['banana', 'app'], [], null, ['apply', 'app']],
        note: 'weight cộng dồn; hòa weight → chữ cái; prefix rỗng = top toàn cục; từ bằng chính prefix vẫn tính',
      },
      { args: [['Suggest', 'query', 'add', 'query'], [[3], ['a'], ['a', 1], ['a']]], expected: [null, [], null, ['a']] },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const pool = big ? 20000 : 14;
      const word = (i: number) => (big ? 'w' + i.toString(36) : r.string(r.int(1, 3), 'abc'));
      const words = Array.from({ length: pool }, (_, i) => word(i));
      return opsGen('Suggest', [big ? 5 : r.int(1, 4)], Math.max(1, n), () => {
        if (r.bool(big ? 0.6 : 0.5)) return ['add', [r.pick(words), r.int(1, 9)]];
        const w = r.pick(words);
        return ['query', [big ? w.slice(0, r.int(1, 3)) : w.slice(0, r.int(0, w.length))]];
      });
    },
    // quét mọi từ có tiền tố ở mỗi query: 4·10⁴ query × 2·10⁴ từ
    perf: { n: 1e5, limitMs: 600 },
  },
  '02': {
    sig: 'class SearchIndex {\n  SearchIndex()\n  void add(int docId, String text)\n  List<Integer> query(String q)\n}',
    title: 'Inverted index (AND)',
    ref: S.SearchIndex,
    brute: BruteIndex,
    cases: [
      {
        args: [
          ['SearchIndex', 'add', 'add', 'add', 'query', 'query', 'query', 'query'],
          [[], [1, 'The quick brown fox'], [2, 'quick quick red fox'], [5, 'brown dog'], ['quick fox'], ['BROWN'], ['quick dog'], ['']],
        ],
        expected: [null, null, null, null, [1, 2], [1, 5], [], []],
        note: 'không phân biệt hoa/thường; AND; truy vấn rỗng → []',
      },
      { args: [['SearchIndex', 'add', 'query', 'query'], [[], [3, 'a a a'], ['a a'], ['zzz a']]], expected: [null, null, [3], []], note: 'token lặp; token lạ → rỗng' },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const vocab = Array.from({ length: big ? 2000 : 6 }, (_, i) => 't' + i);
      let id = 0;
      return opsGen('SearchIndex', [], Math.max(1, n), () => {
        if (r.bool(big ? 0.3 : 0.5)) {
          id += r.int(1, 3);
          const len = r.int(1, big ? 10 : 4);
          return ['add', [id, Array.from({ length: len }, () => r.pick(vocab)).join(r.pick([' ', '  ']))]];
        }
        const k = r.int(0, 3);
        return ['query', [Array.from({ length: k }, () => r.pick(vocab)).join(' ')]];
      });
    },
    // quét mọi doc ở mỗi query: ≈3·10⁴ doc × 7·10⁴ query
    perf: { n: 1e5, limitMs: 800 },
  },
  '03': {
    sig: 'List<String> fuzzyMatch(String[] dict, String q, int maxDist)',
    title: 'Fuzzy match theo khoảng cách sửa',
    ref: S.fuzzyMatch,
    brute: bruteFuzzy,
    cases: [
      { args: [['book', 'back', 'boot', 'cook', 'books', 'hook'], 'book', 1], expected: ['book', 'books', 'boot', 'cook', 'hook'], note: 'xếp theo (khoảng cách, từ): book (0) rồi books < boot < cook < hook (cùng khoảng cách 1)' },
      { args: [['cat', 'dog'], 'cart', 0], expected: [] },
      { args: [['kitten'], 'sitting', 3], expected: ['kitten'], note: 'kitten→sitting = 3' },
      { args: [['a', 'ab', 'abc'], '', 2], expected: ['a', 'ab'], note: 'q rỗng: khoảng cách = độ dài từ' },
    ],
    gen: (n, r) => {
      const words = r.distinct(Math.min(n, 20), 0, 80).map((v) => v.toString(3).replace(/./g, (c) => 'abc'[Number(c)]));
      return [words, r.string(r.int(0, 4), 'abc'), r.int(0, 3)];
    },
    stress: { minN: 0, maxN: 30 },
    perf: false,
  },
  '04': {
    sig: 'List<String> searchVietnamese(String[] names, String query)',
    title: 'Tìm tên tiếng Việt không dấu',
    ref: S.searchVietnamese,
    brute: bruteVi,
    cases: [
      { args: [['Nguyễn Văn Đạt', 'Đặng Thị Hà', 'Dương Đức Anh', 'Nguyen Van A'], 'dat'], expected: ['Nguyễn Văn Đạt'] },
      { args: [['Nguyễn Văn Đạt', 'Đặng Thị Hà', 'Dương Đức Anh', 'Nguyen Van A'], 'nguyen van'], expected: ['Nguyễn Văn Đạt', 'Nguyen Van A'], note: 'giữ thứ tự gốc' },
      { args: [['Đặng Thị Hà', 'Dương Đức Anh'], 'ĐỨC d'], expected: ['Dương Đức Anh'], note: 'mỗi token truy vấn là tiền tố của MỘT token tên (không cần cùng thứ tự)' },
      { args: [['Lê Văn', 'Võ Văn'], ''], expected: ['Lê Văn', 'Võ Văn'], note: 'truy vấn rỗng → mọi tên' },
      { args: [['Trùng Hoàng'], 'trung hoang'], expected: ['Trùng Hoàng'], note: 'tên ở dạng tổ hợp (chữ + dấu rời) vẫn khớp' },
      { args: [['Phạm Quang Huy'], 'pham quanh'], expected: [], note: 'quanh không phải tiền tố của quang' },
    ],
    gen: (n, r) => {
      const names = Array.from({ length: Math.max(1, n) }, () => {
        const nm = Array.from({ length: r.int(1, 4) }, () => r.pick(VI)).join(' ');
        return r.bool(0.3) ? nm.normalize('NFD') : nm;
      });
      const q = Array.from({ length: r.int(0, 2) }, () => {
        const tok = r.pick(r.pick(names).split(' '));
        const pre = tok.slice(0, r.int(1, tok.length));
        return r.pick([pre, pre.toLowerCase(), pre.normalize('NFD'), stripVi(pre), stripVi(pre).toUpperCase()]);
      }).join(' ');
      return [names, q];
    },
    perf: false,
  },
  '05': {
    sig: 'class BKTree {\n  BKTree()\n  void add(String word)\n  List<String> search(String q, int maxDist)\n}',
    title: 'BK-tree',
    ref: S.BKTree,
    brute: BruteBK,
    cases: [
      {
        args: [
          ['BKTree', 'add', 'add', 'add', 'add', 'add', 'search', 'search', 'search'],
          [[], ['book'], ['books'], ['cake'], ['boo'], ['book'], ['book', 1], ['bo', 2], ['xyz', 1]],
        ],
        expected: [null, null, null, null, null, null, ['book', 'boo', 'books'], ['boo', 'book'], []],
        note: 'từ trùng bị bỏ qua; xếp (khoảng cách, từ)',
      },
      { args: [['BKTree', 'search', 'add', 'search'], [[], ['a', 3], ['a'], ['', 1]]], expected: [null, [], null, ['a']] },
    ],
    gen: (n, r) => {
      const big = n > 200;
      const mk = () => (big ? Array.from({ length: r.int(2, 4) }, () => r.pick(SYL)).join('') : r.string(r.int(1, 4), 'abc'));
      if (!big) {
        return opsGen('BKTree', [], Math.max(1, n), () => (r.bool(0.5) ? ['add', [mk()]] : ['search', [r.string(r.int(0, 4), 'abc'), r.int(0, 2)]]));
      }
      // n từ vào từ điển, rồi 600 truy vấn ngưỡng 1: quét tuyến tính phải tính 600 · n khoảng cách
      const ops = ['BKTree'];
      const args: any[][] = [[]];
      for (let i = 0; i < n; i++) {
        ops.push('add');
        args.push([mk()]);
      }
      for (let i = 0; i < 600; i++) {
        ops.push('search');
        args.push([mk(), 1]);
      }
      return [ops, args];
    },
    // từ điển cấu trúc (ghép âm tiết): BK-tree thăm vài % node; quét tuyến tính tính 600 · 2·10⁴ khoảng cách
    perf: { n: 2e4, limitMs: 700 },
  },
};
