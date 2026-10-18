// Thư viện dùng chung cho bài làm, lời giải và spec chấm.
// Bài làm chỉ cần import ListNode / TreeNode (và các hàm build nếu muốn tự test).

// ───────────────────────── Linked list ─────────────────────────

export class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

/** [1,2,3] → 1 → 2 → 3. Mảng rỗng → null. */
export function buildList(arr: number[]): ListNode | null {
  const dummy = new ListNode();
  let tail = dummy;
  for (const v of arr) {
    tail.next = new ListNode(v);
    tail = tail.next;
  }
  return dummy.next;
}

/** Tạo list có chu trình: node cuối nối về node thứ `pos` (pos = -1: không có chu trình). */
export function buildCycleList(arr: number[], pos: number): ListNode | null {
  const head = buildList(arr);
  if (pos < 0 || !head) return head;
  let tail = head;
  let target: ListNode | null = null;
  for (let i = 0; ; i++) {
    if (i === pos) target = tail;
    if (!tail.next) break;
    tail = tail.next;
  }
  tail.next = target;
  return head;
}

const LIST_LIMIT = 10_000_000;

/** 1 → 2 → 3 → [1,2,3]. Ném lỗi nếu list có chu trình (hoặc dài bất thường). */
export function listToArray(head: ListNode | null): number[] {
  const out: number[] = [];
  for (let cur = head; cur; cur = cur.next) {
    out.push(cur.val);
    if (out.length > LIST_LIMIT) throw new Error('list có chu trình hoặc dài hơn 10^7 node');
  }
  return out;
}

// ───────────────────────── Binary tree ─────────────────────────

export class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/** Dựng cây từ mảng level-order kiểu LeetCode: [3,9,20,null,null,15,7]. */
export function buildTree(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue: TreeNode[] = [root];
  let head = 0;
  let i = 1;
  while (i < arr.length) {
    const node = queue[head++];
    const l = arr[i++];
    if (l !== null && l !== undefined) {
      node.left = new TreeNode(l);
      queue.push(node.left);
    }
    if (i >= arr.length) break;
    const r = arr[i++];
    if (r !== null && r !== undefined) {
      node.right = new TreeNode(r);
      queue.push(node.right);
    }
  }
  return root;
}

/** Cây → mảng level-order kiểu LeetCode (bỏ các null ở cuối). */
export function treeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return [];
  const out: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    if (node) {
      out.push(node.val);
      queue.push(node.left, node.right);
    } else {
      out.push(null);
    }
    if (queue.length > LIST_LIMIT) throw new Error('cây có chu trình hoặc quá lớn');
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

/** Tìm node đầu tiên có giá trị `val` (dùng cho bài LCA, successor...). */
export function findNode(root: TreeNode | null, val: number): TreeNode | null {
  const stack: (TreeNode | null)[] = [root];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    if (node.val === val) return node;
    stack.push(node.right, node.left);
  }
  return null;
}

/** In cây dạng ASCII nằm ngang để debug:  console.log(printTree(root)) */
export function printTree(root: TreeNode | null): string {
  const lines: string[] = [];
  const walk = (node: TreeNode | null, prefix: string, isLeft: boolean, isRoot: boolean) => {
    if (!node) return;
    walk(node.right, prefix + (isRoot ? '' : isLeft ? '│   ' : '    '), false, false);
    lines.push(prefix + (isRoot ? '' : isLeft ? '└── ' : '┌── ') + node.val);
    walk(node.left, prefix + (isRoot ? '' : isLeft ? '    ' : '│   '), true, false);
  };
  walk(root, '', false, true);
  return lines.join('\n');
}

// ───────────────────────── Random có seed ─────────────────────────

