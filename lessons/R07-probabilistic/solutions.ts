// R07 · Đáp án best practice. Chỉ mở sau khi check ✅.
//
// Hash (đặc tả trong đề, tất định ở cả 3 ngôn ngữ): item chỉ gồm ký tự ASCII (mã 0..127).
//   fnv1a32(s): h = 2166136261; với mỗi ký tự c: h = (h XOR c) · 16777619 mod 2³².
//   fmix32(h): h ^= h >>> 16; h = h · 0x85ebca6b; h ^= h >>> 13; h = h · 0xc2b2ae35; h ^= h >>> 16  (nhân mod 2³²; MurmurHash3 finalizer).
//   g(s) = fmix32(fnv1a32(s)).
//   h1 = g(s) · h2 = g(s + "#") · vị trí thứ i (i = 0..k−1) = (h1 + i·h2) mod m, tính bằng số nguyên 64-bit.
// Vì sao phải có fmix32: FNV-1a thuần có bit trộn kém; h2 = fnv(s + "#") lại là hàm tuyến tính của h1, nên các vị trí
// tương quan mạnh. Đo thật (n = 1000, m = 9586, k = 7, 2·10⁵ probe): FNV thuần cho sai dương 2,59% so với lý thuyết 1,00%;
// có fmix32 cho 0,94%.
// Test vector: fnv1a32("") = 0x811c9dc5 · "a" = 0xe40c292c · "foobar" = 0xbf9cf968.

