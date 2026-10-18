# I05 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I05-graph-bfs [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I05-graph-bfs 01`

**Pass:** ≥ 8/10 bài qua `check`, ≤ 3 hint, và trả lời được **câu hỏi quy mô** cuối file (dự đoán trước, `bench` sau).

> Quy ước chung: đỉnh đánh số `0..n−1`; đồ thị **vô hướng**, không khuyên, không cạnh trùng, trừ khi đề nói khác. Lưới chỉ đi 4 hướng, trừ khi đề nói khác.

---

## 🟢 Cơ bản

### ex01 · Đường ngắn nhất không trọng số
```java
int shortestPath(int n, int[][] edges, int src, int dst)
```
- Trả về số cạnh ít nhất từ `src` tới `dst`; không tới được → `-1`; `src == dst` → `0`.
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |edges| ≤ 2·10⁵`, `0 ≤ src, dst < n`.
- Ví dụ: `n=5, edges=[[0,1],[1,2],[2,4],[0,3],[3,4]], src=0, dst=4` → `2` · `n=4, edges=[[0,1],[2,3]], src=0, dst=3` → `-1`.

### ex02 · Đếm đảo
Lưới ký tự `'1'` (đất) và `'0'` (nước). Một đảo là nhóm ô đất liên thông theo 4 hướng. **Dùng BFS** (DFS để dành cho I06).
```java
int numIslands(String[] grid)   // mỗi phần tử là một hàng
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`.
- Ví dụ: `["11110","11010","11000","00000"]` → `1` · `["11000","11000","00100","00011"]` → `3`. (LeetCode 200)

### ex03 · Cam thối lan
`0` ô trống, `1` cam tươi, `2` cam thối. Mỗi phút, cam tươi kề (4 hướng) với cam thối bị thối. Trả về số phút để hết cam tươi; không thể → `-1`; không có cam tươi → `0`.
```java
int orangesRotting(int[][] grid)
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`.
- Ví dụ: `[[2,1,1],[1,1,0],[0,1,1]]` → `4` · `[[2,1,1],[0,1,1],[1,0,1]]` → `-1` · `[[0,2]]` → `0`. (LeetCode 994)

### ex04 · Đường ngắn nhất 8 hướng
Lưới vuông `N×N` gồm `0` (đi được) và `1` (chặn). Đi từ `(0,0)` tới `(N−1,N−1)`, được đi 8 hướng. Trả về **số ô** trên đường ngắn nhất; không có → `-1`.
```java
int shortestPathBinaryMatrix(int[][] grid)
```
- Ràng buộc: `1 ≤ N ≤ 1000`. Ô đầu hoặc ô cuối bằng `1` → `-1`.
- Ví dụ: `[[0,1],[1,0]]` → `2` · `[[0,0,0],[1,1,0],[1,1,0]]` → `4` · `[[0]]` → `1`. (LeetCode 1091)

---

## 🟡 Kết hợp

### ex05 · Khoảng cách tới số 0 gần nhất
Với mỗi ô, trả về khoảng cách (số bước 4 hướng, đi qua mọi ô) tới ô `0` gần nhất.
```java
int[][] updateMatrix(int[][] mat)
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`, ma trận có **ít nhất một số 0**, giá trị chỉ `0`/`1`.
- Ví dụ: `[[0,0,0],[0,1,0],[1,1,1]]` → `[[0,0,0],[0,1,0],[1,2,1]]`. (LeetCode 542)
- Gợi ý nhẹ: bản "BFS từ mỗi ô 1" là O((R·C)²) — bạn chỉ cần **một** lần BFS.

### ex06 · Ổ khóa 4 bánh xe
Khóa có 4 bánh, mỗi bánh `0..9` xoay vòng (`9 → 0`, `0 → 9`). Mỗi lượt xoay một bánh một nấc. Bắt đầu `"0000"`; `deadends` là các trạng thái làm khóa kẹt (không được đi vào, kể cả `"0000"` hoặc đích). Trả về số lượt ít nhất để tới `target`, không được → `-1`.
```java
int openLock(String[] deadends, String target)
```
- Ràng buộc: `0 ≤ |deadends| ≤ 500`, chuỗi gồm đúng 4 chữ số, `target` không nằm trong `deadends`.
- Ví dụ: `["0201","0101","0102","1212","2002"], "0202"` → `6` · `["8888"], "0009"` → `1` · `["0000"], "8888"` → `-1`. (LeetCode 752)

### ex07 · Word ladder
Biến `beginWord` thành `endWord`, mỗi bước đổi **đúng một** chữ cái và từ mới phải có trong `wordList`. Trả về **số từ** trong dãy ngắn nhất (tính cả hai đầu); không có → `0`.
```java
int ladderLength(String beginWord, String endWord, String[] wordList)
```
- Ràng buộc: các từ cùng độ dài `1 ≤ L ≤ 10`, chữ thường; `wordList` không trùng, `0 ≤ |wordList| ≤ 5000`; `beginWord ≠ endWord`; `beginWord` có thể có hoặc không trong `wordList`.
- Ví dụ: `"hit", "cog", ["hot","dot","dog","lot","log","cog"]` → `5` · cùng đầu vào bỏ `"cog"` → `0`. (LeetCode 127)
- Mục tiêu: không so sánh từng cặp từ (O(N²·L)); gom theo "mẫu" (`h*t`) để tìm hàng xóm.

### ex08 · Khôi phục đường ngắn nhất
```java
int[] shortestPathNodes(int n, int[][] edges, int src, int dst)
```
- Trả về **một** đường đi ngắn nhất dạng danh sách đỉnh từ `src` tới `dst` (gồm cả hai đầu). Nhiều đường cùng độ dài → trả đường nào cũng được. Không tới được → `[]`. `src == dst` → `[src]`.
- Ràng buộc như ex01.
- Ví dụ: `n=5, edges=[[0,1],[1,2],[2,4],[0,3],[3,4]], src=0, dst=4` → `[0,3,4]`.

---

## 🔴 Thực tế

### ex09 · Kho gần nhất
> "Mạng lưới `n` điểm giao hàng nối bằng các tuyến đường hai chiều (mỗi tuyến = 1 đoạn). Có vài điểm là kho. Với **mỗi điểm**, cần biết nó cách kho gần nhất bao nhiêu đoạn đường; điểm không có đường tới kho nào thì ghi `-1`."

```java
int[] nearestWarehouse(int n, int[][] roads, int[] warehouses)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |roads| ≤ 2·10⁵` (không khuyên, không trùng), `1 ≤ |warehouses| ≤ n`, các kho khác nhau.
- Ví dụ: `n=5, roads=[[0,1],[1,2],[3,4]], warehouses=[0]` → `[0,1,2,-1,-1]` · `n=6`, đường thẳng `0-1-2-3-4-5`, kho `[0,5]` → `[0,1,2,2,1,0]`.

### ex10 · Robot kho phá vật cản
> "Robot trong kho đi từ góc trên-trái `(0,0)` tới góc dưới-phải. `0` là lối đi, `1` là kệ hàng chắn. Robot đi 4 hướng và được **phá tối đa `k` kệ** trên đường đi (mỗi lần bước vào một ô `1` tốn một lần phá). Tìm số bước ít nhất."

```java
int shortestPathWithBreaks(int[][] grid, int k)
```
- Ràng buộc: `1 ≤ R, C`, `R·C ≤ 4·10⁴`, `0 ≤ k ≤ 40`; `grid[0][0] = grid[R−1][C−1] = 0`. Không tới được → `-1`. Lưới `1×1` → `0`.
- Ví dụ: `[[0,0,0],[1,1,0],[0,0,0],[0,1,1],[0,0,0]], k=1` → `6` · `[[0,1,1],[1,1,1],[1,0,0]], k=1` → `-1`. (LeetCode 1293)
- Gợi ý nhẹ: "tới cùng một ô nhưng còn nhiều lần phá hơn" là hai trạng thái khác nhau.

---

## ❓ Câu hỏi quy mô (làm sau khi qua ex01 và ex05)

1. Với đồ thị `n = 10⁵`, `m = 2·10⁵`, bạn **dự đoán** `shortestPath` chạy bao nhiêu ms ở `n = 10⁶`, `m = 2·10⁶`? Big-O là gì?
2. Bản dựng danh sách kề bằng cách quét toàn bộ `edges` cho từng đỉnh sẽ chạy bao lâu ở `n = 10⁵`? (Tính: `n·m` phép so sánh, ~10⁸ phép/giây.)
3. Chạy `node tools/bench.ts lessons/I05-graph-bfs 05 --scales s,m,l` và đối chiếu: số mũ ước lượng có gần 1 không? Nếu bạn dùng `queue.shift()`, số mũ thay đổi thế nào?
