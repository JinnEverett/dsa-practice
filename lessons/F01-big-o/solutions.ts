// F01 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Có phần tử trùng không? ───
// Ý tưởng: Set ghi nhớ giá trị đã gặp; gặp lại → true ngay (dừng sớm).
// Độ phức tạp: O(n) time · O(n) space.
// Vì sao là best practice: dừng sớm khi tìm thấy, không phải duyệt hết như `new Set(nums).size !== nums.length`
//   (cách này gọn, cũng O(n), chấp nhận được khi không cần dừng sớm).
// Cách khác: sort rồi so phần tử kề nhau — O(n log n) time, O(1) space nếu được sửa input.
// Python/Java: `len(set(nums)) != len(nums)` là idiom Python; Java dùng `HashSet.add` (trả false khi đã có) để vừa kiểm tra vừa thêm.
export function hasDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}

// ─── ex02 · Bỏ trùng, giữ thứ tự xuất hiện ───
// Ý tưởng: Set để tra "đã gặp chưa" O(1), mảng out để giữ thứ tự.
// Độ phức tạp: O(n) time · O(n) space.
// Vì sao là best practice: Set trong JS giữ thứ tự chèn, nên `[...new Set(nums)]` cũng đúng và ngắn nhất —
//   đó là cách idiomatic trong code thật. Bản vòng lặp dưới đây cho thấy rõ cơ chế.
// Bẫy: `out.includes(x)` → O(n²), ở n = 10⁵ mất vài giây.
// Python/Java: Python `list(dict.fromkeys(nums))` (dict giữ thứ tự chèn). Java: `LinkedHashSet` rồi chuyển sang int[] — hoặc HashSet + mảng kết quả như bản TS.
export function uniqueInOrder(nums: number[]): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const x of nums) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

// ─── ex03 · Giao của hai mảng ───
// Ý tưởng: đưa a vào Set; duyệt b, giá trị nào có trong Set thì thêm vào kết quả rồi XÓA khỏi Set
//   (để không thêm trùng). Cuối cùng sort số học.
// Độ phức tạp: O(n + m + k log k) với k = số phần tử giao · O(n) space.
// Bẫy: `.sort()` không comparator sẽ xếp [10, 9] thành [10, 9] vì so chuỗi "10" < "9".
// Cách khác: sort cả hai rồi two pointers — O(n log n + m log m), hợp khi mảng đã sort sẵn.
// Python/Java: Python `sorted(set(a) & set(b))`. Java: HashSet + `set.remove(x)` (trả true nếu có) rồi `Arrays.sort`.
export function intersection(a: number[], b: number[]): number[] {
  const inA = new Set(a);
  const out: number[] = [];
  for (const x of b) {
    if (inA.delete(x)) out.push(x); // delete trả về true nếu x có trong Set
  }
  return out.sort((x, y) => x - y);
}

// ─── ex04 · Tổng các bội của 3 hoặc 5 ───
// Ý tưởng: bao hàm – loại trừ. Tổng bội của d nhỏ hơn n = d · (1 + 2 + … + m) với m = floor((n - 1) / d).
//   Kết quả = S(3) + S(5) − S(15) (bội của 15 bị đếm 2 lần).
// Độ phức tạp: O(1) time · O(1) space.
// Bẫy: quên trừ S(15); dùng n thay cho n − 1 (đề nói x < n).
// Python/Java: Python int không tràn. Java: khai báo `long m` — `d * m * (m + 1)` với m kiểu int tràn ngay khi m ≈ 3·10⁷.
export function sumOfMultiples(n: number): number {
  const sumDiv = (d: number) => {
    const m = Math.floor((n - 1) / d);
    return m > 0 ? (d * m * (m + 1)) / 2 : 0;
  };
  return sumDiv(3) + sumDiv(5) - sumDiv(15);
}

