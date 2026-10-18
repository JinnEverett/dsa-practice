# A08 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A08-fenwick-segment-tree [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A08-fenwick-segment-tree 01` · Đo: `node tools/bench.ts lessons/A08-fenwick-segment-tree 01`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 2 hint. Trước khi code: nói **cấu trúc** (prefix sum / BIT / segment tree), vì sao, và độ phức tạp mỗi thao tác.
Câu hỏi quy mô (ex01): với `n = q = 10⁵`, quét thô O(n) mỗi truy vấn là bao nhiêu phép? Dự đoán thời gian rồi `bench`. Nếu dữ liệu **không** đổi, cấu trúc nào đơn giản hơn?

> Các bài class dùng định dạng gọi hàm `ops`/`args` như mọi bài class khác. Với bài tổng, Java cần `long`.

---

## 🟢 Cơ bản

### ex01 · Tổng đoạn có cập nhật (Fenwick)
```java
class NumArrayMutable {
  NumArrayMutable(int[] nums)
  void update(int index, int val)        // đặt nums[index] = val
  long sumRange(int left, int right)     // tổng nums[left..right], đóng hai đầu
}
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]|, |val| ≤ 10⁹`, tối đa `10⁵` lần gọi. Tổng tới `10¹⁴` → Java `long`.
- Ví dụ: `[1,3,5]`: `sumRange(0,2) → 9`, `update(1,2)`, `sumRange(0,2) → 8`. (LeetCode 307)
- Mục tiêu: dựng O(n), mỗi thao tác O(log n).

### ex02 · Đếm số phần tử nhỏ hơn bên phải
Với mỗi `i`, đếm số `j > i` có `nums[j] < nums[i]`.
```java
List<Integer> countSmaller(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`.
- Ví dụ: `[5,2,6,1]` → `[2,1,1,0]` · `[-1,-1]` → `[0,0]`. (LeetCode 315)
- Gợi ý: giá trị lớn ⇒ **nén tọa độ**, rồi duyệt từ phải sang trái với BIT.

### ex03 · Min đoạn có cập nhật (segment tree)
```java
class RangeMin {
  RangeMin(int[] nums)
  void update(int i, int val)      // đặt nums[i] = val
  int query(int l, int r)          // min của nums[l..r], đóng hai đầu
}
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, giá trị là `int` bất kỳ, tối đa `10⁵` lần gọi.
- Ví dụ: `[5,3,8]`: `query(0,2) → 3`, `update(1,10)`, `query(0,2) → 5`.
- BIT không làm được bài này vì sao? (gợi ý: min không có phép "trừ")

### ex04 · Đếm đoạn có tổng trong [lower, upper]
Số cặp `(i, j)`, `i ≤ j`, sao cho `lower ≤ nums[i] + … + nums[j] ≤ upper`.
```java
long countRangeSum(int[] nums, int lower, int upper)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁴`, `-10⁹ ≤ lower ≤ upper ≤ 10⁹`. Kết quả tới `n(n+1)/2 ≈ 5·10⁹` → Java `long`; tổng prefix cũng dùng `long`.
- Ví dụ: `[-2,5,-1], -2, 2` → `3` · `[0], 0, 0` → `1`. (LeetCode 327)
- Gợi ý: prefix sum + đếm cặp bằng BIT trên prefix đã nén.

### ex05 · Cặp đảo ngược quan trọng
Số cặp `(i, j)`, `i < j`, sao cho `nums[i] > 2 · nums[j]`.
```java
long reversePairs(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `nums[i]` là `int` bất kỳ (`-2³¹ … 2³¹−1`). Java: `2L * nums[j]`; kết quả `long`.
- Ví dụ: `[1,3,2,3,1]` → `2` · `[2,4,3,5,1]` → `3`. (LeetCode 493)

### ex06 · Cộng đoạn, tổng đoạn
```java
class RangeAddSum {
  RangeAddSum(int n)                  // mảng n phần tử, ban đầu toàn 0
  void add(int l, int r, long v)      // cộng v vào mọi phần tử l..r (đóng hai đầu)
  long sum(int l, int r)              // tổng l..r
}
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|v| ≤ 10⁴`, tối đa `10⁵` lần gọi (tổng luôn vừa `long`).
- Ví dụ: `n=5`: `add(1,3,2)`, `sum(0,4) → 6`, `add(2,4,1)`, `sum(2,3) → 6`.
- Hai hướng: **2 Fenwick** (mảng sai phân) hoặc **segment tree + lazy propagation**. Làm một, đọc README §5 cho cái còn lại.

---

## 🔴 Thực tế

### ex07 · Xếp hạng sau mỗi lần nộp bài
> "Hệ thống chấm bài nhận lần lượt `scores[i]`. Ngay khi bài `i` được nộp, hạng của nó = `1 +` số bài **đã nộp trước đó** có điểm **lớn hơn hẳn**. Bằng điểm thì cùng hạng. In hạng lúc nộp của từng bài."

```java
int[] rankAfterEachScore(int[] scores)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ scores[i] ≤ 10⁹`.
- Ví dụ: `[5,3,5,10,1]` → `[1,2,1,1,5]` · `[2,2,2]` → `[1,1,1]`.
- Mục tiêu: O(n log n). Đếm tuyến tính mỗi lần là O(n²).

### ex08 · Lịch đặt phòng: mức chồng chéo cao nhất
> "Phòng họp nhận các yêu cầu đặt `[start, end)` theo thứ tự **online** (không biết yêu cầu sau). Sau mỗi lần đặt, trả về số cuộc họp **cùng diễn ra tại một thời điểm** lớn nhất từ trước tới giờ."

```java
class MyCalendarThree {
  MyCalendarThree()
  int book(int startTime, int endTime)
}
```
- Ràng buộc: `0 ≤ startTime < endTime ≤ 10⁹`, tối đa `3·10⁴` lần gọi. Khoảng nửa mở: `[0,1)` và `[1,2)` không chồng.
- Ví dụ: `book(10,20)=1, book(50,60)=1, book(10,40)=2, book(5,15)=3, book(5,10)=3, book(25,55)=3`. (LeetCode 732)
- Gợi ý: tọa độ lớn và online ⇒ không nén trước được. **Segment tree động** (tạo node lười) hoặc cấu trúc sự kiện có thứ tự. Duy trì list sự kiện rồi quét lại mỗi lần là O(k²).
