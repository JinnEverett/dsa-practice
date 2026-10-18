# A11 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A11-sweep-line [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A11-sweep-line 01` · Đo: `node tools/bench.ts lessons/A11-sweep-line 04`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 2 hint. Trước mỗi bài: nói **sự kiện là gì**, **thứ tự xử lý khi trùng thời điểm** (khoảng đóng hay nửa mở?), cấu trúc dữ liệu giữ trạng thái, độ phức tạp.
Câu hỏi quy mô (ex04): với `3·10⁴` lần đặt, duyệt toàn bộ danh sách mỗi lần là bao nhiêu phép? Dự đoán rồi `bench`; vì sao mảng đã sắp + binary search nhanh dù `splice` là O(n)?

> Quy ước chung: khoảng là **nửa mở** `[start, end)` — kết thúc lúc `t` và bắt đầu lúc `t` **không** chồng nhau (trừ khi đề nói khác).

---

## 🟢 Cơ bản

### ex01 · Số khoảng chồng nhiều nhất
```java
int maxConcurrent(int[][] intervals)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ start < end ≤ 10⁹`. Trả về số khoảng đang cùng diễn ra nhiều nhất tại một thời điểm.
- Ví dụ: `[[0,30],[5,10],[15,20]]` → `2` · `[[7,10],[2,4]]` → `1` · `[[1,5],[5,10]]` → `1` · `[]` → `0`.
- Mục tiêu: O(n log n), không dùng mảng đếm theo tọa độ (10⁹ ô). (Gần với `minMeetingRooms` ở I04 — lần này bằng sweep, không heap.)

### ex02 · Đường chân trời (skyline)
Mỗi tòa nhà `[left, right, height]` (hình chữ nhật đáy trên trục x, nửa mở `[left, right)`). Trả về các **điểm then chốt** `[x, h]` của đường viền phía trên: điểm trái của mỗi đoạn ngang, sắp tăng theo `x`; điểm cuối cùng có `h = 0`; **không** có hai điểm liên tiếp cùng chiều cao.
```java
List<List<Integer>> getSkyline(int[][] buildings)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ left < right ≤ 2·10⁹` (vừa `int`), `1 ≤ height ≤ 10⁹`. Các tòa **không** nhất thiết sắp theo `left`.
- Ví dụ: `[[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]` → `[[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]` · `[[0,2,3],[2,5,3]]` → `[[0,3],[5,0]]`. (LeetCode 218)
- Gợi ý: max-heap theo chiều cao + **lazy deletion** (pop đỉnh nếu `right ≤ x`).

### ex03 · Thời gian rảnh chung của nhân viên
`schedule[i]` là danh sách khoảng bận của nhân viên `i` (đã sắp, rời nhau, nửa mở). Trả về các khoảng **hữu hạn** mà **mọi** nhân viên đều rảnh (không tính trước khoảng bận đầu tiên và sau khoảng bận cuối cùng), sắp tăng; khe độ dài `0` (hai khoảng liền kề) **không** tính.
```java
int[][] employeeFreeTime(int[][][] schedule)
```
- Ràng buộc: tổng số khoảng `N ≤ 10⁵`, `0 ≤ start < end ≤ 10⁹`.
- Ví dụ: `[[[1,2],[5,6]],[[1,3]],[[4,10]]]` → `[[3,4]]` · `[[[1,3]],[[3,5]]]` → `[]`. (LeetCode 759)
- Lưu ý: đầu vào là mảng **3 chiều** `int[][][]`.

### ex04 · Lịch đặt phòng (không chồng)
```java
class MyCalendar {
  MyCalendar()
  boolean book(int start, int end)     // nhận [start, end) nếu không chồng khoảng nào đã nhận; trả về true/false
}
```
- Ràng buộc: tối đa `3·10⁴` lần `book`, `0 ≤ start < end ≤ 10⁹`.
- Ví dụ: `book(10,20)=true, book(15,25)=false, book(20,30)=true`. (LeetCode 729)
- Mục tiêu: O(log n) tìm vị trí (mảng đã sắp + binary search). Duyệt hết mỗi lần trượt Perf.

