# A01 · DP I: nền tảng

## Sau buổi này bạn sẽ
- Nhận ra bài **DP**: *overlapping subproblems* + *optimal substructure*.
- Giải theo 4 bước **state → transition → base case → thứ tự tính**, và viết được **cả memo (top-down) lẫn tabulation (bottom-up)**.
- Nén bộ nhớ O(n) → O(1) khi transition chỉ nhìn vài ô trước.
- Biết khi nào DP trên **chỉ số** (n = 10⁵) thay vì trên **giá trị** (miền 10⁹).

## 1. Vì sao cần DP

`fib(n) = fib(n-1) + fib(n-2)` gọi đệ quy thuần: cùng một bài con bị tính đi tính lại → **O(2ⁿ)**.

```
              f(5)
            /      \
         f(4)       f(3)        f(3) xuất hiện 2 lần, f(2) 3 lần...
        /    \      /   \
     f(3)   f(2)  f(2)  f(1)
```

Chỉ có n+1 bài con *khác nhau* → lưu kết quả lại thì còn **O(n)**. Đó là toàn bộ ý tưởng của DP.

Hai điều kiện:
1. **Overlapping subproblems** — bài con lặp lại (nếu không lặp, đó là chia để trị, không cần nhớ).
2. **Optimal substructure** — đáp án bài lớn dựng được từ đáp án tối ưu của bài con.

## 2. Bốn bước

| Bước | Câu hỏi | Ví dụ: house robber |
|---|---|---|
| 1. State | `dp[i]` *nghĩa là gì*? (viết thành câu) | `dp[i]` = tiền tối đa khi chỉ xét nhà `0..i` |
| 2. Transition | `dp[i]` tính từ ô nào? | `dp[i] = max(dp[i-1], dp[i-2] + a[i])` |
| 3. Base case | ô nhỏ nhất là gì? | `dp[-1] = dp[-2] = 0` |
| 4. Thứ tự | duyệt thế nào để ô cần dùng đã có? | `i` tăng dần |

Mẹo: **viết state thành một câu tiếng Việt trước khi viết code**. Phần lớn DP sai là do state mơ hồ.

## 3. Memo vs tabulation

```ts
// top-down (memo): viết đệ quy tự nhiên, thêm bảng nhớ
function rob(a: number[]): number {
  const memo = new Array<number>(a.length).fill(-1);
  const f = (i: number): number => {
    if (i < 0) return 0;
    if (memo[i] >= 0) return memo[i];
    return (memo[i] = Math.max(f(i - 1), f(i - 2) + a[i]));
  };
  return f(a.length - 1);
}

// bottom-up (tabulation): vòng for, không đệ quy, nén còn 2 biến
function rob2(a: number[]): number {
  let prev2 = 0, prev1 = 0;                       // dp[i-2], dp[i-1]
  for (const x of a) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)];
  return prev1;
}
```

| | Memo (top-down) | Tabulation (bottom-up) |
|---|---|---|
| Ưu | dễ viết từ công thức; chỉ tính ô cần | không tràn stack; nén bộ nhớ dễ; nhanh hơn (không gọi hàm) |
| Nhược | **tràn stack** ở độ sâu ~10⁴ (TS), chậm hơn | phải tự tìm thứ tự duyệt |
| Khi nào | n nhỏ / state thưa / khó thấy thứ tự | n lớn, state dày |

> Với n = 10⁵ mà memo đệ quy sâu n tầng: TS tràn stack. Hoặc đổi sang bottom-up, hoặc đừng dùng đệ quy.

## 4. Nén bộ nhớ

Nếu `dp[i]` chỉ phụ thuộc `dp[i-1..i-k]` thì giữ k biến (hoặc cửa sổ trượt). `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]` → 3 biến. Tổng `dp[i-1] + … + dp[i-k]` với k lớn → giữ **tổng cửa sổ** và cập nhật `+dp[i-1] − dp[i-k-1]` (O(1) thay vì O(k)).

## 5. DP trên chỉ số, không trên giá trị

Khi giá trị tới 10⁹ (ngày, tọa độ), **không** dựng mảng theo giá trị. State vẫn là chỉ số `i` của phần tử đã sort; bước nhảy dùng **two pointers / binary search** (xem `mincostTickets`, `jobScheduling`).

## 6. Dấu hiệu nhận biết
"đếm số cách", "tối thiểu/tối đa chi phí", "có thể hay không" + mỗi bước chọn một trong vài lựa chọn, và lựa chọn trước ảnh hưởng gọn tới lựa chọn sau (nhà liền kề, bậc thang, khoảng thời gian đã dùng).

## 7. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Memo | `Map`/mảng + đệ quy (stack ~10⁴) | `@functools.cache` (recursionlimit ≈ 12 000) | mảng `long[]`/`int[]` + đệ quy |
| Modulo | `(a + b) % M` an toàn vì < 2⁵³ | không tràn | `(int)((a + b) % M)` với `long`; `int + int` tràn trước khi `%` |
| Nhân mod | cần `BigInt` hoặc tách nửa (a·b > 2⁵³) | không tràn | `long` đủ (< 2⁶³ khi a,b < 10⁹+7) |
| Mảng 2 chiều | `Array.from` — đừng `fill([])` (chung tham chiếu) | `[[0]*m for _ in range(n)]` — đừng `[[0]*m]*n` | `new int[n][m]` |

## 8. Bẫy
1. State mơ hồ → transition sai. Viết ra câu "dp[i] là ... khi ... ".
2. Quên base case (`n = 0`, `n = 1`, mảng rỗng).
3. Khởi tạo `Infinity` rồi cộng thêm → `Infinity`/`NaN` lan; kiểm tra trước khi dùng.
4. Memo bằng `if (memo[i])` khi đáp án hợp lệ có thể là `0` → dùng `-1`/`undefined`.
5. Nén bộ nhớ nhưng ghi đè ô còn cần (thứ tự cập nhật hai biến).
6. `% M` quên ở một vế → tràn `Number.MAX_SAFE_INTEGER` hoặc `int` Java.

## 9. Độ phức tạp
Số state × chi phí mỗi transition. `rob`: n × O(1). `countWaysK` thô: n × O(k); với tổng cửa sổ: n × O(1). Bộ nhớ: số state, nén được còn số "ô trước" mà transition cần.
