// R09 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Khoảng cách Myers giữa hai file ───
// Ý tưởng: D = số dòng thêm + xóa ít nhất = N + M − 2·LCS. Myers (1986): với d = 0, 1, 2, …, và mỗi đường chéo k = x − y
// (k từ −d đến d, bước 2), giữ `V[k]` = x xa nhất đạt được với đúng d lần sửa; từ đó "trượt" miễn phí theo đường chéo khi hai dòng giống nhau
// (snake). d đầu tiên chạm (N, M) chính là D.
// Độ phức tạp: O((N + M) · D) time · O(N + M) space (mảng V). Khi hai file gần giống nhau (D nhỏ), gần tuyến tính;
// DP LCS là O(N · M) = 10¹⁰ ở N = M = 10⁵.
// Vì sao best practice: `git diff` mặc định dùng Myers. Bản này chỉ tính khoảng cách; để in diff đầy đủ phải lưu V ở mỗi d
// rồi truy ngược (tốn O(D²) bộ nhớ) hoặc dùng biến thể "linear space" chia để trị.
// Bẫy: chỉ số âm của V (dịch bằng offset); điều kiện chọn đi xuống/đi ngang `k === -d || (k !== d && V[k−1] < V[k+1])`; quên
// trượt snake trước khi kiểm tra điểm đích; so dòng bằng `===` (chuỗi), không so tham chiếu.
// Python: list + offset; Java: `int[] v = new int[2 * max + 2]` và `String.equals`.
export function myersDistance(a: string[], b: string[]): number {
  const N = a.length;
  const M = b.length;
  const max = N + M;
  if (max === 0) return 0;
  const off = max + 1;
  const v = new Int32Array(2 * max + 3);
  for (let d = 0; d <= max; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && v[off + k - 1] < v[off + k + 1])) x = v[off + k + 1];
      else x = v[off + k - 1] + 1;
      let y = x - k;
      while (x < N && y < M && a[x] === b[y]) {
        x++;
        y++;
      }
      v[off + k] = x;
      if (x >= N && y >= M) return d;
    }
  }
  return max;
}

// ─── ex02 · Dedup có giới hạn bộ nhớ ───
// Ý tưởng: nhớ tối đa `capacity` id GẦN ĐÂY NHẤT (LRU): `seen(id)` đưa id lên đầu nếu đã có (trả true), nếu chưa có thì thêm và đuổi
// id lâu nhất khi vượt capacity (trả false).
// Độ phức tạp: O(1) mỗi thao tác · O(capacity). Đánh đổi: id đã bị đuổi sẽ bị coi là MỚI (có thể xử lý trùng) — chọn capacity theo
// khoảng thời gian trùng lặp tối đa có thể xảy ra (cửa sổ retry).
// Cách khác: Bloom filter (R07) — nhớ mọi id với bộ nhớ nhỏ hơn nhưng có sai dương (mất event thật!) và không đuổi được; thường
// kết hợp: Bloom làm bước lọc nhanh, kho chính xác (DB) xác nhận.
// Bẫy: hit phải làm mới thứ tự; kiểm tra size TRƯỚC khi chèn.
export class Dedup {
  private cap: number;
  private m = new Map<string, true>();
  constructor(capacity: number) {
    this.cap = capacity;
  }
  seen(id: string): boolean {
    const had = this.m.delete(id);
    if (!had && this.m.size >= this.cap) this.m.delete(this.m.keys().next().value!);
    this.m.set(id, true);
    return had;
  }
}

