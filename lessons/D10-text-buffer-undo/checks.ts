import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

/** Ngây thơ: một chuỗi + chỉ số con trỏ, cắt/ghép chuỗi mỗi thao tác. */
class NaiveTextEditor {
  s = '';
  c = 0;
  addText(t: string) {
    this.s = this.s.slice(0, this.c) + t + this.s.slice(this.c);
    this.c += t.length;
  }
  deleteText(k: number) {
    const n = Math.min(k, this.c);
    this.s = this.s.slice(0, this.c - n) + this.s.slice(this.c);
    this.c -= n;
    return n;
  }
  cursorLeft(k: number) {
    this.c = Math.max(0, this.c - k);
    return this.s.slice(Math.max(0, this.c - 10), this.c);
  }
  cursorRight(k: number) {
    this.c = Math.min(this.s.length, this.c + k);
    return this.s.slice(Math.max(0, this.c - 10), this.c);
  }
}

/** Ngây thơ: lưu danh sách lệnh đang hiệu lực + redo; state() = chạy lại TOÀN BỘ lịch sử từ chuỗi rỗng. */
class NaiveUndoRedo {
  max: number;
  hist: string[] = [];
  redoStack: string[] = [];
  base = ''; // văn bản trước lệnh cũ nhất còn nhớ (lệnh bị bỏ phải được "đóng băng" vào đây)
  constructor(max: number) {
    this.max = max;
  }
  private run(text: string, op: string) {
    return op[0] === '+' ? text + op.slice(1) : text.slice(0, Math.max(0, text.length - Number(op.slice(1))));
  }
  apply(op: string) {
    this.hist.push(op);
    this.redoStack = [];
    if (this.hist.length > this.max) this.base = this.run(this.base, this.hist.shift()!);
  }
  undo() {
    if (!this.hist.length) return false;
    this.redoStack.push(this.hist.pop()!);
    return true;
  }
  redo() {
    if (!this.redoStack.length) return false;
    this.hist.push(this.redoStack.pop()!);
    return true;
  }
  state() {
    return this.hist.reduce((t, op) => this.run(t, op), this.base);
  }
}

const letters = 'abcdefghijklmnopqrstuvwxyz';

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class TextEditor {\n  TextEditor()\n  void addText(String text)\n  int deleteText(int k)\n  String cursorLeft(int k)\n  String cursorRight(int k)\n}',
    title: 'Text editor (con trỏ)',
    ref: S.TextEditor,
    brute: NaiveTextEditor,
    cases: [
      {
        args: [
          ['TextEditor', 'addText', 'deleteText', 'addText', 'cursorRight', 'cursorLeft', 'deleteText', 'cursorLeft', 'cursorRight'],
          [[], ['leetcode'], [4], ['practice'], [3], [8], [10], [2], [6]],
        ],
        expected: [null, null, 4, null, 'etpractice', 'leet', 4, '', 'practi'],
        note: 'ví dụ LeetCode 2296',
      },
      {
        args: [['TextEditor', 'cursorLeft', 'cursorRight', 'deleteText', 'addText', 'cursorLeft', 'cursorRight'], [[], [5], [5], [5], ['ab'], [1], [1]]],
        expected: [null, '', '', 0, null, 'a', 'ab'],
        note: 'văn bản rỗng; k lớn hơn độ dài',
      },
      {
        args: [['TextEditor', 'addText', 'cursorLeft', 'cursorLeft', 'cursorRight'], [[], ['abcdefghijklmnop'], [1], [3], [2]]],
        expected: [null, null, 'fghijklmno', 'cdefghijkl', 'efghijklmn'],
        note: '10 ký tự CUỐI trước con trỏ',
      },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      const ops = ['TextEditor'];
      const args: any[][] = [[]];
      for (let i = 0; i < Math.max(1, n); i++) {
        const p = r.float();
        if (p < (big ? 0.5 : 0.35)) (ops.push('addText'), args.push([r.string(r.int(1, big ? 40 : 5), letters)]));
        else if (p < (big ? 0.6 : 0.5)) (ops.push('deleteText'), args.push([r.int(1, big ? 40 : 6)]));
        else if (p < 0.8) (ops.push('cursorLeft'), args.push([r.int(1, big ? 40 : 8)]));
        else (ops.push('cursorRight'), args.push([r.int(1, big ? 40 : 8)]));
      }
      return [ops, args];
    },
    // ngây thơ cắt/ghép chuỗi dài mỗi thao tác
    perf: { n: 1e5, limitMs: 400 },
  },
  '02': {
    sig: 'class UndoRedo {\n  UndoRedo(int maxHistory)\n  void apply(String op)\n  boolean undo()\n  boolean redo()\n  String state()\n}',
    title: 'Undo / redo có giới hạn lịch sử',
    ref: S.UndoRedo,
    brute: NaiveUndoRedo,
    cases: [
      {
        args: [
          ['UndoRedo', 'apply', 'apply', 'state', 'undo', 'state', 'redo', 'state', 'undo', 'undo', 'undo', 'state'],
          [[10], ['+hello'], ['+ world'], [], [], [], [], [], [], [], [], []],
        ],
        expected: [null, null, null, 'hello world', true, 'hello', true, 'hello world', true, true, false, ''],
      },
      {
        args: [
          ['UndoRedo', 'apply', 'apply', 'undo', 'apply', 'redo', 'state', 'undo', 'state'],
          [[10], ['+abc'], ['-2'], [], ['+x'], [], [], [], []],
        ],
        expected: [null, null, null, true, null, false, 'abcx', true, 'abc'],
        note: 'undo "-2" khôi phục "bc"; apply mới xóa redo; redo sau đó thất bại',
      },
      {
        args: [
          ['UndoRedo', 'apply', 'apply', 'apply', 'state', 'undo', 'undo', 'undo', 'state', 'redo', 'state'],
          [[2], ['+a'], ['+b'], ['+c'], [], [], [], [], [], [], []],
        ],
        expected: [null, null, null, null, 'abc', true, true, false, 'a', true, 'ab'],
        note: 'maxHistory = 2: lệnh "+a" đã bị bỏ, không thể undo; "a" ở lại trong văn bản',
      },
      {
        args: [['UndoRedo', 'apply', 'state', 'undo', 'state', 'redo', 'state'], [[3], ['-5'], [], [], [], [], []]],
        expected: [null, null, '', true, '', true, ''],
        note: 'xóa trên văn bản rỗng: vẫn là một lệnh (undo/redo thành công, không đổi gì)',
      },
    ],
    gen: (n, r: Rng) => {
      const big = n > 1000;
      const max = big ? 20000 : r.int(1, 4);
      const ops = ['UndoRedo'];
      const args: any[][] = [[max]];
      for (let i = 0; i < Math.max(1, n); i++) {
        const p = r.float();
        if (p < (big ? 0.65 : 0.45)) {
          ops.push('apply');
          args.push([r.bool(0.5) ? '+' + r.string(r.int(1, big ? 5 : 3), letters) : '-' + r.int(1, big ? 5 : 4)]);
        } else if (p < (big ? 0.82 : 0.78)) (ops.push('undo'), args.push([]));
        else if (p < (big ? 0.92 : 0.86)) (ops.push('redo'), args.push([]));
        else (ops.push('state'), args.push([]));
      }
      return [ops, args];
    },
    // ngây thơ: state() chạy lại toàn bộ lịch sử (≤ 2·10⁴ lệnh) mỗi lần
    perf: { n: 1e5, limitMs: 700 },
  },
};
