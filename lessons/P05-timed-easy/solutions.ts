// P05 · Đáp án best practice (Timed set Easy). Chỉ mở sau khi check ✅ hoặc hết giờ.

// ─── ex01 · Mã lỗi chiếm đa số (≈ LeetCode 169) ───
// Ý tưởng: Boyer–Moore voting. Giữ ứng viên + bộ đếm: gặp ứng viên → +1, gặp khác → −1, về 0 thì đổi ứng viên. Phần tử chiếm > n/2 "triệt tiêu" hết các phần tử khác
// nên luôn là ứng viên cuối. Đề đảm bảo có đa số nên không cần lượt kiểm tra thứ hai.
// Độ phức tạp: O(n) time · O(1) space. Cách khác: hash map đếm O(n) space; sort rồi lấy phần tử giữa O(n log n).
// Bẫy: dùng `sort()` mặc định của JS (so chuỗi) để lấy phần tử giữa; nếu đề KHÔNG đảm bảo có đa số thì phải đếm lại.
// Python: `collections.Counter(nums).most_common(1)`; Java: tránh `HashMap<Integer,Integer>` nếu cần O(1) space.
export function majorityElement(nums: number[]): number {
  let cand = 0;
  let cnt = 0;
  for (const x of nums) {
    if (cnt === 0) cand = x;
    cnt += x === cand ? 1 : -1;
  }
  return cand;
}

// ─── ex02 · Lãi lớn nhất khi mua một lần, bán một lần (≈ LeetCode 121) ───
// Ý tưởng: quét một lượt, giữ giá thấp nhất đã thấy; lãi nếu bán hôm nay = giá − min. Lấy max, tối thiểu 0 (không giao dịch).
// Độ phức tạp: O(n) time · O(1) space. Brute: hai vòng lặp O(n²).
// Bẫy: bán phải SAU mua (không lấy max − min toàn mảng); mảng giảm dần → 0; mảng rỗng/1 phần tử → 0.
export function maxProfit(prices: number[]): number {
  let low = Infinity;
  let best = 0;
  for (const p of prices) {
    if (p < low) low = p;
    else if (p - low > best) best = p - low;
  }
  return best;
}

// ─── ex03 · Chuỗi lệnh có xuất hiện đúng thứ tự trong nhật ký? (≈ LeetCode 392) ───
// Ý tưởng: hai con trỏ; duyệt `t`, mỗi khi t[j] = s[i] thì i++. Xong khi i = |s|.
// Độ phức tạp: O(|t|) time · O(1) space. Nếu có RẤT NHIỀU truy vấn `s` trên cùng `t`: lập chỉ mục vị trí từng ký tự của t rồi binary search — O(|s| log |t|) mỗi truy vấn.
// Bẫy: `s` rỗng → true; đừng dùng `includes` (không giữ thứ tự); dừng sớm khi i đạt |s|.
export function isSubsequence(s: string, t: string): boolean {
  let i = 0;
  for (let j = 0; j < t.length && i < s.length; j++) if (t[j] === s[i]) i++;
  return i === s.length;
}

// ─── ex04 · Tóm tắt dãy mã vé liên tiếp (≈ LeetCode 228) ───
// Ý tưởng: duyệt mảng đã sắp, mở rộng đoạn khi nums[j+1] = nums[j] + 1; xuất "a->b" nếu đoạn dài hơn 1, ngược lại "a".
// Độ phức tạp: O(n) time · O(1) phụ ngoài kết quả.
// Bẫy: Java `nums[j] + 1` tràn `int` khi nums[j] = 2³¹ − 1 (so sánh `nums[j + 1] - nums[j] == 1` cũng tràn với cặp (−2³¹, 2³¹−1)) → dùng `long`;
// mảng rỗng → [].
export function summaryRanges(nums: number[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < nums.length; ) {
    let j = i;
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
    out.push(j > i ? `${nums[i]}->${nums[j]}` : `${nums[i]}`);
    i = j + 1;
  }
  return out;
}

// ─── ex05 · Phần tử lớn hơn kế tiếp (≈ LeetCode 496) ───
// Ý tưởng: duyệt nums2 từ trái sang phải với monotonic stack giảm dần; khi gặp x lớn hơn đỉnh stack, đỉnh có "phần tử lớn hơn kế tiếp" = x → ghi vào map.
// Sau đó tra map cho từng phần tử của nums1.
// Độ phức tạp: O(n + m) time · O(m) space. Brute: với mỗi phần tử tìm vị trí trong nums2 rồi quét sang phải — O(n·m).
// Bẫy: phần tử còn lại trong stack → −1; nums1 là tập con nên luôn có trong map.
export function nextGreaterElement(nums1: number[], nums2: number[]): number[] {
  const next = new Map<number, number>();
  const st: number[] = [];
  for (const x of nums2) {
    while (st.length && st[st.length - 1] < x) next.set(st.pop()!, x);
    st.push(x);
  }
  return nums1.map((x) => next.get(x) ?? -1);
}

// ─── ex06 · Độ dài palindrome dài nhất ghép từ các chữ cái (≈ LeetCode 409) ───
// Ý tưởng: mỗi chữ cái dùng được `count − count % 2` lần ở hai phía; thêm 1 ký tự giữa nếu còn chữ cái có count lẻ.
// Độ phức tạp: O(n) time · O(Σ) space. Phân biệt hoa/thường ('A' ≠ 'a').
// Bẫy: cộng 1 nhiều lần cho nhiều chữ lẻ (chỉ được một ký tự giữa); chuỗi rỗng → 0.
export function longestPalindromeLetters(s: string): number {
  const cnt = new Map<string, number>();
  for (const c of s) cnt.set(c, (cnt.get(c) ?? 0) + 1);
  let len = 0;
  let odd = false;
  for (const v of cnt.values()) {
    len += v - (v % 2);
    if (v % 2) odd = true;
  }
  return len + (odd ? 1 : 0);
}
