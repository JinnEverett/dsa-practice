// I05 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Quy ước chung: hàng đợi = Int32Array + hai chỉ số head/tail (không dùng Array.shift(), vì O(n) với mảng lớn).
// Mỗi đỉnh vào hàng đợi tối đa MỘT lần vì ta đánh dấu "đã thăm" lúc ENQUEUE, không phải lúc dequeue.

// ─── helper: danh sách kề cho đồ thị vô hướng ───
function buildAdj(n: number, edges: number[][]): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  return adj;
}

// ─── ex01 · Đường ngắn nhất trong đồ thị vô hướng ───
// Ý tưởng: BFS từ src; dist[v] = số cạnh trên đường ngắn nhất. dist = -1 đồng thời làm cờ "chưa thăm".
// Độ phức tạp: O(n + m) time · O(n + m) space.
// Vì sao best practice: BFS cho đường ngắn nhất vì nó duyệt theo từng tầng khoảng cách (0, 1, 2, ...); dùng Int32Array làm queue tránh O(n) của shift().
// Bẫy: đánh dấu khi dequeue thì một đỉnh bị đẩy nhiều lần (tới O(m) phần tử trong queue); src === dst → 0.
// Cách khác: bidirectional BFS (nhanh hơn nhiều trên đồ thị rộng, cùng Big-O trong worst case).
// Python/Java: Python dùng `collections.deque` (popleft O(1)), KHÔNG dùng list.pop(0); Java dùng `ArrayDeque<Integer>`, hoặc mảng int[] + head/tail như ở đây.
export function shortestPath(n: number, edges: number[][], src: number, dst: number): number {
  const adj = buildAdj(n, edges);
  const dist = new Int32Array(n).fill(-1);
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  dist[src] = 0;
  q[tail++] = src;
  while (head < tail) {
    const u = q[head++];
    if (u === dst) return dist[u];
    for (const v of adj[u]) {
      if (dist[v] < 0) {
        dist[v] = dist[u] + 1;
        q[tail++] = v;
      }
    }
  }
  return -1;
}

// ─── ex02 · Số đảo ───
// Ý tưởng: duyệt từng ô; gặp '1' chưa thăm thì đếm một đảo mới và BFS loang hết đảo đó.
// Độ phức tạp: O(R·C) time · O(R·C) space.
// Vì sao best practice: BFS lặp không lo tràn stack (DFS đệ quy sẽ tràn ở đảo hình rắn 10⁵ ô). Dùng chỉ số phẳng r*C+c thay vì cặp [r, c] để không tạo object.
// Bẫy: kiểm tra biên TRƯỚC khi truy cập ô; đánh dấu lúc enqueue.
// Cách khác: DFS lặp bằng stack, hoặc Union-Find (I08).
// Python/Java: không sửa grid đầu vào nếu đề không cho phép — dùng mảng visited (Python: list[bytearray]; Java: boolean[][] hoặc đổi '1' thành '0' trên bản sao char[][]).
export function numIslands(grid: string[]): number {
  const R = grid.length;
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

// ─── ex03 · Cam thối (multi-source BFS) ───
// Ý tưởng: đẩy TẤT CẢ cam thối vào queue ở "phút 0", rồi BFS theo tầng: mỗi tầng = một phút.
// Độ phức tạp: O(R·C) time · O(R·C) space.
// Vì sao best practice: multi-source BFS chạy một lần cho mọi nguồn; mô phỏng "mỗi phút quét cả lưới" là O(R·C · số phút).
// Bẫy: không còn cam tươi từ đầu → 0 (không phải -1); chỉ tăng số phút khi tầng đó thật sự làm thối thêm cam.
// Cách khác: BFS mang kèm thời gian trong queue (dist[]), cùng độ phức tạp.
// Python/Java: Python `deque` + `for _ in range(len(q))` để xử lý theo tầng; Java `ArrayDeque` + `int size = q.size()`.
export function orangesRotting(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0].length;
  const cur = new Uint8Array(R * C);
  const q = new Int32Array(R * C);
  let head = 0;
  let tail = 0;
  let fresh = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const v = grid[r][c];
      cur[r * C + c] = v;
      if (v === 1) fresh++;
      else if (v === 2) q[tail++] = r * C + c;
    }
  }
  let minutes = 0;
  while (head < tail && fresh > 0) {
    const levelEnd = tail; // ranh giới của tầng hiện tại
    while (head < levelEnd) {
      const u = q[head++];
      const r = (u / C) | 0;
      const c = u % C;
      if (r > 0 && cur[u - C] === 1) (cur[u - C] = 2), fresh--, (q[tail++] = u - C);
      if (r < R - 1 && cur[u + C] === 1) (cur[u + C] = 2), fresh--, (q[tail++] = u + C);
      if (c > 0 && cur[u - 1] === 1) (cur[u - 1] = 2), fresh--, (q[tail++] = u - 1);
      if (c < C - 1 && cur[u + 1] === 1) (cur[u + 1] = 2), fresh--, (q[tail++] = u + 1);
    }
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}

