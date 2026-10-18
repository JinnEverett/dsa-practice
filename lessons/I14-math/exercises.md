# I14 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I14-math [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I14-math 01`

**Pass:** ≥ 8/10 bài qua `check`, ≤ 3 hint, và trả lời được **câu hỏi quy mô / chính xác** cuối file.

> Nhiều bài đã chọn giá trị để lộ **bẫy 2⁵³ của TypeScript** và **tràn `int` của Java**. Các tham số kiểu `long` luôn ≤ 2⁵³ − 1 để TS biểu diễn chính xác (kết quả `check` JSON không giữ được số lớn hơn).
> Ex03, 05, 06, 07, 10 không đo Perf (một lệnh gọi O(log)); sai Big-O vẫn bị bắt bằng test có `exp = 10¹⁵`, `n = 2³¹ − 1`...

---

## 🟢 Cơ bản

### ex01 · GCD của cả mảng
```java
int gcdOfArray(int[] nums)
```
- Ước chung lớn nhất của mọi phần tử.
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ nums[i] ≤ 10⁹`.
- Ví dụ: `[12,18,24]` → `6` · `[7,13]` → `1` · `[1000000000,1]` → `1`.
- Mục tiêu: Euclid bằng `%` (trừ liên tiếp sẽ quá giờ ở `[10⁹, 1]`).

### ex02 · Đếm số nguyên tố nhỏ hơn n
```java
int countPrimes(int n)
```
- Ràng buộc: `0 ≤ n ≤ 5·10⁶`. Đếm số nguyên tố **nhỏ hơn** `n`.
- Ví dụ: `10` → `4` (2, 3, 5, 7) · `2` → `0` · `1000000` → `78498`. (LeetCode 204)
- Mục tiêu: sàng Eratosthenes, O(n log log n); chia thử từng số là O(n√n) và quá giờ.

### ex03 · Lũy thừa modulo
```java
int modPow(long base, long exp, int mod)
```
- Trả về `base^exp mod mod`. Ràng buộc: `0 ≤ base, exp ≤ 2⁵³ − 1`, `1 ≤ mod ≤ 2³¹ − 1`; `0⁰ = 1`; `mod = 1` ⇒ `0`.
- Ví dụ: `2, 10, 1000` → `24` · `2, 10¹⁵, 10⁹+7` → `264444359` · `3, 0, 7` → `1`.
- **Bẫy:** `(a * b) % mod` trong TS mất chính xác khi `a·b > 2⁵³`; dùng `BigInt` hoặc nhân tách (`mulMod`).

### ex04 · C(n, r) modulo 10⁹+7
```java
int nCrMod(int n, int r)
```
- `C(n, r) mod (10⁹ + 7)`. Ràng buộc: `0 ≤ r ≤ n ≤ 10⁶`.
- Ví dụ: `5, 2` → `10` · `1000, 500` → `159835829` · `10⁶, 5·10⁵` → `996692777`.
- Mục tiêu: O(min(r, n−r) + log P); tam giác Pascal O(n·r) quá giờ. Dùng nghịch đảo Fermat cho phép chia.

---

## 🟡 Kết hợp

### ex05 · Số hạnh phúc
Lặp "thay `n` bằng tổng bình phương các chữ số của nó"; `n` là số hạnh phúc nếu quá trình dẫn tới `1`, ngược lại sẽ lặp trong một chu trình không chứa `1`.
```java
boolean isHappy(int n)
```
- Ràng buộc: `1 ≤ n ≤ 2³¹ − 1`.
- Ví dụ: `19` → `true` (19 → 82 → 68 → 100 → 1) · `2` → `false`. (LeetCode 202)

### ex06 · Đổi cơ số
```java
String toBase(long num, int base)
```
- Biểu diễn `num` trong cơ số `base` (`2 ≤ base ≤ 36`), chữ số `0–9` rồi `a–z` **viết thường**; số âm có dấu `-` đứng đầu; `0` → `"0"`. Không dùng hàm có sẵn (`Long.toString(n, base)` / `toString(base)`).
- Ràng buộc: `|num| ≤ 2⁵³ − 1`.
- Ví dụ: `255, 16` → `"ff"` · `-255, 16` → `"-ff"` · `35, 36` → `"z"` · `2⁵³ − 1, 36` → `"2gosa7pa2gv"`.

### ex07 · Chữ số 0 ở cuối n!
```java
int trailingZeroes(int n)
```
- Số chữ số `0` ở cuối của `n!`.
- Ràng buộc: `0 ≤ n ≤ 2³¹ − 1` (không thể tính `n!`; duyệt từng số cũng chậm).
- Ví dụ: `5` → `1` · `25` → `6` · `100` → `24` · `2147483647` → `536870902`. (LeetCode 172)

### ex08 · Phân số → số thập phân
Biểu diễn `numerator / denominator` dạng chuỗi; phần thập phân tuần hoàn đặt trong ngoặc tròn (chỉ phần lặp).
```java
String fractionToDecimal(int numerator, int denominator)
```
- Ràng buộc: `denominator ≠ 0`; `numerator`, `denominator` là `int` (kể cả `−2³¹`); kết quả `"0"` khi tử bằng 0 (không `-0`).
- Ví dụ: `1, 2` → `"0.5"` · `4, 333` → `"0.(012)"` · `-50, 8` → `"-6.25"` · `1, 6` → `"0.1(6)"` · `-2147483648, -1` → `"2147483648"`. (LeetCode 166)
- Mục tiêu: nhớ số dư đã gặp bằng bảng băm (O(|mẫu|)); tìm lại trong chuỗi bằng `indexOf` là O(|mẫu|²) và quá giờ ở mẫu `99989` (chu kỳ 99 988 chữ số).

---

## 🔴 Thực tế

### ex09 · Kiểm tra số thẻ / mã đơn bằng Luhn
> "Số thẻ và nhiều loại mã đơn có chữ số kiểm tra theo thuật toán Luhn: từ phải sang trái, nhân đôi chữ số thứ hai, thứ tư, ... (nếu kết quả > 9 thì trừ 9), cộng tất cả; mã hợp lệ nếu tổng chia hết cho 10."

```java
boolean luhnValid(String number)
```
- Ràng buộc: `1 ≤ |number| ≤ 10⁶`, chỉ gồm chữ số `0–9`.
- Ví dụ: `"79927398713"` → `true` · `"79927398710"` → `false` · `"4111111111111111"` → `true` · `"0"` → `true`.

### ex10 · Lần trùng lịch cron kế tiếp
> "Hai cron chạy mỗi `a` phút và mỗi `b` phút, tính từ phút 0 (tức tại các phút `0, a, 2a, ...` và `0, b, 2b, ...`). Phút sớm nhất, không nhỏ hơn `t`, mà cả hai cùng chạy?"

```java
long nextCollision(long a, long b, long t)
```
- Ràng buộc: `1 ≤ a, b ≤ 10⁷`, `0 ≤ t ≤ 10¹⁵`; đáp án vừa trong `long` (và trong 2⁵³ của TS).
- Ví dụ: `4, 6, 0` → `0` · `4, 6, 1` → `12` · `4, 6, 12` → `12` · `4, 6, 13` → `24`.
- Chú ý: `lcm` có thể tới ~10¹⁴ — mô phỏng từng phút là không khả thi.

---

## ❓ Câu hỏi quy mô / chính xác (làm sau khi qua ex03 và ex04)

1. **Dự đoán rồi chạy thử trong Node:** `2**53`, `2**53 + 1`, `(10**9 + 6) * (10**9 + 6)`, `((10**9 + 6) * (10**9 + 6)) % (10**9 + 7)`. So với kết quả đúng `1`. Giải thích tại sao ra sai.
2. Với `a, b < 2³¹`, khi nào `a * b` bắt đầu vượt 2⁵³ trong TS? Khi nào vượt `long` trong Java? (Tính `√2⁵³` và `√2⁶³`.)
3. `bench` ex04 ở `n = 10⁵, 10⁶` (chỉnh `benchScales` nếu cần): thời gian có tuyến tính theo `r` không? Bản dùng `BigInt` chậm hơn bản `mulMod` bao nhiêu lần?
