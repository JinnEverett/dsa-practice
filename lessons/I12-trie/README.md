# I12 · Trie

## Sau buổi này bạn sẽ
- Cài **trie** (cây tiền tố): `insert`, `search`, `startsWith` đều O(L), không phụ thuộc số từ.
- Chọn **cách lưu con của nút**: mảng 26 hay `Map`, và biết cái giá bộ nhớ.
- Dùng trie cho **wildcard** (DFS), **trie + backtracking trên lưới**, **cache top-k tại nút**, **trie nhị phân cho XOR**, và **trie đảo ngược cho suffix** trên luồng.

## 1. Trie là gì

Cây mà mỗi nút ứng với một **tiền tố**; mỗi cạnh gắn một ký tự; nút có cờ `end` nếu có từ kết thúc ở đó. Mọi từ chung tiền tố dùng chung đường đi.

```
insert: "app", "apple", "apt", "bat"

        (root)
        /    \
       a      b
       |      |
       p      a
      / \     |
     p*  t*   t*        * = end
     |
     l
     |
     e*
```

```ts
// phiên bản dễ đọc (Map); bản tối ưu "mảng phẳng" ở solutions.ts
class Node { kids = new Map<string, Node>(); end = false; }
insert(w): u = root; for ch of w: u = u.kids.get(ch) ?? create; u.end = true
search(w): đi theo w; true nếu tới được nút VÀ nút đó end
startsWith(p): đi theo p; true nếu tới được nút
```

| Thao tác | Trie | Mảng/Set các từ | Ghi chú |
|---|---|---|---|
| insert | O(L) | O(1) | |
| search | O(L) | O(1) với Set | |
| startsWith | O(L) | **O(số từ × L)** | đây là lý do dùng trie |
| liệt kê theo thứ tự từ điển | DFS theo a→z | sort O(W log W) | |

Đo thực tế (máy soạn): 10⁵ thao tác trộn insert/search/startsWith trên trie phẳng mất khoảng 40 ms; bản "lưu danh sách rồi quét" bị dừng sau 1 200 ms (giới hạn 400 ms).

## 2. Cách lưu con của nút

| | Mảng 26 | `Map` / object | Mảng phẳng `Int32Array(26·nút)` |
|---|---|---|---|
| Truy cập | O(1) | O(1) băm | O(1) |
| Bộ nhớ / nút | 26 ô (tốn khi nút ít con) | chỉ con có thật + overhead băm | 26 × 4 B = 104 B / nút, không có object |
| Khi nào | bảng chữ cái nhỏ, nhiều từ | Unicode / ký tự thưa | n lớn, TS, quan tâm GC |

Quy tắc: bảng chữ cái cố định và nhỏ → mảng (hoặc mảng phẳng); bảng chữ cái lớn hoặc thưa → `Map`. Với trie phẳng, nút 0 là gốc và `next[u*26+c] = 0` nghĩa là "không có con".

## 3. Các khuôn

**Wildcard `.`** — DFS trên trie: gặp chữ thì đi theo con, gặp `.` thì thử **mọi** con. Tệ nhất O(26^d · L) với `d` số dấu `.`.

**Trie + backtracking (Word Search II)** — dựng trie từ **tất cả** từ cần tìm, DFS trên lưới đi đồng thời trong trie, chỉ đi tiếp khi chữ ở ô là con của nút hiện tại. Một lần duyệt lưới cho mọi từ, thay vì chạy tìm từng từ. Gỡ cờ `end` sau khi tìm thấy để không báo trùng.

**Cache top-k tại nút** — mỗi nút giữ sẵn ≤ k đáp án tốt nhất của các từ đi qua nó (gợi ý sản phẩm, autocomplete). Truy vấn tiền tố = đi theo tiền tố rồi đọc cache: O(L). Khi dữ liệu thay đổi (lượt tăng), cập nhật cache của các nút trên đường đi của từ đó.

**Trie nhị phân (XOR lớn nhất)** — mỗi nút có hai con (bit 0/1), chèn mỗi số từ bit cao xuống bit thấp; với số `x`, đi theo bit **ngược** `x` khi có thể để XOR có bit cao là 1.

**Trie đảo ngược (suffix trên luồng)** — "luồng hiện tại có kết thúc bằng một từ cấm không?" là bài **hậu tố**. Đảo ngược mỗi từ cấm, dựng trie, rồi đọc luồng **từ chữ mới nhất lùi về trước**.

## 4. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Con của nút | `Int32Array` phẳng / `Map` / mảng 26 | `dict` (`setdefault`) hoặc `[None]*26` | `TrieNode[26]` / `HashMap<Character, TrieNode>` |
| Ký tự → chỉ số | `s.charCodeAt(i) - 97` | `ord(ch) - 97` | `s.charAt(i) - 'a'` |
| `char` trong tham số | chuỗi 1 ký tự | chuỗi 1 ký tự | `char` (`'a'`) |
| Bộ nhớ / nút | 104 B (mảng phẳng) | `dict` ~200+ B, rất tốn | `TrieNode[26]` ~ 128 B + object |

Bẫy Python: trie `dict` lồng nhau cho 10⁶ ký tự chiếm hàng trăm MB; mảng phẳng `array('i')` tiết kiệm hơn. Bẫy Java: `new int[400000][26]` cấp phát sẵn lớn — ước lượng số nút (≤ tổng độ dài từ + 1).

## 5. Dấu hiệu nhận biết
"tiền tố", "gợi ý khi gõ", "từ điển", "nhiều từ cùng tìm trên lưới", "ký tự đại diện `.`", "bắt đầu bằng...", "XOR lớn nhất", "luồng ký tự kiểm tra hậu tố".

## 6. Bẫy
1. `search("app")` khi chỉ chèn `"apple"` phải là `false` (quên cờ `end`), còn `startsWith("app")` là `true`.
2. Quên đặt `end` khi chèn từ ngắn là tiền tố của từ đã có.
3. Word Search II: báo cùng một từ nhiều lần; dùng lại ô trong cùng đường đi.
4. Replace words: thay bằng gốc **dài** vì dừng muộn (phải dừng ngay gặp `end` đầu tiên).
5. Stream checker: dựng trie **xuôi** (phải đảo); đọc ngược cả luồng dài (giới hạn bằng độ dài từ dài nhất).
6. XOR: `1 << 31` là số **âm** trong JS/Java — nums ≤ 2³¹ − 1 nên chỉ cần bit 30 → 0.
7. Cache top-k: không cập nhật mọi nút trên đường đi; so hòa không theo chữ cái.
8. Bộ nhớ: trie 26-con cho Unicode / chuỗi dài ngẫu nhiên có thể tốn hơn cả lưu danh sách.

## 7. Độ phức tạp
Mỗi thao tác theo từ: **O(L)**. Dựng trie: O(tổng độ dài). Bộ nhớ O(tổng độ dài × cỡ bảng chữ cái) (mảng) hoặc O(tổng độ dài) (Map, nhưng hằng số lớn).
