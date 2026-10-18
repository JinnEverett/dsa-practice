// D06 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── Cấu trúc dùng chung: SortedKeys (danh sách có thứ tự chia khối — sqrt decomposition) ───
// Ý tưởng: JS không có cây cân bằng. Giữ các khóa (số) đã sort trong nhiều KHỐI nhỏ (≤ 2B phần tử). Chèn/xóa chỉ dịch trong một khối (O(B)),
//   tìm khối bằng binary search trên phần tử đầu mỗi khối (O(log #khối)); hạng của khóa = tổng kích thước các khối đứng trước + vị trí trong khối (O(#khối)).
//   Với n = 10⁵ và B = 512 chỉ có ~100–200 khối ⇒ mọi thao tác ≈ vài trăm bước thay vì n.
// Bất biến: các khối khác rỗng, mỗi khối tăng dần, phần tử cuối khối i < phần tử đầu khối i+1; size = tổng độ dài.
// Độ phức tạp: insert/remove/rank O(B + n/B) = O(√n) · take(k) O(k + #khối) · space O(n).
// Cách khác tốt hơn về lý thuyết: skip list có "span" (D09, Redis ZSET) hoặc cây cân bằng có kích thước cây con: O(log n) mọi thao tác;
//   Fenwick tree nếu miền điểm nhỏ và nguyên; bucket theo điểm khi điểm trong một dải hẹp.
const B = 512;
const lowerBound = (a: number[], x: number): number => {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};
export class SortedKeys {
  private blocks: number[][] = [];
  size = 0;

  /** Chỉ số khối chứa (hoặc sẽ chứa) khóa: khối cuối cùng có phần tử đầu ≤ key (không có thì khối 0). */
  private locate(key: number): number {
    let lo = 0;
    let hi = this.blocks.length - 1;
    let ans = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      if (this.blocks[mid][0] <= key) {
        ans = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return ans;
  }
  insert(key: number): void {
    this.size++;
    if (this.blocks.length === 0) {
      this.blocks.push([key]);
      return;
    }
    const bi = this.locate(key);
    const b = this.blocks[bi];
    b.splice(lowerBound(b, key), 0, key);
    if (b.length > 2 * B) this.blocks.splice(bi + 1, 0, b.splice(B));
  }
  remove(key: number): void {
    const bi = this.locate(key);
    const b = this.blocks[bi];
    b.splice(lowerBound(b, key), 1);
    if (b.length === 0) this.blocks.splice(bi, 1);
    this.size--;
  }
  /** Số khóa nhỏ hơn `key` (= hạng 0-based nếu key đang có trong tập). */
  rank(key: number): number {
    const bi = this.locate(key);
    let count = 0;
    for (let i = 0; i < bi; i++) count += this.blocks[i].length;
    return count + lowerBound(this.blocks[bi], key);
  }
  /** k khóa nhỏ nhất theo thứ tự tăng dần. */
  take(k: number): number[] {
    const out: number[] = [];
    for (const b of this.blocks) {
      for (let i = 0; i < b.length && out.length < k; i++) out.push(b[i]);
      if (out.length >= k) break;
    }
    return out;
  }
}

// Mã hóa (điểm, người chơi) thành MỘT số: khóa nhỏ hơn ⇒ xếp hạng cao hơn (điểm lớn hơn; hòa thì id nhỏ hơn).
const MAX_SCORE = 1e9;
const ID_SPAN = 131072; // 2^17 > 10^5
const encode = (score: number, id: number) => (MAX_SCORE - score) * ID_SPAN + id;
const scoreOf = (key: number) => MAX_SCORE - Math.floor(key / ID_SPAN);
const idOf = (key: number) => key % ID_SPAN;

// ─── ex01 · Leaderboard ───
// Ý tưởng: `score: Map<id, điểm>` cho tra cứu/cộng dồn O(1) + `SortedKeys` giữ các khóa (điểm, id) theo thứ tự xếp hạng.
//   addScore: bỏ khóa cũ (nếu có), cộng điểm, chèn khóa mới. reset: bỏ khóa và xóa khỏi map. top(K): cộng điểm của K khóa đầu.
// Bất biến: mỗi người chơi trong `score` có đúng một khóa trong `ranks`, và ngược lại.
// Độ phức tạp: addScore/reset O(√n) · top(K) O(K + #khối) · space O(n).
// Vì sao best practice: cập nhật rẻ hơn nhiều so với sort lại (O(n log n)) và rẻ hơn quét toàn bộ (O(n)) mỗi lần hỏi top.
// Bẫy: top(K) bằng sort mỗi lần; heap kích thước K quét mọi người chơi (O(n) mỗi truy vấn); tổng K điểm vượt int (Java: long);
//   quên bỏ khóa cũ khi cộng điểm (người chơi xuất hiện hai lần trong top).
// Cách khác: heap với xóa lười (cập nhật điểm = đẩy bản ghi mới; bản cũ bị bỏ khi nổi lên) — top(K) phải pop K phần tử rồi đẩy lại: O(K log n).
// Python/Java: Java `TreeSet<long[]>`/`TreeMap` (hoặc `TreeMap<score, Set<id>>`); Python `sortedcontainers.SortedList` (ngoài chuẩn) hoặc `bisect.insort`.
export class Leaderboard {
  private score = new Map<number, number>();
  private ranks = new SortedKeys();

  addScore(playerId: number, score: number): void {
    const cur = this.score.get(playerId);
    if (cur !== undefined) this.ranks.remove(encode(cur, playerId));
    const next = (cur ?? 0) + score;
    this.score.set(playerId, next);
    this.ranks.insert(encode(next, playerId));
  }
  top(K: number): number {
    let sum = 0;
    for (const key of this.ranks.take(K)) sum += scoreOf(key);
    return sum;
  }
  reset(playerId: number): void {
    const cur = this.score.get(playerId);
    if (cur === undefined) return;
    this.ranks.remove(encode(cur, playerId));
    this.score.delete(playerId);
  }
}

// ─── ex02 · RankBoard ───
// Ý tưởng: giống Leaderboard nhưng `update` ĐẶT điểm (không cộng) và có `rank(player)`.
//   rank = (số khóa đứng trước khóa của người đó) + 1, nhờ SortedKeys.rank. top(k) = id của k khóa đầu.
// Bất biến: như Leaderboard; thứ tự = điểm giảm dần, hòa → id tăng dần (xác định duy nhất ⇒ rank không bao giờ hòa).
// Độ phức tạp: update O(√n) · rank O(√n) · top(k) O(k + #khối) · space O(n).
// Bẫy: "hạng đồng hạng" (dense/competition ranking) khác đề — đề này chốt xếp thứ tự TOÀN PHẦN bằng id; rank của người chưa có = −1;
//   khóa mã hóa (điểm × ID_SPAN + id) phải còn trong 2⁵³ (đã tính: 10⁹ × 2¹⁷ ≈ 1,3·10¹⁴).
// Cách khác: Redis ZSET (skip list có span) cho rank O(log n); với dữ liệu tĩnh/offline thì sort một lần + binary search.
export class RankBoard {
  private score = new Map<number, number>();
  private ranks = new SortedKeys();

  update(player: number, score: number): void {
    const cur = this.score.get(player);
    if (cur !== undefined) this.ranks.remove(encode(cur, player));
    this.score.set(player, score);
    this.ranks.insert(encode(score, player));
  }
  rank(player: number): number {
    const cur = this.score.get(player);
    return cur === undefined ? -1 : this.ranks.rank(encode(cur, player)) + 1;
  }
  top(k: number): number[] {
    return this.ranks.take(k).map(idOf);
  }
}
