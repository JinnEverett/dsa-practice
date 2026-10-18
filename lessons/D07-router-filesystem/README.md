# D07 · URL router & file system

## Sau buổi này bạn sẽ
- Dùng **trie theo đoạn đường dẫn** (segment trie) để tra cứu route mà thời gian không phụ thuộc số route.
- Mã hóa **thứ tự ưu tiên** (tĩnh > `:param` > `*`) vào thứ tự duyệt, kèm **quay lui**.
- Mô hình hóa **cây thư mục trong bộ nhớ**: `mkdir -p`, tạo/nối tệp, `ls` có sắp xếp.
- Chốt ngữ nghĩa: tên tham số có ảnh hưởng đối sánh không? `*` khớp mấy đoạn? mẫu trùng hình dạng thì sao?

## 1. Trie theo đoạn, không theo ký tự

```
Mẫu: /users/me        /users/:id        /users/:id/posts      /static/*
             root
              ├─ users ─┬─ me           (handler "me")
              │         └─ :param ─┬─ (handler "user")
              │                    └─ posts (handler "posts")
              └─ static ── wild "static"
```
Mỗi nút có 3 loại nhánh: `statics` (Map), `param` (một nhánh dùng chung cho mọi `:name`), `wild` (handler của `*`).
Tra cứu `GET /users/42/posts` đi 3 bước, không quan trọng có 10 hay 10⁵ route.

## 2. Ưu tiên và quay lui

Tại mỗi đoạn thử theo thứ tự: **tĩnh → tham số → wildcard**. Nếu nhánh ưu tiên cao đi tiếp rồi gặp ngõ cụt, phải **quay lui** và thử nhánh kém ưu tiên hơn ở đoạn trước:
```
routes: /a/b/c   /a/:x/d   /a/*
match /a/b/d : tĩnh a → tĩnh b → không có "d"  ✗ → quay lại → :x → d ✓  → "param-d"
match /a/b/e : ... ✗ → :x → "e" ✗ → wildcard của /a/* ✓
```
Ưu tiên này tương đương: *trong các mẫu khớp, chọn mẫu mà vector (loại đoạn 1, loại đoạn 2, …) nhỏ nhất theo thứ tự từ điển* (tĩnh = 0, tham số = 1, `*` = 2) — đó cũng là cách viết brute trong `checks.ts`.

## 3. Ngữ nghĩa phải chốt (bước 1 của khung)

| Câu hỏi | Chốt trong đề |
|---|---|
| `:id` vs `:name` cùng vị trí | cùng hình dạng, mẫu thêm sau **ghi đè** |
| `*` khớp bao nhiêu đoạn | **≥ 1** đoạn còn lại, chỉ xuất hiện ở đoạn cuối |
| Path và pattern có `/` cuối? | không (trừ gốc `/`) |
| Gốc `/` | khớp mẫu `/` hoặc `/*`? `/*` yêu cầu ≥ 1 đoạn nên `/` chỉ khớp mẫu `/` |
| Không khớp | `null` (404) |

## 4. File system = trie thư mục

```
/ ─ a ─ b ─ c ─ d        (d là tệp: content = "hello")
```
- `mkdir -p`: đi và tạo nút thiếu.
- `addContentToFile`: thư mục cha tạo ngầm, tệp chưa có thì tạo, đã có thì **nối**.
- `ls(đường dẫn)`: thư mục → tên các con **sắp xếp**; tệp → chỉ `[tên tệp]`.
- Mỗi nút hoặc là thư mục hoặc là tệp (`content === null` ⇔ thư mục).

## 5. Dấu hiệu nhận biết
"khớp theo tiền tố/đoạn", "nhiều mẫu, tra mỗi request", "ưu tiên cụ thể hơn", "cây thư mục", "đường dẫn phân cấp".

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Tách đoạn | `path.slice(1).split('/')` (gốc `/` → `[]`) | `path[1:].split('/')` | `path.substring(1).split("/")` — chú ý `"".split` trả `[""]` |
| Nút con | `Map<string, Node>` | `dict` | `HashMap<String, Node>` hoặc `TreeMap` (ls tự sắp xếp) |
| Sắp xếp tên | `.sort()` (so chuỗi theo UTF-16: đúng với tên ASCII thường) | `sorted()` | `Collections.sort` / `TreeMap` |

Bẫy ngôn ngữ: JS `Array.prototype.sort()` mặc định so **chuỗi** (với số sẽ sai) — ở đây tên là chuỗi nên đúng. Java `String.split("/")` bỏ chuỗi rỗng cuối.

## 7. Bẫy
1. Không quay lui khi nhánh tĩnh thất bại sâu.
2. Coi `:id` và `:name` là hai nhánh khác nhau.
3. `*` khớp 0 đoạn (`/static` khớp `/static/*` sai).
4. Dùng RegExp cho từng mẫu và thử tuần tự → O(số route).
5. `ls` của tệp trả đường dẫn đầy đủ thay vì tên.
6. `addContentToFile` ghi đè thay vì nối; quên tạo thư mục cha.

## 8. Độ phức tạp
| | Thời gian | Bộ nhớ |
|---|---|---|
| `Router.add` | O(L) | O(Σ độ dài mẫu) |
| `Router.match` | O(L) thường gặp; xấu nhất mỗi nút trie thăm ≤ 1 lần | |
| `FileSystem.mkdir/add/read` | O(L + |nội dung|) | O(số nút + nội dung) |
| `FileSystem.ls` | O(L + k log k) | |

(L = số đoạn của path, k = số con của thư mục.)

🧭 Câu hỏi quy mô: một gateway có `10⁵` route. Bản quét tuyến tính mỗi request tốn bao nhiêu phép so sánh? Dự đoán thời gian cho `10⁶` request ở bản trie rồi `bench` (scale `l`).

Xem [`DESIGN.md`](./DESIGN.md) cho thiết kế `Router` đầy đủ 7 bước.
