# D07 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D07-router-filesystem [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D07-router-filesystem 01`

**Pass:** 2/2 bài qua `check` + một trang thiết kế 7 bước cho biến thể "router trả thêm tham số" (`match` trả handler **và** map `id → giá trị`), ≤ 2 hint. Trước khi code, nói ý tưởng + độ phức tạp.

> Bài class: `args = [ops, opArgs]`; kết quả `void` là `null`; `String` không có kết quả là `null`.

---

## 🟡 Kết hợp

### ex02 · File system trong bộ nhớ (class)
```java
class FileSystem {
  FileSystem()
  List<String> ls(String path)
  void mkdir(String path)
  void addContentToFile(String filePath, String content)
  String readContentFromFile(String filePath)
}
```
- Đường dẫn tuyệt đối, bắt đầu bằng `/`, không có `/` cuối (trừ gốc `/`); tên chỉ gồm chữ thường và chữ số.
- `ls(path)`: nếu `path` là **tệp** → `[tên tệp]` (chỉ tên, không phải đường dẫn); nếu là **thư mục** → tên các mục con (tệp và thư mục) **sắp xếp từ điển**. Gốc rỗng → `[]`.
- `mkdir(path)`: tạo thư mục, kể cả thư mục cha còn thiếu; đã có thì không làm gì.
- `addContentToFile(filePath, content)`: tệp chưa có thì tạo (kể cả thư mục cha); đã có thì **nối** `content` vào cuối.
- `readContentFromFile(filePath)`: nội dung tệp (tệp luôn đã tồn tại).
- Bảo đảm: một tên chỉ là thư mục hoặc tệp, không bao giờ cả hai; `ls` chỉ gọi với đường dẫn tồn tại; không có đường dẫn đi qua một tệp.
- Ràng buộc: tối đa `10⁵` lần gọi, độ sâu ≤ 10, tổng độ dài nội dung ≤ `10⁶`.
- Ví dụ: `ls("/") → []`, `mkdir("/a/b/c")`, `addContentToFile("/a/b/c/d","hello")`, `ls("/") → ["a"]`, `readContentFromFile("/a/b/c/d") → "hello"`. (LeetCode 588)
- Mục tiêu: mỗi đoạn đường dẫn tra O(1). Lưu phẳng `Map<đường dẫn, …>` rồi quét để `ls` sẽ trượt Perf.

---

## 🔴 Thực tế

### ex01 · Router API gateway (class)
Gateway nhận request `GET /users/42/posts` và chọn handler theo bảng route đăng ký kiểu Express/NestJS (`/users/:id/posts`, `/static/*`). Khi nhiều route cùng khớp, route **cụ thể hơn** thắng.
```java
class Router {
  Router()
  void add(String pattern, String handler)   // đăng ký route
  String match(String path)                  // handler thắng, hoặc null nếu không route nào khớp
}
```
- Pattern và path bắt đầu bằng `/`, các đoạn cách nhau một `/`, không có đoạn rỗng, không có `/` cuối (gốc là `/` với 0 đoạn). Đoạn tĩnh gồm chữ thường, chữ số, `_`, `-`, `.`.
- Đoạn pattern có 3 loại: **tĩnh** (`users`), **tham số** (`:id` — khớp đúng **1** đoạn bất kỳ), **wildcard** (`*` — chỉ ở đoạn cuối, khớp **≥ 1** đoạn còn lại).
- Chọn route: so các route khớp từ đoạn đầu; tại đoạn đầu tiên khác nhau, loại **tĩnh thắng tham số, tham số thắng wildcard**. (Tức nhánh ưu tiên cao có thể thất bại ở đoạn sau và phải quay lui sang nhánh kém ưu tiên hơn.)
- Hai pattern cùng hình dạng (chỉ khác tên tham số, ví dụ `/u/:id` và `/u/:name`) là **cùng một route**: `add` sau ghi đè handler.
- Ràng buộc: tối đa `10⁵` lần gọi, tối đa 10 đoạn mỗi pattern/path.
- Ví dụ: đăng ký `/users/me → me`, `/users/:id → user`, `/users/:id/posts → posts`, `/static/* → static`: `match("/users/me") → "me"`, `match("/users/42") → "user"`, `match("/users/42/posts") → "posts"`, `match("/static/css/app.css") → "static"`, `match("/static") → null`.
- Ví dụ quay lui: `/a/b/c → exact`, `/a/:x/d → param-d`, `/a/* → wild`: `match("/a/b/d") → "param-d"`, `match("/a/b/e") → "wild"`.
- Mục tiêu: `match` không phụ thuộc số route (trie). Thử lần lượt mọi route sẽ trượt Perf (≈ 2·10⁴ route, 6·10⁴ request).
- 🧭 Câu hỏi quy mô: 10⁵ route, 10⁶ request/giây ở peak — trie hay quét? Bộ nhớ trie là bao nhiêu nút tối đa?
