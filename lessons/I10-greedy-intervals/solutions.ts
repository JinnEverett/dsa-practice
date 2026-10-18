// I10 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

/**
 * ex01 · canJump
 * Ý tưởng: theo dõi ô XA NHẤT có thể tới (`far`). Duyệt i từ trái sang; nếu i > far thì bị kẹt, ngược lại far = max(far, i + nums[i]).
 * Độ phức tạp: O(n), O(1) bộ nhớ.
 * Vì sao là greedy đúng (exchange argument): tập các ô tới được luôn là một ĐOẠN LIỀN [0, far] — nếu tới được ô p thì tới được mọi ô
 *   trước p (đứng ở ô cuối của nhảy đầu tiên và bước ngắn hơn). Nên chỉ cần nhớ đầu mút phải.
 * Bẫy: DP O(n²) (dp[i] = có ai đó nhảy tới) đúng nhưng quá giờ ở n = 10⁵.
 * Cách khác: duyệt ngược giữ "ô đích gần nhất cần tới".
 * Python/Java: tương tự; Java int cộng `i + nums[i]` không tràn ở ràng buộc này.
 */
export function canJump(nums: number[]): boolean {
  let far = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > far) return false;
    if (i + nums[i] > far) far = i + nums[i];
  }
  return true;
}

/**
 * ex02 · jump
 * Ý tưởng: BFS ngầm theo "tầng". `end` = ô xa nhất tới được với `jumps` bước; `far` = ô xa nhất tới được với `jumps + 1` bước.
 *   Khi i chạm `end`, buộc phải nhảy thêm một bước: jumps++, end = far.
 * Độ phức tạp: O(n), O(1) bộ nhớ.
 * Vì sao best practice: không cần mảng dp; mỗi tầng BFS là một đoạn liền (như ex01).
 * Bẫy: duyệt tới i < n − 1 (không tính nhảy thừa ở ô cuối); n = 1 → 0.
 * Cách khác: DP O(n²); BFS thật O(n) với hàng đợi.
 * Python/Java: tương tự.
 */
export function jump(nums: number[]): number {
  let jumps = 0;
  let end = 0;
  let far = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    if (i + nums[i] > far) far = i + nums[i];
    if (i === end) {
      jumps++;
      end = far;
    }
  }
  return jumps;
}

/**
 * ex03 · eraseOverlapIntervals
 * Ý tưởng: bài "chọn nhiều khoảng không chồng nhau nhất" (activity selection). Sắp theo ĐIỂM CUỐI tăng dần, giữ khoảng nếu
 *   bắt đầu ≥ điểm cuối khoảng đã giữ gần nhất. Số cần xóa = n − số khoảng giữ được.
 * Độ phức tạp: O(n log n) (sort).
 * Vì sao best practice (exchange argument): trong mọi lời giải tối ưu, thay khoảng đầu tiên bằng khoảng kết thúc sớm nhất không làm xấu đi
 *   (nó chừa nhiều chỗ nhất cho phần còn lại) ⇒ chọn tham lam khoảng kết thúc sớm nhất rồi lặp lại.
 * Bẫy: sắp theo điểm ĐẦU rồi giữ khoảng ngắn hơn cũng đúng nhưng khó chứng minh hơn; sắp theo điểm đầu mà không xử lý chồng lấn là SAI.
 *   [1,2],[2,3] KHÔNG chồng lấn (chạm đầu mút). Java: so sánh `Integer.compare`, không `a[1] - b[1]` (tràn).
 * Cách khác: DP LIS-kiểu O(n²) hoặc O(n log n).
 * Python/Java: Python `sorted(key=lambda x: x[1])`.
 */
export function eraseOverlapIntervals(intervals: number[][]): number {
  const a = intervals.slice().sort((x, y) => x[1] - y[1]);
  let kept = 0;
  let lastEnd = -Infinity;
  for (const [s, e] of a) {
    if (s >= lastEnd) {
      kept++;
      lastEnd = e;
    }
  }
  return a.length - kept;
}

/**
 * ex04 · insertInterval
 * Ý tưởng: một lượt, ba giai đoạn: (1) chép các khoảng nằm hoàn toàn TRƯỚC (end < newStart); (2) gộp mọi khoảng chồng/chạm với new
 *   (start ≤ newEnd) bằng min/max; (3) chép phần còn lại.
 * Độ phức tạp: O(n) — input đã sắp nên không sort lại.
 * Vì sao best practice: tận dụng tiền điều kiện đã sắp; không nhét rồi sort lại O(n log n).
 * Bẫy: khoảng chạm đầu mút ([1,2] và [2,3]) phải gộp; new nằm sau tất cả / trước tất cả / intervals rỗng.
 * Cách khác: nhét rồi merge-intervals chuẩn (đúng, chậm hơn một hệ số log).
 * Python/Java: Java trả `int[][]` — dựng `List<int[]>` rồi `toArray(new int[0][])`.
 */
