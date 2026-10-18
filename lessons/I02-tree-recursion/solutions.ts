// I02 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { TreeNode } from '../../tools/lib.ts';

// ─── ex01 · Đường kính ───
// Ý tưởng: height(node) trả về số node trên nhánh dài nhất đi xuống; đường kính qua node = hL + hR (số cạnh) → cập nhật best.
// Độ phức tạp: O(n) time · O(h) stack.
// Bẫy: trả hL + hR cho cha (đường đi lên không được rẽ hai nhánh).
// Python/Java: Python dùng `nonlocal best` trong hàm lồng; Java dùng field hoặc mảng 1 phần tử `int[] best`.
export function diameterOfBinaryTree(root: TreeNode | null): number {
  let best = 0;
  const height = (node: TreeNode | null): number => {
    if (!node) return 0;
    const l = height(node.left);
    const r = height(node.right);
    best = Math.max(best, l + r);
    return 1 + Math.max(l, r);
  };
  height(root);
  return best;
}

// ─── ex02 · Cây cân bằng ───
// Ý tưởng: một lần post-order trả về chiều cao, hoặc −1 nếu cây con đã mất cân bằng (dừng sớm, lan −1 lên).
// Độ phức tạp: O(n) time · O(h) stack.
// Bẫy: isBalanced(left) && isBalanced(right) && |height(l) − height(r)| ≤ 1 — đúng nhưng O(n²) với cây lệch
//   (mỗi tầng tính lại chiều cao toàn bộ cây con).
export function isBalanced(root: TreeNode | null): boolean {
  const check = (node: TreeNode | null): number => {
    if (!node) return 0;
    const l = check(node.left);
    if (l < 0) return -1;
    const r = check(node.right);
    if (r < 0 || Math.abs(l - r) > 1) return -1;
    return 1 + Math.max(l, r);
  };
  return check(root) >= 0;
}

// ─── ex03 · Có đường gốc → lá với tổng cho trước ───
// Ý tưởng: top-down, trừ dần targetSum; ở LÁ kiểm tra phần còn lại bằng 0.
// Độ phức tạp: O(n) time · O(h) stack.
// Bẫy: cây rỗng với target 0 → false (không có đường nào); node có 1 con không phải lá.
export function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (!root) return false;
  const rest = targetSum - root.val;
  if (!root.left && !root.right) return rest === 0;
  return hasPathSum(root.left, rest) || hasPathSum(root.right, rest);
}

// ─── ex04 · Liệt kê mọi đường có tổng cho trước ───
// Ý tưởng: backtracking: một mảng `path` dùng chung — push khi vào node, pop khi ra; ở lá đúng tổng thì COPY path vào kết quả.
// Độ phức tạp: O(n · h) time (copy đường) · O(h) space ngoài output.
// Bẫy: push `path` (tham chiếu) thay vì bản copy → mọi kết quả cuối cùng đều rỗng.
// Python/Java: Python `out.append(path[:])`; Java `out.add(new ArrayList<>(path))`, `path.remove(path.size() - 1)`.
export function pathSumAll(root: TreeNode | null, targetSum: number): number[][] {
  const out: number[][] = [];
  const path: number[] = [];
  const dfs = (node: TreeNode | null, rest: number) => {
    if (!node) return;
    path.push(node.val);
    rest -= node.val;
    if (!node.left && !node.right) {
      if (rest === 0) out.push(path.slice());
    } else {
      dfs(node.left, rest);
      dfs(node.right, rest);
    }
    path.pop();
  };
  dfs(root, targetSum);
  return out;
}

// ─── ex05 · LCA ───
// Ý tưởng: trả về node p/q nếu gặp; nếu p và q được tìm thấy ở hai cây con khác nhau thì node hiện tại là LCA.
// Độ phức tạp: O(n) time · O(h) stack.
// Vì sao đúng khi p là tổ tiên của q: gặp p trước thì trả p ngay; nhánh còn lại không chứa gì → p được lan lên làm đáp án.
// Cách khác: lưu parent của mọi node (BFS), đi từ p lên đánh dấu tổ tiên, rồi đi từ q lên tới node đã đánh dấu đầu tiên.
export function lowestCommonAncestor(root: TreeNode | null, p: number, q: number): number {
  const find = (node: TreeNode | null): TreeNode | null => {
    if (!node || node.val === p || node.val === q) return node;
    const l = find(node.left);
    const r = find(node.right);
    if (l && r) return node;
    return l ?? r;
  };
  return find(root)!.val;
}

