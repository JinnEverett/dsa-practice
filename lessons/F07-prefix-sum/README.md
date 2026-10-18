# F07 · Prefix sum & difference array

## Sau buổi này bạn sẽ
- Trả lời "tổng đoạn [l, r]" trong O(1) sau O(n) tiền xử lý.
- Dùng **prefix sum + hash map** để đếm đoạn con có tổng = k (kể cả có số âm — chỗ sliding window bó tay).
- Dùng prefix sum 2D cho ma trận.
- Dùng **difference array** để cộng một giá trị cho cả đoạn trong O(1).

## 1. Prefix sum 1D

```
index:     0   1   2   3   4
nums  :    3   1   4   1   5
prefix: 0  3   4   8   9  14        prefix[i] = tổng nums[0..i)   (độ dài n + 1, prefix[0] = 0)

sum(l..r) = prefix[r + 1] − prefix[l]
sum(1..3) = prefix[4] − prefix[1] = 9 − 3 = 6   (1 + 4 + 1)
```

Dùng mảng dài **n + 1** với `prefix[0] = 0` để công thức không có trường hợp đặc biệt cho `l = 0`.

## 2. Prefix sum + hash map: đếm đoạn có tổng = k

Đoạn `(j, i]` có tổng k ⇔ `prefix[i] − prefix[j] = k` ⇔ `prefix[j] = prefix[i] − k`.
→ Duyệt i, hỏi "đã có bao nhiêu prefix trước đó bằng `prefix[i] − k`?" — chính là khuôn **tra phần bù** của F04.

```ts
const seen = new Map<number, number>([[0, 1]]);   // prefix rỗng = 0 xuất hiện 1 lần
let sum = 0, count = 0;
for (const x of nums) {
  sum += x;
  count += seen.get(sum - k) ?? 0;
  seen.set(sum, (seen.get(sum) ?? 0) + 1);
}
```

Biến thể: thay "tổng = k" bằng "tổng chia hết cho k" (lưu `sum mod k`), "số 0 bằng số 1" (đổi 0 → −1, tìm tổng 0), "đoạn **dài nhất**" (lưu chỉ số **đầu tiên** của mỗi prefix thay vì số lần).

## 3. Prefix sum 2D

```
P[i][j] = tổng hình chữ nhật từ (0,0) đến (i−1, j−1)
P[i][j] = M[i−1][j−1] + P[i−1][j] + P[i][j−1] − P[i−1][j−1]

tổng (r1,c1)..(r2,c2) = P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]
         ┌─────────┬────┐
         │    A    │ B  │      cần = toàn bộ − (A+B) − (A+C) + A
         ├─────────┼────┤
         │    C    │cần │
         └─────────┴────┘
```

## 4. Difference array: cộng cả đoạn trong O(1)

Muốn "cộng v cho mọi phần tử trong [l, r]" nhiều lần, rồi mới cần mảng kết quả:
```
diff[l] += v;  diff[r + 1] −= v;          // O(1) mỗi lần cập nhật
kết quả = prefix sum của diff               // O(n) một lần ở cuối

cộng 5 cho [1,3] trên mảng 6 phần tử:
diff  : 0  5  0  0 −5  0
result: 0  5  5  5  0  0
```
Ứng dụng: đặt chỗ theo khoảng, số người online theo thời gian, tô màu đoạn.

## 5. Theo ngôn ngữ
| | TS | Python | Java |
|---|---|---|---|
| prefix có sẵn | — | `itertools.accumulate(nums, initial=0)` | `Arrays.parallelPrefix` (không có phần tử 0 đầu) |
| tràn số | > 2⁵³ hiếm gặp | không tràn | tổng 10⁵ × 10⁹ cần `long` |
| số dư âm | `((x % k) + k) % k` | `x % k` đã không âm | `Math.floorMod(x, k)` |

## 6. Dấu hiệu nhận biết
"Tổng đoạn" nhiều lần · "đếm số đoạn con có tổng/đặc tính…" kèm **số âm** · "cộng v cho mọi phần tử từ l đến r" nhiều lần · ma trận + tổng hình chữ nhật.

## 7. Bẫy
1. Quên `seen.set(0, 1)` → mất các đoạn bắt đầu từ chỉ số 0.
2. Cập nhật `seen` **trước** khi tra → đếm đoạn rỗng khi k = 0.
3. Difference array: mảng `diff` dài n + 1 để `r + 1` không vượt biên.
4. Prefix 2D: nhầm chỉ số +1 → vẽ hình trước khi code.
5. Tràn số Java (tổng nhiều phần tử lớn).

## 8. Độ phức tạp

| Việc | Tiền xử lý | Mỗi truy vấn / cập nhật |
|---|---|---|
| tổng đoạn 1D | O(n) | O(1) |
| tổng hình chữ nhật 2D | O(r·c) | O(1) |
| cộng đoạn (difference) | — | O(1), dựng kết quả O(n) |
| đếm đoạn tổng = k | O(n) time, O(n) space | — |

Khi mảng **thay đổi** xen kẽ với truy vấn tổng → prefix sum phải dựng lại O(n) mỗi lần cập nhật; cần Fenwick/Segment tree (A08).
