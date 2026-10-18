# R01 · Cache: LRU, TTL, invalidate

## Sau buổi này bạn sẽ
- Cài **LRU cache** theo hai cách: `Map` giữ thứ tự và **hash map + doubly linked list (DLL)**; biết khi nào cách nào đáng tin.
- Thêm **TTL** mà không phải quét cả cache (min-heap theo thời điểm hết hạn, *lazy deletion*).
- So sánh **LRU vs FIFO** bằng mô phỏng, thấy được nghịch lý Bélády.
- Giữ **chỉ mục phụ** (category → sản phẩm) nhất quán khi evict / invalidate.

## 1. Vì sao cache cần cấu trúc dữ liệu
Cache chỉ có giá trị khi `get`/`put` rẻ hơn việc tính lại. Mục tiêu là **O(1)** mỗi thao tác, bộ nhớ chặn ở `capacity`. Câu hỏi thiết kế luôn là: *khi đầy thì đuổi ai?*

| Chính sách | Đuổi | Cần gì để O(1) |
|---|---|---|
| FIFO | vào sớm nhất | queue |
| **LRU** | lâu chưa dùng nhất | hash map + DLL |
| LFU | ít dùng nhất | hash map + bucket tần suất (D02) |
| TTL | quá hạn | thêm min-heap theo `expireAt` |

## 2. LRU = hash map + DLL
```
 head (MRU) ⇄ [k3] ⇄ [k1] ⇄ [k7] ⇄ tail (LRU)        map: k → node
 get(k1): map[k1] → cắt node, chèn sau head            evict: tail.prev, xóa luôn khỏi map
```
- Map cho **tìm** O(1); DLL cho **cắt + chèn đầu** O(1) (cần `prev` nên phải *doubly*).
- Sentinel `head`/`tail` bỏ mọi nhánh `if (node === head)`.
- Lối tắt: `Map` của JS (và `OrderedDict`, `LinkedHashMap`) nhớ thứ tự chèn → "refresh" = `delete` rồi `set`.

**Đo thật (máy soạn, capacity 2·10⁴, 50% put / 50% get):**

| số thao tác | Map-LRU (ex01) | DLL (ex05) |
|---|---|---|
| 10⁵ | 33 ms | 25 ms |
| 10⁶ | 884 ms | 164 ms |
| 10⁷ | 10,4 s | 2,2 s |

Map-LRU tăng ×27 khi n tăng ×10 (không còn "O(1)" sạch): xóa liên tục để lại ô trống ở đầu bảng băm mà `keys().next()` phải bước qua. Bài học: Big-O che hằng số, và hằng số có thể phụ thuộc quy mô — hãy `bench`.

## 3. TTL: đừng quét, hãy xếp hàng theo hạn
```
 put(k, v, ttl, now): expireAt = now + ttl
 heap (min theo expireAt): (5,k1,ver1) (9,k4,ver2) (30,k2,ver3) ...
 mỗi thao tác: while heap.top.expireAt <= now: pop; nếu entry hiện tại còn đúng ver đó → xóa khỏi map
```
- **Lazy deletion:** put lại key thì bản ghi cũ trong heap thành "mồ côi"; gắn `ver` để biết bỏ qua. Rẻ hơn tìm-và-xóa trong heap.
- Quy ước đề: hết hạn khi `now ≥ expireAt`; entry hết hạn **không chiếm chỗ** (không bị tính vào capacity).
- Redis dùng kết hợp *lazy* (kiểm tra khi truy cập) + *quét ngẫu nhiên định kỳ*; ở đây heap cho kết quả tất định nên kiểm chứng được.

## 4. Chỉ mục phụ và invalidate
Cache giá sản phẩm thường bị xóa theo **nhóm** ("giảm giá cả category 7"). Quét toàn bộ cache là O(capacity) mỗi lần. Giữ thêm `category → Set<productId>`; **mọi** đường xóa (evict, invalidate, ghi đè sang category khác) phải cập nhật nó, nếu không bạn rò rỉ bộ nhớ hoặc xóa nhầm.

## 5. Hit ratio và nghịch lý Bélády
`hit ratio = số hit / số request`. LRU là *stack algorithm*: tăng capacity không bao giờ tệ đi. FIFO thì **có thể tệ đi** (chuỗi `1,2,3,4,1,2,5,1,2,3,4,5`: capacity 3 được 3 hit, capacity 4 chỉ 2 hit).

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| LRU nhanh gọn | `Map` + delete/set | `OrderedDict.move_to_end` | `LinkedHashMap(cap, 0.75f, true)` + `removeEldestEntry` |
| Min-heap | tự cài / `Heap` ở I04 | `heapq` (tuple `(expireAt, ver, key)`) | `PriorityQueue<long[]>` |
| Thời gian | số nguyên ms (`long` ở Java) | `int` | `long` — đừng `int` với epoch ms |

## 7. Bẫy
1. `put` key đã có mà evict nhầm (phải *cập nhật*, không đuổi ai).
2. `get` miss làm đổi thứ tự.
3. TTL: dùng `>` thay vì `>=`; quét hết hạn chỉ khi `get` nên entry chết chiếm chỗ.
4. Quên gỡ khỏi chỉ mục phụ khi evict.
5. DLL: quên `prev` của node sau; capacity = 1.

## 8. Độ phức tạp
| | time | space |
|---|---|---|
| LRU get/put | O(1) | O(capacity) |
| TTL get/put | O(log n) amortized | O(n) (heap có thể giữ bản ghi cũ) |
| invalidateCategory | O(số entry xóa) | + O(n) chỉ mục |

## 9. Câu hỏi quy mô
Dự đoán trước, rồi `bench`: thời gian ex01 và ex05 ở `n = 10⁶` thao tác là bao nhiêu, tỉ lệ giữa hai bản? Số mũ ước lượng của ex01 từ `m` sang `l` có ≈ 1 không?
