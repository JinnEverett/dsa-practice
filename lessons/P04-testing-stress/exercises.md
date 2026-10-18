# P04 · Bài tập: 8 đoạn code lỗi

Tạo khung: `node tools/scaffold.ts lessons/P04-testing-stress [--lang ts|py|java]` · Chấm bản sửa: `node tools/check.ts lessons/P04-testing-stress 01`

**Pass:** tìm được bug trong **6/8** đoạn code bằng **stress test tự viết** (`answers/stress_NN.*`, coach chạy kiểm tra — không có `check` tự động cho phần này) + 8 bản sửa qua `check` (ít nhất 6).

Mỗi bài có hai phần:
- **A — Sửa (chấm máy):** viết lại hàm đúng vào `answers/exNN.*`.
- **B — Stress (tự viết):** `answers/stress_NN.*` import code lỗi từ `bugs/bugNN.*`, tự động tìm và in **phản ví dụ nhỏ nhất**. Ghi vào `answers/p04.md` (mỗi bài 3 dòng): *phản ví dụ · đặc điểm generator cần có · bạn đoán bug trước hay sau khi chạy stress?*

Chữ ký (Java) và đề là của bản **đúng**; code bên dưới có thể chép từ `bugs/` vào `answers/` để chạy thử và thấy `check` báo SAI. Bản Python/Java mô phỏng cùng lỗi (hoặc, ở ex05 Python, minh họa rằng lỗi không xảy ra ở ngôn ngữ đó).

---

## ex01 · 🟢 Vị trí chèn (lower bound)
Mảng `nums` **đã sắp không giảm** (có thể trùng). Trả chỉ số nhỏ nhất `i` sao cho `nums[i] ≥ target`; nếu không có thì trả `nums.length`.
```java
int lowerBound(int[] nums, int target)
```
- `0 ≤ n ≤ 10⁵`, `|nums[i]|, |target| ≤ 10⁹`. Ví dụ: `[1,3,3,5], 3` → `1` · `[1,3,3,5], 4` → `3` · `[1,3,3,5], 9` → `4` · `[], 5` → `0`.
- Gợi ý chung: khi nào đáp án hợp lệ nằm *ngoài* mảng?

**Code lỗi (TypeScript):**
```ts
// Bug 01 · vị trí chèn (lower bound). Đề: ex01 trong exercises.md. Code CÓ LỖI.
export function lowerBound(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
```
**Python:**
```python
# Bug 01 · vị trí chèn (lower bound). Code CÓ LỖI.
def lower_bound(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo
```
**Java:**
```java
// Bug 01 · vị trí chèn (lower bound). Code CÓ LỖI.
class Solution {
    public int lowerBound(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}
```

---

## ex02 · 🟢 Sắp từ theo tần suất
Trả các từ **khác nhau** của `words`, sắp theo số lần xuất hiện **giảm dần**; hòa thì theo thứ tự từ điển **tăng dần** (mã ký tự).
```java
List<String> sortByFrequency(String[] words)
```
- `0 ≤ n ≤ 10⁵`, từ gồm chữ thường/số, độ dài ≤ 10. Ví dụ: `[b,a,b,a]` → `[a,b]` · `[x,y,y,z,z,z]` → `[z,y,x]`.
- Gợi ý chung: kết quả có *tất định* và khớp đề trong mọi trường hợp hòa không?

**Code lỗi (TypeScript):**
```ts
// Bug 02 · sắp từ theo tần suất. Code CÓ LỖI.
export function sortByFrequency(words: string[]): string[] {
  const cnt = new Map<string, number>();
  for (const w of words) cnt.set(w, (cnt.get(w) ?? 0) + 1);
  return [...cnt.keys()].sort((a, b) => cnt.get(b)! - cnt.get(a)!);
}
```
**Python:**
```python
# Bug 02 · sắp từ theo tần suất. Code CÓ LỖI.
def sort_by_frequency(words: list[str]) -> list[str]:
    cnt: dict[str, int] = {}
    for w in words:
        cnt[w] = cnt.get(w, 0) + 1
    return sorted(cnt, key=lambda w: -cnt[w])
```
**Java:**
```java
import java.util.*;

// Bug 02 · sắp từ theo tần suất. Code CÓ LỖI.
class Solution {
    public List<String> sortByFrequency(String[] words) {
        Map<String, Integer> cnt = new HashMap<>();
        for (String w : words) cnt.merge(w, 1, Integer::sum);
        List<String> keys = new ArrayList<>(cnt.keySet());
        keys.sort((a, b) -> cnt.get(b) - cnt.get(a));
        return keys;
    }
}
```

