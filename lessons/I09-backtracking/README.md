# I09 · Backtracking

## Sau buổi này bạn sẽ
- Viết khung **choose → explore → unchoose** cho subsets, permutations, combinations.
- Bỏ **kết quả trùng** bằng `sort + skip` thay vì khử trùng sau cùng.
- **Cắt nhánh (pruning)** để thu hẹp cây tìm kiếm; ước lượng được **độ phức tạp hàm mũ** và biết khi nào backtracking là hợp lý.

## 1. Cây quyết định

Backtracking là DFS trên **cây các lựa chọn**: ở mỗi nút ta thử từng lựa chọn khả dĩ, đi sâu, rồi **hoàn tác** để thử lựa chọn kế. Dùng khi phải **liệt kê** (hoặc đếm / tìm một) mọi cấu hình thỏa ràng buộc và không có cấu trúc để đi tắt (DP, greedy).

```
subsets([1,2,3]) — mỗi nút là một tập con (ghi nhận ngay khi vào):

                     []
          /           |          \
       [1]           [2]          [3]
      /    \           \
  [1,2]   [1,3]       [2,3]
    |
 [1,2,3]
```

## 2. Khung chung

```ts
function solve(): R[] {
  const res: R[] = [];
  const path: X[] = [];                    // MỘT mảng dùng chung cho cả cuộc duyệt
  const go = (/* trạng thái: start, còn lại, ... */) => {
    if (/* đạt đích */) { res.push(path.slice()); return; }   // slice: sao chép!
    for (const choice of /* các lựa chọn hợp lệ */) {
      path.push(choice);                   // choose
      go(/* trạng thái mới */);            // explore
      path.pop();                          // unchoose
    }
  };
  go(/* khởi đầu */);
  return res;
}
```

Ba câu hỏi để viết mọi bài backtracking: **(1)** đích là gì? **(2)** các lựa chọn ở mỗi bước? **(3)** làm sao tránh lặp (thứ tự chỉ số `start` / mảng `used` / sort + skip)?

## 3. Ba họ bài

| Họ | Lựa chọn mỗi tầng | Chống lặp | Số lá |
|---|---|---|---|
| Tập con / tổ hợp | phần tử có chỉ số ≥ `start` | `start = i + 1` (hoặc `i` nếu dùng lại) | 2ⁿ / C(n, k) |
| Hoán vị | phần tử chưa dùng (`used[i]`) | `used` | n! |
| Điền ô / đặt quân | giá trị hợp lệ cho ô tiếp theo | kiểm tra ràng buộc | tùy ràng buộc |

**Số trùng (sort + skip):** sắp xếp rồi, ở **cùng một tầng**, bỏ qua `a[i]` nếu bằng `a[i-1]`.
- Tập con / tổ hợp: `if (i > start && a[i] === a[i-1]) continue`. Điều kiện là `i > start`, không phải `i > 0`: số bằng nhau vẫn được dùng ở các tầng **sâu hơn**.
- Hoán vị: `if (used[i] || (i > 0 && a[i] === a[i-1] && !used[i-1])) continue` — ép các số bằng nhau đi theo đúng thứ tự chỉ số.

## 4. Cắt nhánh (pruning)

Cây có thể khổng lồ; mỗi lần phát hiện một nhánh **chắc chắn vô vọng** là cắt cả cây con.

| Bài | Cắt gì |
|---|---|
| combinationSum | sort; `a[i] > còn lại` ⇒ `break` (không chỉ `continue`) |
| generateParenthesis | chỉ thêm `(` khi `open < n`, `)` khi `close < open` — không sinh nhánh cụt |
| restoreIp | số ký tự còn lại phải nằm trong [3·.., 3·..] của số đoạn còn thiếu |
| exist (word search) | đếm chữ cái: bảng thiếu chữ nào của từ ⇒ `false` ngay; có thể tìm từ đảo ngược nếu chữ cuối hiếm hơn chữ đầu |
| N-Queens | bitmask cột / hai đường chéo: kiểm tra xung đột O(1) |

