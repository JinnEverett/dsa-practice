// F12 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Ngoặc hợp lệ ───
// Ý tưởng: stack các ngoặc mở; gặp ngoặc đóng thì đỉnh stack phải là ngoặc mở tương ứng.
// Độ phức tạp: O(n) time · O(n) space.
// Mẹo: độ dài lẻ → false ngay. Đẩy NGOẶC ĐÓNG kỳ vọng thay vì ngoặc mở → so sánh trực tiếp, bớt một bảng tra.
// Python/Java: Java `ArrayDeque<Character>`; Python list làm stack.
export function isValid(s: string): boolean {
  if (s.length % 2 === 1) return false;
  const expect: string[] = [];
  const pair: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  for (const c of s) {
    if (c in pair) expect.push(pair[c]);
    else if (expect.pop() !== c) return false;
  }
  return expect.length === 0;
}

// ─── ex02 · Min stack ───
// Ý tưởng: lưu song song stack giá trị và stack "min tính đến vị trí này".
// Độ phức tạp: O(1) mọi thao tác · O(n) space.
// Cách khác tiết kiệm bộ nhớ: stack min chỉ push khi val ≤ min hiện tại (pop khi giá trị bị pop bằng min).
export class MinStack {
  private vals: number[] = [];
  private mins: number[] = [];
  push(val: number): void {
    this.vals.push(val);
    this.mins.push(this.mins.length ? Math.min(val, this.mins[this.mins.length - 1]) : val);
  }
  pop(): void {
    this.vals.pop();
    this.mins.pop();
  }
  top(): number {
    return this.vals[this.vals.length - 1];
  }
  getMin(): number {
    return this.mins[this.mins.length - 1];
  }
}

// ─── ex03 · RPN ───
// Ý tưởng: số → push; toán tử → pop b rồi a (THỨ TỰ quan trọng với − và /), push a op b.
// Độ phức tạp: O(n) time · O(n) space.
// Bẫy: pop sai thứ tự (b − a); chia `Math.floor` thay vì `Math.trunc`; Python `//` làm tròn xuống → dùng `int(a / b)`.
export function evalRPN(tokens: string[]): number {
  const st: number[] = [];
  for (const t of tokens) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = st.pop()!;
      const a = st.pop()!;
      st.push(t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : Math.trunc(a / b));
    } else st.push(Number(t));
  }
  return st[0] + 0;
}

// ─── ex04 · Queue bằng hai stack ───
// Ý tưởng: inbox nhận push; outbox phục vụ pop/peek; outbox rỗng thì đổ toàn bộ inbox sang (đảo thứ tự).
// Độ phức tạp: push O(1); pop/peek O(1) amortized (mỗi phần tử được chuyển đúng 1 lần).
// Bẫy: đổ inbox sang outbox khi outbox CHƯA rỗng → sai thứ tự.
export class MyQueue {
  private inbox: number[] = [];
  private outbox: number[] = [];
  push(x: number): void {
    this.inbox.push(x);
  }
  private shiftIfNeeded(): void {
    if (this.outbox.length === 0) while (this.inbox.length) this.outbox.push(this.inbox.pop()!);
  }
  pop(): number {
    this.shiftIfNeeded();
    return this.outbox.pop()!;
  }
  peek(): number {
    this.shiftIfNeeded();
    return this.outbox[this.outbox.length - 1];
  }
  empty(): boolean {
    return this.inbox.length === 0 && this.outbox.length === 0;
  }
}

// ─── ex05 · Rút gọn đường dẫn ───
// Ý tưởng: tách theo '/', bỏ phần rỗng và '.'; '..' → pop (nếu có); còn lại push. Nối '/' + join('/').
// Độ phức tạp: O(n) time · O(n) space.
// Python/Java: Python `path.split('/')`; Java `path.split("/")` (phần rỗng vẫn xuất hiện ở giữa → phải bỏ).
export function simplifyPath(path: string): string {
  const st: string[] = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') st.pop();
    else st.push(part);
  }
  return '/' + st.join('/');
}

// ─── ex06 · Bộ đếm request gần đây ───
// Ý tưởng: queue các timestamp; mỗi ping thêm t, rồi loại các phần tử < t − 3000 ở ĐẦU queue (con trỏ head, không shift).
// Độ phức tạp: O(1) amortized mỗi ping · O(cửa sổ) space (có cắt bỏ phần đã loại để mảng không phình mãi).
// Python/Java: Python `deque` + `popleft`; Java `ArrayDeque<Integer>` + `poll`.
export class RecentCounter {
  private q: number[] = [];
  private head = 0;
  ping(t: number): number {
    this.q.push(t);
    while (this.q[this.head] < t - 3000) this.head++;
    if (this.head > 4096 && this.head * 2 > this.q.length) {
      this.q = this.q.slice(this.head); // dọn phần đã loại, chi phí chia đều (amortized)
      this.head = 0;
    }
    return this.q.length - this.head;
  }
}

