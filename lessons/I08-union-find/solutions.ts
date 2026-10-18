// I08 · Đáp án best practice. Chỉ mở sau khi check ✅.

/**
 * ex01 · UnionFind
 * Ý tưởng: mỗi nhóm là một cây, `parent[x]` trỏ lên cha, gốc trỏ vào chính nó. `find` đi lên tới gốc và NÉN ĐƯỜNG
 *   (path halving: mỗi bước cho x trỏ thẳng lên ông nội). `union` gắn gốc cây NHỎ (theo size) vào gốc cây lớn.
 * Độ phức tạp: mỗi thao tác O(α(n)) amortized (α = nghịch đảo Ackermann, ≤ 4 với mọi n thực tế). Chỉ nén đường hoặc chỉ
 *   gộp theo size đã cho O(log n) amortized; làm cả hai mới có α(n).
 * Vì sao best practice: `find` LẶP (không đệ quy) — cây có thể sâu 10⁵ tầng nếu thiếu union by size; mảng Int32Array.
 * Bẫy: `union(a, b)` phải gọi `find` cho CẢ HAI trước khi gắn; quên giảm `count` khi union thành công; `parent[a] = b`
 *   thay vì gắn gốc → chuỗi dài, mỗi `find` O(n) khi không nén.
 * Cách khác: union by rank (cùng α(n)); quick-find (O(1) find, O(n) union) chỉ hợp khi n bé.
 * Python/Java: Python dùng `list`; find lặp (đệ quy sẽ chạm recursionlimit); Java `int[]` — tránh `Integer[]`.
 */
export class UnionFind {
  private parent: Int32Array;
  private size: Int32Array;
  private comps: number;
  constructor(n: number) {
    this.parent = new Int32Array(n);
    this.size = new Int32Array(n).fill(1);
    for (let i = 0; i < n; i++) this.parent[i] = i;
    this.comps = n;
  }
  find(x: number): number {
    const p = this.parent;
    while (p[x] !== x) {
      p[x] = p[p[x]]; // path halving
      x = p[x];
    }
    return x;
  }
  union(a: number, b: number): boolean {
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return false;
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.comps--;
    return true;
  }
  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }
  count(): number {
    return this.comps;
  }
}

/**
 * ex02 · findRedundantConnection
 * Ý tưởng: thêm cạnh lần lượt vào DSU; cạnh đầu tiên mà hai đầu đã cùng nhóm là cạnh tạo chu trình.
 * Độ phức tạp: O(n α(n)).
 * Vì sao best practice: input là cây + đúng 1 cạnh thừa, nên cạnh đóng vòng đầu tiên theo thứ tự input cũng chính là
 *   cạnh nằm cuối cùng trong chu trình — đúng yêu cầu "trả về cạnh xuất hiện sau cùng".
 * Bẫy: trả về cạnh theo thứ tự đầu vào gốc (không đảo [u, v]).
 * Cách khác: DFS tìm chu trình rồi chọn cạnh cuối trong chu trình (phức tạp hơn).
 * Python/Java: tương tự.
 */
export function findRedundantConnection(edges: number[][]): number[] {
  const uf = new UnionFind(edges.length);
  for (const [a, b] of edges) if (!uf.union(a, b)) return [a, b];
  return [];
}

/**
 * ex03 · componentsAfterEach
 * Ý tưởng: bắt đầu với n nhóm; mỗi `union` thành công giảm 1. Ghi `count()` sau từng cạnh.
 * Độ phức tạp: O((n + m) α(n)).
 * Vì sao best practice: đây là lý do DSU thắng BFS/DFS khi đồ thị TĂNG DẦN — mỗi cạnh mới O(α(n)), còn chạy lại BFS là O(n + m).
 * Bẫy: cạnh trùng / khuyên không làm đổi số nhóm.
 * Cách khác: không có cách nào đơn giản ngoài DSU.
 * Python/Java: tương tự.
 */
export function componentsAfterEach(n: number, edges: number[][]): number[] {
  const uf = new UnionFind(n);
  return edges.map(([a, b]) => (uf.union(a, b), uf.count()));
}

/**
 * ex04 · equationsPossible
 * Ý tưởng: hai lượt. Lượt 1: mọi "==" → union. Lượt 2: mọi "!=" mà hai biến CÙNG nhóm → mâu thuẫn.
 * Độ phức tạp: O(E α(26)).
 * Vì sao best practice: thứ tự hai lượt quan trọng — "!=" nào cũng phải xét SAU khi biết toàn bộ quan hệ bằng nhau.
 * Bẫy: xét "!=" ngay khi gặp (a!=b, b==c, a==c bị bỏ sót); "a!=a" luôn mâu thuẫn.
 * Cách khác: dựng đồ thị "==" rồi DFS kiểm tra từng "!=".
 * Python/Java: ký tự `ord(ch) - 97` / `ch - 'a'`.
 */
export function equationsPossible(equations: string[]): boolean {
  const uf = new UnionFind(26);
  for (const e of equations) if (e[1] === '=') uf.union(e.charCodeAt(0) - 97, e.charCodeAt(3) - 97);
  for (const e of equations) if (e[1] === '!' && uf.connected(e.charCodeAt(0) - 97, e.charCodeAt(3) - 97)) return false;
  return true;
}