// ─── ex04 · Đường ngắn nhất trong ma trận nhị phân (8 hướng) ───
// Ý tưởng: BFS trên lưới với 8 vector hướng; dist tính theo SỐ Ô (bắt đầu = 1).
// Độ phức tạp: O(n²) time · O(n²) space (n = cạnh lưới).
// Vì sao best practice: bảng dr/dc gom 8 hướng vào một vòng lặp; đánh dấu bằng dist.
// Bẫy: ô đầu hoặc ô cuối là 1 → -1; lưới 1×1 chứa 0 → 1 (không phải 0).
// Cách khác: A* với heuristic Chebyshev — nhanh hơn trong thực tế, cùng worst case.
// Python/Java: dùng `DIRS = [(-1,-1), ...]` / `int[][] DIRS`; Python tránh tạo tuple mới mỗi bước nếu cần tốc độ.
export function shortestPathBinaryMatrix(grid: number[][]): number {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;
  const dist = new Int32Array(n * n);
  const q = new Int32Array(n * n);
  let head = 0;
  let tail = 0;
  dist[0] = 1;
  q[tail++] = 0;
  const DR = [-1, -1, -1, 0, 0, 1, 1, 1];
  const DC = [-1, 0, 1, -1, 1, -1, 0, 1];
  while (head < tail) {
    const u = q[head++];
    if (u === n * n - 1) return dist[u];
    const r = (u / n) | 0;
    const c = u % n;
    for (let d = 0; d < 8; d++) {
      const nr = r + DR[d];
      const nc = c + DC[d];
      if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] === 1) continue;
      const v = nr * n + nc;
      if (dist[v] === 0) {
        dist[v] = dist[u] + 1;
        q[tail++] = v;
      }
    }
  }
  return -1;
}

// ─── ex05 · Khoảng cách tới số 0 gần nhất ───
// Ý tưởng: multi-source BFS — mọi ô 0 vào queue với dist 0; ô 1 chưa thăm (dist = -1) được gán dist[u] + 1 khi bị loang tới.
// Độ phức tạp: O(R·C) time · O(R·C) space.
// Vì sao best practice: chạy BFS NGƯỢC (từ đích gần nhất) một lần thay vì BFS từ mỗi ô 1 (O((R·C)²)).
// Bẫy: dùng mảng kết quả phẳng rồi mới chuyển thành int[][]; đừng cố sửa `mat` nếu đề cho là input.
// Cách khác: DP hai lượt (trên-trái rồi dưới-phải) cũng O(R·C) — chạy được vì khoảng cách Manhattan; sẽ gặp lại ở DP.
// Python/Java: Python khởi tạo `dist = [[-1]*C for _ in range(R)]` (không dùng `[[-1]*C]*R`); Java `int[][] dist` + `Arrays.fill(row, -1)`.
export function updateMatrix(mat: number[][]): number[][] {
  const R = mat.length;
  const C = mat[0].length;
  const dist = new Int32Array(R * C).fill(-1);
  const q = new Int32Array(R * C);
  let head = 0;
  let tail = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (mat[r][c] === 0) {
        dist[r * C + c] = 0;
        q[tail++] = r * C + c;
      }
  while (head < tail) {
    const u = q[head++];
    const r = (u / C) | 0;
    const c = u % C;
    const d = dist[u] + 1;
    if (r > 0 && dist[u - C] < 0) (dist[u - C] = d), (q[tail++] = u - C);
    if (r < R - 1 && dist[u + C] < 0) (dist[u + C] = d), (q[tail++] = u + C);
    if (c > 0 && dist[u - 1] < 0) (dist[u - 1] = d), (q[tail++] = u - 1);
    if (c < C - 1 && dist[u + 1] < 0) (dist[u + 1] = d), (q[tail++] = u + 1);
  }
  const out: number[][] = new Array(R);
  for (let r = 0; r < R; r++) out[r] = Array.from(dist.subarray(r * C, (r + 1) * C));
  return out;
}

