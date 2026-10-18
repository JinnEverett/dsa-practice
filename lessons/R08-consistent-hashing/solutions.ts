// R08 · Đáp án best practice. Chỉ mở sau khi check ✅.
//
// Hash (đặc tả trong đề): fnv1a32(s) — h = 2166136261; mỗi ký tự c: h = (h XOR c) · 16777619 mod 2³² (ASCII).
//   g(s) = fmix32(fnv1a32(s)) với fmix32(h): h ^= h>>>16; h = h·0x85ebca6b; h ^= h>>>13; h = h·0xc2b2ae35; h ^= h>>>16 (mod 2³²).
//   Test vector: fnv1a32("foobar") = 0xbf9cf968 · g("a") = 0x1a80b1b3.
function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function fmix32(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
const g = (s: string): number => fmix32(fnv1a32(s));
const cmpStr = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

// ─── ex01 · Consistent hash ring ───
// Ý tưởng: mỗi node chiếm `vnodes` điểm trên vòng 2³²: token "node#i" có vị trí g("node#i"). Key thuộc về token ĐẦU TIÊN có
// vị trí ≥ g(key) (đi theo chiều kim đồng hồ), vòng về token nhỏ nhất nếu vượt hết. Giữ các token trong mảng đã sắp →
// `getNode` là binary search O(log T).
// Độ phức tạp: getNode O(log T) · addNode/removeNode O(T log T) (xây lại mảng; hiếm hơn lookup rất nhiều) · T = tổng số token.
// Vì sao best practice: thêm/bớt 1 trong N node chỉ chuyển ≈ 1/N số key (hash `key mod N` chuyển gần như TẤT CẢ);
// vnode làm tải đều hơn (1 điểm/node cho phân bố rất lệch).
// Bẫy: so sánh số hash không dấu (`>>> 0`); hòa vị trí → theo tên token tăng dần (đặc tả); quên vòng về token đầu; `addNode` cho node
// đã tồn tại thay thế các token cũ. Python: `bisect` trên list vị trí; Java: `TreeMap<Long, ...>.ceilingEntry` (nhưng hòa vị trí cần xử lý riêng).
export class ConsistentHashRing {
  private ring: { pos: number; name: string; node: string }[] = [];
  private pos: number[] = [];
  private rebuild(): void {
    this.ring.sort((a, b) => a.pos - b.pos || cmpStr(a.name, b.name));
    this.pos = this.ring.map((t) => t.pos);
  }
  addNode(node: string, vnodes: number): void {
    this.ring = this.ring.filter((t) => t.node !== node);
    for (let i = 0; i < vnodes; i++) {
      const name = node + '#' + i;
      this.ring.push({ pos: g(name), name, node });
    }
    this.rebuild();
  }
  removeNode(node: string): void {
    this.ring = this.ring.filter((t) => t.node !== node);
    this.rebuild();
  }
  getNode(key: string): string {
    if (this.ring.length === 0) return '';
    const p = g(key);
    let lo = 0;
    let hi = this.pos.length; // token đầu tiên có pos ≥ p
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.pos[mid] >= p) hi = mid;
      else lo = mid + 1;
    }
    return this.ring[lo === this.pos.length ? 0 : lo].node;
  }
}

// ─── ex02 · Tỉ lệ key phải di chuyển khi thêm node ───
// Ý tưởng: dựng vòng với `nodes`, ghi chủ của "key0".."key{keys-1}", thêm `newNode`, đếm số key đổi chủ.
// Độ phức tạp: O((keys + T) log T). Kỳ vọng ≈ 1/(N+1) với N node cũ; mọi key di chuyển đều chuyển SANG node mới (không bao giờ giữa hai node cũ).
// Điều rút ra: so với `hash(key) mod N`, nơi ≈ N/(N+1) số key phải di chuyển.
export function movedFraction(nodes: string[], vnodes: number, newNode: string, keys: number): number {
  const ring = new ConsistentHashRing();
  for (const n of nodes) ring.addNode(n, vnodes);
  const before = new Array<string>(keys);
  for (let i = 0; i < keys; i++) before[i] = ring.getNode('key' + i);
  ring.addNode(newNode, vnodes);
  let moved = 0;
  for (let i = 0; i < keys; i++) if (ring.getNode('key' + i) !== before[i]) moved++;
  return moved / keys;
}

