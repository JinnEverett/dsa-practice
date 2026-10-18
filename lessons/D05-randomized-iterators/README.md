# D05 · RandomizedCollection & iterators

## Sau buổi này bạn sẽ
- Thiết kế multiset có `insert / remove / getRandom` đều **O(1)** bằng *mảng + map vị trí* và thủ thuật **hoán với phần tử cuối** (swap-remove).
- Nói đúng về **phân phối ngẫu nhiên**: `getRandom` phải chọn theo *bội số*, không theo giá trị phân biệt.
- Cài **iterator** lười (lazy): `hasNext / next / peek`, bộ đệm nhìn trước (lookahead), gộp xen kẽ nhiều nguồn bằng queue.
- Hiểu vì sao test cho hành vi ngẫu nhiên phải kiểm *tính hợp lệ + thống kê*, không so từng giá trị.

## 1. Vì sao cần mảng?
`getRandom` đều ⇒ chọn một chỉ số ngẫu nhiên trong mảng liên tục. Hash map không có truy cập ngẫu nhiên theo chỉ số. Vậy:
```
items: [ 4, 7, 4, 9, 4 ]          pos: { 4 → {0,2,4}, 7 → {1}, 9 → {3} }
getRandom: items[rand(5)] → 4 xuất hiện với xác suất 3/5 (đúng bội số)
```

## 2. Swap-remove: xóa giữa mảng O(1)
Muốn xóa phần tử ở chỉ số `i` mà không dịch cả mảng: ghi phần tử **cuối** vào ô `i`, rồi `pop()`.
```
remove(7):  i = 1, last = 4 (ở chỉ số 4)
items: [4, 7, 4, 9, 4] → [4, 4, 4, 9] (ô 1 nhận 4, pop ô 4)
pos[4]: {0,2,4} → bỏ 4, thêm 1 → {0,1,2}        pos[7]: {1} → {} → xóa khóa 7
```
Thứ tự không còn được giữ, nhưng `getRandom` không cần thứ tự. **Bẫy kinh điển:** phần tử cần xóa chính là phần tử cuối (`i === last`) hoặc `val === items[last]` — dễ để lại chỉ số mồ côi. Cách an toàn: xóa `i` khỏi `pos[val]` **trước**, rồi mới chuyển `last` → `i`.

## 3. Kiểm thử hành vi ngẫu nhiên
Không thể so `getRandom()` với một giá trị cố định. Spec của module kiểm:
1. kết quả `insert/remove` đúng (mô phỏng lại bằng một multiset đơn giản);
2. mỗi `getRandom` trả một giá trị **đang có** trong tập;
3. với đợt `getRandom` đủ dài, tần suất mỗi giá trị khớp `bội số / tổng` trong ±6σ. Bài giải chọn theo giá trị phân biệt sẽ thất bại ở bước này.

## 4. Iterator lười
Iterator trả phần tử **theo yêu cầu**, không dựng sẵn toàn bộ. Lợi ích: nguồn rất lớn hoặc vô hạn, đọc từ mạng/đĩa, tính toán đắt.

| Mẫu | Ý tưởng |
|---|---|
| **Peeking** | giữ 1 phần tử đã đọc trước (`cache`) để `peek()` không làm tiến nguồn |
| **Zigzag / round-robin** | queue các nguồn còn phần tử; lấy một nguồn từ đầu hàng, đọc 1 phần tử, nguồn còn thì đẩy lại cuối hàng |
| **Flatten lồng nhau** | stack các iterator con; `hasNext` đào xuống tới khi gặp số (tiếp tục ở D05 mở rộng/LeetCode 341) |

Zigzag bằng queue tự động tổng quát cho **k nguồn** (follow-up kinh điển) mà không đổi code.

## 5. Dấu hiệu nhận biết
"O(1) mỗi thao tác kể cả xóa", "lấy ngẫu nhiên đều", "xóa phần tử bất kỳ khỏi mảng O(1)", "đọc từng phần tử một", "không được gộp sẵn", "xen kẽ các nguồn".

## 6. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Lấy ngẫu nhiên | `Math.floor(Math.random() * n)` | `random.choice(list)` / `random.randrange` | `new Random().nextInt(n)` |
| Tập chỉ số, lấy 1 phần tử bất kỳ | `Set` → `values().next().value` | `set` → `next(iter(s))` | `LinkedHashSet` → `iterator().next()` |
| Iterator | tự cài (`hasNext/next`) hoặc generator `function*` | `__iter__/__next__`, generator `yield` | `Iterator<E>` (`hasNext/next`) |
| Hàng đợi | mảng + `head` | `deque` | `ArrayDeque` |

## 7. Bẫy
1. `Math.random()` theo giá trị phân biệt (`Object.keys`) làm phân phối lệch.
2. Quên xóa khóa `pos[val]` khi Set rỗng ⇒ `insert` sau đó trả `false` sai ("đã có").
3. `insert` phải trả `true` **chỉ khi** giá trị chưa có (kể cả sau khi bị xóa hết trước đó).
4. Peeking: `peek()` đọc nguồn trực tiếp → mất phần tử khi gọi `next()` tiếp.
5. Zigzag gộp sẵn thành mảng: tốn O(tổng) bộ nhớ, hỏng với nguồn vô hạn.
6. Không có Perf cho ex02/ex03 (mỗi thao tác O(1) rất rẻ ở `n = 10⁵`): kiểm tra độ phức tạp **tự giác** — nói to O(1) từng thao tác và bộ nhớ phụ.

## 8. Độ phức tạp
| | insert | remove | getRandom | space |
|---|---|---|---|---|
| `RandomizedCollection` | O(1) | O(1) | O(1) | O(n) |
| `PeekingIterator` | – | `next` O(1) | `peek` O(1) | O(1) phụ |
| `ZigzagIterator` | – | `next` O(1) | `hasNext` O(1) | O(k) cho k nguồn |

🧭 Câu hỏi quy mô: với `10⁶` phần tử, `Map<value, Set<index>>` tốn nhiều RAM hơn mảng thuần bao nhiêu lần? Đoán, rồi `bench` ở scale `l` (cột `heap MB`).

Xem [`DESIGN.md`](./DESIGN.md) cho thiết kế `RandomizedCollection` đầy đủ 7 bước.
