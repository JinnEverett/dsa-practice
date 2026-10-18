# I08 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I08-union-find [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I08-union-find 01`

**Pass:** ex01 qua `check` (DSU tự cài) **và** ≥ 5/7 bài còn lại, ≤ 3 hint, và trả lời được **câu hỏi quy mô** cuối file.

> ex01: **tự cài**, đạt Perf thì cần cả nén đường lẫn gộp theo size (test gộp thành chuỗi dài rồi `find` ở đầu chuỗi). ex02–ex08 dùng lớp DSU của bạn (TS: viết `answers/uf.ts` rồi `import`; Python/Java: chép lớp vào đầu file).
> Ex04 không có thang `n` để đo Big-O (chỉ 26 chữ cái) — tự giác dùng DSU.

---

## 🟢 Cơ bản

### ex01 · Tự cài Union-Find (class)
```java
class UnionFind {
  UnionFind(int n)               // n nhóm {0}, {1}, ..., {n-1}
  int find(int x)                // đại diện của nhóm chứa x
  boolean union(int a, int b)    // gộp; false nếu đã cùng nhóm
  boolean connected(int a, int b)
  int count()                    // số nhóm hiện tại
}
```
- `find(x)` có thể trả **bất kỳ** phần tử nào của nhóm (đại diện tuỳ bạn), miễn nhất quán: nếu giữa hai lần gọi không có `union` thành công nào, hai phần tử cùng nhóm phải cho **cùng** đại diện, và hai nhóm khác nhau phải cho đại diện khác nhau.
- Ràng buộc: `1 ≤ n ≤ 2·10⁵`, tối đa `4·10⁵` thao tác, mọi chỉ số trong `[0, n)`.
- Ví dụ: `UnionFind(5); union(0,1) → true; union(1,2) → true; connected(0,2) → true; count() → 3; union(0,2) → false`.

### ex02 · Cạnh thừa
Đồ thị gồm `n` đỉnh `0..n−1` và đúng `n` cạnh vô hướng; nó liên thông và có đúng một chu trình (tức một cây cộng một cạnh). Trả về một cạnh có thể bỏ để còn lại cây; nếu nhiều đáp án, trả cạnh **xuất hiện sau cùng** trong `edges`.
```java
int[] findRedundantConnection(int[][] edges)
```
- Ràng buộc: `3 ≤ n ≤ 10⁵`, không khuyên, không cạnh trùng. Giữ nguyên thứ tự `[u, v]` như đầu vào.
- Ví dụ: `[[0,1],[0,2],[1,2]]` → `[1,2]` · `[[0,1],[1,2],[2,3],[0,3],[0,4]]` → `[0,3]`. (LeetCode 684, đánh số từ 0)

