# D10 · Text buffer & undo/redo

## Sau buổi này bạn sẽ
- Mô hình hóa con trỏ trong trình soạn thảo bằng **hai stack** (và hiểu gap buffer, rope, piece table là gì).
- Cài **undo/redo** bằng **mẫu Command** với hai stack, **xóa nhánh redo** khi có lệnh mới, **giới hạn lịch sử**.
- Phân biệt **command** (lưu cách đảo ngược) và **memento** (lưu ảnh chụp).
- Nhận ra chi phí ẩn: ghép/cắt chuỗi dài, `shift()` bỏ lệnh cũ, chạy lại toàn bộ lịch sử.

## 1. Con trỏ = ranh giới giữa hai stack

```
văn bản: "leet|code"                 left  = [l e e t]      (đỉnh: t)
         con trỏ ở dấu |             right = [e d o c]      (đỉnh: c, lưu NGƯỢC)

addText("X")      : push 'X' vào left
deleteText(k)     : pop tối đa k lần từ left
cursorLeft(k)     : chuyển ≤ k ký tự từ đỉnh left sang đỉnh right
cursorRight(k)    : chuyển ≤ k ký tự từ đỉnh right sang đỉnh left
```
Mọi thao tác chỉ chạm quanh con trỏ, chi phí tỉ lệ với số ký tự bị chuyển — không phụ thuộc độ dài văn bản. Cách ngây thơ `text.slice(0, i) + s + text.slice(i)` copy O(n) mỗi lần.

## 2. Các cấu trúc văn bản trong thực tế

| Cấu trúc | Ý tưởng | Chèn tại con trỏ | Chèn ở vị trí bất kỳ | Dùng ở |
|---|---|---|---|---|
| Hai stack (bài này) | tách theo con trỏ | O(1)/ký tự | O(khoảng cách tới con trỏ) | bài tập |
| **Gap buffer** | một mảng + "khoảng trống" ở con trỏ | O(1) | di chuyển gap O(khoảng cách) | Emacs |
| **Rope** | cây cân bằng các đoạn chuỗi | O(log n) | O(log n) | văn bản rất lớn |
| **Piece table** | danh sách các "mảnh" trỏ vào bản gốc + buffer chỉ-thêm | O(1) amortized | O(số mảnh) | VS Code, Word |
| Mảng ký tự | | O(n) | O(n) | |

Piece table và rope là cấu trúc *bất biến một phần* nên undo rất rẻ: lưu con trỏ gốc cây/danh sách mảnh cũ.

## 3. Undo/redo: hai stack

```
done   (có thể undo)   [ +hello , +" world" , -3 ]  ← đỉnh = lệnh gần nhất
undone (có thể redo)   [ ]

apply(cmd)  : thực hiện; done.push(cmd); undone.clear()       ← lệnh mới làm "tương lai" cũ vô nghĩa
undo()      : cmd = done.pop(); đảo ngược; undone.push(cmd)
redo()      : cmd = undone.pop(); thực hiện lại; done.push(cmd)
```
**Command** lưu đủ thông tin để đảo ngược:
- `+text` → đảo ngược: bỏ `text.length` ký tự cuối.
- `-k` → phải lưu **phần đã bị xóa** (`removed`); đảo ngược: thêm lại `removed`. Nếu văn bản ngắn hơn `k`, `removed` ngắn hơn `k` — lưu phần thực sự mất!

**Memento** (lưu cả ảnh chụp mỗi lệnh) đơn giản hơn nhưng tốn O(độ dài) bộ nhớ mỗi lệnh, trừ khi cấu trúc dữ liệu bất biến chia sẻ phần chung.

## 4. Giới hạn lịch sử

Không giới hạn ⇒ RAM tăng mãi. Với `maxHistory`: khi `done` vượt giới hạn thì **bỏ lệnh cũ nhất** (không thể undo lệnh đó nữa; văn bản vẫn giữ kết quả của nó). Bỏ phần đầu mảng bằng `shift()` là O(n) trên mảng lớn ⇒ dùng chỉ số `head` (bỏ O(1)), thỉnh thoảng cắt bỏ phần đã bỏ, hoặc ring buffer / `deque`.

Tổng `|done| + |undone| ≤ maxHistory` luôn đúng (undo chỉ chuyển lệnh giữa hai stack).

## 5. Dấu hiệu nhận biết
"con trỏ", "chèn/xóa tại vị trí hiện tại", "undo/redo", "lịch sử thao tác", "quay lại trang trước/sau" (browser history có cùng cấu trúc), "giới hạn N bước".

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Stack ký tự | `string[]` (hoặc mảng số mã ký tự) | `list` | `StringBuilder` / `ArrayDeque<Character>` |
| Bỏ lệnh cũ nhất | mảng + `head` | `deque(maxlen=N)` | `ArrayDeque.pollFirst()` |
| Ghép nhiều ký tự | `join('')` | `''.join(list)` | `StringBuilder.toString()` |

Bẫy Python: nối chuỗi `s += c` trong vòng lặp lớn thường ổn trên CPython nhưng không bảo đảm; dùng list rồi `join`. Bẫy Java: `String +=` trong vòng lặp là O(n²).

## 7. Bẫy
1. Không xóa `undone` khi có `apply` mới ⇒ `redo` áp lệnh trên văn bản đã khác.
2. `-k` lưu `k` thay vì phần đã xóa ⇒ không đảo ngược được.
3. `k` lớn hơn độ dài mà vẫn cố xóa/di chuyển `k` lần ⇒ lỗi chỉ số.
4. Trả 10 ký tự **đầu** thay vì 10 ký tự **cuối** trước con trỏ.
5. `state()` tính bằng cách chạy lại mọi lệnh từ đầu: O(lịch sử) mỗi lần.
6. `history.shift()` để bỏ lệnh cũ trên lịch sử lớn.
7. Đảo ngược thứ tự ký tự hai lần khi chuyển giữa `left` và `right` (quên `right` lưu ngược).

## 8. Độ phức tạp
| | thời gian | bộ nhớ |
|---|---|---|
| `TextEditor.addText(t)` | O(|t|) | O(n) |
| `deleteText(k)`, `cursorLeft/Right(k)` | O(k) | |
| `UndoRedo.apply/undo/redo` | O(độ dài lệnh) | O(maxHistory · kích thước lệnh) |
| `UndoRedo.state()` | O(độ dài văn bản) | |

🧭 Câu hỏi quy mô: văn bản 10⁶ ký tự, 10⁵ thao tác ở vị trí con trỏ. Cách `slice + nối` tốn bao nhiêu ký tự copy? Hai stack tốn bao nhiêu? Dự đoán rồi `bench` (scale `l`).

Xem [`DESIGN.md`](./DESIGN.md) cho thiết kế `UndoRedo` đầy đủ 7 bước.
