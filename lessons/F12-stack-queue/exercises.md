# F12 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F12-stack-queue [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F12-stack-queue 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint.

---

## 🟢 Cơ bản

### ex01 · Ngoặc hợp lệ
Chuỗi gồm `()[]{}`. Hợp lệ khi mỗi ngoặc mở được đóng bởi đúng loại và đúng thứ tự.
```java
boolean isValid(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁵`.
- Ví dụ: `"()[]{}"` → `true` · `"(]"` → `false` · `"([)]"` → `false` · `"{[]}"` → `true` · `"]"` → `false`. (LeetCode 20)

### ex02 · Min stack (class)
```java
class MinStack {
  MinStack()
  void push(int val)
  void pop()
  int top()
  int getMin()
}
```
- Mọi thao tác **O(1)**. `pop/top/getMin` chỉ được gọi khi stack không rỗng.
- Ràng buộc: tối đa `10⁵` lần gọi, `|val| ≤ 2³¹ − 1`.
- Ví dụ: `push(-2), push(0), push(-3), getMin() → -3, pop(), top() → 0, getMin() → -2`. (LeetCode 155)

### ex03 · Tính biểu thức hậu tố (RPN)
```java
int evalRPN(String[] tokens)
```
- Token là số nguyên hoặc `+ - * /`. Chia nguyên làm tròn **về 0**. Input hợp lệ, kết quả trung gian vừa `int`, không chia cho 0.
- Ràng buộc: `1 ≤ số token ≤ 10⁴`.
- Ví dụ: `["2","1","+","3","*"]` → `9` · `["4","13","5","/","+"]` → `6` · `["10","6","9","3","+","-11","*","/","*","17","+","5","+"]` → `22`. (LeetCode 150)

### ex04 · Queue bằng hai stack (class)
```java
class MyQueue {
  MyQueue()
  void push(int x)
  int pop()
  int peek()
  boolean empty()
}
```
- Chỉ dùng thao tác stack (push/pop đỉnh, xem đỉnh, kích thước). `pop/peek` chỉ gọi khi không rỗng.
- Ràng buộc: tối đa `10⁵` lần gọi. Mục tiêu: O(1) **amortized**. (LeetCode 232)

---

## 🟡 Kết hợp

### ex05 · Rút gọn đường dẫn Unix
Đường dẫn tuyệt đối → dạng chuẩn: bắt đầu bằng `/`, các thư mục cách nhau đúng một `/`, không có `/` cuối (trừ gốc), không có `.` hay `..`. `..` ở gốc vẫn là gốc. `...` là tên thư mục bình thường.
```java
String simplifyPath(String path)
```
- Ràng buộc: `1 ≤ |path| ≤ 3000`.
- Ví dụ: `"/home/"` → `"/home"` · `"/home//foo/"` → `"/home/foo"` · `"/a/./b/../../c/"` → `"/c"` · `"/../"` → `"/"` · `"/.../a/../b/"` → `"/.../b"`. (LeetCode 71)

### ex06 · Bộ đếm request gần đây (class)
`ping(t)` ghi nhận request lúc `t` (ms) và trả về số request trong khoảng `[t − 3000, t]` (gồm cả request vừa ping).
```java
class RecentCounter {
  RecentCounter()
  int ping(int t)
}
```
- `t` tăng nghiêm ngặt giữa các lần gọi, tối đa `10⁵` lần gọi.
- Ví dụ: `ping(1) → 1, ping(100) → 2, ping(3001) → 3, ping(3002) → 3`.
- Bẫy: queue dùng `shift()` / `pop(0)` / `remove(0)` sẽ trượt Perf. (LeetCode 933)

### ex07 · Hàng đợi vòng (class)
```java
class CircularQueue {
  CircularQueue(int k)
  boolean enQueue(int value)   // false nếu đầy
  boolean deQueue()            // false nếu rỗng
  int front()                  // -1 nếu rỗng
  int rear()                   // -1 nếu rỗng
  boolean isEmpty()
  boolean isFull()
}
```
- Dung lượng cố định `k`, cài bằng **mảng k ô** + chỉ số, không dùng queue có sẵn.
- Ràng buộc: `1 ≤ k ≤ 1000`, `0 ≤ value ≤ 1000`, tối đa `10⁵` lần gọi.
- Ví dụ: `k = 3`: `enQueue(1) → true, enQueue(2) → true, enQueue(3) → true, enQueue(4) → false, rear() → 3, isFull() → true, deQueue() → true, enQueue(4) → true, rear() → 4`. (LeetCode 622)

### ex08 · Va chạm thiên thạch
Giá trị tuyệt đối là khối lượng, dấu là hướng (dương → phải, âm → trái), mọi thiên thạch cùng tốc độ. Hai thiên thạch gặp nhau thì cái nhỏ vỡ, bằng nhau thì cả hai vỡ. Trả về trạng thái cuối cùng.
```java
int[] asteroidCollision(int[] asteroids)
```
- Ràng buộc: `2 ≤ n ≤ 10⁴`, `1 ≤ |a[i]| ≤ 1000`, `a[i] ≠ 0`.
- Ví dụ: `[5,10,-5]` → `[5,10]` · `[8,-8]` → `[]` · `[10,2,-5]` → `[10]` · `[-2,-1,1,2]` → `[-2,-1,1,2]`. (LeetCode 735)

---

## 🔴 Thực tế

### ex09 · Kiểm tra thẻ HTML lồng đúng
> "Trình soạn email cần chặn template lỗi. Template gồm văn bản thường, thẻ mở `<tên>`, thẻ đóng `</tên>` và thẻ tự đóng `<tên/>`. Tên thẻ gồm chữ thường a–z (≥ 1 ký tự). Template hợp lệ khi mọi thẻ mở được đóng đúng tên, đúng thứ tự lồng."

```java
boolean validTags(String html)
```
- Ràng buộc: `0 ≤ |html| ≤ 10⁵`. Mọi ký tự `<` trong input đều bắt đầu một thẻ có đúng định dạng trên (không cần kiểm tra cú pháp thẻ hỏng).
- Ví dụ: `"<a>xin <b>chào</b></a>"` → `true` · `"<a><b></a></b>"` → `false` · `"<br/>text"` → `true` · `"<a>"` → `false` · `"</a>"` → `false` · `""` → `true`.

### ex10 · Trình soạn thảo có Undo
> "Một ô soạn thảo nhận lần lượt các lệnh: `type <chuỗi>` (gõ thêm chuỗi vào cuối), `delete <k>` (xóa tối đa k ký tự cuối), `undo` (hoàn tác lệnh type/delete **gần nhất chưa bị hoàn tác**; không còn gì để hoàn tác thì bỏ qua). Trả về nội dung cuối cùng."

```java
String runEditor(String[] commands)
```
- Ràng buộc: `0 ≤ số lệnh ≤ 10⁵`, chuỗi gõ gồm chữ thường, dài ≤ 10, `1 ≤ k ≤ 10⁵`, tổng độ dài kết quả mọi thời điểm ≤ 10⁶.
- Ví dụ: `["type ab", "type cd", "delete 3", "undo", "undo"]` → `"ab"` · `["type a", "undo", "undo"]` → `""`.
- Mục tiêu: mỗi lệnh tốn thời gian tỉ lệ với **lượng ký tự nó thay đổi**, không chép lại toàn bộ văn bản.
