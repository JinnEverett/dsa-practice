// F03 · Đáp án best practice. Chỉ mở sau khi check ✅.

const isAlnumCode = (c: number) => (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
const lowerCode = (c: number) => (c >= 65 && c <= 90 ? c + 32 : c);

// ─── ex01 · Palindrome hợp lệ ───
// Ý tưởng: two pointers từ hai đầu, bỏ qua ký tự không phải chữ/số, so sánh sau khi hạ chữ thường.
// Độ phức tạp: O(n) time · O(1) space.
// Vì sao là best practice: không tạo chuỗi trung gian. Cách "lọc rồi so với chuỗi đảo"
//   (`s.toLowerCase().replace(/[^a-z0-9]/g, '')` === reverse) ngắn hơn, đúng, nhưng tốn O(n) bộ nhớ — chấp nhận được khi phỏng vấn
//   nếu bạn nói rõ trade-off.
// Python/Java: Python `c.isalnum()` / `c.lower()`; Java `Character.isLetterOrDigit`, `Character.toLowerCase`.
export function isPalindrome(s: string): boolean {
  let i = 0;
  let j = s.length - 1;
  while (i < j) {
    const a = s.charCodeAt(i);
    const b = s.charCodeAt(j);
    if (!isAlnumCode(a)) i++;
    else if (!isAlnumCode(b)) j--;
    else {
      if (lowerCode(a) !== lowerCode(b)) return false;
      i++;
      j--;
    }
  }
  return true;
}

// ─── ex02 · Anagram ───
// Ý tưởng: mảng đếm 26: +1 cho ký tự của s, −1 cho ký tự của t; mọi ô phải về 0.
// Độ phức tạp: O(n) time · O(1) space (26 ô cố định).
// Bẫy: quên kiểm tra độ dài trước → "ab" vs "a" có thể lọt nếu chỉ duyệt một chuỗi.
// Cách khác: sort cả hai rồi so — O(n log n), ngắn gọn.
// Python/Java: Python `Counter(s) == Counter(t)` là idiom; Java `int[] cnt = new int[26]; cnt[c - 'a']++`.
export function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const cnt = new Array<number>(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    cnt[s.charCodeAt(i) - 97]++;
    cnt[t.charCodeAt(i) - 97]--;
  }
  return cnt.every((c) => c === 0);
}

// ─── ex03 · Ký tự không lặp đầu tiên ───
// Ý tưởng: lượt 1 đếm tần suất (mảng 26); lượt 2 duyệt lại theo thứ tự, trả về chỉ số đầu tiên có tần suất 1.
// Độ phức tạp: O(n) time · O(1) space.
// Bẫy: dùng `s.indexOf(c) === s.lastIndexOf(c)` cho từng vị trí → O(n²) (mỗi lần tìm là O(n)).
export function firstUniqChar(s: string): number {
  const cnt = new Array<number>(26).fill(0);
  for (let i = 0; i < s.length; i++) cnt[s.charCodeAt(i) - 97]++;
  for (let i = 0; i < s.length; i++) if (cnt[s.charCodeAt(i) - 97] === 1) return i;
  return -1;
}

// ─── ex04 · Tiền tố chung dài nhất ───
// Ý tưởng (vertical scanning): xét lần lượt vị trí i = 0, 1, …; nếu mọi chuỗi đều có ký tự i và giống strs[0][i] thì tiếp,
//   ngược lại tiền tố là strs[0].slice(0, i).
// Độ phức tạp: O(S) với S = tổng số ký tự được so (tối đa n · độ dài tiền tố) · O(1) space.
// Vì sao là best practice: dừng ngay khi gặp chuỗi ngắn nhất / ký tự khác, không phải sort.
// Cách khác: sort rồi chỉ so chuỗi đầu và cuối — O(n log n · L), ngắn gọn.
export function longestCommonPrefix(strs: string[]): string {
  const first = strs[0];
  for (let i = 0; i < first.length; i++) {
    const ch = first[i];
    for (let k = 1; k < strs.length; k++) {
      if (i >= strs[k].length || strs[k][i] !== ch) return first.slice(0, i);
    }
  }
  return first;
}

// ─── ex05 · Đảo thứ tự từ ───
// Ý tưởng: tách theo khoảng trắng (bỏ phần rỗng), đảo mảng từ, nối bằng 1 khoảng trắng.
// Độ phức tạp: O(n) time · O(n) space.
// Vì sao là best practice: dùng thư viện chuẩn đúng cách là cách rõ ràng nhất; phỏng vấn có thể hỏi bản O(1) bộ nhớ
//   (đảo cả mảng ký tự rồi đảo từng từ) — chỉ có ý nghĩa với mảng ký tự sửa được, không áp dụng cho string bất biến.
// Bẫy: `s.split(' ')` với nhiều khoảng trắng liên tiếp sinh phần tử rỗng.
// Python/Java: Python `' '.join(reversed(s.split()))`; Java `s.trim().split("\\s+")` rồi `Collections.reverse` + `String.join`.
export function reverseWords(s: string): string {
  return s.trim().split(/\s+/).reverse().join(' ');
}

