---
name: dsa-case
description: |
  Bài tình huống backend thực tế (TypeScript/Node) mà gốc rễ là cấu trúc dữ liệu hoặc giải thuật: endpoint chậm khi data tăng gấp 10, bug sort số, stack overflow trên cây sâu, BFS dùng shift() làm worker treo, tràn 2^53, rate limiter cho burst sai, thứ tự migration sai. Người học điều tra và xử lý như kỹ sư trực sự cố.
  Triggers: /dsa-case, "bài thực tế", "tình huống", "case study", "debug production", "incident"
---

# DSA Case: tình huống thực tế

Khác với lesson: đề **không nói trước** cần dùng kỹ thuật gì. Người học phải tự chẩn đoán.
Chọn case theo các module người học đã ✅. Case có thể vượt tối đa 1 tier để tạo độ khó, nhưng không vượt hơn.

## Kho dạng case (chọn hoặc biến tấu)
| Nhóm | Ví dụ tình huống | Module liên quan |
|---|---|---|
| 🐢 Chậm khi data tăng | API `/orders/dedupe` mất 30s sau khi khách import 200k dòng (`filter` + `includes` lồng nhau). Cho code và log thời gian theo số dòng, hãy tìm và sửa | F01, F04 |
| 🔢 Kết quả sai lặt vặt | Báo cáo "top 10 đơn lớn nhất" thỉnh thoảng sai thứ tự (`sort()` mặc định so chuỗi); ID 18 chữ số từ API khác bị lệch (vượt 2⁵³); tổng tiền lệch 0.01 (float) | F08, I14 |
| 💥 Crash | Endpoint dựng cây danh mục chết với `RangeError: Maximum call stack size exceeded` khi có tenant cây sâu 20k tầng | F10, I01, I02 |
| 🧵 Worker treo | Job crawl liên kết nội bộ dùng BFS với `queue.shift()` chạy 40 phút trên 500k node; CPU 100% | F12, I05 |
| 📊 Thống kê trên log lớn | Top-K endpoint chậm nhất từ log 50M dòng, RAM giới hạn 512MB; p95 latency theo cửa sổ 5 phút trượt | F06, I04, R03, R09 |
| 🔁 Phụ thuộc | Migration/seed chạy sai thứ tự, thỉnh thoảng lặp vô hạn (chu trình phụ thuộc); NestJS báo circular dependency — tìm chu trình và in đường đi | I06, I07, R05 |
| 🚦 Giới hạn tốc độ | Rate limiter fixed window cho phép gấp đôi request ở ranh giới cửa sổ; khách phàn nàn bị chặn oan | F06, R02 |
| 🗃️ Cache | Cache tự viết bằng object + `Object.keys()` để evict làm p99 tăng vọt; memory leak do không có TTL | F04, R01 |
| 🔎 Tìm kiếm | Autocomplete tên sản phẩm dùng `filter(startsWith)` trên 300k sản phẩm, mỗi phím gõ 80ms; tìm không dấu tiếng Việt | F03, I12, R06 |
| 🗺️ Đường đi / phân phối | Tính phí ship theo đường ngắn nhất giữa kho; phân shard key lại khi thêm node làm 90% cache miss | I05, A06, R08 |
| 📅 Lịch | Hệ thống đặt phòng họp cho đặt trùng giờ (so sánh khoảng sai biên); tính số phòng cần tối thiểu | I10, A11 |

## Cấu trúc thư mục
```
cases/<NN>-<slug>/
  BRIEF.md        # bối cảnh dạng ticket/incident: triệu chứng, số liệu, áp lực thời gian
  src/            # code "production" có lỗi (TS chạy được) + dữ liệu sinh bằng seed cố định
  repro.ts        # script tái hiện triệu chứng (in thời gian theo n, hoặc ném lỗi)
  notes.md        # người học ghi lại quá trình điều tra
  solution/       # bản sửa của người học
  postmortem.md   # Claude viết sau khi xong: root cause, cách sửa, cách phòng ngừa, các cách làm khác
```

## Diễn biến
1. **Brief**: viết như ticket thật, có triệu chứng, chưa có nguyên nhân. Có thể kèm log, số đo thời gian theo kích thước dữ liệu, stack trace, biểu đồ CPU/RAM mô tả bằng lời.
2. **Điều tra**: người học đặt câu hỏi, đọc code, chạy `repro.ts`, đo bằng `bench` hoặc `--cpu-prof`. Claude đóng vai đồng nghiệp hoặc hệ thống: trả lời trung thực về những gì quan sát được và không tiết lộ root cause.
3. **Chứng minh**: trước khi sửa, người học phải chỉ ra bằng chứng: số mũ thời gian theo n (bench ở ≥ 3 mức), input tối giản làm sai, hoặc stack trace + độ sâu.
4. **Xử lý**: người học viết bản sửa trong `solution/`. Chạy lại `repro.ts` để xác nhận lỗi đã hết; case hiệu năng thì bench trước/sau trên ít nhất 2 mức quy mô và lưu bảng vào thư mục case. Nếu có thể, viết stress test so bản cũ (chậm nhưng đúng) với bản mới.
5. **Postmortem**: viết `postmortem.md` theo khung root cause → fix → phòng ngừa (test, lint rule, code review checklist, giới hạn input) → các phương án khác và trade-off.
6. Cập nhật tracker (ghi vào nhật ký với tag `case`) và weaknesses.

Chấm theo 4 tiêu chí, thang 1–5 mỗi tiêu chí: quy trình chẩn đoán có hệ thống không (đo trước khi đoán), root cause đúng không, fix có đúng + an toàn không (không đổi hành vi, xử lý edge case, không thêm rủi ro bộ nhớ), và có phòng ngừa tái diễn không.
