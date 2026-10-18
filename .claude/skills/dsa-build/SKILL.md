---
name: dsa-build
description: |
  Soạn sẵn nội dung cho module DSA chưa có (README, exercises, solutions.ts best practice, checks.ts có brute + gen + perf) theo tools/CONTENT_PLAN.md và tools/AUTHORING.md, rồi kiểm chứng mọi đáp án bằng check + tsc. Dùng để tiếp tục xây kho bài bất cứ lúc nào.
  Triggers: /dsa-build <ID|next|I05-I08>, "soạn tiếp module", "tạo tiếp bài", "build module", "soạn bài còn thiếu"
---

# DSA Build: soạn sẵn module

Đây là việc của **người soạn đề** (khác `/dsa-lesson` là việc của coach). Được phép viết lời giải đầy đủ.

## Input
- `next` (mặc định): module ⬜ đầu tiên trong bảng trạng thái của `tools/CONTENT_PLAN.md`.
- Một ID (`I05`) hoặc khoảng (`I05-I08`): soạn lần lượt từng module, xong module này (đã kiểm chứng) mới sang module sau.

## Trước khi soạn
1. Đọc `tools/AUTHORING.md` (định dạng + mục "Bẫy đã gặp khi soạn") và mục của module trong `tools/CONTENT_PLAN.md`.
2. Đọc một module đã xong cùng tier làm mẫu văn phong (vd. `lessons/I04-heap/`), và `ROADMAP.md` (dòng của module: nội dung chính, tiêu chí Pass).
3. Kiểm tra các module khác đã dùng bài LeetCode nào (`grep -r "LeetCode <số>" lessons/`) để tránh trùng.

## Soạn (4 file trong `lessons/<ID>-<slug>/`)
- `README.md` (≤ 10 phút đọc): mục tiêu, khái niệm + hình minh họa ASCII/mermaid + code TS ngắn, template, dấu hiệu nhận biết, bảng theo ngôn ngữ (TS/Python/Java), bẫy, độ phức tạp.
- `exercises.md`: đầu file ghi lệnh scaffold/check và tiêu chí **Pass** (khớp ROADMAP); mỗi bài: mô tả, chữ ký **kiểu Java** trong khối ```java, ràng buộc (ghi rõ chỗ Java cần `long`), output/tie, 2–3 ví dụ, mục tiêu độ phức tạp, LeetCode tham khảo. Chia 🟢/🟡/🔴.
- `solutions.ts`: mỗi bài một export, khối comment *Ý tưởng · Độ phức tạp · Vì sao là best practice · Bẫy · Cách khác · Python/Java*. Tái sử dụng helper đã có (vd. `Heap` của I04: `import { Heap } from '../I04-heap/solutions.ts'`).
- `checks.ts`: `specs` với `sig`, `title`, `ref`, `brute` độc lập, `cases` (ví dụ trong đề có `expected` viết tay + edge case), `gen` đúng ràng buộc, `compare` khi nhiều đáp án, `perf` phân biệt được Big-O đúng/sai.

## Kiểm chứng (bắt buộc, không được bỏ qua)
```bash
node tools/check.ts --all <ID> --src solutions --quiet
npx tsc --noEmit
```
- Sai thì tìm nguyên nhân thật (expected viết tay sai? brute sai? gen vi phạm ràng buộc? ref sai?) — không nới `compare`/xóa case để cho qua.
- Bài dùng kiểu `sig` mới hoặc class: viết nhanh 1 bản Python **hoặc** Java vào `answers/`, chạy `check --lang py|java`, rồi xóa file thử.
- Kiểm tra ít nhất một lời giải sai Big-O (bản ngây thơ) bị Perf bắt ở 1 bài tiêu biểu của module.

## Kết thúc
- Cập nhật bảng trạng thái trong `tools/CONTENT_PLAN.md` (✅, số bài, ghi chú thay đổi so với kế hoạch).
- Không tạo `answers/` cho người học (họ tự chạy scaffold với ngôn ngữ mình chọn); xóa mọi file thử.
- Báo lại: module đã xong, số bài, kết quả kiểm chứng, thay đổi so với kế hoạch.
