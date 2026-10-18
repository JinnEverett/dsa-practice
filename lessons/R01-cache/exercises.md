# R01 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R01-cache [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R01-cache 01`

**Pass:** 5/5 bài qua `check` + `bench` ex01 và ex05 ở `s,m,l`, giải thích bằng lời chênh lệch hằng số (câu hỏi quy mô ở cuối).

Mọi bài class dùng thời gian logic do người gọi truyền vào (`now`), **không** đọc đồng hồ thật.

---

## 🟢 Cơ bản

### ex01 · LRU cache (class)
```java
class LRUCache {
  LRUCache(int capacity)
  int get(int key)
  void put(int key, int value)
}
```
- `get`: trả giá trị và đánh dấu "vừa dùng"; không có → `-1`. `put`: thêm/cập nhật và đánh dấu vừa dùng; nếu vượt `capacity` thì đuổi key **lâu chưa dùng nhất**.
- Ràng buộc: `1 ≤ capacity ≤ 10⁵`, tối đa `10⁵` thao tác, `0 ≤ key, value ≤ 10⁶`. Mục tiêu O(1) mỗi thao tác.
- Ví dụ: `LRUCache(2)`, `put(1,1) put(2,2) get(1)→1 put(3,3) get(2)→-1 put(4,4) get(1)→-1 get(3)→3 get(4)→4`. (LeetCode 146)

### ex02 · Cache có TTL (class)
```java
class TTLCache {
  TTLCache(int capacity)
  void put(int key, int value, long ttl, long now)
  int get(int key, long now)
}
```
- `put` lưu entry sống trong `[now, now + ttl)`; `get` tại `now ≥ now_put + ttl` coi như không có (`-1`). `now` không giảm theo thời gian gọi.
- Entry hết hạn **không tính vào capacity**. Khi `put` key mới mà cache còn `capacity` entry **còn sống**, đuổi entry sống lâu chưa dùng nhất (LRU). `put` key đang sống: cập nhật value + ttl, đánh dấu vừa dùng. `get` hit cũng đánh dấu vừa dùng.
- Ràng buộc: `1 ≤ capacity ≤ 10⁵`, `1 ≤ ttl ≤ 10⁹`, `0 ≤ now ≤ 10¹²`, tối đa `10⁵` thao tác. Mục tiêu O(log n) amortized (không quét toàn bộ).
- Ví dụ: `TTLCache(2)`, `put(1,10,5,0) put(2,20,100,1) get(1,4)→10 get(1,5)→-1 get(2,6)→20`.

### ex03 · Hit ratio: LRU vs FIFO
Mô phỏng hai cache cùng `capacity` trên chuỗi `requests` (mỗi request là một key; miss thì nạp vào cache, đầy thì đuổi theo chính sách của mình). Trả `[lruHitRatio, fifoHitRatio]` với ratio = số hit / số request. FIFO: hit **không** đổi thứ tự.
```java
double[] hitRatios(int capacity, int[] requests)
```
- Ràng buộc: `1 ≤ capacity ≤ 10⁵`, `1 ≤ |requests| ≤ 10⁵`, `0 ≤ requests[i] ≤ 10⁹`. Sai số cho phép `10⁻⁶`.
- Ví dụ: `hitRatios(3, [1,2,3,4,1,2,5,1,2,3,4,5])` → `[2/12, 3/12]` · với `capacity = 4` → `[4/12, 2/12]` (FIFO còn *tệ hơn* khi cache to hơn — Bélády).

---

## 🟡 Kết hợp

### ex04 · 🔴 Cache giá sản phẩm có invalidate (class)
Dịch vụ giá lưu cache `productId → price`, mỗi sản phẩm thuộc một category. Khi chạy khuyến mãi, team giá xóa cache theo **cả category**; khi sửa lẻ thì xóa theo sản phẩm. Cache giới hạn `capacity` sản phẩm, đầy thì đuổi sản phẩm lâu chưa dùng nhất (LRU).
```java
class PriceCache {
  PriceCache(int capacity)
  void put(int productId, int categoryId, int price)
  int get(int productId)
  void invalidateProduct(int productId)
  int invalidateCategory(int categoryId)
  int size()
}
```
- `get`: giá hoặc `-1`; hit đánh dấu vừa dùng. `put`: thêm/cập nhật (có thể đổi category), đánh dấu vừa dùng. `invalidateCategory` trả **số entry đã xóa** (0 nếu không có). `size` là số entry hiện có.
- Ràng buộc: `1 ≤ capacity ≤ 10⁵`, `0 ≤ id, category ≤ 10⁶`, `1 ≤ price ≤ 10⁶`, tối đa `10⁵` thao tác. Mục tiêu: `invalidateCategory` tỉ lệ với số entry bị xóa, không phải với `capacity`.
- Ví dụ: `PriceCache(3)`, `put(1,7,100) put(2,7,200) put(3,8,300) invalidateCategory(7)→2 get(1)→-1 get(3)→300 size()→1`.

---

## 🔴 Thực tế

### ex05 · LRU bằng hash map + doubly linked list (class)
Cùng hành vi như ex01 nhưng **bắt buộc tự cài DLL + hash map**: không dùng `Map`/`dict`/`LinkedHashMap` *vì thứ tự của chúng* (chỉ dùng hash map để tìm node theo key). Thêm `keys()` để kiểm tra thứ tự.
```java
class LRUCacheList {
  LRUCacheList(int capacity)
  int get(int key)
  void put(int key, int value)
  List<Integer> keys()
}
```
- `keys()` trả mọi key từ **mới dùng nhất → lâu nhất**, không đổi thứ tự. Các ràng buộc khác như ex01.
- Máy chấm không phân biệt được cách cài — đây là bài tự giác. Sau khi qua `check`: `bench` ex01 và ex05 ở `--scales s,m,l`, so bảng với README mục 2.
- **Câu hỏi quy mô:** dự đoán thời gian `l` (10⁶ thao tác) của ex01 và ex05 trước khi chạy; số mũ ước lượng của mỗi bản là bao nhiêu và vì sao khác nhau?