/** RNG mulberry32: nhanh, có seed, tái lập được. */
export class Rng {
  private s: number;
  constructor(seed = 42) {
    this.s = seed >>> 0;
  }
  /** Số thực trong [0, 1). */
  float(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  /** Số nguyên trong [lo, hi] (cả hai đầu). */
  int(lo: number, hi: number): number {
    return lo + Math.floor(this.float() * (hi - lo + 1));
  }
  bool(p = 0.5): boolean {
    return this.float() < p;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.float() * arr.length)];
  }
  /** Mảng n số nguyên ngẫu nhiên trong [lo, hi]. */
  array(n: number, lo: number, hi: number): number[] {
    const out = new Array<number>(n);
    for (let i = 0; i < n; i++) out[i] = this.int(lo, hi);
    return out;
  }
  /** Mảng n số nguyên KHÁC NHAU trong [lo, hi] (yêu cầu hi - lo + 1 >= n). */
  distinct(n: number, lo: number, hi: number): number[] {
    const range = hi - lo + 1;
    if (range < n) throw new Error('distinct: miền giá trị nhỏ hơn n');
    if (range <= 4 * n) {
      const all = Array.from({ length: range }, (_, i) => lo + i);
      this.shuffle(all);
      return all.slice(0, n);
    }
    const seen = new Set<number>();
    const out: number[] = [];
    while (out.length < n) {
      const v = this.int(lo, hi);
      if (!seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    }
    return out;
  }
  sorted(n: number, lo: number, hi: number): number[] {
    return this.array(n, lo, hi).sort((a, b) => a - b);
  }
  /** Fisher–Yates, xáo trộn tại chỗ. */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.float() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }
  string(n: number, alphabet = 'abcdefghijklmnopqrstuvwxyz'): string {
    let s = '';
    for (let i = 0; i < n; i++) s += alphabet[Math.floor(this.float() * alphabet.length)];
    return s;
  }
  /** Ma trận rows × cols số nguyên trong [lo, hi]. */
  matrix(rows: number, cols: number, lo: number, hi: number): number[][] {
    return Array.from({ length: rows }, () => this.array(cols, lo, hi));
  }
  /** Cây nhị phân ngẫu nhiên n node (dạng level-order có null), giá trị trong [lo, hi]. */
  tree(n: number, lo = 0, hi = 100): (number | null)[] {
    if (n === 0) return [];
    const root = new TreeNode(this.int(lo, hi));
    const nodes = [root];
    for (let i = 1; i < n; i++) {
      // gắn vào một node ngẫu nhiên còn chỗ trống
      for (;;) {
        const p = nodes[this.int(0, nodes.length - 1)];
        const goLeft = this.bool();
        if (goLeft && !p.left) {
          p.left = new TreeNode(this.int(lo, hi));
          nodes.push(p.left);
          break;
        }
        if (!goLeft && !p.right) {
          p.right = new TreeNode(this.int(lo, hi));
          nodes.push(p.right);
          break;
        }
      }
    }
    return treeToArray(root);
  }
  /** Cây "lệch" (gần như một đường thẳng) — dùng để thử giới hạn độ sâu đệ quy. */
  skewedTree(n: number, lo = 0, hi = 100): (number | null)[] {
    if (n === 0) return [];
    const root = new TreeNode(this.int(lo, hi));
    let cur = root;
    for (let i = 1; i < n; i++) {
      const node = new TreeNode(this.int(lo, hi));
      if (this.bool(0.5)) cur.left = node;
      else cur.right = node;
      cur = node;
    }
    return treeToArray(root);
  }
  /** Cây nhị phân tìm kiếm từ n giá trị khác nhau (chèn theo thứ tự ngẫu nhiên). */
  bst(n: number, lo = 0, hi = 1_000_000): (number | null)[] {
    const vals = this.distinct(n, lo, hi);
    let root: TreeNode | null = null;
    for (const v of vals) {
      if (!root) {
        root = new TreeNode(v);
        continue;
      }
      let cur = root;
      for (;;) {
        if (v < cur.val) {
          if (!cur.left) { cur.left = new TreeNode(v); break; }
          cur = cur.left;
        } else {
          if (!cur.right) { cur.right = new TreeNode(v); break; }
          cur = cur.right;
        }
      }
    }
    return treeToArray(root);
  }
  /**
   * Danh sách cạnh của đồ thị n đỉnh (0..n-1), m cạnh, không có cạnh lặp và không self-loop.
   * connected: thêm trước một cây khung ngẫu nhiên. weighted: cạnh có dạng [u, v, w].
   */
  edges(
    n: number,
    m: number,
    opts: { directed?: boolean; connected?: boolean; weighted?: [number, number]; dag?: boolean } = {},
  ): number[][] {
    const { directed = false, connected = false, weighted, dag = false } = opts;
    const maxEdges = directed ? n * (n - 1) : (n * (n - 1)) / 2;
    m = Math.min(m, dag ? (n * (n - 1)) / 2 : maxEdges);
    const order = this.shuffle(Array.from({ length: n }, (_, i) => i)); // dùng cho dag
    const rank = new Array<number>(n);
    order.forEach((v, i) => (rank[v] = i));
    const seen = new Set<number>();
    const out: number[][] = [];
    const add = (u: number, v: number) => {
      if (u === v) return false;
      if (dag && rank[u] > rank[v]) [u, v] = [v, u];
      const key = directed || dag ? u * n + v : Math.min(u, v) * n + Math.max(u, v);
      if (seen.has(key)) return false;
      seen.add(key);
      out.push(weighted ? [u, v, this.int(weighted[0], weighted[1])] : [u, v]);
      return true;
    };
    if (connected) {
      for (let i = 1; i < n; i++) add(order[this.int(0, i - 1)], order[i]);
    }
    let guard = 0;
    while (out.length < m && guard++ < m * 20 + 100) add(this.int(0, n - 1), this.int(0, n - 1));
    return out;
  }
}

// ───────────────────────── So sánh ─────────────────────────

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as unknown[];
    if (a.length !== bb.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], bb[i])) return false;
    return true;
  }
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!deepEqual((a as any)[k], (b as any)[k])) return false;
  return true;
}

/** Sắp xếp chính tắc để so sánh không phụ thuộc thứ tự. */
export function canonical(x: unknown, deep: boolean): unknown {
  if (!Array.isArray(x)) return x;
  const items = deep ? x.map((v) => canonical(v, true)) : x.slice();
  return items.sort((a, b) => {
    const sa = JSON.stringify(a);
    const sb = JSON.stringify(b);
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
}

export function floatEqual(a: unknown, b: unknown, eps = 1e-6): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => floatEqual(v, b[i], eps));
  }
  return deepEqual(a, b);
}

/** Rút gọn giá trị để in (mảng dài thì cắt bớt). */
export function preview(x: unknown, max = 160): string {
  let s: string;
  try {
    s = JSON.stringify(x, (_k, v) => (v instanceof ListNode ? `List(${listToArray(v).join('→')})` : v instanceof TreeNode ? `Tree${JSON.stringify(treeToArray(v))}` : v));
  } catch {
    s = String(x);
  }
  if (s === undefined) s = String(x);
  return s.length > max ? s.slice(0, max) + `… (${s.length} ký tự)` : s;
}
