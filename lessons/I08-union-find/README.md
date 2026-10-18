# I08 · Union-Find (Disjoint Set Union)

## Sau buổi này bạn sẽ
- Tự cài **DSU** với **nén đường (path compression)** và **gộp theo size/rank (union by size)**; biết vì sao cả hai cùng cần.
- Biết **α(n)** nghĩa là gì trong thực tế (≤ 4 với mọi n bạn gặp) và vì sao `find` phải viết **lặp**.
- Chọn DSU thay BFS/DFS khi bài toán có **cạnh đến dần** (đếm thành phần sau mỗi bước, đảo xuất hiện dần, tìm cạnh thừa).

## 1. Ý tưởng

Duy trì các nhóm rời nhau, hỗ trợ hai thao tác: `find(x)` (nhóm của x là ai) và `union(a, b)` (gộp hai nhóm). Mỗi nhóm là một **cây**; `parent[x]` trỏ lên cha, gốc trỏ vào chính nó; **gốc = đại diện** của nhóm.

```
parent:  0→0  1→0  2→0  3→3  4→3        nhóm {0,1,2} gốc 0 · nhóm {3,4} gốc 3
union(2, 4): gắn gốc nhỏ hơn vào gốc lớn hơn →  parent[3] = 0
```

```ts
class UnionFind {
  parent: Int32Array; size: Int32Array; comps: number;
  constructor(n: number) { /* parent[i] = i; size[i] = 1; comps = n */ }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];   // path halving: nén đường khi đi lên
      x = this.parent[x];
    }
    return x;
  }
  union(a: number, b: number): boolean {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;                       // đã cùng nhóm
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra; this.size[ra] += this.size[rb]; this.comps--;
    return true;
  }
}
```

## 2. Vì sao nhanh

| Biến thể | Chi phí mỗi thao tác |
|---|---|
| Không tối ưu (`parent[ra] = rb`) | O(n) trong tệ nhất — gộp `(0,1), (1,2), (2,3)…` tạo **chuỗi** dài n |
| Chỉ gộp theo size | O(log n) — cây cao ≤ log₂ n |
| Chỉ nén đường | O(log n) amortized |
| **Cả hai** | **O(α(n)) amortized** — α là nghịch đảo của hàm Ackermann, **≤ 4** với mọi n thực tế |

Với DSU đủ tối ưu, xem mỗi thao tác là O(1) khi ước lượng. `find` **lặp**: nếu viết đệ quy, chuỗi sâu 10⁵ sẽ tràn stack (và Python vượt `recursionlimit`).

`union by rank` (dùng độ cao ước lượng thay size) cho cùng α(n); size tiện hơn vì còn dùng được để biết **kích thước nhóm**.

## 3. Khi nào dùng DSU thay BFS/DFS

| Tình huống | Chọn |
|---|---|
| Đồ thị cố định, đếm thành phần một lần | BFS/DFS (I05/I06) hoặc DSU — ngang nhau |
| **Cạnh/ô thêm dần**, hỏi sau mỗi lần ("còn bao nhiêu nhóm?", "đã thông chưa?") | **DSU** — mỗi lần O(α) thay vì chạy lại O(n + m) |
| Cần **đường đi / khoảng cách** | BFS, không phải DSU |
| Cần **xóa** cạnh | DSU thường không hỗ trợ; xử lý offline theo thứ tự đảo ngược |
| Cạnh nhóm theo chuỗi / email / ký tự | DSU trên `Map` → id, hoặc trên chỉ số của đối tượng |

## 4. Các khuôn
- **Cạnh thừa tạo chu trình:** thêm cạnh lần lượt; `union` trả `false` ⇒ hai đầu đã nối ⇒ cạnh này đóng vòng.
- **Đếm thành phần động:** `comps` giảm 1 mỗi `union` thành công.
- **Lưới:** đánh số ô `id = r·C + c`; khi thêm ô đất, union với bốn hàng xóm đã là đất.
- **Phương trình `==` / `!=`:** union mọi `==` trước, rồi kiểm tra mọi `!=` sau (thứ tự hai lượt).
- **Gộp theo thuộc tính chung (email):** `owner[email] = tài khoản đầu tiên chứa nó`; gặp lại thì union hai tài khoản.
- **Hoán đổi tự do trong nhóm:** các chỉ số nối bởi cặp hoán đổi tạo nhóm; trong nhóm có thể sắp xếp ký tự thành thứ tự bất kỳ → sắp xếp riêng từng nhóm.
- **Kruskal (A07):** sắp cạnh theo trọng số, thêm cạnh nếu `union` thành công.

## 5. Dấu hiệu nhận biết
"nhóm / cụm / liên thông" + "thêm dần" · "có thông nhau không" · "cạnh nào thừa / tạo chu trình" · "gộp các mục chung thuộc tính" · "sau mỗi thao tác, còn bao nhiêu nhóm" · "các phương trình bằng nhau".

## 6. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Mảng | `Int32Array(n)` | `list[int]` | `int[]` |
| Đệ quy `find` | tràn ~10⁴ tầng | tràn ở `recursionlimit` | tràn stack ở ~10⁴–10⁵ |
| Sort nhóm | `.sort((a, b) => a - b)` (mặc định so **chuỗi**!) | `sorted()` | `Arrays.sort(int[])` |
| Ánh xạ khóa → id | `Map` | `dict` | `HashMap` |

## 7. Bẫy
1. **`find` viết đệ quy** — chuỗi dài làm tràn stack.
2. **Gắn `parent[a] = b`** thay vì gắn **gốc** `parent[find(a)] = find(b)`.
3. **Không gộp theo size/rank** → chuỗi dài; test của module này gộp `(i, i+1)` rồi `find` ở đầu chuỗi.
4. Quên **giảm** số thành phần khi union thành công, hoặc **giảm cả khi** `ra === rb`.
5. `find(x)` hai lần có thể trả **hai giá trị khác nhau** nếu có `union` xen giữa — đại diện đổi; đừng lưu root lâu.
6. Gộp theo **tên** thay vì theo thuộc tính chung (hai "John" khác nhau).
7. `Array.prototype.sort()` mặc định so chuỗi; `["10", "9"]` ra sai thứ tự.
8. Tự nghĩ `==` và `!=` có thể xử lý theo thứ tự xuất hiện.

## 8. Độ phức tạp
`m` thao tác trên `n` phần tử: **O((n + m) α(n)) ≈ O(n + m)**. Bộ nhớ O(n).
