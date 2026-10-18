# R06 · Search & autocomplete

## Sau buổi này bạn sẽ
- Làm **autocomplete top-k** nhanh bằng trie có **cache top-k tại mỗi node**.
- Dựng **inverted index** và trả lời truy vấn AND bằng phép giao danh sách đã sắp.
- Tìm kiếm **mờ** bằng khoảng cách sửa (Levenshtein) và hiểu BK-tree cắt tỉa thế nào.
- Chuẩn hóa **tiếng Việt không dấu** đúng (kể cả `đ` và dạng Unicode tổ hợp).

## 1. Autocomplete: đánh đổi bộ nhớ lấy tốc độ đọc
```
 add("app",5) add("apple",5) add("apply",1)
 node "a":  [app 5, apple 5]        ← mỗi node nhớ sẵn top-k đi qua nó
 node "ap": [app 5, apple 5]
 node "app":[app 5, apple 5]  → query("app") = đọc thẳng, O(|prefix| + k)
```
Quét mọi từ có tiền tố là O(#từ) mỗi lần gõ phím. Cache top-k chỉ cần cập nhật khi **ghi** (hiếm hơn đọc nhiều). Điều kiện đúng: weight chỉ **tăng** — một từ bị loại khỏi cache thì không thể quay lại nếu chính nó không được cộng thêm.

## 2. Inverted index
```
 doc1: the quick brown fox        quick → [1, 2]      brown → [1, 5]
 doc2: quick quick red fox        AND("quick brown") = giao [1,2] ∩ [1,5] = [1]
 doc5: brown dog
```
Giao hai danh sách đã sắp: hai con trỏ O(a + b), hoặc binary search từng phần tử của danh sách **ngắn** vào danh sách dài O(s log L) (khi chênh lệch lớn). Luôn bắt đầu từ danh sách ngắn nhất. Elasticsearch/Lucene = postings + nén + xếp hạng (BM25).

## 3. Khoảng cách sửa & tìm mờ
`lev(a, b)` = số phép thêm/xóa/thay ít nhất để biến `a` thành `b` (DP, O(|a|·|b|), chỉ cần hai hàng). Cắt sớm: nếu `||a| − |b|| > m` hoặc cả hàng DP đều > `m` thì dừng. Với từ điển lớn quét tuyến tính vẫn là O(|dict|).

## 4. BK-tree
Mỗi node là một từ; cạnh tới con mang nhãn `d = lev(con, cha)`. Khoảng cách sửa thỏa **bất đẳng thức tam giác**, nên khi tìm `q` với ngưỡng `m`, tại node `x` có `d = lev(q, x)` thì chỉ cần đi vào các con có nhãn trong `[d − m, d + m]`.

Hiệu quả phụ thuộc dữ liệu — đo thật (từ điển 2·10⁴ từ, ngưỡng 1, máy soạn):

| Từ điển | Node thăm / truy vấn |
|---|---|
| ghép 2–4 âm tiết (có cấu trúc) | ≈ 525 (2,6%) |
| chuỗi 7–11 ký tự trên 6 chữ cái | ≈ 1 100 (5,5%) |
| chuỗi ngẫu nhiên 5–8 ký tự trên 26 chữ cái | ≈ 3 800 (19%) |

Khoảng cách giữa các chuỗi ngẫu nhiên dồn vào vài giá trị nên cây cắt tỉa kém; từ điển ngôn ngữ thật nằm gần các dòng trên.

## 5. Chuẩn hóa tiếng Việt
`"Nguyễn Đạt"` → `"nguyen dat"`:
1. `NFD`: tách dấu thành ký tự kết hợp (`ễ` → `e` + `^` + `~`).
2. Bỏ ký tự kết hợp (U+0300–U+036F).
3. `đ`/`Đ` → `d`/`D` (**`đ` không phân rã trong NFD**, phải xử lý riêng).
4. Chữ thường.

Dữ liệu có thể ở dạng dựng sẵn (NFC) hoặc tổ hợp (NFD) — chuẩn hóa cả tên lẫn truy vấn. Khớp "mỗi token truy vấn là tiền tố của một token tên" cho trải nghiệm gõ dần.

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Bỏ dấu | `s.normalize('NFD').replace(/[̀-ͯ]/g, '')` | `unicodedata.normalize('NFD', s)` + lọc `combining` | `Normalizer.normalize(s, Form.NFD).replaceAll("\\p{M}+", "")` |
| `đ` | thay riêng | thay riêng | thay riêng |
| Trie node | `Map<string, Node>` hoặc mảng 26 | `dict` | `HashMap<Character, Node>` / `Node[26]` |
| Binary search | tự viết | `bisect` | `Collections.binarySearch` |

## 7. Bẫy
1. Cache top-k chỉ cập nhật một số node trên đường đi.
2. Tie-break (weight bằng nhau) không có trong so sánh → kết quả không ổn định.
3. Inverted index: token lặp làm postings có phần tử trùng; truy vấn rỗng.
4. Levenshtein bằng ma trận đầy đủ: O(|a|·|b|) bộ nhớ — dùng hai hàng.
5. Quên `đ`; chuẩn hóa chỉ tên mà không chuẩn hóa truy vấn.
6. BK-tree: từ trùng (nhãn 0) tạo vòng lặp vô hạn nếu không bỏ qua.

## 8. Độ phức tạp
| | time | space |
|---|---|---|
| Suggest add / query | O(\|w\|·k) / O(\|p\| + k) | O(L·k) |
| SearchIndex add / query | O(\|text\|) / O(m·s·log L) | O(#token) |
| fuzzyMatch | O(\|dict\|·\|q\|·\|w\|) (có cắt sớm) | O(\|w\|) |
| BKTree search | thường ≪ O(n) | O(n) |

## 9. Câu hỏi quy mô
Từ điển 10⁵ từ, 10⁴ truy vấn/giây. (1) Ước lượng số phép so sánh ký tự của quét tuyến tính với `lev` ≈ 50 phép/từ. (2) Với BK-tree thăm ≈ 3% node, giảm bao nhiêu lần? (3) Chạy `bench` ex01 ở `m` — thời gian `query` có phụ thuộc số từ trong trie không?
