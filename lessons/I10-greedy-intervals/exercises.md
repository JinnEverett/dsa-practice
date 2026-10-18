# I10 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I10-greedy-intervals [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I10-greedy-intervals 01`

**Pass:** ≥ 8/10 bài qua `check`, ≤ 3 hint, **và** với ít nhất 2 bài bạn nêu được *exchange argument* (hoặc phản ví dụ của một greedy sai) trước khi code; trả lời được **câu hỏi quy mô** cuối file.

> Nhiều test là input 10⁵ phần tử để loại các lời giải DP O(n²) hoặc mô phỏng O(n²). Ex04 không đo Perf (cách O(n) và O(n log n) khác nhau quá ít) — tự giác quét một lượt.
> Java: nhớ `Integer.compare` trong comparator, và `long` cho tổng lớn.

---

## 🟢 Cơ bản

### ex01 · Có nhảy tới ô cuối?
Đứng ở ô 0; ở ô `i` nhảy được **tối đa** `nums[i]` ô sang phải.
```java
boolean canJump(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ nums[i] ≤ 10⁵`.
- Ví dụ: `[2,3,1,1,4]` → `true` · `[3,2,1,0,4]` → `false`. (LeetCode 55)

### ex02 · Số bước nhảy ít nhất
Như ex01, **bảo đảm tới được ô cuối**. Số lần nhảy ít nhất để tới ô cuối?
```java
int jump(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ nums[i] ≤ 10⁵`.
- Ví dụ: `[2,3,1,1,4]` → `2` · `[0]` → `0` · `[1,1,1,1]` → `3`. (LeetCode 45)

### ex03 · Xóa ít khoảng để hết chồng nhau
Xóa ít khoảng nhất để các khoảng còn lại **không chồng nhau**. Hai khoảng chỉ **chạm đầu mút** (`[1,2]` và `[2,3]`) không tính là chồng.
```java
int eraseOverlapIntervals(int[][] intervals)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ start < end ≤ 10⁹`.
- Ví dụ: `[[1,2],[2,3],[3,4],[1,3]]` → `1` · `[[1,2],[1,2],[1,2]]` → `2` · `[[1,2],[2,3]]` → `0`. (LeetCode 435)
- Hãy thử trước: "giữ khoảng bắt đầu sớm nhất" sai ở đâu? (`[[1,100],[11,22],[1,11],[2,12]]`)

### ex04 · Chèn khoảng và gộp
`intervals` đã **sắp theo `start`** và **rời nhau** (khoảng này kết thúc trước khi khoảng sau bắt đầu: `end < start` kế tiếp). Chèn `newInterval` rồi gộp mọi khoảng chồng hoặc chạm nhau.
```java
int[][] insertInterval(int[][] intervals, int[] newInterval)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ start ≤ end ≤ 10⁹` (khoảng suy biến `[x, x]` được phép), kết quả vẫn sắp.
- Ví dụ: `[[1,3],[6,9]], [2,5]` → `[[1,5],[6,9]]` · `[[1,5]], [5,6]` → `[[1,6]]`. (LeetCode 57)

---

## 🟡 Kết hợp

