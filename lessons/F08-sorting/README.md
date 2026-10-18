# F08 · Sorting

## Sau buổi này bạn sẽ
- Tự cài **merge sort** và **quick sort**, giải thích được độ phức tạp và trường hợp xấu nhất.
- Biết khi nào **counting sort** đánh bại O(n log n).
- Viết comparator nhiều tiêu chí đúng ở cả TS/Python/Java, hiểu **tính ổn định (stable)**.
- Dùng sort như bước tiền xử lý để biến bài O(n²) thành O(n log n).

## 1. Bức tranh

| Thuật toán | Trung bình | Xấu nhất | Bộ nhớ | Stable | Ghi chú |
|---|---|---|---|---|---|
| Bubble / Selection / Insertion | O(n²) | O(n²) | O(1) | B, I: có | Insertion nhanh với mảng **gần sort** và n nhỏ (Timsort dùng nó cho đoạn ngắn) |
| Merge sort | O(n log n) | O(n log n) | O(n) | có | chia đôi → sort 2 nửa → trộn |
| Quick sort | O(n log n) | **O(n²)** | O(log n) | không | pivot xấu (mảng đã sort + pivot đầu) → O(n²); chọn pivot ngẫu nhiên |
| Heap sort | O(n log n) | O(n log n) | O(1) | không | I04 |
| Counting sort | O(n + k) | O(n + k) | O(k) | có | giá trị nguyên trong miền nhỏ [0, k) |
| Sort thư viện | O(n log n) | O(n log n) | O(n) | TS, Python, Java(object): có | Timsort / introsort |

Giới hạn dưới: sort bằng **so sánh** không thể tốt hơn O(n log n). Counting/radix sort "vượt" được vì không so sánh.

## 2. Merge sort

```
[5 2 4 7 1 3 2 6]
[5 2 4 7]      [1 3 2 6]          chia đôi: log₂ n tầng
[5 2] [4 7]    [1 3] [2 6]
[2 5] [4 7]    [1 3] [2 6]        trộn 2 mảng đã sort: O(n) mỗi tầng
[2 4 5 7]      [1 2 3 6]
[1 2 2 3 4 5 6 7]                 tổng O(n log n)
```
Trộn: hai con trỏ (F05), lấy phần tử nhỏ hơn; **bằng nhau thì lấy bên trái trước** → stable.
Bonus: lúc trộn, khi lấy phần tử từ nửa phải, mọi phần tử còn lại ở nửa trái đều lớn hơn nó → đếm được **số nghịch thế** miễn phí.

## 3. Quick sort (Lomuto, pivot ngẫu nhiên)

```
pivot = 4   [3 7 8 1 4]  → đổi pivot về cuối
i: biên "≤ pivot"
[3 | 7 8 1 4]   3 ≤ 4 → giữ
[3 1 | 8 7 4]   1 ≤ 4 → đổi với vị trí i
[3 1 4 | 7 8]   đặt pivot vào i → pivot đứng đúng chỗ; đệ quy 2 bên
```
Mảng nhiều giá trị trùng → nên chia 3 phần (< = >) như Dutch flag (F05) để không thoái hóa O(n²).

## 4. Counting sort
```
ages = [3, 1, 3, 0, 2]   miền 0..3
count = [1, 1, 1, 2]      → xuất 0, 1, 2, 3, 3
```

## 5. Comparator — chỗ hay sai nhất

| | TypeScript | Python | Java |
|---|---|---|---|
| Số tăng dần | `a.sort((x, y) => x - y)` — **mặc định so chuỗi!** | `a.sort()` | `Arrays.sort(a)` |
| Giảm dần | `(x, y) => y - x` | `sort(reverse=True)` | `Integer[]` + `Collections.reverseOrder()` hoặc sort rồi đảo |
| Nhiều tiêu chí | `(a, b) => b.score - a.score \|\| a.name.localeCompare(b.name)` | `key=lambda p: (-p.score, p.name)` | `Comparator.comparingInt(P::score).reversed().thenComparing(P::name)` |
| Stable | có (ES2019+) | có | `Arrays.sort(Object[])` có; `int[]` không áp dụng |

Comparator phải **nhất quán**: trả số âm/0/dương, và `cmp(a, b) = −cmp(b, a)`. Đừng trả `true/false`.
Java: `(a, b) -> a - b` **tràn** khi a, b lớn trái dấu → dùng `Integer.compare(a, b)`.

## 6. Sort như tiền xử lý
Sau khi sort: phần tử trùng nằm cạnh nhau; dùng được two pointers / binary search; khoảng (interval) chồng nhau nằm liền nhau; greedy theo thứ tự.

## 7. Dấu hiệu nhận biết
"Sắp xếp theo…", "xếp hạng", "gộp khoảng", "cặp gần nhau nhất", "k lớn nhất" (n log n là đủ?), đề cho phép sửa thứ tự input.

## 8. Bẫy
1. TS `arr.sort()` không comparator → so chuỗi: `[10, 9, 1]` → `[1, 10, 9]`.
2. TS/Python `sort()` sửa mảng gốc; cần giữ input → copy trước (`slice()`, `sorted()`, `clone()`).
3. Java comparator `a - b` tràn số.
4. Quick sort pivot cố định trên dữ liệu đã sort → O(n²) + stack overflow vì đệ quy sâu n.
5. Merge sort tạo mảng con mới ở mỗi lần gọi (`slice`) → vẫn O(n log n) nhưng hằng số lớn; dùng 1 mảng tạm dùng chung.
