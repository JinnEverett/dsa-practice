# I04 · Heap / priority queue

## Sau buổi này bạn sẽ
- Tự cài **binary heap** bằng mảng: `push` (sift up), `pop` (sift down), `heapify` O(n).
- Dùng heap cho các khuôn: **top-k**, **k-way merge**, **two heaps** (median động), **mô phỏng theo thời gian** (phòng họp, CPU scheduler).
- Dùng đúng heap có sẵn: `heapq` (Python), `PriorityQueue` (Java) — và biết TS **không có**.

## 1. Binary heap là gì

Cây nhị phân **đầy đủ** (lấp từng tầng từ trái sang) với tính chất: cha ≤ con (min-heap). Gốc là phần tử nhỏ nhất. Lưu bằng **mảng**, không cần con trỏ:

```
            1                 index:  0  1  2  3  4  5
          /   \               value:  1  3  2  7  4  5
         3     2
        / \   /               con của i: 2i + 1, 2i + 2
       7   4 5                cha của i: (i − 1) >> 1
```

**push(x):** thêm vào cuối mảng, rồi **sift up**: đổi chỗ với cha khi còn nhỏ hơn cha.
**pop():** lấy gốc; đưa phần tử cuối lên gốc, rồi **sift down**: đổi với con **nhỏ hơn** khi còn lớn hơn con.

```
pop() trên [1,3,2,7,4,5]:
  lấy 1, đưa 5 lên gốc → [5,3,2,7,4]
  5 > min(3,2)=2 → đổi với 2 → [2,3,5,7,4]   ✓
```

```ts
class Heap<T> {
  private a: T[] = [];
  constructor(private less: (x: T, y: T) => boolean) {}   // (viết field thường nếu chạy type stripping)
  push(x: T) { const a = this.a; a.push(x); let i = a.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (!this.less(a[i], a[p])) break; [a[i], a[p]] = [a[p], a[i]]; i = p; } }
  pop(): T { const a = this.a, top = a[0], last = a.pop()!;
    if (a.length) { a[0] = last; let i = 0;
      for (;;) { const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l;
        if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } }
    return top; }
}
```
(Bản đầy đủ, không dùng parameter property, ở `solutions.ts` — TS learner nên viết một lớp `Heap<T>` trong `answers/heap.ts` rồi `import { Heap } from './heap.ts'` cho ex03–ex10.)

**heapify O(n):** sift down mọi node không phải lá, từ `n/2 − 1` về 0. Nghe như O(n log n) nhưng phần lớn node ở gần đáy, sift down rất ngắn → tổng O(n).

## 2. Độ phức tạp

| Thao tác | Heap | Mảng sort | Mảng thường |
|---|---|---|---|
| lấy min | O(1) | O(1) | O(n) |
| xóa min | O(log n) | O(1)/O(n) | O(n) |
| chèn | O(log n) | O(n) | O(1) |
| dựng từ n phần tử | O(n) | O(n log n) | — |

## 3. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Min-heap | **tự cài** | `heapq.heappush(h, x)`, `heappop`, `h[0]` | `PriorityQueue<Integer>` |
| Max-heap | comparator ngược | đẩy `-x` | `new PriorityQueue<>(Comparator.reverseOrder())` |
| Phần tử nhiều trường | comparator | tuple `(key, tie, value)` | `PriorityQueue<int[]>((a, b) -> Integer.compare(a[0], b[0]))` |
| heapify | tự cài | `heapq.heapify(list)` | `new PriorityQueue<>(collection)` |
| top-k nhanh | — | `heapq.nlargest(k, xs)` | — |

Bẫy Python: tuple so sánh phần tử thứ hai khi phần tử đầu bằng nhau → nếu phần tử thứ hai là object không so sánh được sẽ lỗi; chèn một bộ đếm tăng dần làm tie-breaker.
Bẫy Java: comparator `(a, b) -> a[0] - b[0]` tràn số; dùng `Integer.compare`. `PriorityQueue` duyệt bằng iterator **không** theo thứ tự.

## 4. Các khuôn

**Top-k lớn nhất** — giữ **min-heap kích thước k**: phần tử mới lớn hơn đỉnh thì thay đỉnh. Cuối cùng đỉnh là phần tử lớn thứ k. O(n log k), bộ nhớ O(k) — chạy được trên stream không vừa RAM.

**k-way merge** — heap chứa phần tử đầu của mỗi dãy; pop min, đẩy phần tử kế tiếp của dãy đó. O(N log k).

**Two heaps (median động)** — max-heap `low` (nửa nhỏ) + min-heap `high` (nửa lớn), giữ `|low| = |high|` hoặc `|low| = |high| + 1`. Median = đỉnh `low` hoặc trung bình hai đỉnh.

**Mô phỏng sự kiện** — sort sự kiện theo thời gian, heap giữ "những thứ đang diễn ra" theo thời điểm kết thúc (phòng họp) hoặc "việc đang chờ" theo độ ưu tiên (CPU scheduler).

## 5. Dấu hiệu nhận biết
"k lớn nhất / nhỏ nhất / gần nhất", "liên tục lấy phần tử nhỏ nhất rồi thêm phần tử mới", "gộp k dãy đã sort", "median của stream", "lập lịch theo ưu tiên/thời điểm".

## 6. Bẫy
1. Sift down đổi với con **trái** thay vì con **nhỏ hơn**.
2. `pop` trên heap 1 phần tử: phần tử cuối chính là gốc — đừng ghi đè rồi trả nhầm.
3. Top-k lớn nhất mà dùng max-heap chứa cả n phần tử → O(n log n) và O(n) bộ nhớ (vẫn đúng, nhưng mất lợi thế).
4. Dùng `sort()` sau mỗi lần chèn để "giả lập" heap → O(n log n) mỗi thao tác.
