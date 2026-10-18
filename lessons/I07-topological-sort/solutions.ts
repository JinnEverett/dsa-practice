// I07 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── Helper: danh sách kề dạng CSR (mảng phẳng) ───
// Nhanh hơn number[][] vì không tạo n mảng con; duyệt kề của u là head[u]..head[u+1]-1.
// edges[i] = [from, to]; chỉ số node trong [0, n).
interface Csr {
  head: Int32Array;
  to: Int32Array;
  indeg: Int32Array;
}
function buildCsr(n: number, from: ArrayLike<number>, to: ArrayLike<number>): Csr {
  const m = from.length;
  const head = new Int32Array(n + 1);
  const indeg = new Int32Array(n);
  for (let i = 0; i < m; i++) {
    head[from[i] + 1]++;
    indeg[to[i]]++;
  }
  for (let i = 0; i < n; i++) head[i + 1] += head[i];
  const fill = head.slice(0, n);
  const out = new Int32Array(m);
  for (let i = 0; i < m; i++) out[fill[from[i]]++] = to[i];
  return { head, to: out, indeg };
}
function csrOfEdges(n: number, edges: number[][], flip = false, offset = 0): Csr {
  const m = edges.length;
  const f = new Int32Array(m);
  const t = new Int32Array(m);
  for (let i = 0; i < m; i++) {
    f[i] = edges[i][flip ? 1 : 0] - offset;
    t[i] = edges[i][flip ? 0 : 1] - offset;
  }
  return buildCsr(n, f, t);
}

/** Kahn: trả về thứ tự topo (độ dài < n nếu có chu trình). Hàng đợi là mảng + chỉ số đầu (không shift). */
function kahn(n: number, g: Csr): Int32Array {
  const indeg = g.indeg;
  const order = new Int32Array(n);
  let tail = 0;
  for (let i = 0; i < n; i++) if (indeg[i] === 0) order[tail++] = i;
  for (let h = 0; h < tail; h++) {
    const u = order[h];
    for (let e = g.head[u]; e < g.head[u + 1]; e++) {
      const v = g.to[e];
      if (--indeg[v] === 0) order[tail++] = v;
    }
  }
  return order.subarray(0, tail);
}

// ─── ex01 · canFinish ───
/*
 * Ý tưởng: [a, b] = "học b trước a" → cạnh b → a. Kahn: lặp bỏ node in-degree 0; học hết được ⇔ bỏ được n node ⇔ không có chu trình.
 * Độ phức tạp: O(n + m) thời gian, O(n + m) bộ nhớ.
 * Vì sao best practice: không đệ quy → an toàn với chuỗi phụ thuộc dài 10⁵ (đệ quy DFS sẽ tràn stack ở TS ~10⁴ tầng, Python ~12 000).
 * Bẫy: đảo chiều cạnh; cạnh lặp / tự trỏ (a == b) vẫn đúng vì in-degree đếm theo cạnh.
 * Cách khác: DFS 3 màu (trắng/xám/đen) — cạnh về node xám = chu trình (viết lặp bằng stack tường minh).
 * Python/Java: Python dùng `collections.deque` hoặc mảng + chỉ số đầu; Java `ArrayDeque<Integer>` hoặc `int[]` làm queue.
 */
export function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const g = csrOfEdges(numCourses, prerequisites, true);
  return kahn(numCourses, g).length === numCourses;
}

// ─── ex02 · findOrder ───
/*
 * Ý tưởng: giống ex01 nhưng trả luôn thứ tự Kahn; độ dài < n → [].
 * Độ phức tạp: O(n + m).
 * Bẫy: có nhiều thứ tự hợp lệ → checker kiểm tra tính hợp lệ chứ không so từng phần tử.
 * Cách khác: DFS post-order rồi đảo ngược (thứ tự khác nhưng cũng hợp lệ).
 * Python/Java: trả `list` / `int[]` rỗng khi có chu trình (Java: `new int[0]`).
 */
export function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const order = kahn(numCourses, csrOfEdges(numCourses, prerequisites, true));
  return order.length === numCourses ? Array.from(order) : [];
}

// ─── ex03 · lexSmallestTopo ───
/*
 * Ý tưởng: Kahn nhưng thay queue bằng min-heap: mỗi bước lấy node nhỏ nhất trong số các node đang sẵn sàng (in-degree 0).
 * Độ phức tạp: O((n + m) log n) — mỗi node push/pop một lần.
 * Vì sao best practice: chọn min cục bộ ở mỗi bước chính là chọn thứ tự từ điển nhỏ nhất (tập sẵn sàng chỉ nở thêm, không mất node nhỏ).
 * Bẫy: dùng queue thường cho thứ tự "ngẫu nhiên" theo tầng, không phải từ điển; sort lại danh sách sẵn sàng mỗi bước → O(n² log n).
 * Cách khác: không có cách O(n + m) đơn giản.
 * Python/Java: `heapq` / `PriorityQueue<Integer>`; Python so sánh số nguyên nên không cần tuple.
 */
