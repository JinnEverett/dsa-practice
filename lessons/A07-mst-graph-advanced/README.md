# A07 · MST & graph nâng cao

## Sau buổi này bạn sẽ
- Tìm **cây khung nhỏ nhất (MST)** bằng **Kruskal** (DSU) và **Prim** (heap / mảng), chọn đúng theo độ dày đồ thị.
- Tìm **cầu** và **khớp** (Tarjan, `disc`/`low`), **SCC** (Tarjan hoặc Kosaraju).
- **Đường đi Euler** (Hierholzer) — giới thiệu.

> Bài trong module này giới hạn `n ≤ 5000` ở các bài DFS đệ quy (cầu, khớp, SCC) để đệ quy an toàn ở cả TS/Python/Java; đồ thị lớn hơn cần DFS lặp với stack tự quản.

## 1. MST

Đồ thị vô hướng có trọng số, liên thông, `n` đỉnh ⇒ MST có `n − 1` cạnh, tổng nhỏ nhất.
- **Cut property:** cạnh nhỏ nhất đi qua một "lát cắt" bất kỳ thuộc một MST nào đó.
- **Cycle property:** cạnh lớn nhất duy nhất trong một chu trình không thuộc MST.

**Kruskal** — sort cạnh tăng dần, thêm cạnh nếu hai đầu khác thành phần (DSU). O(E log E).
```ts
class DSU {
  p: Int32Array;
  constructor(n: number) { this.p = Int32Array.from({ length: n }, (_, i) => i); }
  find(x: number): number { while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; } return x; }  // path halving
  union(a: number, b: number): boolean { a = this.find(a); b = this.find(b); if (a === b) return false; this.p[a] = b; return true; }
}
```
**Prim** — lớn dần cây từ một đỉnh, mỗi bước thêm cạnh nhỏ nhất ra ngoài.
- Heap: O(E log V) — đồ thị **thưa**.
- Mảng `minEdge[v]` quét tìm min: **O(V²)** — đồ thị **dày/đầy đủ** (V = 2000 ⇒ 4·10⁶ thay vì sort 2·10⁶ cạnh).

| Đồ thị | Chọn |
|---|---|
| thưa (`E ≈ V`) | Kruskal hoặc Prim-heap |
| dày/đầy đủ (`E ≈ V²`), cạnh sinh từ tọa độ | **Prim O(V²)**, không dựng danh sách cạnh |
| cạnh đã sort sẵn / đồ thị luồng cạnh | Kruskal |

Không liên thông ⇒ không có MST (Kruskal: số cạnh thêm được `< n − 1`).

## 2. Cầu (bridge) và khớp (articulation point)

DFS gán `disc[u]` (thời điểm thăm) và `low[u]` = `disc` nhỏ nhất đạt tới từ cây con của `u` bằng **tối đa một cạnh ngược**.
```
cạnh cha→con (u,v) là CẦU    ⇔ low[v] > disc[u]
u (không phải gốc) là KHỚP    ⇔ có con v: low[v] ≥ disc[u]
gốc là KHỚP                   ⇔ gốc có ≥ 2 con trong cây DFS
```
```ts
low[v] = Math.min(low[v], disc[to]);   // gặp đỉnh đã thăm (cạnh ngược), bỏ qua cạnh về cha
```
Bẫy: bỏ qua **cạnh cha** theo chỉ số cạnh (hoặc đỉnh cha khi không có cạnh trùng).

## 3. SCC (thành phần liên thông mạnh)

Đồ thị có hướng. `u ~ v` nếu `u` tới được `v` **và** `v` tới được `u`.
- **Tarjan:** DFS với `disc/low` + stack; khi `low[u] == disc[u]` thì pop một SCC. Một lượt DFS.
- **Kosaraju:** DFS lấy thứ tự kết thúc → DFS trên đồ thị đảo theo thứ tự ngược. Hai lượt.

Co mỗi SCC thành một đỉnh ⇒ **DAG** (có thể topo sort). SCC kích thước ≥ 2 = vòng phụ thuộc.

## 4. Đường đi Euler

Đi qua **mọi cạnh đúng một lần**. Đồ thị có hướng: tồn tại đường Euler từ `s` khi `out − in = 1` ở `s`, `in − out = 1` ở điểm cuối, còn lại cân bằng (và các cạnh liên thông). **Hierholzer** (lặp): đi theo cạnh chưa dùng, bế tắc thì lùi và ghi đỉnh vào kết quả; cuối cùng đảo ngược.
```ts
const stack = [start], out: string[] = [];
while (stack.length) {
  const u = stack[stack.length - 1];
  if (adj[u].length) stack.push(adj[u].pop()!);   // adj[u] sắp giảm dần → pop ra nhỏ nhất
  else out.push(stack.pop()!);
}
out.reverse();
```

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Heap (Prim) | `Heap` tự cài | `heapq` | `PriorityQueue<int[]>` |
| Sort cạnh | `edges.sort((a, b) => a[2] - b[2])` | `edges.sort(key=lambda e: e[2])` | `Arrays.sort(edges, (a, b) -> Integer.compare(a[2], b[2]))` |
| Tổng MST lớn | double ≤ 2⁵³ | vô hạn | **`long`** |
| Đệ quy DFS | ~10⁴ tầng | recursionlimit ≈ 12 000 | stack mặc định (~10⁴–10⁵) |

## 6. Bẫy
1. Quên kiểm tra liên thông (MST) ⇒ trả về tổng sai thay vì `-1`.
2. Kruskal trên đồ thị đầy đủ: dựng `V²/2` cạnh rồi sort — chậm hơn Prim O(V²) rất nhiều.
3. Cầu/khớp: quên bỏ qua cạnh cha ⇒ mọi cạnh thành "không phải cầu".
4. Khớp ở **gốc** xét khác (đếm số con DFS).
5. Java: tổng trọng số vượt `int`; so sánh `a[2] - b[2]` tràn.
6. Itinerary: quên sắp xếp từ điển hoặc dùng đệ quy sâu `m` tầng.

## 7. Độ phức tạp
Kruskal O(E log E) · Prim-heap O(E log V) · Prim-mảng O(V²) · cầu/khớp/SCC O(V + E) · Euler O(E log E) (do sort đích).
