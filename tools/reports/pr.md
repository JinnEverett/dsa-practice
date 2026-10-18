# Báo cáo nhóm `pr` (branch `content/pr`): P01–P07, R01–R10

## Môi trường
- Cloud: Node mặc định 22.22 → cài Node **24.22.0** bằng `npm i node@24 --prefix <thư mục riêng>` rồi đặt vào `PATH` (`npm i -g node@24` báo `EEXIST` vì `/opt/node22/bin/node` đã tồn tại); Python 3.13, OpenJDK 21.
- Mọi lệnh kiểm chứng chạy bằng Node 24.

## Module đã làm (17/17)
| Module | Số bài | Ghi chú |
|---|---|---|
| P01 Pattern recognition | 20 đề | README + `exercises.md` + `solutions.md`; **không có checks.ts** (đúng kế hoạch) |
| P02 Interview framework | 3 | `solutions.ts` có transcript 7 bước dạng comment |
| P03 Scale effects trong JS | 10 thí nghiệm | `benchOnly`; `experiments.ts` (22 hàm) + `verify.ts`; `solutions.md` toàn số đo thật |
| P04 Testing & stress test | 8 | `bugs/bugNN.{ts,py,java}`; phần stress tự viết không chấm máy |
| P05 / P06 / P07 | 6 / 5 / 4 | LC 169·121·392·228·496·409 / 621·863·909·523·334 / 4·10·815·2402 |
| R01–R10 | 5 mỗi module | hash/RNG đặc tả trong đề: R07·R08 (`g = fmix32(fnv1a32)`), R09 (LCG); R02 token bucket tính bằng mili-token nguyên để tất định |

## Kiểm chứng
Lệnh bắt buộc (Node 24, `DSA_PERF_FACTOR=3`):
```
node tools/check.ts --all <ID> --src solutions --quiet     # mọi module P/R
npx tsc --noEmit                                           # sạch, không lỗi
DSA_PERF_FACTOR=3 node tools/check.ts --all --src solutions --quiet   # toàn bộ workspace
```
- Từng module: ✅ toàn bộ bài (P02 3/3, P04 8/8, P05 6/6, P06 5/5, P07 4/4, R01–R10 5/5; P01 không có checks, P03 `benchOnly` nên `check` bỏ qua).
- **Toàn workspace với `DSA_PERF_FACTOR=3`: 235 đúng · 0 sai · 0 chưa làm** (159 bài cũ + 76 bài mới).
- **Không có chỗ nào chỉ qua nhờ `DSA_PERF_FACTOR`:** mọi module P/R cũng qua ở `DSA_PERF_FACTOR=1`. 57 phép đo perf (đo lại sau khi chỉnh giới hạn); `limit/thời gian` thấp nhất ≈ 4,6–4,9× ở 4 bài (kNearest, mostBooked, BKTree, GridIndex), mọi bài khác ≥ 5,2×. Chạy lặp thì thời gian lệch ±20% nhưng chưa thấy đỏ. Giới hạn đã được chỉnh theo đo thật ở commit `chore: nới/siết giới hạn perf…`.

### Bản ngây thơ sai Big-O bị Perf bắt (chạy `brute` làm bài làm: Stress ✅, Perf ❌)
R01 ex01·02·04·05 · R02 ex02 · R03 ex01·03·04·05 · R04 ex01·03·05 · R05 ex01·03 · R06 ex01·02·05 · R08 ex01·02·05 · R09 ex01·02·03·04 · R10 ex03·04·05 · P02 ex01 (+ DFS đệ quy ex03 tràn stack ở cụm 10⁵ ô) · P04 bug04·bug08 (cả TS/Python/Java) · P05 ex02·05 · P06 ex04·05 · P07 ex01·02 (đệ quy không nhớ)·04.
- R07 không có bản "sai Big-O" tự nhiên (mọi thao tác O(1)/O(k)); bản **sai bản chất** (`Set` chính xác thay Bloom filter) đã chạy thử và bị case `m = 1` bắt.
- Không có perf phân biệt Big-O (`perf: false`, hoặc chỉ là kiểm tra sanity vì một lần gọi O(n) ở n = 10⁵ quá rẻ): R01 ex03 · R02 ex01·03·04 · R03 ex02 · R04 ex02·04 · R05 ex04·05 · R06 ex03·04 · R07 (cả module) · R08 ex03·04 · R09 ex05 · R10 ex01·02 · P05 ex01·03·04·06 · P06 ex01·03 · P07 ex03. `exercises.md` ghi "tự giác" ở những chỗ liên quan (R06 ex03, R01 ex05).

