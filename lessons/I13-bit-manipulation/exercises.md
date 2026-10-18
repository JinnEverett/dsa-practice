# I13 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I13-bit-manipulation [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I13-bit-manipulation 01`

**Pass:** ≥ 8/10 bài qua `check`, ≤ 3 hint, và trả lời được **câu hỏi quy mô** cuối file.

> Phần lớn test là **bẫy int32/2⁵³**: số ≥ 2³¹, ≥ 2³², số âm, `−2³¹`. Nếu bạn dùng `n >> 1`, `n & (n − 1)` trực tiếp trên số lớn trong TS, `check` sẽ cho phản ví dụ cụ thể.
> Bài 01, 02, 04, 05, 06, 09, 10 không đo Perf (một lệnh gọi O(1)/O(32), hoặc kích thước cố định).

---

## 🟢 Cơ bản

### ex01 · Số xuất hiện một lần
```java
int singleNumber(int[] nums)
```
- Mọi số xuất hiện **hai lần** trừ đúng một số xuất hiện một lần. Trả về số đó. Mục tiêu: O(n) thời gian, **O(1) bộ nhớ**.
- Ràng buộc: `1 ≤ n ≤ 2·10⁵` (n lẻ), `−2³¹ ≤ nums[i] ≤ 2³¹ − 1`.
- Ví dụ: `[2,2,1]` → `1` · `[4,1,2,1,2]` → `4` · `[-5,3,3]` → `-5`. (LeetCode 136)

### ex02 · Đếm bit 1
```java
int hammingWeight(long n)
```
- Số bit `1` trong biểu diễn nhị phân của `n`.
- Ràng buộc: `0 ≤ n < 2³²` (dùng `long` vì `int` có dấu không chứa được).
- Ví dụ: `11` → `3` · `128` → `1` · `2147483648` → `1` · `4294967295` → `32`. (LeetCode 191)

### ex03 · Đếm bit 1 của 0..n
```java
int[] countBits(int n)
```
- Trả về mảng `ans` độ dài `n + 1` với `ans[i]` = số bit 1 của `i`. Mục tiêu: O(n) tổng, không đếm lại từ đầu cho mỗi số.
- Ràng buộc: `0 ≤ n ≤ 10⁶`.
- Ví dụ: `5` → `[0,1,1,2,1,2]`. (LeetCode 338)

### ex04 · Có là lũy thừa của 2?
```java
boolean isPowerOfTwo(long n)
```
- Ràng buộc: `−(2⁵³ − 1) ≤ n ≤ 2⁵³ − 1` (để TS biểu diễn chính xác). Số không dương → `false`.
- Ví dụ: `1` → `true` · `16` → `true` · `3` → `false` · `4294967297` (2³² + 1) → `false` · `1125899906842624` (2⁵⁰) → `true`. (LeetCode 231, mở rộng cho số lớn)
- **Bẫy:** `n & (n − 1) === 0` trong JS cho kết quả sai khi `n ≥ 2³²`.

---

## 🟡 Kết hợp

### ex05 · Đảo 32 bit
Đảo thứ tự 32 bit của `n` (bit 0 ↔ bit 31, ...), trả về giá trị **không dấu**.
```java
long reverseBits(long n)
```
- Ràng buộc: `0 ≤ n < 2³²`; kết quả cũng trong `[0, 2³²)`.
- Ví dụ: `43261596` → `964176192` · `1` → `2147483648` · `4294967293` → `3221225471`. (LeetCode 190)

