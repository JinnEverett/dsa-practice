// I07 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── helper: danh sách kề CSR có hướng + bậc vào ───
interface Dag {
  start: Int32Array;
  to: Int32Array;
  indeg: Int32Array;
}
function buildDag(n: number, edges: number[][]): Dag {
  const start = new Int32Array(n + 2);
  const indeg = new Int32Array(n);
  for (const [a, b] of edges) {
    start[a + 2]++;
    indeg[b]++;
  }
  for (let i = 2; i <= n + 1; i++) start[i] += start[i - 1];
  const to = new Int32Array(edges.length);
  for (const [a, b] of edges) to[start[a + 1]++] = b;
  return { start, to, indeg };
}

/** Kahn: trả thứ tự topo (độ dài < n nếu có chu trình). Queue = Int32Array cỡ n (mỗi đỉnh vào đúng 1 lần). */
function kahn(n: number, edges: number[][]): Int32Array {
  const { start, to, indeg } = buildDag(n, edges);
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (let v = 0; v < n; v++) if (indeg[v] === 0) q[tail++] = v;
  while (head < tail) {
    const u = q[head++];
    for (let i = start[u]; i < start[u + 1]; i++) if (--indeg[to[i]] === 0) q[tail++] = to[i];
  }
  return q.subarray(0, tail);
}

/**
 * ex01 · canFinish
 * Ý tưởng: cạnh b → a cho mỗi prerequisite [a, b]. Làm được hết ⇔ đồ thị là DAG ⇔ Kahn lấy ra đủ n đỉnh.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: không cần DFS 3 màu / đệ quy → an toàn với chuỗi phụ thuộc dài 10⁵.
 * Bẫy: đảo chiều cạnh (prerequisites[i] = [a, b] nghĩa là học b TRƯỚC a); đếm sai khi có cạnh trùng
 *   (mỗi cạnh cộng bậc vào một lần, trừ một lần → vẫn nhất quán).
 * Cách khác: DFS 3 màu (I06 ex05) — cùng độ phức tạp.
 * Python/Java: Python `deque` + `indeg` list; Java `ArrayDeque<Integer>` hoặc `int[]` queue.
 */
export function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  return kahn(numCourses, prerequisites.map(([a, b]) => [b, a])).length === numCourses;
}

/**
 * ex02 · findOrder
 * Ý tưởng: chính thứ tự Kahn lấy ra là một thứ tự topo hợp lệ; chưa đủ n phần tử → có chu trình → [].
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: một lần duyệt, vừa phát hiện chu trình vừa cho đáp án.
 * Bẫy: quên trả [] khi có chu trình (trả thứ tự thiếu).
 * Cách khác: DFS post-order rồi đảo ngược (cần bản lặp để tránh tràn stack).
 * Python/Java: Java trả `int[]` rỗng `new int[0]`.
 */
export function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const order = kahn(numCourses, prerequisites.map(([a, b]) => [b, a]));
  return order.length === numCourses ? Array.from(order) : [];
}

/**
 * ex03 · lexSmallestTopo
 * Ý tưởng: Kahn nhưng thay queue bằng MIN-HEAP: mỗi bước lấy đỉnh nhỏ nhất trong số đỉnh đã "sẵn sàng" (bậc vào 0).
 * Độ phức tạp: O((n + m) log n).
 * Vì sao best practice: chọn tham lam đỉnh nhỏ nhất đang sẵn sàng luôn cho thứ tự từ điển nhỏ nhất (đổi chỗ không làm
 *   tốt hơn: mọi đỉnh nhỏ hơn mà sẵn sàng đã bị lấy trước).
 * Bẫy: dùng queue thường rồi sort → sai (một đỉnh nhỏ hơn có thể chỉ sẵn sàng sau khi một đỉnh lớn được lấy).
 * Cách khác: không có cách đơn giản hơn; đây cũng là khung của "mô phỏng với độ ưu tiên".
 * Python/Java: Python `heapq`; Java `PriorityQueue<Integer>`.
 */
