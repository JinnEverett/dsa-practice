// I06 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Mọi DFS dưới đây dùng STACK TƯỜNG MINH (không đệ quy): đồ thị/lưới tới 10⁵–10⁶ nút có thể sâu hàng chục nghìn tầng,
// còn stack gọi hàm của Node chỉ chịu ~7 000–12 000 tầng.

// danh sách kề CSR; eid[i] = chỉ số cạnh gốc của slot i (để phân biệt cạnh song song).
function buildCsr(n: number, edges: number[][], directed: boolean): { start: Int32Array; to: Int32Array; eid: Int32Array } {
  const start = new Int32Array(n + 2);
  for (const [a, b] of edges) {
    start[a + 2]++;
    if (!directed) start[b + 2]++;
  }
  for (let i = 2; i <= n + 1; i++) start[i] += start[i - 1];
  const to = new Int32Array(directed ? edges.length : edges.length * 2);
  const eid = new Int32Array(to.length);
  edges.forEach(([a, b], k) => {
    eid[start[a + 1]] = k;
    to[start[a + 1]++] = b;
    if (!directed) {
      eid[start[b + 1]] = k;
      to[start[b + 1]++] = a;
    }
  });
  return { start, to, eid };
}

/**
 * ex01 · countComponents
 * Ý tưởng: duyệt đỉnh 0..n−1; gặp đỉnh chưa thăm thì +1 thành phần và DFS (stack) đánh dấu cả thành phần.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: stack là Int32Array cỡ n (mỗi đỉnh được push đúng 1 lần nếu đánh dấu lúc push).
 * Bẫy: đỉnh cô lập cũng là một thành phần; dựng kề bằng quét cạnh cho từng đỉnh → O(n·m).
 * Cách khác: BFS (cùng độ phức tạp), Union-Find (I08) — hơn hẳn khi cạnh đến dần.
 * Python/Java: Python dùng `list` làm stack (`append`/`pop` O(1)); Java `ArrayDeque` hoặc `int[]` + `sp`.
 */
export function countComponents(n: number, edges: number[][]): number {
  const { start, to } = buildCsr(n, edges, false);
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  let comps = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    comps++;
    let sp = 0;
    seen[s] = 1;
    stack[sp++] = s;
    while (sp) {
      const u = stack[--sp];
      for (let i = start[u]; i < start[u + 1]; i++) {
        const v = to[i];
        if (!seen[v]) (seen[v] = 1), (stack[sp++] = v);
      }
    }
  }
  return comps;
}

/**
 * ex02 · floodFill
 * Ý tưởng: từ (sr, sc) lan sang các ô 4 hướng có CÙNG màu gốc, tô màu mới.
 * Độ phức tạp: O(R·C).
 * Vì sao best practice: nếu màu mới == màu gốc thì trả bản sao ngay — nếu không, "đã thăm" (= màu mới) không phân
 *   biệt được với "chưa thăm" và vòng lặp không bao giờ dừng.
 * Bẫy: sửa trực tiếp input (đề yêu cầu trả ảnh mới; sửa tại chỗ là thói quen xấu khi input dùng chung).
 * Cách khác: BFS; đệ quy (tràn stack với ảnh một màu 1000×1000).
 * Python/Java: Python `[row[:] for row in image]`; Java `image[i].clone()`.
 */
export function floodFill(image: number[][], sr: number, sc: number, color: number): number[][] {
  const out = image.map((row) => row.slice());
  const R = out.length;
  const C = out[0].length;
  const old = out[sr][sc];
  if (old === color) return out;
  const stack = new Int32Array(R * C);
  let sp = 0;
  out[sr][sc] = color;
  stack[sp++] = sr * C + sc;
  while (sp) {
    const cur = stack[--sp];
    const r = (cur / C) | 0;
    const c = cur % C;
    if (r > 0 && out[r - 1][c] === old) (out[r - 1][c] = color), (stack[sp++] = cur - C);
    if (r < R - 1 && out[r + 1][c] === old) (out[r + 1][c] = color), (stack[sp++] = cur + C);
    if (c > 0 && out[r][c - 1] === old) (out[r][c - 1] = color), (stack[sp++] = cur - 1);
    if (c < C - 1 && out[r][c + 1] === old) (out[r][c + 1] = color), (stack[sp++] = cur + 1);
  }
  return out;
}

