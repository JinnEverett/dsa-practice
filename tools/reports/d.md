# Báo cáo nhóm d — D01–D10, CAP

Nhánh: `claude/content-d-nej9dr` (theo yêu cầu của phiên; brief ghi `content/d`). Môi trường: Node 24.22.0 (cài bằng `npm i -g node@24 --force`), Python 3.13, OpenJDK 21.

## Module đã soạn (11 module, 23 bài class)

| Module | Bài | Ghi chú |
|---|---|---|
| D01 Phương pháp | `MaxStack` (LC 716), `FreqStack` (LC 895, 🔴) | `DESIGN.md` mẫu đầy đủ 7 bước cho MaxStack (heap + xóa lười) |
| D02 LRU & LFU | `LRUCache`, `LFUCache` | DESIGN mẫu cho LRU (DLL + Map) |
| D03 Hit counter & rate limiter | `HitCounter` (vòng 300 bucket), `PerUserLimiter` (🔴) | |
| D04 Time-based KV | `TimeMap`, `SnapshotArray` (🔴) | |
| D05 RandomizedCollection & iterators | `RandomizedCollection`, `PeekingIterator`, `ZigzagIterator` (🔴) | 3 bài (kế hoạch 2) |
| D06 Leaderboard | `Leaderboard`, `RankBoard` (🔴) | |
| D07 Router / file system | `Router` (🔴), `FileSystem` | |
| D08 Task scheduler | `TaskScheduler` (🔴, có `scheduleEvery`), `TaskManager` | |
| D09 Ordered map | `OrderedMap`, `MyCalendar` (🔴) | export `IndexedSkipList` có span để CAP dùng |
| D10 Text buffer & undo/redo | `TextEditor`, `UndoRedo` (🔴) | |
| CAP mini-Redis | `MiniKV`, `MiniRedis` | `MiniRedis extends MiniKV` trong lời giải |

Mỗi module có `README.md`, `exercises.md`, `solutions.ts`, `checks.ts`, `DESIGN.md` (7 bước, sơ đồ mermaid, số `bench` thật). Không tạo `answers/`; mọi file thử đã xóa.

## Kết quả kiểm chứng

| Lệnh | Kết quả |
|---|---|
| `DSA_PERF_FACTOR=3 node tools/check.ts --all <ID> --src solutions --quiet` (D01–D10, CAP) | 23/23 đúng, 0 sai |
| `DSA_PERF_FACTOR=1 node tools/check.ts --all D --src solutions --quiet` và `--all CAP` | 23/23 đúng — **không bài nào chỉ qua nhờ `DSA_PERF_FACTOR`** |
| `DSA_PERF_FACTOR=3 node tools/check.ts --all --src solutions --quiet` (toàn repo) | 182 đúng, 0 sai |
| `npx tsc --noEmit` | exit 0 |

Giới hạn Perf đặt ≥ 5× thời gian ref đo thật (xem từng `checks.ts`; lúc đo ref chạy 13–335 ms ở n = 10⁵ tùy bài, giới hạn 250–1 000 ms).

### Bản ngây thơ bị Perf bắt (đã chạy thật, mỗi module ít nhất một bài)
D01 (quét `popMax`: 1 735 ms > 1 200), D02 (mảng `findIndex`: 818 ms > 300), D03 (hai bài), D04 (hai bài), D05 (`indexOf+splice`: 2 234 ms > 250), D06 (hai bài, cả bản Java quét O(n)), D07 (quét mọi route: ~29 s; flat-map ls: 6,5 s), D08 (hai bài), D09 (quét: 3 969 ms > 1 800; lịch quét: > 9 s), D10 (hai bài), CAP (5 193 ms và 3 655 ms so với 1 200/1 800).

### Kiểm tra spec bằng đột biến (phá một chỗ trong lời giải mẫu, xem spec có bắt không)
- D05: chọn `getRandom` theo khóa phân biệt → bắt bởi case phân phối (497/1000 thay vì ≈ 667).
- D06: `splice(bi + 1, …)` → `splice(bi, …)` khi tách khối: stress nhỏ **không** bắt, hai case lớn (3 000 / 6 000 thao tác) bắt → đã thêm hai case này.
- D09: bỏ `span++` ở tầng cao: stress nhỏ **không** bắt, case 4 000 thao tác bắt → đã thêm case lớn.
- CAP: 5 đột biến (zadd không xóa khóa cũ, `ttl` đụng LRU, `set` không xóa TTL, list rỗng không xóa key, dựng lại heap sai `ver`); hai đột biến đầu tiên lọt qua bộ case ban đầu nên đã thêm case "set ghi đè xóa TTL" và case "đặt lại TTL 60 lần".

