# R08 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R08-consistent-hashing [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R08-consistent-hashing 01`

**Pass:** 4/5 bài qua `check` + mô phỏng phân phối key (ex02 với `vnodes = 1, 10, 100`) và nhận xét bằng lời.

**Hash (xem README mục 0):** `fnv1a32(s)`: `h = 2166136261`; với mỗi ký tự `c` (ASCII): `h = (h XOR c) · 16777619 mod 2³²`. `fmix32(h)`: `h ^= h>>>16; h = h·0x85ebca6b; h ^= h>>>13; h = h·0xc2b2ae35; h ^= h>>>16` (mod 2³², dịch phải logic). `g(s) = fmix32(fnv1a32(s))`, giá trị 32 bit **không dấu**.

---

## 🟢 Cơ bản

### ex01 · Consistent hash ring (class)
Mỗi node `node` với `vnodes` token có tên `node#0 … node#(vnodes−1)`, vị trí `g(tên token)`. Các token xếp theo `(vị trí tăng, tên token tăng)`. `getNode(key)`: token **đầu tiên** có vị trí `≥ g(key)`; nếu không có thì token đầu danh sách; vòng rỗng → `""`. `addNode` với node đã tồn tại thì **thay** các token cũ bằng bộ mới; `removeNode` node lạ là không làm gì.
```java
class ConsistentHashRing {
  ConsistentHashRing()
  void addNode(String node, int vnodes)
  void removeNode(String node)
  String getNode(String key)
}
```
- Ràng buộc: `1 ≤ vnodes ≤ 500`, tên node/khóa ASCII ≤ 20 ký tự, tối đa `10⁵` thao tác, tổng số token ≤ `10⁴`; `getNode` chiếm đa số.
- Ví dụ: `addNode(A,3) getNode(user1)→A addNode(B,3) removeNode(A) getNode(user1)→B removeNode(B) getNode(user1)→""`.

### ex03 · Rendezvous hashing
Điểm của node `n` với key `k` là `g(n + ":" + k)`. Trả node có điểm **cao nhất**; hòa → tên node nhỏ hơn (mã ký tự); `nodes` rỗng → `""`.
```java
String rendezvousPick(String key, String[] nodes)
```
- Ràng buộc: `0 ≤ |nodes| ≤ 10⁵`, tên node khác nhau. Thứ tự trong `nodes` không ảnh hưởng.
- Ví dụ: `("user1", [a,b,c,d])` → `b` (điểm 4261768284) · `("user2", [d,a,c])` → `c` · `("x", [])` → `""`.

---

## 🟡 Kết hợp

### ex02 · Tỉ lệ key phải di chuyển khi thêm node
Dựng vòng từ `nodes` (mỗi node `vnodes` token), ghi chủ của các key `"key0" … "key{keys−1}"`, thêm `newNode` (cũng `vnodes` token), rồi trả **tỉ lệ key đổi chủ** (đổi chủ / keys).
```java
double movedFraction(String[] nodes, int vnodes, String newNode, int keys)
```
- Ràng buộc: `1 ≤ |nodes| ≤ 100`, `1 ≤ vnodes ≤ 500`, `1 ≤ keys ≤ 2·10⁵`, `newNode` chưa có trong `nodes`. Sai số cho phép `10⁻⁶`.
- Nhiệm vụ mô phỏng (sau khi qua `check`): với 9 node và 10⁵ key, chạy `vnodes = 1, 10, 100` và so với lý tưởng `1/10`. Mọi key di chuyển có đều chuyển *sang node mới* không? So với `hash(key) mod N`?

### ex04 · Merkle root
`H(s)` = `fnv1a32(s)` viết thành **đúng 8 chữ số hex thường**. Lá của khối `b` là `H("L" + b)`. Mỗi tầng ghép cặp từ trái sang phải: nút cha `H("N" + trái + phải)`; nếu tầng có số nút lẻ, nút cuối **thăng lên tầng trên nguyên vẹn**. Một khối → gốc là lá. Không có khối → `""`.
```java
String merkleRoot(String[] blocks)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, mỗi khối ASCII ≤ 30 ký tự (có thể rỗng).
- Ví dụ: `["a"]` → `"47e217fe"` · `["a","b"]` → `"c67c2cb8"` · `["a","b","c"]` → `"9afacca6"` · `[""]` → `"c90bfeab"`.

---

## 🔴 Thực tế

### ex05 · 🔴 Merkle tree cập nhật tăng dần (class)
Dịch vụ lưu trữ giữ cây Merkle trên các block dữ liệu để so khớp bản sao; mỗi lần ghi một block, gốc phải được cập nhật mà không băm lại cả cây. `root()` luôn bằng `merkleRoot` của dãy block hiện tại (cùng quy tắc ex04).
```java
class MerkleSync {
  MerkleSync(String[] blocks)
  void update(int i, String block)
  String root()
}
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ i < n`, tối đa `10⁵` thao tác (`update` + `root`). Mục tiêu: `update` O(log n).
- Ví dụ: `MerkleSync([a,b,c])`: `root() → "9afacca6"`, `update(2,x)`, `root() = merkleRoot([a,b,x])`, `update(2,c)`, `root() → "9afacca6"`.
- **Câu hỏi quy mô:** với `n = 10⁶` khối, một `update` cần bao nhiêu lần băm? Dựng lại cả cây cần bao nhiêu? `bench` ex05 để xác nhận.