/**
 * ex03 · maxAreaOfIsland
 * Ý tưởng: DFS từ mỗi ô đất chưa thăm, đếm số ô đã pop; lấy max.
 * Độ phức tạp: O(R·C).
 * Vì sao best practice: stack tường minh — test "rắn" (một đảo dài ~8·10⁴ ô) làm đệ quy tràn.
 * Bẫy: không có đảo → 0.
 * Cách khác: BFS; Union-Find với size.
 * Python/Java: Python mặc định recursion limit 1000 — với đệ quy phải nâng `sys.setrecursionlimit` (runner đã đặt ~12 000).
 */
export function maxAreaOfIsland(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0].length;
  const seen = new Uint8Array(R * C);
  const stack = new Int32Array(R * C);
  let best = 0;
  for (let s = 0; s < R * C; s++) {
    if (seen[s] || grid[(s / C) | 0][s % C] !== 1) continue;
    let sp = 0;
    let area = 0;
    seen[s] = 1;
    stack[sp++] = s;
    while (sp) {
      const cur = stack[--sp];
      area++;
      const r = (cur / C) | 0;
      const c = cur % C;
      if (r > 0 && !seen[cur - C] && grid[r - 1][c] === 1) (seen[cur - C] = 1), (stack[sp++] = cur - C);
      if (r < R - 1 && !seen[cur + C] && grid[r + 1][c] === 1) (seen[cur + C] = 1), (stack[sp++] = cur + C);
      if (c > 0 && !seen[cur - 1] && grid[r][c - 1] === 1) (seen[cur - 1] = 1), (stack[sp++] = cur - 1);
      if (c < C - 1 && !seen[cur + 1] && grid[r][c + 1] === 1) (seen[cur + 1] = 1), (stack[sp++] = cur + 1);
    }
    if (area > best) best = area;
  }
  return best;
}

/**
 * ex04 · hasCycleUndirected
 * Ý tưởng: DFS; gặp hàng xóm đã thăm mà KHÔNG phải cạnh vừa đi tới thì có chu trình.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: bỏ qua theo CHỈ SỐ CẠNH cha chứ không theo đỉnh cha — hai cạnh song song u–v (cạnh trùng)
 *   tạo chu trình độ dài 2 mà "bỏ qua đỉnh cha" sẽ bỏ sót.
 * Bẫy: đồ thị không liên thông → phải chạy DFS từ mọi thành phần.
 * Cách khác: rừng ⇔ m = n − (số thành phần); hoặc Union-Find: cạnh nối hai đỉnh cùng nhóm → chu trình.
 * Python/Java: tương tự; stack lưu cặp (đỉnh, cạnh cha) — hai mảng song song cho nhanh.
 */
export function hasCycleUndirected(n: number, edges: number[][]): boolean {
  const { start, to, eid } = buildCsr(n, edges, false);
  const ptr = Int32Array.from(start.subarray(0, n + 1));
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  const parentEdge = new Int32Array(n).fill(-1);
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    let sp = 0;
    seen[s] = 1;
    stack[sp++] = s;
    while (sp) {
      const u = stack[sp - 1];
      if (ptr[u] === start[u + 1]) {
        sp--;
        continue;
      }
      const i = ptr[u]++;
      if (eid[i] === parentEdge[u]) continue;
      const v = to[i];
      if (seen[v]) return true;
      seen[v] = 1;
      parentEdge[v] = eid[i];
      stack[sp++] = v;
    }
  }
  return false;
}

/**
 * ex05 · hasCycleDirected
 * Ý tưởng: 3 màu — 0 chưa thăm, 1 đang nằm trên đường DFS hiện tại, 2 đã xong. Gặp cạnh tới màu 1 → chu trình.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: DFS lặp với con trỏ `ptr[u]` (cạnh kế tiếp của u) mô phỏng đúng thời điểm "vào" và "ra" của
 *   đệ quy → màu 1/2 chính xác, không tràn stack với đường dài 10⁵.
 * Bẫy: dùng một mảng `visited` hai trạng thái → báo nhầm chu trình ở đồ thị kim cương (a→b, a→c, b→d, c→d).
 * Cách khác: Kahn (I07) — đếm số đỉnh lấy ra được.
 * Python/Java: tương tự.
 */
