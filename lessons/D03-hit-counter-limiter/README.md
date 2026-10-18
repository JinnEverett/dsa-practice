# D03 · Hit counter & rate limiter

## Sau buổi này bạn sẽ
- Đếm sự kiện trong **cửa sổ thời gian** với bộ nhớ **không phụ thuộc** số sự kiện (vòng đệm O(300)).
- Cài **rate limiter cửa sổ trượt** chính xác cho từng user, O(1) mỗi lần gọi.
- Chặn tổng bộ nhớ bằng cách **evict user** lâu không dùng (LRU trên `Map`).
- So sánh 4 thuật toán rate limit: fixed window, sliding log, sliding counter, token bucket.

## 1. Cửa sổ thời gian

"300 giây gần nhất tính tới `t`" = các giây `t−299 … t` (đúng 300 giây). Nhầm `t−300` là lỗi kinh điển.

```
t = 305   cửa sổ = [6, 305]
          giây:  5 | 6 7 8 ... 305
                 ✗   ✓ ✓ ✓     ✓
```

**Vòng đệm 300 ô:** giây `s` ánh xạ vào ô `s % 300`. Hai giây cách nhau đúng 300 cùng ô → ô giữ `(giây, đếm)`, gặp giây mới thì ghi đè.

```
ô:      0     1     2   ...  299
giây: [300]  [1]   [2]  ...  [299]      getHits(301): chỉ cộng ô có giây > 301−300 = 1
đếm:  [  4]  [3]   [1]  ...  [  0]
```

## 2. Rate limiter: bốn cách

| | Chính xác? | Bộ nhớ/user | Đặc điểm |
|---|---|---|---|
| Fixed window (đếm theo phút) | ❌ burst gấp đôi tại biên cửa sổ | 2 số | rẻ nhất |
| **Sliding log** (lưu `limit` mốc gần nhất) | ✅ | `limit` số | bài này |
| Sliding window counter (nội suy 2 cửa sổ) | xấp xỉ | 2–3 số | rẻ, sai nhỏ |
| Token bucket (`tokens`, `lastRefill`) | cho burst có kiểm soát | 2 số | phổ biến nhất ngoài đời |

Sliding log với `limit` mốc gần nhất: chỉ cần so mốc **cũ nhất** với `t − W + 1`:
```ts
if (size === limit) {
  if (buf[start] > t - W) return false;   // cũ nhất vẫn trong cửa sổ → đã đủ `limit` request
  start = (start + 1) % limit; size--;    // hết hạn → nhường chỗ
}
buf[(start + size) % limit] = t; size++;  // chỉ ghi request ĐƯỢC PHÉP
```

## 3. Giới hạn bộ nhớ: evict user
Nếu hệ thống có 10⁸ user, giữ lịch sử mọi user là bất khả. Đặt `maxUsers`; user mới vào khi đầy thì đuổi user **lâu không gọi nhất** (LRU, dùng thứ tự chèn của `Map`: `delete` + `set` để "chạm").
Đánh đổi: user bị đuổi mất lịch sử → được phép lại ngay (an toàn về mặt bộ nhớ, hơi lỏng về mặt chặn). Kẻ tấn công dùng nhiều key (ID giả) có thể đẩy user thật ra ngoài → xem DESIGN.md.

## 4. Theo ngôn ngữ

| | TS | Python | Java |
|---|---|---|---|
| Vòng đệm | mảng + `start`, `size` | `collections.deque(maxlen=k)` | `ArrayDeque` hoặc `int[]` |
| LRU user | `Map` (delete + set) | `OrderedDict.move_to_end` | `LinkedHashMap(cap, .75f, true)` |
| Thời gian | số nguyên giây (đề này) | `time.monotonic()` | `System.nanoTime()` |

## 5. Bẫy
1. Cửa sổ `t−300` thay vì `t−299`.
2. Ô vòng còn dữ liệu cũ: đếm phải kiểm tra `times[i] > t − 300`.
3. Ghi cả request bị từ chối vào lịch sử → user bị khóa mãi.
4. Dùng giờ hệ thống (`Date.now()`) làm đầu vào: không tái lập được, và đồng hồ có thể nhảy lùi. Trong thiết kế nhận `t` làm tham số (dễ test).
5. Quên rằng gọi bị từ chối cũng "chạm" user trong LRU.

## 6. Độ phức tạp

| | Time | Space |
|---|---|---|
| HitCounter `hit` / `getHits` | O(1) / O(300) | O(300) |
| Hàng đợi timestamp (ngây thơ khá) | O(1) am. / O(1) am. | O(hit trong cửa sổ) |
| Quét toàn lịch sử (ngây thơ) | O(1) / O(tổng hit) | O(tổng hit) |
| PerUserLimiter `allow` | O(1) | O(maxUsers × limit) |

## 7. Câu hỏi quy mô
Dự đoán, rồi `node tools/bench.ts lessons/D03-hit-counter-limiter 02 --scales s,m,l`: chuyển từ 10⁵ lên 10⁶ lời gọi thì thời gian nhân bao nhiêu? Heap có tăng 10× không? Vì sao (gợi ý: bộ nhớ bị chặn bởi `maxUsers × limit`, không phụ thuộc số lời gọi)?
