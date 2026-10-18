# F11 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F11-linked-list [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F11-linked-list 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint.

> Trong đề, danh sách viết dạng mảng `[1,2,3]` cho dễ đọc; hàm của bạn nhận/trả `ListNode`. Danh sách có chu trình viết `{vals: [3,2,0,-4], pos: 1}` = node cuối nối về node chỉ số 1.
> Các danh sách trong bộ test dài tới **10⁵ node** — lời giải đệ quy sẽ tràn stack; hãy dùng vòng lặp.

---

## 🟢 Cơ bản

### ex01 · Đảo ngược danh sách
```java
ListNode reverseList(ListNode head)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `[1,2,3,4,5]` → `[5,4,3,2,1]` · `[]` → `[]`. Mục tiêu: O(n), O(1) bộ nhớ. (LeetCode 206)

### ex02 · Node giữa
Trả về node giữa (danh sách bắt đầu từ node đó). Có 2 node giữa thì lấy node **thứ hai**.
```java
ListNode middleNode(ListNode head)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[1,2,3,4,5]` → `[3,4,5]` · `[1,2,3,4,5,6]` → `[4,5,6]`. Mục tiêu: một lượt duyệt. (LeetCode 876)

### ex03 · Có chu trình không?
```java
boolean hasCycle(ListNode head)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `{vals:[3,2,0,-4], pos:1}` → `true` · `{vals:[1], pos:-1}` → `false` · `[]` → `false`.
- Mục tiêu: **O(1)** bộ nhớ (không dùng Set). (LeetCode 141)

### ex04 · Trộn hai danh sách đã sort
Trộn thành một danh sách tăng dần bằng cách **nối lại các node có sẵn**.
```java
ListNode mergeTwoLists(ListNode l1, ListNode l2)
```
- Ràng buộc: `0 ≤ n, m ≤ 10⁵`, mỗi danh sách không giảm.
- Ví dụ: `[1,2,4], [1,3,4]` → `[1,1,2,3,4,4]` · `[], [0]` → `[0]`. (LeetCode 21)

---

## 🟡 Kết hợp

### ex05 · Xóa node thứ n từ cuối
```java
ListNode removeNthFromEnd(ListNode head, int n)
```
- Ràng buộc: `1 ≤ độ dài ≤ 10⁵`, `1 ≤ n ≤ độ dài`.
- Ví dụ: `[1,2,3,4,5], 2` → `[1,2,3,5]` · `[1], 1` → `[]` · `[1,2], 2` → `[2]`.
- Mục tiêu: một lượt duyệt. (LeetCode 19)

### ex06 · Danh sách đối xứng
```java
boolean isPalindromeList(ListNode head)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ val ≤ 9`.
- Ví dụ: `[1,2,2,1]` → `true` · `[1,2]` → `false` · `[1,2,3,2,1]` → `true`.
- Mục tiêu: O(n) time, **O(1)** bộ nhớ (gợi ý: tìm giữa + đảo nửa sau). (LeetCode 234)

### ex07 · Điểm bắt đầu chu trình
Trả về **chỉ số** (tính từ 0) của node nơi chu trình bắt đầu, không có chu trình → `-1`.
```java
int detectCycleStart(ListNode head)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `{vals:[3,2,0,-4], pos:1}` → `1` · `{vals:[1,2], pos:0}` → `0` · `{vals:[1], pos:-1}` → `-1`.
- Mục tiêu: O(1) bộ nhớ (Floyd). (LeetCode 142, trả chỉ số thay cho node)

### ex08 · Cộng hai số dạng danh sách
Mỗi danh sách biểu diễn một số không âm, chữ số **hàng đơn vị ở đầu**. Trả về danh sách của tổng (cùng quy ước).
```java
ListNode addTwoNumbers(ListNode l1, ListNode l2)
```
- Ràng buộc: `1 ≤ độ dài ≤ 10⁵`, mỗi node 0–9, không có số 0 thừa ở cuối (trừ chính số 0).
- Ví dụ: `[2,4,3], [5,6,4]` → `[7,0,8]` (342 + 465 = 807) · `[9,9,9,9], [9,9]` → `[8,9,0,0,1]`. (LeetCode 2)

---

## 🔴 Thực tế

### ex09 · Gộp k luồng sự kiện đã sort
> "k service, mỗi service đẩy một danh sách sự kiện đã sắp theo timestamp. Gộp thành một dòng thời gian duy nhất."

```java
ListNode mergeKLists(ListNode[] lists)
```
- Ràng buộc: `0 ≤ k ≤ 10⁴`, tổng số node `N ≤ 10⁵`, mỗi danh sách không giảm.
- Ví dụ: `[[1,4,5],[1,3,4],[2,6]]` → `[1,1,2,3,4,4,5,6]` · `[]` → `[]` · `[[]]` → `[]`.
- Mục tiêu: O(N log k). Trộn lần lượt từng danh sách vào kết quả là O(N·k) → trượt Perf. (Gợi ý: chia để trị như merge sort; I04 sẽ có cách dùng heap.) (LeetCode 23)

### ex10 · Lịch sử trình duyệt
> "Tab trình duyệt bắt đầu ở `homepage`. `visit(url)` mở trang mới và **xóa toàn bộ lịch sử forward**. `back(steps)` lùi tối đa `steps` trang, `forward(steps)` tiến tối đa `steps` trang; cả hai trả về URL hiện tại sau khi di chuyển."

```java
class BrowserHistory {
  BrowserHistory(String homepage)
  void visit(String url)
  String back(int steps)
  String forward(int steps)
}
```
- Ràng buộc: tối đa `10⁵` lần gọi, `1 ≤ steps ≤ 100`.
- Ví dụ: `BrowserHistory("a")`, `visit("b")`, `visit("c")`, `back(1)` → `"b"`, `back(5)` → `"a"`, `forward(1)` → `"b"`, `visit("d")`, `forward(2)` → `"d"`, `back(2)` → `"a"`.
- Yêu cầu: cài bằng **doubly linked list** (mỗi node có `prev`/`next`). Sau đó tự hỏi: dùng mảng + con trỏ thì có gọn hơn không? (LeetCode 1472)
