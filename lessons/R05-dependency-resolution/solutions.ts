// R05 · Đáp án best practice. Chỉ mở sau khi check ✅.
// Quy ước cạnh: deps[i] = [a, b] nghĩa là "a phụ thuộc b" (b phải được khởi tạo trước a).
import { Heap } from '../I04-heap/solutions.ts';

/** Dựng đồ thị theo chỉ số: users[b] = các a phụ thuộc b; unmet[a] = số cạnh phụ thuộc chưa thỏa (đếm cả cạnh lặp). */
function build(modules: string[], deps: string[][]) {
  const idx = new Map<string, number>();
  modules.forEach((m, i) => idx.set(m, i));
  const n = modules.length;
  const users: number[][] = Array.from({ length: n }, () => []);
  const needs: number[][] = Array.from({ length: n }, () => []);
  const unmet = new Array<number>(n).fill(0);
  for (const [a, b] of deps) {
    const ia = idx.get(a)!;
    const ib = idx.get(b)!;
    users[ib].push(ia);
    needs[ia].push(ib);
    unmet[ia]++;
  }
  return { n, users, needs, unmet };
}

// ─── ex01 · Thứ tự khởi tạo module ───
// Ý tưởng: Kahn. Đếm số phụ thuộc chưa thỏa của mỗi module; module có 0 thì "sẵn sàng". Luôn lấy module sẵn sàng có
// CHỈ SỐ nhỏ nhất trong `modules` (min-heap theo chỉ số) → kết quả duy nhất, tái lập được giữa các lần chạy.
// Hoàn tất sớm hơn n module = có chu trình → [].
// Độ phức tạp: O((n + e) log n) · O(n + e).
// Vì sao best practice: không đệ quy (n = 10⁵ làm tràn stack TS nếu dùng DFS), phát hiện chu trình "miễn phí".
// Bẫy: cạnh lặp (đếm hai lần thì giảm hai lần); tie-break theo tên thay vì theo thứ tự khai báo.
// Python: `heapq` trên chỉ số; Java: `PriorityQueue<Integer>`.
export function resolve(modules: string[], deps: string[][]): string[] {
  const { n, users, unmet } = build(modules, deps);
  const h = new Heap<number>((a, b) => a < b);
  for (let i = 0; i < n; i++) if (unmet[i] === 0) h.push(i);
  const out: string[] = [];
  while (h.size) {
    const u = h.pop()!;
    out.push(modules[u]);
    for (const v of users[u]) if (--unmet[v] === 0) h.push(v);
  }
  return out.length === n ? out : [];
}

// ─── ex02 · Tìm một chu trình ───
// Ý tưởng: bóc dần (Kahn) các module không còn phụ thuộc nào chưa bóc. Những module còn lại đều còn ít nhất một phụ thuộc
// CŨNG CÒN LẠI → đi theo phụ thuộc đó mãi mãi sẽ phải lặp lại một đỉnh; đoạn từ lần xuất hiện đầu của đỉnh lặp là một chu trình.
// Độ phức tạp: O(n + e) · O(n), không đệ quy.
// Cách khác: DFS 3 màu (trắng/xám/đen) — cạnh tới đỉnh xám là cạnh ngược; cần DFS lặp bằng stack tường minh khi n = 10⁵.
// Bẫy: tự phụ thuộc (a → a) là chu trình độ dài 1; trả chu trình CÓ HƯỚNG đúng chiều "x_i phụ thuộc x_{i+1}".
export function findCycle(modules: string[], deps: string[][]): string[] {
  const { n, users, needs, unmet } = build(modules, deps);
  const removed = new Array<boolean>(n).fill(false);
  const stack: number[] = [];
  for (let i = 0; i < n; i++) if (unmet[i] === 0) stack.push(i);
  while (stack.length) {
    const u = stack.pop()!;
    removed[u] = true;
    for (const v of users[u]) if (--unmet[v] === 0) stack.push(v);
  }
  let start = -1;
  for (let i = 0; i < n; i++) if (!removed[i]) {
    start = i;
    break;
  }
  if (start < 0) return [];
  const seenAt = new Map<number, number>();
  const path: number[] = [];
  let cur = start;
  while (!seenAt.has(cur)) {
    seenAt.set(cur, path.length);
    path.push(cur);
    cur = needs[cur].find((x) => !removed[x])!; // luôn tồn tại
  }
  return path.slice(seenAt.get(cur)!).map((i) => modules[i]);
}

