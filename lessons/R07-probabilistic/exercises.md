# R07 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R07-probabilistic [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R07-probabilistic 01`

**Pass:** 4/5 bài qua `check` và **đo tỉ lệ sai dương thực tế khớp lý thuyết** (ex02 ở `n ≥ 10⁴`, sai lệch tương đối < 10%).

**Hash (bắt buộc dùng đúng để kết quả tất định, xem README mục 0):** `g(s) = fmix32(fnv1a32(s))`, `h1 = g(s)`, `h2 = g(s + "#")`, vị trí thứ `i` (`i = 0..k−1`) = `(h1 + i·h2) mod m` tính bằng số nguyên 64-bit. Item chỉ gồm ký tự ASCII, độ dài ≤ 20.

---

## 🟢 Cơ bản

### ex01 · Bloom filter (class)
```java
class BloomFilter {
  BloomFilter(int m, int k)
  void add(String item)
  boolean mightContain(String item)
}
```
- `m` bit (ban đầu tắt), `k` vị trí cho mỗi item (có thể trùng nhau). `mightContain` đúng khi cả `k` bit bật.
- Ràng buộc: `1 ≤ m ≤ 10⁷`, `1 ≤ k ≤ 30`, tối đa `10⁵` thao tác.
- Ví dụ: `BloomFilter(1000000, 7)`: `mightContain(x) → false`, `add(x)`, `mightContain(x) → true`. Với `m = 1` mọi `mightContain` sau khi đã `add` bất kỳ đều `true`.

### ex02 · Sai dương: lý thuyết vs đo thật
Chèn `"key0"…"key{n−1}"` vào `BloomFilter(m, k)`, rồi thử `"probe0"…"probe{probes−1}"` (không được chèn). Trả `[lýThuyết, đoThật]` với lý thuyết `= (1 − e^(−k·n/m))^k` và đo thật = số probe trả `true` chia `probes` (0 nếu `probes = 0`).
```java
double[] measureBloom(int n, int m, int k, int probes)
```
- Ràng buộc: `0 ≤ n, probes ≤ 10⁵`, `1 ≤ m ≤ 10⁷`, `1 ≤ k ≤ 30`. Sai số cho phép `10⁻⁶`.
- Ví dụ: `measureBloom(1, 1, 1, 5)` → `[0.6321205588…, 1.0]` · `measureBloom(0, 100, 3, 10)` → `[0, 0]`.
- Sau khi qua `check`, chạy thử `n = 1000, m = 9586, k = 7, probes = 200000` và so hai số. Bỏ `fmix32` đi (chỉ FNV) thì đo thật thay đổi thế nào?

### ex03 · Count-Min Sketch (class)
```java
class CountMinSketch {
  CountMinSketch(int width, int depth)
  void add(String item, int count)
  int estimate(String item)
}
```
- Hàng `r` (`r = 0..depth−1`) dùng ô `(h1 + r·h2) mod width`. `estimate` = giá trị nhỏ nhất trong `depth` ô.
- Ràng buộc: `1 ≤ width ≤ 10⁶`, `1 ≤ depth ≤ 10`, `1 ≤ count ≤ 100`, tổng `count` ≤ `10⁹`, tối đa `10⁵` thao tác.
- Ví dụ: `CountMinSketch(1, 1)`: `add(a,3) add(b,4) estimate(a) → 7` (mọi item va chạm).

---

## 🟡 Kết hợp

### ex04 · HyperLogLog (class)
Ước lượng số item khác nhau. Dùng `x = g(item)`; `idx = b bit cao của x` (32 bit không dấu); `w` = `32 − b` bit thấp của `x`; `ρ` = vị trí (từ 1) của bit 1 trái nhất trong `w` biểu diễn bằng `32 − b` bit, hoặc `32 − b + 1` nếu `w = 0`. Thanh ghi `M[idx] = max(M[idx], ρ)`, `m = 2^b`.
`E = α·m² / Σ 2^(−M[j])` với `α = 0.673 (m=16), 0.697 (m=32), 0.709 (m=64), 0.7213/(1 + 1.079/m) (m ≥ 128)`. Nếu `E ≤ 2.5·m` và có `V > 0` thanh ghi bằng 0 thì `E = m·ln(m/V)`. Trả `floor(E + 0.5)`.
```java
class HyperLogLog {
  HyperLogLog(int b)
  void add(String item)
  long estimate()
}
```
- Ràng buộc: `4 ≤ b ≤ 16`, tối đa `10⁵` thao tác. Máy chấm so với số phần tử khác nhau **thật** với sai số cho phép `4·1,04/√m` (tương đối).
- Ví dụ: `HyperLogLog(10)`: `estimate() → 0`, `add(a) add(b) add(a)`, `estimate() → 2` (±1).

---

## 🔴 Thực tế

### ex05 · 🔴 Chọn tham số Bloom filter cho dịch vụ
Team dedup sự kiện cần Bloom filter chứa `n` event id với tỉ lệ sai dương mục tiêu `p`. Tính `m` (số bit) và `k` (số hàm hash) tối ưu: `m = ⌈ −n·ln p / (ln 2)² ⌉`, `k = max(1, floor( (m/n)·ln 2 + 0.5 ))`.
```java
long[] bloomParams(int n, double p)
```
- Ràng buộc: `1 ≤ n ≤ 10⁹`, `10⁻⁹ ≤ p ≤ 0.5`. Chú ý `m` vượt `int`.
- Ví dụ: `(1000, 0.01)` → `[9586, 7]` · `(10⁶, 0.001)` → `[14377588, 10]` · `(10⁹, 10⁻⁹)` → `[43132762699, 30]`.
- **Câu hỏi quy mô:** với `n = 10⁹, p = 1%`, Bloom filter cần bao nhiêu GB? So với `HashSet<long>`? Với `n = 10⁹` item, ex04 (b = 14) tốn bao nhiêu byte?
