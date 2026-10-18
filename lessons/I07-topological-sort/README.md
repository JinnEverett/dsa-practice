# I07 · Topological sort

## Sau buổi này bạn sẽ
- Sắp xếp topo một **DAG** bằng **Kahn** (in-degree + queue) và biết khi nào dùng **DFS post-order**.
- Phát hiện **chu trình** như một sản phẩm phụ: Kahn không xếp hết n node ⇔ có chu trình.
- Biến thể hay gặp: thứ tự **nhỏ nhất theo từ điển** (min-heap), tính **theo tầng** (số kỳ / thời gian song song), **đường dài nhất trên DAG**, đảo chiều đồ thị để tìm node "an toàn".

## 1. Bài toán

Cho đồ thị có hướng, cạnh `u → v` nghĩa là "**u phải đứng trước v**". Một **thứ tự topo** là cách xếp mọi node thành hàng sao cho mọi cạnh đều đi từ trái sang phải. Tồn tại ⇔ đồ thị là **DAG** (không có chu trình). Thường có **nhiều** thứ tự hợp lệ.

```
   0 ──► 1 ──► 3          thứ tự hợp lệ:  0 1 2 3 4
   │           ▲                           0 2 1 4 3
   └──► 2 ──► 4 ┘                          (3 phải sau cả 1 và 4, 4 sau 2)
```

Dấu hiệu nhận biết: "A phải xong trước B", "tiền đề", "phụ thuộc", "thứ tự build / migration / học", "có vòng lặp phụ thuộc không", "ít nhất bao nhiêu bước / kỳ nếu làm song song".

## 2. Kahn: bỏ dần node không còn ai chặn

`indeg[v]` = số cạnh đi vào v = số việc v còn phải chờ. Node có `indeg = 0` làm được ngay.

```ts
function topo(n: number, edges: number[][]): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) { adj[u].push(v); indeg[v]++; }

  const order: number[] = [];                       // vừa là kết quả vừa là queue
  for (let i = 0; i < n; i++) if (indeg[i] === 0) order.push(i);
  for (let head = 0; head < order.length; head++) { // KHÔNG dùng shift(): O(n) mỗi lần
    for (const v of adj[order[head]]) if (--indeg[v] === 0) order.push(v);
  }
  return order.length === n ? order : [];            // thiếu node ⇒ có chu trình
}
```

```
indeg:  0:0  1:1  2:1  3:2  4:1          queue: [0]
bỏ 0  → indeg 1:0, 2:0                   queue: [0,1,2]
bỏ 1  → indeg 3:1                        queue: [0,1,2]
bỏ 2  → indeg 4:0                        queue: [0,1,2,4]
bỏ 4  → indeg 3:0                        queue: [0,1,2,4,3]   đủ 5 node ✓
```

Có chu trình `a → b → a`: cả hai luôn có `indeg ≥ 1`, không bao giờ vào queue ⇒ kết quả thiếu node. Đây cũng là cách phát hiện chu trình trong đồ thị có hướng.

**Cạnh lặp:** `indeg` đếm theo *cạnh*, giảm cũng theo cạnh ⇒ vẫn đúng. Nhưng khi bạn tự **khử** cạnh trùng ở một nơi (đếm tăng) thì phải khử ở cả nơi giảm — bẫy kinh điển của bài người ngoài hành tinh.

## 3. DFS post-order

Đệ quy từng node, **sau khi** duyệt hết con mới ghi node vào danh sách; đảo ngược danh sách ra thứ tự topo. Phát hiện chu trình bằng 3 màu: trắng (chưa thăm), xám (đang nằm trên đường đệ quy), đen (xong). Gặp cạnh tới node **xám** ⇒ chu trình.

```ts
// color: 0 trắng, 1 xám, 2 đen
function dfs(u: number): boolean {                  // false nếu thấy chu trình
  color[u] = 1;
  for (const v of adj[u]) {
    if (color[v] === 1) return false;
    if (color[v] === 0 && !dfs(v)) return false;
  }
  color[u] = 2; post.push(u);
  return true;
}
```

**Cảnh báo quy mô:** chuỗi phụ thuộc dài 10⁵ ⇒ đệ quy sâu 10⁵ tầng ⇒ TS tràn stack (~10⁴ tầng), Python (runner đặt ≈ 12 000) cũng vậy. Hoặc viết DFS bằng stack tường minh, hoặc dùng Kahn. Vì vậy Kahn là mặc định ở backend.

## 4. Các biến thể

| Yêu cầu | Làm thế nào |
|---|---|
| Có chu trình không | Kahn xếp được < n node |
| Một thứ tự bất kỳ | Kahn (queue) hoặc DFS post-order đảo |
| **Nhỏ nhất theo từ điển** | Kahn nhưng thay queue bằng **min-heap**: mỗi bước lấy node nhỏ nhất đang sẵn sàng. O((n+m) log n) |
| **Số tầng / số kỳ song song** | Kahn **theo lớp**: xử lý trọn một lớp rồi mới tăng bộ đếm |
| **Đường dài nhất trên DAG** (thời gian build) | DP theo thứ tự topo: `finish[v] = dur[v] + max finish[u]` hoặc `start[v] = max(start[v], finish[u])` |
| Node không dẫn tới chu trình | Đảo chiều cạnh, Kahn từ các node out-degree 0 |
| Thứ tự chữ cái / ràng buộc ngầm | Suy ra cạnh từ dữ liệu (so từ liền kề), rồi Kahn |

Đường **ngắn** nhất trên DAG cũng làm được trong O(n+m) bằng cùng cách (DP theo thứ tự topo) — nhanh hơn Dijkstra.

## 5. Độ phức tạp

| | Thời gian | Bộ nhớ |
|---|---|---|
| Kahn / DFS post-order | O(n + m) | O(n + m) |
| Kahn + heap | O((n + m) log n) | O(n + m) |

## 6. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Queue cho Kahn | mảng + chỉ số `head` (không `shift()`) | `collections.deque` | `ArrayDeque<Integer>` |
| Min-heap | tự cài (`Heap` ở I04) | `heapq` | `PriorityQueue` |
| Danh sách kề | `number[][]` hoặc mảng phẳng (CSR) | `list[list[int]]` | `List<Integer>[]` / `int[]` CSR |
| Đệ quy sâu 10⁵ | tràn stack | tràn (runner ≈ 12 000) | có thể tràn với stack mặc định |
| Tổng thời gian lớn | `Float64Array` / number tới 2⁵³ | int tùy ý | **`long`** (10⁵ × 10⁹ = 10¹⁴ tràn `int`) |

## 7. Bẫy
1. **Đảo chiều cạnh:** `[a, b]` trong "course schedule" là "học **b** trước **a**" ⇒ cạnh `b → a`. Đọc kỹ đề, viết ví dụ nhỏ ra giấy.
2. `queue.shift()` O(n) ⇒ Kahn thành O(n²) ở n = 10⁵.
3. Trả về thứ tự **dở dang** khi có chu trình thay vì báo lỗi / rỗng.
4. Khử cạnh trùng ở bước đếm in-degree nhưng không ở bước giảm (hoặc ngược lại) ⇒ node kẹt mãi.
5. Quên node cô lập (không có cạnh nào): vẫn phải xuất hiện trong kết quả.
6. Thứ tự "theo tên" nhưng so bằng `localeCompare` hoặc so số thay vì chuỗi (`"u_10" < "u_2"`).
7. Tìm "min tiếp theo" bằng quét tuyến tính / sort lại mỗi bước ⇒ O(n²) hoặc O(n² log n).
