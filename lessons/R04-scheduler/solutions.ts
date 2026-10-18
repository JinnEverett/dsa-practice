// R04 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── ex01 · Delay queue ───
// Ý tưởng: min-heap theo (runAt tăng, priority giảm, id tăng); `poll(now)` pop liên tục khi đỉnh có runAt ≤ now.
// Độ phức tạp: schedule O(log n) · poll O((số job đến hạn) · log n) · O(n) space. Poll KHÔNG đụng tới job chưa đến hạn.
// Vì sao best practice: sort lại cả danh sách ở mỗi poll là O(n log n); Redis/BullMQ cũng dùng sorted set với score = thời điểm chạy.
// Bẫy: so sánh nhiều khóa theo đúng thứ tự ưu tiên; `runAt ≤ now` (không phải `<`); job quá hạn từ lâu vẫn phải ra theo runAt.
// Python: `heapq` với tuple `(runAt, -priority, id)`. Java: `PriorityQueue<long[]>` + comparator.
export class DelayQueue {
  private h = new Heap<{ at: number; pr: number; id: number }>((a, b) => a.at < b.at || (a.at === b.at && (a.pr > b.pr || (a.pr === b.pr && a.id < b.id))));
  schedule(id: number, runAt: number, priority: number): void {
    this.h.push({ at: runAt, pr: priority, id });
  }
  poll(now: number): number[] {
    const out: number[] = [];
    while (this.h.size && this.h.peek()!.at <= now) out.push(this.h.pop()!.id);
    return out;
  }
}

// ─── ex02 · Lịch retry với exponential backoff ───
// Ý tưởng: delay_i = min(cap, base · 2^i). Tính bằng cách NHÂN ĐÔI DẦN và chặn trần ngay (d = min(2d, cap)) thay vì
// tính 2^i — 2^99 vượt long. Cộng dồn thành mốc thời gian từ lần lỗi đầu, dừng khi mốc vượt `deadline`.
// Độ phức tạp: O(attempts) · O(attempts).
// Bẫy: Java `base << i` / `base * (1L << i)` tràn khi i ≥ 31 (int) hoặc ≥ 63 (long); tính `Math.pow` bằng số thực rồi ép kiểu;
// quên dừng ở deadline; cap < base.
// Thực tế còn thêm *jitter* (ngẫu nhiên hóa) để tránh "thundering herd" — bài này bỏ jitter để kết quả tất định.
export function retrySchedule(attempts: number, baseMs: number, capMs: number, deadlineMs: number): number[] {
  const out: number[] = [];
  let d = Math.min(baseMs, capMs);
  let t = 0;
  for (let i = 0; i < attempts; i++) {
    t += d;
    if (t > deadlineMs) break;
    out.push(t);
    d = Math.min(d * 2, capMs);
  }
  return out;
}

// ─── ex03 · Timer wheel ───
// Ý tưởng: vòng `slots` ô; mỗi ô là danh sách timer. Timer có delay d đặt vào ô (cur + d) mod S kèm `rounds` = floor((d − 1) / S)
// = số lần kim chạy qua ô đó mà chưa tới lượt. Mỗi tick: kim sang ô kế, duyệt ô đó: rounds = 0 thì nổ, ngược lại rounds−−.
// Độ phức tạp: add O(1) · tick O(số timer trong ô) ≈ O(n / S) · O(n) space. Với timer rất nhiều: O(1) amortized, rẻ hơn heap O(log n).
// Vì sao best practice: hàng triệu timeout (kết nối, request) mà độ phân giải thô chấp nhận được — Kafka dùng *hierarchical* timing wheel.
// Bẫy: rounds off-by-one (delay = S phải nổ ở vòng đầu); thứ tự nổ trong cùng tick = thứ tự add (giữ thứ tự trong ô khi lọc).
export class TimerWheel {
  private S: number;
  private slots: { id: number; rounds: number }[][];
  private cur = 0;
  constructor(slots: number) {
    this.S = slots;
    this.slots = Array.from({ length: slots }, () => []);
  }
  add(id: number, delayTicks: number): void {
    this.slots[(this.cur + delayTicks) % this.S].push({ id, rounds: Math.floor((delayTicks - 1) / this.S) });
  }
  tick(): number[] {
    this.cur++;
    const slot = this.slots[this.cur % this.S];
    const fired: number[] = [];
    let keep = 0;
    for (const e of slot) {
      if (e.rounds === 0) fired.push(e.id);
      else {
        e.rounds--;
        slot[keep++] = e;
      }
    }
    slot.length = keep;
    return fired;
  }
}

