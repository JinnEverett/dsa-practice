# D01 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D01-design-method [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D01-design-method 01`

**Pass:** cả 2 bài qua `check` **và** bạn điền được checklist 7 bước (ghi ra giấy/`DESIGN.md` của riêng bạn) cho **một** trong hai bài *trước khi* code; trả lời đúng câu hỏi quy mô bên dưới.

> Quy tắc nói-trước-khi-code: trước khi viết, nêu cấu trúc ghép + bảng độ phức tạp từng thao tác.

---

## 🟡 Kết hợp

### ex01 · MaxStack (class)
```java
class MaxStack {
  MaxStack()
  void push(int x)
  int pop()
  int top()
  int peekMax()
  int popMax()
}
```
- `push` đẩy `x` lên đỉnh. `pop` bỏ và trả phần tử trên cùng. `top` xem phần tử trên cùng. `peekMax` xem giá trị lớn nhất. `popMax` bỏ và trả giá trị lớn nhất; **nếu có nhiều phần tử cùng giá trị lớn nhất thì bỏ cái nằm trên cùng nhất** (push sau cùng).
- `pop/top/peekMax/popMax` chỉ được gọi khi stack không rỗng.
- Ràng buộc: tối đa `10⁵` lần gọi tổng cộng, `|x| ≤ 10⁹` (vừa `int`).
- Mục tiêu: `top` O(1), các thao tác còn lại O(log n) (amortized chấp nhận được). Bản quét mảng O(n) mỗi `peekMax/popMax` sẽ quá giờ.
- Ví dụ: `push(5), push(1), push(5), top() → 5, popMax() → 5` (bỏ số 5 trên cùng) `, top() → 1, peekMax() → 5, pop() → 1, top() → 5`. (LeetCode 716)

### ex02 · FreqStack — stack theo tần suất (class)
```java
class FreqStack {
  FreqStack()
  void push(int val)
  int pop()
}
```
- `push` thêm `val`. `pop` bỏ và trả phần tử **xuất hiện nhiều lần nhất** trong stack hiện tại; nếu hòa, bỏ cái **gần đỉnh nhất** (push sau cùng trong số các giá trị hòa; mỗi lần `pop` chỉ bỏ một bản sao).
- `pop` chỉ gọi khi stack không rỗng.
- Ràng buộc: tối đa `10⁵` lần gọi, `0 ≤ val ≤ 10⁹`.
- Mục tiêu: O(1) mỗi thao tác. Bản đếm lại cả stack mỗi `pop` quá giờ.
- Ví dụ: `push 5,7,5,7,4,5` rồi `pop ×4` → `5, 7, 5, 4`. (LeetCode 895)

---

## 🔴 Câu hỏi quy mô (không code)

Dự đoán trước, rồi kiểm chứng: `node tools/bench.ts lessons/D01-design-method 01 --scales s,m,l`.
1. Với bản stack + heap của bạn, thời gian cho `n = 10⁶` thao tác ≈ bao nhiêu lần so với `n = 10⁵`? Vì sao số mũ ước lượng có thể lớn hơn 1.1 dù thuật toán O(n log n)?
2. Ước lượng RAM của `10⁶` entry `{val, id, dead}` trong Node (gợi ý: mỗi object nhỏ ≈ 32–40 byte, cộng slot của mảng và của heap).
3. Kịch bản xấu: 10⁶ lần `push` rồi 10⁶ lần `pop` (không bao giờ gọi `peekMax`). Heap giữ bao nhiêu entry chết ở cuối? Bạn sửa thế nào để bộ nhớ không phình mãi? (Gợi ý: đếm số entry chết, dựng lại heap khi chết > sống.)
