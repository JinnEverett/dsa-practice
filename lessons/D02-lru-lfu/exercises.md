# D02 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D02-lru-lfu [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D02-lru-lfu 01`

**Pass:** 2/2 bài qua `check` + một trang thiết kế 7 bước (mẫu: [`DESIGN.md`](./DESIGN.md)) cho LFU hoặc một biến thể bạn tự đặt (vd. LRU có TTL), ≤ 2 hint. Trước khi code, nói ý tưởng + độ phức tạp từng thao tác.

> Bài class: `args = [ops, opArgs]`; kết quả `void` là `null`. **Tự cài** — không dùng `LinkedHashMap` / `OrderedDict` / thủ thuật thứ tự của `Map` cho ex01 (bạn được dùng chúng ở ex02 nếu muốn).

---

## 🟡 Kết hợp

### ex01 · LRU cache (class)
```java
class LRUCache {
  LRUCache(int capacity)
  int get(int key)               // -1 nếu không có
  void put(int key, int value)
}
```
- Hết chỗ thì bỏ key **dùng lâu nhất** (cả `get` và `put` tính là "dùng"). `put` key đã có: cập nhật giá trị, tính là vừa dùng, không evict.
- Ràng buộc: `0 ≤ capacity ≤ 10⁵`, tối đa `10⁵` lần gọi, key và value trong `int`. `capacity = 0` → `put` không làm gì.
- Ví dụ (capacity 2): `put(1,1), put(2,2), get(1) → 1, put(3,3)` (bỏ key 2), `get(2) → -1, put(4,4)` (bỏ key 1), `get(1) → -1, get(3) → 3, get(4) → 4`. (LeetCode 146)
- Mục tiêu: mọi thao tác **O(1)**. Duyệt mảng `O(capacity)` mỗi thao tác sẽ trượt Perf (capacity 5 000, 10⁵ thao tác).
- 🧭 Câu hỏi quy mô: dự đoán thời gian cho `10⁶` thao tác và `heap MB` ở `capacity = 5 000`, rồi `bench` ở scale `l`.

### ex02 · LFU cache (class)
```java
class LFUCache {
  LFUCache(int capacity)
  int get(int key)               // -1 nếu không có
  void put(int key, int value)
}
```
- Hết chỗ thì bỏ key **được dùng ít lần nhất** (`get` và `put` đều +1 lần dùng; key mới chèn có 1 lần). Nhiều key cùng số lần → bỏ key **dùng lâu nhất** trong số đó. Key bị bỏ mất bộ đếm; chèn lại bắt đầu từ 1.
- Ràng buộc như ex01.
- Ví dụ (capacity 2): `put(1,1), put(2,2), get(1) → 1, put(3,3)` (key 2 tần suất 1 là nhỏ nhất → bỏ), `get(2) → -1, get(3) → 3, put(4,4)` (1 và 3 cùng tần suất 2 → bỏ 1, dùng lâu hơn), `get(1) → -1, get(3) → 3, get(4) → 4`. (LeetCode 460)
- Mục tiêu: mọi thao tác **O(1)**. Quét tìm min mỗi lần evict sẽ trượt Perf.

---

## 🔴 Thực tế (bài làm thêm, không chấm tự động)
**Cache giá sản phẩm.** Service giá nhận 20 000 req/s, 90% truy cập dồn vào 1% sản phẩm, nhưng mỗi sáng có đợt khuyến mãi làm *một nhóm sản phẩm lạ* được xem hàng loạt đúng một lần.
Viết 1 trang (khung 7 bước, ≤ 1 trang): chọn LRU hay LFU? Điều gì xảy ra với từng loại khi đợt khuyến mãi tràn vào (cache pollution / scan resistance)? Đề xuất cách vá (vd. giữ 2 vùng, hoặc LFU có aging).
