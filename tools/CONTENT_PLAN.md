# Kế hoạch nội dung (spec soạn bài)

Nguồn sự thật cho **danh sách bài của từng module**. `/dsa-build <ID>` đọc file này + `tools/AUTHORING.md` để soạn module, kiểm chứng, rồi đánh dấu ✅ ở bảng trạng thái.
Chữ ký viết kiểu Java (xem AUTHORING.md). "LC n" = LeetCode bài n (để tham khảo đề gốc; đề trong lộ trình viết lại bằng tiếng Việt, chặt ràng buộc). 🔴 = bài thực tế (đề nghiệp vụ).
Danh sách là **định hướng**: khi soạn được phép đổi/bổ sung bài nếu có lý do (trùng bài module khác, không chấm tự động được) — ghi lại thay đổi vào cột Ghi chú.

## Trạng thái

| Module | Trạng thái | Số bài | Ghi chú |
|---|---|---|---|
| S00 | ✅ | 3 | |
| F01–F12 | ✅ | 10/module (F01: 6 + 10 snippet) | |
| I01 Tree traversal | ✅ | 10 | |
| I02 Tree recursion | ✅ | 10 | |
| I03 BST | ✅ | 10 | |
| I04 Heap | ✅ | 10 | `Heap<T>` tổng quát export trong solutions.ts |
| I05 Graph & BFS | ✅ | 10 | Danh sách bài đúng kế hoạch. ex06 (openLock) không đo Perf (không gian trạng thái cố định 10⁴) |
| I06 DFS & connectivity | ✅ | 10 | Đúng kế hoạch. Test cố ý có đường thẳng 10⁵ đỉnh / đảo "rắn" để loại DFS đệ quy; ex08 so `unordered` (không sắp trong từng cặp [r,c]) |
| I07 Topological sort | ✅ | 8 | Đúng kế hoạch (đỉnh/môn đánh số từ 0 ở ex05). ex07 dùng `String[][] deps` (đã thử Python/Java) |
| I08 Union-Find | ✅ | 8 | ex01: `find` có thể trả đại diện bất kỳ → `compare` kiểm tra nhất quán; ex02 đánh số từ 0 (n cạnh, n đỉnh); ex04 không đo Perf (26 chữ cái) |
| I09 Backtracking | ✅ | 10 | Đúng kế hoạch; ex09 Perf ở n = 13; ex10 không đo Perf; thứ tự phần tử trong từng đáp án được đề quy định (so `unordered` ở mức ngoài) |
| I10 Greedy & intervals | ✅ | 10 | `candy` đổi `int` → `long` (tổng 5·10⁹ ở n = 10⁵); ex04 không đo Perf; README có mục "khi nào greedy sai" (phản ví dụ) |
| I11 Monotonic stack/deque | ✅ | 8 | `largestRectangleArea` và `trap` đổi `int` → `long`; ex06 có test bẫy 2⁵³ (nhân modulo) |
| I12 Trie | ✅ | 8 | Đúng kế hoạch; ex03 Perf chỉ bắt bản rất chậm (ghi trong đề); ex08 dùng `char` (đã thử Python/Java) |
| I13 Bit manipulation | ✅ | 10 | Đúng kế hoạch; `isPowerOfTwo` nhận `long` tới 2⁵³ − 1 (bẫy `n & (n−1)` khi n ≥ 2³² trong TS); phần lớn bài không đo Perf |
| I14 Math | ✅ | 10 | `modPow`: `exp`, `base` ≤ 2⁵³ − 1 (không phải 10¹⁸, vì input JSON → `number`); `nextCollision`: a, b ≤ 10⁷, t ≤ 10¹⁵ |
| A01–A12 | ⬜ | 8–10 | |
| P01 Pattern recognition | ✅ | 20 đề | README + exercises.md (20 đề) + solutions.md (không có checks.ts) |
| P02 Interview framework | ✅ | 3 | `solutions.ts` kèm transcript 7 bước; ex03 có test cụm 10⁵ ô (đệ quy tràn stack) |
| P03 Scale effects trong JS | ✅ | 10 thí nghiệm | `benchOnly`; `experiments.ts` (22 hàm) + `verify.ts`; `solutions.md` ghi số đo thật + Python/Java |
| P04 Testing & stress test | ✅ | 8 | `bugs/bugNN.{ts,py,java}` là code lỗi (đã kiểm chứng `check` báo SAI); phần stress tự viết không chấm máy |
| P05 Timed Easy | ✅ | 6 | LC 169, 121, 392, 228, 496, 409 (viết lại bối cảnh) |
| P06 Timed Medium | ✅ | 5 | LC 621, 863, 909, 523, 334 |
| P07 Timed Hard | ✅ | 4 | LC 4, 10, 815, 2402 |
| R01 Cache | ✅ | 5 | LRU, TTL (heap + lazy deletion), hit ratio LRU vs FIFO, PriceCache có invalidate theo category, LRU bằng DLL (`keys()` để kiểm tra thứ tự) |
| R02 Rate limiting | ✅ | 5 | Fixed/Sliding log/Sliding counter/Token bucket (mili-token nguyên) + `compareLimiters` trả 8 số (allowed + burst thực) |
| R03 Feed, top-K, stream | ✅ | 5 | ex01 đổi từ hàm `feedPage` sang class `FeedMerger` (để đo được truy vấn lặp); `TopKCounter`, `Trending`, `mergeTimelines` |
| R04 Scheduler & delayed queue | ✅ | 5 | `DelayQueue`, `retrySchedule(attempts, base, cap, deadline)` (mốc cộng dồn), `TimerWheel`, `nextRun`, `simulateJobQueue` |
| R05 Dependency resolution | ✅ | 5 | `resolve` (tie-break theo thứ tự khai báo), `findCycle`, `buildLevels`, `initProviders` (kiểu NestJS), `maxSatisfying` |
| R06 Search & autocomplete | ✅ | 5 | ex01 là `Suggest(k)` có weight (tránh trùng `Autocomplete` của I12); `SearchIndex`, `fuzzyMatch`, `searchVietnamese`, `BKTree` |
| R07 Probabilistic DS | ✅ | 5 | hash đặc tả `g = fmix32(fnv1a32)`; `falsePositiveRate` gộp thành `measureBloom`; `bloomParams` trả `long[]` |
| R08 Consistent hashing & Merkle | ✅ | 5 | `diffBlocks` thay bằng class `MerkleSync` (update O(log n)) để perf phân biệt được |
| R09 Diff, dedup & stream | ✅ | 5 | ex01 là `myersDistance` (tránh trùng `diffLines` của A03); `Dedup`, `P95Window`, `sessionize`, `sampleLog` (LCG đặc tả) |
| R10 Geo & spatial | ✅ | 5 | `geohash`, `haversineKm`, `GridIndex`, `kNearest`, `DriverIndex` |
| D01 Phương pháp | ✅ | 2 + DESIGN.md | `MaxStack` (LC 716) + `FreqStack` (LC 895, 🔴); DESIGN mẫu đầy đủ 7 bước cho MaxStack |
| D02 LRU & LFU | ✅ | 2 + DESIGN.md | `LRUCache` (DLL), `LFUCache`; DESIGN mẫu cho LRU |
| D03 Hit counter & rate limiter | ✅ | 2 + DESIGN.md | `HitCounter`, `PerUserLimiter(int limit, long windowMs, int maxUsers)` (🔴); đáp án dùng DLL (xem ghi chú trong solutions: `Map.keys().next()` chậm hơn) |
| D04 Time-based KV | ✅ | 2 + DESIGN.md | `TimeMap`, `SnapshotArray` (🔴, “cấu hình có phiên bản”) |
| D05 RandomizedCollection & iterators | ✅ | 3 + DESIGN.md | thêm bài thứ 3: `RandomizedCollection` (compare mô phỏng + thống kê), `PeekingIterator`, `ZigzagIterator` (🔴); ex02/ex03 không có Perf (ghi “tự giác” trong exercises) |
| D06 Leaderboard | ✅ | 2 + DESIGN.md | `Leaderboard` (`long top(int K)`), `RankBoard`; cài `SortedKeys` (danh sách chia khối) trong solutions; thêm case lớn để chạm đường tách khối |
| D07 Router / file system | ✅ | 2 + DESIGN.md | `Router` (🔴, ex01), `FileSystem` (ex02, LC 588) |
| D08 Task scheduler & timer | ✅ | 2 + DESIGN.md | `TaskScheduler` (thêm `scheduleEvery` cho việc lặp lại, 🔴), `TaskManager` (LC 3408); dùng `Heap` I04 |
| D09 Ordered map | ✅ | 2 + DESIGN.md | `OrderedMap` bằng `IndexedSkipList` có span (export để CAP dùng) + `MyCalendar` (LC 729, 🔴); README có bảng bench skip list vs mảng sort |
| D10 Text buffer & undo/redo | ✅ | 2 + DESIGN.md | `TextEditor` (LC 2296), `UndoRedo(int maxHistory)` (🔴); lệnh `"+text"` / `"-k"` |
| CAP mini-Redis | ✅ | 2 + DESIGN.md | `MiniKV` (chuỗi + TTL + LRU) rồi `MiniRedis` (thêm list, sorted set, kiểu khóa); `setTime(now)` thay cho `now` từng lệnh; `del` đổi tên `delete` (từ khóa Python) |

