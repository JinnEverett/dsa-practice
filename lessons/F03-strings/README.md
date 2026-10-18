# F03 · String

## Sau buổi này bạn sẽ
- Biết string là **bất biến** ở cả TS, Python, Java và hệ quả về độ phức tạp khi ghép chuỗi.
- Đếm tần suất ký tự bằng mảng 26 phần tử thay vì hash map.
- Dùng two pointers trên chuỗi (palindrome, đảo từ).
- Xử lý chuỗi "bẩn" ngoài đời thật: khoảng trắng thừa, hoa/thường, dấu tiếng Việt, số lớn dạng chuỗi.

## 1. Bất biến & ghép chuỗi

```
s = "abc"; s += "d"   →   tạo chuỗi MỚI "abcd" (copy 4 ký tự), "abc" cũ bị bỏ
```

Ghép n lần, mỗi lần copy toàn bộ → 1 + 2 + … + n = **O(n²)** về lý thuyết.

| Ngôn ngữ | Ghép trong vòng lặp | Cách chuẩn |
|---|---|---|
| TS | `s += x` — V8 dùng *rope* nên thực tế nhanh | `parts.push(x)` rồi `parts.join('')` |
| Python | `s += x` — CPython đôi khi tối ưu, không đảm bảo | `parts.append(x)` rồi `''.join(parts)` |
| Java | `s += x` — **O(n²) thật**, rất chậm | `StringBuilder sb; sb.append(x); sb.toString()` |

## 2. Ký tự ↔ số

| Việc | TS | Python | Java |
|---|---|---|---|
| Mã ký tự | `s.charCodeAt(i)` | `ord(s[i])` | `s.charAt(i)` (là `char`, dùng như số) |
| Vị trí trong bảng chữ cái | `s.charCodeAt(i) - 97` | `ord(c) - ord('a')` | `c - 'a'` |
| Số → ký tự | `String.fromCharCode(97 + k)` | `chr(97 + k)` | `(char) ('a' + k)` |
| Là chữ/số? | `/[a-z0-9]/i.test(c)` | `c.isalnum()` | `Character.isLetterOrDigit(c)` |

**Đếm tần suất bằng mảng 26** (khi đề nói "chỉ chữ thường a–z"): nhanh hơn và ít bộ nhớ hơn Map.

```ts
const cnt = new Array(26).fill(0);
for (let i = 0; i < s.length; i++) cnt[s.charCodeAt(i) - 97]++;
```

```
s = "anagram"
a b c d e f g ... m n ... r
3 0 0 0 0 0 1 ... 1 1 ... 1
```

## 3. Two pointers trên chuỗi

```
"A man, a plan, a canal: Panama"
 ↑                             ↑
 i → bỏ qua ký tự không phải chữ/số ← j
 so sánh tolower(s[i]) với tolower(s[j]), rồi i++, j--
```

## 4. Khóa chuẩn hóa (canonical key) để gom nhóm
Hai chuỗi là anagram ⇔ cùng **khóa**: chuỗi đã sort (`"eat" → "aet"`) hoặc chuỗi đếm (`"1#0#0#…"`).
Gom nhóm = `Map<khóa, danh sách>`. Kỹ thuật "chuẩn hóa rồi băm" dùng lại rất nhiều (F04, R06).

## 5. Số lớn dạng chuỗi
Số tiền, ID 18 chữ số từ hệ thống khác vượt 2⁵³ (TS) hoặc 2⁶³ (Java long). Cộng như học sinh tiểu học: từ phải sang trái, giữ biến nhớ.

```
  9 9 5
+   1 7
-------
1 0 1 2      carry: 5+7=12 → ghi 2 nhớ 1 → 9+1+1=11 → ghi 1 nhớ 1 → 9+1=10 → ghi 0 nhớ 1 → ghi 1
```

## 6. Bỏ dấu tiếng Việt
Unicode **NFD** tách "ế" thành "e" + dấu mũ + dấu sắc (các *combining mark* U+0300–U+036F). Xóa các mark là bỏ được dấu. Riêng **đ/Đ** là ký tự riêng, không tách được → thay tay.

| TS | Python | Java |
|---|---|---|
| `s.normalize('NFD').replace(/[̀-ͯ]/g, '')` | `unicodedata.normalize('NFD', s)` rồi bỏ ký tự có `unicodedata.combining(c)` | `Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "")` |

## 7. Bẫy
1. Quên chuẩn hóa hoa/thường, khoảng trắng đầu/cuối, nhiều khoảng trắng liên tiếp.
2. `s.split(' ')` với nhiều khoảng trắng → có phần tử rỗng. Dùng `split(/\s+/)` sau khi `trim()` (TS), `s.split()` không tham số (Python), `trim().split("\\s+")` (Java).
3. Java so sánh chuỗi bằng `==` (so tham chiếu) → dùng `.equals()`.
4. Emoji/ký tự ngoài BMP chiếm 2 "code unit" trong TS/Java: `"😀".length === 2`. Đề trong lộ trình chỉ dùng ASCII trừ khi nói rõ.
5. `str.slice()`/`substring` bên trong vòng lặp là O(độ dài) mỗi lần → dễ thành O(n²).

## 8. Độ phức tạp

| Thao tác | Time |
|---|---|
| `s[i]`, `s.length` | O(1) |
| `s + t`, `slice`, `substring`, `split`, `join`, `==`/`equals` | O(độ dài) |
| sort ký tự của chuỗi độ dài k | O(k log k) |
| đếm 26 ký tự | O(k) time, O(1) space |
