# P02 · Interview framework

## Sau buổi này bạn sẽ
- Có **một khung 7 bước** áp dụng cho mọi bài phỏng vấn thuật toán, và nói to suy nghĩ (*think aloud*) ở từng bước.
- Biết người phỏng vấn **chấm gì**: 4 trục, không chỉ "code chạy đúng".
- Luyện khung trên 3 bài ngắn rồi mock với coach (`/dsa-mock`).

> Tier P trở đi: giải thích thành tiếng quan trọng ngang code. Bài `check` vẫn chạy thật; phần *nói* do coach đóng vai interviewer chấm.

## 1. Khung 7 bước (45 phút)

| # | Bước | Làm gì | Phút |
|---|---|---|---|
| 1 | **Hỏi lại đề** | Nhắc lại bằng lời của mình; hỏi ràng buộc `n`, miền giá trị, input rỗng/trùng, có sắp sẵn không, tie-break, được sửa input không | 3–5 |
| 2 | **Ví dụ** | Tự đưa 1–2 ví dụ thường + 1 edge case; xác nhận kết quả với interviewer | 3–5 |
| 3 | **Brute force** | Nói cách ngây thơ + độ phức tạp, nêu vì sao chưa đủ với `n` đã cho | 3–5 |
| 4 | **Tối ưu có lý do** | Chỉ ra *chỗ lãng phí* của brute rồi mới chọn cấu trúc/pattern; nêu **bất biến** | 5–8 |
| 5 | **Code** | Viết sạch: tên rõ, hàm nhỏ, không tối ưu sớm; vừa viết vừa nói | 10–15 |
| 6 | **Test bằng tay** | Dry-run ví dụ + edge case trên chính code đã viết (không chạy máy) | 3–5 |
| 7 | **Phân tích** | Time/space, đánh đổi, hướng mở rộng ("nếu dữ liệu không vừa RAM / stream?") | 2–3 |

### Câu mở đầu mẫu
> "Để chắc là em hiểu: mình cần … trả về …, đúng không ạ? Em có vài câu hỏi về ràng buộc: n tối đa bao nhiêu? … Em sẽ bắt đầu bằng cách ngây thơ O(…) rồi tối ưu."

## 2. Rubric 4 trục (điểm 1–4)

| Trục | 1 — chưa đạt | 2 | 3 — đạt | 4 — xuất sắc |
|---|---|---|---|---|
| **Communication** | im lặng, nhảy vào code | nói rời rạc | nói rõ từng bước, hỏi lại đề | dẫn dắt người nghe, chủ động nêu giả định và đánh đổi |
| **Problem solving** | không tìm ra hướng | chỉ ra brute, tối ưu cần gợi ý | brute → tối ưu có lý do, đúng Big-O | thấy nhiều hướng, so sánh, chọn có căn cứ |
| **Coding** | code sai/không chạy được | đúng nhưng rối, sai biên | sạch, đúng, ít bug | idiomatic, tách hàm, xử lý biên ngay từ đầu |
| **Verification** | không test | test ví dụ đề cho | dry-run ví dụ + 1–2 edge case, tự bắt bug | tự đề xuất stress/brute so sánh, nêu hạn chế |

**Pass module:** rubric ≥ 3/4 ở **mỗi** trục trong buổi mock với coach.

## 3. Cách luyện module này
1. Làm 3 bài trong `exercises.md` theo khung, **nói to** (ghi âm hoặc gõ "lời nói" vào file nháp).
2. `node tools/check.ts lessons/P02-interview-framework` để máy chấm phần code.
3. Chỉ mở `solutions.ts` sau khi `check` ✅: mỗi bài có **transcript mẫu** ở dạng comment để đối chiếu.
4. Chạy `/dsa-mock` để coach đóng vai interviewer và chấm rubric.

## 4. Thói quen cần có
- **Nói trước khi code** (ý tưởng + Big-O) — cũng là luật của workspace này.
- Luôn nhắc tới **bất biến** của vòng lặp/cấu trúc.
- Khi kẹt: nói ra cái đang thử và vì sao chưa được; xin gợi ý đúng chỗ (tương ứng H1/H2/H3), đừng im lặng.
- Dry-run bằng tay trước khi nói "xong".

## 5. Theo ngôn ngữ (phỏng vấn thường cho chọn)
| | TS | Python | Java |
|---|---|---|---|
| Ưu | ngắn gọn, `Map`/`Set` sẵn | ngắn nhất, `collections`, `heapq` | chặt về kiểu, `ArrayDeque`, `PriorityQueue` |
| Bẫy khi nói | `sort()` mặc định so chuỗi; `shift()` O(n) | đệ quy 1000 tầng; `list.pop(0)` | `int` tràn; `==` trên `String`/`Integer` |

## 6. Bẫy thường gặp trong buổi phỏng vấn
1. Nhảy vào code trước khi hỏi ràng buộc.
2. Tối ưu mà không giải thích vì sao brute chưa đủ.
3. Viết xong không test (hoặc chỉ test ví dụ đề cho).
4. Nói "O(n)" mà quên chi phí sort / băm chuỗi.
5. Không phát hiện edge case: rỗng, một phần tử, tất cả bằng nhau, giá trị lớn.

## 7. Câu hỏi quy mô
Với mỗi bài trong `exercises.md`, nêu bằng lời: ở `n = 10⁵` brute của bạn chạy cỡ bao nhiêu phép? Ở `n = 10⁶` thì sao? Rồi `bench` bản của bạn và đối chiếu.
