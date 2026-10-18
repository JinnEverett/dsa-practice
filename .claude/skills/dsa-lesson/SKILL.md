---
name: dsa-lesson
description: |
  Dạy và cho luyện một module trong ROADMAP.md (S00, F01…F12, I01…I14, A01…A12, P01…P07, R01…R10, D01…D10). Dùng nội dung đã soạn sẵn trong lessons/<ID>-*/ (README, exercises, checks, solutions); nếu module chưa có thì gọi dsa-build để soạn trước. Phát đề từng bài, chấm bằng check/bench ở ngôn ngữ người học chọn (TS/Python/Java), nhận xét best practice.
  Triggers: /dsa-lesson <ID>, "học module F05", "bài tiếp theo", "học two pointers", "dạy tôi về heap", "học dp"
---

# DSA Lesson: một buổi học theo module

Input là module ID (vd. `F05`). Nếu người học gọi bằng chủ đề thì tra `ROADMAP.md` để tìm ID.
Tuân thủ `CLAUDE.md`, đặc biệt: **người học tự viết code**, **luôn chạy thật**, **đáp án là spoiler**.

## 0. Chuẩn bị
- Đọc dòng của module trong `ROADMAP.md` và đầu file `exercises.md` (tiêu chí Pass).
- **Module chưa có nội dung** (`lessons/<ID>-*/checks.ts` không tồn tại): gọi skill `dsa-build <ID>` để soạn + kiểm chứng trước, rồi mới vào bài.
- Ngôn ngữ: theo `dsa.config.json` (hoặc người học nói). Nếu `answers/` chưa có file khung: `node tools/scaffold.ts lessons/<dir> --lang <lang>`.
- Đọc tracker và weaknesses. Lỗi nào liên quan module này thì nhắc khi phát đề tương ứng.
- Nếu đã có `review.md` / `answers/` đã làm: đây là buổi **học tiếp**, bắt đầu từ bài chưa ✅ (chạy `node tools/check.ts lessons/<dir>` để xem trạng thái).
- Đổi trạng thái module trong tracker thành 🟡.

## 1. Warm-up (≤ 5')
2–3 câu ngắn từ module trước hoặc từ weaknesses (đoán output, đoán Big-O, tìm bug 3 dòng). Trả lời trong chat.

## 2. Lý thuyết
Chỉ người học đọc `README.md` (≤ 10'). Coach tóm tắt 3–5 ý chính, trả lời câu hỏi, có thể cho 1 ví dụ dry-run. Bổ sung khác biệt cho ngôn ngữ người học dùng nếu README chưa nói.

## 3. Vòng luyện tập
**Phát đề từng bài một** (sở thích người học): trích đúng đề từ `exercises.md`. Với từng bài:
1. Từ Tier I: người học nói ý tưởng + Big-O trước. Sai hướng → một câu hỏi dẫn dắt, chưa cho code.
2. Người học viết vào `answers/exNN.<ext>` (hoặc dán vào chat; khi đó Claude lưu giúp, giữ nguyên code).
3. Chạy `node tools/check.ts lessons/<dir> NN` (thêm `--lang` nếu có nhiều file cùng bài). Lỗi biên dịch/runtime: chỉ chỉ ra vị trí và loại lỗi, không sửa hộ.
4. Sai: đưa đúng output của `check` (input nhỏ nhất, output bài làm, kỳ vọng), gợi ý dry-run input đó.
5. Bí: thang gợi ý H1 → H2 → H3, ghi số hint. Gợi ý **tự nghĩ**, không trích `solutions.ts`.
6. Đúng: **bắt buộc** nhận xét + best practice (dưới). Lỗi pattern → ghi weaknesses.

### Nhận xét sau khi đúng (bắt buộc)
- **Làm đúng:** 2–3 điểm cụ thể.
- **Độ phức tạp:** hỏi (Tier F) hoặc xác nhận (Tier I+) time/space.
- **Best practice:** đọc `solutions.ts` của bài. Nếu bài làm đã là cách chuẩn thì nói thẳng và vì sao. Nếu còn cách tốt hơn: **luôn kèm code mẫu đầy đủ** ở **ngôn ngữ người học dùng** (dịch từ TS, dùng idiom và thư viện chuẩn của ngôn ngữ đó theo ghi chú "Python/Java" trong solutions.ts). Code mẫu phải đã chạy qua `check` (lưu tạm vào scratchpad hoặc `answers/` rồi trả lại bài của người học). Kèm 2–3 lý do và bảng so sánh ngắn (Big-O, thời gian ở n = 10⁵/10⁶).
- **Cách khác đáng biết:** 1 dòng trade-off nếu có.
- Tối đa 3 ý quan trọng nhất.

**📏 Câu hỏi quy mô** (≥ 1 bài mỗi module từ Tier I): người học ghi dự đoán (Big-O, thời gian ở 10⁶) vào đầu file bài làm → `node tools/bench.ts lessons/<dir> NN --scales s,m,l` → so dự đoán với số mũ đo được, giải thích điểm gãy. Lời giải sụp ở `l` thì viết lại.

Không ra đề mới khi bài hiện tại chưa nộp, trừ khi người học muốn bỏ qua.

## 4. Kết thúc buổi
- Viết `review.md`: điểm (x/N), số hint, ngôn ngữ đã dùng, 3 điều nắm chắc, 3 điều cần cải thiện, lỗi đã ghi weaknesses, bảng bench (nếu có), **Pattern card** (3–5 dòng: dấu hiệu nhận biết + template).
- Cập nhật `progress/tracker.md`: trạng thái (✅ nếu đạt Pass), điểm, hint, ngày, "Ôn lại lúc", nhật ký buổi học.
- Đề xuất buổi sau trong 1 dòng.

## Module đặc biệt
- **S00:** hạ tầng đã dựng sẵn. Buổi này: kiểm tra `node -v` (≥ 24), `python --version`, `java -version` (ngôn ngữ người học chọn), chạy `node tools/check.ts --all S00 --src solutions --quiet`; hướng dẫn README S00; làm 3 bài; bench ex02 hai phiên bản. Ghi phiên bản vào bảng "Môi trường" của tracker.
- **F01:** ngoài bài code có phần A (10 snippet `b01…b10`): người học ghi Big-O vào `answers/bigo.md`, rồi `node tools/bench.ts lessons/F01-big-o bNN --src solutions`.
- **P01:** chấm bằng `solutions.md`, không có check.
- **P03:** buổi thí nghiệm; mỗi thí nghiệm gồm giả thuyết (viết trước) → đo → kết quả → giải thích. Cuối buổi `review.md` có mục **"Quy tắc ngón tay cái của tôi"** (5–10 kết luận từ số đo), dùng lại cho dsa-design/dsa-case.
- **P05–P07:** bấm giờ theo đề, không gợi ý trong giờ; có thể chạy bằng `/dsa-mock`.
- **D01–D10, CAP:** dùng quy trình của `/dsa-design` (DESIGN.md của người học trước, so với DESIGN.md mẫu sau).
