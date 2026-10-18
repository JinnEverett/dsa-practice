# D08 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D08-task-scheduler [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D08-task-scheduler 01`

**Pass:** 2/2 bài qua `check` + một trang thiết kế 7 bước cho biến thể "timer wheel" (độ phân giải 1 ms, hoãn tối đa 1 giờ): chọn số ô, xử lý việc vượt vòng, độ phức tạp, ≤ 2 hint. Trước khi code, nói ý tưởng + độ phức tạp.

> Bài class: `args = [ops, opArgs]`; kết quả `void` là `null`. `List<Integer>` được so **đúng thứ tự**.

---

## 🟡 Kết hợp

### ex02 · TaskManager (class)
Quản lý công việc của nhiều người dùng; luôn thực thi việc ưu tiên cao nhất.
```java
class TaskManager {
  TaskManager(int[][] tasks)                          // mỗi phần tử {userId, taskId, priority}
  void add(int userId, int taskId, int priority)      // taskId chưa tồn tại
  void edit(int taskId, int newPriority)              // taskId đang tồn tại
  void rmv(int taskId)                                // taskId đang tồn tại
  int execTop()                                       // chạy (và xóa) việc ưu tiên cao nhất; trả userId; không còn việc → −1
}
```
- Việc "cao nhất" = `priority` lớn nhất; hòa thì `taskId` **lớn hơn**.
- Ràng buộc: `0 ≤ priority ≤ 10⁹`, `taskId` duy nhất, tối đa `10⁵` việc ban đầu và `2·10⁵` lần gọi, `0 ≤ userId ≤ 10⁵`.
- Ví dụ: `TaskManager([[1,101,10],[2,102,20],[3,103,15]])`, `add(4,104,5)`, `edit(102,8)`, `execTop() → 3`, `rmv(101)`, `add(5,105,15)`, `execTop() → 5`. (LeetCode 3408)
- Mục tiêu: `execTop` ≈ O(log n). Quét tìm max mỗi lần sẽ trượt Perf.

---

## 🔴 Thực tế

### ex01 · Bộ lập lịch công việc (class)
Một dịch vụ cron nội bộ chạy các việc theo giờ, cho phép hủy hoặc đổi lịch, và có việc định kỳ. Đồng hồ do caller đẩy: `advance(now)` báo "bây giờ là `now`" và nhận danh sách việc đến hạn.
```java
class TaskScheduler {
  TaskScheduler()
  void schedule(int id, long at)                     // chạy MỘT lần ở thời điểm `at`; nếu id đã đang chờ thì thay thế lịch cũ
  void scheduleEvery(int id, long at, long period)   // chạy ở at, at+period, at+2·period, ...; thay thế lịch cũ của id
  boolean cancel(int id)                             // hủy việc đang chờ (một lần hoặc định kỳ); true nếu có hủy
  List<Integer> advance(long now)                    // mọi lần chạy có thời điểm ≤ now, theo thứ tự (thời điểm, id)
}
```
- `advance` trả **mỗi lần chạy** thành một phần tử: việc định kỳ có thể xuất hiện nhiều lần nếu `now` nhảy qua nhiều chu kỳ. Việc một lần bị xóa sau khi chạy; việc định kỳ tiếp tục với `at + period`.
- Hai lần chạy cùng thời điểm → `id` nhỏ trước. `schedule` với `at` đã ở quá khứ (`at ≤` mốc `advance` gần nhất) vẫn hợp lệ: nó chạy ở lần `advance` kế tiếp.
- Ràng buộc: `1 ≤ id ≤ 10⁵`, `0 ≤ at ≤ 10¹²` (Java: `long`), `1 ≤ period ≤ 10⁹`, tối đa `10⁵` lần gọi; tổng số phần tử trả về của mọi lần `advance` ≤ `10⁶`.
- Ví dụ: `schedule(1,10), schedule(2,5), schedule(3,10), cancel(2) → true, cancel(2) → false, advance(9) → [], advance(10) → [1,3]`. Định kỳ: `scheduleEvery(7,10,5), advance(9) → [], advance(22) → [7,7,7]` (ở 10, 15, 20), `cancel(7) → true`.
- Mục tiêu: `schedule` O(log n), `cancel` O(1), bộ nhớ không phình khi hủy nhiều việc ở tương lai xa. Quét tuyến tính mọi việc đang chờ ở mỗi `advance` sẽ trượt Perf.
- 🧭 Câu hỏi quy mô: `10⁶` việc rải đều trong 1 giờ, độ phân giải 1 ms. Heap hay timer wheel? Tính số ô và bộ nhớ của wheel.
