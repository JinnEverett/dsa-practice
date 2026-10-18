# A12 · Amortized & randomized

## Sau buổi này bạn sẽ
- Phân tích **amortized**: vì sao `push` vào dynamic array "O(1)" dù thỉnh thoảng sao chép O(n); queue bằng 2 stack; DSU.
- **Quickselect** (3-way partition, pivot ngẫu nhiên): phần tử thứ k trong O(n) kỳ vọng.
- **Ngẫu nhiên có kiểm soát:** Fisher–Yates, reservoir sampling, `RandomizedSet` O(1), skip list.
- Hiểu **Las Vegas vs Monte Carlo** và làm sao *test* code ngẫu nhiên (tách "đúng" khỏi "ngẫu nhiên", đặc tả RNG để tất định).

## 1. Amortized — chi phí trung bình trên *chuỗi* thao tác

Không phải trung bình trên input ngẫu nhiên: là **tổng chi phí của n thao tác liên tiếp (trường hợp xấu nhất) chia cho n**.

**Dynamic array (gấp đôi khi đầy):** push thứ `1, 2, 3, 5, 9, …` kích hoạt sao chép `1, 2, 4, 8, …` phần tử. Sao chép tổng ≤ `1 + 2 + 4 + … + n < 2n` ⇒ n lần push tốn `O(n)` ⇒ **O(1) amortized**.
```
push:   · · · [copy 1] · [copy 2] · · [copy 4] · · · · [copy 8] ...
        tổng copy cho n push ≤ 2n
```
Ba cách chứng minh: **aggregate** (cộng tổng như trên), **accounting** (mỗi push trả thêm 2 "xu" gửi cho phần tử để lần copy sau trả), **potential** (hàm thế Φ = 2·size − capacity).

**Co lại:** nếu co ngay khi `size < capacity/2` thì dãy push–pop quanh ngưỡng làm mỗi thao tác tốn O(n) (**thrashing**). Co khi `size ≤ capacity/4` (và co còn một nửa) giữ amortized O(1): sau mỗi lần resize, còn ≥ `capacity/4` thao tác nữa mới resize tiếp.

**Queue bằng 2 stack:** `in` nhận push; `out` phục vụ pop; `out` rỗng thì đổ cả `in` sang. Mỗi phần tử bị đổ tối đa một lần ⇒ O(1) amortized. **DSU** với path compression + union by size: amortized α(n) (gần như hằng số).

> Khác với *độ phức tạp kỳ vọng* (E[time] trên lựa chọn ngẫu nhiên của thuật toán) và *average-case* (trung bình trên phân phối input). Quickselect là kỳ vọng; dynamic array là amortized.

## 2. Quickselect

Tìm phần tử thứ k mà không sort hết: chọn pivot, **chia ba** `< pivot | = pivot | > pivot`, chỉ đệ quy (lặp) vào phần chứa vị trí k.
```ts
let lo = 0, hi = n - 1;                      // tìm chỉ số đích t
while (lo < hi) {
  const p = a[lo + Math.floor(Math.random() * (hi - lo + 1))];
  let lt = lo, i = lo, gt = hi;              // Dutch national flag
  while (i <= gt) {
    if (a[i] < p) swap(a, lt++, i++);
    else if (a[i] > p) swap(a, i, gt--);
    else i++;
  }
  if (t < lt) hi = lt - 1; else if (t > gt) lo = gt + 1; else return p;
}
return a[lo];
```
- Kỳ vọng `n + n/2 + n/4 + … = O(n)`; xấu nhất O(n²) (xác suất cực nhỏ với pivot ngẫu nhiên).
- **3-way** là bắt buộc khi có nhiều phần tử trùng: partition 2-way (Lomuto) trên mảng toàn giá trị bằng nhau là O(n²) *dù pivot ngẫu nhiên*.
- Pivot cố định (đầu/cuối) bị đánh bại bởi mảng đã sắp.
- Worst-case O(n) có (median-of-medians) nhưng hằng số lớn — ít dùng.

## 3. Ngẫu nhiên có kiểm soát

**Fisher–Yates** (xáo đều): `for i = n−1 … 1: j = random(0..i); swap(a[i], a[j])`. Cho mỗi hoán vị xác suất `1/n!`. Phiên bản "đổi a[i] với random(0..n−1)" cho `nⁿ` kết quả không chia đều cho `n!` ⇒ **thiên lệch**.

