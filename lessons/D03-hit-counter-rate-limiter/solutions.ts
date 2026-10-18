// D03 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · HitCounter ───
// Ý tưởng: vòng 300 bucket, mỗi bucket ứng với một giây `t % 300`. Bucket i lưu `times[i]` (giây nó đang đại diện) và `counts[i]`.
//   hit(t): nếu `times[i] !== t` thì bucket đang giữ dữ liệu của ≥ 300 giây trước → ghi đè (times[i] = t, counts[i] = 0); counts[i]++.
//   getHits(t): cộng counts[i] của các bucket có `t - times[i] < 300` (bucket lạc hậu bị bỏ qua, không cần xóa).
// Bất biến: bộ nhớ cố định 2 × 300 ô, bất kể số hit; bucket i chỉ chứa hit của đúng một giây `times[i]`.
// Độ phức tạp: hit O(1) · getHits O(300) = O(1) · space O(300) — không phụ thuộc số hit (khác bản "lưu mọi timestamp": O(số hit) bộ nhớ).
// Vì sao best practice: bộ nhớ chặn trên cố định ngay cả khi 10⁶ hit/giây; không có xóa lười hay dọn dẹp.
// Bẫy: dùng `<=` thay vì `<` (cửa sổ là (t − 300, t], tức 300 giây gồm cả giây t); quên reset counts khi bucket bị tái dùng;
//   timestamp tới 2·10⁹ → `% 300` vẫn an toàn trong số nguyên 32-bit; Java không cần `long`.
// Cách khác: hàng đợi các timestamp (vứt đầu khi ≤ t − 300) — O(1) amortized nhưng bộ nhớ O(số hit trong 300 s).
// Python/Java: mảng `[0] * 300` / `new int[300]`.
export class HitCounter {
  private times = new Array<number>(300).fill(-1);
  private counts = new Array<number>(300).fill(0);

  hit(timestamp: number): void {
    const i = timestamp % 300;
    if (this.times[i] !== timestamp) {
      this.times[i] = timestamp;
      this.counts[i] = 0;
    }
    this.counts[i]++;
  }
  getHits(timestamp: number): number {
    let total = 0;
    for (let i = 0; i < 300; i++) if (this.times[i] >= 0 && timestamp - this.times[i] < 300) total += this.counts[i];
    return total;
  }
}

// ─── ex02 · PerUserLimiter (rate limiter theo người dùng, bộ nhớ có giới hạn) ───
// Ý tưởng: cửa sổ trượt dạng "log" cho từng user: hàng đợi tối đa `limit` timestamp của các yêu cầu ĐÃ ĐƯỢC CHO PHÉP còn trong (t − windowMs, t].
//   allow(u, t): lấy trạng thái của u (tạo mới nếu chưa có — nếu đã đủ `maxUsers` thì evict user bị thấy lâu nhất); đánh dấu u là vừa thấy;
//   vứt timestamp ≤ t − windowMs ở đầu hàng; còn chỗ (< limit) thì push t và cho phép.
//   Thứ tự "thấy gần nhất" giữ bằng danh sách liên kết đôi (như LRU ở D02): node của user đi lên đầu mỗi lần được thấy, evict node cuối.
//   (Đã đo: dùng `Map` + `delete`/`set` + `keys().next()` để lấy user cũ nhất chậm hơn khoảng 8× ở 10⁵ thao tác với nhiều user bị evict — có vẻ do V8 phải bỏ qua các ô đã xóa ở đầu bảng.)
// Bất biến: số user được theo dõi ≤ maxUsers; mỗi hàng đợi ≤ limit phần tử ⇒ bộ nhớ O(maxUsers × limit) bất kể số user thật sự.
// Độ phức tạp: allow O(1) amortized (mỗi timestamp vào và ra hàng đợi đúng một lần) · space O(maxUsers · limit).
// Đánh đổi: user bị evict mất lịch sử ⇒ lần sau được "làm mới" quota (fail-open). Chọn đúng hay sai tùy hệ thống: chống abuse nghiêm ngặt cần
//   tăng maxUsers hoặc đưa ra Redis. Đề chốt: evict theo "thấy lâu nhất", kể cả lần bị từ chối cũng tính là thấy.
// Bẫy: chỉ cập nhật thứ tự khi được phép (user spam bị từ chối sẽ bị evict → được làm mới quota!); đẩy timestamp của cả yêu cầu bị từ chối vào hàng đợi
//   (khóa user vĩnh viễn); `head++` mãi không cắt mảng → rò bộ nhớ; `shift()` O(n).
// Cách khác: token bucket (2 số/user: token và lần nạp cuối) — O(1) bộ nhớ/user nhưng cho phép burst; sliding window counter xấp xỉ bằng 2 bộ đếm.
// Python/Java: `OrderedDict.move_to_end` / `LinkedHashMap(accessOrder=true)`; `ArrayDeque<Long>` cho hàng đợi; `long` cho timestamp ms.
interface UserState {
  user: number;
  q: number[];
  head: number;
  prev: UserState;
  next: UserState;
}
const sentinel = (): UserState => {
  const n = { user: 0, q: [], head: 0 } as unknown as UserState;
  n.prev = n.next = n;
  return n;
};
export class PerUserLimiter {
  private limit: number;
  private windowMs: number;
  private maxUsers: number;
  private users = new Map<number, UserState>();
  private head = sentinel(); // head.next = mới thấy nhất
  private tail = sentinel(); // tail.prev = thấy lâu nhất

  constructor(limit: number, windowMs: number, maxUsers: number) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.maxUsers = maxUsers;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  allow(user: number, t: number): boolean {
    let st = this.users.get(user);
    if (st) this.unlink(st);
    else {
      if (this.users.size === this.maxUsers) {
        const old = this.tail.prev;
        this.unlink(old);
        this.users.delete(old.user);
      }
      st = { user, q: [], head: 0 } as unknown as UserState;
      this.users.set(user, st);
    }
    this.pushFront(st);
    const q = st.q;
    while (st.head < q.length && q[st.head] <= t - this.windowMs) st.head++;
    if (st.head > 32 && st.head * 2 > q.length) {
      q.splice(0, st.head);
      st.head = 0;
    }
    if (q.length - st.head >= this.limit) return false;
    q.push(t);
    return true;
  }
  private unlink(n: UserState): void {
    n.prev.next = n.next;
    n.next.prev = n.prev;
  }
  private pushFront(n: UserState): void {
    n.next = this.head.next;
    n.prev = this.head;
    this.head.next.prev = n;
    this.head.next = n;
  }
}
