# R04 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R04-scheduler [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R04-scheduler 01`

**Pass:** 4/5 bài qua `check`, trong đó ex01 và ex05 (scheduler qua stress test).

---

## 🟢 Cơ bản

### ex01 · Delay queue (class)
```java
class DelayQueue {
  DelayQueue()
  void schedule(int id, long runAt, int priority)
  List<Integer> poll(long now)
}
```
- `poll(now)`: trả id mọi job có `runAt ≤ now` (đồng thời **xóa** chúng), thứ tự: `runAt` tăng dần, hòa thì `priority` **giảm dần** (lớn chạy trước), hòa nữa thì `id` tăng dần.
- Ràng buộc: `0 ≤ id < 10⁶` (không trùng khi còn trong hàng), `0 ≤ runAt, now ≤ 10¹²`, `0 ≤ priority ≤ 10⁹`, tối đa `10⁵` thao tác; `now` không giảm; có thể `schedule` job với `runAt` đã qua.
- Ví dụ: `schedule(1,100,0) schedule(2,50,0) schedule(3,50,5) schedule(4,200,9) poll(49)→[] poll(60)→[3,2] poll(1000)→[1,4]`.

### ex02 · Lịch retry với exponential backoff
Lần thử thứ `i` (từ 0) chờ `d_i = min(capMs, baseMs · 2^i)` sau lần trước. Trả các **mốc thời gian** (tính từ lần lỗi đầu tiên) của các lần retry: `t_i = d_0 + … + d_i`, chỉ giữ những mốc `≤ deadlineMs`, tối đa `attempts` mốc.
```java
long[] retrySchedule(int attempts, long baseMs, long capMs, long deadlineMs)
```
- Ràng buộc: `0 ≤ attempts ≤ 100`, `1 ≤ baseMs ≤ 10⁹`, `1 ≤ capMs ≤ 10¹²`, `0 ≤ deadlineMs ≤ 10¹²`. Chú ý `baseMs · 2^i` có thể tràn `long` nếu tính ngây thơ.
- Ví dụ: `(5, 100, 1000, 100000)` → `[100, 300, 700, 1500, 2500]` · `(6, 1000, 5000, 12000)` → `[1000, 3000, 7000, 12000]` · `(3, 500, 100, 10000)` → `[100, 200, 300]`.

---

## 🟡 Kết hợp

### ex03 · Timer wheel (class)
Thời gian rời rạc theo *tick*, bắt đầu ở tick 0. `add(id, d)` đặt timer nổ ở tick `hiện tại + d`; mỗi `tick()` tiến thời gian thêm 1 và trả id các timer nổ đúng tick đó (theo thứ tự `add`).
```java
class TimerWheel {
  TimerWheel(int slots)
  void add(int id, int delayTicks)
  List<Integer> tick()
}
```
- Cài đặt bằng vòng `slots` ô (hashed wheel); delay có thể lớn hơn `slots`. Ràng buộc: `1 ≤ slots ≤ 10⁵`, `1 ≤ delayTicks ≤ 10⁹`, tối đa `10⁵` thao tác.
- Ví dụ: `TimerWheel(4)`: `add(1,2) add(2,2) add(3,5) tick→[] tick→[1,2] tick→[] tick→[] tick→[3]`.
- Mục tiêu: `tick` không quét mọi timer đang chờ.

### ex04 · Lần chạy kế tiếp của cron
Cron rút gọn gồm 2 trường `"<phút> <giờ>"`. Mỗi trường: `*` (mọi giá trị), `*/n` (các bội của n từ 0, nhỏ hơn giới hạn 60 hoặc 24), hoặc danh sách `a,b,c` (số hợp lệ, không rỗng). Thời gian tính bằng **phút kể từ mốc 0 = 00:00 UTC**: phút trong giờ `= t mod 60`, giờ trong ngày `= floor(t / 60) mod 24`.
```java
long nextRun(String cron, long minute)
```
- Trả `t` nhỏ nhất **lớn hơn hẳn** `minute` mà `t` khớp cả hai trường. Ràng buộc: `0 ≤ minute ≤ 10¹²`.
- Ví dụ: `("*/15 *", 0)` → `15` · `("0 9", 0)` → `540` · `("0 9", 540)` → `1980` · `("30,45 2,14", 165)` → `870` · `("5 23", 1439)` → `2825`.

---

## 🔴 Thực tế

### ex05 · 🔴 Mô phỏng job queue nhiều worker có ưu tiên + retry
Hệ thống có `workers` worker giống nhau. `jobs[i] = [arrive, priority, duration, failures]`: job tới lúc `arrive`; mỗi lần chạy tốn `duration`; **`failures` lần chạy đầu thất bại** (sau đúng `duration`) rồi mới thành công. Sau lần thất bại thứ `a` (a = 0, 1, …) kết thúc lúc `f`, job quay lại hàng đợi, sẵn sàng lúc `f + 10·2^a`.
Quy tắc: tại thời điểm `t`, worker rảnh nhận job đã sẵn sàng (`ready ≤ t`) có **priority lớn nhất**; hòa thì `ready` nhỏ hơn; hòa nữa thì chỉ số nhỏ hơn. Job bắt đầu ngay lúc `t`. Trả thời điểm mỗi job **hoàn thành thành công**.
```java
long[] simulateJobQueue(int workers, int[][] jobs)
```
- Ràng buộc: `1 ≤ workers ≤ 100`, `0 ≤ |jobs| ≤ 10⁵`, `0 ≤ arrive ≤ 10⁶`, `0 ≤ priority ≤ 10⁹`, `1 ≤ duration ≤ 20`, `0 ≤ failures ≤ 5`.
- Ví dụ: `workers=1`, `jobs=[[0,1,5,0],[0,9,3,0],[1,5,2,0]]` → `[10,3,5]` · `[[0,1,5,1]]` → `[20]` (chạy 0–5 thất bại, ready 15, chạy 15–20).
- **Câu hỏi quy mô:** mô phỏng từng giây tốn O(T · n). Với T = 10⁶ và n = 10⁵ thì cỡ bao nhiêu phép? Đo bản của bạn ở `n = 10³, 10⁴, 10⁵` job (`bench`) và xem số mũ.
