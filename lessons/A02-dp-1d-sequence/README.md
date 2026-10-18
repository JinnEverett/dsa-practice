# A02 · DP II: 1D & sequence

## Sau buổi này bạn sẽ
- Viết DP 1 chiều cho **coin change** (min số đồng / đếm số cách) và biết vì sao thứ tự hai vòng lặp quyết định *tổ hợp* hay *hoán vị*.
- **LIS** O(n²) và O(n log n) bằng mảng `tails` + binary search.
- DP trên chuỗi: **word break**, **decode ways**; **Kadane** và biến thể (max product).
- Mô hình **state machine** cho bài mua bán cổ phiếu.

## 1. Khuôn "dp[i] nhìn lại các ô trước"

```
dp[i] = tốt nhất khi kết thúc/xét đến vị trí i
dp[i] = combine( dp[j] cho các j < i hợp lệ )
```
Độ phức tạp = số state × số j hợp lệ. Giảm số j (cửa sổ, binary search, trạng thái nén) là cách tối ưu chính.

## 2. Coin change

**Min số đồng:** `dp[a] = min(dp[a - c] + 1)` với mọi đồng `c ≤ a`; `dp[0] = 0`, chưa tới được = `Infinity`/`INF`. O(amount · |coins|).

**Đếm số cách (tổ hợp):** thứ tự vòng lặp quan trọng!
```ts
dp[0] = 1;
for (const c of coins)                    // ĐỒNG ở vòng ngoài → mỗi tổ hợp đếm đúng 1 lần
  for (let a = c; a <= amount; a++) dp[a] += dp[a - c];
```
Đổi hai vòng (amount ngoài, đồng trong) → đếm **hoán vị** (1+2 khác 2+1) — chính là bài `combinationSum4` ở A04.

## 3. LIS (longest increasing subsequence)

O(n²): `dp[i] = 1 + max(dp[j] : j < i, a[j] < a[i])`.
O(n log n): giữ `tails[k]` = giá trị kết thúc **nhỏ nhất** của một dãy tăng độ dài `k+1`. Với `x`: tìm vị trí đầu tiên `tails[pos] ≥ x` (lower bound) rồi ghi đè (hoặc nối thêm).
```
a = [10, 9, 2, 5, 3, 7, 101, 18]
tails: [10] → [9] → [2] → [2,5] → [2,3] → [2,3,7] → [2,3,7,101] → [2,3,7,18]   ⇒ độ dài 4
```
`tails` **không phải** dãy LIS thật (chỉ độ dài đúng). Muốn truy vết: lưu thêm `parent`. Tăng *ngặt* → lower bound; không giảm → upper bound.

## 4. Chuỗi: word break & decode ways

`dp[i]` = tiền tố độ dài `i` phân rã được. `dp[i] = OR dp[j] && s[j..i) ∈ dict`. Nếu từ dài tối đa `L` thì chỉ xét `j ≥ i - L` → O(n · L) thay vì O(n²). Dùng `Set` (TS) / `set` (Python) / `HashSet` (Java).

Decode ways: `dp[i] = (s[i-1] ≠ '0' ? dp[i-1] : 0) + (10 ≤ s[i-2..i) ≤ 26 ? dp[i-2] : 0)`. Chú ý chữ số `0`.

## 5. Kadane & biến thể

`best[i] = max(a[i], best[i-1] + a[i])`. **Max product**: giữ cả `max` và `min` kết thúc tại `i` (âm × âm = dương).

## 6. State machine (mua bán cổ phiếu)

Mỗi ngày bạn ở một *trạng thái*; transition là hành động:
```
hold  = đang cầm cổ phiếu          hold'  = max(hold, free - price)           (mua)
sold  = vừa bán hôm nay            sold'  = hold + price                      (bán)
rest  = rảnh, không cầm            rest'  = max(rest, sold)                   (nghỉ / hết cooldown)
```
Vẽ sơ đồ trạng thái trước, rồi mới viết công thức. Mỗi ngày O(1) → O(n), bộ nhớ O(1).

## 7. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Lower bound | tự viết | `bisect_left(tails, x)` | `Arrays.binarySearch` (trả âm khi không thấy, cẩn thận trùng) hoặc tự viết |
| Tập từ | `new Set(dict)` | `set(dict)` | `HashSet<String>` |
| Vô cực | `Infinity` / `1e9` | `float('inf')` | `Integer.MAX_VALUE / 2` (tránh tràn khi cộng 1) |
| Substring | `s.slice(j, i)` O(len) | `s[j:i]` | `s.substring(j, i)` |

## 8. Bẫy
1. Coin change: `dp[a - c] + 1` khi `dp[a-c] = INF` → Java `Integer.MAX_VALUE + 1` tràn âm.
2. Đếm cách: đảo thứ tự vòng lặp = hoán vị; quên `mod`.
3. LIS: nhầm lower/upper bound (ngặt vs không ngặt); nhầm `tails` với dãy thật.
4. Word break quét mọi `j` → O(n²) + tạo substring O(n) ⇒ O(n³) thực tế.
5. Decode: `"06"` không hợp lệ, `"10"`/`"20"` chỉ có một cách.
6. Max product: chỉ giữ `max` → sai khi gặp số âm; 0 reset cả `max` và `min`.

## 9. Độ phức tạp
Coin: O(A · k) · LIS: O(n log n) · Word break: O(n · L) · Decode/Kadane/stock: O(n).
