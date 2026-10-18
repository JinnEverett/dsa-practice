// D03 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · HitCounter (bộ nhớ O(300)) ───
// Ý tưởng: vòng 300 ô, ô t % 300 lưu (giây, số hit trong giây đó). Ô cũ (giây khác) coi như rỗng.
//   hit(t): nếu ô chứa giây khác thì ghi đè (reset đếm) rồi ++. getHits(t): cộng các ô có giây > t − 300.
// Bất biến: ô i chỉ có giá trị hợp lệ nếu times[i] > t_hiện_tại − 300; mỗi giây trong cửa sổ ánh xạ vào một ô riêng (300 giây liên tiếp → 300 ô khác nhau).
// Độ phức tạp: hit O(1) · getHits O(300) = O(1) · space O(300), không phụ thuộc số hit.
// Vì sao best practice: bộ nhớ cố định dù có hàng triệu hit; hàng đợi các timestamp thì tốn O(số hit trong cửa sổ).
// Bẫy: ô cũ chưa bị ghi đè vẫn còn dữ liệu → PHẢI so sánh `times[i]` với cửa sổ khi đếm; off-by-one cửa sổ (t−299..t, không phải t−300..t).
// Cách khác: hàng đợi (timestamp, count) + dọn đầu hàng đợi; O(số giây khác nhau trong cửa sổ) bộ nhớ.
// Python/Java: hai mảng [0]*300 / int[300]; timestamp ≤ 10⁹ vừa int.
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
    let sum = 0;
    for (let i = 0; i < 300; i++) if (this.times[i] > timestamp - 300) sum += this.counts[i];
    return sum;
  }
}

// ─── ex02 · PerUserLimiter (cửa sổ trượt + giới hạn số user) ───
// Ý tưởng: mỗi user giữ vòng đệm kích thước `limit` chứa thời điểm của các request ĐƯỢC CHO PHÉP gần nhất (tăng dần).
//   allow: nếu vòng đầy và phần tử cũ nhất vẫn trong cửa sổ (≥ t − W + 1) → từ chối; ngược lại bỏ phần tử cũ nhất (nếu đầy) và ghi t.
//   Số user bị chặn bởi maxUsers: Map giữ thứ tự chèn, mỗi lần gọi "chạm" user (delete + set); đầy thì bỏ user đầu Map (lâu không gọi nhất).
// Bất biến: |users| ≤ maxUsers; vòng đệm của mỗi user được sắp theo thời gian; số phần tử trong cửa sổ < limit ⇔ allow.
// Độ phức tạp: allow O(1) · space O(maxUsers × limit) — không phụ thuộc số request hay số user từng xuất hiện.
// Vì sao best practice: chính xác (không xấp xỉ như fixed window), bộ nhớ chặn trên cứng.
// Bẫy: chỉ cần nhìn phần tử CŨ NHẤT trong vòng `limit` phần tử gần nhất (không cần đếm); request bị từ chối KHÔNG ghi vào lịch sử;
//   evict user mất lịch sử → họ được "tha" (đánh đổi đã chấp nhận); `get`-kiểu đọc cũng phải chạm LRU (ở đây mọi lần allow đều chạm, kể cả bị từ chối).
// Cách khác: token bucket (2 số mỗi user: tokens, lastRefill — rẻ hơn nhưng cho phép burst và không "đúng cửa sổ"); sliding window counter (xấp xỉ).
// Python/Java: Python `OrderedDict.move_to_end` + `deque(maxlen=limit)`; Java `LinkedHashMap(…, true)` + `ArrayDeque`/mảng int vòng.
interface Ring {
  buf: number[];
  start: number;
  size: number;
}
export class PerUserLimiter {
  private users = new Map<number, Ring>();
  private limit: number;
  private windowSec: number;
  private maxUsers: number;
  constructor(limit: number, windowSec: number, maxUsers: number) {
    this.limit = limit;
    this.windowSec = windowSec;
    this.maxUsers = maxUsers;
  }
  allow(user: number, t: number): boolean {
    let ring = this.users.get(user);
    if (ring) this.users.delete(user); // chạm: đưa xuống cuối thứ tự chèn
    else if (this.users.size === this.maxUsers) {
      // đuổi user lâu không gọi nhất và TÁI DÙNG vòng đệm của nó (tránh cấp phát + GC)
      const oldest: number = this.users.keys().next().value!;
      ring = this.users.get(oldest)!;
      this.users.delete(oldest);
      ring.start = 0;
      ring.size = 0;
    } else ring = { buf: new Array<number>(this.limit).fill(0), start: 0, size: 0 };
    this.users.set(user, ring);
    if (ring.size === this.limit) {
      if (ring.buf[ring.start] > t - this.windowSec) return false;
      ring.start = (ring.start + 1) % this.limit;
      ring.size--;
    }
    ring.buf[(ring.start + ring.size) % this.limit] = t;
    ring.size++;
    return true;
  }
}
