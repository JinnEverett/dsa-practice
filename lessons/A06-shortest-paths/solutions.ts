// A06 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

/** Danh sách kề dạng CSR-lite (head/next) để nhanh và ít cấp phát. Cạnh e: to[e], w[e]; cạnh kế cùng nguồn: next[e]. */
function buildAdj(n: number, edges: number[][], undirected: boolean) {
  const m = edges.length * (undirected ? 2 : 1);
  const head = new Int32Array(n).fill(-1);
  const next = new Int32Array(m);
  const to = new Int32Array(m);
  const w = new Float64Array(m);
  let c = 0;
  const add = (u: number, v: number, x: number) => {
    to[c] = v;
    w[c] = x;
    next[c] = head[u];
    head[u] = c++;
  };
  for (const [u, v, x] of edges) {
    add(u, v, x);
    if (undirected) add(v, u, x);
  }
  return { head, next, to, w };
}

type Item = [number, number]; // [khoảng cách, đỉnh]
const byDist = (a: Item, b: Item) => a[0] < b[0];

/** Dijkstra lazy deletion từ s trên đồ thị đã dựng. Trả về dist (Infinity nếu không tới). */
function dijkstra(n: number, g: ReturnType<typeof buildAdj>, s: number): Float64Array {
  const dist = new Float64Array(n).fill(Infinity);
  dist[s] = 0;
  const pq = new Heap<Item>(byDist);
  pq.push([0, s]);
  while (pq.size) {
    const [d, u] = pq.pop()!;
    if (d > dist[u]) continue; // bản cũ
    for (let e = g.head[u]; e !== -1; e = g.next[e]) {
      const v = g.to[e];
      const nd = d + g.w[e];
      if (nd < dist[v]) {
        dist[v] = nd;
        pq.push([nd, v]);
      }
    }
  }
  return dist;
}

// ─── ex01 · Thời gian lan truyền tín hiệu ───
// Ý tưởng: Dijkstra từ k (đỉnh đánh số 1..n, có hướng); đáp án = max dist, có đỉnh không tới được ⇒ -1.
// Độ phức tạp: O((n + m) log n) time · O(n + m) space. Quét mảng tìm min cho mỗi bước là O(n²) = 10¹⁰ ở n = 10⁵.
// Bẫy: đánh số từ 1 (trừ 1 khi đổi sang chỉ số mảng). Python: heapq; Java: PriorityQueue<int[]> với Integer.compare.
export function networkDelayTime(times: number[][], n: number, k: number): number {
  const g = buildAdj(n, times.map(([u, v, w]) => [u - 1, v - 1, w]), false);
  const dist = dijkstra(n, g, k - 1);
  let ans = 0;
  for (let i = 0; i < n; i++) {
    if (dist[i] === Infinity) return -1;
    if (dist[i] > ans) ans = dist[i];
  }
  return ans;
}

// ─── ex02 · Vé máy bay rẻ nhất với ≤ k điểm dừng ───
// Ý tưởng: tối đa k điểm dừng ⇒ tối đa k+1 chuyến bay ⇒ Bellman-Ford đúng k+1 vòng, mỗi vòng dùng bản sao dist của vòng trước.
// Độ phức tạp: O(k · m) time · O(n) space. Dijkstra thường sai vì "rẻ nhất" tới một đỉnh chưa chắc còn đủ lượt dừng — cần trạng thái (đỉnh, số chặng).
// Bẫy: quên bản sao ⇒ một vòng đi nhiều chặng. Giá tối đa ≤ 10⁴ · 1001 vừa int.
export function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
  let dist = new Float64Array(n).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i <= k; i++) {
    const next = dist.slice();
    for (const [u, v, w] of flights) if (dist[u] + w < next[v]) next[v] = dist[u] + w;
    dist = next;
  }
  return dist[dst] === Infinity ? -1 : dist[dst];
}

// ─── ex03 · Đường đi tốn sức ít nhất ───
// Ý tưởng: minimax Dijkstra: effort(v) = max(effort(u), |h[u] − h[v]|); heap theo effort. Lấy đích ra khỏi heap là xong.
// Độ phức tạp: O(RC log RC) time · O(RC) space.
// Cách khác: binary search ngưỡng + BFS (A10), hoặc DSU thêm cạnh tăng dần.
export function minimumEffortPath(heights: number[][]): number {
  const R = heights.length;
  const C = heights[0].length;
  const best = new Float64Array(R * C).fill(Infinity);
  best[0] = 0;
  const pq = new Heap<Item>(byDist);
  pq.push([0, 0]);
  const DR = [1, -1, 0, 0];
  const DC = [0, 0, 1, -1];
  while (pq.size) {
    const [d, id] = pq.pop()!;
    if (d > best[id]) continue;
    const r = (id / C) | 0;
    const c = id % C;
    if (r === R - 1 && c === C - 1) return d;
    for (let t = 0; t < 4; t++) {
      const nr = r + DR[t];
      const nc = c + DC[t];
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
      const nd = Math.max(d, Math.abs(heights[nr][nc] - heights[r][c]));
      if (nd < best[nr * C + nc]) {
        best[nr * C + nc] = nd;
        pq.push([nd, nr * C + nc]);
      }
    }
  }
  return 0;
}