export function lexSmallestTopo(n: number, edges: number[][]): number[] {
  const g = csrOfEdges(n, edges);
  const indeg = g.indeg;
  const heap = new Heap<number>((a, b) => a < b);
  for (let i = 0; i < n; i++) if (indeg[i] === 0) heap.push(i);
  const out: number[] = [];
  while (heap.size) {
    const u = heap.pop()!;
    out.push(u);
    for (let e = g.head[u]; e < g.head[u + 1]; e++) {
      const v = g.to[e];
      if (--indeg[v] === 0) heap.push(v);
    }
  }
  return out.length === n ? out : [];
}

// ─── ex04 · alienOrder ───
/*
 * Ý tưởng: so từng cặp từ liền kề, ký tự khác nhau đầu tiên (c1 ở từ trước, c2 ở từ sau) cho cạnh c1 → c2. Không có ký tự khác mà
 * từ trước DÀI hơn từ sau (vd. "abc" rồi "ab") là vô lý → "". Rồi Kahn trên tối đa 26 chữ cái.
 * Độ phức tạp: O(tổng độ dài các từ) để dựng cạnh + O(26 + cạnh).
 * Vì sao best practice: chỉ cần cặp liền kề (thứ tự tổng bắc cầu lo phần còn lại); khử cạnh trùng để in-degree đúng.
 * Bẫy: (1) cạnh trùng làm in-degree đếm dư → chữ cái không bao giờ được giải phóng; (2) quên chữ cái chỉ xuất hiện trong từ nhưng không
 * có ràng buộc nào (vẫn phải có mặt trong kết quả); (3) quên trường hợp tiền tố.
 * Cách khác: DFS post-order trên 26 node.
 * Python/Java: dùng `set` cạnh (Java `boolean[26][26]`); Java chuỗi `StringBuilder`.
 */
export function alienOrder(words: string[]): string {
  const present = new Array<boolean>(26).fill(false);
  for (const w of words) for (let i = 0; i < w.length; i++) present[w.charCodeAt(i) - 97] = true;
  const seen = new Uint8Array(26 * 26);
  const indeg = new Int32Array(26);
  const adj: number[][] = Array.from({ length: 26 }, () => []);
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i];
    const b = words[i + 1];
    const len = Math.min(a.length, b.length);
    let j = 0;
    while (j < len && a[j] === b[j]) j++;
    if (j === len) {
      if (a.length > b.length) return '';
      continue;
    }
    const x = a.charCodeAt(j) - 97;
    const y = b.charCodeAt(j) - 97;
    if (!seen[x * 26 + y]) {
      seen[x * 26 + y] = 1;
      adj[x].push(y);
      indeg[y]++;
    }
  }
  const queue: number[] = [];
  let total = 0;
  for (let c = 0; c < 26; c++) {
    if (!present[c]) continue;
    total++;
    if (indeg[c] === 0) queue.push(c);
  }
  let out = '';
  for (let h = 0; h < queue.length; h++) {
    const c = queue[h];
    out += String.fromCharCode(97 + c);
    for (const d of adj[c]) if (--indeg[d] === 0) queue.push(d);
  }
  return out.length === total ? out : '';
}

// ─── ex05 · minimumSemesters ───
/*
 * Ý tưởng: Kahn theo TẦNG (BFS nhiều lớp): mỗi học kỳ học mọi môn đang sẵn sàng. Số tầng = độ dài đường dài nhất (tính theo node).
 * Độ phức tạp: O(n + m). Chu trình → còn môn chưa học → -1.
 * Bẫy: môn đánh số 1..n (không phải 0..n-1); đếm tầng bằng cách xử lý cả lớp trước khi tăng bộ đếm.
 * Cách khác: DP trên thứ tự topo: level[v] = max(level[u]) + 1.
 * Python/Java: giống ex01.
 */
export function minimumSemesters(n: number, relations: number[][]): number {
  const g = csrOfEdges(n, relations, false, 1);
  const indeg = g.indeg;
  let layer: number[] = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) layer.push(i);
  let done = 0;
  let semesters = 0;
  while (layer.length) {
    semesters++;
    done += layer.length;
    const next: number[] = [];
    for (const u of layer) {
      for (let e = g.head[u]; e < g.head[u + 1]; e++) {
        const v = g.to[e];
        if (--indeg[v] === 0) next.push(v);
      }
    }
    layer = next;
  }
  return done === n ? semesters : -1;
}

// ─── ex06 · eventualSafeNodes ───
/*
 * Ý tưởng: node "an toàn" ⇔ mọi đường từ nó đều dẫn tới node cuối (out-degree 0) ⇔ không đi tới được chu trình. Đảo chiều đồ thị,
 * chạy Kahn bắt đầu từ các node out-degree 0: node nào bị "gỡ" hết cạnh ra thì an toàn.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: không cần đệ quy 3 màu và không bị tràn stack; kết quả duyệt theo chỉ số nên đã tăng dần.
 * Bẫy: quên đảo chiều; trả về không sắp xếp tăng dần.
 * Cách khác: DFS 3 màu (node đen = an toàn), đệ quy dễ tràn stack với đường dài 10⁵.
 * Python/Java: Java trả `List<Integer>`; Python `list[int]`.
 */
