# I01 · Binary tree: traversal

## Sau buổi này bạn sẽ
- Duyệt cây theo pre-order, in-order, post-order bằng **cả đệ quy lẫn vòng lặp + stack**.
- Duyệt theo tầng (level-order / BFS) bằng queue và xử lý **từng tầng một**.
- Đọc/viết cây ở dạng mảng level-order kiểu LeetCode, vẽ cây để debug.
- Biết khi nào cây sâu 10⁵ làm đệ quy tràn stack.

## 1. Thuật ngữ

```
            1            ← root (gốc), depth 0, level 1
          /   \
         2     3         ← 2 và 3 là con (children) của 1
        / \     \
       4   5     6       ← 4, 5, 6 là lá (leaf)
                         height (chiều cao) = 3 tầng
level-order (LeetCode): [1,2,3,4,5,null,6]
```

| TS | Python | Java |
|---|---|---|
| `TreeNode` từ `tools/lib.ts`: `val, left, right` | `from dsa import TreeNode` | `TreeNode` có sẵn |
| debug: `console.log(printTree(root))` | `print(print_tree(root))` | `System.out.println` từng tầng |

## 2. Ba thứ tự DFS

| Thứ tự | Quy tắc | Cây trên | Dùng khi |
|---|---|---|---|
| pre-order | **gốc**, trái, phải | 1 2 4 5 3 6 | sao chép/serialize cây, đường đi từ gốc |
| in-order | trái, **gốc**, phải | 4 2 5 1 3 6 | BST → ra dãy **tăng dần** (I03) |
| post-order | trái, phải, **gốc** | 4 5 2 6 3 1 | cần kết quả của con trước khi xử lý cha (chiều cao, xóa cây) |

```ts
function dfs(node: TreeNode | null) {
  if (!node) return;
  // pre-order: xử lý node ở đây
  dfs(node.left);
  // in-order: ở đây
  dfs(node.right);
  // post-order: ở đây
}
```

## 3. Vòng lặp + stack (không lo tràn stack)

**Pre-order:** pop node, ghi nhận, push **phải trước, trái sau** (để trái được pop trước).

**In-order:** đi trái hết cỡ (push dọc đường), pop ra ghi nhận, rồi chuyển sang con phải.
```ts
const st: TreeNode[] = []; let cur = root;
while (cur || st.length) {
  while (cur) { st.push(cur); cur = cur.left; }
  cur = st.pop()!;  out.push(cur.val);  cur = cur.right;
}
```

**Post-order:** mẹo — làm pre-order biến thể "gốc, **phải**, trái" rồi **đảo ngược** kết quả.

## 4. Level-order (BFS)

```
queue: [1]          → tầng 1: [1]        đẩy con của 1
queue: [2, 3]       → tầng 2: [2, 3]
queue: [4, 5, 6]    → tầng 3: [4, 5, 6]
```
Muốn tách **từng tầng**: ở đầu mỗi vòng, `size = số phần tử đang trong queue` — đó đúng là số node của tầng hiện tại; xử lý đúng `size` node rồi mới sang tầng sau.

```ts
const q: TreeNode[] = root ? [root] : [];
let head = 0;
while (head < q.length) {
  const end = q.length;                 // kết thúc tầng hiện tại
  const level: number[] = [];
  for (; head < end; head++) {
    const node = q[head];
    level.push(node.val);
    if (node.left) q.push(node.left);
    if (node.right) q.push(node.right);
  }
  levels.push(level);
}
```
(Python: `deque`; Java: `ArrayDeque<TreeNode>` + `int size = q.size()`.)

## 5. Đánh số vị trí (dùng cho chiều rộng cây)
Gốc vị trí `i` → con trái `2i`, con phải `2i + 1`. Chiều rộng một tầng = `vị trí phải nhất − vị trí trái nhất + 1`. Cây lệch sâu làm vị trí tăng theo 2^depth → **tràn số**; chuẩn hóa bằng cách trừ vị trí đầu tầng ở mỗi tầng.

## 6. Bẫy
1. Quên trường hợp `root = null`.
2. Đệ quy trên cây lệch sâu 10⁵ → tràn stack (TS, Python, Java đều vậy).
3. BFS dùng `shift()` / `pop(0)` → O(n²).
4. Pre-order bằng stack mà push trái trước → ra thứ tự gốc-phải-trái.
5. Nhầm depth (đếm cạnh) với số tầng (đếm node) — đọc kỹ đề.

## 7. Độ phức tạp
Mọi cách duyệt: O(n) time. Bộ nhớ: DFS O(h) (h = chiều cao, xấu nhất n), BFS O(w) (w = số node của tầng rộng nhất, tới n/2).