// ─── ex04 · Sửa mũi tên với chi phí tối thiểu (0-1 BFS) ───
// Ý tưởng: đi theo mũi tên tốn 0, đổi sang hướng khác tốn 1 ⇒ 0-1 BFS: cạnh 0 pushFront, cạnh 1 pushBack. Deque là mảng 2 đầu, đặt head giữa mảng.
// Độ phức tạp: O(R·C) time · O(R·C) space. Dijkstra cũng đúng nhưng thêm log.
// Python: collections.deque; Java: ArrayDeque.
export function minCostGrid(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0].length;
  const N = R * C;
  const dist = new Int32Array(N).fill(1 << 30);
  dist[0] = 0;
  const dq = new Int32Array(8 * N + 4);
  let head = 4 * N + 2;
  let tail = head; // [head, tail)
  dq[tail++] = 0;
  const DR = [0, 0, 1, -1]; // mũi tên 1: phải, 2: trái, 3: xuống, 4: lên
  const DC = [1, -1, 0, 0];
  while (head < tail) {
    const id = dq[head++];
    const r = (id / C) | 0;
    const c = id % C;
    const d = dist[id];
    for (let t = 0; t < 4; t++) {
      const nr = r + DR[t];
      const nc = c + DC[t];
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
      const w = grid[r][c] === t + 1 ? 0 : 1;
      const ni = nr * C + nc;
      if (d + w < dist[ni]) {
        dist[ni] = d + w;
        if (w === 0) dq[--head] = ni;
        else dq[tail++] = ni;
      }
    }
  }
  return dist[N - 1];
}

// ─── ex05 · Có chu trình âm không ───
// Ý tưởng: Bellman-Ford với dist = 0 cho MỌI đỉnh (nguồn ảo) ⇒ bắt được chu trình âm ở bất kỳ thành phần liên thông nào.
//   Chạy tối đa n vòng; nếu vòng thứ n vẫn cải thiện ⇒ có chu trình âm; một vòng không đổi ⇒ dừng sớm (không có).
// Độ phức tạp: O(n · m) time · O(n) space.
export function hasNegativeCycle(n: number, edges: number[][]): boolean {
  const dist = new Float64Array(n);
  for (let round = 0; round < n; round++) {
    let changed = false;
    for (const [u, v, w] of edges)
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    if (!changed) return false;
  }
  return true;
}

// ─── ex06 · Thành phố ít láng giềng nhất (Floyd-Warshall) ───
// Ý tưởng: Floyd-Warshall tính mọi cặp (vô hướng); đếm số thành phố có dist ≤ threshold (không tính chính nó); chọn ít nhất, hòa thì chỉ số LỚN hơn.
// Độ phức tạp: O(n³) time · O(n²) space. n ≤ 100 ⇒ 10⁶ phép.
export function findTheCity(n: number, edges: number[][], distanceThreshold: number): number {
  const INF = 1e9;
  const d = new Float64Array(n * n).fill(INF);
  for (let i = 0; i < n; i++) d[i * n + i] = 0;
  for (const [u, v, w] of edges) {
    if (w < d[u * n + v]) d[u * n + v] = d[v * n + u] = w;
  }
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++) {
      const dik = d[i * n + k];
      if (dik >= INF) continue;
      for (let j = 0; j < n; j++) if (dik + d[k * n + j] < d[i * n + j]) d[i * n + j] = dik + d[k * n + j];
    }
  let bestCity = -1;
  let bestCnt = Infinity;
  for (let i = 0; i < n; i++) {
    let cnt = 0;
    for (let j = 0; j < n; j++) if (i !== j && d[i * n + j] <= distanceThreshold) cnt++;
    if (cnt <= bestCnt) {
      bestCnt = cnt;
      bestCity = i; // <= ⇒ hòa lấy chỉ số lớn hơn
    }
  }
  return bestCity;
}

// ─── ex07 · 🔴 Phí vận chuyển từ kho ───
// Ý tưởng: Dijkstra từ kho trên đồ thị vô hướng, n, m ≤ 2·10⁵. Không tới được ⇒ -1.
// Độ phức tạp: O((n + m) log n) time · O(n + m) space.
// Bẫy: tổng phí tới 2·10¹⁴ ⇒ Java `long`; Python/TS không tràn (double chính xác tới 2⁵³).
export function shippingCost(n: number, roads: number[][], warehouse: number): number[] {
  const dist = dijkstra(n, buildAdj(n, roads, true), warehouse);
  return Array.from(dist, (d) => (d === Infinity ? -1 : d));
}

// ─── ex08 · 🔴 Bơi qua hồ ngập ───
// Ý tưởng: thời gian ô (r,c) bị ngập = grid[r][c]; đi từ (0,0) tới (n-1,n-1) cần chờ tới max giá trị trên đường ⇒ minimax Dijkstra
//   với chi phí đỉnh: cost(v) = max(cost(u), grid[v]), bắt đầu từ grid[0][0].
// Độ phức tạp: O(n² log n) time · O(n²) space.
export function swimInWater(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0].length;
  const best = new Float64Array(R * C).fill(Infinity);
  best[0] = grid[0][0];
  const pq = new Heap<Item>(byDist);
  pq.push([grid[0][0], 0]);
  const DR = [1, -1, 0, 0];
  const DC = [0, 0, 1, -1];
  while (pq.size) {
    const [d, id] = pq.pop()!;
    if (d > best[id]) continue;
    const r = (id / C) | 0;
    const c = id % C;
    if (r === R - 1 && c === C - 1) return d;
    for (let t = 0; t < 4; t++) {
      const nr = r + DR[t];
      const nc = c + DC[t];
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
      const nd = Math.max(d, grid[nr][nc]);
      if (nd < best[nr * C + nc]) {
        best[nr * C + nc] = nd;
        pq.push([nd, nr * C + nc]);
      }
    }
  }
  return 0;
}
