# D04 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D04-time-based-kv [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D04-time-based-kv 01`

**Pass:** 2/2 bài qua `check` + một trang thiết kế 7 bước cho biến thể "timestamp bất kỳ" (không còn tăng): chọn cấu trúc nào, vì sao, độ phức tạp từng thao tác, ≤ 2 hint.

> Bài class: `args = [ops, opArgs]`; kết quả `void` là `null`.

---

## 🟡 Kết hợp

### ex01 · Time-based key-value store (class)
```java
class TimeMap {
  TimeMap()
  void set(String key, String value, int timestamp)
  String get(String key, int timestamp)      // bản ghi của key có timestamp lớn nhất ≤ `timestamp`; không có → ""
}
```
- Với mỗi key, các lần `set` có `timestamp` **tăng nghiêm ngặt**. Key và value gồm chữ thường, độ dài 1–100.
- Ràng buộc: `1 ≤ timestamp ≤ 10⁷`, tối đa `10⁵` lần gọi.
- Ví dụ: `set("foo","bar",1), get("foo",1) → "bar", get("foo",3) → "bar", set("foo","bar2",4), get("foo",4) → "bar2", get("foo",5) → "bar2"`; `get("foo",0) → ""`. (LeetCode 981)
- Mục tiêu: `set` O(1), `get` **O(log m)**. Quét tuyến tính lịch sử sẽ trượt Perf.

---

## 🔴 Thực tế

### ex02 · Bảng cấu hình có phiên bản — SnapshotArray (class)
Một dịch vụ giữ `length` cờ cấu hình (feature flag), mỗi cờ là một số nguyên mặc định `0`. Mỗi lần triển khai ("release") chụp lại toàn bộ cấu hình thành một phiên bản đánh số `0, 1, 2, …`. Khi sự cố, đội vận hành cần tra giá trị của một cờ **tại phiên bản bất kỳ** để so sánh.
```java
class SnapshotArray {
  SnapshotArray(int length)
  void set(int index, int val)        // đổi cờ trong phiên bản đang soạn thảo
  int snap()                          // chụp, trả snapId (0, 1, 2, ... tăng dần)
  int get(int index, int snapId)      // giá trị của cờ `index` tại thời điểm chụp snapId
}
```
- `snapId` truyền vào `get` luôn đã được `snap()` trả về trước đó. `set` sau `snap` không ảnh hưởng snapshot cũ.
- Ràng buộc: `1 ≤ length ≤ 10⁶`, tối đa `10⁵` lần gọi, `|val| ≤ 2³¹ − 1`, `0 ≤ index < length`.
- Ví dụ: `SnapshotArray(3), set(0,5), snap() → 0, set(0,6), get(0,0) → 5`. (LeetCode 1146)
- Mục tiêu: bộ nhớ **không phụ thuộc** `length` hay số lần `snap` (chỉ phụ thuộc số lần `set`); `get` **O(log k)**. Sao chép mảng mỗi lần `snap` sẽ trượt Perf.
- 🧭 Câu hỏi quy mô: `length = 10⁶`, `10⁴` snapshot nếu sao chép đầy đủ tốn bao nhiêu ô (và byte)? Của bạn?
