# I01 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I01-tree-traversal [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I01-tree-traversal 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint. Từ Tier I: **nói ý tưởng + Big-O trước khi code**.

> Cây trong đề viết dạng mảng level-order kiểu LeetCode (`null` là vị trí trống); hàm nhận `TreeNode`. Bộ test của ex01–ex05 có **cây lệch sâu 10⁵ tầng** → bắt buộc dùng vòng lặp + stack/queue.

---

## 🟢 Cơ bản

### ex01 · Pre-order (vòng lặp)
```java
List<Integer> preorder(TreeNode root)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `[1,null,2,3]` → `[1,2,3]` · `[1,2,3,4,5,null,6]` → `[1,2,4,5,3,6]` · `[]` → `[]`. (LeetCode 144)

### ex02 · In-order (vòng lặp)
```java
List<Integer> inorder(TreeNode root)
```
- Ví dụ: `[1,null,2,3]` → `[1,3,2]` · `[1,2,3,4,5,null,6]` → `[4,2,5,1,3,6]`. (LeetCode 94)

### ex03 · Post-order (vòng lặp)
```java
List<Integer> postorder(TreeNode root)
```
- Ví dụ: `[1,null,2,3]` → `[3,2,1]` · `[1,2,3,4,5,null,6]` → `[4,5,2,6,3,1]`. (LeetCode 145)

### ex04 · Duyệt theo tầng
```java
List<List<Integer>> levelOrder(TreeNode root)
```
- Ví dụ: `[3,9,20,null,null,15,7]` → `[[3],[9,20],[15,7]]` · `[1]` → `[[1]]` · `[]` → `[]`. (LeetCode 102)

---

## 🟡 Kết hợp

### ex05 · Chiều cao cây
Số node trên đường dài nhất từ gốc tới lá.
```java
int maxDepth(TreeNode root)
```
- Ví dụ: `[3,9,20,null,null,15,7]` → `3` · `[1,null,2]` → `2` · `[]` → `0`.
- Bộ test có cây lệch 10⁵ tầng. (LeetCode 104)

### ex06 · Góc nhìn bên phải
Đứng bên phải cây, liệt kê giá trị nhìn thấy từ trên xuống (node phải nhất của mỗi tầng).
```java
List<Integer> rightSideView(TreeNode root)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `[1,2,3,null,5,null,4]` → `[1,3,4]` · `[1,2,3,4]` → `[1,3,4]` · `[]` → `[]`. (LeetCode 199)

### ex07 · Cây đối xứng
Cây có đối xứng gương qua trục giữa không?
```java
boolean isSymmetric(TreeNode root)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[1,2,2,3,4,4,3]` → `true` · `[1,2,2,null,3,null,3]` → `false`.
- Gợi ý: so sánh **cặp** node (trái của bên này với phải của bên kia). (LeetCode 101)

### ex08 · Lật cây
Đổi chỗ con trái/phải của **mọi** node, trả về gốc.
```java
TreeNode invertTree(TreeNode root)
```
- Ví dụ: `[4,2,7,1,3,6,9]` → `[4,7,2,9,6,3,1]` · `[]` → `[]`. (LeetCode 226)

---

## 🔴 Thực tế

### ex09 · Lương trung bình theo cấp
> "Sơ đồ tổ chức dạng cây nhị phân, mỗi node là lương (triệu đồng) của một người. Báo cáo cần **lương trung bình của từng cấp**, từ CEO xuống."

```java
List<Double> averageOfLevels(TreeNode root)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|val| ≤ 2³¹ − 1` (tổng một tầng có thể vượt `int` → Java dùng `long`/`double` khi cộng).
- Kết quả so với sai số tương đối 10⁻⁶.
- Ví dụ: `[3,9,20,null,null,15,7]` → `[3.0, 14.5, 11.0]`. (LeetCode 637)

### ex10 · Chiều rộng lớn nhất của sơ đồ
> "Khi vẽ sơ đồ tổ chức, mỗi tầng chiếm bề rộng từ node trái nhất đến node phải nhất — **tính cả các vị trí trống ở giữa** (như thể cây đầy đủ). Cần bề rộng lớn nhất để chọn khổ giấy."

```java
int widthOfBinaryTree(TreeNode root)
```
- Ràng buộc: `1 ≤ n ≤ 3000`, cây có thể lệch sâu (vị trí chưa chuẩn hóa vượt mọi kiểu số), đáp án vừa `int`.
- Ví dụ: `[1,3,2,5,3,null,9]` → `4` · `[1,3,2,5,null,null,9,6,null,7]` → `7` · `[1,3,2,5]` → `2`. (LeetCode 662)