// ─── ex06 · Nén chuỗi ───
// Ý tưởng: duyệt theo từng "dãy" (run): j chạy tới hết dãy ký tự giống s[i], ghi ký tự + độ dài (nếu > 1), nhảy i = j.
// Độ phức tạp: O(n) time · O(n) space cho kết quả.
// Bẫy: quên ghi dãy cuối cùng (khi viết kiểu "so với ký tự trước"); độ dài ≥ 10 có nhiều chữ số.
// Python/Java: Python có `itertools.groupby(s)` — idiom gọn; Java bắt buộc `StringBuilder` (`+=` trong vòng lặp là O(n²)).
export function compress(s: string): string {
  const parts: string[] = [];
  for (let i = 0; i < s.length; ) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    parts.push(j - i > 1 ? s[i] + (j - i) : s[i]);
    i = j;
  }
  return parts.join('');
}

// ─── ex07 · Gom nhóm anagram ───
// Ý tưởng: khóa chuẩn hóa = chuỗi đếm 26 ký tự (vd. "1#0#…#2"); Map<khóa, nhóm>.
// Độ phức tạp: O(n · k) time với k = độ dài chuỗi (khóa sort là O(n · k log k)) · O(n · k) space.
// Vì sao là best practice: khóa đếm không cần sort; với k ≤ 100 thì khóa sort (`[...w].sort().join('')`) cũng hoàn toàn ổn và dễ đọc hơn.
// Bẫy: dùng mảng làm key của Map trong TS/Java (so tham chiếu) → phải chuyển thành chuỗi. Python dùng được tuple làm key.
// Python/Java: Python `defaultdict(list)`, key `tuple(cnt)` hoặc `''.join(sorted(w))`; Java `Map<String, List<String>>` + `computeIfAbsent`.
export function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();
  for (const w of strs) {
    const cnt = new Array<number>(26).fill(0);
    for (let i = 0; i < w.length; i++) cnt[w.charCodeAt(i) - 97]++;
    const key = cnt.join('#');
    const g = groups.get(key);
    if (g) g.push(w);
    else groups.set(key, [w]);
  }
  return [...groups.values()];
}

// ─── ex08 · atoi ───
// Ý tưởng: máy trạng thái đơn giản: bỏ khoảng trắng → dấu → chữ số. Kẹp NGAY trong lúc tích lũy để không tràn.
// Độ phức tạp: O(n) time · O(1) space.
// Bẫy: "+-12" → 0 (chỉ 1 dấu); "  -0" → 0 (không phải -0); quên dừng ở ký tự đầu tiên không phải chữ số.
// Python/Java: Python int không tràn nên có thể tích lũy rồi kẹp cuối. Java: tích lũy bằng `long` và kẹp khi vượt,
//   hoặc kiểm tra trước khi nhân: `if (res > (Integer.MAX_VALUE - d) / 10)`.
export function myAtoi(s: string): number {
  const MAX = 2 ** 31 - 1;
  const MIN = -(2 ** 31);
  let i = 0;
  while (i < s.length && s[i] === ' ') i++;
  let sign = 1;
  if (s[i] === '+' || s[i] === '-') {
    if (s[i] === '-') sign = -1;
    i++;
  }
  let res = 0;
  while (i < s.length) {
    const d = s.charCodeAt(i) - 48;
    if (d < 0 || d > 9) break;
    res = res * 10 + d;
    if (sign * res > MAX) return MAX;
    if (sign * res < MIN) return MIN;
    i++;
  }
  return sign * res + 0; // + 0 để -0 thành 0
}

// ─── ex09 · Slug ───
// Ý tưởng: chuẩn hóa theo đúng thứ tự quy tắc: đ/Đ → d, NFD + xóa combining mark, lowercase,
//   gộp mọi dãy ký tự ngoài [a-z0-9] thành '-', cắt '-' hai đầu.
// Độ phức tạp: O(n) time · O(n) space.
// Vì sao là best practice: mỗi bước là một phép biến đổi khai báo, dễ kiểm thử riêng; regex `[^a-z0-9]+` tự gộp dãy.
// Bẫy: bỏ dấu trước rồi mới lowercase hay ngược lại đều được, nhưng PHẢI xử lý 'đ' riêng (NFD không tách được);
//   quên gộp dãy → "a--b".
// Python/Java: Python `unicodedata.normalize('NFD', s)` + `''.join(c for c in s if not unicodedata.combining(c))`, `re.sub(r'[^a-z0-9]+', '-', s).strip('-')`.
//   Java `Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "")`, `replaceAll("[^a-z0-9]+", "-")`, rồi cắt '-' hai đầu.
export function slugify(title: string): string {
  return title
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── ex10 · Cộng hai số dạng chuỗi ───
// Ý tưởng: hai con trỏ từ cuối mỗi chuỗi, cộng từng cặp chữ số + nhớ; ghi chữ số vào mảng rồi đảo ngược 1 lần.
// Độ phức tạp: O(max(n, m)) time · O(max(n, m)) space.
// Bẫy: quên carry cuối cùng ("995" + "17" cần thêm chữ số 1 ở đầu); ghép `digit + result` ở ĐẦU chuỗi mỗi vòng → O(n²).
// Python/Java: Java dùng `StringBuilder.append` rồi `.reverse()`; Python dùng list rồi `''.join(reversed(out))`.
export function addStrings(num1: string, num2: string): string {
  const out: number[] = [];
  let i = num1.length - 1;
  let j = num2.length - 1;
  let carry = 0;
  while (i >= 0 || j >= 0 || carry) {
    const sum = (i >= 0 ? num1.charCodeAt(i--) - 48 : 0) + (j >= 0 ? num2.charCodeAt(j--) - 48 : 0) + carry;
    out.push(sum % 10);
    carry = sum >= 10 ? 1 : 0;
  }
  return out.reverse().join('');
}
