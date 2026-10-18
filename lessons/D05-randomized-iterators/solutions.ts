// D05 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · RandomizedCollection ───
// Ý tưởng: mảng `items` chứa mọi bản sao (cho getRandom O(1)) + Map giá trị → Set các chỉ số trong `items`.
//   remove(v): lấy một chỉ số i của v; đưa phần tử CUỐI mảng vào vị trí i (swap-with-last), cập nhật Set chỉ số của phần tử đó, pop mảng.
// Bất biến: items[i] = v ⇔ i ∈ pos[v]; |items| = tổng kích thước các Set; không có Set rỗng trong Map.
// Độ phức tạp: insert / remove / getRandom đều O(1) (trung bình) · space O(n).
// Vì sao best practice: xóa giữa mảng mà không dịch phần tử = đổi chỗ với phần tử cuối.
// Bẫy: khi phần tử cuối CHÍNH LÀ phần tử cần xóa (i = last) — thứ tự "thêm chỉ số mới rồi xóa chỉ số cũ" làm hỏng; xử lý: xóa i khỏi Set của v trước,
//   rồi nếu i ≠ last mới dời; trả `true` ở insert khi giá trị CHƯA có (Set rỗng/không tồn tại trước đó); getRandom phải đều theo số bản sao.
// Cách khác: Map giá trị → số lần + mảng các giá trị khác nhau với trọng số (cần cây/Fenwick để chọn đều) — phức tạp hơn mà không lợi.
// Python/Java: Python `random.choice(list)`, `dict[val] = set()`; Java `ArrayList<Integer>` + `HashMap<Integer, LinkedHashSet<Integer>>` (Set có thứ tự cho phép lấy phần tử bất kỳ bằng iterator().next()), `new Random().nextInt(size)`.
export class RandomizedCollection {
  private items: number[] = [];
  private pos = new Map<number, Set<number>>();
  insert(val: number): boolean {
    let s = this.pos.get(val);
    const isNew = !s;
    if (!s) this.pos.set(val, (s = new Set()));
    s.add(this.items.length);
    this.items.push(val);
    return isNew;
  }
  remove(val: number): boolean {
    const s = this.pos.get(val);
    if (!s) return false;
    const i: number = s.values().next().value!;
    s.delete(i);
    const last = this.items.length - 1;
    if (i !== last) {
      const moved = this.items[last];
      const ms = this.pos.get(moved)!;
      ms.delete(last);
      ms.add(i);
      this.items[i] = moved;
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
// Ý tưởng: giữ trước một phần tử "đã nhìn" (lookahead) hoặc đơn giản là con trỏ vị trí vì dữ liệu là mảng.
//   Với iterator tổng quát (chỉ có next/hasNext) thì phải đệm phần tử tiếp theo; ở đây giữ cả hai để khớp ý nghĩa bài gốc.
// Bất biến: `buffer` (nếu `has`) là phần tử sẽ được trả bởi next() kế tiếp; peek() không làm tiến.
// Độ phức tạp: mọi thao tác O(1) · space O(1) thêm.
// Vì sao best practice: peek tách khỏi next bằng một ô đệm — dùng được cho mọi nguồn dữ liệu kiểu stream.
// Bẫy: gọi next() của nguồn mỗi lần peek() (làm mất phần tử); hasNext() phải xét cả ô đệm.
// Python/Java: Java gốc bọc `Iterator<Integer>`; Python tự viết `__next__`/`__iter__` hoặc dùng `itertools.tee` (chậm hơn).
export class PeekingIterator {
  private nums: number[];
  private idx = 0;
  private buffer: number | undefined;
  private has = false;
  constructor(nums: number[]) {
    this.nums = nums;
  }
  private fill(): void {
    if (!this.has && this.idx < this.nums.length) {
      this.buffer = this.nums[this.idx++];
      this.has = true;
    }
  }
  peek(): number {
    this.fill();
    return this.buffer!;
  }
  next(): number {
    this.fill();
    this.has = false;
    return this.buffer!;
  }
  hasNext(): boolean {
    return this.has || this.idx < this.nums.length;
  }
}

// ─── ex03 · ZigzagIterator ───
// Ý tưởng: hai con trỏ i, j và cờ lượt. next(): nếu lượt của a và a còn thì lấy a[i++], ngược lại lấy b[j++]; đổi lượt. Nếu một bên cạn thì luôn lấy bên còn lại.
// Bất biến: thứ tự trả = a0, b0, a1, b1, …, bỏ qua bên đã cạn; hasNext ⇔ i < |a| hoặc j < |b|.
// Độ phức tạp: O(1) mỗi thao tác · O(1) bộ nhớ thêm (không gộp trước).
// Cách khác: hàng đợi các iterator còn dữ liệu — mở rộng cho k danh sách (xoay vòng), mỗi next O(1).
// Bẫy: lượt thuộc bên đã cạn phải nhảy sang bên kia; không đổi lượt sau khi lấy từ bên "bù".
// Python/Java: Python `itertools.zip_longest` + lọc sentinel (gộp trước); Java dùng `Queue<Iterator<Integer>>`.
export class ZigzagIterator {
  private a: number[];
  private b: number[];
  private i = 0;
  private j = 0;
  private turnA = true;
  constructor(a: number[], b: number[]) {
    this.a = a;
    this.b = b;
  }
  next(): number {
    const takeA = this.i < this.a.length && (this.turnA || this.j >= this.b.length);
    this.turnA = !takeA;
    return takeA ? this.a[this.i++] : this.b[this.j++];
  }
  hasNext(): boolean {
    return this.i < this.a.length || this.j < this.b.length;
  }
}
