# I07 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I07-topological-sort [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I07-topological-sort 01`

**Pass:** ≥ 6/8 bài qua `check` (ex07 hoặc ex08 phải nằm trong số đó), ≤ 2 hint, và trả lời được câu hỏi quy mô ở cuối.

> Quy ước chung: node đánh số `0..n-1` (trừ ex05 đánh số từ 1, đúng như đề gốc). Mọi cạnh có hai đầu khác nhau; **cạnh có thể lặp lại** trừ khi đề nói khác. Chuỗi phụ thuộc có thể dài tới `10⁵` ⇒ cẩn thận đệ quy.
> Nói trước khi code: ý tưởng + Big-O dự kiến (thời gian / bộ nhớ).

---

## 🟢 Cơ bản

### ex01 · Học hết được không
Có `numCourses` môn, `prerequisites[i] = [a, b]` nghĩa là "muốn học `a` phải học `b` trước". Có học xong tất cả được không?
```java
boolean canFinish(int numCourses, int[][] prerequisites)
```
- Ràng buộc: `1 ≤ numCourses ≤ 10⁵`, `0 ≤ |prerequisites| ≤ 2·10⁵`, `a ≠ b`, cặp có thể lặp.
- Ví dụ: `2, [[1,0]]` → `true` · `2, [[1,0],[0,1]]` → `false` · `1, []` → `true`.
- Mục tiêu: O(n + m). (LeetCode 207)

### ex02 · Thứ tự học
Như ex01 nhưng trả về một thứ tự học hợp lệ (mọi môn đúng một lần); nếu không có thì trả mảng rỗng.
```java
int[] findOrder(int numCourses, int[][] prerequisites)
```
- Ràng buộc: như ex01.
- Output: **bất kỳ** thứ tự hợp lệ (checker kiểm tra tính hợp lệ). Có chu trình → mảng rỗng.
- Ví dụ: `4, [[1,0],[2,0],[3,1],[3,2]]` → `[0,1,2,3]` (hoặc `[0,2,1,3]`) · `2, [[1,0],[0,1]]` → `[]`.
- Mục tiêu: O(n + m). (LeetCode 210)

### ex03 · Thứ tự topo nhỏ nhất theo từ điển
Cạnh `[u, v]` nghĩa là `u` phải đứng trước `v`. Trong mọi thứ tự topo hợp lệ, trả về thứ tự **nhỏ nhất theo từ điển** (so từng vị trí, số nhỏ hơn thắng). Có chu trình → `[]`.
```java
int[] lexSmallestTopo(int n, int[][] edges)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |edges| ≤ 2·10⁵`, `u ≠ v`, cạnh có thể lặp.
- Output: đáp án **duy nhất**.
- Ví dụ: `3, [[2,0],[0,1]]` → `[2,0,1]` · `4, [[3,0],[3,1]]` → `[2,3,0,1]` · `5, [[4,0],[1,3]]` → `[1,2,3,4,0]`.
- Mục tiêu: O((n + m) log n).

---

## 🟡 Kết hợp

### ex04 · Từ điển người ngoài hành tinh
Ngôn ngữ ngoài hành tinh dùng các chữ cái `a–z` nhưng thứ tự bảng chữ cái khác. `words` là danh sách từ **đã được sắp tăng dần** theo từ điển của họ. Suy ra một thứ tự chữ cái phù hợp: kết quả chứa **mỗi chữ cái xuất hiện trong `words` đúng một lần**. Không tồn tại (mâu thuẫn, hoặc từ dài đứng trước chính tiền tố của nó, vd. `"abc"` rồi `"ab"`) → `""`.
```java
String alienOrder(String[] words)
```
- Ràng buộc: `1 ≤ |words| ≤ 10⁵`, mỗi từ không rỗng, chỉ gồm `a–z`, tổng độ dài `≤ 6·10⁵`, từ có thể lặp.
- Output: **bất kỳ** thứ tự hợp lệ (checker kiểm tra), `""` nếu không có.
- Ví dụ: `["wrt","wrf","er","ett","rftt"]` → `"wertf"` · `["z","x"]` → `"zx"` · `["z","x","z"]` → `""` · `["abc","ab"]` → `""`.
- Mục tiêu: O(tổng độ dài + 26²). Gợi ý nhẹ: chỉ cần so các cặp từ **liền kề**. (LeetCode 269)

### ex05 · Số học kỳ tối thiểu
`n` môn đánh số `1..n`; `relations[i] = [prev, next]` nghĩa là học `prev` xong mới được học `next` (ở kỳ **sau**). Mỗi kỳ học được số môn tùy ý miễn là mọi tiền đề đã học ở các kỳ trước. Ít nhất mấy kỳ để học hết? Không thể → `-1`.
```java
int minimumSemesters(int n, int[][] relations)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |relations| ≤ 2·10⁵`, `prev ≠ next`, cặp có thể lặp.
- Ví dụ: `3, [[1,3],[2,3]]` → `2` · `3, [[1,2],[2,3],[3,1]]` → `-1` · `5, []` → `1`.
- Mục tiêu: O(n + m). (LeetCode 1136)

