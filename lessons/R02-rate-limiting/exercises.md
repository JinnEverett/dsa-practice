# R02 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R02-rate-limiting [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R02-rate-limiting 01`

**Pass:** 5/5 bài qua `check` (cài 3 thuật toán trở lên đúng + ex05 so sánh bằng mô phỏng).

Quy ước chung: `nowMs` (epoch ms, `long`) **không giảm** theo thứ tự gọi; mỗi user có trạng thái riêng, user mới bắt đầu với trạng thái trống; request bị từ chối **không** tiêu hạn mức. Ràng buộc chung: `1 ≤ limit ≤ 10⁶`, `1 ≤ windowMs ≤ 10⁶`, `0 ≤ nowMs ≤ 10¹²`, tối đa `10⁵` lần `allow`.

---

## 🟢 Cơ bản

### ex01 · Fixed window
Cửa sổ thứ `k = floor(nowMs / windowMs)` (tức `[k·W, (k+1)·W)`). Mỗi user được tối đa `limit` request được phép trong mỗi cửa sổ.
```java
class FixedWindowLimiter {
  FixedWindowLimiter(int limit, long windowMs)
  boolean allow(String user, long nowMs)
}
```
- Ví dụ: `limit=2, W=1000`: `a@0 → true, a@999 → true, a@999 → false, b@999 → true, a@1000 → true`.

### ex02 · Sliding window log
Cho qua khi số request **đã được phép** của user trong khoảng nửa mở `(nowMs − W, nowMs]` còn `< limit`.
```java
class SlidingLogLimiter {
  SlidingLogLimiter(int limit, long windowMs)
  boolean allow(String user, long nowMs)
}
```
- Ví dụ: `limit=2, W=1000`: `a@0 T, a@500 T, a@999 F, a@1000 T` (request ở t=0 vừa rời cửa sổ), `a@1500 T, a@1501 F`.
- Mục tiêu O(1) amortized/request. Perf có user bị chặn thường xuyên với log dài `3000` — bản lọc cả log sẽ quá giờ.

### ex03 · Sliding window counter
Mỗi user giữ bộ đếm cửa sổ hiện tại `cur` và cửa sổ **liền trước** `prev` (cửa sổ cố định như ex01; nếu cửa sổ trước đó không liền kề thì `prev = 0`). Với `elapsed = nowMs mod W`:

`estimate = cur + floor(prev · (W − elapsed) / W)`

Cho qua khi `estimate < limit`, rồi `cur += 1`.
```java
class SlidingCounterLimiter {
  SlidingCounterLimiter(int limit, long windowMs)
  boolean allow(String user, long nowMs)
}
```
- `prev · (W − elapsed) ≤ 10¹²`: tính bằng `long`, chia nguyên **sau** khi nhân.
- Ví dụ: `limit=4, W=1000`: `a@100,200,300,400 → T T T T`, `a@500 → F`; `a@1500 ×3 → T T F` (estimate 2, 3, 4); `a@1900 ×3 → T T F`.

---

## 🟡 Kết hợp

### ex04 · Token bucket
Mỗi user có thùng tối đa `capacity` token, **đầy** khi user xuất hiện lần đầu, nạp liên tục `refillPerSec` token / giây. Mỗi request được phép tốn đúng 1 token. Để kết quả tất định ở mọi ngôn ngữ, tính bằng **mili-token** (số nguyên): với mỗi lần gọi (cả lần bị từ chối):
```
milli = min(capacity·1000, milli + (nowMs − last)·refillPerSec);  last = nowMs
nếu milli ≥ 1000: milli −= 1000, cho qua; ngược lại từ chối
```
```java
class TokenBucket {
  TokenBucket(int capacity, int refillPerSec)
  boolean allow(String user, long nowMs)
}
```
- Ràng buộc riêng: `1 ≤ capacity ≤ 10⁶`, `1 ≤ refillPerSec ≤ 1000`.
- Ví dụ: `capacity=2, refill=1/s`: `u@0 T, u@0 T, u@0 F, u@500 F, u@1000 T, u@1000 F`.

---

## 🔴 Thực tế

### ex05 · 🔴 So sánh 4 limiter khi gặp burst ở ranh giới
Team platform muốn biết "limiter nào thật sự chặn burst": cho một user gửi request ở các thời điểm `timesMs` (không giảm), chạy lần lượt `FixedWindowLimiter(limit, W)`, `SlidingLogLimiter(limit, W)`, `SlidingCounterLimiter(limit, W)`, `TokenBucket(limit, refillPerSec)`. Với mỗi limiter, đếm số request được phép và **burst thực** = số request được phép nhiều nhất nằm trong một khoảng nửa mở `(t − W, t]` (t bất kỳ).
```java
int[] compareLimiters(int limit, long windowMs, int refillPerSec, long[] timesMs)
```
- Trả mảng 8 phần tử: `[allowedFixed, allowedLog, allowedCounter, allowedBucket, burstFixed, burstLog, burstCounter, burstBucket]`.
- Ràng buộc: `0 ≤ |timesMs| ≤ 10⁵`, các tham số như phần chung.
- Ví dụ: `compareLimiters(2, 1000, 2, [900, 950, 1000, 1050, 1100])` → `[4, 2, 3, 2, 4, 2, 3, 2]`.
- **Câu hỏi quy mô:** (1) Tự sinh 10⁵ request đều đặn rồi so burst của bốn limiter; chỗ nào lệch nhiều nhất so với `limit`? (2) Với `10⁶` user, bộ nhớ mỗi thuật toán là bao nhiêu (xem README mục 7)?