---

## ex03 · 🟢 Phần tử nhỏ thứ k
Trả phần tử nhỏ thứ `k` (đếm từ 1) của `nums` (không nhất thiết khác nhau).
```java
int kthSmallest(int[] nums, int k)
```
- `1 ≤ k ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`. Ví dụ: `[10,9,1], k=2` → `9` · `[-5,-10,0], k=1` → `-10`.
- Gợi ý chung: miền giá trị mà generator của bạn dùng có kích hoạt được bug không?

**Code lỗi (TypeScript):**
```ts
// Bug 03 · phần tử nhỏ thứ k (k tính từ 1). Code CÓ LỖI.
export function kthSmallest(nums: number[], k: number): number {
  const a = nums.slice();
  a.sort();
  return a[k - 1];
}
```
**Python:**
```python
# Bug 03 · phần tử nhỏ thứ k. Code CÓ LỖI — tương đương Python của "sort() mặc định so chuỗi":
# dữ liệu đến dưới dạng chuỗi số và được sắp như chuỗi.
def kth_smallest(nums: list[int], k: int) -> int:
    a = sorted(str(x) for x in nums)
    return int(a[k - 1])
```
**Java:**
```java
import java.util.*;

// Bug 03 · phần tử nhỏ thứ k. Code CÓ LỖI — tương đương Java: sắp mảng String chứa số.
class Solution {
    public int kthSmallest(int[] nums, int k) {
        String[] a = new String[nums.length];
        for (int i = 0; i < nums.length; i++) a[i] = String.valueOf(nums[i]);
        Arrays.sort(a);
        return Integer.parseInt(a[k - 1]);
    }
}
```

---

## ex04 · 🟡 Đường ngắn nhất (BFS) trong đồ thị vô hướng
Trả số cạnh ít nhất từ `src` tới `dst`, hoặc `-1` nếu không tới được. Đồ thị vô hướng, không trọng số; có thể có cạnh lặp.
```java
int shortestPath(int n, int[][] edges, int src, int dst)
```
- `1 ≤ n ≤ 10⁵`, `0 ≤ |edges| ≤ 2·10⁵`. Ví dụ: `4, [[0,1],[1,2],[2,3]], 0, 3` → `3` · `4, [[0,1],[2,3]], 0, 3` → `-1`.
- **Lỗi này không làm sai kết quả.** Gợi ý chung: bạn có đo thời gian và có generator đồ thị *có cấu trúc* không?

**Code lỗi (TypeScript):**
```ts
// Bug 04 · đường ngắn nhất (BFS) trong đồ thị vô hướng, -1 nếu không tới. Code CÓ LỖI.
export function shortestPath(n: number, edges: number[][], src: number, dst: number): number {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const visited = new Array<boolean>(n).fill(false);
  const queue: [number, number][] = [[src, 0]];
  let head = 0;
  while (head < queue.length) {
    const [u, d] = queue[head++];
    visited[u] = true;
    if (u === dst) return d;
    for (const v of adj[u]) if (!visited[v]) queue.push([v, d + 1]);
  }
  return -1;
}
```
**Python:**
```python
from collections import deque

# Bug 04 · đường ngắn nhất (BFS). Code CÓ LỖI.
def shortest_path(n: int, edges: list[list[int]], src: int, dst: int) -> int:
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    visited = [False] * n
    q = deque([(src, 0)])
    while q:
        u, d = q.popleft()
        visited[u] = True
        if u == dst:
            return d
        for v in adj[u]:
            if not visited[v]:
                q.append((v, d + 1))
    return -1
```
**Java:**
```java
import java.util.*;

// Bug 04 · đường ngắn nhất (BFS). Code CÓ LỖI.
class Solution {
    public int shortestPath(int n, int[][] edges, int src, int dst) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        boolean[] visited = new boolean[n];
        Deque<int[]> q = new ArrayDeque<>();
        q.add(new int[]{src, 0});
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            visited[cur[0]] = true;
            if (cur[0] == dst) return cur[1];
            for (int v : adj.get(cur[0])) if (!visited[v]) q.add(new int[]{v, cur[1] + 1});
        }
        return -1;
    }
}
```

