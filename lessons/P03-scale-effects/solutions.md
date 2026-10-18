# P03 · Số đo tham chiếu & giải thích (spoiler — chỉ mở sau khi bạn đã ghi kết quả của mình)

**Máy soạn:** Node 24.22.0, container cloud 4 vCPU. `bench` lấy median của 5 lần chạy sau khi khởi động JIT. Số tuyệt đối đổi theo máy (±20% giữa các lần chạy); chỉ **tỉ lệ và xu hướng** đáng tin. Mỗi hàm tự tạo dữ liệu nên số đo *gồm cả* tạo dữ liệu.

> Cột `heap` của bench là mức tăng `heapUsed` lớn nhất trong một lần chạy. **Typed array nằm ngoài heap JS** (ArrayBuffer) nên hiện ≈ 0 — bộ nhớ thật của chúng là `4·n`, `8·n` byte… (tính tay).

## 01 · `number[]` vs `Int32Array`
| n | `sumNumberArray` | `sumInt32Array` | tỉ lệ | heap A |
|---|---|---|---|---|
| 10⁵ | 1,6 ms | 0,25 ms | 6× | 2,8 MB |
| 10⁶ | 16,9 ms | 3,3 ms | 5× | 19,4 MB |
| 10⁷ | 244,5 ms | 41,4 ms | 6× | 250,9 MB |

**Giải thích:** `Int32Array` là một khối bộ nhớ liên tục 4 byte/phần tử, không cần kiểm tra kiểu, không tăng dần (`push` phải cấp phát lại và sao chép khi hết chỗ). `number[]` chứa số trong store tổng quát của V8 (8 byte/phần tử trở lên) và tăng dần bằng `push` — heap đỉnh ≈ 25 byte/phần tử ở 10⁷ vì gồm các bản sao khi tăng. Typed array: đúng 40 MB cho 10⁷ phần tử.

## 02 · Bảng đếm: Map vs mảng vs Object (1000 khóa)
| n | `countWithMap` | `countWithArray` | `countWithObject` |
|---|---|---|---|
| 10⁵ | 3,2 ms | 0,45 ms | 1,3 ms |
| 10⁶ | 24,5 ms | 1,6 ms | 9,1 ms |

Ở 10⁶: Map chậm hơn mảng ≈ **15×**, Object chậm hơn ≈ **6×**.
**Giải thích:** mảng chỉ số là phép truy cập bộ nhớ trực tiếp; `Map` phải băm khóa, so sánh, có thể rehash; `Object` với khóa số nhỏ dùng được "elements" dạng mảng nhưng vẫn qua nhiều tầng kiểm tra. Khi miền khóa nhỏ và biết trước → mảng. Khi khóa thưa/không biết miền → `Map`. `Object` làm bảng đếm: khóa chuỗi hóa, thứ tự duyệt đặc biệt (khóa số tăng dần trước), nguy cơ `__proto__` — đừng dùng cho dữ liệu người dùng.

## 03 · AoS vs SoA (5 bước cập nhật)
| n | `updateAoS` | `updateSoA` | tỉ lệ | heap A |
|---|---|---|---|---|
| 10⁵ | 10,8 ms | 2,8 ms | 3,9× | 10,0 MB |
| 10⁶ | 141,1 ms | 22,9 ms | 6,2× | 89,4 MB |

**Giải thích:** AoS là mảng con trỏ tới đối tượng nằm rải rác (mỗi bước đọc = một lần nhảy bộ nhớ, đối tượng 4 trường ≈ 56 byte + con trỏ); SoA đọc tuần tự 4 mảng `Float64Array` liên tục (prefetch + cache line đầy đủ). Khoảng cách **tăng theo n** vì khi dữ liệu vượt cache L2/L3, đối tượng rải rác chịu cache miss.

## 04 · Cấp phát đối tượng trong vòng lặp nóng
| n | `sumManhattanAlloc` | `sumManhattanInline` | tỉ lệ |
|---|---|---|---|
| 10⁵ | 0,42 ms | 0,21 ms | 2× |
| 10⁶ | 2,6 ms | 1,4 ms | 1,9× |

