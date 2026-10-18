# P07 · Timed set Hard / mixed (4 bài × 40 phút)

Tạo khung: `node tools/scaffold.ts lessons/P07-timed-hard [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/P07-timed-hard NN`

**Pass:** ≥ 2/4 bài qua `check` **trong giờ** (40 phút/bài, không gợi ý). Luật chi tiết ở README.

---

### ex01 · 🔴 Trung vị độ trễ của hai cụm máy
Hai cụm máy mỗi cụm cho một danh sách độ trễ (ms) đã **sắp tăng**. Tìm **trung vị** của toàn bộ độ trễ (gộp hai danh sách) mà không gộp thật: mục tiêu O(log(min(m, n))).
```java
double findMedianSortedArrays(int[] nums1, int[] nums2)
```
- Ràng buộc: `0 ≤ m, n ≤ 10⁶`, `m + n ≥ 1`, `|giá trị| ≤ 2³¹ − 1`. Tổng chẵn → trung bình hai phần tử giữa (số thực, sai số `10⁻⁶`; chú ý tràn `int` khi cộng).
- Ví dụ: `[1,3], [2]` → `2.0` · `[1,2], [3,4]` → `2.5` · `[2147483647], [2147483647]` → `2147483647.0`. (≈ LeetCode 4)

### ex02 · 🟡 Khớp mẫu với "." và "\*"
Mẫu `p` gồm chữ cái thường, `.` (khớp đúng một ký tự bất kỳ) và `*` (khớp **không hoặc nhiều** lần ký tự đứng ngay trước nó). Kiểm tra mẫu khớp **toàn bộ** chuỗi `s`.
```java
boolean isMatch(String s, String p)
```
- Ràng buộc: `0 ≤ |s| ≤ 1000`, `0 ≤ |p| ≤ 1000`; `s` gồm chữ thường; `*` luôn đứng sau một chữ cái hoặc `.` (không bao giờ đứng đầu và không có `**`).
- Ví dụ: `"aa", "a"` → `false` · `"aa", "a*"` → `true` · `"ab", ".*"` → `true` · `"aab", "c*a*b"` → `true` · `"mississippi", "mis*is*p*."` → `false`. (≈ LeetCode 10)
- Test lớn: `s = "a"×1000`, `p = "a*"×499 + "b"` — đệ quy không nhớ sẽ không xong.

### ex03 · 🔴 Số tuyến xe buýt ít nhất
Mạng xe buýt có các tuyến `routes[i]` (danh sách điểm dừng mà tuyến `i` đi qua, vòng lặp mãi mãi). Bạn đứng ở điểm dừng `source`, cần tới `target`, và chỉ đi bằng xe buýt (đổi tuyến tại điểm dừng chung). Trả **số tuyến ít nhất** phải lên, hoặc `-1` nếu không tới được. `source == target` → `0`.
```java
int numBusesToDestination(int[][] routes, int source, int target)
```
- Ràng buộc: `0 ≤ |routes| ≤ 1000`, tổng số điểm dừng ≤ `10⁵`, mã điểm dừng trong `[0, 10⁶]`, mỗi tuyến không lặp điểm dừng.
- Ví dụ: `[[1,2,7],[3,6,7]], 1, 6` → `2` · `[[7,12],[4,5,15],[6],[15,19],[9,12,13]], 15, 12` → `-1` · `[[1,2]], 1, 1` → `0`. (≈ LeetCode 815)

### ex04 · 🔴 Phòng họp được đặt nhiều nhất
Có `n` phòng họp đánh số `0..n−1` và danh sách cuộc họp `[start, end)` với các `start` **khác nhau**. Xử lý cuộc họp theo thứ tự `start` tăng dần:
- Có phòng trống tại thời điểm `start` (phòng trống nếu cuộc họp trước kết thúc `≤ start`) → dùng phòng **chỉ số nhỏ nhất** trong các phòng trống.
- Không có → cuộc họp **chờ** phòng nào rảnh sớm nhất (hòa → chỉ số nhỏ hơn), bắt đầu khi phòng đó rảnh và **giữ nguyên thời lượng** `end − start`.
Trả phòng được dùng cho **nhiều cuộc họp nhất** (hòa → chỉ số nhỏ nhất).
```java
int mostBooked(int n, int[][] meetings)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `1 ≤ |meetings| ≤ 10⁵`, `0 ≤ start < end ≤ 5·10⁵`. Thời điểm kết thúc sau khi bị dời có thể tới ~5·10¹⁰ — Java dùng `long`.
- Ví dụ: `n=2, [[0,10],[1,5],[2,7],[3,4]]` → `0` · `n=3, [[1,20],[2,10],[3,5],[4,9],[6,8]]` → `1`. (≈ LeetCode 2402)

---

**Câu hỏi quy mô:** ex01: vì sao `m + n = 2·10⁶` mà bản đúng chạy dưới 1 ms? ex04: với `n = 2·10⁴`, 10⁵ cuộc họp, ước lượng phép tính của bản quét mọi phòng; đối chiếu bằng `bench`.