### ex05 · Số mũi tên ít nhất bắn hết bóng
Bóng là đoạn `[xstart, xend]` trên trục hoành; mũi tên bắn thẳng đứng tại tọa độ `x` làm vỡ mọi bóng có `xstart ≤ x ≤ xend`. Số mũi tên ít nhất để làm vỡ mọi bóng?
```java
int findMinArrowShots(int[][] points)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `-2³¹ ≤ xstart ≤ xend ≤ 2³¹ − 1` — **tràn int nếu so sánh bằng phép trừ**.
- Ví dụ: `[[10,16],[2,8],[1,6],[7,12]]` → `2` · `[[1,2],[2,3],[3,4],[4,5]]` → `2`. (LeetCode 452)

### ex06 · Trạm xăng vòng tròn
`n` trạm xếp vòng; trạm `i` cho `gas[i]`, đi tới trạm `i+1` tốn `cost[i]`. Bắt đầu với bình rỗng ở một trạm, đi **một vòng theo chiều tăng chỉ số**. Trả về chỉ số xuất phát **nhỏ nhất** đi trọn một vòng được; không có → `-1`.
```java
int canCompleteCircuit(int[] gas, int[] cost)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ gas[i], cost[i] ≤ 10⁵` (tổng có thể vượt `int`: dùng `long`).
- Ví dụ: `[1,2,3,4,5], [3,4,5,1,2]` → `3` · `[2,3,4], [3,4,3]` → `-1` · `[2,2], [1,1]` → `0`. (LeetCode 134)

### ex07 · Chia chuỗi theo chữ cái
Chia chuỗi thành **nhiều phần nhất có thể** sao cho mỗi chữ cái chỉ xuất hiện trong **một** phần. Trả về độ dài các phần theo thứ tự.
```java
List<Integer> partitionLabels(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁵`, chữ thường.
- Ví dụ: `"ababcbacadefegdehijhklij"` → `[9,7,8]` · `"eccbbbbdec"` → `[10]`. (LeetCode 763)

### ex08 · Chia kẹo
Mỗi em có điểm `ratings[i]`, đứng thành hàng. Mỗi em ≥ 1 viên; em có điểm **cao hơn** láng giềng bên cạnh phải có **nhiều kẹo hơn** em đó. Tổng số kẹo ít nhất?
```java
long candy(int[] ratings)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ ratings[i] ≤ 10⁹`. Tổng có thể tới `n(n+1)/2 ≈ 5·10⁹` → trả `long`.
- Ví dụ: `[1,0,2]` → `5` · `[1,2,2]` → `4` · `[1,3,2,2,1]` → `7`. (LeetCode 135, kiểu trả về đổi sang `long`)

---

## 🔴 Thực tế

### ex09 · Tham dự nhiều sự kiện nhất
> "Mỗi sự kiện diễn ra liên tục từ ngày `start` đến hết ngày `end` (cả hai đầu). Bạn có thể tham dự sự kiện vào **bất kỳ ngày nào** trong khoảng đó nhưng mỗi **ngày** chỉ tham dự được **một** sự kiện. Tham dự được nhiều sự kiện nhất là bao nhiêu?"

```java
int maxEvents(int[][] events)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ start ≤ end ≤ 10⁹`.
- Ví dụ: `[[1,2],[2,3],[3,4]]` → `3` · `[[1,2],[2,3],[3,4],[1,2]]` → `4` · `[[1,1],[1,1],[1,1]]` → `1`. (LeetCode 1353)
- Mục tiêu: O(n log n); không lặp từng ngày tới 10⁹.

### ex10 · Học nhiều khóa nhất trước hạn chót
> "Khóa `i` mất `duration[i]` ngày học liên tục và phải **xong không muộn hơn** `lastDay[i]`. Học tuần tự từng khóa (không song song), bắt đầu từ ngày 1. Học được nhiều khóa nhất là bao nhiêu?"

```java
int scheduleCourse(int[][] courses)    // courses[i] = [duration, lastDay]
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ duration ≤ 10⁴`, `1 ≤ lastDay ≤ 2·10⁸`.
- Ví dụ: `[[100,200],[200,1300],[1000,1250],[2000,3200]]` → `3` · `[[3,2],[4,3]]` → `0`. (LeetCode 630)

---

## ❓ Câu hỏi quy mô (làm sau khi qua ex01 và ex03)

1. Bản DP `can[i + k] = true` cho ex01 là O(n · max nhảy). Với `nums[i]` tới 10⁵ và `n = 10⁵`, **dự đoán** nó chạy bao lâu? (Tính số phép: ~n²/2.) Greedy O(n) thì sao? Kiểm chứng bằng `bench`.
2. Ex03: sắp xếp chiếm O(n log n). Ở `n = 10⁶` dự đoán thời gian so với `n = 10⁵` là ×10 hay ×12? Số mũ ước lượng của `bench` là bao nhiêu?
3. **Tìm phản ví dụ:** viết greedy "đổi tiền lấy tờ lớn nhất" cho mệnh giá `{1, 3, 4}` và một DP O(n·k). Với `amount` nào đầu tiên chúng cho kết quả khác nhau? (Gợi ý: bài nhỏ hơn 10.)