**Giải thích:** chỉ chậm ≈ 2×, heap ≈ 0: TurboFan dùng **escape analysis** loại bỏ cấp phát vì các `{x, y}` không thoát ra khỏi hàm. Bài học: *đừng tối ưu sớm* kiểu "tránh mọi object nhỏ"; nhưng khi đối tượng *thoát* (đẩy vào mảng, trả về) thì cấp phát thật xảy ra và GC xuất hiện (so 03: 89 MB).

## 05 · Holey vs packed — kết quả ngược trực giác
| n | `fillHoley` (`new Array(n)`) | `fillPacked` (`push`) | tỉ lệ | heap |
|---|---|---|---|---|
| 10⁶ | 4,3 ms | 19,9 ms | **packed chậm hơn 4,6×** | 7,2 vs 19,4 MB |
| 10⁷ | 76,0 ms | 380,2 ms | packed chậm hơn 5× | 72,9 vs 250,9 MB |

**Giải thích:** hai biến thể khác nhau không chỉ ở "holey": `new Array(n)` **cấp phát trước đúng n ô**, còn `push` phải tăng dung lượng nhiều lần và sao chép (đỉnh heap gấp ≈ 3,5×). Lợi ích cấp phát trước lấn át chi phí kiểm tra lỗ khi đọc. Muốn đo riêng ảnh hưởng của "holey", phải so với một bản packed *cũng* cấp phát trước (ví dụ `Array.from({length: n}, …)`). Bài học: **thí nghiệm có biến gây nhiễu** — luôn tự hỏi "hai bên còn khác nhau ở điểm nào nữa?". Quy tắc thực dụng: biết trước kích thước thì cấp phát trước (hoặc dùng typed array); đừng xóa phần tử giữa mảng bằng `delete`.

## 06 · Đệ quy sâu 5000 vs vòng lặp
| n (tổng số bước) | `sumRecursive` | `sumLoop` | tỉ lệ |
|---|---|---|---|
| 10⁶ | 5,8 ms | 0,81 ms | 7× |
| 10⁷ | 57,9 ms | 3,5 ms | 17× |

**Giải thích:** mỗi tầng đệ quy = một khung gọi (tham số, địa chỉ trả về, ghi nhận stack); vòng lặp là một phép cộng trong thanh ghi (loop còn được tối ưu mạnh). Cả hai đều tuyến tính. Ngoài chi phí còn có **giới hạn**: trên máy soạn, hàm 1 tham số tràn stack ở ≈ **9 900 tầng**, hàm 4 tham số ở ≈ **6 800 tầng** (stack mặc định của Node ~1 MB) — nên DFS đệ quy trên lưới/chuỗi 10⁵ phần tử là lỗi, không phải chậm. (Python cùng thử nghiệm 200×5000: đệ quy 102 ms vs vòng lặp 49 ms, ≈ 2×, nhưng giới hạn mặc định chỉ 1000 tầng.)

## 07 · `+=` vs `join`
| n | `buildPlus` | `buildJoin` | heap |
|---|---|---|---|
| 10⁵ | 3,4 ms | 13,8 ms | 5,1 vs 8,3 MB |
| 10⁶ | 18,8 ms | 58,7 ms | 47,4 vs 91,2 MB |

**Giải thích:** V8 biểu diễn `a + b` bằng **rope** (cây các đoạn, không sao chép), nên `+=` liên tục là O(1) mỗi lần và *nhanh hơn* `join` (cần mảng trung gian). Rope bị "làm phẳng" khi cần đọc ký tự/so sánh/ghi ra — lúc đó mới trả chi phí. Lời khuyên "dùng join" xuất phát từ các engine cũ và từ Java/Python (xem dưới). Quy tắc: viết cách dễ đọc, đo nếu nghi ngờ.
- Java (đo thô trên JVM của máy soạn, n = 10⁵): `String +=` **1 134 ms** vs `StringBuilder` **2,0 ms**. Python: CPython tối ưu `s += t` trong một số trường hợp, nhưng không được đảm bảo — dùng `''.join`.

## 08 · Sort
| n | `sortComparator` | `sortTyped` (`Float64Array.sort()`) | `sortDefaultString` (`sort()` mặc định) |
|---|---|---|---|
| 10⁵ | 20,6 ms | 9,9 ms | 26,8 ms |
| 10⁶ | 252,5 ms | 110,7 ms | 316,8 ms |