export function hasCycleDirected(n: number, edges: number[][]): boolean {
  const { start, to } = buildCsr(n, edges, true);
  const ptr = Int32Array.from(start.subarray(0, n + 1));
  const color = new Uint8Array(n);
  const stack = new Int32Array(n);
  for (let s = 0; s < n; s++) {
    if (color[s]) continue;
    let sp = 0;
    color[s] = 1;
    stack[sp++] = s;
    while (sp) {
      const u = stack[sp - 1];
      if (ptr[u] === start[u + 1]) {
        color[u] = 2;
        sp--;
        continue;
      }
      const v = to[ptr[u]++];
      if (color[v] === 1) return true;
      if (color[v] === 0) {
        color[v] = 1;
        stack[sp++] = v;
      }
    }
  }
  return false;
}

/**
 * ex06 · isBipartite
 * Ý tưởng: tô màu 2 màu: hàng xóm phải khác màu. DFS/BFS từ mỗi thành phần; gặp hàng xóm cùng màu → false.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: color = 0 chưa tô, 1/−1 hai màu → `-color[u]` cho hàng xóm; mọi thành phần đều phải được xét.
 * Bẫy: đồ thị không liên thông; đỉnh không có cạnh nào vẫn hợp lệ.
 * Cách khác: BFS tô màu; Union-Find với đỉnh đối (u, v+n).
 * Python/Java: input là `int[][] graph` (danh sách kề) — không cần dựng lại.
 */
export function isBipartite(graph: number[][]): boolean {
  const n = graph.length;
  const color = new Int8Array(n);
  const stack = new Int32Array(n);
  for (let s = 0; s < n; s++) {
    if (color[s]) continue;
    let sp = 0;
    color[s] = 1;
    stack[sp++] = s;
    while (sp) {
      const u = stack[--sp];
      for (const v of graph[u]) {
        if (color[v] === color[u]) return false;
        if (color[v] === 0) (color[v] = -color[u]), (stack[sp++] = v);
      }
    }
  }
  return true;
}

/**
 * ex07 · captureRegions
 * Ý tưởng: ĐẢO CHIỀU — không hỏi "vùng O nào bị bao", mà DFS từ các 'O' trên BIÊN đánh dấu "an toàn"; mọi 'O' còn lại
 *   (không được chạm tới từ biên) bị đổi thành 'X'.
 * Độ phức tạp: O(R·C).
 * Vì sao best practice: một lượt duyệt từ biên thay vì kiểm tra từng vùng có chạm biên hay không.
 * Bẫy: chỉ duyệt từ 4 góc; quên rằng 'O' ở biên không bao giờ bị đổi.
 * Cách khác: Union-Find với nút "biên" ảo.
 * Python/Java: str bất biến → làm việc trên `list[list[str]]` / `char[][]` rồi nối lại.
 */
export function captureRegions(board: string[]): string[] {
  const R = board.length;
  const C = board[0].length;
  const safe = new Uint8Array(R * C);
  const stack = new Int32Array(R * C);
  let sp = 0;
  const push = (r: number, c: number) => {
    const id = r * C + c;
    if (!safe[id] && board[r][c] === 'O') (safe[id] = 1), (stack[sp++] = id);
  };
  for (let r = 0; r < R; r++) (push(r, 0), push(r, C - 1));
  for (let c = 0; c < C; c++) (push(0, c), push(R - 1, c));
  while (sp) {
    const cur = stack[--sp];
    const r = (cur / C) | 0;
    const c = cur % C;
    if (r > 0) push(r - 1, c);
    if (r < R - 1) push(r + 1, c);
    if (c > 0) push(r, c - 1);
    if (c < C - 1) push(r, c + 1);
  }
  return board.map((row, r) => Array.from(row, (ch, c) => (ch === 'O' && !safe[r * C + c] ? 'X' : ch)).join(''));
}

