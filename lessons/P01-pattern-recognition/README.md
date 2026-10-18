# P01 · Pattern recognition

## Sau buổi này bạn sẽ
- Từ **ràng buộc + từ khóa** của đề đoán ngay nhóm giải thuật và độ phức tạp mục tiêu, **trước khi** nghĩ tới code.
- Phân biệt các cặp dễ nhầm: sliding window vs prefix sum, BFS vs Dijkstra, DP vs greedy, heap vs sort.
- Có thói quen mở đầu phỏng vấn: *đọc ràng buộc → loại phương án quá chậm → chọn pattern*.

Module này **không có code**: 20 đề ngắn, bạn chỉ ghi *pattern* và *Big-O* (và 1 dòng lý do). Mục tiêu là phản xạ.

## 1. Bước 1: đọc ràng buộc `n`

| n | Độ phức tạp chấp nhận được | Gợi ý |
|---|---|---|
| ≤ 10 | O(n!), O(n·2ⁿ) | backtracking, thử mọi hoán vị |
| ≤ 20 | O(2ⁿ·n) | bitmask, tập con |
| ≤ 500 | O(n³) | DP 3 chiều, Floyd |
| ≤ 5 000 | O(n²) | DP 2 chiều, hai vòng lặp |
| ≤ 10⁶ | O(n log n) | sort, heap, binary search, segment tree |
| > 10⁶ | O(n), O(log n) | hash map, two pointers, prefix sum |

## 2. Bước 2: từ khóa → pattern

| Từ khóa trong đề | Pattern nghĩ tới đầu tiên |
|---|---|
| "tìm cặp/ba có tổng…", "đã thấy chưa", "đếm tần suất" | hash map / set |
| mảng **đã sắp**, "hai đầu", palindrome | two pointers |
| "mảng con / chuỗi con **liên tiếp** dài nhất/ngắn nhất thỏa điều kiện" | sliding window (nếu điều kiện đơn điệu) |
| "tổng mảng con", "số mảng con có tổng = k" (có số âm) | prefix sum + hash map |
| "đã sắp", "tìm vị trí", **"nhỏ nhất/lớn nhất sao cho khả thi"** | binary search (trên chỉ số hoặc trên đáp án) |
| "khoảng", "lịch", "chồng nhau" | sort + quét (sweep), đôi khi heap |
| "k lớn nhất / k gần nhất / luôn lấy cái nhỏ nhất", stream | heap |
| "phần tử lớn hơn kế tiếp", "span", "histogram" | monotonic stack |
| "đường ngắn nhất" + cạnh **không trọng số**, lưới, "ít bước nhất" | BFS |
| "đường ngắn nhất" + trọng số ≥ 0 | Dijkstra |
| "thành phần liên thông", "đảo", flood fill | DFS / BFS / Union-Find |
| "thứ tự, điều kiện tiên quyết", "có chu trình không" | topological sort |
| "gộp nhóm, hỏi hai phần tử cùng nhóm không" (kết nối tăng dần) | Union-Find |
| "mọi cách / mọi tập con / mọi hoán vị" với n nhỏ | backtracking |
| "số cách", "tối ưu" + bài toán con trùng lặp | DP (1D/2D/knapsack/LCS…) |
| "tiền tố chung", "từ điển", autocomplete | trie |
| "xuất hiện đúng một lần, còn lại hai lần" | XOR / bit |
| "cập nhật điểm + truy vấn đoạn" xen kẽ | Fenwick / segment tree |

## 3. Bước 3: kiểm tra chéo
Sau khi chọn pattern, tự hỏi: *Big-O có khớp ràng buộc `n` không? Điều kiện đơn điệu/không âm có thật sự đúng (sliding window cần; Dijkstra cần)?* Có phản ví dụ nhỏ nào cho greedy không?

## 4. Cách làm bài
1. Đọc đề, **bấm giờ 90 giây** mỗi đề.
2. Ghi vào `answers/p01.md` theo mẫu trong `exercises.md`: *pattern · Big-O thời gian/bộ nhớ · từ khóa nhận ra*.
3. Nộp cho coach (không có `check` tự động); coach đối chiếu `solutions.md` sau khi bạn nộp bản của mình.

**Pass:** đúng hướng ≥ 16/20 (pattern chính đúng *hoặc* một hướng thay thế được chấp nhận trong `solutions.md`; Big-O đúng bậc).

## 5. Bẫy thường gặp
1. Thấy "mảng con" là nghĩ sliding window: có số âm thì sai → prefix sum + hash map.
2. Thấy "đường ngắn nhất" là Dijkstra: cạnh không trọng số thì BFS đủ (và đơn giản hơn).
3. Thấy "tối ưu" là DP: kiểm tra greedy trước (và phản ví dụ nhỏ).
4. Thấy `n = 10⁵` mà chọn O(n²).
5. Quên chi phí sort khi nói "O(n)".
