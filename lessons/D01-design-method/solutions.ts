// D01 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── ex01 · MaxStack ───
// Ý tưởng: stack (mảng) + max-heap cùng chứa MỘT đối tượng entry {val, id, dead}. Xóa ở một bên chỉ đánh dấu dead,
//   bên kia dọn lười (lazy deletion) khi entry nổi lên đỉnh. id tăng dần → heap so (val, id) để popMax lấy phần tử NẰM TRÊN CÙNG.
// Bất biến: mỗi entry sống nằm đúng một lần ở stack và một lần ở heap; đỉnh stack/heap sau khi dọn luôn là entry sống.
// Độ phức tạp: push O(log n) · pop O(log n) amortized · top O(1) amortized · peekMax O(log n) amortized · popMax O(log n) amortized · space O(n).
//   Mỗi entry bị dọn đúng 1 lần ở mỗi bên → tổng dọn ≤ 2 × số push.
// Vì sao best practice: không cần cây cân bằng/treemap (JS không có); heap có sẵn từ I04; dễ chứng minh đúng.
// Bẫy: quên rằng entry chết còn nằm ở bên kia (đọc top mà không dọn → trả sai); so sánh heap không có id → sai tie (phải lấy cái trên cùng).
// Cách khác: DLL + TreeMap<val, list node> (Java: TreeMap + LinkedList → mọi thao tác O(log n) thật sự, không amortized).
// Python/Java: Python `heapq` là min-heap → đẩy (-val, -id, entry); Java `PriorityQueue<int[]>` với comparator, id là long nếu >2^31 lần push.
interface Entry {
  val: number;
  id: number;
  dead: boolean;
}
export class MaxStack {
  private stack: Entry[] = [];
  private heap = new Heap<Entry>((a, b) => a.val > b.val || (a.val === b.val && a.id > b.id));
  private nextId = 0;
  push(x: number): void {
    const e: Entry = { val: x, id: this.nextId++, dead: false };
    this.stack.push(e);
    this.heap.push(e);
  }
  pop(): number {
    this.cleanStack();
    const e = this.stack.pop()!;
    e.dead = true;
    return e.val;
  }
  top(): number {
    this.cleanStack();
    return this.stack[this.stack.length - 1].val;
  }
  peekMax(): number {
    this.cleanHeap();
    return this.heap.peek()!.val;
  }
  popMax(): number {
    this.cleanHeap();
    const e = this.heap.pop()!;
    e.dead = true;
    return e.val;
  }
  private cleanStack(): void {
    while (this.stack[this.stack.length - 1].dead) this.stack.pop();
  }
  private cleanHeap(): void {
    while (this.heap.peek()!.dead) this.heap.pop();
  }
}

// ─── ex02 · FreqStack ───
// Ý tưởng: freq[v] = số lần v đang có; groups[f] = stack các giá trị đạt tần suất f (theo thứ tự push).
//   push(v): f = ++freq[v]; groups[f].push(v). pop(): lấy từ groups cuối (tần suất cao nhất) — đỉnh của nó là phần tử push gần nhất trong số đó.
// Bất biến: v xuất hiện trong groups[1..freq[v]] đúng một lần mỗi tầng; groups cuối luôn không rỗng.
// Độ phức tạp: mọi thao tác O(1) · space O(n).
// Vì sao best practice: tie "gần nhất" tự đúng nhờ thứ tự trong stack, không cần heap/timestamp (heap + id cũng được: O(log n)).
// Bẫy: pop xong phải giảm freq và bỏ tầng rỗng; nhầm "tần suất cao nhất" với "giá trị lớn nhất".
// Python/Java: Python `defaultdict(int)` + list of list; Java `HashMap<Integer,Integer>` + `ArrayList<ArrayDeque<Integer>>`.
export class FreqStack {
  private freq = new Map<number, number>();
  private groups: number[][] = [];
  push(val: number): void {
    const f = (this.freq.get(val) ?? 0) + 1;
    this.freq.set(val, f);
    if (f > this.groups.length) this.groups.push([]);
    this.groups[f - 1].push(val);
  }
  pop(): number {
    const g = this.groups[this.groups.length - 1];
    const v = g.pop()!;
    if (g.length === 0) this.groups.pop();
    const f = this.freq.get(v)! - 1;
    if (f === 0) this.freq.delete(v);
    else this.freq.set(v, f);
    return v;
  }
}
