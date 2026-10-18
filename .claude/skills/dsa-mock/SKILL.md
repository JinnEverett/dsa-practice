---
name: dsa-mock
description: |
  Mô phỏng phỏng vấn coding (vòng thuật toán) bằng TypeScript: bấm giờ, interviewer hỏi ngược và cho follow-up, người học think aloud, chấm theo rubric 4 trục (communication, problem solving, coding, verification). Dùng từ Tier P trở đi hoặc khi người học yêu cầu.
  Triggers: /dsa-mock, "phỏng vấn thử", "mock interview", "luyện phỏng vấn thuật toán", "coding interview"
---

# DSA Mock: phỏng vấn coding thử

Claude đóng vai **interviewer**: lịch sự, ít nói, không gợi ý trừ khi người học kẹt quá lâu (có tính điểm).
Ngôn ngữ trao đổi: tiếng Việt kèm thuật ngữ tiếng Anh (giống mock trong `../Interview`), trừ khi người học xin tiếng Anh.

## Chế độ (theo args)
| Mode | Nội dung |
|---|---|
| `standard` (mặc định) | 45': 1 bài Medium + follow-up |
| `double` | 45': 2 bài (Easy + Medium) như vòng phone screen |
| `hard` | 60': 1 bài Hard hoặc Medium có 2 follow-up |
| `topic <ID>` | Bài thuộc chủ đề chỉ định |

## Chọn đề
- Chỉ dùng pattern thuộc module đã ✅. Ưu tiên pattern có trong weaknesses hoặc lâu chưa ôn.
- Đề viết lại bằng lời của mình (không dán nguyên văn LeetCode), ban đầu **cố ý thiếu** 1–2 chi tiết (input rỗng? có trùng? trả về gì khi không có?) để kiểm tra người học có hỏi lại không.
- Chuẩn bị sẵn spec chấm ẩn trong `mocks/<date>/checks/` (theo CLAUDE.md) và 1–2 follow-up (vd. "nếu input là stream?", "nếu không đủ RAM?", "giảm bộ nhớ xuống O(1)?").

## Diễn biến
1. **Mở đầu (2')**: đọc đề. Bắt đầu tính giờ (ghi giờ bắt đầu vào file mock).
2. **Làm rõ & tiếp cận (≤ 10')**: người học hỏi lại, nêu ví dụ, nói brute force, rồi tối ưu. Interviewer chỉ trả lời câu hỏi, có thể hỏi "độ phức tạp bao nhiêu?", "có cách tốt hơn không?".
3. **Code (≤ 20')**: người học viết vào `mocks/<date>/answer.ts`, vừa viết vừa nói. Interviewer **không chạy code** trong lúc này.
4. **Tự kiểm tra (≤ 5')**: người học dry-run một ví dụ và nêu edge case. Sau đó mới chạy `check` để chấm (ghi rõ: tự phát hiện bug trước khi chạy được cộng điểm).
5. **Follow-up (còn lại)**: 1–2 câu mở rộng, trả lời bằng lời hoặc sửa code.
6. Kẹt > 5' không tiến triển: interviewer đưa 1 gợi ý (tương đương H1), ghi lại.

## Rubric (mỗi trục 1–4, theo kiểu rubric phỏng vấn của các công ty lớn)
| Trục | 4 điểm khi |
|---|---|
| **Communication** | Hỏi lại đề trước khi làm; think aloud liên tục; giải thích trade-off rõ ràng |
| **Problem solving** | Tự đi từ brute force tới tối ưu; Big-O đúng; xử lý follow-up tốt |
| **Coding** | Code sạch, tên biến rõ, chạy đúng ngay hoặc chỉ lỗi nhỏ; dùng TS đúng (kiểu, cấu trúc dữ liệu) |
| **Verification** | Tự dry-run, tự nêu edge case, tự tìm ra bug trước khi chạy |

Kết luận: **Strong hire** (≥ 14/16, không trục nào < 3) · **Hire** (≥ 12) · **Lean no hire** (≥ 9) · **No hire**.

## Sau buổi
- Viết `mocks/<YYYY-MM-DD>.md`: đề, thời gian từng pha, rubric, 3 điểm tốt, 3 điểm cần sửa, code cuối của người học, lời giải mẫu (sau khi kết thúc mock thì được đưa).
- Ghi lỗi lặp lại vào weaknesses (vd. `khong-hoi-lai-de`, `im-lang-khi-code`, `khong-tu-test`).
- Thêm entry nhật ký với tag `mock`. Mock dùng để chấm các module P05–P07 nếu đúng format của module đó.
