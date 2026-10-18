# A10 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A10-binary-search-answer [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A10-binary-search-answer 01` · Đo: `node tools/bench.ts lessons/A10-binary-search-answer 01`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 2 hint. Trước mỗi bài: nói **đáp án là gì**, **cận `lo/hi`**, **hàm `ok(x)` và vì sao đơn điệu**, **nhỏ nhất hay lớn nhất** (khuôn nào), độ phức tạp.
Câu hỏi quy mô (ex01): đáp án nằm trong `[1, 10⁹]` và mỗi lần kiểm tra tốn O(n) với `n = 10⁵`. Thử từng tốc độ tốn bao nhiêu phép? Binary search tốn bao nhiêu? Dự đoán rồi `bench`.

---

## 🟢 Cơ bản

### ex01 · Koko ăn chuối
Có `n` đống chuối `piles[i]`. Mỗi giờ Koko chọn một đống và ăn tối đa `k` quả (đống ít hơn `k` thì ăn hết đống, phần còn lại của giờ bỏ phí). Tốc độ `k` nhỏ nhất để ăn hết trong `h` giờ?
```java
int minEatingSpeed(int[] piles, int h)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `n ≤ h ≤ 10⁹`, `1 ≤ piles[i] ≤ 10⁹`. Tổng số giờ cần có thể tới `10¹⁴` → Java `long` (hoặc dừng sớm khi vượt `h`).
- Ví dụ: `[3,6,7,11], 8` → `4` · `[30,11,23,4,20], 5` → `30` · `[30,11,23,4,20], 6` → `23`. (LeetCode 875)

### ex02 · Tàu chở hàng trong D ngày
Các kiện hàng xếp thứ tự, mỗi ngày tàu chở một đoạn liên tiếp với tổng ≤ sức tải. Sức tải nhỏ nhất để chở hết trong `days` ngày?
```java
int shipWithinDays(int[] weights, int days)
```
- Ràng buộc: `1 ≤ days ≤ n ≤ 10⁵`, `1 ≤ weights[i] ≤ 10⁴` (tổng ≤ `10⁹`).
- Ví dụ: `[1,2,3,4,5,6,7,8,9,10], 5` → `15` · `[3,2,2,4,1,4], 3` → `6`. (LeetCode 1011)

### ex03 · Chia mảng k phần, cực tiểu hóa tổng lớn nhất
Chia mảng thành đúng `k` đoạn liên tiếp không rỗng sao cho **tổng lớn nhất của một đoạn** nhỏ nhất có thể.
```java
long splitArray(int[] nums, int k)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁵`, `1 ≤ nums[i] ≤ 10⁹`. Tổng tới `10¹⁴` → Java `long`.
- Ví dụ: `[7,2,5,10,8], 2` → `18` · `[1,2,3,4,5], 2` → `9`. (LeetCode 410)
- Nhận xét: cùng khuôn với ex02 — chỉ khác phát biểu. Hãy chỉ ra tương ứng.

### ex04 · Ngày sớm nhất làm đủ bó hoa
Hoa `i` nở vào ngày `bloomDay[i]`. Một bó cần `k` hoa **liền kề** đã nở. Ngày sớm nhất để làm đủ `m` bó; không thể → `-1`.
```java
int minDays(int[] bloomDay, int m, int k)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ bloomDay[i] ≤ 10⁹`, `1 ≤ m ≤ 10⁶`, `1 ≤ k ≤ n`. `m · k` tới `10¹¹` → Java `long`.
- Ví dụ: `[1,10,3,10,2], m=3, k=1` → `3` · `[1,10,3,10,2], m=3, k=2` → `-1` · `[7,7,7,7,12,7,7], m=2, k=3` → `12`. (LeetCode 1482)

### ex05 · Ước số nhỏ nhất
Chọn số nguyên dương `d`, chia mọi phần tử cho `d` làm tròn **lên**, cộng lại. Tìm `d` nhỏ nhất để tổng ≤ `threshold`.
```java
int smallestDivisor(int[] nums, int threshold)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ nums[i] ≤ 10⁶`, `n ≤ threshold ≤ 10⁶`.
- Ví dụ: `[1,2,5,9], 6` → `5` · `[44,22,33,11,1], 5` → `44`. (LeetCode 1283)

### ex06 · Phần tử nhỏ thứ k trong bảng cửu chương
Bảng `m × n` có ô `(i, j) = i · j` (`1 ≤ i ≤ m`, `1 ≤ j ≤ n`). Giá trị nhỏ thứ `k` (tính cả trùng lặp) khi sắp tất cả các ô?
```java
int findKthNumber(int m, int n, int k)
```
- Ràng buộc: `1 ≤ m, n ≤ 3·10⁴`, `1 ≤ k ≤ m · n` (≤ `9·10⁸`, vừa `int`).
- Ví dụ: `(3, 3, 5)` → `3` (bảng sắp: 1,2,2,3,3,4,6,6,9) · `(2, 3, 6)` → `6`. (LeetCode 668)
- Gợi ý: đếm số ô `≤ x` trong O(m). Không dựng bảng (9·10⁸ ô).

---

## 🔴 Thực tế

### ex07 · Đặt router xa nhau nhất
> "Có `n` vị trí đặt router trên một đường thẳng (tọa độ khác nhau, **chưa sắp xếp**). Chọn đúng `m` vị trí để **khoảng cách nhỏ nhất giữa hai router kề nhau là lớn nhất có thể**. Trả về khoảng cách đó."

```java
int maxDistance(int[] position, int m)
```
- Ràng buộc: `2 ≤ m ≤ n ≤ 10⁵`, `1 ≤ position[i] ≤ 10⁹` (khác nhau).
- Ví dụ: `[1,2,3,4,7], 3` → `3` (đặt ở 1, 4, 7) · `[5,4,3,2,1,1000000000], 2` → `999999999`. (LeetCode 1552)
- Chú ý khuôn "lớn nhất": `mid` làm tròn **lên**, nếu không sẽ lặp vô hạn. Sắp xếp số: comparator số học (TS), không sort chuỗi.

### ex08 · Thêm trạm xăng: khoảng cách lớn nhất nhỏ nhất
> "Dọc đường cao tốc đã có các trạm xăng ở vị trí `stations` (tăng ngặt). Thêm đúng `k` trạm mới **ở bất kỳ vị trí thực nào** để khoảng cách lớn nhất giữa hai trạm kề nhau là nhỏ nhất có thể. Trả về khoảng cách đó."

```java
double minmaxGasDist(int[] stations, int k)
```
- Ràng buộc: `2 ≤ n ≤ 2000`, `0 ≤ stations[i] ≤ 10⁸` (tăng ngặt), `0 ≤ k ≤ 10⁹`. Sai số cho phép `10⁻⁶` (tuyệt đối).
- Ví dụ: `[1,2,3,4,5,6,7,8,9,10], 9` → `0.5` · `[23,24,36,39,46,56,57,65,84,98], 1` → `14.0` · `[0,10], 1` → `5.0`. (LeetCode 774)
- Binary search trên **số thực**: lặp 100 vòng, không `==`. Mô phỏng thêm từng trạm bằng heap là O(k log n) — `k = 10⁹` không khả thi.