### ex06 · Số bị thiếu
```java
int missingNumber(int[] nums)
```
- `nums` gồm `n` số **khác nhau** trong `[0, n]`; trả về số duy nhất trong `[0, n]` không có mặt. Mục tiêu: O(n), O(1) bộ nhớ.
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[3,0,1]` → `2` · `[0,1]` → `2` · `[9,6,4,2,3,5,7,0,1]` → `8`. (LeetCode 268)

### ex07 · Số xuất hiện một lần (các số khác 3 lần)
```java
int singleNumberII(int[] nums)
```
- Mọi số xuất hiện **ba lần** trừ đúng một số xuất hiện một lần. Mục tiêu: O(n) thời gian, O(1) bộ nhớ.
- Ràng buộc: `1 ≤ n ≤ 10⁵` (n ≡ 1 mod 3), `−2³¹ ≤ nums[i] ≤ 2³¹ − 1` — **gồm số âm**.
- Ví dụ: `[2,2,3,2]` → `3` · `[0,1,0,1,0,1,99]` → `99` · `[-2,-2,1,1,4,1,4,4,-4,-2]` → `-4`. (LeetCode 137)
- Gợi ý nhẹ: với từng vị trí bit, số lần bit đó bật trong cả mảng là bội của 3 cộng với đóng góp của số cần tìm.

### ex08 · Hai số xuất hiện một lần
```java
int[] singleNumberIII(int[] nums)
```
- Đúng hai số xuất hiện **một** lần, mọi số khác xuất hiện **hai** lần. Trả về hai số đó **theo thứ tự tăng dần**. Mục tiêu: O(n), O(1) bộ nhớ.
- Ràng buộc: `2 ≤ n ≤ 10⁵`, `−2³¹ ≤ nums[i] ≤ 2³¹ − 1`.
- Ví dụ: `[1,2,1,3,2,5]` → `[3,5]` · `[-1,0]` → `[-1,0]`. (LeetCode 260)

### ex09 · AND của cả khoảng
```java
int rangeBitwiseAnd(int left, int right)
```
- Trả về AND của mọi số nguyên trong `[left, right]` (cả hai đầu).
- Ràng buộc: `0 ≤ left ≤ right ≤ 2³¹ − 1` (khoảng có thể dài tới 2·10⁹ — không lặp từng số).
- Ví dụ: `5, 7` → `4` · `0, 0` → `0` · `1, 2147483647` → `0`. (LeetCode 201)

---

## 🔴 Thực tế

### ex10 · Ít gói feature flag nhất
> "Mỗi gói bật một tập cờ tính năng, mã hóa thành bitmask (bit i = cờ i). Ta cần bật **đúng** tập cờ `target` — gói nào bật thêm cờ ngoài `target` thì không được dùng. Cần ít nhất bao nhiêu gói để OR của chúng bằng đúng `target`? Không thể → `-1`."

```java
int minFlagSets(int target, int[] sets)
```
- Ràng buộc: `0 ≤ |sets| ≤ 15`, `0 ≤ sets[i], target < 2²⁰`. `target = 0` → `0` (không cần gói nào). Mỗi gói dùng tối đa một lần.
- Ví dụ: `7, [1,2,4]` → `3` · `7, [3,4]` → `2` · `7, [1,2]` → `-1` · `3, [1,2,3,4]` → `1` (gói `4` có cờ ngoài target) · `0, [1,2]` → `0`.
- Mục tiêu: O(2^m) với OR của tập con tính từ tập con nhỏ hơn (không OR lại từ đầu).

---

## ❓ Câu hỏi quy mô / chính xác (làm sau khi qua ex02 và ex04)

1. **Dự đoán rồi chạy thử trong Node:** `(2**32 + 1) & 1`, `(2**40 + 8) & (2**40 + 7)`, `1 << 32`, `4294967295 >> 0`, `4294967295 >>> 0`. Giải thích từng kết quả bằng "ép về int32".
2. `hammingWeight` bằng Kernighan lặp tối đa bao nhiêu lần ở `n < 2³²`? Còn bản kiểm tra 32 bit thì sao? Hai bản khác nhau bao nhiêu lần ở `10⁷` lần gọi (dự đoán rồi `bench` nếu muốn)?
3. `minFlagSets` ở `m = 20` gói có `2²⁰ ≈ 10⁶` tập con; ở `m = 25` là bao nhiêu? Với tốc độ ~10⁸ phép/giây và O(1) mỗi tập con, mất bao lâu? Còn nếu OR lại từ đầu mỗi tập con (O(m))?
