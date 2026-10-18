# A12 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A12-amortized-randomized [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A12-amortized-randomized 01` · Đo: `node tools/bench.ts lessons/A12-amortized-randomized 03`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 2 hint. Với bài ngẫu nhiên: nói rõ phần nào ngẫu nhiên, **cái gì được đảm bảo** (đúng luôn đúng / chỉ thời gian kỳ vọng / phân phối), và cách bạn *tự* kiểm tra. Với bài cấu trúc dữ liệu: chứng minh **amortized** (aggregate hoặc accounting).
Câu hỏi quy mô: (1) ex01 — dự đoán thời gian quickselect 2-way trên mảng 10⁵ phần tử chỉ có 3 giá trị, rồi `bench` bản 3-way. (2) ex03 — nếu mỗi `push` đều cấp phát mảng mới dài `size+1` thì 3·10⁵ lần `push` sao chép bao nhiêu phần tử?

> `Math.random()` / `random` / `Random` không tái lập được; checker vì thế chỉ kiểm tra **tính hợp lệ** hoặc dùng **RNG đặc tả trong đề** (ex06).

---

## 🟢 Cơ bản

### ex01 · Phần tử nhỏ thứ k (quickselect)
```java
int quickSelect(int[] nums, int k)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ k ≤ n`, `nums[i]` là `int`. Phần tử nhỏ thứ `k` (đếm từ 1, tính cả giá trị trùng); không làm thay đổi kết quả theo cách chọn pivot.
- Ví dụ: `[3,2,1,5,6,4], 2` → `2` · `[3,2,3,1,2,4,5,5,6], 4` → `3` · `[7], 1` → `7`.
- Mục tiêu: O(n) **kỳ vọng**. Sort rồi lấy là O(n log n). Cẩn thận dữ liệu trùng nhiều: partition 2-way trượt Perf — dùng 3-way.

### ex02 · Wiggle sort II
Sắp xếp lại `nums` **tại chỗ** sao cho `nums[0] < nums[1] > nums[2] < nums[3] > …`.
```java
void wiggleSortII(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ nums[i] ≤ 5000`. Đầu vào đảm bảo tồn tại đáp án. Nhiều đáp án hợp lệ — checker kiểm tra hoán vị + điều kiện zigzag **chặt**.
- Ví dụ: `[1,5,1,1,6,4]` → `[1,6,1,5,1,4]` (hoặc `[1,4,1,5,1,6]`…) · `[4,5,5,6]` → `[5,6,4,5]`.
- Gợi ý: sắp xếp rồi ghép hai nửa — nhưng **thứ tự duyệt mỗi nửa** quan trọng khi có giá trị trùng ở ranh giới. (Có lời giải O(n) kỳ vọng dùng quickselect, tùy chọn.) (LeetCode 324)

### ex03 · Dynamic array tự cài
Mô phỏng mảng động: **không dùng** `push/append/ArrayList` làm bộ nhớ chính; tự quản lý một mảng kích thước cố định và sao chép khi cần.
```java
class DynamicArray {
  DynamicArray()          // capacity ban đầu = 1
  void push(int x)        // nếu size == capacity: capacity *= 2 (sao chép) rồi thêm x
  int pop()               // xóa & trả phần tử cuối (chỉ gọi khi size > 0); sau đó nếu capacity > 1 và size · 4 ≤ capacity thì capacity /= 2
  int get(int i)          // 0 ≤ i < size
  int capacity()          // capacity hiện tại
}
```
- Ràng buộc: tối đa `3·10⁵` lần gọi, `|x| ≤ 10⁹`.
- Ví dụ: `push(10), capacity()=1, push(20), capacity()=2, push(30), capacity()=4, get(1)=20, pop()=30, capacity()=4, pop()=20, capacity()=2, pop()=10, capacity()=1`.
- Mục tiêu: `push`/`pop` O(1) **amortized**. Bản sao chép mỗi lần `push` trượt Perf. Giải thích vì sao ngưỡng co là `1/4` mà không phải `1/2`.

### ex04 · RandomizedSet O(1)
```java
class RandomizedSet {
  RandomizedSet()
  boolean insert(int val)     // true nếu val chưa có (và thêm vào)
  boolean remove(int val)     // true nếu val đang có (và xóa)
  int getRandom()             // trả về một phần tử đang có, mỗi phần tử cùng xác suất; chỉ gọi khi tập không rỗng
}
```
- Ràng buộc: tối đa `2·10⁵` lần gọi, `0 ≤ val ≤ 10⁷`.
- Ví dụ: `insert(1)=true, remove(2)=false, insert(2)=true, getRandom()∈{1,2}, remove(1)=true, insert(2)=false, getRandom()=2`. (LeetCode 380)
- Checker kiểm tra `insert`/`remove` đúng, `getRandom` thuộc tập hiện tại và **không** luôn trả cùng một giá trị. Mục tiêu: O(1) trung bình mỗi thao tác (gợi ý: mảng + hash map, xóa bằng cách đổi chỗ với phần tử cuối).

