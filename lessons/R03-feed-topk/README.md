# R03 · Feed, top-K và stream

## Sau buổi này bạn sẽ
- Gộp **k nguồn đã sắp xếp** bằng heap mà không đụng tới phần dữ liệu không cần.
- Phân trang bằng **cursor** (key) thay vì offset, và giải thích vì sao.
- Chọn top-K bằng heap kích thước K; xử lý top-K trong **cửa sổ thời gian** của stream.
- Biết khi nào phải chuyển sang xấp xỉ (Count-Min, Space-Saving — R07).

## 1. K-way merge
Mỗi nguồn (feed của một người bạn theo dõi, shard, file log) đã sắp xếp. Để lấy `limit` phần tử đầu của bản gộp:
```
 feed A: 50  20  5          heap giữ phần tử ĐẦU của mỗi feed
 feed B: 40  20  7          pop → 50 (A) → đẩy 20 (A) ; pop → 40 (B) → đẩy 20 (B) ...
```
Chi phí O(limit · log k), không phụ thuộc tổng số phần tử. Gộp hết rồi sort là O(N log N) — đo ở ex05: N = 10⁶, limit = 100, `sort` toàn bộ mất 285 ms, heap 0,1–0,2 ms (máy soạn).

## 2. Cursor thay cho offset
```
 offset: page 2 = bỏ 10 bài, lấy 10      → có bài mới chèn đầu ⇒ trang 2 lặp lại bài cuối trang 1
 cursor: page 2 = bài có key < key(bài cuối trang 1) → ổn định, mỗi trang là truy vấn độc lập
```
Điều kiện: key **duy nhất và có thứ tự toàn phần** (ở đây `ts·10⁶ + id`, tie-break bằng id). Mỗi feed sắp theo key nên tìm điểm bắt đầu bằng **binary search** (F09), rồi merge như trên.

## 3. Top-K bằng heap kích thước K
```
 đếm: Map<item, count>
 giữ min-heap K phần tử "tốt nhất", đỉnh = phần tử TỆ nhất trong K
 gặp e tốt hơn đỉnh → pop đỉnh, push e          ⇒ O(m log K) thay vì O(m log m)
```
Tie-break phải nằm trong so sánh (count giảm dần, rồi chữ cái tăng dần) — nếu không, kết quả không tất định.

## 4. Cửa sổ thời gian trên stream
Queue các sự kiện + bộ đếm theo key. Mỗi thao tác trước hết **bỏ các sự kiện cũ** (`t_event ≤ t − W`) rồi mới thêm/truy vấn. Mỗi sự kiện vào và ra đúng một lần ⇒ amortized O(1). Quên dọn khi truy vấn là bug kinh điển ("trending" của hôm qua vẫn nằm trên bảng).

## 5. Khi dữ liệu không vừa RAM
| Tình huống | Công cụ |
|---|---|
| nhiều nguồn đã sort | heap k-way (bài này) |
| top-K chính xác, nhiều key | đếm theo shard rồi merge top-K từng shard (chú ý: top-K toàn cục ≠ merge top-K cục bộ nếu key nằm nhiều shard) |
| top-K xấp xỉ, bộ nhớ O(K) | Space-Saving, Count-Min Sketch + heap (R07) |
| cửa sổ lớn | bucket theo phút/giây thay vì lưu từng sự kiện |

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Heap | `Heap` ở I04 (tự cài) | `heapq` (min-heap; đảo dấu cho max) | `PriorityQueue` (comparator) |
| k-way merge sẵn | – | `heapq.merge` | – |
| Binary search | tự viết | `bisect` | `Arrays.binarySearch` (chú ý tìm vị trí chèn) |
| Số lớn | `number` đến 2⁵³ | `int` | **`long`** cho key `ts·10⁶ + id` (≈ 10¹⁵) |

## 7. Bẫy
1. Phân trang offset với dữ liệu thay đổi.
2. Cursor `≤` thay vì `<` → lặp bài cuối.
3. `heap` top-K giữ sai chiều (đỉnh phải là phần tử tệ nhất).
4. Quên dọn cửa sổ khi gọi `top`.
5. `shift()` làm queue (O(n)) — dùng chỉ số đầu.
6. `streams.flat().sort()` với số: comparator mặc định của JS sort theo chuỗi.

## 8. Độ phức tạp
| | time | space |
|---|---|---|
| `page` | O(k log n + limit log k) | O(k) |
| top-K từ m item | O(m log K) | O(K) heap + O(m) bộ đếm |
| Trending `post` / `top` | O(1) amortized / O(a log K) | O(số bài trong cửa sổ) |
| merge timeline | O(k + limit log k) | O(k) |

## 9. Câu hỏi quy mô
Feed của bạn có 10⁶ bài, 1000 nguồn: ước lượng số phép so sánh của `page(limit = 20)` bằng heap so với gộp + sort. Rồi chạy `bench` ex05 (`--scales m,l`) và đối chiếu: hằng số của sort toàn bộ nằm ở đâu?
