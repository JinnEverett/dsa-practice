// D08 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── ex01 · TaskScheduler (lên lịch, hủy, lặp lại) ───
// Ý tưởng: min-heap các SỰ KIỆN `(at, id, ver)` + bảng `pending: id → {ver, at, period}` là sự thật hiện hành.
//   schedule/scheduleEvery: tăng `ver` của id (vô hiệu hóa mọi sự kiện cũ của id), ghi pending, đẩy sự kiện mới.
//   cancel: xóa khỏi pending (sự kiện trong heap thành "xác chết", bị bỏ khi nổi lên). Xóa lười thay vì xóa giữa heap.
//   advance(now): lặp khi đỉnh heap có at ≤ now: pop; nếu sự kiện còn hiệu lực (ver khớp) thì phát id; việc lặp lại thì đẩy lần kế `at + period`,
//   việc một lần thì xóa khỏi pending.
// Bất biến: mỗi id đang chờ có đúng MỘT sự kiện hiệu lực trong heap (ver khớp, at = pending.at); các sự kiện còn lại là xác chết;
//   số sự kiện trong heap ≤ 2 × số đang chờ + 16 (nhờ dựng lại khi vượt).
// Độ phức tạp: schedule O(log n) · cancel O(1) · advance O((f + s) log n) với f = số lần phát, s = xác chết bị bỏ (mỗi xác chết bị bỏ đúng một lần) · space O(n).
// Vì sao best practice: heap là cấu trúc "cái tiếp theo đến hạn" tự nhiên; xóa lười tránh cần chỉ số vị trí trong heap.
// Bẫy: quên vô hiệu hóa sự kiện cũ khi schedule lại cùng id (phát hai lần); lặp lại đẩy sự kiện kế với at = `now + period` (trôi thời gian, dồn lỗi)
//   thay vì `at + period` (đúng nhịp); không dựng lại ⇒ heap phình khi hủy nhiều việc ở tương lai xa; so sánh hòa chỉ theo `at` ⇒ thứ tự id không xác định.
// Cách khác: hashed / hierarchical timer wheel (Linux, Kafka, Netty): O(1) schedule/cancel, độ phân giải cố định (tick) — hợp với hàng triệu timer.
//   Node.js `setTimeout` dùng danh sách liên kết theo độ trễ + một heap các danh sách.
// Python/Java: Python `heapq` + tuple `(at, id, ver)`; Java `PriorityQueue<long[]>` hoặc `ScheduledThreadPoolExecutor` (heap + xóa).
interface Ev {
  at: number;
  id: number;
  ver: number;
}
interface Pend {
  ver: number;
  at: number;
  period: number; // 0 = một lần
}
const evLess = (a: Ev, b: Ev) => a.at < b.at || (a.at === b.at && a.id < b.id);

export class TaskScheduler {
  private heap = new Heap<Ev>(evLess);
  private pending = new Map<number, Pend>();
  private nextVer = 0;

  schedule(id: number, at: number): void {
    this.put(id, at, 0);
  }
  scheduleEvery(id: number, at: number, period: number): void {
    this.put(id, at, period);
  }
  cancel(id: number): boolean {
    return this.pending.delete(id);
  }
  advance(now: number): number[] {
    const out: number[] = [];
    for (let top = this.heap.peek(); top && top.at <= now; top = this.heap.peek()) {
      this.heap.pop();
      const p = this.pending.get(top.id);
      if (!p || p.ver !== top.ver) continue; // xác chết
      out.push(top.id);
      if (p.period > 0) {
        p.at += p.period;
        this.heap.push({ at: p.at, id: top.id, ver: p.ver });
      } else this.pending.delete(top.id);
    }
    return out;
  }
  private put(id: number, at: number, period: number): void {
    const ver = ++this.nextVer;
    this.pending.set(id, { ver, at, period });
    this.heap.push({ at, id, ver });
    if (this.heap.size > 2 * this.pending.size + 16) {
      const live: Ev[] = [];
      for (const [pid, p] of this.pending) live.push({ at: p.at, id: pid, ver: p.ver });
      this.heap = new Heap<Ev>(evLess, live);
    }
  }
}

// ─── ex02 · TaskManager ───
// Ý tưởng: giống TaskScheduler nhưng khóa heap là (độ ưu tiên giảm dần, taskId giảm dần). `tasks: taskId → {user, priority, ver}` là sự thật hiện hành;
//   add/edit/rmv chỉ ghi `tasks` (edit tăng ver và đẩy sự kiện mới); execTop pop tới khi gặp sự kiện còn hiệu lực rồi xóa task và trả userId.
// Bất biến: mỗi task còn sống có đúng một sự kiện hiệu lực trong heap; sự kiện còn lại là xác chết (ver lệch hoặc task đã bị xóa).
// Độ phức tạp: add/edit O(log n) · rmv O(1) · execTop O(log n) amortized · space O(n) (dựng lại khi xác chết > số sống + 16).
// Bẫy: `edit` phải đổi cả vị trí trong thứ tự (không chỉ sửa trường); tie-break theo taskId LỚN hơn; execTop trên bảng rỗng trả −1;
//   xóa lười mà không bỏ qua sự kiện ver cũ ⇒ thực thi task đã sửa/xóa.
// Cách khác: heap có chỉ số (indexed priority queue) để `edit`/`rmv` O(log n) trực tiếp, không xác chết; hoặc cây cân bằng khóa (priority, taskId).
// Python/Java: `heapq` với `(-priority, -taskId, ver)`; Java `PriorityQueue` + `HashMap` hoặc `TreeSet<long[]>` (xóa trực tiếp O(log n)).
interface TEv {
  prio: number;
  task: number;
  ver: number;
}
interface TInfo {
  user: number;
  prio: number;
  ver: number;
}
const tLess = (a: TEv, b: TEv) => a.prio > b.prio || (a.prio === b.prio && a.task > b.task);

export class TaskManager {
  private heap: Heap<TEv>;
  private tasks = new Map<number, TInfo>();
  private nextVer = 0;

  constructor(tasks: number[][]) {
    this.heap = new Heap<TEv>(tLess);
    for (const [user, task, prio] of tasks) this.add(user, task, prio);
  }
  add(userId: number, taskId: number, priority: number): void {
    const ver = ++this.nextVer;
    this.tasks.set(taskId, { user: userId, prio: priority, ver });
    this.heap.push({ prio: priority, task: taskId, ver });
    this.maybeRebuild();
  }
  edit(taskId: number, newPriority: number): void {
    const t = this.tasks.get(taskId)!;
    t.prio = newPriority;
    t.ver = ++this.nextVer;
    this.heap.push({ prio: newPriority, task: taskId, ver: t.ver });
    this.maybeRebuild();
  }
  rmv(taskId: number): void {
    this.tasks.delete(taskId);
  }
  execTop(): number {
    for (let ev = this.heap.pop(); ev; ev = this.heap.pop()) {
      const t = this.tasks.get(ev.task);
      if (t && t.ver === ev.ver) {
        this.tasks.delete(ev.task);
        return t.user;
      }
    }
    return -1;
  }
  private maybeRebuild(): void {
    if (this.heap.size > 2 * this.tasks.size + 16) {
      const live: TEv[] = [];
      for (const [task, t] of this.tasks) live.push({ prio: t.prio, task, ver: t.ver });
      this.heap = new Heap<TEv>(tLess, live);
    }
  }
}