---

## ex05 · 🟡 Tích theo mod
Trả `(nums[0] · nums[1] · … ) mod mod`.
```java
int productMod(int[] nums, int mod)
```
- `1 ≤ n ≤ 10⁵`, `1 ≤ nums[i] ≤ 10⁹`, `2 ≤ mod ≤ 10⁹ + 7`. Ví dụ: `[2,3,4], 5` → `4` · `[999999999, 999999999], 1000000007` → `64`.
- Gợi ý chung: bản Python bên dưới **đúng**; hãy giải thích vì sao TS và Java cùng thuật toán lại sai.

**Code lỗi (TypeScript):**
```ts
// Bug 05 · tích các phần tử theo mod. Code CÓ LỖI.
export function productMod(nums: number[], mod: number): number {
  let p = 1;
  for (const x of nums) p = (p * x) % mod;
  return p;
}
```
**Python:**
```python
# Bug 05 · tích theo mod. Python có số nguyên lớn tùy ý nên bản này ĐÚNG — dùng để so sánh với TS/Java.
def product_mod(nums: list[int], mod: int) -> int:
    p = 1
    for x in nums:
        p = (p * x) % mod
    return p
```
**Java:**
```java
// Bug 05 · tích theo mod. Code CÓ LỖI (int tràn).
class Solution {
    public int productMod(int[] nums, int mod) {
        int p = 1;
        for (int x : nums) p = (p * x) % mod;
        return p;
    }
}
```

---

## ex06 · 🟡 Giá trị lớn thứ hai (không đổi input)
Trả **giá trị lớn thứ hai trong các giá trị khác nhau** của `nums`, hoặc `-1` nếu có ít hơn hai giá trị khác nhau. Hàm **không được thay đổi** `nums`.
```java
int secondLargest(int[] nums)
```
- `0 ≤ n ≤ 10⁵`, `|nums[i]| ≤ 10⁹`. Ví dụ: `[3,9,9,4]` → `4` · `[5,5,5]` → `-1` · `[]` → `-1`.
- Gợi ý chung: kết quả trả về đúng. Còn gì khác bạn có thể quan sát sau khi gọi hàm?

**Code lỗi (TypeScript):**
```ts
// Bug 06 · giá trị lớn thứ hai (khác nhau); -1 nếu có ít hơn 2 giá trị khác nhau. Code CÓ LỖI.
export function secondLargest(nums: number[]): number {
  nums.sort((a, b) => b - a);
  for (let i = 1; i < nums.length; i++) if (nums[i] !== nums[0]) return nums[i];
  return -1;
}
```
**Python:**
```python
# Bug 06 · giá trị lớn thứ hai (khác nhau); -1 nếu không có. Code CÓ LỖI.
def second_largest(nums: list[int]) -> int:
    nums.sort(reverse=True)
    for x in nums:
        if x != nums[0]:
            return x
    return -1
```
**Java:**
```java
import java.util.*;

// Bug 06 · giá trị lớn thứ hai (khác nhau); -1 nếu không có. Code CÓ LỖI.
class Solution {
    public int secondLargest(int[] nums) {
        Arrays.sort(nums);
        for (int i = nums.length - 2; i >= 0; i--) if (nums[i] != nums[nums.length - 1]) return nums[i];
        return -1;
    }
}
```

---

## ex07 · 🟡 Đổi tiền ít đồng nhất
Trả số đồng xu **ít nhất** để đổi đúng `amount` (mỗi loại dùng không giới hạn số lần), hoặc `-1` nếu không thể.
```java
int coinChange(int[] coins, int amount)
```
- `1 ≤ |coins| ≤ 12` (khác nhau, `1 ≤ coins[i] ≤ 10⁴`), `0 ≤ amount ≤ 10⁴`. Ví dụ: `[1,3,4], 6` → `2` · `[2,5], 6` → `3` · `[2], 3` → `-1`.
- Gợi ý chung: tập đồng xu trong generator của bạn có đủ "bất thường" không?

