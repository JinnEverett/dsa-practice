import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const asc = (a: number[]) => a.slice().sort((x, y) => x - y);
const sameMultiset = (a: number[], b: number[]) => a.length === b.length && asc(a).every((v, i) => v === asc(b)[i]);

/** Có hoán vị nào của `a` thỏa a0 < a1 > a2 < a3 ... không? (vét cạn, chỉ dùng cho n nhỏ) */
function hasWiggle(a: number[]): boolean {
  const used = new Array(a.length).fill(false);
  const cur: number[] = [];
  const dfs = (): boolean => {
    if (cur.length === a.length) return true;
    for (let i = 0; i < a.length; i++) {
      if (used[i]) continue;
      const k = cur.length;
      if (k > 0 && (k % 2 === 1 ? !(cur[k - 1] < a[i]) : !(cur[k - 1] > a[i]))) continue;
      used[i] = true;
      cur.push(a[i]);
      if (dfs()) return true;
      cur.pop();
      used[i] = false;
    }
    return false;
  };
  return dfs();
}

/** Mảng n phần tử trong [1, V] CHẮC CHẮN tồn tại nghiệm wiggle II (n nhỏ: kiểm bằng vét cạn; n lớn: V đủ lớn để mọi giá trị xuất hiện ≤ n/2 lần). */
function wiggleable(r: Rng, n: number, V: number): number[] {
  for (;;) {
    const a = r.array(n, 1, V);
    if (n > 8) return a;
    if (hasWiggle(a)) return a;
  }
}

