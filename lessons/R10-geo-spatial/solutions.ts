// R10 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { Heap } from '../I04-heap/solutions.ts';

// ─── ex01 · Geohash ───
// Ý tưởng: chia đôi liên tiếp khoảng kinh độ [−180, 180] và vĩ độ [−90, 90], xen kẽ BẮT ĐẦU BẰNG KINH ĐỘ: bit = 1 nếu giá trị ≥ điểm giữa
// (rồi lấy nửa trên), 0 nếu nhỏ hơn. Cứ 5 bit đổi thành 1 ký tự base32 "0123456789bcdefghjkmnpqrstuvwxyz" (không có a, i, l, o).
// Độ phức tạp: O(5 · precision).
// Vì sao quan trọng: các điểm gần nhau thường chung tiền tố ⇒ tìm theo vùng = tìm theo tiền tố chuỗi (index B-tree/prefix trong DB).
// Bẫy: bắt đầu bằng kinh độ, không phải vĩ độ; so sánh `>=` (biên thuộc nửa trên: lat = 90 → toàn bit 1); hai điểm sát nhau qua ranh giới ô vẫn
// có tiền tố khác hẳn (cần tra thêm 8 ô lân cận); precision 12 ≈ 3,7 cm × 1,9 cm.
// Python/Java: vòng lặp bit y hệt; không có thư viện chuẩn.
const B32 = '0123456789bcdefghjkmnpqrstuvwxyz';
export function geohash(lat: number, lon: number, precision: number): string {
  let latLo = -90;
  let latHi = 90;
  let lonLo = -180;
  let lonHi = 180;
  let isLon = true;
  let bits = 0;
  let ch = 0;
  let out = '';
  while (out.length < precision) {
    if (isLon) {
      const mid = (lonLo + lonHi) / 2;
      if (lon >= mid) {
        ch = (ch << 1) | 1;
        lonLo = mid;
      } else {
        ch <<= 1;
        lonHi = mid;
      }
    } else {
      const mid = (latLo + latHi) / 2;
      if (lat >= mid) {
        ch = (ch << 1) | 1;
        latLo = mid;
      } else {
        ch <<= 1;
        latHi = mid;
      }
    }
    isLon = !isLon;
    if (++bits === 5) {
      out += B32[ch];
      bits = 0;
      ch = 0;
    }
  }
  return out;
}

// ─── ex02 · Khoảng cách haversine ───
// Ý tưởng: khoảng cách cung tròn lớn trên cầu bán kính R = 6371,0 km:
//   a = sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2) · d = 2R · asin(√a)   (φ = vĩ độ, λ = kinh độ, đổi sang radian).
// Độ phức tạp: O(1).
// Vì sao best practice: công thức "cosine lượng giác cầu" `acos(sin φ1 sin φ2 + cos φ1 cos φ2 cos Δλ)` mất chính xác cho khoảng cách rất nhỏ
// (acos gần 1 đạo hàm vô hạn) — haversine ổn định. Trái đất không phải hình cầu hoàn hảo: sai số tới ~0,5% so với elip (Vincenty).
// Bẫy: quên đổi độ → radian; dùng `sin²(Δφ)` thay vì `sin²(Δφ/2)`; kẹp `a` vào [0, 1] trước `asin/sqrt` (sai số làm tròn có thể cho a = 1,0000000000000002).
const RAD = Math.PI / 180;
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * RAD;
  const dLon = (lon2 - lon1) * RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371.0 * Math.asin(Math.sqrt(Math.min(1, a)));
}

