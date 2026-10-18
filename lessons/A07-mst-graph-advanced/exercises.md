# A07 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A07-mst-graph-advanced [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A07-mst-graph-advanced 01` · Đo: `node tools/bench.ts lessons/A07-mst-graph-advanced 02`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 2 hint. Trước mỗi bài: nói đồ thị **thưa hay dày**, **vô hướng hay có hướng**, và thuật toán/độ phức tạp bạn chọn.
Câu hỏi quy mô (ex02): với `n = 2000` điểm, Kruskal phải dựng bao nhiêu cạnh? Dự đoán thời gian so với Prim O(n²), rồi `bench`.

> Tự cài DSU (hoặc làm I08 trước) cho ex01. TS: `Heap` từ I04. ex03–ex05, ex08 giới hạn `n ≤ 5000` nên DFS đệ quy an toàn (cây DFS sâu tối đa `n` tầng).

---

## 🟢 Cơ bản

### ex01 · MST bằng Kruskal
Đồ thị vô hướng `n` đỉnh (đánh số từ `0`), `edges[i] = [u, v, w]`. Tổng trọng số của cây khung nhỏ nhất; đồ thị không liên thông → `-1`.
```java
long mstWeight(int n, int[][] edges)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ m ≤ 2·10⁵`, `u ≠ v`, `1 ≤ w ≤ 10⁹` (có thể có cạnh song song). Tổng tới `10¹⁴` → Java `long`. `n = 1` → `0`.
- Ví dụ: `n=4, [[0,1,1],[1,2,2],[2,3,3],[0,3,10],[0,2,4]]` → `6` · `n=3, [[0,1,5]]` → `-1`.

### ex02 · Nối các điểm (Manhattan MST)
Cho `n` điểm trên mặt phẳng; chi phí nối hai điểm là khoảng cách Manhattan `|x₁−x₂| + |y₁−y₂|`. Tổng chi phí nhỏ nhất để mọi điểm liên thông.
```java
long minCostConnectPoints(int[][] points)
```
- Ràng buộc: `1 ≤ n ≤ 2000`, `|x|, |y| ≤ 10⁶` (có thể có điểm trùng). Tổng có thể vượt `int` → Java `long`.
- Ví dụ: `[[0,0],[2,2],[3,10],[5,2],[7,0]]` → `20` · `[[3,12],[-2,5],[-4,1]]` → `18`. (LeetCode 1584)
- Mục tiêu: Prim O(n²). Kruskal trên `n²/2` cạnh trượt Perf.

### ex03 · Cầu (critical connections)
Mạng `n` máy, `connections` là các cáp hai chiều. Một cáp là **cầu** nếu bỏ nó đi làm tăng số thành phần liên thông. Liệt kê mọi cầu.
```java
List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections)
```
- Ràng buộc: `1 ≤ n ≤ 5000`, `0 ≤ m ≤ 10⁴`, các cạnh khác nhau, không khuyên, đồ thị **có thể không liên thông**.
- **Output:** mỗi cầu viết `[u, v]` với `u < v`; danh sách sắp tăng theo `(u, v)`.
- Ví dụ: `4, [[0,1],[1,2],[2,0],[1,3]]` → `[[1,3]]` · `3, [[0,1],[1,2],[2,0]]` → `[]`. (LeetCode 1192)

### ex04 · Điểm khớp
```java
List<Integer> articulationPoints(int n, int[][] edges)
```
- Ràng buộc: như ex03. Đỉnh là **khớp** nếu bỏ nó (cùng các cạnh kề) làm tăng số thành phần liên thông của phần còn lại. Output: tăng dần.
- Ví dụ: `5, [[0,1],[1,2],[2,0],[1,3],[3,4]]` → `[1,3]` · `4, [[0,1],[0,2],[0,3]]` → `[0]` · `2, [[0,1]]` → `[]`.
- Gợi ý: gốc DFS xét khác các đỉnh còn lại.

### ex05 · Đếm thành phần liên thông mạnh
Đồ thị **có hướng** `n` đỉnh. Có bao nhiêu SCC?
```java
int countSCC(int n, int[][] edges)
```
- Ràng buộc: `1 ≤ n ≤ 5000`, `0 ≤ m ≤ 2·10⁴`, cạnh `[u, v]` là `u → v` (có thể trùng, có thể khuyên).
- Ví dụ: `5, [[0,1],[1,2],[2,0],[1,3],[3,4]]` → `3` · `3, []` → `3`.

### ex06 · Lịch trình bay (Euler path)
`tickets[i] = [from, to]`. Dựng hành trình bắt đầu ở `"JFK"` dùng **mọi vé đúng một lần**; nhiều hành trình hợp lệ → chọn cái **nhỏ nhất theo thứ tự từ điển** (so sánh từng sân bay từ trái sang phải).
```java
List<String> findItinerary(List<List<String>> tickets)
```
- Ràng buộc: `1 ≤ m ≤ 3·10⁴`, mã sân bay 3 chữ in hoa; đảm bảo tồn tại ít nhất một hành trình hợp lệ. Hành trình có `m + 1` phần tử.
- Ví dụ: `[["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]` → `["JFK","MUC","LHR","SFO","SJC"]` · `[["JFK","KUL"],["JFK","NRT"],["NRT","JFK"]]` → `["JFK","NRT","JFK","KUL"]`. (LeetCode 332)
- Gợi ý: Hierholzer lặp. Đệ quy `m` tầng có thể tràn stack.

---

## 🔴 Thực tế

### ex07 · Nối các thành phố bằng đường cáp
> "Công ty viễn thông cần nối `n` thành phố (đánh số `1..n`) bằng cáp quang. `connections[i] = [a, b, cost]` là chi phí đặt tuyến giữa hai thành phố. Chi phí thấp nhất để mọi thành phố liên thông (trực tiếp hoặc gián tiếp); không thể thì `-1`."

```java
long minimumCost(int n, int[][] connections)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ m ≤ 2·10⁵`, `a ≠ b`, `1 ≤ cost ≤ 10⁹`. Tổng tới `10¹⁴` → Java `long`.
- Ví dụ: `3, [[1,2,5],[1,3,6],[2,3,1]]` → `6` · `4, [[1,2,3],[3,4,4]]` → `-1`. (LeetCode 1135)
- Làm lại bằng thuật toán **khác** ex01 (Prim-heap thay vì Kruskal) và so sánh thời gian bằng `bench`.

### ex08 · Nhóm service phụ thuộc vòng
> "Hệ thống microservice `0..n−1`. `deps[i] = [a, b]` nghĩa là service `a` phụ thuộc `b` (`a ≠ b`). Hai service thuộc cùng một **vòng phụ thuộc** nếu mỗi service gọi được (trực tiếp hoặc gián tiếp) service kia. Liệt kê các nhóm gồm ≥ 2 service như vậy."

```java
List<List<Integer>> circularServiceGroups(int n, int[][] deps)
```
- Ràng buộc: `1 ≤ n ≤ 5000`, `0 ≤ m ≤ 8000`, có thể có phụ thuộc trùng lặp.
- **Output:** mỗi nhóm tăng dần; các nhóm sắp tăng theo phần tử nhỏ nhất. Không có vòng → `[]`.
- Ví dụ: `5, [[0,1],[1,2],[2,0],[3,4],[4,3]]` → `[[0,1,2],[3,4]]` · `3, [[0,1],[1,2]]` → `[]`.
