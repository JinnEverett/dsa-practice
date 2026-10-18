# I12 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/I12-trie [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/I12-trie 01`

**Pass:** ex01 qua `check` (trie tự cài) **và** ≥ 5/7 bài còn lại, ≤ 3 hint, và trả lời được **câu hỏi quy mô** cuối file.

> Ex01–ex02, ex07–ex08 là **class** (`ops` / `args` kiểu LeetCode). Chuỗi chỉ gồm chữ thường `a–z` (trừ ghi chú). TS: dựng một lớp trie dùng chung rồi `import` vào các bài sau nếu muốn.
> Ex03: Perf chỉ bắt các bản quá chậm; điểm mấu chốt là hiểu vì sao trie giảm công việc (xem câu hỏi quy mô).

---

## 🟢 Cơ bản

### ex01 · Tự cài Trie (class)
```java
class Trie {
  Trie()
  void insert(String word)
  boolean search(String word)       // true nếu word đã được insert ĐẦY ĐỦ
  boolean startsWith(String prefix) // true nếu có từ đã insert bắt đầu bằng prefix
}
```
- Ràng buộc: `1 ≤ |word|, |prefix| ≤ 2000`, tối đa `2·10⁵` thao tác, mỗi thao tác O(L).
- Ví dụ: `insert("apple"), search("apple") → true, search("app") → false, startsWith("app") → true, insert("app"), search("app") → true`. (LeetCode 208)

### ex02 · Từ điển có ký tự đại diện (class)
```java
class WordDictionary {
  WordDictionary()
  void addWord(String word)
  boolean search(String word)       // '.' khớp đúng một chữ cái bất kỳ
}
```
- Ràng buộc: `1 ≤ |word| ≤ 25`; truy vấn có tối đa 3 dấu `.`; tối đa `10⁵` thao tác.
- Ví dụ: `addWord("bad"), addWord("dad"), addWord("mad"); search("pad") → false, search("bad") → true, search(".ad") → true, search("b..") → true`. (LeetCode 211)

### ex03 · Tìm nhiều từ trên bảng
```java
List<String> findWords(String[] board, String[] words)
```
- Từ ghép bằng các ô kề (4 hướng), mỗi ô dùng tối đa một lần trong **một** từ. Trả về mọi từ tìm được, mỗi từ một lần, thứ tự tùy ý.
- Ràng buộc: bảng `1 ≤ R, C ≤ 12`, `1 ≤ |words| ≤ 3·10⁴`, `1 ≤ |word| ≤ 10`, các từ khác nhau.
- Ví dụ: `["oaan","etae","ihkr","iflv"], ["oath","pea","eat","rain"]` → `["eat","oath"]`. (LeetCode 212)

---

## 🟡 Kết hợp

### ex04 · Thay từ bằng gốc ngắn nhất
Từ điển `dictionary` chứa các "gốc". Mỗi từ trong câu mà bắt đầu bằng một gốc được thay bằng gốc **ngắn nhất** thỏa; từ nào không có gốc thì giữ nguyên.
```java
String replaceWords(String[] dictionary, String sentence)
```
- Ràng buộc: `1 ≤ |dictionary| ≤ 10⁴`, mỗi gốc `1..100` ký tự (có thể có gốc là tiền tố của gốc khác); câu gồm các từ cách nhau **đúng một dấu cách**, tổng độ dài ≤ `10⁶`.
- Ví dụ: `["cat","bat","rat"], "the cattle was rattled by the battery"` → `"the cat was rat by the bat"`. (LeetCode 648)

### ex05 · Gợi ý sản phẩm khi gõ
Với mỗi tiền tố của `searchWord` (độ dài 1, 2, ...), trả về **tối đa 3** sản phẩm có tiền tố đó, nhỏ nhất theo thứ tự từ điển.
```java
List<List<String>> suggestedProducts(String[] products, String searchWord)
```
- Ràng buộc: `1 ≤ |products| ≤ 2·10⁴`, sản phẩm khác nhau, `1 ≤ độ dài ≤ 3000`, tổng độ dài ≤ `2·10⁴ × 12` ở test lớn.
- Ví dụ: `["mobile","mouse","moneypot","monitor","mousepad"], "mouse"` → `[["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]`. (LeetCode 1268)

