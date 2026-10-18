# D03 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D03-hit-counter-rate-limiter [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D03-hit-counter-rate-limiter 01`

**Pass:** 2/2 bài qua `check` + một trang thiết kế 7 bước cho một biến thể (vd. token bucket theo user, hoặc sliding window counter), ≤ 2 hint. Trước khi code, nói ý tưởng + bộ nhớ dự kiến.

> Bài class: `args = [ops, opArgs]`; kết quả `void` là `null`.

---

## 🟡 Kết hợp

### ex01 · Hit counter (class)
```java
class HitCounter {
  HitCounter()
  void hit(int timestamp)         // ghi một lượt truy cập lúc `timestamp` (giây)
  int getHits(int timestamp)      // số lượt trong (timestamp − 300, timestamp]
}
```
- `timestamp` **không giảm** giữa các lần gọi (có thể bằng nhau). Cửa sổ nửa mở: lượt lúc `x` còn tính khi `timestamp − x < 300`.
- Ràng buộc: `0 ≤ timestamp ≤ 2·10⁹` (vừa `int`), tối đa `10⁵` lần gọi; nhiều lượt có thể cùng một giây.
- Ví dụ: `hit(1), hit(2), hit(3), getHits(4) → 3, hit(300), getHits(300) → 4, getHits(301) → 3`. (LeetCode 362)
- Mục tiêu: bộ nhớ **O(300)** bất kể số lượt; `hit` O(1). Lưu mọi timestamp rồi lọc mỗi lần hỏi sẽ trượt Perf.
- 🧭 Câu hỏi quy mô: nếu có `10⁶` lượt mỗi giây, bộ nhớ của cách "lưu mọi timestamp" là bao nhiêu? Của bạn là bao nhiêu?

---

## 🔴 Thực tế

### ex02 · Rate limiter theo user (class)
API gateway cho phép mỗi user tối đa `limit` request được chấp nhận trong bất kỳ cửa sổ `(t − windowMs, t]`. Gateway chỉ nhớ tối đa `maxUsers` user: khi gặp user **mới** mà đã đủ `maxUsers`, nó quên user **được thấy lâu nhất** (mọi lời gọi `allow`, được phép hay không, đều tính là "thấy"). User bị quên quay lại sẽ như user mới (quota được làm mới).
```java
class PerUserLimiter {
  PerUserLimiter(int limit, long windowMs, int maxUsers)
  boolean allow(int user, long t)   // true nếu cho phép (và ghi nhận); false nếu từ chối (không ghi nhận)
}
```
- `t` không giảm giữa các lần gọi. Request bị từ chối **không** tính vào quota của lần sau.
- Ràng buộc: `1 ≤ limit ≤ 100`, `1 ≤ windowMs ≤ 10¹²`, `1 ≤ maxUsers ≤ 10⁵`, `0 ≤ t ≤ 10¹²` (Java: `long`), tối đa `10⁵` lần gọi, `user` trong `int`.
- Ví dụ (`limit = 2, windowMs = 1000`): user 7 gọi ở `t = 0, 100, 200, 999, 1000` → `true, true, false, false, true` (lượt lúc 0 hết hạn ở `t = 1000`).
- Ví dụ eviction (`limit = 1, maxUsers = 2`): `allow(1,0), allow(2,1), allow(3,2)` rồi `allow(1,3)` → `true` (user 1 đã bị quên khi user 3 vào).
- Mục tiêu: `allow` **O(1) amortized**, bộ nhớ **O(maxUsers · limit)**. Quét tìm user cũ nhất mỗi lần evict sẽ trượt Perf.
- 🧭 Câu hỏi quy mô: `maxUsers = 10⁶`, `limit = 100`, tính bộ nhớ tối đa; dự đoán thời gian `10⁶` lần `allow`, rồi `bench` ở scale `l`.