### ex05 · Skip list
```java
class Skiplist {
  Skiplist()
  boolean search(int target)
  void add(int num)           // cho phép thêm nhiều bản cùng giá trị
  boolean erase(int num)      // xóa MỘT bản của num; false nếu không có
}
```
- Ràng buộc: tối đa `10⁵` lần gọi, `0 ≤ num, target ≤ 10⁶`.
- Ví dụ: `add(1), add(2), add(3), search(0)=false, add(4), search(1)=true, erase(0)=false, erase(1)=true, search(1)=false`. (LeetCode 1206)
- Kết quả đúng **không phụ thuộc** random, nên so sánh chính xác. Mục tiêu: O(log n) kỳ vọng — cài skip list thật (tầng ngẫu nhiên, p = 1/2), hoặc cấu trúc sắp thứ tự khác nếu bạn muốn so sánh.

### ex06 · Reservoir sampling (RNG đặc tả)
Chọn `k` phần tử từ luồng `stream` chỉ bằng O(k) bộ nhớ phụ (Algorithm R), với RNG **cho trước** để kết quả tất định.
```java
int[] reservoirSample(int[] stream, int k, int seed)
```
- **Thuật toán chính xác:**
  1. `reservoir = stream[0..k)`.
  2. `state = seed`. Với mỗi `i` từ `k` đến `n − 1` (theo thứ tự): `state = (state · 48271) mod 2147483647`; `j = state mod (i + 1)`; nếu `j < k` thì `reservoir[j] = stream[i]`.
  3. Trả về `reservoir` (theo vị trí ô nhớ).
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁶`, `1 ≤ seed ≤ 2³¹ − 2`. Java: `state` dùng `long`. TS/Python: tích `state · 48271 < 2⁴⁷` nên chính xác.
- Ví dụ: `[10,20,30], k=1, seed=1` → `[30]` · `[1,2,3,4,5,6,7,8,9,10], k=3, seed=42` → `[1,2,8]` · `[5,6], k=2, seed=7` → `[5,6]`.
- Hỏi thêm: chứng minh mỗi phần tử có xác suất `k/n` (khi RNG lý tưởng).

---

## 🔴 Thực tế

### ex07 · k phần tử lớn nhất bằng quickselect
> "Bảng xếp hạng cần lấy k điểm cao nhất từ 10⁶ điểm, thứ tự trong top-k không quan trọng."

```java
int[] topKQuickselect(int[] nums, int k)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁶`, `nums[i]` là `int`. Trả về đúng `k` phần tử lớn nhất (giữ cả giá trị trùng), **thứ tự tùy ý**.
- Ví dụ: `[3,2,1,5,6,4], 2` → `[5,6]` (hoặc `[6,5]`) · `[1,1,1,2,2], 3` → `[1,2,2]`.
- Mục tiêu: O(n) kỳ vọng với quickselect. So sánh bằng `bench` với sort toàn bộ (O(n log n)) và heap kích thước k (O(n log k), chậm khi k lớn).

### ex08 · Xếp playlist không hai bài cùng nghệ sĩ liền nhau
> "Playlist có bài của các nghệ sĩ (mỗi bài ghi bằng một chữ cái thường). Sắp xếp lại sao cho **không có hai bài cùng nghệ sĩ liền nhau**. Không thể thì trả về chuỗi rỗng."

```java
String reorganizeString(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 5·10⁵`, chữ thường. Nhiều đáp án hợp lệ — checker kiểm tra hoán vị + không có hai ký tự kề nhau giống nhau; nếu không thể xếp, bắt buộc trả `""`.
- Ví dụ: `"aab"` → `"aba"` · `"aaab"` → `""` · `"aabbcc"` → bất kỳ cách xếp hợp lệ. (LeetCode 767)
- Gợi ý: điều kiện cần và đủ liên quan tới tần suất lớn nhất và `⌈n/2⌉`. Hai cách: heap (lấy hai ký tự phổ biến nhất) hoặc điền vị trí chẵn rồi lẻ theo tần suất giảm dần (O(n)).
