# R02 · Rate limiting

## Sau buổi này bạn sẽ
- Cài 4 thuật toán: **fixed window**, **sliding window log**, **sliding window counter**, **token bucket**.
- Nói được mỗi cái tốn bao nhiêu bộ nhớ/user, chính xác đến đâu, cho burst bao nhiêu.
- Dùng mô phỏng để *đo* burst ở ranh giới cửa sổ thay vì tin lý thuyết.

## 1. Bài toán
`allow(user, nowMs)` → cho qua hay chặn, với hạn mức `limit` request / `windowMs`. Quy ước chung của module: `nowMs` do người gọi truyền vào và **không giảm**; request bị chặn **không** tiêu hạn mức.

## 2. Bốn thuật toán

```
Fixed window (W = 1000):   |  cửa sổ 0  |  cửa sổ 1  |
                                  ▲▲▲▲▲▲▲▲|▲▲▲▲▲▲▲▲        limit=8: 16 request trong ~2 ms quanh ranh giới!
Sliding log:    giữ timestamp các request được phép trong (t−W, t]      → chính xác, tốn O(limit)/user
Sliding counter: est = cur + floor(prev·(W − elapsed)/W)                → xấp xỉ, O(1)/user
Token bucket:   thùng ≤ capacity, nạp refill/giây, mỗi request tốn 1   → burst ≤ capacity rồi đều đặn
```

| | Bộ nhớ/user | Chính xác | Burst tối đa trong 1 khoảng W | Dùng ở |
|---|---|---|---|---|
| Fixed window | O(1) | thấp | **2·limit** | Redis `INCR`+`EXPIRE`, quota ngày |
| Sliding log | O(limit) | tuyệt đối | limit | API cần chặt, limit nhỏ |
| Sliding counter | O(1) (2 số) | xấp xỉ (giả định đều trong cửa sổ trước) | ≈ limit | Cloudflare, gateway lớn |
| Token bucket | O(1) | theo tốc độ trung bình | capacity (+ nạp thêm) | NGINX `limit_req burst`, nhiều gateway; Throttler của NestJS dùng fixed/sliding tùy storage |

(Leaky bucket ≈ token bucket nhìn từ phía "xả": hàng đợi xả đều, dư thì bỏ.)

**Ví dụ đo thật** (ex05, `limit = 2`, `W = 1000`, refill 2/s, request ở 900, 950, 1000, 1050, 1100): số request được phép = fixed 4, log 2, counter 3, bucket 2; burst thực trong 1 khoảng 1000 ms = 4 / 2 / 3 / 2. Fixed window cho 4 request trong 150 ms dù `limit = 2` mỗi giây.

## 3. Cài đặt gọn
```ts
// fixed window: khóa là chỉ số cửa sổ
const k = Math.floor(now / W);
if (e.k !== k) { e.k = k; e.c = 0; }
if (e.c >= limit) return false;
e.c++; return true;
```
```ts
// token bucket bằng số nguyên (mili-token) — tất định ở mọi ngôn ngữ
milli = Math.min(cap * 1000, milli + (now - last) * refillPerSec);
last = now;                         // cập nhật cả khi bị từ chối
if (milli < 1000) return false;
milli -= 1000; return true;
```
Sliding log: queue + chỉ số đầu (`shift()` là O(n) — bẫy quen thuộc của F12). Sliding counter: `prev` chỉ hợp lệ khi cửa sổ trước là **liền kề**, nhảy xa thì `prev = 0`.

## 4. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Thời gian | `number` (ms epoch ≈ 1,7·10¹² < 2⁵³ OK) | `int` | **`long`** — `int` tràn |
| Chia lấy phần nguyên | `Math.floor(a / b)` | `a // b` | `a / b` với `long` (dương) |
| Log theo user | `Map<string, …>` | `defaultdict(deque)` | `HashMap<String, ArrayDeque<Long>>` |
| Token bucket | số nguyên mili-token | như vậy | như vậy (tránh `double`) |

## 5. Bẫy
1. Tăng bộ đếm trước khi so `limit` (lệch 1).
2. Sliding log ghi cả request bị chặn → user bị phạt vĩnh viễn.
3. Khoảng nửa mở: request ở đúng `t − W` đã *ra khỏi* cửa sổ.
4. Token bucket dùng số thực: sai số tích lũy, kết quả khác nhau giữa TS/Python/Java.
5. Không cập nhật `last` khi từ chối → nạp token hai lần.
6. Bộ nhớ: map theo user không bao giờ dọn → rò rỉ (cần TTL/evict, xem R01).

## 6. Độ phức tạp
Cả bốn: O(1) time mỗi `allow` (log: amortized). Bộ nhớ như bảng trên.

## 7. Câu hỏi quy mô
Một API có 10⁶ user hoạt động, `limit = 100` / phút. Ước lượng bộ nhớ (byte) cho sliding log (mỗi timestamp 8 byte) so với counter và bucket. Thuật toán nào bạn chọn cho gateway và vì sao? (Viết 3 dòng trước khi chạy ex02 với `bench`.)
