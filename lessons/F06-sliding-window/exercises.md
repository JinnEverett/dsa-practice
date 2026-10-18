# F06 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F06-sliding-window [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F06-sliding-window 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint. Mọi bài có lời giải O(n) (hoặc O(n + m)).

---

## 🟢 Cơ bản

### ex01 · Tổng lớn nhất của k phần tử liên tiếp
```java
long maxSumK(int[] nums, int k)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹` (tổng có thể vượt `int`).
- Ví dụ: `[2,1,5,1,3,2], 3` → `9` · `[-1,-2,-3], 2` → `-3`.

### ex02 · Đếm cửa sổ có trung bình đạt ngưỡng
Đếm số đoạn con liên tiếp độ dài `k` có trung bình **≥** `threshold`.
```java
int countWindows(int[] nums, int k, int threshold)
```
- Ràng buộc: `1 ≤ k ≤ n ≤ 10⁵`, `1 ≤ nums[i] ≤ 10⁴`, `0 ≤ threshold ≤ 10⁴`.
- Ví dụ: `[2,2,2,2,5,5,5,8], 3, 4` → `3` · `[11,13,17,23,29,31,7,5,2,3], 3, 5` → `6`.
- Gợi ý: so `sum ≥ threshold · k` để tránh phép chia số thực. (LeetCode 1343)

### ex03 · Chuỗi con dài nhất không lặp ký tự
```java
int lengthOfLongestSubstring(String s)
```
- Ràng buộc: `0 ≤ |s| ≤ 10⁵`, ký tự ASCII in được.
- Ví dụ: `"abcabcbb"` → `3` · `"bbbbb"` → `1` · `"pwwkew"` → `3` · `""` → `0`. (LeetCode 3)

### ex04 · Đoạn con ngắn nhất có tổng ≥ target
Độ dài nhỏ nhất của đoạn con liên tiếp có tổng **≥** `target`; không có thì `0`.
```java
int minSubArrayLen(int target, int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ nums[i] ≤ 10⁴` (dương), `1 ≤ target ≤ 10⁹`.
- Ví dụ: `7, [2,3,1,2,4,3]` → `2` ([4,3]) · `4, [1,4,4]` → `1` · `11, [1,1,1,1,1,1,1,1]` → `0`. (LeetCode 209)

---

## 🟡 Kết hợp

### ex05 · Thay tối đa k ký tự để có dãy giống nhau dài nhất
Được đổi tối đa `k` ký tự thành chữ hoa bất kỳ. Trả về độ dài dài nhất của chuỗi con gồm toàn một ký tự.
```java
int characterReplacement(String s, int k)
```
- Ràng buộc: `1 ≤ |s| ≤ 10⁵`, chữ hoa `A–Z`, `0 ≤ k ≤ |s|`.
- Ví dụ: `"ABAB", 2` → `4` · `"AABABBA", 1` → `4`. (LeetCode 424)

### ex06 · Tìm mọi vị trí anagram
Trả về (tăng dần) mọi chỉ số bắt đầu `i` sao cho `s[i .. i+|p|)` là hoán vị của `p`.
```java
List<Integer> findAnagrams(String s, String p)
```
- Ràng buộc: `1 ≤ |s|, |p| ≤ 10⁵`, chữ thường.
- Ví dụ: `"cbaebabacd", "abc"` → `[0,6]` · `"abab", "ab"` → `[0,1,2]`. (LeetCode 438)

### ex07 · Hái quả với 2 giỏ
`fruits[i]` là loại quả của cây thứ i. Bạn có 2 giỏ, mỗi giỏ chỉ đựng 1 loại. Bắt đầu ở cây bất kỳ, đi sang phải liên tiếp, hái 1 quả mỗi cây; dừng khi gặp loại thứ 3. Hái được nhiều nhất bao nhiêu quả? (= đoạn con dài nhất có ≤ 2 giá trị khác nhau)
```java
int totalFruit(int[] fruits)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ fruits[i] < n`.
- Ví dụ: `[1,2,1]` → `3` · `[0,1,2,2]` → `3` · `[1,2,3,2,2]` → `4`. (LeetCode 904)

### ex08 · Cửa sổ nhỏ nhất chứa đủ ký tự
Chuỗi con **ngắn nhất** của `s` chứa mọi ký tự của `t` (tính cả số lần lặp). Không có → `""`. Có nhiều đáp án cùng độ dài → lấy cái **bắt đầu sớm nhất**.
```java
String minWindow(String s, String t)
```
- Ràng buộc: `1 ≤ |s|, |t| ≤ 10⁵`, chữ hoa và chữ thường.
- Ví dụ: `"ADOBECODEBANC", "ABC"` → `"BANC"` · `"a", "aa"` → `""` · `"a", "a"` → `"a"`. (LeetCode 76)

---

## 🔴 Thực tế

### ex09 · Đỉnh tải trong cửa sổ thời gian
> "Từ access log (timestamp tính bằng ms, **đã sắp xếp**), tìm số request lớn nhất rơi vào **một** cửa sổ dài `w` ms bất kỳ — nghĩa là tập request có `times[j] − times[i] < w`. Dùng để cấu hình rate limit."

```java
int peakLoad(int[] times, int w)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `times` không giảm, `0 ≤ times[i] ≤ 10⁹`, `1 ≤ w ≤ 10⁹`.
- Ví dụ: `[0, 100, 500, 900, 1000, 1001], 1000` → `5` (từ 100 đến 1001: 100, 500, 900, 1000, 1001 — mọi hiệu < 1000) · `[], 10` → `0` · `[5,5,5], 1` → `3`.

### ex10 · Chuỗi ngày hoạt động dài nhất khi được "bù" k ngày
> "`days[i] = 1` nếu user có hoạt động ngày i, `0` nếu không. Chương trình streak cho phép bù tối đa `k` ngày nghỉ. Streak dài nhất có thể là bao nhiêu ngày?"

```java
int longestStreak(int[] days, int k)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `days[i] ∈ {0, 1}`, `0 ≤ k ≤ n`.
- Ví dụ: `[1,1,1,0,0,0,1,1,1,1,0], 2` → `6` · `[0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], 3` → `10`. (LeetCode 1004)
