# A04 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A04-dp-knapsack [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A04-dp-knapsack 01` · Đo: `node tools/bench.ts lessons/A04-dp-knapsack 08`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 2 hint. Với mỗi bài nói rõ: (1) dạng **0/1 hay unbounded hay bounded**, (2) **tối ưu / đếm / có-không**, (3) chiều duyệt của vòng sức chứa và vì sao.
Câu hỏi quy mô (ex08): bản "trải phẳng" từng tờ có `Σ counts` vật phẩm — ước lượng số phép ở test lớn, rồi `bench`; binary splitting giảm xuống bao nhiêu?

---

## 🟢 Cơ bản

### ex01 · Knapsack 0/1
```java
int knapsack01(int[] weights, int[] values, int capacity)
```
- Ràng buộc: `1 ≤ n ≤ 1000`, `1 ≤ weights[i] ≤ 1000`, `1 ≤ values[i] ≤ 10⁴`, `0 ≤ capacity ≤ 10⁴`. Mỗi vật dùng tối đa **một** lần; tổng trọng lượng ≤ `capacity`; trả về tổng giá trị lớn nhất (≤ `10⁷`, vừa `int`).
- Ví dụ: `[1,3,4,5], [1,4,5,7], 7` → `9` · `[1,1,1], [5,5,5], 2` → `10`.
- Mục tiêu: O(n · capacity) time, O(capacity) space.

### ex02 · Knapsack không giới hạn
Như ex01 nhưng mỗi vật dùng **bao nhiêu lần tùy ý**.
```java
int knapsackUnbounded(int[] weights, int[] values, int capacity)
```
- Ràng buộc: như ex01. Đáp án tối đa `10⁴ · 10⁴ = 10⁸`, vừa `int`.
- Ví dụ: `[1,3,4,5], [1,4,5,7], 7` → `9` · `[5,10], [10,25], 100` → `250`.
- Chỉ khác ex01 một thay đổi nhỏ trong code — bạn hãy chỉ ra đó là gì.

### ex03 · Chia hai nhóm bằng nhau
Có chia được mảng thành hai nhóm có **tổng bằng nhau** (mỗi phần tử thuộc đúng một nhóm) không?
```java
boolean canPartition(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 500`, `1 ≤ nums[i] ≤ 100`.
- Ví dụ: `[1,5,11,5]` → `true` · `[1,2,3,5]` → `false`. (LeetCode 416)

### ex04 · Gán dấu +/− để ra đích
Đặt `+` hoặc `-` trước mỗi số sao cho tổng bằng `target`. Đếm số cách, mod `10⁹ + 7`.
```java
int findTargetSumWays(int[] nums, int target)
```
- Ràng buộc: `1 ≤ n ≤ 200`, `0 ≤ nums[i] ≤ 100`, `|target| ≤ 20000`. Số `0` được phép (mỗi số `0` có hai cách).
- Ví dụ: `[1,1,1,1,1], 3` → `5` · `[1], 2` → `0`. (LeetCode 494)
- Gợi ý: đưa về "đếm tập con có tổng P" — P tính từ `sum` và `target` thế nào?

### ex05 · Đập đá lần 2
Mỗi lượt chọn hai viên, đập: hai viên bằng nhau thì cùng biến mất; khác nhau thì còn viên nặng `|x − y|`. Trọng lượng còn lại nhỏ nhất (hoặc `0`)?
```java
int lastStoneWeightII(int[] stones)
```
- Ràng buộc: `1 ≤ n ≤ 300`, `1 ≤ stones[i] ≤ 100`.
- Ví dụ: `[2,7,4,1,8,1]` → `1` · `[31,26,33,21,40]` → `5`. (LeetCode 1049)
- Khác với `lastStoneWeight` (heap, I04): ở đây thứ tự đập do **bạn** chọn.

### ex06 · Tập chuỗi nhị phân lớn nhất
Chọn nhiều chuỗi nhất sao cho tổng số ký tự `'0'` ≤ `m` và tổng số ký tự `'1'` ≤ `n`.
```java
int findMaxForm(String[] strs, int m, int n)
```
- Ràng buộc: `1 ≤ |strs| ≤ 600`, mỗi chuỗi dài `1..100` gồm `'0'`/`'1'`, `0 ≤ m, n ≤ 100`.
- Ví dụ: `["10","0001","111001","1","0"], 5, 3` → `4` · `["10","0","1"], 1, 1` → `2`. (LeetCode 474)

---

## 🔴 Thực tế

### ex07 · Dãy số có thứ tự cộng bằng đích
> "Có các mệnh giá tin nhắn thưởng `nums`; một chuỗi thưởng là dãy các mệnh giá (lặp tùy ý, **thứ tự có nghĩa**) có tổng bằng `target`. Có bao nhiêu chuỗi?" Kết quả mod `10⁹ + 7`.

```java
int combinationSum4(int[] nums, int target)
```
- Ràng buộc: `1 ≤ n ≤ 200`, `nums[i]` khác nhau, `1 ≤ nums[i] ≤ 1000`, `1 ≤ target ≤ 10⁵`.
- Ví dụ: `[1,2,3], 4` → `7` · `[9], 3` → `0`. (LeetCode 377)
- So sánh với `change` (A02 ex02): vì sao đáp án khác và vòng lặp khác thế nào? Java: cộng bằng `long` rồi `% MOD`.

### ex08 · Đổi tiền với số tờ có hạn
> "Máy ATM còn `counts[i]` tờ mệnh giá `coins[i]`. Rút `amount` bằng **ít tờ nhất**; không rút được thì `-1`."

```java
int minCoinsBounded(int[] coins, int[] counts, int amount)
```
- Ràng buộc: `1 ≤ k ≤ 100` loại tiền, `1 ≤ coins[i] ≤ 1000`, `0 ≤ counts[i] ≤ 1000`, `0 ≤ amount ≤ 10⁴`.
- Ví dụ: `[1,2,5], [5,2,1], 11` → `5` (5+2+2+1+1) · `[1,2,5], [5,2,1], 100` → `-1`.
- Mục tiêu: không trải phẳng từng tờ (đến `10⁵` vật × `10⁴` = `10⁹` phép). Gợi ý: tách `counts[i]` thành các gói `1, 2, 4, …`. Java: dùng `INF = amount + 1` hoặc `Integer.MAX_VALUE / 2`.