---

## Tier I

### I05 · Graph & BFS
README: danh sách kề / ma trận kề / danh sách cạnh, lưới là đồ thị, BFS + vì sao cho đường ngắn nhất, đánh dấu khi enqueue, multi-source, BFS theo tầng, BFS không gian trạng thái, khôi phục đường bằng parent; bảng theo ngôn ngữ (`deque`, `ArrayDeque`, mảng + head).
1. `int shortestPath(int n, int[][] edges, int src, int dst)` — vô hướng, không tới được → −1.
2. `int numIslands(String[] grid)` — LC 200 (BFS), lưới `'1'/'0'`.
3. `int orangesRotting(int[][] grid)` — LC 994, multi-source theo phút.
4. `int shortestPathBinaryMatrix(int[][] grid)` — LC 1091, 8 hướng.
5. `int[][] updateMatrix(int[][] mat)` — LC 542, khoảng cách tới số 0 gần nhất.
6. `int openLock(String[] deadends, String target)` — LC 752, BFS trạng thái.
7. `int ladderLength(String beginWord, String endWord, String[] wordList)` — LC 127.
8. `int[] shortestPathNodes(int n, int[][] edges, int src, int dst)` — trả đường đi; compare kiểm tra hợp lệ + độ dài tối thiểu.
9. 🔴 `int[] nearestWarehouse(int n, int[][] roads, int[] warehouses)` — khoảng cách mỗi điểm tới kho gần nhất (−1 nếu không tới).
10. 🔴 `int shortestPathWithBreaks(int[][] grid, int k)` — LC 1293, robot kho được phá tối đa k vật cản.