export function insertInterval(intervals: number[][], newInterval: number[]): number[][] {
  const out: number[][] = [];
  let [s, e] = newInterval;
  let i = 0;
  while (i < intervals.length && intervals[i][1] < s) out.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= e) {
    s = Math.min(s, intervals[i][0]);
    e = Math.max(e, intervals[i][1]);
    i++;
  }
  out.push([s, e]);
  while (i < intervals.length) out.push(intervals[i++]);
  return out;
}

/**
 * ex05 · findMinArrowShots
 * Ý tưởng: sắp theo điểm CUỐI; bắn một mũi tên ngay tại điểm cuối của quả bóng đầu tiên chưa vỡ — nó vỡ mọi quả có start ≤ điểm đó.
 *   Gặp quả có start > vị trí mũi tên hiện tại thì cần mũi tên mới.
 * Độ phức tạp: O(n log n).
 * Vì sao best practice (exchange argument): dịch mũi tên sang phải tới điểm cuối của quả bóng kết thúc sớm nhất không làm mất quả nào.
 * Bẫy: bóng chạm đầu mút ([1,2] và [2,3]) CÙNG vỡ bằng mũi tên tại 2 ⇒ so sánh `start > arrow` (không phải `>=`);
 *   tọa độ tới ±2³¹ ⇒ Java: comparator `Integer.compare`, KHÔNG `a[1] - b[1]` (tràn int).
 * Cách khác: tương đương bài "số khoảng chồng nhau tối thiểu để phủ" (clique cover trên đồ thị khoảng).
 * Python/Java: Python không tràn.
 */
export function findMinArrowShots(points: number[][]): number {
  if (points.length === 0) return 0;
  const a = points.slice().sort((x, y) => (x[1] < y[1] ? -1 : x[1] > y[1] ? 1 : 0));
  let arrows = 1;
  let pos = a[0][1];
  for (let i = 1; i < a.length; i++) {
    if (a[i][0] > pos) {
      arrows++;
      pos = a[i][1];
    }
  }
  return arrows;
}

/**
 * ex06 · canCompleteCircuit
 * Ý tưởng: nếu tổng gas < tổng cost thì −1. Ngược lại duyệt một vòng giữ `tank`; khi tank < 0 tại i, mọi điểm xuất phát trong
 *   đoạn đã duyệt đều không thể qua i ⇒ đặt start = i + 1, tank = 0.
 * Độ phức tạp: O(n), O(1).
 * Vì sao best practice (exchange argument): nếu bắt đầu ở a và đi hỏng ở b, thì bắt đầu ở bất kỳ k ∈ (a, b] cũng hỏng không muộn
 *   hơn b (vì tới k với tank ≥ 0 nên còn thua cả lúc bắt đầu từ a). Còn điều kiện tổng ≥ 0 thì start cuối cùng chắc chắn đi được cả vòng.
 * Bẫy: mô phỏng từ mọi điểm xuất phát O(n²); chuỗi hỏng giữa chừng không cần quay lại thử.
 * Cách khác: prefix sum — start = điểm sau chỗ prefix thấp nhất.
 * Python/Java: tổng gas/cost có thể lớn: Java `long` nếu giá trị tới 10⁹ (ở đây ≤ 10⁴ · 10⁵ = 10⁹ vẫn vừa int, nhưng dùng long cho an toàn).
 */
export function canCompleteCircuit(gas: number[], cost: number[]): number {
  let total = 0;
  let tank = 0;
  let start = 0;
  for (let i = 0; i < gas.length; i++) {
    const d = gas[i] - cost[i];
    total += d;
    tank += d;
    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
}

/**
 * ex07 · partitionLabels
 * Ý tưởng: lưu vị trí xuất hiện CUỐI của mỗi chữ cái. Quét i, giữ `end = max(end, last[s[i]])`; khi i === end, đoạn hiện tại khép lại.
 * Độ phức tạp: O(n), O(26).
 * Vì sao best practice: một đoạn phải chứa mọi lần xuất hiện của mọi chữ trong nó ⇒ đoạn nhỏ nhất bắt đầu từ i kết thúc khi mọi chữ đã
 *   thấy đều không còn xuất hiện về sau — tham lam cắt sớm nhất cho nhiều đoạn nhất.
 * Bẫy: đặt `end` theo chữ ĐẦU TIÊN rồi không cập nhật.
 * Cách khác: gộp khoảng [first, last] của từng chữ cái (merge intervals — chính là mục đích của module).
 * Python/Java: Python `ord(c) - 97`; Java `s.charAt(i) - 'a'`.
 */
export function partitionLabels(s: string): number[] {
  const last = new Int32Array(26);
  for (let i = 0; i < s.length; i++) last[s.charCodeAt(i) - 97] = i;
  const out: number[] = [];
  let start = 0;
  let end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s.charCodeAt(i) - 97]);
    if (i === end) {
      out.push(end - start + 1);
      start = i + 1;
    }
  }
  return out;
}