### ex03 · Số thành phần sau mỗi cạnh
```java
int[] componentsAfterEach(int n, int[][] edges)
```
- Bắt đầu với `n` đỉnh rời nhau; trả về mảng độ dài `|edges|`: phần tử `i` là số thành phần liên thông **sau khi thêm cạnh `i`**.
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ |edges| ≤ 2·10⁵`; cạnh có thể **trùng** hoặc là **khuyên** (`[u, u]`).
- Ví dụ: `4, [[0,1],[2,3],[1,2]]` → `[3,2,1]` · `2, [[0,0],[0,1],[1,0]]` → `[2,1,1]`.

---

## 🟡 Kết hợp

### ex04 · Hệ phương trình bằng / khác
Mỗi phương trình có dạng `"a==b"` hoặc `"a!=b"` (đúng 4 ký tự, biến là chữ thường). Có tồn tại cách gán giá trị cho các biến thỏa mọi phương trình?
```java
boolean equationsPossible(String[] equations)
```
- Ràng buộc: `1 ≤ |equations| ≤ 10⁵`.
- Ví dụ: `["a==b","b!=a"]` → `false` · `["b==a","a==b"]` → `true` · `["a!=b","b==c","a==c"]` → `false`. (LeetCode 990)

### ex05 · Gộp tài khoản
`accounts[i] = [tên, email₁, email₂, ...]`. Hai tài khoản thuộc cùng một người nếu **chung ít nhất một email** (bắc cầu). Hai người khác nhau có thể trùng tên. Trả về danh sách tài khoản đã gộp; mỗi phần tử là `[tên, các email đã khử trùng và sắp tăng dần theo mã ký tự]`. Thứ tự các tài khoản tùy ý.
```java
List<List<String>> accountsMerge(List<List<String>> accounts)
```
- Ràng buộc: `1 ≤ n ≤ 2·10⁴` tài khoản, mỗi tài khoản `1..10` email; cùng một email luôn đi với cùng một tên; chuỗi ASCII.
- Ví dụ: `[["John","a","b"],["John","a","c"],["Mary","m"],["John","j"]]` → `[["John","a","b","c"],["Mary","m"],["John","j"]]`. (LeetCode 721)

### ex06 · Đảo xuất hiện dần
Lưới `m × n` ban đầu toàn nước. Với mỗi vị trí trong `positions`, biến ô đó thành đất rồi báo số đảo hiện có (đảo = nhóm ô đất liên thông 4 hướng). Vị trí có thể lặp lại; thêm đất vào ô đã là đất không đổi gì.
```java
List<Integer> numIslands2(int m, int n, int[][] positions)
```
- Ràng buộc: `1 ≤ m, n ≤ 1000` (`m·n ≤ 10⁶`), `0 ≤ |positions| ≤ 10⁵`.
- Ví dụ: `m=3, n=3, [[0,0],[0,1],[1,2],[2,1]]` → `[1,1,2,3]` · `2, 2, [[0,0],[0,0],[1,1],[0,1]]` → `[1,1,2,1]`. (LeetCode 305)

---

## 🔴 Thực tế

### ex07 · Thời điểm mọi người quen nhau
> "Nền tảng mạng xã hội ghi nhật ký kết bạn `[timestamp, x, y]`: lúc `timestamp`, người `x` và `y` kết bạn (quan hệ hai chiều). Quan hệ gián tiếp cũng tính là quen nhau. Thời điểm sớm nhất mà *tất cả* mọi người đều quen nhau (trực tiếp hoặc gián tiếp)? Không bao giờ → `-1`."

```java
int earliestAcq(int[][] logs, int n)
```
- Ràng buộc: `2 ≤ n ≤ 10⁵`, `0 ≤ |logs| ≤ 2·10⁵ `, mọi `timestamp` khác nhau, `0 ≤ timestamp ≤ 10⁹`, `x ≠ y`. **Log không được sắp xếp sẵn.**
- Ví dụ: `n=4, [[0,2,0],[1,0,1],[3,0,3],[4,1,2],[7,3,1]]` → `3` · `n=3, [[1,0,1]]` → `-1`. (LeetCode 1101)

### ex08 · Chuỗi nhỏ nhất sau các hoán đổi
> "Chuỗi `s` có thể hoán đổi hai ký tự ở vị trí `a`, `b` cho mỗi cặp trong `pairs`, mỗi cặp dùng **bao nhiêu lần cũng được**, theo thứ tự tùy ý. Chuỗi nhỏ nhất theo từ điển có thể thu được?"

```java
String smallestStringWithSwaps(String s, int[][] pairs)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁵`, chữ thường; `0 ≤ |pairs| ≤ 10⁵`; chỉ số trong `[0, |s|)` (có thể `a == b`).
- Ví dụ: `"dcab", [[0,3],[1,2]]` → `"bacd"` · `"dcab", [[0,3],[1,2],[0,2]]` → `"abcd"`. (LeetCode 1202)

---

## ❓ Câu hỏi quy mô (làm sau khi qua ex01)

1. **Dự đoán**: `m = 2·10⁵` thao tác xen kẽ `union(i, i+1)` rồi `find` ở đầu chuỗi — với DSU **không** nén đường, **không** gộp theo size, mỗi `find` ở đầu chuỗi mất khoảng bao nhiêu bước? Tổng bao nhiêu phép? (Ước lượng ~10⁸ phép/giây.)
2. Thêm chỉ **nén đường** (bỏ gộp theo size) rồi chạy lại `check` — Perf qua không? Thêm chỉ **gộp theo size** (bỏ nén đường) thì sao?
3. `node tools/bench.ts lessons/I08-union-find 01 --scales s,m,l`: số mũ ước lượng có ≈ 1 không? Ở `n = 10⁶` khác `n = 10⁵` bao nhiêu lần?
