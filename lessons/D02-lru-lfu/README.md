# D02 · LRU & LFU cache

## Sau buổi này bạn sẽ
- Cài **LRU** với `Map` + danh sách liên kết đôi (DLL) tự viết, mọi thao tác O(1).
- Cài **LFU** O(1) với `Map` + bucket theo tần suất + `minFreq`, xử lý đúng tie.
- Nắm các biên hay sai: `capacity = 0`, `put` key đã có, thứ tự "chạm" của `get`.
- Biết khi nào dùng `Map` giữ thứ tự chèn thay vì DLL (và cái giá).

## 1. LRU: Least Recently Used

```
head (mới nhất)                                   tail (cũ nhất)
 ┌────┐   ┌────┐   ┌────┐   ┌────┐   ┌────┐
 │sent│ ⇄ │ k3 │ ⇄ │ k1 │ ⇄ │ k7 │ ⇄ │sent│        map: k3→●, k1→●, k7→●
 └────┘   └────┘   └────┘   └────┘   └────┘
```
- `get(k)`: có → gỡ node khỏi chỗ cũ, chèn sau `head`, trả value. Không → `-1`.
- `put(k,v)`: đã có → cập nhật value + chạm. Chưa có và đầy → bỏ node ngay trước `tail` (và xóa khỏi `map`) rồi chèn mới.
- 2 node canh (sentinel) giúp mọi thao tác chèn/xóa không có nhánh biên.

**Tại sao cần DLL mà không phải mảng?** Gỡ node ở giữa phải O(1) → cần trỏ `prev/next`. Map cho ta node trong O(1); DLL gỡ + chèn trong O(1).

## 2. LFU: Least Frequently Used

```
vals:    k1→{v, f=3}  k2→{v, f=1}  k5→{v, f=1}
buckets: 1 → [k2, k5]      (thứ tự = cũ → mới)
         3 → [k1]
minFreq = 1     evict: phần tử ĐẦU của bucket[minFreq] = k2
```
- Mỗi lần dùng (`get` hoặc `put` key đã có): chuyển key sang bucket `f+1`; nếu bucket cũ rỗng và `f == minFreq` thì `minFreq++`.
- Key mới: `freq = 1`, và **sau khi evict** đặt `minFreq = 1`.
- Hòa tần suất → bỏ cái dùng **lâu nhất** (LRU trong bucket) — đó là lý do bucket phải có thứ tự.

## 3. Hai cách có thứ tự trong TS

| | DLL tự cài | `Map`/`Set` giữ thứ tự chèn |
|---|---|---|
| Chạm key | unlink + pushFront | `delete` rồi `set` lại |
| Lấy cũ nhất | `tail.prev` | `map.keys().next().value` |
| Ưu | độc lập ngôn ngữ; bạn kiểm soát bộ nhớ | ngắn gọn (LFU ở solutions dùng `Set`) |
| Nhược | nhiều code, dễ sai con trỏ | phụ thuộc đặc tả thứ tự của engine; ẩn chi phí |

## 4. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| LRU có sẵn | không (tự cài) | `OrderedDict.move_to_end`, `popitem(last=False)` | `LinkedHashMap(cap, .75f, true)` + `removeEldestEntry` |
| Bucket theo freq | `Map<number, Set<number>>` | `defaultdict(OrderedDict)` | `Map<Integer, LinkedHashSet<Integer>>` |
| Lấy phần tử đầu | `set.values().next().value` | `next(iter(od))` | `set.iterator().next()` |

## 5. Bẫy
1. `capacity = 0`: `put` phải bỏ qua (evict trên cache rỗng gây lỗi).
2. `put` key đã có: cập nhật value **và** tính là một lần dùng (LRU: chạm; LFU: tăng freq).
3. Evict xong phải xóa khỏi `map` (rò bộ nhớ + `get` trả giá trị cũ).
4. LFU: đặt `minFreq = 1` **sau** khi evict, và tăng `minFreq` đúng khi bucket cũ cạn.
5. LFU: quên tie-break LRU → khác đáp án chuẩn ở các case hòa.
6. Key là object (không phải bài này): `Map` so sánh theo tham chiếu.

## 6. Độ phức tạp

| | get | put | space |
|---|---|---|---|
| LRU (Map + DLL) | O(1) | O(1) | O(capacity) |
| LFU (Map + bucket) | O(1) | O(1) | O(capacity) |
| Ngây thơ (mảng, quét) | O(capacity) | O(capacity) | O(capacity) |

## 7. Câu hỏi quy mô
Dự đoán rồi chạy `node tools/bench.ts lessons/D02-lru-lfu 01 --scales s,m,l`: thời gian khi `n` tăng 10× (từ 10⁵ lên 10⁶ thao tác) tăng bao nhiêu lần? Tại sao có thể >10×?
