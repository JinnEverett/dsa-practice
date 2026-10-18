# D09 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D09-ordered-map [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D09-ordered-map 01` · Đo: `node tools/bench.ts lessons/D09-ordered-map 01 --scales s,m,l`

**Pass:** 2/2 bài qua `check` + `bench` ex01 ở `s, m, l` và một đoạn so sánh (3–5 dòng) với bản "mảng sort + binary search" của bạn (số mũ thực nghiệm, điểm giao), ≤ 2 hint. Trước khi code, nói ý tưởng + độ phức tạp từng thao tác.

> Bài class: `args = [ops, opArgs]`; kết quả `void` là `null`; kiểu `Integer` nullable là `null` khi không có. Ex01 bắt buộc **tự cài** skip list (hoặc cấu trúc có thứ tự tương đương); không dùng `TreeMap` / `SortedList` có sẵn.

---

## 🟡 Kết hợp

### ex01 · OrderedMap (class)
```java
class OrderedMap {
  OrderedMap()
  void put(int key, int value)            // đè nếu khóa đã có
  Integer get(int key)                    // null nếu không có
  boolean remove(int key)                 // true nếu có xóa
  Integer floorKey(int key)               // khóa lớn nhất ≤ key; null nếu không có
  Integer ceilingKey(int key)             // khóa nhỏ nhất ≥ key; null nếu không có
  int rangeCount(int lo, int hi)          // số khóa k với lo ≤ k ≤ hi; lo > hi → 0
}
```
- Ràng buộc: tối đa `10⁵` lần gọi, khóa và giá trị trong `int`.
- Ví dụ: `put(10,1), put(20,2), put(30,3)`: `get(20) → 2`, `get(25) → null`, `floorKey(25) → 20`, `floorKey(5) → null`, `ceilingKey(25) → 30`, `ceilingKey(31) → null`, `rangeCount(10,30) → 3`; `remove(20) → true`, `remove(20) → false`, `rangeCount(10,30) → 2`, `floorKey(29) → 10`.
- Mục tiêu: mọi thao tác **O(log n)** (kỳ vọng). `rangeCount` duyệt khóa trong khoảng, hoặc quét toàn bộ, sẽ trượt Perf.
- 🧭 Câu hỏi quy mô: bạn dự đoán bao nhiêu phần tử thì mảng sort + `splice` thua bản của bạn? Chạy `bench` cả hai.

---

## 🔴 Thực tế

### ex02 · Đặt phòng họp không trùng giờ — MyCalendar (class)
Hệ thống đặt phòng họp chỉ nhận một yêu cầu nếu khoảng thời gian không giao với bất kỳ lần đặt nào đã nhận.
```java
class MyCalendar {
  MyCalendar()
  boolean book(int start, int end)       // true và ghi nhận nếu [start, end) không giao lần đặt nào; ngược lại false và không ghi
}
```
- Khoảng **nửa mở** `[start, end)`: `[10,20)` và `[20,30)` không giao nhau.
- Ràng buộc: `0 ≤ start < end ≤ 10⁹`, tối đa `10⁵` lần gọi.
- Ví dụ: `book(10,20) → true, book(15,25) → false, book(20,30) → true`. (LeetCode 729)
- Mục tiêu: `book` O(log n) (chỉ nhìn hai hàng xóm). Quét mọi lần đặt sẽ trượt Perf. Bạn có thể dùng chính `OrderedMap` ở ex01 (hãy thêm vào `answers/ex02.*` bản copy tối giản của nó).
- Follow-up (nói miệng): nếu cho phép chồng lấp tối đa `k` lần đặt (LeetCode 731/732), cấu trúc nào phù hợp? (Gợi ý: map độ chênh lệch +1/−1 và quét, hoặc cây phân đoạn.)
