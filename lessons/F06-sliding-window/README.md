# F06 · Sliding window

## Sau buổi này bạn sẽ
- Giải các bài "đoạn con **liên tiếp** thỏa điều kiện" trong O(n) thay vì O(n²).
- Viết hai template: **cửa sổ cố định** và **cửa sổ co giãn** (dài nhất / ngắn nhất).
- Duy trì trạng thái của cửa sổ (tổng, bảng đếm, số phần tử khác nhau) khi thêm/bớt một phần tử.
- Giải thích được vì sao có `while` lồng trong `for` mà vẫn là O(n).

## 1. Ý tưởng

Brute force xét mọi đoạn `[l, r]` → O(n²) đoạn, mỗi đoạn tính lại từ đầu. Sliding window **tái sử dụng** kết quả: đoạn mới chỉ khác đoạn cũ một phần tử ở mỗi đầu.

```
nums = [2, 1, 5, 1, 3, 2], k = 3       cửa sổ cố định
        [2  1  5] 1  3  2     sum = 8
         2 [1  5  1] 3  2     sum = 8 − 2 + 1 = 7    ← bớt phần tử rời đi, thêm phần tử mới
         2  1 [5  1  3] 2     sum = 7 − 1 + 3 = 9
```

## 2. Hai template

```ts
// (A) Cửa sổ cố định kích thước k
let sum = 0, best = -Infinity;
for (let r = 0; r < n; r++) {
  sum += nums[r];                    // thêm phần tử vào
  if (r >= k) sum -= nums[r - k];    // bỏ phần tử rời khỏi cửa sổ
  if (r >= k - 1) best = Math.max(best, sum);
}

// (B) Cửa sổ co giãn
let l = 0;
for (let r = 0; r < n; r++) {
  add(nums[r]);                                  // mở rộng bên phải
  while (/* cửa sổ [l, r] KHÔNG hợp lệ */) {      // co bên trái tới khi hợp lệ lại
    remove(nums[l]);
    l++;
  }
  best = Math.max(best, r - l + 1);              // "dài nhất": cập nhật SAU khi hợp lệ
}
```

**"Ngắn nhất thỏa điều kiện"** đảo vai: trong `while (cửa sổ HỢP LỆ)` thì cập nhật đáp án rồi mới co.

```
Dài nhất không lặp ký tự: "abcabcbb"
r=0..2  [abc]      hợp lệ, len 3
r=3     [abca]     'a' lặp → co: l=1 → [bca] hợp lệ
r=4     [bcab]     'b' lặp → co: l=2 → [cab]
...                đáp án 3
```

## 3. Vì sao O(n)?
`r` tăng n lần. `l` **chỉ tăng, không bao giờ lùi**, tổng cộng tối đa n lần. Tổng số bước ≤ 2n — dù có `while` lồng trong `for` (giống b09 ở F01).

## 4. Điều kiện để dùng được
Cửa sổ co giãn cần tính **đơn điệu**: nếu `[l, r]` không hợp lệ thì mọi đoạn rộng hơn chứa nó cũng không hợp lệ (vd. "có ký tự lặp", "tổng > target với số **không âm**").
- Có số **âm** → tổng không đơn điệu → sliding window sai, dùng prefix sum + hash map (F07).

## 5. Trạng thái cửa sổ hay gặp

| Điều kiện | Trạng thái | Kiểm tra |
|---|---|---|
| tổng / trung bình | `sum` | O(1) |
| không ký tự lặp | `Map<char, count>` hoặc vị trí xuất hiện cuối | O(1) |
| tối đa k giá trị khác nhau | `Map` đếm + `distinct` | O(1) |
| là hoán vị của p | mảng đếm 26 + số ký tự còn thiếu `need` | O(1) |
| số phần tử 0 ≤ k | đếm số 0 | O(1) |

Mẹo cho "hoán vị / chứa đủ ký tự": giữ biến `missing` (số ký tự còn thiếu) thay vì so cả mảng đếm mỗi bước.

## 6. Dấu hiệu nhận biết
"Đoạn con / chuỗi con **liên tiếp**", "dài nhất / ngắn nhất / bao nhiêu đoạn", "trong k phần tử", "trong cửa sổ thời gian", với dữ liệu không âm hoặc điều kiện đơn điệu.

## 7. Bẫy
1. Cập nhật đáp án ở sai chỗ (trước khi co → đếm cả cửa sổ không hợp lệ).
2. Quên bỏ phần tử khỏi Map khi đếm về 0 → `map.size` sai số giá trị khác nhau.
3. Áp dụng cho mảng có số âm.
4. Off-by-one về độ dài: `r − l + 1`.
5. Java: tổng cửa sổ có thể vượt `int` → `long`.

## 8. Độ phức tạp
O(n) time; bộ nhớ O(1) hoặc O(σ) cho bảng đếm (σ = số giá trị khác nhau trong cửa sổ).
