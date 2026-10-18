import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const BIG = 1000; // n lớn hơn ngưỡng này → gen sinh dữ liệu cho perf (bản ngây thơ sẽ chậm)

const ALPHA = 'abc';

/** Chuỗi ngẫu nhiên độ dài [lo, hi] trên bảng chữ cái `al`. */
const word = (r: Rng, lo: number, hi: number, al = ALPHA) => r.string(r.int(lo, hi), al);

/** Sinh tối đa `count` chuỗi KHÁC NHAU (dừng sớm nếu không đủ chỗ trống sau nhiều lần thử). */
const distinctWords = (r: Rng, count: number, lo: number, hi: number, al = ALPHA): string[] => {
  const seen = new Set<string>();
  let tries = 0;
  while (seen.size < count && tries++ < count * 20 + 50) seen.add(word(r, lo, hi, al));
  return [...seen];
};

const A26 = 'abcdefghijklmnopqrstuvwxyz';

// ─── ex03 · brute: Word Search I cho từng từ ───
const existsOnBoard = (board: string[], w: string): boolean => {
  const m = board.length;
  const n = board[0].length;
  const seen = board.map((row) => new Array(row.length).fill(false));
  const go = (r: number, c: number, k: number): boolean => {
    if (r < 0 || c < 0 || r >= m || c >= n || seen[r][c] || board[r][c] !== w[k]) return false;
    if (k === w.length - 1) return true;
    seen[r][c] = true;
    const ok = go(r + 1, c, k + 1) || go(r - 1, c, k + 1) || go(r, c + 1, k + 1) || go(r, c - 1, k + 1);
    seen[r][c] = false;
    return ok;
  };
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (go(r, c, 0)) return true;
  return false;
};

