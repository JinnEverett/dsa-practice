import type { Spec } from '../../tools/spec.ts';
import { genOps } from '../../tools/classgen.ts';
import * as S from './solutions.ts';

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class MaxStack {\n  MaxStack()\n  void push(int x)\n  int pop()\n  int top()\n  int peekMax()\n  int popMax()\n}',
    title: 'MaxStack',
    ref: S.MaxStack,
    brute: class {
      a: number[] = [];
      push(x: number) {
        this.a.push(x);
      }
      pop() {
        return this.a.pop();
      }
      top() {
        return this.a[this.a.length - 1];
      }
      peekMax() {
        return Math.max(...this.a);
      }
      popMax() {
        const m = Math.max(...this.a);
        const i = this.a.lastIndexOf(m);
        this.a.splice(i, 1);
        return m;
      }
    },
    cases: [
      {
        args: [['MaxStack', 'push', 'push', 'push', 'top', 'popMax', 'top', 'peekMax', 'pop', 'top'], [[], [5], [1], [5], [], [], [], [], [], []]],
        expected: [null, null, null, null, 5, 5, 1, 5, 1, 5],
        note: 'ví dụ LeetCode 716: popMax xóa số 5 trên cùng',
      },
      { args: [['MaxStack', 'push', 'push', 'popMax', 'popMax'], [[], [-2147483648], [2147483647], [], []]], expected: [null, null, null, 2147483647, -2147483648], note: 'biên int' },
      { args: [['MaxStack', 'push', 'push', 'push', 'popMax', 'popMax', 'top'], [[], [3], [3], [3], [], [], []]], expected: [null, null, null, null, 3, 3, 3], note: 'toàn giá trị bằng nhau' },
      { args: [['MaxStack', 'push', 'popMax', 'push', 'peekMax', 'top'], [[], [7], [], [8], [], []]], expected: [null, null, 7, null, 8, 8], note: 'rỗng rồi push lại' },
    ],
    gen: (n, r) => {
      let size = 0;
      const hi = n <= 200 ? 6 : 1_000_000;
      return genOps('MaxStack', [], Math.max(1, n), () => {
        const op = size === 0 ? 'push' : r.pick(['push', 'push', 'push', 'pop', 'top', 'peekMax', 'popMax']);
        if (op === 'push') size++;
        if (op === 'pop' || op === 'popMax') size--;
        return [op, op === 'push' ? [r.int(-hi, hi)] : []];
      });
    },
    stress: { maxN: 60 },
    // bản ngây thơ: peekMax/popMax quét cả stack → ~10⁵ × 3·10⁴ phần tử
    perf: { n: 1e5, limitMs: 200 },
  },
  '02': {
    sig: 'class FreqStack {\n  FreqStack()\n  void push(int val)\n  int pop()\n}',
    title: 'FreqStack (stack tần suất)',
    ref: S.FreqStack,
    brute: class {
      a: number[] = [];
      push(v: number) {
        this.a.push(v);
      }
      pop() {
        const cnt = new Map<number, number>();
        for (const v of this.a) cnt.set(v, (cnt.get(v) ?? 0) + 1);
        const best = Math.max(...cnt.values());
        for (let i = this.a.length - 1; i >= 0; i--) {
          if (cnt.get(this.a[i]) === best) return this.a.splice(i, 1)[0];
        }
      }
    },
    cases: [
      {
        args: [['FreqStack', 'push', 'push', 'push', 'push', 'push', 'push', 'pop', 'pop', 'pop', 'pop'], [[], [5], [7], [5], [7], [4], [5], [], [], [], []]],
        expected: [null, null, null, null, null, null, null, 5, 7, 5, 4],
        note: 'ví dụ LeetCode 895',
      },
      { args: [['FreqStack', 'push', 'push', 'pop', 'pop'], [[], [1], [2], [], []]], expected: [null, null, null, 2, 1], note: 'cùng tần suất → gần nhất' },
      { args: [['FreqStack', 'push', 'push', 'push', 'pop', 'pop', 'pop'], [[], [9], [9], [9], [], [], []]], expected: [null, null, null, null, 9, 9, 9] },
    ],
    gen: (n, r) => {
      let size = 0;
      const hi = n <= 200 ? 4 : 50;
      return genOps('FreqStack', [], Math.max(1, n), () => {
        const op = size === 0 ? 'push' : r.pick(['push', 'push', 'pop']);
        size += op === 'push' ? 1 : -1;
        return [op, op === 'push' ? [r.int(0, hi)] : []];
      });
    },
    stress: { maxN: 60 },
    // bản ngây thơ: mỗi pop đếm lại cả stack O(n)
    perf: { n: 1e5, limitMs: 100 },
  },
};
