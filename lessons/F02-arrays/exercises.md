# F02 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F02-arrays [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F02-arrays 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint.

---

## 🟢 Cơ bản

### ex01 · Xoay mảng sang phải k bước (tại chỗ)
```java
void rotateRight(int[] nums, int k)
```
- Sửa trực tiếp `nums`. Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ k ≤ 10⁹`.
- Ví dụ: `[1,2,3,4,5,6,7], k = 3` → `[5,6,7,1,2,3,4]` · `[-1,-100,3,99], k = 2` → `[3,99,-1,-100]` · `[], k = 5` → `[]`.
- Mục tiêu: O(n) time, **O(1)** bộ nhớ phụ. (LeetCode 189)

### ex02 · Cộng một
Mảng `digits` biểu diễn một số nguyên không âm (chữ số hàng cao nhất ở đầu). Trả về mảng chữ số của số đó cộng 1.
```java
int[] plusOne(int[] digits)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, không có số 0 ở đầu (trừ chính số 0).
- Ví dụ: `[1,2,3]` → `[1,2,4]` · `[9,9]` → `[1,0,0]` · `[0]` → `[1]`.
- Bẫy: chuyển sang số rồi cộng sẽ sai/tràn khi có hàng trăm chữ số. (LeetCode 66)

### ex03 · Tam giác Pascal
Trả về `numRows` hàng đầu của tam giác Pascal.
```java
List<List<Integer>> pascal(int numRows)
```
- Ràng buộc: `0 ≤ numRows ≤ 30`.
- Ví dụ: `pascal(5)` → `[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]` · `pascal(0)` → `[]`. (LeetCode 118)

### ex04 · Chuyển vị ma trận
Trả về ma trận chuyển vị (hàng thành cột) của ma trận `r × c` (có thể không vuông).
```java
int[][] transpose(int[][] matrix)
```
- Ràng buộc: `1 ≤ r, c`, `r · c ≤ 10⁶`.
- Ví dụ: `[[1,2,3],[4,5,6]]` → `[[1,4],[2,5],[3,6]]`. (LeetCode 867)

---

## 🟡 Kết hợp

### ex05 · Duyệt xoắn ốc
Trả về các phần tử theo thứ tự xoắn ốc chiều kim đồng hồ, bắt đầu từ góc trên trái.
```java
List<Integer> spiralOrder(int[][] matrix)
```
- Ràng buộc: `1 ≤ r, c`, `r · c ≤ 10⁶`.
- Ví dụ: `[[1,2,3],[4,5,6],[7,8,9]]` → `[1,2,3,6,9,8,7,4,5]` · `[[1,2,3,4],[5,6,7,8],[9,10,11,12]]` → `[1,2,3,4,8,12,11,10,9,5,6,7]` · `[[1],[2],[3]]` → `[1,2,3]`. (LeetCode 54)

### ex06 · Xoay ảnh 90° (tại chỗ)
Xoay ma trận vuông `n × n` 90° theo chiều kim đồng hồ, **sửa trực tiếp** `matrix`.
```java
void rotateImage(int[][] matrix)
```
- Ràng buộc: `1 ≤ n ≤ 1000`.
- Ví dụ: `[[1,2,3],[4,5,6],[7,8,9]]` → `[[7,4,1],[8,5,2],[9,6,3]]`.
- Mục tiêu: O(1) bộ nhớ phụ (không tạo ma trận mới). (LeetCode 48)

### ex07 · Đặt 0 cho hàng và cột
Nếu một ô **ban đầu** bằng 0 thì đặt cả hàng và cột của nó thành 0. Sửa trực tiếp.
```java
void setZeroes(int[][] matrix)
```
- Ràng buộc: `1 ≤ r, c ≤ 1000`.
- Ví dụ: `[[1,1,1],[1,0,1],[1,1,1]]` → `[[1,0,1],[0,0,0],[1,0,1]]` · `[[0,1,2,0],[3,4,5,2],[1,3,1,5]]` → `[[0,0,0,0],[0,4,5,0],[0,3,1,0]]`.
- Mục tiêu: O(r·c) time. O(r + c) bộ nhớ là đạt; O(1) là best practice. (LeetCode 73)

### ex08 · Tích các phần tử còn lại
`out[i]` = tích mọi phần tử **trừ** `nums[i]`. **Không dùng phép chia.**
```java
int[] productExceptSelf(int[] nums)
```
- Ràng buộc: `2 ≤ n ≤ 10⁵`, `-30 ≤ nums[i] ≤ 30`; đề bảo đảm mọi tích prefix/suffix vừa kiểu `int` (input có nhiều 1 và -1).
- Ví dụ: `[1,2,3,4]` → `[24,12,8,6]` · `[-1,1,0,-3,3]` → `[0,0,9,0,0]`.
- Mục tiêu: O(n) time, O(1) bộ nhớ phụ ngoài mảng kết quả. (LeetCode 238)

---

## 🔴 Thực tế

### ex09 · Mã đơn bị thất lạc
> "Kho phát `n` mã đơn đánh số từ 1 đến n. Sau khi đối soát, mảng `scanned` (độ dài n) chứa các mã quét được — có mã quét trùng nhiều lần nên một số mã bị thiếu. Liệt kê các mã bị thiếu, tăng dần."

```java
List<Integer> missingOrders(int[] scanned)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ scanned[i] ≤ n`. Được phép sửa `scanned`.
- Ví dụ: `[4,3,2,7,8,2,3,1]` → `[5,6]` · `[1,1]` → `[2]`.
- Mục tiêu: O(n) time, **O(1)** bộ nhớ phụ ngoài mảng kết quả. (LeetCode 448)

### ex10 · Heatmap doanh thu theo giờ
> "Dashboard cần ma trận 7 × 24: hàng là thứ trong tuần (0 = Chủ nhật … 6 = Thứ bảy), cột là giờ (0–23), ô là tổng doanh thu. Input là danh sách sự kiện `[day, hour, amount]`."

```java
long[][] revenueHeatmap(int[][] events)
```
- Ràng buộc: `0 ≤ số sự kiện ≤ 10⁶`, `amount` nguyên trong `[0, 10⁶]` → một ô có thể tới 10¹² (Java: vì sao `long`?).
- Luôn trả về đủ 7 hàng × 24 cột (ô không có doanh thu là `0`).
- Ví dụ: `[[1, 9, 100], [1, 9, 50], [6, 23, 7]]` → hàng 1 cột 9 là `150`, hàng 6 cột 23 là `7`, còn lại `0`.
- Bẫy: `new Array(7).fill(new Array(24).fill(0))` (TS) / `[[0] * 24] * 7` (Python).
