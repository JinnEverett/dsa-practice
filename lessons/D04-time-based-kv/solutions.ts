// D04 · Đáp án best practice. Chỉ mở sau khi check ✅.

// Tìm số phần tử ≤ x trong mảng tăng dần (upper bound). Dùng chung cho cả hai bài.
function countLE(a: number[], x: number): number {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (a[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// ─── ex01 · TimeMap ───
// Ý tưởng: mỗi key giữ hai mảng song song `ts` (tăng dần vì set luôn có timestamp tăng) và `vals`.
//   get(key, t) = binary search "phần tử cuối cùng có ts ≤ t".
// Bất biến: ts của mỗi key tăng NGẶT; vals[i] là giá trị đặt tại ts[i].
// Độ phức tạp: set O(1) amortized · get O(log m) với m = số lần set của key · space O(tổng số lần set).
// Vì sao best practice: lịch sử append-only đã sắp thứ tự sẵn → không cần cây/heap; binary search là công cụ đúng.
// Bẫy: get trước mọi timestamp → trả "" (không phải null/undefined); key không tồn tại → ""; dùng lower bound thay upper bound (ts == t phải khớp);
//   nếu đề cho phép set timestamp không tăng thì phải chèn có thứ tự (O(m)) hoặc dùng cây.
// Cách khác: Map<key, TreeMap> (Java) → O(log m) cho cả set; hoặc chia theo block thời gian (hot/cold).
// Python/Java: Python `bisect.bisect_right(ts, t) - 1`; Java `Collections.binarySearch` (trả −(insertion)−1 khi không khớp — dễ sai) hoặc `TreeMap.floorEntry`.
export class TimeMap {
  private data = new Map<string, { ts: number[]; vals: string[] }>();
  set(key: string, value: string, timestamp: number): void {
    let h = this.data.get(key);
    if (!h) this.data.set(key, (h = { ts: [], vals: [] }));
    h.ts.push(timestamp);
    h.vals.push(value);
  }
  get(key: string, timestamp: number): string {
    const h = this.data.get(key);
    if (!h) return '';
    const i = countLE(h.ts, timestamp);
    return i === 0 ? '' : h.vals[i - 1];
  }
}

// ─── ex02 · SnapshotArray ───
// Ý tưởng: KHÔNG sao chép mảng mỗi lần snap. Mỗi chỉ số giữ lịch sử thưa [(snapId, val)]; snap() chỉ tăng bộ đếm.
//   set(i, v): nếu bản ghi cuối của i có snapId hiện tại thì ghi đè, ngược lại thêm bản ghi mới. get(i, s) = binary search bản ghi cuối có snapId ≤ s.
// Bất biến: hist[i] có snapId tăng ngặt; bản ghi cuối (nếu snapId = curSnap) là giá trị chưa chốt của lần snap kế tiếp.
// Độ phức tạp: set O(1) · snap O(1) · get O(log k) với k = số snapshot mà chỉ số i bị đổi · space O(length + số lần set) (không nhân với số snap).
// Vì sao best practice: lưu delta (copy-on-write theo chỉ số) thay vì toàn bộ; bộ nhớ tỷ lệ với số thay đổi, không phải length × số snap.
// Bẫy: giá trị mặc định 0 khi chưa set (hist rỗng hoặc mọi snapId > s); set hai lần trước một snap phải ghi đè (không phình hist);
//   snap trả snap_id = số snapshot trước đó (đánh số từ 0).
// Cách khác: persistent segment tree (cho snapshot cả mảng với thao tác khối); Map<index, ...> thay vì mảng khi length rất lớn và thưa.
// Python/Java: Python `bisect` trên list snapId; Java `int[]`/`ArrayList` + binary search tự viết, giá trị int.
export class SnapshotArray {
  private snapIds: number[][];
  private values: number[][];
  private cur = 0;
  constructor(length: number) {
    this.snapIds = Array.from({ length }, () => []);
    this.values = Array.from({ length }, () => []);
  }
  set(index: number, val: number): void {
    const ids = this.snapIds[index];
    const vs = this.values[index];
    if (ids.length > 0 && ids[ids.length - 1] === this.cur) vs[vs.length - 1] = val;
    else {
      ids.push(this.cur);
      vs.push(val);
    }
  }
  snap(): number {
    return this.cur++;
  }
  get(index: number, snapId: number): number {
    const i = countLE(this.snapIds[index], snapId);
    return i === 0 ? 0 : this.values[index][i - 1];
  }
}