export function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // nhân mod 2³² (Math.imul giữ 32 bit thấp; KHÔNG dùng `*` vì vượt 2⁵³)
  }
  return h >>> 0;
}
export function fmix32(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
export const g = (s: string): number => fmix32(fnv1a32(s));
/** Vị trí của item trong bảng m ô, k hàm: (h1 + i·h2) mod m. h1 + i·h2 < 2³² · 31 nên vẫn chính xác trong double. */
function positions(item: string, k: number, m: number): number[] {
  const h1 = g(item);
  const h2 = g(item + '#');
  const out = new Array<number>(k);
  for (let i = 0; i < k; i++) out[i] = (h1 + i * h2) % m;
  return out;
}

// ─── ex01 · Bloom filter ───
// Ý tưởng: mảng m bit, k vị trí băm cho mỗi item. add: bật k bit. mightContain: cả k bit đều bật → "có thể có"
// (có thể sai dương), có ít nhất một bit tắt → "chắc chắn không". KHÔNG có sai âm; không xóa được.
// Độ phức tạp: O(k) mỗi thao tác · m bit (dùng Uint8Array bit-packed hoặc Uint32Array).
// Vì sao best practice: lọc trước một nơi lưu trữ đắt (DB, đĩa): "chắc chắn không có" → khỏi gọi. 10⁷ item ≈ 12 MB với p = 1%
// so với hàng trăm MB cho HashSet<String>.
// Bẫy: nhân `h * 16777619` bằng `*` thường (mất chính xác > 2⁵³) — dùng `Math.imul`; `>>> 0` để ra số không dấu;
// Java: `long` và mask `0xFFFFFFFFL`, vì `int` có dấu → `%` âm.
// Python: số nguyên lớn nên `& 0xFFFFFFFF` sau mỗi bước nhân. Java: `bits` là `long[]`/`BitSet`.
export class BloomFilter {
  private m: number;
  private k: number;
  private bits: Uint8Array;
  constructor(m: number, k: number) {
    this.m = m;
    this.k = k;
    this.bits = new Uint8Array((m + 7) >> 3);
  }
  add(item: string): void {
    for (const p of positions(item, this.k, this.m)) this.bits[p >> 3] |= 1 << (p & 7);
  }
  mightContain(item: string): boolean {
    for (const p of positions(item, this.k, this.m)) if (!(this.bits[p >> 3] & (1 << (p & 7)))) return false;
    return true;
  }
}

// ─── ex02 · Tỉ lệ sai dương: lý thuyết vs đo thật ───
// Ý tưởng: sau n lần chèn, mỗi bit còn 0 với xác suất (1 − 1/m)^(kn) ≈ e^(−kn/m) ⇒ tỉ lệ sai dương ≈ (1 − e^(−kn/m))^k.
// Hàm chèn "key0".."key{n−1}" rồi thử "probe0".."probe{probes−1}" (không bao giờ được chèn) để đếm tỉ lệ sai dương THỰC.
// Độ phức tạp: O((n + probes) · k).
// Điều rút ra: công thức khớp thực tế khi m, n lớn; sai lệch ở m nhỏ vì xấp xỉ e^x và vì hash không hoàn toàn ngẫu nhiên.
export function measureBloom(n: number, m: number, k: number, probes: number): number[] {
  const bf = new BloomFilter(m, k);
  for (let i = 0; i < n; i++) bf.add('key' + i);
  let fp = 0;
  for (let i = 0; i < probes; i++) if (bf.mightContain('probe' + i)) fp++;
  const theory = Math.pow(1 - Math.exp((-k * n) / m), k);
  return [theory, probes === 0 ? 0 : fp / probes];
}

// ─── ex03 · Count-Min Sketch ───
// Ý tưởng: bảng depth × width số đếm. add(item, c): với mỗi hàng r cộng c vào ô (h1 + r·h2) mod width. estimate = MIN các ô
// của item (va chạm chỉ làm số đếm TĂNG, nên min là ước lượng không bao giờ thấp hơn thật: luôn ≥ đếm thật).
// Độ phức tạp: O(depth) · bộ nhớ cố định width·depth bất kể số item.
// Vì sao best practice: top-K / tần suất trên luồng vô hạn với bộ nhớ chặn trước; sai số ≤ ε·N với xác suất 1 − δ khi
// width = ⌈e/ε⌉, depth = ⌈ln(1/δ)⌉.
// Bẫy: dùng cùng một vị trí cho mọi hàng (mất ý nghĩa nhiều hàng); đếm trượt int ở Java khi tổng > 2³¹ (đề giới hạn ≤ 10⁹).
export class CountMinSketch {
  private w: number;
  private d: number;
  private t: Int32Array;
  constructor(width: number, depth: number) {
    this.w = width;
    this.d = depth;
    this.t = new Int32Array(width * depth);
  }
  add(item: string, count: number): void {
    const h1 = g(item);
    const h2 = g(item + '#');
    for (let r = 0; r < this.d; r++) this.t[r * this.w + ((h1 + r * h2) % this.w)] += count;
  }
  estimate(item: string): number {
    const h1 = g(item);
    const h2 = g(item + '#');
    let best = Infinity;
    for (let r = 0; r < this.d; r++) best = Math.min(best, this.t[r * this.w + ((h1 + r * h2) % this.w)]);
    return best;
  }
}

// ─── ex04 · HyperLogLog ───
// Hash cho HLL: x = g(item) = fmix32(fnv1a32(item)) (định nghĩa ở đầu file).
// idx = b bit cao của x · w = (32 − b) bit thấp · ρ = vị trí 1 trái nhất của w (tính từ 1; w = 0 thì ρ = 32 − b + 1).
// Thanh ghi M[idx] = max(M[idx], ρ). m = 2^b.
// Ước lượng: E = α_m · m² / Σ 2^(−M[j]) với α = 0,673 (m=16), 0,697 (m=32), 0,709 (m=64), 0,7213/(1 + 1,079/m) (m ≥ 128).
// Nếu E ≤ 2,5·m và số thanh ghi bằng 0 là V > 0: E = m · ln(m / V) (linear counting). Trả round(E).
// Độ phức tạp: add O(1) · estimate O(m) · bộ nhớ m byte — đếm 10⁹ phần tử khác nhau chỉ với vài KB, sai số chuẩn ≈ 1,04/√m.
// Bẫy: ρ tính sai (đếm cả b bit cao đã dùng làm idx); quên linear counting khi n nhỏ (sai số lớn); dùng `Math.clz32`.
// Java: `Integer.numberOfLeadingZeros`; Python: `x.bit_length()` — ρ = (32 − b) − w.bit_length() + 1.
const INV_POW2 = Array.from({ length: 34 }, (_, r) => 2 ** -r); // 2^(−ρ), ρ ≤ 33
export class HyperLogLog {
  private b: number;
  private m: number;
  private reg: Uint8Array;
  constructor(b: number) {
    this.b = b;
    this.m = 1 << b;
    this.reg = new Uint8Array(this.m);
  }
  add(item: string): void {
    const x = g(item);
    const idx = x >>> (32 - this.b);
    const w = (x << this.b) >>> this.b; // 32 − b bit thấp
    const rho = w === 0 ? 32 - this.b + 1 : Math.clz32(w) - this.b + 1;
    if (rho > this.reg[idx]) this.reg[idx] = rho;
  }
  estimate(): number {
    const m = this.m;
    let sum = 0;
    let zeros = 0;
    for (let j = 0; j < m; j++) {
      sum += INV_POW2[this.reg[j]];
      if (this.reg[j] === 0) zeros++;
    }
    const alpha = m === 16 ? 0.673 : m === 32 ? 0.697 : m === 64 ? 0.709 : 0.7213 / (1 + 1.079 / m);
    let e = (alpha * m * m) / sum;
    if (e <= 2.5 * m && zeros > 0) e = m * Math.log(m / zeros);
    return Math.floor(e + 0.5);
  }
}

// ─── ex05 · Chọn tham số Bloom filter ───
// Ý tưởng: tối thiểu hóa tỉ lệ sai dương cho p cho trước: m = ⌈ −n·ln p / (ln 2)² ⌉, k = round( (m/n) · ln 2 ), k ≥ 1.
// Độ phức tạp: O(1).
// Vì sao best practice: k tối ưu làm đúng một nửa số bit bật; đi chệch cả hai phía đều tệ hơn. Công thức cho thấy
// mỗi item tốn ≈ 1,44·log₂(1/p) bit — 9,6 bit/item cho p = 1%, 14,4 bit cho p = 0,1%.
// Bẫy: m có thể vượt 2³¹ (n = 10⁹, p = 10⁻⁹) → `long`; `round` kiểu "làm tròn chẵn" của Python (`round(2.5) = 2`) → dùng floor(x + 0,5);
// Java: ép `(long) Math.ceil(...)`.
export function bloomParams(n: number, p: number): number[] {
  const m = Math.ceil((-n * Math.log(p)) / (Math.LN2 * Math.LN2));
  const k = Math.max(1, Math.floor((m / n) * Math.LN2 + 0.5));
  return [m, k];
}