// ─── ex07 · Hàng đợi vòng ───
// Ý tưởng: mảng k ô, `head` = vị trí phần tử đầu, `size` = số phần tử; vị trí cuối = (head + size − 1) % k.
//   Giữ `size` riêng để phân biệt đầy/rỗng không mơ hồ.
// Độ phức tạp: O(1) mọi thao tác · O(k) space.
export class CircularQueue {
  private data: number[];
  private head = 0;
  private size = 0;
  constructor(k: number) {
    this.data = new Array<number>(k);
  }
  enQueue(value: number): boolean {
    if (this.isFull()) return false;
    this.data[(this.head + this.size) % this.data.length] = value;
    this.size++;
    return true;
  }
  deQueue(): boolean {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.data.length;
    this.size--;
    return true;
  }
  front(): number {
    return this.isEmpty() ? -1 : this.data[this.head];
  }
  rear(): number {
    return this.isEmpty() ? -1 : this.data[(this.head + this.size - 1) % this.data.length];
  }
  isEmpty(): boolean {
    return this.size === 0;
  }
  isFull(): boolean {
    return this.size === this.data.length;
  }
}

// ─── ex08 · Va chạm thiên thạch ───
// Ý tưởng: stack các thiên thạch "còn sống". Chỉ có va chạm khi đỉnh đi phải (> 0) và thiên thạch mới đi trái (< 0).
//   Lặp: đỉnh nhỏ hơn → đỉnh vỡ (pop, tiếp tục); bằng → cả hai vỡ; lớn hơn → thiên thạch mới vỡ.
// Độ phức tạp: O(n) — mỗi phần tử push/pop tối đa 1 lần.
export function asteroidCollision(asteroids: number[]): number[] {
  const st: number[] = [];
  for (const a of asteroids) {
    let alive = true;
    while (alive && a < 0 && st.length && st[st.length - 1] > 0) {
      const top = st[st.length - 1];
      if (top < -a) st.pop();
      else {
        if (top === -a) st.pop();
        alive = false;
      }
    }
    if (alive) st.push(a);
  }
  return st;
}

// ─── ex09 · Thẻ HTML lồng đúng ───
// Ý tưởng: quét tìm '<', đọc tới '>': thẻ tự đóng (kết thúc '/>') bỏ qua; thẻ đóng (bắt đầu '</') phải khớp đỉnh stack;
//   thẻ mở → push tên. Cuối cùng stack rỗng.
// Độ phức tạp: O(n) time · O(độ sâu lồng) space.
// Ngoài đời: HTML thật có thẻ void (`<br>`), thuộc tính, comment, CDATA… → dùng parser chuẩn, đừng tự viết regex.
export function validTags(html: string): boolean {
  const st: string[] = [];
  let i = 0;
  while ((i = html.indexOf('<', i)) !== -1) {
    const j = html.indexOf('>', i);
    const inner = html.slice(i + 1, j);
    i = j + 1;
    if (inner.endsWith('/')) continue;
    if (inner.startsWith('/')) {
      if (st.pop() !== inner.slice(1)) return false;
    } else st.push(inner);
  }
  return st.length === 0;
}

// ─── ex10 · Trình soạn thảo có Undo ───
// Ý tưởng: văn bản là MẢNG ký tự (stack); undo stack lưu "cách hoàn tác": với type ghi số ký tự đã thêm (hoàn tác = xóa bấy nhiêu),
//   với delete ghi chuỗi đã xóa (hoàn tác = gõ lại). Chi phí mỗi lệnh ∝ số ký tự thay đổi.
// Độ phức tạp: tổng O(tổng ký tự được gõ/xóa) · O(văn bản + lịch sử) space.
// Bẫy: lưu snapshot toàn văn bản sau mỗi lệnh → O(n · độ dài văn bản) thời gian và bộ nhớ.
//   Undo của delete phải gõ lại đúng những ký tự THỰC SỰ bị xóa (có thể < k).
// Python/Java: Python list ký tự + `''.join`; Java `StringBuilder` (`setLength` để xóa cuối, O(1)).
export function runEditor(commands: string[]): string {
  const text: string[] = [];
  const history: ({ typed: number } | { deleted: string[] })[] = [];
  for (const cmd of commands) {
    if (cmd.startsWith('type ')) {
      const s = cmd.slice(5);
      for (const c of s) text.push(c);
      history.push({ typed: s.length });
    } else if (cmd.startsWith('delete ')) {
      const k = Math.min(Number(cmd.slice(7)), text.length);
      history.push({ deleted: text.splice(text.length - k, k) });
    } else {
      const last = history.pop();
      if (!last) continue;
      if ('typed' in last) text.length -= last.typed;
      else for (const c of last.deleted) text.push(c);
    }
  }
  return text.join('');
}
