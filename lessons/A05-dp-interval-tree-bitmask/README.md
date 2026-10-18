# A05 · DP V: interval, tree, bitmask, digit

## Sau buổi này bạn sẽ
- **Interval DP:** state là đoạn `[l, r]`, transition là *điểm chia / phần tử cuối cùng* trong đoạn, duyệt theo độ dài tăng dần.
- **DP trên cây:** mỗi node trả về một *cặp/bộ trạng thái* cho cây con (post-order).
- **Bitmask DP:** state là tập con (`mask`) của `n ≤ 15–20` phần tử; TSP, chia nhóm.
- **Digit DP (giới thiệu):** đếm số trong `[0, n]` có tính chất theo từng chữ số.

## 1. Interval DP

`dp[l][r]` = đáp án cho đoạn `l..r`. Transition thử mọi cách chia `k ∈ [l, r]`:
```
dp[l][r] = best over k of ( dp[l][k] + dp[k][r] + cost(l, k, r) )
```
Thứ tự: **độ dài tăng dần** (đoạn ngắn trước), không phải `l` tăng dần.
```
for len in 2..n:            for l in 0..n-len:     r = l + len - 1
```
Độ phức tạp thường **O(n³)** (n² state × n lần chia) ⇒ dùng được khi `n ≤ 300–500`.

**Mẹo burst balloons:** nghĩ về bóng nổ **cuối cùng** trong đoạn `(l, r)` (khi đó hai bên còn nguyên làm "biên"), không phải bóng nổ đầu tiên (làm hai nửa phụ thuộc nhau).

```
nums = [3,1,5,8]  → pad 1: [1,3,1,5,8,1]
dp[l][r] = max_k  dp[l][k] + dp[k][r] + a[l]·a[k]·a[r]      (k là bóng nổ cuối trong (l, r))
```

## 2. DP trên cây

Post-order: con trả kết quả cho cha. Với "cướp nhà / đặt camera", mỗi node trả về một **cặp trạng thái**:
```ts
// rob: [không lấy node, lấy node]
const [lNo, lYes] = f(node.left), [rNo, rYes] = f(node.right);
return [max(lNo, lYes) + max(rNo, rYes), node.val + lNo + rNo];
```
Cây có thể lệch hoàn toàn ⇒ độ sâu = số node. Đệ quy sâu ~10⁴ tầng thì tràn stack (TS); bài ở đây giới hạn `n ≤ 5000` để đệ quy an toàn ở cả ba ngôn ngữ; muốn `10⁵` node phải viết post-order **lặp** (stack tự quản).

## 3. Bitmask DP

Tập con của `n` phần tử ↔ số nguyên `mask` (bit `i` = phần tử `i` đã chọn). `2ⁿ` state.
| Thao tác | Code |
|---|---|
| có `i` trong `mask`? | `(mask >> i) & 1` |
| thêm `i` | `mask \| (1 << i)` |
| bỏ `i` | `mask & ~(1 << i)` |
| duyệt tập con của `mask` | `for (s = mask; s; s = (s - 1) & mask)` |

**TSP:** `dp[mask][i]` = chi phí nhỏ nhất đi từ `0`, đã thăm đúng tập `mask`, đang đứng ở `i`. `dp[mask | 1<<j][j] = min(dp[mask][i] + dist[i][j])`. Độ phức tạp **O(2ⁿ · n²)**, `n = 15` ⇒ ~7·10⁶ phép. (n! = 1.3·10¹² cho vét cạn.)

## 4. Digit DP (giới thiệu)

Đếm số `x ∈ [0, N]` thỏa tính chất theo chữ số. Dựng số từ chữ số cao nhất, giữ trạng thái:
```
(pos, tight, ...thông tin cần thiết như count/tổng dư/chữ số trước)
tight = true: các chữ số đã chọn khớp tiền tố của N → chữ số kế bị chặn ≤ N[pos]
tight = false: tự do 0..9 → kết quả chỉ phụ thuộc (pos, ...) ⇒ memo được
```
Với đếm chữ số `1`, có dạng đóng theo từng vị trí: tại vị trí 10ᵐ, `high = ⌊N / 10ᵐ⁺¹⌋`, `cur = ⌊N / 10ᵐ⌋ mod 10`, `low = N mod 10ᵐ`; số lần chữ số 1 xuất hiện ở vị trí đó là `high·10ᵐ + (cur > 1 ? 10ᵐ : cur == 1 ? low + 1 : 0)`. O(log N) thay vì duyệt `1..N` (10⁹ phép).

## 5. Dấu hiệu nhận biết
- Interval: "gộp/xóa/nổ/chia đoạn", đoạn hai đầu quan trọng, `n ≤ 500`.
- Cây: "chọn tập node không kề nhau", "phủ cây", "đường kính".
- Bitmask: `n ≤ 15–20`, "thăm mọi điểm đúng một lần", "chia vào k nhóm", "tập con".
- Digit: "đếm số từ 1 đến N (N tới 10⁹–10¹⁸) có tính chất về chữ số".

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Bit | `1 << i` (32-bit; `i ≤ 30`), `>>` có dấu | `1 << i` vô hạn | `1 << i` (int), `1L << i` cho `long` |
| Bảng `2ⁿ · n` | `Int32Array(size).fill(INF)` | list `[INF] * size` chậm | `int[1 << n][n]` hoặc phẳng |
| Cây | `TreeNode` từ `tools/lib.ts` | `from dsa import TreeNode` | có sẵn trong classpath |
| Cộng `INF` | `1e9 + 1e9` an toàn | không tràn | `Integer.MAX_VALUE + x` tràn ⇒ dùng `INF = 1e9` |

## 7. Bẫy
1. Interval DP duyệt `l` tăng dần thay vì độ dài tăng dần ⇒ dùng ô chưa tính.
2. Burst balloons nghĩ theo bóng nổ *đầu tiên* ⇒ hai nửa phụ thuộc nhau, không DP được.
3. DP cây: nhầm trạng thái "node này có camera / được phủ / chưa được phủ" — vẽ bảng 3 trạng thái trước.
4. Bitmask: `1 << 31` thành số âm (TS/Java); `n ≤ 20` là giới hạn thực tế của `2ⁿ · n`.
5. TSP quên cạnh quay về 0, hoặc `n = 1`/`n = 2`.
6. Digit DP: quên trạng thái `tight` ⇒ đếm số vượt `N`; hoặc quên số 0 đứng đầu.

## 8. Độ phức tạp
Interval O(n³) time, O(n²) space · Cây O(n) · TSP O(2ⁿ·n²) time, O(2ⁿ·n) space · Digit: O(log N · 10 · |trạng thái|).
