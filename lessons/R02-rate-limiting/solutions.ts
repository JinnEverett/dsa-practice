// R02 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Mọi limiter: `boolean allow(String user, long nowMs)`; nowMs không giảm theo thứ tự gọi.

// ─── ex01 · Fixed window ───
// Ý tưởng: cửa sổ k = floor(now / windowMs); mỗi user giữ {k, count}. Sang cửa sổ mới → reset count về 0.
// Độ phức tạp: O(1) time · O(users) space — rẻ nhất và là thứ Redis `INCR` + `EXPIRE` làm.
// Bẫy: so `limit` TRƯỚC khi tăng; quên reset khi k đổi; dùng `now % windowMs` làm khóa (sai).
// Nhược điểm: burst gấp đôi ở ranh giới cửa sổ (limit cuối cửa sổ k + limit đầu cửa sổ k+1) — xem ex05.
// Python/Java: `dict`/`HashMap<String, long[]>`; Java nhớ `Math.floorDiv` nếu thời gian có thể âm (ở đây ≥ 0).
export class FixedWindowLimiter {
  private limit: number;
  private w: number;
  private st = new Map<string, { k: number; c: number }>();
  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.w = windowMs;
  }
  allow(user: string, nowMs: number): boolean {
    const k = Math.floor(nowMs / this.w);
    let e = this.st.get(user);
    if (!e || e.k !== k) this.st.set(user, (e = { k, c: 0 }));
    if (e.c >= this.limit) return false;
    e.c++;
    return true;
  }
}

// ─── ex02 · Sliding window log ───
// Ý tưởng: mỗi user giữ queue timestamp của các request ĐƯỢC CHO PHÉP; trước mỗi request bỏ những cái ≤ now − windowMs.
// Cho phép nếu còn < limit. Chính xác nhất: không bao giờ có hơn `limit` request được phép trong bất kỳ khoảng (t − W, t].
// Độ phức tạp: O(1) amortized (mỗi timestamp vào/ra một lần) · O(limit) space/user — đắt bộ nhớ nhất.
// Bẫy: ghi cả request bị từ chối vào log (làm user bị phạt mãi); `shift()` O(n) → dùng chỉ số đầu `head`; khoảng nửa mở.
// Python: `collections.deque`. Java: `ArrayDeque<Long>`.
export class SlidingLogLimiter {
  private limit: number;
  private w: number;
  private st = new Map<string, { q: number[]; head: number }>();
  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.w = windowMs;
  }
  allow(user: string, nowMs: number): boolean {
    let e = this.st.get(user);
    if (!e) this.st.set(user, (e = { q: [], head: 0 }));
    while (e.head < e.q.length && e.q[e.head] <= nowMs - this.w) e.head++;
    if (e.head > 1024 && e.head * 2 > e.q.length) {
      e.q = e.q.slice(e.head); // thu gọn để bộ nhớ không phình
      e.head = 0;
    }
    if (e.q.length - e.head >= this.limit) return false;
    e.q.push(nowMs);
    return true;
  }
}

// ─── ex03 · Sliding window counter ───
// Ý tưởng: giữ 2 bộ đếm: cửa sổ hiện tại `cur` và cửa sổ liền trước `prev`; ước lượng số request trong
// cửa sổ trượt = cur + floor(prev · (W − elapsed) / W), elapsed = now mod W. Cho phép nếu ước lượng < limit.
// Độ phức tạp: O(1) time · O(1) space/user (2 số) — xấp xỉ nhưng rẻ; Cloudflare dùng cách này.
// Bẫy: khi nhảy qua ≥ 2 cửa sổ thì prev = 0 (không phải cur cũ); phải floor SAU khi nhân (prev·(W−e) ≤ 10¹² vẫn vừa
// 2⁵³ và `long`); tăng `cur` chỉ khi được phép.
// Python: `//`; Java: nhân bằng `long` rồi chia nguyên.
export class SlidingCounterLimiter {
  private limit: number;
  private w: number;
  private st = new Map<string, { k: number; cur: number; prev: number }>();
  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.w = windowMs;
  }
  allow(user: string, nowMs: number): boolean {
    const k = Math.floor(nowMs / this.w);
    let e = this.st.get(user);
    if (!e) this.st.set(user, (e = { k, cur: 0, prev: 0 }));
    if (e.k !== k) {
      e.prev = e.k === k - 1 ? e.cur : 0;
      e.cur = 0;
      e.k = k;
    }
    const elapsed = nowMs - k * this.w;
    const est = e.cur + Math.floor((e.prev * (this.w - elapsed)) / this.w);
    if (est >= this.limit) return false;
    e.cur++;
    return true;
  }
}

