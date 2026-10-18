# F01 · Bài tập

**Pass:** đoán đúng ≥ 8/10 đoạn code ở phần A **và** ≥ 5/6 bài code ở phần B qua `check`.

---

## Phần A · Đoán độ phức tạp (b01–b10)

Mở `snippets.ts` (viết bằng TS nhưng đọc như mã giả — nếu bạn dùng Python/Java, cấu trúc vòng lặp y hệt). Với mỗi hàm, **viết dự đoán Big-O thời gian và bộ nhớ vào `answers/bigo.md`** trước, rồi kiểm chứng:

```bash
node tools/bench.ts lessons/F01-big-o b01 --src solutions --scales s,m,l
```

Đọc cột **số mũ**: ≈0 → O(1)/O(log n), ≈1 → O(n), ≈1.1 → O(n log n), ≈2 → O(n²). b08 dùng n nhỏ (10–30) vì tăng rất nhanh.
Đáp án + giải thích ở cuối `solutions.ts` (mục "Đáp án phần A").

---

## Phần B · Viết code (01–06)

Tạo khung: `node tools/scaffold.ts lessons/F01-big-o [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F01-big-o 01`
Chữ ký viết kiểu Java; khung TS/Python do scaffold sinh.

### ex01 · Có phần tử trùng không? 🟢
Trả về `true` nếu có ít nhất một giá trị xuất hiện ≥ 2 lần.

```java
boolean hasDuplicate(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `-10⁹ ≤ nums[i] ≤ 10⁹`.
- Ví dụ: `[1, 2, 3, 1]` → `true` · `[1, 2, 3]` → `false` · `[]` → `false`.
- Mục tiêu: O(n) time. (Bản 2 vòng lặp O(n²) sẽ trượt Perf.)
- LeetCode 217.

### ex02 · Bỏ trùng, giữ thứ tự xuất hiện 🟢
Trả về mảng mới gồm các giá trị khác nhau của `nums`, theo **thứ tự xuất hiện lần đầu**. Không sửa `nums`.

```java
int[] uniqueInOrder(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`.
- Ví dụ: `[3, 1, 3, 2, 1]` → `[3, 1, 2]` · `[]` → `[]`.
- Mục tiêu: O(n). Bẫy: `out.includes(x)` trong vòng lặp là O(n²).

### ex03 · Giao của hai mảng 🟡
Trả về các giá trị **khác nhau** xuất hiện ở cả `a` và `b`, sắp xếp **tăng dần**.

```java
int[] intersection(int[] a, int[] b)
```
- Ràng buộc: `0 ≤ |a|, |b| ≤ 10⁵`, giá trị trong `[-10⁹, 10⁹]`.
- Ví dụ: `a = [4, 9, 5, 9], b = [9, 4, 9, 8, 4]` → `[4, 9]` · `a = [1], b = []` → `[]`.
- Mục tiêu: O((n + m) log(n + m)) hoặc tốt hơn. Nhớ bẫy `sort()` mặc định.
- LeetCode 349.

### ex04 · Tổng các bội của 3 hoặc 5 🟡
Tính tổng mọi số nguyên `x` với `0 ≤ x < n` mà `x` chia hết cho 3 **hoặc** 5.

```java
long sumOfMultiples(int n)
```
- Ràng buộc: `0 ≤ n ≤ 10⁸`. Kết quả tới ~2.3 × 10¹⁵: vừa `number` của JS (< 2⁵³), nhưng Java phải tính bằng `long` **ngay trong phép nhân**.
- Ví dụ: `sumOfMultiples(10)` → `23` (3 + 5 + 6 + 9) · `sumOfMultiples(0)` → `0` · `sumOfMultiples(16)` → `60`.
- Mục tiêu: **O(1)**. Vòng lặp O(n) sẽ trượt Perf (giới hạn 20 ms ở n = 10⁸).
- Gợi ý nhỏ: tổng 1 + 2 + … + m = m(m + 1)/2. Cẩn thận số vừa chia hết cho 3 vừa chia hết cho 5.

### ex05 · Giá trị xuất hiện nhiều nhất 🟡
Trả về giá trị có tần suất cao nhất. Nếu hòa, trả về **giá trị nhỏ nhất** trong số đó.

```java
int mostFrequent(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `-10⁹ ≤ nums[i] ≤ 10⁹`.
- Ví dụ: `[1, 3, 3, 2, 1]` → `1` (1 và 3 cùng 2 lần, chọn 1) · `[5]` → `5` · `[-2, -2, 7]` → `-2`.
- Mục tiêu: O(n).

### ex06 · Cặp có tổng chia hết cho k 🔴
> "Hệ thống thanh toán gom các giao dịch thành cặp để quyết toán. Một cặp hợp lệ khi tổng số tiền chia hết cho `k`. Đếm số cặp `(i, j)`, `i < j`."

```java
long countDivisiblePairs(int[] amounts, int k)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `1 ≤ k ≤ 10⁵`, `-10⁹ ≤ amounts[i] ≤ 10⁹` (**có số âm**: hoàn tiền).
- Ví dụ:
  - `countDivisiblePairs([1, 2, 3, 4, 5], 3)` → `4` (1+2, 1+5, 2+4, 4+5)
  - `countDivisiblePairs([-1, 1, 4], 3)` → `2` ((-1, 1) tổng 0 và (-1, 4) tổng 3; số 0 cũng chia hết cho 3)
  - `countDivisiblePairs([], 7)` → `0`
- Mục tiêu: O(n + k).
- Bẫy: trong JS và Java `-1 % 3 == -1`, không phải `2` (Python thì `-1 % 3 == 2`).
- LeetCode 1010 (biến thể).
