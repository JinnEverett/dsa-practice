// D05 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · RandomizedCollection ───
// Ý tưởng: multiset cần getRandom đều theo bội số ⇒ phải truy cập ngẫu nhiên theo CHỈ SỐ ⇒ giữ một MẢNG `items` chứa mọi phần tử (kể cả trùng),
//   cộng `pos: Map<giá trị, Set<chỉ số>>` ghi vị trí mọi bản sao của giá trị đó.
//   insert(v): push vào mảng, thêm chỉ số vào pos[v]; trả `true` nếu pos[v] vừa mới có.
//   remove(v): lấy một chỉ số i bất kỳ của v; HOÁN phần tử cuối vào ô i (cập nhật pos của phần tử cuối: bỏ `last`, thêm `i`), rồi pop.
//   getRandom: items[floor(random × n)] — mỗi bản sao có xác suất 1/n ⇒ giá trị v có xác suất count(v)/n.
// Bất biến: items.length = tổng bội số; với mọi i, i ∈ pos[items[i]]; pos[v] không rỗng (xóa khóa khi rỗng).
// Độ phức tạp: insert / remove / getRandom O(1) trung bình · space O(n).
// Bẫy: khi xóa phần tử CHÍNH LÀ phần tử cuối (i === last) — phải bỏ chỉ số ra khỏi Set TRƯỚC khi thêm lại, nếu không sẽ để lại chỉ số mồ côi;
//   thứ tự "xóa i khỏi pos[v]" rồi "thêm i vào pos[last]" rồi "xóa last khỏi pos[last]" quyết định đúng/sai khi v === items[last];
//   getRandom chọn theo khóa (đều trên giá trị phân biệt) thay vì theo bản sao ⇒ sai phân phối.
// Cách khác: `Map<giá trị, đếm>` + mảng các giá trị phân biệt + lấy mẫu có trọng số (O(log n) với Fenwick) — không cần Set chỉ số nhưng chậm hơn.
// Python/Java: `random.choice(list)` / `new Random().nextInt(n)`; Set chỉ số: `set()` / `LinkedHashSet<Integer>` (cần `iterator().next()`).
export class RandomizedCollection {
  private items: number[] = [];
  private pos = new Map<number, Set<number>>();

  insert(val: number): boolean {
    let s = this.pos.get(val);
    const fresh = !s;
    if (!s) this.pos.set(val, (s = new Set()));
    s.add(this.items.length);
    this.items.push(val);
    return fresh;
  }
  remove(val: number): boolean {
    const s = this.pos.get(val);
    if (!s) return false;
    const i = s.values().next().value as number;
    const lastIdx = this.items.length - 1;
    const last = this.items[lastIdx];
    s.delete(i);
    if (i !== lastIdx) {
      this.items[i] = last;
      const t = this.pos.get(last)!;
      t.delete(lastIdx);
      t.add(i);
    }
    this.items.pop();
    if (s.size === 0) this.pos.delete(val);
    return true;
  }
  getRandom(): number {
    return this.items[Math.floor(Math.random() * this.items.length)];
  }
}

// ─── ex02 · PeekingIterator ───
// Ý tưởng: giữ MỘT phần tử nhìn trước (lookahead cache) đã lấy từ nguồn. peek() trả cache; next() trả cache rồi nạp phần tử kế; hasNext() = còn cache.
//   Nguồn ở đây là mảng + con trỏ `i` (đóng vai Iterator.next()); điểm mấu chốt là KHÔNG đọc nguồn trực tiếp ở peek.
// Bất biến: `has` = còn phần tử chưa trả; nếu `has` thì `cache` là phần tử kế tiếp.
// Độ phức tạp: mọi thao tác O(1) · space O(1) phụ.
// Bẫy: peek() không được làm tiến nguồn; nạp trước ở constructor (nếu nguồn rỗng, hasNext phải false); gọi nguồn.next() hai lần khi nạp.
// Python/Java: Java `Iterator<Integer>` bọc lại; Python dùng `iter()` + `next(it, sentinel)`.
export class PeekingIterator {
  private nums: number[];
  private i = 0;
  private has = false;
  private cache = 0;

  constructor(nums: number[]) {
    this.nums = nums;
    this.advance();
  }
  private advance(): void {
    this.has = this.i < this.nums.length;
    if (this.has) this.cache = this.nums[this.i++];
  }
  peek(): number {
    return this.cache;
  }
  next(): number {
    const v = this.cache;
    this.advance();
    return v;
  }
  hasNext(): boolean {
    return this.has;
  }
}

// ─── ex03 · ZigzagIterator (gộp hai nguồn xen kẽ) ───
// Ý tưởng: một QUEUE các nguồn còn phần tử, mỗi mục là [mảng, vị trí]. next(): lấy nguồn đầu hàng, đọc phần tử, nếu nguồn còn nữa thì đẩy lại CUỐI hàng.
//   Khi một nguồn cạn nó rời hàng, các nguồn còn lại tiếp tục xen kẽ. Cách này tổng quát cho k nguồn (follow-up) mà không đổi code.
// Bất biến: hàng chỉ chứa nguồn còn phần tử; thứ tự hàng = thứ tự xen kẽ.
// Độ phức tạp: next/hasNext O(1) · space O(k) (không sao chép dữ liệu — lười).
// Bẫy: gộp sẵn thành một mảng mới tốn O(tổng) bộ nhớ và không dùng được cho nguồn "vô hạn"; hai chỉ số i, j + cờ lượt dễ sai khi một mảng rỗng;
//   dùng `queue.shift()` (O(k)) — với k lớn nên dùng chỉ số `head`.
// Python/Java: Python `deque` + `(iter, ...)`; Java `ArrayDeque<int[]>` hoặc `Queue<Iterator<Integer>>`.
export class ZigzagIterator {
  private queue: [number[], number][] = [];
  private head = 0;

  constructor(a: number[], b: number[]) {
    for (const arr of [a, b]) if (arr.length > 0) this.queue.push([arr, 0]);
  }
  next(): number {
    const entry = this.queue[this.head++];
    const [arr, i] = entry;
    if (i + 1 < arr.length) this.queue.push([arr, i + 1]);
    if (this.head > 64 && this.head * 2 > this.queue.length) {
      this.queue.splice(0, this.head);
      this.head = 0;
    }
    return arr[i];
  }
  hasNext(): boolean {
    return this.head < this.queue.length;
  }
}
