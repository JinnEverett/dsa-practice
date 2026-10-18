# I05 · Graph & BFS

## Sau buổi này bạn sẽ
- Biểu diễn đồ thị bằng **danh sách kề**, ma trận kề, danh sách cạnh — và chọn đúng theo ràng buộc.
- Nhìn **lưới 2D** và **không gian trạng thái** (ổ khóa, word ladder) như một đồ thị.
- Viết BFS đúng: đánh dấu khi **enqueue**, đường ngắn nhất không trọng số, **multi-source**, chạy **theo tầng**, khôi phục đường bằng `parent`.

## 1. Biểu diễn đồ thị

```
  0 — 1        danh sách kề        ma trận kề (n×n)      danh sách cạnh
  |   |        0: [1, 2]           0 1 1 0               [[0,1],[0,2],[1,3],[2,3]]
  2 — 3        1: [0, 3]           1 0 0 1
               2: [0, 3]           1 0 0 1
               3: [1, 2]           0 1 1 0
```

| | Bộ nhớ | Có cạnh (u,v)? | Duyệt hàng xóm của u | Dùng khi |
|---|---|---|---|---|
| Danh sách kề | O(n + m) | O(deg u) | **O(deg u)** | gần như mọi bài (đồ thị thưa) |
| Ma trận kề | O(n²) | **O(1)** | O(n) | n ≤ ~2000, đồ thị dày, cần hỏi cạnh nhanh |
| Danh sách cạnh | O(m) | O(m) | O(m) | đầu vào thô; Kruskal / Union-Find |

Đề thường cho **danh sách cạnh** → bước đầu tiên là dựng danh sách kề (O(n + m)). Quét toàn bộ cạnh cho từng đỉnh là O(n·m) — bẫy phổ biến nhất của bài này.

**Lưới là đồ thị ẩn:** ô `(r, c)` có hàng xóm `(r±1, c)`, `(r, c±1)` (hoặc 8 hướng). Không cần dựng gì cả — dùng mảng hướng và kiểm tra biên. Mã hóa ô thành một số `id = r * C + c` để dùng mảng phẳng cho `dist` / `seen`.

## 2. BFS và vì sao nó cho đường ngắn nhất

BFS duyệt theo **tầng**: tất cả đỉnh cách nguồn 0 cạnh, rồi 1 cạnh, rồi 2 cạnh... Hàng đợi FIFO bảo đảm mọi đỉnh ở tầng `d` được lấy ra **trước** mọi đỉnh ở tầng `d + 1`. Vậy lần đầu ta chạm một đỉnh chính là qua đường ngắn nhất (khi mọi cạnh có độ dài 1).

```
nguồn S:   tầng 0: S
           tầng 1: a b          queue: [S] → [a b] → [b c d] → [c d e] ...
           tầng 2: c d e
```

```ts
function bfs(adj: number[][], src: number): Int32Array {
  const dist = new Int32Array(adj.length).fill(-1);   // -1 = chưa thăm → vừa là visited
  const q = new Int32Array(adj.length);               // mỗi đỉnh vào hàng đợi đúng 1 lần → kích thước n là đủ
  let head = 0, tail = 0;
  dist[src] = 0; q[tail++] = src;
  while (head < tail) {
    const u = q[head++];
    for (const v of adj[u]) if (dist[v] < 0) { dist[v] = dist[u] + 1; q[tail++] = v; }   // đánh dấu lúc ENQUEUE
  }
  return dist;
}
```

**Đánh dấu khi enqueue, không phải khi dequeue.** Nếu đánh dấu lúc lấy ra, một đỉnh có thể bị đẩy vào hàng đợi nhiều lần (mỗi hàng xóm đẩy một lần) → hàng đợi phình to, tệ nhất O(m) phần tử thay vì n.

## 3. Các biến thể

**BFS theo tầng** (cần biết số bước, hoặc xử lý cả tầng một lượt): chốt `levelEnd = tail` đầu mỗi vòng ngoài, rồi lấy đúng `levelEnd - head` phần tử.

**Multi-source BFS:** đưa **nhiều** nguồn vào hàng đợi ngay từ đầu với `dist = 0`. Một lần BFS thay vì chạy từ từng nguồn. Dùng cho "khoảng cách tới X gần nhất" (cam thối lan, khoảng cách tới số 0, kho gần nhất): đảo chiều bài toán — lan **từ đích**, không lan từ mỗi điểm.

**Khôi phục đường:** ghi `parent[v] = u` lúc enqueue; từ đích lần ngược về nguồn rồi đảo. Đừng lưu cả đường đi trong hàng đợi (O(n²) bộ nhớ).

**BFS không gian trạng thái:** đỉnh = *trạng thái* (ổ khóa 4 số: 10⁴ trạng thái, 8 láng giềng; word ladder: mỗi từ là một đỉnh). Bài toán "số bước ít nhất để biến X thành Y" với các phép biến đổi cùng giá nghĩa là BFS. Điều kiện quyết định: **trạng thái phải đủ thông tin** — robot được phá `k` vật cản thì ô `(r, c)` còn `j` lần phá là một trạng thái khác ô đó còn `j − 1` lần.

## 4. Dấu hiệu nhận biết
"số bước / số lần ít nhất", đồ thị hoặc lưới **không trọng số**, "lan ra từng đợt (phút, ngày)", "gần nhất trong nhiều nguồn", "biến đổi chuỗi/trạng thái từng bước một".
Có trọng số khác nhau → không dùng BFS thường (Dijkstra, A06).

## 5. Công cụ có sẵn theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Hàng đợi | mảng + `head` (hoặc `Int32Array` cỡ n) — **tránh `shift()`** | `collections.deque`, `popleft()` | `ArrayDeque<Integer>` |
| Danh sách kề | `number[][]` / CSR | `defaultdict(list)` / `[[] for _ in range(n)]` | `List<Integer>[]` / `List<List<Integer>>` |
| Visited | `Uint8Array` / `Int32Array.fill(-1)` | `[False] * n`, `set` | `boolean[]` |
| Hướng đi | `const DIRS = [[1,0],[-1,0],[0,1],[0,-1]]` | tuple tương tự | `int[][] DIRS` |

Bẫy Python: `list.pop(0)` là O(n) → dùng `deque`; Python chậm hơn ~30×, lưới 10⁶ ô cần mã hóa `r*C + c` và tránh tuple trong vòng nóng.
Bẫy Java: `int[]` trong `ArrayDeque<int[]>` tạo object mỗi bước — mã hóa trạng thái thành `int` khi có thể.

## 6. Bẫy
1. **Dựng danh sách kề bằng cách quét mọi cạnh cho từng đỉnh** → O(n·m).
2. **Đánh dấu khi dequeue** → đỉnh vào hàng đợi nhiều lần.
3. `queue.shift()` trên mảng lớn là O(n) → dùng chỉ số `head`.
4. Đếm tầng sai một đơn vị (tầng cuối không lan thêm thì không tính thêm một phút).
5. Quên trường hợp `src === dst` (đáp án 0), đỉnh không tới được (−1).
6. BFS trạng thái mà `visited` thiếu một chiều (ví dụ chỉ theo ô, bỏ số lần phá còn lại) → đáp án sai.
7. Đệ quy thay cho BFS trên lưới 10⁶ ô → tràn stack (xem I06).

## 7. Độ phức tạp
BFS trên danh sách kề: **O(n + m)** thời gian, **O(n)** bộ nhớ phụ. Lưới R×C: O(R·C). BFS trạng thái: O(số trạng thái × số chuyển).
