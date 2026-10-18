# F07 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F07-prefix-sum [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F07-prefix-sum 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint.

> **Bài dạng class (ex02, ex05):** bộ chấm gọi theo kiểu LeetCode: `["NumArray","sumRange","sumRange"]`, `[[[1,2,3]],[0,1],[1,2]]` nghĩa là `obj = new NumArray([1,2,3])`, rồi `obj.sumRange(0,1)`, `obj.sumRange(1,2)`.

---

## 🟢 Cơ bản

### ex01 · Tổng cộng dồn
`out[i] = nums[0] + … + nums[i]`.
```java
long[] runningSum(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`.
- Ví dụ: `[1,2,3,4]` → `[1,3,6,10]` · `[3,1,2,10,1]` → `[3,4,6,16,17]`. (LeetCode 1480)

### ex02 · Truy vấn tổng đoạn (class)
```java
class NumArray {
  NumArray(int[] nums)
  long sumRange(int left, int right)   // tổng nums[left..right], 0 ≤ left ≤ right < n
}
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁵`, tối đa `10⁵` lần gọi `sumRange`.
- Ví dụ: `NumArray([-2,0,3,-5,2,-1])`: `sumRange(0,2)` → `1`, `sumRange(2,5)` → `-1`, `sumRange(0,5)` → `-3`.
- Mục tiêu: O(n) khởi tạo, **O(1)** mỗi truy vấn. (LeetCode 303)

### ex03 · Chỉ số cân bằng
Chỉ số `i` **nhỏ nhất** mà tổng bên trái (không gồm i) bằng tổng bên phải (không gồm i). Không có → `-1`.
```java
int pivotIndex(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 1000`.
- Ví dụ: `[1,7,3,6,5,6]` → `3` · `[1,2,3]` → `-1` · `[2,1,-1]` → `0` (bên trái rỗng = 0). (LeetCode 724)

---

## 🟡 Kết hợp

### ex04 · Đếm đoạn con có tổng bằng k
```java
int subarraySum(int[] nums, int k)
```
- Ràng buộc: `1 ≤ n ≤ 2·10⁴`, `|nums[i]| ≤ 1000` (**có số âm**), `|k| ≤ 10⁷`.
- Ví dụ: `[1,1,1], 2` → `2` · `[1,2,3], 3` → `2` · `[1,-1,0], 0` → `3`.
- Mục tiêu: O(n). (LeetCode 560)

### ex05 · Tổng hình chữ nhật (class)
```java
class NumMatrix {
  NumMatrix(int[][] matrix)
  int sumRegion(int row1, int col1, int row2, int col2)   // tổng ô (r, c) với row1 ≤ r ≤ row2, col1 ≤ c ≤ col2
}
```
- Ràng buộc: `1 ≤ r, c ≤ 200`, `|matrix[i][j]| ≤ 10⁴`, tối đa `10⁴` truy vấn.
- Ví dụ: ma trận `[[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]`: `sumRegion(2,1,4,3)` → `8`, `sumRegion(1,1,2,2)` → `11`, `sumRegion(1,2,2,4)` → `12`.
- Mục tiêu: O(1) mỗi truy vấn. (LeetCode 304)

### ex06 · Đặt chỗ chuyến bay
Có `n` chuyến bay đánh số 1..n. Mỗi booking `[first, last, seats]` đặt `seats` ghế cho **mọi** chuyến từ `first` đến `last`. Trả về mảng tổng số ghế đã đặt của từng chuyến.
```java
int[] flightBookings(int[][] bookings, int n)
```
- Ràng buộc: `1 ≤ n ≤ 2·10⁴`, `0 ≤ số booking ≤ 2·10⁴`, `1 ≤ seats ≤ 10⁴`.
- Ví dụ: `[[1,2,10],[2,3,20],[2,5,25]], 5` → `[10,55,45,25,25]`.
- Mục tiêu: O(n + số booking). (LeetCode 1109)

### ex07 · Đoạn con dài nhất có số 0 bằng số 1
```java
int findMaxLength(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `nums[i] ∈ {0, 1}`.
- Ví dụ: `[0,1]` → `2` · `[0,1,0]` → `2` · `[0,1,1,1,1,1,0,0,0]` → `6`.
- Gợi ý suy nghĩ: đổi 0 thành −1 thì điều kiện trở thành gì? (LeetCode 525)

### ex08 · Đếm đoạn con có tổng chia hết cho k
```java
int subarraysDivByK(int[] nums, int k)
```
- Ràng buộc: `1 ≤ n ≤ 3·10⁴`, `|nums[i]| ≤ 10⁴` (có số âm), `2 ≤ k ≤ 10⁴`.
- Ví dụ: `[4,5,0,-2,-3,1], 5` → `7` · `[5], 9` → `0`.
- Bẫy: số dư âm trong TS/Java. (LeetCode 974)

---

## 🔴 Thực tế

### ex09 · Xe đưa đón nhân viên
> "Xe công ty có `capacity` chỗ, chạy một chiều qua các mốc km 0, 1, 2, …. Mỗi chuyến `[num, from, to]`: `num` người lên ở km `from`, xuống ở km `to` (đúng lúc tới `to` là xuống, chỗ trống ngay cho người lên ở `to`). Có chở hết được không?"

```java
boolean carPooling(int[][] trips, int capacity)
```
- Ràng buộc: `1 ≤ số chuyến ≤ 10⁵`, `1 ≤ num ≤ 100`, `0 ≤ from < to ≤ 10³`, `1 ≤ capacity ≤ 10⁵`.
- Ví dụ: `[[2,1,5],[3,3,7]], 4` → `false` · `[[2,1,5],[3,3,7]], 5` → `true` · `[[2,1,5],[3,5,7]], 3` → `true`. (LeetCode 1094)

### ex10 · Số user online cao nhất
> "Mỗi phiên đăng nhập `[start, end)` tính bằng giây trong ngày (`0 ≤ start < end ≤ T`). Tìm số phiên đồng thời lớn nhất tại một thời điểm."

```java
int maxOnline(int[][] sessions, int T)
```
- Ràng buộc: `0 ≤ số phiên ≤ 10⁵`, `1 ≤ T ≤ 10⁶`. Phiên kết thúc lúc `t` và phiên bắt đầu lúc `t` **không** chồng nhau.
- Ví dụ: `[[0,10],[5,15],[10,20]], 20` → `2` · `[], 5` → `0` · `[[1,3],[1,3],[2,4]], 4` → `3`.
- Mục tiêu: O(số phiên + T). (Khi T lớn tới 10⁹ không dựng mảng được → sweep line, A11.)