// ─── ex06 · Mở khóa số ───
// Ý tưởng: mỗi trạng thái "0000".."9999" là một đỉnh; 8 láng giềng (mỗi bánh xe ±1 vòng tròn). Deadend = đỉnh bị cấm (coi như đã thăm).
// Độ phức tạp: O(10^4 · 8) time · O(10^4) space — hằng số vì số trạng thái cố định.
// Vì sao best practice: không dựng đồ thị tường minh; sinh láng giềng khi cần. Gộp deadends vào mảng visited.
// Bẫy: "0000" nằm trong deadends → -1 ngay; target === "0000" → 0.
// Cách khác: bidirectional BFS (đã quá nhanh cho bài này).
// Python/Java: Python biểu diễn trạng thái bằng int 0..9999 rồi tách chữ số, hoặc str + slicing; Java dùng `char[]` rồi `new String(...)`, hoặc int.
export function openLock(deadends: string[], target: string): number {
  const seen = new Uint8Array(10000);
  for (const d of deadends) seen[Number(d)] = 1;
  const goal = Number(target);
  if (seen[0]) return -1;
  if (goal === 0) return 0;
  const dist = new Int32Array(10000);
  const q = new Int32Array(10000);
  let head = 0;
  let tail = 0;
  seen[0] = 1;
  q[tail++] = 0;
  const POW = [1, 10, 100, 1000];
  while (head < tail) {
    const u = q[head++];
    for (let w = 0; w < 4; w++) {
      const digit = ((u / POW[w]) | 0) % 10;
      for (const step of [1, 9]) {
        const nd = (digit + step) % 10;
        const v = u + (nd - digit) * POW[w];
        if (seen[v]) continue;
        seen[v] = 1;
        dist[v] = dist[u] + 1;
        if (v === goal) return dist[v];
        q[tail++] = v;
      }
    }
  }
  return -1;
}

// ─── ex07 · Word Ladder ───
// Ý tưởng: hai từ kề nhau nếu khác đúng 1 ký tự. Thay vì so từng cặp (O(N²·L)), gom theo "mẫu" có dấu *: "hot" → "*ot", "h*t", "ho*". Hai từ cùng mẫu là hàng xóm.
// Độ phức tạp: O(N · L²) time (L mẫu, mỗi mẫu dài L) · O(N · L²) space.
// Vì sao best practice: bucket theo mẫu biến bài toán thành BFS trên đồ thị ẩn mà không phải duyệt mọi cặp.
// Bẫy: endWord không có trong wordList → 0; trả về SỐ TỪ trên dãy (kể cả beginWord), không phải số bước; mỗi bucket chỉ nên mở rộng một lần (xóa bucket sau khi dùng) để tránh duyệt lại.
// Cách khác: bidirectional BFS giảm mạnh số trạng thái; hoặc sinh 26·L biến thể và tra Set (tốt khi L nhỏ và bảng chữ cái nhỏ).
// Python/Java: Python `defaultdict(list)` + `deque`; Java `Map<String, List<Integer>>` + `ArrayDeque`; nối chuỗi mẫu tốn O(L) mỗi lần — chấp nhận được với L ≤ 10.
export function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const words = wordList.includes(beginWord) ? wordList : [beginWord, ...wordList];
  const L = beginWord.length;
  const index = new Map<string, number>();
  words.forEach((w, i) => index.set(w, i));
  const goal = index.get(endWord);
  if (goal === undefined) return 0;
  const start = index.get(beginWord)!;
  const buckets = new Map<string, number[]>();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    for (let p = 0; p < L; p++) {
      const key = w.slice(0, p) + '*' + w.slice(p + 1);
      const b = buckets.get(key);
      if (b) b.push(i);
      else buckets.set(key, [i]);
    }
  }
  const dist = new Int32Array(words.length);
  const q = new Int32Array(words.length);
  let head = 0;
  let tail = 0;
  dist[start] = 1;
  q[tail++] = start;
  while (head < tail) {
    const u = q[head++];
    if (u === goal) return dist[u];
    const w = words[u];
    for (let p = 0; p < L; p++) {
      const key = w.slice(0, p) + '*' + w.slice(p + 1);
      const b = buckets.get(key);
      if (!b) continue;
      for (const v of b) {
        if (dist[v] === 0) {
          dist[v] = dist[u] + 1;
          q[tail++] = v;
        }
      }
      buckets.delete(key); // mọi từ trong bucket đã vào queue → không cần mở lại
    }
  }
  return 0;
}