### ex05 · Lịch đặt phòng (cho phép chồng đôi)
```java
class MyCalendarTwo {
  MyCalendarTwo()
  boolean book(int start, int end)     // nhận nếu KHÔNG tạo ra điểm nào bị đặt từ 3 lần trở lên
}
```
- Ràng buộc: tối đa `3000` lần `book`, `0 ≤ start < end ≤ 10⁹`. (Bài này **không đo Perf**: O(k) mỗi lần là đủ.)
- Ví dụ: `book(10,20)=true, book(50,60)=true, book(10,40)=true, book(5,15)=false, book(5,10)=true, book(25,55)=true`. (LeetCode 731)
- Tìm hiểu thêm: để `book` O(log C) với số lần gọi lớn, xem segment tree động ở A08 ex08.

### ex06 · Diện tích hợp các hình chữ nhật
`rectangles[i] = [x1, y1, x2, y2]` (góc dưới-trái, góc trên-phải). Tổng diện tích **hợp** (phần chồng nhau chỉ tính một lần), mod `10⁹ + 7`.
```java
int rectangleArea(int[][] rectangles)
```
- Ràng buộc: `1 ≤ n ≤ 200`, `0 ≤ x1 < x2 ≤ 10⁹`, `0 ≤ y1 < y2 ≤ 10⁹`.
- Ví dụ: `[[0,0,2,2],[1,0,2,3],[1,0,3,1]]` → `6` · `[[0,0,1000000000,1000000000]]` → `49`. (LeetCode 850)
- Bẫy: diện tích cỡ `10¹⁸` — TS nhân thẳng sẽ mất chính xác (> 2⁵³); Java `long` đủ nếu mod trước khi nhân.

---

## 🔴 Thực tế

### ex07 · Khách sạn đủ phòng không?
> "Khách sạn có `rooms` phòng. Mỗi đơn đặt `[checkIn, checkOut, roomsNeeded]` giữ `roomsNeeded` phòng trong các đêm `[checkIn, checkOut)`; khách trả phòng buổi sáng nên phòng dùng lại được ngay trong ngày `checkOut`. Có nhận được **tất cả** đơn không?"

```java
boolean canAccommodate(int[][] bookings, int rooms)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `1 ≤ checkIn < checkOut ≤ 10⁹`, `1 ≤ roomsNeeded ≤ 10⁴`, `0 ≤ rooms ≤ 10⁹`. Tổng nhu cầu có thể tới `10⁹` — Java nên dùng `long` cho an toàn.
- Ví dụ: `[[1,5,2],[2,7,3]], 4` → `false` · `[[1,5,2],[2,7,3]], 5` → `true` · `[[1,5,3],[5,8,3]], 3` → `true`.
- Mục tiêu: O(n log n); tọa độ ngày tới `10⁹` nên không dùng mảng theo ngày.

### ex08 · Khung giờ họp chung sớm nhất
> "Hai người nộp các khung giờ rảnh (mỗi người: các khoảng `[start, end]` rời nhau nhưng **chưa sắp xếp**). Tìm khung họp dài đúng `duration` bắt đầu **sớm nhất** có thể nằm trọn trong một khung rảnh của cả hai. Trả về `[start, start + duration]`, hoặc `[]` nếu không có."

```java
int[] minAvailableDuration(int[][] slots1, int[][] slots2, int duration)
```
- Ràng buộc: mỗi danh sách `0 ≤ n ≤ 5·10⁴`, `0 ≤ start < end ≤ 10⁹`, `1 ≤ duration ≤ 10⁶`.
- Ví dụ: `[[10,50],[60,120],[140,210]], [[0,15],[60,70]], 8` → `[60,68]` · `..., 12` → `[]` · `[[5,6]], [[6,7]], 1` → `[]`. (LeetCode 1229)
- Mục tiêu: O(n log n) (sort) + two pointers.
