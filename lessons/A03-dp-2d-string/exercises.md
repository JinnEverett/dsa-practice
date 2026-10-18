# A03 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A03-dp-2d-string [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A03-dp-2d-string 01` · Đo: `node tools/bench.ts lessons/A03-dp-2d-string 05`

**Pass:** ≥ 8/10 bài qua `check`, ≤ 3 hint. Với mỗi bài hai chuỗi/lưới: vẽ bảng DP nhỏ bằng tay (`xs`) trước khi code. Câu hỏi quy mô (ex05): bảng `3000 × 3000` có bao nhiêu ô? Dự đoán thời gian, rồi `bench`; rolling array tiết kiệm bao nhiêu bộ nhớ?

---

## 🟢 Cơ bản

### ex01 · Số đường đi trên lưới
Robot ở góc trên-trái lưới `m × n`, chỉ đi **phải** hoặc **xuống**, đến góc dưới-phải. Kết quả mod `10⁹ + 7`.
```java
int uniquePaths(int m, int n)
```
- Ràng buộc: `1 ≤ m, n ≤ 1000`.
- Ví dụ: `(3, 7)` → `28` · `(3, 2)` → `3` · `(1, 1)` → `1`. (LeetCode 62)

### ex02 · Đường đi có chướng ngại vật
`grid[r][c] = 1` là ô bị chặn. Đếm số đường đi, mod `10⁹ + 7`.
```java
int uniquePathsWithObstacles(int[][] grid)
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`, `grid[r][c] ∈ {0, 1}`. Ô đầu / ô cuối có thể bị chặn (→ `0`).
- Ví dụ: `[[0,0,0],[0,1,0],[0,0,0]]` → `2` · `[[1,0]]` → `0`. (LeetCode 63)

### ex03 · Tổng nhỏ nhất trên đường đi
Từ góc trên-trái đến góc dưới-phải, chỉ đi phải/xuống; tổng các ô đi qua nhỏ nhất.
```java
int minPathSum(int[][] grid)
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`, `0 ≤ grid[r][c] ≤ 100`.
- Ví dụ: `[[1,3,1],[1,5,1],[4,2,1]]` → `7` · `[[1,2,3],[4,5,6]]` → `12`. (LeetCode 64)

### ex04 · Dãy con chung dài nhất (LCS)
Độ dài dãy con chung (không cần liên tiếp) dài nhất của `a` và `b`.
```java
int longestCommonSubsequence(String a, String b)
```
- Ràng buộc: `0 ≤ |a|, |b| ≤ 3000`, chữ thường.
- Ví dụ: `"abcde", "ace"` → `3` · `"abc", "def"` → `0`. (LeetCode 1143)

### ex05 · Edit distance
Số thao tác ít nhất (chèn / xóa / thay một ký tự) biến `a` thành `b`.
```java
int minDistance(String a, String b)
```
- Ràng buộc: `0 ≤ |a|, |b| ≤ 3000`.
- Ví dụ: `"horse", "ros"` → `3` · `"intention", "execution"` → `5` · `"", "abc"` → `3`. (LeetCode 72)

### ex06 · Dãy con palindrome dài nhất
Độ dài dãy con (không cần liên tiếp) là palindrome dài nhất của `s`.
```java
int longestPalindromeSubseq(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 3000`.
- Ví dụ: `"bbbab"` → `4` · `"cbbd"` → `2`. (LeetCode 516)

### ex07 · Chuỗi con palindrome dài nhất
Chuỗi con **liên tiếp** là palindrome dài nhất. Nhiều đáp án cùng độ dài → trả về **một** đáp án bất kỳ (checker kiểm tra là chuỗi con, là palindrome và đủ dài).
```java
String longestPalindrome(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 3000`.
- Ví dụ: `"babad"` → `"bab"` hoặc `"aba"` · `"cbbd"` → `"bb"`. (LeetCode 5)

### ex08 · Chuỗi đan xen
`s3` có phải đan xen của `s1` và `s2` không? (Giữ nguyên thứ tự tương đối trong mỗi chuỗi, mỗi ký tự dùng đúng một lần.)
```java
boolean isInterleave(String s1, String s2, String s3)
```
- Ràng buộc: `0 ≤ |s1|, |s2| ≤ 1000`, `0 ≤ |s3| ≤ 2000`.
- Ví dụ: `"aabcc", "dbbca", "aadbbcbcac"` → `true` · `"aabcc", "dbbca", "aadbbbaccc"` → `false`. (LeetCode 97)

---

## 🔴 Thực tế

### ex09 · Mảnh đất vuông lớn nhất
> "Bản đồ lô đất là lưới ký tự `'1'` (đất trống) và `'0'` (đã xây). Tìm mảnh đất **hình vuông** toàn trống lớn nhất; trả về **diện tích** (số ô)."

```java
int maximalSquare(String[] matrix)
```
- Ràng buộc: `1 ≤ R, C ≤ 1000`, mỗi dòng dài `C`, chỉ gồm `'0'`/`'1'`. Không có ô trống → `0`.
- Ví dụ: `["10100","10111","11111","10010"]` → `4` · `["0"]` → `0`. (LeetCode 221)

### ex10 · Diff theo dòng
> "Công cụ so sánh hai phiên bản file. Với `a` (cũ) và `b` (mới), in danh sách thay đổi dựa trên dãy con chung dài nhất: dòng giữ nguyên `" x"`, dòng bị xóa `"-x"`, dòng thêm vào `"+x"`."

```java
List<String> diffLines(String[] a, String[] b)
```
- Ràng buộc: `0 ≤ |a|, |b| ≤ 2000`, mỗi dòng là chuỗi không rỗng chữ thường.
- **Quy tắc để đầu ra duy nhất** — duyệt `i` trong `a`, `j` trong `b` từ `0`, gọi `L(i, j)` = độ dài LCS của `a[i..]` và `b[j..]`:
  1. `a[i] == b[j]` → giữ (`" " + a[i]`), `i++, j++`.
  2. khác nhau và `L(i+1, j) ≥ L(i, j+1)` → xóa (`"-" + a[i]`), `i++` (**ưu tiên xóa trước thêm**).
  3. ngược lại → thêm (`"+" + b[j]`), `j++`.
  4. hết một bên → phần còn lại của `a` xóa hết, của `b` thêm hết.
- Ví dụ: `["a","b","c"], ["a","c","d"]` → `[" a","-b"," c","+d"]` · `["x"], ["y"]` → `["-x","+y"]` · `["a","b","a"], ["b","a","b"]` → `["-a"," b"," a","+b"]`.
- Mục tiêu: O(|a|·|b|). Gợi ý: truy vết cần cả bảng "suffix LCS". Java: so chuỗi bằng `equals`, không `==`.
