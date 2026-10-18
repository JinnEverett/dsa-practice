# A11 · Sweep line

## Sau buổi này bạn sẽ
- Biến bài toán đoạn/khoảng thành **dãy sự kiện** (start/end) rồi quét theo thứ tự thời gian.
- Chọn đúng **thứ tự xử lý khi trùng thời điểm** (tie-break) cho khoảng đóng/nửa mở.
- Dùng **heap + lazy deletion** (skyline), **mảng đã sắp + binary search** (calendar), **nén tọa độ** (diện tích hợp hình chữ nhật).
- Nhận dạng khi nào dùng **difference array** thay vì sweep (tọa độ nhỏ vs tọa độ 10⁹).

## 1. Khuôn cơ bản

Mỗi khoảng `[s, e)` → hai sự kiện `(s, +1)` và `(e, −1)`. Sắp theo thời gian, duyệt, giữ biến đếm:
```ts
const ev: [number, number][] = [];
for (const [s, e] of intervals) ev.push([s, +1], [e, -1]);
ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);        // cùng thời điểm: −1 (kết thúc) trước +1 (bắt đầu)
let cur = 0, best = 0;
for (const [, d] of ev) best = Math.max(best, cur += d);
```
**Tie-break là chỗ sai phổ biến nhất.** Khoảng *nửa mở* `[s, e)`: kết thúc lúc `t` nhường chỗ cho bắt đầu lúc `t` ⇒ xử lý `−1` trước `+1`. Khoảng *đóng* `[s, e]`: ngược lại.

Cách ngắn gọn hơn không cần sự kiện: sort riêng mảng `starts` và `ends`, hai con trỏ — `starts[i] < ends[j]` thì có thêm một khoảng đang mở, ngược lại đóng một khoảng (dấu `<` chặt cho nửa mở).

## 2. Tọa độ nhỏ vs lớn

| Tọa độ | Công cụ |
|---|---|
| ≤ ~10⁶ | **difference array** `d[s]++, d[e]--` rồi prefix sum — O(miền) |
| tới 10⁹ | **sự kiện + sort** — O(n log n) |
| cần hỏi giữa chừng | cấu trúc có thứ tự (mảng sắp + binary search; map có thứ tự) |

## 3. Skyline: heap + lazy deletion

Tại mỗi hoành độ quan trọng `x`: thêm các tòa nhà bắt đầu ở `x` vào max-heap theo chiều cao; **pop đỉnh nếu nó đã kết thúc** (`right ≤ x`) — không cần xóa phần tử ở giữa heap (*lazy deletion*). Chiều cao hiện tại = đỉnh heap (hoặc 0). Thêm điểm `[x, h]` **chỉ khi h đổi** so với điểm trước.
```
buildings [2,9,10] [3,7,15] [5,12,12]
x=2 h=10 → x=3 h=15 → x=7 (15 hết) h=12 → x=12 h=0
```

## 4. Hợp các khoảng / thời gian rảnh chung

Gộp mọi khoảng bận của mọi người, sort theo `start`, giữ `maxEnd`; khi `start > maxEnd` ⇒ có khoảng rảnh `[maxEnd, start]`. Hai danh sách khoảng đã sắp: **two pointers** — luôn tiến con trỏ có `end` nhỏ hơn.

## 5. Calendar booking

- **Không double-booking:** giữ `starts[]`/`ends[]` đã sắp; chèn `[s, e)` hợp lệ khi khoảng liền trước có `end ≤ s` và khoảng liền sau có `start ≥ e`. Binary search O(log n) + chèn mảng (`splice`).
- **Tối đa k lần chồng:** giữ độ chồng theo từng đoạn (map sai phân hoặc segment tree, xem A08 ex08).

## 6. Diện tích hợp hình chữ nhật

Quét theo `x`: các cạnh dọc là sự kiện (`+1` khi mở hình, `−1` khi đóng) trên đoạn `[y1, y2)`. Giữa hai hoành độ liên tiếp `Δx`, phần `y` được phủ có độ dài `cover` ⇒ diện tích `cover · Δx`. **Nén tọa độ `y`**, giữ `count[y-slab]`, và `cover` = tổng độ dài các slab có `count > 0`. n = 200 ⇒ O(n²) đủ. Diện tích tới 10¹⁸ ⇒ **mod** `10⁹+7` và nhân mod an toàn (TS: `Number` mất chính xác từ 2⁵³; Java: `long` ổn vì `(10⁹+7)² < 2⁶³`).

## 7. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Sort sự kiện | `ev.sort((a, b) => a[0] - b[0] \|\| a[1] - b[1])` | `ev.sort()` (tuple) | `Arrays.sort(ev, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]))` |
| Sort số | `Int32Array.sort()` mặc định là số | `sorted()` | `Arrays.sort(int[])` |
| Heap | `Heap` tự cài (I04) | `heapq` (min-heap, đẩy `−h`) | `PriorityQueue` |
| Mảng chèn giữa | `splice` O(n) | `bisect.insort` | `ArrayList.add(i, x)` hoặc `TreeMap` |
| Map có thứ tự | không có → mảng sắp/segment tree | `sortedcontainers` không phải stdlib | `TreeMap` (`floorEntry`/`ceilingEntry`) |
| Nhân mod | cần tách bit | tự nhiên | `long` |

## 8. Bẫy
1. Tie-break sai (đóng/mở) ⇒ đếm nhầm chồng chéo ở biên.
2. `a[0] - b[0]` tràn `int` (Java) với tọa độ tới 10⁹ (âm/dương): dùng `Integer.compare`.
3. Skyline: thêm điểm trùng chiều cao liên tiếp; quên điểm kết thúc về `0`.
4. Khoảng rảnh: coi `[1,3]` và `[3,5]` là có khe (độ dài 0 không phải khoảng rảnh).
5. Dùng mảng đếm theo tọa độ 10⁹ (hết bộ nhớ) thay vì sự kiện.
6. Rectangle area: nhân `cover · Δx` vượt 2⁵³ trong TS.

## 9. Độ phức tạp
Sự kiện + sort: O(n log n) · Skyline: O(n log n) · Calendar (mảng sắp): O(log n) tìm + O(n) chèn, thực tế rất nhanh · Rectangle area: O(n²) với n hình.