### Cross-check ngôn ngữ (đã chạy `check --lang py|java`, rồi xóa file thử)
Python: D02 ex01, D03 ex01, D04 ex01, D05 ex01, D06 ex02, D07 ex02, D08 ex02, D10 ex01, CAP ex02 (cài độc lập, `bisect`, qua toàn bộ case + stress).
Java: D01 ex01, D02 ex02, D03 ex02, D04 ex02, D05 ex03, D06 ex01, D07 ex01, D08 ex01, D09 ex01, D10 ex02, CAP ex01.
Các kiểu mới được dùng (class có `long`, `Integer`/`Long` nullable, `String` trả `null`, `List<String>`/`List<Integer>` trả về, `int[][]` làm tham số constructor, `int[]` x2) đều chạy đúng ở cả hai runner. Một số bản thử cố ý chậm (Java quét O(n) cho D06, `subMap().size()` O(k) cho D09, `removeIf` O(n) cho D01) bị Perf bắt đúng như README ghi.

## Thay đổi so với kế hoạch
- D05: thêm bài thứ 3 (`PeekingIterator`, `ZigzagIterator` tách riêng); ex02/ex03 không có Perf (một thao tác O(1) quá rẻ ở n = 10⁵) — đã ghi “tự giác” trong `exercises.md`. `RandomizedCollection` dùng `compare` mô phỏng lại chuỗi thao tác + kiểm thống kê (±6σ) vì `getRandom` ngẫu nhiên.
- D08: thêm `scheduleEvery(id, at, period)` cho việc lặp lại (ROADMAP có “lặp lại”); `TaskManager` nhận `int[][]` thay vì `List<List<Integer>>`.
- D10: `UndoRedo(int maxHistory)` với lệnh `"+text"`/`"-k"` (kế hoạch chỉ ghi `apply(String op)`).
- CAP: tách thành 2 bài (`MiniKV` rồi `MiniRedis`) thay vì 1 class lớn; đồng hồ do `setTime(now)` đẩy vào; `del` đổi thành `delete` vì `del` là từ khóa Python; thêm `type`, `size`, `zscore` để test được.
- `DESIGN.md` nằm trong `lessons/<ID>-<slug>/` (mẫu của coach); thư mục `designs/` vẫn dành cho bài nộp của người học.

## Thay đổi ở `tools/`
Chỉ `tools/CONTENT_PLAN.md` (dòng trạng thái D01–D10, CAP và một ghi chú đầu mục Tier D) và file này. Không đổi `check/lib/sig/spec/...`.

## Phát hiện đáng nhớ khi soạn
- `Map` của JS: `delete` + `set` rồi `keys().next()` để lấy phần tử cũ nhất chậm hơn DLL rõ rệt khi có nhiều lần xóa ở đầu (D03: 385 ms so với 46 ms ở n = 10⁵ với nhiều user bị evict; D02: ~2,5×). README/solutions ghi lại.
- Sinh dữ liệu cho bench: trình sinh dùng `[...set]`/`pick([...map.keys()])` ở mỗi thao tác làm bench scale `l` treo (D07) — đã sửa bằng mảng song song.
- Expected viết tay sai ba lần (D08 TaskManager ví dụ hòa ưu tiên; D10 hai ví dụ `TextEditor`): do tính tay/chép sai, đã sửa sau khi dry-run lại theo định nghĩa hoặc đối chiếu ví dụ LeetCode (không sửa ref).

## Chưa verify / giới hạn
- Mọi module đều có ít nhất một bài đã chạy ở Python hoặc Java; **chưa** có bản port nào cho D01 ex02 (`FreqStack`), D05 ex02 (`PeekingIterator`), D09 ex02 (`MyCalendar`). Mỗi bài class chỉ được thử ở MỘT ngôn ngữ ngoài TS (không phải cả hai). Lời giải mẫu viết bằng TS; chỉ TS được kiểm chứng đầy đủ.
- Số `bench` trong DESIGN/README đo trên VM cloud chia sẻ CPU; con số tuyệt đối sẽ khác ở máy người học (số mũ thực nghiệm ổn định hơn).
- Hạng mục “câu hỏi quy mô” chỉ là đề bài, chưa có đáp án mẫu (người học tự dự đoán rồi chạy `bench`).
