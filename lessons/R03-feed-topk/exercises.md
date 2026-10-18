# R03 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R03-feed-topk [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R03-feed-topk 01`

**Pass:** 4/5 bài qua `check` (cả ex01 và ex05 phải qua) + trả lời câu hỏi quy mô.

---

## 🟢 Cơ bản

### ex01 · Feed gộp với cursor (class)
Mỗi người dùng có một feed gồm các bài `[ts, id]`, đã sắp **giảm dần** theo `(ts, id)`. Gộp mọi feed thành dòng thời gian chung (mới nhất trước) và phân trang bằng cursor. **Key** của bài là `ts·10⁶ + id`; `page(cursor, limit)` trả tối đa `limit` bài có `key < cursor`, theo key giảm dần. Trang đầu dùng `cursor = 2·10¹⁵`; trang sau dùng key của bài cuối trang trước.
```java
class FeedMerger {
  FeedMerger(int[][][] feeds)
  int[][] page(long cursor, int limit)
}
```
- Ràng buộc: `1 ≤ ts ≤ 10⁹`, `0 ≤ id < 10⁶`, **id duy nhất** trên toàn bộ feeds; tổng số bài ≤ `10⁵`, số feed ≤ `10³`; `1 ≤ limit ≤ 100`; tối đa `10⁴` lần `page`. Feed có thể rỗng.
- Mục tiêu: mỗi `page` không phụ thuộc vào tổng số bài (binary search + heap).
- Ví dụ: `feeds = [[[50,3],[20,1]], [[40,9],[20,7],[5,2]]]`: `page(2·10¹⁵, 3)` → `[[50,3],[40,9],[20,7]]`, rồi `page(20000007, 10)` → `[[20,1],[5,2]]`.

### ex02 · Top K từ thường xuyên nhất
Trả `k` từ xuất hiện nhiều nhất, xếp theo số lần giảm dần; bằng nhau thì theo thứ tự từ điển tăng dần (so sánh theo mã ký tự).
```java
List<String> topKFrequentWords(String[] words, int k)
```
- Ràng buộc: `1 ≤ |words| ≤ 10⁵`, từ gồm chữ thường/số, độ dài ≤ 10, `1 ≤ k ≤ 10⁴`. Nếu `k` lớn hơn số từ khác nhau, trả hết.
- Ví dụ: `["i","love","leetcode","i","love","coding"], k=2` → `["i","love"]`. (LeetCode 692)
- Mục tiêu: O(n + m log k).

### ex03 · TopKCounter (class)
```java
class TopKCounter {
  TopKCounter()
  void add(String item)
  List<String> top(int k)
}
```
- `top(k)`: như ex02 trên toàn bộ các `add` từ đầu. Ràng buộc: `1 ≤ k ≤ 10`, tối đa `10⁵` thao tác, khoảng `2000` item khác nhau; `top` gọi thưa nhưng không ít (~2%).
- Ví dụ: `add(x) add(y) add(x) top(1)→[x] add(y) top(2)→[x,y]` (hòa: chữ cái tăng dần).

---

## 🟡 Kết hợp

### ex04 · 🔴 Hashtag đang thịnh hành (class)
Mạng xã hội cần widget "Trending" cho cửa sổ **1 giờ gần nhất**: một bài đăng thuộc cửa sổ của `t` nếu `t − 3 600 000 < postTime ≤ t`.
```java
class Trending {
  Trending()
  void post(String tag, long t)
  List<String> top(int k, long t)
}
```
- `top(k, t)`: tối đa `k` tag có nhiều bài nhất trong cửa sổ, count giảm dần, hòa thì tag tăng dần; tag có count 0 không xuất hiện. Thời gian `t` ở mọi lần gọi (cả `post` lẫn `top`) **không giảm**.
- Ràng buộc: `0 ≤ t ≤ 10¹²`, `1 ≤ k ≤ 10`, tối đa `10⁵` thao tác, ~300 tag đang hoạt động.
- Ví dụ: `post(a,0) post(b,1000) post(a,2000) top(2,3000)→[a,b] top(2,3600000)→[a,b] top(2,3601000)→[a]`.

---

## 🔴 Thực tế

### ex05 · 🔴 Gộp timeline từ nhiều nguồn
Trang tổng quan lấy `limit` sự kiện **sớm nhất** từ `k` nguồn log (mỗi nguồn đã tăng dần theo timestamp ms). Giá trị trùng giữa các nguồn vẫn giữ nguyên.
```java
long[] mergeTimelines(long[][] streams, int limit)
```
- Ràng buộc: `0 ≤ k ≤ 10³`, tổng số phần tử ≤ `10⁶`, `0 ≤ limit ≤ 10³`, giá trị ≤ `10¹²`. Nguồn rỗng hợp lệ; `limit` lớn hơn tổng → trả tất cả.
- Ví dụ: `[[1,4,9],[2,3,10],[]], limit=5` → `[1,2,3,4,9]`.
- **Câu hỏi quy mô:** dự đoán tỉ lệ thời gian giữa "gộp hết rồi sort" và heap ở `N = 10⁶`, `limit = 100`. Kiểm chứng bằng cách `bench` bản của bạn và một bản sort-all (`--file`).
