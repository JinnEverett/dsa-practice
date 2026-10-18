# D03 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D03-hit-counter-limiter [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D03-hit-counter-limiter 01`

**Pass:** 2/2 bài qua `check`, DESIGN.md của bạn cho ex02 (7 bước), trả lời được câu hỏi quy mô và câu 🔴.

---

## 🟢 Cơ bản

### ex01 · HitCounter (class)
```java
class HitCounter {
  HitCounter()
  void hit(int timestamp)
  int getHits(int timestamp)
}
```
- `hit(t)`: ghi nhận một lượt truy cập ở giây `t`. `getHits(t)`: số lượt truy cập trong `300` giây gần nhất, tức các giây trong `[t−299, t]`.
- `timestamp` **không giảm** qua toàn bộ chuỗi gọi (cả `hit` lẫn `getHits`); nhiều `hit` có thể cùng giây. `1 ≤ timestamp ≤ 10⁹`.
- Ràng buộc: tối đa `10⁵` lần gọi; có thể có hàng triệu hit cùng giây trong thực tế → **bộ nhớ phải O(300)**, không phụ thuộc số hit (checker không đo bộ nhớ, bạn tự giác).
- Ví dụ: `hit(1), hit(2), hit(3), getHits(4) → 3, hit(300), getHits(300) → 4, getHits(301) → 3`. (LeetCode 362)

---

## 🟡 Kết hợp

### ex02 · PerUserLimiter (class)
```java
class PerUserLimiter {
  PerUserLimiter(int limit, int windowSec, int maxUsers)
  boolean allow(int user, int t)
}
```
- `allow(user, t)`: cho phép request nếu số request **đã được cho phép** của `user` trong các giây `[t − windowSec + 1, t]` ít hơn `limit`; khi đó ghi nhận request và trả `true`. Ngược lại trả `false` (request bị từ chối **không** được ghi nhận).
- Tối đa `maxUsers` user được theo dõi cùng lúc. Khi một user **mới** xuất hiện mà đã đủ `maxUsers`, bỏ lịch sử của user **lâu không gọi nhất** (mọi lần gọi `allow` đều tính là "gọi", kể cả bị từ chối). User bị bỏ quay lại thì coi như mới.
- `t` không giảm qua các lần gọi. Ràng buộc: `1 ≤ limit ≤ 100`, `1 ≤ windowSec ≤ 10⁹`, `1 ≤ maxUsers ≤ 10⁵`, `0 ≤ user ≤ 10⁹`, `0 ≤ t ≤ 10⁹`, tối đa `10⁵` lần gọi.
- Mục tiêu: `allow` O(1); bộ nhớ O(maxUsers × limit).
- Ví dụ: `PerUserLimiter(2, 10, 5)`: `allow(1,1) → true, allow(1,2) → true, allow(1,3) → false, allow(1,11) → true` (cửa sổ `[2,11]` chỉ còn request t=2), `allow(1,12) → true`.
  Ví dụ đuổi user: `PerUserLimiter(1, 100, 1)`: `allow(1,0) → true, allow(2,1) → true` (đuổi user 1), `allow(1,2) → true` (user 1 mới lại), `allow(1,3) → false`.

---

## 🔴 Tình huống nghiệp vụ (viết DESIGN.md)

API gateway có 3 triệu API key; hạn mức 100 request/phút/key; gateway có 4 pod.
1. Tại sao fixed window "1 phút theo đồng hồ" cho phép 200 request trong 2 giây? Vẽ dòng thời gian.
2. Kẻ tấn công gửi request với 10⁷ key giả để đẩy key thật ra khỏi `maxUsers`. Hậu quả với thiết kế evict-LRU của bạn? Biện pháp (gợi ý: tách bucket cho key đã xác thực; hoặc evict theo "ít request nhất").
3. 4 pod mỗi pod đếm riêng: hạn mức thực tế là bao nhiêu? Khi nào bắt buộc dùng Redis (`INCR` + `EXPIRE`, hoặc sorted set + Lua) và cái giá (RTT mỗi request)?
