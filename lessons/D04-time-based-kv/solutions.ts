// D04 · Đáp án best practice. Chỉ mở sau khi check ✅.

// Tìm vị trí đầu tiên có a[i] > x (upper bound) trong mảng tăng; kết quả - 1 là phần tử cuối ≤ x.
const upperBound = (a: number[], x: number): number => {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (a[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

// ─── ex01 · TimeMap ───
// Ý tưởng: mỗi key giữ lịch sử là HAI mảng song song `ts[]` (tăng nghiêm ngặt) và `vals[]`. set = push (đề bảo đảm timestamp của một key chỉ tăng).
//   get(key, t) = tìm phần tử cuối cùng có ts ≤ t bằng binary search (upper bound − 1); không có → "".
// Bất biến: với mỗi key, ts[] tăng nghiêm ngặt, vals[i] là giá trị đặt tại ts[i].
// Độ phức tạp: set O(1) · get O(log m) với m = số lần set của key đó · space O(tổng số set).
// Vì sao best practice: lịch sử chỉ-thêm (append-only) + mảng đã sort ⇒ binary search; không cần cây cân bằng khi timestamp tăng.
// Bẫy: `get` không có phần tử ≤ t phải trả "" (index −1); dùng `<` thay `<=` bỏ sót trường hợp bằng nhau; dùng `Array.find` / `filter` O(m).
// Cách khác: nếu `set` có thể xảy ra với timestamp bất kỳ (không tăng) ⇒ cần cấu trúc có thứ tự (TreeMap, skip list — xem D09) hoặc chèn vào mảng O(m).
// Python/Java: Python `bisect.bisect_right(ts, t)`; Java `Collections.binarySearch` hoặc `TreeMap.floorEntry(t)`.
export class TimeMap {
  private store = new Map<string, { ts: number[]; vals: string[] }>();

  set(key: string, value: string, timestamp: number): void {
    let h = this.store.get(key);
    if (!h) this.store.set(key, (h = { ts: [], vals: [] }));
    h.ts.push(timestamp);
    h.vals.push(value);
  }
  get(key: string, timestamp: number): string {
    const h = this.store.get(key);
    if (!h) return '';
    const i = upperBound(h.ts, timestamp) - 1;
    return i < 0 ? '' : h.vals[i];
  }
}

// ─── ex02 · SnapshotArray (cấu hình có phiên bản) ───
// Ý tưởng: KHÔNG sao chép mảng mỗi lần snap. Mỗi chỉ số chỉ lưu các lần thay đổi: danh sách (snapId, giá trị). `snap()` chỉ tăng bộ đếm.
//   set(i, v): nếu mục cuối của i đã thuộc phiên bản hiện tại thì ghi đè, ngược lại push (snapHiện tại, v).
//   get(i, s): mục cuối của i có snapId ≤ s (binary search); chưa từng đặt → 0.
// Bất biến: với mỗi chỉ số, snapIds[] tăng nghiêm ngặt; bộ nhớ chỉ tốn cho chỉ số đã từng `set` (Map thưa).
// Độ phức tạp: set O(1) · snap O(1) · get O(log k) (k = số lần chỉ số đó đổi giữa các snapshot) · space O(tổng số set), không phụ thuộc `length` hay số lần snap.
// Vì sao best practice: copy-on-write theo từng ô (persistent theo thời gian) — cùng ý tưởng MVCC của cơ sở dữ liệu.
// Bẫy: sao chép cả mảng mỗi `snap` → O(length) mỗi lần, hết RAM; `new Array(length)` các mảng con ngay từ đầu; ghi đè sai khi `set` hai lần trong cùng phiên bản
//   (push thêm mục trùng snapId → binary search trả mục cũ).
// Cách khác: mỗi chỉ số một `TreeMap<snapId, val>` (Java) / mảng đã sort + bisect (Python); với đọc rất nhiều có thể cache.
export class SnapshotArray {
  private hist = new Map<number, { s: number[]; v: number[] }>();
  private cur = 0;

  constructor(length: number) {
    void length; // chỉ để kiểm tra biên ở nơi gọi; bộ nhớ không phụ thuộc length
  }
  set(index: number, val: number): void {
    let h = this.hist.get(index);
    if (!h) this.hist.set(index, (h = { s: [], v: [] }));
    const last = h.s.length - 1;
    if (last >= 0 && h.s[last] === this.cur) h.v[last] = val;
    else {
      h.s.push(this.cur);
      h.v.push(val);
    }
  }
  snap(): number {
    return this.cur++;
  }
  get(index: number, snapId: number): number {
    const h = this.hist.get(index);
    if (!h) return 0;
    const i = upperBound(h.s, snapId) - 1;
    return i < 0 ? 0 : h.v[i];
  }
}
