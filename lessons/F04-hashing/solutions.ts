// F04 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Two Sum ───
// Ý tưởng: khuôn "tra phần bù" — duyệt i, hỏi Map "target − nums[i] đã gặp ở chỉ số nào?", có thì trả về;
//   chưa có thì ghi nums[i] → i. Tra TRƯỚC, ghi SAU để không ghép phần tử với chính nó.
// Độ phức tạp: O(n) time · O(n) space.
// Cách khác: sort kèm chỉ số + two pointers — O(n log n), O(n) bộ nhớ cho cặp (giá trị, chỉ số).
// Python/Java: Python `seen = {}` + `if target - x in seen`. Java: `target - x` có thể tới 2·10⁹ > 2³¹ − 1 → tràn int và có thể
//   trùng nhầm một giá trị khác; an toàn là tính bằng `long` và dùng `HashMap<Long, Integer>`.
export function twoSum(nums: number[], target: number): number[] {
  const idx = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const j = idx.get(target - nums[i]);
    if (j !== undefined) return [j, i];
    idx.set(nums[i], i);
  }
  return [];
}

// ─── ex02 · Trùng lặp gần nhau ───
// Ý tưởng: Map giá trị → chỉ số gần nhất. Gặp lại giá trị thì kiểm tra khoảng cách tới lần gần nhất (chỉ lần gần nhất mới quan trọng).
// Độ phức tạp: O(n) time · O(n) space.
// Cách khác: Set trượt kích thước k (xóa nums[i − k − 1] khi i > k) — O(min(n, k)) bộ nhớ; đây là "sliding window" của F06.
export function containsNearbyDuplicate(nums: number[], k: number): boolean {
  const last = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const j = last.get(nums[i]);
    if (j !== undefined && i - j <= k) return true;
    last.set(nums[i], i);
  }
  return false;
}

// ─── ex03 · Chuỗi đẳng cấu ───
// Ý tưởng: cần song ánh → hai Map: s→t và t→s. Mỗi cặp (a, b) phải nhất quán ở CẢ hai chiều.
// Độ phức tạp: O(n) time · O(σ) space (σ = số ký tự khác nhau).
// Bẫy: chỉ kiểm tra chiều s→t → "badc"/"baba" lọt (b→b, d→b).
// Cách khác: so "vị trí xuất hiện đầu tiên" — s và t đẳng cấu ⇔ với mọi i, firstIndex_s(s[i]) == firstIndex_t(t[i]).
export function isIsomorphic(s: string, t: string): boolean {
  const st = new Map<string, string>();
  const ts = new Map<string, string>();
  for (let i = 0; i < s.length; i++) {
    const a = s[i];
    const b = t[i];
    if ((st.has(a) && st.get(a) !== b) || (ts.has(b) && ts.get(b) !== a)) return false;
    st.set(a, b);
    ts.set(b, a);
  }
  return true;
}

// ─── ex04 · Mẫu từ ───
// Ý tưởng: giống ex03 nhưng một phía là từ. Kiểm tra số lượng trước.
// Độ phức tạp: O(|pattern| + |s|) time và space.
// Bẫy: quên so số từ với số ký tự mẫu; chỉ map một chiều.
// Python/Java: Python `len(set(zip(p, w))) == len(set(p)) == len(set(w))` là mẹo một dòng; Java `split(" ")`.
export function wordPattern(pattern: string, s: string): boolean {
  const words = s.split(' ');
  if (words.length !== pattern.length) return false;
  const pw = new Map<string, string>();
  const wp = new Map<string, string>();
  for (let i = 0; i < words.length; i++) {
    const p = pattern[i];
    const w = words[i];
    if ((pw.has(p) && pw.get(p) !== w) || (wp.has(w) && wp.get(w) !== p)) return false;
    pw.set(p, w);
    wp.set(w, p);
  }
  return true;
}

// ─── ex05 · Dãy liên tiếp dài nhất ───
// Ý tưởng: bỏ mảng vào Set. Chỉ bắt đầu đếm từ x nếu x − 1 KHÔNG có trong Set (x là đầu dãy), rồi đếm x+1, x+2…
// Độ phức tạp: O(n) time — mỗi số được "đi qua" tối đa 2 lần (1 lần duyệt, 1 lần nằm trong dãy của đầu dãy) · O(n) space.
// Bẫy: bỏ điều kiện "x − 1 không có" → mỗi phần tử đếm lại cả dãy → O(n²) với input [1..n].
//   Duyệt trên Set (không phải mảng) để phần tử trùng không bị xét lại.
// Cách khác: sort rồi đếm — O(n log n), đơn giản, thường đủ dùng.
export function longestConsecutive(nums: number[]): number {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue;
    let len = 1;
    while (set.has(x + len)) len++;
    if (len > best) best = len;
  }
  return best;
}

