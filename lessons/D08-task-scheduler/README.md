# D08 · Task scheduler & timer

## Sau buổi này bạn sẽ
- Dùng **min-heap theo thời điểm** để lập lịch "việc kế tiếp đến hạn", kể cả việc **lặp lại**.
- Cài **hủy / sửa độ ưu tiên** với **xóa lười + phiên bản (version)** thay vì xóa giữa heap.
- Biết **dựng lại heap** để chặn xác chết làm phình bộ nhớ.
- Nắm khái niệm **timer wheel** và khi nào nó thắng heap.

## 1. Heap + bảng "sự thật hiện hành"

Heap rất giỏi "lấy phần tử nhỏ nhất", rất dở "xóa/sửa một phần tử bất kỳ" (cần biết vị trí). Mẹo kinh điển:

```
pending: id → {ver, at, period}        ← sự thật hiện hành (xóa/sửa O(1))
heap   : sự kiện (at, id, ver)          ← có thể chứa sự kiện cũ ("xác chết")

schedule(id, at): ver++, pending[id] = {ver, at}, heap.push({at, id, ver})
cancel(id)      : pending.delete(id)                          (sự kiện cũ vẫn nằm trong heap)
advance(now)    : while heap.top.at ≤ now:
                    ev = pop
                    if pending[ev.id]?.ver ≠ ev.ver: bỏ (xác chết)
                    else phát ev.id
```
- Mỗi sự kiện vào heap một lần và ra một lần ⇒ tổng chi phí O((số sự kiện) log n).
- **Phiên bản** vô hiệu hóa sự kiện cũ khi lên lịch lại cùng `id` mà không cần tìm nó.
- **Dựng lại khi `heap.size > 2 × pending + 16`**: nếu không, hủy hàng triệu việc ở tương lai xa để lại hàng triệu xác chết không bao giờ nổi lên.

## 2. Việc lặp lại

Sau khi phát một lần, đẩy sự kiện kế tiếp với `at + period` (**không** phải `now + period`): giữ nhịp đúng khi `advance(now)` đến muộn. Nếu `now` nhảy xa, vòng lặp tự phát nhiều lần ("catch-up"); cần quyết định chính sách: đề này phát đủ mọi lần, hệ thống thật thường giới hạn hoặc bỏ qua (skip missed ticks).

## 3. Thứ tự khi hòa

Hai việc cùng `at` phải có thứ tự **xác định** ⇒ so sánh `(at, id)`. Không có tie-break thì hai lần chạy cho kết quả khác nhau (khó test, khó debug).

## 4. Timer wheel: khi nào thay heap?

```
wheel (1 vòng = 8 ô, tick = 1 ms):   [0][1][2][3][4][5][6][7]   mỗi ô là một danh sách việc
con trỏ hiện tại chạy theo thời gian; schedule(delay) → ô (hiện tại + delay) % 8
```
| | Heap | Timer wheel |
|---|---|---|
| schedule | O(log n) | O(1) |
| cancel (với node trong danh sách) | lười O(1) | O(1) |
| lấy việc đến hạn | O(log n) mỗi việc | O(1) mỗi việc |
| độ phân giải | tùy ý | cố định (1 tick) |
| nhiều tầng (giờ/phút/giây) | không cần | hierarchical wheel cho khoảng dài |
Dùng: Linux kernel, Kafka (purgatory), Netty `HashedWheelTimer`. Node.js `setTimeout` gộp các timer cùng độ trễ vào một danh sách liên kết và dùng heap cho các danh sách.

## 5. Dấu hiệu nhận biết
"việc chạy ở thời điểm T", "hủy việc", "lặp mỗi N giây", "độ ưu tiên thay đổi", "lấy việc ưu tiên cao nhất rồi chạy", "hàng đợi ưu tiên có sửa/xóa".

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Heap | tự cài (`Heap` I04) | `heapq` (tuple `(at, id, ver)`) | `PriorityQueue<long[]>` + comparator |
| Có sẵn lập lịch | `setTimeout`/`setInterval` (không kiểm soát được thứ tự khi hòa) | `sched.scheduler`, `threading.Timer` | `ScheduledThreadPoolExecutor` (heap + xóa) |
| Thời gian ms | `number` | `int` | **`long`** (`int` tràn sau ~24,8 ngày tính ms) |

Bẫy Java: comparator `(a, b) -> a[0] - b[0]` tràn số với `long`; dùng `Long.compare`.

## 7. Bẫy
1. Lên lịch lại cùng `id` mà không vô hiệu hóa sự kiện cũ ⇒ phát hai lần.
2. Sửa trường `priority` của object **đang nằm trong heap** (không đẩy lại) ⇒ heap sai thứ tự.
3. Không dựng lại ⇒ rò bộ nhớ.
4. Việc lặp: `now + period` thay vì `at + period` (trôi nhịp).
5. Hòa `at` không có tie-break.
6. `advance` không dừng khi heap rỗng (đỉnh `undefined`).

## 8. Độ phức tạp
| | `TaskScheduler` | `TaskManager` |
|---|---|---|
| thêm / sửa | `schedule` O(log n) | `add`, `edit` O(log n) |
| xóa | `cancel` O(1) | `rmv` O(1) |
| lấy | `advance` O((f + s) log n) | `execTop` O(log n) amortized |
| space | O(n) | O(n) |

(f = số việc phát ra, s = xác chết bị bỏ — mỗi xác chết bị bỏ đúng một lần.)

🧭 Câu hỏi quy mô: 10⁶ việc, mỗi việc bị `edit` 10 lần. Heap có thể chứa bao nhiêu sự kiện nếu không dựng lại? Dự đoán, rồi `bench` ở scale `l` và nhìn cột `heap MB`.

Xem [`DESIGN.md`](./DESIGN.md) cho thiết kế `TaskScheduler` đầy đủ 7 bước.
