# I13 · Bit manipulation

## Sau buổi này bạn sẽ
- Đọc/viết số ở dạng nhị phân và **bù hai (two's complement)**; dùng `& | ^ ~ << >> >>>`.
- Biết **bẫy của JS**: toán tử bit ép về **int32 có dấu**; khi nào cần `>>> 0`, khi nào chuyển sang `BigInt` hoặc tách nửa 32 bit.
- Dùng các mẹo `x & (x − 1)`, `x & −x`, XOR triệt tiêu, **mặt nạ (bitmask)** để duyệt tập con.

## 1. Biểu diễn nhị phân và bù hai

Số nguyên 32 bit có dấu: bit 31 là bit dấu. Giá trị âm `−x` = **đảo mọi bit của x rồi cộng 1**.

```
  5  = 0000 0000 0000 0000 0000 0000 0000 0101
 ~5  = 1111 1111 1111 1111 1111 1111 1111 1010   = −6        (~x = −x − 1)
 -5  = 1111 1111 1111 1111 1111 1111 1111 1011   (= ~5 + 1)
```

| Toán tử | Ý nghĩa | Ví dụ |
|---|---|---|
| `a & b` | AND từng bit | `12 & 10 = 8` |
| `a \| b` | OR | `12 \| 10 = 14` |
| `a ^ b` | XOR (khác nhau → 1) | `12 ^ 10 = 6` |
| `~a` | NOT mọi bit | `~5 = −6` |
| `a << k` | dịch trái k bit (×2ᵏ) | `3 << 2 = 12` |
| `a >> k` | dịch phải **có dấu** (giữ bit dấu) | `−8 >> 1 = −4` |
| `a >>> k` | dịch phải **không dấu** (điền 0) | `−1 >>> 28 = 15` |

## 2. Bẫy int32 của JavaScript (đã đo bằng Node)

Mọi toán tử bit của JS: (1) ép hai vế về **int32 có dấu** (lấy 32 bit thấp), (2) tính, (3) trả int32 có dấu — **trừ** `>>>` trả số không dấu.

```js
1 << 31              // −2147483648   (bit dấu bật)
1 << 32              // 1             (đếm dịch lấy mod 32)
4294967295 >> 0      // −1            (2³² − 1 thành int32)
4294967295 >>> 0     // 4294967295    (`>>> 0` đưa về không dấu)
(2**32 + 1) & 1      // 1             (chỉ thấy 32 bit thấp)
(2**40 + 8) & (2**40 + 7)   // 0 !    → "2⁴⁰ + 8 là lũy thừa của 2" — SAI
```

Hệ quả:
- Số **≥ 2³¹** nhìn như số âm sau toán tử bit; kết quả có bit 31 cần `>>> 0` để đọc như số dương (đảo bit của `n = 1` phải ra `2147483648`, không phải `−2147483648`).
- Số **≥ 2³²** bị **cắt** 32 bit cao một cách im lặng. Tới 2⁵³ có thể tách hai nửa (`hi = Math.floor(n / 2**32)`, `lo = n − hi * 2**32`) hoặc dùng `BigInt` (`BigInt(n) & (BigInt(n) - 1n)`).
- Dịch trái số lớn dễ tràn dấu: `x << 1` khi bit 30 bật thành âm.

| | TypeScript / JS | Python | Java |
|---|---|---|---|
| Kiểu số nguyên | `number` (double); bit ops int32 | `int` **vô hạn bit** | `int` 32 bit, `long` 64 bit |
| Số âm trong bit ops | bù hai 32 bit | **bù hai vô hạn** (`-1 == ...111`) → muốn 32 bit phải mask `& 0xFFFFFFFF` | bù hai |
| Đếm bit 1 | tự cài (Kernighan) | `n.bit_count()` (3.10+) | `Integer.bitCount`, `Long.bitCount` |
| Dịch phải không dấu | `>>>` (int32) | không có (dùng mask) | `>>>` (`int`/`long`) |
| Số rất lớn | `BigInt` (`1n << 64n`) | `int` thường | `BigInteger` / `long` |

Python: `~5 = −6` đúng, nhưng muốn "đảo 32 bit" của `n` phải `(~n) & 0xFFFFFFFF`. Muốn đổi số 32 bit không dấu ra có dấu: `x - (1 << 32) if x >= (1 << 31) else x`.

## 3. Các mẹo cần thuộc

| Mẹo | Tác dụng |
|---|---|
| `x & (x − 1)` | xóa bit 1 **thấp nhất** (đếm bit 1: lặp tới khi x = 0; lũy thừa 2 ⇔ kết quả = 0 với x > 0) |
| `x & −x` | giữ **chỉ** bit 1 thấp nhất (lowbit) |
| `x ^ x = 0`, `x ^ 0 = x` | XOR triệt tiêu cặp ⇒ tìm số lẻ lần |
| `(x >> i) & 1` | đọc bit thứ i |
| `x \| (1 << i)`, `x & ~(1 << i)`, `x ^ (1 << i)` | bật / tắt / lật bit i |
| `a & b == b` | b là tập con của a (khi coi số là tập) |

**Duyệt mọi tập con bằng mặt nạ.** Với tập `m ≤ ~20` phần tử, `for (s = 0; s < 1 << m; s++)` duyệt 2ᵐ tập con; bit i của `s` cho biết phần tử i có được chọn. OR/tổng của `s` có thể tính từ tập con nhỏ hơn: `orOf[s] = orOf[s & (s−1)] | item[ctz(s)]` — O(1) mỗi tập thay vì O(m).

**XOR đếm theo modulo.** Số xuất hiện 1 lần trong khi mọi số khác xuất hiện k lần: đếm từng bit theo modulo k (k = 3 dùng `ones`, `twos` hai biến). Hai số xuất hiện 1 lần: XOR toàn bộ được `a ^ b`; lấy một bit 1 của nó để **chia mảng thành hai nhóm** mỗi nhóm chứa đúng một số cần tìm.

**AND của cả khoảng `[l, r]`**: là **tiền tố chung** của `l` và `r` (bit cao), các bit thấp bằng 0. Dịch phải cả hai tới khi bằng nhau rồi dịch trái lại.

## 4. Dấu hiệu nhận biết
"xuất hiện lẻ lần / một lần, các số khác k lần", "đếm bit 1", "lũy thừa của 2", "đảo bit", "tập con của tập ≤ 20 phần tử" (bitmask), "OR/AND/XOR tối đa/tối thiểu", ràng buộc `n ≤ 20` hoặc `n ≤ 15` có tập con, "flag" / "quyền" / "cờ".

## 5. Bẫy
1. `n >> 1` trên số ≥ 2³¹: giá trị âm ⇒ vòng `while (n > 0)` sai; dùng `>>>` hoặc `n | 0` rồi Kernighan.
2. Quên `>>> 0` sau khi ghép 32 bit ⇒ kết quả âm (đảo bit, hammingWeight dùng đúng).
3. `n & (n − 1)` cho `n ≥ 2³²` — **im lặng sai** (chỉ thấy 32 bit thấp). Đến 2⁵³ phải tách nửa hoặc `BigInt`.
4. Độ ưu tiên toán tử: `a & b == 0` là `a & (b == 0)`; luôn đóng ngoặc `(a & b) === 0`.
5. `1 << 31` âm; `1 << 32 === 1` (mod 32). Muốn `2³²` dùng `2 ** 32`.
6. Java: `1 << 40` là `1 << (40 % 32)`; dùng `1L << 40`. `x & -x` với `x = Integer.MIN_VALUE` vẫn đúng (`−MIN = MIN`), nhưng `Math.abs(MIN)` âm.
7. Python: `~x` và số âm có vô hạn bit 1 — luôn mask khi cần 32 bit; đổi lại sang có dấu khi ghép bit.
8. Bitmask: tập con của tập > 25–30 phần tử bùng nổ (2ⁿ); `1 << n` cần n ≤ 30 trong int32.

## 6. Độ phức tạp
Phần lớn bài: O(n) hoặc O(32) / O(31·n); duyệt tập con: O(2ᵐ) (m ≤ ~20). Mọi phép bit là O(1) trên số 32 bit.
