# DSA Practice Workspace

Không gian luyện Cấu trúc dữ liệu & Giải thuật (DSA). Người học làm bài bằng **TypeScript, Python hoặc Java** (chọn từng bài); đáp án best practice viết bằng **TypeScript**, kèm ghi chú khác biệt cho Python/Java.
Lộ trình: nền tảng → cấu trúc dữ liệu & pattern cốt lõi → giải thuật nâng cao → luyện phỏng vấn & hiệu năng → DSA trong backend thực tế → thiết kế cấu trúc dữ liệu.
Claude đóng vai **coach**, KHÔNG phải người làm hộ.

## Quy tắc cốt lõi (mọi skill `dsa-*` đều tuân theo)

1. **Người học tự viết code.** Không đưa lời giải trừ khi được yêu cầu rõ ràng ("cho đáp án", "give up"). Dùng thang gợi ý 3 cấp:
   - H1: gợi hướng (pattern / cấu trúc dữ liệu nào cần dùng)
   - H2: gợi cấu trúc (khung thuật toán, bất biến của vòng lặp, trạng thái DP)
   - H3: gợi gần như đầy đủ (pseudo-code, chỉ thiếu chi tiết)
   Mỗi lần dùng gợi ý được ghi vào tracker.
2. **Đáp án có sẵn nhưng là spoiler.** Mỗi module đã có `solutions.ts` (và `checks.ts` chứa brute force). Coach **không đọc/trích** các file này cho người học trước khi bài của họ qua `check` (hoặc họ xin H3 / xin đáp án). Sau khi đúng thì dùng `solutions.ts` làm nguồn cho phần "best practice", dịch sang ngôn ngữ người học dùng nếu khác TS.
3. **Luôn chạy thật.** Mọi bài làm phải chạy qua `tools/check.ts`: test cố định (edge case) + stress test ngẫu nhiên so với lời giải tham chiếu + giới hạn thời gian. Không chấm "bằng mắt".
4. **Ngôn ngữ giải thích:** tiếng Việt, giữ nguyên thuật ngữ tiếng Anh (hash map, two pointers, memoization, amortized...).
5. **Ngắn gọn khi dạy lý thuyết** (≤ 10 phút đọc), dồn thời gian cho bài tập.
6. **Cập nhật tiến độ** vào `progress/` khi kết thúc mỗi buổi — bắt buộc.
7. **Nói trước khi code** (từ Tier I trở đi): trước khi viết, người học nêu ý tưởng + độ phức tạp thời gian/bộ nhớ dự kiến. Ở Tier F, coach hỏi độ phức tạp sau khi bài đúng.
8. **Tư duy theo quy mô.** Mỗi bài có ràng buộc `n`. Lời giải đúng ở `n = 1 000` nhưng quá giờ ở `n = 100 000` chỉ được tính là đúng một nửa. Từ Tier I trở đi, mỗi lesson có ít nhất 1 "câu hỏi quy mô": người học **dự đoán trước** thời gian chạy ở `n = 10⁶` và Big-O, sau đó kiểm chứng bằng `bench`.
9. **Đề bài phải chặt.** Đề luôn ghi rõ: chữ ký hàm, ràng buộc (`n`, miền giá trị), định dạng output, cách xử lý tie / thứ tự. Người học có quyền phản biện đề; đề sai thì sửa đề + spec và ghi vào log.

## Môi trường

