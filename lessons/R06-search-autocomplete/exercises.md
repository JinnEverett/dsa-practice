# R06 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R06-search-autocomplete [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R06-search-autocomplete 01`

**Pass:** 4/5 bài qua `check`, trong đó **ex01 đạt perf ở 10⁵ thao tác**.

---

## 🟢 Cơ bản

### ex01 · Gợi ý top-k có cache tại node (class)
Hệ thống gợi ý tìm kiếm: mỗi lần người dùng chọn một cụm từ, `add(word, weight)` cộng `weight` vào **tổng điểm** của nó. `query(prefix)` trả tối đa `k` từ có tiền tố `prefix` (kể cả từ bằng đúng `prefix`), xếp theo tổng điểm **giảm dần**, hòa thì từ **tăng dần** (mã ký tự). `prefix` rỗng = top toàn cục.
```java
class Suggest {
  Suggest(int k)
  void add(String word, int weight)
  List<String> query(String prefix)
}
```
- Ràng buộc: `1 ≤ k ≤ 10`, từ gồm chữ thường/số, độ dài `1..20`, `1 ≤ weight ≤ 10⁶`, tối đa `10⁵` thao tác, ~`2·10⁴` từ khác nhau.
- Mục tiêu: `query` tỉ lệ với `|prefix| + k`, không với số từ.
- Ví dụ: `Suggest(2)`: `add(apple,5) add(app,5) add(apply,1) add(banana,9) query(ap)→[app,apple] query("")→[banana,app] query(x)→[]`.

### ex02 · Inverted index (class)
```java
class SearchIndex {
  SearchIndex()
  void add(int docId, String text)
  List<Integer> query(String q)
}
```
- Token = chuỗi con không có khoảng trắng, **không phân biệt hoa/thường** (so sánh sau khi đổi chữ thường). `query(q)`: mọi `docId` (tăng dần) chứa **tất cả** token khác nhau của `q`. `q` không có token → `[]`.
- Ràng buộc: `docId` đưa vào **tăng ngặt**; tối đa `10⁵` thao tác; ~`2000` token khác nhau; mỗi doc ≤ 10 token.
- Ví dụ: `add(1,"The quick brown fox") add(2,"quick quick red fox") add(5,"brown dog")`: `query("quick fox")→[1,2]`, `query("BROWN")→[1,5]`, `query("quick dog")→[]`.

### ex03 · Fuzzy match theo khoảng cách sửa
Trả mọi từ trong `dict` có khoảng cách Levenshtein tới `q` **≤ maxDist**, xếp theo `(khoảng cách tăng, từ tăng)`.
```java
List<String> fuzzyMatch(String[] dict, String q, int maxDist)
```
- Ràng buộc: `0 ≤ |dict| ≤ 10⁵` từ khác nhau, độ dài ≤ 20, `0 ≤ maxDist ≤ 3`, `0 ≤ |q| ≤ 20`.
- Ví dụ: `["book","back","boot","cook","books","hook"], "book", 1` → `["book","books","boot","cook","hook"]` · `["kitten"], "sitting", 3` → `["kitten"]`.
- Bài này không có perf riêng (tự giác): hãy cài DP hai hàng + cắt sớm rồi `bench` với từ điển 10⁵ từ.

---

## 🟡 Kết hợp

### ex04 · 🔴 Tìm tên tiếng Việt không dấu
Danh bạ nội bộ có tên tiếng Việt; nhân viên thường gõ không dấu. Trả các tên (theo **thứ tự gốc**) mà **mỗi token của truy vấn là tiền tố của một token trong tên** sau khi chuẩn hóa: bỏ dấu (kể cả `đ→d`), không phân biệt hoa/thường. Truy vấn không có token → trả mọi tên. Tên/truy vấn có thể ở dạng dựng sẵn (NFC) hoặc tổ hợp (NFD).
```java
List<String> searchVietnamese(String[] names, String query)
```
- Ràng buộc: `0 ≤ |names| ≤ 10⁵`, mỗi tên ≤ 50 ký tự. Chỉ có chữ cái Latin, tiếng Việt và khoảng trắng.
- Ví dụ: `["Nguyễn Văn Đạt","Đặng Thị Hà","Dương Đức Anh"], "dat"` → `["Nguyễn Văn Đạt"]` · `"ĐỨC d"` trên `["Dương Đức Anh"]` → khớp (thứ tự token truy vấn không quan trọng).

---

## 🔴 Thực tế

### ex05 · 🔴 BK-tree cho tìm sai chính tả
Sửa lỗi gõ sai trong ô tìm kiếm cần tra cứu theo khoảng cách sửa trên từ điển lớn. Cài BK-tree.
```java
class BKTree {
  BKTree()
  void add(String word)
  List<String> search(String q, int maxDist)
}
```
- `add`: thêm từ (từ đã có thì bỏ qua). `search`: mọi từ có Levenshtein tới `q` ≤ `maxDist`, xếp `(khoảng cách tăng, từ tăng)`.
- Ràng buộc: tổng ≤ `2·10⁴` lần `add`, `600` lần `search`, `0 ≤ maxDist ≤ 2`, từ ≤ 20 ký tự.
- Ví dụ: `add(book) add(books) add(cake) add(boo) add(book)`: `search(book,1)→[book,boo,books]`, `search(bo,2)→[boo,book]`.
- **Câu hỏi quy mô:** dự đoán tỉ lệ thời gian BK-tree so với quét tuyến tính trên từ điển 2·10⁴ từ ghép âm tiết, rồi so với từ điển chuỗi ngẫu nhiên 26 chữ cái (README mục 4). Đếm số lần gọi `lev` mỗi truy vấn.
