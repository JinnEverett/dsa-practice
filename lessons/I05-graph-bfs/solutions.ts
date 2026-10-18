// I05 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── helper: danh sách kề dạng CSR (mảng phẳng) — nhanh hơn number[][] khi n, m lớn ───
// start[u]..start[u+1]-1 là chỉ số trong `to` của các hàng xóm của u.
function buildCsr(n: number, edges: number[][], directed = false): { start: Int32Array; to: Int32Array } {
  const start = new Int32Array(n + 2);
  for (const [a, b] of edges) {
    start[a + 2]++;
    if (!directed) start[b + 2]++;
  }
  for (let i = 2; i <= n + 1; i++) start[i] += start[i - 1];
  const to = new Int32Array(directed ? edges.length : edges.length * 2);
  for (const [a, b] of edges) {
    to[start[a + 1]++] = b;
    if (!directed) to[start[b + 1]++] = a;
  }
  return { start, to }; // sau vòng điền, start[u]..start[u+1] là đoạn của u
}

/**
 * ex01 · shortestPath
 * Ý tưởng: BFS từ src; dist[v] = số cạnh ít nhất. Đánh dấu "đã thăm" ngay khi ENQUEUE.
 * Độ phức tạp: O(n + m) thời gian, O(n + m) bộ nhớ.
 * Vì sao best practice: queue là Int32Array kích thước n (mỗi đỉnh vào hàng đợi đúng 1 lần) → không
 *   cần shift() O(n), không cấp phát object. CSR tránh n mảng con.
 * Bẫy: dựng danh sách kề bằng cách quét toàn bộ `edges` cho từng đỉnh → O(n·m). Đánh dấu khi DEQUEUE → một
 *   đỉnh vào hàng đợi nhiều lần.
 * Cách khác: danh sách kề `number[][]` (dễ viết hơn, chậm hơn ~2×).
 * Python/Java: Python `collections.deque` (popleft O(1)), KHÔNG dùng list.pop(0); Java `ArrayDeque<Integer>`
 *   hoặc mảng int[] + head/tail như ở đây.
 */
export function shortestPath(n: number, edges: number[][], src: number, dst: number): number {
  if (src === dst) return 0;
  const { start, to } = buildCsr(n, edges);
  const dist = new Int32Array(n).fill(-1);
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  dist[src] = 0;
  q[tail++] = src;
  while (head < tail) {
    const u = q[head++];
    for (let i = start[u]; i < start[u + 1]; i++) {
      const v = to[i];
      if (dist[v] !== -1) continue;
      dist[v] = dist[u] + 1;
      if (v === dst) return dist[v];
      q[tail++] = v;
    }
  }
  return -1;
}

/**
 * ex02 · numIslands
 * Ý tưởng: duyệt từng ô; gặp '1' chưa thăm thì +1 đảo và BFS "nhuộm" cả đảo (đổi thành đã thăm).
 * Độ phức tạp: O(R·C) thời gian và bộ nhớ.
 * Vì sao best practice: lưới là đồ thị ẩn — không dựng danh sách kề, chỉ dùng mảng 4 hướng.
 * Bẫy: `String[]` bất biến → dùng mảng `Uint8Array` phẳng làm `seen`, không sửa input.
 * Cách khác: DFS (xem I06, dễ tràn stack với lưới lớn), Union-Find (I08).
 * Python/Java: Python str bất biến → `seen = [[False]*C for _ in range(R)]`; Java `grid[i].charAt(j)`.
 */
export function numIslands(grid: string[]): number {
  const R = grid.length;
  if (R === 0) return 0;
  const C = grid[0].length;
  const seen = new Uint8Array(R * C);
  const q = new Int32Array(R * C);
  let count = 0;
  for (let s = 0; s < R * C; s++) {
    if (seen[s] || grid[(s / C) | 0][s % C] !== '1') continue;
    count++;
    let head = 0;
    let tail = 0;
    seen[s] = 1;
    q[tail++] = s;
    while (head < tail) {
      const cur = q[head++];
      const r = (cur / C) | 0;
      const c = cur % C;
      if (r > 0 && !seen[cur - C] && grid[r - 1][c] === '1') (seen[cur - C] = 1), (q[tail++] = cur - C);
      if (r < R - 1 && !seen[cur + C] && grid[r + 1][c] === '1') (seen[cur + C] = 1), (q[tail++] = cur + C);
      if (c > 0 && !seen[cur - 1] && grid[r][c - 1] === '1') (seen[cur - 1] = 1), (q[tail++] = cur - 1);
      if (c < C - 1 && !seen[cur + 1] && grid[r][c + 1] === '1') (seen[cur + 1] = 1), (q[tail++] = cur + 1);
    }
  }
  return count;
}

