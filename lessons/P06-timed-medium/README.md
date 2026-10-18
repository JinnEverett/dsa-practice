# P06 · Timed set: Medium

## Mục tiêu
Giải **5 bài mức Medium**, mỗi bài **25 phút**, không gợi ý trong giờ. Các bài trộn nhiều pattern; mỗi bài có một "điểm hay sai" cố ý.

**Pass:** ≥ 4/5 bài qua `check` **trong giờ**.

## Luật
1. Bấm giờ 25 phút/bài. Hết giờ: nộp bản đang có và ghi "quá giờ" (không tính ✅).
2. Không xin gợi ý trong giờ. Có thể hỏi coach *sau* giờ.
3. Theo khung P02: hỏi lại đề + ví dụ + brute + Big-O + ý tưởng tối ưu **trước** khi code (5 phút); code (12 phút); dry-run + `check` (6 phút); phân tích (2 phút).
4. Khung bài: `node tools/scaffold.ts lessons/P06-timed-medium --lang ts|py|java`. Chấm: `node tools/check.ts lessons/P06-timed-medium NN`.
5. Không mở `solutions.ts` trước khi `check` ✅ hoặc hết giờ.
6. Ghi `answers/p06.md` như P05 (bắt đầu/kết thúc, pattern, Big-O, bug đã gặp).

## Khung 25 phút
| Phút | Việc |
|---|---|
| 0–5 | Đọc, hỏi ràng buộc, ví dụ + edge, brute + Big-O, chọn pattern |
| 5–17 | Code (nói thành tiếng bất biến chính) |
| 17–22 | Dry-run 2 test (1 thường + 1 biên), `check` |
| 22–25 | Sửa lỗi; nếu `check` còn đỏ tới phút 22, ghi lại phản ví dụ và đừng đoán mò |

## Pattern trong set này
Công thức đếm (lập lịch) · cây → đồ thị vô hướng + BFS · BFS với ánh xạ ô "boustrophedon" · prefix sum theo mod + hash map · giữ hai "đuôi" nhỏ nhất (LIS giới hạn 3).

## Điểm hay sai (đọc sau khi làm xong, đừng đọc trước)
- ex01: `max` với số job; đếm số loại cùng tần suất lớn nhất.
- ex02: cây chỉ có đường xuống ⇒ phải có đường lên; `visited`; đệ quy trên cây lệch sâu.
- ex03: đổi số ô sang tọa độ; thang không nối tiếp; đích đạt được qua thang.
- ex04: chỉ ghi đè số dư khi chưa có; độ dài ≥ 2; tràn `int` trong Java.
- ex05: tăng **ngặt**; không cần chỉ số đúng thứ tự cho `a`, `b`.

## Theo ngôn ngữ
| | TS | Python | Java |
|---|---|---|---|
| Hay vấp | đệ quy sâu ≈ 10⁴ tầng; `shift()` | `RecursionError` ở 1000; `list.pop(0)` | `int` tràn; `HashMap` với khóa `TreeNode` cần `equals` mặc định (OK: so tham chiếu) |

## Bẫy chung
1. Dành 15 phút cho brute rồi hết giờ tối ưu.
2. Không kiểm tra ví dụ biên.
3. Viết đệ quy cho cây/đồ thị 10⁵ nút.
4. Mãi sửa bug nhỏ mà không dry-run từ đầu.

## Câu hỏi quy mô
Với ex02, tạo cây chuỗi `n = 10³, 10⁴, 10⁵` (xem generator trong `checks.ts` để hiểu dạng mảng) và `bench` bản của bạn: nếu dùng đệ quy, `n` lớn nhất chạy được là bao nhiêu? Với ex04, dự đoán thời gian của bản O(n²) ở `n = 10⁵`.
