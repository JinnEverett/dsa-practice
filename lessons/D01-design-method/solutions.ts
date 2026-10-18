// D01 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── ex01 · MaxStack ───
// Ý tưởng: ghép HAI cấu trúc cùng trỏ vào một tập `Item`:
//   • `stack` (mảng) giữ thứ tự push → pop/top ở đỉnh;
//   • `heap` (max-heap theo (val, id)) → peekMax/popMax; hòa giá trị thì id lớn hơn (đẩy sau) thắng = "gần đỉnh nhất".
// Xóa lười (lazy deletion): lấy phần tử ra khỏi một cấu trúc thì chỉ đánh dấu `dead`; cấu trúc kia vứt nó khi nó nổi lên đỉnh.
// Bất biến: (1) mỗi Item sống nằm đúng một lần trong stack và heap; (2) Item chết bị bỏ khi chạm đỉnh; (3) nếu số chết > số sống thì dựng lại.
// Độ phức tạp: push O(log n) · top/pop amortized O(1) · peekMax O(log n) amortized · popMax O(log n) amortized · space O(n).
// Vì sao best practice: đủ nhanh (O(log n) cho popMax), ít code hơn DLL + TreeMap, tái dùng Heap đã có.
// Bẫy: quên xóa lười → popMax O(n); không dựng lại → pop liên tục nhưng heap giữ xác chết (rò bộ nhớ); hòa giá trị phải xóa phần tử TRÊN CÙNG.
// Cách khác: danh sách liên kết đôi + TreeMap<giá trị, danh sách node> (Java `TreeMap`) cho popMax O(log n) không cần xóa lười.
// Python/Java: Python dùng `heapq` với `(-val, -id, item)`; Java `PriorityQueue<Item>` + comparator `Integer.compare` (đừng trừ → tràn).
interface Item {
  val: number;
  id: number;
  dead: boolean;
}
export class MaxStack {
  private stack: Item[] = [];
  private heap = new Heap<Item>((a, b) => a.val > b.val || (a.val === b.val && a.id > b.id));
  private nextId = 0;
  private dead = 0;

  push(x: number): void {
    const it: Item = { val: x, id: this.nextId++, dead: false };
    this.stack.push(it);
    this.heap.push(it);
  }
  pop(): number {
    this.trimStack();
    const it = this.stack.pop()!;
    this.kill(it);
    return it.val;
  }
  top(): number {
    this.trimStack();
    return this.stack[this.stack.length - 1].val;
  }
  peekMax(): number {
    this.trimHeap();
    return this.heap.peek()!.val;
  }
  popMax(): number {
    this.trimHeap();
    const it = this.heap.pop()!;
    this.kill(it);
    return it.val;
  }
  private kill(it: Item): void {
    it.dead = true;
    this.dead++;
    if (this.dead > this.stack.length - this.dead + 16) this.compact();
  }
  private trimStack(): void {
    while (this.stack[this.stack.length - 1].dead) {
      this.stack.pop();
      this.dead--;
    }
  }
  private trimHeap(): void {
    while (this.heap.peek()!.dead) this.heap.pop();
  }
  /** Dựng lại cả hai cấu trúc từ các Item sống: O(n), nhưng chỉ chạy sau ≥ n/2 lần xóa → amortized O(1)/thao tác. */
  private compact(): void {
    this.stack = this.stack.filter((it) => !it.dead);
    this.heap = new Heap<Item>((a, b) => a.val > b.val || (a.val === b.val && a.id > b.id), this.stack);
    this.dead = 0;
  }
}

// ─── ex02 · FreqStack ───
// Ý tưởng: `byFreq[f]` là một stack các giá trị đã đạt tần suất f (một giá trị xuất hiện ở f = 1..freq(v) stack).
//   push(v): freq[v]++ rồi đẩy v vào byFreq[freq[v]]; pop(): lấy đỉnh của byFreq[maxFreq]. Hòa tần suất → stack tự cho phần tử đẩy sau cùng.
// Bất biến: maxFreq = chỉ số lớn nhất mà byFreq[maxFreq] còn phần tử; byFreq[f] không rỗng với mọi f ≤ maxFreq.
// Độ phức tạp: mọi thao tác O(1) · space O(n).
// Bẫy: dùng heap theo (freq, thời điểm) → O(log n) và phải cập nhật khi freq đổi; hoặc quên giảm maxFreq khi byFreq[maxFreq] rỗng.
// Python/Java: `defaultdict(list)` / `HashMap<Integer, ArrayDeque<Integer>>`; mảng chỉ số theo tần suất cũng được vì freq ≤ số lần push.
export class FreqStack {
  private freq = new Map<number, number>();
  private byFreq: number[][] = [[]];
  private maxFreq = 0;

  push(val: number): void {
    const f = (this.freq.get(val) ?? 0) + 1;
    this.freq.set(val, f);
    if (f > this.maxFreq) {
      this.maxFreq = f;
      this.byFreq[f] = [];
    }
    this.byFreq[f].push(val);
  }
  pop(): number {
    const stk = this.byFreq[this.maxFreq];
    const val = stk.pop()!;
    if (stk.length === 0) this.maxFreq--;
    const f = this.freq.get(val)! - 1;
    if (f === 0) this.freq.delete(val);
    else this.freq.set(val, f);
    return val;
  }
}
