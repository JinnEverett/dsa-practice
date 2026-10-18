// R03 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── ex01 · Feed gộp với cursor ───
// Ý tưởng: mỗi feed đã sắp giảm dần theo key = ts·10⁶ + id. Với mỗi trang: binary search vị trí đầu tiên có key < cursor
// trong từng feed (O(k log n)), rồi k-way merge bằng max-heap, lấy đúng `limit` phần tử (O(limit log k)).
// Độ phức tạp mỗi trang: O(k log n + limit log k) — KHÔNG phụ thuộc tổng số bài; không bao giờ gộp + sort cả kho.
// Vì sao best practice: cursor theo *key* (không theo offset) ổn định khi có bài mới chèn vào đầu — phân trang offset
// sẽ lặp/mất bài. Cursor chứa vị trí duy nhất (ts, id) nên mọi trang là một truy vấn độc lập, không giữ trạng thái server.
// Bẫy: key = ts·10⁶ + id lên tới 10¹⁵ → vẫn < 2⁵³ trong TS, nhưng Java phải `long`; dùng `<` chặt (cursor là bài cuối của trang trước).
// Python: `bisect` với `key=` (3.10+) hoặc tự viết; `heapq.merge` cho phần merge. Java: `PriorityQueue<int[]>`.
export class FeedMerger {
  private feeds: number[][][];
  constructor(feeds: number[][][]) {
    this.feeds = feeds;
  }
  private static key(p: number[]): number {
    return p[0] * 1_000_000 + p[1];
  }
  page(cursor: number, limit: number): number[][] {
    type Item = { key: number; f: number; i: number };
    const heap = new Heap<Item>((a, b) => a.key > b.key); // max-heap theo key
    for (let f = 0; f < this.feeds.length; f++) {
      const feed = this.feeds[f];
      let lo = 0;
      let hi = feed.length; // tìm i nhỏ nhất với key(feed[i]) < cursor (feed giảm dần)
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (FeedMerger.key(feed[mid]) < cursor) hi = mid;
        else lo = mid + 1;
      }
      if (lo < feed.length) heap.push({ key: FeedMerger.key(feed[lo]), f, i: lo });
    }
    const out: number[][] = [];
    while (out.length < limit && heap.size) {
      const { f, i } = heap.pop()!;
      out.push(this.feeds[f][i]);
      if (i + 1 < this.feeds[f].length) heap.push({ key: FeedMerger.key(this.feeds[f][i + 1]), f, i: i + 1 });
    }
    return out;
  }
}

// ─── ex02 · Top K từ thường xuyên nhất ───
// Ý tưởng: đếm bằng Map, rồi giữ min-heap kích thước k theo "độ tệ" (tần suất thấp hơn, hoặc bằng nhưng từ lớn hơn)
// để đỉnh heap luôn là phần tử đáng bị loại nhất. Cuối cùng pop hết rồi đảo.
// Độ phức tạp: O(n + m log k) với m = số từ khác nhau · O(m) space.
// Vì sao best practice: sort cả m từ là O(m log m); heap nhỏ k tốt khi k ≪ m, và là khung dùng được cho stream (ex03).
// Bẫy: so sánh tie-break theo thứ tự chữ cái *tăng* trong khi heap giữ "tệ nhất" → đảo chiều; Python `heapq.nsmallest`
// với key `(-count, word)` cho kết quả gọn; Java `PriorityQueue` comparator ngược.
export function topKFrequentWords(words: string[], k: number): string[] {
  const cnt = new Map<string, number>();
  for (const w of words) cnt.set(w, (cnt.get(w) ?? 0) + 1);
  return selectTop(cnt, k);
}
function selectTop(cnt: Map<string, number>, k: number): string[] {
  type E = [string, number];
  const worse = (a: E, b: E) => a[1] < b[1] || (a[1] === b[1] && a[0] > b[0]); // a "tệ" hơn b
  const h = new Heap<E>(worse);
  for (const e of cnt) {
    if (h.size < k) h.push(e);
    else if (worse(h.peek()!, e)) {
      h.pop();
      h.push(e);
    }
  }
  const out: string[] = [];
  while (h.size) out.push(h.pop()![0]);
  return out.reverse();
}