// ─── ex03 · Chỉ mục lưới (uniform grid) ───
// Ý tưởng: chia mặt phẳng thành ô vuông cạnh `cell`; mỗi ô giữ tập id điểm bên trong. Truy vấn bán kính r quanh (x, y): chỉ duyệt các ô giao
// với hình vuông [x−r, x+r] × [y−r, y+r], rồi lọc chính xác bằng khoảng cách bình phương ≤ r².
// Độ phức tạp: add/move O(1) · withinRadius O((r/cell + 1)² + số điểm trong các ô đó). Quét tuyến tính là O(#điểm).
// Vì sao best practice: dữ liệu phân bố đều, cập nhật vị trí liên tục (tài xế, game) ⇒ lưới rẻ và đơn giản hơn quadtree/k-d tree
// (cây khó cập nhật). Dữ liệu dồn cụm: quadtree thích nghi tốt hơn. Chọn cell ≈ bán kính truy vấn thường gặp.
// Bẫy: khóa ô dùng `floor` (không `trunc`) cho tọa độ âm; so sánh khoảng cách BÌNH PHƯƠNG, bao gồm biên (≤); `move` phải gỡ khỏi ô cũ;
// r lớn so với cell ⇒ vòng lặp ô khổng lồ — nếu số ô cần duyệt lớn hơn số ô có điểm thì duyệt các ô có điểm.
// Python: `dict[(cx, cy)] -> set`; Java: `HashMap<Long, Set<Integer>>` với khóa ghép `cx * M + cy`.
const OFF = 1 << 21;
export class GridIndex {
  private cell: number;
  private pts = new Map<number, { x: number; y: number; key: number }>();
  private cells = new Map<number, Set<number>>();
  constructor(cell: number) {
    this.cell = cell;
  }
  private keyOf(x: number, y: number): number {
    return (Math.floor(x / this.cell) + OFF) * 4194304 + (Math.floor(y / this.cell) + OFF);
  }
  add(id: number, x: number, y: number): void {
    this.move(id, x, y);
  }
  move(id: number, x: number, y: number): void {
    const old = this.pts.get(id);
    if (old) {
      const s = this.cells.get(old.key)!;
      s.delete(id);
      if (s.size === 0) this.cells.delete(old.key);
    }
    const key = this.keyOf(x, y);
    let s = this.cells.get(key);
    if (!s) this.cells.set(key, (s = new Set()));
    s.add(id);
    this.pts.set(id, { x, y, key });
  }
  withinRadius(x: number, y: number, r: number): number[] {
    const out: number[] = [];
    const r2 = r * r;
    const test = (id: number) => {
      const p = this.pts.get(id)!;
      const dx = p.x - x;
      const dy = p.y - y;
      if (dx * dx + dy * dy <= r2) out.push(id);
    };
    const x0 = Math.floor((x - r) / this.cell);
    const x1 = Math.floor((x + r) / this.cell);
    const y0 = Math.floor((y - r) / this.cell);
    const y1 = Math.floor((y + r) / this.cell);
    if ((x1 - x0 + 1) * (y1 - y0 + 1) <= this.cells.size) {
      for (let cx = x0; cx <= x1; cx++)
        for (let cy = y0; cy <= y1; cy++) {
          const s = this.cells.get((cx + OFF) * 4194304 + (cy + OFF));
          if (s) for (const id of s) test(id);
        }
    } else {
      for (const [key, s] of this.cells) {
        const cx = Math.floor(key / 4194304) - OFF;
        const cy = (key % 4194304) - OFF;
        if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) for (const id of s) test(id);
      }
    }
    return out.sort((a, b) => a - b);
  }
}

// ─── ex04 · k điểm gần nhất ───
// Ý tưởng: duyệt một lượt, giữ max-heap kích thước k theo (khoảng cách², chỉ số): đỉnh là điểm XA NHẤT trong k hiện tại; điểm mới tốt hơn đỉnh thì thay.
// Cuối cùng lấy ra và đảo. Tie-break theo chỉ số nằm trong so sánh.
// Độ phức tạp: O(n log k) time · O(k) space. Sort cả n điểm là O(n log n); với k ≪ n (k = 10, n = 5·10⁵) heap thắng rõ.
// Cách khác: quickselect O(n) trung bình (A12); k-d tree khi cùng tập điểm được truy vấn nhiều lần.
// Bẫy: dùng khoảng cách² (không sqrt) — với |tọa độ| ≤ 3·10⁷, d² ≤ 7,2·10¹⁵ < 2⁵³ nên số thực của TS vẫn chính xác; Java phải `long`;
// k lớn hơn n; thứ tự trả về (dist², index).
export function kNearest(pts: number[][], x: number, y: number, k: number): number[] {
  type E = { d: number; i: number };
  const farther = (a: E, b: E) => a.d > b.d || (a.d === b.d && a.i > b.i);
  const h = new Heap<E>(farther);
  for (let i = 0; i < pts.length; i++) {
    const dx = pts[i][0] - x;
    const dy = pts[i][1] - y;
    const e = { d: dx * dx + dy * dy, i };
    if (h.size < k) h.push(e);
    else if (k > 0 && farther(h.peek()!, e)) {
      h.pop();
      h.push(e);
    }
  }
  const out: number[] = [];
  while (h.size) out.push(h.pop()!.i);
  return out.reverse();
}

