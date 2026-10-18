# I03 · Binary Search Tree (BST)

## Sau buổi này bạn sẽ
- Phát biểu đúng **bất biến BST** và kiểm tra nó (bẫy "chỉ so với con trực tiếp").
- Tìm / chèn / xóa trong O(h); hiểu vì sao h có thể là n.
- Tận dụng "in-order của BST = dãy tăng dần": phần tử thứ k, successor, iterator.
- Dựng BST cân bằng từ mảng đã sort; biết khái niệm cây tự cân bằng (AVL, Red-Black).

## 1. Bất biến

Với **mọi** node: mọi giá trị trong cây con trái **<** node **<** mọi giá trị trong cây con phải (lộ trình này dùng giá trị khác nhau).

```
        8                   ✅ BST
      /   \
     3     10
    / \      \
   1   6      14
      / \
     4   7

        5                   ❌ không phải BST: 4 nằm trong cây con PHẢI của 5
      /   \                    dù 4 < 6 (đúng với cha trực tiếp)
     1     6
          / \
         4   7
```
Kiểm tra đúng: truyền **khoảng hợp lệ** `(lo, hi)` xuống: con trái nhận `(lo, node.val)`, con phải nhận `(node.val, hi)`. Hoặc: in-order phải tăng nghiêm ngặt.

## 2. Thao tác cơ bản — đi một đường từ gốc

```ts
function search(node, x) {
  while (node && node.val !== x) node = x < node.val ? node.left : node.right;
  return node;
}
```
| Thao tác | Ý tưởng | Time |
|---|---|---|
| search | đi trái/phải theo so sánh | O(h) |
| insert | đi như search tới chỗ null, gắn node mới | O(h) |
| min / max | trái nhất / phải nhất | O(h) |
| delete | 3 trường hợp (dưới) | O(h) |
| successor của x | node nhỏ nhất > x: đi từ gốc, mỗi lần rẽ trái thì ghi nhận ứng viên | O(h) |

**Xóa node:**
1. Lá → bỏ đi.
2. Một con → thay node bằng con đó.
3. Hai con → thay giá trị bằng **successor** (min của cây con phải), rồi xóa successor khỏi cây con phải (successor có tối đa 1 con phải → quay về trường hợp 1/2).

## 3. h là bao nhiêu?

```
chèn 1,2,3,4,5 theo thứ tự      chèn 3,1,4,2,5
1                                    3
 \                                 /   \
  2                               1     4
   \             h = n             \     \       h ≈ log n
    3            → O(n) mỗi thao tác 2     5
     \
      4 ...
```
Dữ liệu đến theo thứ tự (timestamp, id tự tăng) làm BST thường **thoái hóa thành list**. Cây tự cân bằng (AVL, Red-Black, B-tree trong database) xoay cây sau mỗi chèn/xóa để giữ h = O(log n).

| Ngôn ngữ | Cấu trúc có thứ tự sẵn có |
|---|---|
| TS | **không có** → tự cài (skip list D09) hoặc mảng sort + binary search |
| Python | không có trong thư viện chuẩn (`sortedcontainers.SortedList` là package ngoài); `bisect` trên list |
| Java | `TreeMap` / `TreeSet` (Red-Black): `floorKey`, `ceilingKey`, `headMap`, `tailMap` |

## 4. In-order = dãy tăng dần
- Phần tử nhỏ thứ k: in-order, dừng ở phần tử thứ k → O(h + k).
- **BST iterator**: in-order bằng stack, mỗi `next()` pop một node rồi đẩy nhánh trái của con phải → O(1) amortized, O(h) bộ nhớ.
- Mảng sort → BST cân bằng: chọn phần tử **giữa** làm gốc, đệ quy hai nửa.

## 5. Dấu hiệu nhận biết
Đề cho "BST" → tận dụng thứ tự để cắt nhánh (range sum chỉ đi vào nhánh có thể chứa giá trị trong khoảng), in-order, đi một đường O(h). Đề cần "tập có thứ tự + chèn/xóa + tìm floor/ceiling" → BST cân bằng / TreeMap.

## 6. Bẫy
1. Validate chỉ so với con trực tiếp.
2. Validate dùng `-Infinity`/`Integer.MIN_VALUE` làm biên — Java: node có giá trị đúng bằng `Integer.MIN_VALUE` → dùng `long` hoặc `null` cho biên.
3. Xóa node hai con mà quên xóa successor khỏi cây con phải → giá trị bị nhân đôi.
4. Range query duyệt cả cây (O(n)) thay vì cắt nhánh.
5. Quên rằng BST không cân bằng có thể sâu n → đệ quy tràn stack.
