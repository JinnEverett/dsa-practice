# I06 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I06-dfs-connectivity [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I06-dfs-connectivity 01`

**Pass:** ≥ 8/10 bài qua `check`, ≤ 3 hint, và trả lời được **câu hỏi quy mô** cuối file.

> **Cảnh báo có chủ đích:** nhiều test có đường thẳng 10⁵ đỉnh, đảo "rắn" ~8·10⁴ ô, ảnh một màu 600×600. DFS đệ quy sẽ tràn stack — hãy viết bản dùng **stack tường minh** (README §2). Nếu bạn làm bằng đệ quy, `check` sẽ báo `Maximum call stack size exceeded`; đó là một phần bài học.
>
> Quy ước: đỉnh đánh số `0..n−1`; lưới đi 4 hướng.

---

## 🟢 Cơ bản

### ex01 · Đếm thành phần liên thông
```java
int countComponents(int n, int[][] edges)
```
- Đồ thị vô hướng. Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |edges| ≤ 2·10⁵`, không khuyên, không cạnh trùng.
- Ví dụ: `n=5, [[0,1],[1,2],[3,4]]` → `2` · `n=1, []` → `1`. (LeetCode 323)

### ex02 · Flood fill
Tô `image[sr][sc]` và mọi ô liên thông (4 hướng) **cùng màu ban đầu** bằng `color`. Trả về ảnh mới, **không sửa** ảnh gốc.
```java
int[][] floodFill(int[][] image, int sr, int sc, int color)
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`, `0 ≤ image[i][j], color < 65536`.
- Ví dụ: `[[1,1,1],[1,1,0],[1,0,1]], 1, 1, 2` → `[[2,2,2],[2,2,0],[2,0,1]]` · màu mới trùng màu gốc → ảnh không đổi. (LeetCode 733)

### ex03 · Đảo lớn nhất
Số ô của đảo (nhóm ô `1` liên thông 4 hướng) lớn nhất; không có đảo → `0`.
```java
int maxAreaOfIsland(int[][] grid)
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`.
- Ví dụ: `[[0,0,1,0,0],[0,1,1,0,0],[0,0,0,0,1]]` → `3` · `[[0,0,0]]` → `0`. (LeetCode 695)

### ex04 · Chu trình trong đồ thị vô hướng
```java
boolean hasCycleUndirected(int n, int[][] edges)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |edges| ≤ 2·10⁵`, không khuyên nhưng **có thể có cạnh trùng** (hai cạnh cùng nối `u`–`v` tạo chu trình độ dài 2). Đồ thị có thể không liên thông.
- Ví dụ: `4, [[0,1],[1,2],[2,0],[2,3]]` → `true` · `4, [[0,1],[1,2],[2,3]]` → `false` · `3, [[0,1],[1,0]]` → `true`.

---

## 🟡 Kết hợp

### ex05 · Chu trình trong đồ thị có hướng
Cạnh `[a, b]` nghĩa là `a → b` (vd. "a phụ thuộc vào..."). Có chu trình có hướng không?
```java
boolean hasCycleDirected(int n, int[][] edges)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |edges| ≤ 2·10⁵`, không khuyên, có thể có cạnh trùng. Có thể không liên thông.
- Ví dụ: `4, [[0,1],[1,2],[2,3],[3,1]]` → `true` · `4, [[0,1],[0,2],[1,3],[2,3]]` → `false` (kim cương).
- Mục tiêu: O(n + m), **không đệ quy** (test có chuỗi phụ thuộc dài 10⁵).

### ex06 · Đồ thị hai phía
`graph[u]` là danh sách hàng xóm của `u` (đồ thị vô hướng, đối xứng).
```java
boolean isBipartite(int[][] graph)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, không khuyên, không cạnh trùng, có thể không liên thông.
- Ví dụ: `[[1,2,3],[0,2],[0,1,3],[0,2]]` → `false` · `[[1,3],[0,2],[1,3],[0,2]]` → `true`. (LeetCode 785)

### ex07 · Vùng bị bao quanh
Bảng gồm `'X'` và `'O'`. Mọi vùng `'O'` liên thông (4 hướng) **không chạm biên** bị đổi thành `'X'`. Trả về bảng mới.
```java
String[] captureRegions(String[] board)
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`.
- Ví dụ: `["XXXX","XOOX","XXOX","XOXX"]` → `["XXXX","XXXX","XXXX","XOXX"]`. (LeetCode 130)
- Gợi ý nhẹ: đừng kiểm tra từng vùng — hãy đi từ biên.

### ex08 · Nước chảy ra hai đại dương
`heights[r][c]` là độ cao. Nước chảy sang ô kề (4 hướng) có độ cao **≤**. Đại dương Thái Bình Dương sát biên trên và trái, Đại Tây Dương sát biên dưới và phải. Trả về mọi ô `[r, c]` mà nước từ đó chảy tới **cả hai** đại dương (thứ tự tùy ý).
```java
List<List<Integer>> pacificAtlantic(int[][] heights)
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`, `0 ≤ độ cao ≤ 10⁵`.
- Ví dụ: `[[1]]` → `[[0,0]]` · `[[2,1],[1,2]]` → `[[0,0],[0,1],[1,0],[1,1]]`. (LeetCode 417)

---

## 🔴 Thực tế

### ex09 · Nhóm khách hàng liên kết
> "Bảng `isConnected` cho biết hai khách hàng có quan hệ trực tiếp (giới thiệu, chung thiết bị...). Quan hệ gián tiếp cũng tính là cùng nhóm. Cần chia khách hàng thành bao nhiêu nhóm?"

```java
int findCircleNum(int[][] isConnected)
```
- Ma trận `n×n` đối xứng, `isConnected[i][i] = 1`. Ràng buộc: `1 ≤ n ≤ 1000`.
- Ví dụ: `[[1,1,0],[1,1,0],[0,0,1]]` → `2` · ma trận đơn vị `3×3` → `3`. (LeetCode 547)

### ex10 · Số dây cáp cần kéo lại
> "Có `n` máy chủ đánh số `0..n−1` và danh sách dây cáp hai chiều. Mỗi lần được nhổ một dây đang có và cắm nối hai máy bất kỳ. Cần ít nhất bao nhiêu lần như vậy để mọi máy thông nhau? Không thể (thiếu dây) → `-1`."

```java
int makeConnected(int n, int[][] connections)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |connections| ≤ 10⁵ + 10³`; không khuyên; **có thể có hai dây cùng nối một cặp máy** (một trong hai là dây thừa).
- Ví dụ: `4, [[0,1],[0,2],[1,2]]` → `1` · `6, [[0,1],[0,2],[0,3],[1,2]]` → `-1` · `2, [[0,1],[0,1]]` → `0`. (LeetCode 1319)

---

## ❓ Câu hỏi quy mô (làm sau khi qua ex01 và ex05)

1. Đường thẳng 10⁵ đỉnh: DFS đệ quy sâu bao nhiêu tầng? So với mức ~7 000–12 000 tầng của Node, bạn **dự đoán** nó tràn ở `n` khoảng bao nhiêu? Thử với `n = 5 000`, `20 000` để kiểm chứng.
2. Bạn dự đoán `countComponents` ở `n = 10⁶`, `m = 5·10⁵` mất bao lâu so với `n = 10⁵`? Big-O?
3. `node tools/bench.ts lessons/I06-dfs-connectivity 05 --scales s,m,l` — số mũ ước lượng có ≈ 1 không? Nếu bản của bạn đệ quy, bench báo gì ở scale `m`?
