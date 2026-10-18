# A09 · String algorithms

## Sau buổi này bạn sẽ
- Tính **prefix function** (KMP) và **Z-function** trong O(n), dùng chúng để tìm mẫu, kiểm tra chu kỳ, tìm palindrome tiền tố.
- Dùng **rolling hash** (Rabin–Karp) kèm *binary search theo độ dài* cho bài chuỗi con lặp / chung.
- Biết **bẫy của hash**: va chạm, tràn `2⁵³` của JS, và vì sao phải **kiểm chứng lại** khi hash trùng.
- (Tùy chọn) biết Manacher tồn tại cho palindrome O(n).

## 1. Vì sao cần: tìm mẫu thô là O(n·m)

`haystack = "aaaa…a"` (10⁶ ký tự), `needle = "aaa…ab"` (5·10⁵ ký tự): mỗi vị trí khớp ~5·10⁵ ký tự rồi mới lệch ⇒ ~2.5·10¹¹ phép. KMP/Z: **O(n + m)** — không bao giờ quay lui trong haystack.

## 2. Prefix function (π)

`π[i]` = độ dài **border dài nhất** (vừa là tiền tố vừa là hậu tố, **thực sự ngắn hơn** chuỗi) của `s[0..i]`.
```
s  = a b a b a c a
π  = 0 0 1 2 3 0 1
```
```ts
const pi = new Int32Array(n);
for (let i = 1, k = 0; i < n; i++) {
  while (k > 0 && s[i] !== s[k]) k = pi[k - 1];   // thụt về border ngắn hơn
  if (s[i] === s[k]) k++;
  pi[i] = k;
}
```
Vì sao O(n)? `k` tăng tối đa 1 mỗi bước, mỗi lần `while` giảm `k` ⇒ tổng bước giảm ≤ tổng bước tăng ≤ n (**amortized**).

**Tìm mẫu:** tính π của `pattern + '#' + text` (ký tự `#` không thuộc bảng chữ cái); vị trí `i` có `π[i] == |pattern|` ⇒ khớp kết thúc ở đó. Hoặc chạy KMP trực tiếp với `k` là độ dài đang khớp.

**Chu kỳ:** chuỗi dài `n` có chu kỳ nguyên `p = n − π[n−1]` nếu `p < n` và `n % p == 0` (⇒ `s` lặp `n/p` lần).

**Palindrome tiền tố dài nhất:** π của `s + '#' + reverse(s)`, giá trị cuối cùng. Thêm `reverse(s[L..])` vào đầu ⇒ palindrome ngắn nhất.

## 3. Z-function

`z[i]` = độ dài khớp dài nhất giữa `s[i..]` và `s` (tiền tố). Quy ước **`z[0] = n`**.
```
s = a b a c a b a
z = 7 0 1 0 3 0 1
```
Giữ cửa sổ `[l, r)` khớp xa nhất; `z[i]` khởi tạo bằng `min(r − i, z[i − l])` rồi mở rộng thủ công — tổng O(n). Dùng cho: tìm mẫu (Z của `pattern + '#' + text`, vị trí `i` có `z == |pattern|`), đếm số lần xuất hiện của mỗi tiền tố, v.v. Z và π tương đương sức mạnh — chọn cái bạn nhớ rõ hơn.

## 4. Rolling hash (Rabin–Karp)

`H(s[l..r)) = Σ s[i]·Bʳ⁻¹⁻ⁱ mod M`. Với prefix hash `H[i+1] = H[i]·B + s[i]`:
```
hash(l, r) = (H[r] − H[l]·B^(r−l)) mod M      // O(1) mỗi đoạn sau khi tiền xử lý O(n)
```
**Bẫy JS:** `a * b` vượt `2⁵³` khi `a, b ~ 10⁹` ⇒ **mất chính xác âm thầm**. Giải pháp: tách nhỏ phép nhân (`mulmod` bằng 15 bit thấp/cao), hoặc `BigInt` (chậm), hoặc mod nhỏ `< 9.4·10⁷` (a·b < 2⁵³). Java: `long` đủ cho mod ~10⁹. Python: số nguyên lớn không tràn.

```ts
const mulmod = (a: number, b: number) => ((a * (b >>> 15)) % M * 32768 + a * (b & 32767)) % M;   // a, b < 2³⁰
```
**Va chạm:** hai chuỗi khác nhau cùng hash. Với `n` đoạn và mod ~10⁹, kỳ vọng ~n²/2M va chạm (n = 10⁵ ⇒ ~5). Hai cách xử lý: hash đôi (hai mod / hai base), hoặc **kiểm chứng bằng so sánh thật khi hash trùng** (đảm bảo đúng, chỉ chậm thêm khi va chạm). Cẩn thận *anti-hash test* trên judge: base/mod cố định bị phá — dùng base ngẫu nhiên khi nộp thật.

## 5. Binary search theo độ dài + hash

"Chuỗi con **dài nhất** xuất hiện ≥ 2 lần" hoặc "chung của hai chuỗi": nếu tồn tại độ dài `L` thì tồn tại mọi `L' < L` (cắt bớt) ⇒ **đơn điệu**. Binary search `L`; mỗi bước kiểm tra "có đoạn dài `L` trùng không" bằng hash trong O(n). Tổng **O(n log n)**.

## 6. Manacher (giới thiệu)

Palindrome dài nhất trong O(n): giữ palindrome phủ xa nhất `[c − r, c + r]`, dùng đối xứng để khởi tạo bán kính tại `i` rồi mở rộng. Ở A03 bạn đã có bản mở rộng quanh tâm O(n²); Manacher chỉ cần khi `n ≥ 10⁵`.

## 7. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Ký tự | `s.charCodeAt(i)` (nhanh hơn `s[i]`) | `ord(s[i])` / so sánh `s[i]` | `s.charAt(i)` |
| Nối chuỗi dài | `+` / `join` | `+` / `''.join` | `StringBuilder` (không `+=` trong vòng lặp) |
| Nhân mod ~10⁹ | `mulmod` tách bit | tự nhiên | `long` |
| `indexOf` | có sẵn, thường O(n·m) trường hợp xấu | `str.find` | `indexOf` |
| Đảo chuỗi | `[...s].reverse().join('')` | `s[::-1]` | `new StringBuilder(s).reverse()` |

## 8. Bẫy
1. π/Z: nhầm border **thực sự ngắn hơn** chuỗi (π[i] < i + 1).
2. Ghép `pattern + text` mà không có ký tự phân cách ⇒ khớp vắt qua ranh giới.
3. Z-function: quên `z[0]` (n hay 0 — đề ghi rõ).
4. Hash JS: `(a * b) % M` với `a, b ~ 10⁹` sai âm thầm.
5. Trừ mod ra số âm: `(x % M + M) % M`.
6. Tin hash trùng là chuỗi trùng (không kiểm chứng) ⇒ sai hiếm nhưng thật.
7. Java: `s += c` trong vòng lặp O(n²); so sánh chuỗi bằng `==`.

## 9. Độ phức tạp
π, Z, KMP: O(n + m) · Rolling hash: tiền xử lý O(n), mỗi truy vấn đoạn O(1) · Binary search + hash: O(n log n) · Manacher O(n).
