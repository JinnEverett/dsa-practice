# D02 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D02-lru-lfu [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D02-lru-lfu 01`

**Pass:** 2/2 bài qua `check`, DESIGN.md tự viết cho LFU (7 bước, đặc biệt bất biến và bảng độ phức tạp), ≤ 2 hint, và trả lời được câu hỏi quy mô.

---

## 🟡 Kết hợp

### ex01 · LRUCache (class)
```java
class LRUCache {
  LRUCache(int capacity)
  int get(int key)
  void put(int key, int value)
}
```
- `get(key)`: trả value nếu có (và đánh dấu vừa được dùng), ngược lại `-1`.
- `put(key, value)`: thêm/cập nhật (cả hai đều đánh dấu vừa được dùng). Nếu sau khi thêm key mới mà số key vượt `capacity` thì bỏ key **dùng lâu nhất**.
- `capacity = 0`: cache luôn rỗng (`put` không làm gì, `get` luôn `-1`).
- Ràng buộc: `0 ≤ capacity ≤ 10⁵`, `0 ≤ key, value ≤ 10⁹`, tối đa `10⁵` lần gọi.
- Mục tiêu: `get`, `put` O(1) trung bình. **Tự cài danh sách liên kết đôi** (không dùng `LinkedHashMap`/`OrderedDict`) cho lần làm đầu tiên.
- Ví dụ: `LRUCache(2), put(1,1), put(2,2), get(1) → 1, put(3,3)` (bỏ key 2) `, get(2) → -1, put(4,4)` (bỏ key 1) `, get(1) → -1, get(3) → 3, get(4) → 4`. (LeetCode 146)

### ex02 · LFUCache (class)
```java
class LFUCache {
  LFUCache(int capacity)
  int get(int key)
  void put(int key, int value)
}
```
- Mỗi key có bộ đếm số lần dùng (`get` thành công hoặc `put`; key mới vào có đếm = 1). Khi vượt `capacity`, bỏ key có **đếm nhỏ nhất**; nếu hòa, bỏ key **dùng lâu nhất** trong số đó. Đếm của key bị bỏ biến mất (key quay lại bắt đầu từ 1).
- `get` trả `-1` nếu không có. `capacity = 0`: không lưu gì.
- Ràng buộc: `0 ≤ capacity ≤ 10⁵`, `0 ≤ key, value ≤ 10⁹`, tối đa `10⁵` lần gọi.
- Mục tiêu: `get`, `put` O(1) trung bình. Bản quét tìm nạn nhân O(capacity) sẽ quá giờ.
- Ví dụ: `LFUCache(2), put(1,1), put(2,2), get(1) → 1, put(3,3)` (bỏ key 2: đếm 1, nhỏ nhất) `, get(2) → -1, get(3) → 3, put(4,4)` (key 1 và 3 cùng đếm 2 → bỏ key 1, dùng lâu hơn) `, get(1) → -1, get(3) → 3, get(4) → 4`. (LeetCode 460)

---

## 🔴 Tình huống nghiệp vụ (viết DESIGN.md, không cần code)

Cache giá sản phẩm cho dịch vụ giỏ hàng: 5 triệu sản phẩm, 50 nghìn "nóng". Trả lời trong DESIGN.md của bạn:
1. LRU hay LFU? Điều gì xảy ra với LRU khi một job quét toàn bộ catalog (scan) chạy mỗi đêm? Điều gì xảy ra với LFU khi sản phẩm hot cuối tuần trước không còn hot (cache pollution)?
2. Cần thêm TTL 60 giây cho mỗi giá. Cấu trúc nào thay đổi, thao tác nào không còn O(1) "sạch" (gợi ý: dọn lười khi `get` + dọn định kỳ)?
3. Chạy 4 instance sau load balancer: cache cục bộ còn đúng không? Hit-rate thay đổi thế nào so với 1 instance? Khi nào đưa ra Redis (`maxmemory-policy allkeys-lru/lfu`)?
