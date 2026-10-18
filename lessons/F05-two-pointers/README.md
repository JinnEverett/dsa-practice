# F05 · Two pointers

## Sau buổi này bạn sẽ
- Nhận ra khi nào hai con trỏ thay được hai vòng lặp lồng nhau (O(n²) → O(n)).
- Viết thành thạo 3 dạng: **ngược chiều**, **cùng chiều (đọc/ghi)**, **trên hai mảng**.
- Sửa mảng tại chỗ với O(1) bộ nhớ.
- Giải 3Sum đúng (không trùng bộ ba).

## 1. Ba dạng

### a) Ngược chiều — mảng đã sort (hoặc đối xứng)
```
nums = [1, 3, 4, 6, 9]   target = 10
        i →           ← j
 1 + 9 = 10 ✅
 tổng < target → i++ (cần lớn hơn)
 tổng > target → j-- (cần nhỏ hơn)
```
Vì sao đúng: khi `nums[i] + nums[j] > target`, mọi cặp `(i', j)` với `i' > i` còn lớn hơn → loại hẳn `j`. Mỗi bước loại một phần tử ⇒ tối đa n bước.

### b) Cùng chiều — con trỏ đọc `r` và con trỏ ghi `w`
```
xóa trùng trong mảng đã sort: [1, 1, 2, 2, 3]
 w=1                                   bất biến: nums[0..w) là kết quả, không trùng
 r=1: 1 == nums[w-1] → bỏ
 r=2: 2 ≠ 1 → nums[w++] = 2           [1, 2, 2, 2, 3]
 r=3: 2 == 2 → bỏ
 r=4: 3 ≠ 2 → nums[w++] = 3           [1, 2, 3, 2, 3]  → k = 3
```

### c) Trên hai mảng đã sort — merge
```
a = [1, 4, 7]   b = [2, 3, 8]
     i            j            lấy nhỏ hơn, tiến con trỏ đó → [1, 2, 3, 4, 7, 8]
```
Merge **từ cuối** khi phải ghi vào chính mảng `a` (đã có chỗ trống ở cuối) để không đè dữ liệu chưa đọc.

## 2. Template

```ts
// ngược chiều
let i = 0, j = nums.length - 1;
while (i < j) {
  if (/* đủ điều kiện */) { /* ghi nhận */ i++; j--; }
  else if (/* cần tăng */) i++;
  else j--;
}

// đọc/ghi
let w = 0;
for (let r = 0; r < nums.length; r++) {
  if (/* giữ nums[r] */) nums[w++] = nums[r];
}
// nums[0..w) là kết quả
```

## 3. 3Sum = sort + (cố định 1 phần tử) + two pointers
```
sort: [-4, -1, -1, 0, 1, 2]
 k=0 (-4): tìm cặp tổng 4 trong [-1,-1,0,1,2] → không có
 k=1 (-1): tìm cặp tổng 1 → (-1, 2), (0, 1)
 k=2 (-1): nums[k] == nums[k-1] → BỎ QUA (tránh trùng bộ ba)
```
Sau khi tìm được một cặp, tiến `i` qua mọi giá trị trùng (và `j` tương tự). Tổng O(n²).

## 4. Dutch national flag (3 con trỏ)
Sắp mảng chỉ gồm 0/1/2 trong một lượt: `lo` (ranh giới 0), `mid` (đang xét), `hi` (ranh giới 2).
```
[0 0 | 1 1 | ? ? ? | 2 2]
      lo    mid  hi
```

## 5. Dấu hiệu nhận biết
- Mảng **đã sort** + tìm cặp/bộ ba có tổng/hiệu.
- "Tại chỗ", "O(1) bộ nhớ", "xóa/di chuyển phần tử".
- Palindrome, đảo ngược, so sánh từ hai đầu.
- Hai mảng/chuỗi đã sort cần merge/so khớp.

## 6. Bẫy
1. Dùng ngược chiều trên mảng **chưa sort** → sai (lý do loại phần tử không còn đúng).
2. 3Sum: quên bỏ trùng ở cả `k`, `i`, `j` → bộ ba lặp.
3. `while (i <= j)` vs `while (i < j)`: cặp cần 2 phần tử khác nhau → `i < j`.
4. Merge vào chính mảng mà ghi từ đầu → đè mất phần tử chưa đọc.
5. Python: `nums = [...]` gán lại tên **không** sửa mảng của người gọi; phải `nums[:] = ...` hoặc gán từng phần tử.

## 7. Độ phức tạp

| Dạng | Time | Space |
|---|---|---|
| ngược chiều / đọc-ghi / merge | O(n) | O(1) |
| 3Sum | O(n²) (sort O(n log n) không đáng kể) | O(1) ngoài output |
