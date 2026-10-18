# D06 · Leaderboard

## Sau buổi này bạn sẽ
- Thiết kế bảng xếp hạng với **cập nhật điểm**, **top-K** và **thứ hạng của một người** — ba thao tác kéo cấu trúc dữ liệu về ba hướng khác nhau.
- So sánh **heap**, **cấu trúc có thứ tự**, **bucket/đếm** và chọn theo tải thực tế.
- Cài một **danh sách có thứ tự chia khối** (sqrt decomposition) khi ngôn ngữ không có `TreeMap`.
- Chốt rõ ngữ nghĩa **hòa điểm** và **hạng**: dense / competition / toàn phần.

## 1. Ba thao tác, ba yêu cầu

| Thao tác | Muốn |
|---|---|
| `update(player, score)` | tra theo id O(1) + sửa vị trí trong thứ tự |
| `top(k)` | đọc k phần tử đầu theo thứ tự O(k) |
| `rank(player)` | đếm số người đứng trước ⇒ cần **thống kê thứ tự** (order statistic) |

Không cấu trúc đơn lẻ nào làm cả ba tốt:

| Cấu trúc | update | top(k) | rank | Ghi chú |
|---|---|---|---|---|
| `Map` + sort mỗi lần hỏi | O(1) | O(n log n) | O(n log n) | đúng nhưng chậm |
| `Map` + quét | O(1) | O(n) hoặc O(n log k) | O(n) | chấp nhận khi n nhỏ / hỏi hiếm |
| Heap + xóa lười | O(log n) | O(k log n) (pop rồi đẩy lại) | không làm được hiệu quả | hợp với "chỉ cần top" |
| Cây cân bằng / skip list có kích thước cây con | O(log n) | O(k + log n) | O(log n) | chuẩn (Redis ZSET) |
| Danh sách chia khối (bài này) | O(√n) | O(k + n/B) | O(√n) | tự cài được trong ~60 dòng |
| Bucket theo điểm (điểm nguyên, dải nhỏ) | O(1) | O(số bucket) | O(số bucket) hoặc Fenwick O(log) | tốt khi điểm ≤ ~10⁶ |

## 2. Danh sách chia khối

```
blocks: [ [k1 k2 ... ≤ 2B] , [ ... ] , [ ... ] ]     mỗi khối tăng dần, khối i < khối i+1
chèn key : bsearch khối (theo phần tử đầu) → bsearch trong khối → splice
vượt 2B  : tách đôi khối
rank(key): tổng độ dài các khối đứng trước + vị trí trong khối
```
Với n = 10⁵ và B = 512: ~100–200 khối ⇒ mọi thao tác ~ vài trăm bước. Mã hóa `(điểm, id)` thành **một số** `((MAX − điểm) × 2¹⁷ + id)` để so sánh số nguyên (nhớ giữ trong 2⁵³).

## 3. Chốt ngữ nghĩa hạng trước khi code

| Kiểu | Ví dụ điểm 90, 90, 80 | Dùng khi |
|---|---|---|
| Toàn phần (tie-break bằng id) | 1, 2, 3 | bài này: hạng duy nhất, dễ test |
| Competition ("1224") | 1, 1, 3 | thể thao |
| Dense ("1223") | 1, 1, 2 | cấp bậc |

Đổi kiểu hạng = đổi cấu trúc: dense cần đếm số **điểm khác nhau**, không phải số người.

## 4. Dấu hiệu nhận biết
"top K", "xếp hạng", "người ở hạng bao nhiêu", "điểm thay đổi liên tục", "bảng điểm game".

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Có thứ tự khóa | không có (tự cài) | `sortedcontainers.SortedList` (ngoài chuẩn) / `bisect.insort` O(n) | `TreeSet`, `TreeMap` (không có rank O(log n) sẵn) |
| Heap | tự cài (`Heap` I04) | `heapq` | `PriorityQueue` |
| Tổng K điểm | `number` | `int` | **`long`** — 100 điểm × 10⁹ vượt `int` |

## 6. Bẫy
1. Sort lại toàn bộ cho mỗi `top` / `rank`.
2. Quên bỏ khóa **cũ** khi cập nhật ⇒ người chơi xuất hiện hai lần.
3. Mã hóa khóa vượt 2⁵³ ⇒ so sánh sai lặng lẽ (kiểm tra `MAX × span`).
4. `update` ĐẶT điểm khác `addScore` CỘNG dồn — đọc kỹ đề.
5. Hòa điểm không có tie-break xác định ⇒ test không tất định.
6. Java `int` cho tổng K điểm.

## 7. Độ phức tạp (bài này)
| | `Leaderboard` | `RankBoard` |
|---|---|---|
| ghi | `addScore`, `reset` O(√n) | `update` O(√n) |
| đọc | `top(K)` O(K + n/B) | `rank` O(√n), `top(k)` O(k + n/B) |
| space | O(n) | O(n) |

🧭 Câu hỏi quy mô: nếu 90% thao tác là `rank` và chỉ 10% là `update`, cấu trúc nào đáng tiền hơn? Dự đoán thời gian cho `10⁶` thao tác rồi `bench` (scale `l`).

Xem [`DESIGN.md`](./DESIGN.md) cho thiết kế `RankBoard` đầy đủ 7 bước.
