# I03 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I03-bst [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I03-bst 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint. Mọi BST trong đề có giá trị **khác nhau**. Cây trong bộ test cao ≤ vài trăm (chèn theo thứ tự ngẫu nhiên).

---

## 🟢 Cơ bản

### ex01 · Tìm trong BST
Trả về cây con có gốc là node mang giá trị `val`, không có → cây rỗng.
```java
TreeNode searchBST(TreeNode root, int val)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[4,2,7,1,3], 2` → `[2,1,3]` · `[4,2,7,1,3], 5` → `[]`.
- Mục tiêu: O(h). (LeetCode 700)

### ex02 · Chèn vào BST
Chèn `val` (chưa có trong cây) vào **vị trí lá** theo đúng quy tắc tìm kiếm (không xoay, không cân bằng lại). Trả về gốc.
```java
TreeNode insertIntoBST(TreeNode root, int val)
```
- Ví dụ: `[4,2,7,1,3], 5` → `[4,2,7,1,3,5]` · `[], 5` → `[5]`. (LeetCode 701)

### ex03 · Kiểm tra BST hợp lệ
```java
boolean isValidBST(TreeNode root)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `-2³¹ ≤ val ≤ 2³¹ − 1`, giá trị **có thể trùng** trong bộ test (trùng → không hợp lệ).
- Ví dụ: `[2,1,3]` → `true` · `[5,1,4,null,null,3,6]` → `false` · `[5,1,6,null,null,4,7]` → `false` (4 nằm bên phải 5) · `[2147483647]` → `true`. (LeetCode 98)

### ex04 · Phần tử nhỏ thứ k
```java
int kthSmallest(TreeNode root, int k)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁵`.
- Ví dụ: `[3,1,4,null,2], 1` → `1` · `[5,3,6,2,4,null,null,1], 3` → `3`.
- Mục tiêu: O(h + k), dừng sớm. (LeetCode 230)

---

## 🟡 Kết hợp

### ex05 · Xóa node khỏi BST
Xóa node có giá trị `key` (nếu có), trả về gốc. Kết quả phải là BST hợp lệ chứa đúng các giá trị còn lại — có nhiều cây đúng, bộ chấm chấp nhận mọi cây hợp lệ **có chiều cao không tăng**.
```java
TreeNode deleteNode(TreeNode root, int key)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `[5,3,6,2,4,null,7], 3` → `[5,4,6,2,null,null,7]` (hoặc `[5,2,6,null,4,null,7]`) · `[5,3,6,2,4,null,7], 0` → không đổi · `[], 0` → `[]`. (LeetCode 450)

### ex06 · Mảng đã sort → BST cân bằng
Dựng BST **cân bằng chiều cao** (mọi node: chênh lệch chiều cao 2 cây con ≤ 1) từ mảng tăng dần. Nhiều đáp án hợp lệ.
```java
TreeNode sortedArrayToBST(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁴`, tăng nghiêm ngặt.
- Ví dụ: `[-10,-3,0,5,9]` → `[0,-3,9,-10,null,5]` (hoặc `[0,-10,5,null,-3,null,9]`). (LeetCode 108)

### ex07 · Successor
Giá trị nhỏ nhất **lớn hơn** `x` trong cây (`x` có thể không có trong cây); không có → `-1`. Không được dựng mảng in-order.
```java
int successor(TreeNode root, int x)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ val, x ≤ 10⁹`.
- Ví dụ: `[5,3,6,2,4,null,null,1], 1` → `2` · cùng cây, `4` → `5` · `6` → `-1` · `0` → `1`.
- Mục tiêu: O(h). (LeetCode 285 biến thể)

### ex08 · LCA trong BST
`p`, `q` có trong cây. Trả về giá trị LCA.
```java
int lcaBST(TreeNode root, int p, int q)
```
- Ví dụ: `[6,2,8,0,4,7,9,null,null,3,5], 2, 8` → `6` · `2, 4` → `2`.
- Mục tiêu: O(h), dùng tính chất BST (không cần tìm cả hai rồi so đường). (LeetCode 235)

---

## 🔴 Thực tế

### ex09 · Tổng doanh thu theo khoảng giá
> "Đơn hàng được index trong BST theo giá trị đơn (giá trị khác nhau). Báo cáo cần tổng giá trị các đơn trong khoảng `[low, high]`."

```java
long rangeSumBST(TreeNode root, int low, int high)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ val ≤ 10⁹`, `low ≤ high`.
- Ví dụ: `[10,5,15,3,7,null,18], 7, 15` → `32` · `[10,5,15,3,7,13,18,1,null,6], 6, 10` → `23`.
- Mục tiêu: chỉ đi vào nhánh có thể chứa giá trị trong khoảng. (LeetCode 938)

### ex10 · Iterator phân trang trên BST (class)
> "API trả dữ liệu đã sắp xếp theo kiểu cursor: mỗi lần `next()` trả phần tử kế tiếp. Không được nạp cả cây ra mảng (bộ nhớ chỉ O(h))."

```java
class BSTIterator {
  BSTIterator(TreeNode root)
  int next()          // phần tử nhỏ nhất chưa trả về; chỉ gọi khi hasNext()
  boolean hasNext()
}
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, tối đa `10⁵` lần gọi.
- Ví dụ: `[7,3,15,null,null,9,20]`: `next() → 3, next() → 7, hasNext() → true, next() → 9, next() → 15, next() → 20, hasNext() → false`.
- Mục tiêu: `next` O(1) amortized, bộ nhớ O(h). (LeetCode 173)
