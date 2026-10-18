import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import { posix } from 'node:path';
import * as S from './solutions.ts';

/** Sinh chuỗi thao tác ngẫu nhiên cho bài class; pick(state) trả [op, args] hợp lệ với trạng thái giả lập. */
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

const parenGen = (n: number, r: Rng) => {
  if (r.bool(0.5)) return r.string(Math.max(1, n), '()[]{}');
  // sinh chuỗi hợp lệ
  let s = '';
  const st: string[] = [];
  for (let i = 0; i < Math.max(1, n); i++) {
    if (st.length && r.bool(0.5)) s += st.pop();
    else {
      const [o, c] = r.pick([['(', ')'], ['[', ']'], ['{', '}']]);
      s += o;
      st.push(c);
    }
  }
  return s + st.reverse().join('');
};

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'boolean isValid(String s)',
    title: 'Ngoặc hợp lệ',
    ref: S.isValid,
    brute: (s: string) => {
      let prev = '';
      while (prev !== s) {
        prev = s;
        s = s.replace(/\(\)|\[\]|\{\}/g, '');
      }
      return s === '';
    },
    cases: [
      { args: ['()[]{}'], expected: true },
      { args: ['(]'], expected: false },
      { args: ['([)]'], expected: false },
      { args: ['{[]}'], expected: true },
      { args: [']'], expected: false },
      { args: ['(('], expected: false },
    ],
    gen: (n, r) => [parenGen(n, r)],
    perf: { n: 1e5, limitMs: 50 },
  },
  '02': {
    sig: 'class MinStack {\n  MinStack()\n  void push(int val)\n  void pop()\n  int top()\n  int getMin()\n}',
    title: 'Min stack',
    ref: S.MinStack,
    brute: class {
      a: number[] = [];
      push(v: number) {
        this.a.push(v);
      }
      pop() {
        this.a.pop();
      }
      top() {
        return this.a[this.a.length - 1];
      }
      getMin() {
        return Math.min(...this.a);
      }
    },
    cases: [
      {
        args: [['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'], [[], [-2], [0], [-3], [], [], [], []]],
        expected: [null, null, null, null, -3, null, 0, -2],
      },
      { args: [['MinStack', 'push', 'push', 'getMin', 'pop', 'getMin'], [[], [2147483647], [-2147483648], [], [], []]], expected: [null, null, null, -2147483648, null, 2147483647] },
    ],
    gen: (n, r) => {
      let size = 0;
      return opsGen('MinStack', [], Math.max(1, n), () => {
        const op = size === 0 ? 'push' : r.pick(['push', 'push', 'pop', 'top', 'getMin']);
        if (op === 'push') size++;
        if (op === 'pop') size--;
        return [op, op === 'push' ? [r.int(-50, 50)] : []];
      });
    },
    // getMin của bản ngây thơ là O(n) → stack lớn + nhiều getMin sẽ chậm
    perf: { n: 1e5, limitMs: 100 },
  },
  '03': {
    sig: 'int evalRPN(String[] tokens)',
    title: 'Tính biểu thức hậu tố (RPN)',
    ref: S.evalRPN,
    brute: (tokens: string[]) => {
      const toks = tokens.slice();
      // thu gọn lặp: tìm "a b op" đầu tiên
      for (;;) {
        const k = toks.findIndex((t, i) => i >= 2 && ['+', '-', '*', '/'].includes(t) && !['+', '-', '*', '/'].includes(toks[i - 1]) && !['+', '-', '*', '/'].includes(toks[i - 2]));
        if (k < 0) break;
        const a = Number(toks[k - 2]);
        const b = Number(toks[k - 1]);
        const v = toks[k] === '+' ? a + b : toks[k] === '-' ? a - b : toks[k] === '*' ? a * b : Math.trunc(a / b);
        toks.splice(k - 2, 3, String(v + 0));
      }
      return Number(toks[0]);
    },
    cases: [
      { args: [['2', '1', '+', '3', '*']], expected: 9 },
      { args: [['4', '13', '5', '/', '+']], expected: 6 },
      { args: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], expected: 22 },
      { args: [['-7', '2', '/']], expected: -3, note: 'làm tròn về 0' },
      { args: [['5']], expected: 5 },
    ],
    gen: (n, r) => {
      const toks: string[] = [String(r.int(-9, 9))];
      let depth = 1;
      for (let i = 0; i < Math.min(n, 12); i++) {
        if (depth >= 2 && r.bool(0.5)) {
          const op = r.pick(['+', '-', '*', '/']);
          if (op === '/') {
            // bảo đảm số chia khác 0: thay bằng phép cộng nếu không chắc
            toks.push('+');
          } else toks.push(op);
          depth--;
        } else {
          toks.push(String(r.int(-9, 9)));
          depth++;
        }
      }
      while (depth > 1) {
        toks.push(r.pick(['+', '-', '*']));
        depth--;
      }
      // chèn vài phép chia an toàn: "x d /" với d ≠ 0
      if (r.bool(0.5)) toks.push(String(r.pick([-3, -2, 2, 3, 7])), '/');
      return [toks];
    },
    perf: false,
  },
  '04': {
    sig: 'class MyQueue {\n  MyQueue()\n  void push(int x)\n  int pop()\n  int peek()\n  boolean empty()\n}',
    title: 'Queue bằng hai stack',
    ref: S.MyQueue,
    brute: class {
      a: number[] = [];
      push(x: number) {
        this.a.push(x);
      }
      pop() {
        return this.a.shift();
      }
      peek() {
        return this.a[0];
      }
      empty() {
        return this.a.length === 0;
      }
    },
    cases: [
      { args: [['MyQueue', 'push', 'push', 'peek', 'pop', 'empty'], [[], [1], [2], [], [], []]], expected: [null, null, null, 1, 1, false] },
      { args: [['MyQueue', 'empty', 'push', 'pop', 'empty'], [[], [], [5], [], []]], expected: [null, true, null, 5, true] },
    ],
    gen: (n, r) => {
      let size = 0;
      return opsGen('MyQueue', [], Math.max(1, n), () => {
        const op = size === 0 ? r.pick(['push', 'empty']) : r.pick(['push', 'push', 'pop', 'peek', 'empty']);
        if (op === 'push') size++;
        if (op === 'pop') size--;
        return [op, op === 'push' ? [r.int(0, 99)] : []];
      });
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '05': {
    sig: 'String simplifyPath(String path)',
    title: 'Rút gọn đường dẫn Unix',
    ref: S.simplifyPath,
    // path.posix.normalize của Node xử lý '.', '..', '//' theo chuẩn POSIX — nguồn đối chiếu độc lập
    brute: (p: string) => {
      const s = posix.normalize(p);
      return s.length > 1 && s.endsWith('/') ? s.slice(0, -1) : s;
    },
    cases: [
      { args: ['/home/'], expected: '/home' },
      { args: ['/home//foo/'], expected: '/home/foo' },
      { args: ['/a/./b/../../c/'], expected: '/c' },
      { args: ['/../'], expected: '/' },
      { args: ['/.../a/../b/'], expected: '/.../b' },
      { args: ['/'], expected: '/' },
    ],
    gen: (n, r) => ['/' + Array.from({ length: Math.min(n, 10) }, () => r.pick(['a', 'b', '.', '..', '', '...', 'x'])).join('/')],
    perf: false,
  },
  '06': {
    sig: 'class RecentCounter {\n  RecentCounter()\n  int ping(int t)\n}',
    title: 'Bộ đếm request gần đây',
    ref: S.RecentCounter,
    brute: class {
      ts: number[] = [];
      ping(t: number) {
        this.ts.push(t);
        return this.ts.filter((x) => x >= t - 3000).length;
      }
    },
    cases: [{ args: [['RecentCounter', 'ping', 'ping', 'ping', 'ping'], [[], [1], [100], [3001], [3002]]], expected: [null, 1, 2, 3, 3] }],
    gen: (n, r) => {
      let t = 0;
      // perf: t tăng 1 → cửa sổ luôn có ~3000 phần tử → shift()/pop(0) tốn ~3000 bước mỗi lần
      return opsGen('RecentCounter', [], Math.max(1, n), () => ['ping', [(t += n > 1000 ? 1 : r.int(1, 2000))]]);
    },
    perf: { n: 1e5, limitMs: 60 },
  },
  '07': {
    sig: 'class CircularQueue {\n  CircularQueue(int k)\n  boolean enQueue(int value)\n  boolean deQueue()\n  int front()\n  int rear()\n  boolean isEmpty()\n  boolean isFull()\n}',
    title: 'Hàng đợi vòng',
    ref: S.CircularQueue,
    brute: class {
      a: number[] = [];
      k: number;
      constructor(k: number) {
        this.k = k;
      }
      enQueue(v: number) {
        if (this.a.length === this.k) return false;
        this.a.push(v);
        return true;
      }
      deQueue() {
        if (!this.a.length) return false;
        this.a.shift();
        return true;
      }
      front() {
        return this.a.length ? this.a[0] : -1;
      }
      rear() {
        return this.a.length ? this.a[this.a.length - 1] : -1;
      }
      isEmpty() {
        return this.a.length === 0;
      }
      isFull() {
        return this.a.length === this.k;
      }
    },
    cases: [
      {
        args: [
          ['CircularQueue', 'enQueue', 'enQueue', 'enQueue', 'enQueue', 'rear', 'isFull', 'deQueue', 'enQueue', 'rear'],
          [[3], [1], [2], [3], [4], [], [], [], [4], []],
        ],
        expected: [null, true, true, true, false, 3, true, true, true, 4],
      },
      { args: [['CircularQueue', 'front', 'rear', 'deQueue', 'isEmpty'], [[1], [], [], [], []]], expected: [null, -1, -1, false, true] },
    ],
    gen: (n, r) => {
      const k = r.int(1, n > 1000 ? 1000 : 4);
      return opsGen('CircularQueue', [k], Math.max(1, n), () => {
        const op = r.pick(['enQueue', 'enQueue', 'deQueue', 'front', 'rear', 'isEmpty', 'isFull']);
        return [op, op === 'enQueue' ? [r.int(0, 1000)] : []];
      });
    },
    perf: { n: 1e5, limitMs: 100 },
  },
  '08': {
    sig: 'int[] asteroidCollision(int[] asteroids)',
    title: 'Va chạm thiên thạch',
    ref: S.asteroidCollision,
    brute: (a: number[]) => {
      let cur = a.slice();
      for (;;) {
        const i = cur.findIndex((x, k) => k + 1 < cur.length && x > 0 && cur[k + 1] < 0);
        if (i < 0) return cur;
        const [x, y] = [cur[i], -cur[i + 1]];
        if (x > y) cur.splice(i + 1, 1);
        else if (x < y) cur.splice(i, 1);
        else cur.splice(i, 2);
        cur = cur.slice();
      }
    },
    cases: [
      { args: [[5, 10, -5]], expected: [5, 10] },
      { args: [[8, -8]], expected: [] },
      { args: [[10, 2, -5]], expected: [10] },
      { args: [[-2, -1, 1, 2]], expected: [-2, -1, 1, 2] },
      { args: [[1, -2, -2, -2]], expected: [-2, -2, -2] },
    ],
    gen: (n, r) => [Array.from({ length: Math.max(2, n) }, () => r.int(1, 6) * r.pick([1, -1]))],
    perf: { n: 10_000, limitMs: 30 },
  },
  '09': {
    sig: 'boolean validTags(String html)',
    title: 'Thẻ HTML lồng đúng',
    ref: S.validTags,
    brute: (html: string) => {
      // chỉ giữ chuỗi thẻ (bỏ văn bản và thẻ tự đóng), rồi xóa lặp các cặp <x></x> liền nhau
      let s = (html.match(/<\/?[a-z]+\/?>/g) ?? []).filter((t) => !t.endsWith('/>')).join('');
      let prev = '';
      while (prev !== s) {
        prev = s;
        s = s.replace(/<([a-z]+)><\/\1>/g, '');
      }
      return s === '';
    },
    cases: [
      { args: ['<a>xin <b>chào</b></a>'], expected: true },
      { args: ['<a><b></a></b>'], expected: false },
      { args: ['<br/>text'], expected: true },
      { args: ['<a>'], expected: false },
      { args: ['</a>'], expected: false },
      { args: [''], expected: true },
      { args: ['<ab><a></a></ab>'], expected: true },
    ],
    gen: (n, r) => {
      const parts: string[] = [];
      const st: string[] = [];
      for (let i = 0; i < Math.max(1, n); i++) {
        const x = r.int(0, 5);
        if (x === 0) parts.push(r.string(r.int(1, 3), 'xy '));
        else if (x === 1) parts.push(`<${r.pick(['a', 'b', 'br'])}/>`);
        else if (x <= 3 || !st.length) {
          const t = r.pick(['a', 'b', 'ab']);
          st.push(t);
          parts.push(`<${t}>`);
        } else parts.push(`</${r.bool(0.85) ? st.pop() : r.pick(['a', 'b'])}>`);
      }
      if (r.bool(0.6)) while (st.length) parts.push(`</${st.pop()}>`);
      return [parts.join('')];
    },
    perf: { n: 30_000, limitMs: 50 },
  },
  '10': {
    sig: 'String runEditor(String[] commands)',
    title: 'Trình soạn thảo có Undo',
    ref: S.runEditor,
    brute: (cmds: string[]) => {
      // snapshot toàn văn bản — hiển nhiên đúng, chậm
      const snaps: string[] = [];
      let text = '';
      for (const c of cmds) {
        if (c.startsWith('type ')) {
          snaps.push(text);
          text += c.slice(5);
        } else if (c.startsWith('delete ')) {
          snaps.push(text);
          text = text.slice(0, Math.max(0, text.length - Number(c.slice(7))));
        } else if (snaps.length) text = snaps.pop()!;
      }
      return text;
    },
    cases: [
      { args: [['type ab', 'type cd', 'delete 3', 'undo', 'undo']], expected: 'ab' },
      { args: [['type a', 'undo', 'undo']], expected: '' },
      { args: [[]], expected: '' },
      { args: [['type abc', 'delete 100', 'undo']], expected: 'abc', note: 'delete nhiều hơn độ dài' },
    ],
    gen: (n, r) => [
      Array.from({ length: n }, () => {
        const x = r.int(0, 3);
        return x <= 1 ? `type ${r.string(r.int(1, n > 1000 ? 10 : 3), 'abc')}` : x === 2 ? `delete ${r.int(1, n > 1000 ? 5 : 4)}` : 'undo';
      }),
    ],
    perf: { n: 1e5, limitMs: 400 },
  },
};