// ─── ex03 · Rendezvous (highest random weight) hashing ───
// Ý tưởng: với mỗi node tính điểm g(node + ":" + key); key thuộc node có điểm CAO NHẤT (hòa → tên node nhỏ hơn).
// Độ phức tạp: O(N) mỗi lookup, không cần cấu trúc dữ liệu, không cần vnode; bớt/thêm node chỉ chuyển đúng các key mà node đó thắng.
// So với ring: đơn giản hơn, cân bằng tốt tự nhiên; chậm hơn khi N lớn (ring O(log T)) — chấp nhận được với N ≤ vài trăm.
// Bẫy: so sánh điểm là số KHÔNG DẤU; hòa phải có tie-break tất định; danh sách rỗng → "".
export function rendezvousPick(key: string, nodes: string[]): string {
  let best = '';
  let bestScore = -1;
  for (const n of nodes) {
    const s = g(n + ':' + key);
    if (s > bestScore || (s === bestScore && n < best)) {
      bestScore = s;
      best = n;
    }
  }
  return best;
}

// ─── ex04 · Merkle root ───
// Ý tưởng: lá = H("L" + block); node trong = H("N" + trái + phải); H = fnv1a32 viết 8 chữ số hex thường. Ghép cặp từ trái sang phải
// ở mỗi tầng; nếu số node lẻ, node cuối được THĂNG LÊN tầng trên nguyên vẹn (không nhân đôi). Một khối → gốc = lá. Không có khối → "".
// Độ phức tạp: O(n) hash · O(n) bộ nhớ. Tiền tố "L"/"N" ngăn tấn công "second preimage" (nối hai lá giả làm một nút trong).
// Bẫy: hex thiếu số 0 đầu (`toString(16)` không pad); thứ tự trái/phải; nhân đôi nút lẻ (Bitcoin làm vậy — đề này KHÔNG).
const hex8 = (n: number) => n.toString(16).padStart(8, '0');
const H = (s: string) => hex8(fnv1a32(s));
export function merkleRoot(blocks: string[]): string {
  if (blocks.length === 0) return '';
  let level = blocks.map((b) => H('L' + b));
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i + 1 < level.length; i += 2) next.push(H('N' + level[i] + level[i + 1]));
    if (level.length % 2 === 1) next.push(level[level.length - 1]);
    level = next;
  }
  return level[0];
}

// ─── ex05 · Merkle tree cập nhật tăng dần ───
// Ý tưởng: lưu mọi tầng của cây (levels[0] = lá). `update(i, block)` tính lại lá i rồi đi lên: ở mỗi tầng chỉ băm lại MỘT nút cha
// (cặp chứa nút vừa đổi; nếu nút đó là nút lẻ cuối thì nó thăng lên nguyên vẹn).
// Độ phức tạp: update O(log n) hash · root O(1) · O(n) bộ nhớ. Dựng lại toàn bộ cây sau mỗi cập nhật là O(n) hash.
// Vì sao best practice: đây là cách đồng bộ bản sao (Cassandra anti-entropy, Git, blockchain) — so hai gốc: bằng nhau → xong; khác → đi xuống
// chỉ những nhánh khác nhau, tìm khối lệch trong O(d log n).
export class MerkleSync {
  private levels: string[][] = [];
  constructor(blocks: string[]) {
    if (blocks.length === 0) return;
    let level = blocks.map((b) => H('L' + b));
    this.levels.push(level);
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i + 1 < level.length; i += 2) next.push(H('N' + level[i] + level[i + 1]));
      if (level.length % 2 === 1) next.push(level[level.length - 1]);
      this.levels.push(next);
      level = next;
    }
  }
  update(i: number, block: string): void {
    this.levels[0][i] = H('L' + block);
    for (let l = 0; l + 1 < this.levels.length; l++) {
      const cur = this.levels[l];
      const p = i >> 1;
      const left = 2 * p;
      this.levels[l + 1][p] = left + 1 < cur.length ? H('N' + cur[left] + cur[left + 1]) : cur[left];
      i = p;
    }
  }
  root(): string {
    return this.levels.length ? this.levels[this.levels.length - 1][0] : '';
  }
}