// ─── ex04 · Lần chạy kế tiếp của cron (2 trường: phút, giờ) ───
// Ý tưởng: parse mỗi trường thành tập giá trị hợp lệ (có sắp xếp). Từ phút t0 = minute + 1: thử cùng giờ (tìm phút nhỏ nhất
// ≥ phút hiện tại trong tập); không có thì nhảy sang giờ khớp kế tiếp (tối đa 24 bước) và lấy phút nhỏ nhất.
// Độ phức tạp: O(60 + 24) — không phụ thuộc minute. Duyệt từng phút sẽ là O(1440) và vẫn đúng, nhưng với cron theo năm sẽ chậm.
// Bẫy: giờ trong ngày = floor(t / 60) mod 24 (epoch UTC, minute 0 là 00:00); `*/n` sinh 0, n, 2n, … < giới hạn (không phải 1..);
// minute lớn tới 10¹² — dùng floor division, không phải ép int.
const parseField = (f: string, limit: number): number[] => {
  if (f === '*') return Array.from({ length: limit }, (_, i) => i);
  if (f.startsWith('*/')) {
    const step = Number(f.slice(2));
    const out: number[] = [];
    for (let v = 0; v < limit; v += step) out.push(v);
    return out;
  }
  return f.split(',').map(Number).sort((a, b) => a - b);
};
export function nextRun(cron: string, minute: number): number {
  const [mf, hf] = cron.split(' ');
  const mins = parseField(mf, 60);
  const hours = new Set(parseField(hf, 24));
  const t0 = minute + 1;
  const hour0 = Math.floor(t0 / 60);
  const m0 = t0 - hour0 * 60;
  if (hours.has(hour0 % 24)) {
    const m = mins.find((x) => x >= m0);
    if (m !== undefined) return hour0 * 60 + m;
  }
  for (let dh = 1; dh <= 24; dh++) if (hours.has((hour0 + dh) % 24)) return (hour0 + dh) * 60 + mins[0];
  return -1; // không xảy ra với input hợp lệ
}

// ─── ex05 · Mô phỏng job queue nhiều worker có ưu tiên + retry ───
// Ý tưởng: mô phỏng theo sự kiện với 3 heap: `waiting` (job chờ tới thời điểm ready: lúc đến hoặc lúc retry),
// `ready` (đã sẵn sàng, ưu tiên cao nhất ra trước), `running` (theo thời điểm kết thúc). Mỗi vòng: xử lý job kết thúc
// (thành công → ghi finish; thất bại → ready lại sau 10·2^a), chuyển waiting→ready, gán cho worker rảnh, rồi nhảy thẳng tới
// sự kiện kế tiếp (không tăng từng giây).
// Độ phức tạp: O((n + số lần retry) log n). Mô phỏng từng đơn vị thời gian là O(T · n) — T có thể tới 10⁶ → quá giờ.
// Bẫy: bắt đầu job tại thời điểm hiện tại (không phải lúc ready); tie-break đủ 3 khóa; backoff dùng chỉ số lần thử TRƯỚC khi tăng.
export function simulateJobQueue(workers: number, jobs: number[][]): number[] {
  const n = jobs.length;
  const fin = new Array<number>(n).fill(0);
  const attempt = new Array<number>(n).fill(0);
  const readyAt = new Array<number>(n).fill(0);
  const waiting = new Heap<number>((a, b) => readyAt[a] < readyAt[b] || (readyAt[a] === readyAt[b] && a < b));
  const ready = new Heap<number>((a, b) => jobs[a][1] > jobs[b][1] || (jobs[a][1] === jobs[b][1] && (readyAt[a] < readyAt[b] || (readyAt[a] === readyAt[b] && a < b))));
  const running = new Heap<[number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]));
  for (let i = 0; i < n; i++) {
    readyAt[i] = jobs[i][0];
    waiting.push(i);
  }
  let free = workers;
  let done = 0;
  let t = 0;
  while (done < n) {
    while (running.size && running.peek()![0] <= t) {
      const [f, i] = running.pop()!;
      free++;
      if (attempt[i] < jobs[i][3]) {
        readyAt[i] = f + 10 * 2 ** attempt[i];
        attempt[i]++;
        waiting.push(i);
      } else {
        fin[i] = f;
        done++;
      }
    }
    while (waiting.size && readyAt[waiting.peek()!] <= t) ready.push(waiting.pop()!);
    while (free > 0 && ready.size) {
      const i = ready.pop()!;
      free--;
      running.push([t + jobs[i][2], i]);
    }
    if (done === n) break;
    const next = Math.min(running.size ? running.peek()![0] : Infinity, waiting.size ? readyAt[waiting.peek()!] : Infinity);
    t = next;
  }
  return fin;
}