### I06 · DFS & connectivity
README: DFS đệ quy/stack, thành phần liên thông, flood fill, chu trình vô hướng (cha) vs có hướng (3 màu), hai phía (tô màu), DFS từ biên (đảo bị bao), cảnh báo độ sâu đệ quy trên lưới 10⁶ ô.
1. `int countComponents(int n, int[][] edges)` — LC 323.
2. `int[][] floodFill(int[][] image, int sr, int sc, int color)` — LC 733.
3. `int maxAreaOfIsland(int[][] grid)` — LC 695.
4. `boolean hasCycleUndirected(int n, int[][] edges)`.
5. `boolean hasCycleDirected(int n, int[][] edges)` — 3 màu.
6. `boolean isBipartite(int[][] graph)` — LC 785 (input là danh sách kề).
7. `String[] captureRegions(String[] board)` — LC 130 ('X'/'O').
8. `List<List<Integer>> pacificAtlantic(int[][] heights)` — LC 417 (compare unordered).
9. 🔴 `int findCircleNum(int[][] isConnected)` — LC 547, nhóm khách hàng liên kết.
10. 🔴 `int makeConnected(int n, int[][] connections)` — LC 1319, số dây cáp cần kéo lại.

### I07 · Topological sort
README: DAG, Kahn (in-degree + queue), DFS post-order, phát hiện chu trình, topo theo thứ tự từ điển (min-heap), tính theo tầng (song song), đường dài nhất trên DAG.
1. `boolean canFinish(int numCourses, int[][] prerequisites)` — LC 207.
2. `int[] findOrder(int numCourses, int[][] prerequisites)` — LC 210, compare kiểm tra là thứ tự topo hợp lệ (rỗng nếu có chu trình).
3. `int[] lexSmallestTopo(int n, int[][] edges)` — thứ tự topo nhỏ nhất theo từ điển (đáp án duy nhất); có chu trình → `[]`.
4. `String alienOrder(String[] words)` — LC 269, compare kiểm tra hợp lệ; tiền tố sai thứ tự → `""`.
5. `int minimumSemesters(int n, int[][] relations)` — LC 1136.
6. `List<Integer> eventualSafeNodes(int[][] graph)` — LC 802.
7. 🔴 `String[] migrationOrder(String[] names, String[][] deps)` — thứ tự chạy migration; cùng lúc sẵn sàng thì theo tên tăng dần; có chu trình → `[]`.
8. 🔴 `long minBuildTime(int n, int[][] deps, int[] duration)` — LC 2050, build song song không giới hạn worker.

### I08 · Union-Find
README: find + path compression, union by size/rank, α(n), đếm thành phần động, DSU trên lưới (r·C + c), DSU vs BFS/DFS khi đồ thị tăng dần.
1. `class UnionFind { UnionFind(int n); int find(int x); boolean union(int a, int b); boolean connected(int a, int b); int count() }` — union trả false nếu đã cùng nhóm.
2. `int[] findRedundantConnection(int[][] edges)` — LC 684.
3. `int[] componentsAfterEach(int n, int[][] edges)` — số thành phần sau mỗi cạnh.
4. `boolean equationsPossible(String[] equations)` — LC 990.
5. `List<List<String>> accountsMerge(List<List<String>> accounts)` — LC 721 (tên + email sort; compare unordered).
6. `List<Integer> numIslands2(int m, int n, int[][] positions)` — LC 305.
7. 🔴 `int earliestAcq(int[][] logs, int n)` — LC 1101, thời điểm mọi người quen nhau.
8. 🔴 `String smallestStringWithSwaps(String s, int[][] pairs)` — LC 1202.

### I09 · Backtracking
README: khung choose → explore → unchoose, cây quyết định, bỏ trùng bằng sort + skip, cắt nhánh, độ phức tạp hàm mũ, đệ quy sâu ≤ n nhỏ nên an toàn.
1. `List<List<Integer>> subsets(int[] nums)` — LC 78 (unordered-deep).
2. `List<List<Integer>> subsetsWithDup(int[] nums)` — LC 90.
3. `List<List<Integer>> permute(int[] nums)` — LC 46.
4. `List<List<Integer>> permuteUnique(int[] nums)` — LC 47.
5. `List<List<Integer>> combinationSum(int[] candidates, int target)` — LC 39.
6. `List<List<Integer>> combinationSum2(int[] candidates, int target)` — LC 40.
7. `List<String> generateParenthesis(int n)` — LC 22.
8. `boolean exist(String[] board, String word)` — LC 79.
9. `int totalNQueens(int n)` — LC 52 (perf n = 12).
10. 🔴 `List<String> restoreIpAddresses(String s)` — LC 93, khôi phục IP từ log mất dấu chấm.

