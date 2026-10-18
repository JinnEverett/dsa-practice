// A07 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── DSU tối giản (chép từ I08 vì module này không phụ thuộc nhóm khác) ───
class DSU {
  private p: Int32Array;
  constructor(n: number) {
    this.p = new Int32Array(n);
    for (let i = 0; i < n; i++) this.p[i] = i;
  }
  find(x: number): number {
    while (this.p[x] !== x) {
      this.p[x] = this.p[this.p[x]]; // path halving
      x = this.p[x];
    }
    return x;
  }
  union(a: number, b: number): boolean {
    a = this.find(a);
    b = this.find(b);
    if (a === b) return false;
    this.p[a] = b;
    return true;
  }
}

/** Danh sách kề CSR-lite. Cạnh thứ e: to[e]; cạnh kế cùng nguồn: next[e]; id gốc của cạnh: eid[e]. */
function buildAdj(n: number, pairs: number[][], undirected: boolean, ws?: number[]) {
  const m = pairs.length * (undirected ? 2 : 1);
  const head = new Int32Array(n).fill(-1);
  const next = new Int32Array(m);
  const to = new Int32Array(m);
  const eid = new Int32Array(m);
  const w = new Float64Array(m);
  let c = 0;
  const add = (u: number, v: number, id: number) => {
    to[c] = v;
    eid[c] = id;
    w[c] = ws ? ws[id] : 1;
    next[c] = head[u];
    head[u] = c++;
  };
  pairs.forEach(([u, v], id) => {
    add(u, v, id);
    if (undirected) add(v, u, id);
  });
  return { head, next, to, eid, w };
}

// ─── ex01 · MST bằng Kruskal ───
// Ý tưởng: sort cạnh tăng dần theo trọng số, dùng DSU nối hai thành phần; đủ n−1 cạnh thì xong, thiếu ⇒ không liên thông ⇒ −1.
// Độ phức tạp: O(m log m) time · O(n + m) space.
// Bẫy: tổng tới 10⁵ · 10⁹ = 10¹⁴ ⇒ Java `long`; so sánh Integer.compare. Python: edges.sort(key=...).
export function mstWeight(n: number, edges: number[][]): number {
  const sorted = edges.slice().sort((a, b) => a[2] - b[2]);
  const dsu = new DSU(n);
  let total = 0;
  let used = 0;
  for (const [u, v, w] of sorted) {
    if (dsu.union(u, v)) {
      total += w;
      if (++used === n - 1) break;
    }
  }
  return used === n - 1 ? total : -1;
}

// ─── ex02 · Nối các điểm với chi phí Manhattan nhỏ nhất ───
// Ý tưởng: đồ thị đầy đủ ⇒ Prim O(n²) không cần dựng cạnh: minD[v] = khoảng cách nhỏ nhất từ cây tới v; mỗi bước lấy v chưa vào cây có minD nhỏ nhất, cập nhật các đỉnh còn lại.
// Độ phức tạp: O(n²) time · O(n) space. Kruskal phải dựng và sort n²/2 = 2·10⁶ cạnh ⇒ chậm hơn nhiều lần ở n = 2000.
// Bẫy: tổng tới ~4·10⁹ ⇒ Java `long` (mỗi khoảng cách vừa int).
export function minCostConnectPoints(points: number[][]): number {
  const n = points.length;
  const minD = new Float64Array(n).fill(Infinity);
  const inTree = new Uint8Array(n);
  minD[0] = 0;
  let total = 0;
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!inTree[v] && (u === -1 || minD[v] < minD[u])) u = v;
    inTree[u] = 1;
    total += minD[u];
    const [ux, uy] = points[u];
    for (let v = 0; v < n; v++) {
      if (inTree[v]) continue;
      const d = Math.abs(ux - points[v][0]) + Math.abs(uy - points[v][1]);
      if (d < minD[v]) minD[v] = d;
    }
  }
  return total;
}

