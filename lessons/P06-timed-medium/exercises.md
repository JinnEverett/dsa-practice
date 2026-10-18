# P06 · Timed set Medium (5 bài × 25 phút)

Tạo khung: `node tools/scaffold.ts lessons/P06-timed-medium [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/P06-timed-medium NN`

**Pass:** ≥ 4/5 bài qua `check` **trong giờ** (25 phút/bài, không gợi ý). Luật chi tiết ở README.

---

### ex01 · 🔴 Lập lịch job có thời gian nguội
Một worker chạy mỗi chu kỳ **một** job (hoặc nghỉ). Hai job **cùng loại** phải cách nhau ít nhất `n` chu kỳ (nghỉ hoặc chạy job loại khác ở giữa). Thứ tự job tự do. Trả số chu kỳ **ít nhất** để chạy hết.
```java
int leastInterval(String[] tasks, int n)
```
- Ràng buộc: `0 ≤ |tasks| ≤ 10⁵`, mỗi phần tử là một chữ cái in hoa (`"A"`–`"Z"`), `0 ≤ n ≤ 100`.
- Ví dụ: `[A,A,A,B,B,B], n=2` → `8` (ví dụ `A B _ A B _ A B`) · `n=0` → `6` · `[A,B,C], n=5` → `3`. (≈ LeetCode 621)

### ex02 · 🔴 Nhân viên cách k bậc trong sơ đồ tổ chức
Sơ đồ tổ chức là cây nhị phân (cây cấp trên – cấp dưới, tối đa hai cấp dưới trực tiếp), mỗi nhân viên có mã **duy nhất**. "Khoảng cách" giữa hai người là số cạnh trên đường đi ngắn nhất (đi lên cấp trên hoặc xuống cấp dưới). Tìm mã của mọi nhân viên cách nhân viên `target` **đúng k bậc**. Thứ tự tùy ý.
```java
List<Integer> distanceK(TreeNode root, int target, int k)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, mã khác nhau trong `[0, 10⁹]`, `target` có trong cây, `0 ≤ k ≤ 10⁵`. Cây có thể lệch sâu `10⁵` tầng. Input cây dạng level-order kiểu LeetCode.
- Ví dụ: `[3,5,1,6,2,0,8,null,null,7,4], target=5, k=2` → `[7,4,1]` · `[1], target=1, k=0` → `[1]`. (≈ LeetCode 863)

### ex03 · 🟡 Cờ rắn và thang
Bàn cờ `N × N` đánh số `1..N²` theo kiểu **boustrophedon**: bắt đầu ở góc **dưới trái** (ô 1), đi sang phải hết hàng dưới cùng, lên hàng trên đi sang trái, lại sang phải… `board[r][c]` là `-1` nếu ô thường, ngược lại là ô đích của thang/rắn. Bạn đứng ở ô 1, mỗi lượt đổ xúc xắc được chọn bước `1..6` tới ô `s + d` (nếu `≤ N²`); nếu ô đó có thang/rắn thì **bị chuyển ngay** tới ô đích (không chuyển tiếp lần nữa trong cùng lượt). Trả số lượt ít nhất để tới ô `N²`, hoặc `-1`.
```java
int snakesAndLadders(int[][] board)
```
- Ràng buộc: `1 ≤ N ≤ 316`, ô 1 và ô `N²` luôn là `-1`; đích của thang/rắn thuộc `[1, N²]`.
- Ví dụ: bảng `N=2`: `[[-1,-1],[-1,3]]` → `1` · bảng 3×3 không thang → `2`. (≈ LeetCode 909)

### ex04 · 🟡 Mảng con có tổng chia hết cho k
Có mảng con **liên tiếp** độ dài **ít nhất 2** mà tổng là bội của `k` không? (Tổng `0` là bội của mọi `k`.)
```java
boolean checkSubarraySum(int[] nums, int k)
```
- Ràng buộc: `1 ≤ n ≤ 10⁵`, `0 ≤ nums[i] ≤ 2³¹ − 1`, `1 ≤ k ≤ 2³¹ − 1` (tổng có thể vượt `int`; trong Java dùng `long`).
- Ví dụ: `[23,2,4,6,7], 6` → `true` · `[23,2,6,4,7], 13` → `false` · `[1], 1` → `false`. (≈ LeetCode 523)

### ex05 · 🟡 Có ba phần tử tăng dần
Có ba chỉ số `i < j < k` với `nums[i] < nums[j] < nums[k]` không? Mục tiêu O(n) time, O(1) space.
```java
boolean increasingTriplet(int[] nums)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 2³¹ − 1`.
- Ví dụ: `[1,2,3,4,5]` → `true` · `[5,4,3,2,1]` → `false` · `[20,100,10,12,5,13]` → `true` · `[1,1,1]` → `false`. (≈ LeetCode 334)

---

**Câu hỏi quy mô:** trước khi chạy `check`, nêu Big-O của bản bạn cho ex02 và ex04; sau đó `bench` ở `m` và `l`. Số mũ ước lượng có khớp không?