### I10 · Greedy & intervals
README: chứng minh bằng exchange argument, sort theo đầu/cuối khoảng, khi nào greedy sai (đổi tiền 1-3-4 lấy 6), greedy + heap.
1. `boolean canJump(int[] nums)` — LC 55.
2. `int jump(int[] nums)` — LC 45.
3. `int eraseOverlapIntervals(int[][] intervals)` — LC 435.
4. `int[][] insertInterval(int[][] intervals, int[] newInterval)` — LC 57.
5. `int findMinArrowShots(int[][] points)` — LC 452.
6. `int canCompleteCircuit(int[] gas, int[] cost)` — LC 134.
7. `List<Integer> partitionLabels(String s)` — LC 763.
8. `long candy(int[] ratings)` — LC 135 (đổi sang `long`: tổng tới 5·10⁹).
9. 🔴 `int maxEvents(int[][] events)` — LC 1353 (greedy + heap).
10. 🔴 `int scheduleCourse(int[][] courses)` — LC 630.

### I11 · Monotonic stack / deque
README: stack tăng/giảm dần, "phần tử lớn hơn kế tiếp", vì sao O(n), diện tích histogram, deque cho max cửa sổ trượt, đóng góp của mỗi phần tử (sum of mins).
1. `int[] nextGreaterElements(int[] nums)` — LC 503 (vòng).
2. `int[] dailyTemperatures(int[] temperatures)` — LC 739.
3. `long largestRectangleArea(int[] heights)` — LC 84 (đổi sang `long`: diện tích tới 10¹⁴).
4. `long trap(int[] height)` — LC 42 (đổi sang `long`: tổng tới 10¹⁰).
5. `int[] maxSlidingWindow(int[] nums, int k)` — LC 239.
6. `int sumSubarrayMins(int[] arr)` — LC 907 (mod 10⁹+7).
7. 🔴 `class StockSpanner { StockSpanner(); int next(int price) }` — LC 901.
8. 🔴 `String removeKdigits(String num, int k)` — LC 402.

### I12 · Trie
README: node Map vs mảng 26, insert/search/startsWith, DFS trên trie (wildcard), trie + backtracking trên lưới, trie nhị phân cho XOR, bộ nhớ.
1. `class Trie { Trie(); void insert(String word); boolean search(String word); boolean startsWith(String prefix) }` — LC 208.
2. `class WordDictionary { WordDictionary(); void addWord(String word); boolean search(String word) }` — LC 211 ('.' khớp mọi ký tự).
3. `List<String> findWords(String[] board, String[] words)` — LC 212 (unordered).
4. `String replaceWords(String[] dictionary, String sentence)` — LC 648.
5. `List<List<String>> suggestedProducts(String[] products, String searchWord)` — LC 1268.
6. `int findMaximumXOR(int[] nums)` — LC 421.
7. 🔴 `class Autocomplete { Autocomplete(String[] words, int[] counts); void add(String word); List<String> top3(String prefix) }` — top 3 theo lượt (giảm dần), hòa thì theo chữ cái.
8. 🔴 `class StreamChecker { StreamChecker(String[] words); boolean query(char letter) }` — LC 1032, lọc từ cấm trong luồng chat (`char` ↔ chuỗi 1 ký tự).

### I13 · Bit manipulation
README: biểu diễn nhị phân, bù hai, `& | ^ ~ << >> >>>`, JS int32 + `>>> 0`, Python int vô hạn (mask `& 0xFFFFFFFF`), Java `Integer.bitCount`, mẹo `x & (x − 1)`, `x & −x`, duyệt tập con bằng mask.
1. `int singleNumber(int[] nums)` — LC 136.
2. `int hammingWeight(long n)` — LC 191 (n trong [0, 2³²)).
3. `int[] countBits(int n)` — LC 338.
4. `boolean isPowerOfTwo(long n)` — LC 231.
5. `long reverseBits(long n)` — LC 190 (n trong [0, 2³²)).
6. `int missingNumber(int[] nums)` — LC 268.
7. `int singleNumberII(int[] nums)` — LC 137.
8. `int[] singleNumberIII(int[] nums)` — LC 260 (trả tăng dần).
9. `int rangeBitwiseAnd(int left, int right)` — LC 201.
10. 🔴 `int minFlagSets(int target, int[] sets)` — số gói feature flag ít nhất để OR ra đúng `target` (≤ 15 gói, ≤ 20 bit), không được → −1.

