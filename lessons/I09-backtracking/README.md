# I09 · Backtracking

## Sau buổi này bạn sẽ
- Viết được khung **choose → explore → unchoose** và vẽ được **cây quyết định** của một bài liệt kê.
- Phân biệt 3 họ bài: **subsets** (có `start`), **permutations** (có `used[]`), **combinations/target** (có `start` + `remain`).
- **Bỏ trùng** bằng sort + skip ngay trong vòng lặp thay vì khử trùng ở cuối; **cắt nhánh** (pruning) để tránh sinh nhánh chết.
- Ước lượng số nút của cây (hàm mũ / giai thừa) và biết khi nào backtracking vẫn an toàn (n nhỏ, đệ quy sâu ≤ n).

## 1. Khung chung

Bài yêu cầu **liệt kê** mọi cấu hình thỏa điều kiện → dựng đáp án từng bước; mỗi bước thử các lựa chọn hợp lệ, đi sâu, rồi **hoàn tác** để thử lựa chọn kế.

```ts
function solve(): Answer[] {
  const res: Answer[] = [];
  const path: Choice[] = [];                 // trạng thái đang dựng — MỘT mảng dùng chung
  const dfs = (state): void => {
    if (isAnswer(state)) { res.push(path.slice()); return; }   // COPY khi ghi đáp án
    for (const c of choices(state)) {
      if (!valid(c)) continue;               // cắt nhánh
      path.push(c);                          // choose
      dfs(next(state, c));                   // explore
      path.pop();                            // unchoose  ← đối xứng chính xác với choose
    }
  };
  dfs(initial);
  return res;
}
```

Cây quyết định của `subsets([1,2,3])` (mỗi nút là một đáp án, cạnh là phần tử được chọn thêm, chỉ đi về phía chỉ số lớn hơn):

```
                     []
          /-1-------/ |2        \3
        [1]          [2]         [3]
       /2  \3         |3
    [1,2]  [1,3]    [2,3]
      |3
   [1,2,3]
```

Vì mỗi nhánh con chỉ được chọn chỉ số **lớn hơn** phần tử vừa chọn, mỗi tập chỉ xuất hiện một lần ([1,2] chứ không có [2,1]).

## 2. Ba khuôn cần thuộc

| Họ bài | Trạng thái | Vòng lặp | Khi nào ghi đáp án |
|---|---|---|---|
| Subsets | `start` | `i = start..n−1`, đệ quy `i + 1` | mọi nút |
| Permutations | `used[]` | `i = 0..n−1`, bỏ `used[i]` | `path.length === n` |
| Combinations / target | `start`, `remain` | `i = start..`, đệ quy `i` (dùng lại) hoặc `i + 1` | `remain === 0` |

Ví dụ phân biệt: dùng lại ứng viên (ex05) đệ quy với `i`; dùng một lần (ex06) đệ quy với `i + 1`.

## 3. Bỏ trùng: sort + skip

Input có phần tử bằng nhau (`[1,2,2]`) → cùng một tập sinh ra từ hai nhánh khác nhau. Cách sạch nhất: **sort**, rồi trong vòng lặp của cùng một tầng:

```ts
if (i > start && a[i] === a[i - 1]) continue;   // subsets, combinations
```

Ý nghĩa: ở tầng này giá trị `a[i]` đã được thử làm "phần tử kế tiếp" rồi (ở chỉ số `i−1`), thử lại chỉ sinh trùng. Nhưng **lấy hai số 2 liên tiếp** vẫn hợp lệ vì ở tầng sau `i === start`. Lỗi kinh điển: viết `i > 0` → mất luôn đáp án `[2,2]`.

Với permutations có trùng: `if (i > 0 && a[i] === a[i-1] && !used[i-1]) continue;` — bản sao đứng trước chưa được dùng nghĩa là ta đang "chen" bản sau lên trước.

> Khử trùng ở cuối bằng `Set` của chuỗi JSON thì **vẫn đúng** nhưng đã sinh ra mọi nhánh trùng: với `permuteUnique` của 10 phần tử chỉ có giá trị 0/1/2, số hoán vị thật là 4 200 còn `10! = 3 628 800`.

## 4. Cắt nhánh (pruning)

Cắt càng sớm càng tốt — mỗi nhánh bị cắt ở độ sâu `d` tiết kiệm cả cây con bên dưới.

- **Sort + `break`** (combination sum): ứng viên đã sort tăng dần; gặp `a[i] > remain` thì mọi số sau cũng vượt → `break`, không phải `continue`.
- **Bất biến** (parentheses): chỉ thêm `)` khi `close < open` → mọi nhánh sinh ra đều hợp lệ, không có nhánh chết, không cần lọc.
- **Kiểm tra tồn tại trước** (word search): board thiếu ký tự word cần → `false` ngay, tránh duyệt `3^L` nhánh trong ca đối kháng "toàn `a`, word = `aaa…ab`".
- **Giới hạn độ dài còn lại** (restore IP): còn lại phải nằm trong `[4−k, 3·(4−k)]` ký tự.
- **Bitmask** (N-Queens): "cột/đường chéo bị chiếm" gói trong 3 số nguyên, tìm ô trống bằng `x & −x` — kiểm tra hợp lệ O(1).

## 5. Độ phức tạp: hàm mũ là bình thường

