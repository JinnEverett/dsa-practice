# A06 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A06-shortest-paths [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A06-shortest-paths 01` · Đo: `node tools/bench.ts lessons/A06-shortest-paths 01`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 2 hint. Trước khi code mỗi bài: **chọn thuật toán và giải thích vì sao** (ràng buộc nào loại các lựa chọn còn lại).
Câu hỏi quy mô (ex01): bản Dijkstra quét mảng tìm min là O(n²) — dự đoán thời gian ở `n = 10⁵` rồi `bench`; vì sao heap + lazy deletion là O(m log n)?

> TS: dùng `Heap` bạn đã tự cài ở I04 (`answers/heap.ts`). Python: `heapq`. Java: `PriorityQueue`.

---

## 🟢 Cơ bản

### ex01 · Thời gian lan truyền tín hiệu (Dijkstra)
Mạng có `n` nút đánh số `1..n`. `times[i] = [u, v, w]`: tín hiệu đi từ `u` đến `v` mất `w` (có hướng). Phát tín hiệu từ nút `k`. Sau bao lâu **mọi** nút nhận được? Có nút không bao giờ nhận được → `-1`.
```java
int networkDelayTime(int[][] times, int n, int k)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁵`, `0 ≤ m ≤ 2·10⁵`, `u ≠ v`, `1 ≤ w ≤ 100`. Có thể có nhiều cạnh cùng cặp `(u, v)`.
- Ví dụ: `[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2` → `2` · `[[1,2,1]], n=2, k=2` → `-1`. (LeetCode 743)

### ex02 · Vé rẻ nhất với ≤ k điểm dừng
`flights[i] = [from, to, price]` (có hướng). Giá rẻ nhất từ `src` đến `dst` với **tối đa `k` điểm dừng** (tức tối đa `k + 1` chuyến); không có → `-1`.
```java
int findCheapestPrice(int n, int[][] flights, int src, int dst, int k)
```
- Ràng buộc: `2 ≤ n ≤ 1000`, `0 ≤ m ≤ 5000`, `src ≠ dst`, `0 ≤ k ≤ n`, `1 ≤ price ≤ 10⁴`.
- Ví dụ: `n=4, [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], 0, 3, k=1` → `700` · `n=3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, k=0` → `500`. (LeetCode 787)
- Gợi ý: vì sao Dijkstra thuần có thể sai ở đây? Bellman-Ford chạy bao nhiêu vòng?

### ex03 · Đường đi tốn sức ít nhất
Bản đồ độ cao `heights[r][c]`. Đi từ ô trên-trái đến ô dưới-phải, 4 hướng; "sức" của một đường = **chênh lệch độ cao tuyệt đối lớn nhất** giữa hai ô liên tiếp. Tìm đường có sức nhỏ nhất.
```java
int minimumEffortPath(int[][] heights)
```
- Ràng buộc: `1 ≤ R, C ≤ 300`, `1 ≤ heights ≤ 10⁶`. Lưới 1 ô → `0`.
- Ví dụ: `[[1,2,2],[3,8,2],[5,3,5]]` → `2` · `[[1,2,3],[3,8,4],[5,3,5]]` → `1`. (LeetCode 1631)

### ex04 · Sửa mũi tên với chi phí tối thiểu (0-1 BFS)
Mỗi ô có mũi tên `1` = phải, `2` = trái, `3` = xuống, `4` = lên. Đi theo mũi tên của ô hiện tại tốn `0`; muốn đi hướng khác phải đổi mũi tên của ô đó, tốn `1`. Chi phí tối thiểu từ ô trên-trái đến ô dưới-phải?
```java
int minCostGrid(int[][] grid)
```
- Ràng buộc: `1 ≤ R, C ≤ 400`, `grid[r][c] ∈ {1,2,3,4}`.
- Ví dụ: `[[1,1,1,1],[2,2,2,2],[1,1,1,1],[2,2,2,2]]` → `3` · `[[1,2],[4,3]]` → `1`. (LeetCode 1368)
- Mục tiêu: O(R·C) bằng deque (cạnh 0 vào đầu, cạnh 1 vào cuối).

