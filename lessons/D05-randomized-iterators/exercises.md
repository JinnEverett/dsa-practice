# D05 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D05-randomized-iterators [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D05-randomized-iterators 01`

**Pass:** 3/3 bài qua `check` (ex02 không có phép đo thời gian — tự giác O(1)), DESIGN.md của bạn cho ex01 (7 bước), tự kiểm phân phối của `getRandom`.

---

## 🟡 Kết hợp

### ex01 · RandomizedCollection (class)
```java
class RandomizedCollection {
  RandomizedCollection()
  boolean insert(int val)
  boolean remove(int val)
  int getRandom()
}
```
- Đa tập (cho phép trùng). `insert` thêm một bản sao, trả `true` nếu `val` **chưa có** trước đó. `remove` bỏ **một** bản sao nếu có, trả `true` nếu có bỏ. `getRandom` trả một phần tử ngẫu nhiên; xác suất của giá trị ∝ số bản sao của nó. `getRandom` chỉ gọi khi đa tập không rỗng.
- Checker chỉ kiểm tra giá trị trả về có trong đa tập; bạn tự kiểm phân phối.
- Ràng buộc: `-2³¹ ≤ val ≤ 2³¹ − 1`, tối đa `10⁵` lần gọi. Mục tiêu: mọi thao tác O(1) trung bình.
- Ví dụ: `insert(1) → true, insert(1) → false, insert(2) → true, getRandom() → 1 hoặc 2 (1 với xác suất 2/3), remove(1) → true, getRandom() → 1 hoặc 2 (đều 1/2)`. (LeetCode 381)

### ex02 · PeekingIterator (class)
```java
class PeekingIterator {
  PeekingIterator(int[] nums)
  int peek()
  int next()
  boolean hasNext()
}
```
- Duyệt `nums` từ trái sang phải. `peek` trả phần tử kế tiếp mà **không** tiến. `next` trả và tiến. `peek/next` chỉ gọi khi `hasNext()` là `true`.
- Ràng buộc: `0 ≤ |nums| ≤ 10⁵`, `|nums[i]| ≤ 10⁹`. Mục tiêu: O(1) mỗi thao tác; tự cài cơ chế đệm (lookahead), coi `nums` như nguồn chỉ có `next/hasNext` (đừng chỉ dùng chỉ số — đó là phiên bản dễ; hãy làm bản đệm để tái dùng cho stream).
- Ví dụ: `[1,2,3]`: `next() → 1, peek() → 2, next() → 2, next() → 3, hasNext() → false`. (LeetCode 284)

### ex03 · ZigzagIterator (class)
```java
class ZigzagIterator {
  ZigzagIterator(int[] a, int[] b)
  int next()
  boolean hasNext()
}
```
- Trả lần lượt `a[0], b[0], a[1], b[1], …`; khi một mảng cạn thì trả phần còn lại của mảng kia. `next` chỉ gọi khi `hasNext()` là `true`.
- Ràng buộc: `0 ≤ |a|, |b| ≤ 5·10⁴`, `|a[i]|, |b[i]| ≤ 10⁹`. **Không** gộp trước hai mảng thành một mảng mới (O(1) bộ nhớ thêm).
- Ví dụ: `a=[1,2], b=[3,4,5,6]` → `1,3,2,4,5,6`. (LeetCode 281)

---

## 🔴 Tình huống nghiệp vụ (viết DESIGN.md)

Dịch vụ A/B test cần "chọn ngẫu nhiên một người dùng đang online để gửi khảo sát", online/offline thay đổi hàng nghìn lần/giây, 5 triệu người online.
1. Cấu trúc nào cho `join / leave / pickRandom` đều O(1)? Điều gì xảy ra nếu bạn dùng `Array.splice` ở `leave`?
2. Muốn chọn **có trọng số** (VIP ×5): đổi cấu trúc thế nào (gợi ý: cây Fenwick trên trọng số, O(log n))?
3. Chọn ngẫu nhiên phải tái lập được trong test: bạn tiêm RNG như thế nào?
