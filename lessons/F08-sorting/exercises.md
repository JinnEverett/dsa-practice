# F08 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F08-sorting [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F08-sorting 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint. ex01, ex02, ex07 **không** dùng hàm sort của thư viện (tự giác — bộ chấm không phát hiện được).

---

## 🟢 Cơ bản

### ex01 · Tự cài merge sort
Trả về mảng mới đã sắp tăng dần. Không dùng hàm sort có sẵn.
```java
int[] mergeSort(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`.
- Ví dụ: `[5,2,3,1]` → `[1,2,3,5]` · `[5,1,1,2,0,0]` → `[0,0,1,1,2,5]`.
- Mục tiêu: O(n log n). Insertion/bubble sort sẽ trượt Perf.

### ex02 · Tự cài quick sort
Sắp tăng dần **tại chỗ**. Không dùng hàm sort có sẵn.
```java
void quickSort(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`. Bộ test có cả mảng **đã sort sẵn** và mảng **toàn phần tử giống nhau**.
- Ví dụ: `[3,7,8,1,4]` → `[1,3,4,7,8]`.
- Mục tiêu: O(n log n) kỳ vọng. Pivot cố định ở đầu/cuối sẽ trượt (O(n²) + tràn stack). Gợi ý: pivot ngẫu nhiên + chia 3 phần.

### ex03 · Sắp xếp tuổi khách hàng
```java
int[] sortAges(int[] ages)
```
- Ràng buộc: `0 ≤ n ≤ 10⁶`, `0 ≤ ages[i] ≤ 150`.
- Ví dụ: `[30, 5, 30, 0, 150]` → `[0,5,30,30,150]`.
- Mục tiêu: **O(n + 151)** bằng counting sort.

### ex04 · Sắp theo tần suất
Sắp theo **tần suất tăng dần**; cùng tần suất thì **giá trị giảm dần**.
```java
int[] frequencySort(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 100`.
- Ví dụ: `[1,1,2,2,2,3]` → `[3,1,1,2,2,2]` · `[2,3,1,3,2]` → `[1,3,3,2,2]` · `[-1,1,-6,4,5,-6,1,4,1]` → `[5,-1,4,4,-6,-6,1,1,1]`. (LeetCode 1636)

---

## 🟡 Kết hợp

### ex05 · Số lớn nhất ghép được
Ghép các số không âm thành **số lớn nhất**, trả về dạng chuỗi.
```java
String largestNumber(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁴`, `0 ≤ nums[i] ≤ 10⁹`.
- Ví dụ: `[10,2]` → `"210"` · `[3,30,34,5,9]` → `"9534330"` · `[0,0]` → `"0"` (không phải `"00"`). (LeetCode 179)

### ex06 · Gộp khoảng
Gộp mọi khoảng chồng nhau (chạm nhau cũng tính: `[1,4]` và `[4,5]` → `[1,5]`). Kết quả sắp theo đầu khoảng.
```java
int[][] mergeIntervals(int[][] intervals)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ start ≤ end ≤ 10⁹`, input chưa sort.
- Ví dụ: `[[1,3],[2,6],[8,10],[15,18]]` → `[[1,6],[8,10],[15,18]]` · `[[1,4],[4,5]]` → `[[1,5]]` · `[[1,4],[2,3]]` → `[[1,4]]`. (LeetCode 56)

### ex07 · Đếm số nghịch thế
Đếm số cặp `(i, j)` với `i < j` và `nums[i] > nums[j]` (đo "độ lộn xộn" của mảng).
```java
long countInversions(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹` (kết quả tới ~5·10⁹ → `long`).
- Ví dụ: `[2,4,1,3,5]` → `3` ((2,1), (4,1), (4,3)) · `[5,4,3,2,1]` → `10` · `[1,1,1]` → `0`.
- Mục tiêu: O(n log n) bằng merge sort cải tiến.

### ex08 · Bảng điểm (sort ổn định)
Trả về tên học sinh theo **điểm giảm dần**; cùng điểm thì giữ **thứ tự trong input**.
```java
String[] rankStudents(String[] names, int[] scores)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ scores[i] ≤ 100`, tên có thể trùng.
- Ví dụ: `["An","Bình","Chi","Dũng"], [8,9,8,10]` → `["Dũng","Bình","An","Chi"]`.

---

## 🔴 Thực tế

### ex09 · Xếp hạng sản phẩm
> "Trang danh mục sắp sản phẩm theo: điểm đánh giá **giảm dần** → số lượt đánh giá **giảm dần** → giá **tăng dần** → id **tăng dần**."

```java
int[] rankProducts(int[][] products)
```
- `products[i] = [id, rating10, reviews, price]` (`rating10` = điểm × 10, vd. 4.5★ → 45). Trả về danh sách `id` theo thứ hạng.
- Ràng buộc: `0 ≤ n ≤ 10⁵`, id khác nhau, `0 ≤ mọi giá trị ≤ 10⁹`.
- Ví dụ: `[[1,45,100,200],[2,45,100,150],[3,50,3,999],[4,45,200,500]]` → `[3,4,2,1]`.
- Java: comparator với `Integer.compare`, đừng trừ.

### ex10 · Sắp xếp log hệ thống
> "Mỗi log có dạng `"<id> <nội dung>"`. **Log chữ** (nội dung chỉ gồm chữ thường và khoảng trắng) đứng trước **log số** (nội dung chỉ gồm chữ số và khoảng trắng). Log chữ sắp theo nội dung, trùng nội dung thì theo id (so sánh chuỗi). Log số giữ nguyên thứ tự ban đầu."

```java
String[] reorderLogs(String[] logs)
```
- Ràng buộc: `1 ≤ n ≤ 10⁴`, id gồm chữ thường và số, mỗi log ≤ 100 ký tự.
- Ví dụ: `["dig1 8 1 5 1","let1 art can","dig2 3 6","let2 own kit dig","let3 art zero"]` → `["let1 art can","let3 art zero","let2 own kit dig","dig1 8 1 5 1","dig2 3 6"]`. (LeetCode 937)
- So sánh chuỗi theo mã ký tự (không theo locale).