### Thử Python / Java (theo yêu cầu cho kiểu `sig` mới hoặc class)
Đã viết nhanh rồi xóa: R01 ex02 (py), ex04 (java) · R02 ex05 (py) · R03 ex01 (java, `int[][][]`) · R04 ex04·05 (py) · R05 ex04 (py) · R06 ex04 (py + java, tiếng Việt UTF-8 / NFD) · R07 ex01·05 (java), ex04 (py) · R08 ex03 (py), ex04 (java) · R09 ex01 (py), ex05 (java, LCG) · R10 ex03 (java), ex04 (py) · P02 ex03 (java) · P05 ex04 (java) · P06 ex02 (java, `TreeNode`) · P07 ex01 (py), ex04 (java; bản ép `int` bị bắt đúng ở case tràn). **P04:** cả 24 file `bugs/*` đã chạy `check`: 23 báo SAI như thiết kế, riêng `bug05.py` ĐÚNG có chủ đích (Python không tràn).

## Thay đổi so với kế hoạch (`tools/CONTENT_PLAN.md`)
- **R03 ex01:** `feedPage` (hàm) → class `FeedMerger` để đo được nhiều truy vấn (một lần gọi quá rẻ).
- **R06 ex01:** `Autocomplete` (trùng I12 ex7) → `Suggest(k)` có weight cộng dồn + cache top-k tại node.
- **R07:** `falsePositiveRate` gộp thành `measureBloom` (trả `[lýThuyết, đoThật]`); `bloomParams` trả `long[]` (m có thể > 2³¹). Hash đặc tả `g = fmix32(fnv1a32)` — FNV thuần cho sai dương **2,59%** thay vì 1% (đo thật), đã ghi vào README.
- **R08:** `diffBlocks` → class `MerkleSync` (update O(log n)) để perf phân biệt được.
- **R09:** diff dòng (trùng A03 ex10) → `myersDistance` O((N+M)·D); thêm `sampleLog` với LCG đặc tả (chú ý tràn `int`).
- **R01:** ex05 thêm `keys()` để máy kiểm tra thứ tự; **R02 ex05:** `compareLimiters` trả 8 số; **R04 ex02:** `retrySchedule` có `deadlineMs`, trả mốc cộng dồn.
- **Pass R03/R05/R09:** ROADMAP ghi "6/8"; với 5 bài/module tôi đặt **4/5** (R03, R05, R09 trong `exercises.md`), chưa sửa ROADMAP.
- **P04:** thêm thư mục `bugs/` (nguồn code lỗi cho cả ba ngôn ngữ).

## Thay đổi ở `tools/`
Không đổi file mã nào ở `tools/` (không thêm kiểu `sig`, không đổi `check/bench/spec`). Chỉ sửa **dòng trạng thái P01–P07, R01–R10** trong `tools/CONTENT_PLAN.md` và thêm file này.

## Phát hiện đáng ghi lại (đều đo thật, nằm trong README/solutions của module tương ứng)
- `Map`-LRU (delete + set) trong V8 chậm hơn DLL **~5×** ở 10⁶–10⁷ thao tác và tăng siêu tuyến tính (R01).
- `Array.prototype.shift()` có "vách đá": rút cạn mảng 10⁴ phần tử 1 ms, 5·10⁴ → 2,7 s, 10⁵ → 10,5 s, 2·10⁵ → 42,9 s (P04 ex08, solutions).
- `new Array(n)` (holey) nhanh hơn `push` 4–5× vì cấp phát trước; `+=` chuỗi nhanh hơn `join` trong V8 (P03). `Set<number>` ≈ 50 byte/phần tử, siêu tuyến tính ở 10⁷ (P03).
- Java `ArrayList<Integer>` chậm hơn `int[]` ~80× (tổng 10⁶ phần tử), `String +=` 1,1 s vs `StringBuilder` 2 ms ở 10⁵ (P03, đo thô).

## Chưa verify / lưu ý
- Python/Java: chỉ thử mẫu như liệt kê ở trên, **không** viết trọn bộ đáp án cho mọi bài.
- P01 không có kiểm tra máy; đáp án trong `solutions.md` do người soạn tự đối chiếu. P04 phần B (stress tự viết) và phần nói của P02/P05–P07 cần coach chấm.
- Số đo trong README/solutions là từ container cloud 4 vCPU (Node 24.22.0); chỉ tỉ lệ/xu hướng đáng tin giữa các máy.
- Nhánh làm việc được tạo là `content/pr` (theo yêu cầu); nhánh `claude/dsa-content-modules-tmaig4` được cấp sẵn không có commit nào.
