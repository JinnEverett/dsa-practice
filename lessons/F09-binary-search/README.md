# F09 · Binary search

## Sau buổi này bạn sẽ
- Viết binary search **không off-by-one** bằng một template duy nhất với bất biến rõ ràng.
- Tìm lower bound / upper bound (vị trí chèn, phần tử đầu/cuối bằng target, đếm trong khoảng).
- Áp dụng trên mảng xoay, ma trận, và trên **không gian đáp án** (căn bậc hai).
- Biết bẫy tràn số khi tính `mid`.

## 1. Ý tưởng
Mỗi bước loại **một nửa** không gian tìm kiếm → log₂(10⁹) ≈ 30 bước.

Điều kiện dùng: có một **vị từ đơn điệu** `ok(i)` trên chỉ số — dạng `F F F F T T T` — và ta tìm vị trí `T` đầu tiên.
- "Tìm vị trí đầu tiên có `nums[i] ≥ target`" → `ok(i) = nums[i] ≥ target` (mảng sort ⇒ đơn điệu).
- "x nhỏ nhất mà x² > n" → `ok(x) = x·x > n`.

## 2. Template duy nhất (nửa mở `[lo, hi)`)

```ts
// Trả về chỉ số NHỎ NHẤT i trong [lo, hi) mà ok(i) = true; nếu không có thì trả hi.
let lo = 0, hi = n;                 // hi là "ngoài vùng": có thể là đáp án "không tìm thấy"
while (lo < hi) {
  const mid = lo + ((hi - lo) >> 1);
  if (ok(mid)) hi = mid;            // mid có thể là đáp án → giữ mid
  else lo = mid + 1;                // mid chắc chắn không phải → bỏ
}
return lo;                          // lo === hi
```

```
nums = [1, 3, 3, 3, 5, 8]   target = 3
ok(i) = nums[i] ≥ 3:  F  T  T  T  T  T     → lower bound = 1
ok(i) = nums[i] > 3:  F  F  F  F  T  T     → upper bound = 4
số phần tử bằng 3 = upper − lower = 3
```

**Bất biến:** mọi i < lo có ok(i) = false; mọi i ≥ hi có ok(i) = true. Vòng lặp kết thúc khi lo = hi → đó là ranh giới.
Vì `mid < hi` luôn đúng, và mỗi nhánh thu hẹp khoảng ít nhất 1 → không lặp vô hạn.

| Cần | Vị từ `ok(i)` | Kết quả |
|---|---|---|
| lower bound (vị trí chèn) | `a[i] >= x` | `lo` |
| upper bound | `a[i] > x` | `lo` |
| có tồn tại x? | lower bound rồi kiểm tra `lo < n && a[lo] === x` | |
| phần tử cuối ≤ x | upper bound − 1 | |
| đếm phần tử trong [L, R] | `upper(R) − lower(L)` | |

## 3. Binary search trên đáp án
Không có mảng — tìm số nguyên nhỏ nhất thỏa điều kiện đơn điệu:
```
floor(sqrt(x)): tìm r lớn nhất với r² ≤ x  ⇔  (r nhỏ nhất với r² > x) − 1
lo = 0, hi = x + 1
```
Đây là nền tảng của A10 ("chia mảng sao cho tổng lớn nhất nhỏ nhất", "tốc độ ăn chuối nhỏ nhất"…).

## 4. Mảng xoay
`[4,5,6,7,0,1,2]` — sort rồi xoay. Ở mỗi bước, **ít nhất một nửa** `[lo, mid]` hoặc `[mid, hi]` là đã sort. Kiểm tra target có nằm trong nửa đã sort không để quyết định đi bên nào.
Tìm điểm xoay (phần tử nhỏ nhất): `ok(i) = nums[i] <= nums[n − 1]` là vị từ đơn điệu `F F F F T T T`.

## 5. Theo ngôn ngữ
| | TS | Python | Java |
|---|---|---|---|
| mid | `lo + ((hi - lo) >> 1)` | `(lo + hi) // 2` (int không tràn) | `lo + (hi - lo) / 2` hoặc `(lo + hi) >>> 1` |
| có sẵn | — | `bisect.bisect_left / bisect_right` | `Arrays.binarySearch` (trùng thì trả vị trí bất kỳ!), `Collections.binarySearch` |
| tràn | `>> 1` ép về int32: sai khi lo + hi ≥ 2³¹ | — | `(lo + hi) / 2` tràn khi > 2³¹ − 1 |
| `mid * mid` | an toàn tới 2⁵³ | an toàn | phải `(long) mid * mid` |

## 6. Bẫy
1. Trộn lẫn nhiều kiểu template (`lo <= hi` + `hi = mid − 1` với `lo < hi` + `hi = mid`) → lặp vô hạn hoặc bỏ sót.
2. `lo = mid` (không +1) trong template trên → lặp vô hạn khi `hi = lo + 1`.
3. Java `Arrays.binarySearch` với phần tử trùng không bảo đảm vị trí đầu tiên.
4. Quên kiểm tra mảng rỗng / kết quả `lo === n`.
5. Tràn số khi tính `mid` hoặc `mid * mid`.

## 7. Độ phức tạp
O(log n) mỗi lần tìm · O(1) bộ nhớ. q truy vấn trên mảng đã sort: O(n log n + q log n) thay vì O(n·q).
