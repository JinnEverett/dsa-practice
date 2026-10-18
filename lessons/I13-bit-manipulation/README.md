# I13 · Bit manipulation

## Sau buổi này bạn sẽ
- Đọc/viết số nguyên dưới dạng nhị phân, hiểu **bù hai** (số âm) và 6 toán tử `& | ^ ~ << >>` (+ `>>>`).
- Dùng các mẹo `x & (x − 1)`, `x & −x`, XOR "triệt tiêu", **bitmask** để duyệt tập con.
- Tránh các bẫy kiểu số: **TS ép về int32 có dấu**, Python int vô hạn, Java `int` vs `long`.

## 1. Biểu diễn nhị phân và bù hai

Số nguyên 32-bit có dấu (int32), bù hai: bit 31 là bit dấu, `−x = ~x + 1`.

```
 5  = 0000 0000 ... 0000 0101
~5  = 1111 1111 ... 1111 1010   (= −6)
−5  = ~5 + 1 = 1111 ... 1011
-1  = 1111 1111 ... 1111        (toàn bit 1)
```

| Toán tử | Ý nghĩa | Ví dụ |
|---|---|---|
| `a & b` | AND: bit 1 khi cả hai là 1 | `6 & 3 = 2` |
| `a \| b` | OR | `6 \| 3 = 7` |
| `a ^ b` | XOR: bit 1 khi khác nhau | `6 ^ 3 = 5` |
| `~a` | đảo mọi bit | `~5 = −6` |
| `a << k` | nhân `2^k` (bỏ bit tràn) | `3 << 2 = 12` |
| `a >> k` | dịch phải **giữ dấu** | `−8 >> 1 = −4` |
| `a >>> k` | dịch phải **không dấu** (TS/Java) | `−1 >>> 28 = 15` |

## 2. Bẫy kiểu số (đọc kỹ)

| | TypeScript | Python | Java |
|---|---|---|---|
| Kiểu số | `number` = double, **mọi toán tử bit ép về int32** | `int` vô hạn | `int` 32 bit, `long` 64 bit |
| `1 << 31` | `−2147483648` | `2147483648` | `−2147483648` (`1L << 31` mới dương) |
| Về không dấu | `x >>> 0` → `[0, 2³²)` | `x & 0xFFFFFFFF` | `x & 0xFFFFFFFFL` (kết quả `long`) |
| Số âm khi `>>` | giữ dấu, không bao giờ về 0 | giữ dấu (vô hạn bit 1) → **lặp vô hạn** | giữ dấu |
| Số > 2³² | toán tử bit **chỉ nhìn 32 bit thấp**; dùng `BigInt` | bình thường | dùng `long` |
| Đếm bit 1 | tự viết | `n.bit_count()` (3.10+), `bin(n).count("1")` | `Integer.bitCount`, `Long.bitCount` |

```ts
1 << 31            // -2147483648 (bit dấu!)
(1 << 31) >>> 0    // 2147483648
4294967297 & 1     // 1   (2³² + 1 bị cắt còn 1)
2 ** 32 & (2 ** 32 - 1)   // 0, đúng "do tình cờ" — đừng tin toán tử bit cho số > 2³¹
BigInt(2 ** 40) & (BigInt(2 ** 40) - 1n)   // 0n  — an toàn cho tới 2⁵³
```

Python muốn mô phỏng int32: `x & 0xFFFFFFFF`, rồi nếu `x >> 31 & 1` thì `x -= 1 << 32`.

## 3. Bốn mẹo cơ bản

```
x & (x − 1)   xóa bit 1 THẤP NHẤT           1011000 & 1010111 = 1010000
x & −x        giữ lại bit 1 thấp nhất        1011000 & 0101000 = 0001000
x ^ x = 0 ,  x ^ 0 = x ,  XOR giao hoán     → các cặp tự triệt tiêu
(x >> i) & 1  đọc bit thứ i ;  x | (1 << i) bật ;  x & ~(1 << i) tắt ;  x ^ (1 << i) đảo
```