// ─── ex08 · Khôi phục đường đi ngắn nhất ───
// Ý tưởng: BFS ghi parent[v] = u khi lần đầu chạm v; từ dst lần ngược parent về src rồi đảo mảng.
// Độ phức tạp: O(n + m) time · O(n) space.
// Vì sao best practice: parent[] chỉ O(n) bộ nhớ; không lưu cả đường đi trong mỗi phần tử queue (O(n·độ dài) bộ nhớ).
// Bẫy: src === dst → [src]; không tới được → [] (mảng rỗng); parent[src] phải là giá trị đặc biệt (-1) để vòng lần ngược dừng.
// Cách khác: lưu path trong queue — chỉ dùng cho đồ thị rất nhỏ.
// Python/Java: Python `path.reverse()` hoặc `path[::-1]`; Java `Collections.reverse(list)` rồi chuyển sang `int[]`.
export function shortestPathNodes(n: number, edges: number[][], src: number, dst: number): number[] {
  const adj = buildAdj(n, edges);
  const parent = new Int32Array(n).fill(-2); // -2 = chưa thăm, -1 = gốc
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  parent[src] = -1;
  q[tail++] = src;
  while (head < tail && parent[dst] === -2) {
    const u = q[head++];
    for (const v of adj[u]) {
      if (parent[v] === -2) {
        parent[v] = u;
        q[tail++] = v;
      }
    }
  }
  if (parent[dst] === -2) return [];
  const path: number[] = [];
  for (let v = dst; v !== -1; v = parent[v]) path.push(v);
  return path.reverse();
}

// ─── ex09 · 🔴 Kho gần nhất ───
// Ý tưởng: multi-source BFS — mọi kho vào queue với dist 0; dist[v] cuối cùng là khoảng cách tới kho gần nhất. Điểm không được loang tới giữ -1.
// Độ phức tạp: O(n + m) time · O(n + m) space — không phụ thuộc số kho.
// Vì sao best practice: BFS từ mỗi kho rồi lấy min là O(W · (n + m)); với W = n/10 thì chậm 10⁴ lần.
// Bẫy: kho nằm trong thành phần liên thông riêng → các điểm khác thành phần giữ -1; danh sách kho có thể rất dài.
// Cách khác: thêm một đỉnh "siêu nguồn" nối tới mọi kho rồi BFS một nguồn (trừ 1 ở kết quả).
// Python/Java: giống ex05; Java dùng `int[] dist` + `Arrays.fill(dist, -1)`.
export function nearestWarehouse(n: number, roads: number[][], warehouses: number[]): number[] {
  const adj = buildAdj(n, roads);
  const dist = new Int32Array(n).fill(-1);
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (const w of warehouses) {
    if (dist[w] < 0) {
      dist[w] = 0;
      q[tail++] = w;
    }
  }
  while (head < tail) {
    const u = q[head++];
    for (const v of adj[u]) {
      if (dist[v] < 0) {
        dist[v] = dist[u] + 1;
        q[tail++] = v;
      }
    }
  }
  return Array.from(dist);
}

// ─── ex10 · 🔴 Robot kho phá vật cản ───
// Ý tưởng: BFS trên không gian trạng thái (r, c, used) với used = số vật cản đã phá (0..k). Bước vào ô 1 thì used + 1 (không vượt k).
// Độ phức tạp: O(R·C·k) time · O(R·C·k) space.
// Vì sao best practice: visited theo (ô, used) — không theo ô — vì cùng một ô nhưng đã phá ít vật cản hơn là trạng thái TỐT HƠN, nên hai trạng thái khác nhau.
// Bẫy: BFS chỉ đánh dấu theo ô sẽ bỏ lỡ đường vòng qua ít vật cản; k lớn hơn R+C-3 thì luôn đi thẳng được (có thể cắt k để giảm bộ nhớ).
// Cách khác: lưu best[r][c] = used nhỏ nhất đã tới ô này; chỉ đẩy lại khi used nhỏ hơn (dominance pruning), vẫn đúng và ít trạng thái hơn.
// Python/Java: trạng thái mã hóa thành một int `(r*C + c)*(k+1) + used` để tránh tuple/mảng nhỏ.
export function shortestPathWithBreaks(grid: number[][], k: number): number {
  const R = grid.length;
  const C = grid[0].length;
  if (R === 1 && C === 1) return 0;
  k = Math.min(k, R + C - 3); // đi thẳng chỉ cần phá tối đa R+C-3 ô
  const K = k + 1;
  const total = R * C * K;
  const dist = new Int32Array(total).fill(-1);
  const q = new Int32Array(total);
  let head = 0;
  let tail = 0;
  dist[0] = 0;
  q[tail++] = 0;
  const DR = [-1, 1, 0, 0];
  const DC = [0, 0, -1, 1];
  while (head < tail) {
    const s = q[head++];
    const used = s % K;
    const cell = (s - used) / K;
    const r = (cell / C) | 0;
    const c = cell % C;
    for (let d = 0; d < 4; d++) {
      const nr = r + DR[d];
      const nc = c + DC[d];
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
      const nu = used + grid[nr][nc];
      if (nu > k) continue;
      const t = (nr * C + nc) * K + nu;
      if (dist[t] >= 0) continue;
      dist[t] = dist[s] + 1;
      if (nr === R - 1 && nc === C - 1) return dist[t];
      q[tail++] = t;
    }
  }
  return -1;
}