**Code lỗi (TypeScript):**
```ts
// Bug 07 · số đồng xu ít nhất để đổi `amount`; -1 nếu không thể. Code CÓ LỖI.
export function coinChange(coins: number[], amount: number): number {
  const sorted = [...coins].sort((a, b) => b - a);
  let count = 0;
  for (const c of sorted) {
    count += Math.floor(amount / c);
    amount %= c;
  }
  return amount === 0 ? count : -1;
}
```
**Python:**
```python
# Bug 07 · số đồng xu ít nhất; -1 nếu không thể. Code CÓ LỖI.
def coin_change(coins: list[int], amount: int) -> int:
    count = 0
    for c in sorted(coins, reverse=True):
        count += amount // c
        amount %= c
    return count if amount == 0 else -1
```
**Java:**
```java
import java.util.*;

// Bug 07 · số đồng xu ít nhất; -1 nếu không thể. Code CÓ LỖI.
class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] c = coins.clone();
        Arrays.sort(c);
        int count = 0;
        for (int i = c.length - 1; i >= 0; i--) {
            count += amount / c[i];
            amount %= c[i];
        }
        return amount == 0 ? count : -1;
    }
}
```

---

## ex08 · 🔴 Thứ tự duyệt BFS
Trả thứ tự các nút thăm khi BFS từ `src`; khi mở một nút, duyệt hàng xóm theo **id tăng dần**; chỉ gồm nút tới được từ `src`. Đồ thị vô hướng.
```java
int[] bfsOrder(int n, int[][] edges, int src)
```
- `1 ≤ n ≤ 2·10⁵`, `0 ≤ |edges| ≤ 2·10⁵`. Ví dụ: `5, [[0,2],[0,1],[1,3],[2,4]], 0` → `[0,1,2,3,4]` · `4, [[1,2]], 0` → `[0]`.
- **Lỗi này không làm sai kết quả.** Gợi ý chung: stress test `n ≤ 30` có thấy được không? Cái gì phải lớn?

**Code lỗi (TypeScript):**
```ts
// Bug 08 · thứ tự duyệt BFS từ `src` (hàng xóm theo id tăng dần), chỉ các nút tới được. Code CÓ LỖI.
export function bfsOrder(n: number, edges: number[][], src: number): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  for (const list of adj) list.sort((x, y) => x - y);
  const seen = new Array<boolean>(n).fill(false);
  seen[src] = true;
  const queue = [src];
  const order: number[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj[u]) {
      if (!seen[v]) {
        seen[v] = true;
        queue.push(v);
      }
    }
  }
  return order;
}
```
**Python:**
```python
# Bug 08 · thứ tự duyệt BFS (hàng xóm tăng dần). Code CÓ LỖI.
def bfs_order(n: int, edges: list[list[int]], src: int) -> list[int]:
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    for lst in adj:
        lst.sort()
    seen = [False] * n
    seen[src] = True
    queue = [src]
    order = []
    while queue:
        u = queue.pop(0)
        order.append(u)
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                queue.append(v)
    return order
```
**Java:**
```java
import java.util.*;

// Bug 08 · thứ tự duyệt BFS (hàng xóm tăng dần). Code CÓ LỖI.
class Solution {
    public int[] bfsOrder(int n, int[][] edges, int src) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        for (List<Integer> l : adj) Collections.sort(l);
        boolean[] seen = new boolean[n];
        seen[src] = true;
        List<Integer> queue = new ArrayList<>();
        queue.add(src);
        List<Integer> order = new ArrayList<>();
        while (!queue.isEmpty()) {
            int u = queue.remove(0);
            order.add(u);
            for (int v : adj.get(u)) if (!seen[v]) { seen[v] = true; queue.add(v); }
        }
        int[] res = new int[order.size()];
        for (int i = 0; i < res.length; i++) res[i] = order.get(i);
        return res;
    }
}
```

---

## Phần tổng kết
1. Bảng: với mỗi bug, **loại** (sai kết quả / hiệu năng / tác dụng phụ / số học) và **đặc điểm generator** bắt được nó.
2. Chọn 2 bug mà stress test ngẫu nhiên "ngây thơ" của bạn *không* bắt được; sửa generator để bắt được.
3. **Câu hỏi quy mô:** `bench` ex08 (bản lỗi qua `--file lessons/P04-testing-stress/bugs/bug08.ts`, đồ thị sao) ở `n = 10³, 10⁴, 5·10⁴`: có "vách đá" ở đâu? Giải thích vì sao tăng `n` gấp 5 từ `10⁴` lên `5·10⁴` có thể làm chậm hàng nghìn lần (người soạn đo rút cạn bằng `shift()`: 1 ms → 2 705 ms).
