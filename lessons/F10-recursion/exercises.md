# F10 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F10-recursion [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F10-recursion 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint. Với mỗi bài, trả lời thêm: cây đệ quy có bao nhiêu node, sâu bao nhiêu?

---

## 🟢 Cơ bản

### ex01 · Lũy thừa nhanh
Tính `xⁿ`. Không dùng `Math.pow`, `**`.
```java
double myPow(double x, int n)
```
- Ràng buộc: `-100 < x < 100`, `-2³¹ ≤ n ≤ 2³¹ − 1`, kết quả nằm trong `[-10⁴, 10⁴]` (hoặc rất gần 0). So sánh với sai số tương đối 10⁻⁶.
- Ví dụ: `2.0, 10` → `1024.0` · `2.1, 3` → `9.261` · `2.0, -2` → `0.25` · `1.0, -2147483648` → `1.0`.
- Mục tiêu: O(log |n|). Nhân n lần sẽ trượt Perf. Bẫy Java: `-n` khi `n = -2³¹`. (LeetCode 50)

### ex02 · Fibonacci có memo
`fib(0) = 0`, `fib(1) = 1`, `fib(n) = fib(n−1) + fib(n−2)`.
```java
long fib(int n)
```
- Ràng buộc: `0 ≤ n ≤ 75` (`fib(75)` ≈ 2.1·10¹⁵ vừa `number` của JS; Java cần `long`).
- Ví dụ: `fib(10)` → `55` · `fib(50)` → `12586269025`.
- Mục tiêu: O(n). Bản đệ quy ngây thơ ở n = 75 chạy hàng năm.

### ex03 · Leo cầu thang
Mỗi bước leo 1 hoặc 2 bậc. Có bao nhiêu cách leo `n` bậc?
```java
int climbStairs(int n)
```
- Ràng buộc: `1 ≤ n ≤ 45`.
- Ví dụ: `2` → `2` · `3` → `3` · `5` → `8`.
- Viết bằng đệ quy + memo. Vẽ cây đệ quy cho n = 5 và đánh dấu node bị tính lặp. (LeetCode 70)

### ex04 · Tháp Hà Nội
Chuyển `n` đĩa từ cọc 1 sang cọc 3 (cọc 2 trung gian), mỗi lần chuyển 1 đĩa trên cùng, không đặt đĩa lớn lên đĩa nhỏ. Trả về danh sách nước đi `[from, to]` với **số nước ít nhất**, theo đúng thứ tự thực hiện.
```java
int[][] hanoi(int n)
```
- Ràng buộc: `0 ≤ n ≤ 16`.
- Ví dụ: `hanoi(2)` → `[[1,2],[1,3],[2,3]]` · `hanoi(0)` → `[]`.
- Bộ chấm **mô phỏng** các nước đi: kiểm tra hợp lệ, số nước = 2ⁿ − 1, cuối cùng mọi đĩa ở cọc 3.

---

## 🟡 Kết hợp

### ex05 · Chuỗi nhị phân không có hai số 1 liền nhau
Liệt kê mọi chuỗi nhị phân độ dài `n` không chứa `"11"`, sắp theo thứ tự từ điển.
```java
List<String> noConsecutiveOnes(int n)
```
- Ràng buộc: `1 ≤ n ≤ 18`.
- Ví dụ: `n = 3` → `["000","001","010","100","101"]`.
- Gợi ý: hàm đệ quy nhận chuỗi đang xây và ký tự cuối.

### ex06 · Giải mã chuỗi lồng nhau
Quy tắc `k[chuỗi]` = `chuỗi` lặp `k` lần, có thể lồng nhau.
```java
String decodeString(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 30`, `1 ≤ k ≤ 300`, input hợp lệ, kết quả ≤ 10⁵ ký tự.
- Ví dụ: `"3[a]2[bc]"` → `"aaabcbc"` · `"3[a2[c]]"` → `"accaccacc"` · `"2[abc]3[cd]ef"` → `"abcabccdcdcdef"` · `"10[x]"` → `"xxxxxxxxxx"`. (LeetCode 394)

### ex07 · Máy tính biểu thức
Tính biểu thức gồm số nguyên không âm, `+ - * /`, ngoặc `( )`, khoảng trắng. `*` và `/` ưu tiên hơn `+ -`; cùng mức thì trái sang phải; `/` là chia nguyên **làm tròn về 0**. Không có dấu trừ một ngôi.
```java
int calculate(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁴`, mọi kết quả trung gian nằm trong `int`, không chia cho 0.
- Ví dụ: `"1 + 2 * 3"` → `7` · `"(1+2)*3"` → `9` · `"14 - 3/2"` → `13` · `"2*(5-(3+4))/3"` → `-1` · `"7-7/2*2"` → `1`.
- Gợi ý: đệ quy theo văn phạm: `expr = term (('+'|'-') term)*`, `term = factor (('*'|'/') factor)*`, `factor = số | '(' expr ')'`.

### ex08 · Ký tự thứ k của văn phạm
Hàng 1 là `"0"`. Hàng sau thu được từ hàng trước bằng cách thay `0 → 01`, `1 → 10`. Trả về ký tự thứ `k` (đánh số từ 1) của hàng `n`.
```java
int kthGrammar(int n, int k)
```
- Ràng buộc: `1 ≤ n ≤ 30`, `1 ≤ k ≤ 2ⁿ⁻¹`.
- Ví dụ: `1, 1` → `0` · `2, 1` → `0` · `2, 2` → `1` · `4, 5` → `1`.
- Mục tiêu: O(n). Dựng cả hàng 30 (5·10⁸ ký tự) sẽ hết bộ nhớ. (LeetCode 779)

---

## 🔴 Thực tế

### ex09 · Độ sâu cây danh mục
> "Bảng `categories` có cột `parent_id`. `parent[i]` là cha của danh mục `i`, `-1` nếu là gốc (có thể có nhiều gốc). Tính độ sâu lớn nhất (gốc có độ sâu 1). Có tenant tạo danh mục lồng nhau **100 000 tầng**."

```java
int maxCategoryDepth(int[] parent)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, dữ liệu là rừng hợp lệ (không chu trình).
- Ví dụ: `[-1, 0, 0, 1, 3]` → `4` (0 → 1 → 3 → 4) · `[-1, -1]` → `1`.
- Bộ test có chuỗi 10⁵ tầng: đệ quy thẳng sẽ **tràn stack** ở cả TS, Python và Java.

### ex10 · Dung lượng thư mục
> "Hệ thống lưu trữ cần hiển thị dung lượng của mỗi thư mục = dung lượng file của chính nó + mọi thư mục con cháu."

```java
long[] folderSizes(int[] parent, int[] sizes)
```
- `parent[i]` như ex09; `sizes[i]` là tổng dung lượng file nằm trực tiếp trong thư mục `i`. Trả về mảng tổng dung lượng cho từng thư mục.
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ sizes[i] ≤ 10⁹` (tổng có thể vượt `int`), có chuỗi lồng 10⁵ tầng.
- Ví dụ: `parent = [-1, 0, 0, 1]`, `sizes = [5, 10, 20, 7]` → `[42, 17, 20, 7]`.
- Mục tiêu: O(n), không tràn stack.