/**
 * ex03 · orangesRotting
 * Ý tưởng: multi-source BFS — đưa MỌI quả cam thối vào hàng đợi ở "phút 0", mỗi vòng BFS theo tầng = 1 phút.
 * Độ phức tạp: O(R·C).
 * Vì sao best practice: một lần BFS thay vì BFS từ từng nguồn (O(nguồn × R·C)).
 * Bẫy: đếm số phút đúng (tầng cuối không lan thêm thì không +1); còn cam tươi sau BFS → −1;
 *   không có cam tươi nào → 0 (kể cả không có cam thối).
 * Cách khác: lưu phút trong hàng đợi (cặp) thay vì chạy theo tầng.
 * Python/Java: Python `deque` + `for _ in range(len(q))`; Java dùng `int size = q.size()` trước vòng for.
 */
export function orangesRotting(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0].length;
  const g = new Int8Array(R * C);
  const q = new Int32Array(R * C);
  let head = 0;
  let tail = 0;
  let fresh = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      g[r * C + c] = grid[r][c];
      if (grid[r][c] === 1) fresh++;
      else if (grid[r][c] === 2) q[tail++] = r * C + c;
    }
  let minutes = 0;
  while (head < tail && fresh > 0) {
    const levelEnd = tail;
    while (head < levelEnd) {
      const cur = q[head++];
      const r = (cur / C) | 0;
      const c = cur % C;
      if (r > 0 && g[cur - C] === 1) (g[cur - C] = 2), fresh--, (q[tail++] = cur - C);
      if (r < R - 1 && g[cur + C] === 1) (g[cur + C] = 2), fresh--, (q[tail++] = cur + C);
      if (c > 0 && g[cur - 1] === 1) (g[cur - 1] = 2), fresh--, (q[tail++] = cur - 1);
      if (c < C - 1 && g[cur + 1] === 1) (g[cur + 1] = 2), fresh--, (q[tail++] = cur + 1);
    }
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}

/**
 * ex04 · shortestPathBinaryMatrix
 * Ý tưởng: BFS 8 hướng từ (0,0) trên các ô 0; độ dài đường = số ô (dist bắt đầu bằng 1).
 * Độ phức tạp: O(N²) với lưới N×N.
 * Vì sao best practice: kiểm tra ô đầu/cuối bị chặn trước; dùng chính lưới copy làm `seen`.
 * Bẫy: lưới 1×1 chứa 0 → đáp án 1; chứa 1 → −1. Quên 4 hướng chéo.
 * Cách khác: A* (không cần ở đây).
 * Python/Java: dùng mảng `dirs` 8 cặp (dr, dc).
 */
export function shortestPathBinaryMatrix(grid: number[][]): number {
  const N = grid.length;
  if (grid[0][0] === 1 || grid[N - 1][N - 1] === 1) return -1;
  const dist = new Int32Array(N * N);
  const q = new Int32Array(N * N);
  let head = 0;
  let tail = 0;
  dist[0] = 1;
  q[tail++] = 0;
  while (head < tail) {
    const cur = q[head++];
    const r = (cur / N) | 0;
    const c = cur % N;
    if (r === N - 1 && c === N - 1) return dist[cur];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= N || nc >= N) continue;
        const nx = nr * N + nc;
        if (grid[nr][nc] === 1 || dist[nx] !== 0) continue;
        dist[nx] = dist[cur] + 1;
        q[tail++] = nx;
      }
  }
  return -1;
}

/**
 * ex05 · updateMatrix
 * Ý tưởng: multi-source BFS từ MỌI ô 0 (dist = 0); ô 1 nhận dist khi được lan tới lần đầu.
 * Độ phức tạp: O(R·C). (Bản ngây thơ: BFS từ mỗi ô 1 → O((R·C)²).)
 * Vì sao best practice: đảo chiều bài toán — thay vì hỏi "từ mỗi ô 1 tới 0 gần nhất", hỏi
 *   "từ tất cả ô 0 lan ra". Mẹo chung cho "khoảng cách tới tập đích gần nhất".
 * Bẫy: khởi tạo dist ô 1 là −1 (chưa thăm), không phải 0.
 * Cách khác: DP hai lượt quét (trái-trên rồi phải-dưới) cũng O(R·C), nhưng chỉ đúng cho hướng 4 và lưới.
 * Python/Java: tương tự; Java trả `int[][]` mới.
 */
