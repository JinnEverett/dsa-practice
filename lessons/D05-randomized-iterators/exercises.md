# D05 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D05-randomized-iterators [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D05-randomized-iterators 01`

**Pass:** 3/3 bài qua `check` + nêu được bất biến của `RandomizedCollection` và giải thích bẫy `i === last`, ≤ 2 hint. Trước khi code, nói ý tưởng + độ phức tạp từng thao tác.

> Bài class: `args = [ops, opArgs]`. Với `RandomizedCollection`, `getRandom` là ngẫu nhiên nên checker **mô phỏng lại** chuỗi thao tác để kiểm tính hợp lệ (và phân phối khi có đợt `getRandom` dài); không có "đáp án duy nhất".

---

## 🟡 Kết hợp

### ex01 · RandomizedCollection (class)
Multiset (cho phép trùng) với lấy ngẫu nhiên.
```java
class RandomizedCollection {
  RandomizedCollection()
  boolean insert(int val)     // thêm một bản sao; true nếu val CHƯA có trong tập trước lúc thêm
  boolean remove(int val)     // xóa MỘT bản sao nếu có; true nếu xóa được, false nếu val không có
  int getRandom()             // trả một phần tử ngẫu nhiên; chỉ gọi khi tập không rỗng
}
```
- `getRandom` chọn đều theo **bản sao**: giá trị xuất hiện `c` lần trong tập tổng `n` phần tử được chọn với xác suất `c/n`.
- Ràng buộc: tối đa `10⁵` lần gọi, `|val| ≤ 2³¹ − 1`.
- Ví dụ: `insert(1) → true, insert(1) → false, insert(2) → true, getRandom()` → `1` với xác suất 2/3, `2` với 1/3; `remove(1) → true`, `getRandom()` → `1` hoặc `2` đều 1/2. (LeetCode 381)
- Mục tiêu: mọi thao tác **O(1)** trung bình. `indexOf` + `splice` sẽ trượt Perf.

### ex02 · PeekingIterator (class)
Iterator có thêm `peek()`.
```java
class PeekingIterator {
  PeekingIterator(int[] nums)
  int peek()          // xem phần tử kế tiếp, KHÔNG làm tiến; chỉ gọi khi hasNext() = true
  int next()          // trả phần tử kế tiếp và tiến; chỉ gọi khi hasNext() = true
  boolean hasNext()
}
```
- Ràng buộc: `0 ≤ nums.length ≤ 1000`, tối đa 1000 lần gọi.
- Ví dụ: `[1,2,3]`: `next() → 1, peek() → 2, next() → 2, next() → 3, hasNext() → false`. (LeetCode 284)
- Yêu cầu thiết kế (tự giác): mô phỏng đúng tinh thần LeetCode — nguồn chỉ cung cấp `next()` kiểu iterator; **đừng** dùng chỉ số mảng để `peek()`. Hãy giữ một phần tử đệm nhìn trước.

---

## 🔴 Thực tế

### ex03 · ZigzagIterator — gộp xen kẽ hai feed (class)
Bảng tin hiển thị xen kẽ bài từ hai nguồn: 1 bài nguồn A, 1 bài nguồn B, rồi lặp lại; khi một nguồn hết thì hiển thị tiếp phần còn lại của nguồn kia. Nguồn có thể rất lớn, nên **không được** sao chép/gộp sẵn dữ liệu.
```java
class ZigzagIterator {
  ZigzagIterator(int[] a, int[] b)
  int next()          // chỉ gọi khi hasNext() = true
  boolean hasNext()
}
```
- Ràng buộc: `0 ≤ a.length, b.length ≤ 1000`, giá trị trong `int`.
- Ví dụ: `a = [1,2], b = [3,4,5,6]` → `1,3,2,4,5,6`. `a = [], b = [7]` → `7`. (LeetCode 281)
- Follow-up (nói miệng): với `k` nguồn thì sửa gì? (Gợi ý: cấu trúc bạn chọn đã đủ tổng quát chưa?)
