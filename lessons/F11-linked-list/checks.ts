import type { Spec } from '../../tools/spec.ts';
import { listToArray, type ListNode, type Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

const arr = (h: ListNode | null) => listToArray(h);
/** brute cho bài list: chuyển sang mảng, xử lý, trả mảng (bộ chấm so dạng mảng nên trả mảng là đủ). */
const cycleGen = (n: number, r: Rng) => ({ vals: r.array(n, -9, 9), pos: n && r.bool(0.5) ? r.int(0, n - 1) : -1 });
/** Duyệt list có thể có chu trình: trả về [số node khác nhau, chỉ số đầu vòng] bằng Map (hiển nhiên đúng). */
const walk = (head: ListNode | null) => {
  const seen = new Map<ListNode, number>();
  let i = 0;
  for (let p = head; p; p = p.next, i++) {
    if (seen.has(p)) return seen.get(p)!;
    seen.set(p, i);
  }
  return -1;
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'ListNode reverseList(ListNode head)',
    title: 'Đảo ngược danh sách',
    ref: S.reverseList,
    brute: (h: ListNode | null) => arr(h).reverse(),
    cases: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1] },
      { args: [Array.from({ length: 100_000 }, (_, i) => i % 10)], note: '10⁵ node — đệ quy tràn stack' },
    ],
    gen: (n, r) => [r.array(n, -9, 9)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '02': {
    sig: 'ListNode middleNode(ListNode head)',
    title: 'Node giữa',
    ref: S.middleNode,
    brute: (h: ListNode | null) => {
      const a = arr(h);
      return a.slice(Math.floor(a.length / 2));
    },
    cases: [
      { args: [[1, 2, 3, 4, 5]], expected: [3, 4, 5] },
      { args: [[1, 2, 3, 4, 5, 6]], expected: [4, 5, 6] },
      { args: [[1]], expected: [1] },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), -9, 9)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '03': {
    sig: 'boolean hasCycle(ListNode head)',
    title: 'Có chu trình không?',
    ref: S.hasCycle,
    brute: (h: ListNode | null) => walk(h) !== -1,
    cases: [
      { args: [{ vals: [3, 2, 0, -4], pos: 1 }], expected: true },
      { args: [{ vals: [1, 2], pos: 0 }], expected: true },
      { args: [{ vals: [1], pos: -1 }], expected: false },
      { args: [[]], expected: false },
      { args: [{ vals: [1], pos: 0 }], expected: true, note: 'node tự trỏ vào chính nó' },
    ],
    gen: (n, r) => [cycleGen(n, r)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '04': {
    sig: 'ListNode mergeTwoLists(ListNode l1, ListNode l2)',
    title: 'Trộn hai danh sách đã sort',
    ref: S.mergeTwoLists,
    brute: (a: ListNode | null, b: ListNode | null) => [...arr(a), ...arr(b)].sort((x, y) => x - y),
    cases: [
      { args: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
      { args: [[], [0]], expected: [0] },
      { args: [[], []], expected: [] },
    ],
    gen: (n, r) => [r.sorted(r.int(0, n), -9, 9), r.sorted(r.int(0, n), -9, 9)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '05': {
    sig: 'ListNode removeNthFromEnd(ListNode head, int n)',
    title: 'Xóa node thứ n từ cuối',
    ref: S.removeNthFromEnd,
    brute: (h: ListNode | null, n: number) => {
      const a = arr(h);
      a.splice(a.length - n, 1);
      return a;
    },
    cases: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
      { args: [[1], 1], expected: [] },
      { args: [[1, 2], 2], expected: [2], note: 'xóa chính head' },
      { args: [[1, 2], 1], expected: [1] },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      return [r.array(len, 0, 9), r.int(1, len)];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '06': {
    sig: 'boolean isPalindromeList(ListNode head)',
    title: 'Danh sách đối xứng',
    ref: S.isPalindromeList,
    brute: (h: ListNode | null) => {
      const a = arr(h);
      return a.join() === a.slice().reverse().join();
    },
    cases: [
      { args: [[1, 2, 2, 1]], expected: true },
      { args: [[1, 2]], expected: false },
      { args: [[1, 2, 3, 2, 1]], expected: true },
      { args: [[7]], expected: true },
    ],
    gen: (n, r) => {
      const half = r.array(Math.floor(Math.max(1, n) / 2), 0, 2);
      const mid = n % 2 ? [r.int(0, 2)] : [];
      return [r.bool(0.5) ? [...half, ...mid, ...half.slice().reverse()] : r.array(Math.max(1, n), 0, 2)].map((a) => (a.length ? a : [1]));
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '07': {
    sig: 'int detectCycleStart(ListNode head)',
    title: 'Điểm bắt đầu chu trình',
    ref: S.detectCycleStart,
    brute: walk,
    cases: [
      { args: [{ vals: [3, 2, 0, -4], pos: 1 }], expected: 1 },
      { args: [{ vals: [1, 2], pos: 0 }], expected: 0 },
      { args: [{ vals: [1], pos: -1 }], expected: -1 },
      { args: [[]], expected: -1 },
    ],
    gen: (n, r) => [cycleGen(n, r)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '08': {
    sig: 'ListNode addTwoNumbers(ListNode l1, ListNode l2)',
    title: 'Cộng hai số dạng danh sách',
    ref: S.addTwoNumbers,
    brute: (a: ListNode | null, b: ListNode | null) => {
      const num = (h: ListNode | null) => BigInt(arr(h).reverse().join('') || '0');
      return [...(num(a) + num(b)).toString()].reverse().map(Number);
    },
    cases: [
      { args: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
      { args: [[0], [0]], expected: [0] },
      { args: [[9, 9, 9, 9], [9, 9]], expected: [8, 9, 0, 0, 1] },
    ],
    gen: (n, r) => {
      const num = (len: number) => {
        const d = r.array(len, 0, 9);
        if (len > 1 && d[len - 1] === 0) d[len - 1] = r.int(1, 9);
        return d;
      };
      return [num(Math.max(1, n)), num(r.int(1, Math.max(1, n)))];
    },
    perf: { n: 1e5, limitMs: 50 },
  },
  '09': {
    sig: 'ListNode mergeKLists(ListNode[] lists)',
    title: 'Gộp k luồng sự kiện',
    ref: S.mergeKLists,
    brute: (lists: (ListNode | null)[]) => lists.flatMap(arr).sort((a, b) => a - b),
    cases: [
      { args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6] },
      { args: [[]], expected: [] },
      { args: [[[]]], expected: [] },
      { args: [[[], [1], []]], expected: [1] },
    ],
    gen: (n, r) => {
      // perf: N = n node chia cho k = n/10 danh sách → trộn dồn O(N·k) ≈ 10⁹
      const k = n > 1000 ? Math.floor(n / 10) : r.int(0, 6);
      const lists: number[][] = Array.from({ length: k }, () => []);
      if (k) for (let i = 0; i < n; i++) lists[r.int(0, k - 1)].push(r.int(0, 1000));
      return [lists.map((l) => l.sort((a, b) => a - b))];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
  '10': {
    sig: 'class BrowserHistory {\n  BrowserHistory(String homepage)\n  void visit(String url)\n  String back(int steps)\n  String forward(int steps)\n}',
    title: 'Lịch sử trình duyệt',
    ref: S.BrowserHistory,
    brute: class {
      h: string[];
      cur = 0;
      constructor(home: string) {
        this.h = [home];
      }
      visit(url: string) {
        this.h = this.h.slice(0, this.cur + 1);
        this.h.push(url);
        this.cur++;
      }
      back(s: number) {
        this.cur = Math.max(0, this.cur - s);
        return this.h[this.cur];
      }
      forward(s: number) {
        this.cur = Math.min(this.h.length - 1, this.cur + s);
        return this.h[this.cur];
      }
    },
    cases: [
      {
        args: [
          ['BrowserHistory', 'visit', 'visit', 'back', 'back', 'forward', 'visit', 'forward', 'back'],
          [['a'], ['b'], ['c'], [1], [5], [1], ['d'], [2], [2]],
        ],
        expected: [null, null, null, 'b', 'a', 'b', null, 'd', 'a'],
      },
    ],
    gen: (n, r) => {
      const ops = ['BrowserHistory'];
      const args: any[][] = [['home']];
      for (let i = 0; i < Math.max(1, n); i++) {
        const op = r.pick(['visit', 'visit', 'back', 'forward']);
        ops.push(op);
        args.push(op === 'visit' ? [`u${i}`] : [r.int(1, n > 1000 ? 100 : 4)]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 100 },
  },
};