/**
 * ex08 · pacificAtlantic
 * Ý tưởng: nước chảy từ cao xuống thấp (≤). Đảo chiều: DFS NGƯỢC từ biên mỗi đại dương, đi lên ô cao hơn hoặc bằng.
 *   Ô được cả hai DFS chạm tới là đáp án.
 * Độ phức tạp: O(R·C) (hai lần DFS) thay vì O(R·C·R·C) nếu thả nước từ mỗi ô.
 * Vì sao best practice: cùng mẹo "lan từ đích" như multi-source BFS (I05).
 * Bẫy: điều kiện đi ngược là `h[next] >= h[cur]` (không phải >).
 * Cách khác: BFS multi-source.
 * Python/Java: Java trả `List<List<Integer>>` — `Arrays.asList(r, c)`.
 */
export function pacificAtlantic(heights: number[][]): number[][] {
  const R = heights.length;
  const C = heights[0].length;
  const reach = (starts: number[]): Uint8Array => {
    const seen = new Uint8Array(R * C);
    const stack = new Int32Array(R * C);
    let sp = 0;
    for (const s of starts) (seen[s] = 1), (stack[sp++] = s);
    while (sp) {
      const cur = stack[--sp];
      const r = (cur / C) | 0;
      const c = cur % C;
      const h = heights[r][c];
      const go = (nr: number, nc: number) => {
        const id = nr * C + nc;
        if (!seen[id] && heights[nr][nc] >= h) (seen[id] = 1), (stack[sp++] = id);
      };
      if (r > 0) go(r - 1, c);
      if (r < R - 1) go(r + 1, c);
      if (c > 0) go(r, c - 1);
      if (c < C - 1) go(r, c + 1);
    }
    return seen;
  };
  const pac: number[] = [];
  const atl: number[] = [];
  for (let r = 0; r < R; r++) (pac.push(r * C), atl.push(r * C + C - 1));
  for (let c = 0; c < C; c++) (pac.push(c), atl.push((R - 1) * C + c));
  const a = reach(pac);
  const b = reach(atl);
  const out: number[][] = [];
  for (let id = 0; id < R * C; id++) if (a[id] && b[id]) out.push([(id / C) | 0, id % C]);
  return out;
}

/**
 * ex09 · findCircleNum
 * Ý tưởng: ma trận kề n×n → số thành phần liên thông; DFS dùng chính ma trận (duyệt hàng i để tìm hàng xóm).
 * Độ phức tạp: O(n²) — kích thước input đã là n², không thể tốt hơn.
 * Vì sao best practice: không dựng danh sách kề thừa; stack tường minh.
 * Bẫy: `isConnected[i][i] = 1` (tự nối) — không ảnh hưởng vì đỉnh đã thăm.
 * Cách khác: Union-Find (I08).
 * Python/Java: tương tự.
 */
export function findCircleNum(isConnected: number[][]): number {
  const n = isConnected.length;
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  let groups = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    groups++;
    let sp = 0;
    seen[s] = 1;
    stack[sp++] = s;
    while (sp) {
      const row = isConnected[stack[--sp]];
      for (let v = 0; v < n; v++) if (row[v] === 1 && !seen[v]) (seen[v] = 1), (stack[sp++] = v);
    }
  }
  return groups;
}

/**
 * ex10 · makeConnected
 * Ý tưởng: nối n máy cần ít nhất n − 1 sợi cáp. Nếu đủ cáp (|connections| ≥ n − 1) thì số lần kéo lại = (số thành phần) − 1,
 *   vì mỗi thành phần đều có cáp thừa để nhổ đi nối sang thành phần khác.
 * Độ phức tạp: O(n + m).
 * Vì sao best practice: không cần đếm cáp thừa từng thành phần — chỉ cần so tổng cáp với n − 1.
 * Bẫy: không đủ cáp → −1 (kiểm tra trước, đừng chỉ đếm thành phần).
 * Cách khác: Union-Find đếm cạnh thừa (cạnh nối hai đỉnh đã cùng nhóm).
 * Python/Java: tương tự.
 */
export function makeConnected(n: number, connections: number[][]): number {
  if (connections.length < n - 1) return -1;
  return countComponents(n, connections) - 1;
}