/**
 * ex08 · candy
 * Ý tưởng: hai lượt. Lượt trái → phải: nếu rating[i] > rating[i−1] thì candy[i] = candy[i−1] + 1 (thỏa láng giềng TRÁI).
 *   Lượt phải → trái: nếu rating[i] > rating[i+1] thì candy[i] = max(candy[i], candy[i+1] + 1) (thỏa láng giềng PHẢI, không phá lượt 1).
 * Độ phức tạp: O(n), O(n) bộ nhớ.
 * Vì sao best practice: tách hai ràng buộc độc lập (trái/phải); mỗi ràng buộc đáp ứng bằng lượng tối thiểu ⇒ lấy max cho cả hai.
 * Bẫy: dùng `candy[i+1] + 1` thay vì max ở lượt phải; tổng có thể tới n(n+1)/2 ≈ 5·10⁹ khi n = 10⁵ ⇒ Java phải trả `long`.
 * Cách khác: một lượt O(1) bộ nhớ đếm đoạn tăng/giảm (khó viết đúng).
 * Python/Java: Python int không tràn; Java `long` cho tổng (và `int[]` cho từng phần tử là đủ).
 */
export function candy(ratings: number[]): number {
  const n = ratings.length;
  const c = new Int32Array(n).fill(1);
  for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
  let total = c[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1] && c[i] <= c[i + 1]) c[i] = c[i + 1] + 1;
    total += c[i];
  }
  return total;
}

/**
 * ex09 · maxEvents
 * Ý tưởng: mô phỏng theo ngày. Sắp sự kiện theo ngày bắt đầu; mỗi ngày đưa các sự kiện vừa mở vào MIN-HEAP theo ngày kết thúc, bỏ
 *   những sự kiện đã hết hạn, rồi tham dự sự kiện có hạn gần nhất. Khi heap rỗng thì nhảy thẳng tới ngày bắt đầu kế tiếp.
 * Độ phức tạp: O(n log n).
 * Vì sao best practice (exchange argument): trong các sự kiện đang mở, làm sự kiện sắp hết hạn trước luôn không tệ hơn (cái kia còn
 *   thời gian). "Nhảy ngày" khi heap rỗng tránh vòng lặp 10⁹ ngày.
 * Bẫy: lặp từng ngày tới 10⁹; quên bỏ sự kiện đã hết hạn (end < today); mỗi NGÀY chỉ tham dự 1 sự kiện.
 * Cách khác: sắp theo hạn rồi dùng DSU "ngày trống kế tiếp" (A-level).
 * Python/Java: Python `heapq`, Java `PriorityQueue<Integer>`.
 */
export function maxEvents(events: number[][]): number {
  const a = events.slice().sort((x, y) => x[0] - y[0]);
  const heap = new Heap<number>((x, y) => x < y);
  let i = 0;
  let day = 0;
  let attended = 0;
  while (i < a.length || heap.size) {
    if (!heap.size) day = Math.max(day, a[i][0]);
    while (i < a.length && a[i][0] <= day) heap.push(a[i++][1]);
    while (heap.size && heap.peek()! < day) heap.pop();
    if (heap.size) {
      heap.pop();
      attended++;
      day++;
    }
  }
  return attended;
}

/**
 * ex10 · scheduleCourse
 * Ý tưởng: sắp khóa theo HẠN CHÓT. Thêm lần lượt vào lịch (cộng thời lượng vào `time`, đẩy thời lượng vào MAX-HEAP). Nếu `time`
 *   vượt hạn chót của khóa vừa thêm thì bỏ khóa DÀI NHẤT trong lịch (pop max-heap, trừ khỏi `time`).
 * Độ phức tạp: O(n log n).
 * Vì sao best practice (exchange argument): với cùng số khóa, thay một khóa dài bằng khóa ngắn hơn chỉ làm lịch dễ khả thi hơn; bỏ khóa
 *   dài nhất giữ số khóa không giảm và `time` nhỏ nhất có thể.
 * Bẫy: bỏ KHÓA VỪA THÊM thay vì khóa dài nhất; quên sắp theo hạn chót; time tới 10⁴ × 10⁴ = 10⁸ vừa int nhưng dùng long khi tăng ràng buộc.
 * Cách khác: DP O(n · maxDeadline) (chậm hơn nhiều).
 * Python/Java: Python max-heap = đẩy `-duration`; Java `new PriorityQueue<>(Collections.reverseOrder())`.
 */
export function scheduleCourse(courses: number[][]): number {
  const a = courses.slice().sort((x, y) => x[1] - y[1]);
  const heap = new Heap<number>((x, y) => x > y);
  let time = 0;
  for (const [d, last] of a) {
    heap.push(d);
    time += d;
    if (time > last) time -= heap.pop()!;
  }
  return heap.size;
}
