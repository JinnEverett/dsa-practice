# D06 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/D06-leaderboard [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/D06-leaderboard 01`

**Pass:** 2/2 bài qua `check` + một trang thiết kế 7 bước cho biến thể "hạng đồng hạng kiểu competition (1224)", ≤ 2 hint. Trước khi code, nói ý tưởng + độ phức tạp từng thao tác.

> Bài class: `args = [ops, opArgs]`; kết quả `void` là `null`. Trong TS không có `TreeMap`: bạn cần tự cài (gợi ý ở README mục 1–2).

---

## 🟡 Kết hợp

### ex01 · Leaderboard (class)
```java
class Leaderboard {
  Leaderboard()
  void addScore(int playerId, int score)   // cộng `score` vào điểm hiện tại; người chơi mới bắt đầu từ 0
  long top(int K)                          // tổng điểm của K người cao điểm nhất
  void reset(int playerId)                 // xóa người chơi khỏi bảng (như chưa từng xuất hiện); playerId đã có
}
```
- `1 ≤ K ≤ số người đang có`. Hòa điểm không ảnh hưởng tổng.
- Ràng buộc: `1 ≤ playerId ≤ 10⁵`, `1 ≤ score ≤ 10⁴` mỗi lần cộng (tổng một người ≤ `10⁹`), `1 ≤ K ≤ 100`, tối đa `10⁵` lần gọi. Tổng K điểm có thể vượt `int` (Java: `long`).
- Ví dụ: `addScore(1,73), addScore(2,56), addScore(3,39), addScore(4,51), addScore(5,4), top(1) → 73, reset(1), reset(2), addScore(2,51), top(3) → 141`. (LeetCode 1244)
- Mục tiêu: `addScore`/`reset` không tệ hơn O(√n) (hoặc O(log n)); `top(K)` **không** sort lại toàn bộ. Sort hoặc quét mọi người chơi mỗi lần `top` sẽ trượt Perf.

---

## 🔴 Thực tế

### ex02 · Bảng xếp hạng game — RankBoard (class)
Game có bảng xếp hạng tuần: điểm của người chơi được **ghi đè** mỗi khi họ đạt kết quả mới. Giao diện cần hiển thị **hạng của một người** và **top-k**.
```java
class RankBoard {
  RankBoard()
  void update(int player, int score)       // ĐẶT điểm của `player` thành `score` (người mới được thêm)
  int rank(int player)                     // hạng 1-based; −1 nếu player chưa từng được update
  List<Integer> top(int k)                 // id của min(k, số người) người đứng đầu, theo thứ tự hạng
}
```
- Thứ tự xếp hạng: điểm **giảm dần**; hòa điểm thì **id nhỏ hơn đứng trước** (hạng toàn phần, không có đồng hạng).
- Ràng buộc: `1 ≤ player ≤ 10⁵`, `0 ≤ score ≤ 10⁹`, `0 ≤ k ≤ 100`, tối đa `10⁵` lần gọi.
- Ví dụ: `update(10,50), update(20,80), update(30,50)` → `rank(20) = 1, rank(10) = 2, rank(30) = 3, rank(99) = −1`; `top(2) = [20, 10]`; `update(30,100)` → `top(5) = [30, 20, 10]`, `rank(10) = 3`.
- Mục tiêu: `rank` không quét mọi người chơi. Hạng bằng cách đếm O(n) sẽ trượt Perf.
- 🧭 Câu hỏi quy mô: nếu có `10⁷` người chơi, danh sách chia khối cần khối cỡ nào để `update` còn nhanh? Có nên chuyển sang skip list / Redis ZSET không?
