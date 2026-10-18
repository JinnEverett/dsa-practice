# R10 · Geo & spatial index

## Sau buổi này bạn sẽ
- Mã hóa vị trí thành **geohash** và biết tiền tố chuỗi tương ứng một ô chữ nhật.
- Tính khoảng cách trên mặt cầu bằng **haversine**.
- Dựng **chỉ mục lưới** để trả lời "điểm trong bán kính" và "k điểm gần nhất" không cần quét hết.
- Chọn cấu trúc theo bài toán: lưới / quadtree / k-d tree / geohash-trong-DB / PostGIS.

## 1. Geohash
Chia đôi liên tiếp khoảng kinh độ `[−180, 180]` và vĩ độ `[−90, 90]`, **xen kẽ, bắt đầu bằng kinh độ**; bit `1` nếu giá trị ≥ điểm giữa. Cứ 5 bit → một ký tự base32 `0123456789bcdefghjkmnpqrstuvwxyz` (không có `a i l o`).
```
 (57.64911, 10.40744) → u4pruydqqvj        (42.6, −5.6) → ezs42        (0, 0) → s0000
 độ dài 1 ≈ 5000×5000 km … 5 ≈ 4,9×4,9 km … 7 ≈ 153×153 m … 12 ≈ 3,7×1,9 cm
```
- Điểm gần nhau thường chung tiền tố ⇒ "trong vùng" = `LIKE 'u4pr%'` trên index B-tree. **Nhưng** hai điểm sát nhau qua ranh giới ô có tiền tố khác hẳn ⇒ phải tra thêm 8 ô lân cận.
- Ô geohash méo theo vĩ độ (hẹp lại về hai cực).

## 2. Haversine
`a = sin²(Δφ/2) + cos φ₁ cos φ₂ sin²(Δλ/2)`, `d = 2R·asin(√a)`, `R = 6371,0 km`. Ổn định cho khoảng cách nhỏ (công thức cosine lượng giác cầu mất chính xác). Cầu ≠ elip: sai số tới ~0,5% so với Vincenty. Ví dụ: Paris–London ≈ 343,56 km; Hà Nội–TP.HCM ≈ 1137,8 km (đường chim bay).

## 3. Lưới đều (uniform grid)
```
 cell = 100         ┌─────┬─────┬─────┐
                    │ ·   │  ·  │     │   withinRadius((x,y), r): chỉ duyệt các ô giao với
                    ├─────┼──●──┼─────┤   hình vuông [x±r, y±r], rồi lọc bằng dist² ≤ r²
                    │     │ ·   │   · │
                    └─────┴─────┴─────┘
```
- Chọn `cell ≈ bán kính truy vấn`. Cập nhật vị trí = gỡ khỏi ô cũ, thêm vào ô mới: O(1) — hợp dữ liệu di chuyển liên tục (tài xế, game).
- Dữ liệu dồn cụm: nhiều điểm/ô ⇒ quadtree (chia nhỏ ô đông). Dữ liệu tĩnh, nhiều chiều: k-d tree. Trong DB: PostGIS (GiST/R-tree) hoặc geohash + index.

**Đo thật** (điểm ngẫu nhiên đều trong 10⁵×10⁵, cell = 100, r = 300, 2000 truy vấn; máy soạn):

| số điểm | lưới | quét tuyến tính |
|---|---|---|
| 10³ | 4,8 ms | 12 ms |
| 10⁴ | 6,1 ms | 54 ms |
| 10⁵ | 20,8 ms | 557 ms |

Lưới gần như không tăng theo số điểm (số điểm trong vùng truy vấn mới là cái quyết định); quét tuyến tính tăng tuyến tính.

## 4. k điểm gần nhất
- **Một lần, không chỉ mục:** max-heap kích thước k, O(n log k) (đúng bằng ex04; với k ≪ n rẻ hơn sort O(n log n)).
- **Nhiều lần trên cùng tập điểm động:** lưới + duyệt **vòng ô** từ ô chứa điểm truy vấn ra ngoài. Điểm chưa quét cách truy vấn > `r·cell` sau khi quét xong vòng `r`, nên dừng khi đã có ≥ k ứng viên và ứng viên thứ k có khoảng cách ≤ `r·cell`.

Đo thật (tài xế rải đều trong 10⁵×10⁵, `nearest(k=3)`, 2000 truy vấn, ô 512):

| số tài xế | lưới (vòng ô) | quét + heap |
|---|---|---|
| 10³ | 15,4 ms | 22 ms |
| 10⁴ | 5,5 ms | 131 ms |
| 10⁵ | 19,9 ms | 1 394 ms |

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Khóa ô ghép | `(cx + OFF) * 2²² + (cy + OFF)` (số) | tuple `(cx, cy)` | `long` = `cx * M + cy` |
| `floor` âm | `Math.floor` | `math.floor` / `//` | `Math.floorDiv` / `Math.floor` (không ép `int` thẳng) |
| Heap | `Heap` (I04) | `heapq.nsmallest` | `PriorityQueue` |
| Khoảng cách² | `number` đủ tới ~9·10¹⁵ | `int` | **`long`** |

## 6. Bẫy
1. Geohash: bắt đầu bằng vĩ độ thay vì kinh độ; so sánh `>` thay vì `>=`.
2. Haversine: quên đổi radian; `sin²(Δφ)` thay `sin²(Δφ/2)`.
3. Lưới: `trunc` thay `floor` với tọa độ âm; quét chỉ ô chứa điểm truy vấn (bỏ sót điểm bên kia ranh giới ô).
4. So sánh `dist ≤ r` bằng `sqrt` thay vì bình phương (sai số tại biên).
5. `nearest` dừng ngay khi đủ k ứng viên (chưa chắc là k gần nhất).
6. `move` không gỡ khỏi ô cũ ⇒ điểm "ma".

## 7. Độ phức tạp
| | time | space |
|---|---|---|
| geohash | O(5·p) | O(p) |
| Grid add/move | O(1) | O(n) |
| Grid withinRadius | O((r/cell)² + k) | |
| kNearest (heap) | O(n log k) | O(k) |
| DriverIndex nearest | O(vòng² + ứng viên) | O(n) |

## 8. Câu hỏi quy mô
10⁵ tài xế cập nhật vị trí mỗi 5 giây = 20 000 cập nhật/giây; mỗi giây có 3 000 yêu cầu "tìm 3 tài xế gần nhất". Ước lượng số phép của quét tuyến tính so với lưới (bảng mục 4), rồi chạy `bench` ex05. Chọn `cell` thế nào khi mật độ tài xế ở trung tâm gấp 100 lần vùng ngoại ô?
