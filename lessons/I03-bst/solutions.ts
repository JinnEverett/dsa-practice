// I03 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { TreeNode } from '../../tools/lib.ts';

// ─── ex01 · Tìm trong BST ───
// Ý tưởng: đi một đường từ gốc, rẽ theo so sánh. Vòng lặp — không cần đệ quy.
// Độ phức tạp: O(h) time · O(1) space.
export function searchBST(root: TreeNode | null, val: number): TreeNode | null {
  let node = root;
  while (node && node.val !== val) node = val < node.val ? node.left : node.right;
  return node;
}

// ─── ex02 · Chèn vào BST ───
// Ý tưởng: đi như search, nhớ node cha cuối cùng; gắn node mới vào phía tương ứng của cha.
// Độ phức tạp: O(h) time · O(1) space.
export function insertIntoBST(root: TreeNode | null, val: number): TreeNode | null {
  const fresh = new TreeNode(val);
  if (!root) return fresh;
  let node = root;
  for (;;) {
    if (val < node.val) {
      if (!node.left) {
        node.left = fresh;
        break;
      }
      node = node.left;
    } else {
      if (!node.right) {
        node.right = fresh;
        break;
      }
      node = node.right;
    }
  }
  return root;
}

// ─── ex03 · Kiểm tra BST hợp lệ ───
// Ý tưởng: in-order bằng stack, mỗi giá trị phải lớn hơn hẳn giá trị trước đó.
// Độ phức tạp: O(n) time · O(h) space. Dừng ngay khi phát hiện vi phạm.
// Cách khác: truyền khoảng (lo, hi) xuống — Java phải dùng `Long`/`null` làm biên vì val có thể là Integer.MIN/MAX_VALUE.
export function isValidBST(root: TreeNode | null): boolean {
  const st: TreeNode[] = [];
  let cur = root;
  let prev = -Infinity;
  while (cur || st.length) {
    while (cur) {
      st.push(cur);
      cur = cur.left;
    }
    cur = st.pop()!;
    if (cur.val <= prev) return false;
    prev = cur.val;
    cur = cur.right;
  }
  return true;
}

// ─── ex04 · Phần tử nhỏ thứ k ───
// Ý tưởng: in-order bằng stack, đếm tới k thì trả về (dừng sớm).
// Độ phức tạp: O(h + k) time · O(h) space.
// Follow-up phỏng vấn: cây bị sửa liên tục và hỏi kth nhiều lần → lưu kích thước cây con ở mỗi node (order-statistic tree), O(h) mỗi truy vấn.
export function kthSmallest(root: TreeNode | null, k: number): number {
  const st: TreeNode[] = [];
  let cur = root;
  while (cur || st.length) {
    while (cur) {
      st.push(cur);
      cur = cur.left;
    }
    cur = st.pop()!;
    if (--k === 0) return cur.val;
    cur = cur.right;
  }
  return -1;
}

// ─── ex05 · Xóa node ───
// Ý tưởng: tìm node (giữ con trỏ cha). Ít hơn 2 con → nối cha với con duy nhất (hoặc null).
//   2 con → tìm successor (trái nhất của cây con phải), chép giá trị lên node, rồi gỡ successor (nó có tối đa con phải).
// Độ phức tạp: O(h) time · O(1) space.
export function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  let parent: TreeNode | null = null;
  let node = root;
  while (node && node.val !== key) {
    parent = node;
    node = key < node.val ? node.left : node.right;
  }
  if (!node) return root;
  if (node.left && node.right) {
    let sp = node;
    let s = node.right;
    while (s.left) {
      sp = s;
      s = s.left;
    }
    node.val = s.val;
    if (sp === node) sp.right = s.right;
    else sp.left = s.right;
    return root;
  }
  const child = node.left ?? node.right;
  if (!parent) return child;
  if (parent.left === node) parent.left = child;
  else parent.right = child;
  return root;
}

// ─── ex06 · Mảng đã sort → BST cân bằng ───
// Ý tưởng: phần tử giữa làm gốc; đệ quy trên hai nửa (truyền chỉ số, không slice).
// Độ phức tạp: O(n) time · O(log n) stack.
export function sortedArrayToBST(nums: number[]): TreeNode | null {
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null;
    const mid = (lo + hi) >> 1;
    return new TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi));
  };
  return build(0, nums.length - 1);
}

// ─── ex07 · Successor ───
// Ý tưởng: đi từ gốc; node.val > x → node là ứng viên, đi trái tìm ứng viên nhỏ hơn; ngược lại đi phải.
// Độ phức tạp: O(h) time · O(1) space.
// Python/Java: Java `TreeSet.higher(x)` làm đúng việc này trên cây cân bằng.
export function successor(root: TreeNode | null, x: number): number {
  let best = -1;
  let node = root;
  while (node) {
    if (node.val > x) {
      best = node.val;
      node = node.left;
    } else node = node.right;
  }
  return best;
}

// ─── ex08 · LCA trong BST ───
// Ý tưởng: cả p, q nhỏ hơn node → LCA bên trái; cả hai lớn hơn → bên phải; còn lại (tách nhau hoặc bằng node) → node là LCA.
// Độ phức tạp: O(h) time · O(1) space.
export function lcaBST(root: TreeNode | null, p: number, q: number): number {
  let node = root;
  while (node) {
    if (p < node.val && q < node.val) node = node.left;
    else if (p > node.val && q > node.val) node = node.right;
    else return node.val;
  }
  return -1;
}

// ─── ex09 · Tổng theo khoảng ───
// Ý tưởng: DFS cắt nhánh: val < low → chỉ cần đi phải; val > high → chỉ đi trái; trong khoảng → cộng và đi cả hai.
// Độ phức tạp: O(h + k) với k = số node trong khoảng (so với O(n) nếu duyệt hết).
// Python/Java: Java `long` (10⁵ × 10⁹).
export function rangeSumBST(root: TreeNode | null, low: number, high: number): number {
  let sum = 0;
  const st: (TreeNode | null)[] = [root];
  while (st.length) {
    const node = st.pop();
    if (!node) continue;
    if (node.val < low) st.push(node.right);
    else if (node.val > high) st.push(node.left);
    else {
      sum += node.val;
      st.push(node.left, node.right);
    }
  }
  return sum;
}

// ─── ex10 · BST iterator ───
// Ý tưởng: in-order "lười": stack giữ đường đi trái chưa xử lý. next(): pop node, đẩy nhánh trái của node.right.
// Độ phức tạp: next O(1) amortized (mỗi node vào/ra stack 1 lần) · hasNext O(1) · O(h) bộ nhớ.
export class BSTIterator {
  private st: TreeNode[] = [];
  constructor(root: TreeNode | null) {
    this.pushLeft(root);
  }
  private pushLeft(node: TreeNode | null): void {
    for (; node; node = node.left) this.st.push(node);
  }
  next(): number {
    const node = this.st.pop()!;
    this.pushLeft(node.right);
    return node.val;
  }
  hasNext(): boolean {
    return this.st.length > 0;
  }
}
