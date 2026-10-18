# I07 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I07-topological-sort [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I07-topological-sort 01`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 3 hint, và trả lời được **câu hỏi quy mô** cuối file.

> Test có chuỗi phụ thuộc dài `10⁵` (đệ quy DFS sẽ tràn stack) và tổng thời gian tới `10¹⁴` (Java dùng `long`). Đỉnh đánh số `0..n−1`.
> Bài nhiều đáp án hợp lệ (ex02, ex04): `check` kiểm tra tính hợp lệ, không cần trùng đáp án mẫu.

---

## 🟢 Cơ bản

### ex01 · Có học xong tất cả môn?
`prerequisites[i] = [a, b]` nghĩa là phải học `b` **trước** `a`.
```java
boolean canFinish(int numCourses, int[][] prerequisites)
```
- Ràng buộc: `1 ≤ numCourses ≤ 10⁵`, `0 ≤ |prerequisites| ≤ 2·10⁵`, các cặp `[a, b]` khác nhau, `a ≠ b`.
- Ví dụ: `2, [[1,0]]` → `true` · `2, [[1,0],[0,1]]` → `false`. (LeetCode 207)

### ex02 · Thứ tự học các môn
Như ex01, trả về **một** thứ tự học hợp lệ; có chu trình → `[]`.
```java
int[] findOrder(int numCourses, int[][] prerequisites)
```
- Ràng buộc: như ex01.
- Ví dụ: `2, [[1,0]]` → `[0,1]` · `4, [[1,0],[2,0],[3,1],[3,2]]` → `[0,1,2,3]` hoặc `[0,2,1,3]` · `2, [[1,0],[0,1]]` → `[]`. (LeetCode 210)

### ex03 · Thứ tự topo nhỏ nhất theo từ điển
Cạnh `[u, v]` nghĩa là `u → v` (`u` trước `v`). Trả về thứ tự topo **nhỏ nhất theo từ điển** (so từng phần tử từ trái sang phải) — đáp án duy nhất. Có chu trình → `[]`.
```java
int[] lexSmallestTopo(int n, int[][] edges)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |edges| ≤ 2·10⁵`, không khuyên, không cạnh trùng.
- Ví dụ: `4, [[3,1],[2,1],[0,3]]` → `[0,2,3,1]` · `5, [[4,0],[3,0]]` → `[1,2,3,4,0]` · `3, []` → `[0,1,2]`.

---

## 🟡 Kết hợp

### ex04 · Bảng chữ cái người ngoài hành tinh
`words` đã được **sắp tăng dần theo bảng chữ cái lạ**. Suy ra một thứ tự các chữ cái. Trả về chuỗi gồm **mỗi chữ cái xuất hiện trong `words` đúng một lần**; không tồn tại thứ tự hợp lệ → `""`.
```java
String alienOrder(String[] words)
```
- Ràng buộc: `1 ≤ |words| ≤ 10⁵`, mỗi từ gồm `a–z`, độ dài `1..100`, tổng độ dài ≤ `10⁶`. Hai từ giống nhau đứng cạnh nhau là hợp lệ. Từ dài đứng trước chính tiền tố của nó → không hợp lệ.
- Ví dụ: `["wrt","wrf","er","ett","rftt"]` → `"wertf"` (hoặc thứ tự hợp lệ khác) · `["z","x","z"]` → `""` · `["abc","ab"]` → `""`. (LeetCode 269)
- Mục tiêu: chỉ so các cặp từ **kề nhau**. So mọi cặp là O(W²) và sẽ quá giờ.

### ex05 · Số học kỳ tối thiểu
`relations[i] = [prev, next]`: học `prev` xong mới học `next`. Mỗi học kỳ học được **bao nhiêu môn cũng được** miễn đã đủ tiên quyết từ các kỳ **trước**. Số học kỳ tối thiểu để học hết `n` môn; có chu trình → `-1`.
```java
int minimumSemesters(int n, int[][] relations)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |relations| ≤ 2·10⁵`, không khuyên, không trùng.
- Ví dụ: `3, [[0,2],[1,2]]` → `2` · `3, [[0,1],[1,2],[2,0]]` → `-1` · `1, []` → `1`. (LeetCode 1136, đánh số từ 0)

