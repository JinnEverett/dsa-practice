# I13 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I13-bit-manipulation [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I13-bit-manipulation 01`

**Pass:** ≥ 8/10 bài qua `check` (kể cả ex10 🔴 hoặc ex05), ≤ 3 hint.

> Nói trước khi code: nêu ý tưởng + độ phức tạp. ex02, ex04, ex05 dùng `long` (giá trị tới 2³² hoặc 2⁵³): **TS đừng tin toán tử bit ngoài int32**, Python mask `& 0xFFFFFFFF`, Java dùng `long`.
> ex02–ex05: không dùng hàm có sẵn (`bitCount`, `bit_count`, `toString(2)`…) — mục tiêu là tự làm bằng phép bit.

---

## 🟢 Cơ bản

### ex01 · Số xuất hiện một lần
Mọi số xuất hiện đúng 2 lần, trừ một số xuất hiện đúng 1 lần. Tìm số đó.
```java
int singleNumber(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵` (n lẻ), `nums[i]` thuộc int32.
- Ví dụ: `[2,2,1]` → `1` · `[4,1,2,1,2]` → `4`.
- Mục tiêu: O(n) thời gian, **O(1)** bộ nhớ. (LeetCode 136)

### ex02 · Đếm bit 1
```java
int hammingWeight(long n)
```
- Ràng buộc: `0 ≤ n < 2³²` (số 32-bit không dấu, nên cần `long`).
- Ví dụ: `11` → `3` · `128` → `1` · `4294967293` → `31`.
- Mục tiêu: số vòng lặp bằng số bit 1 (Kernighan). (LeetCode 191)

### ex03 · Đếm bit cho 0..n
Trả về mảng `ans` có `ans[i]` = số bit 1 của `i`, với `0 ≤ i ≤ n`.
```java
int[] countBits(int n)
```
- Ràng buộc: `0 ≤ n ≤ 10⁶`.
- Ví dụ: `5` → `[0,1,1,2,1,2]`.
- Mục tiêu: O(n) toàn bộ (mỗi ô O(1) nhờ ô đã tính), không gọi popcount từng số. (LeetCode 338)

### ex04 · Lũy thừa của 2
```java
boolean isPowerOfTwo(long n)
```
- Ràng buộc: `|n| < 2⁵³`. Lũy thừa của 2 là `2^k` với `k ≥ 0`.
- Ví dụ: `16` → `true` · `3` → `false` · `0`, `−2` → `false` · `4294967297` (2³² + 1) → `false`.
- Mục tiêu: O(1). Chú ý TS: giá trị vượt 32 bit. (LeetCode 231)

### ex05 · Đảo 32 bit
Đảo thứ tự 32 bit của `n` (xem `n` là số 32-bit không dấu) và trả về giá trị không dấu.
```java
long reverseBits(long n)
```
- Ràng buộc: `0 ≤ n < 2³²`; kết quả cũng trong `[0, 2³²)`.
- Ví dụ: `43261596` → `964176192` · `1` → `2147483648` · `4294967293` → `3221225471`.
- Mục tiêu: O(32); kết quả có thể ≥ 2³¹ → TS phải ép về không dấu. (LeetCode 190)

---

## 🟡 Kết hợp

### ex06 · Số bị thiếu
`nums` có `n` số khác nhau lấy từ `[0, n]`. Tìm số bị thiếu.
```java
int missingNumber(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`.
- Ví dụ: `[3,0,1]` → `2` · `[0,1]` → `2` · `[9,6,4,2,3,5,7,0,1]` → `8`.
- Mục tiêu: O(n) thời gian, O(1) bộ nhớ, không dùng tổng (`n(n+1)/2` ≈ 5·10⁹ vượt `int`). Duyệt `includes` cho từng số sẽ trượt Perf. (LeetCode 268)

### ex07 · Số xuất hiện một lần, còn lại ba lần
```java
int singleNumberII(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵` (`n mod 3 = 1`), `nums[i]` thuộc int32 (có thể âm); đúng một số xuất hiện 1 lần, các số khác đúng 3 lần.
- Ví dụ: `[2,2,3,2]` → `3` · `[0,1,0,1,0,1,99]` → `99` · `[-2,-2,1,1,4,1,4,4,-4,-2]` → `-4`.
- Mục tiêu: O(n), O(1) bộ nhớ. Gợi ý khái niệm: đếm số lần mỗi bit bật **mod 3**. Python: nhớ xử lý dấu khi ráp 32 bit. (LeetCode 137)

### ex08 · Hai số xuất hiện một lần
```java
int[] singleNumberIII(int[] nums)
```
- Ràng buộc: `2 ≤ n ≤ 10⁵` (n chẵn), int32; đúng hai số xuất hiện 1 lần (khác nhau), các số khác đúng 2 lần.
- Output: hai số, **tăng dần**.
- Ví dụ: `[1,2,1,3,2,5]` → `[3,5]` · `[-1,0]` → `[-1,0]` · `[-2147483648,4,4,0]` → `[-2147483648,0]`.
- Mục tiêu: O(n), O(1) bộ nhớ. (LeetCode 260)

### ex09 · AND của đoạn
Trả về AND của mọi số nguyên trong `[left, right]`.
```java
int rangeBitwiseAnd(int left, int right)
```
- Ràng buộc: `0 ≤ left ≤ right ≤ 2³¹ − 1`.
- Ví dụ: `5, 7` → `4` · `0, 0` → `0` · `1, 2147483647` → `0` · `2³⁰, 2³¹−1` → `2³⁰`.
- **Câu hỏi quy mô (trả lời trước khi code):** nếu AND lần lượt từng số trong đoạn, với `[2³⁰, 2³¹ − 1]` cần bao nhiêu bước? Ước lượng thời gian bằng `bench`/`check` (bản lặp tuyến tính chạy khoảng 1.4 s trong lần đo thử ở máy soạn đề, so với < 0.1 ms của bản O(31)).
- Mục tiêu: O(log max). (LeetCode 201)

---

## 🔴 Thực tế

### ex10 · Gói feature flag tối thiểu
> "Mỗi cờ tính năng là một bit (tối đa 20 cờ). Có tối đa 15 gói cấu hình, mỗi gói bật một tập cờ (`sets[i]` là bitmask). Kích hoạt nhiều gói thì cờ được **OR** lại. Cần bật **đúng** tập cờ `target` — không thừa cờ nào. Ít nhất bao nhiêu gói? Không có cách nào thì trả `−1`."

```java
int minFlagSets(int target, int[] sets)
```
- Ràng buộc: `0 ≤ target < 2²⁰`, `0 ≤ m = sets.length ≤ 15`, `0 ≤ sets[i] < 2²⁰`.
- Ví dụ: `7, [1,2,4,3]` → `2` (4 + 3) · `3, [1,4]` → `−1` (gói 4 bật cờ thừa, gói 1 không đủ) · `0, []` → `0`.
- Gợi ý khái niệm: mỗi tập gói là một `mask ∈ [0, 2^m)`; tính OR của mỗi mask từ mask nhỏ hơn thay vì tính lại. Mục tiêu: O(2^m).
