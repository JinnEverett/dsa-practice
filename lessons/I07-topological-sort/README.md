# I07 · Topological sort

## Sau buổi này bạn sẽ
- Nhận ra bài toán **thứ tự phụ thuộc** và đưa về đồ thị có hướng không chu trình (DAG).
- Viết **Kahn** (bậc vào + queue) và biết bản **DFS post-order**; phát hiện chu trình bằng cả hai.
- Biến thể: topo **nhỏ nhất theo từ điển** (min-heap), topo **theo tầng** (số học kỳ / song song), **đường dài nhất trên DAG** (thời gian build).

## 1. Thứ tự topo là gì

Với đồ thị có hướng, **thứ tự topo** là cách xếp mọi đỉnh thành một dãy sao cho mọi cạnh `u → v` có `u` đứng trước `v`. Tồn tại ⇔ đồ thị **không có chu trình** (DAG). Thường có **nhiều** thứ tự hợp lệ.

```
  0 → 1 → 3          Hợp lệ:  0 1 2 3      0 2 1 3
  0 → 2 → 3          Sai:     1 0 2 3      (1 trước 0)
```

Hướng cạnh quyết định tất cả. Với "học `b` trước `a`" (LeetCode 207: `[a, b]`), cạnh là `b → a`. Đọc đề kỹ và ghi hướng ra giấy trước khi viết.

## 2. Kahn — bậc vào + hàng đợi

1. Tính `indeg[v]` = số cạnh đi vào `v`.
2. Đưa mọi đỉnh `indeg = 0` vào hàng đợi (chúng không phụ thuộc gì).
3. Lấy `u` ra, ghi vào kết quả; với mỗi cạnh `u → v`: `indeg[v]--`, nếu về 0 thì đẩy `v` vào hàng đợi.
4. Kết quả có **đủ n đỉnh** ⇔ DAG. Thiếu ⇒ các đỉnh còn lại nằm trên / sau một chu trình.

```ts
const order: number[] = [];
const q: number[] = [];                                   // dùng head, tránh shift()
for (let v = 0; v < n; v++) if (indeg[v] === 0) q.push(v);
for (let h = 0; h < q.length; h++) {
  const u = q[h]; order.push(u);
  for (const v of adj[u]) if (--indeg[v] === 0) q.push(v);
}
const isDag = order.length === n;
```

Mỗi đỉnh vào hàng đợi đúng một lần → hàng đợi `Int32Array(n)` là đủ. **O(n + m).**

## 3. DFS post-order

DFS có hướng, ghi đỉnh vào danh sách **lúc ra** (xong mọi hàng xóm); **đảo ngược** danh sách là thứ tự topo. Chu trình = gặp đỉnh "xám" (3 màu, I06). Bản đệ quy tràn stack ở chuỗi dài 10⁵ — viết bản lặp với con trỏ cạnh (I06 §2) hoặc dùng Kahn.

Kahn tiện hơn khi cần **phát hiện chu trình + thứ tự**, hoặc biến thể có hàng đợi ưu tiên / theo tầng; DFS tiện khi bài vốn đã là DFS (ví dụ 3 màu để tìm đỉnh an toàn).

## 4. Biến thể

**Nhỏ nhất theo từ điển.** Thay hàng đợi bằng **min-heap** (I04): luôn lấy đỉnh nhỏ nhất trong các đỉnh *sẵn sàng*. O((n + m) log n). Nếu "nhỏ nhất" theo tên chuỗi: sắp tên trước, gán `id = thứ hạng`, rồi chạy trên số nguyên.

**Theo tầng.** Mỗi vòng lấy *cả lớp* đỉnh sẵn sàng (`levelEnd = tail`). Số tầng = **số học kỳ tối thiểu** nếu mỗi học kỳ học được mọi môn đã sẵn sàng = độ dài đường dài nhất theo đỉnh.

```
tầng 1: các môn không tiên quyết     tầng 2: môn mở ra khi tầng 1 xong     ...
```

**Đường dài nhất trên DAG.** Xử lý theo thứ tự topo: `ready[v] = max(ready[v], ready[u] + dur[u])` rồi đáp án `max(ready[u] + dur[u])`. Đây là cách tính **thời gian build song song tối thiểu** (critical path). Tổng thời gian có thể tới `n × max(dur)` → tràn `int` ở Java.

**Đỉnh an toàn (ex06).** Đảo cạnh và chạy Kahn theo **bậc ra**: đỉnh bậc ra 0 an toàn; gỡ nó khiến các đỉnh trỏ tới nó giảm bậc ra.

## 5. Dấu hiệu nhận biết
"A phải làm trước B", "tiên quyết", "thứ tự build / migration / khởi tạo", "có vòng phụ thuộc không", "ít vòng/kỳ nhất", "thời gian hoàn thành khi chạy song song", "sắp xếp theo luật so sánh một phần (chữ cái ngoài hành tinh)".

## 6. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Hàng đợi | mảng + `head` / `Int32Array` | `deque` | `ArrayDeque<Integer>` |
| Min-heap | tự cài (`Heap` ở I04) | `heapq` | `PriorityQueue<Integer>` |
| Bậc vào | `Int32Array(n)` | `[0] * n` | `int[]` |
| Tổng thời gian lớn | `number` an toàn tới 2⁵³ | `int` không tràn | **`long`** (10⁵ × 10⁹ = 10¹⁴) |
| So sánh chuỗi (tie theo tên) | `a < b` (UTF-16, đủ cho ASCII) | `sorted()` | `String.compareTo` |

## 7. Bẫy
1. **Đảo hướng cạnh** (đọc `[a, b]` thành `a → b` khi đề nói `b` trước `a`).
2. **Cạnh trùng:** nếu cộng `indeg` mỗi dòng nhưng khử trùng khi dựng danh sách kề (hoặc ngược lại) thì bậc vào không bao giờ về 0. Nhất quán: cùng đếm hoặc cùng khử.
3. Quên kiểm tra `order.length === n` (chu trình trả thứ tự thiếu).
4. Đỉnh/chữ cái **không có ràng buộc** vẫn phải có mặt trong kết quả (alien dictionary).
5. Từ dài đứng trước chính tiền tố của nó (`["abc", "ab"]`) là **vô lý** → `""`.
6. Chỉ so các cặp từ **kề nhau**; so mọi cặp là O(W²).
7. Hợp nhất mọi đỉnh sẵn sàng vào queue thường rồi `sort` — không cho thứ tự từ điển nhỏ nhất; dùng heap.
8. `shift()` O(n); đệ quy DFS tràn stack trên chuỗi 10⁵.

## 8. Độ phức tạp
Kahn / DFS: **O(n + m)**. Có heap: **O((n + m) log n)**. Bộ nhớ O(n + m).
