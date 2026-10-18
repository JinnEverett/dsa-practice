# S00 · Bài tập làm quen

Tạo file khung: `node tools/scaffold.ts lessons/S00-setup --lang ts` (hoặc `py`, `java`)
Chấm: `node tools/check.ts lessons/S00-setup 01`

**Pass:** 3/3 bài ✅ + chạy được `bench` cho ex02 ở cả 2 phiên bản (O(n²) và O(n)) và đọc được số mũ.
Khuyến khích: làm ex02 bằng **2 ngôn ngữ** để thấy khác biệt tốc độ và bẫy tràn số.

> Chữ ký trong đề viết kiểu Java; khung TS/Python do scaffold tự sinh (xem README mục 2).

---

### ex01 · Tổng mảng 🟢
Trả về tổng các phần tử của `nums`.

```java
int sum(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁶`, `-10³ ≤ nums[i] ≤ 10³` (nên |tổng| ≤ 10⁹, vừa kiểu `int`).
- Mảng rỗng → `0`.
- Ví dụ: `sum([1, 2, 3])` → `6` · `sum([])` → `0`.
- Mục tiêu: O(n) time, O(1) space.

### ex02 · Đếm cặp có tổng bằng k 🟡
Đếm số cặp chỉ số `(i, j)` với `i < j` và `nums[i] + nums[j] == k`.

```java
long countPairs(int[] nums, int k)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `-10⁹ ≤ nums[i], k ≤ 10⁹`. Có thể có phần tử trùng.
- Ví dụ:
  - `countPairs([1, 5, 3, 3, 3], 6)` → `4` (cặp (1,5) và 3 cặp (3,3))
  - `countPairs([2, 2, 2, 2], 4)` → `6`
  - `countPairs([], 0)` → `0`
- **Làm 2 lần:**
  1. Viết bản 2 vòng lặp lồng nhau O(n²). Chạy `check` — xem phần Perf. Chạy `node tools/bench.ts lessons/S00-setup 02 --scales s,m` và đọc số mũ.
  2. Viết lại bằng hash map đếm tần suất (`Map` / `dict`·`Counter` / `HashMap`), O(n). Chạy `check` + `bench --scales s,m,l` lần nữa. So sánh hai bảng.
- Java: vì sao kiểu trả về là `long`? Có 1 case trong `check` sẽ cho bạn câu trả lời.

### ex03 · Đảo ngược mảng tại chỗ 🟢
Đảo ngược `nums` **tại chỗ** (sửa trực tiếp mảng truyền vào), không trả về gì.

```java
void reverseInPlace(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁶`.
- Không dùng hàm đảo có sẵn (`reverse()`, `nums[::-1]`, `Collections.reverse`) và không tạo mảng mới (O(1) bộ nhớ phụ).
- Ví dụ: `[1, 2, 3, 4]` → `[4, 3, 2, 1]` · `[7]` → `[7]`.
