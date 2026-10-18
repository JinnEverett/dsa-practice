# I14 · Math cho lập trình

## Sau buổi này bạn sẽ
- Dùng **Euclid** cho gcd/lcm, **sàng Eratosthenes** đếm số nguyên tố, **lũy thừa nhanh**, **nghịch đảo modulo (Fermat)** và **C(n, k) mod p**.
- Làm việc đúng với **modulo 10⁹+7**, đặc biệt **bẫy 2⁵³** khi nhân hai số ~10⁹ trong TypeScript (và `long` trong Java).
- Xử lý các bài "toán học thực dụng": đổi cơ số, chữ số 0 của n!, phân số tuần hoàn, Luhn, lịch trùng nhau (lcm).

## 1. Euclid — gcd và lcm

`gcd(a, b) = gcd(b, a mod b)` cho tới khi `b = 0`. Mỗi hai bước `a` ít nhất giảm một nửa ⇒ **O(log min(a, b))**. Phép trừ liên tiếp thì O(max): `gcd(10⁹, 1)` mất 10⁹ bước.

```ts
const gcd = (a: number, b: number): number => { while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;     // chia TRƯỚC khi nhân để số trung gian nhỏ
```

`gcd(a, b, c) = gcd(gcd(a, b), c)`; `gcd(0, x) = x`. Trùng lịch của hai chu kỳ `a`, `b`: tại các bội của `lcm(a, b)`.

## 2. Số nguyên tố và sàng Eratosthenes

Chia thử một số cần O(√x); đếm mọi số < n bằng chia thử là O(n√n) — với n = 5·10⁶ đo được ~1 270 ms (bản thử) so với ~34 ms của sàng.

```ts
const composite = new Uint8Array(n);
for (let p = 2; p * p < n; p++)
  if (!composite[p]) for (let m = p * p; m < n; m += p) composite[m] = 1;   // bắt đầu từ p²: bội nhỏ hơn đã bị gạch
```
**O(n log log n)** thời gian, O(n) bộ nhớ. `Uint8Array` (1 byte/số) thay vì `boolean[]` (mảng JS 8 byte/phần tử).

## 3. Lũy thừa nhanh và modulo

`a^e` bằng **bình phương liên tiếp**: đọc `e` theo bit; `e` lẻ thì nhân kết quả với `a`; `a ← a²`, `e ← ⌊e/2⌋`. **O(log e)** (e ≤ 2⁵³ ⇒ ≤ 53 vòng).

Modulo `p` (thường `10⁹ + 7` hoặc `998244353`):
- Mọi cộng/nhân đều `% p` ngay; **chia** không dùng `/` mà nhân với **nghịch đảo modulo**. Với `p` nguyên tố, định lý Fermat nhỏ: `a⁻¹ ≡ a^(p−2) (mod p)` (a không chia hết cho p).
- **C(n, k) mod p** = `n·(n−1)…(n−k+1) × (k!)⁻¹`; dùng đối xứng `C(n, k) = C(n, n−k)`.

## 4. Bẫy 2⁵³ khi nhân modulo

`number` của JS chính xác đến **2⁵³ − 1 ≈ 9,007·10¹⁵**. Tích `a·b` với `a, b ~ 10⁹` ≈ 10¹⁸ — vượt xa; kết quả **sai im lặng** (không lỗi). Ngưỡng: `a, b ≥ 9,49·10⁷` đã có thể vượt 2⁵³.

| Cách nhân modulo | Dùng khi | Ghi chú |
|---|---|---|
| `BigInt`: `Number(BigInt(a) * BigInt(b) % BigInt(m))` | đơn giản, ít lần nhân | chậm hơn ~10× khi lặp triệu lần |
| `mulMod` tách 16 bit | nhiều phép nhân, `m < 2³¹` | `hi = ⌊b / 65536⌋`, `lo = b % 65536`, `((a·hi % m)·65536 + a·lo) % m` (mỗi tích < 2⁴⁸) |
| `Math.imul` / `>>>` | **không** dùng cho modulo lớn | chỉ 32 bit |