### ex06 · Node an toàn
Đồ thị có hướng `graph[i]` = các node mà `i` trỏ tới. Node là **cuối** nếu không có cạnh ra. Node là **an toàn** nếu *mọi* đường đi xuất phát từ nó đều kết thúc ở node cuối sau hữu hạn bước (tức là không đi tới được chu trình). Trả về mọi node an toàn, **tăng dần**.
```java
List<Integer> eventualSafeNodes(int[][] graph)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, tổng số cạnh `≤ 3·10⁵`; không tự trỏ, không cạnh lặp.
- Ví dụ: `[[1,2],[2,3],[5],[0],[5],[],[]]` → `[2,4,5,6]` · `[[1],[0]]` → `[]` · `[[]]` → `[0]`.
- Mục tiêu: O(n + m), không đệ quy sâu. (LeetCode 802)

---

## 🔴 Thực tế

### ex07 · Thứ tự chạy migration
> "Dự án có `n` file migration CSDL, mỗi file có một tên duy nhất. `deps[i] = [a, b]` nghĩa là migration `a` phải chạy **sau** `b`. Công cụ luôn chạy migration nào sẵn sàng (mọi phụ thuộc đã chạy xong); khi nhiều migration cùng sẵn sàng, chọn **tên nhỏ nhất theo thứ tự chuỗi** (so từng ký tự, tiền tố ngắn hơn đứng trước) để kết quả tất định giữa các máy. Nếu có vòng phụ thuộc thì không chạy gì cả và trả `[]`."

```java
String[] migrationOrder(String[] names, String[][] deps)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`; tên duy nhất, độ dài `1..12`, ký tự thuộc `[a-z0-9_]`; `0 ≤ |deps| ≤ 1.5·10⁵`; tên trong `deps` đều thuộc `names`; `a ≠ b`; cặp có thể lặp.
- Output: thứ tự chạy (đáp án duy nhất) hoặc `[]` nếu có chu trình.
- Ví dụ: `["b","a","c"], [["c","a"]]` → `["a","b","c"]` · `["c","a","b"], [["a","c"]]` → `["b","c","a"]` · `["u_2","u_10","u_1"], []` → `["u_1","u_10","u_2"]`.
- Mục tiêu: O((n + m) log n). Tra tên → chỉ số phải O(1); chọn min tiếp theo không được quét tuyến tính.

### ex08 · Thời gian build tối thiểu
> "Monorepo có `n` package (đánh số `0..n-1`). `deps[i] = [a, b]` nghĩa là `a` phụ thuộc `b`: chỉ build `a` khi `b` đã build xong. Package `i` mất `duration[i]` ms để build. CI có **vô hạn worker**: một package bắt đầu build ngay khi mọi phụ thuộc của nó xong. Cả monorepo build xong sau tối thiểu bao nhiêu ms?"

```java
long minBuildTime(int n, int[][] deps, int[] duration)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |deps| ≤ 3·10⁵`, đồ thị phụ thuộc **không có chu trình**, `a ≠ b`, cặp có thể lặp; `1 ≤ duration[i] ≤ 10⁹`. Kết quả tới `10¹⁴` → Java dùng `long`.
- Ví dụ: `3, [[2,0],[2,1]], [3,4,2]` → `6` (build 0 và 1 song song, xong ở ms 4; package 2 chạy tiếp 2 ms) · `3, [], [1,2,3]` → `3` · `3, [[1,0],[2,1]], [10⁹,10⁹,10⁹]` → `3000000000`.
- Mục tiêu: O(n + m). (LeetCode 2050)

---

## Câu hỏi quy mô (làm sau khi ex01–ex03 đúng)
1. **Dự đoán trước, không chạy:** Kahn trên chuỗi `n = 10⁶` node, `m = 10⁶` cạnh sẽ mất khoảng bao nhiêu ms trong ngôn ngữ của bạn? Big-O? Ghi số dự đoán rồi chạy `node tools/bench.ts lessons/I07-topological-sort 01 --scales s,m,l` và so sánh số mũ ước lượng.
2. Nếu bạn thay hàng đợi bằng `queue.shift()` (TS) hoặc `list.pop(0)` (Python), thời gian ở `n = 10⁵` và `10⁶` thay đổi thế nào? Giải thích vì sao.
3. Với ex03: nếu mỗi bước bạn `sort` lại danh sách node sẵn sàng thay vì dùng heap, độ phức tạp tệ nhất là bao nhiêu và đồ thị nào kích hoạt nó?
4. Trong ex07, đệ quy DFS cho ra thứ tự nhỏ nhất theo tên được không? Vì sao Kahn + heap tự nhiên hơn?
