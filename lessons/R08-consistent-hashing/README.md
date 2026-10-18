# R08 · Consistent hashing & Merkle tree

## Sau buổi này bạn sẽ
- Cài **consistent hash ring** với virtual node, và đo tải + lượng key phải di chuyển khi thêm node.
- So sánh với **rendezvous hashing**.
- Dựng **Merkle tree** (gốc băm, cập nhật O(log n)) để so sánh/đồng bộ dữ liệu giữa hai bản sao.

## 0. Hash dùng trong module (đặc tả để tất định)
Giống R07: `g(s) = fmix32(fnv1a32(s))` (32 bit không dấu). Test vector: `fnv1a32("foobar") = 0xbf9cf968`, `g("a") = 0x1a80b1b3`. Nhân 32 bit: TS `Math.imul(...) >>> 0`, Python `& 0xFFFFFFFF`, Java `long` + mask.
Merkle dùng `fnv1a32` thuần viết thành **8 chữ số hex thường** (đệm 0 đầu).

## 1. Vì sao không `hash(key) mod N`
Thêm 1 node khiến `N → N+1`: gần như mọi key đổi chủ. Đo thật (9 → 10 node, 10⁵ key): `mod N` chuyển **90,0%** key (lý thuyết N/(N+1) = 90%) — cache lạnh toàn bộ, shard di chuyển toàn bộ.

## 2. Hash ring
```
 vòng 0 … 2³²−1 (khép kín)
   A#0     B#0       A#1   C#0     B#1
 ──●────────●─────────●─────●───────●──►
        key k ──► đi theo chiều kim đồng hồ tới token đầu tiên có pos ≥ g(k) (quá cuối thì quay về token đầu)
```
- Token `node#i` đặt tại `g("node#i")`. Thêm node: chỉ các key nằm giữa token mới và token liền trước chuyển sang node mới → ≈ 1/(N+1) key.
- **Virtual node** (nhiều token/node) làm tải đều. Đo thật (9 node, 10⁵ key; tải = số key/node so với trung bình):

| vnodes | max/mean | min/mean | key chuyển khi thêm node thứ 10 (lý tưởng 10%) |
|---|---|---|---|
| 1 | 2,08 | 0,14 | 13,9% |
| 10 | 1,70 | 0,67 | 10,8% |
| 100 | 1,11 | 0,92 | 11,6% |
| 500 | 1,05 | 0,96 | 9,8% |

- Tra cứu = binary search trên mảng token đã sắp: O(log T). `TreeMap.ceilingEntry` (Java), `bisect` (Python).

## 3. Rendezvous (HRW) hashing
Chủ của key = node có **điểm `g(node + ":" + key)` cao nhất**. Không cần cấu trúc dữ liệu hay vnode; bớt node chỉ chuyển các key mà node đó đang thắng. Tra cứu O(N) — hợp với N nhỏ (vài chục–trăm), ring hợp N lớn.

## 4. Merkle tree
```
            root = H(N‖ab‖c')          lá = H("L" + khối);  nút = H("N" + trái + phải)
           /                \          số nút lẻ ở một tầng: nút cuối thăng lên NGUYÊN VẸN
      H(N‖A‖B)               C
      /     \
   H(L‖a)  H(L‖b)    ...
```
- Hai bản sao so **gốc**: bằng nhau ⇒ dữ liệu giống nhau (với xác suất va chạm hash). Khác ⇒ đi xuống nhánh có hash khác, tìm khối lệch trong O(d·log n) thay vì so n khối. Cassandra anti-entropy, Git, blockchain đều dùng.
- Cập nhật khối `i`: băm lại **một đường** từ lá lên gốc, O(log n) — không dựng lại cả cây.
- Tiền tố `"L"`/`"N"` tách miền băm của lá và nút trong (chống "second preimage": nối hai lá giả làm một nút trong).
- Bitcoin nhân đôi nút lẻ; bài này thăng nút lẻ lên (khác biệt có chủ đích — đọc kỹ đề).

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Tìm token ≥ vị trí | binary search tự viết | `bisect.bisect_left` | `TreeMap.ceilingEntry` / `Arrays.binarySearch` |
| Hash 32 bit | `Math.imul`, `>>> 0` | `& 0xFFFFFFFF` | `long` + `0xFFFFFFFFL` |
| Hex 8 chữ số | `toString(16).padStart(8, '0')` | `'%08x' % h` | `String.format("%08x", h)` |

## 6. Bẫy
1. Vị trí hash có dấu (`int` Java, `|0` trong JS) → so sánh sai; luôn dùng không dấu.
2. Quên vòng về token đầu khi key vượt token lớn nhất.
3. `addNode` lại cùng tên: token cũ phải bị thay, không cộng dồn.
4. Merkle: hex thiếu số 0 đầu; nhân đôi nút lẻ (khác đề); nối sai thứ tự trái/phải.
5. Nghĩ "vnode nhiều hơn = luôn tốt hơn": bộ nhớ và thời gian dựng lại tăng, lợi ích giảm dần (xem bảng).

## 7. Độ phức tạp
| | time | space |
|---|---|---|
| Ring getNode / add / remove | O(log T) / O(T log T) | O(T) |
| Rendezvous | O(N) | O(1) |
| merkleRoot | O(n) hash | O(n) |
| MerkleSync update / root | O(log n) / O(1) | O(n) |

## 8. Câu hỏi quy mô
Cluster 100 node × 100 vnode (T = 10⁴), 10⁶ lookup/giây. Ước lượng chi phí lookup bằng quét tuyến tính so với binary search; rồi `bench` ex01 ở `m`. Với MerkleSync 10⁶ khối: một `update` tốn bao nhiêu hash, so với dựng lại toàn bộ?
