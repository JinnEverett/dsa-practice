# A02 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A02-dp-1d-sequence [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A02-dp-1d-sequence 01` · Đo: `node tools/bench.ts lessons/A02-dp-1d-sequence 03`

**Pass:** ≥ 8/10 bài qua `check`, ≤ 3 hint. Trước khi code: nói **state** và **transition**. Câu hỏi quy mô (ex03): dự đoán thời gian bản O(n²) ở `n = 10⁵`, rồi `bench`.

---

## 🟢 Cơ bản

### ex01 · Đổi tiền ít đồng nhất
```java
int coinChange(int[] coins, int amount)
```
- Ràng buộc: `1 ≤ k ≤ 12` loại đồng (khác nhau, `1 ≤ coin ≤ 10⁴`), `0 ≤ amount ≤ 10⁵`. Mỗi loại dùng không giới hạn. Không đổi được → `-1`.
- Ví dụ: `[1,2,5], 11` → `3` · `[2], 3` → `-1` · `[1], 0` → `0`. (LeetCode 322)

### ex02 · Đổi tiền: đếm số tổ hợp
Số **tổ hợp** (không tính thứ tự) các đồng tạo đúng `amount`. Kết quả mod `10⁹ + 7`.
```java
int change(int amount, int[] coins)
```
- Ràng buộc: `0 ≤ amount ≤ 10⁵`, `1 ≤ k ≤ 12`, `1 ≤ coin ≤ 10⁴` (khác nhau). `amount = 0` → `1`.
- Ví dụ: `5, [1,2,5]` → `4` · `3, [2]` → `0`. (LeetCode 518)
- Hỏi thêm: đổi thứ tự hai vòng `for` thì đếm ra cái gì? (đáp ở A04 / `combinationSum4`)

### ex03 · Dãy con tăng dài nhất
Độ dài dãy con **tăng ngặt** dài nhất.
```java
int lengthOfLIS(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`.
- Ví dụ: `[10,9,2,5,3,7,101,18]` → `4` · `[7,7,7,7]` → `1`.
- Mục tiêu: O(n log n). Bản O(n²) trượt Perf. (LeetCode 300)

### ex04 · Tách từ
`s` có tách được thành dãy các từ trong từ điển (dùng lại thoải mái) không?
```java
boolean wordBreak(String s, String[] wordDict)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁵`, `1 ≤ |wordDict| ≤ 1000`, mỗi từ dài `1..20`.
- Ví dụ: `"leetcode", ["leet","code"]` → `true` · `"catsandog", ["cats","dog","sand","and","cat"]` → `false`.
- Mục tiêu: O(n · L), L = độ dài từ dài nhất. (LeetCode 139)

### ex05 · Giải mã
Chuỗi chữ số, `A=1 … Z=26`. Đếm số cách giải mã, mod `10⁹ + 7`.
```java
int numDecodings(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁵`, chỉ gồm `'0'..'9'`.
- Ví dụ: `"12"` → `2` · `"226"` → `3` · `"06"` → `0` · `"10"` → `1`. (LeetCode 91)

### ex06 · Tổng mảng con lớn nhất
```java
int maxSubArray(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁴`. Mảng con không rỗng.
- Ví dụ: `[-2,1,-3,4,-1,2,1,-5,4]` → `6` · `[-3,-1,-2]` → `-1`. (LeetCode 53)

### ex07 · Tích mảng con lớn nhất
```java
int maxProduct(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 2`, bảo đảm mọi tích mảng con **vừa `int`**. Mảng con không rỗng.
- Ví dụ: `[2,3,-2,4]` → `6` · `[-2,0,-1]` → `0` · `[-2,3,-4]` → `24`. (LeetCode 152)

### ex08 · Cổ phiếu có cooldown
Mua/bán nhiều lần, mỗi lúc cầm tối đa 1 cổ phiếu. Sau khi **bán** phải nghỉ 1 ngày mới được mua lại.
```java
int maxProfitCooldown(int[] prices)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ prices[i] ≤ 10⁴` (lợi nhuận ≤ `5·10⁸`).
- Ví dụ: `[1,2,3,0,2]` → `3` (mua 1, bán 2, nghỉ, mua 0, bán 2) · `[1]` → `0`. (LeetCode 309)
- Vẽ sơ đồ trạng thái (hold / sold / rest) trước khi code.

### ex09 · Cổ phiếu có phí giao dịch
Mỗi lần **bán** trả phí `fee`.
```java
int maxProfitFee(int[] prices, int fee)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ prices[i] ≤ 10⁴`, `0 ≤ fee ≤ 10⁴`.
- Ví dụ: `[1,3,2,8,4,9], 2` → `8` · `[1,3,7,5,10,3], 3` → `6`. (LeetCode 714)

---

## 🔴 Thực tế

### ex10 · Xếp thùng lồng nhau
> "Kho có `n` thùng carton `[w, h]`. Thùng A cho vào được thùng B khi **cả** `w` lẫn `h` của A đều **nhỏ hơn hẳn** B (không xoay). Chuỗi lồng dài nhất là bao nhiêu thùng?"

```java
int maxEnvelopes(int[][] envelopes)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ w, h ≤ 10⁹`.
- Ví dụ: `[[5,4],[6,4],[6,7],[2,3]]` → `3` (`[2,3]→[5,4]→[6,7]`) · `[[1,1],[1,1],[1,1]]` → `1`.
- Mục tiêu: O(n log n). Gợi ý tư duy: đưa về LIS sau khi sort thế nào để hai thùng cùng `w` không nối được? Java: comparator dùng `Integer.compare`. (LeetCode 354)
