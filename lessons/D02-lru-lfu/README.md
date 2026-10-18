# D02 · LRU & LFU cache

## Sau buổi này bạn sẽ
- Cài **LRU cache** O(1) bằng hash map + danh sách liên kết đôi (DLL) tự viết.
- Cài **LFU cache** O(1) với quy tắc hòa (tie) rõ ràng: cùng tần suất thì bỏ cái dùng lâu nhất.
- Xử lý biên: sức chứa 0, `put` key đã có, evict *trước* khi thêm.
- Biết khi nào dùng `Map`/`OrderedDict`/`LinkedHashMap` thay vì tự cài.

## 1. Bài toán và ngữ nghĩa phải chốt trước
Cache có sức chứa `capacity`. Hết chỗ thì **evict** (bỏ) một phần tử.

| Câu hỏi bước 1 | LRU | LFU |
|---|---|---|
| Evict ai? | dùng *lâu nhất* | dùng *ít lần nhất*; hòa → dùng *lâu nhất* |
| `get` có tính là "dùng"? | có | có (tần suất + 1) |
| `put` key đã có? | cập nhật + tính là dùng | cập nhật + tính là dùng (tần suất + 1) |
| `capacity = 0`? | `put` không làm gì | như vậy |
| `get` key lạ? | trả `-1`, không đổi trạng thái | như vậy |

## 2. LRU = map + DLL

```
map: key → node
head ⇄ [k3] ⇄ [k1] ⇄ [k7] ⇄ tail          head.next = mới dùng nhất
                                           tail.prev = cũ nhất (evict)
get(k1): unlink node k1, đưa lên sau head   → O(1) nhờ node có prev/next
put mới khi đầy: unlink tail.prev, map.delete(key của nó), thêm node mới sau head
```
Hai node canh (sentinel) `head`, `tail` loại bỏ mọi `if (n.prev == null)`. Mảng + `findIndex` làm mọi thao tác O(capacity) → trượt Perf ở `capacity = 5000`.

## 3. LFU = ba bảng + `minFreq`

```
vals   : key → value
freq   : key → số lần dùng
buckets: f → Set<key> theo thứ tự chèn (đầu = dùng lâu nhất trong nhóm f)
minFreq: tần suất nhỏ nhất đang có

touch(key): bỏ khỏi bucket f, đưa vào bucket f+1; nếu bucket f rỗng và f == minFreq → minFreq++
put mới   : (nếu đầy) evict key đầu tiên của buckets[minFreq]; thêm với f = 1; minFreq = 1
```
Vì sao `minFreq` chỉ cần `++` khi touch: key vừa chuyển sang `f+1` nên bucket `f+1` chắc chắn không rỗng. Khi chèn key mới, tần suất nhỏ nhất luôn là 1.

## 4. Dấu hiệu nhận biết
"cache", "giữ N phần tử gần/thường dùng nhất", "evict", "O(1) mỗi thao tác", "TTL/sức chứa" → LRU. "phổ biến nhất", "đếm số lần truy cập để evict" → LFU. Chọn: LRU khi truy cập có tính cục bộ theo thời gian; LFU khi có một nhóm khóa "nóng" ổn định (nhưng nhớ LFU giữ mãi khóa cũ từng nóng → cần *aging*).

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| LRU ngắn gọn | `Map`: `delete` + `set` lại, evict `keys().next().value` | `OrderedDict.move_to_end`, `popitem(last=False)` | `LinkedHashMap(cap, 0.75f, true)` + `removeEldestEntry` |
| Danh sách theo thứ tự chèn | `Set` / `Map` | `dict` / `OrderedDict` | `LinkedHashSet` |
| Tự cài DLL | object `{prev, next}` | class có `__slots__` | class node |

Bẫy ngôn ngữ: Java `LinkedHashMap` mặc định theo thứ tự *chèn*, không phải *truy cập* (phải truyền `accessOrder = true`). Python `lru_cache` là cache *hàm*, không phải cấu trúc có `put/get`.

## 6. Bẫy
1. Evict xong mới thêm: nếu thêm trước rồi evict, trong LFU có thể evict chính key vừa thêm (tần suất 1).
2. `put` key đã có không đưa lên mới nhất / không tăng tần suất.
3. Quên `map.delete(oldKey)` khi evict → map phình, `size` sai → rò bộ nhớ.
4. `capacity = 0`: truy cập `tail.prev` của danh sách rỗng là sentinel `head` → xóa nhầm.
5. Hòa tần suất xử lý sai thứ tự (bỏ cái *mới* nhất thay vì cũ nhất).

## 7. Độ phức tạp
| | LRU | LFU |
|---|---|---|
| `get` | O(1) | O(1) |
| `put` | O(1) | O(1) |
| Space | O(capacity) | O(capacity) |

🧭 Câu hỏi quy mô: `capacity = 10⁶`, hỏi mỗi node DLL (object với 4 trường) tốn khoảng bao nhiêu byte trên V8? Dự đoán, rồi chạy `bench` ở scale `l` xem `heap MB`.

Xem [`DESIGN.md`](./DESIGN.md) cho thiết kế LRU đầy đủ 7 bước.
