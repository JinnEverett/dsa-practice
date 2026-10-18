# D04 · Time-based / versioned key-value

## Sau buổi này bạn sẽ
- Lưu **lịch sử theo thời gian** của một giá trị và truy vấn "giá trị tại thời điểm t" bằng **binary search** trên lịch sử.
- Cài **snapshot** không sao chép toàn bộ: chỉ lưu *thay đổi* (copy-on-write theo từng ô).
- Phân biệt `floor` ("lớn nhất ≤ t") với "gần nhất" và với "đúng bằng".
- Nhận ra khi append-only + mảng sort là đủ, và khi nào cần cấu trúc có thứ tự (D09).

## 1. Lịch sử append-only + binary search

Đề cho `set(key, value, t)` với `t` **chỉ tăng** cho từng key ⇒ mỗi key là một mảng đã sort, thêm vào cuối:
```
foo:  ts  = [ 1,  4,  9, 15 ]
      val = [ a,  b,  c,  d ]
get(foo, 10): phần tử cuối có ts ≤ 10 → ts = 9 → "c"
get(foo, 0) : không có ts ≤ 0           → ""
```
Mẫu binary search **upper bound**: tìm vị trí đầu tiên có `ts[i] > t`; đáp án là `i − 1` (nếu `i = 0` thì không có).
```ts
let lo = 0, hi = ts.length;            // [lo, hi)
while (lo < hi) { const mid = (lo + hi) >>> 1; if (ts[mid] <= t) lo = mid + 1; else hi = mid; }
const idx = lo - 1;                    // -1 nếu không có
```

## 2. Snapshot: lưu thay đổi, không lưu bản sao

Mảng `length` ô, `snap()` "chụp" trạng thái và trả `snapId`; `get(i, snapId)` đọc ô `i` tại lần chụp đó.
Sao chép cả mảng mỗi `snap` tốn `O(length)` thời gian **và** bộ nhớ ⇒ với `length = 10⁵`, `10⁴` snapshot là `10⁹` ô.

Thay vào đó, mỗi ô giữ danh sách `(snapId đã sửa, giá trị)`:
```
ô 3:  snapIds = [0, 2, 5]      get(3, 4) → mục cuối có snapId ≤ 4 → snapId 2
      vals    = [7, 1, 9]
```
- `snap()` chỉ tăng bộ đếm: O(1).
- `set` trong cùng phiên bản **ghi đè** mục cuối (không push trùng `snapId`).
- Ô chưa từng `set` không tốn gì (dùng `Map` thưa, mặc định 0).
Đây là ý tưởng **MVCC / persistent data structure** của cơ sở dữ liệu, event sourcing, undo, lịch sử giá.

## 3. Khi timestamp không còn tăng

| Tình huống | Cách |
|---|---|
| `set` luôn có `t` tăng | mảng + `push` + binary search (bài này) |
| `set` có `t` bất kỳ, ít khi chèn giữa | mảng + chèn bằng binary search + `splice` (O(m) khi chèn) |
| `set` có `t` bất kỳ, thường xuyên | cây cân bằng / skip list (`TreeMap.floorEntry`) — xem D09 |
| Nhiều key, nhiều phiên bản, cần xóa lịch sử cũ | giữ thêm "mốc nhỏ nhất còn cần" (watermark) để cắt phần đầu mảng |

## 4. Dấu hiệu nhận biết
"giá trị tại thời điểm t", "phiên bản", "snapshot", "lịch sử", "as-of query", "undo tới mốc", "giá cổ phiếu/tỉ giá theo ngày".

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Binary search sẵn có | không (tự viết) | `bisect.bisect_right(ts, t)` | `Collections.binarySearch` (trả `−(chèn)−1` khi không thấy) hoặc `TreeMap.floorEntry` |
| Lịch sử theo key | `Map<string, {ts[], vals[]}>` | `dict` các list | `HashMap<String, ArrayList<…>>` |
| Giá trị ô thưa | `Map<number, …>` | `dict` | `HashMap<Integer, …>` |

Bẫy Java: `Collections.binarySearch` khi không tìm thấy trả `−(điểm chèn) − 1`; muốn `floor` phải đổi `−r − 2`. Với chuỗi `String`, so sánh dùng `equals`, không `==`.

## 6. Bẫy
1. Không xử lý "không có bản ghi ≤ t" → đọc `vals[-1]`.
2. `<` thay vì `<=` trong binary search → bỏ sót bản ghi **đúng bằng** t.
3. Dùng `find`/`filter` trên lịch sử: O(m) mỗi truy vấn.
4. Snapshot: sao chép cả mảng; hoặc push trùng `snapId` khi `set` hai lần trong cùng phiên bản.
5. Tạo sẵn `length` mảng con rỗng (`new Array(length).fill([])` còn chia sẻ cùng một mảng!). Dùng `Map` tạo lười.

## 7. Độ phức tạp
| | `TimeMap` | `SnapshotArray` |
|---|---|---|
| ghi | `set` O(1) | `set` O(1), `snap` O(1) |
| đọc | `get` O(log m) | `get` O(log k) |
| bộ nhớ | O(tổng số `set`) | O(tổng số `set`) — không phụ thuộc `length` hay số `snap` |

🧭 Câu hỏi quy mô: `length = 10⁶`, `10⁶` thao tác với 25% là `snap`. Bản sao chép toàn bộ tốn bao nhiêu ô? Bản của bạn? Dự đoán thời gian rồi `bench` (scale `l`).

Xem [`DESIGN.md`](./DESIGN.md) cho thiết kế `SnapshotArray` đầy đủ 7 bước.