// ─── ex03 · Chia tầng khởi tạo (song song) ───
// Ý tưởng: Kahn theo từng lớp — lớp k gồm các module mà mọi phụ thuộc đã nằm ở lớp < k. Trong cùng một lớp có thể khởi tạo song song.
// Số lớp = độ dài đường phụ thuộc dài nhất (thời gian khởi động tối thiểu khi có vô hạn worker).
// Độ phức tạp: O(n + e + n log n) (sắp xếp tên trong lớp) · O(n + e).
// Bẫy: dùng DFS tính `level = 1 + max(level(dep))` mà không memo → hàm mũ; có chu trình → [] (không được trả lớp thiếu).
export function buildLevels(modules: string[], deps: string[][]): string[][] {
  const { n, users, unmet } = build(modules, deps);
  let layer: number[] = [];
  for (let i = 0; i < n; i++) if (unmet[i] === 0) layer.push(i);
  const out: string[][] = [];
  let placed = 0;
  while (layer.length) {
    placed += layer.length;
    out.push(layer.map((i) => modules[i]).sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)));
    const next: number[] = [];
    for (const u of layer) for (const v of users[u]) if (--unmet[v] === 0) next.push(v);
    layer = next;
  }
  return placed === n ? out : [];
}

// ─── ex04 · Khởi tạo provider kiểu NestJS DI, báo lỗi vòng kèm đường đi ───
// Ý tưởng: dùng ex01 để lấy thứ tự; nếu thất bại dùng ex02 để lấy chu trình rồi định dạng thông điệp
// "Circular dependency: A -> B -> C -> A" (mỗi mũi tên = "phụ thuộc vào"). Người dùng cần ĐƯỜNG ĐI, không chỉ "có vòng".
// Độ phức tạp: O((n + e) log n).
// Bẫy: chu trình phải khép kín (lặp lại đỉnh đầu ở cuối); đừng in cả đường đi dẫn tới chu trình mà không thuộc chu trình.
export function initProviders(providers: string[], deps: string[][]): string[] {
  const order = resolve(providers, deps);
  if (order.length === providers.length) return order;
  const cyc = findCycle(providers, deps);
  return ['Circular dependency: ' + [...cyc, cyc[0]].join(' -> ')];
}

// ─── ex05 · Semver rút gọn: phiên bản lớn nhất thỏa range ───
// Ý tưởng: parse thành bộ ba số; biến range thành khoảng [lo, hi) (hi có thể vô cực), rồi chọn phiên bản lớn nhất trong khoảng.
//   ^X.Y.Z : X > 0 → [X.Y.Z, (X+1).0.0) · X = 0, Y > 0 → [0.Y.Z, 0.(Y+1).0) · X = Y = 0 → [0.0.Z, 0.0.(Z+1))
//   ~X.Y.Z : [X.Y.Z, X.(Y+1).0) · >=X.Y.Z : [X.Y.Z, ∞) · X.Y.Z : đúng phiên bản đó
// Độ phức tạp: O(n) · O(1).
// Bẫy kinh điển: so sánh CHUỖI ("1.10.0" < "1.9.0" khi so chuỗi) → phải so từng thành phần là SỐ; caret với major 0.
// Python: `tuple(map(int, v.split('.')))` so sánh tuple; Java: `Integer.parseInt` + so từng phần.
type V = [number, number, number];
const parseV = (s: string): V => s.split('.').map(Number) as V;
const cmp = (a: V, b: V) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
export function maxSatisfying(versions: string[], range: string): string {
  let lo: V;
  let hi: V | null = null;
  if (range.startsWith('^')) {
    lo = parseV(range.slice(1));
    hi = lo[0] > 0 ? [lo[0] + 1, 0, 0] : lo[1] > 0 ? [0, lo[1] + 1, 0] : [0, 0, lo[2] + 1];
  } else if (range.startsWith('~')) {
    lo = parseV(range.slice(1));
    hi = [lo[0], lo[1] + 1, 0];
  } else if (range.startsWith('>=')) {
    lo = parseV(range.slice(2));
  } else {
    lo = parseV(range);
    hi = [lo[0], lo[1], lo[2] + 1];
  }
  let best: V | null = null;
  let bestStr = '';
  for (const s of versions) {
    const v = parseV(s);
    if (cmp(v, lo) < 0 || (hi && cmp(v, hi) >= 0)) continue;
    if (!best || cmp(v, best) > 0) {
      best = v;
      bestStr = s;
    }
  }
  return bestStr;
}
