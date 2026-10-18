# D05 · RandomizedCollection & iterators

## Sau buổi này bạn sẽ
- Thiết kế `insert / remove / getRandom` đều **O(1)** kể cả khi có phần tử **trùng**.
- Dùng kỹ thuật **swap-with-last** để xóa giữa mảng không dịch phần tử.
- Cài iterator có `peek` (lookahead) và iterator **zigzag** xen kẽ nhiều nguồn.
- Kiểm thử hành vi **ngẫu nhiên** (kiểm tính hợp lệ, không so đáp án cố định).

## 1. Swap-with-last

```
items = [5, 7, 5, 9, 2]      pos: 5→{0,2}  7→{1}  9→{3}  2→{4}
remove(5): lấy chỉ số i = 0 của 5
  → đưa phần tử cuối (2) vào vị trí 0, pop cuối
items = [2, 7, 5, 9]         pos: 5→{2}  7→{1}  9→{3}  2→{0}   (cập nhật chỉ số của 2: 4 → 0)
```
`getRandom` = `items[random index]` → mỗi **bản sao** có xác suất như nhau (đều theo số lần xuất hiện).

Trường hợp biên: phần tử cần xóa đang ở cuối (`i == last`) → chỉ cần `pop`, không dời.

## 2. Iterator & lookahead
`peek()` cần biết phần tử kế tiếp **mà không tiêu thụ** nó. Với nguồn chỉ có `next/hasNext`, đệm trước một phần tử:

```ts
peek()  { if (!has) { buf = src.next(); has = true; } return buf; }
next()  { if (has) { has = false; return buf; } return src.next(); }
hasNext() { return has || src.hasNext(); }
```

## 3. Zigzag
Xen kẽ `a0, b0, a1, b1, …`; bên nào cạn thì lấy hết bên còn lại. Với k danh sách: hàng đợi các iterator còn dữ liệu, `next` = lấy iterator đầu, lấy phần tử, nếu còn thì đưa lại cuối hàng.

## 4. Kiểm thử hành vi ngẫu nhiên
Không thể so `getRandom` với một đáp án. Checker chỉ kiểm tra: (a) giá trị trả về **đang có** trong bộ sưu tập (replay đa tập), (b) các thao tác còn lại khớp chính xác. **Phân phối đều** bạn tự kiểm: gọi `getRandom` 10⁵ lần trên `{1,1,2}` thì `1` xuất hiện ≈ 2/3 số lần.

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Ngẫu nhiên | `Math.random()` | `random.randrange(n)` | `Random.nextInt(n)` |
| Set các chỉ số, lấy 1 phần tử bất kỳ | `set.values().next().value` | `next(iter(s))` / `s.pop()` rồi `add` lại | `LinkedHashSet.iterator().next()` |
| Iterator | tự cài `next/hasNext` | `__next__`, `__iter__` | `Iterator<Integer>` |

## 6. Bẫy
1. Xóa phần tử cuối mà vẫn "dời phần tử cuối vào chỗ cũ" → thêm rồi xóa cùng một chỉ số làm Set sai.
2. `insert` trả `true` khi giá trị **chưa có** (không phải khi thêm thành công).
3. Dùng `indexOf` + `splice` → O(n).
4. Chọn ngẫu nhiên trên `Map.keys()` làm mất trọng số theo số bản sao.
5. `peek()` gọi `next()` của nguồn nhiều lần → mất phần tử.

## 7. Độ phức tạp

| | insert | remove | getRandom |
|---|---|---|---|
| mảng + Map<val, Set<idx>> | O(1) | O(1) | O(1) |
| mảng + indexOf/splice | O(1) | O(n) | O(1) |

Iterator: mọi thao tác O(1), bộ nhớ thêm O(1).

## 8. Câu hỏi quy mô
Dự đoán rồi `node tools/bench.ts lessons/D05-randomized-iterators 01 --scales s,m,l`: 10⁶ thao tác chậm hơn 10⁵ bao nhiêu lần? Chi phí lớn nhất là gì — `Set` cho mỗi giá trị khác nhau (thử ước lượng RAM khi có 10⁶ giá trị khác nhau)?
