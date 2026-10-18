# CAP · Bài tập (mini-Redis)

Tạo khung: `node tools/scaffold.ts lessons/CAP-mini-redis [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/CAP-mini-redis 01` · Đo: `node tools/bench.ts lessons/CAP-mini-redis 02 --scales s,m,l`

**Pass:** 2/2 bài qua `check` + `bench` ex02 ở `s, m, l` (số mũ ≈ 1) + **tài liệu thiết kế 7 bước** (≤ 2 trang, có sơ đồ mermaid) của riêng bạn + demo ngắn (3–5 phút) giải thích bất biến giữa các thành phần. ≤ 2 hint. Trước khi code, nói ý tưởng + độ phức tạp từng thao tác.

> Làm ex01 trước: nó chốt keyspace (LRU, TTL, sức chứa). ex02 dùng lại keyspace đó và thêm list/zset. Bài class: `args = [ops, opArgs]`; kết quả `void` là `null`; `Long`/`String` không có là `null`.
> **Tự cài** — không dùng `Map` thứ tự chèn để làm LRU nếu bạn chưa tự viết DLL ở D02, không dùng thư viện sorted set. Ex02 cần skip list có rank: bạn có thể chép bản D09 vào `answers/`.

## Quy ước chung (áp dụng cho cả hai bài)

- **Thời gian:** `setTime(now)` đặt đồng hồ (ms, `0 ≤ now ≤ 10¹²`, không giảm; ban đầu `0`). Không có lệnh nào khác tự đổi đồng hồ.
- **Key sống** = tồn tại và (không có TTL hoặc `expireAt > now`). Key hết hạn **biến mất ngay** khi `setTime` làm `now ≥ expireAt`: không còn trong `size`, không chiếm chỗ.
- **Sức chứa `maxKeys` (≥ 1):** số key sống ≤ `maxKeys`. Khi **tạo** key mới (bởi `set`, `lpush`, `rpush`, `zadd` trên key chưa tồn tại) mà đã có `maxKeys` key sống thì **evict key sống dùng lâu nhất** trước, rồi tạo. Ghi đè key đang có không evict.
- **"Dùng":** mọi lệnh gặp key đang sống (kể cả sai kiểu) đưa key đó thành mới dùng nhất. **Ngoại lệ không tính là dùng:** `ttl`, `type`, `size`, `delete` (xóa luôn). Lệnh trên key lạ không làm gì.
- **Tiền điều kiện chung:** key, value, member chỉ gồm chữ thường và chữ số, độ dài 1–10; tối đa `2·10⁵` lần gọi.

---

## 🟡 Kết hợp

### ex01 · MiniKV — chuỗi + TTL + LRU (class)
```java
class MiniKV {
  MiniKV(int maxKeys)
  void setTime(long now)
  void set(String key, String value)       // tạo hoặc GHI ĐÈ; xóa TTL cũ
  String get(String key)                   // null nếu không có
  boolean delete(String key)               // true nếu key sống bị xóa
  boolean expire(String key, long ttlMs)   // true nếu key sống: đặt expireAt = now + ttlMs; ttlMs ≤ 0 → xóa key luôn (vẫn trả true)
  long ttl(String key)                     // −2: không có · −1: không có TTL · khác: expireAt − now (> 0)
  int size()                               // số key sống
}
```
- `expire` lại key đã có TTL thì thay TTL cũ.
- Ví dụ (`maxKeys = 2`): `set(a,1), set(b,2), get(a) → "1", set(c,3)` (evict `b`), `get(b) → null`, `get(a) → "1"`, `get(c) → "3"`, `size() → 2`.
- Ví dụ TTL: `set(a,1), expire(a,100) → true, ttl(a) → 100, setTime(40), ttl(a) → 60, setTime(100), get(a) → null, ttl(a) → −2`.
- Ví dụ `ttl` không phải "dùng" (`maxKeys = 2`): `set(a,x), set(b,y), ttl(a) → −1, set(c,z)` evict **a** (vẫn là cũ nhất), `get(a) → null`, `get(b) → "y"`.
- Mục tiêu: `set/get/delete/ttl/size` O(1), `expire` O(log n), `setTime` O(log n) mỗi key hết hạn. Quét mọi key mỗi `setTime`, hoặc mảng `indexOf` cho LRU, sẽ trượt Perf.

---

## 🔴 Thực tế

