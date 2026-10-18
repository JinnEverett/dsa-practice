# A03 · DP III: 2D & string

## Sau buổi này bạn sẽ
- Dựng bảng DP 2 chiều: **lưới** (unique paths, min path sum) và **hai chuỗi** (LCS, edit distance).
- DP trên **một chuỗi theo đoạn** (longest palindromic subsequence) và **mở rộng quanh tâm** (palindromic substring).
- **Truy vết** (reconstruct) lời giải từ bảng DP — nền tảng của bài `diff`.
- Nén bảng 2D còn 1 hàng (rolling array) và hiểu ràng buộc thứ tự duyệt.

## 1. Lưới

`dp[r][c]` = đáp án để tới ô `(r, c)`; chỉ phụ thuộc ô trên và ô trái.
```
dp[r][c] = dp[r-1][c] + dp[r][c-1]            (đếm đường)
dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])   (chi phí nhỏ nhất)
```
Chướng ngại vật: `dp[r][c] = 0` nếu ô bị chặn. Nén: một hàng `row[c]` — trước khi ghi đè, `row[c]` đang là `dp[r-1][c]`, còn `row[c-1]` đã là `dp[r][c-1]`.

## 2. Hai chuỗi: LCS và edit distance

State: `dp[i][j]` = đáp án cho `a[0..i)` và `b[0..j)`.

```
LCS:   a[i-1] == b[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1])

Edit:  a[i-1] == b[j-1] ? dp[i-1][j-1]
                        : 1 + min(dp[i-1][j-1]   // thay
                                , dp[i-1][j]     // xóa a[i-1]
                                , dp[i][j-1])    // chèn b[j-1]
Base:  dp[i][0] = i, dp[0][j] = j (edit);  dp[i][0] = dp[0][j] = 0 (LCS)
```
```
       ""  r  o  s       dp[i][j] của horse → ros
  ""    0  1  2  3
  h     1  1  2  3
  o     2  2  1  2
  r     3  2  2  2
  s     4  3  3  2
  e     5  4  4  3   ⇒ 3
```
Mỗi ô chỉ nhìn 3 ô lân cận → O(|a|·|b|) time, nén được còn O(min) bộ nhớ.

## 3. Palindrome

- **Subsequence** (không cần liên tiếp): `dp[i][j]` = LPS của `s[i..j]`: `s[i]==s[j] ? dp[i+1][j-1]+2 : max(dp[i+1][j], dp[i][j-1])`. Duyệt `i` giảm, `j` tăng.
- **Substring** (liên tiếp): mở rộng quanh 2n-1 tâm — O(n²) time, O(1) bộ nhớ, đơn giản hơn bảng `isPal[i][j]`. (Manacher O(n) ở A09.)

## 4. Truy vết (reconstruct)

Bảng DP cho **giá trị** tối ưu; để lấy **lời giải**, đi lại từ ô đích (hoặc ô đầu với bảng "suffix") và ở mỗi ô chọn nước đi đã dẫn tới giá trị đó.
```ts
// LCS dạng suffix: lcs[i][j] = LCS của a[i..], b[j..]; đi từ (0,0):
while (i < n && j < m) {
  if (a[i] === b[j]) { out.push(a[i]); i++; j++; }
  else if (lcs[i+1][j] >= lcs[i][j+1]) i++; else j++;
}
```
Nếu có nhiều đường tối ưu, **quy tắc chọn khi hòa phải được đặc tả** (xem `diffLines`).

## 5. Dấu hiệu nhận biết
"hai chuỗi/hai dãy, độ giống nhau, số thao tác để biến đổi", "đi trên lưới chỉ phải/xuống", "đoạn `[i, j]` của một chuỗi" (palindrome, interleave).

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Bảng 2D | `Array.from({length:n+1}, () => new Array(m+1).fill(0))` — **không** `fill([])` | `[[0]*(m+1) for _ in range(n+1)]` — **không** `[[0]*(m+1)]*(n+1)` | `new int[n+1][m+1]` |
| Bộ nhớ lớn | `Int32Array` nhanh hơn mảng thường | list of list nặng (~30× chậm hơn TS) | `int[][]` ổn |
| Chuỗi | `s[i]`, `s.charCodeAt(i)` | `s[i]` | `s.charAt(i)` |
| Đệ quy + memo | stack ~10⁴ tầng | `@cache` + recursionlimit | cẩn thận `StackOverflowError` |

## 7. Bẫy
1. Lệch chỉ số: bảng kích thước `(n+1) × (m+1)`, ký tự thứ `i` là `a[i-1]`.
2. `fill([])`/`[[0]*m]*n` làm các hàng dùng chung một mảng.
3. Rolling array: ghi đè `dp[i-1][j-1]` trước khi dùng — giữ `prev` (ô chéo) trong biến tạm.
4. Quên base case hàng/cột 0 của edit distance (không phải 0).
5. LCS đệ quy không memo: O(2^(n+m)).
6. Bảng `isPal` cho substring tốn O(n²) bộ nhớ; expand-around-center không cần.

## 8. Độ phức tạp
Lưới: O(R·C) · LCS/Edit/Interleave: O(n·m) time, O(min(n,m)) space nếu chỉ cần giá trị (truy vết cần cả bảng) · LPS: O(n²) · Palindrome substring: O(n²).