export function eventualSafeNodes(graph: number[][]): number[] {
  const n = graph.length;
  let m = 0;
  for (const row of graph) m += row.length;
  const f = new Int32Array(m);
  const t = new Int32Array(m);
  let k = 0;
  for (let u = 0; u < n; u++) {
    for (const v of graph[u]) {
      f[k] = v; // đảo chiều: v ← u
      t[k++] = u;
    }
  }
  const rev = buildCsr(n, f, t);
  // rev.indeg[u] = số cạnh ra của u trong đồ thị gốc = out-degree
  const outdeg = rev.indeg;
  const queue = new Int32Array(n);
  let tail = 0;
  const safe = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (outdeg[i] === 0) queue[tail++] = i;
  for (let h = 0; h < tail; h++) {
    const v = queue[h];
    safe[v] = 1;
    for (let e = rev.head[v]; e < rev.head[v + 1]; e++) {
      const u = rev.to[e];
      if (--outdeg[u] === 0) queue[tail++] = u;
    }
  }
  const out: number[] = [];
  for (let i = 0; i < n; i++) if (safe[i]) out.push(i);
  return out;
}

// ─── ex07 · migrationOrder ───
/*
 * Ý tưởng: Kahn với min-heap theo TÊN (như ex03 nhưng khóa là chuỗi). deps [a, b]: a chạy sau b → cạnh b → a.
 * Độ phức tạp: O((n + m) log n + tổng độ dài tên): Map tên → chỉ số O(1), heap so sánh chuỗi.
 * Vì sao best practice: map tên → id một lần rồi làm việc trên số nguyên; không tra `indexOf` trong vòng lặp (O(n²)).
 * Bẫy: tie "theo tên tăng dần" phải so theo thứ tự đơn vị mã (TS `<`, Python `<`, Java `compareTo` cho ASCII đều khớp);
 * `localeCompare` có thể xếp khác. Có chu trình → [] (không trả thứ tự dở dang).
 * Cách khác: sort tên trước, gán rank, heap trên rank số nguyên (nhanh hơn một chút).
 * Python/Java: Python heap chứa tuple/tên trực tiếp; Java `PriorityQueue<String>` rồi `Map<String,Integer>`.
 */
export function migrationOrder(names: string[], deps: string[][]): string[] {
  const n = names.length;
  const id = new Map<string, number>();
  for (let i = 0; i < n; i++) id.set(names[i], i);
  const f = new Int32Array(deps.length);
  const t = new Int32Array(deps.length);
  for (let i = 0; i < deps.length; i++) {
    f[i] = id.get(deps[i][1])!;
    t[i] = id.get(deps[i][0])!;
  }
  const g = buildCsr(n, f, t);
  const indeg = g.indeg;
  const heap = new Heap<number>((a, b) => names[a] < names[b]);
  for (let i = 0; i < n; i++) if (indeg[i] === 0) heap.push(i);
  const out: string[] = [];
  while (heap.size) {
    const u = heap.pop()!;
    out.push(names[u]);
    for (let e = g.head[u]; e < g.head[u + 1]; e++) {
      const v = g.to[e];
      if (--indeg[v] === 0) heap.push(v);
    }
  }
  return out.length === n ? out : [];
}

// ─── ex08 · minBuildTime ───
/*
 * Ý tưởng: worker không giới hạn → mục tiêu bắt đầu ngay khi mọi phụ thuộc xong: finish[v] = duration[v] + max(finish[u] : u → v).
 * Tính theo thứ tự topo (Kahn), đáp án = max finish = đường dài nhất (trọng số node) trên DAG.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: DP trên thứ tự topo, không đệ quy; `Float64Array` giữ chính xác tới 2⁵³ (tối đa 10⁵ · 10⁹ = 10¹⁴ < 9·10¹⁵).
 * Bẫy: Java phải dùng `long` (10¹⁴ tràn `int`); đáp án là max trên MỌI node, không phải node cuối của thứ tự topo.
 * Cách khác: DFS + memo (cần đệ quy sâu 10⁵ → tràn stack).
 * Python/Java: Python int không tràn; Java `long[] finish`.
 */
export function minBuildTime(n: number, deps: number[][], duration: number[]): number {
  const g = csrOfEdges(n, deps, true); // [a, b]: b trước a
  const indeg = g.indeg;
  const startAt = new Float64Array(n); // thời điểm sớm nhất mọi phụ thuộc xong
  const queue = new Int32Array(n);
  let tail = 0;
  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue[tail++] = i;
  let best = 0;
  for (let h = 0; h < tail; h++) {
    const u = queue[h];
    const fin = startAt[u] + duration[u];
    if (fin > best) best = fin;
    for (let e = g.head[u]; e < g.head[u + 1]; e++) {
      const v = g.to[e];
      if (fin > startAt[v]) startAt[v] = fin;
      if (--indeg[v] === 0) queue[tail++] = v;
    }
  }
  return best;
}