// ─── ex03 · Cầu (critical connections) ───
// Ý tưởng: Tarjan: disc/low; cạnh cha→con (u, v) là cầu khi low[v] > disc[u]. Bỏ qua cạnh cha theo id cạnh.
// Độ phức tạp: O(n + m) time · O(n + m) space; đệ quy sâu ≤ n ≤ 5000.
// Đầu ra chuẩn hóa: mỗi cầu [min, max], danh sách sắp tăng theo (u, v).
export function criticalConnections(n: number, connections: number[][]): number[][] {
  const g = buildAdj(n, connections, true);
  const disc = new Int32Array(n).fill(-1);
  const low = new Int32Array(n);
  let timer = 0;
  const out: number[][] = [];
  const dfs = (u: number, parentEdge: number) => {
    disc[u] = low[u] = timer++;
    for (let e = g.head[u]; e !== -1; e = g.next[e]) {
      if (g.eid[e] === parentEdge) continue;
      const v = g.to[e];
      if (disc[v] === -1) {
        dfs(v, g.eid[e]);
        if (low[v] < low[u]) low[u] = low[v];
        if (low[v] > disc[u]) out.push([Math.min(u, v), Math.max(u, v)]);
      } else if (disc[v] < low[u]) low[u] = disc[v];
    }
  };
  for (let s = 0; s < n; s++) if (disc[s] === -1) dfs(s, -1);
  return out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

// ─── ex04 · Điểm khớp ───
// Ý tưởng: cùng Tarjan; u không phải gốc là khớp nếu có con v với low[v] ≥ disc[u]; gốc là khớp nếu có ≥ 2 con DFS.
// Độ phức tạp: O(n + m) time · O(n + m) space.
export function articulationPoints(n: number, edges: number[][]): number[] {
  const g = buildAdj(n, edges, true);
  const disc = new Int32Array(n).fill(-1);
  const low = new Int32Array(n);
  const isAP = new Uint8Array(n);
  let timer = 0;
  const dfs = (u: number, parentEdge: number, isRoot: boolean) => {
    disc[u] = low[u] = timer++;
    let children = 0;
    for (let e = g.head[u]; e !== -1; e = g.next[e]) {
      if (g.eid[e] === parentEdge) continue;
      const v = g.to[e];
      if (disc[v] === -1) {
        children++;
        dfs(v, g.eid[e], false);
        if (low[v] < low[u]) low[u] = low[v];
        if (!isRoot && low[v] >= disc[u]) isAP[u] = 1;
      } else if (disc[v] < low[u]) low[u] = disc[v];
    }
    if (isRoot && children >= 2) isAP[u] = 1;
  };
  for (let s = 0; s < n; s++) if (disc[s] === -1) dfs(s, -1, true);
  const out: number[] = [];
  for (let i = 0; i < n; i++) if (isAP[i]) out.push(i);
  return out;
}

/** Tarjan SCC: trả về mảng comp[v] (0..k-1) và k. Đệ quy sâu ≤ n. */
function scc(n: number, edges: number[][]): { comp: Int32Array; k: number } {
  const g = buildAdj(n, edges, false);
  const disc = new Int32Array(n).fill(-1);
  const low = new Int32Array(n);
  const comp = new Int32Array(n).fill(-1);
  const stack: number[] = [];
  let timer = 0;
  let k = 0;
  const dfs = (u: number) => {
    disc[u] = low[u] = timer++;
    stack.push(u);
    for (let e = g.head[u]; e !== -1; e = g.next[e]) {
      const v = g.to[e];
      if (disc[v] === -1) {
        dfs(v);
        if (low[v] < low[u]) low[u] = low[v];
      } else if (comp[v] === -1 && disc[v] < low[u]) low[u] = disc[v]; // v còn trên stack
    }
    if (low[u] === disc[u]) {
      for (;;) {
        const x = stack.pop()!;
        comp[x] = k;
        if (x === u) break;
      }
      k++;
    }
  };
  for (let s = 0; s < n; s++) if (disc[s] === -1) dfs(s);
  return { comp, k };
}

// ─── ex05 · Đếm SCC ───
// Ý tưởng: Tarjan; mỗi lần low[u] == disc[u] là xong một SCC. (Kosaraju: DFS lấy thứ tự kết thúc, rồi DFS trên đồ thị đảo.)
// Độ phức tạp: O(n + m) time · O(n + m) space.
export function countSCC(n: number, edges: number[][]): number {
  return scc(n, edges).k;
}

// ─── ex06 · Lịch trình bay (Euler path nhỏ nhất theo từ điển) ───
// Ý tưởng: Hierholzer lặp. Với mỗi sân bay, sắp các điểm đến GIẢM dần để pop() lấy nhỏ nhất; bế tắc thì ghi sân bay vào kết quả, cuối cùng đảo ngược.
// Độ phức tạp: O(m log m) time (sort) · O(m) space. Đệ quy sâu m tầng không an toàn ⇒ dùng stack tường minh.
// Bẫy: so sánh chuỗi mặc định của JS theo UTF-16 — với tên 3 chữ HOA là đủ; Java `compareTo`.
export function findItinerary(tickets: string[][]): string[] {
  const adj = new Map<string, string[]>();
  for (const [a, b] of tickets) {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push(b);
  }
  for (const list of adj.values()) list.sort((x, y) => (x < y ? 1 : x > y ? -1 : 0));
  const stack = ['JFK'];
  const out: string[] = [];
  while (stack.length) {
    const u = stack[stack.length - 1];
    const list = adj.get(u);
    if (list && list.length) stack.push(list.pop()!);
    else out.push(stack.pop()!);
  }
  return out.reverse();
}

// ─── ex07 · 🔴 Nối các thành phố bằng đường cáp ───
// Ý tưởng: Prim bằng heap từ thành phố 1 (đồ thị thưa); mỗi bước lấy cạnh nhỏ nhất ra ngoài cây. Số đỉnh đã vào cây < n ⇒ −1.
// Độ phức tạp: O(m log m) time · O(n + m) space. (Kruskal cũng đúng — ở ex01.)
// Bẫy: thành phố đánh số từ 1; tổng ≤ 10⁵ · 10⁹ ⇒ Java long.
export function minimumCost(n: number, connections: number[][]): number {
  const g = buildAdj(n, connections.map(([a, b]) => [a - 1, b - 1]), true, connections.map((c) => c[2]));
  const seen = new Uint8Array(n);
  const pq = new Heap<[number, number]>((a, b) => a[0] < b[0]);
  pq.push([0, 0]);
  let total = 0;
  let cnt = 0;
  while (pq.size && cnt < n) {
    const [d, u] = pq.pop()!;
    if (seen[u]) continue;
    seen[u] = 1;
    total += d;
    cnt++;
    for (let e = g.head[u]; e !== -1; e = g.next[e]) if (!seen[g.to[e]]) pq.push([g.w[e], g.to[e]]);
  }
  return cnt === n ? total : -1;
}

// ─── ex08 · 🔴 Nhóm service phụ thuộc vòng ───
// Ý tưởng: deps [a, b] = a phụ thuộc b (cạnh a→b). SCC kích thước ≥ 2 là một vòng phụ thuộc. Mỗi nhóm tăng dần, các nhóm sắp theo phần tử nhỏ nhất.
// Độ phức tạp: O(n + m + n log n) time · O(n + m) space.
// Bẫy: phụ thuộc vào chính mình (a → a) không tạo nhóm kích thước ≥ 2 (đề loại trừ).
export function circularServiceGroups(n: number, deps: number[][]): number[][] {
  const { comp, k } = scc(n, deps);
  const groups: number[][] = Array.from({ length: k }, () => []);
  for (let v = 0; v < n; v++) groups[comp[v]].push(v); // v tăng dần ⇒ mỗi nhóm đã tăng dần
  return groups.filter((g) => g.length >= 2).sort((a, b) => a[0] - b[0]);
}
