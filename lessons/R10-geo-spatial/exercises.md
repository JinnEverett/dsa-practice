# R10 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R10-geo-spatial [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R10-geo-spatial 01`

**Pass:** 4/5 bài qua `check`, trong đó **truy vấn bán kính (ex03) đạt perf ở `10⁵` điểm**.

---

## 🟢 Cơ bản

### ex01 · Geohash
Mã hóa `(lat, lon)` thành geohash độ dài `precision`: chia đôi liên tiếp kinh độ `[−180, 180]` và vĩ độ `[−90, 90]`, **xen kẽ, bắt đầu bằng kinh độ**; giá trị `≥` điểm giữa → bit `1` (lấy nửa trên), ngược lại bit `0`. Mỗi 5 bit → ký tự của bảng `0123456789bcdefghjkmnpqrstuvwxyz`.
```java
String geohash(double lat, double lon, int precision)
```
- Ràng buộc: `−90 ≤ lat ≤ 90`, `−180 ≤ lon ≤ 180`, `1 ≤ precision ≤ 12`.
- Ví dụ: `(57.64911, 10.40744, 11)` → `"u4pruydqqvj"` · `(42.6, −5.6, 5)` → `"ezs42"` · `(0, 0, 5)` → `"s0000"` · `(90, 180, 3)` → `"zzz"` · `(−90, −180, 3)` → `"000"`.

### ex02 · Khoảng cách haversine
```java
double haversineKm(double lat1, double lon1, double lat2, double lon2)
```
- Bán kính Trái Đất `R = 6371.0` km; `a = sin²(Δφ/2) + cos φ₁·cos φ₂·sin²(Δλ/2)`, `d = 2R·asin(√a)`. Góc nhập bằng độ. Sai số cho phép `10⁻⁶` (tương đối).
- Ví dụ: `(0,0,0,90)` → `10007.5433…` (= πR/2) · `(48.8566, 2.3522, 51.5074, −0.1278)` → `343.5560…` · hai điểm trùng → `0`.

---

## 🟡 Kết hợp

### ex03 · Chỉ mục lưới (class)
```java
class GridIndex {
  GridIndex(double cell)
  void add(int id, double x, double y)
  void move(int id, double x, double y)
  List<Integer> withinRadius(double x, double y, double r)
}
```
- Mặt phẳng Euclid. `withinRadius`: mọi `id` có khoảng cách tới `(x, y)` **≤ r** (gồm biên; so sánh bằng bình phương), **tăng dần theo id**. `add`/`move` với `id` đã có là di chuyển điểm; `move` id lạ coi như `add`.
- Ràng buộc: `1 ≤ cell ≤ 10⁶`, `|x|, |y| ≤ 10⁶`, `0 ≤ r ≤ 10⁶`, `id` duy nhất trong `[0, 10⁵)`, tối đa `10⁵` thao tác; trong test lớn tọa độ nguyên trong `[0, 10⁵]`, `cell = 100`, `r ≤ 300`. Mục tiêu: truy vấn không quét mọi điểm.
- Ví dụ: `GridIndex(10)`: `add(1,0,0) add(2,5,5) add(3,100,100)`: `withinRadius(0,0,7)→[1]`, `withinRadius(0,0,8)→[1,2]`, `move(1,100,101)`, `withinRadius(100,100,2)→[1,3]`.

### ex04 · k điểm gần nhất
Trả chỉ số của `k` điểm có khoảng cách Euclid tới `(x, y)` nhỏ nhất, sắp theo `(khoảng cách² tăng, chỉ số tăng)`. `k > n` thì trả tất cả.
```java
int[] kNearest(int[][] pts, int x, int y, int k)
```
- Ràng buộc: `0 ≤ n ≤ 5·10⁵`, `|tọa độ| ≤ 3·10⁷` (khoảng cách² vừa `long`; Java **phải** dùng `long`), `0 ≤ k ≤ 10⁴`. Mục tiêu O(n log k).
- Ví dụ: `[[0,0],[3,4],[1,1],[3,4]]`, `(0,0)`, `k=3` → `[0,2,1]` (hòa ở d² = 25: chỉ số nhỏ trước).

---

## 🔴 Thực tế

### ex05 · 🔴 Chỉ mục tài xế gần nhất (class)
App gọi xe nhận vị trí tài xế liên tục và cần trả lời "3 tài xế gần khách nhất" thật nhanh.
```java
class DriverIndex {
  DriverIndex()
  void update(int driverId, int x, int y)
  void remove(int driverId)
  int[] nearest(int x, int y, int k)
}
```
- `update`: thêm tài xế hoặc cập nhật vị trí. `remove`: bỏ tài xế (id lạ → bỏ qua). `nearest`: tối đa `k` tài xế gần nhất theo khoảng cách Euclid (`≤ k` nếu không đủ), sắp `(khoảng cách² tăng, id tăng)`.
- Ràng buộc: `0 ≤ x, y ≤ 10⁵`, `0 ≤ driverId < 10⁵`, `1 ≤ k ≤ 10`, tối đa `10⁵` thao tác với ~`3·10⁴` tài xế; `nearest` chiếm đa số. Mục tiêu: không quét mọi tài xế mỗi truy vấn.
- Ví dụ: `update(1,0,0) update(2,10,0) update(3,5,0) nearest(0,0,2)→[1,3]`, `remove(1)`, `nearest(0,0,2)→[3,2]`, `update(4,5,0)`, `nearest(0,0,2)→[3,4]` (hòa → id nhỏ).
- **Câu hỏi quy mô:** dự đoán thời gian `nearest` khi số tài xế tăng 10× (3·10³ → 3·10⁴ → 3·10⁵) với lưới, rồi với quét tuyến tính; kiểm chứng bằng `bench` (README mục 4). Điều gì xảy ra với lưới nếu mọi tài xế dồn vào một khu phố?
