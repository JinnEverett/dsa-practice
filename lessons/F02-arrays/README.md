# F02 · Array & ma trận

## Sau buổi này bạn sẽ
- Hiểu mảng trong JS hoạt động thế nào (dynamic array) và thao tác nào đắt.
- Thao tác chỉ số tự tin: đảo, xoay, duyệt ngược, duyệt theo đường chéo.
- Tạo và duyệt ma trận 2D không dính bẫy tham chiếu.
- Sửa mảng **tại chỗ** (in-place) với O(1) bộ nhớ phụ.

## 1. Mảng trong JS

```
index:   0    1    2    3    4   (capacity 8)
       ┌────┬────┬────┬────┬────┬────┬────┬────┐
       │ 10 │ 20 │ 30 │ 40 │ 50 │    │    │    │
       └────┴────┴────┴────┴────┴────┴────┴────┘
         ↑ a[i] = địa chỉ đầu + i × kích thước → O(1)
```

- `push/pop` ở **cuối**: O(1) amortized (hết chỗ thì cấp vùng mới lớn hơn và copy).
- `shift/unshift/splice` ở **đầu/giữa**: O(n) vì phải dịch mọi phần tử phía sau.
- V8 tối ưu mảng "packed" (không lỗ, cùng kiểu số). `new Array(n)` tạo mảng **holey** (có lỗ) → chậm hơn một chút; nên `new Array(n).fill(0)` hoặc `Array.from({ length: n }, ...)`.

## 2. Kỹ thuật chỉ số

| Việc | Công thức |
|---|---|
| Phần tử cuối | `a[a.length - 1]` hoặc `a.at(-1)` |
| Đối xứng của i | `n - 1 - i` |
| Xoay phải k bước | phần tử i đến vị trí `(i + k) % n` |
| Ô (r, c) trong ma trận phẳng `cols` cột | `r * cols + c`; ngược lại `r = Math.floor(i / cols)`, `c = i % cols` |
| Đường chéo chính / phụ | `r - c` không đổi / `r + c` không đổi |

**Mẹo đảo 3 lần** — xoay phải k bước tại chỗ, O(1) bộ nhớ:
```
[1 2 3 4 5 6 7], k = 3
đảo toàn bộ   → [7 6 5 4 3 2 1]
đảo 0..k-1    → [5 6 7 | 4 3 2 1]
đảo k..n-1    → [5 6 7 | 1 2 3 4]   ✅
```

## 3. Ma trận 2D

```ts
// ❌ cả 3 hàng là CÙNG MỘT mảng: sửa grid[0][0] thì grid[1][0], grid[2][0] cũng đổi
const bad = new Array(3).fill(new Array(4).fill(0));

// ✅ mỗi hàng một mảng riêng
const grid = Array.from({ length: 3 }, () => new Array(4).fill(0));
const rows = grid.length, cols = grid[0].length;
```

**4 hướng** (dùng lại suốt phần đồ thị):
```ts
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // phải, xuống, trái, lên
for (const [dr, dc] of DIRS) {
  const nr = r + dr, nc = c + dc;
  if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue; // ra ngoài biên
}
```

**Xoay 90° theo chiều kim đồng hồ** = transpose (đổi `[r][c]` ↔ `[c][r]`) rồi đảo từng hàng.
```
1 2 3      1 4 7      7 4 1
4 5 6  →   2 5 8  →   8 5 2
7 8 9      3 6 9      9 6 3
         transpose   đảo hàng
```

**Duyệt xoắn ốc**: giữ 4 biên `top, bottom, left, right`, đi hết một cạnh thì co biên đó lại.

## 4. In-place và "dùng chính mảng làm bộ nhớ"
Khi đề yêu cầu O(1) bộ nhớ phụ, mẹo hay dùng:
- Hai con trỏ đổi chỗ (đảo mảng).
- **Đánh dấu bằng dấu âm**: giá trị trong `[1, n]` → dùng `a[v - 1]` làm "cờ" bằng cách đổi dấu.
- Dùng hàng/cột đầu tiên của ma trận để lưu cờ cho các hàng/cột còn lại.

## 5. Bẫy
1. `Array(n).fill([])` / `fill(new Array(m))` — các hàng dùng chung tham chiếu.
2. `k` lớn hơn `n` khi xoay: phải lấy `k % n`; `n = 0` thì `% 0` ra `NaN`.
3. Lặp `for...in` trên mảng trả **chuỗi** chỉ số `'0', '1'` → dùng `for...of` hoặc `for (let i…)`.
4. Ma trận rỗng `[]` hoặc `[[]]` — `matrix[0].length` sẽ lỗi với `[]`.
5. Sửa mảng đang duyệt bằng `splice` → bỏ sót phần tử.

## 6. Theo ngôn ngữ

| Việc | TypeScript | Python | Java |
|---|---|---|---|
| Mảng động | `number[]` | `list` | `ArrayList<Integer>` (mảng cố định: `int[]`) |
| Tạo ma trận r × c | `Array.from({length: r}, () => new Array(c).fill(0))` | `[[0] * c for _ in range(r)]` | `new int[r][c]` (mặc định 0) |
| Bẫy tạo ma trận | `Array(r).fill(Array(c))` | `[[0] * c] * r` | — |
| Đảo đoạn | tự viết 2 con trỏ | `a[i:j] = a[i:j][::-1]` (tạo bản sao) | tự viết 2 con trỏ |
| Phần tử cuối | `a.at(-1)` | `a[-1]` | `a[a.length - 1]` |
| Số dư âm | `-1 % 3 === -1` | `-1 % 3 == 2` | `-1 % 3 == -1` |

## 7. Độ phức tạp

| Thao tác | Time |
|---|---|
| đọc/ghi `a[i]` | O(1) |
| `push`, `pop` | O(1) amortized |
| `shift`, `unshift`, `splice`, `includes`, `indexOf`, `slice` | O(n) |
| duyệt ma trận r × c | O(r·c) |
