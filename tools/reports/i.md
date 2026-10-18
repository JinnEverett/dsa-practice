# Báo cáo nhóm `i` — I05–I14

Branch làm việc: `claude/content-i-modules-b99gj7` (brief ghi `content/i`; dùng đúng branch được giao cho phiên này). PR vào `main`.

## Module đã làm (10/10)

| Module | Bài | Ghi chú |
|---|---|---|
| I05 Graph & BFS | 10 | đúng kế hoạch |
| I06 DFS & connectivity | 10 | đúng kế hoạch |
| I07 Topological sort | 8 | đúng kế hoạch |
| I08 Union-Find | 8 | đúng kế hoạch |
| I09 Backtracking | 10 | đúng kế hoạch |
| I10 Greedy & intervals | 10 | `candy` đổi `int` → `long` |
| I11 Monotonic stack/deque | 8 | `largestRectangleArea`, `trap` đổi `int` → `long` |
| I12 Trie | 8 | đúng kế hoạch |
| I13 Bit manipulation | 10 | đúng kế hoạch (`isPowerOfTwo` nhận `long` tới 2⁵³ − 1) |
| I14 Math | 10 | `modPow`/`nextCollision` thu hẹp miền giá trị (xem dưới) |

Mỗi module có đủ 4 file: `README.md`, `exercises.md`, `solutions.ts`, `checks.ts`. Không tạo `answers/`.

## Kết quả kiểm chứng

Môi trường: Node v24.22.0 (cài bằng `npm i node@24 --prefix /opt/n24`, vì `npm i -g node@24` báo `EEXIST` do Node 22 đã có trong `/opt/node22/bin`), Python 3.13, javac 21.

- `DSA_PERF_FACTOR=3 node tools/check.ts --all --src solutions --quiet` (toàn repo, sau khi xong cả nhóm): **251 đúng · 0 sai · 0 chưa làm**. Các module I05–I14: 94 bài đều ✅.
- Chạy lại từng module I05–I14 với `DSA_PERF_FACTOR=1` (không bù): **tất cả ✅**; I05, I07, I08, I12 chạy thêm 2 lượt nữa vẫn ✅. **Không có bài nào chỉ qua nhờ `DSA_PERF_FACTOR`.**
- `npx tsc --noEmit`: sạch, sau mỗi module.
- Lưu ý: trong lúc soạn, vài giới hạn Perf ban đầu quá sát (đo lại cho thấy dao động ×2–3 giữa các lần chạy trên VM chia sẻ, ví dụ I05 ex01 từ 69 ms tới 170 ms). Đã nới giới hạn để TS đúng Big-O nhanh hơn giới hạn ≥ 5× (thường 10–50×); không dựa vào `DSA_PERF_FACTOR`.

### Bản sai Big-O / sai bẫy bị bắt (kiểm tra thủ công bằng file thử, đã xóa)

| Module | Bài | Bản thử | Kết quả |
|---|---|---|---|
| I05 | ex01 | dựng kề bằng cách quét mọi cạnh cho từng đỉnh | quá giờ (cases) |
| I05 | ex05 | BFS từ mỗi ô 1 | quá giờ (cases) |
| I06 | ex05 | DFS đệ quy trên chuỗi 10⁵ | `Maximum call stack size exceeded` |
| I07 | ex04 | so mọi cặp từ (O(W²)) | Perf ❌ (> 450 ms, giới hạn 150) |
| I08 | ex01 | DSU không nén đường, không gộp theo size | Perf ❌ (> 1500 ms, giới hạn 500) |
| I09 | ex02/04/07 | sinh hết rồi khử trùng / lọc | Perf ❌ (325 ms / 1516 ms / 3000 ms) |
| I09 | ex08 | DFS không đếm chữ cái | quá 30 s ở cases |
| I10 | ex01 | DP O(n·bước nhảy) | Perf ❌ (4 175 ms, giới hạn 100) |
| I10 | ex06 | mô phỏng từ mọi điểm xuất phát | Perf ❌ (sau khi đổi gen sang ca xấu nhất) |
| I11 | ex05 | duyệt lại mỗi cửa sổ O(n·k) | Perf ❌ |
| I11 | ex06 | nhân `arr[i]*L*R` trực tiếp | Cases ❌ (bẫy 2⁵³) |
| I12 | ex01, ex08 | quét danh sách / `endsWith` từng từ | Perf ❌ |
| I13 | ex02, ex04, ex05 | `>>` trên số ≥ 2³¹, `n & (n−1)` với n ≥ 2³², quên `>>> 0` | Cases ❌ (có phản ví dụ cụ thể) |
| I14 | ex01, ex02, ex03, ex08 | trừ liên tiếp, chia thử, `(a*b)%m`, `indexOf` trong chuỗi | Perf/Cases ❌ |

