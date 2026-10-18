# P07 · Timed set: Hard / mixed

## Mục tiêu
Giải **4 bài mức Hard/mixed**, mỗi bài **40 phút**, không gợi ý trong giờ. Có bài cần **kết hợp hai kỹ thuật** (BFS + hash map; sort + hai heap). Mục tiêu là *thực hành chiến lược khi bài khó*: chọn bài, phân bổ giờ, lấy điểm từng phần.

**Pass:** ≥ 2/4 bài qua `check` **trong giờ**.

## Luật
1. 40 phút/bài (160 phút cả set); có thể nghỉ giữa các bài. Hết giờ một bài: nộp bản đang có (kể cả chỉ đúng một phần), ghi "quá giờ".
2. Không xin gợi ý trong giờ. Có thể hỏi sau giờ.
3. Bắt buộc theo khung P02: hỏi lại đề → ví dụ → brute → tối ưu → code → test → phân tích. Với bài Hard, **brute đúng + Big-O** vẫn được tính là tiến triển (ghi vào `answers/p07.md`).
4. Khung bài: `node tools/scaffold.ts lessons/P07-timed-hard --lang ts|py|java`; chấm `node tools/check.ts lessons/P07-timed-hard NN`.
5. Không mở `solutions.ts` trước khi `check` ✅ hoặc hết giờ.

## Khung 40 phút
| Phút | Việc |
|---|---|
| 0–8 | Đọc kỹ, hỏi ràng buộc, ví dụ + edge, brute, bất biến/ý tưởng |
| 8–28 | Code (nói thành tiếng) |
| 28–36 | Dry-run + `check`; sửa |
| 36–40 | Phân tích Big-O, đánh đổi; ghi bài học |

Nếu đến phút 12 chưa có hướng tối ưu: **code brute cho đúng** trước (để có điểm từng phần và công cụ so sánh), rồi tối ưu.

## Chiến lược khi bài khó
1. **Giải một bài đơn giản hơn trước** (n nhỏ, thiếu một ràng buộc) rồi mở rộng.
2. **Vẽ ví dụ nhỏ** và tìm bất biến. Với tìm kiếm nhị phân/chia đôi: "điều gì luôn đúng sau mỗi bước?".
3. **Chia việc**: dựng cấu trúc dữ liệu (map, heap) trước, rồi vòng lặp chính.
4. **Tự tạo phản ví dụ** cho ý tưởng greedy trước khi code (P04).

## Pattern trong set này
Binary search trên **phân hoạch** (không phải trên giá trị) · DP trên hậu tố cho khớp mẫu · BFS trên "tuyến" + hash map điểm dừng → tuyến · sắp xếp + hai heap + mô phỏng.

## Theo ngôn ngữ
| | TS | Python | Java |
|---|---|---|---|
| Hay vấp | không có heap sẵn → dùng `Heap` ở I04 (hoặc tự cài); biên ±∞ ở ex01 | `heapq` chỉ min-heap; tuple so sánh nhiều khóa | `int` tràn ở ex01 (trung bình) và ex04 (thời điểm kết thúc > 2³¹) |

## Bẫy
1. ex01: binary search trên mảng dài hơn; `(a + b) / 2` trên `int`.
2. ex02: quên "x\*" khớp 0 lần; đệ quy không nhớ (hàm mũ).
3. ex03: BFS trên điểm dừng thay vì trên tuyến; đếm số điểm dừng thay vì số tuyến.
4. ex04: không sắp theo `start`; `<` thay vì `≤` khi giải phóng phòng; `int` cho thời điểm kết thúc.

## Câu hỏi quy mô
Với ex02: dự đoán thời gian bản đệ quy không nhớ với `s = "a"×30`, `p = "a*"×15 + "b"`; chạy đúng thử nghiệm đó (và `n = 5, 10, 15, 20`) để thấy tăng trưởng. Với ex04: ở `n = 2·10⁴` phòng, 10⁵ cuộc họp, bản quét mọi phòng và bản hai heap chênh nhau bao nhiêu lần (`bench`)?