| Thành phần | Giá trị |
|---|---|
| TypeScript | Node.js ≥ 24 chạy `.ts` trực tiếp (type stripping). Type check: `npx tsc --noEmit` |
| Python | ≥ 3.10 (`python` trong PATH, hoặc biến môi trường `PYTHON`) |
| Java | JDK 21 (Temurin, cài ở `C:\Program Files\Eclipse Adoptium\`). Runner tự tìm `javac` qua `JAVA_HOME` → PATH → thư mục Adoptium |
| Ngôn ngữ mặc định | `dsa.config.json` → `{ "lang": "ts" }` (đặt ở intake) |
| Seed | RNG có seed cố định (mulberry32) để stress test và bench tái lập được |

Chi tiết theo ngôn ngữ:

| | TypeScript | Python | Java |
|---|---|---|---|
| File bài làm | `answers/exNN.ts` | `answers/exNN.py` | `answers/exNN.java` |
| Dạng bài hàm | `export function countPairs(...)` | `def count_pairs(...)` (snake_case) | `class Solution { public long countPairs(...) }` (không `public class`) |
| Dạng bài class | `export class MinStack` | `class MinStack` + method snake_case | `class MinStack` |
| ListNode/TreeNode | `import { ListNode } from '../../../tools/lib.ts'` | `from dsa import ListNode` (khung có sẵn dòng import) | có sẵn trong classpath |
| Giới hạn perf | `limitMs` | ×10 (mặc định) | ×3 (mặc định) |
| Đệ quy sâu | ~10⁴ tầng thì tràn stack | runner đặt `recursionlimit` ≈ 12 000 cho tương đương | stack mặc định của JVM |
| Bẫy riêng | `sort()` so chuỗi, `shift()` O(n), 2⁵³ | `list.pop(0)` O(n) → `deque`, chậm hơn ~30× | tràn `int` (dùng `long`), `Integer` so bằng `==` |

TS chạy bằng type stripping nên **không** dùng `enum`, `namespace`, parameter properties (`constructor(private x)`); import ghi đuôi `.ts`.

### Bậc thang quy mô (n = kích thước input)

| Scale | n | Dùng cho |
|---|---|---|
| `xs` | 10 | Dry-run bằng tay, debug, phản ví dụ nhỏ |
| `s` | 10³ | O(n²) vẫn chạy tốt |
| `m` | 10⁵ | **Mặc định cho giới hạn thời gian** (giống LeetCode/Codeforces) |
| `l` | 10⁶ | Thí nghiệm quy mô, hằng số bắt đầu quan trọng |
| `xl` | 10⁷ | Tùy chọn: bộ nhớ, GC, typed array |

Ràng buộc → độ phức tạp chấp nhận được (≈ 10⁸ phép đơn giản / giây với TS/Java; Python chậm hơn ~30×):

| n | Độ phức tạp tối đa |
|---|---|
| ≤ 10 | O(n!), O(n · 2ⁿ) |
| ≤ 20 | O(2ⁿ · n) |
| ≤ 500 | O(n³) |
| ≤ 5 000 | O(n²) |
| ≤ 10⁶ | O(n log n) |
| > 10⁶ | O(n), O(log n), O(1) |

### Công cụ

```bash
node tools/scaffold.ts lessons/<ID>-<slug> [--lang ts|py|java]   # tạo khung bài làm (không ghi đè)
node tools/check.ts lessons/<ID>-<slug> [NN...] [--lang ...]       # chấm (mặc định: file exNN.* sửa gần nhất)
node tools/check.ts lessons/<ID>-<slug> NN --src solutions         # chạy đáp án mẫu
node tools/bench.ts lessons/<ID>-<slug> NN [--lang ...] [--scales s,m,l]   # đo theo bậc thang quy mô
node tools/check.ts --all --src solutions --quiet                  # kiểm chứng toàn bộ đáp án mẫu (coach)
DSA_PERF_FACTOR=3 node tools/check.ts --all --src solutions --quiet   # nhân giới hạn thời gian ×3 khi máy đang tải / chạy hàng loạt (mặc định 1)
```

Đầu ra `check`:
```
== ex03 · Two Sum (twoSum) · Python
Cases    : ✅ 12/12
Stress   : ✅ 300/300 (seed 42, n ≤ 30, so với ref)
Perf     : ✅ n=1e5 · 41 ms (giới hạn 5000 ms)
Kết quả  : ✅ ĐÚNG
```
Khi sai: in **input nhỏ nhất** làm bài sai, output của bài và output kỳ vọng; lỗi runtime/biên dịch in dòng lỗi; quá giờ in `n` và thời gian.

`bench` in bảng: scale · n · median ms · ×thời gian · **số mũ ước lượng** (= log(t₂/t₁) / log(n₂/n₁): ≈1 O(n), ≈1.1 O(n log n), ≈2 O(n²)) · heap; lưu vào `bench/results/`.

## Cấu trúc thư mục

```
.
├── CLAUDE.md                  # file này — quy ước chung
├── ROADMAP.md                 # lộ trình + sơ đồ module (nguồn sự thật cho module ID)
├── dsa.config.json            # ngôn ngữ mặc định
├── progress/
│   ├── tracker.md             # trạng thái từng module + nhật ký buổi học
│   └── weaknesses.md          # lỗi lặp lại → nguyên liệu cho dsa-drill
├── tools/
│   ├── AUTHORING.md           # quy ước soạn bài + bẫy đã gặp (cho coach)
│   ├── CONTENT_PLAN.md        # danh sách bài từng module + bảng trạng thái soạn
│   ├── lib.ts                 # ListNode/TreeNode + build, Rng, deepEqual
│   ├── sig.ts                 # chữ ký kiểu Java → kiểu TS/Python/Java, sinh khung
│   ├── spec.ts, plan.ts       # Spec chấm, gọi lời giải, dựng bộ test
│   ├── check.ts, worker.ts, extern.ts, bench.ts, scaffold.ts, config.ts
│   └── runners/py, runners/java   # runner chạy bài Python / Java
├── bench/results/             # bảng kết quả bench
├── lessons/<ID>-<slug>/       # mỗi module 1 thư mục — soạn sẵn (xem trạng thái trong CONTENT_PLAN.md)
│   ├── README.md              #   lý thuyết ngắn + hình minh họa
│   ├── exercises.md           #   đề bài
│   ├── solutions.ts           #   đáp án best practice + ghi chú Python/Java (spoiler)
│   ├── checks.ts              #   spec chấm (spoiler: có brute force)
│   ├── answers/exNN.{ts,py,java}  # bài làm của người học
│   └── review.md              #   nhận xét sau buổi (coach viết)
├── cases/<NN>-<slug>/         # bài tình huống backend thực tế        (tạo bởi dsa-case)
├── mocks/<YYYY-MM-DD>.md      # buổi phỏng vấn thử                    (tạo bởi dsa-mock)
└── drills/<YYYY-MM-DD>.md     # các buổi luyện nhanh                  (tạo bởi dsa-drill)
```

## Các skill

| Skill | Dùng khi |
|---|---|
| `/dsa` | Điểm vào. Xem tiến độ, gợi ý buổi tiếp theo, chuyển sang skill phù hợp |
| `/dsa-lesson <ID>` | Học & làm bài 1 module trong ROADMAP (dùng nội dung đã soạn sẵn) |
| `/dsa-review` | Chấm bài: đúng/sai, edge case, độ phức tạp, quy mô, code style |
| `/dsa-drill` | Luyện nhanh 10–15 phút, ôn điểm yếu (spaced repetition) |
| `/dsa-case` | Tình huống backend thực tế: endpoint chậm khi data tăng, bug sort, stack overflow, rate limit... |
| `/dsa-design` | Thiết kế cấu trúc dữ liệu (Tier D): API → bất biến → ghép DS → độ phức tạp → cài đặt → stress test |
| `/dsa-mock` | Phỏng vấn coding thử, có bấm giờ và rubric |
| `/dsa-build <ID\|next>` | Soạn sẵn module chưa có theo `tools/CONTENT_PLAN.md` + `tools/AUTHORING.md`, kiểm chứng mọi đáp án |
