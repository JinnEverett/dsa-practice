// P06 · Đáp án best practice (Timed set Medium). Chỉ mở sau khi check ✅ hoặc hết giờ.
import { TreeNode } from '../../tools/lib.ts';

// ─── ex01 · Lập lịch job có thời gian nguội (≈ LeetCode 621) ───
// Ý tưởng: loại job xuất hiện nhiều nhất (tần suất f) quyết định khung: cần (f − 1) "khối" độ dài (cooldown + 1), cộng phần cuối gồm tất cả loại
// có tần suất đúng bằng f (m loại). Các loại khác lấp vào chỗ trống. Nếu job quá nhiều thì không có khoảng trống nào: đáp án là chính số job.
//   đáp án = max(|tasks|, (f − 1)·(n + 1) + m)
// Độ phức tạp: O(|tasks|) time · O(26) space. Cách khác: mô phỏng bằng max-heap (lấy loại còn nhiều nhất mỗi chu kỳ) — O(T log 26), dễ nghĩ hơn
// nhưng dài hơn; dùng khi đề thêm ràng buộc khiến công thức không còn đúng.
// Bẫy: quên `max` với |tasks|; đếm m (số loại cùng tần suất lớn nhất) thay vì 1; n = 0 → |tasks|.
export function leastInterval(tasks: string[], n: number): number {
  const cnt = new Map<string, number>();
  let f = 0;
  for (const t of tasks) {
    const c = (cnt.get(t) ?? 0) + 1;
    cnt.set(t, c);
    if (c > f) f = c;
  }
  let m = 0;
  for (const c of cnt.values()) if (c === f) m++;
  return Math.max(tasks.length, (f - 1) * (n + 1) + m);
}

// ─── ex02 · Nhân viên cách k bậc trong sơ đồ tổ chức (≈ LeetCode 863) ───
// Ý tưởng: cây chỉ có đường xuống; khoảng cách theo mọi hướng cần cả đường LÊN. Bước 1: duyệt cây (lặp, bằng stack) ghi `parent` cho mỗi nút.
// Bước 2: BFS từ nút đích trên đồ thị vô hướng (con trái, con phải, cha), dừng ở tầng k; các nút ở tầng k là đáp án.
// Độ phức tạp: O(n) time · O(n) space.
// Bẫy: dùng đệ quy trên cây lệch 10⁵ tầng (tràn stack); quên `visited` (BFS đi ngược về cha rồi lại xuống con); k = 0 → chính nút đích.
// Python/Java: `dict`/`HashMap<TreeNode, TreeNode>` làm bảng cha; BFS bằng `deque`/`ArrayDeque`.
export function distanceK(root: TreeNode | null, target: number, k: number): number[] {
  if (!root) return [];
  const parent = new Map<TreeNode, TreeNode>();
  let start: TreeNode | null = null;
  const stack: TreeNode[] = [root];
  while (stack.length) {
    const u = stack.pop()!;
    if (u.val === target) start = u;
    for (const c of [u.left, u.right]) if (c) {
      parent.set(c, u);
      stack.push(c);
    }
  }
  if (!start) return [];
  const seen = new Set<TreeNode>([start]);
  let layer: TreeNode[] = [start];
  for (let d = 0; d < k && layer.length; d++) {
    const next: TreeNode[] = [];
    for (const u of layer) for (const v of [u.left, u.right, parent.get(u)]) if (v && !seen.has(v)) {
      seen.add(v);
      next.push(v);
    }
    layer = next;
  }
  return layer.map((u) => u.val);
}