export function lexSmallestTopo(n: number, edges: number[][]): number[] {
  const { start, to, indeg } = buildDag(n, edges);
  const heap = new Heap<number>((a, b) => a < b);
  for (let v = 0; v < n; v++) if (indeg[v] === 0) heap.push(v);
  const out: number[] = [];
  while (heap.size) {
    const u = heap.pop()!;
    out.push(u);
    for (let i = start[u]; i < start[u + 1]; i++) if (--indeg[to[i]] === 0) heap.push(to[i]);
  }
  return out.length === n ? out : [];
}

/**
 * ex04 · alienOrder
 * Ý tưởng: với mỗi cặp từ KỀ NHAU, ký tự khác nhau đầu tiên cho một cạnh c1 → c2 (c1 đứng trước c2). Rồi topo sort
 *   26 chữ cái. Nếu từ dài đứng trước chính tiền tố của nó → không hợp lệ.
 * Độ phức tạp: O(tổng độ dài + 26²).
 * Vì sao best practice: chỉ so các cặp kề nhau (O(W·L)) — mọi ràng buộc khác suy ra bắc cầu; ma trận 26×26 khử cạnh trùng
 *   để bậc vào không bị đếm lặp.
 * Bẫy: cạnh trùng làm bậc vào sai; quên chữ cái xuất hiện nhưng không có ràng buộc (vẫn phải có mặt trong kết quả);
 *   ["abc", "ab"] → "".
 * Cách khác: DFS post-order.
 * Python/Java: Python `set` các cặp; Java `boolean[26][26]`.
 */
export function alienOrder(words: string[]): string {
  const present = new Uint8Array(26);
  for (const w of words) for (let i = 0; i < w.length; i++) present[w.charCodeAt(i) - 97] = 1;
  const edge = new Uint8Array(26 * 26);
  const indeg = new Int32Array(26);
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i];
    const b = words[i + 1];
    let k = 0;
    const L = Math.min(a.length, b.length);
    while (k < L && a[k] === b[k]) k++;
    if (k === L) {
      if (a.length > b.length) return '';
      continue;
    }
    const x = a.charCodeAt(k) - 97;
    const y = b.charCodeAt(k) - 97;
    if (!edge[x * 26 + y]) (edge[x * 26 + y] = 1), indeg[y]++;
  }
  const q: number[] = [];
  let total = 0;
  for (let c = 0; c < 26; c++)
    if (present[c]) {
      total++;
      if (indeg[c] === 0) q.push(c);
    }
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    for (let v = 0; v < 26; v++) if (edge[u * 26 + v] && --indeg[v] === 0) q.push(v);
  }
  return q.length === total ? String.fromCharCode(...q.map((c) => c + 97)) : '';
}

/**
 * ex05 · minimumSemesters
 * Ý tưởng: Kahn theo TẦNG — mỗi vòng lấy hết các môn sẵn sàng = một học kỳ. Số tầng = độ dài đường dài nhất (tính theo đỉnh).
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: không cần DP riêng; số vòng của Kahn chính là đáp án. Cần song song tối đa (không giới hạn môn/kỳ).
 * Bẫy: chưa lấy đủ n môn → −1; n = 1 không có quan hệ → 1.
 * Cách khác: dp[v] = 1 + max dp[u] theo thứ tự topo.
 * Python/Java: tương tự; dùng `levelEnd = tail` như BFS theo tầng (I05).
 */
export function minimumSemesters(n: number, relations: number[][]): number {
  const { start, to, indeg } = buildDag(n, relations);
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (let v = 0; v < n; v++) if (indeg[v] === 0) q[tail++] = v;
  let semesters = 0;
  while (head < tail) {
    const levelEnd = tail;
    semesters++;
    while (head < levelEnd) {
      const u = q[head++];
      for (let i = start[u]; i < start[u + 1]; i++) if (--indeg[to[i]] === 0) q[tail++] = to[i];
    }
  }
  return tail === n ? semesters : -1;
}