| Bài | Số đáp án | Thời gian |
|---|---|---|
| subsets | 2ⁿ | O(n · 2ⁿ) |
| permutations | n! | O(n · n!) |
| combinations C(n, k) | C(n, k) | O(k · C(n, k)) |
| parentheses | Cₙ ≈ 4ⁿ / (n√n) (Catalan) | O(n · Cₙ) |
| N-Queens | số nghiệm (n = 12: 14 200) | số nút cây đã cắt (n = 12: 856 189 nút, đếm bằng mã đệ quy ở `solutions.ts`) |

Nguyên tắc: thời gian ≈ **số nút của cây × chi phí mỗi nút**; chi phí ghi đáp án (copy `path`) cũng tính. Vì đáp án đã là hàm mũ, đề luôn cho `n` nhỏ (n ≤ 20 cho subsets, ≤ 10 cho permutations, ≤ 12 cho N-Queens...). Bộ nhớ đệ quy chỉ O(độ sâu) = O(n) nên **không lo tràn stack**, khác với DFS trên đồ thị 10⁵ nút.

### Câu hỏi quy mô (làm trước khi chạy `bench`)
1. `subsets` ở `n = 16` mất ~18 ms (đo thật bên dưới). Dự đoán `n = 20` và `n = 24`. 
2. `totalNQueens` ở `n = 8, 10, 12`: mỗi lần `n` tăng 2, thời gian nhân khoảng bao nhiêu?

Số đo tham khảo của đáp án mẫu (TS, `node tools/bench.ts lessons/I09-backtracking 01 --src solutions`):

| ex | n | median |
|---|---|---|
| 01 subsets | 10 / 16 / 20 | 0,23 ms / 18,3 ms / 357 ms |
| 09 N-Queens | 8 / 10 / 12 | 0,02 ms / 0,46 ms / 11,8 ms |

`subsets`: `n` tăng 4 → 2⁴ = 16 lần số tập, thời gian tăng ~20 lần (đáp án to hơn nên GC và bộ nhớ chen vào). N-Queens: tăng ~25 lần mỗi 2 đơn vị `n` (≈ 5 lần mỗi đơn vị) — mũ, nhưng nền thấp hơn n! rất nhiều nhờ cắt nhánh. Số đo phụ thuộc máy; quan trọng là hình dạng (nhân hằng số khi n tăng 1, không cộng).

## 6. Dấu hiệu nhận biết
"Liệt kê **tất cả**", "mọi cách", "có bao nhiêu cách (n nhỏ ≤ 12–20)", "tồn tại cách đi trên lưới/chuỗi mà phải thử và quay lui", "đặt quân/điền ô sao cho không xung đột". Nếu chỉ hỏi **số** cách / **giá trị tốt nhất** và n lớn → nghĩ tới DP (Tier A), không phải backtracking.

## 7. Bẫy
1. **Quên copy** `path` khi ghi đáp án → kết quả toàn mảng rỗng (vì cuối cùng đã `pop` hết).
2. `choose` mà không có `unchoose` đối xứng (quên `used[i] = false`, quên gỡ `visited`).
3. Nhầm `start` và `used[]`: subsets/combinations dùng `start`; permutations dùng `used[]`.
4. Skip trùng bằng `i > 0` thay vì `i > start`; quên sort trước khi skip.
5. `continue` thay `break` khi đã sort và vượt `remain` (đúng nhưng lãng phí).
6. Word search: dùng lại ô đang đi; sửa board mà không khôi phục.
7. Khử trùng bằng `Set` ở cuối: đúng nhưng đã trả giá cho mọi nhánh trùng — perf sẽ bắt.

## 8. Theo ngôn ngữ

| | TypeScript | Python | Java |
|---|---|---|---|
| Copy path | `path.slice()` / `[...path]` | `path[:]` / `list(path)` | `new ArrayList<>(path)` |
| Hoàn tác | `path.pop()` | `path.pop()` | `path.remove(path.size() - 1)` (không phải `remove(Object)`) |
| Sinh sẵn | – | `itertools.permutations / combinations` (ở phỏng vấn nên tự viết) | – |
| Chuỗi đang dựng | mảng ký tự + `join` | list ký tự + `"".join` | `StringBuilder` + `setLength` |
| Đệ quy sâu | ≤ n nhỏ, an toàn | an toàn | an toàn |

Bẫy riêng:
- **Java:** đừng giữ kết quả ở **field** của `Solution` — object có thể được tái dùng giữa các lần gọi, kết quả lần trước dính sang lần sau (field phải reset hoặc dùng biến cục bộ truyền xuống). `List<List<Integer>>` chứa tham chiếu: copy trước khi `add`. `Arrays.sort(int[])` sort tại chỗ → copy nếu đề cấm sửa input.
- **Python:** tham số mặc định dạng list (`def dfs(path=[])`) dùng chung giữa các lần gọi; `path` truyền xuống dưới dạng `path + [x]` tạo list mới mỗi nút (O(n) mỗi nút nhưng an toàn, khỏi cần unchoose).
- **TS:** `[...path, x]` tạo mảng mới, không cần `pop` nhưng tốn bộ nhớ hơn; `sort()` không có comparator so sánh **chuỗi** (`[10, 9]` thành `[10, 9]`) → luôn `(a, b) => a - b`.

## 9. Đọc tiếp
`dsa-lesson I09` → làm ex01–ex10 → `check` → `bench` ex01/ex09. Backtracking + memoization = DP (Tier A); backtracking trên đồ thị = DFS (I05).