### ex02 · MiniRedis — thêm list và sorted set (class)
```java
class MiniRedis {
  MiniRedis(int maxKeys)
  // ── giống MiniKV ──
  void setTime(long now)
  void set(String key, String value)       // ghi đè key BẤT KỲ kiểu → thành chuỗi, xóa TTL
  String get(String key)                   // chuỗi; key không có hoặc KHÔNG PHẢI chuỗi → null
  boolean delete(String key)
  boolean expire(String key, long ttlMs)   // áp dụng cho mọi kiểu
  long ttl(String key)
  int size()
  String type(String key)                  // "string" | "list" | "zset" | "none"
  // ── list ──
  int lpush(String key, String value)      // thêm ở ĐẦU; trả độ dài mới; tạo list nếu chưa có; sai kiểu → −1
  int rpush(String key, String value)      // thêm ở CUỐI; như trên
  String lpop(String key)                  // lấy và xóa phần tử đầu; không có / sai kiểu → null; list rỗng sau đó thì key bị xóa
  String rpop(String key)                  // phần tử cuối; như trên
  List<String> lrange(String key, int start, int stop)   // chỉ số kiểu Redis; không có / sai kiểu → []
  // ── sorted set ──
  int zadd(String key, long score, String member)   // member mới → 1; đã có (đổi điểm, kể cả cùng điểm) → 0; sai kiểu → −1
  boolean zrem(String key, String member)           // true nếu có xóa; zset rỗng sau đó thì key bị xóa
  List<String> zrange(String key, int start, int stop)  // member theo (điểm tăng, member tăng từ điển ASCII); chỉ số kiểu Redis
  int zrank(String key, String member)              // vị trí 0-based trong thứ tự trên; không có / sai kiểu → −1
  Long zscore(String key, String member)            // điểm; không có / sai kiểu → null
}
```
- **Sai kiểu** (vd. `lpush` trên chuỗi, `zadd` trên list): không đổi dữ liệu, trả giá trị thất bại ghi ở trên; key vẫn được tính là "dùng".
- **Chỉ số kiểu Redis** cho `lrange/zrange(key, start, stop)` với `len` phần tử: `start < 0 → max(0, start + len)`; `stop < 0 → stop + len`; `stop ≥ len → len − 1`; nếu `start > stop` hoặc `start ≥ len` → `[]`. Cả hai đầu đều **gồm**.
- Ràng buộc thêm: `|score| ≤ 10¹⁵`; tổng số phần tử `lrange/zrange` trả về trong mọi lần gọi ≤ `2·10⁶`.
- Ví dụ list: `rpush(l,a)→1, rpush(l,b)→2, lpush(l,z)→3, lrange(l,0,−1)→[z,a,b], lrange(l,1,1)→[a], lrange(l,−2,−1)→[a,b], lrange(l,5,9)→[]`, rồi `lpop→z, rpop→b, rpop→a`, `type(l) → "none"`.
- Ví dụ zset: `zadd(z,5,b)→1, zadd(z,5,a)→1, zadd(z,1,c)→1`: `zrange(z,0,−1)→[c,a,b]`, `zrank(z,b)→2`; `zadd(z,0,b)→0` thì `zrange(z,0,1)→[b,c]`, `zrank(z,b)→0`, `zscore(z,b)→0`.
- Ví dụ sai kiểu: `set(s,v)`, `lpush(s,x)→−1`, `zadd(s,1,m)→−1`, `lrange(s,0,−1)→[]`, `lpop(s)→null`, `get(s)→"v"`.
- Mục tiêu: `lpush/rpush/lpop/rpop` O(1) amortized; `lrange` O(k); `zadd/zrem/zrank` O(log n); `zrange` O(log n + k). `Array.splice`/`unshift` cho list hoặc sort lại mỗi lần cho zset sẽ trượt Perf ở case lớn.
- 🧭 Câu hỏi quy mô: dự đoán `heap MB` cho `10⁶` lệnh trộn; chạy `bench` ở scale `l` và giải thích chênh lệch (object `Entry`, DLL, skip list).

---

## Tài liệu bạn phải nộp (cho Pass)

Viết `designs/CAP-mini-redis/DESIGN.md` theo khung 7 bước của `/dsa-design`, ≥ các mục sau:
1. API & ngữ nghĩa (bạn giữ nguyên đề hay đổi? ghi rõ).
2. Tải & ràng buộc (tỉ lệ đọc/ghi giả định, số khóa, kích thước list/zset).
3. Bất biến (≥ 5), kể cả bất biến **giữa** các thành phần.
4. Sơ đồ ghép (mermaid) và `sequenceDiagram` cho `zadd` trên member có sẵn **hoặc** `set` khi đầy.
5. Bảng độ phức tạp từng lệnh.
6. Cách bạn stress test (brute của bạn là gì?) và số `bench`.
7. Đánh đổi: ×10 dữ liệu, đa luồng, nhiều instance, bền vững (RDB/AOF), LRU xấp xỉ (lấy mẫu) của Redis thật.