### I14 · Math cho lập trình
README: Euclid, sàng Eratosthenes, lũy thừa nhanh + modulo, nghịch đảo modulo (Fermat), nCk mod p, bẫy 2⁵³ khi nhân modulo trong JS (BigInt / nhân tách), Java `long` tràn khi nhân 2 số ~10⁹·10⁹ vẫn vừa nhưng 10¹⁰·10¹⁰ thì không.
1. `int gcdOfArray(int[] nums)`.
2. `int countPrimes(int n)` — LC 204 (n ≤ 5·10⁶).
3. `int modPow(long base, long exp, int mod)` — base, exp ≤ 2⁵³ − 1 (input JSON là `number`, không biểu diễn chính xác tới 10¹⁸); TS: BigInt hoặc mulmod an toàn.
4. `int nCrMod(int n, int r)` — mod 10⁹+7, n ≤ 10⁶.
5. `boolean isHappy(int n)` — LC 202.
6. `String toBase(long num, int base)` — 2 ≤ base ≤ 36, số âm.
7. `int trailingZeroes(int n)` — LC 172.
8. `String fractionToDecimal(int numerator, int denominator)` — LC 166.
9. 🔴 `boolean luhnValid(String number)` — kiểm tra số thẻ/mã đơn bằng Luhn.
10. 🔴 `long nextCollision(long a, long b, long t)` — hai cron chạy mỗi a và b phút từ 0, lần trùng đầu tiên ≥ t (a, b ≤ 10⁷, t ≤ 10¹⁵).

## Tier A

### A01 · DP I: nền tảng
README: state → transition → base → thứ tự tính; memo vs tabulation; tối ưu bộ nhớ; vẽ bảng DP.
1. `int tribonacci(int n)` — LC 1137.  2. `int minCostClimbingStairs(int[] cost)` — LC 746.  3. `int rob(int[] nums)` — LC 198.
4. `int robCircular(int[] nums)` — LC 213.  5. `int deleteAndEarn(int[] nums)` — LC 740.  6. `int countWaysK(int n, int k)` — bậc 1..k, mod 10⁹+7.
7. `int mincostTickets(int[] days, int[] costs)` — LC 983.  8. `int minCostPaint(int[][] costs)` — LC 256.
9. 🔴 `long mostPoints(int[][] questions)` — LC 2140.  10. 🔴 `int jobScheduling(int[] startTime, int[] endTime, int[] profit)` — LC 1235.

### A02 · DP II: 1D & sequence
1. `int coinChange(int[] coins, int amount)` — LC 322.  2. `int change(int amount, int[] coins)` — LC 518.  3. `int lengthOfLIS(int[] nums)` — LC 300 (perf cần O(n log n)).
4. `boolean wordBreak(String s, String[] wordDict)` — LC 139.  5. `int numDecodings(String s)` — LC 91.  6. `int maxSubArray(int[] nums)` — LC 53.
7. `int maxProduct(int[] nums)` — LC 152.  8. `int maxProfitCooldown(int[] prices)` — LC 309.  9. `int maxProfitFee(int[] prices, int fee)` — LC 714.
10. 🔴 `int maxEnvelopes(int[][] envelopes)` — LC 354, xếp thùng lồng nhau.

### A03 · DP III: 2D & string
1. `int uniquePaths(int m, int n)` — LC 62.  2. `int uniquePathsWithObstacles(int[][] grid)` — LC 63.  3. `int minPathSum(int[][] grid)` — LC 64.
4. `int longestCommonSubsequence(String a, String b)` — LC 1143.  5. `int minDistance(String a, String b)` — LC 72.  6. `int longestPalindromeSubseq(String s)` — LC 516.
7. `String longestPalindrome(String s)` — LC 5 (nhiều đáp án → compare kiểm tra độ dài + là palindrome con).  8. `boolean isInterleave(String s1, String s2, String s3)` — LC 97.
9. 🔴 `int maximalSquare(String[] matrix)` — LC 221, mảnh đất trống vuông lớn nhất.  10. 🔴 `List<String> diffLines(String[] a, String[] b)` — diff dòng dựa trên LCS, định dạng `" x"`, `"-x"`, `"+x"`; quy tắc tie ghi rõ trong đề (ưu tiên xóa trước thêm).

### A04 · DP IV: knapsack
1. `int knapsack01(int[] weights, int[] values, int capacity)`.  2. `int knapsackUnbounded(int[] weights, int[] values, int capacity)`.  3. `boolean canPartition(int[] nums)` — LC 416.
4. `int findTargetSumWays(int[] nums, int target)` — LC 494.  5. `int lastStoneWeightII(int[] stones)` — LC 1049.  6. `int findMaxForm(String[] strs, int m, int n)` — LC 474.
7. 🔴 `int combinationSum4(int[] nums, int target)` — LC 377 (đếm hoán vị vs tổ hợp, so với ex2 của A02).  8. 🔴 `int minCoinsBounded(int[] coins, int[] counts, int amount)` — số lượng tờ có hạn.

### A05 · DP V: interval, tree, bitmask, digit
1. `int maxCoins(int[] nums)` — LC 312.  2. `int mctFromLeafValues(int[] arr)` — LC 1130.  3. `int minScoreTriangulation(int[] values)` — LC 1039.
4. `int robTree(TreeNode root)` — LC 337.  5. `int minCameraCover(TreeNode root)` — LC 968.  6. `int tsp(int[][] dist)` — n ≤ 15, chu trình từ 0.
7. `int countDigitOne(int n)` — LC 233.  8. 🔴 `boolean canPartitionKSubsets(int[] nums, int k)` — LC 698, chia việc đều cho k người.

