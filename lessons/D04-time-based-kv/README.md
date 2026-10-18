# D04 · Time-based / versioned KV

## Sau buổi này bạn sẽ
- Lưu **lịch sử** theo thời gian (append-only) và truy vấn "giá trị tại thời điểm t" bằng **binary search**.
- Cài **snapshot** không sao chép toàn bộ: chỉ lưu thay đổi (delta / copy-on-write theo chỉ số).
- Phân biệt `lower bound` / `upper bound` và dùng đúng cái cần ("phần tử cuối cùng ≤ t").

## 1. "Tại thời điểm t" = upper bound − 1

```
ts   = [ 1,  4,  4', 9 ]        (tăng dần)
get(t=5): số phần tử ≤ 5 là 3  → lấy chỉ số 3−1 = 2
get(t=0): số phần tử ≤ 0 là 0  → chưa có giá trị → mặc định ("" hoặc 0)
```
```ts
function countLE(a: number[], x: number): number {   // upper bound
  let lo = 0, hi = a.length;
  while (lo < hi) { const m = (lo + hi) >>> 1; if (a[m] <= x) lo = m + 1; else hi = m; }
  return lo;
}
```
Điều kiện tiên quyết: mảng đã sắp. Với KV theo thời gian, nếu `set` luôn có timestamp tăng thì **append là đủ** (mảng tự sắp).

## 2. Snapshot không sao chép

Sao chép cả mảng mỗi `snap()` = O(length) thời gian **và** bộ nhớ → `length × số snap`.
Thay vào đó mỗi chỉ số giữ lịch sử thưa `[(snapId, val)]`:

```
index 0:  [(0, 5), (2, 9)]      set(0,5) rồi snap#0; ...; set(0,9) rồi snap#2
get(0, snap=1) → bản ghi cuối có snapId ≤ 1 → 5
```
`snap()` chỉ tăng bộ đếm. `set` hai lần trong cùng một "kỳ" snap thì ghi đè bản ghi cuối.

## 3. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| upper bound | tự viết | `bisect.bisect_right` | tự viết (`Collections.binarySearch` trả `−(ins)−1` khi không khớp, và không rõ khớp nào khi trùng) |
| Map có thứ tự theo key | không có | không có | `TreeMap.floorEntry(t)` |
| Mặc định | `''` / `0` | `""` / `0` | `""` / `0` |

## 4. Bẫy
1. Dùng lower bound → lệch 1 khi `ts == t`.
2. Quên trường hợp "trước mọi bản ghi" → truy cập `[-1]`.
3. Snapshot: bản ghi cuối đang mang `snapId = cur` là giá trị **chưa chốt**; `set` lần nữa trong cùng kỳ phải ghi đè, nếu không lịch sử phình.
4. `snap_id` đánh số từ 0 (= số snapshot đã có trước đó).
5. Đề cho phép `set` timestamp không tăng → append không đủ (chèn có thứ tự O(m) hoặc dùng cây).

## 5. Độ phức tạp

| | set | get | space |
|---|---|---|---|
| TimeMap | O(1) am. | O(log m) | O(tổng set) |
| SnapshotArray | O(1) | O(log k) | O(length + tổng set) |
| Ngây thơ (quét / sao chép) | O(1) | O(tổng) | O(length × snap) |

## 6. Câu hỏi quy mô
Dự đoán rồi `node tools/bench.ts lessons/D04-time-based-kv 02 --scales s,m,l`: heap có tăng theo `length × số snap` không? Vì sao thời gian ở n = 10³ (gồm khởi tạo mảng `length = 50 000`) lại không nhỏ hơn nhiều so với n = 10⁵?
