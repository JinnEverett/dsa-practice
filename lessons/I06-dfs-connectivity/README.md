# I06 · DFS & connectivity

## Sau buổi này bạn sẽ
- Viết DFS **đệ quy** và **vòng lặp** (stack tường minh), biết khi nào bắt buộc dùng vòng lặp.
- Đếm **thành phần liên thông**, flood fill, đo diện tích đảo.
- Phát hiện **chu trình**: vô hướng (theo cạnh cha) và có hướng (**3 màu**).
- Kiểm tra **hai phía** bằng tô màu; dùng **DFS từ biên** (đảo bị bao, nước chảy).

## 1. DFS: đi sâu hết đường rồi mới quay lại

```
        0               DFS từ 0 (hàng xóm theo thứ tự): 0 → 1 → 3 → (quay lại) → 4 → (quay lại) → 2
      /   \             Thứ tự "vào":  0 1 3 4 2
     1     2            Thứ tự "ra" (post-order):  3 4 1 2 0
    / \
   3   4
```

```ts
// đệ quy
function dfs(u: number) {
  seen[u] = 1;
  for (const v of adj[u]) if (!seen[v]) dfs(v);
}
```

DFS và BFS (I05) đều duyệt O(n + m) và đều đếm được thành phần liên thông. Khác biệt: BFS cho **khoảng cách ngắn nhất**; DFS cho **cấu trúc** — chu trình, thứ tự hoàn thành (post-order, dùng ở I07), cầu/khớp (A07).

## 2. Đệ quy hay vòng lặp? Giới hạn độ sâu

Stack gọi hàm của Node mặc định chịu khoảng **7 000–12 000 tầng** (đo trên Node 24: ~12 500 với hàm 0 tham số, ~7 000 với hàm 4 tham số). Đồ thị hình đường thẳng 10⁵ đỉnh, hoặc lưới 1000×1000 cùng một màu, đều vượt xa mức đó → `RangeError: Maximum call stack size exceeded`. Python mặc định 1 000 tầng, Java ~10–20 nghìn tầng tùy frame.

Đổi sang stack tường minh — mảng cỡ `n` là đủ nếu **đánh dấu `seen` ngay lúc push** (mỗi đỉnh vào stack đúng một lần):

```ts
const stack = new Int32Array(n);
let sp = 0;
seen[s] = 1; stack[sp++] = s;
while (sp) {
  const u = stack[--sp];
  for (const v of adj[u]) if (!seen[v]) { seen[v] = 1; stack[sp++] = v; }
}
```

Chú ý: kiểu này cho một thứ tự duyệt *hợp lệ* nhưng không đúng từng bước với DFS đệ quy. Khi cần thời điểm "ra" (chu trình có hướng, post-order) hãy giữ **con trỏ cạnh** cho mỗi đỉnh (`ptr[u]` = cạnh kế tiếp của `u` sẽ xét) và chỉ pop khi hết cạnh:

```ts
while (sp) {
  const u = stack[sp - 1];            // chưa pop
  if (ptr[u] === end[u]) { /* RA khỏi u */ sp--; continue; }
  const v = to[ptr[u]++];
  if (!seen[v]) { /* VÀO v */ seen[v] = 1; stack[sp++] = v; }
}
```

## 3. Thành phần liên thông & lưới
Lặp qua mọi đỉnh; mỗi lần gặp đỉnh chưa thăm là một thành phần mới → DFS đánh dấu cả thành phần. **Đỉnh cô lập cũng là một thành phần.**
Lưới là đồ thị ẩn (như I05): flood fill, đếm đảo, diện tích đảo lớn nhất đều là "đếm / đo thành phần liên thông trên lưới".

## 4. Phát hiện chu trình

**Vô hướng.** Khi duyệt từ `u` gặp `v` đã thăm: nếu cạnh đó không phải **cạnh vừa đi tới u** thì có chu trình. Mỗi cạnh vô hướng xuất hiện hai lần (u→v và v→u) nên phải bỏ cạnh cha. Bỏ theo **chỉ số cạnh**, không theo đỉnh cha — nếu không, hai cạnh song song u–v (chu trình độ dài 2) bị bỏ sót. Mẹo: rừng ⇔ `m = n − số thành phần`.

**Có hướng — 3 màu.**
```
trắng (0): chưa thăm      xám (1): đang nằm trên đường DFS hiện tại      đen (2): đã xong
```
Cạnh `u → v` mà `v` **xám** là cạnh ngược → chu trình. `v` đen thì an toàn (đã xong, không quay về `u`). Dùng một mảng `visited` hai trạng thái sẽ báo sai trên "kim cương" `a→b, a→c, b→d, c→d`.

## 5. Hai phía (bipartite)
Tô mỗi đỉnh một trong hai màu sao cho mọi cạnh nối hai màu khác nhau. DFS/BFS: tô hàng xóm màu ngược lại; gặp hàng xóm đã tô **cùng màu** → không phải hai phía. Tương đương: **không có chu trình lẻ**. Đồ thị không liên thông → tô từ mỗi thành phần.

## 6. DFS từ biên: đảo chiều bài toán
"Vùng O bị bao quanh bởi X" và "ô nào chảy được ra cả hai đại dương" đều khó nếu hỏi từ từng ô. Đảo chiều: DFS **từ biên / từ đích** đánh dấu những ô thỏa, phần còn lại là đáp án (cùng ý tưởng multi-source BFS ở I05).

## 7. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Stack | mảng + `push/pop`, hoặc `Int32Array` + `sp` | `list.append/pop` | `ArrayDeque<Integer>` (`push/pop`) hoặc `int[]` + `sp` |
| Đệ quy sâu | ~7–12 nghìn tầng tràn | `sys.setrecursionlimit` (runner đặt ≈ 12 000), vẫn nên lặp | stack mặc định; `new Thread(null, r, "", 1<<28)` nếu bắt buộc |
| Danh sách kề | `number[][]` / CSR | `[[] for _ in range(n)]` | `List<Integer>[]` |
| Màu / visited | `Uint8Array(n)` | `[0] * n` | `byte[]` / `boolean[]` |

## 8. Dấu hiệu nhận biết
"có tồn tại chu trình", "nhóm / cụm / thành phần", "vùng liên thông", "chia hai tập sao cho...", "bị bao quanh", "đếm vùng", "kéo thêm bao nhiêu dây để mọi thứ thông nhau".

## 9. Bẫy
1. **Đệ quy trên input 10⁵–10⁶** → tràn stack (test của module này cố ý có đường 10⁵ đỉnh, đảo "rắn", ảnh một màu 600×600).
2. Flood fill khi màu mới trùng màu gốc → lặp vô hạn.
3. Chu trình vô hướng: bỏ qua theo đỉnh cha thay vì cạnh cha.
4. Chu trình có hướng: dùng `visited` hai trạng thái.
5. Hai phía: chỉ tô từ đỉnh 0, bỏ sót thành phần khác.
6. Đếm thành phần: quên đỉnh cô lập.
7. Lấy `isConnected[i][j]` khi `i == j` làm cạnh (khuyên) — vô hại nhưng đừng đếm vào số cạnh.

## 10. Độ phức tạp
Mọi bài trong module: **O(n + m)** (lưới: O(R·C); ma trận kề `n×n`: O(n²)). Bộ nhớ O(n) cho `seen` và stack.