### ex06 · Đỉnh an toàn cuối cùng
`graph[u]` là danh sách các đỉnh mà `u` trỏ tới (có hướng). Đỉnh **an toàn** nếu *mọi* đường đi xuất phát từ nó đều kết thúc sau hữu hạn bước (không rơi vào chu trình). Trả về các đỉnh an toàn, **tăng dần**.
```java
List<Integer> eventualSafeNodes(int[][] graph)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, tổng số cạnh ≤ `4·10⁵`, `graph[u]` không trùng; **khuyên được phép** (đỉnh tự trỏ vào mình không an toàn).
- Ví dụ: `[[1,2],[2,3],[5],[0],[5],[],[]]` → `[2,4,5,6]` · `[[0]]` → `[]`. (LeetCode 802)

---

## 🔴 Thực tế

### ex07 · Thứ tự chạy migration
> "Mỗi migration có tên duy nhất và có thể yêu cầu migration khác chạy trước. Tool cần in danh sách chạy tuần tự. Khi có nhiều migration cùng sẵn sàng, chạy cái có tên **nhỏ nhất theo thứ tự ký tự** trước (để kết quả ổn định giữa các máy). Có vòng phụ thuộc → trả danh sách rỗng."

```java
String[] migrationOrder(String[] names, String[][] deps)
```
- `deps[i] = [name, requires]`: `name` chạy sau `requires`. Có thể có dòng lặp lại.
- Ràng buộc: `1 ≤ n ≤ 10⁵`, tên là ASCII (`a–z`, `0–9`, `_`), so sánh theo mã ký tự (`compareTo` của Java, `<` của Python/JS), `0 ≤ |deps| ≤ 2·10⁵ + 1`; mọi tên trong `deps` đều có trong `names`; không có khuyên.
- Ví dụ: `["b","a","c"], [["c","a"]]` → `["a","b","c"]` · `["m2","m1"], [["m1","m2"]]` → `["m2","m1"]` · `["a","b"], [["a","b"],["b","a"]]` → `[]`.

### ex08 · Thời gian build tối thiểu
> "Mô-đun `v` cần `duration[v]` phút build và chỉ build được khi mọi mô-đun nó phụ thuộc đã build xong. Có thể build **song song không giới hạn số worker**. Tổng thời gian tối thiểu để build hết là bao nhiêu?"

```java
long minBuildTime(int n, int[][] deps, int[] duration)
```
- `deps[i] = [u, v]`: `u` phải xong trước khi `v` bắt đầu. Đồ thị bảo đảm là DAG.
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |deps| ≤ 2·10⁵`, `1 ≤ duration[v] ≤ 10⁹`. Tổng có thể tới `10¹⁴` → dùng `long`.
- Ví dụ: `3, [[0,2],[1,2]], [3,2,5]` → `8` · không phụ thuộc, `[4,9,2]` → `9`. (LeetCode 2050)

---

## ❓ Câu hỏi quy mô (làm sau khi qua ex02 và ex03)

1. **Dự đoán** (viết ra giấy): `findOrder` ở `n = 10⁵` mất ~bao nhiêu ms? Ở `n = 10⁶` (m tỉ lệ)? Big-O?
2. `lexSmallestTopo` dùng heap: ở `n = 10⁶` thời gian tăng bao nhiêu lần so với `n = 10⁵` — ×10 hay ×12? Vì sao?
3. `node tools/bench.ts lessons/I07-topological-sort 03 --scales s,m,l` và so với `02`: hằng số của heap lớn hơn bao nhiêu? Số mũ ước lượng của hai bài khác nhau thế nào?
