# R05 · Bài tập

Tạo khung: `node tools/scaffold.ts lessons/R05-dependency-resolution [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/R05-dependency-resolution 01`

**Pass:** 4/5 bài qua `check` (nên có ex01 và ex02).

Quy ước chung: `modules` là danh sách tên **khác nhau** (khai báo theo thứ tự); `deps[i] = [a, b]` nghĩa là **a phụ thuộc b** (b phải xong trước a). Mọi tên trong `deps` đều có trong `modules`; cạnh có thể lặp; tự phụ thuộc `[a, a]` hợp lệ (là một chu trình). `0 ≤ n ≤ 10⁵`, `0 ≤ |deps| ≤ 2·10⁵`, tên ≤ 20 ký tự.

---

## 🟢 Cơ bản

### ex01 · Thứ tự khởi tạo module
Trả thứ tự khởi tạo sao cho mọi phụ thuộc đứng trước. Nhiều module cùng sẵn sàng thì chọn module **đứng trước nhất trong `modules`** (kết quả duy nhất). Có chu trình → `[]`.
```java
List<String> resolve(String[] modules, String[][] deps)
```
- Ví dụ: `["app","db","cache","log"]` với `deps=[[app,db],[app,cache],[db,log],[cache,log]]` → `["log","db","cache","app"]` · `["b","a"]`, `[]` → `["b","a"]`.

### ex02 · Tìm một chu trình
Nếu có chu trình, trả **một** chu trình `[x0, …, x(k−1)]`: `x_i` phụ thuộc `x_(i+1)` và `x(k−1)` phụ thuộc `x0`, các đỉnh khác nhau (không lặp `x0` ở cuối). Không có chu trình → `[]`. Mọi chu trình hợp lệ đều được chấp nhận.
```java
List<String> findCycle(String[] modules, String[][] deps)
```
- Ví dụ: `a→b→c→a` → `["a","b","c"]` (hoặc phép quay) · `[a,a]` → `["a"]`.
- **Cảnh báo quy mô:** có test chuỗi phụ thuộc dài ~10⁵ — DFS đệ quy sẽ tràn stack. Dùng Kahn + đi theo phụ thuộc còn lại, hoặc DFS lặp.

### ex03 · Chia tầng khởi tạo song song
Tầng của module = 0 nếu không phụ thuộc gì, ngược lại `1 + max(tầng của các phụ thuộc)`. Trả danh sách tầng; trong mỗi tầng xếp tên **tăng dần** (theo mã ký tự). Có chu trình → `[]`.
```java
List<List<String>> buildLevels(String[] modules, String[][] deps)
```
- Ví dụ: ví dụ ex01 → `[["log"],["cache","db"],["app"]]`.
- Perf có đồ thị là một **đường dài n tầng**; bản lặp "relax cho tới khi ổn định" sẽ quá giờ.

---

## 🟡 Kết hợp

### ex04 · 🔴 Khởi tạo provider kiểu NestJS, báo vòng kèm đường đi
Framework DI cần khởi tạo `providers` theo phụ thuộc. Nếu hợp lệ trả **một thứ tự bất kỳ** thỏa mọi phụ thuộc. Nếu có vòng, trả **đúng một phần tử** `"Circular dependency: A -> B -> C -> A"`: một chu trình hợp lệ (mỗi mũi tên là "phụ thuộc vào"), khép kín (đỉnh đầu lặp lại ở cuối), không chứa đường dẫn dẫn tới vòng.
```java
List<String> initProviders(String[] providers, String[][] deps)
```
- Ví dụ: `A→B→C→A` → `["Circular dependency: A -> B -> C -> A"]` (hoặc phép quay) · `svc→A, A→B, B→B` → `["Circular dependency: B -> B"]`.

---

## 🔴 Thực tế

### ex05 · 🔴 Phiên bản lớn nhất thỏa range (semver rút gọn)
`npm`/`cargo` chọn bản cài đặt từ một range. Phiên bản là `X.Y.Z` (số nguyên, `0 ≤ X, Y, Z ≤ 10⁶`, không số 0 đứng đầu). Range là một trong: `^X.Y.Z`, `~X.Y.Z`, `>=X.Y.Z` hoặc `X.Y.Z` (đúng bản đó) với ý nghĩa ở README mục 4. Trả phiên bản **lớn nhất** trong `versions` thỏa range (chuỗi như xuất hiện trong input), không có → `""`.
```java
String maxSatisfying(String[] versions, String range)
```
- Ràng buộc: `0 ≤ |versions| ≤ 10⁵` (có thể trùng).
- Ví dụ: `["1.2.3","1.9.0","1.10.0","2.0.0"], "^1.2.3"` → `"1.10.0"` · `["0.2.5","0.2.9","0.3.0"], "^0.2.3"` → `"0.2.9"` · `["1.0.0"], "^3.0.0"` → `""`.
- **Câu hỏi quy mô:** (1) Vì sao so chuỗi sai? Cho một phản ví dụ nhỏ. (2) Với `10⁵` module trong monorepo, dự đoán rồi `bench` ex01: tỉ lệ thời gian `m`→`l`?