// ─── ex03 · p95 trên cửa sổ 60 giây ───
// Ý tưởng: queue các mẫu trong cửa sổ (bỏ mẫu có t ≤ now − 60000) + cây Fenwick đếm số mẫu theo giá trị latency (0..2000).
// p95 = giá trị nhỏ nhất v sao cho số mẫu ≤ v đạt hạng r = ⌈0,95·cnt⌉ = ⌊(95·cnt + 99)/100⌋ — tìm bằng binary descent trên Fenwick, O(log V).
// Độ phức tạp: add O(log V) · p95 O(log V) + dọn mẫu hết hạn (amortized O(log V)) · O(số mẫu trong cửa sổ + V).
// Vì sao best practice: sort cửa sổ ở mỗi truy vấn là O(w log w); dashboard gọi p95 liên tục. Khi latency liên tục/không giới hạn:
// t-digest / HDR histogram (bucket theo thang log) — xấp xỉ nhưng bộ nhớ cố định.
// Bẫy: dùng số thực `0.95 * cnt` (ceil sai ở biên, ví dụ cnt = 20 → 19,000000000000004 ở một số ngôn ngữ); cửa sổ rỗng → 0;
// dọn mẫu hết hạn cả khi gọi p95 (thời gian trôi dù không có mẫu mới).
const LAT = 2001;
export class P95Window {
  private q: { t: number; l: number }[] = [];
  private head = 0;
  private bit = new Int32Array(LAT + 1);
  private cnt = 0;
  private upd(l: number, d: number): void {
    for (let i = l + 1; i <= LAT; i += i & -i) this.bit[i] += d;
  }
  private expire(t: number): void {
    while (this.head < this.q.length && this.q[this.head].t <= t - 60000) {
      this.upd(this.q[this.head].l, -1);
      this.cnt--;
      this.head++;
    }
    if (this.head > 4096 && this.head * 2 > this.q.length) {
      this.q = this.q.slice(this.head);
      this.head = 0;
    }
  }
  add(t: number, latency: number): void {
    this.expire(t);
    this.q.push({ t, l: latency });
    this.upd(latency, 1);
    this.cnt++;
  }
  p95(t: number): number {
    this.expire(t);
    if (this.cnt === 0) return 0;
    let rank = Math.floor((95 * this.cnt + 99) / 100);
    let pos = 0;
    for (let step = 1 << 11; step > 0; step >>= 1) {
      const nx = pos + step;
      if (nx <= LAT && this.bit[nx] < rank) {
        pos = nx;
        rank -= this.bit[nx];
      }
    }
    return pos; // pos = số ô có tổng tích lũy < rank ⇒ giá trị cần tìm = pos (đã trừ offset 1 của Fenwick)
  }
}

// ─── ex04 · Gom sự kiện thành phiên (sessionize) ───
// Ý tưởng: một lượt duyệt, giữ cho mỗi user {thời điểm sự kiện cuối, id phiên hiện tại}. Sự kiện mới của user: nếu chưa có hoặc
// cách sự kiện trước của CHÍNH user đó > gap → mở phiên mới (id = bộ đếm toàn cục), ngược lại dùng lại id phiên.
// Độ phức tạp: O(n) time · O(#user) space — dữ liệu đã sắp theo thời gian nên không cần sort.
// Bẫy: dùng `>=` thay vì `>` ở ranh giới gap; so với sự kiện cuối của user chứ không phải sự kiện liền trước trong cả log; sắp xếp lại
// toàn bộ theo user (O(n log n), và đổi thứ tự cấp id).
// Python: dict user → [last, sid]; Java: `HashMap<String, long[]>`.
export function sessionize(users: string[], times: number[], gap: number): number[] {
  const last = new Map<string, { t: number; sid: number }>();
  const out = new Array<number>(users.length);
  let next = 0;
  for (let i = 0; i < users.length; i++) {
    const e = last.get(users[i]);
    if (e && times[i] - e.t <= gap) {
      e.t = times[i];
      out[i] = e.sid;
    } else {
      last.set(users[i], { t: times[i], sid: next });
      out[i] = next++;
    }
  }
  return out;
}

// ─── ex05 · Lấy mẫu log bằng reservoir sampling (Algorithm R) ───
// Ý tưởng: giữ k dòng đầu; với dòng thứ i (0-based, i ≥ k): chọn j ngẫu nhiên đều trong [0, i]; nếu j < k thì thay res[j] bằng dòng i.
// Sau khi duyệt n dòng, mỗi dòng nằm trong mẫu với xác suất đúng k/n (quy nạp: dòng cũ sống sót với xác suất (1 − 1/(i+1))…).
// RNG đặc tả để tất định: state = seed; next(): state = (state · 1103515245 + 12345) mod 2³¹; nextInt(b) = ⌊next() · b / 2³¹⌋.
// Độ phức tạp: O(n) time · O(k) space — một lượt, không cần biết n trước: hợp với log không đọc lại được (stream).
// Vì sao best practice: lấy mẫu "chọn ngẫu nhiên k trong n" bằng cách đọc hết log vào bộ nhớ rồi xáo là O(n) bộ nhớ.
// Bẫy: nextInt(i + 1) (không phải i); tràn `int` khi nhân state·1103515245 (TS: Math.imul rồi & 0x7fffffff; Java: `long`, mask 0x7fffffffL;
// Python: số lớn, `% 2**31`); n < k trả tất cả; k = 0 trả [].
export function sampleLog(lines: number[], k: number, seed: number): number[] {
  const res = lines.slice(0, k);
  let state = seed;
  for (let i = k; i < lines.length; i++) {
    state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff;
    const j = Math.floor((state * (i + 1)) / 2147483648);
    if (j < k) res[j] = lines[i];
  }
  return res;
}
