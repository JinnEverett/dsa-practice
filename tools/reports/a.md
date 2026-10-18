# Báo cáo nhóm A (A01–A12)

Branch làm việc: `claude/content-a-dsa-modules-yxo9m9` (branch do hệ thống chỉ định, thay cho `content/a` trong brief).

## Đã làm
12 module, **102 bài** (mỗi module có `README.md`, `exercises.md`, `solutions.ts`, `checks.ts`; không có `answers/`).

| Module | Bài | Ghi chú nhanh |
|---|---|---|
| A01 DP I: nền tảng | 10 | |
| A02 DP II: 1D & sequence | 10 | |
| A03 DP III: 2D & string | 10 | |
| A04 DP IV: knapsack | 8 | |
| A05 DP V: interval/tree/bitmask/digit | 8 | |
| A06 Shortest paths | 8 | `Heap` import từ `I04-heap/solutions.ts` |
| A07 MST & graph nâng cao | 8 | DSU chép tối giản vào `solutions.ts` |
| A08 Fenwick & Segment tree | 8 | |
| A09 String algorithms | 8 | |
| A10 Binary search on answer | 8 | |
| A11 Sweep line | 8 | `Heap` import từ I04 (skyline) |
| A12 Amortized & randomized | 8 | |

## Môi trường
- `node -v` ban đầu là 22.22. `npm i -g node@24` báo `EEXIST` ở `/opt/node22/bin/node`; chạy lại với `--force` thì `node -v` ra **v24.22.0** (sau `hash -r`).
- Python 3.13.16, `javac` 21.0.12.

## Kết quả kiểm chứng
- `DSA_PERF_FACTOR=1 node tools/check.ts --all A… --src solutions`: **102/102 đúng**, chạy hai lần liên tiếp đều xanh. Không bài nào chỉ qua nhờ `DSA_PERF_FACTOR`.
- `DSA_PERF_FACTOR=3 node tools/check.ts --all --src solutions --quiet` (toàn repo): **261 đúng · 0 sai** (159 cũ + 102 mới), ~57 giây.
- `npx tsc --noEmit`: sạch.
- Tỉ lệ giới hạn/thời gian ref ở factor 1 (đo thật, lần chạy cuối): A12 ex05 ref ≈ 150–280 ms, giới hạn 1000 ms (bản ngây thơ ≈ 2.4 s); các bài khác đều ≥ 5.5×. Các bài ở 5–7×: A10 ex04, A04 ex07, A09 ex08, A01 ex10, A03 ex10, A10 ex03.
- Lưu ý khi dùng `DSA_PERF_FACTOR=3`: A12 ex05 (skip list) có bản ngây thơ ≈ 2.4 s, còn giới hạn nhân ba là 3 s ⇒ gần như không phân biệt được. Chỉ dùng factor 3 để kiểm chứng đáp án mẫu, đừng dùng để chấm học viên.

### Bản sai Big-O bị Perf bắt (thử thật)
| Module/bài | Bản ngây thơ | Kết quả |
|---|---|---|
| A01 ex06 | cộng k ô mỗi bước O(n·k) | Perf ❌ |
| A01 ex10 | quét lùi tìm job tương thích O(n²) | Perf ❌ |
| A01 ex01 | đệ quy O(3ⁿ) | quá 30 s ở phần cases (n = 37) ❌ |
| A02 ex03 | LIS O(n²) | Perf ❌ |
| A02 ex04 | word break quét mọi j | quá 30 s ở cases ❌ |
| A04 ex08 | trải phẳng từng tờ | Perf ❌ (1309 ms > 200 ms) |
| A04 ex01 | duyệt xuôi cho 0/1 (thành unbounded) | sai ở case "mỗi vật một lần" ❌ |
| A05 ex07 | duyệt 1..n đếm chữ số | quá 30 s ở cases (n = 10⁹) ❌ |
| A06 ex01 | Dijkstra quét mảng O(n²) | Perf ❌ |
| A07 ex02 | Kruskal trên n²/2 cạnh | Perf ❌ (1515 ms > 300 ms) |
| A08 ex01, ex08 | quét thô mỗi truy vấn; list sự kiện quét lại | Perf ❌ |
| A09 ex01, ex05 | KMP bị thay bằng so khớp thô; thử từng tiền tố | Perf ❌ |
| A10 ex01 | thử từng tốc độ k = 1, 2, … | quá 30 s ở cases ❌ |
| A11 ex04 | duyệt toàn bộ danh sách mỗi lần book | Perf ❌ (1877 ms > 500 ms) |
| A12 ex01, ex03, ex04, ex05 | quickselect 2-way; sao chép mỗi lần push; `indexOf/splice`; mảng không sắp | Perf ❌ cả bốn |

Các bài còn lại chưa thử bản ngây thơ riêng; mỗi module A01–A12 có ít nhất một bài đã thử như bảng trên. Nhiều phép thử bị bắt ở phần *cases* (quá 30 s) thay vì Perf, vì case cố định lớn (cố ý có `expected` công thức) chạy trước Perf; kết quả vẫn là ❌.

