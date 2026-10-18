# Brief cho agent soạn bài (chạy trên cloud)

Bạn đang soạn **nội dung khóa học DSA** trong repo này (workspace luyện tập bằng tiếng Việt, người học làm bài bằng TypeScript/Python/Java). Mỗi agent nhận **một nhóm module** và làm trên **một branch riêng**. Người học chưa bắt đầu (chưa intake), nên mọi module bạn soạn phải đúng ngay lần đầu và chấm được bằng máy.

Đây chính là việc của skill `/dsa-build`: **đọc `.claude/skills/dsa-build/SKILL.md` và làm đúng quy trình trong đó** (soạn 4 file → kiểm chứng bắt buộc → cập nhật trạng thái). Brief này chỉ bổ sung phần dành cho cloud.

## Đọc trước (bắt buộc, theo thứ tự)
1. `CLAUDE.md` — quy tắc coach/người học, môi trường, công cụ `check/bench/scaffold`, bậc thang quy mô.
2. `ROADMAP.md` — dòng của từng module được giao: nội dung chính + tiêu chí **Pass**.
3. `tools/AUTHORING.md` — định dạng file, `Spec`, kiểu `sig` (chữ ký kiểu Java), mục **"Bẫy đã gặp khi soạn"** (đọc kỹ).
4. `tools/CONTENT_PLAN.md` — **danh sách bài của từng module bạn được giao** (nguồn sự thật). Được phép đổi/bổ sung bài nếu có lý do; ghi vào cột Ghi chú.
5. Một module hoàn chỉnh cùng tier làm mẫu văn phong và độ sâu: `lessons/I04-heap/` (Tier I/A), `lessons/F12-stack-queue/` (bài class), `lessons/S00-setup/`.

## Mỗi module phải có
```
lessons/<ID>-<slug>/
  README.md        # ≤ 10' đọc; mục tiêu, khái niệm + hình ASCII/mermaid + code TS ngắn, template, dấu hiệu nhận biết, bảng TS/Python/Java, bẫy, độ phức tạp
  exercises.md     # đầu file: lệnh scaffold/check + tiêu chí Pass (khớp ROADMAP); mỗi bài: chữ ký kiểu Java, ràng buộc, output/tie, 2–3 ví dụ
  solutions.ts     # mỗi bài một export + khối comment Ý tưởng · Độ phức tạp · Vì sao best practice · Bẫy · Cách khác · Python/Java (spoiler)
  checks.ts        # specs: sig, title, ref, brute ĐỘC LẬP, cases (có expected), gen đúng ràng buộc, compare nếu nhiều đáp án, perf
```
Slug: chữ thường, gạch ngang, bám tên chủ đề trong ROADMAP (vd. `I05-graph-bfs`). **Không** tạo `answers/` (người học tự scaffold).

## Quy tắc chất lượng
- **Perf phải công bằng và phân biệt được Big-O.** Giới hạn TS **≥ 5–10 lần thời gian ref** (đo thật). Một lần gọi O(n) với n = 10⁵ chỉ ~0.1 ms nên bài cần ép độ phức tạp phải có nhiều truy vấn / class nhiều thao tác. Với ít nhất một bài tiêu biểu mỗi module, thử một bản ngây thơ sai Big-O và chắc chắn Perf bắt được.
  Lý do: ở workspace này 7 trong 159 đáp án mẫu từng đỏ khi chạy hàng loạt chỉ vì giới hạn quá sát (~2× thời gian đo). Đã thêm `DSA_PERF_FACTOR` (xem dưới) nhưng đừng dựa vào nó để bù giới hạn sát.
- Case lớn (10⁵) luôn ghi `expected` (công thức), không để brute tính. `gen` phải hợp lệ với n = 200 (warm-up) và đúng mọi ràng buộc trong đề.
- Đề chặt: chữ ký, ràng buộc (`n`, miền giá trị, chỗ Java cần `long`), output, tie/thứ tự. Bài nhiều đáp án hợp lệ → `compare`. Hash/RNG trong bài class phải **đặc tả trong đề** để tất định ở cả 3 ngôn ngữ.
- Mỗi module có ít nhất một bài 🔴 viết bằng ngôn ngữ nghiệp vụ. Từ Tier I: có câu hỏi quy mô (dự đoán rồi `bench`).
- Không sửa file có regex/backslash bằng heredoc Python trong bash (dùng Edit). TS chạy bằng type stripping: không `enum`, `namespace`, parameter property; import ghi đuôi `.ts`.
- Nếu bài dùng kiểu `sig` mới hoặc class: thử nhanh một bản **Python hoặc Java** vào `answers/`, chạy `check --lang py|java`, rồi **xóa file thử**.
- Văn phong: ngắn gọn, số liệu cụ thể; tiếng Việt, giữ thuật ngữ tiếng Anh. Không bịa số đo: mọi con số trong README/solutions phải từ lần chạy thật.