const isWiggle = (a: number[]): boolean => a.every((x, i) => i + 1 >= a.length || (i % 2 === 0 ? x < a[i + 1] : x > a[i + 1]));

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int quickSelect(int[] nums, int k)',
    title: 'Phần tử nhỏ thứ k (quickselect)',
    ref: S.quickSelect,
    brute: (nums: number[], k: number): number => asc(nums)[k - 1],
    cases: [
      { args: [[3, 2, 1, 5, 6, 4], 2], expected: 2 },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 3 },
      { args: [[7], 1], expected: 7 },
      { args: [[-5, -1, -3], 3], expected: -1 },
      { args: [new Array(20000).fill(5), 10000], expected: 5, note: 'toàn giá trị bằng nhau: partition 2-way là O(n²)' },
    ],
    gen: (n, r) => {
      if (n >= 1e5) return [r.array(n, 0, 2), n >> 1]; // chỉ 3 giá trị khác nhau ⇒ trùng cực nhiều
      const len = Math.max(1, Math.min(n, 12));
      return [r.array(len, -5, 5), r.int(1, len)];
    },
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 100 },
  },
  '02': {
    sig: 'void wiggleSortII(int[] nums)',
    title: 'Wiggle sort II',
    ref: S.wiggleSortII,
    brute: (nums: number[]) => nums.sort((a, b) => a - b), // chỉ để có "expected"; việc chấm do compare
    output: 'arg0',
    compare: (got, _expected, [orig]) => {
      if (!Array.isArray(got) || got.length !== orig.length) return 'sai độ dài';
      if (!sameMultiset(got, orig)) return 'kết quả không phải hoán vị của đầu vào';
      for (let i = 0; i + 1 < got.length; i++) {
        if (i % 2 === 0 ? !(got[i] < got[i + 1]) : !(got[i] > got[i + 1])) return `vi phạm nums[${i}] ${i % 2 === 0 ? '<' : '>'} nums[${i + 1}]`;
      }
      return true;
    },
    cases: [
      { args: [[1, 5, 1, 1, 6, 4]], expected: [1, 6, 1, 5, 1, 4] },
      { args: [[1, 3, 2, 2, 3, 1]], expected: [2, 3, 1, 3, 1, 2] },
      { args: [[1]], expected: [1] },
      { args: [[2, 1]], expected: [1, 2] },
      { args: [[4, 5, 5, 6]], expected: [5, 6, 4, 5], note: 'duyệt hai nửa theo chiều tăng sẽ đặt hai số 5 cạnh nhau' },
    ],
    gen: (n, r) => [wiggleable(r, Math.max(1, n >= 1e5 ? n : Math.min(n, 8)), n >= 1e5 ? 5000 : 6)],
    stress: { minN: 1 },
    perf: { n: 1e5, limitMs: 150 },
  },
  '03': {
    sig: 'class DynamicArray {\n  DynamicArray()\n  void push(int x)\n  int pop()\n  int get(int i)\n  int capacity()\n}',
    title: 'Dynamic array tự cài',
    ref: S.DynamicArray,
    brute: class {
      a: number[] = [];
      cap = 1;
      push(x: number) {
        if (this.a.length === this.cap) this.cap *= 2;
        this.a.push(x);
      }
      pop() {
        const x = this.a.pop()!;
        if (this.cap > 1 && this.a.length * 4 <= this.cap) this.cap /= 2;
        return x;
      }
      get(i: number) {
        return this.a[i];
      }
      capacity() {
        return this.cap;
      }
    },
    cases: [
      {
        args: [
          ['DynamicArray', 'capacity', 'push', 'capacity', 'push', 'capacity', 'push', 'capacity', 'get', 'pop', 'capacity', 'pop', 'capacity', 'pop', 'capacity'],
          [[], [], [10], [], [20], [], [30], [], [1], [], [], [], [], [], []],
        ],
        expected: [null, 1, null, 1, null, 2, null, 4, 20, 30, 4, 20, 2, 10, 1],
      },
      {
        args: [
          ['DynamicArray', 'push', 'push', 'push', 'push', 'push', 'capacity', 'pop', 'pop', 'pop', 'capacity', 'pop', 'capacity'],
          [[], [1], [2], [3], [4], [5], [], [], [], [], [], [], []],
        ],
        expected: [null, null, null, null, null, null, 8, 5, 4, 3, 4, 2, 2],
        note: 'pop lần ba: size 2 · 4 = 8 ≤ capacity 8 ⇒ co còn 4; pop lần bốn: 1 · 4 ≤ 4 ⇒ co còn 2',
      },
    ],
    gen: (n, r) => {
      const ops = ['DynamicArray'];
      const args: any[][] = [[]];
      let size = 0;
      const total = Math.max(1, n);
      for (let i = 0; i < total; i++) {
        let op: string;
        if (n >= 3e5) op = i < (total * 2) / 3 ? 'push' : size > 0 ? r.pick(['pop', 'pop', 'get']) : 'push'; // tăng rồi giảm: ép cả giãn lẫn co
        else op = size === 0 ? 'push' : r.pick(['push', 'push', 'pop', 'get', 'capacity']);
        ops.push(op);
        if (op === 'push') {
          size++;
          args.push([r.int(-1_000_000_000, 1_000_000_000)]);
        } else if (op === 'pop') {
          size--;
          args.push([]);
        } else if (op === 'get') args.push([r.int(0, size - 1)]);
        else args.push([]);
      }
      return [ops, args];
    },
    stress: { minN: 1 },
    perf: { n: 3e5, limitMs: 150 },
  },
  '04': {
    sig: 'class RandomizedSet {\n  RandomizedSet()\n  boolean insert(int val)\n  boolean remove(int val)\n  int getRandom()\n}',
    title: 'RandomizedSet O(1)',
    ref: S.RandomizedSet,
    brute: class {
      a: number[] = [];
      insert(v: number) {
        if (this.a.includes(v)) return false;
        this.a.push(v);
        return true;
      }
      remove(v: number) {
        const i = this.a.indexOf(v);
        if (i < 0) return false;
        this.a.splice(i, 1);
        return true;
      }
      getRandom() {
        return this.a[0];
      }
    },
    // getRandom ngẫu nhiên ⇒ chấm bằng mô phỏng: insert/remove đúng, getRandom thuộc tập hiện tại, và không phải luôn trả cùng một giá trị
    compare: (got, _expected, [ops, opArgs]) => {
      const set = new Set<number>();
      const seen = new Set<number>();
      let multi = 0;
      for (let i = 1; i < ops.length; i++) {
        const x = opArgs[i]?.[0];
        if (ops[i] === 'insert') {
          const want = !set.has(x);
          set.add(x);
          if (got[i] !== want) return `thao tác #${i} insert(${x}): cần ${want}`;
        } else if (ops[i] === 'remove') {
          const want = set.delete(x);
          if (got[i] !== want) return `thao tác #${i} remove(${x}): cần ${want}`;
        } else {
          if (!set.has(got[i])) return `thao tác #${i} getRandom() trả ${got[i]} không thuộc tập hiện tại`;
          if (set.size >= 2) (multi++, seen.add(got[i]));
        }
      }
      return multi < 100 || seen.size > 1 || 'getRandom luôn trả cùng một giá trị dù tập có ≥ 2 phần tử (không ngẫu nhiên)';
    },
    cases: [
      { args: [['RandomizedSet', 'insert', 'remove', 'insert', 'getRandom', 'remove', 'insert', 'getRandom'], [[], [1], [2], [2], [], [1], [2], []]], expected: [null, true, false, true, 2, true, false, 2] },
      { args: [['RandomizedSet', 'insert', 'insert', 'remove', 'insert', 'getRandom'], [[], [5], [5], [5], [6], []]], expected: [null, true, false, true, true, 6], note: 'xóa rồi thêm lại; getRandom chỉ có thể trả 6' },
      {
        args: [['RandomizedSet', 'insert', 'insert', 'insert', ...new Array(300).fill('getRandom')], [[], [1], [2], [3], ...new Array(300).fill([])]],
        expected: [null, true, true, true, ...new Array(300).fill(1)],
        note: '300 lần getRandom trên tập {1,2,3}: hàm luôn trả cùng một giá trị bị bắt',
      },
    ],
    gen: (n, r) => {
      const ops = ['RandomizedSet'];
      const args: any[][] = [[]];
      const big = n >= 2e5;
      const size = new Set<number>();
      for (let i = 0; i < Math.max(1, n); i++) {
        let op = r.pick(['insert', 'insert', 'remove', 'getRandom']);
        if (big && i < n / 2) op = 'insert'; // nửa đầu: nhồi 10⁵ phần tử để remove O(n) trở nên đắt
        if (op === 'getRandom' && size.size === 0) op = 'insert';
        const v = big ? r.int(0, 10_000_000) : r.int(0, 6);
        ops.push(op);
        if (op === 'insert') (size.add(v), args.push([v]));
        else if (op === 'remove') {
          const target = big && size.size ? [...size][0] : v; // remove giá trị có thật
          size.delete(target);
          args.push([target]);
        } else args.push([]);
      }
      return [ops, args];
    },
    stress: { minN: 1 },
    perf: { n: 2e5, limitMs: 1000 },
  },
  '05': {
    sig: 'class Skiplist {\n  Skiplist()\n  boolean search(int target)\n  void add(int num)\n  boolean erase(int num)\n}',
    title: 'Skip list',
    ref: S.Skiplist,
    brute: class {
      a: number[] = [];
      search(t: number) {
        return this.a.includes(t);
      }
      add(x: number) {
        this.a.push(x);
      }
      erase(x: number) {
        const i = this.a.indexOf(x);
        if (i < 0) return false;
        this.a.splice(i, 1);
        return true;
      }
    },
    cases: [
      {
        args: [['Skiplist', 'add', 'add', 'add', 'search', 'add', 'search', 'erase', 'erase', 'search'], [[], [1], [2], [3], [0], [4], [1], [0], [1], [1]]],
        expected: [null, null, null, null, false, null, true, false, true, false],
      },
      { args: [['Skiplist', 'add', 'add', 'erase', 'search', 'erase', 'search'], [[], [5], [5], [5], [5], [5], [5]]], expected: [null, null, null, true, true, true, false], note: 'cho phép trùng: mỗi erase bỏ một bản' },
    ],
    gen: (n, r) => {
      const ops = ['Skiplist'];
      const args: any[][] = [[]];
      const R = n >= 1e5 ? 1_000_000 : 8;
      for (let i = 0; i < Math.max(1, n); i++) {
        const op = r.pick(['add', 'search', 'erase', 'add']);
        ops.push(op);
        args.push([r.int(0, R)]);
      }
      return [ops, args];
    },
    stress: { minN: 1 },
    perf: { n: 150000, limitMs: 1000 },
  },
  '06': {
    sig: 'int[] reservoirSample(int[] stream, int k, int seed)',
    title: 'Reservoir sampling (RNG đặc tả)',
    ref: S.reservoirSample,
    brute: (stream: number[], k: number, seed: number): number[] => {
      // mô phỏng đề bằng BigInt (không phụ thuộc giả định về độ chính xác của Number)
      const res = stream.slice(0, k);
      let state = BigInt(seed);
      for (let i = k; i < stream.length; i++) {
        state = (state * 48271n) % 2147483647n;
        const j = Number(state % BigInt(i + 1));
        if (j < k) res[j] = stream[i];
      }
      return res;
    },
    cases: [
      { args: [[10, 20, 30], 1, 1], expected: [30] },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, 42], expected: [1, 2, 8] },
      { args: [[5, 6], 2, 7], expected: [5, 6], note: 'k = n: giữ nguyên' },
      { args: [[7, 8, 9], 3, 123456], expected: [7, 8, 9] },
    ],
    gen: (n, r) => {
      if (n >= 1e6) return [r.array(n, -1_000_000_000, 1_000_000_000), 1000, 2147483646];
      const len = Math.max(1, Math.min(n, 14));
      return [r.array(len, 0, 99), r.int(1, len), r.int(1, 2147483646)];
    },
    stress: { minN: 1 },
    perf: { n: 1e6, limitMs: 200 },
  },
  '07': {
    sig: 'int[] topKQuickselect(int[] nums, int k)',
    title: 'k phần tử lớn nhất bằng quickselect',
    ref: S.topKQuickselect,
    brute: (nums: number[], k: number): number[] => asc(nums).slice(nums.length - k),
    compare: (got, expected) => (Array.isArray(got) && sameMultiset(got, expected)) || 'không phải đúng k phần tử lớn nhất (thứ tự tùy ý, giữ phần tử trùng)',
    cases: [
      { args: [[3, 2, 1, 5, 6, 4], 2], expected: [5, 6] },
      { args: [[1, 1, 1, 2, 2], 3], expected: [1, 2, 2], note: 'ranh giới có giá trị trùng' },
      { args: [[9], 1], expected: [9] },
      { args: [[4, -1, 7], 3], expected: [-1, 4, 7] },
    ],
    gen: (n, r) => {
      if (n >= 1e6) return [r.array(n, -1_000_000_000, 1_000_000_000), n >> 1];
      const len = Math.max(1, Math.min(n, 12));
      return [r.array(len, -4, 4), r.int(1, len)];
    },
    stress: { minN: 1 },
    perf: { n: 1e6, limitMs: 400 },
  },
  '08': {
    sig: 'String reorganizeString(String s)',
    title: '🔴 Xếp playlist không hai bài cùng nghệ sĩ liền nhau',
    ref: S.reorganizeString,
    brute: (s: string): string => {
      // vét cạn hoán vị (n ≤ 8): trả về một cách xếp hợp lệ hoặc ""
      const n = s.length;
      const used = new Array(n).fill(false);
      const cur: string[] = [];
      const dfs = (): boolean => {
        if (cur.length === n) return true;
        for (let i = 0; i < n; i++) {
          if (used[i] || (cur.length && cur[cur.length - 1] === s[i])) continue;
          used[i] = true;
          cur.push(s[i]);
          if (dfs()) return true;
          cur.pop();
          used[i] = false;
        }
        return false;
      };
      return dfs() ? cur.join('') : '';
    },
    compare: (got, expected, [s]) => {
      if (typeof got !== 'string') return 'cần trả về chuỗi';
      if (expected === '') return got === '' || 'không thể xếp ⇒ phải trả ""';
      if (got === '') return 'có thể xếp được nhưng bạn trả ""';
      if (got.length !== s.length) return `độ dài ${got.length}, cần ${s.length}`;
      const cnt = new Array(26).fill(0);
      for (let i = 0; i < s.length; i++) (cnt[s.charCodeAt(i) - 97]++, cnt[got.charCodeAt(i) - 97]--);
      if (cnt.some((c) => c !== 0)) return 'không phải hoán vị của chuỗi gốc';
      for (let i = 1; i < got.length; i++) if (got[i] === got[i - 1]) return `vị trí ${i - 1},${i} cùng ký tự "${got[i]}"`;
      return true;
    },
    cases: [
      { args: ['aab'], expected: 'aba' },
      { args: ['aaab'], expected: '' },
      { args: ['a'], expected: 'a' },
      { args: ['ab'], expected: 'ab' },
      { args: ['aabbcc'], expected: 'abcabc' },
      { args: ['aaabb'], expected: 'ababa', note: 'tần suất lớn nhất đúng bằng ⌈n/2⌉' },
      { args: ['aaaabb'], expected: '', note: '4 > ⌈6/2⌉' },
      { args: ['a'.repeat(250000) + 'b'.repeat(250000)], expected: 'ab'.repeat(250000), note: 'n = 5·10⁵, hai ký tự' },
    ],
    gen: (n, r) => {
      if (n >= 5e5) {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        return [r.string(n, letters)];
      }
      return [r.string(r.int(1, 8), 'abc')];
    },
    stress: { minN: 1 },
    perf: { n: 5e5, limitMs: 200 },
  },
};
