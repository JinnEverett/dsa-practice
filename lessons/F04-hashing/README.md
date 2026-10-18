# F04 · Hashing: Map & Set

## Sau buổi này bạn sẽ
- Biết hash table hoạt động thế nào và vì sao tra cứu là O(1) **trung bình**.
- Dùng thành thạo 4 khuôn: **đếm tần suất**, **"đã gặp chưa"**, **tra phần bù** (two-sum), **gom nhóm theo khóa**.
- Thiết kế khóa cho dữ liệu nhiều trường (tuple, chuỗi chuẩn hóa).
- Biết các bẫy riêng của TS (object làm map), Python (key phải hashable), Java (`equals`/`hashCode`, boxing).

## 1. Hash table hoạt động thế nào

```
key "tan" ──hash()──► 7395 ──% 8──► bucket 3
                                       │
 bucket: 0   1   2   3              ...7
        [ ] [ ] [ ] [("tan",2) → ("eat",1)]   ← va chạm: 2 key cùng bucket, xếp thành chuỗi
```

- `get/set/has/delete`: tính hash → nhảy thẳng tới bucket → O(1) **trung bình**.
- Xấu nhất (mọi key cùng bucket): O(n). Thực tế hiếm, nhưng có tấn công "hash flooding" nhằm vào điều này.
- Bảng đầy quá ngưỡng (load factor) thì **rehash** sang bảng gấp đôi → `set` là O(1) amortized.
- Đổi lấy tốc độ: **không có thứ tự sắp xếp** (muốn min/max/range → sort, heap, cây — học sau), và tốn bộ nhớ hơn mảng.

## 2. Bốn khuôn mẫu

```ts
// (1) Đếm tần suất
const freq = new Map<number, number>();
for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);

// (2) Đã gặp chưa
const seen = new Set<number>();
for (const x of nums) { if (seen.has(x)) return true; seen.add(x); }

// (3) Tra phần bù: cần a + b = target → khi đứng ở b, hỏi "target - b đã gặp ở đâu?"
const idx = new Map<number, number>();
for (let i = 0; i < nums.length; i++) {
  const j = idx.get(target - nums[i]);
  if (j !== undefined) return [j, i];
  idx.set(nums[i], i);
}

// (4) Gom nhóm theo khóa chuẩn hóa
const groups = new Map<string, string[]>();
for (const w of words) {
  const key = [...w].sort().join('');
  (groups.get(key) ?? groups.set(key, []).get(key)!).push(w);
}
```

**Dấu hiệu nhận biết:** "có tồn tại cặp…", "đếm số lần…", "trùng lặp", "xuất hiện trước đó", "gom theo…", đề cho O(n²) brute force mà n = 10⁵.

## 3. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Map | `new Map<K, V>()` | `dict`, `defaultdict(int)`, `Counter` | `HashMap<K, V>` |
| Set | `new Set<T>()` | `set()` | `HashSet<T>` |
| Lấy hoặc mặc định | `m.get(k) ?? 0` | `d.get(k, 0)` / `Counter` tự trả 0 | `m.getOrDefault(k, 0)` |
| Tăng đếm | `m.set(k, (m.get(k) ?? 0) + 1)` | `cnt[k] += 1` | `m.merge(k, 1, Integer::sum)` |
| Khóa nhiều trường | chuỗi `` `${a},${b}` `` hoặc số `a * W + b` | tuple `(a, b)` | `record Key(int a, int b)` / chuỗi / `long a * W + b` |
| Thứ tự duyệt | thứ tự chèn | thứ tự chèn (3.7+) | **không** có thứ tự (`LinkedHashMap` nếu cần) |

## 4. Bẫy

1. **TS — object thường làm map:** key bị ép thành chuỗi (`obj[1]` và `obj['1']` là một), key `__proto__`/`constructor` gây lỗi lạ, `Object.keys` trả chuỗi. → Luôn dùng `Map`/`Set`.
2. **TS/Java — mảng làm khóa:** `map.set([1,2], x)` rồi `map.get([1,2])` → `undefined` (so tham chiếu). Chuyển sang chuỗi/số. Python: `list` không hashable, dùng `tuple`.
3. **Java — `Integer` so bằng `==`:** đúng với −128..127 (cache), sai với số lớn hơn. Dùng `.equals()` hoặc unbox về `int`.
4. **Java — object tự định nghĩa làm khóa** phải override cả `equals` và `hashCode` (hoặc dùng `record`).
5. Quên thứ tự cập nhật trong khuôn (3): thêm `nums[i]` vào map **trước** khi tra → ghép phần tử với chính nó.
6. Sửa Map/Set trong lúc đang duyệt nó (Java ném `ConcurrentModificationException`, Python ném `RuntimeError`).

## 5. Độ phức tạp

| Thao tác | Trung bình | Xấu nhất |
|---|---|---|
| `get`, `set`, `has`, `delete` | O(1) | O(n) |
| duyệt toàn bộ | O(n) | O(n) |
| bộ nhớ | O(n), hằng số lớn hơn mảng nhiều lần | |

Khi khóa là số nguyên nhỏ và liền nhau (0..k), **mảng** thay cho Map nhanh hơn và gọn hơn (xem F03 mảng 26, F01 ex06).
