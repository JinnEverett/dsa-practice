# R07 · Probabilistic data structures

## Sau buổi này bạn sẽ
- Dùng **Bloom filter** (có thể có / chắc chắn không), **Count-Min Sketch** (đếm xấp xỉ), **HyperLogLog** (đếm số phần tử khác nhau) khi chấp nhận sai số để đổi lấy bộ nhớ.
- Chọn tham số `m, k` theo tỉ lệ sai dương mong muốn và **đo** tỉ lệ thật so với lý thuyết.
- Hiểu vì sao chất lượng hàm hash quyết định cả độ chính xác lẫn tính tất định giữa các ngôn ngữ.

## 0. Hash dùng trong module (đặc tả, để kết quả giống nhau ở TS / Python / Java)
Item chỉ gồm ký tự ASCII.
```
fnv1a32(s): h = 2166136261; mỗi ký tự c: h = (h XOR c) · 16777619 mod 2³²
fmix32(h) : h ^= h>>>16; h = h·0x85ebca6b; h ^= h>>>13; h = h·0xc2b2ae35; h ^= h>>>16   (mod 2³²)
g(s) = fmix32(fnv1a32(s))        h1 = g(s)        h2 = g(s + "#")
vị trí thứ i (i = 0..k−1) = (h1 + i·h2) mod m          (số nguyên 64-bit)
```
Test vector: `fnv1a32("") = 0x811c9dc5`, `"a" → 0xe40c292c`, `"foobar" → 0xbf9cf968`; `g("") = 0xab3e7c0b`, `g("a") = 0x1a80b1b3`, `g("hello") = 0x888d766e`.

Cẩn thận phép nhân 32 bit: TS dùng `Math.imul(...) >>> 0` (nhân `*` thường vượt 2⁵³); Python `& 0xFFFFFFFF` sau mỗi bước; Java dùng `long` và mask `0xFFFFFFFFL`.

**Vì sao cần `fmix32`?** FNV-1a thuần phân tán bit kém, và `fnv1a32(s + "#")` là hàm *tuyến tính* của `fnv1a32(s)` nên `h1`, `h2` tương quan. Đo thật (`n = 1000, m = 9586, k = 7`, 2·10⁵ probe): chỉ FNV cho sai dương **2,59%**, có `fmix32` cho **0,94%**, lý thuyết 1,00%.

## 1. Bloom filter
```
 m bit: 0 0 1 0 1 0 0 1 …     add(x): bật k bit (h1 + i·h2) mod m
 mightContain(x): cả k bit bật? → "có thể có"; có bit tắt → "chắc chắn không"
```
- Không sai âm; có sai dương; **không xóa** được (counting Bloom filter dùng đếm thay bit).
- Sau `n` lần chèn, tỉ lệ sai dương ≈ `(1 − e^(−kn/m))^k`. Tối ưu: `k = (m/n)·ln 2` và `m = −n·ln p / (ln 2)²` ≈ 1,44·log₂(1/p) bit/item (p = 1% → ≈ 9,6 bit; p = 0,1% → ≈ 14,4 bit).
- Dùng để lọc trước nơi lưu trữ đắt (SSTable trong LSM-tree, cache miss, URL đã crawl).

## 2. Count-Min Sketch
Bảng `depth × width`. `add(x, c)`: ở mỗi hàng `r` cộng `c` vào ô `(h1 + r·h2) mod width`. `estimate(x)` = **min** các ô → không bao giờ thấp hơn đếm thật (va chạm chỉ làm tăng). Với `width = ⌈e/ε⌉`, `depth = ⌈ln(1/δ)⌉`: sai số ≤ ε·N với xác suất ≥ 1 − δ. Dùng cho top-K tần suất trên luồng (kết hợp heap, xem R03).

## 3. HyperLogLog
Quan sát: trong `n` hash ngẫu nhiên, vị trí bit 1 đầu tiên (`ρ`) lớn nhất ≈ `log₂ n`. Chia thành `m = 2^b` thanh ghi (b bit cao chọn thanh ghi), mỗi thanh ghi giữ `max ρ`; ước lượng bằng trung bình điều hòa. Sai số chuẩn ≈ **1,04/√m**; bộ nhớ chỉ `m` byte.

Đo thật (ref của module; item `user0…user{n-1}`):

| b (m) | σ lý thuyết | n=100 | n=10³ | n=10⁴ | n=10⁵ | n=10⁶ |
|---|---|---|---|---|---|---|
| 6 (64) | 13% | +19% | −11,5% | −8,0% | −3,2% | −8,0% |
| 10 (1024) | 3,3% | 0% | +0,4% | +2,2% | +1,1% | −3,4% |
| 14 (16384) | 0,8% | 0% | −0,1% | +0,3% | −0,5% | −0,1% |

Khi `E ≤ 2,5·m` mà còn thanh ghi bằng 0: dùng *linear counting* `m·ln(m/V)` (chính xác hơn ở n nhỏ).

## 4. Khi nào chấp nhận sai số?
| Câu hỏi | Chính xác | Xấp xỉ |
|---|---|---|
| "x đã gặp chưa?" | `Set` (O(n) bộ nhớ) | Bloom (bit/item cố định, có sai dương) |
| "x xuất hiện bao nhiêu lần?" | `Map` | Count-Min (không bao giờ đếm thiếu) |
| "bao nhiêu người dùng khác nhau?" | `Set` | HyperLogLog (vài KB cho tỉ phần tử) |

Dùng khi dữ liệu quá lớn / luồng vô hạn và quyết định chịu được sai số có chặn; **không** dùng khi sai là mất tiền (đối soát thanh toán).

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Nhân 32 bit | `Math.imul(a, b) >>> 0` | `(a * b) & 0xFFFFFFFF` | `(a * b) & 0xFFFFFFFFL` với `long` |
| Đếm số 0 đầu | `Math.clz32` | `bit_length()` | `Integer.numberOfLeadingZeros` |
| Bảng bit | `Uint8Array` | `bytearray` / `int` | `long[]` / `BitSet` |
| Làm tròn | `Math.floor(x + 0.5)` | `math.floor(x + 0.5)` (không dùng `round`: làm tròn chẵn) | `Math.floor(x + 0.5)` |

## 6. Bẫy
1. Hash kém / các hash phụ thuộc nhau → sai dương cao hơn công thức nhiều lần.
2. Nhân 32 bit bằng `*` trong TS (mất chính xác).
3. HLL: `ρ` đếm cả các bit đã dùng chọn thanh ghi; quên linear counting.
4. `m` vượt `int` khi tính tham số (n = 10⁹, p = 10⁻⁹ → m ≈ 4,3·10¹⁰): dùng `long`.
5. Count-Min với tổng đếm tràn `int`.
6. Dùng Bloom filter khi cần xóa.

## 7. Độ phức tạp
| | time | space |
|---|---|---|
| Bloom add / test | O(k) | m bit |
| Count-Min add / estimate | O(depth) | width·depth |
| HyperLogLog add / estimate | O(1) / O(m) | m byte |

## 8. Câu hỏi quy mô
Bạn cần biết "đã xử lý event id này chưa" cho 10⁹ id, p = 1%. Tính bộ nhớ Bloom (bit/item × 10⁹) và so với `HashSet<long>` (≥ 8 byte/id + overhead). Rồi chạy ex02 ở `n = 10⁵` (và `bench`): tỉ lệ thật có khớp lý thuyết không, và khi `m` giảm một nửa thì sao?
