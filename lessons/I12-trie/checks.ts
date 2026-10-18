import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

/** n từ KHÁC NHAU (độ dài 1..maxLen) trên bảng chữ cái `alpha`. */
function distinctWords(n: number, maxLen: number, alpha: string, r: Rng): string[] {
  const set = new Set<string>();
  while (set.size < n) set.add(r.string(r.int(1, maxLen), alpha));
  return [...set];
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class Trie {\n  Trie()\n  void insert(String word)\n  boolean search(String word)\n  boolean startsWith(String prefix)\n}',
    title: 'Tự cài Trie',
    ref: S.Trie,
    brute: class {
      w: string[] = [];
      insert(x: string) {
        this.w.push(x);
      }
      search(x: string) {
        return this.w.includes(x);
      }
      startsWith(x: string) {
        return this.w.some((s) => s.startsWith(x));
      }
    },
    cases: [
      {
        args: [['Trie', 'insert', 'search', 'search', 'startsWith', 'insert', 'search'], [[], ['apple'], ['apple'], ['app'], ['app'], ['app'], ['app']]],
        expected: [null, null, true, false, true, null, true],
      },
      { args: [['Trie', 'search', 'startsWith'], [[], ['a'], ['a']]], expected: [null, false, false], note: 'trie rỗng' },
      { args: [['Trie', 'insert', 'insert', 'search', 'startsWith'], [[], ['a'], ['a'], ['a'], ['ab']]], expected: [null, null, null, true, false], note: 'chèn trùng' },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const alpha = big ? ALPHA : 'abc';
      const ops = ['Trie'];
      const args: any[][] = [[]];
      const inserted: string[] = [];
      for (let i = 0; i < Math.max(1, n); i++) {
        // perf: nửa đầu chỉ chèn, nửa sau chỉ truy vấn → danh sách phẳng O(n) mỗi truy vấn
        const op = big ? (i < n / 2 ? 'insert' : r.pick(['search', 'startsWith'])) : r.pick(['insert', 'insert', 'search', 'startsWith']);
        ops.push(op);
        let w: string;
        if (op === 'insert') w = r.string(r.int(1, big ? 8 : 4), alpha);
        else w = inserted.length && r.bool(0.5) ? r.pick(inserted).slice(0, r.int(1, 8)) : r.string(r.int(1, big ? 8 : 4), alpha);
        if (op === 'insert') inserted.push(w);
        args.push([w]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
  '02': {
    sig: 'class WordDictionary {\n  WordDictionary()\n  void addWord(String word)\n  boolean search(String word)\n}',
    title: 'Từ điển có ký tự đại diện',
    ref: S.WordDictionary,
    brute: class {
      w: string[] = [];
      addWord(x: string) {
        this.w.push(x);
      }
      search(p: string) {
        return this.w.some((s) => s.length === p.length && [...s].every((ch, i) => p[i] === '.' || p[i] === ch));
      }
    },
    cases: [
      {
        args: [['WordDictionary', 'addWord', 'addWord', 'addWord', 'search', 'search', 'search', 'search'], [[], ['bad'], ['dad'], ['mad'], ['pad'], ['bad'], ['.ad'], ['b..']]],
        expected: [null, null, null, null, false, true, true, true],
      },
      { args: [['WordDictionary', 'addWord', 'search', 'search'], [[], ['a'], ['.'], ['..']]], expected: [null, null, true, false], note: '"." khớp đúng một ký tự' },
      { args: [['WordDictionary', 'addWord', 'search', 'search'], [[], ['abc'], ['ab'], ['abcd']]], expected: [null, null, false, false], note: 'phải đúng độ dài' },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const alpha = big ? 'abcdefgh' : 'abc';
      const ops = ['WordDictionary'];
      const args: any[][] = [[]];
      const added: string[] = [];
      for (let i = 0; i < Math.max(1, n); i++) {
        const op = big ? (i < n / 2 ? 'addWord' : 'search') : r.pick(['addWord', 'addWord', 'search']);
        ops.push(op);
        if (op === 'addWord') {
          const w = r.string(r.int(1, big ? 10 : 4), alpha);
          added.push(w);
          args.push([w]);
        } else {
          const base = added.length && r.bool(0.7) ? r.pick(added) : r.string(r.int(1, big ? 10 : 4), alpha);
          const dots = new Set(range(Math.min(base.length, big ? 2 : 3)).map(() => r.int(0, base.length - 1))); // ≤ 3 dấu '.' (đề)
          args.push([[...base].map((ch, k) => (dots.has(k) ? '.' : ch)).join('')]);
        }
      }
      return [ops, args];
    },
    perf: { n: 40000, limitMs: 400 },
  },
  '03': {
    sig: 'List<String> findWords(String[] board, String[] words)',
    title: 'Tìm nhiều từ trên bảng (Trie + backtracking)',
    ref: S.findWords,
    compare: 'unordered',
    brute: (board: string[], words: string[]) => {
      const R = board.length;
      const C = board[0].length;
      const exist = (word: string) => {
        const used = board.map((row) => new Array(row.length).fill(false));
        const go = (r: number, c: number, k: number): boolean => {
          if (r < 0 || c < 0 || r >= R || c >= C || used[r][c] || board[r][c] !== word[k]) return false;
          if (k === word.length - 1) return true;
          used[r][c] = true;
          const ok = D4.some(([dr, dc]) => go(r + dr, c + dc, k + 1));
          used[r][c] = false;
          return ok;
        };
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (go(r, c, 0)) return true;
        return false;
      };
      return words.filter(exist);
    },
    cases: [
      { args: [['oaan', 'etae', 'ihkr', 'iflv'], ['oath', 'pea', 'eat', 'rain']], expected: ['eat', 'oath'] },
      { args: [['ab', 'cd'], ['abcb']], expected: [] },
      { args: [['a'], ['a']], expected: ['a'] },
      { args: [['aa', 'aa'], ['a', 'aa', 'aaa', 'aaaa', 'aaaaa']], expected: ['a', 'aa', 'aaa', 'aaaa'], note: 'nhiều đường đi cho cùng một từ → chỉ báo một lần' },
    ],
    gen: (n, r) => {
      if (n > 1000) {
        const side = 8;
        const board = Array.from({ length: side }, () => r.string(side, 'abc'));
        return [board, distinctWords(Math.min(3000, n), 9, 'abc', r)];
      }
      const R = r.int(1, 3);
      const C = r.int(1, 3);
      return [Array.from({ length: R }, () => r.string(C, 'ab')), distinctWords(Math.min(n, 10), 4, 'ab', r)];
    },
    stress: { minN: 1, maxN: 10 },
    perf: { n: 3000, limitMs: 150 },
  },
  '04': {
    sig: 'String replaceWords(String[] dictionary, String sentence)',
    title: 'Thay từ bằng gốc ngắn nhất',
    ref: S.replaceWords,
    brute: (dict: string[], sentence: string) =>
      sentence
        .split(' ')
        .map((w) => {
          const roots = dict.filter((d) => w.startsWith(d));
          return roots.length ? roots.reduce((a, b) => (b.length < a.length ? b : a)) : w;
        })
        .join(' '),
    cases: [
      { args: [['cat', 'bat', 'rat'], 'the cattle was rattled by the battery'], expected: 'the cat was rat by the bat' },
      { args: [['a', 'b', 'c'], 'aadsfasf absbs bbab cadsfafs'], expected: 'a a b c' },
      { args: [['catt', 'cat', 'bat', 'rat'], 'the cattle was rattled by the battery'], expected: 'the cat was rat by the bat', note: 'chọn gốc ngắn nhất' },
      { args: [['abc'], 'ab'], expected: 'ab', note: 'từ ngắn hơn gốc' },
      { args: [['a'], 'a'], expected: 'a' },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const alpha = big ? 'abcdefgh' : 'abc';
      const dict = distinctWords(big ? 5000 : Math.min(n, 6), big ? 8 : 3, alpha, r);
      const words = Array.from({ length: Math.max(1, big ? n : Math.min(n, 8)) }, () => r.string(r.int(1, big ? 12 : 5), alpha));
      return [dict, words.join(' ')];
    },
    stress: { minN: 1, maxN: 10 },
    perf: { n: 1e5, limitMs: 300 },
  },
  '05': {
    sig: 'List<List<String>> suggestedProducts(String[] products, String searchWord)',
    title: 'Gợi ý sản phẩm khi gõ',
    ref: S.suggestedProducts,
    brute: (products: string[], word: string) =>
      range(word.length).map((i) => products.filter((p) => p.startsWith(word.slice(0, i + 1))).sort().slice(0, 3)),
    cases: [
      {
        args: [['mobile', 'mouse', 'moneypot', 'monitor', 'mousepad'], 'mouse'],
        expected: [['mobile', 'moneypot', 'monitor'], ['mobile', 'moneypot', 'monitor'], ['mouse', 'mousepad'], ['mouse', 'mousepad'], ['mouse', 'mousepad']],
      },
      { args: [['havana'], 'havana'], expected: [['havana'], ['havana'], ['havana'], ['havana'], ['havana'], ['havana']] },
      { args: [['bags', 'baggage', 'banner', 'box', 'cloths'], 'bags'], expected: [['baggage', 'bags', 'banner'], ['baggage', 'bags', 'banner'], ['baggage', 'bags'], ['bags']] },
      { args: [['havana'], 'tatiana'], expected: [[], [], [], [], [], [], []], note: 'không sản phẩm nào khớp' },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const alpha = big ? 'abcd' : 'abc';
      const products = distinctWords(big ? n : Math.min(n, 8), big ? 12 : 4, alpha, r);
      return [products, r.string(r.int(1, big ? 30 : 5), alpha)];
    },
    stress: { minN: 1, maxN: 10 },
    perf: { n: 20000, limitMs: 400 },
  },
  '06': {
    sig: 'int findMaximumXOR(int[] nums)',
    title: 'XOR lớn nhất của hai số',
    ref: S.findMaximumXOR,
    brute: (nums: number[]) => {
      let best = 0;
      for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) best = Math.max(best, nums[i] ^ nums[j]);
      return best;
    },
    cases: [
      { args: [[3, 10, 5, 25, 2, 8]], expected: 28 },
      { args: [[14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]], expected: 127 },
      { args: [[0]], expected: 0 },
      { args: [[5, 5, 5]], expected: 0, note: 'toàn số bằng nhau' },
      { args: [[2147483647, 0]], expected: 2147483647, note: 'bit 30 — dịch trái 31 bit làm số âm' },
      { args: [range(131072)], expected: 131071 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), 0, n > 1000 ? 2147483647 : 40)],
    stress: { minN: 1, maxN: 30 },
    perf: { n: 1e5, limitMs: 600 },
  },
  '07': {
    sig: 'class Autocomplete {\n  Autocomplete(String[] words, int[] counts)\n  void add(String word)\n  List<String> top3(String prefix)\n}',
    title: 'Autocomplete top 3 theo lượt',
    ref: S.Autocomplete,
    brute: class {
      m = new Map<string, number>();
      constructor(words: string[], counts: number[]) {
        words.forEach((w, i) => this.m.set(w, counts[i]));
      }
      add(w: string) {
        this.m.set(w, (this.m.get(w) ?? 0) + 1);
      }
      top3(prefix: string) {
        return [...this.m]
          .filter(([w]) => w.startsWith(prefix))
          .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
          .slice(0, 3)
          .map(([w]) => w);
      }
    },
    cases: [
      {
        args: [
          ['Autocomplete', 'top3', 'top3', 'add', 'add', 'top3', 'top3', 'add', 'top3'],
          [[['apple', 'app', 'apply', 'ape', 'bat'], [3, 2, 3, 1, 5]], ['ap'], ['b'], ['ape'], ['ape'], ['ap'], ['z'], ['applet'], ['ap']],
        ],
        expected: [null, ['apple', 'apply', 'app'], ['bat'], null, null, ['ape', 'apple', 'apply'], [], null, ['ape', 'apple', 'apply']],
        note: 'hòa lượt → chữ cái; add từ mới có lượt 1',
      },
      { args: [['Autocomplete', 'top3', 'add', 'top3'], [[[], []], ['a'], ['ab'], ['']]], expected: [null, [], null, ['ab']], note: 'tiền tố rỗng = mọi từ' },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const alpha = big ? 'abcdefgh' : 'abc';
      const words = distinctWords(big ? 10000 : Math.min(n, 6), big ? 10 : 4, alpha, r);
      const ops = ['Autocomplete'];
      const args: any[][] = [[words, words.map(() => r.int(1, big ? 100 : 5))]];
      for (let i = 0; i < Math.max(1, n); i++) {
        const op = r.pick(['add', 'top3', 'top3']);
        ops.push(op);
        const w = words.length && r.bool(0.5) ? r.pick(words) : r.string(r.int(1, big ? 10 : 4), alpha);
        args.push([op === 'top3' ? w.slice(0, r.int(0, w.length)) : w]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 800 },
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
      query(ch: string) {
        this.s += ch;
        return this.w.some((x) => this.s.endsWith(x));
      }
    },
    cases: [
      {
        args: [['StreamChecker', ...'abcdefghijkl'.split('').map(() => 'query')], [[['cd', 'f', 'kl']], ...'abcdefghijkl'.split('').map((c) => [c])]],
        expected: [null, false, false, false, true, false, true, false, false, false, false, false, true],
      },
      { args: [['StreamChecker', 'query', 'query', 'query'], [[['aa']], ['a'], ['a'], ['a']]], expected: [null, false, true, true], note: 'chồng lấn' },
      { args: [['StreamChecker', 'query'], [[['abc']], ['c']]], expected: [null, false] },
    ],
    gen: (n, r) => {
      const big = n > 1000;
      const alpha = big ? 'abc' : 'ab';
      const words = distinctWords(big ? 2000 : Math.min(n, 5), big ? 30 : 4, alpha, r);
      const ops = ['StreamChecker'];
      const args: any[][] = [[words]];
      for (let i = 0; i < Math.max(1, n); i++) {
        ops.push('query');
        args.push([r.pick([...alpha])]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 400 },
  },
};