### Thử Python / Java (kiểu `sig` mới hoặc class)
Đã viết nhanh bản Python hoặc Java vào `answers/`, chạy `check --lang py|java`, rồi xóa:
- A03 ex09 (`String[]` tham số), ex10 (`List<String>` trả về) — Python và Java đều ✅.
- A05 ex04 (`TreeNode`) — Python ✅.
- A06 ex07 (`long[]` trả về) — Java ✅.
- A07 ex03 (`List<List<Integer>>` tham số + trả về), ex06 (`List<List<String>>`) — Python ✅.
- A08 ex06 (class với `long v`) — Python ✅; ex01 (class trả `long`) — Java ✅.
- A09 ex03 (`int[]` 10⁶ phần tử) — Python ✅; ex07 (`List<Integer>` 5·10⁵ phần tử) — Java ✅.
- A10 ex08 (`double`) — Java ✅.
- A11 ex03 (`int[][][]`) — Python và Java ✅.
- A12 ex03 (class DynamicArray) — Java ✅; ex04 (RandomizedSet, chấm bằng compare mô phỏng) và ex06 — Python ✅.

## Bài đã đổi so với kế hoạch (`tools/CONTENT_PLAN.md`)
Chi tiết cũng nằm trong cột Ghi chú của bảng trạng thái.
- **A01:** `mincostTickets` mở rộng (ngày tới 10⁹, n ≤ 10⁵, DP theo chỉ số); `deleteAndEarn` n ≤ 10⁵.
- **A02–A04:** các bài đếm (`change`, `numDecodings`, `uniquePaths*`, `findTargetSumWays`, `combinationSum4`) trả **mod 10⁹+7** vì ràng buộc lớn; `maxProduct` giới hạn |x| ≤ 2 để mọi tích vừa `int`; `diffLines` đặc tả quy tắc tie thành thuật toán duy nhất.
- **A05:** bài cây giới hạn n ≤ 5000 (đệ quy an toàn); `tsp` đồ thị có hướng.
- **A07:** `minCostConnectPoints`, `mstWeight`, `minimumCost` trả `long`; `criticalConnections` và `circularServiceGroups` chuẩn hóa đầu ra để so exact; `minCostConnectPoints` n ≤ 2000 để Prim O(n²) khác Kruskal; ex07 giải bằng Prim-heap.
- **A08:** các bài tổng/đếm trả `long`; `RangeAddSum.add(l, r, long v)`.
- **A11:** ex07 `canAccommodate` đổi thành đơn đặt phòng có **số phòng yêu cầu** (`[checkIn, checkOut, roomsNeeded]`) để khác `maxConcurrent`; `MyCalendarTwo` không đo Perf.
- **A12:** `reservoirSample` chuyển từ compare sang **RNG Park–Miller đặc tả trong đề** (so exact, tất định 3 ngôn ngữ); `RandomizedSet` chấm bằng mô phỏng (insert/remove đúng, getRandom thuộc tập và không hằng); `wiggleSortII` gen kiểm tồn tại nghiệm bằng vét cạn (điều kiện "tần suất ≤ ⌈n/2⌉" **không** đủ cho zigzag chặt, ví dụ `[2,4,4]`).

## Thay đổi ở `tools/`
Không thêm hay sửa mã trong `tools/` (check, lib, sig, spec...). Chỉ sửa `tools/CONTENT_PLAN.md` (dòng trạng thái và mục của A) và thêm file báo cáo này.

## Chưa verify / giới hạn đã biết
- **Python/Java chưa chạy toàn bộ:** chỉ spot-check như danh sách trên; không có bản đáp án Python/Java cho 102 bài. Các ghi chú "Python/Java" trong `solutions.ts` là kiến thức chung, không được chạy.
- **Ví dụ trong `exercises.md`:** phần lớn có trong `cases` với `expected` (được máy kiểm); một số ví dụ phụ viết tay trong đề không nằm trong `cases`.
- **A05, bài cây (ex04, ex05):** Perf không phân biệt Big-O (n ≤ 5000); mục đích là kiểm tra đệ quy sâu, ghi trong đề.
- **A11 ex05 (`MyCalendarTwo`):** `perf: false`, "tự giác".
- **A09:** hash dùng base cố định và mod 10⁹+7 (có kiểm chứng khi trùng hash nên kết quả luôn đúng; chỉ thời gian bị ảnh hưởng nếu bị tấn công anti-hash). README nhắc dùng base ngẫu nhiên khi nộp thật.
- **Độ ổn định Perf:** các bài dùng typed array lớn (A09 ex02/03, 10⁶ phần tử) dao động 2–4× giữa các lần chạy do GC; giới hạn đã nới (800 ms so với ~50–75 ms thường gặp).
- Số liệu thời gian trong README: không có số đo cụ thể, chỉ có các bậc lớn (vd. 10¹⁰ phép) suy ra từ ràng buộc.