```ts
function mulMod(a: number, b: number, m: number): number {   // 0 ≤ a, b < m ≤ 2³¹
  const hi = Math.floor(b / 65536), lo = b % 65536;
  return (((a * hi) % m) * 65536 + a * lo) % m;
}
```

| | TypeScript | Python | Java |
|---|---|---|---|
| Số nguyên | `number` (đúng tới 2⁵³), `BigInt` | `int` vô hạn | `int` 32 bit, `long` 64 bit |
| Lũy thừa modulo | tự cài với `mulMod` | `pow(a, e, m)` có sẵn | `BigInteger.modPow` hoặc tự cài với `long` |
| Nhân hai số < 2³¹ | **cần mulMod** | không vấn đề | `long`: tích < 2⁶² < 2⁶³ ✓ |
| Tích 10¹⁰ · 10¹⁰ | vượt 2⁵³ | không vấn đề | **tràn long** (9,22·10¹⁸ < 10²⁰) |
| `a * b / gcd` | tràn dễ | an toàn | `int` tràn ngay; dùng `a / gcd * b` |

## 5. Các bài "toán học thực dụng"

- **Đổi cơ số:** chia liên tiếp cho `base`, thu số dư, đảo. Số âm: xử lý giá trị tuyệt đối, thêm `-`. `0` → `"0"`.
- **Chữ số 0 cuối n!:** đếm thừa số 5 theo Legendre `⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …`. Không bao giờ tính `n!`.
- **Số hạnh phúc:** lặp "tổng bình phương chữ số": về 1 hoặc vào chu trình; phát hiện bằng Floyd (rùa–thỏ) hoặc Set.
- **Phân số → thập phân:** chia tay; ghi nhớ dư → vị trí chữ số; gặp lại một dư là bắt đầu phần tuần hoàn. Số dư khác nhau < mẫu số, nên tối đa |mẫu| chữ số. `−2³¹ / −1` tràn `int`.
- **Luhn:** từ phải sang trái, nhân đôi chữ số thứ 2, 4, 6, …; > 9 thì trừ 9; tổng chia hết cho 10.
- **Lịch trùng:** bội chung nhỏ nhất `L = lcm`; lần trùng đầu tiên ≥ `t` là `⌈t / L⌉ · L`.

## 6. Dấu hiệu nhận biết
"modulo 10⁹+7", "đếm số cách ... lớn", "lũy thừa rất lớn", "số nguyên tố ≤ 10⁶–10⁷", "bội chung / ước chung", "chu kỳ / lặp lại sau bao lâu", "giai thừa / tổ hợp", "chuyển hệ cơ số", "kiểm tra mã bằng chữ số kiểm tra".

## 7. Bẫy
1. **Nhân hai số ~10⁹ trong TS rồi `% m`** — mất chính xác (2⁵³); dùng `mulMod`/`BigInt`.
2. Chia khi làm modulo (`(a % p) / (b % p)`): dùng nghịch đảo.
3. `a * b / gcd(a, b)` — tràn trước khi chia (Java `int`, và TS khi a·b > 2⁵³); viết `a / gcd * b`.
4. Sàng: bắt đầu gạch từ `2p` (đúng nhưng chậm), quên `p * p < n`; đếm `≤ n` thay vì `< n`.
5. Lũy thừa nhanh dùng `>>` cho `exp > 2³¹` — dùng `% 2` và `Math.floor(/ 2)`; quên reduce `base % mod`; `mod = 1`.
6. `n!` hay Pascal O(n·r) cho `n = 10⁶`.
7. `fractionToDecimal`: `-0`, dấu khi cả hai âm, `Math.abs(−2³¹)` tràn `int`, quên dấu `.` khi chia hết.
8. Python `//` và `%` với số âm làm tròn xuống (khác C/Java/JS truncation) — chú ý khi đổi cơ số cho số âm; luôn dùng giá trị tuyệt đối.

## 8. Độ phức tạp
gcd `O(log)`; sàng `O(n log log n)`; lũy thừa nhanh `O(log e)` phép nhân modulo; C(n, k) `O(k + log p)`; đổi cơ số `O(log_b n)`; Legendre `O(log₅ n)`; phân số tuần hoàn `O(|mẫu|)`.