## KHÔNG đụng vào
- `progress/`, `dsa.config.json`, các module đã xong (S00, F01–F12, I01–I04).
- Module ngoài nhóm của bạn.
- **Phụ thuộc chéo nhóm:** chỉ `import` từ module đã có trên `main` (S00, F, I01–I04, ví dụ `Heap` ở `I04-heap/solutions.ts`). Cần thứ nằm ở module của nhóm khác (vd. Union-Find ở I08) thì **chép bản tối giản vào `solutions.ts` của bạn**, đừng import, vì nhánh của bạn không có module đó.
- `tools/` (check, lib, sig, spec...): chỉ **thêm** hàm/kiểu mới ở cuối file kèm comment tên nhóm, không đổi chữ ký cũ; nêu rõ trong báo cáo. Nhiều nhóm cùng sửa nên dễ conflict.
- `tools/CONTENT_PLAN.md`: chỉ sửa **dòng trạng thái và mục** của module nhóm bạn.

## Môi trường verify trên cloud (Ubuntu 24.04: Python 3, OpenJDK 21, Node 20/21/22)
```bash
node -v            # runner cần Node >= 24 (chạy .ts bằng type stripping). Cloud mặc định 22.
npm i -g node@24 && hash -r && node -v     # nếu < 24: cài bản 24 từ npm rồi kiểm tra lại
npm ci
python3 --version && javac -version        # runner Python/Java
```
Kiểm chứng (bắt buộc, không nới `compare`/xóa case để cho qua):
```bash
export DSA_PERF_FACTOR=3                   # nhân giới hạn thời gian ×3 (mặc định 1) cho VM chia sẻ CPU
node tools/check.ts --all <ID> --src solutions --quiet
npx tsc --noEmit
```
Sau khi xong cả nhóm, chạy lại `DSA_PERF_FACTOR=3 node tools/check.ts --all --src solutions --quiet` một lần để chắc không làm hỏng module khác. Ghi trong báo cáo mọi chỗ **chỉ qua nhờ** `DSA_PERF_FACTOR`.
Nếu không dựng được Node 24: vẫn soạn đầy đủ nhưng ghi **mọi** module là "chưa verify" trong báo cáo.

## Git
- Branch của bạn: `content/<nhóm>` (nhóm: `i`, `a`, `pr`, `d`). Commit nhỏ theo module: `feat(I05): graph & BFS`. Push sau mỗi module.
- Cuối cùng: cập nhật dòng trạng thái trong `tools/CONTENT_PLAN.md` (✅, số bài, ghi chú thay đổi) và viết `tools/reports/<nhóm>.md`: module đã làm, kết quả kiểm chứng (số đúng/sai, chỗ nhờ `DSA_PERF_FACTOR`), bài đã đổi so với kế hoạch, thay đổi ở `tools/`, thứ chưa verify. Mở PR vào `main`.

## Bảng phân công
| Branch | Module | Lưu ý |
|---|---|---|
| `content/i` | I05–I14 | Graph/BFS/DFS/topo/DSU/backtracking/greedy/monotonic/trie/bit/math. Tự chứa: nhóm khác cần DSU/Graph thì sẽ chép bản riêng |
| `content/a` | A01–A12 | DP I–V, shortest paths, MST, Fenwick/Segment tree, string algorithms, binary search on answer, sweep line, amortized/randomized. Cần Heap (I04) được import; DSU/Graph thì chép bản tối giản |
| `content/pr` | P01–P07, R01–R10 | **P có định dạng đặc biệt** (xem CONTENT_PLAN, mục Tier P: P01 gồm `answers/p01.md`, P03 `benchOnly`, P05–P07 timed set). R: mỗi module 5 bài, chủ yếu class, hash/RNG phải được đặc tả trong đề |
| `content/d` | D01–D10, CAP | Mỗi module `DESIGN.md` mẫu theo khung 7 bước của `.claude/skills/dsa-design/SKILL.md` + 2 bài class có checks; CAP là mini-Redis |
