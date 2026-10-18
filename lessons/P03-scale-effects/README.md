# P03 · Scale effects trong JS

## Sau buổi này bạn sẽ
- Thấy tận mắt rằng **Big-O che hằng số**: hai đoạn code cùng O(n) có thể chênh nhau 10×, và hằng số còn *đổi theo quy mô*.
- Biết các "công tắc" hiệu năng thực dụng của V8: kiểu mảng, đối tượng cấp phát trong vòng lặp nóng, đệ quy, chuỗi, sort, `Map`/`Set`.
- Làm thí nghiệm đúng cách: **dự đoán trước → đo → giải thích**, và tự viết "Quy tắc ngón tay cái của tôi".

Module này **không có `check`** (không đúng/sai): chỉ có `bench`. Python/Java có bản tương đương ở mục 5.

## 1. Quy trình thí nghiệm (bắt buộc cho mỗi cặp)
1. **Giả thuyết:** viết dự đoán thời gian B so với A ở `n = 10³, 10⁵, 10⁶` (hệ số, không cần chính xác) *trước khi chạy*.
2. **Cách đo:** `node tools/bench.ts lessons/P03-scale-effects NN --src solutions` (biến thể A) và `... --file lessons/P03-scale-effects/experiments.ts --fn <B>` (biến thể B). Bench đã khởi động JIT, lấy **median** nhiều lần, in số mũ ước lượng và heap.
3. **Kết quả:** ghi bảng thời gian + heap.
4. **Giải thích:** vì sao? (kiểu phần tử, cấp phát, cache, GC, thuật toán…). Có khớp dự đoán không? Nếu không — cái gì bạn chưa biết?

Đo sai kinh điển: chạy một lần (JIT chưa nóng), dùng `console.time` quanh vài micro-giây, so sánh hai đoạn làm *việc khác nhau*, kết quả không được dùng nên engine bỏ qua. Vì vậy mọi hàm ở đây trả **checksum** và `verify.ts` bảo đảm hai biến thể trả cùng kết quả.

## 2. Bản đồ các thí nghiệm

| # | A (ngây thơ) | B / C | Câu hỏi |
|---|---|---|---|
| 01 | `number[]` | `Int32Array` | mảng typed nhanh hơn bao nhiêu, tiết kiệm bộ nhớ bao nhiêu? |
| 02 | `Map` đếm | mảng `Int32Array` / `Object` | bảng đếm: cấu trúc nào, khi nào? |
| 03 | mảng đối tượng (AoS) | mảng riêng từng trường (SoA) | bố cục dữ liệu ảnh hưởng cache thế nào? |
| 04 | tạo `{x, y}` trong vòng lặp | biến cục bộ | cấp phát nhỏ có thật sự "miễn phí"? |
| 05 | `new Array(n)` (holey) | `push` (packed) | kiểu phần tử có quan trọng không? |
| 06 | đệ quy sâu 5000 | vòng lặp | chi phí khung gọi hàm |
| 07 | `s += …` | `parts.push` + `join` | nối chuỗi: lời khuyên cũ còn đúng? |
| 08 | `sort((a,b)=>a-b)` | `Float64Array.sort()` / `sort()` mặc định | chi phí comparator; vì sao `sort()` mặc định *sai* |
| 09 | `Set<number>` | bảng bit `Uint32Array` | bộ nhớ ở `n = 10⁷` |
| 10 | sort rồi đếm | `Set` | O(n log n) có thể thắng O(n)? |

## 3. Những điều cần nhớ (đọc lại sau khi đo)
- **Bộ nhớ liên tục + kiểu cố định** (typed array) thường thắng mảng đối tượng/`number[]` vì cache và ít cấp phát; nhưng chỉ khi dữ liệu là số cùng kiểu.
- **Cấp phát** nhiều đối tượng sống ngắn tạo áp lực GC; V8 có thể tối ưu bỏ cấp phát (escape analysis) *đôi khi* — đo chứ đừng đoán.
- **Mảng "holey"** (`new Array(n)`, xóa phần tử, ghi ngoài vùng) làm V8 chọn kiểu phần tử tổng quát hơn nên đọc phải kiểm tra "lỗ". Nhưng ở thí nghiệm 05 tác động này bị *lấn át* bởi một yếu tố khác (cấp phát trước vs tăng dần) — đọc kỹ kết quả trước khi kết luận.
- **Hằng số có thể đổi theo `n`:** cache L1/L2/L3 đầy, GC tăng, bảng băm rehash. "O(1)" mà thời gian không phẳng là bình thường.
- **Đệ quy sâu** tốn khung gọi và bị giới hạn stack (~10⁴ tầng trong TS).
- **`sort()` mặc định sắp theo chuỗi:** `[10, 9, 1].sort()` → `[1, 10, 9]`. Không phải chỉ chậm — mà sai.

## 4. Các lệnh hay dùng
```bash
node tools/bench.ts lessons/P03-scale-effects 01 --src solutions --scales s,m,l              # biến thể A
node tools/bench.ts lessons/P03-scale-effects 01 --file lessons/P03-scale-effects/experiments.ts --fn sumInt32Array --scales s,m,l
node lessons/P03-scale-effects/verify.ts                                                   # kiểm tra hai biến thể cùng kết quả
```
Thêm `--scales m,l,xl` cho thí nghiệm 09 (xl = 10⁷) và `--max-sec 40` nếu máy chậm.

## 5. Tương đương ở Python / Java

| Chủ đề | Python | Java |
|---|---|---|
| mảng số gọn | `array.array('i')`, `numpy`; `list[int]` tốn ~28 byte/số + 8 byte con trỏ | `int[]` (4 byte/số) vs `ArrayList<Integer>` (boxing: ~16 byte đối tượng + 4–8 byte tham chiếu) |
| bảng đếm | `list` chỉ số / `Counter` / `dict` | `int[]` vs `HashMap<Integer,Integer>` (boxing) |
| bố cục AoS/SoA | list of tuple/objects vs nhiều list / numpy | `Point[]` (đối tượng rải rác) vs `int[] xs, ys` |
| cấp phát trong vòng nóng | tạo tuple/object tốn; hoist ra ngoài | JIT thường tối ưu được (escape analysis), nhưng đối tượng sống lâu thì GC |
| nối chuỗi | `''.join(parts)` (tránh `+=` trong vòng lặp lớn) | `StringBuilder` (tránh `+=` trong vòng lặp) |
| sort | `list.sort()` (stable, Timsort) | `Arrays.sort(int[])` (dual-pivot) vs `sort(List<Integer>)` có boxing |
| đệ quy | `sys.setrecursionlimit`, chậm hơn ~30× so với TS | StackOverflowError ~10⁴ tầng |

Hệ số "Python chậm hơn ~30×" trong CLAUDE.md là *trung bình*; vòng lặp thuần Python có thể chậm hơn nhiều.

## 6. Bẫy khi làm thí nghiệm
1. Dự đoán *sau* khi đã thấy số (mất giá trị học).
2. So `n` nhỏ rồi kết luận cho `n` lớn (hằng số đổi theo quy mô).
3. Đo cả thời gian tạo dữ liệu mà không biết: ở đây mỗi hàm tự tạo dữ liệu, nên *số đo gồm cả tạo dữ liệu* — hãy tách ra nếu cần so riêng phần tính.
4. Kết luận từ một lần chạy trên máy đang bận: lặp lại ≥ 3 lần, chú ý độ lệch.
5. Tin con số tuyệt đối trên máy khác: chỉ **tỉ lệ và xu hướng** đáng tin.
