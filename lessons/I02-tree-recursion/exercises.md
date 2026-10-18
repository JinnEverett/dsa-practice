# I02 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I02-tree-recursion [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I02-tree-recursion 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint. Nói ý tưởng (bottom-up hay top-down, trả gì cho cha) + Big-O trước khi code.

> Cây trong bộ test có chiều cao ≤ vài trăm → đệ quy an toàn. Với ex05, ex07, ex10 các giá trị trong cây **khác nhau**.

---

## 🟢 Cơ bản

### ex01 · Đường kính cây
Số **cạnh** trên đường dài nhất giữa hai node bất kỳ.
```java
int diameterOfBinaryTree(TreeNode root)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[1,2,3,4,5]` → `3` · `[1,2]` → `1` · `[1]` → `0`. (LeetCode 543)

### ex02 · Cây cân bằng
Cân bằng khi **mọi** node có chiều cao hai cây con lệch nhau không quá 1.
```java
boolean isBalanced(TreeNode root)
```
- Ví dụ: `[3,9,20,null,null,15,7]` → `true` · `[1,2,2,3,3,null,null,4,4]` → `false` · `[]` → `true`.
- Mục tiêu: O(n) — gọi `height()` riêng ở mỗi node là O(n²) với cây lệch. (LeetCode 110)

### ex03 · Có đường gốc → lá với tổng cho trước?
```java
boolean hasPathSum(TreeNode root, int targetSum)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `|val| ≤ 1000`.
- Ví dụ: `[5,4,8,11,null,13,4,7,2,null,null,null,1], 22` → `true` · `[1,2,3], 5` → `false` · `[], 0` → `false` · `[1,2], 1` → `false` (node 1 không phải lá). (LeetCode 112)

### ex04 · Liệt kê mọi đường gốc → lá có tổng cho trước
Mỗi đường là danh sách giá trị từ gốc đến lá. Thứ tự các đường tùy ý.
```java
List<List<Integer>> pathSumAll(TreeNode root, int targetSum)
```
- Ràng buộc: `0 ≤ n ≤ 5000`.
- Ví dụ: `[5,4,8,11,null,13,4,7,2,null,null,5,1], 22` → `[[5,4,11,2],[5,8,4,5]]`. (LeetCode 113)

---

## 🟡 Kết hợp

### ex05 · Tổ tiên chung gần nhất (LCA)
Giá trị trong cây khác nhau; `p`, `q` chắc chắn có trong cây. Trả về **giá trị** của LCA (một node có thể là tổ tiên của chính nó).
```java
int lowestCommonAncestor(TreeNode root, int p, int q)
```
- Ràng buộc: `2 ≤ n ≤ 10⁵`.
- Ví dụ: `[3,5,1,6,2,0,8,null,null,7,4], 5, 1` → `3` · cùng cây, `5, 4` → `5`. (LeetCode 236)

### ex06 · Tổng đường đi lớn nhất
Đường đi là dãy node nối bởi cạnh, mỗi node xuất hiện tối đa 1 lần, **không cần** đi qua gốc, ít nhất 1 node.
```java
int maxPathSum(TreeNode root)
```
- Ràng buộc: `1 ≤ n ≤ 3·10⁴`, `|val| ≤ 1000`.
- Ví dụ: `[1,2,3]` → `6` · `[-10,9,20,null,null,15,7]` → `42` (15 → 20 → 7) · `[-3]` → `-3`. (LeetCode 124)

### ex07 · Dựng cây từ pre-order và in-order
Giá trị khác nhau.
```java
TreeNode buildTree(int[] preorder, int[] inorder)
```
- Ràng buộc: `1 ≤ n ≤ 3000`.
- Ví dụ: `[3,9,20,15,7], [9,3,15,20,7]` → `[3,9,20,null,null,15,7]` · `[-1], [-1]` → `[-1]`.
- Mục tiêu: O(n). (LeetCode 105)

### ex08 · Serialize cây
Chuyển cây thành chuỗi theo **pre-order**, `#` cho null, ngăn cách bởi dấu phẩy (không có khoảng trắng).
```java
String serialize(TreeNode root)
```
- Ví dụ: `[1,2,3,null,null,4,5]` → `"1,2,#,#,3,4,#,#,5,#,#"` · `[]` → `"#"` · `[-7]` → `"-7,#,#"`.
- Ràng buộc: `0 ≤ n ≤ 10⁴` (cây có thể cao tới 10⁴ → cẩn thận với đệ quy ở Python; dùng stack nếu cần).

### ex09 · Deserialize cây
Ngược lại của ex08: nhận chuỗi đúng định dạng trên, trả về cây.
```java
TreeNode deserialize(String data)
```
- Ví dụ: `"1,2,#,#,3,4,#,#,5,#,#"` → `[1,2,3,null,null,4,5]` · `"#"` → `[]`.
- Mục tiêu: O(n) (không `split` rồi `shift()` từng phần tử trong TS).

---

## 🔴 Thực tế

### ex10 · Khoảng cách giữa hai nhân viên
> "Trong sơ đồ tổ chức (cây nhị phân, mỗi node là mã nhân viên khác nhau), hai người muốn trao đổi phải đi theo đường báo cáo lên/xuống. Tính số **bước** (cạnh) giữa nhân viên `a` và `b`."

```java
int distanceBetween(TreeNode root, int a, int b)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `a`, `b` có trong cây (có thể `a == b` → `0`).
- Ví dụ: cây `[3,5,1,6,2,0,8,null,null,7,4]`: `5, 0` → `3` (5 → 3 → 1 → 0) · `7, 4` → `2` · `5, 5` → `0`. (LeetCode 1740)
