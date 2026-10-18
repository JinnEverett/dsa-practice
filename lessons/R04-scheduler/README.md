# R04 · Scheduler & delayed queue

## Sau buổi này bạn sẽ
- Dựng **delay queue** (job chạy lúc `runAt`, có ưu tiên) bằng heap.
- Tính **retry với exponential backoff** an toàn khi số lần thử lớn (không tràn số).
- Cài **timer wheel** — khi nào nó thắng heap.
- Tính lần chạy kế tiếp của **cron** mà không duyệt từng phút.
- Mô phỏng hàng đợi nhiều worker bằng **mô phỏng theo sự kiện** (nhảy cóc thời gian).

## 1. Delay queue = min-heap theo thời điểm
```
 heap theo (runAt ↑, priority ↓, id ↑)
 poll(now): while heap.top.runAt <= now: pop
```
Job chưa tới hạn không bị đụng tới. Cách này giống BullMQ: job trễ nằm trong một **sorted set** của Redis với score = thời điểm chạy; worker lấy các phần tử có score ≤ now.

## 2. Retry & backoff
`delay_i = min(cap, base · 2^i)`. Đừng tính `2^i` trực tiếp: `i` lên tới 100 thì `2^i` tràn mọi kiểu số nguyên (Java: `1 << i` tràn từ i = 31 với `int`, i = 63 với `long`). Nhân đôi dần và chặn trần ngay: `d = min(2d, cap)`. Thực tế thêm *jitter* để các client không retry cùng lúc (thundering herd); bài này bỏ jitter cho tất định.

## 3. Timer wheel
```
 S = 4 ô           cur = 0
 add(id, 2) → ô 2, rounds 0         add(id, 5) → ô 1, rounds floor(4/4)=1
 tick: kim sang ô kế; mỗi timer trong ô: rounds = 0 → nổ, ngược lại rounds--
        [ô0] [ô1] [ô2] [ô3]
                ↑kim
```
Thêm O(1), tick chỉ chạm timer của một ô. Với hàng triệu timeout (kết nối, request) và độ phân giải thô, nó rẻ hơn heap O(log n). Nhược điểm: độ phân giải cố định; delay xa cần *hierarchical* wheel (Kafka dùng).

## 4. Cron rút gọn: tìm kế tiếp, đừng duyệt
Mỗi trường là một **tập giá trị** (`*`, `*/n` = 0, n, 2n, …, danh sách `a,b`). Lần chạy kế tiếp: cùng giờ nếu giờ khớp và còn phút ≥ phút hiện tại; không thì giờ khớp kế tiếp (≤ 24 bước) với phút nhỏ nhất. Cron theo năm mà duyệt từng phút = 525 600 bước/lần.

## 5. Mô phỏng theo sự kiện
Thay vì `for t = 0..T` (T có thể 10⁶ giây), giữ các heap sự kiện và **nhảy thẳng** tới mốc kế tiếp = `min(job kết thúc kế, job sẵn sàng kế)`. Độ phức tạp theo số sự kiện, không theo thời gian mô phỏng.

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Heap nhiều khóa | `Heap` (I04) + comparator | `heapq` + tuple `(runAt, -priority, id)` | `PriorityQueue` + comparator |
| Thời gian | `number` ms | `int` | **`long`** |
| `2^i` | `2 ** i` (float, mất chính xác > 2⁵³) | `2 ** i` (chính xác) | `1L << i` (tràn!) |
| Queue tick | mảng + chỉ số đầu | `collections.deque` | `ArrayDeque` |

## 7. Bẫy
1. `runAt ≤ now` vs `<`.
2. Heap so sánh nhiều khóa sai thứ tự ưu tiên (priority tăng/giảm).
3. Backoff: tràn số; quên cap; quên deadline.
4. Timer wheel: `rounds` lệch 1 (delay đúng bằng số ô).
5. Giờ cron: `floor(t / 60) mod 24` (không phải `% 24` của phút).
6. Mô phỏng từng đơn vị thời gian khi thời gian trải dài.

## 8. Độ phức tạp
| | time | space |
|---|---|---|
| DelayQueue schedule / poll | O(log n) / O(k log n) | O(n) |
| retrySchedule | O(attempts) | O(attempts) |
| TimerWheel add / tick | O(1) / O(timer trong ô) | O(n + S) |
| nextRun | O(60 + 24) | O(60) |
| simulateJobQueue | O(E log n), E = #sự kiện | O(n) |

## 9. Câu hỏi quy mô
Bạn có 10⁶ timeout 30 giây, mỗi giây thêm ~3·10⁴ cái mới. Heap tốn cỡ log₂(10⁶) ≈ 20 bước cho mỗi `add` và mỗi lần nổ; timer wheel 32 ô × 1 giây tốn O(1). Dự đoán tỉ lệ thời gian, rồi `bench` ex01 và ex03 ở `--scales m,l` và đối chiếu số mũ.
