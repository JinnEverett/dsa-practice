# A04 · DP IV: knapsack

## Sau buổi này bạn sẽ
- Nhận ra họ **knapsack**: "chọn tập vật phẩm với ràng buộc sức chứa/tổng" → tối ưu, đếm, hoặc có/không.
- Biết **chiều duyệt** khi nén về mảng 1D: ngược cho 0/1, xuôi cho unbounded — và *vì sao*.
- Phân biệt **đếm tổ hợp vs hoán vị** bằng thứ tự hai vòng lặp.
- Quy bài toán về **subset sum** (partition, target sum, last stone weight II).
- Xử lý **bounded knapsack** bằng binary splitting.

## 1. Ba biến thể gốc

Có `n` vật phẩm `(w[i], v[i])`, sức chứa `W`.

| | Mỗi vật dùng | `dp[j]` (nén 1D) | Duyệt `j` |
|---|---|---|---|
| **0/1** | tối đa 1 lần | `dp[j] = max(dp[j], dp[j - w] + v)` | **giảm dần** `W → w` |
| **Unbounded** | không giới hạn | giống công thức trên | **tăng dần** `w → W` |
| **Bounded** | tối đa `cnt[i]` lần | tách nhị phân thành các gói 0/1 | giảm dần |

Vì sao hướng duyệt khác nhau? `dp[j - w]` phải là giá trị **của vòng vật phẩm trước** (0/1) hay **của vòng hiện tại** (unbounded, cho phép lấy lại chính vật này).
```
0/1, j giảm dần:  dp[j-w] chưa bị vật i ghi đè → mỗi vật dùng ≤ 1 lần
unbounded, j tăng dần:  dp[j-w] đã tính cho vật i → có thể lấy tiếp
```
Bảng 2D `dp[i][j]` (xét i vật đầu, sức chứa j) dễ debug; 1D là bản nén.

## 2. Tối ưu, đếm, hay "có thể"?

| Câu hỏi | Khởi tạo | Gộp |
|---|---|---|
| Giá trị lớn nhất | `dp[0] = 0`, còn lại `0` hoặc `-∞` (nếu bắt buộc đúng `j`) | `max` |
| Có tạo được tổng `j` không | `dp[0] = true` | `or` |
| Đếm số cách | `dp[0] = 1` | `+` (mod) |
| Số vật ít nhất | `dp[0] = 0`, còn lại `∞` | `min(dp[j - w] + 1)` |

## 3. Tổ hợp vs hoán vị (đếm số cách, unbounded)

```ts
// TỔ HỢP (1+2 và 2+1 là một): vật phẩm ở vòng NGOÀI
for (const c of coins) for (let j = c; j <= T; j++) dp[j] += dp[j - c];

// HOÁN VỊ (1+2 và 2+1 khác nhau): sức chứa ở vòng NGOÀI
for (let j = 1; j <= T; j++) for (const c of coins) if (c <= j) dp[j] += dp[j - c];
```
Tư duy: vòng ngoài là vật → mỗi vật "được xét một lần" theo thứ tự cố định → không phân biệt thứ tự. Vòng ngoài là tổng → mỗi bước chọn *bước cuối cùng* → thứ tự có nghĩa.

## 4. Quy về subset sum

- **Partition equal subset:** tổng `S` chẵn và có tập con tổng `S/2`.
- **Target sum (gán `+`/`-`):** gọi `P` là tập gán `+`: `P - (S - P) = target` ⇒ `P = (S + target) / 2`; đếm số tập con có tổng `P` (kiểm tra `S + target` chẵn, `≥ 0`).
- **Last stone weight II:** chia đá thành hai nhóm, hiệu nhỏ nhất ⇒ tìm tập con có tổng lớn nhất ≤ `S/2`; đáp án `S - 2·best`.

## 5. Nhiều chiều và bounded

- **Nhiều ràng buộc** (ví dụ ≤ `m` số 0 và ≤ `n` số 1): thêm chiều `dp[a][b]`, duyệt cả hai giảm dần.
- **Bounded knapsack:** vật `(w, cnt)` tách thành các gói `1, 2, 4, …, phần dư` (mỗi gói là một vật 0/1 có `w·k` và `k` đơn vị) ⇒ `Σ log cnt` vật thay vì `Σ cnt`. Ví dụ `cnt = 13 → 1, 2, 4, 6`.

## 6. Dấu hiệu nhận biết
"chọn một số phần tử sao cho tổng/trọng lượng ≤ …", "chia thành hai nhóm bằng nhau", "gán dấu +/−", "đổi tiền", "đếm cách tạo tổng". Ràng buộc kiểu `n · W ≈ 10⁷` (giá trị `W` nhỏ — *pseudo-polynomial*).

## 7. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Mảng DP | `new Int32Array(W + 1)` / `Array.fill` | `[0] * (W + 1)` | `new int[W + 1]` |
| Duyệt giảm | `for (let j = W; j >= w; j--)` | `range(W, w - 1, -1)` | tương tự |
| Subset sum nhanh | `Uint8Array` hoặc bitset bằng `BigInt` | số nguyên lớn làm bitset: `bits \|= bits << x` (rất nhanh) | `BitSet` / `long[]` |
| Mod | `% 1_000_000_007` | tự nhiên | `long` rồi ép `int` |

## 8. Bẫy
1. Duyệt xuôi cho 0/1 ⇒ vật bị dùng nhiều lần (thành unbounded). Ngược lại duyệt giảm cho unbounded ⇒ thiếu đáp án.
2. Khởi tạo `dp[j] = 0` cho "đúng bằng `j`" ⇒ sai (cần `-∞`/`false`). `dp[j] = 0` chỉ đúng với "tổng ≤ `j`".
3. Đổi thứ tự hai vòng lặp khi đếm ⇒ đếm hoán vị thay vì tổ hợp.
4. Target sum: quên kiểm tra `|target| > S` và tính chẵn lẻ của `S + target`; mảng có số `0` (mỗi số 0 nhân đôi số cách).
5. Bộ nhớ 2D `n × W` khi chỉ cần 1D.
6. Nhầm *pseudo-polynomial* với đa thức: `W = 10⁹` thì DP theo sức chứa vô nghĩa.

## 9. Độ phức tạp
O(n · W) time, O(W) space. Bounded: O(W · Σ log cnt). Subset-sum bằng bitset: O(n · W / 64).