// ─── ex04 · Token bucket ───
// Ý tưởng: thùng chứa tối đa `capacity` token, nạp `refillPerSec` token mỗi giây (liên tục). Mỗi request tốn 1 token.
// Tính theo mili-token để toàn số nguyên (không dùng số thực → tất định ở cả 3 ngôn ngữ):
//   milli = min(capacity·1000, milli + elapsedMs · refillPerSec); cho phép nếu milli ≥ 1000 rồi trừ 1000.
// Độ phức tạp: O(1) time · O(1) space/user. Cho phép burst tới `capacity` rồi giữ tốc độ trung bình = refill.
// Bẫy: cập nhật `last` ở MỌI lần gọi (kể cả bị từ chối), nếu không sẽ nạp token hai lần cho cùng khoảng thời gian;
// elapsed · refill tới 10¹⁵ vẫn < 2⁵³ nhưng Java phải dùng `long`; chặn trần SAU khi cộng.
// Python/Java: số nguyên; đừng dùng float `tokens += elapsed * rate` rồi so `>= 1` (sai số tích lũy, khác nhau giữa ngôn ngữ).
export class TokenBucket {
  private capMilli: number;
  private rate: number;
  private st = new Map<string, { milli: number; last: number }>();
  constructor(capacity: number, refillPerSec: number) {
    this.capMilli = capacity * 1000;
    this.rate = refillPerSec;
  }
  allow(user: string, nowMs: number): boolean {
    let e = this.st.get(user);
    if (!e) this.st.set(user, (e = { milli: this.capMilli, last: nowMs }));
    e.milli = Math.min(this.capMilli, e.milli + (nowMs - e.last) * this.rate);
    e.last = nowMs;
    if (e.milli < 1000) return false;
    e.milli -= 1000;
    return true;
  }
}

// ─── ex05 · So sánh bốn limiter bằng mô phỏng burst ───
// Ý tưởng: chạy cùng chuỗi request (một user) qua bốn limiter, ghi lại thời điểm được phép, rồi dùng hai con trỏ
// tìm số request được phép NHIỀU NHẤT trong một khoảng dài windowMs (nửa mở (t − W, t]) — đó là "burst thực".
// Độ phức tạp: O(n) · O(n).
// Điều rút ra: fixed window có thể cho 2·limit trong 1 khoảng W (ở ranh giới); log đúng ≤ limit; counter xấp xỉ;
// bucket cho burst tới capacity (= limit) rồi chảy theo refillPerSec.
export function compareLimiters(limit: number, windowMs: number, refillPerSec: number, timesMs: number[]): number[] {
  const limiters = [
    new FixedWindowLimiter(limit, windowMs),
    new SlidingLogLimiter(limit, windowMs),
    new SlidingCounterLimiter(limit, windowMs),
    new TokenBucket(limit, refillPerSec),
  ];
  const out: number[] = [];
  const burst: number[] = [];
  for (const L of limiters) {
    const ok: number[] = [];
    for (const t of timesMs) if (L.allow('u', t)) ok.push(t);
    out.push(ok.length);
    let best = 0;
    let lo = 0;
    for (let hi = 0; hi < ok.length; hi++) {
      while (ok[lo] <= ok[hi] - windowMs) lo++;
      best = Math.max(best, hi - lo + 1);
    }
    burst.push(best);
  }
  return [...out, ...burst];
}
