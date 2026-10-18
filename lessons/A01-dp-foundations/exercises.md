# A01 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A01-dp-foundations [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A01-dp-foundations 01` · Đo: `node tools/bench.ts lessons/A01-dp-foundations 06`

**Pass:** ≥ 8/10 bài qua `check`, và **mỗi bài viết được cả memo lẫn tabulation** (nói miệng hoặc viết hai bản cho ít nhất 3 bài, ghi rõ state thành một câu trước khi code), ≤ 3 hint.

> Trước mỗi bài: viết (1) state `dp[i]` nghĩa là gì, (2) transition, (3) base case, (4) thứ tự tính, (5) độ phức tạp.
> Câu hỏi quy mô (ex06): dự đoán thời gian của bản O(n·k) ở `n = k = 10⁵`, rồi `bench` để kiểm chứng.

---

## 🟢 Cơ bản

### ex01 · Tribonacci
`T₀ = 0, T₁ = T₂ = 1, Tₙ = Tₙ₋₁ + Tₙ₋₂ + Tₙ₋₃`. Trả về `Tₙ`.
```java
int tribonacci(int n)
```
- Ràng buộc: `0 ≤ n ≤ 37` (đáp án vừa `int`).
- Ví dụ: `4` → `4` · `25` → `1389537`.
- Mục tiêu: O(n) time, O(1) space. Đệ quy thuần không memo sẽ trượt Perf. (LeetCode 1137)

### ex02 · Leo cầu thang chi phí tối thiểu
Bậc `i` có chi phí `cost[i]` (trả khi **rời** bậc đó). Bắt đầu ở bậc 0 hoặc bậc 1, mỗi lần lên 1 hoặc 2 bậc. Đích là vị trí **sau** bậc cuối (`n`). Trả về chi phí tối thiểu.
```java
int minCostClimbingStairs(int[] cost)
```
- Ràng buộc: `2 ≤ n ≤ 10⁵`, `0 ≤ cost[i] ≤ 10⁴`.
- Ví dụ: `[10,15,20]` → `15` · `[1,100,1,1,1,100,1,1,100,1]` → `6`. (LeetCode 746)

### ex03 · House robber
Không được lấy hai nhà liền kề. Tổng tiền lớn nhất?
```java
int rob(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ nums[i] ≤ 10⁴`.
- Ví dụ: `[1,2,3,1]` → `4` · `[2,7,9,3,1]` → `12`.
- Gợi ý quy mô: memo đệ quy sâu `n` tầng sẽ tràn stack ở `n = 10⁵` (TS). Hãy thử, rồi chuyển sang bottom-up. (LeetCode 198)

### ex04 · House robber vòng tròn
Như ex03 nhưng nhà `0` và nhà `n-1` cũng kề nhau.
```java
int robCircular(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ nums[i] ≤ 10⁴`.
- Ví dụ: `[2,3,2]` → `3` · `[1,2,3,1]` → `4` · `[7]` → `7`. (LeetCode 213)

### ex05 · Xóa và kiếm điểm
Mỗi lượt chọn một số `x`: nhận `x` điểm cho **mỗi** phần tử bằng `x` (xóa hết chúng), đồng thời xóa mọi phần tử bằng `x - 1` và `x + 1`. Tổng điểm lớn nhất?
```java
int deleteAndEarn(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ nums[i] ≤ 10⁴`.
- Ví dụ: `[3,4,2]` → `6` · `[2,2,3,3,3,4]` → `9`. (LeetCode 740)

### ex06 · Đếm cách leo thang với bước 1..k
Số cách đi từ 0 đến đúng `n` khi mỗi bước nhảy `1..k`. Kết quả mod `10⁹ + 7`.
```java
int countWaysK(int n, int k)
```
- Ràng buộc: `1 ≤ n, k ≤ 10⁵`.
- Ví dụ: `(3, 2)` → `3` · `(4, 3)` → `7` · `(5, 1)` → `1`.
- Mục tiêu: O(n). Bản cộng `k` ô mỗi bước là O(n·k) — dự đoán rồi `bench`. Java: cộng bằng `long`, trừ mod nhớ `+ MOD`.

### ex07 · Vé tàu
`days` tăng ngặt là các ngày bạn đi tàu. Vé 1 ngày giá `costs[0]`, 7 ngày liên tiếp `costs[1]`, 30 ngày liên tiếp `costs[2]` (vé bắt đầu hiệu lực ngày mua). Chi phí tối thiểu để đi đủ các ngày?
```java
int mincostTickets(int[] days, int[] costs)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ days[i] ≤ 10⁹` (tăng ngặt), `1 ≤ costs[j] ≤ 10⁴`. Tổng ≤ `10⁹`.
- Ví dụ: `[1,4,6,7,8,20], [2,7,15]` → `11` · `[1,2,3,4,5,6,7,8,9,10,30,31], [2,7,15]` → `17`.
- Lưu ý: ngày tới `10⁹` nên **không** dựng mảng theo ngày — DP trên chỉ số. (LeetCode 983, bản mở rộng)

### ex08 · Sơn nhà
`n` ngôi nhà, mỗi nhà sơn một trong 3 màu, chi phí `costs[i][c]`. Hai nhà liền kề không cùng màu. Chi phí tối thiểu?
```java
int minCostPaint(int[][] costs)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ costs[i][c] ≤ 20`.
- Ví dụ: `[[17,2,17],[16,16,5],[14,3,19]]` → `10` · `[[7,6,2]]` → `2`. (LeetCode 256)

---

## 🔴 Thực tế

### ex09 · Câu hỏi thi có điểm
> "Bài thi có `n` câu, làm theo thứ tự. Câu `i` có `[points, brainpower]`: nếu **làm** câu `i` được `points` nhưng phải bỏ qua `brainpower` câu kế tiếp; nếu **bỏ** thì chuyển sang câu `i + 1`. Tổng điểm lớn nhất?"

```java
long mostPoints(int[][] questions)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ points ≤ 10⁹`, `0 ≤ brainpower ≤ 10⁵`. Tổng có thể vượt `int` → Java `long`.
- Ví dụ: `[[3,2],[4,3],[4,4],[2,5]]` → `5` · `[[1,1],[2,2],[3,3],[4,4],[5,5]]` → `7`. (LeetCode 2140)

### ex10 · Xếp lịch công việc có lợi nhuận
> "Có `n` công việc, việc `i` chạy trong `[startTime[i], endTime[i])` và mang lại `profit[i]`. Hai việc được chạy cùng lúc nếu không chồng nhau (việc kết thúc lúc `t` nhường cho việc bắt đầu lúc `t`). Chọn tập việc không chồng nhau để lợi nhuận lớn nhất."

```java
int jobScheduling(int[] startTime, int[] endTime, int[] profit)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ startTime[i] < endTime[i] ≤ 10⁹`, `1 ≤ profit[i] ≤ 10⁴` (tổng ≤ `10⁹`).
- Ví dụ: `[1,2,3,3], [3,4,5,6], [50,10,40,70]` → `120` · `[1,1,1], [2,3,4], [5,6,4]` → `6`.
- Mục tiêu: O(n log n). Quét tuyến tính tìm việc tương thích là O(n²) → trượt Perf. (LeetCode 1235)
