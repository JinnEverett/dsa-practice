# I02 · Tree recursion

## Sau buổi này bạn sẽ
- Giải bài cây bằng 2 kiểu tư duy đệ quy: **trả giá trị lên** (bottom-up) và **truyền trạng thái xuống** (top-down).
- Tách "giá trị trả về cho cha" khỏi "đáp án toàn cục" (diameter, max path sum).
- Tìm LCA, khoảng cách giữa hai node.
- Dựng lại cây từ pre-order + in-order; serialize/deserialize cây.

## 1. Hai kiểu đệ quy trên cây

**Bottom-up — hỏi con rồi tổng hợp** (post-order):
```ts
function height(node): number {
  if (!node) return 0;
  return 1 + Math.max(height(node.left), height(node.right));
}
```

**Top-down — mang trạng thái đi xuống** (pre-order):
```ts
function hasPath(node, remaining): boolean {
  if (!node) return false;
  remaining -= node.val;
  if (!node.left && !node.right) return remaining === 0;   // lá
  return hasPath(node.left, remaining) || hasPath(node.right, remaining);
}
```

Câu hỏi để chọn: *"Muốn biết đáp án ở node này, mình cần thông tin gì từ con (→ bottom-up) hay từ tổ tiên (→ top-down)?"*

## 2. Giá trị trả về ≠ đáp án (mẫu "diameter")

```
          1
         / \
        2   3          diameter = đường dài nhất giữa 2 node bất kỳ
       / \                       = 4 → 2 → 5 hoặc 4 → 2 → 1 → 3 (3 cạnh)
      4   5
```
Tại mỗi node: đường dài nhất **đi qua** node = `height(left) + height(right)` → cập nhật biến toàn cục `best`.
Nhưng giá trị **trả về cho cha** chỉ được là **một nhánh**: `1 + max(height(left), height(right))` — vì đường đi lên cha không thể rẽ hai bên.

Mẫu này dùng lại cho: max path sum (nhánh âm thì bỏ: `max(0, gain)`), cây cân bằng (trả về −1 khi đã mất cân bằng để dừng sớm), house robber III (A05).

## 3. Lowest Common Ancestor (LCA)

```ts
function lca(node, p, q) {
  if (!node || node.val === p || node.val === q) return node;
  const L = lca(node.left, p, q), R = lca(node.right, p, q);
  if (L && R) return node;          // p, q nằm ở hai bên → node là LCA
  return L ?? R;                    // cả hai cùng một bên
}
```
Khoảng cách giữa a và b = depth(a) + depth(b) − 2·depth(LCA).

## 4. Dựng cây từ pre-order + in-order
```
preorder: [3, 9, 20, 15, 7]     phần tử đầu = gốc (3)
inorder : [9, 3, 15, 20, 7]     vị trí của 3 trong inorder chia trái [9] | phải [15, 20, 7]
                                → kích thước cây con trái = 1 → preorder[1..1] là trái, preorder[2..] là phải
```
Dùng Map giá trị → chỉ số trong inorder để tra O(1) (không `indexOf` mỗi lần → O(n²)).

## 5. Serialize / deserialize
Pre-order có đánh dấu `#` cho null đủ để dựng lại **duy nhất** một cây:
```
    1
   / \        "1,2,#,#,3,4,#,#,5,#,#"
  2   3
     / \
    4   5
```
Deserialize: đọc token theo thứ tự, mỗi lần gọi `build()` lấy một token: `#` → null; số → tạo node, `left = build()`, `right = build()`.

## 6. Đệ quy và độ sâu
Đệ quy trên cây là tự nhiên nhất, an toàn khi chiều cao vừa phải (cây cân bằng: log n; bộ test I02 có chiều cao ≤ vài trăm). Cây lệch 10⁵ tầng → dùng stack tự quản (I01). Ngoài đời (cây danh mục, org chart) **không** có gì đảm bảo cây cân bằng — cân nhắc trước khi dùng đệ quy trong code production.

## 7. Bẫy
1. Trả đáp án toàn cục cho cha (diameter: trả `L + R` thay vì `1 + max(L, R)`).
2. "Đường đi gốc → lá": node chỉ có một con **không phải** lá; kiểm tra `!left && !right`.
3. Max path sum: khởi tạo `best = 0` → sai khi mọi giá trị âm.
4. Biến toàn cục (module-level) không reset giữa các lần gọi → kết quả lần trước lẫn vào lần sau. Dùng closure hoặc truyền tham chiếu.
5. Path sum liệt kê đường: push/pop trên **một** mảng `path` dùng chung (backtracking), chỉ copy khi ghi kết quả.

## 8. Độ phức tạp
Hầu hết O(n) time (mỗi node thăm 1 lần), O(h) stack. Dựng cây: O(n) với Map (O(n²) nếu `indexOf`). Liệt kê mọi đường: O(n · h) do copy đường đi.