/**
 * ex05 · accountsMerge
 * Ý tưởng: DSU trên CHỈ SỐ TÀI KHOẢN. Mỗi email nhớ tài khoản đầu tiên chứa nó; gặp lại thì union hai tài khoản.
 *   Cuối cùng gom email theo gốc, sắp xếp, ghép tên.
 * Độ phức tạp: O(E α + E log E) với E = tổng số email (sort email trong nhóm).
 * Vì sao best practice: DSU nhỏ (số tài khoản), email chỉ tra bảng băm một lần.
 * Bẫy: hai tài khoản cùng TÊN nhưng không chung email là hai người khác nhau; email trùng trong cùng nhóm phải khử.
 * Cách khác: DSU trực tiếp trên email; DFS trên đồ thị email–tài khoản.
 * Python/Java: sort chuỗi theo mã ký tự (Java `Collections.sort`, Python `sorted`).
 */
export function accountsMerge(accounts: string[][]): string[][] {
  const uf = new UnionFind(accounts.length);
  const owner = new Map<string, number>();
  accounts.forEach((acc, i) => {
    for (let k = 1; k < acc.length; k++) {
      const j = owner.get(acc[k]);
      if (j === undefined) owner.set(acc[k], i);
      else uf.union(i, j);
    }
  });
  const groups = new Map<number, Set<string>>();
  for (const [email, i] of owner) {
    const r = uf.find(i);
    let g = groups.get(r);
    if (!g) groups.set(r, (g = new Set()));
    g.add(email);
  }
  const out: string[][] = [];
  for (const [r, set] of groups) out.push([accounts[r][0], ...[...set].sort()]);
  return out;
}

/**
 * ex06 · numIslands2
 * Ý tưởng: thêm từng ô đất: count++ rồi union với mỗi hàng xóm đã là đất; mỗi union thành công count--.
 * Độ phức tạp: O((K + m·n) α) với K = số vị trí; DSU khởi tạo cho m·n ô.
 * Vì sao best practice: mỗi lần thêm là O(α) thay vì chạy lại BFS O(m·n) → từ O(K·m·n) xuống gần O(K).
 * Bẫy: vị trí đã là đất được thêm lần nữa → count giữ nguyên (không union lại); id = r·n + c.
 * Cách khác: offline đảo ngược (xóa) — không cần ở đây.
 * Python/Java: dùng mảng phẳng, tránh tuple trong vòng nóng.
 */
export function numIslands2(m: number, n: number, positions: number[][]): number[] {
  const uf = new UnionFind(m * n);
  const land = new Uint8Array(m * n);
  let islands = 0;
  const out: number[] = [];
  for (const [r, c] of positions) {
    const id = r * n + c;
    if (!land[id]) {
      land[id] = 1;
      islands++;
      if (r > 0 && land[id - n] && uf.union(id, id - n)) islands--;
      if (r < m - 1 && land[id + n] && uf.union(id, id + n)) islands--;
      if (c > 0 && land[id - 1] && uf.union(id, id - 1)) islands--;
      if (c < n - 1 && land[id + 1] && uf.union(id, id + 1)) islands--;
    }
    out.push(islands);
  }
  return out;
}

/**
 * ex07 · earliestAcq
 * Ý tưởng: sắp log theo thời điểm, union dần; lúc `count() === 1` là thời điểm sớm nhất mọi người (gián tiếp) quen nhau.
 * Độ phức tạp: O(L log L + L α(n)).
 * Vì sao best practice: log không có thứ tự sẵn → sort theo timestamp trước; dừng ngay khi 1 nhóm.
 * Bẫy: log đầu vào KHÔNG sắp sẵn; không bao giờ thành 1 nhóm → −1.
 * Cách khác: BFS lại sau mỗi log (O(L·(n + L))).
 * Python/Java: sort theo `log[0]`; Java `Arrays.sort(logs, (a, b) -> Integer.compare(a[0], b[0]))` (không trừ — tràn).
 */
export function earliestAcq(logs: number[][], n: number): number {
  const uf = new UnionFind(n);
  const sorted = logs.slice().sort((a, b) => a[0] - b[0]);
  for (const [t, x, y] of sorted) {
    uf.union(x, y);
    if (uf.count() === 1) return t;
  }
  return -1;
}

/**
 * ex08 · smallestStringWithSwaps
 * Ý tưởng: các chỉ số nối với nhau qua cặp hoán đổi tạo thành một nhóm; trong nhóm có thể sắp xếp các ký tự theo BẤT KỲ hoán vị
 *   nào. Vậy: gom chỉ số theo nhóm (DSU), sắp ký tự của nhóm tăng dần, rồi đặt lại vào các chỉ số của nhóm theo thứ tự tăng dần.
 * Độ phức tạp: O(n α + n log n).
 * Vì sao best practice: không mô phỏng hoán đổi; hoán đổi liên tiếp sinh ra mọi hoán vị trong thành phần liên thông.
 * Bẫy: sắp ký tự nhưng đặt vào chỉ số KHÔNG tăng dần; chỉ số là số ⇒ duyệt i từ 0 tới n−1 để chỉ số trong mỗi nhóm tự tăng.
 * Cách khác: DFS gom thành phần.
 * Python/Java: Java dùng `char[]` + `Arrays.sort`; Python dùng `list` rồi `''.join`.
 */
export function smallestStringWithSwaps(s: string, pairs: number[][]): string {
  const n = s.length;
  const uf = new UnionFind(n);
  for (const [a, b] of pairs) uf.union(a, b);
  const idx = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const r = uf.find(i);
    const g = idx.get(r);
    if (g) g.push(i);
    else idx.set(r, [i]);
  }
  const out = new Array<string>(n);
  for (const ids of idx.values()) {
    const chars = ids.map((i) => s.charCodeAt(i)).sort((x, y) => x - y);
    ids.forEach((i, k) => (out[i] = String.fromCharCode(chars[k])));
  }
  return out.join('');
}
