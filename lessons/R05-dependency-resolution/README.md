# R05 · Dependency resolution

## Sau buổi này bạn sẽ
- Dùng **topo sort (Kahn)** để quyết định thứ tự khởi tạo module / build / migration, với tie-break **tất định**.
- Báo lỗi vòng phụ thuộc **kèm đường đi** (`A -> B -> C -> A`) thay vì chỉ "có vòng".
- Chia **tầng** để chạy song song và biết thời gian khởi động tối thiểu = số tầng.
- So sánh phiên bản theo **semver** và giải range `^`, `~`, `>=`.

> Đã học thuật toán topo ở I07. Module này là phần *ứng dụng*: tie-break, thông điệp lỗi, quy mô 10⁵ module.

## 1. Mô hình
`deps = [a, b]` ⇒ "a phụ thuộc b" ⇒ cạnh `b → a` (b trước a). Kahn: đếm số phụ thuộc chưa thỏa (`unmet`) của từng module; module `unmet = 0` sẵn sàng; khởi tạo xong `u` thì giảm `unmet` của mọi module phụ thuộc `u`.
```
 log ─► db ─┐
 log ─► cache ─┴─► app          tầng 0: log │ tầng 1: cache, db │ tầng 2: app
```
Nhiều module cùng sẵn sàng ⇒ nhiều thứ tự hợp lệ. Muốn lần chạy nào cũng giống nhau (log, test, cache build) thì **tie-break cố định**: ở đây theo thứ tự khai báo (min-heap theo chỉ số).

## 2. Tìm chu trình mà không đệ quy
Sau Kahn, module còn lại đều còn ≥ 1 phụ thuộc cũng còn lại ⇒ đi theo phụ thuộc đó mãi mãi thì phải lặp một đỉnh; cắt từ lần gặp đầu của đỉnh lặp ra chu trình. O(n + e), **không đệ quy** — rất quan trọng khi chuỗi phụ thuộc dài 10⁵ (đệ quy DFS tràn stack TS ở ~10⁴ tầng; Python mặc định 1000, runner nâng ~12 000).
```
 svc → A → B → A        còn lại sau Kahn: A, B (svc không bóc được vì A còn)
 đi từ svc: svc, A, B, A(lặp) ⇒ chu trình = [A, B]   (svc chỉ dẫn tới vòng, không thuộc vòng)
```

## 3. Thông điệp lỗi hữu ích
NestJS báo lỗi vòng phụ thuộc DI khi khởi động ứng dụng, thường kèm các provider liên quan. Một thông điệp tốt cho người dùng cần: (1) **khép kín**: `A -> B -> C -> A`, (2) **chỉ gồm chu trình**, không gồm đường dẫn dẫn tới nó, (3) hướng mũi tên có nghĩa rõ ("phụ thuộc vào").

## 4. Semver rút gọn
| Range | Ý nghĩa |
|---|---|
| `^1.2.3` | `>=1.2.3 <2.0.0` (major > 0) |
| `^0.2.3` | `>=0.2.3 <0.3.0` (major = 0: khóa minor) |
| `^0.0.3` | `>=0.0.3 <0.0.4` |
| `~1.2.3` | `>=1.2.3 <1.3.0` |
| `>=1.2.3` | từ 1.2.3 trở lên |
| `1.2.3` | đúng bản đó |

So sánh theo **từng thành phần là số**: `"1.10.0"` lớn hơn `"1.9.0"`, nhưng so chuỗi thì ngược lại. Trong thực tế còn prerelease (`1.0.0-beta`), build metadata, range `||`... bài này bỏ qua.

## 5. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Heap theo chỉ số | `Heap` (I04) | `heapq` | `PriorityQueue<Integer>` |
| So phiên bản | mảng 3 số, tự so | `tuple(map(int, v.split('.')))` | `Integer.parseInt` từng phần |
| Chuỗi nối | `join(' -> ')` | `' -> '.join` | `String.join(" -> ", list)` |
| Đệ quy sâu 10⁵ | tràn stack (~10⁴) | `RecursionError` | `StackOverflowError` |

## 6. Bẫy
1. Cạnh lặp (`[a,b]` hai lần): đếm `unmet` và giảm phải nhất quán.
2. Tie-break theo tên thay vì thứ tự khai báo (hoặc không tie-break ⇒ kết quả không ổn định).
3. DFS đệ quy trên chuỗi dài.
4. Chu trình báo sai chiều (đảo "phụ thuộc" thành "được phụ thuộc").
5. Semver: so chuỗi; caret với major 0.
6. Tự phụ thuộc `a → a` là chu trình độ dài 1.

## 7. Độ phức tạp
| | time | space |
|---|---|---|
| resolve | O((n + e) log n) | O(n + e) |
| findCycle | O(n + e) | O(n + e) |
| buildLevels | O(n + e) + sắp tên | O(n + e) |
| maxSatisfying | O(n) | O(1) |

## 8. Câu hỏi quy mô
Monorepo có 10⁵ package, trung bình 5 phụ thuộc. (1) Ước lượng `e` và số lần giảm `unmet`. (2) Số tầng tối thiểu để build nếu có vô hạn máy chính là số tầng — còn nếu chỉ có 64 worker thì cận dưới của thời gian là gì? (3) Dự đoán rồi `bench` ex01 ở `m` và `l`: số mũ có ≈ 1,1 không?
