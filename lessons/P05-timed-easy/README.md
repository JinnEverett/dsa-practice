# P05 · Timed set: Easy

## Mục tiêu
Giải **6 bài mức Easy**, mỗi bài **15 phút**, **không gợi ý** trong giờ, như vòng điện thoại/online assessment. Mục đích: ổn định tốc độ + chất lượng khi có đồng hồ, không phải học kiến thức mới.

**Pass:** ≥ 5/6 bài qua `check` **trong giờ**.

## Luật
1. Bấm giờ 15 phút/bài (đồng hồ thật). Hết giờ: nộp những gì đang có, ghi lại, sang bài sau. Chỉ tính ✅ nếu `check` qua *trong* 15 phút.
2. **Không xin gợi ý** (H1/H2/H3) trong giờ. Sau giờ vẫn được hỏi coach, ghi vào tracker là "quá giờ".
3. Theo khung P02: 2–3 phút đầu hỏi lại đề + ví dụ + nêu Big-O dự kiến (nói thành tiếng/ghi ra giấy) **trước** khi code.
4. Dùng ngôn ngữ nào cũng được (chọn từng bài). Khung: `node tools/scaffold.ts lessons/P05-timed-easy --lang ts|py|java`.
5. Không đọc `solutions.ts` trước khi `check` ✅ hoặc hết giờ.
6. Thứ tự bài: tùy bạn (trong phỏng vấn thật bạn cũng chọn được). Ghi thời gian từng bài vào `answers/p05.md`.

## Mẫu nhật ký (answers/p05.md)
```md
| Bài | Bắt đầu | Kết thúc | Qua check? | Ngôn ngữ | Pattern | Big-O | Ghi chú (bug, bẫy) |
```

## Chiến lược 15 phút
| Phút | Việc |
|---|---|
| 0–3 | Đọc kỹ, hỏi lại ràng buộc (n, giá trị, rỗng), 1 ví dụ + 1 edge |
| 3–5 | Brute force + Big-O; nói pattern tối ưu |
| 5–11 | Code |
| 11–14 | Dry-run ví dụ + edge, rồi `check` |
| 14–15 | Sửa nốt / ghi chú |

Nếu sau 8 phút chưa có hướng: chuyển sang bài khác rồi quay lại (nhưng ghi nhận là bạn đã dùng 8 phút).

## Pattern trong set này
Boyer–Moore voting · quét một lượt giữ min · hai con trỏ · gom đoạn liên tiếp · monotonic stack + hash map · đếm tần suất + chẵn/lẻ. Nếu bạn không nhận ra pattern ngay, quay lại P01.

## Theo ngôn ngữ
| | TS | Python | Java |
|---|---|---|---|
| Hay vấp | `sort()` mặc định so chuỗi; `Map` thứ tự chèn | `Counter`, `//` với số âm | `int` tràn (+1 ở `2³¹ − 1`); `==` trên `String` |

## Bẫy
1. Nhảy vào code khi chưa nêu Big-O.
2. Quên input rỗng / một phần tử.
3. Tràn số ở biên (`MAX_INT + 1`).
4. Dành quá 15 phút cho một bài vì "sắp xong".

## Câu hỏi quy mô
Chọn một bài bạn giải O(n) và tự hỏi: bản brute O(n²) của nó chạy bao lâu ở `n = 10⁵`? Chạy `bench` bản của bạn ở `s,m,l` và kiểm tra số mũ ≈ 1.
