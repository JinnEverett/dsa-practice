# D04 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D04-time-based-kv [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D04-time-based-kv 01`

**Pass:** 2/2 bài qua `check`, DESIGN.md của bạn cho ex02 (7 bước), trả lời được câu hỏi quy mô và câu 🔴.

---

## 🟡 Kết hợp

### ex01 · TimeMap (class)
```java
class TimeMap {
  TimeMap()
  void set(String key, String value, int timestamp)
  String get(String key, int timestamp)
}
```
- `set` lưu `value` cho `key` tại `timestamp`. `get(key, t)` trả value của lần `set` có timestamp **lớn nhất mà ≤ t**; nếu không có (key lạ hoặc mọi timestamp > t) trả chuỗi rỗng `""`.
- Các lần `set` có timestamp **tăng ngặt** (toàn cục). `1 ≤ timestamp ≤ 10⁹`, `get` có `0 ≤ t ≤ 10⁹`. Key, value: chữ thường/số, độ dài 1–100. Tối đa `10⁵` lần gọi.
- Mục tiêu: `set` O(1), `get` O(log m).
- Ví dụ: `set("foo","bar",1), get("foo",1) → "bar", get("foo",3) → "bar", set("foo","bar2",4), get("foo",4) → "bar2", get("foo",5) → "bar2"`. (LeetCode 981)

### ex02 · SnapshotArray (class)
```java
class SnapshotArray {
  SnapshotArray(int length)
  void set(int index, int val)
  int snap()
  int get(int index, int snap_id)
}
```
- Mảng `length` phần tử, ban đầu toàn `0`. `set` đổi giá trị. `snap()` chụp mảng, trả `snap_id` (0, 1, 2, …). `get(index, snap_id)` trả giá trị của `index` lúc chụp `snap_id` (`snap_id` đã tồn tại).
- Ràng buộc: `1 ≤ length ≤ 5·10⁴`, `0 ≤ val ≤ 10⁹`, tối đa `10⁵` lần gọi. **Không** sao chép cả mảng mỗi lần `snap`.
- Mục tiêu: `set`, `snap` O(1); `get` O(log k).
- Ví dụ: `SnapshotArray(3), set(0,5), snap() → 0, set(0,6), get(0,0) → 5`. (LeetCode 1146)

---

## 🔴 Tình huống nghiệp vụ (viết DESIGN.md)

Bảng giá sản phẩm cần trả lời "giá của SKU X tại thời điểm T" cho đối soát hóa đơn: 2 triệu SKU, mỗi SKU đổi giá trung bình 40 lần/năm, lưu 5 năm.
1. Ước lượng số bản ghi và RAM (mỗi bản ghi: timestamp + giá). Có nên giữ hết trong RAM của một process không?
2. Nếu có sửa giá **hồi tố** (đưa vào bản ghi có timestamp cũ), append-only vỡ. Bạn đổi cấu trúc thế nào (hint: chèn có thứ tự, hoặc cây; chi phí?)
3. Truy vấn "giá hiện tại" chiếm 99%: tối ưu thế nào mà không bỏ lịch sử?
