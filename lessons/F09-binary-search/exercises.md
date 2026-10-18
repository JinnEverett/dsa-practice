# F09 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F09-binary-search [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F09-binary-search 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint. Không dùng `bisect` / `Arrays.binarySearch` (tự viết template).

> ex01–ex08 chỉ gọi hàm **một lần** nên bộ chấm không phân biệt được O(n) với O(log n) (quét 10⁵ phần tử vẫn chỉ mất ~0.1 ms) — tự giác viết binary search; coach sẽ kiểm tra khi review. ex09, ex10 có hàng trăm nghìn truy vấn nên O(n) mỗi truy vấn sẽ trượt Perf.

---

## 🟢 Cơ bản

### ex01 · Binary search cơ bản
Mảng tăng dần, phần tử **khác nhau**. Trả về chỉ số của `target`, không có → `-1`.
```java
int search(int[] nums, int target)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `|giá trị| ≤ 10⁹`.
- Ví dụ: `[-1,0,3,5,9,12], 9` → `4` · `[-1,0,3,5,9,12], 2` → `-1`. (LeetCode 704)

### ex02 · Vị trí chèn
Mảng tăng dần, khác nhau. Trả về chỉ số của `target` nếu có, không thì vị trí sẽ chèn vào để giữ thứ tự.
```java
int searchInsert(int[] nums, int target)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `[1,3,5,6], 5` → `2` · `[1,3,5,6], 2` → `1` · `[1,3,5,6], 7` → `4` · `[], 3` → `0`. (LeetCode 35)

### ex03 · Vị trí đầu và cuối
Mảng không giảm (có thể trùng). Trả về `[đầu, cuối]` của `target`, không có → `[-1,-1]`.
```java
int[] searchRange(int[] nums, int target)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `[5,7,7,8,8,10], 8` → `[3,4]` · `[5,7,7,8,8,10], 6` → `[-1,-1]` · `[], 0` → `[-1,-1]`.
- Mục tiêu: O(log n) — tìm 1 vị trí rồi loang hai bên là O(n) khi toàn phần tử trùng. (LeetCode 34)

### ex04 · Căn bậc hai nguyên
Trả về `floor(√x)`. Không dùng `Math.sqrt`, `**`, `pow`.
```java
int mySqrt(int x)
```
- Ràng buộc: `0 ≤ x ≤ 2³¹ − 1`.
- Ví dụ: `4` → `2` · `8` → `2` · `0` → `0` · `2147483647` → `46340`.
- Bẫy Java: `mid * mid` tràn `int`. (LeetCode 69)

---

## 🟡 Kết hợp

### ex05 · Tìm trong mảng xoay
Mảng tăng dần, khác nhau, đã bị xoay tại một điểm không biết trước (vd. `[0,1,2,4,5,6,7]` → `[4,5,6,7,0,1,2]`). Trả về chỉ số của `target` hoặc `-1`.
```java
int searchRotated(int[] nums, int target)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[4,5,6,7,0,1,2], 0` → `4` · `[4,5,6,7,0,1,2], 3` → `-1` · `[1], 0` → `-1`.
- Mục tiêu: O(log n). (LeetCode 33)

### ex06 · Phần tử nhỏ nhất trong mảng xoay
```java
int findMin(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, khác nhau.
- Ví dụ: `[3,4,5,1,2]` → `1` · `[4,5,6,7,0,1,2]` → `0` · `[11,13,15,17]` → `11`. (LeetCode 153)

### ex07 · Tìm một đỉnh
`nums[i]` là đỉnh nếu lớn hơn hẳn hai bên (coi `nums[-1] = nums[n] = −∞`). Hai phần tử kề nhau luôn khác nhau. Trả về chỉ số của **một** đỉnh bất kỳ.
```java
int findPeakElement(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[1,2,3,1]` → `2` · `[1,2,1,3,5,6,4]` → `1` hoặc `5`.
- Mục tiêu: O(log n). Gợi ý: nếu `nums[mid] < nums[mid + 1]` thì phía nào chắc chắn có đỉnh? (LeetCode 162)

### ex08 · Tìm trong ma trận
Ma trận `r × c`: mỗi hàng tăng dần, phần tử đầu hàng > phần tử cuối hàng trước. Có `target` không?
```java
boolean searchMatrix(int[][] matrix, int target)
```
- Ràng buộc: `1 ≤ r, c`, `r · c ≤ 10⁶`.
- Ví dụ: `[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3` → `true` · cùng ma trận, `13` → `false`.
- Gợi ý: coi ma trận là mảng 1D độ dài `r·c`. (LeetCode 74)

---

## 🔴 Thực tế

### ex09 · Bậc giá cước
> "Bảng giá ship theo khối lượng: `thresholds` tăng dần, `thresholds[0] = 0`. Kiện nặng `w` gram thuộc bậc `i` lớn nhất có `thresholds[i] ≤ w`, giá là `prices[i]`. Tính giá cho mỗi kiện."

```java
int[] shippingPrices(int[] thresholds, int[] prices, int[] weights)
```
- Ràng buộc: `1 ≤ số bậc ≤ 10⁵`, `0 ≤ số kiện ≤ 10⁵`, `0 ≤ weights[i] ≤ 10⁹`, `thresholds` tăng **nghiêm ngặt**.
- Ví dụ: `thresholds = [0, 500, 1000, 5000]`, `prices = [15, 22, 30, 60]`, `weights = [0, 499, 500, 4999, 100000]` → `[15, 15, 22, 30, 60]`.
- Mục tiêu: O((n + q) log n). Quét tuyến tính mỗi kiện là O(n·q) → trượt Perf.

### ex10 · Đếm log trong khoảng thời gian
> "`times` là timestamp các dòng log (đã sắp tăng dần, có thể trùng). Mỗi truy vấn `[from, to]` hỏi có bao nhiêu log với `from ≤ t ≤ to`."

```java
int[] countInRange(int[] times, int[][] queries)
```
- Ràng buộc: `0 ≤ n, q ≤ 10⁵`, `0 ≤ giá trị ≤ 10⁹`, `from ≤ to`.
- Ví dụ: `times = [1, 3, 3, 5, 8]`, `queries = [[3,5],[0,0],[2,8],[9,10]]` → `[3, 0, 4, 0]`.