- **Lũy thừa của 2:** `x > 0 && (x & (x − 1)) === 0` (đúng một bit 1).
- **Đếm bit 1 (Kernighan):** `while (x) { x &= x − 1; c++; }` — số vòng = số bit 1.
- **Single number:** XOR cả mảng, các cặp triệt tiêu → còn số lẻ.
- **DP số bit:** `bits[i] = bits[i >> 1] + (i & 1)`.

## 4. Bitmask: tập con

Tập con của `m` phần tử ↔ số `mask ∈ [0, 2^m)`; bit `i` bật = chọn phần tử `i`.

```ts
for (let mask = 0; mask < 1 << m; mask++) {       // m ≤ ~20-25
  for (let i = 0; i < m; i++) if (mask >> i & 1) { /* phần tử i thuộc tập */ }
}
// tính OR/tổng của mọi tập con trong O(2^m) tổng cộng:
//   val[mask] = val[mask & (mask − 1)] ⊕ item[bit thấp nhất của mask]
```

Duyệt mọi tập con `sub` của `mask`: `for (let sub = mask; sub > 0; sub = (sub − 1) & mask)` (nhớ xử lý tập rỗng).

Độ phức tạp: `2^m · m` (hoặc `2^m` với mẹo trên). Khuôn này dùng khi `m ≤ 20`: trạng thái "đã dùng / chưa dùng" gói vào một số nguyên thay cho `boolean[]` hoặc `Set`.

## 5. Dấu hiệu nhận biết
"Mọi phần tử xuất hiện chẵn/3 lần trừ một", "không dùng thêm bộ nhớ", "đếm/đảo/xóa bit", "lũy thừa của 2", "n ≤ 20 và cần thử mọi tập con", "trạng thái bật/tắt nhiều cờ".

## 6. Công cụ có sẵn

| | TS | Python | Java |
|---|---|---|---|
| popcount | tự viết | `x.bit_count()` | `Integer.bitCount`, `Long.bitCount` |
| bit thấp nhất | `x & −x`, `31 − Math.clz32(x & −x)` | `(x & −x).bit_length() − 1` | `Integer.numberOfTrailingZeros` |
| đảo bit | tự viết | `int(f"{x:032b}"[::-1], 2)` | `Integer.reverse` |
| nhị phân | `x.toString(2)` (số âm có dấu `−`) | `bin(x)` (`0b…`) | `Integer.toBinaryString` (âm: bù hai 32 bit) |

## 7. Bẫy tóm tắt
1. TS: `1 << 31` âm; quên `>>> 0` khi trả số 32-bit không dấu.
2. Vòng `while (n) n >>= 1` với n âm hoặc ≥ 2³¹ không bao giờ dừng.
3. Toán tử bit trên số > 2³¹ trong TS **cắt bớt** bit cao mà không báo lỗi.
4. Độ ưu tiên: `a & b === 0` là `a & (b === 0)` → luôn đóng ngoặc `(a & b) === 0`.
5. Java: `1 << 32` = `1` (dịch lấy `k mod 32`); dùng `1L << k` với `long`.
6. XOR không phân biệt 'thiếu một' với 'dư một': bài phải bảo đảm cấu trúc (mỗi số hai lần trừ một…).

## 8. Độ phức tạp
Mọi phép bit là O(1) trên word. Duyệt tập con: O(2^m). Các bài single number: O(n) thời gian, O(1) bộ nhớ — tốt hơn `Set`/`Map` O(n) bộ nhớ.

**Câu hỏi quy mô (làm trước ex09):** `rangeBitwiseAnd(2³⁰, 2³¹ − 1)` — nếu AND lần lượt từng số thì cần khoảng bao nhiêu bước và mất bao lâu? Dự đoán rồi so với bài làm O(31).
