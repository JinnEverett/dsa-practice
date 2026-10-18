# F04 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/F04-hashing [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/F04-hashing 01`

**Pass:** 8/10 bài qua `check`, ≤ 2 hint. Mọi bài đều có lời giải O(n) hoặc O(n log n) — bản O(n²) sẽ trượt Perf.

---

## 🟢 Cơ bản

### ex01 · Two Sum
Trả về chỉ số `[i, j]` với `i < j` và `nums[i] + nums[j] == target`. Đề bảo đảm có ít nhất một cặp; có nhiều cặp thì trả cặp nào cũng được.
```java
int[] twoSum(int[] nums, int target)
```
- Ràng buộc: `2 ≤ n ≤ 10⁵`, `-10⁹ ≤ nums[i], target ≤ 10⁹`.
- Ví dụ: `[2,7,11,15], 9` → `[0,1]` · `[3,2,4], 6` → `[1,2]` · `[3,3], 6` → `[0,1]`.
- Mục tiêu: O(n), một lượt duyệt. (LeetCode 1)

### ex02 · Trùng lặp gần nhau
Có hai chỉ số khác nhau `i, j` với `nums[i] == nums[j]` và `|i − j| ≤ k` không?
```java
boolean containsNearbyDuplicate(int[] nums, int k)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ k ≤ 10⁵`.
- Ví dụ: `[1,2,3,1], 3` → `true` · `[1,0,1,1], 1` → `true` · `[1,2,3,1,2,3], 2` → `false`. (LeetCode 219)

### ex03 · Chuỗi đẳng cấu
`s` và `t` đẳng cấu nếu có thể thay **mỗi** ký tự của `s` bằng đúng một ký tự (một-một, giữ thứ tự) để được `t`.
```java
boolean isIsomorphic(String s, String t)
```
- Ràng buộc: `1 ≤ |s| = |t| ≤ 5·10⁴`, ký tự ASCII.
- Ví dụ: `"egg","add"` → `true` · `"foo","bar"` → `false` · `"badc","baba"` → `false` (b→b và d→b: hai ký tự không được map vào cùng một). (LeetCode 205)

### ex04 · Mẫu từ
`pattern` gồm chữ cái, `s` gồm các từ cách nhau 1 khoảng trắng. `s` có theo đúng mẫu không (song ánh chữ cái ↔ từ)?
```java
boolean wordPattern(String pattern, String s)
```
- Ràng buộc: `1 ≤ |pattern| ≤ 300`, `1 ≤ |s| ≤ 3000`.
- Ví dụ: `"abba","dog cat cat dog"` → `true` · `"abba","dog cat cat fish"` → `false` · `"abba","dog dog dog dog"` → `false` · `"aaa","dog dog"` → `false` (khác số lượng). (LeetCode 290)

---

## 🟡 Kết hợp

### ex05 · Dãy số liên tiếp dài nhất
Độ dài dãy số nguyên **liên tiếp** dài nhất (không cần liền kề trong mảng).
```java
int longestConsecutive(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `-10⁹ ≤ nums[i] ≤ 10⁹`, có thể trùng.
- Ví dụ: `[100,4,200,1,3,2]` → `4` (1,2,3,4) · `[0,3,7,2,5,8,4,6,0,1]` → `9` · `[]` → `0`.
- Mục tiêu: **O(n)** (không sort). (LeetCode 128)

### ex06 · k giá trị xuất hiện nhiều nhất
Trả về `k` giá trị có tần suất cao nhất, sắp theo **tần suất giảm dần**; cùng tần suất thì **giá trị tăng dần**.
```java
int[] topKFrequent(int[] nums, int k)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ k ≤ số giá trị khác nhau`.
- Ví dụ: `[1,1,1,2,2,3], 2` → `[1,2]` · `[4,4,5,5,6], 3` → `[4,5,6]` · `[7], 1` → `[7]`.
- Mục tiêu: O(n log n) là đạt; O(n) bằng *bucket sort theo tần suất* là nâng cao. (LeetCode 347, có thêm quy tắc tie)

### ex07 · Bốn mảng có tổng bằng 0
Đếm số bộ `(i, j, k, l)` với `a[i] + b[j] + c[k] + d[l] == 0`.
```java
int fourSumCount(int[] a, int[] b, int[] c, int[] d)
```
- Ràng buộc: `1 ≤ n ≤ 200` (4 mảng cùng độ dài n), `-2²⁸ ≤ giá trị ≤ 2²⁸`.
- Ví dụ: `[1,2], [-2,-1], [-1,2], [0,2]` → `2`.
- Mục tiêu: O(n²). Bản O(n⁴) = 1.6·10⁹ phép ở n = 200 sẽ trượt Perf. (LeetCode 454)

---

## 🔴 Thực tế

### ex08 · Chống gửi trùng request (idempotency)
> "Client hay retry nên cùng một `requestId` có thể đến nhiều lần. Server **chấp nhận** một request nếu `requestId` đó chưa từng được chấp nhận, hoặc lần **chấp nhận** gần nhất đã cách hiện tại **ít nhất** `window` giây. Trả về chỉ số các request được chấp nhận."

```java
List<Integer> acceptRequests(String[] ids, int[] times, int window)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `times` **không giảm**, `0 ≤ times[i] ≤ 10⁹`, `1 ≤ window ≤ 10⁹`.
- Ví dụ: `ids = ["a","b","a","a","b"], times = [0,1,5,10,11], window = 10` → `[0,1,3,4]`
  (`a` lúc 5 bị từ chối vì 5 − 0 < 10; `a` lúc 10 được nhận vì 10 − 0 ≥ 10; `b` lúc 11: 11 − 1 = 10 ≥ 10 → nhận).
- Chú ý: so với lần **được chấp nhận** gần nhất, không phải lần **xuất hiện** gần nhất.

### ex09 · Tìm file trùng nội dung
> "Dọn dẹp storage: tìm các nhóm file có **nội dung giống hệt nhau**. Chỉ báo nhóm có từ 2 file trở lên."

```java
List<List<String>> duplicateFiles(String[] paths, String[] contents)
```
- `paths[i]` có nội dung `contents[i]`. Ràng buộc: `0 ≤ n ≤ 2·10⁴`, mỗi nội dung ≤ 50 ký tự, `paths` khác nhau.
- Output: thứ tự nhóm và thứ tự trong nhóm **tùy ý**.
- Ví dụ: `paths = ["/a/1.txt","/a/2.txt","/b/3.txt","/c/4.txt"], contents = ["abcd","efgh","abcd","efgh"]` → `[["/a/1.txt","/b/3.txt"],["/a/2.txt","/c/4.txt"]]`. (LeetCode 609, đã bỏ phần parse)

### ex10 · Đối soát đơn hàng hai hệ thống
> "Hệ thống bán hàng (A) và kế toán (B) đều ghi mã đơn, một mã có thể xuất hiện nhiều lần (đơn chia nhiều phần). Liệt kê các mã A có **nhiều hơn** B, mỗi mã lặp lại đúng số lần chênh lệch, sắp xếp tăng dần."

```java
List<Integer> reconcile(int[] a, int[] b)
```
- Ràng buộc: `0 ≤ |a|, |b| ≤ 10⁵`, mã trong `[1, 10⁹]`.
- Ví dụ: `a = [5,3,5,5,9], b = [5,9,9,7]` → `[3,5,5]` (3: 1−0; 5: 3−1 = 2; 9: 1−2 < 0 bỏ; 7 không có ở A).
- Mục tiêu: O((n + m) + d log d) với d = số mã chênh lệch.
