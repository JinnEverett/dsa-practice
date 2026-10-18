# I10 · Greedy & intervals

## Sau buổi này bạn sẽ
- Nhận ra khi nào **tham lam (greedy)** đúng và **chứng minh** bằng *exchange argument*.
- Xử lý bài **khoảng (intervals)**: sắp theo đầu hay cuối, gộp, chèn, chọn nhiều khoảng không chồng nhau nhất.
- Kết hợp greedy với **heap** (lập lịch theo hạn chót / theo ngày).
- **Tìm phản ví dụ** cho một greedy sai — kỹ năng quan trọng không kém viết greedy đúng.

## 1. Greedy là gì

Ở mỗi bước chọn lựa chọn **tốt nhất tại chỗ** theo một tiêu chí cố định, không quay lại. Nhanh (thường O(n) hoặc O(n log n) do sort) nhưng **chỉ đúng khi bài có cấu trúc đặc biệt**. Không có greedy "mặc định đúng".

### Exchange argument — cách chứng minh
Lấy một lời giải tối ưu bất kỳ `OPT`. Chỉ ra có thể **đổi** lựa chọn đầu tiên của `OPT` thành lựa chọn của greedy mà **không làm tệ đi** (vẫn hợp lệ, không giảm chất lượng). Lặp lại cho các bước sau ⇒ greedy cũng tối ưu.

Ví dụ — chọn nhiều khoảng không chồng nhau nhất: `OPT` bắt đầu bằng khoảng `A`; greedy bắt đầu bằng khoảng `B` kết thúc **sớm nhất**. Thay `A` bằng `B`: `B` kết thúc không muộn hơn `A` nên không chồng với bất kỳ khoảng nào `A` không chồng ⇒ vẫn hợp lệ, cùng số khoảng.

### Khi nào greedy SAI (phản ví dụ)
| Bài | Greedy tưởng đúng | Phản ví dụ |
|---|---|---|
| Đổi tiền, mệnh giá `{1, 3, 4}`, đổi `6` | luôn lấy tờ lớn nhất ≤ còn lại | greedy: 4+1+1 = **3 tờ**; tối ưu: 3+3 = **2 tờ** |
| Chọn nhiều khoảng không chồng nhau | luôn lấy khoảng **bắt đầu sớm nhất** | `[1,100], [2,3], [4,5]`: greedy lấy `[1,100]` → **1**; tối ưu `[2,3],[4,5]` → **2** |
| Chọn khoảng | luôn lấy khoảng **ngắn nhất** | `[1,6], [5,8], [7,12]`: lấy `[5,8]` (ngắn nhất) chặn cả hai còn lại → **1**; tối ưu `[1,6],[7,12]` → **2** |

Cách tìm phản ví dụ nhanh: viết một **brute force** (thử mọi tập con / DP) và so với greedy trên input ngẫu nhiên nhỏ — đúng như `checks.ts` của module này làm.

## 2. Khuôn bài khoảng

**Sắp xếp là bước đầu tiên.** Chọn khóa sắp theo mục tiêu:

| Mục tiêu | Sắp theo | Quét |
|---|---|---|
| Gộp khoảng chồng/chạm nhau | **đầu** tăng | giữ `[s, e]` hiện tại; khoảng kế có `start ≤ e` thì `e = max(e, end)` |
| Chọn nhiều khoảng rời nhau nhất / xóa ít nhất | **cuối** tăng | giữ nếu `start ≥ lastEnd` |
| Số mũi tên bắn hết bóng | **cuối** tăng | mũi tên tại `end` hiện tại; bóng có `start > arrow` cần mũi tên mới |
| Số phòng họp (I04) | đầu tăng + min-heap cuối | |
| Chèn vào danh sách đã sắp | không sort, quét một lượt O(n) | trước / chồng / sau |

**Chạm đầu mút:** `[1,2]` và `[2,3]` — chồng hay không? Phụ thuộc đề. Với xóa-chồng (ex03) thì **không chồng** (`start ≥ lastEnd`); với gộp (ex04) và bắn bóng (ex05) thì **gộp / dùng chung mũi tên**.

## 3. Các dạng greedy khác

**Bước nhảy (jump game).** Tập ô tới được luôn là một đoạn liền `[0, far]` ⇒ chỉ cần nhớ `far`. Số bước ít nhất = số "tầng BFS": giữ `end` của tầng hiện tại, `far` của tầng kế.

**Vòng tròn (gas station).** Tổng gas ≥ tổng cost thì có đáp án. Nếu từ `a` đi hỏng tại `b` thì mọi điểm xuất phát trong `(a, b]` cũng hỏng ⇒ nhảy luôn tới `b + 1`.

**Hai lượt (candy).** Hai ràng buộc độc lập (so với láng giềng trái, so với láng giềng phải): thỏa từng ràng buộc bằng lượng tối thiểu rồi lấy `max`.

**Last occurrence (partition labels).** Biết vị trí xuất hiện cuối của mỗi chữ cái; đoạn kết thúc khi `i` bằng điểm cuối xa nhất đã thấy.

**Greedy + heap.**
- *Tham dự nhiều sự kiện nhất (maxEvents):* mỗi ngày, trong các sự kiện đang mở chọn cái **hết hạn sớm nhất** (min-heap theo hạn).
- *Học nhiều khóa nhất (scheduleCourse):* duyệt theo hạn chót, cứ thêm vào lịch; nếu quá hạn thì **bỏ khóa dài nhất** (max-heap theo thời lượng).

## 4. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Sắp khoảng theo cuối | `a.sort((x, y) => x[1] - y[1])` — an toàn nếu |giá trị| < 2⁵³ | `sorted(a, key=lambda x: x[1])` | `Arrays.sort(a, (x, y) -> Integer.compare(x[1], y[1]))` |
| Min-heap | tự cài (I04) | `heapq` | `PriorityQueue<Integer>` |
| Max-heap | comparator ngược | đẩy `-x` | `Collections.reverseOrder()` |
| Số lớn | `number` an toàn tới 2⁵³ | không tràn | `long` cho tổng, `Integer.compare` cho so sánh |

**Bẫy Java:** comparator `(a, b) -> a[1] - b[1]` **tràn int** khi tọa độ tới ±2³¹ (test của ex05 có tọa độ `-2147483648`). Dùng `Integer.compare`. Tổng kẹo (ex08) có thể tới ~5·10⁹ → `long`.

## 5. Dấu hiệu nhận biết
"ít nhất / nhiều nhất" + "khoảng / lịch / hạn chót" · "có thể sắp xếp rồi quét một lượt" · "mỗi bước chọn cái tốt nhất rồi không hối tiếc" · input lớn (10⁵) nên DP O(n²) không qua.

## 6. Bẫy
1. Greedy không chứng minh được → thử brute force, tìm phản ví dụ trước khi tin.
2. Sắp **sai khóa** (đầu thay vì cuối) cho bài chọn khoảng.
3. Xử lý sai khoảng **chạm đầu mút** (`>` vs `>=`).
4. Comparator trừ nhau tràn `int` (Java) khi tọa độ lớn.
5. Lặp **từng ngày** tới 10⁹ (maxEvents): phải nhảy ngày khi heap rỗng.
6. Bỏ khóa **vừa thêm** thay vì khóa **dài nhất** (scheduleCourse).
7. Trạm xăng: mô phỏng từ mọi điểm xuất phát O(n²).
8. Tổng lớn (kẹo, gas) tràn `int` ở Java.

## 7. Độ phức tạp
Sort `O(n log n)` + quét `O(n)`; greedy + heap `O(n log n)`; bài jump / gas / partition / candy: `O(n)`.
