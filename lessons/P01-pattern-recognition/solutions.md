# P01 · Đáp án (spoiler — chỉ mở sau khi nộp `answers/p01.md`)

Chấm "đúng hướng" khi pattern chính đúng **hoặc** thuộc phần *Hướng thay thế chấp nhận*, và Big-O cùng bậc.

| # | Pattern | Big-O | Từ khóa nhận ra | Hướng thay thế chấp nhận |
|---|---|---|---|---|
| 01 | **Hash map** đếm tần suất, mỗi phần tử tra `k − a[i]` | O(n) time, O(n) space | "cặp", "tổng = k", mảng không sắp, n = 10⁵ | sort + two pointers O(n log n) (cẩn thận đếm cặp trùng) |
| 02 | **Two pointers** từ hai đầu | O(n) time, O(1) space | "đã sắp", "O(1) bộ nhớ" | binary search cho từng phần tử O(n log n) (vẫn O(1) space) |
| 03 | **Sliding window** + set/map ký tự | O(n) time, O(Σ) space | "liên tiếp dài nhất", điều kiện "không trùng" | – |
| 04 | **Prefix sum + hash map** (đếm theo `prefix − k`) | O(n) time, O(n) space | "mảng con", "tổng = k", **có số âm** (sliding window sai) | – |
| 05 | **Binary search trên đáp án** (kiểm tra khả thi O(n)) | O(n log max a) | "nhỏ nhất `x` để kịp", tính đơn điệu theo `x` | – |
| 06 | **Sort theo đầu khoảng + quét** | O(n log n) | "khoảng", "chồng nhau", "gộp" | – |
| 07 | **Hash map đếm + heap kích thước k** | O(n log k) | "top k", stream, k nhỏ | đếm + `sort` O(m log m) (m = số từ khác nhau) chấp nhận khi m nhỏ; quickselect |
| 08 | **Monotonic stack** (stack chỉ số giảm dần) | O(n) | "ngày nóng hơn kế tiếp", phần tử lớn hơn kế tiếp | duyệt ngược + nhảy theo `next[]` |
| 09 | **BFS** trên lưới | O(R·C) | "số bước ít nhất", cạnh/bước đều 1 | – (Dijkstra đúng nhưng thừa) |
| 10 | **DFS/BFS** (hoặc Union-Find) đếm thành phần liên thông | O(R·C) | "vùng kề nhau", flood fill; DFS đệ quy sâu 10⁶ → dùng stack tường minh/BFS | Union-Find |
| 11 | **Topological sort** (Kahn / DFS), phát hiện chu trình | O(V + E) | "A trước B", "thứ tự hợp lệ", "báo không có" | – |
| 12 | **Union-Find** (path compression + union by size) | ≈ O(α(n)) mỗi thao tác | kết nối **tăng dần** + hỏi cùng nhóm; BFS/DFS lại mỗi query là O(q·(V+E)) | – |
| 13 | **Backtracking** (đếm ngoặc mở/đóng) | O(Catalan(n)·n) | "sinh mọi", n ≤ 8, ràng buộc cắt nhánh | – |
| 14 | **DP 1D** `f[i] = f[i−1] + f[i−2] + f[i−3]` | O(n) time, O(1) space | "số cách", bước 1/2/3, mod | ma trận lũy thừa O(log n) |
| 15 | **DP knapsack** (subset sum, tổng mục tiêu = tổng/2) | O(n·S), S = Σa/2 ≤ 10⁴ | "chia hai nhóm bằng nhau", giá trị nhỏ | bitset DP; DFS với memo |
| 16 | **DP 2D LCS** | O(n·m) time, O(min(n, m)) space tối ưu được | "dãy con chung" (không liên tiếp), n ≤ 2000 | – |
| 17 | **Trie** (có thể kèm cache top-3 ở node) | O(\|prefix\| + 3) mỗi truy vấn | "tiền tố", autocomplete, nhiều truy vấn | sort + binary search theo tiền tố nhưng chọn top-3 khó |
| 18 | **XOR** toàn mảng | O(n) time, O(1) space | "đúng hai lần trừ một", O(1) bộ nhớ | – |
| 19 | **Dijkstra** (heap) | O((V + E) log V) | trọng số ≥ 0, từ một nguồn | – (BFS sai vì trọng số) |
| 20 | **Fenwick tree** (hoặc segment tree) | O(log n) mỗi thao tác | "cập nhật điểm + truy vấn đoạn" xen kẽ; prefix sum thường là O(n) mỗi cập nhật | segment tree |

## Chấm điểm
- 16–20: tốt, sang P02.
- 12–15: ôn các hàng sai trong module tương ứng (cột "Từ khóa nhận ra" chính là nội dung cần ôn), làm lại các đề sai sau 2 ngày.
- < 12: quay về F/I tương ứng trước khi tiếp.

## Cặp dễ nhầm (ghi vào weaknesses nếu sai)
- **04 vs 03:** có số âm ⇒ cửa sổ không đơn điệu ⇒ prefix sum.
- **09 vs 19:** trọng số đều 1 ⇒ BFS; trọng số tùy ý ≥ 0 ⇒ Dijkstra.
- **12 vs 10:** kết nối tăng dần + hỏi liên tục ⇒ Union-Find; một đồ thị tĩnh ⇒ DFS/BFS một lần.
- **15 vs 14:** cả hai là DP, nhưng 15 là bài chọn tập (knapsack), 14 là đếm đường đi.
- **20 vs prefix sum:** prefix sum chỉ khi mảng *không đổi*.