**Giải thích:** typed sort không gọi callback so sánh và so sánh số trực tiếp (nhanh hơn ≈ **2,3×**). `sort()` mặc định còn **chậm hơn** comparator (chuyển số thành chuỗi để so) *và* trả kết quả sai: checksum của nó khác hai hàm còn lại (so thứ tự theo chuỗi: `[10, 9, 1] → [1, 10, 9]`). Cả ba tuyến tính–loga (số mũ ≈ 1,05–1,09).

## 09 · `Set<number>` vs bảng bit
| n | `setInsert` | `bitsetInsert` | heap Set |
|---|---|---|---|
| 10⁵ | 5,7 ms | 0,44 ms | 5,2 MB |
| 10⁶ | 80,9 ms | 2,6 ms | 41,9 MB |
| 10⁷ | 2 718 ms | 21,3 ms | 503 MB |

**Giải thích:** `Set` ≈ **50 byte/phần tử** (bảng băm + chuỗi nhập) và **siêu tuyến tính**: số mũ ước lượng 1,53 từ 10⁶ lên 10⁷ (rehash, cache miss, GC). Bảng bit tốn `n/8` byte (1,25 MB ở 10⁷) và tuyến tính. Khi miền giá trị là các số nguyên không quá lớn → bảng bit/`Uint8Array`; khi khóa thưa/chuỗi → `Set` là lựa chọn đúng, nhưng biết nó đắt: 10⁷ phần tử ≈ nửa GB.

## 10 · Sort rồi đếm vs `Set`
| n | `uniqueBySort` | `uniqueBySet` |
|---|---|---|
| 10³ | 0,094 ms | 0,062 ms |
| 10⁵ | 6,3 ms | 7,8 ms |
| 10⁶ | 73,9 ms | 80,6 ms |

**Giải thích:** O(n log n) và O(n) cho thời gian **gần như ngang nhau** — hằng số của băm (cấp phát, rehash, cache miss) lớn hơn nhiều so với `log n ≈ 20` bước của typed sort trên bộ nhớ liên tục. Set thắng ở n nhỏ (không cần sort), sort nhỉnh hơn ở khoảng 10⁵. Big-O dự đoán *xu hướng khi n → ∞*, không dự đoán ai nhanh hơn ở một n cụ thể.

---

## Tương đương Python / Java (đo thô trên máy soạn)
| | Số đo |
|---|---|
| Java `int[]` vs `ArrayList<Integer>` (tổng 10⁶ phần tử) | 0,7 ms vs 56 ms (**80×**: boxing + con trỏ) |
| Java `int[]` vs `HashMap<Integer,Integer>` (đếm 10⁶, 1000 khóa) | 1,8 ms vs 125 ms (**70×**) |
| Java `String +=` vs `StringBuilder` (10⁵) | 1 134 ms vs 2,0 ms |
| Python `list[int]` vs `array('i')` | 8,4 MB vs 4,0 MB cho 10⁶ phần tử; nhưng `sum()` trên `list` 4,6 ms **nhanh hơn** `array` 8,1 ms (mỗi phần tử `array` phải tạo lại đối tượng `int`) |
| Python đệ quy vs vòng lặp (200 × 5000) | 102 ms vs 49 ms |

## Mẫu "Quy tắc ngón tay cái" (của người soạn — của bạn nên khác)
1. Dữ liệu là số cùng kiểu, n ≥ 10⁵ → typed array (đo: 5–6× và 6× ít bộ nhớ thật).
2. Miền khóa nhỏ biết trước → mảng/bảng bit thay vì `Map`/`Set` (đo: 15× và 100×+).
3. Hot loop đọc nhiều trường của nhiều đối tượng → SoA (đo: 6× ở 10⁶).
4. Biết kích thước → cấp phát trước; đừng dựa vào `push` cho mảng khổng lồ (đo: 4–5×).
5. Đừng tin Big-O để chọn giữa hai thuật toán cùng bậc; đo ở `n` thật (sort vs Set: ngang nhau).
6. Đệ quy sâu > ~5 000 tầng là lỗi trong TS; chuyển sang vòng lặp + stack tường minh.
7. Đừng "tối ưu" bằng thói quen cũ (`join`, tránh object nhỏ) khi chưa đo trên engine hiện tại.