// ─── ex05 · Chỉ mục tài xế gần nhất ───
// Ý tưởng: lưới ô cạnh CELL; `nearest` duyệt các "vòng" ô quanh ô chứa điểm truy vấn: vòng r gồm các ô có khoảng cách Chebyshev (theo chỉ số ô) đúng r.
// Sau khi quét xong vòng r, mọi điểm CHƯA quét cách truy vấn > r·CELL (chúng nằm ở ô cách ≥ r+1 theo một trục). Nên dừng ngay khi đã có ≥ k ứng viên và
// ứng viên thứ k có khoảng cách ≤ r·CELL. Kết quả sắp (khoảng cách², id).
// Độ phức tạp: update/remove O(1) · nearest O(số ô trong vòng đã quét + ứng viên) — với tài xế rải đều cỡ vài vòng, độc lập với tổng số tài xế.
// Quét tuyến tính mọi tài xế là O(#tài xế) mỗi truy vấn.
// Bẫy: chỉ quét ô của điểm truy vấn (bỏ sót tài xế ngay bên kia ranh giới ô) hoặc dừng ngay khi "đủ k" (chưa chắc là k gần nhất); vòng r = 0 chỉ có 1 ô;
// cần giới hạn số vòng (hết lưới thì dừng); `update` id có sẵn là di chuyển.
const CELL = 512;
const GRID = Math.ceil(100001 / CELL); // tọa độ ∈ [0, 100000]
export class DriverIndex {
  private pos = new Map<number, { x: number; y: number }>();
  private cells = new Map<number, Set<number>>();
  private static key(cx: number, cy: number): number {
    return cx * 1024 + cy;
  }
  private cellKey(x: number, y: number): number {
    return DriverIndex.key(Math.floor(x / CELL), Math.floor(y / CELL));
  }
  private detach(id: number): void {
    const p = this.pos.get(id);
    if (!p) return;
    const k = this.cellKey(p.x, p.y);
    const s = this.cells.get(k)!;
    s.delete(id);
    if (s.size === 0) this.cells.delete(k);
    this.pos.delete(id);
  }
  update(driverId: number, x: number, y: number): void {
    this.detach(driverId);
    this.pos.set(driverId, { x, y });
    const k = this.cellKey(x, y);
    let s = this.cells.get(k);
    if (!s) this.cells.set(k, (s = new Set()));
    s.add(driverId);
  }
  remove(driverId: number): void {
    this.detach(driverId);
  }
  nearest(x: number, y: number, k: number): number[] {
    const cands: { d: number; id: number }[] = [];
    const qx = Math.floor(x / CELL);
    const qy = Math.floor(y / CELL);
    const scan = (cx: number, cy: number) => {
      if (cx < 0 || cy < 0 || cx >= GRID || cy >= GRID) return;
      const s = this.cells.get(DriverIndex.key(cx, cy));
      if (!s) return;
      for (const id of s) {
        const p = this.pos.get(id)!;
        const dx = p.x - x;
        const dy = p.y - y;
        cands.push({ d: dx * dx + dy * dy, id });
      }
    };
    const less = (a: { d: number; id: number }, b: { d: number; id: number }) => a.d - b.d || a.id - b.id;
    for (let r = 0; r <= GRID; r++) {
      if (r === 0) scan(qx, qy);
      else {
        for (let cx = qx - r; cx <= qx + r; cx++) {
          scan(cx, qy - r);
          scan(cx, qy + r);
        }
        for (let cy = qy - r + 1; cy <= qy + r - 1; cy++) {
          scan(qx - r, cy);
          scan(qx + r, cy);
        }
      }
      if (cands.length >= k) {
        cands.sort(less);
        const lim = r * CELL;
        if (cands[k - 1].d <= lim * lim) break;
      }
    }
    cands.sort(less);
    return cands.slice(0, k).map((c) => c.id);
  }
}
