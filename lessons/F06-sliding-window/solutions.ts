// F06 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Tổng lớn nhất của k phần tử liên tiếp ───
// Ý tưởng: template cửa sổ cố định — thêm nums[r], bớt nums[r − k].
// Độ phức tạp: O(n) time · O(1) space.
// Bẫy: khởi tạo best = 0 → sai khi mọi số âm. Dùng −Infinity hoặc tổng của cửa sổ đầu.
// Python/Java: Java dùng `long sum` (k · 10⁹ vượt int). Python không lo tràn.
export function maxSumK(nums: number[], k: number): number {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let best = sum;
  for (let r = k; r < nums.length; r++) {
    sum += nums[r] - nums[r - k];
    if (sum > best) best = sum;
  }
  return best;
}

// ─── ex02 · Đếm cửa sổ đạt ngưỡng trung bình ───
// Ý tưởng: cửa sổ cố định; so tổng với threshold · k (số nguyên, không chia).
// Độ phức tạp: O(n) time · O(1) space.
export function countWindows(nums: number[], k: number, threshold: number): number {
  const need = threshold * k;
  let sum = 0;
  let count = 0;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    if (r >= k) sum -= nums[r - k];
    if (r >= k - 1 && sum >= need) count++;
  }
  return count;
}

// ─── ex03 · Chuỗi con dài nhất không lặp ───
// Ý tưởng: lưu vị trí xuất hiện CUỐI của mỗi ký tự. Gặp ký tự đã có trong cửa sổ (last ≥ l) thì nhảy l = last + 1
//   một bước (không cần while co từng ký tự).
// Độ phức tạp: O(n) time · O(σ) space.
// Bẫy: quên điều kiện last ≥ l → l bị kéo LÙI về vị trí cũ ngoài cửa sổ ("abba": tới 'a' cuối, last = 0 < l = 2).
// Cách khác: template (B) với Set — co từng ký tự tới khi hết lặp; vẫn O(n), dễ nghĩ hơn.
export function lengthOfLongestSubstring(s: string): number {
  const last = new Map<string, number>();
  let l = 0;
  let best = 0;
  for (let r = 0; r < s.length; r++) {
    const prev = last.get(s[r]);
    if (prev !== undefined && prev >= l) l = prev + 1;
    last.set(s[r], r);
    if (r - l + 1 > best) best = r - l + 1;
  }
  return best;
}

// ─── ex04 · Đoạn con ngắn nhất có tổng ≥ target ───
// Ý tưởng: "ngắn nhất" → khi cửa sổ HỢP LỆ (sum ≥ target) thì ghi nhận rồi co trái, lặp tới khi không hợp lệ.
// Độ phức tạp: O(n) time · O(1) space. Đúng nhờ số dương (thêm phần tử → tổng tăng, bớt → giảm).
// Cách khác: prefix sum + binary search — O(n log n) (F09), dùng được tư duy cho biến thể.
export function minSubArrayLen(target: number, nums: number[]): number {
  let l = 0;
  let sum = 0;
  let best = Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    while (sum >= target) {
      best = Math.min(best, r - l + 1);
      sum -= nums[l++];
    }
  }
  return best === Infinity ? 0 : best;
}

// ─── ex05 · Thay tối đa k ký tự ───
// Ý tưởng: cửa sổ hợp lệ ⇔ (độ dài − số lần của ký tự nhiều nhất trong cửa sổ) ≤ k.
//   Mẹo: maxCount chỉ cần tăng, không cần giảm khi co — đáp án chỉ cải thiện khi maxCount tăng, nên giữ giá trị "lỗi thời"
//   không làm sai kết quả (cửa sổ chỉ trượt chứ không co nhỏ hơn đáp án tốt nhất).
// Độ phức tạp: O(n) time · O(26) space.
// Cách dễ hiểu hơn: tính lại max của mảng 26 mỗi bước — O(26n), vẫn tuyến tính.
export function characterReplacement(s: string, k: number): number {
  const cnt = new Array<number>(26).fill(0);
  let l = 0;
  let maxCount = 0;
  let best = 0;
  for (let r = 0; r < s.length; r++) {
    maxCount = Math.max(maxCount, ++cnt[s.charCodeAt(r) - 65]);
    while (r - l + 1 - maxCount > k) cnt[s.charCodeAt(l++) - 65]--;
    best = Math.max(best, r - l + 1);
  }
  return best;
}

