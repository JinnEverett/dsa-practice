# Quy ước soạn bài (cho coach)

Mỗi module là một thư mục `lessons/<ID>-<slug>/`:

| File | Nội dung |
|---|---|
| `README.md` | Lý thuyết ≤ 10 phút: mục tiêu, khái niệm + hình minh họa (mermaid/ASCII) + code TS ngắn, dấu hiệu nhận biết, template, bẫy (ghi rõ bẫy riêng TS / Python / Java nếu có), bảng độ phức tạp, bảng "công cụ có sẵn theo ngôn ngữ" khi liên quan (vd. heap: không có / `heapq` / `PriorityQueue`) |
| `exercises.md` | Đề bài 🟢/🟡/🔴. Mỗi bài: mô tả, **chữ ký kiểu Java** trong khối ```java (khung 3 ngôn ngữ do scaffold sinh), ràng buộc, output (thứ tự, tie, không có đáp án), 2–3 ví dụ, mục tiêu độ phức tạp (Tier F ghi rõ; Tier I+ chỉ ghi "đạt perf"), tham khảo LeetCode nếu có. Đầu file ghi tiêu chí Pass |
| `solutions.ts` | **Đáp án best practice bằng TS** (spoiler). Mỗi bài 1 export, tên không trùng trong module. Trước mỗi hàm là khối comment: Ý tưởng · Độ phức tạp · Vì sao là best practice · Bẫy · Cách khác · **Python/Java:** khác biệt đáng chú ý (thư viện chuẩn, tràn số, idiom) |
| `checks.ts` | `export const specs: Record<string, Spec>` (import type từ `../../tools/spec.ts`) — key `'01'`, `'02'`…; `ref` import từ `./solutions.ts`; `brute` + `gen` + `cases` viết tại chỗ |

Quy tắc spec (`tools/spec.ts`):
- `sig` viết kiểu Java: `'long countPairs(int[] nums, int k)'`. Kiểu hỗ trợ: `int long double boolean char String`, `Integer…` (nullable), `X[]`, `List<X>`, `ListNode`, `TreeNode`, `void`. Chọn kiểu Java đúng phạm vi giá trị (tổng/đếm có thể > 2³¹ → `long`). Dùng `List<List<Integer>>` khi số phần tử kết quả không biết trước (idiom Java/LeetCode).
- Bài class: `sig` là khung `class X {\n  X(int capacity)\n  int get(int key)\n  void put(int key, int value)\n}`; `args = [ops, opArgs]` kiểu LeetCode.
- Input/expected là **JSON thuần**: ListNode/TreeNode viết bằng mảng (level-order có `null`), list có chu trình là `{ vals, pos }`. Không truyền node làm tham số (LCA nhận giá trị, không nhận node).
- `cases` có `expected` viết tay cho các ví dụ trong đề (kiểm chứng độc lập), các edge case còn lại để brute tính. Thêm case "bẫy tràn số Java" khi giá trị lớn.
- `brute` phải "hiển nhiên đúng" (vét cạn, mô phỏng). Có brute thì stress test kiểm chứng được `ref`.
- `gen(n, r)` sinh input **đúng ràng buộc của đề**; stress mặc định n = 0..30 — bài cần n ≥ 1 thì đặt `stress.minN`.
- `perf` mặc định `{ n: 1e5, limitMs: … }`: lời giải đúng Big-O trong TS phải nhanh hơn giới hạn ≥ 5 lần, lời giải sai Big-O phải vượt. Python/Java tự nhân ×10/×3; ghi đè `py`/`java` khi cần.
- Bài sửa tại chỗ: `output: 'arg0'`. Bài nhiều đáp án hợp lệ: `compare` là hàm kiểm tra tính hợp lệ. `output`/`compare` làm việc trên JSON thuần (list/tree đã thành mảng, -0 thành 0).

Kiểm chứng sau khi soạn: `node tools/check.ts --all <ID> --src solutions --quiet` và `npx tsc --noEmit`.

## Bẫy đã gặp khi soạn (đọc trước khi soạn module mới)

- **Warm-up gọi `gen(min(n, 200))`** trước phần perf → `gen` phải hợp lệ với n = 200 (vd. `r.distinct` cần miền giá trị ≥ n: dùng `Math.max(60, 3 * n)`).
- **Case lớn (10⁵) không có `expected`** sẽ được tính bằng brute khi kiểm chứng → brute đệ quy tràn stack hoặc brute O(n²) treo. Case lớn luôn ghi `expected` (tính bằng công thức).
- **Brute trả về object thường** thay vì `TreeNode`/`ListNode` → không được chuẩn hóa thành mảng. Dùng `new TreeNode(...)` hoặc trả thẳng mảng level-order.
- **Expected viết tay có thể sai** (đã gặp: 10⁹ mod 3). Khi `check --src solutions` báo sai ở case cố định, kiểm tra lại expected trước khi nghi ngờ ref.
- **Stress sinh input vi phạm ràng buộc** (chia cho 0, thiếu đáp án) → báo sai giả. `gen` phải bảo đảm đúng mọi ràng buộc trong đề.
- **Perf chập chờn** khi máy đang tải: giới hạn TS nên ≥ 5–10 lần thời gian ref.
- **Một lần gọi O(n) với n = 10⁵ chỉ mất ~0.1 ms** → perf không phân biệt được O(n) với O(log n). Bài cần ép độ phức tạp thì phải có nhiều truy vấn (hoặc class nhiều thao tác); nếu không, ghi chú trong exercises.md là "tự giác".
- **Không sửa file có regex/backslash bằng heredoc Python trong bash** — `\1` từng bị biến thành ký tự `\x01`. Dùng Edit tool.
- **TS type stripping:** không parameter property (`constructor(private x)`) trong cả solutions/checks/tools.
- Sau khi thêm loại kiểu mới vào `sig` (vd. `int[][][]`, `char`, `List<List<String>>` làm tham số), thử 1 bài bằng Python và Java để chắc runner chuyển kiểu đúng.
