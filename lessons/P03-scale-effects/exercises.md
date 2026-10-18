# P03 · Bài tập: 10 thí nghiệm

Không có `check`/`scaffold` cho module này — dùng `bench`. Tạo file `lessons/P03-scale-effects/answers/p03.md` và điền **4 phần** cho mỗi thí nghiệm:

```md
## 01 · number[] vs Int32Array
- Giả thuyết (viết TRƯỚC khi đo): B nhanh hơn A khoảng …× ở n = 10⁶ vì …
- Cách đo: <lệnh bench, scales, số lần chạy>
- Kết quả: | n | A (ms) | B (ms) | A/B | heap A | heap B |
- Giải thích: …  (khớp / không khớp dự đoán, vì sao)
```

**Pass:** mỗi thí nghiệm có dự đoán ghi trước · đúng **xu hướng** (B nhanh hơn/chậm hơn, và lớn/nhỏ cỡ nào theo thang ×2 / ×10 / ×100) ≥ 70% · viết mục cuối **"Quy tắc ngón tay cái của tôi"** (≥ 5 quy tắc, mỗi quy tắc kèm 1 số đo làm bằng chứng).

Lệnh mẫu (thay `NN`, `FN`):
```bash
node tools/bench.ts lessons/P03-scale-effects NN --src solutions --scales s,m,l                                   # biến thể A
node tools/bench.ts lessons/P03-scale-effects NN --file lessons/P03-scale-effects/experiments.ts --fn FN --scales s,m,l   # B / C
```
Mã nguồn các biến thể: `experiments.ts`. Mỗi hàm nhận `n`, tự tạo dữ liệu và trả checksum (số đo gồm cả tạo dữ liệu).

---

| # | A (`--src solutions`) | B / C (`--fn`) | Scales gợi ý | Câu hỏi riêng |
|---|---|---|---|---|
| 01 | `sumNumberArray` | `sumInt32Array` | `s,m,l,xl` | Bộ nhớ (cột heap) khác nhau bao nhiêu byte/phần tử? Có đổi tỉ lệ khi `n` lớn lên không? |
| 02 | `countWithMap` | `countWithArray`, `countWithObject` | `s,m,l` | Khi nào bảng băm thua mảng chỉ số? `Object` làm bảng đếm có gì bất lợi (kiểu khóa, thứ tự duyệt)? |
| 03 | `updateAoS` | `updateSoA` | `s,m,l` | Có phụ thuộc quy mô không? Giải thích bằng cache line. |
| 04 | `sumManhattanAlloc` | `sumManhattanInline` | `s,m,l` | V8 có loại bỏ được cấp phát không? Heap tăng bao nhiêu? |
| 05 | `fillHoley` | `fillPacked` | `s,m,l,xl` | Holey chậm/nhanh? Ở `n = 10⁷` còn như vậy không? |
| 06 | `sumRecursive` | `sumLoop` | `m,l,xl` | Chi phí mỗi tầng gọi? Thử tăng `DEPTH` trong `experiments.ts` tới khi tràn stack: ngưỡng của máy bạn là bao nhiêu tầng? |
| 07 | `buildPlus` | `buildJoin` | `s,m,l` | Lời khuyên "không nối chuỗi bằng `+=`" còn đúng với V8 hiện đại không? Bằng chứng của bạn? |
| 08 | `sortComparator` | `sortTyped`, `sortDefaultString` | `s,m,l` | Chi phí của comparator? Với `sortDefaultString`, kết quả (checksum) có giống `sortComparator` không — vì sao? |
| 09 | `setInsert` | `bitsetInsert` | `m,l,xl` | Heap ở `n = 10⁷`: bao nhiêu byte/phần tử cho `Set`, cho bảng bit? Khi nào không dùng được bảng bit? |
| 10 | `uniqueBySort` | `uniqueBySet` | `s,m,l` | Hàm nào thắng ở `n = 10³`? ở `10⁶`? Số mũ ước lượng có đúng với O(n log n) vs O(n) không? |

## Phần tổng kết
1. Chọn **hai** thí nghiệm mà dự đoán của bạn lệch nhất; nói điều bạn hiểu sai.
2. Viết "Quy tắc ngón tay cái của tôi" (≥ 5 dòng). Ví dụ khung: *"Khi dữ liệu là số cùng kiểu và n ≥ 10⁵, dùng …, vì …(đo: …×)"*.
3. **Câu hỏi quy mô:** từ số đo ở `l` (10⁶), dự đoán thời gian của thí nghiệm bạn thấy thú vị nhất ở `xl` (10⁷) bằng số mũ ước lượng, rồi chạy `--scales xl` để kiểm chứng.
4. (Tùy chọn) Làm lại 2 thí nghiệm bằng Python hoặc Java và so xu hướng (README mục 5).
