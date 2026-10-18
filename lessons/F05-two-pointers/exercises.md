# F05 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F05-two-pointers [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F05-two-pointers 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint.

---

## 🟢 Cơ bản

### ex01 · Xóa trùng trong mảng đã sort (tại chỗ)
Xóa trùng **tại chỗ** sao cho mỗi giá trị còn 1 lần, giữ thứ tự. Trả về `k` = số phần tử còn lại; `nums[0..k)` phải là kết quả (phần sau `k` tùy ý).
```java
int removeDuplicates(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `nums` không giảm.
- Ví dụ: `[1,1,2]` → `2`, `nums = [1,2,_]` · `[0,0,1,1,1,2,2,3,3,4]` → `5`, `nums = [0,1,2,3,4,…]`.
- Bộ chấm kiểm tra `nums[0..k)`. Mục tiêu: O(n), O(1) bộ nhớ. (LeetCode 26)

### ex02 · Dồn số 0 về cuối
Chuyển mọi số 0 về cuối **tại chỗ**, giữ nguyên thứ tự các số khác 0.
```java
void moveZeroes(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[0,1,0,3,12]` → `[1,3,12,0,0]` · `[0]` → `[0]`. (LeetCode 283)

### ex03 · Two Sum trên mảng đã sort
Trả về `[i, j]` (0-indexed, `i < j`) với `nums[i] + nums[j] == target`. Có ít nhất một cặp; nhiều cặp thì trả cặp nào cũng được.
```java
int[] twoSumSorted(int[] nums, int target)
```
- Ràng buộc: `2 ≤ n ≤ 10⁵`, `nums` không giảm, `|giá trị| ≤ 10⁹`.
- Ví dụ: `[2,7,11,15], 9` → `[0,1]` · `[-1,0], -1` → `[0,1]`.
- Mục tiêu: O(n) time, **O(1)** bộ nhớ (không dùng hash map). (LeetCode 167)

### ex04 · Merge hai mảng đã sort (tại chỗ)
`nums1` dài `m + n`, `m` phần tử đầu là dữ liệu, `n` ô cuối là 0 (chỗ trống). `nums2` có `n` phần tử. Merge `nums2` vào `nums1` để `nums1` sort tăng dần.
```java
void mergeSorted(int[] nums1, int m, int[] nums2, int n)
```
- Ràng buộc: `0 ≤ m, n ≤ 10⁵`.
- Ví dụ: `[1,2,3,0,0,0], 3, [2,5,6], 3` → `[1,2,2,3,5,6]` · `[0], 0, [1], 1` → `[1]`.
- Mục tiêu: O(m + n), O(1) bộ nhớ phụ. (LeetCode 88)

---

## 🟡 Kết hợp

### ex05 · Bình phương mảng đã sort
Trả về bình phương các phần tử, sắp tăng dần.
```java
int[] sortedSquares(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `nums` không giảm, `|nums[i]| ≤ 10⁴`.
- Ví dụ: `[-4,-1,0,3,10]` → `[0,1,9,16,100]` · `[-7,-3,2,3,11]` → `[4,9,9,49,121]`.
- Mục tiêu: **O(n)** (không sort lại). (LeetCode 977)

### ex06 · Bể chứa nhiều nước nhất
`height[i]` là chiều cao cột thứ i. Chọn 2 cột để cùng trục hoành tạo bể chứa nhiều nước nhất; trả về lượng nước = `min(h[i], h[j]) × (j − i)`.
```java
int maxArea(int[] height)
```
- Ràng buộc: `2 ≤ n ≤ 10⁵`, `0 ≤ height[i] ≤ 10⁴`.
- Ví dụ: `[1,8,6,2,5,4,8,3,7]` → `49` · `[1,1]` → `1`.
- Gợi ý suy nghĩ: di chuyển con trỏ nào thì **không thể** bỏ lỡ đáp án tốt hơn? (LeetCode 11)

### ex07 · 3Sum
Trả về mọi bộ ba **giá trị** `[a, b, c]` khác nhau (không trùng bộ) với `a + b + c = 0`. Mỗi bộ ba sắp tăng dần; thứ tự các bộ tùy ý.
```java
List<List<Integer>> threeSum(int[] nums)
```
- Ràng buộc: `3 ≤ n ≤ 3000`, `|nums[i]| ≤ 10⁵`.
- Ví dụ: `[-1,0,1,2,-1,-4]` → `[[-1,-1,2],[-1,0,1]]` · `[0,1,1]` → `[]` · `[0,0,0,0]` → `[[0,0,0]]`.
- Mục tiêu: O(n²). O(n³) sẽ trượt Perf. (LeetCode 15)

### ex08 · Sắp xếp 3 màu
Mảng chỉ gồm `0`, `1`, `2`. Sắp tăng dần **tại chỗ**, **một lượt duyệt**, không dùng hàm sort, không đếm rồi ghi lại (thử thách Dutch flag).
```java
void sortColors(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[2,0,2,1,1,0]` → `[0,0,1,1,2,2]` · `[2,0,1]` → `[0,1,2]`. (LeetCode 75)
- Bộ chấm chỉ kiểm tra kết quả; tự giác làm đúng ràng buộc "một lượt".

---

## 🔴 Thực tế

### ex09 · Xếp kiện hàng lên xe máy
> "Mỗi chuyến xe máy chở **tối đa 2 kiện**, tổng khối lượng ≤ `limit`. Mỗi kiện nặng không quá `limit`. Cần ít nhất bao nhiêu chuyến?"

```java
int minTrips(int[] weights, int limit)
```
- Ràng buộc: `1 ≤ n ≤ 5·10⁴`, `1 ≤ weights[i] ≤ limit ≤ 3·10⁴`. Được phép sắp xếp lại `weights`.
- Ví dụ: `[1,2], 3` → `1` · `[3,2,2,1], 3` → `3` · `[3,5,3,4], 5` → `4`. (LeetCode 881)

### ex10 · So sánh ô nhập có phím xóa
> "Hai ô nhập ghi lại chuỗi phím người dùng gõ, `#` là phím Backspace (xóa ký tự trước đó nếu có). Hai ô có cho ra cùng nội dung cuối không?"

```java
boolean backspaceCompare(String s, String t)
```
- Ràng buộc: `1 ≤ |s|, |t| ≤ 2·10⁵`, chữ thường và `#`.
- Ví dụ: `"ab#c","ad#c"` → `true` (cả hai thành "ac") · `"ab##","c#d#"` → `true` · `"a#c","b"` → `false`.
- Mục tiêu: O(n + m) time; thử thách **O(1) bộ nhớ** (duyệt từ cuối, đếm số `#` cần bỏ qua). (LeetCode 844)
