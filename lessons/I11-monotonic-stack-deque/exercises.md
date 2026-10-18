# I11 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I11-monotonic-stack-deque [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I11-monotonic-stack-deque 01`

**Pass:** ≥ 6/8 bài qua `check` (gồm ex05 sliding window deque), ≤ 2 hint, và trả lời được câu hỏi quy mô ở cuối.

> Mọi bài có ràng buộc `n` lên tới `10⁵`: lời giải O(n²) hoặc O(n·k) đúng nhưng sẽ trượt Perf.
> Nói trước khi code: ý tưởng + độ phức tạp thời gian/bộ nhớ dự kiến.

---

## 🟢 Cơ bản

### ex01 · Phần tử lớn hơn kế tiếp (mảng vòng)
Với mỗi `nums[i]`, tìm phần tử **đầu tiên lớn hơn hẳn** nó khi đi theo chiều tăng chỉ số, **vòng lại** đầu mảng khi tới cuối. Không có thì `-1`. Trả về **giá trị** (không phải chỉ số).
```java
int[] nextGreaterElements(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`.
- Ví dụ: `[1,2,1]` → `[2,-1,2]` · `[1,2,3,4,3]` → `[2,3,4,-1,4]` · `[3,3,3]` → `[-1,-1,-1]`. (LeetCode 503)

### ex02 · Daily temperatures
Với mỗi ngày, sau bao nhiêu ngày nữa thì nhiệt độ **cao hơn hẳn** hôm nay? Không có thì `0`.
```java
int[] dailyTemperatures(int[] temperatures)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `30 ≤ temperatures[i] ≤ 100`.
- Ví dụ: `[73,74,75,71,69,72,76,73]` → `[1,1,4,2,1,1,0,0]` · `[30,40,50,60]` → `[1,1,1,0]`. (LeetCode 739)

### ex03 · Hình chữ nhật lớn nhất trong histogram
`heights[i]` là chiều cao cột thứ `i`, mỗi cột rộng 1. Trả về diện tích hình chữ nhật lớn nhất nằm trọn trong histogram (các cột liên tiếp).
```java
int largestRectangleArea(int[] heights)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ heights[i] ≤ 10⁴` (diện tích tối đa `10⁹` vừa `int`).
- Ví dụ: `[2,1,5,6,2,3]` → `10` · `[2,4]` → `4` · `[0]` → `0`. (LeetCode 84)

### ex04 · Trapping rain water
Địa hình có độ cao `height[i]`, mỗi cột rộng 1. Sau cơn mưa, tổng lượng nước đọng lại là bao nhiêu?
```java
int trap(int[] height)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ height[i] ≤ 10⁴` (tổng nước tối đa `10⁹` vừa `int`).
- Ví dụ: `[0,1,0,2,1,0,1,3,2,1,2,1]` → `6` · `[4,2,0,3,2,5]` → `9`.
- Gợi ý định hướng: bài này có ít nhất 3 cách (mảng prefix/suffix max, two pointers, monotonic stack). Hãy thử **cả stack** để luyện tư duy "tầng ngang". (LeetCode 42)

---

## 🟡 Kết hợp

### ex05 · Sliding window maximum
Trả về max của mọi cửa sổ liên tiếp độ dài `k` (từ trái sang phải).
```java
int[] maxSlidingWindow(int[] nums, int k)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁴`. Output có `n − k + 1` phần tử.
- Ví dụ: `[1,3,-1,-3,5,3,6,7], 3` → `[3,3,5,5,6,7]` · `[1], 1` → `[1]` · `[2,2,2,2], 2` → `[2,2,2]`.
- Mục tiêu: O(n) bằng **deque**. Duyệt từng cửa sổ là O(n·k) — với `k = 5000` trượt Perf. (LeetCode 239)

### ex06 · Tổng min của mọi mảng con
Tổng của `min(subarray)` trên **mọi** mảng con liên tiếp của `arr`, lấy modulo `10⁹ + 7`.
```java
int sumSubarrayMins(int[] arr)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ arr[i] ≤ 3·10⁴`. Giá trị bằng nhau: mỗi mảng con chỉ được tính **một lần** (min của nó là một số, không phải một vị trí).
- Ví dụ: `[3,1,2,4]` → `17` · `[11,81,94,43,3]` → `444` · `[2,2,2]` → `12`.
- Java: số mảng con nhận một phần tử làm min có thể ~`2.5·10⁹` → dùng `long`. (LeetCode 907)

### ex07 · Stock spanner (class)
> "Hệ thống giám sát giá cổ phiếu nhận giá từng ngày. Với mỗi giá mới, cho biết **span**: số ngày liên tiếp gần nhất (tính cả hôm nay, đi ngược về trước) mà giá **≤ giá hôm nay**."

```java
class StockSpanner {
  StockSpanner()
  int next(int price)     // nhận giá hôm nay, trả về span
}
```
- Ràng buộc: tối đa `10⁵` lần `next`, `1 ≤ price ≤ 10⁵`.
- Ví dụ: giá `100, 80, 60, 70, 60, 75, 85` → span `1, 1, 1, 2, 1, 4, 6`. Giá bằng nhau vẫn tính vào span.
- Mục tiêu: amortized O(1) mỗi `next`. Quét lùi từng ngày là O(n²) khi giá tăng dần. (LeetCode 901)

---

## 🔴 Thực tế

### ex08 · Xóa k chữ số để số nhỏ nhất
> "Mã đơn hàng là một chuỗi chữ số rất dài. Hệ thống cũ cho phép **xóa đúng `k` chữ số** (giữ nguyên thứ tự các chữ số còn lại) để mã rút gọn có giá trị **nhỏ nhất**. Trả về mã rút gọn dạng số: không có số 0 đứng đầu; nếu rỗng thì trả `"0"`."

```java
String removeKdigits(String num, int k)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ k ≤ n`, `num` chỉ gồm chữ số, không có số 0 đứng đầu (trừ chính `"0"`).
- Ví dụ: `"1432219", 3` → `"1219"` · `"10200", 1` → `"200"` · `"10", 2` → `"0"` · `"12345", 2` → `"123"`.
- Mục tiêu: O(n). Lặp `k` lần "xóa chữ số đầu tiên lớn hơn chữ số sau nó" là O(n·k). (LeetCode 402)

---

## Câu hỏi quy mô (bắt buộc)
Với ex05 (hoặc ex02) của bạn:
1. **Dự đoán trước:** chạy ở `n = 10⁶` mất bao nhiêu ms, số mũ ước lượng là bao nhiêu? Nếu thay bằng cách ngây thơ (O(n·k) với `k = 5000`) thì dự đoán thế nào?
2. Kiểm chứng: `node tools/bench.ts lessons/I11-monotonic-stack-deque 05 --scales s,m,l` (đọc cột số mũ: ≈ 1 là O(n)).
3. Giải thích bằng một câu vì sao vòng `while` lồng trong `for` vẫn là O(n).