/**
 * ex06 · eventualSafeNodes
 * Ý tưởng: đỉnh "an toàn" = mọi đường đi từ nó đều kết thúc. ĐẢO CẠNH và chạy Kahn theo BẬC RA: đỉnh bậc ra 0 an toàn;
 *   gỡ nó thì các đỉnh trỏ tới nó giảm bậc ra.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: không cần 3 màu + đệ quy; kết quả đúng thứ tự tăng dần nhờ duyệt mảng safe.
 * Bẫy: trả theo thứ tự lấy ra khỏi queue (không tăng dần); đỉnh có khuyên (tự trỏ vào mình) không bao giờ an toàn.
 * Cách khác: DFS 3 màu — đỉnh kết thúc màu đen không qua màu xám là an toàn.
 * Python/Java: tương tự.
 */
export function eventualSafeNodes(graph: number[][]): number[] {
  const n = graph.length;
  const outdeg = new Int32Array(n);
  const rev: number[][] = Array.from({ length: n }, () => []);
  for (let u = 0; u < n; u++) {
    outdeg[u] = graph[u].length;
    for (const v of graph[u]) rev[v].push(u);
  }
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const safe = new Uint8Array(n);
  for (let v = 0; v < n; v++) if (outdeg[v] === 0) (q[tail++] = v), (safe[v] = 1);
  while (head < tail) {
    const v = q[head++];
    for (const u of rev[v]) if (--outdeg[u] === 0) (q[tail++] = u), (safe[u] = 1);
  }
  const out: number[] = [];
  for (let v = 0; v < n; v++) if (safe[v]) out.push(v);
  return out;
}

/**
 * ex07 · migrationOrder
 * Ý tưởng: sắp tên tăng dần để gán id = thứ hạng → "chọn tên nhỏ nhất" thành "chọn id nhỏ nhất"; rồi dùng lại khung ex03.
 * Độ phức tạp: O(n log n + m log n).
 * Vì sao best practice: heap chứa số nguyên (so sánh rẻ) thay vì chuỗi; ánh xạ tên → id một lần.
 * Bẫy: cạnh trùng — dùng Set để khử hoặc cộng/trừ bậc nhất quán theo từng dòng deps; quên [] khi có chu trình;
 *   so sánh chuỗi theo mã ký tự (ASCII), không theo locale.
 * Cách khác: heap chứa trực tiếp chuỗi.
 * Python/Java: Python `sorted(names)`, `heapq` trên int; Java `Arrays.sort` + `PriorityQueue<Integer>`.
 */
export function migrationOrder(names: string[], deps: string[][]): string[] {
  const sorted = names.slice().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const id = new Map<string, number>();
  sorted.forEach((s, i) => id.set(s, i));
  const order = lexSmallestTopo(
    names.length,
    deps.map(([name, requires]) => [id.get(requires)!, id.get(name)!]),
  );
  return order.map((i) => sorted[i]);
}

/**
 * ex08 · minBuildTime
 * Ý tưởng: build song song không giới hạn worker → finish[v] = duration[v] + max(finish[u]) với mọi u phải xong trước v.
 *   Tính theo thứ tự topo (Kahn); đáp án = max finish. Đây là đường dài nhất (theo trọng số đỉnh) trên DAG.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: DP trên DAG theo thứ tự topo — không cần ghi nhớ đệ quy.
 * Bẫy: tổng tới 10⁵ · 10⁹ = 10¹⁴ > 2³¹ → Java dùng `long` (TS an toàn tới 2⁵³ ≈ 9·10¹⁵); lấy max cuối cùng trên MỌI đỉnh.
 * Cách khác: DFS + memo (cần bản lặp).
 * Python/Java: Python int không tràn; Java `long[]`.
 */
export function minBuildTime(n: number, deps: number[][], duration: number[]): number {
  const { start, to, indeg } = buildDag(n, deps);
  const ready = new Float64Array(n); // ready[v] = thời điểm sớm nhất v có thể bắt đầu (mọi tiên quyết đã xong)
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (let v = 0; v < n; v++) if (indeg[v] === 0) q[tail++] = v;
  let best = 0;
  while (head < tail) {
    const u = q[head++];
    const done = ready[u] + duration[u];
    if (done > best) best = done;
    for (let i = start[u]; i < start[u + 1]; i++) {
      const v = to[i];
      if (done > ready[v]) ready[v] = done;
      if (--indeg[v] === 0) q[tail++] = v;
    }
  }
  return best;
}
