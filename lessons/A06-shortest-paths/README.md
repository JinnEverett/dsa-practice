# A06 · Shortest paths

## Sau buổi này bạn sẽ
- Chọn thuật toán đường đi ngắn nhất **theo ràng buộc**: BFS / 0-1 BFS / Dijkstra / Bellman-Ford / Floyd-Warshall.
- Cài **Dijkstra với heap + lazy deletion** (dùng `Heap` tự cài ở I04).
- Phát hiện **chu trình âm**; giải bài "tối đa k chặng" bằng Bellman-Ford theo vòng.
- Mô hình **minimax path** (cực tiểu hóa cạnh/ô lớn nhất trên đường đi) bằng Dijkstra biến thể.

## 1. Chọn thuật toán

| Đồ thị | Thuật toán | Time | Ghi chú |
|---|---|---|---|
| Không trọng số (hoặc mọi cạnh = 1) | BFS | O(V + E) | I05 |
| Trọng số ∈ {0, 1} | **0-1 BFS** (deque) | O(V + E) | cạnh 0 → `pushFront`, cạnh 1 → `pushBack` |
| Trọng số ≥ 0 | **Dijkstra** (heap) | O((V + E) log V) | không dùng được với cạnh âm |
| Có cạnh âm | **Bellman-Ford** | O(V · E) | phát hiện chu trình âm |
| Mọi cặp, V ≤ ~400 | **Floyd-Warshall** | O(V³) | 3 vòng for, đơn giản |
| DAG | topo + DP | O(V + E) | I07 |

Ràng buộc → lựa chọn: `V, E ~ 2·10⁵` ⇒ chỉ Dijkstra/BFS; `V ≤ 100` ⇒ Floyd thoải mái.

## 2. Dijkstra

Bất biến: khi một đỉnh được **lấy ra khỏi heap lần đầu**, `dist` của nó là cuối cùng (vì mọi cạnh ≥ 0).

```ts
const dist = new Array(n).fill(Infinity); dist[s] = 0;
const pq = new Heap<[number, number]>((a, b) => a[0] < b[0]);   // [khoảng cách, đỉnh]
pq.push([0, s]);
while (pq.size) {
  const [d, u] = pq.pop()!;
  if (d > dist[u]) continue;                 // lazy deletion: bản cũ đã lỗi thời
  for (const [v, w] of adj[u])
    if (d + w < dist[v]) { dist[v] = d + w; pq.push([dist[v], v]); }
}
```
**Lazy deletion** thay cho `decrease-key` (heap tự cài không có): đẩy bản mới, bỏ bản cũ khi lấy ra. Heap chứa ≤ E phần tử ⇒ O(E log E) = O(E log V).
Bản dùng mảng quét tìm min là **O(V²)** — chấp nhận được với V ≤ 5000, chết ở V = 10⁵.

## 3. Bellman-Ford và chu trình âm

`V − 1` vòng, mỗi vòng thả lỏng mọi cạnh. Sau `i` vòng, `dist` đúng cho mọi đường đi **≤ i cạnh**. Vòng thứ `V` còn cải thiện được ⇒ có chu trình âm (với đỉnh xuất phát bất kỳ; muốn bắt mọi chu trình âm, khởi tạo `dist = 0` cho **mọi** đỉnh).

**≤ k chặng:** chạy đúng `k + 1` vòng và **dùng bản sao `dist` của vòng trước** để vòng hiện tại không đi quá một cạnh/vòng.
```ts
for (let i = 0; i <= k; i++) {
  const next = dist.slice();
  for (const [u, v, w] of edges) if (dist[u] + w < next[v]) next[v] = dist[u] + w;
  dist = next;
}
```

## 4. Floyd-Warshall

```ts
for (k) for (i) for (j) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
```
Vòng **k ngoài cùng** (k = đỉnh trung gian được phép dùng). O(V³): V = 100 → 10⁶; V = 1000 → 10⁹ (quá chậm).

## 5. Minimax path (bottleneck)

"Cực tiểu hóa **độ chênh lớn nhất** / **ô cao nhất** trên đường đi": Dijkstra với phép "cộng" đổi thành `max`: `cost(v) = max(cost(u), w(u, v))`. Đúng vì `max` đơn điệu. Cách khác: binary search đáp án + BFS (A10), hoặc DSU thêm cạnh theo thứ tự tăng dần.

## 6. Đồ thị lưới và trạng thái mở rộng

Lưới: nút là ô, 4 hướng. "Đổi hướng mũi tên tốn 1" ⇒ cạnh 0/1 ⇒ 0-1 BFS. Khi đáp án phụ thuộc thêm trạng thái (số chặng đã đi) ⇒ nút là `(đỉnh, trạng thái)`.

## 7. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Heap | `Heap` tự cài (I04) | `heapq.heappush(pq, (d, u))` | `PriorityQueue<long[]>((a, b) -> Long.compare(a[0], b[0]))` |
| Deque (0-1 BFS) | mảng + 2 con trỏ, hoặc tự cài | `collections.deque` | `ArrayDeque<Integer>` |
| Vô cực | `Infinity` | `float('inf')` | `Long.MAX_VALUE / 2` (tránh tràn khi cộng) |
| Khoảng cách lớn | double chính xác tới 2⁵³ ≈ 9·10¹⁵ | không tràn | **`long`** khi tổng có thể > 2³¹ |

## 8. Bẫy
1. Dijkstra với cạnh âm ⇒ sai (không báo lỗi).
2. Quên lazy-deletion check `d > dist[u]` ⇒ xử lý lại cạnh nhiều lần (vẫn đúng nhưng chậm hơn).
3. Java: so sánh `a[0] - b[0]` tràn; cộng `Integer.MAX_VALUE + w` tràn âm.
4. Bellman-Ford "≤ k chặng" quên dùng bản sao ⇒ một vòng đi được nhiều cạnh.
5. Floyd: đặt vòng `k` không ở ngoài cùng.
6. Đồ thị vô hướng: nhớ thêm cạnh **cả hai chiều**.
7. `dist` mặc định `0` thay vì `Infinity`.

## 9. Độ phức tạp
Dijkstra O((V+E) log V) · 0-1 BFS O(V+E) · Bellman-Ford O(VE) · Floyd O(V³).
