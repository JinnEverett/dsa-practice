# I09 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I09-backtracking [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I09-backtracking 01`

**Pass:** ≥ 8/10 bài qua `check`, ≤ 3 hint, và trả lời được **câu hỏi quy mô** cuối file.

> Thứ tự các đáp án (các tập con, hoán vị, chuỗi...) **tùy ý**; `check` so sánh như tập hợp. Thứ tự **bên trong** mỗi đáp án được đề quy định.
> Ex02, ex04, ex06, ex07 có test sinh nhiều nhánh vô ích nếu bạn khử trùng sau cùng — hãy bỏ trùng **khi sinh** (sort + skip). Ex08 có test cần cắt nhánh bằng cách đếm chữ cái.
> Ex10 có kích thước cố định nên không đo Perf — tự giác cắt nhánh.

---

## 🟢 Cơ bản

### ex01 · Mọi tập con
```java
List<List<Integer>> subsets(int[] nums)
```
- `nums` gồm các số **khác nhau**, `0 ≤ n ≤ 16`. Trả về mọi tập con (gồm tập rỗng và chính `nums`), mỗi tập liệt kê theo **thứ tự xuất hiện trong `nums`**.
- Ví dụ: `[1,2,3]` → `[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]` (thứ tự các tập tùy ý). (LeetCode 78)

### ex02 · Tập con không trùng
```java
List<List<Integer>> subsetsWithDup(int[] nums)
```
- `nums` có thể có số lặp, `0 ≤ n ≤ 20`. Trả về mọi tập con **khác nhau**, mỗi tập liệt kê **tăng dần**.
- Ví dụ: `[1,2,2]` → `[[],[1],[1,2],[1,2,2],[2],[2,2]]` · `[4,4,4]` → `[[],[4],[4,4],[4,4,4]]`. (LeetCode 90)

### ex03 · Mọi hoán vị
```java
List<List<Integer>> permute(int[] nums)
```
- Các số **khác nhau**, `1 ≤ n ≤ 9`. Trả về mọi hoán vị.
- Ví dụ: `[1,2,3]` → 6 hoán vị `[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]`. (LeetCode 46)

### ex04 · Hoán vị không trùng
```java
List<List<Integer>> permuteUnique(int[] nums)
```
- Có thể có số lặp, `1 ≤ n ≤ 10`. Trả về mọi hoán vị **khác nhau**.
- Ví dụ: `[1,1,2]` → `[[1,1,2],[1,2,1],[2,1,1]]`. (LeetCode 47)

---

## 🟡 Kết hợp

### ex05 · Tổ hợp có tổng bằng target (dùng lại được)
```java
List<List<Integer>> combinationSum(int[] candidates, int target)
```
- `candidates` gồm các số nguyên dương **khác nhau**, mỗi số được dùng **nhiều lần tùy ý**. Trả về mọi **tổ hợp** (không phân biệt thứ tự) có tổng bằng `target`, mỗi tổ hợp liệt kê **không giảm**. Không có → `[]`.
- Ràng buộc: `1 ≤ |candidates| ≤ 30`, `2 ≤ giá trị ≤ 40`, `1 ≤ target ≤ 500`; số tổ hợp không vượt quá `10⁵`.
- Ví dụ: `[2,3,6,7], 7` → `[[2,2,3],[7]]` · `[2], 1` → `[]`. (LeetCode 39)

### ex06 · Tổ hợp có tổng bằng target (mỗi số một lần)
```java
List<List<Integer>> combinationSum2(int[] candidates, int target)
```
- `candidates` có thể có số lặp, mỗi **phần tử** (theo chỉ số) dùng tối đa một lần. Trả về mọi tổ hợp **khác nhau** có tổng `target`, mỗi tổ hợp liệt kê **không giảm**.
- Ràng buộc: `1 ≤ n ≤ 30`, `1 ≤ giá trị ≤ 50`, `1 ≤ target ≤ 100`.
- Ví dụ: `[10,1,2,7,6,1,5], 8` → `[[1,1,6],[1,2,5],[1,7],[2,6]]` · `[1,1,1], 2` → `[[1,1]]`. (LeetCode 40)

### ex07 · Sinh ngoặc hợp lệ
```java
List<String> generateParenthesis(int n)
```
- `1 ≤ n ≤ 12`. Trả về mọi chuỗi gồm `n` cặp ngoặc đúng.
- Ví dụ: `3` → `["((()))","(()())","(())()","()(())","()()()"]`. (LeetCode 22)

### ex08 · Tìm từ trong bảng chữ cái
```java
boolean exist(String[] board, String word)
```
- Bảng `R × C` chữ cái; từ được ghép bằng các ô kề nhau (4 hướng), **mỗi ô dùng tối đa một lần**.
- Ràng buộc: `1 ≤ R, C ≤ 10`, `1 ≤ |word| ≤ 40`.
- Ví dụ: `["ABCE","SFCS","ADEE"], "ABCCED"` → `true` · `"SEE"` → `true` · `"ABCB"` → `false`. (LeetCode 79)
- Gợi ý nhẹ: bảng gồm 100 chữ `a`, từ là `"a…ab"` (30 chữ a rồi b) — bạn có cần DFS không?

### ex09 · Đếm cách đặt n quân hậu
```java
int totalNQueens(int n)
```
- Số cách đặt `n` quân hậu lên bàn `n × n` sao cho không quân nào ăn nhau (cùng hàng, cột, đường chéo). `1 ≤ n ≤ 13`.
- Ví dụ: `4` → `2` · `8` → `92` · `12` → `14200`. (LeetCode 52)
- Mục tiêu: kiểm tra xung đột O(1) (bitmask hoặc ba mảng boolean), không quét lại các quân đã đặt.

---

## 🔴 Thực tế

### ex10 · Khôi phục địa chỉ IP từ log mất dấu chấm
> "Hệ thống ghi log mất dấu chấm: `25525511135` thực ra là một địa chỉ IPv4. Liệt kê mọi cách chèn 3 dấu chấm để được địa chỉ hợp lệ."

```java
List<String> restoreIpAddresses(String s)
```
- Mỗi đoạn là số `0..255`, **không có số 0 đứng đầu** (trừ chính `"0"`). Đoạn dài 1–3 chữ số. Trả về mọi địa chỉ hợp lệ (thứ tự tùy ý); không có → `[]`.
- Ràng buộc: `s` gồm chữ số, `1 ≤ |s| ≤ 12`.
- Ví dụ: `"25525511135"` → `["255.255.11.135","255.255.111.35"]` · `"0000"` → `["0.0.0.0"]` · `"010010"` → `["0.10.0.10","0.100.1.0"]`. (LeetCode 93)

---

## ❓ Câu hỏi quy mô (làm sau khi qua ex03)

1. **Dự đoán** (viết ra): `permute` ở `n = 9` mất ~T ms. Ở `n = 10` mất ~? ms, ở `n = 11` ~? ms? Ở `n = 13` bạn có dám chạy không (số hoán vị là bao nhiêu)?
2. Có bao nhiêu hoán vị của `[1,1,1,1,1,1,1,1,2]` nếu sinh hết rồi khử trùng, và bao nhiêu hoán vị thật sự khác nhau? Tỉ lệ này nói gì về `sort + skip`?
3. `node tools/bench.ts lessons/I09-backtracking 03 --scales xs,s,m,l,xl` — với bài này bench dùng `n = 6, 7, 8, 9, 10`. Thời gian tăng gấp bao nhiêu mỗi bước? Có gần `n` lần không (vì số hoán vị tăng `n` lần)?