Quy tắc: kiểm tra ràng buộc **càng sớm càng tốt** (khi chọn, không phải khi đến lá).

## 5. Độ phức tạp là hàm mũ — và đó là bình thường

Đáp án của bài backtracking thường **bản thân đã có kích thước hàm mũ**, nên không thể nhanh hơn. Số liệu đo trên máy soạn bài (Node 24):

| Bài | Kích thước đầu ra | Thời gian ref |
|---|---|---|
| subsets, n = 16 | 2¹⁶ = 65 536 tập | ~6 ms |
| permute, n = 9 | 9! = 362 880 hoán vị | ~65 ms |
| generateParenthesis, n = 12 | Catalan(12) = 208 012 chuỗi | ~150 ms |
| totalNQueens, n = 13 | 73 712 nghiệm | ~60 ms |

Mỗi lần `n` tăng 1, số hoán vị tăng ~n lần, và thời gian còn tăng nhanh hơn khi bộ nhớ cho các mảng kết quả phình ra: `bench` của ref ở `n = 6 … 10` cho 0,09 → 0,7 → 4,7 → 60 → 1 800 ms (n = 10: 3,6 triệu mảng, ~560 MB heap). Vì vậy ràng buộc đề cho backtracking luôn nhỏ (n ≤ 10–20).

**Khi nào backtracking sai công cụ?** Nếu chỉ cần **đếm** hoặc **tối ưu** (đếm số tập con tổng = target; chọn tập tốt nhất) thì thường có DP (A01–A05). Backtracking dành cho khi phải **liệt kê**.

## 6. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Sao chép đường đi | `path.slice()` | `path[:]` / `list(path)` | `new ArrayList<>(path)` |
| Hoàn tác | `path.pop()` | `path.pop()` | `path.remove(path.size() - 1)` — **cẩn thận** `remove(int)` vs `remove(Object)` |
| Đã dùng | `Uint8Array` / `boolean[]` | `[False] * n` | `boolean[]` |
| Tích sẵn | không có | `itertools.permutations/combinations` (để kiểm tra, không dùng khi luyện) | không có |
| Độ sâu đệ quy | ≤ n nhỏ → an toàn | an toàn | an toàn |

## 7. Dấu hiệu nhận biết
"liệt kê **tất cả**", "mọi cách", "mọi tập con / hoán vị / tổ hợp", "sinh các chuỗi hợp lệ", "đặt các quân sao cho không xung đột", "tìm đường trong lưới mà không dùng lại ô", ràng buộc `n ≤ 10…20`.

## 8. Bẫy
1. **Quên sao chép** `path` khi ghi nhận ⇒ mọi đáp án cùng là một mảng (rỗng cuối cùng).
2. Quên **unchoose** (`used[i] = 0`, `path.pop()`, trả lại ô trong word search).
3. Khử trùng **sau cùng** bằng `Set` — đúng nhưng sinh 2ⁿ / n! nhánh vô ích; skip khi sinh.
4. `i > 0` thay vì `i > start` khi bỏ số trùng trong tập con / tổ hợp.
5. `combinationSum`: đệ quy `go(i + 1)` (không dùng lại được) hay `go(i)` (dùng lại) — nhầm ⇒ thiếu / thừa đáp án.
6. Word search: không đếm chữ cái, bảng toàn `'a'` và từ `"aaaa…ab"` làm DFS chạy gần như vô hạn.
7. Java: `list.remove(int index)` vs `list.remove(Integer)`; `+` trong chuỗi tạo nhiều đối tượng.
8. Truyền chuỗi con / mảng mới xuống đệ quy ở mỗi bước ⇒ thêm hệ số O(n).

## 9. Độ phức tạp
`O(n · 2ⁿ)` subsets, `O(n · n!)` permutations, `O(n · Catalan(n))` ngoặc; bộ nhớ phụ O(n) (độ sâu) ngoài đầu ra.
