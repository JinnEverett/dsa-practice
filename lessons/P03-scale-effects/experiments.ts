// P03 · Các cặp hàm cần so sánh. MỖI hàm nhận n và trả một checksum (để trình biên dịch không bỏ phần việc).
// Biến thể A (mặc định, "ngây thơ") là `ref` trong checks.ts; biến thể B bạn đo bằng:
//   node tools/bench.ts lessons/P03-scale-effects NN --file lessons/P03-scale-effects/experiments.ts --fn <tên hàm B>
// Hai biến thể của một thí nghiệm luôn trả CÙNG kết quả (kiểm tra bằng `node lessons/P03-scale-effects/verify.ts`).
// Không dùng enum/namespace/parameter property (type stripping).

/** Số giả ngẫu nhiên tất định (LCG 31 bit) để mọi thí nghiệm có dữ liệu giống nhau. */
function nextRand(x: number): number {
  return (Math.imul(x, 1103515245) + 12345) & 0x7fffffff;
}

// ─── 01 · number[] vs Int32Array ───
export function sumNumberArray(n: number): number {
  const a: number[] = [];
  for (let i = 0; i < n; i++) a.push(i & 1023);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i];
  return s;
}
export function sumInt32Array(n: number): number {
  const a = new Int32Array(n);
  for (let i = 0; i < n; i++) a[i] = i & 1023;
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i];
  return s;
}

// ─── 02 · Bảng đếm: Map vs mảng vs object ───
export function countWithMap(n: number): number {
  const m = new Map<number, number>();
  let x = 12345;
  for (let i = 0; i < n; i++) {
    x = nextRand(x);
    const k = x % 1000;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  let best = 0;
  for (const v of m.values()) if (v > best) best = v;
  return best;
}
export function countWithArray(n: number): number {
  const c = new Int32Array(1000);
  let x = 12345;
  for (let i = 0; i < n; i++) {
    x = nextRand(x);
    c[x % 1000]++;
  }
  let best = 0;
  for (let k = 0; k < 1000; k++) if (c[k] > best) best = c[k];
  return best;
}
export function countWithObject(n: number): number {
  const c: Record<number, number> = {};
  let x = 12345;
  for (let i = 0; i < n; i++) {
    x = nextRand(x);
    const k = x % 1000;
    c[k] = (c[k] ?? 0) + 1;
  }
  let best = 0;
  for (const k in c) if (c[k] > best) best = c[k];
  return best;
}

// ─── 03 · Mảng đối tượng (AoS) vs mảng riêng từng trường (SoA) ───
const STEPS = 5;
export function updateAoS(n: number): number {
  const ps: { x: number; y: number; vx: number; vy: number }[] = [];
  for (let i = 0; i < n; i++) ps.push({ x: i, y: -i, vx: (i & 7) - 3, vy: (i & 3) - 1 });
  for (let s = 0; s < STEPS; s++) for (let i = 0; i < n; i++) {
    const p = ps[i];
    p.x += p.vx;
    p.y += p.vy;
  }
  let sum = 0;
  for (let i = 0; i < n; i++) sum += ps[i].x + ps[i].y;
  return sum;
}
export function updateSoA(n: number): number {
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const vx = new Float64Array(n);
  const vy = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = i;
    y[i] = -i;
    vx[i] = (i & 7) - 3;
    vy[i] = (i & 3) - 1;
  }
  for (let s = 0; s < STEPS; s++) for (let i = 0; i < n; i++) {
    x[i] += vx[i];
    y[i] += vy[i];
  }
  let sum = 0;
  for (let i = 0; i < n; i++) sum += x[i] + y[i];
  return sum;
}

// ─── 04 · Tạo đối tượng trong vòng lặp nóng ───
export function sumManhattanAlloc(n: number): number {
  let s = 0;
  for (let i = 0; i < n; i++) {
    const a = { x: i, y: i * 2 };
    const b = { x: n - i, y: i & 255 };
    const d = { x: Math.abs(a.x - b.x), y: Math.abs(a.y - b.y) };
    s += d.x + d.y;
  }
  return s;
}
export function sumManhattanInline(n: number): number {
  let s = 0;
  for (let i = 0; i < n; i++) {
    const ax = i;
    const ay = i * 2;
    const bx = n - i;
    const by = i & 255;
    s += Math.abs(ax - bx) + Math.abs(ay - by);
  }
  return s;
}

