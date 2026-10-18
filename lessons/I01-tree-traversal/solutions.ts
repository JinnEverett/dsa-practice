// I01 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { TreeNode } from '../../tools/lib.ts';

// ─── ex01 · Pre-order ───
// Ý tưởng: stack; pop → ghi; push phải rồi trái (trái nằm trên, được xử lý trước).
// Độ phức tạp: O(n) time · O(h) space.
// Python/Java: Java `ArrayDeque<TreeNode>` (không nhận null → kiểm tra trước khi push).
export function preorder(root: TreeNode | null): number[] {
  const out: number[] = [];
  const st: TreeNode[] = root ? [root] : [];
  while (st.length) {
    const node = st.pop()!;
    out.push(node.val);
    if (node.right) st.push(node.right);
    if (node.left) st.push(node.left);
  }
  return out;
}

// ─── ex02 · In-order ───
// Ý tưởng: đi trái hết cỡ (đẩy dọc đường), pop ra ghi nhận, rẽ sang phải.
// Độ phức tạp: O(n) time · O(h) space.
// Nâng cao: Morris traversal — O(1) bộ nhớ bằng cách tạm nối "thread" từ node phải nhất của cây con trái về node hiện tại.
export function inorder(root: TreeNode | null): number[] {
  const out: number[] = [];
  const st: TreeNode[] = [];
  let cur = root;
  while (cur || st.length) {
    while (cur) {
      st.push(cur);
      cur = cur.left;
    }
    cur = st.pop()!;
    out.push(cur.val);
    cur = cur.right;
  }
  return out;
}

// ─── ex03 · Post-order ───
// Ý tưởng: (gốc, phải, trái) bằng stack rồi đảo ngược = (trái, phải, gốc).
// Độ phức tạp: O(n) time · O(n) space (mảng kết quả trung gian).
// Cách khác: một stack + con trỏ `lastVisited` để biết đã xử lý xong cây con phải chưa — không cần đảo, khó viết hơn.
export function postorder(root: TreeNode | null): number[] {
  const out: number[] = [];
  const st: TreeNode[] = root ? [root] : [];
  while (st.length) {
    const node = st.pop()!;
    out.push(node.val);
    if (node.left) st.push(node.left);
    if (node.right) st.push(node.right);
  }
  return out.reverse();
}

// ─── ex04 · Duyệt theo tầng ───
// Ý tưởng: BFS bằng queue (con trỏ head); mỗi tầng xử lý đúng số phần tử có trong queue lúc bắt đầu tầng.
// Độ phức tạp: O(n) time · O(w) space.
// Python/Java: Python `deque`, `for _ in range(len(q))`; Java `for (int sz = q.size(); sz > 0; sz--)`.
export function levelOrder(root: TreeNode | null): number[][] {
  const levels: number[][] = [];
  const q: TreeNode[] = root ? [root] : [];
  let head = 0;
  while (head < q.length) {
    const end = q.length;
    const level: number[] = [];
    for (; head < end; head++) {
      const node = q[head];
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    levels.push(level);
  }
  return levels;
}

// ─── ex05 · Chiều cao cây ───
// Ý tưởng: BFS đếm số tầng (không đệ quy → an toàn với cây sâu 10⁵).
// Độ phức tạp: O(n) time · O(w) space.
// Cách khác: đệ quy `1 + max(depth(l), depth(r))` — 1 dòng, đúng, nhưng tràn stack với cây lệch sâu.
export function maxDepth(root: TreeNode | null): number {
  let depth = 0;
  const q: TreeNode[] = root ? [root] : [];
  let head = 0;
  while (head < q.length) {
    const end = q.length;
    for (; head < end; head++) {
      const node = q[head];
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    depth++;
  }
  return depth;
}

// ─── ex06 · Góc nhìn bên phải ───
// Ý tưởng: BFS theo tầng, ghi node CUỐI của mỗi tầng.
// Độ phức tạp: O(n) time · O(w) space.
// Cách khác: DFS ưu tiên con phải, ghi node đầu tiên gặp ở mỗi độ sâu.
export function rightSideView(root: TreeNode | null): number[] {
  const out: number[] = [];
  const q: TreeNode[] = root ? [root] : [];
  let head = 0;
  while (head < q.length) {
    const end = q.length;
    out.push(q[end - 1].val);
    for (; head < end; head++) {
      const node = q[head];
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
  }
  return out;
}

// ─── ex07 · Cây đối xứng ───
// Ý tưởng: queue chứa CẶP (a, b) cần là gương của nhau: cùng null, hoặc cùng giá trị và (a.left, b.right), (a.right, b.left) là gương.
// Độ phức tạp: O(n) time · O(w) space.
export function isSymmetric(root: TreeNode | null): boolean {
  if (!root) return true;
  const q: (TreeNode | null)[] = [root.left, root.right];
  for (let i = 0; i < q.length; i += 2) {
    const a = q[i];
    const b = q[i + 1];
    if (!a && !b) continue;
    if (!a || !b || a.val !== b.val) return false;
    q.push(a.left, b.right, a.right, b.left);
  }
  return true;
}

// ─── ex08 · Lật cây ───
// Ý tưởng: duyệt mọi node (thứ tự nào cũng được) và đổi left ↔ right.
// Độ phức tạp: O(n) time · O(h) space.
export function invertTree(root: TreeNode | null): TreeNode | null {
  const st: TreeNode[] = root ? [root] : [];
  while (st.length) {
    const node = st.pop()!;
    [node.left, node.right] = [node.right, node.left];
    if (node.left) st.push(node.left);
    if (node.right) st.push(node.right);
  }
  return root;
}

// ─── ex09 · Trung bình theo tầng ───
// Ý tưởng: BFS theo tầng, cộng tổng và chia cho số node.
// Độ phức tạp: O(n) time · O(w) space.
// Python/Java: Java cộng bằng `long sum` (hai số ~2³¹ cộng lại tràn int) rồi `(double) sum / count`.
export function averageOfLevels(root: TreeNode | null): number[] {
  return levelOrder(root).map((lv) => lv.reduce((s, v) => s + v, 0) / lv.length);
}

// ─── ex10 · Chiều rộng lớn nhất ───
// Ý tưởng: BFS kèm vị trí (con trái 2i, con phải 2i + 1). Mỗi tầng trừ đi vị trí của node đầu tầng trước khi sinh vị trí con
//   → vị trí luôn < 2 × bề rộng tầng, không tràn.
// Độ phức tạp: O(n) time · O(w) space.
// Bẫy: không chuẩn hóa → với cây lệch 3000 tầng, vị trí ~ 2³⁰⁰⁰ (Infinity trong JS, tràn long trong Java).
export function widthOfBinaryTree(root: TreeNode | null): number {
  if (!root) return 0;
  let q: [TreeNode, number][] = [[root, 0]];
  let best = 0;
  while (q.length) {
    const base = q[0][1];
    best = Math.max(best, q[q.length - 1][1] - base + 1);
    const next: [TreeNode, number][] = [];
    for (const [node, pos] of q) {
      const p = pos - base;
      if (node.left) next.push([node.left, 2 * p]);
      if (node.right) next.push([node.right, 2 * p + 1]);
    }
    q = next;
  }
  return best;
}
