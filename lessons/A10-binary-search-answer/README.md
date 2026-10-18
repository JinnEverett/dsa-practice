# A10 · Binary search on answer

## Sau buổi này bạn sẽ
- Nhận ra bài "**tối thiểu hóa cái lớn nhất / tối đa hóa cái nhỏ nhất**" và đưa về binary search trên **đáp án**.
- Viết hàm kiểm tra **đơn điệu** `ok(x)` (thường là một vòng **greedy** O(n)).
- Chọn đúng cận `lo/hi` và đúng dạng vòng lặp (tìm giá trị đúng đầu tiên / cuối cùng).
- Binary search trên **số thực** bằng số vòng cố định, và tránh tràn số khi tính `mid`/tổng.

## 1. Ý tưởng

Thay vì *tìm* đáp án, ta **đoán** đáp án `x` rồi **kiểm tra** "với `x` có làm được không?". Nếu tính chất này đơn điệu theo `x`, binary search tìm ranh giới trong `log(miền)` lần.

```
x:      1  2  3  4  5  6  7 ...
ok(x):  ✗  ✗  ✗  ✓  ✓  ✓  ✓        ← "tối thiểu x để làm được": tìm ✓ đầu tiên
```
Tổng: O(n · log(miền giá trị)). Miền 10⁹ ⇒ ~30 lần kiểm tra — thay vì thử từng giá trị.

## 2. Các bước

1. **Đáp án là gì, nằm trong khoảng nào?** `[lo, hi]` — cận *chắc chắn* chứa đáp án (vd. tốc độ ăn `[1, max(piles)]`; sức tải `[max(w), sum(w)]`).
2. **Viết `ok(x)`** bằng greedy; chứng minh đơn điệu ("x thỏa thì x + 1 cũng thỏa" hoặc ngược lại).
3. **Chọn khuôn** (hai khuôn dưới) rồi thử tay trên ví dụ nhỏ (xs).

```ts
// ✓ đầu tiên (nhỏ nhất x để ok):                 // ✓ cuối cùng (lớn nhất x để ok):
let lo = L, hi = H;                               let lo = L, hi = H;
while (lo < hi) {                                 while (lo < hi) {
  const mid = lo + Math.floor((hi - lo) / 2);       const mid = lo + Math.floor((hi - lo + 1) / 2);   // +1: làm tròn LÊN
  if (ok(mid)) hi = mid; else lo = mid + 1;         if (ok(mid)) lo = mid; else hi = mid - 1;
}                                                 }
return lo;                                        return lo;
```
Dạng "lớn nhất" mà quên `+1` ⇒ **lặp vô hạn** (`lo = mid` không tiến).

## 3. Bảng bài mẫu → hàm kiểm tra

| Bài | Đáp án `x` | `ok(x)` (greedy) | Hướng |
|---|---|---|---|
| Koko ăn chuối | tốc độ | Σ⌈pile/x⌉ ≤ h | nhỏ nhất |
| Tàu chở hàng | sức tải | chia thành ≤ D ngày, mỗi ngày ≤ x | nhỏ nhất |
| Chia mảng k phần | tổng lớn nhất của một phần | số phần cần ≤ k | nhỏ nhất |
| Hoa nở | ngày | đếm bó k hoa liên tiếp ≥ m | nhỏ nhất |
| Router xa nhau | khoảng cách tối thiểu | đặt tham lam được ≥ m | **lớn nhất** |
| Bảng nhân | giá trị | đếm số ô ≤ x ≥ k | nhỏ nhất |
| Gas station | khoảng cách tối đa | số trạm cần thêm ≤ k | nhỏ nhất (thực) |

Nếu `ok` cần đếm "bao nhiêu thứ thỏa", ghép với **greedy**: luôn làm việc "sớm nhất có thể" (đặt router xa nhất có thể về bên trái, gom hàng vào ngày hiện tại tới khi đầy...).

## 4. Binary search số thực

Không có "bước nguyên". Hai cách: lặp **cố định số vòng** (100 vòng cho `double` — mỗi vòng giảm đôi khoảng, 100 vòng thu về cỡ 1e-30 × miền, tới giới hạn độ chính xác máy), hoặc `while (hi − lo > eps)`. Không dùng `==` trên số thực. Kiểm tra `ok(mid)` có thể sai nhẹ ở sát ranh giới nhưng sai số bị chặn bởi `eps`.

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| `mid` | `lo + Math.floor((hi - lo) / 2)` | `lo + (hi - lo) // 2` | `lo + (hi - lo) / 2` (tránh `(lo + hi)` tràn `int`) |
| Tổng/đếm lớn | double chính xác tới 2⁵³ | vô hạn | **`long`**: Σ⌈pile/x⌉ tới 10¹⁴; `m * k` tới 10¹¹ |
| Làm tròn lên | `Math.ceil(p / x)` | `-(-p // x)` | `(p + x - 1) / x` (dùng `long` nếu `p + x` có thể tràn) |
| Số thực | `number` | `float` | `double` |

## 6. Bẫy
1. **Hàm `ok` không đơn điệu** ⇒ binary search cho kết quả vô nghĩa. Chứng minh trước.
2. Cận sai: `lo` quá lớn (bỏ sót đáp án) hoặc `hi` quá nhỏ.
3. Khuôn "lớn nhất" thiếu `+1` ở `mid` ⇒ vòng lặp vô hạn.
4. Java: `(lo + hi) / 2` tràn `int`; `m * k` tràn; `Σ ceil` tràn.
5. Early-exit trong `ok` (ngừng khi đã vượt ngưỡng) — vừa nhanh vừa tránh tràn.
6. Số thực: so sánh `==`, hoặc lặp quá ít vòng.
7. Quên rằng một số bài có **đáp án không tồn tại** (`minDays` → `-1`): kiểm tra điều kiện cần trước.

## 7. Độ phức tạp
O(n · log(miền giá trị)) time (n = chi phí một lần `ok`), O(1) bộ nhớ phụ. Với `n = 10⁵`, miền `10⁹`: ~3·10⁶ phép.
