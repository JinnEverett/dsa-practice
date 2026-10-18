# R09 · Diff, dedup & stream

## Sau buổi này bạn sẽ
- Tính khoảng cách **diff** bằng thuật toán Myers O((N+M)·D) thay vì DP O(N·M).
- Dedup trong stream với bộ nhớ chặn (LRU), biết đánh đổi so với Bloom filter.
- Tính **percentile trên cửa sổ thời gian** bằng Fenwick tree (thay vì sort mỗi lần).
- Gom log thành **phiên** (sessionize) và **lấy mẫu** log bằng reservoir sampling.

## 1. Diff = đường đi ngắn nhất trên lưới sửa đổi
Với hai file `a` (N dòng) và `b` (M dòng), diff tối thiểu = số dòng thêm + xóa ít nhất `D = N + M − 2·LCS`. Bảng LCS đầy đủ tốn O(N·M) — hai file 10⁵ dòng là 10¹⁰ ô.

**Myers (1986):** hai file thực tế *gần giống nhau* (D nhỏ). Duyệt theo số lần sửa `d = 0, 1, 2, …`; trên mỗi đường chéo `k = x − y` giữ `x` xa nhất đạt được với đúng `d` lần sửa, rồi trượt miễn phí khi hai dòng bằng nhau. `d` đầu tiên chạm góc `(N, M)` là `D`. Chi phí O((N+M)·D). `git diff` mặc định dùng Myers.

Đo thật (hai file `n` dòng, ~50 chỉnh sửa → D ≈ 60–67; máy soạn):

| n | D | Myers | DP LCS (hai hàng) |
|---|---|---|---|
| 1 000 | 67 | 0,31 ms | 8 ms |
| 5 000 | 60 | 0,12 ms | 117 ms |
| 20 000 | 66 | 0,24 ms | 1 429 ms |
| 100 000 | 64 | 0,95 ms | không chạy (ngoại suy theo n²: ≈ 36 s) |

Bài này chỉ tính **D**; để in diff đầy đủ phải lưu `V` ở từng `d` rồi truy ngược (hoặc biến thể linear-space).

## 2. Dedup trong stream
"Event này xử lý chưa?" khi id đến *at-least-once* (retry, replay).

| Cách | Bộ nhớ | Sai số |
|---|---|---|
| `Set` mọi id | O(n) — tăng mãi | không |
| **LRU bounded** (ex02) | O(capacity) | id bị đuổi sẽ bị coi là mới → có thể xử lý trùng |
| Bloom filter (R07) | O(n) bit | sai dương: **mất event thật** |

Chọn `capacity` ≥ số id xuất hiện trong khoảng thời gian trùng lặp tối đa (cửa sổ retry). Thực tế thường: LRU/Bloom làm bước lọc nhanh, kho bền (DB unique key) làm chốt.

## 3. Percentile trên cửa sổ trượt
```
 cửa sổ (t − 60000, t]:  queue mẫu (t, latency)  +  Fenwick đếm theo giá trị latency
 p95 = giá trị nhỏ nhất v có ≥ ⌈0,95·cnt⌉ mẫu ≤ v        rank = ⌊(95·cnt + 99)/100⌋
```
Sort cả cửa sổ mỗi lần hỏi là O(w log w). Với latency nguyên trong miền nhỏ, đếm theo giá trị + Fenwick cho `add`/`p95` O(log V). Miền liên tục/rộng: t-digest hoặc HDR histogram (bucket theo thang log) — xấp xỉ nhưng bộ nhớ cố định.
Bẫy: dùng số thực `0.95 * cnt` rồi `ceil` (sai ở biên, ví dụ cnt = 20); dùng toán số nguyên.

## 4. Sessionize
Log đã sắp theo thời gian; mỗi user có phiên hiện tại. Sự kiện mới của user mở **phiên mới** khi cách sự kiện trước *của chính user đó* **hơn** `gap` (đúng bằng `gap` vẫn cùng phiên). Một lượt O(n) với `Map` — không sort lại theo user.

## 5. Reservoir sampling (Algorithm R)
Lấy `k` dòng ngẫu nhiên đều từ log **không biết trước độ dài**, một lượt, O(k) bộ nhớ:
```
 res = k dòng đầu
 dòng i (0-based, i ≥ k): j = random trong [0, i]; nếu j < k: res[j] = dòng i
```
Xác suất mỗi dòng nằm trong mẫu cuối = k/n (đúng, không xấp xỉ). RNG trong bài là LCG đặc tả sẵn để kết quả giống nhau ở mọi ngôn ngữ — chú ý tràn khi nhân `state · 1103515245` (TS: `Math.imul`; Java: `long` + mask; Python: số lớn).

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| LRU dedup | `Map` (xóa + thêm) | `OrderedDict` | `LinkedHashMap(…, true)` |
| Fenwick | `Int32Array` | list | `int[]` |
| LCG 31 bit | `(Math.imul(s, 1103515245) + 12345) & 0x7fffffff` | `(s * 1103515245 + 12345) % 2**31` | `(s * 1103515245L + 12345L) & 0x7fffffffL` |
| So dòng | `===` | `==` | `String.equals` (không `==`) |

## 7. Bẫy
1. Myers: chỉ số `V` âm (dùng offset); quên trượt snake; không dừng ngay khi chạm đích.
2. Dedup: `seen` khi trúng không làm mới thứ tự; `capacity` nhỏ hơn cửa sổ retry.
3. p95: dùng float; không dọn mẫu hết hạn khi gọi `p95`.
4. Sessionize: `>=` thay `>`; so với sự kiện liền trước trong *toàn log*.
5. Reservoir: `nextInt(i)` thay vì `nextInt(i + 1)`; tràn `int` khi nhân.

## 8. Độ phức tạp
| | time | space |
|---|---|---|
| Myers | O((N+M)·D) | O(N+M) |
| Dedup seen | O(1) | O(capacity) |
| P95 add / p95 | O(log V) | O(w + V) |
| sessionize | O(n) | O(#user) |
| sampleLog | O(n) | O(k) |

## 9. Câu hỏi quy mô
Diff hai file log 10⁶ dòng khác nhau ~200 dòng: ước lượng số phép của DP LCS và của Myers. Rồi `bench` ex01 (`--scales s,m,l`): số mũ ước lượng gần 1 hay gần 2? Điều gì xảy ra khi hai file khác nhau gần như hoàn toàn (D ≈ N + M)?