// ─── ex05 · Giá trị xuất hiện nhiều nhất ───
// Ý tưởng: Map đếm tần suất (1 lượt), rồi duyệt Map chọn (tần suất lớn nhất, giá trị nhỏ nhất).
// Độ phức tạp: O(n) time · O(d) space (d = số giá trị khác nhau).
// Vì sao là best practice: tách "đếm" và "chọn" thành 2 bước giúp quy tắc tie-break nằm gọn một chỗ.
// Bẫy: dùng object `{}` làm bảng đếm — key bị ép thành chuỗi, khi đọc lại phải Number(); Map giữ nguyên kiểu.
// Python/Java: Python `Counter(nums)` rồi `min(cnt, key=lambda v: (-cnt[v], v))`. Java: `HashMap.merge(x, 1, Integer::sum)`.
export function mostFrequent(nums: number[]): number {
  const freq = new Map<number, number>();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  let best = nums[0];
  let bestCount = 0;
  for (const [value, count] of freq) {
    if (count > bestCount || (count === bestCount && value < best)) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

// ─── ex06 · Cặp có tổng chia hết cho k ───
// Ý tưởng: (a + b) chia hết cho k ⇔ (a mod k + b mod k) mod k = 0. Đếm số dư đã gặp trong mảng độ dài k;
//   với số dư r, số cặp mới = số phần tử trước đó có số dư (k − r) mod k.
// Độ phức tạp: O(n + k) time · O(k) space.
// Bẫy: JS `%` giữ dấu: -1 % 3 === -1. Chuẩn hóa: ((x % k) + k) % k.
// Vì sao dùng mảng thay Map: khóa là số dư 0..k−1 liên tiếp → mảng nhanh hơn, ít bộ nhớ hơn.
// Python/Java: Python `x % k` luôn không âm khi k > 0 (khác JS/Java), nên không cần chuẩn hóa. Java: biến đếm `long`
//   (n = 10⁵ → tối đa ~5·10⁹ cặp > 2³¹), và chuẩn hóa `((x % k) + k) % k` như TS.
export function countDivisiblePairs(amounts: number[], k: number): number {
  const remCount = new Array<number>(k).fill(0);
  let pairs = 0;
  for (const x of amounts) {
    const r = ((x % k) + k) % k;
    pairs += remCount[(k - r) % k];
    remCount[r]++;
  }
  return pairs;
}

// ═══════════════════════ Đáp án phần A (snippets.ts) ═══════════════════════
// b01 · O(n) time · O(1) space — một vòng lặp.
// b02 · O(n²) time · O(1) space — hai vòng lồng, tổng n(n−1)/2 lần so sánh. Bench: số mũ ≈ 2.
// b03 · O(log n) time · O(1) — i nhân đôi mỗi vòng, sau log₂ n vòng thì i ≥ n. Bench gần như phẳng.
// b04 · O(n log n) time · O(1) — vòng ngoài n, vòng trong log₂ n (j nhân đôi, không phụ thuộc i).
// b05 · O(n · d) time, xấu nhất O(n²) · O(d) space — `includes` quét mảng out. Input toàn giá trị khác nhau → O(n²).
// b06 · O(n²) time · O(n) space — `shift()` dịch toàn bộ mảng mỗi lần. Đây là bẫy kinh điển của BFS trong JS.
//        (V8 có tối ưu cho mảng nhỏ nên ở n nhỏ trông như O(n); bench ở 1e5 trở lên sẽ thấy số mũ tăng.)
// b07 · O(n log n) time · O(n) space — sort lấn át vòng lặp O(n) phía sau.
// b08 · O(φⁿ) ≈ O(1.618ⁿ) time · O(n) space (độ sâu stack) — fib đệ quy gọi lại cùng bài toán con nhiều lần.
//        n tăng 10 thì thời gian ×~123. Sửa bằng memoization → O(n) (học ở F10, A01).
// b09 · O(n) time · O(1) — dù có while lồng, j chỉ tăng và không bao giờ reset → tổng số bước của j ≤ n.
//        Đây là khuôn mẫu two pointers / sliding window.
// b10 · O(n · d), xấu nhất O(n²) time · O(d) space — `Object.keys` tạo mảng mới gồm mọi key mỗi vòng.
