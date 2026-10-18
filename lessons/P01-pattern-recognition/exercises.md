# P01 · 20 đề nhận dạng pattern

**Cách làm:** mỗi đề dành ~90 giây. **Không viết code.** Tạo file `lessons/P01-pattern-recognition/answers/p01.md` theo mẫu:

```md
## 01
- Pattern: …
- Big-O: time O(…), space O(…)
- Từ khóa/ràng buộc nhận ra: …
```

**Pass:** đúng hướng ≥ 16/20. Coach đối chiếu bằng `solutions.md` *sau khi* bạn nộp (không dùng `check`).

> Mọi đề dưới đây chỉ nêu bài toán và ràng buộc; bạn không cần cài đặt. Nếu thấy đề thiếu/chưa chặt, hãy phản biện — đó cũng là kỹ năng.

---

**01.** Nhật ký giao dịch có `n ≤ 10⁵` số nguyên (không sắp). Cho số `k`, đếm số **cặp chỉ số** `i < j` có `a[i] + a[j] = k`.

**02.** Mảng `n ≤ 10⁶` số nguyên **đã sắp tăng**. Tìm cặp (hai phần tử khác vị trí) có tổng bằng `k`; bộ nhớ phụ chỉ được O(1).

**03.** Chuỗi `s` dài `n ≤ 10⁵`. Tìm độ dài đoạn liên tiếp dài nhất mà **không có hai ký tự trùng nhau**.

**04.** Mảng `n ≤ 2·10⁵` số nguyên, **có thể âm**, và số `k`. Đếm số mảng con liên tiếp có tổng đúng bằng `k`.

**05.** Có `n ≤ 10⁵` hộp hàng, hộp `i` cần `a[i] ≤ 10⁹` phút để bốc dỡ. Một công nhân bốc được `x` phút mỗi lượt, mỗi lượt chỉ làm trên một hộp và nghỉ hết lượt dù hộp xong sớm. Hạn chót là `h` lượt. Tìm `x` nhỏ nhất để kịp hạn.

**06.** `n ≤ 10⁵` khoảng `[start, end]` (các số nguyên ≤ 10⁹), không sắp. Gộp các khoảng chồng nhau thành tập khoảng rời nhau.

**07.** Luồng dữ liệu `n ≤ 10⁶` từ khóa tìm kiếm. Trả `k ≤ 10` từ khóa xuất hiện nhiều nhất.

**08.** Mảng nhiệt độ hàng ngày `n ≤ 10⁵`. Với mỗi ngày, cho biết sau bao nhiêu ngày thì có ngày **nóng hơn** (0 nếu không có).

**09.** Bản đồ kho dạng lưới `1000 × 1000` có ô trống và ô tường, robot đi 4 hướng, mỗi bước một ô. Tìm **số bước ít nhất** từ ô xuất phát tới ô đích.

**10.** Lưới `1000 × 1000` các ô `0/1`. Đếm số **vùng** gồm các ô `1` kề nhau theo 4 hướng.

**11.** Có `n ≤ 10⁵` gói phần mềm và `m ≤ 2·10⁵` ràng buộc "gói A phải cài trước gói B". Trả một thứ tự cài hợp lệ, hoặc báo không có.

**12.** `n ≤ 2·10⁵` máy chủ. Có `q ≤ 2·10⁵` thao tác xen kẽ: "nối cáp giữa máy `u` và `v`" và "hai máy `u`, `v` hiện có thông với nhau không?".

**13.** Cho `n ≤ 8`. Sinh mọi chuỗi gồm `n` cặp ngoặc tròn **hợp lệ**.

**14.** Số cách leo `n ≤ 10⁵` bậc thang khi mỗi bước leo 1, 2 hoặc 3 bậc; in kết quả theo mod `10⁹ + 7`.

**15.** Mảng `n ≤ 200` số nguyên dương, mỗi số ≤ 100. Có chia được thành **hai nhóm tổng bằng nhau** không?

**16.** Hai chuỗi độ dài ≤ 2000. Tìm độ dài **dãy con chung** dài nhất (các ký tự không cần liên tiếp).

**17.** Từ điển `10⁵` từ; có `10⁵` truy vấn, mỗi truy vấn cho một **tiền tố** và hỏi 3 từ thường dùng nhất bắt đầu bằng tiền tố đó.

**18.** Mảng `n ≤ 10⁶` số nguyên, mọi giá trị xuất hiện **đúng hai lần** trừ một giá trị xuất hiện đúng một lần. Tìm giá trị đó với bộ nhớ O(1).

**19.** Mạng đường có `V ≤ 10⁵` nút và `E ≤ 2·10⁵` cạnh, mỗi cạnh có thời gian đi `≥ 0`. Tìm thời gian ngắn nhất từ nút `s` tới mọi nút khác.

**20.** Mảng `n ≤ 10⁵`. Có `q ≤ 10⁵` thao tác xen kẽ: "cộng `v` vào phần tử `i`" và "tổng các phần tử trong `[l, r]`".

---

## Mẫu tự đánh giá
Sau khi coach chấm, ghi 3 đề sai/nhầm nhiều nhất vào `progress/weaknesses.md` (coach làm): *đề số · bạn đã chọn gì · đáp án · từ khóa bị bỏ sót*.

**Câu hỏi quy mô:** chọn 2 đề bất kỳ; nếu `n` tăng 10× thì cách của bạn chậm đi bao nhiêu lần? Có đề nào mà đáp án đúng ở `n = 10³` nhưng sai (quá chậm) ở `n = 10⁵` không?
