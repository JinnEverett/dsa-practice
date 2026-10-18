# F12 · Stack & queue

## Sau buổi này bạn sẽ
- Dùng **stack** (LIFO) cho bài có cấu trúc lồng nhau: ngoặc, biểu thức, đường dẫn, undo.
- Dùng **queue** (FIFO) đúng cách — không dính bẫy `shift()` O(n) của JS, `pop(0)` của Python.
- Cài **ring buffer** (hàng đợi vòng) và **queue bằng 2 stack** (amortized O(1)).
- Thiết kế stack có thêm truy vấn (min stack).

## 1. Stack — LIFO

```
push 1, push 2, push 3        pop → 3, pop → 2
   ┌───┐
   │ 3 │ ← top
   │ 2 │
   │ 1 │
   └───┘
```
Dấu hiệu: "khớp cặp", "lồng nhau", "quay lại trạng thái trước" (undo, back), "xử lý phần tử gần nhất chưa giải quyết", duyệt sâu (DFS) không đệ quy.

**Ngoặc hợp lệ:** gặp mở → push; gặp đóng → stack phải không rỗng và đỉnh là ngoặc mở tương ứng → pop. Cuối cùng stack phải rỗng.

## 2. Queue — FIFO

```
enqueue →  [ 4 | 5 | 6 | 7 ]  → dequeue (lấy 4)
           tail            head
```
Dấu hiệu: "theo thứ tự đến", "xử lý lần lượt", BFS (I05), cửa sổ thời gian gần nhất.

## 3. Bẫy hiệu năng: dequeue O(n)

| | Sai (O(n) mỗi lần lấy) | Đúng (O(1)) |
|---|---|---|
| TS | `queue.shift()` | mảng + chỉ số `head++` (thỉnh thoảng cắt bỏ phần đầu), hoặc ring buffer |
| Python | `list.pop(0)` | `collections.deque` → `popleft()` |
| Java | `ArrayList.remove(0)` | `ArrayDeque` → `poll()` (đừng dùng `Stack`/`LinkedList` cũ) |

```ts
// queue O(1) trong TS bằng con trỏ đầu
const q: number[] = [];
let head = 0;
q.push(x);                    // enqueue
const front = q[head++];      // dequeue
const size = q.length - head;
```

## 4. Ring buffer (hàng đợi vòng) dung lượng cố định k

```
k = 4     data: [ _ | A | B | _ ]      head = 1, size = 2
                       ↑head
tail = (head + size) % k = 3 → enqueue C vào ô 3, rồi D vào ô (1+3)%4 = 0 (quay vòng)
```
Không cấp phát lại, mọi thao tác O(1). Dùng trong buffer log, audio, network.

## 5. Queue bằng 2 stack (amortized)
`inbox` nhận push; khi cần pop/peek mà `outbox` rỗng thì đổ toàn bộ `inbox` sang `outbox` (đảo thứ tự). Mỗi phần tử bị chuyển **đúng 1 lần** → tổng chi phí n thao tác là O(n) → O(1) amortized.

## 6. Min stack
Mỗi phần tử trên stack lưu kèm "min tính đến nó": `push(x)` đẩy `[x, min(x, minHiệnTại)]`. `getMin` = phần thứ 2 của đỉnh. O(1) tất cả.

## 7. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Stack | `arr.push / pop / at(-1)` | `list.append / pop / [-1]` | `ArrayDeque<Integer>`: `push / pop / peek` |
| Queue | mảng + `head` | `deque`: `append / popleft` | `ArrayDeque`: `offer / poll / peek` |
| Deque | tự cài ring buffer | `deque` | `ArrayDeque`: `offerFirst/Last`, `pollFirst/Last` |

## 8. Bẫy
1. `pop()`/`peek` trên stack rỗng (TS trả `undefined`, Python/Java ném lỗi).
2. `shift()` / `pop(0)` trong vòng lặp → O(n²).
3. Ring buffer: nhầm "đầy" và "rỗng" khi `head === tail` → giữ thêm biến `size`.
4. Chia nguyên trong RPN: làm tròn **về 0** (`Math.trunc`, Python `int(a / b)`).
5. Java `Stack` (đồng bộ, cũ) chậm hơn `ArrayDeque`; `ArrayDeque` không chứa được `null`.

## 9. Độ phức tạp

| Thao tác | Stack (mảng) | Queue (head ptr / deque) | Ring buffer | Queue 2 stack |
|---|---|---|---|---|
| push / enqueue | O(1)* | O(1)* | O(1) | O(1) |
| pop / dequeue | O(1) | O(1) | O(1) | O(1) amortized |
| peek | O(1) | O(1) | O(1) | O(1) amortized |

\* amortized do mảng động.
