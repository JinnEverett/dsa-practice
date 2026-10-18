# F03 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F03-strings [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F03-strings 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint.

---

## 🟢 Cơ bản

### ex01 · Palindrome hợp lệ
Chỉ xét chữ cái và chữ số (bỏ qua mọi ký tự khác), không phân biệt hoa/thường. Chuỗi có đọc xuôi = đọc ngược không?
```java
boolean isPalindrome(String s)
```
- Ràng buộc: `0 ≤ |s| ≤ 2·10⁵`, ký tự ASCII in được.
- Ví dụ: `"A man, a plan, a canal: Panama"` → `true` · `"race a car"` → `false` · `" "` → `true`.
- Mục tiêu: O(n) time, O(1) bộ nhớ phụ (không tạo chuỗi đã lọc). (LeetCode 125)

### ex02 · Anagram
`t` có phải hoán vị các ký tự của `s` không?
```java
boolean isAnagram(String s, String t)
```
- Ràng buộc: `0 ≤ |s|, |t| ≤ 10⁵`, chỉ chữ thường `a–z`.
- Ví dụ: `"anagram", "nagaram"` → `true` · `"rat", "car"` → `false`.
- Mục tiêu: O(n) time, O(1) bộ nhớ (mảng 26). (LeetCode 242)

### ex03 · Ký tự không lặp đầu tiên
Trả về **chỉ số** của ký tự đầu tiên chỉ xuất hiện đúng 1 lần, không có thì `-1`.
```java
int firstUniqChar(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁵`, chữ thường.
- Ví dụ: `"leetcode"` → `0` · `"loveleetcode"` → `2` · `"aabb"` → `-1`. (LeetCode 387)

### ex04 · Tiền tố chung dài nhất
```java
String longestCommonPrefix(String[] strs)
```
- Ràng buộc: `1 ≤ số chuỗi ≤ 10⁴`, `0 ≤ độ dài mỗi chuỗi ≤ 200`, chữ thường.
- Ví dụ: `["flower","flow","flight"]` → `"fl"` · `["dog","racecar","car"]` → `""` · `["a"]` → `"a"`. (LeetCode 14)

---

## 🟡 Kết hợp

### ex05 · Đảo thứ tự từ
Trả về các từ theo thứ tự ngược lại, cách nhau **đúng 1** khoảng trắng, không có khoảng trắng đầu/cuối.
```java
String reverseWords(String s)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁵`, gồm chữ, số và khoảng trắng `' '`; có ít nhất 1 từ.
- Ví dụ: `"the sky is blue"` → `"blue is sky the"` · `"  hello world  "` → `"world hello"` · `"a good   example"` → `"example good a"`. (LeetCode 151)

### ex06 · Nén chuỗi (run-length)
Thay mỗi dãy ký tự giống nhau liên tiếp bằng ký tự + số lần lặp. Dãy dài 1 thì **không** ghi số.
```java
String compress(String s)
```
- Ràng buộc: `0 ≤ |s| ≤ 10⁵`, chữ cái `a–z` `A–Z` (phân biệt hoa/thường).
- Ví dụ: `"aaabccdddd"` → `"a3bc2d4"` · `"abc"` → `"abc"` · `"aaaaaaaaaaaa"` → `"a12"` · `""` → `""`.
- Mục tiêu: O(n). Java: dùng `StringBuilder`.

### ex07 · Gom nhóm anagram
Gom các chuỗi là anagram của nhau vào cùng nhóm. Thứ tự các nhóm và thứ tự trong nhóm **tùy ý**.
```java
List<List<String>> groupAnagrams(String[] strs)
```
- Ràng buộc: `1 ≤ số chuỗi ≤ 10⁴`, `0 ≤ độ dài ≤ 100`, chữ thường.
- Ví dụ: `["eat","tea","tan","ate","nat","bat"]` → `[["bat"],["nat","tan"],["ate","eat","tea"]]` · `[""]` → `[[""]]`. (LeetCode 49)

### ex08 · Chuỗi sang số nguyên 32-bit (atoi)
Quy tắc: (1) bỏ khoảng trắng đầu; (2) đọc dấu `+`/`-` nếu có (tối đa 1); (3) đọc các chữ số liên tiếp, dừng ở ký tự không phải chữ số; (4) không đọc được chữ số nào → `0`; (5) kết quả ngoài `[-2³¹, 2³¹ − 1]` thì kẹp về biên.
```java
int myAtoi(String s)
```
- Ràng buộc: `0 ≤ |s| ≤ 200`, gồm chữ, số, `' '`, `+`, `-`, `.`.
- Ví dụ: `"42"` → `42` · `"   -042"` → `-42` · `"1337c0d3"` → `1337` · `"0-1"` → `0` · `"words 987"` → `0` · `"-91283472332"` → `-2147483648` · `"+-12"` → `0`.
- Bẫy Java: tích lũy bằng `int` sẽ tràn trước khi kịp kẹp. (LeetCode 8)

---

## 🔴 Thực tế

### ex09 · Tạo slug cho URL bài viết
> "CMS cần tạo slug từ tiêu đề tiếng Việt: `"Hướng dẫn  Đăng ký — Tài khoản (2026)!"` → `"huong-dan-dang-ky-tai-khoan-2026"`."

Quy tắc:
1. Bỏ dấu tiếng Việt (NFD + xóa combining mark), `đ`/`Đ` → `d`.
2. Chuyển thành chữ thường.
3. Mọi chuỗi ký tự **không** thuộc `[a-z0-9]` liên tiếp → một dấu `-`.
4. Không có `-` ở đầu và cuối. Không còn ký tự hợp lệ nào → `""`.

```java
String slugify(String title)
```
- Ràng buộc: `0 ≤ |title| ≤ 10⁵`, chữ tiếng Việt (dạng NFC), số, khoảng trắng, dấu câu.
- Ví dụ: như trên · `"  --Xin chào--  "` → `"xin-chao"` · `"!!!"` → `""` · `"Ngô Bảo Châu"` → `"ngo-bao-chau"`.

### ex10 · Cộng hai số tiền dạng chuỗi
> "Hệ thống kế toán nhận số dư dạng chuỗi chữ số (có thể dài hàng nghìn chữ số, vượt mọi kiểu số). Viết hàm cộng hai số không âm."

```java
String addStrings(String num1, String num2)
```
- Ràng buộc: `1 ≤ |num1|, |num2| ≤ 10⁵`, chỉ chữ số, không có số 0 ở đầu (trừ chính `"0"`).
- **Không** chuyển cả chuỗi sang số (`Number`, `int()`, `BigInteger`, `BigInt`).
- Ví dụ: `"11", "123"` → `"134"` · `"456", "77"` → `"533"` · `"0", "0"` → `"0"` · `"995", "17"` → `"1012"`.
- Mục tiêu: O(max(n, m)). (LeetCode 415)
