// P02 · Đáp án best practice + transcript phỏng vấn mẫu. Chỉ mở sau khi check ✅ (và sau khi bạn tự "nói" bài một lần).
//
// Khung 7 bước: (1) Hỏi lại đề → (2) Ví dụ → (3) Brute force → (4) Tối ưu có lý do → (5) Code → (6) Test bằng tay → (7) Phân tích độ phức tạp.
// Mỗi transcript dưới đây là LỜI BẠN NÓI (think aloud) tại từng bước, viết ngắn; code đi kèm là phần (5).

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ex01 · Đoạn request liên tiếp dài nhất không trùng id  (≈ LeetCode 3)
// ═══════════════════════════════════════════════════════════════════════════════════════════
// (1) Hỏi lại đề — "Đoạn" nghĩa là các phần tử LIÊN TIẾP, đúng không? Trùng nghĩa là cùng chuỗi id, phân biệt hoa thường?
//     Mảng rỗng thì trả 0? Kích thước tối đa? (n ≤ 10⁵ — nên O(n²) khó qua; id dài ≤ 20 ký tự.) Trả về độ dài, không phải đoạn.
// (2) Ví dụ — [a,b,a,c] → đoạn [b,a,c] dài 3. [x,x,x] → 1. [] → 0. [a,b,c,a] → 3 (bỏ a đầu thì a cuối nhập được, nhưng độ dài vẫn 3).
// (3) Brute — Với mỗi điểm bắt đầu i, mở rộng j đến khi gặp id đã có trong tập; lấy max. O(n²) time, O(n) space. Với n = 10⁵ là 10¹⁰ — quá chậm.
// (4) Tối ưu — Mỗi lần mở rộng ta đang làm lại việc cho i kế tiếp. Dùng cửa sổ [l, r]: khi gặp id đã nằm trong cửa sổ, đẩy `l` vượt qua
//     lần xuất hiện trước của nó (lưu `last[id]`). Mỗi phần tử vào/ra cửa sổ tối đa một lần ⇒ O(n). Bất biến: cửa sổ [l, r] không có id trùng.
// (6) Test tay — [a,b,a,c]: r=0 a(l=0,len1) · r=1 b(len2) · r=2 a, last[a]=0 ≥ l ⇒ l=1 (len2) · r=3 c(len3) ⇒ 3 ✓. [] ⇒ 0 ✓. [x,x] ⇒ l=1 ⇒ 1 ✓.
//     Điểm hay sai: `last[id] ≥ l` (nếu quên điều kiện này, l bị kéo lùi khi id cũ đã nằm ngoài cửa sổ).
// (7) Phân tích — O(n) time, O(min(n, số id khác nhau)) space. Hỏi thêm: nếu dòng chảy vô hạn? ⇒ giữ nguyên, chỉ cần bộ nhớ O(số id trong cửa sổ).
// Python: dict {id: chỉ số}; Java: HashMap<String, Integer>, so chuỗi bằng equals (map xử lý sẵn).
export function longestDistinctRun(requestIds: string[]): number {
  const last = new Map<string, number>();
  let best = 0;
  let l = 0;
  for (let r = 0; r < requestIds.length; r++) {
    const prev = last.get(requestIds[r]);
    if (prev !== undefined && prev >= l) l = prev + 1;
    last.set(requestIds[r], r);
    if (r - l + 1 > best) best = r - l + 1;
  }
  return best;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ex02 · Gộp khung giờ bảo trì  (≈ LeetCode 56)
// ═══════════════════════════════════════════════════════════════════════════════════════════
// (1) Hỏi lại đề — Hai khung [1,4] và [4,5] chạm nhau tại 4: gộp hay không? (Đề: gộp, vì khung đóng.) Đầu vào có sắp xếp không? (Không.)
//     Có khung độ dài 0 (start = end)? (Có thể.) Kết quả sắp theo start? (Có.) Có được sửa mảng đầu vào? (Nên tránh.)
// (2) Ví dụ — [[1,3],[2,6],[8,10]] → [[1,6],[8,10]] · [[1,4],[4,5]] → [[1,5]] · [[1,4],[2,3]] → [[1,4]] (khung nằm trọn trong khung khác).
// (3) Brute — Lặp: tìm một cặp khung chồng nhau, gộp thành một, cho tới khi không còn cặp nào. O(n³) trong xấu nhất.
// (4) Tối ưu — Nếu SẮP THEO START, các khung chồng nhau nằm kề nhau. Quét một lượt, giữ khung hiện hành [s, e]: khung kế tiếp có start ≤ e thì
//     e = max(e, end kế), ngược lại đẩy [s, e] ra kết quả và bắt đầu khung mới. Bất biến: các khung đã đẩy ra không chồng nhau và đều nằm bên trái start hiện tại.
//     Bẫy: dùng `end` của khung kế mà quên `max` (khung lồng nhau); sort mặc định của JS so CHUỖI.
// (6) Test tay — [[1,4],[2,3]]: cur=[1,4]; (2,3): 2 ≤ 4 ⇒ e=max(4,3)=4 ⇒ [[1,4]] ✓. [[1,3],[4,5]]: 4 > 3 ⇒ đẩy [1,3] ⇒ [[1,3],[4,5]] ✓. [] ⇒ [] ✓.
// (7) Phân tích — O(n log n) vì sort (quét là O(n)), O(n) space cho kết quả/bản sao. Không thể tốt hơn O(n log n) trong mô hình so sánh; nếu tọa độ nhỏ có thể dùng
//     mảng chênh lệch O(n + range).
// Python: `sorted(windows)`; Java: `Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]))` — đừng dùng `a[0] - b[0]` (tràn int khi giá trị lớn).
export function mergeMaintenanceWindows(windows: number[][]): number[][] {
  const sorted = windows.map((w) => [w[0], w[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out: number[][] = [];
  for (const [s, e] of sorted) {
    const last = out[out.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else out.push([s, e]);
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ex03 · Đếm cụm máy chủ liền kề trong rack  (≈ LeetCode 200)
// ═══════════════════════════════════════════════════════════════════════════════════════════
// (1) Hỏi lại đề — "Liền kề" là 4 hướng (trên/dưới/trái/phải), không tính chéo? Ký tự chỉ có '#' (có máy) và '.' (trống)? Lưới có thể rỗng / hàng rỗng?
//     Kích thước tối đa? (≤ 10⁵ ô, có thể là MỘT cụm khổng lồ.) Có được sửa lưới đầu vào? (Không có nghĩa vụ, dùng mảng visited riêng cho an toàn.)
// (2) Ví dụ — ["##..", "#...", "..#."] → 2 cụm. ["###","###"] → 1. [".."] → 0. [] → 0.
// (3) Brute — Với mỗi ô '#', so với mọi ô '#' khác để nối các cụm bằng union-find kiểu O(n²)… hoặc flood fill đệ quy. Đệ quy dễ viết nhưng với một cụm 10⁵ ô
//     ngăn xếp gọi sâu 10⁵ tầng ⇒ tràn stack (TS ≈ 10⁴ tầng, Python 1000). Nên nói rõ rủi ro này TRƯỚC khi code.
// (4) Tối ưu — Mỗi ô được thăm đúng một lần ⇒ O(R·C). Dùng BFS với queue (mảng + chỉ số đầu; KHÔNG dùng shift) hoặc DFS với stack tường minh. Mỗi khi gặp '#' chưa thăm:
//     đếm +1 rồi "chìm" cả cụm. Đánh dấu ĐÃ THĂM lúc đẩy vào queue (không phải lúc lấy ra) để mỗi ô vào queue một lần.
// (6) Test tay — ["##","#."] ⇒ ô (0,0) mở cụm, nhuộm (0,1),(1,0) ⇒ 1. ["#.#"] ⇒ 2. ["#"] ⇒ 1. [""] ⇒ 0.
// (7) Phân tích — O(R·C) time, O(R·C) space (visited + queue). Có thể tiết kiệm bằng cách sửa lưới tại chỗ (O(1) phụ) nếu được phép — nhưng nêu rõ đánh đổi.
// Python/Java: dùng `collections.deque` / `ArrayDeque`; hướng đi bằng mảng `(dr, dc)`.
export function countClusters(grid: string[]): number {
  const R = grid.length;
  if (R === 0) return 0;
  const C = grid[0].length;
  const seen = new Uint8Array(R * C);
  const queue = new Int32Array(R * C);
  let count = 0;
  for (let i = 0; i < R * C; i++) {
    const r0 = (i / C) | 0;
    const c0 = i % C;
    if (grid[r0][c0] !== '#' || seen[i]) continue;
    count++;
    let head = 0;
    let tail = 0;
    queue[tail++] = i;
    seen[i] = 1;
    while (head < tail) {
      const cur = queue[head++];
      const r = (cur / C) | 0;
      const c = cur % C;
      if (r > 0 && grid[r - 1][c] === '#' && !seen[cur - C]) (seen[cur - C] = 1), (queue[tail++] = cur - C);
      if (r + 1 < R && grid[r + 1][c] === '#' && !seen[cur + C]) (seen[cur + C] = 1), (queue[tail++] = cur + C);
      if (c > 0 && grid[r][c - 1] === '#' && !seen[cur - 1]) (seen[cur - 1] = 1), (queue[tail++] = cur - 1);
      if (c + 1 < C && grid[r][c + 1] === '#' && !seen[cur + 1]) (seen[cur + 1] = 1), (queue[tail++] = cur + 1);
    }
  }
  return count;
}