### A06 · Shortest paths
1. `int networkDelayTime(int[][] times, int n, int k)` — LC 743 (Dijkstra).  2. `int findCheapestPrice(int n, int[][] flights, int src, int dst, int k)` — LC 787.
3. `int minimumEffortPath(int[][] heights)` — LC 1631.  4. `int minCostGrid(int[][] grid)` — LC 1368 (0-1 BFS).  5. `boolean hasNegativeCycle(int n, int[][] edges)` — Bellman-Ford.
6. `int findTheCity(int n, int[][] edges, int distanceThreshold)` — LC 1334 (Floyd).  7. 🔴 `long[] shippingCost(int n, int[][] roads, int warehouse)` — n, m ≤ 2·10⁵, −1 nếu không tới.  8. 🔴 `int swimInWater(int[][] grid)` — LC 778.

### A07 · MST & graph nâng cao
1. `long mstWeight(int n, int[][] edges)` — Kruskal, không liên thông → −1.  2. `int minCostConnectPoints(int[][] points)` — LC 1584 (Prim O(n²)).
3. `List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections)` — LC 1192 (cầu).  4. `List<Integer> articulationPoints(int n, int[][] edges)` — tăng dần.
5. `int countSCC(int n, int[][] edges)`.  6. `List<String> findItinerary(List<List<String>> tickets)` — LC 332 (Euler, Hierholzer).
7. 🔴 `int minimumCost(int n, int[][] connections)` — LC 1135.  8. 🔴 `List<List<Integer>> circularServiceGroups(int n, int[][] deps)` — nhóm service phụ thuộc vòng (SCC kích thước ≥ 2), unordered-deep, mỗi nhóm tăng dần.

### A08 · Fenwick & Segment tree
1. `class NumArrayMutable { NumArrayMutable(int[] nums); void update(int index, int val); long sumRange(int left, int right) }` — LC 307 (Fenwick).
2. `List<Integer> countSmaller(int[] nums)` — LC 315.  3. `class RangeMin { RangeMin(int[] nums); void update(int i, int val); int query(int l, int r) }` — segment tree.
4. `int countRangeSum(int[] nums, int lower, int upper)` — LC 327.  5. `int reversePairs(int[] nums)` — LC 493.
6. `class RangeAddSum { RangeAddSum(int n); void add(int l, int r, long v); long sum(int l, int r) }` — lazy hoặc 2 Fenwick.
7. 🔴 `int[] rankAfterEachScore(int[] scores)` — thứ hạng (1 + số điểm trước đó lớn hơn hẳn) ngay khi nộp.  8. 🔴 `class MyCalendarThree { MyCalendarThree(); int book(int startTime, int endTime) }` — LC 732.

### A09 · String algorithms
1. `int strStr(String haystack, String needle)` — LC 28 (KMP; perf phân biệt O(n·m)).  2. `int[] prefixFunction(String s)`.  3. `int[] zFunction(String s)`.
4. `boolean repeatedSubstringPattern(String s)` — LC 459.  5. `String shortestPalindrome(String s)` — LC 214.  6. `String longestDupSubstring(String s)` — LC 1044 (nhiều đáp án → compare độ dài + xuất hiện ≥ 2 lần).
7. 🔴 `List<Integer> findAll(String text, String pattern)` — mọi vị trí (kể cả chồng lấn), |text| ≤ 10⁶.  8. 🔴 `int longestCommonSubstring(String a, String b)` — binary search + rolling hash.

### A10 · Binary search on answer
1. `int minEatingSpeed(int[] piles, int h)` — LC 875.  2. `int shipWithinDays(int[] weights, int days)` — LC 1011.  3. `int splitArray(int[] nums, int k)` — LC 410.
4. `int minDays(int[] bloomDay, int m, int k)` — LC 1482.  5. `int smallestDivisor(int[] nums, int threshold)` — LC 1283.  6. `int findKthNumber(int m, int n, int k)` — LC 668.
7. 🔴 `int maxDistance(int[] position, int m)` — LC 1552, đặt router xa nhau nhất.  8. 🔴 `double minmaxGasDist(int[] stations, int k)` — LC 774 (compare float 10⁻⁶).

### A11 · Sweep line
1. `int maxConcurrent(int[][] intervals)` — tọa độ tới 10⁹ (sort sự kiện, end trước start).  2. `List<List<Integer>> getSkyline(int[][] buildings)` — LC 218.
3. `int[][] employeeFreeTime(int[][][] schedule)` — LC 759 (input mảng 3 chiều `int[][][]`).  4. `class MyCalendar { MyCalendar(); boolean book(int start, int end) }` — LC 729.
5. `class MyCalendarTwo { MyCalendarTwo(); boolean book(int start, int end) }` — LC 731.  6. `int rectangleArea(int[][] rectangles)` — LC 850 (mod).
7. 🔴 `boolean canAccommodate(int[][] bookings, int rooms)` — khách sạn, ngày tới 10⁹.  8. 🔴 `int[] minAvailableDuration(int[][] slots1, int[][] slots2, int duration)` — LC 1229.