// ─── 05 · Mảng "holey" (new Array(n)) vs "packed" (push) ───
export function fillHoley(n: number): number {
  const a = new Array<number>(n);
  for (let i = 0; i < n; i++) a[i] = i & 1023;
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i];
  return s;
}
export function fillPacked(n: number): number {
  const a: number[] = [];
  for (let i = 0; i < n; i++) a.push(i & 1023);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i];
  return s;
}

// ─── 06 · Đệ quy vs vòng lặp (độ sâu 5000, lặp n / 5000 lần) ───
const DEPTH = 5000;
function sumRec(k: number): number {
  return k === 0 ? 0 : k + sumRec(k - 1);
}
export function sumRecursive(n: number): number {
  let s = 0;
  for (let r = 0; r < Math.floor(n / DEPTH); r++) s += sumRec(DEPTH);
  return s;
}
export function sumLoop(n: number): number {
  let s = 0;
  for (let r = 0; r < Math.floor(n / DEPTH); r++) {
    let t = 0;
    for (let k = 1; k <= DEPTH; k++) t += k;
    s += t;
  }
  return s;
}

// ─── 07 · Nối chuỗi: += vs mảng + join ───
export function buildPlus(n: number): number {
  let s = '';
  for (let i = 0; i < n; i++) s += 'x' + (i & 7);
  return s.length;
}
export function buildJoin(n: number): number {
  const parts: string[] = [];
  for (let i = 0; i < n; i++) parts.push('x' + (i & 7));
  return parts.join('').length;
}

// ─── 08 · Sắp xếp: comparator vs typed array vs sort() mặc định ───
function randomNumbers(n: number): number[] {
  const a = new Array<number>(n);
  let x = 99;
  for (let i = 0; i < n; i++) a[i] = (x = nextRand(x)) % 1_000_000;
  return a;
}
export function sortComparator(n: number): number {
  const a = randomNumbers(n);
  a.sort((p, q) => p - q);
  return a[0] * 3 + a[n >> 1] * 5 + a[n - 1] * 7;
}
export function sortTyped(n: number): number {
  const a = Float64Array.from(randomNumbers(n));
  a.sort();
  return a[0] * 3 + a[n >> 1] * 5 + a[n - 1] * 7;
}
/** Bản SAI về kết quả: sort() mặc định so sánh theo chuỗi. Dùng để thấy cả chi phí lẫn đáp án khác đi. */
export function sortDefaultString(n: number): number {
  const a = randomNumbers(n);
  a.sort();
  return a[0] * 3 + a[n >> 1] * 5 + a[n - 1] * 7;
}

// ─── 09 · Set<number> vs bảng bit (miền giá trị biết trước) ───
export function setInsert(n: number): number {
  const s = new Set<number>();
  for (let i = 0; i < n; i++) s.add((i * 7) % n);
  return s.size;
}
export function bitsetInsert(n: number): number {
  const bits = new Uint32Array((n >> 5) + 1);
  let size = 0;
  for (let i = 0; i < n; i++) {
    const v = (i * 7) % n;
    const w = v >> 5;
    const m = 1 << (v & 31);
    if (!(bits[w] & m)) {
      bits[w] |= m;
      size++;
    }
  }
  return size;
}

// ─── 10 · Đếm giá trị khác nhau: sort vs Set (hằng số ẩn trong Big-O) ───
export function uniqueBySort(n: number): number {
  const a = Int32Array.from(randomNumbers(n));
  a.sort();
  let c = n > 0 ? 1 : 0;
  for (let i = 1; i < n; i++) if (a[i] !== a[i - 1]) c++;
  return c;
}
export function uniqueBySet(n: number): number {
  const s = new Set<number>();
  let x = 99;
  for (let i = 0; i < n; i++) s.add((x = nextRand(x)) % 1_000_000);
  return s.size;
}
