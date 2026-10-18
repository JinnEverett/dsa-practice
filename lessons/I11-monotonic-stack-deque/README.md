# I11 · Monotonic stack / deque

## Sau buổi này bạn sẽ
- Nhận ra bài "**phần tử lớn hơn / nhỏ hơn kế tiếp**" và giải O(n) bằng **monotonic stack**.
- Giải thích được **vì sao O(n)** dù có vòng `while` lồng trong vòng `for` (amortized).
- Dùng **monotonic deque** cho max/min của **cửa sổ trượt**.
- Dùng kỹ thuật **đóng góp của từng phần tử** (sum of subarray mins, diện tích histogram).

## 1. Ý tưởng: giữ stack "có thứ tự", vứt bỏ những gì không bao giờ còn hữu ích

Bài toán gốc: với mỗi `nums[i]`, tìm phần tử **đầu tiên bên phải lớn hơn nó**. Thay vì quét tới cho từng `i` (O(n²)), ta duyệt trái → phải và giữ một stack các chỉ số **chưa tìm được câu trả lời**. Các phần tử đó có giá trị **giảm dần** từ đáy lên đỉnh (vì nếu có phần tử trong stack nhỏ hơn phần tử ngay dưới nó thì nó đã được "giải quyết" rồi).

```
nums = [2, 1, 2, 4, 3]            stack lưu chỉ số (hiển thị giá trị), đáy → đỉnh

i=0  v=2   []            → push        [2]
i=1  v=1   [2]  2<1? không → push      [2,1]
i=2  v=2   [2,1] 1<2 ✓ pop 1: nge[1]=2   rồi 2<2? không → push   [2,2]
i=3  v=4   [2,2] 2<4 ✓ pop: nge=4 (cả hai)               → push   [4]
i=4  v=3   [4]   4<3? không → push     [4,3]
hết: còn lại [4,3] → không có phần tử lớn hơn → -1
```

Template (stack chỉ số, **giảm dần** → tìm "lớn hơn kế tiếp"):

```ts
const st: number[] = [];
for (let i = 0; i < n; i++) {
  while (st.length && a[st[st.length - 1]] < a[i]) {   // a[i] là "lớn hơn kế tiếp" của đỉnh
    const j = st.pop()!;
    ans[j] = a[i];                                      // hoặc i - j (khoảng cách)
  }
  st.push(i);
}
```
Đổi chiều bất đẳng thức (`>`) và stack **tăng dần** → "nhỏ hơn kế tiếp". Duyệt phải → trái → "lớn hơn **trước** đó".

## 2. Vì sao O(n)?
Vòng `while` nằm trong `for`, nhưng mỗi chỉ số **vào stack đúng 1 lần và ra tối đa 1 lần**. Tổng số lần `pop` ≤ n, nên tổng công việc ≤ 2n. Đây là phân tích **amortized**: một bước `push` có thể kéo theo nhiều `pop`, nhưng "trung bình" mỗi phần tử tốn O(1).

## 3. Mảng vòng và sentinel
- **Mảng vòng:** duyệt `i = 0 .. 2n−1`, lấy `a[i % n]`, chỉ `push` ở lượt đầu (`i < n`).
- **Sentinel:** thêm phần tử "giả" ở cuối (cột cao 0 cho histogram, `−1` hay `0` tùy bài) để ép xả hết stack mà không cần vòng lặp riêng.

## 4. Đóng góp của từng phần tử (histogram, sum of mins)
Khi `pop` đỉnh `j` vì gặp `i`, ta biết **cả hai biên** của `j`: bên phải là `i` (phần tử đầu tiên "phá" thứ tự), bên trái là phần tử nằm ngay dưới `j` trong stack. Từ đó:
- **Histogram:** cột `j` là cột thấp nhất của hình chữ nhật rộng `i − left − 1`, diện tích `h[j] · (i − left − 1)`.
- **Sum of subarray mins:** `a[j]` là min của `(j − left) · (i − j)` mảng con.
- **Trapping rain water:** mỗi lần pop một "đáy", cộng nước của một **tầng ngang** giữa thành trái và thành phải.

Khi có giá trị **bằng nhau**, một bên dùng `<` chặt, bên kia `<=` để mỗi mảng con chỉ được tính cho **đúng một** phần tử.

```
heights = [2, 1, 5, 6, 2, 3]   (thêm sentinel 0 ở cuối)
stack tăng dần (chỉ số): ... [1,2,3] gặp cột 2 (i=4)
  pop cột 6 (j=3): left = 2 → rộng 4-2-1 = 1 → 6·1 = 6
  pop cột 5 (j=2): left = 1 → rộng 4-1-1 = 2 → 5·2 = 10   ← đáp án
```

## 5. Monotonic deque cho cửa sổ trượt
Cần max của mọi cửa sổ độ dài `k`. Giữ **deque chỉ số**, giá trị **giảm dần** từ đầu đến cuối; **đầu deque luôn là max**.

```
thêm i:   while (cuối deque có a[cuối] <= a[i]) pop cuối   ← kẻ cũ nhỏ hơn và già hơn: không bao giờ làm max nữa
          push i vào cuối
hết hạn:  nếu đầu deque <= i - k  → pop đầu                ← đã trượt ra ngoài cửa sổ
đáp án:   a[đầu deque]  (khi i >= k - 1)
```
Mỗi chỉ số vào/ra deque ≤ 1 lần → O(n), bất kể `k`.

## 6. Dấu hiệu nhận biết
"phần tử lớn/nhỏ hơn **gần nhất** bên trái/phải", "bao nhiêu ngày/phần tử liên tiếp", "hình chữ nhật/vùng lớn nhất mà phần tử này là min/max", "max/min của mọi cửa sổ", "xóa k phần tử để dãy nhỏ nhất theo thứ tự từ điển".

## 7. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Stack | `Array` (`push`/`pop`) | `list` (`append`/`pop`) | `ArrayDeque<Integer>` (`push`/`pop`/`peek`) — **không** dùng `Stack` |
| Deque | mảng + con trỏ `head`; **không** dùng `shift()` (O(n)) | `collections.deque` (`popleft` O(1)); **không** `list.pop(0)` | `ArrayDeque` (`pollFirst`/`pollLast`/`peekFirst`) |
| Nhân số lớn | `(a * b) % MOD` có thể vượt 2⁵³ → mod từng bước | int vô hạn | ép `long` **trước** khi nhân |

## 8. Bẫy
1. `<` vs `<=` khi pop: sai ở giá trị bằng nhau (đếm trùng hoặc bỏ sót).
2. Stack chứa **giá trị** nhưng cần **khoảng cách** → lưu **chỉ số** (hoặc cặp).
3. Quên xả stack ở cuối (cần sentinel hoặc vòng xử lý nốt).
4. Dùng `Array.shift()` / `list.pop(0)` làm deque → O(n) mỗi lần, cả thuật toán thành O(nk) hoặc O(n²).
5. Tràn số: đếm mảng con ~ n²/4 vượt `int`; nhân với giá trị rồi mới mod có thể vượt 2⁵³ (TS) hoặc 2⁶³ (Java).

## 9. Độ phức tạp

| Bài | Thời gian | Bộ nhớ |
|---|---|---|
| Next greater / daily temperatures / histogram / trap (stack) | O(n) | O(n) |
| Sliding window max (deque) | O(n) | O(k) |
| Cách ngây thơ: quét tới cho từng phần tử | O(n²) | O(1) |
| Cách ngây thơ: duyệt từng cửa sổ | O(n·k) | O(1) |
