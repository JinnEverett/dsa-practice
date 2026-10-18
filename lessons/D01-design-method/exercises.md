# D01 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D01-design-method [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D01-design-method 01`

**Pass:** 2/2 bài qua `check` **và** tự viết được tài liệu thiết kế 7 bước (một trang, theo mẫu [`DESIGN.md`](./DESIGN.md)) cho ít nhất một bài, ≤ 2 hint. Trước khi code, nói ý tưởng + độ phức tạp từng thao tác.

> Cả hai bài là **class**: `args = [ops, opArgs]`, kết quả của thao tác `void` là `null`.

---

## 🟡 Kết hợp

### ex01 · MaxStack (class)
Stack có thêm truy vấn/xóa phần tử lớn nhất.
```java
class MaxStack {
  MaxStack()
  void push(int x)
  int pop()        // xóa và trả phần tử ở đỉnh
  int top()        // xem đỉnh
  int peekMax()    // xem phần tử lớn nhất
  int popMax()     // xóa và trả phần tử lớn nhất
}
```
- `pop/top/peekMax/popMax` chỉ được gọi khi stack không rỗng. Có nhiều phần tử lớn nhất bằng nhau thì `popMax` xóa cái **gần đỉnh nhất** (đẩy vào sau cùng).
- Ràng buộc: tối đa `10⁵` lần gọi, `|x| ≤ 2³¹ − 1` (Java: `int` là đủ).
- Ví dụ: `push(5), push(1), push(5), top() → 5, popMax() → 5, top() → 1, peekMax() → 5, pop() → 1, top() → 5`. (LeetCode 716)
- Mục tiêu: `push/pop/top/peekMax` O(log n) hoặc tốt hơn, `popMax` **O(log n)** (amortized được). Xóa phần tử lớn nhất bằng quét tuyến tính sẽ trượt Perf.
- 🧭 Câu hỏi quy mô: với `n = 10⁶` lần push rồi `10⁶` lần `popMax`, bản quét tuyến tính cần bao nhiêu phép? Dự đoán Big-O của bản bạn, chạy `bench` rồi so sánh.

---

## 🔴 Thực tế

### ex02 · Ưu tiên cảnh báo theo tần suất (class)
Hệ thống giám sát nhận chuỗi mã cảnh báo (số nguyên). Khi kỹ sư rảnh tay, hệ thống đưa ra cảnh báo **xuất hiện nhiều nhất** trong những cảnh báo chưa xử lý; nếu nhiều mã cùng tần suất cao nhất thì lấy mã được **báo gần đây nhất** (đỉnh stack). Đã xử lý một lần thì cảnh báo đó bị gỡ khỏi hàng đợi, các lần báo khác của cùng mã vẫn còn.
```java
class FreqStack {
  FreqStack()
  void push(int val)   // nhận một cảnh báo mới
  int pop()            // trả và gỡ cảnh báo theo quy tắc trên; chỉ gọi khi còn cảnh báo
}
```
- Ràng buộc: tối đa `10⁵` lần gọi, `0 ≤ val ≤ 10⁹`.
- Ví dụ: push `5, 7, 5, 7, 4, 5` rồi `pop()` bốn lần → `5, 7, 5, 4`. (Lần 1: mã 5 có 3 lần → `5`. Lần 2: 5 và 7 cùng 2 lần, 7 báo gần đây hơn → `7`. Lần 3: 5 còn 2 lần, 7 còn 1 → `5`. Lần 4: 5, 7, 4 đều 1 lần, 4 mới nhất → `4`.)
- Mục tiêu: mọi thao tác **O(1)**. Đếm lại tần suất mỗi lần `pop` sẽ trượt Perf. (LeetCode 895)