**Reservoir sampling (Algorithm R)** — chọn đều k phần tử từ luồng chưa biết độ dài, chỉ giữ k ô nhớ: giữ k phần tử đầu; với phần tử thứ `i` (0-based, `i ≥ k`) sinh `j ∈ [0, i]`, nếu `j < k` thì ghi đè `reservoir[j]`. Mỗi phần tử kết thúc trong reservoir với xác suất `k/n`.

**RandomizedSet O(1):** mảng `vals` + `Map<giá trị, chỉ số>`. `remove`: đổi phần tử cần xóa với phần tử cuối rồi `pop` (cập nhật chỉ số của phần tử bị chuyển). `getRandom`: `vals[random(len)]`.

**Skip list:** danh sách liên kết nhiều tầng; node được "thăng tầng" với xác suất `p` (thường 1/2). Kỳ vọng `O(log n)` tìm/chèn/xóa, cài đơn giản hơn cây cân bằng. Kết quả đúng **không phụ thuộc** vào random — chỉ thời gian.
```
L3: head ─────────────→ 9 ──────────────→ nil
L2: head ──────→ 4 ───→ 9 ───────→ 17 ──→ nil
L1: head → 2 → 4 → 6 → 9 → 12 → 17 → 21 → nil
```

## 4. Test code ngẫu nhiên

| Loại | Ví dụ | Cách test |
|---|---|---|
| Kết quả đúng nhưng thời gian ngẫu nhiên (Las Vegas) | quickselect, skip list | so với đáp án tất định (sort) |
| Kết quả hợp lệ nhiều dạng | wiggle sort, reorganize string, `getRandom` | **checker kiểm tra tính hợp lệ**, không so từng phần tử |
| Kết quả phụ thuộc RNG | reservoir sampling | **đặc tả RNG trong đề** (ở đây: Park–Miller) ⇒ tất định, so exact |
| Chất lượng phân phối | `getRandom`, shuffle | kiểm tra thống kê trên nhiều lần gọi (checker bài `RandomizedSet` bắt hàm luôn trả cùng giá trị) |

**Park–Miller (MINSTD):** `state = state · 48271 mod (2³¹ − 1)`. Tích `< 2⁴⁷` nên vẫn chính xác trong `Number` của JS (còn LCG phổ biến `· 1103515245` thì vượt `2⁵³`); Java dùng `long`.

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Random số nguyên `[0, m)` | `Math.floor(Math.random() * m)` | `random.randrange(m)` | `ThreadLocalRandom.current().nextInt(m)` |
| Xáo trộn | tự viết Fisher–Yates | `random.shuffle` | `Collections.shuffle` |
| Chọn mẫu sẵn có | — | `random.sample` | — |
| Mảng cấp phát tay (dynamic array) | `Int32Array` + `set` | `array`/list | `int[]` + `System.arraycopy` / `Arrays.copyOf` |
| Map có thứ tự (skip-list thay thế) | không có | `sortedcontainers` (ngoài stdlib) | `TreeMap` |
| Nhân mod 2³¹−1 | `a * b` đủ chính xác khi `a < 2³¹, b < 2¹⁶` | tự nhiên | `long` |

## 6. Bẫy
1. Quickselect 2-way trên dữ liệu trùng nhiều hoặc đã sắp ⇒ O(n²).
2. Dynamic array co lại quá sớm (`size < cap/2`) ⇒ thrashing.
3. `RandomizedSet.remove` quên cập nhật chỉ số của phần tử được chuyển; quên xử lý khi xóa chính phần tử cuối.
4. Shuffle "đổi với vị trí ngẫu nhiên bất kỳ" ⇒ không đều.
5. Reservoir: `j` sinh trong `[0, i]` (bao gồm `i`), không phải `[0, n)`.
6. Dùng `Math.random()` rồi mong test lặp lại — test ngẫu nhiên không tái lập; cố định seed hoặc đặc tả RNG.
7. Skip list: không có phần tử trùng ⇒ giả định sai (bài cho phép thêm nhiều lần cùng giá trị).

## 7. Độ phức tạp
Dynamic array: push/pop O(1) amortized, bộ nhớ ≤ 4× size · Quickselect: O(n) kỳ vọng · RandomizedSet: O(1) trung bình · Skip list: O(log n) kỳ vọng, O(n) bộ nhớ kỳ vọng · Reservoir: O(n) time, O(k) bộ nhớ.