### ex05 · Có chu trình âm không (Bellman-Ford)
Đồ thị có hướng `n` đỉnh, cạnh `[u, v, w]` (`w` có thể âm). Có tồn tại **chu trình có tổng trọng số âm** ở **bất kỳ đâu** (kể cả không nối với đỉnh 0) không?
```java
boolean hasNegativeCycle(int n, int[][] edges)
```
- Ràng buộc: `1 ≤ n ≤ 1000`, `0 ≤ m ≤ 5000`, `u ≠ v`, `|w| ≤ 10⁴`.
- Ví dụ: `3, [[0,1,1],[1,2,-1],[2,0,-1]]` → `true` · `3, [[0,1,1],[1,2,-1],[2,0,0]]` → `false`.
- Gợi ý: khởi tạo `dist = 0` cho mọi đỉnh. Floyd-Warshall O(n³) = 10⁹ ở `n = 1000` sẽ trượt Perf.

### ex06 · Thành phố ít láng giềng nhất (Floyd-Warshall)
`n` thành phố, `edges[i] = [u, v, w]` là đường **hai chiều**. Với mỗi thành phố, đếm số thành phố khác có khoảng cách đường ngắn nhất `≤ distanceThreshold`. Trả về thành phố có số đó **nhỏ nhất**; hòa → chỉ số **lớn nhất**.
```java
int findTheCity(int n, int[][] edges, int distanceThreshold)
```
- Ràng buộc: `2 ≤ n ≤ 100`, các cặp `(u, v)` khác nhau, `1 ≤ w ≤ 10⁴`, `1 ≤ distanceThreshold ≤ 10⁴`.
- Ví dụ: `n=4, [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], 4` → `3` · `n=5, [[0,1,2],[0,4,8],[1,2,3],[1,4,2],[2,3,1],[3,4,1]], 2` → `0`. (LeetCode 1334)

---

## 🔴 Thực tế

### ex07 · Phí vận chuyển từ kho
> "Hệ thống logistics có `n` thành phố, `roads[i] = [a, b, cost]` là tuyến **hai chiều** với phí `cost`. Kho đặt ở thành phố `warehouse`. Trả về mảng `fee[i]` = phí rẻ nhất giao hàng từ kho đến thành phố `i`; không có đường đi → `-1`."

```java
long[] shippingCost(int n, int[][] roads, int warehouse)
```
- Ràng buộc: `1 ≤ n ≤ 2·10⁵`, `0 ≤ m ≤ 2·10⁵`, `a ≠ b`, `1 ≤ cost ≤ 10⁹`. Tổng phí tới `2·10¹⁴` → Java `long`. `fee[warehouse] = 0`.
- Ví dụ: `n=4, [[0,1,5],[1,2,3]], warehouse=0` → `[0,5,8,-1]`.

### ex08 · Bơi qua hồ ngập
> "Hồ dạng lưới `R × C`, ô `grid[r][c]` là thời điểm ô đó **bắt đầu cho phép bơi qua** (từ thời điểm đó trở đi). Bạn xuất phát ở ô trên-trái và có thể bơi tức thời giữa hai ô kề nhau khi **cả hai** đều đã cho phép. Thời điểm sớm nhất đến được ô dưới-phải?"

```java
int swimInWater(int[][] grid)
```
- Ràng buộc: `1 ≤ R, C ≤ 300`, `0 ≤ grid[r][c] ≤ 10⁶` (không cần khác nhau). Ô xuất phát cũng phải chờ tới `grid[0][0]`.
- Ví dụ: `[[0,2],[1,3]]` → `3` · `[[5,1],[1,0]]` → `5`. (LeetCode 778, mở rộng)
- So sánh với ex03: chi phí ở **cạnh** hay ở **đỉnh**? Dùng chung khuôn nào?