export function updateMatrix(mat: number[][]): number[][] {
  const R = mat.length;
  const C = mat[0].length;
  const dist = new Int32Array(R * C).fill(-1);
  const q = new Int32Array(R * C);
  let head = 0;
  let tail = 0;
  for (let i = 0; i < R * C; i++)
    if (mat[(i / C) | 0][i % C] === 0) {
      dist[i] = 0;
      q[tail++] = i;
    }
  while (head < tail) {
    const cur = q[head++];
    const r = (cur / C) | 0;
    const c = cur % C;
    if (r > 0 && dist[cur - C] < 0) (dist[cur - C] = dist[cur] + 1), (q[tail++] = cur - C);
    if (r < R - 1 && dist[cur + C] < 0) (dist[cur + C] = dist[cur] + 1), (q[tail++] = cur + C);
    if (c > 0 && dist[cur - 1] < 0) (dist[cur - 1] = dist[cur] + 1), (q[tail++] = cur - 1);
    if (c < C - 1 && dist[cur + 1] < 0) (dist[cur + 1] = dist[cur] + 1), (q[tail++] = cur + 1);
  }
  return Array.from({ length: R }, (_, r) => Array.from(dist.subarray(r * C, (r + 1) * C)));
}

/**
 * ex06 · openLock
 * Ý tưởng: trạng thái = số 0..9999; mỗi trạng thái có 8 láng giềng (4 bánh × ±1 vòng). BFS từ 0.
 * Độ phức tạp: O(10⁴ · 8).
 * Vì sao best practice: biểu diễn trạng thái bằng số nguyên, deadends + visited chung một Uint8Array.
 * Bẫy: "0000" nằm trong deadends → −1; target === "0000" → 0 (nếu không bị chặn).
 * Cách khác: BFS hai đầu (bidirectional) cắt còn ~√ số trạng thái duyệt.
 * Python/Java: dùng `set`/`boolean[10000]`; xoay bánh: `(d + 1) % 10`, `(d + 9) % 10`.
 */
export function openLock(deadends: string[], target: string): number {
  const blocked = new Uint8Array(10000);
  for (const d of deadends) blocked[+d] = 1;
  const goal = +target;
  if (blocked[0]) return -1;
  if (goal === 0) return 0;
  const dist = new Int32Array(10000).fill(-1);
  const q = new Int32Array(10000);
  let head = 0;
  let tail = 0;
  dist[0] = 0;
  q[tail++] = 0;
  const pow = [1, 10, 100, 1000];
  while (head < tail) {
    const cur = q[head++];
    for (const p of pow) {
      const digit = ((cur / p) | 0) % 10;
      for (const delta of [1, 9]) {
        const nx = cur - digit * p + ((digit + delta) % 10) * p;
        if (blocked[nx] || dist[nx] !== -1) continue;
        dist[nx] = dist[cur] + 1;
        if (nx === goal) return dist[nx];
        q[tail++] = nx;
      }
    }
  }
  return -1;
}

/**
 * ex07 · ladderLength
 * Ý tưởng: đỉnh = từ; hai từ nối nhau nếu khác đúng 1 ký tự. Để tìm hàng xóm nhanh, gom theo "mẫu"
 *   (hit → *it, h*t, hi*): mọi từ chung mẫu là hàng xóm. BFS từ beginWord.
 * Độ phức tạp: O(N · L²) (mỗi từ sinh L mẫu, mỗi mẫu dài L). So với so sánh từng cặp O(N² · L).
 * Vì sao best practice: không bao giờ duyệt cặp từ; xóa mẫu khỏi map sau khi dùng để mỗi mẫu chỉ mở một lần.
 * Bẫy: endWord không có trong wordList → 0. Kết quả đếm SỐ TỪ trong dãy (cả begin và end).
 * Cách khác: BFS hai đầu; thử đổi từng ký tự a–z (O(N · L · 26)).
 * Python/Java: Python `defaultdict(list)`; Java `Map<String, List<String>>`.
 */
export function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  const buckets = new Map<string, string[]>();
  const add = (w: string) => {
    for (let i = 0; i < w.length; i++) {
      const key = w.slice(0, i) + '*' + w.slice(i + 1);
      const b = buckets.get(key);
      if (b) b.push(w);
      else buckets.set(key, [w]);
    }
  };
  for (const w of words) add(w);
  const seen = new Set<string>([beginWord]);
  let level = [beginWord];
  let steps = 1;
  while (level.length) {
    const next: string[] = [];
    for (const w of level) {
      if (w === endWord) return steps;
      for (let i = 0; i < w.length; i++) {
        const key = w.slice(0, i) + '*' + w.slice(i + 1);
        const b = buckets.get(key);
        if (!b) continue;
        for (const x of b) if (!seen.has(x)) (seen.add(x), next.push(x));
        buckets.delete(key); // mẫu này đã mở rồi
      }
    }
    level = next;
    steps++;
  }
  return 0;
}

/**
 * ex08 · shortestPathNodes
 * Ý tưởng: BFS ghi parent[v] = u lúc enqueue; từ dst lần ngược parent tới src rồi đảo.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: parent kiêm luôn vai trò "đã thăm" (−1 = chưa); không lưu cả đường trong hàng đợi (O(n²) bộ nhớ).
 * Bẫy: src === dst → [src]; không tới được → [].
 * Cách khác: lưu dist rồi lần ngược theo hàng xóm có dist nhỏ hơn 1.
 * Python/Java: dựng list ngược rồi `reverse()`.
 */