// ─── ex03 · Cờ rắn và thang (≈ LeetCode 909) ───
// Ý tưởng: mỗi ô là một trạng thái, mỗi lượt có tối đa 6 bước ⇒ BFS tìm số lượt ít nhất. Điểm khó là đổi số ô (1..N²) sang tọa độ theo lối "boustrophedon"
// (bắt đầu góc dưới trái, đổi hướng mỗi hàng): hàng từ dưới = ⌊(s−1)/N⌋, cột = (s−1) mod N, hàng lẻ thì đảo cột.
// Ô có `board ≠ −1` là thang/rắn: rơi vào là bị chuyển NGAY (không chuyển tiếp lần nữa trong cùng lượt).
// Độ phức tạp: O(N²) time · O(N²) space.
// Bẫy: chuyển tiếp liên tiếp khi vừa rơi vào ô đích của thang (chỉ một lần); kiểm tra đích N² khi vừa tới (kể cả nhờ thang); đổi tọa độ sai ở hàng lẻ.
export function snakesAndLadders(board: number[][]): number {
  const N = board.length;
  const total = N * N;
  const dest = (s: number): number => {
    const rowFromBottom = Math.floor((s - 1) / N);
    let col = (s - 1) % N;
    if (rowFromBottom % 2 === 1) col = N - 1 - col;
    const v = board[N - 1 - rowFromBottom][col];
    return v === -1 ? s : v;
  };
  const dist = new Int32Array(total + 1).fill(-1);
  dist[1] = 0;
  const queue = [1];
  for (let head = 0; head < queue.length; head++) {
    const s = queue[head];
    if (s === total) return dist[s];
    for (let d = 1; d <= 6 && s + d <= total; d++) {
      const t = dest(s + d);
      if (dist[t] < 0) {
        dist[t] = dist[s] + 1;
        queue.push(t);
      }
    }
  }
  return dist[total];
}

// ─── ex04 · Mảng con có tổng chia hết cho k (≈ LeetCode 523) ───
// Ý tưởng: tổng mảng con (i, j] = prefix[j] − prefix[i] chia hết cho k ⇔ prefix[j] ≡ prefix[i] (mod k). Duyệt một lượt, lưu chỉ số XUẤT HIỆN ĐẦU TIÊN của mỗi
// số dư; gặp lại số dư đã thấy cách ≥ 2 vị trí ⇒ tồn tại mảng con độ dài ≥ 2. Khởi tạo: số dư 0 ở vị trí −1 (tiền tố rỗng).
// Độ phức tạp: O(n) time · O(min(n, k)) space. Brute: O(n²).
// Bẫy: ghi đè chỉ số đầu (làm mất mảng con dài) — chỉ ghi khi số dư CHƯA có; cần độ dài ≥ 2 (không phải ≥ 1); Java: `sum` và `sum + x` tràn `int` khi k ~ 2³¹
// → dùng `long` (hoặc giữ số dư trong `long`); k = 1 → luôn true nếu n ≥ 2.
export function checkSubarraySum(nums: number[], k: number): boolean {
  const first = new Map<number, number>([[0, -1]]);
  let mod = 0;
  for (let i = 0; i < nums.length; i++) {
    mod = (mod + nums[i]) % k;
    const j = first.get(mod);
    if (j === undefined) first.set(mod, i);
    else if (i - j >= 2) return true;
  }
  return false;
}

// ─── ex05 · Có ba phần tử tăng dần (≈ LeetCode 334) ───
// Ý tưởng: giữ hai "đuôi" nhỏ nhất: `a` = số nhỏ nhất đã thấy, `b` = số nhỏ nhất có thể làm phần tử giữa của một dãy tăng độ dài 2. Gặp x ≤ a → a = x;
// x ≤ b → b = x; ngược lại x > b ≥ ... > a nên đã có dãy tăng 3 phần tử ⇒ true. (Đây là LIS giới hạn độ dài 3, O(1) bộ nhớ.)
// Độ phức tạp: O(n) time · O(1) space. Brute: O(n³) hoặc O(n²) bằng LIS DP.
// Bẫy: dùng `<` thay vì `≤` (cho phép phần tử bằng nhau); lỡ cập nhật b khi chưa có a nhỏ hơn; `a` và `b` không nhất thiết là chỉ số đúng thứ tự trong mảng —
// chỉ cần bất biến "tồn tại dãy tăng độ dài 2 kết thúc bằng b".
export function increasingTriplet(nums: number[]): boolean {
  let a = Infinity;
  let b = Infinity;
  for (const x of nums) {
    if (x <= a) a = x;
    else if (x <= b) b = x;
    else return true;
  }
  return false;
}
