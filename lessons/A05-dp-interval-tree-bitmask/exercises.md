# A05 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A05-dp-interval-tree-bitmask [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A05-dp-interval-tree-bitmask 01` · Đo: `node tools/bench.ts lessons/A05-dp-interval-tree-bitmask 06`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 2 hint. Trước khi code: nói state, transition, thứ tự tính và độ phức tạp.
Câu hỏi quy mô: (1) ex06 — dự đoán thời gian ở `n = 15` và `n = 20` (gấp bao nhiêu lần?); vét cạn `(n−1)!` ở `n = 15` là bao nhiêu phép? (2) ex07 — vì sao `n = 10⁹` chạy tức thì với công thức nhưng vòng lặp `1..n` mất hàng giây?

> Bài cây (ex04, ex05): cây có thể **lệch hoàn toàn** (độ sâu = số node, tối đa 5000). Đệ quy 5000 tầng vẫn an toàn ở cả TS/Python/Java; nếu muốn làm bản `10⁵` node, tự viết post-order lặp (không có test tự động).

---

## 🟢 Cơ bản

### ex01 · Nổ bóng bay
Có `n` quả bóng ghi số `nums[i]`. Nổ quả `i` được `nums[i-1] · nums[i] · nums[i+1]` điểm (ngoài biên coi là `1`). Nổ hết bóng, tổng điểm lớn nhất?
```java
int maxCoins(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 300`, `0 ≤ nums[i] ≤ 100`. Đáp án vừa `int`.
- Ví dụ: `[3,1,5,8]` → `167` · `[1,5]` → `10`. (LeetCode 312)
- Gợi ý: nghĩ về quả nổ **cuối cùng** trong đoạn.

### ex02 · Cây từ lá, tổng nút nhỏ nhất
Cho dãy giá trị lá (theo thứ tự duyệt giữa). Dựng cây nhị phân đầy đủ (mỗi nút trong có đúng hai con) với các lá đó; giá trị mỗi nút trong = (lá lớn nhất của cây con trái) × (lá lớn nhất của cây con phải). Tổng giá trị các nút trong nhỏ nhất?
```java
int mctFromLeafValues(int[] arr)
```
- Ràng buộc: `2 ≤ n ≤ 200`, `1 ≤ arr[i] ≤ 15`.
- Ví dụ: `[6,2,4]` → `32` · `[4,11]` → `44`. (LeetCode 1130)
- Mục tiêu: interval DP O(n³). (Có lời giải stack O(n) — tự tìm hiểu sau khi qua `check`.)

### ex03 · Chia đa giác thành tam giác
Đa giác lồi có đỉnh mang nhãn `values[i]` (theo chiều kim đồng hồ). Chia thành `n − 2` tam giác; điểm mỗi tam giác = tích nhãn 3 đỉnh. Tổng điểm nhỏ nhất?
```java
int minScoreTriangulation(int[] values)
```
- Ràng buộc: `3 ≤ n ≤ 200`, `1 ≤ values[i] ≤ 100`.
- Ví dụ: `[1,2,3]` → `6` · `[3,7,4,5]` → `144` · `[1,3,1,4,1,5]` → `13`. (LeetCode 1039)

### ex04 · Cướp nhà trên cây
Các nhà xếp thành cây nhị phân; hai nhà có quan hệ cha–con không được cướp cùng lúc. Tổng tiền lớn nhất?
```java
int robTree(TreeNode root)
```
- Ràng buộc: `0 ≤ số node ≤ 5000`, `0 ≤ val ≤ 10⁴`. Cây rỗng → `0`.
- Ví dụ: `[3,2,3,null,3,null,1]` → `7` · `[3,4,5,1,3,null,1]` → `9`. (LeetCode 337)
- Gợi ý: mỗi node trả về một **cặp** `(không lấy, lấy)`.

### ex05 · Đặt camera trên cây
Camera đặt ở node phủ chính node đó, cha và các con. Số camera ít nhất để phủ mọi node?
```java
int minCameraCover(TreeNode root)
```
- Ràng buộc: `0 ≤ số node ≤ 5000`, `val = 0`. Cây rỗng → `0`.
- Ví dụ: `[0,0,null,0,0]` → `1` · `[0,0,null,0,null,0,null,null,0]` → `2`. (LeetCode 968)
- Gợi ý: 3 trạng thái cho mỗi node: chưa được phủ / có camera / được phủ nhưng không có camera.

### ex06 · Người bán hàng (TSP)
Có `n` thành phố, `dist[i][j]` là chi phí đi từ `i` đến `j` (**không nhất thiết đối xứng**, `dist[i][i] = 0`). Xuất phát từ thành phố `0`, thăm mỗi thành phố đúng một lần rồi quay về `0`. Chi phí nhỏ nhất?
```java
int tsp(int[][] dist)
```
- Ràng buộc: `1 ≤ n ≤ 15`, `1 ≤ dist[i][j] ≤ 10⁶` (i ≠ j). `n = 1` → `0`. Đáp án ≤ `1.5·10⁷`.
- Ví dụ: `[[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]]` → `80` · `[[0,3],[5,0]]` → `8`.
- Mục tiêu: bitmask DP O(2ⁿ · n²). Java: `INF = 1e9`, không dùng `Integer.MAX_VALUE`.

### ex07 · Đếm chữ số 1
Đếm tổng số lần chữ số `1` xuất hiện trong mọi số nguyên từ `0` đến `n`.
```java
int countDigitOne(int n)
```
- Ràng buộc: `0 ≤ n ≤ 10⁹`. Đáp án ≤ `900 000 001` (vừa `int`).
- Ví dụ: `13` → `6` (1, 10, 11×2, 12, 13) · `99` → `20` · `0` → `0`. (LeetCode 233)
- Mục tiêu: O(log n). Duyệt `1..n` trượt Perf. Java: biến vị trí `m` nên là `long` (`m·10` có thể vượt `int`).

---

## 🔴 Thực tế

### ex08 · Chia việc đều cho k người
> "Có `n` đầu việc, việc `i` tốn `nums[i]` giờ. Chia **toàn bộ** việc cho đúng `k` người sao cho mọi người làm cùng một số giờ; mỗi việc giao cho đúng một người, không chia nhỏ. Có chia được không?"

```java
boolean canPartitionKSubsets(int[] nums, int k)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 16`, `1 ≤ nums[i] ≤ 10⁴`.
- Ví dụ: `[4,3,2,3,5,2,1], 4` → `true` (ví dụ nhóm: `{5}`, `{1,4}`, `{2,3}`, `{2,3}`) · `[1,2,3,4], 3` → `false`. (LeetCode 698)
- Mục tiêu: bitmask DP O(2ⁿ · n). Backtracking nhồi k xô có thể mũ trong trường hợp xấu — hãy so sánh bằng `bench` nếu bạn làm cả hai.
