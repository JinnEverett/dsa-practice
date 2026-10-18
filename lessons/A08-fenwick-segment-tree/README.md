# A08 · Fenwick & Segment tree

## Sau buổi này bạn sẽ
- Dùng **Fenwick tree (BIT)** cho *cập nhật điểm + truy vấn prefix* trong O(log n).
- Dùng **segment tree** cho truy vấn đoạn với phép kết hợp bất kỳ (min, max, sum, gcd…), kể cả cập nhật điểm.
- **Đếm nghịch thế** và bài "đếm phần tử nhỏ hơn bên phải" bằng **nén tọa độ + BIT**.
- Biết **lazy propagation** là gì và khi nào đủ dùng 2 BIT cho "cộng đoạn + tổng đoạn".
- Chọn đúng công cụ: prefix sum / BIT / segment tree.

## 1. Chọn công cụ

| Cần | Cập nhật | Công cụ | Time |
|---|---|---|---|
| tổng đoạn | không đổi | **prefix sum** | build O(n), query O(1) |
| tổng đoạn | cập nhật điểm | **Fenwick** | O(log n) |
| min/max/gcd đoạn | cập nhật điểm | **segment tree** | O(log n) |
| tổng đoạn | cộng đoạn | 2 Fenwick hoặc segment tree lazy | O(log n) |
| đếm số phần tử `<` x đã thấy | thêm dần | Fenwick trên **tọa độ nén** | O(log n) |

Nếu dữ liệu **không đổi**, prefix sum luôn thắng. BIT/segment tree chỉ đáng khi có *cập nhật xen kẽ truy vấn*. Với `q` truy vấn trên mảng `n`: quét thô O(n·q) (10¹⁰ khi `n = q = 10⁵`) so với O(q log n) ≈ 1.7·10⁶.

## 2. Fenwick tree (BIT)

`tree[i]` (1-indexed) giữ tổng đoạn `(i − lowbit(i), i]`, với `lowbit(i) = i & -i`.
```
index:   1  2  3  4  5  6  7  8
lowbit:  1  2  1  4  1  2  1  8
tree[6] = a[5] + a[6]      tree[8] = a[1..8]
```
```ts
add(i: number, d: number) { for (; i <= n; i += i & -i) tree[i] += d; }       // lên "cha"
prefix(i: number)         { let s = 0; for (; i > 0; i -= i & -i) s += tree[i]; return s; }   // xuống
range(l, r)               { return prefix(r) - prefix(l - 1); }
```
Dựng O(n): `for i in 1..n: j = i + lowbit(i); if (j ≤ n) tree[j] += tree[i]`. Cập nhật điểm "đặt giá trị": `add(i, newVal − oldVal)` (nhớ mảng gốc).
**Bẫy:** BIT là **1-indexed** — chỉ số 0 làm vòng lặp treo.

## 3. Nén tọa độ (coordinate compression)

Giá trị tới 10⁹ nhưng chỉ có `n` giá trị khác nhau ⇒ sort + loại trùng, thay giá trị bằng **thứ hạng** (`lower_bound` bằng binary search). BIT chỉ cần kích thước `n`.
```
nums = [5, 2, 6, 1]  →  sorted unique [1, 2, 5, 6]  →  rank: 5→3, 2→2, 6→4, 1→1
```
**Đếm nghịch thế / "bao nhiêu phần tử nhỏ hơn x đứng bên phải":** duyệt từ phải sang trái, `count = prefix(rank(x) − 1)`, rồi `add(rank(x), 1)`.

Khuôn "đếm cặp `(i < j)` thỏa điều kiện trên giá trị": duyệt `j`, hỏi BIT các `i` đã thêm thỏa điều kiện, rồi thêm `j`. `countRangeSum` dùng tổng prefix làm "giá trị"; `reversePairs` hỏi `nums[i] > 2·nums[j]`.

## 4. Segment tree

Cây nhị phân mà mỗi node giữ kết quả (`min`, `sum`...) của một đoạn. Dạng **iterative bottom-up** (mảng `2n`, lá ở `[n, 2n)`):
```ts
// build: t[n + i] = a[i]; for (i = n - 1; i >= 1; i--) t[i] = min(t[2i], t[2i + 1])
update(p, v) { for (t[p += n] = v; p > 1; p >>= 1) t[p >> 1] = Math.min(t[p], t[p ^ 1]); }
query(l, r) {            // [l, r] đóng
  let res = Infinity;
  for (l += n, r += n + 1; l < r; l >>= 1, r >>= 1) {
    if (l & 1) res = Math.min(res, t[l++]);
    if (r & 1) res = Math.min(res, t[--r]);
  }
  return res;
}
```
Dạng này đúng cho phép kết hợp **giao hoán** (min, max, sum). Phép không giao hoán (nối chuỗi, nhân ma trận) cần giữ trái/phải riêng.

## 5. Lazy propagation (khái niệm)

"Cộng `v` cho cả đoạn" mà cập nhật từng phần tử là O(n). **Lazy:** node phủ trọn đoạn cập nhật thì chỉ ghi `lazy[node] += v` và cập nhật `agg[node]` một lần; khi cần đi xuống con mới **đẩy (push down)** lazy cho hai con. Mỗi thao tác O(log n).
```
add(node, [lo,hi], [l,r], v):
  nếu [lo,hi] ⊆ [l,r]: sum[node] += v·(hi−lo+1); lazy[node] += v; return
  push(node); recurse hai con; sum[node] = sum[trái] + sum[phải]
```
Với *cộng đoạn + tổng đoạn* còn có cách gọn hơn: **hai BIT** (`B1`, `B2`) — xem `RangeAddSum` ở lời giải. Với *max/min + cộng đoạn* có thể bỏ push-down bằng kỹ thuật "tag vĩnh viễn" (xem `MyCalendarThree`).

**Segment tree động:** tọa độ lên tới 10⁹ nhưng chỉ tạo node khi cần (con trái/phải cấp phát lười) — dùng cho API *online* (không biết trước các tọa độ).

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Mảng BIT | `Float64Array`/`Int32Array` | `list` | `long[]` |
| Tổng lớn | double chính xác tới 2⁵³ ≈ 9·10¹⁵ | vô hạn | **`long`**: `int` tràn khi tổng > 2³¹ |
| Nén tọa độ | `sort` + binary search | `bisect_left` | `Arrays.sort` + `Arrays.binarySearch` (trên mảng đã loại trùng) |
| Số cặp tối đa `n(n−1)/2` | 5·10⁹ ok | ok | **`long`** (vượt `int`) |
| `2 * x` với `x` tới 2³¹ | ok | ok | **`2L * x`** (tràn `int`) |

## 7. Bẫy
1. BIT 0-indexed ⇒ vòng lặp vô hạn / sai.
2. Cập nhật điểm kiểu "đặt giá trị" nhưng cộng thẳng `val` thay vì `val − old`.
3. Quên nén tọa độ (giá trị âm / 10⁹ làm chỉ số).
4. Đếm cặp: truy vấn *trước* khi thêm phần tử hiện tại (nếu không đếm cả chính nó).
5. Java: `int` cho tổng prefix, số cặp, hoặc `2 * nums[j]`.
6. Segment tree bottom-up với phép không giao hoán.
7. Lazy: quên push-down trước khi đi xuống con ⇒ tag cũ thất lạc.

## 8. Độ phức tạp
BIT/segment tree: build O(n), mỗi thao tác O(log n), bộ nhớ O(n). Đếm nghịch thế: O(n log n). Segment tree động: O(log C) mỗi thao tác, node tạo thêm O(log C) mỗi thao tác (C = miền tọa độ).