### ex06 · XOR lớn nhất của hai số
```java
int findMaximumXOR(int[] nums)
```
- Trả về `max(nums[i] XOR nums[j])` với `0 ≤ i ≤ j < n` (cho phép `i = j`).
- Ràng buộc: `1 ≤ n ≤ 2·10⁵`, `0 ≤ nums[i] ≤ 2³¹ − 1`.
- Ví dụ: `[3,10,5,25,2,8]` → `28` · `[0]` → `0`. (LeetCode 421)
- Mục tiêu: O(31·n) bằng trie nhị phân; O(n²) quá giờ.

---

## 🔴 Thực tế

### ex07 · Autocomplete top 3 theo lượt (class)
> "Ô tìm kiếm gợi ý 3 truy vấn phổ biến nhất bắt đầu bằng phần đã gõ. Mỗi lần người dùng chọn một truy vấn, lượt của nó tăng 1."

```java
class Autocomplete {
  Autocomplete(String[] words, int[] counts)  // words khác nhau, counts[i] ≥ 1
  void add(String word)                       // lượt +1; từ mới → lượt 1
  List<String> top3(String prefix)            // ≤ 3 từ có tiền tố prefix: lượt giảm dần, hòa → chữ cái tăng dần
}
```
- Ràng buộc: tối đa `2·10⁴` từ ban đầu, `|từ| ≤ 20`, tối đa `10⁵` thao tác; `prefix` có thể **rỗng** (khớp mọi từ).
- Ví dụ: khởi tạo `["apple","app","apply","ape","bat"], [3,2,3,1,5]`; `top3("ap")` → `["apple","apply","app"]`; `add("ape")` hai lần; `top3("ap")` → `["ape","apple","apply"]`; `top3("z")` → `[]`.
- Mục tiêu: `top3` O(|prefix|); quét mọi từ cho mỗi truy vấn sẽ quá giờ.

### ex08 · Lọc từ cấm trong luồng chat (class)
> "Chat room nhận từng chữ cái một. Sau mỗi chữ cái, kiểm tra xem *đuôi* của luồng nhận được từ đầu tới giờ có trùng với một từ cấm nào không."

```java
class StreamChecker {
  StreamChecker(String[] words)
  boolean query(char letter)        // nhận một chữ cái tiếp theo của luồng; true nếu một hậu tố của luồng là một từ trong words
}
```
- Ràng buộc: `1 ≤ |words| ≤ 2000`, `1 ≤ |word| ≤ 200`, tối đa `10⁵` lần `query`. (Trong TS và Python, `letter` là chuỗi 1 ký tự.)
- Ví dụ: `words = ["cd","f","kl"]`; luồng `a, b, c, d, e, f` cho `false, false, false, true, false, true`. (LeetCode 1032)

---

## ❓ Câu hỏi quy mô (làm sau khi qua ex01)

1. **Dự đoán:** với `W = 10⁵` từ độ dài trung bình 8, trie có tối đa bao nhiêu nút? Bộ nhớ nếu mỗi nút là mảng 26 con 4 byte? Nếu mỗi nút là object `{kids: Map}` thì bạn đoán bao nhiêu MB (ước lượng, rồi đo bằng `process.memoryUsage()` hoặc `bench`)?
2. `startsWith` bản "quét danh sách" là O(W·L). Ở `W = 10⁵` truy vấn 10⁵ lần, dự đoán thời gian so với trie — hơn kém cỡ nào (hàng chục, hàng nghìn lần)?
3. **Ex03:** đếm số lần gọi DFS của (a) bản trie và (b) bản chạy `exist` riêng cho từng từ, với bảng `4×4` toàn chữ `a`, và `words = ["aaaaaaaaab", "aaaaaaaaac", "aaaaaaaaad"]`. Tỉ lệ này tăng thế nào khi thêm từ dùng chung tiền tố `aaaaaaaaa`?