### A12 · Amortized & randomized
1. `int quickSelect(int[] nums, int k)` — phần tử nhỏ thứ k, O(n) kỳ vọng.  2. `void wiggleSortII(int[] nums)` — LC 324 (compare kiểm tra hợp lệ).
3. `class DynamicArray { DynamicArray(); void push(int x); int pop(); int get(int i); int capacity() }` — tự cài, capacity bắt đầu 1, gấp đôi khi đầy, giảm nửa khi size ≤ capacity/4.
4. `class RandomizedSet { RandomizedSet(); boolean insert(int val); boolean remove(int val); int getRandom() }` — LC 380 (compare: getRandom trả phần tử đang có).
5. `class Skiplist { Skiplist(); boolean search(int target); void add(int num); boolean erase(int num) }` — LC 1206.
6. `int[] reservoirSample(int[] stream, int k, int seed)` — compare: k phần tử khác vị trí lấy từ stream.
7. `int[] topKQuickselect(int[] nums, int k)` — k lớn nhất, thứ tự tùy ý.  8. 🔴 `String reorganizeString(String s)` — LC 767, playlist không 2 bài cùng nghệ sĩ liền nhau (compare kiểm tra hợp lệ; không được → `""`).

## Tier P (định dạng đặc biệt)

- **P01 Pattern recognition:** `exercises.md` có 20 đề ngắn (chỉ đề + ràng buộc, lấy từ các module F/I/A với đề viết lại); người học ghi pattern + Big-O vào `answers/p01.md`. `solutions.md` (không phải .ts) ghi đáp án + lý do + "từ khóa nhận biết". Không có checks.ts.
- **P02 Interview framework:** README là khung 7 bước + rubric; `exercises.md` 3 bài (LC 3, LC 56, LC 200 viết lại bối cảnh khác) có checks.ts như thường; `solutions.ts` kèm **bản "transcript" mẫu** (hỏi lại đề → ví dụ → brute → tối ưu → code → test → phân tích) dạng comment.
- **P03 Scale effects trong JS:** chỉ dùng spec `benchOnly`; `experiments.ts` chứa các cặp hàm cần so (number[] vs Int32Array, Map vs mảng, object trong vòng lặp nóng, holey vs packed, đệ quy vs vòng lặp, str += vs join, sort comparator vs typed sort, Set 10⁷ phần tử); `exercises.md` theo mẫu 4 phần (giả thuyết / cách đo / kết quả / giải thích); `solutions.md` ghi số đo tham chiếu trên máy soạn + giải thích. Python/Java: ghi chú tương đương (`array` module, `int[]` vs `ArrayList<Integer>` boxing).
- **P04 Testing & stress test:** 8 bài "code có bug" — `exercises.md` đưa code lỗi (TS, kèm bản Python/Java ngắn), người học viết bản sửa (chấm bằng checks.ts như thường) **và** viết stress test của riêng mình (`answers/stress_NN.*`, không chấm tự động). Bug gợi ý: off-by-one binary search, quên tie-break sort, `sort()` mặc định, visited sai chỗ BFS, tràn int, mutate input, greedy sai, `shift()` trong vòng lặp.
- **P05 Timed set Easy (6 bài, 15'/bài):** LC 169, 121, 392, 228, 496, 409.
- **P06 Timed set Medium (5 bài, 25'/bài):** LC 621, 863, 909, 523, 334.
- **P07 Timed set Hard (4 bài, 40'/bài):** LC 4, 10, 815, 2402.

## Tier R (mỗi module 5 bài, chủ yếu class; hash/RNG phải được **đặc tả trong đề** để kết quả tất định ở cả 3 ngôn ngữ — vd. FNV-1a 32-bit)

- **R01 Cache:** `LRUCache` (LC 146); `TTLCache(int capacity)` với `put(key, value, ttl, now)`, `get(key, now)` (hết hạn → −1, đầy → evict LRU); `double[] hitRatios(int capacity, int[] requests)` so LRU vs FIFO; 🔴 cache cho API giá sản phẩm có invalidate theo key; 🔴 `LRUCache` không dùng Map giữ thứ tự (bắt buộc DLL + map) — so bench.
- **R02 Rate limiting:** `FixedWindowLimiter(limit, windowSec)`, `SlidingLogLimiter`, `SlidingCounterLimiter` (công thức có floor ghi rõ), `TokenBucket(capacity, refillPerSec)` — tất cả `boolean allow(String user, long nowMs)`; 🔴 `int[] compareLimiters(...)` mô phỏng burst ở ranh giới cửa sổ.
- **R03 Feed, top-K, stream:** `int[][] feedPage(int[][] feeds, long cursor, int limit)`; `List<String> topKFrequentWords(String[] words, int k)` (LC 692); `class TopKCounter { add(String item); List<String> top(int k) }`; 🔴 `class Trending { post(String tag, long t); List<String> top(int k, long t) }` cửa sổ 1 giờ; 🔴 `long[] mergeTimelines(long[][] streams, int limit)`.
- **R04 Scheduler & delayed queue:** `class DelayQueue { schedule(int id, long runAt, int priority); List<Integer> poll(long now) }`; `long[] retrySchedule(int attempts, long baseMs, long capMs)`; `class TimerWheel { TimerWheel(int slots); add(int id, int delayTicks); List<Integer> tick() }`; `long nextRun(String cron, long minute)` (cron rút gọn 2 trường phút/giờ, hỗ trợ `*`, `*/n`, danh sách); 🔴 mô phỏng job queue nhiều worker có ưu tiên + retry.
- **R05 Dependency resolution:** `List<String> resolve(String[] modules, String[][] deps)`; `List<String> findCycle(String[] modules, String[][] deps)` (compare: là chu trình hợp lệ); `List<List<String>> buildLevels(...)`; 🔴 thứ tự khởi tạo provider kiểu NestJS DI (báo lỗi circular kèm đường đi); 🔴 `String maxSatisfying(String[] versions, String range)` semver rút gọn (`^`, `~`, `>=`).
- **R06 Search & autocomplete:** autocomplete top-k có cache tại node; `class SearchIndex { add(int docId, String text); List<Integer> query(String q) }` (AND, tăng dần); `List<String> fuzzyMatch(String[] dict, String q, int maxDist)`; 🔴 tìm tên không dấu tiếng Việt; 🔴 `class BKTree`.
- **R07 Probabilistic DS:** `BloomFilter(int m, int k)` với hash đặc tả; `double falsePositiveRate(int n, int m, int k)`; `CountMinSketch(int width, int depth)`; `HyperLogLog(int b)` (compare: sai số ≤ ngưỡng); 🔴 `int[] bloomParams(int n, double p)`.
- **R08 Consistent hashing & Merkle:** `ConsistentHashRing { addNode(String node, int vnodes); removeNode(String node); String getNode(String key) }`; `double movedFraction(...)` khi thêm node; `String rendezvousPick(String key, String[] nodes)`; `String merkleRoot(String[] blocks)`; 🔴 `List<Integer> diffBlocks(String[] a, String[] b)` dùng Merkle.
- **R09 Diff, dedup & stream:** diff dòng (Myers rút gọn hoặc LCS); `class Dedup { Dedup(int capacity); boolean seen(String id) }` (LRU-bounded); `class P95Window { add(long t, int latency); int p95(long t) }`; 🔴 `int[] sessionize(String[] users, long[] times, long gap)`; 🔴 reservoir trên log.
- **R10 Geo & spatial:** `String geohash(double lat, double lon, int precision)`; `double haversineKm(...)`; `class GridIndex { add(int id, double x, double y); move(...); List<Integer> withinRadius(double x, double y, double r) }`; `int[] kNearest(int[][] pts, int x, int y, int k)`; 🔴 `class DriverIndex` (cập nhật vị trí liên tục + truy vấn tài xế gần nhất).

## Tier D (mỗi module: `DESIGN.md` mẫu theo khung 7 bước của skill dsa-design + 2 bài class có checks)

> Đã soạn xong (nhánh `content/d`): xem bảng trạng thái và `tools/reports/d.md`. `DESIGN.md` nằm trong chính thư mục `lessons/<ID>-<slug>/` (khác `designs/` là nơi người học nộp thiết kế của họ).

- **D01 Phương pháp:** `MaxStack` (LC 716) + DESIGN.md mẫu đầy đủ làm ví dụ cho các module sau.
- **D02 LRU & LFU:** `LRUCache` bằng DLL tự cài; `LFUCache` (LC 460).
- **D03 Hit counter & rate limiter:** `HitCounter` (LC 362) bộ nhớ O(300); `PerUserLimiter` có giới hạn bộ nhớ (evict user lâu không dùng).
- **D04 Time-based KV:** `TimeMap` (LC 981); `SnapshotArray` (LC 1146).
- **D05 RandomizedCollection & iterators:** `RandomizedCollection` (LC 381, compare getRandom hợp lệ); `PeekingIterator(int[] nums)` + `ZigzagIterator(int[] a, int[] b)`.
- **D06 Leaderboard:** `Leaderboard` (LC 1244); `RankBoard { update(int player, int score); int rank(int player); List<Integer> top(int k) }`.
- **D07 Router / file system:** `Router { add(String pattern, String handler); String match(String path) }` (static > `:param` > `*`); `FileSystem` (LC 588).
- **D08 Task scheduler & timer:** `TaskScheduler { schedule(int id, long at); boolean cancel(int id); List<Integer> advance(long now) }`; `TaskManager` (LC 3408).
- **D09 Ordered map:** `OrderedMap { put; get; remove; Integer floorKey(int k); Integer ceilingKey(int k); int rangeCount(int lo, int hi) }` bằng skip list; so bench với mảng sort + binary search.
- **D10 Text buffer & undo/redo:** `TextEditor` (LC 2296); `UndoRedo { apply(String op); undo(); redo(); String state() }`.
- **CAP · mini-Redis:** `class MiniRedis` với `set/get/del/expire(now)`, list (`lpush/rpush/lpop/rpop/lrange`), sorted set (`zadd/zrem/zrange/zrank`, skip list + map), `maxKeys` + evict LRU; DESIGN.md + stress test + bench.
