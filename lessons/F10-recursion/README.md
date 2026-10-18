# F10 · Recursion

## Sau buổi này bạn sẽ
- Viết hàm đệ quy đúng: **base case** + **bước đệ quy tiến gần base case**.
- Vẽ **cây đệ quy** để tính độ phức tạp thời gian và bộ nhớ (call stack).
- Dùng **memoization** biến O(2ⁿ) thành O(n).
- Nhận ra khi nào đệ quy sẽ **tràn stack** và chuyển sang vòng lặp + stack tự quản.

## 1. Khung một hàm đệ quy

```ts
function f(problem) {
  if (/* đủ nhỏ để trả lời ngay */) return /* base case */;
  const sub = f(/* bài toán NHỎ HƠN */);        // tin rằng f đúng với bài nhỏ hơn
  return /* kết hợp sub thành đáp án */;
}
```
Cách nghĩ ("leap of faith"): **giả sử** hàm đã đúng cho mọi input nhỏ hơn, chỉ cần (1) base case đúng, (2) từ đáp án con dựng được đáp án lớn.

## 2. Call stack

```
fact(3)
 └─ 3 * fact(2)                 stack: [fact(3)]
         └─ 2 * fact(1)          stack: [fact(3), fact(2)]
                 └─ 1            stack: [fact(3), fact(2), fact(1)]  ← sâu nhất
         ← 2
 ← 6
```
Mỗi lời gọi chưa xong chiếm một **frame** trên stack. Bộ nhớ = O(độ sâu).

| Ngôn ngữ | Độ sâu tối đa (xấp xỉ) | Khi vượt |
|---|---|---|
| TS (Node) | ~10⁴ | `RangeError: Maximum call stack size exceeded` |
| Python | 1 000 mặc định (runner của lộ trình đặt ~12 000) | `RecursionError` |
| Java | ~10⁴–10⁵ tùy kích thước frame (stack 512KB–1MB) | `StackOverflowError` |

Input "lệch" (danh sách liên kết dài, cây thoái hóa thành đường thẳng, dữ liệu danh mục cha-con sâu) dễ vượt ngưỡng này.

## 3. Độ phức tạp = số node của cây đệ quy × việc mỗi node

```
fib(5)                                   mỗi node gọi 2 con, sâu n
├── fib(4)                               → ~φⁿ ≈ 1.618ⁿ node
│   ├── fib(3)                             fib(40) ≈ 3·10⁸ lời gọi
│   │   ├── fib(2) ...
│   │   └── fib(1)
│   └── fib(2) ...
└── fib(3)    ← tính lại y hệt nhánh trên!
```

Công thức hay gặp:

| Hồi quy | Ví dụ | Kết quả |
|---|---|---|
| T(n) = T(n−1) + O(1) | duyệt list, giai thừa | O(n) |
| T(n) = T(n/2) + O(1) | lũy thừa nhanh, binary search | O(log n) |
| T(n) = 2T(n/2) + O(n) | merge sort | O(n log n) |
| T(n) = 2T(n−1) + O(1) | tháp Hà Nội | O(2ⁿ) |
| T(n) = T(n−1) + T(n−2) | fib ngây thơ | O(φⁿ) |

## 4. Memoization
Bài toán con **lặp lại** → lưu kết quả lần đầu, lần sau tra.
```ts
const memo = new Map<number, number>();
function fib(n: number): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  const v = fib(n - 1) + fib(n - 2);
  memo.set(n, v);
  return v;
}   // mỗi n tính 1 lần → O(n)
```
Python: `@functools.cache`. Java: `long[] memo` hoặc `HashMap`. (Đây là cửa vào DP — A01.)

## 5. Khử đệ quy: stack tự quản

```ts
// đệ quy: duyệt cây theo chiều sâu
function depth(node) { return 1 + Math.max(...children(node).map(depth)); }

// vòng lặp + stack: không giới hạn bởi call stack (chỉ giới hạn bởi RAM)
const stack = [[root, 1]];
while (stack.length) {
  const [node, d] = stack.pop();
  best = Math.max(best, d);
  for (const c of children(node)) stack.push([c, d + 1]);
}
```
Bài cần kết quả **từ dưới lên** (tổng kích thước thư mục con) → duyệt lấy thứ tự (pre-order bằng stack), rồi xử lý **ngược** thứ tự đó: con luôn được xử lý trước cha.

## 6. Đệ quy để phân tích cú pháp
Biểu thức có ngoặc lồng nhau, `3[a2[c]]`, JSON… là cấu trúc đệ quy → hàm đệ quy đọc một "khối", gặp `(`/`[` thì gọi lại chính nó cho khối con, trả về kết quả **và vị trí đọc tiếp**.

## 7. Bẫy
1. Thiếu base case hoặc bước đệ quy không tiến gần base case → đệ quy vô hạn.
2. Base case sai biên (n = 0? n = 1? chuỗi rỗng?).
3. Quên `return` kết quả lời gọi đệ quy.
4. Dùng biến toàn cục cho memo nhưng không reset giữa các lần gọi với input khác.
5. Tạo mảng/chuỗi mới ở mỗi lời gọi (`slice`, `substring`) → thêm O(n) mỗi tầng.
6. Đệ quy sâu theo kích thước input (n = 10⁵) → tràn stack ở cả 3 ngôn ngữ.
7. Java: `-n` với `n = Integer.MIN_VALUE` vẫn là số âm (tràn) → ép sang `long` trước.
