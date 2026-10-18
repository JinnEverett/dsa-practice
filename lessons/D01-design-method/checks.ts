import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Sinh chuỗi thao tác: step(i) trả [op, args] hợp lệ với trạng thái giả lập của người sinh. */
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

class NaiveMaxStack {
  a: number[] = [];
  push(x: number) {
    this.a.push(x);
  }
  pop() {
    return this.a.pop()!;
  }
  top() {
    return this.a[this.a.length - 1];
  }
  peekMax() {
    return Math.max(...this.a);
  }
  popMax() {
    const m = Math.max(...this.a);
    this.a.splice(this.a.lastIndexOf(m), 1);
    return m;
  }
}

class NaiveFreqStack {
  a: number[] = [];
  push(x: number) {
    this.a.push(x);
  }
  pop() {
    const cnt = new Map<number, number>();
    for (const v of this.a) cnt.set(v, (cnt.get(v) ?? 0) + 1);
    const best = Math.max(...cnt.values());
    for (let i = this.a.length - 1; i >= 0; i--) {
      if (cnt.get(this.a[i]) === best) return this.a.splice(i, 1)[0];
    }
    throw new Error('rỗng');
  }
}

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class MaxStack {\n  MaxStack()\n  void push(int x)\n  int pop()\n  int top()\n  int peekMax()\n  int popMax()\n}',
    title: 'MaxStack',
    ref: S.MaxStack,
    brute: NaiveMaxStack,
    cases: [
      {
        args: [
          ['MaxStack', 'push', 'push', 'push', 'top', 'popMax', 'top', 'peekMax', 'pop', 'top'],
          [[], [5], [1], [5], [], [], [], [], [], []],
        ],
        expected: [null, null, null, null, 5, 5, 1, 5, 1, 5],
      },
      {
        args: [['MaxStack', 'push', 'push', 'popMax', 'peekMax'], [[], [2147483647], [-2147483648], [], []]],
        expected: [null, null, null, 2147483647, -2147483648],
        note: 'biên int',
      },
      {
        args: [['MaxStack', 'push', 'push', 'push', 'popMax', 'popMax', 'popMax'], [[], [3], [3], [3], [], [], []]],
        expected: [null, null, null, null, 3, 3, 3],
        note: 'hòa giá trị',
      },
    ],
    gen: (n, r) => {
      let size = 0;
      const range = n > 1000 ? 1e9 : 6;
      return opsGen('MaxStack', [], Math.max(1, n), (i) => {
        const bulk = n > 1000 && i < n * 0.6;
        const op = size === 0 || bulk ? 'push' : r.pick(['push', 'pop', 'top', 'peekMax', 'popMax', 'popMax']);
        if (op === 'push') size++;
        if (op === 'pop' || op === 'popMax') size--;
        return [op, op === 'push' ? [r.int(-range, range)] : []];
      });
    },
    // popMax ngây thơ O(n): 6·10⁴ phần tử × ~4·10⁴ lần popMax
    perf: { n: 1e5, limitMs: 400 },
  },
  '02': {
    sig: 'class FreqStack {\n  FreqStack()\n  void push(int val)\n  int pop()\n}',
    title: 'Ngăn xếp theo tần suất',
    ref: S.FreqStack,
    brute: NaiveFreqStack,
    cases: [
      {
        args: [
          ['FreqStack', 'push', 'push', 'push', 'push', 'push', 'push', 'pop', 'pop', 'pop', 'pop'],
          [[], [5], [7], [5], [7], [4], [5], [], [], [], []],
        ],
        expected: [null, null, null, null, null, null, null, 5, 7, 5, 4],
      },
      { args: [['FreqStack', 'push', 'pop'], [[], [0], []]], expected: [null, null, 0] },
      {
        args: [['FreqStack', 'push', 'push', 'push', 'pop', 'pop', 'pop'], [[], [1], [2], [3], [], [], []]],
        expected: [null, null, null, null, 3, 2, 1],
        note: 'cùng tần suất → LIFO',
      },
    ],
    gen: (n, r) => {
      let size = 0;
      const range = n > 1000 ? 50 : 4;
      return opsGen('FreqStack', [], Math.max(1, n), (i) => {
        const bulk = n > 1000 && i < n * 0.55;
        const op = size === 0 || bulk || r.bool(0.45) ? 'push' : 'pop';
        size += op === 'push' ? 1 : -1;
        return [op, op === 'push' ? [r.int(0, range)] : []];
      });
    },
    // pop ngây thơ O(n) (đếm lại tần suất)
    perf: { n: 1e5, limitMs: 300 },
  },
};
