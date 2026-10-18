# A09 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/A09-string-algorithms [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/A09-string-algorithms 01` · Đo: `node tools/bench.ts lessons/A09-string-algorithms 01`

**Pass:** ≥ 6/8 bài qua `check`, ≤ 2 hint. Trước mỗi bài: nói thuật toán (π / Z / rolling hash), độ phức tạp, và **bẫy** bạn sẽ tránh.
Câu hỏi quy mô (ex01): `haystack` 10⁶ ký tự `a`, `needle` = 5·10⁵ ký tự `a` rồi `b`. Dự đoán số phép của bản thô O(n·m), rồi `bench` KMP.

> Bảng chữ cái trong mọi bài là chữ thường `a–z` trừ khi đề nói khác — vì thế `'#'` dùng được làm ký tự phân cách.

---

## 🟢 Cơ bản

### ex01 · Tìm chuỗi con (KMP)
Vị trí đầu tiên `needle` xuất hiện trong `haystack`, không có → `-1`.
```java
int strStr(String haystack, String needle)
```
- Ràng buộc: `1 ≤ |haystack|, |needle| ≤ 10⁶`.
- Ví dụ: `"sadbutsad", "sad"` → `0` · `"leetcode", "leeto"` → `-1` · `"abc", "abcd"` → `-1`. (LeetCode 28)
- Mục tiêu: O(n + m). Bản thô trượt Perf.

### ex02 · Prefix function
`π[i]` = độ dài border dài nhất (vừa là tiền tố vừa là hậu tố, **ngắn hơn** `s[0..i]`) của `s[0..i]`.
```java
int[] prefixFunction(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁶`.
- Ví dụ: `"abab"` → `[0,0,1,2]` · `"aabaaab"` → `[0,1,0,1,2,2,3]` · `"a"` → `[0]`.
- Giải thích bằng lời vì sao tổng O(n) (amortized).

### ex03 · Z-function
`z[i]` = độ dài tiền tố chung dài nhất của `s` và `s[i..]`; quy ước **`z[0] = |s|`**.
```java
int[] zFunction(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁶`.
- Ví dụ: `"aaaaa"` → `[5,4,3,2,1]` · `"abacaba"` → `[7,0,1,0,3,0,1]`.

### ex04 · Chuỗi lặp
`s` có phải là một chuỗi con (không rỗng, ngắn hơn `s`) lặp lại ≥ 2 lần ghép thành không?
```java
boolean repeatedSubstringPattern(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁶`.
- Ví dụ: `"abab"` → `true` · `"aba"` → `false` · `"abcabcabcabc"` → `true` · `"a"` → `false`. (LeetCode 459)
- Gợi ý: chu kỳ nhỏ nhất `p = n − π[n−1]`.

### ex05 · Palindrome ngắn nhất bằng cách thêm vào đầu
Thêm ký tự vào **đầu** `s` để được palindrome ngắn nhất; trả về chuỗi đó.
```java
String shortestPalindrome(String s)
```
- Ràng buộc: `0 ≤ |s| ≤ 10⁶`. `s = ""` → `""`.
- Ví dụ: `"aacecaaa"` → `"aaacecaaa"` · `"abcd"` → `"dcbabcd"`. (LeetCode 214)
- Mục tiêu: O(n) — tìm tiền tố palindrome dài nhất bằng π của `s + '#' + reverse(s)`. Thử từng tiền tố rồi kiểm tra palindrome là O(n²). Java: dùng `StringBuilder`.

### ex06 · Chuỗi con lặp dài nhất (rolling hash)
Chuỗi con **dài nhất xuất hiện ít nhất 2 lần** (hai lần có thể chồng lấn). Không có → `""`. Nhiều đáp án cùng độ dài → trả về một đáp án bất kỳ (checker kiểm tra độ dài và số lần xuất hiện).
```java
String longestDupSubstring(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁵`, chữ thường.
- Ví dụ: `"banana"` → `"ana"` · `"abcd"` → `""` · `"aaaaa"` → `"aaaa"`. (LeetCode 1044)
- Mục tiêu: binary search độ dài + rolling hash, O(n log n). Chú ý: JS nhân mod `~10⁹` vượt `2⁵³`; hash trùng nên **kiểm chứng** bằng so sánh thật.

---

## 🔴 Thực tế

### ex07 · Tìm mọi vị trí khớp
> "Công cụ tìm kiếm văn bản: liệt kê **mọi** vị trí `pattern` xuất hiện trong `text` (kể cả các lần xuất hiện chồng lấn), theo thứ tự tăng dần."

```java
List<Integer> findAll(String text, String pattern)
```
- Ràng buộc: `0 ≤ |text| ≤ 10⁶`, `1 ≤ |pattern| ≤ 10⁶`. Không có → `[]`. Kết quả có thể tới `10⁶` phần tử.
- Ví dụ: `"aaaaa", "aa"` → `[0,1,2,3]` · `"abcabc", "bc"` → `[1,4]`.
- Mục tiêu: O(n + m). Dùng Z-function hoặc KMP.

### ex08 · Chuỗi con chung dài nhất
> "So sánh hai tệp: độ dài của đoạn văn bản dài nhất xuất hiện liên tiếp ở **cả hai**."

```java
int longestCommonSubstring(String a, String b)
```
- Ràng buộc: `0 ≤ |a|, |b| ≤ 10⁵`, chữ thường.
- Ví dụ: `"abcdxyz", "xyzabcd"` → `4` · `"abc", "def"` → `0` · `"", "abc"` → `0`.
- Mục tiêu: binary search độ dài + rolling hash, O((n + m) log n). DP O(n·m) = 10¹⁰ trượt Perf. (Đã gặp bản DP ở A03; lần này ràng buộc lớn hơn.)
