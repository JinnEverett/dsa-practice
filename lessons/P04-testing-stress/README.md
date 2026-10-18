# P04 · Testing & stress test

## Sau buổi này bạn sẽ
- Liệt kê edge case một cách **có hệ thống** thay vì đoán.
- Tự viết bộ ba **brute force + generator + so sánh** và **thu nhỏ phản ví dụ** (shrinking).
- Thêm **bất biến** (assert) và **giới hạn thời gian** vào test để bắt cả lỗi không phải "sai kết quả".
- Đọc code lạ và tìm bug: 8 đoạn code lỗi mô phỏng những bug thật hay gặp (off-by-one, thiếu tie-break, `sort()` mặc định, visited sai chỗ, tràn số, sửa input, tham lam sai, `shift()` trong vòng lặp).

## 1. Stress test là gì
```
 for lặp N lần:
     input = generator(seed)          # nhỏ, hợp lệ theo đề, ĐA DẠNG
     want  = brute(input)             # chậm nhưng hiển nhiên đúng
     got   = solution(input)
     nếu khác: in input NHỎ NHẤT làm sai, dừng
```
Đây chính là cách workspace này chấm bài (`tools/check.ts`): bạn sẽ tự dựng phiên bản của mình.

## 2. Liệt kê edge case có hệ thống
| Nhóm | Câu hỏi |
|---|---|
| Kích thước | rỗng · 1 phần tử · 2 phần tử · đúng ngưỡng (vd. `n = k`) |
| Giá trị | 0 · âm · tất cả bằng nhau · nhiều chữ số · giá trị lớn nhất cho phép |
| Cấu trúc | đã sắp tăng/giảm · toàn trùng · xen kẽ · đối xứng · không liên thông · có chu trình · đồ thị sao/đường thẳng/thang |
| Biên của đáp án | đáp án nằm "ngoài" (vd. vị trí `n`) · không có đáp án · đáp án nhiều cách (tie-break) |
| Số học | tràn `int` (2³¹) · vượt 2⁵³ trong JS · chia cho 0 · mod âm |
| Tương tác | hàm có sửa input không · gọi lặp có giữ trạng thái không |
| Hiệu năng | `n` lớn nhất + cấu trúc xấu nhất (đồ thị sao, mảng đã sắp, chuỗi toàn một ký tự) |

**Quy tắc vàng:** generator phải *phủ được* mỗi nhóm. Bug không bị bắt thường vì generator không bao giờ sinh ra input kích hoạt nó (target chỉ lấy trong mảng; số chỉ 0..9; đồ thị chỉ thưa).

## 3. Thu nhỏ phản ví dụ
Phản ví dụ 10⁴ phần tử vô dụng — cần cái nhỏ nhất:
1. **Sinh từ nhỏ đến lớn** (`n = 0, 1, 2, …`): lần sai đầu tiên đã nhỏ.
2. **Xóa dần:** sau khi tìm thấy input sai, thử bỏ từng phần tử/cạnh; giữ lại nếu vẫn sai (lặp tới khi không bỏ được nữa).
3. **Thu nhỏ giá trị:** thử thay số lớn bằng số nhỏ hơn.

## 4. Mẫu stress test (TypeScript)
```ts
import { Rng } from '../../tools/lib.ts';
import { lowerBound as buggy } from './bugs/bug01.ts';

const brute = (nums: number[], t: number) => nums.findIndex((x) => x >= t) < 0 ? nums.length : nums.findIndex((x) => x >= t);
const r = new Rng(1);                       // seed cố định → tái lập được
for (let it = 0; it < 20000; it++) {
  const n = r.int(0, 8);                    // nhỏ, bao gồm rỗng
  const nums = r.sorted(n, 0, 6);           // đúng ràng buộc của đề (đã sắp, có trùng)
  const t = r.int(-1, 7);                   // target CẢ ngoài miền
  const got = buggy(nums, t), want = brute(nums, t);
  if (got !== want) { console.log('phản ví dụ:', { nums, t, got, want }); break; }
}
```
Python: `random.seed(1)` + `random.randint`; Java: `new Random(1)`. Luôn in input ở dạng bạn dán lại được vào đề bài.

## 5. Bất biến và giới hạn thời gian
- **Bất biến:** "hàm không đổi input" (sao chép input trước khi gọi, so sau khi gọi), "kết quả nằm trong [0, n]", "tổng giữ nguyên".
- **Thời gian:** đo mỗi lần gọi; vượt ngưỡng (vd. 100 ms với `n` nhỏ) là phản ví dụ. Nhiều bug chỉ lộ ở hiệu năng — kết quả vẫn đúng.
- **Input có cấu trúc:** thêm vài generator "xấu nhất" (sao, thang, đã sắp) bên cạnh generator ngẫu nhiên.

## 6. Cách làm module này
1. Mỗi bài trong `exercises.md` đưa code **có lỗi** (TS, kèm Python/Java ngắn); file nguồn nằm ở `bugs/bugNN.*`.
2. **Phần A (chấm máy):** viết bản sửa vào `answers/exNN.*` → `node tools/check.ts lessons/P04-testing-stress NN`.
3. **Phần B (không chấm máy):** viết `answers/stress_NN.*` import code lỗi từ `bugs/` và **tự động** tìm ra phản ví dụ nhỏ nhất. Ghi vào `answers/p04.md`: phản ví dụ + đặc điểm generator cần có để bắt bug.
4. Làm B **trước** A cho ít nhất 4 bài (đọc code, đoán bug, rồi để stress test chứng minh).

**Pass:** tìm được bug trong **6/8** đoạn code bằng stress test tự viết (coach chạy `answers/stress_NN`).

## 7. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| RNG tái lập | `new Rng(seed)` (tools/lib.ts) | `random.seed(s)` | `new Random(s)` |
| So sánh sâu | `JSON.stringify` / `deepEqual` | `==` trên list | `Arrays.equals` |
| Bẫy riêng | `sort()` so chuỗi · `shift()` O(n) · 2⁵³ | `pop(0)` O(n) · đệ quy 1000 | `int` tràn · `==` trên `String`/`Integer` · `HashMap` thứ tự băm |

## 8. Bẫy khi tự test
1. Brute cũng sai (hãy kiểm brute trên vài ví dụ tay).
2. Generator vi phạm ràng buộc đề (báo sai giả).
3. Generator quá "đẹp": không có trùng, không có biên, không có số lớn.
4. Chỉ so kết quả mà không so *tác dụng phụ* và *thời gian*.
5. Không cố định seed → lỗi không tái lập.

## 9. Câu hỏi quy mô
Với ex04 và ex08, đoán trước: bản lỗi chạy bao lâu ở `n = 10³`, `10⁴`, `10⁵`? (Có một "vách đá" — hãy đo thật bằng `bench` trên đồ thị sao/thang rồi giải thích vì sao stress test với `n ≤ 30` không bao giờ thấy.)