export function shortestPathNodes(n: number, edges: number[][], src: number, dst: number): number[] {
  const { start, to } = buildCsr(n, edges);
  const parent = new Int32Array(n).fill(-1);
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  parent[src] = src;
  q[tail++] = src;
  while (head < tail && parent[dst] === -1) {
    const u = q[head++];
    for (let i = start[u]; i < start[u + 1]; i++) {
      const v = to[i];
      if (parent[v] !== -1) continue;
      parent[v] = u;
      q[tail++] = v;
    }
  }
  if (parent[dst] === -1) return [];
  const path: number[] = [];
  for (let v = dst; v !== src; v = parent[v]) path.push(v);
  path.push(src);
  return path.reverse();
}

/**
 * ex09 · nearestWarehouse
 * Ý tưởng: multi-source BFS từ tất cả kho (dist 0); dist[v] = số đoạn đường tới kho gần nhất.
 * Độ phức tạp: O(n + m) — thay vì chạy BFS từ mỗi điểm.
 * Vì sao best practice: cùng mẹo "đảo chiều" như ex05, áp lên đồ thị tổng quát.
 * Bẫy: điểm không có đường tới kho nào → −1 (dist khởi tạo −1 chính là đáp án).
 * Cách khác: thêm đỉnh ảo nối mọi kho (trọng số 0) — cần 0-1 BFS, phức tạp hơn.
 * Python/Java: tương tự; Java trả `int[]`.
 */
export function nearestWarehouse(n: number, roads: number[][], warehouses: number[]): number[] {
  const { start, to } = buildCsr(n, roads);
  const dist = new Int32Array(n).fill(-1);
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (const w of warehouses) {
    dist[w] = 0;
    q[tail++] = w;
  }
  while (head < tail) {
    const u = q[head++];
    for (let i = start[u]; i < start[u + 1]; i++) {
      const v = to[i];
      if (dist[v] !== -1) continue;
      dist[v] = dist[u] + 1;
      q[tail++] = v;
    }
  }
  return Array.from(dist);
}

/**
 * ex10 · shortestPathWithBreaks
 * Ý tưởng: BFS trên KHÔNG GIAN TRẠNG THÁI (r, c, số lần phá còn lại). Đi vào ô vật cản tốn 1 lần phá.
 * Độ phức tạp: O(R·C·k) trạng thái, mỗi trạng thái 4 láng giềng.
 * Vì sao best practice: visited theo (ô, k còn lại) chứ không theo ô — tới cùng ô với nhiều lần phá hơn là
 *   trạng thái KHÁC (và tốt hơn). Mẹo cắt: nếu k ≥ R + C − 2 thì đáp án là R + C − 2 (đường Manhattan).
 * Bẫy: visited chỉ theo ô → sai; trả về ngay khi pop (muộn hơn) vẫn đúng nhưng chậm hơn khi enqueue.
 * Cách khác: lưu "số lần phá ít nhất để tới ô" (best[r][c]) và chỉ enqueue khi tới ô đó với ít lần phá hơn trước.
 * Python/Java: Python dùng tuple `(r, c, k)` trong `set`; Java mã hóa `(r*C + c)*(k+1) + rem` thành int.
 */
export function shortestPathWithBreaks(grid: number[][], k: number): number {
  const R = grid.length;
  const C = grid[0].length;
  if (R === 1 && C === 1) return 0;
  if (k >= R + C - 2) return R + C - 2;
  const K = k + 1;
  const seen = new Uint8Array(R * C * K);
  const q = new Int32Array(R * C * K);
  let head = 0;
  let tail = 0;
  q[tail++] = k; // ô (0,0) với k lần phá còn lại
  seen[k] = 1;
  let steps = 0;
  const DR = [1, -1, 0, 0];
  const DC = [0, 0, 1, -1];
  while (head < tail) {
    steps++;
    const levelEnd = tail;
    while (head < levelEnd) {
      const cur = q[head++];
      const rem = cur % K;
      const cell = (cur / K) | 0;
      const r = (cell / C) | 0;
      const c = cell % C;
      for (let d = 0; d < 4; d++) {
        const nr = r + DR[d];
        const nc = c + DC[d];
        if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
        const nrem = rem - grid[nr][nc];
        if (nrem < 0) continue;
        if (nr === R - 1 && nc === C - 1) return steps;
        const state = (nr * C + nc) * K + nrem;
        if (seen[state]) continue;
        seen[state] = 1;
        q[tail++] = state;
      }
    }
  }
  return -1;
}
