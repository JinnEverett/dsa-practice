# F11 · Linked list

## Sau buổi này bạn sẽ
- Thao tác con trỏ `next` không làm mất node: đảo ngược, xóa, chèn, nối.
- Dùng **dummy head** để khỏi xử lý riêng trường hợp đầu danh sách.
- Dùng **fast/slow pointer**: tìm giữa, phát hiện chu trình, tìm điểm bắt đầu chu trình.
- Hiểu doubly linked list và vì sao nó là nền của LRU cache (R01, D02).

## 1. Cấu trúc

```
head
 │
 ▼
┌───┬───┐   ┌───┬───┐   ┌───┬────┐
│ 1 │ ●─┼──►│ 2 │ ●─┼──►│ 3 │null│
└───┴───┘   └───┴───┘   └───┴────┘
```

| Thao tác | Array | Linked list |
|---|---|---|
| truy cập phần tử thứ i | O(1) | O(i) |
| chèn/xóa ở đầu | O(n) | **O(1)** |
| chèn/xóa sau một node đã có con trỏ | O(n) | **O(1)** |
| bộ nhớ | liền mạch, ít | thêm 1–2 con trỏ mỗi node, rải rác (cache kém) |

Định nghĩa node dùng trong lộ trình (giống LeetCode):

| TS | Python | Java |
|---|---|---|
| `import { ListNode } from '../../../tools/lib.ts'` · `new ListNode(val, next)` | `from dsa import ListNode` · `ListNode(val, next)` | `ListNode` có sẵn · `new ListNode(val, next)` |

## 2. Đảo ngược — kỹ thuật 3 con trỏ

```
prev  cur   next
null   1 ──► 2 ──► 3
       │
       ▼ cur.next = prev
null ◄─1     2 ──► 3       rồi tiến: prev = cur, cur = next
null ◄─1 ◄── 2     3
null ◄─1 ◄── 2 ◄── 3       prev là head mới
```
```ts
let prev: ListNode | null = null, cur = head;
while (cur) { const next = cur.next; cur.next = prev; prev = cur; cur = next; }
return prev;
```
**Luôn lưu `next` trước khi sửa `cur.next`** — nếu không sẽ mất phần còn lại của danh sách.

## 3. Dummy head
```ts
const dummy = new ListNode(0, head);   // node giả đứng trước head
// ... xóa/chèn mà không cần if (đang ở head)
return dummy.next;                      // head mới (có thể đã thay đổi)
```

## 4. Fast / slow pointer

```
slow đi 1 bước, fast đi 2 bước
1 → 2 → 3 → 4 → 5
s,f
    s       f
        s           f(null)    → slow ở giữa
```
- **Giữa danh sách:** fast tới cuối thì slow ở giữa.
- **Có chu trình (Floyd):** nếu có vòng, fast sẽ đuổi kịp slow bên trong vòng; nếu không, fast gặp null.
- **Điểm bắt đầu vòng:** sau khi gặp nhau, đặt một con trỏ về head, cả hai cùng đi 1 bước — chỗ gặp lại là đầu vòng (vì quãng đường head → đầu vòng bằng quãng điểm gặp → đầu vòng theo chiều vòng).
- **Phần tử thứ n từ cuối:** cho fast đi trước n bước, rồi cả hai cùng đi.

## 5. Doubly linked list + sentinel
```
head ⇄ [A] ⇄ [B] ⇄ [C] ⇄ tail        head/tail là node giả (sentinel)
xóa B:   B.prev.next = B.next; B.next.prev = B.prev        O(1), không cần if
```

## 6. Dấu hiệu nhận biết
Đề cho `ListNode`; "O(1) bộ nhớ" (không chép ra mảng); "giữa", "thứ k từ cuối", "chu trình"; cần xóa/chèn O(1) khi đã giữ con trỏ node (LRU, lịch sử trình duyệt, undo).

## 7. Bẫy
1. Mất node do sửa `next` trước khi lưu.
2. Truy cập `cur.next.next` khi `cur.next` là null → lỗi null pointer. Điều kiện vòng lặp fast/slow: `while (fast && fast.next)`.
3. Quên trường hợp danh sách rỗng / 1 node.
4. Tạo chu trình ngoài ý muốn khi nối (quên đặt `tail.next = null`) → in/duyệt treo vô hạn (bộ chấm báo "list có chu trình").
5. Chép sang mảng để giải — đúng nhưng O(n) bộ nhớ; chỉ chấp nhận khi đề không yêu cầu O(1).
6. Đệ quy trên list dài 10⁵ → tràn stack (F10). Lời giải đệ quy (reverse, merge) chỉ an toàn khi list ngắn.
