---
name: dsa-review
description: |
  Chấm và review code DSA (TypeScript) người học viết theo 6 trục: đúng đắn, edge case, độ phức tạp, quy mô, khả năng đọc, an toàn khi chạy. Chạy thật qua check/bench, dùng stress test để tìm phản ví dụ, ghi lỗi lặp lại vào weaknesses.
  Triggers: /dsa-review, "chấm bài", "review code này", "code này ổn không", "sao code tôi chậm", "code này chạy được với n = 10^6 không", "độ phức tạp bao nhiêu"
---

# DSA Review: chấm bài và code review

Input có thể là một file `.ts` / `.py` / `.java`, một thư mục `answers/`, hoặc code dán trong chat (kèm đề bài nếu có). Chấm và nhận xét theo **ngôn ngữ của bài làm**.
Mục tiêu: người học **hiểu vì sao**, không chỉ nhận một bản sửa.

## Quy trình

### 1. Xác định ngữ cảnh
- Code này giải quyết đề nào? Nếu thuộc một lesson/case thì đọc đề và file check tương ứng.
- Nếu là code tự do (vd. bài LeetCode người học tự làm): hỏi ngắn gọn đề bài + ràng buộc. Khi cần chấm thật, tạo spec tạm trong scratchpad (ref + brute + gen) rồi chạy `check` trên đó.

### 2. Chạy và đo
```bash
node tools/check.ts lessons/<dir> <NN> [--lang ts|py|java]
```
- Luôn để `check` quyết định đúng/sai. Không kết luận "đúng" chỉ vì ví dụ trong đề chạy ra đúng.
- Có nghi ngờ về Big-O hoặc người học hỏi về hiệu năng: chạy `node tools/bench.ts <file> --scales s,m,l` rồi dán bảng kết quả vào phản hồi.
- Bài đúng ở ví dụ nhưng nghi có lỗi biên: chạy thêm stress với `n` rất nhỏ (0, 1, 2) để lấy phản ví dụ tối giản.

### 3. Chấm theo 6 trục
| Trục | Câu hỏi kiểm tra |
|---|---|
| **Correctness** | Có qua cases + stress không? Bất biến của vòng lặp có giữ đúng không? Greedy có lý do đúng không hay chỉ "chạy được"? |
| **Edge cases** | Input rỗng? 1 phần tử? Toàn trùng? Số âm / 0? Giá trị cực trị (tràn 2⁵³, int32 khi dùng bitwise)? Không có đáp án? Nhiều đáp án / tie? Đồ thị không liên thông, có chu trình, self-loop? |
| **Complexity** | Big-O thời gian và bộ nhớ thực sự là bao nhiêu (tính cả `includes`, `slice`, `shift`, spread, `str +=` ẩn trong vòng lặp; tính cả call stack của đệ quy)? Người học nói có khớp không? |
| **Scale** | Còn ổn ở `n = 10⁶` không? Có đệ quy sâu gây stack overflow không? Có tạo object/mảng thừa trong vòng lặp nóng không? Kiểm chứng bằng `bench`, không đoán |
| **Readability** | Tên biến nói lên ý nghĩa (`left/right`, `lo/hi`, `dp[i]` có comment định nghĩa state)? Hàm phụ có cần thiết không? Có early return thay cho lồng if sâu? Kiểu TS rõ ràng chưa? |
| **Safety** | Có sửa input khi đề không cho phép (`mutate-input`)? `sort()` mặc định trên số? So sánh float bằng `===`? Vòng lặp có thể không dừng? Dùng object làm map với key từ input (`__proto__`, `constructor`)? |

Đánh giá mỗi trục là ✅ / ⚠️ / ❌, kèm 1 câu giải thích. Trục nào không áp dụng thì bỏ qua.

### 4. Phản hồi
Mẫu:
```
Kết quả: ❌ stress sai ở input nhỏ nhất: nums = [3, 3], target = 6
         bài làm → [0, 0] · kỳ vọng → [0, 1]

Correctness ❌  kiểm tra map trước khi thêm i hay sau khi thêm? Thử dry-run [3, 3]
Complexity  ✅  O(n) time, O(n) space — khớp với bạn nói
Edge cases  ⚠️  chưa nghĩ tới trường hợp phần tử trùng
Readability ⚠️  biến `m`, `x` khó đọc, nên là `seen`, `need`

👉 Thử dry-run input trên từng bước. Gợi ý: lúc i = 0, map đang chứa gì?
```
- Bài **sai**: KHÔNG đưa code đã sửa. Chỉ nêu vấn đề, đưa phản ví dụ, đặt câu hỏi dẫn dắt.
- Bài **đúng**: **bắt buộc** nhận xét và nêu best practice, kể cả khi bài đã tốt. Gồm: điểm làm đúng; độ phức tạp (xác nhận hoặc sửa); cách viết chuẩn nhất (nếu bài đã là best practice thì nói thẳng và vì sao; nếu còn cách tốt hơn thì **luôn kèm code mẫu đầy đủ ở ngôn ngữ của bài làm** (dịch từ `solutions.ts`, dùng idiom/thư viện chuẩn theo ghi chú Python/Java trong đó), đã chạy thật qua `check`, rồi 2–3 lý do: Big-O / hằng số / ít bug biên / dễ đọc; chỉ mô tả bằng lời mà không có code là chưa đạt); số đo so sánh (`bench`) khi liên quan hiệu năng, ghi rõ giới hạn nếu chỉ đo 1 lần; và trade-off nếu bản của người học dễ đọc hơn hoặc khác biệt không đáng kể.
- Có nhiều vấn đề: chỉ nêu tối đa 3 vấn đề quan trọng nhất mỗi lượt.

### 5. Ghi nhận
- Lỗi thuộc dạng pattern (xem danh sách tag gợi ý đầu `progress/weaknesses.md`): thêm dòng mới hoặc tăng `count`.
- Tag dùng kebab-case, ngắn gọn. Trước khi tạo tag mới, kiểm tra xem đã có tag tương tự chưa để tái sử dụng.