// ─── ex04 · brute: thử từng gốc ───
const replaceBrute = (dict: string[], sentence: string) =>
  sentence
    .split(' ')
    .map((w) => {
      let best: string | null = null;
      for (const d of dict) if (w.startsWith(d) && (best === null || d.length < best.length)) best = d;
      return best ?? w;
    })
    .join(' ');

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class Trie {\n  Trie()\n  void insert(String word)\n  boolean search(String word)\n  boolean startsWith(String prefix)\n}',
    title: 'Trie: insert / search / startsWith',
    ref: S.Trie,
    brute: class {
      w: string[] = [];
      insert(word: string) {
        this.w.push(word);
      }
      search(word: string) {
        return this.w.includes(word);
      }
      startsWith(p: string) {
        return this.w.some((x) => x.startsWith(p));
      }
    },
    cases: [
      {
        args: [['Trie', 'insert', 'search', 'search', 'startsWith', 'insert', 'search'], [[], ['apple'], ['apple'], ['app'], ['app'], ['app'], ['app']]],
        expected: [null, null, true, false, true, null, true],
      },
      { args: [['Trie', 'startsWith', 'search', 'insert', 'startsWith', 'startsWith'], [[], ['a'], ['a'], ['ab'], ['abc'], ['']]], expected: [null, false, false, null, false, true], note: 'tiền tố rỗng: true khi đã có từ' },
      { args: [['Trie', 'insert', 'insert', 'search', 'search'], [[], ['a'], ['a'], ['a'], ['b']]], expected: [null, null, null, true, false], note: 'chèn trùng' },
    ],
    gen: (n, r) => {
      const ops = ['Trie'];
      const args: any[][] = [[]];
      if (n > BIG) {
        // nửa đầu chèn, nửa sau truy vấn tiền tố/khớp đúng → bản duyệt danh sách từ O(n²)
        const words: string[] = [];
        for (let i = 0; i < n; i++) {
          if (i < n / 2) {
            const w = word(r, 5, 12, A26);
            words.push(w);
            ops.push('insert');
            args.push([w]);
          } else {
            const w = r.pick(words);
            if (r.bool()) {
              ops.push('startsWith');
              args.push([w.slice(0, r.int(1, w.length))]);
            } else {
              ops.push('search');
              args.push([w]);
            }
          }
        }
        return [ops, args];
      }
      for (let i = 0; i < Math.max(1, n); i++) {
        const op = r.pick(['insert', 'search', 'startsWith']);
        ops.push(op);
        args.push([word(r, 1, 4)]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '02': {
    sig: 'class WordDictionary {\n  WordDictionary()\n  void addWord(String word)\n  boolean search(String word)\n}',
    title: 'Từ điển với ký tự đại diện "."',
    ref: S.WordDictionary,
    brute: class {
      w: string[] = [];
      addWord(word: string) {
        this.w.push(word);
      }
      search(p: string) {
        return this.w.some((x) => x.length === p.length && [...p].every((c, i) => c === '.' || c === x[i]));
      }
    },
    cases: [
      {
        args: [['WordDictionary', 'addWord', 'addWord', 'addWord', 'search', 'search', 'search', 'search'], [[], ['bad'], ['dad'], ['mad'], ['pad'], ['bad'], ['.ad'], ['b..']]],
        expected: [null, null, null, null, false, true, true, true],
      },
      { args: [['WordDictionary', 'addWord', 'search', 'search', 'search', 'search'], [[], ['a'], ['.'], ['a.'], ['..'], ['b']]], expected: [null, null, true, false, false, false], note: 'độ dài phải khớp' },
      { args: [['WordDictionary', 'search', 'addWord', 'search'], [[], ['.'], ['xy'], ['x.']]], expected: [null, false, null, true] },
    ],
    gen: (n, r) => {
      const ops = ['WordDictionary'];
      const args: any[][] = [[]];
      const words: string[] = [];
      const pattern = (w: string) => {
        const c = w.split('');
        for (let d = r.int(0, 2); d > 0; d--) c[r.int(0, c.length - 1)] = '.';
        return c.join('');
      };
      for (let i = 0; i < Math.max(1, n); i++) {
        if (n > BIG) {
          // nửa đầu thêm từ, nửa sau tìm kiếm (≤ 2 dấu '.')
          if (i < n / 2) {
            const w = word(r, 5, 12, A26);
            words.push(w);
            ops.push('addWord');
            args.push([w]);
          } else {
            ops.push('search');
            args.push([r.bool(0.7) ? pattern(r.pick(words)) : word(r, 5, 12, A26)]);
          }
        } else if (words.length === 0 || r.bool(0.4)) {
          const w = word(r, 1, 4);
          words.push(w);
          ops.push('addWord');
          args.push([w]);
        } else {
          ops.push('search');
          args.push([r.bool(0.7) ? pattern(r.pick(words)) : word(r, 1, 4)]);
        }
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '03': {
    sig: 'List<String> findWords(String[] board, String[] words)',
    title: 'Word Search II',
    ref: S.findWords,
    brute: (board: string[], words: string[]) => words.filter((w) => existsOnBoard(board, w)),
    compare: 'unordered',
    cases: [
      { args: [['oaan', 'etae', 'ihkr', 'iflv'], ['oath', 'pea', 'eat', 'rain']], expected: ['eat', 'oath'] },
      { args: [['ab', 'cd'], ['abcb']], expected: [], note: 'không dùng lại ô' },
      { args: [['a'], ['a']], expected: ['a'] },
      { args: [['ab'], ['a', 'b', 'ab', 'ba', 'aba']], expected: ['a', 'b', 'ab', 'ba'] },
      { args: [['aaa', 'aaa'], ['a', 'aa', 'aaaaaa', 'aaaaaaa']], expected: ['a', 'aa', 'aaaaaa'], note: 'từ chung tiền tố, 6 ô' },
    ],
    gen: (n, r) => {
      if (n > BIG) {
        // lưới 12x12 chủ yếu chữ 'a', nhiều từ chung tiền tố dài → chạy riêng từng từ rất tốn
        const board = Array.from({ length: 12 }, () => Array.from({ length: 12 }, () => (r.bool(0.85) ? 'a' : r.pick(['b', 'c']))).join(''));
        const al = 'aaaaaabc';
        return [board, distinctWords(r, Math.min(n, 30000), 7, 10, al)];
      }
      const rows = r.int(1, 4);
      const cols = r.int(1, 4);
      const board = Array.from({ length: rows }, () => r.string(cols, ALPHA));
      return [board, distinctWords(r, n, 1, 6)];
    },
    perf: { n: 3e4, limitMs: 1000 },
  },
  '04': {
    sig: 'String replaceWords(String[] dictionary, String sentence)',
    title: 'Replace words (gốc ngắn nhất)',
    ref: S.replaceWords,
    brute: replaceBrute,
    cases: [
      { args: [['cat', 'bat', 'rat'], 'the cattle was rattled by the battery'], expected: 'the cat was rat by the bat' },
      { args: [['a', 'b', 'c'], 'aadsfasf absbs bbab cadsfafs'], expected: 'a a b c' },
      { args: [['a', 'aa', 'aaa'], 'aaaa b'], expected: 'a b', note: 'chọn gốc ngắn nhất' },
      { args: [['abc'], 'ab abc'], expected: 'ab abc', note: 'từ ngắn hơn gốc giữ nguyên' },
      { args: [['ab', 'ab'], 'abc'], expected: 'ab', note: 'gốc trùng' },
      { args: [['ab'], new Array(100000).fill('abcdef').join(' ')], expected: new Array(100000).fill('ab').join(' '), note: '10^5 từ' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > BIG) {
        const dict = Array.from({ length: 10000 }, () => word(r, 3, 6, A26));
        const sentence: string[] = [];
        for (let i = 0; i < len; i++) sentence.push(r.bool(0.5) ? r.pick(dict) + word(r, 0, 5, A26) : word(r, 3, 10, A26));
        return [dict, sentence.join(' ')];
      }
      const dict = Array.from({ length: r.int(1, 4) }, () => word(r, 1, 3));
      return [dict, Array.from({ length: len }, () => word(r, 1, 5)).join(' ')];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 200 },
  },
  '05': {
    sig: 'List<List<String>> suggestedProducts(String[] products, String searchWord)',
    title: 'Gợi ý sản phẩm khi gõ',
    ref: S.suggestedProducts,
    brute: (products: string[], sw: string) => {
      const out: string[][] = [];
      for (let i = 1; i <= sw.length; i++) {
        const p = sw.slice(0, i);
        out.push(products.filter((x) => x.startsWith(p)).sort().slice(0, 3));
      }
      return out;
    },
    cases: [
      {
        args: [['mobile', 'mouse', 'moneypot', 'monitor', 'mousepad'], 'mouse'],
        expected: [['mobile', 'moneypot', 'monitor'], ['mobile', 'moneypot', 'monitor'], ['mouse', 'mousepad'], ['mouse', 'mousepad'], ['mouse', 'mousepad']],
      },
      { args: [['havana'], 'havana'], expected: [['havana'], ['havana'], ['havana'], ['havana'], ['havana'], ['havana']] },
      { args: [['bags', 'baggage', 'banner', 'box', 'cloths'], 'bags'], expected: [['baggage', 'bags', 'banner'], ['baggage', 'bags', 'banner'], ['baggage', 'bags'], ['bags']] },
      { args: [['havana'], 'tatiana'], expected: [[], [], [], [], [], [], []] },
      { args: [['a', 'a', 'a', 'a'], 'a'], expected: [['a', 'a', 'a']], note: 'sản phẩm trùng tên tính riêng' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > BIG) {
        // 1 lượt "lọc rồi sort lại cho từng tiền tố" là O(L · P log P)
        const sw = word(r, 30, 30, 'ab');
        return [Array.from({ length: len }, () => sw.slice(0, r.int(0, 29)) + word(r, 1, 6, 'ab')), sw];
      }
      return [Array.from({ length: len }, () => word(r, 1, 5)), word(r, 1, 5)];
    },
    stress: { minN: 1 },
    perf: { n: 1e4, limitMs: 200 },
  },
  '06': {
    sig: 'int findMaximumXOR(int[] nums)',
    title: 'Maximum XOR của hai số',
    ref: S.findMaximumXOR,
    brute: (nums: number[]) => {
      let best = 0;
      for (const a of nums) for (const b of nums) best = Math.max(best, (a ^ b) >>> 0);
      return best;
    },
    cases: [
      { args: [[3, 10, 5, 25, 2, 8]], expected: 28 },
      { args: [[14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]], expected: 127 },
      { args: [[0]], expected: 0 },
      { args: [[5]], expected: 0, note: 'một phần tử: XOR với chính nó' },
      { args: [[2147483647, 0]], expected: 2147483647, note: 'bit 30' },
      { args: [[7, 7, 7]], expected: 0 },
      { args: [Array.from({ length: 100000 }, (_, i) => i)], expected: 131071, note: '0..99999: 65535 xor 65536' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      if (n > BIG) return [r.array(len, 0, 2147483647)];
      return [r.array(len, 0, r.pick([7, 100, 2147483647]))];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 300 }, // bản O(n²) = 10^10 phép → vượt xa
  },
  '07': {
    sig: 'class Autocomplete {\n  Autocomplete(String[] words, int[] counts)\n  void add(String word)\n  List<String> top3(String prefix)\n}',
    title: 'Autocomplete top 3',
    ref: S.Autocomplete,
    brute: class {
      c = new Map<string, number>();
      constructor(words: string[], counts: number[]) {
        words.forEach((w, i) => this.c.set(w, counts[i]));
      }
      add(w: string) {
        this.c.set(w, (this.c.get(w) ?? 0) + 1);
      }
      top3(p: string) {
        return [...this.c.entries()]
          .filter(([w]) => w.startsWith(p))
          .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
          .slice(0, 3)
          .map(([w]) => w);
      }
    },
    cases: [
      {
        args: [
          ['Autocomplete', 'top3', 'add', 'add', 'add', 'top3', 'top3', 'top3', 'add', 'top3'],
          [[['apple', 'app', 'apply', 'ape', 'bat'], [5, 3, 5, 2, 1]], ['ap'], ['app'], ['app'], ['app'], ['ap'], ['b'], ['z'], ['apex'], ['ape']],
        ],
        expected: [null, ['apple', 'apply', 'app'], null, null, null, ['app', 'apple', 'apply'], ['bat'], [], null, ['ape', 'apex']],
      },
      {
        args: [['Autocomplete', 'top3', 'add', 'top3'], [[['b', 'a', 'c'], [1, 1, 1]], ['a'], ['b'], ['']].map((x, i) => (i === 3 ? ['b'] : x))],
        expected: [null, ['a'], null, ['b']],
        note: 'hòa count → theo chữ cái',
      },
      {
        args: [['Autocomplete', 'add', 'add', 'add', 'top3'], [[[], []], ['hi'], ['hit'], ['hi'], ['h']]],
        expected: [null, null, null, null, ['hi', 'hit']],
        note: 'khởi tạo rỗng; từ mới count = 1',
      },
    ],
    gen: (n, r) => {
      const ops = ['Autocomplete'];
      const args: any[][] = [];
      const big = n > BIG;
      const initial = big ? distinctWords(r, 50000, 5, 12, A26) : distinctWords(r, r.int(0, 8), 1, 4);
      const counts = initial.map(() => (big ? r.int(1, 1000) : r.int(1, 5)));
      args.push([initial, counts]);
      const pool = initial.slice();
      for (let i = 0; i < Math.max(1, n); i++) {
        if (r.bool(0.4)) {
          const w = pool.length && r.bool(0.7) ? r.pick(pool) : big ? word(r, 5, 12, A26) : word(r, 1, 4);
          if (!pool.includes(w) && !big) pool.push(w);
          ops.push('add');
          args.push([w]);
        } else {
          // tiền tố ngắn của một từ có thật → nhiều kết quả, bản quét toàn bộ O(W) mỗi truy vấn
          const base = pool.length ? r.pick(pool) : word(r, 1, 4);
          ops.push('top3');
          args.push([base.slice(0, r.int(1, big ? Math.min(3, base.length) : base.length))]);
        }
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '08': {
    sig: 'class StreamChecker {\n  StreamChecker(String[] words)\n  boolean query(char letter)\n}',
    title: 'Lọc từ cấm trong luồng chat',
    ref: S.StreamChecker,
    brute: class {
      w: string[];
      s = '';
      constructor(words: string[]) {
        this.w = words;
      }
      query(c: string) {
        this.s += c;
        return this.w.some((x) => this.s.endsWith(x));
      }
    },
    cases: [
      {
        args: [
          ['StreamChecker', ...'abcdefghijkl'.split('').map(() => 'query')],
          [[['cd', 'f', 'kl']], ...'abcdefghijkl'.split('').map((c) => [c])],
        ],
        expected: [null, false, false, false, true, false, true, false, false, false, false, false, true],
      },
      { args: [['StreamChecker', 'query', 'query', 'query'], [[['a']], ['b'], ['a'], ['a']]], expected: [null, false, true, true], note: 'từ dài 1' },
      { args: [['StreamChecker', 'query', 'query', 'query', 'query'], [[['abc', 'bc']], ['x'], ['a'], ['b'], ['c']]], expected: [null, false, false, false, true], note: 'nhiều từ cùng là hậu tố' },
      { args: [['StreamChecker', 'query', 'query', 'query', 'query'], [[['aa']], ['a'], ['b'], ['a'], ['a']]], expected: [null, false, false, false, true], note: 'luồng đã bị ngắt bởi b' },
    ],
    gen: (n, r) => {
      const big = n > BIG;
      const words = Array.from({ length: big ? 2000 : r.int(1, 5) }, () => word(r, 1, big ? 200 : 4, 'ab'));
      const ops = ['StreamChecker'];
      const args: any[][] = [[words]];
      for (let i = 0; i < Math.max(1, n); i++) {
        ops.push('query');
        args.push([r.pick(['a', 'b'])]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 300 },
  },
};
