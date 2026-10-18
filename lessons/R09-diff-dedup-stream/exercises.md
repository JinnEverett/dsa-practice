# R09 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R09-diff-dedup-stream [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R09-diff-dedup-stream 01`

**Pass:** 4/5 bài qua `check`, trong đó ex01 (Myers đạt perf ở `10⁵` dòng).

---

## 🟢 Cơ bản

### ex01 · Khoảng cách diff Myers
Trả `D` = số dòng **thêm + xóa** ít nhất để biến `a` thành `b` (`D = |a| + |b| − 2·LCS`). Thay một dòng = một xóa + một thêm.
```java
int myersDistance(String[] a, String[] b)
```
- Ràng buộc: `0 ≤ |a|, |b| ≤ 10⁵`; dòng so bằng nội dung. Trong test lớn hai file giống nhau trừ ≤ 100 chỗ sửa. Mục tiêu O((N+M)·D).
- Ví dụ: `[A,B,C,A,B,B,A]` vs `[C,B,A,B,A,C]` → `5` · `[a,b,c]` vs `[a,c]` → `1` · `[x]` vs `[y]` → `2` · `[]` vs `[a,b,c]` → `3`.

### ex02 · Dedup giới hạn bộ nhớ (class)
```java
class Dedup {
  Dedup(int capacity)
  boolean seen(String id)
}
```
- `seen(id)`: trả `true` nếu `id` đang được nhớ; luôn ghi nhận/làm mới `id` là vừa gặp. Chỉ nhớ `capacity` id **gần nhất** (LRU): vượt thì quên id lâu nhất. Id đã bị quên được coi là mới (`false`).
- Ràng buộc: `1 ≤ capacity ≤ 10⁵`, tối đa `10⁵` thao tác, id ASCII ≤ 20 ký tự. Mục tiêu O(1) mỗi thao tác.
- Ví dụ: `Dedup(2)`: `seen(a)→F seen(b)→F seen(a)→T seen(c)→F seen(b)→F seen(a)→F`.

---

## 🟡 Kết hợp

### ex03 · p95 trong cửa sổ 60 giây (class)
```java
class P95Window {
  P95Window()
  void add(long t, int latency)
  int p95(long t)
}
```
- `p95(t)`: xét các mẫu có `t − 60000 < thờiĐiểm ≤ t`; sắp latency tăng dần, trả phần tử hạng `⌈0,95·cnt⌉` (hạng 1 là nhỏ nhất; dùng `⌊(95·cnt + 99) / 100⌋`). Không có mẫu → `0`.
- `t` ở mọi lần gọi (cả `add` lẫn `p95`) không giảm. Ràng buộc: `0 ≤ latency ≤ 2000`, `0 ≤ t ≤ 10¹²`, tối đa `10⁵` thao tác, cửa sổ chứa tới ~10³ mẫu.
- Ví dụ: `add(0,100) add(1,200) add(2,300) p95(3)→300 p95(60000)→300 p95(60002)→0`. Với 20 mẫu `1..20` ở `t = 1..20`: `p95(20) → 19`.

### ex04 · 🔴 Gom sự kiện thành phiên
Analytics gom các sự kiện của từng user thành **phiên**: sự kiện mới mở phiên mới nếu user chưa có sự kiện nào hoặc cách sự kiện liền trước *của user đó* **hơn** `gap` (đúng bằng `gap` thì cùng phiên). Id phiên cấp lần lượt `0, 1, 2, …` theo thứ tự các phiên được mở trong log.
```java
int[] sessionize(String[] users, long[] times, long gap)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `times` không giảm (log đã sắp), `0 ≤ times ≤ 10¹²`, `0 ≤ gap ≤ 10¹²`. Mục tiêu O(n).
- Ví dụ: `users=[a,b,a,a,b]`, `times=[0,5,10,100,200]`, `gap=50` → `[0,1,0,2,3]`.

---

## 🔴 Thực tế

### ex05 · 🔴 Lấy mẫu log bằng reservoir sampling
Cần chọn ngẫu nhiên đều `k` dòng debug từ luồng log (không đọc lại được). Cài Algorithm R với RNG đặc tả để kết quả tất định: `state = seed`; `next()`: `state = (state · 1103515245 + 12345) mod 2³¹` rồi trả `state`; `nextInt(b) = ⌊next() · b / 2³¹⌋`.
```java
int[] sampleLog(int[] lines, int k, int seed)
```
- Thuật toán: `res` = `k` dòng đầu; với `i = k, k+1, …, n−1`: `j = nextInt(i + 1)`; nếu `j < k` thì `res[j] = lines[i]`. Trả `res` (độ dài `min(k, n)`; `next()` chỉ được gọi cho `i ≥ k`).
- Ràng buộc: `0 ≤ n ≤ 10⁶`, `0 ≤ k ≤ 10⁴`, `0 ≤ seed < 2³¹`. **Chú ý tràn** khi nhân `state · 1103515245` (Java dùng `long`).
- Ví dụ: `[10,20,30], k=2, seed=1` → `[10,30]` · `[0..9], k=3, seed=42` → `[8,1,5]` · `[1,2], k=5` → `[1,2]`.
- **Câu hỏi quy mô:** mỗi dòng có xác suất `k/n` nằm trong mẫu — kiểm chứng bằng mô phỏng: chạy với 10⁴ seed khác nhau trên `n = 20, k = 5`, đếm tần suất từng vị trí; sai lệch so với `5/20 = 25%` cỡ bao nhiêu?
