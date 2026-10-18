# D09 · Ordered map (skip list)

## Sau buổi này bạn sẽ
- Giải thích vì sao JS **không có** `TreeMap` và các lựa chọn: mảng sort + binary search, danh sách chia khối (D06), **skip list**, cây cân bằng.
- Cài **skip list** có tầng ngẫu nhiên và thêm **`span`** để có `rank`, `at(i)`, `rangeCount` đều O(log n).
- Dùng `floor` / `ceiling` để giải bài **lịch đặt chỗ không trùng** chỉ bằng nhìn hai hàng xóm.
- Đọc được kết quả `bench` để biết **khi nào mảng sort thắng, khi nào skip list thắng**.

## 1. Ordered map làm được gì mà hash map không làm được

| Thao tác | Hash map | Ordered map |
|---|---|---|
| `get/put/remove` | O(1) | O(log n) |
| `floorKey(k)` — khóa lớn nhất ≤ k | O(n) | O(log n) |
| `ceilingKey(k)` — khóa nhỏ nhất ≥ k | O(n) | O(log n) |
| `rangeCount(lo, hi)` | O(n) | O(log n) với span |
| duyệt theo thứ tự khóa | phải sort | O(n) |

Dấu hiệu: "gần nhất", "trước/sau", "trong khoảng", "bao nhiêu khóa nhỏ hơn", "lịch/đặt chỗ", "giá gần nhất", "predecessor/successor".

## 2. Skip list

```
tầng 3:  head ─────────────────────────────► 50 ─────────────────► nil
tầng 2:  head ─────────► 20 ─────────────────► 50 ───────────► 70 ─► nil
tầng 1:  head ──► 10 ──► 20 ──► 30 ───► 40 ──► 50 ──► 60 ──► 70 ─► nil
tầng 0:  head → 10 → 20 → 30 → 35 → 40 → 50 → 60 → 70 → nil     (mọi nút)
```
- Mỗi nút được nâng thêm một tầng với xác suất 1/2 ⇒ ~½ số nút ở tầng 1, ¼ ở tầng 2, …
- **Tìm key:** bắt đầu ở tầng cao nhất của `head`; trượt sang phải khi nút kế còn `< key`, ngược lại hạ xuống tầng dưới. Kỳ vọng ≈ 2·log₂ n bước.
- Không có xoay cây, không cân bằng: tính ngẫu nhiên cân bằng *kỳ vọng*. Dùng RNG có **seed** (ở đây mulberry32) để test tái lập.

**Thêm `span`:** mỗi liên kết ghi số nút tầng 0 nó nhảy qua. Cộng span trên đường tìm kiếm = số nút đứng trước ⇒ `rankLess(key)`; đi theo span để tới phần tử thứ `i` ⇒ `at(i)`. Đây là *order-statistic skip list* chính là cấu trúc của **Redis sorted set**.

```
rangeCount(lo, hi) = rankLessEq(hi) − rankLess(lo)         // hai lần tìm, không duyệt khóa giữa
```

## 3. Các phương án trong thực tế

| Cấu trúc | Chèn/xóa | Tìm / rank | Ghi chú |
|---|---|---|---|
| Mảng sort + binary search | O(n) (memmove) | O(log n) | hằng số rất nhỏ; thắng khi n nhỏ |
| Danh sách chia khối (D06) | O(√n) | O(√n) | ít code, cache tốt |
| **Skip list + span** | O(log n) kỳ vọng | O(log n) | ~100 dòng, không xoay |
| Cây đỏ-đen / AVL | O(log n) | O(log n) (+ kích thước cây con cho rank) | `TreeMap` Java; phức tạp |
| B-tree | O(log n) | O(log n) | cơ sở dữ liệu, ít lần đọc đĩa |

**Số đo thật** (cùng một trình sinh thao tác trộn put/get/remove/floor/ceiling/rangeCount, khóa rải trong ±10⁹; Node 24; `node tools/bench.ts … --scales s,m,l`):

| n thao tác | skip list (ms) | mảng sort + `splice` (ms) |
|---|---|---|
| 10³ | 0.46 | 0.20 |
| 10⁵ | 91.8 | 211 |
| 10⁶ | 2 627 | 19 500 (đo 1 lần) |

Mảng sort nhanh hơn ở n nhỏ nhờ hằng số, nhưng thời gian tăng theo số mũ ≈ 1,5–2 (chèn O(n)); skip list ≈ 1,1–1,5. Điểm giao nằm ở khoảng n từ vài nghìn tới vài chục nghìn phần tử trên máy đo.

## 4. Lịch đặt chỗ: chỉ nhìn hai hàng xóm

Các khoảng đã nhận không giao nhau ⇒ sắp theo `start` cũng sắp theo `end`. Muốn đặt `[s, e)`:
```
prev = floor(s)    → khoảng có start lớn nhất ≤ s   → phải có prev.end ≤ s
next = ceiling(s)  → khoảng có start nhỏ nhất ≥ s   → phải có next.start ≥ e
```
Khoảng **nửa mở** `[start, end)`: `[10,20)` và `[20,30)` không giao nhau.

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Ordered map có sẵn | không | không (`sortedcontainers.SortedDict` ngoài chuẩn) | `TreeMap` (`floorKey`, `ceilingKey`, `subMap`) |
| Số phần tử trong khoảng | tự cài span | `bisect_right − bisect_left` trên list sort | `subMap(lo, true, hi, true).size()` là **O(k)**, không phải O(log n) |
| Skip list có sẵn | không | không | `ConcurrentSkipListMap` (đồng thời, không có rank) |

Bẫy Java: `Integer` so sánh bằng `==` với giá trị > 127 sai; `TreeMap.get` trả `null` nên dùng `Integer`, không `int`.

## 6. Bẫy
1. Quên cập nhật `span` ở các tầng **không** chứa nút mới/xóa (mọi liên kết vượt qua vị trí đó phải ±1).
2. `put` đè khóa cũ nhưng vẫn tăng `size`.
3. `floor`/`ceiling` trả `0` hoặc `-1` khi không có — phải `null`.
4. `rangeCount` bằng vòng lặp từ `ceiling(lo)`: O(số khóa trong khoảng).
5. RNG không seed ⇒ test không tái lập, lỗi hiếm khó bắt.
6. Khoảng đóng–mở nhầm thành đóng–đóng trong bài lịch.
7. Chỉ kiểm hàng xóm một phía.

## 7. Độ phức tạp
| | thời gian (kỳ vọng) | bộ nhớ |
|---|---|---|
| `put/get/remove/floor/ceiling` | O(log n) | O(n) |
| `rangeCount`, `rank`, `at(i)` | O(log n) | |
| `book` (lịch) | O(log n) | O(n) |

🧭 Câu hỏi quy mô: dự đoán `n` mà mảng sort + `splice` bắt đầu thua skip list trên máy bạn (đoán trước, rồi chạy `bench` cả hai ở `s`, `m`, `l`).

Xem [`DESIGN.md`](./DESIGN.md) cho thiết kế `OrderedMap` đầy đủ 7 bước.