// ─── ex06 · Mọi vị trí anagram ───
// Ý tưởng: cửa sổ cố định |p|; mảng need[26] = số ký tự p còn thiếu; biến `missing` = tổng số ký tự còn thiếu.
//   Thêm ký tự c: nếu need[c] > 0 thì missing--; need[c]--. Bỏ ký tự c: need[c]++; nếu need[c] > 0 thì missing++.
//   missing = 0 ⇔ cửa sổ là anagram.
// Độ phức tạp: O(|s| + |p|) time · O(1) space.
// Cách khác: so hai mảng đếm 26 ô ở mỗi bước — O(26 · |s|), vẫn tuyến tính, dễ viết hơn.
export function findAnagrams(s: string, p: string): number[] {
  const need = new Array<number>(26).fill(0);
  for (let i = 0; i < p.length; i++) need[p.charCodeAt(i) - 97]++;
  let missing = p.length;
  const out: number[] = [];
  for (let r = 0; r < s.length; r++) {
    if (need[s.charCodeAt(r) - 97]-- > 0) missing--;
    if (r >= p.length && ++need[s.charCodeAt(r - p.length) - 97] > 0) missing++;
    if (missing === 0) out.push(r - p.length + 1);
  }
  return out;
}

// ─── ex07 · Hái quả với 2 giỏ ───
// Ý tưởng: cửa sổ co giãn với Map đếm; số loại (map.size) > 2 thì co trái, xóa loại khi đếm về 0.
// Độ phức tạp: O(n) time · O(1) space (Map tối đa 3 phần tử).
// Bẫy: không `delete` khi đếm về 0 → map.size không giảm.
// Python/Java: Python `if cnt[x] == 0: del cnt[x]`; Java `if (cnt.merge(x, -1, Integer::sum) == 0) cnt.remove(x)`.
export function totalFruit(fruits: number[]): number {
  const cnt = new Map<number, number>();
  let l = 0;
  let best = 0;
  for (let r = 0; r < fruits.length; r++) {
    cnt.set(fruits[r], (cnt.get(fruits[r]) ?? 0) + 1);
    while (cnt.size > 2) {
      const f = fruits[l++];
      const c = cnt.get(f)! - 1;
      if (c === 0) cnt.delete(f);
      else cnt.set(f, c);
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}

// ─── ex08 · Cửa sổ nhỏ nhất chứa đủ ký tự ───
// Ý tưởng: như ex06 nhưng cửa sổ co giãn: mở rộng tới khi missing = 0 (đủ ký tự), rồi co trái tối đa trong khi vẫn đủ,
//   ghi nhận cửa sổ ngắn nhất (chỉ cập nhật khi NGẮN HƠN hẳn → giữ cái bắt đầu sớm nhất).
// Độ phức tạp: O(|s| + |t|) time · O(σ) space (mảng 128 ký tự ASCII).
// Bẫy: dùng Map cho t có ký tự lặp — phải đếm số lần, không chỉ "có/không".
export function minWindow(s: string, t: string): string {
  const need = new Array<number>(128).fill(0);
  for (let i = 0; i < t.length; i++) need[t.charCodeAt(i)]++;
  let missing = t.length;
  let l = 0;
  let bestL = 0;
  let bestLen = Infinity;
  for (let r = 0; r < s.length; r++) {
    if (need[s.charCodeAt(r)]-- > 0) missing--;
    while (missing === 0) {
      if (r - l + 1 < bestLen) {
        bestLen = r - l + 1;
        bestL = l;
      }
      if (++need[s.charCodeAt(l++)] > 0) missing++;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen);
}

// ─── ex09 · Đỉnh tải trong cửa sổ thời gian ───
// Ý tưởng: times đã sort → cửa sổ co giãn trên chỉ số: với mỗi r, co l tới khi times[r] − times[l] < w.
// Độ phức tạp: O(n) time · O(1) space.
// Ngoài đời: log chưa sort thì sort trước (O(n log n)); log khổng lồ dạng stream thì giữ deque timestamp trong cửa sổ (R09).
export function peakLoad(times: number[], w: number): number {
  let l = 0;
  let best = 0;
  for (let r = 0; r < times.length; r++) {
    while (times[r] - times[l] >= w) l++;
    best = Math.max(best, r - l + 1);
  }
  return best;
}

// ─── ex10 · Streak dài nhất khi được bù k ngày ───
// Ý tưởng: đoạn con dài nhất chứa ≤ k số 0. Cửa sổ co giãn đếm số 0.
// Độ phức tạp: O(n) time · O(1) space.
export function longestStreak(days: number[], k: number): number {
  let l = 0;
  let zeros = 0;
  let best = 0;
  for (let r = 0; r < days.length; r++) {
    if (days[r] === 0) zeros++;
    while (zeros > k) if (days[l++] === 0) zeros--;
    best = Math.max(best, r - l + 1);
  }
  return best;
}
