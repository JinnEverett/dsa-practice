# I04 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I04-heap [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I04-heap 01`

**Pass:** ex01 qua `check` (heap tự cài) **và** ≥ 6/9 bài còn lại, ≤ 2 hint.

> ex01, ex02: **tự cài**, không dùng `heapq`/`PriorityQueue`/sort.
> ex03–ex10: TS tự viết `answers/heap.ts` (lớp `Heap<T>` có comparator) rồi import; Python dùng `heapq`; Java dùng `PriorityQueue`.

---

## 🟢 Cơ bản

### ex01 · Tự cài min-heap (class)
```java
class MinHeap {
  MinHeap()
  void push(int x)
  int pop()        // lấy và xóa phần tử nhỏ nhất; chỉ gọi khi size() > 0
  int peek()       // xem phần tử nhỏ nhất; chỉ gọi khi size() > 0
  int size()
}
```
- Ràng buộc: tối đa `2·10⁵` lần gọi, `|x| ≤ 10⁹`.
- Ví dụ: `push(5), push(1), push(3), peek() → 1, pop() → 1, pop() → 3, size() → 1`.
- Mục tiêu: `push`/`pop` O(log n). Mảng + sort hoặc tìm min tuyến tính sẽ trượt Perf.

### ex02 · Heap sort
Sắp tăng dần **tại chỗ** bằng heap (heapify O(n) rồi lặp đưa max về cuối). Không dùng sort có sẵn.
```java
void heapSort(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `[5,2,3,1]` → `[1,2,3,5]`. Mục tiêu: O(n log n), O(1) bộ nhớ phụ.

### ex03 · Phần tử lớn thứ k
```java
int findKthLargest(int[] nums, int k)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁵`.
- Ví dụ: `[3,2,1,5,6,4], 2` → `5` · `[3,2,3,1,2,4,5,5,6], 4` → `4`.
- Mục tiêu: O(n log k) bằng min-heap kích thước k. (Quickselect O(n) trung bình ở A12.) (LeetCode 215)

### ex04 · Phần tử lớn thứ k trong stream (class)
```java
class KthLargest {
  KthLargest(int k, int[] nums)
  int add(int val)      // thêm val, trả về phần tử lớn thứ k hiện tại
}
```
- Ràng buộc: `1 ≤ k ≤ 10⁴`, `0 ≤ |nums| ≤ 10⁴`, tối đa `10⁵` lần `add`; mỗi lần `add` bảo đảm có ≥ k phần tử.
- Ví dụ: `KthLargest(3, [4,5,8,2])`: `add(3) → 4, add(5) → 5, add(10) → 5, add(9) → 8, add(4) → 8`. (LeetCode 703)

---

## 🟡 Kết hợp

### ex05 · Đập đá
Mỗi lượt lấy 2 viên nặng nhất `x ≤ y` đập vào nhau: bằng nhau thì cả hai biến mất, không thì còn lại viên nặng `y − x`. Trả về khối lượng viên cuối cùng (không còn viên nào → 0).
```java
int lastStoneWeight(int[] stones)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ stones[i] ≤ 10⁹`.
- Ví dụ: `[2,7,4,1,8,1]` → `1` · `[1]` → `1`. (LeetCode 1046)

### ex06 · k điểm gần gốc tọa độ nhất
Trả về `k` điểm có khoảng cách Euclid tới (0,0) nhỏ nhất, thứ tự tùy ý. Nếu có nhiều cách chọn (khoảng cách bằng nhau ở ranh giới) thì cách nào cũng được.
```java
int[][] kClosest(int[][] points, int k)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁵`, `|x|, |y| ≤ 10⁴`.
- Ví dụ: `[[1,3],[-2,2]], 1` → `[[-2,2]]` · `[[3,3],[5,-1],[-2,4]], 2` → `[[3,3],[-2,4]]`.
- So sánh bằng **bình phương** khoảng cách (không cần căn). (LeetCode 973)

### ex07 · Gộp k mảng đã sort
```java
int[] mergeKArrays(int[][] arrays)
```
- Ràng buộc: `0 ≤ k ≤ 10⁴`, tổng số phần tử `N ≤ 10⁵`, mỗi mảng không giảm.
- Ví dụ: `[[1,4,5],[1,3,4],[2,6]]` → `[1,1,2,3,4,4,5,6]` · `[[],[]]` → `[]`.
- Mục tiêu: O(N log k) bằng heap chứa `(giá trị, chỉ số mảng, chỉ số phần tử)`. Nối hết rồi sort là O(N log N) — đúng nhưng không phải mục tiêu bài.

### ex08 · Median của stream (class)
```java
class MedianFinder {
  MedianFinder()
  void addNum(int num)
  double findMedian()   // chỉ gọi khi đã có ít nhất 1 số
}
```
- Ràng buộc: tối đa `10⁵` lần gọi, `|num| ≤ 10⁵`. Kết quả so với sai số 10⁻⁶.
- Ví dụ: `addNum(1), addNum(2), findMedian() → 1.5, addNum(3), findMedian() → 2.0`.
- Mục tiêu: `addNum` O(log n), `findMedian` O(1). (LeetCode 295)

---

## 🔴 Thực tế

### ex09 · Số phòng họp tối thiểu
> "Lịch họp trong ngày gồm các khoảng `[start, end)`. Cần ít nhất bao nhiêu phòng để không cuộc họp nào chồng nhau trong cùng phòng? (Cuộc họp kết thúc lúc `t` nhường phòng cho cuộc họp bắt đầu lúc `t`.)"

```java
int minMeetingRooms(int[][] intervals)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ start < end ≤ 10⁹`.
- Ví dụ: `[[0,30],[5,10],[15,20]]` → `2` · `[[7,10],[2,4]]` → `1` · `[[1,5],[5,10]]` → `1`. (LeetCode 253)

### ex10 · CPU đơn luồng
> "Job `i` có `[enqueueTime, processingTime]`. CPU xử lý **một** job một lúc, không ngắt giữa chừng. Khi rảnh, nó chọn trong các job **đã đến** job có `processingTime` nhỏ nhất (bằng nhau thì chỉ số nhỏ hơn). Nếu không có job nào đã đến thì chờ tới job đến sớm nhất. Trả về thứ tự xử lý."

```java
int[] getOrder(int[][] tasks)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ thời gian ≤ 10⁹` (thời điểm hiện tại có thể vượt `int` → Java dùng `long`).
- Ví dụ: `[[1,2],[2,4],[3,2],[4,1]]` → `[0,2,3,1]` · `[[7,10],[7,12],[7,5],[7,4],[7,2]]` → `[4,3,2,0,1]`. (LeetCode 1834)