// ─── ex06 · k giá trị xuất hiện nhiều nhất ───
// Ý tưởng (bucket sort): đếm tần suất; bucket[f] = các giá trị có tần suất f (f ≤ n). Duyệt f từ n xuống 1,
//   mỗi bucket sort tăng dần (để đúng quy tắc tie) rồi lấy đến khi đủ k.
// Độ phức tạp: O(n + d log d) với d giá trị khác nhau (sort trong bucket); không tie thì O(n).
// Cách khác: sort các cặp (giá trị, tần suất) theo (−tần suất, giá trị) — O(d log d), ngắn và rõ ràng (đủ tốt cho phỏng vấn);
//   heap kích thước k — O(d log k), học ở I04.
// Python/Java: Python `sorted(cnt, key=lambda v: (-cnt[v], v))[:k]`; Java `List<Integer>` + `sort` với comparator 2 tiêu chí
//   (dùng `Integer.compare`, không trừ để tránh tràn).
export function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [v, f] of freq) buckets[f].push(v);
  const out: number[] = [];
  for (let f = nums.length; f >= 1 && out.length < k; f--) {
    if (buckets[f].length === 0) continue;
    buckets[f].sort((a, b) => a - b);
    for (const v of buckets[f]) {
      out.push(v);
      if (out.length === k) break;
    }
  }
  return out;
}

// ─── ex07 · Bốn mảng có tổng bằng 0 ───
// Ý tưởng (meet in the middle): đếm mọi tổng a[i] + b[j] vào Map (n² cặp); với mỗi c[k] + d[l], cộng số lần −(c + d) đã thấy.
// Độ phức tạp: O(n²) time · O(n²) space.
// Vì sao là best practice: chia 4 vòng thành 2 nửa × 2 vòng — kỹ thuật "gặp nhau ở giữa" dùng lại ở A10, A12.
export function fourSumCount(a: number[], b: number[], c: number[], d: number[]): number {
  const sums = new Map<number, number>();
  for (const x of a) for (const y of b) sums.set(x + y, (sums.get(x + y) ?? 0) + 1);
  let count = 0;
  for (const x of c) for (const y of d) count += sums.get(-(x + y)) ?? 0;
  return count;
}

// ─── ex08 · Chống gửi trùng request ───
// Ý tưởng: Map requestId → thời điểm ĐƯỢC CHẤP NHẬN gần nhất. Chỉ cập nhật Map khi chấp nhận.
// Độ phức tạp: O(n) time · O(số id khác nhau) space.
// Bẫy: cập nhật thời điểm cả khi từ chối → request retry liên tục sẽ bị chặn mãi (sai yêu cầu).
// Ngoài đời: Map này phải có giới hạn bộ nhớ — xóa key cũ hơn `window` (TTL, R01) hoặc lưu ở Redis với `SET id NX EX window`.
export function acceptRequests(ids: string[], times: number[], window: number): number[] {
  const lastAccepted = new Map<string, number>();
  const out: number[] = [];
  for (let i = 0; i < ids.length; i++) {
    const t = lastAccepted.get(ids[i]);
    if (t === undefined || times[i] - t >= window) {
      lastAccepted.set(ids[i], times[i]);
      out.push(i);
    }
  }
  return out;
}

// ─── ex09 · File trùng nội dung ───
// Ý tưởng: gom nhóm theo khóa = nội dung; lấy các nhóm có ≥ 2 file.
// Độ phức tạp: O(tổng độ dài nội dung) time và space.
// Ngoài đời: nội dung file lớn → khóa là hash (SHA-256) của nội dung; thường lọc trước theo kích thước file
//   (rẻ), rồi hash vài KB đầu, cuối cùng mới hash toàn bộ / so từng byte để loại va chạm.
export function duplicateFiles(paths: string[], contents: string[]): string[][] {
  const byContent = new Map<string, string[]>();
  for (let i = 0; i < paths.length; i++) {
    const g = byContent.get(contents[i]);
    if (g) g.push(paths[i]);
    else byContent.set(contents[i], [paths[i]]);
  }
  return [...byContent.values()].filter((g) => g.length >= 2);
}

// ─── ex10 · Đối soát hai hệ thống ───
// Ý tưởng: đếm multiset: +1 cho mỗi mã của A, −1 cho mỗi mã của B; mã nào còn dương thì lặp lại đúng số lần đó. Sort kết quả.
// Độ phức tạp: O(n + m + r log r) với r = độ dài kết quả · O(số mã khác nhau) space.
// Python/Java: Python `Counter(a) - Counter(b)` đúng nghĩa "chỉ giữ phần dương", rồi `sorted(diff.elements())`.
export function reconcile(a: number[], b: number[]): number[] {
  const cnt = new Map<number, number>();
  for (const x of a) cnt.set(x, (cnt.get(x) ?? 0) + 1);
  for (const x of b) {
    const c = cnt.get(x);
    if (c !== undefined) cnt.set(x, c - 1);
  }
  const out: number[] = [];
  for (const [id, c] of cnt) for (let k = 0; k < c; k++) out.push(id);
  return out.sort((x, y) => x - y);
}