// ─── ex03 · TopKCounter (stream) ───
// Ý tưởng: bộ đếm Map<item, count> cập nhật O(1) mỗi `add`; `top(k)` chọn k phần tử tốt nhất bằng heap kích thước k.
// Độ phức tạp: add O(1) · top O(m log k) · O(m) space.
// Vì sao best practice (trong phạm vi bài): đơn giản, đúng, tận dụng ex02. Nếu top(k) được gọi RẤT dày và m lớn:
// giữ cấu trúc xếp hạng cập nhật dần (bucket theo count, hoặc cây cân bằng) để top(k) còn O(k). Nếu bộ nhớ là vấn đề
// khi m quá lớn: Space-Saving / Count-Min Sketch + heap (R07) cho top-K xấp xỉ.
// Bẫy: gọi top khi k > số phần tử khác nhau → trả ít hơn k; tie-break theo chữ cái.
export class TopKCounter {
  private cnt = new Map<string, number>();
  add(item: string): void {
    this.cnt.set(item, (this.cnt.get(item) ?? 0) + 1);
  }
  top(k: number): string[] {
    return selectTop(this.cnt, k);
  }
}

// ─── ex04 · Trending tag trong cửa sổ 1 giờ ───
// Ý tưởng: queue các bài trong cửa sổ + Map<tag, count>. Ở mỗi thao tác, bỏ các bài có thời gian ≤ t − 3 600 000
// (giảm count; count = 0 thì xóa tag). `top(k, t)` chọn k tag bằng heap trên các tag còn đang hoạt động.
// Độ phức tạp: post O(1) amortized · top O(a log k) với a = số tag đang hoạt động · O(số bài trong cửa sổ) space.
// Bẫy: dọn cửa sổ cả khi gọi `top` (thời gian trôi dù không ai đăng); khoảng nửa mở (t − W, t]; `shift()` O(n) → chỉ số đầu.
// Cách khác: bucket theo phút (60 ô) cho xấp xỉ rẻ bộ nhớ — chính xác chỉ đến độ phân giải của ô.
const HOUR = 3_600_000;
export class Trending {
  private q: { tag: string; t: number }[] = [];
  private head = 0;
  private cnt = new Map<string, number>();
  private expire(t: number): void {
    while (this.head < this.q.length && this.q[this.head].t <= t - HOUR) {
      const tag = this.q[this.head++].tag;
      const c = this.cnt.get(tag)! - 1;
      if (c === 0) this.cnt.delete(tag);
      else this.cnt.set(tag, c);
    }
    if (this.head > 4096 && this.head * 2 > this.q.length) {
      this.q = this.q.slice(this.head);
      this.head = 0;
    }
  }
  post(tag: string, t: number): void {
    this.expire(t);
    this.q.push({ tag, t });
    this.cnt.set(tag, (this.cnt.get(tag) ?? 0) + 1);
  }
  top(k: number, t: number): string[] {
    this.expire(t);
    return selectTop(this.cnt, k);
  }
}

// ─── ex05 · Gộp timeline k nguồn, lấy `limit` mốc sớm nhất ───
// Ý tưởng: min-heap chứa phần tử đầu của mỗi stream; pop `limit` lần, mỗi lần đẩy phần tử kế tiếp của stream vừa pop.
// Độ phức tạp: O(k + limit log k) — KHÔNG đụng tới phần còn lại của 10⁶ phần tử · O(k) space phụ.
// Vì sao best practice: gộp rồi sort là O(N log N); khi limit ≪ N, heap rẻ hơn hàng trăm lần (xem bench).
// Bẫy: stream rỗng; limit lớn hơn tổng số phần tử; trùng giá trị giữa các stream phải giữ cả hai.
// Python: `heapq.merge(*streams)` + `islice`. Java: `PriorityQueue<long[]>` hoặc mảng chỉ số.
export function mergeTimelines(streams: number[][], limit: number): number[] {
  const h = new Heap<{ v: number; s: number; i: number }>((a, b) => a.v < b.v);
  for (let s = 0; s < streams.length; s++) if (streams[s].length) h.push({ v: streams[s][0], s, i: 0 });
  const out: number[] = [];
  while (out.length < limit && h.size) {
    const { v, s, i } = h.pop()!;
    out.push(v);
    if (i + 1 < streams[s].length) h.push({ v: streams[s][i + 1], s, i: i + 1 });
  }
  return out;
}
