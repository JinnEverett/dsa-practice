// A10 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Koko ăn chuối ───
// Ý tưởng: ok(k) = Σ⌈pile/k⌉ ≤ h, đơn điệu theo k ⇒ binary search k nhỏ nhất trong [1, max(pile)].
// Độ phức tạp: O(n log max) time · O(1) space. Linear search k = 1, 2, ... đến 10⁹ không khả thi.
// Bẫy: Σ⌈⌉ tới 10¹⁴ ⇒ Java `long` (và dừng sớm khi đã vượt h). Python: `-(-p // k)`.
export function minEatingSpeed(piles: number[], h: number): number {
  let lo = 1;
  let hi = 0;
  for (const p of piles) if (p > hi) hi = p;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    let hours = 0;
    for (const p of piles) {
      hours += Math.ceil(p / mid);
      if (hours > h) break;
    }
    if (hours <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// ─── ex02 · Tàu chở hàng trong D ngày ───
// Ý tưởng: sức tải x thì dùng bao nhiêu ngày? Greedy: nhồi tiếp vào ngày hiện tại tới khi vượt x thì sang ngày mới. ok(x) = days(x) ≤ D.
//   Cận: [max(w), sum(w)] (nhỏ hơn max(w) thì không chở nổi kiện nặng nhất).
// Độ phức tạp: O(n log sum) time · O(1) space.
export function shipWithinDays(weights: number[], days: number): number {
  let lo = 0;
  let hi = 0;
  for (const w of weights) {
    if (w > lo) lo = w;
    hi += w;
  }
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    let need = 1;
    let cur = 0;
    for (const w of weights) {
      if (cur + w > mid) {
        need++;
        cur = 0;
      }
      cur += w;
    }
    if (need <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// ─── ex03 · Chia mảng thành k phần, cực tiểu hóa tổng lớn nhất ───
// Ý tưởng: giống ex02 (ship = nums, days = k): ok(x) = số phần greedy (mỗi phần ≤ x) ≤ k.
// Độ phức tạp: O(n log sum) time · O(1) space. DP O(k·n²) với n = 10⁵ không khả thi.
// Bẫy: sum tới 10¹⁴ ⇒ Java `long`.
export function splitArray(nums: number[], k: number): number {
  let lo = 0;
  let hi = 0;
  for (const x of nums) {
    if (x > lo) lo = x;
    hi += x;
  }
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    let parts = 1;
    let cur = 0;
    for (const x of nums) {
      if (cur + x > mid) {
        parts++;
        cur = 0;
      }
      cur += x;
    }
    if (parts <= k) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// ─── ex04 · Ngày sớm nhất làm đủ bó hoa ───
// Ý tưởng: cần m·k hoa (m·k > n ⇒ −1). ok(d) = số bó k hoa LIÊN TIẾP đã nở (bloomDay ≤ d) ≥ m. Binary search d trong [min, max].
// Độ phức tạp: O(n log max) time · O(1) space.
// Bẫy: m·k tới 10¹¹ ⇒ Java `long`.
export function minDays(bloomDay: number[], m: number, k: number): number {
  const n = bloomDay.length;
  if (m * k > n) return -1;
  let lo = Infinity;
  let hi = 0;
  for (const d of bloomDay) {
    if (d < lo) lo = d;
    if (d > hi) hi = d;
  }
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    let bouquets = 0;
    let run = 0;
    for (const d of bloomDay) {
      if (d <= mid) {
        if (++run === k) {
          bouquets++;
          run = 0;
        }
      } else run = 0;
    }
    if (bouquets >= m) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// ─── ex05 · Ước số nhỏ nhất ───
// Ý tưởng: ok(d) = Σ⌈nums/d⌉ ≤ threshold, đơn điệu giảm theo d ⇒ binary search d nhỏ nhất trong [1, max].
// Độ phức tạp: O(n log max) time · O(1) space.
export function smallestDivisor(nums: number[], threshold: number): number {
  let lo = 1;
  let hi = 0;
  for (const x of nums) if (x > hi) hi = x;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    let sum = 0;
    for (const x of nums) {
      sum += Math.ceil(x / mid);
      if (sum > threshold) break;
    }
    if (sum <= threshold) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// ─── ex06 · Phần tử nhỏ thứ k trong bảng cửu chương ───
// Ý tưởng: count(x) = số ô ≤ x = Σ_{i=1..m} min(n, ⌊x/i⌋). Tìm x nhỏ nhất có count(x) ≥ k (x nguyên trong [1, m·n]; kết quả luôn là một ô của bảng).
// Độ phức tạp: O(m log(mn)) time · O(1) space. Dựng cả bảng (9·10⁸ ô) hoặc heap k lần: không khả thi.
export function findKthNumber(m: number, n: number, k: number): number {
  let lo = 1;
  let hi = m * n;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    let cnt = 0;
    for (let i = 1; i <= m; i++) {
      const c = Math.floor(mid / i);
      if (c === 0) break;
      cnt += c < n ? c : n;
    }
    if (cnt >= k) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// ─── ex07 · 🔴 Đặt router xa nhau nhất ───
// Ý tưởng: sort vị trí. ok(d) = đặt tham lam (router đầu ở vị trí nhỏ nhất, router kế ở vị trí đầu tiên cách ≥ d) được ≥ m router.
//   Tối đa hóa d ⇒ khuôn "✓ cuối cùng" (mid làm tròn LÊN). Cận [1, (max − min)/(m − 1)].
// Độ phức tạp: O(n log n + n log range) time · O(1) space (ngoài sort).
// Bẫy: thiếu +1 ở mid ⇒ lặp vô hạn. Sort số trong JS phải có comparator `(a, b) => a - b`.
export function maxDistance(position: number[], m: number): number {
  const p = Int32Array.from(position).sort();
  let lo = 1;
  let hi = Math.floor((p[p.length - 1] - p[0]) / (m - 1));
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo + 1) / 2);
    let count = 1;
    let last = p[0];
    for (let i = 1; i < p.length && count < m; i++) {
      if (p[i] - last >= mid) {
        count++;
        last = p[i];
      }
    }
    if (count >= m) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

// ─── ex08 · 🔴 Thêm trạm xăng để khoảng cách lớn nhất nhỏ nhất ───
// Ý tưởng: ok(d) = tổng số trạm cần thêm để mọi khoảng ≤ d, Σ(⌈gap/d⌉ − 1), có ≤ k. Binary search số thực d trong [0, max gap], 100 vòng.
// Độ phức tạp: O(n · 100) time · O(1) space. Mô phỏng thêm từng trạm bằng heap là O(k log n) — k tới 10⁹ không khả thi.
// Bẫy: không so sánh `==` trên số thực; dừng sớm khi need > k.
export function minmaxGasDist(stations: number[], k: number): number {
  let lo = 0;
  let hi = 0;
  const gaps: number[] = [];
  for (let i = 1; i < stations.length; i++) {
    const g = stations[i] - stations[i - 1];
    gaps.push(g);
    if (g > hi) hi = g;
  }
  for (let it = 0; it < 100; it++) {
    const mid = (lo + hi) / 2;
    let need = 0;
    for (const g of gaps) {
      need += Math.ceil(g / mid) - 1;
      if (need > k) break;
    }
    if (need <= k) hi = mid;
    else lo = mid;
  }
  return hi;
}