// ─── ex06 · Tổng đường đi lớn nhất ───
// Ý tưởng: gain(node) = lợi ích tốt nhất của một nhánh đi xuống từ node = node.val + max(0, gain(left), gain(right))
//   (nhánh âm thì không đi). Đường qua node "gập" ở node = node.val + max(0, gL) + max(0, gR) → cập nhật best.
// Độ phức tạp: O(n) time · O(h) stack.
// Bẫy: best khởi tạo 0 → sai khi mọi giá trị âm (đáp án phải có ít nhất 1 node).
export function maxPathSum(root: TreeNode | null): number {
  let best = -Infinity;
  const gain = (node: TreeNode | null): number => {
    if (!node) return 0;
    const l = Math.max(0, gain(node.left));
    const r = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + l + r);
    return node.val + Math.max(l, r);
  };
  gain(root);
  return best;
}

// ─── ex07 · Dựng cây từ pre-order + in-order ───
// Ý tưởng: con trỏ `pre` chạy dọc preorder (mỗi lần lấy một gốc); build(lo, hi) dựng cây cho đoạn inorder[lo..hi]:
//   gốc = preorder[pre++], vị trí gốc trong inorder tra bằng Map; dựng trái (lo..mid−1) rồi phải (mid+1..hi).
// Độ phức tạp: O(n) time · O(n) space (Map) · O(h) stack.
// Bẫy: dùng `inorder.indexOf` → O(n²); slice mảng ở mỗi lần gọi → O(n²) bộ nhớ/thời gian.
export function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  const pos = new Map<number, number>();
  inorder.forEach((v, i) => pos.set(v, i));
  let pre = 0;
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null;
    const node = new TreeNode(preorder[pre++]);
    const mid = pos.get(node.val)!;
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  };
  return build(0, inorder.length - 1);
}

// ─── ex08 · Serialize ───
// Ý tưởng: pre-order bằng stack tự quản (an toàn với cây cao), null ghi '#'.
// Độ phức tạp: O(n) time · O(n) space.
// Cách khác: đệ quy `node ? `${v},${s(l)},${s(r)}` : '#'` — ngắn nhưng nối chuỗi ở mỗi tầng → O(n · h) và tràn stack nếu cây cao.
export function serialize(root: TreeNode | null): string {
  const out: string[] = [];
  const st: (TreeNode | null)[] = [root];
  while (st.length) {
    const node = st.pop()!;
    if (!node) {
      out.push('#');
      continue;
    }
    out.push(String(node.val));
    st.push(node.right, node.left);
  }
  return out.join(',');
}

// ─── ex09 · Deserialize ───
// Ý tưởng: duyệt token với chỉ số i (không shift). Mô phỏng đệ quy bằng stack các "chỗ cần gắn con":
//   mỗi node mới tạo sẽ cần gắn left rồi right. Pre-order nên token tiếp theo luôn thuộc chỗ trống gần nhất.
// Độ phức tạp: O(n) time · O(h) space.
// Bản đệ quy (dễ đọc hơn, đủ dùng khi cây không quá cao):
//   const build = () => { const t = tok[i++]; if (t === '#') return null; const n = new TreeNode(+t); n.left = build(); n.right = build(); return n; }
export function deserialize(data: string): TreeNode | null {
  const tok = data.split(',');
  if (tok[0] === '#') return null;
  const root = new TreeNode(Number(tok[0]));
  // stack các node còn chờ gắn con; side[k] = 0 → đang chờ gắn left, 1 → chờ gắn right
  const st: TreeNode[] = [root];
  const side: number[] = [0];
  for (let i = 1; i < tok.length && st.length; i++) {
    const parent = st[st.length - 1];
    const node = tok[i] === '#' ? null : new TreeNode(Number(tok[i]));
    if (side[side.length - 1] === 0) {
      parent.left = node;
      side[side.length - 1] = 1;
    } else {
      parent.right = node;
      st.pop();
      side.pop();
    }
    if (node) {
      st.push(node);
      side.push(0);
    }
  }
  return root;
}

// ─── ex10 · Khoảng cách giữa hai nhân viên ───
// Ý tưởng: một lần DFS trả về khoảng cách từ node hiện tại xuống a hoặc b (−1 nếu cây con không chứa ai);
//   khi tìm thấy cả hai ở hai phía (hoặc node là một trong hai và phía dưới có người kia) → đáp án = tổng hai khoảng cách.
// Độ phức tạp: O(n) time · O(h) stack.
// Cách khác (dễ nghĩ): LCA rồi depth(a) + depth(b) − 2·depth(lca) — 3 lần duyệt, vẫn O(n).
export function distanceBetween(root: TreeNode | null, a: number, b: number): number {
  if (a === b) return 0;
  let answer = -1;
  const dfs = (node: TreeNode | null): number => {
    if (!node || answer >= 0) return -1;
    const l = dfs(node.left);
    const r = dfs(node.right);
    const self = node.val === a || node.val === b;
    if (self && (l >= 0 || r >= 0)) {
      answer = Math.max(l, r) + 1;
      return -1;
    }
    if (l >= 0 && r >= 0) {
      answer = l + r + 2;
      return -1;
    }
    if (self) return 0;
    if (l >= 0) return l + 1;
    if (r >= 0) return r + 1;
    return -1;
  };
  dfs(root);
  return answer;
}
