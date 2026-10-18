# I11 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I11-monotonic-stack-deque [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I11-monotonic-stack-deque 01`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 3 hint, và trả lời được **câu hỏi quy mô** cuối file (kèm lập luận "vì sao O(n)").

> Mọi bài dùng `n` tới 10⁵ với input giảm dần / tăng dần — các lời giải O(n²) sẽ quá giờ.
> Ex03, ex04 trả `long`. Ex06 có test chạm bẫy 2⁵³ trong TS (nhân tích ba số lớn).

---

## 🟢 Cơ bản

### ex01 · Phần tử lớn hơn kế tiếp (mảng vòng)
Với mỗi phần tử, tìm phần tử **lớn hơn nghiêm ngặt** đầu tiên khi đi sang phải, có thể **quay vòng** (sau phần tử cuối là phần tử đầu). Không có → `-1`.
```java
int[] nextGreaterElements(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`.
- Ví dụ: `[1,2,1]` → `[2,-1,2]` · `[1,2,3,4,3]` → `[2,3,4,-1,4]` · `[2,2,2]` → `[-1,-1,-1]`. (LeetCode 503)

### ex02 · Số ngày chờ ngày ấm hơn
`ans[i]` = số ngày phải chờ sau ngày `i` để có nhiệt độ **cao hơn nghiêm ngặt**; không có → `0`.
```java
int[] dailyTemperatures(int[] temperatures)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ temperatures[i] ≤ 10⁹`.
- Ví dụ: `[73,74,75,71,69,72,76,73]` → `[1,1,4,2,1,1,0,0]`. (LeetCode 739)

### ex03 · Hình chữ nhật lớn nhất trong histogram
```java
long largestRectangleArea(int[] heights)
```
- `heights[i]` là chiều cao cột `i` (mỗi cột rộng 1). Diện tích hình chữ nhật lớn nhất nằm trọn trong histogram.
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ heights[i] ≤ 10⁹` (diện tích tới 10¹⁴ → `long`).
- Ví dụ: `[2,1,5,6,2,3]` → `10` · `[2,4]` → `4`. (LeetCode 84, kiểu trả về `long`)

### ex04 · Hứng nước mưa
```java
long trap(int[] height)
```
- Bản đồ độ cao; lượng nước giữ lại giữa các cột sau mưa. Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ height[i] ≤ 10⁵` (tổng tới 10¹⁰ → `long`).
- Ví dụ: `[0,1,0,2,1,0,1,3,2,1,2,1]` → `6` · `[4,2,0,3,2,5]` → `9`. (LeetCode 42, kiểu trả về `long`)
- Nên thử cả hai cách: stack, và hai con trỏ trái/phải (O(1) bộ nhớ); cả hai đều qua `check`.

---

## 🟡 Kết hợp

### ex05 · Max cửa sổ trượt
```java
int[] maxSlidingWindow(int[] nums, int k)
```
- Trả về mảng độ dài `n − k + 1`: max của từng cửa sổ `k` phần tử liên tiếp.
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`.
- Ví dụ: `[1,3,-1,-3,5,3,6,7], 3` → `[3,3,5,5,6,7]` · `[1], 1` → `[1]`. (LeetCode 239)
- Mục tiêu: O(n) bằng deque; bản duyệt lại mỗi cửa sổ là O(n·k) (test dùng `k = n/2`).

### ex06 · Tổng min của mọi mảng con
Tổng của `min(subarray)` trên **mọi mảng con liên tiếp**, lấy modulo `10⁹ + 7`.
```java
int sumSubarrayMins(int[] arr)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ arr[i] ≤ 10⁹`.
- Ví dụ: `[3,1,2,4]` → `17` · `[11,81,94,43,3]` → `444` · `[2,2,2]` → `12`. (LeetCode 907)
- **Bẫy:** mỗi phần tử đóng góp `arr[i] × left × right`, tích có thể tới ~10¹⁹ — vượt 2⁵³ trong TS. Rút gọn modulo từng thừa số, nhân bằng `BigInt` hoặc tách 16 bit (Python không bị; Java dùng `long` đúng cách).

---

## 🔴 Thực tế

### ex07 · Stock spanner (class)
> "Hệ thống giá cổ phiếu: với mỗi giá mới `p`, *span* là số ngày liên tiếp gần nhất (tính cả hôm nay) mà giá **≤ p**."

```java
class StockSpanner {
  StockSpanner()
  int next(int price)     // nhận giá của ngày mới, trả về span
}
```
- Ràng buộc: tối đa `10⁵` lần gọi, `1 ≤ price ≤ 10⁹`.
- Ví dụ: `next(100)=1, next(80)=1, next(60)=1, next(70)=2, next(60)=1, next(75)=4, next(85)=6`. (LeetCode 901)

### ex08 · Xóa k chữ số để được số nhỏ nhất
> "Mã đơn hàng dạng số lớn; công cụ rút gọn được phép xóa đúng `k` chữ số để mã còn lại là nhỏ nhất có thể."

```java
String removeKdigits(String num, int k)
```
- `num` không có số 0 đứng đầu (trừ chính `"0"`). Kết quả **không có số 0 đứng đầu**; nếu rỗng → `"0"`.
- Ràng buộc: `1 ≤ |num| ≤ 10⁵`, `0 ≤ k ≤ |num|`.
- Ví dụ: `"1432219", 3` → `"1219"` · `"10200", 1` → `"200"` · `"10", 2` → `"0"` · `"12345", 2` → `"123"`. (LeetCode 402)

---

## ❓ Câu hỏi quy mô (làm sau khi qua ex02)

1. Mảng nhiệt độ **giảm dần** 10⁵ phần tử: bản quét-xa-từng-phần-tử cần khoảng bao nhiêu phép so sánh? Bản stack cần bao nhiêu lần `push` và `pop` tối đa? **Dự đoán** tỉ lệ thời gian giữa hai bản ở `n = 10⁶`.
2. **Giải thích bằng lời** (2–3 câu) vì sao `while` lồng trong `for` mà vẫn O(n): đếm số lần pop trên toàn bộ thuật toán.
3. `node tools/bench.ts lessons/I11-monotonic-stack-deque 02 --scales s,m,l`: số mũ ước lượng có ≈ 1 không? Nếu bạn dùng `Array.shift()` thay chỉ số `head` cho ex05, số mũ đổi thế nào?
