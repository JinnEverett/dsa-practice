# D10 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D10-text-buffer-undo [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D10-text-buffer-undo 01`

**Pass:** 2/2 bài qua `check` + một trang thiết kế 7 bước cho biến thể "undo theo nhóm" (nhiều lệnh gõ liên tiếp gộp thành một bước undo), ≤ 2 hint. Trước khi code, nói ý tưởng + độ phức tạp từng thao tác.

> Bài class: `args = [ops, opArgs]`; kết quả `void` là `null`.

---

## 🟡 Kết hợp

### ex01 · TextEditor (class)
Trình soạn thảo một dòng có con trỏ; mọi thao tác xảy ra ở con trỏ.
```java
class TextEditor {
  TextEditor()
  void addText(String text)         // chèn `text` ngay tại con trỏ; con trỏ nằm sau phần vừa chèn
  int deleteText(int k)             // xóa tối đa k ký tự ở BÊN TRÁI con trỏ; trả số ký tự thực sự xóa
  String cursorLeft(int k)          // dời con trỏ sang trái tối đa k ký tự; trả tối đa 10 ký tự cuối bên trái con trỏ (sau khi dời)
  String cursorRight(int k)         // dời sang phải tối đa k ký tự; trả như trên
}
```
- Con trỏ không bao giờ vượt ra ngoài văn bản. Văn bản chỉ gồm chữ thường.
- Ràng buộc: `1 ≤ |text| ≤ 40`, `1 ≤ k ≤ 40`, tối đa `10⁵` lần gọi.
- Ví dụ: `addText("leetcode")`, `deleteText(4) → 4`, `addText("practice")`, `cursorRight(3) → "etpractice"`, `cursorLeft(8) → "leet"`, `deleteText(10) → 4`, `cursorLeft(2) → ""`, `cursorRight(6) → "practi"`. (LeetCode 2296)
- Mục tiêu: chi phí mỗi thao tác tỉ lệ với `|text|`, `k` — **không** phụ thuộc độ dài văn bản. Cắt/ghép chuỗi cả văn bản mỗi lần sẽ trượt Perf.
- 🧭 Câu hỏi quy mô: văn bản dài tới ~`2·10⁶` ký tự sau `10⁵` lần `addText`. Dự đoán chi phí cách `slice + nối` và cách hai stack, rồi `bench`.

---

## 🔴 Thực tế

### ex02 · Undo / redo có giới hạn lịch sử — UndoRedo (class)
Ứng dụng ghi chú cho phép gõ thêm, xóa cuối, hoàn tác và làm lại; chỉ nhớ `maxHistory` thao tác gần nhất để giới hạn RAM.
```java
class UndoRedo {
  UndoRedo(int maxHistory)
  void apply(String op)       // "+text": thêm text vào cuối; "-k": xóa tối đa k ký tự cuối (k lớn hơn độ dài thì xóa hết)
  boolean undo()              // hoàn tác lệnh gần nhất còn trong lịch sử; false nếu không còn lệnh nào
  boolean redo()              // làm lại lệnh vừa bị undo (gần nhất); false nếu không có
  String state()              // văn bản hiện tại
}
```
- Văn bản ban đầu rỗng. Mỗi `apply` là một lệnh, kể cả `"-k"` trên văn bản rỗng (undo/redo của nó thành công nhưng không đổi gì).
- `apply` làm **mất toàn bộ redo**. Khi số lệnh có thể undo vượt `maxHistory`, lệnh **cũ nhất** bị quên (không undo được nữa; kết quả của nó vẫn nằm trong văn bản).
- Ràng buộc: `1 ≤ maxHistory ≤ 10⁵`, `op` là `"+"` + chuỗi chữ thường độ dài 1–100, hoặc `"-"` + số nguyên `1 ≤ k ≤ 10⁵`; tối đa `10⁵` lần gọi.
- Ví dụ (`maxHistory = 10`): `apply("+hello"), apply("+ world"), state() → "hello world"`, `undo() → true`, `state() → "hello"`, `redo() → true`, `state() → "hello world"`.
- Ví dụ giới hạn (`maxHistory = 2`): `apply("+a"), apply("+b"), apply("+c")`, `undo() → true`, `undo() → true`, `undo() → false` (lệnh `+a` đã bị quên), `state() → "a"`.
- Mục tiêu: `apply/undo/redo` tỉ lệ với độ dài lệnh; **không** chạy lại toàn bộ lịch sử và **không** dùng `shift()` để bỏ lệnh cũ. Chạy lại lịch sử cho mỗi `state()` sẽ trượt Perf.
