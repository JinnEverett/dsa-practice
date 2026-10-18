# P05 · Timed set Easy (6 bài × 15 phút)

Tạo khung: `node tools/scaffold.ts lessons/P05-timed-easy [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/P05-timed-easy NN`

**Pass:** ≥ 5/6 bài qua `check` **trong giờ** (15 phút/bài, không gợi ý). Luật chi tiết ở README.

---

### ex01 · 🟢 Mã lỗi chiếm đa số
Nhật ký lỗi của một dịch vụ ghi mã lỗi từng request. Biết có một mã lỗi xuất hiện **nhiều hơn một nửa** số dòng. Tìm mã đó.
```java
int majorityElement(int[] nums)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`, luôn tồn tại phần tử chiếm đa số. Mục tiêu: O(n) time, O(1) space.
- Ví dụ: `[3,2,3]` → `3` · `[2,2,1,1,1,2,2]` → `2`. (≈ LeetCode 169)

### ex02 · 🟢 Lãi lớn nhất, một lần mua – một lần bán
`prices[i]` là giá cổ phiếu ngày `i`. Chọn một ngày mua và một ngày bán **sau đó** để lãi lớn nhất. Không có lãi → `0`.
```java
int maxProfit(int[] prices)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ prices[i] ≤ 10⁹`.
- Ví dụ: `[7,1,5,3,6,4]` → `5` · `[7,6,4,3,1]` → `0` · `[2,4,1]` → `2`. (≈ LeetCode 121)

### ex03 · 🔴 Chuỗi lệnh có xuất hiện đúng thứ tự trong nhật ký?
Quy trình kiểm toán nói: lệnh `s` (chuỗi ký tự, mỗi ký tự là một loại sự kiện) phải xuất hiện **đúng thứ tự** (không cần liền nhau) trong nhật ký `t`. Kiểm tra `s` có là dãy con của `t` không.
```java
boolean isSubsequence(String s, String t)
```
- Ràng buộc: `0 ≤ |s| ≤ 10⁵`, `0 ≤ |t| ≤ 10⁵`, ký tự ASCII. `s` rỗng → `true`.
- Ví dụ: `"abc", "ahbgdc"` → `true` · `"axc", "ahbgdc"` → `false` · `"aa", "a"` → `false`. (≈ LeetCode 392)

### ex04 · 🔴 Tóm tắt dãy mã vé liên tiếp
Hệ thống vé có danh sách mã vé đã bán, **sắp tăng ngặt**. Tóm tắt thành các đoạn liên tiếp: đoạn một vé là `"a"`, đoạn dài hơn là `"a->b"`.
```java
List<String> summaryRanges(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `nums` là `int` 32 bit bất kỳ (kể cả `−2³¹` và `2³¹ − 1`), khác nhau, sắp tăng.
- Ví dụ: `[0,1,2,4,5,7]` → `["0->2","4->5","7"]` · `[]` → `[]` · `[-2147483648, 2147483647]` → `["-2147483648","2147483647"]`. (≈ LeetCode 228)

### ex05 · 🟡 Phần tử lớn hơn kế tiếp
Với mỗi `x` trong `nums1`, tìm phần tử **đầu tiên lớn hơn `x` nằm bên phải `x` trong `nums2`** (`nums1` là tập con của `nums2`, mọi giá trị khác nhau). Không có → `-1`.
```java
int[] nextGreaterElement(int[] nums1, int[] nums2)
```
- Ràng buộc: `0 ≤ |nums1| ≤ |nums2| ≤ 10⁵`, giá trị trong `[−10⁹, 10⁹]`. Mục tiêu O(|nums1| + |nums2|).
- Ví dụ: `[4,1,2], [1,3,4,2]` → `[-1,3,-1]` · `[2,4], [1,2,3,4]` → `[3,-1]`. (≈ LeetCode 496)

### ex06 · 🟡 Palindrome dài nhất ghép từ các chữ cái
Từ các chữ cái của `s` (mỗi chữ dùng tối đa số lần nó xuất hiện), ghép thành chuỗi palindrome **dài nhất** có thể; trả về độ dài. Phân biệt hoa/thường.
```java
int longestPalindromeLetters(String s)
```
- Ràng buộc: `0 ≤ |s| ≤ 10⁵`, `s` gồm chữ cái Latin hoa/thường.
- Ví dụ: `"abccccdd"` → `7` · `"Aa"` → `1` · `""` → `0` · `"aaabbb"` → `5`. (≈ LeetCode 409)

---

**Câu hỏi quy mô:** với ex02 và ex05, dự đoán thời gian bản O(n²) ở `n = 10⁵` (≈ 10¹⁰ phép), rồi `bench` bản O(n) của bạn ở `l` và kiểm chứng số mũ.