Ngoại lệ (đã ghi trong `exercises.md`): I12 ex03 — bản chạy `exist` riêng từng từ chỉ chậm hơn ~3× nên Perf không phân biệt rõ; đã thêm câu hỏi quy mô để người học tự đo.

### Python / Java

Chỉ thử ở các bài dùng kiểu `sig` mới hoặc class, bằng file thử trong `answers/` (đã xóa):

| Module | Bài thử | Python | Java |
|---|---|---|---|
| I07 | ex07 (`String[][]`), ex08 (`long`) | ✅ | ✅ |
| I08 | ex01 (class), ex05 (`List<List<String>>`) | ✅ | ✅ |
| I11 | ex03/ex06 (`long`, mod), ex07 (class), ex08 (String) | ex07, ex08 ✅ | ex03, ex06, ex07 ✅ |
| I12 | ex07 (class + `int[]` ctor), ex08 (class + `char`) | ✅ | ✅ |
| I13 | ex02/04/05 (`long`) | ex07, ex08, ex10 ✅ | ex02, ex04, ex05 ✅ |
| I14 | ex03, ex10 (`long`), ex04, ex08 | ex04, ex08 ✅ | ex03, ex10 ✅ |

I05, I06, I09, I10 không dùng kiểu mới (chỉ `int[][]`, `String[]`, `List<List<Integer>>`, `List<String>`), nên không thử thêm Python/Java.

## Thay đổi so với `CONTENT_PLAN.md`

- I10 `candy`: `int` → `long` (n(n+1)/2 ≈ 5·10⁹ khi n = 10⁵; có test tràn int).
- I11 `largestRectangleArea`: `int` → `long` (diện tích tới 10¹⁴); `trap`: `int` → `long` (tổng tới 10¹⁰).
- I14 `modPow`: `base`, `exp` ≤ 2⁵³ − 1 thay vì `exp` tới 10¹⁸ — input/expected là JSON nên TS nhận `number`, không biểu diễn chính xác 10¹⁸. Bẫy 2⁵³ khi nhân modulo vẫn được kiểm tra (mod tới 2³¹ − 1).
- I14 `nextCollision`: `a, b ≤ 10⁷`, `t ≤ 10¹⁵` để đáp án vừa 2⁵³.
- I08 ex01 (class): `find(x)` có thể trả đại diện bất kỳ — `compare` kiểm tra nhất quán (cùng nhóm ⇒ cùng đại diện giữa hai lần `union` thành công; khác nhóm ⇒ khác đại diện).
- I08 ex02 `findRedundantConnection`: đỉnh đánh số từ 0 (n đỉnh, n cạnh). I07 ex05: môn đánh số từ 0.
- I06 ex08: so sánh `unordered` (không `unordered-deep`) để không coi `[r, c]` và `[c, r]` là một.

## Thay đổi ở `tools/`

Không sửa code (`check`, `lib`, `sig`, `spec`...). Chỉ sửa `tools/CONTENT_PLAN.md` (dòng trạng thái I05–I14 và 5 dòng bài đổi kiểu) và thêm file này.

## Thứ chưa verify

Không có: mọi module đã chạy bằng Node 24. Chưa chạy `bench` thật cho các câu hỏi quy mô trong từng `exercises.md` ngoài I09 ex03 (đã dùng `benchScales` riêng, số liệu trong README I09 lấy từ lần chạy đó); các con số khác trong README (vd. I11 "~2 ms", I12 "~40 ms", I14 "34 ms/1270 ms") lấy từ lần `check`/thử bản sai chạy trên máy soạn.
