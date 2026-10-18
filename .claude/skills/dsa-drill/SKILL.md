---
name: dsa-drill
description: |
  Luyện nhanh 10–15 phút: câu hỏi ngắn kiểu flashcard, đoán Big-O, nhận dạng pattern, tìm bug, viết hàm nhỏ; ưu tiên điểm yếu trong weaknesses.md và các module đến hạn ôn.
  Triggers: /dsa-drill, "ôn nhanh", "drill", "kiểm tra nhanh", "quiz dsa", "đoán big-o", "nhận dạng pattern"
---

# DSA Drill: luyện nhanh và ôn tập

## Chế độ (theo args, mặc định `review`)
| Mode | Nội dung |
|---|---|
| `review` | Ôn điểm yếu và module đến hạn. Đây là chế độ mặc định |
| `topic <ID/chủ đề>` | Drill riêng một chủ đề |
| `pattern` | Cho đề bài (chỉ đề + ràng buộc), người học nêu pattern + Big-O trong ≤ 2'. Không code. Dùng thẻ "Pattern card" trong các `review.md` làm nguồn |
| `bigo` | Cho đoạn code TS, người học đoán time/space. Câu khó thì chạy `bench` để chấm bằng số mũ |
| `trace` | Cho code + input nhỏ, người học dry-run và đoán output (hoặc trạng thái mảng/stack/heap sau bước k) mà không chạy |
| `scale` | Cho lời giải + bảng bench ở `s`, người học đoán số đo ở `m` và `l` (thời gian, có tràn stack/hết RAM không), sau đó chạy `bench` để chấm. Chấm theo xu hướng và điểm gãy, không đòi đúng con số |

Muốn mô phỏng phỏng vấn đầy đủ thì dùng `/dsa-mock`, không phải drill.

## Chọn câu hỏi (mode review)
1. Đọc `progress/weaknesses.md`, ưu tiên dòng có `count` cao và lâu chưa ôn.
2. Đọc `progress/tracker.md`, lấy các module ✅ có "Ôn lại lúc" ≤ hôm nay.
3. Ra tổng cộng 8–10 câu, trộn 5 dạng:
   - **Đoán output / dry-run**: code ≤ 10 dòng + input nhỏ. Kết quả là gì?
   - **Tìm bug**: code có bug (off-by-one, quên tie-break, `sort()` mặc định, `visited` đánh dấu sai chỗ...). Chỉ ra bug và input làm lộ bug.
   - **Viết nhanh**: một hàm ≤ 10 dòng (vd. lower bound, reverse list, BFS trên grid). Lưu vào `drills/<date>/qNN.ts` và chạy thử.
   - **Nhận dạng**: đề ngắn → pattern + Big-O.
   - **Khái niệm**: câu hỏi ngắn kiểu "vì sao heapify là O(n)?", "khi nào Dijkstra sai?", "vì sao sliding window là O(n) dù có while lồng?"

## Luật chơi
- Mỗi lượt 1 câu. Chờ người học trả lời rồi mới chấm, sau đó mới ra câu tiếp.
- Chấm ngay: ✅ hoặc ❌ kèm giải thích 1–2 câu. Với câu viết code hoặc đoán output gây tranh cãi, chạy thật để kiểm chứng.
- Không dùng hint trong drill. Trả lời sai thì giải thích luôn, vì mục tiêu của drill là ôn lại.
- Lưu bản ghi buổi vào `drills/<YYYY-MM-DD>.md` (nếu trong ngày có nhiều buổi thì thêm hậu tố `-2`, `-3`…), gồm câu hỏi, câu trả lời của người học và kết quả.

## Cập nhật sau drill
- `weaknesses.md`: trả lời đúng thì tăng "Streak đúng", sai thì reset về 0 và tăng `count`. Dòng nào đạt streak 3 thì chuyển xuống mục "Đã khắc phục".
- `tracker.md`: module được ôn đạt (≥ 80%) thì nhảy sang mốc ôn tiếp theo. Không đạt thì đổi sang 🔁. Thêm entry vào nhật ký.
- Tóm tắt 2 dòng: điểm số và câu cần nhớ nhất.
