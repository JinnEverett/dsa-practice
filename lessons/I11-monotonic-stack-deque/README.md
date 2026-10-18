# I11 · Monotonic stack / deque

## Sau buổi này bạn sẽ
- Dùng **stack đơn điệu** cho "phần tử lớn hơn / nhỏ hơn kế tiếp", histogram, hứng nước.
- Dùng **deque đơn điệu** cho max/min cửa sổ trượt.
- Giải thích được **vì sao O(n)** dù có vòng `while` lồng trong vòng `for` (amortized).
- Tư duy **đóng góp của từng phần tử** (sum of subarray minimums).

## 1. Ý tưởng: giữ stack luôn đơn điệu

Duyệt mảng, giữ một stack các chỉ số sao cho giá trị tương ứng **luôn tăng dần** hoặc **giảm dần** từ đáy lên đỉnh. Khi phần tử mới phá vỡ tính đơn điệu, **pop** tới khi hết vi phạm — và lúc pop chính là lúc ta *biết được đáp án* của phần tử bị pop.

```
nums = [2, 1, 2, 4, 3]     "lớn hơn kế tiếp": stack giữ chỉ số có giá trị GIẢM dần
i=0 (2): push                     stack: [2]
i=1 (1): 1 < 2 → push             stack: [2, 1]
i=2 (2): 2 > 1 → pop 1, ans[1]=2  stack: [2] → 2 > 2? không → push   [2, 2]
i=3 (4): 4 > 2 → pop, ans=4 ; 4 > 2 → pop, ans=4 ;                    [4]
i=4 (3): push                                                         [4, 3]
```

```ts
const stack = new Int32Array(n); let sp = 0;
for (let i = 0; i < n; i++) {
  while (sp > 0 && nums[stack[sp - 1]] < nums[i]) {   // nums[i] là "lớn hơn kế tiếp" của đỉnh
    ans[stack[--sp]] = nums[i];
  }
  stack[sp++] = i;
}
```

Chọn hướng đơn điệu: tìm **lớn hơn kế tiếp** → stack **giảm** dần; tìm **nhỏ hơn kế tiếp** → stack **tăng** dần.

## 2. Vì sao O(n)?

Vòng `while` lồng trong vòng `for` trông như O(n²), nhưng mỗi chỉ số **được push đúng một lần và pop tối đa một lần**. Tổng số lần pop trong cả thuật toán ≤ n, nên tổng công việc ≤ 2n = **O(n)** (phân tích *amortized*: chi phí trung bình mỗi bước ≤ hằng số, dù một bước có thể tốn nhiều). So với bản ngây thơ quét xa cho từng phần tử: với mảng giảm dần 10⁵ phần tử là ~5·10⁹ phép, còn bản stack chỉ ~2 ms (đo trên máy soạn; bản `O(n·k)` của ex05 vượt 300 ms và bị dừng).

## 3. Các khuôn

| Bài | Stack | Pop khi | Ý nghĩa của lúc pop |
|---|---|---|---|
| Next greater / daily temperatures | giảm | `nums[i] > top` | `i` là đáp án của `top` |
| Histogram | tăng | `h[i] <= h[top]` | `top` không mở rộng sang phải nữa: `width = i − (đáy mới) − 1` |
| Trap rain water | giảm | `h[i] > h[top]` | `top` là đáy vũng: trái = đáy mới của stack, phải = `i` |
| Sum of subarray mins | tăng, hai lượt | `>=` / `>` | khoảng cách tới phần tử nhỏ hơn bên trái / bên phải |
| Remove k digits | tăng | `d < top` và còn lượt xóa | xóa chữ số lớn đứng trước chữ số nhỏ hơn |
| Stock spanner | giảm, lưu (giá, span) | `top ≤ price` | cộng span của `top` vào span hiện tại |

**Đóng góp của từng phần tử.** Thay vì liệt kê O(n²) mảng con, hỏi: mỗi `arr[i]` là *min* của bao nhiêu mảng con? Bằng `(số điểm đầu có thể) × (số điểm cuối có thể)` = `left[i] × right[i]`, với `left`/`right` là khoảng cách tới phần tử nhỏ hơn gần nhất hai bên. Hai bên phải dùng **một nghiêm ngặt, một không** (`<` ở bên này, `≤` ở bên kia) để mảng con có nhiều phần tử bằng min chỉ bị đếm một lần.

## 4. Deque đơn điệu — max cửa sổ trượt

Cần max của mọi cửa sổ `k` phần tử. Giữ **deque các chỉ số** với giá trị giảm dần (đầu = max):
1. Pop **cuối** khi `nums[cuối] ≤ nums[i]` (không bao giờ thành max nữa: nhỏ hơn và cũ hơn `nums[i]`).
2. Push `i` vào cuối.
3. Pop **đầu** nếu `đầu ≤ i − k` (đã trượt ra khỏi cửa sổ).
4. Từ `i ≥ k − 1`: đáp án là `nums[đầu]`.

Mỗi chỉ số vào/ra deque tối đa một lần ⇒ O(n) (heap: O(n log n)). Trong TS dùng `Int32Array` + `head`, `tail` — **không** dùng `Array.shift()` (O(n)).

## 5. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Stack | `Int32Array` + `sp` / mảng `push/pop` | `list` | `ArrayDeque<Integer>` (`push/pop`) — **không** dùng `Stack` (legacy, đồng bộ) |
| Deque | `Int32Array` + `head/tail` | `collections.deque` | `ArrayDeque<Integer>` (`pollFirst/pollLast`) |
| Số lớn | `number` chính xác tới 2⁵³ ≈ 9·10¹⁵ | không tràn | `long` cho diện tích / tổng; ép kiểu **trước** khi nhân |
| Modulo 10⁹+7 | tích hai số ~10⁹ **vượt 2⁵³** → `BigInt` hoặc `mulMod` tách 16 bit | `%` bình thường | `(a % M) * (b % M) % M` với `long` |

## 6. Dấu hiệu nhận biết
"phần tử **lớn hơn / nhỏ hơn kế tiếp**", "bao nhiêu ngày chờ", "hình chữ nhật lớn nhất", "nước hứng được", "max/min của mọi cửa sổ", "tổng min/max của mọi mảng con", "chuỗi số nhỏ nhất sau khi xóa", "span".

## 7. Bẫy
1. Nhầm hướng đơn điệu (tăng hay giảm) và dấu so sánh (`<` hay `<=`) — dry-run với mảng có **giá trị bằng nhau**.
2. Lưu **giá trị** thay vì **chỉ số** vào stack (mất khoảng cách / không biết khi nào ra khỏi cửa sổ).
3. Quên sentinel cuối (histogram: thêm cột cao 0) hoặc quên xả stack.
4. `shift()` cho deque; tính lại `Math.max` mỗi cửa sổ (O(n·k)).
5. Mảng vòng (ex01): đi `2n` bước với `i % n`, chỉ push ở vòng đầu.
6. Tổng/diện tích tràn `int` (Java) — ex03, ex04 trả `long`.
7. **Tích mod trong TS vượt 2⁵³**: `arr[i] * left * right` (tới ~10¹⁹) mất chính xác — kết quả sai mà không báo lỗi (ex06).
8. Remove k digits: quên xóa ở **đuôi** và quên bỏ số 0 đứng đầu.

## 8. Độ phức tạp
Mọi bài: **O(n)** thời gian (amortized), O(n) bộ nhớ; stock spanner O(1) amortized mỗi lời gọi.
